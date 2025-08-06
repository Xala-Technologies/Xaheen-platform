/**
 * Universal Component Generator
 * Generates platform-specific components from universal specifications
 */

import { BaseComponentSpec, Platform } from '../core/component-specs';
import { UniversalTokens } from '../core/universal-tokens';

// =============================================================================
// TEMPLATE SYSTEM TYPES
// =============================================================================

export interface GenerationContext {
  readonly spec: BaseComponentSpec;
  readonly platform: Platform;
  readonly tokens: typeof UniversalTokens;
  readonly options: GenerationOptions;
}

export interface GenerationOptions {
  readonly includeTests?: boolean;
  readonly includeStories?: boolean;
  readonly includeDocs?: boolean;
  readonly customTokens?: Record<string, any>;
  readonly namespace?: string;
  readonly outputPath?: string;
}

export interface GeneratedFile {
  readonly path: string;
  readonly content: string;
  readonly type: 'component' | 'test' | 'story' | 'documentation' | 'types';
}

export interface PlatformTemplate {
  readonly platform: Platform;
  readonly fileExtension: string;
  readonly generateComponent: (context: GenerationContext) => GeneratedFile;
  readonly generateTest?: (context: GenerationContext) => GeneratedFile;
  readonly generateStory?: (context: GenerationContext) => GeneratedFile;
  readonly generateTypes?: (context: GenerationContext) => GeneratedFile;
}

// =============================================================================
// REACT TEMPLATE
// =============================================================================

export const ReactTemplate: PlatformTemplate = {
  platform: 'react',
  fileExtension: '.tsx',
  
  generateComponent: (context) => {
    const { spec, tokens } = context;
    
    // Generate variant classes from spec
    const generateVariantClasses = () => {
      if (!spec.variants) return '';
      
      return spec.variants.map(variant => `
        ${variant.name}: [
          ${Object.entries(variant.styling).map(([key, value]) => `'${value}'`).join(',\n          ')}
        ]`).join(',\n        ');
    };

    const content = `/**
 * ${spec.name} Component - React Implementation
 * Generated from universal ${spec.id} specification
 */

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// =============================================================================
// VARIANT DEFINITIONS
// =============================================================================

const ${spec.id}Variants = cva(
  // Base classes
  [
    'inline-flex items-center justify-center',
    'transition-colors focus-visible:outline-none',
    'disabled:pointer-events-none disabled:opacity-50'
  ],
  {
    variants: {
      ${spec.variants ? generateVariantClasses() : ''}
    },
    defaultVariants: {
      ${spec.variants?.[0] ? `variant: '${spec.variants[0].name}'` : ''}
    }
  }
);

// =============================================================================
// COMPONENT INTERFACE
// =============================================================================

export interface ${spec.name}Props
  extends React.${spec.category === 'atom' ? 'ButtonHTMLAttributes<HTMLButtonElement>' : 'HTMLAttributes<HTMLDivElement>'},
    VariantProps<typeof ${spec.id}Variants> {
  ${spec.props.map(prop => `
  /**
   * ${prop.description}
   */
  readonly ${prop.name}${prop.required ? '' : '?'}: ${prop.type};`).join('')}
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ${spec.name} = forwardRef<HTML${spec.category === 'atom' ? 'Button' : 'Div'}Element, ${spec.name}Props>(
  ({ className, ...props }, ref) => {
    return (
      <${spec.category === 'atom' ? 'button' : 'div'}
        className={cn(${spec.id}Variants({ className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

${spec.name}.displayName = '${spec.name}';

export default ${spec.name};`;

    return {
      path: `${spec.id}.tsx`,
      content,
      type: 'component'
    };
  },

  generateTest: (context) => {
    const { spec } = context;
    
    const content = `/**
 * ${spec.name} Component Tests
 */

import { render, screen } from '@testing-library/react';
import { ${spec.name} } from './${spec.id}';

describe('${spec.name}', () => {
  test('renders correctly', () => {
    render(<${spec.name}>Test</${spec.name}>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  test('applies correct variant classes', () => {
    ${spec.variants?.map(variant => `
    const { rerender } = render(<${spec.name} variant="${variant.name}">Test</${spec.name}>);
    expect(screen.getByText('Test')).toHaveClass('${Object.values(variant.styling)[0]}');
    `).join('\n')}
  });

  test('handles accessibility correctly', () => {
    render(<${spec.name} aria-label="Test button">Test</${spec.name}>);
    expect(screen.getByLabelText('Test button')).toBeInTheDocument();
  });
});`;

    return {
      path: `${spec.id}.test.tsx`,
      content,
      type: 'test'
    };
  },

  generateStory: (context) => {
    const { spec } = context;
    
    const content = `/**
 * ${spec.name} Storybook Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ${spec.name} } from './${spec.id}';

const meta: Meta<typeof ${spec.name}> = {
  title: '${spec.category === 'atom' ? 'Atoms' : spec.category === 'molecule' ? 'Molecules' : 'Organisms'}/${spec.name}',
  component: ${spec.name},
  parameters: {
    docs: {
      description: {
        component: '${spec.description}'
      }
    }
  },
  argTypes: {
    ${spec.props.map(prop => `
    ${prop.name}: {
      description: '${prop.description}',
      ${prop.validation ? `control: { type: '${prop.validation[0]?.type || 'text'}' },` : ''}
    }`).join(',\n    ')}
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default ${spec.name}',
    ${spec.props.filter(p => p.default !== undefined).map(p => `${p.name}: ${JSON.stringify(p.default)}`).join(',\n    ')}
  }
};

${spec.variants?.map((variant, index) => `
export const ${variant.name.charAt(0).toUpperCase() + variant.name.slice(1)}: Story = {
  args: {
    ...Default.args,
    variant: '${variant.name}'
  }
};`).join('\n')}`;

    return {
      path: `${spec.id}.stories.tsx`,
      content,
      type: 'story'
    };
  }
};

