import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
export const _useAuthStore = create()(devtools(persist((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    login: (token, user) => set({
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
    setUser: (user) => set({ user }),
}), {
    name: 'auth-storage',
    partialize: (state) => ({ token: state.token }),
}), {
    name: 'auth-store',
}));
