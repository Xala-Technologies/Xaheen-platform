/**
 * Dialog Component - Modal Dialogs and Overlays
 * CLAUDE.md Compliant: Professional sizing and accessibility standards
 * WCAG AAA: Focus management, ESC handling, backdrop click, and screen reader support
 * CVA: Class Variance Authority for consistent styling
 * Universal Tokens: Uses design system tokens for consistency
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

const dialogOverlayVariants = cva(
  [
    'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
  ]
);

const dialogContentVariants = cva(
  [
    'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
    'grid w-full gap-4 border bg-background p-6 shadow-lg',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
    'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
    'duration-200'
  ],
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl',
        full: 'max-w-[95vw] max-h-[95vh]'
      },
      variant: {
        default: 'rounded-lg border-border',
        elevated: 'rounded-xl border-border shadow-xl',
        alert: 'rounded-lg border-destructive/20 shadow-xl',
        // NSM Security Classification variants
        nsmOpen: 'rounded-lg border-l-4 border-l-green-600 border-border shadow-lg',
        nsmRestricted: 'rounded-lg border-l-4 border-l-yellow-600 border-border shadow-lg',
        nsmConfidential: 'rounded-lg border-l-4 border-l-red-600 border-border shadow-lg',
        nsmSecret: 'rounded-lg border-l-4 border-l-gray-800 border-border shadow-xl'
      }
    },
    defaultVariants: {
      size: 'md',
      variant: 'default'
    }
  }
);

const dialogHeaderVariants = cva(
  [
    'flex flex-col space-y-1.5 text-center sm:text-left'
  ]
);

const dialogFooterVariants = cva(
  [
    'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2'
  ]
);

const dialogTitleVariants = cva(
  [
    'text-lg font-semibold leading-none tracking-tight'
  ]
);

const dialogDescriptionVariants = cva(
  [
    'text-sm text-muted-foreground'
  ]
);

// Types
export interface DialogProps {
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly modal?: boolean;
  readonly children: React.ReactNode;
}

export interface DialogContentProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof dialogContentVariants> {
  readonly onEscapeKeyDown?: (event: KeyboardEvent) => void;
  readonly onPointerDownOutside?: (event: PointerEvent) => void;
  readonly onInteractOutside?: (event: Event) => void;
  readonly forceMount?: boolean;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly asChild?: boolean;
}

// Context for dialog state management
interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modal: boolean;
}

const DialogContext = React.createContext<DialogContextType | null>(null);

function useDialog(): DialogContextType {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a Dialog');
  }
  return context;
}

// Portal component for rendering outside DOM tree
const Portal: React.FC<{ children: React.ReactNode; container?: HTMLElement }> = ({ 
  children, 
  container 
}) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const target = container || document.body;
  return target ? React.createPortal(children, target) : null;
};

// Main Dialog Component
export const Dialog: React.FC<DialogProps> = ({ 
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  modal = true,
  children 
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [isControlled, onOpenChange]);

  const contextValue: DialogContextType = {
    open,
    onOpenChange: handleOpenChange,
    modal
  };

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  );
};

Dialog.displayName = 'Dialog';

// Dialog Trigger Component
export const DialogTrigger: React.FC<{ 
  children: React.ReactNode;
  asChild?: boolean;
}> = ({ children, asChild = false }) => {
  const { onOpenChange } = useDialog();

  const handleClick = React.useCallback(() => {
    onOpenChange(true);
  }, [onOpenChange]);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...children.props,
      onClick: (event: React.MouseEvent) => {
        children.props.onClick?.(event);
        if (!event.defaultPrevented) {
          handleClick();
        }
      }
    });
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
};

DialogTrigger.displayName = 'DialogTrigger';

// Dialog Portal Component
export const DialogPortal: React.FC<{
  children: React.ReactNode;
  container?: HTMLElement;
  forceMount?: boolean;
}> = ({ children, container, forceMount }) => {
  const { open } = useDialog();

  if (!forceMount && !open) {
    return null;
  }

  return (
    <Portal container={container}>
      {children}
    </Portal>
  );
};

DialogPortal.displayName = 'DialogPortal';

// Dialog Overlay Component
export const DialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { open } = useDialog();

    return (
      <div
        ref={ref}
        className={cn(dialogOverlayVariants(), className)}
        data-state={open ? 'open' : 'closed'}
        {...props}
      />
    );
  }
);

DialogOverlay.displayName = 'DialogOverlay';

// Dialog Content Component
export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ 
    className, 
    size = 'md',
    variant = 'default',
    children,
    onEscapeKeyDown,
    onPointerDownOutside,
    onInteractOutside,
    nsmClassification,
    ...props 
  }, ref) => {
    const { open, onOpenChange, modal } = useDialog();
    const contentRef = React.useRef<HTMLDivElement>(null);
    
    // Auto-select NSM variant if classification is provided
    const finalVariant = nsmClassification 
      ? `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret'
      : variant;

    // Focus management
    React.useEffect(() => {
      if (open && contentRef.current) {
        const focusableElement = contentRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        
        if (focusableElement) {
          focusableElement.focus();
        } else {
          contentRef.current.focus();
        }
      }
    }, [open]);

    // Escape key handler
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onEscapeKeyDown?.(event);
          if (!event.defaultPrevented) {
            onOpenChange(false);
          }
        }
      };

      if (open) {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }
    }, [open, onEscapeKeyDown, onOpenChange]);

    // Outside click handler
    React.useEffect(() => {
      const handlePointerDown = (event: PointerEvent) => {
        if (
          modal &&
          contentRef.current &&
          !contentRef.current.contains(event.target as Node)
        ) {
          onPointerDownOutside?.(event);
          onInteractOutside?.(event);
          
          if (!event.defaultPrevented) {
            onOpenChange(false);
          }
        }
      };

      if (open) {
        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
      }
    }, [open, modal, onPointerDownOutside, onInteractOutside, onOpenChange]);

    // Prevent scrolling when dialog is open
    React.useEffect(() => {
      if (open && modal) {
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = '';
        };
      }
    }, [open, modal]);

    if (!open) return null;

    return (
      <DialogPortal forceMount>
        <DialogOverlay />
        <div
          ref={contentRef}
          role="dialog"
          aria-modal={modal}
          aria-describedby="dialog-description"
          aria-labelledby="dialog-title"
          tabIndex={-1}
          className={cn(
            dialogContentVariants({ size, variant: finalVariant }),
            className
          )}
          data-state={open ? 'open' : 'closed'}
          {...props}
        >
          {children}

          {/* NSM Classification for screen readers */}
          {nsmClassification && (
            <span className="sr-only">
              NSM-klassifisering: {nsmClassification}
            </span>
          )}
        </div>
      </DialogPortal>
    );
  }
);

