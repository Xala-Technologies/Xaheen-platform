/**
 * Table Component - Professional Data Display Implementation
 * CLAUDE.md Compliant: Professional styling and accessibility
 * WCAG AAA: Full keyboard navigation and screen reader support
 * CVA: Class Variance Authority for consistent styling
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// =============================================================================
// TABLE VARIANTS
// =============================================================================

const tableVariants = cva(
  [
    'w-full border-collapse border-spacing-0',
    'text-sm text-left',
    'bg-card text-card-foreground',
    'rounded-lg overflow-hidden',
    'shadow-sm border border-border'
  ],
  {
    variants: {
      variant: {
        default: 'bg-background',
        card: 'bg-card border border-border shadow-md',
        minimal: 'bg-transparent border-0 shadow-none',
        striped: 'bg-background [&>tbody>tr:nth-child(even)]:bg-muted/50'
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
      },
      density: {
        compact: '[&_th]:py-2 [&_th]:px-3 [&_td]:py-2 [&_td]:px-3',
        comfortable: '[&_th]:py-3 [&_th]:px-4 [&_td]:py-3 [&_td]:px-4',
        spacious: '[&_th]:py-4 [&_th]:px-6 [&_td]:py-4 [&_td]:px-6'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      density: 'comfortable'
    }
  }
);

const tableHeaderVariants = cva(
  [
    'border-b bg-muted/50',
    'font-semibold text-muted-foreground',
    'whitespace-nowrap'
  ]
);

const tableCellVariants = cva(
  [
    'border-b border-border last:border-r-0',
    'align-top',
    'transition-colors duration-200'
  ]
);

const tableRowVariants = cva(
  [
    'transition-colors duration-200',
    'hover:bg-muted/50',
    'focus-within:bg-muted/50',
    '[&:has([role=checkbox][aria-checked=true])]:bg-muted'
  ],
  {
    variants: {
      clickable: {
        true: 'cursor-pointer active:bg-muted/75',
        false: ''
      },
      selected: {
        true: 'bg-primary/10 hover:bg-primary/20',
        false: ''
      }
    },
    defaultVariants: {
      clickable: false,
      selected: false
    }
  }
);

const sortButtonVariants = cva(
  [
    'inline-flex items-center gap-1',
    'font-semibold text-left',
    'transition-colors duration-200',
    'hover:text-foreground',
    'focus:outline-none focus:text-foreground',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ]
);

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface ColumnDef<T = any> {
  readonly id: string;
  readonly header: string;
  readonly accessorKey?: keyof T;
  readonly cell?: (value: T[keyof T], row: T, index: number) => React.ReactNode;
  readonly sortable?: boolean;
  readonly filterable?: boolean;
  readonly width?: string | number;
  readonly minWidth?: string | number;
  readonly maxWidth?: string | number;
  readonly align?: 'left' | 'center' | 'right';
  readonly sticky?: 'left' | 'right';
}

export interface SortConfig {
  readonly key: string;
  readonly direction: 'asc' | 'desc';
}

export interface TableProps<T = any> extends 
  React.TableHTMLAttributes<HTMLTableElement>,
  VariantProps<typeof tableVariants> {
  readonly data: readonly T[];
  readonly columns: readonly ColumnDef<T>[];
  readonly loading?: boolean;
  readonly sortable?: boolean;
  readonly selectable?: boolean;
  readonly onRowClick?: (row: T, index: number) => void;
  readonly onSort?: (sortConfig: SortConfig | null) => void;
  readonly onSelectionChange?: (selectedRows: readonly T[]) => void;
  readonly selectedRows?: readonly T[];
  readonly getRowId?: (row: T) => string | number;
  readonly emptyMessage?: string;
  readonly stickyHeader?: boolean;
  readonly maxHeight?: string;
  readonly caption?: string;
  readonly ariaLabel?: string;
}

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  readonly children: React.ReactNode;
}

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  readonly children: React.ReactNode;
}

export interface TableRowProps extends 
  React.HTMLAttributes<HTMLTableRowElement>,
  VariantProps<typeof tableRowVariants> {
  readonly children: React.ReactNode;
}

export interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  readonly children: React.ReactNode;
  readonly header?: boolean;
  readonly align?: 'left' | 'center' | 'right';
  readonly sticky?: 'left' | 'right';
  readonly width?: string | number;
}

// =============================================================================
// SORT ICON COMPONENT
// =============================================================================

const SortIcon: React.FC<{ readonly direction: 'asc' | 'desc' | null }> = ({ direction }) => (
  <span className="inline-flex flex-col ml-1" aria-hidden="true">
    <svg 
      className={cn(
        'w-3 h-3 -mb-1 transition-colors',
        direction === 'asc' ? 'text-foreground' : 'text-muted-foreground'
      )} 
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      <path d="M7 14l5-5 5 5z" />
    </svg>
    <svg 
      className={cn(
        'w-3 h-3 transition-colors',
        direction === 'desc' ? 'text-foreground' : 'text-muted-foreground'
      )} 
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      <path d="M7 10l5 5 5-5z" />
    </svg>
  </span>
);

// =============================================================================
// LOADING SKELETON
// =============================================================================

const TableSkeleton: React.FC<{ readonly columns: number; readonly rows?: number }> = ({ 
  columns, 
  rows = 5 
}) => (
  <div className="space-y-3">
    {/* Header skeleton */}
    <div className="flex gap-4">
      {Array.from({ length: columns }).map((_, index) => (
        <div key={index} className="h-4 bg-muted animate-pulse rounded flex-1" />
      ))}
    </div>
    
    {/* Rows skeleton */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div key={colIndex} className="h-6 bg-muted/50 animate-pulse rounded flex-1" />
        ))}
      </div>
    ))}
  </div>
);

