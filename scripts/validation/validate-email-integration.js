#!/usr/bin/env node

/**
 * Email Integration Validation Script
 * Tests the core functionality of the email integration service
 */

import { EmailIntegrationService } from './apps/api/services/email-integration.service.js';
import EmailTemplateService from './apps/api/services/email-template.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('🔧 Starting Email Integration Validation...\n');

async function validateEmailService() {
  console.log('✅ Testing Email Integration Service...');

  try {
    const emailService = new EmailIntegrationService();

    // Test 1: Service Initialization
    console.log('  → Testing service initialization...');
    await emailService.initialize();
    console.log('    ✓ Service initialized successfully');

    // Test 2: Email Parsing
    console.log('  → Testing email parsing...');
    const sampleEmail = {
      from: [{ address: 'customer@example.com', name: 'Test Customer' }],
      subject: 'Help with login issue',
      text: 'I am having trouble logging into my account.',
      html: '<p>I am having trouble logging into my account.</p>',
      date: new Date(),
      messageId: '<test@example.com>',
    };

    const parsed = await emailService.parseEmailToTicket(sampleEmail);
    console.log('    ✓ Email parsed successfully:', {
      title: parsed.title,
      customerEmail: parsed.customerEmail,
      priority: parsed.priority,
    });

    // Test 3: Ticket ID Extraction
    console.log('  → Testing ticket ID extraction...');
    const testSubjects = ['Re: [TKT-123] Help with login', 'FW: Ticket #TKT-456 - Issue resolved'];

    testSubjects.forEach((subject) => {
      const ticketId = emailService.extractTicketIdFromSubject(subject);
      console.log(`    ✓ "${subject}" → ${ticketId}`);
    });

    // Test 4: Priority Detection
    console.log('  → Testing priority detection...');
    const urgentEmail = {
      subject: 'URGENT: System is down',
      text: 'Critical issue - production is affected',
    };

    const priority = emailService.determinePriority(urgentEmail);
    console.log(`    ✓ Priority detected: ${priority}`);

    // Test 5: Configuration Validation
    console.log('  → Testing configuration validation...');
    const validConfig = {
      provider: 'microsoft',
      tenantId: 'test-tenant',
      clientId: 'test-client',
      clientSecret: 'test-secret',
    };

    const isValid = emailService.validateAccountConfig(validConfig);
    console.log(`    ✓ Configuration validation: ${isValid ? 'PASS' : 'FAIL'}`);

    console.log('✅ Email Integration Service validation completed\n');
  } catch (error) {
    console.error('❌ Email Service validation failed:', error.message);
    throw error;
  }
}

async function validateEmailTemplates() {
  console.log('✅ Testing Email Template Service...');

  try {
    // Test 1: Get Available Templates
    console.log('  → Testing template listing...');
    const templates = EmailTemplateService.getAvailableTemplates();
    console.log(
      `    ✓ Found ${templates.length} templates:`,
      templates.map((t) => t.name),
    );

    // Test 2: Template Rendering
    console.log('  → Testing template rendering...');
    const sampleData = {
      user: { name: 'John Doe', email: 'john@example.com' },
      ticket: {
        id: 'TKT-001',
        title: 'Test Ticket',
        description: 'Test description',
        priority: 'medium',
        status: 'open',
        createdAt: new Date(),
      },
    };

    if (templates.length > 0) {
      const firstTemplate = templates[0].name;
      const rendered = EmailTemplateService.render(firstTemplate, sampleData);
      const subject = EmailTemplateService.renderSubject(firstTemplate, sampleData);

      console.log(`    ✓ Rendered template "${firstTemplate}"`);
      console.log(`    ✓ Subject: ${subject}`);
      console.log(`    ✓ HTML length: ${rendered.length} characters`);
    }

    // Test 3: Custom Template Creation
    console.log('  → Testing custom template creation...');
    const customTemplate = {
      name: 'test-validation',
      html: '<h1>Test Template</h1><p>Hello {{user.name}}</p>',
      subject: 'Test: {{ticket.title}}',
    };

    await EmailTemplateService.createTemplate(
      customTemplate.name,
      customTemplate.html,
      customTemplate.subject,
    );
    console.log(`    ✓ Created custom template: ${customTemplate.name}`);

    // Test 4: Template Preview
    const preview = EmailTemplateService.render(customTemplate.name, sampleData);
    console.log(`    ✓ Preview rendered successfully`);

    // Cleanup
    await EmailTemplateService.deleteTemplate(customTemplate.name);
    console.log(`    ✓ Cleaned up test template`);

    console.log('✅ Email Template Service validation completed\n');
  } catch (error) {
    console.error('❌ Email Template validation failed:', error.message);
    throw error;
  }
}

