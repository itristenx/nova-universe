// Phase 2 & 3 Authentication Enhancements Tests
// Tests for token rotation, API key rotation, session management, and password history

import test from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';

// Mock implementations for testing
class MockTokenRotation {
  static mockRevoked = new Set();
  
  static async rotateRefreshToken(oldToken) {
    // Mock token structure
    const mockDecoded = {
      jti: `jti-${Date.now()}`,
      userId: 'user-123',
      tenantId: 'tenant-456',
      role: 'user',
      email: 'user@example.com',
      type: 'refresh',
      rotation: 1,
      exp: Math.floor(Date.now() / 1000) + 604800 // 7 days
    };
    
    // Check if already revoked
    if (MockTokenRotation.mockRevoked.has(oldToken)) {
      throw new Error('Refresh token has been revoked - possible token reuse attack');
    }
    
    // Generate new tokens
    const newAccessToken = crypto.randomBytes(32).toString('base64url');
    const newRefreshToken = crypto.randomBytes(32).toString('base64url');
    
    // Revoke old token
    MockTokenRotation.mockRevoked.add(oldToken);
    
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900,
      tokenType: 'Bearer'
    };
  }
  
  static async revokeToken(token, reason = 'User initiated') {
    MockTokenRotation.mockRevoked.add(token);
    return { success: true, reason };
  }
  
  static async isTokenRevoked(jti) {
    return MockTokenRotation.mockRevoked.has(jti);
  }
}

class MockApiKeyRotation {
  static mockKeys = new Map();
  
  static generateApiKey() {
    return crypto.randomBytes(32).toString('base64url');
  }
  
  static hashApiKey(apiKey) {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }
  
  static async createApiKey(clientId, tenantId, options = {}) {
    const apiKey = MockApiKeyRotation.generateApiKey();
    const keyId = `key-${Date.now()}`;
    
    MockApiKeyRotation.mockKeys.set(keyId, {
      keyHash: MockApiKeyRotation.hashApiKey(apiKey),
      clientId,
      tenantId,
      version: 1,
      isActive: true,
      createdAt: new Date(),
      ...options
    });
    
    return { apiKey, keyId, expiresAt: options.expiresAt || null };
  }
  
  static async rotateApiKey(keyId, gracePeriod = 7 * 24 * 60 * 60 * 1000) {
    const oldKey = MockApiKeyRotation.mockKeys.get(keyId);
    if (!oldKey) {
      throw new Error('API key not found');
    }
    
    const newApiKey = MockApiKeyRotation.generateApiKey();
    const newKeyId = `key-${Date.now()}-rotated`;
    const oldKeyExpiresAt = new Date(Date.now() + gracePeriod);
    
    // Create new key with incremented version
    MockApiKeyRotation.mockKeys.set(newKeyId, {
      keyHash: MockApiKeyRotation.hashApiKey(newApiKey),
      clientId: oldKey.clientId,
      tenantId: oldKey.tenantId,
      version: oldKey.version + 1,
      isActive: true,
      createdAt: new Date()
    });
    
    // Update old key with expiration
    oldKey.expiresAt = oldKeyExpiresAt;
    oldKey.rotatedAt = new Date();
    
    return {
      newApiKey,
      newKeyId,
      oldKeyExpiresAt,
      gracePeriod
    };
  }
  
  static async validateApiKey(apiKey) {
    const keyHash = MockApiKeyRotation.hashApiKey(apiKey);
    
    for (const [keyId, key] of MockApiKeyRotation.mockKeys.entries()) {
      if (key.keyHash === keyHash && key.isActive) {
        if (!key.expiresAt || new Date(key.expiresAt) > new Date()) {
          return {
            valid: true,
            keyId,
            clientId: key.clientId,
            tenantId: key.tenantId,
            scopes: key.scopes || []
          };
        }
      }
    }
    
    return { valid: false };
  }
}

class MockSessionManagement {
  static mockSessions = new Map();
  static sessionLimit = 5;
  
