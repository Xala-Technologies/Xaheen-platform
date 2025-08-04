/**
 * Component Generator - React/Vue component generation with UI System integration
 *
 * Generates frontend components with Xala UI System integration and AI-powered content
 *
 * @author Xaheen CLI Generator System
 * @since 2025-08-04
 */

import { BaseGenerator, BaseGeneratorOptions, GeneratorResult } from './base.generator.js';
import Handlebars from 'handlebars';

// Register Handlebars helpers
Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('camelCase', (str: string) => {
	return str.charAt(0).toLowerCase() + str.slice(1).replace(/[-_](.)/g, (_, char) => char.toUpperCase());
});
Handlebars.registerHelper('generatedAt', () => new Date().toISOString());
import chalk from 'chalk';
import { select, text, confirm, multiselect, isCancel } from '@clack/prompts';

export interface ComponentGeneratorOptions extends BaseGeneratorOptions {
	readonly name: string;
	readonly type?: 'functional' | 'class';
	readonly framework?: 'react' | 'vue' | 'angular' | 'svelte';
	readonly styling?: 'tailwind' | 'styled-components' | 'css-modules';
	readonly props?: string[];
	readonly hooks?: boolean;
	readonly stories?: boolean;
	readonly tests?: boolean;
	readonly ai?: string;
	readonly dryRun?: boolean;
	readonly force?: boolean;
	readonly typescript?: boolean;
}

export class ComponentGenerator extends BaseGenerator<ComponentGeneratorOptions> {
	private readonly componentTypes = [
		{ value: 'functional', label: 'Functional Component', hint: 'Modern React functional component with hooks' },
		{ value: 'class', label: 'Class Component', hint: 'Traditional React class component' },
	];

	private readonly frameworks = [
		{ value: 'react', label: 'React', hint: 'React with TypeScript/JavaScript' },
		{ value: 'vue', label: 'Vue.js', hint: 'Vue 3 with Composition API' },
		{ value: 'angular', label: 'Angular', hint: 'Angular with TypeScript' },
		{ value: 'svelte', label: 'Svelte', hint: 'Svelte with TypeScript support' },
	];

	async generate(options: ComponentGeneratorOptions): Promise<void> {
		await this.validateOptions(options);

		this.logger.info(`Generating component: ${chalk.cyan(options.name)}`);

		// Detect framework if not specified
		const framework = options.framework || await this.detectFramework();

		// Generate component data
		const componentData = {
			name: options.name,
			className: this.toPascalCase(options.name),
			type: options.type || 'functional',
			framework,
			styling: options.styling || 'tailwind',
			props: await this.parseProps(options.props || []),
			hooks: options.hooks !== false,
			stories: options.stories !== false,
			tests: options.tests !== false,
			ai: options.ai,
			typescript: options.typescript !== false,
		};

		// Generate component file based on framework
		await this.generateComponent(componentData, options);

		// Generate Storybook stories
		if (options.stories) {
			await this.generateStories(componentData, options);
		}

		// Generate tests
		if (options.tests) {
			await this.generateTests(componentData, options);
		}

		this.logger.success(`Component ${chalk.green(options.name)} generated successfully!`);
	}

	private async detectFramework(): Promise<'react' | 'vue' | 'angular' | 'svelte'> {
		try {
			const packageJsonPath = path.join(process.cwd(), 'package.json');
			const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
			const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

			if (dependencies['@angular/core']) return 'angular';
			if (dependencies['vue']) return 'vue';
			if (dependencies['svelte']) return 'svelte';
			if (dependencies['react']) return 'react';

			// Interactive selection if no framework detected
			const selectedFramework = await select({
				message: 'Which frontend framework are you using?',
				options: this.frameworks,
			});

			if (isCancel(selectedFramework)) {
				throw new Error('Framework selection cancelled');
			}

			return selectedFramework as 'react' | 'vue' | 'angular' | 'svelte';
		} catch {
			return 'react'; // Default fallback
		}
	}