// =============================================================================
// REACT NATIVE TEMPLATE
// =============================================================================

export const ReactNativeTemplate: PlatformTemplate = {
  platform: 'react-native',
  fileExtension: '.tsx',
  
  generateComponent: (context) => {
    const { spec, tokens } = context;
    
    const content = `/**
 * ${spec.name} Component - React Native Implementation
 * Generated from universal ${spec.id} specification
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { UniversalTokens } from '../../core/universal-tokens';

// =============================================================================
// CONVERT TOKENS
// =============================================================================

const nativeTokens = UniversalTokens.converters.toReactNative(UniversalTokens.spacing);
const colors = UniversalTokens.colors;

// =============================================================================
// STYLES
// =============================================================================

const createStyles = () => StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: nativeTokens[6],
    paddingVertical: nativeTokens[3],
    borderRadius: 8,
    minHeight: 48, // WCAG compliant touch target
  } as ViewStyle,
  
  baseText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  } as TextStyle,
  
  ${spec.variants?.map(variant => `
  ${variant.name}: {
    backgroundColor: colors.primary[500], // This would be dynamic based on variant
  } as ViewStyle,
  
  ${variant.name}Text: {
    color: '#ffffff',
  } as TextStyle,`).join('\n  ')}
});

// =============================================================================
// COMPONENT INTERFACE
// =============================================================================

export interface ${spec.name}Props {
  ${spec.props.map(prop => `
  /**
   * ${prop.description}
   */
  readonly ${prop.name}${prop.required ? '' : '?'}: ${prop.type === '() => void' ? '() => void' : prop.type.replace('React.ReactNode', 'string')};`).join('')}
  readonly style?: ViewStyle;
  readonly textStyle?: TextStyle;
  readonly testID?: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ${spec.name}: React.FC<${spec.name}Props> = ({
  children,
  style,
  textStyle,
  testID,
  ...props
}) => {
  const styles = createStyles();
  
  return (
    <TouchableOpacity
      style={[styles.base, style]}
      testID={testID}
      activeOpacity={0.8}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.baseText, textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

export default ${spec.name};`;

    return {
      path: `${spec.name}.tsx`,
      content,
      type: 'component'
    };
  }
};

