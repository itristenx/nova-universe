/**
 * AI Control Tower TypeScript Type Definitions
 * Enterprise AI/ML/RAG system types with comprehensive coverage
 * Based on industry standards for AI control plane architecture
 */

// Type definitions for configuration and metadata
export type ConfigurationValue =
  | string
  | number
  | boolean
  | null
  | ConfigurationObject
  | ConfigurationValue[];
export interface ConfigurationObject {
  [key: string]: ConfigurationValue;
}

export type MetadataValue = string | number | boolean | null | MetadataObject | MetadataValue[];
export interface MetadataObject {
  [key: string]: MetadataValue;
}

export type HyperparameterValue =
  | string
  | number
  | boolean
  | HyperparameterObject
  | HyperparameterValue[];
export interface HyperparameterObject {
  [key: string]: HyperparameterValue;
}

export type SchemaValue = string | number | boolean | null | SchemaObject | SchemaValue[];
export interface SchemaObject {
  [key: string]: SchemaValue;
}

export type ParameterValue = string | number | boolean | ParameterObject | ParameterValue[];
export interface ParameterObject {
  [key: string]: ParameterValue;
}

export type ExampleValue = string | number | boolean | null | ExampleObject | ExampleValue[];
export interface ExampleObject {
  [key: string]: ExampleValue;
}

export type EnumValue = string | number;
export type TopValue = string | number | boolean;

// Base entity interfaces
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Enums for type safety
export enum AIControlTowerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  MAINTENANCE = 'MAINTENANCE',
}

export enum AIControlTowerEnvironment {
  DEVELOPMENT = 'DEVELOPMENT',
  STAGING = 'STAGING',
  PRODUCTION = 'PRODUCTION',
}

export enum AIModelType {
  CLASSIFICATION = 'CLASSIFICATION',
  REGRESSION = 'REGRESSION',
  NLP = 'NLP',
  COMPUTER_VISION = 'COMPUTER_VISION',
  TIME_SERIES = 'TIME_SERIES',
  CLUSTERING = 'CLUSTERING',
  REINFORCEMENT_LEARNING = 'REINFORCEMENT_LEARNING',
  GENERATIVE = 'GENERATIVE',
  MULTIMODAL = 'MULTIMODAL',
}

export enum AIModelStatus {
  DRAFT = 'DRAFT',
  TRAINING = 'TRAINING',
  READY = 'READY',
  DEPLOYED = 'DEPLOYED',
  ERROR = 'ERROR',
  DEPRECATED = 'DEPRECATED',
}

export enum AIModelFramework {
  TENSORFLOW = 'tensorflow',
  PYTORCH = 'pytorch',
  SCIKIT_LEARN = 'scikit-learn',
  XGBOOST = 'xgboost',
  LIGHTGBM = 'lightgbm',
  HUGGINGFACE = 'huggingface',
  ONNX = 'onnx',
  KERAS = 'keras',
}

export enum TrainingJobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum TrainingJobType {
  TRAINING = 'TRAINING',
  FINE_TUNING = 'FINE_TUNING',
  TRANSFER_LEARNING = 'TRANSFER_LEARNING',
  HYPERPARAMETER_TUNING = 'HYPERPARAMETER_TUNING',
  EVALUATION = 'EVALUATION',
}

export enum DatasetType {
  TRAINING = 'TRAINING',
  VALIDATION = 'VALIDATION',
  TEST = 'TEST',
  CUSTOM = 'CUSTOM',
  SYNTHETIC = 'SYNTHETIC',
}

export enum StorageFormat {
  CSV = 'csv',
  PARQUET = 'parquet',
  JSON = 'json',
  TFRECORD = 'tfrecord',
  JSONL = 'jsonl',
  AVRO = 'avro',
}

export enum RAGRetrievalStrategy {
  SEMANTIC = 'semantic',
  KEYWORD = 'keyword',
  HYBRID = 'hybrid',
  DENSE = 'dense',
  SPARSE = 'sparse',
}