// =============================================================================
// TABLE COMPONENTS
// =============================================================================

export const Table = React.forwardRef<HTMLTableElement, TableProps>(({
  className,
  variant,
  size,
  density,
  data,
  columns,
  loading = false,
  sortable = false,
  selectable = false,
  onRowClick,
  onSort,
  onSelectionChange,
  selectedRows = [],
  getRowId,
  emptyMessage = 'No data available',
  stickyHeader = false,
  maxHeight,
  caption,
  ariaLabel,
  ...props
}, ref) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [internalSelectedRows, setInternalSelectedRows] = useState<readonly any[]>([]);
  const tableRef = useRef<HTMLTableElement>(null);

  // Use internal selection state if not controlled
  const currentSelectedRows = selectedRows.length > 0 ? selectedRows : internalSelectedRows;

  // Sort data if sortable
  const sortedData = useMemo(() => {
    if (!sortable || !sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const column = columns.find(col => col.id === sortConfig.key);
      if (!column?.accessorKey) return 0;
      
      const aVal = a[column.accessorKey];
      const bVal = b[column.accessorKey];
      
      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;
      
      return sortConfig.direction === 'desc' ? -comparison : comparison;
    });
  }, [data, sortConfig, sortable, columns]);

  // Handle column sort
  const handleSort = useCallback((columnId: string) => {
    if (!sortable) return;
    
    const newSortConfig: SortConfig = {
      key: columnId,
      direction: sortConfig?.key === columnId && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    };
    
    setSortConfig(newSortConfig);
    onSort?.(newSortConfig);
  }, [sortable, sortConfig, onSort]);

  // Handle row selection
  const handleRowSelect = useCallback((row: any, selected: boolean) => {
    if (!selectable) return;
    
    const rowId = getRowId ? getRowId(row) : row;
    let newSelection: readonly any[];
    
    if (selected) {
      newSelection = [...currentSelectedRows, row];
    } else {
      newSelection = currentSelectedRows.filter(selectedRow => {
        const selectedRowId = getRowId ? getRowId(selectedRow) : selectedRow;
        return selectedRowId !== rowId;
      });
    }
    
    setInternalSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  }, [selectable, currentSelectedRows, getRowId, onSelectionChange]);

  // Handle select all
  const handleSelectAll = useCallback((selected: boolean) => {
    if (!selectable) return;
    
    const newSelection = selected ? sortedData : [];
    setInternalSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  }, [selectable, sortedData, onSelectionChange]);

  // Check if row is selected
  const isRowSelected = useCallback((row: any) => {
    if (!selectable) return false;
    
    const rowId = getRowId ? getRowId(row) : row;
    return currentSelectedRows.some(selectedRow => {
      const selectedRowId = getRowId ? getRowId(selectedRow) : selectedRow;
      return selectedRowId === rowId;
    });
  }, [selectable, currentSelectedRows, getRowId]);

  const allSelected = selectable && sortedData.length > 0 && currentSelectedRows.length === sortedData.length;
  const someSelected = selectable && currentSelectedRows.length > 0 && currentSelectedRows.length < sortedData.length;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!tableRef.current?.contains(event.target as Node)) return;
      
      const focusedElement = document.activeElement as HTMLElement;
      
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        
        const rows = Array.from(tableRef.current.querySelectorAll('tbody tr'));
        const currentIndex = rows.findIndex(row => row.contains(focusedElement));
        
        if (currentIndex === -1) return;
        
        const nextIndex = event.key === 'ArrowDown' 
          ? Math.min(currentIndex + 1, rows.length - 1)
          : Math.max(currentIndex - 1, 0);
          
        const nextRow = rows[nextIndex] as HTMLElement;
        nextRow.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div 
        className={cn(tableVariants({ variant, size, density }), className)}
        style={{ maxHeight }}
        aria-label={ariaLabel || 'Loading table data'}
        role="status"
        aria-live="polite"
      >
        <TableSkeleton columns={columns.length} />
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'relative overflow-auto rounded-lg border border-border',
        maxHeight && 'max-h-96'
      )}
      style={{ maxHeight }}
    >
      <table
        ref={ref || tableRef}
        className={cn(tableVariants({ variant, size, density }), className)}
        aria-label={ariaLabel}
        {...props}
      >
        {caption && <caption className="sr-only">{caption}</caption>}
        
        <TableHeader className={cn(stickyHeader && 'sticky top-0 z-10')}>
          <TableRow>
            {selectable && (
              <TableCell header align="center" width="48px">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  aria-label="Select all rows"
                  className="h-4 w-4 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                />
              </TableCell>
            )}
            
            {columns.map((column) => (
              <TableCell
                key={column.id}
                header
                align={column.align}
                sticky={column.sticky}
                width={column.width}
                style={{
                  minWidth: column.minWidth,
                  maxWidth: column.maxWidth
                }}
              >
                {column.sortable && sortable ? (
                  <button
                    className={sortButtonVariants()}
                    onClick={() => handleSort(column.id)}
                    aria-label={`Sort by ${column.header} ${
                      sortConfig?.key === column.id 
                        ? sortConfig.direction === 'asc' ? 'descending' : 'ascending'
                        : 'ascending'
                    }`}
                  >
                    {column.header}
                    <SortIcon
                      direction={
                        sortConfig?.key === column.id ? sortConfig.direction : null
                      }
                    />
                  </button>
                ) : (
                  column.header
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length + (selectable ? 1 : 0)}
                align="center"
                className="py-12 text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((row, rowIndex) => {
              const isSelected = isRowSelected(row);
              const rowId = getRowId ? getRowId(row) : rowIndex;
              
              return (
                <TableRow
                  key={rowId}
                  clickable={!!onRowClick}
                  selected={isSelected}
                  onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onRowClick?.(row, rowIndex);
                    }
                  }}
                  tabIndex={onRowClick ? 0 : undefined}
                  role={onRowClick ? 'button' : undefined}
                  aria-selected={selectable ? isSelected : undefined}
                >
                  {selectable && (
                    <TableCell align="center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleRowSelect(row, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select row ${rowIndex + 1}`}
                        className="h-4 w-4 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                      />
                    </TableCell>
                  )}
                  
                  {columns.map((column) => {
                    const value = column.accessorKey ? row[column.accessorKey] : undefined;
                    const cellContent = column.cell ? column.cell(value, row, rowIndex) : value;
                    
                    return (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        sticky={column.sticky}
                        width={column.width}
                        style={{
                          minWidth: column.minWidth,
                          maxWidth: column.maxWidth
                        }}
                      >
                        {cellContent}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </table>
    </div>
  );
});

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <thead ref={ref} className={cn(tableHeaderVariants(), className)} {...props}>
      {children}
    </thead>
  )
);

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => (
    <tbody ref={ref} className={cn('divide-y divide-border', className)} {...props}>
      {children}
    </tbody>
  )
);

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, clickable, selected, children, ...props }, ref) => (
    <tr 
      ref={ref} 
      className={cn(tableRowVariants({ clickable, selected }), className)} 
      {...props}
    >
      {children}
    </tr>
  )
);

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, children, header = false, align = 'left', sticky, width, ...props }, ref) => {
    const Component = header ? 'th' : 'td';
    
    return (
      <Component
        ref={ref}
        className={cn(
          tableCellVariants(),
          align === 'center' && 'text-center',
          align === 'right' && 'text-right',
          sticky === 'left' && 'sticky left-0 bg-background',
          sticky === 'right' && 'sticky right-0 bg-background',
          header && 'font-semibold text-muted-foreground bg-muted/50',
          className
        )}
        style={{ width }}
        scope={header ? 'col' : undefined}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

// Display names for React DevTools
Table.displayName = 'Table';
TableHeader.displayName = 'TableHeader';
TableBody.displayName = 'TableBody';
TableRow.displayName = 'TableRow';
TableCell.displayName = 'TableCell';

// Export types and variants
export type { VariantProps, ColumnDef, SortConfig };
export { tableVariants, tableHeaderVariants, tableCellVariants, tableRowVariants };