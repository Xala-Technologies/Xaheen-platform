// apps/cli/src/extensions/xala/index.ts
import { Command } from "commander";
import { registerXalaCommands } from "./commands";
import { XalaProjectGenerator } from "./generators";
import { XalaTemplateRegistry } from "./templates";

export class XalaExtension {
	private generator: XalaProjectGenerator;
	private templateRegistry: XalaTemplateRegistry;

	constructor() {
		this.generator = new XalaProjectGenerator();
		this.templateRegistry = new XalaTemplateRegistry();
	}

	register(program: Command) {
		// Register all Xala-specific commands
		registerXalaCommands(program, this);
	}

	async generateProject(config: XalaProjectConfig) {
		return this.generator.generate(config);
	}

	getTemplates() {
		return this.templateRegistry.getAll();
	}
}

// apps/cli/src/extensions/xala/commands/index.ts
import { Command } from "commander";
import { XalaExtension } from "../index";
import { addXalaComponentCommand } from "./add-component";
import { configureXalaCommand } from "./configure";
import { createXalaCommand } from "./create";

export function registerXalaCommands(
	program: Command,
	extension: XalaExtension,
) {
	// Main Xala creation command
	createXalaCommand(program, extension);

	// Component scaffolding
	addXalaComponentCommand(program, extension);

	// Configuration management
	configureXalaCommand(program, extension);
}

import {
	cancel,
	confirm,
	intro,
	isCancel,
	multiselect,
	outro,
	select,
	spinner,
	text,
} from "@clack/prompts";
import chalk from "chalk";
// apps/cli/src/extensions/xala/commands/create.ts
import { Command } from "commander";
import { XalaExtension } from "../index";

