/**
 * Data Table Generator for Xala UI System
 */

import type { DataTableConfig } from "../types/index.js";

export class DataTableGenerator {
	public generateDataTable(config: DataTableConfig): string {
		const { name, columns, features, actions } = config;

		const columnDefinitions = columns
			.map(
				(col) => `
    {
      key: '${col.key}',
      label: t('table.columns.${col.key}'),
      type: '${col.type}',
      sortable: ${col.sortable || false},
      filterable: ${col.filterable || false}
    }`,
			)
			.join(",");

		const actionButtons =
			actions
				?.map(
					(action) => `
    {
      key: '${action.key}',
      label: t('table.actions.${action.key}'),
      icon: '${action.icon}',
      variant: '${action.variant}',
      onClick: (row: Record<string, unknown>) => handle${action.key.charAt(0).toUpperCase() + action.key.slice(1)}(row)
    }`,
				)
				.join(",") || "";

		return `
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  DataTable, 
  Button, 
  Stack,
  useTokens 
} from '@xala-technologies/ui-system';

export interface ${name}Props {
  data: Record<string, unknown>[];
  onRowSelect?: (rows: Record<string, unknown>[]) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, unknown>) => void;
}

export function ${name}({ 
  data, 
  onRowSelect, 
  onSort, 
  onFilter 
}: ${name}Props): JSX.Element {
  const { t } = useTranslation();
  const tokens = useTokens();

  const columns = [${columnDefinitions}];

  const actions = [${actionButtons}];

  ${
		actions
			?.map(
				(action) => `
  const handle${action.key.charAt(0).toUpperCase() + action.key.slice(1)} = (row: Record<string, unknown>): void => {
    console.log('${action.key}', row);
  };`,
			)
			.join("\n") || ""
	}

  return (
    <DataTable
      data={data}
      columns={columns}
      actions={actions}
      features={{
        sorting: ${features.sorting || false},
        filtering: ${features.filtering || false},
        pagination: ${features.pagination || false},
        selection: ${features.selection || false},
        search: ${features.search || false},
        export: ${features.export || false}
      }}
      onRowSelect={onRowSelect}
      onSort={onSort}
      onFilter={onFilter}
    />
  );
}`;
	}

	/**
	 * Generate a data table using the DataTable specification (async version for MCP tools)
	 */
	public async generateAdvancedDataTable(config: {
		name: string;
		columns: Array<{
			key: string;
			label?: string;
			type?: string;
			sortable?: boolean;
			filterable?: boolean;
		}>;
		features: {
			sorting?: boolean;
			filtering?: boolean;
			pagination?: boolean;
			selection?: boolean;
			virtualScrolling?: boolean;
		};
		nsmClassification: "OPEN" | "RESTRICTED" | "CONFIDENTIAL" | "SECRET";
	}): Promise<string> {
		const { name, columns, features, nsmClassification } = config;

		const tableCode = `
/**
 * Generated Data Table: \${name}
 * NSM Classification: \${nsmClassification}
 * Features: \${Object.entries(features).filter(([k, v]) => v).map(([k, v]) => k).join(', ')}
 */

import React, { useState, useMemo } from 'react';
import { DataTable, Button, Stack, Badge } from '@xala-technologies/ui-system';
import { t } from '@xala-technologies/ui-system/i18n';

interface \${name}Props {
  readonly data: Array<Record<string, any>>;
  readonly loading?: boolean;
  readonly onRowSelect?: (rows: Array<Record<string, any>>) => void;
  readonly onRowAction?: (action: string, row: Record<string, any>) => void;
}

export const \${name}: React.FC<\${name}Props> = ({
  data,
  loading = false,
  onRowSelect,
  onRowAction
}) => {
  const [selectedRows, setSelectedRows] = useState<Array<Record<string, any>>>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Column definitions
  const columns = [
${columns
	.map(
		(col) => `
    {
      key: '${col.key}',
      label: t('${name.toLowerCase()}.columns.${col.key}'),
      sortable: ${col.sortable || false},
      filterable: ${col.filterable || false},
      render: (value: any, row: Record<string, any>) => {
        if (typeof value === 'boolean') {
          return <Badge variant={value ? 'success' : 'secondary'}>{value ? t('common.yes') : t('common.no')}</Badge>;
        }
        return value?.toString() || '-';
      }
    }`,
	)
	.join(",")}
  ];

  // Data processing
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    if (Object.keys(filters).length > 0) {
      result = result.filter(row => {
        return Object.entries(filters).every(([key, filterValue]) => {
          if (!filterValue) return true;
          const cellValue = row[key]?.toString().toLowerCase() || '';
          return cellValue.includes(filterValue.toLowerCase());
        });
      });
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, filters, sortConfig]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!${features.pagination || false}) return processedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [processedData, currentPage]);

  const handleSort = (column: string) => {
    if (!${features.sorting || false}) return;
    
    setSortConfig(prev => ({
      key: column,
      direction: prev?.key === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilter = (column: string, value: string) => {
    if (!${features.filtering || false}) return;
    
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const handleRowSelection = (rows: Array<Record<string, any>>) => {
    if (!${features.selection || false}) return;
    
    setSelectedRows(rows);
    onRowSelect?.(rows);
  };

  return (
    <div className="space-y-4">
      {/* NSM Classification Badge */}
      ${
				nsmClassification !== "OPEN"
					? `
      <div className="flex justify-between items-center">
        <Badge variant="destructive" className="text-xs">
          NSM: ${nsmClassification}
        </Badge>
      </div>
      `
					: ""
			}
      
      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedData}
        loading={loading}
        sortable={${features.sorting || false}}
        filterable={${features.filtering || false}}
        selectable={${features.selection || false}}
        virtualScrolling={${features.virtualScrolling || false}}
        onSort={handleSort}
        onFilter={handleFilter}
        onRowSelect={handleRowSelection}
        selectedRows={selectedRows}
        className="border rounded-lg"
        aria-label={t('${name.toLowerCase()}.tableLabel')}
      />
      
      ${
				features.pagination
					? `
      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {t('table.pagination.showing', {
            start: (currentPage - 1) * pageSize + 1,
            end: Math.min(currentPage * pageSize, processedData.length),
            total: processedData.length
          })}
        </div>
        <Stack direction="horizontal" gap="sm">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            {t('table.pagination.previous')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage * pageSize >= processedData.length}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            {t('table.pagination.next')}
          </Button>
        </Stack>
      </div>
      `
					: ""
			}
      
      {/* Selected rows actions */}
      {${features.selection || false} && selectedRows.length > 0 && (
        <div className="p-4 bg-accent rounded-lg">
          <Stack direction="horizontal" gap="sm" align="center">
            <span className="text-sm">
              {t('table.selection.selected', { count: selectedRows.length })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRowAction?.('export', selectedRows)}
            >
              {t('table.actions.export')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRowAction?.('delete', selectedRows)}
            >
              {t('table.actions.delete')}
            </Button>
          </Stack>
        </div>
      )}
    </div>
  );
};

\${name}.displayName = '\${name}';
`;

		return tableCode;
	}
}