// =============================================================================
// VUE TEMPLATE
// =============================================================================

export const VueTemplate: PlatformTemplate = {
  platform: 'vue',
  fileExtension: '.vue',
  
  generateComponent: (context) => {
    const { spec } = context;
    
    const content = `<!--
${spec.name} Component - Vue 3 Implementation
Generated from universal ${spec.id} specification
-->

<template>
  <${spec.category === 'atom' ? 'button' : 'div'}
    :class="componentClasses"
    v-bind="$attrs"
    @click="handleClick"
  >
    <slot />
  </${spec.category === 'atom' ? 'button' : 'div'}>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface ${spec.name}Props {
  ${spec.props.map(prop => `
  /**
   * ${prop.description}
   */
  ${prop.name}${prop.required ? '' : '?'}: ${prop.type};`).join('')}
}

const props = withDefaults(defineProps<${spec.name}Props>(), {
  ${spec.props.filter(p => p.default !== undefined).map(p => `${p.name}: ${JSON.stringify(p.default)}`).join(',\n  ')}
});

// =============================================================================
// EMITS
// =============================================================================

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

const componentClasses = computed(() => {
  return [
    'inline-flex items-center justify-center',
    'transition-colors focus-visible:outline-none',
    'disabled:pointer-events-none disabled:opacity-50',
    // Add variant-specific classes based on props
  ].filter(Boolean);
});

// =============================================================================
// EVENT HANDLERS
// =============================================================================

const handleClick = (event: MouseEvent) => {
  emit('click', event);
};

// =============================================================================
// ATTRS INHERITANCE
// =============================================================================

defineOptions({
  inheritAttrs: false
});
</script>

<style scoped>
/* Component-specific styles */
</style>`;

    return {
      path: `${spec.name}.vue`,
      content,
      type: 'component'
    };
  }
};

// =============================================================================
// RADIX UI TEMPLATE
// =============================================================================

export const RadixTemplate: PlatformTemplate = {
  platform: 'radix',
  fileExtension: '.tsx',
  
  generateComponent: (context) => {
    const { spec } = context;
    
    const content = `/**
 * ${spec.name} Component - Radix UI Implementation
 * Generated from universal ${spec.id} specification
 */

import React, { forwardRef } from 'react';
import * as Slot from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const ${spec.id}Variants = cva(
  // Base classes with Radix patterns
  [
    'inline-flex items-center justify-center',
    'transition-colors focus-visible:outline-none',
    'disabled:pointer-events-none disabled:opacity-50'
  ],
  {
    variants: {
      ${spec.variants ? spec.variants.map(variant => `
      ${variant.name}: [${Object.values(variant.styling).map(s => `'${s}'`).join(', ')}]`).join(',') : ''}
    }
  }
);

export interface ${spec.name}Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof ${spec.id}Variants> {
  readonly asChild?: boolean;
}

export const ${spec.name} = forwardRef<HTMLButtonElement, ${spec.name}Props>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Slot : 'button';
    
    return (
      <Comp
        className={cn(${spec.id}Variants({ className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

${spec.name}.displayName = '${spec.name}';

export default ${spec.name};`;

    return {
      path: `${spec.id}.tsx`,
      content,
      type: 'component'
    };
  }
};

// =============================================================================
// HEADLESS UI TEMPLATE
// =============================================================================

