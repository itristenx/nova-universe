import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '@heroui/react';
import { KeyIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { useApiHealth } from '@/hooks/useApiHealth';
import { ServerConnectionModal } from '@/components/ServerConnectionModal';
import { api } from '@/lib/api';
export const _LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
    const [showServerModal, setShowServerModal] = useState(false);
    const [ssoAvailable, setSsoAvailable] = useState(false);
    const [ssoLoginUrl, setSsoLoginUrl] = useState(null);
    const [passkeyAvailable, setPasskeyAvailable] = useState(false);
    const [branding, setBranding] = useState({});
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const { addToast } = useToastStore();
    const { isConnected } = useApiHealth();
    // Check for SSO availability and handle URL token on mount
    useEffect(() => {
        const checkSSOAndToken = async () => {
            try {
                // Check if SSO is available
                const ssoInfo = await api.getSSOAvailability(); // TODO-LINT: move to async function
                setSsoAvailable(ssoInfo.available);
                setSsoLoginUrl(ssoInfo.loginUrl || null);
                // Check if passkeys are available (WebAuthn support)
                const webAuthnSupported = !!(window.PublicKeyCredential && navigator.credentials && navigator.credentials.create);
                setPasskeyAvailable(webAuthnSupported);
                console.log('WebAuthn supported:', webAuthnSupported);
                console.log('Passkey available:', passkeyAvailable);
            }
            catch (error) {
                console.error('Failed to check SSO availability:', error);
            }
            // Check for token in URL (from SSO redirect)
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            if (token) {
                try {
                    // Clear URL parameters
                    window.history.replaceState({}, document.title, window.location.pathname);
                    // Store token and get user info
                    localStorage.setItem('auth_token', token);
                    const user = await api.me(token); // TODO-LINT: move to async function
                    login(token, user);
                    addToast({
                        type: 'success',
                        title: 'SSO Login successful',
                        description: `Welcome back, ${user.name}!`,
                    });
                    navigate('/');
                }
                catch (error) {
                    console.error('SSO token validation failed:', error);
                    addToast({
                        type: 'error',
                        title: 'SSO Login failed',
                        description: 'Invalid token received from SSO provider.',
                    });
                }
            }
        };
        checkSSOAndToken();
        api.getOrganizationBranding()
            .then(setBranding)
            .catch((error) => {
            console.error('Failed to fetch organization branding:', error);
            setBranding({ logo: null, themeColor: '#000000' }); // Fallback branding
        });
    }, [login, navigate, addToast]);
    const handlePasskeyLogin = async () => {
        try {
            setIsPasskeyLoading(true);
            // Check if WebAuthn is supported
            if (!window.PublicKeyCredential) {
                throw new Error('WebAuthn is not supported in this browser');
            }
            // Start passkey authentication
            const options = await api.beginPasskeyAuthentication(); // TODO-LINT: move to async function
            // Convert base64url to ArrayBuffer for the challenge
            const challenge = Uint8Array.from(atob(options.challenge.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
            // Convert allowCredentials if present
            const allowCredentials = options.allowCredentials?.map((cred) => ({
                ...cred,
                id: Uint8Array.from(atob(cred.id.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
            }));
            const credential = await navigator.credentials.get({
                publicKey: {
                    ...options,
                    challenge,
                    allowCredentials
                }
            }); // TODO-LINT: move to async function
            if (!credential) {
                throw new Error('Failed to get credential');
            }
            // Prepare credential data for server
            const response = credential.response;
            const credentialData = {
                id: credential.id,
                rawId: arrayBufferToBase64url(credential.rawId),
                response: {
                    clientDataJSON: arrayBufferToBase64url(response.clientDataJSON),
                    authenticatorData: arrayBufferToBase64url(response.authenticatorData),
                    signature: arrayBufferToBase64url(response.signature),
                    userHandle: response.userHandle ? arrayBufferToBase64url(response.userHandle) : null
                },
                type: credential.type
            };
            // Authenticate with server
            const result = await api.completePasskeyAuthentication(credentialData); // TODO-LINT: move to async function
            if (result.verified && result.token) {
                // Store token and get user info
                localStorage.setItem('auth_token', result.token);
                const user = result.user || await api.me(result.token); // TODO-LINT: move to async function
                login(result.token, user);
                addToast({
                    type: 'success',
                    title: 'Passkey Login successful',
                    description: `Welcome back, ${user.name}!`,
                });
                navigate('/');
            }
            else {
                throw new Error('Passkey authentication failed');
            }
        }
        catch (error) {
            console.error('Passkey login error:', error);
            const errorTitle = 'Passkey Login failed';
            let errorDescription = 'Authentication failed. Please try again.';
            if (error.name === 'NotAllowedError') {
                errorDescription = 'Authentication was cancelled or timed out.';
            }
            else if (error.name === 'InvalidStateError') {
                errorDescription = 'This device is not registered for passkey authentication.';
            }
            else if (error.message.includes('WebAuthn')) {
                errorDescription = 'Your browser does not support passkey authentication.';
            }
            addToast({
                type: 'error',
                title: errorTitle,
                description: errorDescription,
            });
        }
        finally {
            setIsPasskeyLoading(false);
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { token } = await api.login({ email, password }); // TODO-LINT: move to async function
            // Store token immediately so it's available for subsequent API calls
            localStorage.setItem('auth_token', token);
            // Use the token directly for the user profile call
            const user = await api.me(token); // TODO-LINT: move to async function
            login(token, user);
            addToast({
                type: 'success',
                title: 'Login successful',
                description: `Welcome back, ${user.name}!`,
            });
            navigate('/');
        }
        catch (error) {
            console.error('Login error:', error);
            let errorTitle = 'Login failed';
            let errorDescription = 'Please check your credentials and try again.';
            // Handle different types of errors
            if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                errorTitle = 'Connection failed';
                errorDescription = 'Unable to connect to the server. Please check your internet connection and try again.';
            }
            else if (error.response?.status === 401) {
                errorTitle = 'Invalid credentials';
                errorDescription = 'The email or password you entered is incorrect. Please try again.';
            }
            else if (error.response?.status === 429) {
                errorTitle = 'Too many attempts';
                errorDescription = 'Too many login attempts. Please wait a few minutes before trying again.';
            }
            else if (error.response?.status >= 500) {
                errorTitle = 'Server error';
                errorDescription = 'The server is experiencing issues. Please try again later.';
            }
            addToast({
                type: 'error',
                title: errorTitle,
                description: errorDescription,
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    return (React.createElement("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8" },
        React.createElement("div", { className: "max-w-md w-full space-y-8" },
            React.createElement("div", null,
                React.createElement("div", { className: "mx-auto h-24 w-48 flex items-center justify-center mb-8" },
                    React.createElement("img", { className: "h-20 w-auto max-w-full object-contain", src: branding.logoUrl || '/logo.png', alt: "Organization logo", onError: (e) => {
                            e.currentTarget.src = '/vite.svg';
                        } })),
                React.createElement("h2", { className: "mt-6 text-center text-3xl font-bold text-gray-900 dark:text-gray-100" }, branding.welcomeMessage || 'Sign in to Nova Universe Portal'),
                React.createElement("p", { className: "mt-2 text-center text-sm text-gray-600 dark:text-gray-400" }, branding.helpMessage || 'Manage your kiosks, users, and support tickets')),
            React.createElement(Card, { className: "bg-white dark:bg-gray-800" },
                React.createElement("form", { className: "space-y-6", onSubmit: handleSubmit },
                    React.createElement(Input, { label: "Email address", type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, autoComplete: "email", autoFocus: true }),
                    React.createElement(Input, { label: "Password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, autoComplete: "current-password" }),
                    React.createElement(Button, { type: "submit", variant: "primary", className: "w-full", isLoading: isLoading, disabled: !email || !password }, "Sign in"),
                    (ssoAvailable || passkeyAvailable) && (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "relative" },
                            React.createElement("div", { className: "absolute inset-0 flex items-center" },
                                React.createElement("div", { className: "w-full border-t border-gray-300 dark:border-gray-600" })),
                            React.createElement("div", { className: "relative flex justify-center text-xs uppercase" },
                                React.createElement("span", { className: "bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400" }, "Or"))),
                        React.createElement("div", { className: "space-y-3" },
                            passkeyAvailable && (React.createElement(Button, { type: "button", variant: "secondary", className: "w-full", onClick: handlePasskeyLogin, isLoading: isPasskeyLoading },
                                React.createElement(KeyIcon, { className: "h-4 w-4 mr-2" }),
                                "Sign in with Passkey")),
                            ssoAvailable && ssoLoginUrl && (React.createElement(Button, { type: "button", variant: "secondary", className: "w-full", onClick: () => {
                                    window.location.href = ssoLoginUrl;
                                } }, "Sign in with SSO"))))))),
            React.createElement("div", { className: "flex justify-center" },
                React.createElement("button", { onClick: () => setShowServerModal(true), className: "flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors", title: "Server connection status - Click to configure" },
                    React.createElement("div", { className: `h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}` }),
                    React.createElement("span", { className: "text-xs text-gray-600 dark:text-gray-400" },
                        "Server ",
                        isConnected ? 'Connected' : 'Offline')))),
        React.createElement(ServerConnectionModal, { isOpen: showServerModal, onClose: () => setShowServerModal(false) })));
};
