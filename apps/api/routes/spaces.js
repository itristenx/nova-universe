/**
 * Space Management API Routes
 * Provides space booking, metrics, and management endpoints
 */

import express from 'express';
import db from '../db.js';

const router = express.Router();

// Mock data for development
const mockSpaceMetrics = {
  totalSpaces: 145,
  availableSpaces: 23,
  occupiedSpaces: 98,
  maintenanceSpaces: 24,
  utilizationRate: 67.6,
  upcomingBookings: 15,
  overdue: 3,
  lastUpdated: new Date().toISOString()
};

const mockSpaces = [
  {
    id: 'conf-001',
    name: 'Conference Room A',
    type: 'conference',
    capacity: 12,
    status: 'available',
    floor: 1,
    building: 'Main',
    amenities: ['projector', 'whiteboard', 'video_conf'],
    currentBooking: null
  },
  {
    id: 'conf-002',
    name: 'Conference Room B',
    type: 'conference',
    capacity: 8,
    status: 'occupied',
    floor: 1,
    building: 'Main',
    amenities: ['projector', 'whiteboard'],
    currentBooking: {
      id: 'book-001',
      user: 'john.doe@company.com',
      title: 'Team Standup',
      startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    }
  },
  {
    id: 'desk-001',
    name: 'Desk 1A',
    type: 'desk',
    capacity: 1,
    status: 'available',
    floor: 1,
    building: 'Main',
    amenities: ['monitor', 'docking_station'],
    currentBooking: null
  },
  {
    id: 'desk-002',
    name: 'Desk 1B',
    type: 'desk',
    capacity: 1,
    status: 'maintenance',
    floor: 1,
    building: 'Main',
    amenities: ['monitor'],
    currentBooking: null
  }
];

const mockBookings = [
  {
    id: 'book-001',
    spaceId: 'conf-002',
    spaceName: 'Conference Room B',
    user: 'john.doe@company.com',
    userName: 'John Doe',
    title: 'Team Standup',
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    status: 'active',
    attendees: 5
  },
  {
    id: 'book-002',
    spaceId: 'conf-001',
    spaceName: 'Conference Room A',
    user: 'jane.smith@company.com',
    userName: 'Jane Smith',
    title: 'Client Meeting',
    startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: 'upcoming',
    attendees: 8
  },
  {
    id: 'book-003',
    spaceId: 'desk-001',
    spaceName: 'Desk 1A',
    user: 'mike.wilson@company.com',
    userName: 'Mike Wilson',
    title: 'Focus Work',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    status: 'upcoming',
    attendees: 1
  }
];

// Get space metrics
router.get('/metrics', async (req, res) => {
  try {
    // In a real implementation, this would query the database
    res.json({
      success: true,
      data: mockSpaceMetrics
    });
  } catch (error) {
    console.error('Error fetching space metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch space metrics'
    });
  }
});

// Get all spaces
router.get('/', async (req, res) => {
  try {
    const { type, status, floor, building } = req.query;
    let filteredSpaces = [...mockSpaces];
    
    if (type) {
      filteredSpaces = filteredSpaces.filter(space => space.type === type);
    }
    if (status) {
      filteredSpaces = filteredSpaces.filter(space => space.status === status);
    }
    if (floor) {
      filteredSpaces = filteredSpaces.filter(space => space.floor === parseInt(floor));
    }
    if (building) {
      filteredSpaces = filteredSpaces.filter(space => space.building === building);
    }
    
    res.json({
      success: true,
      data: filteredSpaces,
      total: filteredSpaces.length
    });
  } catch (error) {
    console.error('Error fetching spaces:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch spaces'
    });
  }
});

// Get space by ID
router.get('/:id', async (req, res) => {
  try {
    const space = mockSpaces.find(s => s.id === req.params.id);
    if (!space) {
      return res.status(404).json({
        success: false,
        error: 'Space not found'
      });
    }
    
    res.json({
      success: true,
      data: space
    });
  } catch (error) {
    console.error('Error fetching space:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch space'
    });
  }
});

// Create a new space
router.post('/', async (req, res) => {
  try {
    const { name, type, capacity, floor, building, amenities } = req.body;
    
    if (!name || !type || !capacity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, type, capacity'
      });
    }
    
    const newSpace = {
      id: `${type}-${Date.now()}`,
      name,
      type,
      capacity: parseInt(capacity),
      status: 'available',
      floor: parseInt(floor) || 1,
      building: building || 'Main',
      amenities: amenities || [],
      currentBooking: null
    };
    
    mockSpaces.push(newSpace);
    
    res.status(201).json({
      success: true,
      data: newSpace
    });
  } catch (error) {
    console.error('Error creating space:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create space'
    });
  }
});

// Update space
router.put('/:id', async (req, res) => {
  try {
    const spaceIndex = mockSpaces.findIndex(s => s.id === req.params.id);
    if (spaceIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Space not found'
      });
    }
    
    const updatedSpace = {
      ...mockSpaces[spaceIndex],
      ...req.body,
      id: req.params.id // Prevent ID changes
    };
    
    mockSpaces[spaceIndex] = updatedSpace;
    
    res.json({
      success: true,
      data: updatedSpace
    });
  } catch (error) {
    console.error('Error updating space:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update space'
    });
  }
});

