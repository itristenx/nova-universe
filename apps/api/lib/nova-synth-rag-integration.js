/**
 * Nova Synth RAG Integration
 *
 * Integrates the RAG engine with Nova's Cosmo personality system to provide
 * personality-aware document retrieval and contextual AI responses.
 *
 * Features:
 * - Personality-aware document retrieval
 * - Context-enhanced response generation
 * - Dynamic personality adaptation based on query context
 * - Multi-modal response generation (text, structured data, recommendations)
 * - Intent detection and response routing
 * - Conversation memory and context tracking
 */
import { EventEmitter } from 'events';
import { logger } from '../logger.js';
import { ragEngine } from './rag-engine.js';
import { ragRBAC } from './nova-rag-rbac.js';
import { novaMLPipeline } from './nova-ml-pipeline.js';
import crypto from 'crypto';
/**
 * Nova Synth RAG Integration System
 */
export class NovaSynthRAGIntegration extends EventEmitter {
    conversationMemory = new Map();
    personalityProfiles = new Map();
    responseTemplates = new Map();
    intentClassifier = null;
    isInitialized = false;
    // Configuration
    config = {
        enableConversationMemory: true,
        enablePersonalityAdaptation: true,
        enableIntentDetection: true,
        enableLearning: true,
        maxConversationMemory: 1000,
        maxConversationTurns: 50,
        memoryCleanupInterval: 24 * 60 * 60 * 1000, // 24 hours
        defaultPersonalityProfile: 'default',
        adaptationThreshold: 0.7,
        responseQualityThreshold: 0.8,
    };
    constructor() {
        super();
        this.initializePersonalityProfiles();
        this.initializeResponseTemplates();
    }
    /**
     * Initialize the Nova Synth RAG Integration
     */
    async initialize() {
        try {
            logger.info('Initializing Nova Synth RAG Integration...');
            // Wait for dependencies to be initialized
            if (!ragEngine.isInitialized) {
                await ragEngine.initialize();
            }
            if (ragRBAC && !ragRBAC.isInitialized) {
                await ragRBAC.initialize();
            }
            // Initialize ML Pipeline for intent detection if available
            if (novaMLPipeline) {
                try {
                    await this.initializeIntentClassifier();
                }
                catch (error) {
                    logger.warn('Failed to initialize intent classifier:', error.message);
                }
            }
            // Start memory cleanup loop
            if (this.config.enableConversationMemory) {
                this.startMemoryCleanup();
            }
            this.isInitialized = true;
            this.emit('initialized');
            logger.info('Nova Synth RAG Integration initialized successfully');
        }
        catch (error) {
            logger.error('Failed to initialize Nova Synth RAG Integration:', error);
            throw error;
        }
    }
    /**
     * Process a Synth query with RAG context and personality-aware response generation
     */
    async processSynthQuery(synthQuery) {
        if (!this.isInitialized) {
            throw new Error('Nova Synth RAG Integration not initialized');
        }
        const startTime = Date.now();
        const ragStartTime = Date.now();
        try {
            // Generate unique query ID
            synthQuery.id = crypto.randomUUID();
            // Detect intent if enabled and available
            if (this.config.enableIntentDetection && this.intentClassifier) {
                try {
                    const intent = await this.detectIntent(synthQuery.query, synthQuery.context);
                    synthQuery.context.intent = intent;
                }
                catch (error) {
                    logger.warn('Intent detection failed:', error.message);
                }
            }
            // Adapt personality based on context
            const personalityStartTime = Date.now();
            const adaptedPersonality = await this.adaptPersonality(synthQuery);
            const personalityAdaptationTime = Date.now() - personalityStartTime;
            // Get conversation context if available
            const conversationContext = this.config.enableConversationMemory ?
                await this.getConversationContext(synthQuery) : null;
            // Prepare RAG query with enhanced context
            const ragQuery = {
                id: crypto.randomUUID(),
                query: this.enhanceQueryWithContext(synthQuery, conversationContext),
                    // Extract user roles and security clearance from user context
                    let userRoles = [];
                    let securityClearance = 'standard';
                    
                    try {
                        if (synthQuery.context.userId) {
                            // Query user roles
                            const roles = await new Promise((resolve) => {
                                db.all(`
                                    SELECT r.name as role_name, r.description, p.name as permission_name
                                    FROM user_roles ur
                                    JOIN roles r ON ur.role_id = r.id
                                    LEFT JOIN role_permissions rp ON r.id = rp.role_id  
                                    LEFT JOIN permissions p ON rp.permission_id = p.id
                                    WHERE ur.user_id = $1
                                `, [synthQuery.context.userId], (err, rows) => {
                                    if (err || !rows) {
                                        resolve([]);
                                    } else {
                                        resolve(rows);
                                    }
                                });
                            });
                            
                            if (roles && roles.length > 0) {
                                userRoles = [...new Set(roles.map(r => r.role_name).filter(Boolean))];
                                
                                // Determine security clearance based on roles
                                if (userRoles.includes('admin') || userRoles.includes('security_admin')) {
                                    securityClearance = 'admin';
                                } else if (userRoles.includes('manager') || userRoles.includes('supervisor')) {
                                    securityClearance = 'elevated';  
                                } else if (userRoles.includes('agent') || userRoles.includes('support')) {
                                    securityClearance = 'standard';
                                } else {
                                    securityClearance = 'basic';
                                }
                            }
                        }
                    } catch (error) {
                        logger.warn('Failed to extract user roles and clearance, using defaults', {
                            userId: synthQuery.context.userId,
                            error: error.message
                        });
                    }

                context: {
                    userId: synthQuery.context.userId,
                    tenantId: synthQuery.context.tenantId,
                    module: synthQuery.context.module,
                    sessionId: synthQuery.context.sessionId,
                    userRoles,
                    securityClearance,
                },
                filters: {
                    ...synthQuery.filters,
                    tenantId: synthQuery.context.tenantId,
                },
                options: {
                    maxResults: synthQuery.options.maxContextChunks || 10,
                    minScore: synthQuery.filters?.relevanceThreshold || 0.7,
                    includeMetadata: true,
                    rerank: true,
                    expandQuery: true,
                    hybridSearch: true,
                    enforceRBAC: true,
                },
                metadata: {
                    synthQueryId: synthQuery.id,
                    personalityProfile: adaptedPersonality.adaptedProfile,
                    intent: synthQuery.context.intent,
                    urgency: synthQuery.context.urgency,
                },
            };
            // Execute RAG query
            const ragResult = await ragEngine.query(ragQuery);
            const ragEndTime = Date.now();
            // Generate personality-aware response
            const responseStartTime = Date.now();
            const response = await this.generatePersonalityAwareResponse(synthQuery, ragResult, adaptedPersonality, conversationContext);
            const responseEndTime = Date.now();
            // Update conversation memory
            if (this.config.enableConversationMemory && synthQuery.options.trackConversation) {
                await this.updateConversationMemory(synthQuery, response, ragResult);
            }
            // Generate recommendations
            const recommendations = synthQuery.options.includeRecommendations ?
                await this.generateRecommendations(synthQuery, ragResult) : undefined;
            // Prepare response
            const synthResponse = {
                id: crypto.randomUUID(),
                queryId: synthQuery.id,
                response: {
                    text: response.text,
                    confidence: response.confidence,
                    responseType: response.type,
                    personality: {
                        profileUsed: adaptedPersonality.adaptedProfile,
                        traitsApplied: adaptedPersonality.adaptations.map(a => a.type),
                        adaptations: adaptedPersonality.adaptations.map(a => a.reason),
                    },
                },
                ragContext: {
                    chunksUsed: ragResult.chunks.length,
                    sources: [...new Set(ragResult.chunks.map(chunk => chunk.metadata.source))],
                    relevanceScores: ragResult.chunks.map(chunk => chunk.metadata.relevanceScore || 0),
                    totalSources: ragResult.totalResults,
                },
                recommendations,
                conversationContext: conversationContext ? {
                    conversationId: conversationContext.conversationId,
                    turnNumber: conversationContext.metadata.totalTurns + 1,
                    contextCarriedForward: true,
                    memoryUpdated: synthQuery.options.trackConversation,
                } : undefined,
                metadata: {
                    processingTime: Date.now() - startTime,
                    ragRetrievalTime: ragEndTime - ragStartTime,
                    responseGenerationTime: responseEndTime - responseStartTime,
                    personalityAdaptationTime, // Measured adaptation time
                    timestamp: new Date(),
                },
            };
            // Emit events for monitoring and learning
            this.emit('synthQueryProcessed', { query: synthQuery, response: synthResponse });
            if (this.config.enableLearning) {
                this.emit('learningEvent', {
                    type: 'synth_interaction',
                    query: synthQuery,
                    response: synthResponse,
                    context: conversationContext,
                });
            }
            return synthResponse;
        }
        catch (error) {
            logger.error('Error processing Synth query:', error);
            throw error;
        }
    }
    /**
     * Get conversation history for a user
     */
    async getConversationHistory(userId, tenantId, conversationId, limit = 10) {
        const conversations = Array.from(this.conversationMemory.values())
            .filter(conv => conv.userId === userId &&
            conv.tenantId === tenantId &&
            (!conversationId || conv.conversationId === conversationId))
            .sort((a, b) => b.metadata.lastUpdated.getTime() - a.metadata.lastUpdated.getTime())
            .slice(0, limit);
        return conversations;
    }
    /**
     * Test Synth responses with different personality configurations
     */
    async testPersonalityResponses(query, userId, tenantId, personalities = ['default', 'technical-expert', 'crisis-management']) {
        const testResults = {
            query,
            timestamp: new Date(),
            personalities: {},
        };
        for (const personality of personalities) {
            try {
                const synthQuery = {
                    id: crypto.randomUUID(),
                    query,
                    context: {
                        userId,
                        tenantId,
                        module: 'testing',
                        requestType: 'information',
                    },
                    personalityConfig: {
                        profile: personality,
                        traits: this.personalityProfiles.get(personality)?.traits || this.personalityProfiles.get('default')?.traits,
                        adaptationRules: {
                            contextSensitive: false, // Disable adaptation for testing
                            urgencyAware: false,
                            roleBasedAdjustment: false,
                            learningEnabled: false,
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
                const response = await this.processSynthQuery(synthQuery);
                testResults.personalities[personality] = {
                    response: response.response.text,
                    confidence: response.response.confidence,
                    responseType: response.response.responseType,
                    ragChunks: response.ragContext.chunksUsed,
                    processingTime: response.metadata.processingTime,
                };
            }
            catch (error) {
                testResults.personalities[personality] = {
                    error: error.message,
                };
            }
        }
        return testResults;
    }
    /**
     * Get Synth system statistics
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            conversationMemory: this.conversationMemory.size,
            personalityProfiles: this.personalityProfiles.size,
            responseTemplates: this.responseTemplates.size,
            intentClassifierAvailable: !!this.intentClassifier,
            config: this.config,
            memoryStats: this.getMemoryStats(),
        };
    }
    // Private methods
    initializePersonalityProfiles() {
        this.personalityProfiles.set('default', {
            name: 'Default Assistant',
            description: 'Friendly, helpful, and balanced personality',
            traits: {
                tone: 'friendly',
                responseStyle: 'conversational',
                communicationPreferences: {
                    provideContext: true,
                    offerAlternatives: true,
                    proactiveFollowUp: true,
                    includeReferences: true,
                    adaptToUserLevel: true,
                },
            },
            templates: {
                greeting: "I'm here to help! Let me find the most relevant information for you.",
                noResults: "I couldn't find specific information about that, but let me suggest some related topics that might help.",
                multipleResults: "I found several relevant resources. Here are the most helpful ones:",
                clarification: "To provide you with the most accurate help, could you tell me more about",
            },
        });
        this.personalityProfiles.set('technical-expert', {
            name: 'Technical Expert',
            description: 'Professional, detailed, and technically precise',
            traits: {
                tone: 'professional',
                responseStyle: 'detailed',
                communicationPreferences: {
                    provideContext: true,
                    offerAlternatives: true,
                    proactiveFollowUp: false,
                    includeReferences: true,
                    adaptToUserLevel: false,
                },
            },
            templates: {
                greeting: "I'll provide you with detailed technical information based on our documentation and knowledge base.",
                noResults: "No exact matches found in the technical documentation. Consider checking related system components or configurations.",
                multipleResults: "Multiple technical resources identified. Prioritized by relevance and implementation specificity:",
                clarification: "For accurate technical guidance, please specify the following parameters:",
            },
        });
        this.personalityProfiles.set('crisis-management', {
            name: 'Crisis Management',
            description: 'Empathetic, step-by-step, and reassuring for urgent situations',
            traits: {
                tone: 'empathetic',
                responseStyle: 'step-by-step',
                communicationPreferences: {
                    provideContext: true,
                    offerAlternatives: true,
                    proactiveFollowUp: true,
                    includeReferences: true,
                    adaptToUserLevel: true,
                },
            },
            templates: {
                greeting: "I understand this is urgent. Let me help you resolve this step by step.",
                noResults: "I want to help you through this. While I don't have an exact match, here are immediate steps you can take:",
                multipleResults: "I've found several solutions. Let's start with the most immediate actions:",
                clarification: "To help you most effectively in this situation, I need to understand:",
            },
        });
    }
    initializeResponseTemplates() {
        this.responseTemplates.set('direct_answer', `{greeting}

Based on the information available, {answer}

{context}

{references}

{followUp}`);
        this.responseTemplates.set('guided_response', `{greeting}

Here's a step-by-step approach to help with your request:

{steps}

{additionalInfo}

{references}

{followUp}`);
        this.responseTemplates.set('recommendations', `{greeting}

I found several relevant resources that can help:

{recommendations}

{reasoning}

{followUp}`);
        this.responseTemplates.set('clarification_needed', `{greeting}

{clarificationRequest}

Meanwhile, here's some general information that might be helpful:

{generalInfo}

{followUp}`);
    }
    async initializeIntentClassifier() {
        try {
            // Use existing ML Pipeline for intent classification
            const experiments = novaMLPipeline.listExperiments();
            const intentClassifier = experiments.find(exp => exp.modelName.includes('intent') || exp.modelName.includes('classification'));
            if (intentClassifier) {
                this.intentClassifier = intentClassifier;
                logger.info('Intent classifier initialized from ML Pipeline');
            }
            else {
                logger.info('No intent classifier found in ML Pipeline');
            }
        }
        catch (error) {
            logger.warn('Failed to initialize intent classifier:', error.message);
        }
    }
    async detectIntent(query, context) {
        if (!this.intentClassifier) {
            return 'unknown';
        }
        try {
            // Use ML Pipeline to classify intent
            const result = await novaMLPipeline.predictWithCosmoPersonality(this.intentClassifier.id, query, { context: 'intent_detection' });
            return result.prediction || 'unknown';
        }
        catch (error) {
            logger.warn('Intent detection failed:', error.message);
            return 'unknown';
        }
    }
    async adaptPersonality(synthQuery) {
        const originalProfile = synthQuery.personalityConfig.profile;
        let adaptedProfile = originalProfile;
        const adaptations = [];
        if (!this.config.enablePersonalityAdaptation ||
            !synthQuery.personalityConfig.adaptationRules?.contextSensitive) {
            return {
                originalProfile,
                adaptedProfile,
                adaptations,
                context: synthQuery.context,
                confidence: 1.0,
            };
        }
        // Adapt based on urgency
        if (synthQuery.context.urgency === 'critical' && originalProfile !== 'crisis-management') {
            adaptedProfile = 'crisis-management';
            adaptations.push({
                type: 'tone',
                from: originalProfile,
                to: 'crisis-management',
                reason: 'Critical urgency detected - switching to crisis management mode',
            });
        }
        // Adapt based on intent
        if (synthQuery.context.intent === 'technical' && originalProfile !== 'technical-expert') {
            adaptedProfile = 'technical-expert';
            adaptations.push({
                type: 'style',
                from: originalProfile,
                to: 'technical-expert',
                reason: 'Technical intent detected - using expert mode',
            });
        }
        // Adapt based on request type
        if (synthQuery.context.requestType === 'troubleshooting' && originalProfile === 'default') {
            const traits = synthQuery.personalityConfig.traits;
            traits.responseStyle = 'step-by-step';
            traits.tone = 'solution-focused';
            adaptations.push({
                type: 'style',
                from: 'conversational',
                to: 'step-by-step',
                reason: 'Troubleshooting request - using structured approach',
            });
        }
        return {
            originalProfile,
            adaptedProfile,
            adaptations,
            context: synthQuery.context,
            confidence: 0.8,
        };
    }
    async getConversationContext(synthQuery) {
        if (!this.config.enableConversationMemory) {
            return null;
        }
        const conversationId = synthQuery.context.conversationId ||
            `${synthQuery.context.userId}_${synthQuery.context.sessionId || 'default'}`;
        let conversation = this.conversationMemory.get(conversationId);
        if (!conversation) {
            conversation = {
                conversationId,
                userId: synthQuery.context.userId,
                tenantId: synthQuery.context.tenantId,
                sessionId: synthQuery.context.sessionId,
                context: {
                    previousQueries: [],
                    resolvedIssues: [],
                    ongoingIssues: [],
                    userPreferences: {},
                    lastPersonalityProfile: synthQuery.personalityConfig.profile,
                },
                history: [],
                metadata: {
                    createdAt: new Date(),
                    lastUpdated: new Date(),
                    totalTurns: 0,
                    avgConfidence: 0,
                    primarySources: [],
                },
            };
            this.conversationMemory.set(conversationId, conversation);
        }
        return conversation;
    }
    enhanceQueryWithContext(synthQuery, conversation) {
        let enhancedQuery = synthQuery.query;
        if (conversation && conversation.history.length > 0) {
            // Add context from recent conversation turns
            const recentQueries = conversation.context.previousQueries.slice(-2);
            if (recentQueries.length > 0) {
                enhancedQuery += ` [Previous context: ${recentQueries.join(', ')}]`;
            }
            // Add ongoing issues context
            if (conversation.context.ongoingIssues.length > 0) {
                enhancedQuery += ` [Related ongoing issues: ${conversation.context.ongoingIssues.join(', ')}]`;
            }
        }
        // Add intent context
        if (synthQuery.context.intent) {
            enhancedQuery += ` [Intent: ${synthQuery.context.intent}]`;
        }
        // Add urgency context
        if (synthQuery.context.urgency && synthQuery.context.urgency !== 'medium') {
            enhancedQuery += ` [Urgency: ${synthQuery.context.urgency}]`;
        }
        return enhancedQuery;
    }
    async generatePersonalityAwareResponse(synthQuery, ragResult, personalityAdaptation, conversation) {
        const profile = this.personalityProfiles.get(personalityAdaptation.adaptedProfile) ||
            this.personalityProfiles.get('default');
        // Determine response type based on RAG results and context
        let responseType;
        if (ragResult.chunks.length === 0) {
            responseType = 'clarification_needed';
        }
        else if (ragResult.confidence > 0.8 && ragResult.chunks.length <= 3) {
            responseType = 'direct_answer';
        }
        else if (synthQuery.context.requestType === 'troubleshooting' || synthQuery.context.intent === 'guidance') {
            responseType = 'guided_response';
        }
        else {
            responseType = 'recommendations';
        }
        // Get appropriate template
        const template = this.responseTemplates.get(responseType) || this.responseTemplates.get('direct_answer');
        // Build response components
        const components = await this.buildResponseComponents(synthQuery, ragResult, profile, responseType, conversation);
        // Generate final response text
        const responseText = this.fillTemplate(template, components);
        // Calculate confidence based on RAG confidence and personality adaptation
        const confidence = ragResult.confidence * personalityAdaptation.confidence;
        return {
            text: responseText,
            confidence,
            type: responseType,
        };
    }
    async buildResponseComponents(synthQuery, ragResult, profile, responseType, conversation) {
        const components = {};
        // Greeting
        components.greeting = profile.templates[responseType === 'clarification_needed' ? 'clarification' : 'greeting'];
        // Main content based on response type
        if (responseType === 'direct_answer' && ragResult.chunks.length > 0) {
            components.answer = this.extractDirectAnswer(ragResult.chunks);
            components.context = this.buildContextSection(ragResult.chunks);
        }
        else if (responseType === 'guided_response') {
            components.steps = this.buildStepByStepGuide(ragResult.chunks, synthQuery);
            components.additionalInfo = this.buildAdditionalInfo(ragResult.chunks);
        }
        else if (responseType === 'recommendations') {
            components.recommendations = this.buildRecommendationsList(ragResult.chunks);
            components.reasoning = this.buildReasoningSection(ragResult.chunks);
        }
        else if (responseType === 'clarification_needed') {
            components.clarificationRequest = this.buildClarificationRequest(synthQuery);
            components.generalInfo = this.buildGeneralInfo(ragResult.chunks);
        }
        // References
        if (ragResult.chunks.length > 0 && profile.traits.communicationPreferences.includeReferences) {
            components.references = this.buildReferencesSection(ragResult.chunks);
        }
        else {
            components.references = '';
        }
        // Follow-up
        if (profile.traits.communicationPreferences.proactiveFollowUp) {
            components.followUp = this.buildFollowUpSection(synthQuery, conversation);
        }
        else {
            components.followUp = '';
        }
        return components;
    }
    fillTemplate(template, components) {
        let result = template;
        for (const [key, value] of Object.entries(components)) {
            result = result.replace(new RegExp(`{${key}}`, 'g'), value || '');
        }
        // Clean up empty sections
        result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
        result = result.trim();
        return result;
    }
    extractDirectAnswer(chunks) {
        // Take the most relevant chunks and create a coherent answer
        const topChunks = chunks.slice(0, 2);
        return topChunks.map(chunk => chunk.content).join('\n\n');
    }
    buildContextSection(chunks) {
        if (chunks.length === 0)
            return '';
        const sources = [...new Set(chunks.map(chunk => chunk.metadata.source))];
        return `\nThis information is based on ${sources.length > 1 ? 'multiple sources' : 'our'} ${sources.join(', ')}.`;
    }
    buildStepByStepGuide(chunks, synthQuery) {
        // Extract actionable steps from chunks
        const steps = [];
        chunks.forEach((chunk, index) => {
            if (chunk.content.toLowerCase().includes('step') ||
                chunk.content.toLowerCase().includes('first') ||
                chunk.content.toLowerCase().includes('then')) {
                steps.push(`${index + 1}. ${this.extractKeySentence(chunk.content)}`);
            }
        });
        if (steps.length === 0) {
            return `1. ${this.extractKeySentence(chunks[0]?.content || 'No specific steps available')}\n2. If that doesn't resolve the issue, please check the related documentation\n3. Contact support if the problem persists`;
        }
        return steps.join('\n');
    }
    buildAdditionalInfo(chunks) {
        if (chunks.length <= 1)
            return '';
        const additionalChunks = chunks.slice(1);
        return `\nAdditional information:\n${additionalChunks.map(chunk => `• ${this.extractKeySentence(chunk.content)}`).join('\n')}`;
    }
    buildRecommendationsList(chunks) {
        return chunks.map((chunk, index) => `${index + 1}. **${chunk.metadata.title || chunk.metadata.source}**: ${this.extractKeySentence(chunk.content)}`).join('\n');
    }
    buildReasoningSection(chunks) {
        const sources = [...new Set(chunks.map(chunk => chunk.metadata.source))];
        return `\nThese recommendations are based on ${sources.length} relevant sources covering ${chunks.map(c => c.metadata.category).filter((v, i, a) => a.indexOf(v) === i).join(', ')}.`;
    }
    buildClarificationRequest(synthQuery) {
        if (synthQuery.context.intent === 'troubleshooting') {
            return "To help you troubleshoot this issue effectively, could you provide more details about:\n• What specific error messages you're seeing\n• When the issue started\n• What you were trying to do when it occurred";
        }
        return "To provide you with the most accurate information, could you tell me more about what specifically you're looking for?";
    }
    buildGeneralInfo(chunks) {
        if (chunks.length === 0)
            return "I'm here to help with any questions you have about our services and documentation.";
        return `Here's some general information that might be relevant:\n${chunks.slice(0, 2).map(chunk => `• ${this.extractKeySentence(chunk.content)}`).join('\n')}`;
    }
    buildReferencesSection(chunks) {
        if (chunks.length === 0)
            return '';
        const references = chunks.map((chunk, index) => {
            const source = chunk.metadata.title || chunk.metadata.source || 'Documentation';
            const type = chunk.metadata.type || 'resource';
            return `${index + 1}. ${source} (${type})`;
        }).slice(0, 5);
        return `\n**References:**\n${references.join('\n')}`;
    }
    buildFollowUpSection(synthQuery, conversation) {
        const followUps = [];
        if (synthQuery.context.urgency === 'high' || synthQuery.context.urgency === 'critical') {
            followUps.push("If this doesn't resolve your urgent issue, please escalate to our support team immediately.");
        }
        else {
            followUps.push("Is there anything else I can help clarify about this topic?");
        }
        if (conversation && conversation.context.ongoingIssues.length > 0) {
            followUps.push("I also noticed you had some ongoing issues - would you like me to check on those?");
        }
        return followUps.length > 0 ? `\n${followUps.join(' ')}` : '';
    }
    extractKeySentence(content) {
        if (!content)
            return '';
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
        return sentences[0]?.trim() || content.substring(0, 100) + '...';
    }
    async updateConversationMemory(synthQuery, response, ragResult) {
        const conversationId = synthQuery.context.conversationId ||
            `${synthQuery.context.userId}_${synthQuery.context.sessionId || 'default'}`;
        const conversation = this.conversationMemory.get(conversationId);
        if (!conversation)
            return;
        // Add to history
        conversation.history.push({
            turnNumber: conversation.metadata.totalTurns + 1,
            query: synthQuery.query,
            response: response.response.text,
            ragSources: ragResult.chunks.map(chunk => chunk.metadata.source),
            timestamp: new Date(),
        });
        // Update context
        conversation.context.previousQueries.push(synthQuery.query);
        if (conversation.context.previousQueries.length > 10) {
            conversation.context.previousQueries.shift();
        }
        conversation.context.lastPersonalityProfile = synthQuery.personalityConfig.profile;
        // Update metadata
        conversation.metadata.lastUpdated = new Date();
        conversation.metadata.totalTurns++;
        conversation.metadata.avgConfidence =
            (conversation.metadata.avgConfidence * (conversation.metadata.totalTurns - 1) + response.response.confidence) /
                conversation.metadata.totalTurns;
        // Update primary sources
        const allSources = ragResult.chunks.map(chunk => chunk.metadata.source);
        for (const source of allSources) {
            if (!conversation.metadata.primarySources.includes(source)) {
                conversation.metadata.primarySources.push(source);
            }
        }
        // Limit history size
        if (conversation.history.length > this.config.maxConversationTurns) {
            conversation.history.shift();
        }
    }
    async generateRecommendations(synthQuery, ragResult) {
        const nextActions = [];
        const relatedTopics = [];
        const furtherReading = [];
        // Extract recommendations from RAG chunks
        ragResult.chunks.forEach(chunk => {
            if (chunk.metadata.type === 'procedure' || chunk.content.toLowerCase().includes('next step')) {
                nextActions.push(this.extractKeySentence(chunk.content));
            }
            const topics = chunk.metadata.tags || [];
            relatedTopics.push(...topics);
            if (chunk.metadata.type === 'documentation' || chunk.metadata.type === 'knowledge_article') {
                furtherReading.push(chunk.metadata.title || chunk.metadata.source);
            }
        });
        return {
            nextActions: nextActions.slice(0, 3),
            relatedTopics: [...new Set(relatedTopics)].slice(0, 5),
            furtherReading: [...new Set(furtherReading)].slice(0, 3),
        };
    }
    getMemoryStats() {
        const conversations = Array.from(this.conversationMemory.values());
        return {
            totalConversations: conversations.length,
            activeConversations: conversations.filter(c => c.metadata.lastUpdated > new Date(Date.now() - 24 * 60 * 60 * 1000)).length,
            avgTurnsPerConversation: conversations.reduce((sum, c) => sum + c.metadata.totalTurns, 0) / conversations.length || 0,
            avgConfidence: conversations.reduce((sum, c) => sum + c.metadata.avgConfidence, 0) / conversations.length || 0,
            topSources: this.getTopSources(conversations),
        };
    }
    getTopSources(conversations) {
        const sourceCounts = new Map();
        conversations.forEach(conv => {
            conv.metadata.primarySources.forEach(source => {
                sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
            });
        });
        return Array.from(sourceCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([source]) => source);
    }
    startMemoryCleanup() {
        setInterval(() => {
            const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
            const toDelete = [];
            for (const [id, conversation] of this.conversationMemory.entries()) {
                if (conversation.metadata.lastUpdated < cutoff) {
                    toDelete.push(id);
                }
            }
            toDelete.forEach(id => this.conversationMemory.delete(id));
            if (toDelete.length > 0) {
                logger.info(`Cleaned up ${toDelete.length} old conversation memories`);
            }
        }, this.config.memoryCleanupInterval);
    }
    async shutdown() {
        logger.info('Shutting down Nova Synth RAG Integration...');
        this.isInitialized = false;
        logger.info('Nova Synth RAG Integration shutdown complete');
    }
}
// Export singleton instance
export const novaSynthRAG = new NovaSynthRAGIntegration();
