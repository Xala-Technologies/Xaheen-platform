/**
 * Electron Card Implementation
 * Enhanced React card with Electron-specific features
 */

import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// =============================================================================
// ELECTRON API TYPES
// =============================================================================

interface ElectronAPI {
  readonly showContextMenu: (options: ContextMenuOptions) => void;
  readonly getCurrentWindow: () => {
    readonly isMaximized: () => boolean;
    readonly minimize: () => void;
    readonly maximize: () => void;
    readonly close: () => void;
  };
  readonly getPlatform: () => 'darwin' | 'win32' | 'linux';
  readonly setWindowOpacity: (opacity: number) => void;
  readonly dragWindow: () => void;
}

interface ContextMenuOptions {
  readonly items: Array<{
    readonly label: string;
    readonly click?: () => void;
    readonly type?: 'normal' | 'separator';
    readonly enabled?: boolean;
  }>;
}

declare global {
  interface Window {
    readonly electronAPI?: ElectronAPI;
  }
}

// =============================================================================
// VARIANT DEFINITIONS
// =============================================================================

const cardVariants = cva(
  [
    'rounded-xl bg-card text-card-foreground transition-all duration-200',
    'relative overflow-hidden'
  ],
  {
    variants: {
      variant: {
        default: [
          'border border-border',
          'shadow-md hover:shadow-lg'
        ],
        outlined: [
          'border-2 border-border',
          'shadow-none hover:shadow-md'
        ],
        filled: [
          'border-0 bg-muted',
          'shadow-none'
        ],
        elevated: [
          'border-0',
          'shadow-lg hover:shadow-xl'
        ],
        glass: [
          'border border-white/20',
          'bg-white/10 backdrop-blur-md',
          'shadow-xl'
        ]
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10'
      },
      hoverable: {
        true: [
          'cursor-pointer',
          'hover:scale-[1.02]',
          'active:scale-[0.98]'
        ]
      },
      draggable: {
        true: 'cursor-move'
      },
      platform: {
        darwin: 'backdrop-saturate-150',
        win32: '',
        linux: ''
      }
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md'
    }
  }
);

// =============================================================================
// COMPONENT INTERFACE
// =============================================================================

export interface ElectronCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Card header content
   */
  readonly header?: React.ReactNode;
  
  /**
   * Card footer content
   */
  readonly footer?: React.ReactNode;
  
  /**
   * Enable window dragging when clicking on card
   */
  readonly windowDraggable?: boolean;
  
  /**
   * Enable native context menu
   */
  readonly nativeContextMenu?: boolean;
  
  /**
   * Context menu items
   */
  readonly contextMenuItems?: Array<{
    readonly label: string;
    readonly onClick?: () => void;
  }>;
  
  /**
   * Enable glassmorphism effect (requires transparent window)
   */
  readonly glassmorphism?: boolean;
  
  /**
   * Loading state
   */
  readonly loading?: boolean;
  
  /**
   * Platform-specific styling override
   */
  readonly platformOverride?: 'darwin' | 'win32' | 'linux' | 'auto';
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse', className)}>
    <div className="h-4 bg-muted rounded w-3/4 mb-4" />
    <div className="space-y-2">
      <div className="h-3 bg-muted rounded" />
      <div className="h-3 bg-muted rounded w-5/6" />
    </div>
  </div>
);

// =============================================================================
// MAIN ELECTRON CARD COMPONENT
// =============================================================================

