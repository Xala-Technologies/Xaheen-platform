// apps/cli/src/commands/xaheen.ts

import {
	cancel,
	confirm,
	intro,
	isCancel,
	multiselect,
	note,
	outro,
	select,
	spinner,
	text,
} from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import fs from "fs-extra";
import path from "path";
import { XaheenComponentGenerator } from "../extensions/xaheen/generators/component-generator";
import { XaheenDevelopmentStandards } from "../extensions/xaheen/standards";
import { XaheenAppTemplate } from "../extensions/xaheen/templates/xaheen-app.template";
import { XaheenCodeValidator } from "../extensions/xaheen/validators";

export function registerXaheenCommands(program: Command): void {
	// Main Xaheen command
	program
		.command("xaheen [project-name]")
		.description("Create a new Xaheen AI-powered SaaS Factory project")
		.option("--no-install", "Skip dependency installation")
		.option("--no-git", "Skip git initialization")
		.option("--mock", "Use mock mode for development without API keys")
		.action(createXaheenProject);

	// Validate command
	program
		.command("xaheen:validate [path]")
		.description("Validate code against Xaheen development standards")
		.option("--fix", "Attempt to fix violations automatically")
		.action(validateXaheenProject);

	// Add component command
	program
		.command("xaheen:component <name>")
		.description("Generate a Xaheen-compliant component")
		.option("-p, --path <path>", "Component path", "src/components")
		.option("--with-tests", "Generate test files")
		.option("--with-story", "Generate Storybook story")
		.action(generateXaheenComponent);

	// Add agent command
	program
		.command("xaheen:agent <name>")
		.description("Generate a new AI agent for the Xaheen system")
		.option(
			"-t, --type <type>",
			"Agent type (specialized|orchestrator|utility)",
		)
		.action(generateXaheenAgent);
}

