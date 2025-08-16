import React, { useState, useEffect } from 'react';
import { Button, Card, Modal } from '@heroui/react';
import { ScheduleManager } from '@/components/ScheduleManager';
import { ComputerDesktopIcon, TrashIcon, PowerIcon, QrCodeIcon, CogIcon, ClipboardDocumentIcon, ArrowPathIcon, ArrowUturnLeftIcon, ClockIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
export const _KiosksPage = () => {
    const [kiosks, setKiosks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedKiosk, setSelectedKiosk] = useState(null);
    const [showActivationModal, setShowActivationModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [activationData, setActivationData] = useState(null);
    const [generatingCode, setGeneratingCode] = useState(false);
    const [globalStatus, setGlobalStatus] = useState('open');
    const [statusLoading, setStatusLoading] = useState(false);
    const [kioskScheduleConfig, setKioskScheduleConfig] = useState(null);
    const { addToast } = useToastStore();
    useEffect(() => {
        loadKiosks();
        loadGlobalStatus();
    }, []);
    const loadGlobalStatus = async () => {
        try {
            const config = await api.getStatusConfig(); // TODO-LINT: move to async function
            setGlobalStatus(config.currentStatus || (config.enabled ? 'open' : 'closed'));
        }
        catch (error) {
            console.error('Failed to load global status:', error);
        }
    };
    const updateGlobalStatus = async (status) => {
        try {
            setStatusLoading(true);
            // Get current config first to preserve other settings
            const currentConfig = await api.getStatusConfig(); // TODO-LINT: move to async function
            const updatedConfig = {
                ...currentConfig,
                enabled: status === 'open',
                currentStatus: status,
                openMessage: currentConfig.openMessage || 'Help Desk is Open',
                closedMessage: currentConfig.closedMessage || 'Help Desk is Closed',
                meetingMessage: currentConfig.meetingMessage || 'In a Meeting - Back Soon',
                brbMessage: currentConfig.brbMessage || 'Be Right Back',
                lunchMessage: currentConfig.lunchMessage || 'Out to Lunch - Back in 1 Hour',
                unavailableMessage: currentConfig.unavailableMessage || 'Status Unavailable'
            };
            await api.updateStatusConfig(updatedConfig); // TODO-LINT: move to async function
            setGlobalStatus(status);
            addToast({
                type: 'success',
                title: 'Success',
                description: `Global status updated to ${status}`,
            });
            // Reload status to ensure sync
            setTimeout(loadGlobalStatus, 500);
        }
        catch (error) {
            console.error('Failed to update global status:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to update global status',
            });
            // Reload current status on error
            loadGlobalStatus();
        }
        finally {
            setStatusLoading(false);
        }
    };
    const loadKiosks = async () => {
        try {
            setLoading(true);
            const data = await api.getKiosks(); // TODO-LINT: move to async function
            setKiosks(data);
        }
        catch (error) {
            console.error('Failed to load kiosks:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to load kiosks',
            });
        }
        finally {
            setLoading(false);
        }
    };
    const toggleKioskActive = async (id, active) => {
        try {
            if (active) {
                await api.deactivateKiosk(id); // TODO-LINT: move to async function
            }
            else {
                await api.activateKiosk(id); // TODO-LINT: move to async function
            }
            setKiosks(kiosks.map(k => k.id === id ? { ...k, active: !active } : k));
            addToast({
                type: 'success',
                title: 'Success',
                description: `Kiosk ${!active ? 'activated' : 'deactivated'} successfully`,
            });
        }
        catch (error) {
            console.error('Failed to toggle kiosk:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to toggle kiosk status',
            });
        }
    };
    const deleteKiosk = async (id) => {
        if (confirm('Are you sure you want to delete this kiosk?')) {
            try {
                await api.deleteKiosk(id); // TODO-LINT: move to async function
                setKiosks(kiosks.filter(k => k.id !== id));
                addToast({
                    type: 'success',
                    title: 'Success',
                    description: 'Kiosk deleted successfully',
                });
            }
            catch (error) {
                console.error('Failed to delete kiosk:', error);
                addToast({
                    type: 'error',
                    title: 'Error',
                    description: error.response?.data?.error || 'Failed to delete kiosk. Please try again.',
                });
            }
        }
    };
    const generateActivationCode = async () => {
        try {
            setGeneratingCode(true);
            const activation = await api.generateKioskActivation(); // TODO-LINT: move to async function
            setActivationData(activation);
            addToast({
                type: 'success',
                title: 'Success',
                description: 'Activation code generated successfully',
            });
        }
        catch (error) {
            console.error('Failed to generate activation code:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to generate activation code',
            });
        }
        finally {
            setGeneratingCode(false);
        }
    };
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text); // TODO-LINT: move to async function
            addToast({
                type: 'success',
                title: 'Copied',
                description: 'Activation code copied to clipboard',
            });
        }
        catch {
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to copy to clipboard',
            });
        }
    };
    const openActivationModal = () => {
        setShowActivationModal(true);
        setActivationData(null);
    };
    const closeActivationModal = () => {
        setShowActivationModal(false);
        setActivationData(null);
    };
    const openScheduleModal = async (kiosk) => {
        try {
            setSelectedKiosk(kiosk);
            const config = await api.getKioskScheduleConfig(kiosk.id); // TODO-LINT: move to async function
            setKioskScheduleConfig(config);
            setShowScheduleModal(true);
        }
        catch (error) {
            console.error('Failed to load kiosk schedule config:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to load schedule configuration',
            });
        }
    };
    const saveKioskSchedule = async (scheduleConfig) => {
        if (!selectedKiosk)
            return;
        try {
            await api.updateStatusConfig({
                ...kioskScheduleConfig,
                schedule: scheduleConfig
            }); // TODO-LINT: move to async function
            setKioskScheduleConfig(prev => ({ ...prev, schedule: scheduleConfig }));
            addToast({
                type: 'success',
                title: 'Success',
                description: 'Kiosk schedule updated successfully',
            });
        }
        catch (error) {
            console.error('Failed to update kiosk schedule:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to update kiosk schedule',
            });
            throw error;
        }
    };
    const saveKioskOfficeHours = async (officeHoursConfig) => {
        if (!selectedKiosk)
            return;
        try {
            await api.updateStatusConfig({
                ...kioskScheduleConfig,
                officeHours: officeHoursConfig
            }); // TODO-LINT: move to async function
            setKioskScheduleConfig(prev => ({ ...prev, officeHours: officeHoursConfig }));
            addToast({
                type: 'success',
                title: 'Success',
                description: 'Office hours updated successfully',
            });
        }
        catch (error) {
            console.error('Failed to update office hours:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to update office hours',
            });
            throw error;
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'open':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'closed':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'error':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'meeting':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'brb':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'lunch':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'unavailable':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    const refreshKioskConfig = async (id) => {
        try {
            await api.refreshKioskConfig(id); // TODO-LINT: move to async function
            addToast({
                type: 'success',
                title: 'Success',
                description: 'Config refresh requested for kiosk',
            });
        }
        catch (error) {
            console.error('Failed to refresh kiosk config:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to refresh kiosk configuration',
            });
        }
    };
    const resetKiosk = async (id) => {
        if (confirm('Are you sure you want to reset this kiosk? This will deactivate it and clear all custom settings.')) {
            try {
                await api.resetKiosk(id); // TODO-LINT: move to async function
                // Update local state to reflect the reset
                setKiosks(kiosks.map(k => k.id === id ? { ...k, active: false } : k));
                addToast({
                    type: 'success',
                    title: 'Success',
                    description: 'Kiosk reset successfully',
                });
            }
            catch (error) {
                console.error('Failed to reset kiosk:', error);
                addToast({
                    type: 'error',
                    title: 'Error',
                    description: 'Failed to reset kiosk',
                });
            }
        }
    };
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex justify-between items-start" },
            React.createElement("div", null,
                React.createElement("h1", { className: "text-2xl font-bold text-gray-900" }, "Kiosk Management"),
                React.createElement("p", { className: "mt-1 text-sm text-gray-600" }, "Monitor and manage your deployed kiosks")),
            React.createElement("div", { className: "flex items-center space-x-4" },
                React.createElement("div", { className: "flex items-center space-x-3 bg-white border border-gray-200 rounded-lg px-4 py-2" },
                    React.createElement("label", { className: "text-sm font-medium text-gray-700" }, "Status:"),
                    React.createElement("div", { className: "flex items-center space-x-3 flex-wrap" },
                        React.createElement("label", { className: "flex items-center" },
                            React.createElement("input", { type: "radio", name: "kiosk-indicator-status", value: "open", className: "mr-2", checked: globalStatus === 'open', onChange: () => updateGlobalStatus('open'), disabled: statusLoading }),
                            React.createElement("span", { className: "text-sm text-green-700 font-medium" }, "Open")),
                        React.createElement("label", { className: "flex items-center" },
                            React.createElement("input", { type: "radio", name: "kiosk-indicator-status", value: "closed", className: "mr-2", checked: globalStatus === 'closed', onChange: () => updateGlobalStatus('closed'), disabled: statusLoading }),
                            React.createElement("span", { className: "text-sm text-red-700 font-medium" }, "Closed")),
                        React.createElement("label", { className: "flex items-center" },
                            React.createElement("input", { type: "radio", name: "kiosk-indicator-status", value: "meeting", className: "mr-2", checked: globalStatus === 'meeting', onChange: () => updateGlobalStatus('meeting'), disabled: statusLoading }),
                            React.createElement("span", { className: "text-sm text-purple-700 font-medium" }, "In a Meeting")),
                        React.createElement("label", { className: "flex items-center" },
                            React.createElement("input", { type: "radio", name: "kiosk-indicator-status", value: "brb", className: "mr-2", checked: globalStatus === 'brb', onChange: () => updateGlobalStatus('brb'), disabled: statusLoading }),
                            React.createElement("span", { className: "text-sm text-yellow-700 font-medium" }, "Be Right Back")),
                        React.createElement("label", { className: "flex items-center" },
                            React.createElement("input", { type: "radio", name: "kiosk-indicator-status", value: "lunch", className: "mr-2", checked: globalStatus === 'lunch', onChange: () => updateGlobalStatus('lunch'), disabled: statusLoading }),
                            React.createElement("span", { className: "text-sm text-orange-700 font-medium" }, "Out to Lunch")),
                        React.createElement("label", { className: "flex items-center" },
                            React.createElement("input", { type: "radio", name: "kiosk-indicator-status", value: "unavailable", className: "mr-2", checked: globalStatus === 'unavailable', onChange: () => updateGlobalStatus('unavailable'), disabled: statusLoading }),
                            React.createElement("span", { className: "text-sm text-orange-700 font-medium" }, "Status Unavailable")))),
                React.createElement(Button, { variant: "primary", onClick: openActivationModal },
                    React.createElement(QrCodeIcon, { className: "h-4 w-4 mr-2" }),
                    "Generate Activation Code"))),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
            React.createElement(Card, null,
                React.createElement("div", { className: "flex items-center" },
                    React.createElement("div", { className: "p-3 rounded-lg bg-blue-500" },
                        React.createElement(ComputerDesktopIcon, { className: "h-6 w-6 text-white" })),
                    React.createElement("div", { className: "ml-4" },
                        React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "Total Kiosks"),
                        React.createElement("p", { className: "text-2xl font-semibold text-gray-900" }, kiosks.length)))),
            React.createElement(Card, null,
                React.createElement("div", { className: "flex items-center" },
                    React.createElement("div", { className: "p-3 rounded-lg bg-green-500" },
                        React.createElement(PowerIcon, { className: "h-6 w-6 text-white" })),
                    React.createElement("div", { className: "ml-4" },
                        React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "Active Kiosks"),
                        React.createElement("p", { className: "text-2xl font-semibold text-gray-900" }, kiosks.filter(k => k.active).length)))),
            React.createElement(Card, null,
                React.createElement("div", { className: "flex items-center" },
                    React.createElement("div", { className: "p-3 rounded-lg bg-orange-500" },
                        React.createElement(CogIcon, { className: "h-6 w-6 text-white" })),
                    React.createElement("div", { className: "ml-4" },
                        React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "Online Now"),
                        React.createElement("p", { className: "text-2xl font-semibold text-gray-900" }, kiosks.filter(k => {
                            const lastSeen = new Date(k.lastSeen);
                            const now = new Date();
                            const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
                            return diffMinutes < 5; // Consider online if seen within 5 minutes
                        }).length))))),
        React.createElement(Card, null, loading ? (React.createElement("div", { className: "flex items-center justify-center py-12" },
            React.createElement("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" }))) : kiosks.length === 0 ? (React.createElement("div", { className: "text-center py-12" },
            React.createElement(ComputerDesktopIcon, { className: "mx-auto h-12 w-12 text-gray-400" }),
            React.createElement("h3", { className: "mt-2 text-sm font-medium text-gray-900" }, "No kiosks registered"),
            React.createElement("p", { className: "mt-1 text-sm text-gray-500" }, "Generate an activation code to register your first kiosk."),
            React.createElement("div", { className: "mt-6" },
                React.createElement(Button, { variant: "primary", onClick: openActivationModal },
                    React.createElement(QrCodeIcon, { className: "h-4 w-4 mr-2" }),
                    "Generate Activation Code")))) : (React.createElement("div", { className: "overflow-x-auto" },
            React.createElement("table", { className: "min-w-full divide-y divide-gray-200" },
                React.createElement("thead", { className: "bg-gray-50" },
                    React.createElement("tr", null,
                        React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Kiosk ID"),
                        React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Status"),
                        React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Current State"),
                        React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Version"),
                        React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Last Seen"),
                        React.createElement("th", { className: "relative px-6 py-3" },
                            React.createElement("span", { className: "sr-only" }, "Actions")))),
                React.createElement("tbody", { className: "bg-white divide-y divide-gray-200" }, kiosks.map((kiosk) => (React.createElement("tr", { key: kiosk.id, className: "hover:bg-gray-50" },
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" },
                        React.createElement("div", { className: "flex items-center" },
                            React.createElement(ComputerDesktopIcon, { className: "h-5 w-5 text-gray-400 mr-2" }),
                            React.createElement("span", { className: "text-sm font-medium text-gray-900" }, kiosk.id))),
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" },
                        React.createElement("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${kiosk.active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}` }, kiosk.active ? 'Active' : 'Inactive')),
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" },
                        React.createElement("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(kiosk.effectiveConfig.currentStatus)}` }, kiosk.effectiveConfig.currentStatus || 'Unknown')),
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900" }, kiosk.version || 'Unknown'),
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500" }, formatDate(kiosk.lastSeen)),
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2" },
                        React.createElement(Button, { variant: "default", size: "sm", onClick: () => toggleKioskActive(kiosk.id, kiosk.active), className: kiosk.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900', title: kiosk.active ? 'Deactivate kiosk' : 'Activate kiosk' },
                            React.createElement(PowerIcon, { className: "h-4 w-4" })),
                        React.createElement(Button, { variant: "default", size: "sm", onClick: () => refreshKioskConfig(kiosk.id), className: "text-blue-600 hover:text-blue-900", title: "Refresh kiosk configuration" },
                            React.createElement(ArrowPathIcon, { className: "h-4 w-4" })),
                        React.createElement(Button, { variant: "default", size: "sm", onClick: () => resetKiosk(kiosk.id), className: "text-orange-600 hover:text-orange-900", title: "Reset kiosk to defaults" },
                            React.createElement(ArrowUturnLeftIcon, { className: "h-4 w-4" })),
                        React.createElement(Button, { variant: "default", size: "sm", onClick: () => setSelectedKiosk(kiosk), className: "text-gray-600 hover:text-gray-900", title: "Configure kiosk" },
                            React.createElement(CogIcon, { className: "h-4 w-4" })),
                        React.createElement(Button, { variant: "default", size: "sm", onClick: () => openScheduleModal(kiosk), className: "text-blue-600 hover:text-blue-900", title: "Manage schedule & office hours" },
                            React.createElement(ClockIcon, { className: "h-4 w-4" })),
                        React.createElement(Button, { variant: "default", size: "sm", onClick: () => deleteKiosk(kiosk.id), className: "text-red-600 hover:text-red-900", title: "Delete kiosk" },
                            React.createElement(TrashIcon, { className: "h-4 w-4" }))))))))))),
        React.createElement(Modal, { isOpen: showActivationModal, onClose: closeActivationModal, title: "Generate Kiosk Activation Code", size: "lg" },
            React.createElement("div", { className: "space-y-6" },
                React.createElement("div", null,
                    React.createElement("p", { className: "text-sm text-gray-600 mb-4" }, "Generate a QR code and activation code for new kiosk registration. The kiosk administrator can scan the QR code or enter the activation code manually.")),
                !activationData ? (React.createElement("div", { className: "text-center py-8" },
                    React.createElement(QrCodeIcon, { className: "mx-auto h-16 w-16 text-gray-400 mb-4" }),
                    React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-2" }, "Ready to Generate Activation Code"),
                    React.createElement("p", { className: "text-sm text-gray-500 mb-6" }, "Click the button below to generate a new kiosk activation code and QR code."),
                    React.createElement(Button, { variant: "primary", onClick: generateActivationCode, isLoading: generatingCode, className: "px-8" },
                        React.createElement(QrCodeIcon, { className: "h-4 w-4 mr-2" }),
                        "Generate Activation Code"))) : (React.createElement("div", { className: "space-y-6" },
                    React.createElement("div", { className: "text-center" },
                        React.createElement("div", { className: "mx-auto mb-4 p-4 bg-white border-2 border-gray-200 rounded-lg inline-block" }, activationData.qrCode ? (React.createElement("img", { src: activationData.qrCode, alt: "QR Code for kiosk activation", className: "w-48 h-48" })) : (React.createElement("div", { className: "w-48 h-48 bg-gray-100 rounded flex items-center justify-center" },
                            React.createElement("div", { className: "text-center" },
                                React.createElement(QrCodeIcon, { className: "mx-auto h-12 w-12 text-gray-400 mb-2" }),
                                React.createElement("p", { className: "text-xs text-gray-500" }, "Generating QR Code..."),
                                React.createElement("p", { className: "text-xs text-gray-400" }, activationData.code))))),
                        React.createElement("p", { className: "text-sm text-gray-600" }, "Scan this QR code with the kiosk app to activate")),
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Activation Code"),
                        React.createElement("div", { className: "flex items-center space-x-2" },
                            React.createElement("div", { className: "flex-1 p-3 bg-gray-50 border border-gray-200 rounded-md" },
                                React.createElement("code", { className: "text-lg font-mono text-gray-900" }, activationData.code)),
                            React.createElement(Button, { variant: "secondary", size: "sm", onClick: () => copyToClipboard(activationData.code) },
                                React.createElement(ClipboardDocumentIcon, { className: "h-4 w-4" }))),
                        React.createElement("p", { className: "mt-1 text-sm text-gray-500" }, "Manually enter this code in the kiosk activation screen")),
                    React.createElement("div", { className: "bg-yellow-50 border border-yellow-200 rounded-md p-4" },
                        React.createElement("div", { className: "flex" },
                            React.createElement("div", { className: "ml-3" },
                                React.createElement("h3", { className: "text-sm font-medium text-yellow-800" }, "Activation Code Expires"),
                                React.createElement("div", { className: "mt-2 text-sm text-yellow-700" },
                                    React.createElement("p", null,
                                        "This activation code will expire on ",
                                        new Date(activationData.expiresAt).toLocaleString(),
                                        "."))))),
                    React.createElement("div", { className: "pt-4 border-t border-gray-200" },
                        React.createElement(Button, { variant: "secondary", onClick: generateActivationCode, isLoading: generatingCode, className: "w-full" }, "Generate New Code"))))),
            React.createElement("div", { className: "flex justify-end space-x-3 mt-6" },
                React.createElement(Button, { variant: "secondary", onClick: closeActivationModal }, "Close"))),
        React.createElement(Modal, { isOpen: !!selectedKiosk, onClose: () => setSelectedKiosk(null), title: `Configure Kiosk ${selectedKiosk?.id}`, size: "lg" },
            selectedKiosk && (React.createElement("div", { className: "space-y-6" },
                React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Kiosk ID"),
                        React.createElement("p", { className: "text-sm text-gray-900" }, selectedKiosk.id)),
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Status"),
                        React.createElement("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${selectedKiosk.active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}` }, selectedKiosk.active ? 'Active' : 'Inactive')),
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Current State"),
                        React.createElement("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedKiosk.effectiveConfig.currentStatus)}` }, selectedKiosk.effectiveConfig.currentStatus || 'Unknown')),
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Version"),
                        React.createElement("p", { className: "text-sm text-gray-900" }, selectedKiosk.version || 'Unknown')),
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Last Seen"),
                        React.createElement("p", { className: "text-sm text-gray-900" }, formatDate(selectedKiosk.lastSeen))),
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Status Enabled"),
                        React.createElement("p", { className: "text-sm text-gray-900" }, selectedKiosk.effectiveConfig.statusEnabled ? 'Yes' : 'No'))),
                React.createElement("div", { className: "border-t border-gray-200 pt-6" },
                    React.createElement("h4", { className: "text-lg font-medium text-gray-900 mb-4" }, "Actions"),
                    React.createElement("div", { className: "flex flex-wrap gap-3" },
                        React.createElement(Button, { variant: selectedKiosk.active ? "secondary" : "primary", onClick: () => toggleKioskActive(selectedKiosk.id, selectedKiosk.active) },
                            React.createElement(PowerIcon, { className: "h-4 w-4 mr-2" }),
                            selectedKiosk.active ? 'Deactivate' : 'Activate'),
                        React.createElement(Button, { variant: "secondary", onClick: () => refreshKioskConfig(selectedKiosk.id) },
                            React.createElement(ArrowPathIcon, { className: "h-4 w-4 mr-2" }),
                            "Refresh Config"),
                        React.createElement(Button, { variant: "secondary", onClick: () => resetKiosk(selectedKiosk.id) },
                            React.createElement(ArrowUturnLeftIcon, { className: "h-4 w-4 mr-2" }),
                            "Reset Kiosk"),
                        React.createElement(Button, { variant: "secondary", onClick: () => {
                                // Refresh kiosk status
                                loadKiosks();
                            } },
                            React.createElement(CogIcon, { className: "h-4 w-4 mr-2" }),
                            "Refresh Status"))),
                React.createElement("div", { className: "bg-gray-50 border border-gray-200 rounded-md p-4" },
                    React.createElement("h3", { className: "text-sm font-medium text-gray-800 mb-4" }, "Kiosk Configuration"),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "grid grid-cols-1 gap-4" },
                            React.createElement("div", null,
                                React.createElement("label", { htmlFor: "welcome-message", className: "block text-sm font-medium text-gray-700 mb-2" }, "Welcome Message"),
                                React.createElement("textarea", { id: "welcome-message", className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm", rows: 3, defaultValue: "Welcome to Nova Universe! How can we help you today?", title: "Welcome message displayed on kiosk" })),
                            React.createElement("div", null,
                                React.createElement("label", { htmlFor: "help-message", className: "block text-sm font-medium text-gray-700 mb-2" }, "Help Message"),
                                React.createElement("textarea", { id: "help-message", className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm", rows: 2, defaultValue: "Touch the screen to submit a support request or get help.", title: "Help message displayed on kiosk" })),
                            React.createElement("div", null,
                                React.createElement("label", { htmlFor: "status-message", className: "block text-sm font-medium text-gray-700 mb-2" }, "Status Message"),
                                React.createElement("textarea", { id: "status-message", className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm", rows: 2, defaultValue: "IT Support is available to assist you.", title: "Status message displayed on kiosk" }))),
                        React.createElement("div", { className: "border-t border-gray-300 pt-4" },
                            React.createElement("h4", { className: "text-sm font-medium text-gray-800 mb-3" }, "Kiosk Indicator Status"),
                            React.createElement("div", { className: "space-y-3" },
                                React.createElement("div", { className: "flex items-center space-x-4" },
                                    React.createElement("label", { className: "flex items-center" },
                                        React.createElement("input", { type: "radio", name: "kiosk-indicator", value: "open", className: "mr-2", defaultChecked: true, title: "Kiosk displays open status indicator" }),
                                        React.createElement("span", { className: "text-sm text-gray-700" }, "Open Status")),
                                    React.createElement("label", { className: "flex items-center" },
                                        React.createElement("input", { type: "radio", name: "kiosk-indicator", value: "closed", className: "mr-2", title: "Kiosk displays closed status indicator" }),
                                        React.createElement("span", { className: "text-sm text-gray-700" }, "Closed Status"))),
                                React.createElement("p", { className: "text-xs text-gray-500" }, "This controls the status indicator displayed on the kiosk interface"))),
                        React.createElement("div", { className: "border-t border-gray-300 pt-4" },
                            React.createElement("h4", { className: "text-sm font-medium text-gray-800 mb-3" }, "Open/Closed Status"),
                            React.createElement("div", { className: "space-y-3" },
                                React.createElement("div", { className: "flex items-center space-x-4" },
                                    React.createElement("label", { className: "flex items-center" },
                                        React.createElement("input", { type: "radio", name: "kiosk-status", value: "open", className: "mr-2", defaultChecked: true, title: "Kiosk is open and accepting requests" }),
                                        React.createElement("span", { className: "text-sm text-gray-700" }, "Open (Accepting Requests)")),
                                    React.createElement("label", { className: "flex items-center" },
                                        React.createElement("input", { type: "radio", name: "kiosk-status", value: "closed", className: "mr-2", title: "Kiosk is closed and not accepting requests" }),
                                        React.createElement("span", { className: "text-sm text-gray-700" }, "Closed (Temporarily Unavailable)"))))),
                        React.createElement("div", { className: "border-t border-gray-300 pt-4" },
                            React.createElement("h4", { className: "text-sm font-medium text-gray-800 mb-3" }, "Branding & Assets"),
                            React.createElement("div", { className: "grid grid-cols-1 gap-4" },
                                React.createElement("div", null,
                                    React.createElement("label", { htmlFor: "logo-url", className: "block text-sm font-medium text-gray-700 mb-2" }, "Logo URL"),
                                    React.createElement("input", { id: "logo-url", type: "url", className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm", placeholder: "https://example.com/logo.png", title: "Logo displayed on kiosk welcome screen" })),
                                React.createElement("div", null,
                                    React.createElement("label", { htmlFor: "background-url", className: "block text-sm font-medium text-gray-700 mb-2" }, "Background Image URL"),
                                    React.createElement("input", { id: "background-url", type: "url", className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm", placeholder: "https://example.com/background.jpg", title: "Background image for kiosk interface" })))),
                        React.createElement("div", { className: "text-xs text-gray-500 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md" },
                            React.createElement("strong", null, "Note:"),
                            " Display timeout, sound settings, and device-level configurations are managed through your Mobile Device Management (MDM) system."),
                        React.createElement("div", { className: "pt-4 border-t border-gray-200" },
                            React.createElement(Button, { variant: "primary", size: "sm" }, "Save Kiosk Configuration")))))),
            React.createElement("div", { className: "flex justify-end space-x-3 mt-6" },
                React.createElement(Button, { variant: "secondary", onClick: () => setSelectedKiosk(null) }, "Close"))),
        React.createElement(Modal, { isOpen: showScheduleModal, onClose: () => setShowScheduleModal(false), title: `Manage Schedule & Office Hours for Kiosk ${selectedKiosk?.id}`, size: "lg" },
            selectedKiosk && (React.createElement("div", { className: "space-y-6" },
                React.createElement("div", { className: "space-y-8" },
                    React.createElement("div", null,
                        React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-4" }, "Automatic Schedule"),
                        React.createElement("p", { className: "text-sm text-gray-600 mb-6" }, "Configure when this kiosk should automatically open and close."),
                        React.createElement(ScheduleManager, { title: "Automatic Schedule", config: kioskScheduleConfig?.schedule || {
                                enabled: false,
                                schedule: {
                                    monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                                    tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                                    wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                                    thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                                    friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                                    saturday: { enabled: false, slots: [] },
                                    sunday: { enabled: false, slots: [] }
                                },
                                timezone: 'America/New_York'
                            }, onSave: saveKioskSchedule, showEnabled: true })),
                    React.createElement("div", null,
                        React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-4" }, "Office Hours Display"),
                        React.createElement("p", { className: "text-sm text-gray-600 mb-6" }, "Configure office hours information to display on the kiosk."),
                        React.createElement(ScheduleManager, { title: "Office Hours", config: kioskScheduleConfig?.officeHours || {
                                enabled: false,
                                title: 'IT Support Hours',
                                schedule: {
                                    monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                                    tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                                    wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                                    thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                                    friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                                    saturday: { enabled: false, slots: [] },
                                    sunday: { enabled: false, slots: [] }
                                },
                                timezone: 'America/New_York',
                                showNextOpen: true
                            }, onSave: saveKioskOfficeHours, showEnabled: true, showTitle: true, showNextOpen: true }))))),
            React.createElement("div", { className: "flex justify-end space-x-3 mt-6" },
                React.createElement(Button, { variant: "secondary", onClick: () => setShowScheduleModal(false) }, "Close"))),
        React.createElement(Modal, { isOpen: showScheduleModal, onClose: () => setShowScheduleModal(false), title: `Schedule & Hours - ${selectedKiosk?.id || 'Kiosk'}`, size: "xl" },
            selectedKiosk && kioskScheduleConfig && (React.createElement("div", { className: "space-y-8" },
                React.createElement("div", null,
                    React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-4" }, "Automatic Schedule"),
                    React.createElement("p", { className: "text-sm text-gray-600 mb-6" }, "Configure when this kiosk should automatically open and close."),
                    React.createElement(ScheduleManager, { title: "Automatic Schedule", config: kioskScheduleConfig?.schedule || {
                            enabled: false,
                            schedule: {
                                monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                                tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                                wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                                thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                                friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                                saturday: { enabled: false, slots: [] },
                                sunday: { enabled: false, slots: [] }
                            },
                            timezone: 'America/New_York'
                        }, onSave: saveKioskSchedule, showEnabled: true })),
                React.createElement("div", null,
                    React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-4" }, "Office Hours Display"),
                    React.createElement("p", { className: "text-sm text-gray-600 mb-6" }, "Configure office hours information to display on the kiosk."),
                    React.createElement(ScheduleManager, { title: "Office Hours", config: kioskScheduleConfig?.officeHours || {
                            enabled: false,
                            title: 'IT Support Hours',
                            schedule: {
                                monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                                tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                                wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                                thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                                friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                                saturday: { enabled: false, slots: [] },
                                sunday: { enabled: false, slots: [] }
                            },
                            timezone: 'America/New_York',
                            showNextOpen: true
                        }, onSave: saveKioskOfficeHours, showEnabled: true, showTitle: true, showNextOpen: true })))),
            React.createElement("div", { className: "flex justify-end space-x-3 mt-6" },
                React.createElement(Button, { variant: "secondary", onClick: () => setShowScheduleModal(false) }, "Close")))));
};
