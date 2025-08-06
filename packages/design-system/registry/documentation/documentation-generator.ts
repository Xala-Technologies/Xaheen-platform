/**
 * Component Documentation Generator
 * Generates comprehensive documentation for components across all platforms
 */

import { BaseComponentSpec, Platform } from '../core/component-specs';
import { CompositionSpec } from '../core/component-composition';
import { UniversalTheme } from '../core/theme-system';

// =============================================================================
// DOCUMENTATION TYPES
// =============================================================================

export interface DocumentationContext {
  readonly spec: BaseComponentSpec;
  readonly platform?: Platform;
  readonly theme?: UniversalTheme;
  readonly options: DocumentationOptions;
}

export interface DocumentationOptions {
  readonly format: DocumentationFormat;
  readonly includeExamples?: boolean;
  readonly includePlayground?: boolean;
  readonly includeAPI?: boolean;
  readonly includeAccessibility?: boolean;
  readonly includeThemes?: boolean;
  readonly includePlatforms?: boolean;
  readonly includeComposition?: boolean;
  readonly outputPath?: string;
  readonly customSections?: DocumentationSection[];
  readonly locale?: 'en' | 'nb-NO' | 'fr' | 'ar';
}

export type DocumentationFormat = 
  | 'markdown' 
  | 'html' 
  | 'json' 
  | 'storybook'
  | 'docusaurus'
  | 'vitepress'
  | 'nextra'
  | 'gitbook';

export interface DocumentationSection {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly order: number;
  readonly collapsible?: boolean;
}

export interface GeneratedDocumentation {
  readonly path: string;
  readonly content: string;
  readonly format: DocumentationFormat;
  readonly metadata: DocumentationMetadata;
}

export interface DocumentationMetadata {
  readonly componentId: string;
  readonly componentName: string;
  readonly category: string;
  readonly platforms: Platform[];
  readonly version: string;
  readonly lastUpdated: string;
  readonly accessibility: AccessibilityInfo;
  readonly examples: ExampleInfo[];
}

export interface AccessibilityInfo {
  readonly wcagLevel: 'AA' | 'AAA';
  readonly features: string[];
  readonly keyboardNavigation: boolean;
  readonly screenReaderSupport: boolean;
  readonly colorContrastCompliant: boolean;
}

export interface ExampleInfo {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly platform: Platform;
  readonly code: string;
  readonly preview?: string;
}

// =============================================================================
// DOCUMENTATION GENERATOR
// =============================================================================

export class DocumentationGenerator {
  /**
   * Generate comprehensive documentation for a component
   */
  static generateComponentDocs(
    spec: BaseComponentSpec,
    options: DocumentationOptions
  ): GeneratedDocumentation {
    const context: DocumentationContext = { spec, options };
    
    switch (options.format) {
      case 'markdown':
        return this.generateMarkdownDocs(context);
      case 'html':
        return this.generateHTMLDocs(context);
      case 'json':
        return this.generateJSONDocs(context);
      case 'storybook':
        return this.generateStorybookDocs(context);
      case 'docusaurus':
        return this.generateDocusaurusDocs(context);
      case 'vitepress':
        return this.generateVitePressDocs(context);
      case 'nextra':
        return this.generateNextraDocs(context);
      case 'gitbook':
        return this.generateGitBookDocs(context);
      default:
        throw new Error(`Unsupported documentation format: ${options.format}`);
    }
  }

  /**
   * Generate documentation for multiple components
   */
  static generateMultipleComponentDocs(
    specs: BaseComponentSpec[],
    options: DocumentationOptions
  ): GeneratedDocumentation[] {
    return specs.map(spec => this.generateComponentDocs(spec, options));
  }

  /**
   * Generate platform-specific documentation
   */
  static generatePlatformDocs(
    spec: BaseComponentSpec,
    platform: Platform,
    options: DocumentationOptions
  ): GeneratedDocumentation {
    const context: DocumentationContext = { spec, platform, options };
    return this.generateComponentDocs(spec, options);
  }

  // =============================================================================
  // MARKDOWN DOCUMENTATION
  // =============================================================================

