/**
 * Backend Template Registry
 *
 * Registry for backend application templates.
 * These templates are used for creating complete backend API structures.
 *
 * @author CLI Template Generator Agent
 * @since 2025-01-06
 */

import { fileURLToPath } from "node:url";
import { promises as fs, existsSync, mkdirSync } from "node:fs";
import * as path from "path";
import { logger } from "../../utils/logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface BackendTemplate {
	name: string;
	framework: string;
	description: string;
	files: BackendTemplateFile[];
}

export interface BackendTemplateFile {
	path: string;
	content: string;
	isTemplate: boolean;
}

export class BackendTemplateRegistry {
	private templatesPath: string;
	private templateCache: Map<string, BackendTemplate> = new Map();

	constructor() {
		this.templatesPath = path.resolve(__dirname, "../../templates");
	}

	/**
	 * Get backend template by framework
	 */
	async getBackendTemplate(framework: string): Promise<BackendTemplate | null> {
		const cacheKey = framework;

		if (this.templateCache.has(cacheKey)) {
			return this.templateCache.get(cacheKey)!;
		}

		try {
			const template = await this.loadBackendTemplate(framework);
			if (template) {
				this.templateCache.set(cacheKey, template);
			}
			return template;
		} catch (error) {
			logger.error(`Failed to load backend template for ${framework}:`, error);
			return null;
		}
	}

	/**
	 * Load backend template from filesystem
	 */
	private async loadBackendTemplate(
		framework: string,
	): Promise<BackendTemplate | null> {
		const templatePath = path.join(this.templatesPath, "backend", framework);

		if (!existsSync(templatePath)) {
			logger.warn(`Backend template not found: ${framework} at ${templatePath}`);
			return null;
		}

		const files: BackendTemplateFile[] = [];

		await this.scanTemplateDirectory(templatePath, "", files);

		const template: BackendTemplate = {
			name: framework,
			framework,
			description: `${framework} backend API template with authentication and database`,
			files,
		};

		return template;
	}

	/**
	 * Recursively scan template directory
	 */
	private async scanTemplateDirectory(
		dirPath: string,
		relativePath: string,
		files: BackendTemplateFile[],
	): Promise<void> {
		const entries = await fs.readdir(dirPath, { withFileTypes: true });

		for (const entry of entries) {
			const entryPath = path.join(dirPath, entry.name);
			const relativeEntryPath = path.join(relativePath, entry.name);

			if (entry.isDirectory()) {
				await this.scanTemplateDirectory(entryPath, relativeEntryPath, files);
			} else if (entry.isFile()) {
				const content = await fs.readFile(entryPath, "utf-8");
				const isTemplate = entry.name.endsWith(".hbs");

				// Remove .hbs extension for actual file creation
				const finalPath = isTemplate
					? relativeEntryPath.replace(/\.hbs$/, "")
					: relativeEntryPath;

				files.push({
					path: finalPath,
					content,
					isTemplate,
				});
			}
		}
	}

	/**
	 * Generate backend from template
	 */
	async generateBackendFromTemplate(
		targetPath: string,
		framework: string,
		variables: Record<string, any>,
	): Promise<void> {
		const template = await this.getBackendTemplate(framework);

		if (!template) {
			// Create a basic backend structure if template doesn't exist
			await this.createBasicBackendStructure(targetPath, framework, variables);
			return;
		}

		if (!existsSync(targetPath)) {
			mkdirSync(targetPath, { recursive: true });
		}

		for (const file of template.files) {
			const filePath = path.join(targetPath, file.path);
			const dirPath = path.dirname(filePath);
			if (!existsSync(dirPath)) {
				mkdirSync(dirPath, { recursive: true });
			}

			let content = file.content;
			if (file.isTemplate) {
				// Use simple template replacement for now
				content = this.simpleTemplateReplace(content, variables);
			}

			await fs.writeFile(filePath, content);
			logger.debug(`Generated backend file: ${file.path}`);
		}
	}

