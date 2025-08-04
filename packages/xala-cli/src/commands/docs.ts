import chalk from "chalk";
import { logger } from "../utils/logger.js";
import { CommandMetadata } from "./index.js";

export const docsCommand: CommandMetadata = {
	name: "docs",
	description: "Interactive documentation and help",
	arguments: [
		{
			name: "topic",
			description: "Documentation topic",
			required: false,
		},
	],
	options: [
		{
			flags: "--interactive",
			description: "Interactive documentation mode",
			defaultValue: false,
		},
		{
			flags: "--examples",
			description: "Show code examples",
			defaultValue: false,
		},
	],
	action: async (topic?: string, options: any = {}) => {
		try {
			if (!topic) {
				await showDocumentation();
			} else {
				await showTopicDocumentation(topic, options);
			}
		} catch (error) {
			logger.error("Docs command failed:", error);
			throw error;
		}
	},
};

async function showDocumentation(): Promise<void> {
	console.log(chalk.bold("\n📖 Xala CLI Documentation\n"));

	console.log(chalk.bold("🚀 Getting Started:"));
	console.log("  xala docs getting-started    - Quick start guide");
	console.log("  xala docs installation       - Installation instructions");
	console.log("  xala docs configuration      - Configuration options");

	console.log(chalk.bold("\n🎨 Design System:"));
	console.log("  xala docs tokens             - Design tokens guide");
	console.log("  xala docs themes             - Theme customization");
	console.log("  xala docs components         - Component library");
	console.log("  xala docs layouts            - Layout patterns");

	console.log(chalk.bold("\n🤖 AI Integration:"));
	console.log("  xala docs ai                 - AI-powered development");
	console.log("  xala docs prompts            - Effective AI prompts");
	console.log("  xala docs validation         - Code validation");

	console.log(chalk.bold("\n🏢 Enterprise Features:"));
	console.log("  xala docs compliance         - Compliance requirements");
	console.log("  xala docs accessibility      - WCAG guidelines");
	console.log("  xala docs localization       - Multi-language support");
	console.log("  xala docs norwegian          - Norwegian standards");

	console.log(chalk.bold("\n🛠️ Development:"));
	console.log("  xala docs workflows          - Development workflows");
	console.log("  xala docs testing            - Testing strategies");
	console.log("  xala docs deployment         - Deployment guides");
	console.log("  xala docs troubleshooting    - Common issues");

	console.log(chalk.bold("\n📋 Examples:"));
	console.log(
		`  ${chalk.cyan("xala docs tokens --examples")}        Show token usage examples`,
	);
	console.log(
		`  ${chalk.cyan("xala docs ai --interactive")}         Interactive AI guide`,
	);
	console.log(
		`  ${chalk.cyan("xala examples dashboard")}            Dashboard examples`,
	);
}

async function showTopicDocumentation(
	topic: string,
	options: any,
): Promise<void> {
	switch (topic.toLowerCase()) {
		case "getting-started":
			await showGettingStarted(options);
			break;
		case "tokens":
			await showTokensDocumentation(options);
			break;
		case "ai":
			await showAIDocumentation(options);
			break;
		case "compliance":
			await showComplianceDocumentation(options);
			break;
		case "workflows":
			await showWorkflowsDocumentation(options);
			break;
		default:
			console.log(chalk.red(`Documentation for "${topic}" not found.`));
			console.log(chalk.dim('Run "xala docs" to see available topics.'));
	}
}

async function showGettingStarted(options: any): Promise<void> {
	console.log(chalk.bold("\n🚀 Getting Started with Xala CLI\n"));

	console.log(chalk.bold("1. Installation:"));
	console.log("   npm install -g @xala-technologies/xala-cli");

	console.log(chalk.bold("\n2. Initialize Project:"));
	console.log("   xala init my-app --platform react --template saas");

	console.log(chalk.bold("\n3. Generate Components:"));
	console.log(
		'   xala ai generate "user profile card with avatar and actions"',
	);

	console.log(chalk.bold("\n4. Start Development:"));
	console.log("   xala dev --port 3001");

	console.log(chalk.bold("\n5. Build for Production:"));
	console.log("   xala build react --optimize");

	if (options.examples) {
		console.log(chalk.bold("\n📝 Complete Example:"));
		console.log(chalk.dim("# Create new healthcare application"));
		console.log("xala init healthcare-app \\");
		console.log("  --platform react \\");
		console.log("  --template dashboard \\");
		console.log("  --industry healthcare \\");
		console.log("  --theme healthcare-light");
		console.log("");
		console.log(chalk.dim("# Generate patient card component"));
		console.log(
			'xala ai generate "patient information card with medical data, appointment status, and quick actions"',
		);
		console.log("");
		console.log(chalk.dim("# Start development server"));
		console.log("xala dev --theme healthcare-light --port 3001");
	}
}

