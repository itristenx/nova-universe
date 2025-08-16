import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-apple dark:bg-gray-800">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-900">
                <AlertTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              
              <h1 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                Something went wrong
              </h1>
              
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={this.handleRetry}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <RefreshCwIcon className="h-4 w-4" />
                  Try Again
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-secondary"
                >
                  Refresh Page
                </button>
              </div>

              {import.meta.env.DEV && this.state.error && (
                <details className="mt-6 w-full">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 rounded-lg bg-gray-100 p-3 text-left dark:bg-gray-700">
                    <pre className="whitespace-pre-wrap text-xs text-gray-800 dark:text-gray-200">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}