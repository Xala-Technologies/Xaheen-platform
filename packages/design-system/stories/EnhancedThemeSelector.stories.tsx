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
  render: () => {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
    const [industryTheme, setIndustryTheme] = useState<EnhancedIndustryTheme>('enterprise');
    
    return (
      <div className="max-w-4xl mx-auto space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Xaheen Theme System</h2>
          <p className="text-lg text-muted-foreground">
            Comprehensive theming solution for Norwegian enterprises with industry-specific colors and full accessibility
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-background to-muted/30 p-8 rounded-2xl border shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Interactive Theme Selector</h3>
          <EnhancedThemeSelector
            currentColorScheme={colorScheme}
            currentIndustryTheme={industryTheme}
            onColorSchemeChange={setColorScheme}
            onIndustryThemeChange={setIndustryTheme}
            variant="compact"
            norwegianLabels={true}
            showDescription={true}
          />
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Current Selection</h4>
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Theme:</span> {ENHANCED_INDUSTRY_THEMES[industryTheme].name}</div>
                <div><span className="font-medium">Color Scheme:</span> {colorScheme}</div>
                <div><span className="font-medium">Industry:</span> {ENHANCED_INDUSTRY_THEMES[industryTheme].theme.industry}</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Theme Preview</h4>
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded-lg border shadow-sm"
                  style={{ backgroundColor: 'var(--color-primary-600, #1d4ed8)' }}
                  title="Primary Color"
                />
                <div 
                  className="w-8 h-8 rounded-lg border shadow-sm"
                  style={{ backgroundColor: 'var(--color-secondary-500, #6b7280)' }}
                  title="Secondary Color"
                />
                <div 
                  className="w-8 h-8 rounded-lg border shadow-sm"
                  style={{ backgroundColor: 'var(--color-accent-primary, #059669)' }}
                  title="Accent Color"
                />
                <div 
                  className="w-8 h-8 rounded-lg border shadow-sm"
                  style={{ backgroundColor: 'var(--color-success, #10b981)' }}
                  title="Success Color"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export const Compact: Story = {
  render: () => {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
    const [industryTheme, setIndustryTheme] = useState<EnhancedIndustryTheme>('enterprise');
    
    return (
      <div className="max-w-3xl mx-auto space-y-8 p-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Compact Theme Selector</h3>
          <p className="text-muted-foreground">
            Perfect for toolbars and compact interfaces. Combines color scheme toggle with industry theme dropdown.
          </p>
        </div>
        
        <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
          <EnhancedThemeSelector
            currentColorScheme={colorScheme}
            currentIndustryTheme={industryTheme}
            onColorSchemeChange={setColorScheme}
            onIndustryThemeChange={setIndustryTheme}
            variant="compact"
            norwegianLabels={true}
          />
          
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Gjeldende valg</h4>
                <div className="space-y-1 text-muted-foreground">
                  <div>Fargeskjema: <span className="font-medium text-foreground">{colorScheme}</span></div>
                  <div>Bransjetema: <span className="font-medium text-foreground">{ENHANCED_INDUSTRY_THEMES[industryTheme].name}</span></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Egenskaper</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>✓ WCAG AAA-kompatibel</div>
                  <div>✓ Norsk språkstøtte</div>
                  <div>✓ Responsive design</div>
                  <div>✓ Tastaturnavigasjon</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Demo components showing theme application */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-primary text-primary-foreground p-4 rounded-lg">
            <h4 className="font-semibold">Primærkomponent</h4>
            <p className="text-sm opacity-90 mt-1">Bruker primærfarge fra valgt tema</p>
          </div>
          <div className="bg-secondary text-secondary-foreground p-4 rounded-lg">
            <h4 className="font-semibold">Sekundærkomponent</h4>
            <p className="text-sm opacity-90 mt-1">Tilpasser seg sekundærfarger</p>
          </div>
          <div className="border p-4 rounded-lg">
            <h4 className="font-semibold">Nøytral komponent</h4>
            <p className="text-sm text-muted-foreground mt-1">Følger standard fargepalett</p>
          </div>
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
            Velg tema som passer din bransje og bruksområde. Hver bransje har sin egen fargepsykologi og designprinsipper.
          </p>
        </div>
        
        <div className="bg-card p-6 rounded-xl border">
          <EnhancedThemeSelector
            currentColorScheme={colorScheme}
            currentIndustryTheme={industryTheme}
            onColorSchemeChange={setColorScheme}
            onIndustryThemeChange={setIndustryTheme}
            variant="expanded"
            norwegianLabels={true}
            showDescription={true}
          />
        </div>
        
        {/* Live Examples with Full Color Palettes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.values(ENHANCED_INDUSTRY_THEMES).map((themeInfo) => {
            const colorMode = colorScheme === 'system' 
              ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
              : colorScheme === 'dark' ? 'dark' : 'light';
            const themeColors = themeInfo.theme.colors[colorMode];
            
            return (
              <div
                key={themeInfo.id}
                className={cn(
                  'p-6 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg',
                  themeInfo.id === industryTheme 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border hover:border-primary/50'
                )}
                onClick={() => setIndustryTheme(themeInfo.id)}
              >
                <div className="flex items-start gap-4 mb-6">
                  <span className="text-4xl">{themeInfo.icon}</span>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold mb-1">{themeInfo.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{themeInfo.description}</p>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Branche:</span> {themeInfo.theme.industry}
                    </div>
                  </div>
                  {themeInfo.id === industryTheme && (
                    <div className="w-3 h-3 bg-primary rounded-full" />
                  )}
                </div>
                
                {/* Color Palette Preview */}
                <div className="space-y-3">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Fargepalett</div>
                  
                  {/* Primary Colors */}
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Primær</div>
                    <div className="flex gap-1">
                      {[300, 500, 700].map(shade => (
                        <div 
                          key={shade}
                          className="w-8 h-6 rounded border"
                          style={{ backgroundColor: themeColors.primary[shade] }}
                          title={`Primary ${shade}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Semantic Colors */}
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Semantisk</div>
                    <div className="flex gap-1">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: themeColors.semantic.success }}
                        title="Success"
                      />
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: themeColors.semantic.warning }}
                        title="Warning"
                      />
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: themeColors.semantic.error }}
                        title="Error"
                      />
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: themeColors.semantic.info }}
                        title="Info"
                      />
                    </div>
                  </div>

                  {/* Accent Colors */}
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Aksent</div>
                    <div className="flex gap-1">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: themeColors.accent.primary }}
                        title="Accent Primary"
                      />
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: themeColors.accent.secondary }}
                        title="Accent Secondary"
                      />
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: themeColors.accent.tertiary }}
                        title="Accent Tertiary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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

// Live Component Preview
export const LivePreview: Story = {
  render: () => {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
    const [industryTheme, setIndustryTheme] = useState<EnhancedIndustryTheme>('enterprise');
    
    // Sample Button component for demonstration
    const PreviewButton = ({ children, variant = 'primary', ...props }: any) => (
      <button 
        className={cn(
          'inline-flex items-center justify-center h-12 px-6 rounded-lg font-medium transition-colors',
          variant === 'primary' && 'bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)]',
          variant === 'secondary' && 'bg-[var(--color-secondary-500)] text-[var(--color-secondary-50)] hover:bg-[var(--color-secondary-600)]',
          variant === 'success' && 'bg-[var(--color-success)] text-white hover:opacity-90'
        )}
        {...props}
      >
        {children}
      </button>
    );
    
    const PreviewCard = ({ children, ...props }: any) => (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6 shadow-sm" {...props}>
        {children}
      </div>
    );
    
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Live Component Preview</h3>
          <p className="text-muted-foreground">
            Se hvordan komponenter ser ut med forskjellige temaer i sanntid
          </p>
        </div>
        
        {/* Theme Selector */}
        <div className="bg-card p-6 rounded-xl border">
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
        
        {/* Live Component Examples */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Button Examples */}
          <PreviewCard>
            <h4 className="text-lg font-semibold mb-4 text-[var(--color-foreground)]">Knapper</h4>
            <div className="space-y-3">
              <div className="flex gap-3 flex-wrap">
                <PreviewButton variant="primary">Primær</PreviewButton>
                <PreviewButton variant="secondary">Sekundær</PreviewButton>
                <PreviewButton variant="success">Suksess</PreviewButton>
              </div>
              <p className="text-xs text-[var(--color-foreground-tertiary)]">
                Knapper bruker temaets primærfarger og følger WCAG AAA retningslinjer
              </p>
            </div>
          </PreviewCard>
          
          {/* Form Examples */}
          <PreviewCard>
            <h4 className="text-lg font-semibold mb-4 text-[var(--color-foreground)]">Skjemaelementer</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground-secondary)] mb-1">
                  E-postadresse
                </label>
                <input 
                  type="email" 
                  placeholder="ola.nordmann@bedrift.no"
                  className="w-full h-12 px-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-colors"
                />
              </div>
              <p className="text-xs text-[var(--color-foreground-tertiary)]">
                Skjemafelt tilpasser seg automatisk til valgt tema
              </p>
            </div>
          </PreviewCard>
          
          {/* Alert Examples */}
          <PreviewCard>
            <h4 className="text-lg font-semibold mb-4 text-[var(--color-foreground)]">Meldinger</h4>
            <div className="space-y-3">
              <div className="p-3 bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 rounded-lg">
                <div className="text-sm font-medium text-[var(--color-success)]">Suksess!</div>
                <div className="text-xs text-[var(--color-foreground-secondary)] mt-1">
                  Operasjonen ble gjennomført vellykket
                </div>
              </div>
              <p className="text-xs text-[var(--color-foreground-tertiary)]">
                Semantiske farger gir konsistent feedback
              </p>
            </div>
          </PreviewCard>
          
          {/* Theme Info */}
          <PreviewCard>
            <h4 className="text-lg font-semibold mb-4 text-[var(--color-foreground)]">Gjeldende Tema</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ENHANCED_INDUSTRY_THEMES[industryTheme].icon}</span>
                <div>
                  <div className="font-medium text-[var(--color-foreground)]">
                    {ENHANCED_INDUSTRY_THEMES[industryTheme].name}
                  </div>
                  <div className="text-sm text-[var(--color-foreground-secondary)]">
                    {colorScheme === 'system' ? 'Systeminnstilling' : colorScheme === 'dark' ? 'Mørk modus' : 'Lys modus'}
                  </div>
                </div>
              </div>
              <p className="text-xs text-[var(--color-foreground-tertiary)]">
                {ENHANCED_INDUSTRY_THEMES[industryTheme].description}
              </p>
            </div>
          </PreviewCard>
        </div>
      </div>
    );
  }
};