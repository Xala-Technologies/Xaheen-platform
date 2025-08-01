/**
 * Test Fixture Generation System
 *
 * Comprehensive fixture generation for testing with Norwegian compliance
 * and localization support. Creates realistic test fixtures, data sets,
 * and scenario-based test data for different compliance levels.
 *
 * Features:
 * - Component test fixtures
 * - API response fixtures
 * - Database test data fixtures
 * - Norwegian localization fixtures
 * - Compliance scenario fixtures
 * - Performance test fixtures
 * - Accessibility test fixtures
 * - File system fixtures
 */

import { LocaleCode } from "../localization/types.js";
import { logger } from "../utils/logger.js";
import {
	NorwegianAddressData,
	NorwegianDataGenerator,
	NorwegianPersonData,
} from "./mock-generator.js";
import { NSMClassification } from "./test-framework.js";

// === Fixture Generation Types ===

/**
 * Fixture generation options
 */
export interface FixtureGenerationOptions {
	locale?: LocaleCode;
	classification?: NSMClassification;
	count?: number;
	realistic?: boolean;
	includeEdgeCases?: boolean;
	includeErrorStates?: boolean;
	seed?: number;
}

/**
 * Component fixture options
 */
export interface ComponentFixtureOptions extends FixtureGenerationOptions {
	componentName: string;
	propsSchema?: any;
	includeVariants?: boolean;
	includeStorybook?: boolean;
}

/**
 * API fixture options
 */
export interface APIFixtureOptions extends FixtureGenerationOptions {
	endpoint: string;
	method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	responseSchema?: any;
	includeHeaders?: boolean;
	includePagination?: boolean;
}

/**
 * Database fixture options
 */
export interface DatabaseFixtureOptions extends FixtureGenerationOptions {
	tableName: string;
	schema: Record<string, string>;
	relationships?: Array<{
		table: string;
		foreignKey: string;
		relationType: "one-to-one" | "one-to-many" | "many-to-many";
	}>;
}

// === Main Fixture Generator ===

/**
 * Main fixture generation service
 */
export class FixtureGenerator {
	private dataGenerator: NorwegianDataGenerator;
	private componentGenerator: ComponentFixtureGenerator;
	private apiGenerator: APIFixtureGenerator;
	private databaseGenerator: DatabaseFixtureGenerator;
	private localizationGenerator: LocalizationFixtureGenerator;
	private complianceGenerator: ComplianceFixtureGenerator;

	constructor(private defaultOptions: FixtureGenerationOptions = {}) {
		this.dataGenerator = new NorwegianDataGenerator(defaultOptions);
		this.componentGenerator = new ComponentFixtureGenerator(
			this.dataGenerator,
			defaultOptions,
		);
		this.apiGenerator = new APIFixtureGenerator(
			this.dataGenerator,
			defaultOptions,
		);
		this.databaseGenerator = new DatabaseFixtureGenerator(
			this.dataGenerator,
			defaultOptions,
		);
		this.localizationGenerator = new LocalizationFixtureGenerator(
			this.dataGenerator,
			defaultOptions,
		);
		this.complianceGenerator = new ComplianceFixtureGenerator(
			this.dataGenerator,
			defaultOptions,
		);
	}

	/**
	 * Generate component fixtures
	 */
	generateComponentFixtures(options: ComponentFixtureOptions): {
		fixtures: Record<string, any>;
		stories?: string;
		types: string;
	} {
		return this.componentGenerator.generate(options);
	}

	/**
	 * Generate API fixtures
	 */
	generateAPIFixtures(options: APIFixtureOptions): {
		fixtures: Record<string, any>;
		handlers: string;
		types: string;
	} {
		return this.apiGenerator.generate(options);
	}

	/**
	 * Generate database fixtures
	 */
	generateDatabaseFixtures(options: DatabaseFixtureOptions): {
		fixtures: Record<string, any[]>;
		seeds: string;
		migrations?: string;
	} {
		return this.databaseGenerator.generate(options);
	}

	/**
	 * Generate localization fixtures
	 */
	generateLocalizationFixtures(locales: LocaleCode[]): {
		fixtures: Record<LocaleCode, Record<string, string>>;
		testHelpers: string;
	} {
		return this.localizationGenerator.generate(locales);
	}

	/**
	 * Generate compliance scenario fixtures
	 */
	generateComplianceFixtures(classification: NSMClassification): {
		fixtures: Record<string, any>;
		scenarios: string;
		validators: string;
	} {
		return this.complianceGenerator.generate(classification);
	}

	/**
	 * Generate performance test fixtures
	 */
	generatePerformanceFixtures(options: FixtureGenerationOptions): {
		fixtures: Record<string, any>;
		benchmarks: string;
	} {
		return this.generatePerformanceData(options);
	}

	/**
	 * Generate accessibility test fixtures
	 */
	generateAccessibilityFixtures(): {
		fixtures: Record<string, any>;
		testCases: string;
	} {
		return this.generateAccessibilityData();
	}

	private generatePerformanceData(options: FixtureGenerationOptions): {
		fixtures: Record<string, any>;
		benchmarks: string;
	} {
		const fixtures = {
			smallDataset: this.dataGenerator.generate("person", 10),
			mediumDataset: this.dataGenerator.generate("person", 100),
			largeDataset: this.dataGenerator.generate("person", 1000),
			hugeLargeArray: new Array(10000)
				.fill(null)
				.map((_, i) => ({ id: i, value: `item-${i}` })),
			complexObjects: this.dataGenerator.generate("company", 50),
			nestedData: {
				level1: {
					level2: {
						level3: {
							data: this.dataGenerator.generate("person", 20),
						},
					},
				},
			},
		};

		const benchmarks = `
// Performance benchmark fixtures
export const PerformanceBenchmarks = {
  renderingTargets: {
    small: 16, // 60fps
    medium: 33, // 30fps  
    large: 100, // Acceptable for large datasets
  },
  
  memoryTargets: {
    small: 10 * 1024 * 1024, // 10MB
    medium: 50 * 1024 * 1024, // 50MB
    large: 100 * 1024 * 1024, // 100MB
  },
  
  loadingTargets: {
    critical: 100, // Critical resources
    important: 1000, // Important resources
    normal: 3000, // Normal resources
  },
};
`;

		return { fixtures, benchmarks };
	}

