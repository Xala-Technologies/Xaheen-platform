/**
 * Interactive Playground Generator
 * Creates interactive component playgrounds with live code editing
 */

import type { BaseComponentSpec, Platform } from '../core/component-specs';
import type { UniversalTheme } from '../core/theme-system';
import type { IndustryTheme } from './template-generator';

// =============================================================================
// PLAYGROUND TYPES
// =============================================================================

export interface PlaygroundContext {
  readonly spec: BaseComponentSpec;
  readonly platform: Platform;
  readonly theme?: UniversalTheme;
  readonly industry?: IndustryTheme;
  readonly options: PlaygroundOptions;
}

export interface PlaygroundOptions {
  readonly format: PlaygroundFormat;
  readonly features: PlaygroundFeature[];
  readonly customizations: PlaygroundCustomization[];
  readonly integrations: PlaygroundIntegration[];
}

export type PlaygroundFormat = 
  | 'codesandbox'
  | 'stackblitz' 
  | 'codepen'
  | 'storybook'
  | 'standalone'
  | 'embedded';

export type PlaygroundFeature = 
  | 'live-editing'
  | 'theme-switcher'
  | 'responsive-preview'
  | 'accessibility-inspector'
  | 'performance-monitor'
  | 'code-export'
  | 'variant-selector'
  | 'props-panel';

export interface PlaygroundCustomization {
  readonly id: string;
  readonly label: string;
  readonly type: 'select' | 'toggle' | 'range' | 'color' | 'text';
  readonly options?: string[];
  readonly defaultValue: any;
  readonly description: string;
}

export interface PlaygroundIntegration {
  readonly name: string;
  readonly url: string;
  readonly description: string;
  readonly config: Record<string, any>;
}

export interface GeneratedPlayground {
  readonly url?: string;
  readonly html: string;
  readonly css: string;
  readonly js: string;
  readonly config: Record<string, any>;
  readonly dependencies: string[];
}

// =============================================================================
// PLAYGROUND GENERATOR
// =============================================================================

export class PlaygroundGenerator {
  /**
   * Generate interactive playground for component
   */
  static generatePlayground(context: PlaygroundContext): GeneratedPlayground {
    const { spec, platform, options } = context;
    
    switch (options.format) {
      case 'codesandbox':
        return this.generateCodeSandbox(context);
      case 'stackblitz':
        return this.generateStackBlitz(context);
      case 'codepen':
        return this.generateCodePen(context);
      case 'storybook':
        return this.generateStorybookPlayground(context);
      case 'standalone':
        return this.generateStandalonePlayground(context);
      case 'embedded':
        return this.generateStandalonePlayground(context);
      default:
        throw new Error(`Unsupported playground format: ${options.format}`);
    }
  }

  // =============================================================================
  // CODESANDBOX PLAYGROUND
  // =============================================================================

  private static generateCodeSandbox(context: PlaygroundContext): GeneratedPlayground {
    const { spec, platform } = context;
    
    const config = {
      files: this.generatePlaygroundFiles(context),
      dependencies: this.generateDependencies(platform),
      template: this.getTemplate(platform),
      title: `${spec.name} - Interactive Playground`,
      description: `Interactive playground for ${spec.name} component with live editing and theme switching`,
      tags: ['xaheen-ui', 'design-system', spec.category, platform],
      public: true
    };

    return {
      url: this.generateCodeSandboxURL(config),
      html: config.files['index.html'] || '',
      css: config.files['styles.css'] || '',
      js: config.files['App.tsx'] || config.files['App.js'] || '',
      config,
      dependencies: config.dependencies
    };
  }

  private static generateCodeSandboxURL(config: any): string {
    const parameters = btoa(JSON.stringify(config));
    return `https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}`;
  }

  // =============================================================================
  // STACKBLITZ PLAYGROUND
  // =============================================================================

  private static generateStackBlitz(context: PlaygroundContext): GeneratedPlayground {
    const { spec, platform } = context;
    
    const config = {
      files: this.generatePlaygroundFiles(context),
      template: this.getStackBlitzTemplate(platform),
      title: `${spec.name} Interactive Playground`,
      description: `Live playground for ${spec.name} component`,
      dependencies: this.generateDependencies(platform)
    };

    return {
      url: this.generateStackBlitzURL(config),
      html: config.files['index.html'] || '',
      css: config.files['style.css'] || '',
      js: config.files['App.tsx'] || config.files['App.js'] || '',
      config,
      dependencies: config.dependencies
    };
  }

