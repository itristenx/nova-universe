import { jest } from '@jest/globals';
jest.setTimeout(30000);
import 'dotenv/config';
import request from 'supertest';
import assert from 'assert';
import dbWrapper from '../db.js';
import setupPromise from './00_setup.js';

let app;
const token = 'testtoken';

beforeAll(async () => {
  await setupPromise;
  app = globalThis.app;
});

const auth = (req) => req.set('Authorization', 'Bearer testtoken');

beforeEach(async () => {
  await dbWrapper.query('DELETE FROM users');
});

describe('SCIM user management', function() {
  it('creates a user', async function() {
    const payload = {
      userName: 'scim@example.com',
      name: { givenName: 'Scim', familyName: 'User' },
      emails: [{ value: 'scim@example.com', primary: true }],
      active: true
    };
    const res = await auth(request(app).post('/scim/v2/Users'))
      .send(payload)
      .expect(201);
    assert(res.body.id, 'id missing');
    const { rows } = await dbWrapper.query('SELECT * FROM users WHERE id=$1', [res.body.id]);
    const row = rows[0];
    assert(row, 'db row missing');
    assert.strictEqual(row.email, 'scim@example.com');
  });

  it('updates a user', async function() {
    const { rows } = await dbWrapper.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id', ['Old', 'old@e.com']);
    const id = rows[0].id;
    const payload = {
      userName: 'new@example.com',
      name: { givenName: 'New', familyName: 'Name' },
      emails: [{ value: 'new@example.com', primary: true }],
      active: true
    };
    const res = await auth(request(app).put(`/scim/v2/Users/${id}`))
      .send(payload)
      .expect(200);
    assert.strictEqual(res.body.displayName, 'New Name');
    const { rows: userRows } = await dbWrapper.query('SELECT * FROM users WHERE id=$1', [id]);
    const row = userRows[0];
    assert.strictEqual(row.name, 'New Name');
    assert.strictEqual(row.email, 'new@example.com');
  });
});
