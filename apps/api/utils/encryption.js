import crypto from 'crypto';
import config from '../config/environment.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM recommended

export function encrypt(text) {
  if (!config.assetEncryptionKey) {
    throw new Error('Encryption key is not configured. Unable to encrypt data.');
  }
  const key = Buffer.from(config.assetEncryptionKey, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decrypt(payload) {
  if (!config.assetEncryptionKey) {
    throw new Error('Decryption failed: Encryption key is not configured.');
  }
  const data = Buffer.from(payload, 'base64');
  const key = Buffer.from(config.assetEncryptionKey, 'hex');
  const iv = data.slice(0, IV_LENGTH);
  const tag = data.slice(IV_LENGTH, IV_LENGTH + 16);
  const text = data.slice(IV_LENGTH + 16);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(text), decipher.final()]);
  return decrypted.toString('utf8');
}