	private generateAccessibilityData(): {
		fixtures: Record<string, any>;
		testCases: string;
	} {
		const fixtures = {
			colorContrast: {
				valid: [
					{ foreground: "#000000", background: "#ffffff", ratio: 21 },
					{ foreground: "#ffffff", background: "#000000", ratio: 21 },
					{ foreground: "#007acc", background: "#ffffff", ratio: 7.35 },
				],
				invalid: [
					{ foreground: "#999999", background: "#ffffff", ratio: 2.85 },
					{ foreground: "#cccccc", background: "#ffffff", ratio: 1.61 },
				],
			},

			focusStates: {
				valid: [
					{
						element: "button",
						focusVisible: true,
						outline: "2px solid #007acc",
					},
					{
						element: "input",
						focusVisible: true,
						outline: "2px solid #007acc",
					},
				],
				invalid: [
					{ element: "button", focusVisible: false, outline: "none" },
					{ element: "div[tabindex]", focusVisible: false, outline: "none" },
				],
			},

			ariaLabels: {
				valid: [
					{ element: "button", ariaLabel: "Close dialog" },
					{ element: "input", ariaLabelledby: "label-id" },
				],
				invalid: [
					{ element: "button", ariaLabel: "" },
					{ element: "input", ariaLabelledby: "non-existent-id" },
				],
			},

			headingStructure: {
				valid: [
					{ level: 1, text: "Main heading" },
					{ level: 2, text: "Section heading" },
					{ level: 3, text: "Subsection heading" },
				],
				invalid: [
					{ level: 1, text: "Main heading" },
					{ level: 4, text: "Skipped level heading" }, // Missing h2, h3
				],
			},
		};

		const testCases = `
// Accessibility test cases
export const AccessibilityTestCases = {
  colorContrast: (foreground, background) => {
    // Test color contrast ratios
    const ratio = calculateContrastRatio(foreground, background);
    expect(ratio).toBeGreaterThanOrEqual(7.0); // WCAG AAA
  },
  
  keyboardNavigation: (element) => {
    // Test keyboard accessibility
    expect(element).toHaveAttribute('tabindex');
    fireEvent.keyDown(element, { key: 'Enter' });
    expect(element).toHaveFocus();
  },
  
  screenReader: (element) => {
    // Test screen reader accessibility
    expect(element).toHaveAttribute('aria-label');
    expect(element).toHaveAttribute('role');
  },
  
  norwegianCompliance: (element) => {
    // Test Norwegian accessibility compliance
    expect(element).toHaveAttribute('lang');
    const lang = element.getAttribute('lang');
    expect(['nb-NO', 'nn-NO', 'en-US']).toContain(lang);
  },
};
`;

		return { fixtures, testCases };
	}
}

// === Component Fixture Generator ===

/**
 * Generates component test fixtures
 */
export class ComponentFixtureGenerator {
	constructor(
		private dataGenerator: NorwegianDataGenerator,
		private options: FixtureGenerationOptions = {},
	) {}

	generate(options: ComponentFixtureOptions): {
		fixtures: Record<string, any>;
		stories?: string;
		types: string;
	} {
		const componentName = options.componentName;
		const count = options.count || 5;

		const fixtures = {
			default: this.generateDefaultProps(componentName, options),
			variants: this.generateVariants(componentName, options, count),
			edgeCases: options.includeEdgeCases
				? this.generateEdgeCases(componentName, options)
				: {},
			errorStates: options.includeErrorStates
				? this.generateErrorStates(componentName, options)
				: {},
			compliance: this.generateComplianceVariants(componentName, options),
		};

		const stories = options.includeStorybook
			? this.generateStorybookStories(componentName, fixtures)
			: undefined;

		const types = this.generateTypeDefinitions(componentName, fixtures);

		return { fixtures, stories, types };
	}

	private generateDefaultProps(
		componentName: string,
		options: ComponentFixtureOptions,
	): any {
		const person = this.dataGenerator.generate("person", 1)[0];

		// Generate props based on common component patterns
		const commonProps = {
			id: `${componentName.toLowerCase()}-${Date.now()}`,
			className: `${componentName.toLowerCase()}`,
			"data-testid": `${componentName.toLowerCase()}-test`,
			lang: options.locale || "nb-NO",
		};

		// Add Norwegian compliance attributes
		if (
			options.classification &&
			options.classification !== NSMClassification.OPEN
		) {
			return {
				...commonProps,
				"data-nsm-classification": options.classification,
				"aria-label": `${componentName} komponent`,
				role: "generic",
			};
		}

		return commonProps;
	}

	private generateVariants(
		componentName: string,
		options: ComponentFixtureOptions,
		count: number,
	): any[] {
		const variants = [];

		for (let i = 0; i < count; i++) {
			const person = this.dataGenerator.generate("person", 1)[0];
			const variant = {
				...this.generateDefaultProps(componentName, options),
				variant: `variant-${i}`,
				title: `${componentName} Variant ${i + 1}`,
				description: `Test variant ${i + 1} for ${componentName}`,
				user: person,
			};

			variants.push(variant);
		}

		return variants;
	}

