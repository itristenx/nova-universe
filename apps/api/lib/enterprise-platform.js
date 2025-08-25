import { PrismaClient } from '@prisma/client';
import winston from 'winston';

// Initialize Prisma client for enterprise database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.ENTERPRISE_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: 'enterprise-platform.log' }),
    new winston.transports.Console(),
  ],
});

/**
 * Nova Enterprise Platform Service
 * Comprehensive ServiceNow-equivalent enterprise service management
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
class NovaEnterprisePlatform {
  constructor() {
    this.prisma = prisma;
    this.logger = logger;
  }

  // =============================================================================
  // ENTERPRISE ASSET MANAGEMENT (EAM)
  // ServiceNow EAM-equivalent asset lifecycle management
  // =============================================================================

  /**
   * Asset Management Service
   */
  async createAsset(assetData) {
    try {
      logger.info('Creating new asset', { assetData });

      // Generate unique asset tag if not provided
      if (!assetData.asset_tag) {
        assetData.asset_tag = await this.generateAssetTag(assetData.category_id);
      }

      const asset = await prisma.asset.create({
        data: {
          ...assetData,
          lifecycle_stage: assetData.lifecycle_stage || 'PLANNING',
          operational_status: assetData.operational_status || 'OPERATIONAL',
          risk_score: assetData.risk_score || 0,
        },
        include: {
          category: true,
          owner: true,
          assigned_to: true,
          created_by: true,
        },
      });

      // Create configuration item if this is an IT asset
      if (this.isITAsset(asset.category.code)) {
        await this.createConfigurationItemFromAsset(asset);
      }

      // Trigger asset creation workflow
      await this.triggerWorkflow('asset_created', asset.id, 'assets');

      logger.info('Asset created successfully', { assetId: asset.id, assetTag: asset.asset_tag });
      return asset;
    } catch (error) {
      logger.error('Error creating asset', { error: error.message, assetData });
      throw error;
    }
  }

  async updateAssetLifecycle(assetId, newStage, notes) {
    try {
      const asset = await prisma.asset.update({
        where: { id: assetId },
        data: {
          lifecycle_stage: newStage,
          updated_at: new Date(),
        },
        include: { category: true, owner: true },
      });

      // Log the lifecycle change
      await this.createWorkNote({
        content: `Asset lifecycle changed to ${newStage}. ${notes || ''}`,
        asset_id: assetId,
        is_internal: true,
      });

      // Update related configuration item
      if (asset.configuration_items && asset.configuration_items.length > 0) {
        await this.updateCILifecycle(
          asset.configuration_items[0].id,
          this.mapAssetLifecycleToCI(newStage),
        );
      }

      logger.info('Asset lifecycle updated', { assetId, newStage });
      return asset;
    } catch (error) {
      logger.error('Error updating asset lifecycle', { error: error.message, assetId, newStage });
      throw error;
    }
  }

  async getAssetDashboard(filters = {}) {
    try {
      const [totalAssets, assetsByCategory, assetsByLifecycle, assetsByStatus, riskDistribution] =
        await Promise.all([
          // Total assets count
          prisma.asset.count(filters.where ? { where: filters.where } : {}),

          // Assets by category
          prisma.asset.groupBy({
            by: ['category_id'],
            _count: true,
            where: filters.where || {},
            orderBy: { _count: { category_id: 'desc' } },
          }),

          // Assets by lifecycle stage
          prisma.asset.groupBy({
            by: ['lifecycle_stage'],
            _count: true,
            where: filters.where || {},
            orderBy: { lifecycle_stage: 'asc' },
          }),

          // Assets by operational status
          prisma.asset.groupBy({
            by: ['operational_status'],
            _count: true,
            where: filters.where || {},
            orderBy: { operational_status: 'asc' },
          }),

          // Risk score distribution
          prisma.asset.groupBy({
            by: ['risk_score'],
            _count: true,
            where: filters.where || {},
            orderBy: { risk_score: 'desc' },
          }),
        ]);

      // Get category names for assets by category
      const categoryIds = assetsByCategory.map((item) => item.category_id);
      const categories = await prisma.assetCategory.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, name: true },
      });

      const assetsByCategoryWithNames = assetsByCategory.map((item) => ({
        ...item,
        category_name: categories.find((cat) => cat.id === item.category_id)?.name || 'Unknown',
      }));

      return {
        totalAssets,
        assetsByCategory: assetsByCategoryWithNames,
        assetsByLifecycle,
        assetsByStatus,
        riskDistribution,
      };
    } catch (error) {
      logger.error('Error getting asset dashboard', { error: error.message });
      throw error;
    }
  }

  async calculateAssetRiskScore(assetId) {
    try {
      const asset = await prisma.asset.findUnique({
        where: { id: assetId },
        include: {
          category: true,
          maintenance_records: { orderBy: { created_at: 'desc' }, take: 10 },
          incidents: { where: { state: { not: 'CLOSED' } } },
          configuration_items: {
            include: {
              vulnerabilities: { where: { state: { not: 'CLOSED' } } },
            },
          },
        },
      });

      if (!asset) throw new Error('Asset not found');

      let riskScore = 0;

      // Age factor (older assets have higher risk)
      if (asset.purchase_date) {
        const ageInYears =
          (new Date() - new Date(asset.purchase_date)) / (365 * 24 * 60 * 60 * 1000);
        riskScore += Math.min(ageInYears * 10, 30); // Max 30 points for age
      }

      // Maintenance history factor
      const recentMaintenanceIssues = asset.maintenance_records.filter(
        (record) =>
          record.maintenance_type === 'CORRECTIVE' || record.maintenance_type === 'EMERGENCY',
      ).length;
      riskScore += recentMaintenanceIssues * 5;

      // Active incidents factor
      riskScore += asset.incidents.length * 10;

      // Security vulnerabilities factor
      const vulnerabilities = asset.configuration_items.flatMap((ci) => ci.vulnerabilities);
      const criticalVulns = vulnerabilities.filter((v) => v.severity === 'CRITICAL').length;
      const highVulns = vulnerabilities.filter((v) => v.severity === 'HIGH').length;
      riskScore += criticalVulns * 20 + highVulns * 10;

      // Operational status factor
      if (asset.operational_status === 'NON_OPERATIONAL') riskScore += 25;
      if (asset.operational_status === 'UNDER_MAINTENANCE') riskScore += 15;

      // Normalize to 0-100 scale
      riskScore = Math.min(Math.round(riskScore), 100);

      // Update asset with calculated risk score
      await prisma.asset.update({
        where: { id: assetId },
        data: { risk_score: riskScore },
      });

      logger.info('Asset risk score calculated', { assetId, riskScore });
      return riskScore;
    } catch (error) {
      logger.error('Error calculating asset risk score', { error: error.message, assetId });
      throw error;
    }
  }

  // =============================================================================
  // SERVICE OPERATIONS WORKSPACE (SOW)
  // Unified ITSM workflows with ServiceNow SOW capabilities
  // =============================================================================

  /**
   * Incident Management Service
   */
  async createIncident(incidentData) {
    try {
      logger.info('Creating new incident', { incidentData });

      // Generate incident number
      const incidentNumber = await this.generateIncidentNumber();

      // Calculate priority based on urgency and impact
      const priority = this.calculatePriority(incidentData.urgency, incidentData.impact);

      const incident = await prisma.incident.create({
        data: {
          ...incidentData,
          number: incidentNumber,
          priority,
          state: 'NEW',
          opened_at: new Date(),
        },
        include: {
          caller: true,
          assigned_to: true,
          asset: true,
          configuration_item: true,
          service_offering: true,
        },
      });

      // Auto-assign based on category and assignment rules
      if (!incident.assigned_to_id) {
        await this.autoAssignIncident(incident.id);
      }

      // Calculate SLA due dates
      await this.calculateIncidentSLA(incident.id);

      // Trigger incident workflows
      await this.triggerWorkflow('incident_created', incident.id, 'incidents');

      // Send notifications
      await this.sendIncidentNotifications(incident, 'created');

      logger.info('Incident created successfully', { incidentId: incident.id, incidentNumber });
      return incident;
    } catch (error) {
      logger.error('Error creating incident', { error: error.message, incidentData });
      throw error;
    }
  }

  async updateIncidentState(incidentId, newState, resolutionData = {}) {
    try {
      const updateData = {
        state: newState,
        updated_at: new Date(),
      };

      if (newState === 'RESOLVED') {
        updateData.resolved_at = new Date();
        updateData.resolution_code = resolutionData.resolution_code;
        updateData.resolution_notes = resolutionData.resolution_notes;
        updateData.root_cause = resolutionData.root_cause;
      } else if (newState === 'CLOSED') {
        updateData.closed_at = new Date();
        if (!updateData.resolved_at) {
          updateData.resolved_at = new Date();
        }
      }

      const incident = await prisma.incident.update({
        where: { id: incidentId },
        data: updateData,
        include: {
          caller: true,
          assigned_to: true,
          asset: true,
          configuration_item: true,
        },
      });

      // Create work note for state change
      await this.createWorkNote({
        content: `Incident state changed to ${newState}`,
        incident_id: incidentId,
        is_internal: false,
      });

      // Trigger state change workflows
      await this.triggerWorkflow('incident_state_changed', incidentId, 'incidents');

      // Send notifications
      await this.sendIncidentNotifications(incident, 'state_changed');

      logger.info('Incident state updated', { incidentId, newState });
      return incident;
    } catch (error) {
      logger.error('Error updating incident state', { error: error.message, incidentId, newState });
      throw error;
    }
  }

  /**
   * Service Request Management
   */
  async createServiceRequest(requestData) {
    try {
      logger.info('Creating new service request', { requestData });

      const requestNumber = await this.generateServiceRequestNumber();
      const priority = this.calculatePriority(requestData.urgency, requestData.impact);

      const serviceRequest = await prisma.serviceRequest.create({
        data: {
          ...requestData,
          number: requestNumber,
          priority,
          state: 'NEW',
          opened_at: new Date(),
        },
        include: {
          requested_by: true,
          assigned_to: true,
          service_offering: true,
          asset: true,
          configuration_item: true,
        },
      });

      // Check if approval is required
      if (serviceRequest.service_offering?.requires_approval) {
        await this.initiateApprovalWorkflow(serviceRequest.id, 'service_requests');
      } else {
        // Auto-assign if no approval needed
        await this.autoAssignServiceRequest(serviceRequest.id);
      }

      // Calculate SLA due dates
      await this.calculateServiceRequestSLA(serviceRequest.id);

      // Trigger workflows
      await this.triggerWorkflow('service_request_created', serviceRequest.id, 'service_requests');

      logger.info('Service request created successfully', {
        serviceRequestId: serviceRequest.id,
        requestNumber,
      });
      return serviceRequest;
    } catch (error) {
      logger.error('Error creating service request', { error: error.message, requestData });
      throw error;
    }
  }

  /**
   * Change Management
   */
  async createChange(changeData) {
    try {
      logger.info('Creating new change request', { changeData });

      const changeNumber = await this.generateChangeNumber();

      const change = await prisma.change.create({
        data: {
          ...changeData,
          number: changeNumber,
          state: 'NEW',
          opened_at: new Date(),
        },
        include: {
          requested_by: true,
          assigned_to: true,
          configuration_items: true,
        },
      });

      // Assess change risk and determine approval requirements
      const riskAssessment = await this.assessChangeRisk(change.id);

      // Initiate appropriate approval workflow based on risk and type
      await this.initiateChangeApprovalWorkflow(change.id, riskAssessment);

      // Trigger workflows
      await this.triggerWorkflow('change_created', change.id, 'changes');

      logger.info('Change request created successfully', { changeId: change.id, changeNumber });
      return change;
    } catch (error) {
      logger.error('Error creating change request', { error: error.message, changeData });
      throw error;
    }
  }

  async getServiceOperationsDashboard(filters = {}) {
    try {
      const [incidentStats, serviceRequestStats, changeStats, problemStats, slaMetrics] =
        await Promise.all([
          this.getIncidentStatistics(filters),
          this.getServiceRequestStatistics(filters),
          this.getChangeStatistics(filters),
          this.getProblemStatistics(filters),
          this.getSLAMetrics(filters),
        ]);

      return {
        incidents: incidentStats,
        serviceRequests: serviceRequestStats,
        changes: changeStats,
        problems: problemStats,
        sla: slaMetrics,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error getting service operations dashboard', { error: error.message });
      throw error;
    }
  }

  // =============================================================================
  // SECURITY OPERATIONS CENTER (SOC)
  // SOAR capabilities with automated security response
  // =============================================================================

  /**
   * Security Incident Management
   */
  async createSecurityIncident(incidentData) {
    try {
      logger.info('Creating new security incident', { incidentData });

      const incidentNumber = await this.generateSecurityIncidentNumber();

      const securityIncident = await prisma.securityIncident.create({
        data: {
          ...incidentData,
          number: incidentNumber,
          state: 'NEW',
          detected_at: incidentData.detected_at || new Date(),
          opened_at: new Date(),
        },
        include: {
          assigned_to: true,
          configuration_items: true,
          vulnerabilities: true,
        },
      });

      // Auto-categorize based on indicators
      await this.autoCategorizeSecurityIncident(securityIncident.id);

      // Map to MITRE ATT&CK framework
      await this.mapToMITREFramework(securityIncident.id);

      // Find and execute relevant playbooks
      await this.executeSecurityPlaybooks(securityIncident.id);

      // Auto-assign to SOC team
      await this.autoAssignSecurityIncident(securityIncident.id);

      // Trigger security workflows
      await this.triggerWorkflow(
        'security_incident_created',
        securityIncident.id,
        'security_incidents',
      );

      // Send security alerts
      await this.sendSecurityAlerts(securityIncident);

      logger.info('Security incident created successfully', {
        securityIncidentId: securityIncident.id,
        incidentNumber,
      });
      return securityIncident;
    } catch (error) {
      logger.error('Error creating security incident', { error: error.message, incidentData });
      throw error;
    }
  }

  async executeSecurityPlaybook(playbookId, securityIncidentId, executedById) {
    try {
      logger.info('Executing security playbook', { playbookId, securityIncidentId });

      const playbook = await prisma.securityPlaybook.findUnique({
        where: { id: playbookId },
        include: { steps: { orderBy: { step_number: 'asc' } } },
      });

      if (!playbook) throw new Error('Playbook not found');

      // Create execution record
      const execution = await prisma.playbookExecution.create({
        data: {
          playbook_id: playbookId,
          security_incident_id: securityIncidentId,
          executed_by_id: executedById,
          status: 'RUNNING',
          started_at: new Date(),
        },
      });

      // Execute steps sequentially
      for (const step of playbook.steps) {
        let stepExecution;
        try {
          stepExecution = await prisma.playbookStepExecution.create({
            data: {
              execution_id: execution.id,
              step_number: step.step_number,
              status: 'RUNNING',
              started_at: new Date(),
            },
          });

          // Execute the step action
          const result = await this.executePlaybookStepAction(step, securityIncidentId);

          // Update step execution with result
          await prisma.playbookStepExecution.update({
            where: { id: stepExecution.id },
            data: {
              status: 'COMPLETED',
              completed_at: new Date(),
              result: result,
            },
          });
        } catch (stepError) {
          logger.error('Playbook step execution failed', {
            error: stepError.message,
            stepNumber: step.step_number,
          });

          if (stepExecution?.id) {
            await prisma.playbookStepExecution.update({
              where: { id: stepExecution.id },
              data: {
                status: 'FAILED',
                completed_at: new Date(),
                error_message: stepError.message,
              },
            });
          }

          // Stop execution on critical step failure
          if (!step.continue_on_failure) {
            throw stepError;
          }
        }
      }

      // Update execution status
      await prisma.playbookExecution.update({
        where: { id: execution.id },
        data: {
          status: 'COMPLETED',
          completed_at: new Date(),
        },
      });

      logger.info('Security playbook executed successfully', {
        playbookId,
        executionId: execution.id,
      });
      return execution;
    } catch (error) {
      logger.error('Error executing security playbook', { error: error.message, playbookId });
      throw error;
    }
  }

  /**
   * Vulnerability Management
   */
  async createVulnerability(vulnerabilityData) {
    try {
      logger.info('Creating new vulnerability', { vulnerabilityData });

      const vulnerabilityNumber = await this.generateVulnerabilityNumber();

      const vulnerability = await prisma.vulnerability.create({
        data: {
          ...vulnerabilityData,
          number: vulnerabilityNumber,
          state: 'NEW',
          discovered_at: vulnerabilityData.discovered_at || new Date(),
          opened_at: new Date(),
        },
        include: {
          assigned_to: true,
          configuration_items: true,
          security_incidents: true,
        },
      });

      // Calculate risk score and due date
      await this.calculateVulnerabilityRisk(vulnerability.id);

      // Auto-assign based on severity and affected systems
      await this.autoAssignVulnerability(vulnerability.id);

      // Check for available patches
      await this.checkPatchAvailability(vulnerability.id);

      // Trigger vulnerability workflows
      await this.triggerWorkflow('vulnerability_created', vulnerability.id, 'vulnerabilities');

      logger.info('Vulnerability created successfully', {
        vulnerabilityId: vulnerability.id,
        vulnerabilityNumber,
      });
      return vulnerability;
    } catch (error) {
      logger.error('Error creating vulnerability', { error: error.message, vulnerabilityData });
      throw error;
    }
  }

  async getSecurityOperationsDashboard(filters = {}) {
    try {
      const [
        securityIncidentStats,
        vulnerabilityStats,
        threatIntelligence,
        playbookMetrics,
        securityMetrics,
      ] = await Promise.all([
        this.getSecurityIncidentStatistics(filters),
        this.getVulnerabilityStatistics(filters),
        this.getThreatIntelligence(filters),
        this.getPlaybookMetrics(filters),
        this.getSecurityMetrics(filters),
      ]);

      return {
        securityIncidents: securityIncidentStats,
        vulnerabilities: vulnerabilityStats,
        threatIntelligence,
        playbooks: playbookMetrics,
        securityMetrics,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error getting security operations dashboard', { error: error.message });
      throw error;
    }
  }

  // =============================================================================
  // CONFIGURATION MANAGEMENT DATABASE (CMDB)
  // Enhanced CMDB with ITIL 4 compliance and relationship mapping
  // =============================================================================

  /**
   * Configuration Item Management
   */
  async createConfigurationItem(ciData) {
    try {
      logger.info('Creating new configuration item', { ciData });

      const ci = await prisma.configurationItem.create({
        data: {
          ...ciData,
          operational_status: ciData.operational_status || 'OPERATIONAL',
          lifecycle_stage: ciData.lifecycle_stage || 'OPERATIONAL',
          discovery_source: ciData.discovery_source || 'MANUAL',
          last_discovered: new Date(),
        },
        include: {
          business_owner: true,
          technical_owner: true,
          asset: true,
        },
      });

      // Auto-discover relationships if this is an automated discovery
      if (ciData.discovery_source === 'AUTOMATED') {
        await this.discoverCIRelationships(ci.id);
      }

      // Trigger CMDB workflows
      await this.triggerWorkflow('ci_created', ci.id, 'configuration_items');

      logger.info('Configuration item created successfully', { ciId: ci.id, ciName: ci.name });
      return ci;
    } catch (error) {
      logger.error('Error creating configuration item', { error: error.message, ciData });
      throw error;
    }
  }

  async createCIRelationship(upstreamCIId, downstreamCIId, relationshipType) {
    try {
      logger.info('Creating CI relationship', { upstreamCIId, downstreamCIId, relationshipType });

      const relationship = await prisma.cIRelationship.create({
        data: {
          upstream_ci_id: upstreamCIId,
          downstream_ci_id: downstreamCIId,
          relationship_type: relationshipType,
        },
        include: {
          upstream_ci: true,
          downstream_ci: true,
        },
      });

      // Update dependency maps
      await this.updateDependencyMaps(upstreamCIId, downstreamCIId);

      logger.info('CI relationship created successfully', { relationshipId: relationship.id });
      return relationship;
    } catch (error) {
      logger.error('Error creating CI relationship', { error: error.message });
      throw error;
    }
  }

  async getCIImpactAnalysis(ciId) {
    try {
      logger.info('Performing CI impact analysis', { ciId });

      const ci = await prisma.configurationItem.findUnique({
        where: { id: ciId },
        include: {
          upstream_cis: {
            include: { upstream_ci: true },
          },
          downstream_cis: {
            include: { downstream_ci: true },
          },
        },
      });

      if (!ci) throw new Error('Configuration item not found');

      // Get all dependent CIs (recursive)
      const dependentCIs = await this.getDependentCIs(ciId, []);

      // Get all supporting CIs (recursive)
      const supportingCIs = await this.getSupportingCIs(ciId, []);

      // Calculate business impact
      const businessImpact = await this.calculateBusinessImpact(ciId, dependentCIs);

      // Get related incidents and changes
      const [relatedIncidents, relatedChanges] = await Promise.all([
        prisma.incident.findMany({
          where: { configuration_item_id: ciId, state: { not: 'CLOSED' } },
          select: { id: true, number: true, state: true, priority: true },
        }),
        prisma.change.findMany({
          where: {
            configuration_items: { some: { id: ciId } },
            state: { notIn: ['CLOSED', 'CANCELLED'] },
          },
          select: { id: true, number: true, state: true, risk: true },
        }),
      ]);

      const impactAnalysis = {
        ci: {
          id: ci.id,
          name: ci.name,
          ci_class: ci.ci_class,
          operational_status: ci.operational_status,
        },
        dependentCIs: dependentCIs.map((depCI) => ({
          id: depCI.id,
          name: depCI.name,
          ci_class: depCI.ci_class,
          relationship_type: depCI.relationship_type,
        })),
        supportingCIs: supportingCIs.map((supCI) => ({
          id: supCI.id,
          name: supCI.name,
          ci_class: supCI.ci_class,
          relationship_type: supCI.relationship_type,
        })),
        businessImpact,
        relatedIncidents,
        relatedChanges,
        riskScore: this.calculateCIRiskScore(ci, dependentCIs, relatedIncidents, relatedChanges),
      };

      logger.info('CI impact analysis completed', { ciId, dependentCount: dependentCIs.length });
      return impactAnalysis;
    } catch (error) {
      logger.error('Error performing CI impact analysis', { error: error.message, ciId });
      throw error;
    }
  }

  // =============================================================================
  // EMPLOYEE CENTER & EXPERIENCE
  // Self-service portal with guided experiences
  // =============================================================================

  /**
   * Employee Profile Management
   */
  async createEmployeeProfile(profileData) {
    try {
      logger.info('Creating employee profile', { profileData });

      const profile = await prisma.employeeProfile.create({
        data: {
          ...profileData,
          preferred_language: profileData.preferred_language || 'en',
        },
        include: {
          user: true,
          manager: { include: { user: true } },
          direct_reports: { include: { user: true } },
        },
      });

      // Set up default notification preferences
      await this.setupDefaultNotificationPreferences(profile.id);

      // Trigger employee onboarding workflows
      if (profileData.hire_date) {
        await this.triggerWorkflow('employee_onboarding', profile.id, 'employee_profiles');
      }

      logger.info('Employee profile created successfully', { profileId: profile.id });
      return profile;
    } catch (error) {
      logger.error('Error creating employee profile', { error: error.message, profileData });
      throw error;
    }
  }

  /**
   * Service Catalog Management
   */
  async createServiceOffering(offeringData) {
    try {
      logger.info('Creating service offering', { offeringData });

      const offering = await prisma.serviceOffering.create({
        data: {
          ...offeringData,
          is_active: offeringData.is_active !== undefined ? offeringData.is_active : true,
          available_for: offeringData.available_for || ['ALL'],
        },
        include: {
          form_fields: { orderBy: { order_index: 'asc' } },
          created_by: true,
        },
      });

      // Create default form fields if none provided
      if (!offeringData.form_fields || offeringData.form_fields.length === 0) {
        await this.createDefaultFormFields(offering.id);
      }

      logger.info('Service offering created successfully', { offeringId: offering.id });
      return offering;
    } catch (error) {
      logger.error('Error creating service offering', { error: error.message, offeringData });
      throw error;
    }
  }

  async getEmployeeCenterDashboard(userId) {
    try {
      const employee = await prisma.employeeProfile.findUnique({
        where: { user_id: userId },
        include: { user: true, manager: { include: { user: true } } },
      });

      if (!employee) throw new Error('Employee profile not found');

      const [
        myRequests,
        myIncidents,
        availableServices,
        upcomingEvents,
        myAppointments,
        announcements,
      ] = await Promise.all([
        // My service requests
        prisma.serviceRequest.findMany({
          where: { requested_by_id: userId, state: { not: 'CLOSED' } },
          orderBy: { created_at: 'desc' },
          take: 10,
          include: { service_offering: true },
        }),

        // My incidents
        prisma.incident.findMany({
          where: { caller_id: userId, state: { not: 'CLOSED' } },
          orderBy: { created_at: 'desc' },
          take: 10,
        }),

        // Available services
        this.getAvailableServicesForEmployee(employee),

        // Upcoming events
        prisma.companyEvent.findMany({
          where: {
            start_date: { gte: new Date() },
            OR: [
              { is_public: true },
              { target_audience: { hasSome: [employee.department, employee.job_title, 'ALL'] } },
            ],
          },
          orderBy: { start_date: 'asc' },
          take: 5,
        }),

        // My appointments
        prisma.appointment.findMany({
          where: {
            OR: [{ requester_id: userId }, { provider_id: userId }],
            start_time: { gte: new Date() },
          },
          orderBy: { start_time: 'asc' },
          take: 5,
          include: {
            requester: true,
            provider: true,
          },
        }),

        // Company announcements
        this.getAnnouncementsForEmployee(employee),
      ]);

      return {
        employee: {
          id: employee.id,
          name: `${employee.user.first_name} ${employee.user.last_name}`,
          job_title: employee.job_title,
          department: employee.department,
          manager: employee.manager
            ? `${employee.manager.user.first_name} ${employee.manager.user.last_name}`
            : null,
        },
        myRequests,
        myIncidents,
        availableServices,
        upcomingEvents,
        myAppointments,
        announcements,
        quickActions: this.getQuickActionsForEmployee(employee),
      };
    } catch (error) {
      logger.error('Error getting employee center dashboard', { error: error.message, userId });
      throw error;
    }
  }

  // =============================================================================
  // WORKFLOW AUTOMATION & ORCHESTRATION
  // Data fabric for enterprise workflow automation
  // =============================================================================

  /**
   * Workflow Engine
   */
  async triggerWorkflow(triggerType, recordId, recordTable, triggerData = {}) {
    try {
      logger.info('Triggering workflow', { triggerType, recordId, recordTable });

      // Find applicable workflows
      const workflows = await prisma.workflowDefinition.findMany({
        where: {
          is_active: true,
          trigger_type: this.mapTriggerTypeToEnum(triggerType),
        },
        include: {
          steps: { orderBy: { step_number: 'asc' } },
        },
      });

      const applicableWorkflows = workflows.filter((workflow) =>
        this.evaluateTriggerConditions(
          workflow.trigger_conditions,
          recordId,
          recordTable,
          triggerData,
        ),
      );

      // Execute applicable workflows
      const executions = [];
      for (const workflow of applicableWorkflows) {
        try {
          const execution = await this.executeWorkflow(
            workflow.id,
            recordId,
            recordTable,
            triggerData,
          );
          executions.push(execution);
        } catch (error) {
          logger.error('Workflow execution failed', {
            error: error.message,
            workflowId: workflow.id,
            recordId,
          });
        }
      }

      logger.info('Workflows triggered', {
        triggerType,
        recordId,
        executedCount: executions.length,
      });
      return executions;
    } catch (error) {
      logger.error('Error triggering workflow', { error: error.message, triggerType, recordId });
      throw error;
    }
  }

  async executeWorkflow(workflowId, recordId, recordTable, contextData = {}) {
    let execution;
    try {
      logger.info('Executing workflow', { workflowId, recordId, recordTable });

      const workflow = await prisma.workflowDefinition.findUnique({
        where: { id: workflowId },
        include: { steps: { orderBy: { step_number: 'asc' } } },
      });

      if (!workflow) throw new Error('Workflow not found');

      // Create execution record
      execution = await prisma.workflowExecution.create({
        data: {
          workflow_id: workflowId,
          trigger_record_id: recordId,
          trigger_table: recordTable,
          status: 'RUNNING',
          execution_context: contextData,
        },
      });

      // Execute steps sequentially
      for (const step of workflow.steps) {
        let stepExecution;
        try {
          stepExecution = await prisma.workflowStepExecution.create({
            data: {
              execution_id: execution.id,
              step_number: step.step_number,
              status: 'RUNNING',
              started_at: new Date(),
            },
          });

          // Execute the step
          const result = await this.executeWorkflowStep(step, recordId, recordTable, contextData);

          // Update step execution
          await prisma.workflowStepExecution.update({
            where: { id: stepExecution.id },
            data: {
              status: 'COMPLETED',
              completed_at: new Date(),
              result_data: result,
            },
          });

          // Update context with step results
          contextData = { ...contextData, ...result };
        } catch (stepError) {
          logger.error('Workflow step execution failed', {
            error: stepError.message,
            stepNumber: step.step_number,
          });

          if (stepExecution?.id) {
            await prisma.workflowStepExecution.update({
              where: { id: stepExecution.id },
              data: {
                status: 'FAILED',
                completed_at: new Date(),
                error_message: stepError.message,
              },
            });
          }

          // Stop execution on step failure (unless configured to continue)
          if (!step.continue_on_failure) {
            throw stepError;
          }
        }
      }

      // Update execution status
      await prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'COMPLETED',
          completed_at: new Date(),
          execution_context: contextData,
        },
      });

      logger.info('Workflow executed successfully', { workflowId, executionId: execution.id });
      return execution;
    } catch (error) {
      logger.error('Error executing workflow', { error: error.message, workflowId });

      // Update execution with error status
      if (execution?.id) {
        await prisma.workflowExecution.update({
          where: { id: execution.id },
          data: {
            status: 'FAILED',
            completed_at: new Date(),
            error_message: error.message,
          },
        });
      }

      throw error;
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // Helper methods for enterprise platform operations
  // =============================================================================

  async generateAssetTag(categoryId) {
    const category = await prisma.assetCategory.findUnique({
      where: { id: categoryId },
      select: { code: true },
    });

    const count = await prisma.asset.count({
      where: { category_id: categoryId },
    });

    return `${category.code}-${String(count + 1).padStart(6, '0')}`;
  }

  async generateIncidentNumber() {
    const count = await prisma.incident.count();
    return `INC${String(count + 1).padStart(7, '0')}`;
  }

  async generateServiceRequestNumber() {
    const count = await prisma.serviceRequest.count();
    return `REQ${String(count + 1).padStart(7, '0')}`;
  }

  async generateChangeNumber() {
    const count = await prisma.change.count();
    return `CHG${String(count + 1).padStart(7, '0')}`;
  }

  async generateSecurityIncidentNumber() {
    const count = await prisma.securityIncident.count();
    return `SEC${String(count + 1).padStart(7, '0')}`;
  }

  async generateVulnerabilityNumber() {
    const count = await prisma.vulnerability.count();
    return `VUL${String(count + 1).padStart(7, '0')}`;
  }

  calculatePriority(urgency, impact) {
    const priorityMatrix = {
      'HIGH-HIGH': 'CRITICAL',
      'HIGH-MEDIUM': 'HIGH',
      'HIGH-LOW': 'MEDIUM',
      'MEDIUM-HIGH': 'HIGH',
      'MEDIUM-MEDIUM': 'MEDIUM',
      'MEDIUM-LOW': 'LOW',
      'LOW-HIGH': 'MEDIUM',
      'LOW-MEDIUM': 'LOW',
      'LOW-LOW': 'LOW',
    };

    return priorityMatrix[`${urgency}-${impact}`] || 'MEDIUM';
  }

  isITAsset(categoryCode) {
    const itCategories = ['COMP', 'SERV', 'NET', 'SEC', 'MOB', 'PRINT'];
    return itCategories.includes(categoryCode);
  }

  mapAssetLifecycleToCI(assetLifecycle) {
    const mapping = {
      PLANNING: 'PLANNING',
      PROCUREMENT: 'DEVELOPMENT',
      DEPLOYMENT: 'TESTING',
      OPERATIONAL: 'OPERATIONAL',
      MAINTENANCE: 'OPERATIONAL',
      DISPOSAL: 'RETIRING',
    };
    return mapping[assetLifecycle] || 'OPERATIONAL';
  }

  async createWorkNote(noteData) {
    return await prisma.workNote.create({
      data: {
        ...noteData,
        created_by_id: noteData.created_by_id || 'system',
      },
    });
  }

  // Additional utility methods would be implemented here...
  // Including SLA calculations, auto-assignment logic, notification services, etc.
}

module.exports = NovaEnterprisePlatform;
export default NovaEnterprisePlatform;
