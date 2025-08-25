import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../app.js';
import { EmailIntegrationService } from '../services/email-integration.service.js';

const prisma = new PrismaClient();

describe('Email Integration', () => {
  let testUser;
  let authToken;
  let testEmailAccount;

  beforeAll(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'test.email@example.com',
        name: 'Test Email User',
        hashedPassword: 'hashedpassword123',
        role: 'admin',
      },
    });

    // Generate auth token (mock implementation)
    authToken = 'test-auth-token';
  });

  afterAll(async () => {
    // Cleanup
    if (testEmailAccount) {
      await prisma.emailAccount
        .delete({
          where: { id: testEmailAccount.id },
        })
        .catch(() => {});
    }

    await prisma.user
      .delete({
        where: { id: testUser.id },
      })
      .catch(() => {});

    await prisma.$disconnect();
  });

  beforeEach(() => {
    // Reset any mocks or state
  });

  describe('Email Account Management', () => {
    test('should create email account with Microsoft provider', async () => {
      const emailAccountData = {
        address: 'support@company.com',
        displayName: 'Company Support',
        provider: 'microsoft',
        tenantId: 'test-tenant-id',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        queue: 'support',
        autoCreateTickets: true,
        sendAutoReply: true,
      };

      const response = await request(app)
        .post('/api/email/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(emailAccountData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.address).toBe(emailAccountData.address);
      expect(response.body.data.provider).toBe('microsoft');

      testEmailAccount = response.body.data;
    });

    test('should get all email accounts', async () => {
      const response = await request(app)
        .get('/api/email/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should update email account', async () => {
      const updateData = {
        displayName: 'Updated Company Support',
        autoCreateTickets: false,
      };

      const response = await request(app)
        .put(`/api/email/accounts/${testEmailAccount.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testEmailAccount.id);
    });

    test('should fail to create account with invalid provider', async () => {
      const invalidData = {
        address: 'invalid@company.com',
        provider: 'invalid-provider',
      };

      await request(app)
        .post('/api/email/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('Email Templates', () => {
    test('should get available email templates', async () => {
      const response = await request(app)
        .get('/api/email/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should create custom email template', async () => {
      const templateData = {
        name: 'test-template',
        html: '<h1>Test Template</h1><p>Hello {{user.name}}</p>',
        subject: 'Test: {{ticket.title}}',
      };

      const response = await request(app)
        .post('/api/email/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('test-template');
    });

    test('should preview email template', async () => {
      const previewData = {
        data: {
          user: { name: 'Test User' },
          ticket: { title: 'Test Ticket' },
        },
      };

      const response = await request(app)
        .post('/api/email/templates/test-template/preview')
        .set('Authorization', `Bearer ${authToken}`)
        .send(previewData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('html');
      expect(response.body.data).toHaveProperty('subject');
      expect(response.body.data.html).toContain('Test User');
    });
  });

  describe('Email Processing', () => {
    test('should trigger manual email processing', async () => {
      const response = await request(app)
        .post('/api/email/process')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('triggered');
    });

    test('should get email processing status', async () => {
      const response = await request(app)
        .get('/api/email/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('isProcessing');
      expect(response.body.data).toHaveProperty('accounts');
    });

    test('should get email statistics', async () => {
      const response = await request(app)
        .get('/api/email/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accounts');
      expect(response.body.data).toHaveProperty('summary');
    });
  });

  describe('Email Service Unit Tests', () => {
    let emailService;

    beforeEach(() => {
      emailService = new EmailIntegrationService();
    });

    test('should parse email correctly', async () => {
      const sampleEmail = {
        from: [{ address: 'customer@example.com', name: 'Customer Name' }],
        subject: 'Help with login issue',
        text: 'I am having trouble logging into my account.',
        html: '<p>I am having trouble logging into my account.</p>',
        date: new Date(),
        messageId: '<test@example.com>',
      };

      const parsed = await emailService.parseEmailToTicket(sampleEmail);

      expect(parsed.title).toBe('Help with login issue');
      expect(parsed.description).toBe('I am having trouble logging into my account.');
      expect(parsed.customerEmail).toBe('customer@example.com');
      expect(parsed.customerName).toBe('Customer Name');
    });

    test('should extract ticket ID from subject', () => {
      const subjects = [
        'Re: [TKT-123] Help with login',
        'FW: Ticket #TKT-456 - Issue resolved',
        '[TKT-789] New problem',
      ];

      const ticketIds = subjects.map((subject) => emailService.extractTicketIdFromSubject(subject));

      expect(ticketIds).toEqual(['TKT-123', 'TKT-456', 'TKT-789']);
    });

    test('should determine ticket priority from content', () => {
      const urgentEmail = {
        subject: 'URGENT: System is down',
        text: 'Critical issue - production is affected',
      };

      const normalEmail = {
        subject: 'Question about feature',
        text: 'When you have time, could you explain...',
      };

      const urgentPriority = emailService.determinePriority(urgentEmail);
      const normalPriority = emailService.determinePriority(normalEmail);

      expect(urgentPriority).toBe('high');
      expect(normalPriority).toBe('medium');
    });

    test('should validate email account configuration', () => {
      const validMicrosoft = {
        provider: 'microsoft',
        tenantId: 'test-tenant',
        clientId: 'test-client',
        clientSecret: 'test-secret',
      };

      const validIMAP = {
        provider: 'imap',
        imapHost: 'imap.example.com',
        username: 'user@example.com',
        password: 'password',
      };

      const invalidConfig = {
        provider: 'microsoft',
        // missing required fields
      };

      expect(emailService.validateAccountConfig(validMicrosoft)).toBe(true);
      expect(emailService.validateAccountConfig(validIMAP)).toBe(true);
      expect(emailService.validateAccountConfig(invalidConfig)).toBe(false);
    });
  });

  describe('Email Security', () => {
    let emailService;

    beforeEach(() => {
      emailService = new EmailIntegrationService();
    });

    test('should sanitize email content', () => {
      const maliciousContent = '<script>alert("xss")</script><p>Safe content</p>';
      const sanitized = emailService.sanitizeEmailContent(maliciousContent);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Safe content');
    });

    test('should validate sender whitelist', async () => {
      const trustedSender = 'trusted@company.com';
      const untrustedSender = 'spam@malicious.com';

      // Mock whitelist configuration
      const account = {
        senderWhitelist: ['@company.com', 'partner@external.com'],
      };

      const trustedResult = emailService.isAllowedSender(trustedSender, account);
      const untrustedResult = emailService.isAllowedSender(untrustedSender, account);

      expect(trustedResult).toBe(true);
      expect(untrustedResult).toBe(false);
    });
  });
});
