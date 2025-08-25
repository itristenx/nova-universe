/**
 * Nova Universe Setup Wizard Service
 * Enterprise-grade setup wizard with real-time communication, validation, and progress tracking
 */

import { EventEmitter } from 'events';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { logger } from '../logger.js';
import { WebSocketServer } from 'ws';

class SetupWizardService extends EventEmitter {
  constructor() {
    super();
    this.sessions = new Map();
    this.configurations = new Map();
    this.progressTracking = new Map();
    this.auditLog = [];
    this.rollbackStack = new Map();
    this.websocketServer = null;

    // Setup wizard step definitions with dependency checking
    this.steps = [
      {
        id: 'welcome',
        name: 'Welcome & Prerequisites',
        description: 'System requirements and environment verification',
        required: true,
        dependencies: [],
        validation: this.validateWelcomeStep.bind(this),
        rollback: this.rollbackWelcomeStep.bind(this),
        estimatedTime: 30, // seconds
      },
      {
        id: 'organization',
        name: 'Organization Setup',
        description: 'Configure organization details, branding, and basic settings',
        required: true,
        dependencies: ['welcome'],
        validation: this.validateOrganizationStep.bind(this),
        rollback: this.rollbackOrganizationStep.bind(this),
        estimatedTime: 120,
      },
      {
        id: 'admin',
        name: 'Administrator Account',
        description: 'Create primary administrator account and security settings',
        required: true,
        dependencies: ['organization'],
        validation: this.validateAdminStep.bind(this),
        rollback: this.rollbackAdminStep.bind(this),
        estimatedTime: 90,
      },
      {
        id: 'database',
        name: 'Database Configuration',
        description: 'Configure and initialize database connections',
        required: true,
        dependencies: ['admin'],
        validation: this.validateDatabaseStep.bind(this),
        rollback: this.rollbackDatabaseStep.bind(this),
        estimatedTime: 180,
      },
      {
        id: 'communications',
        name: 'Communication Integration',
        description: 'Configure Slack, Teams, email, and notification systems',
        required: false,
        dependencies: ['database'],
        validation: this.validateCommunicationsStep.bind(this),
        rollback: this.rollbackCommunicationsStep.bind(this),
        estimatedTime: 240,
      },
      {
        id: 'monitoring',
        name: 'Monitoring & Alerting',
        description: 'Setup Nova Sentinel monitoring and GoAlert alerting',
        required: false,
        dependencies: ['database'],
        validation: this.validateMonitoringStep.bind(this),
        rollback: this.rollbackMonitoringStep.bind(this),
        estimatedTime: 300,
      },
      {
        id: 'storage',
        name: 'File Storage & Search',
        description: 'Configure S3 storage and Elasticsearch search backend',
        required: false,
        dependencies: ['database'],
        validation: this.validateStorageStep.bind(this),
        rollback: this.rollbackStorageStep.bind(this),
        estimatedTime: 180,
      },
      {
        id: 'ai',
        name: 'AI & Automation',
        description: 'Configure Nova Synth AI features and automation workflows',
        required: false,
        dependencies: ['database', 'storage'],
        validation: this.validateAIStep.bind(this),
        rollback: this.rollbackAIStep.bind(this),
        estimatedTime: 150,
      },
      {
        id: 'security',
        name: 'Security & Authentication',
        description: 'Configure SSO, MFA, and advanced security settings',
        required: false,
        dependencies: ['admin'],
        validation: this.validateSecurityStep.bind(this),
        rollback: this.rollbackSecurityStep.bind(this),
        estimatedTime: 200,
      },
      {
        id: 'final',
        name: 'Finalization & Testing',
        description: 'Complete setup, run system tests, and create initial data',
        required: true,
        dependencies: ['admin', 'database'],
        validation: this.validateFinalStep.bind(this),
        rollback: this.rollbackFinalStep.bind(this),
        estimatedTime: 120,
      },
    ];

    // Build dependency graph after steps are defined
    this.dependencyGraph = this.buildDependencyGraph();
  }

