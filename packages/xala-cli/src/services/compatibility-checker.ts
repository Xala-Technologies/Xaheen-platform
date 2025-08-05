/**
 * @fileoverview Compatibility Checker for Interactive Tech Builder
 * @description Validates technology stack compatibility and prevents invalid combinations
 */

import {
	BuilderError,
	CompatibilityChecker,
	StackConfiguration,
	TechCompatibility,
	TechOption,
	ValidationError,
} from "./builder-types.js";
import { configLoader } from "./config-loader.js";

export class TechCompatibilityChecker implements CompatibilityChecker {
	/**
	 * Validate complete stack configuration
	 */
	validateStack(
		stack: Partial<StackConfiguration>,
	): readonly ValidationError[] {
		const errors: ValidationError[] = [];

		try {
			// Check required fields
			this.validateRequiredFields(stack, errors);

			// Check individual compatibility rules
			this.validateBackendCompatibility(stack, errors);
			this.validateDatabaseCompatibility(stack, errors);
			this.validateAuthCompatibility(stack, errors);
			this.validateFrontendCompatibility(stack, errors);
			this.validateRuntimeCompatibility(stack, errors);
			this.validateDeploymentCompatibility(stack, errors);

			// Check logical combinations
			this.validateLogicalCombinations(stack, errors);
		} catch (error) {
			errors.push(
				new ValidationError(
					`Stack validation failed: ${error instanceof Error ? error.message : String(error)}`,
					"general",
					"stack",
				),
			);
		}

		return errors;
	}

	/**
	 * Check if a specific selection is compatible with current stack
	 */
	async checkCompatibility(
		category: string,
		selection: string,
		currentStack: Partial<StackConfiguration>,
	): Promise<boolean> {
		try {
			const compatibilityInfo = await configLoader.getCompatibilityInfo(
				category,
				selection,
			);
			if (!compatibilityInfo) {
				return true; // No specific compatibility rules defined
			}

			// Check incompatible combinations
			if (compatibilityInfo.incompatibleWith) {
				for (const incompatible of compatibilityInfo.incompatibleWith) {
					if (this.isSelectionInStack(incompatible, currentStack)) {
						return false;
					}
				}
			}

			// Check required combinations
			if (compatibilityInfo.requiredWith) {
				for (const required of compatibilityInfo.requiredWith) {
					if (!this.isSelectionInStack(required, currentStack)) {
						return false;
					}
				}
			}

			// Category-specific compatibility checks
			return await this.checkCategorySpecificCompatibility(
				category,
				selection,
				currentStack,
				compatibilityInfo,
			);
		} catch (error) {
			console.warn(
				`Failed to check compatibility for ${category}:${selection}:`,
				error,
			);
			return true; // Default to compatible if check fails
		}
	}

	/**
	 * Get available options for a category based on current stack
	 */
	async getAvailableOptions(
		category: string,
		currentStack: Partial<StackConfiguration>,
	): Promise<readonly TechOption[]> {
		const allOptions = await configLoader.getTechOptions(category);
		const availableOptions: TechOption[] = [];

		for (const option of allOptions) {
			const isCompatible = await this.checkCompatibility(
				category,
				option.id,
				currentStack,
			);
			if (isCompatible) {
				availableOptions.push(option);
			}
		}

		return availableOptions;
	}

	/**
	 * Suggest alternatives for incompatible options
	 */
	async suggestAlternatives(
		category: string,
		incompatibleOption: string,
		currentStack: Partial<StackConfiguration>,
	): Promise<readonly TechOption[]> {
		const availableOptions = await this.getAvailableOptions(
			category,
			currentStack,
		);
		const incompatibleDetails = await configLoader.getTechOptionDetails(
			category,
			incompatibleOption,
		);

		if (!incompatibleDetails) {
			return availableOptions;
		}

		// Prefer options with similar characteristics (e.g., same language/runtime)
		const alternatives = availableOptions.filter((option) => {
			// Simple heuristic: options with similar names or descriptions
			const nameSimilarity = this.calculateStringSimilarity(
				incompatibleDetails.name.toLowerCase(),
				option.name.toLowerCase(),
			);
			const descSimilarity = this.calculateStringSimilarity(
				incompatibleDetails.description.toLowerCase(),
				option.description.toLowerCase(),
			);

			return nameSimilarity > 0.3 || descSimilarity > 0.3;
		});

		return alternatives.length > 0
			? alternatives
			: availableOptions.slice(0, 3);
	}

