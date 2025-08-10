import express from 'express';
import { initializeMCPServer, handleMCPRequest } from '../utils/cosmo.js';

const router = express.Router();

// Health for MCP server
router.get('/health', async (req, res) => {
  try {
    await initializeMCPServer();
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ status: 'error', error: e.message });
  }
});

// Unified MCP request endpoint following basic MCP HTTP transport conventions
router.post('/request', async (req, res) => {
  try {
    const mcpRequest = req.body;
    const userId = req.user?.id || 'system';
    const tenantId = req.user?.tenantId || 'default';
    const response = await handleMCPRequest(userId, tenantId, mcpRequest);
    res.json(response);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;