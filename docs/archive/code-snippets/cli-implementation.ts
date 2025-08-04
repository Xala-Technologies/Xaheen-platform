#!/usr/bin/env node
// cli/src/index.ts

import { prompts } from "@clack/prompts";
import { Command } from "commander";
import { version } from "../../package.json";
import { add } from "./commands/add";
import { configure } from "./commands/configure";
import { create } from "./commands/create";
import { logger } from "./utils/logger";

const program = new Command();

program
	.name("create-custom-stack")
	.description(
		"CLI to scaffold custom TypeScript projects with company standards",
	)
	.version(version);

// Main create command
program
	.command("create [project-name]")
	.description("Create a new project")
	.option("-t, --template <template>", "Use a specific template")
	.option("-y, --yes", "Skip prompts and use defaults")
	.option("--no-install", "Skip dependency installation")
	.option("--no-git", "Skip git initialization")
	.action(create);

// Add components/features
program
	.command("add <type>")
	.description("Add components or features to existing project")
	.option("-n, --name <name>", "Component/feature name")
	.option("-p, --path <path>", "Custom path")
	.action(add);

// Configure project settings
program
	.command("configure")
	.description("Configure project settings")
	.option("--theme", "Configure theme")
	.option("--eslint", "Update ESLint rules")
	.option("--prettier", "Update Prettier config")
	.action(configure);

program.parse();

// cli/src/commands/create.ts
import {
	cancel,
	confirm,
	intro,
	isCancel,
	multiselect,
	outro,
	prompts,
	select,
	spinner,
	text,
} from "@clack/prompts";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { generateProject } from "../generators/project";
import { initGit } from "../utils/git";
import { detectPackageManager, validateProjectName } from "../utils/helpers";
import { installDependencies } from "../utils/install";

interface CreateOptions {
	template?: string;
	yes?: boolean;
	install?: boolean;
	git?: boolean;
}

interface ProjectConfig {
	name: string;
	template: string;
	frontend: string;
	backend: string;
	database: string;
	auth: string;
	styling: string;
	testing: string;
	components: string[];
	features: string[];
}

