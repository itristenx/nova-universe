#!/usr/bin/env node
/**
 * Database Seed Script
 * 
 * Populates the Nova Universe database with sample data for frontend development.
 * Creates realistic test data across all domains (Weeks 1-3).
 * 
 * Usage:
 *   node scripts/seed-database.js
 * 
 * Requirements:
 *   - PostgreSQL running on localhost:5432
 *   - Database 'nova_universe' exists
 *   - Prisma schema pushed to database
 *   - API server running (optional, for verification)
 * 
 * @see FRONTEND-INTEGRATION-TODO.md Phase 1, Step 1.3
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { PrismaClient } = require('../prisma/generated/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

console.log('Prisma client loaded:', !!prisma);
console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));

// =============================================================================
// CONFIGURATION
// =============================================================================

const ADMIN_EMAIL = 'admin@nova-universe.com';
const ADMIN_PASSWORD = 'Admin123!'; // Change in production
const ADMIN_NAME = 'System Administrator';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function _randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function _randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function _randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function _pastDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function futureDate(daysAhead) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date;
}

// =============================================================================
// SEED DATA
// =============================================================================

async function seedUsers() {
  console.log('📝 Seeding users...');
  
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      passwordHash,
      department: 'IT',
      jobTitle: 'System Administrator',
    },
  });

  // Create additional users
  const john = await prisma.user.upsert({
    where: { email: 'john.doe@nova-universe.com' },
    update: {},
    create: {
      email: 'john.doe@nova-universe.com',
      name: 'John Doe',
      passwordHash,
      department: 'IT Support',
      jobTitle: 'IT Support Agent',
    },
  });

  const jane = await prisma.user.upsert({
    where: { email: 'jane.smith@nova-universe.com' },
    update: {},
    create: {
      email: 'jane.smith@nova-universe.com',
      name: 'Jane Smith',
      passwordHash,
      department: 'IT Support',
      jobTitle: 'Senior IT Support Agent',
    },
  });

  const mike = await prisma.user.upsert({
    where: { email: 'mike.johnson@nova-universe.com' },
    update: {},
    create: {
      email: 'mike.johnson@nova-universe.com',
      name: 'Mike Johnson',
      passwordHash,
      department: 'Engineering',
      jobTitle: 'Software Engineer',
    },
  });

  console.log(`✅ Created 4 users`);
  return [admin, john, jane, mike];
}

async function seedDepartments() {
  console.log('📝 Seeding departments...');
  
  const departments = [
    { name: 'Engineering', description: 'Software development and infrastructure' },
    { name: 'IT Support', description: 'Technical support and helpdesk' },
    { name: 'Operations', description: 'Business operations and processes' },
    { name: 'Customer Success', description: 'Customer support and success' },
  ];

  let count = 0;
  for (const dept of departments) {
    const exists = await prisma.department.findFirst({
      where: { name: dept.name }
    });
    
    if (!exists) {
      await prisma.department.create({ data: dept });
      count++;
    }
  }

  console.log(`✅ Created ${count} departments`);
  return prisma.department.findMany();
}

async function seedKnowledgeBase(users) {
  console.log('📝 Seeding knowledge base articles...');
  
  const admin = users[0];
  
  const articles = [
    {
      title: 'How to Reset Your Password',
      slug: 'how-to-reset-your-password',
      content: '# Password Reset Guide\n\n1. Click "Forgot Password" on the login page\n2. Enter your email address\n3. Check your email for reset link\n4. Click the link and enter new password\n5. Login with your new password',
      status: 'PUBLISHED',
      visibility: 'INTERNAL',
      viewCount: 245,
      helpfulCount: 189,
      authorId: admin.id,
      publishedAt: new Date(),
    },
    {
      title: 'VPN Setup Instructions',
      slug: 'vpn-setup-instructions',
      content: '# VPN Configuration\n\n## Windows\n1. Download VPN client from IT portal\n2. Install and launch\n3. Enter your credentials\n4. Connect to corporate network\n\n## Mac\n1. Open System Preferences > Network\n2. Add VPN connection\n3. Configure with IT-provided settings',
      status: 'PUBLISHED',
      visibility: 'INTERNAL',
      viewCount: 178,
      helpfulCount: 142,
      authorId: admin.id,
      publishedAt: new Date(),
    },
    {
      title: 'Email Configuration on Mobile',
      slug: 'email-configuration-on-mobile',
      content: '# Mobile Email Setup\n\nConfigure your work email on iOS or Android devices.\n\n## iOS\n1. Settings > Mail > Accounts\n2. Add Account > Microsoft Exchange\n3. Enter credentials\n\n## Android\n1. Settings > Accounts\n2. Add Account > Exchange\n3. Follow prompts',
      status: 'PUBLISHED',
      visibility: 'INTERNAL',
      viewCount: 156,
      helpfulCount: 134,
      authorId: admin.id,
      publishedAt: new Date(),
    },
  ];

  let count = 0;
  for (const article of articles) {
    const exists = await prisma.kbArticle.findFirst({
      where: { slug: article.slug }
    });
    
    if (!exists) {
      await prisma.kbArticle.create({ data: article });
      count++;
    }
  }

  console.log(`✅ Created ${count} knowledge base articles`);
}

async function seedServices(users) {
  console.log('📝 Seeding service catalog...');
  
  const admin = users[0];
  
  const services = [
    {
      name: 'Email Service',
      description: 'Corporate email and calendar',
      category: 'Communication',
      type: 'IT Service',
      isActive: true,
      isPublic: true,
      ownerId: admin.id,
    },
    {
      name: 'VPN Access',
      description: 'Secure remote network access',
      category: 'Network',
      type: 'IT Service',
      isActive: true,
      isPublic: true,
      ownerId: admin.id,
    },
    {
      name: 'File Storage',
      description: 'Cloud file storage and sharing',
      category: 'Storage',
      type: 'IT Service',
      isActive: true,
      isPublic: true,
      ownerId: admin.id,
    },
  ];

  let count = 0;
  for (const service of services) {
    const exists = await prisma.serviceCatalogItem.findFirst({
      where: { name: service.name }
    });
    
    if (!exists) {
      await prisma.serviceCatalogItem.create({ data: service });
      count++;
    }
  }

  console.log(`✅ Created ${count} services`);
  return prisma.serviceCatalogItem.findMany();
}

async function seedWebhooks() {
  console.log('📝 Seeding webhooks...');
  
  const webhooks = [
    {
      name: 'Ticket Created Notification',
      url: 'https://hooks.example.com/ticket-created',
      events: ['ticket.created', 'ticket.updated'],
      enabled: true,
      secret: 'whsec_' + Math.random().toString(36).substring(7),
    },
    {
      name: 'Alert Slack Integration',
      url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX',
      events: ['alert.created', 'alert.resolved'],
      enabled: true,
      secret: 'whsec_' + Math.random().toString(36).substring(7),
    },
  ];

  let count = 0;
  for (const webhook of webhooks) {
    const exists = await prisma.webhookEndpoint.findFirst({
      where: { url: webhook.url }
    });
    
    if (!exists) {
      await prisma.webhookEndpoint.create({ data: webhook });
      count++;
    }
  }

  console.log(`✅ Created ${count} webhooks`);
}

async function seedAlerts() {
  console.log('📝 Seeding alerts...');
  
  const alerts = [
    {
      title: 'High CPU Usage on Web Server',
      message: 'CPU usage exceeded 90% threshold',
      severity: 'HIGH',
      status: 'ACTIVE',
      source: 'monitoring.web-01',
      metadata: { cpu_percent: 94 },
    },
    {
      title: 'Database Connection Pool Exhausted',
      message: 'All database connections in use',
      severity: 'CRITICAL',
      status: 'ACTIVE',
      source: 'database.prod',
      metadata: { pool_size: 100, active: 100 },
    },
  ];

  let count = 0;
  for (const alert of alerts) {
    const exists = await prisma.alert.findFirst({
      where: { title: alert.title }
    });
    
    if (!exists) {
      await prisma.alert.create({ data: alert });
      count++;
    }
  }

  console.log(`✅ Created ${count} alerts`);
}

async function seedAlertRules() {
  console.log('📝 Seeding alert rules...');
  
  const rules = [
    {
      name: 'High CPU Usage',
      description: 'Alert when CPU usage exceeds 80%',
      conditions: { metric: 'cpu_usage', operator: '>', threshold: 80 },
      actions: { type: 'email', target: 'ops-team@nova-universe.com' },
      enabled: true,
      severity: 'HIGH',
    },
    {
      name: 'Disk Space Low',
      description: 'Alert when disk space below 10%',
      conditions: { metric: 'disk_free_percent', operator: '<', threshold: 10 },
      actions: { type: 'slack', channel: '#alerts' },
      enabled: true,
      severity: 'CRITICAL',
    },
  ];

  let count = 0;
  for (const rule of rules) {
    const exists = await prisma.alertRule.findFirst({
      where: { name: rule.name }
    });
    
    if (!exists) {
      await prisma.alertRule.create({ data: rule });
      count++;
    }
  }

  console.log(`✅ Created ${count} alert rules`);
}

async function seedChanges(users) {
  console.log('📝 Seeding change requests...');
  
  const admin = users[0];
  const agent = users[1];
  
  const changes = [
    {
      title: 'Upgrade Production Database to PostgreSQL 15',
      description: 'Upgrade database version for performance improvements and security patches',
      type: 'Normal',
      priority: 'High',
      status: 'Pending Approval',
      requestorId: admin.id,
      implementerId: agent.id,
      scheduledStart: futureDate(7),
      scheduledEnd: futureDate(7),
      riskLevel: 'MEDIUM',
      riskAssessment: 'Medium risk due to database migration',
      backoutPlan: 'Restore from backup if issues occur',
    },
    {
      title: 'Deploy New API Gateway Version',
      description: 'Deploy API Gateway v2.0 with improved rate limiting',
      type: 'Standard',
      priority: 'Medium',
      status: 'Draft',
      requestorId: agent.id,
      scheduledStart: futureDate(14),
      scheduledEnd: futureDate(14),
      riskLevel: 'LOW',
      riskAssessment: 'Low risk - standard deployment',
    },
  ];

  let count = 0;
  for (const change of changes) {
    const exists = await prisma.changeRequest.findFirst({
      where: { title: change.title }
    });
    
    if (!exists) {
      await prisma.changeRequest.create({ data: change });
      count++;
    }
  }

  console.log(`✅ Created ${count} change requests`);
}

async function seedWorkflows() {
  console.log('📝 Seeding workflows...');
  
  const workflows = [
    {
      name: 'Change Approval Workflow',
      description: 'Standard approval process for change requests',
      isActive: true,
      triggerRules: {
        event: 'change.created',
        conditions: [{ field: 'type', operator: 'equals', value: 'Normal' }]
      },
    },
    {
      name: 'Incident Response Workflow',
      description: 'Automated incident response and escalation',
      isActive: true,
      triggerRules: {
        event: 'incident.created',
        conditions: [{ field: 'severity', operator: 'greaterThan', value: 'MEDIUM' }]
      },
    },
  ];

  let count = 0;
  for (const workflow of workflows) {
    const exists = await prisma.workflowDefinition.findFirst({
      where: { name: workflow.name }
    });
    
    if (!exists) {
      await prisma.workflowDefinition.create({ data: workflow });
      count++;
    }
  }

  console.log(`✅ Created ${count} workflows`);
}

// =============================================================================
// MAIN SEED FUNCTION
// =============================================================================

async function main() {
  console.log('🌱 Starting database seed...\n');
  
  try {
    // Seed data
    const users = await seedUsers();
    const departments = await seedDepartments();
    await seedKnowledgeBase(users);
    await seedServices(users);
    await seedWebhooks();
    await seedAlerts();
    await seedAlertRules();
    await seedChanges(users);
    await seedWorkflows();
    
    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Departments: ${departments.length}`);
    console.log(`   - Knowledge Articles: 3`);
    console.log(`   - Services: 3`);
    console.log(`   - Webhooks: 2`);
    console.log(`   - Alerts: 2`);
    console.log(`   - Alert Rules: 2`);
    console.log(`   - Change Requests: 2`);
    console.log(`   - Workflows: 2`);
    
    console.log('\n🔑 Admin Credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('\n⚠️  Please change the admin password after first login!\n');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// =============================================================================
// RUN SEED
// =============================================================================

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
