/**
 * AI-Powered Code Refactoring Assistant
 * Provides context-aware code refactoring suggestions with interactive preview
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";
import { z } from "zod";

/**
 * Refactoring suggestion interface
 */
export interface RefactoringSuggestion {
	readonly id: string;
	readonly type:
		| "extract-function"
		| "rename-variable"
		| "simplify-condition"
		| "remove-duplication"
		| "optimize-imports";
	readonly title: string;
	readonly description: string;
	readonly filePath: string;
	readonly startLine: number;
	readonly endLine: number;
	readonly originalCode: string;
	readonly suggestedCode: string;
	readonly confidence: number;
	readonly reasoning: string;
	readonly impact: "low" | "medium" | "high";
}

/**
 * Refactoring result interface
 */
export interface RefactoringResult {
	success: boolean;
	readonly appliedSuggestions: RefactoringSuggestion[];
	readonly rejectedSuggestions: RefactoringSuggestion[];
	readonly errors: string[];
	gitCommitHash?: string;
}

/**
 * Developer feedback interface for continuous learning
 */
export interface DeveloperFeedback {
	readonly suggestionId: string;
	readonly action: "accepted" | "rejected" | "modified";
	readonly timestamp: Date;
	readonly reason?: string;
	readonly modifiedCode?: string;
}

/**
 * AI-powered code refactoring assistant
 */
export class AIRefactoringAssistant {
	private readonly projectPath: string;
	private readonly feedbackHistory: DeveloperFeedback[] = [];

	constructor(projectPath: string) {
		this.projectPath = projectPath;
	}

	/**
	 * Analyze code and generate refactoring suggestions
	 */
	public async generateSuggestions(
		filePath: string,
	): Promise<RefactoringSuggestion[]> {
		try {
			const fullPath = join(this.projectPath, filePath);
			const code = await readFile(fullPath, "utf-8");

			const suggestions: RefactoringSuggestion[] = [];

			// Analyze for common refactoring opportunities
			suggestions.push(
				...(await this.analyzeForFunctionExtraction(filePath, code)),
			);
			suggestions.push(
				...(await this.analyzeForVariableRenaming(filePath, code)),
			);
			suggestions.push(
				...(await this.analyzeForConditionSimplification(filePath, code)),
			);
			suggestions.push(
				...(await this.analyzeForDuplicationRemoval(filePath, code)),
			);
			suggestions.push(
				...(await this.analyzeForImportOptimization(filePath, code)),
			);

			// Sort by confidence and impact
			return suggestions.sort((a, b) => {
				const impactWeight = { high: 3, medium: 2, low: 1 };
				return (
					b.confidence * impactWeight[b.impact] -
					a.confidence * impactWeight[a.impact]
				);
			});
		} catch (error) {
			console.error(`Failed to generate suggestions for ${filePath}:`, error);
			return [];
		}
	}

	/**
	 * Preview refactoring changes interactively
	 */
	public async previewRefactoring(
		suggestion: RefactoringSuggestion,
	): Promise<string> {
		const preview = `
=== Refactoring Preview ===
File: ${suggestion.filePath}
Type: ${suggestion.type}
Impact: ${suggestion.impact}
Confidence: ${(suggestion.confidence * 100).toFixed(1)}%

Description: ${suggestion.description}
Reasoning: ${suggestion.reasoning}

--- Original Code (lines ${suggestion.startLine}-${suggestion.endLine}) ---
${suggestion.originalCode}

--- Suggested Code ---
${suggestion.suggestedCode}

=== End Preview ===
    `;

		return preview.trim();
	}

