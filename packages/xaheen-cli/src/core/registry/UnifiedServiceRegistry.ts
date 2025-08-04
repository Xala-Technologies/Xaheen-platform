import * as fs from "fs-extra";
import { glob } from "glob";
import * as path from "path";
import type {
	AppTemplate,
	ComponentTemplate,
	MonorepoStructure,
	MonorepoTarget,
	PlatformType,
	ServiceTemplate,
	TemplateFile,
} from "../../types/index.js";
import { logger } from "../../utils/logger.js";

export interface RegistryConfig {
	xaheenTemplatesPath?: string;
	xalaTemplatesPath?: string;
	customTemplatesPath?: string;
	monorepoStructure?: "apps-packages" | "workspaces" | "nx";
}

export class UnifiedServiceRegistry {
	private serviceTemplates: Map<string, ServiceTemplate> = new Map();
	private componentTemplates: Map<string, ComponentTemplate> = new Map();
	private appTemplates: Map<string, AppTemplate> = new Map();
	private config: RegistryConfig;
	private initialized = false;

	constructor(config: RegistryConfig = {}) {
		this.config = {
			xaheenTemplatesPath:
				config.xaheenTemplatesPath || "../xaheen-cli/src/templates",
			xalaTemplatesPath: config.xalaTemplatesPath || "../xala-cli/templates",
			customTemplatesPath: config.customTemplatesPath || "./templates",
			monorepoStructure: config.monorepoStructure || "apps-packages",
			...config,
		};
	}

	public async initialize(): Promise<void> {
		if (this.initialized) return;

		logger.info("Initializing Unified Service Registry...");

		try {
			// Load service templates from xaheen-cli
			await this.loadXaheenServiceTemplates();

			// Load component templates from xala-cli
			await this.loadXalaComponentTemplates();

			// Load monorepo app templates
			await this.loadMonorepoAppTemplates();

			// Load custom templates
			await this.loadCustomTemplates();

			this.initialized = true;
			logger.success(
				`Registry initialized with ${this.serviceTemplates.size} service templates, ${this.componentTemplates.size} component templates, and ${this.appTemplates.size} app templates`,
			);
		} catch (error) {
			logger.error("Failed to initialize registry:", error);
			throw error;
		}
	}

	private async loadXaheenServiceTemplates(): Promise<void> {
		const templatesPath = this.resolveTemplatePath(
			this.config.xaheenTemplatesPath!,
		);

		if (!(await fs.pathExists(templatesPath))) {
			logger.warn(`Xaheen templates path not found: ${templatesPath}`);
			return;
		}

		// Load service templates from xaheen-cli structure
		const serviceCategories = await this.getDirectories(templatesPath);

		for (const category of serviceCategories) {
			await this.loadServiceCategory(templatesPath, category);
		}
	}

	private async loadServiceCategory(
		basePath: string,
		category: string,
	): Promise<void> {
		const categoryPath = path.join(basePath, category);

		if (!(await fs.pathExists(categoryPath))) return;

		try {
			// Check if there's a template definition file
			const definitionPath = path.join(categoryPath, "template.json");
			let templateDef: any = {};

			if (await fs.pathExists(definitionPath)) {
				templateDef = await fs.readJson(definitionPath);
			}

			// Load template files
			const files = await this.loadTemplateFiles(categoryPath);

			// Create service template
			const serviceTemplate: ServiceTemplate = {
				id: `${category}`,
				name: templateDef.name || this.formatName(category),
				description:
					templateDef.description ||
					`${this.formatName(category)} service template`,
				category: templateDef.category || "service",
				provider: templateDef.provider || "default",
				version: templateDef.version || "1.0.0",
				dependencies: templateDef.dependencies || [],
				files,
				config: templateDef.config || {},
			};

			this.serviceTemplates.set(serviceTemplate.id, serviceTemplate);
			logger.debug(`Loaded service template: ${serviceTemplate.name}`);
		} catch (error) {
			logger.warn(
				`Failed to load service template from ${categoryPath}:`,
				error,
			);
		}
	}

