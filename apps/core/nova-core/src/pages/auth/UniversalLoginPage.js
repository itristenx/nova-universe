import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Input, Card, CardBody, Avatar, Link, Chip } from '@heroui/react';
import { KeyIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon, ShieldCheckIcon, DevicePhoneMobileIcon, FingerPrintIcon, ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { api } from '@/lib/api';
import styles from './UniversalLoginPage.module.css';
export const UniversalLoginPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const { addToast } = useToastStore();
    // Step state
    const [currentStep, setCurrentStep] = useState('discovery');
    const [isLoading, setIsLoading] = useState(false);
    // Discovery step state
    const [email, setEmail] = useState('');
    const [tenantData, setTenantData] = useState(null);
    // Auth step state
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedAuthMethod, setSelectedAuthMethod] = useState(null);
    // MFA step state
    const [mfaCode, setMfaCode] = useState('');
    const [tempSessionId, setTempSessionId] = useState('');
    const [availableMfaMethods, setAvailableMfaMethods] = useState([]);
    const [selectedMfaMethod, setSelectedMfaMethod] = useState(null);
    const [mfaChallengeMessage, setMfaChallengeMessage] = useState('');
    // Get redirect URL from query params
    const redirectUrl = searchParams.get('redirect') || '/';
    // Dynamic theming based on tenant
    const themeColor = tenantData?.branding?.themeColor || '#1f2937';
    const backgroundImage = tenantData?.branding?.backgroundImage;
    const backgroundClass = backgroundImage ? styles.backgroundImage : styles.gradientBg;
    useEffect(() => {
        // Set CSS custom properties on the document root
        if (tenantData?.branding) {
            const root = document.documentElement;
            root.style.setProperty('--theme-color', themeColor);
            root.style.setProperty('--theme-color-10', `${themeColor}10`);
            root.style.setProperty('--theme-color-30', `${themeColor}30`);
            if (backgroundImage) {
                root.style.setProperty('--background-image', `url(${backgroundImage})`);
            }
        }
        return () => {
            // Cleanup CSS custom properties
            const root = document.documentElement;
            root.style.removeProperty('--theme-color');
            root.style.removeProperty('--theme-color-10');
            root.style.removeProperty('--theme-color-30');
            root.style.removeProperty('--background-image');
        };
    }, [tenantData, themeColor, backgroundImage]);
    useEffect(() => {
        // Check for SSO callback token
        const token = searchParams.get('token');
        if (token) {
            handleSSOCallback(token);
        }
    }, [searchParams]);
    const handleSSOCallback = async (token) => {
        try {
            setIsLoading(true);
            const user = await api.me(token);
            login(token, user);
            addToast('success', `Welcome back, ${user.name}!`);
            navigate(redirectUrl);
        }
        catch (error) {
            console.error('SSO callback error:', error);
            addToast('error', 'Invalid authentication token.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim())
            return;
        setIsLoading(true);
        try {
            const response = await fetch('/api/v1/helix/login/tenant/discover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    redirectUrl
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to discover tenant');
            }
            const data = await response.json();
            setTenantData(data);
            // Auto-select primary auth method
            const primaryMethod = data.authMethods.find(m => m.primary) || data.authMethods[0];
            setSelectedAuthMethod(primaryMethod);
            setCurrentStep('auth');
        }
        catch (error) {
            console.error('Discovery error:', error);
            addToast('error', 'Unable to find authentication settings for this email.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleAuthentication = async (e) => {
        e.preventDefault();
        if (!selectedAuthMethod || !tenantData)
            return;
        setIsLoading(true);
        try {
            const authPayload = {
                discoveryToken: tenantData.discoveryToken,
                email: email.trim(),
                authMethod: selectedAuthMethod.type,
                redirectUrl,
                ...(selectedAuthMethod.type === 'password' && { password }),
                ...(selectedAuthMethod.type === 'sso' && { ssoProvider: selectedAuthMethod.provider }),
            };
            const response = await fetch('/api/v1/helix/login/authenticate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authPayload),
            });
            if (!response.ok) {
                throw new Error('Authentication failed');
            }
            const data = await response.json();
            if (data.authMethod === 'sso' && data.redirectUrl) {
                // Redirect to SSO provider
                window.location.href = data.redirectUrl;
                return;
            }
            if (data.requiresMFA) {
                // Proceed to MFA step
                setTempSessionId(data.tempSessionId);
                setAvailableMfaMethods(data.availableMfaMethods);
                setSelectedMfaMethod(data.availableMfaMethods[0] || null);
                setCurrentStep('mfa');
            }
            else {
                // Authentication complete
                const user = data.user;
                login(data.token, user);
                addToast('success', `Welcome back, ${user.name}!`);
                navigate(data.redirectUrl || redirectUrl);
            }
        }
        catch (error) {
            console.error('Authentication error:', error);
            addToast('error', 'Invalid credentials. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleMFAChallenge = async () => {
        if (!selectedMfaMethod || !tempSessionId)
            return;
        setIsLoading(true);
        try {
            const response = await fetch('/api/v1/helix/login/mfa/challenge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tempSessionId,
                    mfaMethod: selectedMfaMethod.type,
                }),
            });
            if (!response.ok) {
                throw new Error('MFA challenge failed');
            }
            const data = await response.json();
            setMfaChallengeMessage(data.message);
        }
        catch (error) {
            console.error('MFA challenge error:', error);
            addToast('error', 'Unable to send verification code.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleMFAVerification = async (e) => {
        e.preventDefault();
        if (!selectedMfaMethod || !tempSessionId || !mfaCode.trim())
            return;
        setIsLoading(true);
        try {
            const response = await fetch('/api/v1/helix/login/mfa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tempSessionId,
                    mfaMethod: selectedMfaMethod.type,
                    code: mfaCode.trim(),
                }),
            });
            if (!response.ok) {
                throw new Error('MFA verification failed');
            }
            const data = await response.json();
            const user = data.user;
            login(data.token, user);
            addToast('success', `Welcome back, ${user.name}!`);
            navigate(redirectUrl);
        }
        catch (error) {
            console.error('MFA verification error:', error);
            addToast('error', 'Invalid verification code. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleAuthMethodSwitch = (method) => {
        setSelectedAuthMethod(method);
        setPassword('');
    };
    const handleMfaMethodSwitch = (method) => {
        setSelectedMfaMethod(method);
        setMfaCode('');
        setMfaChallengeMessage('');
    };
    const handleBack = () => {
        if (currentStep === 'mfa') {
            setCurrentStep('auth');
            setMfaCode('');
            setTempSessionId('');
        }
        else if (currentStep === 'auth') {
            setCurrentStep('discovery');
            setPassword('');
            setSelectedAuthMethod(null);
            setTenantData(null);
        }
    };
    const getAuthMethodIcon = (type) => {
        switch (type) {
            case 'password':
                return React.createElement(KeyIcon, { className: "w-5 h-5" });
            case 'sso':
                return React.createElement(ShieldCheckIcon, { className: "w-5 h-5" });
            case 'passkey':
                return React.createElement(FingerPrintIcon, { className: "w-5 h-5" });
            default:
                return React.createElement(KeyIcon, { className: "w-5 h-5" });
        }
    };
    const getMfaMethodIcon = (type) => {
        switch (type) {
            case 'totp':
                return React.createElement(DevicePhoneMobileIcon, { className: "w-5 h-5" });
            case 'sms':
                return React.createElement(DevicePhoneMobileIcon, { className: "w-5 h-5" });
            case 'email':
                return React.createElement(EnvelopeIcon, { className: "w-5 h-5" });
            default:
                return React.createElement(ShieldCheckIcon, { className: "w-5 h-5" });
        }
    };
    useEffect(() => {
        if (selectedMfaMethod && ['sms', 'email'].includes(selectedMfaMethod.type)) {
            handleMFAChallenge();
        }
    }, [selectedMfaMethod]);
    return (React.createElement("div", { className: `${styles.loginContainer} ${backgroundClass}` },
        React.createElement("div", { className: styles.backgroundOverlay },
            React.createElement("div", { className: `${styles.backgroundElement1} ${styles.primaryBg}` }),
            React.createElement("div", { className: `${styles.backgroundElement2} ${styles.primaryBg}` })),
        React.createElement(Card, { className: "w-full max-w-md mx-auto shadow-2xl border-0 backdrop-blur-lg bg-white/95 dark:bg-gray-900/95" },
            React.createElement(CardBody, { className: "p-8" },
                React.createElement("div", { className: "text-center mb-8" },
                    tenantData?.branding?.logo ? (React.createElement(Avatar, { src: tenantData.branding.logo, className: "w-16 h-16 mx-auto mb-4", alt: tenantData.branding.organizationName })) : (React.createElement("div", { className: `${styles.logoPlaceholder} ${styles.primaryBg}` }, tenantData?.branding?.organizationName?.charAt(0) || 'N')),
                    React.createElement("h1", { className: "text-2xl font-semibold text-gray-900 dark:text-white mb-2" },
                        currentStep === 'discovery' && 'Sign in to Nova',
                        currentStep === 'auth' && `Welcome${tenantData?.userExists ? ' back' : ''}`,
                        currentStep === 'mfa' && 'Verify your identity'),
                    tenantData?.branding?.organizationName && (React.createElement("p", { className: "text-gray-600 dark:text-gray-400 text-sm" }, tenantData.branding.organizationName)),
                    tenantData?.branding?.loginMessage && (React.createElement("p", { className: "text-gray-600 dark:text-gray-400 text-sm mt-2" }, tenantData.branding.loginMessage))),
                currentStep === 'discovery' && (React.createElement("form", { onSubmit: handleEmailSubmit, className: "space-y-6" },
                    React.createElement("div", null,
                        React.createElement(Input, { type: "email", label: "Email address", placeholder: "Enter your email", value: email, onChange: (e) => setEmail(e.target.value), startContent: React.createElement(EnvelopeIcon, { className: "w-4 h-4 text-gray-400" }), variant: "bordered", size: "lg", isRequired: true, className: "mb-4" })),
                    React.createElement(Button, { type: "submit", className: `w-full text-white font-medium ${styles.primaryBg}`, size: "lg", isLoading: isLoading, isDisabled: !email.trim(), endContent: !isLoading && React.createElement(ArrowRightIcon, { className: "w-4 h-4" }) }, isLoading ? 'Finding your organization...' : 'Continue'),
                    React.createElement("div", { className: "text-center" },
                        React.createElement("p", { className: "text-xs text-gray-500 dark:text-gray-400" }, "Enter your email to discover your organization's sign-in options")))),
                currentStep === 'auth' && tenantData && (React.createElement("div", { className: "space-y-6" },
                    React.createElement(Button, { variant: "light", size: "sm", startContent: React.createElement(ArrowLeftIcon, { className: "w-4 h-4" }), onClick: handleBack, className: "mb-4" }, "Back"),
                    React.createElement("div", { className: "text-center mb-6" },
                        React.createElement("p", { className: "text-sm text-gray-600 dark:text-gray-400" },
                            "Signing in as ",
                            React.createElement("span", { className: "font-medium" }, email))),
                    tenantData.authMethods.length > 1 && (React.createElement("div", { className: "space-y-2 mb-6" },
                        React.createElement("p", { className: "text-sm font-medium text-gray-700 dark:text-gray-300" }, "Choose your sign-in method:"),
                        React.createElement("div", { className: "grid gap-2" }, tenantData.authMethods.map((method) => (React.createElement(Button, { key: `${method.type}-${method.provider || ''}`, variant: selectedAuthMethod === method ? 'solid' : 'bordered', className: selectedAuthMethod === method ? styles.authMethodButtonActive : styles.authMethodButton, startContent: getAuthMethodIcon(method.type), onClick: () => handleAuthMethodSwitch(method) },
                            method.name,
                            method.primary && React.createElement(Chip, { size: "sm", variant: "light", className: "ml-auto" }, "Primary"))))))),
                    React.createElement("form", { onSubmit: handleAuthentication, className: "space-y-4" },
                        selectedAuthMethod?.type === 'password' && (React.createElement("div", null,
                            React.createElement(Input, { type: showPassword ? 'text' : 'password', label: "Password", placeholder: "Enter your password", value: password, onChange: (e) => setPassword(e.target.value), startContent: React.createElement(KeyIcon, { className: "w-4 h-4 text-gray-400" }), endContent: React.createElement("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "focus:outline-none" }, showPassword ? (React.createElement(EyeSlashIcon, { className: "w-4 h-4 text-gray-400" })) : (React.createElement(EyeIcon, { className: "w-4 h-4 text-gray-400" }))), variant: "bordered", size: "lg", isRequired: true }))),
                        React.createElement(Button, { type: "submit", className: `w-full text-white font-medium ${styles.primaryBg}`, size: "lg", isLoading: isLoading, isDisabled: (selectedAuthMethod?.type === 'password' && !password.trim()) ||
                                !selectedAuthMethod }, isLoading ? 'Signing in...' : 'Sign in'),
                        selectedAuthMethod?.type === 'password' && (React.createElement("div", { className: "text-center" },
                            React.createElement(Link, { href: "#", className: `text-sm ${styles.primaryText}` }, "Forgot your password?")))))),
                currentStep === 'mfa' && (React.createElement("div", { className: "space-y-6" },
                    React.createElement(Button, { variant: "light", size: "sm", startContent: React.createElement(ArrowLeftIcon, { className: "w-4 h-4" }), onClick: handleBack, className: "mb-4" }, "Back"),
                    availableMfaMethods.length > 1 && (React.createElement("div", { className: "space-y-2 mb-6" },
                        React.createElement("p", { className: "text-sm font-medium text-gray-700 dark:text-gray-300" }, "Choose verification method:"),
                        React.createElement("div", { className: "grid gap-2" }, availableMfaMethods.map((method) => (React.createElement(Button, { key: method.type, variant: selectedMfaMethod === method ? 'solid' : 'bordered', className: selectedMfaMethod === method ? styles.mfaMethodButtonActive : styles.mfaMethodButton, startContent: getMfaMethodIcon(method.type), onClick: () => handleMfaMethodSwitch(method) },
                            method.name,
                            method.primary && React.createElement(Chip, { size: "sm", variant: "light", className: "ml-auto" }, "Primary"))))))),
                    mfaChallengeMessage && (React.createElement("div", { className: "p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800" },
                        React.createElement("p", { className: "text-sm text-blue-800 dark:text-blue-200" }, mfaChallengeMessage))),
                    React.createElement("form", { onSubmit: handleMFAVerification, className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement(Input, { type: "text", label: "Verification code", placeholder: "Enter your verification code", value: mfaCode, onChange: (e) => setMfaCode(e.target.value), startContent: getMfaMethodIcon(selectedMfaMethod?.type || ''), variant: "bordered", size: "lg", isRequired: true, autoComplete: "one-time-code", maxLength: selectedMfaMethod?.type === 'totp' ? 6 : 10 })),
                        React.createElement(Button, { type: "submit", className: `w-full text-white font-medium ${styles.primaryBg}`, size: "lg", isLoading: isLoading, isDisabled: !mfaCode.trim() }, isLoading ? 'Verifying...' : 'Verify'),
                        selectedMfaMethod && ['sms', 'email'].includes(selectedMfaMethod.type) && (React.createElement("div", { className: "text-center" },
                            React.createElement(Button, { variant: "light", size: "sm", onClick: handleMFAChallenge, isLoading: isLoading, className: styles.primaryText }, "Didn't receive a code? Resend")))))),
                React.createElement("div", { className: "mt-8 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg" },
                    React.createElement("div", { className: "flex items-start space-x-2" },
                        React.createElement(ShieldCheckIcon, { className: "w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" }),
                        React.createElement("p", { className: "text-xs text-gray-600 dark:text-gray-400" }, "Your privacy and security are protected by enterprise-grade encryption and authentication.")))))));
};
