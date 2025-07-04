import { useCallback } from 'react';
import useToast from './useToast.js';

export default function useApiError() {
  const api = import.meta.env.VITE_API_URL;
  const toast = useToast();
  return useCallback(
    (err, msg) => {
      if (err.response && err.response.status === 401) {
        window.location.href = `${api}/login`;
      } else if (msg) {
        toast(msg, 'error');
      }
    },
    [api, toast]
  );
}
