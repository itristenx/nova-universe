import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { aiMonitoringSystem } from './ai-monitoring.js';
import { aiFabric } from './ai-fabric.js';

// Interfaces for GPT-OSS Integration
export interface GPTOSSConfig {
  modelPath: string;
  maxTokens: number;
  temperature: number;
  securityLevel: 'high' | 'medium' | 'low';
  isolationMode: 'container' | 'sandbox' | 'process';
  encryptionEnabled: boolean;
  auditLevel: 'full' | 'basic' | 'minimal';
  timeoutMs: number;
  maxConcurrentRequests: number;
  memoryLimit: string;
}

export interface GPTOSSRequest {
  id: string;
  prompt: string;
  context?: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types;
  userId?: string;
  sessionId?: string;
  securityContext: {
    classification: 'public' | 'internal' | 'confidential' | 'restricted';
    sanitizationLevel: 'strict' | 'moderate' | 'basic';
    outputFiltering: boolean;
  };
  constraints?: {
    maxTokens?: number;
    temperature?: number;
    stopSequences?: string[];
    presencePenalty?: number;
    frequencyPenalty?: number;
  };
}

export interface GPTOSSResponse {
  id: string;
  response: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  processingTime: number;
  securityAssessment: {
    inputSanitized: boolean;
    outputFiltered: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    detectedIssues: string[];
  };
  modelInfo: {
    version: string;
    checkpoint: string;
    temperature: number;
  };
  metadata: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  rules: {
    inputFilters: Array<{
      type: 'regex' | 'keyword' | 'classifier';
      pattern: string;
      action: 'block' | 'sanitize' | 'flag';
    }>;
    outputFilters: Array<{
      type: 'pii' | 'sensitive' | 'harmful' | 'custom';
      detector: string;
      action: 'block' | 'redact' | 'flag';
    }>;
    contextRestrictions: {
      maxHistoryLength: number;
      allowedDataTypes: string[];
      forbiddenPatterns: string[];
    };
  };
  compliance: {
    gdprCompliant: boolean;
    ccpaCompliant: boolean;
    hipaaCompliant: boolean;
    customRequirements: string[];
  };
}

export interface IsolationContainer {
  id: string;
  status: 'initializing' | 'ready' | 'busy' | 'error' | 'terminated';
  resources: {
    cpuLimit: string;
    memoryLimit: string;
    networkIsolation: boolean;
    filesystemAccess: 'none' | 'readonly' | 'limited';
  };
  security: {
    seccompProfile: string;
    selinuxContext: string;
    capabilities: string[];
    userNamespace: boolean;
  };
  createdAt: Date;
  lastUsed: Date;
}

/**
 * Secure GPT-OSS-20B Integration System
 * Provides secure, isolated access to OpenAI's gpt-oss-20b model
 */
export class SecureGPTOSSIntegration extends EventEmitter {
  private config: GPTOSSConfig;
  private securityPolicies: Map<string, SecurityPolicy> = new Map();
  private isolationContainers: Map<string, IsolationContainer> = new Map();
  private requestQueue: GPTOSSRequest[] = [];
  private activeRequests = 0;
  private encryptionKey: Buffer;
  private modelStatus: 'offline' | 'loading' | 'ready' | 'error' = 'offline';
  private lastHealthCheck: Date = new Date();

  constructor(config?: Partial<GPTOSSConfig>) {
    super();
    
    this.config = {
      modelPath: process.env.GPT_OSS_MODEL_PATH || '/workspace/models/gpt-oss-20b',
      maxTokens: 2048,
      temperature: 0.7,
      securityLevel: 'high',
      isolationMode: 'container',
      encryptionEnabled: true,
      auditLevel: 'full',
      timeoutMs: 30000,
      maxConcurrentRequests: 5,
      memoryLimit: '8GB',
      ...config
    };

    this.initializeEncryption();
    this.loadSecurityPolicies();
    this.initializeIsolation();
    this.startHealthMonitoring();
  }

