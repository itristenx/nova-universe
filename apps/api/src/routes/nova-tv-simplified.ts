import express from 'express';
import { v4 as uuid } from 'uuid';
import db from '../../db.js';
import { logger } from '../../logger.js';

const router = express.Router();

// Production database operations for Nova TV dashboards

// Auth middleware (basic implementation)
const requireAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // For now, we'll use a simple user ID extraction
  // In production, this would verify JWT tokens
  req.user = { id: 'user-1', email: 'admin@nova.com', name: 'Nova Admin' };
  next();
};

// Dashboard routes
router.get('/dashboards', requireAuth, async (req: any, res: any) => {
  try {
    const { department, createdBy, isActive } = req.query;

    // Build WHERE conditions
    const whereConditions = [];
    const params = [];
    let paramCount = 0;

    if (department) {
      paramCount++;
      whereConditions.push(`department = $${paramCount}`);
      params.push(department);
    }
    if (createdBy) {
      paramCount++;
      whereConditions.push(`created_by = $${paramCount}`);
      params.push(createdBy);
    }
    if (isActive !== undefined) {
      paramCount++;
      whereConditions.push(`is_active = $${paramCount}`);
      params.push(isActive === 'true');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
      SELECT d.*, u.name as creator_name, u.email as creator_email
      FROM nova_tv_dashboards d
      LEFT JOIN users u ON d.created_by = u.id
      ${whereClause}
      ORDER BY d.created_at DESC
    `;

    const result = await db.query(query, params);
    res.json(result.rows || []);
  } catch (error) {
    logger.error('Error fetching dashboards:', error);
    res.status(500).json({ error: 'Failed to fetch dashboards' });
  }
});

router.get('/dashboards/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT d.*, u.name as creator_name, u.email as creator_email
      FROM nova_tv_dashboards d
      LEFT JOIN users u ON d.created_by = u.id
      WHERE d.id = $1
    `;

    const result = await db.query(query, [id]);
    const dashboard = result.rows?.[0];

    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    res.json(dashboard);
  } catch (error) {
    logger.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

router.post('/dashboards', requireAuth, async (req: any, res: any) => {
  try {
    const { name, description, department, configuration, isActive, isPublic } = req.body;
    const dashboardId = uuid();

    const query = `
      INSERT INTO nova_tv_dashboards (
        id, name, description, department, configuration, 
        is_active, is_public, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `;

    const result = await db.query(query, [
      dashboardId,
      name,
      description,
      department,
      JSON.stringify(configuration),
      isActive !== false,
      isPublic === true,
      req.user.id
    ]);

    const dashboard = result.rows?.[0];

    logger.info('Created Nova TV dashboard:', {
      dashboardId: dashboard.id,
      name: dashboard.name,
    });
    res.status(201).json(dashboard);
  } catch (error) {
    logger.error('Error creating dashboard:', error);
    res.status(500).json({ error: 'Failed to create dashboard' });
  }
});

export default router;