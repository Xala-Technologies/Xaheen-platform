import chalk from "chalk";
import * as fs from "fs/promises";
import * as path from "path";
import { appTemplateRegistry } from "../../services/registry/app-template-registry";
import type { CLICommand } from "../../types/index";
import { logger } from "../../utils/logger";

interface AppTemplate {
	name: string;
	description: string;
	platform: "web" | "mobile" | "desktop";
	framework: string;
	features: string[];
	dependencies: string[];
}

export default class AppDomain {
	private appTemplates: Map<string, AppTemplate>;

	constructor() {
		this.appTemplates = this.initializeAppTemplates();
	}

	private initializeAppTemplates(): Map<string, AppTemplate> {
		const templates = new Map<string, AppTemplate>();

		// Web app templates
		templates.set("nextjs-app", {
			name: "Next.js App",
			description: "Full-stack React app with Next.js 14 App Router",
			platform: "web",
			framework: "nextjs",
			features: [
				"App Router",
				"Server Components",
				"API Routes",
				"TypeScript",
				"Tailwind CSS",
			],
			dependencies: [
				"next",
				"react",
				"react-dom",
				"@xala-technologies/ui-system",
			],
		});

		templates.set("remix-app", {
			name: "Remix App",
			description: "Full-stack React app with Remix",
			platform: "web",
			framework: "remix",
			features: [
				"Nested Routes",
				"Data Loading",
				"Forms",
				"TypeScript",
				"Tailwind CSS",
			],
			dependencies: [
				"@remix-run/react",
				"@remix-run/node",
				"@xala-technologies/ui-system",
			],
		});

		templates.set("vite-react-app", {
			name: "Vite React App",
			description: "Fast React SPA with Vite",
			platform: "web",
			framework: "vite",
			features: ["HMR", "TypeScript", "PWA Support", "Tailwind CSS"],
			dependencies: [
				"react",
				"react-dom",
				"vite",
				"@xala-technologies/ui-system",
			],
		});

		// Mobile app templates
		templates.set("expo-app", {
			name: "Expo App",
			description: "Cross-platform mobile app with Expo",
			platform: "mobile",
			framework: "expo",
			features: ["iOS/Android", "Expo Router", "TypeScript", "Native Features"],
			dependencies: [
				"expo",
				"react-native",
				"@xala-technologies/ui-system-mobile",
			],
		});

		templates.set("react-native-app", {
			name: "React Native App",
			description: "Native mobile app with React Native",
			platform: "mobile",
			framework: "react-native",
			features: ["iOS/Android", "Navigation", "TypeScript", "Native Modules"],
			dependencies: [
				"react-native",
				"react",
				"@xala-technologies/ui-system-mobile",
			],
		});

		// Desktop app templates
		templates.set("electron-app", {
			name: "Electron App",
			description: "Cross-platform desktop app with Electron",
			platform: "desktop",
			framework: "electron",
			features: [
				"Windows/Mac/Linux",
				"Auto Updates",
				"System Tray",
				"TypeScript",
			],
			dependencies: [
				"electron",
				"react",
				"react-dom",
				"@xala-technologies/ui-system",
			],
		});

		templates.set("tauri-app", {
			name: "Tauri App",
			description: "Lightweight desktop app with Tauri",
			platform: "desktop",
			framework: "tauri",
			features: ["Rust Backend", "Small Bundle", "System APIs", "TypeScript"],
			dependencies: [
				"@tauri-apps/api",
				"react",
				"react-dom",
				"@xala-technologies/ui-system",
			],
		});

		return templates;
	}

