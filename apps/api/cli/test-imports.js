#!/usr/bin/env node

// Test script to check which command imports are failing

const commands = [
  'setup',
  'service', 
  'user',
  'config',
  'backup',
  'dev',
  'health',
  'logs',
  'dashboard'
];

async function testImports() {
  for (const command of commands) {
    try {
      console.log(`Testing import of ${command}...`);
      await import(`./commands/${command}.js`);
      console.log(`✅ ${command} imported successfully`);
    } catch (error) {
      console.error(`❌ ${command} import failed:`, error.message);
      console.error('Full error:', error);
    }
  }
}

testImports();
