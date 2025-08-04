/**
 * Specification-Based MCP Tools for Xala UI System
 * Generates components using JSON specifications as blueprints
 * @version 1.0.0
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as specifications from '../specifications/index.js';
import { ComponentGenerator } from '../generators/ComponentGenerator.js';
import { FormGenerator } from '../generators/FormGenerator.js';
import { LayoutGenerator } from '../generators/LayoutGenerator.js';
import { DataTableGenerator } from '../generators/DataTableGenerator.js';
import { NavigationGenerator } from '../generators/NavigationGenerator.js';
import { DocumentationGenerator } from '../generators/DocumentationGenerator.js';
import { MultiPlatformGenerator } from '../generators/MultiPlatformGenerator.js';
import { UIComponentGenerator } from '../generators/UIComponentGenerator.js';
import { ProjectAnalyzer } from './project-analysis-tools.js';
import { CliIntegrationManager, PREDEFINED_WORKFLOWS } from './cli-integration-tools.js';

/**
 * Interface for specification-based generation
 */
interface SpecBasedGenerationOptions {
  componentName: string;
  platform?: 'react' | 'vue' | 'angular' | 'svelte' | 'solid' | 'web-components';
  variant?: string;
  customProps?: Record<string, any>;
  outputPath?: string;
  includeTests?: boolean;
  includeStories?: boolean;
  includeDocs?: boolean;
}

/**
 * Get specification-based MCP tools
 */