  private static generateStackBlitzURL(config: any): string {
    return 'https://stackblitz.com/fork/github/xaheen/playground-templates/tree/main/' + 
           config.template + '?title=' + encodeURIComponent(config.title);
  }

  // =============================================================================
  // CODEPEN PLAYGROUND
  // =============================================================================

  private static generateCodePen(context: PlaygroundContext): GeneratedPlayground {
    const { spec } = context;
    const files = this.generatePlaygroundFiles(context);
    
    const config = {
      title: `${spec.name} Component Playground`,
      description: `Interactive ${spec.name} component with customization controls`,
      html: files['index.html'] || '',
      css: files['style.css'] || '',
      js: files['script.js'] || '',
      css_external: [
        'https://cdn.tailwindcss.com',
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
      ],
      js_external: [
        'https://unpkg.com/react@18/umd/react.development.js',
        'https://unpkg.com/react-dom@18/umd/react-dom.development.js'
      ]
    };

    return {
      url: this.generateCodePenURL(config),
      html: config.html,
      css: config.css,
      js: config.js,
      config,
      dependencies: []
    };
  }

  private static generateCodePenURL(config: any): string {
    const data = {
      title: config.title,
      description: config.description,
      html: config.html,
      css: config.css,
      js: config.js,
      css_external: config.css_external.join(','),
      js_external: config.js_external.join(',')
    };

    return 'https://codepen.io/pen/define?' + new URLSearchParams(data).toString();
  }

  // =============================================================================
  // STORYBOOK PLAYGROUND
  // =============================================================================

  private static generateStorybookPlayground(context: PlaygroundContext): GeneratedPlayground {
    const { spec, platform } = context;
    
    const storybookConfig = this.generateStorybookConfig(context);
    const story = this.generateInteractiveStory(context);
    
    return {
      html: '',
      css: '',
      js: story,
      config: storybookConfig,
      dependencies: this.generateStorybookDependencies(platform)
    };
  }

  private static generateStorybookConfig(context: PlaygroundContext): any {
    const { spec, options } = context;
    
    return {
      parameters: {
        controls: { expanded: true },
        docs: { 
          page: null,
          source: { type: 'dynamic' }
        },
        backgrounds: {
          default: 'light',
          values: [
            { name: 'light', value: '#ffffff' },
            { name: 'dark', value: '#1a1a1a' },
            { name: 'gray', value: '#f5f5f5' }
          ]
        },
        viewport: {
          viewports: {
            mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
            tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
            desktop: { name: 'Desktop', styles: { width: '1024px', height: '768px' } }
          }
        }
      },
      argTypes: this.generateArgTypes(spec),
      decorators: options.features.includes('theme-switcher') ? 
        ['ThemeDecorator', 'ResponsiveDecorator'] : []
    };
  }

