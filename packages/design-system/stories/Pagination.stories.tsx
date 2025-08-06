/**
 * Pagination Component Stories
 * Data pagination controls with advanced features and accessibility
 * WCAG AAA compliant examples with Norwegian localization
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
  AdvancedPagination,
  type AdvancedPaginationProps,
} from '../registry/components/pagination/pagination';

const meta: Meta<typeof AdvancedPagination> = {
  title: 'Navigation/Pagination',
  component: AdvancedPagination,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Professional pagination component with advanced features, keyboard navigation, and WCAG AAA compliance. Features professional touch targets (44px+) and Norwegian localization.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    currentPage: {
      control: { type: 'number', min: 1, max: 100 },
      description: 'Currently active page'
    },
    totalPages: {
      control: { type: 'number', min: 1, max: 1000 },
      description: 'Total number of pages'
    },
    maxVisiblePages: {
      control: { type: 'number', min: 3, max: 15 },
      description: 'Maximum visible page numbers before collapsing'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant with professional touch targets'
    },
    variant: {
      control: 'select',
      options: ['default', 'ghost', 'outline'],
      description: 'Visual style variant'
    },
    showFirstLast: {
      control: 'boolean',
      description: 'Show first/last page buttons'
    },
    showPreviousNext: {
      control: 'boolean',
      description: 'Show previous/next buttons'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable all pagination controls'
    }
  }
} satisfies Meta<typeof AdvancedPagination>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = React.useState(5);
    const totalPages = 10;
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Side {currentPage} av {totalPages}
          </p>
        </div>
        <AdvancedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          ariaLabel="Standard paginering"
        />
      </div>
    );
  }
};

export const Simple: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = React.useState(2);
    const totalPages = 5;
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Enkelt eksempel: Side {currentPage} av {totalPages}
          </p>
        </div>
        <AdvancedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          maxVisiblePages={5}
          ariaLabel="Enkel paginering"
        />
      </div>
    );
  }
};

// Size Variants
export const Sizes: Story = {
  render: () => {
    const [currentPageSm, setCurrentPageSm] = React.useState(3);
    const [currentPageMd, setCurrentPageMd] = React.useState(5);
    const [currentPageLg, setCurrentPageLg] = React.useState(7);
    const totalPages = 10;
    
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Small (sm)</h3>
          <AdvancedPagination
            currentPage={currentPageSm}
            totalPages={totalPages}
            onPageChange={setCurrentPageSm}
            size="sm"
            ariaLabel="Liten paginering"
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Medium (md) - Standard</h3>
          <AdvancedPagination
            currentPage={currentPageMd}
            totalPages={totalPages}
            onPageChange={setCurrentPageMd}
            size="md"
            ariaLabel="Medium paginering"
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Large (lg) - Professional</h3>
          <AdvancedPagination
            currentPage={currentPageLg}
            totalPages={totalPages}
            onPageChange={setCurrentPageLg}
            size="lg"
            ariaLabel="Stor paginering"
          />
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded'
  }
};

// Style Variants
export const Variants: Story = {
  render: () => {
    const [currentPageDefault, setCurrentPageDefault] = React.useState(4);
    const [currentPageGhost, setCurrentPageGhost] = React.useState(6);
    const [currentPageOutline, setCurrentPageOutline] = React.useState(8);
    const totalPages = 15;
    
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Default</h3>
          <AdvancedPagination
            currentPage={currentPageDefault}
            totalPages={totalPages}
            onPageChange={setCurrentPageDefault}
            variant="default"
            ariaLabel="Standard paginering"
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Ghost</h3>
          <AdvancedPagination
            currentPage={currentPageGhost}
            totalPages={totalPages}
            onPageChange={setCurrentPageGhost}
            variant="ghost"
            ariaLabel="Gjennomsiktig paginering"
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Outline</h3>
          <AdvancedPagination
            currentPage={currentPageOutline}
            totalPages={totalPages}
            onPageChange={setCurrentPageOutline}
            variant="outline"
            ariaLabel="Omriss paginering"
          />
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded'
  }
};

// Advanced Features
export const AdvancedFeatures: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = React.useState(25);
    const totalPages = 100;
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Avansert paginering med første/siste knapper
          </p>
          <p className="text-lg font-medium">
            Side {currentPage} av {totalPages}
          </p>
        </div>
        
        <AdvancedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showFirstLast={true}
          showPreviousNext={true}
          maxVisiblePages={7}
          size="lg"
          variant="default"
          ariaLabel="Avansert paginering med alle funksjoner"
        />
      </div>
    );
  }
};

// Large Dataset Example
export const LargeDataset: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = React.useState(500);
    const totalPages = 2000;
    
    return (
      <div className="space-y-6">
        <div className="p-4 bg-muted rounded-lg text-center">
          <h4 className="font-medium mb-2">Stort datasett</h4>
          <p className="text-sm text-muted-foreground mb-2">
            2000 sider med data - side {currentPage}
          </p>
          <p className="text-xs text-muted-foreground">
            Automatisk kollaps av sidetall
          </p>
        </div>
        
        <AdvancedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showFirstLast={true}
          maxVisiblePages={5}
          size="md"
          ariaLabel="Stor datasett paginering"
        />
      </div>
    );
  }
};

// Different Page Positions
export const PagePositions: Story = {
  render: () => {
    const [firstPage, setFirstPage] = React.useState(1);
    const [middlePage, setMiddlePage] = React.useState(50);
    const [lastPage, setLastPage] = React.useState(100);
    const totalPages = 100;
    
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">
            Første side (1 av {totalPages})
          </h3>
          <AdvancedPagination
            currentPage={firstPage}
            totalPages={totalPages}
            onPageChange={setFirstPage}
            showFirstLast={true}
            size="md"
            ariaLabel="Første side paginering"
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">
            Midt på ({middlePage} av {totalPages})
          </h3>
          <AdvancedPagination
            currentPage={middlePage}
            totalPages={totalPages}
            onPageChange={setMiddlePage}
            showFirstLast={true}
            size="md"
            ariaLabel="Midten paginering"
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">
            Siste side ({lastPage} av {totalPages})
          </h3>
          <AdvancedPagination
            currentPage={lastPage}
            totalPages={totalPages}
            onPageChange={setLastPage}
            showFirstLast={true}
            size="md"
            ariaLabel="Siste side paginering"
          />
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded'
  }
};

// Data Table Integration
export const DataTableIntegration: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage, setItemsPerPage] = React.useState(10);
    const totalItems = 247;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    // Sample data
    const generateData = (page: number, perPage: number) => {
      const start = (page - 1) * perPage;
      return Array.from({ length: Math.min(perPage, totalItems - start) }, (_, i) => ({
        id: start + i + 1,
        name: `Bruker ${start + i + 1}`,
        email: `bruker${start + i + 1}@example.com`,
        role: ['Admin', 'Bruker', 'Moderator'][Math.floor(Math.random() * 3)]
      }));
    };
    
    const currentData = generateData(currentPage, itemsPerPage);
    
    return (
      <div className="space-y-6">
        <div className="p-6 bg-card rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Brukerliste</h3>
            <div className="flex items-center gap-2">
              <label htmlFor="itemsPerPage" className="text-sm text-muted-foreground">
                Per side:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-9 px-3 rounded border border-input bg-background text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          
          {/* Mock Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-3 border-b">
              <div className="grid grid-cols-4 gap-4 text-sm font-medium">
                <div>ID</div>
                <div>Navn</div>
                <div>E-post</div>
                <div>Rolle</div>
              </div>
            </div>
            <div className="divide-y">
              {currentData.map((user) => (
                <div key={user.id} className="px-4 py-3">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="font-mono">#{user.id}</div>
                    <div>{user.name}</div>
                    <div className="text-muted-foreground">{user.email}</div>
                    <div>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              Viser {startItem}-{endItem} av {totalItems} brukere
            </p>
            
            <AdvancedPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              size="sm"
              showFirstLast={totalPages > 10}
              ariaLabel="Brukerliste paginering"
            />
          </div>
        </div>
      </div>
    );
  }
};

// Norwegian Enterprise Examples
export const NorwegianEnterpriseExamples: Story = {
  render: () => {
    const [altinnPage, setAltinnPage] = React.useState(3);
    const [taxPage, setTaxPage] = React.useState(12);
    const [healthPage, setHealthPage] = React.useState(5);
    
    return (
      <div className="space-y-8">
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Altinn Skjemaer</h3>
          <div className="mb-4 text-sm text-muted-foreground">
            Bla gjennom tilgjengelige skjemaer og tjenester
          </div>
          <AdvancedPagination
            currentPage={altinnPage}
            totalPages={25}
            onPageChange={setAltinnPage}
            size="md"
            labels={{
              previous: 'Forrige',
              next: 'Neste',
              first: 'Første',
              last: 'Siste',
              page: 'Side',
              of: 'av'
            }}
            ariaLabel="Altinn skjemaer paginering"
          />
        </div>
        
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Skatteopplysninger</h3>
          <div className="mb-4 text-sm text-muted-foreground">
            Skattemeldinger og dokumenter fra de siste årene
          </div>
          <AdvancedPagination
            currentPage={taxPage}
            totalPages={50}
            onPageChange={setTaxPage}
            showFirstLast={true}
            size="lg"
            variant="outline"
            labels={{
              previous: 'Forrige år',
              next: 'Neste år',
              first: 'Eldste',
              last: 'Nyeste',
              page: 'År',
              of: 'av'
            }}
            ariaLabel="Skatteopplysninger paginering"
          />
        </div>
        
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Helsenorge - Mine Timer</h3>
          <div className="mb-4 text-sm text-muted-foreground">
            Oversikt over fastlegeavtaler og konsultasjoner
          </div>
          <AdvancedPagination
            currentPage={healthPage}
            totalPages={15}
            onPageChange={setHealthPage}
            size="md"
            variant="ghost"
            labels={{
              previous: 'Forrige',
              next: 'Neste',
              page: 'Side',
              of: 'av'
            }}
            ariaLabel="Helsenorge timer paginering"
          />
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded'
  }
};

// Disabled State
export const DisabledState: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = React.useState(5);
    const totalPages = 10;
    
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Normal state</h3>
          <AdvancedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            size="md"
            ariaLabel="Normal paginering"
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Disabled state</h3>
          <AdvancedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={() => {}} // No-op when disabled
            disabled={true}
            size="md"
            ariaLabel="Deaktivert paginering"
          />
        </div>
      </div>
    );
  }
};

// Loading State Simulation
export const LoadingState: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = React.useState(3);
    const [isLoading, setIsLoading] = React.useState(false);
    const totalPages = 20;
    
    const handlePageChange = async (page: number) => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentPage(page);
      setIsLoading(false);
    };
    
    return (
      <div className="space-y-6">
        <div className="p-4 bg-muted rounded-lg text-center">
          <h4 className="font-medium mb-2">Simulert lasting</h4>
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Laster data...' : `Side ${currentPage} av ${totalPages}`}
          </p>
        </div>
        
        <AdvancedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          disabled={isLoading}
          size="lg"
          variant="default"
          ariaLabel="Paginering med lasting"
        />
      </div>
    );
  }
};

// Responsive Behavior
export const ResponsiveBehavior: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = React.useState(15);
    const totalPages = 50;
    
    return (
      <div className="space-y-6">
        <div className="max-w-sm border rounded-lg p-4">
          <h4 className="font-medium mb-4">Mobil (kompakt)</h4>
          <AdvancedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            maxVisiblePages={3}
            size="sm"
            showFirstLast={false}
            ariaLabel="Mobil paginering"
          />
        </div>
        
        <div className="max-w-md border rounded-lg p-4">
          <h4 className="font-medium mb-4">Nettbrett (medium)</h4>
          <AdvancedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            maxVisiblePages={5}
            size="md"
            showFirstLast={true}
            ariaLabel="Nettbrett paginering"
          />
        </div>
        
        <div className="max-w-4xl border rounded-lg p-4">
          <h4 className="font-medium mb-4">Desktop (full funktionalitet)</h4>
          <AdvancedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            maxVisiblePages={9}
            size="lg"
            showFirstLast={true}
            ariaLabel="Desktop paginering"
          />
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded'
  }
};

// Keyboard Navigation Demo
export const KeyboardNavigation: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = React.useState(5);
    const totalPages = 20;
    
    return (
      <div className="space-y-6">
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Tastatursnarveier:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li><kbd className="px-2 py-1 bg-background rounded text-xs">Tab</kbd> - Naviger mellom knapper</li>
            <li><kbd className="px-2 py-1 bg-background rounded text-xs">Enter / Space</kbd> - Aktivere knapp</li>
            <li><kbd className="px-2 py-1 bg-background rounded text-xs">Home</kbd> - Gå til første side</li>
            <li><kbd className="px-2 py-1 bg-background rounded text-xs">End</kbd> - Gå til siste side</li>
          </ul>
        </div>
        
        <AdvancedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showFirstLast={true}
          size="lg"
          ariaLabel="Tastaturnavigasjon paginering demo"
        />
      </div>
    );
  }
};

// Accessibility Features Demo
export const AccessibilityFeatures: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = React.useState(8);
    const totalPages = 25;
    
    return (
      <div className="space-y-6">
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Tilgjengelighetsfunksjoner:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✅ WCAG AAA kompatibel</li>
            <li>✅ Profesjonelle berøringsmål (44px+)</li>
            <li>✅ aria-current="page" for aktiv side</li>
            <li>✅ Skjermleser støtte med live region</li>
            <li>✅ Tastaturnavigasjon</li>
            <li>✅ Høy kontrast støtte</li>
            <li>✅ Beskrivende aria-label attributter</li>
            <li>✅ Semantisk HTML med nav element</li>
          </ul>
        </div>
        
        <AdvancedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showFirstLast={true}
          size="lg"
          variant="outline"
          ariaLabel="Tilgjengelig paginering med full WCAG AAA støtte"
        />
      </div>
    );
  }
};

// Interactive Playground
export const Playground: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = React.useState(10);
    
    return (
      <AdvancedPagination
        currentPage={currentPage}
        totalPages={50}
        onPageChange={setCurrentPage}
        showFirstLast={true}
        showPreviousNext={true}
        maxVisiblePages={7}
        size="md"
        variant="default"
        disabled={false}
        ariaLabel="Interaktiv paginering playground"
      />
    );
  },
  args: {
    currentPage: 10,
    totalPages: 50,
    maxVisiblePages: 7,
    size: 'md',
    variant: 'default',
    showFirstLast: true,
    showPreviousNext: true,
    disabled: false,
    labels: {
      previous: 'Forrige',
      next: 'Neste',
      first: 'Første',
      last: 'Siste',
      page: 'Side',
      of: 'av'
    },
    ariaLabel: 'Interaktiv paginering playground'
  }
};