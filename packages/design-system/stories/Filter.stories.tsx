/**
 * Filter Component Stories
 * Advanced filtering system with multiple filter types
 * Professional filtering UI with Norwegian language support
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { 
  Filter, 
  ProductFilter, 
  DateRangeFilter,
  type FilterGroup,
  type FilterValue
} from '../registry/blocks/filter-01/filter';
import { Card } from '../registry/components/card/card';

const meta = {
  title: 'Blocks/Filter',
  component: Filter,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Advanced filtering component with support for multiple filter types including checkboxes, 
radio buttons, range sliders, date pickers, and search inputs.

## Features
- Multiple filter types (checkbox, radio, range, date, select, search)
- Collapsible filter groups
- Active filter count display
- Apply/Reset functionality
- Multiple layout variants (sidebar, horizontal, dropdown)
- Norwegian language support
- WCAG AAA compliant

## Filter Types
- **Checkbox**: Multiple selection with counts
- **Radio**: Single selection from options
- **Range**: Min/max value selection with slider
- **Date**: Date range picker
- **Select**: Dropdown selection
- **Search**: Text-based filtering

## Variants
- **Sidebar**: Vertical layout for sidebars
- **Horizontal**: Inline layout for toolbars
- **Dropdown**: Compact dropdown for limited space
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['sidebar', 'horizontal', 'dropdown', 'inline'],
      description: 'Filter layout variant'
    },
    showApplyButton: {
      control: 'boolean',
      description: 'Show apply button'
    },
    showResetButton: {
      control: 'boolean',
      description: 'Show reset button'
    },
    showActiveCount: {
      control: 'boolean',
      description: 'Show active filter count'
    },
    norwegianLabels: {
      control: 'boolean',
      description: 'Use Norwegian labels'
    }
  }
} satisfies Meta<typeof Filter>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic filter groups for examples
const basicFilterGroups: FilterGroup[] = [
  {
    id: 'category',
    label: 'Kategori',
    type: 'checkbox',
    icon: '📁',
    options: [
      { value: 'documents', label: 'Dokumenter', count: 156 },
      { value: 'images', label: 'Bilder', count: 89 },
      { value: 'videos', label: 'Videoer', count: 23 },
      { value: 'audio', label: 'Lyd', count: 45 }
    ]
  },
  {
    id: 'status',
    label: 'Status',
    type: 'radio',
    icon: '🔄',
    options: [
      { value: 'all', label: 'Alle' },
      { value: 'active', label: 'Aktiv', count: 234 },
      { value: 'archived', label: 'Arkivert', count: 89 },
      { value: 'deleted', label: 'Slettet', count: 12 }
    ]
  },
  {
    id: 'size',
    label: 'Filstørrelse (MB)',
    type: 'range',
    icon: '💾',
    min: 0,
    max: 1000,
    step: 10
  },
  {
    id: 'search',
    label: 'Søk',
    type: 'search',
    icon: '🔍',
    placeholder: 'Søk etter filnavn...'
  }
];

// Interactive wrapper component
const InteractiveFilter = ({ 
  groups, 
  variant = 'sidebar' as const,
  ...props 
}: { 
  groups: FilterGroup[]; 
  variant?: 'sidebar' | 'horizontal' | 'dropdown' | 'inline';
  [key: string]: any;
}) => {
  const [values, setValues] = useState<FilterValue>({});
  const [appliedValues, setAppliedValues] = useState<FilterValue>({});

  return (
    <div className="flex gap-6">
      <div className={variant === 'sidebar' ? 'w-80' : 'flex-1'}>
        <Filter
          groups={groups}
          values={values}
          onChange={setValues}
          onApply={setAppliedValues}
          onReset={() => {
            setValues({});
            setAppliedValues({});
          }}
          variant={variant}
          {...props}
        />
      </div>
      
      <Card className="flex-1 p-6">
        <h3 className="font-semibold mb-4">Filter Values</h3>
        <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
          {JSON.stringify(appliedValues.length ? appliedValues : values, null, 2)}
        </pre>
      </Card>
    </div>
  );
};

// Default sidebar variant
export const Default: Story = {
  render: () => <InteractiveFilter groups={basicFilterGroups} />
};

// Product filter preset
export const ProductFilterExample: Story = {
  render: () => {
    const [values, setValues] = useState({});
    
    return (
      <div className="flex gap-6">
        <ProductFilter
          values={values}
          onChange={setValues}
          showApplyButton={false}
        />
        
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-4" />
                <h4 className="font-semibold">Produkt {i}</h4>
                <p className="text-sm text-muted-foreground">Beskrivelse av produkt</p>
                <p className="text-lg font-bold mt-2">kr {299 + i * 100}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }
};

// Horizontal variant
export const HorizontalVariant: Story = {
  render: () => (
    <InteractiveFilter 
      groups={[
        {
          id: 'category',
          label: 'Kategori',
          type: 'select',
          options: [
            { value: 'all', label: 'Alle kategorier' },
            { value: 'electronics', label: 'Elektronikk' },
            { value: 'clothing', label: 'Klær' },
            { value: 'books', label: 'Bøker' }
          ]
        },
        {
          id: 'search',
          label: 'Søk',
          type: 'search',
          placeholder: 'Søk produkter...'
        }
      ]}
      variant="horizontal"
    />
  )
};

// Dropdown variant
export const DropdownVariant: Story = {
  render: () => (
    <div className="h-96">
      <InteractiveFilter groups={basicFilterGroups} variant="dropdown" />
    </div>
  )
};

// Date range filter
export const DateRangeExample: Story = {
  render: () => {
    const [values, setValues] = useState({});
    
    return (
      <div>
        <DateRangeFilter
          values={values}
          onChange={setValues}
          showApplyButton={true}
        />
        
        <Card className="mt-4 p-4">
          <p className="text-sm text-muted-foreground">
            Selected range: {JSON.stringify(values)}
          </p>
        </Card>
      </div>
    );
  }
};

// Complex filter groups
export const ComplexFilters: Story = {
  render: () => {
    const complexGroups: FilterGroup[] = [
      {
        id: 'department',
        label: 'Avdeling',
        type: 'checkbox',
        icon: '🏢',
        collapsible: true,
        defaultExpanded: true,
        options: [
          { value: 'sales', label: 'Salg', count: 45 },
          { value: 'marketing', label: 'Markedsføring', count: 32 },
          { value: 'development', label: 'Utvikling', count: 67 },
          { value: 'hr', label: 'HR', count: 23 },
          { value: 'finance', label: 'Økonomi', count: 19 }
        ]
      },
      {
        id: 'employment',
        label: 'Ansettelsestype',
        type: 'checkbox',
        icon: '📋',
        collapsible: true,
        options: [
          { value: 'fulltime', label: 'Heltid', count: 156 },
          { value: 'parttime', label: 'Deltid', count: 34 },
          { value: 'contract', label: 'Kontrakt', count: 23 },
          { value: 'intern', label: 'Praktikant', count: 8 }
        ]
      },
      {
        id: 'experience',
        label: 'Erfaring (år)',
        type: 'range',
        icon: '📊',
        min: 0,
        max: 20,
        step: 1
      },
      {
        id: 'location',
        label: 'Lokasjon',
        type: 'select',
        icon: '📍',
        placeholder: 'Velg lokasjon',
        options: [
          { value: 'oslo', label: 'Oslo' },
          { value: 'bergen', label: 'Bergen' },
          { value: 'trondheim', label: 'Trondheim' },
          { value: 'stavanger', label: 'Stavanger' },
          { value: 'remote', label: 'Hjemmekontor' }
        ]
      },
      {
        id: 'startDate',
        label: 'Startdato',
        type: 'date',
        icon: '📅',
        collapsible: true
      },
      {
        id: 'skills',
        label: 'Ferdigheter',
        type: 'search',
        icon: '🎯',
        placeholder: 'Søk etter ferdigheter...'
      }
    ];
    
    return <InteractiveFilter groups={complexGroups} />;
  }
};

// No apply button (instant filtering)
export const InstantFiltering: Story = {
  render: () => (
    <InteractiveFilter 
      groups={basicFilterGroups} 
      showApplyButton={false}
      showResetButton={true}
    />
  )
};

// Disabled options
export const DisabledOptions: Story = {
  render: () => {
    const groupsWithDisabled: FilterGroup[] = [
      {
        id: 'access',
        label: 'Tilgangsnivå',
        type: 'checkbox',
        icon: '🔒',
        options: [
          { value: 'public', label: 'Offentlig', count: 234 },
          { value: 'internal', label: 'Intern', count: 156 },
          { value: 'restricted', label: 'Begrenset', count: 89, disabled: true },
          { value: 'confidential', label: 'Konfidensiell', count: 23, disabled: true }
        ]
      }
    ];
    
    return <InteractiveFilter groups={groupsWithDisabled} />;
  }
};

// Playground
export const Playground: Story = {
  args: {
    groups: basicFilterGroups,
    variant: 'sidebar',
    showApplyButton: true,
    showResetButton: true,
    showActiveCount: true,
    norwegianLabels: true
  },
  render: (args) => {
    const [values, setValues] = useState({});
    
    return (
      <Filter
        {...args}
        values={values}
        onChange={setValues}
        onApply={(v) => console.log('Applied:', v)}
        onReset={() => setValues({})}
      />
    );
  }
};