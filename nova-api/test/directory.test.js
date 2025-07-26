import request from 'supertest';
import assert from 'assert';
import dbWrapper from '../db.js';
import setupPromise from './00_setup.js';

let app;
const token = 'kiosktoken';

beforeAll(async () => {
  await setupPromise;
  app = globalThis.app;
});

function seedDir(done) {
  dbWrapper.serialize(() => {
    dbWrapper.run('DELETE FROM directory_integrations');
    dbWrapper.run(
      "INSERT INTO directory_integrations (id, provider, settings) VALUES (1,'mock','[{\"name\":\"Alice\",\"email\":\"alice@example.com\"}]')"
    );
    dbWrapper.run("DELETE FROM config WHERE key LIKE 'directory%'");
    const stmt = dbWrapper.prepare('INSERT INTO config (key, value) VALUES (?, ?)');
    stmt.run('directoryEnabled', '1');
    stmt.run('directoryProvider', 'mock');
    stmt.run('directoryUrl', '');
    stmt.run('directoryToken', '');
    stmt.finalize(done);
  });
}

beforeEach((done) => {
  dbWrapper.run('DELETE FROM users', () => seedDir(done));
});

describe('Directory search via kiosk', function () {
  it('returns matches', async function () {
    await request(app)
      .post('/api/register-kiosk')
      .send({ id: 'k1', token })
      .expect(200);

    const res = await request(app)
      .get('/api/kiosks/k1/users')
      .query({ q: 'ali' })
      .expect(200);
    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(res.body[0].email, 'alice@example.com');
  });

  it('creates user when not found', async function () {
    const res = await request(app)
      .post('/api/kiosks/k1/users')
      .send({ name: 'New', email: 'n@e.com' })
      .expect(200);
    assert(res.body.id, 'id missing');
    const row = await new Promise((resolve) => {
      dbWrapper.get('SELECT * FROM users WHERE id=?', [res.body.id], (e, r) => resolve(r));
    });
    assert(row, 'row missing');
  });

  it('returns error when provider fails', async function () {
    setAxiosBehavior(() => {
      throw new Error('fail');
    });
    await dbWrapper.run("UPDATE config SET value='scim' WHERE key='directoryProvider'");
    await request(app)
      .post('/api/register-kiosk')
      .send({ id: 'k2', token })
      .expect(200);
    await request(app)
      .get('/api/kiosks/k2/users?q=x')
      .expect(500);
  });
});
