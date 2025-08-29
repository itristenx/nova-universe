/**
 * Booking Engine Service
 * Handles space booking, availability checking, and conflict resolution
 */

import { logger } from '../../logger.js';

export class BookingEngine {
  constructor() {
    this.initialized = false;
    this.bookings = new Map();
    this.availabilityCache = new Map();
    this.cacheTimeout = 2 * 60 * 1000; // 2 minutes
  }

  async initialize() {
    try {
      logger.info('Booking Engine initializing...');

      // Initialize booking system
      await this.setupBookingSystem();

      // Start background processes
      this.startBackgroundProcesses();

      this.initialized = true;
      logger.info('Booking Engine initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Booking Engine:', error);
      throw error;
    }
  }

  async setupBookingSystem() {
    logger.debug('Setting up booking system');

    // Initialize booking validators
    this.validators = {
      time: this.createTimeValidator(),
      capacity: this.createCapacityValidator(),
      permissions: this.createPermissionsValidator(),
      conflicts: this.createConflictValidator(),
    };

    // Initialize booking processors
    this.processors = {
      confirmation: this.createConfirmationProcessor(),
      notification: this.createNotificationProcessor(),
      integration: this.createIntegrationProcessor(),
    };
  }

  createTimeValidator() {
    return {
      name: 'time',
      validate: async (bookingData) => {
        const { startTime, endTime } = bookingData;

        if (!startTime || !endTime) {
          throw new Error('Start time and end time are required');
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (start >= end) {
          throw new Error('Start time must be before end time');
        }

        if (start < new Date()) {
          throw new Error('Cannot book in the past');
        }

        // Check if booking is within business hours (8 AM - 6 PM)
        const startHour = start.getHours();
        const endHour = end.getHours();

        if (startHour < 8 || endHour > 18) {
          throw new Error('Bookings must be within business hours (8 AM - 6 PM)');
        }

        return { valid: true, start, end };
      },
    };
  }

  createCapacityValidator() {
    return {
      name: 'capacity',
      validate: async (bookingData) => {
        const { attendees } = bookingData;

        // Mock implementation - would query database in production
        const spaceCapacity = Math.floor(Math.random() * 20) + 5;
        const attendeeCount = attendees?.length || 1;

        if (attendeeCount > spaceCapacity) {
          throw new Error(
            `Space capacity (${spaceCapacity}) exceeded by attendee count (${attendeeCount})`,
          );
        }

        return { valid: true, capacity: spaceCapacity, attendeeCount };
      },
    };
  }

  createPermissionsValidator() {
    return {
      name: 'permissions',
      validate: async (bookingData, userId) => {
        // Mock implementation - would check user permissions in production
        const userPermissions = await this.getUserPermissions(userId);

        if (!userPermissions.canBookSpaces) {
          throw new Error('User does not have permission to book spaces');
        }

        if (bookingData.isRecurring && !userPermissions.canBookRecurring) {
          throw new Error('User does not have permission to book recurring spaces');
        }

        return { valid: true, permissions: userPermissions };
      },
    };
  }

  createConflictValidator() {
    return {
      name: 'conflicts',
      validate: async (bookingData) => {
        const { spaceId, startTime, endTime } = bookingData;

        // Check for existing bookings that conflict
        const conflicts = await this.checkForConflicts(spaceId, startTime, endTime);

        if (conflicts.length > 0) {
          throw new Error(`Booking conflicts found: ${conflicts.length} overlapping bookings`);
        }

        return { valid: true, conflicts: [] };
      },
    };
  }

  createConfirmationProcessor() {
    return {
      name: 'confirmation',
      process: async (booking) => {
        logger.debug(`Processing confirmation for booking ${booking.id}`);

        // Generate confirmation details
        const confirmation = {
          bookingId: booking.id,
          confirmationNumber: `CONF-${Date.now()}`,
          status: 'confirmed',
          timestamp: new Date().toISOString(),
        };

        return confirmation;
      },
    };
  }

  createNotificationProcessor() {
    return {
      name: 'notification',
      process: async (booking) => {
        logger.debug(`Processing notifications for booking ${booking.id}`);

        // Send notifications to attendees
        const notifications = [];

        if (booking.attendees) {
          for (const attendee of booking.attendees) {
            notifications.push({
              type: 'email',
              recipient: attendee,
              subject: `Space Booking Confirmed: ${booking.title}`,
              message: `Your booking for ${booking.spaceName} has been confirmed.`,
            });
          }
        }

        return notifications;
      },
    };
  }

  createIntegrationProcessor() {
    return {
      name: 'integration',
      process: async (booking) => {
        logger.debug(`Processing integrations for booking ${booking.id}`);

        // Process calendar integrations
        const integrations = [];

        if (booking.calendarIntegration) {
          integrations.push({
            type: 'calendar',
            platform: booking.calendarIntegration,
            action: 'create_event',
            status: 'pending',
          });
        }

        return integrations;
      },
    };
  }

  async createBooking(bookingData, userId) {
    try {
      logger.debug(`Creating booking for user ${userId}`, { bookingData });

      // Validate required fields
      if (!bookingData) {
        throw new Error('Booking data is required');
      }

      if (!userId) {
        throw new Error('User ID is required');
      }

      // Validate booking data structure
      const requiredFields = ['spaceId', 'startTime', 'endTime'];
      for (const field of requiredFields) {
        if (!bookingData[field]) {
          throw new Error(`${field} is required in booking data`);
        }
      }

      // Run all validations
      await this.runValidations(bookingData, userId);

      // Create the booking
      const booking = {
        id: `booking_${Date.now()}`,
        ...bookingData,
        userId,
        createdAt: new Date().toISOString(),
        status: 'pending',
        confirmationNumber: null,
      };

      // Process the booking
      const processedBooking = await this.processBooking(booking);

      // Store the booking
      this.bookings.set(processedBooking.id, processedBooking);

      // Update availability cache
      this.updateAvailabilityCache(processedBooking);

      logger.info(`Booking created successfully: ${processedBooking.id}`);
      return { success: true, booking: processedBooking };
    } catch (error) {
      logger.error(`Failed to create booking for user ${userId}:`, error);
      throw error;
    }
  }

  async runValidations(bookingData, userId) {
    logger.debug('Running booking validations');

    const validationResults = {};

    for (const [name, validator] of Object.entries(this.validators)) {
      try {
        const result = await validator.validate(bookingData, userId);
        validationResults[name] = result;
      } catch (error) {
        logger.error(`Validation ${name} failed:`, error);
        throw error;
      }
    }

    logger.debug('All validations passed');
    return validationResults;
  }

  async processBooking(booking) {
    logger.debug(`Processing booking ${booking.id}`);

    // Process confirmation
    const confirmation = await this.processors.confirmation.process(booking);
    booking.confirmationNumber = confirmation.confirmationNumber;
    booking.status = confirmation.status;

    // Process notifications
    const notifications = await this.processors.notification.process(booking);
    booking.notifications = notifications;

    // Process integrations
    const integrations = await this.processors.integration.process(booking);
    booking.integrations = integrations;

    // Update timestamp
    booking.updatedAt = new Date().toISOString();

    return booking;
  }

  async checkAvailability(spaceId, startTime, endTime, options = {}) {
    try {
      logger.debug(`Checking availability for space ${spaceId}`, {
        startTime,
        endTime,
        options,
      });

      // Validate inputs
      if (!spaceId) {
        throw new Error('Space ID is required');
      }

      if (!startTime || !endTime) {
        throw new Error('Start time and end time are required');
      }

      // Parse time range
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (start >= end) {
        throw new Error('Start time must be before end time');
      }

      // Check cache first
      const cacheKey = `${spaceId}_${startTime}_${endTime}`;
      if (this.availabilityCache.has(cacheKey)) {
        const cached = this.availabilityCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          logger.debug('Returning cached availability');
          return cached.data;
        }
      }

      // Check for conflicts
      const conflicts = await this.checkForConflicts(spaceId, startTime, endTime);

      // Apply options if provided
      const includeBuffer = options?.buffer || false;
      const checkRecurring = options?.recurring || false;

      // Generate availability data
      const availability = {
        spaceId,
        available: conflicts.length === 0,
        timeSlot: { startTime, endTime },
        conflicts,
        suggestions: await this.generateSuggestions(spaceId, startTime, endTime, conflicts),
        options: { includeBuffer, checkRecurring },
      };

      // Cache the result
      this.availabilityCache.set(cacheKey, {
        data: availability,
        timestamp: Date.now(),
      });

      return availability;
    } catch (error) {
      logger.error(`Failed to check availability for space ${spaceId}:`, error);
      throw error;
    }
  }