  private static generateMarkdownDocs(context: DocumentationContext): GeneratedDocumentation {
    const { spec, options } = context;
    const locale = options.locale || 'en';
    const texts = this.getLocalizedTexts(locale);

    let content = this.generateMarkdownHeader(spec, texts);

    if (options.includeAPI !== false) {
      content += this.generateAPISection(spec, texts);
    }

    if (options.includeExamples) {
      content += this.generateExamplesSection(spec, texts);
    }

    if (options.includeAccessibility) {
      content += this.generateAccessibilitySection(spec, texts);
    }

    if (options.includePlatforms) {
      content += this.generatePlatformsSection(spec, texts);
    }

    if (options.includeThemes && options.theme) {
      content += this.generateThemesSection(spec, options.theme, texts);
    }

    if (options.customSections) {
      content += this.generateCustomSections(options.customSections, texts);
    }

    return {
      path: `${spec.id}.md`,
      content,
      format: 'markdown',
      metadata: this.generateMetadata(spec)
    };
  }

  private static generateMarkdownHeader(spec: BaseComponentSpec, texts: any): string {
    return `# ${spec.name}

${spec.description}

## ${texts.overview}

The ${spec.name} component is a ${spec.category}-level component that provides ${spec.description.toLowerCase()}.

### ${texts.features}

${spec.accessibility.keyboardNavigation ? `- ✅ ${texts.keyboardNavigation}` : ''}
${spec.accessibility.screenReaderSupport ? `- ✅ ${texts.screenReaderSupport}` : ''}
${spec.accessibility.focusManagement ? `- ✅ ${texts.focusManagement}` : ''}
${spec.accessibility.colorContrastCompliant ? `- ✅ ${texts.colorCompliant}` : ''}
- ✅ ${texts.responsive}
- ✅ ${texts.themeable}
- ✅ ${texts.typeSafe}

### ${texts.platforms}

${spec.platforms.map(platform => `- ${platform}`).join('\n')}

---

`;
  }

  private static generateAPISection(spec: BaseComponentSpec, texts: any): string {
    let section = `## ${texts.api}

### ${texts.props}

| ${texts.prop} | ${texts.type} | ${texts.default} | ${texts.required} | ${texts.description} |
|---------------|---------------|------------------|-------------------|----------------------|
`;

    spec.props.forEach(prop => {
      const defaultValue = prop.default !== undefined ? `\`${JSON.stringify(prop.default)}\`` : '-';
      const required = prop.required ? '✅' : '❌';
      section += `| \`${prop.name}\` | \`${prop.type}\` | ${defaultValue} | ${required} | ${prop.description} |\n`;
    });

    if (spec.variants && spec.variants.length > 0) {
      section += `\n### ${texts.variants}\n\n`;
      spec.variants.forEach(variant => {
        section += `#### ${variant.name}\n\n${variant.description}\n\n`;
        section += `**${texts.styling}:**\n`;
        Object.entries(variant.styling).forEach(([key, value]) => {
          section += `- ${key}: \`${value}\`\n`;
        });
        section += '\n';
      });
    }

    if (spec.slots && spec.slots.length > 0) {
      section += `\n### ${texts.slots}\n\n`;
      section += `| ${texts.slot} | ${texts.required} | ${texts.description} |\n`;
      section += `|---------------|-------------------|----------------------|\n`;
      spec.slots.forEach(slot => {
        const required = slot.required ? '✅' : '❌';
        section += `| \`${slot.name}\` | ${required} | ${slot.description} |\n`;
      });
    }

    return section + '\n';
  }

  private static generateExamplesSection(spec: BaseComponentSpec, texts: any): string {
    let section = `## ${texts.examples}\n\n`;

    // Basic example
    section += `### ${texts.basicUsage}\n\n`;
    section += this.generateBasicExample(spec);

    // Variant examples
    if (spec.variants && spec.variants.length > 0) {
      section += `\n### ${texts.variants}\n\n`;
      spec.variants.forEach(variant => {
        section += `#### ${variant.name}\n\n`;
        section += this.generateVariantExample(spec, variant);
      });
    }

    // State examples
    if (spec.states && spec.states.length > 0) {
      section += `\n### ${texts.states}\n\n`;
      spec.states.forEach(state => {
        if (state.type === 'conditional') {
          section += `#### ${state.name}\n\n`;
          section += this.generateStateExample(spec, state);
        }
      });
    }

    return section;
  }