	private generateEdgeCases(
		componentName: string,
		options: ComponentFixtureOptions,
	): any {
		return {
			emptyProps: {},
			nullValues: {
				title: null,
				description: null,
				user: null,
			},
			undefinedValues: {
				title: undefined,
				description: undefined,
				user: undefined,
			},
			extremelyLongText: {
				title: "A".repeat(1000),
				description: "B".repeat(5000),
			},
			specialCharacters: {
				title: "æøåÆØÅ !@#$%^&*()_+-=[]{}|;:,.<>?",
				description: "Norwegian characters: æøå and symbols: ♦♣♠♥",
			},
			unicodeCharacters: {
				title: "🚀 Unicode Test 🎉",
				description: "Emoji and special Unicode: 你好 こんにちは مرحبا",
			},
		};
	}

	private generateErrorStates(
		componentName: string,
		options: ComponentFixtureOptions,
	): any {
		return {
			loadingState: {
				...this.generateDefaultProps(componentName, options),
				loading: true,
				error: null,
			},
			errorState: {
				...this.generateDefaultProps(componentName, options),
				loading: false,
				error: new Error("Test error message"),
			},
			networkError: {
				...this.generateDefaultProps(componentName, options),
				loading: false,
				error: new Error("Network connection failed"),
			},
			validationError: {
				...this.generateDefaultProps(componentName, options),
				loading: false,
				error: new Error("Validation failed: Required field is missing"),
				validationErrors: {
					name: "Name is required",
					email: "Invalid email format",
				},
			},
		};
	}

	private generateComplianceVariants(
		componentName: string,
		options: ComponentFixtureOptions,
	): any {
		const classifications = [
			NSMClassification.OPEN,
			NSMClassification.RESTRICTED,
			NSMClassification.CONFIDENTIAL,
		];
		const locales: LocaleCode[] = ["nb-NO", "nn-NO", "en-US", "ar-SA", "fr-FR"];

		const variants: any = {};

		for (const classification of classifications) {
			for (const locale of locales) {
				const key = `${classification.toLowerCase()}_${locale.replace("-", "_")}`;
				variants[key] = {
					...this.generateDefaultProps(componentName, {
						...options,
						classification,
						locale,
					}),
					classification,
					locale,
					complianceRequired: classification !== NSMClassification.OPEN,
					rtl: locale === "ar-SA",
				};
			}
		}

		return variants;
	}

	private generateStorybookStories(
		componentName: string,
		fixtures: Record<string, any>,
	): string {
		return `
// Storybook stories for ${componentName}
export default {
  title: 'Components/${componentName}',
  component: ${componentName},
  parameters: {
    docs: {
      description: {
        component: 'Auto-generated test fixtures for ${componentName} component',
      },
    },
  },
};

// Default story
export const Default = {
  args: ${JSON.stringify(fixtures.default, null, 2)},
};

// Variants
${fixtures.variants
	.map(
		(variant: any, index: number) => `
export const Variant${index + 1} = {
  args: ${JSON.stringify(variant, null, 2)},
};`,
	)
	.join("")}

// Edge cases
export const EmptyProps = {
  args: ${JSON.stringify(fixtures.edgeCases?.emptyProps || {}, null, 2)},
};

export const LongText = {
  args: ${JSON.stringify(fixtures.edgeCases?.extremelyLongText || {}, null, 2)},
};

// Error states
export const LoadingState = {
  args: ${JSON.stringify(fixtures.errorStates?.loadingState || {}, null, 2)},
};

export const ErrorState = {
  args: ${JSON.stringify(fixtures.errorStates?.errorState || {}, null, 2)},
};

// Norwegian compliance variants
export const NorwegianBokmål = {
  args: ${JSON.stringify(fixtures.compliance?.open_nb_no || {}, null, 2)},
};

export const NorwegianNynorsk = {
  args: ${JSON.stringify(fixtures.compliance?.open_nn_no || {}, null, 2)},
};

export const Arabic = {
  args: ${JSON.stringify(fixtures.compliance?.open_ar_sa || {}, null, 2)},
  parameters: {
    backgrounds: { default: 'rtl' },
  },
};
`;
	}

	private generateTypeDefinitions(
		componentName: string,
		fixtures: Record<string, any>,
	): string {
		return `
// Type definitions for ${componentName} fixtures
export interface ${componentName}Fixtures {
  default: any;
  variants: any[];
  edgeCases: Record<string, any>;
  errorStates: Record<string, any>;
  compliance: Record<string, any>;
}

export interface ${componentName}FixtureOptions {
  componentName: string;
  count?: number;
  includeVariants?: boolean;
  includeEdgeCases?: boolean;
  includeErrorStates?: boolean;
  includeStorybook?: boolean;
  locale?: LocaleCode;
  classification?: NSMClassification;
}
`;
	}
}

// === API Fixture Generator ===

/**
 * Generates API response fixtures
 */
export class APIFixtureGenerator {
	constructor(
		private dataGenerator: NorwegianDataGenerator,
		private options: FixtureGenerationOptions = {},
	) {}

	generate(options: APIFixtureOptions): {
		fixtures: Record<string, any>;
		handlers: string;
		types: string;
	} {
		const fixtures = {
			success: this.generateSuccessResponses(options),
			error: this.generateErrorResponses(options),
			loading: this.generateLoadingStates(options),
			pagination: options.includePagination
				? this.generatePaginationResponses(options)
				: {},
			compliance: this.generateComplianceResponses(options),
		};

		const handlers = this.generateMSWHandlers(options, fixtures);
		const types = this.generateAPITypes(options, fixtures);

		return { fixtures, handlers, types };
	}

	private generateSuccessResponses(options: APIFixtureOptions): any {
		const count = options.count || 3;

		switch (options.method) {
			case "GET":
				return {
					single: this.generateSingleResource(options),
					list: this.generateResourceList(options, count),
					empty: { data: [], meta: { total: 0, page: 1, limit: 10 } },
				};

			case "POST":
				return {
					created: {
						...this.generateSingleResource(options),
						id: crypto.randomUUID(),
						createdAt: new Date().toISOString(),
					},
				};

			case "PUT":
				return {
					updated: {
						...this.generateSingleResource(options),
						updatedAt: new Date().toISOString(),
					},
				};

			case "DELETE":
				return {
					deleted: {
						message: "Resource deleted successfully",
						deletedAt: new Date().toISOString(),
					},
				};

			default:
				return { success: { message: "Operation completed successfully" } };
		}
	}

