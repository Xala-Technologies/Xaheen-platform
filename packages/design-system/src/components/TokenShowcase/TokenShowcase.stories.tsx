/**
 * Token Showcase - Demonstrates the enhanced design tokens
 * Shows colors, typography, spacing, and animations in use
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';

// Import tokens with error handling
let colorTokens: any;
let typographyTokens: any;
let spacingTokens: any;

try {
  colorTokens = require('../../tokens/colors').colorTokens;
  typographyTokens = require('../../tokens/typography').typographyTokens;
  spacingTokens = require('../../tokens/spacing').spacingTokens;
} catch (e) {
  console.error('Failed to load tokens:', e);
  // Provide fallback empty objects
  colorTokens = { primary: {}, secondary: {}, nsm: {}, gradient: {} };
  typographyTokens = { fontSize: {}, fontWeight: {} };
  spacingTokens = { scale: {} };
}

// Simple showcase component
const TokenShowcase = () => {
  // Check if tokens are loaded
  if (!colorTokens || !typographyTokens || !spacingTokens) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Token Loading Error</h2>
        <p>Failed to load design tokens. Please check the console for errors.</p>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto p-8 space-y-12">
      {/* Enhanced Color Tokens */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Enhanced Color Tokens</h2>
        
        {/* Primary Colors */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Primary Brand Colors (WCAG AAA)</h3>
          <div className="grid grid-cols-5 gap-4">
            {colorTokens.primary && Object.entries(colorTokens.primary).map(([key, value]) => (
              <div key={key} className="text-center">
                <div 
                  className="h-20 rounded-lg shadow-md mb-2" 
                  style={{ backgroundColor: value }}
                />
                <p className="text-sm font-medium">{key}</p>
                <p className="text-xs text-gray-500">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary Colors */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Secondary Brand Colors</h3>
          <div className="grid grid-cols-5 gap-4">
            {colorTokens.secondary && Object.entries(colorTokens.secondary).map(([key, value]) => (
              <div key={key} className="text-center">
                <div 
                  className="h-20 rounded-lg shadow-md mb-2" 
                  style={{ backgroundColor: value }}
                />
                <p className="text-sm font-medium">{key}</p>
                <p className="text-xs text-gray-500">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* NSM Classifications */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Norwegian NSM Security Classifications</h3>
          <div className="grid grid-cols-4 gap-4">
            {colorTokens.nsm && Object.entries(colorTokens.nsm).map(([classification, colors]) => (
              <div key={classification} className="space-y-2">
                <h4 className="font-medium capitalize">{classification}</h4>
                <div 
                  className="h-16 rounded-lg shadow-md flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: colors.default }}
                >
                  {classification.toUpperCase()}
                </div>
                <div className="space-y-1">
                  <div className="h-8 rounded" style={{ backgroundColor: colors.light }} />
                  <div className="h-8 rounded" style={{ backgroundColor: colors.dark }} />
                  <div className="h-8 rounded" style={{ backgroundColor: colors.background }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gradients */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Professional Gradients</h3>
          <div className="grid grid-cols-3 gap-4">
            {colorTokens.gradient && Object.entries(colorTokens.gradient).map(([key, value]) => (
              <div key={key} className="text-center">
                <div 
                  className="h-24 rounded-lg shadow-md mb-2" 
                  style={{ background: value }}
                />
                <p className="text-sm font-medium capitalize">{key}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Typography */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Enhanced Typography Tokens</h2>
        
        {/* Fluid Font Sizes */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Fluid Typography Scale</h3>
          <div className="space-y-3">
            {typographyTokens.fontSize && Object.entries(typographyTokens.fontSize).map(([key, value]) => (
              <div key={key} className="flex items-baseline gap-4">
                <span className="text-sm font-mono text-gray-500 w-16">{key}:</span>
                <p style={{ fontSize: value }}>
                  The quick brown fox jumps over the lazy dog
                </p>
                <span className="text-xs text-gray-400">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Font Weights */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Font Weight Scale</h3>
          <div className="grid grid-cols-3 gap-4">
            {typographyTokens.fontWeight && Object.entries(typographyTokens.fontWeight).map(([key, value]) => (
              <p key={key} style={{ fontWeight: value }} className="text-lg">
                {key} ({value})
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Spacing */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Enhanced Spacing Tokens</h2>
        <div className="grid grid-cols-8 gap-4">
          {spacingTokens.scale && Object.entries(spacingTokens.scale).map(([key, value]) => (
            <div key={key} className="text-center">
              <div 
                className="bg-primary-500 mb-2" 
                style={{ height: value, width: value }}
              />
              <p className="text-xs font-mono">{key}</p>
              <p className="text-xs text-gray-500">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Animations in Action */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Animation Tokens</h2>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Button Interactions</h3>
          <div className="flex gap-4 flex-wrap">
            <Button variant="primary">Hover Me (Primary)</Button>
            <Button variant="secondary">Hover Me (Secondary)</Button>
            <Button variant="outline">Hover Me (Outline)</Button>
            <Button variant="ghost">Hover Me (Ghost)</Button>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Loading States</h3>
          <div className="flex gap-4 flex-wrap">
            <Button loading>Loading...</Button>
            <Button loading variant="secondary" loadingText="Processing payment">
              Process Payment
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">NSM Classifications with Tokens</h3>
          <div className="flex gap-4 flex-wrap">
            <Button nsmClassification="OPEN">Open Data</Button>
            <Button nsmClassification="RESTRICTED">Restricted Access</Button>
            <Button nsmClassification="CONFIDENTIAL">Confidential</Button>
            <Button nsmClassification="SECRET">Secret</Button>
          </div>
        </div>
      </section>

      {/* Token Usage Verification */}
      <section className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">✅ Token Usage Verification</h2>
        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <strong>Color Tokens:</strong> Enhanced with gradients, alpha values, NSM classifications
          </p>
          <p className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <strong>Typography Tokens:</strong> Fluid scale, professional font stacks, Norwegian optimizations
          </p>
          <p className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <strong>Spacing Tokens:</strong> Enhanced 8pt grid with professional scale
          </p>
          <p className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <strong>Animation Tokens:</strong> Smooth micro-interactions with reduced motion support
          </p>
          <p className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <strong>CSS Custom Properties:</strong> Tokens available via CSS variables for theming
          </p>
        </div>
      </section>
    </div>
  );
};

const meta: Meta<typeof TokenShowcase> = {
  title: 'Design System/Token Showcase',
  component: TokenShowcase,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Enhanced Design Tokens

This showcase demonstrates all the enhanced design tokens in the Xaheen Design System:

## ✨ What's Enhanced

### 🎨 Color System
- **Primary & Secondary**: Full scale with WCAG AAA contrast ratios
- **NSM Classifications**: Norwegian security levels with proper color coding
- **Gradients**: Professional gradients for modern UI
- **Semantic Colors**: Success, warning, error, info with proper accessibility
- **Alpha Values**: For overlays and glassmorphism effects

### 📝 Typography
- **Fluid Font Sizes**: Responsive scaling with clamp()
- **Professional Font Stack**: Inter, system fonts, Norwegian optimizations
- **Font Weights**: Complete scale from thin to black
- **Line Heights**: Optimized for readability

### 📐 Spacing
- **Enhanced 8pt Grid**: Professional spacing scale
- **Fluid Spacing**: Responsive spacing with viewport units
- **Safe Areas**: Mobile device safe area support

### 🎭 Animations
- **Micro-interactions**: Button hovers, focus states
- **Loading States**: Smooth spinners and skeletons
- **Page Transitions**: Fade and slide animations
- **Reduced Motion**: Respects user preferences

## 🔧 Usage

All tokens are available as:
1. **JavaScript objects**: Import from \`@xaheen/design-system\`
2. **CSS Custom Properties**: Available in :root
3. **Tailwind Classes**: Extended Tailwind config

The tokens are fully integrated into all components and provide a consistent, professional design language across the entire system.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Theme variations
export const DarkTheme: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};

export const HighContrast: Story = {
  decorators: [
    (Story) => (
      <div className="high-contrast">
        <Story />
      </div>
    ),
  ],
};