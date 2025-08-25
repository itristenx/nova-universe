/**
 * Nova Enterprise Platform TypeScript Types
 * Comprehensive type definitions for ServiceNow-equivalent enterprise platform
 *
 * Features:
 * - Enterprise Asset Management (EAM)
 * - Service Operations Workspace (SOW)
 * - Security Operations Center (SOC)
 * - Configuration Management Database (CMDB)
 * - Employee Center & Experience
 * - Workflow Automation & Orchestration
 * - Knowledge Management
 * - ITSM, HR Service Delivery, Field Service Management
 */

// =============================================================================
// BASE TYPES & ENUMS
// =============================================================================

export interface BaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
}

export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Urgency = 'HIGH' | 'MEDIUM' | 'LOW';
export type Impact = 'HIGH' | 'MEDIUM' | 'LOW';

// =============================================================================
// ENTERPRISE ASSET MANAGEMENT (EAM) TYPES
// =============================================================================

export type AssetLifecycleStage =
  | 'PLANNING'
  | 'PROCUREMENT'
  | 'DEPLOYMENT'
  | 'OPERATIONAL'
  | 'MAINTENANCE'
  | 'DISPOSAL';

export type AssetOperationalStatus =
  | 'OPERATIONAL'
  | 'NON_OPERATIONAL'
  | 'UNDER_MAINTENANCE'
  | 'RETIRED'
  | 'MISSING'
  | 'BROKEN';

export type SoftwareLicenseType = 'PERPETUAL' | 'SUBSCRIPTION' | 'VOLUME' | 'OEM' | 'CONCURRENT';

export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY' | 'UPGRADE';

export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface AssetCategory extends BaseRecord {
  name: string;
  description?: string;
  code: string;
  parent_id?: string;
  parent?: AssetCategory;
  children: AssetCategory[];
  assets: Asset[];
}

export interface Asset extends BaseRecord {
  asset_tag: string;
  serial_number?: string;
  name: string;
  description?: string;
  category_id: string;
  category: AssetCategory;
  model?: string;
  manufacturer?: string;
  location?: string;
  cost?: number;
  purchase_date?: string;
  warranty_date?: string;
  lifecycle_stage: AssetLifecycleStage;
  operational_status: AssetOperationalStatus;
  risk_score: number;
  owner_id?: string;
  owner?: User;
  assigned_to_id?: string;
  assigned_to?: User;
  department?: string;
  business_unit?: string;
  parent_asset_id?: string;
  parent_asset?: Asset;
  child_assets: Asset[];
  configuration_items: ConfigurationItem[];
  maintenance_records: MaintenanceRecord[];
  service_requests: ServiceRequest[];
  incidents: Incident[];
  created_by_id: string;
  created_by: User;
  software_license_id?: string;
  software_license?: SoftwareLicense;
  specifications?: Record<string, any>;
}

export interface SoftwareLicense extends BaseRecord {
  name: string;
  vendor: string;
  license_type: SoftwareLicenseType;
  total_licenses: number;
  used_licenses: number;
  cost_per_license?: number;
  renewal_date?: string;
  assets: Asset[];
}

export interface MaintenanceRecord extends BaseRecord {
  asset_id: string;
  asset: Asset;
  maintenance_type: MaintenanceType;
  scheduled_date: string;
  completed_date?: string;
  technician_id?: string;
  technician?: User;
  cost?: number;
  description?: string;
  notes?: string;
  status: MaintenanceStatus;
}

export interface AssetDashboardData {
  totalAssets: number;
  assetsByCategory: Array<{
    category_id: string;
    category_name: string;
    _count: number;
  }>;
  assetsByLifecycle: Array<{
    lifecycle_stage: AssetLifecycleStage;
    _count: number;
  }>;
  assetsByStatus: Array<{
    operational_status: AssetOperationalStatus;
    _count: number;
  }>;
  riskDistribution: Array<{
    risk_score: number;
    _count: number;
  }>;
}

// =============================================================================
// SERVICE OPERATIONS WORKSPACE (SOW) TYPES
// =============================================================================

export type ServiceRequestState =
  | 'NEW'
  | 'IN_PROGRESS'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED';

