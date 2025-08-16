import React, { useState, useEffect } from 'react';
import { Button, Modal } from '@/components/ui';
import { ScheduleManager } from '@/components/ScheduleManager';
import { CogIcon, ClockIcon, BellIcon, PhotoIcon, ExclamationTriangleIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
export const _KioskConfigurationModal = ({ isOpen, onClose, kiosk, globalConfig, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('status');
    const [kioskConfig, setKioskConfig] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const { addToast } = useToastStore();
    // Local state for each configuration type
    const [statusConfig, setStatusConfig] = useState({
        enabled: kiosk.effectiveConfig.statusEnabled,
        currentStatus: kiosk.effectiveConfig.currentStatus,
        customMessages: {
            openMessage: kiosk.effectiveConfig.openMsg,
            closedMessage: kiosk.effectiveConfig.closedMsg,
            meetingMessage: 'In a Meeting - Back Soon',
            brbMessage: 'Be Right Back',
            lunchMessage: 'Out to Lunch - Back in 1 Hour',
            unavailableMessage: 'Status Unavailable'
        }
    });
    const [scheduleConfig, setScheduleConfig] = useState(globalConfig.defaultSchedule);
    const [officeHoursConfig, setOfficeHoursConfig] = useState(globalConfig.defaultOfficeHours);
    const [brandingConfig, setBrandingConfig] = useState({
        logoUrl: kiosk.effectiveConfig.logoUrl || globalConfig.defaultBranding.logoUrl,
        backgroundUrl: kiosk.effectiveConfig.bgUrl || globalConfig.defaultBranding.backgroundUrl || '',
        welcomeMessage: globalConfig.defaultBranding.welcomeMessage,
        helpMessage: globalConfig.defaultBranding.helpMessage
    });
    useEffect(() => {
        if (isOpen && kiosk) {
            loadKioskConfiguration();
        }
    }, [isOpen, kiosk.id]);
    const loadKioskConfiguration = async () => {
        try {
            setLoading(true);
            const config = await api.getKioskConfiguration(kiosk.id); // TODO-LINT: move to async function
            setKioskConfig(config);
            // Update local state with existing overrides
            if (config.statusConfig) {
                setStatusConfig({
                    enabled: config.statusConfig.enabled,
                    currentStatus: config.statusConfig.currentStatus,
                    customMessages: {
                        openMessage: config.statusConfig.customMessages?.openMessage || statusConfig.customMessages.openMessage,
                        closedMessage: config.statusConfig.customMessages?.closedMessage || statusConfig.customMessages.closedMessage,
                        meetingMessage: config.statusConfig.customMessages?.meetingMessage || statusConfig.customMessages.meetingMessage,
                        brbMessage: config.statusConfig.customMessages?.brbMessage || statusConfig.customMessages.brbMessage,
                        lunchMessage: config.statusConfig.customMessages?.lunchMessage || statusConfig.customMessages.lunchMessage,
                        unavailableMessage: config.statusConfig.customMessages?.unavailableMessage || statusConfig.customMessages.unavailableMessage
                    }
                });
            }
            if (config.scheduleConfig) {
                setScheduleConfig(config.scheduleConfig.schedule);
            }
            if (config.officeHoursConfig) {
                setOfficeHoursConfig(config.officeHoursConfig.officeHours);
            }
            if (config.brandingConfig) {
                setBrandingConfig({
                    logoUrl: config.brandingConfig.logoUrl || brandingConfig.logoUrl,
                    backgroundUrl: config.brandingConfig.backgroundUrl || brandingConfig.backgroundUrl,
                    welcomeMessage: config.brandingConfig.welcomeMessage || brandingConfig.welcomeMessage,
                    helpMessage: config.brandingConfig.helpMessage || brandingConfig.helpMessage
                });
            }
        }
        catch (error) {
            console.error('Failed to load kiosk configuration:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to load kiosk configuration',
            });
        }
        finally {
            setLoading(false);
        }
    };
    const saveOverride = async (configType) => {
        try {
            setSaving(true);
            let configData;
            switch (configType) {
                case 'status':
                    configData = statusConfig;
                    break;
                case 'schedule':
                    configData = scheduleConfig;
                    break;
                case 'office-hours':
                    configData = officeHoursConfig;
                    break;
                case 'branding':
                    configData = brandingConfig;
                    break;
            }
            await api.setKioskOverride(kiosk.id, configType === 'office-hours' ? 'officeHours' : configType, configData); // TODO-LINT: move to async function
            addToast({
                type: 'success',
                title: 'Success',
                description: `${configType} configuration saved successfully`,
            });
            onUpdate();
            await loadKioskConfiguration(); // TODO-LINT: move to async function
        }
        catch (error) {
            console.error(`Failed to save ${configType} override:`, error);
            addToast({
                type: 'error',
                title: 'Error',
                description: `Failed to save ${configType} configuration`,
            });
        }
        finally {
            setSaving(false);
        }
    };
    const removeOverride = async (configType) => {
        try {
            setSaving(true);
            await api.removeKioskOverride(kiosk.id, configType === 'office-hours' ? 'officeHours' : configType); // TODO-LINT: move to async function
            addToast({
                type: 'success',
                title: 'Success',
                description: `${configType} override removed - using global settings`,
            });
            onUpdate();
            await loadKioskConfiguration(); // TODO-LINT: move to async function
        }
        catch (error) {
            console.error(`Failed to remove ${configType} override:`, error);
            addToast({
                type: 'error',
                title: 'Error',
                description: `Failed to remove ${configType} override`,
            });
        }
        finally {
            setSaving(false);
        }
    };
    const hasOverride = (configType) => {
        if (!kioskConfig)
            return false;
        switch (configType) {
            case 'status':
                return !!kioskConfig.statusConfig;
            case 'schedule':
                return !!kioskConfig.scheduleConfig;
            case 'office-hours':
                return !!kioskConfig.officeHoursConfig;
            case 'branding':
                return !!kioskConfig.brandingConfig;
            default:
                return false;
        }
    };
    const tabs = [
        { id: 'status', name: 'Status', icon: CogIcon },
        { id: 'schedule', name: 'Schedule', icon: ClockIcon },
        { id: 'office-hours', name: 'Office Hours', icon: BellIcon },
        { id: 'branding', name: 'Branding', icon: PhotoIcon },
    ];
    const currentlyUsingGlobal = kiosk.configScope === 'global';
    return (React.createElement(Modal, { isOpen: isOpen, onClose: onClose, title: `Configure ${kiosk.id}`, size: "xl" },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: `border rounded-md p-4 ${currentlyUsingGlobal ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}` },
                React.createElement("div", { className: "flex items-start space-x-3" },
                    currentlyUsingGlobal ? (React.createElement(CheckCircleIcon, { className: "h-5 w-5 text-blue-500 mt-0.5" })) : (React.createElement(ExclamationTriangleIcon, { className: "h-5 w-5 text-orange-500 mt-0.5" })),
                    React.createElement("div", null,
                        React.createElement("h3", { className: `text-sm font-medium ${currentlyUsingGlobal ? 'text-blue-800' : 'text-orange-800'}` },
                            "Configuration Mode: ",
                            kiosk.configScope === 'global' ? 'Global' : 'Individual'),
                        React.createElement("div", { className: `mt-2 text-sm ${currentlyUsingGlobal ? 'text-blue-700' : 'text-orange-700'}` }, currentlyUsingGlobal ? (React.createElement("p", null, "This kiosk uses global configuration settings. Any overrides you create will switch it to individual mode.")) : (React.createElement("p", null,
                            "This kiosk has ",
                            kiosk.overrideCount,
                            " individual override",
                            kiosk.overrideCount !== 1 ? 's' : '',
                            ". Changes will only affect this kiosk.")))))),
            loading ? (React.createElement("div", { className: "flex items-center justify-center py-12" },
                React.createElement("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" }))) : (React.createElement(React.Fragment, null,
                React.createElement("div", { className: "border-b border-gray-200" },
                    React.createElement("nav", { className: "-mb-px flex space-x-8" }, tabs.map((tab) => (React.createElement("button", { key: tab.id, onClick: () => setActiveTab(tab.id), className: `group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}` },
                        React.createElement(tab.icon, { className: `-ml-0.5 mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}` }),
                        tab.name,
                        hasOverride(tab.id) && (React.createElement("span", { className: "ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800" }, "Override"))))))),
                React.createElement("div", { className: "space-y-6" },
                    activeTab === 'status' && (React.createElement("div", { className: "space-y-6" },
                        React.createElement("div", { className: "flex justify-between items-center" },
                            React.createElement("h3", { className: "text-lg font-medium text-gray-900" }, "Status Configuration"),
                            React.createElement("div", { className: "flex space-x-2" },
                                hasOverride('status') && (React.createElement(Button, { variant: "secondary", size: "sm", onClick: () => removeOverride('status'), disabled: saving },
                                    React.createElement(XMarkIcon, { className: "h-4 w-4 mr-1" }),
                                    "Remove Override")),
                                React.createElement(Button, { onClick: () => saveOverride('status'), disabled: saving, size: "sm" }, hasOverride('status') ? 'Update Override' : 'Create Override'))),
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement("div", { className: "flex items-center space-x-2" },
                                React.createElement("input", { type: "checkbox", id: "status-enabled", checked: statusConfig.enabled, onChange: (e) => setStatusConfig(prev => ({ ...prev, enabled: e.target.checked })), className: "rounded border-gray-300" }),
                                React.createElement("label", { htmlFor: "status-enabled", className: "text-sm font-medium text-gray-700" }, "Enable status system for this kiosk")),
                            React.createElement("div", null,
                                React.createElement("label", { htmlFor: "current-status", className: "block text-sm font-medium text-gray-700 mb-2" }, "Current Status"),
                                React.createElement("select", { id: "current-status", value: statusConfig.currentStatus, onChange: (e) => setStatusConfig(prev => ({
                                        ...prev,
                                        currentStatus: e.target.value
                                    })), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" },
                                    React.createElement("option", { value: "open" }, "Open"),
                                    React.createElement("option", { value: "closed" }, "Closed"),
                                    React.createElement("option", { value: "meeting" }, "In a Meeting"),
                                    React.createElement("option", { value: "brb" }, "Be Right Back"),
                                    React.createElement("option", { value: "lunch" }, "Out to Lunch"),
                                    React.createElement("option", { value: "unavailable" }, "Status Unavailable"))),
                            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                React.createElement("div", null,
                                    React.createElement("label", { htmlFor: "open-message", className: "block text-sm font-medium text-gray-700 mb-2" }, "Open Message"),
                                    React.createElement("input", { id: "open-message", type: "text", value: statusConfig.customMessages.openMessage, onChange: (e) => setStatusConfig(prev => ({
                                            ...prev,
                                            customMessages: { ...prev.customMessages, openMessage: e.target.value }
                                        })), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })),
                                React.createElement("div", null,
                                    React.createElement("label", { htmlFor: "closed-message", className: "block text-sm font-medium text-gray-700 mb-2" }, "Closed Message"),
                                    React.createElement("input", { id: "closed-message", type: "text", value: statusConfig.customMessages.closedMessage, onChange: (e) => setStatusConfig(prev => ({
                                            ...prev,
                                            customMessages: { ...prev.customMessages, closedMessage: e.target.value }
                                        })), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })),
                                React.createElement("div", null,
                                    React.createElement("label", { htmlFor: "meeting-message", className: "block text-sm font-medium text-gray-700 mb-2" }, "Meeting Message"),
                                    React.createElement("input", { id: "meeting-message", type: "text", value: statusConfig.customMessages.meetingMessage, onChange: (e) => setStatusConfig(prev => ({
                                            ...prev,
                                            customMessages: { ...prev.customMessages, meetingMessage: e.target.value }
                                        })), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })),
                                React.createElement("div", null,
                                    React.createElement("label", { htmlFor: "brb-message", className: "block text-sm font-medium text-gray-700 mb-2" }, "Be Right Back Message"),
                                    React.createElement("input", { id: "brb-message", type: "text", value: statusConfig.customMessages.brbMessage, onChange: (e) => setStatusConfig(prev => ({
                                            ...prev,
                                            customMessages: { ...prev.customMessages, brbMessage: e.target.value }
                                        })), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })),
                                React.createElement("div", { className: "md:col-span-2" },
                                    React.createElement("label", { htmlFor: "lunch-message", className: "block text-sm font-medium text-gray-700 mb-2" }, "Out to Lunch Message"),
                                    React.createElement("input", { id: "lunch-message", type: "text", value: statusConfig.customMessages.lunchMessage, onChange: (e) => setStatusConfig(prev => ({
                                            ...prev,
                                            customMessages: { ...prev.customMessages, lunchMessage: e.target.value }
                                        })), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })),
                                React.createElement("div", { className: "md:col-span-2" },
                                    React.createElement("label", { htmlFor: "unavailable-message", className: "block text-sm font-medium text-gray-700 mb-2" }, "Status Unavailable Message"),
                                    React.createElement("input", { id: "unavailable-message", type: "text", value: statusConfig.customMessages.unavailableMessage, onChange: (e) => setStatusConfig(prev => ({
                                            ...prev,
                                            customMessages: { ...prev.customMessages, unavailableMessage: e.target.value }
                                        })), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })))))),
                    activeTab === 'schedule' && (React.createElement("div", { className: "space-y-6" },
                        React.createElement("div", { className: "flex justify-between items-center" },
                            React.createElement("h3", { className: "text-lg font-medium text-gray-900" }, "Schedule Configuration"),
                            React.createElement("div", { className: "flex space-x-2" },
                                hasOverride('schedule') && (React.createElement(Button, { variant: "secondary", size: "sm", onClick: () => removeOverride('schedule'), disabled: saving },
                                    React.createElement(XMarkIcon, { className: "h-4 w-4 mr-1" }),
                                    "Remove Override")),
                                React.createElement(Button, { onClick: () => saveOverride('schedule'), disabled: saving, size: "sm" }, hasOverride('schedule') ? 'Update Override' : 'Create Override'))),
                        React.createElement(ScheduleManager, { title: "Kiosk Automatic Schedule", config: scheduleConfig, onSave: async (newSchedule) => {
                                setScheduleConfig(newSchedule);
                            }, showEnabled: true }))),
                    activeTab === 'office-hours' && (React.createElement("div", { className: "space-y-6" },
                        React.createElement("div", { className: "flex justify-between items-center" },
                            React.createElement("h3", { className: "text-lg font-medium text-gray-900" }, "Office Hours Configuration"),
                            React.createElement("div", { className: "flex space-x-2" },
                                hasOverride('office-hours') && (React.createElement(Button, { variant: "secondary", size: "sm", onClick: () => removeOverride('office-hours'), disabled: saving },
                                    React.createElement(XMarkIcon, { className: "h-4 w-4 mr-1" }),
                                    "Remove Override")),
                                React.createElement(Button, { onClick: () => saveOverride('office-hours'), disabled: saving, size: "sm" }, hasOverride('office-hours') ? 'Update Override' : 'Create Override'))),
                        React.createElement(ScheduleManager, { title: "Kiosk Office Hours", config: officeHoursConfig, onSave: async (newOfficeHours) => {
                                setOfficeHoursConfig(newOfficeHours);
                            }, showEnabled: true, showTitle: true, showNextOpen: true }))),
                    activeTab === 'branding' && (React.createElement("div", { className: "space-y-6" },
                        React.createElement("div", { className: "flex justify-between items-center" },
                            React.createElement("h3", { className: "text-lg font-medium text-gray-900" }, "Branding Configuration"),
                            React.createElement("div", { className: "flex space-x-2" },
                                hasOverride('branding') && (React.createElement(Button, { variant: "secondary", size: "sm", onClick: () => removeOverride('branding'), disabled: saving },
                                    React.createElement(XMarkIcon, { className: "h-4 w-4 mr-1" }),
                                    "Remove Override")),
                                React.createElement(Button, { onClick: () => saveOverride('branding'), disabled: saving, size: "sm" }, hasOverride('branding') ? 'Update Override' : 'Create Override'))),
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Logo URL"),
                                React.createElement("input", { type: "url", value: brandingConfig.logoUrl, onChange: (e) => setBrandingConfig(prev => ({ ...prev, logoUrl: e.target.value })), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500", placeholder: "https://example.com/logo.png" })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Background URL (Optional)"),
                                React.createElement("input", { type: "url", value: brandingConfig.backgroundUrl, onChange: (e) => setBrandingConfig(prev => ({ ...prev, backgroundUrl: e.target.value })), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500", placeholder: "https://example.com/background.jpg" })),
                            React.createElement("div", null,
                                React.createElement("label", { htmlFor: "welcome-message", className: "block text-sm font-medium text-gray-700 mb-2" }, "Welcome Message"),
                                React.createElement("input", { id: "welcome-message", type: "text", value: brandingConfig.welcomeMessage, onChange: (e) => setBrandingConfig(prev => ({ ...prev, welcomeMessage: e.target.value })), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })),
                            React.createElement("div", null,
                                React.createElement("label", { htmlFor: "help-message", className: "block text-sm font-medium text-gray-700 mb-2" }, "Help Message"),
                                React.createElement("input", { id: "help-message", type: "text", value: brandingConfig.helpMessage, onChange: (e) => setBrandingConfig(prev => ({ ...prev, helpMessage: e.target.value })), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" }))),
                        brandingConfig.logoUrl && (React.createElement("div", null,
                            React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Logo Preview"),
                            React.createElement("div", { className: "border rounded-md p-4 bg-gray-50" },
                                React.createElement("img", { src: brandingConfig.logoUrl, alt: "Logo Preview", className: "max-h-16 max-w-xs", onError: (e) => {
                                        e.target.style.display = 'none';
                                    } })))))))))),
        React.createElement("div", { className: "flex justify-end space-x-3 mt-6 pt-6 border-t" },
            React.createElement(Button, { variant: "secondary", onClick: onClose }, "Close"))));
};
