/**
 * Tabs Component - Tabbed Interface System
 * CLAUDE.md Compliant: Professional sizing and accessibility
 * WCAG AAA: Full keyboard navigation and screen reader support
 * CVA: Class Variance Authority for consistent styling
 * Norwegian localization support
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../../lib/utils';

// =============================================================================
// TABS ROOT
// =============================================================================

const tabsVariants = cva(
  [
    'w-full focus-within:outline-none'
  ],
  {
    variants: {
      orientation: {
        horizontal: 'flex flex-col',
        vertical: 'flex flex-row'
      }
    },
    defaultVariants: {
      orientation: 'horizontal'
    }
  }
);

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> &
    VariantProps<typeof tabsVariants>
>(({ className, orientation, ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    orientation={orientation}
    className={cn(tabsVariants({ orientation }), className)}
    {...props}
  />
));
Tabs.displayName = TabsPrimitive.Root.displayName;

// =============================================================================
// TABS LIST
// =============================================================================

const tabsListVariants = cva(
  [
    'inline-flex items-center text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background'
  ],
  {
    variants: {
      variant: {
        default: [
          'h-12 justify-center rounded-lg bg-muted p-1',
          'border border-border shadow-sm'
        ],
        line: [
          'h-auto justify-start border-b border-border bg-transparent p-0',
          'space-x-8'
        ],
        pills: [
          'h-12 justify-start bg-transparent p-1 gap-1',
          'flex-wrap'
        ],
        vertical: [
          'flex-col h-auto w-48 justify-start border-r border-border bg-transparent p-0',
          'space-y-1'
        ]
      },
      size: {
        sm: 'h-10 text-sm',
        md: 'h-12 text-base',
        lg: 'h-14 text-lg'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> &
    VariantProps<typeof tabsListVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant, size }), className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

// =============================================================================
// TABS TRIGGER
// =============================================================================

const tabsTriggerVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2',
    'text-sm font-medium ring-offset-background transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'min-h-[2.75rem]', // Professional touch target (44px)
    'gap-2',
    'contrast-more:data-[state=active]:border-2 contrast-more:data-[state=active]:border-primary'
  ],
  {
    variants: {
      variant: {
        default: [
          'data-[state=active]:bg-background data-[state=active]:text-foreground',
          'data-[state=active]:shadow-sm hover:bg-background/50',
          'data-[state=active]:border data-[state=active]:border-border'
        ],
        line: [
          'rounded-none border-b-2 border-transparent bg-transparent px-4 py-3',
          'data-[state=active]:border-primary data-[state=active]:text-foreground',
          'hover:text-foreground hover:border-muted-foreground/50'
        ],
        pills: [
          'rounded-full bg-muted/50 hover:bg-muted',
          'data-[state=active]:bg-background data-[state=active]:text-foreground',
          'data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border'
        ],
        vertical: [
          'w-full justify-start rounded-md px-3 py-3',
          'data-[state=active]:bg-muted data-[state=active]:text-foreground',
          'hover:bg-muted/50'
        ]
      },
      size: {
        sm: 'h-8 px-3 text-xs min-h-[2rem]',
        md: 'h-10 px-4 text-sm min-h-[2.75rem]',
        lg: 'h-12 px-6 text-base min-h-[3rem]'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> &
    VariantProps<typeof tabsTriggerVariants> & {
      readonly icon?: React.ReactNode;
      readonly badge?: string | number;
    }
>(({ className, variant, size, icon, badge, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant, size }), className)}
    {...props}
  >
    {icon && (
      <span className="flex-shrink-0" aria-hidden="true">
        {icon}
      </span>
    )}
    
    <span className="truncate">
      {children}
    </span>
    
    {badge && (
      <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
        {badge}
      </span>
    )}
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// =============================================================================
// TABS CONTENT
// =============================================================================

const tabsContentVariants = cva(
  [
    'mt-2 ring-offset-background',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:zoom-in-95',
    'data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=inactive]:zoom-out-95'
  ],
  {
    variants: {
      variant: {
        default: '',
        card: 'rounded-lg border bg-card text-card-foreground shadow-sm p-6',
        padded: 'p-4'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> &
    VariantProps<typeof tabsContentVariants>
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(tabsContentVariants({ variant }), className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// =============================================================================
// ADVANCED TABS COMPONENT
// =============================================================================

export interface TabItem {
  readonly value: string;
  readonly label: string;
  readonly content: React.ReactNode;
  readonly icon?: React.ReactNode;
  readonly badge?: string | number;
  readonly disabled?: boolean;
  readonly description?: string;
}

export interface AdvancedTabsProps {
  readonly items: readonly TabItem[];
  readonly defaultValue?: string;
  readonly value?: string;
  readonly onValueChange?: (value: string) => void;
  readonly variant?: 'default' | 'line' | 'pills' | 'vertical';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly contentVariant?: 'default' | 'card' | 'padded';
  readonly className?: string;
  readonly orientation?: 'horizontal' | 'vertical';
  readonly activationMode?: 'automatic' | 'manual';
  readonly ariaLabel?: string;
  readonly allowDeselect?: boolean;
}

const AdvancedTabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  AdvancedTabsProps
>(({ 
  items,
  defaultValue,
  value,
  onValueChange,
  variant = 'default',
  size = 'md',
  contentVariant = 'default',
  className,
  orientation = 'horizontal',
  activationMode = 'automatic',
  ariaLabel = 'Faner', // Norwegian for "Tabs"
  allowDeselect = false,
  ...props 
}, ref) => {
  const [internalValue, setInternalValue] = React.useState(
    value || defaultValue || items[0]?.value || ''
  );

  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = (newValue: string) => {
    // Handle deselection if allowed
    if (allowDeselect && currentValue === newValue) {
      newValue = '';
    }

    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  const tabsOrientation = variant === 'vertical' ? 'vertical' : orientation;

  return (
    <Tabs
      ref={ref}
      value={currentValue}
      onValueChange={handleValueChange}
      orientation={tabsOrientation}
      activationMode={activationMode}
      className={className}
      {...props}
    >
      <TabsList 
        variant={variant} 
        size={size}
        aria-label={ariaLabel}
      >
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            variant={variant}
            size={size}
            icon={item.icon}
            badge={item.badge}
            disabled={item.disabled}
            aria-label={item.description || item.label}
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {items.map((item) => (
        <TabsContent
          key={`content-${item.value}`}
          value={item.value}
          variant={contentVariant}
          className="w-full"
        >
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  );
});
AdvancedTabs.displayName = 'AdvancedTabs';

// =============================================================================
// CONTROLLED TABS HOOK
// =============================================================================

export interface UseTabsOptions {
  readonly defaultValue?: string;
  readonly items: readonly TabItem[];
  readonly onChange?: (value: string) => void;
}

export function useTabs({ defaultValue, items, onChange }: UseTabsOptions) {
  const [activeTab, setActiveTab] = React.useState(
    defaultValue || items[0]?.value || ''
  );

  const handleTabChange = React.useCallback((value: string) => {
    setActiveTab(value);
    onChange?.(value);
  }, [onChange]);

  const activeTabItem = React.useMemo(
    () => items.find(item => item.value === activeTab),
    [items, activeTab]
  );

  return {
    activeTab,
    setActiveTab: handleTabChange,
    activeTabItem,
    isActive: (value: string) => activeTab === value
  };
}

// =============================================================================
// LAZY TABS (Only render active content)
// =============================================================================

export interface LazyTabsProps extends AdvancedTabsProps {
  readonly lazy?: boolean;
}

const LazyTabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  LazyTabsProps
>(({ lazy = true, items, ...props }, ref) => {
  const [loadedTabs, setLoadedTabs] = React.useState<Set<string>>(
    new Set([props.defaultValue || props.value || items[0]?.value].filter(Boolean))
  );

  const handleValueChange = (value: string) => {
    if (lazy) {
      setLoadedTabs(prev => new Set([...prev, value]));
    }
    props.onValueChange?.(value);
  };

  const filteredItems = lazy 
    ? items.map(item => ({
        ...item,
        content: loadedTabs.has(item.value) ? item.content : null
      }))
    : items;

  return (
    <AdvancedTabs
      ref={ref}
      {...props}
      items={filteredItems}
      onValueChange={handleValueChange}
    />
  );
});
LazyTabs.displayName = 'LazyTabs';

// =============================================================================
// EXPORTS
// =============================================================================

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  AdvancedTabs,
  LazyTabs,
  tabsVariants,
  tabsListVariants,
  tabsTriggerVariants,
  tabsContentVariants,
};

export type { TabItem, AdvancedTabsProps, LazyTabsProps, UseTabsOptions, VariantProps };