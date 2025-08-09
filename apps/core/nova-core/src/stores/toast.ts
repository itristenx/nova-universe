import { create } from 'zustand';

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

export const useToastStore = create<ToastState>((set) => ({
  messages: [],
  addToast: (type, message, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      messages: [...state.messages, { id, type, message, duration }],
    }));
    
    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          messages: state.messages.filter((toast) => toast.id !== id),
        }));
      }, duration);
    }
  },
  removeToast: (id) =>
    set((state) => ({
      messages: state.messages.filter((toast) => toast.id !== id),
    })),
}));
