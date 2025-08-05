import type { Preview } from '@storybook/react';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },

    // Accessibility addon configuration
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            options: { noScroll: true },
          },
          {
            id: 'focus-order-semantics',
            enabled: true,
          },
          {
            id: 'keyboard-navigation',
            enabled: true,
          }
        ],
      },
      options: {
        checks: { 'color-contrast': { options: { noScroll: true } } },
        restoreScroll: true,
      },
    },

    // Viewport configuration for responsive testing
    viewport: {
      viewports: {
        ...INITIAL_VIEWPORTS,
        // Custom Norwegian device viewports
        norwayMobile: {
          name: 'Norway Mobile',
          styles: {
            width: '375px',
            height: '812px',
          },
        },
        norwayTablet: {
          name: 'Norway Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        norwayDesktop: {
          name: 'Norway Desktop',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
      },
      defaultViewport: 'responsive',
    },

    // Background colors for testing
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1a1a1a',
        },
        {
          name: 'norway-light',
          value: '#f8fafc',
        },
        {
          name: 'norway-dark',
          value: '#0f172a',
        },
      ],
    },

    // Documentation configuration
    docs: {
      toc: {
        contentsSelector: '.sbdocs-content',
        headingSelector: 'h1, h2, h3',
        ignoreSelector: '#primary',
        title: 'Table of Contents',
        disable: false,
        unsafeTocbotOptions: {
          orderedList: false,
        },
      },
    },

    // Layout configuration
    layout: 'centered',
  },

  // Global decorators
  decorators: [
    (Story) => (
      <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <Story />
      </div>
    ),
  ],

  // Global arg types
  argTypes: {
    // NSM Classification
    nsmClassification: {
      control: {
        type: 'select',
        options: ['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
      },
      description: 'Norwegian NSM security classification level',
      table: {
        type: { summary: 'OPEN | RESTRICTED | CONFIDENTIAL | SECRET' },
        defaultValue: { summary: 'undefined' },
      },
    },

    // Size variants
    size: {
      control: {
        type: 'select',
        options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      },
      description: 'Component size (professional sizing - no xs/sm for buttons/inputs)',
      table: {
        type: { summary: 'md | lg | xl | 2xl' },
        defaultValue: { summary: 'lg' },
      },
    },

    // Variant types
    variant: {
      control: {
        type: 'select',
      },
      description: 'Visual style variant',
    },

    // Norwegian optimization
    norwegianOptimized: {
      control: {
        type: 'boolean',
      },
      description: 'Enable Norwegian language optimizations (æ, ø, å support)',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },

    // Loading state
    loading: {
      control: {
        type: 'boolean',
      },
      description: 'Loading state with spinner',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },

    // Disabled state
    disabled: {
      control: {
        type: 'boolean',
      },
      description: 'Disabled state',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  ],

  // Global toolbar items
  globalTypes: {
    // Norwegian locale toggle
    locale: {
      description: 'Language locale',
      defaultValue: 'nb-NO',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        items: [
          { value: 'nb-NO', title: 'Norwegian Bokmål' },
          { value: 'nn-NO', title: 'Norwegian Nynorsk' },
          { value: 'en-US', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },

    // NSM compliance mode
    nsmMode: {
      description: 'NSM compliance mode',
      defaultValue: 'enabled',
      toolbar: {
        title: 'NSM Compliance',
        icon: 'shield',
        items: [
          { value: 'enabled', title: 'NSM Enabled' },
          { value: 'disabled', title: 'NSM Disabled' },
        ],
        dynamicTitle: true,
      },
    },

    // Accessibility mode
    a11yMode: {
      description: 'Accessibility testing mode',
      defaultValue: 'wcag-aaa',
      toolbar: {
        title: 'WCAG Level',
        icon: 'accessibility',
        items: [
          { value: 'wcag-aa', title: 'WCAG AA' },
          { value: 'wcag-aaa', title: 'WCAG AAA' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;