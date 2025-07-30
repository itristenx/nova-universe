import express from 'express';
import db from '../db.js';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
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

export default router;
