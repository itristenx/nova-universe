import express from 'express';
import { z } from 'zod';
import { authenticateJWT } from '../middleware/auth.js';
import { logger } from '../logger.js';
import { TicketService } from '../services/enhanced-ticket.service.js';

const router = express.Router();

// Validation schemas
const createServiceRequestSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.string().default('open'),
  userId: z.string().optional(),
  assigneeId: z.string().optional(),
});

const updateServiceRequestSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  assigneeId: z.string().optional(),
});

// GET /api/v1/service-requests - List service requests
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      state: req.query.state,
      priority: req.query.priority,
      category: req.query.category,
      assignedTo: req.query.assigned_to,
      search: req.query.search,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await TicketService.getTickets(filters, req.user);

    // Map to ServiceNow-style format
    const mappedTickets = result.tickets.map(ticket => ({
      id: ticket.id.toString(),
      number: ticket.number || ticket.ticketNumber || `SR${String(ticket.id).padStart(7, '0')}`,
      short_description: ticket.title,
      description: ticket.description,
      state: ticket.state?.toUpperCase() || ticket.status?.toUpperCase() || 'OPEN',
      priority: ticket.priority?.toUpperCase() || 'MEDIUM',
      urgency: ticket.urgency?.toUpperCase() || 'MEDIUM',
      impact: ticket.impact?.toUpperCase() || 'MEDIUM',
      category: ticket.category || 'General',
      requested_by: ticket.requestedBy || ticket.createdBy,
      assigned_to: ticket.assignedTo,
      created_at: ticket.createdAt,
      updated_at: ticket.updatedAt
    }));

    res.json({
      success: true,
      data: mappedTickets,
      pagination: {
        page: result.pagination?.currentPage || filters.page,
        limit: result.pagination?.itemsPerPage || filters.limit,
        total: result.pagination?.totalCount || mappedTickets.length,
        pages: result.pagination?.totalPages || Math.ceil((result.pagination?.totalCount || mappedTickets.length) / filters.limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching service requests:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch service requests',
      message: error.message 
    });
  }
});

// GET /api/v1/service-requests/:id - Get specific service request
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const include = req.query.include ? req.query.include.split(',') : [];
    
    const ticket = await TicketService.getTicketById(id, include, req.user);

    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        error: 'Service request not found' 
      });
    }

    // Map to ServiceNow-style format
    const mappedTicket = {
      id: ticket.id.toString(),
      number: ticket.number || ticket.ticketNumber || `SR${String(ticket.id).padStart(7, '0')}`,
      short_description: ticket.title,
      description: ticket.description,
      state: ticket.state?.toUpperCase() || ticket.status?.toUpperCase() || 'OPEN',
      priority: ticket.priority?.toUpperCase() || 'MEDIUM',
      urgency: ticket.urgency?.toUpperCase() || 'MEDIUM',
      impact: ticket.impact?.toUpperCase() || 'MEDIUM',
      category: ticket.category || 'General',
      requested_by: ticket.requestedBy || ticket.createdBy,
      assigned_to: ticket.assignedTo,
      created_at: ticket.createdAt,
      updated_at: ticket.updatedAt
    };

    res.json({
      success: true,
      data: mappedTicket
    });
  } catch (error) {
    logger.error('Error fetching service request:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch service request',
      message: error.message 
    });
  }
});

// POST /api/v1/service-requests - Create new service request
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const validatedData = createServiceRequestSchema.parse(req.body);

    // Map ServiceNow-style fields to internal format
    const ticketData = {
      title: validatedData.short_description || validatedData.title,
      description: validatedData.description,
      priority: validatedData.priority?.toLowerCase() || 'medium',
      urgency: validatedData.urgency?.toLowerCase() || 'medium',
      impact: validatedData.impact?.toLowerCase() || 'medium',
      category: validatedData.category || 'General',
      state: validatedData.state?.toLowerCase() || 'open',
      requestedById: validatedData.requested_by_id || req.user.id
    };

    const ticket = await TicketService.createTicket(ticketData, req.user);

    // Map to ServiceNow-style format
    const mappedTicket = {
      id: ticket.id.toString(),
      number: ticket.number || ticket.ticketNumber || `SR${String(ticket.id).padStart(7, '0')}`,
      short_description: ticket.title,
      description: ticket.description,
      state: ticket.state?.toUpperCase() || ticket.status?.toUpperCase() || 'OPEN',
      priority: ticket.priority?.toUpperCase() || 'MEDIUM',
      urgency: ticket.urgency?.toUpperCase() || 'MEDIUM',
      impact: ticket.impact?.toUpperCase() || 'MEDIUM',
      category: ticket.category || 'General',
      requested_by: ticket.requestedBy || ticket.createdBy,
      assigned_to: ticket.assignedTo,
      created_at: ticket.createdAt,
      updated_at: ticket.updatedAt
    };

    res.status(201).json({
      success: true,
      data: mappedTicket,
      message: 'Service request created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    logger.error('Error creating service request:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create service request',
      message: error.message 
    });
  }
});

// PUT /api/v1/service-requests/:id - Update service request
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateServiceRequestSchema.parse(req.body);

    // Map ServiceNow-style fields to internal format
    const updateData = {};
    if (validatedData.short_description) updateData.title = validatedData.short_description;
    if (validatedData.description) updateData.description = validatedData.description;
    if (validatedData.state) updateData.state = validatedData.state.toLowerCase();
    if (validatedData.priority) updateData.priority = validatedData.priority.toLowerCase();
    if (validatedData.urgency) updateData.urgency = validatedData.urgency.toLowerCase();
    if (validatedData.impact) updateData.impact = validatedData.impact.toLowerCase();
    if (validatedData.category) updateData.category = validatedData.category;
    if (validatedData.assigned_to_id) updateData.assignedToId = validatedData.assigned_to_id;

    const ticket = await TicketService.updateTicket(parseInt(id), updateData, req.user);

    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        error: 'Service request not found' 
      });
    }

    // Map to ServiceNow-style format
    const mappedTicket = {
      id: ticket.id.toString(),
      number: ticket.number || ticket.ticketNumber || `SR${String(ticket.id).padStart(7, '0')}`,
      short_description: ticket.title,
      description: ticket.description,
      state: ticket.state?.toUpperCase() || ticket.status?.toUpperCase() || 'OPEN',
      priority: ticket.priority?.toUpperCase() || 'MEDIUM',
      urgency: ticket.urgency?.toUpperCase() || 'MEDIUM',
      impact: ticket.impact?.toUpperCase() || 'MEDIUM',
      category: ticket.category || 'General',
      requested_by: ticket.requestedBy || ticket.createdBy,
      assigned_to: ticket.assignedTo,
      created_at: ticket.createdAt,
      updated_at: ticket.updatedAt
    };

    res.json({
      success: true,
      data: mappedTicket,
      message: 'Service request updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    logger.error('Error updating service request:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update service request',
      message: error.message 
    });
  }
});

// DELETE /api/v1/service-requests/:id - Delete service request
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await TicketService.deleteTicket(parseInt(id), req.user);

    if (!result) {
      return res.status(404).json({ 
        success: false, 
        error: 'Service request not found' 
      });
    }

    res.json({
      success: true,
      message: 'Service request deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting service request:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete service request',
      message: error.message 
    });
  }
});

export default router;