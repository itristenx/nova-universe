export function _getEnv() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    if (!import.meta.env.VITE_API_URL) {
        console.warn('VITE_API_URL not set - using default http://localhost:3000');
    }
    return {
        apiUrl,
        useMockApi: import.meta.env.VITE_USE_MOCK_API === 'true'
    };
}
