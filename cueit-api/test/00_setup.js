import nodemailer from 'nodemailer';
import axios from 'axios';

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

const mod = await import('../index.js');
app = mod.default;
globalThis.app = app;

globalThis.setSendBehavior = (fn) => {
  sendBehavior = fn;
};

globalThis.setAxiosBehavior = (fn) => {
  axiosBehavior = fn;
};

after(() => {
  nodemailer.createTransport = originalCreate;
  axios.post = originalPost;
});
