import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  EnvelopeIcon 
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

// Simple loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nova-600"></div>
  </div>
)

interface VerificationResult {
  success: boolean
  message: string
  email?: string
}

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isResending, setIsResending] = useState(false)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationResult({
          success: false,
          message: 'Invalid verification link. Please check your email for the correct verification link.'
        })
        setIsLoading(false)
        return
      }

      try {
        // Simulate API call to verify email
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Simulate verification result
        const isValidToken = token.length > 10 // Simple mock validation
        
        if (isValidToken) {
          const result: VerificationResult = {
            success: true,
            message: 'Your email has been successfully verified! You can now access all features of your account.'
          }
          if (email) {
            result.email = email
          }
          setVerificationResult(result)
        } else {
          setVerificationResult({
            success: false,
            message: 'This verification link has expired or is invalid. Please request a new verification email.'
          })
        }
      } catch (error) {
        setVerificationResult({
          success: false,
          message: 'An error occurred while verifying your email. Please try again later.'
        })
      } finally {
        setIsLoading(false)
      }
    }

    verifyEmail()
  }, [token, email])

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Email address not found. Please try signing up again.')
      return
    }

    setIsResending(true)
    try {
      // Simulate API call to resend verification email
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Verification email sent! Please check your inbox.')
    } catch (error) {
      toast.error('Failed to send verification email. Please try again later.')
    } finally {
      setIsResending(false)
    }
  }

  const handleContinueToLogin = () => {
    navigate('/auth/login')
  }

  const handleGoToDashboard = () => {
    navigate('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center">
            <LoadingSpinner />
            <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              Verifying Your Email
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please wait while we verify your email address...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center">
          {verificationResult?.success ? (
            <>
              {/* Success State */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              
              <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                Email Verified Successfully!
              </h1>
              
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {verificationResult.message}
              </p>

              {verificationResult.email && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {verificationResult.email}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleGoToDashboard}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-nova-600 hover:bg-nova-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nova-500 transition-colors"
                >
                  Go to Dashboard
                </button>
                
                <button
                  onClick={handleContinueToLogin}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nova-500 transition-colors"
                >
                  Continue to Login
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Error State */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              
              <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                Email Verification Failed
              </h1>
              
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {verificationResult?.message}
              </p>

              <div className="mt-6 space-y-3">
                {email && (
                  <button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-nova-600 hover:bg-nova-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nova-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? (
                      <>
                        <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                        Resend Verification Email
                      </>
                    )}
                  </button>
                )}
                
                <button
                  onClick={handleContinueToLogin}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nova-500 transition-colors"
                >
                  Back to Login
                </button>
              </div>

              {!email && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    If you continue to have issues, please contact support or try signing up again.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Additional Help */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Need help? {' '}
              <button
                onClick={() => navigate('/contact')}
                className="font-medium text-nova-600 hover:text-nova-500 dark:text-nova-400 dark:hover:text-nova-300"
              >
                Contact Support
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
