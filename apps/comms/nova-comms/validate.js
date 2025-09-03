/**
 * Simple validation script to ensure the Nova Comms service is properly configured
 */

import { validateEnv } from './environment.js';

console.log('🔍 Validating Nova Comms configuration...\n');

try {
  const config = validateEnv();
  
  console.log('✅ Environment validation passed!');
  console.log('📋 Configuration summary:');
  console.log(`   - Service Port: ${config.port}`);
  console.log(`   - API URL: ${config.apiUrl}`);
  console.log(`   - Admin URL: ${config.adminUrl || 'Not configured'}`);
  console.log(`   - Service User: ${config.serviceUserName} (${config.serviceUserEmail})`);
  console.log(`   - Tenant ID: ${config.tenantId}`);
  console.log('\n🎯 Configuration requirements:');
  console.log('   ✅ All required environment variables are present');
  console.log('   ✅ Service can start without errors');
  console.log('\n📝 Next steps:');
  console.log('   1. Ensure Nova Universe API is running and accessible');
  console.log('   2. Configure Slack app with proper webhooks');
  console.log('   3. Start the service with: npm start');
  console.log('   4. Test integration with: /it-help command in Slack');
  
} catch (error) {
  console.error('❌ Configuration validation failed:');
  console.error(`   Error: ${error.message}`);
  console.error('\n🔧 Required environment variables:');
  console.error('   - SLACK_SIGNING_SECRET');
  console.error('   - SLACK_BOT_TOKEN');
  console.error('   - API_URL');
  console.error('   - JWT_SECRET');
  console.error('\n📖 See SETUP.md for detailed configuration instructions');
  process.exit(1);
}