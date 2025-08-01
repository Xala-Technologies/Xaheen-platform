import path from 'path';
import { z } from 'zod';
import { BaseGenerator, GenerationContext, TemplateFile } from './base-generator.js';
import { logger } from '../utils/logger.js';
import { LocalizationConfig } from '../localization/core.js';

// Component types
export type ComponentType = 'display' | 'form' | 'layout' | 'business' | 'composite' | 'hook';

// Component generation input schema
const ComponentGenerationInputSchema = z.object({
  name: z.string().min(1).refine(
    (name) => /^[A-Z][a-zA-Z0-9]*$/.test(name),
    { message: 'Component name must be PascalCase' }
  ),
  type: z.enum(['display', 'form', 'layout', 'business', 'composite', 'hook']).default('display'),
  props: z.array(z.object({
    name: z.string(),
    type: z.string(),
    optional: z.boolean().default(false),
    description: z.string().optional(),
    defaultValue: z.string().optional(),
  })).default([]),
  features: z.object({
    useState: z.boolean().default(false),
    useEffect: z.boolean().default(false),
    useCallback: z.boolean().default(false),
    useMemo: z.boolean().default(false),
    forwardRef: z.boolean().default(false),
    memo: z.boolean().default(false),
  }).default({}),
  styling: z.enum(['tailwind', 'styled-components', 'css-modules']).default('tailwind'),
  localization: z.boolean().default(true),
  accessibility: z.object({
    ariaLabel: z.boolean().default(true),
    keyboardNavigation: z.boolean().default(false),
    focusManagement: z.boolean().default(false),
    screenReader: z.boolean().default(true),
  }).default({}),
  testing: z.object({
    unitTests: z.boolean().default(true),
    storybook: z.boolean().default(true),
    e2eTests: z.boolean().default(false),
  }).default({}),
  outputPath: z.string(),
  namespace: z.string().optional(),
});

type ComponentGenerationInput = z.infer<typeof ComponentGenerationInputSchema>;

// Component template data
interface ComponentTemplateData {
  name: string;
  type: ComponentType;
  imports: string[];
  props: ComponentProp[];
  hooks: string[];
  handlers: string[];
  render: string;
  styles: string;
  tests: ComponentTest[];
  stories: ComponentStory[];
  accessibility: AccessibilityFeatures;
  localization: LocalizationFeatures;
}

interface ComponentProp {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
  defaultValue?: string;
  validation?: string;
}

interface ComponentTest {
  name: string;
  description: string;
  code: string;
}

interface ComponentStory {
  name: string;
  args: Record<string, any>;
  parameters?: Record<string, any>;
}

interface AccessibilityFeatures {
  ariaLabel: boolean;
  keyboardHandlers: string[];
  focusRefs: string[];
  semanticElements: string[];
}

interface LocalizationFeatures {
  enabled: boolean;
  keys: string[];
  namespace: string;
}

// Component generator class
export class ComponentGenerator extends BaseGenerator {
  constructor() {
    super({
      name: 'component-generator',
      description: 'Generate React components with TypeScript, tests, and stories',
      templateDir: path.join(process.cwd(), 'templates', 'components'),
      outputDir: '',
      overwrite: false,
      backup: true,
      validate: true,
      hooks: {
        beforeGenerate: async (context) => {
          logger.info(`Generating ${context.variables.type} component: ${context.variables.name}`);
        },
        afterGenerate: async (context, results) => {
          const successCount = results.filter(r => r.success).length;
          logger.info(`Generated ${successCount} files for component ${context.variables.name}`);
        },
      },
    });
  }
  
  // Validate input
  async validateInput(input: any): Promise<ComponentGenerationInput> {
    return ComponentGenerationInputSchema.parse(input);
  }
  
