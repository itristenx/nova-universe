import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastStoreState {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'> & { id?: string }) => void;
  removeToast: (id: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastStoreState>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: toast.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          type: toast.type,
          title: toast.title,
          description: toast.description,
        },
      ],
    })),
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

export default useToastStore;
