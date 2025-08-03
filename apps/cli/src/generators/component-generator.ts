/**
 * MANDATORY COMPLIANCE RULES - AUTOMATICALLY ENFORCED:
 * ❌ NO raw HTML elements (div, span, p, h1-h6, button, input, etc.) in pages
 * ✅ ONLY semantic components from @xala-technologies/ui-system
 * ❌ NO hardcoded styling (no style prop, no arbitrary Tailwind values)
 * ✅ MANDATORY design token usage for all colors, spacing, typography
 * ✅ Enhanced 8pt Grid System - all spacing in 8px increments
 * ✅ WCAG 2.2 AAA compliance for accessibility
 * ❌ NO hardcoded user-facing text - ALL text must use t() function
 * ✅ MANDATORY localization: English, Norwegian Bokmål, French, Arabic
 * ✅ Explicit TypeScript return types (no 'any' types)
 * ✅ SOLID principles and component composition
 * ✅ Maximum 200 lines per file, 20 lines per function
 *
 * GENERATE: Business logic components that USE Xala UI System components
 * NOT: UI primitive components or wrappers around Xala components
 */

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
	advanced?: 'error-boundary' | 'advanced' | 'platform-specific'; // Advanced template types
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
 * Supports modular compliance: gdpr, wcag-aaa, iso27001, norwegian
 * Enhanced with advanced templates: error-boundary, advanced components
 */
