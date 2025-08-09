'use client'

import { useAuth } from '@/lib/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NovaLogo } from '@/components/ui/nova-logo'
import { ShieldExclamationIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

export default function AccessDeniedPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-background to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <ShieldExclamationIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-2xl text-red-600 dark:text-red-400">
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access Nova Universe
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Hi {user?.name || 'there'},</p>
            <p>
              Your account ({user?.email}) doesn't have access to any Nova Universe modules. 
              Please contact your system administrator to request access.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button className="w-full" variant="outline">
              <EnvelopeIcon className="w-4 h-4 mr-2" />
              Contact IT Support
            </Button>
            
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={logout}
            >
              Sign out
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex items-center justify-center space-x-2">
              <NovaLogo className="w-6 h-6" />
              <span className="text-sm font-medium nova-text-gradient">
                Nova Universe
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}