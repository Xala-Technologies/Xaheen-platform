import path from "node:path";
import fs from "fs-extra";
import { consola } from "consola";
import type { UISystem, Compliance, Language } from "../types";
import type { ComponentType, ComponentOptions } from "../helpers/project-generation/component-handler";

// Generation result interface
export interface GenerationResult {
	success: boolean;
	files: string[];
	errors?: string[];
	warnings?: string[];
}

// Component generation options
export interface ComponentGenerationOptions {
	name: string;
	componentName: string; // PascalCase
	fileName: string; // kebab-case
	type: ComponentType;
	props: ComponentProp[];
	ui: UISystem;
	compliance: Compliance;
	locales: Language[];
	primaryLocale: Language;
	projectRoot: string;
	targetDir: string;
	includeTests: boolean;
	includeStories: boolean;
	includeStyles: boolean;
}

// Component prop interface
interface ComponentProp {
	name: string;
	type: string;
	optional: boolean;
	defaultValue?: string;
}

// Template context for component generation
interface TemplateContext {
	componentName: string;
	fileName: string;
	componentType: ComponentType;
	props: ComponentProp[];
	propsInterface: string;
	propsParam: string;
	propsDestructure: string;
	hasProps: boolean;
	ui: UISystem;
	compliance: Compliance;
	locales: Language[];
	primaryLocale: Language;
	isAccessible: boolean;
	hasLocalization: boolean;
	hasCompliance: boolean;
	imports: string[];
	ariaLabel?: string;
	testIds: {
		root: string;
		[key: string]: string;
	};
}

/**
 * Generate a component with all related files
 */
export async function generateComponent(
	options: ComponentGenerationOptions
): Promise<GenerationResult> {
	const result: GenerationResult = {
		success: false,
		files: [],
		errors: [],
		warnings: [],
	};

	try {
		// Prepare template context
		const context = prepareTemplateContext(options);

		// Select appropriate templates based on UI system and compliance
		const templates = selectTemplates(options);

		// Generate component file
		const componentPath = path.join(options.targetDir, `${options.fileName}.tsx`);
		const componentContent = generateComponentContent(context, templates.component);
		await fs.ensureDir(options.targetDir);
		await fs.writeFile(componentPath, componentContent);
		result.files.push(componentPath);

		// Generate test file
		if (options.includeTests) {
			const testPath = path.join(options.targetDir, `${options.fileName}.test.tsx`);
			const testContent = generateTestContent(context, templates.test);
			await fs.writeFile(testPath, testContent);
			result.files.push(testPath);
		}

		// Generate stories file
		if (options.includeStories) {
			const storyPath = path.join(options.targetDir, `${options.fileName}.stories.tsx`);
			const storyContent = generateStoryContent(context, templates.story);
			await fs.writeFile(storyPath, storyContent);
			result.files.push(storyPath);
		}

		// Generate styles file (if not using Tailwind)
		if (options.includeStyles && options.ui === "xala") {
			const stylePath = path.join(options.targetDir, `${options.fileName}.module.css`);
			const styleContent = generateStyleContent(context, templates.style);
			await fs.writeFile(stylePath, styleContent);
			result.files.push(stylePath);
		}

		// Update barrel exports
		await updateBarrelExports(options);

		// Add localization keys
		if (options.locales.length > 0) {
			await addLocalizationKeys(options, context);
		}

		result.success = true;
		
	} catch (error) {
		result.errors?.push(error instanceof Error ? error.message : String(error));
	}

	return result;
}

/**
 * Prepare template context with all necessary data
 */
