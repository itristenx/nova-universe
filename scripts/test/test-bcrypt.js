import bcrypt from 'bcryptjs';

// Test bcrypt comparison with known values
const testPassword = 'TestPassword123!';

console.log('🔐 Testing bcrypt authentication...');

// First, let's create a hash with the same password to compare
const testHash = bcrypt.hashSync(testPassword, 12);
console.log('Generated test hash:', testHash);

// Test if bcrypt.compareSync works with our generated hash
const testResult = bcrypt.compareSync(testPassword, testHash);
console.log('Test comparison result:', testResult);

// Now test with wrong password
const wrongResult = bcrypt.compareSync('WrongPassword', testHash);
console.log('Wrong password result:', wrongResult);

console.log('✅ bcrypt test completed');