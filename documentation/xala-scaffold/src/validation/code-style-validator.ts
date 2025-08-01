import * as babel from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { logger } from "../utils/logger.js";
import {
	BaseValidator,
	createValidationRule,
	ValidationIssue,
	ValidationRule,
	ValidationSeverity,
} from "./base-validator.js";

// Code style validation configuration
export interface CodeStyleConfig {
	maxLineLength: number;
	maxFunctionLength: number;
	maxFileLength: number;
	maxComplexity: number;
	indentSize: number;
	indentType: "spaces" | "tabs";
	trailingComma: "always" | "never" | "es5";
	semicolons: "always" | "never";
	quotes: "single" | "double";
	enforceConsistentNaming: boolean;
	enforceComponentNaming: boolean;
	enforceHookNaming: boolean;
	enforcePropTypes: boolean;
	enforceReturnTypes: boolean;
	maxNestingDepth: number;
	allowConsole: boolean;
	allowDebugger: boolean;
	enforceReadonlyProps: boolean;
}

// Naming conventions
export interface NamingConventions {
	components: "PascalCase";
	functions: "camelCase";
	variables: "camelCase";
	constants: "SCREAMING_SNAKE_CASE";
	files: "kebab-case" | "PascalCase" | "camelCase";
	directories: "kebab-case" | "camelCase";
}

// Code complexity metrics
export interface ComplexityMetrics {
	cyclomaticComplexity: number;
	cognitiveComplexity: number;
	nestingDepth: number;
	parameterCount: number;
	linesOfCode: number;
}

// Code style validator implementation
export class CodeStyleValidator extends BaseValidator {
	private styleConfig: CodeStyleConfig;
	private namingConventions: NamingConventions;

	constructor(config: Partial<CodeStyleConfig> = {}) {
		super({
			rules: [],
			severity: "warning",
			autofix: true,
			exclude: ["node_modules/**", "dist/**", "build/**"],
			include: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
			failFast: false,
			maxIssues: 1000,
		});

		this.styleConfig = {
			maxLineLength: 100,
			maxFunctionLength: 50,
			maxFileLength: 300,
			maxComplexity: 10,
			indentSize: 2,
			indentType: "spaces",
			trailingComma: "always",
			semicolons: "always",
			quotes: "single",
			enforceConsistentNaming: true,
			enforceComponentNaming: true,
			enforceHookNaming: true,
			enforcePropTypes: true,
			enforceReturnTypes: true,
			maxNestingDepth: 4,
			allowConsole: false,
			allowDebugger: false,
			enforceReadonlyProps: true,
			...config,
		};

		this.namingConventions = {
			components: "PascalCase",
			functions: "camelCase",
			variables: "camelCase",
			constants: "SCREAMING_SNAKE_CASE",
			files: "kebab-case",
			directories: "kebab-case",
		};
	}