export function createXalaCommand(program: Command, extension: XalaExtension) {
	program
		.command("xala [project-name]")
		.description("Create a new Xala UI System powered application")
		.option("-t, --template <template>", "Use specific template")
		.option("-p, --preset <preset>", "Use configuration preset")
		.option("--skip-install", "Skip dependency installation")
		.action(async (projectName, options) => {
			console.clear();

			intro(chalk.bgBlue.white.bold(" Xala Enterprise UI System "));

			const config: XalaProjectConfig = {
				features: [],
				compliance: {},
			};

			// Project name
			if (!projectName) {
				const name = await text({
					message: "What is your project name?",
					placeholder: "my-xala-app",
					validate: (value) => {
						if (!value) return "Project name is required";
						if (!/^[a-z0-9-]+$/.test(value)) {
							return "Project name must be lowercase with hyphens only";
						}
					},
				});

				if (isCancel(name)) {
					cancel("Operation cancelled");
					process.exit(0);
				}

				config.name = name as string;
			} else {
				config.name = projectName;
			}

			// Template selection
			const templates = extension.getTemplates();
			const template =
				options.template ||
				(await select({
					message: "Select a project template:",
					options: templates.map((t) => ({
						value: t.id,
						label: t.name,
						hint: t.description,
					})),
				}));

			if (isCancel(template)) {
				cancel("Operation cancelled");
				process.exit(0);
			}

			config.template = template as string;

			// Norwegian compliance features
			const complianceFeatures = await multiselect({
				message: "Select Norwegian compliance features:",
				options: [
					{
						value: "nsm-classification",
						label: "NSM Classification",
						hint: "ÅPEN, BEGRENSET, KONFIDENSIELT, HEMMELIG",
					},
					{
						value: "personal-data",
						label: "Personal Data Forms",
						hint: "Fødselsnummer & Org.nummer validation",
					},
					{
						value: "bankid-auth",
						label: "BankID/MinID Authentication",
						hint: "Norwegian digital ID integration",
					},
					{
						value: "altinn-integration",
						label: "Altinn Integration",
						hint: "Connect to government services",
					},
					{
						value: "gdpr-compliance",
						label: "GDPR Compliance",
						hint: "Privacy and consent management",
					},
				],
				required: false,
			});

			if (isCancel(complianceFeatures)) {
				cancel("Operation cancelled");
				process.exit(0);
			}

			config.compliance = {
				features: complianceFeatures as string[],
			};

			// UI features selection
			const uiFeatures = await multiselect({
				message: "Select UI features to include:",
				options: [
					{
						value: "chat-interface",
						label: "Chat Interface",
						hint: "AI chat with MessageBubble components",
					},
					{
						value: "data-tables",
						label: "Advanced Data Tables",
						hint: "Sortable, filterable, exportable",
					},
					{
						value: "dashboard",
						label: "Dashboard Layout",
						hint: "Analytics and metrics views",
					},
					{
						value: "form-builder",
						label: "Form Builder",
						hint: "Dynamic form generation",
					},
					{
						value: "file-upload",
						label: "File Upload",
						hint: "Drag & drop with validation",
					},
				],
			});

			if (isCancel(uiFeatures)) {
				cancel("Operation cancelled");
				process.exit(0);
			}

			config.features = uiFeatures as string[];

			// Platform configuration
			const platform = await select({
				message: "Select target platform:",
				options: [
					{ value: "web", label: "Web (SSR)", hint: "Next.js/Remix optimized" },
					{ value: "mobile", label: "Mobile", hint: "React Native/Expo" },
					{ value: "desktop", label: "Desktop", hint: "Electron/Tauri" },
					{ value: "multi", label: "Multi-platform", hint: "All platforms" },
				],
			});

			if (isCancel(platform)) {
				cancel("Operation cancelled");
				process.exit(0);
			}

			config.platform = platform as string;

			// Theme preset
			const themePreset = await select({
				message: "Select theme preset:",
				options: [
					{
						value: "default",
						label: "Xala Default",
						hint: "Blue & orange theme",
					},
					{
						value: "government",
						label: "Government",
						hint: "Official Norwegian colors",
					},
					{
						value: "healthcare",
						label: "Healthcare",
						hint: "Calming blues and greens",
					},
					{
						value: "finance",
						label: "Finance",
						hint: "Professional dark theme",
					},
					{ value: "custom", label: "Custom", hint: "Configure your own" },
				],
			});

			if (isCancel(themePreset)) {
				cancel("Operation cancelled");
				process.exit(0);
			}

			config.theme = themePreset as string;

			// Multi-tenant support
			const multiTenant = await confirm({
				message: "Enable multi-tenant support?",
				initialValue: false,
			});

			if (isCancel(multiTenant)) {
				cancel("Operation cancelled");
				process.exit(0);
			}

			config.multiTenant = multiTenant as boolean;

			// Generate project
			const s = spinner();
			s.start("Creating your Xala project...");

			try {
				await extension.generateProject(config);
				s.stop("Project created successfully!");

				outro(
					chalk.green(`
✨ Your Xala project is ready!

${chalk.bold("Next steps:")}
  ${chalk.cyan(`cd ${config.name}`)}
  ${options.skipInstall ? chalk.cyan("npm install") : ""}
  ${chalk.cyan("npm run dev")}

${chalk.bold("Xala commands:")}
  ${chalk.gray("npm run xala:add")}      - Add new components
  ${chalk.gray("npm run xala:theme")}    - Configure theme
  ${chalk.gray("npm run xala:docs")}     - Generate documentation

${chalk.bold("Resources:")}
  📚 Xala Docs: ${chalk.underline("https://xala-ui.pages.dev")}
  🎨 Component Explorer: ${chalk.underline("https://xala-ui.pages.dev/components")}
  🇳🇴 Norwegian Guide: ${chalk.underline("https://xala-ui.pages.dev/norwegian")}

${chalk.dim("Built with ❤️ by Xala Technologies")}
        `),
				);
			} catch (error) {
				s.stop("Failed to create project");
				console.error(chalk.red("Error:"), error);
				process.exit(1);
			}
		});
}

import {
	cancel,
	confirm,
	intro,
	isCancel,
	multiselect,
	outro,
	select,
	text,
} from "@clack/prompts";
import chalk from "chalk";
// apps/cli/src/extensions/xala/commands/add-component.ts
import { Command } from "commander";
import fs from "fs-extra";
import path from "path";

