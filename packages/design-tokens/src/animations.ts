/**
 * Animation & Motion System for Nova Universe
 * CSS-based animation library compatible with HeroUI and modern web standards
 */

// Animation timing functions (easing curves)
export const easingCurves = {
  // Standard curves
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Custom Nova curves
  nova: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  novaSpring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  novaSharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  novaSoft: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  
  // Bouncy animations
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  backOut: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  backIn: 'cubic-bezier(0.36, 0, 0.66, -0.56)',
  backInOut: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
} as const

// Animation durations (in milliseconds)
export const durations = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 750,
  slowest: 1000
} as const

// Animation delays
export const delays = {
  none: 0,
  short: 100,
  medium: 200,
  long: 300,
  longer: 500
} as const

// Transform utilities
export const transforms = {
  // Scale animations
  scaleUp: {
    from: 'scale(0.95)',
    to: 'scale(1)'
  },
  scaleDown: {
    from: 'scale(1)',
    to: 'scale(0.95)'
  },
  scaleIn: {
    from: 'scale(0)',
    to: 'scale(1)'
  },
  scaleOut: {
    from: 'scale(1)',
    to: 'scale(0)'
  },
  
  // Slide animations
  slideInUp: {
    from: 'translateY(100%)',
    to: 'translateY(0)'
  },
  slideInDown: {
    from: 'translateY(-100%)',
    to: 'translateY(0)'
  },
  slideInLeft: {
    from: 'translateX(-100%)',
    to: 'translateX(0)'
  },
  slideInRight: {
    from: 'translateX(100%)',
    to: 'translateX(0)'
  },
  
  // Fade animations
  fadeIn: {
    from: 'translateY(10px)',
    to: 'translateY(0)'
  },
  fadeInUp: {
    from: 'translateY(20px)',
    to: 'translateY(0)'
  },
  fadeInDown: {
    from: 'translateY(-20px)',
    to: 'translateY(0)'
  }
} as const

// Predefined animation configurations
export const animations = {
  // Micro-interactions
  buttonHover: {
    duration: durations.fast,
    timing: easingCurves.easeOut,
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  },
  
  buttonPress: {
    duration: durations.fast,
    timing: easingCurves.easeInOut,
    transform: 'scale(0.98)'
  },
  
  cardHover: {
    duration: durations.normal,
    timing: easingCurves.nova,
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
  },
  
  // Component transitions
  modalEnter: {
    duration: durations.normal,
    timing: easingCurves.nova,
    opacity: { from: 0, to: 1 },
    transform: transforms.scaleUp
  },
  
  modalExit: {
    duration: durations.fast,
    timing: easingCurves.easeIn,
    opacity: { from: 1, to: 0 },
    transform: transforms.scaleDown
  },
  
  drawerEnter: {
    duration: durations.normal,
    timing: easingCurves.nova,
    transform: transforms.slideInRight
  },
  
  drawerExit: {
    duration: durations.fast,
    timing: easingCurves.easeIn,
    transform: {
      from: 'translateX(0)',
      to: 'translateX(100%)'
    }
  },
  
  dropdownEnter: {
    duration: durations.fast,
    timing: easingCurves.easeOut,
    opacity: { from: 0, to: 1 },
    transform: transforms.fadeInUp
  },
  
  dropdownExit: {
    duration: durations.fast,
    timing: easingCurves.easeIn,
    opacity: { from: 1, to: 0 },
    transform: {
      from: 'translateY(0)',
      to: 'translateY(-10px)'
    }
  },
  
  // Notification animations
  toastEnter: {
    duration: durations.normal,
    timing: easingCurves.novaSpring,
    opacity: { from: 0, to: 1 },
    transform: transforms.slideInRight
  },
  
  toastExit: {
    duration: durations.fast,
    timing: easingCurves.easeIn,
    opacity: { from: 1, to: 0 },
    transform: {
      from: 'translateX(0)',
      to: 'translateX(100%)'
    }
  },
  
  // Loading animations
  pulse: {
    duration: durations.slow,
    timing: easingCurves.easeInOut,
    iteration: 'infinite',
    direction: 'alternate',
    opacity: { from: 0.5, to: 1 }
  },
  
  spin: {
    duration: durations.slowest,
    timing: easingCurves.linear,
    iteration: 'infinite',
    transform: {
      from: 'rotate(0deg)',
      to: 'rotate(360deg)'
    }
  },
  
  bounce: {
    duration: durations.slowest,
    timing: easingCurves.bounce,
    iteration: 'infinite',
    transform: {
      '0%, 100%': 'translateY(-25%)',
      '50%': 'translateY(0)'
    }
  },
  
  // Page transitions
  pageEnter: {
    duration: durations.slow,
    timing: easingCurves.nova,
    opacity: { from: 0, to: 1 },
    transform: transforms.fadeIn
  },
  
  pageExit: {
    duration: durations.normal,
    timing: easingCurves.easeIn,
    opacity: { from: 1, to: 0 }
  }
} as const

