import React, { useState } from 'react';
import { Button, Card, Modal, Input } from '@/components/ui';
import { KeyIcon, EyeIcon, EyeSlashIcon, ShieldCheckIcon, ComputerDesktopIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
export const _AdminPinManagement = ({ kiosks, onUpdate }) => {
    const [pinConfig, setPinConfig] = useState({
        globalPin: '',
        kioskPins: {}
    });
    const [showPins, setShowPins] = useState({});
    const [loading, setLoading] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);
    const [testPinValue, setTestPinValue] = useState('');
    const [testKioskId, setTestKioskId] = useState('');
    const [testResult, setTestResult] = useState(null);
    const { addToast } = useToastStore();
    const validatePin = (pin, context) => {
        if (pin.length === 0) {
            return { isValid: true, message: '' };
        }
        if (pin.length !== 6) {
            return { isValid: false, message: 'PIN must be exactly 6 digits' };
        }
        if (!/^\d{6}$/.test(pin)) {
            return { isValid: false, message: 'PIN must contain only numbers' };
        }
        // Check for duplicates
        if (context) {
            const { globalPin, kioskPins } = pinConfig;
            if (context.type === 'global') {
                // Check if global PIN conflicts with any kiosk PIN
                for (const [kioskId, kioskPin] of Object.entries(kioskPins)) {
                    if (kioskPin === pin) {
                        return { isValid: false, message: `PIN conflicts with kiosk ${kioskId}` };
                    }
                }
            }
            else if (context.type === 'kiosk' && context.kioskId) {
                // Check if kiosk PIN conflicts with global PIN
                if (globalPin === pin) {
                    return { isValid: false, message: 'PIN conflicts with global PIN' };
                }
                // Check if kiosk PIN conflicts with other kiosk PINs
                for (const [otherKioskId, otherPin] of Object.entries(kioskPins)) {
                    if (otherKioskId !== context.kioskId && otherPin === pin) {
                        return { isValid: false, message: `PIN conflicts with kiosk ${otherKioskId}` };
                    }
                }
            }
        }
        return { isValid: true, message: 'Valid PIN format' };
    };
    const updateGlobalPin = (pin) => {
        setPinConfig(prev => ({ ...prev, globalPin: pin }));
    };
    const updateKioskPin = (kioskId, pin) => {
        setPinConfig(prev => ({
            ...prev,
            kioskPins: {
                ...prev.kioskPins,
                [kioskId]: pin
            }
        }));
    };
    const removeKioskPin = (kioskId) => {
        setPinConfig(prev => {
            const newKioskPins = { ...prev.kioskPins };
            delete newKioskPins[kioskId];
            return { ...prev, kioskPins: newKioskPins };
        });
    };
    const toggleShowPin = (key) => {
        setShowPins(prev => ({ ...prev, [key]: !prev[key] }));
    };
    const savePinConfiguration = async () => {
        try {
            setLoading(true);
            // Validate all PINs
            const globalValidation = validatePin(pinConfig.globalPin, { type: 'global' });
            if (!globalValidation.isValid) {
                throw new Error(`Global PIN: ${globalValidation.message}`);
            }
            for (const [kioskId, pin] of Object.entries(pinConfig.kioskPins)) {
                const validation = validatePin(pin, { type: 'kiosk', kioskId });
                if (!validation.isValid) {
                    throw new Error(`Kiosk ${kioskId} PIN: ${validation.message}`);
                }
            }
            await api.updateAdminPins({
                globalPin: pinConfig.globalPin || undefined,
                kioskPins: Object.keys(pinConfig.kioskPins).length > 0 ? pinConfig.kioskPins : undefined
            }); // TODO-LINT: move to async function
            addToast({
                type: 'success',
                title: 'Success',
                description: 'Admin PINs updated successfully',
            });
            onUpdate();
        }
        catch (error) {
            console.error('Failed to update admin PINs:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to update admin PINs',
            });
        }
        finally {
            setLoading(false);
        }
    };
    const validatePinInput = async () => {
        try {
            setLoading(true);
            const result = await api.validateAdminPin(testPinValue, testKioskId || undefined); // TODO-LINT: move to async function
            setTestResult(result);
        }
        catch (error) {
            console.error('Failed to test PIN:', error);
            setTestResult({
                valid: false,
                permissions: [],
                expiresAt: '',
                error: 'Failed to validate PIN'
            });
        }
        finally {
            setLoading(false);
        }
    };
    const generateRandomPin = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement(Card, { className: "p-6" },
            React.createElement("div", { className: "flex items-center justify-between mb-6" },
                React.createElement("div", { className: "flex items-center space-x-3" },
                    React.createElement(KeyIcon, { className: "h-6 w-6 text-primary-600" }),
                    React.createElement("div", null,
                        React.createElement("h3", { className: "text-lg font-medium text-gray-900" }, "Admin PIN Management"),
                        React.createElement("p", { className: "text-sm text-gray-600" }, "Configure PINs for offline admin access on kiosks"))),
                React.createElement("div", { className: "flex space-x-3" },
                    React.createElement(Button, { variant: "secondary", onClick: () => setShowTestModal(true) }, "Test PIN"),
                    React.createElement(Button, { onClick: savePinConfiguration, disabled: loading }, loading ? 'Saving...' : 'Save Configuration'))),
            React.createElement("div", { className: "space-y-6" },
                React.createElement("div", { className: "border border-gray-200 rounded-lg p-4" },
                    React.createElement("div", { className: "flex items-center justify-between mb-4" },
                        React.createElement("div", { className: "flex items-center space-x-2" },
                            React.createElement(ShieldCheckIcon, { className: "h-5 w-5 text-blue-600" }),
                            React.createElement("h4", { className: "text-md font-medium text-gray-900" }, "Global Admin PIN")),
                        React.createElement(Button, { variant: "secondary", size: "sm", onClick: () => updateGlobalPin(generateRandomPin()) }, "Generate Random")),
                    React.createElement("div", { className: "space-y-3" },
                        React.createElement("div", { className: "flex space-x-2" },
                            React.createElement("div", { className: "flex-1" },
                                React.createElement(Input, { label: "Global PIN (6 digits)", type: showPins.global ? "text" : "password", value: pinConfig.globalPin, onChange: (e) => updateGlobalPin(e.target.value), placeholder: "000000", maxLength: 6 })),
                            React.createElement(Button, { variant: "secondary", size: "sm", onClick: () => toggleShowPin('global'), className: "mt-6" }, showPins.global ? React.createElement(EyeSlashIcon, { className: "h-4 w-4" }) : React.createElement(EyeIcon, { className: "h-4 w-4" }))),
                        pinConfig.globalPin && (React.createElement("div", { className: "text-sm" }, validatePin(pinConfig.globalPin, { type: 'global' }).isValid ? (React.createElement("div", { className: "flex items-center text-green-600" },
                            React.createElement(CheckCircleIcon, { className: "h-4 w-4 mr-1" }),
                            "Valid PIN format")) : (React.createElement("div", { className: "flex items-center text-red-600" },
                            React.createElement(ExclamationTriangleIcon, { className: "h-4 w-4 mr-1" }),
                            validatePin(pinConfig.globalPin, { type: 'global' }).message)))),
                        React.createElement("p", { className: "text-sm text-gray-600" }, "The global PIN works on all kiosks and provides full admin permissions including user management."))),
                React.createElement("div", { className: "border border-gray-200 rounded-lg p-4" },
                    React.createElement("div", { className: "flex items-center justify-between mb-4" },
                        React.createElement("div", { className: "flex items-center space-x-2" },
                            React.createElement(ComputerDesktopIcon, { className: "h-5 w-5 text-orange-600" }),
                            React.createElement("h4", { className: "text-md font-medium text-gray-900" }, "Kiosk-Specific PINs"))),
                    React.createElement("div", { className: "space-y-4" },
                        kiosks.length === 0 ? (React.createElement("div", { className: "bg-gray-50 rounded-md p-6 text-center" },
                            React.createElement(ComputerDesktopIcon, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }),
                            React.createElement("h4", { className: "text-sm font-medium text-gray-900 mb-2" }, "No Kiosks Available"),
                            React.createElement("p", { className: "text-sm text-gray-500" }, "No kiosks are currently registered in the system. Kiosk-specific PINs will be available once kiosks are added."))) : (kiosks.map((kiosk) => (React.createElement("div", { key: kiosk.id, className: "bg-gray-50 rounded-md p-3" },
                            React.createElement("div", { className: "flex items-center justify-between mb-2" },
                                React.createElement("div", { className: "flex items-center space-x-2" },
                                    React.createElement("span", { className: "font-medium text-gray-900" }, kiosk.id),
                                    React.createElement("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${kiosk.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}` }, kiosk.active ? 'Active' : 'Inactive')),
                                React.createElement("div", { className: "flex space-x-2" },
                                    React.createElement(Button, { variant: "secondary", size: "sm", onClick: () => updateKioskPin(kiosk.id, generateRandomPin()) }, "Generate"),
                                    pinConfig.kioskPins[kiosk.id] && (React.createElement(Button, { variant: "secondary", size: "sm", onClick: () => removeKioskPin(kiosk.id) }, "Remove")))),
                            React.createElement("div", { className: "flex space-x-2" },
                                React.createElement("div", { className: "flex-1" },
                                    React.createElement(Input, { label: `PIN for ${kiosk.id}`, type: showPins[kiosk.id] ? "text" : "password", value: pinConfig.kioskPins[kiosk.id] || '', onChange: (e) => updateKioskPin(kiosk.id, e.target.value), placeholder: "Leave empty for global PIN only", maxLength: 6 })),
                                React.createElement(Button, { variant: "secondary", size: "sm", onClick: () => toggleShowPin(kiosk.id), className: "mt-6" }, showPins[kiosk.id] ? React.createElement(EyeSlashIcon, { className: "h-4 w-4" }) : React.createElement(EyeIcon, { className: "h-4 w-4" }))),
                            pinConfig.kioskPins[kiosk.id] && (React.createElement("div", { className: "mt-2 text-sm" }, validatePin(pinConfig.kioskPins[kiosk.id], { type: 'kiosk', kioskId: kiosk.id }).isValid ? (React.createElement("div", { className: "flex items-center text-green-600" },
                                React.createElement(CheckCircleIcon, { className: "h-4 w-4 mr-1" }),
                                "Valid PIN format")) : (React.createElement("div", { className: "flex items-center text-red-600" },
                                React.createElement(ExclamationTriangleIcon, { className: "h-4 w-4 mr-1" }),
                                validatePin(pinConfig.kioskPins[kiosk.id], { type: 'kiosk', kioskId: kiosk.id }).message)))))))),
                        React.createElement("p", { className: "text-sm text-gray-600" }, "Kiosk-specific PINs provide limited admin permissions (status, schedule, branding) for that specific kiosk only."))))),
        React.createElement(Modal, { isOpen: showTestModal, onClose: () => {
                setShowTestModal(false);
                setTestPinValue('');
                setTestKioskId('');
                setTestResult(null);
            }, title: "Test Admin PIN", size: "md" },
            React.createElement("div", { className: "space-y-4" },
                React.createElement("div", null,
                    React.createElement(Input, { label: "PIN to Test", type: "text", value: testPinValue, onChange: (e) => setTestPinValue(e.target.value), placeholder: "123456", maxLength: 6 })),
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Test Context (Optional)"),
                    React.createElement("select", { value: testKioskId, onChange: (e) => setTestKioskId(e.target.value), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500", title: "Select kiosk for testing context" },
                        React.createElement("option", { value: "" }, "Global Context"),
                        kiosks.map((kiosk) => (React.createElement("option", { key: kiosk.id, value: kiosk.id }, kiosk.id))))),
                testResult && (React.createElement("div", { className: `p-3 rounded-md ${testResult.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}` },
                    React.createElement("div", { className: "flex items-center space-x-2 mb-2" },
                        testResult.valid ? (React.createElement(CheckCircleIcon, { className: "h-5 w-5 text-green-600" })) : (React.createElement(ExclamationTriangleIcon, { className: "h-5 w-5 text-red-600" })),
                        React.createElement("span", { className: `font-medium ${testResult.valid ? 'text-green-800' : 'text-red-800'}` }, testResult.valid ? 'PIN Valid' : 'PIN Invalid')),
                    testResult.valid && (React.createElement("div", { className: "text-sm space-y-1" },
                        React.createElement("div", null,
                            React.createElement("strong", null, "PIN Type:"),
                            " ",
                            testResult.pinType || 'Unknown'),
                        React.createElement("div", null,
                            React.createElement("strong", null, "Permissions:"),
                            " ",
                            testResult.permissions.join(', ')),
                        React.createElement("div", null,
                            React.createElement("strong", null, "Expires:"),
                            " ",
                            new Date(testResult.expiresAt).toLocaleString()))),
                    testResult.error && (React.createElement("div", { className: "text-sm text-red-800" },
                        React.createElement("strong", null, "Error:"),
                        " ",
                        testResult.error))))),
            React.createElement("div", { className: "flex justify-end space-x-3 mt-6" },
                React.createElement(Button, { variant: "secondary", onClick: () => {
                        setShowTestModal(false);
                        setTestPinValue('');
                        setTestKioskId('');
                        setTestResult(null);
                    } }, "Close"),
                React.createElement(Button, { onClick: validatePinInput, disabled: testPinValue.length !== 6 || loading }, loading ? 'Testing...' : 'Test PIN')))));
};
