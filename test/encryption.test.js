import test from 'node:test';
import assert from 'node:assert/strict';

process.env.SESSION_SECRET = 'x';
process.env.JWT_SECRET = 'y';
process.env.KIOSK_TOKEN = 'k';
process.env.SCIM_TOKEN = 's';
process.env.POSTGRES_HOST = 'x';
process.env.POSTGRES_USER = 'x';
process.env.POSTGRES_PASSWORD = 'x';
process.env.POSTGRES_DB = 'x';
process.env.ASSET_ENCRYPTION_KEY =
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

const { encrypt, decrypt } = await import('../apps/api/utils/encryption.js');

test('encrypt and decrypt returns original text', () => {
  const plain = 'secret123';
  const enc = encrypt(plain);
  const dec = decrypt(enc);
  assert.equal(dec, plain);
});
