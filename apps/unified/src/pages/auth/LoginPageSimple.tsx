import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@stores/auth'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { cn } from '@utils/index'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  // Validation schema with translations
  const loginSchema = z.object({
    email: z.string().email(t('forms.email', 'Please enter a valid email address')),
    password: z.string().min(1, t('forms.required', 'This field is required')),
    rememberMe: z.boolean().default(false),
  })

  type LoginFormData = z.infer<typeof loginSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError()
      await login(data.email, data.password, data.rememberMe)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (error) {
      toast.error('Login failed. Please check your credentials.')
    }
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
            Sign in to your account
          </p>
        </div>

        {/* Login form */}
        <div className="card p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('auth.email', 'Email')}
              </label>
              <div className="mt-1">
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className={cn(
                    'input',
                    errors.email && 'input-error'
                  )}
                  placeholder={t('auth.emailPlaceholder', 'Enter your email')}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('auth.password', 'Password')}
              </label>
              <div className="relative mt-1">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={cn(
                    'input pr-10',
                    errors.password && 'input-error'
                  )}
                  placeholder={t('auth.login.passwordPlaceholder', 'Enter your password')}
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
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me and forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  {...register('rememberMe')}
                  id="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-nova-600 focus:ring-nova-500"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  {t('auth.login.rememberMe', 'Remember me')}
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/auth/forgot-password"
                  className="font-medium text-nova-600 hover:text-nova-500 dark:text-nova-400 dark:hover:text-nova-300"
                >
                  {t('auth.login.forgotPassword', 'Forgot your password?')}
                </Link>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                t('auth.login.signIn', 'Sign In')
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  Enterprise Features
                </span>
              </div>
            </div>

            {/* Enterprise login note */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                🏢 SSO, Tenant Discovery, and MFA available
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Nova Helix Universal Login System
              </p>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need access?{' '}
              <Link
                to="/auth/register"
                className="font-medium text-nova-600 hover:text-nova-500 dark:text-nova-400 dark:hover:text-nova-300"
              >
                Contact your administrator
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
