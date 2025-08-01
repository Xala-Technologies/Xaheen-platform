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

// Performance validation configuration
export interface PerformanceConfig {
	maxBundleSize: number; // in KB
	maxComponentSize: number; // in lines
	maxRenderTime: number; // in ms
	enforceCodeSplitting: boolean;
	enforceLazyLoading: boolean;
	enforceMemoryOptimization: boolean;
	enforceAssetOptimization: boolean;
	checkRenderOptimization: boolean;
	checkEventListenerOptimization: boolean;
	checkAnimationPerformance: boolean;
	maxEventListeners: number;
	maxDOMQueries: number;
	maxNestedLoops: number;
	enforceWebVitals: boolean;
	maxCLSScore: number;
	maxFCPTime: number; // in ms
	maxLCPTime: number; // in ms
}

// Performance issue types
export type PerformanceIssueType =
	| "bundle-size"
	| "render-performance"
	| "memory-leak"
	| "unnecessary-rerender"
	| "blocking-operation"
	| "inefficient-loop"
	| "dom-manipulation"
	| "asset-optimization"
	| "code-splitting"
	| "lazy-loading"
	| "animation-performance"
	| "event-listener-leak"
	| "web-vitals";

// Performance metrics
export interface PerformanceMetrics {
	bundleSize: number;
	componentComplexity: number;
	renderCount: number;
	memoryUsage: number;
	domQueries: number;
	eventListeners: number;
	asyncOperations: number;
}

// Performance validator implementation
export class PerformanceValidator extends BaseValidator {
	private config: PerformanceConfig;
	private heavyOperations = new Set([
		"setTimeout",
		"setInterval",
		"fetch",
		"XMLHttpRequest",
		"querySelector",
		"querySelectorAll",
		"getElementById",
		"getElementsByClassName",
		"getElementsByTagName",
	]);

	private expensiveReactHooks = new Set([
		"useEffect",
		"useMemo",
		"useCallback",
		"useState",
	]);

	private performanceHints = new Map([
		["React.memo", "Consider memoizing expensive components"],
		["useMemo", "Memoize expensive calculations"],
		["useCallback", "Memoize event handlers"],
		["lazy", "Use React.lazy for code splitting"],
		["Suspense", "Use Suspense for loading states"],
	]);

	constructor(config: Partial<PerformanceConfig> = {}) {
		super({
			rules: [],
			severity: "warning",
			autofix: false,
			exclude: [
				"node_modules/**",
				"dist/**",
				"build/**",
				"**/*.test.ts",
				"**/*.test.tsx",
			],
			include: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
			failFast: false,
			maxIssues: 1000,
		});

		this.config = {
			maxBundleSize: 500, // 500KB
			maxComponentSize: 200, // 200 lines
			maxRenderTime: 16, // 16ms for 60fps
			enforceCodeSplitting: true,
			enforceLazyLoading: true,
			enforceMemoryOptimization: true,
			enforceAssetOptimization: true,
			checkRenderOptimization: true,
			checkEventListenerOptimization: true,
			checkAnimationPerformance: true,
			maxEventListeners: 10,
			maxDOMQueries: 5,
			maxNestedLoops: 3,
			enforceWebVitals: true,
			maxCLSScore: 0.1,
			maxFCPTime: 1800, // 1.8s
			maxLCPTime: 2500, // 2.5s
			...config,
		};
	}