export function addXalaComponentCommand(
	program: Command,
	extension: XalaExtension,
) {
	program
		.command("xala:add [component-name]")
		.description("Add a new Xala UI component to your project")
		.option("-t, --type <type>", "Component type (ui|feature|layout)")
		.option("-p, --path <path>", "Custom component path")
		.action(async (componentName, options) => {
			intro(chalk.bgBlue.white(" Add Xala Component "));

			// Detect if we're in a Xala project
			const projectRoot = process.cwd();
			const xalaConfigPath = path.join(projectRoot, "xala.config.ts");

			if (!(await fs.pathExists(xalaConfigPath))) {
				console.error(chalk.red("Error: Not in a Xala project directory"));
				console.log(chalk.gray("Run this command from your project root"));
				process.exit(1);
			}

			// Component name
			if (!componentName) {
				const name = await text({
					message: "Component name:",
					placeholder: "MyComponent",
					validate: (value) => {
						if (!value) return "Component name is required";
						if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
							return "Component name must be PascalCase";
						}
					},
				});

				if (isCancel(name)) {
					cancel("Operation cancelled");
					process.exit(0);
				}

				componentName = name as string;
			}

			// Component type
			const componentType =
				options.type ||
				(await select({
					message: "Component type:",
					options: [
						{ value: "ui", label: "UI Component", hint: "Reusable UI element" },
						{
							value: "feature",
							label: "Feature Component",
							hint: "Business logic component",
						},
						{
							value: "layout",
							label: "Layout Component",
							hint: "Page layout structure",
						},
						{
							value: "form",
							label: "Form Component",
							hint: "Form with validation",
						},
						{
							value: "chat",
							label: "Chat Component",
							hint: "Chat interface element",
						},
					],
				}));

			if (isCancel(componentType)) {
				cancel("Operation cancelled");
				process.exit(0);
			}

			// Component features
			const features = await multiselect({
				message: "Select component features:",
				options: [
					{
						value: "typescript",
						label: "TypeScript",
						hint: "Type definitions",
					},
					{ value: "tests", label: "Tests", hint: "Unit tests with Vitest" },
					{ value: "stories", label: "Storybook", hint: "Component stories" },
					{ value: "docs", label: "Documentation", hint: "README.md" },
					{ value: "styles", label: "Styled", hint: "CSS modules" },
					{ value: "hooks", label: "Custom Hook", hint: "useComponent hook" },
				],
				initialValues: ["typescript", "tests"],
			});

			if (isCancel(features)) {
				cancel("Operation cancelled");
				process.exit(0);
			}

			// Xala-specific options
			let xalaFeatures = {};
			if (componentType === "form") {
				const formFeatures = await multiselect({
					message: "Select form features:",
					options: [
						{ value: "personal-number", label: "Personal Number Field" },
						{ value: "org-number", label: "Organization Number Field" },
						{ value: "address", label: "Norwegian Address Fields" },
						{ value: "classification", label: "Classification Selector" },
					],
				});

				if (isCancel(formFeatures)) {
					cancel("Operation cancelled");
					process.exit(0);
				}

				xalaFeatures = { formFields: formFeatures };
			}

			// Generate component
			await generateXalaComponent({
				name: componentName,
				type: componentType as string,
				features: features as string[],
				xalaFeatures,
				path: options.path || getDefaultComponentPath(componentType as string),
			});

			outro(
				chalk.green(`
✅ Component ${componentName} created successfully!

${chalk.bold("Files created:")}
  ${chalk.gray(`src/components/${componentName}/`)}
  ${chalk.gray(`  ├── ${componentName}.tsx`)}
  ${features.includes("tests") ? chalk.gray(`  ├── ${componentName}.test.tsx`) : ""}
  ${features.includes("stories") ? chalk.gray(`  ├── ${componentName}.stories.tsx`) : ""}
  ${chalk.gray(`  └── index.ts`)}

${chalk.bold("Usage:")}
  ${chalk.cyan(`import { ${componentName} } from '@/components/${componentName}';`)}
      `),
			);
		});
}

