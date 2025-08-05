/**
 * Project Initializer - Creates new projects using create-next-app and scaffolds with Xala UI System
 * Replaces the large create_project tool with a more efficient implementation
 */

import { execSync, spawn } from "child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join, resolve } from "path";

export interface ProjectConfig {
	readonly name: string;
	readonly platform: "react" | "vue" | "angular" | "svelte" | "nextjs" | "electron" | "react-native";
	readonly type: string;
	readonly features: string[];
	readonly templateStyle: "minimal" | "standard" | "enterprise";
}

export interface ProjectResult {
	readonly success: boolean;
	readonly projectName: string;
	readonly platform: string;
	readonly type: string;
	readonly features: string[];
	readonly templateStyle: string;
	readonly files: string[];
	readonly setupInstructions: string[];
	readonly nextSteps: string[];
	readonly error?: string;
}

export class ProjectInitializer {
	private readonly supportedPlatforms = ["nextjs", "react", "vue", "angular", "svelte"];
	
	/**
	 * Create a new project using appropriate CLI tools and scaffold with Xala UI System
	 */
	async createProject(config: ProjectConfig): Promise<ProjectResult> {
		try {
			// Validate platform
			if (!this.supportedPlatforms.includes(config.platform)) {
				throw new Error(`Unsupported platform: ${config.platform}. Supported: ${this.supportedPlatforms.join(", ")}`);
			}

			// Create project using appropriate CLI
			const createResult = await this.createBaseProject(config);
			if (!createResult.success) {
				throw new Error(createResult.error || "Failed to create base project");
			}

			// Initialize Xala UI System
			const initResult = await this.initializeXalaUISystem(config);
			if (!initResult.success) {
				throw new Error(initResult.error || "Failed to initialize Xala UI System");
			}

			// Add requested features
			const featuresResult = await this.addFeatures(config);
			if (!featuresResult.success) {
				throw new Error(featuresResult.error || "Failed to add features");
			}

			return {
				success: true,
				projectName: config.name,
				platform: config.platform,
				type: config.type,
				features: config.features,
				templateStyle: config.templateStyle,
				files: [
					...createResult.files,
					...initResult.files,
					...featuresResult.files
				],
				setupInstructions: [
					`cd ${config.name}`,
					"npm install",
					"npm run dev"
				],
				nextSteps: [
					"🎉 Project created successfully!",
					`📁 Navigate to your project: cd ${config.name}`,
					"🚀 Start development server: npm run dev",
					"📖 Check the README.md for detailed setup instructions",
					"🎨 Explore the Xala UI System components in src/components/ui",
					"⚙️ Configure your project settings in next.config.js"
				]
			};

		} catch (error) {
			return {
				success: false,
				projectName: config.name,
				platform: config.platform,
				type: config.type,
				features: config.features,
				templateStyle: config.templateStyle,
				files: [],
				setupInstructions: [],
				nextSteps: [],
				error: error instanceof Error ? error.message : String(error)
			};
		}
	}

	/**
	 * Create base project using appropriate CLI tool
	 */
	private async createBaseProject(config: ProjectConfig): Promise<{ success: boolean; files: string[]; error?: string }> {
		try {
			const projectPath = resolve(process.cwd(), config.name);
			
			// Check if directory already exists
			if (existsSync(projectPath)) {
				throw new Error(`Directory ${config.name} already exists`);
			}

			let command: string;
			let files: string[] = [];

			switch (config.platform) {
				case "nextjs":
					command = `npx create-next-app@latest ${config.name} --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`;
					files = [
						"package.json",
						"next.config.js",
						"tailwind.config.ts",
						"tsconfig.json",
						"src/app/layout.tsx",
						"src/app/page.tsx",
						"src/app/globals.css"
					];
					break;

				case "react":
					command = `npx create-react-app ${config.name} --template typescript`;
					files = [
						"package.json",
						"tsconfig.json",
						"src/App.tsx",
						"src/index.tsx",
						"src/App.css"
					];
					break;

				case "vue":
					command = `npm create vue@latest ${config.name} -- --typescript --router --pinia --vitest --eslint --prettier`;
					files = [
						"package.json",
						"tsconfig.json",
						"src/App.vue",
						"src/main.ts"
					];
					break;

				case "angular":
					command = `npx @angular/cli@latest new ${config.name} --routing --style=scss --skip-git`;
					files = [
						"package.json",
						"angular.json",
						"tsconfig.json",
						"src/app/app.component.ts"
					];
					break;

				case "svelte":
					command = `npm create svelte@latest ${config.name}`;
					files = [
						"package.json",
						"svelte.config.js",
						"tsconfig.json",
						"src/app.html"
					];
					break;

				default:
					throw new Error(`Unsupported platform: ${config.platform}`);
			}

			// Execute the create command
			console.log(`Creating ${config.platform} project: ${command}`);
			execSync(command, { stdio: 'inherit', cwd: process.cwd() });

			return {
				success: true,
				files
			};

		} catch (error) {
			return {
				success: false,
				files: [],
				error: error instanceof Error ? error.message : String(error)
			};
		}
	}