export enum AuditEventType {
  SYSTEM_EVENT = 'SYSTEM_EVENT',
  MODEL_CREATED = 'MODEL_CREATED',
  MODEL_TRAINED = 'MODEL_TRAINED',
  MODEL_DEPLOYED = 'MODEL_DEPLOYED',
  MODEL_ACCESSED = 'MODEL_ACCESSED',
  DATASET_CREATED = 'DATASET_CREATED',
  DATASET_ACCESSED = 'DATASET_ACCESSED',
  USER_ACTION = 'USER_ACTION',
  CONFIGURATION_CHANGED = 'CONFIGURATION_CHANGED',
  SECURITY_EVENT = 'SECURITY_EVENT',
}

export enum AuditRiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Core AI Control Tower interfaces
export interface AIControlTower extends BaseEntity {
  name: string;
  description?: string;
  organizationId: string;
  environment: AIControlTowerEnvironment;
  status: AIControlTowerStatus;
  configuration: ConfigurationObject;
  metadata: MetadataObject;
  resourceLimits?: ResourceLimits;
  complianceSettings?: ComplianceSettings;

  // Relationships
  models?: AIModel[];
  gateways?: AIGateway[];
  ragSystems?: RAGSystem[];
  auditTrails?: AIAuditTrail[];
  customDatasets?: CustomDataset[];
}

export interface ResourceLimits {
  maxModels?: number;
  maxTrainingJobs?: number;
  maxStorageGB?: number;
  maxComputeHours?: number;
  maxAPIRequests?: number;
}

export interface ComplianceSettings {
  dataRetentionDays: number;
  auditLogRetentionDays: number;
  encryptionRequired: boolean;
  accessControlEnabled: boolean;
  complianceFrameworks: string[];
}

// AI Model interfaces
export interface AIModel extends BaseEntity {
  controlTowerId: string;
  name: string;
  description?: string;
  type: AIModelType;
  framework: AIModelFramework;
  version: string;
  status: AIModelStatus;

  // Model configuration
  configuration: ModelConfiguration;
  hyperparameters: HyperparameterObject;
  architecture: ModelArchitecture;
  trainingConfig?: TrainingConfiguration;

  // Model artifacts
  modelPath?: string;
  modelSize?: number;
  inputSchema?: SchemaObject;
  outputSchema?: SchemaObject;

  // Performance metrics
  accuracy?: number;
  loss?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  customMetrics?: Record<string, number>;

  // Model lifecycle
  trainedAt?: Date;
  deployedAt?: Date;
  lastAccessedAt?: Date;

  // Relationships
  controlTower?: AIControlTower;
  trainingJobs?: TrainingJob[];
  deployments?: ModelDeployment[];
  customTrainingSets?: CustomDataset[];
  auditTrails?: AIAuditTrail[];
}

export interface ModelConfiguration {
  inputDimensions?: number[];
  outputDimensions?: number[];
  preprocessing?: PreprocessingConfig;
  postprocessing?: PostprocessingConfig;
  features?: FeatureConfig[];
  labels?: LabelConfig[];
}

export interface ModelArchitecture {
  layers?: LayerConfig[];
  totalParameters?: number;
  trainableParameters?: number;
  modelComplexity?: 'simple' | 'moderate' | 'complex';
  architectureType?: string;
}

export interface LayerConfig {
  name: string;
  type: string;
  parameters: ParameterObject;
  inputShape?: number[];
  outputShape?: number[];
}

export interface PreprocessingConfig {
  normalization?: boolean;
  scaling?: 'standard' | 'minmax' | 'robust';
  encoding?: 'onehot' | 'label' | 'binary';
  tokenization?: TokenizationConfig;
  augmentation?: AugmentationConfig;
}

export interface PostprocessingConfig {
  denormalization?: boolean;
  thresholding?: ThresholdConfig;
  calibration?: CalibrationConfig;
}

export interface TokenizationConfig {
  tokenizer: string;
  maxLength?: number;
  padding?: boolean;
  truncation?: boolean;
  vocabulary?: Record<string, number>;
}

export interface AugmentationConfig {
  enabled: boolean;
  techniques: string[];
  parameters: ParameterObject;
}

export interface ThresholdConfig {
  type: 'probability' | 'score';
  value: number;
  adaptive?: boolean;
}

