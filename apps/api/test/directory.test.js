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

async function seedDir() {
  await dbWrapper.query('DELETE FROM directory_integrations');
  await dbWrapper.query(
    "INSERT INTO directory_integrations (id, provider, settings, created_at, updated_at) VALUES (1,'mock','[{\"name\":\"Alice\",\"email\":\"alice@example.com\"}]', NOW(), NOW())"
  );
  await dbWrapper.query("DELETE FROM config WHERE key LIKE 'directory%'");
  await dbWrapper.query('INSERT INTO config (key, value) VALUES ($1, $2)', ['directoryEnabled', '1']);
  await dbWrapper.query('INSERT INTO config (key, value) VALUES ($1, $2)', ['directoryProvider', 'mock']);
  await dbWrapper.query('INSERT INTO config (key, value) VALUES ($1, $2)', ['directoryUrl', '']);
  await dbWrapper.query('INSERT INTO config (key, value) VALUES ($1, $2)', ['directoryToken', '']);
}

beforeEach(async () => {
  await dbWrapper.query('DELETE FROM users');
  await seedDir();
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
    const rowResult = await dbWrapper.query('SELECT * FROM users WHERE id=$1', [res.body.id]);
    const row = rowResult.rows?.[0];
    assert(row, 'row missing');
  });

  it('returns error when provider fails', async function () {
    setAxiosBehavior(() => {
      throw new Error('fail');
    });
    await dbWrapper.query("UPDATE config SET value='scim' WHERE key='directoryProvider'");
    await request(app)
      .post('/api/register-kiosk')
      .send({ id: 'k2', token })
      .expect(200);
    await request(app)
      .get('/api/kiosks/k2/users?q=x')
      .expect(500);
  });
});
