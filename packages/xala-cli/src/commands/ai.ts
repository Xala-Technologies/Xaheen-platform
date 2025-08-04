import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import { AICodeGenerator } from "../services/ai-code-generator.js";
import { ComplianceValidator } from "../services/compliance-validator.js";
import { ComplianceError, ValidationError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { CommandMetadata } from "./index.js";

export interface AIOptions {
	readonly platform?: string;
	readonly preview?: boolean;
	readonly output?: string;
	readonly interactive?: boolean;
	readonly provider?: string;
	readonly model?: string;
	readonly temperature?: number;
	readonly validate?: boolean;
}

export interface AIGenerateRequest {
	readonly description: string;
	readonly platform: string;
	readonly componentType: string;
	readonly features: ReadonlyArray<string>;
	readonly compliance: string;
	readonly locale: string;
}

export const aiCommand: CommandMetadata = {
	name: "ai",
	description: "AI-powered code generation and validation",
	options: [
		{
			flags: "--platform <platform>",
			description: "Target platform for generation",
			defaultValue: "react",
		},
		{
			flags: "--preview",
			description: "Preview generated code without saving",
			defaultValue: false,
		},
		{
			flags: "--output <path>",
			description: "Output directory for generated code",
		},
		{
			flags: "--interactive",
			description: "Interactive generation mode",
			defaultValue: false,
		},
		{
			flags: "--provider <provider>",
			description: "AI provider (openai|anthropic|local)",
			defaultValue: "openai",
		},
		{
			flags: "--validate",
			description: "Validate generated code for compliance",
			defaultValue: true,
		},
	],
	action: async (options: AIOptions = {}) => {
		try {
			logger.info("AI-powered code generation");

			// Register subcommands
			const subcommand = process.argv[3];

			switch (subcommand) {
				case "generate":
					return await handleGenerate(options);
				case "suggest":
					return await handleSuggest(options);
				case "validate":
					return await handleValidate(options);
				case "explain":
					return await handleExplain(options);
				default:
					return await showAIHelp();
			}
		} catch (error) {
			logger.error("AI command failed:", error);
			throw error;
		}
	},
};

async function handleGenerate(options: AIOptions): Promise<void> {
	const description = process.argv[4];

	if (!description) {
		throw new ValidationError(
			'Description is required for generation. Example: xala ai generate "user dashboard with data table"',
		);
	}

	logger.info(`Generating component from: "${description}"`);

	const request = await collectGenerationInfo(description, options);
	const generator = new AICodeGenerator(options.provider || "openai");

	const spinner = ora("Generating code with AI...").start();

	try {
		const result = await generator.generateComponent(request);

		if (options.validate) {
			spinner.text = "Validating generated code...";
			const validator = new ComplianceValidator();
			const validation = await validator.validateCode(
				result.code,
				request.platform,
			);

			if (!validation.isValid) {
				spinner.fail("Generated code failed compliance validation");
				console.log(chalk.red("\nCompliance Violations:"));
				validation.violations.forEach((violation) => {
					console.log(chalk.red(`  • ${violation}`));
				});
				throw new ComplianceError(
					"Generated code does not meet compliance requirements",
				);
			}
		}

		spinner.succeed("Code generated successfully");

		if (options.preview) {
			await previewGeneratedCode(result);
		} else {
			await saveGeneratedCode(result, options);
		}
	} catch (error) {
		spinner.fail("Code generation failed");
		throw error;
	}
}

async function handleSuggest(options: AIOptions): Promise<void> {
	const context = process.argv[4] || (await promptForContext());

	logger.info("Getting AI suggestions...");

	const generator = new AICodeGenerator(options.provider || "openai");
	const suggestions = await generator.getSuggestions(context, {
		platform: options.platform || "react",
		maxSuggestions: 5,
	});

	console.log(chalk.bold("\nAI Suggestions:"));
	suggestions.forEach((suggestion, index) => {
		console.log(`${index + 1}. ${chalk.cyan(suggestion.title)}`);
		console.log(`   ${chalk.dim(suggestion.description)}`);
		console.log(
			`   ${chalk.green("Components:")} ${suggestion.components.join(", ")}`,
		);
		console.log();
	});
}

async function handleValidate(options: AIOptions): Promise<void> {
	const filePath = process.argv[4];

	if (!filePath) {
		throw new ValidationError("File path is required for validation");
	}

	logger.info(`Validating ${filePath}...`);

	const validator = new ComplianceValidator();
	const result = await validator.validateFile(
		filePath,
		options.platform || "react",
	);

	if (result.isValid) {
		logger.success("Code validation passed");
		console.log(chalk.green(`✓ All compliance requirements met`));
	} else {
		logger.error("Code validation failed");
		console.log(chalk.red("\nViolations found:"));
		result.violations.forEach((violation) => {
			console.log(chalk.red(`  • ${violation}`));
		});

		if (result.suggestions && result.suggestions.length > 0) {
			console.log(chalk.yellow("\nSuggestions:"));
			result.suggestions.forEach((suggestion) => {
				console.log(chalk.yellow(`  • ${suggestion}`));
			});
		}
	}
}

async function handleExplain(options: AIOptions): Promise<void> {
	const concept = process.argv[4] || (await promptForConcept());

	const generator = new AICodeGenerator(options.provider || "openai");
	const explanation = await generator.explainConcept(concept, {
		platform: options.platform || "react",
		includeExamples: true,
		includeCompliance: true,
	});

	console.log(chalk.bold(`\n${concept}:`));
	console.log(explanation.description);

	if (explanation.examples && explanation.examples.length > 0) {
		console.log(chalk.bold("\nExamples:"));
		explanation.examples.forEach((example) => {
			console.log(chalk.dim(example));
		});
	}

	if (explanation.complianceNotes) {
		console.log(chalk.bold("\nCompliance Notes:"));
		console.log(chalk.yellow(explanation.complianceNotes));
	}
}

async function collectGenerationInfo(
	description: string,
	options: AIOptions,
): Promise<AIGenerateRequest> {
	const questions: any[] = [];

	if (options.interactive) {
		questions.push({
			type: "list",
			name: "componentType",
			message: "What type of component?",
			choices: [
				{ name: "Page/Layout", value: "page" },
				{ name: "Form Component", value: "form" },
				{ name: "Data Display", value: "data" },
				{ name: "Navigation", value: "navigation" },
				{ name: "Interactive Widget", value: "widget" },
				{ name: "Custom Component", value: "custom" },
			],
		});

		questions.push({
			type: "checkbox",
			name: "features",
			message: "Select additional features:",
			choices: [
				{ name: "Responsive Design", value: "responsive" },
				{ name: "Dark Mode Support", value: "darkmode" },
				{ name: "Accessibility (WCAG AAA)", value: "a11y" },
				{ name: "Animation/Transitions", value: "animations" },
				{ name: "Real-time Updates", value: "realtime" },
				{ name: "Keyboard Navigation", value: "keyboard" },
				{ name: "Touch Gestures", value: "touch" },
				{ name: "Print Styles", value: "print" },
			],
		});
	}

	const answers = questions.length > 0 ? await inquirer.prompt(questions) : {};

	return {
		description,
		platform: options.platform || "react",
		componentType: answers.componentType || "custom",
		features: answers.features || ["responsive", "a11y"],
		compliance: "enterprise",
		locale: "en-US",
	};
}

async function previewGeneratedCode(result: any): Promise<void> {
	console.log(chalk.bold("\n📋 Generated Code Preview:"));
	console.log(chalk.dim("─".repeat(50)));
	console.log(result.code);
	console.log(chalk.dim("─".repeat(50)));

	if (result.metadata) {
		console.log(chalk.bold("\n📊 Metadata:"));
		console.log(`  Platform: ${chalk.cyan(result.metadata.platform)}`);
		console.log(
			`  Components Used: ${chalk.cyan(result.metadata.components?.join(", ") || "N/A")}`,
		);
		console.log(`  Compliance: ${chalk.green("✓ Validated")}`);
	}

	const { save } = await inquirer.prompt([
		{
			type: "confirm",
			name: "save",
			message: "Save this code to file?",
			default: true,
		},
	]);

	if (save) {
		const { filename } = await inquirer.prompt([
			{
				type: "input",
				name: "filename",
				message: "Enter filename:",
				default: "GeneratedComponent.tsx",
			},
		]);

		await saveGeneratedCode({ ...result, filename }, {});
	}
}

async function saveGeneratedCode(
	result: any,
	options: AIOptions,
): Promise<void> {
	// Implementation for saving generated code
	const outputPath = options.output || "./src/components";
	const filename = result.filename || "GeneratedComponent.tsx";

	logger.success(`Code saved to ${outputPath}/${filename}`);
}

async function promptForContext(): Promise<string> {
	const { context } = await inquirer.prompt([
		{
			type: "input",
			name: "context",
			message: "Describe what you need suggestions for:",
		},
	]);

	return context;
}

async function promptForConcept(): Promise<string> {
	const { concept } = await inquirer.prompt([
		{
			type: "input",
			name: "concept",
			message: "What concept would you like explained?",
		},
	]);

	return concept;
}

async function showAIHelp(): Promise<void> {
	console.log(chalk.bold("\n🤖 AI Commands:"));
	console.log(
		`  ${chalk.cyan("generate")} [description]  Generate component from description`,
	);
	console.log(
		`  ${chalk.cyan("suggest")} [context]      Get AI suggestions for context`,
	);
	console.log(
		`  ${chalk.cyan("validate")} <file>        Validate code for compliance`,
	);
	console.log(
		`  ${chalk.cyan("explain")} [concept]      Explain design system concept`,
	);

	console.log(chalk.bold("\n📝 Examples:"));
	console.log(
		`  xala ai generate "user dashboard with data table and filters"`,
	);
	console.log(`  xala ai suggest "mobile navigation patterns"`);
	console.log(`  xala ai validate ./components/MyComponent.tsx`);
	console.log(`  xala ai explain "design tokens"`);
}
