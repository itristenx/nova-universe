// Comprehensive UI Test Script for Nova Universe Portal
// Run this in the browser console at http://localhost:5173

console.log('🧪 Starting comprehensive UI test suite...');

// Test data
const testCredentials = {
  email: 'admin@example.com',
  password: 'admin',
};

// Utility functions
function waitFor(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else if (Date.now() - start > timeout) {
        reject(new Error(`Timeout waiting for ${selector}`));
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Test suite
async function runUITests() {
  try {
    console.log('📋 Test Suite: Nova Universe Portal UI Functionality');

    // Clear any existing auth
    localStorage.clear();

    // Test 1: Login Form Presence
    console.log('\n1️⃣ Testing Login Form Presence...');
    await waitFor('form', 3000);
    const loginForm = document.querySelector('form');
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const submitButton = document.querySelector('button[type="submit"]');

    if (!loginForm || !emailInput || !passwordInput || !submitButton) {
      throw new Error('Login form elements not found');
    }
    console.log('✅ Login form elements present');

    // Test 2: Fill Login Form
    console.log('\n2️⃣ Testing Form Input...');
    emailInput.value = testCredentials.email;
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));

    passwordInput.value = testCredentials.password;
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));

    console.log('✅ Login form filled successfully');

    // Test 3: API Connectivity Test
    console.log('\n3️⃣ Testing API Connectivity...');
    try {
      const healthResponse = await fetch('/api/health');
      const health = await healthResponse.json();
      console.log('✅ API Health Check:', health);
    } catch (_error) {
      throw new Error(`API connectivity failed: ${_error.message}`);
    }

    // Test 4: Manual Login API Test
    console.log('\n4️⃣ Testing Login API...');
    try {
      const loginResponse = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCredentials),
      });

      if (!loginResponse.ok) {
        const error = await loginResponse.json();
        throw new Error(`Login API failed: ${JSON.stringify(error)}`);
      }

      const loginResult = await loginResponse.json();
      console.log('✅ Login API successful');

      // Store token for subsequent tests
      localStorage.setItem('auth_token', loginResult.token);
    } catch (_error) {
      throw new Error(`Login API test failed: ${_error.message}`);
    }

    // Test 5: Submit Login Form
    console.log('\n5️⃣ Testing Form Submission...');
    try {
      // Trigger form submission
      submitButton.click();

      // Wait for potential navigation or state change
      await sleep(2000);

      // Check if we're still on login page or redirected
      const currentUrl = window.location.pathname;
      console.log('✅ Form submitted, current path:', currentUrl);
    } catch (_error) {
      console.warn('⚠️ Form submission test had issues:', _error.message);
    }

    // Test 6: Check Authentication State
    console.log('\n6️⃣ Testing Authentication State...');
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      console.log('✅ Auth token stored in localStorage');

      // Test profile endpoint
      try {
        const profileResponse = await fetch('/api/me', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          console.log('✅ Profile API working:', profile);
        } else {
          console.warn('⚠️ Profile API failed');
        }
      } catch (_error) {
        console.warn('⚠️ Profile test failed:', _error.message);
      }
    } else {
      console.warn('⚠️ No auth token found in localStorage');
    }

    // Test 7: Check for UI Elements After Login
    console.log('\n7️⃣ Testing Post-Login UI Elements...');
    await sleep(1000);

    // Look for navigation or dashboard elements
    const navElements = document.querySelectorAll('nav, [role="navigation"]');
    const dashboardElements = document.querySelectorAll(
      '.dashboard, .admin, [data-testid*="dashboard"]',
    );

    if (navElements.length > 0 || dashboardElements.length > 0) {
      console.log('✅ Post-login UI elements detected');
    } else {
      console.log('ℹ️ Still on login page or no nav elements detected');
    }

    // Test 8: Browser Console Error Check
    console.log('\n8️⃣ Checking for Console Errors...');
    // Note: This won't catch errors that occurred before this script ran
    console.log('ℹ️ Monitor browser console for any JavaScript errors');

    console.log('\n🎉 UI Test Suite Completed!');
    console.log('\n📊 Test Summary:');
    console.log('- Login form elements: ✅');
    console.log('- API connectivity: ✅');
    console.log('- Form filling: ✅');
    console.log('- Login API: ✅');
    console.log('- Form submission: Attempted');
    console.log('- Authentication: Token stored');

    console.log('\n💡 Next Steps:');
    console.log('1. Try logging in manually with the form');
    console.log('2. Check browser Network tab for failed requests');
    console.log('3. Look for JavaScript errors in Console');
    console.log('4. Verify the page redirects after successful login');
  } catch (_error) {
    console.error('❌ UI Test Failed:', _error.message);
    console.log('\n🔍 Debugging Info:');
    console.log('- Current URL:', window.location.href);
    console.log('- Form elements:', {
      form: !!document.querySelector('form'),
      email: !!document.querySelector('input[type="email"]'),
      password: !!document.querySelector('input[type="password"]'),
      submit: !!document.querySelector('button[type="submit"]'),
    });
    console.log('- Local storage:', Object.keys(localStorage));
  }
}

// Auto-run the test suite
runUITests();
