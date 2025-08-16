import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { verify } from '../jwt.js';
import { aiFabric } from '../lib/ai-fabric.js';

const router = express.Router();

function kioskOrAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '');
  const payload = token && verify(token);
  const isKiosk = payload && payload.type === 'kiosk';
  if (isKiosk) return next();
  return authenticateJWT(req, res, next);
}

// POST /cosmo/query
router.post('/query', kioskOrAuth, async (req, res) => {
  try {
    const { message, context = {}, options = {} } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing message' });
    }

    const userContext = req.user ? { userId: req.user.id, tenantId: req.user.tenant_id } : {};

    const response = await aiFabric.processRequest({
      type: 'chat',
      input: message,
      context: { module: 'cosmo', ...userContext, ...context },
      preferences: options,
      metadata: { source: 'cosmo_api' },
      timestamp: new Date(),
    });

    res.json({
      success: true,
      result: response.result,
      metadata: response.metadata,
      provider: response.provider,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'AI query failed' });
  }
});

export default router;