	/**
	 * Create a basic backend structure when no template exists
	 */
	private async createBasicBackendStructure(
		targetPath: string,
		framework: string,
		variables: Record<string, any>,
	): Promise<void> {
		if (!existsSync(targetPath)) {
			mkdirSync(targetPath, { recursive: true });
		}

		// Create basic package.json
		const packageJson = {
			name: variables.name,
			version: "0.1.0",
			description: variables.description,
			main: "dist/index.js",
			scripts: {
				start: "node dist/index.js",
				dev: "nodemon src/index.ts",
				build: "tsc",
				test: "jest",
			},
			dependencies: {
				express: "^4.18.2",
				cors: "^2.8.5",
				helmet: "^7.0.0",
				"express-rate-limit": "^6.7.0",
			},
			devDependencies: {
				"@types/express": "^4.17.17",
				"@types/cors": "^2.8.13",
				"@types/node": "^20.0.0",
				typescript: "^5.0.0",
				nodemon: "^3.0.0",
				"ts-node": "^10.9.0",
				jest: "^29.0.0",
				"@types/jest": "^29.0.0",
			},
		};

		await fs.writeFile(
			path.join(targetPath, "package.json"),
			JSON.stringify(packageJson, null, 2),
		);

		// Create basic TypeScript config
		const tsConfig = {
			compilerOptions: {
				target: "ES2020",
				module: "commonjs",
				lib: ["ES2020"],
				outDir: "./dist",
				rootDir: "./src",
				strict: true,
				esModuleInterop: true,
				skipLibCheck: true,
				forceConsistentCasingInFileNames: true,
				resolveJsonModule: true,
			},
			include: ["src/**/*"],
			exclude: ["node_modules", "dist"],
		};

		await fs.writeFile(
			path.join(targetPath, "tsconfig.json"),
			JSON.stringify(tsConfig, null, 2),
		);

		// Create src directory and basic server
		const srcPath = path.join(targetPath, "src");
		if (!existsSync(srcPath)) {
			mkdirSync(srcPath, { recursive: true });
		}

		const indexContent = `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const port = process.env.PORT || ${variables.port || 3001};

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ${variables.title}',
    version: '1.0.0',
    framework: '${framework}',
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(\`🚀 ${variables.title} server running on http://localhost:\${port}\`);
});

export default app;
`;

		await fs.writeFile(path.join(targetPath, "src", "index.ts"), indexContent);

		// Create README
		const readme = `# ${variables.title}

${variables.description}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   ${variables.packageManager} install
   \`\`\`

2. Start development server:
   \`\`\`bash
   ${variables.packageManager} run dev
   \`\`\`

3. Build for production:
   \`\`\`bash
   ${variables.packageManager} run build
   ${variables.packageManager} start
   \`\`\`

## API Endpoints

- \`GET /\` - Welcome message
- \`GET /health\` - Health check

## Environment Variables

Create a \`.env\` file in the root directory:

\`\`\`
PORT=${variables.port || 3001}
NODE_ENV=development
\`\`\`

## Features

- ✅ **Express.js** - Fast, unopinionated web framework
- ✅ **TypeScript** - Strict type safety
- ✅ **CORS** - Cross-origin resource sharing
- ✅ **Helmet** - Security middleware
- ✅ **Rate Limiting** - Request rate limiting
- ✅ **Health Check** - API health endpoint
`;

		await fs.writeFile(path.join(targetPath, "README.md"), readme);
	}

	/**
	 * Simple template replacement
	 */
	private simpleTemplateReplace(
		content: string,
		variables: Record<string, any>,
	): string {
		let result = content;
		for (const [key, value] of Object.entries(variables)) {
			const regex = new RegExp(`{{${key}}}`, "g");
			result = result.replace(regex, String(value));
		}
		return result;
	}

	/**
	 * List available backend templates
	 */
	async listAvailableTemplates(): Promise<string[]> {
		try {
			const templates: string[] = [];

			// Check backend templates
			const backendPath = path.join(this.templatesPath, "backend");
			if (existsSync(backendPath)) {
				const backendEntries = await fs.readdir(backendPath, {
					withFileTypes: true,
				});
				templates.push(
					...backendEntries
						.filter((entry) => entry.isDirectory())
						.map((entry) => entry.name),
				);
			}

			return templates;
		} catch (error) {
			logger.error("Failed to list backend templates:", error);
			return [];
		}
	}

	/**
	 * Clear template cache
	 */
	clearCache(): void {
		this.templateCache.clear();
	}
}

// Singleton instance
export const backendTemplateRegistry = new BackendTemplateRegistry();