	initializeRules(): void {
		const rules: ValidationRule[] = [
			createValidationRule(
				"style.line-length",
				"Line Length",
				`Lines should not exceed ${this.styleConfig.maxLineLength} characters`,
				"style",
				"warning",
				true,
			),
			createValidationRule(
				"style.function-length",
				"Function Length",
				`Functions should not exceed ${this.styleConfig.maxFunctionLength} lines`,
				"style",
				"warning",
				true,
			),
			createValidationRule(
				"style.file-length",
				"File Length",
				`Files should not exceed ${this.styleConfig.maxFileLength} lines`,
				"style",
				"warning",
				true,
			),
			createValidationRule(
				"style.complexity",
				"Cyclomatic Complexity",
				`Functions should not exceed complexity of ${this.styleConfig.maxComplexity}`,
				"style",
				"error",
				true,
			),
			createValidationRule(
				"style.indentation",
				"Indentation",
				`Use ${this.styleConfig.indentSize} ${this.styleConfig.indentType} for indentation`,
				"style",
				"warning",
				true,
			),
			createValidationRule(
				"style.trailing-comma",
				"Trailing Comma",
				`Trailing commas should be ${this.styleConfig.trailingComma}`,
				"style",
				"warning",
				true,
			),
			createValidationRule(
				"style.semicolons",
				"Semicolons",
				`Semicolons should be ${this.styleConfig.semicolons}`,
				"style",
				"warning",
				true,
			),
			createValidationRule(
				"style.quotes",
				"Quote Style",
				`Use ${this.styleConfig.quotes} quotes`,
				"style",
				"warning",
				true,
			),
			createValidationRule(
				"style.component-naming",
				"Component Naming",
				"React components should use PascalCase",
				"style",
				"error",
				true,
			),
			createValidationRule(
				"style.hook-naming",
				"Hook Naming",
				'React hooks should start with "use" and use camelCase',
				"style",
				"error",
				true,
			),
			createValidationRule(
				"style.prop-types",
				"Prop Types",
				"Component props should have TypeScript types",
				"style",
				"error",
				true,
			),
			createValidationRule(
				"style.return-types",
				"Return Types",
				"Functions should have explicit return types",
				"style",
				"error",
				true,
			),
			createValidationRule(
				"style.readonly-props",
				"Readonly Props",
				"Component props interfaces should use readonly properties",
				"style",
				"error",
				true,
			),
			createValidationRule(
				"style.nesting-depth",
				"Nesting Depth",
				`Nesting depth should not exceed ${this.styleConfig.maxNestingDepth}`,
				"style",
				"warning",
				true,
			),
			createValidationRule(
				"style.no-console",
				"No Console",
				"Console statements should be removed from production code",
				"style",
				"warning",
				true,
			),
			createValidationRule(
				"style.no-debugger",
				"No Debugger",
				"Debugger statements should be removed from production code",
				"style",
				"error",
				true,
			),
			createValidationRule(
				"style.consistent-naming",
				"Consistent Naming",
				"Variable and function names should follow consistent conventions",
				"style",
				"warning",
				true,
			),
		];

		for (const rule of rules) {
			this.rules.set(rule.id, rule);
		}
	}

	getDefaultRules(): ValidationRule[] {
		return Array.from(this.rules.values());
	}

	async validateFile(
		file: string,
		content: string,
	): Promise<ValidationIssue[]> {
		const issues: ValidationIssue[] = [];

		try {
			// Skip non-JS/TS files
			if (!this.isJavaScriptFile(file)) {
				return issues;
			}

			// Basic file-level validations
			issues.push(...this.validateFileStructure(file, content));

			// Parse AST for deeper analysis
			const ast = this.parseCode(content, file);
			if (ast) {
				issues.push(...this.validateAST(file, content, ast));
			}
		} catch (error) {
			logger.error(`Code style validation failed for ${file}:`, error);
			issues.push({
				id: `style-parse-error-${file}`,
				severity: "error",
				category: "style",
				message: "Failed to parse file for style validation",
				description: error instanceof Error ? error.message : "Parse error",
				file,
				rule: "style.parse-error",
				fixable: false,
			});
		}

		return issues;
	}

	private isJavaScriptFile(file: string): boolean {
		return /\.(js|jsx|ts|tsx)$/.test(file);
	}

