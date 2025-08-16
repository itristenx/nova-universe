import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const _useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        login: (token: string, user: User) =>
          set({
            token,
            user,
            isAuthenticated: true,
          }),
        logout: () => {
          localStorage.removeItem('auth_token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        },
        setUser: (user: User) => set({ user }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ token: state.token }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);
