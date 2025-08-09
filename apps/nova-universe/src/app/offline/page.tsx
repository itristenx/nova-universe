'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NovaLogo } from '@/components/ui/nova-logo'
import { Badge } from '@/components/ui/badge'
import {
  WifiIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CloudIcon,
  SignalIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [retryAttempts, setRetryAttempts] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine)
    setLastSyncTime(new Date())

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      setRetryAttempts(0)
      setLastSyncTime(new Date())
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    setRetryAttempts(prev => prev + 1)
    
    // Check if we're back online
    if (navigator.onLine) {
      window.location.reload()
    }
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  if (isOnline) {
    // Redirect to home if online
    window.location.href = '/'
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <NovaLogo className="w-16 h-16 animate-pulse" />
            <div>
              <h1 className="text-3xl font-bold nova-text-gradient">Nova Universe</h1>
              <Badge variant="outline" className="mt-1">Offline Mode</Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="glass-card border-2">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <WifiIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">You're Offline</CardTitle>
            <CardDescription className="text-lg">
              Your internet connection seems to be unavailable
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Status */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Connection Status</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm text-red-600 font-medium">Disconnected</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <SignalIcon className="w-4 h-4 text-muted-foreground" />
                  <span>Network: Unavailable</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CloudIcon className="w-4 h-4 text-muted-foreground" />
                  <span>Service Worker: Active</span>
                </div>
                {lastSyncTime && (
                  <div className="flex items-center space-x-2 md:col-span-2">
                    <ArrowPathIcon className="w-4 h-4 text-muted-foreground" />
                    <span>Last sync: {lastSyncTime.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* What you can do */}
            <div>
              <h3 className="font-semibold mb-3">What you can do while offline:</h3>
              <div className="space-y-2">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <DevicePhoneMobileIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">Browse Cached Content</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">View previously loaded pages and tickets</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">Submit Emergency Tickets</p>
                    <p className="text-sm text-green-700 dark:text-green-300">Your submissions will sync when connection returns</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <WifiIcon className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-900 dark:text-purple-100">Read Knowledge Base</p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Access cached help articles and guides</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <div>
              <h3 className="font-semibold mb-3">Troubleshooting:</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Check your Wi-Fi or cellular connection</p>
                <p>• Try moving to an area with better signal</p>
                <p>• Restart your router or modem</p>
                <p>• Contact your network administrator if the problem persists</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={handleRetry} 
                className="flex-1"
                disabled={retryAttempts >= 5}
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                {retryAttempts >= 5 ? 'Try Again Later' : `Retry Connection ${retryAttempts > 0 ? `(${retryAttempts})` : ''}`}
              </Button>
              <Button variant="outline" onClick={handleGoHome} className="flex-1">
                Go to Home
              </Button>
            </div>

            {retryAttempts >= 3 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Extended Connection Issues
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      If you continue to experience connectivity issues, please contact IT support or try again later.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          <p>Nova Universe will automatically reconnect when your internet connection is restored</p>
        </div>
      </div>
    </div>
  )
}