	private async parseProps(propsInput: string[]): Promise<any[]> {
		if (propsInput.length === 0) {
			const addProps = await confirm({
				message: 'Would you like to add props to your component?',
			});

			if (isCancel(addProps) || !addProps) {
				return [];
			}

			// Interactive prop input
			const props: any[] = [];
			while (true) {
				const propName = await text({
					message: 'Prop name (press Enter to finish):',
					placeholder: 'e.g., title, onClick, variant',
				});

				if (isCancel(propName) || !propName) {
					break;
				}

				const propType = await select({
					message: `Type for ${propName}:`,
					options: [
						{ value: 'string', label: 'string' },
						{ value: 'number', label: 'number' },
						{ value: 'boolean', label: 'boolean' },
						{ value: 'object', label: 'object' },
						{ value: 'array', label: 'array' },
						{ value: 'function', label: 'function' },
					],
				});

				if (isCancel(propType)) {
					break;
				}

				const isOptional = await confirm({
					message: `Is ${propName} optional?`,
				});

				props.push({
					name: propName,
					type: propType,
					optional: !isCancel(isOptional) && isOptional,
				});
			}

			return props;
		}

		// Parse from command line format: "title:string,onClick:function?"
		return propsInput.map(propDef => {
			const [name, typeAndModifier] = propDef.split(':');
			const optional = typeAndModifier?.endsWith('?');
			const type = typeAndModifier?.replace('?', '') || 'string';

			return { name, type, optional };
		});
	}

	private async generateComponent(componentData: any, options: ComponentGeneratorOptions): Promise<void> {
		const templateName = `component/${componentData.framework}-component.hbs`;
		const template = await this.loadTemplate(templateName);
		const content = template(componentData);

		const extension = componentData.typescript ? 'tsx' : 'jsx';
		const fileName = `${componentData.name}.${extension}`;
		const filePath = path.join(process.cwd(), 'src', 'components', fileName);

		if (!options.dryRun) {
			await this.ensureDirectoryExists(path.dirname(filePath));
			await fs.writeFile(filePath, content);
			this.logger.info(`Generated component: ${chalk.green(filePath)}`);
		} else {
			this.logger.info(`Would generate component: ${chalk.yellow(filePath)}`);
		}
	}

	private async generateStories(componentData: any, options: ComponentGeneratorOptions): Promise<void> {
		const template = await this.loadTemplate('component/stories.hbs');
		const content = template(componentData);

		const fileName = `${componentData.name}.stories.tsx`;
		const filePath = path.join(process.cwd(), 'src', 'components', fileName);

		if (!options.dryRun) {
			await this.ensureDirectoryExists(path.dirname(filePath));
			await fs.writeFile(filePath, content);
			this.logger.info(`Generated stories: ${chalk.green(filePath)}`);
		} else {
			this.logger.info(`Would generate stories: ${chalk.yellow(filePath)}`);
		}
	}

	private async generateTests(componentData: any, options: ComponentGeneratorOptions): Promise<void> {
		const template = await this.loadTemplate('component/test.hbs');
		const content = template(componentData);

		const fileName = `${componentData.name}.test.tsx`;
		const filePath = path.join(process.cwd(), 'src', 'components', '__tests__', fileName);

		if (!options.dryRun) {
			await this.ensureDirectoryExists(path.dirname(filePath));
			await fs.writeFile(filePath, content);
			this.logger.info(`Generated tests: ${chalk.green(filePath)}`);
		} else {
			this.logger.info(`Would generate tests: ${chalk.yellow(filePath)}`);
		}
	}

	private async loadTemplate(templatePath: string): Promise<HandlebarsTemplateDelegate> {
		const templateFile = path.join(__dirname, '../templates', templatePath);
		const templateContent = await fs.readFile(templateFile, 'utf-8');
		return Handlebars.compile(templateContent);
	}

	private async ensureDirectoryExists(dirPath: string): Promise<void> {
		try {
			await fs.access(dirPath);
		} catch {
			await fs.mkdir(dirPath, { recursive: true });
		}
	}

	private toPascalCase(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1).replace(/[-_](.)/g, (_, char) => char.toUpperCase());
	}

	protected async validateOptions(options: ComponentGeneratorOptions): Promise<void> {
		if (!options.name) {
			throw new Error('Component name is required');
		}

		if (!/^[A-Za-z][A-Za-z0-9]*$/.test(options.name)) {
			throw new Error('Component name must be alphanumeric and start with a letter');
		}
	}
}