import { Socket } from 'socket.io-client';
interface WebSocketMessage {
    type: string;
    data: any;
    timestamp: string;
}
interface UseWebSocketOptions {
    enabled?: boolean;
    subscriptions?: string[];
    onMessage?: (message: WebSocketMessage) => void;
    onConnect?: () => void;
    onDisconnect?: (reason: string) => void;
    onError?: (error: Error) => void;
}
export declare const useWebSocket: (options?: UseWebSocketOptions) => {
    isConnected: boolean;
    connectionError: string | null;
    lastMessage: WebSocketMessage | null;
    subscribe: (dataType: string) => void;
    unsubscribe: (dataType: string) => void;
    sendMessage: (type: string, data: any) => void;
    socket: Socket | null;
};
declare class WebSocketService {
    private socket;
    private messageHandlers;
    private connectionHandlers;
    private disconnectionHandlers;
    connect(token: string): void;
    disconnect(): void;
    subscribe(messageType: string, handler: (data: any) => void): void;
    unsubscribe(messageType: string, handler: (data: any) => void): void;
    onConnect(handler: () => void): void;
    onDisconnect(handler: (reason: string) => void): void;
    emit(event: string, data: any): void;
    get isConnected(): boolean;
}
export declare const webSocketService: WebSocketService;
export default useWebSocket;
//# sourceMappingURL=useWebSocket.d.ts.map