	/**
	 * Validate required fields
	 */
	private validateRequiredFields(
		stack: Partial<StackConfiguration>,
		errors: ValidationError[],
	): void {
		const requiredFields: Array<keyof StackConfiguration> = [
			"projectName",
			"packageManager",
		];

		for (const field of requiredFields) {
			if (!stack[field]) {
				errors.push(
					new ValidationError(`${field} is required`, "required", field),
				);
			}
		}

		// Project name validation
		if (stack.projectName) {
			if (!/^[a-z0-9-_]+$/.test(stack.projectName)) {
				errors.push(
					new ValidationError(
						"Project name can only contain lowercase letters, numbers, hyphens, and underscores",
						"validation",
						"projectName",
					),
				);
			}
		}
	}

	/**
	 * Validate backend compatibility
	 */
	private async validateBackendCompatibility(
		stack: Partial<StackConfiguration>,
		errors: ValidationError[],
	): Promise<void> {
		if (!stack.backend) return;

		const compatibilityInfo = await configLoader.getCompatibilityInfo(
			"backend",
			stack.backend,
		);
		if (!compatibilityInfo) return;

		// Check ORM compatibility
		if (stack.orm && compatibilityInfo.supportedOrms) {
			if (!compatibilityInfo.supportedOrms.includes(stack.orm)) {
				errors.push(
					new ValidationError(
						`Backend ${stack.backend} does not support ORM ${stack.orm}`,
						"backend",
						"orm",
					),
				);
			}
		}

		// Check database compatibility
		if (stack.database && compatibilityInfo.supportedDatabases) {
			if (!compatibilityInfo.supportedDatabases.includes(stack.database)) {
				errors.push(
					new ValidationError(
						`Backend ${stack.backend} does not support database ${stack.database}`,
						"backend",
						"database",
					),
				);
			}
		}

		// Check runtime compatibility
		if (stack.runtime && compatibilityInfo.supportedRuntimes) {
			if (!compatibilityInfo.supportedRuntimes.includes(stack.runtime)) {
				errors.push(
					new ValidationError(
						`Backend ${stack.backend} does not support runtime ${stack.runtime}`,
						"backend",
						"runtime",
					),
				);
			}
		}
	}

	/**
	 * Validate database compatibility
	 */
	private validateDatabaseCompatibility(
		stack: Partial<StackConfiguration>,
		errors: ValidationError[],
	): void {
		// Check if database requires specific ORM
		if (
			stack.database === "mongodb" &&
			stack.orm &&
			!["mongoose", "prisma", "none"].includes(stack.orm)
		) {
			errors.push(
				new ValidationError(
					"MongoDB requires Mongoose, Prisma, or no ORM",
					"database",
					"orm",
				),
			);
		}

		if (
			stack.database === "mssql" &&
			stack.orm &&
			!["entity-framework", "prisma", "typeorm"].includes(stack.orm)
		) {
			errors.push(
				new ValidationError(
					"Microsoft SQL Server works best with Entity Framework, Prisma, or TypeORM",
					"database",
					"orm",
				),
			);
		}
	}

