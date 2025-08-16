#!/usr/bin/env node
/**
 * Nova Synth Data Matching Example
 * Demonstrates how Nova Synth should be used for data matching in the Nova Integration Layer
 */

import { NovaIntegrationLayer } from './apps/lib/integration/nova-integration-layer.js';

console.log('🧠 Nova Synth Data Matching Integration Demo');
console.log('==============================================\n');

// Mock data representing users from different systems
const oktaUser = {
  id: 'okta_12345',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@company.com',
  department: 'engineering',
  employeeId: 'EMP001',
  source: 'okta'
};

const jamfDevice = {
  deviceId: 'jamf_device_789',
  deviceName: 'Johns-MacBook-Pro',
  assignedUser: 'john.doe@company.com',
  serialNumber: 'C02ABC123456',
  osVersion: '14.2.1',
  lastCheckin: '2024-01-15T10:30:00Z',
  source: 'jamf'
};

const crowdStrikeHost = {
  hostId: 'cs_host_456',
  hostname: 'johns-macbook-pro.company.com',
  agentVersion: '7.04.15109.0',
  lastSeen: '2024-01-15T10:25:00Z',
  riskScore: 25,
  policies: ['Default Policy'],
  source: 'crowdstrike'
};

const slackUser = {
  id: 'slack_U1234567',
  name: 'John Doe',
  email: 'j.doe@company.com', // Note: slightly different email format
  displayName: 'John D.',
  department: 'Engineering', // Note: different capitalization
  source: 'slack'
};

console.log('📊 Sample Data from Different Systems:');
console.log('=====================================');
console.log('👤 Okta User:', JSON.stringify(oktaUser, null, 2));
console.log('💻 Jamf Device:', JSON.stringify(jamfDevice, null, 2));
console.log('🛡️  CrowdStrike Host:', JSON.stringify(crowdStrikeHost, null, 2));
console.log('💬 Slack User:', JSON.stringify(slackUser, null, 2));

console.log('\n🧠 How Nova Synth Should Help with Data Matching:');
console.log('================================================');

console.log('\n1. 🔍 Profile Matching:');
console.log('   Nova Synth would analyze these profiles and identify that they all belong to the same person:');
console.log('   • Email correlation: john.doe@company.com ≈ j.doe@company.com (fuzzy match)');
console.log('   • Name matching: "John Doe" across all systems');
console.log('   • Device correlation: hostname "Johns-MacBook-Pro" ≈ "johns-macbook-pro.company.com"');
console.log('   • Department normalization: "engineering" ≈ "Engineering"');

console.log('\n2. 🔄 Data Transformation:');
console.log('   Nova Synth would normalize data formats:');
console.log('   • Names: "John Doe" → standardized format');
console.log('   • Emails: various formats → canonical format');
console.log('   • Hostnames: case-insensitive matching and normalization');
console.log('   • Departments: normalize to standard org structure');

console.log('\n3. 🎯 Entity Correlation:');
console.log('   Nova Synth would establish relationships:');
console.log('   • User → Device assignment via email/hostname correlation');
console.log('   • Device → Security status via hostname matching');
console.log('   • User → Communication preferences via Slack profile');

console.log('\n4. ✅ Deduplication:');
console.log('   Nova Synth would identify and merge duplicates:');
console.log('   • Same device appearing in Jamf and CrowdStrike');
console.log('   • Same user across identity providers');
console.log('   • Conflicting information resolution');

console.log('\n5. 🎯 Confidence Scoring:');
console.log('   Nova Synth would provide confidence scores:');
console.log('   • High confidence (95%): Email exact match');
console.log('   • Medium confidence (80%): Fuzzy email match');
console.log('   • Lower confidence (65%): Hostname similarity only');

console.log('\n📋 Example Integration Layer Usage:');
console.log('===================================');

