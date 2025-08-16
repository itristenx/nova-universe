// Backfill legacy ticket IDs (e.g., TKT-xxxxx) to type-based IDs (e.g., INC000123)
// Usage: NODE_OPTIONS=--experimental-modules node apps/api/scripts/backfill-ticket-ids.js
import db from '../db.js';
import { generateTypedTicketId } from '../utils/dbUtils.js';
import { logger } from '../logger.js';

function inferTypeCodeFromRow(row) {
  const cat = (row.category || '').toLowerCase();
  if (cat.includes('request') || cat.includes('access') || cat.includes('catalog')) return 'REQ';
  return 'INC';
}

async function backfillBatch(limit = 200) {
  const rows = await db.all(
    `SELECT id, ticket_id, category FROM tickets 
     WHERE ticket_id IS NULL OR ticket_id LIKE 'TKT-%' 
     ORDER BY created_at ASC LIMIT $1`,
    [limit],
  );
  if (!rows || rows.length === 0) return 0;

  for (const r of rows) {
    try {
      const typeCode = inferTypeCodeFromRow(r);
      const newTicketId = await generateTypedTicketId(typeCode);
      await db.run(
        `UPDATE tickets 
         SET legacy_ticket_id = ticket_id, ticket_id = $1, type_code = COALESCE(type_code, $2), updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3`,
        [newTicketId, typeCode, r.id],
      );
      logger.info('Backfilled ticket', { id: r.id, newTicketId, typeCode });
    } catch (e) {
      logger.error('Backfill failed for ticket', { id: r.id, error: e.message });
    }
  }
  return rows.length;
}

(async () => {
  try {
    let total = 0;
    while (true) {
      const processed = await backfillBatch(200);
      total += processed;
      if (processed === 0) break;
    }
    logger.info('Backfill completed', { total });
    process.exit(0);
  } catch (e) {
    logger.error('Backfill run failed', { error: e.message });
    process.exit(1);
  }
})();
