import express from 'express';
import db from '../db.js';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { body } from 'express-validator';
const router = express.Router();

router.get('/', authenticateJWT, async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, form_schema, workflow_id FROM request_catalog_items');
    res.json(result.rows);
  } catch (err) {
    logger.error('Error fetching catalog items', err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

router.post('/', authenticateJWT, async (req, res) => {
  const { name, formSchema, workflowId } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO request_catalog_items (name, form_schema, workflow_id) VALUES ($1,$2,$3) RETURNING id, name, form_schema, workflow_id',
      [name, formSchema, workflowId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error('Error creating catalog item', err);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

router.put('/:id', authenticateJWT, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, formSchema, workflowId } = req.body;
  try {
    await db.query(
      'UPDATE request_catalog_items SET name=$1, form_schema=$2, workflow_id=$3 WHERE id=$4',
      [name, formSchema, workflowId, id]
    );
    res.json({ message: 'updated' });
  } catch (err) {
    logger.error('Error updating catalog item', err);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

router.delete('/:id', authenticateJWT, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await db.query('DELETE FROM request_catalog_items WHERE id=$1', [id]);
    res.json({ message: 'deleted' });
  } catch (err) {
    logger.error('Error deleting catalog item', err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Seed standard catalog items
router.post('/seed-defaults', authenticateJWT, async (req, res) => {
  try {
    if (!req.user?.roles?.includes('admin') && !req.user?.roles?.includes('superadmin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { workflows = {} } = req.body || {};
    const items = [
      { name: 'New Hardware', key: 'new_hardware', schema: {
        fields: [
          { id: 'requester_name', label: 'Your Name', type: 'text', autofill: 'user.name', required: true },
          { id: 'department', label: 'Department', type: 'text', autofill: 'user.department' },
          { id: 'hardware_type', label: 'Hardware Type', type: 'select', options: ['Laptop','Desktop','Monitor','Phone','Tablet','Accessory'], required: true },
          { id: 'justification', label: 'Business Justification', type: 'textarea', required: true }
        ]
      } },
      { name: 'New Software Item', key: 'new_software', schema: {
        fields: [
          { id: 'requester_name', label: 'Your Name', type: 'text', autofill: 'user.name', required: true },
          { id: 'software_name', label: 'Software Name', type: 'text', required: true },
          { id: 'license_count', label: 'License Count', type: 'number', min: 1, default: 1, required: true },
          { id: 'justification', label: 'Business Justification', type: 'textarea', required: true }
        ]
      } },
      { name: 'New Hire Request', key: 'new_hire', schema: {
        fields: [
          { id: 'manager_name', label: 'Manager Name', type: 'text', autofill: 'user.name', required: true },
          { id: 'hire_name', label: 'New Hire Name', type: 'text', required: true },
          { id: 'start_date', label: 'Start Date', type: 'date', required: true },
          { id: 'role', label: 'Role', type: 'text', required: true },
          { id: 'equipment', label: 'Equipment Needed', type: 'multiselect', options: ['Laptop','Monitor','Dock','Phone','Badge','VPN'] }
        ]
      } },
      { name: 'Access Request', key: 'access_request', schema: {
        fields: [
          { id: 'requester_name', label: 'Your Name', type: 'text', autofill: 'user.name', required: true },
          { id: 'system', label: 'System/Application', type: 'text', required: true },
          { id: 'access_level', label: 'Access Level', type: 'select', options: ['Read','Write','Admin'], required: true },
          { id: 'justification', label: 'Business Justification', type: 'textarea', required: true }
        ]
      } }
    ];

    const created = [];
    for (const item of items) {
      const workflowId = workflows[item.key] || null;
      const result = await db.query(
        'INSERT INTO request_catalog_items (name, form_schema, workflow_id) VALUES ($1,$2,$3) ON CONFLICT (name) DO NOTHING RETURNING id, name, form_schema, workflow_id',
        [item.name, JSON.stringify(item.schema), workflowId]
      );
      if (result.rows && result.rows[0]) created.push(result.rows[0]);
    }

    res.status(201).json({ success: true, created });
  } catch (err) {
    logger.error('Error seeding default catalog items', err);
    res.status(500).json({ error: 'Failed to seed defaults' });
  }
});

export default router;
