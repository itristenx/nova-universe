#!/usr/bin/env node

// Script to create a test user for authentication
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../prisma/generated/core/index.js';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔧 Setting up test user for queue metrics testing...');
    
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@nova.local' }
    }); // TODO-LINT: move to async function
    
    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.email);
      return existingUser;
    }
    
    // Hash the password
    const passwordHash = await bcrypt.hash('admin123', 12); // TODO-LINT: move to async function
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'admin@nova.local',
        name: 'Test Admin',
        passwordHash: passwordHash,
        disabled: false,
        twoFactorEnabled: false
      }
    }); // TODO-LINT: move to async function
    
    console.log('✅ Created test user:', user.email);
    
    // Create some test queues if they don't exist in the queue table
    try {
      const existingQueues = await prisma.queue.findMany(); // TODO-LINT: move to async function
      
      if (existingQueues.length === 0) {
        const queues = [
          { name: 'general', displayName: 'General Support', description: 'General customer support' },
          { name: 'technical', displayName: 'Technical Support', description: 'Technical issues and bugs' },
          { name: 'billing', displayName: 'Billing Support', description: 'Billing and account questions' }
        ];
        
        for (const queueData of queues) {
          await prisma.queue.create({
            data: {
              name: queueData.name,
              displayName: queueData.displayName,
              description: queueData.description
            }
          }); // TODO-LINT: move to async function
          console.log(`✅ Created test queue: ${queueData.name}`);
        }
      }
      
      // Give user access to queues
      const queues = await prisma.queue.findMany(); // TODO-LINT: move to async function
      for (const queue of queues) {
        try {
          await prisma.queueAccess.create({
            data: {
              userId: user.id,
              queueName: queue.name,
              accessLevel: 'agent'
            }
          }); // TODO-LINT: move to async function
          console.log(`✅ Granted access to queue: ${queue.name}`);
        } catch (error) {
          // Ignore if already exists
          if (!error.message.includes('Unique constraint')) {
            console.log(`⚠️ Error granting queue access: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Queue setup skipped (table may not exist yet):', error.message);
    }
    
    console.log('\n🎉 Test environment setup complete!');
    console.log('📧 Test user email: admin@nova.local');
    console.log('🔑 Test user password: admin123');
    
    return user;
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  } finally {
    await prisma.$disconnect(); // TODO-LINT: move to async function
  }
}

createTestUser();