	private validateFileStructure(
		file: string,
		content: string,
	): ValidationIssue[] {
		const issues: ValidationIssue[] = [];
		const lines = content.split("\n");

		// File length validation
		if (lines.length > this.styleConfig.maxFileLength) {
			issues.push({
				id: `style-file-length-${file}`,
				severity: "warning",
				category: "style",
				message: `File too long: ${lines.length} lines (max: ${this.styleConfig.maxFileLength})`,
				description: "Consider breaking this file into smaller modules",
				file,
				rule: "style.file-length",
				fixable: false,
			});
		}

		// Line length validation
		lines.forEach((line, index) => {
			if (line.length > this.styleConfig.maxLineLength) {
				issues.push({
					id: `style-line-length-${file}-${index + 1}`,
					severity: "warning",
					category: "style",
					message: `Line too long: ${line.length} characters (max: ${this.styleConfig.maxLineLength})`,
					file,
					line: index + 1,
					rule: "style.line-length",
					fixable: false,
				});
			}
		});

		// Indentation validation
		lines.forEach((line, index) => {
			if (line.trim().length === 0) return; // Skip empty lines

			const leadingWhitespace = line.match(/^(\s*)/)?.[1] || "";
			const hasSpaces = leadingWhitespace.includes(" ");
			const hasTabs = leadingWhitespace.includes("\t");

			if (hasSpaces && hasTabs) {
				issues.push({
					id: `style-mixed-indentation-${file}-${index + 1}`,
					severity: "warning",
					category: "style",
					message: "Mixed tabs and spaces for indentation",
					file,
					line: index + 1,
					rule: "style.indentation",
					fixable: true,
					autofix: {
						description: `Convert to ${this.styleConfig.indentType}`,
						operation: "replace",
						target: leadingWhitespace,
						replacement: this.normalizeIndentation(leadingWhitespace),
					},
				});
			}

			if (this.styleConfig.indentType === "spaces" && hasTabs) {
				issues.push({
					id: `style-tabs-instead-spaces-${file}-${index + 1}`,
					severity: "warning",
					category: "style",
					message: "Use spaces instead of tabs",
					file,
					line: index + 1,
					rule: "style.indentation",
					fixable: true,
					autofix: {
						description: "Convert tabs to spaces",
						operation: "replace",
						target: leadingWhitespace,
						replacement: leadingWhitespace.replace(
							/\t/g,
							" ".repeat(this.styleConfig.indentSize),
						),
					},
				});
			}

			if (this.styleConfig.indentType === "tabs" && hasSpaces) {
				issues.push({
					id: `style-spaces-instead-tabs-${file}-${index + 1}`,
					severity: "warning",
					category: "style",
					message: "Use tabs instead of spaces",
					file,
					line: index + 1,
					rule: "style.indentation",
					fixable: true,
					autofix: {
						description: "Convert spaces to tabs",
						operation: "replace",
						target: leadingWhitespace,
						replacement: leadingWhitespace.replace(
							new RegExp(` {${this.styleConfig.indentSize}}`, "g"),
							"\t",
						),
					},
				});
			}
		});

		return issues;
	}

	private parseCode(content: string, file: string): t.File | null {
		try {
			const isTypeScript = /\.tsx?$/.test(file);
			const isJSX = /\.(jsx|tsx)$/.test(file);

			return babel.parse(content, {
				sourceType: "module",
				plugins: [
					...(isTypeScript ? ["typescript"] : []),
					...(isJSX ? ["jsx"] : []),
					"decorators-legacy",
					"classProperties",
					"objectRestSpread",
					"functionBind",
					"dynamicImport",
				],
			});
		} catch (error) {
			logger.debug(`Failed to parse ${file}:`, error);
			return null;
		}
	}