function prepareTemplateContext(options: ComponentGenerationOptions): TemplateContext {
	const { componentName, fileName, type, props, ui, compliance, locales, primaryLocale } = options;

	// Generate props interface
	const propsInterface = generatePropsInterface(componentName, props);
	
	// Generate props parameter
	const propsParam = props.length > 0 ? `props: ${componentName}Props` : "";
	
	// Generate props destructuring
	const propsDestructure = props.length > 0 
		? `const { ${props.map(p => p.name).join(", ")} } = props;`
		: "";

	// Determine features
	const isAccessible = compliance !== "none";
	const hasLocalization = locales.length > 1;
	const hasCompliance = compliance !== "none";

	// Generate imports
	const imports = generateImports(options);

	// Generate test IDs
	const testIds = generateTestIds(fileName);

	// Generate ARIA label
	const ariaLabel = generateAriaLabel(componentName, type);

	return {
		componentName,
		fileName,
		componentType: type,
		props,
		propsInterface,
		propsParam,
		propsDestructure,
		hasProps: props.length > 0,
		ui,
		compliance,
		locales,
		primaryLocale,
		isAccessible,
		hasLocalization,
		hasCompliance,
		imports,
		ariaLabel,
		testIds,
	};
}

/**
 * Generate TypeScript interface for props
 */
function generatePropsInterface(componentName: string, props: ComponentProp[]): string {
	if (props.length === 0) return "";

	const propLines = props.map(prop => {
		const optionalMark = prop.optional ? "?" : "";
		const defaultComment = prop.defaultValue ? ` // default: ${prop.defaultValue}` : "";
		return `  readonly ${prop.name}${optionalMark}: ${prop.type};${defaultComment}`;
	}).join("\n");

	return `interface ${componentName}Props {\n${propLines}\n}`;
}

/**
 * Select appropriate templates based on configuration
 */
function selectTemplates(options: ComponentGenerationOptions) {
	const { ui, compliance, type } = options;

	// Template selection logic based on UI system and compliance
	const templateBase = ui === "xala" ? "xala" : "default";
	const complianceLevel = compliance === "norwegian" ? "norwegian" : compliance === "gdpr" ? "gdpr" : "basic";

	return {
		component: `${templateBase}-${type}-${complianceLevel}`,
		test: `${templateBase}-test`,
		story: `${templateBase}-story`,
		style: `${templateBase}-style`,
	};
}

/**
 * Generate component content
 */
function generateComponentContent(context: TemplateContext, template: string): string {
	const { 
		componentName, 
		propsInterface, 
		propsParam,
		propsDestructure,
		hasProps,
		ui,
		compliance,
		hasLocalization,
		isAccessible,
		testIds,
		ariaLabel,
		imports,
		componentType
	} = context;

	// Build imports section
	const importSection = imports.join("\n");

	// Build component based on type
	let componentBody = "";

	if (componentType === "form") {
		componentBody = generateFormComponent(context);
	} else if (componentType === "layout") {
		componentBody = generateLayoutComponent(context);
	} else {
		componentBody = generateDisplayComponent(context);
	}

	return `${importSection}

${propsInterface}

export const ${componentName} = (${propsParam}): JSX.Element => {
${hasProps ? `  ${propsDestructure}\n` : ""}${componentBody}
};
`;
}

/**
 * Generate display component body
 */
function generateDisplayComponent(context: TemplateContext): string {
	const { ui, isAccessible, testIds, ariaLabel, compliance } = context;
	
	const className = ui === "xala" 
		? "card card--elevated" 
		: "p-6 bg-white rounded-xl shadow-lg";

	const accessibilityAttrs = isAccessible 
		? `\n    aria-label="${ariaLabel}"\n    role="article"` 
		: "";

	const complianceAttrs = compliance === "norwegian"
		? `\n    data-nsm-classification="OPEN"`
		: "";

	return `
  return (
    <div 
      className="${className}"
      data-testid="${testIds.root}"${accessibilityAttrs}${complianceAttrs}
    >
      <h2 className="${ui === "xala" ? "heading heading--lg" : "text-2xl font-bold mb-4"}">
        {/* Component content */}
      </h2>
      <p className="${ui === "xala" ? "text text--body" : "text-gray-600"}">
        {/* Component description */}
      </p>
    </div>
  );`;
}

/**
 * Generate form component body
 */
