import { jest } from '@jest/globals';
jest.setTimeout(30000);
import 'dotenv/config';
import request from 'supertest';
import assert from 'assert';
import setupPromise from './00_setup.js';

let app;
const auth = (req) => req.set('Authorization', 'Bearer testtoken');

beforeAll(async () => {
  await setupPromise;
  app = globalThis.app;
});

describe('SCIM group management', function() {
  it('lists groups', async function() {
    const res = await auth(request(app).get('/scim/v2/Groups')).expect(200);
    assert(Array.isArray(res.body.Resources));
  });

  it('creates and deletes group', async function() {
    const res = await auth(request(app).post('/scim/v2/Groups'))
      .send({ displayName: 'TestGroup' })
      .expect(201);
    const id = res.body.id;
    assert(id);
    await auth(request(app).delete(`/scim/v2/Groups/${id}`)).expect(204);
  });
});
