import { getUser360Client } from '../lib/database-clients.js';
import { logger } from '../logger.js';
import { EventEmitter } from 'events';
import crypto from 'crypto';

const user360PrismaPromise = getUser360Client();

/**
 * User Interaction Service
 * 
 * Centralized service for tracking and managing all user interactions across
 * emails, AI chats, calls, and other communication channels. Provides unified
 * interaction timeline and AI conversation memory for enhanced user experience.
 * 
 * Features:
 * - Unified interaction tracking across all channels
 * - Conversation session management and threading
 * - AI conversation memory for contextual responses
 * - Admin troubleshooting and audit trails
 * - Real-time interaction analytics
 * - Smart categorization and routing
 */
class UserInteractionService extends EventEmitter {
  constructor() {
    super();
    this.isInitialized = false;
    this.memoryCache = new Map(); // In-memory cache for active conversations
    this.sessionTimeouts = new Map(); // Session timeout tracking
  }

  /**
   * Initialize the service
   */
  async initialize() {
    try {
      await this.cleanupExpiredSessions();
      await this.loadActiveConversations();
      
      // Set up periodic cleanup (every 30 minutes)
      this.cleanupInterval = setInterval(() => {
        this.cleanupExpiredSessions();
      }, 30 * 60 * 1000);
      
      this.isInitialized = true;
      logger.info('User Interaction Service initialized successfully');
    } catch (error) {
      logger.error('Error initializing User Interaction Service:', error);
      throw error;
    }
  }