	private validateAST(
		file: string,
		content: string,
		ast: t.File,
	): ValidationIssue[] {
		const issues: ValidationIssue[] = [];
		const lines = content.split("\n");

		traverse(ast, {
			// Function declarations and expressions
			"FunctionDeclaration|FunctionExpression|ArrowFunctionExpression"(path) {
				const node = path.node;
				const startLine = node.loc?.start.line || 1;
				const endLine = node.loc?.end.line || 1;
				const functionLength = endLine - startLine + 1;

				// Function length validation
				if (functionLength > this.styleConfig.maxFunctionLength) {
					issues.push({
						id: `style-function-length-${file}-${startLine}`,
						severity: "warning",
						category: "style",
						message: `Function too long: ${functionLength} lines (max: ${this.styleConfig.maxFunctionLength})`,
						file,
						line: startLine,
						rule: "style.function-length",
						fixable: false,
					});
				}

				// Complexity validation
				const complexity = this.calculateComplexity(path);
				if (complexity > this.styleConfig.maxComplexity) {
					issues.push({
						id: `style-complexity-${file}-${startLine}`,
						severity: "error",
						category: "style",
						message: `Function complexity too high: ${complexity} (max: ${this.styleConfig.maxComplexity})`,
						description:
							"Consider breaking this function into smaller functions",
						file,
						line: startLine,
						rule: "style.complexity",
						fixable: false,
					});
				}

				// Return type validation (TypeScript)
				if (file.endsWith(".ts") || file.endsWith(".tsx")) {
					if (t.isFunctionDeclaration(node) || t.isFunctionExpression(node)) {
						if (!node.returnType && this.styleConfig.enforceReturnTypes) {
							issues.push({
								id: `style-missing-return-type-${file}-${startLine}`,
								severity: "error",
								category: "style",
								message: "Function missing return type annotation",
								file,
								line: startLine,
								rule: "style.return-types",
								fixable: false,
							});
						}
					}
				}
			},

			// React component validation
			VariableDeclarator(path) {
				const node = path.node;

				if (t.isIdentifier(node.id)) {
					const name = node.id.name;

					// Component naming validation
					if (
						this.isReactComponent(path) &&
						this.styleConfig.enforceComponentNaming
					) {
						if (!this.isPascalCase(name)) {
							issues.push({
								id: `style-component-naming-${file}-${node.loc?.start.line}`,
								severity: "error",
								category: "style",
								message: `Component name should be PascalCase: ${name}`,
								file,
								line: node.loc?.start.line,
								rule: "style.component-naming",
								fixable: false,
							});
						}
					}

					// Hook naming validation
					if (this.isReactHook(path) && this.styleConfig.enforceHookNaming) {
						if (!name.startsWith("use") || !this.isCamelCase(name.slice(3))) {
							issues.push({
								id: `style-hook-naming-${file}-${node.loc?.start.line}`,
								severity: "error",
								category: "style",
								message: `Hook name should start with "use" and be camelCase: ${name}`,
								file,
								line: node.loc?.start.line,
								rule: "style.hook-naming",
								fixable: false,
							});
						}
					}
				}
			},

			// TypeScript interface validation
			TSInterfaceDeclaration(path) {
				const node = path.node;

				// Props interface validation
				if (
					node.id.name.endsWith("Props") &&
					this.styleConfig.enforceReadonlyProps
				) {
					for (const member of node.body.body) {
						if (t.isTSPropertySignature(member) && !member.readonly) {
							issues.push({
								id: `style-readonly-props-${file}-${member.loc?.start.line}`,
								severity: "error",
								category: "style",
								message: "Props interface properties should be readonly",
								file,
								line: member.loc?.start.line,
								rule: "style.readonly-props",
								fixable: true,
								autofix: {
									description: "Add readonly modifier",
									operation: "replace",
									target:
										member.key && t.isIdentifier(member.key)
											? member.key.name
											: "",
									replacement: `readonly ${member.key && t.isIdentifier(member.key) ? member.key.name : ""}`,
								},
							});
						}
					}
				}
			},

			// String literal validation
			StringLiteral(path) {
				const node = path.node;
				const quote = node.extra?.raw?.[0];

				if (this.styleConfig.quotes === "single" && quote === '"') {
					issues.push({
						id: `style-double-quotes-${file}-${node.loc?.start.line}`,
						severity: "warning",
						category: "style",
						message: "Use single quotes instead of double quotes",
						file,
						line: node.loc?.start.line,
						rule: "style.quotes",
						fixable: true,
						autofix: {
							description: "Convert to single quotes",
							operation: "replace",
							target: (node.extra?.raw as string) || "",
							replacement: `'${node.value}'`,
						},
					});
				}

				if (this.styleConfig.quotes === "double" && quote === "'") {
					issues.push({
						id: `style-single-quotes-${file}-${node.loc?.start.line}`,
						severity: "warning",
						category: "style",
						message: "Use double quotes instead of single quotes",
						file,
						line: node.loc?.start.line,
						rule: "style.quotes",
						fixable: true,
						autofix: {
							description: "Convert to double quotes",
							operation: "replace",
							target: (node.extra?.raw as string) || "",
							replacement: `"${node.value}"`,
						},
					});
				}
			},

			// Console and debugger validation
			CallExpression(path) {
				const node = path.node;

				if (
					t.isMemberExpression(node.callee) &&
					t.isIdentifier(node.callee.object) &&
					node.callee.object.name === "console"
				) {
					if (!this.styleConfig.allowConsole) {
						issues.push({
							id: `style-console-${file}-${node.loc?.start.line}`,
							severity: "warning",
							category: "style",
							message: "Console statement should be removed",
							file,
							line: node.loc?.start.line,
							rule: "style.no-console",
							fixable: true,
							autofix: {
								description: "Remove console statement",
								operation: "delete",
								target: lines[node.loc?.start.line! - 1] || "",
							},
						});
					}
				}
			},

			DebuggerStatement(path) {
				const node = path.node;

				if (!this.styleConfig.allowDebugger) {
					issues.push({
						id: `style-debugger-${file}-${node.loc?.start.line}`,
						severity: "error",
						category: "style",
						message: "Debugger statement should be removed",
						file,
						line: node.loc?.start.line,
						rule: "style.no-debugger",
						fixable: true,
						autofix: {
							description: "Remove debugger statement",
							operation: "delete",
							target: lines[node.loc?.start.line! - 1] || "",
						},
					});
				}
			},
		});

		return issues;
	}

