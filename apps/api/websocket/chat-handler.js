import { logger } from '../logger.js';
import { prisma } from '../db.js';

/**
 * Live Chat WebSocket Handler
 * Handles real-time chat for Self-Service Portal support
 */

export class ChatWebSocketHandler {
  constructor(io) {
    this.io = io;
    this.chatNamespace = io.of('/chat');
    this.activeSessions = new Map(); // Track active chat sessions
    this.setupHandlers();
  }

  setupHandlers() {
    this.chatNamespace.on('connection', (socket) => {
      logger.info(`Chat connected: ${socket.id} (User: ${socket.userName || 'anonymous'})`);

      // Join user to their personal chat room
      if (socket.userId) {
        const userRoom = `chat_user_${socket.userId}`;
        socket.join(userRoom);
        socket.userRoom = userRoom;
      }

      // Handle joining a chat session
      socket.on('join_session', async (data) => {
        try {
          const { sessionId, ticketId } = data;

          if (!sessionId) {
            socket.emit('error', { message: 'Session ID required' });
            return;
          }

          // Join the session room
          socket.join(`chat_session_${sessionId}`);
          socket.currentSession = sessionId;

          // Store active session info
          this.activeSessions.set(socket.id, {
            sessionId,
            ticketId,
            userId: socket.userId,
            userName: socket.userName,
            joinedAt: new Date(),
          });

          // Load recent messages from database
          const messages = await this.loadRecentMessages(sessionId);

          // Send chat history to user
          socket.emit('chat_history', {
            sessionId,
            messages,
            timestamp: new Date().toISOString(),
          });

          // Notify others in the session that user joined
          socket.to(`chat_session_${sessionId}`).emit('user_joined', {
            userId: socket.userId,
            userName: socket.userName,
            timestamp: new Date().toISOString(),
          });

          logger.info(`User ${socket.userName} joined chat session ${sessionId}`);
        } catch (error) {
          logger.error('Error joining chat session:', error);
          socket.emit('error', { message: 'Failed to join chat session' });
        }
      });

      // Handle sending a message
      socket.on('send_message', async (data) => {
        try {
          const { sessionId, message, type } = data;

          if (!sessionId || !message) {
            socket.emit('error', { message: 'Session ID and message are required' });
            return;
          }

          const session = this.activeSessions.get(socket.id);
          if (!session || session.sessionId !== sessionId) {
            socket.emit('error', { message: 'Not in this chat session' });
            return;
          }

          // Create message object
          const chatMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            sessionId,
            type: type || 'message',
            from: 'user',
            userId: socket.userId,
            userName: socket.userName,
            content: message,
            timestamp: new Date().toISOString(),
          };

          // Save message to database (fire and forget)
          this.saveMessage(chatMessage).catch((err) =>
            logger.error('Failed to save chat message:', err)
          );

          // Broadcast message to everyone in the session
          this.chatNamespace.to(`chat_session_${sessionId}`).emit('new_message', chatMessage);

          logger.info(`Message sent in session ${sessionId} by ${socket.userName}`);
        } catch (error) {
          logger.error('Error sending chat message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicator
      socket.on('typing', (data) => {
        const { sessionId, isTyping } = data;

        if (!sessionId) return;

        const session = this.activeSessions.get(socket.id);
        if (!session || session.sessionId !== sessionId) return;

        // Broadcast typing status to others in the session
        socket.to(`chat_session_${sessionId}`).emit('user_typing', {
          userId: socket.userId,
          userName: socket.userName,
          isTyping,
          timestamp: new Date().toISOString(),
        });
      });

      // Handle agent assignment (for agent users)
      socket.on('agent_join', async (data) => {
        try {
          const { sessionId } = data;

          if (!sessionId) {
            socket.emit('error', { message: 'Session ID required' });
            return;
          }

          // Verify user is an agent
          const user = await prisma.user.findUnique({
            where: { id: socket.userId },
            select: { role: true },
          });

          if (!user || !['AGENT', 'SUPERVISOR', 'MANAGER', 'ADMIN'].includes(user.role)) {
            socket.emit('error', { message: 'Unauthorized - agent role required' });
            return;
          }

          // Join the session room
          socket.join(`chat_session_${sessionId}`);
          socket.currentSession = sessionId;

          // Store active session info
          this.activeSessions.set(socket.id, {
            sessionId,
            userId: socket.userId,
            userName: socket.userName,
            role: 'agent',
            joinedAt: new Date(),
          });

          // Notify user that agent has joined
          socket.to(`chat_session_${sessionId}`).emit('agent_joined', {
            agentId: socket.userId,
            agentName: socket.userName,
            timestamp: new Date().toISOString(),
          });

          logger.info(`Agent ${socket.userName} joined chat session ${sessionId}`);
        } catch (error) {
          logger.error('Error joining as agent:', error);
          socket.emit('error', { message: 'Failed to join as agent' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        const session = this.activeSessions.get(socket.id);

        if (session) {
          const { sessionId, userName, role } = session;

          // Notify others in the session
          if (role === 'agent') {
            socket.to(`chat_session_${sessionId}`).emit('agent_left', {
              agentName: userName,
              timestamp: new Date().toISOString(),
            });
          } else {
            socket.to(`chat_session_${sessionId}`).emit('user_left', {
              userName,
              timestamp: new Date().toISOString(),
            });
          }

          // Remove from active sessions
          this.activeSessions.delete(socket.id);

          logger.info(`User ${userName} disconnected from chat session ${sessionId}`);
        }

        logger.info(`Chat disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Load recent messages from database for a chat session
   */
  async loadRecentMessages(sessionId, limit = 50) {
    try {
      const messages = await prisma.chatbotMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });

      // Reverse to show oldest first
      return messages.reverse().map((msg) => ({
        id: msg.id,
        sessionId: msg.sessionId,
        type: msg.type || 'message',
        from: msg.user?.role === 'AGENT' ? 'agent' : 'user',
        userId: msg.userId,
        userName: msg.user?.name || 'Unknown',
        content: msg.content,
        timestamp: msg.createdAt.toISOString(),
      }));
    } catch (error) {
      // Graceful degradation if chat messages table doesn't exist
      if (error.code === 'P2021' || error.message.includes('does not exist')) {
        logger.warn('Chat messages table not yet implemented in database');
        return [];
      }
      throw error;
    }
  }

  /**
   * Save a chat message to the database
   */
  async saveMessage(message) {
    try {
      await prisma.chatbotMessage.create({
        data: {
          id: message.id,
          sessionId: message.sessionId,
          userId: message.userId,
          content: message.content,
          type: message.type || 'message',
        },
      });
    } catch (error) {
      // Graceful degradation if chat messages table doesn't exist
      if (error.code === 'P2021' || error.message.includes('does not exist')) {
        logger.warn('Chat messages table not yet implemented in database - message not persisted');
        return;
      }
      throw error;
    }
  }

  /**
   * Get active chat sessions count
   */
  getActiveSessionsCount() {
    const sessions = new Set();
    for (const session of this.activeSessions.values()) {
      sessions.add(session.sessionId);
    }
    return sessions.size;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions() {
    const sessions = {};
    for (const [socketId, session] of this.activeSessions.entries()) {
      if (!sessions[session.sessionId]) {
        sessions[session.sessionId] = {
          sessionId: session.sessionId,
          ticketId: session.ticketId,
          participants: [],
        };
      }
      sessions[session.sessionId].participants.push({
        socketId,
        userId: session.userId,
        userName: session.userName,
        role: session.role || 'user',
        joinedAt: session.joinedAt,
      });
    }
    return Object.values(sessions);
  }
}

export default ChatWebSocketHandler;
