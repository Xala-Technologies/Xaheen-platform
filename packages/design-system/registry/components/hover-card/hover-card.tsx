import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { createPortal } from 'react-dom';
import { tokens } from '../../core/universal-tokens';

const hoverCardVariants = cva(
  'absolute z-50 min-w-[8rem] overflow-hidden rounded-xl bg-white text-gray-900 shadow-lg border border-gray-200 outline-none transition-all duration-200',
  {
    variants: {
      placement: {
        top: 'bottom-full mb-2',
        bottom: 'top-full mt-2',
        left: 'right-full mr-2',
        right: 'left-full ml-2',
        'top-start': 'bottom-full mb-2 left-0',
        'top-end': 'bottom-full mb-2 right-0',
        'bottom-start': 'top-full mt-2 left-0',
        'bottom-end': 'top-full mt-2 right-0',
      },
      size: {
        sm: 'max-w-xs',
        md: 'max-w-sm',
        lg: 'max-w-md',
        xl: 'max-w-lg',
      },
      state: {
        closed: 'opacity-0 scale-95 pointer-events-none',
        open: 'opacity-100 scale-100',
      },
    },
    defaultVariants: {
      placement: 'bottom',
      size: 'md',
      state: 'closed',
    },
  }
);

interface HoverCardProps extends VariantProps<typeof hoverCardVariants> {
  readonly children: React.ReactNode;
  readonly trigger: React.ReactNode;
  readonly content: React.ReactNode;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly openDelay?: number;
  readonly closeDelay?: number;
  readonly className?: string;
  readonly contentClassName?: string;
  readonly side?: 'top' | 'bottom' | 'left' | 'right';
  readonly sideOffset?: number;
  readonly align?: 'start' | 'center' | 'end';
  readonly alignOffset?: number;
  readonly avoidCollisions?: boolean;
  readonly collisionBoundary?: Element | null;
  readonly collisionPadding?: number;
  readonly arrow?: boolean;
  readonly arrowClassName?: string;
}

