/**
 * Button Stories - Storybook Documentation
 * Comprehensive examples including Norwegian compliance and NSM classifications
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
// Removed heroicons import - using text instead of icons for examples
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Button Component

Professional button component with WCAG AAA compliance and Norwegian NSM security classifications.

## Features
- **CLAUDE.md Compliant**: Minimum 48px height for professional interfaces
- **WCAG AAA**: 7:1 contrast ratios and full keyboard navigation
- **NSM Classifications**: Norwegian security level indicators
- **Touch Optimized**: 44px+ touch targets for mobile devices
- **Loading States**: Built-in spinner with accessible announcements
- **Multi-Platform**: Works across React, Next.js, Vue, Angular, Svelte

## Usage
Import the Button component and use with appropriate sizing and variants.
Note: Small sizes are not available to maintain professional standards.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
      description: 'Visual style variant',
    },
    size: {
      control: { type: 'select' },
      options: ['md', 'lg', 'xl', '2xl', 'icon', 'iconLg', 'iconXl'],
      description: 'Button size (professional sizing only)',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Loading state with spinner',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disabled state',
    },
    fullWidth: {
      control: { type: 'boolean' },
      description: 'Full width button',
    },
    nsmClassification: {
      control: { type: 'select' },
      options: ['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
      description: 'Norwegian NSM security classification',
    },
    children: {
      control: { type: 'text' },
      description: 'Button content',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler',
    },
  },
  args: {
    onClick: action('button-click'),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'lg',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
    size: 'lg',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
    size: 'lg',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
    size: 'lg',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete Account',
    variant: 'destructive',
    size: 'lg',
  },
};

// Size Variants (Professional Sizing)
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-center">
      <Button size="md">Medium (48px)</Button>
      <Button size="lg">Large (56px) - Recommended</Button>
      <Button size="xl">Extra Large (64px)</Button>
      <Button size="2xl">2X Large (72px)</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Professional button sizes meeting CLAUDE.md standards. All buttons are minimum 48px height for professional interfaces.',
      },
    },
  },
};

// Icon Buttons
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button leftIcon={<span>👤</span>}>
        Sign In
      </Button>
      <Button rightIcon={<span>🛡️</span>} variant="secondary">
        Secure Access
      </Button>
      <Button 
        leftIcon={<span>🌍</span>}
        rightIcon={<span>🛡️</span>}
        variant="outline"
      >
        Global Security
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons can include left and/or right icons for enhanced visual communication.',
      },
    },
  },
};

export const IconOnly: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button size="icon" aria-label="User profile">
        👤
      </Button>
      <Button size="iconLg" variant="secondary" aria-label="Security settings">
        🛡️
      </Button>
      <Button size="iconXl" variant="outline" aria-label="Global settings">
        🌍
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icon-only buttons with proper accessibility labels. Always include aria-label for screen readers.',
      },
    },
  },
};

// Loading States
export const Loading: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Button loading>Processing...</Button>
      <Button loading variant="secondary" loadingText="Authenticating with BankID">
        Sign In
      </Button>
      <Button loading variant="outline" size="xl">
        Large Loading Button
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading states with accessible spinner animations. LoadingText provides screen reader announcements.',
      },
    },
  },
};

// Norwegian NSM Classifications
export const NSMClassifications: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button nsmClassification="OPEN">
          Åpen informasjon
        </Button>
        <Button nsmClassification="RESTRICTED">
          Begrenset tilgang
        </Button>
        <Button nsmClassification="CONFIDENTIAL">
          Konfidensiell data
        </Button>
        <Button nsmClassification="SECRET" disabled>
          Hemmelig (Enterprise Only)
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Norwegian NSM security classifications with automatic color coding and accessibility labels.',
      },
    },
  },
};

// Norwegian Government Integration
export const NorwegianGovernment: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <Button size="lg" className="w-full">
        Logg inn med BankID
      </Button>
      <Button variant="secondary" size="lg" className="w-full">
        Logg inn med MinID
      </Button>
      <Button variant="outline" size="lg" className="w-full">
        Fortsett som gjest
      </Button>
      <Button 
        variant="primary" 
        size="lg" 
        className="w-full"
        nsmClassification="RESTRICTED"
      >
        Send til Altinn
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common Norwegian government service patterns with proper sizing and NSM classifications.',
      },
    },
  },
};

// Accessibility Examples
export const Accessibility: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">High Contrast Support</h3>
        <div className="flex gap-4">
          <Button>Normal Contrast</Button>
          <Button variant="outline">High Contrast Border</Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Keyboard Navigation</h3>
        <div className="flex gap-4">
          <Button>Tab to focus</Button>
          <Button variant="secondary">Press Enter to activate</Button>
          <Button variant="outline">Space also works</Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Screen Reader Support</h3>
        <div className="flex gap-4">
          <Button aria-label="Close dialog">×</Button>
          <Button loading loadingText="Saving your changes">
            Save
          </Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Accessibility features including high contrast support, keyboard navigation, and screen reader announcements.',
      },
    },
  },
};

// States Demo
export const States: Story = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Button>Default</Button>
      <Button className="hover:">Hover (hover me)</Button>
      <Button className="focus:">Focus (tab to me)</Button>
      <Button className="active:">Active (click me)</Button>
      <Button disabled>Disabled</Button>
      <Button loading>Loading</Button>
      <Button variant="destructive">Destructive</Button>
      <Button nsmClassification="RESTRICTED">NSM Restricted</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All button states including hover, focus, active, disabled, loading, and NSM classified states.',
      },
    },
  },
};

// Responsive Behavior
export const Responsive: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Button className="w-full">Mobile Full Width</Button>
        <Button className="w-full">Tablet Responsive</Button>
        <Button className="w-full">Desktop Grid</Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" className="flex-1">
          Stacks on mobile
        </Button>
        <Button size="lg" variant="secondary" className="flex-1">
          Horizontal on tablet+
        </Button>
      </div>
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'responsive',
    },
    docs: {
      description: {
        story: 'Responsive button layouts that adapt to different screen sizes. Test with different viewport sizes.',
      },
    },
  },
};

// Full Width Example
export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
    size: 'lg',
  },
  parameters: {
    layout: 'padded',
  },
};