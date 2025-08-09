interface ToastState {
    messages: Array<{
        id: string;
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
        duration?: number;
    }>;
    addToast: (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => void;
    removeToast: (id: string) => void;
}
export declare const useToastStore: import("zustand").UseBoundStore<import("zustand").StoreApi<ToastState>>;
export {};
//# sourceMappingURL=toast.d.ts.map