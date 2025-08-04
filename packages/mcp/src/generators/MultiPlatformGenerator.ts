/**
 * Multi-Platform Component Generator for Xala UI System v6.0
 * Supports React, Next.js, Vue, Angular, Svelte, Electron, React Native
 */

import type {
  ComponentConfig,
  GeneratedComponent,
  GeneratedFile,
  SupportedPlatform,
  PlatformConfig,
  PlatformTemplateConfig,
  ComponentTemplate
} from '../types/index';
import { LocalizationGenerator } from './LocalizationGenerator.js';
import { TestGenerator } from './TestGenerator.js';
import { StoryGenerator } from './StoryGenerator.js';
import { DocumentationGenerator } from './DocumentationGenerator.js';

// Helper to convert string array to ComponentTemplate array
const ALL_COMPONENTS: ComponentTemplate[] = [
  'navbar', 'modal', 'sidebar', 'header', 'form', 'card', 'dashboard',
  'data-table', 'virtual-list', 'command-palette', 'global-search',
  'theme-switcher', 'theme-selector', 'app-shell', 'layout',
  'auth-provider', 'theme-provider', 'error-boundary', 'notification-provider',
  'render-props', 'hoc-collection', 'component-factory',
  'performance-monitor', 'code-generator'
] as ComponentTemplate[];

const CORE_COMPONENTS: ComponentTemplate[] = [
  'navbar', 'modal', 'sidebar', 'header', 'form', 'card', 'dashboard',
  'data-table', 'virtual-list', 'command-palette', 'global-search',
  'theme-switcher', 'theme-selector', 'app-shell', 'layout',
  'auth-provider', 'theme-provider', 'error-boundary', 'notification-provider',
  'performance-monitor', 'code-generator'
] as ComponentTemplate[];

export class MultiPlatformGenerator {
  private localizationGenerator: LocalizationGenerator;
  private testGenerator: TestGenerator;
  private storyGenerator: StoryGenerator;
  private documentationGenerator: DocumentationGenerator;

  // Platform template configurations
  private platformConfigs: Record<SupportedPlatform, PlatformTemplateConfig> = {
    'react': {
      platform: 'react',
      availableComponents: ALL_COMPONENTS,
      templatePath: '/templates/react/',
      fileExtension: '.tsx',
      localizationPattern: 't()'
    },
    'nextjs': {
      platform: 'nextjs',
      availableComponents: ALL_COMPONENTS,
      templatePath: '/templates/nextjs/',
      fileExtension: '.tsx',
      localizationPattern: 't()'
    },
    'vue': {
      platform: 'vue',
      availableComponents: CORE_COMPONENTS,
      templatePath: '/templates/vue/',
      fileExtension: '.vue',
      localizationPattern: '{{ t() }}'
    },
    'angular': {
      platform: 'angular',
      availableComponents: CORE_COMPONENTS,
      templatePath: '/templates/angular/',
      fileExtension: '.component.ts',
      localizationPattern: '| translate'
    },
    'svelte': {
      platform: 'svelte',
      availableComponents: CORE_COMPONENTS,
      templatePath: '/templates/svelte/',
      fileExtension: '.svelte',
      localizationPattern: '{t()}'
    },
    'electron': {
      platform: 'electron',
      availableComponents: CORE_COMPONENTS,
      templatePath: '/templates/electron/',
      fileExtension: '.tsx',
      localizationPattern: '{t()}'
    },
    'react-native': {
      platform: 'react-native',
      availableComponents: CORE_COMPONENTS,
      templatePath: '/templates/react-native/',
      fileExtension: '.tsx',
      localizationPattern: 't()'
    }
  };

  constructor() {
    this.localizationGenerator = new LocalizationGenerator();
    this.testGenerator = new TestGenerator();
    this.storyGenerator = new StoryGenerator();
    this.documentationGenerator = new DocumentationGenerator();
  }