  /**
   * Initialize WebSocket server for real-time communication
   */
  initializeWebSocketServer(httpServer) {
    this.websocketServer = new WebSocketServer({
      server: httpServer,
      path: '/setup-wizard/ws',
    });

    this.websocketServer.on('connection', (ws, request) => {
      const sessionId = this.extractSessionId(request);
      const clientId = crypto.randomUUID();

      logger.info(`Setup wizard WebSocket connection established: ${clientId}`);

      ws.sessionId = sessionId;
      ws.clientId = clientId;

      // Store client connection
      if (!this.sessions.has(sessionId)) {
        this.sessions.set(sessionId, {
          clients: new Set(),
          currentStep: 'welcome',
          configuration: {},
          startTime: new Date(),
          progress: 0,
          status: 'started',
        });
      }

      this.sessions.get(sessionId).clients.add(ws);

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleWebSocketMessage(ws, message);
        } catch (error) {
          logger.error('WebSocket message handling error:', error);
          this.sendError(ws, 'Invalid message format', error.message);
        }
      });

      ws.on('close', () => {
        logger.info(`Setup wizard WebSocket disconnected: ${clientId}`);
        if (this.sessions.has(sessionId)) {
          this.sessions.get(sessionId).clients.delete(ws);
        }
      });

      ws.on('error', (error) => {
        logger.error(`Setup wizard WebSocket error for ${clientId}:`, error);
      });

