import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Layout } from '@/components/layout';
import { ConnectedToastContainer } from '@/components/ui';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { api } from '@/lib/api';
import { LoginPage } from '@/pages/auth/LoginPage';
import { UniversalLoginPage } from '@/pages/auth/UniversalLoginPage';
import { NovaDashboard } from '@/pages/NovaDashboard';
import { SAMLConfigurationPage } from '@/pages/SAMLConfigurationPage';
import { UserManagementPage } from '@/pages/UserManagementPage';
import { VIPManagementPage } from '@/pages/VIPManagementPage';
import { useAuthStore } from '@/stores/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Showcase } from '@/components/ui/Showcase';

// Lazy load other pages for better performance
const TicketsPage = React.lazy(() => import('@/pages/TicketsPage').then(m => ({ default: m.TicketsPage })));
const KiosksPage = React.lazy(() => import('@/pages/KiosksPage').then(m => ({ default: m.KiosksPage })));
const AnalyticsPage = React.lazy(() => import('@/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const NotificationsPage = React.lazy(() => import('@/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const IntegrationsPage = React.lazy(() => import('@/pages/IntegrationsPage').then(m => ({ default: m.IntegrationsPage })));
const EmailAccountsPage = React.lazy(() => import('@/pages/EmailAccountsPage').then(m => ({ default: m.EmailAccountsPage })));
const ModuleManagementPage = React.lazy(() => import('@/pages/ModuleManagementPage').then(m => ({ default: m.ModuleManagementPage }))); 
const KioskActivationPage = React.lazy(() => import('@/pages/KioskActivationPage').then(m => ({ default: m.KioskActivationPage }))); 
const CatalogItemsPage = React.lazy(() => import('@/pages/CatalogItemsPage').then(m => ({ default: m.CatalogItemsPage }))); 
const KnowledgeListPage = React.lazy(() => import('@/pages/knowledge/KnowledgeListPage').then(m => ({ default: m.default }))); 
const KnowledgeDetailPage = React.lazy(() => import('@/pages/knowledge/KnowledgeDetailPage').then(m => ({ default: m.default }))); 
const KnowledgeEditPage = React.lazy(() => import('@/pages/knowledge/KnowledgeEditPage').then(m => ({ default: m.default })));
const APIDocumentationPage = React.lazy(() => import('@/pages/APIDocumentationPage').then(m => ({ default: m.default })));

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
        } catch {
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
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/login" element={<UniversalLoginPage />} />
      <Route path="/showcase" element={<Showcase />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<NovaDashboard />} />
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
          element={<UserManagementPage />}
        />
        <Route
          path="user-management"
          element={<UserManagementPage />}
        />
        <Route
          path="vip-management"
          element={<VIPManagementPage />}
        />
        <Route
          path="saml-configuration"
          element={<SAMLConfigurationPage />}
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
          path="email-accounts"
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <EmailAccountsPage />
            </React.Suspense>
          }
        />
        <Route
          path="modules"
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <ModuleManagementPage />
            </React.Suspense>
          }
        />
        <Route
          path="api-docs"
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <APIDocumentationPage />
            </React.Suspense>
          }
        />
        <Route
          path="catalog-items"
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <CatalogItemsPage />
            </React.Suspense>
          }
        />
        <Route
          path="knowledge"
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <KnowledgeListPage />
            </React.Suspense>
          }
        />
        <Route
          path="knowledge/new"
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <KnowledgeEditPage />
            </React.Suspense>
          }
        />
        <Route
          path="knowledge/:slug"
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <KnowledgeDetailPage />
            </React.Suspense>
          }
        />
        <Route
          path="knowledge/:slug/edit"
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <KnowledgeEditPage />
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
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <WebSocketProvider>
            <Router>
              <AppRoutes />
              <ConnectedToastContainer />
            </Router>
          </WebSocketProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
