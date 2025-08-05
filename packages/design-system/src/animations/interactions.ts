/**
 * Interaction Patterns & Animations
 * Professional micro-interactions with reduced motion support
 * WCAG AAA compliant animations and transitions
 */

// Animation timing functions (professional easing curves)
export const easingCurves = {
  linear: 'cubic-bezier(0, 0, 1, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Custom professional curves
  smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',      // Smooth professional feel
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',    // Subtle bounce
  precise: 'cubic-bezier(0.165, 0.84, 0.44, 1)',       // Precise, technical
  organic: 'cubic-bezier(0.23, 1, 0.32, 1)',           // Natural, organic
  
  // Norwegian design system curves
  nordicSmooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',    // Nordic design feel
  efficient: 'cubic-bezier(0.25, 0, 0.25, 1)'          // Efficient transitions
} as const;

// Animation durations (in milliseconds)
export const durations = {
  instant: 0,      // Immediate feedback
  fast: 150,       // Quick transitions
  normal: 250,     // Standard transitions
  slow: 350,       // Deliberate transitions
  slower: 500,     // Emphasis transitions
  slowest: 750     // Special effect transitions
} as const;

// CSS Animation keyframes
export const keyframes = {
  // Loading animations
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' }
  },
  
  pulse: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.5' }
  },
  
  bounce: {
    '0%, 100%': { 
      transform: 'translateY(-25%)',
      animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
    },
    '50%': { 
      transform: 'translateY(0)',
      animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
    }
  },
  
  // Skeleton loading animation
  skeleton: {
    '0%': { backgroundPosition: '200% 0' },
    '100%': { backgroundPosition: '-200% 0' }
  },
  
  shimmer: {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' }
  },
  
  // Fade animations
  fadeIn: {
    from: { opacity: '0' },
    to: { opacity: '1' }
  },
  
  fadeOut: {
    from: { opacity: '1' },
    to: { opacity: '0' }
  },
  
  // Slide animations
  slideInRight: {
    from: { transform: 'translateX(100%)' },
    to: { transform: 'translateX(0)' }
  },
  
  slideInLeft: {
    from: { transform: 'translateX(-100%)' },
    to: { transform: 'translateX(0)' }
  },
  
  slideInUp: {
    from: { transform: 'translateY(100%)' },
    to: { transform: 'translateY(0)' }
  },
  
  slideInDown: {
    from: { transform: 'translateY(-100%)' },
    to: { transform: 'translateY(0)' }
  },
  
  // Scale animations
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: '0' },
    to: { transform: 'scale(1)', opacity: '1' }
  },
  
  scaleOut: {
    from: { transform: 'scale(1)', opacity: '1' },
    to: { transform: 'scale(0.95)', opacity: '0' }
  },
  
  // Modal animations
  modalEnter: {
    from: { 
      opacity: '0',
      transform: 'scale(0.95) translateY(-10px)'
    },
    to: { 
      opacity: '1',
      transform: 'scale(1) translateY(0)'
    }
  },
  
  modalExit: {
    from: { 
      opacity: '1',
      transform: 'scale(1) translateY(0)'
    },
    to: { 
      opacity: '0',
      transform: 'scale(0.95) translateY(-10px)'
    }
  },
  
  // Backdrop animations
  backdropFadeIn: {
    from: { opacity: '0' },
    to: { opacity: '1' }
  },
  
  backdropFadeOut: {
    from: { opacity: '1' },
    to: { opacity: '0' }
  }
} as const;