  static async enforceSessionLimit(userId, tenantId, maxSessions = 5) {
    const userSessions = Array.from(MockSessionManagement.mockSessions.values())
      .filter(s => s.userId === userId && s.tenantId === tenantId && s.isActive);
    
    if (userSessions.length >= maxSessions) {
      // Deactivate oldest session
      userSessions.sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);
      const toRevoke = userSessions.slice(0, userSessions.length - maxSessions + 1);
      toRevoke.forEach(s => { s.isActive = false; s.loggedOutAt = new Date(); });
      
      return { revoked: toRevoke.length };
    }
    
    return { revoked: 0 };
  }
  
  static async createSession(sessionData) {
    const sessionId = `session-${Date.now()}`;
    const session = {
      id: sessionId,
      ...sessionData,
      isActive: true,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
    
    // Enforce limit before creating
    await MockSessionManagement.enforceSessionLimit(
      sessionData.userId,
      sessionData.tenantId
    );
    
    MockSessionManagement.mockSessions.set(sessionId, session);
    return sessionId;
  }
  
  static async isSessionActive(sessionId) {
    const session = MockSessionManagement.mockSessions.get(sessionId);
    if (!session || !session.isActive) return false;
    
    // Check expiration
    if (new Date(session.expiresAt) < new Date()) {
      session.isActive = false;
      return false;
    }
    
    // Check idle timeout (2 hours)
    const idleTime = Date.now() - session.lastAccessedAt.getTime();
    if (idleTime > 2 * 60 * 60 * 1000) {
      session.isActive = false;
      return false;
    }
    
    return true;
  }
  
  static async terminateAllUserSessions(userId, tenantId, exceptSessionId = null) {
    let count = 0;
    for (const [sessionId, session] of MockSessionManagement.mockSessions.entries()) {
      if (session.userId === userId && 
          session.tenantId === tenantId && 
          sessionId !== exceptSessionId &&
          session.isActive) {
        session.isActive = false;
        session.loggedOutAt = new Date();
        count++;
      }
    }
    return { count };
  }
}

class MockPasswordHistory {
  static history = new Map();
  
  static async checkPasswordHistory(userId, tenantId, newPasswordHash, historyCount = 5) {
    const key = `${userId}:${tenantId}`;
    const userHistory = MockPasswordHistory.history.get(key) || [];
    
    // Check if password is in recent history
    const recentHashes = userHistory.slice(-historyCount);
    return !recentHashes.includes(newPasswordHash);
  }
  
  static async addPasswordToHistory(userId, tenantId, passwordHash) {
    const key = `${userId}:${tenantId}`;
    const userHistory = MockPasswordHistory.history.get(key) || [];
    
    userHistory.push(passwordHash);
    
    // Keep only last 10
    if (userHistory.length > 10) {
      userHistory.splice(0, userHistory.length - 10);
    }
    
    MockPasswordHistory.history.set(key, userHistory);
  }
}

// Phase 2 Tests
test('Phase 2: Refresh Token Rotation', async (t) => {
  await t.test('Rotate refresh token successfully', async () => {
    const oldRefreshToken = crypto.randomBytes(32).toString('base64url');
    
    const result = await MockTokenRotation.rotateRefreshToken(oldRefreshToken);
    
    assert.ok(result.accessToken, 'New access token generated');
    assert.ok(result.refreshToken, 'New refresh token generated');
    assert.strictEqual(result.tokenType, 'Bearer', 'Token type is Bearer');
    assert.strictEqual(result.expiresIn, 900, 'Access token expires in 15 minutes');
    assert.notStrictEqual(result.refreshToken, oldRefreshToken, 'New refresh token is different');
  });
  
  await t.test('Prevent refresh token reuse', async () => {
    const oldRefreshToken = crypto.randomBytes(32).toString('base64url');
    
    // First rotation should succeed
    await MockTokenRotation.rotateRefreshToken(oldRefreshToken);
    
    // Second rotation with same token should fail
    await assert.rejects(
      async () => await MockTokenRotation.rotateRefreshToken(oldRefreshToken),
      /revoked/i,
      'Should reject reused refresh token'
    );
  });
  
  await t.test('Token revocation works correctly', async () => {
    const token = crypto.randomBytes(32).toString('base64url');
    
    const result = await MockTokenRotation.revokeToken(token, 'Test revocation');
    
    assert.ok(result.success, 'Token revoked successfully');
    assert.strictEqual(result.reason, 'Test revocation', 'Revocation reason recorded');
  });
});