  private static generateInteractiveStory(context: PlaygroundContext): string {
    const { spec, options } = context;
    
    const features = options.features;
    
    return `import type { Meta, StoryObj } from '@storybook/react';
import { ${spec.name} } from '../${spec.id}';
${features.includes('theme-switcher') ? "import { ThemeProvider } from '../themes/ThemeProvider';" : ''}
${features.includes('accessibility-inspector') ? "import { a11yDecorator } from '../decorators/a11yDecorator';" : ''}

const meta: Meta<typeof ${spec.name}> = {
  title: 'Interactive/${spec.name}',
  component: ${spec.name},
  parameters: {
    layout: 'centered',
    ${features.includes('responsive-preview') ? `
    viewport: {
      defaultViewport: 'desktop',
    },` : ''}
    ${features.includes('accessibility-inspector') ? `
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'keyboard-navigation', enabled: true },
          { id: 'focus-management', enabled: true }
        ]
      }
    },` : ''}
  },
  argTypes: ${JSON.stringify(this.generateArgTypes(spec), null, 4)},
  ${features.includes('theme-switcher') || features.includes('accessibility-inspector') ? `
  decorators: [
    ${features.includes('theme-switcher') ? '(Story) => <ThemeProvider><Story /></ThemeProvider>,' : ''}
    ${features.includes('accessibility-inspector') ? 'a11yDecorator,' : ''}
  ],` : ''}
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  args: {
    ${spec.props.filter(p => p.default !== undefined)
      .map(p => `${p.name}: ${JSON.stringify(p.default)}`)
      .join(',\n    ')}
  },
  ${features.includes('live-editing') ? `
  render: (args) => {
    const [props, setProps] = React.useState(args);
    
    React.useEffect(() => {
      setProps(args);
    }, [args]);
    
    return (
      <div className="playground-container">
        <div className="component-preview">
          <${spec.name} {...props}>
            ${spec.category === 'atom' ? 'Interactive Component' : 'Content goes here'}
          </${spec.name}>
        </div>
        ${features.includes('code-export') ? `
        <div className="code-export">
          <CodeBlock 
            code={\`<${spec.name} \${Object.entries(props)
              .map(([key, value]) => \`\${key}={\${JSON.stringify(value)}}\`)
              .join(' ')}>Content</${spec.name}>\`}
            language="tsx"
          />
        </div>` : ''}
      </div>
    );
  },` : ''}
};

${features.includes('variant-selector') && spec.variants ? `
export const VariantShowcase: Story = {
  render: () => (
    <div className="variants-showcase">
      ${spec.variants.map(variant => `
      <div className="variant-demo">
        <h3>${variant.name}</h3>
        <p>${variant.description}</p>
        <${spec.name} variant="${variant.name}">
          ${variant.name} variant
        </${spec.name}>
      </div>`).join('\n      ')}
    </div>
  )
};` : ''}

${features.includes('responsive-preview') ? `
export const ResponsiveTest: Story = {
  parameters: {
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1200px', height: '800px' } }
      }
    }
  },
  render: (args) => (
    <div className="responsive-test">
      <${spec.name} {...args}>
        Responsive Component Test
      </${spec.name}>
    </div>
  )
};` : ''}`;
  }

  // =============================================================================
  // STANDALONE PLAYGROUND
  // =============================================================================

  private static generateStandalonePlayground(context: PlaygroundContext): GeneratedPlayground {
    const { spec, options } = context;
    
    const html = this.generateStandaloneHTML(context);
    const css = this.generateStandaloneCSS(context);
    const js = this.generateStandaloneJS(context);
    
    return {
      html,
      css,
      js,
      config: {
        title: `${spec.name} Interactive Playground`,
        features: options.features,
        customizations: options.customizations
      },
      dependencies: this.generateDependencies(context.platform)
    };
  }

  private static generateStandaloneHTML(context: PlaygroundContext): string {
    const { spec, options } = context;
    const features = options.features;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${spec.name} Interactive Playground</title>
    <link href="https://cdn.tailwindcss.com/3.3.0/tailwind.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="./playground.css">
</head>
<body class="bg-gray-50 font-sans">
    <div id="playground-app">
        <header class="playground-header">
            <div class="container mx-auto px-4 py-6">
                <h1 class="text-3xl font-bold text-gray-900">${spec.name} Playground</h1>
                <p class="text-gray-600 mt-2">${spec.description}</p>
            </div>
        </header>
        
        <main class="container mx-auto px-4 py-8">
            <div class="playground-grid">
                <!-- Component Preview -->
                <div class="preview-panel">
                    <h2 class="text-xl font-semibold mb-4">Preview</h2>
                    <div class="preview-container" id="component-preview">
                        <!-- Component will be rendered here -->
                    </div>
                </div>
                
                ${features.includes('props-panel') ? `
                <!-- Controls Panel -->
                <div class="controls-panel">
                    <h2 class="text-xl font-semibold mb-4">Controls</h2>
                    <div id="controls-container">
                        ${this.generateControlsHTML(spec, options.customizations)}
                    </div>
                </div>` : ''}
                
                ${features.includes('code-export') ? `
                <!-- Code Panel -->
                <div class="code-panel">
                    <h2 class="text-xl font-semibold mb-4">Code</h2>
                    <div class="code-tabs">
                        <button class="tab-button active" data-tab="jsx">JSX</button>
                        <button class="tab-button" data-tab="html">HTML</button>
                        <button class="tab-button" data-tab="css">CSS</button>
                    </div>
                    <div class="code-content">
                        <pre id="code-output"><code class="language-jsx"></code></pre>
                    </div>
                </div>` : ''}
            </div>
            
            ${features.includes('theme-switcher') ? `
            <!-- Theme Switcher -->
            <div class="theme-controls">
                <label class="flex items-center space-x-2">
                    <span>Theme:</span>
                    <select id="theme-selector" class="form-select">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                    </select>
                </label>
            </div>` : ''}
        </main>
    </div>
    
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="./playground.js"></script>
</body>
</html>`;
  }

  private static generateStandaloneCSS(context: PlaygroundContext): string {
    const { options } = context;
    const features = options.features;
    
    return `.playground-header {
  @apply bg-white border-b border-gray-200;
}

.playground-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .playground-grid {
    grid-template-columns: ${features.includes('props-panel') ? '1fr 300px' : '1fr'};
  }
}

