/**
 * Apple-inspired Glass Morphism Card Component
 * Following Apple design principles for Nova Universe ITSM
 */

import { forwardRef } from 'react';
import { cn, glassEffect, cardHoverEffect } from '@utils/apple-utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: 'light' | 'medium' | 'strong';
  hover?: 'subtle' | 'medium' | 'strong' | false;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    intensity = 'medium',
    hover = 'medium', 
    padding = 'lg',
    className,
    children,
    ...props 
  }, ref) => {
    const paddingMap = {
      sm: 'p-4',
      md: 'p-6', 
      lg: 'p-8',
      xl: 'p-10'
    };

    return (
      <div
        ref={ref}
        className={cn(
          glassEffect(intensity),
          'rounded-3xl',
          paddingMap[padding],
          hover && cardHoverEffect(hover),
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';