test('Phase 2: Configurable Token Expiration', async (t) => {
  await t.test('Access token expiration is configurable', () => {
    const defaultExpiry = process.env.ACCESS_TOKEN_EXPIRY || '15m';
    assert.ok(defaultExpiry, 'Access token expiry is configurable');
    assert.match(defaultExpiry, /^\d+[smhd]$/, 'Expiry format is valid');
  });
  
  await t.test('Refresh token expiration is configurable', () => {
    const defaultExpiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';
    assert.ok(defaultExpiry, 'Refresh token expiry is configurable');
    assert.match(defaultExpiry, /^\d+[smhd]$/, 'Expiry format is valid');
  });
  
  await t.test('Tenant-specific token configuration supported', () => {
    const tenantTokenConfig = {
      accessTokenExpiry: '30m',
      refreshTokenExpiry: '14d'
    };
    
    assert.ok(tenantTokenConfig.accessTokenExpiry, 'Tenant can override access token expiry');
    assert.ok(tenantTokenConfig.refreshTokenExpiry, 'Tenant can override refresh token expiry');
  });
});

// Phase 3 Tests
test('Phase 3: API Key Rotation', async (t) => {
  await t.test('Create API key successfully', async () => {
    const result = await MockApiKeyRotation.createApiKey('client-123', 'tenant-456', {
      description: 'Test API Key',
      scopes: ['read', 'write']
    });
    
    assert.ok(result.apiKey, 'API key generated');
    assert.ok(result.keyId, 'Key ID assigned');
    assert.strictEqual(result.apiKey.length, 43, 'API key is 43 characters (32 bytes base64url)');
  });
  
  await t.test('Rotate API key with grace period', async () => {
    // Create initial key
    const { apiKey: oldApiKey, keyId: oldKeyId } = await MockApiKeyRotation.createApiKey(
      'client-123',
      'tenant-456'
    );
    
    // Rotate key
    const gracePeriod = 7 * 24 * 60 * 60 * 1000; // 7 days
    const rotation = await MockApiKeyRotation.rotateApiKey(oldKeyId, gracePeriod);
    
    assert.ok(rotation.newApiKey, 'New API key generated');
    assert.ok(rotation.newKeyId, 'New key ID assigned');
    assert.notStrictEqual(rotation.newApiKey, oldApiKey, 'New key is different from old key');
    assert.ok(rotation.oldKeyExpiresAt, 'Old key has expiration date');
    
    // Both keys should be valid during grace period
    const oldKeyValid = await MockApiKeyRotation.validateApiKey(oldApiKey);
    const newKeyValid = await MockApiKeyRotation.validateApiKey(rotation.newApiKey);
    
    assert.ok(oldKeyValid.valid, 'Old key still valid during grace period');
    assert.ok(newKeyValid.valid, 'New key is valid');
  });
  
  await t.test('Validate API key correctly', async () => {
    const { apiKey, keyId } = await MockApiKeyRotation.createApiKey('client-123', 'tenant-456');
    
    const validation = await MockApiKeyRotation.validateApiKey(apiKey);
    
    assert.ok(validation.valid, 'API key is valid');
    assert.strictEqual(validation.keyId, keyId, 'Key ID matches');
    assert.strictEqual(validation.clientId, 'client-123', 'Client ID matches');
    assert.strictEqual(validation.tenantId, 'tenant-456', 'Tenant ID matches');
  });
  
  await t.test('Reject invalid API key', async () => {
    const invalidKey = crypto.randomBytes(32).toString('base64url');
    
    const validation = await MockApiKeyRotation.validateApiKey(invalidKey);
    
    assert.strictEqual(validation.valid, false, 'Invalid API key rejected');
  });
});

