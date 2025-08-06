import React, { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { tokens } from '../../core/universal-tokens';

const collapsibleVariants = cva(
  'overflow-hidden transition-all duration-300 ease-in-out',
  {
    variants: {
      variant: {
        default: 'border border-gray-200 rounded-xl bg-white',
        ghost: '',
        outline: 'border border-gray-200 rounded-xl',
        card: 'border border-gray-200 rounded-xl bg-white shadow-sm',
      },
      state: {
        closed: '',
        open: '',
        collapsing: '',
        expanding: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      state: 'closed',
    },
  }
);

const triggerVariants = cva(
  'flex items-center justify-between w-full text-left transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'p-4 hover:bg-gray-50',
        ghost: 'py-2 hover:bg-gray-50 rounded-lg',
        outline: 'p-4 hover:bg-gray-50',
        card: 'p-4 hover:bg-gray-50',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: 'cursor-pointer',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      disabled: false,
    },
  }
);

const contentVariants = cva(
  'overflow-hidden transition-all duration-300 ease-in-out',
  {
    variants: {
      variant: {
        default: 'border-t border-gray-200 px-4 pb-4',
        ghost: 'px-0',
        outline: 'border-t border-gray-200 px-4 pb-4',
        card: 'border-t border-gray-200 px-4 pb-4',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface CollapsibleContextValue {
  readonly open: boolean;
  readonly disabled: boolean;
  readonly onToggle: () => void;
  readonly variant: 'default' | 'ghost' | 'outline' | 'card';
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

export const useCollapsible = (): CollapsibleContextValue => {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error('useCollapsible must be used within a Collapsible component');
  }
  return context;
};

interface CollapsibleProps extends VariantProps<typeof collapsibleVariants> {
  readonly children: React.ReactNode;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly animationDuration?: number;
}

export const Collapsible = ({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  variant,
  className,
  animationDuration = 300,
}: CollapsibleProps): JSX.Element => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const [state, setState] = useState<'closed' | 'open' | 'collapsing' | 'expanding'>(
    isOpen ? 'open' : 'closed'
  );

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (disabled) return;
    
    if (controlledOpen === undefined) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [controlledOpen, onOpenChange, disabled]);

  const handleToggle = useCallback(() => {
    if (disabled) return;
    
    const newOpen = !isOpen;
    setState(newOpen ? 'expanding' : 'collapsing');
    handleOpenChange(newOpen);
    
    // Update state after animation completes
    setTimeout(() => {
      setState(newOpen ? 'open' : 'closed');
    }, animationDuration);
  }, [isOpen, handleOpenChange, disabled, animationDuration]);

  useEffect(() => {
    if (controlledOpen !== undefined) {
      setState(controlledOpen ? (isOpen ? 'open' : 'expanding') : (isOpen ? 'open' : 'collapsing'));
      
      if (controlledOpen !== isOpen) {
        setTimeout(() => {
          setState(controlledOpen ? 'open' : 'closed');
        }, animationDuration);
      }
    }
  }, [controlledOpen, isOpen, animationDuration]);

  const contextValue: CollapsibleContextValue = {
    open: isOpen,
    disabled,
    onToggle: handleToggle,
    variant: variant || 'default',
  };

  return (
    <CollapsibleContext.Provider value={contextValue}>
      <div 
        className={collapsibleVariants({ variant, state, className })}
        style={{
          '--animation-duration': `${animationDuration}ms`,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
};

interface CollapsibleTriggerProps extends VariantProps<typeof triggerVariants> {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly asChild?: boolean;
}

export const CollapsibleTrigger = ({
  children,
  className,
  size,
  asChild,
}: CollapsibleTriggerProps): JSX.Element => {
  const { open, disabled, onToggle, variant } = useCollapsible();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        children.props.onClick?.(e);
        onToggle();
      },
      'aria-expanded': open,
      'aria-disabled': disabled,
      disabled,
    });
  }

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      aria-expanded={open}
      aria-disabled={disabled}
      className={triggerVariants({ variant, size, disabled, className })}
    >
      <div className="flex-1 text-left">
        {children}
      </div>
      <ChevronIcon open={open} disabled={disabled} />
    </button>
  );
};

interface CollapsibleContentProps extends VariantProps<typeof contentVariants> {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly forceMount?: boolean;
}

