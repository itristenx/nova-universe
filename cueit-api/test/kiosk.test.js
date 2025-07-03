import request from 'supertest';
import assert from 'assert';
import db from '../db.js';
const app = globalThis.app || (await import('../index.js')).default;

beforeEach((done) => {
  db.run('DELETE FROM kiosks', done);
});

describe('Kiosk registration and activation', function() {
  it('POST /api/register-kiosk with missing id', function() {
    return request(app)
      .post('/api/register-kiosk')
      .send({ version: '1.0' })
      .expect(400)
      .expect(res => {
        assert.strictEqual(res.body.error, 'Missing id');
      });
  });

  it('registers kiosk and toggles active state', async function() {
    const kioskId = 'kiosk-123';

    // register kiosk
    await request(app)
      .post('/api/register-kiosk')
      .send({ id: kioskId, version: '1.0' })
      .expect(200);

    // verify kiosk listed and inactive
    let res = await request(app)
      .get('/api/kiosks')
      .expect(200);
    let kiosk = res.body.find(k => k.id === kioskId);
    assert(kiosk, 'kiosk not listed');
    assert.strictEqual(kiosk.active, 0);

    // activate kiosk
    await request(app)
      .put(`/api/kiosks/${kioskId}/active`)
      .send({ active: true })
      .expect(200);

    // check active flag now 1
    res = await request(app)
      .get('/api/kiosks')
      .expect(200);
    kiosk = res.body.find(k => k.id === kioskId);
    assert.strictEqual(kiosk.active, 1);

    // deactivate kiosk
    await request(app)
      .put(`/api/kiosks/${kioskId}/active`)
      .send({ active: false })
      .expect(200);

    res = await request(app)
      .get('/api/kiosks')
      .expect(200);
    kiosk = res.body.find(k => k.id === kioskId);
    assert.strictEqual(kiosk.active, 0);
  });
});
