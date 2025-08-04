/**
 * Enhanced Documentation Generator for Xala UI System
 *
 * Generates comprehensive documentation from component specifications
 * including overviews, API references, examples, and cross-references.
 */

import * as fs from "fs-extra";
import handlebars from "handlebars";
import * as path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import type { ComponentConfig } from "../types/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Component specification interface based on schema
interface ComponentSpecification {
	metadata: {
		name: string;
		version: string;
		semanticVersion: string;
		category: string;
		subcategory?: string;
		description: string;
		keywords?: string[];
		stability: "experimental" | "beta" | "stable" | "deprecated";
		createdAt?: string;
		updatedAt?: string;
		maintainer?: {
			name: string;
			email?: string;
			team?: string;
		};
	};
	compliance: {
		i18n: {
			supported: boolean;
			defaultLocale: string;
			supportedLocales: string[];
			textDirection?: string[];
		};
		semantic: {
			htmlElements: string[];
			ariaRoles: string[];
			landmarks: boolean;
			headingStructure?: boolean;
		};
		wcag: {
			level: "A" | "AA" | "AAA";
			tested: boolean;
			guidelines: string[];
			colorContrast?: {
				normal?: number;
				large?: number;
				enhanced?: number;
			};
		};
		ssr: {
			supported: boolean;
			hydrationSafe: boolean;
			staticGeneration?: boolean;
		};
		norwegian: {
			nsmClassification: "OPEN" | "RESTRICTED" | "CONFIDENTIAL" | "SECRET";
			gdprCompliant: boolean;
			designSystem?: {
				altinnCompliant?: boolean;
				governmentApproved?: boolean;
			};
			auditTrail?: boolean;
		};
	};
	props: {
		schema: Record<
			string,
			{
				type: string;
				description: string;
				required?: boolean;
				default?: any;
				enum?: string[];
				signature?: string;
			}
		>;
		groups: {
			required: string[];
			optional: string[];
			deprecated: Array<{
				name: string;
				reason: string;
				alternative?: string;
			}>;
		};
		composition?: {
			children?: {
				supported: boolean;
				types?: string[];
				constraints?: {
					maxChildren?: number;
					allowedComponents?: string[];
				};
			};
			slots?: Record<
				string,
				{
					required: boolean;
					types: string[];
					description: string;
				}
			>;
		};
	};
	variants?: {
		simple?: Record<
			string,
			{
				values: Record<string, string>;
				defaultValue?: string;
			}
		>;
		compound?: Array<{
			conditions: Record<string, string>;
			className: string;
			description?: string;
		}>;
	};
	accessibility: {
		role: {
			primary: string;
			additional?: string[];
		};
		keyboardNavigation: {
			supported: boolean;
			patterns: Array<{
				key: string;
				action: string;
				context: string;
			}>;
			focusManagement?: {
				trapFocus?: boolean;
				restoreFocus?: boolean;
				skipLinks?: boolean;
			};
		};
		screenReader: {
			announcements: Array<{
				trigger: string;
				message: string;
				priority: "polite" | "assertive";
			}>;
			labels: {
				required: string[];
				descriptions?: Record<string, string>;
			};
		};
		testing?: {
			automated?: string[];
			manual?: string[];
		};
	};
	platforms: {
		supported: string[];
		primary?: string;
		implementations?: Record<
			string,
			{
				templatePath?: string;
				dependencies?: string[];
				imports?: Array<{
					module: string;
					imports: string[];
				}>;
				examples?: Array<{
					code: string;
					language: string;
					description?: string;
				}>;
			}
		>;
	};
	examples?: Array<{
		name: string;
		description: string;
		category: "basic" | "advanced" | "playground" | "real-world";
		code: Record<string, string>;
		props?: Record<string, any>;
		notes?: string;
	}>;
	ai?: {
		optimization?: {
			hints?: string[];
			patterns?: Array<{
				pattern: string;
				context: string;
				recommendation: string;
			}>;
			antiPatterns?: Array<{
				pattern: string;
				reason: string;
				alternative: string;
			}>;
		};
		generation?: {
			priority: "high" | "medium" | "low";
			complexity: "simple" | "moderate" | "complex";
			estimatedTokens?: number;
		};
		documentation?: {
			autoGenerate?: boolean;
			templates?: string[];
		};
	};
	testing?: {
		unit?: {
			required?: string[];
			coverage?: {
				minimum?: number;
			};
		};
		integration?: {
			scenarios?: string[];
		};
		visual?: {
			regression?: boolean;
			responsive?: boolean;
		};
	};
	performance?: {
		metrics?: {
			bundleSize?: {
				max?: string;
				gzipped?: string;
			};
			renderTime?: {
				initial?: string;
				update?: string;
			};
		};
		optimizations?: string[];
	};
}

