import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Input, Card, CardBody, Spinner, Avatar, Link, Divider, Chip } from '@heroui/react';
import { 
  KeyIcon, 
  EnvelopeIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  FingerPrintIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { api } from '@/lib/api';
import styles from './UniversalLoginPage.module.css';

interface TenantBranding {
  logo?: string;
  themeColor: string;
  backgroundImage?: string;
  loginMessage?: string;
  organizationName: string;
}

interface AuthMethod {
  type: 'password' | 'sso' | 'passkey' | 'totp' | 'sms' | 'email';
  provider?: string;
  name: string;
  primary: boolean;
}

interface TenantDiscovery {
  tenant: {
    id: string;
    name: string;
    domain: string;
  };
  authMethods: AuthMethod[];
  branding: TenantBranding;
  userExists: boolean;
  mfaRequired: boolean;
  discoveryToken: string;
}

export const UniversalLoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addToast } = useToastStore();

  // Step state
  const [currentStep, setCurrentStep] = useState<'discovery' | 'auth' | 'mfa'>('discovery');
  const [isLoading, setIsLoading] = useState(false);

  // Discovery step state
  const [email, setEmail] = useState('');
  const [tenantData, setTenantData] = useState<TenantDiscovery | null>(null);

  // Auth step state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAuthMethod, setSelectedAuthMethod] = useState<AuthMethod | null>(null);

  // MFA step state
  const [mfaCode, setMfaCode] = useState('');
  const [tempSessionId, setTempSessionId] = useState('');
  const [availableMfaMethods, setAvailableMfaMethods] = useState<AuthMethod[]>([]);
  const [selectedMfaMethod, setSelectedMfaMethod] = useState<AuthMethod | null>(null);
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

  const handleSSOCallback = async (token: string) => {
    try {
      setIsLoading(true);
      const user = await api.me(token);
      login(token, user);
      
      addToast({
        type: 'success',
        title: 'Login successful',
        description: `Welcome back, ${user.name}!`,
      });
      
      navigate(redirectUrl);
    } catch (error) {
      console.error('SSO callback error:', error);
      addToast({
        type: 'error',
        title: 'Login failed',
        description: 'Invalid authentication token.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

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

      const data: TenantDiscovery = await response.json();
      setTenantData(data);
      
      // Auto-select primary auth method
      const primaryMethod = data.authMethods.find(m => m.primary) || data.authMethods[0];
      setSelectedAuthMethod(primaryMethod);
      
      setCurrentStep('auth');
    } catch (error) {
      console.error('Discovery error:', error);
      addToast({
        type: 'error',
        title: 'Discovery failed',
        description: 'Unable to find authentication settings for this email.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuthMethod || !tenantData) return;

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
      } else {
        // Authentication complete
        const user = data.user;
        login(data.token, user);
        
        addToast({
          type: 'success',
          title: 'Login successful',
          description: `Welcome back, ${user.name}!`,
        });
        
        navigate(data.redirectUrl || redirectUrl);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      addToast({
        type: 'error',
        title: 'Authentication failed',
        description: 'Invalid credentials. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFAChallenge = async () => {
    if (!selectedMfaMethod || !tempSessionId) return;

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
    } catch (error) {
      console.error('MFA challenge error:', error);
      addToast({
        type: 'error',
        title: 'MFA challenge failed',
        description: 'Unable to send verification code.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFAVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMfaMethod || !tempSessionId || !mfaCode.trim()) return;

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
      
      addToast({
        type: 'success',
        title: 'Login successful',
        description: `Welcome back, ${user.name}!`,
      });
      
      navigate(redirectUrl);
    } catch (error) {
      console.error('MFA verification error:', error);
      addToast({
        type: 'error',
        title: 'Verification failed',
        description: 'Invalid verification code. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthMethodSwitch = (method: AuthMethod) => {
    setSelectedAuthMethod(method);
    setPassword('');
  };

  const handleMfaMethodSwitch = (method: AuthMethod) => {
    setSelectedMfaMethod(method);
    setMfaCode('');
    setMfaChallengeMessage('');
  };

  const handleBack = () => {
    if (currentStep === 'mfa') {
      setCurrentStep('auth');
      setMfaCode('');
      setTempSessionId('');
    } else if (currentStep === 'auth') {
      setCurrentStep('discovery');
      setPassword('');
      setSelectedAuthMethod(null);
      setTenantData(null);
    }
  };

  const getAuthMethodIcon = (type: string) => {
    switch (type) {
      case 'password':
        return <KeyIcon className="w-5 h-5" />;
      case 'sso':
        return <ShieldCheckIcon className="w-5 h-5" />;
      case 'passkey':
        return <FingerPrintIcon className="w-5 h-5" />;
      default:
        return <KeyIcon className="w-5 h-5" />;
    }
  };

  const getMfaMethodIcon = (type: string) => {
    switch (type) {
      case 'totp':
        return <DevicePhoneMobileIcon className="w-5 h-5" />;
      case 'sms':
        return <DevicePhoneMobileIcon className="w-5 h-5" />;
      case 'email':
        return <EnvelopeIcon className="w-5 h-5" />;
      default:
        return <ShieldCheckIcon className="w-5 h-5" />;
    }
  };

  useEffect(() => {
    if (selectedMfaMethod && ['sms', 'email'].includes(selectedMfaMethod.type)) {
      handleMFAChallenge();
    }
  }, [selectedMfaMethod]);

  return (
    <div 
      className={`${styles.loginContainer} ${backgroundClass}`}
    >
      {/* Animated background elements */}
      <div className={styles.backgroundOverlay}>
        <div 
          className={`${styles.backgroundElement1} ${styles.primaryBg}`}
        />
        <div 
          className={`${styles.backgroundElement2} ${styles.primaryBg}`}
        />
      </div>

      <Card className="w-full max-w-md mx-auto shadow-2xl border-0 backdrop-blur-lg bg-white/95 dark:bg-gray-900/95">
        <CardBody className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            {tenantData?.branding?.logo ? (
              <Avatar 
                src={tenantData.branding.logo} 
                className="w-16 h-16 mx-auto mb-4"
                alt={tenantData.branding.organizationName}
              />
            ) : (
              <div 
                className={`${styles.logoPlaceholder} ${styles.primaryBg}`}
              >
                {tenantData?.branding?.organizationName?.charAt(0) || 'N'}
              </div>
            )}
            
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {currentStep === 'discovery' && 'Sign in to Nova'}
              {currentStep === 'auth' && `Welcome${tenantData?.userExists ? ' back' : ''}`}
              {currentStep === 'mfa' && 'Verify your identity'}
            </h1>
            
            {tenantData?.branding?.organizationName && (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {tenantData.branding.organizationName}
              </p>
            )}
            
            {tenantData?.branding?.loginMessage && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                {tenantData.branding.loginMessage}
              </p>
            )}
          </div>

          {/* Step 1: Email Discovery */}
          {currentStep === 'discovery' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <Input
                  type="email"
                  label="Email address"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  startContent={<EnvelopeIcon className="w-4 h-4 text-gray-400" />}
                  variant="bordered"
                  size="lg"
                  isRequired
                  className="mb-4"
                />
              </div>

              <Button
                type="submit"
                className={`w-full text-white font-medium ${styles.primaryBg}`}
                size="lg"
                isLoading={isLoading}
                isDisabled={!email.trim()}
                endContent={!isLoading && <ArrowRightIcon className="w-4 h-4" />}
              >
                {isLoading ? 'Finding your organization...' : 'Continue'}
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enter your email to discover your organization's sign-in options
                </p>
              </div>
            </form>
          )}

          {/* Step 2: Authentication */}
          {currentStep === 'auth' && tenantData && (
            <div className="space-y-6">
              {/* Back button */}
              <Button
                variant="light"
                size="sm"
                startContent={<ArrowLeftIcon className="w-4 h-4" />}
                onClick={handleBack}
                className="mb-4"
              >
                Back
              </Button>

              {/* User info */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Signing in as <span className="font-medium">{email}</span>
                </p>
              </div>

              {/* Auth method selector */}
              {tenantData.authMethods.length > 1 && (
                <div className="space-y-2 mb-6">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Choose your sign-in method:
                  </p>
                  <div className="grid gap-2">
                    {tenantData.authMethods.map((method) => (
                      <Button
                        key={`${method.type}-${method.provider || ''}`}
                        variant={selectedAuthMethod === method ? 'solid' : 'bordered'}
                        className={selectedAuthMethod === method ? styles.authMethodButtonActive : styles.authMethodButton}
                        startContent={getAuthMethodIcon(method.type)}
                        onClick={() => handleAuthMethodSwitch(method)}
                      >
                        {method.name}
                        {method.primary && <Chip size="sm" variant="light" className="ml-auto">Primary</Chip>}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Authentication form */}
              <form onSubmit={handleAuthentication} className="space-y-4">
                {selectedAuthMethod?.type === 'password' && (
                  <div>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      label="Password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      startContent={<KeyIcon className="w-4 h-4 text-gray-400" />}
                      endContent={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="focus:outline-none"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                          ) : (
                            <EyeIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      }
                      variant="bordered"
                      size="lg"
                      isRequired
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className={`w-full text-white font-medium ${styles.primaryBg}`}
                  size="lg"
                  isLoading={isLoading}
                  isDisabled={
                    (selectedAuthMethod?.type === 'password' && !password.trim()) ||
                    !selectedAuthMethod
                  }
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>

                {selectedAuthMethod?.type === 'password' && (
                  <div className="text-center">
                    <Link href="#" className={`text-sm ${styles.primaryText}`}>
                      Forgot your password?
                    </Link>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Step 3: MFA Verification */}
          {currentStep === 'mfa' && (
            <div className="space-y-6">
              {/* Back button */}
              <Button
                variant="light"
                size="sm"
                startContent={<ArrowLeftIcon className="w-4 h-4" />}
                onClick={handleBack}
                className="mb-4"
              >
                Back
              </Button>

              {/* MFA method selector */}
              {availableMfaMethods.length > 1 && (
                <div className="space-y-2 mb-6">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Choose verification method:
                  </p>
                  <div className="grid gap-2">
                    {availableMfaMethods.map((method) => (
                      <Button
                        key={method.type}
                        variant={selectedMfaMethod === method ? 'solid' : 'bordered'}
                        className={selectedMfaMethod === method ? styles.mfaMethodButtonActive : styles.mfaMethodButton}
                        startContent={getMfaMethodIcon(method.type)}
                        onClick={() => handleMfaMethodSwitch(method)}
                      >
                        {method.name}
                        {method.primary && <Chip size="sm" variant="light" className="ml-auto">Primary</Chip>}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Challenge message */}
              {mfaChallengeMessage && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {mfaChallengeMessage}
                  </p>
                </div>
              )}

              {/* MFA verification form */}
              <form onSubmit={handleMFAVerification} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    label="Verification code"
                    placeholder="Enter your verification code"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    startContent={getMfaMethodIcon(selectedMfaMethod?.type || '')}
                    variant="bordered"
                    size="lg"
                    isRequired
                    autoComplete="one-time-code"
                    maxLength={selectedMfaMethod?.type === 'totp' ? 6 : 10}
                  />
                </div>

                <Button
                  type="submit"
                  className={`w-full text-white font-medium ${styles.primaryBg}`}
                  size="lg"
                  isLoading={isLoading}
                  isDisabled={!mfaCode.trim()}
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </Button>

                {selectedMfaMethod && ['sms', 'email'].includes(selectedMfaMethod.type) && (
                  <div className="text-center">
                    <Button
                      variant="light"
                      size="sm"
                      onClick={handleMFAChallenge}
                      isLoading={isLoading}
                      className={styles.primaryText}
                    >
                      Didn't receive a code? Resend
                    </Button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Security notice */}
          <div className="mt-8 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <ShieldCheckIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Your privacy and security are protected by enterprise-grade encryption and authentication.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
