import { logger } from '../logger.js';

// Placeholder for Nova Local AI/ML
export async function localChat({ messages, model, temperature, maxTokens }) {
  const last = (messages || []).slice(-1)[0];
  const prompt = typeof last?.content === 'string' ? last.content : '';
  // Simple deterministic reply for now
  const reply = `Nova Local (${model || 'small'}) heard: ${prompt.substring(0, 200)}`;
  logger.info('local-ml chat called', { model, temperature, maxTokens });
  return { content: reply, raw: { provider: 'local', model } };
}