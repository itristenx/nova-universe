import bcrypt from 'bcryptjs';
import pg from 'pg';

const { Client } = pg;

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'nova_universe',
  user: 'nova_admin',
  password: 'Nova_P@ssw0rd_2024!'
};

async function testAuth() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('🔌 Connected to database');
    
    const testEmail = 'debug.user@example.com';
    const testPassword = 'DebugPassword123!';
    
    // First, clean up any existing user
    await client.query('DELETE FROM users WHERE email = $1', [testEmail]);
    console.log('🧹 Cleaned up existing user');
    
    // Create a new user with known password
    const hashedPassword = bcrypt.hashSync(testPassword, 12);
    console.log('🔐 Generated hash:', hashedPassword);
    
    const insertResult = await client.query(
      'INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [testEmail, 'Debug User', hashedPassword]
    );
    console.log('👤 Created user with ID:', insertResult.rows[0].id);
    
    // Now test the same query logic as the auth router
    const found = await client.query(
      'SELECT id, name, email, password_hash, disabled FROM users WHERE email = $1',
      [testEmail]
    );
    
    if (found.rows && found.rows.length > 0) {
      const row = found.rows[0];
      const hash = row.password_hash;
      console.log('📊 Database row:', {
        id: row.id,
        email: row.email,
        hasPasswordHash: !!hash,
        hashLength: hash ? hash.length : 0,
        hashStart: hash ? hash.substring(0, 10) : 'none'
      });
      
      // Test bcrypt comparison exactly like the auth router
      const compareResult = bcrypt.compareSync(testPassword, hash);
      console.log('🔍 Password comparison result:', compareResult);
      
      // Test with wrong password
      const wrongResult = bcrypt.compareSync('WrongPassword', hash);
      console.log('❌ Wrong password result:', wrongResult);
      
    } else {
      console.log('❌ User not found in database');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

testAuth();