import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { toast } from 'react-hot-toast';
import App from './App';
import FallbackApp from './FallbackApp';
import '@/styles/globals.css';
import './i18n/config'; // Initialize i18n

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Get root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

// Create root and render app
const root = ReactDOM.createRoot(rootElement);

// Decide which app to render
const useRealApp = import.meta.env.PROD || import.meta.env.VITE_E2E === 'true';

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {useRealApp ? <App /> : <FallbackApp />}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'white',
              color: 'black',
              boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(0, 0, 0, 0.05)',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: 'white',
              },
            },
          }}
        />
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>,
);

// E2E test bridge: mirror toast state into DOM testids for Playwright
if (typeof window !== 'undefined') {
  try {
    toast.onChange((t) => {
      const id = t.type === 'error' ? 'toast-error' : t.type === 'success' ? 'toast-success' : 'toast-info';
      let el = document.getElementById(id);
      if (!el) {
        el = document.createElement('div');
        el.id = id;
        el.setAttribute('data-testid', id);
        el.style.position = 'fixed';
        el.style.bottom = '4px';
        el.style.right = '4px';
        el.style.zIndex = '9999';
        el.style.pointerEvents = 'none';
        document.body.appendChild(el);
      }
      el.textContent = (t?.message as any) || '';
      // Show only while visible
      el.style.display = t.visible ? 'block' : 'none';
    });
  } catch {}
}
