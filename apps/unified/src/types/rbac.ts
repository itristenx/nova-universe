// RBAC & Security Types
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  department: string;
  manager_id?: string;
  active: boolean;
  roles: Role[];
  groups: Group[];
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  locked_out: boolean;
  failed_login_attempts: number;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom';
  permissions: Permission[];
  conditions?: RoleCondition[];
  active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  elevated_privilege: boolean;
  requires_approval: boolean;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: PermissionAction;
  conditions?: string[];
  scope: PermissionScope;
}

export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'execute'
  | 'approve'
  | 'admin';
export type PermissionScope = 'global' | 'department' | 'group' | 'self' | 'conditional';

export interface Group {
  id: string;
  name: string;
  description: string;
  type: 'department' | 'functional' | 'approval' | 'security';
  members: string[]; // user IDs
  roles: Role[];
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RoleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'starts_with';
  value: string | string[];
}

// Approval System Types
export interface ApprovalFlow {
  id: string;
  name: string;
  description: string;
  trigger_table: string;
  trigger_conditions: ApprovalCondition[];
  steps: ApprovalStep[];
  active: boolean;
  version: number;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  audit_enabled: boolean;
}

export interface ApprovalStep {
  id: string;
  order: number;
  name: string;
  type: 'user' | 'group' | 'role' | 'manager' | 'script';
  approvers: ApprovalApprover[];
  approval_type: 'any' | 'all' | 'majority' | 'unanimous';
  timeout_hours?: number;
  escalation_rules: EscalationRule[];
  conditions?: ApprovalCondition[];
  auto_approve_script?: string;
  rejection_behavior: 'stop' | 'continue' | 'escalate';
}

export interface ApprovalApprover {
  type: 'user' | 'group' | 'role' | 'manager' | 'dynamic';
  identifier: string;
  fallback_approver?: string;
  delegation_enabled: boolean;
}

export interface ApprovalCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'contains';
  value: string | number | string[];
  logical_operator?: 'AND' | 'OR';
}

export interface EscalationRule {
  timeout_hours: number;
  action: 'notify' | 'reassign' | 'auto_approve' | 'auto_reject';
  target?: string;
  message?: string;
}

export interface ApprovalInstance {
  id: string;
  flow_id: string;
  record_id: string;
  record_table: string;
  current_step: number;
  status: ApprovalStatus;
  requested_by: string;
  requested_for?: string;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  steps: ApprovalStepInstance[];
  audit_trail: ApprovalAuditEntry[];
  escalation_count: number;
  total_timeout_hours?: number;
}

export type ApprovalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'timeout'
  | 'escalated';

export interface ApprovalStepInstance {
  id: string;
  step_id: string;
  order: number;
  status: ApprovalStatus;
  approver_id?: string;
  approver_name?: string;
  decision?: 'approved' | 'rejected';
  comments?: string;
  decided_at?: Date;
  timeout_at?: Date;
  escalated: boolean;
  delegation_from?: string;
}

export interface ApprovalAuditEntry {
  id: string;
  timestamp: Date;
  user_id: string;
  user_name: string;
  action: AuditAction;
  details: string;
  before_value?: string;
  after_value?: string;
  ip_address?: string;
  user_agent?: string;
}

export type AuditAction =
  | 'created'
  | 'approved'
  | 'rejected'
  | 'escalated'
  | 'cancelled'
  | 'reassigned'
  | 'delegated'
  | 'timeout'
  | 'modified'
  | 'viewed';

// Feature Flags Types
export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  type: FeatureFlagType;
  value?: string | number | boolean | object;
  conditions?: FeatureFlagCondition[];
  rollout_percentage?: number;
  target_groups?: string[];
  target_users?: string[];
  environment_override?: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  expires_at?: Date;
}

export type FeatureFlagType = 'boolean' | 'string' | 'number' | 'json' | 'rollout';

export interface FeatureFlagCondition {
  attribute: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: string | number | string[];
}

