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
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@stores/auth';
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

export default function LoginPage() {
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

  const from = location.state?.from?.pathname || '/dashboard';

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

  // Show offline screen if not connected
  if (!connectionStatus.isOnline || !connectionStatus.isAPIConnected) {
    return <OfflineScreen onRetry={handleConnectionRetry} isRetrying={isRetrying} />;
  }

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
    } catch (_error) {
      toast.error(error instanceof Error ? error.message : t('auth:login.discoveryFailed'));
    } finally {
      setIsDiscovering(false);
    }
  };

  // Handle authentication
  const handleLoginSubmit = async (data: LoginFormData) => {
    if (!loginStep.tenantData) {
      toast.error(t('auth:login.tenantDiscoveryRequired'));
      return;
    }

    try {
      clearError();

      const response = await helixAuthService.authenticate({
        discoveryToken: loginStep.tenantData.discoveryToken,
        email: data.email,
        password: data.password,
        authMethod: 'password',
        rememberMe: data.rememberMe,
      });

      if (response.requiresMFA && response.tempSessionId) {
        // Move to MFA step
        setLoginStep({
          step: 'mfa',
          tenantData: loginStep.tenantData,
          mfaToken: response.tempSessionId,
        });
      } else if (response.user) {
        // Complete login via auth store
        await loginWithHelix({
          discoveryToken: loginStep.tenantData.discoveryToken,
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
        });

        toast.success(t('auth:login.welcomeBack'));
        navigate(from, { replace: true });
      }
    } catch (_error) {
      toast.error(t('auth:login.loginFailed'));
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
        mfaMethod: 'totp', // Default to TOTP for now
        code: mfaCode.trim(),
        rememberDevice: false,
      });

      if (response.user) {
        // Complete login via auth store
        const email = loginForm.getValues('email');
        const rememberMe = loginForm.getValues('rememberMe');

        await loginWithHelix({
          discoveryToken: loginStep.tenantData!.discoveryToken,
          email,
          password: '', // Password already verified
          rememberMe,
        });

        toast.success(t('auth:login.welcomeBack'));
        navigate(from, { replace: true });
      }
    } catch (_error) {
      toast.error(t('auth:mfa.invalidCode'));
      setMfaCode('');
    }
  };

  // Handle SSO login
  const handleSSOLogin = async (provider: string) => {
    if (!loginStep.tenantData) return;

    try {
      const ssoData = await helixAuthService.initiateSSOLogin(provider);
      window.location.href = ssoData.redirectUrl;
    } catch (_error) {
      toast.error(t('auth:login.ssoInitiateFailed'));
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and header */}
        <div className="text-center">
          <div className="bg-gradient-nova shadow-apple mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
            <span className="text-2xl font-bold text-white">N</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {t('auth:login.welcome')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {loginStep.step === 'email' && t('auth:login.enterEmailToContinue')}
            {loginStep.step === 'auth' &&
              t('auth:login.signInTo', { organization: loginStep.tenantData?.tenant.name })}
            {loginStep.step === 'mfa' && t('auth:login.enterVerificationCode')}
          </p>
        </div>

        {/* Login form */}
        <div className="card p-8">
          {/* Step 1: Email Discovery */}
          {loginStep.step === 'email' && (
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('auth:login.workEmail')}
                </label>
                <div className="mt-1">
                  <input
                    {...emailForm.register('email')}
                    type="email"
                    autoComplete="email"
                    className={cn('input', emailForm.formState.errors.email && 'input-error')}
                    placeholder={t('auth:login.emailPlaceholder')}
                  />
                  {emailForm.formState.errors.email && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <button type="submit" disabled={isDiscovering} className="btn btn-primary w-full">
                {isDiscovering ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">{t('auth:login.discovering')}</span>
                  </>
                ) : (
                  <>
                    <BuildingOfficeIcon className="mr-2 h-5 w-5" />
                    {t('common:continue')}
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('auth:login.findOrganizationHelp')}
                </p>
              </div>
            </form>
          )}

          {/* Step 2: Authentication */}
          {loginStep.step === 'auth' && loginStep.tenantData && (
            <div className="space-y-6">
              {/* Tenant info */}
              <div className="flex items-center rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <BuildingOfficeIcon className="mr-3 h-8 w-8 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {loginStep.tenantData.tenant.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {loginStep.tenantData.tenant.domain}
                  </p>
                </div>
                <button
                  onClick={resetToEmailStep}
                  className="text-nova-600 hover:text-nova-500 ml-auto text-sm"
                >
                  {t('common:change')}
                </button>
              </div>

              {/* SSO Options */}
              {loginStep.tenantData.authMethods.filter((method) => method.type === 'sso').length >
                0 && (
                <div className="space-y-3">
                  {loginStep.tenantData.authMethods
                    .filter((method) => method.type === 'sso')
                    .map((method) => (
                      <button
                        key={method.provider}
                        onClick={() => handleSSOLogin(method.provider!)}
                        className="btn btn-outline flex w-full items-center justify-center"
                      >
                        <ShieldCheckIcon className="mr-2 h-5 w-5" />
                        {t('auth:login.signInWith', { provider: method.name })}
                      </button>
                    ))}

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        {t('auth:login.orContinueWithPassword')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Password Authentication */}
              {loginStep.tenantData.authMethods.some((method) => method.type === 'password') && (
                <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-6">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {t('auth:login.password')}
                    </label>
                    <div className="relative mt-1">
                      <input
                        {...loginForm.register('password')}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        className={cn(
                          'input pr-10',
                          loginForm.formState.errors.password && 'input-error',
                        )}
                        placeholder={t('auth:login.passwordPlaceholder')}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        {...loginForm.register('rememberMe')}
                        id="rememberMe"
                        type="checkbox"
                        className="text-nova-600 focus:ring-nova-500 h-4 w-4 rounded border-gray-300"
                      />
                      <label
                        htmlFor="rememberMe"
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        {t('auth:login.rememberMe')}
                      </label>
                    </div>

                    <div className="text-sm">
                      <Link
                        to="/auth/forgot-password"
                        className="text-nova-600 hover:text-nova-500 dark:text-nova-400 dark:hover:text-nova-300 font-medium"
                      >
                        {t('auth:login.forgotPassword')}
                      </Link>
                    </div>
                  </div>

                  <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <KeyIcon className="mr-2 h-5 w-5" />
                        {t('auth:login.signIn')}
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* MFA Required Notice */}
              {loginStep.tenantData.mfaRequired && (
                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                  <p className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                    <ShieldCheckIcon className="mr-2 h-4 w-4" />
                    {t('auth:login.mfaRequired')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: MFA Verification */}
          {loginStep.step === 'mfa' && (
            <form onSubmit={handleMfaSubmit} className="space-y-6">
              <div className="text-center">
                <ShieldCheckIcon className="text-nova-600 mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                  {t('auth:mfa.verificationRequired')}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {t('auth:mfa.enterCode')}
                </p>
              </div>

              <div>
                <label
                  htmlFor="mfaCode"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('auth:mfa.verificationCode')}
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    className="input text-center text-lg tracking-widest"
                    placeholder={t('auth:mfa.codePlaceholder')}
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button type="button" onClick={resetToEmailStep} className="btn btn-outline flex-1">
                  {t('auth:mfa.startOver')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !mfaCode.trim()}
                  className="btn btn-primary flex-1"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : t('auth:mfa.verify')}
                </button>
              </div>
            </form>
          )}

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {loginStep.step === 'email' ? (
              <>
                {t('auth:login.poweredBy')}{' '}
                <span className="text-nova-600 dark:text-nova-400 font-medium">
                  {t('auth:login.helixBrand')}
                </span>
              </>
            ) : (
              <>
                {t('auth:login.needHelp')}{' '}
                <a
                  href="mailto:support@nova-universe.com"
                  className="text-nova-600 hover:text-nova-500 dark:text-nova-400 dark:hover:text-nova-300 font-medium"
                >
                  {t('auth:login.contactSupport')}
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
