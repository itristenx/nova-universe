import 'dotenv/config';
process.env.POSTGRES_HOST = 'localhost';
process.env.POSTGRES_USER = 'nova_admin';
process.env.POSTGRES_PASSWORD = 'nova_secure_pass_2024';

import nodemailer from 'nodemailer';
import axios from 'axios';
import dbWrapper, { setupInitialData, initializeDatabase } from '../db.js';
import createApp from '../index.js';

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
  process.env.SCIM_BEARER_TOKEN = 'testtoken';
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

  // Use the new async createApp function
  const app = await createApp();
  global.app = app;

  await new Promise((resolve) => {
    function check() {
      dbWrapper.get(
        'SELECT id FROM users WHERE email=$1',
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