	/**
	 * Apply selected refactoring suggestions
	 */
	public async applyRefactorings(
		suggestions: RefactoringSuggestion[],
		interactive: boolean = true,
	): Promise<RefactoringResult> {
		const result: RefactoringResult = {
			success: true,
			appliedSuggestions: [],
			rejectedSuggestions: [],
			errors: [],
		};

		for (const suggestion of suggestions) {
			try {
				if (interactive) {
					const preview = await this.previewRefactoring(suggestion);
					console.log(preview);

					// In a real implementation, this would use a proper CLI prompt
					const shouldApply = await this.promptForApproval(suggestion);

					if (!shouldApply) {
						result.rejectedSuggestions.push(suggestion);
						await this.recordFeedback({
							suggestionId: suggestion.id,
							action: "rejected",
							timestamp: new Date(),
							reason: "User declined",
						});
						continue;
					}
				}

				await this.applySingleRefactoring(suggestion);
				result.appliedSuggestions.push(suggestion);

				await this.recordFeedback({
					suggestionId: suggestion.id,
					action: "accepted",
					timestamp: new Date(),
				});
			} catch (error) {
				result.errors.push(
					`Failed to apply refactoring ${suggestion.id}: ${error}`,
				);
				result.success = false;
			}
		}

		// Commit changes to Git if any refactorings were applied
		if (result.appliedSuggestions.length > 0) {
			try {
				result.gitCommitHash = await this.commitRefactorings(
					result.appliedSuggestions,
				);
			} catch (error) {
				result.errors.push(`Failed to commit changes: ${error}`);
			}
		}

		return result;
	}

	/**
	 * Record developer feedback for continuous learning
	 */
	private async recordFeedback(feedback: DeveloperFeedback): Promise<void> {
		this.feedbackHistory.push(feedback);

		// In a real implementation, this would persist to a database or file
		const feedbackFile = join(
			this.projectPath,
			".xaheen",
			"refactoring-feedback.json",
		);
		try {
			await writeFile(
				feedbackFile,
				JSON.stringify(this.feedbackHistory, null, 2),
			);
		} catch (error) {
			console.warn("Failed to save feedback:", error);
		}
	}

	/**
	 * Generate periodic reports on model accuracy
	 */
	public async generateAccuracyReport(): Promise<string> {
		const totalSuggestions = this.feedbackHistory.length;
		const acceptedSuggestions = this.feedbackHistory.filter(
			(f) => f.action === "accepted",
		).length;
		const rejectedSuggestions = this.feedbackHistory.filter(
			(f) => f.action === "rejected",
		).length;
		const modifiedSuggestions = this.feedbackHistory.filter(
			(f) => f.action === "modified",
		).length;

		const acceptanceRate =
			totalSuggestions > 0 ? (acceptedSuggestions / totalSuggestions) * 100 : 0;
		const rejectionRate =
			totalSuggestions > 0 ? (rejectedSuggestions / totalSuggestions) * 100 : 0;
		const modificationRate =
			totalSuggestions > 0 ? (modifiedSuggestions / totalSuggestions) * 100 : 0;

		return `
=== AI Refactoring Assistant - Accuracy Report ===
Generated: ${new Date().toISOString()}

Total Suggestions: ${totalSuggestions}
Accepted: ${acceptedSuggestions} (${acceptanceRate.toFixed(1)}%)
Rejected: ${rejectedSuggestions} (${rejectionRate.toFixed(1)}%)
Modified: ${modifiedSuggestions} (${modificationRate.toFixed(1)}%)

Model Performance:
- Acceptance Rate: ${acceptanceRate >= 70 ? "✅ Good" : acceptanceRate >= 50 ? "⚠️ Fair" : "❌ Poor"}
- Suggestion Quality: ${acceptanceRate >= 80 ? "Excellent" : acceptanceRate >= 60 ? "Good" : "Needs Improvement"}

Recommendations:
${acceptanceRate < 60 ? "- Consider adjusting suggestion confidence thresholds" : ""}
${rejectionRate > 40 ? "- Review common rejection patterns for model improvement" : ""}
${modificationRate > 20 ? "- Analyze modification patterns to improve suggestions" : ""}
    `.trim();
	}

	// Private helper methods

	private async analyzeForFunctionExtraction(
		filePath: string,
		code: string,
	): Promise<RefactoringSuggestion[]> {
		const suggestions: RefactoringSuggestion[] = [];

		// Simple heuristic: look for long functions (>20 lines)
		const lines = code.split("\n");
		const functionRegex =
			/^\s*(function|const\s+\w+\s*=|async\s+function|\w+\s*\()/;

		let currentFunction: { start: number; name: string } | null = null;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];

			if (functionRegex.test(line)) {
				currentFunction = { start: i, name: this.extractFunctionName(line) };
			} else if (line.includes("}") && currentFunction) {
				const functionLength = i - currentFunction.start;

				if (functionLength > 20) {
					suggestions.push({
						id: `extract-${filePath}-${currentFunction.start}`,
						type: "extract-function",
						title: `Extract function from ${currentFunction.name}`,
						description: `Function ${currentFunction.name} is ${functionLength} lines long and could benefit from extraction`,
						filePath,
						startLine: currentFunction.start + 1,
						endLine: i + 1,
						originalCode: lines.slice(currentFunction.start, i + 1).join("\n"),
						suggestedCode: this.generateFunctionExtractionSuggestion(
							lines.slice(currentFunction.start, i + 1),
						),
						confidence: 0.7,
						reasoning: "Long functions are harder to maintain and test",
						impact: "medium",
					});
				}

				currentFunction = null;
			}
		}

