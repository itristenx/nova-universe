#!/usr/bin/env node

// This is a manual integration script, not a Jest test. Rename file to test-kiosks-api.manual.js or move to a /manual/ folder.

import http from 'http';

function testEndpoint(path, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.KIOSK_TOKEN}`
      }
    };

    console.log(`\n🧪 Testing: ${description}`);
    console.log(`📍 URL: http://localhost:3000${path}`);

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            console.log(`✅ SUCCESS - Response:`, JSON.stringify(parsed, null, 2));
            
            // Check for effectiveConfig if this is kiosks endpoint
            if (path === '/api/kiosks' && Array.isArray(parsed)) {
              const hasEffectiveConfig = parsed.length > 0 && parsed[0].effectiveConfig;
              console.log(`🔍 effectiveConfig present: ${hasEffectiveConfig ? '✅ YES' : '❌ NO'}`);
            }
          } catch (e) {
            console.log(`✅ SUCCESS - Raw response:`, data);
          }
        } else {
          console.log(`❌ FAILED - Response:`, data);
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`❌ CONNECTION ERROR:`, err.message);
      resolve();
    });

    req.setTimeout(5000, () => {
      console.log(`⏰ TIMEOUT`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log('🚀 Testing CueIT API endpoints...\n');
  
  await testEndpoint('/api/health', 'Health Check');
  await testEndpoint('/api/kiosks', 'Kiosks List (with effectiveConfig)');
  await testEndpoint('/api/kiosks/unknown-kiosk/remote-config', 'Remote Config for Unknown Kiosk');
  
  console.log('\n🏁 Tests completed!');
}

runTests().catch(console.error);
