/**
 * Refactored Component Generator
 * Single Responsibility: Generates React/Vue/Angular components
 * Follows Open/Closed Principle: Extensible through composition
 */

import type {
  ILogger,
  IFileSystem,
  INamingService,
  IProjectAnalyzer,
  GeneratorResult,
} from '../../core/interfaces/index.js';
import { BaseGenerator } from "../../core/generators/base-generator.refactored";
import type { ITemplateEngine } from "../../core/interfaces/index";

export interface ComponentGeneratorOptions {
  readonly name: string;
  readonly framework: 'react' | 'vue' | 'angular' | 'svelte';
  readonly type: 'functional' | 'class';
  readonly styling: 'tailwind' | 'styled-components' | 'css-modules';
  readonly props?: readonly string[];
  readonly hooks?: boolean;
  readonly stories?: boolean;
  readonly tests?: boolean;
  readonly dryRun?: boolean;
  readonly force?: boolean;
  readonly typescript?: boolean;
  readonly semanticUI?: boolean;
  readonly i18n?: boolean;
  readonly designTokens?: boolean;
}

export class ComponentGenerator extends BaseGenerator<ComponentGeneratorOptions> {
  private readonly templateStrategies: Map<string, IComponentTemplateStrategy>;

  constructor(
    logger: ILogger,
    fileSystem: IFileSystem,
    namingService: INamingService,
    projectAnalyzer: IProjectAnalyzer,
    private readonly templateEngine: ITemplateEngine
  ) {
    super(logger, fileSystem, namingService, projectAnalyzer);
    this.templateStrategies = this.initializeTemplateStrategies();
  }

  public getType(): string {
    return 'component';
  }

