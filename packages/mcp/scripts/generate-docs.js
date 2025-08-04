#!/usr/bin/env node

/**
 * Documentation Generation Script for Xala UI Component Specifications
 *
 * This script automatically generates comprehensive documentation from JSON specifications
 * including component overviews, API references, usage examples, and cross-references.
 */

const fs = require("fs-extra");
const path = require("path");
const glob = require("glob");
const Handlebars = require("handlebars");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

// Configuration
const DOCS_DIR = path.join(__dirname, "..", "docs", "specifications");
const TEMPLATES_DIR = path.join(DOCS_DIR, "templates");
const SPECS_DIR = path.join(__dirname, "..", "schemas");
const OUTPUT_DIR = path.join(DOCS_DIR, "components");

// Register Handlebars helpers
Handlebars.registerHelper("json", function (context) {
	return JSON.stringify(context, null, 2);
});

Handlebars.registerHelper("eq", function (a, b) {
	return a === b;
});

Handlebars.registerHelper("contains", function (array, value) {
	return Array.isArray(array) && array.includes(value);
});

Handlebars.registerHelper("capitalize", function (str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
});

Handlebars.registerHelper("camelCase", function (str) {
	return str.replace(/[-_](.)/g, (_, letter) => letter.toUpperCase());
});

Handlebars.registerHelper("kebabCase", function (str) {
	return str
		.replace(/([A-Z])/g, "-$1")
		.toLowerCase()
		.replace(/^-/, "");
});

Handlebars.registerHelper("lookup", function (obj, key) {
	return obj && obj[key];
});

Handlebars.registerHelper("first", function (array) {
	return Array.isArray(array) ? array[0] : array;
});

/**
 * Load and compile Handlebars templates
 */
async function loadTemplates() {
	const templates = {};

	try {
		const templateFiles = [
			"component-overview.md",
			"props-documentation.md",
			"usage-examples.md",
		];

		for (const file of templateFiles) {
			const templatePath = path.join(TEMPLATES_DIR, file);
			if (await fs.pathExists(templatePath)) {
				const content = await fs.readFile(templatePath, "utf8");
				const templateName = path.basename(file, path.extname(file));
				templates[templateName] = Handlebars.compile(content);
			}
		}

		return templates;
	} catch (error) {
		console.error("Error loading templates:", error);
		throw error;
	}
}

/**
 * Load component specifications from files
 */
async function loadSpecifications(pattern = "**/*.json") {
	try {
		const specFiles = glob.sync(pattern, { cwd: SPECS_DIR });
		const specifications = [];

		for (const file of specFiles) {
			const filePath = path.join(SPECS_DIR, file);

			try {
				const content = await fs.readFile(filePath, "utf8");

				// Skip non-specification JSON files
				if (file.includes("schema") || file.includes("validation")) {
					continue;
				}

				// Try to parse as specification
				const spec = JSON.parse(content);

				// Basic validation - check if it looks like a component spec
				if (spec.metadata && spec.metadata.name) {
					specifications.push({
						...spec,
						_filePath: filePath,
						_fileName: file,
					});
				}
			} catch (parseError) {
				console.warn(`Skipping invalid JSON file: ${file}`, parseError.message);
			}
		}

		return specifications;
	} catch (error) {
		console.error("Error loading specifications:", error);
		throw error;
	}
}

/**
 * Generate documentation for a single component
 */
async function generateComponentDocs(spec, templates, options = {}) {
	const { metadata } = spec;
	const componentName = metadata.name;
	const category = metadata.category || "uncategorized";

	console.log(`Generating documentation for ${componentName}...`);

	// Prepare output directory
	const categoryDir = path.join(OUTPUT_DIR, category);
	await fs.ensureDir(categoryDir);

	const results = [];

	try {
		// Generate component overview
		if (templates["component-overview"]) {
			const overviewContent = templates["component-overview"](spec);
			const overviewPath = path.join(categoryDir, `${componentName}.md`);
			await fs.writeFile(overviewPath, overviewContent);
			results.push({ type: "overview", path: overviewPath });
		}

		// Generate props documentation
		if (templates["props-documentation"] && spec.props) {
			const propsContent = templates["props-documentation"](spec);
			const propsPath = path.join(categoryDir, `${componentName}-props.md`);
			await fs.writeFile(propsPath, propsContent);
			results.push({ type: "props", path: propsPath });
		}

		// Generate usage examples
		if (templates["usage-examples"]) {
			const examplesContent = templates["usage-examples"](spec);
			const examplesPath = path.join(
				categoryDir,
				`${componentName}-examples.md`,
			);
			await fs.writeFile(examplesPath, examplesContent);
			results.push({ type: "examples", path: examplesPath });
		}

		return results;
	} catch (error) {
		console.error(`Error generating docs for ${componentName}:`, error);
		throw error;
	}
}

/**
 * Generate category index files
 */
