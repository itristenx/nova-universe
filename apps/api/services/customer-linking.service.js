import { PrismaClient } from '@prisma/client';
import logger from '../logger.js';

export class CustomerLinkingService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Find or create customer record, linking to Nova users when possible
   */
  async findOrCreateCustomer(emailAddress, customerInfo = {}) {
    try {
      const email = emailAddress.toLowerCase().trim();

      // First, check if there's an existing customer record
      let customer = await this.prisma.customer.findFirst({
        where: {
          OR: [{ email: email }, { alternateEmails: { has: email } }],
        },
        include: {
          linkedNovaUser: true,
          organization: true,
        },
      });

      if (customer) {
        // Update last seen
        await this.prisma.customer.update({
          where: { id: customer.id },
          data: { lastSeenAt: new Date() },
        });

        return customer;
      }

      // Check if this email belongs to a Nova user
      const novaUser = await this.prisma.user.findFirst({
        where: {
          OR: [{ email: email }, { alternateEmails: { has: email } }],
        },
        include: {
          organization: true,
          roles: true,
        },
      });

      // Determine organization
      let organizationId = customerInfo.organizationId;
      if (!organizationId && novaUser) {
        organizationId = novaUser.organizationId;
      }

      // Create new customer record
      const customerData = {
        email: email,
        name: customerInfo.name || novaUser?.name || this.extractNameFromEmail(email),
        phone: customerInfo.phone || novaUser?.phone,
        organizationId: organizationId,
        linkedNovaUserId: novaUser?.id,
        isNovaUser: !!novaUser,
        customerType: novaUser ? 'INTERNAL' : 'EXTERNAL',
        status: 'ACTIVE',
        metadata: {
          ...customerInfo.metadata,
          source: 'email_communication',
          linkedAt: novaUser ? new Date() : null,
          novaUserRoles: novaUser?.roles?.map((r) => r.name) || [],
        },
        tags: customerInfo.tags || [],
        createdAt: new Date(),
        lastSeenAt: new Date(),
      };

      customer = await this.prisma.customer.create({
        data: customerData,
        include: {
          linkedNovaUser: true,
          organization: true,
        },
      });

      // If linked to Nova user, create reverse link
      if (novaUser) {
        await this.prisma.user.update({
          where: { id: novaUser.id },
          data: {
            linkedCustomerId: customer.id,
            metadata: {
              ...novaUser.metadata,
              customerLinkedAt: new Date(),
            },
          },
        });
      }

      logger.info(`Created new customer record for ${email}, linked to Nova user: ${!!novaUser}`);
      return customer;
    } catch (error) {
      logger.error('Error finding/creating customer:', error);
      throw error;
    }
  }

  /**
   * Link existing customer to Nova user
   */
  async linkCustomerToNovaUser(customerId, novaUserId) {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
      });

      const novaUser = await this.prisma.user.findUnique({
        where: { id: novaUserId },
        include: { roles: true },
      });

      if (!customer || !novaUser) {
        throw new Error('Customer or Nova user not found');
      }

      // Update customer record
      await this.prisma.customer.update({
        where: { id: customerId },
        data: {
          linkedNovaUserId: novaUserId,
          isNovaUser: true,
          customerType: 'INTERNAL',
          organizationId: novaUser.organizationId,
          metadata: {
            ...customer.metadata,
            linkedAt: new Date(),
            linkedBy: 'system',
            novaUserRoles: novaUser.roles.map((r) => r.name),
          },
        },
      });

      // Update Nova user record
      await this.prisma.user.update({
        where: { id: novaUserId },
        data: {
          linkedCustomerId: customerId,
          metadata: {
            ...novaUser.metadata,
            customerLinkedAt: new Date(),
          },
        },
      });

      logger.info(`Linked customer ${customerId} to Nova user ${novaUserId}`);
      return true;
    } catch (error) {
      logger.error('Error linking customer to Nova user:', error);
      throw error;
    }
  }

  /**
   * Get customer with RBAC-filtered activity based on user permissions
   */
  async getCustomerActivityWithRBAC(customerId, requestingUserId, options = {}) {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          linkedNovaUser: true,
          organization: true,
        },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Get requesting user's permissions
      const requestingUser = await this.prisma.user.findUnique({
        where: { id: requestingUserId },
        include: {
          roles: {
            include: {
              permissions: true,
            },
          },
          queueMemberships: {
            include: {
              queue: true,
            },
          },
        },
      });

      if (!requestingUser) {
        throw new Error('Requesting user not found');
      }

      // Check if requesting user can view this customer
      const canViewCustomer = await this.canUserViewCustomer(requestingUser, customer);
      if (!canViewCustomer) {
        throw new Error('Insufficient permissions to view customer');
      }

      // Get accessible queues for the requesting user
      const accessibleQueues = await this.getAccessibleQueues(requestingUser);

      // Build activity query with RBAC filtering
      const activityWhere = {
        customerId: customerId,
      };

      // Apply queue-based filtering
      if (accessibleQueues.length > 0) {
        activityWhere.OR = [
          {
            ticket: {
              queueId: {
                in: accessibleQueues.map((q) => q.id),
              },
            },
          },
          {
            // Allow viewing own activities regardless of queue
            userId: requestingUserId,
          },
          {
            // Allow viewing activities where user is mentioned
            metadata: {
              path: ['mentionedUsers'],
              array_contains: requestingUserId,
            },
          },
        ];

        // Exclude restricted queues (HR, Cyber, etc.)
        const restrictedQueues = await this.getRestrictedQueues();
        const userRestrictedAccess = await this.getUserRestrictedQueueAccess(requestingUserId);

        const inaccessibleQueues = restrictedQueues.filter(
          (q) => !userRestrictedAccess.includes(q.id),
        );

        if (inaccessibleQueues.length > 0) {
          activityWhere.AND = [
            {
              ticket: {
                queueId: {
                  notIn: inaccessibleQueues.map((q) => q.id),
                },
              },
            },
          ];
        }
      }

      // Apply date filters
      if (options.startDate) {
        activityWhere.occurredAt = { ...activityWhere.occurredAt, gte: options.startDate };
      }
      if (options.endDate) {
        activityWhere.occurredAt = { ...activityWhere.occurredAt, lte: options.endDate };
      }

      // Apply activity type filters
      if (options.activityTypes && options.activityTypes.length > 0) {
        activityWhere.activityType = { in: options.activityTypes };
      }

      // Filter internal activities based on permissions
      if (
        !options.includeInternal ||
        !this.hasPermission(requestingUser, 'VIEW_INTERNAL_ACTIVITIES')
      ) {
        activityWhere.isInternal = false;
      }

      // Get filtered activity timeline
      const activities = await this.prisma.customerActivityTimeline.findMany({
        where: activityWhere,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          ticket: {
            select: {
              id: true,
              number: true,
              title: true,
              status: true,
              priority: true,
              queue: {
                select: {
                  id: true,
                  name: true,
                  isRestricted: true,
                },
              },
            },
          },
          emailCommunication: {
            select: {
              id: true,
              messageId: true,
              direction: true,
              subject: true,
              fromEmail: true,
              toEmails: true,
              sentAt: true,
              hasAttachments: true,
            },
          },
        },
        orderBy: {
          occurredAt: 'desc',
        },
        skip: options.offset || 0,
        take: Math.min(options.limit || 50, 200),
      });

      // Apply additional security filtering
      const filteredActivities = activities.filter((activity) => {
        // Hide activities from restricted queues
        if (activity.ticket?.queue?.isRestricted) {
          return this.hasRestrictedQueueAccess(requestingUser, activity.ticket.queue.id);
        }

        // Hide sensitive email content based on permissions
        if (
          activity.emailCommunication &&
          !this.hasPermission(requestingUser, 'VIEW_EMAIL_CONTENT')
        ) {
          activity.emailCommunication = {
            ...activity.emailCommunication,
            subject: '[REDACTED]',
            bodyText: null,
            bodyHtml: null,
          };
        }

        return true;
      });

      return {
        customer: {
          ...customer,
          // Redact sensitive customer info if no permission
          email: this.hasPermission(requestingUser, 'VIEW_CUSTOMER_PII')
            ? customer.email
            : '[REDACTED]',
          phone: this.hasPermission(requestingUser, 'VIEW_CUSTOMER_PII')
            ? customer.phone
            : '[REDACTED]',
        },
        activities: filteredActivities,
        permissions: {
          canViewPII: this.hasPermission(requestingUser, 'VIEW_CUSTOMER_PII'),
          canViewInternal: this.hasPermission(requestingUser, 'VIEW_INTERNAL_ACTIVITIES'),
          canViewEmailContent: this.hasPermission(requestingUser, 'VIEW_EMAIL_CONTENT'),
          accessibleQueues: accessibleQueues.map((q) => ({ id: q.id, name: q.name })),
        },
      };
    } catch (error) {
      logger.error('Error getting customer activity with RBAC:', error);
      throw error;
    }
  }

  /**
   * Get end user's own activity across all accessible queues
   */
  async getEndUserOwnActivity(userId, options = {}) {
    try {
      // Find customer record for this user
      const customer = await this.prisma.customer.findFirst({
        where: {
          OR: [
            { linkedNovaUserId: userId },
            {
              email: {
                in: await this.getUserEmails(userId),
              },
            },
          ],
        },
      });

      if (!customer) {
        return {
          activities: [],
          message: 'No customer record found',
        };
      }

      // Get all tickets and activities for this customer across all queues
      // Exclude only specifically hidden queues (HR, Cyber with hideFromEndUser flag)
      const hiddenQueues = await this.prisma.queue.findMany({
        where: {
          hideFromEndUser: true,
        },
        select: { id: true },
      });

      const activityWhere = {
        customerId: customer.id,
        // Exclude activities from hidden queues
        ticket: {
          queueId: {
            notIn: hiddenQueues.map((q) => q.id),
          },
        },
      };

      // Apply filters
      if (options.startDate) {
        activityWhere.occurredAt = { ...activityWhere.occurredAt, gte: options.startDate };
      }
      if (options.endDate) {
        activityWhere.occurredAt = { ...activityWhere.occurredAt, lte: options.endDate };
      }
      if (options.activityTypes) {
        activityWhere.activityType = { in: options.activityTypes };
      }

      // Only show non-internal activities to end users
      activityWhere.isInternal = false;

      const activities = await this.prisma.customerActivityTimeline.findMany({
        where: activityWhere,
        include: {
          ticket: {
            select: {
              id: true,
              number: true,
              title: true,
              status: true,
              priority: true,
              queue: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          emailCommunication: {
            select: {
              id: true,
              direction: true,
              subject: true,
              fromEmail: true,
              toEmails: true,
              sentAt: true,
              hasAttachments: true,
              // End users can see their own email content
              bodyText: true,
              bodyHtml: true,
            },
          },
        },
        orderBy: {
          occurredAt: 'desc',
        },
        skip: options.offset || 0,
        take: Math.min(options.limit || 100, 500),
      });

      return {
        customer,
        activities,
        totalAccessibleQueues: await this.prisma.queue.count({
          where: {
            hideFromEndUser: false,
            isActive: true,
          },
        }),
        hiddenQueuesCount: hiddenQueues.length,
      };
    } catch (error) {
      logger.error('Error getting end user own activity:', error);
      throw error;
    }
  }

  /**
   * Helper methods
   */

  extractNameFromEmail(email) {
    const localPart = email.split('@')[0];
    return localPart
      .replace(/[._-]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async canUserViewCustomer(user, customer) {
    // System admins can view all customers
    if (this.hasPermission(user, 'SYSTEM_ADMIN')) {
      return true;
    }

    // Users can view customers from their organization
    if (user.organizationId === customer.organizationId) {
      return true;
    }

    // Users can view customers they are assigned to
    const assignedTickets = await this.prisma.supportTicket.count({
      where: {
        customerId: customer.id,
        assigneeId: user.id,
      },
    });

    return assignedTickets > 0;
  }

  async getAccessibleQueues(user) {
    // System admins can access all queues
    if (this.hasPermission(user, 'SYSTEM_ADMIN')) {
      return await this.prisma.queue.findMany({
        where: { isActive: true },
      });
    }

    // Get queues based on memberships and permissions
    const userQueues = await this.prisma.queueMember.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      include: {
        queue: true,
      },
    });

    return userQueues.map((qm) => qm.queue);
  }

  async getRestrictedQueues() {
    return await this.prisma.queue.findMany({
      where: {
        isRestricted: true,
        isActive: true,
      },
    });
  }

  async getUserRestrictedQueueAccess(userId) {
    const access = await this.prisma.restrictedQueueAccess.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    return access.map((a) => a.queueId);
  }

  async getUserEmails(userId) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        alternateEmails: true,
      },
    });

    return [user.email, ...(user.alternateEmails || [])];
  }

  hasPermission(user, permission) {
    return user.roles.some((role) => role.permissions.some((perm) => perm.name === permission));
  }

  hasRestrictedQueueAccess(user, queueId) {
    return (
      user.restrictedQueueAccess?.includes(queueId) || this.hasPermission(user, 'SYSTEM_ADMIN')
    );
  }
}

export default CustomerLinkingService;
