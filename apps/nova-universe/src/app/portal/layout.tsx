'use client'

import { useAuth } from '@/lib/auth/auth-provider'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PortalSidebar } from '@/components/modules/portal/portal-sidebar'
import { PortalHeader } from '@/components/modules/portal/portal-header'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface PortalLayoutProps {
  children: React.ReactNode
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  const { isAuthenticated, isLoading, hasModuleAccess } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/portal')
      return
    }

    if (!isLoading && isAuthenticated && !hasModuleAccess('portal')) {
      router.push('/access-denied')
      return
    }
  }, [isAuthenticated, isLoading, hasModuleAccess, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated || !hasModuleAccess('portal')) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <PortalSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <PortalHeader />
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}