async function generateCategoryIndexes(specifications) {
	const categorizedSpecs = specifications.reduce((acc, spec) => {
		const category = spec.metadata.category || "uncategorized";
		if (!acc[category]) {
			acc[category] = [];
		}
		acc[category].push(spec);
		return acc;
	}, {});

	for (const [category, specs] of Object.entries(categorizedSpecs)) {
		const categoryDir = path.join(OUTPUT_DIR, category);
		await fs.ensureDir(categoryDir);

		const indexContent = generateCategoryIndexContent(category, specs);
		const indexPath = path.join(categoryDir, "README.md");
		await fs.writeFile(indexPath, indexContent);

		console.log(`Generated category index: ${category}`);
	}
}

/**
 * Generate content for category index files
 */
function generateCategoryIndexContent(category, specifications) {
	const capitalizedCategory =
		category.charAt(0).toUpperCase() + category.slice(1);

	return `# ${capitalizedCategory} Components

${getCategoryDescription(category)}

## Components in this category

| Component | Version | Description | Platforms |
|-----------|---------|-------------|-----------|
${specifications
	.map((spec) => {
		const { metadata, platforms } = spec;
		const supportedPlatforms =
			platforms?.supported?.join(", ") || "Not specified";
		return `| [${metadata.name}](${metadata.name}.md) | ${metadata.version} | ${metadata.description} | ${supportedPlatforms} |`;
	})
	.join("\n")}

## Quick Start

Choose a component from the table above to get started. Each component includes:

- **Overview**: Complete component documentation with API reference
- **Props**: Detailed props documentation with TypeScript interfaces  
- **Examples**: Usage examples across different platforms and scenarios

## Category Standards

All ${category} components follow these standards:

${getCategoryStandards(category)}

## Related Categories

${getRelatedCategories(category)}

---

*This documentation is auto-generated from component specifications. Last updated: ${new Date().toISOString()}*
`;
}

/**
 * Get description for component category
 */
function getCategoryDescription(category) {
	const descriptions = {
		basic:
			"Fundamental UI elements that serve as building blocks for more complex components.",
		composite:
			"Multi-element components that combine basic elements into cohesive interfaces.",
		layout:
			"Components focused on structure, positioning, and spatial organization.",
		navigation:
			"Components that help users navigate through applications and content.",
		feedback:
			"Components that provide user feedback, notifications, and status information.",
		overlay:
			"Components that render above other content, such as modals and tooltips.",
		form: "Form controls and input components for user data collection.",
		"data-display": "Components specialized in presenting and organizing data.",
		specialized: "Domain-specific components with specialized functionality.",
	};

	return descriptions[category] || "A collection of related UI components.";
}

/**
 * Get standards for component category
 */
function getCategoryStandards(category) {
	const standards = {
		basic: `- ✅ Single responsibility principle
- ✅ Minimal API surface
- ✅ High reusability
- ✅ Semantic HTML elements
- ✅ WCAG AAA accessibility`,
		composite: `- ✅ Composition over inheritance
- ✅ Compound component patterns
- ✅ Flexible content slots
- ✅ Context-based state sharing
- ✅ Consistent visual hierarchy`,
		layout: `- ✅ Responsive design patterns
- ✅ CSS Grid and Flexbox utilization
- ✅ Spacing system compliance
- ✅ Breakpoint consistency
- ✅ Container query support`,
		navigation: `- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ ARIA navigation patterns
- ✅ URL integration where applicable
- ✅ Mobile-first responsive design`,
		feedback: `- ✅ Clear messaging hierarchy
- ✅ Appropriate timing and duration
- ✅ Screen reader announcements
- ✅ Non-intrusive positioning
- ✅ Action-oriented design`,
		overlay: `- ✅ Z-index management
- ✅ Focus trapping
- ✅ Escape key handling
- ✅ Click-outside behavior
- ✅ Portal/teleport implementation`,
		form: `- ✅ Controlled and uncontrolled modes
- ✅ Validation integration
- ✅ Error state handling
- ✅ Label association
- ✅ Form library compatibility`,
		"data-display": `- ✅ Virtualization for large datasets
- ✅ Sorting and filtering capabilities
- ✅ Accessibility for screen readers
- ✅ Responsive table patterns
- ✅ Export functionality`,
		specialized: `- ✅ Domain-specific best practices
- ✅ Performance optimization
- ✅ Progressive enhancement
- ✅ Extensibility patterns
- ✅ Integration guidelines`,
	};

	return (
		standards[category] ||
		`- ✅ Component-specific standards
- ✅ Performance optimization
- ✅ Accessibility compliance
- ✅ Norwegian compliance`
	);
}

/**
 * Get related categories
 */
function getRelatedCategories(category) {
	const relations = {
		basic: ["composite", "form"],
		composite: ["basic", "layout"],
		layout: ["composite", "navigation"],
		navigation: ["layout", "overlay"],
		feedback: ["overlay", "form"],
		overlay: ["feedback", "navigation"],
		form: ["basic", "feedback"],
		"data-display": ["layout", "specialized"],
		specialized: ["data-display", "composite"],
	};

	const related = relations[category] || [];
	return (
		related
			.map(
				(cat) =>
					`- [${cat.charAt(0).toUpperCase() + cat.slice(1)} Components](../${cat}/)`,
			)
			.join("\n") || "*No related categories*"
	);
}

