#!/usr/bin/env node

import db from './db.js';

async function testDatabase() {
  try {
    console.log('🔍 Testing database connectivity and admin user...\n');
    
    // Check if tenants table exists
    console.log('1. Checking tenants table...');
    try {
      const tenantsResult = await db.query('SELECT * FROM tenants LIMIT 5');
      console.log('✅ Tenants table exists, found', tenantsResult.rows.length, 'tenants');
      if (tenantsResult.rows.length > 0) {
        console.log('   First tenant:', tenantsResult.rows[0]);
      }
    } catch (error) {
      console.log('❌ Tenants table error:', error.message);
    }
    
    // Check if users table exists and has admin user
    console.log('\n2. Checking users table...');
    try {
      const usersResult = await db.query('SELECT id, name, email, "is_default", "tenant_id" FROM users WHERE email = $1', ['admin@example.com']);
      console.log('✅ Users table exists');
      if (usersResult.rows.length > 0) {
        const adminUser = usersResult.rows[0];
        console.log('   Admin user found:', {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          is_default: adminUser.is_default,
          tenant_id: adminUser.tenant_id
        });
      } else {
        console.log('❌ Admin user not found');
      }
    } catch (error) {
      console.log('❌ Users table error:', error.message);
    }
    
    // Check if user_roles table exists and admin role is assigned
    console.log('\n3. Checking user roles...');
    try {
      const rolesResult = await db.query(`
        SELECT u.email, r.name as role_name 
        FROM users u 
        JOIN user_roles ur ON u.id = ur.user_id 
        JOIN roles r ON ur.role_id = r.id 
        WHERE u.email = $1
      `, ['admin@example.com']);
      
      if (rolesResult.rows.length > 0) {
        console.log('✅ Admin roles found:', rolesResult.rows.map(r => r.role_name));
      } else {
        console.log('❌ No roles assigned to admin user');
      }
    } catch (error) {
      console.log('❌ User roles error:', error.message);
    }
    
    // Check if auth_audit_logs table exists (for Helix universal login)
    console.log('\n4. Checking auth audit logs table...');
    try {
      const auditResult = await db.query('SELECT COUNT(*) as count FROM auth_audit_logs');
      console.log('✅ Auth audit logs table exists, count:', auditResult.rows[0].count);
    } catch (error) {
      console.log('❌ Auth audit logs table error:', error.message);
    }
    
    console.log('\n🔍 Database test complete');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testDatabase();
