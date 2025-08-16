import { useState, useEffect } from 'react';
import axios from 'axios';

interface AuthStatusResponse {
  authRequired: boolean;
  authDisabled: boolean;
}

export const useAuthStatus = () => {
  const [authStatus, setAuthStatus] = useState<AuthStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '');
        const response = await axios.get<AuthStatusResponse>(`${baseURL}/api/auth/status`, {
          timeout: 4000,
        });
        setAuthStatus(response.data);
        setError(null);
      } catch (err: any) {
        console.warn('Auth status unavailable, enabling mock mode:', err?.message || err);
        // In local preview, assume auth is disabled so UI can render end-to-end
        setAuthStatus({ authRequired: false, authDisabled: true });
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  return { authStatus, loading, error };
};

export default useAuthStatus;
