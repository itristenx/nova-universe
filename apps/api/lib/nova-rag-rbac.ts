/**
 * Nova RAG RBAC (Role-Based Access Control) System
 *
 * Implements industry-standard role-based access controls for RAG document retrieval
 * and AI responses, ensuring proper data isolation and permission enforcement.
 *
 * Features:
 * - Role-based document access control
 * - Tenant isolation and multi-tenancy support
 * - Permission-aware document filtering
 * - Audit logging for access control decisions
 * - Dynamic policy evaluation
 * - Security classification handling
 */

import { EventEmitter } from 'events';
import { logger } from '../logger.js';
import crypto from 'crypto';

// RBAC Types and Interfaces
export interface RAGUser {
  id: string;
  email: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  securityClearance?: string;
  departmentId?: string;
  costCenter?: string;
  location?: string;
  attributes: Record<string, any>;
}

export interface RAGRole {
  id: string;
  name: string;
  description: string;
  tenantId: string;
  permissions: string[];
  inheritsFrom?: string[];
  conditions?: RAGCondition[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RAGPermission {
  id: string;
  name: string;
  resource: string;
  action: string;
  effect: 'allow' | 'deny';
  conditions?: RAGCondition[];
  description: string;
}

export interface RAGCondition {
  type: 'attribute' | 'time' | 'location' | 'context' | 'expression';
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'not_in' | 'contains' | 'matches' | 'exists';
  value: any;
  description?: string;
}

export interface RAGPolicy {
  id: string;
  name: string;
  description: string;
  tenantId: string;
  resources: string[];
  subjects: string[];
  actions: string[];
  effect: 'allow' | 'deny';
  conditions?: RAGCondition[];
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentPermission {
  documentId: string;
  tenantId: string;
  classification: 'public' | 'internal' | 'confidential' | 'restricted' | 'top_secret';
  accessControlList: {
    users: string[];
    roles: string[];
    departments: string[];
    conditions?: RAGCondition[];
  };
  metadata: {
    owner: string;
    createdBy: string;
    department: string;
    costCenter?: string;
    tags: string[];
    dataClassification: string;
    retentionPolicy?: string;
  };
}

export interface AccessDecision {
  granted: boolean;
  reason: string;
  policyId?: string;
  conditions?: string[];
  auditLog: {
    userId: string;
    resource: string;
    action: string;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
    context: Record<string, any>;
  };
}

export interface RAGAccessContext {
  userId: string;
  tenantId: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestType: 'query' | 'index' | 'manage' | 'test';
  resource: string;
  action: string;
  queryContext?: {
    query: string;
    intent: string;
    sensitivity: string;
  };
  metadata: Record<string, any>;
}

/**
 * Nova RAG RBAC System Implementation
 */
export class NovaRAGRBAC extends EventEmitter {
  private users: Map<string, RAGUser> = new Map();
  private roles: Map<string, RAGRole> = new Map();
  private permissions: Map<string, RAGPermission> = new Map();
  private policies: Map<string, RAGPolicy> = new Map();
  private documentPermissions: Map<string, DocumentPermission> = new Map();
  private auditLog: Map<string, any> = new Map();

  private isInitialized = false;
  
  // Configuration
  private config = {
    enableAuditLogging: true,
    enableConditionEvaluation: true,
    cacheDecisions: true,
    cacheTimeout: 300000, // 5 minutes
    strictMode: true,
    defaultDenyPolicy: true,
    tenantIsolation: true,
    maxAuditLogEntries: 10000,
  };

  // Decision cache for performance
  private decisionCache: Map<string, { decision: AccessDecision; timestamp: number }> = new Map();

  constructor() {
    super();
    this.initializeDefaultRoles();
    this.initializeDefaultPolicies();
  }

  /**
   * Initialize the RBAC system
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Nova RAG RBAC System...');

      // Load existing roles and policies from database
      await this.loadRolesFromDatabase();
      await this.loadPoliciesFromDatabase();
      await this.loadDocumentPermissions();

      // Set up audit log cleanup
      this.startAuditLogCleanup();

      this.isInitialized = true;
      this.emit('initialized');

      logger.info('Nova RAG RBAC System initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize RAG RBAC System:', error);
      throw error;
    }
  }

  /**
   * Check if a user has access to perform an action on a resource
   */
  async checkAccess(context: RAGAccessContext): Promise<AccessDecision> {
    if (!this.isInitialized) {
      throw new Error('RAG RBAC System not initialized');
    }

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(context);
      if (this.config.cacheDecisions) {
        const cached = this.decisionCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
          await this.logAccess(context, cached.decision);
          return cached.decision;
        }
      }

      // Get user
      const user = this.users.get(context.userId);
      if (!user) {
        const decision = this.createDenyDecision('User not found', context);
        await this.logAccess(context, decision);
        return decision;
      }

      // Check tenant isolation
      if (this.config.tenantIsolation && user.tenantId !== context.tenantId) {
        const decision = this.createDenyDecision('Tenant isolation violation', context);
        await this.logAccess(context, decision);
        return decision;
      }

      // Evaluate policies
      const decision = await this.evaluatePolicies(user, context);

      // Cache decision
      if (this.config.cacheDecisions) {
        this.decisionCache.set(cacheKey, { decision, timestamp: Date.now() });
      }

      // Log access
      await this.logAccess(context, decision);

      this.emit('accessDecision', { user, context, decision });

      return decision;
    } catch (error) {
      logger.error('Failed to check access:', error);
      const decision = this.createDenyDecision(`Access check failed: ${error.message}`, context);
      await this.logAccess(context, decision);
      return decision;
    }
  }

  /**
   * Filter documents based on user permissions
   */
  async filterDocuments(
    documents: any[],
    userId: string,
    tenantId: string,
    action: string = 'read'
  ): Promise<any[]> {
    const filteredDocuments = [];

    for (const doc of documents) {
      const context: RAGAccessContext = {
        userId,
        tenantId,
        requestType: 'query',
        resource: `document:${doc.id}`,
        action,
        metadata: {
          documentType: doc.metadata?.type,
          classification: doc.metadata?.classification,
        },
      };

      const decision = await this.checkAccess(context);
      if (decision.granted) {
        // Add access context to document metadata
        doc._ragAccess = {
          granted: true,
          conditions: decision.conditions,
          timestamp: new Date(),
        };
        filteredDocuments.push(doc);
      }
    }

    return filteredDocuments;
  }

  /**
   * Check document-level permissions
   */
  async checkDocumentAccess(
    documentId: string,
    userId: string,
    tenantId: string,
    action: string = 'read'
  ): Promise<AccessDecision> {
    const docPermission = this.documentPermissions.get(documentId);
    if (!docPermission) {
      // Document has no specific permissions - use default policy
      return this.checkAccess({
        userId,
        tenantId,
        requestType: 'query',
        resource: `document:${documentId}`,
        action,
        metadata: {},
      });
    }

    // Check document-specific ACL
    const user = this.users.get(userId);
    if (!user) {
      return this.createDenyDecision('User not found', {
        userId,
        tenantId,
        requestType: 'query',
        resource: `document:${documentId}`,
        action,
        metadata: {},
      });
    }

    // Check if user is in ACL
    const acl = docPermission.accessControlList;
    let hasAccess = false;

    // Check direct user access
    if (acl.users.includes(userId)) {
      hasAccess = true;
    }

    // Check role-based access
    if (!hasAccess) {
      for (const role of user.roles) {
        if (acl.roles.includes(role)) {
          hasAccess = true;
          break;
        }
      }
    }

    // Check department access
    if (!hasAccess && user.departmentId) {
      if (acl.departments.includes(user.departmentId)) {
        hasAccess = true;
      }
    }

    // Evaluate conditions if present
    if (hasAccess && acl.conditions) {
      const conditionResult = await this.evaluateConditions(acl.conditions, user, {
        userId,
        tenantId,
        requestType: 'query',
        resource: `document:${documentId}`,
        action,
        metadata: { documentPermission: docPermission },
      });

      if (!conditionResult.passed) {
        hasAccess = false;
      }
    }

    const context: RAGAccessContext = {
      userId,
      tenantId,
      requestType: 'query',
      resource: `document:${documentId}`,
      action,
      metadata: { documentPermission: docPermission },
    };

    if (hasAccess) {
      return this.createAllowDecision('Document ACL granted access', context, docPermission.id);
    } else {
      return this.createDenyDecision('Document ACL denied access', context);
    }
  }

  /**
   * Create or update a user
   */
  async createUser(user: Omit<RAGUser, 'id'>): Promise<string> {
    const userId = crypto.randomUUID();
    const fullUser: RAGUser = {
      ...user,
      id: userId,
    };

    this.users.set(userId, fullUser);
    
    logger.info('RAG user created', { userId, email: user.email, tenantId: user.tenantId });
    this.emit('userCreated', fullUser);

    return userId;
  }

  /**
   * Create or update a role
   */
  async createRole(role: Omit<RAGRole, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const roleId = crypto.randomUUID();
    const fullRole: RAGRole = {
      ...role,
      id: roleId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.roles.set(roleId, fullRole);
    
    logger.info('RAG role created', { roleId, name: role.name, tenantId: role.tenantId });
    this.emit('roleCreated', fullRole);

    return roleId;
  }

  /**
   * Create or update a policy
   */
  async createPolicy(policy: Omit<RAGPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const policyId = crypto.randomUUID();
    const fullPolicy: RAGPolicy = {
      ...policy,
      id: policyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.policies.set(policyId, fullPolicy);
    
    logger.info('RAG policy created', { policyId, name: policy.name, tenantId: policy.tenantId });
    this.emit('policyCreated', fullPolicy);

    return policyId;
  }

  /**
   * Set document permissions
   */
  async setDocumentPermission(permission: DocumentPermission): Promise<void> {
    this.documentPermissions.set(permission.documentId, permission);
    
    logger.info('Document permission set', {
      documentId: permission.documentId,
      classification: permission.classification,
      tenantId: permission.tenantId,
    });
    
    this.emit('documentPermissionSet', permission);
  }

  /**
   * Test RBAC configuration with various scenarios
   */
  async testRBACConfiguration(): Promise<any> {
    const testResults = {
      timestamp: new Date(),
      testsPassed: 0,
      testsFailed: 0,
      tests: [],
    };

    // Test scenarios
    const testScenarios = [
      {
        name: 'Admin can access all documents',
        userId: 'admin-user',
        tenantId: 'test-tenant',
        resource: 'document:test-doc',
        action: 'read',
        expectedResult: true,
      },
      {
        name: 'Regular user cannot access confidential documents',
        userId: 'regular-user',
        tenantId: 'test-tenant',
        resource: 'document:confidential-doc',
        action: 'read',
        expectedResult: false,
      },
      {
        name: 'Cross-tenant access is denied',
        userId: 'user-tenant-a',
        tenantId: 'tenant-b',
        resource: 'document:tenant-b-doc',
        action: 'read',
        expectedResult: false,
      },
      {
        name: 'Department access works correctly',
        userId: 'hr-user',
        tenantId: 'test-tenant',
        resource: 'document:hr-doc',
        action: 'read',
        expectedResult: true,
      },
    ];

    for (const scenario of testScenarios) {
      try {
        const context: RAGAccessContext = {
          userId: scenario.userId,
          tenantId: scenario.tenantId,
          requestType: 'test',
          resource: scenario.resource,
          action: scenario.action,
          metadata: { testScenario: scenario.name },
        };

        const decision = await this.checkAccess(context);
        const passed = decision.granted === scenario.expectedResult;

        testResults.tests.push({
          scenario: scenario.name,
          passed,
          expected: scenario.expectedResult,
          actual: decision.granted,
          reason: decision.reason,
        });

        if (passed) {
          testResults.testsPassed++;
        } else {
          testResults.testsFailed++;
        }
      } catch (error) {
        testResults.tests.push({
          scenario: scenario.name,
          passed: false,
          error: error.message,
        });
        testResults.testsFailed++;
      }
    }

    logger.info('RBAC test completed', {
      passed: testResults.testsPassed,
      failed: testResults.testsFailed,
      total: testResults.tests.length,
    });

    return testResults;
  }

  /**
   * Get audit logs for analysis
   */
  getAuditLogs(filters?: {
    userId?: string;
    tenantId?: string;
    resource?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): any[] {
    let logs = Array.from(this.auditLog.values());

    if (filters) {
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }
      if (filters.tenantId) {
        logs = logs.filter(log => log.tenantId === filters.tenantId);
      }
      if (filters.resource) {
        logs = logs.filter(log => log.resource === filters.resource);
      }
      if (filters.action) {
        logs = logs.filter(log => log.action === filters.action);
      }
      if (filters.startDate) {
        logs = logs.filter(log => log.timestamp >= filters.startDate);
      }
      if (filters.endDate) {
        logs = logs.filter(log => log.timestamp <= filters.endDate);
      }
    }

    // Sort by timestamp descending
    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filters?.limit) {
      logs = logs.slice(0, filters.limit);
    }

    return logs;
  }

  /**
   * Get RBAC statistics
   */
  getStats(): any {
    return {
      users: this.users.size,
      roles: this.roles.size,
      permissions: this.permissions.size,
      policies: this.policies.size,
      documentPermissions: this.documentPermissions.size,
      auditLogs: this.auditLog.size,
      cacheEntries: this.decisionCache.size,
      config: this.config,
      isInitialized: this.isInitialized,
    };
  }

  // Private methods
  private async evaluatePolicies(user: RAGUser, context: RAGAccessContext): Promise<AccessDecision> {
    const applicablePolicies = Array.from(this.policies.values()).filter(policy =>
      policy.isActive &&
      policy.tenantId === context.tenantId &&
      this.policyApplies(policy, user, context)
    );

    // Sort by priority (higher priority first)
    applicablePolicies.sort((a, b) => b.priority - a.priority);

    // Evaluate each policy
    for (const policy of applicablePolicies) {
      const evaluation = await this.evaluatePolicy(policy, user, context);
      if (evaluation) {
        if (policy.effect === 'allow') {
          return this.createAllowDecision(`Policy ${policy.name} granted access`, context, policy.id);
        } else {
          return this.createDenyDecision(`Policy ${policy.name} denied access`, context);
        }
      }
    }

    // Default deny if no policy matched and strict mode is enabled
    if (this.config.defaultDenyPolicy) {
      return this.createDenyDecision('No matching policy found - default deny', context);
    }

    return this.createAllowDecision('No deny policy found - default allow', context);
  }

  private policyApplies(policy: RAGPolicy, user: RAGUser, context: RAGAccessContext): boolean {
    // Check if policy applies to the resource
    if (policy.resources.length > 0) {
      const resourceMatches = policy.resources.some(resource =>
        this.resourceMatches(resource, context.resource)
      );
      if (!resourceMatches) return false;
    }

    // Check if policy applies to the user/role
    if (policy.subjects.length > 0) {
      const subjectMatches = policy.subjects.some(subject => {
        if (subject.startsWith('user:')) {
          return subject.substring(5) === user.id;
        }
        if (subject.startsWith('role:')) {
          return user.roles.includes(subject.substring(5));
        }
        if (subject.startsWith('department:')) {
          return user.departmentId === subject.substring(11);
        }
        return false;
      });
      if (!subjectMatches) return false;
    }

    // Check if policy applies to the action
    if (policy.actions.length > 0) {
      if (!policy.actions.includes(context.action)) return false;
    }

    return true;
  }

  private async evaluatePolicy(policy: RAGPolicy, user: RAGUser, context: RAGAccessContext): Promise<boolean> {
    // Check basic applicability
    if (!this.policyApplies(policy, user, context)) {
      return false;
    }

    // Evaluate conditions if present
    if (policy.conditions && policy.conditions.length > 0) {
      const conditionResult = await this.evaluateConditions(policy.conditions, user, context);
      return conditionResult.passed;
    }

    return true;
  }

  private async evaluateConditions(
    conditions: RAGCondition[],
    user: RAGUser,
    context: RAGAccessContext
  ): Promise<{ passed: boolean; failedConditions: string[] }> {
    const failedConditions: string[] = [];

    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition, user, context);
      if (!result) {
        failedConditions.push(condition.description || `${condition.field} ${condition.operator} ${condition.value}`);
      }
    }

    return {
      passed: failedConditions.length === 0,
      failedConditions,
    };
  }

