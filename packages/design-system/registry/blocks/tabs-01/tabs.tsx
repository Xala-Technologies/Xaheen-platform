/**
 * Tabs Component Block
 * WCAG AAA compliant tabbed interface with keyboard navigation
 * Norwegian language support and professional styling
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { LABELS } from '../../lib/constants';
// TODO: Replace with context/provider pattern
// import { useAccessibility } from '@/hooks/use-accessibility';
// import { useResponsive } from '@/hooks/use-responsive';

export interface Tab {
  readonly id: string;
  readonly label: string;
  readonly content: React.ReactNode;
  readonly icon?: React.ReactNode;
  readonly badge?: string | number;
  readonly disabled?: boolean;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

export interface TabsProps {
  readonly tabs: Tab[];
  readonly defaultTab?: string;
  readonly onChange?: (tabId: string) => void;
  readonly variant?: 'default' | 'pills' | 'underline' | 'enclosed';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly orientation?: 'horizontal' | 'vertical';
  readonly fullWidth?: boolean;
  readonly className?: string;
  readonly lazy?: boolean;
  readonly animated?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  fullWidth = false,
  className,
  lazy = true,
  animated = true
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set([activeTab]));
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  // TODO: Replace with proper context/provider
  const announce = (message: string) => console.log('Announce:', message);
  const getAriaLabel = (key: string) => LABELS[key as keyof typeof LABELS] || key;
  // Responsive breakpoint check simplified
  const prefersReducedMotion = false;

  // Handle tab change
  const handleTabChange = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab || tab.disabled) return;

    setActiveTab(tabId);
    setVisitedTabs(prev => new Set([...prev, tabId]));
    onChange?.(tabId);
    announce(`${tab.label} fane valgt`);
  }, [tabs, onChange, announce]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const enabledTabs = tabs.filter(t => !t.disabled);
    const currentIndex = enabledTabs.findIndex(t => t.id === activeTab);
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        newIndex = (currentIndex + 1) % enabledTabs.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        newIndex = currentIndex === 0 ? enabledTabs.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = enabledTabs.length - 1;
        break;
      default:
        return;
    }

    const newTab = enabledTabs[newIndex];
    if (newTab) {
      handleTabChange(newTab.id);
      setFocusedIndex(tabs.findIndex(t => t.id === newTab.id));
    }
  }, [tabs, activeTab, handleTabChange]);

  // Focus management
  useEffect(() => {
    tabRefs.current[focusedIndex]?.focus();
  }, [focusedIndex]);

  // Tab list styles
  const tabListStyles = {
    default: 'border-b border-border',
    pills: 'bg-muted p-1 rounded-lg',
    underline: '',
    enclosed: 'border-b border-border'
  };

  // Tab button styles
  const getTabButtonStyles = (isActive: boolean, isDisabled: boolean) => {
    const baseStyles = [
      'relative flex items-center gap-2 font-medium transition-all',
      'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2',
      isDisabled && 'opacity-50 cursor-not-allowed'
    ];

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    const variantStyles = {
      default: [
        isActive ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground',
        'border-b-2 border-transparent'
      ],
      pills: [
        isActive ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
        'rounded-md'
      ],
      underline: [
        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
        'border-b-2',
        isActive ? 'border-primary' : 'border-transparent'
      ],
      enclosed: [
        isActive ? 'bg-background border-border border-b-background' : 'bg-transparent',
        'border border-transparent rounded-t-lg',
        isActive && '-mb-px'
      ]
    };

    return cn(
      baseStyles,
      sizeStyles[size],
      variantStyles[variant],
      fullWidth && 'flex-1 justify-center'
    );
  };

  // Tab panel styles
  const tabPanelStyles = cn(
    'focus:outline-none',
    animated && !prefersReducedMotion && 'transition-opacity duration-200',
    variant === 'enclosed' && 'border border-t-0 border-border rounded-b-lg p-4'
  );

  // Active tab data retrieved when needed

  return (
    <div className={cn('w-full', className)}>
      {/* Tab List */}
      <div
        ref={tabListRef}
        role="tablist"
        aria-label={getAriaLabel('tabs')}
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex',
          orientation === 'vertical' ? 'flex-col' : 'flex-row',
          tabListStyles[variant],
          fullWidth && 'w-full'
        )}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;
          const isDisabled = tab.disabled || false;

          return (
            <button
              key={tab.id}
              ref={el => tabRefs.current[index] = el}
              role="tab"
              id={`tab-${tab.id}`}
              aria-controls={`tabpanel-${tab.id}`}
              aria-selected={isActive}
              aria-disabled={isDisabled}
              tabIndex={isActive ? 0 : -1}
              disabled={isDisabled}
              onClick={() => handleTabChange(tab.id)}
              className={getTabButtonStyles(isActive, isDisabled)}
            >
              {/* NSM Classification Indicator */}
              {tab.nsmClassification && (
                <div
                  className={cn(
                    'absolute left-0 top-0 bottom-0 w-1',
                    tab.nsmClassification === 'OPEN' && 'bg-green-600',
                    tab.nsmClassification === 'RESTRICTED' && 'bg-yellow-600',
                    tab.nsmClassification === 'CONFIDENTIAL' && 'bg-red-600',
                    tab.nsmClassification === 'SECRET' && 'bg-gray-800'
                  )}
                  aria-label={`NSM klassifisering: ${tab.nsmClassification}`}
                />
              )}

              {/* Icon */}
              {tab.icon && (
                <span className="flex-shrink-0" aria-hidden="true">
                  {tab.icon}
                </span>
              )}

              {/* Label */}
              <span>{tab.label}</span>

              {/* Badge */}
              {tab.badge !== undefined && (
                <span className={cn(
                  'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium rounded-full',
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const shouldRender = !lazy || visitedTabs.has(tab.id);

          if (!shouldRender) return null;

          return (
            <div
              key={tab.id}
              role="tabpanel"
              id={`tabpanel-${tab.id}`}
              aria-labelledby={`tab-${tab.id}`}
              tabIndex={0}
              hidden={!isActive}
              className={cn(
                tabPanelStyles,
                !isActive && 'sr-only'
              )}
            >
              {tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Specialized Tab Components
export const IconTabs: React.FC<TabsProps> = (props) => (
  <Tabs {...props} variant="pills" />
);

export const VerticalTabs: React.FC<TabsProps> = (props) => (
  <Tabs {...props} orientation="vertical" />
);

// Tab Panel Component for Complex Content
export interface TabPanelProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly loading?: boolean;
  readonly error?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  children,
  className,
  loading,
  error
}) => {
  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Laster innhold...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('p-8 text-center', className)}>
        <div className="text-destructive mb-2">⚠️</div>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {children}
    </div>
  );
};