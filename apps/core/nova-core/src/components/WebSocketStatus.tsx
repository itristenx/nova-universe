import React from 'react';
import { Chip } from '@heroui/react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';

export const WebSocketStatus: React.FC = () => {
  const { isConnected, connectionError } = useWebSocketContext();

  if (connectionError) {
    return (
      <Chip 
        color="danger" 
        variant="flat" 
        size="sm"
        title={`WebSocket Error: ${connectionError}`}
      >
        ⚠️ Connection Error
      </Chip>
    );
  }

  return (
    <Chip 
      color={isConnected ? "success" : "warning"} 
      variant="flat" 
      size="sm"
      title={isConnected ? "WebSocket Connected" : "WebSocket Disconnected"}
    >
      {isConnected ? "🟢 Live" : "🟡 Offline"}
    </Chip>
  );
};

export default WebSocketStatus;
