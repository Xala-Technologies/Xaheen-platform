#!/usr/bin/env node

/**
 * CLI Tool for Xala UI System MCP Server
 */

import { execSync } from "child_process";
import { program } from "commander";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { freemem, totalmem } from "os";
import { dirname, join } from "path";
import { ComponentGenerator } from "./generators/ComponentGenerator.js";
import { TemplateManager } from "./templates/TemplateManager.js";
import type { ComponentConfig } from "./types/index.js";

const componentGenerator = new ComponentGenerator();
const templateManager = new TemplateManager();

program
	.name("xala-ui-mcp")
	.description("Generate React components using Xala UI System v5.0.0")
	.version("3.0.1");

// Generate component command
program
	.command("generate")
	.alias("g")
	.description("Generate a new component")
	.argument(
		"<type>",
		"Component type (component, layout, form, table, navigation)",
	)
	.option("-n, --name <name>", "Component name")
	.option("-c, --category <category>", "Component category", "interactive")
	.option("-v, --variant <variant>", "Component variant", "default")
	.option("-s, --size <size>", "Component size", "md")
	.option("-t, --theme <theme>", "Theme to use", "enterprise")
	.option("-l, --locale <locale>", "Locale for localization", "en")
	.option("-o, --output <path>", "Output directory", "./components")
	.option("--with-tests", "Generate test files")
	.option("--with-stories", "Generate Storybook stories")
	.option("--with-docs", "Generate documentation")
	.action(async (type: string, options) => {
		try {
			console.log(`🚀 Generating ${type}...`);

			const config: ComponentConfig = {
				name:
					options.name ||
					`Generated${type.charAt(0).toUpperCase() + type.slice(1)}`,
				category: options.category,
				variant: options.variant,
				size: options.size,
				theme: options.theme,
				locale: options.locale,
				features: {
					interactive: true,
					animated: false,
					tooltips: true,
					loading: true,
					error: true,
				},
				styling: {
					variant: options.variant,
					colorScheme: "auto",
					borderRadius: "md",
					shadow: "sm",
					spacing: "comfortable",
				},
				accessibility: {
					level: "AAA",
					screenReader: true,
					keyboardNavigation: true,
					highContrast: true,
					reducedMotion: true,
					focusManagement: true,
					ariaLabels: true,
				},
				responsive: {
					breakpoints: ["mobile", "tablet", "desktop"],
					mobileFirst: true,
					adaptiveLayout: true,
					touchOptimized: true,
					fluidTypography: true,
				},
			};

			let result;

			switch (type) {
				case "component":
					result = await componentGenerator.generateComponent(config);
					break;
				case "layout":
					result = componentGenerator.generateLayout({
						...config,
						layoutType: "web",
						sections: [],
					});
					break;
				case "form":
					result = componentGenerator.generateForm({
						...config,
						fields: [
							{ name: "name", type: "input", label: "Name", required: true },
							{ name: "email", type: "input", label: "Email", required: true },
						],
						validation: {
							realTime: true,
							showErrors: true,
							errorPosition: "inline" as const,
						},
						submission: { method: "POST", endpoint: "/api/submit" },
					});
					break;
				case "table":
					result = componentGenerator.generateDataTable({
						...config,
						columns: [
							{ key: "name", label: "Name", type: "text", sortable: true },
							{ key: "email", label: "Email", type: "text", sortable: true },
						],
						features: {
							sorting: true,
							filtering: true,
							pagination: true,
							selection: false,
							search: true,
							export: false,
						},
						actions: [
							{
								key: "edit",
								label: "Edit",
								icon: "Edit",
								variant: "default",
								handler: "handleEdit",
							},
						],
					});
					break;
				case "navigation":
					result = componentGenerator.generateNavigation(config);
					break;
				default:
					throw new Error(`Unknown component type: ${type}`);
			}

			// Create output directory
			const outputDir = options.output;
			if (!existsSync(outputDir)) {
				mkdirSync(outputDir, { recursive: true });
			}

			// Write files
			for (const file of result.files) {
				const filePath = join(outputDir, file.path);
				const fileDir = dirname(filePath);

				if (!existsSync(fileDir)) {
					mkdirSync(fileDir, { recursive: true });
				}

				writeFileSync(filePath, file.content, "utf8");
				console.log(`✅ Created: ${filePath}`);
			}

			// Generate additional files if requested
			if (options.withTests) {
				const testResult = await componentGenerator.generateWithTests(config);
				if (testResult.testCode) {
					const testPath = join(outputDir, `${config.name}.test.tsx`);
					writeFileSync(testPath, testResult.testCode, "utf8");
					console.log(`✅ Created: ${testPath}`);
				}
			}

			if (options.withStories) {
				const storyResult =
					await componentGenerator.generateWithStories(config);
				if (storyResult.storyCode) {
					const storyPath = join(outputDir, `${config.name}.stories.tsx`);
					writeFileSync(storyPath, storyResult.storyCode, "utf8");
					console.log(`✅ Created: ${storyPath}`);
				}
			}

			if (options.withDocs) {
				const docsResult =
					await componentGenerator.generateWithDocumentation(config);
				if (docsResult.documentationCode) {
					const docsPath = join(outputDir, `${config.name}.md`);
					writeFileSync(docsPath, docsResult.documentationCode, "utf8");
					console.log(`✅ Created: ${docsPath}`);
				}
			}

			console.log(`\n🎉 Successfully generated ${config.name}!`);
			console.log(`📁 Output directory: ${outputDir}`);
			console.log(`📦 Files created: ${result.files.length}`);
			console.log(`🔗 Dependencies: ${result.dependencies.join(", ")}`);
		} catch (error) {
			console.error("❌ Error generating component:", error);
			process.exit(1);
		}
	});