export async function create(
	projectName: string | undefined,
	options: CreateOptions,
) {
	console.clear();

	intro(
		chalk.gradient.pastel.multiline(`
    ╔═══════════════════════════════════╗
    ║   Create Custom Stack             ║
    ║   Enterprise TypeScript Setup     ║
    ╚═══════════════════════════════════╝
  `),
	);

	const config: Partial<ProjectConfig> = {};

	// Project name
	if (!projectName) {
		const name = await text({
			message: "What is your project name?",
			placeholder: "my-awesome-app",
			validate: (value) => {
				if (!value) return "Project name is required";
				const validation = validateProjectName(value);
				if (!validation.valid) return validation.message;
			},
		});

		if (isCancel(name)) {
			cancel("Operation cancelled");
			process.exit(0);
		}

		config.name = name as string;
	} else {
		const validation = validateProjectName(projectName);
		if (!validation.valid) {
			console.error(chalk.red(validation.message));
			process.exit(1);
		}
		config.name = projectName;
	}

	// Use defaults for --yes flag
	if (options.yes) {
		Object.assign(config, {
			template: "full-stack",
			frontend: "react-vite",
			backend: "hono",
			database: "postgresql",
			auth: "lucia",
			styling: "custom-design-system",
			testing: "vitest",
			components: ["button", "form", "modal", "table"],
			features: ["auth", "dashboard", "api"],
		});
	} else {
		// Interactive prompts
		const template = await select({
			message: "Which template would you like to use?",
			options: [
				{
					value: "full-stack",
					label: "Full Stack Application",
					hint: "Frontend + Backend + Database",
				},
				{
					value: "frontend",
					label: "Frontend Only",
					hint: "SPA with React/Vue/Solid",
				},
				{
					value: "backend",
					label: "Backend API",
					hint: "REST/GraphQL/tRPC API",
				},
				{
					value: "monorepo",
					label: "Monorepo",
					hint: "Multiple apps and packages",
				},
				{
					value: "library",
					label: "Component Library",
					hint: "Reusable UI components",
				},
				{ value: "custom", label: "Custom", hint: "Configure everything" },
			],
		});

		if (isCancel(template)) {
			cancel("Operation cancelled");
			process.exit(0);
		}

		config.template = template as string;

		// Frontend selection
		if (
			["full-stack", "frontend", "monorepo", "custom"].includes(config.template)
		) {
			const frontend = await select({
				message: "Select frontend framework:",
				options: [
					{
						value: "react-vite",
						label: "React + Vite",
						hint: "Fast, modern React setup",
					},
					{
						value: "react-next",
						label: "Next.js",
						hint: "Full-stack React framework",
					},
					{ value: "vue", label: "Vue 3", hint: "Progressive framework" },
					{ value: "solid", label: "SolidJS", hint: "Fine-grained reactivity" },
					{ value: "astro", label: "Astro", hint: "Content-focused framework" },
				],
			});

			if (isCancel(frontend)) {
				cancel("Operation cancelled");
				process.exit(0);
			}

			config.frontend = frontend as string;
		}

		// Backend selection
		if (
			["full-stack", "backend", "monorepo", "custom"].includes(config.template)
		) {
			const backend = await select({
				message: "Select backend framework:",
				options: [
					{ value: "hono", label: "Hono", hint: "Ultrafast web framework" },
					{ value: "elysia", label: "Elysia", hint: "Bun-first web framework" },
					{
						value: "express",
						label: "Express",
						hint: "Classic Node.js framework",
					},
					{ value: "fastify", label: "Fastify", hint: "Fast and low overhead" },
					{
						value: "nestjs",
						label: "NestJS",
						hint: "Enterprise-grade framework",
					},
				],
			});

			if (isCancel(backend)) {
				cancel("Operation cancelled");
				process.exit(0);
			}

			config.backend = backend as string;
		}

		// Styling system
		const styling = await select({
			message: "Select styling approach:",
			options: [
				{
					value: "custom-design-system",
					label: "Custom Design System",
					hint: "Your company design tokens",
				},
				{ value: "tailwind", label: "Tailwind CSS", hint: "Utility-first CSS" },
				{ value: "css-modules", label: "CSS Modules", hint: "Scoped CSS" },
				{
					value: "styled-components",
					label: "Styled Components",
					hint: "CSS-in-JS",
				},
				{
					value: "vanilla-extract",
					label: "Vanilla Extract",
					hint: "Zero-runtime CSS",
				},
			],
		});

		if (isCancel(styling)) {
			cancel("Operation cancelled");
			process.exit(0);
		}

		config.styling = styling as string;

		// Component selection
		const components = await multiselect({
			message: "Select components to include:",
			options: [
				{ value: "button", label: "Button", hint: "Primary, secondary, etc." },
				{
					value: "form",
					label: "Form Components",
					hint: "Input, select, checkbox",
				},
				{ value: "modal", label: "Modal/Dialog", hint: "Popups and modals" },
				{ value: "table", label: "Data Table", hint: "Sortable, filterable" },
				{ value: "navigation", label: "Navigation", hint: "Navbar, sidebar" },
				{ value: "card", label: "Card", hint: "Content containers" },
				{
					value: "toast",
					label: "Toast/Notifications",
					hint: "Alert messages",
				},
			],
			required: false,
		});

		if (isCancel(components)) {
			cancel("Operation cancelled");
			process.exit(0);
		}

		config.components = components as string[];
	}

	// Project generation
	const s = spinner();

	s.start("Creating project structure...");

	const projectPath = path.join(process.cwd(), config.name!);

	try {
		// Check if directory exists
		if (fs.existsSync(projectPath)) {
			s.stop();
			const overwrite = await confirm({
				message: `Directory ${config.name} already exists. Overwrite?`,
				initialValue: false,
			});

			if (isCancel(overwrite) || !overwrite) {
				cancel("Operation cancelled");
				process.exit(0);
			}

			fs.removeSync(projectPath);
		}

		// Generate project
		await generateProject(projectPath, config as ProjectConfig);
		s.stop("Project structure created");

		// Git initialization
		if (options.git !== false) {
			s.start("Initializing git repository...");
			await initGit(projectPath);
			s.stop("Git repository initialized");
		}

		// Install dependencies
		if (options.install !== false) {
			s.start("Installing dependencies...");
			const packageManager = await detectPackageManager();
			await installDependencies(projectPath, packageManager);
			s.stop("Dependencies installed");
		}

		// Success message
		outro(
			chalk.green(`
🎉 Project created successfully!

${chalk.bold("Next steps:")}
${chalk.cyan(`cd ${config.name}`)}
${options.install === false ? chalk.cyan(`${await detectPackageManager()} install`) : ""}
${chalk.cyan(`${await detectPackageManager()} run dev`)}

${chalk.bold("Available commands:")}
${chalk.gray("• npm run dev")}       - Start development server
${chalk.gray("• npm run build")}     - Build for production
${chalk.gray("• npm run test")}      - Run tests
${chalk.gray("• npm run lint")}      - Lint code

${chalk.bold("Add more features:")}
${chalk.gray(`• npx create-custom-stack add component`)}
${chalk.gray(`• npx create-custom-stack add feature`)}
${chalk.gray(`• npx create-custom-stack configure`)}

${chalk.dim("Happy coding! 🚀")}
    `),
		);
	} catch (error) {
		s.stop("Failed to create project");
		console.error(chalk.red("Error:"), error);
		process.exit(1);
	}
}