	/**
	 * Initialize Xala UI System in the project
	 */
	private async initializeXalaUISystem(config: ProjectConfig): Promise<{ success: boolean; files: string[]; error?: string }> {
		try {
			const projectPath = resolve(process.cwd(), config.name);
			
			// Install Xala UI System
			console.log("Installing Xala UI System...");
			execSync("npm install @xala-technologies/ui-system", { 
				stdio: 'inherit', 
				cwd: projectPath 
			});

			const files: string[] = [];

			// Create UI System provider based on platform
			if (config.platform === "nextjs") {
				await this.createNextJSProvider(projectPath);
				files.push("src/components/providers/UISystemProvider.tsx");
				files.push("src/app/layout.tsx"); // Modified
			} else if (config.platform === "react") {
				await this.createReactProvider(projectPath);
				files.push("src/components/providers/UISystemProvider.tsx");
				files.push("src/App.tsx"); // Modified
			}

			// Create basic UI components directory
			const uiDir = join(projectPath, "src", "components", "ui");
			if (!existsSync(uiDir)) {
				mkdirSync(uiDir, { recursive: true });
			}

			// Create example component
			await this.createExampleComponent(projectPath, config.platform);
			files.push("src/components/ui/Button.tsx");

			return {
				success: true,
				files
			};

		} catch (error) {
			return {
				success: false,
				files: [],
				error: error instanceof Error ? error.message : String(error)
			};
		}
	}

	/**
	 * Add requested features to the project
	 */
	private async addFeatures(config: ProjectConfig): Promise<{ success: boolean; files: string[]; error?: string }> {
		try {
			const projectPath = resolve(process.cwd(), config.name);
			const files: string[] = [];

			for (const feature of config.features) {
				switch (feature.toLowerCase()) {
					case "auth":
						await this.addAuthFeature(projectPath, config.platform);
						files.push("src/components/auth/AuthProvider.tsx");
						files.push("src/pages/login.tsx");
						break;

					case "database":
						await this.addDatabaseFeature(projectPath, config.platform);
						files.push("prisma/schema.prisma");
						files.push("src/lib/db.ts");
						break;

					case "ai-assistant":
						await this.addAIAssistantFeature(projectPath, config.platform);
						files.push("src/components/ai/AIAssistant.tsx");
						files.push("src/lib/ai.ts");
						break;

					case "i18n":
						await this.addI18nFeature(projectPath, config.platform);
						files.push("src/lib/i18n.ts");
						files.push("locales/en.json");
						break;
				}
			}

			return {
				success: true,
				files
			};

		} catch (error) {
			return {
				success: false,
				files: [],
				error: error instanceof Error ? error.message : String(error)
			};
		}
	}

	/**
	 * Create Next.js UI System provider
	 */
	private async createNextJSProvider(projectPath: string): Promise<void> {
		const providersDir = join(projectPath, "src", "components", "providers");
		if (!existsSync(providersDir)) {
			mkdirSync(providersDir, { recursive: true });
		}

		const providerContent = `'use client';

import React from 'react';
import { XalaUISystemProvider } from '@xala-technologies/ui-system';

interface UISystemProviderProps {
	children: React.ReactNode;
}

export function UISystemProvider({ children }: UISystemProviderProps): React.JSX.Element {
	return (
		<XalaUISystemProvider>
			{children}
		</XalaUISystemProvider>
	);
}
`;

		writeFileSync(join(providersDir, "UISystemProvider.tsx"), providerContent);

		// Update layout.tsx to include the provider
		const layoutPath = join(projectPath, "src", "app", "layout.tsx");
		if (existsSync(layoutPath)) {
			const layoutContent = readFileSync(layoutPath, 'utf-8');
			const updatedLayout = layoutContent.replace(
				'<body className={inter.className}>',
				`<body className={inter.className}>
        <UISystemProvider>`
			).replace(
				'{children}\n      </body>',
				`{children}
        </UISystemProvider>
      </body>`
			).replace(
				'import { Inter } from \'next/font/google\'',
				`import { Inter } from 'next/font/google'
import { UISystemProvider } from '@/components/providers/UISystemProvider'`
			);
			writeFileSync(layoutPath, updatedLayout);
		}
	}

