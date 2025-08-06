/**
 * Specification Generator
 * Generates components from specifications for all platforms
 */

import { 
  ComponentSpecification, 
  SpecificationGenerationOptions,
  GeneratedComponent,
  GeneratedCode,
  GeneratedTests,
  GeneratedDocumentation,
  GeneratedStorybook,
  Platform
} from './types';

// =============================================================================
// SPECIFICATION GENERATOR CLASS
// =============================================================================

export class SpecificationGenerator {
  private generators: Map<Platform, PlatformGenerator> = new Map();

  constructor() {
    this.initializeGenerators();
  }

  /**
   * Generate component from specification
   */
  public async generate(
    spec: ComponentSpecification,
    options: SpecificationGenerationOptions
  ): Promise<GeneratedComponent> {
    // Validate platform support
    if (!this.isPlatformSupported(spec, options.platform)) {
      throw new Error(`Platform ${options.platform} is not supported by ${spec.name}`);
    }

    // Get platform generator
    const generator = this.generators.get(options.platform);
    if (!generator) {
      throw new Error(`No generator found for platform ${options.platform}`);
    }

    // Generate component code
    const code = await generator.generateCode(spec, options);

    // Generate optional artifacts
    const tests = options.testing ? await generator.generateTests(spec, options) : undefined;
    const documentation = options.documentation ? await generator.generateDocs(spec, options) : undefined;
    const storybook = options.storybook ? await generator.generateStorybook(spec, options) : undefined;

    return {
      specification: spec,
      code,
      tests,
      documentation,
      storybook
    };
  }

  /**
   * Generate multiple components
   */
  public async generateBatch(
    specs: ComponentSpecification[],
    options: SpecificationGenerationOptions
  ): Promise<Map<string, GeneratedComponent>> {
    const results = new Map<string, GeneratedComponent>();

    for (const spec of specs) {
      try {
        const generated = await this.generate(spec, options);
        results.set(spec.id, generated);
      } catch (error) {
        console.error(`Failed to generate ${spec.id}:`, error);
      }
    }

    return results;
  }

  /**
   * Generate for all platforms
   */
  public async generateAllPlatforms(
    spec: ComponentSpecification,
    baseOptions: Omit<SpecificationGenerationOptions, 'platform'>
  ): Promise<Map<Platform, GeneratedComponent>> {
    const results = new Map<Platform, GeneratedComponent>();
    const platforms = this.getSupportedPlatforms(spec);

    for (const platform of platforms) {
      try {
        const options: SpecificationGenerationOptions = {
          ...baseOptions,
          platform
        };
        const generated = await this.generate(spec, options);
        results.set(platform, generated);
      } catch (error) {
        console.error(`Failed to generate ${spec.id} for ${platform}:`, error);
      }
    }

    return results;
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private initializeGenerators(): void {
    // React Generator
    this.generators.set('react', new ReactGenerator());
    
    // Vue Generator
    this.generators.set('vue', new VueGenerator());
    
    // Angular Generator
    this.generators.set('angular', new AngularGenerator());
    
    // Svelte Generator
    this.generators.set('svelte', new SvelteGenerator());
    
    // React Native Generator
    this.generators.set('react-native', new ReactNativeGenerator());
    
    // Add more generators as needed...
  }

  private isPlatformSupported(spec: ComponentSpecification, platform: Platform): boolean {
    const platformKey = this.getPlatformKey(platform);
    return spec.platforms[platformKey]?.supported || false;
  }

  private getPlatformKey(platform: Platform): keyof ComponentSpecification['platforms'] {
    const platformMap: Record<Platform, keyof ComponentSpecification['platforms']> = {
      'react': 'react',
      'vue': 'vue',
      'angular': 'angular',
      'svelte': 'svelte',
      'react-native': 'reactNative',
      'electron': 'electron',
      'ionic': 'ionic',
      'headless-ui': 'headlessUI',
      'radix-ui': 'radixUI',
      'vanilla': 'vanilla',
      'web-components': 'webComponents'
    };
    
    return platformMap[platform];
  }

  private getSupportedPlatforms(spec: ComponentSpecification): Platform[] {
    const platforms: Platform[] = [];
    const platformMap: Record<keyof ComponentSpecification['platforms'], Platform> = {
      'react': 'react',
      'vue': 'vue',
      'angular': 'angular',
      'svelte': 'svelte',
      'reactNative': 'react-native',
      'electron': 'electron',
      'ionic': 'ionic',
      'headlessUI': 'headless-ui',
      'radixUI': 'radix-ui',
      'vanilla': 'vanilla',
      'webComponents': 'web-components'
    };

    for (const [key, status] of Object.entries(spec.platforms)) {
      if (status.supported) {
        const platform = platformMap[key as keyof ComponentSpecification['platforms']];
        if (platform) {
          platforms.push(platform);
        }
      }
    }

    return platforms;
  }
}

// =============================================================================
// PLATFORM GENERATOR INTERFACE
// =============================================================================

interface PlatformGenerator {
  generateCode(
    spec: ComponentSpecification,
    options: SpecificationGenerationOptions
  ): Promise<GeneratedCode>;

