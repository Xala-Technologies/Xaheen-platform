/**
 * Advanced Component Composition System
 * Enables complex component relationships and compound patterns
 */

import { BaseComponentSpec, Platform } from './component-specs';
import { ComponentGenerator } from '../templates/component-generator';

// =============================================================================
// COMPOSITION SYSTEM TYPES
// =============================================================================

export interface CompositionSpec {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: 'compound' | 'layout' | 'pattern';
  readonly platforms: Platform[];
  readonly components: ComponentReference[];
  readonly relationships: ComponentRelationship[];
  readonly contextProviders?: ContextProvider[];
  readonly slots: SlotDefinition[];
  readonly behavior: CompositionBehavior;
}

export interface ComponentReference {
  readonly componentId: string;
  readonly role: string;
  readonly required: boolean;
  readonly multiple: boolean;
  readonly constraints?: ComponentConstraints;
}

export interface ComponentRelationship {
  readonly type: 'parent-child' | 'sibling' | 'context' | 'dependency';
  readonly from: string;
  readonly to: string;
  readonly description: string;
  readonly constraints?: RelationshipConstraints;
}

export interface ContextProvider {
  readonly name: string;
  readonly type: string;
  readonly provides: string[];
  readonly required: boolean;
}

export interface SlotDefinition {
  readonly name: string;
  readonly type: 'single' | 'multiple' | 'conditional';
  readonly allowedComponents?: string[];
  readonly required: boolean;
  readonly description: string;
}

export interface CompositionBehavior {
  readonly stateSharing: boolean;
  readonly eventBubbling: boolean;
  readonly keyboardNavigation: boolean;
  readonly accessibility: AccessibilityBehavior;
  readonly validation?: ValidationBehavior;
}

export interface AccessibilityBehavior {
  readonly managesFocus: boolean;
  readonly announceChanges: boolean;
  readonly keyboardShortcuts: string[];
  readonly ariaRelationships: AriaRelationship[];
}

export interface AriaRelationship {
  readonly type: 'labelledby' | 'describedby' | 'controls' | 'owns';
  readonly from: string;
  readonly to: string;
}

export interface ValidationBehavior {
  readonly validateOnMount: boolean;
  readonly validateOnChange: boolean;
  readonly showErrors: boolean;
  readonly errorStrategy: 'individual' | 'summary' | 'both';
}

export interface ComponentConstraints {
  readonly minOccurrence?: number;
  readonly maxOccurrence?: number;
  readonly allowedParents?: string[];
  readonly forbiddenSiblings?: string[];
}

export interface RelationshipConstraints {
  readonly mandatory: boolean;
  readonly exclusive: boolean;
  readonly conditional?: string;
}

// =============================================================================
// COMPOUND COMPONENT SPECIFICATIONS
// =============================================================================

export const AccordionComposition: CompositionSpec = {
  id: 'accordion',
  name: 'Accordion',
  description: 'Collapsible content panels with keyboard navigation and ARIA support',
  category: 'compound',
  platforms: ['react', 'vue', 'angular', 'svelte', 'radix', 'headless-ui'],
  
  components: [
    {
      componentId: 'accordion-root',
      role: 'container',
      required: true,
      multiple: false
    },
    {
      componentId: 'accordion-item',
      role: 'item',
      required: true,
      multiple: true,
      constraints: {
        minOccurrence: 1
      }
    },
    {
      componentId: 'accordion-trigger',
      role: 'trigger',
      required: true,
      multiple: true
    },
    {
      componentId: 'accordion-content',
      role: 'content',
      required: true,
      multiple: true
    }
  ],
  
  relationships: [
    {
      type: 'parent-child',
      from: 'accordion-root',
      to: 'accordion-item',
      description: 'Root contains multiple accordion items',
      constraints: { mandatory: true }
    },
    {
      type: 'parent-child',
      from: 'accordion-item',
      to: 'accordion-trigger',
      description: 'Each item has a trigger',
      constraints: { mandatory: true, exclusive: true }
    },
    {
      type: 'sibling',
      from: 'accordion-trigger',
      to: 'accordion-content',
      description: 'Trigger controls content visibility',
      constraints: { mandatory: true }
    }
  ],
  
  contextProviders: [
    {
      name: 'AccordionContext',
      type: 'AccordionState',
      provides: ['openItems', 'toggleItem', 'closeAll'],
      required: true
    }
  ],
  
  slots: [
    {
      name: 'items',
      type: 'multiple',
      allowedComponents: ['accordion-item'],
      required: true,
      description: 'Accordion items'
    }
  ],
  
  behavior: {
    stateSharing: true,
    eventBubbling: true,
    keyboardNavigation: true,
    accessibility: {
      managesFocus: true,
      announceChanges: true,
      keyboardShortcuts: ['ArrowUp', 'ArrowDown', 'Home', 'End'],
      ariaRelationships: [
        { type: 'controls', from: 'accordion-trigger', to: 'accordion-content' },
        { type: 'labelledby', from: 'accordion-content', to: 'accordion-trigger' }
      ]
    }
  }
};

