import nodemailer from 'nodemailer';

process.env.DISABLE_AUTH = 'true';
process.env.SCIM_TOKEN = 'testtoken';
let app;
let sendBehavior = async () => {};
const originalCreate = nodemailer.createTransport;

nodemailer.createTransport = () => ({
  sendMail: (opts) => sendBehavior(opts),
});

const mod = await import('../index.js');
app = mod.default;
globalThis.app = app;

globalThis.setSendBehavior = (fn) => {
  sendBehavior = fn;
};

after(() => {
  nodemailer.createTransport = originalCreate;
});
