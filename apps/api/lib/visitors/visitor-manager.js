/**
 * Visitor Manager Service
 * Handles visitor registration, access management, and visitor tracking
 */

import { logger } from '../../logger.js';

export class VisitorManager {
  constructor() {
    this.initialized = false;
    this.visitors = new Map();
    this.accessLogs = new Map();
    this.visitorTypes = ['guest', 'contractor', 'vendor', 'client', 'consultant'];
  }

  async initialize() {
    try {
      logger.info('Visitor Manager initializing...');
      
      // Initialize visitor management system
      await this.setupVisitorSystem();
      
      // Start background processes
      this.startBackgroundProcesses();
      
      this.initialized = true;
      logger.info('Visitor Manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Visitor Manager:', error);
      throw error;
    }
  }

  async setupVisitorSystem() {
    logger.debug('Setting up visitor management system');
    
    // Initialize visitor validators
    this.validators = {
      identity: this.createIdentityValidator(),
      access: this.createAccessValidator(),
      security: this.createSecurityValidator()
    };
    
    // Initialize visitor processors
    this.processors = {
      registration: this.createRegistrationProcessor(),
      notification: this.createNotificationProcessor(),
      access: this.createAccessProcessor()
    };
  }

  createIdentityValidator() {
    return {
      name: 'identity',
      validate: async (visitorData) => {
        const { name, email, phone, company } = visitorData;
        
        if (!name || name.trim().length < 2) {
          throw new Error('Valid name is required (minimum 2 characters)');
        }
        
        if (!email || !this.isValidEmail(email)) {
          throw new Error('Valid email address is required');
        }
        
        if (phone && !this.isValidPhone(phone)) {
          throw new Error('Valid phone number is required');
        }
        
        if (!company || company.trim().length < 2) {
          throw new Error('Company name is required');
        }
        
        return { valid: true, name: name.trim(), email: email.toLowerCase(), company: company.trim() };
      }
    };
  }

  createAccessValidator() {
    return {
      name: 'access',
      validate: async (visitorData, hostUserId) => {
        if (!hostUserId) {
          throw new Error('Host user ID is required');
        }
        
        // Check if host user exists and has permission to host visitors
        const hostPermissions = await this.getHostPermissions(hostUserId);
        
        if (!hostPermissions.canHostVisitors) {
          throw new Error('Host user does not have permission to host visitors');
        }
        
        // Check visitor type restrictions
        if (visitorData.type && !hostPermissions.allowedVisitorTypes.includes(visitorData.type)) {
          throw new Error(`Host user cannot host ${visitorData.type} visitors`);
        }
        
        return { valid: true, hostPermissions };
      }
    };
  }

  createSecurityValidator() {
    return {
      name: 'security',
      validate: async (visitorData) => {
        // Check for security restrictions
        const securityChecks = await this.performSecurityChecks(visitorData);
        
        if (!securityChecks.passed) {
          throw new Error(`Security check failed: ${securityChecks.reason}`);
        }
        
        return { valid: true, securityChecks };
      }
    };
  }

  createRegistrationProcessor() {
    return {
      name: 'registration',
      process: async (visitorData) => {
        logger.debug(`Processing registration for visitor ${visitorData.email}`);
        
        // Generate visitor ID and badge
        const visitorId = `visitor_${Date.now()}`;
        const badgeNumber = this.generateBadgeNumber();
        
        const registration = {
          visitorId,
          badgeNumber,
          status: 'registered',
          timestamp: new Date().toISOString()
        };
        
        return registration;
      }
    };
  }

  createNotificationProcessor() {
    return {
      name: 'notification',
      process: async (visitorData) => {
        logger.debug(`Processing notifications for visitor ${visitorData.email}`);
        
        // Send notifications to host and security
        const notifications = [
          {
            type: 'email',
            recipient: visitorData.hostEmail,
            subject: `New Visitor Registration: ${visitorData.name}`,
            message: `A new visitor has been registered for you.`
          },
          {
            type: 'email',
            recipient: 'security@company.com',
            subject: `New Visitor: ${visitorData.name}`,
            message: `New visitor registered with badge #${visitorData.badgeNumber}.`
          }
        ];
        
        return notifications;
      }
    };
  }