  // Prepare generation context
  async prepareContext(input: ComponentGenerationInput): Promise<GenerationContext> {
    const templateData = await this.generateTemplateData(input);
    
    const variables = {
      // Basic info
      name: input.name,
      type: input.type,
      fileName: input.name,
      componentName: input.name,
      
      // Paths and directories
      outputPath: input.outputPath,
      namespace: input.namespace,
      
      // Template data
      ...templateData,
      
      // Configuration
      styling: input.styling,
      localization: input.localization,
      
      // Features
      features: input.features,
      accessibility: input.accessibility,
      testing: input.testing,
      
      // Utilities
      kebabCase: (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
      camelCase: (str: string) => str.charAt(0).toLowerCase() + str.slice(1),
      pascalCase: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
      
      // Metadata
      generatedAt: new Date().toISOString(),
      generator: 'component-generator',
    };
    
    return {
      templatePath: this.config.templateDir,
      outputPath: input.outputPath,
      variables,
      config: this.config,
      metadata: {
        timestamp: new Date().toISOString(),
        generator: this.config.name,
        version: '1.0.0',
      },
    };
  }
  
  // Get template files based on component type
  async getTemplateFiles(): Promise<TemplateFile[]> {
    const allFiles = await this.scanTemplateDirectory(this.config.templateDir);
    return this.loadTemplateFiles(allFiles);
  }
  
  // Generate template data for component
  private async generateTemplateData(input: ComponentGenerationInput): Promise<ComponentTemplateData> {
    const imports = this.generateImports(input);
    const props = this.generateProps(input);
    const hooks = this.generateHooks(input);
    const handlers = this.generateHandlers(input);
    const render = this.generateRender(input);
    const styles = this.generateStyles(input);
    const tests = this.generateTests(input);
    const stories = this.generateStories(input);
    const accessibility = this.generateAccessibilityFeatures(input);
    const localization = this.generateLocalizationFeatures(input);
    
    return {
      name: input.name,
      type: input.type,
      imports,
      props,
      hooks,
      handlers,
      render,
      styles,
      tests,
      stories,
      accessibility,
      localization,
    };
  }
  
  // Generate imports
  private generateImports(input: ComponentGenerationInput): string[] {
    const imports: string[] = [];
    
    // React imports
    const reactImports: string[] = ['React'];
    
    if (input.features.useState) reactImports.push('useState');
    if (input.features.useEffect) reactImports.push('useEffect');
    if (input.features.useCallback) reactImports.push('useCallback');
    if (input.features.useMemo) reactImports.push('useMemo');
    if (input.features.forwardRef) reactImports.push('forwardRef');
    if (input.features.memo) reactImports.push('memo');
    
    imports.push(`import { ${reactImports.join(', ')} } from 'react';`);
    
    // Styling imports
    if (input.styling === 'styled-components') {
      imports.push("import styled from 'styled-components';");
    }
    
    // Localization imports
    if (input.localization) {
      imports.push("import { useTranslation } from 'react-i18next';");
    }
    
    // Accessibility imports
    if (input.accessibility.keyboardNavigation || input.accessibility.focusManagement) {
      imports.push("import { useKeyboard, useFocus } from '@xala-technologies/ui-system';");
    }
    
    // Type imports
    if (input.props.length > 0) {
      imports.push(`import type { ${input.name}Props } from './${input.name}.types';`);
    }
    
    return imports;
  }
  
  // Generate props interface
  private generateProps(input: ComponentGenerationInput): ComponentProp[] {
    const props: ComponentProp[] = [];
    
    // Add user-defined props
    for (const prop of input.props) {
      props.push({
        name: prop.name,
        type: prop.type,
        optional: prop.optional,
        description: prop.description,
        defaultValue: prop.defaultValue,
      });
    }
    
    // Add common props based on component type
    switch (input.type) {
      case 'form':
        props.push({
          name: 'onSubmit',
          type: '(data: FormData) => void',
          optional: true,
          description: 'Form submission handler',
        });
        props.push({
          name: 'onValidationError',
          type: '(errors: ValidationError[]) => void',
          optional: true,
          description: 'Validation error handler',
        });
        break;
      
      case 'layout':
        props.push({
          name: 'children',
          type: 'React.ReactNode',
          optional: false,
          description: 'Child components',
        });
        break;
      
      case 'business':
        props.push({
          name: 'data',
          type: 'any',
          optional: true,
          description: 'Business data',
        });
        props.push({
          name: 'loading',
          type: 'boolean',
          optional: true,
          description: 'Loading state',
        });
        break;
    }
    
    // Add accessibility props
    if (input.accessibility.ariaLabel) {
      props.push({
        name: 'ariaLabel',
        type: 'string',
        optional: true,
        description: 'Accessible label',
      });
    }
    
    // Add styling props
    props.push({
      name: 'className',
      type: 'string',
      optional: true,
      description: 'Additional CSS classes',
    });
    
    return props;
  }
  
  // Generate hooks
  private generateHooks(input: ComponentGenerationInput): string[] {
    const hooks: string[] = [];
    
    if (input.localization) {
      hooks.push("const { t } = useTranslation();");
    }
    
    if (input.features.useState) {
      hooks.push("const [state, setState] = useState(initialState);");
    }
    
    if (input.accessibility.focusManagement) {
      hooks.push("const focusRef = useRef<HTMLElement>(null);");
    }
    
    return hooks;
  }
  
  // Generate event handlers
  private generateHandlers(input: ComponentGenerationInput): string[] {
    const handlers: string[] = [];
    
    if (input.type === 'form') {
      handlers.push(`
  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    // Form submission logic
    onSubmit?.(formData);
  }, [onSubmit]);`);
    }
    
    if (input.accessibility.keyboardNavigation) {
      handlers.push(`
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        // Handle activation
        break;
      case 'Escape':
        // Handle escape
        break;
    }
  }, []);`);
    }
    
    return handlers;
  }
  
  // Generate render method
  private generateRender(input: ComponentGenerationInput): string {
    const className = this.generateClassName(input);
    const ariaProps = this.generateAriaProps(input);
    
    switch (input.type) {
      case 'display':
        return `
  return (
    <div 
      className="${className}"
      ${ariaProps}
    >
      {children}
    </div>
  );`;
      
      case 'form':
        return `
  return (
    <form 
      className="${className}"
      onSubmit={handleSubmit}
      ${ariaProps}
    >
      {children}
    </form>
  );`;
      
      case 'layout':
        return `
  return (
    <section 
      className="${className}"
      ${ariaProps}
    >
      {children}
    </section>
  );`;
      
      default:
        return `
  return (
    <div 
      className="${className}"
      ${ariaProps}
    >
      {/* Component content */}
    </div>
  );`;
    }
  }
  
  // Generate CSS classes
  private generateClassName(input: ComponentGenerationInput): string {
    const baseClass = input.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    
    if (input.styling === 'tailwind') {
      switch (input.type) {
        case 'form':
          return `${baseClass} p-6 bg-white rounded-xl shadow-lg space-y-4`;
        case 'layout':
          return `${baseClass} w-full min-h-screen`;
        case 'display':
          return `${baseClass} inline-block`;
        default:
          return baseClass;
      }
    }
    
    return baseClass;
  }
  
  // Generate ARIA properties
  private generateAriaProps(input: ComponentGenerationInput): string {
    const props: string[] = [];
    
    if (input.accessibility.ariaLabel) {
      props.push('aria-label={ariaLabel}');
    }
    
    if (input.type === 'form') {
      props.push('role="form"');
    }
    
    return props.join('\n      ');
  }
  
  // Generate styles
  private generateStyles(input: ComponentGenerationInput): string {
    if (input.styling === 'styled-components') {
      const baseClass = input.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      
      return `
const Styled${input.name} = styled.div\`
  /* Component styles */
  padding: 1rem;
  border-radius: 0.5rem;
  
  &.${baseClass} {
    /* Base styles */
  }
  
  /* RTL support */
  [dir="rtl"] & {
    /* RTL-specific styles */
  }
\`;`;
    }
    
    if (input.styling === 'css-modules') {
      return `
.${input.name.toLowerCase()} {
  /* Component styles */
  padding: 1rem;
  border-radius: 0.5rem;
}

/* RTL support */
[dir="rtl"] .${input.name.toLowerCase()} {
  /* RTL-specific styles */
}`;
    }
    
    return '';
  }
  
  // Generate tests
  private generateTests(input: ComponentGenerationInput): ComponentTest[] {
    const tests: ComponentTest[] = [];
    
    if (input.testing.unitTests) {
      tests.push({
        name: 'renders correctly',
        description: 'Should render the component without crashing',
        code: `
test('renders correctly', () => {
  render(<${input.name} />);
  expect(screen.getByRole('${this.getComponentRole(input.type)}')).toBeInTheDocument();
});`,
      });
      
      if (input.localization) {
        tests.push({
          name: 'handles localization',
          description: 'Should display localized content',
          code: `
test('handles localization', () => {
  render(<${input.name} />, { locale: 'nb-NO' });
  // Test localized content
});`,
        });
      }
      
      if (input.accessibility.keyboardNavigation) {
        tests.push({
          name: 'supports keyboard navigation',
          description: 'Should handle keyboard interactions',
          code: `
test('supports keyboard navigation', async () => {
  const user = userEvent.setup();
  render(<${input.name} />);
  
  await user.keyboard('{Tab}');
  // Test focus management
});`,
        });
      }
    }
    
    return tests;
  }
  
  // Generate Storybook stories
  private generateStories(input: ComponentGenerationInput): ComponentStory[] {
    const stories: ComponentStory[] = [];
    
    if (input.testing.storybook) {
      stories.push({
        name: 'Default',
        args: this.getDefaultArgs(input),
      });
      
      if (input.type === 'form') {
        stories.push({
          name: 'WithValidation',
          args: {
            ...this.getDefaultArgs(input),
            showValidation: true,
          },
        });
      }
      
      if (input.localization) {
        stories.push({
          name: 'Norwegian',
          args: this.getDefaultArgs(input),
          parameters: {
            locale: 'nb-NO',
          },
        });
        
        stories.push({
          name: 'Arabic',
          args: this.getDefaultArgs(input),
          parameters: {
            locale: 'ar-SA',
            direction: 'rtl',
          },
        });
      }
    }
    
    return stories;
  }
  
  // Generate accessibility features
  private generateAccessibilityFeatures(input: ComponentGenerationInput): AccessibilityFeatures {
    const features: AccessibilityFeatures = {
      ariaLabel: input.accessibility.ariaLabel,
      keyboardHandlers: [],
      focusRefs: [],
      semanticElements: [],
    };
    
    if (input.accessibility.keyboardNavigation) {
      features.keyboardHandlers.push('onKeyDown={handleKeyDown}');
    }
    
    if (input.accessibility.focusManagement) {
      features.focusRefs.push('focusRef');
    }
    
    // Add semantic elements based on component type
    switch (input.type) {
      case 'form':
        features.semanticElements.push('form', 'fieldset', 'legend');
        break;
      case 'layout':
        features.semanticElements.push('main', 'section', 'aside');
        break;
      case 'display':
        features.semanticElements.push('article', 'figure', 'figcaption');
        break;
    }
    
    return features;
  }
  
  // Generate localization features
  private generateLocalizationFeatures(input: ComponentGenerationInput): LocalizationFeatures {
    const features: LocalizationFeatures = {
      enabled: input.localization,
      keys: [],
      namespace: input.namespace || 'components',
    };
    
    if (input.localization) {
      const baseKey = `${features.namespace}.${input.name.toLowerCase()}`;
      
      features.keys.push(`${baseKey}.title`);
      features.keys.push(`${baseKey}.description`);
      
      if (input.type === 'form') {
        features.keys.push(`${baseKey}.submit`);
        features.keys.push(`${baseKey}.cancel`);
        features.keys.push(`${baseKey}.validation.required`);
      }
    }
    
    return features;
  }
  
  // Helper methods
  private getComponentRole(type: ComponentType): string {
    switch (type) {
      case 'form': return 'form';
      case 'layout': return 'main';
      case 'display': return 'presentation';
      default: return 'generic';
    }
  }
  
  private getDefaultArgs(input: ComponentGenerationInput): Record<string, any> {
    const args: Record<string, any> = {};
    
    for (const prop of input.props) {
      if (prop.defaultValue) {
        args[prop.name] = this.parseDefaultValue(prop.defaultValue, prop.type);
      } else {
        args[prop.name] = this.getTypeDefaultValue(prop.type);
      }
    }
    
    return args;
  }
  
  private parseDefaultValue(value: string, type: string): any {
    switch (type) {
      case 'boolean': return value === 'true';
      case 'number': return parseInt(value, 10);
      case 'string': return value;
      default: return value;
    }
  }
  
  private getTypeDefaultValue(type: string): any {
    switch (type) {
      case 'boolean': return false;
      case 'number': return 0;
      case 'string': return 'Sample text';
      default: return undefined;
    }
  }
}

// Export convenience function
export async function generateComponent(input: ComponentGenerationInput): Promise<void> {
  const generator = new ComponentGenerator();
  await generator.generate(input);
}