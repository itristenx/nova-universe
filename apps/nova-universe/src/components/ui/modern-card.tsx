import React from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ModernCardProps extends React.ComponentProps<typeof Card> {
  variant?: 'default' | 'glass' | 'glow' | 'gradient'
  hover?: boolean
}

export function ModernCard({ 
  className, 
  variant = 'default',
  hover = true,
  children,
  ...props 
}: ModernCardProps) {
  const baseClasses = "transition-all duration-300 ease-out"
  
  const variantClasses = {
    default: "modern-card",
    glass: "glass-card backdrop-blur-xl",
    glow: "nova-glow-border",
    gradient: "bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/30"
  }
  
  const hoverClasses = hover ? "hover:scale-[1.02] hover:-translate-y-1 cursor-pointer" : ""
  
  return (
    <Card 
      className={cn(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        className
      )}
      {...props}
    >
      {children}
      
      {/* Subtle glow effect for certain variants */}
      {(variant === 'glow' || variant === 'gradient') && (
        <div className="absolute -inset-px bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      )}
    </Card>
  )
}

export default ModernCard