async function createXaheenProject(
	projectName: string | undefined,
	options: any,
): Promise<void> {
	console.clear();

	intro(chalk.bgMagenta.white.bold(" 🧠✨ Xaheen AI SaaS Factory "));

	// Project name
	if (!projectName) {
		const name = await text({
			message: "What is your project name?",
			placeholder: "my-xaheen-app",
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

		projectName = name as string;
	}

	// Project configuration
	const projectType = await select({
		message: "Select project type:",
		options: [
			{
				value: "full-stack",
				label: "Full Stack SaaS",
				hint: "Complete AI-powered platform",
			},
			{
				value: "frontend",
				label: "Frontend Only",
				hint: "UI with mock agents",
			},
			{
				value: "backend",
				label: "Backend Only",
				hint: "Agent system and APIs",
			},
			{
				value: "agent-library",
				label: "Agent Library",
				hint: "Reusable AI agents",
			},
		],
	});

	if (isCancel(projectType)) {
		cancel("Operation cancelled");
		process.exit(0);
	}

	// Agent selection
	const agents = await multiselect({
		message: "Select AI agents to include:",
		options: [
			{
				value: "orchestrator",
				label: "Project Orchestrator",
				hint: "Main coordinator",
			},
			{
				value: "requirements",
				label: "Requirements Analyst",
				hint: "User story extraction",
			},
			{
				value: "architect",
				label: "System Architect",
				hint: "Architecture design",
			},
			{ value: "database", label: "Database Expert", hint: "Schema design" },
			{
				value: "security",
				label: "Security Specialist",
				hint: "Auth & compliance",
			},
			{ value: "ui-ux", label: "UI/UX Designer", hint: "Design systems" },
			{ value: "api", label: "API Developer", hint: "REST/GraphQL" },
			{ value: "devops", label: "DevOps Engineer", hint: "CI/CD & deployment" },
			{ value: "qa", label: "QA Engineer", hint: "Testing automation" },
			{
				value: "compliance",
				label: "Compliance Officer",
				hint: "GDPR, HIPAA, SOC2",
			},
		],
		initialValues: ["orchestrator", "requirements", "architect"],
	});

	if (isCancel(agents)) {
		cancel("Operation cancelled");
		process.exit(0);
	}

	// Features
	const features = await multiselect({
		message: "Select features to include:",
		options: [
			{
				value: "real-time",
				label: "Real-time Updates",
				hint: "Socket.IO integration",
			},
			{
				value: "visualization",
				label: "Agent Visualization",
				hint: "D3.js network graphs",
			},
			{
				value: "monitoring",
				label: "Monitoring Dashboard",
				hint: "Prometheus + Grafana",
			},
			{
				value: "multi-tenant",
				label: "Multi-tenant Support",
				hint: "SaaS architecture",
			},
			{
				value: "norwegian",
				label: "Norwegian Compliance",
				hint: "BankID, NSM standards",
			},
			{ value: "wcag-aaa", label: "WCAG AAA", hint: "Enhanced accessibility" },
		],
		initialValues: ["real-time", "visualization", "wcag-aaa"],
	});

	if (isCancel(features)) {
		cancel("Operation cancelled");
		process.exit(0);
	}

	// API configuration
	const apiMode = await select({
		message: "Select API mode:",
		options: [
			{ value: "production", label: "Production", hint: "Requires API keys" },
			{
				value: "mock",
				label: "Mock Mode",
				hint: "Development without API keys",
			},
			{ value: "hybrid", label: "Hybrid", hint: "Mock fallback when offline" },
		],
	});

	if (isCancel(apiMode)) {
		cancel("Operation cancelled");
		process.exit(0);
	}

	// Create project
	const s = spinner();
	s.start("Creating your Xaheen project...");

	try {
		const projectPath = path.join(process.cwd(), projectName);

		// Create project structure
		await createProjectStructure(projectPath, {
			name: projectName,
			type: projectType as string,
			agents: agents as string[],
			features: features as string[],
			apiMode: apiMode as string,
		});

		// Apply Xaheen standards
		await applyXaheenStandards(projectPath);

		// Generate selected agents
		for (const agent of agents as string[]) {
			await generateAgent(projectPath, agent);
		}

		// Initialize git if requested
		if (options.git !== false) {
			await initializeGit(projectPath);
		}

		// Install dependencies if requested
		if (options.install !== false) {
			await installDependencies(projectPath);
		}

		s.stop("Project created successfully!");

		// Show development standards reminder
		note(
			chalk.yellow(`
Remember Xaheen Development Standards:
• NO raw HTML elements - use @xaheen/ui-system components only
• NO hardcoded styles - use design tokens exclusively
• NO 'any' types - strict TypeScript required
• ALL components must have explicit return types
• WCAG 2.2 AAA compliance is mandatory
• 95%+ test coverage required
    `),
			"Development Standards",
		);

		outro(
			chalk.green(`
✨ Your Xaheen project is ready!

${chalk.bold("Next steps:")}
  ${chalk.cyan(`cd ${projectName}`)}
  ${options.install === false ? chalk.cyan("npm install") : ""}
  ${chalk.cyan("npm run dev")}

${chalk.bold("Xaheen commands:")}
  ${chalk.gray("npm run xaheen:validate")}  - Validate code standards
  ${chalk.gray("npm run xaheen:component")} - Generate components
  ${chalk.gray("npm run xaheen:agent")}     - Create AI agents

${chalk.bold("Resources:")}
  📚 Docs: ${chalk.underline("https://xaheen.ai/docs")}
  🧠 Agent Guide: ${chalk.underline("https://xaheen.ai/agents")}
  🎨 Design System: ${chalk.underline("https://xaheen.ai/design")}

${chalk.dim("Built with AI-powered excellence by Xaheen")}
    `),
		);
	} catch (error) {
		s.stop("Failed to create project");
		console.error(chalk.red("Error:"), error);
		process.exit(1);
	}
}

async function validateXaheenProject(
	projectPath: string = ".",
	options: any,
): Promise<void> {
	intro(chalk.bgMagenta.white(" 🔍 Xaheen Code Validator "));

	const s = spinner();
	s.start("Analyzing code...");

	try {
		const result = await XaheenCodeValidator.validateProject(projectPath);
		s.stop();

		if (result.isValid) {
			outro(chalk.green("✅ All code meets Xaheen development standards!"));
		} else {
			console.log(
				chalk.red(`\n❌ Found ${result.errors.length} violations:\n`),
			);

			result.errors.forEach((error, index) => {
				console.log(chalk.red(`${index + 1}. ${error.file}:${error.line}`));
				console.log(chalk.gray(`   ${error.message}\n`));
			});

			if (options.fix) {
				const shouldFix = await confirm({
					message: "Attempt to fix violations automatically?",
				});

				if (shouldFix) {
					await attemptAutoFix(projectPath, result.errors);
				}
			}
		}
	} catch (error) {
		s.stop("Validation failed");
		console.error(chalk.red("Error:"), error);
		process.exit(1);
	}
}

async function generateXaheenComponent(
	name: string,
	options: any,
): Promise<void> {
	intro(chalk.bgMagenta.white(" 🧩 Xaheen Component Generator "));

	// Component configuration
	const componentType = await select({
		message: "Component type:",
		options: [
			{ value: "ui", label: "UI Component", hint: "Reusable UI element" },
			{ value: "feature", label: "Feature Component", hint: "Business logic" },
			{ value: "layout", label: "Layout Component", hint: "Page structure" },
			{ value: "agent-view", label: "Agent View", hint: "AI agent interface" },
		],
	});

	if (isCancel(componentType)) {
		cancel("Operation cancelled");
		process.exit(0);
	}

	const hooks = await multiselect({
		message: "Select React hooks to include:",
		options: [
			{ value: "useState", label: "useState" },
			{ value: "useEffect", label: "useEffect" },
			{ value: "useCallback", label: "useCallback" },
			{ value: "useMemo", label: "useMemo" },
			{ value: "useContext", label: "useContext" },
		],
	});

	if (isCancel(hooks)) {
		cancel("Operation cancelled");
		process.exit(0);
	}

	const s = spinner();
	s.start("Generating component...");

	try {
		const componentPath = path.join(process.cwd(), options.path, name);
		await fs.ensureDir(componentPath);

		// Generate main component
		const componentContent = XaheenComponentGenerator.generateComponent({
			name,
			hooks: hooks as string[],
			children: true,
		});

		await fs.writeFile(
			path.join(componentPath, `${name}.tsx`),
			componentContent,
		);

		// Generate index file
		await fs.writeFile(
			path.join(componentPath, "index.ts"),
			`export { ${name} } from './${name}';\nexport type { ${name}Props } from './${name}';\n`,
		);

		// Generate test file if requested
		if (options.withTests) {
			await generateTestFile(componentPath, name);
		}

		// Generate story file if requested
		if (options.withStory) {
			await generateStoryFile(componentPath, name);
		}

		s.stop("Component generated successfully!");

		outro(
			chalk.green(`
✅ Component ${name} created!

${chalk.bold("Files created:")}
  ${chalk.gray(`${options.path}/${name}/`)}
  ${chalk.gray(`  ├── ${name}.tsx`)}
  ${chalk.gray(`  ├── index.ts`)}
  ${options.withTests ? chalk.gray(`  ├── ${name}.test.tsx`) : ""}
  ${options.withStory ? chalk.gray(`  └── ${name}.stories.tsx`) : ""}

${chalk.bold("Usage:")}
  ${chalk.cyan(`import { ${name} } from '@/components/${name}';`)}
    `),
		);
	} catch (error) {
		s.stop("Failed to generate component");
		console.error(chalk.red("Error:"), error);
		process.exit(1);
	}
}

async function generateXaheenAgent(name: string, options: any): Promise<void> {
	intro(chalk.bgMagenta.white(" 🤖 Xaheen Agent Generator "));

	const agentType =
		options.type ||
		(await select({
			message: "Agent type:",
			options: [
				{
					value: "specialized",
					label: "Specialized Agent",
					hint: "Domain expert",
				},
				{
					value: "orchestrator",
					label: "Orchestrator",
					hint: "Coordinator agent",
				},
				{ value: "utility", label: "Utility Agent", hint: "Helper functions" },
			],
		}));

	if (isCancel(agentType)) {
		cancel("Operation cancelled");
		process.exit(0);
	}

	const capabilities = await multiselect({
		message: "Agent capabilities:",
		options: [
			{
				value: "memory",
				label: "Memory System",
				hint: "Short/long-term memory",
			},
			{ value: "communication", label: "Inter-agent Communication" },
			{ value: "learning", label: "Learning & Adaptation" },
			{ value: "context", label: "Context Management" },
			{ value: "validation", label: "Output Validation" },
		],
		initialValues: ["memory", "communication"],
	});

	if (isCancel(capabilities)) {
		cancel("Operation cancelled");
		process.exit(0);
	}

	const s = spinner();
	s.start("Generating AI agent...");

	try {
		await generateAgent(process.cwd(), name, {
			type: agentType as string,
			capabilities: capabilities as string[],
		});

		s.stop("Agent generated successfully!");

		outro(
			chalk.green(`
✅ Agent ${name} created!

${chalk.bold("Next steps:")}
  1. Configure the agent's system prompt
  2. Register in AgentOrchestrator
  3. Define collaboration patterns
  4. Add to agent expertise matrix

${chalk.bold("Agent location:")}
  ${chalk.gray(`src/agents/specialized/${name}Agent.ts`)}
    `),
		);
	} catch (error) {
		s.stop("Failed to generate agent");
		console.error(chalk.red("Error:"), error);
		process.exit(1);
	}
}

// Helper functions
async function createProjectStructure(
	projectPath: string,
	config: any,
): Promise<void> {
	// Create base structure
	const dirs = [
		"src/app",
		"src/components/ui",
		"src/components/features",
		"src/components/brand",
		"src/agents/base",
		"src/agents/specialized",
		"src/agents/orchestration",
		"src/api",
		"src/services",
		"src/models",
		"src/utils",
		"src/hooks",
		"src/types",
		"public",
		".vscode",
	];

	for (const dir of dirs) {
		await fs.ensureDir(path.join(projectPath, dir));
	}

	// Copy template files
	for (const [filePath, content] of Object.entries(XaheenAppTemplate)) {
		await fs.writeFile(path.join(projectPath, filePath), content);
	}

	// Create package.json
	await fs.writeJson(
		path.join(projectPath, "package.json"),
		{
			name: config.name,
			version: "0.1.0",
			private: true,
			scripts: {
				dev: "next dev",
				build: "next build",
				start: "next start",
				lint: "eslint . --ext .ts,.tsx",
				typecheck: "tsc --noEmit",
				test: "vitest",
				"test:coverage": "vitest --coverage",
				"xaheen:validate": "xaheen validate",
				"xaheen:component": "xaheen component",
				"xaheen:agent": "xaheen agent",
			},
			dependencies: {
				"@xaheen/ui-system": "^1.0.0",
				"@anthropic-ai/sdk": "^0.20.0",
				next: "^14.0.0",
				react: "^18.2.0",
				"react-dom": "^18.2.0",
				"socket.io-client": "^4.7.0",
				d3: "^7.8.0",
				zod: "^3.22.0",
			},
			devDependencies: {
				"@types/react": "^18.2.0",
				"@types/react-dom": "^18.2.0",
				"@types/node": "^20.0.0",
				"@types/d3": "^7.4.0",
				typescript: "^5.3.0",
				eslint: "^8.50.0",
				prettier: "^3.1.0",
				vitest: "^1.0.0",
				"@vitest/coverage-v8": "^1.0.0",
				"@testing-library/react": "^14.0.0",
				"@testing-library/jest-dom": "^6.0.0",
			},
		},
		{ spaces: 2 },
	);

	// Create environment example
	await fs.writeFile(
		path.join(projectPath, ".env.example"),
		`# AI Integration
ANTHROPIC_API_KEY=sk-ant-...

# API Configuration  
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

# Mock Mode
USE_MOCK_AGENTS=${config.apiMode === "mock" ? "true" : "false"}
`,
	);
}

async function applyXaheenStandards(projectPath: string): Promise<void> {
	// Already applied through template files
	// This function can be extended for additional standard enforcement
}

async function generateAgent(
	projectPath: string,
	agentName: string,
	config?: any,
): Promise<void> {
	const agentContent = `import { BaseAgent } from '../base/BaseAgent';
import { AgentCapability, AgentMessage, AgentResponse } from '@/types/agent';
import { Result, success, failure } from '@/utils/result';

export class ${agentName.charAt(0).toUpperCase() + agentName.slice(1)}Agent extends BaseAgent {
  constructor() {
    super('${agentName}-agent', '${agentName.charAt(0).toUpperCase() + agentName.slice(1)} Agent');
    this.initializeCapabilities();
  }

  protected initializeCapabilities(): void {
    this.capabilities = [
      AgentCapability.${agentName.toUpperCase()}_ANALYSIS,
      AgentCapability.COLLABORATION,
      ${config?.capabilities?.includes("memory") ? "AgentCapability.MEMORY_MANAGEMENT," : ""}
      ${config?.capabilities?.includes("learning") ? "AgentCapability.LEARNING," : ""}
    ];

    this.systemPrompt = \`You are a specialized ${agentName} agent in the Xaheen AI SaaS Factory.
    
Your expertise includes:
- [Define specific expertise areas]
- [Add domain knowledge]
- [Specify collaboration style]

You follow these principles:
1. Always use TypeScript with strict typing
2. Follow Xaheen development standards
3. Collaborate effectively with other agents
4. Provide clear, actionable outputs
\`;
  }

  async processMessage(message: AgentMessage): Promise<Result<AgentResponse, Error>> {
    try {
      // Validate input
      if (!message.content) {
        return failure(new Error('Message content is required'));
      }

      // Process with Claude
      const response = await this.analyzeWithClaude(message.content);
      
      // Structure response
      const structuredResponse = this.parseResponse(response);
      
      // Update memory if enabled
      ${config?.capabilities?.includes("memory") ? "await this.updateMemory(message, structuredResponse);" : ""}
      
      return success(structuredResponse);
    } catch (error) {
      return failure(error as Error);
    }
  }

  protected parseResponse(response: string): AgentResponse {
    // Implement response parsing logic
    return {
      agentId: this.id,
      agentName: this.name,
      content: response,
      metadata: {
        timestamp: new Date(),
        confidence: 0.95,
      },
    };
  }

  async processCollaborationMessage(
    message: AgentMessage,
    fromAgent: string
  ): Promise<Result<AgentResponse, Error>> {
    // Handle inter-agent communication
    return this.processMessage(message);
  }
}
`;

	const agentPath = path.join(
		projectPath,
		"src/agents/specialized",
		`${agentName.charAt(0).toUpperCase() + agentName.slice(1)}Agent.ts`,
	);

	await fs.writeFile(agentPath, agentContent);
}

async function initializeGit(projectPath: string): Promise<void> {
	const { execSync } = require("child_process");

	execSync("git init", { cwd: projectPath });
	execSync("git add .", { cwd: projectPath });
	execSync('git commit -m "Initial commit from Xaheen CLI"', {
		cwd: projectPath,
	});
}

async function installDependencies(projectPath: string): Promise<void> {
	const { execSync } = require("child_process");

	execSync("npm install", { cwd: projectPath, stdio: "inherit" });
}

async function attemptAutoFix(
	projectPath: string,
	errors: any[],
): Promise<void> {
	// Implement auto-fix logic for common violations
	// This is a placeholder for the actual implementation
	console.log(chalk.yellow("Auto-fix functionality coming soon..."));
}

async function generateTestFile(
	componentPath: string,
	name: string,
): Promise<void> {
	const testContent = `import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />);
    expect(screen.getByText('${name}')).toBeInTheDocument();
  });

  it('applies correct styling from design tokens', () => {
    const { container } = render(<${name} />);
    const card = container.querySelector('[data-component="card"]');
    expect(card).toHaveClass('variant-elevated', 'size-lg');
  });

  it('meets WCAG 2.2 AAA standards', () => {
    const { container } = render(<${name} />);
    // Add accessibility tests
    expect(container).toBeAccessible();
  });
});
`;

	await fs.writeFile(path.join(componentPath, `${name}.test.tsx`), testContent);
}

async function generateStoryFile(
	componentPath: string,
	name: string,
): Promise<void> {
	const storyContent = `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '${name} component following Xaheen development standards',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // Define arg types
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default ${name} content',
  },
};

export const WithCustomContent: Story = {
  args: {
    children: (
      <>
        <Text variant="heading" size="xl">Custom Content</Text>
        <Text variant="body" color="secondary">
          This demonstrates the component with custom children
        </Text>
      </>
    ),
  },
};
`;

	await fs.writeFile(
		path.join(componentPath, `${name}.stories.tsx`),
		storyContent,
	);
}