	/**
	 * Validate authentication compatibility
	 */
	private validateAuthCompatibility(
		stack: Partial<StackConfiguration>,
		errors: ValidationError[],
	): void {
		// Check region-specific auth requirements
		if (stack.compliance && Array.isArray(stack.compliance)) {
			if (
				stack.compliance.includes("norwegian") &&
				stack.auth &&
				!["bankid", "feide"].includes(stack.auth)
			) {
				errors.push(
					new ValidationError(
						"Norwegian compliance requires BankID or Feide authentication",
						"auth",
						"compliance",
					),
				);
			}
		}

		// Check auth provider compatibility with deployment
		if (stack.auth === "identity-server" && stack.webDeploy !== "azure") {
			errors.push(
				new ValidationError(
					"Identity Server is optimized for Azure deployment",
					"auth",
					"webDeploy",
				),
			);
		}
	}

	/**
	 * Validate frontend compatibility
	 */
	private validateFrontendCompatibility(
		stack: Partial<StackConfiguration>,
		errors: ValidationError[],
	): void {
		// Check if frontend matches backend capabilities
		if (stack.webFrontend && stack.backend) {
			const frontendArray = Array.isArray(stack.webFrontend)
				? stack.webFrontend
				: [stack.webFrontend];

			// Check for conflicting frontend/backend combinations
			if (
				frontendArray.includes("blazor") &&
				!["dotnet", "aspnet-core"].includes(stack.backend)
			) {
				errors.push(
					new ValidationError(
						"Blazor frontend requires .NET backend",
						"webFrontend",
						"backend",
					),
				);
			}

			if (frontendArray.includes("angular") && stack.backend === "php") {
				errors.push(
					new ValidationError(
						"Angular and PHP is an uncommon combination. Consider Node.js or .NET backend",
						"webFrontend",
						"backend",
					),
				);
			}
		}
	}

	/**
	 * Validate runtime compatibility
	 */
	private validateRuntimeCompatibility(
		stack: Partial<StackConfiguration>,
		errors: ValidationError[],
	): void {
		// Check backend-runtime compatibility
		if (stack.backend && stack.runtime) {
			const runtimeMismatch = [
				{
					backend: "dotnet",
					incompatibleRuntimes: ["node", "bun", "deno", "python"],
				},
				{
					backend: "aspnet-core",
					incompatibleRuntimes: ["node", "bun", "deno", "python"],
				},
				{
					backend: "django",
					incompatibleRuntimes: ["node", "bun", "deno", "dotnet"],
				},
				{
					backend: "laravel",
					incompatibleRuntimes: ["node", "bun", "deno", "dotnet", "python"],
				},
			];

			for (const rule of runtimeMismatch) {
				if (
					stack.backend === rule.backend &&
					rule.incompatibleRuntimes.includes(stack.runtime)
				) {
					errors.push(
						new ValidationError(
							`Backend ${stack.backend} is not compatible with runtime ${stack.runtime}`,
							"runtime",
							"backend",
						),
					);
				}
			}
		}
	}

	/**
	 * Validate deployment compatibility
	 */
	private validateDeploymentCompatibility(
		stack: Partial<StackConfiguration>,
		errors: ValidationError[],
	): void {
		// Check deployment platform compatibility
		if (
			stack.webDeploy === "azure" &&
			stack.runtime &&
			!["dotnet", "node"].includes(stack.runtime)
		) {
			errors.push(
				new ValidationError(
					"Azure deployment works best with .NET or Node.js runtimes",
					"webDeploy",
					"runtime",
				),
			);
		}

		if (
			stack.webDeploy === "vercel" &&
			stack.backend &&
			!["next", "next-api", "none"].includes(stack.backend)
		) {
			errors.push(
				new ValidationError(
					"Vercel is optimized for Next.js or static sites",
					"webDeploy",
					"backend",
				),
			);
		}
	}