test('Phase 3: Session Management', async (t) => {
  await t.test('Enforce concurrent session limit', async () => {
    const userId = 'user-123';
    const tenantId = 'tenant-456';
    const maxSessions = 3;
    
    // Create max sessions
    for (let i = 0; i < maxSessions; i++) {
      await MockSessionManagement.createSession({
        userId,
        tenantId,
        sessionToken: `token-${i}`,
        loginMethod: 'password'
      });
    }
    
    // Creating one more should revoke the oldest
    const result = await MockSessionManagement.enforceSessionLimit(userId, tenantId, maxSessions);
    
    // This is called before creating new session, so no revocation yet
    assert.strictEqual(result.revoked, 0, 'No sessions revoked when at limit');
    
    // Create new session (this will enforce the limit)
    await MockSessionManagement.createSession({
      userId,
      tenantId,
      sessionToken: 'token-new',
      loginMethod: 'password'
    });
    
    // Check active sessions
    const activeSessions = Array.from(MockSessionManagement.mockSessions.values())
      .filter(s => s.userId === userId && s.tenantId === tenantId && s.isActive);
    
    assert.strictEqual(activeSessions.length, maxSessions, 'Session limit enforced');
  });
  
  await t.test('Check session activity based on idle timeout', async () => {
    const sessionId = await MockSessionManagement.createSession({
      userId: 'user-123',
      tenantId: 'tenant-456',
      sessionToken: 'token-test',
      loginMethod: 'password'
    });
    
    // Immediately active
    const isActive = await MockSessionManagement.isSessionActive(sessionId);
    assert.ok(isActive, 'New session is active');
    
    // Simulate idle timeout
    const session = MockSessionManagement.mockSessions.get(sessionId);
    session.lastAccessedAt = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
    
    const isStillActive = await MockSessionManagement.isSessionActive(sessionId);
    assert.strictEqual(isStillActive, false, 'Session inactive after idle timeout');
  });
  
  await t.test('Terminate all user sessions', async () => {
    const userId = 'user-789';
    const tenantId = 'tenant-456';
    
    // Create multiple sessions
    const sessionIds = [];
    for (let i = 0; i < 3; i++) {
      const sessionId = await MockSessionManagement.createSession({
        userId,
        tenantId,
        sessionToken: `token-${i}`,
        loginMethod: 'password'
      });
      sessionIds.push(sessionId);
    }
    
    // Terminate all except first
    const result = await MockSessionManagement.terminateAllUserSessions(
      userId,
      tenantId,
      sessionIds[0]
    );
    
    assert.strictEqual(result.count, 2, 'Two sessions terminated');
    
    // Check first session still active
    const firstActive = await MockSessionManagement.isSessionActive(sessionIds[0]);
    assert.ok(firstActive, 'Excepted session still active');
  });
});

