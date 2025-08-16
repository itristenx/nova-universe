import React, { useState, useEffect } from 'react'
import { Button } from '@heroui/react'
import { useCosmo, CosmoConfig, CosmoContext, CosmoMessage } from '@nova-universe/cosmo-sdk'

interface CosmoAssistantProps {
  ticketId?: string;
  onEscalation?: (escalation: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => void;
  onXPAwarded?: (xp: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => void;
}

export const CosmoAssistant: React.FC<CosmoAssistantProps> = ({ 
  ticketId, 
  onEscalation, 
  onXPAwarded 
}) => {
  const [input, setInput] = useState('')

  // Get user context from localStorage (in a real app, this would come from auth context)
  const getUserContext = (): CosmoContext | null => {
    try {
      const token = localStorage.getItem('token')
      const userInfo = localStorage.getItem('userInfo')
      
      if (!token || !userInfo) {
        return null;
      }

      const user = JSON.parse(userInfo);
      
      return {
        userId: user.id,
        tenantId: user.tenant_id || 'default',
        module: 'pulse',
        session: {
          token,
          permissions: user.permissions || ['tickets.view', 'tickets.update'],
          userInfo: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'technician',
            department: user.department
          }
        },
        activeTicket: ticketId ? {
          id: ticketId,
          title: 'Current Ticket',
          category: 'unknown',
          priority: 'medium',
          status: 'in_progress'
        } : undefined
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return null;
    }
  };

  const context = getUserContext();

  const config: CosmoConfig = {
    apiUrl: process.env.REACT_APP_SYNTH_API_URL || 'http://localhost:3000/api/v2',
    websocketUrl: process.env.REACT_APP_SYNTH_WEBSOCKET_URL,
    enableWebSocket: true,
    enableXP: true,
    maxContextLength: 8000,
    sessionTimeout: 3600000
  };

  const {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    startConversation,
    triggerEscalation,
    clearError
  } = useCosmo(config, context!, {
    autoStart: true,
    initialMessage: ticketId ? `I'm working on ticket ${ticketId}. How can you help me?` : undefined,
    onEscalation: (escalationData: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => {
      console.log('Escalation created:', escalationData);
      if (onEscalation) {
        onEscalation(escalationData);
      }
    },
    onXPAwarded: (xpData: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => {
      console.log('XP awarded:', xpData);
      if (onXPAwarded) {
        onXPAwarded(xpData);
      }
    },
    onError: (errorData: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => {
      console.error('Cosmo error:', errorData);
    }
  });

  // Don't render if no context available
  if (!context) {
    return (
      <div className="space-y-2">
        <div className="border rounded bg-muted p-3 h-64 flex items-center justify-center">
          <div className="text-muted-foreground text-center">
            <p>Please log in to chat with Cosmo</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    const message = input.trim();
    setInput('');
    
    try {
      await sendMessage(message); // TODO-LINT: move to async function
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleEscalate = async () => {
    try {
      await triggerEscalation('User requested escalation from Pulse Deep Work view', 'medium'); // TODO-LINT: move to async function
    } catch (error) {
      console.error('Error triggering escalation:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-2">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Cosmo AI Assistant</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded p-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-destructive">{error}</span>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={clearError}
              className="h-6 px-2"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="border rounded bg-muted p-3 h-64 overflow-y-auto flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="text-muted-foreground text-center py-4">
            <p>🛰️ Start a conversation with Cosmo...</p>
            <p className="text-xs mt-1">I can help with tickets, knowledge searches, and more!</p>
          </div>
        )}
        
        {messages.map((m: CosmoMessage) => (
          <div key={m.id} className={m.from === 'user' ? 'text-right' : 'text-left'}>
            <div className="flex flex-col">
              <span 
                className={`inline-block px-3 py-2 rounded-lg max-w-[80%] ${
                  m.from === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-secondary text-secondary-foreground mr-auto'
                }`}
              >
                {m.text}
              </span>
              
              {/* Show metadata for Cosmo messages */}
              {m.from === 'cosmo' && m.metadata && (
                <div className="flex flex-wrap gap-1 mt-1 mr-auto">
                  {m.metadata.xpAwarded && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      +{m.metadata.xpAwarded} XP
                    </span>
                  )}
                  {m.metadata.actionable && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Actionable
                    </span>
                  )}
                  {m.metadata.tools && m.metadata.tools.length > 0 && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      Tools: {m.metadata.tools.join(', ')}
                    </span>
                  )}
                </div>
              )}
              
              <span className="text-xs text-muted-foreground mt-1">
                {new Date(m.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="text-left">
            <div className="bg-secondary text-secondary-foreground px-3 py-2 rounded-lg inline-block">
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                Cosmo is thinking...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input and Actions */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded px-2 py-1 text-sm"
            placeholder="Ask Cosmo for help..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            size="sm"
          >
            Send
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-1 flex-wrap">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setInput('Search knowledge base for troubleshooting steps')}
            disabled={isLoading}
            className="text-xs"
          >
            🔍 Search KB
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setInput('Check system status')}
            disabled={isLoading}
            className="text-xs"
          >
            📊 System Status
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleEscalate}
            disabled={isLoading}
            className="text-xs"
          >
            🚨 Escalate
          </Button>
          {ticketId && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setInput(`Help me resolve ticket ${ticketId}`)}
              disabled={isLoading}
              className="text-xs"
            >
              🎯 Resolve Ticket
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}