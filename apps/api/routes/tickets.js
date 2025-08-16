import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../db.js';
import { generateTypedTicketId } from '../utils/dbUtils.js';
import { normalizeTicketType } from '../utils/utils.js';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';

const router = express.Router();

// Simple in-memory store to support environments without full DB schema
const memoryTickets = new Map();
const memoryComments = new Map();

// Legacy random ID generator kept for in-memory fallback only
function generateTicketNumber() {
  const n = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');
  return `INC${n}`;
}

// List tickets (protected)
router.get('/', authenticateJWT, createRateLimit(60 * 1000, 120), async (req, res) => {
  try {
    // Prefer DB if tickets table exists; otherwise return memory-backed tickets
    try {
      const result = await db.query(
        'SELECT id, ticket_id AS ticket_number, title, description, status, created_at FROM tickets ORDER BY created_at DESC LIMIT 100',
      );
      const tickets = (result.rows || []).map((r) => ({
        id: r.id,
        ticket_number: r.ticket_number || r.ticket_id,
        title: r.title,
        description: r.description,
        status: r.status || 'open',
        created_at: r.created_at,
      }));
      return res.json(tickets);
    } catch {
      return res.json(Array.from(memoryTickets.values()));
    }
  } catch (error) {
    logger.error('List tickets error', { error: error.message });
    res.status(500).json({ error: 'Failed to list tickets' });
  }
});

// Create ticket (protected)
router.post(
  '/',
  authenticateJWT,
  createRateLimit(60 * 1000, 60),
  [
    body('title').isString().isLength({ min: 1, max: 255 }).withMessage('Title is required'),
    body('description').isString().isLength({ min: 1 }).withMessage('Description is required'),
    body('priority')
      .optional()
      .isString()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid priority'),
    body('category').optional().isString(),
    body('type')
      .optional()
      .isString()
      .isIn(['INC', 'REQ', 'PRB', 'CHG', 'TASK', 'HR', 'OPS', 'ISAC', 'FB'])
      .withMessage('Invalid type code'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, priority = 'medium', category = 'technical', type } = req.body;
      const typeCode = normalizeTicketType(type || 'INC');
      const ticketNumber = await generateTypedTicketId(typeCode);

      // Attempt DB insert first
      try {
        const id = (await import('uuid')).v4();
        const now = new Date().toISOString();
        const result = await db.query(
          'INSERT INTO tickets (id, ticket_id, type_code, title, description, priority, status, requested_by_id, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id, ticket_id',
          [id, ticketNumber, typeCode, title, description, priority, 'open', req.user.id, now, now],
        );
        return res
          .status(201)
          .json({
            id: result.rows[0].id,
            type: typeCode,
            title,
            status: 'open',
            ticket_number: result.rows[0].ticket_id,
          });
      } catch {
        // Fallback to memory-backed ticket
        const id = (await import('crypto')).randomUUID();
        const ticket = {
          id,
          type: typeCode,
          title,
          description,
          status: 'open',
          ticket_number: ticketNumber,
        };
        memoryTickets.set(id, ticket);
        return res.status(201).json(ticket);
      }
    } catch (error) {
      logger.error('Create ticket error', { error: error.message });
      res.status(500).json({ error: 'Failed to create ticket' });
    }
  },
);

// Get ticket by id (protected)
router.get('/:id', authenticateJWT, createRateLimit(60 * 1000, 240), async (req, res) => {
  try {
    const { id } = req.params;
    try {
      const result = await db.query(
        'SELECT id, ticket_id AS ticket_number, title, description, status FROM tickets WHERE id = $1',
        [id],
      );
      if (result.rows && result.rows.length > 0) {
        const r = result.rows[0];
        return res.json({
          id: r.id,
          title: r.title,
          description: r.description,
          status: r.status || 'open',
          ticket_number: r.ticket_number || r.ticket_id,
        });
      }
    } catch {
      // ignore and try memory
    }

    const ticket = memoryTickets.get(id);
    if (!ticket) return res.status(404).json({ error: 'Not found' });
    return res.json(ticket);
  } catch (error) {
    logger.error('Get ticket error', { error: error.message });
    res.status(500).json({ error: 'Failed to get ticket' });
  }
});

// Update ticket (protected)
router.patch(
  '/:id',
  authenticateJWT,
  createRateLimit(60 * 1000, 120),
  [
    body('status')
      .optional()
      .isIn(['open', 'in_progress', 'resolved', 'closed', 'on_hold'])
      .withMessage('Invalid status'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { id } = req.params;
      const { status } = req.body;

      try {
        const updates = [];
        const values = [];
        let idx = 1;
        if (status) {
          updates.push(`status = $${idx++}`);
          values.push(status);
        }
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        const q = `UPDATE tickets SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, ticket_id, title, status`;
        const result = await db.query(q, values);
        if (result.rows && result.rows.length > 0) {
          const r = result.rows[0];
          return res.json({
            id: r.id,
            title: r.title,
            status: r.status,
            ticket_number: r.ticket_id,
          });
        }
      } catch {
        // ignore and update memory
      }

      const ticket = memoryTickets.get(id);
      if (!ticket) return res.status(404).json({ error: 'Not found' });
      if (status) ticket.status = status;
      memoryTickets.set(id, ticket);
      return res.json(ticket);
    } catch (error) {
      logger.error('Update ticket error', { error: error.message });
      res.status(500).json({ error: 'Failed to update ticket' });
    }
  },
);

// Add comment to ticket (protected)
router.post(
  '/:id/comments',
  authenticateJWT,
  createRateLimit(60 * 1000, 240),
  [
    body('content').isString().isLength({ min: 1, max: 5000 }).withMessage('Content is required'),
    body('type').optional().isIn(['public', 'internal']).withMessage('Invalid comment type'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { id } = req.params;
      const { content, type = 'internal' } = req.body;

      // Ensure ticket exists (memory fallback)
      let exists = false;
      try {
        const r = await db.query('SELECT 1 FROM tickets WHERE id = $1', [id]);
        exists = !!(r.rows && r.rows.length > 0);
      } catch {
        exists = memoryTickets.has(id);
      }
      if (!exists) return res.status(404).json({ error: 'Ticket not found' });

      const comment = { id: (await import('crypto')).randomUUID(), ticketId: id, content, type };
      if (!memoryComments.has(id)) memoryComments.set(id, []);
      memoryComments.get(id).push(comment);
      return res.status(201).json(comment);
    } catch (error) {
      logger.error('Add comment error', { error: error.message });
      res.status(500).json({ error: 'Failed to add comment' });
    }
  },
);

export default router;