  /**
   * Generate component for specific platform with v5.0 semantic architecture
   */
  async generateMultiPlatformComponent(config: ComponentConfig): Promise<GeneratedComponent> {
    const platform = config.platform || 'react';
    const platformConfig = this.platformConfigs[platform];
    
    if (!platformConfig) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    // Validate component availability for platform
    const componentName = this.getComponentTemplateName(config);
    if (!platformConfig.availableComponents.includes(componentName as any)) {
      throw new Error(`Component ${componentName} not available for platform ${platform}`);
    }

    const componentCode = this.generatePlatformSpecificCode(config, platform);
    const typesCode = this.generatePlatformSpecificTypes(config, platform);
    const localizationKeys = this.localizationGenerator.generateKeys(config);
    const imports = this.generatePlatformSpecificImports(config, platform);
    const dependencies = this.generatePlatformSpecificDependencies(config, platform);
    
    const files = this.generatePlatformSpecificFiles(config, platform, {
      componentCode,
      typesCode,
      localizationKeys
    });

    return {
      componentCode,
      typesCode,
      localizationKeys,
      imports,
      dependencies,
      files,
      platform,
      architecture: config.platformConfig?.architecture || 'semantic'
    };
  }

  /**
   * Generate components for all platforms
   */
  async generateAllPlatforms(config: ComponentConfig): Promise<Record<SupportedPlatform, GeneratedComponent>> {
    const results: Record<SupportedPlatform, GeneratedComponent> = {} as any;
    
    for (const platform of Object.keys(this.platformConfigs) as SupportedPlatform[]) {
      const platformConfig = { ...config, platform };
      try {
        results[platform] = await this.generateMultiPlatformComponent(platformConfig);
      } catch (error) {
        console.warn(`Failed to generate for platform ${platform}:`, error);
      }
    }
    
    return results;
  }

  private generatePlatformSpecificCode(config: ComponentConfig, platform: SupportedPlatform): string {
    const componentName = this.toPascalCase(config.name);
    const templateName = this.getComponentTemplateName(config);
    
    switch (platform) {
      case 'react':
      case 'nextjs':
        return this.generateReactComponent(config, componentName, templateName);
      case 'vue':
        return this.generateVueComponent(config, componentName, templateName);
      case 'angular':
        return this.generateAngularComponent(config, componentName, templateName);
      case 'svelte':
        return this.generateSvelteComponent(config, componentName, templateName);
      case 'electron':
        return this.generateElectronComponent(config, componentName, templateName);
      case 'react-native':
        return this.generateReactNativeComponent(config, componentName, templateName);
      default:
        throw new Error(`Platform ${platform} not implemented`);
    }
  }

  private generateReactComponent(config: ComponentConfig, componentName: string, templateName: string): string {
    const isNextJS = config.platform === 'nextjs';
    const hasAppRouter = config.platformConfig?.features?.appRouter;
    
    return `/**
 * @fileoverview ${componentName} Component - v5.0 Semantic Architecture
 * @platform ${config.platform}
 * @architecture semantic
 * @compliance WCAG 2.2 AAA, Token-first
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Container, Section, Typography, cn } from '@xala-technologies/ui-system';
import { t } from '@xala-technologies/ui-system/i18n';

// v5.0 CVA Architecture - No hooks in presentational components
const ${templateName}Variants = cva(
  [
    'flex', 'items-center', 'justify-between',
    'w-full', 'border-b', 'bg-background'
  ],
  {
    variants: {
      variant: {
        default: ['border-border'],
        elevated: ['shadow-md', 'border-transparent'],
        transparent: ['bg-transparent', 'border-transparent']
      },
      size: {
        sm: ['h-12', 'px-4'],
        md: ['h-16', 'px-6'],
        lg: ['h-20', 'px-8']
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

interface ${componentName}Props extends VariantProps<typeof ${templateName}Variants> {
  readonly title?: string;
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly 'data-testid'?: string;
}

/**
 * ${componentName} - Pure presentational component
 * v5.0 Architecture: No hooks, static styling with CVA
 */
export const ${componentName}: React.FC<${componentName}Props> = ({
  title,
  children,
  variant,
  size,
  className,
  ...props
}) => {
  return (
    <Container
      className={cn(
        ${templateName}Variants({ variant, size }),
        className
      )}
      {...props}
    >
      <Section spacing="sm">
        {title && (
          <Heading level={2} variant="subtitle">
            {t('${templateName}.title', { title })}
          </Heading>
        )}
        {children}
      </Section>
    </Container>
  );
};

${componentName}.displayName = '${componentName}';
`;
  }