	/**
	 * Validate logical combinations
	 */
	private validateLogicalCombinations(
		stack: Partial<StackConfiguration>,
		errors: ValidationError[],
	): void {
		// Check if database is selected but ORM is none
		if (stack.database && stack.database !== "none" && stack.orm === "none") {
			errors.push(
				new ValidationError(
					"Database selected but no ORM specified. Consider selecting an ORM for better development experience",
					"orm",
					"database",
				),
			);
		}

		// Check if auth is required for certain project features
		if (stack.rbac && (!stack.auth || stack.auth === "none")) {
			errors.push(
				new ValidationError(
					"Role-based access control requires authentication system",
					"auth",
					"rbac",
				),
			);
		}

		// Check if payments require HTTPS/security
		if (
			stack.payments &&
			stack.payments !== "none" &&
			(!stack.security || stack.security.length === 0)
		) {
			errors.push(
				new ValidationError(
					"Payment processing requires security measures",
					"security",
					"payments",
				),
			);
		}
	}

	/**
	 * Check category-specific compatibility
	 */
	private async checkCategorySpecificCompatibility(
		category: string,
		selection: string,
		currentStack: Partial<StackConfiguration>,
		compatibilityInfo: TechCompatibility,
	): Promise<boolean> {
		switch (category) {
			case "backend":
				return this.checkBackendSpecificCompatibility(
					selection,
					currentStack,
					compatibilityInfo,
				);
			case "database":
				return this.checkDatabaseSpecificCompatibility(
					selection,
					currentStack,
					compatibilityInfo,
				);
			case "orm":
				return this.checkORMSpecificCompatibility(
					selection,
					currentStack,
					compatibilityInfo,
				);
			default:
				return true;
		}
	}

	/**
	 * Check if a selection exists in the current stack
	 */
	private isSelectionInStack(
		selection: string,
		stack: Partial<StackConfiguration>,
	): boolean {
		for (const value of Object.values(stack)) {
			if (value === selection) return true;
			if (Array.isArray(value) && value.includes(selection)) return true;
		}
		return false;
	}

	/**
	 * Calculate string similarity (simple implementation)
	 */
	private calculateStringSimilarity(str1: string, str2: string): number {
		const longer = str1.length > str2.length ? str1 : str2;
		const shorter = str1.length > str2.length ? str2 : str1;

		if (longer.length === 0) return 1.0;

		const distance = this.levenshteinDistance(longer, shorter);
		return (longer.length - distance) / longer.length;
	}

	/**
	 * Calculate Levenshtein distance
	 */
	private levenshteinDistance(str1: string, str2: string): number {
		const matrix: number[][] = [];

		for (let i = 0; i <= str2.length; i++) {
			matrix[i] = [i];
		}

		for (let j = 0; j <= str1.length; j++) {
			matrix[0]![j] = j;
		}

		for (let i = 1; i <= str2.length; i++) {
			for (let j = 1; j <= str1.length; j++) {
				if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
					matrix[i]![j] = matrix[i - 1]![j - 1]!;
				} else {
					matrix[i]![j] = Math.min(
						matrix[i - 1]![j - 1]! + 1,
						matrix[i]![j - 1]! + 1,
						matrix[i - 1]![j]! + 1,
					);
				}
			}
		}

		return matrix[str2.length]![str1.length]!;
	}

	/**
	 * Backend-specific compatibility checks
	 */
	private checkBackendSpecificCompatibility(
		backend: string,
		stack: Partial<StackConfiguration>,
		compatibilityInfo: TechCompatibility,
	): boolean {
		// Check runtime compatibility
		if (stack.runtime && compatibilityInfo.supportedRuntimes) {
			return compatibilityInfo.supportedRuntimes.includes(stack.runtime);
		}
		return true;
	}

	/**
	 * Database-specific compatibility checks
	 */
	private checkDatabaseSpecificCompatibility(
		database: string,
		stack: Partial<StackConfiguration>,
		compatibilityInfo: TechCompatibility,
	): boolean {
		// Additional database-specific logic can be added here
		return true;
	}

	/**
	 * ORM-specific compatibility checks
	 */
	private checkORMSpecificCompatibility(
		orm: string,
		stack: Partial<StackConfiguration>,
		compatibilityInfo: TechCompatibility,
	): boolean {
		// Additional ORM-specific logic can be added here
		return true;
	}
}

// Export singleton instance
export const compatibilityChecker = new TechCompatibilityChecker();