async function showTokensDocumentation(options: any): Promise<void> {
	console.log(chalk.bold("\n🎨 Design Tokens Guide\n"));

	console.log(
		chalk.bold("Design tokens are the foundation of consistent design."),
	);
	console.log(
		"They define colors, spacing, typography, and other design decisions.",
	);

	console.log(chalk.bold("\n📋 Token Categories:"));
	console.log("  • Colors - Brand colors, semantic colors, neutrals");
	console.log("  • Spacing - 8pt grid system (8px, 16px, 24px, etc.)");
	console.log("  • Typography - Font families, sizes, weights, line heights");
	console.log("  • Border Radius - Consistent corner radius values");
	console.log("  • Shadows - Elevation and depth effects");

	console.log(chalk.bold("\n⚡ Token Commands:"));
	console.log(
		"  xala tokens generate          Generate tokens for all platforms",
	);
	console.log("  xala tokens validate          Validate token definitions");
	console.log("  xala tokens sync react        Sync tokens for React");
	console.log("  xala tokens transform css     Transform to CSS variables");

	if (options.examples) {
		console.log(chalk.bold("\n💻 Usage Examples:"));
		console.log(chalk.cyan("// Import tokens"));
		console.log('import { tokens } from "@xala-technologies/ui-system";');
		console.log("");
		console.log(chalk.cyan("// Use in components"));
		console.log("<Card");
		console.log("  padding={tokens.spacing.lg}");
		console.log("  backgroundColor={tokens.colors.surface.primary}");
		console.log("  borderRadius={tokens.borderRadius.md}");
		console.log(">");
		console.log("  <Typography color={tokens.colors.text.primary}>");
		console.log("    Hello World");
		console.log("  </Typography>");
		console.log("</Card>");
	}
}

async function showAIDocumentation(options: any): Promise<void> {
	console.log(chalk.bold("\n🤖 AI-Powered Development\n"));

	console.log(
		chalk.bold("Generate components from natural language descriptions."),
	);
	console.log(
		"The AI understands design patterns and generates compliant code.",
	);

	console.log(chalk.bold("\n🎯 AI Commands:"));
	console.log(
		"  xala ai generate <description>    Generate component from description",
	);
	console.log("  xala ai suggest <context>         Get design suggestions");
	console.log("  xala ai validate <file>           Validate code compliance");
	console.log("  xala ai explain <concept>         Explain design concepts");

	console.log(chalk.bold("\n✨ Best Practices:"));
	console.log("  • Be specific about functionality");
	console.log("  • Mention visual design details");
	console.log("  • Specify interaction patterns");
	console.log("  • Include accessibility requirements");

	if (options.examples) {
		console.log(chalk.bold("\n💡 Example Prompts:"));
		console.log(
			chalk.green(
				'"user profile card with avatar, name, role, and edit button"',
			),
		);
		console.log(
			chalk.green(
				'"data table with sorting, filtering, pagination, and row selection"',
			),
		);
		console.log(
			chalk.green(
				'"responsive dashboard with metrics cards, charts, and activity feed"',
			),
		);
		console.log(
			chalk.green(
				'"mobile navigation menu with icons, labels, and badge notifications"',
			),
		);

		console.log(chalk.bold("\n🎨 Generated Output:"));
		console.log("• Fully compliant React/Vue/Angular component");
		console.log("• TypeScript types and interfaces");
		console.log("• Accessibility attributes (WCAG AAA)");
		console.log("• Localization with t() function");
		console.log("• Design tokens for all styling");
		console.log("• Storybook stories");
		console.log("• Unit tests");
	}
}