export type IncidentState = 'NEW' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';

export type ProblemState =
  | 'NEW'
  | 'INVESTIGATION'
  | 'ROOT_CAUSE_ANALYSIS'
  | 'AWAITING_VENDOR'
  | 'RESOLVED'
  | 'CLOSED';

export type ChangeState =
  | 'NEW'
  | 'ASSESSMENT'
  | 'AUTHORIZATION'
  | 'SCHEDULED'
  | 'IMPLEMENTATION'
  | 'REVIEW'
  | 'CLOSED'
  | 'CANCELLED';

export type ChangeType = 'STANDARD' | 'NORMAL' | 'EMERGENCY';
export type ChangeRisk = 'HIGH' | 'MODERATE' | 'LOW';
export type ApprovalState = 'NOT_REQUESTED' | 'REQUESTED' | 'APPROVED' | 'REJECTED';

export interface ServiceRequest extends BaseRecord {
  number: string;
  short_description: string;
  description?: string;
  state: ServiceRequestState;
  priority: Priority;
  urgency: Urgency;
  impact: Impact;
  category?: string;
  subcategory?: string;
  requested_by_id: string;
  requested_by: User;
  assigned_to_id?: string;
  assigned_to?: User;
  assignment_group?: string;
  service_offering_id?: string;
  service_offering?: ServiceOffering;
  asset_id?: string;
  asset?: Asset;
  configuration_item_id?: string;
  configuration_item?: ConfigurationItem;
  sla_due_date?: string;
  response_time?: number;
  resolution_time?: number;
  opened_at: string;
  closed_at?: string;
  resolved_at?: string;
  incidents: Incident[];
  changes: Change[];
  knowledge_articles: KnowledgeArticle[];
  attachments: Attachment[];
  work_notes: WorkNote[];
}

export interface Incident extends BaseRecord {
  number: string;
  short_description: string;
  description?: string;
  state: IncidentState;
  priority: Priority;
  urgency: Urgency;
  impact: Impact;
  category?: string;
  subcategory?: string;
  assigned_to_id?: string;
  assigned_to?: User;
  assignment_group?: string;
  caller_id: string;
  caller: User;
  service_offering_id?: string;
  service_offering?: ServiceOffering;
  asset_id?: string;
  asset?: Asset;
  configuration_item_id?: string;
  configuration_item?: ConfigurationItem;
  problem_id?: string;
  problem?: Problem;
  sla_due_date?: string;
  response_time?: number;
  resolution_time?: number;
  resolution_code?: string;
  resolution_notes?: string;
  root_cause?: string;
  opened_at: string;
  closed_at?: string;
  resolved_at?: string;
  service_requests: ServiceRequest[];
  changes: Change[];
  knowledge_articles: KnowledgeArticle[];
  attachments: Attachment[];
  work_notes: WorkNote[];
}

export interface Problem extends BaseRecord {
  number: string;
  short_description: string;
  description?: string;
  state: ProblemState;
  priority: Priority;
  impact: Impact;
  category?: string;
  subcategory?: string;
  assigned_to_id?: string;
  assigned_to?: User;
  assignment_group?: string;
  root_cause?: string;
  workaround?: string;
  solution?: string;
  configuration_item_id?: string;
  configuration_item?: ConfigurationItem;
  opened_at: string;
  closed_at?: string;
  resolved_at?: string;
  incidents: Incident[];
  changes: Change[];
  knowledge_articles: KnowledgeArticle[];
  attachments: Attachment[];
  work_notes: WorkNote[];
}

export interface Change extends BaseRecord {
  number: string;
  short_description: string;
  description?: string;
  state: ChangeState;
  priority: Priority;
  risk: ChangeRisk;
  impact: Impact;
  category?: string;
  type: ChangeType;
  assigned_to_id?: string;
  assigned_to?: User;
  assignment_group?: string;
  requested_by_id: string;
  requested_by: User;
  planned_start_date?: string;
  planned_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  approval_state: ApprovalState;
  implementation_plan?: string;
  backout_plan?: string;
  test_plan?: string;
  configuration_items: ConfigurationItem[];
  opened_at: string;
  closed_at?: string;
  incidents: Incident[];
  service_requests: ServiceRequest[];
  problems: Problem[];
  attachments: Attachment[];
  work_notes: WorkNote[];
  approvals: ChangeApproval[];
}

