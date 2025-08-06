import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { createPortal } from 'react-dom';
import { tokens } from '../../core/universal-tokens';

const popoverVariants = cva(
  'absolute z-50 min-w-[8rem] overflow-hidden rounded-xl bg-white text-gray-900 shadow-lg outline-none transition-all',
  {
    variants: {
      placement: {
        top: 'bottom-full mb-2',
        bottom: 'top-full mt-2',
        left: 'right-full mr-2',
        right: 'left-full ml-2',
        'top-start': 'bottom-full mb-2 right-0',
        'top-end': 'bottom-full mb-2 left-0',
        'bottom-start': 'top-full mt-2 left-0',
        'bottom-end': 'top-full mt-2 right-0',
      },
      size: {
        sm: 'max-w-xs',
        md: 'max-w-sm',
        lg: 'max-w-md',
        xl: 'max-w-lg',
        full: 'max-w-full',
      },
    },
    defaultVariants: {
      placement: 'bottom',
      size: 'md',
    },
  }
);

interface PopoverProps extends VariantProps<typeof popoverVariants> {
  readonly children: React.ReactNode;
  readonly trigger: React.ReactNode;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly modal?: boolean;
  readonly className?: string;
  readonly triggerAsChild?: boolean;
  readonly offset?: number;
  readonly sideOffset?: number;
  readonly align?: 'start' | 'center' | 'end';
  readonly alignOffset?: number;
  readonly avoidCollisions?: boolean;
  readonly collisionBoundary?: Element | null;
  readonly collisionPadding?: number | { top?: number; right?: number; bottom?: number; left?: number };
  readonly sticky?: 'partial' | 'always';
}

export const Popover = ({
  children,
  trigger,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  modal = false,
  className,
  triggerAsChild = false,
  placement,
  size,
  offset = 0,
  sideOffset = 0,
  align = 'center',
  alignOffset = 0,
  avoidCollisions = true,
  collisionBoundary,
  collisionPadding = 8,
  sticky = 'partial',
}: PopoverProps): JSX.Element => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const triggerRef = useRef<HTMLElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [controlledOpen, onOpenChange]);

  const handleTriggerClick = useCallback(() => {
    handleOpenChange(!isOpen);
  }, [isOpen, handleOpenChange]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      handleOpenChange(false);
    }
  }, [isOpen, handleOpenChange]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (!modal) return;
    
    const target = event.target as Node;
    if (
      popoverRef.current &&
      !popoverRef.current.contains(target) &&
      triggerRef.current &&
      !triggerRef.current.contains(target)
    ) {
      handleOpenChange(false);
    }
  }, [modal, handleOpenChange]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, handleKeyDown, handleClickOutside]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !popoverRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;

    // Calculate base position based on placement
    switch (placement) {
      case 'top':
        top = triggerRect.top - popoverRect.height - sideOffset;
        left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + sideOffset;
        left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
        left = triggerRect.left - popoverRect.width - sideOffset;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
        left = triggerRect.right + sideOffset;
        break;
      case 'top-start':
        top = triggerRect.top - popoverRect.height - sideOffset;
        left = triggerRect.left + alignOffset;
        break;
      case 'top-end':
        top = triggerRect.top - popoverRect.height - sideOffset;
        left = triggerRect.right - popoverRect.width - alignOffset;
        break;
      case 'bottom-start':
        top = triggerRect.bottom + sideOffset;
        left = triggerRect.left + alignOffset;
        break;
      case 'bottom-end':
        top = triggerRect.bottom + sideOffset;
        left = triggerRect.right - popoverRect.width - alignOffset;
        break;
      default:
        top = triggerRect.bottom + sideOffset;
        left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
    }

    // Apply collision detection
    if (avoidCollisions) {
      const padding = typeof collisionPadding === 'number' 
        ? { top: collisionPadding, right: collisionPadding, bottom: collisionPadding, left: collisionPadding }
        : { top: 0, right: 0, bottom: 0, left: 0, ...collisionPadding };

      // Check horizontal collisions
      if (left < padding.left) {
        left = padding.left;
      } else if (left + popoverRect.width > viewportWidth - padding.right) {
        left = viewportWidth - popoverRect.width - padding.right;
      }

      // Check vertical collisions
      if (top < padding.top) {
        top = padding.top;
      } else if (top + popoverRect.height > viewportHeight - padding.bottom) {
        top = viewportHeight - popoverRect.height - padding.bottom;
      }
    }

    popoverRef.current.style.top = `${top}px`;
    popoverRef.current.style.left = `${left}px`;
  }, [placement, sideOffset, alignOffset, avoidCollisions, collisionPadding]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isOpen, updatePosition]);

  const triggerElement = triggerAsChild ? (
    React.cloneElement(trigger as React.ReactElement, {
      ref: triggerRef,
      onClick: handleTriggerClick,
      'aria-haspopup': 'dialog',
      'aria-expanded': isOpen,
      'aria-controls': 'popover-content',
    })
  ) : (
    <button
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      onClick={handleTriggerClick}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls="popover-content"
      className="inline-flex items-center justify-center"
    >
      {trigger}
    </button>
  );

  return (
    <>
      {triggerElement}
      {isOpen && createPortal(
        <div
          ref={popoverRef}
          id="popover-content"
          role="dialog"
          aria-modal={modal}
          className={popoverVariants({ placement, size, className })}
          style={{
            position: 'fixed',
            opacity: 0,
            transform: 'scale(0.95)',
            animation: 'popover-in 150ms ease-out forwards',
          }}
        >
          {children}
        </div>,
        document.body
      )}
      <style jsx>{`
        @keyframes popover-in {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

interface PopoverTriggerProps {
  readonly children: React.ReactNode;
  readonly asChild?: boolean;
  readonly className?: string;
}

export const PopoverTrigger = ({ children, asChild, className }: PopoverTriggerProps): JSX.Element => {
  return <>{children}</>;
};

interface PopoverContentProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export const PopoverContent = ({ children, className }: PopoverContentProps): JSX.Element => {
  return (
    <div className={`p-4 ${className || ''}`}>
      {children}
    </div>
  );
};

interface PopoverHeaderProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export const PopoverHeader = ({ children, className }: PopoverHeaderProps): JSX.Element => {
  return (
    <div className={`mb-4 ${className || ''}`}>
      {children}
    </div>
  );
};

interface PopoverCloseProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly onClick?: () => void;
}

export const PopoverClose = ({ children, className, onClick }: PopoverCloseProps): JSX.Element => {
  return (
    <button
      onClick={onClick}
      className={`absolute right-4 top-4 h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors ${className || ''}`}
      aria-label="Close popover"
    >
      {children}
    </button>
  );
};