export interface FeatureFlagOverride {
  flag_id: string;
  user_id?: string;
  group_id?: string;
  environment?: string;
  value: string | number | boolean | object;
  enabled: boolean;
  expires_at?: Date;
  created_by: string;
  created_at: Date;
}

// Admin Interface Types
export interface AdminModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  required_roles: string[];
  order: number;
  enabled: boolean;
  category: AdminCategory;
}

export type AdminCategory =
  | 'user_management'
  | 'security'
  | 'system_config'
  | 'integrations'
  | 'reporting'
  | 'workflow'
  | 'catalog'
  | 'monitoring';

export interface SystemConfiguration {
  id: string;
  category: string;
  key: string;
  value: string | number | boolean | object;
  description: string;
  data_type: 'string' | 'number' | 'boolean' | 'json' | 'password';
  required: boolean;
  default_value?: string | number | boolean | object;
  validation_regex?: string;
  options?: string[];
  environment_override: boolean;
  requires_restart: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

// Audit & Compliance Types
export interface AuditLog {
  id: string;
  timestamp: Date;
  user_id: string;
  user_name: string;
  action: string;
  resource_type: string;
  resource_id: string;
  before_value?: object;
  after_value?: object;
  ip_address: string;
  user_agent: string;
  session_id: string;
  risk_score?: number;
  tags?: string[];
}

export interface ComplianceReport {
  id: string;
  type: ComplianceType;
  period_start: Date;
  period_end: Date;
  generated_by: string;
  generated_at: Date;
  status: 'pending' | 'completed' | 'failed';
  findings: ComplianceFinding[];
  metrics: ComplianceMetric[];
  recommendations: string[];
}

export type ComplianceType = 'access_review' | 'approval_audit' | 'security_scan' | 'role_analysis';

export interface ComplianceFinding {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  affected_users?: string[];
  affected_resources?: string[];
  recommendation: string;
  auto_remediation_available: boolean;
}

export interface ComplianceMetric {
  name: string;
  value: number;
  unit: string;
  threshold?: number;
  status: 'pass' | 'warning' | 'fail';
}

// Standard ServiceNow Roles
export const STANDARD_ROLES = {
  // End User Roles
  user: {
    name: 'User',
    description: 'Basic end user access to service catalog and requests',
    permissions: ['catalog:read', 'request:create', 'request:read_own'],
  },
  itil: {
    name: 'ITIL User',
    description: 'ITIL process user with access to incidents and requests',
    permissions: [
      'catalog:read',
      'request:create',
      'request:read_own',
      'incident:read',
      'incident:create',
    ],
  },

  // Approver Roles
  approver_user: {
    name: 'Approver',
    description: 'Can approve requests and catalog items',
    permissions: [
      'approval:approve',
      'approval:reject',
      'approval:delegate',
      'request:read_department',
    ],
  },
  approval_admin: {
    name: 'Approval Administrator',
    description: 'Full approval system administration',
    permissions: [
      'approval:admin',
      'approval_flow:create',
      'approval_flow:update',
      'approval_flow:delete',
    ],
  },

  // Catalog Roles
  catalog_editor: {
    name: 'Catalog Editor',
    description: 'Can create and edit catalog items',
    permissions: [
      'catalog:create',
      'catalog:update',
      'catalog:delete',
      'category:create',
      'category:update',
    ],
  },
  catalog_admin: {
    name: 'Catalog Administrator',
    description: 'Full catalog administration including pricing and cost centers',
    permissions: ['catalog:admin', 'cost_center:admin', 'billing:admin', 'pricing:admin'],
  },

  // System Roles
  admin: {
    name: 'Administrator',
    description: 'Full system administration access',
    permissions: ['*'],
  },
  security_admin: {
    name: 'Security Administrator',
    description: 'Security and RBAC administration',
    permissions: ['user:admin', 'role:admin', 'permission:admin', 'audit:admin', 'security:admin'],
  },
  workflow_admin: {
    name: 'Workflow Administrator',
    description: 'Workflow and approval flow administration',
    permissions: ['workflow:admin', 'approval_flow:admin', 'automation:admin'],
  },
} as const;
