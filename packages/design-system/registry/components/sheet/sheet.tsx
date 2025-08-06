import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { createPortal } from 'react-dom';
import { tokens } from '../../core/universal-tokens';

const overlayVariants = cva(
  'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
  {
    variants: {
      state: {
        closed: 'opacity-0 pointer-events-none',
        open: 'opacity-100',
      },
    },
  }
);

const sheetVariants = cva(
  'fixed z-50 bg-white shadow-xl transition-transform duration-300 ease-out',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 rounded-b-xl border-b translate-y-[-100%]',
        bottom: 'inset-x-0 bottom-0 rounded-t-xl border-t translate-y-full',
        left: 'inset-y-0 left-0 h-full w-3/4 sm:max-w-sm rounded-r-xl border-r translate-x-[-100%]',
        right: 'inset-y-0 right-0 h-full w-3/4 sm:max-w-sm rounded-l-xl border-l translate-x-full',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
        xl: '',
        full: '',
      },
      state: {
        closed: '',
        open: 'translate-x-0 translate-y-0',
      },
    },
    compoundVariants: [
      // Top/Bottom size variants
      {
        side: ['top', 'bottom'],
        size: 'sm',
        className: 'max-h-[33%]',
      },
      {
        side: ['top', 'bottom'],
        size: 'md',
        className: 'max-h-[50%]',
      },
      {
        side: ['top', 'bottom'],
        size: 'lg',
        className: 'max-h-[75%]',
      },
      {
        side: ['top', 'bottom'],
        size: 'xl',
        className: 'max-h-[90%]',
      },
      {
        side: ['top', 'bottom'],
        size: 'full',
        className: 'h-full',
      },
      // Left/Right size variants
      {
        side: ['left', 'right'],
        size: 'sm',
        className: 'max-w-xs',
      },
      {
        side: ['left', 'right'],
        size: 'md',
        className: 'max-w-sm',
      },
      {
        side: ['left', 'right'],
        size: 'lg',
        className: 'max-w-md',
      },
      {
        side: ['left', 'right'],
        size: 'xl',
        className: 'max-w-lg',
      },
      {
        side: ['left', 'right'],
        size: 'full',
        className: 'w-full',
      },
    ],
    defaultVariants: {
      side: 'right',
      size: 'md',
      state: 'closed',
    },
  }
);

interface SheetProps extends VariantProps<typeof sheetVariants> {
  readonly children: React.ReactNode;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly modal?: boolean;
  readonly className?: string;
  readonly overlayClassName?: string;
  readonly closeOnOverlayClick?: boolean;
  readonly closeOnEscape?: boolean;
  readonly preventScroll?: boolean;
}

export const Sheet = ({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  modal = true,
  className,
  overlayClassName,
  side,
  size,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  preventScroll = true,
}: SheetProps): JSX.Element => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [controlledOpen, onOpenChange]);

  const handleClose = useCallback(() => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && closeOnEscape && isOpen) {
      handleClose();
    }
  }, [isOpen, closeOnEscape, handleClose]);

  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      handleClose();
    }
  }, [closeOnOverlayClick, handleClose]);

  const handleFocusTrap = useCallback((event: KeyboardEvent) => {
    if (!isOpen || !sheetRef.current) return;

    const focusableElements = sheetRef.current.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      
      if (preventScroll) {
        document.body.style.overflow = 'hidden';
      }

      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keydown', handleFocusTrap);

      // Focus first focusable element
      setTimeout(() => {
        const firstFocusable = sheetRef.current?.querySelector(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        firstFocusable?.focus();
      }, 100);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keydown', handleFocusTrap);
        
        if (preventScroll) {
          document.body.style.overflow = '';
        }

        // Restore focus to previous element
        if (previousActiveElement.current instanceof HTMLElement) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, handleKeyDown, handleFocusTrap, preventScroll]);

  if (!isOpen) return <>{children}</>;

  return (
    <>
      {children}
      {createPortal(
        <div
          className={overlayVariants({ state: isOpen ? 'open' : 'closed', className: overlayClassName })}
          onClick={handleOverlayClick}
          aria-hidden="true"
        >
          <div
            ref={sheetRef}
            role={modal ? 'dialog' : undefined}
            aria-modal={modal}
            className={sheetVariants({ 
              side, 
              size, 
              state: isOpen ? 'open' : 'closed', 
              className 
            })}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {children}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

interface SheetTriggerProps {
  readonly children: React.ReactNode;
  readonly asChild?: boolean;
  readonly className?: string;
  readonly onClick?: () => void;
}

export const SheetTrigger = ({ 
  children, 
  asChild, 
  className,
  onClick 
}: SheetTriggerProps): JSX.Element => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        children.props.onClick?.(e);
        onClick?.();
      },
    });
  }

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center h-12 px-6 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-md ${className || ''}`}
    >
      {children}
    </button>
  );
};

interface SheetContentProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly side?: 'top' | 'bottom' | 'left' | 'right';
  readonly size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const SheetContent = ({ 
  children, 
  className,
  side = 'right',
  size = 'md'
}: SheetContentProps): JSX.Element => {
  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {children}
    </div>
  );
};

interface SheetHeaderProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export const SheetHeader = ({ children, className }: SheetHeaderProps): JSX.Element => {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className || ''}`}>
      {children}
    </div>
  );
};

interface SheetTitleProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export const SheetTitle = ({ children, className }: SheetTitleProps): JSX.Element => {
  return (
    <h2 className={`text-xl font-semibold text-gray-900 ${className || ''}`}>
      {children}
    </h2>
  );
};

interface SheetDescriptionProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export const SheetDescription = ({ children, className }: SheetDescriptionProps): JSX.Element => {
  return (
    <p className={`text-sm text-gray-600 mt-2 ${className || ''}`}>
      {children}
    </p>
  );
};

interface SheetBodyProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export const SheetBody = ({ children, className }: SheetBodyProps): JSX.Element => {
  return (
    <div className={`flex-1 overflow-y-auto px-6 py-4 ${className || ''}`}>
      {children}
    </div>
  );
};

interface SheetFooterProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export const SheetFooter = ({ children, className }: SheetFooterProps): JSX.Element => {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-4 ${className || ''}`}>
      {children}
    </div>
  );
};

interface SheetCloseProps {
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly onClick?: () => void;
  readonly asChild?: boolean;
}

export const SheetClose = ({ 
  children, 
  className, 
  onClick,
  asChild 
}: SheetCloseProps): JSX.Element => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        children.props.onClick?.(e);
        onClick?.();
      },
    });
  }

  return (
    <button
      onClick={onClick}
      className={`h-12 px-6 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${className || ''}`}
      aria-label={children ? undefined : 'Close sheet'}
    >
      {children || (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </button>
  );
};