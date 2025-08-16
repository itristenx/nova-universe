import type { User } from '@/types';
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}
export declare const useAuthStore: import('zustand').UseBoundStore<
  Omit<
    Omit<import('zustand').StoreApi<AuthState>, 'setState'> & {
      setState<
        A extends
          | string
          | {
              type: string;
            },
      >(
        partial:
          | AuthState
          | Partial<AuthState>
          | ((state: AuthState) => AuthState | Partial<AuthState>),
        replace?: boolean | undefined,
        action?: A | undefined,
      ): void;
    },
    'persist'
  > & {
    persist: {
      setOptions: (
        options: Partial<
          import('zustand/middleware').PersistOptions<
            AuthState,
            {
              token: string | null;
            }
          >
        >,
      ) => void;
      clearStorage: () => void;
      rehydrate: () => Promise<void> | void;
      hasHydrated: () => boolean;
      onHydrate: (fn: (state: AuthState) => void) => () => void;
      onFinishHydration: (fn: (state: AuthState) => void) => () => void;
      getOptions: () => Partial<
        import('zustand/middleware').PersistOptions<
          AuthState,
          {
            token: string | null;
          }
        >
      >;
    };
  }
>;
export {};
//# sourceMappingURL=auth.d.ts.map
