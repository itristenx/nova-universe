// Simple audit logging middleware
const fs = require('fs');
const path = require('path');

function logAudit(event, user, details) {
  const log = {
    timestamp: new Date().toISOString(),
    event,
    user: user?.id || 'anonymous',
    details,
    ip: user?.ip || '',
  };
  fs.appendFileSync(path.join(__dirname, '../../logs/audit.log'), JSON.stringify(log) + '\n');
}

module.exports = { logAudit };
