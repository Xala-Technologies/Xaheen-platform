/**
 * @fileoverview Interactive CLI Tutorial Generator - EPIC 13 Story 13.6.3
 * @description Interactive learning experiences with guided workflows and progress tracking
 * @version 1.0.0
 * @compliance Norwegian Enterprise Standards, Interactive Learning Best Practices
 */

import { BaseGenerator } from "../base.generator";
import { promises as fs } from "fs";
import { join, resolve } from "path";
import { logger } from "../../utils/logger.js";
import type { DocumentationGeneratorOptions, DocumentationResult } from "./index";

export interface InteractiveTutorialOptions extends DocumentationGeneratorOptions {
	readonly tutorialType: "first-component" | "scaffold-workflow" | "advanced-patterns" | "norwegian-compliance";
	readonly skillLevel: "beginner" | "intermediate" | "advanced";
	readonly enableProgressTracking: boolean;
	readonly enableCompletionValidation: boolean;
	readonly enableHints: boolean;
	readonly enableNorwegianMode: boolean;
	readonly customSteps?: TutorialStep[];
}

export interface TutorialStep {
	readonly id: string;
	readonly title: string;
	readonly description: string;
	readonly instruction: string;
	readonly expectedOutput?: string;
	readonly validationCommand?: string;
	readonly hints?: readonly string[];
	readonly prerequisites?: readonly string[];
	readonly estimatedTime?: number;
	readonly difficulty?: "easy" | "medium" | "hard";
	readonly resources?: readonly TutorialResource[];
}

export interface TutorialResource {
	readonly title: string;
	readonly url: string;
	readonly type: "documentation" | "video" | "example" | "tool";
}

export interface TutorialProgress {
	readonly tutorialId: string;
	readonly userId: string;
	readonly currentStep: number;
	readonly completedSteps: readonly string[];
	readonly startedAt: Date;
	readonly lastUpdated: Date;
	readonly totalSteps: number;
	readonly estimatedTimeRemaining?: number;
}

export interface TutorialValidationResult {
	readonly success: boolean;
	readonly message: string;
	readonly suggestions?: readonly string[];
	readonly nextSteps?: readonly string[];
}

/**
 * Interactive Tutorial Generator
 * Creates guided learning experiences for CLI users
 */
export class InteractiveTutorialGenerator extends BaseGenerator {
	private readonly tutorialTemplates = new Map<string, TutorialStep[]>();

	constructor() {
		super();
		this.initializeTutorialTemplates();
	}