	private generateErrorResponses(options: APIFixtureOptions): any {
		return {
			badRequest: {
				error: {
					code: 400,
					message: "Bad Request",
					details: "Invalid request parameters",
					timestamp: new Date().toISOString(),
				},
			},
			unauthorized: {
				error: {
					code: 401,
					message: "Unauthorized",
					details: "Authentication required",
					timestamp: new Date().toISOString(),
				},
			},
			forbidden: {
				error: {
					code: 403,
					message: "Forbidden",
					details: "Insufficient permissions",
					classification: options.classification,
					timestamp: new Date().toISOString(),
				},
			},
			notFound: {
				error: {
					code: 404,
					message: "Not Found",
					details: "Resource not found",
					timestamp: new Date().toISOString(),
				},
			},
			serverError: {
				error: {
					code: 500,
					message: "Internal Server Error",
					details: "An unexpected error occurred",
					timestamp: new Date().toISOString(),
				},
			},
			validationError: {
				error: {
					code: 422,
					message: "Validation Error",
					details: "Request validation failed",
					validationErrors: {
						name: ["Name is required"],
						email: ["Invalid email format"],
					},
					timestamp: new Date().toISOString(),
				},
			},
		};
	}

	private generateLoadingStates(options: APIFixtureOptions): any {
		return {
			pending: { loading: true, data: null, error: null },
			skeleton: {
				loading: true,
				data: this.generateSkeletonData(options),
				error: null,
			},
		};
	}

	private generatePaginationResponses(options: APIFixtureOptions): any {
		const totalItems = options.count || 100;
		const pageSize = 10;
		const totalPages = Math.ceil(totalItems / pageSize);

		return {
			firstPage: {
				data: this.generateResourceList(options, pageSize),
				meta: {
					total: totalItems,
					page: 1,
					limit: pageSize,
					totalPages,
					hasNext: true,
					hasPrev: false,
				},
			},
			middlePage: {
				data: this.generateResourceList(options, pageSize),
				meta: {
					total: totalItems,
					page: 5,
					limit: pageSize,
					totalPages,
					hasNext: true,
					hasPrev: true,
				},
			},
			lastPage: {
				data: this.generateResourceList(
					options,
					totalItems % pageSize || pageSize,
				),
				meta: {
					total: totalItems,
					page: totalPages,
					limit: pageSize,
					totalPages,
					hasNext: false,
					hasPrev: true,
				},
			},
		};
	}

	private generateComplianceResponses(options: APIFixtureOptions): any {
		return {
			nsmCompliant: {
				data: this.generateSingleResource(options),
				compliance: {
					classification: options.classification || NSMClassification.OPEN,
					auditTrail: true,
					encryptionRequired: options.classification !== NSMClassification.OPEN,
				},
			},
			gdprCompliant: {
				data: this.generateSingleResource(options),
				gdpr: {
					consentRequired: true,
					dataMinimization: true,
					rightToErasure: true,
					privacyByDesign: true,
				},
			},
		};
	}

	private generateSingleResource(options: APIFixtureOptions): any {
		// Generate different types of resources based on endpoint
		const endpoint = options.endpoint.toLowerCase();

		if (endpoint.includes("user") || endpoint.includes("person")) {
			return this.dataGenerator.generatePersonalData(this.options);
		}

		if (endpoint.includes("company") || endpoint.includes("organization")) {
			return this.dataGenerator.generate("company", 1)[0];
		}

		if (endpoint.includes("address")) {
			return this.dataGenerator.generate("address", 1)[0];
		}

		// Default resource
		return {
			id: crypto.randomUUID(),
			name: "Test Resource",
			description: "Test resource description",
			status: "active",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
	}

	private generateResourceList(
		options: APIFixtureOptions,
		count: number,
	): any[] {
		const resources = [];
		for (let i = 0; i < count; i++) {
			resources.push({
				...this.generateSingleResource(options),
				id: crypto.randomUUID(),
			});
		}
		return resources;
	}

	private generateSkeletonData(options: APIFixtureOptions): any {
		return {
			id: "________",
			name: "____________",
			description: "________________________",
			status: "______",
			createdAt: "____-__-__T__:__:__.___Z",
		};
	}

	private generateMSWHandlers(
		options: APIFixtureOptions,
		fixtures: any,
	): string {
		const endpoint = options.endpoint;
		const method = options.method.toLowerCase();

		return `
// MSW handlers for ${endpoint}
import { rest } from 'msw';

export const ${endpoint.replace(/[^a-zA-Z0-9]/g, "_")}Handlers = [
  // Success response
  rest.${method}('${endpoint}', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(${JSON.stringify(fixtures.success, null, 4)}),
      ctx.set('Content-Type', 'application/json'),
      ctx.set('X-Norwegian-Compliance', '${options.classification || NSMClassification.OPEN}'),
    );
  }),
  
  // Error responses
  rest.${method}('${endpoint}/error/400', (req, res, ctx) => {
    return res(
      ctx.status(400),
      ctx.json(${JSON.stringify(fixtures.error.badRequest, null, 4)}),
    );
  }),
  
  rest.${method}('${endpoint}/error/500', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json(${JSON.stringify(fixtures.error.serverError, null, 4)}),
    );
  }),
  
  // Compliance responses
  rest.${method}('${endpoint}/compliance', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(${JSON.stringify(fixtures.compliance.nsmCompliant, null, 4)}),
      ctx.set('X-NSM-Classification', '${options.classification || NSMClassification.OPEN}'),
      ctx.set('X-GDPR-Compliant', 'true'),
    );
  }),
];
`;
	}

	private generateAPITypes(options: APIFixtureOptions, fixtures: any): string {
		return `
// Type definitions for ${options.endpoint} API
export interface APIResponse<T = any> {
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  compliance?: {
    classification: NSMClassification;
    auditTrail: boolean;
    encryptionRequired: boolean;
  };
  gdpr?: {
    consentRequired: boolean;
    dataMinimization: boolean;
    rightToErasure: boolean;
    privacyByDesign: boolean;
  };
}

export interface APIError {
  code: number;
  message: string;
  details: string;
  timestamp: string;
  validationErrors?: Record<string, string[]>;
}

export interface LoadingState<T = any> {
  loading: boolean;
  data: T | null;
  error: APIError | null;
}
`;
	}
}

// === Database Fixture Generator ===

/**
 * Generates database test fixtures
 */
export class DatabaseFixtureGenerator {
	constructor(
		private dataGenerator: NorwegianDataGenerator,
		private options: FixtureGenerationOptions = {},
	) {}