.preview-panel {
  @apply bg-white rounded-lg border border-gray-200 p-6;
}

.preview-container {
  @apply bg-gray-50 rounded-lg p-8 min-h-[200px] flex items-center justify-center;
}

${features.includes('props-panel') ? `
.controls-panel {
  @apply bg-white rounded-lg border border-gray-200 p-6;
}

.control-group {
  @apply mb-4;
}

.control-label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.form-input, .form-select {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.form-checkbox {
  @apply h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded;
}

.form-range {
  @apply w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer;
}
` : ''}

${features.includes('code-export') ? `
.code-panel {
  @apply bg-white rounded-lg border border-gray-200 p-6 col-span-full;
}

.code-tabs {
  @apply flex border-b border-gray-200 mb-4;
}

.tab-button {
  @apply px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300;
}

.tab-button.active {
  @apply text-blue-600 border-blue-600;
}

.code-content {
  @apply bg-gray-900 rounded-lg p-4 overflow-x-auto;
}

.code-content pre {
  @apply text-green-400 text-sm;
}
` : ''}

${features.includes('responsive-preview') ? `
.responsive-controls {
  @apply flex space-x-2 mb-4;
}

.device-button {
  @apply px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md border;
}

.device-button.active {
  @apply bg-blue-100 text-blue-700 border-blue-300;
}
` : ''}

${features.includes('theme-switcher') ? `
.theme-controls {
  @apply fixed top-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg;
}
` : ''}

/* Dark theme support */
.dark {
  @apply bg-gray-900 text-white;
}

.dark .playground-header {
  @apply bg-gray-800 border-gray-700;
}

.dark .preview-panel,
.dark .controls-panel {
  @apply bg-gray-800 border-gray-700;
}

.dark .preview-container {
  @apply bg-gray-700;
}`;
  }

  private static generateStandaloneJS(context: PlaygroundContext): string {
    const { spec, options } = context;
    
    return `// ${spec.name} Interactive Playground
const { useState, useEffect } = React;

// Component props state
const [componentProps, setComponentProps] = useState({
  ${spec.props.filter(p => p.default !== undefined)
    .map(p => `${p.name}: ${JSON.stringify(p.default)}`)
    .join(',\n  ')}
});

// Component definition
const ${spec.name}Component = (props) => {
  return React.createElement('div', {
    className: 'inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors',
    ...props
  }, props.children || '${spec.name}');
};

// Render component
function renderComponent() {
  const container = document.getElementById('component-preview');
  const root = ReactDOM.createRoot(container);
  
  root.render(
    React.createElement(${spec.name}Component, componentProps, '${spec.name} Example')
  );
}

${options.features.includes('props-panel') ? `
// Control handlers
function handlePropChange(propName, value) {
  setComponentProps(prev => ({
    ...prev,
    [propName]: value
  }));
}

// Initialize controls
function initializeControls() {
  ${options.customizations.map(custom => `
  const ${custom.id}Control = document.getElementById('${custom.id}');
  if (${custom.id}Control) {
    ${custom.id}Control.addEventListener('${custom.type === 'toggle' ? 'change' : 'input'}', (e) => {
      const value = ${custom.type === 'toggle' ? 'e.target.checked' : 
                    custom.type === 'range' ? 'parseInt(e.target.value)' : 
                    'e.target.value'};
      handlePropChange('${custom.id}', value);
    });
  }`).join('\n  ')}
}` : ''}

${options.features.includes('theme-switcher') ? `
// Theme switcher
function initializeThemeSwitcher() {
  const themeSelector = document.getElementById('theme-selector');
  if (themeSelector) {
    themeSelector.addEventListener('change', (e) => {
      const theme = e.target.value;
      document.documentElement.classList.remove('light', 'dark');
      
      if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
      } else {
        document.documentElement.classList.add(theme);
      }
    });
  }
}` : ''}

${options.features.includes('code-export') ? `
// Code export
function updateCodeOutput() {
  const codeOutput = document.querySelector('#code-output code');
  if (codeOutput) {
    const propsString = Object.entries(componentProps)
      .map(([key, value]) => \`\${key}={\${JSON.stringify(value)}}\`)
      .join(' ');
    
    codeOutput.textContent = \`<${spec.name} \${propsString}>
  ${spec.name} Example
</${spec.name}>\`;
  }
}` : ''}