  private static generateAccessibilitySection(spec: BaseComponentSpec, texts: any): string {
    let section = `## ${texts.accessibility}\n\n`;

    section += `### ${texts.wcagCompliance}\n\n`;
    section += `This component meets **${spec.accessibility.wcagLevel}** standards.\n\n`;

    section += `### ${texts.supportedRoles}\n\n`;
    spec.accessibility.roles.forEach(role => {
      section += `- \`${role}\`\n`;
    });

    section += `\n### ${texts.ariaAttributes}\n\n`;
    spec.accessibility.ariaAttributes.forEach(attr => {
      section += `- \`${attr}\`\n`;
    });

    if (spec.accessibility.keyboardNavigation) {
      section += `\n### ${texts.keyboardNavigation}\n\n`;
      section += `${texts.keyboardSupported}\n\n`;
      
      // Add keyboard shortcuts if available
      if (spec.states) {
        const keyboardStates = spec.states.filter(state => 
          state.triggers.some(trigger => trigger.includes('key'))
        );
        
        if (keyboardStates.length > 0) {
          section += `#### ${texts.keyboardShortcuts}\n\n`;
          keyboardStates.forEach(state => {
            const keyTriggers = state.triggers.filter(t => t.includes('key'));
            keyTriggers.forEach(trigger => {
              const key = trigger.replace('keydown:', '').replace('keyup:', '');
              section += `- **${key.toUpperCase()}**: ${state.description}\n`;
            });
          });
        }
      }
    }

    return section + '\n';
  }

  private static generatePlatformsSection(spec: BaseComponentSpec, texts: any): string {
    let section = `## ${texts.platformSupport}\n\n`;

    section += `### ${texts.supportedPlatforms}\n\n`;
    section += `| ${texts.platform} | ${texts.status} | ${texts.notes} |\n`;
    section += `|-------------------|-----------------|----------------|\n`;

    spec.platforms.forEach(platform => {
      const status = '✅ ' + texts.supported;
      const notes = this.getPlatformNotes(platform, texts);
      section += `| ${platform} | ${status} | ${notes} |\n`;
    });

    section += `\n### ${texts.platformSpecific}\n\n`;
    
    // React-specific
    if (spec.platforms.includes('react')) {
      section += `#### React\n\n`;
      section += `\`\`\`tsx\nimport { ${spec.name} } from '@xaheen-ai/design-system/react';\n\n`;
      section += `<${spec.name}>${texts.content}</${spec.name}>\n\`\`\`\n\n`;
    }

    // Vue-specific  
    if (spec.platforms.includes('vue')) {
      section += `#### Vue\n\n`;
      section += `\`\`\`vue\n<template>\n  <${spec.name}>${texts.content}</${spec.name}>\n</template>\n\n`;
      section += `<script>\nimport { ${spec.name} } from '@xaheen-ai/design-system/vue';\n</script>\n\`\`\`\n\n`;
    }

    // Angular-specific
    if (spec.platforms.includes('angular')) {
      section += `#### Angular\n\n`;
      section += `\`\`\`html\n<xaheen-${spec.id}>${texts.content}</xaheen-${spec.id}>\n\`\`\`\n\n`;
    }

    return section;
  }

  private static generateThemesSection(spec: BaseComponentSpec, theme: UniversalTheme, texts: any): string {
    let section = `## ${texts.theming}\n\n`;

    section += `### ${texts.themeSupport}\n\n`;
    section += `${texts.themeDescription}\n\n`;

    section += `#### ${texts.cssVariables}\n\n`;
    section += `\`\`\`css\n/* ${texts.customTheme} */\n`;
    section += `:root {\n`;
    section += `  --${spec.id}-primary: ${theme.tokens.colors.primary[500]};\n`;
    section += `  --${spec.id}-secondary: ${theme.tokens.colors.secondary[500]};\n`;
    section += `  --${spec.id}-background: ${theme.tokens.colors.surface.background};\n`;
    section += `}\n\`\`\`\n\n`;

    if (spec.variants) {
      section += `#### ${texts.themeVariants}\n\n`;
      spec.variants.forEach(variant => {
        section += `**${variant.name}**: ${variant.description}\n\n`;
      });
    }

    return section;
  }

  private static generateCustomSections(sections: DocumentationSection[], texts: any): string {
    return sections
      .sort((a, b) => a.order - b.order)
      .map(section => `## ${section.title}\n\n${section.content}\n\n`)
      .join('');
  }

  // =============================================================================
  // HTML DOCUMENTATION
  // =============================================================================