  async checkForConflicts(spaceId, startTime, endTime) {
    // Mock implementation - would query database in production
    const conflicts = [];

    // Simulate some random conflicts
    if (Math.random() > 0.8) {
      conflicts.push({
        id: `conflict_${Date.now()}`,
        type: 'overlap',
        existingBooking: {
          id: `existing_${Date.now()}`,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          title: 'Existing Meeting',
        },
      });
    }

    return conflicts;
  }

  async generateSuggestions(spaceId, startTime, endTime, conflicts) {
    if (conflicts.length === 0) {
      return [];
    }

    // Mock implementation - would generate real suggestions in production
    const suggestions = [
      {
        type: 'alternative_time',
        spaceId,
        startTime: new Date(new Date(startTime).getTime() + 30 * 60 * 1000).toISOString(),
        endTime: new Date(new Date(endTime).getTime() + 30 * 60 * 1000).toISOString(),
        reason: '30 minutes later to avoid conflict',
      },
      {
        type: 'alternative_space',
        spaceId: `space_${Math.floor(Math.random() * 100)}`,
        startTime,
        endTime,
        reason: 'Similar space available at requested time',
      },
    ];

    return suggestions;
  }

  async findAlternativeSpaces(criteria) {
    try {
      logger.debug('Finding alternative spaces with criteria:', criteria);

      // Validate criteria
      if (!criteria) {
        throw new Error('Search criteria is required');
      }

      // Extract search parameters
      const {
        capacity = 0,
        location = null,
        amenities = [],
        timeSlot = null,
        excludeSpaceIds = [],
      } = criteria;

      // Mock implementation - would query database in production
      const alternatives = [
        {
          spaceId: 'alt_space_1',
          name: 'Alternative Conference Room A',
          capacity: Math.max(capacity, 10),
          location: location || 'Floor 2',
          amenities: [...amenities, 'video_conferencing'],
          availability: 'available',
          matchScore: 0.95,
        },
        {
          spaceId: 'alt_space_2',
          name: 'Alternative Meeting Room B',
          capacity: Math.max(capacity + 2, 8),
          location: location || 'Floor 1',
          amenities: [...amenities, 'whiteboard'],
          availability: 'available',
          matchScore: 0.87,
        },
      ].filter((space) => !excludeSpaceIds.includes(space.spaceId));

      return {
        alternatives,
        searchCriteria: criteria,
        totalFound: alternatives.length,
        timeSlot,
      };
    } catch (error) {
      logger.error('Failed to find alternative spaces:', error);
      throw error;
    }
  }

