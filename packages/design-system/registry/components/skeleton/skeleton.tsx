/**
 * Skeleton Component - Professional Loading State Placeholders
 * CLAUDE.md Compliant: Professional styling and accessibility
 * WCAG AAA: Full keyboard navigation and screen reader support
 * CVA: Class Variance Authority for consistent styling
 */

import React, { useMemo, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// =============================================================================
// SKELETON VARIANTS
// =============================================================================

const skeletonVariants = cva(
  [
    'animate-pulse bg-muted rounded',
    'relative overflow-hidden',
    'before:absolute before:inset-0',
    'before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
    'before:animate-[shimmer_2s_infinite]'
  ],
  {
    variants: {
      variant: {
        default: 'bg-muted',
        card: 'bg-card border border-border shadow-sm',
        text: 'bg-muted/80',
        avatar: 'rounded-full bg-muted',
        button: 'bg-muted rounded-lg',
        image: 'bg-muted aspect-video'
      },
      animation: {
        pulse: 'animate-pulse',
        shimmer: 'animate-pulse before:animate-[shimmer_2s_infinite]',
        wave: 'animate-pulse before:animate-[wave_2s_infinite]',
        none: ''
      },
      intensity: {
        subtle: 'opacity-60',
        normal: 'opacity-80',
        strong: 'opacity-100'
      }
    },
    defaultVariants: {
      variant: 'default',
      animation: 'shimmer',
      intensity: 'normal'
    }
  }
);

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface SkeletonProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof skeletonVariants> {
  readonly width?: string | number;
  readonly height?: string | number;
  readonly lines?: number;
  readonly aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  readonly ariaLabel?: string;
}

export interface SkeletonTextProps extends 
  React.HTMLAttributes<HTMLDivElement> {
  readonly lines?: number;
  readonly lastLineWidth?: string;
  readonly fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  readonly ariaLabel?: string;
}

export interface SkeletonCardProps extends 
  React.HTMLAttributes<HTMLDivElement> {
  readonly showAvatar?: boolean;
  readonly showImage?: boolean;
  readonly imageAspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  readonly textLines?: number;
  readonly showActions?: boolean;
  readonly ariaLabel?: string;
}

export interface SkeletonTableProps extends 
  React.HTMLAttributes<HTMLDivElement> {
  readonly columns?: number;
  readonly rows?: number;
  readonly showHeader?: boolean;
  readonly ariaLabel?: string;
}

export interface SkeletonListProps extends 
  React.HTMLAttributes<HTMLDivElement> {
  readonly items?: number;
  readonly showAvatar?: boolean;
  readonly showMeta?: boolean;
  readonly ariaLabel?: string;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const getAspectRatioClass = (aspectRatio?: string) => {
  switch (aspectRatio) {
    case 'square': return 'aspect-square';
    case 'video': return 'aspect-video';
    case 'portrait': return 'aspect-[3/4]';
    case 'landscape': return 'aspect-[4/3]';
    default: return '';
  }
};

const getFontSizeClass = (fontSize?: string) => {
  switch (fontSize) {
    case 'xs': return 'h-3';
    case 'sm': return 'h-4';
    case 'base': return 'h-5';
    case 'lg': return 'h-6';
    case 'xl': return 'h-7';
    default: return 'h-4';
  }
};

// =============================================================================
// SKELETON COMPONENTS
// =============================================================================

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(({
  className,
  variant,
  animation,
  intensity,
  width,
  height,
  lines = 1,
  aspectRatio,
  ariaLabel,
  style,
  ...props
}, ref) => {
  const inlineStyles = useMemo(() => ({
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style
  }), [width, height, style]);

  // For multi-line text skeletons
  if (lines > 1) {
    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
        role="status"
        aria-label={ariaLabel || 'Loading content'}
        {...props}
      >
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              skeletonVariants({ variant: 'text', animation, intensity }),
              'h-4',
              index === lines - 1 && lines > 2 && 'w-3/4' // Last line is shorter
            )}
          />
        ))}
        <span className="sr-only">Loading content...</span>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        skeletonVariants({ variant, animation, intensity }),
        aspectRatio && getAspectRatioClass(aspectRatio),
        className
      )}
      style={inlineStyles}
      role="status"
      aria-label={ariaLabel || 'Loading'}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
});

export const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(({
  className,
  lines = 3,
  lastLineWidth = '75%',
  fontSize = 'base',
  ariaLabel,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('space-y-3', className)}
    role="status"
    aria-label={ariaLabel || 'Loading text content'}
    {...props}
  >
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className={cn(
          skeletonVariants({ variant: 'text' }),
          getFontSizeClass(fontSize)
        )}
        style={{
          width: index === lines - 1 && lines > 1 ? lastLineWidth : '100%'
        }}
      />
    ))}
    <span className="sr-only">Loading text content...</span>
  </div>
));

