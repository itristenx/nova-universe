import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
const WebSocketContext = createContext(undefined);
export const WebSocketProvider = ({ children }) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const { isConnected, connectionError, subscribe, unsubscribe, sendMessage } = useWebSocket({
        enabled: isInitialized,
        subscriptions: ['tickets', 'kiosks', 'users', 'system'],
        onConnect: () => {
            console.log('✅ Admin WebSocket connected - subscribing to admin channels');
        },
        onDisconnect: (reason) => {
            console.log('❌ Admin WebSocket disconnected:', reason);
        },
        onMessage: (message) => {
            console.log('📨 Received admin message:', message);
            // Handle global admin messages here
        },
        onError: (error) => {
            console.error('❌ Admin WebSocket error:', error);
        }
    });
    useEffect(() => {
        // Initialize WebSocket connection when component mounts
        const token = localStorage.getItem('token');
        if (token) {
            setIsInitialized(true);
        }
    }, []);
    const broadcast = async (message, data) => {
        try {
            const response = await fetch('/api/websocket/broadcast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ message, data })
            });
            if (!response.ok) {
                throw new Error('Failed to broadcast message');
            }
            console.log('📢 Message broadcasted successfully');
        }
        catch (error) {
            console.error('❌ Failed to broadcast message:', error);
        }
    };
    const notify = async (userId, message, type = 'info') => {
        try {
            const response = await fetch('/api/websocket/notify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ userId, message, type })
            });
            if (!response.ok) {
                throw new Error('Failed to send notification');
            }
            console.log('🔔 Notification sent successfully');
        }
        catch (error) {
            console.error('❌ Failed to send notification:', error);
        }
    };
    const contextValue = {
        isConnected,
        connectionError,
        subscribe,
        unsubscribe,
        broadcast,
        notify
    };
    return (React.createElement(WebSocketContext.Provider, { value: contextValue }, children));
};
export const useWebSocketContext = () => {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error('useWebSocketContext must be used within a WebSocketProvider');
    }
    return context;
};
export default WebSocketProvider;