	private async loadXalaComponentTemplates(): Promise<void> {
		const templatesPath = this.resolveTemplatePath(
			this.config.xalaTemplatesPath!,
		);

		if (!(await fs.pathExists(templatesPath))) {
			logger.warn(`Xala templates path not found: ${templatesPath}`);
			return;
		}

		// Load component templates from xala-cli structure
		const platforms = await this.getDirectories(templatesPath);

		for (const platform of platforms) {
			if (platform === "configs") continue; // Skip config directory
			await this.loadComponentPlatform(templatesPath, platform);
		}
	}

	private async loadComponentPlatform(
		basePath: string,
		platform: string,
	): Promise<void> {
		const platformPath = path.join(basePath, platform, "components");

		if (!(await fs.pathExists(platformPath))) return;

		const components = await fs.readdir(platformPath);

		for (const componentFile of components) {
			if (!componentFile.endsWith(".hbs")) continue;

			await this.loadComponentTemplate(platformPath, platform, componentFile);
		}
	}

	private async loadComponentTemplate(
		basePath: string,
		platform: string,
		componentFile: string,
	): Promise<void> {
		const componentPath = path.join(basePath, componentFile);
		const componentName = path.basename(componentFile, ".hbs");

		try {
			const content = await fs.readFile(componentPath, "utf-8");

			// Parse component metadata from template comments
			const metadata = this.parseComponentMetadata(content);

			const componentTemplate: ComponentTemplate = {
				id: `${platform}-${componentName}`,
				name: metadata.name || this.formatName(componentName),
				description:
					metadata.description ||
					`${this.formatName(componentName)} component for ${platform}`,
				platform,
				category: metadata.category || "ui",
				props: metadata.props || [],
				files: [
					{
						path: `${componentName}.${this.getFileExtension(platform)}`,
						content,
						isTemplate: true,
					},
				],
				examples: metadata.examples || [],
			};

			this.componentTemplates.set(componentTemplate.id, componentTemplate);
			logger.debug(
				`Loaded component template: ${componentTemplate.name} (${platform})`,
			);
		} catch (error) {
			logger.warn(
				`Failed to load component template from ${componentPath}:`,
				error,
			);
		}
	}

	private async loadCustomTemplates(): Promise<void> {
		const templatesPath = this.resolveTemplatePath(
			this.config.customTemplatesPath!,
		);

		if (!(await fs.pathExists(templatesPath))) return;

		// Load any custom templates following the same structure
		logger.debug(`Loading custom templates from: ${templatesPath}`);
		// Implementation would be similar to above but for custom templates
	}

	private async loadTemplateFiles(
		templatePath: string,
	): Promise<TemplateFile[]> {
		const files: TemplateFile[] = [];

		// Look for template files in standard locations
		const patterns = ["files/**/*", "components/**/*", "configs/**/*"];

		for (const pattern of patterns) {
			const matchedFiles = await glob(pattern, { cwd: templatePath });

			for (const file of matchedFiles) {
				const filePath = path.join(templatePath, file);
				const stat = await fs.stat(filePath);

				if (stat.isFile()) {
					const content = await fs.readFile(filePath, "utf-8");
					const isTemplate = file.endsWith(".hbs") || content.includes("{{");

					files.push({
						path: file.replace(/\.hbs$/, ""),
						content,
						isTemplate,
					});
				}
			}
		}

		return files;
	}

	private async getDirectories(dirPath: string): Promise<string[]> {
		if (!(await fs.pathExists(dirPath))) return [];

		const items = await fs.readdir(dirPath, { withFileTypes: true });
		return items.filter((item) => item.isDirectory()).map((item) => item.name);
	}

	private resolveTemplatePath(templatePath: string): string {
		if (path.isAbsolute(templatePath)) {
			return templatePath;
		}

		// Resolve relative to the current package directory
		return path.resolve(__dirname, "../../..", templatePath);
	}

	private formatName(kebabCase: string): string {
		return kebabCase
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	}