export interface CalibrationConfig {
  method: 'platt' | 'isotonic';
  enabled: boolean;
}

export interface FeatureConfig {
  name: string;
  type: 'numerical' | 'categorical' | 'text' | 'image' | 'audio';
  importance?: number;
  preprocessing?: string[];
}

export interface LabelConfig {
  name: string;
  type: 'binary' | 'multiclass' | 'multilabel' | 'regression';
  classes?: string[];
  encoding?: string;
}

// Training interfaces
export interface TrainingJob extends BaseEntity {
  modelId: string;
  name: string;
  description?: string;
  jobType: TrainingJobType;
  status: TrainingJobStatus;

  // Training configuration
  trainingConfig: TrainingConfiguration;
  datasetConfig: DatasetConfiguration;
  hyperparameters: HyperparameterObject;

  // Progress tracking
  totalEpochs: number;
  currentEpoch: number;
  progress: number;

  // Execution details
  startedAt?: Date;
  completedAt?: Date;
  estimatedCompletionAt?: Date;

  // Results
  finalMetrics?: Record<string, number>;
  bestMetrics?: Record<string, number>;
  trainingHistory?: TrainingHistory;

  // Error handling
  errorMessage?: string;
  errorStack?: string;
  retryCount?: number;

  // Resource usage
  computeResources?: ComputeResources;
  resourceUsage?: ResourceUsage;

  // Relationships
  model?: AIModel;
}

export interface TrainingConfiguration {
  optimizer: OptimizerConfig;
  learningRate: number;
  batchSize: number;
  epochs: number;
  validationSplit?: number;
  earlyStopping?: EarlyStoppingConfig;
  checkpointing?: CheckpointConfig;
  distributedTraining?: DistributedTrainingConfig;
}

export interface OptimizerConfig {
  type: 'adam' | 'sgd' | 'rmsprop' | 'adagrad' | 'adamw';
  parameters: ParameterObject;
  schedulers?: LearningRateScheduler[];
}

export interface LearningRateScheduler {
  type: 'exponential' | 'polynomial' | 'cosine' | 'warmup';
  parameters: ParameterObject;
}

export interface EarlyStoppingConfig {
  enabled: boolean;
  monitor: string;
  patience: number;
  minDelta?: number;
  mode: 'min' | 'max';
}

export interface CheckpointConfig {
  enabled: boolean;
  frequency: number;
  saveBest: boolean;
  monitor?: string;
  keepTopK?: number;
}

export interface DistributedTrainingConfig {
  enabled: boolean;
  strategy: 'data_parallel' | 'model_parallel' | 'pipeline_parallel';
  nodes: number;
  gpusPerNode: number;
}

export interface DatasetConfiguration {
  trainingDatasets: string[];
  validationDatasets?: string[];
  testDatasets?: string[];
  dataLoaders: DataLoaderConfig[];
  augmentation?: AugmentationConfig;
}

export interface DataLoaderConfig {
  name: string;
  batchSize: number;
  shuffle: boolean;
  numWorkers?: number;
  prefetchFactor?: number;
}

export interface TrainingHistory {
  epochs: number[];
  metrics: Record<string, number[]>;
  learningRates: number[];
  losses: number[];
  validationMetrics?: Record<string, number[]>;
}

export interface ComputeResources {
  cpuCores: number;
  memoryGB: number;
  gpuType?: string;
  gpuCount?: number;
  storageGB: number;
  networkBandwidth?: string;
}

export interface ResourceUsage {
  cpuUtilization: number[];
  memoryUtilization: number[];
  gpuUtilization?: number[];
  diskIO: number[];
  networkIO: number[];
  totalCost?: number;
  duration: number;
}

// Custom Dataset interfaces
export interface CustomDataset extends BaseEntity {
  controlTowerId: string;
  name: string;
  description?: string;
  datasetType: DatasetType;

  // Schema and metadata
  schema: DatasetSchema;
  metadata: DatasetMetadata;
  statistics?: DatasetStatistics;

  // Storage configuration
  storagePath: string;
  storageFormat: StorageFormat;
  size: number;
  recordCount: number;

