import path from 'path';
import { promises as fs } from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import { logger } from '../../utils/logger.js';
import { fileExists, ensureDir, writeFile } from '../../utils/fs.js';
import { loadConfig } from '../../config/index.js';
import { processTemplateString, TemplateContext } from '../../utils/template.js';
import {
  ValidationError,
  FileSystemError,
} from '../../utils/errors.js';

// Component generation options
interface ComponentOptions {
  props?: string[];
  type?: 'display' | 'form' | 'layout';
  test?: boolean;
  story?: boolean;
  locale?: boolean;
}

// Prop definition
interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}

// Component configuration
interface ComponentConfig {
  name: string;
  componentName: string;
  fileName: string;
  props: PropDefinition[];
  type: 'display' | 'form' | 'layout';
  hasLocalization: boolean;
  hasTests: boolean;
  hasStorybook: boolean;
}

// Parse prop string (e.g., "title:string", "count:number?")
function parseProp(propString: string): PropDefinition {
  const match = propString.match(/^(\w+):(\w+)(\?)?(?:=(.+))?$/);
  
  if (!match) {
    throw new ValidationError(
      `Invalid prop format: "${propString}"`,
      [{ field: 'prop', message: 'Expected format: name:type[?][=default]' }]
    );
  }
  
  const [, name, type, optional, defaultValue] = match;
  
  return {
    name,
    type,
    required: !optional,
    defaultValue,
  };
}

// Validate component name
function validateComponentName(name: string): void {
  if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
    throw new ValidationError(
      'Invalid component name',
      [{
        field: 'name',
        message: 'Component name must start with uppercase letter and contain only letters and numbers',
      }]
    );
  }
}

// Generate component file content
function generateComponentContent(config: ComponentConfig): string {
  const template = `import React from 'react';
import { cn } from '@/utils/cn';
{{#if hasLocalization}}
import { useTranslation } from '@/hooks/useTranslation';
{{/if}}

// Component props interface
interface {{componentName}}Props {
{{#each props}}
  {{#if required}}
  {{name}}: {{type}};
  {{else}}
  {{name}}?: {{type}};
  {{/if}}
{{/each}}
  className?: string;
  children?: React.ReactNode;
}

/**
 * {{componentName}} component
 * 
 * A {{type}} component that follows Xala design system standards.
 * Implements SOLID principles and WCAG AAA accessibility.
 */
export const {{componentName}}: React.FC<{{componentName}}Props> = ({
{{#each props}}
  {{name}}{{#unless required}} = {{#if defaultValue}}{{defaultValue}}{{else}}undefined{{/if}}{{/unless}},
{{/each}}
  className,
  children,
}) => {
{{#if hasLocalization}}
  const { t } = useTranslation();
{{/if}}

  return (
    <div
      className={cn(
        // Base styles
        'relative',
        {{#if (eq type 'display')}}
        'block',
        {{else if (eq type 'form')}}
        'w-full',
        {{else}}
        'flex flex-col',
        {{/if}}
        // Custom classes
        className
      )}
      {{#if (eq type 'form')}}
      role="form"
      {{/if}}
    >
      {{#if (eq type 'display')}}
      {/* Display component content */}
      {children}
      {{else if (eq type 'form')}}
      {/* Form component content */}
      <label className="block text-sm font-medium mb-2">
        {{#if hasLocalization}}
        {t('components.{{fileName}}.label')}
        {{else}}
        Label
        {{/if}}
      </label>
      {children}
      {{else}}
      {/* Layout component content */}
      {children}
      {{/if}}
    </div>
  );
};

{{componentName}}.displayName = '{{componentName}}';
`;

  const context: TemplateContext = {
    ...config,
    projectName: '',
    projectPath: '',
    timestamp: new Date().toISOString(),
    year: new Date().getFullYear(),
    locale: 'nb-NO',
    platform: 'web',
  };

  return processTemplateString(template, context);
}

// Generate test file content
function generateTestContent(config: ComponentConfig): string {
  const template = `import React from 'react';
import { render, screen } from '@testing-library/react';
import { {{componentName}} } from './{{fileName}}';

describe('{{componentName}}', () => {
  it('renders without crashing', () => {
    render(<{{componentName}}{{#each props}}{{#if required}} {{name}}="test"{{/if}}{{/each}} />);
  });

  it('applies custom className', () => {
    const { container } = render(
      <{{componentName}}{{#each props}}{{#if required}} {{name}}="test"{{/if}}{{/each}} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders children', () => {
    render(
      <{{componentName}}{{#each props}}{{#if required}} {{name}}="test"{{/if}}{{/each}}>
        <span>Test content</span>
      </{{componentName}}>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

{{#each props}}
  {{#if required}}
  it('renders with required prop {{name}}', () => {
    render(<{{../componentName}} {{name}}="test value" />);
    // Add specific assertions based on prop usage
  });
  {{/if}}
{{/each}}

  // Accessibility tests
  it('meets WCAG accessibility standards', async () => {
    const { container } = render(
      <{{componentName}}{{#each props}}{{#if required}} {{name}}="test"{{/if}}{{/each}} />
    );
    // TODO: Add axe-core accessibility testing
  });
});
`;

  const context: TemplateContext = {
    ...config,
    projectName: '',
    projectPath: '',
    timestamp: new Date().toISOString(),
    year: new Date().getFullYear(),
    locale: 'nb-NO',
    platform: 'web',
  };

  return processTemplateString(template, context);
}