interface DocumentationOptions {
	templateDir?: string;
	outputDir?: string;
	format?: "markdown" | "html" | "json";
	includeExamples?: boolean;
	includeAPI?: boolean;
	crossReferences?: boolean;
	interactive?: boolean;
}

interface GeneratedDocumentation {
	overview: string;
	props: string;
	examples: string;
	files: Array<{
		path: string;
		content: string;
		type: string;
	}>;
}

export class DocumentationGenerator {
	private templates: Map<string, handlebars.TemplateDelegate> = new Map();
	private templateDir: string;
	private outputDir: string;

	constructor(options: DocumentationOptions = {}) {
		this.templateDir =
			options.templateDir ||
			path.join(__dirname, "../../docs/specifications/templates");
		this.outputDir =
			options.outputDir ||
			path.join(__dirname, "../../docs/specifications/components");
		this.initializeHelpers();
	}

	/**
	 * Initialize Handlebars helpers
	 */
	private initializeHelpers(): void {
		handlebars.registerHelper("json", function (context) {
			return JSON.stringify(context, null, 2);
		});

		handlebars.registerHelper("eq", function (a, b) {
			return a === b;
		});

		handlebars.registerHelper("contains", function (array: any, value: any) {
			return Array.isArray(array) && array.includes(value);
		});

		handlebars.registerHelper("capitalize", function (str: string) {
			return str.charAt(0).toUpperCase() + str.slice(1);
		});

		handlebars.registerHelper("camelCase", function (str: string) {
			return str.replace(/[-_](.)/g, (_, letter) => letter.toUpperCase());
		});

		handlebars.registerHelper("kebabCase", function (str: string) {
			return str
				.replace(/([A-Z])/g, "-$1")
				.toLowerCase()
				.replace(/^-/, "");
		});

		handlebars.registerHelper("lookup", function (obj: any, key: string) {
			return obj && obj[key];
		});

		handlebars.registerHelper("first", function (array: any) {
			return Array.isArray(array) ? array[0] : array;
		});
	}

	/**
	 * Load and compile templates
	 */
	private async loadTemplates(): Promise<void> {
		const templateFiles = [
			"component-overview.md",
			"props-documentation.md",
			"usage-examples.md",
		];

		for (const file of templateFiles) {
			const templatePath = path.join(this.templateDir, file);

			if (await fs.pathExists(templatePath)) {
				const content = await fs.readFile(templatePath, "utf8");
				const templateName = path.basename(file, path.extname(file));
				this.templates.set(templateName, handlebars.compile(content));
			}
		}
	}