export const HoverCard = ({
  children,
  trigger,
  content,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  openDelay = 700,
  closeDelay = 300,
  className,
  contentClassName,
  placement,
  size,
  side = 'bottom',
  sideOffset = 0,
  align = 'center',
  alignOffset = 0,
  avoidCollisions = true,
  collisionBoundary,
  collisionPadding = 8,
  arrow = false,
  arrowClassName,
}: HoverCardProps): JSX.Element => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const [isVisible, setIsVisible] = useState(false);
  
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const openTimeoutRef = useRef<NodeJS.Timeout>();
  const closeTimeoutRef = useRef<NodeJS.Timeout>();
  const isHoveringTrigger = useRef(false);
  const isHoveringContent = useRef(false);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [controlledOpen, onOpenChange]);

  const scheduleOpen = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    
    if (!isOpen) {
      openTimeoutRef.current = setTimeout(() => {
        handleOpenChange(true);
        setIsVisible(true);
      }, openDelay);
    }
  }, [isOpen, openDelay, handleOpenChange]);

  const scheduleClose = useCallback(() => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }
    
    closeTimeoutRef.current = setTimeout(() => {
      if (!isHoveringTrigger.current && !isHoveringContent.current) {
        handleOpenChange(false);
        setTimeout(() => setIsVisible(false), 200);
      }
    }, closeDelay);
  }, [closeDelay, handleOpenChange]);

  const handleTriggerEnter = useCallback(() => {
    isHoveringTrigger.current = true;
    scheduleOpen();
  }, [scheduleOpen]);

  const handleTriggerLeave = useCallback(() => {
    isHoveringTrigger.current = false;
    scheduleClose();
  }, [scheduleClose]);

  const handleContentEnter = useCallback(() => {
    isHoveringContent.current = true;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  }, []);

  const handleContentLeave = useCallback(() => {
    isHoveringContent.current = false;
    scheduleClose();
  }, [scheduleClose]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !contentRef.current || !isVisible) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;

    // Calculate base position based on side and align
    switch (side) {
      case 'top':
        top = triggerRect.top - contentRect.height - sideOffset;
        left = align === 'start' 
          ? triggerRect.left + alignOffset
          : align === 'end'
          ? triggerRect.right - contentRect.width - alignOffset
          : triggerRect.left + (triggerRect.width - contentRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + sideOffset;
        left = align === 'start' 
          ? triggerRect.left + alignOffset
          : align === 'end'
          ? triggerRect.right - contentRect.width - alignOffset
          : triggerRect.left + (triggerRect.width - contentRect.width) / 2;
        break;
      case 'left':
        top = align === 'start'
          ? triggerRect.top + alignOffset
          : align === 'end'
          ? triggerRect.bottom - contentRect.height - alignOffset
          : triggerRect.top + (triggerRect.height - contentRect.height) / 2;
        left = triggerRect.left - contentRect.width - sideOffset;
        break;
      case 'right':
        top = align === 'start'
          ? triggerRect.top + alignOffset
          : align === 'end'
          ? triggerRect.bottom - contentRect.height - alignOffset
          : triggerRect.top + (triggerRect.height - contentRect.height) / 2;
        left = triggerRect.right + sideOffset;
        break;
    }

    // Apply collision detection
    if (avoidCollisions) {
      const padding = collisionPadding;

      // Check horizontal collisions
      if (left < padding) {
        left = padding;
      } else if (left + contentRect.width > viewportWidth - padding) {
        left = viewportWidth - contentRect.width - padding;
      }

      // Check vertical collisions
      if (top < padding) {
        top = padding;
      } else if (top + contentRect.height > viewportHeight - padding) {
        top = viewportHeight - contentRect.height - padding;
      }
    }

    contentRef.current.style.top = `${top}px`;
    contentRef.current.style.left = `${left}px`;
  }, [side, align, sideOffset, alignOffset, avoidCollisions, collisionPadding, isVisible]);

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isVisible, updatePosition]);

  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const triggerElement = React.isValidElement(trigger) ? (
    React.cloneElement(trigger, {
      ref: triggerRef,
      onMouseEnter: (e: React.MouseEvent) => {
        trigger.props.onMouseEnter?.(e);
        handleTriggerEnter();
      },
      onMouseLeave: (e: React.MouseEvent) => {
        trigger.props.onMouseLeave?.(e);
        handleTriggerLeave();
      },
      onFocus: (e: React.FocusEvent) => {
        trigger.props.onFocus?.(e);
        handleTriggerEnter();
      },
      onBlur: (e: React.FocusEvent) => {
        trigger.props.onBlur?.(e);
        handleTriggerLeave();
      },
      'aria-describedby': isOpen ? 'hover-card-content' : undefined,
    })
  ) : (
    <span
      ref={triggerRef as React.RefObject<HTMLSpanElement>}
      onMouseEnter={handleTriggerEnter}
      onMouseLeave={handleTriggerLeave}
      onFocus={handleTriggerEnter}
      onBlur={handleTriggerLeave}
      className="inline-block"
      tabIndex={0}
    >
      {trigger}
    </span>
  );

  return (
    <>
      {triggerElement}
      {children}
      {isVisible && createPortal(
        <div
          ref={contentRef}
          id="hover-card-content"
          role="tooltip"
          onMouseEnter={handleContentEnter}
          onMouseLeave={handleContentLeave}
          className={hoverCardVariants({ 
            placement, 
            size, 
            state: isOpen ? 'open' : 'closed',
            className: contentClassName 
          })}
          style={{
            position: 'fixed',
            zIndex: 9999,
          }}
        >
          {arrow && (
            <div
              className={`absolute h-2 w-2 rotate-45 bg-white border-l border-t border-gray-200 ${arrowClassName || ''}`}
              style={{
                [side === 'top' ? 'bottom' : side === 'bottom' ? 'top' : side === 'left' ? 'right' : 'left']: '-4px',
                [side === 'top' || side === 'bottom' ? 'left' : 'top']: '50%',
                transform: side === 'top' || side === 'bottom' 
                  ? 'translateX(-50%) rotate(45deg)' 
                  : 'translateY(-50%) rotate(45deg)',
              }}
            />
          )}
          <div className="relative p-4">
            {content}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

interface HoverCardTriggerProps {
  readonly children: React.ReactNode;
  readonly asChild?: boolean;
  readonly className?: string;
}

export const HoverCardTrigger = ({ 
  children, 
  asChild, 
  className 
}: HoverCardTriggerProps): JSX.Element => {
  if (asChild && React.isValidElement(children)) {
    return children;
  }

  return (
    <span className={`inline-block cursor-pointer ${className || ''}`}>
      {children}
    </span>
  );
};

interface HoverCardContentProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly side?: 'top' | 'bottom' | 'left' | 'right';
  readonly align?: 'start' | 'center' | 'end';
  readonly sideOffset?: number;
  readonly alignOffset?: number;
}

export const HoverCardContent = ({ 
  children, 
  className,
  side,
  align,
  sideOffset,
  alignOffset 
}: HoverCardContentProps): JSX.Element => {
  return <>{children}</>;
};

interface HoverCardArrowProps {
  readonly className?: string;
  readonly width?: number;
  readonly height?: number;
}

export const HoverCardArrow = ({ 
  className, 
  width = 10, 
  height = 5 
}: HoverCardArrowProps): JSX.Element => {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
    >
      <polygon
        points={`0,${height} ${width / 2},0 ${width},${height}`}
        fill="currentColor"
      />
    </svg>
  );
};