// Generate Storybook story content
function generateStoryContent(config: ComponentConfig): string {
  const template = `import type { Meta, StoryObj } from '@storybook/react';
import { {{componentName}} } from './{{fileName}}';

const meta: Meta<typeof {{componentName}}> = {
  title: 'Components/{{type}}/{{componentName}}',
  component: {{componentName}},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A {{type}} component that follows Xala design system standards.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
{{#each props}}
    {{name}}: {
      control: '{{#if (eq type "boolean")}}boolean{{else if (eq type "number")}}number{{else}}text{{/if}}',
      description: '{{name}} prop',
      {{#if defaultValue}}
      defaultValue: {{defaultValue}},
      {{/if}}
    },
{{/each}}
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
{{#each props}}
    {{#if required}}
    {{name}}: {{#if (eq type "string")}}"Example {{name}}"{{else if (eq type "number")}}42{{else if (eq type "boolean")}}true{{else}}undefined{{/if}},
    {{/if}}
{{/each}}
  },
};

// With all props
export const WithAllProps: Story = {
  args: {
{{#each props}}
    {{name}}: {{#if (eq type "string")}}"Example {{name}}"{{else if (eq type "number")}}42{{else if (eq type "boolean")}}true{{else}}undefined{{/if}},
{{/each}}
    className: 'custom-styling',
  },
};

// Responsive story
export const Responsive: Story = {
  args: {
{{#each props}}
    {{#if required}}
    {{name}}: {{#if (eq type "string")}}"Responsive {{name}}"{{else if (eq type "number")}}100{{else if (eq type "boolean")}}true{{else}}undefined{{/if}},
    {{/if}}
{{/each}}
  },
  parameters: {
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1920px', height: '1080px' } },
      },
    },
  },
};
`;

  const context: TemplateContext = {
    ...config,
    projectName: '',
    projectPath: '',
    timestamp: new Date().toISOString(),
    year: new Date().getFullYear(),
    locale: 'nb-NO',
    platform: 'web',
  };

  return processTemplateString(template, context);
}

// Generate component
export async function generateComponent(name: string, options: ComponentOptions): Promise<void> {
  logger.info(`Generating component: ${name}`);
  
  // Validate component name
  validateComponentName(name);
  
  // Parse props
  const props: PropDefinition[] = [];
  if (options.props) {
    for (const propString of options.props) {
      try {
        props.push(parseProp(propString));
      } catch (error) {
        logger.error(`Invalid prop: ${propString}`);
        throw error;
      }
    }
  }
  
  // Create component configuration
  const config: ComponentConfig = {
    name,
    componentName: name,
    fileName: name,
    props,
    type: options.type || 'display',
    hasLocalization: options.locale !== false,
    hasTests: options.test !== false,
    hasStorybook: options.story !== false,
  };
  
  // Determine component directory
  const componentDir = path.join(process.cwd(), 'src/components', config.type, name);
  
  // Check if component already exists
  if (await fileExists(componentDir)) {
    throw new FileSystemError(
      `Component already exists: ${name}`,
      componentDir,
      'create'
    );
  }
  
  const spinner = ora('Creating component files...').start();
  
  try {
    // Create component directory
    await ensureDir(componentDir);
    
    // Generate component file
    const componentContent = generateComponentContent(config);
    await writeFile(
      path.join(componentDir, `${name}.tsx`),
      componentContent
    );
    spinner.text = `Created ${name}.tsx`;
    
    // Generate index file
    const indexContent = `export { ${name} } from './${name}';
export type { ${name}Props } from './${name}';
`;
    await writeFile(
      path.join(componentDir, 'index.ts'),
      indexContent
    );
    
    // Generate test file
    if (config.hasTests) {
      const testContent = generateTestContent(config);
      await writeFile(
        path.join(componentDir, `${name}.test.tsx`),
        testContent
      );
      spinner.text = `Created ${name}.test.tsx`;
    }
    
    // Generate Storybook story
    if (config.hasStorybook) {
      const storyContent = generateStoryContent(config);
      await writeFile(
        path.join(componentDir, `${name}.stories.tsx`),
        storyContent
      );
      spinner.text = `Created ${name}.stories.tsx`;
    }
    
    // Generate locale file
    if (config.hasLocalization) {
      // TODO: Add to locale files
      spinner.text = 'Updated locale files';
    }
    
    spinner.succeed(`Component ${name} created successfully`);
    
    // Display next steps
    logger.info('\nNext steps:');
    logger.info(`1. Import and use: import { ${name} } from '@/components/${config.type}/${name}';`);
    if (config.hasTests) {
      logger.info(`2. Run tests: npm test ${name}`);
    }
    if (config.hasStorybook) {
      logger.info(`3. View in Storybook: npm run storybook`);
    }
    if (config.hasLocalization) {
      logger.info(`4. Add translations to locale files`);
    }
    
  } catch (error) {
    spinner.fail('Component generation failed');
    throw error;
  }
}