// List templates command
program
	.command("list")
	.alias("ls")
	.description("List available templates")
	.option("-c, --category <category>", "Filter by category")
	.action((options) => {
		try {
			const templates = templateManager.listTemplates(options.category);

			console.log("\n📋 Available Templates:\n");

			const categories = [...new Set(templates.map((t) => t.category))];

			for (const category of categories) {
				console.log(`\n🏷️  ${category.toUpperCase()}`);
				const categoryTemplates = templates.filter(
					(t) => t.category === category,
				);

				for (const template of categoryTemplates) {
					console.log(`  ├─ ${template.name}`);
					console.log(`  │  ${template.description}`);
					console.log(
						`  │  Required Features: ${template.requiredFeatures.join(", ")}`,
					);
					console.log(`  │`);
				}
			}

			console.log(`\n📊 Total templates: ${templates.length}`);
		} catch (error) {
			console.error("❌ Error listing templates:", error);
			process.exit(1);
		}
	});

// Template info command
program
	.command("template")
	.alias("t")
	.description("Get template information")
	.argument("<name>", "Template name")
	.action((name: string) => {
		try {
			const template = templateManager.getTemplate(name);

			if (!template) {
				console.error(`❌ Template '${name}' not found`);
				process.exit(1);
			}

			console.log(`\n📋 Template: ${template.name}\n`);
			console.log(`📝 Description: ${template.description}`);
			console.log(`🏷️  Category: ${template.category}`);
			console.log(
				`✨ Required Features: ${template.requiredFeatures.join(", ")}`,
			);
			console.log(`🎨 Default Config:`);
			console.log(JSON.stringify(template.defaultConfig, null, 2));

			if (template.examples.length > 0) {
				console.log(`\n💡 Examples:`);
				template.examples.forEach((example, index) => {
					console.log(`\n  ${index + 1}. ${example.name}`);
					console.log(`     ${example.description}`);
				});
			}
		} catch (error) {
			console.error("❌ Error getting template info:", error);
			process.exit(1);
		}
	});

// Validate config command
program
	.command("validate")
	.description("Validate component configuration")
	.argument("<config>", "Configuration file path or JSON string")
	.action((configInput: string) => {
		try {
			let config;

			if (configInput.startsWith("{")) {
				// JSON string
				config = JSON.parse(configInput);
			} else {
				// File path
				// fs is already imported
				const configContent = readFileSync(configInput, "utf8");
				config = JSON.parse(configContent);
			}

			// Basic validation - check required properties
			const isValid = config.name && config.category;

			if (isValid) {
				console.log("✅ Configuration is valid!");
				console.log(`📋 Component: ${config.name}`);
				console.log(`🏷️  Category: ${config.category}`);
				console.log(`🎨 Theme: ${config.theme || "default"}`);
			} else {
				console.log(
					"❌ Configuration is invalid! Missing required properties.",
				);
				process.exit(1);
			}
		} catch (error) {
			console.error("❌ Error validating configuration:", error);
			process.exit(1);
		}
	});

// Doctor command - system check
program
	.command("doctor")
	.description("Check system requirements and configuration")
	.action(() => {
		console.log("🔍 Running system diagnostics...\n");

		// Check Node.js version
		const nodeVersion = process.version;
		const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0] || "0");

		if (majorVersion >= 18) {
			console.log(`✅ Node.js version: ${nodeVersion} (supported)`);
		} else {
			console.log(`❌ Node.js version: ${nodeVersion} (requires Node.js 18+)`);
		}

		// Check npm version
		try {
			// execSync is already imported
			const npmVersion = execSync("npm --version", { encoding: "utf8" }).trim();
			console.log(`✅ npm version: ${npmVersion}`);
		} catch (error) {
			console.log("❌ npm not found");
		}

		// Check TypeScript
		try {
			// execSync is already imported
			const tsVersion = execSync("npx tsc --version", {
				encoding: "utf8",
			}).trim();
			console.log(`✅ TypeScript: ${tsVersion}`);
		} catch (error) {
			console.log("⚠️  TypeScript not found (recommended for development)");
		}

		// Check available memory
		const totalMemory = Math.round(totalmem() / 1024 / 1024 / 1024);
		const freeMemory = Math.round(freemem() / 1024 / 1024 / 1024);

		console.log(`💾 Memory: ${freeMemory}GB free / ${totalMemory}GB total`);

		if (freeMemory < 1) {
			console.log("⚠️  Low memory available (may affect performance)");
		}

		console.log("\n🎉 System check complete!");
	});

// Start MCP server command
program
	.command("server")
	.description("Start the MCP server")
	.option("-p, --port <port>", "Server port", "3000")
	.option("--host <host>", "Server host", "localhost")
	.action((options) => {
		console.log(`🚀 Starting Xala UI System MCP Server...`);
		console.log(`📡 Server: http://${options.host}:${options.port}`);
		console.log(`🔧 Use Ctrl+C to stop the server\n`);

		// Import and start the main server
		import("./index")
			.then(() => {
				console.log("✅ MCP Server started successfully!");
			})
			.catch((error) => {
				console.error("❌ Failed to start server:", error);
				process.exit(1);
			});
	});

program.parse();