	async create(command: CLICommand): Promise<void> {
		const appName = command.target;

		if (!appName) {
			logger.error("App name is required");
			this.showAvailableTemplates();
			return;
		}

		const template = command.options?.template || "nextjs-app";
		const appTemplate = this.appTemplates.get(template);

		if (!appTemplate) {
			logger.error(`Template "${template}" not found`);
			this.showAvailableTemplates();
			return;
		}

		logger.info(`📱 Creating ${appTemplate.name}: ${chalk.green(appName)}`);

		// Check if we're in a monorepo
		const isMonorepo = await this.isMonorepo();
		const appsDir = isMonorepo ? "./apps" : "./";
		const appPath = path.join(appsDir, appName);

		try {
			// Create app directory
			await fs.mkdir(appPath, { recursive: true });

			// Generate app structure
			await this.generateAppStructure(appPath, appName, appTemplate);

			logger.success(`✅ App created successfully at: ${chalk.cyan(appPath)}`);
			logger.info(`   Platform: ${appTemplate.platform}`);
			logger.info(`   Framework: ${appTemplate.framework}`);
			logger.info(`   Features: ${appTemplate.features.join(", ")}`);

			if (appTemplate.dependencies.length > 0) {
				logger.info(`\n   Install dependencies:`);
				logger.info(`   ${chalk.cyan(`cd ${appPath} && bun install`)}`);
			}
		} catch (error) {
			logger.error("Failed to create app:", error);
		}
	}

	async list(command: CLICommand): Promise<void> {
		const isMonorepo = await this.isMonorepo();

		if (!isMonorepo) {
			logger.warn("Not in a monorepo structure");
			return;
		}

		try {
			const appsDir = "./apps";
			const apps = await fs.readdir(appsDir);

			logger.info(chalk.cyan("\n📱 Monorepo Apps:\n"));

			for (const app of apps) {
				const appPath = path.join(appsDir, app);
				const stat = await fs.stat(appPath);

				if (stat.isDirectory()) {
					// Try to read package.json
					try {
						const packageJsonPath = path.join(appPath, "package.json");
						const packageJson = JSON.parse(
							await fs.readFile(packageJsonPath, "utf-8"),
						);

						logger.info(`  • ${chalk.green(app)}`);
						logger.info(
							`    ${chalk.gray(packageJson.description || "No description")}`,
						);
						logger.info(
							`    Version: ${chalk.cyan(packageJson.version || "0.0.0")}`,
						);

						if (packageJson.scripts) {
							const scripts = Object.keys(packageJson.scripts);
							if (scripts.length > 0) {
								logger.info(
									`    Scripts: ${chalk.yellow(scripts.slice(0, 3).join(", "))}${scripts.length > 3 ? "..." : ""}`,
								);
							}
						}
						logger.info("");
					} catch (error) {
						logger.info(
							`  • ${chalk.green(app)} ${chalk.gray("(no package.json)")}`,
						);
					}
				}
			}
		} catch (error) {
			logger.error("Failed to list apps:", error);
		}
	}

	async add(command: CLICommand): Promise<void> {
		const appName = command.target;

		if (!appName) {
			logger.error("App name is required");
			return;
		}

		const isMonorepo = await this.isMonorepo();

		if (!isMonorepo) {
			logger.warn(
				'Not in a monorepo structure. Use "xaheen app create" instead.',
			);
			return;
		}

		// Delegate to create with monorepo context
		await this.create(command);
	}

	private async generateAppStructure(
		appPath: string,
		appName: string,
		template: AppTemplate,
	): Promise<void> {
		// Create package.json
		const packageJson = {
			name: `@monorepo/${appName}`,
			version: "0.1.0",
			private: true,
			description: template.description,
			scripts: this.getScriptsForFramework(template.framework),
			dependencies: this.getDependenciesForTemplate(template),
			devDependencies: this.getDevDependenciesForTemplate(template),
		};

		await fs.writeFile(
			path.join(appPath, "package.json"),
			JSON.stringify(packageJson, null, 2),
		);

		// Create basic structure based on framework
		await this.createFrameworkStructure(appPath, appName, template);
	}

	private getScriptsForFramework(framework: string): Record<string, string> {
		switch (framework) {
			case "nextjs":
				return {
					dev: "next dev",
					build: "next build",
					start: "next start",
					lint: "next lint",
				};
			case "vite":
				return {
					dev: "vite",
					build: "vite build",
					preview: "vite preview",
				};
			case "expo":
				return {
					start: "expo start",
					android: "expo start --android",
					ios: "expo start --ios",
					web: "expo start --web",
				};
			default:
				return {
					dev: 'echo "Configure dev script"',
					build: 'echo "Configure build script"',
				};
		}
	}

