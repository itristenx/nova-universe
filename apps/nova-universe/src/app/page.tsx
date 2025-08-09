'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-provider'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { NovaLogo } from '@/components/ui/nova-logo'

export default function HomePage() {
  const { isAuthenticated, isLoading, getCurrentModule, hasModuleAccess } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Determine where to redirect the user based on their access
    const currentModule = getCurrentModule()
    
    if (currentModule) {
      const moduleRoutes = {
        orbit: '/portal',
        pulse: '/pulse',
        core: '/admin',
        lore: '/knowledge',
        beacon: '/kiosk',
        synth: '/analytics',
      }
      
      router.push(moduleRoutes[currentModule])
    } else {
      // User has no module access - redirect to access denied page
      router.push('/access-denied')
    }
  }, [isAuthenticated, isLoading, getCurrentModule, router])

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