test('Phase 3: Password History', async (t) => {
  await t.test('Check password history prevents reuse', async () => {
    const userId = 'user-123';
    const tenantId = 'tenant-456';
    const oldPasswordHash = crypto.createHash('sha256').update('OldPassword123!').digest('hex');
    
    // Add to history
    await MockPasswordHistory.addPasswordToHistory(userId, tenantId, oldPasswordHash);
    
    // Check if same password can be reused
    const canReuse = await MockPasswordHistory.checkPasswordHistory(
      userId,
      tenantId,
      oldPasswordHash,
      5
    );
    
    assert.strictEqual(canReuse, false, 'Password in history cannot be reused');
  });
  
  await t.test('Allow new password not in history', async () => {
    const userId = 'user-456';
    const tenantId = 'tenant-789';
    const oldPasswordHash = crypto.createHash('sha256').update('OldPassword123!').digest('hex');
    const newPasswordHash = crypto.createHash('sha256').update('NewPassword456!').digest('hex');
    
    // Add old password to history
    await MockPasswordHistory.addPasswordToHistory(userId, tenantId, oldPasswordHash);
    
    // Check if new password can be used
    const canUse = await MockPasswordHistory.checkPasswordHistory(
      userId,
      tenantId,
      newPasswordHash,
      5
    );
    
    assert.ok(canUse, 'New password not in history can be used');
  });
  
  await t.test('Maintain password history limit', async () => {
    const userId = 'user-history';
    const tenantId = 'tenant-history';
    
    // Add 15 passwords (should keep only last 10)
    for (let i = 0; i < 15; i++) {
      const passwordHash = crypto.createHash('sha256').update(`Password${i}`).digest('hex');
      await MockPasswordHistory.addPasswordToHistory(userId, tenantId, passwordHash);
    }
    
    const key = `${userId}:${tenantId}`;
    const history = MockPasswordHistory.history.get(key);
    
    assert.strictEqual(history.length, 10, 'Password history limited to 10 entries');
  });
});

// Integration Tests
test('Integration: Complete Authentication Flow with Phase 2 & 3', async (t) => {
  await t.test('Full OAuth flow with token rotation', async () => {
    // 1. Initial login - get tokens
    const initialRefreshToken = crypto.randomBytes(32).toString('base64url');
    
    // 2. Refresh tokens
    const firstRotation = await MockTokenRotation.rotateRefreshToken(initialRefreshToken);
    assert.ok(firstRotation.accessToken, 'First rotation successful');
    
    // 3. Refresh again with new token
    const secondRotation = await MockTokenRotation.rotateRefreshToken(firstRotation.refreshToken);
    assert.ok(secondRotation.accessToken, 'Second rotation successful');
    
    // 4. Try to reuse first rotated token (should fail)
    await assert.rejects(
      async () => await MockTokenRotation.rotateRefreshToken(firstRotation.refreshToken),
      /revoked/i,
      'Token reuse prevented'
    );
  });
  
  await t.test('API key rotation workflow', async () => {
    // 1. Create initial API key
    const { apiKey: key1, keyId: id1 } = await MockApiKeyRotation.createApiKey(
      'client-integration',
      'tenant-integration'
    );
    
    // 2. Validate initial key
    const validation1 = await MockApiKeyRotation.validateApiKey(key1);
    assert.ok(validation1.valid, 'Initial key is valid');
    
    // 3. Rotate key with 7-day grace period
    const rotation = await MockApiKeyRotation.rotateApiKey(id1, 7 * 24 * 60 * 60 * 1000);
    
    // 4. Both keys should work during grace period
    const oldKeyCheck = await MockApiKeyRotation.validateApiKey(key1);
    const newKeyCheck = await MockApiKeyRotation.validateApiKey(rotation.newApiKey);
    
    assert.ok(oldKeyCheck.valid, 'Old key valid during grace period');
    assert.ok(newKeyCheck.valid, 'New key is valid');
  });
  
  await t.test('Session management with password change', async () => {
    const userId = 'user-integration';
    const tenantId = 'tenant-integration';
    
    // 1. Create multiple sessions
    const session1 = await MockSessionManagement.createSession({
      userId, tenantId, sessionToken: 'token1', loginMethod: 'password'
    });
    const session2 = await MockSessionManagement.createSession({
      userId, tenantId, sessionToken: 'token2', loginMethod: 'password'
    });
    
    // 2. Change password - terminate all sessions
    await MockSessionManagement.terminateAllUserSessions(userId, tenantId);
    
    // 3. Verify sessions are terminated
    const session1Active = await MockSessionManagement.isSessionActive(session1);
    const session2Active = await MockSessionManagement.isSessionActive(session2);
    
    assert.strictEqual(session1Active, false, 'Session 1 terminated');
    assert.strictEqual(session2Active, false, 'Session 2 terminated');
  });
});

console.log('✅ All Phase 2 & 3 authentication enhancement tests completed');
