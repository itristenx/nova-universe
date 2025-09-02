import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { verify } from '../jwt.js';
import { aiFabric } from '../lib/ai-fabric.js';
import { sendMessage, startConversation, getConversationHistory } from '../utils/cosmo.js';

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
  } catch (_error) {
    console.error('AI query failed:', _error.message);
    res.status(500).json({ success: false, error: 'AI query failed' });
  }
});

// POST /cosmo/chat - Enhanced chat endpoint with conversation support
router.post('/chat', kioskOrAuth, async (req, res) => {
  try {
    const { message, conversationId, context = {} } = req.body || {};
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing message' });
    }

    const userId = req.user ? req.user.id : 'anonymous';
    const tenantId = req.user ? req.user.tenant_id : 'default';

    // Enhanced context with webpage information
    const enhancedContext = {
      ...context,
      userId,
      tenantId,
      timestamp: new Date().toISOString()
    };

    let response;
    let responseData;

    try {
      // Try to use the Cosmo utility for conversation management
      if (conversationId) {
        response = await sendMessage(conversationId, userId, message, enhancedContext);
      } else {
        const newConversationId = `conv_${Date.now()}_${userId}`;
        response = await startConversation(newConversationId, userId, tenantId, enhancedContext, message);
      }
      
      responseData = {
        response: response.message,
        conversationId: response.conversationId || conversationId,
        intent: response.metadata?.intent,
        confidence: response.metadata?.confidence || 0.8,
        sources: response.metadata?.sources || [],
        suggestedActions: response.actions?.map(a => a.type) || []
      };
    } catch (cosmoError) {
      console.warn('Cosmo utility not available, using AI Fabric fallback:', cosmoError.message);
      
      // Fallback to AI Fabric
      const aiResponse = await aiFabric.processRequest({
        type: 'chat',
        input: message,
        context: { 
          module: 'cosmo', 
          ...enhancedContext,
          // Include webpage context for AI processing
          pageContext: enhancedContext.pageContext
        },
        metadata: { source: 'cosmo_chat_api' },
        timestamp: new Date(),
      });

      // Generate contextual response based on page context
      let contextualResponse = aiResponse.result;
      if (enhancedContext.pageContext) {
        const { pageContext } = enhancedContext;
        if (pageContext.type === 'knowledge') {
          contextualResponse = `I can see you're viewing "${pageContext.title}" in the knowledge base. ${aiResponse.result}`;
          if (pageContext.content) {
            contextualResponse += ` Based on the article content, I can help explain specific concepts or troubleshoot any issues you might encounter with the steps described.`;
          }
        } else if (pageContext.type === 'ticket') {
          contextualResponse = `I notice you're working on a ticket. ${aiResponse.result} I can help analyze the ticket details or suggest solutions.`;
        } else if (pageContext.type === 'dashboard') {
          contextualResponse = `I can see you're on the dashboard. ${aiResponse.result} I can help with system insights or specific metrics you'd like to explore.`;
        }
      }

      responseData = {
        response: contextualResponse,
        conversationId: conversationId || `conv_${Date.now()}_${userId}`,
        intent: 'general_inquiry',
        confidence: 0.75,
        sources: ['Knowledge Base', 'System Context'],
        suggestedActions: ['View Documentation', 'Get Help']
      };
    }

    res.json({
      success: true,
      ...responseData
    });

  } catch (error) {
    console.error('Chat request failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Chat request failed',
      response: "I'm sorry, I'm having trouble processing your request right now. Please try again later."
    });
  }
});

// GET /cosmo/conversations - Get conversation history
router.get('/conversations', kioskOrAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 'anonymous';
    
    try {
      const conversations = await getConversationHistory(null, userId);
      res.json({
        success: true,
        conversations: conversations || []
      });
    } catch (error) {
      console.warn('Conversation history not available:', error.message);
      // Return empty array if service not available
      res.json({
        success: true,
        conversations: []
      });
    }
  } catch (error) {
    console.error('Failed to get conversations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get conversations',
      conversations: []
    });
  }
});

export default router;
