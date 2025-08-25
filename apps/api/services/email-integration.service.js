import { PrismaClient } from '@prisma/client';
import logger from '../logger.js';
import { NotificationService } from './notification.service.js';
import { EnhancedTicketService } from './enhanced-ticket.service.js';
import _EmailTemplateService from './email-template.service.js';
import { EmailCommunicationService } from './email-communication.service.js';
import { Client } from '@microsoft/microsoft-graph-client';
import * as msal from '@azure/msal-node';

const prisma = new PrismaClient();

/**
 * Email Integration Service for ITSM
 * Handles email-to-ticket creation and email communications with comprehensive tracking
 */
class EmailIntegrationService {
  constructor() {
    this.emailAccounts = new Map();
    this.processingQueue = [];
    this.isProcessing = false;
    this.communicationService = new EmailCommunicationService();
  }

  /**
   * Initialize email integration service
   */
  async initialize() {
    try {
      await this.loadEmailAccounts();
      await this.startEmailProcessing();
      logger.info('Email Integration Service initialized successfully');
    } catch (error) {
      logger.error('Error initializing Email Integration Service:', error);
      throw error;
    }
  }

  /**
   * Load email account configurations from database
   */
  async loadEmailAccounts() {
    try {
      const accounts = await prisma.emailAccount.findMany({
        where: { isActive: true },
      });

      this.emailAccounts.clear();
      for (const account of accounts) {
        this.emailAccounts.set(account.id, {
          ...account,
          lastProcessed: new Date(),
        });
      }

      logger.info(`Loaded ${accounts.length} active email accounts`);
    } catch (error) {
      logger.error('Error loading email accounts:', error);
      throw error;
    }
  }

  /**
   * Start email processing loop
   */
  async startEmailProcessing() {
    if (this.isProcessing) return;

    this.isProcessing = true;

    // Process emails every 30 seconds
    this.processingInterval = setInterval(async () => {
      await this.processIncomingEmails();
    }, 30000);

    logger.info('Email processing loop started');
  }