export const CollapsibleContent = ({
  children,
  className,
  forceMount = false,
}: CollapsibleContentProps): JSX.Element => {
  const { open, variant } = useCollapsible();
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>(open ? 'auto' : 0);

  useEffect(() => {
    if (!contentRef.current) return;

    if (open) {
      const scrollHeight = contentRef.current.scrollHeight;
      setHeight(scrollHeight);
      
      // Set to auto after animation completes
      const timer = setTimeout(() => {
        setHeight('auto');
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      // Set explicit height first, then animate to 0
      const scrollHeight = contentRef.current.scrollHeight;
      setHeight(scrollHeight);
      
      requestAnimationFrame(() => {
        setHeight(0);
      });
    }
  }, [open]);

  if (!open && !forceMount) {
    return <></>;
  }

  return (
    <div
      ref={contentRef}
      className={contentVariants({ variant, className })}
      style={{
        height: height === 'auto' ? 'auto' : `${height}px`,
        opacity: open ? 1 : 0,
      }}
      aria-hidden={!open}
    >
      <div className="py-2">
        {children}
      </div>
    </div>
  );
};

interface ChevronIconProps {
  readonly open: boolean;
  readonly disabled: boolean;
  readonly className?: string;
}

const ChevronIcon = ({ open, disabled, className }: ChevronIconProps): JSX.Element => {
  return (
    <svg
      className={`h-5 w-5 transition-transform duration-200 ${
        open ? 'rotate-180' : 'rotate-0'
      } ${disabled ? 'opacity-50' : ''} ${className || ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
};

interface CollapsibleTitleProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const CollapsibleTitle = ({ 
  children, 
  className,
  level = 3 
}: CollapsibleTitleProps): JSX.Element => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Tag className={`font-semibold text-gray-900 ${className || ''}`}>
      {children}
    </Tag>
  );
};

interface CollapsibleDescriptionProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export const CollapsibleDescription = ({ 
  children, 
  className 
}: CollapsibleDescriptionProps): JSX.Element => {
  return (
    <p className={`text-sm text-gray-600 mt-1 ${className || ''}`}>
      {children}
    </p>
  );
};

// Preset components for common use cases
interface CollapsibleItemProps {
  readonly title: string;
  readonly description?: string;
  readonly children: React.ReactNode;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly disabled?: boolean;
  readonly variant?: 'default' | 'ghost' | 'outline' | 'card';
  readonly className?: string;
}

export const CollapsibleItem = ({
  title,
  description,
  children,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  variant = 'default',
  className,
}: CollapsibleItemProps): JSX.Element => {
  return (
    <Collapsible
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      disabled={disabled}
      variant={variant}
      className={className}
    >
      <CollapsibleTrigger>
        <div>
          <CollapsibleTitle>{title}</CollapsibleTitle>
          {description && (
            <CollapsibleDescription>{description}</CollapsibleDescription>
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

interface CollapsibleGroupProps {
  readonly children: React.ReactNode;
  readonly type?: 'single' | 'multiple';
  readonly value?: string | string[];
  readonly defaultValue?: string | string[];
  readonly onValueChange?: (value: string | string[]) => void;
  readonly className?: string;
  readonly collapsible?: boolean;
}

export const CollapsibleGroup = ({
  children,
  type = 'single',
  value: controlledValue,
  defaultValue,
  onValueChange,
  className,
  collapsible = true,
}: CollapsibleGroupProps): JSX.Element => {
  const [uncontrolledValue, setUncontrolledValue] = useState(
    defaultValue || (type === 'single' ? '' : [])
  );
  
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const handleValueChange = useCallback((newValue: string | string[]) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(newValue);
    }
    onValueChange?.(newValue);
  }, [controlledValue, onValueChange]);

  const handleItemOpenChange = useCallback((itemValue: string, open: boolean) => {
    if (type === 'single') {
      const currentValue = value as string;
      if (open) {
        handleValueChange(itemValue);
      } else if (currentValue === itemValue && collapsible) {
        handleValueChange('');
      }
    } else {
      const currentValue = value as string[];
      if (open) {
        if (!currentValue.includes(itemValue)) {
          handleValueChange([...currentValue, itemValue]);
        }
      } else {
        handleValueChange(currentValue.filter(v => v !== itemValue));
      }
    }
  }, [type, value, collapsible, handleValueChange]);

  return (
    <div className={`space-y-2 ${className || ''}`}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const itemValue = child.props.value || index.toString();
          const isOpen = type === 'single' 
            ? value === itemValue 
            : (value as string[]).includes(itemValue);

          return React.cloneElement(child, {
            open: isOpen,
            onOpenChange: (open: boolean) => handleItemOpenChange(itemValue, open),
          });
        }
        return child;
      })}
    </div>
  );
};