export interface ChangeApproval extends BaseRecord {
  change_id: string;
  change: Change;
  approver_id: string;
  approver: User;
  state: ApprovalState;
  comments?: string;
  approved_at?: string;
  rejected_at?: string;
}

export interface ServiceOperationsDashboard {
  incidents: ServiceStatistics;
  serviceRequests: ServiceStatistics;
  changes: ServiceStatistics;
  problems: ServiceStatistics;
  sla: SLAMetrics;
  timestamp: string;
}

export interface ServiceStatistics {
  total: number;
  new: number;
  in_progress: number;
  resolved: number;
  closed: number;
  overdue: number;
  by_priority: Record<Priority, number>;
}

export interface SLAMetrics {
  response_sla_met: number;
  resolution_sla_met: number;
  average_response_time: number;
  average_resolution_time: number;
}

// =============================================================================
// SECURITY OPERATIONS CENTER (SOC) TYPES
// =============================================================================

export type SecurityIncidentState =
  | 'NEW'
  | 'INVESTIGATION'
  | 'CONTAINMENT'
  | 'ERADICATION'
  | 'RECOVERY'
  | 'LESSONS_LEARNED'
  | 'CLOSED';

export type SecuritySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type SecurityCategory =
  | 'MALWARE'
  | 'PHISHING'
  | 'DATA_BREACH'
  | 'UNAUTHORIZED_ACCESS'
  | 'DDoS'
  | 'INSIDER_THREAT'
  | 'APT'
  | 'VULNERABILITY_EXPLOITATION'
  | 'OTHER';

export type VulnerabilityState =
  | 'NEW'
  | 'ASSESSMENT'
  | 'REMEDIATION'
  | 'TESTING'
  | 'CLOSED'
  | 'ACCEPTED_RISK';

export type VulnerabilitySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type VulnerabilityExploitability = 'HIGH' | 'MEDIUM' | 'LOW';

export type AutomationLevel = 'MANUAL' | 'SEMI_AUTOMATED' | 'FULLY_AUTOMATED';

export type PlaybookActionType =
  | 'ISOLATE_ENDPOINT'
  | 'BLOCK_IP'
  | 'QUARANTINE_FILE'
  | 'RESET_PASSWORD'
  | 'DISABLE_ACCOUNT'
  | 'SEND_NOTIFICATION'
  | 'CREATE_TICKET'
  | 'UPDATE_FIREWALL'
  | 'RUN_SCAN'
  | 'COLLECT_EVIDENCE'
  | 'CUSTOM_SCRIPT';

export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface SecurityIncident extends BaseRecord {
  number: string;
  short_description: string;
  description?: string;
  state: SecurityIncidentState;
  priority: Priority;
  severity: SecuritySeverity;
  category: SecurityCategory;
  assigned_to_id?: string;
  assigned_to?: User;
  assignment_group?: string;
  source?: string;
  attack_vector?: string;
  threat_actor?: string;
  affected_users: string[];
  affected_systems: string[];
  mitre_tactics: string[];
  mitre_techniques: string[];
  containment_actions?: string;
  eradication_actions?: string;
  recovery_actions?: string;
  lessons_learned?: string;
  configuration_items: ConfigurationItem[];
  vulnerabilities: Vulnerability[];
  detected_at?: string;
  opened_at: string;
  closed_at?: string;
  resolved_at?: string;
  attachments: Attachment[];
  work_notes: WorkNote[];
  playbook_executions: PlaybookExecution[];
}

export interface Vulnerability extends BaseRecord {
  number: string;
  cve_id?: string;
  title: string;
  description?: string;
  severity: VulnerabilitySeverity;
  cvss_score?: number;
  state: VulnerabilityState;
  assigned_to_id?: string;
  assigned_to?: User;
  assignment_group?: string;
  affected_software?: string;
  affected_version?: string;
  exploit_available: boolean;
  patch_available: boolean;
  patch_details?: string;
  business_impact: Impact;
  exploitability: VulnerabilityExploitability;
  remediation_plan?: string;
  workaround?: string;
  due_date?: string;
  configuration_items: ConfigurationItem[];
  security_incidents: SecurityIncident[];
  discovered_at?: string;
  opened_at: string;
  closed_at?: string;
  resolved_at?: string;
  attachments: Attachment[];
  work_notes: WorkNote[];
}

