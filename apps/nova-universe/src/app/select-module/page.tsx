'use client'

import { useAuth } from '@/lib/auth/auth-provider'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NovaLogo } from '@/components/ui/nova-logo'
import {
  ArrowRightIcon,
  ComputerDesktopIcon,
  UserGroupIcon,
  CogIcon,
  DocumentTextIcon,
  ChartBarIcon,
  HomeIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

const moduleIcons = {
  orbit: UserGroupIcon,
  pulse: ComputerDesktopIcon,
  core: CogIcon,
  lore: DocumentTextIcon,
  beacon: HomeIcon,
  synth: ChartBarIcon,
}

export default function SelectModulePage() {
  const { isAuthenticated, isLoading, getAvailableModules, user } = useAuth()
  const router = useRouter()
  
  const availableModules = getAvailableModules()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    // If user only has access to one module, redirect directly
    if (!isLoading && availableModules.length === 1) {
      router.push(availableModules[0].href)
      return
    }

    // If user has no module access
    if (!isLoading && availableModules.length === 0) {
      router.push('/access-denied')
      return
    }
  }, [isAuthenticated, isLoading, availableModules, router])

  const handleModuleSelect = (href: string) => {
    router.push(href)
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <NovaLogo className="w-16 h-16 mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (availableModules.length <= 1) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <NovaLogo className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-bold nova-text-gradient">Nova Universe</h1>
              <Badge variant="outline" className="mt-1">Beta</Badge>
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
          </h2>
          <p className="text-muted-foreground">
            You have access to {availableModules.length} modules. Choose one to continue.
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableModules.map((module) => {
            const Icon = moduleIcons[module.icon as keyof typeof moduleIcons] || ComputerDesktopIcon
            
            return (
              <Card
                key={module.id}
                onClick={() => handleModuleSelect(module.href)}
                className="relative group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-primary/50 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60"
              >
                <CardHeader className="text-center pb-4">
                  <div className={cn(
                    "mx-auto p-4 rounded-2xl mb-4 transition-all duration-300 group-hover:scale-110",
                    module.color
                  )}>
                    <Icon className="w-12 h-12 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {module.name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="text-center pt-0">
                  <div className="flex items-center justify-center text-primary group-hover:translate-x-1 transition-transform">
                    <span className="text-sm font-medium">Access Module</span>
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </div>
                </CardContent>
                
                {/* Glassmorphism hover effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            )
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-sm text-muted-foreground">
            You can switch between modules anytime using the module switcher in the header
          </p>
          <p className="text-xs text-muted-foreground">
            Need access to more modules? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  )
}