export const HeadlessUITemplate: PlatformTemplate = {
  platform: 'headless-ui',
  fileExtension: '.tsx',
  
  generateComponent: (context) => {
    const { spec } = context;
    
    const content = `/**
 * ${spec.name} Component - Headless UI Implementation
 * Generated from universal ${spec.id} specification
 */

import React, { forwardRef } from 'react';
import { Button as HeadlessButton } from '@headlessui/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const ${spec.id}Variants = cva(
  // Base classes with Headless UI data attributes
  [
    'inline-flex items-center justify-center',
    'transition-colors focus:outline-none',
    'data-[disabled]:opacity-50 data-[focus]:ring-2'
  ],
  {
    variants: {
      ${spec.variants ? spec.variants.map(variant => `
      ${variant.name}: [${Object.values(variant.styling).map(s => `'${s}'`).join(', ')}]`).join(',') : ''}
    }
  }
);

export interface ${spec.name}Props
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>,
    VariantProps<typeof ${spec.id}Variants> {
  readonly disabled?: boolean;
}

export const ${spec.name} = forwardRef<HTMLButtonElement, ${spec.name}Props>(
  ({ className, disabled, ...props }, ref) => {
    return (
      <HeadlessButton
        className={cn(${spec.id}Variants({ className }))}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    );
  }
);

${spec.name}.displayName = '${spec.name}';

export default ${spec.name};`;

    return {
      path: `${spec.id}.tsx`,
      content,
      type: 'component'
    };
  }
};

// =============================================================================
// PLATFORM TEMPLATE REGISTRY
// =============================================================================

export const PlatformTemplates: Record<Platform, PlatformTemplate> = {
  react: ReactTemplate,
  'react-native': ReactNativeTemplate,
  vue: VueTemplate,
  angular: ReactTemplate, // Placeholder - would need Angular-specific template
  svelte: ReactTemplate,  // Placeholder - would need Svelte-specific template
  electron: ReactTemplate, // Uses React
  nextjs: ReactTemplate,   // Uses React
  nuxt: VueTemplate,      // Uses Vue
  sveltekit: ReactTemplate, // Uses Svelte (placeholder)
  expo: ReactNativeTemplate, // Uses React Native
  ionic: ReactTemplate,   // Placeholder - would need Ionic-specific template
  radix: RadixTemplate,   // Enhanced React with Radix UI
  'headless-ui': HeadlessUITemplate, // Enhanced React with Headless UI
  vanilla: ReactTemplate  // Placeholder - would need Web Components template
};

// =============================================================================
// COMPONENT GENERATOR
// =============================================================================

export class ComponentGenerator {
  /**
   * Generate component for specific platform
   */
  static generateComponent(
    spec: BaseComponentSpec,
    platform: Platform,
    options: GenerationOptions = {}
  ): GeneratedFile[] {
    const template = PlatformTemplates[platform];
    if (!template) {
      throw new Error(`Template not found for platform: ${platform}`);
    }

    const context: GenerationContext = {
      spec,
      platform,
      tokens: UniversalTokens,
      options
    };

    const files: GeneratedFile[] = [];

    // Generate main component
    files.push(template.generateComponent(context));

    // Generate optional files
    if (options.includeTests && template.generateTest) {
      files.push(template.generateTest(context));
    }

    if (options.includeStories && template.generateStory) {
      files.push(template.generateStory(context));
    }

    if (options.includeDocs && template.generateTypes) {
      files.push(template.generateTypes(context));
    }

    return files;
  }

  /**
   * Generate component for all supported platforms
   */
  static generateForAllPlatforms(
    spec: BaseComponentSpec,
    options: GenerationOptions = {}
  ): Record<Platform, GeneratedFile[]> {
    const result: Record<string, GeneratedFile[]> = {};

    for (const platform of spec.platforms) {
      try {
        result[platform] = this.generateComponent(spec, platform, options);
      } catch (error) {
        console.warn(`Failed to generate component for ${platform}:`, error);
        result[platform] = [];
      }
    }

    return result as Record<Platform, GeneratedFile[]>;
  }

  /**
   * Get available platforms for a component
   */
  static getAvailablePlatforms(spec: BaseComponentSpec): Platform[] {
    return spec.platforms.filter(platform => 
      PlatformTemplates[platform] !== undefined
    );
  }
}