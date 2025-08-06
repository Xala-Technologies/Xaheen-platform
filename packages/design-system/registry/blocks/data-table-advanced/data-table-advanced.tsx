/**
 * Data Table Advanced Block - Enterprise Data Grid
 * WCAG AAA compliant with sorting, filtering, pagination, and selection
 * Norwegian standards with NSM classification support
 */

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/button/button';
import { Input } from '../../components/input/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/card/card';

export interface TableColumn<T = any> {
  readonly id: keyof T;
  readonly title: string;
  readonly description?: string;
  readonly sortable?: boolean;
  readonly filterable?: boolean;
  readonly width?: string | number;
  readonly minWidth?: string | number;
  readonly maxWidth?: string | number;
  readonly align?: 'left' | 'center' | 'right';
  readonly render?: (value: any, row: T, index: number) => React.ReactNode;
  readonly sortFn?: (a: T, b: T) => number;
  readonly filterFn?: (value: any, filterValue: string) => boolean;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

export interface TableAction<T = any> {
  readonly id: string;
  readonly title: string;
  readonly icon?: React.ReactNode;
  readonly variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  readonly disabled?: (row: T) => boolean;
  readonly hidden?: (row: T) => boolean;
  readonly action: (row: T, index: number) => void | Promise<void>;
  readonly shortcut?: string[];
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

export interface TableTexts {
  readonly title: string;
  readonly description: string;
  readonly searchPlaceholder: string;
  readonly noDataMessage: string;
  readonly loadingMessage: string;
  readonly selectedCountLabel: string;
  readonly rowsPerPageLabel: string;
  readonly pageLabel: string;
  readonly ofLabel: string;
  readonly previousPage: string;
  readonly nextPage: string;
  readonly firstPage: string;
  readonly lastPage: string;
  readonly sortAscending: string;
  readonly sortDescending: string;
  readonly clearSort: string;
  readonly filterColumn: string;
  readonly clearFilter: string;
  readonly selectRow: string;
  readonly selectAllRows: string;
  readonly actionsLabel: string;
  readonly moreActionsLabel: string;
  readonly exportData: string;
  readonly refreshData: string;
  readonly columnSettings: string;
  readonly tableAnnouncement: string;
  readonly sortedByAnnouncement: string;
  readonly filteredByAnnouncement: string;
}

export interface TableState<T = any> {
  readonly data: T[];
  readonly filteredData: T[];
  readonly selectedRows: Set<number>;
  readonly currentPage: number;
  readonly rowsPerPage: number;
  readonly sortColumn?: keyof T;
  readonly sortDirection: 'asc' | 'desc' | null;
  readonly globalFilter: string;
  readonly columnFilters: Record<keyof T, string>;
  readonly loading: boolean;
  readonly error?: string;
}

export interface TableCallbacks<T = any> {
  readonly onRowSelect?: (rowIndex: number, row: T) => void;
  readonly onRowsSelect?: (selectedIndexes: number[], selectedRows: T[]) => void;
  readonly onSort?: (column: keyof T, direction: 'asc' | 'desc' | null) => void;
  readonly onFilter?: (column: keyof T, value: string) => void;
  readonly onGlobalFilter?: (value: string) => void;
  readonly onPageChange?: (page: number) => void;
  readonly onRowsPerPageChange?: (rowsPerPage: number) => void;
  readonly onRefresh?: () => void;
  readonly onExport?: (data: T[]) => void;
  readonly onAnnounce?: (message: string) => void;
  readonly onStateChange?: (state: Partial<TableState<T>>) => void;
}

export interface DataTableAdvancedProps<T = any> {
  readonly texts?: Partial<TableTexts>;
  readonly columns: TableColumn<T>[];
  readonly actions?: TableAction<T>[];
  readonly callbacks: TableCallbacks<T>;
  readonly state?: Partial<TableState<T>>;
  readonly className?: string;
  readonly showHeader?: boolean;
  readonly showSearch?: boolean;
  readonly showPagination?: boolean;
  readonly showRowSelection?: boolean;
  readonly showActions?: boolean;
  readonly showExport?: boolean;
  readonly showRefresh?: boolean;
  readonly striped?: boolean;
  readonly hoverable?: boolean;
  readonly compact?: boolean;
  readonly stickyHeader?: boolean;
  readonly maxHeight?: string;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly pageSize?: number;
  readonly pageSizeOptions?: number[];
}

const defaultTexts: TableTexts = {
  title: 'Datatabell',
  description: 'Avansert datatabell med sortering, filtrering og paginering',
  searchPlaceholder: 'Søk i tabellen...',
  noDataMessage: 'Ingen data tilgjengelig',
  loadingMessage: 'Laster data...',
  selectedCountLabel: 'valgte rader',
  rowsPerPageLabel: 'Rader per side:',
  pageLabel: 'Side',
  ofLabel: 'av',
  previousPage: 'Forrige side',
  nextPage: 'Neste side',
  firstPage: 'Første side',
  lastPage: 'Siste side',
  sortAscending: 'Sorter stigende',
  sortDescending: 'Sorter synkende',
  clearSort: 'Fjern sortering',
  filterColumn: 'Filtrer kolonne',
  clearFilter: 'Fjern filter',
  selectRow: 'Velg rad',
  selectAllRows: 'Velg alle rader',
  actionsLabel: 'Handlinger',
  moreActionsLabel: 'Flere handlinger',
  exportData: 'Eksporter data',
  refreshData: 'Oppdater data',
  columnSettings: 'Kolonneinnstillinger',
  tableAnnouncement: 'Datatabell med {} rader og {} kolonner',
  sortedByAnnouncement: 'Sortert etter {} {}',
  filteredByAnnouncement: 'Filtrert på {}'
};

const defaultState: TableState = {
  data: [],
  filteredData: [],
  selectedRows: new Set(),
  currentPage: 1,
  rowsPerPage: 10,
  sortDirection: null,
  globalFilter: '',
  columnFilters: {},
  loading: false
};

export function DataTableAdvanced<T extends Record<string, any>>({
  texts = {},
  columns,
  actions = [],
  callbacks,
  state = {},
  className,
  showHeader = true,
  showSearch = true,
  showPagination = true,
  showRowSelection = true,
  showActions = true,
  showExport = true,
  showRefresh = true,
  striped = true,
  hoverable = true,
  compact = false,
  stickyHeader = false,
  maxHeight,
  nsmClassification,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50, 100]
}: DataTableAdvancedProps<T>): JSX.Element {
  
  const t = { ...defaultTexts, ...texts };
  const currentState = { 
    ...defaultState, 
    rowsPerPage: pageSize,
    ...state 
  } as TableState<T>;
  
  const {
    data,
    selectedRows,
    currentPage,
    rowsPerPage,
    sortColumn,
    sortDirection,
    globalFilter,
    columnFilters,
    loading,
    error
  } = currentState;

  // Update state helper
  const updateState = useCallback((updates: Partial<TableState<T>>) => {
    callbacks.onStateChange?.(updates);
  }, [callbacks]);

  const announce = useCallback((message: string) => {
    callbacks.onAnnounce?.(message);
  }, [callbacks]);

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Apply global filter
    if (globalFilter) {
      const lowerFilter = globalFilter.toLowerCase();
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(lowerFilter)
        )
      );
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([columnId, filterValue]) => {
      if (filterValue) {
        const column = columns.find(col => col.id === columnId);
        if (column?.filterFn) {
          filtered = filtered.filter(row => 
            column.filterFn!(row[columnId], filterValue)
          );
        } else {
          filtered = filtered.filter(row =>
            String(row[columnId]).toLowerCase().includes(filterValue.toLowerCase())
          );
        }
      }
    });

    // Apply sorting
    if (sortColumn && sortDirection) {
      const column = columns.find(col => col.id === sortColumn);
      if (column?.sortFn) {
        filtered.sort((a, b) => {
          const result = column.sortFn!(a, b);
          return sortDirection === 'desc' ? -result : result;
        });
      } else {
        filtered.sort((a, b) => {
          const aValue = a[sortColumn];
          const bValue = b[sortColumn];
          
          if (aValue === bValue) return 0;
          if (aValue == null) return 1;
          if (bValue == null) return -1;
          
          const comparison = aValue < bValue ? -1 : 1;
          return sortDirection === 'desc' ? -comparison : comparison;
        });
      }
    }

    return filtered;
  }, [data, globalFilter, columnFilters, sortColumn, sortDirection, columns]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return processedData.slice(start, end);
  }, [processedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(processedData.length / rowsPerPage);

  // Event handlers
  const handleSort = useCallback((column: TableColumn<T>) => {
    if (!column.sortable) return;

    const newDirection = sortColumn === column.id && sortDirection === 'asc' ? 'desc' 
      : sortColumn === column.id && sortDirection === 'desc' ? null 
      : 'asc';

    updateState({ 
      sortColumn: newDirection ? column.id : undefined, 
      sortDirection: newDirection,
      currentPage: 1 
    });
    
    callbacks.onSort?.(column.id, newDirection);
    
    if (newDirection) {
      announce(`${t.sortedByAnnouncement.replace('{}', column.title).replace('{}', newDirection === 'asc' ? t.sortAscending : t.sortDescending)}`);
    }
  }, [sortColumn, sortDirection, updateState, callbacks, announce, t]);

  const handleGlobalFilter = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateState({ globalFilter: value, currentPage: 1 });
    callbacks.onGlobalFilter?.(value);
    
    if (value) {
      announce(`${t.filteredByAnnouncement.replace('{}', value)}`);
    }
  }, [updateState, callbacks, announce, t]);

  const handleRowSelect = useCallback((index: number, row: T) => {
    const rowIndex = data.indexOf(row);
    const newSelected = new Set(selectedRows);
    
    if (newSelected.has(rowIndex)) {
      newSelected.delete(rowIndex);
    } else {
      newSelected.add(rowIndex);
    }
    
    updateState({ selectedRows: newSelected });
    callbacks.onRowSelect?.(rowIndex, row);
    callbacks.onRowsSelect?.(
      Array.from(newSelected),
      Array.from(newSelected).map(i => data[i])
    );
  }, [data, selectedRows, updateState, callbacks]);

  const handleSelectAll = useCallback(() => {
    const allCurrentPageIndexes = paginatedData.map(row => data.indexOf(row));
    const newSelected = new Set(selectedRows);
    const allSelected = allCurrentPageIndexes.every(i => newSelected.has(i));
    
    if (allSelected) {
      // Deselect all on current page
      allCurrentPageIndexes.forEach(i => newSelected.delete(i));
    } else {
      // Select all on current page
      allCurrentPageIndexes.forEach(i => newSelected.add(i));
    }
    
    updateState({ selectedRows: newSelected });
    callbacks.onRowsSelect?.(
      Array.from(newSelected),
      Array.from(newSelected).map(i => data[i])
    );
  }, [paginatedData, data, selectedRows, updateState, callbacks]);

  const handlePageChange = useCallback((page: number) => {
    updateState({ currentPage: page });
    callbacks.onPageChange?.(page);
  }, [updateState, callbacks]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    updateState({ 
      rowsPerPage: newRowsPerPage, 
      currentPage: 1 
    });
    callbacks.onRowsPerPageChange?.(newRowsPerPage);
  }, [updateState, callbacks]);

  const handleRefresh = useCallback(() => {
    callbacks.onRefresh?.();
  }, [callbacks]);

  const handleExport = useCallback(() => {
    callbacks.onExport?.(processedData);
  }, [callbacks, processedData]);

  const renderCellContent = useCallback((column: TableColumn<T>, value: any, row: T, index: number) => {
    if (column.render) {
      return column.render(value, row, index);
    }
    
    if (value == null) {
      return <span className="text-muted-foreground">—</span>;
    }
    
    return String(value);
  }, []);

  const renderSortIcon = useCallback((column: TableColumn<T>) => {
    if (!column.sortable) return null;
    
    if (sortColumn !== column.id) {
      return (
        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return (
      <svg 
        className={cn('h-4 w-4', sortDirection === 'asc' ? 'text-primary' : 'text-primary')} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d={sortDirection === 'asc' 
            ? "M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" 
            : "M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
          } 
        />
      </svg>
    );
  }, [sortColumn, sortDirection]);

  return (
    <Card
      nsmClassification={nsmClassification}
      className={cn('w-full', className)}
    >
      {showHeader && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t.title}</CardTitle>
              <CardDescription>{t.description}</CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {showRefresh && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleRefresh}
                  disabled={loading}
                  aria-label={t.refreshData}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </Button>
              )}
              
              {showExport && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleExport}
                  disabled={processedData.length === 0}
                  aria-label={t.exportData}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </Button>
              )}
            </div>
          </div>

          {/* Search and Selection Info */}
          <div className="flex items-center justify-between pt-4">
            {showSearch && (
              <div className="flex-1 max-w-sm">
                <Input
                  placeholder={t.searchPlaceholder}
                  value={globalFilter}
                  onChange={handleGlobalFilter}
                  leadingIcon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>
            )}
            
            {selectedRows.size > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedRows.size} {t.selectedCountLabel}
              </div>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        {/* Loading/Error States */}
        {loading && (
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>{t.loadingMessage}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-8 text-center text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Table */}
            <div 
              className={cn(
                'relative overflow-auto border rounded-lg',
                maxHeight && `max-h-[${maxHeight}]`
              )}
            >
              <table 
                className="w-full text-sm"
                role="table"
                aria-label={t.tableAnnouncement.replace('{}', String(processedData.length)).replace('{}', String(columns.length))}
              >
                <thead 
                  className={cn(
                    'bg-muted/50 border-b',
                    stickyHeader && 'sticky top-0 z-10'
                  )}
                >
                  <tr role="row">
                    {showRowSelection && (
                      <th className="w-12 p-3" role="columnheader">
                        <input
                          type="checkbox"
                          checked={paginatedData.length > 0 && paginatedData.every(row => selectedRows.has(data.indexOf(row)))}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          aria-label={t.selectAllRows}
                        />
                      </th>
                    )}
                    
                    {columns.map((column) => (
                      <th
                        key={String(column.id)}
                        role="columnheader"
                        aria-sort={
                          sortColumn === column.id 
                            ? sortDirection === 'asc' ? 'ascending' : 'descending'
                            : column.sortable ? 'none' : undefined
                        }
                        className={cn(
                          'p-3 text-left font-medium',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          column.sortable && 'cursor-pointer hover:bg-muted/70 transition-colors',
                          !compact && 'py-4'
                        )}
                        style={{
                          width: column.width,
                          minWidth: column.minWidth,
                          maxWidth: column.maxWidth
                        }}
                        onClick={() => handleSort(column)}
                      >
                        <div className="flex items-center gap-2">
                          <span>{column.title}</span>
                          {renderSortIcon(column)}
                        </div>
                      </th>
                    ))}
                    
                    {showActions && actions.length > 0 && (
                      <th className="w-32 p-3 text-center" role="columnheader">
                        {t.actionsLabel}
                      </th>
                    )}
                  </tr>
                </thead>
                
                <tbody role="rowgroup">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length + (showRowSelection ? 1 : 0) + (showActions && actions.length > 0 ? 1 : 0)}
                        className="p-8 text-center text-muted-foreground"
                      >
                        {t.noDataMessage}
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((row, index) => {
                      const globalIndex = data.indexOf(row);
                      const isSelected = selectedRows.has(globalIndex);
                      
                      return (
                        <tr
                          key={globalIndex}
                          role="row"
                          className={cn(
                            'border-b transition-colors',
                            hoverable && 'hover:bg-muted/30',
                            striped && index % 2 === 0 && 'bg-muted/20',
                            isSelected && 'bg-primary/5 border-primary/20'
                          )}
                        >
                          {showRowSelection && (
                            <td className="p-3" role="gridcell">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleRowSelect(index, row)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                aria-label={`${t.selectRow} ${index + 1}`}
                              />
                            </td>
                          )}
                          
                          {columns.map((column) => (
                            <td
                              key={String(column.id)}
                              role="gridcell"
                              className={cn(
                                'p-3',
                                column.align === 'center' && 'text-center',
                                column.align === 'right' && 'text-right',
                                !compact && 'py-4',
                                column.nsmClassification && 'border-l-2',
                                column.nsmClassification === 'OPEN' && 'border-l-green-600',
                                column.nsmClassification === 'RESTRICTED' && 'border-l-yellow-600',
                                column.nsmClassification === 'CONFIDENTIAL' && 'border-l-red-600',
                                column.nsmClassification === 'SECRET' && 'border-l-gray-800'
                              )}
                            >
                              {renderCellContent(column, row[column.id], row, index)}
                            </td>
                          ))}
                          
                          {showActions && actions.length > 0 && (
                            <td className="p-3 text-center" role="gridcell">
                              <div className="flex items-center justify-center gap-1">
                                {actions
                                  .filter(action => !action.hidden?.(row))
                                  .map((action) => (
                                    <Button
                                      key={action.id}
                                      variant={action.variant || 'ghost'}
                                      size="icon"
                                      onClick={() => action.action(row, index)}
                                      disabled={action.disabled?.(row)}
                                      aria-label={action.title}
                                      className="h-8 w-8"
                                    >
                                      {action.icon || '⚙️'}
                                    </Button>
                                  ))}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {showPagination && totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>{t.rowsPerPageLabel}</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                      className="border border-input rounded px-2 py-1 bg-background"
                    >
                      {pageSizeOptions.map(size => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <span>
                    {t.pageLabel} {currentPage} {t.ofLabel} {totalPages}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    aria-label={t.firstPage}
                  >
                    ⟪
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label={t.previousPage}
                  >
                    ⟨
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label={t.nextPage}
                  >
                    ⟩
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    aria-label={t.lastPage}
                  >
                    ⟫
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}