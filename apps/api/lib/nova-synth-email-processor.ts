/**
 * Nova Synth Email Processor
 *
 * Integrates Nova Synth AI capabilities with email-to-ticket processing to provide
 * intelligent ticket creation with enhanced data extraction and classification.
 *
 * Features:
 * - AI-powered customer identification and matching
 * - Intelligent priority and urgency assessment
 * - System/service identification from email content
 * - Automated incident categorization and classification
 * - Smart queue/team assignment recommendations
 * - Enhanced metadata extraction with business context
 * - Integration with Nova knowledge base for context-aware processing
 */

import { EventEmitter } from 'events';
import { logger } from '../logger.js';
import { novaSynthRAG } from './nova-synth-rag-integration.js';
import { ragEngine } from './rag-engine.js';
import { novaMLPipeline } from './nova-ml-pipeline.js';
import crypto from 'crypto';

// Email Processing Types
export interface EmailTicketAnalysis {
  id: string;
  emailId: string;
  analysis: {
    customer: {
      identified: boolean;
      confidence: number;
      userId?: string;
      customerInfo?: {
        name: string;
        email: string;
        organization?: string;
        department?: string;
        vipStatus?: boolean;
        previousTickets?: number;
        preferredLanguage?: string;
      };
      reasoning: string;
    };
    incident: {
      category: string;
      subcategory?: string;
      type: 'incident' | 'service_request' | 'change_request' | 'problem';
      confidence: number;
      affectedSystems: string[];
      impactAssessment: {
        scope: 'individual' | 'team' | 'department' | 'organization' | 'global';
        severity: 'low' | 'medium' | 'high' | 'critical';
        businessImpact: string;
        usersAffected?: number;
      };
      reasoning: string;
    };
    priority: {
      level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      confidence: number;
      factors: string[];
      reasoning: string;
      escalationNeeded: boolean;
    };
    assignment: {
      recommendedQueue?: string;
      recommendedTeam?: string;
      recommendedAgent?: string;
      specialistRequired: boolean;
      skillsRequired: string[];
      confidence: number;
      reasoning: string;
    };
    content: {
      cleanedDescription: string;
      extractedKeywords: string[];
      sentimentAnalysis: {
        sentiment: 'positive' | 'neutral' | 'negative' | 'frustrated' | 'urgent';
        confidence: number;
        emotionalIndicators: string[];
      };
      technicalDetails: {
        errorMessages: string[];
        systemLogs: string[];
        environmentInfo: Record<string, any>;
        reproductionSteps: string[];
      };
      businessContext: {
        affectedProcesses: string[];
        timeConstraints: string[];
        compliance?: string[];
        slaRequirements?: string;
      };
    };
    automation: {
      knowledgeArticles: string[];
      suggestedSolutions: string[];
      automatedActions: string[];
      selfServiceOptions: string[];
      escalationTriggers: string[];
    };
  };
  recommendations: {
    ticketData: {
      title: string;
      description: string;
      type: string;
      priority: string;
      urgency: string;
      category: string;
      subcategory?: string;
      tags: string[];
      customFields: Record<string, any>;
    };
    assignment: {
      queueId?: string;
      teamId?: string;
      agentId?: string;
    };
    communications: {
      autoReplyNeeded: boolean;
      templateRecommendation?: string;
      additionalRecipients: string[];
      escalationNotifications: string[];
    };
    sla: {
      responseTime: string;
      resolutionTime: string;
      businessJustification: string;
    };
  };
  metadata: {
    processingTime: number;
    aiConfidence: number;
    modelsUsed: string[];
    timestamp: Date;
    version: string;
  };
}

export interface EmailProcessingContext {
  emailAccount: any;
  organizationContext?: {
    name?: string;
    industry?: string;
    size?: string;
    customFields?: Record<string, any>;
  };
  historicalContext?: {
    senderPreviousTickets: any[];
    recentSimilarIncidents: any[];
    organizationalPatterns: any;
  };
  systemContext?: {
    knownSystems: string[];
    commonIssues: any[];
    maintenanceSchedule: any[];
    serviceStatus: Record<string, any>;
  };
}

/**
 * Nova Synth Email Processor System
 */
export class NovaSynthEmailProcessor extends EventEmitter {
  private isInitialized = false;
  private processingCache: Map<string, EmailTicketAnalysis> = new Map();
  private customerCache: Map<string, any> = new Map();
  private systemKnowledge: Map<string, any> = new Map();

  // Configuration
  private config = {
    enableCustomerEnrichment: true,
    enableSystemDetection: true,
    enableSentimentAnalysis: true,
    enableAutomatedActions: true,
    confidenceThreshold: 0.7,
    cacheExpiry: 60 * 60 * 1000, // 1 hour
    maxProcessingTime: 30000, // 30 seconds
    enableLearning: true,
    fallbackToBasicProcessing: true,
  };

  constructor() {
    super();
  }

