/**
 * @fileoverview Docusaurus Documentation Portal Generator
 * @description Creates comprehensive Docusaurus documentation sites with intelligent features
 * @author Xaheen Enterprise
 * @version 1.0.0
 */

import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { BaseGenerator } from "../base.generator";
import type {
	ColorScheme,
	DocumentationPortalOptions,
	DocumentationPortalResult,
	NavbarItem,
	SidebarItem,
} from "./portal-types";

export interface DocusaurusConfig {
	readonly title: string;
	readonly tagline: string;
	readonly url: string;
	readonly baseUrl: string;
	readonly favicon: string;
	readonly organizationName: string;
	readonly projectName: string;
	readonly themeConfig: DocusaurusThemeConfig;
	readonly presets: readonly any[];
	readonly plugins: readonly any[];
	readonly themes: readonly any[];
	readonly customFields: Record<string, any>;
}

export interface DocusaurusThemeConfig {
	readonly navbar: DocusaurusNavbar;
	readonly footer: DocusaurusFooter;
	readonly prism: DocusaurusPrism;
	readonly colorMode: DocusaurusColorMode;
	readonly docs: DocusaurusDocsConfig;
	readonly algolia?: DocusaurusAlgolia;
}

export interface DocusaurusNavbar {
	readonly title: string;
	readonly logo?: {
		readonly alt: string;
		readonly src: string;
		readonly href?: string;
	};
	readonly items: readonly any[];
	readonly hideOnScroll: boolean;
}

export interface DocusaurusFooter {
	readonly style: "dark" | "light";
	readonly links: readonly any[];
	readonly copyright: string;
}

export interface DocusaurusPrism {
	readonly theme: any;
	readonly darkTheme: any;
	readonly additionalLanguages: readonly string[];
}

export interface DocusaurusColorMode {
	readonly defaultMode: "light" | "dark";
	readonly disableSwitch: boolean;
	readonly respectPrefersColorScheme: boolean;
}

export interface DocusaurusDocsConfig {
	readonly sidebarPath: string;
	readonly editUrl?: string;
	readonly showLastUpdateAuthor: boolean;
	readonly showLastUpdateTime: boolean;
	readonly breadcrumbs: boolean;
}

export interface DocusaurusAlgolia {
	readonly appId: string;
	readonly apiKey: string;
	readonly indexName: string;
	readonly contextualSearch: boolean;
}

