import db from '../db.js';
import { logger } from '../logger.js';
import { normalizeTicketType } from './utils.js';

/**
 * Fetch a configuration value from the database by key.
 * @param {string} key - The configuration key.
 * @returns {Promise<object>} - The configuration value.
 */
export const fetchConfigByKey = (key) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT value FROM config WHERE key = $1';
    db.get(query, [key], (err, row) => {
      if (err) {
        return reject(new Error(`Database error: ${err.message}`));
      }
      if (!row) {
        return resolve(null);
      }
      try {
        const config = JSON.parse(row.value);
        resolve(config);
      } catch (parseError) {
        reject(new Error(`Invalid configuration format: ${parseError.message}`));
      }
    });
  });
};

/**
 * Delete a configuration by key.
 * @param {string} key - The configuration key.
 * @returns {Promise<number>} - The number of rows affected.
 */
export const deleteConfigByKey = (key) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM config WHERE key = $1';
    db.run(query, [key], function (err) {
      if (err) {
        return reject(new Error(`Database error: ${err.message}`));
      }
      resolve(this.changes);
    });
  });
};

/**
 * Generate a unique, type-based ticket ID using atomic per-type sequences.
 * Format: TYPE + six-digit number, e.g., INC000123
 */
export async function generateTypedTicketId(typeCode) {
  const type = normalizeTicketType(typeCode);
  return await db.transaction(async (client) => {
    const upsertSql = `
      INSERT INTO ticket_sequences (type_code, last_value)
      VALUES ($1, 1)
      ON CONFLICT (type_code) DO UPDATE SET last_value = ticket_sequences.last_value + 1
      RETURNING last_value;
    `;
    const res = await db.query(upsertSql, [type], { client });
    const nextVal = parseInt(res.rows[0].last_value, 10) || 1;
    return `${type}${String(nextVal).padStart(6, '0')}`;
  });
}

/**
 * Lookup SLA targets for a given type, urgency, and impact.
 */
export async function getSlaTargets(typeCode, urgency, impact) {
  try {
    const type = normalizeTicketType(typeCode);
    const res = await db.query(
      'SELECT response_minutes, resolution_minutes FROM sla_policies WHERE type_code = $1 AND urgency = $2 AND impact = $3',
      [type, (urgency || 'medium').toLowerCase(), (impact || 'medium').toLowerCase()]
    );
    if (res.rows && res.rows.length > 0) {
      return res.rows[0];
    }
    return null;
  } catch (err) {
    logger.warn('SLA lookup failed, using fallback heuristics', { error: err.message });
    return null;
  }
}

/**
 * Compute due date from SLA targets or fallback by priority.
 */
export function computeDueDate(now, priority, slaTargets) {
  const due = new Date(now);
  if (slaTargets?.resolution_minutes) {
    due.setMinutes(due.getMinutes() + parseInt(slaTargets.resolution_minutes, 10));
    return due;
  }
  switch (priority) {
    case 'critical':
      due.setHours(due.getHours() + 4); break;
    case 'high':
      due.setDate(due.getDate() + 1); break;
    case 'medium':
      due.setDate(due.getDate() + 3); break;
    default:
      due.setDate(due.getDate() + 7);
  }
  return due;
}

