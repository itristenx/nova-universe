import React from 'react';
interface WebSocketContextType {
    isConnected: boolean;
    connectionError: string | null;
    subscribe: (dataType: string) => void;
    unsubscribe: (dataType: string) => void;
    broadcast: (message: string, data?: any) => void;
    notify: (userId: string, message: string, type?: string) => void;
}
interface WebSocketProviderProps {
    children: React.ReactNode;
}
export declare const WebSocketProvider: React.FC<WebSocketProviderProps>;
export declare const useWebSocketContext: () => WebSocketContextType;
export default WebSocketProvider;
//# sourceMappingURL=WebSocketContext.d.ts.map