  /**
   * Initialize the Nova Synth Email Processor
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Nova Synth Email Processor...');

      // Wait for dependencies
      if (!novaSynthRAG.isInitialized) {
        await novaSynthRAG.initialize();
      }

      if (!ragEngine.isInitialized) {
        await ragEngine.initialize();
      }

      // Load system knowledge
      await this.loadSystemKnowledge();

      // Initialize customer enrichment data
      await this.initializeCustomerEnrichment();

      this.isInitialized = true;
      this.emit('initialized');

      logger.info('Nova Synth Email Processor initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Nova Synth Email Processor:', error);
      throw error;
    }
  }

  /**
   * Process email with Nova Synth intelligence for ticket creation
   */
  async processEmailForTicket(
    email: any,
    emailAccount: any,
    context?: EmailProcessingContext
  ): Promise<EmailTicketAnalysis> {
    if (!this.isInitialized) {
      throw new Error('Nova Synth Email Processor not initialized');
    }

    const startTime = Date.now();
    const emailId = email.internetMessageId || email.messageId || email.id || crypto.randomUUID();

    try {
      logger.info(`Processing email ${emailId} with Nova Synth intelligence`);

      // Check cache first
      const cached = this.processingCache.get(emailId);
      if (cached && Date.now() - cached.metadata.timestamp.getTime() < this.config.cacheExpiry) {
        logger.debug(`Using cached analysis for email ${emailId}`);
        return cached;
      }

      // Extract and clean email content
      const emailContent = this.extractEmailContent(email);
      
      // Parallel processing for different analysis types
      const [
        customerAnalysis,
        incidentAnalysis,
        priorityAnalysis,
        contentAnalysis,
        automationAnalysis
      ] = await Promise.all([
        this.analyzeCustomer(email, emailAccount, context),
        this.analyzeIncident(emailContent, context),
        this.analyzePriority(emailContent, context),
        this.analyzeContent(emailContent, context),
        this.analyzeAutomation(emailContent, context)
      ]);

      // Generate assignment recommendations
      const assignmentAnalysis = await this.analyzeAssignment(
        incidentAnalysis,
        customerAnalysis,
        context
      );

      // Build comprehensive analysis
      const analysis: EmailTicketAnalysis = {
        id: crypto.randomUUID(),
        emailId,
        analysis: {
          customer: customerAnalysis,
          incident: incidentAnalysis,
          priority: priorityAnalysis,
          assignment: assignmentAnalysis,
          content: contentAnalysis,
          automation: automationAnalysis,
        },
        recommendations: await this.generateRecommendations(
          customerAnalysis,
          incidentAnalysis,
          priorityAnalysis,
          assignmentAnalysis,
          contentAnalysis,
          emailContent
        ),
        metadata: {
          processingTime: Date.now() - startTime,
          aiConfidence: this.calculateOverallConfidence([
            customerAnalysis.confidence,
            incidentAnalysis.confidence,
            priorityAnalysis.confidence,
            assignmentAnalysis.confidence
          ]),
          modelsUsed: ['nova-synth-rag', 'nova-ml-pipeline'],
          timestamp: new Date(),
          version: '1.0.0',
        },
      };

      // Cache the result
      this.processingCache.set(emailId, analysis);

      // Emit events for monitoring and learning
      this.emit('emailProcessed', { email, analysis });

      if (this.config.enableLearning) {
        this.emit('learningEvent', {
          type: 'email_processing',
          emailId,
          analysis,
          processingTime: analysis.metadata.processingTime,
        });
      }

      logger.info(
        `Email ${emailId} processed successfully in ${analysis.metadata.processingTime}ms ` +
        `with confidence ${analysis.metadata.aiConfidence.toFixed(2)}`
      );

      return analysis;

    } catch (error) {
      logger.error(`Error processing email ${emailId} with Nova Synth:`, error);
      
      if (this.config.fallbackToBasicProcessing) {
        logger.info(`Falling back to basic processing for email ${emailId}`);
        return this.fallbackBasicProcessing(email, emailAccount);
      }
      
      throw error;
    }
  }

