/**
 * Enhanced Theme Selector Component Stories
 * Combined system theme and industry theme selector
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { cn } from '../registry/lib/utils';
import { 
  EnhancedThemeSelector, 
  EnhancedIndustryTheme,
  ColorScheme,
  ENHANCED_INDUSTRY_THEMES 
} from '../registry/components/theme-selector/enhanced-theme-selector';

const meta: Meta<typeof EnhancedThemeSelector> = {
  title: 'Components/EnhancedThemeSelector',
  component: EnhancedThemeSelector,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Enhanced theme selector that combines system color scheme (light/dark/system) with industry themes. Based on the existing theme-switcher design pattern with Norwegian localization and WCAG AAA compliance.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    currentColorScheme: {
      control: 'select',
      options: ['light', 'dark', 'system'],
      description: 'Current color scheme'
    },
    currentIndustryTheme: {
      control: 'select',
      options: Object.keys(ENHANCED_INDUSTRY_THEMES),
      description: 'Current industry theme'
    },
    variant: {
      control: 'select',
      options: ['compact', 'expanded', 'dropdown'],
      description: 'Display variant'
    },
    norwegianLabels: {
      control: 'boolean',
      description: 'Use Norwegian language labels'
    },
    showDescription: {
      control: 'boolean',
      description: 'Show theme descriptions'
    }
  }
} satisfies Meta<typeof EnhancedThemeSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    currentColorScheme: 'system',
    currentIndustryTheme: 'enterprise',
    onColorSchemeChange: (scheme: ColorScheme) => console.log('Color scheme:', scheme),
    onIndustryThemeChange: (theme: EnhancedIndustryTheme) => console.log('Industry theme:', theme),
    variant: 'compact',
    norwegianLabels: true,
    showDescription: true
  }
};

export const Compact: Story = {
  render: () => {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
    const [industryTheme, setIndustryTheme] = useState<EnhancedIndustryTheme>('enterprise');
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Compact Theme Selector</h3>
        <p className="text-muted-foreground">
          Perfect for toolbars and compact interfaces. Combines color scheme toggle with industry theme dropdown.
        </p>
        
        <EnhancedThemeSelector
          currentColorScheme={colorScheme}
          currentIndustryTheme={industryTheme}
          onColorSchemeChange={setColorScheme}
          onIndustryThemeChange={setIndustryTheme}
          variant="compact"
          norwegianLabels={true}
        />
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Nåværende fargeskjema: {colorScheme}</p>
          <p>Nåværende bransjetema: {ENHANCED_INDUSTRY_THEMES[industryTheme].name}</p>
        </div>
      </div>
    );
  }
};

export const Dropdown: Story = {
  render: () => {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('dark');
    const [industryTheme, setIndustryTheme] = useState<EnhancedIndustryTheme>('finance');
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Dropdown Theme Selector</h3>
        <p className="text-muted-foreground">
          Comprehensive dropdown with sections for both color scheme and industry themes.
        </p>
        
        <EnhancedThemeSelector
          currentColorScheme={colorScheme}
          currentIndustryTheme={industryTheme}
          onColorSchemeChange={setColorScheme}
          onIndustryThemeChange={setIndustryTheme}
          variant="dropdown"
          norwegianLabels={true}
          showDescription={true}
        />
        
        <div className="p-4 rounded-lg border" style={{
          backgroundColor: 'var(--theme-primary, #059669)',
          color: 'white'
        }}>
          <h4 className="font-semibold">Live Preview</h4>
          <p className="text-sm opacity-90 mt-1">
            Dette området viser den valgte temafargene: {ENHANCED_INDUSTRY_THEMES[industryTheme].name}
          </p>
        </div>
      </div>
    );
  }
};

export const Expanded: Story = {
  render: () => {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('system');
    const [industryTheme, setIndustryTheme] = useState<EnhancedIndustryTheme>('healthcare');
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Expanded Theme Selector</h3>
        <p className="text-muted-foreground">
          Full layout with clear sections for color scheme and industry theme selection.
        </p>
        
        <EnhancedThemeSelector
          currentColorScheme={colorScheme}
          currentIndustryTheme={industryTheme}
          onColorSchemeChange={setColorScheme}
          onIndustryThemeChange={setIndustryTheme}
          variant="expanded"
          norwegianLabels={true}
          showDescription={true}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-primary text-primary-foreground rounded-lg">
            <h4 className="font-medium">Primærknapp</h4>
            <p className="text-sm opacity-90">Benytter primærfarge fra valgt tema</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium">Kort</h4>
            <p className="text-sm text-muted-foreground">Tilpasser seg fargeskjema</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium">Bakgrunn</h4>
            <p className="text-sm text-muted-foreground">Automatisk kontrast</p>
          </div>
        </div>
      </div>
    );
  }
};

// Variant Comparison
export const VariantComparison: Story = {
  render: () => {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
    const [industryTheme, setIndustryTheme] = useState<EnhancedIndustryTheme>('productivity');
    
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Compact Variant</h3>
          <EnhancedThemeSelector
            currentColorScheme={colorScheme}
            currentIndustryTheme={industryTheme}
            onColorSchemeChange={setColorScheme}
            onIndustryThemeChange={setIndustryTheme}
            variant="compact"
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Dropdown Variant</h3>
          <EnhancedThemeSelector
            currentColorScheme={colorScheme}
            currentIndustryTheme={industryTheme}
            onColorSchemeChange={setColorScheme}
            onIndustryThemeChange={setIndustryTheme}
            variant="dropdown"
          />
        </div>
      </div>
    );
  }
};

// Industry Theme Showcase
export const IndustryShowcase: Story = {
  render: () => {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
    const [industryTheme, setIndustryTheme] = useState<EnhancedIndustryTheme>('enterprise');
    
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Bransjetemaer for Norske Bedrifter</h3>
          <p className="text-muted-foreground">
            Velg tema som passer din bransje og bruksområde
          </p>
        </div>
        
        <EnhancedThemeSelector
          currentColorScheme={colorScheme}
          currentIndustryTheme={industryTheme}
          onColorSchemeChange={setColorScheme}
          onIndustryThemeChange={setIndustryTheme}
          variant="expanded"
          norwegianLabels={true}
          showDescription={true}
        />
        
        {/* Live Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.values(ENHANCED_INDUSTRY_THEMES).map((theme) => (
            <div
              key={theme.id}
              className={cn(
                'p-6 rounded-lg border transition-all cursor-pointer',
                theme.id === industryTheme ? 'border-primary bg-primary/5' : 'border-border'
              )}
              onClick={() => setIndustryTheme(theme.id)}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{theme.icon}</span>
                <div>
                  <h4 className="font-semibold">{theme.name}</h4>
                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div 
                  className="h-8 rounded"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                <p className="text-xs text-muted-foreground font-mono">
                  {theme.primaryColor}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
};

// Norwegian Enterprise Context
export const NorwegianEnterprise: Story = {
  render: () => {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('system');
    const [industryTheme, setIndustryTheme] = useState<EnhancedIndustryTheme>('enterprise');
    
    return (
      <div className="space-y-8">
        <div className="p-6 bg-card border rounded-xl">
          <h3 className="text-lg font-semibold mb-2">Norsk Bedriftskontekst</h3>
          <p className="text-muted-foreground mb-6">
            Temavelger tilpasset norske bedrifter med støtte for både lysforhold og bransjespesifikke farger.
          </p>
          
          <EnhancedThemeSelector
            currentColorScheme={colorScheme}
            currentIndustryTheme={industryTheme}
            onColorSchemeChange={setColorScheme}
            onIndustryThemeChange={setIndustryTheme}
            variant="dropdown"
            norwegianLabels={true}
            showDescription={true}
          />
        </div>
        
        {/* Norwegian context examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              💰 Finanssektor
            </h4>
            <div className="space-y-2">
              <div className="h-3 bg-green-600 rounded" />
              <p className="text-sm text-muted-foreground">
                Grønne farger for tillit og stabilitet
              </p>
              <p className="text-xs text-muted-foreground">
                Egnet for banker, forsikring, og finansielle tjenester
              </p>
            </div>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              🏥 Helsevesen
            </h4>
            <div className="space-y-2">
              <div className="h-3 bg-red-600 rounded" />
              <p className="text-sm text-muted-foreground">
                Røde farger for medisinsk kontekst
              </p>
              <p className="text-xs text-muted-foreground">
                Tilpasset helseregioner og medisinske systemer
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export const Playground: Story = {
  args: {
    currentColorScheme: 'system',
    currentIndustryTheme: 'enterprise',
    onColorSchemeChange: (scheme: ColorScheme) => console.log('Color scheme:', scheme),
    onIndustryThemeChange: (theme: EnhancedIndustryTheme) => console.log('Industry theme:', theme),
    variant: 'expanded',
    norwegianLabels: true,
    showDescription: true
  }
};