  createAccessProcessor() {
    return {
      name: 'access',
      process: async (visitorData) => {
        logger.debug(`Processing access for visitor ${visitorData.email}`);
        
        // Generate access credentials
        const accessCredentials = {
          badgeId: visitorData.badgeNumber,
          accessLevel: visitorData.accessLevel || 'restricted',
          validFrom: new Date().toISOString(),
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          areas: visitorData.allowedAreas || ['lobby', 'meeting_rooms']
        };
        
        return accessCredentials;
      }
    };
  }

  async registerVisitor(visitorData, hostUserId) {
    try {
      logger.debug(`Registering visitor for host ${hostUserId}`, { visitorData });

      // Validate required data
      if (!visitorData) {
        throw new Error('Visitor data is required');
      }

      if (!hostUserId) {
        throw new Error('Host user ID is required');
      }

      // Validate visitor data fields
      const requiredFields = ['name', 'email', 'company'];
      for (const field of requiredFields) {
        if (!visitorData[field]) {
          throw new Error(`${field} is required in visitor data`);
        }
      }

      // Run all validations
      await this.runValidations(visitorData, hostUserId);

      // Process the visitor registration
      const processedVisitor = await this.processVisitorRegistration(visitorData, hostUserId);
      
      // Store the visitor
      this.visitors.set(processedVisitor.visitorId, processedVisitor);
      
      // Log the registration
      await this.logVisitorActivity(processedVisitor.visitorId, 'registration', hostUserId);

      logger.info(`Visitor registered successfully: ${processedVisitor.visitorId}`);
      return { success: true, visitor: processedVisitor };
    } catch (error) {
      logger.error(`Failed to register visitor for host ${hostUserId}:`, error);
      throw error;
    }
  }

  async runValidations(visitorData, hostUserId) {
    logger.debug('Running visitor validations');
    
    const validationResults = {};
    
    for (const [name, validator] of Object.entries(this.validators)) {
      try {
        const result = await validator.validate(visitorData, hostUserId);
        validationResults[name] = result;
      } catch (error) {
        logger.error(`Validation ${name} failed:`, error);
        throw error;
      }
    }
    
    logger.debug('All validations passed');
    return validationResults;
  }

