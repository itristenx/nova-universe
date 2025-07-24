import request from 'supertest';
import assert from 'assert';
import db from '../db.js';
const app = globalThis.app;

beforeEach((done) => {
  db.run('DELETE FROM users', done);
});

describe('User management', function() {
  it('creates a user with hashed password', async function() {
    const res = await request(app)
      .post('/api/v1/users')
      .send({ name: 'Alice', email: 'a@example.com', password: 'secret' })
      .expect(200);
    assert(res.body.id, 'id missing');
    const row = await new Promise((resolve) => {
      db.get('SELECT * FROM users WHERE id=?', [res.body.id], (e, r) => resolve(r));
    });
    assert(row, 'row missing');
    assert.notStrictEqual(row.passwordHash, null);
    assert.notStrictEqual(row.passwordHash, 'secret');
  });

  it('updates user info and password', async function() {
    const id = await new Promise((resolve) => {
      db.run('INSERT INTO users (name, email, passwordHash) VALUES (?, ?, ?)', ['Bob', 'b@e.com', null], function() { resolve(this.lastID); });
    });
    await request(app)
      .put(`/api/users/${id}`)
      .send({ name: 'Bobby', email: 'bob@e.com', password: 'newpass' })
      .expect(200);
    const row = await new Promise((resolve) => {
      db.get('SELECT * FROM users WHERE id=?', [id], (e, r) => resolve(r));
    });
    assert.strictEqual(row.name, 'Bobby');
    assert.strictEqual(row.email, 'bob@e.com');
    assert.notStrictEqual(row.passwordHash, null);
  });
});