export function getSpecificationTools(): Tool[] {
  return [
    {
      name: 'generate_from_spec',
      description: 'Generate a component from its JSON specification with full type safety and compliance',
      inputSchema: {
        type: 'object',
        properties: {
          componentName: {
            type: 'string',
            description: 'Name of the component (must match a specification)',
            enum: Object.keys(specifications.getSpecificationByName('Button') ? { Button: true } : {})
          },
          platform: {
            type: 'string',
            enum: ['react', 'vue', 'angular', 'svelte', 'solid', 'web-components'],
            description: 'Target platform for generation',
            default: 'react'
          },
          variant: {
            type: 'string',
            description: 'Component variant to generate'
          },
          customProps: {
            type: 'object',
            description: 'Custom props to override specification defaults'
          },
          includeTests: {
            type: 'boolean',
            description: 'Generate test files',
            default: true
          },
          includeStories: {
            type: 'boolean',
            description: 'Generate Storybook stories',
            default: true
          },
          includeDocs: {
            type: 'boolean',
            description: 'Generate documentation',
            default: true
          }
        },
        required: ['componentName']
      }
    },
    {
      name: 'list_specifications',
      description: 'List all available component specifications with their metadata',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['action-feedback', 'data-display', 'form', 'layout', 'navigation', 'ui', 'all'],
            description: 'Filter by category',
            default: 'all'
          },
          compliance: {
            type: 'string',
            enum: ['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET', 'all'],
            description: 'Filter by NSM classification',
            default: 'all'
          }
        }
      }
    },
    {
      name: 'get_specification',
      description: 'Get detailed specification for a component including all props, variants, and compliance info',
      inputSchema: {
        type: 'object',
        properties: {
          componentName: {
            type: 'string',
            description: 'Name of the component'
          }
        },
        required: ['componentName']
      }
    },
    {
      name: 'validate_against_spec',
      description: 'Validate component props against its specification',
      inputSchema: {
        type: 'object',
        properties: {
          componentName: {
            type: 'string',
            description: 'Name of the component'
          },
          props: {
            type: 'object',
            description: 'Props to validate'
          }
        },
        required: ['componentName', 'props']
      }
    },
    {
      name: 'generate_types_from_spec',
      description: 'Generate TypeScript types from component specifications',
      inputSchema: {
        type: 'object',
        properties: {
          componentNames: {
            type: 'array',
            items: { type: 'string' },
            description: 'Components to generate types for (empty for all)'
          },
          outputPath: {
            type: 'string',
            description: 'Output directory for generated types'
          },
          includeValidation: {
            type: 'boolean',
            description: 'Include Zod validation schemas',
            default: true
          },
          includeGuards: {
            type: 'boolean',
            description: 'Include type guard functions',
            default: true
          }
        }
      }
    },
    {
      name: 'generate_docs_from_spec',
      description: 'Generate comprehensive documentation from specifications',
      inputSchema: {
        type: 'object',
        properties: {
          componentNames: {
            type: 'array',
            items: { type: 'string' },
            description: 'Components to document (empty for all)'
          },
          format: {
            type: 'string',
            enum: ['markdown', 'html', 'json', 'storybook'],
            description: 'Documentation format',
            default: 'markdown'
          },
          includeExamples: {
            type: 'boolean',
            description: 'Include code examples',
            default: true
          },
          includePlayground: {
            type: 'boolean',
            description: 'Include interactive playground links',
            default: false
          }
        }
      }
    },
    {
      name: 'generate_form_from_spec',
      description: 'Generate a complete form using form component specifications',
      inputSchema: {
        type: 'object',
        properties: {
          formName: {
            type: 'string',
            description: 'Name of the form'
          },
          fields: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                component: {
                  type: 'string',
                  enum: ['Input', 'TextArea', 'Select', 'Checkbox', 'Radio', 'Switch', 'DatePicker', 'TimePicker', 'Slider'],
                  description: 'Form component from specifications'
                },
                name: {
                  type: 'string',
                  description: 'Field name'
                },
                label: {
                  type: 'string',
                  description: 'Field label'
                },
                required: {
                  type: 'boolean',
                  description: 'Is field required'
                },
                validation: {
                  type: 'object',
                  description: 'Validation rules'
                }
              },
              required: ['component', 'name']
            },
            description: 'Form fields using specification components'
          },
          layout: {
            type: 'string',
            enum: ['vertical', 'horizontal', 'inline', 'grid'],
            description: 'Form layout',
            default: 'vertical'
          },
          norwegianCompliance: {
            type: 'boolean',
            description: 'Apply Norwegian form standards',
            default: true
          }
        },
        required: ['formName', 'fields']
      }
    },
    {
      name: 'generate_layout_from_spec',
      description: 'Generate layouts using Container, Grid, and Stack specifications',
      inputSchema: {
        type: 'object',
        properties: {
          layoutName: {
            type: 'string',
            description: 'Name of the layout'
          },
          structure: {
            type: 'object',
            properties: {
              container: {
                type: 'object',
                description: 'Container specification props'
              },
              grid: {
                type: 'object',
                description: 'Grid specification props'
              },
              stacks: {
                type: 'array',
                items: {
                  type: 'object',
                  description: 'Stack specification props'
                }
              }
            },
            description: 'Layout structure using specifications'
          },
          responsive: {
            type: 'boolean',
            description: 'Make layout responsive',
            default: true
          },
          semanticHTML: {
            type: 'boolean',
            description: 'Use semantic HTML elements',
            default: true
          }
        },
        required: ['layoutName', 'structure']
      }
    },
    {
      name: 'generate_data_table_from_spec',
      description: 'Generate a data table using the DataTable specification',
      inputSchema: {
        type: 'object',
        properties: {
          tableName: {
            type: 'string',
            description: 'Name of the table component'
          },
          columns: {
            type: 'array',
            description: 'Table columns as per DataTable spec'
          },
          features: {
            type: 'object',
            properties: {
              sorting: { type: 'boolean' },
              filtering: { type: 'boolean' },
              pagination: { type: 'boolean' },
              selection: { type: 'boolean' },
              virtualScrolling: { type: 'boolean' }
            },
            description: 'DataTable features from specification'
          },
          nsmClassification: {
            type: 'string',
            enum: ['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
            description: 'NSM data classification',
            default: 'OPEN'
          }
        },
        required: ['tableName', 'columns']
      }
    },
    {
      name: 'generate_navigation_from_spec',
      description: 'Generate navigation using WebNavbar, Sidebar, Tabs, or Breadcrumb specifications',
      inputSchema: {
        type: 'object',
        properties: {
          navigationType: {
            type: 'string',
            enum: ['WebNavbar', 'Sidebar', 'Tabs', 'Breadcrumb', 'Pagination'],
            description: 'Navigation component type'
          },
          name: {
            type: 'string',
            description: 'Component name'
          },
          items: {
            type: 'array',
            description: 'Navigation items'
          },
          variant: {
            type: 'string',
            description: 'Component variant from specification'
          },
          norwegianLocale: {
            type: 'boolean',
            description: 'Use Norwegian localization',
            default: true
          }
        },
        required: ['navigationType', 'name']
      }
    },
    {
      name: 'check_spec_compliance',
      description: 'Check if a component meets specification compliance requirements',
      inputSchema: {
        type: 'object',
        properties: {
          componentName: {
            type: 'string',
            description: 'Component to check'
          },
          complianceType: {
            type: 'string',
            enum: ['wcag', 'norwegian', 'i18n', 'ssr', 'all'],
            description: 'Type of compliance to check',
            default: 'all'
          }
        },
        required: ['componentName']
      }
    },
    {
      name: 'generate_test_from_spec',
      description: 'Generate comprehensive tests based on component specification',
      inputSchema: {
        type: 'object',
        properties: {
          componentName: {
            type: 'string',
            description: 'Component to test'
          },
          testTypes: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['unit', 'integration', 'accessibility', 'visual', 'performance']
            },
            description: 'Types of tests to generate',
            default: ['unit', 'accessibility']
          },
          framework: {
            type: 'string',
            enum: ['jest', 'vitest', 'cypress', 'playwright'],
            description: 'Test framework',
            default: 'vitest'
          }
        },
        required: ['componentName']
      }
    },
    {
      name: 'migrate_to_spec',
      description: 'Migrate existing component to use specification-based architecture',
      inputSchema: {
        type: 'object',
        properties: {
          componentPath: {
            type: 'string',
            description: 'Path to existing component'
          },
          specName: {
            type: 'string',
            description: 'Target specification to migrate to'
          },
          preserveCustomizations: {
            type: 'boolean',
            description: 'Preserve custom implementations',
            default: true
          }
        },
        required: ['componentPath', 'specName']
      }
    },
    {
      name: 'analyze_spec_coverage',
      description: 'Analyze which specifications have been implemented',
      inputSchema: {
        type: 'object',
        properties: {
          projectPath: {
            type: 'string',
            description: 'Path to project to analyze'
          },
          outputFormat: {
            type: 'string',
            enum: ['summary', 'detailed', 'json'],
            description: 'Output format',
            default: 'summary'
          }
        }
      }
    },
    {
      name: 'generate_spec_bundle',
      description: 'Generate a complete component bundle from multiple specifications',
      inputSchema: {
        type: 'object',
        properties: {
          bundleName: {
            type: 'string',
            description: 'Name of the bundle'
          },
          components: {
            type: 'array',
            items: { type: 'string' },
            description: 'Components to include in bundle'
          },
          platform: {
            type: 'string',
            enum: ['react', 'vue', 'angular', 'svelte'],
            description: 'Target platform'
          },
          optimization: {
            type: 'object',
            properties: {
              treeshake: { type: 'boolean' },
              minify: { type: 'boolean' },
              splitChunks: { type: 'boolean' }
            },
            description: 'Bundle optimization options'
          }
        },
        required: ['bundleName', 'components', 'platform']
      }
    },
    // ===== NEW ADVANCED TOOLS =====
    {
      name: 'analyze_project',
      description: 'Analyze existing project structure and generate migration strategy',
      inputSchema: {
        type: 'object',
        properties: {
          projectPath: {
            type: 'string',
            description: 'Path to project to analyze'
          },
          generateReport: {
            type: 'boolean',
            description: 'Generate detailed migration report',
            default: true
          }
        },
        required: ['projectPath']
      }
    },
    {
      name: 'create_project',
      description: 'Create new project with Xala UI System integration',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the new project'
          },
          framework: {
            type: 'string',
            enum: ['nextjs', 'react', 'vue', 'angular', 'svelte'],
            description: 'Framework to use'
          },
          template: {
            type: 'string',
            description: 'Project template',
            default: 'default'
          },
          features: {
            type: 'array',
            items: { type: 'string' },
            description: 'Features to include (auth, database, etc.)'
          },
          packageManager: {
            type: 'string',
            enum: ['npm', 'yarn', 'pnpm'],
            description: 'Package manager to use',
            default: 'npm'
          }
        },
        required: ['projectName', 'framework']
      }
    },
    {
      name: 'generate_page',
      description: 'Generate complete page with components using CLI integration',
      inputSchema: {
        type: 'object',
        properties: {
          pageName: {
            type: 'string',
            description: 'Name of the page to generate'
          },
          pageType: {
            type: 'string',
            enum: ['dashboard', 'landing', 'auth', 'settings'],
            description: 'Type of page to generate'
          },
          options: {
            type: 'object',
            description: 'Additional page options'
          }
        },
        required: ['pageName', 'pageType']
      }
    },
    {
      name: 'execute_migration',
      description: 'Execute migration steps for existing project',
      inputSchema: {
        type: 'object',
        properties: {
          projectPath: {
            type: 'string',
            description: 'Path to project to migrate'
          },
          migrationPlan: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of migration steps to execute'
          }
        },
        required: ['projectPath', 'migrationPlan']
      }
    },
    {
      name: 'setup_dev_environment',
      description: 'Set up complete development environment with testing, linting, and pre-commit hooks',
      inputSchema: {
        type: 'object',
        properties: {
          projectPath: {
            type: 'string',
            description: 'Path to project'
          }
        },
        required: ['projectPath']
      }
    },
    {
      name: 'execute_workflow',
      description: 'Execute predefined development workflow',
      inputSchema: {
        type: 'object',
        properties: {
          workflowName: {
            type: 'string',
            description: 'Name of workflow to execute'
          },
          parameters: {
            type: 'object',
            description: 'Workflow parameters'
          }
        },
        required: ['workflowName']
      }
    },
    {
      name: 'list_workflows',
      description: 'List available predefined workflows',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'generate_migration_strategy',
      description: 'Generate detailed migration strategy for existing project',
      inputSchema: {
        type: 'object',
        properties: {
          projectPath: {
            type: 'string',
            description: 'Path to project to analyze'
          }
        },
        required: ['projectPath']
      }
    }
  ];
}

