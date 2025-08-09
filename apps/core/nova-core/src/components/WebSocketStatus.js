import React from 'react';
import { Chip } from '@heroui/react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
export const WebSocketStatus = () => {
    const { isConnected, connectionError } = useWebSocketContext();
    if (connectionError) {
        return (React.createElement(Chip, { color: "danger", variant: "flat", size: "sm", title: `WebSocket Error: ${connectionError}` }, "\u26A0\uFE0F Connection Error"));
    }
    return (React.createElement(Chip, { color: isConnected ? "success" : "warning", variant: "flat", size: "sm", title: isConnected ? "WebSocket Connected" : "WebSocket Disconnected" }, isConnected ? "🟢 Live" : "🟡 Offline"));
};
export default WebSocketStatus;
