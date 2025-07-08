import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components/layout';
import { ConnectedToastContainer } from '@/components/ui';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { useAuthStore } from '@/stores/auth';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { api } from '@/lib/api';

// Lazy load other pages for better performance
const TicketsPage = React.lazy(() => import('@/pages/TicketsPage').then(m => ({ default: m.TicketsPage })));
const KiosksPage = React.lazy(() => import('@/pages/KiosksPage').then(m => ({ default: m.KiosksPage })));
const UsersPage = React.lazy(() => import('@/pages/UsersPage').then(m => ({ default: m.UsersPage })));
const AnalyticsPage = React.lazy(() => import('@/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const NotificationsPage = React.lazy(() => import('@/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const IntegrationsPage = React.lazy(() => import('@/pages/IntegrationsPage').then(m => ({ default: m.IntegrationsPage })));
const KioskActivationPage = React.lazy(() => import('@/pages/KioskActivationPage').then(m => ({ default: m.KioskActivationPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, login } = useAuthStore();
  const { authStatus, loading: authStatusLoading } = useAuthStatus();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for auth status to be determined
      if (authStatusLoading || !authStatus) {
        return;
      }

      // If auth is disabled, create a mock authenticated state
      if (authStatus.authDisabled) {
        const mockUser = {
          id: 1,
          name: 'Admin',
          email: 'admin@example.com',
          role: 'superadmin',
          permissions: ['manage_users', 'manage_kiosks', 'manage_system', 'view_logs'],
          disabled: false,
          roles: ['superadmin'],
        };
        login('mock_token', mockUser);
        setLoading(false);
        return;
      }

      // Normal auth flow when auth is enabled
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const user = await api.me(token);
          login(token, user);
        } catch (error) {
          localStorage.removeItem('auth_token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [login, authStatus, authStatusLoading]);

  if (loading || authStatusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If auth is disabled, always show protected content
  if (authStatus?.authDisabled) {
    return <>{children}</>;
  }

  // Normal auth flow - redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route
          path="tickets"
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <TicketsPage />
            </React.Suspense>
          }
        />
        <Route
          path="kiosks"
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <KiosksPage />
            </React.Suspense>
          }
        />
        <Route
          path="users"
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <UsersPage />
            </React.Suspense>
          }
        />
        <Route
          path="analytics"
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <AnalyticsPage />
            </React.Suspense>
          }
        />
        <Route
          path="notifications"
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <NotificationsPage />
            </React.Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <SettingsPage />
            </React.Suspense>
          }
        />
        <Route
          path="integrations"
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <IntegrationsPage />
            </React.Suspense>
          }
        />
        <Route
          path="kiosk-activation"
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <KioskActivationPage />
            </React.Suspense>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppRoutes />
          <ConnectedToastContainer />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
