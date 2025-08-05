/**
 * MCP (Model Context Protocol) Client Integration
 *
 * Integrates with Xala UI Component Specification System for AI-optimized template generation.
 *
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { consola } from "consola";
import fs from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class MCPClient {
	specCache = new Map();
	mcpPath;
	constructor() {
		this.mcpPath = path.resolve(__dirname, "../../../mcp");
	}
	/**
	 * Load component specification from MCP system
	 */
	async loadSpecification(componentName, category) {
		const cacheKey = `${category || "unknown"}:${componentName}`;
		// Check cache first
		if (this.specCache.has(cacheKey)) {
			return this.specCache.get(cacheKey);
		}
		try {
			// Try to find the specification file
			const specPath = await this.findSpecificationPath(
				componentName,
				category,
			);
			if (!specPath) {
				consola.warn(`MCP specification not found for ${componentName}`);
				return null;
			}
			const specContent = await fs.readFile(specPath, "utf-8");
			const spec = JSON.parse(specContent);
			// Cache the specification
			this.specCache.set(cacheKey, spec);
			consola.debug(
				`Loaded MCP specification for ${componentName} from ${specPath}`,
			);
			return spec;
		} catch (error) {
			consola.error(
				`Failed to load MCP specification for ${componentName}:`,
				error,
			);
			return null;
		}
	}
	/**
	 * Get AI optimization hints for component generation
	 */
	async getAIHints(componentName, platform = "react") {
		const spec = await this.loadSpecification(componentName);
		if (!spec?.ai?.optimization) {
			return this.getDefaultAIHints(platform);
		}
		const hints = [...spec.ai.optimization.hints];
		// Add platform-specific hints
		const platformImpl = spec.platforms.implementations[platform];
		if (platformImpl?.ai?.hints) {
			hints.push(...platformImpl.ai.hints);
		}
		return hints;
	}
	/**
	 * Get complexity estimation for token usage planning
	 */
	async getComplexityEstimation(componentName) {
		const spec = await this.loadSpecification(componentName);
		if (spec?.ai?.generation) {
			return {
				complexity: spec.ai.generation.complexity,
				estimatedTokens: spec.ai.generation.estimatedTokens,
				priority: spec.ai.generation.priority,
			};
		}
		// Default estimation based on component name patterns
		return this.estimateComplexity(componentName);
	}
	/**
	 * Get component patterns and anti-patterns
	 */
	async getPatterns(componentName) {
		const spec = await this.loadSpecification(componentName);
		return {
			patterns: spec?.ai?.optimization?.patterns || [],
			antiPatterns: spec?.ai?.optimization?.antiPatterns || [],
		};
	}
	/**
	 * Generate enhanced template context with MCP data
	 */
	async enhanceTemplateContext(context, componentName) {
		if (!componentName) {
			return context;
		}
		const spec = await this.loadSpecification(componentName);
		if (!spec) {
			return context;
		}
		return {
			...context,
			mcp: {
				specification: spec,
				aiHints: await this.getAIHints(
					componentName,
					context.platform || "react",
				),
				complexity: await this.getComplexityEstimation(componentName),
				patterns: await this.getPatterns(componentName),
				compliance: {
					wcag: spec.compliance.wcag,
					norwegian: spec.compliance.norwegian,
					i18n: spec.compliance.i18n,
				},
			},
		};
	}
	/**
	 * Validate component against MCP specifications
	 */
	async validateComponent(componentCode, componentName) {
		const spec = await this.loadSpecification(componentName);
		if (!spec) {
			return {
				valid: true,
				score: 0.5,
				issues: [{ type: "warning", message: "No MCP specification found" }],
			};
		}
		const issues = [];
		let score = 1.0;
		// Check for AI optimization patterns
		if (spec.ai?.optimization?.antiPatterns) {
			for (const antiPattern of spec.ai.optimization.antiPatterns) {
				if (componentCode.includes(antiPattern.pattern)) {
					issues.push({
						type: "warning",
						message: `Anti-pattern detected: ${antiPattern.reason}`,
						suggestion: antiPattern.alternative,
					});
					score -= 0.1;
				}
			}
		}
		// Check for required accessibility attributes
		if (spec.accessibility?.role?.primary && !componentCode.includes("role=")) {
			issues.push({
				type: "error",
				message: `Missing required role attribute: ${spec.accessibility.role.primary}`,
				suggestion: `Add role="${spec.accessibility.role.primary}" to the component`,
			});
			score -= 0.2;
		}
		return {
			valid: issues.filter((i) => i.type === "error").length === 0,
			score: Math.max(0, score),
			issues,
		};
	}
	/**
	 * Get available component specifications
	 */
	async getAvailableSpecs() {
		const specs = [];
		const categoriesPath = path.join(
			this.mcpPath,
			"docs/specifications/components",
		);
		try {
			if (!(await fs.pathExists(categoriesPath))) {
				return [];
			}
			const categories = await fs.readdir(categoriesPath);
			for (const category of categories) {
				const categoryPath = path.join(categoriesPath, category);
				const stat = await fs.stat(categoryPath);
				if (stat.isDirectory()) {
					const files = await fs.readdir(categoryPath);
					for (const file of files) {
						if (file.endsWith(".json")) {
							specs.push({
								name: path.basename(file, ".json"),
								category,
								path: path.join(categoryPath, file),
							});
						}
					}
				}
			}
		} catch (error) {
			consola.debug("Could not scan MCP specifications:", error);
		}
		return specs;
	}
	async findSpecificationPath(componentName, category) {
		const possiblePaths = [];
		if (category) {
			possiblePaths.push(
				path.join(
					this.mcpPath,
					`docs/specifications/components/${category}/${componentName}.json`,
				),
				path.join(
					this.mcpPath,
					`docs/specifications/components/${category}/${componentName.toLowerCase()}.json`,
				),
			);
		} else {
			// Search all categories
			const categories = [
				"basic",
				"composite",
				"layout",
				"navigation",
				"feedback",
				"overlay",
				"form",
				"data-display",
				"specialized",
			];
			for (const cat of categories) {
				possiblePaths.push(
					path.join(
						this.mcpPath,
						`docs/specifications/components/${cat}/${componentName}.json`,
					),
					path.join(
						this.mcpPath,
						`docs/specifications/components/${cat}/${componentName.toLowerCase()}.json`,
					),
				);
			}
		}
		for (const specPath of possiblePaths) {
			if (await fs.pathExists(specPath)) {
				return specPath;
			}
		}
		return null;
	}
	getDefaultAIHints(platform) {
		const baseHints = [
			"Use semantic HTML elements for better accessibility",
			"Implement proper TypeScript interfaces with readonly props",
			"Add comprehensive error handling with try-catch blocks",
			"Use semantic UI System components instead of hardcoded HTML",
			"Include WCAG AAA accessibility attributes",
			"Support Norwegian compliance with NSM classifications",
		];
		const platformHints = {
			react: [
				"Use React.forwardRef for DOM reference access",
				"Implement useCallback for event handlers to prevent re-renders",
				"Use useMemo for expensive calculations",
				"Add proper JSX.Element return type annotation",
			],
			vue: [
				"Use Composition API for better TypeScript support",
				"Implement proper reactivity with ref/reactive",
				"Use defineEmits for event handling",
				"Add proper component props validation",
			],
			angular: [
				"Use standalone components for better tree-shaking",
				"Implement proper OnInit and OnDestroy lifecycle hooks",
				"Use trackBy functions for *ngFor performance",
				"Add proper component input validation",
			],
		};
		return [...baseHints, ...(platformHints[platform] || [])];
	}
	estimateComplexity(componentName) {
		const name = componentName.toLowerCase();
		// Simple components
		if (
			["button", "input", "text", "icon", "badge", "divider"].some((simple) =>
				name.includes(simple),
			)
		) {
			return { complexity: "simple", estimatedTokens: 800, priority: "high" };
		}
		// Complex components
		if (
			["table", "datagrid", "calendar", "chart", "editor", "carousel"].some(
				(complex) => name.includes(complex),
			)
		) {
			return {
				complexity: "complex",
				estimatedTokens: 2400,
				priority: "medium",
			};
		}
		// Medium complexity by default
		return { complexity: "medium", estimatedTokens: 1200, priority: "medium" };
	}
}
// Singleton instance
export const mcpClient = new MCPClient();
//# sourceMappingURL=mcp-client.js.map