// Component generator function
async function generateXalaComponent(config: ComponentConfig) {
	const componentPath = path.join(process.cwd(), config.path, config.name);
	await fs.ensureDir(componentPath);

	// Generate main component file
	const componentContent = generateComponentTemplate(config);
	await fs.writeFile(
		path.join(componentPath, `${config.name}.tsx`),
		componentContent,
	);

	// Generate index file
	await fs.writeFile(
		path.join(componentPath, "index.ts"),
		`export { ${config.name} } from './${config.name}';\nexport type { ${config.name}Props } from './${config.name}';\n`,
	);

	// Generate test file if requested
	if (config.features.includes("tests")) {
		const testContent = generateTestTemplate(config);
		await fs.writeFile(
			path.join(componentPath, `${config.name}.test.tsx`),
			testContent,
		);
	}

	// Generate Storybook file if requested
	if (config.features.includes("stories")) {
		const storyContent = generateStoryTemplate(config);
		await fs.writeFile(
			path.join(componentPath, `${config.name}.stories.tsx`),
			storyContent,
		);
	}
}

function generateComponentTemplate(config: ComponentConfig): string {
	const imports = [
		`import { forwardRef } from 'react';`,
		`import { Stack, Box, Text } from '@xala-technologies/ui-system';`,
	];

	if (config.type === "form" && config.xalaFeatures.formFields) {
		if (config.xalaFeatures.formFields.includes("personal-number")) {
			imports.push(
				`import { PersonalNumberInput } from '@xala-technologies/ui-system';`,
			);
		}
		if (config.xalaFeatures.formFields.includes("org-number")) {
			imports.push(
				`import { OrganizationNumberInput } from '@xala-technologies/ui-system';`,
			);
		}
		if (config.xalaFeatures.formFields.includes("classification")) {
			imports.push(
				`import { ClassificationSelector } from '@xala-technologies/ui-system';`,
			);
		}
	}

	return `${imports.join("\n")}

export interface ${config.name}Props {
  // Add your props here
  className?: string;
  children?: React.ReactNode;
}

export const ${config.name} = forwardRef<HTMLDivElement, ${config.name}Props>(
  ({ className, children, ...props }, ref) => {
    return (
      <Box ref={ref} className={className} {...props}>
        <Stack direction="col" gap="4">
          <Text variant="h3">${config.name}</Text>
          {children}
        </Stack>
      </Box>
    );
  }
);

${config.name}.displayName = '${config.name}';
`;
}

function generateTestTemplate(config: ComponentConfig): string {
	return `import { render, screen } from '@testing-library/react';
import { ${config.name} } from './${config.name}';

describe('${config.name}', () => {
  it('renders correctly', () => {
    render(<${config.name}>Test content</${config.name}>);
    expect(screen.getByText('${config.name}')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<${config.name} ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });
});
`;
}

function generateStoryTemplate(config: ComponentConfig): string {
	return `import type { Meta, StoryObj } from '@storybook/react';
import { ${config.name} } from './${config.name}';

const meta: Meta<typeof ${config.name}> = {
  title: 'Components/${config.type}/${config.name}',
  component: ${config.name},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default ${config.name}',
  },
};

export const WithCustomContent: Story = {
  args: {
    children: (
      <div>
        <p>Custom content goes here</p>
      </div>
    ),
  },
};
`;
}

function getDefaultComponentPath(type: string): string {
	const pathMap: Record<string, string> = {
		ui: "src/components/ui",
		feature: "src/features",
		layout: "src/components/layouts",
		form: "src/components/forms",
		chat: "src/components/chat",
	};
	return pathMap[type] || "src/components";
}

// Type definitions
interface XalaProjectConfig {
	name?: string;
	template?: string;
	platform?: string;
	theme?: string;
	features: string[];
	compliance: {
		features?: string[];
	};
	multiTenant?: boolean;
}

interface ComponentConfig {
	name: string;
	type: string;
	features: string[];
	xalaFeatures: any;
	path: string;
}
