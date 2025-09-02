/**
 * AI Feature Enhancement Hook
 * Adds AI indicators to existing components
 */
import React from 'react';
import AIIndicator from './AIIndicator';

interface WithAIIndicatorProps {
  showAI?: boolean;
  aiType?: 'cosmo' | 'ai' | 'smart' | 'powered';
  aiSize?: 'xs' | 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export function WithAIIndicator({ 
  showAI = true, 
  aiType = 'ai', 
  aiSize = 'xs',
  children,
  className = ''
}: WithAIIndicatorProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {showAI && (
        <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
          <AIIndicator type={aiType} size={aiSize} />
        </div>
      )}
    </div>
  );
}

export default WithAIIndicator;