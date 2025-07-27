import React from 'react';
interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
}
interface ToastProps {
    toast: Toast;
    onRemove: (id: string) => void;
}
export declare const Toast: React.FC<ToastProps>;
interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}
export declare const ToastContainer: React.FC<ToastContainerProps>;
export declare const ConnectedToastContainer: React.FC;
export {};
//# sourceMappingURL=Toast.d.ts.map