  private generateVueComponent(config: ComponentConfig, componentName: string, templateName: string): string {
    return `<template>
  <div 
    :class="containerClasses"
    :data-testid="testId"
  >
    <Section spacing="sm">
      <Heading v-if="title" :level="2" variant="subtitle">
        {{ t('${templateName}.title', { title }) }}
      </Heading>
      <slot />
    </Section>
  </div>
</template>

<script setup lang="ts">
/**
 * @fileoverview ${componentName} Component - v5.0 Semantic Architecture Vue 3
 * @platform vue
 * @architecture semantic
 * @compliance WCAG 2.2 AAA, Composition API
 */
import { computed } from 'vue';
import { Section, Heading } from '@xala-technologies/ui-system';
import { t } from '@xala-technologies/ui-system/i18n';

interface ${componentName}Props {
  readonly title?: string;
  readonly variant?: 'default' | 'elevated' | 'transparent';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly testId?: string;
}

const props = withDefaults(defineProps<${componentName}Props>(), {
  variant: 'default',
  size: 'md'
});

// v5.0 Architecture: Static class computation
const containerClasses = computed(() => [
  'flex', 'items-center', 'justify-between',
  'w-full', 'border-b', 'bg-background',
  {
    'border-border': props.variant === 'default',
    'shadow-md border-transparent': props.variant === 'elevated',
    'bg-transparent border-transparent': props.variant === 'transparent',
    'h-12 px-4': props.size === 'sm',
    'h-16 px-6': props.size === 'md',
    'h-20 px-8': props.size === 'lg'
  }
]);
</script>

<style scoped>
/* v5.0 Architecture: CSS-only styling */
</style>
`;
  }

  private generateAngularComponent(config: ComponentConfig, componentName: string, templateName: string): string {
    return `/**
 * @fileoverview ${componentName} Component - v5.0 Semantic Architecture Angular
 * @platform angular
 * @architecture semantic
 * @compliance WCAG 2.2 AAA, Standalone Components
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-${templateName}',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: \`
    <div 
      [class]="containerClasses"
      [attr.data-testid]="testId"
    >
      <div class="section section-sm">
        <h2 
          *ngIf="title" 
          class="heading heading-subtitle"
        >
          {{ '${templateName}.title' | translate: { title: title } }}
        </h2>
        <ng-content></ng-content>
      </div>
    </div>
  \`,
  styles: [\`
    /* v5.0 Architecture: CSS-only styling with design tokens */
    .container {
      @apply flex items-center justify-between w-full border-b bg-background;
    }
    
    .container-default {
      @apply border-border;
    }
    
    .container-elevated {
      @apply shadow-md border-transparent;
    }
    
    .container-transparent {
      @apply bg-transparent border-transparent;
    }
    
    .container-sm {
      @apply h-12 px-4;
    }
    
    .container-md {
      @apply h-16 px-6;
    }
    
    .container-lg {
      @apply h-20 px-8;
    }
    
    .section {
      @apply space-y-2;
    }
    
    .section-sm {
      @apply space-y-1;
    }
    
    .heading {
      @apply font-semibold;
    }
    
    .heading-subtitle {
      @apply text-lg;
    }
  \`]
})
export class ${componentName}Component {
  @Input() readonly title?: string;
  @Input() readonly variant: 'default' | 'elevated' | 'transparent' = 'default';
  @Input() readonly size: 'sm' | 'md' | 'lg' = 'md';
  @Input() readonly testId?: string;

  constructor(private translate: TranslateService) {}

  get containerClasses(): string {
    return [
      'container',
      \`container-\${this.variant}\`,
      \`container-\${this.size}\`
    ].join(' ');
  }
}
`;
  }

  private generateSvelteComponent(config: ComponentConfig, componentName: string, templateName: string): string {
    return `<!--
  @fileoverview ${componentName} Component - v5.0 Semantic Architecture Svelte
  @platform svelte
  @architecture semantic
  @compliance WCAG 2.2 AAA, SvelteKit Ready
-->

<script lang="ts">
  import { Section, Heading } from '@xala-technologies/ui-system';
  import { t } from '@xala-technologies/ui-system/i18n';
  
  export let title: string | undefined = undefined;
  export let variant: 'default' | 'elevated' | 'transparent' = 'default';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let testId: string | undefined = undefined;

  // v5.0 Architecture: Reactive class computation
  $: containerClasses = [
    'flex', 'items-center', 'justify-between',
    'w-full', 'border-b', 'bg-background',
    variant === 'default' ? 'border-border' : '',
    variant === 'elevated' ? 'shadow-md border-transparent' : '',
    variant === 'transparent' ? 'bg-transparent border-transparent' : '',
    size === 'sm' ? 'h-12 px-4' : '',
    size === 'md' ? 'h-16 px-6' : '',
    size === 'lg' ? 'h-20 px-8' : ''
  ].filter(Boolean).join(' ');
</script>

<div 
  class={containerClasses}
  data-testid={testId}
>
  <Section spacing="sm">
    {#if title}
      <Heading level={2} variant="subtitle">
        {t('${templateName}.title', { title })}
      </Heading>
    {/if}
    <slot />
  </Section>
</div>

<style>
  /* v5.0 Architecture: CSS-only styling */
</style>
`;
  }