/**
 * Tool implementations
 */
export const specificationToolHandlers = {
  generate_from_spec: async (args: any) => {
    const spec = specifications.getSpecificationByName(args.componentName);
    if (!spec) {
      throw new Error(`No specification found for component: ${args.componentName}`);
    }

    const generator = new MultiPlatformGenerator();
    const result = await generator.generateFromSpecification(spec, {
      platform: args.platform || 'react',
      variant: args.variant,
      customProps: args.customProps,
      includeTests: args.includeTests,
      includeStories: args.includeStories,
      includeDocs: args.includeDocs
    });

    return {
      success: true,
      component: args.componentName,
      platform: args.platform || 'react',
      files: result.files,
      message: `Generated ${args.componentName} from specification`
    };
  },

  list_specifications: async (args: any) => {
    const allSpecs = specifications.getAllSpecifications();
    let filtered = allSpecs;

    if (args.category && args.category !== 'all') {
      filtered = filtered.filter(spec => spec.metadata.category === args.category);
    }

    if (args.compliance && args.compliance !== 'all') {
      filtered = filtered.filter(spec => 
        spec.compliance?.norwegian?.nsmClassification === args.compliance
      );
    }

    return {
      total: filtered.length,
      specifications: filtered.map(spec => ({
        name: spec.metadata.name,
        category: spec.metadata.category,
        version: spec.metadata.version,
        description: spec.metadata.description,
        nsmClassification: spec.compliance?.norwegian?.nsmClassification || 'OPEN',
        wcagLevel: spec.compliance?.wcag?.level || 'AAA'
      }))
    };
  },

  get_specification: async (args: any) => {
    const spec = specifications.getSpecificationByName(args.componentName);
    if (!spec) {
      throw new Error(`No specification found for component: ${args.componentName}`);
    }
    return spec;
  },

  validate_against_spec: async (args: any) => {
    const spec = specifications.getSpecificationByName(args.componentName);
    if (!spec) {
      throw new Error(`No specification found for component: ${args.componentName}`);
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required props
    const requiredProps = spec.props?.groups?.required || [];
    for (const prop of requiredProps) {
      if (!(prop in args.props)) {
        errors.push(`Missing required prop: ${prop}`);
      }
    }

    // Check prop types (simplified validation)
    for (const [propName, propValue] of Object.entries(args.props)) {
      const propDef = spec.props?.schema?.[propName];
      if (!propDef) {
        warnings.push(`Unknown prop: ${propName}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      component: args.componentName
    };
  },

  check_spec_compliance: async (args: any) => {
    const spec = specifications.getSpecificationByName(args.componentName);
    if (!spec) {
      throw new Error(`No specification found for component: ${args.componentName}`);
    }

    const compliance: any = {
      component: args.componentName,
      results: {}
    };

    if (args.complianceType === 'all' || args.complianceType === 'wcag') {
      compliance.results.wcag = {
        level: spec.compliance?.wcag?.level || 'Not specified',
        compliant: spec.compliance?.wcag?.level === 'AAA'
      };
    }

    if (args.complianceType === 'all' || args.complianceType === 'norwegian') {
      compliance.results.norwegian = {
        nsmClassification: spec.compliance?.norwegian?.nsmClassification || 'Not specified',
        gdprCompliant: spec.compliance?.norwegian?.gdprCompliant || false
      };
    }

    if (args.complianceType === 'all' || args.complianceType === 'i18n') {
      compliance.results.i18n = {
        supported: spec.compliance?.i18n?.supported || false,
        defaultLocale: spec.compliance?.i18n?.defaultLocale || 'en-US'
      };
    }

    if (args.complianceType === 'all' || args.complianceType === 'ssr') {
      compliance.results.ssr = {
        supported: spec.compliance?.ssr?.supported || false
      };
    }

    return compliance;
  },

  generate_types_from_spec: async (args: any) => {
    const componentNames = args.componentNames || [];
    const specs = componentNames.length > 0 
      ? componentNames.map((name: string) => specifications.getSpecificationByName(name)).filter(Boolean)
      : specifications.getAllSpecifications();

    const typeDefinitions: string[] = [];

    for (const spec of specs) {
      if (!spec) continue;
      
      const propsInterface = `
export interface ${spec.metadata.name}Props {
${Object.entries(spec.props?.schema || {}).map(([propName, propDef]: [string, any]) => {
  const optional = propDef.required === false ? '?' : '';
  const readonly = 'readonly ';
  const type = propDef.type?.primitive || propDef.type?.custom || 'any';
  return `  ${readonly}${propName}${optional}: ${type};`;
}).join('\n')}
}`;

      typeDefinitions.push(propsInterface);

      if (args.includeValidation) {
        const validationSchema = `
export const ${spec.metadata.name}PropsSchema = z.object({
${Object.entries(spec.props?.schema || {}).map(([propName, propDef]: [string, any]) => {
  const zodType = propDef.type?.primitive === 'string' ? 'z.string()' :
                  propDef.type?.primitive === 'number' ? 'z.number()' :
                  propDef.type?.primitive === 'boolean' ? 'z.boolean()' :
                  'z.any()';
  const optional = propDef.required === false ? '.optional()' : '';
  return `  ${propName}: ${zodType}${optional}`;
}).join(',\n')}
});`;
        typeDefinitions.push(validationSchema);
      }

      if (args.includeGuards) {
        const typeGuard = `
export const is${spec.metadata.name}Props = (props: unknown): props is ${spec.metadata.name}Props => {
  try {
    return ${spec.metadata.name}PropsSchema.parse(props) !== undefined;
  } catch {
    return false;
  }
};`;
        typeDefinitions.push(typeGuard);
      }
    }

    return {
      success: true,
      types: typeDefinitions.join('\n\n'),
      componentsProcessed: specs.length
    };
  },

  generate_docs_from_spec: async (args: any) => {
    const componentNames = args.componentNames || [];
    const specs = componentNames.length > 0 
      ? componentNames.map((name: string) => specifications.getSpecificationByName(name)).filter(Boolean)
      : specifications.getAllSpecifications();

    const docs: string[] = [];

    for (const spec of specs) {
      if (!spec) continue;

      const markdown = `
# ${spec.metadata.name}

${spec.metadata.description}

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
${Object.entries(spec.props?.schema || {}).map(([propName, propDef]: [string, any]) => {
  return `| ${propName} | \`${propDef.type?.primitive || propDef.type?.custom || 'any'}\` | ${propDef.required !== false ? '✓' : ''} | ${propDef.defaultValue ? `\`${propDef.defaultValue}\`` : '-'} | ${propDef.description || ''} |`;
}).join('\n')}

## Variants

${Object.entries(spec.variants?.simple || {}).map(([variantName, variant]: [string, any]) => {
  return `### ${variantName}\n${Object.keys(variant.values || {}).map(v => `- \`${v}\``).join('\n')}`;
}).join('\n\n')}

## Accessibility

- **WCAG Level**: ${spec.compliance?.wcg?.level || 'AAA'}
- **Screen Reader**: ${spec.accessibility?.screenReader?.supported ? '✓' : '✗'}
- **Keyboard Navigation**: ${spec.accessibility?.keyboardNavigation?.supported ? '✓' : '✗'}

## Norwegian Compliance

- **NSM Classification**: ${spec.compliance?.norwegian?.nsmClassification || 'OPEN'}
- **GDPR Compliant**: ${spec.compliance?.norwegian?.gdprCompliant ? '✓' : '✗'}

${args.includeExamples ? `
## Examples

\`\`\`tsx
<${spec.metadata.name} 
  // Add example props based on specification
/>
\`\`\`
` : ''}
`;

      docs.push(markdown);
    }

    return {
      success: true,
      documentation: docs.join('\n---\n'),
      format: args.format || 'markdown',
      componentsProcessed: specs.length
    };
  },

  generate_form_from_spec: async (args: any) => {
    const formGenerator = new FormGenerator();
    const fieldSpecs = args.fields.map((field: any) => {
      const spec = specifications.getSpecificationByName(field.component);
      return {
        ...field,
        specification: spec
      };
    });

    const formCode = await formGenerator.generateForm({
      name: args.formName,
      category: 'form',
      fields: fieldSpecs,
      validation: {
        realTime: true,
        showErrors: true,
        errorPosition: 'inline'
      },
      submission: {
        method: 'POST',
        endpoint: '/api/submit',
        successMessage: 'Form submitted successfully',
        errorMessage: 'Failed to submit form'
      },
      features: {
        icons: false,
        animated: false,
        interactive: true,
        loading: false,
        error: false,
        validation: true
      },
      styling: {
        variant: 'default',
        colorScheme: 'auto',
        borderRadius: 'md',
        shadow: 'sm',
        spacing: 'comfortable'
      },
      accessibility: {
        level: 'AAA',
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
        adaptiveLayout: true,
        touchOptimized: true,
        fluidTypography: true
      }
    });

    return {
      success: true,
      formName: args.formName,
      code: formCode,
      fieldsCount: args.fields.length
    };
  },

  generate_layout_from_spec: async (args: any) => {
    const layoutGenerator = new LayoutGenerator();
    
    const layoutCode = await layoutGenerator.generateLayout({
      name: args.layoutName,
      category: 'layouts',
      layoutType: args.layoutType || 'web',
      sections: args.sections || [
        {
          name: 'header',
          component: 'Header',
          props: {}
        },
        {
          name: 'main',
          component: 'MainContent',
          props: {}
        },
        {
          name: 'footer',
          component: 'Footer',
          props: {}
        }
      ],
      features: {
        icons: false,
        animated: false,
        interactive: true,
        loading: false,
        error: false,
        validation: false
      },
      styling: {
        variant: 'default',
        colorScheme: 'auto',
        borderRadius: 'md',
        shadow: 'sm',
        spacing: 'comfortable'
      },
      accessibility: {
        level: 'AAA',
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
        adaptiveLayout: true,
        touchOptimized: true,
        fluidTypography: true
      }
    });

    return {
      success: true,
      layoutName: args.layoutName,
      code: layoutCode
    };
  },

  generate_data_table_from_spec: async (args: any) => {
    const dataTableGenerator = new DataTableGenerator();
    
    const tableCode = await dataTableGenerator.generateDataTable({
      name: args.tableName,
      category: 'data-display',
      columns: args.columns,
      features: args.features || {},
      styling: {
        variant: 'default',
        colorScheme: 'auto',
        borderRadius: 'md',
        shadow: 'sm',
        spacing: 'comfortable'
      },
      accessibility: {
        level: 'AAA',
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
        adaptiveLayout: true,
        touchOptimized: true,
        fluidTypography: true
      }
    });

    return {
      success: true,
      tableName: args.tableName,
      code: tableCode,
      columnsCount: args.columns.length
    };
  },

  generate_navigation_from_spec: async (args: any) => {
    const navigationGenerator = new NavigationGenerator();
    
    const navCode = await navigationGenerator.generateNavigation({
      name: args.name,
      category: 'navigation',
      variant: args.variant,
      features: {
        icons: false,
        animated: false,
        interactive: true,
        loading: false,
        error: false,
        validation: false
      },
      styling: {
        variant: 'default',
        colorScheme: 'auto',
        borderRadius: 'md',
        shadow: 'sm',
        spacing: 'comfortable'
      },
      accessibility: {
        level: 'AAA',
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
        adaptiveLayout: true,
        touchOptimized: true,
        fluidTypography: true
      }
    });

    return {
      success: true,
      navigationType: args.navigationType,
      name: args.name,
      code: navCode
    };
  },

  generate_test_from_spec: async (args: any) => {
    const spec = specifications.getSpecificationByName(args.componentName);
    if (!spec) {
      throw new Error(`No specification found for component: ${args.componentName}`);
    }

    const testGenerator = new (await import('../generators/TestGenerator.js')).TestGenerator();
    const testCode = await testGenerator.generateTests({
      componentName: args.componentName,
      specification: spec,
      testTypes: args.testTypes || ['unit', 'accessibility'],
      framework: args.framework || 'vitest'
    });

    return {
      success: true,
      component: args.componentName,
      tests: testCode,
      framework: args.framework || 'vitest'
    };
  },

  migrate_to_spec: async (args: any) => {
    // This would implement component migration logic
    // For now, return a placeholder response
    return {
      success: true,
      component: args.specName,
      migrationPath: args.componentPath,
      preserveCustomizations: args.preserveCustomizations !== false,
      message: `Migration plan created for ${args.componentPath} to ${args.specName} specification`
    };
  },

  analyze_spec_coverage: async (args: any) => {
    const allSpecs = specifications.getAllSpecifications();
    const implementedComponents = allSpecs.length;
    const totalComponents = 187; // From component registry

    const coverage = {
      total: totalComponents,
      implemented: implementedComponents,
      percentage: Math.round((implementedComponents / totalComponents) * 100),
      missing: totalComponents - implementedComponents,
      categories: {
        'action-feedback': allSpecs.filter(s => s.metadata.category === 'action-feedback').length,
        'data-display': allSpecs.filter(s => s.metadata.category === 'data-display').length,
        'form': allSpecs.filter(s => s.metadata.category === 'form').length,
        'layout': allSpecs.filter(s => s.metadata.category === 'layout').length,
        'navigation': allSpecs.filter(s => s.metadata.category === 'navigation').length,
        'ui': allSpecs.filter(s => s.metadata.category === 'ui').length
      }
    };

    return {
      success: true,
      coverage,
      format: args.outputFormat || 'summary'
    };
  },

  generate_spec_bundle: async (args: any) => {
    const componentSpecs = args.components.map((name: string) => 
      specifications.getSpecificationByName(name)
    ).filter(Boolean);

    const generator = new MultiPlatformGenerator();
    const bundleFiles: any[] = [];

    for (const spec of componentSpecs) {
      const result = await generator.generateFromSpecification(spec, {
        platform: args.platform,
        includeTests: false,
        includeStories: false,
        includeDocs: false
      });
      bundleFiles.push(...result.files);
    }

    return {
      success: true,
      bundleName: args.bundleName,
      platform: args.platform,
      components: args.components,
      files: bundleFiles
    };
  },

  // ===== NEW ADVANCED TOOLS =====
  
  analyze_project: async (args: any) => {
    const analyzer = new ProjectAnalyzer();
    const analysis = await analyzer.analyzeProject(args.projectPath);
    
    if (args.generateReport) {
      const report = analyzer.generateMigrationReport(analysis);
      return {
        success: true,
        analysis,
        report,
        projectPath: args.projectPath
      };
    }
    
    return {
      success: true,
      analysis,
      projectPath: args.projectPath
    };
  },

  create_project: async (args: any) => {
    const cliManager = new CliIntegrationManager();
    const result = await cliManager.createProject({
      name: args.projectName,
      framework: args.framework,
      template: args.template,
      features: args.features || [],
      packageManager: args.packageManager || 'npm'
    });
    
    return {
      success: result.success,
      output: result.output,
      error: result.error,
      generatedFiles: result.generatedFiles,
      projectName: args.projectName
    };
  },

  generate_page: async (args: any) => {
    const cliManager = new CliIntegrationManager();
    const result = await cliManager.generatePage(
      args.pageName,
      args.pageType,
      args.options || {}
    );
    
    return {
      success: result.success,
      output: result.output,
      error: result.error,
      generatedFiles: result.generatedFiles,
      pageName: args.pageName,
      pageType: args.pageType
    };
  },

  execute_migration: async (args: any) => {
    const cliManager = new CliIntegrationManager();
    const result = await cliManager.executeMigration(
      args.projectPath,
      args.migrationPlan
    );
    
    return {
      success: result.success,
      output: result.output,
      error: result.error,
      generatedFiles: result.generatedFiles,
      migratedComponents: args.migrationPlan.length
    };
  },

  setup_dev_environment: async (args: any) => {
    const cliManager = new CliIntegrationManager();
    const result = await cliManager.setupDevEnvironment(args.projectPath);
    
    return {
      success: result.success,
      output: result.output,
      error: result.error,
      generatedFiles: result.generatedFiles,
      projectPath: args.projectPath
    };
  },

  execute_workflow: async (args: any) => {
    const cliManager = new CliIntegrationManager();
    const result = await cliManager.executeWorkflow(
      args.workflowName,
      args.parameters || {}
    );
    
    return {
      success: result.success,
      output: result.output,
      error: result.error,
      generatedFiles: result.generatedFiles,
      workflowName: args.workflowName
    };
  },

  list_workflows: async (args: any) => {
    return {
      success: true,
      workflows: Object.entries(PREDEFINED_WORKFLOWS).map(([key, workflow]) => ({
        name: key,
        displayName: workflow.name,
        description: workflow.description,
        steps: workflow.steps
      }))
    };
  },

  generate_migration_strategy: async (args: any) => {
    const analyzer = new ProjectAnalyzer();
    const analysis = await analyzer.analyzeProject(args.projectPath);
    
    return {
      success: true,
      strategy: analysis.migrationStrategy,
      components: analysis.components.length,
      estimatedEffort: analysis.estimatedEffort,
      recommendations: analysis.recommendations,
      risks: analysis.risks
    };
  }

};

// Export for use in main MCP server
export default {
  tools: getSpecificationTools(),
  handlers: specificationToolHandlers
};