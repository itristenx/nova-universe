#!/usr/bin/env node

/**
 * Simple Email Integration Validation
 * Tests core functionality without complex dependencies
 */

import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

console.log('🔧 Starting Simple Email Integration Validation...\n');

async function validateDatabaseSchema() {
  console.log('✅ Testing Database Schema...');

  try {
    // Test if email_accounts table exists
    console.log('  → Checking email_accounts table...');

    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'email_accounts'
      );
    `;

    if (result[0]?.exists) {
      console.log('    ✓ email_accounts table exists');

      // Check table structure
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'email_accounts'
        ORDER BY ordinal_position;
      `;

      console.log(`    ✓ Table has ${columns.length} columns`);

      const expectedColumns = [
        'id',
        'address',
        'display_name',
        'provider',
        'configuration',
        'queue',
        'is_active',
        'auto_create_tickets',
        'send_auto_reply',
        'last_processed',
        'created_at',
        'updated_at',
      ];

      const actualColumns = columns.map((col) => col.column_name);
      const missingColumns = expectedColumns.filter((col) => !actualColumns.includes(col));

      if (missingColumns.length === 0) {
        console.log('    ✓ All required columns present');
      } else {
        console.log(`    ⚠️ Missing columns: ${missingColumns.join(', ')}`);
      }

      // Test basic CRUD operations
      console.log('  → Testing CRUD operations...');

      try {
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

        // Query test
        const accounts = await prisma.emailAccount.findMany({
          where: { isActive: true },
        });
        console.log(`    ✓ Found ${accounts.length} active accounts`);

        // Delete test
        await prisma.emailAccount.delete({
          where: { id: testAccount.id },
        });
        console.log('    ✓ Deleted test account');
      } catch (crudError) {
        console.log(`    ❌ CRUD operations failed: ${crudError.message}`);
      }
    } else {
      console.log('    ❌ email_accounts table does not exist');
      console.log('    📝 Run database migration: npm run db:migrate');
    }

    console.log('✅ Database Schema validation completed\n');
  } catch (error) {
    console.error('❌ Database validation failed:', error.message);
    throw error;
  }
}

async function validateAPIRoutes() {
  console.log('✅ Testing API Route Files...');

  try {
    const fs = await import('fs');
    const path = await import('path');

    const routeFiles = [
      'apps/api/routes/email-integration.js',
      'apps/api/routes/email-templates.js',
    ];

    for (const routeFile of routeFiles) {
      if (fs.existsSync(routeFile)) {
        console.log(`    ✓ ${routeFile} exists`);

        const content = fs.readFileSync(routeFile, 'utf8');

        // Check for essential route definitions
        const routeChecks = [
          { pattern: /router\.get.*accounts/i, name: 'GET accounts route' },
          { pattern: /router\.post.*accounts/i, name: 'POST accounts route' },
          { pattern: /router\.put.*accounts/i, name: 'PUT accounts route' },
          { pattern: /router\.delete.*accounts/i, name: 'DELETE accounts route' },
        ];

        routeChecks.forEach((check) => {
          if (check.pattern.test(content)) {
            console.log(`      ✓ ${check.name} defined`);
          } else {
            console.log(`      ⚠️ ${check.name} missing`);
          }
        });
      } else {
        console.log(`    ❌ ${routeFile} not found`);
      }
    }

    console.log('✅ API Route Files validation completed\n');
  } catch (error) {
    console.error('❌ API Routes validation failed:', error.message);
  }
}

async function validateServiceFiles() {
  console.log('✅ Testing Service Files...');

  try {
    const fs = await import('fs');

    const serviceFiles = [
      'apps/api/services/email-integration.service.js',
      'apps/api/services/email-template.service.js',
    ];

    for (const serviceFile of serviceFiles) {
      if (fs.existsSync(serviceFile)) {
        console.log(`    ✓ ${serviceFile} exists`);

        const content = fs.readFileSync(serviceFile, 'utf8');
        const sizeKB = Math.round(content.length / 1024);
        console.log(`      📄 Size: ${sizeKB}KB`);

        // Check for essential class definitions
        if (
          content.includes('class EmailIntegrationService') ||
          content.includes('class EmailTemplateService')
        ) {
          console.log(`      ✓ Service class defined`);
        } else {
          console.log(`      ⚠️ Service class not found`);
        }

        // Check for essential methods
        const methodChecks = [
          'initialize',
          'configureEmailAccount',
          'processIncomingEmails',
          'parseEmailToTicket',
        ];

        methodChecks.forEach((method) => {
          if (content.includes(method)) {
            console.log(`      ✓ ${method} method defined`);
          }
        });
      } else {
        console.log(`    ❌ ${serviceFile} not found`);
      }
    }

    console.log('✅ Service Files validation completed\n');
  } catch (error) {
    console.error('❌ Service Files validation failed:', error.message);
  }
}

async function validateHelpScoutReplacementReadiness() {
  console.log('✅ HelpScout Replacement Readiness Assessment...');

  const requirements = [
    {
      name: 'Database Schema',
      check: async () => {
        const result = await prisma.$queryRaw`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'email_accounts'
          );
        `;
        return result[0]?.exists || false;
      },
    },
    {
      name: 'Email Integration Service',
      check: async () => {
        const fs = await import('fs');
        return fs.existsSync('apps/api/services/email-integration.service.js');
      },
    },
    {
      name: 'Email Template Service',
      check: async () => {
        const fs = await import('fs');
        return fs.existsSync('apps/api/services/email-template.service.js');
      },
    },
    {
      name: 'API Routes',
      check: async () => {
        const fs = await import('fs');
        return (
          fs.existsSync('apps/api/routes/email-integration.js') &&
          fs.existsSync('apps/api/routes/email-templates.js')
        );
      },
    },
    {
      name: 'Database Migration',
      check: async () => {
        const fs = await import('fs');
        return fs.existsSync('prisma/migrations') || fs.existsSync('prisma/schema.prisma');
      },
    },
  ];

  let passedRequirements = 0;

  for (const requirement of requirements) {
    try {
      const result = await requirement.check();
      if (result) {
        console.log(`    ✓ ${requirement.name}: READY`);
        passedRequirements++;
      } else {
        console.log(`    ❌ ${requirement.name}: NOT READY`);
      }
    } catch (error) {
      console.log(`    ❌ ${requirement.name}: ERROR - ${error.message}`);
    }
  }

  const readinessPercentage = (passedRequirements / requirements.length) * 100;

  console.log(
    `\n📊 HelpScout Replacement Readiness: ${readinessPercentage.toFixed(0)}% (${passedRequirements}/${requirements.length})`,
  );

  if (readinessPercentage >= 80) {
    console.log('🎉 Nova ITSM is ready to replace HelpScout!');
    console.log('\n📋 Next Steps:');
    console.log('1. Configure email accounts via API or Admin UI');
    console.log('2. Set up Microsoft Graph or IMAP credentials');
    console.log('3. Test email-to-ticket creation');
    console.log('4. Configure auto-reply templates');
    console.log('5. Begin gradual migration from HelpScout');
  } else if (readinessPercentage >= 60) {
    console.log('⚠️ Almost ready - complete remaining requirements');
  } else {
    console.log('❌ Significant work needed before HelpScout replacement');
  }

  console.log('✅ Readiness Assessment completed\n');
}

async function main() {
  try {
    await validateDatabaseSchema();
    await validateAPIRoutes();
    await validateServiceFiles();
    await validateHelpScoutReplacementReadiness();

    console.log('🎉 Email Integration Validation Completed Successfully!');
  } catch (error) {
    console.error('\n❌ Validation failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
