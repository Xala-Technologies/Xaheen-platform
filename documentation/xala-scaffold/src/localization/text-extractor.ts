import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { promises as fs } from "fs";
import { glob } from "glob";
import path from "path";
import { logger } from "../utils/logger.js";
import { LocaleCode } from "./core.js";

// Text extraction result
export interface ExtractedText {
	text: string;
	key?: string;
	file: string;
	line: number;
	column: number;
	context?: string;
	component?: string;
	attributes?: Record<string, string>;
}

// Extraction options
export interface ExtractionOptions {
	includeComments?: boolean;
	includeAttributes?: string[];
	excludePatterns?: RegExp[];
	customExtractors?: Array<(node: any, file: string) => ExtractedText | null>;
}

// Default attributes to extract
const DEFAULT_ATTRIBUTES = [
	"title",
	"alt",
	"placeholder",
	"aria-label",
	"aria-description",
	"data-tooltip",
];

// Text extractor class
export class TextExtractor {
	private options: ExtractionOptions;
	private extractedTexts: ExtractedText[] = [];

	constructor(options: ExtractionOptions = {}) {
		this.options = {
			includeAttributes: DEFAULT_ATTRIBUTES,
			...options,
		};
	}

	// Extract texts from a project
	async extractFromProject(projectPath: string): Promise<ExtractedText[]> {
		this.extractedTexts = [];

		// Find all JavaScript/TypeScript files
		const patterns = [
			"**/*.{js,jsx,ts,tsx}",
			"!**/node_modules/**",
			"!**/dist/**",
			"!**/build/**",
			"!**/*.test.*",
			"!**/*.spec.*",
		];

		const files = await glob(patterns, {
			cwd: projectPath,
			absolute: true,
		});

		logger.info(`Found ${files.length} files to analyze`);

		// Extract from each file
		for (const file of files) {
			try {
				await this.extractFromFile(file);
			} catch (error) {
				logger.warn(`Failed to extract from ${file}:`, error);
			}
		}

		// Deduplicate texts
		return this.deduplicateTexts(this.extractedTexts);
	}

	// Extract texts from a single file
	async extractFromFile(filePath: string): Promise<ExtractedText[]> {
		const content = await fs.readFile(filePath, "utf-8");
		const fileTexts: ExtractedText[] = [];

		try {
			// Parse the file
			const ast = parse(content, {
				sourceType: "module",
				plugins: [
					"jsx",
					"typescript",
					"decorators-legacy",
					"classProperties",
					"optionalChaining",
					"nullishCoalescingOperator",
				],
			});

			// Extract component name
			let currentComponent: string | undefined;

			// Traverse the AST
			traverse(ast, {
				// Track current component
				FunctionDeclaration(path) {
					if (path.node.id?.name) {
						currentComponent = path.node.id.name;
					}
				},

				VariableDeclarator(path) {
					if (
						t.isIdentifier(path.node.id) &&
						(t.isArrowFunctionExpression(path.node.init) ||
							t.isFunctionExpression(path.node.init))
					) {
						currentComponent = path.node.id.name;
					}
				},

				// Extract JSX text
				JSXText(path) {
					const text = path.node.value.trim();
					if (text && !this.shouldExclude(text)) {
						fileTexts.push({
							text,
							file: filePath,
							line: path.node.loc?.start.line || 0,
							column: path.node.loc?.start.column || 0,
							component: currentComponent,
						});
					}
				},

				// Extract JSX expression containers
				JSXExpressionContainer(path) {
					if (t.isStringLiteral(path.node.expression)) {
						const text = path.node.expression.value;
						if (text && !this.shouldExclude(text)) {
							fileTexts.push({
								text,
								file: filePath,
								line: path.node.loc?.start.line || 0,
								column: path.node.loc?.start.column || 0,
								component: currentComponent,
							});
						}
					}
				},

				// Extract JSX attributes
				JSXAttribute(path) {
					const attrName = path.node.name.name as string;

					if (this.options.includeAttributes?.includes(attrName)) {
						if (t.isStringLiteral(path.node.value)) {
							const text = path.node.value.value;
							if (text && !this.shouldExclude(text)) {
								fileTexts.push({
									text,
									file: filePath,
									line: path.node.loc?.start.line || 0,
									column: path.node.loc?.start.column || 0,
									component: currentComponent,
									attributes: { [attrName]: text },
								});
							}
						}
					}
				},

				// Extract string literals
				StringLiteral(path) {
					// Skip if inside JSX (already handled)
					if (path.isJSXAttribute() || path.isJSXText()) return;

					const text = path.node.value;
					if (
						text &&
						!this.shouldExclude(text) &&
						this.looksLikeUserFacingText(text)
					) {
						fileTexts.push({
							text,
							file: filePath,
							line: path.node.loc?.start.line || 0,
							column: path.node.loc?.start.column || 0,
							component: currentComponent,
							context: this.getNodeContext(path),
						});
					}
				},

				// Extract template literals
				TemplateLiteral(path) {
					const parts: string[] = [];

					path.node.quasis.forEach((quasi, index) => {
						parts.push(quasi.value.raw);
						if (index < path.node.expressions.length) {
							parts.push("${...}");
						}
					});

					const text = parts.join("");
					if (
						text &&
						!this.shouldExclude(text) &&
						this.looksLikeUserFacingText(text)
					) {
						fileTexts.push({
							text,
							file: filePath,
							line: path.node.loc?.start.line || 0,
							column: path.node.loc?.start.column || 0,
							component: currentComponent,
							context: this.getNodeContext(path),
						});
					}
				},
			});

			// Apply custom extractors
			if (this.options.customExtractors) {
				for (const extractor of this.options.customExtractors) {
					traverse(ast, {
						enter(path) {
							const result = extractor(path.node, filePath);
							if (result) {
								fileTexts.push(result);
							}
						},
					});
				}
			}
		} catch (error) {
			logger.error(`Failed to parse ${filePath}:`, error);
		}

		this.extractedTexts.push(...fileTexts);
		return fileTexts;
	}