  async getUserPermissions(_userId) {
    // Mock implementation - would query database in production
    return {
      canBookSpaces: true,
      canBookRecurring: Math.random() > 0.3,
      canBookVipSpaces: Math.random() > 0.7,
      maxBookingDuration: 4 * 60 * 60 * 1000, // 4 hours
      maxAdvanceBooking: 30 * 24 * 60 * 60 * 1000, // 30 days
    };
  }

  updateAvailabilityCache(booking) {
    // Invalidate related cache entries
    const cacheKeys = Array.from(this.availabilityCache.keys());
    const relatedKeys = cacheKeys.filter((key) => key.includes(booking.spaceId));

    for (const key of relatedKeys) {
      this.availabilityCache.delete(key);
    }

    logger.debug(`Invalidated ${relatedKeys.length} cache entries for space ${booking.spaceId}`);
  }

  startBackgroundProcesses() {
    // Start background processes
    setInterval(
      async () => {
        try {
          await this.cleanupExpiredBookings();
          await this.updateAvailabilityMetrics();
        } catch (error) {
          logger.error('Error in background processes:', error);
        }
      },
      10 * 60 * 1000,
    ); // Every 10 minutes
  }

  async cleanupExpiredBookings() {
    logger.debug('Cleaning up expired bookings');

    const now = new Date();
    const expiredBookings = [];

    for (const [id, booking] of this.bookings) {
      if (new Date(booking.endTime) < now) {
        expiredBookings.push(id);
      }
    }

    // Remove expired bookings
    for (const id of expiredBookings) {
      this.bookings.delete(id);
    }

    if (expiredBookings.length > 0) {
      logger.info(`Cleaned up ${expiredBookings.length} expired bookings`);
    }
  }

  async updateAvailabilityMetrics() {
    logger.debug('Updating availability metrics');

    // This would update real-time availability metrics
    // For now, just log the update
    logger.debug('Availability metrics updated');
  }

  async getBookingById(bookingId) {
    return this.bookings.get(bookingId);
  }

  async getUserBookings(userId, filters = {}) {
    const userBookings = [];

    for (const booking of this.bookings.values()) {
      if (booking.userId === userId) {
        // Apply filters
        if (filters.status && booking.status !== filters.status) continue;
        if (filters.spaceId && booking.spaceId !== filters.spaceId) continue;

        userBookings.push(booking);
      }
    }

    return userBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async cancelBooking(bookingId, userId, reason = '') {
    try {
      const booking = await this.getBookingById(bookingId);

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.userId !== userId) {
        throw new Error('User can only cancel their own bookings');
      }

      if (booking.status === 'cancelled') {
        throw new Error('Booking is already cancelled');
      }

      // Update booking status
      booking.status = 'cancelled';
      booking.cancelledAt = new Date().toISOString();
      booking.cancellationReason = reason;
      booking.updatedAt = new Date().toISOString();

      // Update availability cache
      this.updateAvailabilityCache(booking);

      logger.info(`Booking ${bookingId} cancelled by user ${userId}`);
      return { success: true, booking };
    } catch (error) {
      logger.error(`Failed to cancel booking ${bookingId}:`, error);
      throw error;
    }
  }
}
