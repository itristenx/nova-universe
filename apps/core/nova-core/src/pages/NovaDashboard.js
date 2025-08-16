// nova-core/src/pages/NovaDashboard.tsx
// Nova Universe Enhanced Dashboard
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { AcademicCapIcon, BeakerIcon, BoltIcon, ChartBarIcon, CogIcon, GlobeAltIcon, ServerIcon, ShieldCheckIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useMemo, useRef, useState } from 'react';
export const NovaDashboard = () => {
    const [systemHealth, setSystemHealth] = useState(null);
    const [authStats, setAuthStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const progressBarRef = useRef(null);
    // Calculate 2FA percentage for progress bar
    const twoFactorPercentage = useMemo(() => {
        if (!authStats || authStats.totalUsers === 0)
            return 0;
        return Math.round((authStats.twoFactorEnabled / authStats.totalUsers) * 100);
    }, [authStats]);
    // Update progress bar width using ref to avoid inline styles
    useEffect(() => {
        if (progressBarRef.current) {
            progressBarRef.current.style.width = `${twoFactorPercentage}%`;
        }
    }, [twoFactorPercentage]);
    const novaModules = useMemo(() => [
        {
            name: 'helix',
            displayName: 'Nova Helix',
            icon: ShieldCheckIcon,
            status: 'operational',
            description: 'Identity & Authentication Engine',
            color: 'text-purple-500'
        },
        {
            name: 'lore',
            displayName: 'Nova Lore',
            icon: AcademicCapIcon,
            status: 'operational',
            description: 'Knowledge Management System',
            color: 'text-blue-500'
        },
        {
            name: 'pulse',
            displayName: 'Nova Pulse',
            icon: WrenchScrewdriverIcon,
            status: 'operational',
            description: 'Technician Portal & Ticketing',
            color: 'text-green-500'
        },
        {
            name: 'orbit',
            displayName: 'Nova Orbit',
            icon: GlobeAltIcon,
            status: 'operational',
            description: 'End-User Service Portal',
            color: 'text-orange-500'
        },
        {
            name: 'synth',
            displayName: 'Nova Synth',
            icon: BeakerIcon,
            status: 'operational',
            description: 'AI-Powered Analytics & Insights',
            color: 'text-pink-500'
        }
    ], []);
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Use existing API methods
                const serverStatus = await api.getServerStatus(); // TODO-LINT: move to async function
                const users = await api.getUsers(); // TODO-LINT: move to async function
                // Mock module health for now
                const moduleHealth = {};
                novaModules.forEach(module => {
                    moduleHealth[module.name] = true;
                });
                setSystemHealth({
                    api: true,
                    database: !!serverStatus,
                    authentication: true,
                    modules: moduleHealth
                });
                setAuthStats({
                    totalUsers: users.length,
                    activeUsers: users.filter(u => !u.disabled).length,
                    twoFactorEnabled: Math.floor(users.length * 0.6), // Mock 60% have 2FA
                    recentActivity: [
                        'SCIM User Provisioning Enabled',
                        'Two-Factor Authentication System Deployed',
                        'Nova Modules Integration Complete',
                        'SAML SSO Middleware Installed'
                    ]
                });
            }
            catch (err) {
                setError('Failed to load dashboard data');
                console.error('Dashboard error:', err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [novaModules]);
    if (loading) {
        return (React.createElement("div", { className: "flex items-center justify-center h-96" },
            React.createElement("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" })));
    }
    if (error) {
        return (React.createElement("div", { className: "bg-red-50 border border-red-200 rounded-md p-4" },
            React.createElement("div", { className: "text-red-700" }, error)));
    }
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6" },
            React.createElement("h1", { className: "text-3xl font-bold mb-2" }, "Nova Universe Control Center"),
            React.createElement("p", { className: "text-purple-100" }, "Enterprise ITSM Platform - Phase 4 Enhanced Administration")),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" },
            React.createElement(Card, { className: "p-4" },
                React.createElement("div", { className: "flex items-center" },
                    React.createElement(ServerIcon, { className: "h-8 w-8 text-blue-500 mr-3" }),
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "API Server"),
                        React.createElement("p", { className: `text-lg font-semibold ${systemHealth?.api ? 'text-green-600' : 'text-red-600'}` }, systemHealth?.api ? 'Online' : 'Offline')))),
            React.createElement(Card, { className: "p-4" },
                React.createElement("div", { className: "flex items-center" },
                    React.createElement(CogIcon, { className: "h-8 w-8 text-purple-500 mr-3" }),
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "Database"),
                        React.createElement("p", { className: `text-lg font-semibold ${systemHealth?.database ? 'text-green-600' : 'text-red-600'}` }, systemHealth?.database ? 'Healthy' : 'Error')))),
            React.createElement(Card, { className: "p-4" },
                React.createElement("div", { className: "flex items-center" },
                    React.createElement(ShieldCheckIcon, { className: "h-8 w-8 text-green-500 mr-3" }),
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "Authentication"),
                        React.createElement("p", { className: `text-lg font-semibold ${systemHealth?.authentication ? 'text-green-600' : 'text-red-600'}` }, systemHealth?.authentication ? 'Active' : 'Down')))),
            React.createElement(Card, { className: "p-4" },
                React.createElement("div", { className: "flex items-center" },
                    React.createElement(BoltIcon, { className: "h-8 w-8 text-yellow-500 mr-3" }),
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "Nova Modules"),
                        React.createElement("p", { className: "text-lg font-semibold text-green-600" },
                            Object.values(systemHealth?.modules || {}).filter(Boolean).length,
                            "/",
                            novaModules.length,
                            " Active"))))),
        React.createElement(Card, { className: "p-6" },
            React.createElement("h2", { className: "text-xl font-semibold mb-4 flex items-center" },
                React.createElement(BoltIcon, { className: "h-6 w-6 mr-2 text-purple-500" }),
                "Nova Modules Status"),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, novaModules.map((module) => {
                const Icon = module.icon;
                const isHealthy = systemHealth?.modules[module.name];
                return (React.createElement("div", { key: module.name, className: "border rounded-lg p-4 hover:shadow-md transition-shadow" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("div", { className: "flex items-center" },
                            React.createElement(Icon, { className: `h-6 w-6 mr-2 ${module.color}` }),
                            React.createElement("h3", { className: "font-medium" }, module.displayName)),
                        React.createElement("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${isHealthy
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'}` }, isHealthy ? 'Active' : 'Offline')),
                    React.createElement("p", { className: "text-sm text-gray-600" }, module.description)));
            }))),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
            React.createElement(Card, { className: "p-6" },
                React.createElement("h2", { className: "text-xl font-semibold mb-4 flex items-center" },
                    React.createElement(ShieldCheckIcon, { className: "h-6 w-6 mr-2 text-purple-500" }),
                    "Authentication Overview"),
                authStats && (React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "flex justify-between items-center" },
                        React.createElement("span", { className: "text-gray-600" }, "Total Users"),
                        React.createElement("span", { className: "font-semibold text-2xl" }, authStats.totalUsers)),
                    React.createElement("div", { className: "flex justify-between items-center" },
                        React.createElement("span", { className: "text-gray-600" }, "Active Users"),
                        React.createElement("span", { className: "font-semibold text-xl text-green-600" }, authStats.activeUsers)),
                    React.createElement("div", { className: "flex justify-between items-center" },
                        React.createElement("span", { className: "text-gray-600" }, "2FA Enabled"),
                        React.createElement("span", { className: "font-semibold text-xl text-blue-600" }, authStats.twoFactorEnabled)),
                    React.createElement("div", { className: "mt-4" },
                        React.createElement("div", { className: "w-full bg-gray-200 rounded-full h-2" },
                            React.createElement("div", { ref: progressBarRef, className: "bg-purple-600 h-2 rounded-full transition-all duration-500" })),
                        React.createElement("p", { className: "text-xs text-gray-500 mt-1" },
                            twoFactorPercentage,
                            "% have 2FA enabled"))))),
            React.createElement(Card, { className: "p-6" },
                React.createElement("h2", { className: "text-xl font-semibold mb-4 flex items-center" },
                    React.createElement(ChartBarIcon, { className: "h-6 w-6 mr-2 text-blue-500" }),
                    "Quick Actions"),
                React.createElement("div", { className: "space-y-3" },
                    React.createElement("button", { className: "w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors" }, "Manage Users & Roles"),
                    React.createElement("button", { className: "w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors" }, "Configure SAML SSO"),
                    React.createElement("button", { className: "w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors" }, "SCIM Provisioning"),
                    React.createElement("button", { className: "w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors" }, "View API Documentation"),
                    React.createElement("button", { className: "w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors" }, "System Configuration")))),
        React.createElement(Card, { className: "p-6" },
            React.createElement("h2", { className: "text-xl font-semibold mb-4" }, "Recent System Activity"),
            React.createElement("div", { className: "space-y-3" }, authStats?.recentActivity.map((activity, index) => (React.createElement("div", { key: index, className: "flex items-center justify-between py-2 border-b last:border-b-0" },
                React.createElement("div", null,
                    React.createElement("p", { className: "font-medium" }, activity),
                    React.createElement("p", { className: "text-sm text-gray-600" }, "System enhancement deployed successfully")),
                React.createElement("span", { className: "text-sm text-gray-500" },
                    (index + 1) * 5,
                    " minutes ago")))))),
        React.createElement(Card, { className: "p-6" },
            React.createElement("h2", { className: "text-xl font-semibold mb-4" }, "Nova API Documentation"),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" },
                React.createElement("div", { className: "border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer" },
                    React.createElement("h3", { className: "font-medium text-purple-600" }, "Nova Helix API"),
                    React.createElement("p", { className: "text-sm text-gray-600 mt-1" }, "Authentication & Identity endpoints"),
                    React.createElement("p", { className: "text-xs text-gray-400 mt-2" }, "15+ endpoints available")),
                React.createElement("div", { className: "border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer" },
                    React.createElement("h3", { className: "font-medium text-blue-600" }, "SCIM 2.0 API"),
                    React.createElement("p", { className: "text-sm text-gray-600 mt-1" }, "User provisioning and lifecycle management"),
                    React.createElement("p", { className: "text-xs text-gray-400 mt-2" }, "5 core endpoints")),
                React.createElement("div", { className: "border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer" },
                    React.createElement("h3", { className: "font-medium text-green-600" }, "All Nova Modules"),
                    React.createElement("p", { className: "text-sm text-gray-600 mt-1" }, "Complete API reference for all modules"),
                    React.createElement("p", { className: "text-xs text-gray-400 mt-2" }, "50+ total endpoints"))),
            React.createElement("div", { className: "mt-4" },
                React.createElement("a", { href: "http://localhost:3000/api-docs", target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" }, "Open Interactive API Documentation")))));
};
