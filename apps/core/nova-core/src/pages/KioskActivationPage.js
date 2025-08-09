import React, { useState, useEffect } from 'react';
import { Button, Card, Input } from '@heroui/react';
import { useToastStore } from '@/stores/toast';
import { api } from '../lib/api';
import { PlusIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
export const KioskActivationPage = () => {
    const [kioskId, setKioskId] = useState('');
    const [activations, setActivations] = useState([]);
    const [systems, setSystems] = useState([]);
    const [newSystem, setNewSystem] = useState('');
    const [loading, setLoading] = useState(false);
    const [systemsLoading, setSystemsLoading] = useState(false);
    const [generatingQR, setGeneratingQR] = useState(false);
    const { addToast } = useToastStore();
    useEffect(() => {
        loadActivations();
        loadSystems();
        // Auto-refresh activations every 30 seconds to sync with other pages
        const interval = setInterval(loadActivations, 30000);
        return () => clearInterval(interval);
    }, []);
    const loadSystems = async () => {
        try {
            setSystemsLoading(true);
            const data = await api.getKioskSystems();
            setSystems(data?.systems || []);
        }
        catch (error) {
            console.error('Failed to load systems:', error);
            setSystems([]); // Ensure systems is always an array
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to load kiosk systems',
            });
        }
        finally {
            setSystemsLoading(false);
        }
    };
    const loadActivations = async () => {
        try {
            setLoading(true);
            const data = await api.getKioskActivations();
            setActivations(data);
        }
        catch (error) {
            console.error('Failed to load activations:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to load kiosk activations',
            });
        }
        finally {
            setLoading(false);
        }
    };
    const generateActivation = async () => {
        try {
            setGeneratingQR(true);
            const activation = await api.generateKioskActivation();
            setActivations([activation, ...activations]);
            addToast({
                type: 'success',
                title: 'Success',
                description: 'Kiosk activation code generated successfully',
            });
        }
        catch (error) {
            console.error('Failed to generate activation:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to generate activation code',
            });
        }
        finally {
            setGeneratingQR(false);
        }
    };
    const activateKiosk = async () => {
        if (!kioskId.trim()) {
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Please enter a kiosk ID',
            });
            return;
        }
        try {
            setLoading(true);
            await api.updateKioskStatus(kioskId, { active: true });
            addToast({
                type: 'success',
                title: 'Success',
                description: `Kiosk ${kioskId} activated successfully`,
            });
            setKioskId('');
        }
        catch (error) {
            console.error('Failed to activate kiosk:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to activate kiosk',
            });
        }
        finally {
            setLoading(false);
        }
    };
    const addSystem = async () => {
        if (!newSystem.trim()) {
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Please enter a system name',
            });
            return;
        }
        if ((systems || []).includes(newSystem.trim())) {
            addToast({
                type: 'error',
                title: 'Error',
                description: 'This system already exists',
            });
            return;
        }
        try {
            const updatedSystems = [...(systems || []), newSystem.trim()];
            await api.updateKioskSystems(updatedSystems);
            setSystems(updatedSystems);
            setNewSystem('');
            addToast({
                type: 'success',
                title: 'Success',
                description: 'System added successfully',
            });
        }
        catch (error) {
            console.error('Failed to add system:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to add system',
            });
        }
    };
    const removeSystem = async (systemToRemove) => {
        try {
            const updatedSystems = (systems || []).filter(s => s !== systemToRemove);
            await api.updateKioskSystems(updatedSystems);
            setSystems(updatedSystems);
            addToast({
                type: 'success',
                title: 'Success',
                description: 'System removed successfully',
            });
        }
        catch (error) {
            console.error('Failed to remove system:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to remove system',
            });
        }
    };
    const isExpired = (expiresAt) => {
        return new Date(expiresAt) < new Date();
    };
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", null,
            React.createElement("h1", { className: "text-2xl font-bold text-gray-900" }, "Kiosk Management"),
            React.createElement("p", { className: "text-gray-600" }, "Manage kiosk activation codes, activate kiosks manually, and configure system options.")),
        React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
            React.createElement(Card, { className: "p-6" },
                React.createElement("h2", { className: "text-lg font-semibold text-gray-900 mb-4" }, "Manual Activation"),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement(Input, { label: "Kiosk ID", value: kioskId, onChange: (e) => setKioskId(e.target.value), placeholder: "Enter kiosk ID to activate" }),
                    React.createElement(Button, { color: "primary", variant: "solid", onClick: activateKiosk, disabled: loading || !kioskId.trim(), className: "w-full" }, "Activate Kiosk"))),
            React.createElement(Card, { className: "p-6" },
                React.createElement("h2", { className: "text-lg font-semibold text-gray-900 mb-4" }, "Generate Activation QR Code"),
                React.createElement("p", { className: "text-gray-600 mb-4" }, "Generate a QR code that kiosks can scan to activate themselves."),
                React.createElement(Button, { color: "primary", variant: "solid", onClick: generateActivation, disabled: generatingQR, className: "w-full" }, generatingQR ? 'Generating...' : 'Generate QR Code'))),
        React.createElement(Card, { className: "p-6" },
            React.createElement("h2", { className: "text-lg font-semibold text-gray-900 mb-4" }, "Kiosk Systems Configuration"),
            React.createElement("p", { className: "text-gray-600 mb-4" }, "Manage the list of systems that appear in the kiosk interface for ticket creation."),
            React.createElement("div", { className: "mb-6" },
                React.createElement("div", { className: "flex space-x-2" },
                    React.createElement(Input, { value: newSystem, onChange: (e) => setNewSystem(e.target.value), placeholder: "Enter new system name", onKeyPress: (e) => e.key === 'Enter' && addSystem(), className: "flex-1" }),
                    React.createElement(Button, { color: "primary", variant: "solid", onClick: addSystem, disabled: !newSystem.trim() || systemsLoading, className: "flex items-center space-x-2" },
                        React.createElement(PlusIcon, { className: "w-4 h-4" }),
                        React.createElement("span", null, "Add")))),
            systemsLoading ? (React.createElement("div", { className: "text-center py-8" }, "Loading systems...")) : (React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2" },
                (systems || []).map((system) => (React.createElement("div", { key: system, className: "flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border" },
                    React.createElement("span", { className: "text-sm font-medium text-gray-900" }, system),
                    React.createElement("button", { onClick: () => removeSystem(system), className: "text-red-500 hover:text-red-700 transition-colors", title: "Remove system" },
                        React.createElement(XMarkIcon, { className: "w-4 h-4" }))))),
                (systems || []).length === 0 && (React.createElement("div", { className: "col-span-full text-center py-8 text-gray-500" }, "No systems configured yet."))))),
        React.createElement(Card, { className: "p-6" },
            React.createElement("div", { className: "flex items-center justify-between mb-4" },
                React.createElement("h2", { className: "text-lg font-semibold text-gray-900" }, "Activation Codes"),
                React.createElement(Button, { variant: "bordered", size: "sm", onClick: loadActivations, disabled: loading, className: "text-blue-600 hover:text-blue-900", title: "Refresh activation codes" },
                    React.createElement(ArrowPathIcon, { className: "w-4 h-4 mr-1" }),
                    "Refresh")),
            loading ? (React.createElement("div", { className: "text-center py-8" }, "Loading activations...")) : activations.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-gray-500" }, "No activation codes generated yet.")) : (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" }, activations.map((activation) => (React.createElement("div", { key: activation.id, className: `border rounded-lg p-4 ${activation.used
                    ? 'border-gray-300 bg-gray-50'
                    : isExpired(activation.expiresAt)
                        ? 'border-red-300 bg-red-50'
                        : 'border-green-300 bg-green-50'}` },
                React.createElement("div", { className: "mb-3" },
                    React.createElement("div", { className: "text-sm font-medium text-gray-900" },
                        "Code: ",
                        activation.code),
                    React.createElement("div", { className: "text-xs text-gray-500" },
                        "Created: ",
                        new Date(activation.createdAt).toLocaleString()),
                    React.createElement("div", { className: "text-xs text-gray-500" },
                        "Expires: ",
                        new Date(activation.expiresAt).toLocaleString())),
                activation.qrCode && (React.createElement("div", { className: "mb-3 text-center" },
                    React.createElement("img", { src: activation.qrCode, alt: "QR Code", className: "mx-auto max-w-full h-32" }))),
                React.createElement("div", { className: "text-center" }, activation.used ? (React.createElement("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800" },
                    "Used ",
                    activation.usedAt && `on ${new Date(activation.usedAt).toLocaleDateString()}`)) : isExpired(activation.expiresAt) ? (React.createElement("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800" }, "Expired")) : (React.createElement("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800" }, "Active")))))))))));
};