export const ElectronCard = forwardRef<HTMLDivElement, ElectronCardProps>(
  (
    {
      className,
      variant,
      padding,
      hoverable,
      draggable,
      header,
      footer,
      children,
      windowDraggable = false,
      nativeContextMenu = false,
      contextMenuItems = [],
      glassmorphism = false,
      loading = false,
      platformOverride = 'auto',
      onClick,
      onContextMenu,
      onMouseDown,
      ...props
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = useState(false);
    
    // Detect platform
    const platform = platformOverride === 'auto' 
      ? (window.electronAPI?.getPlatform() || 'darwin')
      : platformOverride;
    
    // Determine variant
    const effectiveVariant = glassmorphism ? 'glass' : variant;
    const effectiveDraggable = windowDraggable ? true : draggable;

    // Handle window dragging
    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (windowDraggable && window.electronAPI) {
        e.preventDefault();
        setIsDragging(true);
        window.electronAPI.dragWindow();
      }
      onMouseDown?.(e);
    }, [windowDraggable, onMouseDown]);

    // Handle context menu
    const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (nativeContextMenu && window.electronAPI && contextMenuItems.length > 0) {
        e.preventDefault();
        window.electronAPI.showContextMenu({
          items: contextMenuItems.map(item => ({
            label: item.label,
            click: item.onClick,
            type: 'normal' as const
          }))
        });
      }
      onContextMenu?.(e);
    }, [nativeContextMenu, contextMenuItems, onContextMenu]);

    // Release dragging state
    useEffect(() => {
      if (isDragging) {
        const handleMouseUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
      }
    }, [isDragging]);

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({
            variant: effectiveVariant,
            padding: header || footer ? 'none' : padding,
            hoverable,
            draggable: effectiveDraggable,
            platform
          }),
          isDragging && 'opacity-80',
          className
        )}
        onClick={onClick}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
        role={hoverable || onClick ? 'button' : undefined}
        tabIndex={hoverable || onClick ? 0 : undefined}
        {...props}
      >
        {/* Header */}
        {header && (
          <div 
            className={cn(
              'border-b border-border',
              padding === 'sm' && 'px-4 py-3',
              padding === 'md' && 'px-6 py-4',
              padding === 'lg' && 'px-8 py-5',
              padding === 'xl' && 'px-10 py-6',
              (!padding || padding === 'none') && 'px-6 py-4'
            )}
          >
            {loading ? <CardSkeleton className="h-6" /> : header}
          </div>
        )}

        {/* Body */}
        <div 
          className={cn(
            header || footer ? (
              padding === 'sm' && 'px-4 py-3',
              padding === 'md' && 'px-6 py-4',
              padding === 'lg' && 'px-8 py-5',
              padding === 'xl' && 'px-10 py-6',
              (!padding || padding === 'none') && 'px-6 py-4'
            ) : undefined
          )}
        >
          {loading ? <CardSkeleton /> : children}
        </div>

        {/* Footer */}
        {footer && (
          <div 
            className={cn(
              'border-t border-border',
              padding === 'sm' && 'px-4 py-3',
              padding === 'md' && 'px-6 py-4',
              padding === 'lg' && 'px-8 py-5',
              padding === 'xl' && 'px-10 py-6',
              (!padding || padding === 'none') && 'px-6 py-4'
            )}
          >
            {loading ? <CardSkeleton className="h-5" /> : footer}
          </div>
        )}

        {/* Glassmorphism overlay effect */}
        {glassmorphism && platform === 'darwin' && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 pointer-events-none" />
        )}
      </div>
    );
  }
);

ElectronCard.displayName = 'ElectronCard';

// =============================================================================
// CARD SUBCOMPONENTS
// =============================================================================

export const CardHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children
}) => (
  <div className={cn('text-lg font-semibold', className)}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children
}) => (
  <h3 className={cn('text-xl font-bold tracking-tight', className)}>
    {children}
  </h3>
);

export const CardDescription: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children
}) => (
  <p className={cn('text-sm text-muted-foreground', className)}>
    {children}
  </p>
);

export const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children
}) => (
  <div className={cn('', className)}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children
}) => (
  <div className={cn('flex items-center gap-4', className)}>
    {children}
  </div>
);

// =============================================================================
// COMPONENT METADATA
// =============================================================================

export const ElectronCardMeta = {
  id: 'electron-card',
  name: 'ElectronCard',
  platform: 'electron',
  baseComponent: 'card',
  category: 'molecule',
  description: 'Enhanced card with Electron-specific features like window dragging and glassmorphism',
  
  // Electron-specific features
  electronFeatures: [
    'Window dragging support',
    'Native context menus',
    'Glassmorphism effect',
    'Platform-specific styling',
    'Loading skeletons'
  ],
  
  // Accessibility features
  accessibility: {
    wcagLevel: 'AAA' as const,
    features: [
      'Semantic HTML structure',
      'Keyboard navigation',
      'Screen reader support',
      'Focus management',
      'ARIA attributes'
    ]
  },
  
  // Usage examples
  examples: {
    basic: `
<ElectronCard>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    Your content here
  </CardContent>
</ElectronCard>`,
    windowDraggable: `
<ElectronCard windowDraggable variant="glass">
  <CardTitle>Draggable Window Area</CardTitle>
  <CardDescription>Click and drag to move the window</CardDescription>
</ElectronCard>`,
    withContextMenu: `
<ElectronCard 
  nativeContextMenu
  contextMenuItems={[
    { label: 'Edit', onClick: handleEdit },
    { label: 'Delete', onClick: handleDelete }
  ]}
>
  Right-click for options
</ElectronCard>`,
    glassmorphism: `
<ElectronCard glassmorphism>
  <CardTitle>Glassmorphic Card</CardTitle>
  <CardDescription>Beautiful frosted glass effect</CardDescription>
</ElectronCard>`
  }
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type ElectronCardVariant = VariantProps<typeof cardVariants>['variant'];
export type ElectronCardPadding = VariantProps<typeof cardVariants>['padding'];

// Default export for compatibility
export default ElectronCard;