	initializeRules(): void {
		const rules: ValidationRule[] = [
			// Bundle Size Optimization
			createValidationRule(
				"performance.bundle-size",
				"Bundle Size Optimization",
				`Keep bundle size under ${this.config.maxBundleSize}KB`,
				"performance",
				"warning",
				true,
			),
			createValidationRule(
				"performance.code-splitting",
				"Code Splitting",
				"Use code splitting for large components and routes",
				"performance",
				"warning",
				true,
			),

			// Render Optimization
			createValidationRule(
				"performance.render-optimization",
				"Render Optimization",
				"Optimize component rendering for better performance",
				"performance",
				"warning",
				true,
			),
			createValidationRule(
				"performance.unnecessary-rerender",
				"Unnecessary Re-renders",
				"Avoid unnecessary component re-renders",
				"performance",
				"warning",
				true,
			),
			createValidationRule(
				"performance.memo-usage",
				"Memoization Usage",
				"Use React.memo, useMemo, and useCallback for optimization",
				"performance",
				"info",
				true,
			),

			// Memory Optimization
			createValidationRule(
				"performance.memory-optimization",
				"Memory Optimization",
				"Optimize memory usage and prevent memory leaks",
				"performance",
				"error",
				true,
			),
			createValidationRule(
				"performance.event-listener-cleanup",
				"Event Listener Cleanup",
				"Clean up event listeners to prevent memory leaks",
				"performance",
				"error",
				true,
			),

			// DOM Performance
			createValidationRule(
				"performance.dom-queries",
				"DOM Query Optimization",
				`Limit DOM queries to ${this.config.maxDOMQueries} per component`,
				"performance",
				"warning",
				true,
			),
			createValidationRule(
				"performance.dom-manipulation",
				"DOM Manipulation Optimization",
				"Optimize DOM manipulation for better performance",
				"performance",
				"warning",
				true,
			),

			// Loop Performance
			createValidationRule(
				"performance.loop-optimization",
				"Loop Optimization",
				"Optimize loops for better performance",
				"performance",
				"warning",
				true,
			),
			createValidationRule(
				"performance.nested-loops",
				"Nested Loops",
				`Avoid deeply nested loops (max depth: ${this.config.maxNestedLoops})`,
				"performance",
				"warning",
				true,
			),

			// Asset Optimization
			createValidationRule(
				"performance.lazy-loading",
				"Lazy Loading",
				"Use lazy loading for images and heavy components",
				"performance",
				"info",
				true,
			),
			createValidationRule(
				"performance.asset-optimization",
				"Asset Optimization",
				"Optimize assets for better loading performance",
				"performance",
				"warning",
				true,
			),

			// Animation Performance
			createValidationRule(
				"performance.animation-performance",
				"Animation Performance",
				"Use efficient animations that don't block the main thread",
				"performance",
				"warning",
				true,
			),

			// Web Vitals
			createValidationRule(
				"performance.web-vitals",
				"Web Vitals Optimization",
				"Optimize for Core Web Vitals (LCP, FID, CLS)",
				"performance",
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

	async validateFile(file: string, content: string): ValidationIssue[] {
		const issues: ValidationIssue[] = [];

		try {
			// Basic file size check
			const fileSizeKB = Buffer.byteLength(content, "utf8") / 1024;
			if (fileSizeKB > this.config.maxComponentSize) {
				issues.push({
					id: `performance-file-size-${file}`,
					severity: "warning",
					category: "performance",
					message: `File size too large: ${fileSizeKB.toFixed(2)}KB`,
					description: `File exceeds recommended size limit of ${this.config.maxComponentSize / 5}KB`,
					file,
					rule: "performance.bundle-size",
					fixable: false,
				});
			}

			// Skip non-JS/TS files for AST analysis
			if (!this.isJavaScriptFile(file)) {
				return issues;
			}

			// Parse AST for performance analysis
			const ast = this.parseCode(content, file);
			if (ast) {
				// Component size analysis
				issues.push(...this.validateComponentSize(file, ast, content));

				// Render optimization
				if (this.config.checkRenderOptimization) {
					issues.push(...this.validateRenderOptimization(file, ast));
				}

				// Memory optimization
				if (this.config.enforceMemoryOptimization) {
					issues.push(...this.validateMemoryOptimization(file, ast));
				}

				// DOM performance
				issues.push(...this.validateDOMPerformance(file, ast));

				// Loop performance
				issues.push(...this.validateLoopPerformance(file, ast));

				// Event listener optimization
				if (this.config.checkEventListenerOptimization) {
					issues.push(...this.validateEventListeners(file, ast));
				}

				// Code splitting recommendations
				if (this.config.enforceCodeSplitting) {
					issues.push(...this.validateCodeSplitting(file, ast));
				}

				// Lazy loading recommendations
				if (this.config.enforceLazyLoading) {
					issues.push(...this.validateLazyLoading(file, ast));
				}

				// Animation performance
				if (this.config.checkAnimationPerformance) {
					issues.push(...this.validateAnimationPerformance(file, ast));
				}
			}
		} catch (error) {
			logger.error(`Performance validation failed for ${file}:`, error);
			issues.push({
				id: `performance-validation-error-${file}`,
				severity: "error",
				category: "performance",
				message: "Performance validation failed",
				description: error instanceof Error ? error.message : "Unknown error",
				file,
				rule: "performance.validation-error",
				fixable: false,
			});
		}

		return issues;
	}

	private isJavaScriptFile(file: string): boolean {
		return /\.(js|jsx|ts|tsx)$/.test(file);
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
				],
			});
		} catch (error) {
			logger.debug(`Failed to parse ${file}:`, error);
			return null;
		}
	}

	private validateComponentSize(
		file: string,
		ast: t.File,
		content: string,
	): ValidationIssue[] {
		const issues: ValidationIssue[] = [];
		const lines = content.split("\n").length;

		if (lines > this.config.maxComponentSize) {
			issues.push({
				id: `performance-component-size-${file}`,
				severity: "warning",
				category: "performance",
				message: `Component too large: ${lines} lines`,
				description: `Component exceeds recommended size of ${this.config.maxComponentSize} lines`,
				file,
				rule: "performance.render-optimization",
				fixable: false,
			});
		}

		return issues;
	}

	private validateRenderOptimization(
		file: string,
		ast: t.File,
	): ValidationIssue[] {
		const issues: ValidationIssue[] = [];

		traverse(ast, {
			// Check for React components that could benefit from memoization
			VariableDeclarator(path) {
				if (this.isReactComponent(path)) {
					const componentName = this.getComponentName(path);
					if (componentName) {
						// Check if component is wrapped with React.memo
						const isMemoized = this.isComponentMemoized(path);
						const hasComplexProps = this.hasComplexProps(path);

						if (!isMemoized && hasComplexProps) {
							issues.push({
								id: `performance-memo-suggestion-${file}-${path.node.loc?.start.line}`,
								severity: "info",
								category: "performance",
								message: `Consider memoizing component ${componentName}`,
								description: "Component with complex props should be memoized",
								file,
								line: path.node.loc?.start.line,
								rule: "performance.memo-usage",
								fixable: false,
							});
						}
					}
				}
			},

			// Check for missing useMemo on expensive calculations
			CallExpression(path) {
				const node = path.node;

				if (this.isExpensiveCalculation(node)) {
					const isInUseMemo = this.isWrappedInUseMemo(path);

					if (!isInUseMemo) {
						issues.push({
							id: `performance-usememo-suggestion-${file}-${node.loc?.start.line}`,
							severity: "info",
							category: "performance",
							message: "Consider wrapping expensive calculation in useMemo",
							description: "Expensive calculations should be memoized",
							file,
							line: node.loc?.start.line,
							rule: "performance.memo-usage",
							fixable: false,
						});
					}
				}
			},

			// Check for missing useCallback on event handlers
			ArrowFunctionExpression(path) {
				if (this.isEventHandler(path)) {
					const isInUseCallback = this.isWrappedInUseCallback(path);

					if (!isInUseCallback) {
						issues.push({
							id: `performance-usecallback-suggestion-${file}-${path.node.loc?.start.line}`,
							severity: "info",
							category: "performance",
							message: "Consider wrapping event handler in useCallback",
							description:
								"Event handlers should be memoized to prevent unnecessary re-renders",
							file,
							line: path.node.loc?.start.line,
							rule: "performance.memo-usage",
							fixable: false,
						});
					}
				}
			},
		});

		return issues;
	}

	private validateMemoryOptimization(
		file: string,
		ast: t.File,
	): ValidationIssue[] {
		const issues: ValidationIssue[] = [];

		traverse(ast, {
			// Check for potential memory leaks in useEffect
			CallExpression(path) {
				const node = path.node;

				if (t.isIdentifier(node.callee) && node.callee.name === "useEffect") {
					const effectCallback = node.arguments[0];

					if (
						t.isArrowFunctionExpression(effectCallback) ||
						t.isFunctionExpression(effectCallback)
					) {
						const hasCleanup = this.hasCleanupFunction(effectCallback);
						const hasAsyncOperations = this.hasAsyncOperations(effectCallback);

						if (hasAsyncOperations && !hasCleanup) {
							issues.push({
								id: `performance-missing-cleanup-${file}-${node.loc?.start.line}`,
								severity: "error",
								category: "performance",
								message: "useEffect with async operations missing cleanup",
								description:
									"Effects with async operations should return cleanup functions",
								file,
								line: node.loc?.start.line,
								rule: "performance.memory-optimization",
								fixable: false,
							});
						}
					}
				}

				// Check for addEventListener without cleanup
				if (
					t.isMemberExpression(node.callee) &&
					t.isIdentifier(node.callee.property) &&
					node.callee.property.name === "addEventListener"
				) {
					issues.push({
						id: `performance-event-listener-cleanup-${file}-${node.loc?.start.line}`,
						severity: "warning",
						category: "performance",
						message: "Event listener may need cleanup",
						description:
							"Ensure event listeners are removed in cleanup function",
						file,
						line: node.loc?.start.line,
						rule: "performance.event-listener-cleanup",
						fixable: false,
					});
				}
			},
		});

		return issues;
	}

	private validateDOMPerformance(file: string, ast: t.File): ValidationIssue[] {
		const issues: ValidationIssue[] = [];
		let domQueryCount = 0;

		traverse(ast, {
			// Count DOM queries
			CallExpression(path) {
				const node = path.node;

				if (
					t.isMemberExpression(node.callee) &&
					t.isIdentifier(node.callee.property)
				) {
					const methodName = node.callee.property.name;

					if (this.heavyOperations.has(methodName)) {
						domQueryCount++;

						// Check for querySelector in loops
						if (this.isInLoop(path) && methodName.includes("querySelector")) {
							issues.push({
								id: `performance-dom-query-in-loop-${file}-${node.loc?.start.line}`,
								severity: "warning",
								category: "performance",
								message: "DOM query inside loop",
								description:
									"DOM queries inside loops can cause performance issues",
								file,
								line: node.loc?.start.line,
								rule: "performance.dom-queries",
								fixable: false,
							});
						}
					}
				}
			},
		});

		// Check total DOM query count
		if (domQueryCount > this.config.maxDOMQueries) {
			issues.push({
				id: `performance-excessive-dom-queries-${file}`,
				severity: "warning",
				category: "performance",
				message: `Too many DOM queries: ${domQueryCount}`,
				description: `Reduce DOM queries to improve performance (max: ${this.config.maxDOMQueries})`,
				file,
				rule: "performance.dom-queries",
				fixable: false,
			});
		}

		return issues;
	}

	private validateLoopPerformance(
		file: string,
		ast: t.File,
	): ValidationIssue[] {
		const issues: ValidationIssue[] = [];

		traverse(ast, {
			// Check for nested loops
			"ForStatement|WhileStatement|DoWhileStatement|ForInStatement|ForOfStatement"(
				path,
			) {
				const nestedLevel = this.getNestedLoopLevel(path);

				if (nestedLevel > this.config.maxNestedLoops) {
					issues.push({
						id: `performance-deeply-nested-loops-${file}-${path.node.loc?.start.line}`,
						severity: "warning",
						category: "performance",
						message: `Deeply nested loops: ${nestedLevel} levels`,
						description:
							"Consider optimizing deeply nested loops for better performance",
						file,
						line: path.node.loc?.start.line,
						rule: "performance.nested-loops",
						fixable: false,
					});
				}

				// Check for expensive operations in loops
				path.traverse({
					CallExpression(innerPath) {
						const node = innerPath.node;

						if (this.isExpensiveOperation(node)) {
							issues.push({
								id: `performance-expensive-operation-in-loop-${file}-${node.loc?.start.line}`,
								severity: "warning",
								category: "performance",
								message: "Expensive operation inside loop",
								description:
									"Move expensive operations outside loops when possible",
								file,
								line: node.loc?.start.line,
								rule: "performance.loop-optimization",
								fixable: false,
							});
						}
					},
				});
			},
		});

		return issues;
	}

	private validateEventListeners(file: string, ast: t.File): ValidationIssue[] {
		const issues: ValidationIssue[] = [];
		let eventListenerCount = 0;

		traverse(ast, {
			// Count event listeners
			CallExpression(path) {
				const node = path.node;

				if (
					t.isMemberExpression(node.callee) &&
					t.isIdentifier(node.callee.property) &&
					node.callee.property.name === "addEventListener"
				) {
					eventListenerCount++;

					// Check for passive event listeners on scroll/touch events
					const eventType = node.arguments[0];
					if (t.isStringLiteral(eventType)) {
						const passiveEvents = [
							"scroll",
							"touchstart",
							"touchmove",
							"wheel",
						];

						if (passiveEvents.includes(eventType.value)) {
							const options = node.arguments[2];
							const isPassive = this.isPassiveEventListener(options);

							if (!isPassive) {
								issues.push({
									id: `performance-passive-event-listener-${file}-${node.loc?.start.line}`,
									severity: "warning",
									category: "performance",
									message: `Consider using passive event listener for ${eventType.value}`,
									description:
										"Passive event listeners improve scroll performance",
									file,
									line: node.loc?.start.line,
									rule: "performance.event-listener-optimization",
									fixable: false,
								});
							}
						}
					}
				}
			},
		});

		// Check total event listener count
		if (eventListenerCount > this.config.maxEventListeners) {
			issues.push({
				id: `performance-excessive-event-listeners-${file}`,
				severity: "warning",
				category: "performance",
				message: `Too many event listeners: ${eventListenerCount}`,
				description: `Consider reducing event listeners (max: ${this.config.maxEventListeners})`,
				file,
				rule: "performance.event-listener-cleanup",
				fixable: false,
			});
		}

		return issues;
	}

	private validateCodeSplitting(file: string, ast: t.File): ValidationIssue[] {
		const issues: ValidationIssue[] = [];

		traverse(ast, {
			// Check for large imports that could be code-split
			ImportDeclaration(path) {
				const node = path.node;

				if (t.isStringLiteral(node.source)) {
					const importPath = node.source.value;

					// Check for large library imports
					const largeLibraries = ["moment", "lodash", "antd", "material-ui"];

					if (largeLibraries.some((lib) => importPath.includes(lib))) {
						issues.push({
							id: `performance-large-import-${file}-${node.loc?.start.line}`,
							severity: "info",
							category: "performance",
							message: `Consider code splitting for large library: ${importPath}`,
							description:
								"Large libraries should be code-split or tree-shaken",
							file,
							line: node.loc?.start.line,
							rule: "performance.code-splitting",
							fixable: false,
						});
					}
				}
			},

			// Check for components that could benefit from React.lazy
			VariableDeclarator(path) {
				if (this.isReactComponent(path)) {
					const componentName = this.getComponentName(path);

					if (componentName && this.isLargeComponent(path)) {
						const isLazyLoaded = this.isLazyLoadedComponent(path);

						if (!isLazyLoaded) {
							issues.push({
								id: `performance-lazy-loading-suggestion-${file}-${path.node.loc?.start.line}`,
								severity: "info",
								category: "performance",
								message: `Consider lazy loading large component: ${componentName}`,
								description: "Large components should be lazy-loaded",
								file,
								line: path.node.loc?.start.line,
								rule: "performance.code-splitting",
								fixable: false,
							});
						}
					}
				}
			},
		});

		return issues;
	}

	private validateLazyLoading(file: string, ast: t.File): ValidationIssue[] {
		const issues: ValidationIssue[] = [];

		traverse(ast, {
			// Check for images without lazy loading
			JSXElement(path) {
				const node = path.node;

				if (this.isImageElement(node)) {
					const hasLazyLoading = this.hasLazyLoadingAttribute(node);

					if (!hasLazyLoading) {
						issues.push({
							id: `performance-image-lazy-loading-${file}-${node.loc?.start.line}`,
							severity: "info",
							category: "performance",
							message: "Consider adding lazy loading to images",
							description:
								"Images should use lazy loading for better performance",
							file,
							line: node.loc?.start.line,
							rule: "performance.lazy-loading",
							fixable: true,
							autofix: {
								description: 'Add loading="lazy" attribute',
								operation: "insert",
								target: "img",
								replacement: 'img loading="lazy"',
							},
						});
					}
				}
			},
		});

		return issues;
	}

	private validateAnimationPerformance(
		file: string,
		ast: t.File,
	): ValidationIssue[] {
		const issues: ValidationIssue[] = [];

		traverse(ast, {
			// Check for CSS animations that might cause layout thrashing
			StringLiteral(path) {
				const node = path.node;

				if (
					node.value.includes("transition") ||
					node.value.includes("animation")
				) {
					const hasLayoutProperties = this.hasLayoutProperties(node.value);

					if (hasLayoutProperties) {
						issues.push({
							id: `performance-layout-animation-${file}-${node.loc?.start.line}`,
							severity: "warning",
							category: "performance",
							message: "Animation may cause layout thrashing",
							description:
								"Avoid animating layout properties (width, height, position)",
							file,
							line: node.loc?.start.line,
							rule: "performance.animation-performance",
							fixable: false,
						});
					}
				}
			},

			// Check for requestAnimationFrame usage
			CallExpression(path) {
				const node = path.node;

				if (t.isIdentifier(node.callee) && node.callee.name === "setInterval") {
					issues.push({
						id: `performance-setinterval-animation-${file}-${node.loc?.start.line}`,
						severity: "warning",
						category: "performance",
						message:
							"Consider using requestAnimationFrame instead of setInterval",
						description:
							"requestAnimationFrame provides better animation performance",
						file,
						line: node.loc?.start.line,
						rule: "performance.animation-performance",
						fixable: false,
					});
				}
			},
		});

		return issues;
	}

	// Helper methods
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

	private getComponentName(path: any): string | null {
		const node = path.node;

		if (t.isIdentifier(node.id)) {
			return node.id.name;
		}

		return null;
	}

	private isComponentMemoized(path: any): boolean {
		// Check if component is wrapped with React.memo
		const parent = path.parentPath;

		if (
			t.isCallExpression(parent.node) &&
			t.isMemberExpression(parent.node.callee)
		) {
			const object = parent.node.callee.object;
			const property = parent.node.callee.property;

			return (
				t.isIdentifier(object) &&
				object.name === "React" &&
				t.isIdentifier(property) &&
				property.name === "memo"
			);
		}

		return false;
	}

	private hasComplexProps(path: any): boolean {
		// Simple heuristic: check for object/array props
		let hasComplexProps = false;

		path.traverse({
			JSXAttribute(innerPath: any) {
				const value = innerPath.node.value;

				if (t.isJSXExpressionContainer(value)) {
					const expression = value.expression;

					if (
						t.isObjectExpression(expression) ||
						t.isArrayExpression(expression)
					) {
						hasComplexProps = true;
					}
				}
			},
		});

		return hasComplexProps;
	}

	private isExpensiveCalculation(node: t.CallExpression): boolean {
		// Heuristic: check for functions that might be expensive
		const expensiveOperations = [
			"sort",
			"filter",
			"map",
			"reduce",
			"find",
			"some",
			"every",
			"JSON.parse",
			"JSON.stringify",
			"parseInt",
			"parseFloat",
		];

		if (
			t.isMemberExpression(node.callee) &&
			t.isIdentifier(node.callee.property)
		) {
			return expensiveOperations.includes(node.callee.property.name);
		}

		if (t.isIdentifier(node.callee)) {
			return expensiveOperations.includes(node.callee.name);
		}

		return false;
	}

	private isWrappedInUseMemo(path: any): boolean {
		// Check if the call is inside a useMemo
		let parent = path.parentPath;

		while (parent) {
			if (
				t.isCallExpression(parent.node) &&
				t.isIdentifier(parent.node.callee) &&
				parent.node.callee.name === "useMemo"
			) {
				return true;
			}
			parent = parent.parentPath;
		}

		return false;
	}

	private isEventHandler(path: any): boolean {
		// Check if this is an event handler (onClick, onChange, etc.)
		const parent = path.parent;

		if (t.isJSXExpressionContainer(parent)) {
			const grandParent = path.parentPath.parent;

			if (
				t.isJSXAttribute(grandParent) &&
				t.isJSXIdentifier(grandParent.name)
			) {
				const attrName = grandParent.name.name;
				return (
					attrName.startsWith("on") &&
					attrName.charAt(2) === attrName.charAt(2).toUpperCase()
				);
			}
		}

		return false;
	}

	private isWrappedInUseCallback(path: any): boolean {
		// Check if the function is inside a useCallback
		let parent = path.parentPath;

		while (parent) {
			if (
				t.isCallExpression(parent.node) &&
				t.isIdentifier(parent.node.callee) &&
				parent.node.callee.name === "useCallback"
			) {
				return true;
			}
			parent = parent.parentPath;
		}

		return false;
	}

	private hasCleanupFunction(
		func: t.ArrowFunctionExpression | t.FunctionExpression,
	): boolean {
		// Check if the function returns a cleanup function
		let hasCleanup = false;

		if (t.isBlockStatement(func.body)) {
			func.body.body.forEach((statement) => {
				if (
					t.isReturnStatement(statement) &&
					(t.isArrowFunctionExpression(statement.argument) ||
						t.isFunctionExpression(statement.argument))
				) {
					hasCleanup = true;
				}
			});
		}

		return hasCleanup;
	}

	private hasAsyncOperations(
		func: t.ArrowFunctionExpression | t.FunctionExpression,
	): boolean {
		// Check for async operations like fetch, setTimeout, etc.
		let hasAsync = false;

		const checkNode = (node: t.Node) => {
			if (t.isCallExpression(node)) {
				if (t.isIdentifier(node.callee)) {
					const name = node.callee.name;
					if (
						["setTimeout", "setInterval", "fetch", "addEventListener"].includes(
							name,
						)
					) {
						hasAsync = true;
					}
				}
			}
		};

		if (t.isBlockStatement(func.body)) {
			func.body.body.forEach((statement) => {
				traverse.traverse(statement, {
					enter: checkNode,
				});
			});
		}

		return hasAsync;
	}

	private isInLoop(path: any): boolean {
		let parent = path.parentPath;

		while (parent) {
			const node = parent.node;

			if (
				t.isForStatement(node) ||
				t.isWhileStatement(node) ||
				t.isDoWhileStatement(node) ||
				t.isForInStatement(node) ||
				t.isForOfStatement(node)
			) {
				return true;
			}

			parent = parent.parentPath;
		}

		return false;
	}

	private getNestedLoopLevel(path: any): number {
		let level = 1;
		let parent = path.parentPath;

		while (parent) {
			const node = parent.node;

			if (
				t.isForStatement(node) ||
				t.isWhileStatement(node) ||
				t.isDoWhileStatement(node) ||
				t.isForInStatement(node) ||
				t.isForOfStatement(node)
			) {
				level++;
			}

			parent = parent.parentPath;
		}

		return level;
	}

	private isExpensiveOperation(node: t.CallExpression): boolean {
		const expensiveOps = [
			"JSON.parse",
			"JSON.stringify",
			"parseInt",
			"parseFloat",
		];

		if (t.isMemberExpression(node.callee)) {
			const objName = t.isIdentifier(node.callee.object)
				? node.callee.object.name
				: "";
			const propName = t.isIdentifier(node.callee.property)
				? node.callee.property.name
				: "";

			return expensiveOps.includes(`${objName}.${propName}`);
		}

		return false;
	}

	private isPassiveEventListener(options: t.Node | undefined): boolean {
		if (!options) return false;

		if (t.isObjectExpression(options)) {
			return options.properties.some((prop) => {
				if (
					t.isObjectProperty(prop) &&
					t.isIdentifier(prop.key) &&
					prop.key.name === "passive"
				) {
					return t.isBooleanLiteral(prop.value) && prop.value.value === true;
				}
				return false;
			});
		}

		return false;
	}

	private isLargeComponent(path: any): boolean {
		// Simple heuristic: check component body size
		const init = path.node.init;

		if (t.isArrowFunctionExpression(init) || t.isFunctionExpression(init)) {
			const body = init.body;

			if (t.isBlockStatement(body)) {
				return body.body.length > 20; // More than 20 statements
			}
		}

		return false;
	}

	private isLazyLoadedComponent(path: any): boolean {
		// Check if component is wrapped with React.lazy
		const parent = path.parentPath;

		if (
			t.isCallExpression(parent.node) &&
			t.isMemberExpression(parent.node.callee)
		) {
			const object = parent.node.callee.object;
			const property = parent.node.callee.property;

			return (
				t.isIdentifier(object) &&
				object.name === "React" &&
				t.isIdentifier(property) &&
				property.name === "lazy"
			);
		}

		return false;
	}

	private isImageElement(node: t.JSXElement): boolean {
		return (
			t.isJSXIdentifier(node.openingElement.name) &&
			node.openingElement.name.name === "img"
		);
	}

	private hasLazyLoadingAttribute(node: t.JSXElement): boolean {
		return (
			node.openingElement.attributes?.some((attr) => {
				return (
					t.isJSXAttribute(attr) &&
					t.isJSXIdentifier(attr.name) &&
					attr.name.name === "loading" &&
					t.isStringLiteral(attr.value) &&
					attr.value.value === "lazy"
				);
			}) || false
		);
	}

	private hasLayoutProperties(cssText: string): boolean {
		const layoutProperties = [
			"width",
			"height",
			"padding",
			"margin",
			"border",
			"top",
			"left",
			"right",
			"bottom",
			"position",
		];

		return layoutProperties.some((prop) => cssText.includes(prop));
	}
}

// Export utility functions
export function createPerformanceValidator(
	config?: Partial<PerformanceConfig>,
): PerformanceValidator {
	return new PerformanceValidator(config);
}

export function getDefaultPerformanceConfig(): PerformanceConfig {
	return {
		maxBundleSize: 500,
		maxComponentSize: 200,
		maxRenderTime: 16,
		enforceCodeSplitting: true,
		enforceLazyLoading: true,
		enforceMemoryOptimization: true,
		enforceAssetOptimization: true,
		checkRenderOptimization: true,
		checkEventListenerOptimization: true,
		checkAnimationPerformance: true,
		maxEventListeners: 10,
		maxDOMQueries: 5,
		maxNestedLoops: 3,
		enforceWebVitals: true,
		maxCLSScore: 0.1,
		maxFCPTime: 1800,
		maxLCPTime: 2500,
	};
}