// Micro-interaction presets
export const microInteractions = {
  // Button interactions
  button: {
    hover: {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transition: `all ${durations.fast}ms ${easingCurves.smooth}`
    },
    active: {
      transform: 'translateY(0)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      transition: `all ${durations.fast}ms ${easingCurves.precise}`
    },
    focus: {
      outline: '2px solid var(--color-ring)',
      outlineOffset: '2px',
      transition: `outline ${durations.fast}ms ${easingCurves.precise}`
    }
  },
  
  // Card interactions
  card: {
    hover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      transition: `all ${durations.normal}ms ${easingCurves.smooth}`
    },
    active: {
      transform: 'translateY(0)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      transition: `all ${durations.fast}ms ${easingCurves.precise}`
    }
  },
  
  // Input interactions
  input: {
    focus: {
      borderColor: 'var(--color-ring)',
      boxShadow: '0 0 0 3px var(--color-ring-alpha-20)',
      transition: `all ${durations.fast}ms ${easingCurves.smooth}`
    },
    error: {
      borderColor: 'var(--color-destructive)',
      boxShadow: '0 0 0 3px var(--color-destructive-alpha-20)',
      animation: `shake ${durations.normal}ms ${easingCurves.easeInOut}`
    }
  },
  
  // Loading states
  loading: {
    spinner: {
      animation: `spin 1s linear infinite`
    },
    pulse: {
      animation: `pulse 2s ${easingCurves.easeInOut} infinite`
    },
    skeleton: {
      background: 'linear-gradient(90deg, var(--color-muted) 25%, var(--color-muted-light) 50%, var(--color-muted) 75%)',
      backgroundSize: '200% 100%',
      animation: `skeleton 1.5s ease-in-out infinite`
    }
  }
} as const;

// Page transition animations
export const pageTransitions = {
  // Fade transitions
  fade: {
    enter: {
      opacity: 0,
      transition: `opacity ${durations.normal}ms ${easingCurves.smooth}`
    },
    enterActive: {
      opacity: 1
    },
    exit: {
      opacity: 1,
      transition: `opacity ${durations.fast}ms ${easingCurves.precise}`
    },
    exitActive: {
      opacity: 0
    }
  },
  
  // Slide transitions
  slide: {
    enter: {
      transform: 'translateX(20px)',
      opacity: 0,
      transition: `all ${durations.slow}ms ${easingCurves.smooth}`
    },
    enterActive: {
      transform: 'translateX(0)',
      opacity: 1
    },
    exit: {
      transform: 'translateX(0)',
      opacity: 1,
      transition: `all ${durations.normal}ms ${easingCurves.precise}`
    },
    exitActive: {
      transform: 'translateX(-20px)',
      opacity: 0
    }
  }
} as const;

// Utility functions for animations
export const animationUtils = {
  // Create CSS animation string
  createAnimation: (
    name: keyof typeof keyframes,
    duration: keyof typeof durations,
    easing: keyof typeof easingCurves = 'smooth',
    iterationCount: number | 'infinite' = 1,
    direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse' = 'normal'
  ): string => {
    return `${name} ${durations[duration]}ms ${easingCurves[easing]} ${iterationCount} ${direction}`;
  },
  
  // Create transition string
  createTransition: (
    properties: string[],
    duration: keyof typeof durations = 'normal',
    easing: keyof typeof easingCurves = 'smooth'
  ): string => {
    return properties
      .map(prop => `${prop} ${durations[duration]}ms ${easingCurves[easing]}`)
      .join(', ');
  },
  
  // Generate motion-safe classes
  motionSafe: (
    animatedClass: string,
    staticClass: string = 'transition-none'
  ): string => {
    return `motion-reduce:${staticClass} ${animatedClass}`;
  },
  
  // Norwegian-specific interaction timing
  norwegianTiming: {
    // Slightly slower for better accessibility
    fast: durations.normal,
    normal: durations.slow,
    slow: durations.slower
  }
} as const;

// CSS-in-JS animation objects for styled-components or emotion
export const cssAnimations = {
  // Keyframe definitions for CSS-in-JS
  keyframes: Object.entries(keyframes).reduce((acc, [key, frames]) => {
    acc[key] = frames;
    return acc;
  }, {} as Record<string, any>),
  
  // Animation mixins
  mixins: {
    fadeIn: `
      animation: ${animationUtils.createAnimation('fadeIn', 'normal')};
    `,
    
    slideInUp: `
      animation: ${animationUtils.createAnimation('slideInUp', 'normal')};
    `,
    
    buttonHover: `
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: ${animationUtils.createTransition(['transform', 'box-shadow'], 'fast')};
      }
    `,
    
    cardElevation: `
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        transition: ${animationUtils.createTransition(['transform', 'box-shadow'], 'normal')};
      }
    `,
    
    motionSafe: `
      @media (prefers-reduced-motion: reduce) {
        animation: none !important;
        transition: none !important;
        transform: none !important;
      }
    `
  }
} as const;

// Export types
export type EasingCurve = keyof typeof easingCurves;
export type Duration = keyof typeof durations;
export type KeyframeName = keyof typeof keyframes;
export type MicroInteraction = keyof typeof microInteractions;