  async processVisitorRegistration(visitorData, hostUserId) {
    logger.debug(`Processing visitor registration for ${visitorData.email}`);
    
    // Process registration
    const registration = await this.processors.registration.process(visitorData);
    
    // Process notifications
    const notifications = await this.processors.notification.process(visitorData);
    
    // Process access
    const access = await this.processors.access.process(visitorData);
    
    // Create visitor record
    const visitor = {
      ...visitorData,
      ...registration,
      hostUserId,
      access,
      notifications,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return visitor;
  }

  async checkInVisitor(visitorId, location = 'main_entrance') {
    try {
      const visitor = this.visitors.get(visitorId);
      
      if (!visitor) {
        throw new Error('Visitor not found');
      }
      
      if (visitor.status === 'checked_out') {
        throw new Error('Visitor has already checked out');
      }
      
      // Update visitor status
      visitor.status = 'checked_in';
      visitor.lastCheckIn = new Date().toISOString();
      visitor.currentLocation = location;
      visitor.updatedAt = new Date().toISOString();
      
      // Log the check-in
      await this.logVisitorActivity(visitorId, 'check_in', null, { location });
      
      logger.info(`Visitor ${visitorId} checked in at ${location}`);
      return { success: true, visitor };
    } catch (error) {
      logger.error(`Failed to check in visitor ${visitorId}:`, error);
      throw error;
    }
  }

  async checkOutVisitor(visitorId, location = 'main_entrance') {
    try {
      const visitor = this.visitors.get(visitorId);
      
      if (!visitor) {
        throw new Error('Visitor not found');
      }
      
      if (visitor.status === 'checked_out') {
        throw new Error('Visitor has already checked out');
      }
      
      // Update visitor status
      visitor.status = 'checked_out';
      visitor.lastCheckOut = new Date().toISOString();
      visitor.checkOutLocation = location;
      visitor.updatedAt = new Date().toISOString();
      
      // Calculate visit duration
      if (visitor.lastCheckIn) {
        const checkIn = new Date(visitor.lastCheckIn);
        const checkOut = new Date(visitor.lastCheckOut);
        visitor.visitDuration = Math.round((checkOut - checkIn) / (1000 * 60)); // minutes
      }
      
      // Log the check-out
      await this.logVisitorActivity(visitorId, 'check_out', null, { location });
      
      logger.info(`Visitor ${visitorId} checked out at ${location}`);
      return { success: true, visitor };
    } catch (error) {
      logger.error(`Failed to check out visitor ${visitorId}:`, error);
      throw error;
    }
  }

  async getVisitorById(visitorId) {
    return this.visitors.get(visitorId);
  }

  async getVisitorsByHost(hostUserId, filters = {}) {
    const hostVisitors = [];
    
    for (const [id, visitor] of this.visitors) {
      if (visitor.hostUserId === hostUserId) {
        // Apply filters
        if (filters.status && visitor.status !== filters.status) continue;
        if (filters.type && visitor.type !== filters.type) continue;
        if (filters.date && !this.isVisitorOnDate(visitor, filters.date)) continue;
        
        hostVisitors.push(visitor);
      }
    }
    
    return hostVisitors.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getCurrentVisitors() {
    const currentVisitors = [];
    
    for (const [id, visitor] of this.visitors) {
      if (visitor.status === 'checked_in') {
        currentVisitors.push(visitor);
      }
    }
    
    return currentVisitors;
  }

  async updateVisitor(visitorId, updates) {
    try {
      const visitor = this.visitors.get(visitorId);
      
      if (!visitor) {
        throw new Error('Visitor not found');
      }
      
      // Apply updates
      Object.assign(visitor, updates);
      visitor.updatedAt = new Date().toISOString();
      
      // Log the update
      await this.logVisitorActivity(visitorId, 'update', null, { updates });
      
      logger.info(`Visitor ${visitorId} updated`);
      return { success: true, visitor };
    } catch (error) {
      logger.error(`Failed to update visitor ${visitorId}:`, error);
      throw error;
    }
  }

  async extendVisitorAccess(visitorId, extensionHours) {
    try {
      const visitor = this.visitors.get(visitorId);
      
      if (!visitor) {
        throw new Error('Visitor not found');
      }
      
      // Extend access validity
      const currentValidUntil = new Date(visitor.access.validUntil);
      const newValidUntil = new Date(currentValidUntil.getTime() + extensionHours * 60 * 60 * 1000);
      
      visitor.access.validUntil = newValidUntil.toISOString();
      visitor.updatedAt = new Date().toISOString();
      
      // Log the extension
      await this.logVisitorActivity(visitorId, 'access_extended', null, { extensionHours });
      
      logger.info(`Visitor ${visitorId} access extended by ${extensionHours} hours`);
      return { success: true, visitor };
    } catch (error) {
      logger.error(`Failed to extend visitor ${visitorId} access:`, error);
      throw error;
    }
  }

  async logVisitorActivity(visitorId, activity, userId = null, metadata = {}) {
    const logEntry = {
      id: `log_${Date.now()}`,
      visitorId,
      activity,
      userId,
      timestamp: new Date().toISOString(),
      metadata
    };
    
    if (!this.accessLogs.has(visitorId)) {
      this.accessLogs.set(visitorId, []);
    }
    
    this.accessLogs.get(visitorId).push(logEntry);
    
    logger.debug(`Logged visitor activity: ${activity} for ${visitorId}`);
  }

  async getVisitorActivityLog(visitorId, filters = {}) {
    const logs = this.accessLogs.get(visitorId) || [];
    
    // Apply filters
    let filteredLogs = logs;
    
    if (filters.activity) {
      filteredLogs = filteredLogs.filter(log => log.activity === filters.activity);
    }
    
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startDate);
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endDate);
    }
    
