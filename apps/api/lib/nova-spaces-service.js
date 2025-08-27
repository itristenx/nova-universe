/**
 * Enhanced Nova Spaces Service
 * Advanced space management system competing with Maptician
 * Includes room booking, space analytics, visitor management, and integrations
 */

import { EventEmitter } from 'events';
import { logger } from '../logger.js';
import { SpaceAnalytics } from './analytics/spaces-analytics.js';
import { SpaceIntegrations } from './integrations/spaces-integrations.js';
import { BookingEngine } from './booking/booking-engine.js';
import { VisitorManager } from './visitors/visitor-manager.js';
import { IoTManager } from './iot/iot-manager.js';

/**
 * Nova Spaces Management Service
 * Enterprise-grade space management with advanced features
 */
export class NovaSpacesService extends EventEmitter {
  constructor() {
    super();
    this.initialized = false;
    this.analytics = new SpaceAnalytics();
    this.integrations = new SpaceIntegrations();
    this.bookingEngine = new BookingEngine();
    this.visitorManager = new VisitorManager();
    this.iotManager = new IoTManager();
  }

  /**
   * Initialize the spaces service
   */
  async initialize() {
    try {
      // Initialize sub-services
      await this.analytics.initialize();
      await this.integrations.initialize();
      await this.bookingEngine.initialize();
      await this.visitorManager.initialize();
      await this.iotManager.initialize();

      this.initialized = true;
      logger.info('Nova Spaces Service initialized successfully');

      // Start background processes
      this.startBackgroundTasks();
    } catch (error) {
      logger.error('Failed to initialize Nova Spaces Service:', error);
      throw error;
    }
  }

  // =====================================
  // BUILDING & SPACE MANAGEMENT
  // =====================================

