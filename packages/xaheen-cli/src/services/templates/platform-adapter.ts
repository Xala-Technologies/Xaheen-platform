/**
 * Multi-Platform Template Adapter
 * 
 * Adapts templates and components for different frontend platforms
 * while maintaining semantic UI principles and Norwegian compliance.
 * 
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import { consola } from 'consola';
import type { NSMClassification } from "../compliance/nsm-classifier";

export type SupportedPlatform = 
  | 'react'
  | 'vue'
  | 'angular'
  | 'svelte'
  | 'react-native'
  | 'flutter'
  | 'nextjs'
  | 'nuxtjs'
  | 'electron'
  | 'capacitor';

export interface PlatformConfig {
  readonly platform: SupportedPlatform;
  readonly fileExtension: string;
  readonly componentSyntax: ComponentSyntax;
  readonly styleSystem: StyleSystem;
  readonly stateManagement: StateManagement;
  readonly routingSystem: RoutingSystem;
  readonly buildSystem: BuildSystem;
  readonly packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
}

export interface ComponentSyntax {
  readonly componentDefinition: string;
  readonly propsInterface: string;
  readonly stateHook: string;
  readonly effectHook: string;
  readonly eventHandler: string;
  readonly conditionalRendering: string;
  readonly listRendering: string;
  readonly templateVariables: string;
}

export interface StyleSystem {
  readonly name: string;
  readonly classAttribute: string;
  readonly inlineStyles: string;
  readonly cssModules: boolean;
  readonly styledComponents: boolean;
  readonly designTokens: boolean;
}

export interface StateManagement {
  readonly local: string;
  readonly global: string[];
  readonly form: string[];
}

export interface RoutingSystem {
  readonly name: string;
  readonly linkComponent: string;
  readonly navigationHook: string;
  readonly routeParams: string;
}

export interface BuildSystem {
  readonly name: string;
  readonly configFile: string;
  readonly hotReload: boolean;
  readonly bundleSplitting: boolean;
}

export interface TemplateAdaptation {
  readonly originalTemplate: string;
  readonly adaptedTemplate: string;
  readonly adaptedImports: string;
  readonly adaptedTypes: string;
  readonly adaptedStyles: string;
  readonly platformSpecificCode: string;
  readonly metadata: AdaptationMetadata;
}

export interface AdaptationMetadata {
  readonly platform: SupportedPlatform;
  readonly componentCount: number;
  readonly adaptationComplexity: 'simple' | 'moderate' | 'complex';
  readonly preservedFeatures: string[];
  readonly adaptedFeatures: string[];
  readonly limitations: string[];
  readonly recommendations: string[];
}

export class PlatformAdapter {
  private platformConfigs: Map<SupportedPlatform, PlatformConfig> = new Map();

  constructor() {
    this.initializePlatformConfigs();
  }

  /**
   * Adapt template for target platform
   */
  adaptTemplate(
    template: string,
    sourcePlatform: SupportedPlatform,
    targetPlatform: SupportedPlatform,
    options: {
      componentName: string;
      nsmClassification: NSMClassification;
      preserveAccessibility: boolean;
      norwegianCompliance: boolean;
    }
  ): TemplateAdaptation {
    consola.info(`Adapting template from ${sourcePlatform} to ${targetPlatform}`);

    const sourceConfig = this.platformConfigs.get(sourcePlatform);
    const targetConfig = this.platformConfigs.get(targetPlatform);

    if (!sourceConfig || !targetConfig) {
      throw new Error(`Unsupported platform combination: ${sourcePlatform} -> ${targetPlatform}`);
    }

    // Parse original template
    const parsed = this.parseTemplate(template, sourceConfig);
    
    // Adapt to target platform
    const adaptedTemplate = this.adaptComponentStructure(parsed, targetConfig, options);
    const adaptedImports = this.adaptImports(parsed.imports, targetConfig);
    const adaptedTypes = this.adaptTypes(parsed.types, targetConfig);
    const adaptedStyles = this.adaptStyles(parsed.styles, targetConfig);
    const platformSpecificCode = this.generatePlatformSpecificCode(targetConfig, options);

    // Generate metadata
    const metadata = this.generateAdaptationMetadata(
      sourcePlatform,
      targetPlatform,
      parsed,
      adaptedTemplate
    );

    return {
      originalTemplate: template,
      adaptedTemplate,
      adaptedImports,
      adaptedTypes,
      adaptedStyles,
      platformSpecificCode,
      metadata
    };
  }

  /**
   * Get supported platforms
   */
  getSupportedPlatforms(): SupportedPlatform[] {
    return Array.from(this.platformConfigs.keys());
  }

  /**
   * Get platform configuration
   */
  getPlatformConfig(platform: SupportedPlatform): PlatformConfig | null {
    return this.platformConfigs.get(platform) || null;
  }

  /**
   * Check platform compatibility
   */
  isPlatformCompatible(
    sourcePlatform: SupportedPlatform,
    targetPlatform: SupportedPlatform
  ): boolean {
    const compatibility = this.getCompatibilityMatrix();
    return compatibility[sourcePlatform]?.includes(targetPlatform) || false;
  }

  /**
   * Get adaptation recommendations
   */
  getAdaptationRecommendations(
    sourcePlatform: SupportedPlatform,
    targetPlatform: SupportedPlatform
  ): string[] {
    const sourceConfig = this.platformConfigs.get(sourcePlatform);
    const targetConfig = this.platformConfigs.get(targetPlatform);

    if (!sourceConfig || !targetConfig) return [];

    const recommendations: string[] = [];

    // Style system recommendations
    if (sourceConfig.styleSystem.name !== targetConfig.styleSystem.name) {
      recommendations.push(`Consider migrating styles from ${sourceConfig.styleSystem.name} to ${targetConfig.styleSystem.name}`);
    }

    // State management recommendations
    if (sourceConfig.stateManagement.local !== targetConfig.stateManagement.local) {
      recommendations.push(`Adapt state management from ${sourceConfig.stateManagement.local} to ${targetConfig.stateManagement.local}`);
    }

    // Routing recommendations
    if (sourceConfig.routingSystem.name !== targetConfig.routingSystem.name) {
      recommendations.push(`Update routing from ${sourceConfig.routingSystem.name} to ${targetConfig.routingSystem.name}`);
    }

    // Platform-specific recommendations
    switch (targetPlatform) {
      case 'react-native':
        recommendations.push('Replace HTML elements with React Native components');
        recommendations.push('Adapt styling for mobile-first design');
        break;
      case 'vue':
        recommendations.push('Convert React hooks to Vue Composition API');
        recommendations.push('Update template syntax to Vue directives');
        break;
      case 'angular':
        recommendations.push('Convert to Angular component structure');
        recommendations.push('Implement Angular services for state management');
        break;
    }

    return recommendations;
  }

  /**
   * Parse template structure
   */
  private parseTemplate(template: string, config: PlatformConfig) {
    // This is a simplified parser - in reality, you'd use proper AST parsing
    return {
      imports: this.extractImports(template),
      types: this.extractTypes(template),
      component: this.extractComponent(template),
      styles: this.extractStyles(template),
      hooks: this.extractHooks(template),
      events: this.extractEvents(template)
    };
  }

  /**
   * Adapt component structure for target platform
   */
  private adaptComponentStructure(
    parsed: any,
    targetConfig: PlatformConfig,
    options: any
  ): string {
    switch (targetConfig.platform) {
      case 'vue':
        return this.adaptToVue(parsed, options);
      case 'angular':
        return this.adaptToAngular(parsed, options);
      case 'svelte':
        return this.adaptToSvelte(parsed, options);
      case 'react-native':
        return this.adaptToReactNative(parsed, options);
      case 'flutter':
        return this.adaptToFlutter(parsed, options);
      default:
        return this.adaptToReact(parsed, options);
    }
  }

  /**
   * Adapt to Vue.js
   */
  private adaptToVue(parsed: any, options: any): string {
    return `<template>
  <div 
    class="semantic-component"
    :data-testid="testId"
    :data-nsm-classification="nsmClassification"
  >
    <UIContainer>
      <UIStack direction="vertical" gap="lg">
        <UIText variant="h2">{{ title }}</UIText>
        <!-- Component content adapted for Vue -->
        <slot />
      </UIStack>
    </UIContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { UIContainer, UIStack, UIText } from '@xala-technologies/ui-system-vue'

export interface ${options.componentName}Props {
  readonly testId?: string
  readonly title?: string
  readonly nsmClassification?: '${options.nsmClassification}'
}

const props = withDefaults(defineProps<${options.componentName}Props>(), {
  nsmClassification: '${options.nsmClassification}',
  title: '${options.componentName}'
})

// Reactive state
const isLoading = ref(false)
const data = ref([])

// Computed properties
const computedTitle = computed(() => props.title || '${options.componentName}')

// Lifecycle
onMounted(() => {
  // Component initialization
})

// Methods
const handleAction = () => {
  // Action handler
}
</script>

<style scoped>
.semantic-component {
  /* Component styles */
}
</style>`;
  }

  /**
   * Adapt to Angular
   */
  private adaptToAngular(parsed: any, options: any): string {
    return `import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ${options.componentName}Props {
  readonly testId?: string;
  readonly title?: string;
  readonly nsmClassification?: '${options.nsmClassification}';
}

@Component({
  selector: 'app-${options.componentName.toLowerCase()}',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div 
      class="semantic-component"
      [attr.data-testid]="testId"
      [attr.data-nsm-classification]="nsmClassification"
    >
      <ui-container>
        <ui-stack direction="vertical" gap="lg">
          <ui-text variant="h2">{{ title }}</ui-text>
          <!-- Component content adapted for Angular -->
          <ng-content></ng-content>
        </ui-stack>
      </ui-container>
    </div>
  \`,
  styleUrls: ['./${options.componentName.toLowerCase()}.component.scss']
})
export class ${options.componentName}Component implements OnInit {
  @Input() testId?: string;
  @Input() title?: string = '${options.componentName}';
  @Input() nsmClassification?: string = '${options.nsmClassification}';

  isLoading = false;
  data: any[] = [];

  ngOnInit(): void {
    // Component initialization
  }

  handleAction(): void {
    // Action handler
  }
}`;
  }

  /**
   * Adapt to Svelte
   */
  private adaptToSvelte(parsed: any, options: any): string {
    return `<script lang="ts">
  import { onMount } from 'svelte';
  import { UIContainer, UIStack, UIText } from '@xala-technologies/ui-system-svelte';

  export interface ${options.componentName}Props {
    testId?: string;
    title?: string;
    nsmClassification?: '${options.nsmClassification}';
  }

  export let testId: string | undefined = undefined;
  export let title: string = '${options.componentName}';
  export let nsmClassification: string = '${options.nsmClassification}';

  let isLoading = false;
  let data: any[] = [];

  onMount(() => {
    // Component initialization
  });

  function handleAction() {
    // Action handler
  }
</script>

<div 
  class="semantic-component"
  data-testid={testId}
  data-nsm-classification={nsmClassification}
>
  <UIContainer>
    <UIStack direction="vertical" gap="lg">
      <UIText variant="h2">{title}</UIText>
      <!-- Component content adapted for Svelte -->
      <slot />
    </UIStack>
  </UIContainer>
</div>

<style>
  .semantic-component {
    /* Component styles */
  }
</style>`;
  }

  /**
   * Adapt to React Native
   */
  private adaptToReactNative(parsed: any, options: any): string {
    return `import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { UIContainer, UIStack, UIText } from '@xala-technologies/ui-system-native';

export interface ${options.componentName}Props {
  readonly testID?: string;
  readonly title?: string;
  readonly nsmClassification?: '${options.nsmClassification}';
}

export const ${options.componentName}: React.FC<${options.componentName}Props> = ({
  testID,
  title = '${options.componentName}',
  nsmClassification = '${options.nsmClassification}',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    // Component initialization
  }, []);

  const handleAction = () => {
    // Action handler
  };

  return (
    <View 
      style={styles.container}
      testID={testID}
      accessibilityLabel="Semantic Component"
      accessibilityRole="group"
    >
      <UIContainer>
        <UIStack direction="vertical" gap="lg">
          <UIText variant="h2" style={styles.title}>
            {title}
          </UIText>
          {/* Component content adapted for React Native */}
        </UIStack>
      </UIContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: Platform.select({
      ios: 24,
      android: 22,
      default: 24,
    }),
    fontWeight: 'bold',
    color: '#333333',
  },
});`;
  }

  /**
   * Adapt to Flutter
   */
  private adaptToFlutter(parsed: any, options: any): string {
    return `import 'package:flutter/material.dart';
import 'package:xala_ui_system/xala_ui_system.dart';

class ${options.componentName} extends StatefulWidget {
  final String? testID;
  final String title;
  final String nsmClassification;

  const ${options.componentName}({
    Key? key,
    this.testID,
    this.title = '${options.componentName}',
    this.nsmClassification = '${options.nsmClassification}',
  }) : super(key: key);

  @override
  State<${options.componentName}> createState() => _${options.componentName}State();
}

class _${options.componentName}State extends State<${options.componentName}> {
  bool isLoading = false;
  List<dynamic> data = [];

  @override
  void initState() {
    super.initState();
    // Component initialization
  }

  void handleAction() {
    // Action handler
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Semantic Component',
      child: UIContainer(
        child: UIStack(
          direction: StackDirection.vertical,
          gap: UIGap.lg,
          children: [
            UIText(
              widget.title,
              variant: UITextVariant.h2,
            ),
            // Component content adapted for Flutter
          ],
        ),
      ),
    );
  }
}`;
  }

  /**
   * Adapt to React (default)
   */
  private adaptToReact(parsed: any, options: any): string {
    return `import React, { useState, useEffect, forwardRef } from 'react';
import {
  Container,
  Stack,
  Text
} from '@xala-technologies/ui-system';

export interface ${options.componentName}Props {
  readonly 'data-testid'?: string;
  readonly title?: string;
  readonly nsmClassification?: '${options.nsmClassification}';
}

export const ${options.componentName} = forwardRef<HTMLDivElement, ${options.componentName}Props>(
  (
    {
      'data-testid': testId,
      title = '${options.componentName}',
      nsmClassification = '${options.nsmClassification}',
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);

    useEffect(() => {
      // Component initialization
    }, []);

    const handleAction = () => {
      // Action handler
    };

    return (
      <Container
        ref={ref}
        data-testid={testId}
        data-nsm-classification={nsmClassification}
        {...props}
      >
        <Stack direction="vertical" gap="lg">
          <Text variant="h2">{title}</Text>
          {/* Component content */}
        </Stack>
      </Container>
    );
  }
);

${options.componentName}.displayName = '${options.componentName}';`;
  }

  /**
   * Adapt imports for target platform
   */
  private adaptImports(imports: string[], targetConfig: PlatformConfig): string {
    const platformImports = {
      react: "import React from 'react';",
      vue: "import { ref, computed } from 'vue';",
      angular: "import { Component, Input } from '@angular/core';",
      svelte: "import { onMount } from 'svelte';",
      'react-native': "import React from 'react';\nimport { View, Text } from 'react-native';",
      flutter: "import 'package:flutter/material.dart';"
    };

    return platformImports[targetConfig.platform] || platformImports.react;
  }

  /**
   * Adapt TypeScript types for target platform
   */
  private adaptTypes(types: string[], targetConfig: PlatformConfig): string {
    if (targetConfig.platform === 'flutter') {
      return '// Dart types handled in class definition';
    }
    return types.join('\n') || '// Types preserved from original template';
  }

  /**
   * Adapt styles for target platform
   */
  private adaptStyles(styles: string[], targetConfig: PlatformConfig): string {
    switch (targetConfig.platform) {
      case 'react-native':
        return `const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});`;
      case 'flutter':
        return '// Styles defined inline with widgets';
      default:
        return styles.join('\n') || '/* Styles preserved from original template */';
    }
  }

  /**
   * Generate platform-specific code
   */
  private generatePlatformSpecificCode(targetConfig: PlatformConfig, options: any): string {
    switch (targetConfig.platform) {
      case 'react-native':
        return this.generateReactNativeSpecificCode(options);
      case 'flutter':
        return this.generateFlutterSpecificCode(options);
      case 'angular':
        return this.generateAngularSpecificCode(options);
      default:
        return '';
    }
  }

  private generateReactNativeSpecificCode(options: any): string {
    return `// React Native specific utilities
import { Platform, Dimensions, StatusBar } from 'react-native';

const screenDimensions = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

// Norwegian compliance helpers for mobile
export const mobileComplianceHelpers = {
  getStatusBarHeight: () => StatusBar.currentHeight || 0,
  isRTLLayout: () => Platform.select({
    ios: false, // Would check iOS RTL settings
    android: false, // Would check Android RTL settings
  }),
  getScreenDimensions: () => screenDimensions,
};`;
  }

  private generateFlutterSpecificCode(options: any): string {
    return `// Flutter specific utilities
import 'package:flutter/services.dart';

class NorwegianComplianceHelpers {
  static Future<bool> isRTLLayout() async {
    // Check device RTL settings
    return false;
  }
  
  static void setStatusBarStyle() {
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ));
  }
}`;
  }

  private generateAngularSpecificCode(options: any): string {
    return `// Angular specific service
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NorwegianComplianceService {
  isRTLLayout(): boolean {
    return document.dir === 'rtl';
  }
  
  getLocale(): string {
    return 'nb-NO'; // Default Norwegian locale
  }
}`;
  }

  // Utility methods for parsing (simplified)
  private extractImports(template: string): string[] {
    const importRegex = /import.*from.*['"]/g;
    return template.match(importRegex) || [];
  }

  private extractTypes(template: string): string[] {
    const typeRegex = /export interface.*\{[\s\S]*?\}/g;
    return template.match(typeRegex) || [];
  }

  private extractComponent(template: string): string {
    // Simplified component extraction
    return template;
  }

  private extractStyles(template: string): string[] {
    // Extract style-related code
    return [];
  }

  private extractHooks(template: string): string[] {
    const hookRegex = /use[A-Z]\w+/g;
    return template.match(hookRegex) || [];
  }

  private extractEvents(template: string): string[] {
    const eventRegex = /on[A-Z]\w+/g;
    return template.match(eventRegex) || [];
  }

  private generateAdaptationMetadata(
    sourcePlatform: SupportedPlatform,
    targetPlatform: SupportedPlatform,
    parsed: any,
    adaptedTemplate: string
  ): AdaptationMetadata {
    return {
      platform: targetPlatform,
      componentCount: 1,
      adaptationComplexity: this.calculateComplexity(sourcePlatform, targetPlatform),
      preservedFeatures: ['accessibility', 'norwegian-compliance', 'nsm-classification'],
      adaptedFeatures: ['component-syntax', 'state-management', 'styling'],
      limitations: this.getAdaptationLimitations(targetPlatform),
      recommendations: this.getAdaptationRecommendations(sourcePlatform, targetPlatform)
    };
  }

  private calculateComplexity(source: SupportedPlatform, target: SupportedPlatform): 'simple' | 'moderate' | 'complex' {
    const complexityMatrix: Record<string, 'simple' | 'moderate' | 'complex'> = {
      'react-vue': 'moderate',
      'react-angular': 'complex',
      'react-svelte': 'moderate',
      'react-react-native': 'moderate',
      'react-flutter': 'complex',
      'vue-react': 'moderate',
      'angular-react': 'complex',
    };

    return complexityMatrix[`${source}-${target}`] || 'simple';
  }

  private getAdaptationLimitations(platform: SupportedPlatform): string[] {
    const limitations: Record<SupportedPlatform, string[]> = {
      'react-native': ['No DOM manipulation', 'Limited CSS support', 'Platform-specific components'],
      'flutter': ['Different widget system', 'Dart language syntax', 'No HTML/CSS'],
      'angular': ['Different template syntax', 'Dependency injection patterns'],
      'vue': ['Different reactivity system', 'Template syntax differences'],
      'svelte': ['Compile-time optimizations', 'Different component lifecycle'],
      'react': [],
      'nextjs': [],
      'nuxtjs': [],
      'electron': [],
      'capacitor': []
    };

    return limitations[platform] || [];
  }

  private getCompatibilityMatrix(): Record<SupportedPlatform, SupportedPlatform[]> {
    return {
      'react': ['vue', 'angular', 'svelte', 'react-native', 'nextjs', 'electron'],
      'vue': ['react', 'angular', 'svelte', 'nuxtjs'],
      'angular': ['react', 'vue', 'svelte'],
      'svelte': ['react', 'vue', 'angular'],
      'react-native': ['react', 'flutter', 'capacitor'],
      'flutter': ['react-native'],
      'nextjs': ['react', 'nuxtjs'],
      'nuxtjs': ['vue', 'nextjs'],
      'electron': ['react', 'vue', 'angular'],
      'capacitor': ['react', 'vue', 'angular', 'react-native']
    };
  }

  /**
   * Initialize platform configurations
   */
  private initializePlatformConfigs(): void {
    // React configuration
    this.platformConfigs.set('react', {
      platform: 'react',
      fileExtension: '.tsx',
      componentSyntax: {
        componentDefinition: 'const Component = () => {}',
        propsInterface: 'interface Props {}',
        stateHook: 'useState',
        effectHook: 'useEffect',
        eventHandler: 'onClick={handler}',
        conditionalRendering: '{condition && <Element />}',
        listRendering: '{items.map(item => <Item key={item.id} />)}',
        templateVariables: '{variable}'
      },
      styleSystem: {
        name: 'CSS-in-JS',
        classAttribute: 'className',
        inlineStyles: 'style={{}}',
        cssModules: true,
        styledComponents: true,
        designTokens: true
      },
      stateManagement: {
        local: 'useState',
        global: ['Redux', 'Zustand', 'Context API'],
        form: ['React Hook Form', 'Formik']
      },
      routingSystem: {
        name: 'React Router',
        linkComponent: 'Link',
        navigationHook: 'useNavigate',
        routeParams: 'useParams'
      },
      buildSystem: {
        name: 'Vite',
        configFile: 'vite.config.ts',
        hotReload: true,
        bundleSplitting: true
      },
      packageManager: 'bun'
    });

    // Vue configuration
    this.platformConfigs.set('vue', {
      platform: 'vue',
      fileExtension: '.vue',
      componentSyntax: {
        componentDefinition: '<script setup>',
        propsInterface: 'defineProps<Props>()',
        stateHook: 'ref',
        effectHook: 'onMounted',
        eventHandler: '@click="handler"',
        conditionalRendering: 'v-if="condition"',
        listRendering: 'v-for="item in items" :key="item.id"',
        templateVariables: '{{ variable }}'
      },
      styleSystem: {
        name: 'Scoped CSS',
        classAttribute: 'class',
        inlineStyles: ':style="{}"',
        cssModules: true,
        styledComponents: false,
        designTokens: true
      },
      stateManagement: {
        local: 'ref/reactive',
        global: ['Pinia', 'Vuex'],
        form: ['VeeValidate', 'Vue Formulate']
      },
      routingSystem: {
        name: 'Vue Router',
        linkComponent: 'router-link',
        navigationHook: 'useRouter',
        routeParams: 'useRoute'
      },
      buildSystem: {
        name: 'Vite',
        configFile: 'vite.config.ts',
        hotReload: true,
        bundleSplitting: true
      },
      packageManager: 'npm'
    });

    // Angular configuration
    this.platformConfigs.set('angular', {
      platform: 'angular',
      fileExtension: '.component.ts',
      componentSyntax: {
        componentDefinition: '@Component({})',
        propsInterface: '@Input() prop: Type',
        stateHook: 'property declaration',
        effectHook: 'ngOnInit',
        eventHandler: '(click)="handler()"',
        conditionalRendering: '*ngIf="condition"',
        listRendering: '*ngFor="let item of items"',
        templateVariables: '{{ variable }}'
      },
      styleSystem: {
        name: 'Angular CSS',
        classAttribute: 'class',
        inlineStyles: '[style]=""',
        cssModules: false,
        styledComponents: false,
        designTokens: true
      },
      stateManagement: {
        local: 'component properties',
        global: ['NgRx', 'Akita', 'Services'],
        form: ['Reactive Forms', 'Template-driven Forms']
      },
      routingSystem: {
        name: 'Angular Router',
        linkComponent: 'routerLink',
        navigationHook: 'Router.navigate',
        routeParams: 'ActivatedRoute'
      },
      buildSystem: {
        name: 'Angular CLI',
        configFile: 'angular.json',
        hotReload: true,
        bundleSplitting: true
      },
      packageManager: 'npm'
    });

    // React Native configuration
    this.platformConfigs.set('react-native', {
      platform: 'react-native',
      fileExtension: '.tsx',
      componentSyntax: {
        componentDefinition: 'const Component = () => {}',
        propsInterface: 'interface Props {}',
        stateHook: 'useState',
        effectHook: 'useEffect',
        eventHandler: 'onPress={handler}',
        conditionalRendering: '{condition && <Component />}',
        listRendering: '{items.map(item => <Item key={item.id} />)}',
        templateVariables: '{variable}'
      },
      styleSystem: {
        name: 'StyleSheet',
        classAttribute: 'style',
        inlineStyles: 'style={{}}',
        cssModules: false,
        styledComponents: true,
        designTokens: true
      },
      stateManagement: {
        local: 'useState',
        global: ['Redux', 'Zustand', 'Context API'],
        form: ['React Hook Form']
      },
      routingSystem: {
        name: 'React Navigation',
        linkComponent: 'Pressable + navigate',
        navigationHook: 'useNavigation',
        routeParams: 'useRoute'
      },
      buildSystem: {
        name: 'Metro',
        configFile: 'metro.config.js',
        hotReload: true,
        bundleSplitting: false
      },
      packageManager: 'npm'
    });

    // Add other platform configurations...
    consola.success('Initialized multi-platform configurations');
  }
}

// Singleton instance
export const platformAdapter = new PlatformAdapter();