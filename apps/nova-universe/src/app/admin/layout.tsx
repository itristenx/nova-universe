'use client'

import { useAuth } from '@/lib/auth/auth-provider'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/modules/admin/admin-sidebar'
import { AdminHeader } from '@/components/modules/admin/admin-header'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated, isLoading, hasModuleAccess } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin')
      return
    }

    if (!isLoading && isAuthenticated && !hasModuleAccess('admin')) {
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

  if (!isAuthenticated || !hasModuleAccess('admin')) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          
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