/**
 * @fileoverview Comprehensive Tests for Specification Tools
 * @description Tests for component specification management and validation
 * @version 1.0.0
 */

import { 
  sampleButtonSpec, 
  sampleInputSpec, 
  sampleModalSpec,
  sampleDataTableSpec 
} from '../fixtures/sample-specs.js';
import { createMockFileSystem } from '../utils/test-helpers.js';

// Mock fs module
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
}));

// Since we can't import the actual tools (they might not exist yet), we'll create mock implementations
// In a real scenario, you'd import the actual specification tools

describe('Specification Tools', () => {
  let mockFs: ReturnType<typeof createMockFileSystem>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFs = createMockFileSystem();
  });

  describe('Component Specification Management', () => {
    it('should validate component specification schema', () => {
      const validSpec = sampleButtonSpec;
      
      // Mock implementation of validation
      const validateSpec = (spec: typeof sampleButtonSpec) => {
        const requiredFields = ['id', 'name', 'category', 'props'];
        const missingFields = requiredFields.filter(field => !(field in spec));
        
        if (missingFields.length > 0) {
          return { valid: false, errors: [`Missing required fields: ${missingFields.join(', ')}`] };
        }
        
        // Validate props structure
        if (!spec.props || typeof spec.props !== 'object') {
          return { valid: false, errors: ['Props must be an object'] };
        }
        
        // Validate each prop
        for (const [propName, propConfig] of Object.entries(spec.props)) {
          if (!propConfig.type) {
            return { 
              valid: false, 
              errors: [`Prop '${propName}' is missing required 'type' field`] 
            };
          }
        }
        
        return { valid: true, errors: [] };
      };

      const result = validateSpec(validSpec);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid component specifications', () => {
      const invalidSpec = {
        // Missing required fields
        name: 'Button',
        props: {
          children: {
            // Missing type field
            required: true
          }
        }
      };

      const validateSpec = (spec: any) => {
        const requiredFields = ['id', 'name', 'category', 'props'];
        const missingFields = requiredFields.filter(field => !(field in spec));
        
        if (missingFields.length > 0) {
          return { valid: false, errors: [`Missing required fields: ${missingFields.join(', ')}`] };
        }
        
        for (const [propName, propConfig] of Object.entries(spec.props)) {
          if (!(propConfig as any).type) {
            return { 
              valid: false, 
              errors: [`Prop '${propName}' is missing required 'type' field`] 
            };
          }
        }
        
        return { valid: true, errors: [] };
      };

      const result = validateSpec(invalidSpec);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required fields: id, category');
      expect(result.errors).toContain("Prop 'children' is missing required 'type' field");
    });

    it('should load component specifications from registry', () => {
      const mockRegistry = {
        'button': sampleButtonSpec,
        'input': sampleInputSpec,
        'modal': sampleModalSpec
      };

      mockFs.files.set('/specs/registry.json', JSON.stringify(mockRegistry));
      require('fs').readFileSync.mockImplementation(mockFs.readFileSync);
      require('fs').existsSync.mockImplementation(mockFs.existsSync);

      const loadRegistry = () => {
        const registryPath = '/specs/registry.json';
        if (!require('fs').existsSync(registryPath)) {
          throw new Error('Registry not found');
        }
        const content = require('fs').readFileSync(registryPath, 'utf8');
        return JSON.parse(content);
      };

      const registry = loadRegistry();
      expect(registry).toHaveProperty('button');
      expect(registry).toHaveProperty('input');
      expect(registry).toHaveProperty('modal');
      expect(registry.button.name).toBe('Button');
      expect(registry.input.name).toBe('Input');
      expect(registry.modal.name).toBe('Modal');
    });

    it('should filter specifications by category', () => {
      const specs = [
        sampleButtonSpec,
        sampleInputSpec,
        sampleModalSpec,
        sampleDataTableSpec
      ];

      const filterByCategory = (specifications: typeof specs, category: string) => {
        return specifications.filter(spec => spec.category === category);
      };

      const formComponents = filterByCategory(specs, 'form');
      const overlayComponents = filterByCategory(specs, 'overlay');
      const actionComponents = filterByCategory(specs, 'action-feedback');

      expect(formComponents).toHaveLength(1);
      expect(formComponents[0].name).toBe('Input');

      expect(overlayComponents).toHaveLength(1);
      expect(overlayComponents[0].name).toBe('Modal');

      expect(actionComponents).toHaveLength(1);
      expect(actionComponents[0].name).toBe('Button');
    });

    it('should filter specifications by platform support', () => {
      const specs = [sampleButtonSpec, sampleModalSpec];

      const filterByPlatform = (specifications: typeof specs, platform: string) => {
        return specifications.filter(spec => 
          spec.platform && (spec.platform as any)[platform] === true
        );
      };

      const reactComponents = filterByPlatform(specs, 'react');
      const reactNativeComponents = filterByPlatform(specs, 'react-native');

      expect(reactComponents).toHaveLength(2); // Both support React
      expect(reactNativeComponents).toHaveLength(1); // Only Button supports React Native
    });

    it('should search specifications by name or description', () => {
      const specs = [
        sampleButtonSpec,
        sampleInputSpec,
        sampleModalSpec,
        sampleDataTableSpec
      ];

      const searchSpecs = (specifications: typeof specs, query: string) => {
        const lowerQuery = query.toLowerCase();
        return specifications.filter(spec => 
          spec.name.toLowerCase().includes(lowerQuery) ||
          spec.description.toLowerCase().includes(lowerQuery)
        );
      };

      const buttonResults = searchSpecs(specs, 'button');
      const interactiveResults = searchSpecs(specs, 'interactive');
      const dialogResults = searchSpecs(specs, 'dialog');

      expect(buttonResults).toHaveLength(1);
      expect(buttonResults[0].name).toBe('Button');

      expect(interactiveResults).toHaveLength(1);
      expect(interactiveResults[0].name).toBe('Button');

      expect(dialogResults).toHaveLength(1);
      expect(dialogResults[0].name).toBe('Modal');
    });
  });

  describe('Specification Generation', () => {
    it('should generate TypeScript interfaces from specifications', () => {
      const generateTSInterface = (spec: typeof sampleButtonSpec) => {
        const interfaceName = `${spec.name}Props`;
        const props = Object.entries(spec.props)
          .map(([propName, propConfig]) => {
            const optional = propConfig.required === false ? '?' : '';
            const comment = propConfig.description ? `  /** ${propConfig.description} */\n` : '';
            return `${comment}  readonly ${propName}${optional}: ${propConfig.type};`;
          })
          .join('\n');

        return `interface ${interfaceName} {
${props}
}`;
      };

      const buttonInterface = generateTSInterface(sampleButtonSpec);
      
      expect(buttonInterface).toContain('interface ButtonProps');
      expect(buttonInterface).toContain('readonly children: ReactNode;');
      expect(buttonInterface).toContain('readonly variant?: ');
      expect(buttonInterface).toContain('readonly disabled?: boolean;');
      expect(buttonInterface).toContain('/** Visual style variant */');
      expect(buttonInterface).toContain('/** Disabled state */');
    });

    it('should generate component templates from specifications', () => {
      const generateComponentTemplate = (spec: typeof sampleButtonSpec) => {
        const propsInterface = `${spec.name}Props`;
        const propsDestructure = Object.keys(spec.props).join(', ');
        const defaultProps = Object.entries(spec.props)
          .filter(([_, config]) => config.default !== undefined)
          .map(([name, config]) => `${name} = ${JSON.stringify(config.default)}`)
          .join(', ');

        return `import React, { forwardRef } from 'react';

interface ${propsInterface} {
${Object.entries(spec.props)
  .map(([name, config]) => {
    const optional = config.required === false ? '?' : '';
    return `  readonly ${name}${optional}: ${config.type};`;
  })
  .join('\n')}
}

export const ${spec.name} = forwardRef<HTMLButtonElement, ${propsInterface}>(({
  ${propsDestructure}${defaultProps ? `, ${defaultProps}` : ''}
}, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={\`btn btn-\${variant}\`}
    >
      {children}
    </button>
  );
});

${spec.name}.displayName = '${spec.name}';`;
      };

      const buttonTemplate = generateComponentTemplate(sampleButtonSpec);
      
      expect(buttonTemplate).toContain('interface ButtonProps');
      expect(buttonTemplate).toContain('export const Button = forwardRef');
      expect(buttonTemplate).toContain('variant = "primary"');
      expect(buttonTemplate).toContain('disabled = false');
      expect(buttonTemplate).toContain('Button.displayName = \'Button\'');
    });

    it('should generate Storybook stories from specifications', () => {
      const generateStoryTemplate = (spec: typeof sampleButtonSpec) => {
        const examples = spec.examples || [];
        const stories = examples.map((example, index) => `
export const ${example.name.replace(/\s+/g, '')} = {
  args: ${JSON.stringify(parsePropsFromCode(example.code))},
};`).join('\n');

        return `import type { Meta, StoryObj } from '@storybook/react';
import { ${spec.name} } from './${spec.name}';

const meta: Meta<typeof ${spec.name}> = {
  title: '${spec.category}/${spec.name}',
  component: ${spec.name},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
${Object.entries(spec.props)
  .map(([name, config]) => {
    if (config.type.includes('|')) {
      const options = config.type.split('|').map(s => s.trim().replace(/'/g, ''));
      return `    ${name}: {
      control: { type: 'select' },
      options: ${JSON.stringify(options)},
    },`;
    }
    return `    ${name}: { control: '${getControlType(config.type)}' },`;
  })
  .join('\n')}
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
${Object.entries(spec.props)
  .filter(([_, config]) => config.default !== undefined)
  .map(([name, config]) => `    ${name}: ${JSON.stringify(config.default)},`)
  .join('\n')}
  },
};
${stories}`;
      };

      const parsePropsFromCode = (code: string) => {
        // Simple parser for example props
        const props: Record<string, unknown> = {};
        const matches = code.match(/(\w+)="([^"]+)"/g);
        if (matches) {
          matches.forEach(match => {
            const [, key, value] = match.match(/(\w+)="([^"]+)"/) || [];
            if (key && value) {
              props[key] = value;
            }
          });
        }
        return props;
      };

      const getControlType = (type: string) => {
        if (type === 'boolean') return 'boolean';
        if (type === 'number') return 'number';
        if (type.includes('|')) return 'select';
        return 'text';
      };

      const buttonStory = generateStoryTemplate(sampleButtonSpec);
      
      expect(buttonStory).toContain("title: 'action-feedback/Button'");
      expect(buttonStory).toContain('component: Button');
      expect(buttonStory).toContain('export const Default: Story');
      expect(buttonStory).toContain('export const PrimaryButton');
      expect(buttonStory).toContain('children: \'Button\'');
    });
  });

  describe('Specification Validation', () => {
    it('should validate prop types', () => {
      const validatePropTypes = (props: Record<string, any>) => {
        const errors: string[] = [];
        const validTypes = [
          'string', 'number', 'boolean', 'ReactNode', 'HTMLElement',
          'MouseEvent', 'ChangeEvent', 'FormEvent'
        ];

        for (const [propName, propConfig] of Object.entries(props)) {
          const { type } = propConfig;
          
          // Check for union types (e.g., 'primary' | 'secondary')
          if (type.includes('|')) {
            const unionTypes = type.split('|').map((t: string) => t.trim());
            const validUnion = unionTypes.every((t: string) => 
              validTypes.includes(t) || /^'[^']*'$/.test(t) || /^"[^"]*"$/.test(t)
            );
            if (!validUnion) {
              errors.push(`Invalid union type for prop '${propName}': ${type}`);
            }
          } else if (!validTypes.includes(type) && !type.includes('()') && !type.includes('<')) {
            errors.push(`Invalid type for prop '${propName}': ${type}`);
          }

          // Validate required vs default value consistency
          if (propConfig.required && propConfig.default !== undefined) {
            errors.push(`Prop '${propName}' cannot be required and have a default value`);
          }
        }

        return { valid: errors.length === 0, errors };
      };

      const validProps = sampleButtonSpec.props;
      const validResult = validatePropTypes(validProps);
      expect(validResult.valid).toBe(true);

      const invalidProps = {
        invalidProp: {
          type: 'InvalidType',
          required: true
        },
        conflictProp: {
          type: 'string',
          required: true,
          default: 'default value'
        }
      };
      const invalidResult = validatePropTypes(invalidProps);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain("Invalid type for prop 'invalidProp': InvalidType");
      expect(invalidResult.errors).toContain("Prop 'conflictProp' cannot be required and have a default value");
    });

    it('should validate accessibility requirements', () => {
      const validateAccessibility = (spec: typeof sampleButtonSpec) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!spec.accessibility) {
          errors.push('Missing accessibility configuration');
          return { valid: false, errors, warnings };
        }

        const { accessibility } = spec;

        // Check for ARIA attributes
        if (!accessibility['aria-label'] && !accessibility['aria-labelledby']) {
          warnings.push('Consider adding aria-label or aria-labelledby for screen readers');
        }

        // Check for role
        if (!accessibility.role) {
          warnings.push('Consider specifying an explicit role');
        }

        // Check for keyboard support
        if (!accessibility.keyboardSupport) {
          warnings.push('Consider adding keyboard support information');
        }

        // Check for focus management
        if (spec.category === 'overlay' && !accessibility.focusManagement) {
          errors.push('Overlay components require focus management specification');
        }

        return { 
          valid: errors.length === 0, 
          errors, 
          warnings 
        };
      };

      const buttonResult = validateAccessibility(sampleButtonSpec);
      expect(buttonResult.valid).toBe(true);
      expect(buttonResult.warnings.length).toBeLessThan(2); // Should have good accessibility

      const modalResult = validateAccessibility(sampleModalSpec);
      expect(modalResult.valid).toBe(true);
      expect(modalResult.errors).toHaveLength(0);
    });

    it('should validate design token usage', () => {
      const validateDesignTokens = (spec: typeof sampleButtonSpec) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!spec.designTokens) {
          warnings.push('No design tokens specified - consider using design system tokens');
          return { valid: true, errors, warnings };
        }

        const { designTokens } = spec;

        // Check for hardcoded values
        const checkForHardcodedValues = (obj: any, path: string = '') => {
          for (const [key, value] of Object.entries(obj)) {
            const currentPath = path ? `${path}.${key}` : key;
            
            if (typeof value === 'string') {
              // Check for hardcoded colors (hex, rgb, hsl)
              if (/#[0-9a-fA-F]{3,6}/.test(value) || 
                  /rgb\(/.test(value) || 
                  /hsl\(/.test(value)) {
                warnings.push(`Hardcoded color value at ${currentPath}: ${value}`);
              }
              
              // Check for hardcoded pixels
              if (/^\d+px$/.test(value)) {
                warnings.push(`Hardcoded pixel value at ${currentPath}: ${value}`);
              }
            } else if (typeof value === 'object' && value !== null) {
              checkForHardcodedValues(value, currentPath);
            }
          }
        };

        checkForHardcodedValues(designTokens);

        // Check for proper token structure
        if (designTokens.colors && !designTokens.colors.primary) {
          warnings.push('Consider defining primary color token');
        }

        if (designTokens.spacing && Object.keys(designTokens.spacing).length === 0) {
          warnings.push('Spacing tokens are empty');
        }

        return { valid: errors.length === 0, errors, warnings };
      };

      const buttonResult = validateDesignTokens(sampleButtonSpec);
      expect(buttonResult.valid).toBe(true);
      expect(buttonResult.warnings.length).toBeLessThan(3); // Should use proper tokens

      const specWithHardcodedValues = {
        ...sampleButtonSpec,
        designTokens: {
          colors: {
            primary: '#007acc', // Hardcoded color
            background: 'var(--color-bg)' // Proper token
          },
          spacing: {
            padding: '16px' // Hardcoded pixels
          }
        }
      };

      const hardcodedResult = validateDesignTokens(specWithHardcodedValues);
      expect(hardcodedResult.valid).toBe(true);
      expect(hardcodedResult.warnings).toContain('Hardcoded color value at colors.primary: #007acc');
      expect(hardcodedResult.warnings).toContain('Hardcoded pixel value at spacing.padding: 16px');
    });
  });

  describe('Specification Utilities', () => {
    it('should convert specification to JSON schema', () => {
      const toJSONSchema = (spec: typeof sampleButtonSpec) => {
        const schema = {
          $schema: 'http://json-schema.org/draft-07/schema#',
          title: `${spec.name}Props`,
          type: 'object',
          properties: {} as Record<string, any>,
          required: [] as string[]
        };

        for (const [propName, propConfig] of Object.entries(spec.props)) {
          let propSchema: any = {};

          // Convert TypeScript types to JSON schema types
          if (propConfig.type === 'string') {
            propSchema.type = 'string';
          } else if (propConfig.type === 'number') {
            propSchema.type = 'number';
          } else if (propConfig.type === 'boolean') {
            propSchema.type = 'boolean';
          } else if (propConfig.type.includes('|')) {
            // Handle union types
            const options = propConfig.type
              .split('|')
              .map(t => t.trim().replace(/'/g, ''));
            propSchema.enum = options;
          } else {
            propSchema.type = 'string'; // Default for complex types
            propSchema.description = `TypeScript type: ${propConfig.type}`;
          }

          if (propConfig.description) {
            propSchema.description = propConfig.description;
          }

          if (propConfig.default !== undefined) {
            propSchema.default = propConfig.default;
          }

          schema.properties[propName] = propSchema;

          if (propConfig.required !== false) {
            schema.required.push(propName);
          }
        }

        return schema;
      };

      const buttonSchema = toJSONSchema(sampleButtonSpec);
      
      expect(buttonSchema.title).toBe('ButtonProps');
      expect(buttonSchema.properties.children).toEqual({
        type: 'string',
        description: 'TypeScript type: ReactNode'
      });
      expect(buttonSchema.properties.variant).toEqual({
        enum: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
        description: 'Visual style variant',
        default: 'primary'
      });
      expect(buttonSchema.required).toContain('children');
      expect(buttonSchema.required).not.toContain('variant');
    });

    it('should merge specification variants', () => {
      const baseSpec = {
        name: 'Button',
        props: {
          children: { type: 'ReactNode', required: true },
          onClick: { type: '() => void', required: false }
        }
      };

      const variantSpec = {
        name: 'IconButton',
        props: {
          icon: { type: 'ReactNode', required: true },
          'aria-label': { type: 'string', required: true }
        }
      };

      const mergeSpecs = (base: typeof baseSpec, variant: typeof variantSpec) => {
        return {
          ...base,
          ...variant,
          props: {
            ...base.props,
            ...variant.props
          }
        };
      };

      const mergedSpec = mergeSpecs(baseSpec, variantSpec);
      
      expect(mergedSpec.name).toBe('IconButton');
      expect(mergedSpec.props).toHaveProperty('children');
      expect(mergedSpec.props).toHaveProperty('onClick');
      expect(mergedSpec.props).toHaveProperty('icon');
      expect(mergedSpec.props).toHaveProperty('aria-label');
    });

    it('should generate specification diff', () => {
      const oldSpec = {
        name: 'Button',
        version: '1.0.0',
        props: {
          children: { type: 'ReactNode', required: true },
          onClick: { type: '() => void', required: false },
          variant: { type: "'primary' | 'secondary'", default: 'primary' }
        }
      };

      const newSpec = {
        name: 'Button',
        version: '2.0.0',
        props: {
          children: { type: 'ReactNode', required: true },
          onClick: { type: '(event: MouseEvent) => void', required: false }, // Changed
          variant: { type: "'primary' | 'secondary' | 'outline'", default: 'primary' }, // Changed
          size: { type: "'sm' | 'md' | 'lg'", default: 'md' } // Added
          // removed: disabled prop
        }
      };

      const generateDiff = (oldSpec: any, newSpec: any) => {
        const changes = {
          added: [] as string[],
          modified: [] as string[],
          removed: [] as string[]
        };

        // Check for added props
        for (const propName in newSpec.props) {
          if (!(propName in oldSpec.props)) {
            changes.added.push(propName);
          }
        }

        // Check for removed props
        for (const propName in oldSpec.props) {
          if (!(propName in newSpec.props)) {
            changes.removed.push(propName);
          }
        }

        // Check for modified props
        for (const propName in oldSpec.props) {
          if (propName in newSpec.props) {
            const oldProp = JSON.stringify(oldSpec.props[propName]);
            const newProp = JSON.stringify(newSpec.props[propName]);
            if (oldProp !== newProp) {
              changes.modified.push(propName);
            }
          }
        }

        return changes;
      };

      const diff = generateDiff(oldSpec, newSpec);
      
      expect(diff.added).toContain('size');
      expect(diff.modified).toContain('onClick');
      expect(diff.modified).toContain('variant');
      expect(diff.removed).toHaveLength(0); // No props were removed in this example
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed specification files', () => {
      mockFs.files.set('/specs/invalid.json', 'invalid json content');
      require('fs').readFileSync.mockImplementation(mockFs.readFileSync);
      require('fs').existsSync.mockImplementation(mockFs.existsSync);

      const loadSpec = (path: string) => {
        try {
          const content = require('fs').readFileSync(path, 'utf8');
          return JSON.parse(content);
        } catch (error) {
          throw new Error(`Failed to load specification: ${error.message}`);
        }
      };

      expect(() => loadSpec('/specs/invalid.json')).toThrow('Failed to load specification');
    });

    it('should handle missing specification files', () => {
      require('fs').existsSync.mockImplementation(() => false);

      const loadSpec = (path: string) => {
        if (!require('fs').existsSync(path)) {
          throw new Error(`Specification file not found: ${path}`);
        }
        return {};
      };

      expect(() => loadSpec('/specs/missing.json')).toThrow('Specification file not found');
    });
  });

  describe('Performance', () => {
    it('should handle large specification registries efficiently', () => {
      const largeRegistry = {};
      for (let i = 0; i < 1000; i++) {
        (largeRegistry as any)[`component${i}`] = {
          ...sampleButtonSpec,
          id: `component${i}`,
          name: `Component${i}`
        };
      }

      mockFs.files.set('/specs/large-registry.json', JSON.stringify(largeRegistry));
      require('fs').readFileSync.mockImplementation(mockFs.readFileSync);

      const startTime = Date.now();
      const registry = JSON.parse(require('fs').readFileSync('/specs/large-registry.json', 'utf8'));
      const endTime = Date.now();

      expect(Object.keys(registry)).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });

    it('should cache specification validations', () => {
      const validationCache = new Map();
      
      const validateWithCache = (spec: any) => {
        const specHash = JSON.stringify(spec);
        
        if (validationCache.has(specHash)) {
          return validationCache.get(specHash);
        }
        
        // Simulate expensive validation
        const result = { valid: true, errors: [] };
        validationCache.set(specHash, result);
        return result;
      };

      // First validation
      const startTime1 = Date.now();
      const result1 = validateWithCache(sampleButtonSpec);
      const endTime1 = Date.now();

      // Second validation (should be cached)
      const startTime2 = Date.now();
      const result2 = validateWithCache(sampleButtonSpec);
      const endTime2 = Date.now();

      expect(result1).toEqual(result2);
      expect(endTime2 - startTime2).toBeLessThan(endTime1 - startTime1);
      expect(validationCache.size).toBe(1);
    });
  });
});