/**
 * Nova Conversational Interface - Multi-Channel Support
 *
 * Implements industry-standard conversational AI interface with support for
 * multiple channels (web, mobile, email, Slack, Teams) and rich interactions.
 *
 * Features:
 * - Multi-channel conversation management
 * - Rich message components (cards, forms, buttons)
 * - Contextual suggestions and quick replies
 * - Adaptive UI based on channel capabilities
 * - Real-time typing indicators and presence
 * - Message history and conversation persistence
 */
import { EventEmitter } from 'events';
import { logger } from '../logger.js';
import { novaAIAgent } from './nova-ai-agent-framework.js';
import crypto from 'crypto';
// Main Conversational Interface Class
export class NovaConversationalInterface extends EventEmitter {
    channels = new Map();
    sessions = new Map();
    messageTemplates = new Map();
    activeTyping = new Map();
    constructor() {
        super();
        this.initializeChannels();
        this.initializeMessageTemplates();
        this.startPresenceManager();
    }
    /**
     * Initialize supported channels and their capabilities
     */
    initializeChannels() {
        // Web Channel
        this.channels.set('web', {
            id: 'web',
            name: 'Web Interface',
            type: 'web',
            features: {
                richMessages: true,
                fileUpload: true,
                typing: true,
                presence: true,
                threading: false,
                reactions: true,
                formatting: true,
                forms: true,
                buttons: true,
                carousel: true,
                quickReplies: true
            },
            limitations: {
                maxMessageLength: 10000,
                maxAttachments: 10,
                supportedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png', 'gif'],
                rateLimits: {
                    messagesPerMinute: 30,
                    messagesPerHour: 300
                }
            }
        });
        // Mobile Channel
        this.channels.set('mobile', {
            id: 'mobile',
            name: 'Mobile App',
            type: 'mobile',
            features: {
                richMessages: true,
                fileUpload: true,
                typing: true,
                presence: true,
                threading: false,
                reactions: true,
                formatting: false,
                forms: true,
                buttons: true,
                carousel: true,
                quickReplies: true
            },
            limitations: {
                maxMessageLength: 5000,
                maxAttachments: 5,
                supportedFileTypes: ['pdf', 'jpg', 'png'],
                rateLimits: {
                    messagesPerMinute: 20,
                    messagesPerHour: 200
                }
            }
        });
        // Email Channel
        this.channels.set('email', {
            id: 'email',
            name: 'Email Integration',
            type: 'email',
            features: {
                richMessages: false,
                fileUpload: true,
                typing: false,
                presence: false,
                threading: true,
                reactions: false,
                formatting: true,
                forms: false,
                buttons: false,
                carousel: false,
                quickReplies: false
            },
            limitations: {
                maxMessageLength: 50000,
                maxAttachments: 20,
                supportedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png', 'zip'],
                rateLimits: {
                    messagesPerMinute: 5,
                    messagesPerHour: 50
                }
            }
        });
        // Slack Channel
        this.channels.set('slack', {
            id: 'slack',
            name: 'Slack Integration',
            type: 'slack',
            features: {
                richMessages: true,
                fileUpload: true,
                typing: true,
                presence: false,
                threading: true,
                reactions: true,
                formatting: true,
                forms: false,
                buttons: true,
                carousel: false,
                quickReplies: true
            },
            limitations: {
                maxMessageLength: 4000,
                maxAttachments: 10,
                supportedFileTypes: ['pdf', 'doc', 'txt', 'jpg', 'png'],
                rateLimits: {
                    messagesPerMinute: 1,
                    messagesPerHour: 100
                }
            }
        });
        // Microsoft Teams Channel
        this.channels.set('teams', {
            id: 'teams',
            name: 'Microsoft Teams',
            type: 'teams',
            features: {
                richMessages: true,
                fileUpload: true,
                typing: true,
                presence: false,
                threading: true,
                reactions: true,
                formatting: true,
                forms: true,
                buttons: true,
                carousel: true,
                quickReplies: true
            },
            limitations: {
                maxMessageLength: 8000,
                maxAttachments: 10,
                supportedFileTypes: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'png'],
                rateLimits: {
                    messagesPerMinute: 10,
                    messagesPerHour: 150
                }
            }
        });
        logger.info('Conversational interface channels initialized', {
            channelCount: this.channels.size,
            channels: Array.from(this.channels.keys())
        });
    }
    /**
     * Initialize message templates for different scenarios
     */
    initializeMessageTemplates() {
        // Greeting Templates
        this.messageTemplates.set('greeting_general', {
            id: 'greeting_general',
            name: 'General Greeting',
            category: 'greeting',
            content: 'Hello {{userName}}! I\'m Cosmo, your AI assistant. I can help you with incidents, service requests, and finding information. How can I assist you today?',
            richContent: {
                type: 'quick_replies',
                items: [
                    { label: '🚨 Report Incident', value: 'report_incident' },
                    { label: '📋 Request Service', value: 'request_service' },
                    { label: '📚 Search Knowledge', value: 'search_knowledge' },
                    { label: '📊 Check Status', value: 'check_status' }
                ]
            },
            variables: ['userName'],
            channels: ['web', 'mobile', 'slack', 'teams'],
            personalization: {
                tone: 'casual',
                context: {}
            }
        });
        // Escalation Templates
        this.messageTemplates.set('escalation_human', {
            id: 'escalation_human',
            name: 'Human Escalation',
            category: 'escalation',
            content: 'I\'m connecting you with a human agent who can better assist with your {{issueType}}. Your reference number is {{ticketNumber}}. A specialist will be with you shortly.',
            richContent: {
                type: 'card',
                title: 'Escalated to Human Agent',
                subtitle: 'Reference: {{ticketNumber}}',
                actions: [
                    { type: 'button', label: 'View Ticket Details', action: 'view_ticket' },
                    { type: 'button', label: 'Provide Feedback', action: 'feedback' }
                ]
            },
            variables: ['issueType', 'ticketNumber'],
            channels: ['web', 'mobile', 'email', 'slack', 'teams'],
            personalization: {
                tone: 'empathetic',
                context: {}
            }
        });
        // Resolution Templates
        this.messageTemplates.set('resolution_success', {
            id: 'resolution_success',
            name: 'Successful Resolution',
            category: 'resolution',
            content: 'Great! I\'ve successfully {{actionTaken}}. Your {{itemType}} is now {{status}}. Is there anything else I can help you with?',
            richContent: {
                type: 'buttons',
                items: [
                    { label: '✅ All Set', value: 'conversation_complete' },
                    { label: '❓ I have another question', value: 'new_question' },
                    { label: '📝 Provide Feedback', value: 'feedback' }
                ]
            },
            variables: ['actionTaken', 'itemType', 'status'],
            channels: ['web', 'mobile', 'slack', 'teams'],
            personalization: {
                tone: 'casual',
                context: {}
            }
        });
        // Error Templates
        this.messageTemplates.set('error_general', {
            id: 'error_general',
            name: 'General Error',
            category: 'error',
            content: 'I apologize, but I encountered an issue while processing your request. Let me try a different approach or connect you with a human agent.',
            richContent: {
                type: 'buttons',
                items: [
                    { label: '🔄 Try Again', value: 'retry_request' },
                    { label: '👤 Connect to Human', value: 'escalate_human' },
                    { label: '📞 Call Support', value: 'call_support' }
                ]
            },
            variables: [],
            channels: ['web', 'mobile', 'email', 'slack', 'teams'],
            personalization: {
                tone: 'empathetic',
                context: {}
            }
        });
        logger.info('Message templates initialized', {
            templateCount: this.messageTemplates.size
        });
    }
    /**
     * Process incoming message and generate appropriate response
     */
    async processMessage(message, context) {
        try {
            const channel = this.channels.get(context.channelId);
            if (!channel) {
                throw new Error(`Unsupported channel: ${context.channelId}`);
            }
            // Get or create session
            const session = await this.getOrCreateSession(context, channel);
            // Check rate limits
            await this.checkRateLimit(session);
            // Show typing indicator
            this.startTyping(session.id);
            // Process with AI Agent Framework
            const agentResponse = await novaAIAgent.processMessage(message, {
                userId: context.userId,
                tenantId: context.tenantId,
                channel: context.channelId,
                sessionId: session.id,
                conversationId: session.id
            });
            // Adapt response for channel capabilities
            const adaptedMessages = await this.adaptResponseForChannel([agentResponse.response], channel);
            // Generate contextual suggestions
            const suggestions = await this.generateSuggestions(agentResponse.conversation, agentResponse.response);
            // Stop typing indicator
            this.stopTyping(session.id);
            // Update session activity
            session.lastActivity = new Date();
            this.sessions.set(session.id, session);
            return {
                messages: adaptedMessages,
                suggestions,
                session,
                actions: agentResponse.actions
            };
        }
        catch (error) {
            this.stopTyping(context.sessionId || '');
            logger.error('Error processing message in conversational interface', {
                error: error.message,
                userId: context.userId,
                channelId: context.channelId
            });
            throw error;
        }
    }
    /**
     * Adapt message content for specific channel capabilities
     */
    async adaptResponseForChannel(messages, channel) {
        const adaptedMessages = [];
        for (const message of messages) {
            const adapted = { ...message };
            // Truncate message if too long for channel
            if (adapted.content.length > channel.limitations.maxMessageLength) {
                adapted.content = adapted.content.substring(0, channel.limitations.maxMessageLength - 3) + '...';
            }
            // Remove rich content if not supported
            if (!channel.features.richMessages && adapted.richContent) {
                // Convert rich content to plain text
                if (adapted.richContent.type === 'buttons' || adapted.richContent.type === 'quick_replies') {
                    const options = adapted.richContent.items?.map((item, index) => `${index + 1}. ${item.label || item.value}`).join('\n') || '';
                    adapted.content += '\n\nOptions:\n' + options;
                }
                else if (adapted.richContent.type === 'form') {
                    adapted.content += '\n\nPlease provide the following information in your next message:';
                    const fields = adapted.richContent.items?.map((item) => `- ${item.label}${item.required ? ' (required)' : ''}`).join('\n') || '';
                    adapted.content += '\n' + fields;
                }
                delete adapted.richContent;
            }
            // Remove unsupported rich content features
            if (adapted.richContent) {
                if (!channel.features.buttons && adapted.richContent.type === 'buttons') {
                    adapted.richContent.type = 'list';
                }
                if (!channel.features.forms && adapted.richContent.type === 'form') {
                    adapted.richContent.type = 'list';
                }
                if (!channel.features.carousel && adapted.richContent.type === 'carousel') {
                    adapted.richContent.type = 'list';
                }
            }
            adaptedMessages.push(adapted);
        }
        return adaptedMessages;
    }
    /**
     * Generate contextual suggestions based on conversation state
     */
    async generateSuggestions(conversation, lastMessage) {
        const suggestions = [];
        // Intent-based suggestions
        if (lastMessage.intent) {
            switch (lastMessage.intent.category) {
                case 'incident':
                    suggestions.push({
                        id: crypto.randomUUID(),
                        type: 'action',
                        text: 'Check similar incidents',
                        confidence: 0.8,
                        category: 'incident',
                        metadata: { action: 'search_similar_incidents' }
                    });
                    suggestions.push({
                        id: crypto.randomUUID(),
                        type: 'response',
                        text: 'Escalate to on-call engineer',
                        confidence: 0.7,
                        category: 'incident',
                        metadata: { action: 'escalate_oncall' }
                    });
                    break;
                case 'service_request':
                    suggestions.push({
                        id: crypto.randomUUID(),
                        type: 'action',
                        text: 'View service catalog',
                        confidence: 0.9,
                        category: 'service_request',
                        metadata: { action: 'view_catalog' }
                    });
                    suggestions.push({
                        id: crypto.randomUUID(),
                        type: 'response',
                        text: 'Check approval status',
                        confidence: 0.6,
                        category: 'service_request',
                        metadata: { action: 'check_approvals' }
                    });
                    break;
                case 'knowledge':
                    suggestions.push({
                        id: crypto.randomUUID(),
                        type: 'action',
                        text: 'Search related articles',
                        confidence: 0.85,
                        category: 'knowledge',
                        metadata: { action: 'search_related' }
                    });
                    suggestions.push({
                        id: crypto.randomUUID(),
                        type: 'response',
                        text: 'Contact subject matter expert',
                        confidence: 0.5,
                        category: 'knowledge',
                        metadata: { action: 'contact_sme' }
                    });
                    break;
            }
        }
        // General suggestions
        suggestions.push({
            id: crypto.randomUUID(),
            type: 'escalation',
            text: 'Connect to human agent',
            confidence: 0.6,
            category: 'general',
            metadata: { action: 'escalate_human' }
        });
        return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
    }
    /**
     * Get or create conversation session
     */
    async getOrCreateSession(context, channel) {
        const sessionId = context.sessionId || crypto.randomUUID();
        if (this.sessions.has(sessionId)) {
            return this.sessions.get(sessionId);
        }
        const session = {
            id: sessionId,
            userId: context.userId,
            tenantId: context.tenantId,
            channel,
            startTime: new Date(),
            lastActivity: new Date(),
            isActive: true,
            metadata: context.metadata || {},
            preferences: {
                language: 'en',
                timezone: 'UTC',
                theme: 'auto',
                messageFormat: 'html',
                notifications: true
            }
        };
        this.sessions.set(sessionId, session);
        return session;
    }
    /**
     * Check rate limits for session
     */
    async checkRateLimit(session) {
        // Implement rate limiting logic based on channel capabilities
        const limits = session.channel.limitations.rateLimits;
        // This would typically check against a rate limiting store (Redis, etc.)
        // For now, we'll just log the check
        logger.debug('Rate limit check', {
            sessionId: session.id,
            limits
        });
    }
    /**
     * Start typing indicator for session
     */
    startTyping(sessionId) {
        this.activeTyping.set(sessionId, new Date());
        this.emit('typing_start', { sessionId });
    }
    /**
     * Stop typing indicator for session
     */
    stopTyping(sessionId) {
        this.activeTyping.delete(sessionId);
        this.emit('typing_stop', { sessionId });
    }
    /**
     * Start presence manager for typing indicators
     */
    startPresenceManager() {
        setInterval(() => {
            const now = new Date();
            const expiredSessions = [];
            for (const [sessionId, startTime] of this.activeTyping.entries()) {
                // Auto-stop typing after 10 seconds
                if (now.getTime() - startTime.getTime() > 10000) {
                    expiredSessions.push(sessionId);
                }
            }
            for (const sessionId of expiredSessions) {
                this.stopTyping(sessionId);
            }
        }, 1000);
    }
    /**
     * Render message template with variables
     */
    async renderTemplate(templateId, variables, channelId) {
        const template = this.messageTemplates.get(templateId);
        if (!template) {
            throw new Error(`Template '${templateId}' not found`);
        }
        const channel = this.channels.get(channelId);
        if (!channel) {
            throw new Error(`Channel '${channelId}' not found`);
        }
        // Replace variables in content
        let content = template.content;
        for (const [key, value] of Object.entries(variables)) {
            content = content.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        }
        // Replace variables in rich content
        let richContent = template.richContent;
        if (richContent) {
            richContent = JSON.parse(JSON.stringify(richContent));
            const replaceInObject = (obj) => {
                for (const [key, value] of Object.entries(obj)) {
                    if (typeof value === 'string') {
                        obj[key] = value.replace(/{{(\w+)}}/g, (match, varName) => String(variables[varName] || match));
                    }
                    else if (typeof value === 'object' && value !== null) {
                        replaceInObject(value);
                    }
                }
            };
            replaceInObject(richContent);
        }
        const message = {
            id: crypto.randomUUID(),
            type: 'agent',
            content,
            timestamp: new Date(),
            richContent,
            metadata: {
                templateId,
                variables,
                personalization: template.personalization
            }
        };
        // Adapt for channel
        const [adaptedMessage] = await this.adaptResponseForChannel([message], channel);
        return adaptedMessage;
    }
    /**
     * Get channel capabilities
     */
    getChannelCapabilities(channelId) {
        return this.channels.get(channelId);
    }
    /**
     * Get all supported channels
     */
    getSupportedChannels() {
        return Array.from(this.channels.values());
    }
    /**
     * Get active sessions
     */
    getActiveSessions(userId, tenantId) {
        let sessions = Array.from(this.sessions.values()).filter(s => s.isActive);
        if (userId) {
            sessions = sessions.filter(s => s.userId === userId);
        }
        if (tenantId) {
            sessions = sessions.filter(s => s.tenantId === tenantId);
        }
        return sessions;
    }
    /**
     * Close conversation session
     */
    async closeSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.isActive = false;
            this.sessions.set(sessionId, session);
            this.stopTyping(sessionId);
            this.emit('session_closed', { sessionId, session });
            logger.info('Conversation session closed', {
                sessionId,
                duration: Date.now() - session.startTime.getTime(),
                messageCount: 0 // Would track message count in production
            });
        }
    }
}
// Export singleton instance
export const novaConversationalInterface = new NovaConversationalInterface();
logger.info('Nova Conversational Interface initialized');
