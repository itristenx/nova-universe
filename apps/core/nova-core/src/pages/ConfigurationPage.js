import React, { useState, useEffect } from 'react';
import { Button, Card, Modal } from '@heroui/react';
import { ScheduleManager } from '@/components/ScheduleManager';
import { KioskConfigurationModal } from '@/components/KioskConfigurationModal';
import { GlobeAltIcon, CogIcon, ComputerDesktopIcon, ChartBarIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
export const _ConfigurationPage = () => {
    const [globalConfig, setGlobalConfig] = useState(null);
    const [configSummary, setConfigSummary] = useState(null);
    const [kiosks, setKiosks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedKiosk, setSelectedKiosk] = useState(null);
    const [showKioskConfigModal, setShowKioskConfigModal] = useState(false);
    const { addToast } = useToastStore();
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            setLoading(true);
            const [globalData, summaryData, kiosksData] = await Promise.all([
                api.getGlobalConfiguration(),
                api.getConfigurationSummary(),
                api.getKiosks()
            ]); // TODO-LINT: move to async function
            setGlobalConfig(globalData);
            setConfigSummary(summaryData);
            setKiosks(kiosksData);
        }
        catch (error) {
            console.error('Failed to load configuration data:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to load configuration data',
            });
        }
        finally {
            setLoading(false);
        }
    };
    const updateGlobalConfig = async (updates) => {
        try {
            await api.updateGlobalConfiguration(updates); // TODO-LINT: move to async function
            setGlobalConfig(prev => prev ? { ...prev, ...updates } : null);
            addToast({
                type: 'success',
                title: 'Success',
                description: 'Global configuration updated successfully',
            });
            loadData(); // Reload to get updated summary
        }
        catch (error) {
            console.error('Failed to update global configuration:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to update global configuration',
            });
            throw error;
        }
    };
    const toggleKioskScope = async (kioskId, newScope) => {
        try {
            await api.setKioskConfigScope(kioskId, newScope); // TODO-LINT: move to async function
            await loadData(); // TODO-LINT: move to async function
            addToast({
                type: 'success',
                title: 'Success',
                description: `Kiosk ${kioskId} set to ${newScope} management`,
            });
        }
        catch (error) {
            console.error('Failed to update kiosk scope:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to update kiosk management scope',
            });
        }
    };
    const resetAllToGlobal = async () => {
        try {
            await api.resetAllKiosksToGlobal(); // TODO-LINT: move to async function
            await loadData(); // TODO-LINT: move to async function
            setShowResetModal(false);
            addToast({
                type: 'success',
                title: 'Success',
                description: 'All kiosks reset to global configuration',
            });
        }
        catch (error) {
            console.error('Failed to reset kiosks to global:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to reset kiosks to global configuration',
            });
        }
    };
    const openKioskConfig = (kiosk) => {
        setSelectedKiosk(kiosk);
        setShowKioskConfigModal(true);
    };
    const tabs = [
        { id: 'overview', name: 'Overview', icon: ChartBarIcon },
        { id: 'global-status', name: 'Global Status', icon: GlobeAltIcon },
        { id: 'global-schedule', name: 'Global Schedule', icon: CogIcon },
        { id: 'kiosks', name: 'Individual Kiosks', icon: ComputerDesktopIcon },
    ];
    if (loading) {
        return (React.createElement("div", { className: "flex items-center justify-center py-12" },
            React.createElement("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" })));
    }
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex justify-between items-center" },
            React.createElement("div", null,
                React.createElement("h1", { className: "text-2xl font-bold text-gray-900" }, "Configuration Management"),
                React.createElement("p", { className: "mt-1 text-sm text-gray-600" }, "Manage global settings and individual kiosk configurations")),
            React.createElement("div", { className: "flex space-x-3" },
                React.createElement(Button, { variant: "secondary", onClick: () => setShowResetModal(true), className: "text-orange-600 hover:text-orange-700" },
                    React.createElement(ArrowPathIcon, { className: "h-4 w-4 mr-2" }),
                    "Reset All to Global"),
                React.createElement(Button, { onClick: loadData }, "Refresh"))),
        configSummary && (React.createElement(Card, { className: "p-6" },
            React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-4" }, "Configuration Summary"),
            React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" },
                React.createElement("div", { className: "text-center" },
                    React.createElement("div", { className: "text-2xl font-bold text-blue-600" }, configSummary.totalKiosks),
                    React.createElement("div", { className: "text-sm text-gray-600" }, "Total Kiosks")),
                React.createElement("div", { className: "text-center" },
                    React.createElement("div", { className: "text-2xl font-bold text-green-600" }, configSummary.globallyManaged),
                    React.createElement("div", { className: "text-sm text-gray-600" }, "Globally Managed")),
                React.createElement("div", { className: "text-center" },
                    React.createElement("div", { className: "text-2xl font-bold text-orange-600" }, configSummary.individuallyManaged),
                    React.createElement("div", { className: "text-sm text-gray-600" }, "Individually Managed")),
                React.createElement("div", { className: "text-center" },
                    React.createElement("div", { className: "text-2xl font-bold text-purple-600" }, Object.values(configSummary.overridesByType).reduce((a, b) => a + b, 0)),
                    React.createElement("div", { className: "text-sm text-gray-600" }, "Total Overrides"))))),
        React.createElement("div", { className: "border-b border-gray-200" },
            React.createElement("nav", { className: "-mb-px flex space-x-8" }, tabs.map((tab) => (React.createElement("button", { key: tab.id, onClick: () => setActiveTab(tab.id), className: `group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}` },
                React.createElement(tab.icon, { className: `-ml-0.5 mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}` }),
                tab.name))))),
        React.createElement("div", { className: "space-y-6" },
            activeTab === 'overview' && (React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
                React.createElement(Card, { className: "p-6" },
                    React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-4" }, "Override Summary"),
                    React.createElement("div", { className: "space-y-3" }, configSummary && Object.entries(configSummary.overridesByType).map(([type, count]) => (React.createElement("div", { key: type, className: "flex justify-between items-center" },
                        React.createElement("span", { className: "text-sm font-medium text-gray-700 capitalize" }, type),
                        React.createElement("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800" },
                            count,
                            " override",
                            count !== 1 ? 's' : '')))))),
                React.createElement(Card, { className: "p-6" },
                    React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-4" }, "Quick Actions"),
                    React.createElement("div", { className: "space-y-3" },
                        React.createElement(Button, { variant: "secondary", onClick: () => api.applyGlobalConfigToAll('status'), className: "w-full" }, "Apply Global Status to All"),
                        React.createElement(Button, { variant: "secondary", onClick: () => api.applyGlobalConfigToAll('schedule'), className: "w-full" }, "Apply Global Schedule to All"),
                        React.createElement(Button, { variant: "secondary", onClick: () => api.applyGlobalConfigToAll('branding'), className: "w-full" }, "Apply Global Branding to All"))))),
            activeTab === 'global-status' && globalConfig && (React.createElement(Card, { className: "p-6" },
                React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-6" }, "Global Status Configuration"),
                React.createElement("div", { className: "space-y-6" },
                    React.createElement("div", { className: "flex items-center space-x-2" },
                        React.createElement("input", { type: "checkbox", id: "global-status-enabled", checked: globalConfig.defaultStatus.enabled, onChange: (e) => updateGlobalConfig({
                                defaultStatus: {
                                    ...globalConfig.defaultStatus,
                                    enabled: e.target.checked
                                }
                            }), className: "rounded border-gray-300" }),
                        React.createElement("label", { htmlFor: "global-status-enabled", className: "text-sm font-medium text-gray-700" }, "Enable status system globally")),
                    React.createElement("div", null,
                        React.createElement("label", { htmlFor: "global-current-status", className: "block text-sm font-medium text-gray-700 mb-2" }, "Current Global Status"),
                        React.createElement("select", { id: "global-current-status", value: globalConfig.defaultStatus.currentStatus, onChange: (e) => updateGlobalConfig({
                                defaultStatus: {
                                    ...globalConfig.defaultStatus,
                                    currentStatus: e.target.value
                                }
                            }), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" },
                            React.createElement("option", { value: "open" }, "Open"),
                            React.createElement("option", { value: "closed" }, "Closed"),
                            React.createElement("option", { value: "meeting" }, "In a Meeting"),
                            React.createElement("option", { value: "brb" }, "Be Right Back"),
                            React.createElement("option", { value: "lunch" }, "Out to Lunch"))),
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement("div", null,
                            React.createElement("label", { htmlFor: "global-open-message", className: "block text-sm font-medium text-gray-700 mb-2" }, "Open Message"),
                            React.createElement("input", { id: "global-open-message", type: "text", value: globalConfig.defaultStatus.messages.openMessage, onChange: (e) => updateGlobalConfig({
                                    defaultStatus: {
                                        ...globalConfig.defaultStatus,
                                        messages: {
                                            ...globalConfig.defaultStatus.messages,
                                            openMessage: e.target.value
                                        }
                                    }
                                }), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })),
                        React.createElement("div", null,
                            React.createElement("label", { htmlFor: "global-closed-message", className: "block text-sm font-medium text-gray-700 mb-2" }, "Closed Message"),
                            React.createElement("input", { id: "global-closed-message", type: "text", value: globalConfig.defaultStatus.messages.closedMessage, onChange: (e) => updateGlobalConfig({
                                    defaultStatus: {
                                        ...globalConfig.defaultStatus,
                                        messages: {
                                            ...globalConfig.defaultStatus.messages,
                                            closedMessage: e.target.value
                                        }
                                    }
                                }), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })),
                        React.createElement("div", null,
                            React.createElement("label", { htmlFor: "global-meeting-message", className: "block text-sm font-medium text-gray-700 mb-2" }, "Meeting Message"),
                            React.createElement("input", { id: "global-meeting-message", type: "text", value: globalConfig.defaultStatus.messages.meetingMessage, onChange: (e) => updateGlobalConfig({
                                    defaultStatus: {
                                        ...globalConfig.defaultStatus,
                                        messages: {
                                            ...globalConfig.defaultStatus.messages,
                                            meetingMessage: e.target.value
                                        }
                                    }
                                }), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })),
                        React.createElement("div", null,
                            React.createElement("label", { htmlFor: "global-brb-message", className: "block text-sm font-medium text-gray-700 mb-2" }, "Be Right Back Message"),
                            React.createElement("input", { id: "global-brb-message", type: "text", value: globalConfig.defaultStatus.messages.brbMessage, onChange: (e) => updateGlobalConfig({
                                    defaultStatus: {
                                        ...globalConfig.defaultStatus,
                                        messages: {
                                            ...globalConfig.defaultStatus.messages,
                                            brbMessage: e.target.value
                                        }
                                    }
                                }), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })),
                        React.createElement("div", null,
                            React.createElement("label", { htmlFor: "global-lunch-message", className: "block text-sm font-medium text-gray-700 mb-2" }, "Out to Lunch Message"),
                            React.createElement("input", { id: "global-lunch-message", type: "text", value: globalConfig.defaultStatus.messages.lunchMessage, onChange: (e) => updateGlobalConfig({
                                    defaultStatus: {
                                        ...globalConfig.defaultStatus,
                                        messages: {
                                            ...globalConfig.defaultStatus.messages,
                                            lunchMessage: e.target.value
                                        }
                                    }
                                }), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })))))),
            activeTab === 'global-schedule' && globalConfig && (React.createElement("div", { className: "space-y-6" },
                React.createElement(Card, { className: "p-6" },
                    React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-6" }, "Global Schedule Configuration"),
                    React.createElement(ScheduleManager, { title: "Global Automatic Schedule", config: globalConfig.defaultSchedule, onSave: (newSchedule) => updateGlobalConfig({ defaultSchedule: newSchedule }), showEnabled: true })),
                React.createElement(Card, { className: "p-6" },
                    React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-6" }, "Global Office Hours Configuration"),
                    React.createElement(ScheduleManager, { title: "Global Office Hours", config: globalConfig.defaultOfficeHours, onSave: (newOfficeHours) => updateGlobalConfig({ defaultOfficeHours: newOfficeHours }), showEnabled: true, showTitle: true, showNextOpen: true })))),
            activeTab === 'kiosks' && (React.createElement(Card, { className: "p-6" },
                React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-6" }, "Individual Kiosk Management"),
                React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement("table", { className: "min-w-full divide-y divide-gray-200" },
                        React.createElement("thead", { className: "bg-gray-50" },
                            React.createElement("tr", null,
                                React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Kiosk ID"),
                                React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Management Mode"),
                                React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Overrides"),
                                React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Status"),
                                React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Actions"))),
                        React.createElement("tbody", { className: "bg-white divide-y divide-gray-200" }, kiosks.map((kiosk) => (React.createElement("tr", { key: kiosk.id },
                            React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" }, kiosk.id),
                            React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" },
                                React.createElement("div", { className: "flex items-center space-x-2" },
                                    React.createElement("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${kiosk.configScope === 'global'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-orange-100 text-orange-800'}` }, kiosk.configScope === 'global' ? 'Global' : 'Individual'),
                                    React.createElement("button", { onClick: () => toggleKioskScope(kiosk.id, kiosk.configScope === 'global' ? 'individual' : 'global'), className: "text-sm text-blue-600 hover:text-blue-800" }, "Switch"))),
                            React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900" }, kiosk.hasOverrides ? (React.createElement("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800" },
                                kiosk.overrideCount,
                                " override",
                                kiosk.overrideCount !== 1 ? 's' : '')) : (React.createElement("span", { className: "text-gray-500" }, "None"))),
                            React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" },
                                React.createElement("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${kiosk.effectiveConfig.currentStatus === 'open' ? 'bg-green-100 text-green-800' :
                                        kiosk.effectiveConfig.currentStatus === 'closed' ? 'bg-red-100 text-red-800' :
                                            kiosk.effectiveConfig.currentStatus === 'meeting' ? 'bg-purple-100 text-purple-800' :
                                                kiosk.effectiveConfig.currentStatus === 'brb' ? 'bg-yellow-100 text-yellow-800' :
                                                    kiosk.effectiveConfig.currentStatus === 'lunch' ? 'bg-orange-100 text-orange-800' :
                                                        kiosk.effectiveConfig.currentStatus === 'error' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-gray-100 text-gray-800'}` }, kiosk.effectiveConfig.currentStatus)),
                            React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900" },
                                React.createElement(Button, { variant: "secondary", size: "sm", onClick: () => openKioskConfig(kiosk) }, "Configure"))))))))))),
        React.createElement(Modal, { isOpen: showResetModal, onClose: () => setShowResetModal(false), title: "Reset All Kiosks to Global Configuration", size: "md" },
            React.createElement("div", { className: "space-y-4" },
                React.createElement("div", { className: "flex items-start space-x-3" },
                    React.createElement(ExclamationTriangleIcon, { className: "h-6 w-6 text-orange-500 mt-0.5" }),
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-sm text-gray-900" }, "This action will reset all kiosks to use global configuration settings, removing all individual overrides."),
                        React.createElement("p", { className: "text-sm text-gray-600 mt-2" }, "This action cannot be undone.")))),
            React.createElement("div", { className: "flex justify-end space-x-3 mt-6" },
                React.createElement(Button, { variant: "secondary", onClick: () => setShowResetModal(false) }, "Cancel"),
                React.createElement(Button, { variant: "danger", onClick: resetAllToGlobal }, "Reset All Kiosks"))),
        selectedKiosk && globalConfig && (React.createElement(KioskConfigurationModal, { isOpen: showKioskConfigModal, onClose: () => setShowKioskConfigModal(false), kiosk: selectedKiosk, globalConfig: globalConfig, onUpdate: loadData }))));
};