export const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(({
  className,
  showAvatar = false,
  showImage = false,
  imageAspectRatio = 'video',
  textLines = 3,
  showActions = false,
  ariaLabel,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border border-border bg-card p-6 shadow-sm',
      className
    )}
    role="status"
    aria-label={ariaLabel || 'Loading card content'}
    {...props}
  >
    {/* Header with avatar */}
    {showAvatar && (
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton variant="avatar" width={40} height={40} />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" height={16} width="60%" />
          <Skeleton variant="text" height={14} width="40%" />
        </div>
      </div>
    )}
    
    {/* Image */}
    {showImage && (
      <Skeleton 
        variant="image" 
        aspectRatio={imageAspectRatio}
        className="mb-4"
      />
    )}
    
    {/* Text content */}
    <div className="space-y-3">
      {Array.from({ length: textLines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height={16}
          width={index === textLines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
    
    {/* Actions */}
    {showActions && (
      <div className="flex gap-3 mt-6 pt-4 border-t border-border">
        <Skeleton variant="button" height={40} width={100} />
        <Skeleton variant="button" height={40} width={80} />
      </div>
    )}
    
    <span className="sr-only">Loading card content...</span>
  </div>
));

export const SkeletonTable = React.forwardRef<HTMLDivElement, SkeletonTableProps>(({
  className,
  columns = 4,
  rows = 5,
  showHeader = true,
  ariaLabel,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(
      'w-full border border-border rounded-lg overflow-hidden bg-background',
      className
    )}
    role="status"
    aria-label={ariaLabel || 'Loading table data'}
    {...props}
  >
    {showHeader && (
      <div className="bg-muted/50 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} variant="text" height={18} />
          ))}
        </div>
      </div>
    )}
    
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                variant="text" 
                height={16}
                width={colIndex === 0 ? '80%' : '100%'}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
    
    <span className="sr-only">Loading table data...</span>
  </div>
));

export const SkeletonList = React.forwardRef<HTMLDivElement, SkeletonListProps>(({
  className,
  items = 5,
  showAvatar = true,
  showMeta = true,
  ariaLabel,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('divide-y divide-border', className)}
    role="status"
    aria-label={ariaLabel || 'Loading list items'}
    {...props}
  >
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4 py-4">
        {showAvatar && (
          <Skeleton variant="avatar" width={48} height={48} />
        )}
        
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" height={18} width="60%" />
          <Skeleton variant="text" height={14} width="40%" />
          
          {showMeta && (
            <div className="flex items-center gap-4 mt-2">
              <Skeleton variant="text" height={12} width={80} />
              <Skeleton variant="text" height={12} width={60} />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Skeleton variant="button" width={24} height={24} />
          <Skeleton variant="button" width={24} height={24} />
        </div>
      </div>
    ))}
    
    <span className="sr-only">Loading list items...</span>
  </div>
));

// Composed skeleton patterns for common use cases
export const SkeletonAvatar = React.forwardRef<HTMLDivElement, SkeletonProps>(({
  className,
  width = 40,
  height = 40,
  ...props
}, ref) => (
  <Skeleton 
    ref={ref}
    variant="avatar" 
    width={width} 
    height={height}
    className={className}
    {...props}
  />
));

export const SkeletonButton = React.forwardRef<HTMLDivElement, SkeletonProps>(({
  className,
  width = 100,
  height = 40,
  ...props
}, ref) => (
  <Skeleton 
    ref={ref}
    variant="button" 
    width={width} 
    height={height}
    className={className}
    {...props}
  />
));

export const SkeletonImage = React.forwardRef<HTMLDivElement, SkeletonProps>(({
  className,
  aspectRatio = 'video',
  ...props
}, ref) => (
  <Skeleton 
    ref={ref}
    variant="image" 
    aspectRatio={aspectRatio}
    className={className}
    {...props}
  />
));

// Complex skeleton patterns
export const SkeletonPost = React.forwardRef<HTMLDivElement, SkeletonCardProps>(({
  className,
  ...props
}, ref) => (
  <SkeletonCard
    ref={ref}
    showAvatar
    showImage
    textLines={4}
    showActions
    className={className}
    ariaLabel="Loading post content"
    {...props}
  />
));

export const SkeletonProfile = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('space-y-6', className)}
    role="status"
    aria-label="Loading profile"
    {...props}
  >
    {/* Profile header */}
    <div className="flex items-center space-x-6">
      <SkeletonAvatar width={80} height={80} />
      <div className="space-y-3 flex-1">
        <Skeleton variant="text" height={24} width="40%" />
        <Skeleton variant="text" height={16} width="60%" />
        <div className="flex gap-3">
          <SkeletonButton width={120} height={36} />
          <SkeletonButton width={100} height={36} />
        </div>
      </div>
    </div>
    
    {/* Profile stats */}
    <div className="grid grid-cols-3 gap-6 py-6 border-y border-border">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="text-center space-y-2">
          <Skeleton variant="text" height={28} width={60} className="mx-auto" />
          <Skeleton variant="text" height={16} width={80} className="mx-auto" />
        </div>
      ))}
    </div>
    
    {/* Profile content */}
    <SkeletonText lines={5} />
    
    <span className="sr-only">Loading profile...</span>
  </div>
));

// Display names for React DevTools
Skeleton.displayName = 'Skeleton';
SkeletonText.displayName = 'SkeletonText';
SkeletonCard.displayName = 'SkeletonCard';
SkeletonTable.displayName = 'SkeletonTable';
SkeletonList.displayName = 'SkeletonList';
SkeletonAvatar.displayName = 'SkeletonAvatar';
SkeletonButton.displayName = 'SkeletonButton';
SkeletonImage.displayName = 'SkeletonImage';
SkeletonPost.displayName = 'SkeletonPost';
SkeletonProfile.displayName = 'SkeletonProfile';

// Export types and variants
export type { VariantProps };
export { skeletonVariants };