	generate(options: DatabaseFixtureOptions): {
		fixtures: Record<string, any[]>;
		seeds: string;
		migrations?: string;
	} {
		const count = options.count || 10;
		const fixtures: Record<string, any[]> = {};

		// Generate main table data
		fixtures[options.tableName] = this.generateTableData(options, count);

		// Generate related table data
		if (options.relationships) {
			for (const relationship of options.relationships) {
				fixtures[relationship.table] = this.generateRelatedTableData(
					options,
					relationship,
					fixtures[options.tableName],
				);
			}
		}

		const seeds = this.generateSeedFile(options, fixtures);
		const migrations = this.generateMigrationFile(options);

		return { fixtures, seeds, migrations };
	}

	private generateTableData(
		options: DatabaseFixtureOptions,
		count: number,
	): any[] {
		const data: any[] = [];

		for (let i = 0; i < count; i++) {
			const record: any = {};

			for (const [field, type] of Object.entries(options.schema)) {
				record[field] = this.generateFieldValue(field, type, i);
			}

			// Add Norwegian compliance fields
			if (
				options.classification &&
				options.classification !== NSMClassification.OPEN
			) {
				record.nsm_classification = options.classification;
				record.audit_created_at = new Date().toISOString();
				record.audit_created_by = crypto.randomUUID();
			}

			data.push(record);
		}

		return data;
	}

	private generateRelatedTableData(
		options: DatabaseFixtureOptions,
		relationship: any,
		parentData: any[],
	): any[] {
		const relatedData: any[] = [];

		for (const parent of parentData) {
			const relatedCount =
				relationship.relationType === "one-to-one"
					? 1
					: relationship.relationType === "one-to-many"
						? Math.floor(Math.random() * 5) + 1
						: Math.floor(Math.random() * 3) + 1;

			for (let i = 0; i < relatedCount; i++) {
				const record: any = {
					id: crypto.randomUUID(),
					[relationship.foreignKey]: parent.id,
				};

				// Add some default fields
				record.created_at = new Date().toISOString();
				record.updated_at = new Date().toISOString();

				relatedData.push(record);
			}
		}

		return relatedData;
	}

	private generateFieldValue(field: string, type: string, index: number): any {
		switch (type.toLowerCase()) {
			case "id":
			case "uuid":
				return crypto.randomUUID();

			case "string":
			case "varchar":
			case "text":
				if (field.includes("name")) {
					const person = this.dataGenerator.generate("person", 1)[0];
					return field.includes("first")
						? person.firstName
						: field.includes("last")
							? person.lastName
							: person.fullName;
				}
				if (field.includes("email")) {
					return this.dataGenerator.generate("person", 1)[0].email;
				}
				if (field.includes("phone")) {
					return this.dataGenerator.generate("phone", 1)[0];
				}
				return `${field}_value_${index}`;

			case "number":
			case "integer":
			case "int":
				return index + 1;

			case "boolean":
			case "bool":
				return Math.random() > 0.5;

			case "date":
			case "datetime":
			case "timestamp":
				return new Date().toISOString();

			case "json":
			case "jsonb":
				return { key: `value_${index}`, nested: { data: true } };

			default:
				return `${field}_${index}`;
		}
	}

	private generateSeedFile(
		options: DatabaseFixtureOptions,
		fixtures: Record<string, any[]>,
	): string {
		return `
-- Database seeds for ${options.tableName}
-- Auto-generated test fixtures with Norwegian compliance

${Object.entries(fixtures)
	.map(
		([tableName, data]) => `
-- Seeds for ${tableName}
INSERT INTO ${tableName} (${Object.keys(data[0] || {}).join(", ")})
VALUES
${data
	.map(
		(record) =>
			`(${Object.values(record)
				.map((value) =>
					typeof value === "string"
						? `'${value}'`
						: value === null
							? "NULL"
							: typeof value === "object"
								? `'${JSON.stringify(value)}'`
								: value,
				)
				.join(", ")})`,
	)
	.join(",\n")};
`,
	)
	.join("\n")}

-- Compliance audit triggers (if classification requires)
${
	options.classification !== NSMClassification.OPEN
		? `
CREATE OR REPLACE FUNCTION audit_${options.tableName}()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (table_name, operation, record_id, old_values, new_values, timestamp, user_id)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
    NOW(),
    current_setting('app.current_user_id', true)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_${options.tableName}_trigger
  AFTER INSERT OR UPDATE OR DELETE ON ${options.tableName}
  FOR EACH ROW EXECUTE FUNCTION audit_${options.tableName}();
`
		: ""
}
`;
	}