    return filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async getVisitorStatistics(filters = {}) {
    const stats = {
      totalVisitors: 0,
      currentVisitors: 0,
      checkedInToday: 0,
      averageVisitDuration: 0,
      topHosts: [],
      visitorTypes: {}
    };
    
    const today = new Date().toDateString();
    
    for (const [id, visitor] of this.visitors) {
      stats.totalVisitors++;
      
      if (visitor.status === 'checked_in') {
        stats.currentVisitors++;
      }
      
      if (visitor.lastCheckIn && new Date(visitor.lastCheckIn).toDateString() === today) {
        stats.checkedInToday++;
      }
      
      // Count visitor types
      const type = visitor.type || 'unknown';
      stats.visitorTypes[type] = (stats.visitorTypes[type] || 0) + 1;
    }
    
    // Calculate average visit duration
    let totalDuration = 0;
    let durationCount = 0;
    
    for (const [id, visitor] of this.visitors) {
      if (visitor.visitDuration) {
        totalDuration += visitor.visitDuration;
        durationCount++;
      }
    }
    
    if (durationCount > 0) {
      stats.averageVisitDuration = Math.round(totalDuration / durationCount);
    }
    
    return stats;
  }

  // Utility methods
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  generateBadgeNumber() {
    return `BADGE-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }

  async getHostPermissions(hostUserId) {
    // Mock implementation - would query database in production
    return {
      canHostVisitors: true,
      allowedVisitorTypes: this.visitorTypes,
      maxConcurrentVisitors: 5,
      canExtendAccess: true
    };
  }

  async performSecurityChecks(visitorData) {
    // Mock implementation - would perform real security checks in production
    const checks = {
      passed: Math.random() > 0.1, // 90% pass rate
      reason: null,
      checks: ['identity_verification', 'background_check', 'watchlist_check']
    };
    
    if (!checks.passed) {
      checks.reason = 'Background check failed';
    }
    
    return checks;
  }

  isVisitorOnDate(visitor, date) {
    const visitorDate = new Date(visitor.createdAt).toDateString();
    const targetDate = new Date(date).toDateString();
    return visitorDate === targetDate;
  }

  startBackgroundProcesses() {
    // Start background processes
    setInterval(async () => {
      try {
        await this.cleanupExpiredVisitors();
        await this.updateVisitorMetrics();
      } catch (error) {
        logger.error('Error in background processes:', error);
      }
    }, 15 * 60 * 1000); // Every 15 minutes
  }

  async cleanupExpiredVisitors() {
    logger.debug('Cleaning up expired visitors');
    
    const now = new Date();
    const expiredVisitors = [];
    
    for (const [id, visitor] of this.visitors) {
      if (visitor.access && new Date(visitor.access.validUntil) < now) {
        expiredVisitors.push(id);
      }
    }
    
    // Auto check-out expired visitors
    for (const id of expiredVisitors) {
      try {
        await this.checkOutVisitor(id, 'auto_expired');
      } catch (error) {
        logger.error(`Failed to auto check-out visitor ${id}:`, error);
      }
    }
    
    if (expiredVisitors.length > 0) {
      logger.info(`Auto checked-out ${expiredVisitors.length} expired visitors`);
    }
  }

  async updateVisitorMetrics() {
    logger.debug('Updating visitor metrics');
    
    // This would update real-time visitor metrics
    // For now, just log the update
    logger.debug('Visitor metrics updated');
  }
}