  /**
   * Get all buildings with optional filtering
   */
  async getBuildings(filters = {}) {
    try {
      const { search, city, country } = filters;

      // Mock implementation - would query database in production
      const buildings = [
        {
          id: 'building_1',
          name: 'Main Office',
          address: '123 Business St',
          city: 'Tech City',
          country: 'USA',
          floors: 5,
          totalSpaces: 25,
          totalVisitors: 12
        },
        {
          id: 'building_2',
          name: 'Innovation Center',
          address: '456 Innovation Ave',
          city: 'Tech City',
          country: 'USA',
          floors: 3,
          totalSpaces: 15,
          totalVisitors: 8
        }
      ];

      // Apply filters
      let filteredBuildings = buildings;
      
      if (search) {
        filteredBuildings = filteredBuildings.filter(building => 
          building.name.toLowerCase().includes(search.toLowerCase()) ||
          building.address.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (city) {
        filteredBuildings = filteredBuildings.filter(building => 
          building.city.toLowerCase() === city.toLowerCase()
        );
      }
      
      if (country) {
        filteredBuildings = filteredBuildings.filter(building => 
          building.country.toLowerCase() === country.toLowerCase()
        );
      }

      return {
        buildings: filteredBuildings,
        total: filteredBuildings.length,
        filters
      };
    } catch (error) {
      logger.error('Failed to get buildings:', error);
      throw error;
    }
  }

  /**
   * Get building details by ID
   */
  async getBuildingById(buildingId) {
    try {
      // Mock implementation - would query database in production
      const building = {
        id: buildingId,
        name: 'Main Office',
        address: '123 Business St',
        city: 'Tech City',
        country: 'USA',
        floors: [
          {
            id: 'floor_1',
            name: 'Ground Floor',
            spaces: [
              { id: 'space_1', name: 'Lobby', status: 'public' },
              { id: 'space_2', name: 'Reception', status: 'public' }
            ]
          },
          {
            id: 'floor_2',
            name: 'First Floor',
            spaces: [
              { id: 'space_3', name: 'Conference Room A', status: 'bookable' },
              { id: 'space_4', name: 'Meeting Room B', status: 'bookable' }
            ]
          }
        ]
      };

      return building;
    } catch (error) {
      logger.error(`Failed to get building ${buildingId}:`, error);
      throw error;
    }
  }

  /**
   * Get all spaces with optional filtering
   */
  async getSpaces(filters = {}) {
    try {
      const { buildingId, floorId, type, status, capacity } = filters;

      // Mock implementation - would query database in production
      const spaces = [
        {
          id: 'space_1',
          name: 'Conference Room A',
          buildingId: 'building_1',
          floorId: 'floor_2',
          type: 'conference',
          status: 'available',
          capacity: 20,
          amenities: ['projector', 'whiteboard', 'video_conferencing']
        },
        {
          id: 'space_2',
          name: 'Meeting Room B',
          buildingId: 'building_1',
          floorId: 'floor_2',
          type: 'meeting',
          status: 'booked',
          capacity: 8,
          amenities: ['whiteboard', 'video_conferencing']
        }
      ];

      // Apply filters
      let filteredSpaces = spaces;
      
      if (buildingId) {
        filteredSpaces = filteredSpaces.filter(space => space.buildingId === buildingId);
      }
      
      if (floorId) {
        filteredSpaces = filteredSpaces.filter(space => space.floorId === floorId);
      }
      
      if (type) {
        filteredSpaces = filteredSpaces.filter(space => space.type === type);
      }
      
      if (status) {
        filteredSpaces = filteredSpaces.filter(space => space.status === status);
      }
      
      if (capacity) {
        filteredSpaces = filteredSpaces.filter(space => space.capacity >= capacity);
      }

      return {
        spaces: filteredSpaces,
        total: filteredSpaces.length,
        filters
      };
    } catch (error) {
      logger.error('Failed to get spaces:', error);
      throw error;
    }
  }

  /**
   * Get space details by ID
   */
  async getSpaceById(spaceId) {
    try {
      // Mock implementation - would query database in production
      const space = {
        id: spaceId,
        name: 'Conference Room A',
        buildingId: 'building_1',
        floorId: 'floor_2',
        type: 'conference',
        status: 'available',
        capacity: 20,
        amenities: ['projector', 'whiteboard', 'video_conferencing'],
        currentBookings: [],
        schedule: {
          monday: { open: '08:00', close: '18:00' },
          tuesday: { open: '08:00', close: '18:00' },
          wednesday: { open: '08:00', close: '18:00' },
          thursday: { open: '08:00', close: '18:00' },
          friday: { open: '08:00', close: '18:00' }
        }
      };

      return space;
    } catch (error) {
      logger.error(`Failed to get space ${spaceId}:`, error);
      throw error;
    }
  }

  // =====================================
  // BOOKING MANAGEMENT
  // =====================================

  /**
   * Create a new space booking
   */
  async createBooking(bookingData, userId) {
    try {
      return await this.bookingEngine.createBooking(bookingData, userId);
    } catch (error) {
      logger.error('Failed to create booking:', error);
      throw error;
    }
  }

  /**
   * Check space availability
   */
  async checkAvailability(spaceId, startTime, endTime, options = {}) {
    try {
      return await this.bookingEngine.checkAvailability(spaceId, startTime, endTime, options);
    } catch (error) {
      logger.error('Failed to check availability:', error);
      throw error;
    }
  }

  /**
   * Find alternative spaces
   */
  async findAlternativeSpaces(criteria) {
    try {
      return await this.bookingEngine.findAlternativeSpaces(criteria);
    } catch (error) {
      logger.error('Failed to find alternative spaces:', error);
      throw error;
    }
  }

  // =====================================
  // VISITOR MANAGEMENT
  // =====================================

  /**
   * Register a new visitor
   */
  async registerVisitor(visitorData, hostUserId) {
    try {
      return await this.visitorManager.registerVisitor(visitorData, hostUserId);
    } catch (error) {
      logger.error('Failed to register visitor:', error);
      throw error;
    }
  }

  /**
   * Check in a visitor
   */
  async checkInVisitor(visitorId, location = 'main_entrance') {
    try {
      return await this.visitorManager.checkInVisitor(visitorId, location);
    } catch (error) {
      logger.error('Failed to check in visitor:', error);
      throw error;
    }
  }

  /**
   * Check out a visitor
   */
  async checkOutVisitor(visitorId, location = 'main_entrance') {
    try {
      return await this.visitorManager.checkOutVisitor(visitorId, location);
    } catch (error) {
      logger.error('Failed to check out visitor:', error);
      throw error;
    }
  }

  // =====================================
  // ANALYTICS & METRICS
  // =====================================

  /**
   * Get space metrics
   */
  async getSpaceMetrics(filters = {}) {
    try {
      return await this.analytics.getSpaceMetrics(filters);
    } catch (error) {
      logger.error('Failed to get space metrics:', error);
      throw error;
    }
  }

  /**
   * Get utilization report
   */
  async getUtilizationReport(spaceId, period = 'week') {
    try {
      return await this.analytics.getUtilizationReport(spaceId, period);
    } catch (error) {
      logger.error('Failed to get utilization report:', error);
      throw error;
    }
  }

  // =====================================
  // INTEGRATIONS
  // =====================================

  /**
   * Sync calendars for a user
   */
  async syncCalendars(userId) {
    try {
      return await this.integrations.syncCalendars(userId);
    } catch (error) {
      logger.error('Failed to sync calendars:', error);
      throw error;
    }
  }

  /**
   * Create meeting for a booking
   */
  async createMeetingForBooking(bookingId, platform) {
    try {
      return await this.integrations.createMeetingForBooking(bookingId, platform);
    } catch (error) {
      logger.error('Failed to create meeting for booking:', error);
      throw error;
    }
  }

  // =====================================
  // IoT & SMART BUILDING
  // =====================================

  /**
   * Register an IoT device
   */
  async registerIoTDevice(deviceData) {
    try {
      return await this.iotManager.registerDevice(deviceData);
    } catch (error) {
      logger.error('Failed to register IoT device:', error);
      throw error;
    }
  }

  /**
   * Get IoT system health
   */
  async getIoTSystemHealth() {
    try {
      return await this.iotManager.getSystemHealth();
    } catch (error) {
      logger.error('Failed to get IoT system health:', error);
      throw error;
    }
  }

  // =====================================
  // BACKGROUND TASKS
  // =====================================

  startBackgroundTasks() {
    // Start calendar sync every 15 minutes
    setInterval(async () => {
      try {
        if (this.initialized) {
          await this.integrations.syncAllCalendars();
        }
      } catch (error) {
        logger.error('Error in calendar sync:', error);
      }
    }, 15 * 60 * 1000); // Every 15 minutes
  }

  // =====================================
  // UTILITY METHODS
  // =====================================

  /**
   * Get service status
   */
  async getStatus() {
    return {
      initialized: this.initialized,
      services: {
        analytics: this.analytics.initialized,
        integrations: this.integrations.initialized,
        booking: this.bookingEngine.initialized,
        visitor: this.visitorManager.initialized,
        iot: this.iotManager.initialized
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const status = await this.getStatus();
      const allServicesHealthy = Object.values(status.services).every(healthy => healthy);
      
      return {
        healthy: allServicesHealthy,
        status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Health check failed:', error);
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