	private async loadMonorepoAppTemplates(): Promise<void> {
		logger.debug("Loading monorepo app templates...");

		// Define predefined app templates for monorepo structure
		const appTemplates: AppTemplate[] = [
			// Web Applications
			{
				id: "web-nextjs",
				name: "Next.js Web App",
				description: "Next.js 14+ web application with App Router",
				platform: "web",
				framework: "nextjs",
				targetPath: "apps",
				dependencies: [
					"next",
					"react",
					"react-dom",
					"@xala-technologies/ui-system",
				],
				files: this.getNextJSAppFiles(),
				config: {
					port: 3000,
					typescript: true,
					tailwind: true,
					appRouter: true,
				},
			},
			{
				id: "web-vite-react",
				name: "Vite React App",
				description: "Vite-powered React application",
				platform: "web",
				framework: "react",
				targetPath: "apps",
				dependencies: [
					"vite",
					"react",
					"react-dom",
					"@xala-technologies/ui-system",
				],
				files: this.getViteReactAppFiles(),
				config: {
					port: 3001,
					typescript: true,
					tailwind: true,
				},
			},
			// Desktop Applications
			{
				id: "desktop-electron",
				name: "Electron Desktop App",
				description: "Cross-platform desktop application with Electron",
				platform: "desktop",
				framework: "electron",
				targetPath: "apps",
				dependencies: [
					"electron",
					"react",
					"react-dom",
					"@xala-technologies/ui-system",
				],
				files: this.getElectronAppFiles(),
				config: {
					mainWindow: { width: 1200, height: 800 },
					typescript: true,
				},
			},
			{
				id: "desktop-tauri",
				name: "Tauri Desktop App",
				description: "Lightweight desktop application with Tauri",
				platform: "desktop",
				framework: "tauri",
				targetPath: "apps",
				dependencies: [
					"@tauri-apps/api",
					"react",
					"react-dom",
					"@xala-technologies/ui-system",
				],
				files: this.getTauriAppFiles(),
				config: {
					bundle: { active: true },
					typescript: true,
				},
			},
			// Mobile Applications
			{
				id: "mobile-react-native",
				name: "React Native Mobile App",
				description: "Cross-platform mobile application",
				platform: "mobile",
				framework: "react-native",
				targetPath: "apps",
				dependencies: ["react-native", "react", "@xala-technologies/ui-system"],
				files: this.getReactNativeAppFiles(),
				config: {
					ios: true,
					android: true,
					typescript: true,
				},
			},
			{
				id: "mobile-expo",
				name: "Expo Mobile App",
				description: "Expo-managed React Native application",
				platform: "mobile",
				framework: "expo",
				targetPath: "apps",
				dependencies: [
					"expo",
					"react-native",
					"react",
					"@xala-technologies/ui-system",
				],
				files: this.getExpoAppFiles(),
				config: {
					expo: "~50.0.0",
					typescript: true,
				},
			},
			// Server Applications
			{
				id: "server-nestjs",
				name: "NestJS API Server",
				description: "Scalable Node.js server built with NestJS",
				platform: "server",
				framework: "nestjs",
				targetPath: "apps",
				dependencies: [
					"@nestjs/core",
					"@nestjs/common",
					"@nestjs/platform-express",
				],
				files: this.getNestJSAppFiles(),
				config: {
					port: 3001,
					cors: true,
					typescript: true,
				},
			},
			{
				id: "server-fastify",
				name: "Fastify API Server",
				description: "High-performance Node.js server with Fastify",
				platform: "server",
				framework: "fastify",
				targetPath: "apps",
				dependencies: ["fastify", "@fastify/cors", "@fastify/helmet"],
				files: this.getFastifyAppFiles(),
				config: {
					port: 3002,
					typescript: true,
				},
			},
		];

		// Register all app templates
		appTemplates.forEach((template) => {
			this.appTemplates.set(template.id, template);
			logger.debug(
				`Loaded app template: ${template.name} (${template.platform})`,
			);
		});
	}

	private getFileExtension(platform: string): string {
		const extensions: Record<string, string> = {
			react: "tsx",
			"react-native": "tsx",
			vue: "vue",
			angular: "ts",
			svelte: "svelte",
			flutter: "dart",
			nextjs: "tsx",
			electron: "tsx",
			tauri: "tsx",
			expo: "tsx",
		};

		return extensions[platform] || "tsx";
	}

	private getPlatformFromFramework(framework: string): PlatformType {
		const platformMap: Record<string, PlatformType> = {
			nextjs: "web",
			react: "web",
			vue: "web",
			angular: "web",
			svelte: "web",
			"react-native": "mobile",
			expo: "mobile",
			flutter: "mobile",
			electron: "desktop",
			tauri: "desktop",
			nestjs: "server",
			express: "server",
			fastify: "server",
			"shared-library": "shared",
		};

		return platformMap[framework] || "web";
	}

