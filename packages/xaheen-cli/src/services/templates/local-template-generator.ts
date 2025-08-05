/**
 * Local Template Generator
 * 
 * Generates Hygen/Enquirer-driven templates within generated projects
 * for ad-hoc template creation and management.
 * 
 * @author Xaheen CLI Template System
 * @since 2025-08-05
 */

import fs from 'fs-extra';
import path from 'node:path';
import { consola } from 'consola';
import chalk from 'chalk';
import { select, text, confirm, multiselect } from '@clack/prompts';
import type { BaseTemplate, TemplateSlot } from './template-inheritance.service.js';

export interface LocalTemplateConfig {
  readonly name: string;
  readonly description: string;
  readonly type: 'component' | 'page' | 'service' | 'hook' | 'util';
  readonly prompts: TemplatePrompt[];
  readonly files: TemplateFile[];
  readonly metadata?: {
    readonly tags?: string[];
    readonly author?: string;
    readonly version?: string;
  };
}

export interface TemplatePrompt {
  readonly type: 'input' | 'select' | 'confirm' | 'multiselect';
  readonly name: string;
  readonly message: string;
  readonly default?: any;
  readonly choices?: Array<{ value: string; label: string }>;
  readonly validate?: string;
  readonly when?: string;
}

export interface TemplateFile {
  readonly path: string;
  readonly template: string;
  readonly condition?: string;
  readonly skipIf?: string;
}

