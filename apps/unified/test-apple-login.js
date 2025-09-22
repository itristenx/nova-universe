// Test Apple-inspired login page functionality
// This is a simple verification that the login page components are working

console.log('🍎 Testing Apple-inspired Login Page');

// Check if we're on the login page
if (window.location.pathname.includes('/auth/login')) {
  console.log('✅ On login page');
  
  // Wait for components to load
  setTimeout(() => {
    // Check for Apple design components
    const appleCards = document.querySelectorAll('[class*="glass"]');
    const appleButtons = document.querySelectorAll('[class*="apple-button"]') || 
                        document.querySelectorAll('button[class*="bg-gradient"]');
    const appleInputs = document.querySelectorAll('input[class*="rounded-"]');
    
    console.log(`📱 Found ${appleCards.length} Apple card components`);
    console.log(`🔘 Found ${appleButtons.length} Apple button components`);
    console.log(`📝 Found ${appleInputs.length} Apple input components`);
    
    // Check for Apple-style animations and glass morphism
    const hasGlassMorphism = document.querySelector('[class*="backdrop-blur"]');
    const hasGradients = document.querySelector('[class*="bg-gradient"]');
    const hasRoundedCorners = document.querySelector('[class*="rounded-"]');
    
    console.log('🎨 Apple Design System Features:');
    console.log(`  Glass morphism: ${hasGlassMorphism ? '✅' : '❌'}`);
    console.log(`  Gradients: ${hasGradients ? '✅' : '❌'}`);
    console.log(`  Rounded corners: ${hasRoundedCorners ? '✅' : '❌'}`);
    
    // Check form functionality
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const submitButton = document.querySelector('button[type="submit"]');
    
    console.log('📋 Form Elements:');
    console.log(`  Email input: ${emailInput ? '✅' : '❌'}`);
    console.log(`  Password input: ${passwordInput ? '✅' : '❌'}`);
    console.log(`  Submit button: ${submitButton ? '✅' : '❌'}`);
    
    // Check for responsive design
    const isMobile = window.innerWidth < 768;
    console.log(`📱 Mobile view: ${isMobile ? 'Yes' : 'No'}`);
    
    console.log('🎉 Apple-inspired login page test completed!');
  }, 1000);
} else {
  console.log('❌ Not on login page, redirecting...');
  window.location.href = '/auth/login';
}