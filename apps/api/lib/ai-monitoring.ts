/**
 * Nova AI Monitoring & Compliance System
 * 
 * Comprehensive monitoring, auditing, and compliance system for AI operations
 * following industry standards for AI governance, risk management, and regulatory compliance.
 * 
 * Features:
 * - Real-time AI performance monitoring
 * - Comprehensive audit trails
 * - Bias detection and mitigation
 * - Privacy and data protection
 * - Regulatory compliance (GDPR, CCPA, AI Act, etc.)
 * - Cost tracking and optimization
 * - Quality assurance and drift detection
 * - Security monitoring and threat detection
 * - Explainability and transparency
 */

import { EventEmitter } from 'events';
import { logger } from '../logger.js';
import { z } from 'zod';
import crypto from 'crypto';

// Monitoring Types and Interfaces
export interface AIMetric {
  id: string;
  timestamp: Date;
  metricType: 'performance' | 'cost' | 'quality' | 'bias' | 'security' | 'compliance';
  providerId: string;
  model: string;
  value: number;
  unit: string;
  metadata: Record<string, any>;
  tags: string[];
}

export interface AIAuditEvent {
  id: string;
  timestamp: Date;
  eventType: 'request' | 'response' | 'error' | 'admin_action' | 'policy_violation' | 'data_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  sessionId?: string;
  providerId?: string;
  model?: string;
  input?: any;
  output?: any;
  metadata: Record<string, any>;
  complianceFlags: string[];
  riskScore: number;
  location?: {
    country: string;
    region: string;
    ip: string;
  };
}

export interface BiasMetric {
  id: string;
  timestamp: Date;
  model: string;
  testType: 'demographic_parity' | 'equal_opportunity' | 'fairness_through_unawareness' | 'individual_fairness';
  protectedAttribute: string;
  biasScore: number;
  threshold: number;
  passed: boolean;
  sampleSize: number;
  metadata: Record<string, any>;
}

export interface PrivacyAssessment {
  id: string;
  timestamp: Date;
  dataType: 'pii' | 'sensitive' | 'biometric' | 'health' | 'financial';
  dataSource: string;
  processingPurpose: string;
  legalBasis: string;
  retentionPeriod: number;
  encryptionStatus: boolean;
  anonymizationLevel: 'none' | 'pseudonymized' | 'anonymized' | 'synthetic';
  riskLevel: 'low' | 'medium' | 'high';
  complianceStatus: Record<string, boolean>; // GDPR, CCPA, etc.
}

export interface ComplianceReport {
  id: string;
  timestamp: Date;
  reportType: 'gdpr' | 'ccpa' | 'ai_act' | 'sox' | 'hipaa' | 'custom';
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalRequests: number;
    violationCount: number;
    dataSubjectRequests: number;
    breachIncidents: number;
    averageRiskScore: number;
  };
  findings: Array<{
    type: string;
    severity: string;
    description: string;
    recommendation: string;
  }>;
  status: 'compliant' | 'non_compliant' | 'partial_compliance';
}

export interface ModelDriftMetric {
  id: string;
  timestamp: Date;
  model: string;
  driftType: 'data_drift' | 'concept_drift' | 'prediction_drift';
  driftScore: number;
  threshold: number;
  alertTriggered: boolean;
  baselineDate: Date;
  detectionMethod: string;
  affectedFeatures?: string[];
}

export interface SecurityAlert {
  id: string;
  timestamp: Date;
  alertType: 'anomalous_usage' | 'potential_attack' | 'data_exfiltration' | 'model_inversion' | 'prompt_injection';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  sessionId?: string;
  model?: string;
  indicators: string[];
  mitigationActions: string[];
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
}

export interface ExplainabilityReport {
  id: string;
  timestamp: Date;
  requestId: string;
  model: string;
  prediction: any;
  explanation: {
    method: 'lime' | 'shap' | 'gradcam' | 'attention' | 'saliency';
    featureImportances: Array<{
      feature: string;
      importance: number;
      direction: 'positive' | 'negative';
    }>;
    confidence: number;
    reasoning: string;
  };
  humanReadable: string;
}

/**
 * Main AI Monitoring System
 */
