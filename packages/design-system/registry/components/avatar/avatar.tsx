/**
 * Avatar Component - User Profile Images with Fallbacks
 * CLAUDE.md Compliant: Professional sizing and spacing
 * WCAG AAA: Proper alt text, fallbacks, and accessibility support
 * CVA: Class Variance Authority for consistent styling
 * Universal Tokens: Uses design system tokens for consistency
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { UserIcon } from '@heroicons/react/24/outline';
import { cn, getInitials } from '../../lib/utils';

const avatarVariants = cva(
  [
    'relative flex shrink-0 overflow-hidden',
    'bg-muted border border-border',
    'transition-all duration-200 ease-in-out'
  ],
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-12 w-12 text-base',    // Professional minimum size
        lg: 'h-14 w-14 text-lg',      // CLAUDE.md compliant
        xl: 'h-16 w-16 text-xl',      // Premium size
        '2xl': 'h-20 w-20 text-2xl',  // Extra large
        '3xl': 'h-24 w-24 text-3xl',  // Hero size
        '4xl': 'h-32 w-32 text-4xl'   // Massive size
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-lg',
        rounded: 'rounded-xl'
      },
      variant: {
        default: 'hover:shadow-md',
        elevated: 'shadow-md hover:shadow-lg',
        outline: 'border-2 border-primary',
        ghost: 'border-transparent',
        // NSM Security Classification variants
        nsmOpen: 'border-2 border-green-600 shadow-sm',
        nsmRestricted: 'border-2 border-yellow-600 shadow-sm',
        nsmConfidential: 'border-2 border-red-600 shadow-sm',
        nsmSecret: 'border-2 border-gray-800 shadow-sm'
      },
      status: {
        none: '',
        online: 'ring-2 ring-green-500',
        offline: 'ring-2 ring-gray-400',
        away: 'ring-2 ring-yellow-500',
        busy: 'ring-2 ring-red-500'
      }
    },
    defaultVariants: {
      size: 'lg',
      shape: 'circle',
      variant: 'default',
      status: 'none'
    }
  }
);

const avatarImageVariants = cva(
  [
    'aspect-square h-full w-full object-cover',
    'transition-opacity duration-200'
  ]
);

const avatarFallbackVariants = cva(
  [
    'flex h-full w-full items-center justify-center',
    'bg-muted font-medium text-muted-foreground',
    'transition-colors duration-200'
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        colored: 'bg-gradient-to-br from-blue-500 to-purple-600 text-white',
        muted: 'bg-muted text-muted-foreground',
        // NSM variants for fallbacks
        nsmOpen: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
        nsmRestricted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
        nsmConfidential: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
        nsmSecret: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

// Types
export interface AvatarProps extends 
  React.HTMLAttributes<HTMLSpanElement>,
  VariantProps<typeof avatarVariants> {
  readonly src?: string;
  readonly alt?: string;
  readonly name?: string;
  readonly loading?: boolean;
  readonly onLoadingStatusChange?: (loading: boolean) => void;
  readonly fallback?: React.ReactNode;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly showStatusIndicator?: boolean;
}

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  readonly onLoadingStatusChange?: (loading: boolean) => void;
}

export interface AvatarFallbackProps extends 
  React.HTMLAttributes<HTMLSpanElement>,
  VariantProps<typeof avatarFallbackVariants> {
  readonly delayMs?: number;
}

// Context for managing avatar state
interface AvatarContextType {
  imageLoadingStatus: 'idle' | 'loading' | 'loaded' | 'error';
  onImageLoadingStatusChange: (status: 'idle' | 'loading' | 'loaded' | 'error') => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  nsmVariant?: 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret';
}

const AvatarContext = React.createContext<AvatarContextType | null>(null);

function useAvatarContext(): AvatarContextType {
  const context = React.useContext(AvatarContext);
  if (!context) {
    throw new Error('Avatar components must be used within an Avatar');
  }
  return context;
}

// Main Avatar Component
export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ 
    className, 
    size = 'lg', 
    shape = 'circle',
    variant = 'default',
    status = 'none',
    src,
    alt,
    name,
    loading = false,
    onLoadingStatusChange,
    fallback,
    nsmClassification,
    showStatusIndicator = false,
    children,
    ...props 
  }, ref) => {
    const [imageLoadingStatus, setImageLoadingStatus] = React.useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
    
    // Auto-select NSM variant if classification is provided
    const finalVariant = nsmClassification 
      ? `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret'
      : variant;

    const handleImageLoadingStatusChange = React.useCallback((status: 'idle' | 'loading' | 'loaded' | 'error') => {
      setImageLoadingStatus(status);
      onLoadingStatusChange?.(status === 'loading');
    }, [onLoadingStatusChange]);

    const contextValue: AvatarContextType = {
      imageLoadingStatus,
      onImageLoadingStatusChange: handleImageLoadingStatusChange,
      size,
      nsmVariant: nsmClassification ? finalVariant as 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret' : undefined
    };

    // Status indicator position classes based on size
    const getStatusIndicatorClasses = () => {
      const sizeMap = {
        xs: 'h-2 w-2 -bottom-0.5 -right-0.5',
        sm: 'h-2.5 w-2.5 -bottom-0.5 -right-0.5',
        md: 'h-3 w-3 -bottom-1 -right-1',
        lg: 'h-3.5 w-3.5 -bottom-1 -right-1',
        xl: 'h-4 w-4 -bottom-1 -right-1',
        '2xl': 'h-5 w-5 -bottom-1.5 -right-1.5',
        '3xl': 'h-6 w-6 -bottom-2 -right-2',
        '4xl': 'h-8 w-8 -bottom-2 -right-2'
      };
      return sizeMap[size];
    };

    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
      none: ''
    };

    return (
      <AvatarContext.Provider value={contextValue}>
        <span
          ref={ref}
          className={cn(
            avatarVariants({ size, shape, variant: finalVariant, status: showStatusIndicator ? status : 'none' }),
            loading && 'animate-pulse',
            className
          )}
          data-state={imageLoadingStatus}
          {...props}
        >
          {/* Image or Children */}
          {src ? (
            <AvatarImage src={src} alt={alt || name || 'Avatar'} />
          ) : (
            children
          )}
          
          {/* Fallback - only shown when image fails or no src */}
          {(!src || imageLoadingStatus === 'error') && (
            <AvatarFallback>
              {fallback || (name ? getInitials(name) : <UserIcon className="h-1/2 w-1/2" />)}
            </AvatarFallback>
          )}

          {/* Status Indicator */}
          {showStatusIndicator && status !== 'none' && (
            <span 
              className={cn(
                'absolute rounded-full border-2 border-background',
                getStatusIndicatorClasses(),
                statusColors[status]
              )}
              aria-label={`Status: ${status}`}
            />
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          {/* NSM Classification for screen readers */}
          {nsmClassification && (
            <span className="sr-only">
              NSM-klassifisering: {nsmClassification}
            </span>
          )}
        </span>
      </AvatarContext.Provider>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Image Component
export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ 
    className, 
    onLoadingStatusChange,
    onLoad, 
    onError,
    ...props 
  }, ref) => {
    const { onImageLoadingStatusChange } = useAvatarContext();

    React.useEffect(() => {
      onImageLoadingStatusChange('loading');
    }, [onImageLoadingStatusChange]);

    const handleLoad = React.useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      onImageLoadingStatusChange('loaded');
      onLoadingStatusChange?.(false);
      onLoad?.(event);
    }, [onImageLoadingStatusChange, onLoadingStatusChange, onLoad]);

    const handleError = React.useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      onImageLoadingStatusChange('error');
      onLoadingStatusChange?.(false);
      onError?.(event);
    }, [onImageLoadingStatusChange, onLoadingStatusChange, onError]);

    return (
      <img
        ref={ref}
        className={cn(avatarImageVariants(), className)}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    );
  }
);