function generateFormComponent(context: TemplateContext): string {
	const { ui, isAccessible, testIds, compliance, hasLocalization } = context;
	
	const className = ui === "xala" 
		? "form form--standard" 
		: "max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg";

	const submitHandler = `
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };`;

	return `${submitHandler}

  return (
    <form 
      onSubmit={handleSubmit}
      className="${className}"
      data-testid="${testIds.root}"
      ${isAccessible ? 'aria-label="Form"' : ''}
      ${compliance === "norwegian" ? 'data-gdpr-form="true"' : ''}
    >
      <div className="${ui === "xala" ? "form__group" : "mb-6"}">
        <label 
          htmlFor="input-example" 
          className="${ui === "xala" ? "form__label" : "block text-sm font-medium text-gray-700 mb-2"}"
        >
          ${hasLocalization ? '{t("form.label")}' : 'Label'}
        </label>
        <input
          id="input-example"
          type="text"
          className="${ui === "xala" ? "form__input" : "h-14 w-full px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"}"
          ${isAccessible ? 'aria-required="true"' : ''}
        />
      </div>
      
      <button
        type="submit"
        className="${ui === "xala" ? "button button--primary button--lg" : "h-12 w-full bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"}"
      >
        ${hasLocalization ? '{t("form.submit")}' : 'Submit'}
      </button>
    </form>
  );`;
}

/**
 * Generate layout component body
 */
function generateLayoutComponent(context: TemplateContext): string {
	const { ui, isAccessible, testIds } = context;
	
	const className = ui === "xala" 
		? "layout layout--standard" 
		: "min-h-screen bg-gray-50";

	return `
  return (
    <div 
      className="${className}"
      data-testid="${testIds.root}"
      ${isAccessible ? 'role="main"' : ''}
    >
      <header className="${ui === "xala" ? "layout__header" : "bg-white shadow-sm border-b border-gray-200"}">
        <div className="${ui === "xala" ? "container" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"}">
          {/* Header content */}
        </div>
      </header>
      
      <main className="${ui === "xala" ? "layout__main" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}">
        {/* Main content */}
      </main>
      
      <footer className="${ui === "xala" ? "layout__footer" : "bg-gray-800 text-white mt-auto"}">
        <div className="${ui === "xala" ? "container" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"}">
          {/* Footer content */}
        </div>
      </footer>
    </div>
  );`;
}

/**
 * Generate test content
 */
function generateTestContent(context: TemplateContext, template: string): string {
	const { componentName, fileName, hasProps, props, testIds } = context;

	const propsMock = hasProps 
		? `\nconst mockProps: ${componentName}Props = {\n${props.map(p => `  ${p.name}: ${getMockValue(p.type)},`).join("\n")}\n};\n`
		: "";

	const propsSpread = hasProps ? " {...mockProps}" : "";

	return `import { render, screen } from '@testing-library/react';
import { ${componentName} } from './${fileName}';
${hasProps ? `import type { ${componentName}Props } from './${fileName}';\n` : ""}
describe('${componentName}', () => {${propsMock}
  it('should render successfully', () => {
    render(<${componentName}${propsSpread} />);
    
    const element = screen.getByTestId('${testIds.root}');
    expect(element).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<${componentName}${propsSpread} />);
    
    const element = screen.getByTestId('${testIds.root}');
    expect(element).toHaveAttribute('aria-label');
  });
});
`;
}

/**
 * Generate story content
 */
function generateStoryContent(context: TemplateContext, template: string): string {
	const { componentName, fileName, hasProps, props } = context;

	const args = hasProps
		? `\n  args: {\n${props.map(p => `    ${p.name}: ${getMockValue(p.type)},`).join("\n")}\n  },`
		: "";

	return `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${fileName}';

const meta = {
  title: 'Components/${context.componentType}/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],${args}
} satisfies Meta<typeof ${componentName}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCustomProps: Story = {
  args: {
    // Custom args here
  },
};
`;
}

/**
 * Generate style content (for Xala UI system)
 */
function generateStyleContent(context: TemplateContext, template: string): string {
	return `.${context.fileName} {
  /* Component-specific styles */
}

.${context.fileName}__header {
  /* Header styles */
}

.${context.fileName}__content {
  /* Content styles */
}

.${context.fileName}__footer {
  /* Footer styles */
}
`;
}

/**
 * Generate imports based on component requirements
 */