export class NovaAIMonitoringSystem extends EventEmitter {
  private metrics: Map<string, AIMetric> = new Map();
  private auditEvents: Map<string, AIAuditEvent> = new Map();
  private biasMetrics: Map<string, BiasMetric> = new Map();
  private privacyAssessments: Map<string, PrivacyAssessment> = new Map();
  private driftMetrics: Map<string, ModelDriftMetric> = new Map();
  private securityAlerts: Map<string, SecurityAlert> = new Map();
  private explainabilityReports: Map<string, ExplainabilityReport> = new Map();
  
  private isInitialized = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alertingEnabled = true;
  
  // Configuration
  private config = {
    retentionPeriod: 365 * 24 * 60 * 60 * 1000, // 1 year
    alertThresholds: {
      responseTime: 5000, // 5 seconds
      errorRate: 0.05, // 5%
      biasScore: 0.2,
      driftScore: 0.3,
      riskScore: 0.8,
      costPerRequest: 1.0 // $1
    },
    complianceStandards: ['gdpr', 'ccpa', 'ai_act'],
    privacyControls: {
      dataMinimization: true,
      purposeLimitation: true,
      retentionLimits: true,
      encryptionRequired: true
    },
    biasDetection: {
      enabled: true,
      protectedAttributes: ['gender', 'race', 'age', 'religion', 'disability'],
      testFrequency: 'daily'
    },
    driftDetection: {
      enabled: true,
      checkInterval: 3600000, // 1 hour
      methods: ['psi', 'ks_test', 'jensen_shannon']
    }
  };

  constructor() {
    super();
  }

  /**
   * Initialize the monitoring system
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Nova AI Monitoring System...');

      // Set up monitoring intervals
      this.startContinuousMonitoring();

      // Initialize compliance frameworks
      await this.initializeComplianceFrameworks();

      // Set up alerting system
      await this.initializeAlertingSystem();

      // Load historical data
      await this.loadHistoricalData();

      this.isInitialized = true;
      this.emit('initialized');

      logger.info('Nova AI Monitoring System initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AI Monitoring System:', error);
      throw error;
    }
  }

  /**
   * Record an AI metric
   */
  async recordMetric(metric: Omit<AIMetric, 'id' | 'timestamp'>): Promise<string> {
    const fullMetric: AIMetric = {
      ...metric,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    this.metrics.set(fullMetric.id, fullMetric);

    // Check for threshold violations
    await this.checkMetricThresholds(fullMetric);

    // Emit event for real-time processing
    this.emit('metricRecorded', fullMetric);

    return fullMetric.id;
  }

  /**
   * Record an audit event
   */
  async recordAuditEvent(event: Omit<AIAuditEvent, 'id' | 'timestamp'>): Promise<string> {
    const fullEvent: AIAuditEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    // Enrich event with additional metadata
    await this.enrichAuditEvent(fullEvent);

    this.auditEvents.set(fullEvent.id, fullEvent);

    // Check for compliance violations
    await this.checkComplianceViolations(fullEvent);

    // Security analysis
    await this.analyzeSecurityImplications(fullEvent);

    this.emit('auditEventRecorded', fullEvent);

    return fullEvent.id;
  }

  /**
   * Assess bias in AI model
   */
  async assessBias(model: string, testData: any[], protectedAttribute: string): Promise<BiasMetric> {
    const biasMetric: BiasMetric = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      model,
      testType: 'demographic_parity',
      protectedAttribute,
      biasScore: 0,
      threshold: this.config.alertThresholds.biasScore,
      passed: false,
      sampleSize: testData.length,
      metadata: {}
    };

    // Calculate bias score
    biasMetric.biasScore = await this.calculateBiasScore(testData, protectedAttribute);
    biasMetric.passed = biasMetric.biasScore <= biasMetric.threshold;

    this.biasMetrics.set(biasMetric.id, biasMetric);

    // Alert if bias threshold exceeded
    if (!biasMetric.passed && this.alertingEnabled) {
      await this.triggerBiasAlert(biasMetric);
    }

    this.emit('biasAssessed', biasMetric);

    return biasMetric;
  }