AvatarImage.displayName = 'AvatarImage';

// Avatar Fallback Component
export const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ 
    className, 
    variant = 'default',
    delayMs = 0,
    children,
    ...props 
  }, ref) => {
    const { imageLoadingStatus, nsmVariant } = useAvatarContext();
    const [canRender, setCanRender] = React.useState(delayMs === 0);

    React.useEffect(() => {
      if (delayMs > 0) {
        const timer = setTimeout(() => setCanRender(true), delayMs);
        return () => clearTimeout(timer);
      }
    }, [delayMs]);

    // Use NSM variant if available, otherwise use provided variant
    const finalVariant = nsmVariant || variant;

    if (!canRender) {
      return null;
    }

    return (
      <span
        ref={ref}
        className={cn(avatarFallbackVariants({ variant: finalVariant }), className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

AvatarFallback.displayName = 'AvatarFallback';

// Avatar Group Component for multiple avatars
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly max?: number;
  readonly spacing?: 'tight' | 'normal' | 'loose';
  readonly size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ 
    className, 
    max = 5, 
    spacing = 'normal',
    size = 'lg',
    children,
    ...props 
  }, ref) => {
    const childArray = React.Children.toArray(children);
    const visibleChildren = max ? childArray.slice(0, max) : childArray;
    const hiddenCount = max ? Math.max(0, childArray.length - max) : 0;

    const spacingClasses = {
      tight: '-space-x-2',
      normal: '-space-x-3',
      loose: '-space-x-1'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          spacingClasses[spacing],
          className
        )}
        {...props}
      >
        {visibleChildren.map((child, index) => (
          <div key={index} className="ring-2 ring-background">
            {React.isValidElement(child) 
              ? React.cloneElement(child, { size } as any)
              : child
            }
          </div>
        ))}
        
        {hiddenCount > 0 && (
          <Avatar size={size} variant="muted">
            <AvatarFallback variant="muted">
              +{hiddenCount}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

// Export variants and types
export { avatarVariants, avatarImageVariants, avatarFallbackVariants };
export type { VariantProps };