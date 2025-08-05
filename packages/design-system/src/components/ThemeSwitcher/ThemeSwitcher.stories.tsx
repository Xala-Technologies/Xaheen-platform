/**
 * Theme Switcher Stories
 * Demonstrates industry-specific themes with light/dark modes
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { themes } from '../../tokens/themes';

const meta: Meta<typeof ThemeSwitcher> = {
  title: 'Design System/Theme Switcher',
  component: ThemeSwitcher,
  args: {
    onThemeChange: fn(),
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Industry-Specific Theme System

The Xaheen Design System includes professional themes for different industries, each with both light and dark modes.

## Available Themes

### 🎓 Education
- **Purpose**: Friendly and accessible for educational institutions
- **Colors**: Bright blues and warm ambers
- **Features**: Large font scale, comfortable spacing, rounded corners

### 🏥 Healthcare
- **Purpose**: Clean and trustworthy for healthcare applications
- **Colors**: Medical teal and calming blues
- **Features**: Reduced animations, subtle shadows

### 🏛️ Government
- **Purpose**: Authoritative and accessible for government services
- **Colors**: Official navy and red
- **Features**: Sharp corners, comfortable spacing for WCAG AAA

### 💼 Enterprise
- **Purpose**: Professional and sophisticated for business applications
- **Colors**: Corporate blue and neutral grays
- **Features**: Strong shadows, glass effects, enhanced animations

### 🤖 AI & Technology
- **Purpose**: Futuristic and innovative for tech applications
- **Colors**: Electric purple and cyan
- **Features**: Sharp corners, compact spacing, enhanced animations

### 💎 Private & Luxury
- **Purpose**: Elegant and premium for luxury brands
- **Colors**: Rich gold and deep blacks
- **Features**: Large font scale, comfortable spacing, subtle effects

## Features

- **Light & Dark Modes**: Every theme includes optimized light and dark variants
- **WCAG AAA Compliant**: All color combinations meet 7:1 contrast ratios
- **Semantic Colors**: Success, warning, error, and info colors adapted per theme
- **Typography**: Optional custom fonts per theme
- **Effects**: Configurable shadows, animations, and glass effects
- **Responsive**: Themes adapt to different screen sizes

## Usage

\`\`\`tsx
import { ThemeSwitcher } from '@xaheen/design-system';

// Basic usage
<ThemeSwitcher />

// With callbacks
<ThemeSwitcher 
  defaultTheme="healthcare"
  defaultMode="dark"
  onThemeChange={(theme, mode) => {
    console.log(\`Switched to \${theme} theme in \${mode} mode\`);
  }}
/>

// Compact mode
<ThemeSwitcher compact />
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Demo components to show theme changes
const ThemeDemo = () => (
  <div className="space-y-8">
    {/* Color Palette Preview */}
    <section>
      <h3 className="text-xl font-semibold mb-4">Theme Colors</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-2">
          <div className="h-20 bg-primary-500 rounded-lg shadow-md" />
          <p className="text-sm font-medium">Primary</p>
        </div>
        <div className="space-y-2">
          <div className="h-20 bg-secondary-500 rounded-lg shadow-md" />
          <p className="text-sm font-medium">Secondary</p>
        </div>
        <div className="space-y-2">
          <div className="h-20 bg-accent-primary rounded-lg shadow-md" />
          <p className="text-sm font-medium">Accent</p>
        </div>
        <div className="space-y-2">
          <div className="h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg shadow-md" />
          <p className="text-sm font-medium">Gradient</p>
        </div>
      </div>
    </section>

    {/* Typography Examples */}
    <section>
      <h3 className="text-xl font-semibold mb-4">Typography</h3>
      <div className="space-y-3">
        <h1 className="text-4xl font-bold">Heading 1 - Theme Typography</h1>
        <h2 className="text-3xl font-semibold">Heading 2 - Professional Design</h2>
        <h3 className="text-2xl font-medium">Heading 3 - Industry Specific</h3>
        <p className="text-lg">
          Large body text for improved readability in professional applications.
        </p>
        <p>
          Regular body text with optimal line height and spacing for extended reading.
        </p>
        <p className="text-sm text-foreground-tertiary">
          Small text for captions and secondary information.
        </p>
      </div>
    </section>

    {/* Component Examples */}
    <section>
      <h3 className="text-xl font-semibold mb-4">Components</h3>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary Action</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
        
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-2">Card Component</h4>
          <p className="text-foreground-secondary">
            Cards adapt to the current theme's surface colors and shadows.
          </p>
        </Card>
      </div>
    </section>

    {/* Semantic Colors */}
    <section>
      <h3 className="text-xl font-semibold mb-4">Semantic Colors</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-success/10 border border-success rounded-lg">
          <div className="w-8 h-8 bg-success rounded mb-2" />
          <p className="text-sm font-medium">Success</p>
        </div>
        <div className="p-4 bg-warning/10 border border-warning rounded-lg">
          <div className="w-8 h-8 bg-warning rounded mb-2" />
          <p className="text-sm font-medium">Warning</p>
        </div>
        <div className="p-4 bg-error/10 border border-error rounded-lg">
          <div className="w-8 h-8 bg-error rounded mb-2" />
          <p className="text-sm font-medium">Error</p>
        </div>
        <div className="p-4 bg-info/10 border border-info rounded-lg">
          <div className="w-8 h-8 bg-info rounded mb-2" />
          <p className="text-sm font-medium">Info</p>
        </div>
      </div>
    </section>
  </div>
);

