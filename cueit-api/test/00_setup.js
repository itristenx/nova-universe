const nodemailer = require('nodemailer');
let sendBehavior = async () => {};
const originalCreate = nodemailer.createTransport;

nodemailer.createTransport = () => ({
  sendMail: (opts) => sendBehavior(opts),
});

const app = require('../index');

global.app = app;

global.setSendBehavior = (fn) => {
  sendBehavior = fn;
};

after(() => {
  nodemailer.createTransport = originalCreate;
});