	private getDependenciesForTemplate(
		template: AppTemplate,
	): Record<string, string> {
		const deps: Record<string, string> = {};

		template.dependencies.forEach((dep) => {
			// Use latest versions
			deps[dep] = "latest";
		});

		return deps;
	}

	private getDevDependenciesForTemplate(
		template: AppTemplate,
	): Record<string, string> {
		const devDeps: Record<string, string> = {
			typescript: "^5.0.0",
			"@types/node": "^20.0.0",
		};

		if (template.framework === "nextjs" || template.framework === "vite") {
			devDeps["@types/react"] = "^18.0.0";
			devDeps["@types/react-dom"] = "^18.0.0";
		}

		return devDeps;
	}

	private async createFrameworkStructure(
		appPath: string,
		appName: string,
		template: AppTemplate,
	): Promise<void> {
		// Create src directory
		const srcPath = path.join(appPath, "src");
		await fs.mkdir(srcPath, { recursive: true });

		// Create main entry file based on framework
		if (template.framework === "nextjs") {
			// Create app directory for Next.js 14
			const appDir = path.join(srcPath, "app");
			await fs.mkdir(appDir, { recursive: true });

			// Create layout.tsx
			await fs.writeFile(
				path.join(appDir, "layout.tsx"),
				this.generateNextJsLayout(appName),
			);

			// Create page.tsx
			await fs.writeFile(
				path.join(appDir, "page.tsx"),
				this.generateNextJsPage(appName),
			);
		} else if (template.framework === "vite") {
			// Create main.tsx for Vite
			await fs.writeFile(
				path.join(srcPath, "main.tsx"),
				this.generateViteMain(appName),
			);

			// Create App.tsx
			await fs.writeFile(
				path.join(srcPath, "App.tsx"),
				this.generateViteApp(appName),
			);
		}

		// Create README
		await fs.writeFile(
			path.join(appPath, "README.md"),
			this.generateReadme(appName, template),
		);
	}

	private generateNextJsLayout(appName: string): string {
		return `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '${appName}',
  description: 'Created with Xaheen Unified CLI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}`;
	}

	private generateNextJsPage(appName: string): string {
		return `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">${appName}</h1>
      <p className="mt-4 text-lg text-gray-600">
        Created with Xaheen Unified CLI
      </p>
    </main>
  );
}`;
	}

	private generateViteMain(appName: string): string {
		return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`;
	}

	private generateViteApp(appName: string): string {
		return `function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">${appName}</h1>
        <p className="mt-4 text-lg text-gray-600">
          Created with Xaheen Unified CLI
        </p>
      </div>
    </div>
  );
}

export default App;`;
	}

	private generateReadme(appName: string, template: AppTemplate): string {
		return `# ${appName}

${template.description}

## Features

${template.features.map((f) => `- ${f}`).join("\n")}

## Getting Started

\`\`\`bash
# Install dependencies
bun install

# Start development server
bun run dev
\`\`\`

## Built With

- ${template.framework}
- @xala-technologies/ui-system
- TypeScript

---

Created with [Xaheen Unified CLI](https://github.com/xala-technologies/xaheen)`;
	}

	private async isMonorepo(): Promise<boolean> {
		try {
			await fs.access("./apps");
			await fs.access("./packages");
			return true;
		} catch {
			return false;
		}
	}

	private showAvailableTemplates(): void {
		logger.info("\nAvailable app templates:");

		const templatesByPlatform = new Map<string, AppTemplate[]>();

		this.appTemplates.forEach((template, key) => {
			const templates = templatesByPlatform.get(template.platform) || [];
			templates.push({ ...template, key });
			templatesByPlatform.set(template.platform, templates);
		});

		templatesByPlatform.forEach((templates, platform) => {
			logger.info(`\n  ${chalk.yellow(platform.toUpperCase())}:`);
			templates.forEach((template: any) => {
				logger.info(
					`    • ${chalk.green(template.key)}: ${template.description}`,
				);
			});
		});
	}
}