DialogContent.displayName = 'DialogContent';

// Dialog Header Component
export const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(dialogHeaderVariants(), className)}
      {...props}
    />
  )
);

DialogHeader.displayName = 'DialogHeader';

// Dialog Footer Component
export const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(dialogFooterVariants(), className)}
      {...props}
    />
  )
);

DialogFooter.displayName = 'DialogFooter';

// Dialog Title Component
export const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      id="dialog-title"
      className={cn(dialogTitleVariants(), className)}
      {...props}
    />
  )
);

DialogTitle.displayName = 'DialogTitle';

// Dialog Description Component
export const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      id="dialog-description"
      className={cn(dialogDescriptionVariants(), className)}
      {...props}
    />
  )
);

DialogDescription.displayName = 'DialogDescription';

// Dialog Close Component
export const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ className, children, asChild = false, onClick, ...props }, ref) => {
    const { onOpenChange } = useDialog();

    const handleClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        onOpenChange(false);
      }
    }, [onClick, onOpenChange]);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...children.props,
        onClick: handleClick
      });
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'absolute right-4 top-4 rounded-sm opacity-70',
          'ring-offset-background transition-opacity',
          'hover:opacity-100 focus:outline-none focus:ring-2',
          'focus:ring-ring focus:ring-offset-2',
          'disabled:pointer-events-none',
          'data-[state=open]:bg-accent data-[state=open]:text-muted-foreground',
          className
        )}
        onClick={handleClick}
        aria-label="Lukk"
        {...props}
      >
        {children || <XMarkIcon className="h-4 w-4" />}
      </button>
    );
  }
);

DialogClose.displayName = 'DialogClose';

// Confirmation Dialog Component
export interface ConfirmationDialogProps extends Omit<DialogProps, 'children'> {
  readonly title?: string;
  readonly description?: string;
  readonly confirmText?: string;
  readonly cancelText?: string;
  readonly variant?: 'default' | 'destructive';
  readonly onConfirm?: () => void;
  readonly onCancel?: () => void;
  readonly loading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  title = 'Er du sikker?',
  description = 'Denne handlingen kan ikke angres.',
  confirmText = 'Bekreft',
  cancelText = 'Avbryt',
  variant = 'default',
  onConfirm,
  onCancel,
  loading = false,
  ...dialogProps
}) => {
  return (
    <Dialog {...dialogProps}>
      <DialogContent variant={variant === 'destructive' ? 'alert' : 'default'}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <button
              type="button"
              onClick={onCancel}
              className="h-12 px-6 rounded-lg border border-border bg-background hover:bg-accent transition-colors"
            >
              {cancelText}
            </button>
          </DialogClose>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'h-12 px-6 rounded-lg font-medium transition-colors',
              variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90',
              loading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {loading ? 'Behandler...' : confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

ConfirmationDialog.displayName = 'ConfirmationDialog';

// Export variants and types
export { 
  dialogOverlayVariants, 
  dialogContentVariants, 
  dialogHeaderVariants, 
  dialogFooterVariants,
  dialogTitleVariants,
  dialogDescriptionVariants 
};
export type { VariantProps };