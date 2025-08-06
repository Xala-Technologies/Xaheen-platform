/**
 * Chart Component Stories
 * Professional data visualization with interactivity
 * WCAG AAA compliant examples with Norwegian text
 * CLAUDE.md Compliant: Professional styling and accessibility
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useMemo } from 'react';
import { 
  Chart,
  type ChartProps,
  type ChartDataPoint,
  type ChartSeries
} from '../registry/components/chart/chart';
import { Button } from '../registry/components/button/button';
import { Card } from '../registry/components/card/card';

// Sample data for Norwegian context
const monthlyRevenueData: readonly ChartDataPoint[] = [
  { label: 'Jan', value: 2400000 },
  { label: 'Feb', value: 2100000 },
  { label: 'Mar', value: 2800000 },
  { label: 'Apr', value: 2650000 },
  { label: 'Mai', value: 3200000 },
  { label: 'Jun', value: 3800000 },
  { label: 'Jul', value: 3100000 },
  { label: 'Aug', value: 2900000 },
  { label: 'Sep', value: 3400000 },
  { label: 'Okt', value: 3600000 },
  { label: 'Nov', value: 3900000 },
  { label: 'Des', value: 4200000 }
];

const quarterlyGrowthData: readonly ChartDataPoint[] = [
  { label: 'Q1 2023', value: 12.5, color: '#ef4444' },
  { label: 'Q2 2023', value: 18.3, color: '#f59e0b' },
  { label: 'Q3 2023', value: 24.7, color: '#10b981' },
  { label: 'Q4 2023', value: 31.2, color: '#3b82f6' },
  { label: 'Q1 2024', value: 28.9, color: '#8b5cf6' }
];

const departmentBudgetData: readonly ChartDataPoint[] = [
  { label: 'Teknologi', value: 12500000, color: '#3b82f6' },
  { label: 'Salg & Marketing', value: 8200000, color: '#10b981' },
  { label: 'HR & Admin', value: 4800000, color: '#f59e0b' },
  { label: 'Økonomi', value: 3200000, color: '#ef4444' },
  { label: 'Kundeservice', value: 2100000, color: '#8b5cf6' },
  { label: 'Forskning', value: 1800000, color: '#06b6d4' }
];

const regionalSalesData: readonly ChartDataPoint[] = [
  { label: 'Oslo', value: 45.2 },
  { label: 'Bergen', value: 23.1 },
  { label: 'Trondheim', value: 18.7 },
  { label: 'Stavanger', value: 12.4 },
  { label: 'Tromsø', value: 8.9 },
  { label: 'Kristiansand', value: 6.3 }
];

const employeeSatisfactionData: readonly ChartDataPoint[] = [
  { label: 'Meget fornøyd', value: 42, color: '#10b981' },
  { label: 'Fornøyd', value: 35, color: '#3b82f6' },
  { label: 'Nøytral', value: 15, color: '#f59e0b' },
  { label: 'Misfornøyd', value: 6, color: '#ef4444' },
  { label: 'Meget misfornøyd', value: 2, color: '#dc2626' }
];

// Multi-series data
const comparisonSeries: readonly ChartSeries[] = [
  {
    name: '2023',
    color: '#94a3b8',
    data: [
      { label: 'Jan', value: 2200000 },
      { label: 'Feb', value: 2400000 },
      { label: 'Mar', value: 2600000 },
      { label: 'Apr', value: 2300000 },
      { label: 'Mai', value: 2800000 },
      { label: 'Jun', value: 3200000 }
    ]
  },
  {
    name: '2024',
    color: '#3b82f6',
    data: [
      { label: 'Jan', value: 2400000 },
      { label: 'Feb', value: 2100000 },
      { label: 'Mar', value: 2800000 },
      { label: 'Apr', value: 2650000 },
      { label: 'Mai', value: 3200000 },
      { label: 'Jun', value: 3800000 }
    ]
  }
];

const meta: Meta<typeof Chart> = {
  title: 'Data Display/Chart',
  component: Chart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['bar', 'line', 'area', 'pie', 'donut'],
      description: 'Chart type'
    },
    variant: {
      control: 'select',
      options: ['default', 'card', 'minimal'],
      description: 'Chart visual variant'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Chart size'
    },
    showLegend: {
      control: 'boolean',
      description: 'Show legend'
    },
    showTooltip: {
      control: 'boolean',
      description: 'Show tooltips on hover'
    },
    showGrid: {
      control: 'boolean',
      description: 'Show grid lines'
    },
    showAxes: {
      control: 'boolean',
      description: 'Show axes'
    },
    animated: {
      control: 'boolean',
      description: 'Animate chart rendering'
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state'
    }
  }
} satisfies Meta<typeof Chart>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    data: quarterlyGrowthData,
    type: 'bar',
    title: 'Kvartalsvis vekst',
    description: 'Vekstprosent per kvartal',
    showLegend: true,
    animated: true
  }
};

export const PieChart: Story = {
  args: {
    data: departmentBudgetData,
    type: 'pie',
    title: 'Avdelingsbudsjett 2024',
    description: 'Fordeling av budsjett på avdelinger',
    showLegend: true,
    animated: true
  }
};

export const Loading: Story = {
  args: {
    data: [],
    type: 'bar',
    title: 'Laster data...',
    loading: true
  }
};

export const Empty: Story = {
  args: {
    data: [],
    type: 'bar',
    title: 'Ingen data',
    emptyMessage: 'Ingen data tilgjengelig for valgt periode'
  }
};

// Chart Types
export const ChartTypes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-6">Søylediagram</h3>
        <Chart
          data={monthlyRevenueData.slice(0, 6)}
          type="bar"
          title="Månedlig omsetning"
          description="Omsetning i NOK per måned"
          yAxisLabel="Omsetning (NOK)"
          xAxisLabel="Måned"
          animated
          variant="card"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-6">Sektordiagram</h3>
          <Chart
            data={employeeSatisfactionData}
            type="pie"
            title="Medarbeidertilfredshet"
            description="Resultat fra årlig undersøkelse"
            animated
            variant="card"
          />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-6">Donut-diagram</h3>
          <Chart
            data={regionalSalesData}
            type="donut"
            title="Regional salgsfordeling"
            description="Prosent av totalt salg"
            animated
            variant="card"
          />
        </div>
      </div>
    </div>
  )
};

// Size Variants
export const SizeVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Liten størrelse</h3>
        <Chart
          data={quarterlyGrowthData.slice(0, 4)}
          type="bar"
          size="sm"
          title="Kvartalsdata"
          animated
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Medium størrelse (standard)</h3>
        <Chart
          data={quarterlyGrowthData.slice(0, 4)}
          type="bar"
          size="md"
          title="Kvartalsdata"
          animated
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Stor størrelse</h3>
        <Chart
          data={quarterlyGrowthData.slice(0, 4)}
          type="bar"
          size="lg"
          title="Kvartalsdata"
          animated
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Ekstra stor størrelse</h3>
        <Chart
          data={quarterlyGrowthData.slice(0, 4)}
          type="bar"
          size="xl"
          title="Kvartalsdata"
          animated
        />
      </div>
    </div>
  )
};

// Style Variants
export const StyleVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Standard</h3>
        <Chart
          data={quarterlyGrowthData.slice(0, 4)}
          type="bar"
          variant="default"
          title="Standard utseende"
          animated
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Kort-stil</h3>
        <Chart
          data={quarterlyGrowthData.slice(0, 4)}
          type="bar"
          variant="card"
          title="Kort-stil med skygge"
          animated
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Minimal</h3>
        <Chart
          data={quarterlyGrowthData.slice(0, 4)}
          type="bar"
          variant="minimal"
          title="Minimal utseende"
          animated
          showGrid={false}
        />
      </div>
    </div>
  )
};

// Interactive Features
export const InteractiveFeatures: Story = {
  render: () => {
    const [selectedDataPoint, setSelectedDataPoint] = useState<ChartDataPoint | null>(null);
    const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

    const handleDataPointClick = (dataPoint: ChartDataPoint, index: number) => {
      setSelectedDataPoint(dataPoint);
      console.log('Clicked data point:', dataPoint, 'at index:', index);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Interaktiv visualisering</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={chartType === 'bar' ? 'default' : 'outline'}
              onClick={() => setChartType('bar')}
            >
              Søylediagram
            </Button>
            <Button
              size="sm"
              variant={chartType === 'pie' ? 'default' : 'outline'}
              onClick={() => setChartType('pie')}
            >
              Sektordiagram
            </Button>
          </div>
        </div>
        
        <Chart
          data={departmentBudgetData}
          type={chartType}
          title="Avdelingsbudsjett 2024"
          description="Klikk på et segment for detaljer"
          onDataPointClick={handleDataPointClick}
          animated
          variant="card"
        />
        
        {selectedDataPoint && (
          <div className="p-4 bg-card rounded-lg border">
            <h4 className="font-semibold mb-2">Valgt segment:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Avdeling:</span>
                <div className="font-medium">{selectedDataPoint.label}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Budsjett:</span>
                <div className="font-medium">
                  {new Intl.NumberFormat('nb-NO', {
                    style: 'currency',
                    currency: 'NOK',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(selectedDataPoint.value)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
};

// Dashboard Example
export const DashboardExample: Story = {
  render: () => {
    const [timeFrame, setTimeFrame] = useState<'6m' | '12m'>('6m');
    
    const currentData = useMemo(() => {
      return timeFrame === '6m' ? monthlyRevenueData.slice(0, 6) : monthlyRevenueData;
    }, [timeFrame]);

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Økonomi Dashboard</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={timeFrame === '6m' ? 'default' : 'outline'}
              onClick={() => setTimeFrame('6m')}
            >
              6 måneder
            </Button>
            <Button
              size="sm"
              variant={timeFrame === '12m' ? 'default' : 'outline'}
              onClick={() => setTimeFrame('12m')}
            >
              12 måneder
            </Button>
          </div>
        </div>
        
        {/* Key metrics cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="text-2xl font-bold text-foreground">
              {new Intl.NumberFormat('nb-NO', {
                style: 'currency',
                currency: 'NOK',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(currentData.reduce((sum, item) => sum + item.value, 0))}
            </div>
            <div className="text-sm text-muted-foreground">Total omsetning</div>
          </Card>
          
          <Card className="p-6">
            <div className="text-2xl font-bold text-green-600">+18.5%</div>
            <div className="text-sm text-muted-foreground">Vekst vs. forrige år</div>
          </Card>
          
          <Card className="p-6">
            <div className="text-2xl font-bold text-foreground">847</div>
            <div className="text-sm text-muted-foreground">Nye kunder</div>
          </Card>
          
          <Card className="p-6">
            <div className="text-2xl font-bold text-foreground">96.2%</div>
            <div className="text-sm text-muted-foreground">Kundetilfredshet</div>
          </Card>
        </div>
        
        {/* Main chart */}
        <Chart
          data={currentData}
          type="bar"
          title="Månedlig omsetning"
          description={`Omsetning siste ${timeFrame === '6m' ? '6' : '12'} måneder`}
          yAxisLabel="Omsetning (NOK)"
          xAxisLabel="Måned"
          animated
          variant="card"
          size="lg"
        />
        
        {/* Secondary charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Chart
            data={departmentBudgetData}
            type="pie"
            title="Budsjettfordeling"
            description="Fordeling på avdelinger"
            animated
            variant="card"
          />
          
          <Chart
            data={regionalSalesData}
            type="bar"
            title="Regionale salg"
            description="Salg fordelt på regioner"
            animated
            variant="card"
            yAxisLabel="Prosent (%)"
          />
        </div>
      </div>
    );
  }
};

// Real-time Data Simulation
export const RealTimeData: Story = {
  render: () => {
    const [realtimeData, setRealtimeData] = useState(quarterlyGrowthData.slice(0, 4));
    const [isUpdating, setIsUpdating] = useState(false);

    const updateData = () => {
      setIsUpdating(true);
      
      // Simulate real-time updates
      const interval = setInterval(() => {
        setRealtimeData(prevData => 
          prevData.map(item => ({
            ...item,
            value: Math.max(5, item.value + (Math.random() - 0.5) * 10)
          }))
        );
      }, 1000);

      setTimeout(() => {
        clearInterval(interval);
        setIsUpdating(false);
      }, 8000);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Sanntidsdata</h3>
            <p className="text-sm text-muted-foreground">
              Simulerer oppdateringer av data i sanntid
            </p>
          </div>
          <Button 
            onClick={updateData} 
            disabled={isUpdating}
            variant={isUpdating ? 'secondary' : 'default'}
          >
            {isUpdating ? 'Oppdaterer...' : 'Start sanntidsoppdateringer'}
          </Button>
        </div>
        
        <Chart
          data={realtimeData}
          type="bar"
          title="Sanntids ytelsesdata"
          description={isUpdating ? 'Oppdateres automatisk hvert sekund' : 'Klikk "Start" for å se sanntidsoppdateringer'}
          animated
          variant="card"
          yAxisLabel="Verdi (%)"
        />
        
        {isUpdating && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Data oppdateres automatisk...
          </div>
        )}
      </div>
    );
  }
};

// Accessibility Features
export const AccessibilityFeatures: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Alle diagrammer er tilgjengelige for skjermlesere og inkluderer en datatabell for assisterende teknologi.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Tilgjengelighetsfunksjoner</h3>
        <Chart
          data={employeeSatisfactionData}
          type="pie"
          title="Medarbeidertilfredshet 2024"
          description="Resultat fra den årlige medarbeiderundersøkelsen med 1,247 respondenter"
          ariaLabel="Sektordiagram som viser medarbeidertilfredshet fordelt på fem kategorier"
          animated
          variant="card"
        />
      </div>
      
      <div className="text-sm text-muted-foreground space-y-2">
        <h4 className="font-medium text-foreground">Tilgjengelighetsfunksjoner inkludert:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>ARIA-etiketter for alle diagramelementer</li>
          <li>Keyboard-navigasjon for interaktive elementer</li>
          <li>Skjult datatabell for skjermlesere</li>
          <li>Høykontrast farger som møter WCAG AAA krav</li>
          <li>Beskrivende titler og kontekstinformasjon</li>
          <li>Focus-indikatorer for tastaturnavigasjon</li>
        </ul>
      </div>
    </div>
  )
};

// Norwegian Business Context
export const NorwegianBusinessContext: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-6">Norsk forretningskontekst</h3>
        <p className="text-muted-foreground mb-6">
          Eksempler på diagrammer tilpasset norske bedrifter og rapporteringsstandarder.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Chart
          data={[
            { label: 'Lønn og sosiale kostnader', value: 45.2 },
            { label: 'Varekostnader', value: 28.7 },
            { label: 'Husleie og drift', value: 12.3 },
            { label: 'Markedsføring', value: 8.1 },
            { label: 'IT og teknologi', value: 3.9 },
            { label: 'Øvrige kostnader', value: 1.8 }
          ]}
          type="pie"
          title="Kostnadsfordeling 2024"
          description="I henhold til norsk regnskapsstandard"
          animated
          variant="card"
        />
        
        <Chart
          data={[
            { label: 'Q1', value: 87.5, color: '#dc2626' },
            { label: 'Q2', value: 92.3, color: '#f59e0b' },
            { label: 'Q3', value: 95.1, color: '#10b981' },
            { label: 'Q4', value: 98.7, color: '#3b82f6' }
          ]}
          type="bar"
          title="HMS-måloppnåelse"
          description="Prosent oppnådde sikkerhetsmål per kvartal"
          yAxisLabel="Prosent (%)"
          animated
          variant="card"
        />
      </div>
      
      <Chart
        data={[
          { label: 'Oslo/Akershus', value: 3850000 },
          { label: 'Vest-Norge', value: 2640000 },
          { label: 'Trøndelag', value: 1890000 },
          { label: 'Nord-Norge', value: 1250000 },
          { label: 'Sørlandet', value: 980000 },
          { label: 'Østlandet øvrig', value: 1540000 }
        ]}
        type="bar"
        title="Regional omsetning 2024"
        description="Omsetning fordelt på landsdeler i NOK"
        yAxisLabel="Omsetning (NOK)"
        xAxisLabel="Region"
        animated
        variant="card"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="text-2xl font-bold text-foreground">2.4M</div>
          <div className="text-sm text-muted-foreground">Omsetning (NOK)</div>
          <div className="text-xs text-green-600 font-medium mt-1">
            +12.5% vs. fjoråret
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="text-2xl font-bold text-foreground">847</div>
          <div className="text-sm text-muted-foreground">Ansatte (FTE)</div>
          <div className="text-xs text-blue-600 font-medium mt-1">
            +23 nye stillinger
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="text-2xl font-bold text-foreground">8.4%</div>
          <div className="text-sm text-muted-foreground">EBITDA-margin</div>
          <div className="text-xs text-muted-foreground mt-1">
            Bransjesnitt: 6.2%
          </div>
        </Card>
      </div>
    </div>
  )
};

// Error States
export const ErrorStates: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Feilhåndtering</h3>
        <Chart
          data={[]}
          type="bar"
          title="Feil ved lasting av data"
          error="Kunne ikke laste inn diagramdata. Vennligst prøv igjen senere."
          variant="card"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Tom datastate</h3>
        <Chart
          data={[]}
          type="pie"
          title="Ingen data tilgjengelig"
          emptyMessage="Ingen data funnet for valgt tidsperiode. Prøv å justere filterene dine."
          variant="card"
        />
      </div>
    </div>
  )
};

// Playground
export const Playground: Story = {
  args: {
    data: quarterlyGrowthData,
    type: 'bar',
    title: 'Tilpassbar diagram',
    description: 'Juster innstillingene for å utforske funktionaliteten',
    variant: 'card',
    size: 'md',
    showLegend: true,
    showTooltip: true,
    showGrid: true,
    showAxes: true,
    animated: true,
    loading: false
  }
};