  public async generate(options: ComponentGeneratorOptions): Promise<GeneratorResult> {
    try {
      await this.validate(options);
      
      const templateData = await this.buildTemplateData(options);
      const strategy = this.getTemplateStrategy(options.framework);
      const files: string[] = [];

      // Generate main component file
      const mainFile = await this.generateMainComponent(options, templateData, strategy);
      files.push(mainFile);

      // Generate test file if requested
      if (options.tests) {
        const testFile = await this.generateTestFile(options, templateData, strategy);
        files.push(testFile);
      }

      // Generate story file if requested
      if (options.stories) {
        const storyFile = await this.generateStoryFile(options, templateData, strategy);
        files.push(storyFile);
      }

      return {
        success: true,
        message: `Component ${options.name} generated successfully`,
        files,
        nextSteps: this.getNextSteps(options),
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate component: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  protected async validateOptions(options: ComponentGeneratorOptions): Promise<void> {
    const supportedFrameworks = ['react', 'vue', 'angular', 'svelte'];
    if (!supportedFrameworks.includes(options.framework)) {
      throw new Error(`Unsupported framework: ${options.framework}`);
    }

    if (options.type === 'class' && options.framework !== 'react') {
      throw new Error('Class components are only supported in React');
    }

    if (options.props) {
      for (const prop of options.props) {
        if (!prop.includes(':')) {
          throw new Error(`Invalid prop format: ${prop}. Expected format: 'name:type'`);
        }
      }
    }
  }

  protected async buildTemplateData(options: ComponentGeneratorOptions): Promise<ComponentTemplateData> {
    const naming = this.namingService.getNamingConvention(options.name);
    const projectStructure = await this.projectAnalyzer.detectStructure();
    
    return {
      ...naming,
      framework: options.framework,
      type: options.type,
      styling: options.styling,
      props: this.parseProps(options.props || []),
      hooks: options.hooks ?? true,
      typescript: options.typescript ?? projectStructure.usesTypeScript,
      semanticUI: options.semanticUI ?? true,
      i18n: options.i18n ?? true,
      designTokens: options.designTokens ?? true,
      imports: this.buildImports(options),
      timestamp: new Date().toISOString(),
    };
  }

  private initializeTemplateStrategies(): Map<string, IComponentTemplateStrategy> {
    return new Map([
      ['react', new ReactTemplateStrategy(this.templateEngine)],
      ['vue', new VueTemplateStrategy(this.templateEngine)], 
      ['angular', new AngularTemplateStrategy(this.templateEngine)],
      ['svelte', new SvelteTemplateStrategy(this.templateEngine)],
    ]);
  }

  private getTemplateStrategy(framework: string): IComponentTemplateStrategy {
    const strategy = this.templateStrategies.get(framework);
    if (!strategy) {
      throw new Error(`No template strategy found for framework: ${framework}`);
    }
    return strategy;
  }

  private async generateMainComponent(
    options: ComponentGeneratorOptions,
    templateData: ComponentTemplateData,
    strategy: IComponentTemplateStrategy
  ): Promise<string> {
    const placement = this.getFilePlacement('component', options.name);
    const content = await strategy.generateComponent(templateData);
    
    await this.generateFile(
      '', // Template path not needed with strategy
      placement.filePath,
      content,
      { dryRun: options.dryRun, force: options.force }
    );

    return placement.filePath;
  }

  private async generateTestFile(
    options: ComponentGeneratorOptions,
    templateData: ComponentTemplateData,
    strategy: IComponentTemplateStrategy
  ): Promise<string> {
    const placement = this.getFilePlacement('component', options.name);
    if (!placement.testPath) {
      throw new Error('Test path not defined for component');
    }

    const content = await strategy.generateTest(templateData);
    
    await this.generateFile(
      '',
      placement.testPath,
      content,
      { dryRun: options.dryRun, force: options.force }
    );

    return placement.testPath;
  }

  private async generateStoryFile(
    options: ComponentGeneratorOptions,
    templateData: ComponentTemplateData,
    strategy: IComponentTemplateStrategy
  ): Promise<string> {
    const placement = this.getFilePlacement('component', options.name);
    if (!placement.storyPath) {
      throw new Error('Story path not defined for component');
    }

    const content = await strategy.generateStory(templateData);
    
    await this.generateFile(
      '',
      placement.storyPath,
      content,
      { dryRun: options.dryRun, force: options.force }
    );

    return placement.storyPath;
  }

  private parseProps(props: readonly string[]): ComponentProp[] {
    return props.map(prop => {
      const [name, type] = prop.split(':');
      return { name: name.trim(), type: type.trim() };
    });
  }

  private buildImports(options: ComponentGeneratorOptions): ComponentImports {
    const imports: ComponentImports = {
      react: options.framework === 'react' && options.hooks ? 
        "import React, { useState, useCallback } from 'react';" : 
        "import React from 'react';",
      semanticUI: options.semanticUI ? 
        "import { Container, Stack, Text, Button } from '@xala/ui-system';" : '',
      designTokens: options.designTokens ? 
        "import { spacing, colors, typography } from '@xala/design-tokens';" : '',
      i18n: options.i18n ? 
        "import { useTranslation } from '@xala/i18n';" : '',
    };

    return imports;
  }

  private getNextSteps(options: ComponentGeneratorOptions): string[] {
    const steps = [
      `Import ${options.name} component in your parent component`,
      'Add component to your UI library if using one',
    ];

    if (options.stories) {
      steps.push('Review generated Storybook stories');
    }

    if (options.tests) {
      steps.push('Run tests to ensure component works correctly');
    }

    return steps;
  }
}

// Strategy Pattern for framework-specific generation
interface IComponentTemplateStrategy {
  generateComponent(data: ComponentTemplateData): Promise<string>;
  generateTest(data: ComponentTemplateData): Promise<string>;
  generateStory(data: ComponentTemplateData): Promise<string>;
}

interface ComponentTemplateData {
  readonly className: string;
  readonly fileName: string;
  readonly variableName: string;
  readonly framework: string;
  readonly type: string;
  readonly styling: string;
  readonly props: readonly ComponentProp[];
  readonly hooks: boolean;
  readonly typescript: boolean;
  readonly semanticUI: boolean;
  readonly i18n: boolean;
  readonly designTokens: boolean;
  readonly imports: ComponentImports;
  readonly timestamp: string;
}

interface ComponentProp {
  readonly name: string;
  readonly type: string;
}

interface ComponentImports {
  readonly react: string;
  readonly semanticUI: string;
  readonly designTokens: string;
  readonly i18n: string;
}

// Framework-specific template strategies
class ReactTemplateStrategy implements IComponentTemplateStrategy {
  constructor(private readonly templateEngine: ITemplateEngine) {}

  async generateComponent(data: ComponentTemplateData): Promise<string> {
    const template = `
${data.imports.react}
${data.imports.semanticUI}
${data.imports.designTokens}
${data.imports.i18n}

${data.typescript ? `
interface ${data.className}Props {
  ${data.props.map(prop => `readonly ${prop.name}: ${prop.type};`).join('\n  ')}
}

export const ${data.className} = ({
  ${data.props.map(prop => prop.name).join(',\n  ')}
}: ${data.className}Props): JSX.Element => {
` : `
export const ${data.className} = ({
  ${data.props.map(prop => prop.name).join(',\n  ')}
}) => {
`}
  ${data.i18n ? "const { t } = useTranslation();" : ""}
  
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">{/* Component content */}</h2>
    </div>
  );
};
    `.trim();

    return template;
  }

  async generateTest(data: ComponentTemplateData): Promise<string> {
    return `
import { render, screen } from '@testing-library/react';
import { ${data.className} } from '../${data.className}';

describe('${data.className}', () => {
  it('renders successfully', () => {
    render(<${data.className} />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
    `.trim();
  }

  async generateStory(data: ComponentTemplateData): Promise<string> {
    return `
import type { Meta, StoryObj } from '@storybook/react';
import { ${data.className} } from './${data.className}';

const meta: Meta<typeof ${data.className}> = {
  title: 'Components/${data.className}',
  component: ${data.className},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
    `.trim();
  }
}

class VueTemplateStrategy implements IComponentTemplateStrategy {
  constructor(private readonly templateEngine: ITemplateEngine) {}

  async generateComponent(data: ComponentTemplateData): Promise<string> {
    return `<template>
  <div class="p-6 bg-white rounded-xl shadow-lg">
    <h2 class="text-2xl font-bold mb-4">{{ title }}</h2>
  </div>
</template>

<script setup ${data.typescript ? 'lang="ts"' : ''}>
${data.typescript ? `
interface Props {
  ${data.props.map(prop => `${prop.name}: ${prop.type};`).join('\n  ')}
}

const props = defineProps<Props>();
` : `
const props = defineProps({
  ${data.props.map(prop => `${prop.name}: ${prop.type}`).join(',\n  ')}
});
`}
</script>`;
  }

  async generateTest(data: ComponentTemplateData): Promise<string> {
    return `
import { mount } from '@vue/test-utils';
import ${data.className} from './${data.className}.vue';

describe('${data.className}', () => {
  it('renders properly', () => {
    const wrapper = mount(${data.className});
    expect(wrapper.text()).toContain('Hello');
  });
});
    `.trim();
  }

  async generateStory(data: ComponentTemplateData): Promise<string> {
    return `
import ${data.className} from './${data.className}.vue';

export default {
  title: 'Components/${data.className}',
  component: ${data.className},
};

export const Default = {
  args: {},
};
    `.trim();
  }
}

class AngularTemplateStrategy implements IComponentTemplateStrategy {
  constructor(private readonly templateEngine: ITemplateEngine) {}

  async generateComponent(data: ComponentTemplateData): Promise<string> {
    return `
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-${data.kebabCase}',
  template: \`
    <div class="p-6 bg-white rounded-xl shadow-lg">
      <h2 class="text-2xl font-bold mb-4">{{ title }}</h2>
    </div>
  \`,
})
export class ${data.className}Component {
  ${data.props.map(prop => `@Input() ${prop.name}!: ${prop.type};`).join('\n  ')}
}
    `.trim();
  }

  async generateTest(data: ComponentTemplateData): Promise<string> {
    return `
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ${data.className}Component } from './${data.kebabCase}.component';

describe('${data.className}Component', () => {
  let component: ${data.className}Component;
  let fixture: ComponentFixture<${data.className}Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [${data.className}Component]
    });
    fixture = TestBed.createComponent(${data.className}Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
    `.trim();
  }

  async generateStory(data: ComponentTemplateData): Promise<string> {
    return `
import { Meta, StoryObj } from '@storybook/angular';
import { ${data.className}Component } from './${data.kebabCase}.component';

const meta: Meta<${data.className}Component> = {
  title: 'Components/${data.className}',
  component: ${data.className}Component,
};

export default meta;
type Story = StoryObj<${data.className}Component>;

export const Default: Story = {
  args: {},
};
    `.trim();
  }
}

class SvelteTemplateStrategy implements IComponentTemplateStrategy {
  constructor(private readonly templateEngine: ITemplateEngine) {}

  async generateComponent(data: ComponentTemplateData): Promise<string> {
    return `<script ${data.typescript ? 'lang="ts"' : ''}>
  ${data.props.map(prop => `export let ${prop.name}: ${prop.type};`).join('\n  ')}
</script>

<div class="p-6 bg-white rounded-xl shadow-lg">
  <h2 class="text-2xl font-bold mb-4">{title}</h2>
</div>`;
  }

  async generateTest(data: ComponentTemplateData): Promise<string> {
    return `
import { render } from '@testing-library/svelte';
import ${data.className} from './${data.className}.svelte';

test('renders component', () => {
  const { getByRole } = render(${data.className});
  expect(getByRole('heading')).toBeInTheDocument();
});
    `.trim();
  }

  async generateStory(data: ComponentTemplateData): Promise<string> {
    return `
import ${data.className} from './${data.className}.svelte';

export default {
  title: 'Components/${data.className}',
  component: ${data.className},
};

export const Default = {
  args: {},
};
    `.trim();
  }
}