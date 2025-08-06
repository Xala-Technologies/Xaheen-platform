/**
 * Separator Component Stories
 * Showcasing all orientations, variants, and specialized separators
 * WCAG AAA compliant examples with Norwegian text
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
  Separator,
  SeparatorWithLabel,
  SeparatorWithIcon,
  SectionSeparator,
  BreadcrumbSeparator,
  MenuSeparator,
  ToolbarSeparator,
  CardSeparator,
} from '../registry/components/separator/separator';

const meta: Meta<typeof Separator> = {
  title: 'Layout/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Professional visual content dividers with multiple variants, orientations, and specialized use cases.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Separator orientation',
    },
    variant: {
      control: 'select',
      options: ['default', 'solid', 'dashed', 'dotted', 'gradient', 'primary', 'secondary', 'muted', 'accent'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Thickness of separator',
    },
    spacing: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Spacing around separator',
    },
    decorative: {
      control: 'boolean',
      description: 'Whether separator is decorative (affects accessibility)',
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default Separator
export const Default: Story = {
  render: () => {
    return (
      <div className="w-full max-w-md space-y-4">
        <div>
          <h3 className="text-base font-medium text-gray-900">Første seksjon</h3>
          <p className="text-sm text-gray-600">
            Dette innholdet kommer før separatoren.
          </p>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-base font-medium text-gray-900">Andre seksjon</h3>
          <p className="text-sm text-gray-600">
            Dette innholdet kommer etter separatoren.
          </p>
        </div>
      </div>
    );
  },
};

// Orientation Variants
export const OrientationVariants: Story = {
  render: () => {
    return (
      <div className="space-y-8">
        <div className="w-full max-w-md">
          <h3 className="text-base font-medium text-gray-900 mb-4">Horisontal separator</h3>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Innhold over</p>
            <Separator orientation="horizontal" />
            <p className="text-sm text-gray-600">Innhold under</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-4">Vertikal separator</h3>
          <div className="flex items-center gap-4 h-24">
            <div className="flex-1 text-center">
              <p className="text-sm text-gray-600">Venstre innhold</p>
            </div>
            <Separator orientation="vertical" className="h-16" />
            <div className="flex-1 text-center">
              <p className="text-sm text-gray-600">Høyre innhold</p>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Variant Styles
export const VariantStyles: Story = {
  render: () => {
    const variants = [
      { key: 'default', label: 'Standard', variant: 'default' as const },
      { key: 'solid', label: 'Solid', variant: 'solid' as const },
      { key: 'dashed', label: 'Stiplet', variant: 'dashed' as const },
      { key: 'dotted', label: 'Prikket', variant: 'dotted' as const },
      { key: 'gradient', label: 'Gradient', variant: 'gradient' as const },
      { key: 'primary', label: 'Primær', variant: 'primary' as const },
      { key: 'secondary', label: 'Sekundær', variant: 'secondary' as const },
      { key: 'muted', label: 'Dempet', variant: 'muted' as const },
      { key: 'accent', label: 'Aksent', variant: 'accent' as const },
    ];

    return (
      <div className="w-full max-w-2xl space-y-6">
        <h3 className="text-base font-medium text-gray-900">Separator-varianter</h3>
        
        <div className="space-y-4">
          {variants.map(({ key, label, variant }) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  variant="{variant}"
                </code>
              </div>
              <Separator variant={variant} />
            </div>
          ))}
        </div>
      </div>
    );
  },
};

// Size Variants
export const SizeVariants: Story = {
  render: () => {
    const sizes = [
      { key: 'xs', label: 'Ekstra liten (1px)', size: 'xs' as const },
      { key: 'sm', label: 'Liten (1px)', size: 'sm' as const },
      { key: 'md', label: 'Medium (2px)', size: 'md' as const },
      { key: 'lg', label: 'Stor (4px)', size: 'lg' as const },
      { key: 'xl', label: 'Ekstra stor (8px)', size: 'xl' as const },
    ];

    return (
      <div className="w-full max-w-2xl space-y-6">
        <h3 className="text-base font-medium text-gray-900">Separator-størrelser</h3>
        
        <div className="space-y-6">
          {sizes.map(({ key, label, size }) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  size="{size}"
                </code>
              </div>
              <Separator size={size} variant="solid" />
            </div>
          ))}
        </div>
      </div>
    );
  },
};

// Spacing Variants
export const SpacingVariants: Story = {
  render: () => {
    const spacings = [
      { key: 'none', label: 'Ingen spacing', spacing: 'none' as const },
      { key: 'xs', label: 'Ekstra liten (0.25rem)', spacing: 'xs' as const },
      { key: 'sm', label: 'Liten (0.5rem)', spacing: 'sm' as const },
      { key: 'md', label: 'Medium (1rem)', spacing: 'md' as const },
      { key: 'lg', label: 'Stor (1.5rem)', spacing: 'lg' as const },
      { key: 'xl', label: 'Ekstra stor (2rem)', spacing: 'xl' as const },
    ];

    return (
      <div className="w-full max-w-md">
        <h3 className="text-base font-medium text-gray-900 mb-6">Spacing-varianter</h3>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          {spacings.map(({ key, label, spacing }, index) => (
            <div key={key}>
              <div className="p-3 bg-white rounded">
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <code className="text-xs text-gray-500">spacing="{spacing}"</code>
              </div>
              
              {index < spacings.length - 1 && (
                <Separator spacing={spacing} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  },
};

// Separator with Label
export const SeparatorWithLabelExamples: Story = {
  render: () => {
    return (
      <div className="w-full max-w-2xl space-y-8">
        <h3 className="text-base font-medium text-gray-900">Separatorer med etiketter</h3>
        
        <div className="space-y-6">
          {/* Center positioned labels */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Sentrert etikett</h4>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Innhold i første seksjon</p>
            </div>
            
            <SeparatorWithLabel
              label="ELLER"
              labelPosition="center"
              variant="default"
              spacing="md"
            />
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Innhold i andre seksjon</p>
            </div>
          </div>
          
          {/* Left positioned labels */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Venstrejustert etikett</h4>
            
            <SeparatorWithLabel
              label="Kontaktinformasjon"
              labelPosition="left"
              variant="muted"
              spacing="sm"
            />
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">E-post og telefonnummer</p>
            </div>
          </div>
          
          {/* Right positioned labels */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Høyrejustert etikett</h4>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Hovedinnhold</p>
            </div>
            
            <SeparatorWithLabel
              label="Sist oppdatert: 15. nov 2024"
              labelPosition="right"
              variant="secondary"
              spacing="sm"
            />
          </div>
        </div>
      </div>
    );
  },
};