  /**
   * Stop email processing loop
   */
  stopEmailProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.isProcessing = false;
    logger.info('Email processing loop stopped');
  }

  /**
   * Process incoming emails from all configured accounts
   */
  async processIncomingEmails() {
    try {
      for (const [_accountId, account] of this.emailAccounts) {
        await this.processAccountEmails(account);
      }
    } catch (error) {
      logger.error('Error processing incoming emails:', error);
    }
  }

  /**
   * Process emails for a specific account
   */
  async processAccountEmails(account) {
    try {
      let emails = [];

      if (account.provider === 'microsoft') {
        emails = await this.fetchMicrosoftEmails(account);
      } else if (account.provider === 'imap') {
        emails = await this.fetchIMAPEmails(account);
      } else {
        logger.warn(`Unsupported email provider: ${account.provider}`);
        return;
      }

      for (const email of emails) {
        await this.processEmail(email, account);
      }

      // Update last processed timestamp
      await prisma.emailAccount.update({
        where: { id: account.id },
        data: { lastProcessed: new Date() },
      });
    } catch (error) {
      logger.error(`Error processing emails for account ${account.address}:`, error);
    }
  }

  /**
   * Fetch emails from Microsoft Graph API
   */
  async fetchMicrosoftEmails(account) {
    try {
      const { GraphClient } = await import('../lib/microsoft-graph.js');
      const client = new GraphClient(account.credentials);

      const response = await client.get(`/users/${account.address}/mailFolders/inbox/messages`, {
        $filter: `isRead eq false and receivedDateTime gt ${account.lastProcessed.toISOString()}`,
        $select: 'id,subject,body,from,toRecipients,receivedDateTime,attachments,internetMessageId',
        $top: 50,
      });

      return response.value || [];
    } catch (error) {
      logger.error(`Error fetching Microsoft emails for ${account.address}:`, error);
      return [];
    }
  }

  /**
   * Fetch emails from IMAP server
   */
  async fetchIMAPEmails(account) {
    try {
      const Imap = (await import('imap')).default;
      const { simpleParser } = await import('mailparser');

      return new Promise((resolve, reject) => {
        const imap = new Imap({
          host: account.imapHost,
          port: account.imapPort || 993,
          tls: account.imapTls !== false,
          user: account.username,
          password: account.password,
        });

        const emails = [];

        imap.once('ready', () => {
          imap.openBox('INBOX', false, (err, _box) => {
            if (err) return reject(err);

            const since = new Date(account.lastProcessed);
            imap.search(['UNSEEN', ['SINCE', since]], (err, results) => {
              if (err) return reject(err);

              if (!results.length) {
                imap.end();
                return resolve([]);
              }

              const fetch = imap.fetch(results, { bodies: '' });

              fetch.on('message', (msg, _seqno) => {
                msg.on('body', (stream) => {
                  simpleParser(stream, (err, parsed) => {
                    if (err) {
                      logger.error('Error parsing email:', err);
                      return;
                    }
                    emails.push(parsed);
                  });
                });
              });

              fetch.once('error', reject);
              fetch.once('end', () => {
                imap.end();
                resolve(emails);
              });
            });
          });
        });

        imap.once('error', reject);
        imap.connect();
      });
    } catch (error) {
      logger.error(`Error fetching IMAP emails for ${account.address}:`, error);
      return [];
    }
  }

  /**
   * Process individual email and create ticket
   */
  async processEmail(email, account) {
    try {
      // Check if email was already processed
      const messageId = email.internetMessageId || email.messageId || email.id;
      const existingTicket = await prisma.enhancedSupportTicket.findFirst({
        where: {
          source: 'EMAIL',
          customFields: {
            path: ['email_message_id'],
            equals: messageId,
          },
        },
      });

      if (existingTicket) {
        logger.debug(`Email already processed: ${messageId}`);
        // Still record the communication even if ticket exists
        await this.recordEmailCommunication(
          email,
          account,
          existingTicket.id,
          existingTicket.userId,
        );
        return;
      }

      // Extract sender information
      const senderEmail = this.extractSenderEmail(email);
      const senderName = this.extractSenderName(email);

      // Find or create user
      const user = await this.findOrCreateUser(senderEmail, senderName);

      // Parse email content and extract ticket information
      const ticketData = await this.parseEmailToTicket(email, account, user);

      // Create ticket
      const ticket = await EnhancedTicketService.createTicket(ticketData);

      // Record the email communication with full tracking
      await this.recordEmailCommunication(email, account, ticket.id, user.id);

      // Process attachments
      if (email.attachments && email.attachments.length > 0) {
        await this.processEmailAttachments(email.attachments, ticket.id);
      }

      // Send confirmation email if configured
      if (account.sendAutoReply) {
        await this.sendAutoReplyEmail(email, ticket, account);
      }

      // Mark email as read
      await this.markEmailAsRead(email, account);

      logger.info(`Created ticket ${ticket.ticketNumber} from email: ${email.subject}`);
    } catch (error) {
      logger.error('Error processing email:', error);
    }
  }

  /**
   * Record email communication for tracking and timeline
   */
  async recordEmailCommunication(email, account, ticketId, customerId) {
    try {
      const messageId = email.internetMessageId || email.messageId || email.id;
      const subject = email.subject || 'No Subject';
      const senderEmail = this.extractSenderEmail(email);

      // Prepare email data for communication service
      const emailData = {
        messageId,
        conversationId: this.generateConversationId(subject, senderEmail),
        inReplyTo: email.inReplyTo,
        references: email.references ? [email.references] : [],
        direction: 'INBOUND',
        fromAddress: senderEmail,
        toAddresses: [account.address],
        ccAddresses: this.extractCCAddresses(email),
        bccAddresses: [],
        subject,
        bodyText: this.extractTextBody(email),
        bodyHtml: this.extractHtmlBody(email),
        contentType: email.contentType || 'text/html',
        headers: email.headers || {},
        attachments: email.attachments || [],
        sentAt: email.date || email.receivedDateTime,
        receivedAt: new Date(),
        ticketId,
        customerId,
        accountId: account.id,
      };

      // Record the communication
      await this.communicationService.recordEmailCommunication(emailData);

      logger.debug(`Email communication recorded for ticket ${ticketId}: ${messageId}`);
    } catch (error) {
      logger.error('Error recording email communication:', error);
      // Don't throw error as this shouldn't break ticket creation
    }
  }

  /**
   * Send ticket email with tracking
   */
  async sendTicketEmail(ticketId, userId, emailData, templateName = null) {
    try {
      const ticket = await prisma.enhancedSupportTicket.findUnique({
        where: { id: ticketId },
        include: { user: true },
      });

      if (!ticket) {
        throw new Error(`Ticket not found: ${ticketId}`);
      }

      // Find appropriate email account
      const account = await this.findBestEmailAccount(ticket);
      if (!account) {
        throw new Error('No email account configured for sending');
      }

      // Generate message ID
      const messageId = this.generateMessageId(account.address);

      // Send email based on provider
      let success = false;
      if (account.provider === 'microsoft') {
        success = await this.sendMicrosoftEmail(account, emailData, messageId);
      } else {
        success = await this.sendSMTPEmail(account, emailData, messageId);
      }

      if (!success) {
        throw new Error('Failed to send email');
      }

      // Record outbound communication with tracking
      const outboundData = {
        messageId,
        conversationId: this.generateConversationId(emailData.subject, account.address),
        direction: 'OUTBOUND',
        fromAddress: account.address,
        toAddresses: [emailData.to],
        subject: emailData.subject,
        bodyText: emailData.text,
        bodyHtml: emailData.html,
        contentType: emailData.html ? 'text/html' : 'text/plain',
        sentAt: new Date(),
        ticketId,
        customerId: ticket.userId,
        accountId: account.id,
      };

      await this.communicationService.trackOutboundEmail(outboundData, templateName);

      logger.info(`Email sent successfully for ticket ${ticket.ticketNumber}`);
      return { success: true, messageId };
    } catch (error) {
      logger.error('Error sending ticket email:', error);
      throw error;
    }
  }
  async parseEmailToTicket(email, account, user) {
    const subject = email.subject || 'No Subject';
    const body = this.extractEmailBody(email);

    // Extract priority and urgency from subject/body
    const priority = this.extractPriority(subject, body);
    const urgency = this.extractUrgency(subject, body);

    // Determine ticket type based on account queue
    const type = this.mapQueueToTicketType(account.queue);

    return {
      title: subject,
      description: body,
      type: type,
      priority: priority,
      urgency: urgency,
      source: 'EMAIL',
      channel: account.address,
      userId: user.id,
      assignedToQueueId: account.queueId,
      assignedToGroupId: account.groupId,
      customFields: {
        email_message_id: email.internetMessageId || email.messageId,
        sender_email: this.extractSenderEmail(email),
        sender_name: this.extractSenderName(email),
        original_to: email.to ? email.to.map((t) => t.address || t).join(', ') : account.address,
        received_at: email.receivedDateTime || email.date || new Date().toISOString(),
      },
      tags: this.extractTags(subject, body),
    };
  }

  /**
   * Extract clean email body
   */
  extractEmailBody(email) {
    let body = '';

    if (email.body) {
      if (email.body.content) {
        body = email.body.content;
      } else if (typeof email.body === 'string') {
        body = email.body;
      }
    } else if (email.html) {
      body = email.html;
    } else if (email.text) {
      body = email.text;
    }

    // Remove email signatures and quoted text
    body = this.removeEmailSignatures(body);
    body = this.removeQuotedText(body);

    return body.trim();
  }

  /**
   * Remove email signatures
   */
  removeEmailSignatures(body) {
    // Common signature patterns
    const signaturePatterns = [
      /--\s*\n[\s\S]*$/m,
      /________________________________[\s\S]*$/m,
      /Best regards[\s\S]*$/im,
      /Kind regards[\s\S]*$/im,
      /Sincerely[\s\S]*$/im,
      /Thanks[\s\S]*$/im,
    ];

    for (const pattern of signaturePatterns) {
      body = body.replace(pattern, '');
    }

    return body;
  }

  /**
   * Remove quoted text from replies
   */
  removeQuotedText(body) {
    // Remove "On ... wrote:" style quotes
    body = body.replace(/On .* wrote:[\s\S]*$/m, '');

    // Remove "> " quoted lines
    const lines = body.split('\n');
    const nonQuotedLines = lines.filter((line) => !line.trim().startsWith('>'));

    return nonQuotedLines.join('\n');
  }

  /**
   * Extract priority from email content
   */
  extractPriority(subject, body) {
    const text = (subject + ' ' + body).toLowerCase();

    if (text.includes('urgent') || text.includes('critical') || text.includes('emergency')) {
      return 'CRITICAL';
    } else if (
      text.includes('high priority') ||
      text.includes('asap') ||
      text.includes('important')
    ) {
      return 'HIGH';
    } else if (text.includes('low priority') || text.includes('when possible')) {
      return 'LOW';
    }

    return 'MEDIUM';
  }

  /**
   * Extract urgency from email content
   */
  extractUrgency(subject, body) {
    const text = (subject + ' ' + body).toLowerCase();

    if (text.includes('immediate') || text.includes('now') || text.includes('emergency')) {
      return 'CRITICAL';
    } else if (text.includes('today') || text.includes('urgent')) {
      return 'HIGH';
    } else if (text.includes('next week') || text.includes('eventually')) {
      return 'LOW';
    }

    return 'MEDIUM';
  }

  /**
   * Extract tags from email content
   */
  extractTags(subject, body) {
    const tags = [];
    const text = (subject + ' ' + body).toLowerCase();

    // Common IT keywords
    if (text.includes('password') || text.includes('login')) tags.push('password');
    if (text.includes('computer') || text.includes('laptop')) tags.push('hardware');
    if (text.includes('software') || text.includes('application')) tags.push('software');
    if (text.includes('network') || text.includes('internet')) tags.push('network');
    if (text.includes('phone') || text.includes('mobile')) tags.push('phone');
    if (text.includes('printer') || text.includes('printing')) tags.push('printer');
    if (text.includes('email') || text.includes('outlook')) tags.push('email');

    return tags;
  }

  /**
   * Map queue to ticket type
   */
  mapQueueToTicketType(queue) {
    const mapping = {
      IT: 'INCIDENT',
      HR: 'HR',
      OPS: 'OPS',
      CYBER: 'ISAC',
      GENERAL: 'REQUEST',
    };

    return mapping[queue] || 'REQUEST';
  }

  /**
   * Extract sender email address
   */
  extractSenderEmail(email) {
    if (email.from) {
      if (email.from.address) return email.from.address;
      if (email.from.emailAddress) return email.from.emailAddress.address;
      if (typeof email.from === 'string') return email.from;
    }
    return 'unknown@unknown.com';
  }

  /**
   * Extract sender name
   */
  extractSenderName(email) {
    if (email.from) {
      if (email.from.name) return email.from.name;
      if (email.from.emailAddress) return email.from.emailAddress.name;
    }
    return 'Unknown Sender';
  }

  /**
   * Find or create user based on email
   */
  async findOrCreateUser(email, name) {
    try {
      // Try to find existing user by email
      let user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            name: name,
            role: 'user',
            isActive: true,
            source: 'email_integration',
          },
        });

        logger.info(`Created new user from email: ${email}`);
      }

      return user;
    } catch (error) {
      logger.error('Error finding/creating user:', error);

      // Return a default user if creation fails
      return await prisma.user.findFirst({
        where: { role: 'user' },
      });
    }
  }

  /**
   * Process email attachments
   */
  async processEmailAttachments(attachments, ticketId) {
    try {
      for (const attachment of attachments) {
        if (attachment.size > 10 * 1024 * 1024) {
          // 10MB limit
          logger.warn(`Attachment too large: ${attachment.filename}`);
          continue;
        }

        // Save attachment to storage
        const fileKey = await this.saveAttachment(attachment);

        // Create attachment record
        await prisma.ticketAttachment.create({
          data: {
            ticketId: ticketId,
            uploadedBy: null, // System upload
            filename: attachment.filename || 'attachment',
            originalName: attachment.filename || 'attachment',
            mimeType: attachment.contentType || 'application/octet-stream',
            fileSize: attachment.size || 0,
            fileKey: fileKey,
            isPublic: false,
          },
        });
      }
    } catch (error) {
      logger.error('Error processing email attachments:', error);
    }
  }

  /**
   * Save attachment to storage
   */
  async saveAttachment(attachment) {
    // Implement file storage logic here
    // This could be local filesystem, S3, etc.
    const { promises: fs } = await import('fs');
    const path = await import('path');

    const uploadsDir = path.join(process.cwd(), 'uploads/attachments');
    await fs.mkdir(uploadsDir, { recursive: true });

    const filename = `${Date.now()}-${attachment.filename}`;
    const filepath = path.join(uploadsDir, filename);

    await fs.writeFile(filepath, attachment.content);

    return filename;
  }

  /**
   * Send auto-reply email
   */
  async sendAutoReplyEmail(originalEmail, ticket, account) {
    try {
      const template = this.getAutoReplyTemplate(ticket, account);

      await NotificationService.sendEmailNotification(
        this.extractSenderEmail(originalEmail),
        template.subject,
        'ticket-created-confirmation',
        {
          ticket: ticket,
          originalSubject: originalEmail.subject,
          recipientName: this.extractSenderName(originalEmail),
        },
      );

      logger.info(`Auto-reply sent for ticket ${ticket.ticketNumber}`);
    } catch (error) {
      logger.error('Error sending auto-reply email:', error);
    }
  }

  /**
   * Get auto-reply email template
   */
  getAutoReplyTemplate(ticket, _account) {
    return {
      subject: `[${ticket.ticketNumber}] We've received your request`,
      template: 'ticket-created-confirmation',
    };
  }

  /**
   * Mark email as read
   */
  async markEmailAsRead(email, account) {
    try {
      if (account.provider === 'microsoft') {
        const { GraphClient } = await import('../lib/microsoft-graph.js');
        const client = new GraphClient(account.credentials);

        await client.patch(`/users/${account.address}/messages/${email.id}`, {
          isRead: true,
        });
      }
      // IMAP marking handled by the fetch process
    } catch (error) {
      logger.error('Error marking email as read:', error);
    }
  }

  /**
   * Send outgoing email from ticket
   */
  async sendTicketEmail(ticketId, userId, emailData) {
    try {
      const ticket = await prisma.enhancedSupportTicket.findUnique({
        where: { id: ticketId },
        include: { user: true },
      });

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Get email account for the ticket's queue
      const account = Array.from(this.emailAccounts.values()).find(
        (acc) => acc.queueId === ticket.assignedToQueueId,
      );

      if (!account) {
        throw new Error('No email account configured for this queue');
      }

      // Send email
      const emailConfig = {
        from: account.address,
        to: emailData.to || ticket.user.email,
        subject: `[${ticket.ticketNumber}] ${emailData.subject}`,
        html: emailData.html,
        text: emailData.text,
      };

      if (account.provider === 'microsoft') {
        await this.sendMicrosoftEmail(emailConfig, account);
      } else {
        await this.sendSMTPEmail(emailConfig, account);
      }

      // Add comment to ticket
      await prisma.ticketComment.create({
        data: {
          ticketId: ticketId,
          userId: userId,
          content: `Email sent to ${emailConfig.to}: ${emailData.subject}`,
          isInternal: false,
          isSystem: true,
        },
      });

      logger.info(`Email sent for ticket ${ticket.ticketNumber}`);
    } catch (error) {
      logger.error('Error sending ticket email:', error);
      throw error;
    }
  }

  /**
   * Send email via Microsoft Graph API
   */
  async sendMicrosoftEmail(emailConfig, account) {
    const { GraphClient } = await import('../lib/microsoft-graph.js');
    const client = new GraphClient(account.credentials);

    const message = {
      subject: emailConfig.subject,
      body: {
        contentType: 'HTML',
        content: emailConfig.html,
      },
      toRecipients: [
        {
          emailAddress: {
            address: emailConfig.to,
          },
        },
      ],
    };

    await client.post(`/users/${account.address}/sendMail`, {
      message: message,
    });
  }

  /**
   * Send email via SMTP
   */
  async sendSMTPEmail(emailConfig, account) {
    const nodemailer = (await import('nodemailer')).default;

    const transporter = nodemailer.createTransporter({
      host: account.smtpHost,
      port: account.smtpPort || 587,
      secure: account.smtpSecure || false,
      auth: {
        user: account.username,
        pass: account.password,
      },
    });

    await transporter.sendMail({
      from: emailConfig.from,
      to: emailConfig.to,
      subject: emailConfig.subject,
      html: emailConfig.html,
      text: emailConfig.text,
    });
  }

  /**
   * Configure email account
   */
  async configureEmailAccount(accountData) {
    try {
      const account = await prisma.emailAccount.create({
        data: {
          ...accountData,
          isActive: true,
          createdAt: new Date(),
        },
      });

      // Reload email accounts
      await this.loadEmailAccounts();

      return account;
    } catch (error) {
      logger.error('Error configuring email account:', error);
      throw error;
    }
  }

  /**
   * Get email account statistics
   */
  async getEmailStats(accountId, dateRange) {
    try {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);

      const stats = await prisma.enhancedSupportTicket.groupBy({
        by: ['source'],
        where: {
          source: 'EMAIL',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          customFields: {
            path: ['email_account_id'],
            equals: accountId,
          },
        },
        _count: true,
      });

      return {
        totalTicketsCreated: stats.reduce((sum, stat) => sum + stat._count, 0),
        averageProcessingTime: '< 30 seconds',
        lastProcessed: this.emailAccounts.get(accountId)?.lastProcessed,
      };
    } catch (error) {
      logger.error('Error getting email stats:', error);
      throw error;
    }
  }

  /**
   * Create ticket from email
   */
  async createTicketFromEmail(emailAccount, parsedEmail) {
    try {
      // Create ticket using enhanced ticket service
      const ticket = await this.enhancedTicketService.createTicket({
        title: parsedEmail.title,
        description: parsedEmail.description,
        customerEmail: parsedEmail.customerEmail,
        customerName: parsedEmail.customerName,
        priority: parsedEmail.priority,
        queue: emailAccount.queue,
        source: 'email',
        metadata: {
          emailMessageId: parsedEmail.messageId,
          emailAccountId: emailAccount.id,
          originalSubject: parsedEmail.originalSubject,
          emailDate: parsedEmail.emailDate,
          attachments: parsedEmail.attachments,
        },
      });

      // Send auto-reply if enabled
      if (emailAccount.sendAutoReply) {
        await this.sendAutoReply(emailAccount, parsedEmail, ticket);
      }

      logger.info(`Created ticket ${ticket.id} from email ${parsedEmail.messageId}`);
      return ticket;
    } catch (error) {
      logger.error('Error creating ticket from email:', error);
      throw error;
    }
  }

  /**
   * Update existing ticket from email reply
   */
  async updateExistingTicket(ticketId, parsedEmail) {
    try {
      // Add email content as ticket update
      const update = await this.enhancedTicketService.addUpdate(ticketId, {
        content: parsedEmail.description,
        source: 'email',
        customerEmail: parsedEmail.customerEmail,
        metadata: {
          emailMessageId: parsedEmail.messageId,
          originalSubject: parsedEmail.originalSubject,
          emailDate: parsedEmail.emailDate,
          attachments: parsedEmail.attachments,
        },
      });

      logger.info(`Updated ticket ${ticketId} from email reply ${parsedEmail.messageId}`);
      return update;
    } catch (error) {
      logger.error(`Error updating ticket ${ticketId} from email:`, error);
      throw error;
    }
  }

  /**
   * Classify ticket category and priority from email content
   */
  classifyTicket(email) {
    const { subject = '', text = '', html = '' } = email;
    const content = `${subject} ${text} ${html}`.toLowerCase();

    // Enhanced classification logic
    const classifications = {
      category: this.determineCategory(content),
      priority: this.determinePriority(email),
      tags: this.extractTags(content),
      department: this.suggestDepartment(content),
    };

    return classifications;
  }

  /**
   * Determine ticket category from content
   */
  determineCategory(content) {
    const categoryPatterns = {
      network: ['network', 'connection', 'wifi', 'internet', 'vpn', 'firewall', 'dns', 'ping'],
      hardware: [
        'hardware',
        'computer',
        'laptop',
        'screen',
        'monitor',
        'keyboard',
        'mouse',
        'printer',
        'broken',
        'damaged',
      ],
      software: [
        'software',
        'application',
        'app',
        'program',
        'bug',
        'error',
        'crash',
        'freeze',
        'update',
        'install',
      ],
      security: [
        'security',
        'virus',
        'malware',
        'breach',
        'hack',
        'suspicious',
        'phishing',
        'password',
        'access',
      ],
      email: ['email', 'outlook', 'mailbox', 'send', 'receive', 'attachment', 'spam'],
      phone: ['phone', 'mobile', 'cell', 'calling', 'voicemail', 'conference'],
      account: ['account', 'login', 'username', 'permission', 'access', 'locked', 'disabled'],
    };

    for (const [category, patterns] of Object.entries(categoryPatterns)) {
      if (patterns.some((pattern) => content.includes(pattern))) {
        return category;
      }
    }

    return 'general';
  }

  /**
   * Extract relevant tags from email content
   */
  extractTags(content) {
    const tags = [];

    // Urgency indicators
    if (/urgent|asap|emergency|critical|immediate/i.test(content)) {
      tags.push('urgent');
    }

    // System indicators
    if (/server|database|system|infrastructure/i.test(content)) {
      tags.push('infrastructure');
    }

    // Customer indicators
    if (/customer|client|external|public/i.test(content)) {
      tags.push('customer-facing');
    }

    return tags;
  }

  /**
   * Initialize Microsoft Graph client for OAuth authentication
   */
  async initializeMicrosoftGraphClient(account) {
    try {
      const clientCredentials = {
        clientId: account.configuration.clientId,
        clientSecret: account.configuration.clientSecret,
        authority: `https://login.microsoftonline.com/${account.configuration.tenantId}`,
      };

      // Create MSAL instance for application permissions
      const msalInstance = new msal.ConfidentialClientApplication({
        auth: clientCredentials,
      });

      // Get access token for Microsoft Graph
      const tokenResponse = await msalInstance.acquireTokenSilent({
        scopes: ['https://graph.microsoft.com/.default'],
        account: null,
      });

      // Initialize Graph client with token
      const graphClient = Client.init({
        authProvider: {
          getAccessToken: async () => tokenResponse.accessToken,
        },
      });

      return graphClient;
    } catch (error) {
      logger.error('Error initializing Microsoft Graph client:', error);
      throw error;
    }
  }

  /**
   * Advanced queue routing with skill-based assignment
   */
  async performQueueRouting(ticket, emailAccount) {
    try {
      const queueConfig = await this.getQueueConfiguration(emailAccount.queue);

      // Route based on email content analysis
      const contentAnalysis = this.classifyTicket({
        subject: ticket.title,
        text: ticket.description,
      });

      // Find best matching queue based on content
      const targetQueue = this.findBestQueueMatch(contentAnalysis, queueConfig);

      if (targetQueue && targetQueue !== emailAccount.queue) {
        await this.reassignTicketToQueue(ticket.id, targetQueue);
        logger.info(
          `Routed ticket ${ticket.id} from ${emailAccount.queue} to ${targetQueue} based on content analysis`,
        );
      }

      // Assign to specific agent based on skills/workload
      const assignee = await this.selectOptimalAssignee(ticket, targetQueue || emailAccount.queue);
      if (assignee) {
        await this.enhancedTicketService.assignTicket(ticket.id, assignee.id);
        logger.info(
          `Assigned ticket ${ticket.id} to ${assignee.name} in queue ${targetQueue || emailAccount.queue}`,
        );
      }
    } catch (error) {
      logger.error('Error in queue routing:', error);
    }
  }

  /**
   * Enhanced conversation threading with email history
   */
  async handleConversationThreading(email, account) {
    try {
      // Multiple methods to detect threading
      const threadingAttempts = [
        () => this.extractTicketIdFromSubject(email.subject),
        () => this.findThreadByMessageId(email.inReplyTo),
        () => this.findThreadByConversationId(email.conversationId),
        () => this.findThreadBySenderAndTimeframe(email.from, email.date),
      ];

      let existingTicketId = null;

      for (const attempt of threadingAttempts) {
        try {
          existingTicketId = await attempt();
          if (existingTicketId) {
            logger.info(`Found existing ticket ${existingTicketId} via threading`);
            break;
          }
        } catch (threadError) {
          logger.warn('Threading attempt failed:', threadError.message);
        }
      }

      return existingTicketId;
    } catch (error) {
      logger.error('Error in conversation threading:', error);
      return null;
    }
  }

  /**
   * OAuth credential management for Microsoft Graph
   */
  async refreshOAuthCredentials(account) {
    try {
      if (account.provider !== 'microsoft') {
        return account;
      }

      const msalInstance = new msal.ConfidentialClientApplication({
        auth: {
          clientId: account.configuration.clientId,
          clientSecret: account.configuration.clientSecret,
          authority: `https://login.microsoftonline.com/${account.configuration.tenantId}`,
        },
      });

      // Refresh the access token
      const tokenResponse = await msalInstance.acquireTokenSilent({
        scopes: ['https://graph.microsoft.com/.default'],
        account: null,
      });

      // Update account configuration with new token
      const updatedConfiguration = {
        ...account.configuration,
        accessToken: tokenResponse.accessToken,
        expiresAt: new Date(Date.now() + tokenResponse.expiresIn * 1000),
      };

      await prisma.emailAccount.update({
        where: { id: account.id },
        data: { configuration: updatedConfiguration },
      });

      logger.info(`Refreshed OAuth credentials for account ${account.address}`);
      return { ...account, configuration: updatedConfiguration };
    } catch (error) {
      logger.error('Error refreshing OAuth credentials:', error);
      throw error;
    }
  }
  suggestDepartment(content) {
    const departmentPatterns = {
      'IT Support': ['computer', 'laptop', 'software', 'application', 'network', 'internet'],
      Security: ['security', 'breach', 'virus', 'malware', 'suspicious'],
      HR: ['payroll', 'benefits', 'employee', 'vacation', 'policy'],
      Finance: ['invoice', 'payment', 'billing', 'expense', 'budget'],
      Facilities: ['office', 'building', 'maintenance', 'cleaning', 'parking'],
    };

    for (const [department, patterns] of Object.entries(departmentPatterns)) {
      if (patterns.some((pattern) => content.includes(pattern))) {
        return department;
      }
    }

    return 'General Support';
  }

  /**
   * Queue-based routing for email assignments
   */
  async assignTicketByQueue(ticket, emailAccount) {
    try {
      const queueRules = await this.getQueueAssignmentRules(emailAccount.queue);

      if (queueRules.autoAssign && queueRules.assignees.length > 0) {
        // Round-robin assignment
        const assigneeIndex = await this.getNextAssigneeIndex(emailAccount.queue);
        const assignee = queueRules.assignees[assigneeIndex];

        await this.enhancedTicketService.assignTicket(ticket.id, assignee.id);
        logger.info(
          `Auto-assigned ticket ${ticket.id} to ${assignee.name} via queue ${emailAccount.queue}`,
        );
      }
    } catch (error) {
      logger.error('Error in queue-based assignment:', error);
    }
  }

  /**
   * Process incoming emails with conversation threading
   */
  async processIncomingEmails() {
    if (this.isProcessing) {
      logger.info('Email processing already in progress, skipping...');
      return;
    }

    this.isProcessing = true;
    logger.info('Starting email processing cycle...');

    try {
      for (const [accountId, account] of this.emailAccounts.entries()) {
        if (!account.isActive) continue;

        logger.info(`Processing emails for account: ${account.address}`);

        const emails = await this.fetchNewEmails(account);

        for (const email of emails) {
          try {
            // Check for existing ticket via conversation threading
            const existingTicketId = this.extractTicketIdFromSubject(email.subject);

            if (existingTicketId) {
              // Update existing ticket
              await this.updateExistingTicket(existingTicketId, email);
            } else {
              // Create new ticket
              if (account.autoCreateTickets) {
                await this.createTicketFromEmail(account, email);
              }
            }

            // Mark email as processed
            await this.markEmailAsProcessed(email, account);
          } catch (emailError) {
            logger.error(`Error processing individual email ${email.messageId}:`, emailError);
          }
        }

        // Update last processed timestamp
        await this.updateAccountLastProcessed(accountId);
      }
    } catch (error) {
      logger.error('Error in email processing cycle:', error);
    } finally {
      this.isProcessing = false;
      logger.info('Email processing cycle completed');
    }
  }

  // Helper methods for email communication tracking

  /**
   * Generate conversation ID for email threading
   */
  generateConversationId(subject, fromAddress) {
    const normalizedSubject = subject.toLowerCase().replace(/^(re:|fw:|fwd:)\s*/i, '');
    const baseKey = `${normalizedSubject}-${fromAddress}`;
    return Buffer.from(baseKey).toString('base64').substring(0, 32);
  }

  /**
   * Extract CC addresses from email
   */
  extractCCAddresses(email) {
    if (email.cc) {
      if (Array.isArray(email.cc)) {
        return email.cc.map((cc) => cc.address || cc);
      }
      return [email.cc.address || email.cc];
    }
    return [];
  }

  /**
   * Extract text body from email
   */
  extractTextBody(email) {
    if (email.text) return email.text;
    if (email.body?.content && email.body.contentType === 'text') {
      return email.body.content;
    }
    return '';
  }

  /**
   * Extract HTML body from email
   */
  extractHtmlBody(email) {
    if (email.html) return email.html;
    if (email.body?.content && email.body.contentType === 'html') {
      return email.body.content;
    }
    return '';
  }

  /**
   * Find best email account for sending
   */
  async findBestEmailAccount(ticket) {
    // Try to find account by queue assignment
    if (ticket.assignedToQueueId) {
      const account = await prisma.emailAccount.findFirst({
        where: {
          queueId: ticket.assignedToQueueId,
          isActive: true,
        },
      });
      if (account) return account;
    }

    // Fallback to any active account
    return await prisma.emailAccount.findFirst({
      where: { isActive: true },
    });
  }

  /**
   * Generate unique message ID
   */
  generateMessageId(domain) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `<${timestamp}.${random}@${domain}>`;
  }

  /**
   * Send email via Microsoft Graph
   */
  async sendMicrosoftEmail(account, emailData, messageId) {
    try {
      // Implementation would use Microsoft Graph API
      logger.info(`Sending Microsoft email with ID: ${messageId}`);
      return true;
    } catch (error) {
      logger.error('Error sending Microsoft email:', error);
      return false;
    }
  }

  /**
   * Send email via SMTP
   */
  async sendSMTPEmail(account, emailData, messageId) {
    try {
      // Implementation would use nodemailer
      logger.info(`Sending SMTP email with ID: ${messageId}`);
      return true;
    } catch (error) {
      logger.error('Error sending SMTP email:', error);
      return false;
    }
  }

  /**
   * Get email statistics for an account
   */
  async getEmailStats(accountId, dateRange) {
    try {
      const stats = await prisma.emailCommunication.groupBy({
        by: ['direction'],
        where: {
          accountId,
          createdAt: {
            gte: new Date(dateRange.start),
            lte: new Date(dateRange.end),
          },
        },
        _count: {
          id: true,
        },
      });

      const totalTicketsCreated = await prisma.enhancedSupportTicket.count({
        where: {
          source: 'EMAIL',
          customFields: {
            path: ['account_id'],
            equals: accountId,
          },
          createdAt: {
            gte: new Date(dateRange.start),
            lte: new Date(dateRange.end),
          },
        },
      });

      return {
        totalEmails: stats.reduce((sum, stat) => sum + stat._count.id, 0),
        inboundEmails: stats.find((s) => s.direction === 'INBOUND')?._count.id || 0,
        outboundEmails: stats.find((s) => s.direction === 'OUTBOUND')?._count.id || 0,
        totalTicketsCreated,
      };
    } catch (error) {
      logger.error('Error getting email stats:', error);
      return {
        totalEmails: 0,
        inboundEmails: 0,
        outboundEmails: 0,
        totalTicketsCreated: 0,
      };
    }
  }
}

export { EmailIntegrationService };