export const DataTableComposition: CompositionSpec = {
  id: 'data-table',
  name: 'DataTable',
  description: 'Complex data table with sorting, filtering, pagination, and selection',
  category: 'compound',
  platforms: ['react', 'vue', 'angular', 'svelte', 'radix', 'headless-ui'],
  
  components: [
    {
      componentId: 'table-root',
      role: 'container',
      required: true,
      multiple: false
    },
    {
      componentId: 'table-header',
      role: 'header',
      required: true,
      multiple: false
    },
    {
      componentId: 'table-body',
      role: 'body',
      required: true,
      multiple: false
    },
    {
      componentId: 'table-row',
      role: 'row',
      required: true,
      multiple: true
    },
    {
      componentId: 'table-cell',
      role: 'cell',
      required: true,
      multiple: true
    },
    {
      componentId: 'table-pagination',
      role: 'pagination',
      required: false,
      multiple: false
    }
  ],
  
  relationships: [
    {
      type: 'parent-child',
      from: 'table-root',
      to: 'table-header',
      description: 'Table contains header',
      constraints: { mandatory: true, exclusive: true }
    },
    {
      type: 'parent-child',
      from: 'table-root',
      to: 'table-body',
      description: 'Table contains body',
      constraints: { mandatory: true, exclusive: true }
    },
    {
      type: 'context',
      from: 'table-root',
      to: 'table-pagination',
      description: 'Table provides context to pagination',
      constraints: { mandatory: false }
    }
  ],
  
  contextProviders: [
    {
      name: 'TableContext',
      type: 'TableState',
      provides: ['data', 'sorting', 'filtering', 'selection', 'pagination'],
      required: true
    }
  ],
  
  slots: [
    {
      name: 'header',
      type: 'single',
      allowedComponents: ['table-header'],
      required: true,
      description: 'Table header with column definitions'
    },
    {
      name: 'body',
      type: 'single',
      allowedComponents: ['table-body'],
      required: true,
      description: 'Table body with data rows'
    },
    {
      name: 'footer',
      type: 'single',
      allowedComponents: ['table-pagination'],
      required: false,
      description: 'Table footer with pagination'
    }
  ],
  
  behavior: {
    stateSharing: true,
    eventBubbling: true,
    keyboardNavigation: true,
    accessibility: {
      managesFocus: true,
      announceChanges: true,
      keyboardShortcuts: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter'],
      ariaRelationships: [
        { type: 'controls', from: 'table-header', to: 'table-body' },
        { type: 'describedby', from: 'table-root', to: 'table-pagination' }
      ]
    },
    validation: {
      validateOnMount: true,
      validateOnChange: true,
      showErrors: true,
      errorStrategy: 'individual'
    }
  }
};

