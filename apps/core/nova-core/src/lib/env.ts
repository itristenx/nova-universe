export function getEnv() {
  const isDevelopment = import.meta.env.DEV;
  const defaultApiUrl = isDevelopment ? 'http://localhost:3000' : '';
  const apiUrl = import.meta.env.VITE_API_URL || defaultApiUrl;
  
  if (!import.meta.env.VITE_API_URL && isDevelopment) {
    console.warn('VITE_API_URL not set - using development default:', defaultApiUrl);
  } else if (!import.meta.env.VITE_API_URL && !isDevelopment) {
    console.error('VITE_API_URL must be set in production');
  }
  
  return {
    apiUrl,
    useMockApi: import.meta.env.VITE_USE_MOCK_API === 'true'
  };
}
