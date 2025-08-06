/**
 * Select Component - Dropdown Selection Inputs
 * CLAUDE.md Compliant: Professional sizing (minimum h-14 equivalent)
 * WCAG AAA: Full keyboard navigation, ARIA support, and screen reader compatibility
 * CVA: Class Variance Authority for consistent styling
 * Universal Tokens: Uses design system tokens for consistency
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

const selectTriggerVariants = cva(
  [
    'flex w-full items-center justify-between rounded-lg border-2 border-input bg-background px-4 py-3',
    'text-base text-foreground placeholder:text-muted-foreground',
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20 focus:border-primary',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'hover:border-primary/50',
    // Professional minimum height (CLAUDE.md compliant)
    'min-h-[3.5rem]'
  ],
  {
    variants: {
      size: {
        sm: 'h-10 px-3 py-2 text-sm min-h-[2.5rem]',
        md: 'h-12 px-4 py-3 text-base min-h-[3rem]',
        lg: 'h-14 px-5 py-4 text-lg min-h-[3.5rem]', // CLAUDE.md preferred
        xl: 'h-16 px-6 py-5 text-xl min-h-[4rem]'
      },
      variant: {
        default: 'border-input',
        error: 'border-destructive focus:ring-destructive/20 focus:border-destructive',
        success: 'border-green-600 focus:ring-green-600/20 focus:border-green-600',
        warning: 'border-yellow-600 focus:ring-yellow-600/20 focus:border-yellow-600',
        // NSM Security Classification variants
        nsmOpen: 'border-l-4 border-l-green-600 border-input shadow-sm',
        nsmRestricted: 'border-l-4 border-l-yellow-600 border-input shadow-sm',
        nsmConfidential: 'border-l-4 border-l-red-600 border-input shadow-sm',
        nsmSecret: 'border-l-4 border-l-gray-800 border-input shadow-sm'
      },
      multiple: {
        true: 'min-h-[3.5rem] py-2',
        false: ''
      }
    },
    defaultVariants: {
      size: 'lg',
      variant: 'default',
      multiple: false
    }
  }
);

const selectContentVariants = cva(
  [
    'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
    'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
  ],
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl'
      }
    },
    defaultVariants: {
      size: 'lg'
    }
  }
);

const selectItemVariants = cva(
  [
    'relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-2 text-sm',
    'outline-none transition-all duration-150',
    'focus:bg-accent focus:text-accent-foreground',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    'data-[selected]:bg-primary/10 data-[selected]:font-medium',
    // Professional minimum height
    'min-h-[2.5rem]'
  ],
  {
    variants: {
      size: {
        sm: 'py-1.5 pl-6 pr-2 text-sm min-h-[2rem]',
        md: 'py-2 pl-8 pr-2 text-base min-h-[2.5rem]',
        lg: 'py-2.5 pl-10 pr-3 text-lg min-h-[3rem]',
        xl: 'py-3 pl-12 pr-4 text-xl min-h-[3.5rem]'
      }
    },
    defaultVariants: {
      size: 'lg'
    }
  }
);

// Types
export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
  readonly description?: string;
  readonly icon?: React.ReactNode;
  readonly group?: string;
}

export interface SelectProps extends 
  Omit<React.HTMLAttributes<HTMLDivElement>, 'value' | 'defaultValue' | 'onChange'>,
  VariantProps<typeof selectTriggerVariants> {
  readonly value?: string | string[];
  readonly defaultValue?: string | string[];
  readonly onValueChange?: (value: string | string[]) => void;
  readonly options: SelectOption[];
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly clearable?: boolean;
  readonly searchable?: boolean;
  readonly multiple?: boolean;
  readonly loading?: boolean;
  readonly error?: boolean;
  readonly errorMessage?: string;
  readonly helperText?: string;
  readonly maxSelection?: number;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly emptyMessage?: string;
  readonly createable?: boolean;
  readonly onCreateOption?: (inputValue: string) => void;
}

// Portal component
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

// Main Select Component
export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ 
    className, 
    size = 'lg',
    variant = 'default',
    multiple = false,
    value: controlledValue,
    defaultValue,
    onValueChange,
    options = [],
    placeholder = 'Velg...',
    disabled = false,
    required = false,
    clearable = false,
    searchable = false,
    loading = false,
    error = false,
    errorMessage,
    helperText,
    maxSelection,
    nsmClassification,
    emptyMessage = 'Ingen alternativer funnet',
    createable = false,
    onCreateOption,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [focusedIndex, setFocusedIndex] = React.useState(-1);
    
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const searchRef = React.useRef<HTMLInputElement>(null);
    
    // Handle controlled/uncontrolled value
    const [uncontrolledValue, setUncontrolledValue] = React.useState(
      defaultValue || (multiple ? [] : '')
    );
    
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;
    
    // Auto-select NSM variant if classification is provided
    const finalVariant = nsmClassification 
      ? `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret'
      : error ? 'error' : variant;

    // Filter options based on search term
    const filteredOptions = React.useMemo(() => {
      if (!searchTerm) return options;
      return options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }, [options, searchTerm]);

    // Group filtered options
    const groupedOptions = React.useMemo(() => {
      const groups: Record<string, SelectOption[]> = {};
      const ungrouped: SelectOption[] = [];
      
      filteredOptions.forEach(option => {
        if (option.group) {
          if (!groups[option.group]) groups[option.group] = [];
          groups[option.group].push(option);
        } else {
          ungrouped.push(option);
        }
      });
      
      return { groups, ungrouped };
    }, [filteredOptions]);

    // Get selected options
    const selectedOptions = React.useMemo(() => {
      if (multiple && Array.isArray(value)) {
        return options.filter(option => value.includes(option.value));
      } else if (!multiple && typeof value === 'string') {
        return options.filter(option => option.value === value);
      }
      return [];
    }, [options, value, multiple]);

    // Handle value change
    const handleValueChange = React.useCallback((newValue: string | string[]) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
    }, [isControlled, onValueChange]);

    // Handle option selection
    const handleOptionSelect = React.useCallback((optionValue: string) => {
      if (multiple && Array.isArray(value)) {
        const currentValues = value as string[];
        const newValues = currentValues.includes(optionValue)
          ? currentValues.filter(v => v !== optionValue)
          : [...currentValues, optionValue];
        
        // Check max selection limit
        if (maxSelection && newValues.length > maxSelection && !currentValues.includes(optionValue)) {
          return;
        }
        
        handleValueChange(newValues);
      } else {
        handleValueChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
      }
    }, [multiple, value, maxSelection, handleValueChange]);

    // Handle clear selection
    const handleClear = React.useCallback((event: React.MouseEvent) => {
      event.stopPropagation();
      handleValueChange(multiple ? [] : '');
    }, [multiple, handleValueChange]);

    // Handle keyboard navigation
    const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
            handleOptionSelect(filteredOptions[focusedIndex].value);
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          setSearchTerm('');
          triggerRef.current?.focus();
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setFocusedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (isOpen) {
            setFocusedIndex(prev => Math.max(prev - 1, -1));
          }
          break;
        case ' ':
          if (!searchable) {
            event.preventDefault();
            setIsOpen(!isOpen);
          }
          break;
      }
    }, [disabled, isOpen, focusedIndex, filteredOptions, handleOptionSelect, searchable]);

    // Handle outside click
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          contentRef.current && 
          !contentRef.current.contains(event.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchTerm('');
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    // Focus search input when opened
    React.useEffect(() => {
      if (isOpen && searchable && searchRef.current) {
        searchRef.current.focus();
      }
    }, [isOpen, searchable]);

    // Create option handler
    const handleCreateOption = React.useCallback(() => {
      if (createable && searchTerm && onCreateOption) {
        onCreateOption(searchTerm);
        setSearchTerm('');
        setIsOpen(false);
      }
    }, [createable, searchTerm, onCreateOption]);

    // Generate unique ID for accessibility
    const selectId = React.useId();
    const contentId = `${selectId}-content`;
    const helperId = helperText || errorMessage ? `${selectId}-helper` : undefined;

    return (
      <div ref={ref} className={cn('relative w-full', className)} {...props}>
        {/* Select Trigger */}
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={contentId}
          aria-describedby={helperId}
          aria-invalid={error}
          aria-required={required}
          disabled={disabled}
          className={cn(
            selectTriggerVariants({ size, variant: finalVariant, multiple }),
            className
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Selected Values Display */}
            {multiple && selectedOptions.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedOptions.map((option) => (
                  <span
                    key={option.value}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-sm"
                  >
                    {option.label}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOptionSelect(option.value);
                      }}
                      className="hover:bg-primary/20 rounded p-0.5"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <span className={cn(
                'truncate',
                !selectedOptions.length && 'text-muted-foreground'
              )}>
                {selectedOptions.length > 0 ? selectedOptions[0].label : placeholder}
              </span>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1">
            {/* Loading Spinner */}
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            
            {/* Clear Button */}
            {clearable && selectedOptions.length > 0 && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 hover:bg-accent rounded"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
            
            {/* Dropdown Icon */}
            {!loading && (
              <div className="p-0.5">
                {isOpen ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )}
              </div>
            )}
          </div>
        </button>

        {/* Dropdown Content */}
        {isOpen && (
          <Portal>
            <div
              ref={contentRef}
              id={contentId}
              role="listbox"
              aria-multiselectable={multiple}
              className={cn(
                selectContentVariants({ size }),
                'absolute top-full left-0 right-0 mt-1 z-50'
              )}
              style={{
                minWidth: triggerRef.current?.getBoundingClientRect().width
              }}
            >
              {/* Search Input */}
              {searchable && (
                <div className="flex items-center border-b px-3 pb-2">
                  <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground mr-2" />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Søk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 outline-none bg-transparent text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && createable && searchTerm) {
                        e.preventDefault();
                        handleCreateOption();
                      }
                    }}
                  />
                </div>
              )}

              {/* Options List */}
              <div className="max-h-80 overflow-y-auto py-1">
                {/* Ungrouped Options */}
                {groupedOptions.ungrouped.map((option, index) => (
                  <SelectOption
                    key={option.value}
                    option={option}
                    size={size}
                    selected={multiple 
                      ? Array.isArray(value) && value.includes(option.value)
                      : value === option.value
                    }
                    focused={index === focusedIndex}
                    onSelect={() => handleOptionSelect(option.value)}
                  />
                ))}

                {/* Grouped Options */}
                {Object.entries(groupedOptions.groups).map(([groupName, groupOptions]) => (
                  <div key={groupName}>
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-t">
                      {groupName}
                    </div>
                    {groupOptions.map((option, index) => (
                      <SelectOption
                        key={option.value}
                        option={option}
                        size={size}
                        selected={multiple 
                          ? Array.isArray(value) && value.includes(option.value)
                          : value === option.value
                        }
                        focused={groupedOptions.ungrouped.length + index === focusedIndex}
                        onSelect={() => handleOptionSelect(option.value)}
                      />
                    ))}
                  </div>
                ))}

                {/* Create Option */}
                {createable && searchTerm && !filteredOptions.some(o => o.label.toLowerCase() === searchTerm.toLowerCase()) && (
                  <button
                    type="button"
                    onClick={handleCreateOption}
                    className={cn(
                      selectItemVariants({ size }),
                      'w-full text-left border-t'
                    )}
                  >
                    Opprett "{searchTerm}"
                  </button>
                )}

                {/* Empty State */}
                {filteredOptions.length === 0 && (
                  <div className="px-3 py-2 text-center text-muted-foreground text-sm">
                    {emptyMessage}
                  </div>
                )}
              </div>
            </div>
          </Portal>
        )}

        {/* Helper Text */}
        {(helperText || errorMessage) && (
          <p 
            id={helperId}
            className={cn(
              'mt-2 text-sm',
              error ? 'text-destructive' : 'text-muted-foreground'
            )}
            role={error ? 'alert' : undefined}
          >
            {errorMessage || helperText}
          </p>
        )}

        {/* NSM Classification for screen readers */}
        {nsmClassification && (
          <span className="sr-only">
            Select NSM-klassifisering: {nsmClassification}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Select Option Component
export interface SelectOptionProps {
  option: SelectOption;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  selected: boolean;
  focused: boolean;
  onSelect: () => void;
}

const SelectOption: React.FC<SelectOptionProps> = ({
  option,
  size = 'lg',
  selected,
  focused,
  onSelect
}) => {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      disabled={option.disabled}
      className={cn(
        selectItemVariants({ size }),
        focused && 'bg-accent text-accent-foreground',
        selected && 'bg-primary/10 font-medium'
      )}
      onClick={onSelect}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {selected && <CheckIcon className="h-4 w-4" />}
      </span>
      
      <div className="flex items-center gap-2">
        {option.icon && (
          <span className="flex-shrink-0">
            {option.icon}
          </span>
        )}
        
        <div className="flex flex-col items-start">
          <span className="truncate">{option.label}</span>
          {option.description && (
            <span className="text-xs text-muted-foreground truncate">
              {option.description}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// Export variants and types
export { selectTriggerVariants, selectContentVariants, selectItemVariants };
export type { VariantProps, SelectOption };