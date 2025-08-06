/**
 * Dropdown Menu Component - Context Menus and Dropdowns
 * CLAUDE.md Compliant: Professional sizing and accessibility standards
 * WCAG AAA: Full keyboard navigation, ARIA support, and screen reader compatibility
 * CVA: Class Variance Authority for consistent styling
 * Universal Tokens: Uses design system tokens for consistency
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

const dropdownMenuContentVariants = cva(
  [
    'z-50 min-w-[8rem] overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
    'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
    'duration-200'
  ],
  {
    variants: {
      size: {
        sm: 'min-w-[6rem] text-sm p-1',
        md: 'min-w-[8rem] text-base p-1',
        lg: 'min-w-[10rem] text-lg p-2',
        xl: 'min-w-[12rem] text-xl p-2'
      },
      variant: {
        default: 'border-border',
        elevated: 'shadow-xl border-border',
        // NSM Security Classification variants
        nsmOpen: 'border-l-4 border-l-green-600 border-border shadow-lg',
        nsmRestricted: 'border-l-4 border-l-yellow-600 border-border shadow-lg',
        nsmConfidential: 'border-l-4 border-l-red-600 border-border shadow-lg',
        nsmSecret: 'border-l-4 border-l-gray-800 border-border shadow-xl'
      }
    },
    defaultVariants: {
      size: 'md',
      variant: 'default'
    }
  }
);

const dropdownMenuItemVariants = cva(
  [
    'relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm',
    'outline-none transition-all duration-150',
    'focus:bg-accent focus:text-accent-foreground',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    // Professional minimum height
    'min-h-[2.5rem] gap-2'
  ],
  {
    variants: {
      variant: {
        default: 'hover:bg-accent/50',
        destructive: 'text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-900/20',
        success: 'text-green-600 focus:bg-green-50 focus:text-green-600 dark:focus:bg-green-900/20',
        warning: 'text-yellow-600 focus:bg-yellow-50 focus:text-yellow-600 dark:focus:bg-yellow-900/20'
      },
      size: {
        sm: 'px-2 py-1.5 text-xs min-h-[2rem] gap-1.5',
        md: 'px-3 py-2 text-sm min-h-[2.5rem] gap-2',
        lg: 'px-4 py-2.5 text-base min-h-[3rem] gap-2.5',
        xl: 'px-5 py-3 text-lg min-h-[3.5rem] gap-3'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

const dropdownMenuSeparatorVariants = cva(
  [
    'mx-1 my-1 h-px bg-muted'
  ]
);

const dropdownMenuLabelVariants = cva(
  [
    'px-3 py-1.5 text-sm font-semibold text-muted-foreground'
  ],
  {
    variants: {
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
        xl: 'px-5 py-2.5 text-lg'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
);

// Types
export interface DropdownMenuProps {
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly modal?: boolean;
  readonly dir?: 'ltr' | 'rtl';
  readonly children: React.ReactNode;
}

export interface DropdownMenuContentProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof dropdownMenuContentVariants> {
  readonly side?: 'top' | 'right' | 'bottom' | 'left';
  readonly align?: 'start' | 'center' | 'end';
  readonly sideOffset?: number;
  readonly alignOffset?: number;
  readonly avoidCollisions?: boolean;
  readonly forceMount?: boolean;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

export interface DropdownMenuItemProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof dropdownMenuItemVariants> {
  readonly disabled?: boolean;
  readonly textValue?: string;
  readonly asChild?: boolean;
}

export interface DropdownMenuCheckboxItemProps extends DropdownMenuItemProps {
  readonly checked?: boolean | 'indeterminate';
  readonly onCheckedChange?: (checked: boolean) => void;
}

export interface DropdownMenuRadioItemProps extends DropdownMenuItemProps {
  readonly value: string;
}

export interface DropdownMenuRadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly value?: string;
  readonly onValueChange?: (value: string) => void;
}

export interface DropdownMenuSubProps {
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly children: React.ReactNode;
}

export interface DropdownMenuSubContentProps extends DropdownMenuContentProps {}

export interface DropdownMenuSubTriggerProps extends DropdownMenuItemProps {
  readonly inset?: boolean;
}

export interface DropdownMenuLabelProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof dropdownMenuLabelVariants> {
  readonly inset?: boolean;
}

export interface DropdownMenuSeparatorProps extends 
  React.HTMLAttributes<HTMLDivElement> {}

export interface DropdownMenuShortcutProps extends 
  React.HTMLAttributes<HTMLSpanElement> {}

// Context for dropdown menu state management
interface DropdownMenuContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modal: boolean;
  dir: 'ltr' | 'rtl';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | null>(null);

function useDropdownMenu(): DropdownMenuContextType {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenu components must be used within a DropdownMenu');
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

// Main DropdownMenu Component
export const DropdownMenu: React.FC<DropdownMenuProps> = ({ 
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  modal = true,
  dir = 'ltr',
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

  const contextValue: DropdownMenuContextType = {
    open,
    onOpenChange: handleOpenChange,
    modal,
    dir
  };

  return (
    <DropdownMenuContext.Provider value={contextValue}>
      {children}
    </DropdownMenuContext.Provider>
  );
};

DropdownMenu.displayName = 'DropdownMenu';

// DropdownMenu Trigger Component
export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, children, asChild = false, ...props }, ref) => {
  const { onOpenChange, open } = useDropdownMenu();

  const handleClick = React.useCallback(() => {
    onOpenChange(!open);
  }, [onOpenChange, open]);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...children.props,
      ref,
      'aria-expanded': open,
      'aria-haspopup': 'menu',
      'data-state': open ? 'open' : 'closed',
      onClick: (event: React.MouseEvent) => {
        children.props.onClick?.(event);
        if (!event.defaultPrevented) {
          handleClick();
        }
      }
    });
  }

  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={open}
      aria-haspopup="menu"
      data-state={open ? 'open' : 'closed'}
      className={cn('outline-none', className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
});

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

// DropdownMenu Portal Component
export const DropdownMenuPortal: React.FC<{
  children: React.ReactNode;
  container?: HTMLElement;
  forceMount?: boolean;
}> = ({ children, container, forceMount }) => {
  const { open } = useDropdownMenu();

  if (!forceMount && !open) {
    return null;
  }

  return (
    <Portal container={container}>
      {children}
    </Portal>
  );
};

DropdownMenuPortal.displayName = 'DropdownMenuPortal';

// DropdownMenu Content Component
export const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ 
    className, 
    size = 'md',
    variant = 'default',
    side = 'bottom',
    align = 'start',
    sideOffset = 4,
    children,
    nsmClassification,
    onKeyDown,
    ...props 
  }, ref) => {
    const { open, onOpenChange } = useDropdownMenu();
    const contentRef = React.useRef<HTMLDivElement>(null);
    
    // Auto-select NSM variant if classification is provided
    const finalVariant = nsmClassification 
      ? `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret'
      : variant;

    // Focus management
    React.useEffect(() => {
      if (open && contentRef.current) {
        const firstItem = contentRef.current.querySelector('[role="menuitem"]:not([data-disabled])') as HTMLElement;
        firstItem?.focus();
      }
    }, [open]);

    // Keyboard navigation
    const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
      const items = Array.from(
        contentRef.current?.querySelectorAll('[role="menuitem"]:not([data-disabled])') || []
      ) as HTMLElement[];
      
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onOpenChange(false);
          break;
        case 'ArrowDown':
          event.preventDefault();
          const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          items[nextIndex]?.focus();
          break;
        case 'ArrowUp':
          event.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          items[prevIndex]?.focus();
          break;
        case 'Home':
          event.preventDefault();
          items[0]?.focus();
          break;
        case 'End':
          event.preventDefault();
          items[items.length - 1]?.focus();
          break;
      }
      
      onKeyDown?.(event);
    }, [onOpenChange, onKeyDown]);

    // Outside click handler
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
          onOpenChange(false);
        }
      };

      if (open) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
      <DropdownMenuPortal>
        <div
          ref={contentRef}
          role="menu"
          aria-orientation="vertical"
          data-state={open ? 'open' : 'closed'}
          data-side={side}
          data-align={align}
          className={cn(
            dropdownMenuContentVariants({ size, variant: finalVariant }),
            className
          )}
          style={{
            transformOrigin: 'var(--radix-dropdown-menu-content-transform-origin)',
            ...props.style
          }}
          onKeyDown={handleKeyDown}
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
      </DropdownMenuPortal>
    );
  }
);

DropdownMenuContent.displayName = 'DropdownMenuContent';

// DropdownMenu Item Component
export const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ 
    className, 
    variant = 'default',
    size = 'md',
    disabled = false,
    children,
    onClick,
    onSelect,
    asChild = false,
    ...props 
  }, ref) => {
    const { onOpenChange } = useDropdownMenu();

    const handleClick = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }

      onClick?.(event);
      
      if (!event.defaultPrevented) {
        onSelect?.(event);
        onOpenChange(false);
      }
    }, [disabled, onClick, onSelect, onOpenChange]);

    const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
      if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
        event.preventDefault();
        handleClick(event as any);
      }
    }, [disabled, handleClick]);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...children.props,
        ref,
        role: 'menuitem',
        tabIndex: disabled ? -1 : 0,
        'data-disabled': disabled || undefined,
        className: cn(dropdownMenuItemVariants({ variant, size }), className),
        onClick: handleClick,
        onKeyDown: handleKeyDown
      });
    }

    return (
      <div
        ref={ref}
        role="menuitem"
        tabIndex={disabled ? -1 : 0}
        data-disabled={disabled || undefined}
        className={cn(dropdownMenuItemVariants({ variant, size }), className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DropdownMenuItem.displayName = 'DropdownMenuItem';

// DropdownMenu Checkbox Item Component
export const DropdownMenuCheckboxItem = React.forwardRef<HTMLDivElement, DropdownMenuCheckboxItemProps>(
  ({ 
    className, 
    children, 
    checked = false, 
    onCheckedChange,
    disabled = false,
    ...props 
  }, ref) => {
    const handleSelect = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      
      event.preventDefault();
      onCheckedChange?.(!checked);
    }, [disabled, checked, onCheckedChange]);

    return (
      <DropdownMenuItem
        ref={ref}
        className={cn('pl-8', className)}
        disabled={disabled}
        onSelect={handleSelect}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {(checked === true || checked === 'indeterminate') && (
            <CheckIcon className="h-4 w-4" />
          )}
        </span>
        {children}
      </DropdownMenuItem>
    );
  }
);

DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

// DropdownMenu Radio Group Component
export const DropdownMenuRadioGroup = React.forwardRef<HTMLDivElement, DropdownMenuRadioGroupProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    const contextValue = React.useMemo(() => ({
      value,
      onValueChange: onValueChange || (() => {})
    }), [value, onValueChange]);

    return (
      <DropdownMenuRadioGroupContext.Provider value={contextValue}>
        <div ref={ref} role="radiogroup" className={className} {...props} />
      </DropdownMenuRadioGroupContext.Provider>
    );
  }
);

DropdownMenuRadioGroup.displayName = 'DropdownMenuRadioGroup';

// Context for radio group
const DropdownMenuRadioGroupContext = React.createContext<{
  value?: string;
  onValueChange: (value: string) => void;
}>({
  onValueChange: () => {}
});

// DropdownMenu Radio Item Component
export const DropdownMenuRadioItem = React.forwardRef<HTMLDivElement, DropdownMenuRadioItemProps>(
  ({ className, children, value, disabled = false, ...props }, ref) => {
    const { value: groupValue, onValueChange } = React.useContext(DropdownMenuRadioGroupContext);
    
    const isChecked = groupValue === value;

    const handleSelect = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      
      event.preventDefault();
      onValueChange(value);
    }, [disabled, value, onValueChange]);

    return (
      <DropdownMenuItem
        ref={ref}
        className={cn('pl-8', className)}
        disabled={disabled}
        onSelect={handleSelect}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {isChecked && <div className="h-2 w-2 rounded-full bg-current" />}
        </span>
        {children}
      </DropdownMenuItem>
    );
  }
);

DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';

// DropdownMenu Label Component
export const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ className, size = 'md', inset = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        dropdownMenuLabelVariants({ size }),
        inset && 'pl-8',
        className
      )}
      {...props}
    />
  )
);

DropdownMenuLabel.displayName = 'DropdownMenuLabel';

// DropdownMenu Separator Component
export const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      aria-orientation="horizontal"
      className={cn(dropdownMenuSeparatorVariants(), className)}
      {...props}
    />
  )
);

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

// DropdownMenu Shortcut Component
export const DropdownMenuShortcut = React.forwardRef<HTMLSpanElement, DropdownMenuShortcutProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'ml-auto text-xs tracking-widest opacity-60',
        className
      )}
      {...props}
    />
  )
);

DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

// DropdownMenu Sub Components
export const DropdownMenuSub: React.FC<DropdownMenuSubProps> = ({ 
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
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

  return (
    <DropdownMenuSubContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </DropdownMenuSubContext.Provider>
  );
};

DropdownMenuSub.displayName = 'DropdownMenuSub';

// Context for sub menu
const DropdownMenuSubContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

export const DropdownMenuSubTrigger = React.forwardRef<HTMLDivElement, DropdownMenuSubTriggerProps>(
  ({ className, inset = false, children, ...props }, ref) => {
    const subContext = React.useContext(DropdownMenuSubContext);
    
    return (
      <DropdownMenuItem
        ref={ref}
        className={cn(
          'focus:bg-accent data-[state=open]:bg-accent',
          inset && 'pl-8',
          className
        )}
        {...props}
      >
        {children}
        <ChevronRightIcon className="ml-auto h-4 w-4" />
      </DropdownMenuItem>
    );
  }
);

DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';

export const DropdownMenuSubContent = React.forwardRef<HTMLDivElement, DropdownMenuSubContentProps>(
  ({ className, ...props }, ref) => (
    <DropdownMenuContent
      ref={ref}
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  )
);

DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';

// Export variants and types
export { 
  dropdownMenuContentVariants, 
  dropdownMenuItemVariants, 
  dropdownMenuLabelVariants,
  dropdownMenuSeparatorVariants 
};
export type { VariantProps };