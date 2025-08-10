import dotenv from 'dotenv';
import { logger } from '../logger.js';
import db from '../db.js';

dotenv.config();

const DEFAULT_PROVIDER = process.env.NOVA_AI_DEFAULT_PROVIDER || 'openai';
const DEFAULT_MODEL = process.env.NOVA_AI_DEFAULT_MODEL || 'gpt-4o-mini';

export const AiProviders = {
  OPENAI: 'openai',
  LOCAL: 'local',
};

let openaiModule = null;
async function ensureOpenAI() {
  if (!openaiModule) {
    try {
      const mod = await import('openai');
      openaiModule = mod.default || mod;
    } catch (err) {
      throw new Error('OpenAI SDK not installed. Please add the "openai" package.');
    }
  }
  return openaiModule;
}

async function getProviderClient(provider = DEFAULT_PROVIDER) {
  switch (provider) {
    case AiProviders.OPENAI: {
      const OpenAIClient = await ensureOpenAI();
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not configured');
      }
      const baseURL = process.env.OPENAI_BASE_URL; // support Azure or proxy
      const organization = process.env.OPENAI_ORG;
      return new OpenAIClient({ apiKey, baseURL, organization });
    }
    case AiProviders.LOCAL: {
      return null; // handled separately via local-ml
    }
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

function redactPII(text) {
  if (!text) return text;
  let result = String(text);
  result = result.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]');
  result = result.replace(/\b\+?\d{1,3}?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[REDACTED_PHONE]');
  result = result.replace(/\b(?:\d[ -]*?){13,19}\b/g, '[REDACTED_CC]');
  return result;
}

function redactPIIMessages(messages) {
  try {
    return (messages || []).map((m) => ({
      ...m,
      content: typeof m.content === 'string' ? redactPII(m.content) : m.content,
    }));
  } catch {
    return messages;
  }
}

async function logAiEvent(event) {
  try {
    await db.query(
      `INSERT INTO ai_audit_events (
        id, event_type, actor_type, actor_id, tenant_id, provider, model,
        request_payload, response_metadata, created_at, pii_redacted,
        tokens_in, tokens_out, cost_usd, success, error_message
      ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, CURRENT_TIMESTAMP, $9, $10, $11, $12, $13, $14)`,
      [
        event.eventType || 'chat.completion',
        event.actorType || 'user',
        event.actorId || null,
        event.tenantId || null,
        event.provider || DEFAULT_PROVIDER,
        event.model || DEFAULT_MODEL,
        JSON.stringify(event.request || {}),
        JSON.stringify(event.response || {}),
        !!event.piiRedacted,
        event.tokensIn || 0,
        event.tokensOut || 0,
        event.costUsd || 0,
        event.success !== false,
        event.errorMessage || null,
      ]
    );
  } catch (err) {
    try {
      await db.createAuditLog('ai_event', event.actorId || 'system', {
        provider: event.provider,
        model: event.model,
        eventType: event.eventType,
        success: event.success !== false,
      });
    } catch {}
    logger.warn('AI audit event log fallback used:', err.message);
  }
}

export async function sendChat({
  messages,
  provider = DEFAULT_PROVIDER,
  model = DEFAULT_MODEL,
  user,
  tenantId,
  temperature = 0.2,
  maxTokens,
  systemPrompt,
  metadata = {},
}) {
  const eventBase = {
    actorType: user ? 'user' : 'system',
    actorId: user?.id,
    tenantId,
    provider,
    model,
    eventType: 'chat.completion',
  };

  const piiRedacted = provider !== AiProviders.LOCAL;
  const safeMessages = piiRedacted ? redactPIIMessages(messages) : messages;
  const finalMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...(safeMessages || [])]
    : safeMessages;

  try {
    if (provider === AiProviders.OPENAI) {
      const client = await getProviderClient(provider);
      const response = await client.chat.completions.create({
        model,
        messages: finalMessages,
        temperature,
        max_tokens: maxTokens,
        user: user?.id || undefined,
      });

      const content = response.choices?.[0]?.message?.content || '';
      const usage = response.usage || {};

      await logAiEvent({
        ...eventBase,
        request: { messages: finalMessages, metadata },
        response: { id: response.id, usage, finish_reason: response.choices?.[0]?.finish_reason },
        piiRedacted,
        tokensIn: usage.prompt_tokens || 0,
        tokensOut: usage.completion_tokens || 0,
        costUsd: 0,
        success: true,
      });

      return { content, raw: response };
    }

    if (provider === AiProviders.LOCAL) {
      const { localChat } = await import('./local-ml.js');
      const result = await localChat({ messages: finalMessages, model, temperature, maxTokens });
      await logAiEvent({
        ...eventBase,
        request: { messages: finalMessages, metadata },
        response: { model, provider: 'local' },
        piiRedacted: false,
        tokensIn: 0,
        tokensOut: 0,
        success: true,
      });
      return { content: result.content, raw: result.raw };
    }

    throw new Error(`Unsupported provider: ${provider}`);
  } catch (error) {
    await logAiEvent({
      ...eventBase,
      request: { messages: finalMessages, metadata },
      response: { error: error.message },
      piiRedacted,
      success: false,
      errorMessage: error.message,
    });
    throw error;
  }
}

export function getDefaultModel() {
  return DEFAULT_MODEL;
}

export function getDefaultProvider() {
  return DEFAULT_PROVIDER;
}