// Delete space
router.delete('/:id', async (req, res) => {
  try {
    const spaceIndex = mockSpaces.findIndex(s => s.id === req.params.id);
    if (spaceIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Space not found'
      });
    }
    
    mockSpaces.splice(spaceIndex, 1);
    
    res.json({
      success: true,
      message: 'Space deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting space:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete space'
    });
  }
});

// Get bookings for a space
router.get('/:id/bookings', async (req, res) => {
  try {
    const spaceBookings = mockBookings.filter(b => b.spaceId === req.params.id);
    
    res.json({
      success: true,
      data: spaceBookings
    });
  } catch (error) {
    console.error('Error fetching space bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch space bookings'
    });
  }
});

// Create booking for a space
router.post('/:id/bookings', async (req, res) => {
  try {
    const { title, startTime, endTime, attendees, user, userName } = req.body;
    
    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, startTime, endTime'
      });
    }
    
    const space = mockSpaces.find(s => s.id === req.params.id);
    if (!space) {
      return res.status(404).json({
        success: false,
        error: 'Space not found'
      });
    }
    
    const newBooking = {
      id: `book-${Date.now()}`,
      spaceId: req.params.id,
      spaceName: space.name,
      user: user || 'unknown@company.com',
      userName: userName || 'Unknown User',
      title,
      startTime,
      endTime,
      status: new Date(startTime) <= new Date() ? 'active' : 'upcoming',
      attendees: attendees || 1
    };
    
    mockBookings.push(newBooking);
    
    res.status(201).json({
      success: true,
      data: newBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking'
    });
  }
});

// Get all bookings
router.get('/bookings/all', async (req, res) => {
  try {
    const { status, user, date } = req.query;
    let filteredBookings = [...mockBookings];
    
    if (status) {
      filteredBookings = filteredBookings.filter(b => b.status === status);
    }
    if (user) {
      filteredBookings = filteredBookings.filter(b => b.user.includes(user));
    }
    if (date) {
      const targetDate = new Date(date);
      filteredBookings = filteredBookings.filter(b => {
        const bookingDate = new Date(b.startTime);
        return bookingDate.toDateString() === targetDate.toDateString();
      });
    }
    
    res.json({
      success: true,
      data: filteredBookings,
      total: filteredBookings.length
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    });
  }
});

// Cancel booking
router.delete('/bookings/:bookingId', async (req, res) => {
  try {
    const bookingIndex = mockBookings.findIndex(b => b.id === req.params.bookingId);
    if (bookingIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    mockBookings.splice(bookingIndex, 1);
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel booking'
    });
  }
});

// Get occupancy data
router.get('/occupancy/current', async (req, res) => {
  try {
    const occupancyData = {
      timestamp: new Date().toISOString(),
      totalCapacity: mockSpaces.reduce((sum, space) => sum + space.capacity, 0),
      currentOccupancy: mockBookings
        .filter(b => b.status === 'active')
        .reduce((sum, booking) => sum + booking.attendees, 0),
      utilizationByFloor: {
        1: {
          capacity: mockSpaces.filter(s => s.floor === 1).reduce((sum, s) => sum + s.capacity, 0),
          occupied: mockBookings
            .filter(b => b.status === 'active')
            .filter(b => mockSpaces.find(s => s.id === b.spaceId)?.floor === 1)
            .reduce((sum, b) => sum + b.attendees, 0)
        }
      },
      utilizationByType: {
        conference: {
          total: mockSpaces.filter(s => s.type === 'conference').length,
          occupied: mockBookings
            .filter(b => b.status === 'active')
            .filter(b => mockSpaces.find(s => s.id === b.spaceId)?.type === 'conference')
            .length
        },
        desk: {
          total: mockSpaces.filter(s => s.type === 'desk').length,
          occupied: mockBookings
            .filter(b => b.status === 'active')
            .filter(b => mockSpaces.find(s => s.id === b.spaceId)?.type === 'desk')
            .length
        }
      }
    };
    
    res.json({
      success: true,
      data: occupancyData
    });
  } catch (error) {
    console.error('Error fetching occupancy data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch occupancy data'
    });
  }
});

// Get floor plan data (placeholder for future implementation)
router.get('/floorplan/:floor', async (req, res) => {
  try {
    const floor = parseInt(req.params.floor);
    const floorSpaces = mockSpaces.filter(s => s.floor === floor);
    
    const floorPlan = {
      floor,
      spaces: floorSpaces.map(space => ({
        ...space,
        coordinates: { x: Math.random() * 800, y: Math.random() * 600 }, // Mock coordinates
        dimensions: { width: 50, height: 40 } // Mock dimensions
      })),
      layout: {
        width: 800,
        height: 600,
        scale: 1
      }
    };
    
    res.json({
      success: true,
      data: floorPlan
    });
  } catch (error) {
    console.error('Error fetching floor plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch floor plan'
    });
  }
});

export default router;