function selectTemplates(options: ComponentGenerationOptions) {
	const { ui, compliance, type, advanced } = options;

	// Template selection logic based on UI system and compliance
	const templateBase = ui === "xala" ? "xala" : "default";
	
	// Support multiple compliance levels (comma-separated)
	const complianceLevels = compliance ? compliance.split(',').map(c => c.trim()) : ['basic'];
	
	// Prioritize compliance levels: norwegian > iso27001 > gdpr > wcag-aaa > basic
	const compliancePriority = ['norwegian', 'iso27001', 'gdpr', 'wcag-aaa', 'basic'];
	const primaryCompliance = compliancePriority.find(level => 
		complianceLevels.includes(level)
	) || 'basic';

	// Advanced template selection
	let componentTemplate: string;
	
	if (advanced === 'error-boundary') {
		componentTemplate = `${templateBase}-error-boundary`;
	} else if (advanced === 'advanced') {
		componentTemplate = `${templateBase}-advanced`;
	} else {
		componentTemplate = `${templateBase}-${type}-${primaryCompliance}`;
	}

	return {
		component: componentTemplate,
		test: `${templateBase}-test`,
		story: `${templateBase}-story`,
		style: `${templateBase}-style`,
		complianceLevels, // Pass all compliance levels for template context
		advanced, // Pass advanced template type
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
 * COMPLIANCE: Uses ONLY Xala UI System components, NO raw HTML elements
 */
function generateDisplayComponent(context: TemplateContext): string {
	const { testIds, ariaLabel } = context;

	// COMPLIANCE: Use ONLY Xala UI System components, NO raw HTML
	return `
  const t = useTranslations("${context.fileName}");

  return (
    <Card
      variant="elevated"
      padding="6"
      data-testid="${testIds.root}"
      role="region"
      aria-label={t("ariaLabel")}
    >
      <Stack direction="vertical" spacing="4">
        <Heading level={3} variant="section">
          {t("title")}
        </Heading>
        <Text variant="body" color="secondary">
          {t("description")}
        </Text>
      </Stack>
    </Card>
  );`;
}

/**
 * Generate form component body
 * COMPLIANCE: Uses ONLY Xala UI System form components, NO raw HTML elements
 */
function generateFormComponent(context: TemplateContext): string {
	const { testIds } = context;

	// COMPLIANCE: Use ONLY Xala UI System components, NO raw HTML
	return `
  const t = useTranslations("${context.fileName}");
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any): Promise<void> => {
    // Handle form submission
    console.log(data);
  };

  return (
    <Card
      variant="elevated"
      padding="6"
      data-testid="${testIds.root}"
      role="form"
      aria-label={t("ariaLabel")}
    >
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="vertical" spacing="4">
          <Heading level={3} variant="section">
            {t("title")}
          </Heading>
          
          <FormField>
            <FormLabel htmlFor="example-input" required>
              {t("fieldLabel")}
            </FormLabel>
            <FormInput
              id="example-input"
              {...register("example", { required: t("fieldRequired") })}
              placeholder={t("fieldPlaceholder")}
              error={errors.example?.message}
            />
          </FormField>
          
          <Stack direction="horizontal" spacing="3" justify="end">
            <Button variant="secondary" type="button">
              {t("cancel")}
            </Button>
            <Button variant="primary" type="submit">
              {t("submit")}
            </Button>
          </Stack>
        </Stack>
      </Form>
    </Card>
  );`;
}

/**
 * Generate layout component body
 * COMPLIANCE: Uses ONLY Xala UI System layout components, NO raw HTML elements
 */
function generateLayoutComponent(context: TemplateContext): string {
	const { testIds } = context;

	// COMPLIANCE: Use ONLY Xala UI System components, NO raw HTML
	return `
  const t = useTranslations("${context.fileName}");

  return (
    <Container
      variant="full"
      data-testid="${testIds.root}"
    >
      <Stack direction="vertical" spacing="0" minHeight="screen">
        <Header
          variant="primary"
          sticky
          role="banner"
          aria-label={t("header.ariaLabel")}
        >
          <Navigation
            items={[]}
            variant="horizontal"
            aria-label={t("nav.ariaLabel")}
          />
        </Header>
        
        <Container
          variant="content"
          padding="6"
          role="main"
          aria-label={t("main.ariaLabel")}
          flex="1"
        >
          {children}
        </Container>
        
        <Footer
          variant="primary"
          role="contentinfo"
          aria-label={t("footer.ariaLabel")}
        >
          <Text variant="caption" color="secondary">
            {t("footer.copyright")}
          </Text>
        </Footer>
      </Stack>
    </Container>
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
 * COMPLIANCE: Enforces mandatory localization and Xala UI System usage
 */
function generateImports(options: ComponentGenerationOptions): string[] {
	const imports: string[] = ["import React from 'react';"];

	// MANDATORY: Always include next-intl for localization (no hardcoded text allowed)
	imports.push("import { useTranslations } from 'next-intl';");

	// MANDATORY: Always include Xala UI System components (no raw HTML allowed)
	if (options.ui === "xala") {
		// Add core Xala UI System imports based on component type
		if (options.type === "form") {
			imports.push("import { Card, Stack, Text, Heading, Form, FormField, FormLabel, FormInput, Button } from '@xala-technologies/ui-system';");
		} else if (options.type === "layout") {
			imports.push("import { Container, Stack, Header, Footer, Navigation, Text } from '@xala-technologies/ui-system';");
		} else {
			// Display components
			imports.push("import { Card, Stack, Text, Heading, Badge, Button } from '@xala-technologies/ui-system';");
		}
	}

	// Add React hooks for forms
	if (options.type === "form") {
		imports.push("import { useForm } from 'react-hook-form';");
		imports.push("import { zodResolver } from '@hookform/resolvers/zod';");
		imports.push("import { z } from 'zod';");
	}

	// Add compliance-specific imports
	const complianceLevels = options.compliance ? options.compliance.split(',').map(c => c.trim()) : [];
	
	if (complianceLevels.includes('gdpr')) {
		imports.push("import { useGDPRConsent } from '@/hooks/useGDPRConsent';");
	}
	
	if (complianceLevels.includes('wcag-aaa')) {
		imports.push("import { useFocusManagement } from '@/hooks/useFocusManagement';");
		imports.push("import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';");
	}
	
	if (complianceLevels.includes('iso27001')) {
		imports.push("import { useSecurityContext } from '@/hooks/useSecurityContext';");
		imports.push("import { useAuditLogger } from '@/hooks/useAuditLogger';");
	}
	
	if (complianceLevels.includes('norwegian')) {
		imports.push("import { useBankID } from '@/hooks/useBankID';");
		imports.push("import { useAltinn } from '@/hooks/useAltinn';");
		imports.push("import { useNorwegianFormatting } from '@/hooks/useNorwegianFormatting';");
	}

	return imports;
}

/**
 * Generate test IDs for the component
 */
function generateTestIds(fileName: string): { [key: string]: string; root: string } {
	const base = fileName;
	return {
		root: base,
		header: `${base}-header`,
		content: `${base}-content`,
		footer: `${base}-footer`,
		submit: `${base}-submit`,
		cancel: `${base}-cancel`,
		action: `${base}-action`,
		dataRequest: `${base}-data-request`,
		dataDeletion: `${base}-data-deletion`,
		withdrawConsent: `${base}-withdraw-consent`,
		liveRegion: `${base}-live-region`,
		title: `${base}-title`,
		description: `${base}-description`
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