	private parseComponentMetadata(content: string): any {
		// Simple metadata parser for template comments
		const metadata: any = {
			props: [],
		};

		const lines = content.split("\n");
		let inMetadata = false;

		for (const line of lines) {
			const trimmed = line.trim();

			if (trimmed.startsWith("{{!-- @meta")) {
				inMetadata = true;
				continue;
			}

			if (trimmed === "--}}" && inMetadata) {
				inMetadata = false;
				continue;
			}

			if (inMetadata) {
				if (trimmed.startsWith("@name")) {
					metadata.name = trimmed.replace("@name", "").trim();
				} else if (trimmed.startsWith("@description")) {
					metadata.description = trimmed.replace("@description", "").trim();
				} else if (trimmed.startsWith("@category")) {
					metadata.category = trimmed.replace("@category", "").trim();
				} else if (trimmed.startsWith("@prop")) {
					// Parse prop definition: @prop {string} name - description
					const propMatch = trimmed.match(
						/@prop\s+\{(\w+)\}\s+(\w+)\s*-?\s*(.*)/,
					);
					if (propMatch) {
						metadata.props.push({
							name: propMatch[2],
							type: propMatch[1],
							required: !trimmed.includes("?"),
							description: propMatch[3] || "",
						});
					}
				}
			}
		}

		return metadata;
	}