  private static generateHTMLDocs(context: DocumentationContext): GeneratedDocumentation {
    const { spec, options } = context;
    const locale = options.locale || 'en';
    const texts = this.getLocalizedTexts(locale);

    const content = `<!DOCTYPE html>
<html lang="${locale}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${spec.name} - ${texts.componentDocs}</title>
    <link rel="stylesheet" href="./styles.css">
    <link rel="stylesheet" href="./prism.css">
</head>
<body>
    <header class="docs-header">
        <h1>${spec.name}</h1>
        <p class="docs-description">${spec.description}</p>
    </header>
    
    <nav class="docs-nav">
        <ul>
            <li><a href="#overview">${texts.overview}</a></li>
            <li><a href="#api">${texts.api}</a></li>
            <li><a href="#examples">${texts.examples}</a></li>
            <li><a href="#accessibility">${texts.accessibility}</a></li>
            <li><a href="#platforms">${texts.platforms}</a></li>
        </ul>
    </nav>
    
    <main class="docs-content">
        ${this.generateHTMLContent(spec, options, texts)}
    </main>
    
    <script src="./prism.js"></script>
    <script src="./docs.js"></script>
</body>
</html>`;

    return {
      path: `${spec.id}.html`,
      content,
      format: 'html',
      metadata: this.generateMetadata(spec)
    };
  }

  // =============================================================================
  // STORYBOOK DOCUMENTATION
  // =============================================================================

  private static generateStorybookDocs(context: DocumentationContext): GeneratedDocumentation {
    const { spec } = context;

    const content = `import type { Meta, StoryObj } from '@storybook/react';
import { ${spec.name} } from '../${spec.id}';

const meta: Meta<typeof ${spec.name}> = {
  title: '${spec.category === 'atom' ? 'Atoms' : spec.category === 'molecule' ? 'Molecules' : 'Organisms'}/${spec.name}',
  component: ${spec.name},
  parameters: {
    docs: {
      description: {
        component: \`
# ${spec.name}

${spec.description}

## Features

${spec.accessibility.keyboardNavigation ? '- ✅ Keyboard Navigation' : ''}
${spec.accessibility.screenReaderSupport ? '- ✅ Screen Reader Support' : ''}
${spec.accessibility.focusManagement ? '- ✅ Focus Management' : ''}
${spec.accessibility.colorContrastCompliant ? '- ✅ Color Contrast Compliant' : ''}

## Accessibility

This component meets **${spec.accessibility.wcagLevel}** WCAG standards and supports:

${spec.accessibility.roles.map(role => `- \`${role}\` role`).join('\n')}
${spec.accessibility.ariaAttributes.map(attr => `- \`${attr}\` attribute`).join('\n')}

## Platform Support

