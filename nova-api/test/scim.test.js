import request from 'supertest';
import assert from 'assert';
import db from '../db.js';
const app = globalThis.app;

const auth = (req) => req.set('Authorization', 'Bearer testtoken');

beforeEach((done) => {
  db.run('DELETE FROM users', done);
});

describe('SCIM user management', function() {
  it('creates a user', async function() {
    const payload = { userName: 'scim@example.com', displayName: 'Scim User' };
    const res = await auth(request(app).post('/scim/v2/Users'))
      .send(payload)
      .expect(201);
    assert(res.body.id, 'id missing');
    const row = await new Promise((resolve) => {
      db.get('SELECT * FROM users WHERE id=?', [res.body.id], (err, r) => resolve(r));
    });
    assert(row, 'db row missing');
    assert.strictEqual(row.email, 'scim@example.com');
  });

  it('updates a user', async function() {
    const id = await new Promise((resolve) => {
      db.run('INSERT INTO users (name, email) VALUES (?, ?)', ['Old', 'old@e.com'], function(err) {
        resolve(this.lastID);
      });
    });
    const payload = { userName: 'new@example.com', displayName: 'New Name' };
    const res = await auth(request(app).put(`/scim/v2/Users/${id}`))
      .send(payload)
      .expect(200);
    assert.strictEqual(res.body.displayName, 'New Name');
    const row = await new Promise((resolve) => {
      db.get('SELECT * FROM users WHERE id=?', [id], (err, r) => resolve(r));
    });
    assert.strictEqual(row.name, 'New Name');
    assert.strictEqual(row.email, 'new@example.com');
  });
});
