interface ToastState {
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
  }>;
  addToast: (toast: Omit<ToastState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
}
export declare const useToastStore: import('zustand').UseBoundStore<Omit<import('zustand').StoreApi<ToastState>, 'setState'> & {
  setState<A extends string | { type: string }>(partial: ToastState | Partial<ToastState> | ((state: ToastState) => ToastState | Partial<ToastState>), replace?: boolean | undefined, action?: A | undefined): void;
}>;
export {};