export interface SecurityPlaybook extends BaseRecord {
  name: string;
  description?: string;
  category: SecurityCategory;
  trigger_conditions: Record<string, any>;
  automation_level: AutomationLevel;
  steps: PlaybookStep[];
  created_by_id: string;
  created_by: User;
  executions: PlaybookExecution[];
}

export interface PlaybookStep extends BaseRecord {
  playbook_id: string;
  playbook: SecurityPlaybook;
  step_number: number;
  name: string;
  description?: string;
  action_type: PlaybookActionType;
  action_config: Record<string, any>;
  is_automated: boolean;
  requires_approval: boolean;
}

export interface PlaybookExecution extends BaseRecord {
  playbook_id: string;
  playbook: SecurityPlaybook;
  security_incident_id: string;
  security_incident: SecurityIncident;
  status: ExecutionStatus;
  started_at: string;
  completed_at?: string;
  executed_by_id: string;
  executed_by: User;
  step_executions: PlaybookStepExecution[];
}

export interface PlaybookStepExecution extends BaseRecord {
  execution_id: string;
  execution: PlaybookExecution;
  step_number: number;
  status: ExecutionStatus;
  started_at?: string;
  completed_at?: string;
  result?: Record<string, any>;
  error_message?: string;
}

export interface SecurityOperationsDashboard {
  securityIncidents: SecurityStatistics;
  vulnerabilities: VulnerabilityStatistics;
  threatIntelligence: ThreatIntelligence;
  playbooks: PlaybookMetrics;
  securityMetrics: SecurityMetrics;
  timestamp: string;
}

export interface SecurityStatistics {
  total: number;
  new: number;
  investigation: number;
  containment: number;
  closed: number;
  by_severity: Record<SecuritySeverity, number>;
  by_category: Record<SecurityCategory, number>;
}

export interface VulnerabilityStatistics {
  total: number;
  new: number;
  assessment: number;
  remediation: number;
  closed: number;
  by_severity: Record<VulnerabilitySeverity, number>;
  critical_overdue: number;
}

