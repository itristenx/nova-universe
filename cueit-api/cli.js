#!/usr/bin/env node

import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import db from './db.js';
import readline from 'readline';

// Set flag to suppress verbose admin setup output
process.env.CLI_MODE = 'true';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askPassword(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function changeAdminPassword() {
  console.log('🔑 CueIT Admin Password Reset Tool');
  console.log('=====================================\n');
  
  // Check if password is provided as argument
  const newPassword = process.argv[3];
  
  if (newPassword) {
    // Password provided as argument
    updatePassword(newPassword);
  } else {
    // Interactive mode
    setTimeout(() => {
      askPassword('Enter new password: ').then((password) => {
        updatePassword(password);
      });
    }, 2000);
  }
}

function updatePassword(newPassword) {
  if (!newPassword || newPassword.length < 6) {
    console.error('❌ Password must be at least 6 characters long');
    rl.close();
    return;
  }
  
  // Find default admin users
  db.all('SELECT email FROM users WHERE is_default = 1', (err, rows) => {
    if (err) {
      console.error('❌ Database error:', err.message);
      rl.close();
      return;
    }
    
    if (rows.length === 0) {
      console.error('❌ No default admin users found');
      rl.close();
      return;
    }
    
    const adminEmail = rows[0].email;
    console.log(`Updating password for: ${adminEmail}`);
    
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    
    db.run(
      'UPDATE users SET passwordHash = ? WHERE email = ? AND is_default = 1',
      [hashedPassword, adminEmail],
      function(err) {
        if (err) {
          console.error('❌ Failed to update password:', err.message);
        } else if (this.changes === 0) {
          console.error('❌ Default admin user not found');
        } else {
          console.log(`✅ Password updated successfully for ${adminEmail}`);
        }
        rl.close();
      }
    );
  });
}

function listUsers() {
  console.log('📋 CueIT Default Admin Users');
  console.log('============================\n');
  
  // Wait for database initialization
  setTimeout(() => {
    db.all(`
      SELECT DISTINCT u.id, u.name, u.email, u.disabled, u.is_default,
             r.name as role
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.is_default = 1 AND r.name = 'superadmin'
      ORDER BY u.id
    `, (err, rows) => {
      if (err) {
        console.error('❌ Failed to fetch default admin users:', err.message);
        rl.close();
        return;
      }
      
      if (rows.length === 0) {
        console.log('⚠️  No default superadmin users found.');
        rl.close();
        return;
      }
      
      rows.forEach(user => {
        const status = user.disabled ? '❌ DISABLED' : '✅ ACTIVE';
        
        console.log(`ID: ${user.id} | ${user.name} (${user.email})`);
        console.log(`   Status: ${status} 🛡️  DEFAULT SUPERADMIN`);
        console.log(`   Role: ${user.role}\n`);
      });
      
      rl.close();
    });
  }, 1000);
}

// CLI command router
const command = process.argv[2];

switch (command) {
  case 'change-password':
  case 'passwd':
    changeAdminPassword();
    break;
  case 'list-users':
  case 'users':
    listUsers();
    break;
  case 'help':
  case '--help':
  case '-h':
    console.log('CueIT CLI Commands:');
    console.log('==================');
    console.log('node cli.js change-password  - Change default admin password');
    console.log('node cli.js list-users       - List default superadmin users');
    console.log('node cli.js help             - Show this help message');
    rl.close();
    break;
  default:
    console.log('❌ Unknown command. Use "node cli.js help" for available commands.');
    rl.close();
}