export const Default: Story = {
  render: () => (
    <div className="space-y-8">
      <ThemeSwitcher />
      <div className="border-t border-border pt-8">
        <ThemeDemo />
      </div>
    </div>
  ),
};

export const CompactMode: Story = {
  args: {
    compact: true,
  },
  render: (args) => (
    <div className="space-y-8">
      <div className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg">
        <span className="font-medium">Theme Settings</span>
        <ThemeSwitcher {...args} />
      </div>
      <ThemeDemo />
    </div>
  ),
};

export const WithoutLabels: Story = {
  args: {
    showLabels: false,
  },
};

export const EducationTheme: Story = {
  args: {
    defaultTheme: 'education',
  },
  render: (args) => (
    <div className="space-y-8">
      <ThemeSwitcher {...args} />
      <div className="p-6 bg-primary-50 dark:bg-primary-950 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">🎓 Education Theme</h2>
        <p className="mb-4">
          Optimized for learning environments with friendly colors and enhanced readability.
        </p>
        <ThemeDemo />
      </div>
    </div>
  ),
};

export const HealthcareTheme: Story = {
  args: {
    defaultTheme: 'healthcare',
  },
  render: (args) => (
    <div className="space-y-8">
      <ThemeSwitcher {...args} />
      <div className="p-6 bg-primary-50 dark:bg-primary-950 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">🏥 Healthcare Theme</h2>
        <p className="mb-4">
          Clean and calming design for medical applications with reduced motion.
        </p>
        <ThemeDemo />
      </div>
    </div>
  ),
};

export const GovernmentTheme: Story = {
  args: {
    defaultTheme: 'government',
  },
  render: (args) => (
    <div className="space-y-8">
      <ThemeSwitcher {...args} />
      <div className="p-6 bg-surface-secondary rounded">
        <h2 className="text-2xl font-bold mb-4">🏛️ Government Theme</h2>
        <p className="mb-4">
          Authoritative and accessible design meeting strict government standards.
        </p>
        <ThemeDemo />
      </div>
    </div>
  ),
};

export const AITheme: Story = {
  args: {
    defaultTheme: 'ai',
    defaultMode: 'dark',
  },
  render: (args) => (
    <div className="space-y-8">
      <ThemeSwitcher {...args} />
      <div className="p-6 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl backdrop-blur">
        <h2 className="text-2xl font-bold mb-4">🤖 AI & Technology Theme</h2>
        <p className="mb-4">
          Futuristic design with electric colors and enhanced animations.
        </p>
        <ThemeDemo />
      </div>
    </div>
  ),
};

export const LuxuryTheme: Story = {
  args: {
    defaultTheme: 'private',
  },
  render: (args) => (
    <div className="space-y-8">
      <ThemeSwitcher {...args} />
      <div className="p-8 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950 rounded-xl">
        <h2 className="text-3xl font-bold mb-4">💎 Private & Luxury Theme</h2>
        <p className="mb-4 text-lg">
          Elegant and sophisticated design for premium brands and services.
        </p>
        <ThemeDemo />
      </div>
    </div>
  ),
};

// Interactive playground
export const Playground: Story = {
  render: () => {
    const [currentTheme, setCurrentTheme] = React.useState<string>('enterprise');
    const [currentMode, setCurrentMode] = React.useState<string>('light');
    
    return (
      <div className="space-y-8">
        <div className="p-6 bg-surface-secondary rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Theme Playground</h2>
          <p className="mb-6">
            Experiment with different themes and see how components adapt in real-time.
          </p>
          <ThemeSwitcher 
            onThemeChange={fn((theme, mode) => {
              setCurrentTheme(theme);
              setCurrentMode(mode);
            })}
          />
        </div>
        
        <div className="p-6 bg-surface rounded-xl border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold">
                Current: {currentTheme} ({currentMode})
              </h3>
              <p className="text-sm text-foreground-tertiary mt-1">
                {themes[currentTheme as keyof typeof themes].description}
              </p>
            </div>
          </div>
          
          <ThemeDemo />
        </div>
      </div>
    );
  },
};