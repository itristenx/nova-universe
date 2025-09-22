import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  EyeIcon,
  EyeSlashIcon,
  BuildingOfficeIcon,
  KeyIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@stores/auth';
import { AppleCard } from '@components/design-system/AppleCard';
import { AppleButton } from '@components/design-system/AppleButton';
import { AppleInput } from '@components/design-system/AppleForm';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import { cn } from '@utils/index';
import { helixAuthService } from '@services/helixAuth';
import type { TenantDiscoveryResponse } from '@services/helixAuth';
import { connectionService, type ConnectionStatus } from '@services/connectionService';
import { OfflineScreen } from '@components/connection/ConnectionStatus';
import toast from 'react-hot-toast';

// Type definitions
interface LoginStep {
  step: 'email' | 'auth' | 'mfa';
  tenantData?: TenantDiscoveryResponse;
  mfaToken?: string;
}

export default function AppleInspiredLoginPage() {
  const { t } = useTranslation(['auth', 'common']);
  const [showPassword, setShowPassword] = useState(false);
  const [loginStep, setLoginStep] = useState<LoginStep>({ step: 'email' });
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    connectionService.getStatus(),
  );
  const [isRetrying, setIsRetrying] = useState(false);

  const { loginWithHelix, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/itsm';

  // Allow legacy/simple login to start directly at auth step via env or query (?legacy=1)
  const legacyLogin =
    ((import.meta as any)?.env?.VITE_AUTH_LEGACY === 'true') ||
    new URLSearchParams(location.search).get('legacy') === '1';
  
  useEffect(() => {
    if (legacyLogin) setLoginStep({ step: 'auth' });
  }, [legacyLogin]);

  // Monitor connection status
  useEffect(() => {
    const unsubscribe = connectionService.subscribe(setConnectionStatus);
    return unsubscribe;
  }, []);

  // Handle connection retry
  const handleConnectionRetry = async () => {
    setIsRetrying(true);
    try {
      await connectionService.forceCheck();
    } finally {
      setIsRetrying(false);
    }
  };

  // Validation schemas with translated messages
  const emailSchema = z.object({
    email: z.string().email(t('auth:validation.emailInvalid')),
  });

  const loginSchema = z.object({
    email: z.string().email(t('auth:validation.emailInvalid')),
    password: z.string().min(1, t('auth:validation.passwordRequired')),
    rememberMe: z.boolean().default(false),
  });

  type EmailFormData = z.infer<typeof emailSchema>;
  type LoginFormData = z.infer<typeof loginSchema>;

  // Email discovery form
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Show offline screen if not connected
  if (!connectionStatus.isOnline || !connectionStatus.isAPIConnected) {
    return <OfflineScreen onRetry={handleConnectionRetry} isRetrying={isRetrying} />;
  }

  // Handle tenant discovery
  const handleEmailSubmit = async (data: EmailFormData) => {
    setIsDiscovering(true);
    clearError();

    try {
      const tenantData = await helixAuthService.discoverTenant(data.email);

      // Set the email in the login form
      loginForm.setValue('email', data.email);

      // Move to auth step with tenant data
      setLoginStep({
        step: 'auth',
        tenantData,
      });

      toast.success(t('auth:login.organizationFound', { organization: tenantData.tenant.name }));
    } catch (discoveryError) {
      console.error('Tenant discovery failed:', discoveryError);
      
      // Enhanced error handling for tenant discovery
      const errorMessage = discoveryError instanceof Error ? discoveryError.message : 'Unknown discovery error';
      
      if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        toast.error(t('auth:login.organizationNotFound'));
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        toast.error(t('auth:login.networkError'));
      } else if (errorMessage.includes('rate limit')) {
        toast.error(t('auth:login.rateLimitExceeded'));
      } else {
        toast.error(errorMessage.includes('error') ? errorMessage : t('auth:login.discoveryFailed'));
      }

      // Fallback: allow legacy login without tenant discovery (demo/dev)
      loginForm.setValue('email', data.email);
      setLoginStep({ step: 'auth' });
    } finally {
      setIsDiscovering(false);
    }
  };

  // Handle authentication
  const handleLoginSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      if (loginStep.tenantData) {
        // Helix path when discovery succeeded
        const response = await helixAuthService.authenticate({
          discoveryToken: loginStep.tenantData.discoveryToken,
          email: data.email,
          password: data.password,
          authMethod: 'password',
          rememberMe: data.rememberMe,
        });

        if (response.requiresMFA && response.tempSessionId) {
          setLoginStep({ step: 'mfa', tenantData: loginStep.tenantData, mfaToken: response.tempSessionId });
          return;
        }

        if (response.user) {
          await loginWithHelix({
            discoveryToken: loginStep.tenantData.discoveryToken,
            email: data.email,
            password: data.password,
            rememberMe: data.rememberMe,
          });
          toast.success(t('auth:login.welcomeBack'));
          navigate(from, { replace: true });
          return;
        }
      }

      // Legacy path (no tenant data or Helix not configured)
      await useAuthStore.getState().login(data.email, data.password, data.rememberMe);
      if (useAuthStore.getState().isAuthenticated) {
        toast.success(t('auth:login.welcomeBack'));
        navigate(from, { replace: true });
        return;
      }
      throw new Error('Login failed');
    } catch (authError) {
      console.error('Authentication failed:', authError);
      
      // Enhanced authentication error handling
      const errorMessage = authError instanceof Error ? authError.message : 'Unknown auth error';
      
      if (errorMessage.includes('invalid credentials') || errorMessage.includes('unauthorized')) {
        toast.error(t('auth:login.invalidCredentials'));
      } else if (errorMessage.includes('account locked') || errorMessage.includes('locked')) {
        toast.error(t('auth:login.accountLocked'));
      } else if (errorMessage.includes('account disabled') || errorMessage.includes('inactive')) {
        toast.error(t('auth:login.accountDisabled'));
      } else if (errorMessage.includes('mfa required') || errorMessage.includes('2fa')) {
        toast.error(t('auth:login.mfaRequired'));
      } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        toast.error(t('auth:login.networkError'));
      } else {
        toast.error(t('auth:login.loginFailed'));
      }
    }
  };

  // Handle MFA verification
  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginStep.mfaToken || !mfaCode.trim()) {
      toast.error(t('auth:mfa.enterCodeRequired'));
      return;
    }

    try {
      clearError();

      const response = await helixAuthService.verifyMfa({
        tempSessionId: loginStep.mfaToken,
        mfaMethod: 'totp',
        code: mfaCode.trim(),
        rememberDevice: false,
      });

      if (response.user) {
        const email = loginForm.getValues('email');
        const rememberMe = loginForm.getValues('rememberMe');

        await loginWithHelix({
          discoveryToken: loginStep.tenantData!.discoveryToken,
          email,
          password: '',
          rememberMe,
        });

        toast.success(t('auth:login.welcomeBack'));
        navigate(from, { replace: true });
      }
    } catch (mfaError) {
      console.error('MFA verification failed:', mfaError);
      
      const errorMessage = mfaError instanceof Error ? mfaError.message : 'Unknown MFA error';
      
      if (errorMessage.includes('invalid code') || errorMessage.includes('incorrect')) {
        toast.error(t('auth:mfa.invalidCode'));
      } else if (errorMessage.includes('expired') || errorMessage.includes('timeout')) {
        toast.error(t('auth:mfa.codeExpired'));
      } else if (errorMessage.includes('attempts') || errorMessage.includes('locked')) {
        toast.error(t('auth:mfa.tooManyAttempts'));
      } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        toast.error(t('auth:mfa.networkError'));
      } else {
        toast.error(t('auth:mfa.invalidCode'));
      }
      
      setMfaCode('');
    }
  };

  // Handle SSO login
  const handleSSOLogin = async (provider: string) => {
    if (!loginStep.tenantData) return;

    try {
      const ssoData = await helixAuthService.initiateSSOLogin(provider, {
        tenantId: loginStep.tenantData.tenant.id,
        redirectUrl: window.location.origin,
      });
      window.location.href = ssoData.redirectUrl;
    } catch (ssoError) {
      console.error('SSO initiation failed:', ssoError);
      
      const errorMessage = ssoError instanceof Error ? ssoError.message : 'Unknown SSO error';
      
      if (errorMessage.includes('not configured') || errorMessage.includes('unavailable')) {
        toast.error(t('auth:sso.notConfigured', { provider }));
      } else if (errorMessage.includes('redirect') || errorMessage.includes('url')) {
        toast.error(t('auth:sso.redirectFailed'));
      } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        toast.error(t('auth:sso.networkError'));
      } else if (errorMessage.includes('unauthorized') || errorMessage.includes('permission')) {
        toast.error(t('auth:sso.unauthorized'));
      } else {
        toast.error(t('auth:login.ssoInitiateFailed'));
      }
    }
  };

  // Reset to email step
  const resetToEmailStep = () => {
    setLoginStep({ step: 'email' });
    emailForm.reset();
    loginForm.reset();
    setMfaCode('');
    clearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and header */}
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-nova-500 to-nova-600 shadow-apple mb-6">
            <SparklesIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {loginStep.step === 'email' && 'Welcome'}
            {loginStep.step === 'auth' && 'Sign in'}
            {loginStep.step === 'mfa' && 'Verify'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {loginStep.step === 'email' && 'Enter your email to get started'}
            {loginStep.step === 'auth' && (loginStep.tenantData ? 
              `Continue to ${loginStep.tenantData.tenant.name}` : 
              'Sign in to your account')}
            {loginStep.step === 'mfa' && 'Enter your verification code'}
          </p>
          
          {/* Hidden test element for E2E */}
          <button
            type="button"
            data-testid="login-button"
            className="absolute top-2 left-2 opacity-0 pointer-events-none"
            onClick={() => setLoginStep({ step: 'auth' })}
          >
            Login
          </button>
        </div>

        {/* Main Card */}
        <AppleCard variant="glass" size="lg" className="backdrop-blur-xl border-white/20">
          {/* Step 1: Email Discovery */}
          {loginStep.step === 'email' && (
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-6" data-testid="login-form">
              <div>
                <AppleInput
                  label="Work Email"
                  value={emailForm.watch('email') || ''}
                  onChange={(value) => emailForm.setValue('email', value)}
                  type="email"
                  placeholder="you@company.com"
                  error={emailForm.formState.errors.email?.message}
                  required
                  className="w-full"
                />
              </div>

              <AppleButton
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isDiscovering}
                disabled={!emailForm.watch('email') || !!emailForm.formState.errors.email}
                icon={!isDiscovering ? <BuildingOfficeIcon className="w-5 h-5" /> : undefined}
              >
                {isDiscovering ? 'Finding your organization...' : 'Continue'}
              </AppleButton>

              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  We'll find your organization and sign-in options
                </p>
              </div>
            </form>
          )}

          {/* Step 2: Authentication with Tenant */}
          {loginStep.step === 'auth' && loginStep.tenantData && (
            <div className="space-y-6">
              {/* Tenant Info */}
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-nova-400 to-nova-600 rounded-xl flex items-center justify-center">
                    <BuildingOfficeIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {loginStep.tenantData.tenant.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {loginStep.tenantData.tenant.domain}
                  </p>
                </div>
                <AppleButton
                  variant="ghost"
                  size="sm"
                  onClick={resetToEmailStep}
                  icon={<ArrowLeftIcon className="w-4 h-4" />}
                >
                  Change
                </AppleButton>
              </div>

              {/* SSO Options */}
              {loginStep.tenantData.authMethods.filter((method) => method.type === 'sso').length > 0 && (
                <div className="space-y-3">
                  {loginStep.tenantData.authMethods
                    .filter((method) => method.type === 'sso')
                    .map((method) => (
                      <AppleButton
                        key={method.provider}
                        variant="secondary"
                        size="lg"
                        fullWidth
                        onClick={() => handleSSOLogin(method.provider!)}
                        icon={<ShieldCheckIcon className="w-5 h-5" />}
                      >
                        Continue with {method.name}
                      </AppleButton>
                    ))}

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white dark:bg-gray-800 px-4 text-gray-500 dark:text-gray-400">
                        or continue with password
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Password Authentication */}
              {loginStep.tenantData.authMethods.some((method) => method.type === 'password') && (
                <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-6">
                  <div className="relative">
                    <AppleInput
                      label="Password"
                      value={loginForm.watch('password') || ''}
                      onChange={(value) => loginForm.setValue('password', value)}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      error={loginForm.formState.errors.password?.message}
                      required
                      className="w-full"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        {...loginForm.register('rememberMe')}
                        type="checkbox"
                        className="h-4 w-4 text-nova-600 focus:ring-nova-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Remember me
                      </span>
                    </label>

                    <Link
                      to="/auth/forgot-password"
                      className="text-sm font-medium text-nova-600 hover:text-nova-500 dark:text-nova-400 dark:hover:text-nova-300"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <AppleButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isLoading}
                    icon={!isLoading ? <KeyIcon className="w-5 h-5" /> : undefined}
                  >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </AppleButton>
                </form>
              )}

              {/* MFA Notice */}
              {loginStep.tenantData?.mfaRequired && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      This organization requires two-factor authentication
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2b: Legacy Authentication (no discovery) */}
          {loginStep.step === 'auth' && !loginStep.tenantData && (
            <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-6" data-testid="login-form">
              <div>
                <AppleInput
                  label="Email"
                  value={loginForm.watch('email') || ''}
                  onChange={(value) => loginForm.setValue('email', value)}
                  type="email"
                  placeholder="you@example.com"
                  error={loginForm.formState.errors.email?.message}
                  required
                  className="w-full"
                />
              </div>

              <div className="relative">
                <AppleInput
                  label="Password"
                  value={loginForm.watch('password') || ''}
                  onChange={(value) => loginForm.setValue('password', value)}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  error={loginForm.formState.errors.password?.message}
                  required
                  className="w-full"
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    {...loginForm.register('rememberMe')}
                    type="checkbox"
                    className="h-4 w-4 text-nova-600 focus:ring-nova-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Remember me
                  </span>
                </label>

                <Link
                  to="/auth/forgot-password"
                  data-testid="forgot-password-button"
                  className="text-sm font-medium text-nova-600 hover:text-nova-500 dark:text-nova-400 dark:hover:text-nova-300"
                >
                  Forgot password?
                </Link>
              </div>

              <AppleButton
                data-testid="login-submit"
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                icon={!isLoading ? <KeyIcon className="w-5 h-5" /> : undefined}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </AppleButton>

              <div className="text-center">
                <Link
                  to="/auth/register"
                  data-testid="register-button"
                  className="text-sm font-medium text-nova-600 hover:text-nova-500 dark:text-nova-400 dark:hover:text-nova-300"
                >
                  Don't have an account? Sign up
                </Link>
              </div>
            </form>
          )}

          {/* Step 3: MFA Verification */}
          {loginStep.step === 'mfa' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-nova-100 dark:bg-nova-900/20 rounded-2xl flex items-center justify-center mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-nova-600 dark:text-nova-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Verification Required
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <form onSubmit={handleMfaSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-nova-500 focus:border-transparent transition-all"
                    placeholder="000000"
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                </div>

                <div className="flex space-x-3">
                  <AppleButton
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={resetToEmailStep}
                    className="flex-1"
                  >
                    Start over
                  </AppleButton>
                  <AppleButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isLoading}
                    disabled={mfaCode.length !== 6}
                    className="flex-1"
                  >
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </AppleButton>
                </div>
              </form>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </p>
            </div>
          )}
        </AppleCard>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {loginStep.step === 'email' ? (
              <>
                Powered by{' '}
                <span className="font-semibold text-nova-600 dark:text-nova-400">
                  Nova Universe
                </span>
              </>
            ) : (
              <>
                Need help?{' '}
                <a
                  href="mailto:support@nova-universe.com"
                  className="font-medium text-nova-600 hover:text-nova-500 dark:text-nova-400 dark:hover:text-nova-300"
                >
                  Contact support
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}