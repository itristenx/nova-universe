import nodemailer from 'nodemailer';
import axios from 'axios';
import db from '../db.js';

if (!process.env.DISABLE_AUTH) {
  process.env.DISABLE_AUTH = 'true';
}
process.env.DISABLE_CLEANUP = 'true';
process.env.SCIM_TOKEN = process.env.SCIM_TOKEN || 'testtoken';
process.env.KIOSK_TOKEN = process.env.KIOSK_TOKEN || 'kiosktoken';
process.env.RATE_LIMIT_WINDOW = '60000';
process.env.SUBMIT_TICKET_LIMIT = '100';
process.env.API_LOGIN_LIMIT = '50';
process.env.AUTH_LIMIT = '50';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test_session_secret';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
let app;
let sendBehavior = async () => {};
let axiosBehavior = async () => ({});
const originalCreate = nodemailer.createTransport;

nodemailer.createTransport = () => ({
  sendMail: (opts) => sendBehavior(opts),
});

const originalPost = axios.post;
axios.post = (...args) => axiosBehavior(...args);

const mod = await import('../index.js');
app = mod.default;
globalThis.app = app;

await new Promise((resolve) => {
  function check() {
    db.get(
      'SELECT id FROM users WHERE email=?',
      ['admin@example.com'],
      (err, row) => {
        if (row) return resolve();
        setTimeout(check, 10);
      }
    );
  }
  check();
});

globalThis.setSendBehavior = (fn) => {
  sendBehavior = fn;
};

globalThis.setAxiosBehavior = (fn) => {
  axiosBehavior = fn;
};