  generateTests(
    spec: ComponentSpecification,
    options: SpecificationGenerationOptions
  ): Promise<GeneratedTests>;

  generateDocs(
    spec: ComponentSpecification,
    options: SpecificationGenerationOptions
  ): Promise<GeneratedDocumentation>;

  generateStorybook(
    spec: ComponentSpecification,
    options: SpecificationGenerationOptions
  ): Promise<GeneratedStorybook>;
}

// =============================================================================
// REACT GENERATOR
// =============================================================================

class ReactGenerator implements PlatformGenerator {
  async generateCode(
    spec: ComponentSpecification,
    options: SpecificationGenerationOptions
  ): Promise<GeneratedCode> {
    const componentName = this.toPascalCase(spec.name);
    const props = this.generatePropsInterface(spec, options);
    const component = this.generateComponent(spec, options);
    const styles = options.styling === 'tailwind' ? '' : this.generateStyles(spec, options);
    
    return {
      component,
      types: props,
      styles,
      utils: '',
      index: this.generateIndex(spec, options)
    };
  }

  async generateTests(
    spec: ComponentSpecification,
    options: SpecificationGenerationOptions
  ): Promise<GeneratedTests> {
    const componentName = this.toPascalCase(spec.name);
    
    const unit = `import { render, screen } from '@testing-library/react';
import { ${componentName} } from './${spec.id}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName}>Test</${componentName}>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  ${spec.variants.map(variant => `
  it('renders ${variant.id} variant', () => {
    render(<${componentName} variant="${variant.id}">Test</${componentName}>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });`).join('\n')}
});`;

    const accessibility = `import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ${componentName} } from './${spec.id}';

expect.extend(toHaveNoViolations);

describe('${componentName} Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(<${componentName}>Test</${componentName}>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});`;

    return {
      unit,
      accessibility
    };
  }

  async generateDocs(
    spec: ComponentSpecification,
    options: SpecificationGenerationOptions
  ): Promise<GeneratedDocumentation> {
    const componentName = this.toPascalCase(spec.name);
    
    const readme = `# ${componentName}

${spec.description}

## Installation

\`\`\`bash
npm install @xaheen/design-system
\`\`\`

## Usage

\`\`\`tsx
import { ${componentName} } from '@xaheen/design-system/react';

export function App() {
  return (
    <${componentName} variant="primary">
      Click me
    </${componentName}>
  );
}
\`\`\`

## Props

${this.generatePropsTable(spec)}

## Variants

${spec.variants.map(variant => `### ${variant.name}

${variant.description}

**Usage:** ${variant.usage.when}

\`\`\`tsx
<${componentName} variant="${variant.id}">
  ${variant.usage.examples[0]}
</${componentName}>
\`\`\`
`).join('\n')}

## Accessibility

- WCAG ${spec.compliance.wcag.level} compliant
- Full keyboard support
- Screen reader friendly

## Browser Support

- Chrome ${spec.compliance.browser.chrome}
- Firefox ${spec.compliance.browser.firefox}
- Safari ${spec.compliance.browser.safari}
- Edge ${spec.compliance.browser.edge}
`;

    const api = this.generateApiDocs(spec);
    const examples = this.generateExamplesDocs(spec);

    return {
      readme,
      api,
      examples
    };
  }

  async generateStorybook(
    spec: ComponentSpecification,
    options: SpecificationGenerationOptions
  ): Promise<GeneratedStorybook> {
    const componentName = this.toPascalCase(spec.name);
    
    const stories = `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${spec.id}';

const meta = {
  title: '${spec.category}/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ${JSON.stringify(spec.variants.map(v => v.id))},
    },
  },
} satisfies Meta<typeof ${componentName}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Click me',
  },
};

