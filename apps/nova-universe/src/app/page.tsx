'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-provider'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { NovaLogo } from '@/components/ui/nova-logo'

export default function HomePage() {
  const { isAuthenticated, isLoading, getCurrentModule, getAvailableModules } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const availableModules = getAvailableModules()
    
    // If user has no module access
    if (availableModules.length === 0) {
      router.push('/access-denied')
      return
    }
    
    // If user has multiple modules, show selection page
    if (availableModules.length > 1) {
      router.push('/select-module')
      return
    }
    
    // If user has only one module, redirect directly to it
    if (availableModules.length === 1) {
      router.push(availableModules[0].href)
      return
    }
  }, [isAuthenticated, isLoading, getAvailableModules, router])

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center space-y-6">
          <NovaLogo className="w-24 h-24 mx-auto animate-pulse-glow" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold nova-text-gradient">Nova Universe</h1>
            <p className="text-muted-foreground">Initializing your workspace...</p>
          </div>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  // This should never render due to the redirect in useEffect
  return null
}