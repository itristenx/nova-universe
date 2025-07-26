import nodemailer from 'nodemailer';
import axios from 'axios';
import dbWrapper, { setupInitialData, initializeDatabase } from '../db.js';

let setupPromise = (async () => {
  if (!process.env.DISABLE_AUTH) {
    process.env.DISABLE_AUTH = 'true';
  }
  process.env.DISABLE_CLEANUP = 'true';
  process.env.SCIM_TOKEN = 'testtoken';
  process.env.KIOSK_TOKEN = 'kiosktoken';
  process.env.RATE_LIMIT_WINDOW = '60000';
  process.env.SUBMIT_TICKET_LIMIT = '100';
  process.env.API_LOGIN_LIMIT = '50';
  process.env.AUTH_LIMIT = '50';
  let app;
  let sendBehavior = async () => {};
  let axiosBehavior = async () => ({});
  const originalCreate = nodemailer.createTransport;

  nodemailer.createTransport = () => ({
    sendMail: (opts) => sendBehavior(opts),
  });

  const originalPost = axios.post;
  axios.post = (...args) => axiosBehavior(...args);

  // Ensure database is initialized and use the returned db instance
  const db = await initializeDatabase();
  await setupInitialData();

  const mod = await import('../index.js');
  app = mod.default;
  global.app = app;

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

  global.setSendBehavior = (fn) => {
    sendBehavior = fn;
  };

  global.setAxiosBehavior = (fn) => {
    axiosBehavior = fn;
  };
})();

export default setupPromise;