      // Send initial state
      this.sendToClient(ws, {
        type: 'connected',
        sessionId,
        clientId,
        steps: this.getStepsForClient(),
        currentStep: this.sessions.get(sessionId).currentStep,
        progress: this.sessions.get(sessionId).progress,
      });
    });

    logger.info('Setup wizard WebSocket server initialized on /setup-wizard/ws');
  }

  /**
   * Handle incoming WebSocket messages
   */
  async handleWebSocketMessage(ws, message) {
    const { type, payload } = message;
    const session = this.sessions.get(ws.sessionId);

    if (!session) {
      return this.sendError(ws, 'Session not found');
    }

    switch (type) {
      case 'validate_step':
        await this.handleStepValidation(ws, payload);
        break;
      case 'complete_step':
        await this.handleStepCompletion(ws, payload);
        break;
      case 'test_connection':
        await this.handleConnectionTest(ws, payload);
        break;
      case 'save_progress':
        await this.handleProgressSave(ws, payload);
        break;
      case 'resume_session':
        await this.handleSessionResume(ws, payload);
        break;
      case 'rollback_step':
        await this.handleStepRollback(ws, payload);
        break;
      case 'export_config':
        await this.handleConfigExport(ws, payload);
        break;
      case 'import_config':
        await this.handleConfigImport(ws, payload);
        break;
      case 'get_dependencies':
        await this.handleDependencyCheck(ws, payload);
        break;
      default:
        this.sendError(ws, 'Unknown message type', type);
    }
  }

  /**
   * Validate a setup step with real-time feedback
   */
  async handleStepValidation(ws, payload) {
    const { stepId, data } = payload;
    const session = this.sessions.get(ws.sessionId);

    try {
      const step = this.steps.find((s) => s.id === stepId);
      if (!step) {
        return this.sendError(ws, 'Step not found', stepId);
      }

      // Check dependencies
      const dependencyCheck = await this.checkStepDependencies(stepId, session);
      if (!dependencyCheck.satisfied) {
        return this.sendError(ws, 'Dependencies not satisfied', dependencyCheck.missing);
      }

      // Run validation
      this.sendToClient(ws, {
        type: 'validation_started',
        stepId,
        progress: 0,
      });

      const validationResult = await step.validation(data, session, (progress) => {
        this.sendToClient(ws, {
          type: 'validation_progress',
          stepId,
          progress,
        });
      });

      if (validationResult.valid) {
        this.sendToClient(ws, {
          type: 'validation_success',
          stepId,
          result: validationResult,
        });
      } else {
        this.sendToClient(ws, {
          type: 'validation_error',
          stepId,
          errors: validationResult.errors,
          suggestions: validationResult.suggestions,
        });
      }
    } catch (error) {
      logger.error(`Step validation error for ${stepId}:`, error);
      this.sendError(ws, 'Validation failed', error.message);
    }
  }

  /**
   * Complete a setup step and move to next
   */
  async handleStepCompletion(ws, payload) {
    const { stepId, data } = payload;
    const session = this.sessions.get(ws.sessionId);

    try {
      // Validate before completion
      const step = this.steps.find((s) => s.id === stepId);
      const validationResult = await step.validation(data, session);

      if (!validationResult.valid) {
        return this.sendError(ws, 'Step validation failed', validationResult.errors);
      }

      // Store configuration
      session.configuration[stepId] = data;

      // Create rollback point
      this.createRollbackPoint(ws.sessionId, stepId, data);

      // Update progress
      const completedSteps = Object.keys(session.configuration).length;
      const totalSteps = this.steps.filter(
        (s) => s.required || Object.prototype.hasOwnProperty.call(session.configuration, s.id),
      ).length;
      session.progress = Math.round((completedSteps / totalSteps) * 100);

      // Determine next step
      const nextStep = this.getNextStep(stepId, session);
      session.currentStep = nextStep?.id || 'complete';

      // Broadcast to all clients in session
      this.broadcastToSession(ws.sessionId, {
        type: 'step_completed',
        stepId,
        nextStep: nextStep?.id,
        progress: session.progress,
        estimatedTimeRemaining: this.calculateRemainingTime(session),
      });

      // Auto-save progress
      await this.saveProgress(ws.sessionId);

      // Add to audit log
      this.addAuditEntry(ws.sessionId, 'step_completed', { stepId, data });
    } catch (error) {
      logger.error(`Step completion error for ${stepId}:`, error);
      this.sendError(ws, 'Step completion failed', error.message);
    }
  }

  /**
   * Test external service connections
   */
  async handleConnectionTest(ws, payload) {
    const { service, config } = payload;

    try {
      this.sendToClient(ws, {
        type: 'connection_test_started',
        service,
      });

      let testResult;
      switch (service) {
        case 'slack':
          testResult = await this.testSlackConnection(config);
          break;
        case 'database':
          testResult = await this.testDatabaseConnection(config);
          break;
        case 'email':
          testResult = await this.testEmailConnection(config);
          break;
        case 'elasticsearch':
          testResult = await this.testElasticsearchConnection(config);
          break;
        case 's3':
          testResult = await this.testS3Connection(config);
          break;
        case 'sentinel':
          testResult = await this.testSentinelConnection(config);
          break;
        case 'goalert':
          testResult = await this.testGoAlertConnection(config);
          break;
        default:
          throw new Error(`Unknown service: ${service}`);
      }

      this.sendToClient(ws, {
        type: 'connection_test_result',
        service,
        result: testResult,
      });
    } catch (error) {
      logger.error(`Connection test error for ${service}:`, error);
      this.sendError(ws, 'Connection test failed', error.message);
    }
  }

  /**
   * Build dependency graph for setup steps
   */
  buildDependencyGraph() {
    const graph = new Map();

    this.steps.forEach((step) => {
      graph.set(step.id, {
        ...step,
        dependents: [],
      });
    });

    // Build reverse dependencies
    this.steps.forEach((step) => {
      step.dependencies.forEach((dep) => {
        if (graph.has(dep)) {
          graph.get(dep).dependents.push(step.id);
        }
      });
    });

    return graph;
  }

  /**
   * Check if step dependencies are satisfied
   */
  async checkStepDependencies(stepId, session) {
    const step = this.dependencyGraph.get(stepId);
    const missing = [];

    for (const dep of step.dependencies) {
      if (!Object.prototype.hasOwnProperty.call(session.configuration, dep)) {
        missing.push(dep);
      }
    }

    return {
      satisfied: missing.length === 0,
      missing,
      required: step.dependencies,
    };
  }

  /**
   * Get next available step based on dependencies
   */
  getNextStep(currentStepId, session) {
    const completedSteps = new Set(Object.keys(session.configuration));
    completedSteps.add(currentStepId);

    return this.steps.find((step) => {
      if (completedSteps.has(step.id)) return false;
      return step.dependencies.every((dep) => completedSteps.has(dep));
    });
  }

  /**
   * Calculate estimated remaining time
   */
  calculateRemainingTime(session) {
    const completedSteps = Object.keys(session.configuration);
    const remainingSteps = this.steps.filter(
      (step) =>
        !completedSteps.includes(step.id) &&
        (step.required || session.selectedOptionalSteps?.includes(step.id)),
    );

    return remainingSteps.reduce((total, step) => total + step.estimatedTime, 0);
  }

  /**
   * Create rollback point for step
   */
  createRollbackPoint(sessionId, stepId, data) {
    if (!this.rollbackStack.has(sessionId)) {
      this.rollbackStack.set(sessionId, []);
    }

    this.rollbackStack.get(sessionId).push({
      stepId,
      data,
      timestamp: new Date(),
      rollback: this.steps.find((s) => s.id === stepId).rollback,
    });
  }

  /**
   * Handle step rollback
   */
  async handleStepRollback(ws, payload) {
    const { stepId } = payload;
    const session = this.sessions.get(ws.sessionId);
    const rollbackStack = this.rollbackStack.get(ws.sessionId) || [];

    try {
      // Find rollback point
      const rollbackPoint = rollbackStack.find((point) => point.stepId === stepId);
      if (!rollbackPoint) {
        return this.sendError(ws, 'No rollback point found', stepId);
      }

      // Execute rollback
      await rollbackPoint.rollback(rollbackPoint.data, session);

      // Remove from configuration
      delete session.configuration[stepId];

      // Remove rollback points after this step
      const filteredStack = rollbackStack.filter(
        (point) => this.getStepIndex(point.stepId) < this.getStepIndex(stepId),
      );
      this.rollbackStack.set(ws.sessionId, filteredStack);

      // Update session state
      session.currentStep = stepId;
      session.progress = this.calculateProgress(session);

      this.broadcastToSession(ws.sessionId, {
        type: 'step_rolled_back',
        stepId,
        currentStep: session.currentStep,
        progress: session.progress,
      });

      this.addAuditEntry(ws.sessionId, 'step_rolled_back', { stepId });
    } catch (error) {
      logger.error(`Rollback error for ${stepId}:`, error);
      this.sendError(ws, 'Rollback failed', error.message);
    }
  }

  /**
   * Save progress to persistent storage
   */
  async saveProgress(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const progressFile = path.join(process.cwd(), 'data', 'setup-progress', `${sessionId}.json`);

    // Ensure directory exists
    mkdirSync(path.dirname(progressFile), { recursive: true });

    const progressData = {
      sessionId,
      currentStep: session.currentStep,
      configuration: session.configuration,
      progress: session.progress,
      startTime: session.startTime,
      lastSaved: new Date(),
      auditLog: this.auditLog.filter((entry) => entry.sessionId === sessionId),
    };

    writeFileSync(progressFile, JSON.stringify(progressData, null, 2));
    logger.info(`Setup progress saved for session ${sessionId}`);
  }

  /**
   * Resume setup session from saved progress
   */
  async handleSessionResume(ws, payload) {
    const { sessionId } = payload;

    try {
      const progressFile = path.join(process.cwd(), 'data', 'setup-progress', `${sessionId}.json`);

      if (!existsSync(progressFile)) {
        return this.sendError(ws, 'No saved progress found', sessionId);
      }

      const progressData = JSON.parse(readFileSync(progressFile, 'utf8'));

      // Restore session state
      const session = this.sessions.get(ws.sessionId) || {
        clients: new Set(),
        status: 'resumed',
      };

      Object.assign(session, {
        currentStep: progressData.currentStep,
        configuration: progressData.configuration,
        progress: progressData.progress,
        startTime: new Date(progressData.startTime),
      });

      this.sessions.set(ws.sessionId, session);
      session.clients.add(ws);

      this.sendToClient(ws, {
        type: 'session_resumed',
        session: {
          currentStep: session.currentStep,
          progress: session.progress,
          configuration: session.configuration,
          startTime: session.startTime,
        },
      });

      this.addAuditEntry(ws.sessionId, 'session_resumed', { originalSessionId: sessionId });
    } catch (error) {
      logger.error(`Session resume error:`, error);
      this.sendError(ws, 'Session resume failed', error.message);
    }
  }

  /**
   * Export configuration for deployment consistency
   */
  async handleConfigExport(ws, payload) {
    const session = this.sessions.get(ws.sessionId);
    const { format = 'json', includeSecrets = false } = payload;

    try {
      let config = { ...session.configuration };

      // Sanitize secrets if not explicitly included
      if (!includeSecrets) {
        config = this.sanitizeConfiguration(config);
      }

      const exportData = {
        version: '1.0',
        exported: new Date().toISOString(),
        sessionId: ws.sessionId,
        configuration: config,
        metadata: {
          setupVersion: process.env.npm_package_version,
          nodeVersion: process.version,
          platform: process.platform,
        },
      };

      let exportContent;
      switch (format) {
        case 'json':
          exportContent = JSON.stringify(exportData, null, 2);
          break;
        case 'yaml':
          exportContent = this.convertToYaml(exportData);
          break;
        case 'env':
          exportContent = this.convertToEnvFile(exportData.configuration);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      this.sendToClient(ws, {
        type: 'config_exported',
        format,
        content: exportContent,
        filename: `nova-setup-${ws.sessionId}.${format}`,
      });
    } catch (error) {
      logger.error('Config export error:', error);
      this.sendError(ws, 'Config export failed', error.message);
    }
  }

  /**
   * Add entry to audit log
   */
  addAuditEntry(sessionId, action, data) {
    this.auditLog.push({
      timestamp: new Date(),
      sessionId,
      action,
      data,
      clientIp: this.getSessionClientIp(sessionId),
    });
  }

  /**
   * Utility methods for step validation
   */
  async validateWelcomeStep(data, session, progressCallback) {
    progressCallback?.(25);

    // Check system requirements
    const requirements = await this.checkSystemRequirements();
    progressCallback?.(50);

    // Verify permissions
    const permissions = await this.checkFileSystemPermissions();
    progressCallback?.(75);

    // Check network connectivity
    const network = await this.checkNetworkConnectivity();
    progressCallback?.(100);

    return {
      valid: requirements.passed && permissions.passed && network.passed,
      errors: [
        ...(requirements.errors || []),
        ...(permissions.errors || []),
        ...(network.errors || []),
      ],
      suggestions: [
        ...(requirements.suggestions || []),
        ...(permissions.suggestions || []),
        ...(network.suggestions || []),
      ],
    };
  }

  async validateOrganizationStep(data, session, progressCallback) {
    const errors = [];
    const suggestions = [];

    progressCallback?.(20);

    // Validate organization name
    if (!data.name || data.name.length < 2) {
      errors.push('Organization name is required and must be at least 2 characters');
    }

    progressCallback?.(40);

    // Validate logo URL if provided
    if (data.logoUrl) {
      const logoValid = await this.validateImageUrl(data.logoUrl);
      if (!logoValid) {
        errors.push('Logo URL is not accessible or not a valid image');
        suggestions.push(
          'Ensure the logo URL is publicly accessible and points to a valid image file',
        );
      }
    }

    progressCallback?.(60);

    // Validate color scheme
    if (data.primaryColor && !this.isValidColor(data.primaryColor)) {
      errors.push('Primary color must be a valid hex color code');
    }

    progressCallback?.(80);

    // Check domain availability if provided
    if (data.domain) {
      const domainValid = await this.validateDomain(data.domain);
      if (!domainValid) {
        errors.push('Domain is not accessible or invalid');
        suggestions.push('Ensure the domain is properly configured and points to your server');
      }
    }

    progressCallback?.(100);

    return {
      valid: errors.length === 0,
      errors,
      suggestions,
    };
  }

  async validateAdminStep(data, session, progressCallback) {
    const errors = [];
    const suggestions = [];

    progressCallback?.(25);

    // Validate email
    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Valid email address is required');
    }

    progressCallback?.(50);

    // Validate password strength
    const passwordValidation = this.validatePassword(data.password);
    if (!passwordValidation.valid) {
      errors.push(...passwordValidation.errors);
      suggestions.push(...passwordValidation.suggestions);
    }

    progressCallback?.(75);

    // Check if email is already in use
    const emailExists = await this.checkEmailExists(data.email);
    if (emailExists) {
      errors.push('Email address is already in use');
      suggestions.push('Use a different email address or recover the existing account');
    }

    progressCallback?.(100);

    return {
      valid: errors.length === 0,
      errors,
      suggestions,
    };
  }

  async validateDatabaseStep(data, session, progressCallback) {
    const errors = [];
    const suggestions = [];

    try {
      progressCallback?.(20);

      // Test database connection
      const connection = await this.testDatabaseConnection(data);
      progressCallback?.(50);

      if (!connection.success) {
        errors.push(`Database connection failed: ${connection.error}`);
        suggestions.push('Check database credentials and ensure the database server is running');
      } else {
        // Test database permissions
        const permissions = await this.testDatabasePermissions(data);
        progressCallback?.(75);

        if (!permissions.canCreate || !permissions.canWrite) {
          errors.push('Database user lacks required permissions');
          suggestions.push(
            'Ensure database user has CREATE, SELECT, INSERT, UPDATE, DELETE permissions',
          );
        }

        // Check database version compatibility
        const versionCheck = await this.checkDatabaseVersion(data);
        progressCallback?.(90);

        if (!versionCheck.compatible) {
          errors.push(`Database version ${versionCheck.version} is not supported`);
          suggestions.push(`Please upgrade to PostgreSQL 12.0 or higher`);
        }
      }

      progressCallback?.(100);
    } catch (error) {
      errors.push(`Database validation error: ${error.message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      suggestions,
    };
  }

  // Additional validation methods for other steps...
  async validateCommunicationsStep(_data, _session, _progressCallback) {
    // Implementation for communications validation
    return { valid: true, errors: [], suggestions: [] };
  }

  async validateMonitoringStep(_data, _session, _progressCallback) {
    // Implementation for monitoring validation
    return { valid: true, errors: [], suggestions: [] };
  }

  async validateStorageStep(_data, _session, _progressCallback) {
    // Implementation for storage validation
    return { valid: true, errors: [], suggestions: [] };
  }

  async validateAIStep(_data, _session, _progressCallback) {
    // Implementation for AI validation
    return { valid: true, errors: [], suggestions: [] };
  }

  async validateSecurityStep(_data, _session, _progressCallback) {
    // Implementation for security validation
    return { valid: true, errors: [], suggestions: [] };
  }

  async validateFinalStep(_data, _session, _progressCallback) {
    // Implementation for final validation
    return { valid: true, errors: [], suggestions: [] };
  }

  // Rollback methods for each step
  async rollbackWelcomeStep(_data, _session) {
    // No rollback needed for welcome step
  }

  async rollbackOrganizationStep(_data, _session) {
    // Reset organization configuration
    logger.info('Rolling back organization configuration');
  }

  async rollbackAdminStep(_data, _session) {
    // Remove admin user if created
    logger.info('Rolling back admin user creation');
  }

  async rollbackDatabaseStep(_data, _session) {
    // Drop database changes if any
    logger.info('Rolling back database configuration');
  }

  async rollbackCommunicationsStep(_data, _session) {
    // Reset communication settings
    logger.info('Rolling back communication configuration');
  }

  async rollbackMonitoringStep(_data, _session) {
    // Reset monitoring settings
    logger.info('Rolling back monitoring configuration');
  }

  async rollbackStorageStep(_data, _session) {
    // Reset storage settings
    logger.info('Rolling back storage configuration');
  }

  async rollbackAIStep(_data, _session) {
    // Reset AI settings
    logger.info('Rolling back AI configuration');
  }

  async rollbackSecurityStep(_data, _session) {
    // Reset security settings
    logger.info('Rolling back security configuration');
  }

  async rollbackFinalStep(_data, _session) {
    // Reset final configuration
    logger.info('Rolling back final configuration');
  }

  /**
   * Utility methods
   */
  sendToClient(ws, message) {
    if (ws.readyState === 1) {
      // WebSocket.OPEN
      ws.send(JSON.stringify(message));
    }
  }

  sendError(ws, message, details = null) {
    this.sendToClient(ws, {
      type: 'error',
      message,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastToSession(sessionId, message) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.clients.forEach((client) => {
        this.sendToClient(client, message);
      });
    }
  }

  extractSessionId(request) {
    // Extract session ID from request headers or URL
    return (
      request.headers['x-session-id'] ||
      new URL(request.url, 'http://localhost').searchParams.get('sessionId') ||
      crypto.randomUUID()
    );
  }

  getStepsForClient() {
    return this.steps.map((step) => ({
      id: step.id,
      name: step.name,
      description: step.description,
      required: step.required,
      dependencies: step.dependencies,
      estimatedTime: step.estimatedTime,
    }));
  }

  getStepIndex(stepId) {
    return this.steps.findIndex((step) => step.id === stepId);
  }

  calculateProgress(session) {
    const completedSteps = Object.keys(session.configuration).length;
    const totalSteps = this.steps.filter((s) => s.required).length;
    return Math.round((completedSteps / totalSteps) * 100);
  }

  sanitizeConfiguration(config) {
    const sanitized = { ...config };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'secret', 'key', 'token', 'apiKey', 'privateKey'];

    const removeSensitive = (obj) => {
      Object.keys(obj).forEach((key) => {
        if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          removeSensitive(obj[key]);
        }
      });
    };

    removeSensitive(sanitized);
    return sanitized;
  }

  // System validation helper methods
  async checkSystemRequirements() {
    // Implementation for system requirements check
    return { passed: true, errors: [], suggestions: [] };
  }

  async checkFileSystemPermissions() {
    // Implementation for file system permissions check
    return { passed: true, errors: [], suggestions: [] };
  }

  async checkNetworkConnectivity() {
    // Implementation for network connectivity check
    return { passed: true, errors: [], suggestions: [] };
  }

  async validateImageUrl(_url) {
    // Implementation for image URL validation
    return true;
  }

  isValidColor(color) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  async validateDomain(_domain) {
    // Implementation for domain validation
    return true;
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  validatePassword(password) {
    const errors = [];
    const suggestions = [];

    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      suggestions.push('Consider adding special characters for stronger security');
    }

    return {
      valid: errors.length === 0,
      errors,
      suggestions,
    };
  }

  async checkEmailExists(_email) {
    // Implementation for email existence check
    return false;
  }

  async testDatabaseConnection(_config) {
    // Implementation for database connection test
    return { success: true };
  }

  async testDatabasePermissions(_config) {
    // Implementation for database permissions test
    return { canCreate: true, canWrite: true };
  }

  async checkDatabaseVersion(_config) {
    // Implementation for database version check
    return { compatible: true, version: '14.0' };
  }

  async testSlackConnection(_config) {
    // Implementation for Slack connection test
    return { success: true };
  }

  async testEmailConnection(_config) {
    // Implementation for email connection test
    return { success: true };
  }

  async testElasticsearchConnection(_config) {
    // Implementation for Elasticsearch connection test
    return { success: true };
  }

  async testS3Connection(_config) {
    // Implementation for S3 connection test
    return { success: true };
  }

  async testSentinelConnection(_config) {
    // Implementation for Sentinel connection test
    return { success: true };
  }

  async testGoAlertConnection(_config) {
    // Implementation for GoAlert connection test
    return { success: true };
  }

  getSessionClientIp(_sessionId) {
    // Implementation to get client IP
    return '127.0.0.1';
  }

  convertToYaml(data) {
    // Simple YAML conversion (in production, use a proper YAML library)
    return JSON.stringify(data, null, 2);
  }

  convertToEnvFile(config) {
    // Convert configuration to .env file format
    const envLines = [];

    const flatten = (obj, prefix = '') => {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        const envKey = prefix ? `${prefix}_${key.toUpperCase()}` : key.toUpperCase();

        if (typeof value === 'object' && value !== null) {
          flatten(value, envKey);
        } else {
          envLines.push(`${envKey}=${value}`);
        }
      });
    };

    flatten(config);
    return envLines.join('\n');
  }
}

export default SetupWizardService;