export class LocalTemplateGenerator {
  private projectRoot: string;
  private templatesDir: string;
  private hygenDir: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.templatesDir = path.join(projectRoot, '.xaheen/templates');
    this.hygenDir = path.join(projectRoot, '_templates');
  }

  /**
   * Initialize local template system in project
   */
  async initialize(): Promise<void> {
    try {
      // Create directories
      await fs.ensureDir(this.templatesDir);
      await fs.ensureDir(this.hygenDir);

      // Create .hygen.js config
      await this.createHygenConfig();

      // Create initial templates
      await this.createDefaultTemplates();

      // Create template generator
      await this.createTemplateGenerator();

      consola.success('Local template system initialized');
    } catch (error) {
      consola.error('Failed to initialize local template system:', error);
      throw error;
    }
  }

  /**
   * Create Hygen configuration
   */
  private async createHygenConfig(): Promise<void> {
    const hygenConfig = `module.exports = {
  templates: \`\${__dirname}/_templates\`,
  helpers: {
    // Custom helpers
    capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),
    camelCase: (str) => str.replace(/[-_\\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : ''),
    kebabCase: (str) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
    pascalCase: (str) => str.replace(/[-_\\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '').replace(/^./, c => c.toUpperCase()),
    
    // Project-specific helpers
    relativeImport: (from, to) => {
      const relative = path.relative(path.dirname(from), to);
      return relative.startsWith('.') ? relative : './' + relative;
    },
    
    // Xaheen UI System helpers
    semanticComponent: (type) => {
      const mapping = {
        'div': 'Container',
        'span': 'Text',
        'button': 'Button',
        'input': 'Input',
        'form': 'Form'
      };
      return mapping[type] || 'Container';
    },
    
    // TypeScript helpers
    propsInterface: (componentName) => \`\${componentName}Props\`,
    
    // i18n helpers
    i18nKey: (namespace, key) => \`\${namespace}.\${key}\`,
    
    // Accessibility helpers
    ariaLabel: (element, action) => \`\${action} \${element}\`,
    
    // Norwegian compliance helpers
    norwegianDate: () => new Date().toLocaleDateString('nb-NO'),
    nsmClassification: (level) => level || 'OPEN'
  }
};`;

    await fs.writeFile(path.join(this.projectRoot, '.hygen.js'), hygenConfig);
  }

  /**
   * Create default templates
   */
  private async createDefaultTemplates(): Promise<void> {
    // Component template
    await this.createTemplate('component', {
      name: 'component',
      description: 'Generate a new React component with TypeScript',
      type: 'component',
      prompts: [
        {
          type: 'input',
          name: 'name',
          message: 'Component name:',
          validate: '^[A-Z][a-zA-Z0-9]*$'
        },
        {
          type: 'select',
          name: 'type',
          message: 'Component type:',
          choices: [
            { value: 'basic', label: 'Basic Component' },
            { value: 'form', label: 'Form Component' },
            { value: 'layout', label: 'Layout Component' },
            { value: 'data', label: 'Data Component' }
          ]
        },
        {
          type: 'confirm',
          name: 'semantic',
          message: 'Use Xaheen UI System?',
          default: true
        },
        {
          type: 'confirm',
          name: 'tests',
          message: 'Include tests?',
          default: true
        },
        {
          type: 'confirm',
          name: 'stories',
          message: 'Include Storybook stories?',
          default: true
        }
      ],
      files: [
        {
          path: 'src/components/<%= h.pascalCase(name) %>/<%= h.pascalCase(name) %>.tsx',
          template: 'component.tsx.hbs'
        },
        {
          path: 'src/components/<%= h.pascalCase(name) %>/index.ts',
          template: 'component-index.ts.hbs'
        },
        {
          path: 'src/components/<%= h.pascalCase(name) %>/<%= h.pascalCase(name) %>.test.tsx',
          template: 'component.test.tsx.hbs',
          condition: 'tests'
        },
        {
          path: 'src/components/<%= h.pascalCase(name) %>/<%= h.pascalCase(name) %>.stories.tsx',
          template: 'component.stories.tsx.hbs',
          condition: 'stories'
        }
      ]
    });

    // Page template
    await this.createTemplate('page', {
      name: 'page',
      description: 'Generate a new page with routing',
      type: 'page',
      prompts: [
        {
          type: 'input',
          name: 'name',
          message: 'Page name:',
          validate: '^[a-z][a-z0-9-]*$'
        },
        {
          type: 'select',
          name: 'layout',
          message: 'Page layout:',
          choices: [
            { value: 'default', label: 'Default Layout' },
            { value: 'auth', label: 'Auth Layout' },
            { value: 'admin', label: 'Admin Layout' },
            { value: 'none', label: 'No Layout' }
          ]
        },
        {
          type: 'confirm',
          name: 'auth',
          message: 'Requires authentication?',
          default: false
        }
      ],
      files: [
        {
          path: 'src/pages/<%= h.kebabCase(name) %>/page.tsx',
          template: 'page.tsx.hbs'
        },
        {
          path: 'src/pages/<%= h.kebabCase(name) %>/layout.tsx',
          template: 'page-layout.tsx.hbs',
          condition: "layout !== 'none'"
        }
      ]
    });

    // Service template
    await this.createTemplate('service', {
      name: 'service',
      description: 'Generate a new service with TypeScript',
      type: 'service',
      prompts: [
        {
          type: 'input',
          name: 'name',
          message: 'Service name:',
          validate: '^[A-Z][a-zA-Z0-9]*$'
        },
        {
          type: 'multiselect',
          name: 'features',
          message: 'Service features:',
          choices: [
            { value: 'api', label: 'API integration' },
            { value: 'cache', label: 'Caching support' },
            { value: 'retry', label: 'Retry logic' },
            { value: 'logging', label: 'Advanced logging' }
          ]
        }
      ],
      files: [
        {
          path: 'src/services/<%= h.kebabCase(name) %>/<%= h.kebabCase(name) %>.service.ts',
          template: 'service.ts.hbs'
        },
        {
          path: 'src/services/<%= h.kebabCase(name) %>/<%= h.kebabCase(name) %>.types.ts',
          template: 'service-types.ts.hbs'
        },
        {
          path: 'src/services/<%= h.kebabCase(name) %>/<%= h.kebabCase(name) %>.test.ts',
          template: 'service.test.ts.hbs'
        }
      ]
    });

    // Hook template
    await this.createTemplate('hook', {
      name: 'hook',
      description: 'Generate a new React hook',
      type: 'hook',
      prompts: [
        {
          type: 'input',
          name: 'name',
          message: 'Hook name (without "use" prefix):',
          validate: '^[A-Z][a-zA-Z0-9]*$'
        },
        {
          type: 'select',
          name: 'category',
          message: 'Hook category:',
          choices: [
            { value: 'state', label: 'State Management' },
            { value: 'effect', label: 'Side Effects' },
            { value: 'data', label: 'Data Fetching' },
            { value: 'ui', label: 'UI/UX' }
          ]
        }
      ],
      files: [
        {
          path: 'src/hooks/use<%= h.pascalCase(name) %>.ts',
          template: 'hook.ts.hbs'
        },
        {
          path: 'src/hooks/use<%= h.pascalCase(name) %>.test.ts',
          template: 'hook.test.ts.hbs'
        }
      ]
    });
  }

  /**
   * Create template generator template
   */
  private async createTemplateGenerator(): Promise<void> {
    const generatorTemplate: LocalTemplateConfig = {
      name: 'template',
      description: 'Generate a new local template',
      type: 'util',
      prompts: [
        {
          type: 'input',
          name: 'name',
          message: 'Template name:'
        },
        {
          type: 'input',
          name: 'description',
          message: 'Template description:'
        },
        {
          type: 'select',
          name: 'type',
          message: 'Template type:',
          choices: [
            { value: 'component', label: 'Component' },
            { value: 'page', label: 'Page' },
            { value: 'service', label: 'Service' },
            { value: 'hook', label: 'Hook' },
            { value: 'util', label: 'Utility' }
          ]
        }
      ],
      files: [
        {
          path: '_templates/<%= h.kebabCase(name) %>/new/prompt.js',
          template: 'template-prompt.js.hbs'
        },
        {
          path: '_templates/<%= h.kebabCase(name) %>/new/component.tsx.ejs',
          template: 'template-component.ejs.hbs',
          condition: "type === 'component'"
        },
        {
          path: '_templates/<%= h.kebabCase(name) %>/new/index.js',
          template: 'template-index.js.hbs'
        }
      ]
    };

    await this.createTemplate('template', generatorTemplate);
  }

  /**
   * Create a local template
   */
  async createTemplate(name: string, config: LocalTemplateConfig): Promise<void> {
    const templateDir = path.join(this.hygenDir, name, 'new');
    await fs.ensureDir(templateDir);

    // Create prompt file
    const promptContent = this.generatePromptFile(config);
    await fs.writeFile(path.join(templateDir, 'prompt.js'), promptContent);

    // Create template files
    for (const file of config.files) {
      const templateContent = await this.generateTemplateFile(file, config);
      const fileName = path.basename(file.template, '.hbs') + '.ejs';
      await fs.writeFile(path.join(templateDir, fileName), templateContent);
    }

    // Save config
    const configPath = path.join(this.templatesDir, `${name}.json`);
    await fs.writeJson(configPath, config, { spaces: 2 });

    consola.success(`Created local template: ${chalk.cyan(name)}`);
  }

  /**
   * Generate prompt file for Hygen
   */
  private generatePromptFile(config: LocalTemplateConfig): string {
    const prompts = config.prompts.map(prompt => {
      const basePrompt = {
        type: prompt.type,
        name: prompt.name,
        message: prompt.message
      };

      if (prompt.default !== undefined) {
        basePrompt['initial'] = prompt.default;
      }

      if (prompt.choices) {
        basePrompt['choices'] = prompt.choices;
      }

      if (prompt.validate) {
        basePrompt['validate'] = `(value) => new RegExp('${prompt.validate}').test(value) ? true : 'Invalid format'`;
      }

      return basePrompt;
    });

    return `module.exports = {
  prompt: ({ inquirer }) => {
    const questions = ${JSON.stringify(prompts, null, 2)};
    
    return inquirer.prompt(questions);
  }
};`;
  }

  /**
   * Generate template file content
   */
  private async generateTemplateFile(file: TemplateFile, config: LocalTemplateConfig): Promise<string> {
    // Load base template content
    let templateContent = '';
    
    if (config.type === 'component') {
      templateContent = await this.getComponentTemplate(file.template);
    } else if (config.type === 'page') {
      templateContent = await this.getPageTemplate(file.template);
    } else if (config.type === 'service') {
      templateContent = await this.getServiceTemplate(file.template);
    } else if (config.type === 'hook') {
      templateContent = await this.getHookTemplate(file.template);
    } else {
      templateContent = await this.getUtilTemplate(file.template);
    }

    // Convert Handlebars to EJS syntax
    return this.convertHandlebarsToEjs(templateContent);
  }

  /**
   * Convert Handlebars syntax to EJS
   */
  private convertHandlebarsToEjs(content: string): string {
    // Replace Handlebars helpers with EJS
    return content
      .replace(/\{\{/g, '<%=')
      .replace(/\}\}/g, '%>')
      .replace(/\{\{#if (.*?)\}\}/g, '<% if ($1) { %>')
      .replace(/\{\{#unless (.*?)\}\}/g, '<% if (!$1) { %>')
      .replace(/\{\{else\}\}/g, '<% } else { %>')
      .replace(/\{\{\/if\}\}/g, '<% } %>')
      .replace(/\{\{\/unless\}\}/g, '<% } %>')
      .replace(/\{\{#each (.*?)\}\}/g, '<% $1.forEach(function(item) { %>')
      .replace(/\{\{\/each\}\}/g, '<% }); %>');
  }

  /**
   * Get component template content
   */
  private async getComponentTemplate(templateName: string): Promise<string> {
    const templates = {
      'component.tsx.hbs': `---
to: <%= path %>
---
import React from 'react';
<% if (semantic) { %>
import { Container, Stack, Text, Button } from '@xala-technologies/ui-system';
<% } %>

interface <%= h.pascalCase(name) %>Props {
  readonly title?: string;
  readonly description?: string;
  readonly onClick?: () => void;
}

export const <%= h.pascalCase(name) %> = ({
  title,
  description,
  onClick
}: <%= h.pascalCase(name) %>Props): JSX.Element => {
  return (
    <% if (semantic) { %>
    <Container className="p-6 rounded-xl shadow-lg">
      <Stack gap="lg">
        {title && <Text variant="h2">{title}</Text>}
        {description && <Text variant="body">{description}</Text>}
        {onClick && (
          <Button onClick={onClick} variant="primary">
            Click me
          </Button>
        )}
      </Stack>
    </Container>
    <% } else { %>
    <div className="p-6 bg-white rounded-xl shadow-lg">
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      {onClick && (
        <button
          onClick={onClick}
          className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Click me
        </button>
      )}
    </div>
    <% } %>
  );
};`,
      'component-index.ts.hbs': `---
to: <%= path %>
---
export { <%= h.pascalCase(name) %> } from './<%= h.pascalCase(name) %>';`,
      'component.test.tsx.hbs': `---
to: <%= path %>
---
import { render, screen, fireEvent } from '@testing-library/react';
import { <%= h.pascalCase(name) %> } from './<%= h.pascalCase(name) %>';

describe('<%= h.pascalCase(name) %>', () => {
  it('renders without crashing', () => {
    render(<<%= h.pascalCase(name) %> />);
  });

  it('displays title when provided', () => {
    const title = 'Test Title';
    render(<<%= h.pascalCase(name) %> title={title} />);
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<<%= h.pascalCase(name) %> onClick={handleClick} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});`,
      'component.stories.tsx.hbs': `---
to: <%= path %>
---
import type { Meta, StoryObj } from '@storybook/react';
import { <%= h.pascalCase(name) %> } from './<%= h.pascalCase(name) %>';

const meta: Meta<typeof <%= h.pascalCase(name) %>> = {
  title: 'Components/<%= h.pascalCase(name) %>',
  component: <%= h.pascalCase(name) %>,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Hello World',
    description: 'This is a <%= name %> component',
  },
};

export const WithoutDescription: Story = {
  args: {
    title: 'Title Only',
  },
};

export const Clickable: Story = {
  args: {
    title: 'Click Me',
    description: 'This component has a click handler',
    onClick: () => console.log('Clicked!'),
  },
};`
    };

    return templates[templateName] || '';
  }

  /**
   * Get page template content
   */
  private async getPageTemplate(templateName: string): Promise<string> {
    const templates = {
      'page.tsx.hbs': `---
to: <%= path %>
---
import React from 'react';
<% if (layout !== 'none') { %>
import { <%= h.pascalCase(layout) %>Layout } from '@/layouts/<%= h.pascalCase(layout) %>Layout';
<% } %>
<% if (auth) { %>
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
<% } %>

export default function <%= h.pascalCase(name) %>Page(): JSX.Element {
  <% if (auth) { %>
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  <% } %>
  
  const content = (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6"><%= h.capitalize(name) %></h1>
      <p className="text-gray-600">Welcome to the <%= name %> page!</p>
    </div>
  );
  
  <% if (layout !== 'none') { %>
  return <<%= h.pascalCase(layout) %>Layout>{content}</<%= h.pascalCase(layout) %>Layout>;
  <% } else { %>
  return content;
  <% } %>
}`,
      'page-layout.tsx.hbs': `---
to: <%= path %>
---
import React from 'react';

export default function <%= h.pascalCase(name) %>Layout({
  children
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add layout-specific elements here */}
      {children}
    </div>
  );
}`
    };

    return templates[templateName] || '';
  }

  /**
   * Get service template content
   */
  private async getServiceTemplate(templateName: string): Promise<string> {
    const templates = {
      'service.ts.hbs': `---
to: <%= path %>
---
import type { <%= h.pascalCase(name) %>Config, <%= h.pascalCase(name) %>Response } from './<%= h.kebabCase(name) %>.types';
<% if (features.includes('logging')) { %>
import { logger } from '@/utils/logger';
<% } %>
<% if (features.includes('cache')) { %>
import { cache } from '@/utils/cache';
<% } %>

export class <%= h.pascalCase(name) %>Service {
  private config: <%= h.pascalCase(name) %>Config;
  
  constructor(config: <%= h.pascalCase(name) %>Config) {
    this.config = config;
  }
  
  <% if (features.includes('api')) { %>
  async fetch(endpoint: string): Promise<<%= h.pascalCase(name) %>Response> {
    <% if (features.includes('cache')) { %>
    const cached = await cache.get(\`<%= h.kebabCase(name) %>:\${endpoint}\`);
    if (cached) return cached;
    <% } %>
    
    try {
      const response = await fetch(\`\${this.config.baseUrl}/\${endpoint}\`, {
        headers: this.config.headers,
        <% if (features.includes('retry')) { %>
        retry: this.config.retryConfig,
        <% } %>
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      
      const data = await response.json();
      
      <% if (features.includes('cache')) { %>
      await cache.set(\`<%= h.kebabCase(name) %>:\${endpoint}\`, data, this.config.cacheTimeout);
      <% } %>
      
      return data;
    } catch (error) {
      <% if (features.includes('logging')) { %>
      logger.error('Failed to fetch from <%= name %> service:', error);
      <% } %>
      throw error;
    }
  }
  <% } %>
}

// Singleton instance
export const <%= h.camelCase(name) %>Service = new <%= h.pascalCase(name) %>Service({
  baseUrl: process.env.<%= h.constantCase(name) %>_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  <% if (features.includes('cache')) { %>
  cacheTimeout: 3600, // 1 hour
  <% } %>
  <% if (features.includes('retry')) { %>
  retryConfig: {
    retries: 3,
    retryDelay: 1000,
  },
  <% } %>
});`,
      'service-types.ts.hbs': `---
to: <%= path %>
---
export interface <%= h.pascalCase(name) %>Config {
  readonly baseUrl: string;
  readonly headers?: Record<string, string>;
  <% if (features.includes('cache')) { %>
  readonly cacheTimeout?: number;
  <% } %>
  <% if (features.includes('retry')) { %>
  readonly retryConfig?: {
    readonly retries: number;
    readonly retryDelay: number;
  };
  <% } %>
}

export interface <%= h.pascalCase(name) %>Response {
  readonly success: boolean;
  readonly data?: any;
  readonly error?: string;
}`,
      'service.test.ts.hbs': `---
to: <%= path %>
---
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { <%= h.pascalCase(name) %>Service } from './<%= h.kebabCase(name) %>.service';

describe('<%= h.pascalCase(name) %>Service', () => {
  let service: <%= h.pascalCase(name) %>Service;
  
  beforeEach(() => {
    service = new <%= h.pascalCase(name) %>Service({
      baseUrl: 'https://api.example.com',
    });
  });
  
  it('should initialize correctly', () => {
    expect(service).toBeDefined();
  });
  
  <% if (features.includes('api')) { %>
  it('should fetch data successfully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: 'test' }),
    });
    
    const result = await service.fetch('test-endpoint');
    
    expect(result).toEqual({ success: true, data: 'test' });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/test-endpoint',
      expect.any(Object)
    );
  });
  <% } %>
});`
    };

    return templates[templateName] || '';
  }

  /**
   * Get hook template content
   */
  private async getHookTemplate(templateName: string): Promise<string> {
    const templates = {
      'hook.ts.hbs': `---
to: <%= path %>
---
import { useState, useEffect, useCallback } from 'react';

export interface Use<%= h.pascalCase(name) %>Options {
  readonly initialValue?: any;
  readonly onUpdate?: (value: any) => void;
}

export interface Use<%= h.pascalCase(name) %>Return {
  readonly value: any;
  readonly setValue: (value: any) => void;
  readonly reset: () => void;
  readonly loading: boolean;
  readonly error: Error | null;
}

export function use<%= h.pascalCase(name) %>(
  options: Use<%= h.pascalCase(name) %>Options = {}
): Use<%= h.pascalCase(name) %>Return {
  const { initialValue, onUpdate } = options;
  
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const handleSetValue = useCallback((newValue: any) => {
    setValue(newValue);
    onUpdate?.(newValue);
  }, [onUpdate]);
  
  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
  }, [initialValue]);
  
  <% if (category === 'effect') { %>
  useEffect(() => {
    // Add side effect logic here
    return () => {
      // Cleanup
    };
  }, [value]);
  <% } %>
  
  <% if (category === 'data') { %>
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch data logic here
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  <% } %>
  
  return {
    value,
    setValue: handleSetValue,
    reset,
    loading,
    error,
  };
}`,
      'hook.test.ts.hbs': `---
to: <%= path %>
---
import { renderHook, act } from '@testing-library/react';
import { use<%= h.pascalCase(name) %> } from './use<%= h.pascalCase(name) %>';

describe('use<%= h.pascalCase(name) %>', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => use<%= h.pascalCase(name) %>());
    
    expect(result.current.value).toBeUndefined();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
  
  it('should initialize with provided initial value', () => {
    const initialValue = 'test';
    const { result } = renderHook(() => 
      use<%= h.pascalCase(name) %>({ initialValue })
    );
    
    expect(result.current.value).toBe(initialValue);
  });
  
  it('should update value correctly', () => {
    const { result } = renderHook(() => use<%= h.pascalCase(name) %>());
    
    act(() => {
      result.current.setValue('new value');
    });
    
    expect(result.current.value).toBe('new value');
  });
  
  it('should reset to initial value', () => {
    const initialValue = 'initial';
    const { result } = renderHook(() => 
      use<%= h.pascalCase(name) %>({ initialValue })
    );
    
    act(() => {
      result.current.setValue('changed');
    });
    
    expect(result.current.value).toBe('changed');
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.value).toBe(initialValue);
  });
  
  it('should call onUpdate callback', () => {
    const onUpdate = vi.fn();
    const { result } = renderHook(() => 
      use<%= h.pascalCase(name) %>({ onUpdate })
    );
    
    act(() => {
      result.current.setValue('test');
    });
    
    expect(onUpdate).toHaveBeenCalledWith('test');
  });
});`
    };

    return templates[templateName] || '';
  }

  /**
   * Get utility template content
   */
  private async getUtilTemplate(templateName: string): Promise<string> {
    return `---
to: <%= path %>
---
/**
 * <%= h.capitalize(name) %> Utility
 * 
 * <%= description %>
 */

export function <%= h.camelCase(name) %>(): void {
  // Implementation here
}`;
  }

  /**
   * List available local templates
   */
  async listTemplates(): Promise<LocalTemplateConfig[]> {
    const templates: LocalTemplateConfig[] = [];
    
    if (await fs.pathExists(this.templatesDir)) {
      const files = await fs.readdir(this.templatesDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const config = await fs.readJson(path.join(this.templatesDir, file));
          templates.push(config);
        }
      }
    }
    
    return templates;
  }

  /**
   * Run local template generator
   */
  async runTemplate(templateName: string, args: Record<string, any> = {}): Promise<void> {
    const configPath = path.join(this.templatesDir, `${templateName}.json`);
    
    if (!await fs.pathExists(configPath)) {
      throw new Error(`Template '${templateName}' not found`);
    }
    
    const config: LocalTemplateConfig = await fs.readJson(configPath);
    
    // Collect prompts if not provided in args
    const answers = { ...args };
    
    for (const prompt of config.prompts) {
      if (!(prompt.name in answers)) {
        const answer = await this.collectPromptAnswer(prompt);
        answers[prompt.name] = answer;
      }
    }
    
    // Generate files
    for (const file of config.files) {
      // Check condition
      if (file.condition && !this.evaluateCondition(file.condition, answers)) {
        continue;
      }
      
      // Check skipIf
      if (file.skipIf && this.evaluateCondition(file.skipIf, answers)) {
        continue;
      }
      
      // Generate file
      const filePath = this.resolveFilePath(file.path, answers);
      const content = await this.generateFileContent(file.template, answers);
      
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content);
      
      consola.success(`Generated: ${chalk.green(filePath)}`);
    }
  }

  /**
   * Collect prompt answer
   */
  private async collectPromptAnswer(prompt: TemplatePrompt): Promise<any> {
    switch (prompt.type) {
      case 'input':
        return await text({
          message: prompt.message,
          defaultValue: prompt.default,
          validate: prompt.validate ? 
            (value) => new RegExp(prompt.validate!).test(value) ? undefined : 'Invalid format' :
            undefined
        });
        
      case 'select':
        return await select({
          message: prompt.message,
          options: prompt.choices!.map(c => ({ value: c.value, label: c.label }))
        });
        
      case 'confirm':
        return await confirm({
          message: prompt.message,
          initialValue: prompt.default
        });
        
      case 'multiselect':
        return await multiselect({
          message: prompt.message,
          options: prompt.choices!.map(c => ({ value: c.value, label: c.label }))
        });
        
      default:
        throw new Error(`Unknown prompt type: ${prompt.type}`);
    }
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(condition: string, context: Record<string, any>): boolean {
    try {
      const func = new Function('context', `with(context) { return ${condition}; }`);
      return func(context);
    } catch (error) {
      consola.warn(`Failed to evaluate condition '${condition}':`, error);
      return false;
    }
  }

  /**
   * Resolve file path with variables
   */
  private resolveFilePath(pathTemplate: string, context: Record<string, any>): string {
    return pathTemplate.replace(/<%= (.*?) %>/g, (_, expression) => {
      const func = new Function('h', 'context', `with(context) { return ${expression}; }`);
      return func(this.getHelpers(), context);
    });
  }

  /**
   * Generate file content
   */
  private async generateFileContent(templateName: string, context: Record<string, any>): Promise<string> {
    const template = await this.getComponentTemplate(templateName);
    const compiled = Handlebars.compile(template);
    return compiled(context);
  }

  /**
   * Get template helpers
   */
  private getHelpers() {
    return {
      capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
      camelCase: (str: string) => str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : ''),
      kebabCase: (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
      pascalCase: (str: string) => str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '').replace(/^./, c => c.toUpperCase()),
      constantCase: (str: string) => str.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()
    };
  }
}