import 'dotenv/config';
import assert from 'assert';
import dbWrapper from '../db.js';

async function resetLogs() {
  await dbWrapper.query('DELETE FROM logs');
}

// Setup logs before each test
let setupDone = false;

async function setupLogs() {
  if (setupDone) return;
  await resetLogs();
  const old = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
  const recent = new Date().toISOString();
  await dbWrapper.query(
    'INSERT INTO logs (ticket_id, name, email, title, system, urgency, timestamp, email_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    ['old', 'O', 'o@e', 't', 's', 'Low', old, 'success']
  );
  await dbWrapper.query(
    'INSERT INTO logs (ticket_id, name, email, title, system, urgency, timestamp, email_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    ['new', 'N', 'n@e', 't2', 's', 'High', recent, 'success']
  );
  setupDone = true;
}

describe('Log cleanup', () => {
  it('purges records older than 30 days', async () => {
    await setupLogs();
    await dbWrapper.purgeOldLogs(30);
    const result = await dbWrapper.query('SELECT ticket_id FROM logs');
    const rows = result.rows || result;
    assert.strictEqual(rows.length, 1);
    assert.strictEqual(rows[0].ticket_id, 'new');
  });
});
