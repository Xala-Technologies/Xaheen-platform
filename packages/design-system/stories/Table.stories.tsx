/**
 * Table Component Stories
 * Professional data display with sorting, filtering, and selection
 * WCAG AAA compliant examples with Norwegian text
 * CLAUDE.md Compliant: Professional styling and accessibility
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useCallback } from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableCell,
  type ColumnDef,
  type SortConfig
} from '../registry/components/table/table';
import { Badge } from '../registry/components/badge/badge';
import { Button } from '../registry/components/button/button';
import { Avatar } from '../registry/components/avatar/avatar';

// Sample data for stories
interface Employee {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly department: string;
  readonly role: string;
  readonly salary: number;
  readonly startDate: string;
  readonly status: 'active' | 'inactive' | 'pending';
  readonly avatar?: string;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

const sampleEmployees: readonly Employee[] = [
  {
    id: 1,
    name: 'Ola Nordmann',
    email: 'ola.nordmann@bedrift.no',
    department: 'Teknologi',
    role: 'Seniorutvikler',
    salary: 750000,
    startDate: '2020-01-15',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    nsmClassification: 'RESTRICTED'
  },
  {
    id: 2,
    name: 'Kari Hansen',
    email: 'kari.hansen@bedrift.no',
    department: 'Design',
    role: 'UX Designer',
    salary: 680000,
    startDate: '2021-03-10',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    nsmClassification: 'OPEN'
  },
  {
    id: 3,
    name: 'Lars Andersen',
    email: 'lars.andersen@bedrift.no',
    department: 'Teknologi',
    role: 'Tech Lead',
    salary: 850000,
    startDate: '2019-06-01',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    nsmClassification: 'CONFIDENTIAL'
  },
  {
    id: 4,
    name: 'Nina Johansen',
    email: 'nina.johansen@bedrift.no',
    department: 'Økonomi',
    role: 'Controller',
    salary: 720000,
    startDate: '2022-01-20',
    status: 'pending',
    nsmClassification: 'SECRET'
  },
  {
    id: 5,
    name: 'Erik Solberg',
    email: 'erik.solberg@bedrift.no',
    department: 'Salg',
    role: 'Salgssjef',
    salary: 800000,
    startDate: '2018-09-15',
    status: 'inactive',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    nsmClassification: 'RESTRICTED'
  }
];

// Format currency for Norwegian locale
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format date for Norwegian locale
const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('nb-NO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(dateString));
};

// Status badge component
const StatusBadge: React.FC<{ readonly status: Employee['status'] }> = ({ status }) => {
  const statusConfig = {
    active: { variant: 'success' as const, label: 'Aktiv' },
    inactive: { variant: 'destructive' as const, label: 'Inaktiv' },
    pending: { variant: 'warning' as const, label: 'Venter' }
  };

  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

// Define columns for employee table
const employeeColumns: readonly ColumnDef<Employee>[] = [
  {
    id: 'employee',
    header: 'Ansatt',
    cell: (_, row) => (
      <div className="flex items-center gap-3">
        <Avatar
          src={row.avatar}
          name={row.name}
          size="sm"
          nsmClassification={row.nsmClassification}
        />
        <div>
          <div className="font-medium text-foreground">{row.name}</div>
          <div className="text-sm text-muted-foreground">{row.email}</div>
        </div>
      </div>
    ),
    minWidth: '300px'
  },
  {
    id: 'department',
    header: 'Avdeling',
    accessorKey: 'department',
    sortable: true,
    filterable: true
  },
  {
    id: 'role',
    header: 'Rolle',
    accessorKey: 'role',
    sortable: true,
    filterable: true
  },
  {
    id: 'salary',
    header: 'Lønn',
    accessorKey: 'salary',
    sortable: true,
    align: 'right',
    cell: (value) => <span className="font-mono">{formatCurrency(value as number)}</span>
  },
  {
    id: 'startDate',
    header: 'Startdato',
    accessorKey: 'startDate',
    sortable: true,
    cell: (value) => formatDate(value as string)
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    filterable: true,
    cell: (value) => <StatusBadge status={value as Employee['status']} />
  },
  {
    id: 'actions',
    header: 'Handlinger',
    cell: (_, row) => (
      <div className="flex items-center gap-2">
        <Button 
          size="sm" 
          variant="outline"
          aria-label={`Rediger ${row.name}`}
        >
          Rediger
        </Button>
        <Button 
          size="sm" 
          variant="destructive"
          aria-label={`Slett ${row.name}`}
        >
          Slett
        </Button>
      </div>
    ),
    width: '140px'
  }
];

// Simple table data
const simpleData = [
  { id: 1, name: 'Produkt A', price: 299, category: 'Elektronikk' },
  { id: 2, name: 'Produkt B', price: 199, category: 'Bøker' },
  { id: 3, name: 'Produkt C', price: 499, category: 'Klær' }
];

const simpleColumns: readonly ColumnDef[] = [
  {
    id: 'name',
    header: 'Navn',
    accessorKey: 'name',
    sortable: true
  },
  {
    id: 'price',
    header: 'Pris',
    accessorKey: 'price',
    sortable: true,
    align: 'right',
    cell: (value) => `${value} kr`
  },
  {
    id: 'category',
    header: 'Kategori',
    accessorKey: 'category',
    sortable: true
  }
];

const meta: Meta<typeof Table> = {
  title: 'Data Display/Table',
  component: Table,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'card', 'minimal', 'striped'],
      description: 'Table visual variant'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Text size variant'
    },
    density: {
      control: 'select',
      options: ['compact', 'comfortable', 'spacious'],
      description: 'Padding density'
    },
    sortable: {
      control: 'boolean',
      description: 'Enable column sorting'
    },
    selectable: {
      control: 'boolean',
      description: 'Enable row selection'
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state'
    },
    stickyHeader: {
      control: 'boolean',
      description: 'Make header sticky'
    }
  }
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    data: simpleData,
    columns: simpleColumns,
    caption: 'Enkel produkttabell'
  }
};

export const Striped: Story = {
  args: {
    data: simpleData,
    columns: simpleColumns,
    variant: 'striped',
    caption: 'Stripet tabell for bedre lesbarhet'
  }
};

export const Card: Story = {
  args: {
    data: simpleData,
    columns: simpleColumns,
    variant: 'card',
    caption: 'Tabell med kortutseende'
  }
};

export const Minimal: Story = {
  args: {
    data: simpleData,
    columns: simpleColumns,
    variant: 'minimal',
    caption: 'Minimal tabell uten grenser'
  }
};

// Size and Density Variants
export const SizeVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Liten størrelse</h3>
        <Table data={simpleData} columns={simpleColumns} size="sm" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Medium størrelse (standard)</h3>
        <Table data={simpleData} columns={simpleColumns} size="md" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Stor størrelse</h3>
        <Table data={simpleData} columns={simpleColumns} size="lg" />
      </div>
    </div>
  )
};

export const DensityVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Kompakt</h3>
        <Table data={simpleData} columns={simpleColumns} density="compact" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Komfortabel (standard)</h3>
        <Table data={simpleData} columns={simpleColumns} density="comfortable" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Romslig</h3>
        <Table data={simpleData} columns={simpleColumns} density="spacious" />
      </div>
    </div>
  )
};

// Employee Table with Full Features
export const EmployeeTable: Story = {
  render: () => {
    const [selectedRows, setSelectedRows] = useState<readonly Employee[]>([]);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

    const handleRowClick = useCallback((employee: Employee) => {
      console.log('Clicked employee:', employee.name);
    }, []);

    const handleSort = useCallback((config: SortConfig | null) => {
      setSortConfig(config);
      console.log('Sort config:', config);
    }, []);

    const handleSelectionChange = useCallback((rows: readonly Employee[]) => {
      setSelectedRows(rows);
      console.log('Selected employees:', rows.map(r => r.name));
    }, []);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Ansattliste ({sampleEmployees.length})</h3>
          {selectedRows.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedRows.length} valgt
              </span>
              <Button size="sm" variant="outline">
                Eksporter valgte
              </Button>
            </div>
          )}
        </div>
        <Table
          data={sampleEmployees}
          columns={employeeColumns}
          variant="card"
          sortable
          selectable
          onRowClick={handleRowClick}
          onSort={handleSort}
          onSelectionChange={handleSelectionChange}
          selectedRows={selectedRows}
          getRowId={(employee) => employee.id}
          caption="Oversikt over alle ansatte i bedriften"
          ariaLabel="Ansattliste med sortering og utvalg"
        />
      </div>
    );
  }
};

// Loading State
export const Loading: Story = {
  args: {
    data: [],
    columns: employeeColumns,
    loading: true,
    variant: 'card'
  }
};

// Empty State
export const Empty: Story = {
  args: {
    data: [],
    columns: simpleColumns,
    emptyMessage: 'Ingen produkter funnet. Legg til ditt første produkt for å komme i gang.',
    variant: 'card'
  }
};

// Sortable Table
export const SortableTable: Story = {
  render: () => {
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

    const sortedData = React.useMemo(() => {
      if (!sortConfig) return simpleData;
      
      return [...simpleData].sort((a, b) => {
        const aValue = a[sortConfig.key as keyof typeof a];
        const bValue = b[sortConfig.key as keyof typeof b];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }, [sortConfig]);

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {sortConfig ? (
            <>Sortert etter {sortConfig.key} ({sortConfig.direction === 'asc' ? 'stigende' : 'synkende'})</>
          ) : (
            <>Klikk på kolonneoverskrifter for å sortere</>
          )}
        </div>
        <Table
          data={sortedData}
          columns={simpleColumns}
          sortable
          onSort={setSortConfig}
          variant="striped"
        />
      </div>
    );
  }
};

// Selectable Rows
export const SelectableRows: Story = {
  render: () => {
    const [selectedRows, setSelectedRows] = useState<readonly Employee[]>([]);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {selectedRows.length > 0 
              ? `${selectedRows.length} av ${sampleEmployees.length} ansatte valgt`
              : 'Ingen ansatte valgt'
            }
          </div>
          {selectedRows.length > 0 && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                Send e-post til valgte
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => setSelectedRows([])}
              >
                Fjern utvalg
              </Button>
            </div>
          )}
        </div>
        <Table
          data={sampleEmployees}
          columns={employeeColumns.slice(0, -1)} // Remove actions column
          selectable
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          getRowId={(employee) => employee.id}
          variant="card"
        />
      </div>
    );
  }
};

// Sticky Header Table
export const StickyHeader: Story = {
  render: () => (
    <div className="h-96">
      <Table
        data={[...sampleEmployees, ...sampleEmployees, ...sampleEmployees]}
        columns={employeeColumns}
        stickyHeader
        maxHeight="384px"
        variant="striped"
        caption="Tabell med fast header som vises når du ruller"
      />
    </div>
  )
};

// Custom Cell Rendering
export const CustomCellRendering: Story = {
  render: () => {
    const customColumns: readonly ColumnDef<Employee>[] = [
      {
        id: 'employee',
        header: 'Ansatt',
        cell: (_, row) => (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar src={row.avatar} name={row.name} size="md" />
              <div className="absolute -bottom-1 -right-1">
                <div className={`w-4 h-4 rounded-full border-2 border-background ${
                  row.status === 'active' ? 'bg-green-500' : 
                  row.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
                }`} />
              </div>
            </div>
            <div>
              <div className="font-semibold text-foreground">{row.name}</div>
              <div className="text-sm text-muted-foreground">{row.role}</div>
              <div className="text-xs text-muted-foreground">{row.department}</div>
            </div>
          </div>
        ),
        minWidth: '280px'
      },
      {
        id: 'contact',
        header: 'Kontakt',
        cell: (_, row) => (
          <div className="space-y-1">
            <div className="text-sm font-medium">{row.email}</div>
            <div className="text-xs text-muted-foreground">Startet: {formatDate(row.startDate)}</div>
          </div>
        )
      },
      {
        id: 'compensation',
        header: 'Kompensasjon',
        align: 'right',
        cell: (_, row) => (
          <div className="text-right space-y-1">
            <div className="font-mono font-semibold">{formatCurrency(row.salary)}</div>
            <div className="text-xs text-muted-foreground">årlig</div>
          </div>
        )
      },
      {
        id: 'status',
        header: 'Status & Sikkerhet',
        cell: (_, row) => (
          <div className="space-y-2">
            <StatusBadge status={row.status} />
            {row.nsmClassification && (
              <Badge 
                variant="outline" 
                nsmClassification={row.nsmClassification}
                size="sm"
              >
                {row.nsmClassification}
              </Badge>
            )}
          </div>
        )
      }
    ];

    return (
      <Table
        data={sampleEmployees}
        columns={customColumns}
        variant="card"
        density="spacious"
        caption="Tabell med tilpasset cellevisning"
      />
    );
  }
};

// NSM Classification Table
export const NSMClassificationTable: Story = {
  render: () => {
    const classifiedData = sampleEmployees.map(employee => ({
      ...employee,
      nsmClassification: employee.nsmClassification || 'OPEN'
    }));

    const nsmColumns: readonly ColumnDef<Employee>[] = [
      {
        id: 'classification',
        header: 'Klassifisering',
        cell: (_, row) => (
          <Badge nsmClassification={row.nsmClassification} size="lg">
            {row.nsmClassification}
          </Badge>
        )
      },
      {
        id: 'employee',
        header: 'Ansatt',
        cell: (_, row) => (
          <div className="flex items-center gap-3">
            <Avatar
              src={row.avatar}
              name={row.name}
              size="sm"
              nsmClassification={row.nsmClassification}
            />
            <div>
              <div className="font-medium">{row.name}</div>
              <div className="text-sm text-muted-foreground">{row.role}</div>
            </div>
          </div>
        )
      },
      {
        id: 'department',
        header: 'Avdeling',
        accessorKey: 'department'
      },
      {
        id: 'access',
        header: 'Tilgangsnivå',
        cell: (_, row) => {
          const accessLevels = {
            OPEN: { level: 'Offentlig', color: 'text-green-600' },
            RESTRICTED: { level: 'Begrenset', color: 'text-yellow-600' },
            CONFIDENTIAL: { level: 'Konfidensiell', color: 'text-red-600' },
            SECRET: { level: 'Hemmelig', color: 'text-gray-800' }
          };
          
          const access = accessLevels[row.nsmClassification || 'OPEN'];
          return (
            <span className={`font-medium ${access.color}`}>
              {access.level}
            </span>
          );
        }
      }
    ];

    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Denne tabellen inneholder klassifiserte data i henhold til NSM sine retningslinjer.
                Sikre at du har riktig tilgangsnivå før du åpner sensitiv informasjon.
              </p>
            </div>
          </div>
        </div>
        
        <Table
          data={classifiedData}
          columns={nsmColumns}
          variant="card"
          caption="Ansattliste med NSM sikkerhetsklassifisering"
          ariaLabel="Klassifisert ansattliste"
        />
      </div>
    );
  }
};

// Interactive Playground
export const Playground: Story = {
  args: {
    data: sampleEmployees,
    columns: employeeColumns,
    variant: 'default',
    size: 'md',
    density: 'comfortable',
    sortable: true,
    selectable: false,
    loading: false,
    stickyHeader: false
  }
};