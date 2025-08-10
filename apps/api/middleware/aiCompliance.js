import db from '../db.js';

export async function loadPolicies() {
  try {
    const { rows } = await db.query('SELECT id, name, config, enabled FROM ai_policies WHERE enabled = true');
    return rows || [];
  } catch {
    return [];
  }
}

export function attachComplianceHeaders(req, res, next) {
  res.setHeader('X-Nova-AI-Provider', process.env.NOVA_AI_DEFAULT_PROVIDER || 'openai');
  res.setHeader('X-Nova-AI-Model', process.env.NOVA_AI_DEFAULT_MODEL || 'gpt-4o-mini');
  next();
}