  /**
   * Analyze customer information using Nova Synth and RAG
   */
  private async analyzeCustomer(
    email: any,
    emailAccount: any,
    context?: EmailProcessingContext
  ): Promise<EmailTicketAnalysis['analysis']['customer']> {
    try {
      const senderEmail = this.extractSenderEmail(email);
      const senderName = this.extractSenderName(email);
      
      // Check customer cache
      const cacheKey = `customer_${senderEmail}`;
      const cached = this.customerCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.config.cacheExpiry) {
        return cached.analysis;
      }

      // Query RAG for customer information
      const customerQuery = `Find customer information for ${senderEmail} ${senderName || ''}`;
      
      const synthQuery = {
        id: crypto.randomUUID(),
        query: customerQuery,
        context: {
          userId: 'system',
          tenantId: emailAccount.tenantId || 'default',
          module: 'email_processing',
          intent: 'customer_lookup',
          requestType: 'information' as const,
        },
        personalityConfig: {
          profile: 'technical-expert' as const,
          traits: {
            tone: 'professional' as const,
            responseStyle: 'detailed' as const,
            communicationPreferences: {
              provideContext: true,
              offerAlternatives: false,
              proactiveFollowUp: false,
              includeReferences: true,
              adaptToUserLevel: false,
            },
          },
        },
        options: {
          includeRAGContext: true,
          maxContextChunks: 5,
          generateResponse: false,
          includeRecommendations: false,
          trackConversation: false,
          enableLearning: false,
        },
      };

      const ragResponse = await novaSynthRAG.processSynthQuery(synthQuery);
      
      // Analyze RAG results for customer information
      const customerInfo = this.extractCustomerInfoFromRAG(ragResponse, senderEmail, senderName);
      
      // Enrich with organizational context if available
      if (context?.organizationContext) {
        customerInfo.customerInfo = {
          ...customerInfo.customerInfo,
          organization: context.organizationContext.name,
        };
      }

      // Cache the result
      const analysis = {
        identified: customerInfo.confidence > this.config.confidenceThreshold,
        confidence: customerInfo.confidence,
        userId: customerInfo.userId,
        customerInfo: customerInfo.customerInfo,
        reasoning: customerInfo.reasoning,
      };

      this.customerCache.set(cacheKey, {
        analysis,
        timestamp: Date.now(),
      });

      return analysis;

    } catch (error) {
      logger.error('Error analyzing customer:', error);
      return {
        identified: false,
        confidence: 0,
        reasoning: `Error during customer analysis: ${error.message}`,
      };
    }
  }

  /**
   * Analyze incident type and categorization using Nova Synth
   */
  private async analyzeIncident(
    emailContent: any,
    context?: EmailProcessingContext
  ): Promise<EmailTicketAnalysis['analysis']['incident']> {
    try {
      // Prepare incident classification query
      const incidentQuery = `
        Analyze this IT support request and classify the incident:
        
        Subject: ${emailContent.subject}
        Description: ${emailContent.body}
        
        Identify:
        1. Incident category and type
        2. Affected systems or services
        3. Business impact and scope
        4. Technical details and error patterns
      `;

      const synthQuery = {
        id: crypto.randomUUID(),
        query: incidentQuery,
        context: {
          userId: 'system',
          tenantId: 'default',
          module: 'incident_classification',
          intent: 'classification',
          requestType: 'analysis' as const,
        },
        personalityConfig: {
          profile: 'technical-expert' as const,
          traits: {
            tone: 'professional' as const,
            responseStyle: 'detailed' as const,
            communicationPreferences: {
              provideContext: true,
              offerAlternatives: true,
              proactiveFollowUp: false,
              includeReferences: true,
              adaptToUserLevel: false,
            },
          },
        },
        options: {
          includeRAGContext: true,
          maxContextChunks: 10,
          generateResponse: true,
          includeRecommendations: true,
          trackConversation: false,
          enableLearning: false,
        },
      };

      const ragResponse = await novaSynthRAG.processSynthQuery(synthQuery);

      // Use ML Pipeline for classification if available
      let mlClassification = null;
      try {
        const experiments = novaMLPipeline.listExperiments();
        const classifier = experiments.find(exp => 
          exp.modelName.includes('itsm') || exp.modelName.includes('incident')
        );

        if (classifier) {
          mlClassification = await novaMLPipeline.predictWithCosmoPersonality(
            classifier.id,
            emailContent.subject + ' ' + emailContent.body,
            { context: 'incident_classification' }
          );
        }
      } catch (error) {
        logger.warn('ML classification failed:', error.message);
      }

      // Extract incident information from responses
      const incidentInfo = this.extractIncidentInfoFromRAG(ragResponse, mlClassification, emailContent);
      
      // Enhance with system context
      if (context?.systemContext) {
        incidentInfo.affectedSystems = this.matchAffectedSystems(
          emailContent,
          context.systemContext.knownSystems
        );
      }

      return incidentInfo;

    } catch (error) {
      logger.error('Error analyzing incident:', error);
      return this.fallbackIncidentAnalysis(emailContent);
    }
  }

  /**
   * Analyze priority and urgency using AI
   */
  private async analyzePriority(
    emailContent: any,
    context?: EmailProcessingContext
  ): Promise<EmailTicketAnalysis['analysis']['priority']> {
    try {
      // Build contextual information for priority analysis
      let contextualInfo = '';
      if (context) {
        if (context.organizationContext) {
          contextualInfo += `\nOrganization: ${context.organizationContext.name || 'Unknown'} (${context.organizationContext.industry || 'N/A'})`;
          contextualInfo += `\nOrganization size: ${context.organizationContext.size || 'Unknown'}`;
        }
        
        if (context.historicalContext?.senderPreviousTickets?.length > 0) {
          contextualInfo += `\nSender history: ${context.historicalContext.senderPreviousTickets.length} previous tickets`;
        }
        
        if (context.systemContext?.serviceStatus) {
          const criticalServices = Object.entries(context.systemContext.serviceStatus)
            .filter(([_, status]) => status === 'critical' || status === 'down')
            .map(([service, _]) => service);
          if (criticalServices.length > 0) {
            contextualInfo += `\nCritical/Down services: ${criticalServices.join(', ')}`;
          }
        }
      }

      const priorityQuery = `
        Analyze the priority and urgency of this IT support request:
        
        Subject: ${emailContent.subject}
        Description: ${emailContent.body}
        ${contextualInfo}
        
        Consider:
        1. Language indicators (urgent, critical, emergency, asap)
        2. Business impact described
        3. Number of users affected
        4. Time sensitivity
        5. Escalation requirements
        6. Organization context and service status
        7. Sender's historical escalation patterns
      `;

      const synthQuery = {
        id: crypto.randomUUID(),
        query: priorityQuery,
        context: {
          userId: 'system',
          tenantId: 'default',
          module: 'priority_assessment',
          intent: 'assessment',
          requestType: 'analysis' as const,
        },
        personalityConfig: {
          profile: 'crisis-management' as const,
          traits: {
            tone: 'solution-focused' as const,
            responseStyle: 'step-by-step' as const,
            communicationPreferences: {
              provideContext: true,
              offerAlternatives: false,
              proactiveFollowUp: true,
              includeReferences: true,
              adaptToUserLevel: true,
            },
          },
        },
        options: {
          includeRAGContext: true,
          maxContextChunks: 5,
          generateResponse: true,
          includeRecommendations: false,
          trackConversation: false,
          enableLearning: false,
        },
      };

      const ragResponse = await novaSynthRAG.processSynthQuery(synthQuery);
      return this.extractPriorityInfoFromRAG(ragResponse, emailContent);

    } catch (error) {
      logger.error('Error analyzing priority:', error);
      return this.fallbackPriorityAnalysis(emailContent);
    }
  }

  /**
   * Analyze content for enhanced metadata extraction
   */
  private async analyzeContent(
    emailContent: any,
    context?: EmailProcessingContext
  ): Promise<EmailTicketAnalysis['analysis']['content']> {
    try {
      // Extract technical details using pattern matching and AI
      const technicalDetails = this.extractTechnicalDetails(emailContent.body);
      
      // Sentiment analysis
      const sentimentAnalysis = await this.analyzeSentiment(emailContent);
      
      // Enhanced keyword extraction with organizational context
      let keywordQuery = `Extract key technical terms and concepts from: ${emailContent.subject} ${emailContent.body}`;
      
      // Enrich query with organizational context when available
      if (context) {
        const organizationInfo = context.organizationContext?.name ? 
          ` Organization: ${context.organizationContext.name}` : '';
        const industryInfo = context.organizationContext?.industry ? 
          ` Industry: ${context.organizationContext.industry}` : '';
        const systemsInfo = context.systemContext?.knownSystems?.length ? 
          ` Known systems: ${context.systemContext.knownSystems.join(', ')}` : '';
        const historyInfo = context.historicalContext?.senderPreviousTickets?.length ? 
          ` Previous tickets: ${context.historicalContext.senderPreviousTickets.length} tickets` : '';
        
        keywordQuery += `${organizationInfo}${industryInfo}${systemsInfo}${historyInfo}`;
      }
      
      const synthQuery = {
        id: crypto.randomUUID(),
        query: keywordQuery,
        context: {
          userId: 'system',
          tenantId: context?.organizationContext?.name || 'default',
          module: 'content_analysis',
          intent: 'extraction',
          requestType: 'information' as const,
        },
        personalityConfig: {
          profile: 'technical-expert' as const,
          traits: {
            tone: 'professional' as const,
            responseStyle: 'concise' as const,
            communicationPreferences: {
              provideContext: false,
              offerAlternatives: false,
              proactiveFollowUp: false,
              includeReferences: false,
              adaptToUserLevel: false,
            },
          },
        },
        options: {
          includeRAGContext: true,
          maxContextChunks: 3,
          generateResponse: true,
          includeRecommendations: false,
          trackConversation: false,
          enableLearning: false,
        },
      };

      const ragResponse = await novaSynthRAG.processSynthQuery(synthQuery);
      const extractedKeywords = this.extractKeywordsFromRAG(ragResponse, emailContent);

      return {
        cleanedDescription: this.cleanEmailContent(emailContent.body),
        extractedKeywords,
        sentimentAnalysis,
        technicalDetails,
        businessContext: this.extractBusinessContext(emailContent),
      };

    } catch (error) {
      logger.error('Error analyzing content:', error);
      return this.fallbackContentAnalysis(emailContent);
    }
  }

  /**
   * Analyze automation opportunities
   */
  private async analyzeAutomation(
    emailContent: any,
    context?: EmailProcessingContext
  ): Promise<EmailTicketAnalysis['analysis']['automation']> {
    try {
      // Enhanced automation query with organizational context
      let automationQuery = `
        Identify automation opportunities for this IT support request:
        
        Subject: ${emailContent.subject}
        Description: ${emailContent.body}
        
        Find:
        1. Relevant knowledge base articles
        2. Potential automated solutions
        3. Self-service options
        4. Similar resolved incidents
      `;

      // Add contextual information for better automation analysis
      if (context) {
        if (context.organizationContext) {
          automationQuery += `\n\nOrganization Context:`;
          if (context.organizationContext.name) {
            automationQuery += `\n- Organization: ${context.organizationContext.name}`;
          }
          if (context.organizationContext.industry) {
            automationQuery += `\n- Industry: ${context.organizationContext.industry}`;
          }
          if (context.organizationContext.size) {
            automationQuery += `\n- Organization Size: ${context.organizationContext.size}`;
          }
        }

        if (context.systemContext?.knownSystems?.length) {
          automationQuery += `\n\nKnown Systems: ${context.systemContext.knownSystems.join(', ')}`;
        }

        if (context.systemContext?.commonIssues?.length) {
          automationQuery += `\n\nCommon Issues: ${context.systemContext.commonIssues.map((issue: any) => issue.description || issue).join(', ')}`;
        }

        if (context.historicalContext?.recentSimilarIncidents?.length) {
          automationQuery += `\n\nRecent Similar Incidents: ${context.historicalContext.recentSimilarIncidents.length} found`;
        }
      }

      const synthQuery = {
        id: crypto.randomUUID(),
        query: automationQuery,
        context: {
          userId: 'system',
          tenantId: context?.organizationContext?.name || 'default',
          module: 'automation_analysis',
          intent: 'automation',
          requestType: 'guidance' as const,
        },
        personalityConfig: {
          profile: 'default' as const,
          traits: {
            tone: 'solution-focused' as const,
            responseStyle: 'detailed' as const,
            communicationPreferences: {
              provideContext: true,
              offerAlternatives: true,
              proactiveFollowUp: true,
              includeReferences: true,
              adaptToUserLevel: true,
            },
          },
        },
        options: {
          includeRAGContext: true,
          maxContextChunks: 15,
          generateResponse: true,
          includeRecommendations: true,
          trackConversation: false,
          enableLearning: false,
        },
      };

      const ragResponse = await novaSynthRAG.processSynthQuery(synthQuery);
      return this.extractAutomationInfoFromRAG(ragResponse);

    } catch (error) {
      logger.error('Error analyzing automation:', error);
      return {
        knowledgeArticles: [],
        suggestedSolutions: [],
        automatedActions: [],
        selfServiceOptions: [],
        escalationTriggers: [],
      };
    }
  }

  /**
   * Analyze assignment recommendations
   */
  private async analyzeAssignment(
    incidentAnalysis: any,
    customerAnalysis: any,
    context?: EmailProcessingContext
  ): Promise<EmailTicketAnalysis['analysis']['assignment']> {
    try {
      // Enhanced assignment query with organizational context
      let assignmentQuery = `
        Recommend assignment for this incident:
        
        Category: ${incidentAnalysis.category}
        Type: ${incidentAnalysis.type}
        Systems: ${incidentAnalysis.affectedSystems.join(', ')}
        Customer: ${customerAnalysis.customerInfo?.organization || 'Unknown'}
        
        Consider skills required and team expertise.
      `;

      // Add contextual information for better assignment analysis
      if (context) {
        if (context.organizationContext) {
          assignmentQuery += `\n\nOrganization Context:`;
          if (context.organizationContext.name) {
            assignmentQuery += `\n- Organization: ${context.organizationContext.name}`;
          }
          if (context.organizationContext.industry) {
            assignmentQuery += `\n- Industry: ${context.organizationContext.industry}`;
          }
          if (context.organizationContext.size) {
            assignmentQuery += `\n- Size: ${context.organizationContext.size}`;
          }
        }

        if (context.historicalContext?.senderPreviousTickets?.length) {
          assignmentQuery += `\n\nSender History: ${context.historicalContext.senderPreviousTickets.length} previous tickets`;
        }

        if (context.systemContext?.serviceStatus) {
          const activeServices = Object.entries(context.systemContext.serviceStatus)
            .filter(([_key, status]) => status === 'active' || status === 'operational')
            .map(([service, _status]) => service);
          if (activeServices.length > 0) {
            assignmentQuery += `\n\nActive Services: ${activeServices.join(', ')}`;
          }
        }

        if (context.systemContext?.maintenanceSchedule?.length) {
          assignmentQuery += `\n\nMaintenance Activities: ${context.systemContext.maintenanceSchedule.length} scheduled`;
        }
      }

      const synthQuery = {
        id: crypto.randomUUID(),
        query: assignmentQuery,
        context: {
          userId: 'system',
          tenantId: context?.organizationContext?.name || 'default',
          module: 'assignment_analysis',
          intent: 'assignment',
          requestType: 'guidance' as const,
        },
        personalityConfig: {
          profile: 'technical-expert' as const,
          traits: {
            tone: 'professional' as const,
            responseStyle: 'concise' as const,
            communicationPreferences: {
              provideContext: true,
              offerAlternatives: true,
              proactiveFollowUp: false,
              includeReferences: false,
              adaptToUserLevel: false,
            },
          },
        },
        options: {
          includeRAGContext: true,
          maxContextChunks: 5,
          generateResponse: true,
          includeRecommendations: false,
          trackConversation: false,
          enableLearning: false,
        },
      };

      const ragResponse = await novaSynthRAG.processSynthQuery(synthQuery);
      return this.extractAssignmentInfoFromRAG(ragResponse, incidentAnalysis);

    } catch (error) {
      logger.error('Error analyzing assignment:', error);
      return {
        specialistRequired: false,
        skillsRequired: [],
        confidence: 0.5,
        reasoning: 'Assignment analysis failed, using default assignment',
      };
    }
  }

  /**
   * Generate comprehensive recommendations
   */
  private async generateRecommendations(
    customerAnalysis: any,
    incidentAnalysis: any,
    priorityAnalysis: any,
    assignmentAnalysis: any,
    contentAnalysis: any,
    emailContent: any
  ): Promise<EmailTicketAnalysis['recommendations']> {
    return {
      ticketData: {
        title: this.generateEnhancedTitle(emailContent.subject, incidentAnalysis),
        description: this.generateEnhancedDescription(emailContent.body, contentAnalysis),
        type: this.mapIncidentTypeToTicketType(incidentAnalysis.type),
        priority: priorityAnalysis.level,
        urgency: priorityAnalysis.urgency,
        category: incidentAnalysis.category,
        subcategory: incidentAnalysis.subcategory,
        tags: this.generateEnhancedTags(incidentAnalysis, contentAnalysis),
        customFields: this.generateCustomFields(
          customerAnalysis,
          incidentAnalysis,
          priorityAnalysis,
          contentAnalysis
        ),
      },
      assignment: {
        queueId: assignmentAnalysis.recommendedQueue,
        teamId: assignmentAnalysis.recommendedTeam,
        agentId: assignmentAnalysis.recommendedAgent,
      },
      communications: {
        autoReplyNeeded: this.shouldSendAutoReply(priorityAnalysis, customerAnalysis),
        templateRecommendation: this.recommendEmailTemplate(incidentAnalysis, priorityAnalysis),
        additionalRecipients: this.getAdditionalRecipients(customerAnalysis, incidentAnalysis),
        escalationNotifications: this.getEscalationNotifications(priorityAnalysis, assignmentAnalysis),
      },
      sla: this.calculateSLARequirements(priorityAnalysis, customerAnalysis, incidentAnalysis),
    };
  }

  // Helper methods for data extraction and processing

  private extractEmailContent(email: any): any {
    return {
      subject: email.subject || 'No Subject',
      body: this.extractEmailBody(email),
      from: this.extractSenderEmail(email),
      fromName: this.extractSenderName(email),
      timestamp: email.receivedDateTime || email.date || new Date(),
    };
  }

  private extractEmailBody(email: any): string {
    let body = '';
    
    if (email.body?.content) {
      body = email.body.content;
    } else if (email.body && typeof email.body === 'string') {
      body = email.body;
    } else if (email.html) {
      body = email.html;
    } else if (email.text) {
      body = email.text;
    }

    return this.cleanEmailContent(body);
  }

  private cleanEmailContent(content: string): string {
    return content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/--\s*\n[\s\S]*$/m, '') // Remove signatures
      .replace(/On .* wrote:[\s\S]*$/m, '') // Remove quoted replies
      .replace(/_{20,}/g, '') // Remove separator lines
      .trim();
  }

  private extractSenderEmail(email: any): string {
    if (email.from?.address) return email.from.address;
    if (email.from?.emailAddress?.address) return email.from.emailAddress.address;
    if (typeof email.from === 'string') return email.from;
    return 'unknown@unknown.com';
  }

  private extractSenderName(email: any): string {
    if (email.from?.name) return email.from.name;
    if (email.from?.emailAddress?.name) return email.from.emailAddress.name;
    return '';
  }

  private calculateOverallConfidence(confidences: number[]): number {
    const validConfidences = confidences.filter(c => !isNaN(c) && c >= 0);
    return validConfidences.length > 0 
      ? validConfidences.reduce((sum, c) => sum + c, 0) / validConfidences.length 
      : 0.5;
  }

  // Extraction methods for RAG responses
  private extractCustomerInfoFromRAG(ragResponse: any, email: string, name: string): any {
    // Implementation to extract customer info from RAG response
    return {
      confidence: ragResponse.response.confidence || 0.5,
      userId: null, // Extract from RAG context if available
      customerInfo: {
        name: name || email,
        email: email,
      },
      reasoning: 'Customer analysis based on available data',
    };
  }

  private extractIncidentInfoFromRAG(ragResponse: any, mlClassification: any, emailContent: any): any {
    // Extract incident classification from RAG and ML responses
    return {
      category: mlClassification?.prediction || 'General',
      type: 'incident' as const,
      confidence: ragResponse.response.confidence || 0.7,
      affectedSystems: this.extractSystemsFromContent(emailContent.body),
      impactAssessment: {
        scope: 'individual' as const,
        severity: 'medium' as const,
        businessImpact: 'User productivity impact',
      },
      reasoning: 'Classification based on content analysis and ML prediction',
    };
  }

  private extractPriorityInfoFromRAG(ragResponse: any, emailContent: any): any {
    const text = (emailContent.subject + ' ' + emailContent.body).toLowerCase();
    
    let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    let urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    const factors: string[] = [];

    if (text.includes('urgent') || text.includes('critical') || text.includes('emergency')) {
      level = 'CRITICAL';
      urgency = 'CRITICAL';
      factors.push('urgent language detected');
    } else if (text.includes('asap') || text.includes('important')) {
      level = 'HIGH';
      urgency = 'HIGH';
      factors.push('high priority language detected');
    }

    return {
      level,
      urgency,
      confidence: ragResponse.response.confidence || 0.8,
      factors,
      reasoning: 'Priority based on content analysis and language patterns',
      escalationNeeded: level === 'CRITICAL',
    };
  }

  private extractKeywordsFromRAG(ragResponse: any, emailContent: any): string[] {
    // Extract keywords from RAG response and content
    const keywords = [];
    
    // Extract keywords from RAG response if available
    if (ragResponse.response && typeof ragResponse.response === 'string') {
      const ragKeywords = ragResponse.response.toLowerCase().match(/\b\w{4,}\b/g) || [];
      keywords.push(...ragKeywords.slice(0, 5)); // Add up to 5 RAG-derived keywords
    }

    // Add keywords from RAG context sources
    if (ragResponse.ragContext?.sources) {
      ragResponse.ragContext.sources.forEach((source: any) => {
        if (source.title) {
          const sourceKeywords = source.title.toLowerCase().match(/\b\w{4,}\b/g) || [];
          keywords.push(...sourceKeywords.slice(0, 2)); // Add up to 2 keywords per source
        }
      });
    }
    
    // Basic keyword extraction from email content
    const text = emailContent.subject + ' ' + emailContent.body;
    const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const commonWords = new Set(['this', 'that', 'with', 'have', 'will', 'been', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'may', 'say']);
    
    // Combine all keywords and filter
    const emailKeywords = words.filter(word => !commonWords.has(word));
    keywords.push(...emailKeywords);
    
    return keywords
      .filter((word, index, arr) => arr.indexOf(word) === index) // Remove duplicates
      .slice(0, 10); // Return top 10 keywords
  }

  private extractAutomationInfoFromRAG(ragResponse: any): any {
    return {
      knowledgeArticles: ragResponse.ragContext?.sources || [],
      suggestedSolutions: ragResponse.recommendations?.nextActions || [],
      automatedActions: [],
      selfServiceOptions: ragResponse.recommendations?.relatedTopics || [],
      escalationTriggers: [],
    };
  }

  private extractAssignmentInfoFromRAG(ragResponse: any, incidentAnalysis: any): any {
    return {
      specialistRequired: incidentAnalysis.category === 'Security' || incidentAnalysis.category === 'Network',
      skillsRequired: [incidentAnalysis.category],
      confidence: ragResponse.response.confidence || 0.6,
      reasoning: 'Assignment based on incident category and requirements',
    };
  }

  // Fallback methods for basic processing
  private async fallbackBasicProcessing(email: any, emailAccount: any): Promise<EmailTicketAnalysis> {
    const emailContent = this.extractEmailContent(email);
    
    // Extract account-specific context for fallback processing
    const accountInfo = emailAccount ? {
      accountName: emailAccount.name || 'Unknown',
      accountType: emailAccount.type || 'standard',
      priority: emailAccount.priority || 'normal',
      organization: emailAccount.organization || null,
    } : null;
    
    return {
      id: crypto.randomUUID(),
      emailId: email.id || crypto.randomUUID(),
      analysis: {
        customer: {
          identified: !!accountInfo,
          confidence: accountInfo ? 0.7 : 0.5,
          reasoning: accountInfo ? 
            `Fallback processing - identified from email account: ${accountInfo.accountName}` :
            'Fallback processing - basic customer identification',
        },
        incident: this.fallbackIncidentAnalysis(emailContent),
        priority: this.fallbackPriorityAnalysis(emailContent),
        assignment: {
          specialistRequired: accountInfo?.priority === 'high' || false,
          skillsRequired: accountInfo?.organization ? [accountInfo.organization] : [],
          confidence: 0.5,
          reasoning: accountInfo ? 
            `Fallback processing - assignment based on account type: ${accountInfo.accountType}` :
            'Fallback processing - default assignment',
        },
        content: this.fallbackContentAnalysis(emailContent),
        automation: {
          knowledgeArticles: [],
          suggestedSolutions: [],
          automatedActions: [],
          selfServiceOptions: [],
          escalationTriggers: accountInfo?.priority === 'high' ? ['high_priority_account'] : [],
        },
      },
      recommendations: {
        ticketData: {
          title: emailContent.subject,
          description: emailContent.body,
          type: 'INCIDENT',
          priority: accountInfo?.priority === 'high' ? 'HIGH' : 'MEDIUM',
          urgency: accountInfo?.priority === 'high' ? 'HIGH' : 'MEDIUM',
          category: accountInfo?.organization || 'General',
          tags: ['email', ...(accountInfo ? [accountInfo.accountType] : [])],
          customFields: accountInfo ? { accountName: accountInfo.accountName, accountType: accountInfo.accountType } : {},
        },
        assignment: {},
        communications: {
          autoReplyNeeded: true,
          additionalRecipients: [],
          escalationNotifications: accountInfo?.priority === 'high' ? ['manager'] : [],
        },
        sla: {
          responseTime: accountInfo?.priority === 'high' ? '2 hours' : '4 hours',
          resolutionTime: accountInfo?.priority === 'high' ? '12 hours' : '24 hours',
          businessJustification: accountInfo?.priority === 'high' ? 'High priority account SLA' : 'Standard SLA',
        },
      },
      metadata: {
        processingTime: 100,
        aiConfidence: accountInfo ? 0.7 : 0.5,
        modelsUsed: ['fallback'],
        timestamp: new Date(),
        version: '1.0.0',
      },
    };
  }

  private fallbackIncidentAnalysis(emailContent: any): any {
    // Basic analysis using email content patterns
    const subject = (emailContent.subject || '').toLowerCase();
    const body = (emailContent.body || '').toLowerCase();
    const fullText = subject + ' ' + body;
    
    // Categorize based on keywords
    let category = 'General';
    let type: 'incident' | 'service_request' | 'change_request' | 'problem' = 'incident';
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    
    if (fullText.includes('urgent') || fullText.includes('critical') || fullText.includes('down')) {
      severity = 'high';
      category = 'System Outage';
    } else if (fullText.includes('password') || fullText.includes('login') || fullText.includes('access')) {
      category = 'Access Management';
    } else if (fullText.includes('software') || fullText.includes('application') || fullText.includes('app')) {
      category = 'Software';
    } else if (fullText.includes('hardware') || fullText.includes('device') || fullText.includes('computer')) {
      category = 'Hardware';
    } else if (fullText.includes('network') || fullText.includes('internet') || fullText.includes('wifi')) {
      category = 'Network';
    } else if (fullText.includes('email') || fullText.includes('mailbox')) {
      category = 'Email';
    }

    // Detect request type
    if (fullText.includes('request') || fullText.includes('need') || fullText.includes('setup')) {
      type = 'service_request';
    }

    return {
      category,
      type,
      confidence: 0.6,
      affectedSystems: this.extractSystemsFromContent(fullText),
      impactAssessment: {
        scope: severity === 'high' ? 'multiple' as const : 'individual' as const,
        severity,
        businessImpact: `Identified from content analysis: ${category.toLowerCase()} issue`,
      },
      reasoning: `Fallback classification based on keyword analysis: ${category}`,
    };
  }

  private fallbackPriorityAnalysis(emailContent: any): any {
    // Analyze priority based on email content
    const subject = (emailContent.subject || '').toLowerCase();
    const body = (emailContent.body || '').toLowerCase();
    const fullText = subject + ' ' + body;
    
    let level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    let urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    const factors: string[] = [];
    let escalationNeeded = false;

    // High priority indicators
    if (fullText.includes('urgent') || fullText.includes('asap') || fullText.includes('immediately')) {
      level = 'HIGH';
      urgency = 'HIGH';
      factors.push('urgent language detected');
    }

    // Critical priority indicators
    if (fullText.includes('critical') || fullText.includes('down') || fullText.includes('outage') || 
        fullText.includes('not working') || fullText.includes('broken')) {
      level = 'CRITICAL';
      urgency = 'CRITICAL';
      escalationNeeded = true;
      factors.push('critical system issue detected');
    }

    // Business impact indicators
    if (fullText.includes('business') || fullText.includes('production') || fullText.includes('revenue')) {
      if (level === 'MEDIUM') level = 'HIGH';
      if (urgency === 'MEDIUM') urgency = 'HIGH';
      factors.push('business impact mentioned');
    }

    // Low priority indicators
    if (fullText.includes('question') || fullText.includes('when convenient') || 
        fullText.includes('not urgent') || fullText.includes('low priority')) {
      level = 'LOW';
      urgency = 'LOW';
      factors.push('low priority language detected');
    }

    // Default fallback factors
    if (factors.length === 0) {
      factors.push('fallback analysis', 'no priority indicators found');
    }

    return {
      level,
      urgency,
      confidence: factors.length > 1 ? 0.7 : 0.5,
      factors,
      reasoning: `Fallback priority assignment based on content analysis: ${factors.join(', ')}`,
      escalationNeeded,
    };
  }

  private fallbackContentAnalysis(emailContent: any): any {
    return {
      cleanedDescription: emailContent.body,
      extractedKeywords: [],
      sentimentAnalysis: {
        sentiment: 'neutral' as const,
        confidence: 0.5,
        emotionalIndicators: [],
      },
      technicalDetails: {
        errorMessages: [],
        systemLogs: [],
        environmentInfo: {},
        reproductionSteps: [],
      },
      businessContext: {
        affectedProcesses: [],
        timeConstraints: [],
      },
    };
  }

  // Additional helper methods
  private async loadSystemKnowledge(): Promise<void> {
    // Load system knowledge from RAG or database
    logger.debug('Loading system knowledge for email processing');
  }

  private async initializeCustomerEnrichment(): Promise<void> {
    // Initialize customer enrichment data
    logger.debug('Initializing customer enrichment data');
  }

  private extractSystemsFromContent(content: string): string[] {
    const systemKeywords = ['server', 'database', 'network', 'email', 'application', 'system'];
    const systems = [];
    
    for (const keyword of systemKeywords) {
      if (content.toLowerCase().includes(keyword)) {
        systems.push(keyword);
      }
    }
    
    return systems;
  }

  private extractTechnicalDetails(content: string): any {
    return {
      errorMessages: this.extractErrorMessages(content),
      systemLogs: [],
      environmentInfo: {},
      reproductionSteps: [],
    };
  }

  private extractErrorMessages(content: string): string[] {
    const errorPatterns = [
      /error:\s*(.+)/gi,
      /exception:\s*(.+)/gi,
      /failed:\s*(.+)/gi,
    ];
    
    const errors = [];
    for (const pattern of errorPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        errors.push(...matches);
      }
    }
    
    return errors;
  }

  private async analyzeSentiment(emailContent: any): Promise<any> {
    const text = emailContent.subject + ' ' + emailContent.body;
    const urgentWords = ['urgent', 'critical', 'frustrated', 'angry', 'help'];
    const positiveWords = ['thanks', 'please', 'appreciate'];
    
    let sentiment: 'positive' | 'neutral' | 'negative' | 'frustrated' | 'urgent' = 'neutral';
    let confidence = 0.5;
    
    const lowerText = text.toLowerCase();
    
    if (urgentWords.some(word => lowerText.includes(word))) {
      sentiment = 'urgent';
      confidence = 0.8;
    } else if (positiveWords.some(word => lowerText.includes(word))) {
      sentiment = 'positive';
      confidence = 0.7;
    }
    
    return {
      sentiment,
      confidence,
      emotionalIndicators: urgentWords.filter(word => lowerText.includes(word)),
    };
  }

  private extractBusinessContext(emailContent: any): any {
    const subject = (emailContent.subject || '').toLowerCase();
    const body = (emailContent.body || '').toLowerCase();
    const fullText = subject + ' ' + body;

    const affectedProcesses: string[] = [];
    const timeConstraints: string[] = [];
    const compliance: string[] = [];

    // Detect business processes
    if (fullText.includes('payroll') || fullText.includes('hr')) {
      affectedProcesses.push('Human Resources');
    }
    if (fullText.includes('finance') || fullText.includes('accounting') || fullText.includes('invoice')) {
      affectedProcesses.push('Finance');
    }
    if (fullText.includes('sales') || fullText.includes('crm') || fullText.includes('customer')) {
      affectedProcesses.push('Sales');
    }
    if (fullText.includes('inventory') || fullText.includes('supply')) {
      affectedProcesses.push('Supply Chain');
    }

    // Detect time constraints
    if (fullText.includes('deadline') || fullText.includes('due date')) {
      timeConstraints.push('deadline-sensitive');
    }
    if (fullText.includes('end of day') || fullText.includes('eod')) {
      timeConstraints.push('end-of-day');
    }
    if (fullText.includes('urgent') || fullText.includes('asap')) {
      timeConstraints.push('urgent');
    }

    // Detect compliance requirements
    if (fullText.includes('audit') || fullText.includes('compliance')) {
      compliance.push('audit-related');
    }
    if (fullText.includes('gdpr') || fullText.includes('privacy')) {
      compliance.push('data-privacy');
    }
    if (fullText.includes('security') || fullText.includes('confidential')) {
      compliance.push('security-sensitive');
    }

    return {
      affectedProcesses,
      timeConstraints,
      compliance,
    };
  }

  private matchAffectedSystems(emailContent: any, knownSystems: string[]): string[] {
    const content = emailContent.body.toLowerCase();
    return knownSystems.filter(system => content.includes(system.toLowerCase()));
  }

  // Recommendation generation methods
  private generateEnhancedTitle(subject: string, incidentAnalysis: any): string {
    return `[${incidentAnalysis.category}] ${subject}`;
  }

  private generateEnhancedDescription(body: string, contentAnalysis: any): string {
    let description = contentAnalysis.cleanedDescription;
    
    if (contentAnalysis.technicalDetails.errorMessages.length > 0) {
      description += '\n\nError Messages:\n' + contentAnalysis.technicalDetails.errorMessages.join('\n');
    }
    
    return description;
  }

  private mapIncidentTypeToTicketType(incidentType: string): string {
    const mapping = {
      'incident': 'INCIDENT',
      'service_request': 'SERVICE_REQUEST',
      'change_request': 'CHANGE_REQUEST',
      'problem': 'PROBLEM',
    };
    
    return mapping[incidentType] || 'INCIDENT';
  }

  private generateEnhancedTags(incidentAnalysis: any, contentAnalysis: any): string[] {
    const tags = ['email', incidentAnalysis.category.toLowerCase()];
    
    if (incidentAnalysis.affectedSystems.length > 0) {
      tags.push(...incidentAnalysis.affectedSystems.map(s => s.toLowerCase()));
    }
    
    if (contentAnalysis.sentimentAnalysis.sentiment === 'urgent') {
      tags.push('urgent');
    }
    
    return tags;
  }

  private generateCustomFields(customerAnalysis: any, incidentAnalysis: any, priorityAnalysis: any, contentAnalysis: any): Record<string, any> {
    return {
      ai_processed: true,
      ai_confidence: this.calculateOverallConfidence([
        customerAnalysis.confidence,
        incidentAnalysis.confidence,
        priorityAnalysis.confidence,
      ]),
      detected_systems: incidentAnalysis.affectedSystems,
      sentiment: contentAnalysis.sentimentAnalysis.sentiment,
      escalation_needed: priorityAnalysis.escalationNeeded,
    };
  }

  private shouldSendAutoReply(priorityAnalysis: any, customerAnalysis: any): boolean {
    // Determine if auto-reply should be sent based on priority and customer context
    
    // Always send auto-reply for critical issues
    if (priorityAnalysis.level === 'CRITICAL') {
      return true;
    }

    // Send auto-reply for high priority issues
    if (priorityAnalysis.level === 'HIGH') {
      return true;
    }

    // For VIP customers, always send auto-reply
    if (customerAnalysis.customerInfo?.vipStatus || customerAnalysis.customerInfo?.priority === 'high') {
      return true;
    }

    // For identified customers, send auto-reply
    if (customerAnalysis.identified && customerAnalysis.confidence > 0.7) {
      return true;
    }

    // For escalation needed cases, send auto-reply
    if (priorityAnalysis.escalationNeeded) {
      return true;
    }

    // Default: send auto-reply for medium and low priority
    return priorityAnalysis.level !== 'LOW';
  }

  private recommendEmailTemplate(incidentAnalysis: any, priorityAnalysis: any): string {
    if (priorityAnalysis.level === 'CRITICAL') {
      return 'critical_incident_ack';
    } else if (incidentAnalysis.category === 'Password Reset') {
      return 'password_reset_ack';
    }
    
    return 'standard_ack';
  }

  private getAdditionalRecipients(customerAnalysis: any, incidentAnalysis: any): string[] {
    const recipients = [];
    
    if (incidentAnalysis.impactAssessment.severity === 'critical') {
      recipients.push('alerts@company.com');
    }
    
    return recipients;
  }

  private getEscalationNotifications(priorityAnalysis: any, assignmentAnalysis: any): string[] {
    const notifications = [];
    
    // Escalate based on priority analysis
    if (priorityAnalysis.escalationNeeded) {
      notifications.push('manager@company.com');
    }
    
    // Escalate based on assignment analysis
    if (assignmentAnalysis.specialistRequired) {
      notifications.push('specialist-team@company.com');
    }

    // Escalate if confidence is low for assignment
    if (assignmentAnalysis.confidence < 0.5) {
      notifications.push('assignment-review@company.com');
    }

    // Add skill-specific escalations
    if (assignmentAnalysis.skillsRequired?.length > 0) {
      assignmentAnalysis.skillsRequired.forEach((skill: string) => {
        if (skill.toLowerCase().includes('security')) {
          notifications.push('security-team@company.com');
        } else if (skill.toLowerCase().includes('network')) {
          notifications.push('network-team@company.com');
        } else if (skill.toLowerCase().includes('database')) {
          notifications.push('dba-team@company.com');
        }
      });
    }

    // Remove duplicates
    return [...new Set(notifications)];
  }

  private calculateSLARequirements(priorityAnalysis: any, customerAnalysis: any, incidentAnalysis: any): any {
    const slaMapping = {
      'CRITICAL': { response: '15 minutes', resolution: '4 hours' },
      'HIGH': { response: '1 hour', resolution: '8 hours' },
      'MEDIUM': { response: '4 hours', resolution: '24 hours' },
      'LOW': { response: '8 hours', resolution: '72 hours' },
    };
    
    const sla = slaMapping[priorityAnalysis.level] || slaMapping['MEDIUM'];
    
    return {
      responseTime: sla.response,
      resolutionTime: sla.resolution,
      businessJustification: `Priority: ${priorityAnalysis.level}, Category: ${incidentAnalysis.category}`,
    };
  }

  /**
   * Get processor statistics
   */
  getStats(): any {
    return {
      isInitialized: this.isInitialized,
      processingCacheSize: this.processingCache.size,
      customerCacheSize: this.customerCache.size,
      systemKnowledgeSize: this.systemKnowledge.size,
      config: this.config,
    };
  }

  /**
   * Test email processing with different scenarios
   */
  async testEmailProcessing(testEmail: any, testContext?: EmailProcessingContext): Promise<EmailTicketAnalysis> {
    const testEmailAccount = {
      id: 'test',
      address: 'test@company.com',
      tenantId: 'test',
    };
    
    return this.processEmailForTicket(testEmail, testEmailAccount, testContext);
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down Nova Synth Email Processor...');
    this.isInitialized = false;
    this.processingCache.clear();
    this.customerCache.clear();
    this.systemKnowledge.clear();
    logger.info('Nova Synth Email Processor shutdown complete');
  }
}

// Export singleton instance
export const novaSynthEmailProcessor = new NovaSynthEmailProcessor();