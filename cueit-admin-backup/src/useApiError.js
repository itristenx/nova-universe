import { useCallback } from 'react';
import axios from 'axios';
import useToast from './useToast.js';

export default function useApiError() {
  const toast = useToast();
  return useCallback(
    (err, msg) => {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common.Authorization;
        window.location.hash = '#/login';
      } else if (msg) {
        toast(msg, 'error');
      }
    },
    [toast]
  );
}