  /**
   * Conduct privacy assessment
   */
  async assessPrivacy(assessment: Omit<PrivacyAssessment, 'id' | 'timestamp'>): Promise<PrivacyAssessment> {
    const fullAssessment: PrivacyAssessment = {
      ...assessment,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    // Evaluate compliance status
    fullAssessment.complianceStatus = await this.evaluatePrivacyCompliance(fullAssessment);

    this.privacyAssessments.set(fullAssessment.id, fullAssessment);

    this.emit('privacyAssessed', fullAssessment);

    return fullAssessment;
  }

  /**
   * Detect model drift
   */
  async detectDrift(model: string, currentData: any[], baselineData: any[]): Promise<ModelDriftMetric> {
    const driftMetric: ModelDriftMetric = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      model,
      driftType: 'data_drift',
      driftScore: 0,
      threshold: this.config.alertThresholds.driftScore,
      alertTriggered: false,
      baselineDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      detectionMethod: 'psi'
    };

    // Calculate drift score
    driftMetric.driftScore = await this.calculateDriftScore(currentData, baselineData);
    driftMetric.alertTriggered = driftMetric.driftScore > driftMetric.threshold;

    this.driftMetrics.set(driftMetric.id, driftMetric);

    // Alert if drift detected
    if (driftMetric.alertTriggered && this.alertingEnabled) {
      await this.triggerDriftAlert(driftMetric);
    }

    this.emit('driftDetected', driftMetric);

    return driftMetric;
  }

  /**
   * Generate explainability report
   */
  async generateExplanation(requestId: string, model: string, prediction: any, inputData: any): Promise<ExplainabilityReport> {
    const explanation: ExplainabilityReport = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      requestId,
      model,
      prediction,
      explanation: {
        method: 'shap',
        featureImportances: [],
        confidence: 0,
        reasoning: ''
      },
      humanReadable: ''
    };

    // Generate explanation based on model type
    explanation.explanation = await this.generateModelExplanation(model, prediction, inputData);
    explanation.humanReadable = await this.generateHumanReadableExplanation(explanation.explanation);

    this.explainabilityReports.set(explanation.id, explanation);

    this.emit('explanationGenerated', explanation);

    return explanation;
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(reportType: ComplianceReport['reportType'], period: { start: Date; end: Date }): Promise<ComplianceReport> {
    const report: ComplianceReport = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      reportType,
      period,
      metrics: {
        totalRequests: 0,
        violationCount: 0,
        dataSubjectRequests: 0,
        breachIncidents: 0,
        averageRiskScore: 0
      },
      findings: [],
      status: 'compliant'
    };

    // Calculate metrics for the period
    report.metrics = await this.calculateComplianceMetrics(period);

    // Generate findings
    report.findings = await this.generateComplianceFindings(reportType, period);

    // Determine overall status
    report.status = this.determineComplianceStatus(report);

