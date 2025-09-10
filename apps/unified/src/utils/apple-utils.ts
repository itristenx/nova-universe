/**
 * Apple-inspired Utility Functions for Nova Universe ITSM
 * Consistent utility functions following Apple design patterns
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { colors, typography, spacing } from './design-system';

// Enhanced className utility with design system integration
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Apple-style glass morphism utility
export function glassEffect(intensity: 'light' | 'medium' | 'strong' = 'medium') {
  const effects = {
    light: 'backdrop-blur-sm bg-white/80',
    medium: 'backdrop-blur-xl bg-white/90', 
    strong: 'backdrop-blur-2xl bg-white/95'
  };
  
  return cn(
    effects[intensity],
    'border border-white/20 shadow-xl'
  );
}

// Status-based styling for ITSM entities
export function getStatusStyle(status: string, variant: 'badge' | 'border' | 'background' = 'badge') {
  const statusMap = {
    critical: { color: 'red', intensity: 500 },
    high: { color: 'orange', intensity: 500 },
    medium: { color: 'yellow', intensity: 500 },
    low: { color: 'green', intensity: 500 },
    resolved: { color: 'emerald', intensity: 500 },
    closed: { color: 'emerald', intensity: 500 },
    pending: { color: 'yellow', intensity: 500 },
    'in-progress': { color: 'blue', intensity: 500 },
    assigned: { color: 'blue', intensity: 500 },
    'on-hold': { color: 'gray', intensity: 500 },
    open: { color: 'blue', intensity: 500 },
    new: { color: 'indigo', intensity: 500 }
  };

  const config = statusMap[status.toLowerCase()] || { color: 'gray', intensity: 500 };
  
  switch (variant) {
    case 'badge':
      return cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        `bg-${config.color}-100 text-${config.color}-800`
      );
    case 'border':
      return cn(`border-${config.color}-${config.intensity}`);
    case 'background':
      return cn(`bg-${config.color}-50`);
    default:
      return '';
  }
}

// Priority-based styling for tickets and incidents
export function getPriorityStyle(priority: string | number) {
  const priorityValue = typeof priority === 'string' ? 
    ['low', 'medium', 'high', 'critical'].indexOf(priority.toLowerCase()) + 1 :
    priority;

  switch (priorityValue) {
    case 4: // Critical
      return {
        badge: 'bg-red-100 text-red-800 border-red-200',
        dot: 'bg-red-500',
        text: 'text-red-800 font-semibold'
      };
    case 3: // High
      return {
        badge: 'bg-orange-100 text-orange-800 border-orange-200', 
        dot: 'bg-orange-500',
        text: 'text-orange-800 font-semibold'
      };
    case 2: // Medium  
      return {
        badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        dot: 'bg-yellow-500',
        text: 'text-yellow-800 font-medium'
      };
    case 1: // Low
    default:
      return {
        badge: 'bg-green-100 text-green-800 border-green-200',
        dot: 'bg-green-500', 
        text: 'text-green-800 font-medium'
      };
  }
}

// Apple-style focus ring utility
export function focusRing(color: string = 'blue') {
  return cn(
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    `focus:ring-${color}-500`
  );
}

// Responsive text sizing following Apple's type scale
export function appleTextSize(size: keyof typeof typography) {
  const config = typography[size];
  return {
    fontSize: config.fontSize,
    lineHeight: config.lineHeight,
    fontWeight: config.fontWeight,
    letterSpacing: config.letterSpacing
  };
}

// Apple-style card hover effects
export function cardHoverEffect(intensity: 'subtle' | 'medium' | 'strong' = 'medium') {
  const effects = {
    subtle: 'hover:scale-[1.01] hover:shadow-lg',
    medium: 'hover:scale-[1.02] hover:shadow-xl', 
    strong: 'hover:scale-[1.03] hover:shadow-2xl'
  };
  
  return cn(
    effects[intensity],
    'transition-all duration-250 ease-out cursor-pointer'
  );
}

// Generate consistent spacing utilities
export function appleSpacing(size: keyof typeof spacing) {
  return spacing[size];
}

// Apple-style gradient backgrounds
export function appleGradient(direction: 'to-r' | 'to-br' | 'to-b' = 'to-r', colors: string[] = ['blue-500', 'blue-600']) {
  return cn(`bg-gradient-${direction}`, `from-${colors[0]}`, `to-${colors[1]}`);
}

// ITSM-specific role styling
export function getRoleStyle(role: string) {
  const roleMap = {
    admin: { 
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      color: 'purple'
    },
    agent: {
      badge: 'bg-blue-100 text-blue-800 border-blue-200', 
      color: 'blue'
    },
    manager: {
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      color: 'indigo'  
    },
    user: {
      badge: 'bg-gray-100 text-gray-800 border-gray-200',
      color: 'gray'
    }
  };

  return roleMap[role.toLowerCase()] || roleMap.user;
}

// Apple-style loading states
export function appleLoadingState() {
  return cn(
    'animate-pulse',
    'bg-gray-200 rounded-lg'
  );
}

// Apple-style empty states
export function appleEmptyState() {
  return cn(
    'text-center py-12',
    'text-gray-500'
  );
}

// Touch target sizing (Apple HIG - minimum 44px)
export function touchTarget(size: 'small' | 'medium' | 'large' = 'medium') {
  const sizes = {
    small: 'min-h-[44px] min-w-[44px]', // Minimum Apple requirement
    medium: 'min-h-[48px] min-w-[48px]', // Comfortable
    large: 'min-h-[56px] min-w-[56px]'   // Generous
  };
  
  return sizes[size];
}

// Format utilities for ITSM data
export function formatTicketId(id: string | number) {
  return `INC${String(id).padStart(7, '0')}`;
}

export function formatAssetId(id: string | number) {
  return `AST${String(id).padStart(6, '0')}`;  
}

export function formatDateTime(date: Date | string) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(dateObj);
}

export function formatRelativeTime(date: Date | string) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
  return formatDateTime(dateObj);
}

// Apple-style animation utilities
export function springAnimation(config: { 
  stiffness?: number, 
  damping?: number,
  mass?: number 
} = {}) {
  const { stiffness = 300, damping = 30, mass = 1 } = config;
  return {
    type: 'spring',
    stiffness,
    damping,
    mass
  };
}

export function fadeInAnimation(delay: number = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { 
      duration: 0.4,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94] // Apple's preferred easing
    }
  };
}