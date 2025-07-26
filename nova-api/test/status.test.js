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

function resetConfig(done) {
  dbWrapper.serialize(() => {
    dbWrapper.run("DELETE FROM config WHERE key IN ('statusOpenMsg','statusClosedMsg','statusErrorMsg')");
    const stmt = dbWrapper.prepare('INSERT INTO config (key, value) VALUES (?, ?)');
    stmt.run('statusOpenMsg', 'Open');
    stmt.run('statusClosedMsg', 'Closed');
    stmt.run('statusErrorMsg', 'Error');
    stmt.finalize(done);
  });
}

beforeEach((done) => {
  dbWrapper.run('DELETE FROM kiosks', () => resetConfig(done));
});

describe('Kiosk status API', function() {
  it('stores and retrieves kiosk status fields', async function() {
    await request(app)
      .post('/api/v1/register-kiosk')
      .send({ id: 'k1', token })
      .expect(200);

    let res = await request(app)
      .get('/api/v1/kiosks/k1/status')
      .expect(200);
    assert.strictEqual(res.body.statusEnabled, 0);

    const payload = { statusEnabled: true, currentStatus: 'open', openMsg: 'Hi', schedule: { mon: '8-5' } };
    await request(app)
      .put('/api/v1/kiosks/k1/status')
      .send(payload)
      .expect(200);

    res = await request(app)
      .get('/api/v1/kiosks/k1/status')
      .expect(200);
    assert.strictEqual(res.body.statusEnabled, 1);
    assert.strictEqual(res.body.currentStatus, 'open');
    assert.strictEqual(res.body.openMsg, 'Hi');
    assert.deepStrictEqual(JSON.parse(res.body.schedule), { mon: '8-5' });
  });
});

describe('Global status config', function() {
  it('PUT updates values and persists', async function() {
    await request(app)
      .put('/api/status-config')
      .send({ statusOpenMsg: 'Yes', statusClosedMsg: 'No' })
      .expect(200);

    const res = await request(app)
      .get('/api/status-config')
      .expect(200);
    assert.strictEqual(res.body.statusOpenMsg, 'Yes');
    assert.strictEqual(res.body.statusClosedMsg, 'No');
  });
});
