import assert from 'assert';
import db from '../db.js';

function resetLogs(cb) {
  db.run('DELETE FROM logs', cb);
}

describe('log cleanup', function() {
  beforeEach((done) => {
    resetLogs(() => {
      const old = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
      const recent = new Date().toISOString();
      db.run(
        "INSERT INTO logs (ticket_id, name, email, title, system, urgency, timestamp, email_status) VALUES ('old', 'O', 'o@e', 't', 's', 'Low', ?, 'success')",
        [old]
      );
      db.run(
        "INSERT INTO logs (ticket_id, name, email, title, system, urgency, timestamp, email_status) VALUES ('new', 'N', 'n@e', 't2', 's', 'High', ?, 'success')",
        [recent],
        done
      );
    });
  });

  it('purges records older than 30 days', function(done) {
    db.purgeOldLogs(30, (err) => {
      if (err) return done(err);
      db.all('SELECT ticket_id FROM logs', (err2, rows) => {
        if (err2) return done(err2);
        assert.strictEqual(rows.length, 1);
        assert.strictEqual(rows[0].ticket_id, 'new');
        done();
      });
    });
  });
});