export interface ThreatIntelligence {
  active_threats: number;
  blocked_ips: number;
  quarantined_files: number;
  recent_attacks: Array<{
    type: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export interface PlaybookMetrics {
  total_playbooks: number;
  executions_today: number;
  success_rate: number;
  average_execution_time: number;
}

export interface SecurityMetrics {
  mean_time_to_detection: number;
  mean_time_to_response: number;
  mean_time_to_recovery: number;
  security_incidents_prevented: number;
}

// =============================================================================
// CONFIGURATION MANAGEMENT DATABASE (CMDB) TYPES
// =============================================================================

export type CIOperationalStatus =
  | 'OPERATIONAL'
  | 'NON_OPERATIONAL'
  | 'UNDER_MAINTENANCE'
  | 'REPAIR_IN_PROGRESS'
  | 'RETIRED';

export type CILifecycleStage =
  | 'PLANNING'
  | 'DEVELOPMENT'
  | 'TESTING'
  | 'OPERATIONAL'
  | 'RETIRING'
  | 'RETIRED';

export type CIRelationshipType =
  | 'DEPENDS_ON'
  | 'USED_BY'
  | 'RUNS_ON'
  | 'HOSTED_ON'
  | 'CONTAINS'
  | 'MEMBER_OF'
  | 'CONNECTS_TO'
  | 'MANAGES';

export interface ConfigurationItem extends BaseRecord {
  name: string;
  ci_class: string;
  operational_status: CIOperationalStatus;
  lifecycle_stage: CILifecycleStage;
  environment?: string;
  business_service?: string;
  business_owner_id?: string;
  business_owner?: User;
  technical_owner_id?: string;
  technical_owner?: User;
  manufacturer?: string;
  model?: string;
  version?: string;
  serial_number?: string;
  ip_address?: string;
  hostname?: string;
  location?: string;
  discovery_source?: string;
  last_discovered?: string;
  monitoring_enabled: boolean;
  upstream_cis: CIRelationship[];
  downstream_cis: CIRelationship[];
  asset_id?: string;
  asset?: Asset;
  incidents: Incident[];
  problems: Problem[];
  changes: Change[];
  service_requests: ServiceRequest[];
  security_incidents: SecurityIncident[];
  vulnerabilities: Vulnerability[];
  discovered_at?: string;
}

export interface CIRelationship extends BaseRecord {
  upstream_ci_id: string;
  upstream_ci: ConfigurationItem;
  downstream_ci_id: string;
  downstream_ci: ConfigurationItem;
  relationship_type: CIRelationshipType;
}

export interface CIImpactAnalysis {
  ci: {
    id: string;
    name: string;
    ci_class: string;
    operational_status: CIOperationalStatus;
  };
  dependentCIs: Array<{
    id: string;
    name: string;
    ci_class: string;
    relationship_type: CIRelationshipType;
  }>;
  supportingCIs: Array<{
    id: string;
    name: string;
    ci_class: string;
    relationship_type: CIRelationshipType;
  }>;
  businessImpact: {
    impact_level: Impact;
    affected_services: string[];
    estimated_users_affected: number;
    estimated_revenue_impact: number;
  };
  relatedIncidents: Array<{
    id: string;
    number: string;
    state: IncidentState;
    priority: Priority;
  }>;
  relatedChanges: Array<{
    id: string;
    number: string;
    state: ChangeState;
    risk: ChangeRisk;
  }>;
  riskScore: number;
}

// =============================================================================
// EMPLOYEE CENTER & EXPERIENCE TYPES
// =============================================================================

export type EventType =
  | 'MEETING'
  | 'TRAINING'
  | 'CONFERENCE'
  | 'WORKSHOP'
  | 'SOCIAL'
  | 'ANNOUNCEMENT'
  | 'OTHER';

export type AttendeeStatus = 'REGISTERED' | 'ATTENDED' | 'NO_SHOW' | 'CANCELLED';

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type FormFieldType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'EMAIL'
  | 'PHONE'
  | 'NUMBER'
  | 'DATE'
  | 'DATETIME'
  | 'DROPDOWN'
  | 'RADIO'
  | 'CHECKBOX'
  | 'FILE_UPLOAD'
  | 'BOOLEAN';

export interface EmployeeProfile extends BaseRecord {
  user_id: string;
  user: User;
  employee_id?: string;
  badge_number?: string;
  hire_date?: string;
  termination_date?: string;
  job_title?: string;
  department?: string;
  business_unit?: string;
  location?: string;
  manager_id?: string;
  manager?: EmployeeProfile;
  direct_reports: EmployeeProfile[];
  cost_center?: string;
  work_phone?: string;
  mobile_phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  preferred_language: string;
  timezone?: string;
  notification_preferences?: Record<string, any>;
  service_requests: ServiceRequest[];
  incidents: Incident[];
}

export interface ServiceOffering extends BaseRecord {
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  short_description?: string;
  is_active: boolean;
  available_for: string[];
  fulfillment_group?: string;
  estimated_delivery?: string;
  cost?: number;
  requires_approval: boolean;
  approval_workflow?: Record<string, any>;
  form_fields: ServiceFormField[];
  response_time_sla?: number;
  resolution_time_sla?: number;
  knowledge_articles: KnowledgeArticle[];
  service_requests: ServiceRequest[];
  incidents: Incident[];
  created_by_id: string;
  created_by: User;
}

export interface ServiceFormField extends BaseRecord {
  service_offering_id: string;
  service_offering: ServiceOffering;
  field_name: string;
  field_label: string;
  field_type: FormFieldType;
  is_required: boolean;
  field_options?: Record<string, any>;
  validation_rules?: Record<string, any>;
  order_index: number;
}

export interface CompanyEvent extends BaseRecord {
  title: string;
  description?: string;
  event_type: EventType;
  start_date: string;
  end_date?: string;
  location?: string;
  is_virtual: boolean;
  virtual_link?: string;
  organizer_id: string;
  organizer: User;
  requires_registration: boolean;
  max_attendees?: number;
  registration_deadline?: string;
  is_public: boolean;
  target_audience: string[];
  agenda?: Record<string, any>;
  attachments: Attachment[];
  attendees: EventAttendee[];
}

export interface EventAttendee extends BaseRecord {
  event_id: string;
  event: CompanyEvent;
  user_id: string;
  user: User;
  status: AttendeeStatus;
  registered_at: string;
  attended_at?: string;
}

export interface Appointment extends BaseRecord {
  title: string;
  description?: string;
  appointment_type: string;
  start_time: string;
  end_time: string;
  location?: string;
  is_virtual: boolean;
  virtual_link?: string;
  requester_id: string;
  requester: User;
  provider_id: string;
  provider: User;
  status: AppointmentStatus;
  cancellation_reason?: string;
  service_request_id?: string;
  service_request?: ServiceRequest;
}

export interface EmployeeCenterDashboard {
  employee: {
    id: string;
    name: string;
    job_title?: string;
    department?: string;
    manager?: string;
  };
  myRequests: ServiceRequest[];
  myIncidents: Incident[];
  availableServices: ServiceOffering[];
  upcomingEvents: CompanyEvent[];
  myAppointments: Appointment[];
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    type: string;
    published_at: string;
  }>;
  quickActions: Array<{
    id: string;
    label: string;
    description: string;
    action_type: string;
    icon: string;
  }>;
}

// =============================================================================
// KNOWLEDGE MANAGEMENT TYPES
// =============================================================================

export type ArticleType =
  | 'HOW_TO'
  | 'TROUBLESHOOTING'
  | 'FAQ'
  | 'REFERENCE'
  | 'POLICY'
  | 'PROCEDURE';

export type ArticleWorkflowState = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'RETIRED';

export interface KnowledgeArticle extends BaseRecord {
  number: string;
  title: string;
  short_description?: string;
  content: string;
  article_type: ArticleType;
  category: string;
  subcategory?: string;
  tags: string[];
  workflow_state: ArticleWorkflowState;
  published_at?: string;
  expires_at?: string;
  review_date?: string;
  author_id: string;
  author: User;
  reviewer_id?: string;
  reviewer?: User;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  service_offerings: ServiceOffering[];
  incidents: Incident[];
  service_requests: ServiceRequest[];
  problems: Problem[];
  security_incidents: SecurityIncident[];
  attachments: Attachment[];
}

// =============================================================================
// WORKFLOW AUTOMATION TYPES
// =============================================================================

export type WorkflowTriggerType =
  | 'RECORD_INSERT'
  | 'RECORD_UPDATE'
  | 'RECORD_DELETE'
  | 'SCHEDULED'
  | 'MANUAL'
  | 'API_CALL'
  | 'EVENT_DRIVEN';

export type WorkflowStepType =
  | 'CONDITION'
  | 'ASSIGNMENT'
  | 'NOTIFICATION'
  | 'APPROVAL'
  | 'INTEGRATION_CALL'
  | 'SCRIPT_EXECUTION'
  | 'WAIT'
  | 'LOOP'
  | 'SUBPROCESS';

export type WorkflowExecutionStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'WAITING_FOR_APPROVAL';

export interface WorkflowDefinition extends BaseRecord {
  name: string;
  description?: string;
  category: string;
  trigger_type: WorkflowTriggerType;
  trigger_conditions: Record<string, any>;
  is_active: boolean;
  steps: WorkflowStep[];
  executions: WorkflowExecution[];
  created_by_id: string;
  created_by: User;
  version: number;
}

export interface WorkflowStep extends BaseRecord {
  workflow_id: string;
  workflow: WorkflowDefinition;
  step_number: number;
  name: string;
  description?: string;
  step_type: WorkflowStepType;
  action_config: Record<string, any>;
  condition_config?: Record<string, any>;
  is_automated: boolean;
  requires_approval: boolean;
  approver_role?: string;
  timeout_minutes?: number;
  retry_count: number;
}

export interface WorkflowExecution extends BaseRecord {
  workflow_id: string;
  workflow: WorkflowDefinition;
  trigger_record_id: string;
  trigger_table: string;
  status: WorkflowExecutionStatus;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  step_executions: WorkflowStepExecution[];
  execution_context?: Record<string, any>;
}

export interface WorkflowStepExecution extends BaseRecord {
  execution_id: string;
  execution: WorkflowExecution;
  step_number: number;
  status: WorkflowExecutionStatus;
  started_at?: string;
  completed_at?: string;
  result_data?: Record<string, any>;
  error_message?: string;
  retry_attempt: number;
}

// =============================================================================
// SHARED TYPES
// =============================================================================

export interface User extends BaseRecord {
  email: string;
  username?: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  title?: string;
  department?: string;
  location?: string;
  phone?: string;
  mobile?: string;
  is_active: boolean;
  last_login_at?: string;
  roles: string[];
  permissions: string[];
  employee_profile?: EmployeeProfile;
  owned_assets: Asset[];
  assigned_assets: Asset[];
  created_assets: Asset[];
  requested_service_requests: ServiceRequest[];
  assigned_service_requests: ServiceRequest[];
  called_incidents: Incident[];
  assigned_incidents: Incident[];
  assigned_problems: Problem[];
  requested_changes: Change[];
  assigned_changes: Change[];
  assigned_security_incidents: SecurityIncident[];
  assigned_vulnerabilities: Vulnerability[];
  created_playbooks: SecurityPlaybook[];
  executed_playbooks: PlaybookExecution[];
  business_owned_cis: ConfigurationItem[];
  technical_owned_cis: ConfigurationItem[];
  employee_service_requests: ServiceRequest[];
  employee_incidents: Incident[];
  organized_events: CompanyEvent[];
  event_attendances: EventAttendee[];
  requested_appointments: Appointment[];
  provided_appointments: Appointment[];
  authored_articles: KnowledgeArticle[];
  reviewed_articles: KnowledgeArticle[];
  created_workflows: WorkflowDefinition[];
  maintenance_records: MaintenanceRecord[];
  change_approvals: ChangeApproval[];
  created_service_offerings: ServiceOffering[];
  attachments: Attachment[];
  work_notes: WorkNote[];
}

export interface Attachment extends BaseRecord {
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  file_path: string;
  description?: string;
  asset_id?: string;
  asset?: Asset;
  incident_id?: string;
  incident?: Incident;
  service_request_id?: string;
  service_request?: ServiceRequest;
  problem_id?: string;
  problem?: Problem;
  change_id?: string;
  change?: Change;
  security_incident_id?: string;
  security_incident?: SecurityIncident;
  vulnerability_id?: string;
  vulnerability?: Vulnerability;
  knowledge_article_id?: string;
  knowledge_article?: KnowledgeArticle;
  company_event_id?: string;
  company_event?: CompanyEvent;
  uploaded_by_id: string;
  uploaded_by: User;
  uploaded_at: string;
}

export interface WorkNote extends BaseRecord {
  content: string;
  is_internal: boolean;
  incident_id?: string;
  incident?: Incident;
  service_request_id?: string;
  service_request?: ServiceRequest;
  problem_id?: string;
  problem?: Problem;
  change_id?: string;
  change?: Change;
  security_incident_id?: string;
  security_incident?: SecurityIncident;
  vulnerability_id?: string;
  vulnerability?: Vulnerability;
  created_by_id: string;
  created_by: User;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any[];
}

export interface PaginatedResponse<T = any> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =============================================================================
// DASHBOARD & ANALYTICS TYPES
// =============================================================================

export interface EnterprisePlatformMetrics {
  assets: AssetDashboardData;
  serviceOperations: ServiceOperationsDashboard;
  securityOperations: SecurityOperationsDashboard;
  workflows: WorkflowMetrics;
  timestamp: string;
}

export interface WorkflowMetrics {
  total_workflows: number;
  active_workflows: number;
  executions_today: number;
  success_rate: number;
  average_execution_time: number;
  by_trigger_type: Record<WorkflowTriggerType, number>;
}

// =============================================================================
// EXPORT ALL TYPES
// =============================================================================

// All types are exported by default with the interface declaration
// No additional export needed as TypeScript exports interfaces automatically