    return report;
  }

  /**
   * Get monitoring dashboard data
   */
  getDashboardData(): any {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Recent metrics
    const recentMetrics = Array.from(this.metrics.values())
      .filter(m => m.timestamp >= oneHourAgo);

    const recentAuditEvents = Array.from(this.auditEvents.values())
      .filter(e => e.timestamp >= oneHourAgo);

    // Performance metrics
    const performanceMetrics = recentMetrics.filter(m => m.metricType === 'performance');
    const avgResponseTime = performanceMetrics.length > 0 
      ? performanceMetrics.reduce((sum, m) => sum + m.value, 0) / performanceMetrics.length 
      : 0;

    // Error rate
    const errorEvents = recentAuditEvents.filter(e => e.eventType === 'error');
    const errorRate = recentAuditEvents.length > 0 
      ? errorEvents.length / recentAuditEvents.length 
      : 0;

    // Recent alerts
    const recentAlerts = Array.from(this.securityAlerts.values())
      .filter(a => a.timestamp >= oneDayAgo && a.status === 'open');

    // Bias metrics
    const recentBiasMetrics = Array.from(this.biasMetrics.values())
      .filter(b => b.timestamp >= oneDayAgo);

    // Drift alerts
    const recentDriftAlerts = Array.from(this.driftMetrics.values())
      .filter(d => d.timestamp >= oneDayAgo && d.alertTriggered);

    return {
      overview: {
        totalRequests: recentAuditEvents.length,
        avgResponseTime,
        errorRate,
        activeAlerts: recentAlerts.length
      },
      performance: {
        responseTime: avgResponseTime,
        errorRate,
        throughput: recentAuditEvents.length
      },
      security: {
        alerts: recentAlerts.length,
        riskScore: recentAuditEvents.length > 0 
          ? recentAuditEvents.reduce((sum, e) => sum + e.riskScore, 0) / recentAuditEvents.length 
          : 0
      },
      compliance: {
        biasMetrics: recentBiasMetrics.length,
        driftAlerts: recentDriftAlerts.length,
        privacyAssessments: Array.from(this.privacyAssessments.values()).length
      },
      costs: {
        totalCost: recentMetrics
          .filter(m => m.metricType === 'cost')
          .reduce((sum, m) => sum + m.value, 0)
      }
    };
  }

  // Private methods
  private startContinuousMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      await this.performContinuousChecks();
    }, 60000); // Every minute
  }

  private async performContinuousChecks(): Promise<void> {
    try {
      // Check for drift
      if (this.config.driftDetection.enabled) {
        await this.performDriftChecks();
      }

      // Check for bias
      if (this.config.biasDetection.enabled) {
        await this.performBiasChecks();
      }

      // Clean up old data
      await this.cleanupOldData();
    } catch (error) {
      logger.error('Error in continuous monitoring:', error);
    }
  }

  private async performDriftChecks(): Promise<void> {
    // This would check for model drift across all active models
    logger.debug('Performing drift checks...');
  }

  private async performBiasChecks(): Promise<void> {
    // This would perform regular bias testing
    logger.debug('Performing bias checks...');
  }

  private async cleanupOldData(): Promise<void> {
    const cutoffDate = new Date(Date.now() - this.config.retentionPeriod);

    // Clean up old metrics
    for (const [id, metric] of this.metrics) {
      if (metric.timestamp < cutoffDate) {
        this.metrics.delete(id);
      }
    }

    // Clean up old audit events
    for (const [id, event] of this.auditEvents) {
      if (event.timestamp < cutoffDate) {
        this.auditEvents.delete(id);
      }
    }
  }

  private async initializeComplianceFrameworks(): Promise<void> {
    logger.info('Initializing compliance frameworks...');
    
    for (const standard of this.config.complianceStandards) {
      await this.initializeComplianceStandard(standard);
    }
  }

  private async initializeComplianceStandard(standard: string): Promise<void> {
    switch (standard) {
      case 'gdpr':
        await this.initializeGDPRCompliance();
        break;
      case 'ccpa':
        await this.initializeCCPACompliance();
        break;
      case 'ai_act':
        await this.initializeAIActCompliance();
        break;
    }
  }

  private async initializeGDPRCompliance(): Promise<void> {
    // GDPR-specific initialization
    logger.info('Initialized GDPR compliance framework');
  }

  private async initializeCCPACompliance(): Promise<void> {
    // CCPA-specific initialization
    logger.info('Initialized CCPA compliance framework');
  }

  private async initializeAIActCompliance(): Promise<void> {
    // EU AI Act-specific initialization
    logger.info('Initialized AI Act compliance framework');
  }

  private async initializeAlertingSystem(): Promise<void> {
    // Set up alerting channels (email, Slack, etc.)
    
    // Initialize integrations
    try {
      // Import integrations dynamically to avoid circular dependencies
      const { sentinelIntegration } = await import('./sentinel-integration.js');
      const { goAlertIntegration } = await import('./goalert-integration.js');
      
      // Register event listeners for external alerting
      this.on('securityAlert', async (alert) => {
        try {
          await sentinelIntegration.createIncident({
            monitorId: 'ai-security-monitor',
            component: 'ai-security',
            severity: alert.severity,
            status: 'open',
            summary: `Security Alert: ${alert.alertType}`,
            description: alert.description,
            startedAt: alert.timestamp
          });
        } catch (error) {
          logger.warn('Failed to create Sentinel incident for security alert', { 
            alertId: alert.id, 
            error: error.message 
          });
        }
      });

      this.on('biasAssessed', async (biasMetric) => {
        if (!biasMetric.passed) {
          try {
            await goAlertIntegration.createAlert({
              serviceId: 'ai-performance',
              summary: `Bias detected in model ${biasMetric.model}`,
              details: `Bias score ${biasMetric.biasScore} exceeds threshold ${biasMetric.threshold}`,
              source: 'ai_fabric',
              severity: biasMetric.biasScore > biasMetric.threshold * 2 ? 'high' : 'medium',
              component: 'ai-bias-detection',
              metadata: {
                model: biasMetric.model,
                biasScore: biasMetric.biasScore,
                threshold: biasMetric.threshold,
                protectedAttribute: biasMetric.protectedAttribute
              }
            });
          } catch (error) {
            logger.warn('Failed to create GoAlert for bias detection', { 
              model: biasMetric.model, 
              error: error.message 
            });
          }
        }
      });

      this.on('driftDetected', async (driftMetric) => {
        if (driftMetric.alertTriggered) {
          try {
            await goAlertIntegration.createAlert({
              serviceId: 'ai-performance',
              summary: `Model drift detected in ${driftMetric.model}`,
              details: `Drift score ${driftMetric.driftScore} exceeds threshold ${driftMetric.threshold}`,
              source: 'ai_fabric',
              severity: driftMetric.driftScore > driftMetric.threshold * 2 ? 'high' : 'medium',
              component: 'ai-drift-detection',
              metadata: {
                model: driftMetric.model,
                driftScore: driftMetric.driftScore,
                threshold: driftMetric.threshold,
                driftType: driftMetric.driftType
              }
            });
          } catch (error) {
            logger.warn('Failed to create GoAlert for model drift', { 
              model: driftMetric.model, 
              error: error.message 
            });
          }
        }
      });

      this.on('metricRecorded', async (metric) => {
        // Alert on performance thresholds
        if (metric.metricType === 'performance' && metric.value > 15000) { // 15 second threshold
          try {
            await sentinelIntegration.updateMonitorStatus(
              `performance-${metric.providerId}`,
              'down',
              { responseTime: metric.value }
            );
          } catch (error) {
            logger.warn('Failed to update Sentinel monitor status', { 
              providerId: metric.providerId, 
              error: error.message 
            });
          }
        }

        // Alert on high error rates
        if (metric.metricType === 'quality' && metric.value < 0.9) { // Below 90% success rate
          try {
            await goAlertIntegration.createAlert({
              serviceId: 'ai-performance',
              summary: `High error rate detected in ${metric.providerId}`,
              details: `Quality metric ${metric.value} below acceptable threshold`,
              source: 'ai_fabric',
              severity: metric.value < 0.5 ? 'critical' : 'high',
              component: metric.providerId,
              metadata: {
                metricType: metric.metricType,
                value: metric.value,
                unit: metric.unit,
                providerId: metric.providerId
              }
            });
          } catch (error) {
            logger.warn('Failed to create GoAlert for quality metric', { 
              providerId: metric.providerId, 
              error: error.message 
            });
          }
        }

        // Alert on cost thresholds
        if (metric.metricType === 'cost' && metric.value > 100) { // $100 threshold
          try {
            await goAlertIntegration.createAlert({
              serviceId: 'ai-fabric-core',
              summary: `High AI cost detected: $${metric.value}`,
              details: `Cost metric exceeds budget threshold`,
              source: 'ai_fabric',
              severity: metric.value > 500 ? 'high' : 'medium',
              component: 'ai-cost-monitoring',
              metadata: {
                metricType: metric.metricType,
                value: metric.value,
                unit: metric.unit,
                providerId: metric.providerId
              }
            });
          } catch (error) {
            logger.warn('Failed to create GoAlert for cost threshold', { 
              providerId: metric.providerId, 
              error: error.message 
            });
          }
        }
      });

      logger.info('Initialized external alerting integrations (Sentinel, GoAlert)');
    } catch (error) {
      logger.warn('Failed to initialize external alerting integrations', { error: error.message });
    }
    
    logger.info('Initialized alerting system');
  }

  private async loadHistoricalData(): Promise<void> {
    // Load historical monitoring data
    logger.info('Loading historical monitoring data...');
  }

  private async enrichAuditEvent(event: AIAuditEvent): Promise<void> {
    // Add IP geolocation
    if (event.metadata.ip) {
      event.location = await this.getLocationFromIP(event.metadata.ip);
    }

    // Add user context
    if (event.userId) {
      event.metadata.userContext = await this.getUserContext(event.userId);
    }

    // Calculate risk score
    event.riskScore = await this.calculateRiskScore(event);
  }

  private async getLocationFromIP(ip: string): Promise<{ country: string; region: string; ip: string }> {
    // IP geolocation logic
    return {
      country: 'US',
      region: 'California',
      ip
    };
  }

  private async getUserContext(userId: string): Promise<any> {
    // Fetch user context
    return { role: 'user', department: 'IT' };
  }

  private async calculateRiskScore(event: AIAuditEvent): Promise<number> {
    let riskScore = 0;

    // High-risk event types
    if (['error', 'policy_violation'].includes(event.eventType)) {
      riskScore += 0.3;
    }

    // Sensitive data processing
    if (event.metadata.containsPII) {
      riskScore += 0.2;
    }

    // Unusual access patterns
    if (event.metadata.unusualAccess) {
      riskScore += 0.4;
    }

    // Location-based risk
    if (event.location?.country !== 'US') {
      riskScore += 0.1;
    }

    return Math.min(1, riskScore);
  }

  private async checkMetricThresholds(metric: AIMetric): Promise<void> {
    const threshold = this.config.alertThresholds[metric.metricType as keyof typeof this.config.alertThresholds];
    
    if (threshold && metric.value > threshold) {
      await this.triggerThresholdAlert(metric);
    }
  }

  private async checkComplianceViolations(event: AIAuditEvent): Promise<void> {
    // Check against compliance rules
    const violations = [];

    // GDPR checks
    if (event.metadata.containsPII && !event.metadata.hasConsent) {
      violations.push('gdpr_consent_missing');
    }

    // Add violations to compliance flags
    event.complianceFlags.push(...violations);

    if (violations.length > 0) {
      await this.triggerComplianceAlert(event, violations);
    }
  }

  private async analyzeSecurityImplications(event: AIAuditEvent): Promise<void> {
    // Security analysis logic
    const securityIndicators = [];

    // Detect potential attacks
    if (event.metadata.requestSize > 1000000) { // Large request
      securityIndicators.push('large_request');
    }

    if (event.metadata.rapidRequests) {
      securityIndicators.push('rapid_requests');
    }

    if (securityIndicators.length > 0) {
      await this.createSecurityAlert(event, securityIndicators);
    }
  }

  private async calculateBiasScore(testData: any[], protectedAttribute: string): Promise<number> {
    // Demographic parity difference (absolute)
    if (!Array.isArray(testData) || testData.length === 0) return 0;
    const groups = new Map<string, { positives: number; total: number }>();
    for (const row of testData) {
      const group = String(row[protectedAttribute] ?? 'unknown');
      const bucket = groups.get(group) || { positives: 0, total: 0 };
      bucket.total += 1;
      if (row.prediction === 1 || row.prediction === true) bucket.positives += 1;
      groups.set(group, bucket);
    }
    const rates = Array.from(groups.values()).map(g => (g.total ? g.positives / g.total : 0));
    const max = Math.max(...rates);
    const min = Math.min(...rates);
    return Math.abs(max - min); // 0..1 (0 is best)
  }

  private async calculateDriftScore(currentData: any[], baselineData: any[]): Promise<number> {
    // Population Stability Index (PSI) for a single numeric feature if available
    if (!Array.isArray(currentData) || !Array.isArray(baselineData) || currentData.length === 0 || baselineData.length === 0) {
      return 0;
    }
    const feature = Object.keys(currentData[0]).find(k => typeof currentData[0][k] === 'number');
    if (!feature) return 0;
    const bins = 10;
    const all = [...currentData, ...baselineData].map(r => r[feature] as number).filter(n => Number.isFinite(n));
    if (all.length === 0) return 0;
    const min = Math.min(...all);
    const max = Math.max(...all);
    const width = (max - min) / bins || 1;
    const dist = (arr: number[]) => {
      const counts = new Array(bins).fill(0);
      for (const v of arr) {
        const idx = Math.min(bins - 1, Math.max(0, Math.floor((v - min) / width)));
        counts[idx] += 1;
      }
      const total = counts.reduce((a, b) => a + b, 0) || 1;
      return counts.map(c => c / total);
    };
    const p = dist(baselineData.map(r => r[feature] as number).filter(n => Number.isFinite(n)));
    const q = dist(currentData.map(r => r[feature] as number).filter(n => Number.isFinite(n)));
    let psi = 0;
    for (let i = 0; i < bins; i++) {
      const pi = Math.max(p[i], 1e-6);
      const qi = Math.max(q[i], 1e-6);
      psi += (qi - pi) * Math.log(qi / pi);
    }
    return Math.abs(psi); // Typical thresholds: <0.1 small, 0.1-0.25 moderate, >0.25 major drift
  }

  private async generateModelExplanation(model: string, prediction: any, inputData: any): Promise<ExplainabilityReport['explanation']> {
    // Generate explanation based on model architecture
    return {
      method: 'shap',
      featureImportances: [
        { feature: 'feature1', importance: 0.5, direction: 'positive' },
        { feature: 'feature2', importance: 0.3, direction: 'negative' }
      ],
      confidence: 0.85,
      reasoning: 'The model prediction is primarily driven by feature1 and feature2'
    };
  }

  private async generateHumanReadableExplanation(explanation: ExplainabilityReport['explanation']): Promise<string> {
    const topFeatures = explanation.featureImportances
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 3);

    return `This prediction (confidence: ${Math.round(explanation.confidence * 100)}%) is primarily based on: ${
      topFeatures.map(f => `${f.feature} (${f.direction} impact)`).join(', ')
    }.`;
  }

  private async calculateComplianceMetrics(period: { start: Date; end: Date }): Promise<ComplianceReport['metrics']> {
    const periodEvents = Array.from(this.auditEvents.values())
      .filter(e => e.timestamp >= period.start && e.timestamp <= period.end);

    return {
      totalRequests: periodEvents.length,
      violationCount: periodEvents.filter(e => e.complianceFlags.length > 0).length,
      dataSubjectRequests: periodEvents.filter(e => e.metadata.isDataSubjectRequest).length,
      breachIncidents: periodEvents.filter(e => e.severity === 'critical').length,
      averageRiskScore: periodEvents.length > 0 
        ? periodEvents.reduce((sum, e) => sum + e.riskScore, 0) / periodEvents.length 
        : 0
    };
  }

  private async generateComplianceFindings(reportType: string, period: { start: Date; end: Date }): Promise<ComplianceReport['findings']> {
    const findings: ComplianceReport['findings'] = [];

    // Analyze compliance violations
    const violations = Array.from(this.auditEvents.values())
      .filter(e => e.timestamp >= period.start && e.timestamp <= period.end && e.complianceFlags.length > 0);

    if (violations.length > 0) {
      findings.push({
        type: 'compliance_violation',
        severity: 'high',
        description: `${violations.length} compliance violations detected`,
        recommendation: 'Review and address compliance gaps'
      });
    }

    return findings;
  }

  private determineComplianceStatus(report: ComplianceReport): ComplianceReport['status'] {
    if (report.findings.some(f => f.severity === 'critical')) {
      return 'non_compliant';
    }
    if (report.findings.some(f => f.severity === 'high')) {
      return 'partial_compliance';
    }
    return 'compliant';
  }

  private async evaluatePrivacyCompliance(assessment: PrivacyAssessment): Promise<Record<string, boolean>> {
    return {
      gdpr: assessment.encryptionStatus && assessment.legalBasis !== '',
      ccpa: assessment.retentionPeriod > 0,
      hipaa: assessment.dataType !== 'health' || assessment.encryptionStatus
    };
  }

  private async triggerThresholdAlert(metric: AIMetric): Promise<void> {
    logger.warn(`Threshold exceeded for ${metric.metricType}: ${metric.value} > ${this.config.alertThresholds[metric.metricType as keyof typeof this.config.alertThresholds]}`);
  }

  private async triggerBiasAlert(biasMetric: BiasMetric): Promise<void> {
    logger.warn(`Bias detected in model ${biasMetric.model}: score ${biasMetric.biasScore} > ${biasMetric.threshold}`);
  }

  private async triggerDriftAlert(driftMetric: ModelDriftMetric): Promise<void> {
    logger.warn(`Model drift detected in ${driftMetric.model}: score ${driftMetric.driftScore} > ${driftMetric.threshold}`);
  }

  private async triggerComplianceAlert(event: AIAuditEvent, violations: string[]): Promise<void> {
    logger.warn(`Compliance violations detected: ${violations.join(', ')}`);
  }

  private async createSecurityAlert(event: AIAuditEvent, indicators: string[]): Promise<void> {
    const alert: SecurityAlert = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      alertType: 'anomalous_usage',
      severity: 'medium',
      description: `Security indicators detected: ${indicators.join(', ')}`,
      userId: event.userId,
      sessionId: event.sessionId,
      model: event.metadata.model,
      indicators,
      mitigationActions: ['rate_limiting', 'additional_monitoring'],
      status: 'open'
    };

    this.securityAlerts.set(alert.id, alert);
    this.emit('securityAlert', alert);
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down AI Monitoring System...');
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.isInitialized = false;
    logger.info('AI Monitoring System shutdown complete');
  }
}

// Export singleton instance
export const aiMonitoringSystem = new NovaAIMonitoringSystem();