${spec.platforms.join(', ')}
        \`
      }
    }
  },
  argTypes: {
    ${spec.props.map(prop => `
    ${prop.name}: {
      description: '${prop.description}',
      control: { type: '${this.getStorybookControlType(prop.type)}' },
      ${prop.default !== undefined ? `defaultValue: ${JSON.stringify(prop.default)},` : ''}
      table: {
        type: { summary: '${prop.type}' },
        ${prop.default !== undefined ? `defaultValue: { summary: ${JSON.stringify(prop.default)} },` : ''}
      }
    }`).join(',')}
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ${spec.props.filter(p => p.default !== undefined).map(p => 
      `${p.name}: ${JSON.stringify(p.default)}`
    ).join(',\n    ')}
  }
};

${spec.variants?.map((variant, index) => `
export const ${this.toPascalCase(variant.name)}: Story = {
  args: {
    ...Default.args,
    variant: '${variant.name}'
  }
};`).join('\n')}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      ${spec.variants?.map(variant => `
      <div>
        <h3 className="text-lg font-semibold mb-2">${variant.name}</h3>
        <p className="text-sm text-gray-600 mb-4">${variant.description}</p>
        <${spec.name} variant="${variant.name}">
          ${variant.name} ${spec.name}
        </${spec.name}>
      </div>`).join('\n      ')}
    </div>
  )
};`;

    return {
      path: `${spec.id}.stories.tsx`,
      content,
      format: 'storybook',
      metadata: this.generateMetadata(spec)
    };
  }

  // =============================================================================
  // JSON DOCUMENTATION
  // =============================================================================

  private static generateJSONDocs(context: DocumentationContext): GeneratedDocumentation {
    const { spec, options } = context;

    const jsonDoc = {
      component: {
        id: spec.id,
        name: spec.name,
        description: spec.description,
        category: spec.category,
        platforms: spec.platforms
      },
      api: {
        props: spec.props,
        variants: spec.variants || [],
        slots: spec.slots || [],
        states: spec.states || []
      },
      accessibility: spec.accessibility,
      styling: spec.styling,
      examples: this.generateJSONExamples(spec),
      metadata: this.generateMetadata(spec)
    };

    return {
      path: `${spec.id}.json`,
      content: JSON.stringify(jsonDoc, null, 2),
      format: 'json',
      metadata: this.generateMetadata(spec)
    };
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private static generateBasicExample(spec: BaseComponentSpec): string {
    return `\`\`\`tsx
import { ${spec.name} } from '@xaheen-ai/design-system';

export function BasicExample() {
  return (
    <${spec.name}>
      ${spec.category === 'atom' ? 'Click me' : 'Content goes here'}
    </${spec.name}>
  );
}
\`\`\`\n\n`;
  }

  private static generateVariantExample(spec: BaseComponentSpec, variant: any): string {
    return `\`\`\`tsx
<${spec.name} variant="${variant.name}">
  ${variant.name} ${spec.name}
</${spec.name}>
\`\`\`\n\n`;
  }

  private static generateStateExample(spec: BaseComponentSpec, state: any): string {
    const propName = state.triggers[0].replace('props.', '');
    return `\`\`\`tsx
<${spec.name} ${propName}>
  ${state.description}
</${spec.name}>
\`\`\`\n\n`;
  }

  private static generateHTMLContent(spec: BaseComponentSpec, options: DocumentationOptions, texts: any): string {
    let content = `<section id="overview" class="docs-section">
      <h2>${texts.overview}</h2>
      <p>${spec.description}</p>
    </section>`;

    if (options.includeAPI !== false) {
      content += this.generateHTMLAPISection(spec, texts);
    }

    if (options.includeExamples) {
      content += this.generateHTMLExamplesSection(spec, texts);
    }

    return content;
  }

  private static generateHTMLAPISection(spec: BaseComponentSpec, texts: any): string {
    return `
    <section id="api" class="docs-section">
      <h2>${texts.api}</h2>
      <table class="docs-table">
        <thead>
          <tr>
            <th>${texts.prop}</th>
            <th>${texts.type}</th>
            <th>${texts.default}</th>
            <th>${texts.required}</th>
            <th>${texts.description}</th>
          </tr>
        </thead>
        <tbody>
          ${spec.props.map(prop => `
          <tr>
            <td><code>${prop.name}</code></td>
            <td><code>${prop.type}</code></td>
            <td>${prop.default !== undefined ? `<code>${JSON.stringify(prop.default)}</code>` : '-'}</td>
            <td>${prop.required ? '✅' : '❌'}</td>
            <td>${prop.description}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </section>`;
  }

  private static generateHTMLExamplesSection(spec: BaseComponentSpec, texts: any): string {
    return `
    <section id="examples" class="docs-section">
      <h2>${texts.examples}</h2>
      <div class="example-container">
        <pre><code class="language-tsx">${this.escapeHtml(this.generateBasicExample(spec))}</code></pre>
      </div>
    </section>`;
  }

  private static generateJSONExamples(spec: BaseComponentSpec): ExampleInfo[] {
    const examples: ExampleInfo[] = [];

    // Basic example
    examples.push({
      id: 'basic',
      title: 'Basic Usage',
      description: 'Basic usage of the component',
      platform: 'react',
      code: this.generateBasicExample(spec).replace(/```tsx\n|```\n/g, '').trim()
    });

    // Variant examples
    if (spec.variants) {
      spec.variants.forEach(variant => {
        examples.push({
          id: `variant-${variant.name}`,
          title: `${variant.name} Variant`,
          description: variant.description,
          platform: 'react',
          code: this.generateVariantExample(spec, variant).replace(/```tsx\n|```\n/g, '').trim()
        });
      });
    }

    return examples;
  }

  private static generateMetadata(spec: BaseComponentSpec): DocumentationMetadata {
    return {
      componentId: spec.id,
      componentName: spec.name,
      category: spec.category,
      platforms: spec.platforms,
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      accessibility: {
        wcagLevel: spec.accessibility.wcagLevel,
        features: this.getAccessibilityFeatures(spec),
        keyboardNavigation: spec.accessibility.keyboardNavigation,
        screenReaderSupport: spec.accessibility.screenReaderSupport,
        colorContrastCompliant: spec.accessibility.colorContrastCompliant
      },
      examples: this.generateJSONExamples(spec)
    };
  }

  private static getAccessibilityFeatures(spec: BaseComponentSpec): string[] {
    const features = [];
    if (spec.accessibility.keyboardNavigation) features.push('Keyboard Navigation');
    if (spec.accessibility.screenReaderSupport) features.push('Screen Reader Support');
    if (spec.accessibility.focusManagement) features.push('Focus Management');
    if (spec.accessibility.colorContrastCompliant) features.push('Color Contrast Compliant');
    return features;
  }

  private static getStorybookControlType(type: string): string {
    if (type.includes('boolean')) return 'boolean';
    if (type.includes('number')) return 'number';
    if (type.includes('|')) return 'select';
    return 'text';
  }

  private static getPlatformNotes(platform: Platform, texts: any): string {
    const notes: Record<Platform, string> = {
      'react': texts.reactNative,
      'vue': texts.vueNative,
      'angular': texts.angularNative,
      'svelte': texts.svelteNative,
      'react-native': texts.mobileOptimized,
      'ionic': texts.hybridApps,
      'electron': texts.desktopApps,
      'nextjs': texts.ssrSupport,
      'nuxt': texts.ssrSupport,
      'sveltekit': texts.ssrSupport,
      'expo': texts.mobileOptimized,
      'radix': texts.headlessUI,
      'headless-ui': texts.headlessUI,
      'vanilla': texts.noFramework
    };
    
    return notes[platform] || texts.fullSupport;
  }

  private static getLocalizedTexts(locale: string): any {
    const texts = {
      en: {
        overview: 'Overview',
        features: 'Features',
        platforms: 'Supported Platforms',
        api: 'API Reference',
        props: 'Prop',
        type: 'Type',
        default: 'Default',
        required: 'Required',
        description: 'Description',
        variants: 'Variants',
        slots: 'Slots',
        slot: 'Slot',
        states: 'States',
        examples: 'Examples',
        basicUsage: 'Basic Usage',
        accessibility: 'Accessibility',
        wcagCompliance: 'WCAG Compliance',
        supportedRoles: 'Supported Roles',
        ariaAttributes: 'ARIA Attributes',
        keyboardNavigation: 'Keyboard Navigation',
        keyboardSupported: 'This component supports full keyboard navigation.',
        keyboardShortcuts: 'Keyboard Shortcuts',
        platformSupport: 'Platform Support',
        supportedPlatforms: 'Supported Platforms',
        platform: 'Platform',
        status: 'Status',
        notes: 'Notes',
        supported: 'Supported',
        platformSpecific: 'Platform-Specific Examples',
        theming: 'Theming',
        themeSupport: 'Theme Support',
        themeDescription: 'This component supports full theming with CSS variables.',
        cssVariables: 'CSS Variables',
        customTheme: 'Custom theme variables',
        themeVariants: 'Theme Variants',
        styling: 'Styling',
        content: 'Content',
        componentDocs: 'Component Documentation',
        // Platform notes
        reactNative: 'Native React support',
        vueNative: 'Native Vue support',
        angularNative: 'Native Angular support',
        svelteNative: 'Native Svelte support',
        mobileOptimized: 'Mobile optimized',
        hybridApps: 'Hybrid app support',
        desktopApps: 'Desktop app support',
        ssrSupport: 'SSR/SSG support',
        headlessUI: 'Headless UI pattern',
        noFramework: 'No framework required',
        fullSupport: 'Full support',
        // Accessibility features
        screenReaderSupport: 'Screen Reader Support',
        focusManagement: 'Focus Management',
        colorCompliant: 'Color Contrast Compliant',
        responsive: 'Responsive Design',
        themeable: 'Themeable',
        typeSafe: 'Type Safe'
      },
      'nb-NO': {
        overview: 'Oversikt',
        features: 'Funksjoner',
        platforms: 'Støttede Plattformer',
        api: 'API Referanse',
        // ... Norwegian translations
      }
      // Other locales would be added here
    };

    return texts[locale] || texts.en;
  }

  private static toPascalCase(str: string): string {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Additional format generators would be implemented here
  private static generateDocusaurusDocs(context: DocumentationContext): GeneratedDocumentation {
    // Implementation for Docusaurus format
    return this.generateMarkdownDocs(context);
  }

  private static generateVitePressDocs(context: DocumentationContext): GeneratedDocumentation {
    // Implementation for VitePress format
    return this.generateMarkdownDocs(context);
  }

  private static generateNextraDocs(context: DocumentationContext): GeneratedDocumentation {
    // Implementation for Nextra format
    return this.generateMarkdownDocs(context);
  }

  private static generateGitBookDocs(context: DocumentationContext): GeneratedDocumentation {
    // Implementation for GitBook format
    return this.generateMarkdownDocs(context);
  }
}