export const FormWizardComposition: CompositionSpec = {
  id: 'form-wizard',
  name: 'FormWizard',
  description: 'Multi-step form with validation, navigation, and progress indication',
  category: 'compound',
  platforms: ['react', 'vue', 'angular', 'svelte', 'radix', 'headless-ui'],
  
  components: [
    {
      componentId: 'wizard-root',
      role: 'container',
      required: true,
      multiple: false
    },
    {
      componentId: 'wizard-progress',
      role: 'progress',
      required: false,
      multiple: false
    },
    {
      componentId: 'wizard-step',
      role: 'step',
      required: true,
      multiple: true,
      constraints: {
        minOccurrence: 2
      }
    },
    {
      componentId: 'wizard-navigation',
      role: 'navigation',
      required: true,
      multiple: false
    }
  ],
  
  relationships: [
    {
      type: 'parent-child',
      from: 'wizard-root',
      to: 'wizard-step',
      description: 'Wizard contains multiple steps',
      constraints: { mandatory: true }
    },
    {
      type: 'context',
      from: 'wizard-root',
      to: 'wizard-progress',
      description: 'Progress indicator shows current step',
      constraints: { mandatory: false }
    },
    {
      type: 'dependency',
      from: 'wizard-navigation',
      to: 'wizard-step',
      description: 'Navigation depends on step validation',
      constraints: { mandatory: true }
    }
  ],
  
  contextProviders: [
    {
      name: 'WizardContext',
      type: 'WizardState',
      provides: ['currentStep', 'totalSteps', 'canProceed', 'canGoBack', 'navigate'],
      required: true
    }
  ],
  
  slots: [
    {
      name: 'progress',
      type: 'single',
      allowedComponents: ['wizard-progress'],
      required: false,
      description: 'Progress indicator'
    },
    {
      name: 'steps',
      type: 'multiple',
      allowedComponents: ['wizard-step'],
      required: true,
      description: 'Wizard steps'
    },
    {
      name: 'navigation',
      type: 'single',
      allowedComponents: ['wizard-navigation'],
      required: true,
      description: 'Step navigation controls'
    }
  ],
  
  behavior: {
    stateSharing: true,
    eventBubbling: true,
    keyboardNavigation: false,
    accessibility: {
      managesFocus: true,
      announceChanges: true,
      keyboardShortcuts: [],
      ariaRelationships: [
        { type: 'controls', from: 'wizard-navigation', to: 'wizard-step' },
        { type: 'describedby', from: 'wizard-step', to: 'wizard-progress' }
      ]
    },
    validation: {
      validateOnMount: false,
      validateOnChange: true,
      showErrors: true,
      errorStrategy: 'both'
    }
  }
};

// =============================================================================
// COMPOSITION REGISTRY
// =============================================================================

export const COMPOSITION_REGISTRY = {
  accordion: AccordionComposition,
  'data-table': DataTableComposition,
  'form-wizard': FormWizardComposition
} as const;

export type CompositionId = keyof typeof COMPOSITION_REGISTRY;

// =============================================================================
// COMPOSITION GENERATOR
// =============================================================================

export class CompositionGenerator {
  /**
   * Generate all components for a composition
   */
  static generateComposition(
    spec: CompositionSpec,
    platform: Platform,
    options: {
      includeTests?: boolean;
      includeStories?: boolean;
      includeDocs?: boolean;
    } = {}
  ) {
    const files: Array<{ path: string; content: string; type: string }> = [];
    
    // Generate individual components
    spec.components.forEach(componentRef => {
      // This would integrate with actual component specifications
      // For now, create placeholder components
      files.push(this.generateComponentFromReference(componentRef, platform, spec));
    });
    
    // Generate composition root
    files.push(this.generateCompositionRoot(spec, platform));
    
    // Generate context providers if needed
    if (spec.contextProviders && spec.contextProviders.length > 0) {
      files.push(this.generateContextProviders(spec, platform));
    }
    
    // Generate tests if requested
    if (options.includeTests) {
      files.push(this.generateCompositionTests(spec, platform));
    }
    
    // Generate stories if requested
    if (options.includeStories) {
      files.push(this.generateCompositionStories(spec, platform));
    }
    
    return files;
  }
  
  /**
   * Generate component from reference
   */
  private static generateComponentFromReference(
    componentRef: ComponentReference,
    platform: Platform,
    compositionSpec: CompositionSpec
  ) {
    const content = `/**
 * ${componentRef.componentId} Component
 * Part of ${compositionSpec.name} composition
 */
 
// Platform-specific implementation would be generated here
export const ${this.toPascalCase(componentRef.componentId)} = () => {
  // Component implementation
  return null;
};`;
    
    return {
      path: `${componentRef.componentId}.${platform === 'vue' ? 'vue' : 'tsx'}`,
      content,
      type: 'component'
    };
  }
  