	private generateMigrationFile(options: DatabaseFixtureOptions): string {
		return `
-- Migration for ${options.tableName}
-- Norwegian compliance included

CREATE TABLE ${options.tableName} (
  ${Object.entries(options.schema)
		.map(([field, type]) => {
			let sqlType = this.mapTypeToSQL(type);
			let constraints = field === "id" ? "PRIMARY KEY" : "";
			return `${field} ${sqlType} ${constraints}`;
		})
		.join(",\n  ")}${
		options.classification !== NSMClassification.OPEN
			? `,
  
  -- Norwegian compliance fields
  nsm_classification VARCHAR(20) DEFAULT '${options.classification}',
  audit_created_at TIMESTAMP DEFAULT NOW(),
  audit_created_by UUID,
  audit_updated_at TIMESTAMP DEFAULT NOW(),
  audit_updated_by UUID`
			: ""
	}
);

-- Indexes for performance
CREATE INDEX idx_${options.tableName}_created_at ON ${options.tableName}(created_at);
${
	options.classification !== NSMClassification.OPEN
		? `
CREATE INDEX idx_${options.tableName}_nsm_classification ON ${options.tableName}(nsm_classification);
CREATE INDEX idx_${options.tableName}_audit_created_at ON ${options.tableName}(audit_created_at);`
		: ""
}

-- Relationships
${
	options.relationships
		?.map(
			(rel) => `
CREATE TABLE ${rel.table} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ${rel.foreignKey} UUID REFERENCES ${options.tableName}(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_${rel.table}_${rel.foreignKey} ON ${rel.table}(${rel.foreignKey});
`,
		)
		.join("\n") || ""
}
`;
	}

	private mapTypeToSQL(type: string): string {
		switch (type.toLowerCase()) {
			case "id":
			case "uuid":
				return "UUID DEFAULT gen_random_uuid()";
			case "string":
			case "varchar":
				return "VARCHAR(255)";
			case "text":
				return "TEXT";
			case "number":
			case "integer":
			case "int":
				return "INTEGER";
			case "boolean":
			case "bool":
				return "BOOLEAN";
			case "date":
				return "DATE";
			case "datetime":
			case "timestamp":
				return "TIMESTAMP";
			case "json":
			case "jsonb":
				return "JSONB";
			default:
				return "TEXT";
		}
	}
}

// === Localization Fixture Generator ===

/**
 * Generates localization test fixtures
 */
export class LocalizationFixtureGenerator {
	constructor(
		private dataGenerator: NorwegianDataGenerator,
		private options: FixtureGenerationOptions = {},
	) {}

	generate(locales: LocaleCode[]): {
		fixtures: Record<LocaleCode, Record<string, string>>;
		testHelpers: string;
	} {
		const fixtures: Record<LocaleCode, Record<string, string>> = {};

		for (const locale of locales) {
			fixtures[locale] = this.generateLocaleFixtures(locale);
		}

		const testHelpers = this.generateLocalizationTestHelpers(fixtures);

		return { fixtures, testHelpers };
	}

	private generateLocaleFixtures(locale: LocaleCode): Record<string, string> {
		const translations: Record<string, string> = {};

		// Common UI translations
		const commonKeys = [
			"welcome",
			"hello",
			"goodbye",
			"yes",
			"no",
			"ok",
			"cancel",
			"save",
			"delete",
			"edit",
			"create",
			"update",
			"submit",
			"reset",
			"close",
			"open",
			"back",
			"next",
			"previous",
			"home",
			"about",
			"contact",
			"help",
			"settings",
			"profile",
			"logout",
			"loading",
			"error",
			"success",
			"warning",
			"info",
			"required",
			"optional",
		];

		for (const key of commonKeys) {
			translations[key] = this.getTranslation(key, locale);
		}

		// Norwegian compliance specific translations
		translations["compliance.nsm.classification"] = this.getTranslation(
			"nsm_classification",
			locale,
		);
		translations["compliance.gdpr.consent"] = this.getTranslation(
			"gdpr_consent",
			locale,
		);
		translations["compliance.wcag.accessibility"] = this.getTranslation(
			"accessibility",
			locale,
		);

		// Form validation messages
		translations["validation.required"] = this.getTranslation(
			"field_required",
			locale,
		);
		translations["validation.email"] = this.getTranslation(
			"invalid_email",
			locale,
		);
		translations["validation.phone"] = this.getTranslation(
			"invalid_phone",
			locale,
		);

		return translations;
	}

	private getTranslation(key: string, locale: LocaleCode): string {
		const translations: Record<string, Record<LocaleCode, string>> = {
			welcome: {
				"nb-NO": "Velkommen",
				"nn-NO": "Velkomen",
				"en-US": "Welcome",
				"ar-SA": "أهلاً وسهلاً",
				"fr-FR": "Bienvenue",
			},
			hello: {
				"nb-NO": "Hei",
				"nn-NO": "Hei",
				"en-US": "Hello",
				"ar-SA": "مرحبا",
				"fr-FR": "Bonjour",
			},
			yes: {
				"nb-NO": "Ja",
				"nn-NO": "Ja",
				"en-US": "Yes",
				"ar-SA": "نعم",
				"fr-FR": "Oui",
			},
			no: {
				"nb-NO": "Nei",
				"nn-NO": "Nei",
				"en-US": "No",
				"ar-SA": "لا",
				"fr-FR": "Non",
			},
			save: {
				"nb-NO": "Lagre",
				"nn-NO": "Lagre",
				"en-US": "Save",
				"ar-SA": "حفظ",
				"fr-FR": "Enregistrer",
			},
			nsm_classification: {
				"nb-NO": "NSM-klassifisering",
				"nn-NO": "NSM-klassifisering",
				"en-US": "NSM Classification",
				"ar-SA": "تصنيف NSM",
				"fr-FR": "Classification NSM",
			},
			gdpr_consent: {
				"nb-NO": "GDPR-samtykke",
				"nn-NO": "GDPR-samtykke",
				"en-US": "GDPR Consent",
				"ar-SA": "موافقة GDPR",
				"fr-FR": "Consentement RGPD",
			},
			accessibility: {
				"nb-NO": "Tilgjengelighet",
				"nn-NO": "Tilgjenge",
				"en-US": "Accessibility",
				"ar-SA": "إمكانية الوصول",
				"fr-FR": "Accessibilité",
			},
			field_required: {
				"nb-NO": "Dette feltet er påkrevd",
				"nn-NO": "Dette feltet er påkravd",
				"en-US": "This field is required",
				"ar-SA": "هذا الحقل مطلوب",
				"fr-FR": "Ce champ est requis",
			},
		};

		return translations[key]?.[locale] || `[${key}]`;
	}

