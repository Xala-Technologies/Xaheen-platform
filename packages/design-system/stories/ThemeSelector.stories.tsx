/**
 * Theme Selector Component Stories
 * Industry theme switcher for Norwegian enterprise applications
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { 
  ThemeSelector, 
  ThemeSelectorIndustry, 
  INDUSTRY_THEMES,
  useThemeSelector 
} from '../registry/components/theme-selector/theme-selector';

const meta: Meta<typeof ThemeSelector> = {
  title: 'Components/ThemeSelector',
  component: ThemeSelector,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Industry-specific theme selector with Norwegian labels. Supports enterprise, finance, healthcare, education, ecommerce, and productivity themes with WCAG AAA accessibility compliance.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    currentTheme: {
      control: 'select',
      options: Object.keys(INDUSTRY_THEMES),
      description: 'Currently active theme'
    },
    variant: {
      control: 'select',
      options: ['dropdown', 'grid', 'tabs'],
      description: 'Display variant'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant'
    },
    showDescription: {
      control: 'boolean',
      description: 'Show theme descriptions'
    },
    norwegianLabels: {
      control: 'boolean',
      description: 'Use Norwegian language labels'
    }
  }
} satisfies Meta<typeof ThemeSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    currentTheme: 'enterprise',
    onThemeChange: (theme: ThemeSelectorIndustry) => console.log('Theme changed to:', theme),
    variant: 'dropdown',
    size: 'md',
    showDescription: true,
    norwegianLabels: true
  }
};

export const Dropdown: Story = {
  render: () => {
    const [currentTheme, setCurrentTheme] = useState<ThemeSelectorIndustry>('enterprise');
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Dropdown Theme Selector</h3>
        <ThemeSelector
          currentTheme={currentTheme}
          onThemeChange={setCurrentTheme}
          variant="dropdown"
          size="md"
          showDescription={true}
          norwegianLabels={true}
        />
        <p className="text-sm text-muted-foreground">
          Nåværende tema: {INDUSTRY_THEMES[currentTheme].name}
        </p>
      </div>
    );
  }
};

export const Grid: Story = {
  render: () => {
    const [currentTheme, setCurrentTheme] = useState<ThemeSelectorIndustry>('finance');
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Grid Theme Selector</h3>
        <ThemeSelector
          currentTheme={currentTheme}
          onThemeChange={setCurrentTheme}
          variant="grid"
          size="md"
          showDescription={true}
          norwegianLabels={true}
        />
        <p className="text-sm text-muted-foreground">
          Valgt tema: {INDUSTRY_THEMES[currentTheme].name}
        </p>
      </div>
    );
  }
};

export const Tabs: Story = {
  render: () => {
    const [currentTheme, setCurrentTheme] = useState<ThemeSelectorIndustry>('healthcare');
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Tabs Theme Selector</h3>
        <ThemeSelector
          currentTheme={currentTheme}
          onThemeChange={setCurrentTheme}
          variant="tabs"
          size="md"
          norwegianLabels={true}
        />
        <p className="text-sm text-muted-foreground">
          Aktivt tema: {INDUSTRY_THEMES[currentTheme].name}
        </p>
      </div>
    );
  }
};

// Size Variants
export const Sizes: Story = {
  render: () => {
    const [currentTheme, setCurrentTheme] = useState<ThemeSelectorIndustry>('education');
    
    return (
      <div className="space-y-8">
        <div>
          <h4 className="font-medium mb-3">Small</h4>
          <ThemeSelector
            currentTheme={currentTheme}
            onThemeChange={setCurrentTheme}
            variant="dropdown"
            size="sm"
            showDescription={false}
          />
        </div>
        
        <div>
          <h4 className="font-medium mb-3">Medium (Default)</h4>
          <ThemeSelector
            currentTheme={currentTheme}
            onThemeChange={setCurrentTheme}
            variant="dropdown"
            size="md"
          />
        </div>
        
        <div>
          <h4 className="font-medium mb-3">Large</h4>
          <ThemeSelector
            currentTheme={currentTheme}
            onThemeChange={setCurrentTheme}
            variant="dropdown"
            size="lg"
          />
        </div>
      </div>
    );
  }
};

// All Industry Themes
export const AllThemes: Story = {
  render: () => {
    const [currentTheme, setCurrentTheme] = useState<ThemeSelectorIndustry>('enterprise');
    
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(INDUSTRY_THEMES).map((theme) => (
            <div key={theme.id} className="p-6 border rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{theme.icon}</span>
                <div>
                  <h3 className="font-semibold">{theme.name}</h3>
                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                </div>
              </div>
              
              <div className="space-y-3">
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
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Prøv alle temaer</h3>
          <ThemeSelector
            currentTheme={currentTheme}
            onThemeChange={setCurrentTheme}
            variant="grid"
            size="sm"
            showDescription={true}
          />
        </div>
      </div>
    );
  }
};

// Interactive Demo with Theme Application
export const InteractiveDemo: Story = {
  render: () => {
    const { currentTheme, applyTheme } = useThemeSelector('enterprise');
    
    return (
      <div className="space-y-8">
        <div className="p-6 bg-card border rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Live Theme Preview</h3>
          
          <ThemeSelector
            currentTheme={currentTheme}
            onThemeChange={applyTheme}
            variant="dropdown"
            size="md"
            showDescription={true}
          />
          
          <div className="mt-6 p-4 rounded-lg border" style={{
            backgroundColor: 'var(--theme-primary, #1e40af)',
            color: 'white'
          }}>
            <h4 className="font-semibold">Tema Forhåndsvisning</h4>
            <p className="text-sm opacity-90 mt-1">
              Dette området viser den valgte temafargene i sanntid.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-primary text-primary-foreground rounded-lg">
            <h4 className="font-medium">Primærknapp</h4>
            <p className="text-sm opacity-90">Hovedhandlinger</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium">Kort</h4>
            <p className="text-sm text-muted-foreground">Standard innhold</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium">Bakgrunn</h4>
            <p className="text-sm text-muted-foreground">Sekundær informasjon</p>
          </div>
        </div>
      </div>
    );
  }
};

// Norwegian Enterprise Context
export const NorwegianEnterprise: Story = {
  render: () => {
    const [currentTheme, setCurrentTheme] = useState<ThemeSelectorIndustry>('enterprise');
    
    return (
      <div className="space-y-8">
        <div className="p-6 bg-card border rounded-xl">
          <h3 className="text-lg font-semibold mb-2">Norske Bedriftstemaer</h3>
          <p className="text-muted-foreground mb-6">
            Velg tema basert på din bransje og bruksområde. Alle temaer følger norske designstandarder og WCAG AAA-retningslinjer.
          </p>
          
          <ThemeSelector
            currentTheme={currentTheme}
            onThemeChange={setCurrentTheme}
            variant="grid"
            size="md"
            showDescription={true}
            norwegianLabels={true}
          />
        </div>
        
        {/* Industry-specific examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg">
            <h4 className="font-semibold mb-4">Finans & Banking</h4>
            <div className="space-y-3">
              <div className="h-2 bg-green-600 rounded" />
              <p className="text-sm text-muted-foreground">
                Grønne farger for tillit og stabilitet
              </p>
            </div>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h4 className="font-semibold mb-4">Helse & Omsorg</h4>
            <div className="space-y-3">
              <div className="h-2 bg-red-600 rounded" />
              <p className="text-sm text-muted-foreground">
                Røde farger for medisinsk kontekst
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

// Accessibility Demo
export const AccessibilityDemo: Story = {
  render: () => {
    const [currentTheme, setCurrentTheme] = useState<ThemeSelectorIndustry>('productivity');
    
    return (
      <div className="space-y-6">
        <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r">
          <h3 className="font-semibold text-blue-900">Tilgjengelighetsfunksjoner</h3>
          <ul className="mt-2 text-sm text-blue-800 space-y-1">
            <li>• Tastaturnavigasjon med Tab og Enter</li>
            <li>• ARIA-etiketter på norsk</li>
            <li>• Fokusindikatorer og hover-tilstander</li>
            <li>• Skjermleservennlige beskrivelser</li>
          </ul>
        </div>
        
        <ThemeSelector
          currentTheme={currentTheme}
          onThemeChange={setCurrentTheme}
          variant="dropdown"
          size="lg"
          showDescription={true}
          norwegianLabels={true}
        />
        
        <div className="text-sm text-muted-foreground">
          <p>Prøv å navigere med tastaturet:</p>
          <ul className="mt-2 space-y-1">
            <li>• Tab for å fokusere på komponenten</li>
            <li>• Enter eller Space for å åpne menyen</li>
            <li>• Piltaster for å navigere mellom alternativer</li>
            <li>• Escape for å lukke menyen</li>
          </ul>
        </div>
      </div>
    );
  }
};

export const Playground: Story = {
  args: {
    currentTheme: 'enterprise',
    onThemeChange: (theme: ThemeSelectorIndustry) => console.log('Theme changed to:', theme),
    variant: 'dropdown',
    size: 'md',
    showDescription: true,
    norwegianLabels: true
  }
};