function generateImports(options: ComponentGenerationOptions): string[] {
	const imports: string[] = ["import React from 'react';"];

	// Add React hooks if needed
	if (options.type === "form") {
		imports.push("import { useState } from 'react';");
	}

	// Add localization
	if (options.locales.length > 1) {
		imports.push("import { useTranslation } from 'react-i18next';");
	}

	// Add UI system imports
	if (options.ui === "xala") {
		imports.push("import '@xala-technologies/ui-system/styles';");
	}

	// Add compliance imports
	if (options.compliance === "norwegian") {
		imports.push("import { useGDPRConsent } from '@xaheen/compliance';");
	}

	return imports;
}

/**
 * Generate test IDs for the component
 */
function generateTestIds(fileName: string): Record<string, string> {
	const base = fileName;
	return {
		root: base,
		header: `${base}-header`,
		content: `${base}-content`,
		footer: `${base}-footer`,
		submit: `${base}-submit`,
		cancel: `${base}-cancel`,
	};
}

/**
 * Generate ARIA label based on component type
 */
function generateAriaLabel(componentName: string, type: ComponentType): string {
	const name = componentName.replace(/([A-Z])/g, ' $1').trim();
	
	switch (type) {
		case "form":
			return `${name} Form`;
		case "layout":
			return `${name} Layout`;
		default:
			return name;
	}
}

/**
 * Get mock value for a given type
 */
function getMockValue(type: string): string {
	switch (type) {
		case "string":
			return "'Test String'";
		case "number":
			return "42";
		case "boolean":
			return "true";
		case "Date":
			return "new Date()";
		case "array":
			return "[]";
		case "object":
			return "{}";
		case "function":
			return "() => {}";
		default:
			return "undefined";
	}
}

/**
 * Update barrel exports (index.ts)
 */
async function updateBarrelExports(options: ComponentGenerationOptions): Promise<void> {
	const indexPath = path.join(options.targetDir, "index.ts");
	const exportLine = `export { ${options.componentName} } from './${options.fileName}';\n`;

	try {
		let content = "";
		if (await fs.pathExists(indexPath)) {
			content = await fs.readFile(indexPath, "utf-8");
		}

		// Check if export already exists
		if (!content.includes(exportLine)) {
			content += exportLine;
			await fs.writeFile(indexPath, content);
		}
	} catch (error) {
		consola.warn("Could not update barrel exports:", error);
	}
}

/**
 * Add localization keys for the component
 */
async function addLocalizationKeys(
	options: ComponentGenerationOptions,
	context: TemplateContext
): Promise<void> {
	const { componentName, componentType } = context;
	const componentKey = componentName.charAt(0).toLowerCase() + componentName.slice(1);

	// Default keys based on component type
	const defaultKeys: Record<string, any> = {
		form: {
			[componentKey]: {
				title: `${componentName} Form`,
				label: "Field Label",
				placeholder: "Enter value...",
				submit: "Submit",
				cancel: "Cancel",
				required: "This field is required",
				success: "Form submitted successfully",
				error: "An error occurred",
			}
		},
		display: {
			[componentKey]: {
				title: componentName,
				description: `${componentName} Description`,
				noData: "No data available",
			}
		},
		layout: {
			[componentKey]: {
				header: "Header",
				footer: "Footer",
				navigation: "Navigation",
				content: "Main Content",
			}
		}
	};

	const keys = defaultKeys[componentType] || defaultKeys.display;

	// Add keys to each locale file
	for (const locale of options.locales) {
		const localePath = path.join(
			options.projectRoot,
			"src",
			"localization",
			"languages",
			`${locale}.json`
		);

		try {
			let localeData = {};
			if (await fs.pathExists(localePath)) {
				localeData = await fs.readJson(localePath);
			}

			// Merge new keys
			localeData = {
				...localeData,
				components: {
					...(localeData as any).components,
					...keys
				}
			};

			await fs.ensureDir(path.dirname(localePath));
			await fs.writeJson(localePath, localeData, { spaces: 2 });
		} catch (error) {
			consola.warn(`Could not update locale file for ${locale}:`, error);
		}
	}
}