// cli/src/generators/project.ts
import fs from "fs-extra";
import path from "path";
import { copyTemplate } from "../utils/template";
import { generateESLintConfig } from "./eslint";
import { generateGitignore } from "./gitignore";
import { generatePackageJson } from "./package-json";
import { generatePrettierConfig } from "./prettier";
import { generateReadme } from "./readme";
import { generateTsConfig } from "./tsconfig";

export async function generateProject(
	projectPath: string,
	config: ProjectConfig,
) {
	// Create project directory
	await fs.ensureDir(projectPath);

	// Generate base files
	await fs.writeJson(
		path.join(projectPath, "package.json"),
		generatePackageJson(config),
		{ spaces: 2 },
	);

	await fs.writeJson(
		path.join(projectPath, "tsconfig.json"),
		generateTsConfig(config),
		{ spaces: 2 },
	);

	await fs.writeFile(
		path.join(projectPath, ".eslintrc.js"),
		generateESLintConfig(config),
	);

	await fs.writeJson(
		path.join(projectPath, ".prettierrc"),
		generatePrettierConfig(config),
		{ spaces: 2 },
	);

	await fs.writeFile(
		path.join(projectPath, "README.md"),
		generateReadme(config),
	);

	await fs.writeFile(
		path.join(projectPath, ".gitignore"),
		generateGitignore(config),
	);

	// Copy template files
	const templatePath = path.join(__dirname, "../../templates", config.template);
	await copyTemplate(templatePath, projectPath, config);

	// Generate components
	if (config.components.length > 0) {
		const componentsPath = path.join(projectPath, "src/components");
		await fs.ensureDir(componentsPath);

		for (const component of config.components) {
			await generateComponent(componentsPath, component, config);
		}
	}

	// Generate features
	if (config.features && config.features.length > 0) {
		const featuresPath = path.join(projectPath, "src/features");
		await fs.ensureDir(featuresPath);

		for (const feature of config.features) {
			await generateFeature(featuresPath, feature, config);
		}
	}
}

// Component generator
async function generateComponent(
	basePath: string,
	componentType: string,
	config: ProjectConfig,
) {
	const componentGenerators: Record<string, () => Promise<void>> = {
		button: () => generateButtonComponent(basePath, config),
		form: () => generateFormComponents(basePath, config),
		modal: () => generateModalComponent(basePath, config),
		table: () => generateTableComponent(basePath, config),
		// Add more component generators
	};

	const generator = componentGenerators[componentType];
	if (generator) {
		await generator();
	}
}

// Example: Button component generator
async function generateButtonComponent(
	basePath: string,
	config: ProjectConfig,
) {
	const buttonPath = path.join(basePath, "Button");
	await fs.ensureDir(buttonPath);

	const buttonContent = `import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary'
      },
      size: {
        sm: 'h-8 rounded-md px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 rounded-md px-8',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
`;

	await fs.writeFile(path.join(buttonPath, "Button.tsx"), buttonContent);

	// Create index file
	await fs.writeFile(
		path.join(buttonPath, "index.ts"),
		`export { Button, type ButtonProps } from './Button';\n`,
	);

	// Create test file
	const testContent = `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });
});
`;

	await fs.writeFile(path.join(buttonPath, "Button.test.tsx"), testContent);
}