  // Access control
  isPublic: boolean;
  accessPolicy?: AccessPolicy;
  tags: string[];

  // Data quality
  qualityScore?: number;
  validationResults?: ValidationResults;

  // Relationships
  controlTower?: AIControlTower;
  models?: AIModel[];
}

export interface DatasetSchema {
  version: string;
  fields: DatasetField[];
  primaryKey?: string[];
  foreignKeys?: ForeignKeyConfig[];
}

export interface DatasetField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'json' | 'binary';
  nullable: boolean;
  description?: string;
  constraints?: FieldConstraints;
  format?: string;
  examples?: ExampleValue[];
}

export interface FieldConstraints {
  required?: boolean;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: EnumValue[];
}

export interface ForeignKeyConfig {
  fields: string[];
  referencedDataset: string;
  referencedFields: string[];
}

export interface DatasetMetadata {
  source: string;
  createdBy: string;
  datalineage?: DataLineage;
  category: string;
  domain: string;
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  license?: string;
  citation?: string;
}

export interface DataLineage {
  sources: DataSource[];
  transformations: DataTransformation[];
  dependencies: string[];
}

export interface DataSource {
  name: string;
  type: string;
  url?: string;
  version?: string;
  extractedAt: Date;
}

export interface DataTransformation {
  name: string;
  type: string;
  parameters: ParameterObject;
  appliedAt: Date;
}

export interface DatasetStatistics {
  recordCount: number;
  columnCount: number;
  nullCount: number;
  duplicateCount: number;
  missingValueRatio: number;
  numericalStats?: NumericalStatistics;
  categoricalStats?: CategoricalStatistics;
}

export interface NumericalStatistics {
  [fieldName: string]: {
    mean: number;
    median: number;
    std: number;
    min: number;
    max: number;
    quartiles: number[];
    distribution?: DistributionInfo;
  };
}

export interface CategoricalStatistics {
  [fieldName: string]: {
    uniqueCount: number;
    topValues: Array<{ value: TopValue; count: number }>;
    cardinality: number;
  };
}

export interface DistributionInfo {
  type: 'normal' | 'uniform' | 'skewed' | 'multimodal';
  parameters: Record<string, number>;
  goodnessOfFit?: number;
}

export interface AccessPolicy {
  permissions: Permission[];
  restrictions: Restriction[];
  auditRequired: boolean;
}

export interface Permission {
  principal: string;
  principalType: 'user' | 'role' | 'group';
  actions: string[];
  conditions?: Condition[];
}

export interface Restriction {
  type: 'time' | 'location' | 'purpose' | 'rate';
  parameters: ParameterObject;
}

export interface Condition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: string | number | boolean;
}