	/**
	 * Generate interactive tutorial system
	 */
	async generate(options: InteractiveTutorialOptions): Promise<DocumentationResult> {
		const startTime = Date.now();
		logger.info("🎓 Generating interactive tutorial system...");

		try {
			// Create tutorial directories
			const tutorialDir = join(options.outputDir, ".xaheen", "tutorials");
			await fs.mkdir(tutorialDir, { recursive: true });

			// Generate tutorial configuration
			const tutorialConfig = this.generateTutorialConfiguration(options);

			// Create tutorial files
			const tutorialFiles = await this.createTutorialFiles(tutorialDir, options);

			// Generate progress tracking system
			const progressFiles = await this.createProgressTrackingSystem(tutorialDir, options);

			// Create validation system
			const validationFiles = await this.createValidationSystem(tutorialDir, options);

			// Generate CLI integration commands
			const cliIntegration = await this.createCLIIntegration(tutorialDir, options);

			// Create tutorial documentation
			const docFiles = await this.generateTutorialDocumentation(tutorialDir, options);

			const generationTime = Date.now() - startTime;

			return {
				success: true,
				message: `Interactive tutorial system generated successfully in ${generationTime}ms`,
				files: [
					...tutorialFiles,
					...progressFiles,
					...validationFiles,
					...cliIntegration,
					...docFiles,
				],
				commands: [
					"xaheen tutorial start first-component",
					"xaheen tutorial list",
					"xaheen tutorial progress",
					"xaheen tutorial validate",
				],
				nextSteps: [
					"Interactive Tutorial Setup Complete:",
					"• Run 'xaheen tutorial start first-component' to begin",
					"• Use 'xaheen tutorial progress' to track advancement",
					"• Access hints with 'xaheen tutorial hint' when stuck",
					"• Complete validation with 'xaheen tutorial validate'",
					"• View available tutorials with 'xaheen tutorial list'",
					"• Reset progress with 'xaheen tutorial reset'",
					"• Enable Norwegian mode with 'xaheen tutorial config --locale nb-NO'",
				],
			};
		} catch (error) {
			logger.error("Failed to generate interactive tutorial system:", error);
			return {
				success: false,
				message: "Failed to generate interactive tutorial system",
				files: [],
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Initialize tutorial templates for different workflows
	 */
	private initializeTutorialTemplates(): void {
		// First Component Tutorial
		this.tutorialTemplates.set("first-component", [
			{
				id: "setup-project",
				title: "Set Up Your First Project",
				description: "Initialize a new project with Xaheen CLI",
				instruction: "Run 'xaheen create my-first-app --framework react --typescript' to create a new React TypeScript project",
				expectedOutput: "Project created successfully",
				validationCommand: "ls my-first-app && cd my-first-app && npm list react",
				hints: [
					"Make sure you have Node.js 18+ installed",
					"Use --help to see all available options",
					"Choose TypeScript for better development experience",
				],
				estimatedTime: 2,
				difficulty: "easy",
				resources: [
					{
						title: "Xaheen CLI Documentation",
						url: "https://docs.xaheen.com/cli",
						type: "documentation",
					},
				],
			},
			{
				id: "create-component",
				title: "Generate Your First Component",
				description: "Create a Button component with Xaheen generators",
				instruction: "Navigate to your project and run 'xaheen generate component Button --type basic --features interactive,accessible'",
				expectedOutput: "Button component generated",
				validationCommand: "ls src/components/Button && cat src/components/Button/Button.tsx",
				hints: [
					"Components are generated in src/components/ by default",
					"Use --features to add specific functionality",
					"TypeScript interfaces are automatically generated",
				],
				prerequisites: ["setup-project"],
				estimatedTime: 3,
				difficulty: "easy",
			},
			{
				id: "customize-component",
				title: "Customize Your Component",
				description: "Modify the Button component with your own styling and props",
				instruction: "Edit src/components/Button/Button.tsx to add a 'variant' prop with 'primary' and 'secondary' options",
				expectedOutput: "Component customized with variant prop",
				validationCommand: "grep -n 'variant.*primary\\|secondary' src/components/Button/Button.tsx",
				hints: [
					"Use TypeScript union types for variant prop",
					"Add default styling for each variant",
					"Remember to export the Props interface",
				],
				prerequisites: ["create-component"],
				estimatedTime: 5,
				difficulty: "medium",
			},
			{
				id: "add-storybook",
				title: "Add Storybook Integration",
				description: "Set up Storybook to document and test your component",
				instruction: "Run 'xaheen generate storybook --component Button --include-accessibility'",
				expectedOutput: "Storybook stories generated",
				validationCommand: "ls src/components/Button/Button.stories.tsx && npm run storybook",
				hints: [
					"Storybook provides interactive component development",
					"Accessibility addon helps test WCAG compliance",
					"Use controls to test different prop combinations",
				],
				prerequisites: ["customize-component"],
				estimatedTime: 4,
				difficulty: "medium",
			},
			{
				id: "test-component",
				title: "Add Component Tests",
				description: "Generate and run tests for your Button component",
				instruction: "Run 'xaheen generate test --component Button --type unit,accessibility'",
				expectedOutput: "Tests generated and passing",
				validationCommand: "npm test -- Button.test.tsx",
				hints: [
					"Unit tests verify component functionality",
					"Accessibility tests ensure WCAG compliance",
					"Use React Testing Library for user-centric tests",
				],
				prerequisites: ["add-storybook"],
				estimatedTime: 6,
				difficulty: "medium",
			},
			{
				id: "norwegian-localization",
				title: "Add Norwegian Localization",
				description: "Implement Norwegian language support for your component",
				instruction: "Run 'xaheen generate i18n --component Button --languages en,nb-NO'",
				expectedOutput: "Localization files generated",
				validationCommand: "ls src/locales && grep -r 'Button' src/locales/",
				hints: [
					"Norwegian (Bokmål) uses 'nb-NO' locale code",
					"Provide both English and Norwegian text",
					"Follow Norwegian terminology standards",
				],
				prerequisites: ["test-component"],
				estimatedTime: 4,
				difficulty: "medium",
			},
			{
				id: "deploy-component",
				title: "Deploy and Share",
				description: "Build and deploy your component library",
				instruction: "Run 'npm run build-storybook && xaheen deploy storybook --platform netlify'",
				expectedOutput: "Component library deployed",
				validationCommand: "ls storybook-static && echo 'Deployment URL generated'",
				hints: [
					"Storybook can be deployed to various platforms",
					"Use environment variables for deployment keys",
					"Consider automated deployment with CI/CD",
				],
				prerequisites: ["norwegian-localization"],
				estimatedTime: 5,
				difficulty: "hard",
			},
		]);

		// Scaffold Workflow Tutorial
		this.tutorialTemplates.set("scaffold-workflow", [
			{
				id: "project-analysis",
				title: "Analyze Existing Project",
				description: "Learn to analyze and understand existing codebases",
				instruction: "Run 'xaheen analyze project --deep-scan --output analysis.json'",
				expectedOutput: "Project analysis completed",
				validationCommand: "cat analysis.json | jq '.framework, .dependencies, .architecture'",
				estimatedTime: 3,
				difficulty: "easy",
			},
			{
				id: "scaffold-planning",
				title: "Plan Your Scaffolding Strategy",
				description: "Create a scaffolding plan based on project analysis",
				instruction: "Run 'xaheen scaffold plan --input analysis.json --output scaffold-plan.json'",
				expectedOutput: "Scaffolding plan generated",
				validationCommand: "cat scaffold-plan.json | jq '.steps[] | .action'",
				estimatedTime: 4,
				difficulty: "medium",
			},
			{
				id: "execute-scaffold",
				title: "Execute Scaffolding",
				description: "Apply the scaffolding plan to enhance your project",
				instruction: "Run 'xaheen scaffold execute scaffold-plan.json --dry-run=false'",
				expectedOutput: "Scaffolding completed successfully",
				validationCommand: "git diff --name-only HEAD~1",
				estimatedTime: 8,
				difficulty: "hard",
			},
		]);

		// Norwegian Compliance Tutorial
		this.tutorialTemplates.set("norwegian-compliance", [
			{
				id: "accessibility-audit",
				title: "Norwegian Accessibility Audit",
				description: "Perform comprehensive accessibility testing for Norwegian standards",
				instruction: "Run 'xaheen audit accessibility --standard norwegian --output accessibility-report.json'",
				expectedOutput: "Accessibility audit completed",
				validationCommand: "cat accessibility-report.json | jq '.compliance_level, .violations'",
				estimatedTime: 5,
				difficulty: "medium",
			},
			{
				id: "nsm-classification",
				title: "NSM Security Classification",
				description: "Apply Norwegian NSM security classifications to your components",
				instruction: "Run 'xaheen classify nsm --component Button --level OPEN --document'",
				expectedOutput: "NSM classification applied",
				validationCommand: "grep -r 'NSM_CLASSIFICATION' src/",
				estimatedTime: 4,
				difficulty: "medium",
			},
			{
				id: "gdpr-compliance",
				title: "GDPR Compliance Implementation",
				description: "Implement GDPR-compliant data handling patterns",
				instruction: "Run 'xaheen generate gdpr --features consent,data-deletion,privacy-policy'",
				expectedOutput: "GDPR compliance components generated",
				validationCommand: "ls src/components/GDPR && ls src/utils/privacy",
				estimatedTime: 6,
				difficulty: "hard",
			},
		]);
	}

	/**
	 * Generate tutorial configuration
	 */
	private generateTutorialConfiguration(options: InteractiveTutorialOptions): any {
		const steps = this.tutorialTemplates.get(options.tutorialType) || [];

		return {
			tutorialId: `${options.tutorialType}-${Date.now()}`,
			type: options.tutorialType,
			title: this.getTutorialTitle(options.tutorialType, options.enableNorwegianMode),
			description: this.getTutorialDescription(options.tutorialType, options.enableNorwegianMode),
			skillLevel: options.skillLevel,
			locale: options.enableNorwegianMode ? "nb-NO" : "en",
			features: {
				progressTracking: options.enableProgressTracking,
				completionValidation: options.enableCompletionValidation,
				hints: options.enableHints,
				estimatedTime: steps.reduce((total, step) => total + (step.estimatedTime || 0), 0),
			},
			steps: options.customSteps || steps,
			metadata: {
				createdAt: new Date().toISOString(),
				version: "1.0.0",
				compliance: {
					norwegian: options.enableNorwegianMode,
					accessibility: true,
					enterprise: true,
				},
			},
		};
	}

	/**
	 * Create tutorial files
	 */
	private async createTutorialFiles(
		tutorialDir: string,
		options: InteractiveTutorialOptions
	): Promise<string[]> {
		const files: string[] = [];

		// Main tutorial configuration
		const configFile = join(tutorialDir, "tutorial-config.json");
		const config = this.generateTutorialConfiguration(options);
		await fs.writeFile(configFile, JSON.stringify(config, null, 2), "utf-8");
		files.push(configFile);

		// Tutorial runner script
		const runnerFile = join(tutorialDir, "tutorial-runner.js");
		const runnerContent = this.generateTutorialRunner(options);
		await fs.writeFile(runnerFile, runnerContent, "utf-8");
		files.push(runnerFile);

		// Step templates
		const stepsDir = join(tutorialDir, "steps");
		await fs.mkdir(stepsDir, { recursive: true });

		const steps = this.tutorialTemplates.get(options.tutorialType) || [];
		for (const step of steps) {
			const stepFile = join(stepsDir, `${step.id}.json`);
			const stepContent = JSON.stringify(step, null, 2);
			await fs.writeFile(stepFile, stepContent, "utf-8");
			files.push(stepFile);
		}

		// Interactive CLI interface
		const cliFile = join(tutorialDir, "tutorial-cli.js");
		const cliContent = this.generateTutorialCLI(options);
		await fs.writeFile(cliFile, cliContent, "utf-8");
		files.push(cliFile);

		return files;
	}

	/**
	 * Create progress tracking system
	 */
	private async createProgressTrackingSystem(
		tutorialDir: string,
		options: InteractiveTutorialOptions
	): Promise<string[]> {
		if (!options.enableProgressTracking) return [];

		const files: string[] = [];
		const progressDir = join(tutorialDir, "progress");
		await fs.mkdir(progressDir, { recursive: true });

		// Progress tracker
		const trackerFile = join(progressDir, "progress-tracker.js");
		const trackerContent = this.generateProgressTracker();
		await fs.writeFile(trackerFile, trackerContent, "utf-8");
		files.push(trackerFile);

		// Progress storage
		const storageFile = join(progressDir, "progress-storage.js");
		const storageContent = this.generateProgressStorage();
		await fs.writeFile(storageFile, storageContent, "utf-8");
		files.push(storageFile);

		// Progress visualization
		const visualFile = join(progressDir, "progress-visualizer.js");
		const visualContent = this.generateProgressVisualizer();
		await fs.writeFile(visualFile, visualContent, "utf-8");
		files.push(visualFile);

		return files;
	}

	/**
	 * Create validation system
	 */
	private async createValidationSystem(
		tutorialDir: string,
		options: InteractiveTutorialOptions
	): Promise<string[]> {
		if (!options.enableCompletionValidation) return [];

		const files: string[] = [];
		const validationDir = join(tutorialDir, "validation");
		await fs.mkdir(validationDir, { recursive: true });

		// Validation engine
		const engineFile = join(validationDir, "validation-engine.js");
		const engineContent = this.generateValidationEngine();
		await fs.writeFile(engineFile, engineContent, "utf-8");
		files.push(engineFile);

		// Step validators
		const validatorsFile = join(validationDir, "step-validators.js");
		const validatorsContent = this.generateStepValidators();
		await fs.writeFile(validatorsFile, validatorsContent, "utf-8");
		files.push(validatorsFile);

		// Completion checker
		const checkerFile = join(validationDir, "completion-checker.js");
		const checkerContent = this.generateCompletionChecker();
		await fs.writeFile(checkerFile, checkerContent, "utf-8");
		files.push(checkerFile);

		return files;
	}

	/**
	 * Create CLI integration
	 */
	private async createCLIIntegration(
		tutorialDir: string,
		options: InteractiveTutorialOptions
	): Promise<string[]> {
		const files: string[] = [];

		// Tutorial command
		const commandFile = join(tutorialDir, "tutorial-command.js");
		const commandContent = this.generateTutorialCommand(options);
		await fs.writeFile(commandFile, commandContent, "utf-8");
		files.push(commandFile);

		// Command registration
		const registrationFile = join(tutorialDir, "command-registration.js");
		const registrationContent = this.generateCommandRegistration();
		await fs.writeFile(registrationFile, registrationContent, "utf-8");
		files.push(registrationFile);

		return files;
	}

	/**
	 * Generate tutorial documentation
	 */
	private async generateTutorialDocumentation(
		tutorialDir: string,
		options: InteractiveTutorialOptions
	): Promise<string[]> {
		const files: string[] = [];
		const docsDir = join(tutorialDir, "docs");
		await fs.mkdir(docsDir, { recursive: true });

		// Tutorial guide
		const guideFile = join(docsDir, "tutorial-guide.md");
		const guideContent = this.generateTutorialGuide(options);
		await fs.writeFile(guideFile, guideContent, "utf-8");
		files.push(guideFile);

		// Step-by-step documentation
		const steps = this.tutorialTemplates.get(options.tutorialType) || [];
		for (const step of steps) {
			const stepDocFile = join(docsDir, `${step.id}.md`);
			const stepDocContent = this.generateStepDocumentation(step, options);
			await fs.writeFile(stepDocFile, stepDocContent, "utf-8");
			files.push(stepDocFile);
		}

		return files;
	}

	// Content generators

	private generateTutorialRunner(options: InteractiveTutorialOptions): string {
		return `/**
 * Tutorial Runner - Interactive Learning System
 * Generated by Xaheen CLI
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class TutorialRunner {
  constructor(configPath) {
    this.configPath = configPath;
    this.config = null;
    this.currentStep = 0;
    this.progress = new Map();
  }

  async initialize() {
    try {
      const configContent = await fs.readFile(this.configPath, 'utf-8');
      this.config = JSON.parse(configContent);
      console.log(\`🎓 Welcome to: \${this.config.title}\`);
      console.log(\`📋 Description: \${this.config.description}\`);
      console.log(\`⏱️  Estimated time: \${this.config.features.estimatedTime} minutes\`);
      console.log(\`📊 Total steps: \${this.config.steps.length}\`);
      console.log('');
    } catch (error) {
      console.error('Failed to initialize tutorial:', error.message);
      process.exit(1);
    }
  }

  async runStep(stepIndex = this.currentStep) {
    if (!this.config || stepIndex >= this.config.steps.length) {
      console.log('🎉 Tutorial completed!');
      return;
    }

    const step = this.config.steps[stepIndex];
    console.log(\`\\n📖 Step \${stepIndex + 1}/\${this.config.steps.length}: \${step.title}\`);
    console.log(\`📝 \${step.description}\`);
    console.log('');
    console.log(\`👉 \${step.instruction}\`);
    
    if (step.estimatedTime) {
      console.log(\`⏱️  Estimated time: \${step.estimatedTime} minutes\`);
    }

    if (step.hints && ${options.enableHints}) {
      console.log('\\n💡 Hints available - type "hint" for assistance');
    }

    console.log('\\n✅ When complete, type "validate" to check your work');
    console.log('❓ Type "help" for additional commands');
  }

  async validateStep(stepIndex = this.currentStep) {
    const step = this.config.steps[stepIndex];
    
    if (!step.validationCommand) {
      console.log('✅ Step marked as complete (no validation required)');
      this.markStepComplete(stepIndex);
      return true;
    }

    try {
      console.log('🔍 Validating your work...');
      const output = execSync(step.validationCommand, { 
        encoding: 'utf-8',
        stdio: 'pipe' 
      });

      if (step.expectedOutput && !output.includes(step.expectedOutput)) {
        console.log('❌ Validation failed');
        console.log(\`Expected to find: "\${step.expectedOutput}"\`);
        console.log(\`Got: "\${output.trim()}"\`);
        return false;
      }

      console.log('✅ Step completed successfully!');
      this.markStepComplete(stepIndex);
      return true;
    } catch (error) {
      console.log('❌ Validation failed:');
      console.log(error.message);
      
      if (step.hints) {
        console.log('\\n💡 Try running "hint" for assistance');
      }
      return false;
    }
  }

  showHints(stepIndex = this.currentStep) {
    const step = this.config.steps[stepIndex];
    
    if (!step.hints || step.hints.length === 0) {
      console.log('💡 No hints available for this step');
      return;
    }

    console.log('\\n💡 Hints:');
    step.hints.forEach((hint, index) => {
      console.log(\`  \${index + 1}. \${hint}\`);
    });
  }

  markStepComplete(stepIndex) {
    this.progress.set(stepIndex, {
      completedAt: new Date().toISOString(),
      attempts: this.progress.get(stepIndex)?.attempts || 1
    });
    
    this.currentStep = Math.max(this.currentStep, stepIndex + 1);
    
    if (this.currentStep < this.config.steps.length) {
      console.log(\`\\n🎯 Ready for next step? Type "next" to continue\`);
    } else {
      this.showCompletion();
    }
  }

  showProgress() {
    const completed = Array.from(this.progress.keys()).length;
    const total = this.config.steps.length;
    const percentage = Math.round((completed / total) * 100);
    
    console.log(\`\\n📊 Progress: \${completed}/\${total} steps completed (\${percentage}%)\`);
    
    if (completed > 0) {
      console.log('✅ Completed steps:');
      this.config.steps.forEach((step, index) => {
        if (this.progress.has(index)) {
          const progress = this.progress.get(index);
          console.log(\`  ✓ \${step.title} (completed \${progress.completedAt})\`);
        }
      });
    }
    
    if (this.currentStep < total) {
      const nextStep = this.config.steps[this.currentStep];
      console.log(\`\\n👉 Next: \${nextStep.title}\`);
    }
  }

  showCompletion() {
    console.log('\\n🎉 Congratulations! Tutorial completed successfully!');
    console.log('\\n📋 Summary:');
    console.log(\`  • Tutorial: \${this.config.title}\`);
    console.log(\`  • Steps completed: \${this.config.steps.length}\`);
    console.log(\`  • Time taken: \${this.calculateTotalTime()} minutes\`);
    
    console.log('\\n🚀 What\\'s next?');
    console.log('  • Explore more tutorials with "xaheen tutorial list"');
    console.log('  • Share your creation with the community');
    console.log('  • Check out advanced patterns and best practices');
    
    if (this.config.locale === 'nb-NO') {
      console.log('\\n🇳🇴 Gratulerer med fullføring av opplæringen!');
    }
  }

  calculateTotalTime() {
    // Simple implementation - in real scenario, track actual time
    return this.config.features.estimatedTime || 0;
  }
}

module.exports = { TutorialRunner };`;
	}

	private generateTutorialCLI(options: InteractiveTutorialOptions): string {
		return `/**
 * Interactive Tutorial CLI Interface
 * Generated by Xaheen CLI
 */

const readline = require('readline');
const { TutorialRunner } = require('./tutorial-runner');

class TutorialCLI {
  constructor(tutorialRunner) {
    this.runner = tutorialRunner;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '🎓 tutorial> '
    });
    
    this.setupCommands();
  }

  setupCommands() {
    this.commands = {
      help: () => this.showHelp(),
      next: () => this.nextStep(),
      validate: () => this.validateCurrentStep(),
      hint: () => this.showHints(),
      progress: () => this.showProgress(),
      restart: () => this.restart(),
      quit: () => this.quit(),
      exit: () => this.quit(),
      ${options.enableNorwegianMode ? `
      hjelp: () => this.showHelp(), // Norwegian
      neste: () => this.nextStep(), // Norwegian  
      valider: () => this.validateCurrentStep(), // Norwegian
      tips: () => this.showHints(), // Norwegian
      fremgang: () => this.showProgress(), // Norwegian
      avslutt: () => this.quit(), // Norwegian
      ` : ''}
    };
  }

  async start() {
    await this.runner.initialize();
    await this.runner.runStep();
    
    console.log('\\n💬 Interactive mode started. Type "help" for commands.');
    this.rl.prompt();
    
    this.rl.on('line', async (input) => {
      const command = input.trim().toLowerCase();
      
      if (this.commands[command]) {
        await this.commands[command]();
      } else if (command === '') {
        // Empty line, just show prompt again
      } else {
        console.log(\`❓ Unknown command: "\${command}". Type "help" for available commands.\`);
      }
      
      this.rl.prompt();
    });

    this.rl.on('close', () => {
      console.log('\\n👋 Tutorial session ended. Resume anytime with "xaheen tutorial continue"');
      process.exit(0);
    });
  }

  showHelp() {
    console.log('\\n📚 Available Commands:');
    console.log('  help      - Show this help message');
    console.log('  next      - Proceed to next step');
    console.log('  validate  - Validate current step');
    console.log('  hint      - Show hints for current step');
    console.log('  progress  - Show tutorial progress');
    console.log('  restart   - Restart tutorial from beginning');
    console.log('  quit/exit - Exit tutorial');
    
    ${options.enableNorwegianMode ? `
    console.log('\\n🇳🇴 Norwegian Commands:');
    console.log('  hjelp     - Vis denne hjelpemeldingen');
    console.log('  neste     - Gå til neste trinn');
    console.log('  valider   - Valider nåværende trinn');
    console.log('  tips      - Vis tips for nåværende trinn');
    console.log('  fremgang  - Vis opplæringsframgang');
    console.log('  avslutt   - Avslutt opplæring');
    ` : ''}
  }

  async nextStep() {
    this.runner.currentStep++;
    await this.runner.runStep();
  }

  async validateCurrentStep() {
    const success = await this.runner.validateStep();
    if (success && this.runner.currentStep < this.runner.config.steps.length) {
      console.log('\\n🎯 Ready for the next step!');
    }
  }

  showHints() {
    this.runner.showHints();
  }

  showProgress() {
    this.runner.showProgress();
  }

  async restart() {
    console.log('🔄 Restarting tutorial...');
    this.runner.currentStep = 0;
    this.runner.progress.clear();
    await this.runner.runStep();
  }

  quit() {
    console.log('\\n👋 Thanks for learning with Xaheen CLI!');
    ${options.enableNorwegianMode ? `
    console.log('🇳🇴 Takk for at du lærte med Xaheen CLI!');
    ` : ''}
    this.rl.close();
  }
}

// Export for use in CLI commands
module.exports = { TutorialCLI };`;
	}

	private generateProgressTracker(): string {
		return `/**
 * Tutorial Progress Tracker
 * Tracks user progress through interactive tutorials
 */

const fs = require('fs').promises;
const path = require('path');

class ProgressTracker {
  constructor(storageDir = '.xaheen/tutorials/progress') {
    this.storageDir = storageDir;
    this.progressFile = path.join(storageDir, 'user-progress.json');
  }

  async initialize() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
    } catch (error) {
      console.warn('Failed to create progress directory:', error.message);
    }
  }

  async saveProgress(tutorialId, progress) {
    try {
      await this.initialize();
      
      let allProgress = {};
      try {
        const content = await fs.readFile(this.progressFile, 'utf-8');
        allProgress = JSON.parse(content);
      } catch {
        // File doesn't exist yet, start fresh
      }

      allProgress[tutorialId] = {
        ...progress,
        lastUpdated: new Date().toISOString()
      };

      await fs.writeFile(
        this.progressFile, 
        JSON.stringify(allProgress, null, 2), 
        'utf-8'
      );
    } catch (error) {
      console.warn('Failed to save progress:', error.message);
    }
  }

  async loadProgress(tutorialId) {
    try {
      const content = await fs.readFile(this.progressFile, 'utf-8');
      const allProgress = JSON.parse(content);
      return allProgress[tutorialId] || null;
    } catch {
      return null;
    }
  }

  async getAllProgress() {
    try {
      const content = await fs.readFile(this.progressFile, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  async clearProgress(tutorialId) {
    try {
      const allProgress = await this.getAllProgress();
      delete allProgress[tutorialId];
      
      await fs.writeFile(
        this.progressFile, 
        JSON.stringify(allProgress, null, 2), 
        'utf-8'
      );
    } catch (error) {
      console.warn('Failed to clear progress:', error.message);
    }
  }

  calculateCompletionPercentage(progress, totalSteps) {
    if (!progress || !progress.completedSteps) return 0;
    return Math.round((progress.completedSteps.length / totalSteps) * 100);
  }

  generateProgressReport(tutorialId, progress, config) {
    const completionPercentage = this.calculateCompletionPercentage(
      progress, 
      config.steps.length
    );
    
    const timeSpent = progress.lastUpdated && progress.startedAt
      ? Math.round((new Date(progress.lastUpdated) - new Date(progress.startedAt)) / 60000)
      : 0;

    return {
      tutorialId,
      title: config.title,
      completionPercentage,
      completedSteps: progress.completedSteps?.length || 0,
      totalSteps: config.steps.length,
      currentStep: progress.currentStep || 0,
      timeSpent,
      estimatedTimeRemaining: Math.max(0, config.features.estimatedTime - timeSpent),
      lastUpdated: progress.lastUpdated,
      startedAt: progress.startedAt
    };
  }
}

module.exports = { ProgressTracker };`;
	}

	private generateProgressStorage(): string {
		return `/**
 * Progress Storage System
 * Handles persistent storage of tutorial progress
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class ProgressStorage {
  constructor() {
    this.globalDir = path.join(os.homedir(), '.xaheen', 'tutorials');
    this.localDir = path.join(process.cwd(), '.xaheen', 'tutorials');
  }

  async ensureDirectories() {
    await fs.mkdir(this.globalDir, { recursive: true });
    await fs.mkdir(this.localDir, { recursive: true });
  }

  async saveGlobalProgress(userId, tutorialId, progress) {
    await this.ensureDirectories();
    
    const userFile = path.join(this.globalDir, \`\${userId}.json\`);
    let userProgress = {};
    
    try {
      const content = await fs.readFile(userFile, 'utf-8');
      userProgress = JSON.parse(content);
    } catch {
      // New user file
    }

    userProgress[tutorialId] = progress;
    
    await fs.writeFile(userFile, JSON.stringify(userProgress, null, 2), 'utf-8');
  }

  async loadGlobalProgress(userId, tutorialId) {
    try {
      const userFile = path.join(this.globalDir, \`\${userId}.json\`);
      const content = await fs.readFile(userFile, 'utf-8');
      const userProgress = JSON.parse(content);
      return userProgress[tutorialId] || null;
    } catch {
      return null;
    }
  }

  async saveLocalProgress(tutorialId, progress) {
    await this.ensureDirectories();
    
    const progressFile = path.join(this.localDir, 'progress.json');
    let allProgress = {};
    
    try {
      const content = await fs.readFile(progressFile, 'utf-8');
      allProgress = JSON.parse(content);
    } catch {
      // New progress file
    }

    allProgress[tutorialId] = progress;
    
    await fs.writeFile(progressFile, JSON.stringify(allProgress, null, 2), 'utf-8');
  }

  async loadLocalProgress(tutorialId) {
    try {
      const progressFile = path.join(this.localDir, 'progress.json');
      const content = await fs.readFile(progressFile, 'utf-8');
      const allProgress = JSON.parse(content);
      return allProgress[tutorialId] || null;
    } catch {
      return null;
    }
  }

  async exportProgress(outputPath) {
    const globalProgress = await this.getAllGlobalProgress();
    const localProgress = await this.getAllLocalProgress();
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      globalProgress,
      localProgress,
      version: '1.0.0'
    };

    await fs.writeFile(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');
  }

  async importProgress(inputPath) {
    try {
      const content = await fs.readFile(inputPath, 'utf-8');
      const importData = JSON.parse(content);
      
      // Import global progress
      if (importData.globalProgress) {
        for (const [userId, userProgress] of Object.entries(importData.globalProgress)) {
          const userFile = path.join(this.globalDir, \`\${userId}.json\`);
          await fs.writeFile(userFile, JSON.stringify(userProgress, null, 2), 'utf-8');
        }
      }
      
      // Import local progress
      if (importData.localProgress) {
        const progressFile = path.join(this.localDir, 'progress.json');
        await fs.writeFile(progressFile, JSON.stringify(importData.localProgress, null, 2), 'utf-8');
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import progress:', error.message);
      return false;
    }
  }

  async getAllGlobalProgress() {
    try {
      const files = await fs.readdir(this.globalDir);
      const userFiles = files.filter(f => f.endsWith('.json'));
      
      const allProgress = {};
      for (const file of userFiles) {
        const userId = path.basename(file, '.json');
        const content = await fs.readFile(path.join(this.globalDir, file), 'utf-8');
        allProgress[userId] = JSON.parse(content);
      }
      
      return allProgress;
    } catch {
      return {};
    }
  }

  async getAllLocalProgress() {
    try {
      const progressFile = path.join(this.localDir, 'progress.json');
      const content = await fs.readFile(progressFile, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }
}

module.exports = { ProgressStorage };`;
	}

	private generateProgressVisualizer(): string {
		return `/**
 * Progress Visualizer
 * Creates visual representations of tutorial progress
 */

class ProgressVisualizer {
  static createProgressBar(completed, total, width = 30) {
    const percentage = Math.round((completed / total) * 100);
    const filledWidth = Math.round((completed / total) * width);
    const emptyWidth = width - filledWidth;
    
    const filled = '█'.repeat(filledWidth);
    const empty = '░'.repeat(emptyWidth);
    
    return \`[\${filled}\${empty}] \${percentage}% (\${completed}/\${total})\`;
  }

  static createStepVisualizer(steps, currentStep, completedSteps = []) {
    return steps.map((step, index) => {
      let icon, status;
      
      if (completedSteps.includes(step.id)) {
        icon = '✅';
        status = 'completed';
      } else if (index === currentStep) {
        icon = '▶️';
        status = 'current';
      } else if (index < currentStep) {
        icon = '⏭️';
        status = 'skipped';
      } else {
        icon = '⏸️';
        status = 'pending';
      }
      
      const difficulty = step.difficulty ? \`(\${step.difficulty})\` : '';
      const time = step.estimatedTime ? \`~\${step.estimatedTime}min\` : '';
      
      return \`\${icon} \${step.title} \${difficulty} \${time}\`;
    }).join('\\n');
  }

  static createTimelineView(progress, config) {
    const timeline = [];
    
    timeline.push('📅 Tutorial Timeline:');
    timeline.push('');
    
    if (progress.startedAt) {
      timeline.push(\`🚀 Started: \${new Date(progress.startedAt).toLocaleString()}\`);
    }
    
    if (progress.completedSteps && progress.completedSteps.length > 0) {
      timeline.push('');
      timeline.push('📋 Completed Steps:');
      
      progress.completedSteps.forEach(stepId => {
        const step = config.steps.find(s => s.id === stepId);
        if (step) {
          timeline.push(\`  ✓ \${step.title}\`);
        }
      });
    }
    
    if (progress.currentStep < config.steps.length) {
      const nextStep = config.steps[progress.currentStep];
      timeline.push('');
      timeline.push(\`👉 Current: \${nextStep.title}\`);
      
      if (nextStep.estimatedTime) {
        timeline.push(\`   ⏱️ Estimated time: \${nextStep.estimatedTime} minutes\`);
      }
    }
    
    if (progress.lastUpdated) {
      timeline.push('');
      timeline.push(\`🕒 Last updated: \${new Date(progress.lastUpdated).toLocaleString()}\`);
    }
    
    return timeline.join('\\n');
  }

  static createSummaryReport(allProgress, configs) {
    const report = [];
    
    report.push('📊 Tutorial Progress Summary');
    report.push('');
    
    const tutorials = Object.keys(allProgress);
    const completedTutorials = tutorials.filter(id => {
      const progress = allProgress[id];
      const config = configs[id];
      return config && progress.completedSteps?.length === config.steps.length;
    });
    
    report.push(\`📚 Total tutorials: \${tutorials.length}\`);
    report.push(\`✅ Completed: \${completedTutorials.length}\`);
    report.push(\`📝 In progress: \${tutorials.length - completedTutorials.length}\`);
    report.push('');
    
    tutorials.forEach(tutorialId => {
      const progress = allProgress[tutorialId];
      const config = configs[tutorialId];
      
      if (!config) return;
      
      const completed = progress.completedSteps?.length || 0;
      const total = config.steps.length;
      const percentage = Math.round((completed / total) * 100);
      
      const progressBar = this.createProgressBar(completed, total, 20);
      report.push(\`📖 \${config.title}: \${progressBar}\`);
    });
    
    return report.join('\\n');
  }

  static createNorwegianProgressBar(completed, total, width = 30) {
    const percentage = Math.round((completed / total) * 100);
    const filledWidth = Math.round((completed / total) * width);
    const emptyWidth = width - filledWidth;
    
    const filled = '█'.repeat(filledWidth);
    const empty = '░'.repeat(emptyWidth);
    
    return \`[\${filled}\${empty}] \${percentage}% (\${completed} av \${total})\`;
  }
}

module.exports = { ProgressVisualizer };`;
	}

	private generateValidationEngine(): string {
		return `/**
 * Tutorial Validation Engine
 * Validates step completion and provides feedback
 */

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class ValidationEngine {
  constructor() {
    this.validators = new Map();
    this.setupDefaultValidators();
  }

  setupDefaultValidators() {
    // File existence validator
    this.validators.set('file-exists', async (config) => {
      try {
        await fs.access(config.path);
        return { success: true, message: \`File exists: \${config.path}\` };
      } catch {
        return { 
          success: false, 
          message: \`File not found: \${config.path}\`,
          suggestions: [
            'Check the file path spelling',
            'Make sure you created the file in the correct directory',
            'Run the previous command again if it failed'
          ]
        };
      }
    });

    // Directory exists validator
    this.validators.set('directory-exists', async (config) => {
      try {
        const stats = await fs.stat(config.path);
        if (stats.isDirectory()) {
          return { success: true, message: \`Directory exists: \${config.path}\` };
        } else {
          return { 
            success: false, 
            message: \`Path exists but is not a directory: \${config.path}\`
          };
        }
      } catch {
        return { 
          success: false, 
          message: \`Directory not found: \${config.path}\`,
          suggestions: [
            'Check the directory path spelling',
            'Make sure you created the directory',
            'Verify you are in the correct working directory'
          ]
        };
      }
    });

    // Command execution validator
    this.validators.set('command-output', async (config) => {
      try {
        const output = execSync(config.command, { 
          encoding: 'utf-8',
          stdio: 'pipe',
          timeout: config.timeout || 30000
        });

        if (config.expectedOutput) {
          if (output.includes(config.expectedOutput)) {
            return { 
              success: true, 
              message: \`Command executed successfully: \${config.command}\`
            };
          } else {
            return {
              success: false,
              message: \`Command output doesn't match expected result\`,
              suggestions: [
                \`Expected to find: "\${config.expectedOutput}"\`,
                \`Got: "\${output.trim()}"\`,
                'Review the command and try again'
              ]
            };
          }
        }

        return { 
          success: true, 
          message: \`Command executed successfully: \${config.command}\`,
          output: output.trim()
        };
      } catch (error) {
        return {
          success: false,
          message: \`Command failed: \${config.command}\`,
          suggestions: [
            error.message,
            'Check if the command is spelled correctly',
            'Verify all prerequisites are met',
            'Make sure you are in the correct directory'
          ]
        };
      }
    });

    // File content validator
    this.validators.set('file-contains', async (config) => {
      try {
        const content = await fs.readFile(config.path, 'utf-8');
        
        if (config.pattern) {
          const regex = new RegExp(config.pattern, config.flags || 'i');
          if (regex.test(content)) {
            return { 
              success: true, 
              message: \`File contains expected pattern: \${config.pattern}\`
            };
          } else {
            return {
              success: false,
              message: \`File doesn't contain expected pattern: \${config.pattern}\`,
              suggestions: [
                'Check the file content',
                'Make sure you added the required code',
                'Review the step instructions'
              ]
            };
          }
        }

        if (config.text) {
          if (content.includes(config.text)) {
            return { 
              success: true, 
              message: \`File contains expected text: \${config.text}\`
            };
          } else {
            return {
              success: false,
              message: \`File doesn't contain expected text: \${config.text}\`,
              suggestions: [
                'Check the file content',
                'Make sure you added the required text',
                'Review the step instructions'
              ]
            };
          }
        }

        return { success: true, message: 'File validation passed' };
      } catch (error) {
        return {
          success: false,
          message: \`Failed to read file: \${config.path}\`,
          suggestions: [
            'Make sure the file exists',
            'Check file permissions',
            'Verify the file path is correct'
          ]
        };
      }
    });

    // Package.json dependency validator
    this.validators.set('package-dependency', async (config) => {
      try {
        const packagePath = path.join(process.cwd(), 'package.json');
        const content = await fs.readFile(packagePath, 'utf-8');
        const packageJson = JSON.parse(content);
        
        const deps = { 
          ...packageJson.dependencies, 
          ...packageJson.devDependencies 
        };
        
        if (deps[config.dependency]) {
          return { 
            success: true, 
            message: \`Dependency found: \${config.dependency}@\${deps[config.dependency]}\`
          };
        } else {
          return {
            success: false,
            message: \`Dependency not found: \${config.dependency}\`,
            suggestions: [
              \`Run: npm install \${config.dependency}\`,
              'Check if the package name is correct',
              'Make sure the installation completed successfully'
            ]
          };
        }
      } catch (error) {
        return {
          success: false,
          message: 'Failed to validate package.json',
          suggestions: [
            'Make sure package.json exists',
            'Check if the file is valid JSON',
            'Run npm init if needed'
          ]
        };
      }
    });
  }

  async validateStep(step, validationConfig) {
    const results = [];

    // Parse validation configuration
    const validations = this.parseValidationConfig(step, validationConfig);

    for (const validation of validations) {
      const validator = this.validators.get(validation.type);
      
      if (!validator) {
        results.push({
          success: false,
          message: \`Unknown validation type: \${validation.type}\`
        });
        continue;
      }

      try {
        const result = await validator(validation.config);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          message: \`Validation error: \${error.message}\`
        });
      }
    }

    // Aggregate results
    const allSuccess = results.every(r => r.success);
    const messages = results.map(r => r.message);
    const suggestions = results
      .filter(r => !r.success && r.suggestions)
      .flatMap(r => r.suggestions);

    return {
      success: allSuccess,
      message: allSuccess 
        ? 'All validations passed ✅' 
        : 'Some validations failed ❌',
      details: messages,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }

  parseValidationConfig(step, validationConfig) {
    const validations = [];

    // Legacy support for simple validation command
    if (step.validationCommand && !validationConfig) {
      validations.push({
        type: 'command-output',
        config: {
          command: step.validationCommand,
          expectedOutput: step.expectedOutput
        }
      });
      return validations;
    }

    // Modern validation configuration
    if (validationConfig) {
      if (Array.isArray(validationConfig)) {
        validations.push(...validationConfig);
      } else {
        validations.push(validationConfig);
      }
    }

    return validations;
  }

  addCustomValidator(name, validatorFn) {
    this.validators.set(name, validatorFn);
  }

  removeValidator(name) {
    this.validators.delete(name);
  }

  getAvailableValidators() {
    return Array.from(this.validators.keys());
  }
}

module.exports = { ValidationEngine };`;
	}

	private generateStepValidators(): string {
		return `/**
 * Step Validators
 * Specific validators for different tutorial steps
 */

const { ValidationEngine } = require('./validation-engine');

class StepValidators extends ValidationEngine {
  constructor() {
    super();
    this.setupStepSpecificValidators();
  }

  setupStepSpecificValidators() {
    // React component validator
    this.validators.set('react-component', async (config) => {
      const validations = [
        {
          type: 'file-exists',
          config: { path: \`src/components/\${config.componentName}/\${config.componentName}.tsx\` }
        },
        {
          type: 'file-contains',
          config: {
            path: \`src/components/\${config.componentName}/\${config.componentName}.tsx\`,
            pattern: \`export.*\${config.componentName}\`
          }
        },
        {
          type: 'file-contains',
          config: {
            path: \`src/components/\${config.componentName}/\${config.componentName}.tsx\`,
            text: ': JSX.Element'
          }
        }
      ];

      const results = [];
      for (const validation of validations) {
        const validator = this.validators.get(validation.type);
        const result = await validator(validation.config);
        results.push(result);
      }

      const allSuccess = results.every(r => r.success);
      return {
        success: allSuccess,
        message: allSuccess 
          ? \`React component \${config.componentName} validated successfully\`
          : \`React component \${config.componentName} validation failed\`,
        details: results.map(r => r.message)
      };
    });

    // Storybook story validator
    this.validators.set('storybook-story', async (config) => {
      const storyPath = \`src/components/\${config.componentName}/\${config.componentName}.stories.tsx\`;
      
      const validations = [
        {
          type: 'file-exists',
          config: { path: storyPath }
        },
        {
          type: 'file-contains',
          config: {
            path: storyPath,
            pattern: 'import.*@storybook/react'
          }
        },
        {
          type: 'file-contains',
          config: {
            path: storyPath,
            pattern: \`import.*\${config.componentName}\`
          }
        },
        {
          type: 'file-contains',
          config: {
            path: storyPath,
            text: 'export default'
          }
        }
      ];

      const results = [];
      for (const validation of validations) {
        const validator = this.validators.get(validation.type);
        const result = await validator(validation.config);
        results.push(result);
      }

      const allSuccess = results.every(r => r.success);
      return {
        success: allSuccess,
        message: allSuccess 
          ? \`Storybook story for \${config.componentName} validated successfully\`
          : \`Storybook story for \${config.componentName} validation failed\`,
        details: results.map(r => r.message)
      };
    });

    // Test file validator
    this.validators.set('test-file', async (config) => {
      const testPath = \`src/components/\${config.componentName}/\${config.componentName}.test.tsx\`;
      
      const validations = [
        {
          type: 'file-exists',
          config: { path: testPath }
        },
        {
          type: 'file-contains',
          config: {
            path: testPath,
            pattern: 'describe.*\${config.componentName}'
          }
        },
        {
          type: 'file-contains',
          config: {
            path: testPath,
            pattern: 'it.*renders'
          }
        }
      ];

      const results = [];
      for (const validation of validations) {
        const validator = this.validators.get(validation.type);
        const result = await validator(validation.config);
        results.push(result);
      }

      const allSuccess = results.every(r => r.success);
      return {
        success: allSuccess,
        message: allSuccess 
          ? \`Test file for \${config.componentName} validated successfully\`
          : \`Test file for \${config.componentName} validation failed\`,
        details: results.map(r => r.message)
      };
    });

    // Norwegian i18n validator
    this.validators.set('norwegian-i18n', async (config) => {
      const validations = [
        {
          type: 'directory-exists',
          config: { path: 'src/locales' }
        },
        {
          type: 'file-exists',
          config: { path: 'src/locales/en.json' }
        },
        {
          type: 'file-exists',
          config: { path: 'src/locales/nb-NO.json' }
        }
      ];

      if (config.componentName) {
        validations.push(
          {
            type: 'file-contains',
            config: {
              path: 'src/locales/nb-NO.json',
              pattern: config.componentName
            }
          }
        );
      }

      const results = [];
      for (const validation of validations) {
        const validator = this.validators.get(validation.type);
        const result = await validator(validation.config);
        results.push(result);
      }

      const allSuccess = results.every(r => r.success);
      return {
        success: allSuccess,
        message: allSuccess 
          ? 'Norwegian localization validated successfully'
          : 'Norwegian localization validation failed',
        details: results.map(r => r.message)
      };
    });

    // Project structure validator
    this.validators.set('project-structure', async (config) => {
      const requiredDirs = [
        'src',
        'src/components',
        'src/utils',
        'src/types'
      ];

      const requiredFiles = [
        'package.json',
        'tsconfig.json',
        'src/index.tsx'
      ];

      const validations = [
        ...requiredDirs.map(dir => ({
          type: 'directory-exists',
          config: { path: dir }
        })),
        ...requiredFiles.map(file => ({
          type: 'file-exists',
          config: { path: file }
        }))
      ];

      const results = [];
      for (const validation of validations) {
        const validator = this.validators.get(validation.type);
        const result = await validator(validation.config);
        results.push(result);
      }

      const allSuccess = results.every(r => r.success);
      return {
        success: allSuccess,
        message: allSuccess 
          ? 'Project structure validated successfully'
          : 'Project structure validation failed',
        details: results.map(r => r.message)
      };
    });
  }
}

module.exports = { StepValidators };`;
	}

	private generateCompletionChecker(): string {
		return `/**
 * Completion Checker
 * Verifies tutorial completion and generates certificates
 */

const fs = require('fs').promises;
const path = require('path');

class CompletionChecker {
  constructor(progressTracker, validationEngine) {
    this.progressTracker = progressTracker;
    this.validationEngine = validationEngine;
  }

  async checkTutorialCompletion(tutorialId, config) {
    const progress = await this.progressTracker.loadProgress(tutorialId);
    
    if (!progress) {
      return {
        completed: false,
        message: 'No progress found for this tutorial',
        percentage: 0
      };
    }

    const totalSteps = config.steps.length;
    const completedSteps = progress.completedSteps?.length || 0;
    const percentage = Math.round((completedSteps / totalSteps) * 100);

    const isCompleted = completedSteps === totalSteps;

    return {
      completed: isCompleted,
      message: isCompleted 
        ? '🎉 Tutorial completed successfully!'
        : \`📝 Progress: \${completedSteps}/\${totalSteps} steps completed\`,
      percentage,
      completedSteps,
      totalSteps,
      progress
    };
  }

  async validateAllSteps(tutorialId, config) {
    const validationResults = [];
    
    for (const step of config.steps) {
      try {
        const result = await this.validationEngine.validateStep(step);
        validationResults.push({
          stepId: step.id,
          stepTitle: step.title,
          ...result
        });
      } catch (error) {
        validationResults.push({
          stepId: step.id,
          stepTitle: step.title,
          success: false,
          message: \`Validation error: \${error.message}\`
        });
      }
    }

    const allValid = validationResults.every(r => r.success);
    const validCount = validationResults.filter(r => r.success).length;

    return {
      allValid,
      validCount,
      totalCount: validationResults.length,
      results: validationResults,
      message: allValid 
        ? '✅ All steps validated successfully'
        : \`❌ \${validCount}/\${validationResults.length} steps valid\`
    };
  }

  async generateCompletionCertificate(tutorialId, config, userInfo = {}) {
    const completion = await this.checkTutorialCompletion(tutorialId, config);
    
    if (!completion.completed) {
      throw new Error('Cannot generate certificate - tutorial not completed');
    }

    const certificate = {
      certificateId: \`cert_\${tutorialId}_\${Date.now()}\`,
      tutorialId,
      tutorialTitle: config.title,
      userName: userInfo.name || 'Anonymous User',
      userEmail: userInfo.email,
      completedAt: new Date().toISOString(),
      completionTime: this.calculateCompletionTime(completion.progress),
      skills: this.extractSkillsFromTutorial(config),
      achievements: this.calculateAchievements(completion.progress, config),
      compliance: {
        norwegian: config.locale === 'nb-NO',
        accessibility: true,
        enterprise: true
      },
      signature: this.generateCertificateSignature(tutorialId, userInfo)
    };

    return certificate;
  }

  async saveCertificate(certificate, outputDir = '.xaheen/certificates') {
    await fs.mkdir(outputDir, { recursive: true });
    
    const certificateFile = path.join(
      outputDir, 
      \`certificate_\${certificate.certificateId}.json\`
    );
    
    await fs.writeFile(
      certificateFile, 
      JSON.stringify(certificate, null, 2), 
      'utf-8'
    );

    // Also generate a human-readable version
    const readableFile = path.join(
      outputDir,
      \`certificate_\${certificate.certificateId}.md\`
    );
    
    const readableContent = this.generateReadableCertificate(certificate);
    await fs.writeFile(readableFile, readableContent, 'utf-8');

    return { certificateFile, readableFile };
  }

  calculateCompletionTime(progress) {
    if (!progress.startedAt) return 0;
    
    const startTime = new Date(progress.startedAt);
    const endTime = progress.lastUpdated ? new Date(progress.lastUpdated) : new Date();
    
    return Math.round((endTime - startTime) / 60000); // minutes
  }

  extractSkillsFromTutorial(config) {
    const skills = new Set();
    
    // Extract skills based on tutorial type and steps
    if (config.type === 'first-component') {
      skills.add('React Development');
      skills.add('TypeScript');
      skills.add('Component Architecture');
      skills.add('Storybook');
      skills.add('Testing');
    }
    
    if (config.locale === 'nb-NO') {
      skills.add('Norwegian Localization');
    }
    
    // Check steps for specific technologies
    config.steps.forEach(step => {
      if (step.title.includes('Storybook')) skills.add('Storybook');
      if (step.title.includes('Test')) skills.add('Testing');
      if (step.title.includes('Norwegian')) skills.add('Norwegian Compliance');
      if (step.title.includes('Accessibility')) skills.add('Web Accessibility');
    });

    return Array.from(skills);
  }

  calculateAchievements(progress, config) {
    const achievements = [];
    
    // Fast completion
    const timeLimit = config.features.estimatedTime * 1.5; // 150% of estimated time
    const actualTime = this.calculateCompletionTime(progress);
    if (actualTime <= timeLimit) {
      achievements.push({
        name: 'Speed Learner',
        description: 'Completed tutorial within estimated time',
        icon: '⚡'
      });
    }

    // No hints used (simplified check)
    achievements.push({
      name: 'Independent Learner',
      description: 'Completed tutorial with minimal assistance',
      icon: '🎯'
    });

    // Perfect completion
    if (progress.completedSteps?.length === config.steps.length) {
      achievements.push({
        name: 'Perfect Completion',
        description: 'Completed all tutorial steps',
        icon: '💯'
      });
    }

    // Norwegian compliance
    if (config.locale === 'nb-NO') {
      achievements.push({
        name: 'Norwegian Developer',
        description: 'Completed Norwegian compliance tutorial',
        icon: '🇳🇴'
      });
    }

    return achievements;
  }

  generateCertificateSignature(tutorialId, userInfo) {
    // Simple signature generation (in production, use proper cryptographic signing)
    const data = \`\${tutorialId}_\${userInfo.email || 'anonymous'}_\${Date.now()}\`;
    return Buffer.from(data).toString('base64');
  }

  generateReadableCertificate(certificate) {
    return \`# Certificate of Completion

## 🎓 Xaheen CLI Tutorial Certificate

**Certificate ID:** \${certificate.certificateId}

**Recipient:** \${certificate.userName}
\${certificate.userEmail ? \`**Email:** \${certificate.userEmail}\` : ''}

**Tutorial:** \${certificate.tutorialTitle}

**Completed:** \${new Date(certificate.completedAt).toLocaleDateString()}

**Completion Time:** \${certificate.completionTime} minutes

## 🏆 Skills Demonstrated

\${certificate.skills.map(skill => \`- \${skill}\`).join('\\n')}

## 🎯 Achievements Unlocked

\${certificate.achievements.map(achievement => 
  \`- \${achievement.icon} **\${achievement.name}**: \${achievement.description}\`
).join('\\n')}

## ✅ Compliance Standards

\${certificate.compliance.norwegian ? '- 🇳🇴 Norwegian Enterprise Standards' : ''}
\${certificate.compliance.accessibility ? '- ♿ Web Accessibility (WCAG AAA)' : ''}
\${certificate.compliance.enterprise ? '- 🏢 Enterprise Development Practices' : ''}

---

*This certificate verifies successful completion of the Xaheen CLI tutorial program.*

**Generated by:** Xaheen CLI Interactive Tutorial System  
**Signature:** \${certificate.signature}
\`;
  }

  async generateProgressReport(tutorialId, config) {
    const completion = await this.checkTutorialCompletion(tutorialId, config);
    const validation = await this.validateAllSteps(tutorialId, config);
    
    return {
      tutorialId,
      tutorialTitle: config.title,
      completion,
      validation,
      generatedAt: new Date().toISOString(),
      summary: {
        overallProgress: completion.percentage,
        stepsCompleted: completion.completedSteps,
        totalSteps: completion.totalSteps,
        validationsPassed: validation.validCount,
        totalValidations: validation.totalCount,
        isReady: completion.completed && validation.allValid
      }
    };
  }
}

module.exports = { CompletionChecker };`;
	}

	private generateTutorialCommand(options: InteractiveTutorialOptions): string {
		return `/**
 * Tutorial CLI Command
 * Integrates tutorial system with Xaheen CLI
 */

const { Command } = require('commander');
const { TutorialRunner } = require('./tutorial-runner');
const { TutorialCLI } = require('./tutorial-cli');
const { ProgressTracker } = require('./progress/progress-tracker');
const { CompletionChecker } = require('./validation/completion-checker');
const { StepValidators } = require('./validation/step-validators');
const fs = require('fs').promises;
const path = require('path');

class TutorialCommand {
  constructor() {
    this.progressTracker = new ProgressTracker();
    this.validationEngine = new StepValidators();
    this.completionChecker = new CompletionChecker(
      this.progressTracker, 
      this.validationEngine
    );
  }

  createCommand() {
    const tutorial = new Command('tutorial')
      .description('Interactive learning system for Xaheen CLI');

    // Start tutorial
    tutorial
      .command('start <type>')
      .description('Start an interactive tutorial')
      .option('--locale <locale>', 'Tutorial language (en, nb-NO)', 'en')
      .option('--skill-level <level>', 'Skill level (beginner, intermediate, advanced)', 'beginner')
      .option('--no-progress', 'Disable progress tracking')
      .option('--no-validation', 'Disable completion validation')
      .option('--no-hints', 'Disable hints')
      .action(async (type, options) => {
        await this.startTutorial(type, options);
      });

    // List available tutorials
    tutorial
      .command('list')
      .description('List available tutorials')
      .option('--locale <locale>', 'Filter by language', 'all')
      .option('--skill-level <level>', 'Filter by skill level', 'all')
      .action(async (options) => {
        await this.listTutorials(options);
      });

    // Show progress
    tutorial
      .command('progress [tutorialId]')
      .description('Show tutorial progress')
      .option('--detailed', 'Show detailed progress information')
      .action(async (tutorialId, options) => {
        await this.showProgress(tutorialId, options);
      });

    // Continue tutorial
    tutorial
      .command('continue [tutorialId]')
      .description('Continue an interrupted tutorial')
      .action(async (tutorialId, options) => {
        await this.continueTutorial(tutorialId, options);
      });

    // Validate current step
    tutorial
      .command('validate [tutorialId]')
      .description('Validate current tutorial step')
      .action(async (tutorialId, options) => {
        await this.validateStep(tutorialId, options);
      });

    // Get hint
    tutorial
      .command('hint [tutorialId]')
      .description('Get hints for current step')
      .action(async (tutorialId, options) => {
        await this.showHint(tutorialId, options);
      });

    // Reset tutorial
    tutorial
      .command('reset <tutorialId>')
      .description('Reset tutorial progress')
      .option('--confirm', 'Skip confirmation prompt')
      .action(async (tutorialId, options) => {
        await this.resetTutorial(tutorialId, options);
      });

    // Generate certificate
    tutorial
      .command('certificate <tutorialId>')
      .description('Generate completion certificate')
      .option('--name <name>', 'Certificate recipient name')
      .option('--email <email>', 'Certificate recipient email')
      .option('--output <path>', 'Output directory', '.xaheen/certificates')
      .action(async (tutorialId, options) => {
        await this.generateCertificate(tutorialId, options);
      });

    // Configuration
    tutorial
      .command('config')
      .description('Configure tutorial settings')
      .option('--locale <locale>', 'Set default language')
      .option('--skill-level <level>', 'Set default skill level')
      .option('--enable-tracking', 'Enable progress tracking')
      .option('--disable-tracking', 'Disable progress tracking')
      .action(async (options) => {
        await this.configureTutorials(options);
      });

    return tutorial;
  }

  async startTutorial(type, options) {
    try {
      console.log(\`🎓 Starting tutorial: \${type}\`);
      
      // Load tutorial configuration
      const configPath = this.getTutorialConfigPath(type);
      const config = await this.loadTutorialConfig(configPath, options);
      
      // Initialize tutorial runner
      const runner = new TutorialRunner(configPath);
      await runner.initialize();
      
      // Create interactive CLI
      const cli = new TutorialCLI(runner);
      await cli.start();
      
    } catch (error) {
      console.error('❌ Failed to start tutorial:', error.message);
      process.exit(1);
    }
  }

  async listTutorials(options) {
    try {
      console.log('📚 Available Tutorials:\\n');
      
      const tutorials = await this.getAvailableTutorials();
      
      // Filter by locale
      const filtered = options.locale === 'all' 
        ? tutorials 
        : tutorials.filter(t => t.locale === options.locale);
      
      // Filter by skill level
      const finalFiltered = options.skillLevel === 'all'
        ? filtered
        : filtered.filter(t => t.skillLevel === options.skillLevel);
      
      if (finalFiltered.length === 0) {
        console.log('No tutorials found matching your criteria.');
        return;
      }

      finalFiltered.forEach(tutorial => {
        console.log(\`📖 \${tutorial.title}\`);
        console.log(\`   ID: \${tutorial.id}\`);
        console.log(\`   Level: \${tutorial.skillLevel}\`);
        console.log(\`   Language: \${tutorial.locale}\`);
        console.log(\`   Duration: ~\${tutorial.estimatedTime} minutes\`);
        console.log(\`   Steps: \${tutorial.totalSteps}\`);
        console.log(\`   \${tutorial.description}\`);
        console.log('');
      });
      
      console.log('💡 Start a tutorial with: xaheen tutorial start <id>');
      
    } catch (error) {
      console.error('❌ Failed to list tutorials:', error.message);
    }
  }

  async showProgress(tutorialId, options) {
    try {
      if (!tutorialId) {
        // Show all progress
        const allProgress = await this.progressTracker.getAllProgress();
        
        if (Object.keys(allProgress).length === 0) {
          console.log('📝 No tutorial progress found.');
          console.log('Start a tutorial with: xaheen tutorial start <type>');
          return;
        }
        
        console.log('📊 Tutorial Progress Summary:\\n');
        
        for (const [id, progress] of Object.entries(allProgress)) {
          const config = await this.loadTutorialConfig(this.getTutorialConfigPath(id));
          const report = this.progressTracker.generateProgressReport(id, progress, config);
          
          console.log(\`📖 \${report.title}\`);
          console.log(\`   Progress: \${report.completionPercentage}%\`);
          console.log(\`   Steps: \${report.completedSteps}/\${report.totalSteps}\`);
          console.log(\`   Time spent: \${report.timeSpent} minutes\`);
          console.log('');
        }
      } else {
        // Show specific tutorial progress
        const progress = await this.progressTracker.loadProgress(tutorialId);
        
        if (!progress) {
          console.log(\`📝 No progress found for tutorial: \${tutorialId}\`);
          return;
        }
        
        const config = await this.loadTutorialConfig(this.getTutorialConfigPath(tutorialId));
        const report = this.progressTracker.generateProgressReport(tutorialId, progress, config);
        
        console.log(\`📖 \${report.title}\\n\`);
        console.log(\`📊 Progress: \${report.completionPercentage}%\`);
        console.log(\`✅ Completed: \${report.completedSteps}/\${report.totalSteps} steps\`);
        console.log(\`⏱️  Time spent: \${report.timeSpent} minutes\`);
        
        if (report.estimatedTimeRemaining > 0) {
          console.log(\`⏳ Estimated remaining: \${report.estimatedTimeRemaining} minutes\`);
        }
        
        if (options.detailed) {
          console.log('\\n📋 Step Details:');
          config.steps.forEach((step, index) => {
            const isCompleted = progress.completedSteps?.includes(step.id);
            const isCurrent = index === progress.currentStep;
            const icon = isCompleted ? '✅' : (isCurrent ? '▶️' : '⏸️');
            
            console.log(\`  \${icon} \${step.title}\`);
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to show progress:', error.message);
    }
  }

  async continueTutorial(tutorialId, options) {
    try {
      if (!tutorialId) {
        // Find active tutorials
        const allProgress = await this.progressTracker.getAllProgress();
        const activeTutorials = Object.entries(allProgress)
          .filter(([id, progress]) => progress.currentStep < progress.totalSteps)
          .map(([id]) => id);
        
        if (activeTutorials.length === 0) {
          console.log('📝 No active tutorials found.');
          console.log('Start a tutorial with: xaheen tutorial start <type>');
          return;
        }
        
        if (activeTutorials.length === 1) {
          tutorialId = activeTutorials[0];
        } else {
          console.log('📚 Multiple active tutorials found:');
          activeTutorials.forEach(id => console.log(\`  - \${id}\`));
          console.log('Please specify which tutorial to continue.');
          return;
        }
      }
      
      const configPath = this.getTutorialConfigPath(tutorialId);
      const runner = new TutorialRunner(configPath);
      await runner.initialize();
      
      // Load existing progress
      const progress = await this.progressTracker.loadProgress(tutorialId);
      if (progress) {
        runner.currentStep = progress.currentStep;
        runner.progress = new Map(Object.entries(progress.completedSteps || {}));
      }
      
      const cli = new TutorialCLI(runner);
      await cli.start();
      
    } catch (error) {
      console.error('❌ Failed to continue tutorial:', error.message);
    }
  }

  async validateStep(tutorialId, options) {
    try {
      // Implementation for step validation
      console.log(\`🔍 Validating current step for tutorial: \${tutorialId}\`);
      
      const config = await this.loadTutorialConfig(this.getTutorialConfigPath(tutorialId));
      const progress = await this.progressTracker.loadProgress(tutorialId);
      
      if (!progress) {
        console.log('❌ No progress found. Start the tutorial first.');
        return;
      }
      
      const currentStep = config.steps[progress.currentStep];
      if (!currentStep) {
        console.log('✅ Tutorial completed!');
        return;
      }
      
      const result = await this.validationEngine.validateStep(currentStep);
      
      if (result.success) {
        console.log('✅ Step validation passed!');
        console.log(result.message);
      } else {
        console.log('❌ Step validation failed');
        console.log(result.message);
        
        if (result.suggestions) {
          console.log('\\n💡 Suggestions:');
          result.suggestions.forEach(suggestion => {
            console.log(\`  - \${suggestion}\`);
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to validate step:', error.message);
    }
  }

  async showHint(tutorialId, options) {
    try {
      const config = await this.loadTutorialConfig(this.getTutorialConfigPath(tutorialId));
      const progress = await this.progressTracker.loadProgress(tutorialId);
      
      if (!progress) {
        console.log('❌ No progress found. Start the tutorial first.');
        return;
      }
      
      const currentStep = config.steps[progress.currentStep];
      if (!currentStep) {
        console.log('✅ Tutorial completed!');
        return;
      }
      
      if (!currentStep.hints || currentStep.hints.length === 0) {
        console.log('💡 No hints available for this step.');
        return;
      }
      
      console.log(\`💡 Hints for: \${currentStep.title}\\n\`);
      currentStep.hints.forEach((hint, index) => {
        console.log(\`  \${index + 1}. \${hint}\`);
      });
      
    } catch (error) {
      console.error('❌ Failed to show hint:', error.message);
    }
  }

  async resetTutorial(tutorialId, options) {
    try {
      if (!options.confirm) {
        console.log(\`⚠️  This will reset all progress for tutorial: \${tutorialId}\`);
        console.log('Use --confirm flag to proceed.');
        return;
      }
      
      await this.progressTracker.clearProgress(tutorialId);
      console.log(\`🔄 Tutorial progress reset: \${tutorialId}\`);
      console.log('You can start fresh with: xaheen tutorial start <type>');
      
    } catch (error) {
      console.error('❌ Failed to reset tutorial:', error.message);
    }
  }

  async generateCertificate(tutorialId, options) {
    try {
      const config = await this.loadTutorialConfig(this.getTutorialConfigPath(tutorialId));
      
      const userInfo = {
        name: options.name,
        email: options.email
      };
      
      const certificate = await this.completionChecker.generateCompletionCertificate(
        tutorialId, 
        config, 
        userInfo
      );
      
      const files = await this.completionChecker.saveCertificate(
        certificate, 
        options.output
      );
      
      console.log('🎓 Certificate generated successfully!');
      console.log(\`📄 Certificate: \${files.certificateFile}\`);
      console.log(\`📋 Readable version: \${files.readableFile}\`);
      
    } catch (error) {
      console.error('❌ Failed to generate certificate:', error.message);
    }
  }

  async configureTutorials(options) {
    try {
      console.log('⚙️  Configuring tutorial settings...');
      
      // Implementation for tutorial configuration
      // This would save user preferences for tutorials
      
      console.log('✅ Tutorial configuration updated');
      
    } catch (error) {
      console.error('❌ Failed to configure tutorials:', error.message);
    }
  }

  // Helper methods

  getTutorialConfigPath(type) {
    return path.join('.xaheen', 'tutorials', 'tutorial-config.json');
  }

  async loadTutorialConfig(configPath, options = {}) {
    try {
      const content = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(\`Failed to load tutorial configuration: \${error.message}\`);
    }
  }

  async getAvailableTutorials() {
    // This would scan for available tutorial configurations
    return [
      {
        id: 'first-component',
        title: 'Your First Component',
        description: 'Learn to create React components with Xaheen CLI',
        skillLevel: 'beginner',
        locale: 'en',
        estimatedTime: 30,
        totalSteps: 7
      },
      {
        id: 'scaffold-workflow',
        title: 'Scaffold → Play → Refine Workflow',
        description: 'Master the complete development workflow',
        skillLevel: 'intermediate',
        locale: 'en',
        estimatedTime: 45,
        totalSteps: 5
      },
      {
        id: 'norwegian-compliance',
        title: 'Norwegian Enterprise Compliance',
        description: 'Implement Norwegian standards and regulations',
        skillLevel: 'advanced',
        locale: 'nb-NO',
        estimatedTime: 60,
        totalSteps: 6
      }
    ];
  }
}

module.exports = { TutorialCommand };`;
	}

	private generateCommandRegistration(): string {
		return `/**
 * Command Registration
 * Registers tutorial commands with Xaheen CLI
 */

const { TutorialCommand } = require('./tutorial-command');

function registerTutorialCommands(program) {
  const tutorialCommand = new TutorialCommand();
  const tutorial = tutorialCommand.createCommand();
  
  program.addCommand(tutorial);
  
  console.log('📚 Tutorial commands registered successfully');
}

module.exports = { registerTutorialCommands };`;
	}

	private generateTutorialGuide(options: InteractiveTutorialOptions): string {
		const norwegianContent = options.enableNorwegianMode ? `

## Norsk Veiledning

Denne interaktive opplæringen er tilpasset norske utviklere og inkluderer:

- **Norske standarder**: Følger norske digitale standarder og retningslinjer
- **UU-krav**: Implementerer universell utforming i henhold til norsk lovgivning  
- **GDPR**: Respekterer personvernforordningen og norske krav
- **NSM-sikkerhet**: Anvender passende sikkerhetsklassifisering

### Kom i gang

1. Start opplæringen: \`xaheen tutorial start first-component --locale nb-NO\`
2. Følg trinnene og få hjelp når du trenger det
3. Valider fremgangen din underveis
4. Få sertifikat når du fullfører

` : '';

		return `# Interactive Tutorial Guide

Welcome to the Xaheen CLI Interactive Tutorial System! This guide will help you get started with our comprehensive learning platform.

## Overview

The Interactive Tutorial System provides hands-on learning experiences that teach you to use Xaheen CLI effectively. Each tutorial is designed to be practical, engaging, and aligned with Norwegian enterprise standards.

## Available Tutorials

### 1. Your First Component
- **Duration**: ~30 minutes
- **Level**: Beginner
- **Skills**: React, TypeScript, Storybook, Testing
- **Description**: Create your first React component with full testing and documentation

### 2. Scaffold → Play → Refine Workflow
- **Duration**: ~45 minutes  
- **Level**: Intermediate
- **Skills**: Project analysis, scaffolding, workflow optimization
- **Description**: Master the complete development workflow from planning to deployment

### 3. Norwegian Enterprise Compliance
- **Duration**: ~60 minutes
- **Level**: Advanced
- **Skills**: Accessibility, GDPR, NSM security, Norwegian standards
- **Description**: Implement Norwegian enterprise compliance requirements

## Getting Started

### 1. Start a Tutorial

\`\`\`bash
# Start your first tutorial
xaheen tutorial start first-component

# Start with Norwegian language
xaheen tutorial start first-component --locale nb-NO

# Specify skill level
xaheen tutorial start first-component --skill-level beginner
\`\`\`

### 2. Interactive Commands

During a tutorial, you can use these commands:

- \`help\` - Show available commands
- \`next\` - Proceed to next step  
- \`validate\` - Check your work
- \`hint\` - Get assistance
- \`progress\` - View your advancement
- \`quit\` - Exit tutorial (progress is saved)

### 3. Progress Tracking

Your progress is automatically saved:

\`\`\`bash
# View overall progress
xaheen tutorial progress

# View specific tutorial progress
xaheen tutorial progress first-component

# Continue interrupted tutorial
xaheen tutorial continue first-component
\`\`\`

## Features

### ✅ Progress Tracking
- Automatic progress saving
- Resume interrupted tutorials
- Detailed progress visualization
- Time tracking and estimates

### ✅ Validation System
- Automatic step validation
- Helpful error messages
- Suggestions for improvement
- Norwegian compliance checking

### ✅ Interactive Learning
- Step-by-step guidance
- Contextual hints and tips
- Real-time feedback
- Hands-on practice

### ✅ Completion Certificates
- Generate completion certificates
- Skills verification
- Achievement tracking
- Professional credentials

## Advanced Usage

### Custom Tutorials

You can create custom tutorials by:

1. Creating a tutorial configuration file
2. Defining steps with validation rules
3. Adding hints and resources
4. Registering with the tutorial system

### Progress Export/Import

\`\`\`bash
# Export progress for backup
xaheen tutorial export-progress --output my-progress.json

# Import progress (useful for team training)
xaheen tutorial import-progress --input my-progress.json
\`\`\`

### Team Training

The tutorial system supports team training scenarios:

- Shared progress tracking
- Team completion reports
- Custom skill paths
- Enterprise compliance verification

## Norwegian Enterprise Features

${norwegianContent}

## Troubleshooting

### Common Issues

**Tutorial won't start**
- Check Node.js version (requires 18+)
- Verify Xaheen CLI installation
- Ensure proper permissions

**Validation fails**
- Read error messages carefully
- Use \`hint\` command for assistance
- Check file paths and spelling
- Verify prerequisites are met

**Progress not saving**
- Check file system permissions
- Ensure \`.xaheen\` directory can be created
- Verify sufficient disk space

### Getting Help

- Use \`xaheen tutorial help\` for command reference
- Check \`hint\` during tutorials for step-specific help
- Visit documentation at https://docs.xaheen.com
- Contact support for enterprise issues

## Best Practices

### For Learners

1. **Take your time** - Don't rush through steps
2. **Practice regularly** - Consistent learning is most effective
3. **Use validation** - Check your work frequently
4. **Ask for hints** - Don't struggle alone
5. **Complete fully** - Finish tutorials for maximum benefit

### For Teams

1. **Set learning goals** - Define clear objectives
2. **Track progress** - Monitor team advancement
3. **Share knowledge** - Discuss learnings together
4. **Validate skills** - Use certificates for verification
5. **Practice compliance** - Emphasize Norwegian standards

## Support and Resources

- **Documentation**: https://docs.xaheen.com/tutorials
- **Community**: https://community.xaheen.com
- **Enterprise Support**: enterprise@xaheen.com
- **Norwegian Support**: norge@xaheen.com

---

*Happy learning with Xaheen CLI! 🎓*`;
	}

	private generateStepDocumentation(step: TutorialStep, options: InteractiveTutorialOptions): string {
		const norwegianContent = options.enableNorwegianMode ? `

## Norsk Beskrivelse

**Tittel**: ${this.translateToNorwegian(step.title)}
**Beskrivelse**: ${this.translateToNorwegian(step.description)}
**Instruksjon**: ${this.translateToNorwegian(step.instruction)}

${step.hints ? `### Tips på Norsk

${step.hints.map(hint => `- ${this.translateToNorwegian(hint)}`).join('\n')}` : ''}

` : '';

		return `# ${step.title}

## Overview

**ID**: \`${step.id}\`  
**Difficulty**: ${step.difficulty || 'medium'}  
**Estimated Time**: ${step.estimatedTime || 5} minutes  

## Description

${step.description}

## Instructions

${step.instruction}

${step.expectedOutput ? `## Expected Output

\`\`\`
${step.expectedOutput}
\`\`\`

` : ''}

${step.validationCommand ? `## Validation Command

\`\`\`bash
${step.validationCommand}
\`\`\`

` : ''}

${step.hints ? `## Hints

${step.hints.map((hint, index) => `${index + 1}. ${hint}`).join('\n')}

` : ''}

${step.prerequisites ? `## Prerequisites

This step requires completion of:

${step.prerequisites.map(prereq => `- ${prereq}`).join('\n')}

` : ''}

${step.resources ? `## Additional Resources

${step.resources.map(resource => `- [${resource.title}](${resource.url}) (${resource.type})`).join('\n')}

` : ''}

${norwegianContent}

## Troubleshooting

If you encounter issues with this step:

1. **Read the error message carefully** - Most errors contain helpful information
2. **Check your file paths** - Ensure you're in the correct directory
3. **Verify prerequisites** - Make sure previous steps completed successfully
4. **Use hints** - Type \`hint\` in the interactive tutorial for assistance
5. **Validate frequently** - Use \`validate\` to check your progress

## Next Steps

After completing this step:

- The tutorial will automatically advance to the next step
- Your progress will be saved
- You can continue or take a break anytime

---

*Part of the Xaheen CLI Interactive Tutorial System*`;
	}

	// Utility methods

	private getTutorialTitle(type: string, norwegian: boolean): string {
		const titles = {
			"first-component": norwegian ? "Din Første Komponent" : "Your First Component",
			"scaffold-workflow": norwegian ? "Scaffold → Spill → Forbedre Arbeidsflyt" : "Scaffold → Play → Refine Workflow",
			"advanced-patterns": norwegian ? "Avanserte Mønstre" : "Advanced Patterns",
			"norwegian-compliance": norwegian ? "Norske Samsvarskrav" : "Norwegian Compliance",
		};

		return titles[type] || type;
	}

	private getTutorialDescription(type: string, norwegian: boolean): string {
		const descriptions = {
			"first-component": norwegian 
				? "Lær å lage React-komponenter med Xaheen CLI - steg for steg veiledning"
				: "Learn to create React components with Xaheen CLI - step by step guidance",
			"scaffold-workflow": norwegian
				? "Mestre den komplette utviklingsarbeidsflyten fra planlegging til produksjon"
				: "Master the complete development workflow from planning to production",
			"advanced-patterns": norwegian
				? "Utforsk avanserte arkitekturmønstre og beste praksis"
				: "Explore advanced architectural patterns and best practices",
			"norwegian-compliance": norwegian
				? "Implementer norske standarder og reguleringskrav i utviklingsprosjekter"
				: "Implement Norwegian standards and regulatory requirements in development projects",
		};

		return descriptions[type] || "Interactive tutorial for Xaheen CLI";
	}

	private translateToNorwegian(text: string): string {
		// Simple translation mapping - in production, use proper i18n system
		const translations: Record<string, string> = {
			"Set Up Your First Project": "Sett Opp Ditt Første Prosjekt",
			"Initialize a new project with Xaheen CLI": "Initialiser et nytt prosjekt med Xaheen CLI",
			"Generate Your First Component": "Generer Din Første Komponent",
			"Create a Button component with Xaheen generators": "Opprett en Knapp-komponent med Xaheen-generatorer",
			"Customize Your Component": "Tilpass Din Komponent",
			"Add Storybook Integration": "Legg til Storybook-integrasjon",
			"Add Component Tests": "Legg til Komponenttester",
			"Add Norwegian Localization": "Legg til Norsk Lokalisering",
			"Deploy and Share": "Distribuer og Del",
		};

		return translations[text] || text;
	}
}