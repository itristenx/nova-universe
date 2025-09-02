/**
 * Cosmo Avatar Component - Animated AI Assistant Mascot
 * A cute, animated representation of Cosmo AI for Nova Universe
 */
import React from 'react';
import { SparklesIcon, BoltIcon } from '@heroicons/react/24/outline';

interface CosmoAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  thinking?: boolean;
  speaking?: boolean;
  className?: string;
}

export function CosmoAvatar({ 
  size = 'md', 
  animate = true, 
  thinking = false, 
  speaking = false,
  className = '' 
}: CosmoAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const animationClasses = {
    idle: '',
    float: animate ? 'animate-bounce' : '',
    thinking: thinking ? 'animate-pulse' : '',
    speaking: speaking ? 'animate-pulse' : ''
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Glow effect */}
      <div className={`absolute rounded-full bg-gradient-to-r from-blue-400 to-purple-500 blur-sm opacity-30 ${sizeClasses[size]} ${animate ? 'animate-pulse' : ''}`} />
      
      {/* Main avatar container */}
      <div className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg ${animationClasses.float}`}>
        {/* Cosmo's face */}
        <div className={`relative w-full h-full flex items-center justify-center ${animationClasses.thinking} ${animationClasses.speaking}`}>
          <SparklesIcon className="w-3/4 h-3/4 text-white" />
        </div>
        
        {/* Thinking indicator */}
        {thinking && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping">
            <BoltIcon className="w-full h-full text-yellow-800" />
          </div>
        )}
        
        {/* Speaking indicator */}
        {speaking && (
          <div className="absolute -bottom-1 -right-1 flex space-x-1 animate-pulse">
            <div className="w-1 h-1 bg-green-400 rounded-full" />
            <div className="w-1 h-1 bg-green-400 rounded-full" />
            <div className="w-1 h-1 bg-green-400 rounded-full" />
          </div>
        )}
      </div>
      
      {/* AI indicator badge */}
      <div className="absolute -top-1 -left-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
        <SparklesIcon className="w-2.5 h-2.5 text-blue-500" />
      </div>
    </div>
  );
}

export default CosmoAvatar;