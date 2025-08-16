export type ToastType = 'success' | 'error' | 'warning' | 'info';
export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}
export interface ToastStoreState {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'> & { id?: string }) => void;
  removeToast: (id: string) => void;
  clear: () => void;
}
export declare const useToastStore: import('zustand').UseBoundStore<
  import('zustand').StoreApi<ToastStoreState>
>;
//# sourceMappingURL=toast.d.ts.map