  private generateElectronComponent(config: ComponentConfig, componentName: string, templateName: string): string {
    return `/**
 * @fileoverview ${componentName} Component - v5.0 Semantic Architecture Electron
 * @platform electron  
 * @architecture semantic
 * @compliance WCAG 2.2 AAA, Desktop Native
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Container, Section, Typography, cn } from '@xala-technologies/ui-system';
import { t } from '@xala-technologies/ui-system/i18n';

// Electron-specific styling with native window controls
const ${templateName}Variants = cva(
  [
    'flex', 'items-center', 'justify-between',
    'w-full', 'bg-background', 'select-none'
  ],
  {
    variants: {
      variant: {
        default: ['border-b', 'border-border'],
        titlebar: ['app-region-drag', 'h-8'],
        toolbar: ['border-b', 'border-border', 'px-4']
      },
      size: {
        sm: ['h-10', 'px-3'],
        md: ['h-12', 'px-4'],
        lg: ['h-16', 'px-6']
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

interface ${componentName}Props extends VariantProps<typeof ${templateName}Variants> {
  readonly title?: string;
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly showWindowControls?: boolean;
  readonly 'data-testid'?: string;
}

/**
 * ${componentName} - Electron desktop component
 * v5.0 Architecture: Native desktop integration
 */
export const ${componentName}: React.FC<${componentName}Props> = ({
  title,
  children,
  variant,
  size,
  showWindowControls = false,
  className,
  ...props
}) => {
  const handleMinimize = () => {
    window.electronAPI?.minimize();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximize();
  };

  const handleClose = () => {
    window.electronAPI?.close();
  };

  return (
    <Container
      className={cn(
        ${templateName}Variants({ variant, size }),
        className
      )}
      {...props}
    >
      <Section spacing="sm" className="flex-1">
        {title && (
          <Heading level={2} variant="subtitle" className="electron-title">
            {t('${templateName}.title', { title })}
          </Heading>
        )}
        {children}
      </Section>
      
      {showWindowControls && (
        <div className="window-controls app-region-no-drag">
          <button 
            onClick={handleMinimize}
            className="window-control minimize"
            aria-label={t('window.minimize')}
          >
            −
          </button>
          <button 
            onClick={handleMaximize}
            className="window-control maximize"
            aria-label={t('window.maximize')}
          >
            ◻
          </button>
          <button 
            onClick={handleClose}
            className="window-control close"
            aria-label={t('window.close')}
          >
            ✕
          </button>
        </div>
      )}
    </Container>
  );
};

${componentName}.displayName = '${componentName}';
`;
  }