async function validateDatabaseSchema() {
  console.log('✅ Testing Database Schema...');

  try {
    // Test 1: Check if email_accounts table exists
    console.log('  → Checking email_accounts table...');

    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'email_accounts'
      );
    `;

    if (tableExists[0].exists) {
      console.log('    ✓ email_accounts table exists');

      // Test 2: Check table structure
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'email_accounts'
        ORDER BY ordinal_position;
      `;

      console.log(`    ✓ Table has ${columns.length} columns`);

      // Test 3: Test basic CRUD operations
      console.log('  → Testing CRUD operations...');

      const testAccount = await prisma.emailAccount.create({
        data: {
          address: 'test@example.com',
          displayName: 'Test Account',
          provider: 'microsoft',
          configuration: {
            tenantId: 'test-tenant',
            clientId: 'test-client',
          },
          queue: 'support',
          isActive: true,
          autoCreateTickets: true,
          sendAutoReply: false,
        },
      });

      console.log(`    ✓ Created test account: ${testAccount.id}`);

      // Update test
      await prisma.emailAccount.update({
        where: { id: testAccount.id },
        data: { displayName: 'Updated Test Account' },
      });
      console.log('    ✓ Updated test account');

      // Delete test
      await prisma.emailAccount.delete({
        where: { id: testAccount.id },
      });
      console.log('    ✓ Deleted test account');
    } else {
      console.log('    ⚠️ email_accounts table does not exist - migration may be needed');
    }

    console.log('✅ Database Schema validation completed\n');
  } catch (error) {
    console.error('❌ Database validation failed:', error.message);
    throw error;
  }
}

async function validateHelpScoutReplacement() {
  console.log('✅ Testing HelpScout Replacement Readiness...');

  const requirements = [
    {
      name: 'Email Integration Service',
      test: async () => {
        const service = new EmailIntegrationService();
        await service.initialize();
        return true;
      },
    },
    {
      name: 'Email Template System',
      test: async () => {
        const templates = EmailTemplateService.getAvailableTemplates();
        return templates.length >= 4; // Should have default templates
      },
    },
    {
      name: 'Microsoft Graph API Support',
      test: async () => {
        const service = new EmailIntegrationService();
        const config = {
          provider: 'microsoft',
          tenantId: 'test',
          clientId: 'test',
          clientSecret: 'test',
        };
        return service.validateAccountConfig(config);
      },
    },
    {
      name: 'IMAP/POP3 Support',
      test: async () => {
        const service = new EmailIntegrationService();
        const config = {
          provider: 'imap',
          imapHost: 'imap.example.com',
          username: 'test',
          password: 'test',
        };
        return service.validateAccountConfig(config);
      },
    },
    {
      name: 'Auto-Reply Functionality',
      test: async () => {
        const templates = EmailTemplateService.getAvailableTemplates();
        return templates.some((t) => t.name === 'auto-reply');
      },
    },
  ];

  let passedTests = 0;

  for (const requirement of requirements) {
    try {
      const result = await requirement.test();
      if (result) {
        console.log(`    ✓ ${requirement.name}: PASS`);
        passedTests++;
      } else {
        console.log(`    ❌ ${requirement.name}: FAIL`);
      }
    } catch (error) {
      console.log(`    ❌ ${requirement.name}: ERROR - ${error.message}`);
    }
  }

  const successRate = (passedTests / requirements.length) * 100;
  console.log(
    `\n📊 HelpScout Replacement Readiness: ${successRate.toFixed(0)}% (${passedTests}/${requirements.length})`,
  );

  if (successRate >= 80) {
    console.log('🎉 Nova ITSM is ready to replace HelpScout!');
  } else {
    console.log('⚠️ Additional work needed before replacing HelpScout');
  }

  console.log('✅ HelpScout Replacement validation completed\n');
}

async function main() {
  try {
    await validateEmailService();
    await validateEmailTemplates();
    await validateDatabaseSchema();
    await validateHelpScoutReplacement();

    console.log('🎉 All Email Integration validations completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Configure email accounts in the Admin UI');
    console.log('2. Set up Microsoft Graph API or IMAP credentials');
    console.log('3. Test email-to-ticket creation with real emails');
    console.log('4. Configure auto-reply templates');
    console.log('5. Begin migration from HelpScout');
  } catch (error) {
    console.error('\n❌ Validation failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