		return suggestions;
	}

	private async analyzeForVariableRenaming(
		filePath: string,
		code: string,
	): Promise<RefactoringSuggestion[]> {
		const suggestions: RefactoringSuggestion[] = [];

		// Look for poorly named variables (single letters, unclear names)
		const poorVariableRegex =
			/\b(let|const|var)\s+([a-z]|temp|data|item|obj)\b/g;
		const lines = code.split("\n");

		let match;
		while ((match = poorVariableRegex.exec(code)) !== null) {
			const lineIndex = code.substring(0, match.index).split("\n").length - 1;
			const variableName = match[2];

			suggestions.push({
				id: `rename-${filePath}-${lineIndex}-${variableName}`,
				type: "rename-variable",
				title: `Rename variable '${variableName}' to be more descriptive`,
				description: `Variable '${variableName}' has a non-descriptive name`,
				filePath,
				startLine: lineIndex + 1,
				endLine: lineIndex + 1,
				originalCode: lines[lineIndex],
				suggestedCode: this.generateVariableRenameSuggestion(
					lines[lineIndex],
					variableName,
				),
				confidence: 0.6,
				reasoning: "Descriptive variable names improve code readability",
				impact: "low",
			});
		}

		return suggestions;
	}

	private async analyzeForConditionSimplification(
		filePath: string,
		code: string,
	): Promise<RefactoringSuggestion[]> {
		const suggestions: RefactoringSuggestion[] = [];

		// Look for complex boolean conditions that can be simplified
		const complexConditionRegex = /if\s*\(\s*.*\s*===?\s*(true|false)\s*\)/g;
		const lines = code.split("\n");

		let match;
		while ((match = complexConditionRegex.exec(code)) !== null) {
			const lineIndex = code.substring(0, match.index).split("\n").length - 1;

			suggestions.push({
				id: `simplify-${filePath}-${lineIndex}`,
				type: "simplify-condition",
				title: "Simplify boolean condition",
				description:
					"Boolean condition can be simplified by removing explicit true/false comparison",
				filePath,
				startLine: lineIndex + 1,
				endLine: lineIndex + 1,
				originalCode: lines[lineIndex],
				suggestedCode: this.generateConditionSimplification(lines[lineIndex]),
				confidence: 0.8,
				reasoning: "Explicit boolean comparisons are redundant",
				impact: "low",
			});
		}

		return suggestions;
	}

	private async analyzeForDuplicationRemoval(
		filePath: string,
		code: string,
	): Promise<RefactoringSuggestion[]> {
		const suggestions: RefactoringSuggestion[] = [];

		// Simple duplication detection (this would be more sophisticated in practice)
		const lines = code.split("\n");
		const lineMap = new Map<string, number[]>();

		// Group similar lines
		lines.forEach((line, index) => {
			const trimmed = line.trim();
			if (trimmed.length > 10) {
				// Only consider substantial lines
				if (!lineMap.has(trimmed)) {
					lineMap.set(trimmed, []);
				}
				lineMap.get(trimmed)!.push(index);
			}
		});

		// Find duplicated lines
		for (const [line, indices] of lineMap) {
			if (indices.length > 1) {
				suggestions.push({
					id: `dedup-${filePath}-${indices[0]}`,
					type: "remove-duplication",
					title: "Remove code duplication",
					description: `Line "${line.substring(0, 50)}..." appears ${indices.length} times`,
					filePath,
					startLine: indices[0] + 1,
					endLine: indices[0] + 1,
					originalCode: line,
					suggestedCode: this.generateDuplicationRemovalSuggestion(
						line,
						indices,
					),
					confidence: 0.5,
					reasoning: "Code duplication increases maintenance burden",
					impact: "medium",
				});
			}
		}

		return suggestions;
	}

	private async analyzeForImportOptimization(
		filePath: string,
		code: string,
	): Promise<RefactoringSuggestion[]> {
		const suggestions: RefactoringSuggestion[] = [];

		// Look for unused imports and import organization opportunities
		const importLines = code
			.split("\n")
			.filter((line) => line.trim().startsWith("import"));

		if (importLines.length > 5) {
			suggestions.push({
				id: `optimize-imports-${filePath}`,
				type: "optimize-imports",
				title: "Optimize import statements",
				description:
					"Import statements can be organized and potentially reduced",
				filePath,
				startLine: 1,
				endLine: importLines.length,
				originalCode: importLines.join("\n"),
				suggestedCode: this.generateImportOptimization(importLines),
				confidence: 0.6,
				reasoning: "Organized imports improve code readability",
				impact: "low",
			});
		}

		return suggestions;
	}

	private extractFunctionName(line: string): string {
		const match = line.match(
			/(?:function\s+(\w+)|const\s+(\w+)\s*=|(\w+)\s*\()/,
		);
		return match
			? match[1] || match[2] || match[3] || "anonymous"
			: "anonymous";
	}

	private generateFunctionExtractionSuggestion(
		functionLines: string[],
	): string {
		return `// TODO: Extract smaller functions from this large function\n${functionLines.join("\n")}`;
	}

	private generateVariableRenameSuggestion(
		line: string,
		oldName: string,
	): string {
		const newName = this.suggestBetterVariableName(oldName);
		return line.replace(new RegExp(`\\b${oldName}\\b`, "g"), newName);
	}

	private generateConditionSimplification(line: string): string {
		return line
			.replace(/===?\s*true/g, "")
			.replace(/===?\s*false/g, "")
			.replace(/!\s*===?\s*false/g, "")
			.replace(/!\s*===?\s*true/g, "!");
	}

	private generateDuplicationRemovalSuggestion(
		line: string,
		indices: number[],
	): string {
		return `// TODO: Extract this duplicated code (appears on lines: ${indices.map((i) => i + 1).join(", ")})\n${line}`;
	}

	private generateImportOptimization(importLines: string[]): string {
		// Simple alphabetical sorting
		return importLines.sort().join("\n");
	}

	private suggestBetterVariableName(oldName: string): string {
		const suggestions: Record<string, string> = {
			a: "item",
			b: "secondItem",
			i: "index",
			j: "innerIndex",
			temp: "temporaryValue",
			data: "responseData",
			obj: "object",
			item: "listItem",
		};

		return suggestions[oldName] || `${oldName}Value`;
	}

	private async promptForApproval(
		suggestion: RefactoringSuggestion,
	): Promise<boolean> {
		// In a real implementation, this would use inquirer or similar
		// For now, we'll simulate user approval based on confidence
		return suggestion.confidence > 0.7;
	}

	private async applySingleRefactoring(
		suggestion: RefactoringSuggestion,
	): Promise<void> {
		const fullPath = join(this.projectPath, suggestion.filePath);
		const content = await readFile(fullPath, "utf-8");
		const lines = content.split("\n");

		// Replace the specified lines with the suggested code
		const newLines = [
			...lines.slice(0, suggestion.startLine - 1),
			...suggestion.suggestedCode.split("\n"),
			...lines.slice(suggestion.endLine),
		];

		await writeFile(fullPath, newLines.join("\n"));
	}

	private async commitRefactorings(
		appliedSuggestions: RefactoringSuggestion[],
	): Promise<string> {
		try {
			// Stage all changes
			execSync("git add .", { cwd: this.projectPath });

			// Create commit message
			const commitMessage = `refactor: Apply AI-suggested refactorings\n\n${appliedSuggestions.map((s) => `- ${s.title}`).join("\n")}`;

			// Commit changes
			execSync(`git commit -m "${commitMessage}"`, { cwd: this.projectPath });

			// Get commit hash
			const hash = execSync("git rev-parse HEAD", { cwd: this.projectPath })
				.toString()
				.trim();

			return hash;
		} catch (error) {
			throw new Error(`Git commit failed: ${error}`);
		}
	}
}

/**
 * Create AI refactoring assistant instance
 */
export function createRefactoringAssistant(
	projectPath: string,
): AIRefactoringAssistant {
	return new AIRefactoringAssistant(projectPath);
}

/**
 * Default export
 */
export default AIRefactoringAssistant;
