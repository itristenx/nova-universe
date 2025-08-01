import type { ToastState } from './toast.types';
export declare const useToastStore: import('zustand').UseBoundStore<Omit<import('zustand').StoreApi<ToastState>, 'setState'> & {
  setState<A extends string | { type: string }>(partial: ToastState | Partial<ToastState> | ((state: ToastState) => ToastState | Partial<ToastState>), replace?: boolean | undefined, action?: A | undefined): void;
}>;
export {};
