/**
 * Calendar Component - Professional Date Display and Selection
 * CLAUDE.md Compliant: Professional styling and accessibility
 * WCAG AAA: Full keyboard navigation and screen reader support
 * CVA: Class Variance Authority for consistent styling
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// =============================================================================
// CALENDAR VARIANTS
// =============================================================================

const calendarVariants = cva(
  [
    'rounded-lg border border-border bg-background p-6',
    'shadow-md',
    'focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2',
    'min-w-80'
  ],
  {
    variants: {
      variant: {
        default: 'border-border bg-background',
        minimal: 'border-0 shadow-none bg-transparent p-4',
        card: 'border-border bg-card shadow-lg',
        compact: 'p-3 min-w-72'
      },
      size: {
        sm: 'text-sm p-4 min-w-72',
        md: 'text-base p-6 min-w-80',
        lg: 'text-lg p-8 min-w-96'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

const dayVariants = cva(
  [
    'inline-flex items-center justify-center',
    'w-10 h-10 text-sm font-medium',
    'rounded-md transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'hover:bg-accent hover:text-accent-foreground'
  ],
  {
    variants: {
      variant: {
        default: 'text-foreground',
        selected: [
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90 focus:bg-primary/90',
          'shadow-sm'
        ],
        today: [
          'bg-accent text-accent-foreground',
          'font-semibold border border-primary/50',
          'hover:bg-accent/80'
        ],
        outside: 'text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground opacity-30 cursor-not-allowed',
        range: [
          'bg-accent/50 text-accent-foreground',
          'hover:bg-accent/70'
        ],
        rangeStart: [
          'bg-primary text-primary-foreground',
          'rounded-r-none'
        ],
        rangeEnd: [
          'bg-primary text-primary-foreground', 
          'rounded-l-none'
        ]
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

const headerVariants = cva([
  'flex items-center justify-between',
  'mb-6 pb-2 border-b border-border'
]);

const navigationButtonVariants = cva([
  'inline-flex items-center justify-center',
  'w-10 h-10 rounded-md',
  'text-muted-foreground hover:text-foreground',
  'hover:bg-accent hover:text-accent-foreground',
  'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'transition-colors duration-200'
]);

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface CalendarProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof calendarVariants> {
  readonly selectedDate?: Date | null;
  readonly selectedRange?: readonly [Date | null, Date | null];
  readonly onDateSelect?: (date: Date | null) => void;
  readonly onRangeSelect?: (range: readonly [Date | null, Date | null]) => void;
  readonly mode?: 'single' | 'range' | 'multiple';
  readonly disabled?: boolean | ((date: Date) => boolean);
  readonly minDate?: Date;
  readonly maxDate?: Date;
  readonly weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  readonly showOutsideDays?: boolean;
  readonly locale?: string;
  readonly numberOfMonths?: number;
  readonly defaultMonth?: Date;
  readonly fixedWeeks?: boolean;
  readonly ariaLabel?: string;
}

export interface CalendarHeaderProps {
  readonly currentMonth: Date;
  readonly onPreviousMonth: () => void;
  readonly onNextMonth: () => void;
  readonly onMonthSelect?: (month: Date) => void;
  readonly locale?: string;
  readonly disabled?: boolean;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isSameDay = (date1: Date | null, date2: Date | null): boolean => {
  if (!date1 || !date2) return false;
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return isSameDay(date, today);
};

const formatMonthYear = (date: Date, locale = 'nb-NO'): string => {
  return new Intl.DateTimeFormat(locale, { 
    month: 'long', 
    year: 'numeric' 
  }).format(date);
};

const formatWeekday = (date: Date, locale = 'nb-NO'): string => {
  return new Intl.DateTimeFormat(locale, { 
    weekday: 'short' 
  }).format(date);
};

// =============================================================================
// CALENDAR HEADER COMPONENT
// =============================================================================

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  onMonthSelect,
  locale = 'nb-NO',
  disabled = false
}) => (
  <div className={headerVariants()}>
    <button
      className={navigationButtonVariants()}
      onClick={onPreviousMonth}
      disabled={disabled}
      aria-label="Forrige måned"
      type="button"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
      </svg>
    </button>
    
    <div className="flex flex-col items-center">
      <button
        className="text-lg font-semibold text-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-2 py-1"
        onClick={() => onMonthSelect?.(currentMonth)}
        disabled={disabled}
        aria-label={`Velg måned og år: ${formatMonthYear(currentMonth, locale)}`}
        type="button"
      >
        {formatMonthYear(currentMonth, locale)}
      </button>
    </div>
    
    <button
      className={navigationButtonVariants()}
      onClick={onNextMonth}
      disabled={disabled}
      aria-label="Neste måned"
      type="button"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
      </svg>
    </button>
  </div>
);

// =============================================================================
// MAIN CALENDAR COMPONENT
// =============================================================================

export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(({
  className,
  variant,
  size,
  selectedDate,
  selectedRange,
  onDateSelect,
  onRangeSelect,
  mode = 'single',
  disabled = false,
  minDate,
  maxDate,
  weekStartsOn = 1, // Monday = 1 (Norwegian standard)
  showOutsideDays = true,
  locale = 'nb-NO',
  numberOfMonths = 1,
  defaultMonth,
  fixedWeeks = false,
  ariaLabel,
  ...props
}, ref) => {
  const [currentMonth, setCurrentMonth] = useState(
    defaultMonth || selectedDate || new Date()
  );
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    
    // Adjust first day based on weekStartsOn
    const adjustedFirstDay = (firstDayOfMonth - weekStartsOn + 7) % 7;
    
    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      isInRange: boolean;
      isRangeStart: boolean;
      isRangeEnd: boolean;
      isDisabled: boolean;
    }> = [];
    
    // Previous month days
    if (showOutsideDays) {
      const previousMonth = addMonths(currentMonth, -1);
      const daysInPreviousMonth = getDaysInMonth(previousMonth);
      
      for (let i = adjustedFirstDay - 1; i >= 0; i--) {
        const date = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), daysInPreviousMonth - i);
        days.push({
          date,
          isCurrentMonth: false,
          isToday: isToday(date),
          isSelected: mode === 'single' ? isSameDay(date, selectedDate) : false,
          isInRange: false,
          isRangeStart: false,
          isRangeEnd: false,
          isDisabled: typeof disabled === 'function' ? disabled(date) : !!disabled
        });
      }
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isDateSelected = mode === 'single' ? isSameDay(date, selectedDate) : false;
      
      let isInRange = false;
      let isRangeStart = false;
      let isRangeEnd = false;
      
      if (mode === 'range' && selectedRange) {
        const [start, end] = selectedRange;
        if (start && end) {
          isInRange = date >= start && date <= end;
          isRangeStart = isSameDay(date, start);
          isRangeEnd = isSameDay(date, end);
        } else if (start) {
          isRangeStart = isSameDay(date, start);
        }
      }
      
      const isDateDisabled = typeof disabled === 'function' ? disabled(date) : !!disabled ||
        (minDate && date < minDate) ||
        (maxDate && date > maxDate);
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isToday(date),
        isSelected: isDateSelected,
        isInRange,
        isRangeStart,
        isRangeEnd,
        isDisabled: isDateDisabled
      });
    }
    
    // Next month days
    const remainingDays = fixedWeeks ? 42 - days.length : Math.ceil((days.length) / 7) * 7 - days.length;
    if (showOutsideDays && remainingDays > 0) {
      const nextMonth = addMonths(currentMonth, 1);
      
      for (let day = 1; day <= remainingDays; day++) {
        const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day);
        days.push({
          date,
          isCurrentMonth: false,
          isToday: isToday(date),
          isSelected: mode === 'single' ? isSameDay(date, selectedDate) : false,
          isInRange: false,
          isRangeStart: false,
          isRangeEnd: false,
          isDisabled: typeof disabled === 'function' ? disabled(date) : !!disabled
        });
      }
    }
    
    return days;
  }, [currentMonth, selectedDate, selectedRange, mode, disabled, minDate, maxDate, weekStartsOn, showOutsideDays, fixedWeeks]);

  // Generate weekday headers
  const weekdays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(new Date(2024, 0, 1 + weekStartsOn + i), 0); // Start from a known Monday
      days.push(formatWeekday(date, locale));
    }
    return days;
  }, [weekStartsOn, locale]);

  // Handle date selection
  const handleDateSelect = useCallback((date: Date, dayInfo: typeof calendarDays[0]) => {
    if (dayInfo.isDisabled) return;
    
    if (mode === 'single') {
      onDateSelect?.(date);
    } else if (mode === 'range') {
      if (!selectedRange || !selectedRange[0]) {
        onRangeSelect?.([date, null]);
      } else if (!selectedRange[1]) {
        const [start] = selectedRange;
        if (date < start) {
          onRangeSelect?.([date, start]);
        } else {
          onRangeSelect?.([start, date]);
        }
      } else {
        onRangeSelect?.([date, null]);
      }
    }
    
    setFocusedDate(date);
  }, [mode, selectedRange, onDateSelect, onRangeSelect]);

  // Navigation handlers
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => addMonths(prev, -1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => addMonths(prev, 1));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!calendarRef.current?.contains(event.target as Node)) return;
      if (!focusedDate) return;
      
      let newFocusedDate = focusedDate;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          newFocusedDate = addDays(focusedDate, -1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          newFocusedDate = addDays(focusedDate, 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          newFocusedDate = addDays(focusedDate, -7);
          break;
        case 'ArrowDown':
          event.preventDefault();
          newFocusedDate = addDays(focusedDate, 7);
          break;
        case 'PageUp':
          event.preventDefault();
          newFocusedDate = addMonths(focusedDate, event.shiftKey ? -12 : -1);
          break;
        case 'PageDown':
          event.preventDefault();
          newFocusedDate = addMonths(focusedDate, event.shiftKey ? 12 : 1);
          break;
        case 'Home':
          event.preventDefault();
          newFocusedDate = new Date(focusedDate.getFullYear(), focusedDate.getMonth(), 1);
          break;
        case 'End':
          event.preventDefault();
          newFocusedDate = new Date(focusedDate.getFullYear(), focusedDate.getMonth() + 1, 0);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          const dayInfo = calendarDays.find(day => isSameDay(day.date, focusedDate));
          if (dayInfo) {
            handleDateSelect(focusedDate, dayInfo);
          }
          return;
        default:
          return;
      }
      
      setFocusedDate(newFocusedDate);
      
      // Update current month if focused date moves to a different month
      if (newFocusedDate.getMonth() !== currentMonth.getMonth() || 
          newFocusedDate.getFullYear() !== currentMonth.getFullYear()) {
        setCurrentMonth(new Date(newFocusedDate.getFullYear(), newFocusedDate.getMonth(), 1));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedDate, currentMonth, calendarDays, handleDateSelect]);

  // Get day variant
  const getDayVariant = useCallback((dayInfo: typeof calendarDays[0]) => {
    if (dayInfo.isDisabled) return 'disabled';
    if (!dayInfo.isCurrentMonth) return 'outside';
    if (dayInfo.isRangeStart) return 'rangeStart';
    if (dayInfo.isRangeEnd) return 'rangeEnd';
    if (dayInfo.isInRange) return 'range';
    if (dayInfo.isSelected) return 'selected';
    if (dayInfo.isToday) return 'today';
    return 'default';
  }, []);

  return (
    <div
      ref={ref || calendarRef}
      className={cn(calendarVariants({ variant, size }), className)}
      role="application"
      aria-label={ariaLabel || 'Kalender'}
      {...props}
    >
      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        locale={locale}
        disabled={typeof disabled === 'boolean' ? disabled : false}
      />
      
      <div className="space-y-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1">
          {weekdays.map((weekday, index) => (
            <div
              key={index}
              className="text-center text-sm font-medium text-muted-foreground py-2"
              aria-hidden="true"
            >
              {weekday}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1" role="grid">
          {calendarDays.map((dayInfo, index) => {
            const isFocused = focusedDate && isSameDay(dayInfo.date, focusedDate);
            
            return (
              <button
                key={index}
                className={cn(
                  dayVariants({ variant: getDayVariant(dayInfo) }),
                  isFocused && 'ring-2 ring-primary ring-offset-1'
                )}
                onClick={() => handleDateSelect(dayInfo.date, dayInfo)}
                onFocus={() => setFocusedDate(dayInfo.date)}
                disabled={dayInfo.isDisabled}
                type="button"
                role="gridcell"
                aria-selected={dayInfo.isSelected || dayInfo.isInRange}
                aria-current={dayInfo.isToday ? 'date' : undefined}
                aria-label={`${dayInfo.date.getDate()} ${formatMonthYear(dayInfo.date, locale)}`}
                tabIndex={isFocused ? 0 : -1}
              >
                {dayInfo.date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Screen reader instructions */}
      <div className="sr-only" aria-live="polite">
        Bruk piltastene for å navigere. Enter eller mellomrom for å velge dato.
        Page Up/Page Down for å bytte måned. Shift + Page Up/Page Down for å bytte år.
      </div>
    </div>
  );
});

Calendar.displayName = 'Calendar';

// Export types and variants
export type { VariantProps };
export { calendarVariants, dayVariants };