	/**
	 * Create React UI System provider
	 */
	private async createReactProvider(projectPath: string): Promise<void> {
		const providersDir = join(projectPath, "src", "components", "providers");
		if (!existsSync(providersDir)) {
			mkdirSync(providersDir, { recursive: true });
		}

		const providerContent = `import React from 'react';
import { XalaUISystemProvider } from '@xala-technologies/ui-system';

interface UISystemProviderProps {
	children: React.ReactNode;
}

export function UISystemProvider({ children }: UISystemProviderProps): React.JSX.Element {
	return (
		<XalaUISystemProvider>
			{children}
		</XalaUISystemProvider>
	);
}
`;

		writeFileSync(join(providersDir, "UISystemProvider.tsx"), providerContent);
	}

	/**
	 * Create example UI component
	 */
	private async createExampleComponent(projectPath: string, platform: string): Promise<void> {
		const buttonContent = `import React from 'react';
import { Button as XalaButton } from '@xala-technologies/ui-system';

interface ButtonProps {
	children: React.ReactNode;
	variant?: 'primary' | 'secondary' | 'outline';
	size?: 'sm' | 'md' | 'lg';
	onClick?: () => void;
}

export function Button({ 
	children, 
	variant = 'primary', 
	size = 'md', 
	onClick 
}: ButtonProps): React.JSX.Element {
	return (
		<XalaButton 
			variant={variant} 
			size={size} 
			onClick={onClick}
		>
			{children}
		</XalaButton>
	);
}
`;

		writeFileSync(join(projectPath, "src", "components", "ui", "Button.tsx"), buttonContent);
	}

	/**
	 * Add authentication feature
	 */
	private async addAuthFeature(projectPath: string, platform: string): Promise<void> {
		// Install auth dependencies
		execSync("npm install next-auth @auth/prisma-adapter", { 
			stdio: 'inherit', 
			cwd: projectPath 
		});

		// Create auth provider
		const authDir = join(projectPath, "src", "components", "auth");
		if (!existsSync(authDir)) {
			mkdirSync(authDir, { recursive: true });
		}

		const authProviderContent = `'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';

interface AuthProviderProps {
	children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
	return (
		<SessionProvider>
			{children}
		</SessionProvider>
	);
}
`;

		writeFileSync(join(authDir, "AuthProvider.tsx"), authProviderContent);
	}

	/**
	 * Add database feature
	 */
	private async addDatabaseFeature(projectPath: string, platform: string): Promise<void> {
		// Install Prisma
		execSync("npm install prisma @prisma/client", { 
			stdio: 'inherit', 
			cwd: projectPath 
		});

		// Initialize Prisma
		execSync("npx prisma init", { 
			stdio: 'inherit', 
			cwd: projectPath 
		});

		// Create database utility
		const libDir = join(projectPath, "src", "lib");
		if (!existsSync(libDir)) {
			mkdirSync(libDir, { recursive: true });
		}

		const dbContent = `import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
`;

		writeFileSync(join(libDir, "db.ts"), dbContent);
	}

	/**
	 * Add AI assistant feature
	 */
	private async addAIAssistantFeature(projectPath: string, platform: string): Promise<void> {
		// Install AI dependencies
		execSync("npm install openai", { 
			stdio: 'inherit', 
			cwd: projectPath 
		});

		// Create AI assistant component
		const aiDir = join(projectPath, "src", "components", "ai");
		if (!existsSync(aiDir)) {
			mkdirSync(aiDir, { recursive: true });
		}

		const aiAssistantContent = `'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';

export function AIAssistant(): React.JSX.Element {
	const [message, setMessage] = useState('');
	const [response, setResponse] = useState('');

	const handleSubmit = async () => {
		// AI integration logic here
		setResponse('AI response would appear here');
	};

	return (
		<div className="p-4 border rounded-lg">
			<h3 className="text-lg font-semibold mb-4">AI Assistant</h3>
			<textarea
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				placeholder="Ask me anything..."
				className="w-full p-2 border rounded mb-4"
				rows={3}
			/>
			<Button onClick={handleSubmit}>
				Send Message
			</Button>
			{response && (
				<div className="mt-4 p-3 bg-gray-100 rounded">
					{response}
				</div>
			)}
		</div>
	);
}
`;

		writeFileSync(join(aiDir, "AIAssistant.tsx"), aiAssistantContent);
	}

	/**
	 * Add internationalization feature
	 */
	private async addI18nFeature(projectPath: string, platform: string): Promise<void> {
		// Install i18n dependencies
		execSync("npm install next-i18next react-i18next i18next", { 
			stdio: 'inherit', 
			cwd: projectPath 
		});

		// Create locales directory
		const localesDir = join(projectPath, "locales");
		if (!existsSync(localesDir)) {
			mkdirSync(localesDir, { recursive: true });
		}

		// Create English locale file
		const enLocale = {
			common: {
				welcome: "Welcome",
				loading: "Loading...",
				error: "An error occurred"
			}
		};

		writeFileSync(join(localesDir, "en.json"), JSON.stringify(enLocale, null, 2));
	}
}
