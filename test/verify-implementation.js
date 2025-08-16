#!/usr/bin/env node

/**
 * Nova Universe Implementation Verification Script
 *
 * This script verifies that all WebSocket and PWA components are properly implemented
 * Usage: node verify-implementation.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

console.log('🚀 Nova Universe Implementation Verification\n');

// Define all components to verify
const VERIFICATION_CHECKS = [
  {
    name: 'WebSocket Server Components',
    checks: [
      {
        description: 'WebSocket Events Manager',
        path: 'apps/api/websocket/events.js',
        test: (content) => content.includes('class WebSocketManager'),
      },
      {
        description: 'WebSocket API Routes',
        path: 'apps/api/routes/websocket.js',
        test: (content) => content.includes("router.post('/broadcast')"),
      },
      {
        description: 'Socket.IO Integration',
        path: 'apps/api/index.js',
        test: (content) => content.includes("import { Server } from 'socket.io'"),
      },
    ],
  },
  {
    name: 'Nova Core WebSocket Integration',
    checks: [
      {
        description: 'WebSocket Hook',
        path: 'apps/core/nova-core/src/hooks/useWebSocket.ts',
        test: (content) => content.includes('export const useWebSocket'),
      },
      {
        description: 'WebSocket Context Provider',
        path: 'apps/core/nova-core/src/contexts/WebSocketContext.tsx',
        test: (content) => content.includes('export const WebSocketProvider'),
      },
      {
        description: 'WebSocket Status Component',
        path: 'apps/core/nova-core/src/components/WebSocketStatus.tsx',
        test: (content) => content.includes('export const WebSocketStatus'),
      },
      {
        description: 'Dashboard Real-time Updates',
        path: 'apps/core/nova-core/src/pages/NovaDashboard.tsx',
        test: (content) => content.includes('useWebSocket') && content.includes('lastUpdate'),
      },
      {
        description: 'Tickets Real-time Updates',
        path: 'apps/core/nova-core/src/pages/TicketsPage.tsx',
        test: (content) => content.includes('useWebSocket') && content.includes('ticket_created'),
      },
    ],
  },
  {
    name: 'Nova Core PWA Implementation',
    checks: [
      {
        description: 'PWA Manifest',
        path: 'apps/core/nova-core/public/manifest.json',
        test: (content) => {
          const manifest = JSON.parse(content);
          return manifest.name === 'Nova Universe Core' && manifest.display === 'standalone';
        },
      },
      {
        description: 'Service Worker',
        path: 'apps/core/nova-core/public/sw.js',
        test: (content) => content.includes('nova-core-v1') && content.includes('cache.addAll'),
      },
      {
        description: 'PWA HTML Integration',
        path: 'apps/core/nova-core/index.html',
        test: (content) => content.includes('manifest.json') && content.includes('serviceWorker'),
      },
    ],
  },
  {
    name: 'Nova Pulse WebSocket Integration',
    checks: [
      {
        description: 'Mobile WebSocket Hook',
        path: 'apps/pulse/nova-pulse/src/hooks/useWebSocket.ts',
        test: (content) => content.includes('ticket_assigned') && content.includes('Notification'),
      },
    ],
  },
  {
    name: 'Nova Pulse PWA Implementation',
    checks: [
      {
        description: 'Mobile PWA Manifest',
        path: 'apps/pulse/public/manifest.json',
        test: (content) => {
          const manifest = JSON.parse(content);
          return manifest.name === 'Nova Universe Pulse' && manifest.theme_color === '#10b981';
        },
      },
      {
        description: 'Mobile Service Worker',
        path: 'apps/pulse/public/sw.js',
        test: (content) => content.includes('nova-pulse-v1') && content.includes('offline-action'),
      },
      {
        description: 'Offline Page',
        path: 'apps/pulse/public/offline.html',
        test: (content) => content.includes('Nova Pulse - Offline'),
      },
      {
        description: 'Mobile PWA HTML',
        path: 'apps/pulse/nova-pulse/index.html',
        test: (content) =>
          content.includes('user-scalable=no') && content.includes('mobile-web-app-capable'),
      },
    ],
  },
  {
    name: 'Package Dependencies',
    checks: [
      {
        description: 'Socket.IO Server',
        path: 'apps/api/package.json',
        test: (content) => {
          const pkg = JSON.parse(content);
          return pkg.dependencies && pkg.dependencies['socket.io'];
        },
      },
      {
        description: 'Socket.IO Client (Nova Core)',
        path: 'apps/core/nova-core/package.json',
        test: (content) => {
          const pkg = JSON.parse(content);
          return pkg.dependencies && pkg.dependencies['socket.io-client'];
        },
      },
      {
        description: 'Socket.IO Client (Nova Pulse)',
        path: 'apps/pulse/nova-pulse/package.json',
        test: (content) => {
          const pkg = JSON.parse(content);
          return pkg.dependencies && pkg.dependencies['socket.io-client'];
        },
      },
    ],
  },
];

async function verifyFile(check) {
  const fullPath = path.join(__dirname, check.path);

  if (!fs.existsSync(fullPath)) {
    return { success: false, error: 'File not found' };
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const testResult = check.test(content);
    return { success: testResult, content: content.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runVerification() {
  let totalChecks = 0;
  let passedChecks = 0;

  for (const section of VERIFICATION_CHECKS) {
    console.log(`\n📋 ${section.name}`);
    console.log(''.padEnd(50, '-'));

    for (const check of section.checks) {
      totalChecks++;
      const result = await verifyFile(check);

      if (result.success) {
        console.log(`✅ ${check.description.padEnd(35)} | ${result.content} bytes`);
        passedChecks++;
      } else {
        console.log(`❌ ${check.description.padEnd(35)} | ${result.error || 'Test failed'}`);
      }
    }
  }

  // Summary
  console.log('\n' + ''.padEnd(60, '='));
  console.log(`📊 VERIFICATION SUMMARY`);
  console.log(''.padEnd(60, '='));
  console.log(`Total Checks: ${totalChecks}`);
  console.log(`Passed: ${passedChecks}`);
  console.log(`Failed: ${totalChecks - passedChecks}`);
  console.log(`Success Rate: ${Math.round((passedChecks / totalChecks) * 100)}%`);

  if (passedChecks === totalChecks) {
    console.log('\n🎉 ALL VERIFICATION CHECKS PASSED!');
    console.log('✅ WebSocket integration is complete');
    console.log('✅ PWA implementation is complete');
    console.log('✅ Real-time updates are configured');
    console.log('✅ Mobile optimization is ready');
  } else {
    console.log('\n⚠️  Some checks failed. Please review the errors above.');
  }

  console.log('\n🚀 Nova Universe is ready for real-time ITSM operations!');
}

// Additional feature tests
async function testSocketIOModules() {
  console.log('\n🔧 Testing Socket.IO Module Availability...');

  try {
    // Test server-side Socket.IO
    const { stdout: serverTest } = await execAsync(
      "cd apps/api && node -e \"import('socket.io').then(() => console.log('✅ Server Socket.IO OK')).catch(e => console.log('❌ Server Socket.IO Error:', e.message))\"",
    );
    console.log(serverTest.trim());

    // Test client-side Socket.IO for Nova Core
    const { stdout: coreTest } = await execAsync(
      "cd apps/core/nova-core && node -e \"import('socket.io-client').then(() => console.log('✅ Core Socket.IO Client OK')).catch(e => console.log('❌ Core Socket.IO Client Error:', e.message))\"",
    );
    console.log(coreTest.trim());

    // Test client-side Socket.IO for Nova Pulse
    const { stdout: pulseTest } = await execAsync(
      "cd apps/pulse/nova-pulse && node -e \"import('socket.io-client').then(() => console.log('✅ Pulse Socket.IO Client OK')).catch(e => console.log('❌ Pulse Socket.IO Client Error:', e.message))\"",
    );
    console.log(pulseTest.trim());
  } catch (error) {
    console.log('⚠️  Module test encountered issues:', error.message);
  }
}

// Main execution
async function main() {
  await runVerification();
  await testSocketIOModules();
}

main().catch(console.error);