// Initialize playground
function initializePlayground() {
  renderComponent();
  ${options.features.includes('props-panel') ? 'initializeControls();' : ''}
  ${options.features.includes('theme-switcher') ? 'initializeThemeSwitcher();' : ''}
  ${options.features.includes('code-export') ? 'updateCodeOutput();' : ''}
}

// Update component when props change
useEffect(() => {
  renderComponent();
  ${options.features.includes('code-export') ? 'updateCodeOutput();' : ''}
}, [componentProps]);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePlayground);`;
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private static generatePlaygroundFiles(context: PlaygroundContext): Record<string, string> {
    const { platform } = context;
    const files: Record<string, string> = {};
    
    switch (platform) {
      case 'react':
      case 'nextjs':
        files['App.tsx'] = this.generateReactApp(context);
        files['package.json'] = this.generatePackageJson(context);
        break;
      case 'vue':
        files['App.vue'] = this.generateVueApp(context);
        files['package.json'] = this.generatePackageJson(context);
        break;
      case 'angular':
        files['app.component.ts'] = this.generateAngularApp(context);
        files['package.json'] = this.generatePackageJson(context);
        break;
      case 'svelte':
        files['App.svelte'] = this.generateSvelteApp(context);
        files['package.json'] = this.generatePackageJson(context);
        break;
    }
    
    files['index.html'] = this.generateIndexHTML(context);
    files['style.css'] = this.generatePlaygroundCSS(context);
    
    return files;
  }

  private static generateReactApp(context: PlaygroundContext): string {
    const { spec, options } = context;
    const features = options.features;
    
    return `import React, { useState } from 'react';
import { ${spec.name} } from './components/${spec.id}';
${features.includes('theme-switcher') ? "import { ThemeProvider } from './theme/ThemeProvider';" : ''}

function App() {
  const [props, setProps] = useState({
    ${spec.props.filter(p => p.default !== undefined)
      .map(p => `${p.name}: ${JSON.stringify(p.default)}`)
      .join(',\n    ')}
  });

  return (
    ${features.includes('theme-switcher') ? '<ThemeProvider>' : '<div className="playground-app">'}
      <div className="playground-container">
        <header className="playground-header">
          <h1>${spec.name} Interactive Playground</h1>
          <p>${spec.description}</p>
        </header>
        
        <main className="playground-content">
          <div className="component-preview">
            <${spec.name} {...props}>
              Interactive ${spec.name}
            </${spec.name}>
          </div>
          
          ${features.includes('props-panel') ? `
          <div className="controls-panel">
            <h2>Controls</h2>
            ${this.generateReactControls(spec, options)}
          </div>` : ''}
        </main>
      </div>
    ${features.includes('theme-switcher') ? '</ThemeProvider>' : '</div>'}
  );
}