// Separator with Icon
export const SeparatorWithIconExamples: Story = {
  render: () => {
    const icons = {
      star: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      heart: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
      diamond: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 3h12l4 6-10 12L2 9z" />
        </svg>
      ),
    };

    return (
      <div className="w-full max-w-2xl space-y-8">
        <h3 className="text-base font-medium text-gray-900">Separatorer med ikoner</h3>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Premium innhold</p>
            </div>
            
            <SeparatorWithIcon
              icon={icons.star}
              iconPosition="center"
              variant="primary"
              spacing="md"
            />
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Mer premium innhold</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Favoritt innhold</p>
            </div>
            
            <SeparatorWithIcon
              icon={icons.heart}
              iconPosition="left"
              variant="accent"
              spacing="sm"
            />
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Mer favoritt innhold</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Luksuriøst innhold</p>
            </div>
            
            <SeparatorWithIcon
              icon={icons.diamond}
              iconPosition="right"
              variant="gradient"
              spacing="lg"
            />
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Mer luksuriøst innhold</p>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Specialized Separators
export const SpecializedSeparators: Story = {
  render: () => {
    return (
      <div className="w-full max-w-4xl space-y-12">
        <h3 className="text-lg font-medium text-gray-900">Spesialiserte separatorer</h3>
        
        {/* Section Separator */}
        <div className="space-y-6">
          <h4 className="text-base font-medium text-gray-700">Section Separator</h4>
          <div className="text-center space-y-6">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h5 className="text-lg font-semibold text-gray-900">Første seksjon</h5>
              <p className="text-gray-600 mt-2">Viktig innhold som skal skilles tydelig fra resten.</p>
            </div>
            
            <SectionSeparator />
            
            <div className="p-6 bg-gray-50 rounded-lg">
              <h5 className="text-lg font-semibold text-gray-900">Andre seksjon</h5>
              <p className="text-gray-600 mt-2">Nytt innhold etter section separator.</p>
            </div>
          </div>
        </div>
        
        {/* Breadcrumb Separator */}
        <div className="space-y-4">
          <h4 className="text-base font-medium text-gray-700">Breadcrumb Separator</h4>
          <nav className="flex items-center space-x-2 text-sm">
            <a href="#" className="text-blue-600 hover:text-blue-700">Hjem</a>
            <BreadcrumbSeparator />
            <a href="#" className="text-blue-600 hover:text-blue-700">Produkter</a>
            <BreadcrumbSeparator />
            <a href="#" className="text-blue-600 hover:text-blue-700">Elektronikk</a>
            <BreadcrumbSeparator />
            <span className="text-gray-500">Mobiltelefoner</span>
          </nav>
        </div>
        
        {/* Menu Separator */}
        <div className="space-y-4">
          <h4 className="text-base font-medium text-gray-700">Menu Separator</h4>
          <div className="w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
              Rediger
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
              Kopier
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
              Del
            </button>
            
            <MenuSeparator />
            
            <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded">
              Slett
            </button>
          </div>
        </div>
        
        {/* Toolbar Separator */}
        <div className="space-y-4">
          <h4 className="text-base font-medium text-gray-700">Toolbar Separator</h4>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <button className="p-2 text-gray-600 hover:bg-white rounded">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button className="p-2 text-gray-600 hover:bg-white rounded">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            
            <ToolbarSeparator />
            
            <button className="p-2 text-gray-600 hover:bg-white rounded">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button className="p-2 text-gray-600 hover:bg-white rounded">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            
            <ToolbarSeparator />
            
            <button className="p-2 text-gray-600 hover:bg-white rounded">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Card Separator */}
        <div className="space-y-4">
          <h4 className="text-base font-medium text-gray-700">Card Separator</h4>
          <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="space-y-2">
              <h5 className="font-medium text-gray-900">Kort overskrift</h5>
              <p className="text-sm text-gray-600">Første del av kortinnholdet med viktig informasjon.</p>
            </div>
            
            <CardSeparator spacing="md" />
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Andre del av kortinnholdet etter separator.</p>
              <button className="w-full h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Handling
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Norwegian Enterprise Example
export const NorwegianEnterpriseExample: Story = {
  render: () => {
    return (
      <div className="w-full max-w-2xl space-y-8">
        <h3 className="text-lg font-medium text-gray-900">Norsk virksomhetsbruk</h3>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="space-y-4">
            {/* Company header */}
            <div className="text-center">
              <h4 className="text-xl font-semibold text-gray-900">Bedrift AS</h4>
              <p className="text-sm text-gray-500">Org.nr: 123 456 789</p>
            </div>
            
            <SectionSeparator spacing="lg" />
            
            {/* Contact section */}
            <div>
              <SeparatorWithLabel
                label="Kontaktinformasjon"
                labelPosition="left"
                variant="primary"
                spacing="sm"
              />
              
              <div className="mt-4 space-y-2 text-sm">
                <p><strong>Adresse:</strong> Storgata 1, 0123 Oslo</p>
                <p><strong>Telefon:</strong> +47 12 34 56 78</p>
                <p><strong>E-post:</strong> kontakt@bedrift.no</p>
              </div>
            </div>
            
            <CardSeparator />
            
            {/* Services section */}
            <div>
              <SeparatorWithIcon
                icon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                }
                iconPosition="left"
                variant="accent"
                spacing="sm"
                ariaLabel="Våre tjenester"
              />
              
              <div className="mt-4">
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Rådgivning innen IT-sikkerhet</li>
                  <li>• Systemintegrasjon og utvikling</li>
                  <li>• GDPR-compliance tjenester</li>
                  <li>• 24/7 support og vedlikehold</li>
                </ul>
              </div>
            </div>
            
            <CardSeparator />
            
            {/* Certifications */}
            <div>
              <SeparatorWithLabel
                label="Sertifiseringer og godkjenninger"
                labelPosition="center"
                variant="muted"
                spacing="sm"
              />
              
              <div className="mt-4 flex justify-center gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-600">ISO 27001</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-600">NSM Godkjent</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-600">GDPR</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Accessibility Demonstration
export const AccessibilityDemo: Story = {
  render: () => {
    return (
      <div className="w-full max-w-2xl space-y-8">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900">Tilgjengelighetsfunksjoner</h3>
          <ul className="text-sm text-blue-800 mt-2 space-y-1">
            <li>• Dekorative separatorer har role="presentation"</li>
            <li>• Semantiske separatorer har role="separator"</li>
            <li>• ARIA-labels for ikke-dekorative separatorer</li>
            <li>• Riktig orientering for skjermlesere</li>
            <li>• Tilpasset kontrast for synshemmede</li>
          </ul>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Dekorativ separator</h4>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Denne separatoren er kun visuell og vil bli ignorert av skjermlesere.</p>
              <Separator decorative={true} ariaLabel="Dekorativ separator" />
              <p className="text-sm text-gray-600">Tekst etter dekorativ separator.</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Semantisk separator</h4>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Denne separatoren har semantisk betydning og vil bli annonsert av skjermlesere.</p>
              <Separator 
                decorative={false} 
                ariaLabel="Separator mellom hovedinnhold og tilleggsinformasjon"
                role="separator"
              />
              <p className="text-sm text-gray-600">Tekst etter semantisk separator.</p>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Interactive Playground
export const Playground: Story = {
  render: (args) => {
    return (
      <div className="w-full max-w-md">
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Innhold over separatoren. Juster innstillingene for å se hvordan separatoren endrer seg.
            </p>
          </div>
          
          <Separator
            orientation={args.orientation}
            variant={args.variant}
            size={args.size}
            spacing={args.spacing}
            decorative={args.decorative}
            ariaLabel={args.ariaLabel}
          />
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Innhold under separatoren. Bruk Storybook controls for å teste forskjellige konfigurasjoner.
            </p>
          </div>
        </div>
      </div>
    );
  },
  args: {
    orientation: 'horizontal',
    variant: 'default',
    size: 'sm',
    spacing: 'none',
    decorative: true,
    ariaLabel: 'Separator',
  },
};