${spec.variants.map(variant => `
export const ${this.toPascalCase(variant.id)}: Story = {
  args: {
    variant: '${variant.id}',
    children: '${variant.usage.examples[0]}',
  },
};`).join('\n')}
`;

    const docs = `import { Canvas, Meta, Story } from '@storybook/blocks';
import * as ${componentName}Stories from './${spec.id}.stories';

<Meta of={${componentName}Stories} />

# ${componentName}

${spec.description}

<Canvas of={${componentName}Stories.Default} />

## Usage

The ${componentName} component is used for ${spec.description.toLowerCase()}.

### When to use

${spec.variants[0].usage.when}

### Variants

${spec.variants.map(variant => `#### ${variant.name}

${variant.description}

<Canvas of={${componentName}Stories.${this.toPascalCase(variant.id)}} />
`).join('\n')}
`;

    const controls = JSON.stringify({
      variant: {
        control: 'select',
        options: spec.variants.map(v => v.id),
      },
      disabled: {
        control: 'boolean',
      },
      loading: {
        control: 'boolean',
      }
    }, null, 2);

    return {
      stories,
      docs,
      controls
    };
  }

  // Helper methods
  private toPascalCase(str: string): string {
    return str
      .split(/[-_ ]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  private generatePropsInterface(spec: ComponentSpecification, options: SpecificationGenerationOptions): string {
    const componentName = this.toPascalCase(spec.name);
    
    return `export interface ${componentName}Props {
${spec.props.map(prop => {
  const isOptional = !prop.required ? '?' : '';
  const type = this.getPropType(prop, 'react');
  return `  readonly ${prop.name}${isOptional}: ${type};`;
}).join('\n')}
}`;
  }

  private generateComponent(spec: ComponentSpecification, options: SpecificationGenerationOptions): string {
    const componentName = this.toPascalCase(spec.name);
    const hasChildren = spec.props.some(p => p.name === 'children');
    
    return `import React from 'react';
import { cn } from '../lib/utils';
${options.styling !== 'tailwind' ? `import styles from './${spec.id}.module.css';` : ''}

${this.generatePropsInterface(spec, options)}

export const ${componentName} = React.forwardRef<
  HTMLButtonElement,
  ${componentName}Props
>(({ 
  ${spec.props.map(prop => {
    const defaultValue = prop.defaultValue !== undefined ? ` = ${JSON.stringify(prop.defaultValue)}` : '';
    return `${prop.name}${defaultValue}`;
  }).join(',\n  ')},
  ...props
}, ref) => {
  ${spec.props.some(p => p.name === 'loading') ? `
  if (loading) {
    return (
      <button
        ref={ref}
        disabled
        className={cn(
          'h-12 px-6 rounded-lg font-medium transition-colors',
          'bg-gray-100 text-gray-400 cursor-not-allowed'
        )}
        {...props}
      >
        Loading...
      </button>
    );
  }` : ''}

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'h-12 px-6 rounded-lg font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500': variant === 'primary',
          'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'destructive',
          'border-2 border-gray-300 bg-transparent hover:bg-gray-50': variant === 'outline',
          'bg-transparent hover:bg-gray-100': variant === 'ghost',
          'text-blue-600 hover:text-blue-700 underline': variant === 'link',
          'opacity-50 cursor-not-allowed': disabled,
          'w-full': fullWidth,
          'h-10 px-4 text-sm': size === 'sm',
          'h-14 px-8 text-lg': size === 'lg',
          'h-16 px-10 text-xl': size === 'xl',
        }
      )}
      {...props}
    >
      {children}
    </button>
  );
});

${componentName}.displayName = '${componentName}';`;
  }

  private generateStyles(spec: ComponentSpecification, options: SpecificationGenerationOptions): string {
    if (options.styling === 'css-modules') {
      return `.button {
  height: 48px;
  padding: 0 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  outline: none;
}

