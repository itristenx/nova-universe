import { v4 as uuidv4 } from 'uuid';
import {
  CosmoConfig,
  CosmoContext,
  CosmoMessage,
  CosmoConversation,
  CosmoResponse,
  CosmoEvent,
  CosmoEventHandler,
  CosmoEventType,
} from './types';

export class CosmoSDK {
  private config: CosmoConfig;
  private context: CosmoContext | null = null;
  private activeConversation: CosmoConversation | null = null;
  private websocket: WebSocket | null = null;
  private eventHandlers: Map<CosmoEventType, CosmoEventHandler[]> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: CosmoConfig) {
    this.config = {
      enableWebSocket: true,
      enableXP: true,
      maxContextLength: 8000,
      sessionTimeout: 3600000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  /**
   * Initialize the Cosmo SDK with user context
   */
  async initialize(context: CosmoContext): Promise<void> {
    this.context = context;

    if (this.config.enableWebSocket && this.config.websocketUrl) {
      await this.connectWebSocket();
    }

    this.emit('connection_status', {
      connected: true,
      context: this.context,
    });
  }

  /**
   * Start a new conversation with Cosmo
   */
  async startConversation(initialMessage?: string): Promise<CosmoConversation> {
    if (!this.context) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }

    const conversationId = uuidv4();
    const conversation: CosmoConversation = {
      id: conversationId,
      userId: this.context.userId,
      tenantId: this.context.tenantId,
      status: 'active',
      context: {
        module: this.context.module,
        ticketId: this.context.activeTicket?.id,
        userRole: this.context.session.userInfo.role,
        capabilities: this.context.session.permissions,
      },
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date(),
    };

    this.activeConversation = conversation;

    try {
      const response = await this.apiCall('/v2/synth/conversation/start', {
        method: 'POST',
        body: JSON.stringify({
          conversationId,
          context: conversation.context,
          initialMessage,
        }),
      });

      if (response.success) {
        this.activeConversation = response.conversation || conversation;

        if (initialMessage) {
          await this.sendMessage(initialMessage);
        }

        this.emit('conversation_started', { conversation: this.activeConversation });
        return this.activeConversation;
      } else {
        throw new Error(response.error?.message || 'Failed to start conversation');
      }
    } catch (error) {
      this.emit('error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        action: 'start_conversation',
      });
      throw error;
    }
  }

  /**
   * Send a message to Cosmo
   */
  async sendMessage(text: string): Promise<CosmoMessage> {
    if (!this.activeConversation) {
      throw new Error('No active conversation. Call startConversation() first.');
    }

    const userMessage: CosmoMessage = {
      id: uuidv4(),
      conversationId: this.activeConversation.id,
      from: 'user',
      text,
      timestamp: new Date(),
    };

    // Add user message to conversation
    this.activeConversation.messages.push(userMessage);
    this.activeConversation.lastActivity = new Date();

    this.emit('message', { message: userMessage });

    try {
      const response = await this.apiCall(
        `/v2/synth/conversation/${this.activeConversation.id}/send`,
        {
          method: 'POST',
          body: JSON.stringify({
            message: text,
            context: {
              ...this.context,
              conversationHistory: this.getRecentMessages(10),
            },
          }),
        },
      );

      if (response.success && response.message) {
        const cosmoMessage: CosmoMessage = {
          id: uuidv4(),
          conversationId: this.activeConversation.id,
          from: 'cosmo',
          text: response.message,
          timestamp: new Date(),
          metadata: response.metadata,
        };

        this.activeConversation.messages.push(cosmoMessage);
        this.activeConversation.lastActivity = new Date();

        this.emit('message', { message: cosmoMessage });

        // Handle any actions returned by Cosmo
        if (response.actions) {
          await this.handleCosmoActions(response.actions);
        }

        return cosmoMessage;
      } else {
        throw new Error(response.error?.message || 'Failed to send message');
      }
    } catch (error) {
      const errorMessage: CosmoMessage = {
        id: uuidv4(),
        conversationId: this.activeConversation.id,
        from: 'cosmo',
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        metadata: { error: true },
      };

      this.activeConversation.messages.push(errorMessage);
      this.emit('message', { message: errorMessage });
      this.emit('error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        action: 'send_message',
      });

      return errorMessage;
    }
  }

  /**
   * End the current conversation
   */
  async endConversation(): Promise<void> {
    if (!this.activeConversation) {
      return;
    }

    try {
      await this.apiCall(`/v2/synth/conversation/${this.activeConversation.id}`, {
        method: 'DELETE',
      });

      const conversation = this.activeConversation;
      conversation.status = 'archived';
      this.activeConversation = null;

      this.emit('conversation_ended', { conversation });
    } catch (error) {
      this.emit('error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        action: 'end_conversation',
      });
    }
  }

  /**
   * Trigger an escalation
   */
  async triggerEscalation(
    reason: string,
    level: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  ): Promise<void> {
    if (!this.activeConversation || !this.context) {
      throw new Error('No active conversation or context');
    }

    try {
      const response = await this.apiCall('/v2/synth/escalation/create', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: this.activeConversation.id,
          ticketId: this.context.activeTicket?.id,
          level,
          reason,
          context: {
            userInput: this.getRecentUserMessages(3)
              .map((m) => m.text)
              .join(' '),
            conversationHistory: this.getRecentMessages(5),
          },
        }),
      });

      if (response.success) {
        this.activeConversation.status = 'escalated';
        this.emit('escalation_created', {
          escalation: response.escalation,
          conversation: this.activeConversation,
        });
      } else {
        throw new Error(response.error?.message || 'Failed to create escalation');
      }
    } catch (error) {
      this.emit('error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        action: 'trigger_escalation',
      });
      throw error;
    }
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): CosmoMessage[] {
    return this.activeConversation?.messages || [];
  }

  /**
   * Get recent messages (default: last 10)
   */
  getRecentMessages(count: number = 10): CosmoMessage[] {
    const messages = this.getConversationHistory();
    return messages.slice(-count);
  }

  /**
   * Get recent user messages
   */
  getRecentUserMessages(count: number = 5): CosmoMessage[] {
    const messages = this.getConversationHistory();
    return messages.filter((m) => m.from === 'user').slice(-count);
  }

  /**
   * Event subscription
   */
  on(eventType: CosmoEventType, handler: CosmoEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  /**
   * Remove event handler
   */
  off(eventType: CosmoEventType, handler: CosmoEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all handlers
   */
  private emit(eventType: CosmoEventType, data: any): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    const event: CosmoEvent = {
      type: eventType,
      data,
      timestamp: new Date(),
    };

    handlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in event handler:', error);
      }
    });
  }

  /**
   * Connect to WebSocket for real-time updates
   */
  private async connectWebSocket(): Promise<void> {
    if (!this.config.websocketUrl || !this.context) {
      return;
    }

    try {
      const wsUrl = `${this.config.websocketUrl}?token=${this.context.session.token}&userId=${this.context.userId}`;
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log('Cosmo WebSocket connected');
      };

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.websocket.onclose = () => {
        this.isConnected = false;
        console.log('Cosmo WebSocket disconnected');
        this.attemptReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('Cosmo WebSocket error:', error);
        this.emit('error', { error: 'WebSocket connection error', details: error });
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  /**
   * Handle WebSocket messages
   */
  private handleWebSocketMessage(data: any): void {
    switch (data.type) {
      case 'message':
        if (this.activeConversation && data.conversationId === this.activeConversation.id) {
          const message: CosmoMessage = {
            id: data.id || uuidv4(),
            conversationId: data.conversationId,
            from: 'cosmo',
            text: data.text,
            timestamp: new Date(data.timestamp),
            metadata: data.metadata,
          };

          this.activeConversation.messages.push(message);
          this.activeConversation.lastActivity = new Date();
          this.emit('message', { message });
        }
        break;

      case 'escalation_update':
        this.emit('escalation_resolved', data);
        break;

      case 'xp_awarded':
        this.emit('xp_awarded', data);
        break;

      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  /**
   * Attempt to reconnect WebSocket
   */
  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max WebSocket reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff

    setTimeout(() => {
      if (!this.isConnected) {
        console.log(
          `Attempting WebSocket reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
        );
        this.connectWebSocket();
      }
    }, delay);
  }

  /**
   * Handle actions returned by Cosmo
   */
  private async handleCosmoActions(actions: any[]): Promise<void> {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'award_xp':
            this.emit('xp_awarded', action.payload);
            break;

          case 'escalate':
            await this.triggerEscalation(action.payload.reason, action.payload.level);
            break;

          case 'create_ticket':
            // Handle ticket creation
            console.log('Cosmo suggested ticket creation:', action.payload);
            break;

          default:
            console.log('Unknown Cosmo action:', action.type);
        }
      } catch (error) {
        console.error('Error handling Cosmo action:', error);
      }
    }
  }

  /**
   * Make API call to Synth service
   */
  private async apiCall(endpoint: string, options: RequestInit = {}): Promise<CosmoResponse> {
    if (!this.context) {
      throw new Error('SDK not initialized');
    }

    const url = `${this.config.apiUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.context.session.token}`,
      ...options.headers,
    };

    let attempts = 0;
    const maxAttempts = this.config.retryAttempts || 3;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status >= 500 && attempts < maxAttempts - 1) {
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay || 1000));
            continue;
          }

          const errorText = await response.text();
          throw new Error(
            `API call failed: ${response.status} ${response.statusText} - ${errorText}`,
          );
        }

        return await response.json();
      } catch (error) {
        if (attempts === maxAttempts - 1) {
          throw error;
        }
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay || 1000));
      }
    }

    throw new Error('Max retry attempts reached');
  }

  /**
   * Cleanup and disconnect
   */
  dispose(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    this.activeConversation = null;
    this.context = null;
    this.eventHandlers.clear();
    this.isConnected = false;
  }
}