export class DocusaurusPortalGenerator extends BaseGenerator<DocumentationPortalOptions> {
	async generate(
		options: DocumentationPortalOptions,
	): Promise<DocumentationPortalResult> {
		try {
			this.logger.info(
				`Generating Docusaurus documentation portal for ${options.projectName}`,
			);

			await this.validateOptions(options);

			const portalDir = join(options.outputDir, "docs-portal");
			const staticDir = join(portalDir, "static");
			const docsDir = join(portalDir, "docs");
			const srcDir = join(portalDir, "src");

			// Create directory structure
			this.createDirectoryStructure(portalDir);

			// Generate configuration files
			const configFiles = await this.generateConfigurationFiles(
				options,
				portalDir,
			);

			// Generate content structure
			const contentFiles = await this.generateContentStructure(
				options,
				docsDir,
			);

			// Generate custom components and pages
			const componentFiles = await this.generateComponents(options, srcDir);

			// Generate assets and static files
			const assetFiles = await this.generateAssets(options, staticDir);

			// Generate package.json and dependencies
			const packageFile = await this.generatePackageJson(options, portalDir);

			// Generate deployment configuration
			const deploymentFiles = await this.generateDeploymentConfig(
				options,
				portalDir,
			);

			// Generate custom CSS and styling
			const styleFiles = await this.generateStyling(options, srcDir);

			// Generate search configuration
			const searchConfig = await this.generateSearchConfig(options, portalDir);

			const allFiles = [
				...configFiles,
				...contentFiles,
				...componentFiles,
				...assetFiles,
				packageFile,
				...deploymentFiles,
				...styleFiles,
				...searchConfig,
			];

			const portalUrl = this.generatePortalUrl(options);

			this.logger.success(
				`Docusaurus portal generated successfully at ${portalDir}`,
			);

			return {
				success: true,
				message: `Docusaurus documentation portal created successfully for ${options.projectName}`,
				files: allFiles,
				configFiles,
				assetFiles,
				generatedPages: contentFiles,
				portalUrl,
				commands: [
					"cd docs-portal",
					"npm install",
					"npm start # Start development server",
					"npm run build # Build for production",
					"npm run serve # Serve production build locally",
				],
				nextSteps: [
					"Customize the theme colors and branding in docusaurus.config.js",
					"Add your documentation content to the docs/ directory",
					"Configure search with Algolia or enable local search",
					"Set up continuous deployment with your preferred platform",
					"Enable analytics and feedback collection",
					"Configure automated documentation synchronization",
				],
			};
		} catch (error) {
			this.logger.error("Failed to generate Docusaurus portal", error);
			return {
				success: false,
				message: `Failed to generate Docusaurus portal: ${error instanceof Error ? error.message : "Unknown error"}`,
				files: [],
				configFiles: [],
				assetFiles: [],
				generatedPages: [],
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	private createDirectoryStructure(portalDir: string): void {
		const dirs = [
			portalDir,
			join(portalDir, "docs"),
			join(portalDir, "docs", "api"),
			join(portalDir, "docs", "guides"),
			join(portalDir, "docs", "tutorials"),
			join(portalDir, "docs", "reference"),
			join(portalDir, "blog"),
			join(portalDir, "src"),
			join(portalDir, "src", "components"),
			join(portalDir, "src", "pages"),
			join(portalDir, "src", "css"),
			join(portalDir, "static"),
			join(portalDir, "static", "img"),
			join(portalDir, "static", "icons"),
			join(portalDir, ".github"),
			join(portalDir, ".github", "workflows"),
		];

		dirs.forEach((dir) => {
			if (!existsSync(dir)) {
				mkdirSync(dir, { recursive: true });
			}
		});
	}

	private async generateConfigurationFiles(
		options: DocumentationPortalOptions,
		portalDir: string,
	): Promise<string[]> {
		const files: string[] = [];

		// Generate main Docusaurus config
		const docusaurusConfig = this.generateDocusaurusConfig(options);
		const configPath = join(portalDir, "docusaurus.config.js");
		writeFileSync(configPath, this.formatDocusaurusConfig(docusaurusConfig));
		files.push(configPath);

		// Generate sidebar configuration
		const sidebarPath = join(portalDir, "sidebars.js");
		writeFileSync(sidebarPath, this.generateSidebarConfig(options));
		files.push(sidebarPath);

		// Generate TypeScript config
		const tsconfigPath = join(portalDir, "tsconfig.json");
		writeFileSync(tsconfigPath, this.generateTSConfig());
		files.push(tsconfigPath);

		// Generate Babel config
		const babelPath = join(portalDir, "babel.config.js");
		writeFileSync(babelPath, this.generateBabelConfig());
		files.push(babelPath);

		return files;
	}

	private generateDocusaurusConfig(
		options: DocumentationPortalOptions,
	): DocusaurusConfig {
		const { branding, features, search, analytics, deployment } = options;

		return {
			title: branding.siteName,
			tagline: branding.tagline || `Documentation for ${options.projectName}`,
			url: deployment.customDomain || "https://your-docusaurus-test-site.com",
			baseUrl: deployment.basePath || "/",
			favicon: branding.favicon || "img/favicon.ico",
			organizationName: options.author || "your-org",
			projectName: options.projectName,

			themeConfig: {
				navbar: {
					title: branding.siteName,
					logo: branding.logo
						? {
								alt: branding.logo.alt,
								src: branding.logo.src,
								href: branding.logo.href,
							}
						: undefined,
					items: this.generateNavbarItems(options.navigation.navbar),
					hideOnScroll: false,
				},

				footer: {
					style: "dark",
					links:
						branding.footerLinks?.map((link) => ({
							title: link.title,
							items: link.items,
						})) || [],
					copyright: `Copyright © ${new Date().getFullYear()} ${options.author || "Your Organization"}. Built with Docusaurus.`,
				},

				prism: {
					theme: require("prism-react-renderer/themes/github"),
					darkTheme: require("prism-react-renderer/themes/dracula"),
					additionalLanguages: [
						"bash",
						"json",
						"yaml",
						"typescript",
						"javascript",
					],
				},

				colorMode: {
					defaultMode: "light",
					disableSwitch: !features.enableDarkMode,
					respectPrefersColorScheme: features.enableDarkMode,
				},

				docs: {
					sidebarPath: require.resolve("./sidebars.js"),
					editUrl:
						features.enableEditOnGitHub && options.repository
							? `${options.repository}/tree/main/docs/`
							: undefined,
					showLastUpdateAuthor: features.enableContributors,
					showLastUpdateTime: features.enableLastUpdated,
					breadcrumbs: options.navigation.breadcrumbs,
				},

				algolia:
					search.provider === "algolia"
						? {
								appId: search.appId!,
								apiKey: search.apiKey!,
								indexName: search.indexName!,
								contextualSearch: search.contextualSearch || true,
							}
						: undefined,
			},

			presets: [
				[
					"classic",
					{
						docs: {
							sidebarPath: require.resolve("./sidebars.js"),
							editUrl:
								features.enableEditOnGitHub && options.repository
									? `${options.repository}/tree/main/docs/`
									: undefined,
						},
						blog: {
							showReadingTime: true,
							editUrl:
								features.enableEditOnGitHub && options.repository
									? `${options.repository}/tree/main/blog/`
									: undefined,
						},
						theme: {
							customCss: require.resolve("./src/css/custom.css"),
						},
						gtag:
							analytics.provider === "google"
								? {
										trackingID: analytics.trackingId!,
									}
								: undefined,
					},
				],
			],

			plugins: this.generatePlugins(options),
			themes: [],
			customFields: {
				projectType: options.projectType,
				runtime: options.runtime,
				framework: options.framework,
				version: options.version,
			},
		};
	}

	private generatePlugins(options: DocumentationPortalOptions): any[] {
		const plugins: any[] = [];

		// Add search plugin if using local search
		if (options.search.provider === "local") {
			plugins.push([
				require.resolve("@docusaurus/plugin-content-docs"),
				{
					id: "search",
					path: "./search",
					routeBasePath: "search",
				},
			]);
		}

		// Add PWA plugin if enabled
		if (options.features.enablePrintView) {
			plugins.push([
				"@docusaurus/plugin-pwa",
				{
					debug: true,
					offlineModeActivationStrategies: [
						"appInstalled",
						"standalone",
						"queryString",
					],
					pwaHead: [
						{
							tagName: "link",
							rel: "icon",
							href: "/img/docusaurus.png",
						},
						{
							tagName: "link",
							rel: "manifest",
							href: "/manifest.json",
						},
						{
							tagName: "meta",
							name: "theme-color",
							content: "rgb(37, 194, 160)",
						},
					],
				},
			]);
		}

		return plugins;
	}

	private generateNavbarItems(navbarItems: readonly NavbarItem[]): any[] {
		return navbarItems.map((item) => ({
			type: item.type,
			label: item.label,
			position: item.position,
			to: item.to,
			href: item.href,
			items: item.items?.map((subItem) => ({
				type: subItem.type,
				label: subItem.label,
				to: subItem.to,
				href: subItem.href,
			})),
		}));
	}

	private generateSidebarConfig(options: DocumentationPortalOptions): string {
		const sidebarItems = options.navigation.sidebar;

		const generateSidebarJS = (items: readonly SidebarItem[]): string => {
			const formatItem = (item: SidebarItem): string => {
				if (item.type === "category") {
					return `{
            type: 'category',
            label: '${item.label}',
            collapsed: ${item.collapsed || false},
            items: [${item.items?.map(formatItem).join(",\n      ") || ""}],
          }`;
				} else if (item.type === "doc") {
					return `{
            type: 'doc',
            id: '${item.id}',
            label: '${item.label}',
          }`;
				} else if (item.type === "link") {
					return `{
            type: 'link',
            label: '${item.label}',
            href: '${item.href}',
          }`;
				} else if (item.type === "generated") {
					return `{
            type: 'autogenerated',
            dirName: '${item.id}',
          }`;
				}
				return `'${item.id}'`;
			};

			return `module.exports = {
  tutorialSidebar: [
    ${items.map(formatItem).join(",\n    ")}
  ],
};`;
		};

		return generateSidebarJS(sidebarItems);
	}

	private generateTSConfig(): string {
		return JSON.stringify(
			{
				extends: "@docusaurus/tsconfig",
				compilerOptions: {
					baseUrl: ".",
					paths: {
						"@site/*": ["./src/*"],
						"@generated/*": ["./.docusaurus/*"],
					},
				},
				include: ["src/**/*", "docs/**/*", "blog/**/*"],
			},
			null,
			2,
		);
	}

	private generateBabelConfig(): string {
		return `module.exports = {
  presets: [require.resolve('@docusaurus/core/lib/babel/preset')],
};`;
	}

	private async generateContentStructure(
		options: DocumentationPortalOptions,
		docsDir: string,
	): Promise<string[]> {
		const files: string[] = [];

		// Generate main intro page
		const introPath = join(docsDir, "intro.md");
		writeFileSync(introPath, this.generateIntroContent(options));
		files.push(introPath);

		// Generate getting started guide
		const gettingStartedPath = join(docsDir, "getting-started.md");
		writeFileSync(
			gettingStartedPath,
			this.generateGettingStartedContent(options),
		);
		files.push(gettingStartedPath);

		// Generate API documentation structure
		const apiDir = join(docsDir, "api");
		const apiIndexPath = join(apiDir, "index.md");
		writeFileSync(apiIndexPath, this.generateAPIIndexContent(options));
		files.push(apiIndexPath);

		// Generate guides structure
		const guidesDir = join(docsDir, "guides");
		const guidesIndexPath = join(guidesDir, "index.md");
		writeFileSync(guidesIndexPath, this.generateGuidesIndexContent(options));
		files.push(guidesIndexPath);

		// Generate tutorials structure
		const tutorialsDir = join(docsDir, "tutorials");
		const tutorialsIndexPath = join(tutorialsDir, "index.md");
		writeFileSync(
			tutorialsIndexPath,
			this.generateTutorialsIndexContent(options),
		);
		files.push(tutorialsIndexPath);

		// Generate reference documentation
		const referenceDir = join(docsDir, "reference");
		const referenceIndexPath = join(referenceDir, "index.md");
		writeFileSync(
			referenceIndexPath,
			this.generateReferenceIndexContent(options),
		);
		files.push(referenceIndexPath);

		return files;
	}

	private generateIntroContent(options: DocumentationPortalOptions): string {
		return `---
sidebar_position: 1
title: Introduction
description: Welcome to ${options.projectName} documentation
---

# ${options.projectName} Documentation

${options.description || `Welcome to the comprehensive documentation for ${options.projectName}.`}

## What is ${options.projectName}?

${options.projectName} is a ${options.projectType} application built with ${options.framework || options.runtime}. This documentation will help you get started, understand the architecture, and make the most of all available features.

## Quick Start

Get up and running with ${options.projectName} in just a few minutes:

1. **Installation**: Follow our [Getting Started Guide](./getting-started.md)
2. **Configuration**: Learn about [Configuration Options](./guides/configuration.md)
3. **API Reference**: Explore our [API Documentation](./api/index.md)
4. **Examples**: Check out our [Tutorials](./tutorials/index.md)

## Documentation Sections

### 📚 [Getting Started](./getting-started.md)
Step-by-step instructions to set up and run ${options.projectName}.

### 🔧 [Guides](./guides/index.md)
In-depth guides covering various aspects of ${options.projectName}.

### 🎓 [Tutorials](./tutorials/index.md)
Hands-on tutorials to learn ${options.projectName} by example.

### 📖 [API Reference](./api/index.md)
Complete API documentation and reference materials.

### 📋 [Reference](./reference/index.md)
Additional reference materials and resources.

## Need Help?

- 🐛 [Report Issues](${options.repository || "#"}/issues)
- 💬 [Discussions](${options.repository || "#"}/discussions)
- 📧 [Contact Support](mailto:support@example.com)

---

*This documentation is automatically generated and synchronized with the codebase.*
`;
	}

	private generateGettingStartedContent(
		options: DocumentationPortalOptions,
	): string {
		return `---
sidebar_position: 2
title: Getting Started
description: Quick start guide for ${options.projectName}
---

# Getting Started with ${options.projectName}

This guide will help you get ${options.projectName} up and running in your environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **${options.runtime}** (version ${this.getRecommendedVersion(options.runtime)})
${options.runtime === "node" ? "- **npm** or **yarn** package manager" : ""}
${options.databases.length > 0 ? `- **Database**: ${options.databases.join(" or ")}\n` : ""}

## Installation

### Option 1: Using Package Manager ${options.runtime === "node" ? "(Recommended)" : ""}

${this.generateInstallationInstructions(options)}

### Option 2: From Source

\`\`\`bash
git clone ${options.repository || "https://github.com/your-org/your-repo.git"}
cd ${options.projectName}
${this.getInstallCommand(options.runtime)}
${this.getBuildCommand(options.runtime)}
\`\`\`

## Configuration

Create a configuration file:

\`\`\`${this.getConfigFileExtension(options)}
${this.generateSampleConfig(options)}
\`\`\`

## Running the Application

### Development Mode

\`\`\`bash
${this.getDevCommand(options)}
\`\`\`

### Production Mode

\`\`\`bash
${this.getProdCommand(options)}
\`\`\`

## Verification

Verify your installation by running:

\`\`\`bash
${this.getHealthCheckCommand(options)}
\`\`\`

You should see output similar to:

\`\`\`
✅ ${options.projectName} is running successfully!
🌐 Server: http://localhost:${this.getDefaultPort(options)}
📊 Status: Healthy
\`\`\`

## Next Steps

Now that you have ${options.projectName} running:

1. 📖 Read the [Configuration Guide](./guides/configuration.md)
2. 🎓 Follow our [First Tutorial](./tutorials/your-first-app.md)
3. 🔍 Explore the [API Documentation](./api/index.md)
4. 🛠️ Check out [Best Practices](./guides/best-practices.md)

## Troubleshooting

### Common Issues

#### Port Already in Use
If you see "port already in use" error:
\`\`\`bash
${this.getPortCheckCommand(options)}
\`\`\`

#### Permission Denied
On Unix systems, you might need elevated permissions:
\`\`\`bash
sudo ${this.getInstallCommand(options.runtime)}
\`\`\`

### Getting Help

If you encounter issues:

1. Check our [Troubleshooting Guide](./reference/troubleshooting.md)
2. Search [existing issues](${options.repository || "#"}/issues)
3. [Create a new issue](${options.repository || "#"}/issues/new)

---

*Need more help? Join our community discussions or contact support.*
`;
	}

	private generateAPIIndexContent(options: DocumentationPortalOptions): string {
		return `---
title: API Documentation
description: Complete API reference for ${options.projectName}
---

# API Documentation

Welcome to the ${options.projectName} API documentation. This section provides comprehensive information about all available endpoints, authentication, and usage examples.

## API Overview

- **Base URL**: \`https://api.${options.projectName.toLowerCase()}.com\`
- **API Version**: \`${options.version}\`
- **Authentication**: Bearer Token / API Key
- **Response Format**: JSON
- **Rate Limiting**: 1000 requests/hour

## Authentication

All API requests require authentication. Include your API key in the request header:

\`\`\`http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
\`\`\`

## Quick Start

### Making Your First Request

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     https://api.${options.projectName.toLowerCase()}.com/v1/status
\`\`\`

### Response Format

All responses follow this structure:

\`\`\`json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2024-01-01T00:00:00Z"
}
\`\`\`

## API Sections

### Core APIs

- [Authentication](./auth.md) - User authentication and authorization
- [Users](./users.md) - User management operations
- [Resources](./resources.md) - Main resource operations

### Integration APIs

${options.integrations.map((integration) => `- [${integration}](./integrations/${integration.toLowerCase()}.md) - ${integration} integration`).join("\n")}

### Utility APIs

- [Health Check](./health.md) - System health and status
- [Configuration](./config.md) - Runtime configuration
- [Metrics](./metrics.md) - Performance and usage metrics

## SDKs and Libraries

We provide official SDKs for popular programming languages:

- [JavaScript/TypeScript SDK](./sdks/javascript.md)
- [Python SDK](./sdks/python.md)
- [Go SDK](./sdks/go.md)
- [Java SDK](./sdks/java.md)

## Rate Limiting

API requests are subject to rate limiting:

| Tier | Requests/Hour | Burst |
|------|---------------|-------|
| Free | 1,000 | 100 |
| Pro | 10,000 | 500 |
| Enterprise | Unlimited | 1,000 |

## Error Handling

The API uses standard HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Server Error |

## Support

- 📧 API Support: api-support@example.com
- 🐛 Report Issues: [GitHub Issues](${options.repository || "#"}/issues)
- 💬 Community: [Discussions](${options.repository || "#"}/discussions)

---

*This documentation is automatically generated from OpenAPI specifications.*
`;
	}

	private generateGuidesIndexContent(
		options: DocumentationPortalOptions,
	): string {
		return `---
title: Guides
description: Comprehensive guides for ${options.projectName}
---

# ${options.projectName} Guides

This section contains in-depth guides to help you make the most of ${options.projectName}.

## Essential Guides

### 🚀 [Getting Started](../getting-started.md)
Everything you need to know to start using ${options.projectName}.

### ⚙️ [Configuration](./configuration.md)
Complete configuration reference and best practices.

### 🏗️ [Architecture](./architecture.md)
Understanding the ${options.projectName} architecture and design principles.

### 🔒 [Security](./security.md)
Security best practices and implementation guidelines.

## Development Guides

### 🛠️ [Development Setup](./development-setup.md)
Setting up your development environment.

### 🧪 [Testing](./testing.md)
Testing strategies and best practices.

### 📦 [Deployment](./deployment.md)
Deployment options and strategies.

### 🔄 [CI/CD](./cicd.md)
Continuous integration and deployment setup.

## Integration Guides

${options.integrations.map((integration) => `### 🔌 [${integration} Integration](./integrations/${integration.toLowerCase()}.md)\nHow to integrate with ${integration}.`).join("\n\n")}

## Advanced Topics

### 📈 [Performance Optimization](./performance.md)
Tips and techniques for optimal performance.

### 🔍 [Monitoring & Observability](./monitoring.md)
Setting up monitoring and observability.

### 🛡️ [Security Hardening](./security-hardening.md)
Advanced security configuration and hardening.

### 📊 [Analytics & Metrics](./analytics.md)
Implementing analytics and metrics collection.

## Framework-Specific Guides

${
	options.framework
		? `### ${options.framework} Integration
Specific guides for ${options.framework} framework integration.`
		: ""
}

## Database Guides

${options.databases
	.map(
		(db) => `### ${db} Setup
Configuration and optimization for ${db}.`,
	)
	.join("\n\n")}

## Best Practices

### 📋 [Code Style](./code-style.md)
Coding standards and style guidelines.

### 🔄 [API Design](./api-design.md)
RESTful API design principles and patterns.

### 📝 [Documentation](./documentation.md)
Documentation standards and practices.

### ♻️ [Error Handling](./error-handling.md)
Comprehensive error handling strategies.

## Troubleshooting

### 🔧 [Common Issues](./troubleshooting.md)
Solutions to common problems and issues.

### 🐛 [Debugging](./debugging.md)
Debugging techniques and tools.

### 🚨 [Error Codes](./error-codes.md)
Complete error code reference.

---

*Can't find what you're looking for? [Suggest a new guide](${options.repository || "#"}/issues/new) or check our [FAQ](../reference/faq.md).*
`;
	}

	private generateTutorialsIndexContent(
		options: DocumentationPortalOptions,
	): string {
		return `---
title: Tutorials
description: Step-by-step tutorials for ${options.projectName}
---

# ${options.projectName} Tutorials

Learn ${options.projectName} through hands-on tutorials and examples.

## Beginner Tutorials

### 🌟 [Your First Application](./your-first-app.md)
Build your first application with ${options.projectName} from scratch.

### 📝 [Basic CRUD Operations](./basic-crud.md)
Learn the fundamentals of Create, Read, Update, and Delete operations.

### 🔐 [Authentication Setup](./authentication.md)
Implement user authentication and authorization.

### 📱 [Responsive Design](./responsive-design.md)
Create responsive applications that work on all devices.

## Intermediate Tutorials

### 🔄 [State Management](./state-management.md)
Advanced state management patterns and techniques.

### 🌐 [API Integration](./api-integration.md)
Connect your application with external APIs and services.

### 📊 [Data Visualization](./data-visualization.md)
Create beautiful charts and visualizations.

### 🔍 [Search Implementation](./search-implementation.md)
Add powerful search capabilities to your application.

## Advanced Tutorials

### 🚀 [Performance Optimization](./performance-optimization.md)
Optimize your application for maximum performance.

### 🏗️ [Microservices Architecture](./microservices.md)
Build scalable microservices with ${options.projectName}.

### 🔄 [Real-time Features](./realtime-features.md)
Implement real-time updates and notifications.

### 🤖 [AI Integration](./ai-integration.md)
Add artificial intelligence capabilities to your application.

## Project-Based Tutorials

### 📚 [Blog Platform](./projects/blog-platform.md)
Build a complete blog platform with ${options.projectName}.

### 🛒 [E-commerce Store](./projects/ecommerce-store.md)
Create a full-featured e-commerce application.

### 💬 [Chat Application](./projects/chat-application.md)
Build a real-time chat application.

### 📈 [Analytics Dashboard](./projects/analytics-dashboard.md)
Create a comprehensive analytics dashboard.

## Integration Tutorials

${options.integrations.map((integration) => `### 🔌 [${integration} Integration Tutorial](./integrations/${integration.toLowerCase()}-tutorial.md)\nStep-by-step ${integration} integration guide.`).join("\n\n")}

## Video Tutorials

### 📺 Getting Started Series
- [Part 1: Installation & Setup](https://youtu.be/example)
- [Part 2: Your First App](https://youtu.be/example)
- [Part 3: Authentication](https://youtu.be/example)

### 📺 Advanced Topics
- [Performance Optimization](https://youtu.be/example)
- [Deployment Strategies](https://youtu.be/example)
- [Security Best Practices](https://youtu.be/example)

## Interactive Tutorials

### 🖥️ [Online Playground](https://playground.${options.projectName.toLowerCase()}.com)
Try ${options.projectName} directly in your browser without installation.

### 🧪 [Code Examples](./examples/index.md)
Browse and run interactive code examples.

## Community Tutorials

### 📝 [Community Contributions](./community/index.md)
Tutorials created by the ${options.projectName} community.

### 🎯 [Use Cases](./use-cases/index.md)
Real-world use cases and implementation examples.

---

## Tutorial Guidelines

### Before You Start
- Basic knowledge of ${options.runtime}
- Familiarity with ${options.framework || "web development"}
- Development environment set up

### Getting Help
- 💬 [Community Discussions](${options.repository || "#"}/discussions)
- 🐛 [Report Issues](${options.repository || "#"}/issues)
- 📧 [Tutorial Feedback](mailto:tutorials@example.com)

---

*All tutorials are regularly updated and tested with the latest version of ${options.projectName}.*
`;
	}

	private generateReferenceIndexContent(
		options: DocumentationPortalOptions,
	): string {
		return `---
title: Reference
description: Reference materials for ${options.projectName}
---

# Reference Documentation

Quick reference materials and resources for ${options.projectName}.

## API Reference

### 📚 [Complete API Reference](../api/index.md)
Comprehensive API documentation with examples.

### 🔗 [OpenAPI Specification](./openapi.yaml)
Machine-readable API specification.

### 📋 [Postman Collection](./postman-collection.json)
Ready-to-use Postman collection for API testing.

## Configuration Reference

### ⚙️ [Configuration Options](./configuration-reference.md)
Complete configuration parameters reference.

### 🌍 [Environment Variables](./environment-variables.md)
All supported environment variables.

### 📄 [Configuration Files](./configuration-files.md)
Configuration file formats and examples.

## CLI Reference

### 💻 [Command Line Interface](./cli-reference.md)
Complete CLI commands and options.

### 🔧 [CLI Examples](./cli-examples.md)
Common CLI usage examples.

## Error Reference

### 🚨 [Error Codes](./error-codes.md)
Complete error codes and their meanings.

### 🔧 [Troubleshooting Guide](./troubleshooting.md)
Common issues and their solutions.

## Architecture Reference

### 🏗️ [System Architecture](./architecture.md)
Detailed system architecture documentation.

### 📊 [Database Schema](./database-schema.md)
Complete database schema reference.

### 🔄 [Data Flow Diagrams](./data-flow.md)
Visual representation of data flows.

## Security Reference

### 🔒 [Security Model](./security-model.md)
Comprehensive security architecture.

### 🛡️ [Security Headers](./security-headers.md)
Required security headers and configurations.

### 🔑 [Authentication Methods](./authentication-methods.md)
Supported authentication and authorization methods.

## Performance Reference

### 📈 [Performance Metrics](./performance-metrics.md)
Key performance indicators and benchmarks.

### ⚡ [Optimization Guidelines](./optimization-guidelines.md)
Performance optimization recommendations.

## Integration Reference

${options.integrations.map((integration) => `### 🔌 [${integration} Reference](./integrations/${integration.toLowerCase()}-reference.md)\nComplete ${integration} integration reference.`).join("\n\n")}

## Deployment Reference

### 🚀 [Deployment Options](./deployment-options.md)
Available deployment methods and platforms.

### 🐳 [Docker Reference](./docker-reference.md)
Docker images and container configuration.

### ☁️ [Cloud Deployment](./cloud-deployment.md)
Cloud-specific deployment guides.

## Development Reference

### 🛠️ [Development Tools](./development-tools.md)
Recommended development tools and setup.

### 📦 [Dependencies](./dependencies.md)
Complete dependency list and versions.

### 🔄 [Release Notes](./release-notes.md)
Version history and release notes.

## Glossary

### 📖 [Glossary](./glossary.md)
Definitions of terms and concepts used in ${options.projectName}.

## FAQ

### ❓ [Frequently Asked Questions](./faq.md)
Answers to common questions.

## Resources

### 🔗 [Useful Links](./useful-links.md)
External resources and links.

### 📚 [Recommended Reading](./recommended-reading.md)
Books, articles, and resources for further learning.

### 🎓 [Training Materials](./training-materials.md)
Training courses and certification programs.

## Changelog

### 📝 [Changelog](./CHANGELOG.md)
Detailed changelog for all versions.

### 🔄 [Migration Guides](./migration-guides.md)
Guides for migrating between versions.

---

## Quick Links

- 🚀 [Getting Started](../getting-started.md)
- 📖 [API Documentation](../api/index.md)
- 🎓 [Tutorials](../tutorials/index.md)
- 🔧 [Guides](../guides/index.md)

---

*Reference documentation is automatically updated with each release.*
`;
	}

	private async generateComponents(
		options: DocumentationPortalOptions,
		srcDir: string,
	): Promise<string[]> {
		const files: string[] = [];

		// Generate custom homepage
		const homepagePath = join(srcDir, "pages", "index.tsx");
		writeFileSync(homepagePath, this.generateHomepage(options));
		files.push(homepagePath);

		// Generate custom components
		const componentsDir = join(srcDir, "components");

		// Feature showcase component
		const featureShowcasePath = join(componentsDir, "FeatureShowcase.tsx");
		writeFileSync(featureShowcasePath, this.generateFeatureShowcase(options));
		files.push(featureShowcasePath);

		// API explorer component
		const apiExplorerPath = join(componentsDir, "APIExplorer.tsx");
		writeFileSync(apiExplorerPath, this.generateAPIExplorer(options));
		files.push(apiExplorerPath);

		// Interactive demo component
		const interactiveDemoPath = join(componentsDir, "InteractiveDemo.tsx");
		writeFileSync(interactiveDemoPath, this.generateInteractiveDemo(options));
		files.push(interactiveDemoPath);

		return files;
	}

	private generateHomepage(options: DocumentationPortalOptions): string {
		return `import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import FeatureShowcase from '@site/src/components/FeatureShowcase';

import styles from './index.module.css';

function HomepageHeader(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Get Started - 5min ⏱️
          </Link>
          <Link
            className="button button--outline button--secondary button--lg margin-left--md"
            to="/docs/api">
            API Reference 📚
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={\`Welcome to \${siteConfig.title}\`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <FeatureShowcase />
        <section className={styles.quickStart}>
          <div className="container">
            <div className="row">
              <div className="col col--6">
                <h2>Quick Start</h2>
                <p>Get up and running with ${options.projectName} in minutes:</p>
                <pre><code>{${JSON.stringify(this.getQuickStartCode(options))}}</code></pre>
              </div>
              <div className="col col--6">
                <h2>Why ${options.projectName}?</h2>
                <ul>
                  <li>🚀 Fast and lightweight</li>
                  <li>📱 Cross-platform support</li>
                  <li>🔧 Easy to configure</li>
                  <li>📖 Comprehensive documentation</li>
                  <li>🌍 Active community</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}`;
	}

	private generateFeatureShowcase(options: DocumentationPortalOptions): string {
		return `import React from 'react';
import clsx from 'clsx';
import styles from './FeatureShowcase.module.css';

interface FeatureItem {
  readonly title: string;
  readonly description: string;
  readonly icon: string;
}

const FeatureList: readonly FeatureItem[] = [
  {
    title: 'Easy to Use',
    icon: '⚡',
    description: '${options.projectName} was designed from the ground up to be easily installed and used to get your project up and running quickly.',
  },
  {
    title: 'Focus on What Matters',
    icon: '🎯',
    description: 'Focus on your business logic. ${options.projectName} handles the infrastructure and boilerplate code for you.',
  },
  {
    title: 'Powered by Modern Tech',
    icon: '🚀',
    description: 'Built with ${options.framework || options.runtime} and modern best practices. Extend or customize your setup easily.',
  },
  {
    title: 'Production Ready',
    icon: '🏢',
    description: 'Battle-tested in production environments. Includes monitoring, logging, and security features out of the box.',
  },
  {
    title: 'Developer Experience',
    icon: '👨‍💻',
    description: 'Excellent developer experience with TypeScript support, hot reloading, and comprehensive debugging tools.',
  },
  {
    title: 'Scalable Architecture',
    icon: '📈',
    description: 'Designed to scale from small projects to enterprise applications with microservices architecture support.',
  },
];

function Feature({title, icon, description}: FeatureItem): JSX.Element {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <div className={styles.featureIcon}>{icon}</div>
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function FeatureShowcase(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}`;
	}

	private generateAPIExplorer(options: DocumentationPortalOptions): string {
		return `import React, { useState } from 'react';
import styles from './APIExplorer.module.css';

interface APIEndpoint {
  readonly method: string;
  readonly path: string;
  readonly description: string;
  readonly example: string;
}

const apiEndpoints: readonly APIEndpoint[] = [
  {
    method: 'GET',
    path: '/api/v1/status',
    description: 'Get system status',
    example: \`curl -H "Authorization: Bearer TOKEN" https://api.${options.projectName.toLowerCase()}.com/v1/status\`,
  },
  {
    method: 'GET',
    path: '/api/v1/users',
    description: 'List all users',
    example: \`curl -H "Authorization: Bearer TOKEN" https://api.${options.projectName.toLowerCase()}.com/v1/users\`,
  },
  {
    method: 'POST',
    path: '/api/v1/users',
    description: 'Create a new user',
    example: \`curl -X POST -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"name": "John Doe", "email": "john@example.com"}' https://api.${options.projectName.toLowerCase()}.com/v1/users\`,
  },
];

export default function APIExplorer(): JSX.Element {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint>(apiEndpoints[0]);

  return (
    <div className={styles.apiExplorer}>
      <h2>API Explorer</h2>
      <div className={styles.explorerContent}>
        <div className={styles.endpointList}>
          {apiEndpoints.map((endpoint, index) => (
            <div
              key={index}
              className={\`\${styles.endpointItem} \${selectedEndpoint === endpoint ? styles.active : ''}\`}
              onClick={() => setSelectedEndpoint(endpoint)}
            >
              <span className={\`\${styles.method} \${styles[endpoint.method.toLowerCase()]}\`}>
                {endpoint.method}
              </span>
              <span className={styles.path}>{endpoint.path}</span>
            </div>
          ))}
        </div>
        <div className={styles.endpointDetails}>
          <h3>
            <span className={\`\${styles.method} \${styles[selectedEndpoint.method.toLowerCase()]}\`}>
              {selectedEndpoint.method}
            </span>
            {selectedEndpoint.path}
          </h3>
          <p>{selectedEndpoint.description}</p>
          <h4>Example Request</h4>
          <pre><code>{selectedEndpoint.example}</code></pre>
        </div>
      </div>
    </div>
  );
}`;
	}

	private generateInteractiveDemo(options: DocumentationPortalOptions): string {
		return `import React, { useState } from 'react';
import styles from './InteractiveDemo.module.css';

export default function InteractiveDemo(): JSX.Element {
  const [inputValue, setInputValue] = useState('');
  const [output, setOutput] = useState('');

  const runDemo = () => {
    // Simulate API call or processing
    setOutput(\`Processing: \${inputValue}\\nResult: Success!\\nTimestamp: \${new Date().toISOString()}\`);
  };

  const clearDemo = () => {
    setInputValue('');
    setOutput('');
  };

  return (
    <div className={styles.interactiveDemo}>
      <h2>Try ${options.projectName} Interactive Demo</h2>
      <div className={styles.demoContainer}>
        <div className={styles.inputSection}>
          <label htmlFor="demo-input">Enter some data:</label>
          <input
            id="demo-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type something..."
            className={styles.demoInput}
          />
          <div className={styles.buttonGroup}>
            <button
              onClick={runDemo}
              disabled={!inputValue}
              className={styles.runButton}
            >
              Run Demo
            </button>
            <button
              onClick={clearDemo}
              className={styles.clearButton}
            >
              Clear
            </button>
          </div>
        </div>
        <div className={styles.outputSection}>
          <h4>Output:</h4>
          <pre className={styles.output}>
            {output || 'Run the demo to see output...'}
          </pre>
        </div>
      </div>
      <div className={styles.demoNote}>
        <p>
          This is a simple interactive demo. Check out our{' '}
          <a href="/docs/tutorials">tutorials</a> for more comprehensive examples.
        </p>
      </div>
    </div>
  );
}`;
	}

	private async generateAssets(
		options: DocumentationPortalOptions,
		staticDir: string,
	): Promise<string[]> {
		const files: string[] = [];

		// Generate favicon
		const faviconPath = join(staticDir, "img", "favicon.ico");
		// Note: In a real implementation, you'd generate or copy actual favicon
		writeFileSync(faviconPath, ""); // Placeholder
		files.push(faviconPath);

		// Generate logo
		const logoPath = join(staticDir, "img", "logo.svg");
		writeFileSync(logoPath, this.generateLogo(options));
		files.push(logoPath);

		// Generate manifest.json for PWA
		const manifestPath = join(staticDir, "manifest.json");
		writeFileSync(manifestPath, this.generateManifest(options));
		files.push(manifestPath);

		// Generate robots.txt
		const robotsPath = join(staticDir, "robots.txt");
		writeFileSync(robotsPath, this.generateRobotsTxt(options));
		files.push(robotsPath);

		return files;
	}

	private generateLogo(options: DocumentationPortalOptions): string {
		return `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="45" fill="${options.branding.colors.primary}" />
  <text x="50" y="55" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle">
    ${options.projectName.charAt(0).toUpperCase()}
  </text>
</svg>`;
	}

	private generateManifest(options: DocumentationPortalOptions): string {
		return JSON.stringify(
			{
				name: `${options.projectName} Documentation`,
				short_name: options.projectName,
				description:
					options.description || `Documentation for ${options.projectName}`,
				start_url: "/",
				display: "standalone",
				theme_color: options.branding.colors.primary,
				background_color: options.branding.colors.background,
				icons: [
					{
						src: "/img/logo.svg",
						sizes: "192x192",
						type: "image/svg+xml",
					},
				],
			},
			null,
			2,
		);
	}

	private generateRobotsTxt(options: DocumentationPortalOptions): string {
		return `User-agent: *
Allow: /

Sitemap: ${options.deployment.customDomain || "https://your-site.com"}/sitemap.xml`;
	}

	private async generatePackageJson(
		options: DocumentationPortalOptions,
		portalDir: string,
	): Promise<string> {
		const packagePath = join(portalDir, "package.json");

		const packageJson = {
			name: `${options.projectName}-docs`,
			version: "0.0.0",
			private: true,
			scripts: {
				docusaurus: "docusaurus",
				start: "docusaurus start",
				build: "docusaurus build",
				swizzle: "docusaurus swizzle",
				deploy: "docusaurus deploy",
				clear: "docusaurus clear",
				serve: "docusaurus serve",
				"write-translations": "docusaurus write-translations",
				"write-heading-ids": "docusaurus write-heading-ids",
				typecheck: "tsc",
			},
			dependencies: {
				"@docusaurus/core": "^3.0.0",
				"@docusaurus/preset-classic": "^3.0.0",
				"@docusaurus/theme-mermaid": "^3.0.0",
				"@mdx-js/react": "^3.0.0",
				clsx: "^2.0.0",
				"prism-react-renderer": "^2.1.0",
				react: "^18.0.0",
				"react-dom": "^18.0.0",
				...(options.search.provider === "algolia" && {
					"@docusaurus/theme-search-algolia": "^3.0.0",
				}),
				...(options.features.enableMermaidDiagrams && {
					"@docusaurus/theme-mermaid": "^3.0.0",
					mermaid: "^10.0.0",
				}),
			},
			devDependencies: {
				"@docusaurus/module-type-aliases": "^3.0.0",
				"@docusaurus/tsconfig": "^3.0.0",
				"@docusaurus/types": "^3.0.0",
				typescript: "^5.0.0",
			},
			browserslist: {
				production: [">0.5%", "not dead", "not op_mini all"],
				development: [
					"last 1 chrome version",
					"last 1 firefox version",
					"last 1 safari version",
				],
			},
			engines: {
				node: ">=18.0",
			},
		};

		writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
		return packagePath;
	}

	private async generateDeploymentConfig(
		options: DocumentationPortalOptions,
		portalDir: string,
	): Promise<string[]> {
		const files: string[] = [];

		// Generate GitHub Actions workflow
		if (options.deployment.provider === "github-pages") {
			const workflowPath = join(
				portalDir,
				".github",
				"workflows",
				"deploy.yml",
			);
			writeFileSync(workflowPath, this.generateGitHubActionsWorkflow(options));
			files.push(workflowPath);
		}

		// Generate Netlify config
		if (options.deployment.provider === "netlify") {
			const netlifyPath = join(portalDir, "netlify.toml");
			writeFileSync(netlifyPath, this.generateNetlifyConfig(options));
			files.push(netlifyPath);
		}

		// Generate Vercel config
		if (options.deployment.provider === "vercel") {
			const vercelPath = join(portalDir, "vercel.json");
			writeFileSync(vercelPath, this.generateVercelConfig(options));
			files.push(vercelPath);
		}

		// Generate Docker files
		const dockerfilePath = join(portalDir, "Dockerfile");
		writeFileSync(dockerfilePath, this.generateDockerfile(options));
		files.push(dockerfilePath);

		const dockerComposePath = join(portalDir, "docker-compose.yml");
		writeFileSync(dockerComposePath, this.generateDockerCompose(options));
		files.push(dockerComposePath);

		return files;
	}

	private generateGitHubActionsWorkflow(
		options: DocumentationPortalOptions,
	): string {
		return `name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: docs-portal/package-lock.json
          
      - name: Install dependencies
        run: |
          cd docs-portal
          npm ci
          
      - name: Build website
        run: |
          cd docs-portal
          npm run build
          
      - name: Setup Pages
        uses: actions/configure-pages@v4
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs-portal/build
          
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;
	}

	private generateNetlifyConfig(options: DocumentationPortalOptions): string {
		return `[build]
  base = "docs-portal"
  publish = "build/"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"`;
	}

	private generateVercelConfig(options: DocumentationPortalOptions): string {
		return JSON.stringify(
			{
				buildCommand: "cd docs-portal && npm run build",
				outputDirectory: "docs-portal/build",
				installCommand: "cd docs-portal && npm install",
				framework: "docusaurus",
				routes: [
					{
						src: "/(.*)",
						dest: "/$1",
					},
				],
				headers: [
					{
						source: "/(.*)",
						headers: [
							{
								key: "X-Frame-Options",
								value: "DENY",
							},
							{
								key: "X-Content-Type-Options",
								value: "nosniff",
							},
						],
					},
				],
			},
			null,
			2,
		);
	}

	private generateDockerfile(options: DocumentationPortalOptions): string {
		return `FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]`;
	}

	private generateDockerCompose(options: DocumentationPortalOptions): string {
		return `version: '3.8'

services:
  docs:
    build: .
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    
  docs-dev:
    build: 
      context: .
      target: builder
    ports:
      - "3001:3000"
    volumes:
      - .:/app
      - /app/node_modules
    command: npm start
    environment:
      - NODE_ENV=development
    profiles:
      - dev`;
	}

	private async generateStyling(
		options: DocumentationPortalOptions,
		srcDir: string,
	): Promise<string[]> {
		const files: string[] = [];

		// Generate custom CSS
		const customCSSPath = join(srcDir, "css", "custom.css");
		writeFileSync(customCSSPath, this.generateCustomCSS(options));
		files.push(customCSSPath);

		// Generate component-specific CSS modules
		const componentStyles = [
			"FeatureShowcase.module.css",
			"APIExplorer.module.css",
			"InteractiveDemo.module.css",
		];

		componentStyles.forEach((styleName) => {
			const stylePath = join(srcDir, "components", styleName);
			writeFileSync(stylePath, this.generateComponentCSS(styleName, options));
			files.push(stylePath);
		});

		return files;
	}

	private generateCustomCSS(options: DocumentationPortalOptions): string {
		const { colors } = options.branding;

		return `/**
 * ${options.projectName} Documentation Custom Styles
 * Any CSS included here will be global. The classic template
 * bundles Infima by default. Infima is a CSS framework designed to
 * work well for content-centric websites.
 */

/* You can override the default Infima variables here. */
:root {
  --ifm-color-primary: ${colors.primary};
  --ifm-color-primary-dark: ${this.darkenColor(colors.primary)};
  --ifm-color-primary-darker: ${this.darkenColor(colors.primary, 0.2)};
  --ifm-color-primary-darkest: ${this.darkenColor(colors.primary, 0.3)};
  --ifm-color-primary-light: ${this.lightenColor(colors.primary)};
  --ifm-color-primary-lighter: ${this.lightenColor(colors.primary, 0.2)};
  --ifm-color-primary-lightest: ${this.lightenColor(colors.primary, 0.3)};
  --ifm-code-font-size: 95%;
  --docusaurus-highlighted-code-line-bg: rgba(0, 0, 0, 0.1);
}

/* For readability concerns, you should choose a lighter palette in dark mode. */
[data-theme='dark'] {
  --ifm-color-primary: ${this.lightenColor(colors.primary)};
  --ifm-color-primary-dark: ${colors.primary};
  --ifm-color-primary-darker: ${this.darkenColor(colors.primary)};
  --ifm-color-primary-darkest: ${this.darkenColor(colors.primary, 0.2)};
  --ifm-color-primary-light: ${this.lightenColor(colors.primary, 0.2)};
  --ifm-color-primary-lighter: ${this.lightenColor(colors.primary, 0.3)};
  --ifm-color-primary-lightest: ${this.lightenColor(colors.primary, 0.4)};
  --docusaurus-highlighted-code-line-bg: rgba(0, 0, 0, 0.3);
}

/* Custom hero banner styles */
.hero--primary {
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
}

/* Custom button styles */
.button--secondary {
  --ifm-button-background-color: ${colors.accent};
}

/* Custom code block styles */
.theme-code-block {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

/* Custom navbar styles */
.navbar {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

/* Footer customization */
.footer {
  background-color: ${colors.surface};
}

/* Custom alert styles */
.alert {
  border-radius: 8px;
  border-left: 4px solid var(--ifm-color-primary);
}

/* Responsive utilities */
@media (max-width: 768px) {
  .hero__title {
    font-size: 2rem;
  }
  
  .hero__subtitle {
    font-size: 1rem;
  }
}

/* Custom animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

/* Interactive elements */
.interactive-element {
  transition: all 0.3s ease;
}

.interactive-element:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.1);
}`;
	}

	private generateComponentCSS(
		componentName: string,
		options: DocumentationPortalOptions,
	): string {
		const { colors } = options.branding;

		switch (componentName) {
			case "FeatureShowcase.module.css":
				return `.features {
  padding: 2rem 0;
  width: 100%;
}

.featureIcon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .features {
    padding: 1rem 0;
  }
  
  .featureIcon {
    font-size: 2rem;
  }
}`;

			case "APIExplorer.module.css":
				return `.apiExplorer {
  padding: 2rem;
  background: ${colors.surface};
  border-radius: 8px;
  margin: 2rem 0;
}

.explorerContent {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin-top: 1rem;
}

.endpointList {
  border-right: 1px solid ${colors.textSecondary};
  padding-right: 1rem;
}

.endpointItem {
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.endpointItem:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.endpointItem.active {
  background-color: ${colors.primary}20;
}

.method {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  color: white;
  min-width: 60px;
  text-align: center;
}

.method.get {
  background-color: #10b981;
}

.method.post {
  background-color: #3b82f6;
}

.method.put {
  background-color: #f59e0b;
}

.method.delete {
  background-color: #ef4444;
}

.path {
  font-family: monospace;
  color: ${colors.text};
}

.endpointDetails pre {
  background-color: ${colors.background};
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
}

@media (max-width: 768px) {
  .explorerContent {
    grid-template-columns: 1fr;
  }
  
  .endpointList {
    border-right: none;
    border-bottom: 1px solid ${colors.textSecondary};
    padding-right: 0;
    padding-bottom: 1rem;
  }
}`;

			case "InteractiveDemo.module.css":
				return `.interactiveDemo {
  background: ${colors.surface};
  border-radius: 8px;
  padding: 2rem;
  margin: 2rem 0;
}

.demoContainer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1rem;
}

.inputSection label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${colors.text};
}

.demoInput {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${colors.textSecondary}40;
  border-radius: 6px;
  font-size: 1rem;
  margin-bottom: 1rem;
  transition: border-color 0.2s;
}

.demoInput:focus {
  outline: none;
  border-color: ${colors.primary};
}

.buttonGroup {
  display: flex;
  gap: 0.5rem;
}

.runButton, .clearButton {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.runButton {
  background-color: ${colors.primary};
  color: white;
}

.runButton:hover:not(:disabled) {
  background-color: ${this.darkenColor(colors.primary)};
}

.runButton:disabled {
  background-color: ${colors.textSecondary}40;
  cursor: not-allowed;
}

.clearButton {
  background-color: ${colors.textSecondary}20;
  color: ${colors.text};
}

.clearButton:hover {
  background-color: ${colors.textSecondary}40;
}

.output {
  background-color: ${colors.background};
  padding: 1rem;
  border-radius: 6px;
  min-height: 120px;
  font-family: monospace;
  font-size: 0.9rem;
  overflow-x: auto;
  white-space: pre-wrap;
}

.demoNote {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${colors.textSecondary}40;
  font-style: italic;
  color: ${colors.textSecondary};
}

@media (max-width: 768px) {
  .demoContainer {
    grid-template-columns: 1fr;
  }
}`;

			default:
				return "";
		}
	}

	private async generateSearchConfig(
		options: DocumentationPortalOptions,
		portalDir: string,
	): Promise<string[]> {
		const files: string[] = [];

		if (options.search.provider === "algolia") {
			// Generate Algolia configuration
			const algoliaConfigPath = join(portalDir, "algolia.config.json");
			writeFileSync(
				algoliaConfigPath,
				JSON.stringify(
					{
						appId: options.search.appId,
						apiKey: options.search.apiKey,
						indexName: options.search.indexName,
						contextualSearch: options.search.contextualSearch,
						searchParameters: {
							facetFilters: ["language:en"],
						},
					},
					null,
					2,
				),
			);
			files.push(algoliaConfigPath);
		}

		return files;
	}

	private formatDocusaurusConfig(config: DocusaurusConfig): string {
		return `// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = ${JSON.stringify(config, null, 2).replace(/"require\(([^)]+)\)"/g, "require($1)")};

module.exports = config;`;
	}

	private generatePortalUrl(options: DocumentationPortalOptions): string {
		if (options.deployment.customDomain) {
			return options.deployment.customDomain;
		}

		switch (options.deployment.provider) {
			case "github-pages":
				return `https://${options.author || "your-org"}.github.io/${options.projectName}`;
			case "netlify":
				return `https://${options.projectName.toLowerCase()}.netlify.app`;
			case "vercel":
				return `https://${options.projectName.toLowerCase()}.vercel.app`;
			default:
				return "http://localhost:3000";
		}
	}

	// Helper methods for configuration generation
	private getRecommendedVersion(runtime: string): string {
		const versions: Record<string, string> = {
			node: "18+",
			python: "3.9+",
			go: "1.19+",
			java: "11+",
			dotnet: "6.0+",
			php: "8.0+",
			rust: "1.65+",
		};
		return versions[runtime] || "latest";
	}

	private generateInstallationInstructions(
		options: DocumentationPortalOptions,
	): string {
		switch (options.runtime) {
			case "node":
				return `\`\`\`bash
npm install ${options.projectName}
# or
yarn add ${options.projectName}
\`\`\``;
			case "python":
				return `\`\`\`bash
pip install ${options.projectName}
\`\`\``;
			case "go":
				return `\`\`\`bash
go get github.com/your-org/${options.projectName}
\`\`\``;
			default:
				return `\`\`\`bash
# Installation instructions for ${options.runtime}
\`\`\``;
		}
	}

	private getInstallCommand(runtime: string): string {
		const commands: Record<string, string> = {
			node: "npm install",
			python: "pip install -r requirements.txt",
			go: "go mod download",
			java: "mvn install",
			dotnet: "dotnet restore",
			php: "composer install",
			rust: "cargo build",
		};
		return commands[runtime] || "make install";
	}

	private getBuildCommand(runtime: string): string {
		const commands: Record<string, string> = {
			node: "npm run build",
			python: "python setup.py build",
			go: "go build",
			java: "mvn compile",
			dotnet: "dotnet build",
			php: "composer build",
			rust: "cargo build --release",
		};
		return commands[runtime] || "make build";
	}

	private getDevCommand(options: DocumentationPortalOptions): string {
		const commands: Record<string, string> = {
			node: "npm run dev",
			python: "python main.py",
			go: "go run main.go",
			java: "mvn spring-boot:run",
			dotnet: "dotnet run",
			php: "php -S localhost:8000",
			rust: "cargo run",
		};
		return commands[options.runtime] || "./start-dev.sh";
	}

	private getProdCommand(options: DocumentationPortalOptions): string {
		const commands: Record<string, string> = {
			node: "npm start",
			python: "python main.py --env production",
			go: "./main",
			java: "java -jar target/app.jar",
			dotnet: "dotnet run --environment Production",
			php: "php -S 0.0.0.0:8000",
			rust: "./target/release/main",
		};
		return commands[options.runtime] || "./start.sh";
	}

	private getHealthCheckCommand(options: DocumentationPortalOptions): string {
		return `curl http://localhost:${this.getDefaultPort(options)}/health`;
	}

	private getDefaultPort(options: DocumentationPortalOptions): number {
		const ports: Record<string, number> = {
			node: 3000,
			python: 8000,
			go: 8080,
			java: 8080,
			dotnet: 5000,
			php: 8000,
			rust: 8080,
		};
		return ports[options.runtime] || 8080;
	}

	private getPortCheckCommand(options: DocumentationPortalOptions): string {
		const port = this.getDefaultPort(options);
		return `lsof -ti:${port} | xargs kill -9`;
	}

	private getConfigFileExtension(options: DocumentationPortalOptions): string {
		switch (options.runtime) {
			case "node":
				return "json";
			case "python":
				return "yaml";
			case "go":
				return "yaml";
			default:
				return "yaml";
		}
	}

	private generateSampleConfig(options: DocumentationPortalOptions): string {
		const config = {
			name: options.projectName,
			version: options.version,
			port: this.getDefaultPort(options),
			database: options.databases[0] || "postgresql",
			environment: "development",
		};

		switch (this.getConfigFileExtension(options)) {
			case "json":
				return JSON.stringify(config, null, 2);
			case "yaml":
				return Object.entries(config)
					.map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
					.join("\n");
			default:
				return JSON.stringify(config, null, 2);
		}
	}

	private getQuickStartCode(options: DocumentationPortalOptions): string {
		switch (options.runtime) {
			case "node":
				return `npm install ${options.projectName}
node -e "console.log('${options.projectName} is running!')"`;
			case "python":
				return `pip install ${options.projectName}
python -c "print('${options.projectName} is running!')"`;
			default:
				return `# Quick start for ${options.projectName}
echo "${options.projectName} is running!"`;
		}
	}

	// Color utility methods
	private lightenColor(color: string, amount: number = 0.1): string {
		// Simple color lightening - in production, use a proper color library
		return color; // Placeholder
	}

	private darkenColor(color: string, amount: number = 0.1): string {
		// Simple color darkening - in production, use a proper color library
		return color; // Placeholder
	}
}
