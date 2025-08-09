import { cn } from '@/lib/utils'

interface NovaLogoProps {
  className?: string
  variant?: 'icon' | 'full'
}

export function NovaLogo({ className, variant = 'icon' }: NovaLogoProps) {
  if (variant === 'full') {
    return (
      <div className={cn('flex items-center space-x-3', className)}>
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <div className="w-6 h-6 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white" />
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold nova-text-gradient">Nova</span>
          <span className="text-sm text-muted-foreground -mt-1">Universe</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-white" />
        </div>
      </div>
      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent animate-pulse shadow-sm" />
    </div>
  )
}