  private generateReactNativeComponent(config: ComponentConfig, componentName: string, templateName: string): string {
    return `/**
 * @fileoverview ${componentName} Component - v5.0 Semantic Architecture React Native
 * @platform react-native
 * @architecture semantic
 * @compliance WCAG 2.2 AAA, Mobile Optimized
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '@xala-technologies/ui-system/i18n';

interface ${componentName}Props {
  readonly title?: string;
  readonly variant?: 'default' | 'elevated' | 'transparent';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly children?: React.ReactNode;
  readonly testID?: string;
}

/**
 * ${componentName} - React Native mobile component
 * v5.0 Architecture: No hooks, static styling with design tokens
 */
export const ${componentName}: React.FC<${componentName}Props> = ({
  title,
  variant = 'default',
  size = 'md',
  children,
  testID
}) => {
  const insets = useSafeAreaInsets();
  
  // v5.0 Architecture: Static style calculation
  const containerStyle: ViewStyle = {
    ...styles.container,
    ...styles[\`\${variant}Container\` as keyof typeof styles],
    ...styles[\`\${size}Container\` as keyof typeof styles],
    paddingTop: insets.top
  };

  const titleStyle: TextStyle = {
    ...styles.title,
    ...styles[\`\${size}Title\` as keyof typeof styles]
  };

  return (
    <View style={containerStyle} testID={testID}>
      <View style={styles.section}>
        {title && (
          <Text 
            style={titleStyle}
            accessibilityRole="header"
            testID={\`\${testID}-title\`}
          >
            {t('${templateName}.title', { title })}
          </Text>
        )}
        {children}
      </View>
    </View>
  );
};

// v5.0 Architecture: Design token-based styling
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#FFFFFF', // Design token: --background
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB' // Design token: --border
  },
  defaultContainer: {
    // Default variant styles
  },
  elevatedContainer: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomWidth: 0
  },
  transparentContainer: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0
  },
  smContainer: {
    height: 48,
    paddingHorizontal: 12
  },
  mdContainer: {
    height: 56,
    paddingHorizontal: 16
  },
  lgContainer: {
    height: 64,
    paddingHorizontal: 20
  },
  section: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827' // Design token: --foreground
  },
  smTitle: {
    fontSize: 16
  },
  mdTitle: {
    fontSize: 18
  },
  lgTitle: {
    fontSize: 20
  }
});
`;
  }

  private generatePlatformSpecificTypes(config: ComponentConfig, platform: SupportedPlatform): string {
    const componentName = this.toPascalCase(config.name);
    
    return `// types/${config.name.toLowerCase()}.types.ts
/**
 * Type definitions for ${componentName} - ${platform}
 * Generated by Xala UI System MCP v6.0
 */

export interface ${componentName}Props {
  readonly className?: string;
  readonly children?: React.ReactNode;
  readonly variant?: '${config.styling.variant}';
  readonly size?: '${config.size || 'md'}';
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly 'data-testid'?: string;
}

export interface ${componentName}Config {
  readonly theme: '${config.theme || 'enterprise'}';
  readonly locale: '${config.locale || 'en'}';
  readonly platform: '${platform}';
  readonly architecture: '${config.platformConfig?.architecture || 'semantic'}';
  readonly accessibility: {
    readonly level: '${config.accessibility.level}';
    readonly screenReader: ${config.accessibility.screenReader};
    readonly keyboardNavigation: ${config.accessibility.keyboardNavigation};
  };
}

export type ${componentName}Variant = '${config.styling.variant}';
export type ${componentName}Size = '${config.size || 'md'}';
export type ${componentName}Platform = '${platform}';`;
  }

  private generatePlatformSpecificImports(config: ComponentConfig, platform: SupportedPlatform): string[] {
    const baseImports = ['React'];
    const conditionalImports: string[] = [];

    switch (platform) {
      case 'react':
      case 'nextjs':
        conditionalImports.push('cva', 'type VariantProps', 'cn');
        break;
      case 'vue':
        conditionalImports.push('computed', 'defineProps', 'withDefaults');
        break;
      case 'angular':
        conditionalImports.push('Component', 'Input', 'CommonModule', 'TranslateModule');
        break;
      case 'svelte':
        // Svelte imports are handled in template
        break;
      case 'electron':
        conditionalImports.push('cva', 'type VariantProps', 'cn');
        break;
      case 'react-native':
        conditionalImports.push('View', 'Text', 'StyleSheet', 'Platform');
        break;
    }

    // Add UI system imports
    conditionalImports.push('@xala-technologies/ui-system');
    conditionalImports.push('@xala-technologies/ui-system/i18n');

    return [...new Set([...baseImports, ...conditionalImports])];
  }

  private generatePlatformSpecificDependencies(config: ComponentConfig, platform: SupportedPlatform): string[] {
    const baseDeps = [
      '@xala-technologies/ui-system',
      'react-i18next'
    ];

    const conditionalDeps: string[] = [];

    switch (platform) {
      case 'react':
        conditionalDeps.push('react', 'class-variance-authority');
        break;
      case 'nextjs':
        conditionalDeps.push('react', 'next', 'class-variance-authority');
        break;
      case 'vue':
        conditionalDeps.push('vue');
        break;
      case 'angular':
        conditionalDeps.push('@angular/core', '@angular/common', '@ngx-translate/core');
        break;
      case 'svelte':
        conditionalDeps.push('svelte');
        break;
      case 'electron':
        conditionalDeps.push('react', 'electron', 'class-variance-authority');
        break;
      case 'react-native':
        conditionalDeps.push('react', 'react-native', 'react-native-safe-area-context');
        break;
    }

    if (config.features.icons) {
      conditionalDeps.push('lucide-react');
    }

    if (config.features.animated) {
      conditionalDeps.push('framer-motion');
    }

    return [...new Set([...baseDeps, ...conditionalDeps])];
  }

