import 'dotenv/config';
import request from 'supertest';
import assert from 'assert';
import dbWrapper, { closeDatabase } from '../db.js';
import setupPromise from './00_setup.js';

let app;

beforeAll(async () => {
  await setupPromise;
  app = globalThis.app;
});

beforeEach(async () => {
  await dbWrapper.query('DELETE FROM users');
});

describe('User management', function() {
  it('creates a user with hashed password', async function() {
    const res = await request(app)
      .post('/api/v1/users')
      .send({ name: 'Alice', email: 'a@example.com', password: 'secret' })
      .expect(200);
    assert(res.body.id, 'id missing');
    const { rows } = await dbWrapper.query('SELECT * FROM users WHERE id=$1', [res.body.id]);
    const row = rows[0];
    assert(row, 'row missing');
    assert.notStrictEqual(row.password_hash, null);
    assert.notStrictEqual(row.password_hash, 'secret');
  });

  it('updates user info and password', async function() {
    const { rows } = await dbWrapper.query('INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id', ['Bob', 'b@e.com', null]);
    const id = rows[0].id;
    await request(app)
      .put(`/api/users/${id}`)
      .send({ name: 'Bobby', email: 'bob@e.com', password: 'newpass' })
      .expect(200);
    const { rows: userRows } = await dbWrapper.query('SELECT * FROM users WHERE id=$1', [id]);
    const row = userRows[0];
    assert.strictEqual(row.name, 'Bobby');
    assert.strictEqual(row.email, 'bob@e.com');
    assert.notStrictEqual(row.password_hash, null);
  });

  afterAll(async () => {
    await closeDatabase();
    const { prisma } = await import('../db.js');
    await prisma.$disconnect();
  });
});