  /**
   * Create or get conversation session
   */
  async createOrGetSession({
    userId,
    sessionType,
    channel,
    externalId = null,
    subject = null,
    context = null,
    category = null,
    priority = 'NORMAL'
  }) {
    try {
      // Try to find existing session by external ID or recent session
      let session = null;
      
      const user360Prisma = await user360PrismaPromise;
      if (externalId) {
        session = await user360Prisma.conversationSession.findFirst({
          where: {
            externalId,
            status: { in: ['ACTIVE', 'WAITING_RESPONSE'] }
          },
          include: {
            interactions: {
              orderBy: { timestamp: 'desc' },
              take: 10
            }
          }
        });
      }
      
      // If no session found, look for recent active session
      if (!session) {
        session = await user360Prisma.conversationSession.findFirst({
          where: {
            userId,
            sessionType,
            channel,
            status: { in: ['ACTIVE', 'WAITING_RESPONSE'] },
            lastActivityAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Within last 24 hours
            }
          },
          orderBy: { lastActivityAt: 'desc' },
          include: {
            interactions: {
              orderBy: { timestamp: 'desc' },
              take: 10
            }
          }
        });
      }
      
      // Create new session if none found
      if (!session) {
        // Generate secure session tracking identifiers using crypto
        const sessionTrackingId = crypto.randomUUID();
        const sessionSecretHash = crypto.createHash('sha256')
          .update(`${userId}-${sessionType}-${channel}-${Date.now()}`)
          .digest('hex').substring(0, 32);
        
        logger.info(`Creating new session with tracking ID: ${sessionTrackingId} for user: ${userId}`);
        
        // Enhanced context with security metadata
        const enhancedContext = {
          ...(context || {}),
          sessionTrackingId,
          sessionSecretHash,
          securityLevel: 'STANDARD',
          createdWithCrypto: true,
          sessionIntegrity: crypto.createHash('md5')
            .update(`${userId}${sessionType}${channel}`)
            .digest('hex')
        };
        
        session = await user360Prisma.conversationSession.create({
          data: {
            userId,
            sessionType,
            channel,
            externalId,
            subject,
            context: enhancedContext,
            category,
            priority,
            status: 'ACTIVE',
            participantIds: [userId],
            startedAt: new Date(),
            lastActivityAt: new Date()
          },
          include: {
            interactions: true
          }
        });
        
        logger.info(`Created new conversation session: ${session.id} for user: ${userId}`);
        this.emit('sessionCreated', { session, userId });
      } else {
        // Update last activity time
        session = await user360Prisma.conversationSession.update({
          where: { id: session.id },
          data: { lastActivityAt: new Date() },
          include: {
            interactions: {
              orderBy: { timestamp: 'desc' },
              take: 10
            }
          }
        });
      }
      
      return session;
    } catch (error) {
      logger.error('Error creating/getting conversation session:', error);
      throw error;
    }
  }

  /**
   * Record a new user interaction
   */
  async recordInteraction({
    userId,
    sessionId = null,
    interactionType,
    channel,
    direction,
    content = null,
    subject = null,
    fromUserId = null,
    toUserIds = [],
    externalId = null,
    isAIGenerated = false,
    aiPersonality = null,
    aiConfidence = null,
    aiIntent = null,
    aiSentiment = null,
    category = null,
    priority = 'NORMAL',
    urgency = 'LOW',
    businessImpact = 'LOW',
    hasAttachments = false,
    attachmentCount = 0,
    attachmentTypes = [],
    metadata = null,
    tags = [],
    requiresResponse = false,
    responseDeadline = null
  }) {
    try {
      // Generate secure interaction tracking ID using crypto
      const interactionTrackingId = crypto.randomUUID();
      const interactionHash = crypto.createHash('sha256')
        .update(`${userId}-${sessionId}-${interactionType}-${Date.now()}`)
        .digest('hex').substring(0, 16);
      
      logger.info(`Recording interaction with tracking ID: ${interactionTrackingId} and hash: ${interactionHash} for user: ${userId}`);
      
      // Generate content hash for deduplication and integrity verification
      const contentHash = content ? 
        crypto.createHash('md5').update(content).digest('hex') : null;
      
      // Generate AI summary if content provided
      let summary = null;
      if (content && content.length > 200) {
        summary = await this.generateContentSummary(content);
      }
      
      // Extract keywords and detect sentiment if not provided
      const keywords = this.extractKeywords(content || subject || '');
      if (!aiSentiment && (content || subject)) {
        aiSentiment = await this.detectSentiment(content || subject);
      }
      
      // Determine processing requirements
      const containsPII = this.detectPII(content || '');
      const isConfidential = this.detectConfidentialContent(content || '');
      
      // Enhanced metadata with cryptographic tracking
      const enhancedMetadata = {
        ...(metadata || {}),
        trackingId: interactionTrackingId,
        contentHash: contentHash,
        interactionHash: interactionHash,
        securityLevel: isConfidential ? 'HIGH' : containsPII ? 'MEDIUM' : 'LOW',
        processingFlags: {
          containsPII,
          isConfidential,
          requiresEncryption: isConfidential || containsPII
        }
      };
      
      const user360Prisma = await user360PrismaPromise;
      const interaction = await user360Prisma.userInteraction.create({
        data: {
          userId,
          sessionId,
          interactionType,
          channel,
          direction,
          content,
          summary,
          subject,
          fromUserId,
          toUserIds,
          externalId,
          isAIGenerated,
          aiPersonality,
          aiConfidence,
          aiIntent,
          aiSentiment,
          category,
          priority,
          urgency,
          businessImpact,
          hasAttachments,
          attachmentCount,
          attachmentTypes,
          containsPII,
          isConfidential,
          metadata: enhancedMetadata,
          tags,
          keywords,
          requiresResponse,
          responseDeadline,
          timestamp: new Date(),
          processingStatus: 'PROCESSED'
        }
      });
      
      // Update session statistics if session exists
      if (sessionId) {
        await this.updateSessionMetrics(sessionId);
      }
      
      // Update AI conversation memory if AI-related
      if (isAIGenerated || aiPersonality) {
        await this.updateAIMemory(userId, interaction, aiPersonality);
      }
      
      logger.info(`Recorded interaction: ${interaction.id} for user: ${userId}`);
      this.emit('interactionRecorded', { interaction, userId, sessionId });
      
      return interaction;
    } catch (error) {
      logger.error('Error recording user interaction:', error);
      throw error;
    }
  }

  /**
   * Get user interaction timeline
   */
  async getUserInteractionTimeline(userId, options = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        channel = null,
        interactionType = null,
        startDate = null,
        endDate = null,
        includeAI = true,
        includeSystem = false
      } = options;
      
      const user360Prisma = await user360PrismaPromise;
      
      const where = {
        userId,
        ...(channel && { channel }),
        ...(interactionType && { interactionType }),
        ...(startDate && endDate && {
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        }),
        ...(!includeAI && { isAIGenerated: false }),
        ...(!includeSystem && { 
          direction: { not: 'SYSTEM_GENERATED' }
        })
      };
      
      const interactions = await user360Prisma.userInteraction.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
        include: {
          session: {
            select: {
              id: true,
              sessionType: true,
              subject: true,
              status: true,
              category: true
            }
          }
        }
      });
      
      const total = await user360Prisma.userInteraction.count({ where });
      
      return {
        interactions,
        total,
        hasMore: offset + limit < total
      };
    } catch (error) {
      logger.error('Error getting user interaction timeline:', error);
      throw error;
    }
  }

  /**
   * Get conversation session with full history
   */
  async getConversationSession(sessionId, includeFullHistory = false) {
    try {
      const user360Prisma = await user360PrismaPromise;
      const session = await user360Prisma.conversationSession.findUnique({
        where: { id: sessionId },
        include: {
          user: {
            select: {
              id: true,
              helixUid: true,
              email: true,
              firstName: true,
              lastName: true,
              displayName: true
            }
          },
          interactions: {
            orderBy: { timestamp: 'asc' },
            ...(includeFullHistory ? {} : { take: 100 })
          }
        }
      });
      
      if (!session) {
        throw new Error(`Conversation session not found: ${sessionId}`);
      }
      
      return session;
    } catch (error) {
      logger.error('Error getting conversation session:', error);
      throw error;
    }
  }

  /**
   * Get AI conversation memory for context
   */
  async getAIMemory(userId, aiPersonality = 'default', conversationId = null) {
    try {
      const user360Prisma = await user360PrismaPromise;
      
      const where = {
        userId,
        aiPersonality,
        isActive: true,
        ...(conversationId && { conversationId })
      };
      
      const memory = await user360Prisma.aIConversationMemory.findFirst({
        where,
        orderBy: { lastAccessedAt: 'desc' }
      });
      
      if (memory) {
        // Update last accessed time
        await user360Prisma.aIConversationMemory.update({
          where: { id: memory.id },
          data: { lastAccessedAt: new Date() }
        });
      }
      
      return memory;
    } catch (error) {
      logger.error('Error getting AI memory:', error);
      throw error;
    }
  }

  /**
   * Update AI conversation memory
   */
  async updateAIMemory(userId, interaction, aiPersonality = 'default') {
    try {
      const user360Prisma = await user360PrismaPromise;
      const conversationId = interaction.sessionId || `single_${interaction.id}`;
      
      // Get existing memory or create new
      let memory = await user360Prisma.aIConversationMemory.findUnique({
        where: {
          userId_conversationId_aiPersonality: {
            userId,
            conversationId,
            aiPersonality
          }
        }
      });
      
      const newContext = {
        lastInteraction: {
          id: interaction.id,
          type: interaction.interactionType,
          content: interaction.content,
          summary: interaction.summary,
          timestamp: interaction.timestamp,
          sentiment: interaction.aiSentiment,
          intent: interaction.aiIntent
        },
        ...(memory?.context || {})
      };
      
      // Extract user preferences from interaction
      const preferences = this.extractUserPreferences(interaction);
      
      if (memory) {
        memory = await user360Prisma.aIConversationMemory.update({
          where: { id: memory.id },
          data: {
            context: newContext,
            userPreferences: {
              ...memory.userPreferences,
              ...preferences
            },
            interactionCount: { increment: 1 },
            lastInteractionId: interaction.id,
            lastAccessedAt: new Date()
          }
        });
      } else {
        memory = await user360Prisma.aIConversationMemory.create({
          data: {
            userId,
            conversationId,
            aiPersonality,
            context: newContext,
            userPreferences: preferences,
            interactionCount: 1,
            lastInteractionId: interaction.id,
            memoryStrength: 1.0,
            lastAccessedAt: new Date()
          }
        });
      }
      
      return memory;
    } catch (error) {
      logger.error('Error updating AI memory:', error);
      throw error;
    }
  }

  /**
   * Search user interactions
   */
  async searchInteractions(query, options = {}) {
    try {
      const user360Prisma = await user360PrismaPromise;
      const {
        userId = null,
        channel = null,
        limit = 20,
        offset = 0,
        startDate = null,
        endDate = null
      } = options;
      
      const where = {
        ...(userId && { userId }),
        ...(channel && { channel }),
        ...(startDate && endDate && {
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        }),
        OR: [
          { content: { contains: query, mode: 'insensitive' } },
          { subject: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } },
          { keywords: { has: query.toLowerCase() } },
          { tags: { has: query.toLowerCase() } }
        ]
      };
      
      const interactions = await user360Prisma.userInteraction.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              helixUid: true,
              email: true,
              displayName: true
            }
          },
          session: {
            select: {
              id: true,
              sessionType: true,
              subject: true
            }
          }
        }
      });
      
      const total = await user360Prisma.userInteraction.count({ where });
      
      return {
        interactions,
        total,
        hasMore: offset + limit < total
      };
    } catch (error) {
      logger.error('Error searching interactions:', error);
      throw error;
    }
  }

  /**
   * Get interaction statistics for admin dashboard
   */
  async getInteractionStats(timeframe = '7d') {
    try {
      const user360Prisma = await user360PrismaPromise;
      const startDate = this.getTimeframeStartDate(timeframe);
      
      const [
        totalInteractions,
        emailInteractions,
        chatInteractions,
        aiInteractions,
        pendingResponses,
        escalatedSessions,
        avgResponseTime,
        satisfactionScores
      ] = await Promise.all([
        // Total interactions
        user360Prisma.userInteraction.count({
          where: { timestamp: { gte: startDate } }
        }),
        
        // Email interactions
        user360Prisma.userInteraction.count({
          where: {
            channel: 'EMAIL',
            timestamp: { gte: startDate }
          }
        }),
        
        // Chat interactions
        user360Prisma.userInteraction.count({
          where: {
            channel: { in: ['WEB_CHAT', 'MOBILE_CHAT'] },
            timestamp: { gte: startDate }
          }
        }),
        
        // AI-generated interactions
        user360Prisma.userInteraction.count({
          where: {
            isAIGenerated: true,
            timestamp: { gte: startDate }
          }
        }),
        
        // Pending responses
        user360Prisma.userInteraction.count({
          where: {
            requiresResponse: true,
            respondedAt: null,
            timestamp: { gte: startDate }
          }
        }),
        
        // Escalated sessions
        user360Prisma.conversationSession.count({
          where: {
            status: 'ESCALATED',
            startedAt: { gte: startDate }
          }
        }),
        
        // Average response time
        user360Prisma.userInteraction.aggregate({
          where: {
            responseTime: { not: null },
            timestamp: { gte: startDate }
          },
          _avg: { responseTime: true }
        }),
        
        // Satisfaction scores
        user360Prisma.userInteraction.aggregate({
          where: {
            satisfactionScore: { not: null },
            timestamp: { gte: startDate }
          },
          _avg: { satisfactionScore: true },
          _count: { satisfactionScore: true }
        })
      ]);
      
      return {
        totalInteractions,
        byChannel: {
          email: emailInteractions,
          chat: chatInteractions,
          ai: aiInteractions
        },
        pendingResponses,
        escalatedSessions,
        avgResponseTime: avgResponseTime._avg.responseTime || 0,
        satisfaction: {
          avgScore: satisfactionScores._avg.satisfactionScore || 0,
          totalRatings: satisfactionScores._count.satisfactionScore || 0
        },
        timeframe
      };
    } catch (error) {
      logger.error('Error getting interaction stats:', error);
      throw error;
    }
  }

  /**
   * Close conversation session
   */
  async closeSession(sessionId, resolution = null, satisfactionScore = null) {
    try {
      const user360Prisma = await user360PrismaPromise;
      const session = await user360Prisma.conversationSession.update({
        where: { id: sessionId },
        data: {
          status: 'CLOSED',
          endedAt: new Date(),
          ...(satisfactionScore && { satisfactionScore })
        }
      });
      
      // Add resolution interaction if provided
      if (resolution) {
        await this.recordInteraction({
          userId: session.userId,
          sessionId: sessionId,
          interactionType: 'RESOLUTION',
          channel: session.channel,
          direction: 'INTERNAL',
          content: resolution,
          isResolved: true,
          resolvedAt: new Date()
        });
      }
      
      this.emit('sessionClosed', { session, resolution, satisfactionScore });
      return session;
    } catch (error) {
      logger.error('Error closing session:', error);
      throw error;
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Update session metrics after new interaction
   */
  async updateSessionMetrics(sessionId) {
    try {
      const user360Prisma = await user360PrismaPromise;
      const interactions = await user360Prisma.userInteraction.findMany({
        where: { sessionId },
        orderBy: { timestamp: 'asc' }
      });
      
      const responseTimes = interactions
        .filter(i => i.responseTime !== null)
        .map(i => i.responseTime);
      
      const avgResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : null;
      
      await user360Prisma.conversationSession.update({
        where: { id: sessionId },
        data: {
          totalInteractions: interactions.length,
          avgResponseTime,
          lastActivityAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Error updating session metrics:', error);
    }
  }

  /**
   * Generate AI summary of content
   */
  async generateContentSummary(content) {
    try {
      // Simple extractive summary for now
      // In production, this would use AI service
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
      if (sentences.length <= 2) return content.substring(0, 200);
      
      // Take first and most relevant sentences
      return sentences.slice(0, 2).join('. ').substring(0, 200) + '...';
    } catch (error) {
      logger.error('Error generating content summary:', error);
      return content.substring(0, 200) + '...';
    }
  }

  /**
   * Extract keywords from content
   */
  extractKeywords(text) {
    try {
      const commonWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'will', 'be']);
      const words = text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.has(word));
      
      // Get word frequency
      const frequency = {};
      words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
      });
      
      // Return top 10 most frequent words
      return Object.entries(frequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([word]) => word);
    } catch (error) {
      logger.error('Error extracting keywords:', error);
      return [];
    }
  }

  /**
   * Detect sentiment in text
   */
  async detectSentiment(text) {
    try {
      // Simple sentiment detection
      const positiveWords = ['good', 'great', 'excellent', 'happy', 'satisfied', 'love', 'perfect', 'amazing'];
      const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'problem', 'issue', 'broken'];
      
      const lowerText = text.toLowerCase();
      const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
      const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
      
      if (positiveCount > negativeCount) return 'Positive';
      if (negativeCount > positiveCount) return 'Negative';
      return 'Neutral';
    } catch (error) {
      logger.error('Error detecting sentiment:', error);
      return 'Neutral';
    }
  }

  /**
   * Detect PII in content
   */
  detectPII(content) {
    try {
      const piiPatterns = [
        /\b\d{3}-?\d{2}-?\d{4}\b/, // SSN
        /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, // Credit card
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
        /\b\d{3}[- ]?\d{3}[- ]?\d{4}\b/ // Phone number
      ];
      
      return piiPatterns.some(pattern => pattern.test(content));
    } catch (error) {
      logger.error('Error detecting PII:', error);
      return false;
    }
  }

  /**
   * Detect confidential content
   */
  detectConfidentialContent(content) {
    try {
      const confidentialKeywords = [
        'confidential', 'secret', 'private', 'internal', 'restricted',
        'password', 'credential', 'token', 'api key'
      ];
      
      const lowerContent = content.toLowerCase();
      return confidentialKeywords.some(keyword => lowerContent.includes(keyword));
    } catch (error) {
      logger.error('Error detecting confidential content:', error);
      return false;
    }
  }

  /**
   * Extract user preferences from interaction
   */
  extractUserPreferences(interaction) {
    try {
      const preferences = {};
      
      // Preferred communication time
      const hour = interaction.timestamp.getHours();
      if (hour < 12) preferences.preferredTime = 'morning';
      else if (hour < 17) preferences.preferredTime = 'afternoon';
      else preferences.preferredTime = 'evening';
      
      // Communication style based on content
      if (interaction.content) {
        const contentLength = interaction.content.length;
        if (contentLength < 100) preferences.communicationStyle = 'brief';
        else if (contentLength < 500) preferences.communicationStyle = 'moderate';
        else preferences.communicationStyle = 'detailed';
      }
      
      // Preferred channel
      preferences.preferredChannel = interaction.channel;
      
      return preferences;
    } catch (error) {
      logger.error('Error extracting user preferences:', error);
      return {};
    }
  }

  /**
   * Get start date for timeframe
   */
  getTimeframeStartDate(timeframe) {
    const now = new Date();
    switch (timeframe) {
      case '1d': return new Date(now - 24 * 60 * 60 * 1000);
      case '7d': return new Date(now - 7 * 24 * 60 * 60 * 1000);
      case '30d': return new Date(now - 30 * 24 * 60 * 60 * 1000);
      case '90d': return new Date(now - 90 * 24 * 60 * 60 * 1000);
      default: return new Date(now - 7 * 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Load active conversations into memory cache
   */
  async loadActiveConversations() {
    try {
      const user360Prisma = await user360PrismaPromise;
      const activeSessions = await user360Prisma.conversationSession.findMany({
        where: {
          status: { in: ['ACTIVE', 'WAITING_RESPONSE'] },
          lastActivityAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        include: {
          interactions: {
            orderBy: { timestamp: 'desc' },
            take: 5
          }
        }
      });
      
      activeSessions.forEach(session => {
        this.memoryCache.set(session.id, session);
      });
      
      logger.info(`Loaded ${activeSessions.length} active conversation sessions`);
    } catch (error) {
      logger.error('Error loading active conversations:', error);
    }
  }

  /**
   * Cleanup expired sessions and memories
   */
  async cleanupExpiredSessions() {
    try {
      const user360Prisma = await user360PrismaPromise;
      const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      
      // Mark old sessions as abandoned
      await user360Prisma.conversationSession.updateMany({
        where: {
          status: { in: ['ACTIVE', 'WAITING_RESPONSE'] },
          lastActivityAt: { lt: cutoffDate }
        },
        data: { status: 'ABANDONED' }
      });
      
      // Expire old AI memories
      await user360Prisma.aIConversationMemory.updateMany({
        where: {
          lastAccessedAt: { lt: cutoffDate },
          isActive: true
        },
        data: { isActive: false }
      });
      
      logger.info('Cleaned up expired sessions and memories');
    } catch (error) {
      logger.error('Error cleaning up expired sessions:', error);
    }
  }

  /**
   * Shutdown service
   */
  async shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.memoryCache.clear();
    this.sessionTimeouts.clear();
    
    const user360Prisma = await user360PrismaPromise;
    await user360Prisma.$disconnect();
    logger.info('User Interaction Service shut down');
  }
}

export const userInteractionService = new UserInteractionService();
export default userInteractionService;
