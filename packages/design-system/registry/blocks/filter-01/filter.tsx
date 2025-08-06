/**
 * Filter Component Block
 * Advanced filtering system with multiple filter types
 * WCAG AAA compliant with Norwegian language support
 */

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { LABELS, PLACEHOLDERS, ARIA_LABELS } from '../../lib/constants';

export interface FilterOption {
  readonly value: string;
  readonly label: string;
  readonly count?: number;
  readonly icon?: React.ReactNode;
  readonly disabled?: boolean;
}

export interface FilterGroup {
  readonly id: string;
  readonly label: string;
  readonly type: 'checkbox' | 'radio' | 'range' | 'date' | 'select' | 'search';
  readonly options?: FilterOption[];
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly placeholder?: string;
  readonly icon?: React.ReactNode;
  readonly multiple?: boolean;
  readonly collapsible?: boolean;
  readonly defaultExpanded?: boolean;
}

export interface FilterValue {
  readonly [groupId: string]: any;
}

export interface FilterProps {
  readonly groups: FilterGroup[];
  readonly values?: FilterValue;
  readonly onChange: (values: FilterValue) => void;
  readonly onReset?: () => void;
  readonly onApply?: (values: FilterValue) => void;
  readonly showApplyButton?: boolean;
  readonly showResetButton?: boolean;
  readonly showActiveCount?: boolean;
  readonly className?: string;
  readonly variant?: 'sidebar' | 'horizontal' | 'dropdown' | 'inline';
  readonly norwegianLabels?: boolean;
}