	private generateLocalizationTestHelpers(
		fixtures: Record<LocaleCode, Record<string, string>>,
	): string {
		return `
// Localization test helpers
export const LocalizationTestHelpers = {
  // Test that all locales have the same keys
  assertKeysConsistent: () => {
    const locales = Object.keys(fixtures);
    const allKeys = new Set();
    
    // Collect all keys from all locales
    locales.forEach(locale => {
      Object.keys(fixtures[locale]).forEach(key => allKeys.add(key));
    });
    
    // Check that each locale has all keys
    locales.forEach(locale => {
      allKeys.forEach(key => {
        expect(fixtures[locale]).toHaveProperty(key);
        expect(typeof fixtures[locale][key]).toBe('string');
        expect(fixtures[locale][key].length).toBeGreaterThan(0);
      });
    });
  },
  
  // Test Norwegian-specific content
  assertNorwegianContent: (locale, key) => {
    const value = fixtures[locale][key];
    
    if (locale.startsWith('nb-') || locale.startsWith('nn-')) {
      // Should contain Norwegian characters if appropriate
      const norwegianPattern = /[æøåÆØÅ]/;
      // Some words should have Norwegian characters
      if (['velkommen', 'tilgjengelighet'].some(word => value.toLowerCase().includes(word))) {
        expect(norwegianPattern.test(value)).toBe(true);
      }
    }
  },
  
  // Test RTL support for Arabic
  assertRTLSupport: (locale) => {
    if (locale === 'ar-SA') {
      // Arabic text should be present
      const arabicPattern = /[\u0600-\u06FF]/;
      const sampleKey = 'welcome';
      expect(arabicPattern.test(fixtures[locale][sampleKey])).toBe(true);
    }
  },
  
  // Get translation with fallback
  getTranslation: (key, locale, fallback = '[missing]') => {
    return fixtures[locale]?.[key] || fixtures['en-US']?.[key] || fallback;
  },
  
  // Test compliance translations
  assertComplianceTranslations: (locale) => {
    const complianceKeys = [
      'compliance.nsm.classification',
      'compliance.gdpr.consent', 
      'compliance.wcag.accessibility'
    ];
    
    complianceKeys.forEach(key => {
      expect(fixtures[locale]).toHaveProperty(key);
      expect(fixtures[locale][key]).toBeTruthy();
    });
  },
};
`;
	}
}

// === Compliance Fixture Generator ===

/**
 * Generates compliance scenario fixtures
 */
export class ComplianceFixtureGenerator {
	constructor(
		private dataGenerator: NorwegianDataGenerator,
		private options: FixtureGenerationOptions = {},
	) {}

	generate(classification: NSMClassification): {
		fixtures: Record<string, any>;
		scenarios: string;
		validators: string;
	} {
		const fixtures = {
			nsmScenarios: this.generateNSMScenarios(classification),
			gdprScenarios: this.generateGDPRScenarios(classification),
			wcagScenarios: this.generateWCAGScenarios(),
			auditScenarios: this.generateAuditScenarios(classification),
		};

		const scenarios = this.generateTestScenarios(fixtures);
		const validators = this.generateComplianceValidators(fixtures);

		return { fixtures, scenarios, validators };
	}

	private generateNSMScenarios(classification: NSMClassification): any {
		return {
			[NSMClassification.OPEN]: {
				requiresAuthentication: false,
				requiresEncryption: false,
				requiresAuditLogging: false,
				allowedLocations: ["NO", "EU", "Global"],
				securityHeaders: ["X-Frame-Options", "X-Content-Type-Options"],
			},
			[NSMClassification.RESTRICTED]: {
				requiresAuthentication: true,
				requiresEncryption: false,
				requiresAuditLogging: true,
				allowedLocations: ["NO", "EU"],
				securityHeaders: [
					"X-Frame-Options",
					"X-Content-Type-Options",
					"Strict-Transport-Security",
				],
			},
			[NSMClassification.CONFIDENTIAL]: {
				requiresAuthentication: true,
				requiresEncryption: true,
				requiresAuditLogging: true,
				allowedLocations: ["NO"],
				securityHeaders: [
					"X-Frame-Options",
					"X-Content-Type-Options",
					"Strict-Transport-Security",
					"Content-Security-Policy",
				],
			},
			[NSMClassification.SECRET]: {
				requiresAuthentication: true,
				requiresEncryption: true,
				requiresAuditLogging: true,
				allowedLocations: ["NO"],
				securityHeaders: [
					"X-Frame-Options",
					"X-Content-Type-Options",
					"Strict-Transport-Security",
					"Content-Security-Policy",
					"Referrer-Policy",
				],
			},
		};
	}

	private generateGDPRScenarios(classification: NSMClassification): any {
		return {
			consentRequired: classification !== NSMClassification.OPEN,
			dataMinimization: true,
			rightToErasure: classification !== NSMClassification.OPEN,
			dataPortability: classification !== NSMClassification.OPEN,
			privacyByDesign: true,
			dpoRequired:
				classification === NSMClassification.CONFIDENTIAL ||
				classification === NSMClassification.SECRET,
			allowedCountries:
				classification === NSMClassification.SECRET ? ["NO"] : ["NO", "EU"],
		};
	}