	// Check if text should be excluded
	private shouldExclude(text: string): boolean {
		if (!this.options.excludePatterns) return false;

		return this.options.excludePatterns.some((pattern) => pattern.test(text));
	}

	// Check if text looks like user-facing content
	private looksLikeUserFacingText(text: string): boolean {
		// Skip if too short
		if (text.length < 2) return false;

		// Skip if looks like code
		if (/^[a-z_][a-zA-Z0-9_]*$/.test(text)) return false; // Variable name
		if (/^[A-Z_][A-Z0-9_]*$/.test(text)) return false; // Constant
		if (/^\w+\.\w+/.test(text)) return false; // Property access
		if (/^[\w-]+\.[\w-]+$/.test(text)) return false; // File name
		if (/^https?:\/\//.test(text)) return false; // URL
		if (/^[\w._%+-]+@[\w.-]+\.[A-Z|a-z]{2,}$/.test(text)) return false; // Email
		if (/^#[0-9A-Fa-f]{3,6}$/.test(text)) return false; // Hex color
		if (/^\d+(\.\d+)?[a-zA-Z]*$/.test(text)) return false; // Number with unit

		// Skip if only special characters
		if (!/[a-zA-ZÀ-ɏḀ-ỿ]/.test(text)) return false;

		return true;
	}

	// Get context for a node
	private getNodeContext(path: any): string {
		const parent = path.parent;

		if (t.isCallExpression(parent)) {
			if (t.isIdentifier(parent.callee)) {
				return `${parent.callee.name}()`;
			}
		}

		if (t.isVariableDeclarator(parent)) {
			if (t.isIdentifier(parent.id)) {
				return `const ${parent.id.name}`;
			}
		}

		if (t.isReturnStatement(parent)) {
			return "return statement";
		}

		return parent.type;
	}

	// Deduplicate extracted texts
	private deduplicateTexts(texts: ExtractedText[]): ExtractedText[] {
		const seen = new Map<string, ExtractedText>();

		for (const text of texts) {
			const key = text.text.toLowerCase().trim();

			if (!seen.has(key)) {
				seen.set(key, text);
			} else {
				// Keep the one with more context
				const existing = seen.get(key)!;
				if (!existing.component && text.component) {
					seen.set(key, text);
				}
			}
		}

		return Array.from(seen.values());
	}

	// Generate extraction report
	generateReport(texts: ExtractedText[]): string {
		const report: string[] = [];

		report.push("# Text Extraction Report");
		report.push(`\nTotal texts found: ${texts.length}`);
		report.push("\n## By File:\n");

		// Group by file
		const byFile = new Map<string, ExtractedText[]>();
		for (const text of texts) {
			const file = path.relative(process.cwd(), text.file);
			if (!byFile.has(file)) {
				byFile.set(file, []);
			}
			byFile.get(file)!.push(text);
		}

		for (const [file, fileTexts] of byFile) {
			report.push(`### ${file} (${fileTexts.length} texts)`);
			for (const text of fileTexts) {
				report.push(`- Line ${text.line}: "${text.text}"`);
				if (text.component) {
					report.push(`  Component: ${text.component}`);
				}
				if (text.attributes) {
					report.push(`  Attributes: ${JSON.stringify(text.attributes)}`);
				}
			}
			report.push("");
		}

		return report.join("\n");
	}
}

// Create default extractor instance
export const textExtractor = new TextExtractor();

// Extract texts with custom options
export async function extractTexts(
	projectPath: string,
	options?: ExtractionOptions,
): Promise<ExtractedText[]> {
	const extractor = new TextExtractor(options);
	return extractor.extractFromProject(projectPath);
}
