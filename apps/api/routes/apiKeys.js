import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// In-memory store for API keys (not persisted)
const apiKeys = [];

/**
 * GET /api/v1/api-keys
 * List API keys
 */
router.get('/api/v1/api-keys', (req, res) => {
  res.json(apiKeys);
});

/**
 * POST /api/v1/api-keys
 * Create a new API key
 */
router.post('/api/v1/api-keys', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const key = {
    id: uuidv4(),
    name,
    key: crypto.randomBytes(32).toString('hex'),
  };
  apiKeys.push(key);
  res.status(201).json(key);
});

/**
 * DELETE /api/v1/api-keys/:id
 * Delete an API key
 */
router.delete('/api/v1/api-keys/:id', (req, res) => {
  const { id } = req.params;
  const index = apiKeys.findIndex(k => k.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Not found' });
  }
  apiKeys.splice(index, 1);
  res.json({ success: true });
});

export default router;
