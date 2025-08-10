import express from 'express';
import { sendChat, getDefaultModel, getDefaultProvider } from '../services/ai-fabric.js';

const router = express.Router();

router.get('/providers', async (req, res) => {
  res.json({
    defaultProvider: getDefaultProvider(),
    defaultModel: getDefaultModel(),
    providers: ['openai', 'local']
  });
});

router.post('/chat', async (req, res) => {
  try {
    const { messages, provider, model, temperature, maxTokens, systemPrompt, metadata } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }
    const result = await sendChat({
      messages,
      provider,
      model,
      temperature,
      maxTokens,
      systemPrompt,
      user: req.user,
      tenantId: req.user?.tenantId || null,
      metadata,
    });
    res.json({ message: result.content, provider: provider || getDefaultProvider(), model: model || getDefaultModel() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;