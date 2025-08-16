import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Layout } from '@/components/layout';
import { ConnectedToastContainer } from '@/components/ui';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { api } from '@/lib/api';
import { LoginPage } from '@/pages/auth/LoginPage';
import { NovaDashboard } from '@/pages/NovaDashboard';
import { SAMLConfigurationPage } from '@/pages/SAMLConfigurationPage';
import { UserManagementPage } from '@/pages/UserManagementPage';
import { VIPManagementPage } from '@/pages/VIPManagementPage';
import { useAuthStore } from '@/stores/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Showcase } from '@/components/ui/Showcase';
import { HeroUIProvider } from '@heroui/react';
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
const ProtectedRoute = ({ children }) => {
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
                    const user = await api.me(token); // TODO-LINT: move to async function
                    login(token, user);
                }
                catch {
                    localStorage.removeItem('auth_token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, [login, authStatus, authStatusLoading]);
    if (loading || authStatusLoading) {
        return (React.createElement("div", { className: "min-h-screen flex items-center justify-center" },
            React.createElement("div", { className: "animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600" })));
    }
    // If auth is disabled, always show protected content
    if (authStatus?.authDisabled) {
        return React.createElement(React.Fragment, null, children);
    }
    // Normal auth flow - redirect to login if not authenticated
    if (!isAuthenticated) {
        return React.createElement(Navigate, { to: "/login", replace: true });
    }
    return React.createElement(React.Fragment, null, children);
};
const AppRoutes = () => {
    return (React.createElement(Routes, null,
        React.createElement(Route, { path: "/login", element: React.createElement(LoginPage, null) }),
        React.createElement(Route, { path: "/showcase", element: React.createElement(Showcase, null) }),
        React.createElement(Route, { path: "/", element: React.createElement(ProtectedRoute, null,
                React.createElement(Layout, null)) },
            React.createElement(Route, { index: true, element: React.createElement(NovaDashboard, null) }),
            React.createElement(Route, { path: "tickets", element: React.createElement(React.Suspense, { fallback: React.createElement("div", null, "Loading...") },
                    React.createElement(TicketsPage, null)) }),
            React.createElement(Route, { path: "kiosks", element: React.createElement(React.Suspense, { fallback: React.createElement("div", null, "Loading...") },
                    React.createElement(KiosksPage, null)) }),
            React.createElement(Route, { path: "users", element: React.createElement(UserManagementPage, null) }),
            React.createElement(Route, { path: "user-management", element: React.createElement(UserManagementPage, null) }),
            React.createElement(Route, { path: "vip-management", element: React.createElement(VIPManagementPage, null) }),
            React.createElement(Route, { path: "saml-configuration", element: React.createElement(SAMLConfigurationPage, null) }),
            React.createElement(Route, { path: "analytics", element: React.createElement(React.Suspense, { fallback: React.createElement("div", null, "Loading...") },
                    React.createElement(AnalyticsPage, null)) }),
            React.createElement(Route, { path: "notifications", element: React.createElement(React.Suspense, { fallback: React.createElement("div", null, "Loading...") },
                    React.createElement(NotificationsPage, null)) }),
            React.createElement(Route, { path: "settings", element: React.createElement(React.Suspense, { fallback: React.createElement("div", null, "Loading...") },
                    React.createElement(SettingsPage, null)) }),
            React.createElement(Route, { path: "integrations", element: React.createElement(React.Suspense, { fallback: React.createElement("div", null, "Loading...") },
                    React.createElement(IntegrationsPage, null)) }),
            React.createElement(Route, { path: "email-accounts", element: React.createElement(React.Suspense, { fallback: React.createElement("div", null, "Loading...") },
                    React.createElement(EmailAccountsPage, null)) }),
            React.createElement(Route, { path: "modules", element: React.createElement(React.Suspense, { fallback: React.createElement("div", null, "Loading...") },
                    React.createElement(ModuleManagementPage, null)) }),
            React.createElement(Route, { path: "api-docs", element: React.createElement(React.Suspense, { fallback: React.createElement("div", null, "Loading...") },
                    React.createElement(APIDocumentationPage, null)) }),
            React.createElement(Route, { path: "catalog-items", element: React.createElement(React.Suspense, { fallback: React.createElement("div", null, "Loading...") },
                    React.createElement(CatalogItemsPage, null)) }),
            React.createElement(Route, { path: "knowledge", element: React.createElement(React.Suspense, { fallback: React.createElement("div", null, "Loading...") },
                    React.createElement(KnowledgeListPage, null)) }),
            React.createElement(Route, { path: "knowledge/new", element: React.createElement(React.Suspense, { fallback: React.createElement("div", null, "Loading...") },
                    React.createElement(KnowledgeEditPage, null)) }),
            React.createElement(Route, { path: "knowledge/:slug", element: React.createElement(React.Suspense, { fallback: React.createElement("div", null, "Loading...") },
                    React.createElement(KnowledgeDetailPage, null)) }),
            React.createElement(Route, { path: "knowledge/:slug/edit", element: React.createElement(React.Suspense, { fallback: React.createElement("div", null, "Loading...") },
                    React.createElement(KnowledgeEditPage, null)) }),
            React.createElement(Route, { path: "kiosk-activation", element: React.createElement(React.Suspense, { fallback: React.createElement("div", null, "Loading...") },
                    React.createElement(KioskActivationPage, null)) })),
        React.createElement(Route, { path: "*", element: React.createElement(Navigate, { to: "/", replace: true }) })));
};
const App = () => {
    return (React.createElement(ErrorBoundary, null,
        React.createElement(HeroUIProvider, null,
            React.createElement(ThemeProvider, null,
                React.createElement(QueryClientProvider, { client: queryClient },
                    React.createElement(Router, null,
                        React.createElement(AppRoutes, null),
                        React.createElement(ConnectedToastContainer, null)))))));
};
export default App;
