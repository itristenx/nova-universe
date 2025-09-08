/**
 * Communication Channels API Routes
 * Provides endpoints for managing team channels, groups, and communication threads
 */

import express from 'express';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import db from '../db.js';

const router = express.Router();

/**
 * GET /api/communication/channels
 * Get available team channels based on user's organization/department
 */
router.get('/channels', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Get user's department and role information
    const user = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          u.id, u.name, u.email, u.department, u.tenant_id,
          GROUP_CONCAT(r.name) as roles
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        WHERE u.id = ?
        GROUP BY u.id
      `, [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Get team channels based on user's context
    const channels = [];
    
    // 1. Department/Team channels
    if (user.department) {
      channels.push({
        id: `dept-${user.department.toLowerCase().replace(/\s+/g, '-')}`,
        name: `${user.department} Team`,
        type: 'department',
        description: `Team channel for ${user.department} department`,
        participantCount: await getDepartmentUserCount(user.department),
        isPrivate: false,
        canInvite: true,
        lastActivity: await getChannelLastActivity(`dept-${user.department}`),
        metadata: {
          department: user.department,
          createdBy: 'system'
        }
      });
    }

    // 2. Cross-functional channels based on roles
    const userRoles = user.roles ? user.roles.split(',') : [];
    
    if (userRoles.includes('admin') || userRoles.includes('manager')) {
      channels.push({
        id: 'management-team',
        name: 'Management Team',
        type: 'leadership',
        description: 'Channel for management team communications',
        participantCount: await getRoleUserCount(['admin', 'manager']),
        isPrivate: true,
        canInvite: userRoles.includes('admin'),
        lastActivity: await getChannelLastActivity('management-team'),
        metadata: {
          requiredRoles: ['admin', 'manager'],
          createdBy: 'system'
        }
      });
    }

    if (userRoles.includes('support') || userRoles.includes('agent')) {
      channels.push({
        id: 'support-team',
        name: 'Support Team',
        type: 'functional',
        description: 'Channel for support team coordination',
        participantCount: await getRoleUserCount(['support', 'agent']),
        isPrivate: false,
        canInvite: true,
        lastActivity: await getChannelLastActivity('support-team'),
        metadata: {
          requiredRoles: ['support', 'agent'],
          createdBy: 'system'
        }
      });
    }

    // 3. General/All-hands channel
    channels.push({
      id: 'general',
      name: 'General',
      type: 'general',
      description: 'General announcements and company-wide communications',
      participantCount: await getTotalUserCount(user.tenant_id),
      isPrivate: false,
      canInvite: false,
      lastActivity: await getChannelLastActivity('general'),
      metadata: {
        isDefault: true,
        createdBy: 'system'
      }
    });

    // 4. Random/Casual channel
    channels.push({
      id: 'casual',
      name: 'Casual Chat',
      type: 'casual',
      description: 'Casual conversations and team bonding',
      participantCount: await getTotalUserCount(user.tenant_id),
      isPrivate: false,
      canInvite: true,
      lastActivity: await getChannelLastActivity('casual'),
      metadata: {
        isDefault: false,
        createdBy: 'system'
      }
    });

    res.json({
      success: true,
      channels,
      userContext: {
        userId: user.id,
        department: user.department,
        roles: userRoles
      }
    });

  } catch (error) {
    logger.error('Error fetching team channels:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch team channels',
      message: error.message
    });
  }
});

/**
 * Helper function to get department user count
 */
async function getDepartmentUserCount(department) {
  return new Promise((resolve) => {
    db.get(
      'SELECT COUNT(*) as count FROM users WHERE department = ? AND disabled = false',
      [department],
      (err, row) => {
        resolve(err ? 0 : row.count);
      }
    );
  });
}

/**
 * Helper function to get role-based user count
 */
async function getRoleUserCount(roles) {
  return new Promise((resolve) => {
    const placeholders = roles.map(() => '?').join(',');
    db.get(`
      SELECT COUNT(DISTINCT u.id) as count 
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name IN (${placeholders}) AND u.disabled = false
    `, roles, (err, row) => {
      resolve(err ? 0 : row.count);
    });
  });
}

/**
 * Helper function to get total user count for tenant
 */
async function getTotalUserCount(tenantId) {
  return new Promise((resolve) => {
    const query = tenantId ? 
      'SELECT COUNT(*) as count FROM users WHERE tenant_id = ? AND disabled = false' :
      'SELECT COUNT(*) as count FROM users WHERE disabled = false';
    
    const params = tenantId ? [tenantId] : [];
    
    db.get(query, params, (err, row) => {
      resolve(err ? 0 : row.count);
    });
  });
}

/**
 * Helper function to get channel last activity (mock implementation)
 */
async function getChannelLastActivity(channelId) {
  // In a real implementation, this would query a messages/activity table
  // For now, return a recent timestamp to simulate activity
  const randomHoursAgo = Math.floor(Math.random() * 24);
  return new Date(Date.now() - randomHoursAgo * 60 * 60 * 1000).toISOString();
}

export default router;