.button:focus {
  box-shadow: 0 0 0 2px currentColor;
}

/* Variants */
${spec.variants.map(variant => `.${variant.id} {
  background-color: var(--color-${variant.visual.designTokens.backgroundColor});
  color: var(--color-${variant.visual.designTokens.color});
}

.${variant.id}:hover {
  background-color: var(--color-${variant.visual.designTokens.hoverBackgroundColor});
}`).join('\n\n')}
`;
    }
    
    return '';
  }

  private generateIndex(spec: ComponentSpecification, options: SpecificationGenerationOptions): string {
    const componentName = this.toPascalCase(spec.name);
    
    return `export { ${componentName} } from './${spec.id}';
export type { ${componentName}Props } from './${spec.id}';`;
  }

  private getPropType(prop: any, platform: string): string {
    // Handle platform-specific types
    if (prop.platformSpecific?.[platform]?.type) {
      return this.convertType(prop.platformSpecific[platform].type);
    }
    
    return this.convertType(prop.type);
  }

  private convertType(type: any): string {
    if (type.union) {
      return type.union.map((t: string) => `'${t}'`).join(' | ');
    }
    
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'function': '(...args: any[]) => void',
      'ReactNode': 'React.ReactNode',
    };
    
    return typeMap[type.base] || 'any';
  }

  private generatePropsTable(spec: ComponentSpecification): string {
    return `| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
${spec.props.map(prop => 
  `| ${prop.name} | \`${this.getPropType(prop, 'react')}\` | ${prop.defaultValue !== undefined ? `\`${JSON.stringify(prop.defaultValue)}\`` : '-'} | ${prop.required ? 'Yes' : 'No'} | ${prop.description} |`
).join('\n')}`;
  }

  private generateApiDocs(spec: ComponentSpecification): string {
    return `# ${this.toPascalCase(spec.name)} API

## Props

${spec.props.map(prop => `### ${prop.name}

- **Type:** \`${this.getPropType(prop, 'react')}\`
- **Required:** ${prop.required ? 'Yes' : 'No'}
- **Default:** ${prop.defaultValue !== undefined ? `\`${JSON.stringify(prop.defaultValue)}\`` : 'None'}

${prop.description}

${prop.examples ? `**Examples:**
\`\`\`tsx
${prop.examples.map(ex => `<${this.toPascalCase(spec.name)} ${prop.name}={${JSON.stringify(ex)}} />`).join('\n')}
\`\`\`` : ''}
`).join('\n')}`;
  }

  private generateExamplesDocs(spec: ComponentSpecification): string {
    return `# ${this.toPascalCase(spec.name)} Examples

${spec.examples.map(example => `## ${example.title}

${example.description}

\`\`\`tsx
${example.code}
\`\`\`

**Props used:**
${Object.entries(example.props).map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`).join('\n')}
`).join('\n\n')}`;
  }
}

// =============================================================================
// VUE GENERATOR
// =============================================================================

class VueGenerator implements PlatformGenerator {
  async generateCode(
    spec: ComponentSpecification,
    options: SpecificationGenerationOptions
  ): Promise<GeneratedCode> {
    const componentName = this.toPascalCase(spec.name);
    
    const component = `<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-label="ariaLabel"
    :class="buttonClasses"
    @click="handleClick"
  >
    <span v-if="loading">Loading...</span>
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';

const props = defineProps({
  variant: {
    type: String as PropType<${spec.props.find(p => p.name === 'variant')?.type.union?.map(v => `'${v}'`).join(' | ') || 'string'}>,
    default: '${spec.props.find(p => p.name === 'variant')?.defaultValue || 'primary'}',
  },
  size: {
    type: String as PropType<'sm' | 'md' | 'lg' | 'xl'>,
    default: 'md',
  },
  type: {
    type: String as PropType<'button' | 'submit' | 'reset'>,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
  ariaLabel: String,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};

const buttonClasses = computed(() => ({
  'btn': true,
  'btn-primary': props.variant === 'primary',
  'btn-secondary': props.variant === 'secondary',
  'btn-destructive': props.variant === 'destructive',
  'btn-outline': props.variant === 'outline',
  'btn-ghost': props.variant === 'ghost',
  'btn-link': props.variant === 'link',
  'btn-sm': props.size === 'sm',
  'btn-lg': props.size === 'lg',
  'btn-xl': props.size === 'xl',
  'btn-disabled': props.disabled,
  'btn-loading': props.loading,
  'btn-full': props.fullWidth,
}));
</script>

<style scoped>
.btn {
  @apply h-12 px-6 rounded-lg font-medium transition-colors;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500;
}

.btn-destructive {
  @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
}

.btn-disabled {
  @apply opacity-50 cursor-not-allowed;
}

.btn-full {
  @apply w-full;
}
</style>`;

    return {
      component,
      types: '',
      styles: '',
      utils: '',
      index: `export { default as ${componentName} } from './${componentName}.vue';`
    };
  }