export const Filter: React.FC<FilterProps> = ({
  groups,
  values = {},
  onChange,
  onReset,
  onApply,
  showApplyButton = true,
  showResetButton = true,
  showActiveCount = true,
  className,
  variant = 'sidebar',
  norwegianLabels = true
}) => {
  const [localValues, setLocalValues] = useState<FilterValue>(values);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(groups.filter(g => g.defaultExpanded !== false).map(g => g.id))
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [_, { announce, getAriaLabel }] = useAccessibility();
  const { isAtLeast } = useResponsive();

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.entries(localValues).forEach(([groupId, value]) => {
      const group = groups.find(g => g.id === groupId);
      if (!group) return;

      switch (group.type) {
        case 'checkbox':
          if (Array.isArray(value) && value.length > 0) count += value.length;
          break;
        case 'radio':
        case 'select':
          if (value) count++;
          break;
        case 'range':
          if (value && (value.min !== group.min || value.max !== group.max)) count++;
          break;
        case 'date':
          if (value && (value.from || value.to)) count++;
          break;
        case 'search':
          if (value && value.trim()) count++;
          break;
      }
    });
    return count;
  }, [localValues, groups]);

  // Handle value changes
  const handleValueChange = useCallback((groupId: string, value: any) => {
    const newValues = { ...localValues, [groupId]: value };
    setLocalValues(newValues);
    
    if (!showApplyButton) {
      onChange(newValues);
    }
    
    announce(`Filter endret`);
  }, [localValues, onChange, showApplyButton, announce]);

  // Handle apply
  const handleApply = useCallback(() => {
    onChange(localValues);
    onApply?.(localValues);
    if (variant === 'dropdown') {
      setIsDropdownOpen(false);
    }
    announce(`${activeFilterCount} filtre anvendt`);
  }, [localValues, onChange, onApply, variant, activeFilterCount, announce]);

  // Handle reset
  const handleReset = useCallback(() => {
    const resetValues: FilterValue = {};
    setLocalValues(resetValues);
    onChange(resetValues);
    onReset?.();
    announce('Alle filtre tilbakestilt');
  }, [onChange, onReset, announce]);

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  // Render filter group
  const renderFilterGroup = (group: FilterGroup) => {
    const isExpanded = expandedGroups.has(group.id);
    const value = localValues[group.id];

    const content = (
      <div className="space-y-3">
        {group.type === 'checkbox' && group.options && (
          <div className="space-y-2">
            {group.options.map(option => (
              <label
                key={option.value}
                className={cn(
                  "flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-accent",
                  option.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    handleValueChange(group.id, newValues);
                  }}
                  disabled={option.disabled}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary/20"
                  aria-label={`${option.label}${option.count ? ` (${option.count})` : ''}`}
                />
                <span className="flex-1 text-sm">{option.label}</span>
                {option.count !== undefined && (
                  <span className="text-xs text-muted-foreground">({option.count})</span>
                )}
              </label>
            ))}
          </div>
        )}

        {group.type === 'radio' && group.options && (
          <div className="space-y-2">
            {group.options.map(option => (
              <label
                key={option.value}
                className={cn(
                  "flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-accent",
                  option.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <input
                  type="radio"
                  name={group.id}
                  checked={value === option.value}
                  onChange={() => handleValueChange(group.id, option.value)}
                  disabled={option.disabled}
                  className="h-4 w-4 border-input text-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="flex-1 text-sm">{option.label}</span>
                {option.count !== undefined && (
                  <span className="text-xs text-muted-foreground">({option.count})</span>
                )}
              </label>
            ))}
          </div>
        )}

        {group.type === 'range' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="number"
                value={value?.min || group.min || 0}
                onChange={(e) => handleValueChange(group.id, {
                  ...value,
                  min: Number(e.target.value)
                })}
                min={group.min}
                max={group.max}
                step={group.step}
                className="w-24"
                placeholder="Min"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                value={value?.max || group.max || 100}
                onChange={(e) => handleValueChange(group.id, {
                  ...value,
                  max: Number(e.target.value)
                })}
                min={group.min}
                max={group.max}
                step={group.step}
                className="w-24"
                placeholder="Max"
              />
            </div>
            <div className="relative">
              <div className="h-2 bg-muted rounded-full">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{
                    marginLeft: `${((value?.min || group.min || 0) - (group.min || 0)) / ((group.max || 100) - (group.min || 0)) * 100}%`,
                    width: `${((value?.max || group.max || 100) - (value?.min || group.min || 0)) / ((group.max || 100) - (group.min || 0)) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {group.type === 'date' && (
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                {norwegianLabels ? 'Fra dato' : 'From date'}
              </label>
              <Input
                type="date"
                value={value?.from || ''}
                onChange={(e) => handleValueChange(group.id, {
                  ...value,
                  from: e.target.value
                })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                {norwegianLabels ? 'Til dato' : 'To date'}
              </label>
              <Input
                type="date"
                value={value?.to || ''}
                onChange={(e) => handleValueChange(group.id, {
                  ...value,
                  to: e.target.value
                })}
                className="w-full"
              />
            </div>
          </div>
        )}

        {group.type === 'select' && group.options && (
          <select
            value={value || ''}
            onChange={(e) => handleValueChange(group.id, e.target.value)}
            className={cn(
              "w-full h-12 px-3 rounded-lg border-2 border-input",
              "bg-background text-foreground",
              "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            )}
            aria-label={group.label}
          >
            <option value="">{group.placeholder || (norwegianLabels ? 'Velg...' : 'Select...')}</option>
            {group.options.map(option => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {group.type === 'search' && (
          <Input
            type="search"
            value={value || ''}
            onChange={(e) => handleValueChange(group.id, e.target.value)}
            placeholder={group.placeholder || (norwegianLabels ? 'Søk...' : 'Search...')}
            className="w-full"
          />
        )}
      </div>
    );

    if (group.collapsible) {
      return (
        <div key={group.id} className="border-b last:border-0 pb-4 last:pb-0">
          <button
            onClick={() => toggleGroup(group.id)}
            className="flex items-center justify-between w-full text-left mb-3 hover:text-primary transition-colors"
            aria-expanded={isExpanded}
            aria-controls={`filter-group-${group.id}`}
          >
            <span className="font-medium flex items-center gap-2">
              {group.icon}
              {group.label}
            </span>
            <svg
              className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "rotate-180"
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isExpanded && (
            <div id={`filter-group-${group.id}`}>
              {content}
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={group.id} className="border-b last:border-0 pb-4 last:pb-0">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          {group.icon}
          {group.label}
        </h3>
        {content}
      </div>
    );
  };

  // Render based on variant
  if (variant === 'horizontal') {
    return (
      <div className={cn("flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border", className)}>
        {groups.map(group => (
          <div key={group.id} className="flex items-center gap-2">
            <span className="text-sm font-medium">{group.label}:</span>
            {group.type === 'select' && group.options && (
              <select
                value={localValues[group.id] || ''}
                onChange={(e) => handleValueChange(group.id, e.target.value)}
                className="h-9 px-3 rounded-md border bg-background text-sm"
              >
                <option value="">{norwegianLabels ? 'Alle' : 'All'}</option>
                {group.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            {group.type === 'search' && (
              <Input
                type="search"
                value={localValues[group.id] || ''}
                onChange={(e) => handleValueChange(group.id, e.target.value)}
                placeholder={group.placeholder}
                className="h-9 w-48"
              />
            )}
          </div>
        ))}
        
        <div className="flex items-center gap-2 ml-auto">
          {showActiveCount && activeFilterCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {activeFilterCount} {norwegianLabels ? 'aktive' : 'active'}
            </span>
          )}
          {showResetButton && activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="md"
              onClick={handleReset}
            >
              {norwegianLabels ? 'Tilbakestill' : 'Reset'}
            </Button>
          )}
          {showApplyButton && (
            <Button
              variant="primary"
              size="md"
              onClick={handleApply}
            >
              {norwegianLabels ? 'Bruk filtre' : 'Apply filters'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={cn("relative", className)}>
        <Button
          variant="outline"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="min-w-[200px] justify-between"
        >
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {norwegianLabels ? 'Filtre' : 'Filters'}
            {activeFilterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {activeFilterCount}
              </span>
            )}
          </span>
          <svg
            className={cn(
              "h-4 w-4 transition-transform",
              isDropdownOpen && "rotate-180"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>

        {isDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsDropdownOpen(false)}
            />
            <Card className="absolute top-full mt-2 w-80 z-50 p-4 space-y-4 max-h-[400px] overflow-y-auto">
              {groups.map(renderFilterGroup)}
              
              {(showApplyButton || showResetButton) && (
                <div className="flex items-center justify-between pt-4 border-t">
                  {showResetButton && activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={handleReset}
                    >
                      {norwegianLabels ? 'Tilbakestill' : 'Reset'}
                    </Button>
                  )}
                  {showApplyButton && (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleApply}
                      className="ml-auto"
                    >
                      {norwegianLabels ? 'Bruk' : 'Apply'}
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    );
  }

  // Default sidebar variant
  return (
    <Card className={cn("p-6 space-y-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{norwegianLabels ? 'Filtre' : 'Filters'}</h2>
        {showActiveCount && activeFilterCount > 0 && (
          <span className="text-sm text-muted-foreground">
            {activeFilterCount} {norwegianLabels ? 'aktive' : 'active'}
          </span>
        )}
      </div>

      <div className="space-y-6">
        {groups.map(renderFilterGroup)}
      </div>

      {(showApplyButton || showResetButton) && (
        <div className="flex flex-col gap-2 pt-6 border-t">
          {showApplyButton && (
            <Button
              variant="primary"
              onClick={handleApply}
              className="w-full"
            >
              {norwegianLabels ? 'Bruk filtre' : 'Apply filters'}
            </Button>
          )}
          {showResetButton && activeFilterCount > 0 && (
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full"
            >
              {norwegianLabels ? 'Tilbakestill alle' : 'Reset all'}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

// Pre-configured filter components
export const ProductFilter: React.FC<Omit<FilterProps, 'groups'>> = (props) => {
  const productGroups: FilterGroup[] = [
    {
      id: 'category',
      label: 'Kategori',
      type: 'checkbox',
      icon: '📦',
      options: [
        { value: 'electronics', label: 'Elektronikk', count: 245 },
        { value: 'clothing', label: 'Klær', count: 189 },
        { value: 'books', label: 'Bøker', count: 97 },
        { value: 'home', label: 'Hjem & Hage', count: 156 }
      ]
    },
    {
      id: 'price',
      label: 'Pris',
      type: 'range',
      icon: '💰',
      min: 0,
      max: 5000,
      step: 100
    },
    {
      id: 'brand',
      label: 'Merke',
      type: 'select',
      icon: '🏷️',
      placeholder: 'Velg merke',
      options: [
        { value: 'apple', label: 'Apple' },
        { value: 'samsung', label: 'Samsung' },
        { value: 'sony', label: 'Sony' },
        { value: 'lg', label: 'LG' }
      ]
    },
    {
      id: 'rating',
      label: 'Vurdering',
      type: 'radio',
      icon: '⭐',
      options: [
        { value: '4', label: '4 stjerner og opp', count: 156 },
        { value: '3', label: '3 stjerner og opp', count: 234 },
        { value: '2', label: '2 stjerner og opp', count: 289 },
        { value: '1', label: 'Alle vurderinger', count: 345 }
      ]
    }
  ];

  return <Filter {...props} groups={productGroups} />;
};

export const DateRangeFilter: React.FC<Omit<FilterProps, 'groups'>> = (props) => {
  const dateGroups: FilterGroup[] = [
    {
      id: 'dateRange',
      label: 'Datoperiode',
      type: 'date',
      icon: '📅'
    }
  ];

  return <Filter {...props} groups={dateGroups} variant="horizontal" />;
};