	/**
	 * Generate comprehensive documentation from specification
	 */
	public async generateFromSpecification(
		spec: ComponentSpecification,
		options: DocumentationOptions = {},
	): Promise<GeneratedDocumentation> {
		await this.loadTemplates();

		const files: Array<{ path: string; content: string; type: string }> = [];

		// Generate component overview
		const overviewTemplate = this.templates.get("component-overview");
		const overview = overviewTemplate
			? overviewTemplate(spec)
			: this.generateBasicOverview(spec);

		// Generate props documentation
		const propsTemplate = this.templates.get("props-documentation");
		const props = propsTemplate
			? propsTemplate(spec)
			: this.generateBasicProps(spec);

		// Generate usage examples
		const examplesTemplate = this.templates.get("usage-examples");
		const examples = examplesTemplate
			? examplesTemplate(spec)
			: this.generateBasicExamples(spec);

		// Prepare files for output
		const componentName = spec.metadata.name;
		const category = spec.metadata.category || "uncategorized";
		const categoryDir = path.join(this.outputDir, category);

		files.push(
			{
				path: path.join(categoryDir, `${componentName}.md`),
				content: overview,
				type: "overview",
			},
			{
				path: path.join(categoryDir, `${componentName}-props.md`),
				content: props,
				type: "props",
			},
			{
				path: path.join(categoryDir, `${componentName}-examples.md`),
				content: examples,
				type: "examples",
			},
		);

		return {
			overview,
			props,
			examples,
			files,
		};
	}

	/**
	 * Write generated documentation to files
	 */
	public async writeDocumentation(docs: GeneratedDocumentation): Promise<void> {
		for (const file of docs.files) {
			await fs.ensureDir(path.dirname(file.path));
			await fs.writeFile(file.path, file.content, "utf8");
		}
	}

	/**
	 * Generate basic overview when template is not available
	 */
	private generateBasicOverview(spec: ComponentSpecification): string {
		const { metadata, compliance, accessibility, platforms } = spec;

		return `---
title: "${metadata.name}"
category: "${metadata.category}"
version: "${metadata.version}"
lastUpdated: "${new Date().toISOString()}"
---

# ${metadata.name}

${metadata.description}

## Component Information

| Property | Value |
|----------|-------|
| **Category** | ${metadata.category} |
| **Version** | ${metadata.version} |
| **Stability** | ${metadata.stability} |
| **Platforms** | ${platforms.supported.join(", ")} |

## Norwegian Compliance

- **NSM Classification**: ${compliance.norwegian.nsmClassification}
- **GDPR Compliant**: ${compliance.norwegian.gdprCompliant ? "✅ Yes" : "❌ No"}
- **WCAG Level**: ${compliance.wcag.level}

## Accessibility

- **Primary Role**: ${accessibility.role.primary}
- **Keyboard Navigation**: ${accessibility.keyboardNavigation.supported ? "✅ Supported" : "❌ Not supported"}
- **Screen Reader**: ${accessibility.screenReader.announcements.length > 0 ? "✅ Announcements configured" : "Basic support"}

## Quick Start

\`\`\`tsx
import { ${metadata.name} } from '@xala-technologies/ui-system';

function App() {
  return (
    <${metadata.name}${spec.props.groups.required.map((prop) => ` ${prop}="value"`).join("")}>
      ${spec.props.composition?.children?.supported ? "Content" : ""}
    </${metadata.name}>
  );
}
\`\`\`

---

*This documentation is auto-generated from the component specification.*`;
	}

