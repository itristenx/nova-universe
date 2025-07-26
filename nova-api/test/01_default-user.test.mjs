import assert from 'assert';
import dbWrapper from '../db.js';

describe('Default user seed', function () {
  it('creates admin user with hashed password', function (done) {
    dbWrapper.get(
      'SELECT * FROM users WHERE email=?',
      ['admin@example.com'],
      (err, row) => {
        if (err) return done(err);
        assert(row, 'row missing');
        assert.strictEqual(row.name, 'Admin');
        assert(row.passwordHash);
        assert.notStrictEqual(row.passwordHash, 'admin');
        done();
      }
    );
  });
});