export interface ValidationResults {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  validatedAt: Date;
  validationRules: ValidationRule[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  count: number;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export interface ValidationRule {
  name: string;
  type: string;
  parameters: ParameterObject;
  passed: boolean;
}

// RAG System interfaces
export interface RAGSystem extends BaseEntity {
  name: string;
  description?: string;

  // Configuration
  embeddingModel: string;
  vectorDimensions: number;
  chunkSize: number;
  chunkOverlap: number;
  retrievalStrategy: RAGRetrievalStrategy;
  maxRetrievalDocs: number;
  similarityThreshold: number;

  // Generation configuration
  generativeModel: string;
  maxTokens: number;
  temperature: number;
  systemPrompt?: string;
  contextPrompt?: string;

  // Performance metrics
  totalQueries: number;
  avgResponseTime: number;
  successRate: number;

  // Relationships
  documents?: RAGDocument[];
  queries?: RAGQuery[];
}

export interface RAGDocument extends BaseEntity {
  ragSystemId: string;
  title: string;
  content: string;
  contentType: string;
  source?: string;
  url?: string;
  tags: string[];
  category?: string;
  language: string;

  // Processing status
  processed: boolean;
  chunks?: DocumentChunk[];
  embeddings?: number[][];

  // Metadata
  metadata: MetadataObject;

  // Relationships
  ragSystem?: RAGSystem;
}

export interface DocumentChunk {
  id: string;
  text: string;
  embedding?: number[];
  metadata: MetadataObject;
  position: number;
  tokenCount: number;
}

export interface RAGQuery extends BaseEntity {
  ragSystemId: string;
  query: string;
  queryEmbedding: number[];
  retrievedDocs: RetrievedDocument[];
  generatedResponse: string;

  // Performance metrics
  retrievalTime: number;
  generationTime: number;
  totalTime: number;

  // User context
  userId?: string;
  sessionId?: string;

  // Feedback
  rating?: number;
  feedback?: string;

  // Relationships
  ragSystem?: RAGSystem;
}

export interface RetrievedDocument {
  id: string;
  title: string;
  content: string;
  score: number;
  metadata: MetadataObject;
}

// AI Gateway interfaces
export interface AIGateway extends BaseEntity {
  controlTowerId: string;
  name: string;
  description?: string;

  // Gateway configuration
  endpoint: string;
  authentication: AuthenticationConfig;
  rateLimit: RateLimitConfig;
  caching: CachingConfig;
  monitoring: MonitoringConfig;

  // Provider configuration
  providers: AIProvider[];
  routingRules: RoutingRule[];
  fallbackRules: FallbackRule[];

  // Security
  securityPolicies: SecurityPolicy[];
  guardrails: Guardrail[];

  // Performance metrics
  totalRequests: number;
  avgResponseTime: number;
  errorRate: number;

  // Relationships
  controlTower?: AIControlTower;
  requests?: GatewayRequest[];
}

export interface AuthenticationConfig {
  type: 'api_key' | 'oauth' | 'jwt' | 'none';
  parameters: ParameterObject;
  scopes?: string[];
}

export interface RateLimitConfig {
  enabled: boolean;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit?: number;
}

export interface CachingConfig {
  enabled: boolean;
  ttl: number;
  keyPattern: string;
  invalidationRules: string[];
}

export interface MonitoringConfig {
  enabled: boolean;
  metricsCollection: MetricsConfig;
  alerting: AlertingConfig;
  logging: LoggingConfig;
}

export interface MetricsConfig {
  latency: boolean;
  throughput: boolean;
  errorRate: boolean;
  customMetrics: string[];
}

export interface AlertingConfig {
  enabled: boolean;
  thresholds: AlertThreshold[];
  channels: AlertChannel[];
}

export interface AlertThreshold {
  metric: string;
  operator: 'greater_than' | 'less_than' | 'equals';
  value: number;
  duration: number;
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  configuration: ConfigurationObject;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  retention: number;
  sensitiveFields: string[];
}

export interface AIProvider {
  name: string;
  type:
    | 'OPENAI'
    | 'ANTHROPIC'
    | 'AZURE_OPENAI'
    | 'GOOGLE'
    | 'AWS_BEDROCK'
    | 'HUGGINGFACE'
    | 'CUSTOM';
  endpoint: string;
  authentication: AuthenticationConfig;
  models: ProviderModel[];
  capabilities: string[];
  costTracking: CostTrackingConfig;
}

export interface ProviderModel {
  name: string;
  type: string;
  maxTokens: number;
  costPerToken: number;
  latencyEstimate: number;
  qualityScore?: number;
}

export interface CostTrackingConfig {
  enabled: boolean;
  currency: string;
  billing: BillingConfig;
}

export interface BillingConfig {
  model: 'per_token' | 'per_request' | 'per_minute' | 'flat_rate';
  rates: Record<string, number>;
}

export interface RoutingRule {
  name: string;
  condition: RoutingCondition;
  target: RoutingTarget;
  priority: number;
  enabled: boolean;
}

export interface RoutingCondition {
  type: 'model_type' | 'user_tier' | 'content_type' | 'cost_threshold' | 'latency_requirement';
  operator: 'equals' | 'contains' | 'matches' | 'greater_than' | 'less_than';
  value: string | number | boolean;
}

export interface RoutingTarget {
  provider: string;
  model: string;
  configuration?: ConfigurationObject;
}

export interface FallbackRule {
  name: string;
  trigger: FallbackTrigger;
  target: RoutingTarget;
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'constant';
}

export interface FallbackTrigger {
  type: 'error' | 'timeout' | 'rate_limit' | 'cost_limit';
  parameters: ParameterObject;
}

export interface SecurityPolicy {
  name: string;
  type: 'content_filter' | 'rate_limit' | 'access_control' | 'data_privacy';
  rules: SecurityRule[];
  enforcement: 'block' | 'warn' | 'log';
}

export interface SecurityRule {
  name: string;
  condition: string;
  action: 'allow' | 'deny' | 'modify';
  parameters: ParameterObject;
}

export interface Guardrail {
  name: string;
  type:
    | 'input_validation'
    | 'output_filtering'
    | 'bias_detection'
    | 'toxicity_detection'
    | 'pii_detection';
  configuration: GuardrailConfig;
  enabled: boolean;
}

export interface GuardrailConfig {
  rules: GuardrailRule[];
  thresholds: Record<string, number>;
  actions: GuardrailAction[];
}

export interface GuardrailRule {
  name: string;
  pattern: string;
  type: 'regex' | 'ml_model' | 'keyword' | 'semantic';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface GuardrailAction {
  trigger: string;
  action: 'block' | 'redact' | 'replace' | 'flag';
  parameters: ParameterObject;
}

export interface GatewayRequest extends BaseEntity {
  gatewayId: string;
  requestId: string;
}

export type RequestBody = string | ConfigurationObject | null;
export type ResponseBody = string | ConfigurationObject | null;

export interface GatewayRequest extends BaseEntity {
  gatewayId: string;
  requestId: string;

  // Request details
  method: string;
  endpoint: string;
  headers: Record<string, string>;
  body?: RequestBody;

  // Routing
  provider: string;
  model: string;
  routingRule?: string;

  // Response details
  statusCode: number;
  responseBody?: ResponseBody;
  responseHeaders: Record<string, string>;

  // Performance
  requestTime: Date;
  responseTime: Date;
  duration: number;

  // User context
  userId?: string;
  apiKey?: string;
  userAgent?: string;
  ipAddress?: string;

  // Cost tracking
  cost?: number;
  tokensUsed?: number;

  // Error handling
  error?: string;
  retryCount?: number;

  // Relationships
  gateway?: AIGateway;
}

// Audit Trail interfaces
export interface AIAuditTrail extends BaseEntity {
  controlTowerId?: string;
  modelId?: string;

  // Event details
  eventType: AuditEventType;
  action: string;
  description?: string;

  // Entity information
  entityType: string;
  entityId: string;

  // User context
  userId: string;
  userRole?: string;
  userAgent?: string;
  ipAddress?: string;

  // Change tracking
  oldValues?: MetadataObject;
  newValues?: MetadataObject;
  changedFields: string[];

  // Request context
  sessionId?: string;
  requestId?: string;
  metadata?: MetadataObject;

  // Risk assessment
  riskLevel: AuditRiskLevel;
  complianceFlags: string[];

  // Relationships
  controlTower?: AIControlTower;
  model?: AIModel;
}

// Model Deployment interfaces
export interface ModelDeployment extends BaseEntity {
  modelId: string;
  name: string;
  description?: string;

  // Deployment configuration
  environment: 'development' | 'staging' | 'production';
  version: string;
  endpoint?: string;

  // Infrastructure
  infrastructure: InfrastructureConfig;
  scaling: ScalingConfig;
  monitoring: DeploymentMonitoringConfig;

  // Status
  status: 'deploying' | 'active' | 'inactive' | 'failed' | 'updating';
  healthStatus: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

  // Performance metrics
  requestCount: number;
  avgLatency: number;
  errorRate: number;
  uptime: number;

  // Lifecycle
  deployedAt?: Date;
  lastUpdatedAt?: Date;

  // Relationships
  model?: AIModel;
}

export interface InfrastructureConfig {
  provider: 'aws' | 'gcp' | 'azure' | 'kubernetes' | 'docker' | 'serverless';
  region: string;
  instanceType: string;
  instanceCount: number;
  storage: StorageConfig;
  networking: NetworkingConfig;
}

export interface StorageConfig {
  type: 'ssd' | 'hdd' | 's3' | 'gcs' | 'azure_blob';
  size: number;
  backup: boolean;
  encryption: boolean;
}

export interface NetworkingConfig {
  vpc?: string;
  subnet?: string;
  securityGroups: string[];
  loadBalancer?: LoadBalancerConfig;
}

export interface LoadBalancerConfig {
  type: 'application' | 'network' | 'classic';
  scheme: 'internal' | 'internet-facing';
  healthCheck: HealthCheckConfig;
}

export interface HealthCheckConfig {
  path: string;
  interval: number;
  timeout: number;
  healthyThreshold: number;
  unhealthyThreshold: number;
}

export interface ScalingConfig {
  minInstances: number;
  maxInstances: number;
  targetUtilization: number;
  scaleUpCooldown: number;
  scaleDownCooldown: number;
  autoscaling: boolean;
}

export interface DeploymentMonitoringConfig {
  metrics: DeploymentMetrics;
  alerts: DeploymentAlert[];
  logging: DeploymentLogging;
}

export interface DeploymentMetrics {
  latency: boolean;
  throughput: boolean;
  errorRate: boolean;
  resourceUtilization: boolean;
  customMetrics: CustomMetric[];
}

export interface CustomMetric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  labels: string[];
  description?: string;
}

export interface DeploymentAlert {
  name: string;
  condition: string;
  threshold: number;
  duration: number;
  severity: 'info' | 'warning' | 'critical';
  actions: string[];
}

export interface DeploymentLogging {
  level: 'debug' | 'info' | 'warn' | 'error';
  structured: boolean;
  retention: number;
  aggregation: boolean;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface MetricsResponse {
  towerId: string;
  towerName: string;
  timeRange: string;
  models: ModelMetrics;
  requests: RequestMetrics;
  audit: AuditMetrics;
  generatedAt: Date;
}

export interface ModelMetrics {
  total: number;
  active: number;
  training: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byFramework?: Record<string, number>;
}

export interface RequestMetrics {
  total: number;
  averageResponseTime: number;
  errorRate: number;
  throughput: number;
  costTracking?: number;
}

export interface AuditMetrics {
  totalEvents: number;
  highRiskEvents: number;
  eventsByType: Record<string, number>;
  riskDistribution: Record<string, number>;
  complianceViolations?: number;
}

// Form interfaces for UI components
export interface CreateTowerForm {
  name: string;
  description?: string;
  environment: AIControlTowerEnvironment;
  organizationId: string;
  configuration?: ConfigurationObject;
  metadata?: MetadataObject;
}

export interface CreateModelForm {
  towerId: string;
  name: string;
  description?: string;
  type: AIModelType;
  framework: AIModelFramework;
  version?: string;
  configuration?: ModelConfiguration;
}

export interface CreateDatasetForm {
  towerId: string;
  name: string;
  description?: string;
  datasetType: DatasetType;
  storagePath: string;
  storageFormat: StorageFormat;
  schema?: DatasetSchema;
  metadata?: DatasetMetadata;
}

export interface StartTrainingForm {
  modelId: string;
  name: string;
  description?: string;
  jobType: TrainingJobType;
  trainingConfig: TrainingConfiguration;
  datasetConfig: DatasetConfiguration;
}

export interface CreateRAGForm {
  name: string;
  description?: string;
  embeddingModel?: string;
  vectorDimensions?: number;
  chunkSize?: number;
  chunkOverlap?: number;
  retrievalStrategy?: RAGRetrievalStrategy;
  maxRetrievalDocs?: number;
  similarityThreshold?: number;
  generativeModel?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface RAGQueryForm {
  ragSystemId: string;
  query: string;
  maxDocs?: number;
  sessionId?: string;
}

// Utility types
export type AIEntityType =
  | 'AIControlTower'
  | 'AIModel'
  | 'TrainingJob'
  | 'CustomDataset'
  | 'RAGSystem'
  | 'RAGDocument'
  | 'AIGateway'
  | 'ModelDeployment';

export type TrainingStatus = TrainingJobStatus;
export type ModelTypes = AIModelType;
export type Frameworks = AIModelFramework;

// Export all enums and interfaces
export * from './ai-control-tower.types';