	/**
	 * Generate basic props documentation when template is not available
	 */
	private generateBasicProps(spec: ComponentSpecification): string {
		const { metadata, props } = spec;

		let content = `---
title: "${metadata.name} Props API"
component: "${metadata.name}"
lastUpdated: "${new Date().toISOString()}"
---

# ${metadata.name} Props API

## Props Overview

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
`;

		for (const [propName, propDef] of Object.entries(props.schema)) {
			const required = props.groups.required.includes(propName) ? "✅" : "❌";
			const defaultValue =
				propDef.default !== undefined ? `\`${propDef.default}\`` : "-";
			content += `| \`${propName}\` | \`${propDef.type}\` | ${defaultValue} | ${required} | ${propDef.description} |\n`;
		}

		content += `\n## Required Props\n\n${props.groups.required.length > 0 ? props.groups.required.map((prop) => `- **\`${prop}\`**: ${props.schema[prop]?.description || "Required prop"}`).join("\n") : "*No required props*"}`;

		content += `\n\n## Optional Props\n\n${props.groups.optional.length > 0 ? props.groups.optional.map((prop) => `- **\`${prop}\`**: ${props.schema[prop]?.description || "Optional prop"}${props.schema[prop]?.default !== undefined ? ` (default: \`${props.schema[prop].default}\`)` : ""}`).join("\n") : "*No optional props*"}`;

		if (props.groups.deprecated.length > 0) {
			content += `\n\n## Deprecated Props\n\n⚠️ **These props are deprecated:**\n\n${props.groups.deprecated.map((dep) => `- **\`${dep.name}\`**: ${dep.reason}${dep.alternative ? ` Use \`${dep.alternative}\` instead.` : ""}`).join("\n")}`;
		}

		return content;
	}

	/**
	 * Generate basic examples when template is not available
	 */
	private generateBasicExamples(spec: ComponentSpecification): string {
		const { metadata, examples } = spec;

		let content = `---
title: "${metadata.name} Usage Examples"
component: "${metadata.name}"
lastUpdated: "${new Date().toISOString()}"
---

# ${metadata.name} Usage Examples

`;

		if (examples && examples.length > 0) {
			content += examples
				.map((example) => {
					let exampleContent = `## ${example.name}\n\n${example.description}\n\n`;

					for (const [platform, code] of Object.entries(example.code)) {
						exampleContent += `### ${platform.charAt(0).toUpperCase() + platform.slice(1)}\n\n\`\`\`${platform}\n${code}\n\`\`\`\n\n`;
					}

					if (example.notes) {
						exampleContent += `> 💡 **Note**: ${example.notes}\n\n`;
					}

					return exampleContent;
				})
				.join("---\n\n");
		} else {
			content += `## Basic Usage\n\n\`\`\`tsx\nimport { ${metadata.name} } from '@xala-technologies/ui-system';\n\nfunction App() {\n  return (\n    <${metadata.name}${spec.props.groups.required.map((prop) => ` ${prop}="value"`).join("")}>\n      ${spec.props.composition?.children?.supported ? "Content" : ""}\n    </${metadata.name}>\n  );\n}\n\`\`\`\n\n`;
		}

		return content;
	}

	/**
	 * Legacy method for backward compatibility
	 */
	public generateDocumentation(config: ComponentConfig): string {
		const { name, category, variant } = config;

		return `
# ${name}

A ${category} component built with Xala UI System v5.0.0.

## Usage

\`\`\`tsx
import { ${name} } from './components/${name}.js';

function App() {
  return (
    <${name} 
      variant="${variant || "default"}"
      size="md"
    />
  );
}
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'default' | Visual variant of the component |
| size | string | 'md' | Size of the component |
| disabled | boolean | false | Whether the component is disabled |

## Accessibility

This component follows WCAG 2.2 AAA guidelines:

- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ High contrast mode support
- ✅ Focus management
- ✅ ARIA labels and descriptions

## Localization

The component supports multiple languages:

- 🇺🇸 English (en)
- 🇳🇴 Norwegian Bokmål (no)
- 🇫🇷 French (fr)
- 🇸🇦 Arabic (ar) with RTL support

## Examples

### Basic Usage

\`\`\`tsx
<${name} />
\`\`\`

### With Custom Props

\`\`\`tsx
<${name} 
  variant="outline"
  size="lg"
  disabled={false}
/>
\`\`\`

### Interactive Example

\`\`\`tsx
function InteractiveExample() {
  const [value, setValue] = useState('');
  
  return (
    <${name} 
      value={value}
      onChange={setValue}
    />
  );
}
\`\`\`

## Design Tokens

This component uses the following design tokens:

- Colors: \`tokens.colors.primary\`, \`tokens.colors.surface\`
- Spacing: \`tokens.spacing.md\`, \`tokens.spacing.sm\`
- Typography: \`tokens.typography.body\`
- Border Radius: \`tokens.borderRadius.md\`

## Related Components

- [Button](./Button.md)
- [Input](./Input.md)
- [Card](./Card.md)
`;
	}
}