  /**
   * Generate composition root component
   */
  private static generateCompositionRoot(spec: CompositionSpec, platform: Platform) {
    const content = `/**
 * ${spec.name} Composition Root
 * Manages component relationships and shared state
 */
 
import React from 'react';
${spec.contextProviders?.map(provider => 
  `import { ${provider.name} } from './${provider.name.toLowerCase()}';`
).join('\n')}

export const ${spec.name} = ({ children, ...props }) => {
  return (
    ${spec.contextProviders?.map(provider => `<${provider.name}>`).join('\n    ')}
      <div className="${spec.id}-root" {...props}>
        {children}
      </div>
    ${spec.contextProviders?.map(provider => `</${provider.name}>`).reverse().join('\n    ')}
  );
};

export default ${spec.name};`;
    
    return {
      path: `${spec.id}.${platform === 'vue' ? 'vue' : 'tsx'}`,
      content,
      type: 'component'
    };
  }
  
  /**
   * Generate context providers
   */
  private static generateContextProviders(spec: CompositionSpec, platform: Platform) {
    const providers = spec.contextProviders!.map(provider => `
export const ${provider.name} = ({ children }) => {
  // Context implementation
  const contextValue = {
    ${provider.provides.map(prop => `${prop}: undefined`).join(',\n    ')}
  };
  
  return (
    <${provider.name}.Provider value={contextValue}>
      {children}
    </${provider.name}.Provider>
  );
};`).join('\n\n');
    
    const content = `/**
 * ${spec.name} Context Providers
 */
 
import React, { createContext, useContext } from 'react';

${providers}`;
    
    return {
      path: `contexts.${platform === 'vue' ? 'ts' : 'tsx'}`,
      content,
      type: 'context'
    };
  }
  
  /**
   * Generate composition tests
   */
  private static generateCompositionTests(spec: CompositionSpec, platform: Platform) {
    const content = `/**
 * ${spec.name} Composition Tests
 */
 
import { render, screen } from '@testing-library/react';
import { ${spec.name} } from './${spec.id}';

describe('${spec.name} Composition', () => {
  test('renders all required components', () => {
    render(<${spec.name} />);
    // Test implementation
  });
  
  test('manages component relationships', () => {
    // Test relationships
  });
  
  test('handles accessibility requirements', () => {
    // Test ARIA relationships
  });
});`;
    
    return {
      path: `${spec.id}.test.${platform === 'vue' ? 'ts' : 'tsx'}`,
      content,
      type: 'test'
    };
  }
  
  /**
   * Generate composition stories
   */
  private static generateCompositionStories(spec: CompositionSpec, platform: Platform) {
    const content = `/**
 * ${spec.name} Composition Stories
 */
 
import type { Meta, StoryObj } from '@storybook/react';
import { ${spec.name} } from './${spec.id}';

const meta: Meta<typeof ${spec.name}> = {
  title: 'Compositions/${spec.name}',
  component: ${spec.name},
  parameters: {
    docs: {
      description: {
        component: '${spec.description}'
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};

export const Interactive: Story = {
  args: {}
};`;
    
    return {
      path: `${spec.id}.stories.${platform === 'vue' ? 'ts' : 'tsx'}`,
      content,
      type: 'story'
    };
  }
  
  /**
   * Utility: Convert kebab-case to PascalCase
   */
  private static toPascalCase(str: string): string {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}

// =============================================================================
// COMPOSITION UTILITIES
// =============================================================================

export const CompositionUtils = {
  /**
   * Validate composition structure
   */
  validateComposition: (spec: CompositionSpec): boolean => {
    // Validate component references exist
    const hasRequiredComponents = spec.components
      .filter(comp => comp.required)
      .every(comp => true); // Would check against actual registry
    
    // Validate relationships are valid
    const hasValidRelationships = spec.relationships
      .every(rel => 
        spec.components.some(comp => comp.componentId === rel.from) &&
        spec.components.some(comp => comp.componentId === rel.to)
      );
    
    return hasRequiredComponents && hasValidRelationships;
  },
  
  /**
   * Get composition dependencies
   */
  getDependencies: (spec: CompositionSpec): string[] => {
    return spec.components.map(comp => comp.componentId);
  },
  
  /**
   * Check platform compatibility
   */
  isCompatible: (spec: CompositionSpec, platform: Platform): boolean => {
    return spec.platforms.includes(platform);
  }
};

export default CompositionGenerator;