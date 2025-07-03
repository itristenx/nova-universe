const request = require('supertest');
const sinon = require('sinon');
const mock = require('mock-require');
const { expect } = require('chai');

let app;
let db;
let sendMailStub;

describe('/submit-ticket', () => {
  beforeEach(() => {
    process.env.DB_FILE = ':memory:';
    sendMailStub = sinon.stub().resolves();
    mock('nodemailer', {
      createTransport: () => ({ sendMail: sendMailStub })
    });
    delete require.cache[require.resolve('../index')];
    delete require.cache[require.resolve('../db')];
    app = require('../index');
    db = require('../db');
  });

  afterEach((done) => {
    mock.stop('nodemailer');
    db.close(done);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/submit-ticket').send({});
    expect(res.status).to.equal(400);
  });

  it('returns 200 on success and inserts log', (done) => {
    const payload = {
      name: 'Alice',
      email: 'a@example.com',
      title: 'Issue',
      system: 'sys',
      urgency: 'low',
      description: 'desc'
    };
    request(app)
      .post('/submit-ticket')
      .send(payload)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(sendMailStub.calledOnce).to.be.true;
        expect(res.body.emailStatus).to.equal('success');
        db.get('SELECT * FROM logs WHERE ticket_id = ?', [res.body.ticketId], (dbErr, row) => {
          if (dbErr) return done(dbErr);
          try {
            expect(row).to.exist;
            expect(row.name).to.equal('Alice');
            done();
          } catch (e) {
            done(e);
          }
        });
      });
  });

  it('sets emailStatus to fail when email sending fails', (done) => {
    sendMailStub.rejects(new Error('smtp fail'));
    const payload = {
      name: 'Bob',
      email: 'b@example.com',
      title: 'Issue',
      system: 'sys',
      urgency: 'low'
    };
    request(app)
      .post('/submit-ticket')
      .send(payload)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.emailStatus).to.equal('fail');
        expect(sendMailStub.calledOnce).to.be.true;
        done();
      });
  });
});