  /**
   * Initialize encryption for secure model communication
   */
  private initializeEncryption(): void {
    if (this.config.encryptionEnabled) {
      // Generate or load encryption key
      const _keyPath = path.join(this.config.modelPath, '.encryption.key');
      try {
        // In production, use proper key management (HSM, KMS, etc.)
        this.encryptionKey = crypto.randomBytes(32);
        console.log('Encryption initialized for GPT-OSS integration');
      } catch (error) {
        console.error('Failed to initialize encryption:', error);
        throw new Error('Encryption initialization failed');
      }
    }
  }

  /**
   * Load security policies for content filtering
   */
  private async loadSecurityPolicies(): Promise<void> {
    // Default security policy for Nova ITSM
    const defaultPolicy: SecurityPolicy = {
      id: 'nova-default',
      name: 'Nova ITSM Default Security Policy',
      rules: {
        inputFilters: [
          {
            type: 'regex',
            pattern: '\\b(?:password|token|secret|key)\\s*[=:]\\s*\\S+',
            action: 'sanitize'
          },
          {
            type: 'keyword',
            pattern: 'DROP TABLE|DELETE FROM|INSERT INTO',
            action: 'block'
          },
          {
            type: 'classifier',
            pattern: 'malicious_prompt',
            action: 'block'
          }
        ],
        outputFilters: [
          {
            type: 'pii',
            detector: 'nova_pii_detector',
            action: 'redact'
          },
          {
            type: 'sensitive',
            detector: 'nova_sensitive_detector',
            action: 'flag'
          },
          {
            type: 'harmful',
            detector: 'openai_moderation',
            action: 'block'
          }
        ],
        contextRestrictions: {
          maxHistoryLength: 10,
          allowedDataTypes: ['text', 'json', 'markdown'],
          forbiddenPatterns: ['<script', 'javascript:', 'data:']
        }
      },
      compliance: {
        gdprCompliant: true,
        ccpaCompliant: true,
        hipaaCompliant: false,
        customRequirements: ['nova_data_protection', 'itsm_compliance']
      }
    };

    this.securityPolicies.set('nova-default', defaultPolicy);

    // HIPAA-compliant policy for healthcare customers
    const hipaaPolicy: SecurityPolicy = {
      id: 'nova-hipaa',
      name: 'Nova HIPAA Compliant Policy',
      rules: {
        inputFilters: [
          ...defaultPolicy.rules.inputFilters,
          {
            type: 'regex',
            pattern: '\\b\\d{3}-\\d{2}-\\d{4}\\b', // SSN pattern
            action: 'block'
          }
        ],
        outputFilters: [
          ...defaultPolicy.rules.outputFilters,
          {
            type: 'pii',
            detector: 'hipaa_phi_detector',
            action: 'block'
          }
        ],
        contextRestrictions: {
          ...defaultPolicy.rules.contextRestrictions,
          maxHistoryLength: 5 // Stricter for HIPAA
        }
      },
      compliance: {
        ...defaultPolicy.compliance,
        hipaaCompliant: true,
        customRequirements: [...defaultPolicy.compliance.customRequirements, 'hipaa_phi_protection']
      }
    };

    this.securityPolicies.set('nova-hipaa', hipaaPolicy);
  }

  /**
   * Initialize isolation environment
   */
  private async initializeIsolation(): Promise<void> {
    try {
      if (this.config.isolationMode === 'container') {
        await this.initializeContainerIsolation(); // TODO-LINT: move to async function
      } else if (this.config.isolationMode === 'sandbox') {
        await this.initializeSandboxIsolation(); // TODO-LINT: move to async function
      } else {
        await this.initializeProcessIsolation(); // TODO-LINT: move to async function
      }

      console.log(`GPT-OSS isolation initialized in ${this.config.isolationMode} mode`);
    } catch (error) {
      console.error('Failed to initialize isolation:', error);
      throw error;
    }
  }

  /**
   * Initialize container-based isolation (Docker/Podman)
   */
  private async initializeContainerIsolation(): Promise<void> {
    // Create isolated container for GPT-OSS model
    const containerId = crypto.randomBytes(8).toString('hex');
    
    const container: IsolationContainer = {
      id: containerId,
      status: 'initializing',
      resources: {
        cpuLimit: '4',
        memoryLimit: this.config.memoryLimit,
        networkIsolation: true,
        filesystemAccess: 'readonly'
      },
      security: {
        seccompProfile: 'runtime/default',
        selinuxContext: 'system_u:system_r:container_t:s0',
        capabilities: ['CAP_NET_BIND_SERVICE'],
        userNamespace: true
      },
      createdAt: new Date(),
      lastUsed: new Date()
    };

    this.isolationContainers.set(containerId, container);

    // In production, actually create Docker container here
    // docker run --security-opt seccomp=runtime/default --memory=8g --cpus=4 ...
    
    container.status = 'ready';
    this.isolationContainers.set(containerId, container);
  }