	private generateWCAGScenarios(): any {
		return {
			level: "AAA",
			requirements: {
				altText: true,
				keyboardNavigation: true,
				screenReaderSupport: true,
				colorContrast: 7.0, // AAA level
				focusIndicators: true,
				semanticHTML: true,
				ariaLabels: true,
				languageDeclaration: true,
				resizeSupport: true,
				motionReducedSupport: true,
			},
			testCases: [
				{
					element: "img",
					requirement: "alt",
					valid: "Image description",
					invalid: "",
				},
				{
					element: "button",
					requirement: "aria-label",
					valid: "Submit form",
					invalid: null,
				},
				{
					element: "input",
					requirement: "label",
					valid: "associated",
					invalid: "missing",
				},
			],
		};
	}

	private generateAuditScenarios(classification: NSMClassification): any {
		if (classification === NSMClassification.OPEN) {
			return { enabled: false };
		}

		return {
			enabled: true,
			events: [
				{ action: "login", severity: "info", required: true },
				{ action: "logout", severity: "info", required: true },
				{ action: "data_access", severity: "info", required: true },
				{ action: "data_modification", severity: "warning", required: true },
				{ action: "permission_change", severity: "critical", required: true },
				{ action: "system_error", severity: "error", required: true },
			],
			retention: {
				[NSMClassification.RESTRICTED]: 24, // months
				[NSMClassification.CONFIDENTIAL]: 60,
				[NSMClassification.SECRET]: 120,
			}[classification],
			encryption: true,
		};
	}

	private generateTestScenarios(fixtures: any): string {
		return `
// Norwegian compliance test scenarios
export const ComplianceScenarios = {
  // NSM compliance tests
  testNSMCompliance: (classification) => {
    const scenario = fixtures.nsmScenarios[classification];
    
    describe('NSM Compliance', () => {
      test('authentication requirements', () => {
        if (scenario.requiresAuthentication) {
          expect(hasAuthentication()).toBe(true);
        }
      });
      
      test('encryption requirements', () => {
        if (scenario.requiresEncryption) {
          expect(hasEncryption()).toBe(true);
        }
      });
      
      test('audit logging requirements', () => {
        if (scenario.requiresAuditLogging) {
          expect(hasAuditLogging()).toBe(true);
        }
      });
      
      test('security headers', () => {
        scenario.securityHeaders.forEach(header => {
          expect(hasSecurityHeader(header)).toBe(true);
        });
      });
    });
  },
  
  // GDPR compliance tests
  testGDPRCompliance: (classification) => {
    const scenario = fixtures.gdprScenarios;
    
    describe('GDPR Compliance', () => {
      test('consent management', () => {
        if (scenario.consentRequired) {
          expect(hasConsentManagement()).toBe(true);
        }
      });
      
      test('data minimization', () => {
        expect(hasDataMinimization()).toBe(true);
      });
      
      test('right to erasure', () => {
        if (scenario.rightToErasure) {
          expect(hasRightToErasure()).toBe(true);
        }
      });
    });
  },
  
  // WCAG compliance tests
  testWCAGCompliance: () => {
    const scenario = fixtures.wcagScenarios;
    
    describe('WCAG AAA Compliance', () => {
      test('alt text for images', () => {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
          expect(img.getAttribute('alt')).toBeTruthy();
        });
      });
      
      test('keyboard navigation', () => {
        const interactive = document.querySelectorAll('button, input, select, textarea, a');
        interactive.forEach(element => {
          expect(element.hasAttribute('tabindex') || element.tabIndex >= 0).toBe(true);
        });
      });
      
      test('ARIA labels', () => {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
          const hasLabel = button.hasAttribute('aria-label') || 
                          button.hasAttribute('aria-labelledby') ||
                          button.textContent?.trim();
          expect(hasLabel).toBeTruthy();
        });
      });
    });
  },
};
`;
	}

	private generateComplianceValidators(fixtures: any): string {
		return `
// Compliance validators
export const ComplianceValidators = {
  validateNSMCompliance: (classification, implementation) => {
    const requirements = fixtures.nsmScenarios[classification];
    const violations = [];
    
    if (requirements.requiresAuthentication && !implementation.hasAuthentication) {
      violations.push('Authentication required for classification: ' + classification);
    }
    
    if (requirements.requiresEncryption && !implementation.hasEncryption) {
      violations.push('Encryption required for classification: ' + classification);
    }
    
    if (requirements.requiresAuditLogging && !implementation.hasAuditLogging) {
      violations.push('Audit logging required for classification: ' + classification);
    }
    
    requirements.securityHeaders.forEach(header => {
      if (!implementation.securityHeaders.includes(header)) {
        violations.push(\`Security header required: \${header}\`);
      }
    });
    
    return { valid: violations.length === 0, violations };
  },
  
  validateGDPRCompliance: (classification, implementation) => {
    const requirements = fixtures.gdprScenarios;
    const violations = [];
    
    if (requirements.consentRequired && !implementation.hasConsentManagement) {
      violations.push('GDPR consent management required');
    }
    
    if (requirements.rightToErasure && !implementation.hasRightToErasure) {
      violations.push('GDPR right to erasure required');
    }
    
    if (!implementation.hasDataMinimization) {
      violations.push('GDPR data minimization required');
    }
    
    return { valid: violations.length === 0, violations };
  },
  
  validateWCAGCompliance: (element) => {
    const requirements = fixtures.wcagScenarios.requirements;
    const violations = [];
    
    // Check alt text for images  
    if (element.tagName === 'IMG' && !element.getAttribute('alt')) {
      violations.push('Image missing alt text');
    }
    
    // Check ARIA labels for interactive elements
    const interactive = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A'];
    if (interactive.includes(element.tagName)) {
      const hasAriaLabel = element.hasAttribute('aria-label') || 
                          element.hasAttribute('aria-labelledby') ||
                          element.textContent?.trim();
      if (!hasAriaLabel) {
        violations.push(\`Interactive element missing accessible name: \${element.tagName}\`);
      }
    }
    
    return { valid: violations.length === 0, violations };
  },
};
`;
	}
}

// === Export Fixture Generator ===

export default FixtureGenerator;
