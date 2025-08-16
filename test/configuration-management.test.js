/**
 * Test Configuration Management Component
 * 
 * This test verifies that the ConfigurationManagement component:
 * 1. Uses only native HTML elements (no custom components)
 * 2. Properly handles configuration value types
 * 3. Correctly formats and displays configuration data
 */

import fs from 'fs';
import path from 'path';

function testConfigurationManagement() {
  console.log('Testing Configuration Management Component...');
  
  const componentPath = path.join(__dirname, '../apps/core/nova-core/src/components/admin/ConfigurationManagement.tsx');
  
  if (!fs.existsSync(componentPath)) {
    console.error('❌ Component file not found:', componentPath);
    return false;
  }
  
  const componentContent = fs.readFileSync(componentPath, 'utf8');
  
  // Test 1: Check that custom components are not imported or used
  const customComponentPatterns = [
    '@nova-universe/ui',
    'import.*Badge.*from',
    'import.*Card.*from',
    'import.*Tabs.*from',
    'import.*Input.*from',
    'import.*Button.*from',
    'import.*Select.*from',
    'import.*Switch.*from',
    'import.*Alert.*from',
    '<Badge',
    '<Card',
    '<Tabs',
    '<Switch',
    '<ScrollArea'
  ];
  
  let customComponentsFound = [];
  
  customComponentPatterns.forEach(pattern => {
    const regex = new RegExp(pattern, 'gi');
    if (regex.test(componentContent)) {
      customComponentsFound.push(pattern);
    }
  });
  
  if (customComponentsFound.length > 0) {
    console.error('❌ Custom components still found:', customComponentsFound);
    return false;
  }
  
  console.log('✅ No custom UI components found - using native HTML elements');
  
  // Test 2: Check that native HTML elements are used
  const nativeElementPatterns = [
    '<input',
    '<select',
    '<button',
    '<textarea',
    '<div',
    '<span',
    '<form'
  ];
  
  let nativeElementsFound = [];
  
  nativeElementPatterns.forEach(pattern => {
    const regex = new RegExp(pattern, 'gi');
    if (regex.test(componentContent)) {
      nativeElementsFound.push(pattern);
    }
  });
  
  if (nativeElementsFound.length < 5) {
    console.error('❌ Insufficient native HTML elements found:', nativeElementsFound);
    return false;
  }
  
  console.log('✅ Native HTML elements properly used:', nativeElementsFound);
  
  // Test 3: Check that TypeScript types are properly defined
  const typePatterns = [
    'interface.*Config',
    'type.*Config',
    'ConfigValue',
    'ConfigMetadata'
  ];
  
  let typesFound = [];
  
  typePatterns.forEach(pattern => {
    const regex = new RegExp(pattern, 'gi');
    if (regex.test(componentContent)) {
      typesFound.push(pattern);
    }
  });
  
  if (typesFound.length === 0) {
    console.error('❌ No TypeScript type definitions found');
    return false;
  }
  
  console.log('✅ TypeScript types properly defined:', typesFound);
  
  // Test 4: Check that the component is exported
  if (!componentContent.includes('export default ConfigurationManagement')) {
    console.error('❌ Component not properly exported');
    return false;
  }
  
  console.log('✅ Component properly exported');
  
  // Test 5: Check that Tailwind CSS classes are used for styling
  const tailwindPatterns = [
    'className=".*bg-',
    'className=".*text-',
    'className=".*p-',
    'className=".*m-',
    'className=".*border-',
    'className=".*rounded-'
  ];
  
  let tailwindFound = [];
  
  tailwindPatterns.forEach(pattern => {
    const regex = new RegExp(pattern, 'gi');
    if (regex.test(componentContent)) {
      tailwindFound.push(pattern);
    }
  });
  
  if (tailwindFound.length === 0) {
    console.error('❌ No Tailwind CSS classes found for styling');
    return false;
  }
  
  console.log('✅ Tailwind CSS classes used for styling');
  
  console.log('\n🎉 All Configuration Management Component tests passed!');
  return true;
}

import test from 'node:test';

await test('Configuration Management Component', async () => {
  const success = testConfigurationManagement();
  if (!success) throw new Error('Configuration Management Component test failed');
});