const exampleCode = `
// In getUserProfile method - Nova Synth integration:

// 1. Normalize data from each connector
const _normalizedOktaData = await nil.normalizeUserAttributesWithSynth(
  oktaData, 'IDENTITY_PROVIDER'
); // TODO-LINT: move to async function

// 2. Find matching profiles across systems
const _matchResults = await nil.matchUserProfilesWithSynth(
  primaryProfile, [oktaUser, slackUser]
); // TODO-LINT: move to async function

// 3. Intelligently merge profile data
const mergedProfile = await nil.mergeProfilesWithSynth(
  primaryProfile, matchingProfile
); // TODO-LINT: move to async function

// 4. Validate final profile quality
const validation = await nil.validateProfileWithSynth(mergedProfile); // TODO-LINT: move to async function

// 5. Deduplicate devices/assets
const _uniqueDevices = await nil.deduplicateProfileDataWithSynth([
  jamfDevice, crowdStrikeHost
]); // TODO-LINT: move to async function
`;

console.log(exampleCode);

console.log('\n🚀 Expected User 360 Result with Nova Synth:');
console.log('============================================');

const expectedUser360 = {
  userId: 'user_john_doe_001',
  email: 'john.doe@company.com', // Canonical email
  identity: {
    okta: 'okta_12345',
    slack: 'slack_U1234567',
    employeeId: 'EMP001'
  },
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'John D.',
    department: 'Engineering' // Normalized
  },
  devices: [
    {
      deviceId: 'unified_device_001', // Nova Synth would create unified ID
      hostname: 'johns-macbook-pro.company.com', // Canonical hostname
      serialNumber: 'C02ABC123456',
      sources: ['jamf', 'crowdstrike'], // Multiple sources merged
      osVersion: '14.2.1',
      securityStatus: {
        agentVersion: '7.04.15109.0',
        riskScore: 25,
        policies: ['Default Policy']
      },
      lastActivity: '2024-01-15T10:30:00Z', // Latest timestamp
      confidence: 0.95 // High confidence merge
    }
  ],
  security: {
    mfa: true, // From Okta
    riskScore: 25, // From CrowdStrike
    policies: ['Default Policy']
  },
  communication: {
    slack: {
      userId: 'slack_U1234567',
      displayName: 'John D.'
    }
  },
  dataQuality: {
    completeness: 0.92,
    confidence: 0.89,
    lastValidation: '2024-01-15T10:35:00Z'
  },
  lastUpdated: '2024-01-15T10:35:00Z'
};

console.log(JSON.stringify(expectedUser360, null, 2));

console.log('\n💡 Key Benefits of Nova Synth Integration:');
console.log('=========================================');
console.log('✅ Intelligent profile correlation across disparate systems');
console.log('✅ Automated data normalization and standardization');
console.log('✅ Conflict resolution in data merging');
console.log('✅ Quality scoring and validation');
console.log('✅ Deduplication of devices and assets');
console.log('✅ Confidence scoring for all operations');
console.log('✅ Graceful fallback when AI service unavailable');

console.log('\n🔧 Implementation Status:');
console.log('========================');
console.log('✅ Nova Synth connector refactored for data intelligence');
console.log('✅ DATA_INTELLIGENCE connector type added');
console.log('✅ Integration methods implemented in NIL');
console.log('✅ Transformation and normalization rules configured');
console.log('✅ Graceful fallback mechanisms in place');
console.log('✅ User 360 process enhanced with Nova Synth');
console.log('✅ Profile merging enhanced with AI confidence scoring');

console.log('\n🎯 Next Steps for Production:');
console.log('============================');
console.log('1. Deploy Nova Synth Data Intelligence API service');
console.log('2. Configure organization-specific matching rules');
console.log('3. Train Nova Synth with historical user data');
console.log('4. Set up monitoring for data quality metrics');
console.log('5. Implement feedback loops for continuous improvement');

console.log('\n✨ Nova Synth is now properly integrated for intelligent data matching! ✨');
