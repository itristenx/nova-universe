import request from 'supertest';
import assert from 'assert';
import db from '../db.js';
const app = globalThis.app;

beforeEach((done) => {
  db.serialize(() => {
    db.run('DELETE FROM directory_integrations');
    db.run(
      "INSERT INTO directory_integrations (id, provider, settings) VALUES (1,'mock','[{\"name\":\"Alice\",\"email\":\"alice@example.com\"},{\"name\":\"Bob\",\"email\":\"bob@example.com\"}]')",
      done
    );
  });
});

describe('Directory search', function() {
  it('returns matches', async function() {
    const res = await request(app)
      .get('/api/directory-search')
      .query({ q: 'ali' })
      .expect(200);
    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(res.body[0].email, 'alice@example.com');
  });
});
