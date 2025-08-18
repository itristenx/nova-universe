import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EyeIcon, EyeSlashIcon, BuildingOfficeIcon, KeyIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '@stores/auth'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { cn } from '@utils/index'
import { helixAuthService } from '@services/helixAuth'
import type { TenantDiscoveryResponse } from '@services/helixAuth'
import toast from 'react-hot-toast'

// Validation schemas
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
})

type EmailFormData = z.infer<typeof emailSchema>
type LoginFormData = z.infer<typeof loginSchema>

interface LoginStep {
  step: 'email' | 'auth' | 'mfa'
  tenantData?: TenantDiscoveryResponse
  mfaToken?: string
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loginStep, setLoginStep] = useState<LoginStep>({ step: 'email' })
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [mfaCode, setMfaCode] = useState('')
  
  const { loginWithHelix, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  // Email discovery form
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  })

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  // Handle tenant discovery
  const handleEmailSubmit = async (data: EmailFormData) => {
    setIsDiscovering(true)
    clearError()
    
    try {
      const tenantData = await helixAuthService.discoverTenant(data.email)
      
      // Set the email in the login form
      loginForm.setValue('email', data.email)
      
      // Move to auth step with tenant data
      setLoginStep({
        step: 'auth',
        tenantData,
      })
      
      toast.success(`Found organization: ${tenantData.tenant.name}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to discover organization')
    } finally {
      setIsDiscovering(false)
    }
  }

  // Handle authentication
  const handleLoginSubmit = async (data: LoginFormData) => {
    if (!loginStep.tenantData) {
      toast.error('Tenant discovery required')
      return
    }

    try {
      clearError()
      
      const response = await helixAuthService.authenticate({
        discoveryToken: loginStep.tenantData.discoveryToken,
        email: data.email,
        password: data.password,
        authMethod: 'password',
        rememberMe: data.rememberMe,
      })

      if (response.requiresMfa && response.mfaToken) {
        // Move to MFA step
        setLoginStep({
          step: 'mfa',
          tenantData: loginStep.tenantData,
          mfaToken: response.mfaToken,
        })
      } else if (response.user) {
        // Complete login via auth store
        await loginWithHelix({
          discoveryToken: loginStep.tenantData.discoveryToken,
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
        })
        
        toast.success('Welcome back!')
        navigate(from, { replace: true })
      }
    } catch (error) {
      toast.error('Login failed. Please check your credentials.')
    }
  }

  // Handle MFA verification
  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!loginStep.mfaToken || !mfaCode.trim()) {
      toast.error('Please enter the verification code')
      return
    }

    try {
      clearError()
      
      const response = await helixAuthService.verifyMfa({
        mfaToken: loginStep.mfaToken,
        code: mfaCode.trim(),
        rememberDevice: false,
      })

      if (response.user) {
        // Complete login via auth store
        const email = loginForm.getValues('email')
        const rememberMe = loginForm.getValues('rememberMe')
        
        await loginWithHelix({
          discoveryToken: loginStep.tenantData!.discoveryToken,
          email,
          password: '', // Password already verified
          rememberMe,
        })
        
        toast.success('Welcome back!')
        navigate(from, { replace: true })
      }
    } catch (error) {
      toast.error('Invalid verification code. Please try again.')
      setMfaCode('')
    }
  }

  // Handle SSO login
  const handleSSOLogin = async (provider: string) => {
    if (!loginStep.tenantData) return
    
    try {
      const ssoData = await helixAuthService.initiateSSOLogin(provider)
      window.location.href = ssoData.redirectUrl
    } catch (error) {
      toast.error('Failed to initiate SSO login')
    }
  }

  // Reset to email step
  const resetToEmailStep = () => {
    setLoginStep({ step: 'email' })
    emailForm.reset()
    loginForm.reset()
    setMfaCode('')
    clearError()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and header */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-nova shadow-apple">
            <span className="text-2xl font-bold text-white">N</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Welcome to Nova Universe
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {loginStep.step === 'email' && 'Enter your email to continue'}
            {loginStep.step === 'auth' && `Sign in to ${loginStep.tenantData?.tenant.name}`}
            {loginStep.step === 'mfa' && 'Enter verification code'}
          </p>
        </div>

        {/* Login form */}
        <div className="card p-8">
          {/* Step 1: Email Discovery */}
          {loginStep.step === 'email' && (
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Work Email
                </label>
                <div className="mt-1">
                  <input
                    {...emailForm.register('email')}
                    type="email"
                    autoComplete="email"
                    className={cn(
                      'input',
                      emailForm.formState.errors.email && 'input-error'
                    )}
                    placeholder="Enter your work email address"
                  />
                  {emailForm.formState.errors.email && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isDiscovering}
                className="btn btn-primary w-full"
              >
                {isDiscovering ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Discovering organization...</span>
                  </>
                ) : (
                  <>
                    <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                    Continue
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We'll find your organization and available sign-in methods
                </p>
              </div>
            </form>
          )}

          {/* Step 2: Authentication */}
          {loginStep.step === 'auth' && loginStep.tenantData && (
            <div className="space-y-6">
              {/* Tenant info */}
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <BuildingOfficeIcon className="h-8 w-8 text-gray-400 mr-3" />
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
                  className="ml-auto text-sm text-nova-600 hover:text-nova-500"
                >
                  Change
                </button>
              </div>

              {/* SSO Options */}
              {loginStep.tenantData.authMethods.filter(method => method.type === 'sso').length > 0 && (
                <div className="space-y-3">
                  {loginStep.tenantData.authMethods
                    .filter(method => method.type === 'sso')
                    .map((method) => (
                      <button
                        key={method.provider}
                        onClick={() => handleSSOLogin(method.provider!)}
                        className="btn btn-outline w-full flex items-center justify-center"
                      >
                        <ShieldCheckIcon className="h-5 w-5 mr-2" />
                        Sign in with {method.name}
                      </button>
                    ))}
                  
                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        or continue with password
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Password Authentication */}
              {loginStep.tenantData.authMethods.some(method => method.type === 'password') && (
                <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-6">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <div className="relative mt-1">
                      <input
                        {...loginForm.register('password')}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        className={cn(
                          'input pr-10',
                          loginForm.formState.errors.password && 'input-error'
                        )}
                        placeholder="Enter your password"
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
                        className="h-4 w-4 rounded border-gray-300 text-nova-600 focus:ring-nova-500"
                      />
                      <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Remember me
                      </label>
                    </div>

                    <div className="text-sm">
                      <Link
                        to="/auth/forgot-password"
                        className="font-medium text-nova-600 hover:text-nova-500 dark:text-nova-400 dark:hover:text-nova-300"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary w-full"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <KeyIcon className="h-5 w-5 mr-2" />
                        Sign in
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* MFA Required Notice */}
              {loginStep.tenantData.mfaRequired && (
                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                  <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
                    <ShieldCheckIcon className="h-4 w-4 mr-2" />
                    Multi-factor authentication is required for this organization
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: MFA Verification */}
          {loginStep.step === 'mfa' && (
            <form onSubmit={handleMfaSubmit} className="space-y-6">
              <div className="text-center">
                <ShieldCheckIcon className="mx-auto h-12 w-12 text-nova-600" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                  Verification Required
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Enter the verification code from your authenticator app
                </p>
              </div>

              <div>
                <label htmlFor="mfaCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    className="input text-center text-lg tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={resetToEmailStep}
                  className="btn btn-outline flex-1"
                >
                  Start over
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !mfaCode.trim()}
                  className="btn btn-primary flex-1"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {loginStep.step === 'email' ? (
              <>
                Powered by{' '}
                <span className="font-medium text-nova-600 dark:text-nova-400">
                  Nova Helix Universal Login
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
  )
}
