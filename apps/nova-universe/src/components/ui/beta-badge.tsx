import React from 'react'
import { cn } from '@/lib/utils'

interface BetaBadgeProps {
  className?: string
  variant?: 'default' | 'outline' | 'glow'
  size?: 'sm' | 'md' | 'lg'
}

export function BetaBadge({ 
  className, 
  variant = 'glow',
  size = 'md' 
}: BetaBadgeProps) {
  const baseClasses = "inline-flex items-center justify-center font-semibold tracking-wide uppercase transition-all duration-300"
  
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs rounded-md",
    md: "px-3 py-1 text-xs rounded-lg",
    lg: "px-4 py-1.5 text-sm rounded-xl"
  }
  
  const variantClasses = {
    default: "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg",
    outline: "border border-purple-300 text-purple-600 bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:bg-purple-950/30",
    glow: "relative overflow-hidden"
  }
  
  if (variant === 'glow') {
    return (
      <div className={cn(
        baseClasses,
        sizeClasses[size],
        "relative overflow-hidden bg-black/90 backdrop-blur-xl border border-white/20 text-white",
        className
      )}>
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-orange-500 opacity-80 animate-pulse-glow" 
             style={{
               backgroundSize: '400% 400%',
               animation: 'gradientShift 3s ease infinite'
             }} />
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"
             style={{
               animation: 'shimmer 2s ease-in-out infinite'
             }} />
        
        {/* Content */}
        <span className="relative z-10 font-bold tracking-wider drop-shadow-sm">
          BETA
        </span>
        
        {/* Glow ring */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-orange-500 rounded-xl opacity-30 blur-sm animate-pulse-glow" 
             style={{
               backgroundSize: '400% 400%',
               animation: 'gradientShift 3s ease infinite'
             }} />
      </div>
    )
  }
  
  return (
    <div className={cn(
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      BETA
    </div>
  )
}

// Add these keyframes to your global CSS
const styles = `
@keyframes shimmer {
  0% { transform: translateX(-100%) skewX(-12deg); }
  100% { transform: translateX(200%) skewX(-12deg); }
}
`