/**
 * Generate main components index
 */
async function generateMainIndex(specifications) {
	const categorizedSpecs = specifications.reduce((acc, spec) => {
		const category = spec.metadata.category || "uncategorized";
		if (!acc[category]) {
			acc[category] = [];
		}
		acc[category].push(spec);
		return acc;
	}, {});

	const indexContent = `# Component Documentation

Auto-generated documentation for Xala UI System components.

## Categories

${Object.entries(categorizedSpecs)
	.map(([category, specs]) => {
		const capitalizedCategory =
			category.charAt(0).toUpperCase() + category.slice(1);
		return `### [${capitalizedCategory}](${category}/)

${getCategoryDescription(category)}

**Components (${specs.length})**: ${specs.map((s) => `[${s.metadata.name}](${category}/${s.metadata.name}.md)`).join(", ")}`;
	})
	.join("\n\n")}

## Statistics

- **Total Components**: ${specifications.length}
- **Categories**: ${Object.keys(categorizedSpecs).length}
- **Platforms Supported**: React, Vue, Angular, Svelte, Solid, Web Components
- **Compliance**: NSM, GDPR, WCAG AAA

## Quick Navigation

- [Getting Started](../getting-started.md)
- [Schema Reference](../schema-reference.md)
- [API Documentation](../api/specification-api.md)
- [Validation Guide](../guides/validation.md)
- [AI Usage Guide](../guides/ai-usage.md)

---

*Documentation generated on ${new Date().toISOString()}*
`;

	const indexPath = path.join(OUTPUT_DIR, "README.md");
	await fs.writeFile(indexPath, indexContent);
	console.log("Generated main components index");
}

/**
 * Main documentation generation function
 */
async function generateDocs(options = {}) {
	console.log("🚀 Starting documentation generation...");

	try {
		// Load templates
		console.log("📄 Loading templates...");
		const templates = await loadTemplates();
		console.log(`Loaded ${Object.keys(templates).length} templates`);

		// Load specifications
		console.log("📋 Loading specifications...");
		const specifications = await loadSpecifications(options.pattern);
		console.log(`Found ${specifications.length} specifications`);

		if (specifications.length === 0) {
			console.warn(
				"⚠️  No specifications found. Please check the specs directory.",
			);
			return;
		}

		// Clean output directory if requested
		if (options.clean) {
			console.log("🧹 Cleaning output directory...");
			await fs.remove(OUTPUT_DIR);
		}

		// Ensure output directory exists
		await fs.ensureDir(OUTPUT_DIR);

		// Generate documentation for each component
		const results = [];
		for (const spec of specifications) {
			if (options.component && spec.metadata.name !== options.component) {
				continue;
			}

			try {
				const componentResults = await generateComponentDocs(
					spec,
					templates,
					options,
				);
				results.push(...componentResults);
			} catch (error) {
				console.error(
					`Failed to generate docs for ${spec.metadata.name}:`,
					error.message,
				);
				if (options.failFast) {
					throw error;
				}
			}
		}

		// Generate category indexes
		console.log("📚 Generating category indexes...");
		await generateCategoryIndexes(specifications);

		// Generate main index
		console.log("📖 Generating main index...");
		await generateMainIndex(specifications);

		console.log(`✅ Documentation generation complete!`);
		console.log(`📁 Generated ${results.length} documentation files`);
		console.log(`📂 Output directory: ${OUTPUT_DIR}`);

		return {
			success: true,
			totalFiles: results.length,
			outputDir: OUTPUT_DIR,
			results,
		};
	} catch (error) {
		console.error("❌ Documentation generation failed:", error);
		throw error;
	}
}

/**
 * CLI setup
 */
function setupCLI() {
	return yargs(hideBin(process.argv))
		.command(
			"$0 [options]",
			"Generate component documentation from specifications",
			(yargs) => {
				return yargs
					.option("pattern", {
						alias: "p",
						describe: "Glob pattern for specification files",
						type: "string",
						default: "**/*.json",
					})
					.option("component", {
						alias: "c",
						describe: "Generate docs for specific component only",
						type: "string",
					})
					.option("clean", {
						describe: "Clean output directory before generation",
						type: "boolean",
						default: false,
					})
					.option("fail-fast", {
						describe: "Stop on first error",
						type: "boolean",
						default: false,
					})
					.option("verbose", {
						alias: "v",
						describe: "Verbose output",
						type: "boolean",
						default: false,
					});
			},
			async (argv) => {
				try {
					if (argv.verbose) {
						console.log("Options:", argv);
					}

					await generateDocs({
						pattern: argv.pattern,
						component: argv.component,
						clean: argv.clean,
						failFast: argv.failFast,
						verbose: argv.verbose,
					});

					process.exit(0);
				} catch (error) {
					console.error("Generation failed:", error);
					process.exit(1);
				}
			},
		)
		.help()
		.alias("help", "h")
		.version()
		.alias("version", "V");
}

// Run CLI if this file is executed directly
if (require.main === module) {
	setupCLI().argv;
}

module.exports = {
	generateDocs,
	loadTemplates,
	loadSpecifications,
	generateComponentDocs,
};
