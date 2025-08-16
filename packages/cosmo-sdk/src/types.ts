export interface CosmoMessage {
  id: string;
  conversationId: string;
  from: 'user' | 'cosmo';
  text: string;
  timestamp: Date;
  metadata?: {
    ticketId?: string;
    actionable?: boolean;
    xpAwarded?: number;
    tools?: string[];
    error?: boolean;
    escalation?: {
      level: 'low' | 'medium' | 'high' | 'critical';
      reason: string;
      suggestedActions: string[];
    };
  };
}

export interface CosmoConversation {
  id: string;
  userId: string;
  tenantId: string;
  title?: string;
  status: 'active' | 'archived' | 'escalated';
  context: {
    module: 'pulse' | 'orbit' | 'comms' | 'beacon';
    ticketId?: string;
    location?: string;
    userRole?: string;
    capabilities: string[];
  };
  messages: CosmoMessage[];
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
}

export interface CosmoContext {
  userId: string;
  tenantId: string;
  module: 'pulse' | 'orbit' | 'comms' | 'beacon';
  session: {
    token: string;
    permissions: string[];
    userInfo: {
      id: string;
      name: string;
      email: string;
      role: string;
      department?: string;
    };
  };
  activeTicket?: {
    id: string;
    title: string;
    category: string;
    priority: string;
    status: string;
  };
  recentActivity?: {
    type: string;
    description: string;
    timestamp: Date;
  }[];
}

export interface CosmoResponse {
  success: boolean;
  message?: string;
  conversation?: CosmoConversation;
  escalation?: CosmoEscalation;
  metadata?: {
    ticketId?: string;
    actionable?: boolean;
    xpAwarded?: number;
    tools?: string[];
    escalation?: {
      level: 'low' | 'medium' | 'high' | 'critical';
      reason: string;
      suggestedActions: string[];
    };
  };
  actions?: {
    type: 'create_ticket' | 'escalate' | 'assign' | 'close' | 'award_xp' | 'suggest_knowledge';
    payload: any;
  }[];
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface CosmoEscalation {
  id: string;
  conversationId: string;
  ticketId?: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  context: {
    userInput: string;
    symptoms: string[];
    attemptedSolutions: string[];
    urgency: number;
  };
  suggestedActions: {
    type: string;
    description: string;
    priority: number;
    automated: boolean;
  }[];
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'cancelled';
  createdAt: Date;
  resolvedAt?: Date;
}

export interface CosmoTool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (params: any, context: CosmoContext) => Promise<any>;
}

export interface CosmoConfig {
  apiUrl: string;
  websocketUrl?: string;
  mcpEndpoint?: string;
  apiKey?: string;
  enableWebSocket?: boolean;
  enableXP?: boolean;
  maxContextLength?: number;
  sessionTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export type CosmoEventType = 
  | 'message'
  | 'conversation_started'
  | 'conversation_ended'
  | 'escalation_created'
  | 'escalation_resolved'
  | 'xp_awarded'
  | 'error'
  | 'connection_status';

export interface CosmoEvent {
  type: CosmoEventType;
  data: any;
  timestamp: Date;
}

export type CosmoEventHandler = (event: CosmoEvent) => void;
