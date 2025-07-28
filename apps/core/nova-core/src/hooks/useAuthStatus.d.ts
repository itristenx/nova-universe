interface AuthStatusResponse {
    authRequired: boolean;
    authDisabled: boolean;
}
export declare const useAuthStatus: () => {
    authStatus: AuthStatusResponse | null;
    loading: boolean;
    error: string | null;
};
export default useAuthStatus;
//# sourceMappingURL=useAuthStatus.d.ts.map