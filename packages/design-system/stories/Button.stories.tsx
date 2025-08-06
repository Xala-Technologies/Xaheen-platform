/**
 * Button Component Stories
 * Showcasing all variants, sizes, and states with design tokens
 * WCAG AAA compliant examples with Norwegian text
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { colorTokens } from '../registry/tokens/colors';
import { spacingTokens } from '../registry/tokens/spacing';
import { shadowTokens } from '../registry/tokens/shadows';

// Temporary simple Button for Storybook demo
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  ...props 
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-colors";
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300", 
    outline: "border border-gray-300 bg-transparent hover:bg-gray-50"
  };
  const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-6 text-base"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      {...props}
    >
      {children}
    </button>
  );
};

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
      description: 'Visual style variant'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant'
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make button full width'
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button'
    },
    nsmClassification: {
      control: 'select',
      options: [undefined, 'OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
      description: 'NSM security classification'
    }
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    children: 'Klikk meg',
    variant: 'primary'
  }
};

export const Secondary: Story = {
  args: {
    children: 'Sekundær handling',
    variant: 'secondary'
  }
};

export const Outline: Story = {
  args: {
    children: 'Omriss knapp',
    variant: 'outline'
  }
};

export const Ghost: Story = {
  args: {
    children: 'Spøkelsesknapp',
    variant: 'ghost'
  }
};

export const Destructive: Story = {
  args: {
    children: 'Slett',
    variant: 'destructive'
  }
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-center">
      <Button size="md">Medium (48px)</Button>
      <Button size="lg">Large (56px) - Standard</Button>
      <Button size="xl">Extra Large (64px)</Button>
      <Button size="2xl">2X Large (72px)</Button>
    </div>
  )
};

// Icon Buttons
export const IconButtons: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Button size="icon" aria-label="Innstillinger">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </Button>
      <Button size="iconLg" variant="secondary" aria-label="Søk">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </Button>
      <Button size="iconXl" variant="outline" aria-label="Meny">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </Button>
    </div>
  )
};

// With Icons
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Button 
        leftIcon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
      >
        Legg til element
      </Button>
      <Button 
        variant="secondary"
        rightIcon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        }
      >
        Neste steg
      </Button>
      <Button 
        variant="outline"
        leftIcon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
        }
        rightIcon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        }
      >
        Naviger
      </Button>
    </div>
  )
};

// Loading States
export const LoadingStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Button loading loadingText="Laster...">
        Lagre endringer
      </Button>
      <Button loading variant="secondary">
        Behandler...
      </Button>
      <Button loading variant="destructive" loadingText="Sletter...">
        Slett konto
      </Button>
    </div>
  )
};

// NSM Classification
export const NSMClassification: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-medium mb-2">NSM Security Classifications</h3>
        <div className="flex flex-col gap-2">
          <Button nsmClassification="OPEN">Åpen informasjon</Button>
          <Button nsmClassification="RESTRICTED">Begrenset</Button>
          <Button nsmClassification="CONFIDENTIAL">Konfidensiell</Button>
          <Button nsmClassification="SECRET">Hemmelig</Button>
        </div>
      </div>
    </div>
  )
};

// States
export const States: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button>Normal</Button>
      <Button disabled>Deaktivert</Button>
      <Button loading>Laster</Button>
    </div>
  )
};

// Full Width
export const FullWidth: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <Button fullWidth>Full bredde primær</Button>
      <Button fullWidth variant="secondary">Full bredde sekundær</Button>
      <Button fullWidth variant="outline">Full bredde omriss</Button>
    </div>
  )
};

// Design Tokens Showcase
export const DesignTokensShowcase: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Fargetokens</h3>
        <div className="flex gap-2">
          <Button>Primær ({colorTokens.primary[600]})</Button>
          <Button variant="secondary">Sekundær ({colorTokens.secondary[600]})</Button>
          <Button variant="destructive">Destruktiv ({colorTokens.semantic.error.default})</Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Avstandstokens</h3>
        <div className="flex flex-col gap-2">
          <Button>Standard polstring (px-{spacingTokens.spacing[6]} = 1.5rem)</Button>
          <Button size="xl">XL polstring (px-{spacingTokens.spacing[10]} = 2.5rem)</Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Skyggetokens</h3>
        <div className="flex gap-4">
          <Button>Standard skygge ({shadowTokens.light.md})</Button>
          <div className="p-2 bg-background">
            <Button variant="ghost">Ingen skygge</Button>
          </div>
        </div>
      </div>
    </div>
  )
};

// Norwegian Enterprise Example
export const NorwegianEnterprise: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">BankID Innlogging</h3>
        <div className="space-y-4">
          <Button fullWidth leftIcon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          }>
            Logg inn med BankID
          </Button>
          <Button fullWidth variant="outline">
            Logg inn med BankID på mobil
          </Button>
        </div>
      </div>
      
      <div className="p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Altinn Integrasjon</h3>
        <div className="space-y-4">
          <Button nsmClassification="RESTRICTED">
            Hent data fra Altinn
          </Button>
          <Button variant="secondary" nsmClassification="RESTRICTED">
            Send til Altinn
          </Button>
        </div>
      </div>
    </div>
  )
};

// Interactive Playground
export const Playground: Story = {
  args: {
    children: 'Interaktiv knapp',
    variant: 'primary',
    size: 'lg',
    fullWidth: false,
    loading: false,
    disabled: false
  }
};