// CSS custom properties for animations
export const animationCSS = `
:root {
  /* Animation Durations */
  --duration-instant: ${durations.instant}ms;
  --duration-fast: ${durations.fast}ms;
  --duration-normal: ${durations.normal}ms;
  --duration-slow: ${durations.slow}ms;
  --duration-slower: ${durations.slower}ms;
  --duration-slowest: ${durations.slowest}ms;
  
  /* Animation Delays */
  --delay-none: ${delays.none}ms;
  --delay-short: ${delays.short}ms;
  --delay-medium: ${delays.medium}ms;
  --delay-long: ${delays.long}ms;
  --delay-longer: ${delays.longer}ms;
  
  /* Easing Curves */
  --ease-linear: ${easingCurves.linear};
  --ease-in: ${easingCurves.easeIn};
  --ease-out: ${easingCurves.easeOut};
  --ease-in-out: ${easingCurves.easeInOut};
  --ease-nova: ${easingCurves.nova};
  --ease-nova-spring: ${easingCurves.novaSpring};
  --ease-nova-sharp: ${easingCurves.novaSharp};
  --ease-nova-soft: ${easingCurves.novaSoft};
  --ease-bounce: ${easingCurves.bounce};
  --ease-back-out: ${easingCurves.backOut};
  --ease-back-in: ${easingCurves.backIn};
  --ease-back-in-out: ${easingCurves.backInOut};
}

/* Base animation classes */
.animate-nova {
  transition-timing-function: var(--ease-nova);
  transition-duration: var(--duration-normal);
}

.animate-fast {
  transition-duration: var(--duration-fast);
}

.animate-slow {
  transition-duration: var(--duration-slow);
}

/* Micro-interaction animations */
.hover-lift {
  transition: transform var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out);
}

.hover-lift:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.hover-scale {
  transition: transform var(--duration-fast) var(--ease-out);
}

.hover-scale:hover {
  transform: scale(1.02);
}

.press-scale {
  transition: transform var(--duration-fast) var(--ease-in-out);
}

.press-scale:active {
  transform: scale(0.98);
}

/* Loading animations */
@keyframes nova-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

@keyframes nova-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes nova-bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

@keyframes nova-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes nova-fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes nova-fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes nova-slide-in-right {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes nova-slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes nova-scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Animation utility classes */
.animate-pulse {
  animation: nova-pulse var(--duration-slow) var(--ease-in-out) infinite alternate;
}

.animate-spin {
  animation: nova-spin var(--duration-slowest) var(--ease-linear) infinite;
}

.animate-bounce {
  animation: nova-bounce var(--duration-slowest) var(--ease-bounce) infinite;
}

.animate-fade-in {
  animation: nova-fade-in var(--duration-normal) var(--ease-nova);
}

.animate-fade-in-up {
  animation: nova-fade-in-up var(--duration-normal) var(--ease-nova);
}

.animate-fade-in-down {
  animation: nova-fade-in-down var(--duration-normal) var(--ease-nova);
}

.animate-slide-in-right {
  animation: nova-slide-in-right var(--duration-normal) var(--ease-nova);
}

.animate-slide-in-left {
  animation: nova-slide-in-left var(--duration-normal) var(--ease-nova);
}

.animate-scale-in {
  animation: nova-scale-in var(--duration-normal) var(--ease-nova-spring);
}

/* Component-specific animations */
.modal-enter {
  animation: nova-scale-in var(--duration-normal) var(--ease-nova);
}

.modal-exit {
  animation: nova-scale-in var(--duration-fast) var(--ease-in) reverse;
}

.drawer-enter {
  animation: nova-slide-in-right var(--duration-normal) var(--ease-nova);
}

.drawer-exit {
  animation: nova-slide-in-right var(--duration-fast) var(--ease-in) reverse;
}

.dropdown-enter {
  animation: nova-fade-in-up var(--duration-fast) var(--ease-out);
}

.dropdown-exit {
  animation: nova-fade-in-up var(--duration-fast) var(--ease-in) reverse;
}

.toast-enter {
  animation: nova-slide-in-right var(--duration-normal) var(--ease-nova-spring);
}

.toast-exit {
  animation: nova-slide-in-right var(--duration-fast) var(--ease-in) reverse;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`

