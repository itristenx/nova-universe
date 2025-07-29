import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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

export const useToastStore = create<ToastState>()(
  devtools(
    (set) => ({
      toasts: [],
      addToast: (toast) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }));
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }));
        }, 5000);
      },
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
    }),
    { name: 'toast-store' }
  )
);
