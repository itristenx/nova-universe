// nova-api/test/manual-auth-test.js
// Manual Authentication Test Script
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const SCIM_TOKEN = 'dev-scim-token-change-in-production';

async function testAuthentication() {
  console.log('🧪 Starting Nova Helix Authentication Tests...\n');
  
  try {
    // Test 1: Server Info
    console.log('1️⃣ Testing server info endpoint...');
    const serverInfo = await fetch(`${BASE_URL}/api/v1/server-info`);
    if (serverInfo.ok) {
      const data = await serverInfo.json();
      console.log('✅ Server info:', data.name, 'v' + data.version);
    } else {
      console.log('❌ Server info failed');
    }

    // Test 2: SAML Metadata
    console.log('\n2️⃣ Testing SAML metadata endpoint...');
    const samlMetadata = await fetch(`${BASE_URL}/api/v1/helix/sso/saml/metadata`);
    if (samlMetadata.ok) {
      const metadata = await samlMetadata.text();
      if (metadata.includes('EntityDescriptor')) {
        console.log('✅ SAML metadata generated successfully');
      } else {
        console.log('❌ SAML metadata format invalid');
      }
    } else {
      console.log('❌ SAML metadata failed:', samlMetadata.status);
    }

    // Test 3: SCIM Users Endpoint (without auth - should fail)
    console.log('\n3️⃣ Testing SCIM endpoint without auth (should fail)...');
    const scimNoAuth = await fetch(`${BASE_URL}/scim/v2/Users`);
    if (scimNoAuth.status === 401) {
      console.log('✅ SCIM properly rejects unauthorized requests');
    } else {
      console.log('❌ SCIM should reject unauthorized requests');
    }

    // Test 4: SCIM Users Endpoint (with auth)
    console.log('\n4️⃣ Testing SCIM endpoint with auth...');
    const scimWithAuth = await fetch(`${BASE_URL}/scim/v2/Users`, {
      headers: {
        'Authorization': `Bearer ${SCIM_TOKEN}`,
        'Content-Type': 'application/scim+json'
      }
    });
    if (scimWithAuth.ok) {
      const scimData = await scimWithAuth.json();
      console.log('✅ SCIM Users endpoint working, total users:', scimData.totalResults);
    } else {
      console.log('❌ SCIM Users endpoint failed:', scimWithAuth.status);
    }

    // Test 5: Create SCIM User
    console.log('\n5️⃣ Testing SCIM user creation...');
    const scimUser = {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      userName: 'test.user@nova-universe.local',
      name: {
        givenName: 'Test',
        familyName: 'User'
      },
      emails: [{
        value: 'test.user@nova-universe.local',
        primary: true
      }],
      active: true
    };

    const createUser = await fetch(`${BASE_URL}/scim/v2/Users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SCIM_TOKEN}`,
        'Content-Type': 'application/scim+json'
      },
      body: JSON.stringify(scimUser)
    });

    if (createUser.status === 201) {
      const userData = await createUser.json();
      console.log('✅ SCIM user created successfully, ID:', userData.id);
      
      // Test 6: Retrieve created user
      console.log('\n6️⃣ Testing SCIM user retrieval...');
      const getUser = await fetch(`${BASE_URL}/scim/v2/Users/${userData.id}`, {
        headers: {
          'Authorization': `Bearer ${SCIM_TOKEN}`,
          'Content-Type': 'application/scim+json'
        }
      });
      
      if (getUser.ok) {
        const userDetails = await getUser.json();
        console.log('✅ SCIM user retrieved:', userDetails.userName);
      } else {
        console.log('❌ SCIM user retrieval failed');
      }

      // Test 7: Delete created user
      console.log('\n7️⃣ Testing SCIM user deletion...');
      const deleteUser = await fetch(`${BASE_URL}/scim/v2/Users/${userData.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${SCIM_TOKEN}`
        }
      });
      
      if (deleteUser.status === 204) {
        console.log('✅ SCIM user deleted successfully');
      } else {
        console.log('❌ SCIM user deletion failed');
      }
    } else {
      console.log('❌ SCIM user creation failed:', createUser.status);
      const errorData = await createUser.text();
      console.log('Error details:', errorData);
    }

    // Test 8: Helix Session Endpoint (without auth - should fail)
    console.log('\n8️⃣ Testing Helix session endpoint without auth (should fail)...');
    const sessionNoAuth = await fetch(`${BASE_URL}/api/v1/helix/session`);
    if (sessionNoAuth.status === 401) {
      console.log('✅ Helix properly rejects unauthorized requests');
    } else {
      console.log('❌ Helix should reject unauthorized requests');
    }

    // Test 9: Nova Modules Endpoint Access
    console.log('\n9️⃣ Testing Nova module endpoints...');
    const moduleEndpoints = [
      { name: 'Lore', path: '/api/v1/lore/articles' },
      { name: 'Pulse', path: '/api/v1/pulse/tickets' },
      { name: 'Orbit', path: '/api/v1/orbit/tickets' },
      { name: 'Synth', path: '/api/v1/synth/insights' }
    ];
    
    for (const module of moduleEndpoints) {
      const response = await fetch(`${BASE_URL}${module.path}`);
      console.log(`   Nova ${module.name}:`, 
                  response.ok ? '✅ Available' : `❌ Status ${response.status}`);
    }

    console.log('\n🎉 Authentication tests completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAuthentication();
}
