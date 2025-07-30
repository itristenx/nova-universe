import assert from 'assert';
import dbWrapper, { closeDatabase } from '../db.js';

describe('Default user seed', function () {
  it('creates admin user with hashed password', function (done) {
    dbWrapper.get(
      'SELECT * FROM users WHERE email=$1',
      ['admin@example.com'],
      (err, row) => {
        if (err) return done(err);
        assert(row, 'row missing');
        assert.strictEqual(row.name, 'Admin');
        assert(row.password_hash);
        assert.notStrictEqual(row.password_hash, 'admin');
        done();
      }
    );
  });

  afterAll(async () => {
    const { prisma } = await import('../db.js');
    await prisma.$disconnect();
    await closeDatabase();
  });
});