export default App;`;
  }

  private static generateReactControls(_spec: BaseComponentSpec, options: PlaygroundOptions): string {
    return options.customizations.map(custom => {
      switch (custom.type) {
        case 'select':
          return `
            <div className="control-group">
              <label>{custom.label}</label>
              <select 
                value={props.${custom.id}} 
                onChange={(e) => setProps(prev => ({ ...prev, ${custom.id}: e.target.value }))}
              >
                ${custom.options?.map(option => 
                  `<option value="${option}">${option}</option>`
                ).join('\n                ')}
              </select>
            </div>`;
        case 'toggle':
          return `
            <div className="control-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={props.${custom.id}} 
                  onChange={(e) => setProps(prev => ({ ...prev, ${custom.id}: e.target.checked }))}
                />
                ${custom.label}
              </label>
            </div>`;
        default:
          return `
            <div className="control-group">
              <label>{custom.label}</label>
              <input 
                type="${custom.type === 'range' ? 'range' : 'text'}"
                value={props.${custom.id}} 
                onChange={(e) => setProps(prev => ({ ...prev, ${custom.id}: e.target.value }))}
              />
            </div>`;
      }
    }).join('\n            ');
  }

  private static generateControlsHTML(_spec: BaseComponentSpec, customizations: PlaygroundCustomization[]): string {
    return customizations.map(custom => {
      switch (custom.type) {
        case 'select':
          return `
          <div class="control-group">
            <label class="control-label">${custom.label}</label>
            <select id="${custom.id}" class="form-select">
              ${custom.options?.map(option => 
                `<option value="${option}" ${option === custom.defaultValue ? 'selected' : ''}>${option}</option>`
              ).join('\n              ')}
            </select>
          </div>`;
        case 'toggle':
          return `
          <div class="control-group">
            <label class="flex items-center space-x-2">
              <input id="${custom.id}" type="checkbox" class="form-checkbox" ${custom.defaultValue ? 'checked' : ''}>
              <span>${custom.label}</span>
            </label>
          </div>`;
        case 'range':
          return `
          <div class="control-group">
            <label class="control-label">${custom.label}</label>
            <input id="${custom.id}" type="range" class="form-range" value="${custom.defaultValue}">
          </div>`;
        default:
          return `
          <div class="control-group">
            <label class="control-label">${custom.label}</label>
            <input id="${custom.id}" type="text" class="form-input" value="${custom.defaultValue}">
          </div>`;
      }
    }).join('\n          ');
  }

  private static generateArgTypes(spec: BaseComponentSpec): any {
    const argTypes: any = {};
    
    spec.props.forEach(prop => {
      argTypes[prop.name] = {
        description: prop.description,
        table: {
          type: { summary: prop.type },
          defaultValue: prop.default !== undefined ? { summary: JSON.stringify(prop.default) } : undefined
        }
      };
      
      // Add control based on prop type
      if (prop.type.includes('boolean')) {
        argTypes[prop.name].control = { type: 'boolean' };
      } else if (prop.type.includes('|')) {
        const options = prop.type.split('|').map(s => s.trim().replace(/['"]/g, ''));
        argTypes[prop.name].control = { type: 'select', options };
      } else if (prop.type.includes('number')) {
        argTypes[prop.name].control = { type: 'number' };
      } else {
        argTypes[prop.name].control = { type: 'text' };
      }
    });
    
    return argTypes;
  }

  private static generateDependencies(platform: Platform): string[] {
    const baseDeps = ['react', 'react-dom'];
    
    const platformDeps: Record<Platform, string[]> = {
      'react': ['@xaheen-ai/design-system-react'],
      'nextjs': ['@xaheen-ai/design-system-react', 'next'],
      'vue': ['vue', '@xaheen-ai/design-system-vue'],
      'angular': ['@angular/core', '@angular/common', '@xaheen-ai/design-system-angular'],
      'svelte': ['svelte', '@xaheen-ai/design-system-svelte'],
      'react-native': ['react-native', '@xaheen-ai/design-system-rn'],
      'ionic': ['@ionic/react', '@ionic/core', '@xaheen-ai/design-system-ionic'],
      // ... other platforms
    } as any;
    
    return [...baseDeps, ...(platformDeps[platform] || [])];
  }

  private static generateStorybookDependencies(platform: Platform): string[] {
    return [
      '@storybook/react',
      '@storybook/addon-controls',
      '@storybook/addon-docs',
      '@storybook/addon-viewport',
      '@storybook/addon-a11y',
      ...this.generateDependencies(platform)
    ];
  }

  private static getTemplate(platform: Platform): string {
    const templates: Record<Platform, string> = {
      'react': 'react',
      'nextjs': 'nextjs',
      'vue': 'vue',
      'angular': 'angular',
      'svelte': 'svelte',
      'react-native': 'react-native',
      // ... other platforms
    } as any;
    
    return templates[platform] || 'vanilla';
  }

  private static getStackBlitzTemplate(platform: Platform): string {
    return `xaheen-${platform}-template`;
  }

  // Additional helper methods would be implemented here...
  private static generateVueApp(_context: PlaygroundContext): string {
    return `<!-- Vue app implementation -->`;
  }

  private static generateAngularApp(_context: PlaygroundContext): string {
    return `// Angular app implementation`;
  }

  private static generateSvelteApp(_context: PlaygroundContext): string {
    return `<!-- Svelte app implementation -->`;
  }

  private static generatePackageJson(context: PlaygroundContext): string {
    return JSON.stringify({
      name: `${context.spec.id}-playground`,
      version: '1.0.0',
      dependencies: this.generateDependencies(context.platform).reduce((acc, dep) => {
        acc[dep] = 'latest';
        return acc;
      }, {} as Record<string, string>)
    }, null, 2);
  }

  private static generateIndexHTML(context: PlaygroundContext): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${context.spec.name} Playground</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>`;
  }

  private static generatePlaygroundCSS(_context: PlaygroundContext): string {
    return `/* Playground styles */
.playground-app {
  font-family: Inter, sans-serif;
}

.playground-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.playground-header {
  text-align: center;
  margin-bottom: 3rem;
}

.component-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 2rem;
}`;
  }
}

export default PlaygroundGenerator;