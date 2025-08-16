import React, { useState, useEffect } from 'react';
import { Button, Card, Modal } from '@/components/ui';
import { DevicePhoneMobileIcon, ComputerDesktopIcon, TrashIcon, PlusIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
export const _PasskeyManagement = ({ showTitle = true }) => {
    const [passkeys, setPasskeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false });
    const { addToast } = useToastStore();
    useEffect(() => {
        loadPasskeys();
    }, []);
    const loadPasskeys = async () => {
        try {
            setLoading(true);
            const data = await api.getPasskeys(); // TODO-LINT: move to async function
            setPasskeys(data);
        }
        catch (error) {
            console.error('Failed to load passkeys:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to load passkeys'
            });
        }
        finally {
            setLoading(false);
        }
    };
    const registerPasskey = async () => {
        try {
            setRegistering(true);
            // Check if WebAuthn is supported
            if (!window.PublicKeyCredential) {
                throw new Error('WebAuthn is not supported in this browser');
            }
            // Get registration options from server
            const options = await api.beginPasskeyRegistration({}); // TODO-LINT: move to async function
            // Convert base64url to ArrayBuffer for the challenge
            const challenge = Uint8Array.from(atob(options.challenge.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
            const userIdBuffer = Uint8Array.from(atob(options.user.id.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
            const credential = await navigator.credentials.create({
                publicKey: {
                    ...options,
                    challenge,
                    user: {
                        ...options.user,
                        id: userIdBuffer
                    }
                }
            }); // TODO-LINT: move to async function
            if (!credential) {
                throw new Error('Failed to create credential');
            }
            // Prepare credential data for server
            const response = credential.response;
            const credentialData = {
                id: credential.id,
                rawId: arrayBufferToBase64url(credential.rawId),
                response: {
                    clientDataJSON: arrayBufferToBase64url(response.clientDataJSON),
                    attestationObject: arrayBufferToBase64url(response.attestationObject)
                },
                type: credential.type,
                name: prompt('Enter a name for this passkey (e.g., "iPhone", "YubiKey")') || 'Unnamed Passkey'
            };
            // Register with server
            await api.completePasskeyRegistration(credentialData); // TODO-LINT: move to async function
            addToast({
                type: 'success',
                title: 'Passkey Registered',
                description: 'Your passkey has been successfully registered'
            });
            await loadPasskeys(); // TODO-LINT: move to async function
        }
        catch (error) {
            console.error('Failed to register passkey:', error);
            addToast({
                type: 'error',
                title: 'Registration Failed',
                description: error.message || 'Failed to register passkey'
            });
        }
        finally {
            setRegistering(false);
        }
    };
    const deletePasskey = async (passkey) => {
        try {
            await api.deletePasskey(passkey.id); // TODO-LINT: move to async function
            addToast({
                type: 'success',
                title: 'Passkey Deleted',
                description: 'The passkey has been removed from your account'
            });
            await loadPasskeys(); // TODO-LINT: move to async function
            setDeleteModal({ isOpen: false });
        }
        catch (error) {
            console.error('Failed to delete passkey:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to delete passkey'
            });
        }
    };
    const arrayBufferToBase64url = (buffer) => {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    };
    const getDeviceIcon = (deviceType) => {
        if (deviceType?.includes('mobile') || deviceType?.includes('phone')) {
            return DevicePhoneMobileIcon;
        }
        return ComputerDesktopIcon;
    };
    const formatLastUsed = (date) => {
        if (!date)
            return 'Never';
        const lastUsed = new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - lastUsed.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0)
            return 'Today';
        if (diffDays === 1)
            return 'Yesterday';
        if (diffDays < 7)
            return `${diffDays} days ago`;
        if (diffDays < 30)
            return `${Math.floor(diffDays / 7)} weeks ago`;
        return lastUsed.toLocaleDateString();
    };
    if (loading) {
        return (React.createElement("div", { className: "flex items-center justify-center py-8" },
            React.createElement("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" })));
    }
    return (React.createElement("div", { className: "space-y-6" },
        showTitle && (React.createElement("div", null,
            React.createElement("h3", { className: "text-lg font-medium text-gray-900 dark:text-gray-100" }, "Passkey Management"),
            React.createElement("p", { className: "text-sm text-gray-500 dark:text-gray-400" }, "Manage your passkeys for secure, passwordless authentication"))),
        !window.PublicKeyCredential && (React.createElement(Card, { className: "p-4 border-amber-200 bg-amber-50 dark:bg-amber-900/20" },
            React.createElement("div", { className: "flex" },
                React.createElement(ExclamationTriangleIcon, { className: "h-5 w-5 text-amber-400" }),
                React.createElement("div", { className: "ml-3" },
                    React.createElement("h3", { className: "text-sm font-medium text-amber-800 dark:text-amber-200" }, "WebAuthn Not Supported"),
                    React.createElement("div", { className: "mt-2 text-sm text-amber-700 dark:text-amber-300" },
                        React.createElement("p", null, "Your browser does not support WebAuthn. Please use a modern browser like Chrome, Firefox, Safari, or Edge to use passkeys.")))))),
        window.PublicKeyCredential && (React.createElement("div", { className: "flex justify-between items-center" },
            React.createElement("div", null,
                React.createElement("h4", { className: "text-sm font-medium text-gray-900 dark:text-gray-100" }, "Your Passkeys"),
                React.createElement("p", { className: "text-xs text-gray-500 dark:text-gray-400" }, passkeys.length === 0 ? 'No passkeys configured' : `${passkeys.length} passkey${passkeys.length === 1 ? '' : 's'} configured`)),
            React.createElement(Button, { variant: "primary", size: "sm", onClick: registerPasskey, disabled: registering, isLoading: registering },
                React.createElement(PlusIcon, { className: "h-4 w-4 mr-2" }),
                "Add Passkey"))),
        passkeys.length > 0 && (React.createElement("div", { className: "space-y-3" }, passkeys.map((passkey) => {
            const DeviceIcon = getDeviceIcon(passkey.deviceType);
            return (React.createElement(Card, { key: passkey.id, className: "p-4" },
                React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement("div", { className: "flex items-center space-x-3" },
                        React.createElement("div", { className: "flex-shrink-0" },
                            React.createElement("div", { className: "w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center" },
                                React.createElement(DeviceIcon, { className: "h-5 w-5 text-primary-600 dark:text-primary-400" }))),
                        React.createElement("div", null,
                            React.createElement("h4", { className: "text-sm font-medium text-gray-900 dark:text-gray-100" }, passkey.name),
                            React.createElement("div", { className: "flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400" },
                                React.createElement("span", null,
                                    "Created ",
                                    new Date(passkey.createdAt).toLocaleDateString()),
                                React.createElement("span", null,
                                    "Last used ",
                                    formatLastUsed(passkey.lastUsed))))),
                    React.createElement(Button, { variant: "default", size: "sm", onClick: () => setDeleteModal({ isOpen: true, passkey }), className: "text-red-600 hover:text-red-700 hover:bg-red-50" },
                        React.createElement(TrashIcon, { className: "h-4 w-4" })))));
        }))),
        React.createElement(Card, { className: "p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" },
            React.createElement("div", { className: "flex" },
                React.createElement(CheckCircleIcon, { className: "h-5 w-5 text-blue-400" }),
                React.createElement("div", { className: "ml-3" },
                    React.createElement("h3", { className: "text-sm font-medium text-blue-800 dark:text-blue-200" }, "About Passkeys"),
                    React.createElement("div", { className: "mt-2 text-sm text-blue-700 dark:text-blue-300" },
                        React.createElement("ul", { className: "space-y-1" },
                            React.createElement("li", null, "\u2022 Passkeys provide secure, passwordless authentication"),
                            React.createElement("li", null, "\u2022 Works with Face ID, Touch ID, Windows Hello, or security keys"),
                            React.createElement("li", null, "\u2022 More secure than passwords and resistant to phishing"),
                            React.createElement("li", null, "\u2022 Can be used for admin login and kiosk authentication")))))),
        React.createElement(Modal, { isOpen: deleteModal.isOpen, onClose: () => setDeleteModal({ isOpen: false }), title: "Delete Passkey" },
            React.createElement("div", { className: "space-y-4" },
                React.createElement("p", { className: "text-sm text-gray-600 dark:text-gray-400" },
                    "Are you sure you want to delete the passkey \"",
                    deleteModal.passkey?.name,
                    "\"? This action cannot be undone."),
                React.createElement("div", { className: "flex justify-end space-x-3" },
                    React.createElement(Button, { variant: "secondary", onClick: () => setDeleteModal({ isOpen: false }) }, "Cancel"),
                    React.createElement(Button, { variant: "danger", onClick: () => deleteModal.passkey && deletePasskey(deleteModal.passkey) }, "Delete Passkey"))))));
};
