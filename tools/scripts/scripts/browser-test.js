// Simple JavaScript test for Nova Universe login
// Run this in the browser console at http://localhost:5173

console.log('🔍 Testing Nova Universe Authentication...');

// Clear any existing auth state
localStorage.removeItem('auth_token');
localStorage.removeItem('auth-storage');

// Test API connectivity
async function testAPIConnection() {
  const API_URL = 'http://localhost:3000';
  
  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_URL}/api/health`); // TODO-LINT: move to async function
    const health = await healthResponse.json(); // TODO-LINT: move to async function
    console.log('✅ Health:', health);

    console.log('2. Testing auth status...');
    const authStatusResponse = await fetch(`${API_URL}/api/auth/status`); // TODO-LINT: move to async function
    const authStatus = await authStatusResponse.json(); // TODO-LINT: move to async function
    console.log('✅ Auth Status:', authStatus);

    console.log('3. Testing login...');
    const loginResponse = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin'
      })
    }); // TODO-LINT: move to async function

    if (!loginResponse.ok) {
      const error = await loginResponse.json(); // TODO-LINT: move to async function
      console.error('❌ Login failed:', error);
      return;
    }

    const loginResult = await loginResponse.json(); // TODO-LINT: move to async function
    console.log('✅ Login successful:', loginResult);

    // Store token and test profile
    localStorage.setItem('auth_token', loginResult.token);

    console.log('4. Testing profile...');
    const profileResponse = await fetch(`${API_URL}/api/me`, {
      headers: {
        'Authorization': `Bearer ${loginResult.token}`
      }
    }); // TODO-LINT: move to async function

    const profile = await profileResponse.json(); // TODO-LINT: move to async function
    console.log('✅ Profile:', profile);

    console.log('🎉 All tests passed! You should be able to login now.');
    console.log('💡 Try refreshing the page and logging in.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAPIConnection();
