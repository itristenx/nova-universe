import React from 'react';
interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
}
interface ToastProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}
export declare const Toast: React.FC<ToastProps>;
interface ToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}
export declare const ToastContainer: React.FC<ToastContainerProps>;
export declare const ConnectedToastContainer: React.FC;
export { useToastStore } from '../../stores/toast';
export {};
//# sourceMappingURL=Toast.d.ts.map
