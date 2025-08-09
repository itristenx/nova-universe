'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BetaBadge } from '@/components/ui/beta-badge'
import { NovaLogo } from '@/components/ui/nova-logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  ChevronDownIcon,
  Squares2X2Icon,
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

interface ModuleSwitcherProps {
  className?: string
  variant?: 'dropdown' | 'grid'
}

export function ModuleSwitcher({ className, variant = 'dropdown' }: ModuleSwitcherProps) {
  const { getAvailableModules, getCurrentModule } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  
  const availableModules = getAvailableModules()
  const currentModuleId = getCurrentModule()
  const currentModule = availableModules.find(m => m.id === currentModuleId)
  
  // Don't render if user only has access to one module
  if (availableModules.length <= 1) {
    return null
  }

  const handleModuleSwitch = (href: string) => {
    setIsOpen(false)
    window.location.href = href
  }

  if (variant === 'grid') {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("relative", className)}
            title="Switch Module"
          >
            <Squares2X2Icon className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-primary">
              {availableModules.length}
            </Badge>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <NovaLogo className="w-6 h-6" />
              <span>Nova Universe</span>
              <Badge variant="outline" className="ml-auto text-xs">
                Beta
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Choose a module to access. You have access to {availableModules.length} modules.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {availableModules.map((module) => {
              const Icon = moduleIcons[module.icon as keyof typeof moduleIcons] || ComputerDesktopIcon
              const isActive = module.id === currentModuleId
              
              return (
                <div
                  key={module.id}
                  onClick={() => handleModuleSwitch(module.href)}
                  className={cn(
                    "relative p-6 rounded-lg border-2 transition-all cursor-pointer group hover:shadow-md",
                    isActive 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {isActive && (
                    <Badge className="absolute top-2 right-2 bg-primary text-xs">
                      Current
                    </Badge>
                  )}
                  
                  <div className="flex items-start space-x-4">
                    <div className={cn(
                      "p-3 rounded-lg",
                      module.color,
                      isActive ? "text-white" : "text-white"
                    )}>
                      <Icon className="w-8 h-8" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                        {module.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {module.description}
                      </p>
                      
                      <div className="flex items-center text-sm text-primary">
                        <span>Access Module</span>
                        <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="flex justify-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Switching modules will navigate you to the selected portal
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center space-x-2 px-3 py-2 h-auto",
            className
          )}
        >
          {currentModule && (
            <>
              <div className={cn("w-4 h-4 rounded", currentModule.color)} />
              <span className="font-medium">{currentModule.name}</span>
            </>
          )}
          <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
          <BetaBadge size="sm" className="ml-1" variant="outline" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>
          <div className="flex items-center justify-between">
            <span>Switch Module</span>
            <Badge variant="outline" className="text-xs">
              {availableModules.length} Available
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {availableModules.map((module) => {
          const Icon = moduleIcons[module.icon as keyof typeof moduleIcons] || ComputerDesktopIcon
          const isActive = module.id === currentModuleId
          
          return (
            <DropdownMenuItem
              key={module.id}
              onClick={() => handleModuleSwitch(module.href)}
              className={cn(
                "flex items-center space-x-3 p-3 cursor-pointer",
                isActive && "bg-primary/10 text-primary"
              )}
            >
              <div className={cn("p-2 rounded-md", module.color)}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{module.name}</span>
                  {isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{module.description}</p>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-muted-foreground" />
            </DropdownMenuItem>
          )
        })}
        
        <DropdownMenuSeparator />
        <div className="p-3 text-xs text-muted-foreground">
          <p className="font-medium mb-1">Need access to more modules?</p>
          <p>Contact your administrator to request additional permissions.</p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}