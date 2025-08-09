import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getEnv } from '@/lib/env';
export const useWebSocket = (options = {}) => {
    const { enabled = true, subscriptions = [], onMessage, onConnect, onDisconnect, onError } = options;
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const [lastMessage, setLastMessage] = useState(null);
    const socketRef = useRef(null);
    useEffect(() => {
        if (!enabled)
            return;
        const { apiUrl } = getEnv();
        const token = localStorage.getItem('token');
        if (!token) {
            setConnectionError('No authentication token available');
            return;
        }
        // Initialize WebSocket connection
        const socket = io(apiUrl, {
            auth: {
                token
            },
            transports: ['websocket', 'polling'],
            timeout: 20000,
            retries: 3
        });
        socketRef.current = socket;
        // Connection event handlers
        socket.on('connect', () => {
            console.log('✅ WebSocket connected:', socket.id);
            setIsConnected(true);
            setConnectionError(null);
            onConnect?.();
            // Subscribe to requested data types
            subscriptions.forEach(subscription => {
                socket.emit('subscribe', subscription);
                console.log(`🔔 Subscribed to: ${subscription}`);
            });
        });
        socket.on('disconnect', (reason) => {
            console.log('❌ WebSocket disconnected:', reason);
            setIsConnected(false);
            onDisconnect?.(reason);
        });
        socket.on('connect_error', (error) => {
            console.error('❌ WebSocket connection error:', error);
            setConnectionError(error.message);
            setIsConnected(false);
            onError?.(error);
        });
        // Data update handlers
        socket.on('data_update', (message) => {
            console.log('📊 Data update received:', message.type);
            setLastMessage(message);
            onMessage?.(message);
        });
        socket.on('realtime_update', (message) => {
            console.log('⚡ Realtime update received:', message.type);
            setLastMessage(message);
            onMessage?.(message);
        });
        socket.on('user_update', (message) => {
            console.log('👤 User update received:', message.type);
            setLastMessage(message);
            onMessage?.(message);
        });
        socket.on('admin_broadcast', (message) => {
            console.log('📢 Admin broadcast received:', message.type);
            setLastMessage(message);
            onMessage?.(message);
        });
        // Cleanup on unmount
        return () => {
            console.log('🔌 Cleaning up WebSocket connection');
            socket.disconnect();
        };
    }, [enabled, JSON.stringify(subscriptions)]);
    // Helper functions
    const subscribe = (dataType) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('subscribe', dataType);
            console.log(`🔔 Subscribed to: ${dataType}`);
        }
    };
    const unsubscribe = (dataType) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('unsubscribe', dataType);
            console.log(`🔕 Unsubscribed from: ${dataType}`);
        }
    };
    const sendMessage = (type, data) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit(type, data);
            console.log(`📤 Sent message: ${type}`);
        }
    };
    return {
        isConnected,
        connectionError,
        lastMessage,
        subscribe,
        unsubscribe,
        sendMessage,
        socket: socketRef.current
    };
};
// WebSocket service for managing global connection
class WebSocketService {
    socket = null;
    messageHandlers = new Map();
    connectionHandlers = new Set();
    disconnectionHandlers = new Set();
    connect(token) {
        if (this.socket?.connected)
            return;
        const { apiUrl } = getEnv();
        this.socket = io(apiUrl, {
            auth: { token },
            transports: ['websocket', 'polling']
        });
        this.socket.on('connect', () => {
            console.log('✅ Global WebSocket connected');
            this.connectionHandlers.forEach(handler => handler());
        });
        this.socket.on('disconnect', (reason) => {
            console.log('❌ Global WebSocket disconnected:', reason);
            this.disconnectionHandlers.forEach(handler => handler(reason));
        });
        // Handle all message types
        const messageTypes = [
            'data_update',
            'realtime_update',
            'user_update',
            'admin_broadcast'
        ];
        messageTypes.forEach(type => {
            this.socket?.on(type, (message) => {
                const handlers = this.messageHandlers.get(message.type);
                handlers?.forEach(handler => handler(message.data));
            });
        });
    }
    disconnect() {
        this.socket?.disconnect();
        this.socket = null;
    }
    subscribe(messageType, handler) {
        if (!this.messageHandlers.has(messageType)) {
            this.messageHandlers.set(messageType, new Set());
        }
        this.messageHandlers.get(messageType)?.add(handler);
    }
    unsubscribe(messageType, handler) {
        this.messageHandlers.get(messageType)?.delete(handler);
    }
    onConnect(handler) {
        this.connectionHandlers.add(handler);
    }
    onDisconnect(handler) {
        this.disconnectionHandlers.add(handler);
    }
    emit(event, data) {
        this.socket?.emit(event, data);
    }
    get isConnected() {
        return this.socket?.connected || false;
    }
}
export const webSocketService = new WebSocketService();
export default useWebSocket;
