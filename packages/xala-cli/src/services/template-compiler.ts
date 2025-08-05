/**
 * @fileoverview Template Compiler with Validation Integration
 * @description Enhanced template compilation with built-in validation system
 * @version 5.0.0
 * @compliance WCAG AAA, NSM, CVA Pattern, TypeScript Strict
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, extname, join, resolve } from "path";
import { logger } from "../utils/logger.js";
import {
	ComplianceValidator,
	ValidationResult,
} from "./compliance-validator.js";
import { TemplateContext, TemplateEngine } from "./template-engine.js";
import {
	TemplateValidationResult,
	TemplateValidator,
} from "./template-validator.js";

export interface CompilationOptions {
	readonly validateBefore: boolean;
	readonly validateAfter: boolean;
	readonly strict: boolean;
	readonly autofix: boolean;
	readonly outputDir?: string;
	readonly format?: "tsx" | "vue" | "svelte" | "angular";
}

export interface CompilationResult {
	readonly success: boolean;
	readonly filePath: string;
	readonly outputPath: string;
	readonly compiledContent: string;
	readonly validationResults: {
		readonly before: TemplateValidationResult | undefined;
		readonly after: TemplateValidationResult | undefined;
		readonly compliance: ValidationResult | undefined;
	};
	readonly errors: ReadonlyArray<string>;
	readonly warnings: ReadonlyArray<string>;
	readonly performance: {
		readonly compilationTime: number;
		readonly validationTime: number;
		readonly totalTime: number;
	};
}

export class TemplateCompiler {
	private readonly templateEngine: TemplateEngine;
	private readonly templateValidator: TemplateValidator;
	private readonly complianceValidator: ComplianceValidator;

	constructor() {
		this.templateEngine = new TemplateEngine();
		this.templateValidator = new TemplateValidator();
		this.complianceValidator = new ComplianceValidator();
	}

	async compileTemplate(
		templatePath: string,
		context: TemplateContext,
		options: CompilationOptions = {
			validateBefore: true,
			validateAfter: true,
			strict: false,
			autofix: false,
		},
	): Promise<CompilationResult> {
		const startTime = Date.now();
		let validationTime = 0;
		let compilationTime = 0;

		const errors: string[] = [];
		const warnings: string[] = [];
		let validationResults: CompilationResult["validationResults"] = {
			before: undefined,
			after: undefined,
			compliance: undefined,
		};

		logger.info(`🔨 Compiling template: ${templatePath}`);

		try {
			// Pre-compilation validation
			if (options.validateBefore) {
				const validationStart = Date.now();
				const beforeResult =
					await this.templateValidator.validateTemplate(templatePath);
				validationResults = { ...validationResults, before: beforeResult };

				if (!beforeResult.isValid && options.strict) {
					errors.push("Template validation failed before compilation");
					beforeResult.violations.forEach((v) => {
						if (v.severity === "error") {
							errors.push(`${v.rule}: ${v.message}`);
						} else {
							warnings.push(`${v.rule}: ${v.message}`);
						}
					});

					// Early return if strict mode and validation fails
					return this.createFailureResult(
						templatePath,
						errors,
						warnings,
						validationResults,
						Date.now() - startTime,
						0,
						Date.now() - validationStart,
					);
				}

				validationTime += Date.now() - validationStart;
				logger.info(
					`✅ Pre-compilation validation completed (Score: ${beforeResult.score}%)`,
				);
			}

			// Template compilation
			const compilationStart = Date.now();
			const compiledContent = await this.performCompilation(
				templatePath,
				context,
				options,
			);
			compilationTime = Date.now() - compilationStart;

			// Determine output path
			const outputPath = this.determineOutputPath(templatePath, options);

			// Ensure output directory exists
			const outputDir = dirname(outputPath);
			if (!existsSync(outputDir)) {
				mkdirSync(outputDir, { recursive: true });
			}

			// Write compiled content
			writeFileSync(outputPath, compiledContent);
			logger.info(`📁 Compiled template written to: ${outputPath}`);

			// Post-compilation validation
			if (options.validateAfter) {
				const validationStart = Date.now();

				// Write temporary file for validation
				const tempPath = outputPath + ".temp";
				writeFileSync(tempPath, compiledContent);

				try {
					const afterResult =
						await this.templateValidator.validateTemplate(tempPath);

					// Run compliance validation on compiled output
					const complianceResult = await this.complianceValidator.validateCode(
						compiledContent,
						this.detectPlatform(
							options.format || this.detectFormatFromPath(outputPath),
						),
					);

					validationResults = {
						...validationResults,
						after: afterResult,
						compliance: complianceResult,
					};

					// Apply auto-fixes if requested and possible
					if (options.autofix && !afterResult.isValid) {
						const fixedContent = await this.applyAutoFixes(
							compiledContent,
							afterResult,
						);
						if (fixedContent !== compiledContent) {
							writeFileSync(outputPath, fixedContent);
							logger.info(`🔧 Applied auto-fixes to compiled template`);

							// Re-validate after fixes
							writeFileSync(tempPath, fixedContent);
							const revalidatedResult =
								await this.templateValidator.validateTemplate(tempPath);
							validationResults = {
								...validationResults,
								after: revalidatedResult,
							};
						}
					}
				} finally {
					// Clean up temp file
					if (existsSync(tempPath)) {
						await import("fs").then((fs) => fs.promises.unlink(tempPath));
					}
				}

				validationTime += Date.now() - validationStart;
				if (validationResults.after) {
					logger.info(
						`✅ Post-compilation validation completed (Score: ${validationResults.after.score}%)`,
					);
				}
			}

			const totalTime = Date.now() - startTime;

			// Check final validation results
			const hasPostValidationErrors =
				validationResults.after !== undefined &&
				!validationResults.after.isValid &&
				validationResults.after.violations.some((v) => v.severity === "error");

			if (
				hasPostValidationErrors &&
				options.strict &&
				validationResults.after
			) {
				errors.push("Compiled template failed validation");
				validationResults.after.violations.forEach((v) => {
					if (v.severity === "error") {
						errors.push(`${v.rule}: ${v.message}`);
					}
				});
			}

			// Collect warnings
			if (validationResults.after) {
				validationResults.after.warnings.forEach((w) => {
					warnings.push(`${w.rule}: ${w.message}`);
				});
			}

			const success = errors.length === 0;

			if (success) {
				logger.info(
					`✅ Template compilation completed successfully in ${totalTime}ms`,
				);
			} else {
				logger.warn(
					`⚠️ Template compilation completed with errors in ${totalTime}ms`,
				);
			}

			return {
				success,
				filePath: templatePath,
				outputPath,
				compiledContent,
				validationResults,
				errors,
				warnings,
				performance: {
					compilationTime,
					validationTime,
					totalTime,
				},
			};
		} catch (error) {
			const totalTime = Date.now() - startTime;
			errors.push(`Compilation failed: ${error}`);
			logger.error(`❌ Template compilation failed: ${error}`);

			return this.createFailureResult(
				templatePath,
				errors,
				warnings,
				validationResults,
				totalTime,
				compilationTime,
				validationTime,
			);
		}
	}

	async compileBatch(
		templatePaths: ReadonlyArray<string>,
		contexts: ReadonlyArray<TemplateContext>,
		options: CompilationOptions = {
			validateBefore: true,
			validateAfter: true,
			strict: false,
			autofix: false,
		},
	): Promise<ReadonlyArray<CompilationResult>> {
		logger.info(`🔨 Compiling ${templatePaths.length} templates in batch`);

		const results: CompilationResult[] = [];

		for (let i = 0; i < templatePaths.length; i++) {
			const templatePath = templatePaths[i];
			const context = contexts[i] || {};

			try {
				const result = await this.compileTemplate(
					templatePath,
					context,
					options,
				);
				results.push(result);
			} catch (error) {
				logger.error(`Failed to compile template ${templatePath}:`, error);
				results.push(
					this.createFailureResult(
						templatePath,
						[`Compilation failed: ${error}`],
						[],
						{},
						0,
						0,
						0,
					),
				);
			}
		}

		const successCount = results.filter((r) => r.success).length;
		const failureCount = results.length - successCount;

		logger.info(
			`✅ Batch compilation completed: ${successCount} success, ${failureCount} failures`,
		);

		return results;
	}

	private async performCompilation(
		templatePath: string,
		context: TemplateContext,
		options: CompilationOptions,
	): Promise<string> {
		logger.debug(
			`Compiling template with context keys: ${Object.keys(context).join(", ")}`,
		);

		// Add enhanced context for validation-aware compilation
		const enhancedContext = {
			...context,
			__validation: {
				strict: options.strict,
				autofix: options.autofix,
				format: options.format || this.detectFormatFromPath(templatePath),
			},
			__meta: {
				compiledAt: new Date().toISOString(),
				version: "5.0.0",
				compliance: ["WCAG AAA", "NSM", "CVA Pattern", "TypeScript Strict"],
			},
		};

		return this.templateEngine.render(templatePath, enhancedContext);
	}

	private determineOutputPath(
		templatePath: string,
		options: CompilationOptions,
	): string {
		const baseName = templatePath.replace(/\.hbs$/, "");
		const extension = this.getExtensionForFormat(
			options.format || this.detectFormatFromPath(templatePath),
		);

		if (options.outputDir) {
			const fileName = (baseName.split("/").pop() || "template") + extension;
			return join(options.outputDir, fileName);
		}

		return baseName + extension;
	}

	private detectFormatFromPath(filePath: string): string {
		const dir = dirname(filePath);

		if (dir.includes("react")) return "tsx";
		if (dir.includes("vue")) return "vue";
		if (dir.includes("angular")) return "angular";
		if (dir.includes("svelte")) return "svelte";

		return "tsx"; // Default to React/TypeScript
	}

	private detectPlatform(format: string): string {
		switch (format) {
			case "tsx":
				return "react";
			case "vue":
				return "vue";
			case "angular":
				return "angular";
			case "svelte":
				return "svelte";
			default:
				return "react";
		}
	}

	private getExtensionForFormat(format: string): string {
		switch (format) {
			case "tsx":
				return ".tsx";
			case "vue":
				return ".vue";
			case "angular":
				return ".component.ts";
			case "svelte":
				return ".svelte";
			default:
				return ".tsx";
		}
	}

	private async applyAutoFixes(
		content: string,
		validationResult: TemplateValidationResult,
	): Promise<string> {
		let fixedContent = content;

		// Apply simple auto-fixes
		for (const violation of validationResult.violations) {
			switch (violation.rule) {
				case "no-raw-html":
					// Replace common HTML elements with semantic components
					fixedContent = fixedContent
						.replace(/<div/g, "<Container")
						.replace(/<\/div>/g, "</Container>")
						.replace(/<span/g, '<Typography variant="span"')
						.replace(/<\/span>/g, "</Typography>")
						.replace(/<button/g, "<Button")
						.replace(/<\/button>/g, "</Button>");
					break;

				case "aria-attributes":
					// Add basic ARIA labels where missing
					fixedContent = fixedContent
						.replace(/<Button([^>]*)>/g, '<Button$1 ariaLabel="Button">')
						.replace(/<Input([^>]*)>/g, '<Input$1 ariaLabel="Input field">');
					break;

				case "design-token-usage":
					// Replace hardcoded colors with semantic classes
					fixedContent = fixedContent
						.replace(/bg-blue-500/g, "bg-primary")
						.replace(/text-gray-900/g, "text-foreground")
						.replace(/text-gray-600/g, "text-muted-foreground");
					break;
			}
		}

		return fixedContent;
	}

	private createFailureResult(
		filePath: string,
		errors: ReadonlyArray<string>,
		warnings: ReadonlyArray<string>,
		validationResults: CompilationResult["validationResults"],
		totalTime: number,
		compilationTime: number,
		validationTime: number,
	): CompilationResult {
		return {
			success: false,
			filePath,
			outputPath: "",
			compiledContent: "",
			validationResults,
			errors,
			warnings,
			performance: {
				compilationTime,
				validationTime,
				totalTime,
			},
		};
	}

	// Public method to validate a template without compilation
	async validateOnly(templatePath: string): Promise<TemplateValidationResult> {
		return this.templateValidator.validateTemplate(templatePath);
	}

	// Public method to get validation statistics
	getValidationStats(results: ReadonlyArray<CompilationResult>): {
		readonly totalTemplates: number;
		readonly validTemplates: number;
		readonly averageScore: number;
		readonly commonViolations: ReadonlyArray<{ rule: string; count: number }>;
	} {
		const validationResults = results
			.map((r) => r.validationResults.after)
			.filter((v): v is TemplateValidationResult => v !== undefined);

		const totalTemplates = validationResults.length;
		const validTemplates = validationResults.filter((v) => v.isValid).length;
		const averageScore =
			totalTemplates > 0
				? Math.round(
						validationResults.reduce((sum, v) => sum + v.score, 0) /
							totalTemplates,
					)
				: 0;

		// Collect violation statistics
		const violationCounts = new Map<string, number>();
		validationResults.forEach((result) => {
			result.violations.forEach((violation) => {
				const current = violationCounts.get(violation.rule) || 0;
				violationCounts.set(violation.rule, current + 1);
			});
		});

		const commonViolations = Array.from(violationCounts.entries())
			.map(([rule, count]) => ({ rule, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);

		return {
			totalTemplates,
			validTemplates,
			averageScore,
			commonViolations,
		};
	}
}