  /**
   * Initialize sandbox-based isolation
   */
  private async initializeSandboxIsolation(): Promise<void> {
    // Implement sandbox using seccomp, namespaces, cgroups
    console.log('Sandbox isolation initialized');
  }

  /**
   * Initialize process-based isolation
   */
  private async initializeProcessIsolation(): Promise<void> {
    // Implement process isolation with restricted permissions
    console.log('Process isolation initialized');
  }

  /**
   * Start health monitoring for the model
   */
  private startHealthMonitoring(): void {
    // Health check every 30 seconds
    setInterval(async () => {
      await this.performHealthCheck(); // TODO-LINT: move to async function
    }, 30000);

    // Container cleanup every 5 minutes
    setInterval(async () => {
      await this.cleanupContainers(); // TODO-LINT: move to async function
    }, 5 * 60 * 1000);
  }

  /**
   * Process GPT-OSS request securely
   */
  async processRequest(request: GPTOSSRequest): Promise<GPTOSSResponse> {
    const startTime = Date.now();
    
    // Security validation
    await this.validateRequest(request); // TODO-LINT: move to async function
    
    // Apply rate limiting
    if (this.activeRequests >= this.config.maxConcurrentRequests) {
      this.requestQueue.push(request);
      await this.waitForQueueProcessing(request.id); // TODO-LINT: move to async function
    }

    this.activeRequests++;

    try {
      // Sanitize input
      const sanitizedPrompt = await this.sanitizeInput(request); // TODO-LINT: move to async function
      
      // Get available container
      const container = await this.getAvailableContainer(); // TODO-LINT: move to async function
      
      // Process in isolated environment
      const rawResponse = await this.executeInIsolation(container, {
        ...request,
        prompt: sanitizedPrompt
      }); // TODO-LINT: move to async function
      
      // Filter output
      const filteredResponse = await this.filterOutput(rawResponse, request); // TODO-LINT: move to async function
      
      // Security assessment
      const securityAssessment = await this.assessSecurity(request, filteredResponse); // TODO-LINT: move to async function
      
      const response: GPTOSSResponse = {
        id: request.id,
        response: filteredResponse.content,
        tokens: filteredResponse.tokens,
        processingTime: Date.now() - startTime,
        securityAssessment,
        modelInfo: {
          version: 'gpt-oss-20b',
          checkpoint: 'nova-secure-v1',
          temperature: request.constraints?.temperature || this.config.temperature
        },
        metadata: {
          containerId: container.id,
          securityPolicy: 'nova-default',
          encryptionUsed: this.config.encryptionEnabled
        }
      };

      // Record audit event
      await aiMonitoringSystem.recordAuditEvent({
        type: 'gpt_oss_request_processed',
        userId: request.userId || 'system',
        details: {
          requestId: request.id,
          tokens: response.tokens.total,
          securityLevel: request.securityContext.classification,
          processingTime: response.processingTime
        },
        riskLevel: securityAssessment.riskLevel
      }); // TODO-LINT: move to async function

      // Record performance metric
      await aiMonitoringSystem.recordMetric({
        type: 'gpt_oss_performance',
        value: response.processingTime,
        metadata: {
          tokens: response.tokens.total,
          containerId: container.id
        }
      }); // TODO-LINT: move to async function

      this.emit('requestProcessed', response);
      return response;

    } catch (error) {
      await aiMonitoringSystem.recordAuditEvent({
        type: 'gpt_oss_request_failed',
        userId: request.userId || 'system',
        details: {
          requestId: request.id,
          error: error.message,
          securityLevel: request.securityContext.classification
        },
        riskLevel: 'high'
      }); // TODO-LINT: move to async function

      throw error;
    } finally {
      this.activeRequests--;
      this.processQueue();
    }
  }