// Generate animation utility classes for Tailwind
export function generateAnimationTailwindConfig() {
  return {
    extend: {
      animation: {
        'nova-pulse': 'nova-pulse var(--duration-slow) var(--ease-in-out) infinite alternate',
        'nova-spin': 'nova-spin var(--duration-slowest) var(--ease-linear) infinite',
        'nova-bounce': 'nova-bounce var(--duration-slowest) var(--ease-bounce) infinite',
        'nova-fade-in': 'nova-fade-in var(--duration-normal) var(--ease-nova)',
        'nova-fade-in-up': 'nova-fade-in-up var(--duration-normal) var(--ease-nova)',
        'nova-fade-in-down': 'nova-fade-in-down var(--duration-normal) var(--ease-nova)',
        'nova-slide-in-right': 'nova-slide-in-right var(--duration-normal) var(--ease-nova)',
        'nova-slide-in-left': 'nova-slide-in-left var(--duration-normal) var(--ease-nova)',
        'nova-scale-in': 'nova-scale-in var(--duration-normal) var(--ease-nova-spring)'
      },
      keyframes: {
        'nova-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' }
        },
        'nova-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' }
        },
        'nova-bounce': {
          '0%, 100%': {
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0.8,0,1,1)'
          },
          '50%': {
            transform: 'none',
            animationTimingFunction: 'cubic-bezier(0,0,0.2,1)'
          }
        },
        'nova-fade-in': {
          from: {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'nova-fade-in-up': {
          from: {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'nova-fade-in-down': {
          from: {
            opacity: '0',
            transform: 'translateY(-20px)'
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'nova-slide-in-right': {
          from: {
            opacity: '0',
            transform: 'translateX(100%)'
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        'nova-slide-in-left': {
          from: {
            opacity: '0',
            transform: 'translateX(-100%)'
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        'nova-scale-in': {
          from: {
            opacity: '0',
            transform: 'scale(0.95)'
          },
          to: {
            opacity: '1',
            transform: 'scale(1)'
          }
        }
      },
      transitionTimingFunction: {
        'nova': easingCurves.nova,
        'nova-spring': easingCurves.novaSpring,
        'nova-sharp': easingCurves.novaSharp,
        'nova-soft': easingCurves.novaSoft,
        'bounce': easingCurves.bounce,
        'back-out': easingCurves.backOut,
        'back-in': easingCurves.backIn,
        'back-in-out': easingCurves.backInOut
      },
      transitionDuration: {
        'instant': `${durations.instant}ms`,
        'fast': `${durations.fast}ms`,
        'normal': `${durations.normal}ms`,
        'slow': `${durations.slow}ms`,
        'slower': `${durations.slower}ms`,
        'slowest': `${durations.slowest}ms`
      },
      transitionDelay: {
        'short': `${delays.short}ms`,
        'medium': `${delays.medium}ms`,
        'long': `${delays.long}ms`,
        'longer': `${delays.longer}ms`
      }
    }
  }
}

// Animation utility functions
export const animationUtils = {
  /**
   * Create a CSS transition string
   */
  transition(property: string, duration: keyof typeof durations, timing: keyof typeof easingCurves, delay?: keyof typeof delays): string {
    const durationMs = durations[duration]
    const timingFunction = easingCurves[timing]
    const delayMs = delay ? delays[delay] : 0
    
    return `${property} ${durationMs}ms ${timingFunction} ${delayMs}ms`
  },
  
  /**
   * Create multiple transitions
   */
  transitions(transitions: Array<{
    property: string
    duration: keyof typeof durations
    timing: keyof typeof easingCurves
    delay?: keyof typeof delays
  }>): string {
    return transitions.map(t => this.transition(t.property, t.duration, t.timing, t.delay)).join(', ')
  },
  
  /**
   * Get animation class name
   */
  getAnimationClass(animationName: keyof typeof animations): string {
    return `animate-${animationName.replace(/([A-Z])/g, '-$1').toLowerCase()}`
  }
}

// Predefined animation class combinations
export const animationClasses = {
  // Button animations
  buttonDefault: 'hover-lift press-scale transition-all duration-fast ease-nova',
  buttonPrimary: 'hover-lift press-scale transition-all duration-fast ease-nova-spring',
  buttonSecondary: 'hover-scale press-scale transition-all duration-fast ease-out',
  
  // Card animations
  cardDefault: 'hover-lift transition-all duration-normal ease-nova',
  cardInteractive: 'hover-lift press-scale transition-all duration-normal ease-nova',
  
  // Modal animations
  modalBackdrop: 'animate-fade-in',
  modalContent: 'animate-scale-in',
  
  // Drawer animations
  drawerOverlay: 'animate-fade-in',
  drawerContent: 'animate-slide-in-right',
  
  // Dropdown animations
  dropdownContent: 'animate-fade-in-up',
  
  // Toast animations
  toastDefault: 'animate-slide-in-right',
  
  // Loading animations
  loadingSpinner: 'animate-spin',
  loadingPulse: 'animate-pulse',
  loadingBounce: 'animate-bounce',
  
  // Page transitions
  pageContent: 'animate-fade-in'
}

export type AnimationName = keyof typeof animations
export type EasingCurve = keyof typeof easingCurves
export type Duration = keyof typeof durations
export type Delay = keyof typeof delays
