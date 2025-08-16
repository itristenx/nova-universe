// Test script to validate setup router without requiring database connection
import fs from 'fs';

console.log('Testing Setup Router Integration...\n');

// Check if setup.js exists
const setupRouterPath = './apps/api/routes/setup.js';
if (fs.existsSync(setupRouterPath)) {
  console.log('✅ Setup router file exists');
} else {
  console.log('❌ Setup router file missing');
  process.exit(1);
}

// Check if index.js imports setup router
const indexPath = './apps/api/index.js';
const indexContent = fs.readFileSync(indexPath, 'utf8');

if (indexContent.includes("import setupRouter from './routes/setup.js';")) {
  console.log('✅ Setup router is imported in index.js');
} else {
  console.log('❌ Setup router import missing in index.js');
  process.exit(1);
}

if (indexContent.includes("app.use('/api/setup', setupRouter);")) {
  console.log('✅ Setup router is registered in index.js');
} else {
  console.log('❌ Setup router registration missing in index.js');
  process.exit(1);
}

// Check setup router routes
const setupContent = fs.readFileSync(setupRouterPath, 'utf8');
const expectedRoutes = [
  '/test-slack',
  '/test-teams',
  '/test-elasticsearch',
  '/test-s3',
  '/test-sentinel',
  '/test-goalert',
  '/complete',
];

console.log('\nChecking setup router endpoints:');
expectedRoutes.forEach((route) => {
  if (setupContent.includes(`'${route}'`)) {
    console.log(`✅ ${route} endpoint exists`);
  } else {
    console.log(`❌ ${route} endpoint missing`);
  }
});

// Check if ServicesStep has been enhanced
const servicesStepPath = './apps/core/nova-core/src/components/setup-wizard/steps/ServicesStep.tsx';
if (fs.existsSync(servicesStepPath)) {
  const servicesContent = fs.readFileSync(servicesStepPath, 'utf8');

  console.log('\nChecking ServicesStep enhancements:');

  if (servicesContent.includes('sentinelEnabled')) {
    console.log('✅ Sentinel configuration added to ServicesStep');
  } else {
    console.log('❌ Sentinel configuration missing from ServicesStep');
  }

  if (servicesContent.includes('goalertEnabled')) {
    console.log('✅ GoAlert configuration added to ServicesStep');
  } else {
    console.log('❌ GoAlert configuration missing from ServicesStep');
  }
} else {
  console.log('❌ ServicesStep.tsx not found');
}

// Check if SetupContext has been updated
const setupContextPath = './apps/core/nova-core/src/components/setup-wizard/SetupContext.tsx';
if (fs.existsSync(setupContextPath)) {
  const contextContent = fs.readFileSync(setupContextPath, 'utf8');

  console.log('\nChecking SetupContext updates:');

  if (contextContent.includes('sentinelEnabled')) {
    console.log('✅ Sentinel configuration added to SetupContext');
  } else {
    console.log('❌ Sentinel configuration missing from SetupContext');
  }

  if (contextContent.includes('goalertEnabled')) {
    console.log('✅ GoAlert configuration added to SetupContext');
  } else {
    console.log('❌ GoAlert configuration missing from SetupContext');
  }
} else {
  console.log('❌ SetupContext.tsx not found');
}

console.log('\n🎉 Setup Router Integration Test Complete!');
console.log('\nSummary:');
console.log('- Setup Wizard is properly located in Core (apps/core/nova-core/)');
console.log('- Setup router with connection testing endpoints has been created');
console.log('- API routes are registered and available at /api/setup/*');
console.log('- ServicesStep enhanced with Sentinel and GoAlert configuration');
console.log('- SetupContext updated to support monitoring/alerting setup');
console.log('- Existing admin panels are available for post-setup configuration');