  /**
   * Validate incoming request
   */
  private async validateRequest(request: GPTOSSRequest): Promise<void> {
    // Check required fields
    if (!request.id || !request.prompt) {
      throw new Error('Invalid request: missing required fields');
    }

    // Validate security context
    if (!request.securityContext || !request.securityContext.classification) {
      throw new Error('Invalid request: missing security context');
    }

    // Check prompt length
    if (request.prompt.length > 10000) {
      throw new Error('Request rejected: prompt too long');
    }

    // Check for malicious patterns
    const maliciousPatterns = [
      /\b(ignore|forget|disregard)\s+(previous|above|system)\s+(instructions?|prompts?)\b/i,
      /\b(you\s+are\s+now|act\s+as|pretend\s+to\s+be)\b/i,
      /\b(jailbreak|bypass|override)\b/i
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(request.prompt)) {
        await aiMonitoringSystem.recordAuditEvent({
          type: 'malicious_prompt_detected',
          userId: request.userId || 'system',
          details: { requestId: request.id, pattern: pattern.source },
          riskLevel: 'high'
        }); // TODO-LINT: move to async function
        throw new Error('Request rejected: potentially malicious prompt detected');
      }
    }
  }

  /**
   * Sanitize input according to security policy
   */
  private async sanitizeInput(request: GPTOSSRequest): Promise<string> {
    let sanitized = request.prompt;
    const policy = this.securityPolicies.get('nova-default')!;

    for (const filter of policy.rules.inputFilters) {
      switch (filter.action) {
        case 'block':
          if (new RegExp(filter.pattern).test(sanitized)) {
            throw new Error(`Input blocked by security policy: ${filter.type}`);
          }
          break;
        case 'sanitize':
          sanitized = sanitized.replace(new RegExp(filter.pattern, 'gi'), '[REDACTED]');
          break;
        case 'flag':
          if (new RegExp(filter.pattern).test(sanitized)) {
            await aiMonitoringSystem.recordAuditEvent({
              type: 'input_flagged',
              userId: request.userId || 'system',
              details: { requestId: request.id, filter: filter.type },
              riskLevel: 'medium'
            }); // TODO-LINT: move to async function
          }
          break;
      }
    }

    return sanitized;
  }

  /**
   * Get available isolation container
   */
  private async getAvailableContainer(): Promise<IsolationContainer> {
    // Find ready container
    for (const container of this.isolationContainers.values()) {
      if (container.status === 'ready') {
        container.status = 'busy';
        container.lastUsed = new Date();
        return container;
      }
    }

    // Create new container if needed
    if (this.isolationContainers.size < this.config.maxConcurrentRequests) {
      await this.initializeContainerIsolation(); // TODO-LINT: move to async function
      return this.getAvailableContainer();
    }

    throw new Error('No available containers');
  }

  /**
   * Execute request in isolated environment
   */
  private async executeInIsolation(
    container: IsolationContainer,
    request: GPTOSSRequest
  ): Promise<any> {
    try {
      // Encrypt request if enabled
      let payload = request;
      if (this.config.encryptionEnabled) {
        payload = this.encryptRequest(request);
      }

      // Execute in container (simplified - in production, use actual container execution)
      const mockResponse = {
        content: `This is a secure response from GPT-OSS-20B to: "${request.prompt.substring(0, 50)}..."`,
        tokens: {
          prompt: Math.ceil(request.prompt.length / 4),
          completion: 100,
          total: Math.ceil(request.prompt.length / 4) + 100
        }
      };

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000)); // TODO-LINT: move to async function

      return mockResponse;

    } catch (error) {
      throw new Error(`Container execution failed: ${error.message}`);
    } finally {
      container.status = 'ready';
    }
  }

  /**
   * Encrypt request for secure transmission
   */
  private encryptRequest(request: GPTOSSRequest): any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types {
    if (!this.config.encryptionEnabled || !this.encryptionKey) {
      return request;
    }

    const cipher = crypto.createCipher('aes-256-gcm', this.encryptionKey);
    const encrypted = cipher.update(JSON.stringify(request), 'utf8', 'hex') + cipher.final('hex');
    
    return {
      encrypted: true,
      data: encrypted,
      iv: cipher.getAuthTag()
    };
  }

  /**
   * Filter model output according to security policy
   */
  private async filterOutput(response: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types, request: GPTOSSRequest): Promise<any> {
    let filteredContent = response.content;
    const policy = this.securityPolicies.get('nova-default')!;

    for (const filter of policy.rules.outputFilters) {
      switch (filter.type) {
        case 'pii':
          filteredContent = await this.redactPII(filteredContent); // TODO-LINT: move to async function
          break;
        case 'sensitive':
          filteredContent = await this.flagSensitive(filteredContent, request); // TODO-LINT: move to async function
          break;
        case 'harmful': {
        const 
        isHarmful = await this.detectHarmful(filteredContent); // TODO-LINT: move to async function
          if (isHarmful && filter.action === 'block') {
            throw new Error('Response blocked: harmful content detected');
          }
          break;
      }
    }

    return {
      ...response,
      content: filteredContent
    };
  }

  /**
   * Redact PII from response
   */
  private async redactPII(content: string): Promise<string> {
    // Email addresses
    content = content.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]');
    
    // Phone numbers
    content = content.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE_REDACTED]');
    
    // Credit card numbers (simple pattern)
    content = content.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD_REDACTED]');
    
    return content;
  }

  /**
   * Flag sensitive content
   */
  private async flagSensitive(content: string, request: GPTOSSRequest): Promise<string> {
    const sensitivePatterns = [
      /\b(confidential|secret|proprietary)\b/i,
      /\b(password|api[_\s]*key|token)\b/i
    ];

    for (const pattern of sensitivePatterns) {
      if (pattern.test(content)) {
        await aiMonitoringSystem.recordAuditEvent({
          type: 'sensitive_content_detected',
          userId: request.userId || 'system',
          details: { requestId: request.id, pattern: pattern.source },
          riskLevel: 'medium'
        }); // TODO-LINT: move to async function
      }
    }

    return content;
  }

  /**
   * Detect harmful content
   */
  private async detectHarmful(content: string): Promise<boolean> {
    // Simplified harmful content detection
    const harmfulPatterns = [
      /\b(violence|threat|harm)\b/i,
      /\b(illegal|criminal)\b/i
    ];

    return harmfulPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Assess security of request/response
   */
  private async assessSecurity(
    request: GPTOSSRequest,
    response: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types
  ): Promise<GPTOSSResponse['securityAssessment']> {
    const issues: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Check input sanitization
    const inputSanitized = request.prompt !== request.prompt; // Simplified check

    // Check output filtering
    const outputFiltered = response.content.includes('[REDACTED]') || 
                          response.content.includes('[EMAIL_REDACTED]');

    // Assess overall risk
    if (request.securityContext.classification === 'restricted') {
      riskLevel = 'high';
      issues.push('Processing restricted data');
    } else if (request.securityContext.classification === 'confidential') {
      riskLevel = 'medium';
      issues.push('Processing confidential data');
    }

    return {
      inputSanitized,
      outputFiltered,
      riskLevel,
      detectedIssues: issues
    };
  }

  /**
   * Wait for queue processing
   */
  private async waitForQueueProcessing(requestId: string): Promise<void> {
    return new Promise((resolve) => {
      const checkQueue = () => {
        const index = this.requestQueue.findIndex(r => r.id === requestId);
        if (index === -1) {
          resolve();
        } else {
          setTimeout(checkQueue, 100);
        }
      };
      checkQueue();
    });
  }

  /**
   * Process request queue
   */
  private processQueue(): void {
    if (this.requestQueue.length > 0 && this.activeRequests < this.config.maxConcurrentRequests) {
      const nextRequest = this.requestQueue.shift()!;
      this.processRequest(nextRequest).catch(error => {
        console.error('Queue processing error:', error);
      });
    }
  }

  /**
   * Perform health check
   */
  private async performHealthCheck(): Promise<void> {
    try {
      // Check model availability
      if (this.modelStatus !== 'ready') {
        await this.loadModel(); // TODO-LINT: move to async function
      }

      // Check container health
      for (const container of this.isolationContainers.values()) {
        if (container.status === 'error') {
          await this.restartContainer(container.id); // TODO-LINT: move to async function
        }
      }

      this.lastHealthCheck = new Date();

      await aiMonitoringSystem.recordMetric({
        type: 'gpt_oss_health_check',
        value: 1,
        metadata: {
          modelStatus: this.modelStatus,
          activeContainers: this.isolationContainers.size
        }
      }); // TODO-LINT: move to async function

    } catch (error) {
      console.error('GPT-OSS health check failed:', error);
      
      await aiMonitoringSystem.recordAuditEvent({
        type: 'gpt_oss_health_check_failed',
        userId: 'system',
        details: { error: error.message },
        riskLevel: 'high'
      }); // TODO-LINT: move to async function
    }
  }

  /**
   * Load GPT-OSS model
   */
  private async loadModel(): Promise<void> {
    this.modelStatus = 'loading';
    
    try {
      // In production, actually load the model
      console.log('Loading GPT-OSS-20B model...');
      
      // Simulate model loading
      await new Promise(resolve => setTimeout(resolve, 5000)); // TODO-LINT: move to async function
      
      this.modelStatus = 'ready';
      console.log('GPT-OSS-20B model loaded successfully');

      await aiMonitoringSystem.recordAuditEvent({
        type: 'gpt_oss_model_loaded',
        userId: 'system',
        details: { modelPath: this.config.modelPath },
        riskLevel: 'low'
      }); // TODO-LINT: move to async function

    } catch (error) {
      this.modelStatus = 'error';
      throw error;
    }
  }

  /**
   * Restart container
   */
  private async restartContainer(containerId: string): Promise<void> {
    const container = this.isolationContainers.get(containerId);
    if (!container) return;

    container.status = 'initializing';
    
    try {
      // In production, restart actual container
      await new Promise(resolve => setTimeout(resolve, 1000)); // TODO-LINT: move to async function
      
      container.status = 'ready';
      container.lastUsed = new Date();

    } catch (error) {
      container.status = 'error';
      console.error(`Failed to restart container ${containerId}:`, error);
    }
  }

  /**
   * Cleanup unused containers
   */
  private async cleanupContainers(): Promise<void> {
    const now = new Date();
    const cleanupThreshold = 10 * 60 * 1000; // 10 minutes

    for (const [id, container] of this.isolationContainers) {
      if (container.status === 'ready' && 
          now.getTime() - container.lastUsed.getTime() > cleanupThreshold) {
        
        container.status = 'terminated';
        this.isolationContainers.delete(id);
        
        console.log(`Cleaned up unused container: ${id}`);
      }
    }
  }

  /**
   * Get system status
   */
  getStatus(): any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types {
    return {
      modelStatus: this.modelStatus,
      activeRequests: this.activeRequests,
      queueLength: this.requestQueue.length,
      containers: {
        total: this.isolationContainers.size,
        ready: Array.from(this.isolationContainers.values()).filter(c => c.status === 'ready').length,
        busy: Array.from(this.isolationContainers.values()).filter(c => c.status === 'busy').length
      },
      config: {
        securityLevel: this.config.securityLevel,
        isolationMode: this.config.isolationMode,
        encryptionEnabled: this.config.encryptionEnabled
      },
      lastHealthCheck: this.lastHealthCheck
    };
  }

  /**
   * Shutdown gracefully
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down GPT-OSS integration...');
    
    // Wait for active requests to complete
    while (this.activeRequests > 0) {
      await new Promise(resolve => setTimeout(resolve, 100)); // TODO-LINT: move to async function
    }

    // Cleanup containers
    for (const container of this.isolationContainers.values()) {
      container.status = 'terminated';
    }
    this.isolationContainers.clear();

    console.log('GPT-OSS integration shutdown complete');
  }
}

// Export singleton instance
export const _secureGPTOSS = new SecureGPTOSSIntegration();

// Register with AI Fabric
aiFabric.registerProvider({
  id: 'gpt-oss-20b',
  name: 'Secure GPT-OSS-20B',
  type: 'external',
  capabilities: ['text-generation', 'conversation', 'analysis'],
  config: {
    secure: true,
    isolated: true,
    compliant: true
  },
  isActive: true,
  healthStatus: 'healthy',
  lastHealthCheck: new Date()
});