  private generatePlatformSpecificFiles(
    config: ComponentConfig,
    platform: SupportedPlatform,
    content: { componentCode: string; typesCode: string; localizationKeys: Record<string, any> }
  ): GeneratedFile[] {
    const componentName = this.toPascalCase(config.name);
    const platformConfig = this.platformConfigs[platform];
    const extension = platformConfig.fileExtension;
    
    const files: GeneratedFile[] = [
      {
        path: `components/${config.category}/${componentName}${extension}`,
        content: content.componentCode,
        type: 'component'
      },
      {
        path: `types/${config.name.toLowerCase()}.types.ts`,
        content: content.typesCode,
        type: 'types'
      }
    ];

    // Add localization files for all supported locales
    const locales = ['en', 'nb-NO', 'fr', 'ar'];
    locales.forEach(locale => {
      files.push({
        path: `locales/${locale}/${config.name.toLowerCase()}.json`,
        content: JSON.stringify(content.localizationKeys[locale] || content.localizationKeys, null, 2),
        type: 'locale'
      });
    });

    return files;
  }

  private getComponentTemplateName(config: ComponentConfig): string {
    // Map category to template name
    const categoryMap: Record<string, string> = {
      'components': config.name.toLowerCase(),
      'data-components': config.name.toLowerCase(), 
      'theme-components': config.name.toLowerCase(),
      'layouts': config.name.toLowerCase(),
      'providers': config.name.toLowerCase(),
      'patterns': config.name.toLowerCase(),
      'tools': config.name.toLowerCase()
    };

    return categoryMap[config.category] || config.name.toLowerCase();
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '')
      .replace(/^./, str => str.toUpperCase());
  }

  /**
   * Get available components for a platform
   */
  getAvailableComponents(platform: SupportedPlatform): ComponentTemplate[] {
    return this.platformConfigs[platform]?.availableComponents || [];
  }

  /**
   * Get platform configuration
   */
  getPlatformConfig(platform: SupportedPlatform): PlatformTemplateConfig {
    const config = this.platformConfigs[platform];
    if (!config) {
      throw new Error(`Platform ${platform} not supported`);
    }
    return config;
  }

  /**
   * Validate if component is available for platform
   */
  isComponentAvailable(component: string, platform: SupportedPlatform): boolean {
    const platformConfig = this.platformConfigs[platform];
    return platformConfig?.availableComponents.includes(component as any) || false;
  }

  /**
   * Generate component from JSON specification
   */
  public async generateFromSpecification(
    spec: any,
    options: {
      platform?: SupportedPlatform;
      variant?: string;
      customProps?: Record<string, any>;
      includeTests?: boolean;
      includeStories?: boolean;
      includeDocs?: boolean;
    }
  ): Promise<{ files: GeneratedFile[] }> {
    const platform = options.platform || 'react';
    const config: ComponentConfig = {
      name: spec.metadata.name,
      category: spec.metadata.category || 'components',
      platform: platform,
      variant: options.variant || 'default',
      size: 'md',
      theme: 'enterprise',
      locale: 'nb-NO',
      features: {
        icons: false,
        animated: false,
        interactive: true,
        loading: false,
        error: false,
        validation: false
      },
      styling: {
        variant: (options.variant as 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary') || 'default',
        colorScheme: 'auto',
        borderRadius: 'md',
        shadow: 'sm',
        spacing: 'comfortable'
      },
      accessibility: {
        level: 'AAA' as const,
        screenReader: true,
        keyboardNavigation: true,
        highContrast: false,
        reducedMotion: false,
        focusManagement: true,
        ariaLabels: true
      },
      responsive: {
        breakpoints: ['mobile', 'tablet', 'desktop'],
        mobileFirst: true,
        fluidTypography: true,
        adaptiveLayout: true,
        touchOptimized: true
      }
    };

    // Generate the component
    const result = await this.generateMultiPlatformComponent(config);
    
    return {
      files: result.files
    };
  }
}