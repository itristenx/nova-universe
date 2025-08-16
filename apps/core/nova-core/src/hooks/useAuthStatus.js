import { useState, useEffect } from 'react';
import axios from 'axios';
export const useAuthStatus = () => {
    const [authStatus, setAuthStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${baseURL}/api/auth/status`, {
                    timeout: 5000,
                }); // TODO-LINT: move to async function
                setAuthStatus(response.data);
                setError(null);
            }
            catch (err) {
                console.error('Failed to check auth status:', err);
                setError(err.message);
                // Default to requiring auth if we can't determine status
                setAuthStatus({ authRequired: true, authDisabled: false });
            }
            finally {
                setLoading(false);
            }
        };
        checkAuthStatus();
    }, []);
    return { authStatus, loading, error };
};
export default useAuthStatus;
