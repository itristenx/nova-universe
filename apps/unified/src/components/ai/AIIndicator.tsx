/**
 * AI Indicator Badge Component
 * Shows when AI functionality is present in UI elements
 */
import React from 'react';
import { SparklesIcon, BoltIcon, BrainIcon } from '@heroicons/react/24/outline';

interface AIIndicatorProps {
  type?: 'cosmo' | 'ai' | 'smart' | 'powered';
  size?: 'xs' | 'sm' | 'md';
  animate?: boolean;
  tooltip?: string;
  className?: string;
}

export function AIIndicator({ 
  type = 'ai', 
  size = 'sm', 
  animate = true,
  tooltip = 'AI-powered',
  className = '' 
}: AIIndicatorProps) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  };

  const iconComponents = {
    cosmo: SparklesIcon,
    ai: BrainIcon,
    smart: BoltIcon,
    powered: SparklesIcon
  };

  const colors = {
    cosmo: 'text-purple-500',
    ai: 'text-blue-500',
    smart: 'text-green-500',
    powered: 'text-indigo-500'
  };

  const IconComponent = iconComponents[type];

  return (
    <div
      className={`inline-flex items-center justify-center ${animate ? 'animate-pulse' : ''} ${className}`}
      title={tooltip}
    >
      <IconComponent className={`${sizeClasses[size]} ${colors[type]}`} />
    </div>
  );
}

export default AIIndicator;