	// File template methods for different app types
	private getNextJSAppFiles(): TemplateFile[] {
		return [
			{
				path: "package.json",
				content: JSON.stringify(
					{
						name: "{{appName}}",
						version: "0.1.0",
						private: true,
						scripts: {
							dev: "next dev --port {{port}}",
							build: "next build",
							start: "next start",
							lint: "next lint",
						},
						dependencies: {
							next: "14.2.0",
							react: "^18.3.0",
							"react-dom": "^18.3.0",
							"@xala-technologies/ui-system": "^6.1.0",
						},
						devDependencies: {
							"@types/node": "^20",
							"@types/react": "^18",
							"@types/react-dom": "^18",
							typescript: "^5",
						},
					},
					null,
					2,
				),
				isTemplate: true,
			},
			{
				path: "next.config.mjs",
				content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: ['@xala-technologies/ui-system'],
};

export default nextConfig;`,
				isTemplate: false,
			},
			{
				path: "src/app/layout.tsx",
				content: `import { UISystemProvider } from '@xala-technologies/ui-system';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <UISystemProvider>
          {children}
        </UISystemProvider>
      </body>
    </html>
  );
}`,
				isTemplate: false,
			},
			{
				path: "src/app/page.tsx",
				content: `import { Button, Card } from '@xala-technologies/ui-system';

export default function Home() {
  return (
    <main className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Welcome to {{appName}}</h1>
        <p className="text-muted-foreground mb-6">
          Your Next.js application is ready to go!
        </p>
        <Button>Get Started</Button>
      </Card>
    </main>
  );
}`,
				isTemplate: true,
			},
		];
	}

	private getViteReactAppFiles(): TemplateFile[] {
		return [
			{
				path: "package.json",
				content: JSON.stringify(
					{
						name: "{{appName}}",
						private: true,
						version: "0.0.0",
						type: "module",
						scripts: {
							dev: "vite --port {{port}}",
							build: "tsc && vite build",
							preview: "vite preview",
						},
						dependencies: {
							react: "^18.3.0",
							"react-dom": "^18.3.0",
							"@xala-technologies/ui-system": "^6.1.0",
						},
						devDependencies: {
							"@types/react": "^18.3.0",
							"@types/react-dom": "^18.3.0",
							"@vitejs/plugin-react": "^4.3.0",
							typescript: "^5.2.2",
							vite: "^5.3.0",
						},
					},
					null,
					2,
				),
				isTemplate: true,
			},
		];
	}

	private getElectronAppFiles(): TemplateFile[] {
		return [
			{
				path: "package.json",
				content: JSON.stringify(
					{
						name: "{{appName}}",
						version: "1.0.0",
						main: "dist/main.js",
						scripts: {
							dev: "electron .",
							build: "tsc && electron-builder",
							start: "electron .",
						},
						dependencies: {
							electron: "^30.0.0",
							react: "^18.3.0",
							"react-dom": "^18.3.0",
							"@xala-technologies/ui-system": "^6.1.0",
						},
					},
					null,
					2,
				),
				isTemplate: true,
			},
		];
	}

	private getTauriAppFiles(): TemplateFile[] {
		return [];
	}
	private getReactNativeAppFiles(): TemplateFile[] {
		return [];
	}
	private getExpoAppFiles(): TemplateFile[] {
		return [];
	}
	private getNestJSAppFiles(): TemplateFile[] {
		return [];
	}
	private getFastifyAppFiles(): TemplateFile[] {
		return [];
	}

	// Public API methods
	public getServiceTemplate(id: string): ServiceTemplate | undefined {
		return this.serviceTemplates.get(id);
	}

	public getComponentTemplate(id: string): ComponentTemplate | undefined {
		return this.componentTemplates.get(id);
	}

	public getAppTemplate(id: string): AppTemplate | undefined {
		return this.appTemplates.get(id);
	}

	public getAllServiceTemplates(): ServiceTemplate[] {
		return Array.from(this.serviceTemplates.values());
	}

	public getAllComponentTemplates(): ComponentTemplate[] {
		return Array.from(this.componentTemplates.values());
	}

	public getAllAppTemplates(): AppTemplate[] {
		return Array.from(this.appTemplates.values());
	}

	public getServiceTemplatesByCategory(category: string): ServiceTemplate[] {
		return this.getAllServiceTemplates().filter(
			(template) => template.category === category,
		);
	}

	public getComponentTemplatesByPlatform(
		platform: string,
	): ComponentTemplate[] {
		return this.getAllComponentTemplates().filter(
			(template) => template.platform === platform,
		);
	}

	public getAppTemplatesByPlatform(platform: PlatformType): AppTemplate[] {
		return this.getAllAppTemplates().filter(
			(template) => template.platform === platform,
		);
	}

	public getAvailablePlatforms(): PlatformType[] {
		const platforms = new Set<PlatformType>();
		this.getAllAppTemplates().forEach((template) =>
			platforms.add(template.platform),
		);
		return Array.from(platforms);
	}

	public searchTemplates(query: string): {
		services: ServiceTemplate[];
		components: ComponentTemplate[];
		apps: AppTemplate[];
	} {
		const lowerQuery = query.toLowerCase();

		const services = this.getAllServiceTemplates().filter(
			(template) =>
				template.name.toLowerCase().includes(lowerQuery) ||
				template.description.toLowerCase().includes(lowerQuery) ||
				template.category.toLowerCase().includes(lowerQuery),
		);

		const components = this.getAllComponentTemplates().filter(
			(template) =>
				template.name.toLowerCase().includes(lowerQuery) ||
				template.description.toLowerCase().includes(lowerQuery) ||
				template.category.toLowerCase().includes(lowerQuery),
		);

		const apps = this.getAllAppTemplates().filter(
			(template) =>
				template.name.toLowerCase().includes(lowerQuery) ||
				template.description.toLowerCase().includes(lowerQuery) ||
				template.framework.toLowerCase().includes(lowerQuery) ||
				template.platform.toLowerCase().includes(lowerQuery),
		);

		return { services, components, apps };
	}

	public canAddAppToMonorepo(appType: string): boolean {
		// Check if the app template exists and can be added to current monorepo
		const appTemplate = this.getAppTemplate(appType);
		return appTemplate !== undefined;
	}

	public async refreshRegistry(): Promise<void> {
		logger.info("Refreshing service registry...");
		this.serviceTemplates.clear();
		this.componentTemplates.clear();
		this.appTemplates.clear();
		this.initialized = false;
		await this.initialize();
	}

	public getRegistryStats(): {
		services: number;
		components: number;
		apps: number;
		platforms: PlatformType[];
		categories: string[];
		frameworks: string[];
	} {
		const platforms = [
			...new Set(this.getAllAppTemplates().map((t) => t.platform)),
		];
		const categories = [
			...new Set([
				...this.getAllServiceTemplates().map((t) => t.category),
				...this.getAllComponentTemplates().map((t) => t.category),
			]),
		];
		const frameworks = [
			...new Set(this.getAllAppTemplates().map((t) => t.framework)),
		];

		return {
			services: this.serviceTemplates.size,
			components: this.componentTemplates.size,
			apps: this.appTemplates.size,
			platforms,
			categories,
			frameworks,
		};
	}
}