	private calculateComplexity(path: any): number {
		let complexity = 1; // Base complexity

		path.traverse({
			"IfStatement|ConditionalExpression"() {
				complexity++;
			},
			SwitchCase() {
				complexity++;
			},
			"ForStatement|ForInStatement|ForOfStatement|WhileStatement|DoWhileStatement"() {
				complexity++;
			},
			CatchClause() {
				complexity++;
			},
			LogicalExpression(innerPath: any) {
				if (
					innerPath.node.operator === "&&" ||
					innerPath.node.operator === "||"
				) {
					complexity++;
				}
			},
		});

		return complexity;
	}

	private isReactComponent(path: any): boolean {
		const node = path.node;

		if (
			t.isArrowFunctionExpression(node.init) ||
			t.isFunctionExpression(node.init)
		) {
			// Check if function returns JSX
			let returnsJSX = false;

			path.get("init").traverse({
				ReturnStatement(returnPath: any) {
					if (
						t.isJSXElement(returnPath.node.argument) ||
						t.isJSXFragment(returnPath.node.argument)
					) {
						returnsJSX = true;
					}
				},
			});

			return returnsJSX;
		}

		return false;
	}

	private isReactHook(path: any): boolean {
		const node = path.node;

		if (t.isIdentifier(node.id)) {
			return node.id.name.startsWith("use");
		}

		return false;
	}

	private isPascalCase(name: string): boolean {
		return /^[A-Z][a-zA-Z0-9]*$/.test(name);
	}

	private isCamelCase(name: string): boolean {
		return /^[a-z][a-zA-Z0-9]*$/.test(name);
	}

	private normalizeIndentation(whitespace: string): string {
		const tabCount = (whitespace.match(/\t/g) || []).length;
		const spaceCount = (whitespace.match(/ /g) || []).length;

		// Assume 1 tab = indentSize spaces
		const totalSpaces = tabCount * this.styleConfig.indentSize + spaceCount;

		if (this.styleConfig.indentType === "spaces") {
			return " ".repeat(totalSpaces);
		} else {
			const tabs = Math.floor(totalSpaces / this.styleConfig.indentSize);
			const spaces = totalSpaces % this.styleConfig.indentSize;
			return "\t".repeat(tabs) + " ".repeat(spaces);
		}
	}
}

// Export utility functions
export function createCodeStyleValidator(
	config?: Partial<CodeStyleConfig>,
): CodeStyleValidator {
	return new CodeStyleValidator(config);
}

export function getDefaultStyleConfig(): CodeStyleConfig {
	return {
		maxLineLength: 100,
		maxFunctionLength: 50,
		maxFileLength: 300,
		maxComplexity: 10,
		indentSize: 2,
		indentType: "spaces",
		trailingComma: "always",
		semicolons: "always",
		quotes: "single",
		enforceConsistentNaming: true,
		enforceComponentNaming: true,
		enforceHookNaming: true,
		enforcePropTypes: true,
		enforceReturnTypes: true,
		maxNestingDepth: 4,
		allowConsole: false,
		allowDebugger: false,
		enforceReadonlyProps: true,
	};
}
