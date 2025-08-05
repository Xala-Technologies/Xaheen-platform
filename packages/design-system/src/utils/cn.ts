/**
 * Class Name Utility Function
 * Professional implementation of clsx with proper type safety
 */

import { type ClassValue, clsx } from 'clsx';

/**
 * Utility function to merge CSS class names
 * Combines clsx functionality with proper TypeScript types
 * 
 * @param inputs - CSS class names, objects, or arrays
 * @returns Merged class name string
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Conditional class name utility
 * Applies classes based on boolean conditions
 * 
 * @param condition - Boolean condition
 * @param truthyClasses - Classes to apply when condition is true
 * @param falsyClasses - Classes to apply when condition is false
 * @returns Conditional class name string
 */
export function conditional(
  condition: boolean,
  truthyClasses: ClassValue,
  falsyClasses?: ClassValue
): string {
  return cn(condition ? truthyClasses : falsyClasses);
}

/**
 * Responsive class name utility
 * Applies different classes at different breakpoints
 * 
 * @param base - Base classes (applied at all breakpoints)
 * @param responsive - Responsive classes object
 * @returns Responsive class name string
 */
export function responsive(
  base: ClassValue,
  responsive: {
    sm?: ClassValue;
    md?: ClassValue;
    lg?: ClassValue;
    xl?: ClassValue;
    '2xl'?: ClassValue;
  }
): string {
  return cn(
    base,
    responsive.sm && `sm:${responsive.sm}`,
    responsive.md && `md:${responsive.md}`,
    responsive.lg && `lg:${responsive.lg}`,
    responsive.xl && `xl:${responsive.xl}`,
    responsive['2xl'] && `2xl:${responsive['2xl']}`
  );
}

/**
 * Focus ring utility for accessibility
 * Applies consistent focus styling across components
 * 
 * @param variant - Focus ring variant
 * @returns Focus ring class names
 */
export function focusRing(variant: 'default' | 'primary' | 'destructive' = 'default'): string {
  const baseClasses = 'focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  switch (variant) {
    case 'primary':
      return cn(baseClasses, 'focus:ring-primary/20');
    case 'destructive':
      return cn(baseClasses, 'focus:ring-destructive/20');
    default:
      return cn(baseClasses, 'focus:ring-ring');
  }
}

/**
 * High contrast mode support utility
 * Adds additional styling for high contrast mode
 * 
 * @param classes - Additional classes for high contrast
 * @returns High contrast compatible class names
 */
export function highContrast(classes: ClassValue): string {
  return cn(
    classes,
    'contrast-more:border-2',
    'contrast-more:shadow-none'
  );
}

/**
 * Reduced motion support utility
 * Removes animations for users who prefer reduced motion
 * 
 * @param animatedClasses - Classes with animations
 * @param staticClasses - Classes without animations (fallback)
 * @returns Motion-safe class names
 */
export function motionSafe(
  animatedClasses: ClassValue,
  staticClasses?: ClassValue
): string {
  return cn(
    'motion-reduce:animate-none',
    'motion-reduce:transform-none',
    animatedClasses,
    staticClasses && `motion-reduce:${staticClasses}`
  );
}

/**
 * Dark mode variant utility
 * Applies different classes for light and dark themes
 * 
 * @param lightClasses - Classes for light mode
 * @param darkClasses - Classes for dark mode
 * @returns Theme-aware class names
 */
export function themeVariant(
  lightClasses: ClassValue,
  darkClasses: ClassValue
): string {
  return cn(lightClasses, `dark:${darkClasses}`);
}

/**
 * NSM classification utility
 * Applies appropriate styling based on Norwegian security classification
 * 
 * @param classification - NSM security classification
 * @returns NSM-appropriate class names
 */
export function nsmClassification(
  classification: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET'
): string {
  switch (classification) {
    case 'OPEN':
      return 'border-green-200 bg-green-50/50 text-green-800';
    case 'RESTRICTED':
      return 'border-yellow-200 bg-yellow-50/50 text-yellow-800';
    case 'CONFIDENTIAL':
      return 'border-red-200 bg-red-50/50 text-red-800';
    case 'SECRET':
      return 'border-gray-400 bg-gray-100/50 text-gray-900';
    default:
      return '';
  }
}