  private async evaluateCondition(
    condition: RAGCondition,
    user: RAGUser,
    context: RAGAccessContext
  ): Promise<boolean> {
    let actualValue: any;

    // Get the actual value based on condition type
    switch (condition.type) {
      case 'attribute':
        actualValue = user.attributes[condition.field] || user[condition.field as keyof RAGUser];
        break;
      case 'time':
        actualValue = new Date();
        break;
      case 'location':
        actualValue = user.location;
        break;
      case 'context':
        actualValue = context.metadata[condition.field];
        break;
      case 'expression':
        // Evaluate custom expression (simplified implementation)
        return this.evaluateExpression(condition.value, user, context);
      default:
        return false;
    }

    // Evaluate the condition
    switch (condition.operator) {
      case 'eq':
        return actualValue === condition.value;
      case 'ne':
        return actualValue !== condition.value;
      case 'gt':
        return actualValue > condition.value;
      case 'lt':
        return actualValue < condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(actualValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(actualValue);
      case 'contains':
        return typeof actualValue === 'string' && actualValue.includes(condition.value);
      case 'matches':
        return typeof actualValue === 'string' && new RegExp(condition.value).test(actualValue);
      case 'exists':
        return actualValue !== undefined && actualValue !== null;
      default:
        return false;
    }
  }

  private evaluateExpression(expression: string, user: RAGUser, context: RAGAccessContext): boolean {
    // Simplified expression evaluation - in production, use a proper expression parser
    try {
      // Replace placeholders with actual values
      const processed = expression
        .replace(/\$user\.([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, field) => {
          const value = user[field as keyof RAGUser] || user.attributes[field];
          return typeof value === 'string' ? `"${value}"` : String(value);
        })
        .replace(/\$context\.([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, field) => {
          const value = context.metadata[field];
          return typeof value === 'string' ? `"${value}"` : String(value);
        });

      // WARNING: eval is dangerous - use a proper expression evaluator in production
      return eval(processed);
    } catch (error) {
      logger.warn('Failed to evaluate expression:', { expression, error: error.message });
      return false;
    }
  }

  private resourceMatches(pattern: string, resource: string): boolean {
    // Support wildcard matching
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(resource);
    }
    return pattern === resource;
  }

  private generateCacheKey(context: RAGAccessContext): string {
    return crypto
      .createHash('sha256')
      .update(`${context.userId}:${context.tenantId}:${context.resource}:${context.action}`)
      .digest('hex');
  }

  private createAllowDecision(reason: string, context: RAGAccessContext, policyId?: string): AccessDecision {
    return {
      granted: true,
      reason,
      policyId,
      auditLog: {
        userId: context.userId,
        resource: context.resource,
        action: context.action,
        timestamp: new Date(),
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        context: context.metadata,
      },
    };
  }

  private createDenyDecision(reason: string, context: RAGAccessContext): AccessDecision {
    return {
      granted: false,
      reason,
      auditLog: {
        userId: context.userId,
        resource: context.resource,
        action: context.action,
        timestamp: new Date(),
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        context: context.metadata,
      },
    };
  }

  private async logAccess(context: RAGAccessContext, decision: AccessDecision): Promise<void> {
    if (!this.config.enableAuditLogging) return;

    const logEntry = {
      id: crypto.randomUUID(),
      userId: context.userId,
      tenantId: context.tenantId,
      resource: context.resource,
      action: context.action,
      granted: decision.granted,
      reason: decision.reason,
      policyId: decision.policyId,
      timestamp: new Date(),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      context: context.metadata,
    };

    this.auditLog.set(logEntry.id, logEntry);

    // Cleanup old entries if needed
    if (this.auditLog.size > this.config.maxAuditLogEntries) {
      const entries = Array.from(this.auditLog.entries());
      entries.sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime());
      const toDelete = entries.slice(0, entries.length - this.config.maxAuditLogEntries);
      toDelete.forEach(([id]) => this.auditLog.delete(id));
    }

    this.emit('accessLogged', logEntry);
  }

  private initializeDefaultRoles(): void {
    const defaultRoles = [
      {
        name: 'admin',
        description: 'Full system administrator',
        tenantId: 'system',
        permissions: ['*'],
        isActive: true,
      },
      {
        name: 'viewer',
        description: 'Read-only access to public documents',
        tenantId: 'system',
        permissions: ['document:read:public'],
        isActive: true,
      },
      {
        name: 'knowledge_manager',
        description: 'Manage knowledge base articles',
        tenantId: 'system',
        permissions: ['document:read', 'document:write:kb_article'],
        isActive: true,
      },
      {
        name: 'support_agent',
        description: 'Access tickets and support documents',
        tenantId: 'system',
        permissions: ['document:read:ticket', 'document:read:kb_article', 'document:write:ticket'],
        isActive: true,
      },
    ];

    for (const role of defaultRoles) {
      this.createRole(role);
    }
  }

  private initializeDefaultPolicies(): void {
    const defaultPolicies = [
      {
        name: 'Admin Full Access',
        description: 'Administrators have full access to all resources',
        tenantId: 'system',
        resources: ['*'],
        subjects: ['role:admin'],
        actions: ['*'],
        effect: 'allow' as const,
        priority: 100,
        isActive: true,
      },
      {
        name: 'Public Document Access',
        description: 'All users can read public documents',
        tenantId: 'system',
        resources: ['document:*'],
        subjects: ['*'],
        actions: ['read'],
        effect: 'allow' as const,
        conditions: [
          {
            type: 'context',
            field: 'classification',
            operator: 'eq',
            value: 'public',
          },
        ],
        priority: 50,
        isActive: true,
      },
      {
        name: 'Confidential Document Restriction',
        description: 'Restrict access to confidential documents',
        tenantId: 'system',
        resources: ['document:*'],
        subjects: ['*'],
        actions: ['*'],
        effect: 'deny' as const,
        conditions: [
          {
            type: 'context',
            field: 'classification',
            operator: 'in',
            value: ['confidential', 'restricted', 'top_secret'],
          },
        ],
        priority: 75,
        isActive: true,
      },
    ];

    for (const policy of defaultPolicies) {
      this.createPolicy(policy);
    }
  }

  private async loadRolesFromDatabase(): Promise<void> {
    // In a real implementation, load from database
    logger.info('Loading roles from database...');
  }

  private async loadPoliciesFromDatabase(): Promise<void> {
    // In a real implementation, load from database
    logger.info('Loading policies from database...');
  }

  private async loadDocumentPermissions(): Promise<void> {
    // In a real implementation, load from database
    logger.info('Loading document permissions from database...');
  }

  private startAuditLogCleanup(): void {
    // Clean up old audit logs every hour
    setInterval(() => {
      const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
      const entries = Array.from(this.auditLog.entries());
      const toDelete = entries.filter(([_, entry]) => entry.timestamp < cutoff);
      toDelete.forEach(([id]) => this.auditLog.delete(id));
      
      if (toDelete.length > 0) {
        logger.info(`Cleaned up ${toDelete.length} old audit log entries`);
      }
    }, 60 * 60 * 1000); // Every hour
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down Nova RAG RBAC System...');
    this.isInitialized = false;
    logger.info('Nova RAG RBAC System shutdown complete');
  }
}

// Export singleton instance
export const ragRBAC = new NovaRAGRBAC();