async function showComplianceDocumentation(options: any): Promise<void> {
	console.log(chalk.bold("\n📋 Compliance Requirements\n"));

	console.log(
		chalk.bold("All generated code must follow mandatory compliance rules:"),
	);

	console.log(chalk.red("\n❌ Forbidden:"));
	console.log("  • Raw HTML elements (div, span, p, button, etc.)");
	console.log("  • Hardcoded colors, spacing, or styling");
	console.log("  • Hardcoded user-facing text");
	console.log('  • TypeScript "any" types');
	console.log("  • Files over 200 lines");
	console.log("  • Functions over 20 lines");

	console.log(chalk.green("\n✅ Required:"));
	console.log("  • Semantic components from @xala-technologies/ui-system");
	console.log("  • Design tokens for all styling");
	console.log("  • Localization with t() function");
	console.log("  • Explicit TypeScript return types");
	console.log("  • WCAG 2.2 AAA accessibility");
	console.log("  • 8pt grid system (8px increments)");

	console.log(chalk.bold("\n🔍 Validation:"));
	console.log("  xala analyze --compliance         Run compliance analysis");
	console.log("  xala ai validate <file>           Validate specific file");

	if (options.examples) {
		console.log(chalk.bold("\n✅ Compliant Code Example:"));
		console.log(
			chalk.green(
				'import { Card, Typography, Button } from "@xala-technologies/ui-system";',
			),
		);
		console.log(
			chalk.green(
				'import { useTokens, useLocalization } from "@xala-technologies/ui-system";',
			),
		);
		console.log("");
		console.log(
			chalk.green(
				"export const UserCard = ({ name, role }: UserCardProps): JSX.Element => {",
			),
		);
		console.log(chalk.green("  const tokens = useTokens();"));
		console.log(chalk.green("  const { t } = useLocalization();"));
		console.log("");
		console.log(chalk.green("  return ("));
		console.log(chalk.green("    <Card padding={tokens.spacing.lg}>"));
		console.log(
			chalk.green("      <Typography color={tokens.colors.text.primary}>"),
		);
		console.log(chalk.green('        {t("user.name", name)}'));
		console.log(chalk.green("      </Typography>"));
		console.log(chalk.green("    </Card>"));
		console.log(chalk.green("  );"));
		console.log(chalk.green("};"));
	}
}

async function showWorkflowsDocumentation(options: any): Promise<void> {
	console.log(chalk.bold("\n🛠️ Development Workflows\n"));

	console.log(chalk.bold("🚀 New Project Workflow:"));
	console.log("1. xala init my-app --platform react --template dashboard");
	console.log("2. cd my-app");
	console.log('3. xala themes create custom --brand "My Brand"');
	console.log("4. xala dev --theme custom");

	console.log(chalk.bold("\n🎨 Component Development:"));
	console.log('1. xala ai generate "component description"');
	console.log("2. xala preview ComponentName");
	console.log("3. xala analyze --compliance");
	console.log("4. xala build react --optimize");

	console.log(chalk.bold("\n🔄 Theme Customization:"));
	console.log("1. xala themes create healthcare --industry healthcare");
	console.log("2. xala themes customize healthcare");
	console.log("3. xala themes preview healthcare");
	console.log("4. xala themes apply healthcare");

	console.log(chalk.bold("\n📊 Quality Assurance:"));
	console.log("1. xala analyze --performance --accessibility --compliance");
	console.log("2. xala ai validate src/components/MyComponent.tsx");
	console.log("3. npm test");
	console.log("4. xala build all --analyze");

	if (options.examples) {
		console.log(chalk.bold("\n🏥 Healthcare App Example:"));
		console.log(chalk.dim("# Initialize healthcare application"));
		console.log(
			"xala init patient-portal --industry healthcare --template dashboard",
		);
		console.log("");
		console.log(chalk.dim("# Create custom healthcare theme"));
		console.log(
			'xala themes create medical --brand "Medical Center" --colors primary=#0891b2',
		);
		console.log("");
		console.log(chalk.dim("# Generate patient components"));
		console.log(
			'xala ai generate "patient appointment card with date, doctor, status, and actions"',
		);
		console.log(
			'xala ai generate "medical record viewer with sections and navigation"',
		);
		console.log("");
		console.log(chalk.dim("# Development and testing"));
		console.log("xala dev --theme medical --port 3001");
		console.log("xala analyze --accessibility --compliance");
		console.log("xala build react --optimize");
	}
}
