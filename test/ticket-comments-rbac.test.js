import { test, describe } from 'node:test';
import assert from 'node:assert';

// Mock the role-based comment filtering logic
function canViewInternalComments(userRoles) {
  if (!userRoles || !Array.isArray(userRoles)) {
    return false;
  }
  
  const staffRoles = [
    'technician', 'admin', 'hr_agent', 'hr_admin', 
    'ops_agent', 'ops_admin', 'cyber_agent', 'cyber_admin',
    'tech_lead', 'superadmin', 'nova_superadmin'
  ];
  
  return userRoles.some(role => staffRoles.includes(role));
}

function filterCommentsForUser(comments, userRoles) {
  const canViewInternal = canViewInternalComments(userRoles);
  
  if (canViewInternal) {
    return comments; // Staff can see all comments
  } else {
    return comments.filter(comment => !comment.isInternal); // Customers only see public comments
  }
}

describe('Ticket Comments Role-Based Access Control', () => {
  test('end_user should only see public comments', () => {
    const comments = [
      { id: '1', content: 'Public comment', isInternal: false },
      { id: '2', content: 'Internal comment', isInternal: true },
      { id: '3', content: 'Another public comment', isInternal: false }
    ];
    
    const userRoles = ['end_user'];
    const filteredComments = filterCommentsForUser(comments, userRoles);
    
    assert.strictEqual(filteredComments.length, 2);
    assert.strictEqual(filteredComments[0].content, 'Public comment');
    assert.strictEqual(filteredComments[1].content, 'Another public comment');
  });

  test('technician should see all comments', () => {
    const comments = [
      { id: '1', content: 'Public comment', isInternal: false },
      { id: '2', content: 'Internal comment', isInternal: true },
      { id: '3', content: 'Another public comment', isInternal: false }
    ];
    
    const userRoles = ['technician'];
    const filteredComments = filterCommentsForUser(comments, userRoles);
    
    assert.strictEqual(filteredComments.length, 3);
  });

  test('admin should see all comments', () => {
    const comments = [
      { id: '1', content: 'Public comment', isInternal: false },
      { id: '2', content: 'Internal comment', isInternal: true }
    ];
    
    const userRoles = ['admin'];
    const filteredComments = filterCommentsForUser(comments, userRoles);
    
    assert.strictEqual(filteredComments.length, 2);
  });

  test('user with no roles should only see public comments', () => {
    const comments = [
      { id: '1', content: 'Public comment', isInternal: false },
      { id: '2', content: 'Internal comment', isInternal: true }
    ];
    
    const userRoles = [];
    const filteredComments = filterCommentsForUser(comments, userRoles);
    
    assert.strictEqual(filteredComments.length, 1);
    assert.strictEqual(filteredComments[0].content, 'Public comment');
  });

  test('hr_agent should see all comments', () => {
    const comments = [
      { id: '1', content: 'Public comment', isInternal: false },
      { id: '2', content: 'Internal HR comment', isInternal: true }
    ];
    
    const userRoles = ['hr_agent'];
    const filteredComments = filterCommentsForUser(comments, userRoles);
    
    assert.strictEqual(filteredComments.length, 2);
  });

  test('canViewInternalComments returns correct permissions', () => {
    assert.strictEqual(canViewInternalComments(['end_user']), false);
    assert.strictEqual(canViewInternalComments(['technician']), true);
    assert.strictEqual(canViewInternalComments(['admin']), true);
    assert.strictEqual(canViewInternalComments(['hr_agent']), true);
    assert.strictEqual(canViewInternalComments([]), false);
    assert.strictEqual(canViewInternalComments(null), false);
    assert.strictEqual(canViewInternalComments(['end_user', 'technician']), true);
  });
});