  async generateTests(spec: ComponentSpecification, options: SpecificationGenerationOptions): Promise<GeneratedTests> {
    return {
      unit: '// Vue tests'
    };
  }

  async generateDocs(spec: ComponentSpecification, options: SpecificationGenerationOptions): Promise<GeneratedDocumentation> {
    return {
      readme: '# Vue Documentation',
      api: '// API docs',
      examples: '// Examples'
    };
  }

  async generateStorybook(spec: ComponentSpecification, options: SpecificationGenerationOptions): Promise<GeneratedStorybook> {
    return {
      stories: '// Vue stories',
      docs: '// Vue docs',
      controls: '{}'
    };
  }

  private toPascalCase(str: string): string {
    return str
      .split(/[-_ ]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}

// =============================================================================
// ANGULAR GENERATOR
// =============================================================================

class AngularGenerator implements PlatformGenerator {
  async generateCode(spec: ComponentSpecification, options: SpecificationGenerationOptions): Promise<GeneratedCode> {
    const componentName = this.toPascalCase(spec.name);
    
    const component = `import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'xaheen-${spec.id}',
  template: \`
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [attr.aria-label]="ariaLabel"
      [ngClass]="buttonClasses"
      (click)="handleClick($event)"
    >
      <span *ngIf="loading">Loading...</span>
      <ng-content *ngIf="!loading"></ng-content>
    </button>
  \`,
  styleUrls: ['./${spec.id}.component.css']
})
export class ${componentName}Component {
  @Input() variant: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() ariaLabel?: string;
  
  @Output() click = new EventEmitter<MouseEvent>();

  get buttonClasses() {
    return {
      'btn': true,
      'btn-primary': this.variant === 'primary',
      'btn-secondary': this.variant === 'secondary',
      'btn-destructive': this.variant === 'destructive',
      'btn-outline': this.variant === 'outline',
      'btn-ghost': this.variant === 'ghost',
      'btn-link': this.variant === 'link',
      'btn-sm': this.size === 'sm',
      'btn-lg': this.size === 'lg',
      'btn-xl': this.size === 'xl',
      'btn-disabled': this.disabled,
      'btn-loading': this.loading,
      'btn-full': this.fullWidth,
    };
  }

  handleClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.click.emit(event);
    }
  }
}`;

    return {
      component,
      types: '',
      styles: '',
      utils: '',
      index: `export * from './${spec.id}.component';`
    };
  }

  async generateTests(spec: ComponentSpecification, options: SpecificationGenerationOptions): Promise<GeneratedTests> {
    return {
      unit: '// Angular tests'
    };
  }

  async generateDocs(spec: ComponentSpecification, options: SpecificationGenerationOptions): Promise<GeneratedDocumentation> {
    return {
      readme: '# Angular Documentation',
      api: '// API docs',
      examples: '// Examples'
    };
  }

  async generateStorybook(spec: ComponentSpecification, options: SpecificationGenerationOptions): Promise<GeneratedStorybook> {
    return {
      stories: '// Angular stories',
      docs: '// Angular docs',
      controls: '{}'
    };
  }

  private toPascalCase(str: string): string {
    return str
      .split(/[-_ ]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}

// =============================================================================
// SVELTE GENERATOR
// =============================================================================

class SvelteGenerator implements PlatformGenerator {
  async generateCode(spec: ComponentSpecification, options: SpecificationGenerationOptions): Promise<GeneratedCode> {
    const component = `<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link' = 'primary';
  export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled = false;
  export let loading = false;
  export let fullWidth = false;
  export let ariaLabel: string | undefined = undefined;

  function handleClick(event: MouseEvent) {
    if (!disabled && !loading) {
      // Dispatch event
    }
  }
</script>

<button
  {type}
  {disabled}
  aria-label={ariaLabel}
  class="btn btn-{variant} btn-{size}"
  class:btn-disabled={disabled}
  class:btn-loading={loading}
  class:btn-full={fullWidth}
  on:click={handleClick}
>
  {#if loading}
    Loading...
  {:else}
    <slot />
  {/if}
</button>

<style>
  .btn {
    height: 48px;
    padding: 0 24px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s;
  }
</style>`;

    return {
      component,
      types: '',
      styles: '',
      utils: '',
      index: `export { default as ${this.toPascalCase(spec.name)} } from './${spec.id}.svelte';`
    };
  }

  async generateTests(spec: ComponentSpecification, options: SpecificationGenerationOptions): Promise<GeneratedTests> {
    return {
      unit: '// Svelte tests'
    };
  }

  async generateDocs(spec: ComponentSpecification, options: SpecificationGenerationOptions): Promise<GeneratedDocumentation> {
    return {
      readme: '# Svelte Documentation',
      api: '// API docs',
      examples: '// Examples'
    };
  }

  async generateStorybook(spec: ComponentSpecification, options: SpecificationGenerationOptions): Promise<GeneratedStorybook> {
    return {
      stories: '// Svelte stories',
      docs: '// Svelte docs',
      controls: '{}'
    };
  }

  private toPascalCase(str: string): string {
    return str
      .split(/[-_ ]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}

// =============================================================================
// REACT NATIVE GENERATOR
// =============================================================================

class ReactNativeGenerator implements PlatformGenerator {
  async generateCode(spec: ComponentSpecification, options: SpecificationGenerationOptions): Promise<GeneratedCode> {
    const componentName = this.toPascalCase(spec.name);
    
    const component = `import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';

interface ${componentName}Props {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'small' | 'medium' | 'large';
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  children: React.ReactNode;
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  variant = 'primary',
  size = 'medium',
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  accessibilityLabel,
  children,
}) => {
  const buttonStyles = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
  ];

  const textStyles = [
    styles.text,
    styles[\`\${variant}Text\`],
    styles[\`\${size}Text\`],
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#000'} />
      ) : (
        <Text style={textStyles}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  secondary: {
    backgroundColor: '#f3f4f6',
  },
  destructive: {
    backgroundColor: '#dc2626',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  link: {
    backgroundColor: 'transparent',
  },
  small: {
    height: 40,
    paddingHorizontal: 16,
  },
  medium: {
    height: 48,
  },
  large: {
    height: 56,
    paddingHorizontal: 32,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '500',
  },
  primaryText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: '#111827',
  },
  destructiveText: {
    color: '#ffffff',
  },
  outlineText: {
    color: '#111827',
  },
  ghostText: {
    color: '#111827',
  },
  linkText: {
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});`;

    return {
      component,
      types: '',
      styles: '',
      utils: '',
      index: `export { ${componentName} } from './${spec.id}';`
    };
  }

  async generateTests(spec: ComponentSpecification, options: SpecificationGenerationOptions): Promise<GeneratedTests> {
    return {
      unit: '// React Native tests'
    };
  }

  async generateDocs(spec: ComponentSpecification, options: SpecificationGenerationOptions): Promise<GeneratedDocumentation> {
    return {
      readme: '# React Native Documentation',
      api: '// API docs',
      examples: '// Examples'
    };
  }

  async generateStorybook(spec: ComponentSpecification, options: SpecificationGenerationOptions): Promise<GeneratedStorybook> {
    return {
      stories: '// React Native stories',
      docs: '// React Native docs',
      controls: '{}'
    };
  }

  private toPascalCase(str: string): string {
    return str
      .split(/[-_ ]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export const createSpecificationGenerator = (): SpecificationGenerator => {
  return new SpecificationGenerator();
};

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default SpecificationGenerator;