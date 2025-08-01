/**
 * Testing Infrastructure Module
 *
 * Comprehensive testing infrastructure for the Xala scaffolding system
 * with Norwegian compliance and enterprise-grade testing capabilities.
 *
 * This module provides:
 * - Complete test framework with multi-framework support
 * - Norwegian compliance testing utilities
 * - Mock and fixture generation systems
 * - Performance and accessibility testing
 * - Test environment management
 * - Enterprise testing patterns
 */

export type {
	APIFixtureOptions,
	ComponentFixtureOptions,
	DatabaseFixtureOptions,
	FixtureGenerationOptions,
} from "./fixture-generator.js";
// === Fixture Generation System ===
export {
	APIFixtureGenerator,
	ComplianceFixtureGenerator,
	ComponentFixtureGenerator,
	DatabaseFixtureGenerator,
	FixtureGenerator,
	LocalizationFixtureGenerator,
} from "./fixture-generator.js";
export type {
	APIMockOptions,
	ComponentMockOptions,
	MockGenerationOptions,
	NorwegianAddressData,
	NorwegianCompanyData,
	NorwegianDataTypes,
	NorwegianPersonData,
	ServiceMockOptions,
} from "./mock-generator.js";

// === Mock Generation System ===
export {
	APIMockGenerator,
	ComponentMockGenerator,
	MockGenerator,
	NorwegianDataGenerator,
	ServiceMockGenerator,
} from "./mock-generator.js";
// === Core Testing Framework ===
export {
	CoverageReport,
	JestTestRunner,
	PerformanceMetrics,
	PlaywrightTestRunner,
	TestConfig,
	TestError,
	TestExecutionResult,
	TestFramework,
	TestFrameworkService,
	TestGenerationOptions,
	TestRunner,
	TestSuite,
	TestType,
	VitestTestRunner,
} from "./test-framework.js";
export type { TestEnvironmentConfig } from "./test-utils.js";
// === Testing Utilities ===
export {
	ComplianceAssertions,
	DOMTestingUtils,
	FileSystemTestingUtils,
	NorwegianLocalizationTestingUtils,
	PerformanceTestingUtils,
	setupTestEnvironment,
	TestEnvironmentManager,
	TestUtils,
	teardownTestEnvironment,
} from "./test-utils.js";

// === Testing Module Information ===

/**
 * Testing infrastructure module information
 */
export const TESTING_MODULE_INFO = {
	name: "Testing Infrastructure Module",
	version: "1.0.0",
	description:
		"Comprehensive testing infrastructure for Norwegian compliance and enterprise development",
	author: "Xala Technologies",
	features: [
		"Multi-framework test support (Jest, Vitest, Playwright)",
		"Norwegian compliance testing utilities",
		"Automated mock and fixture generation",
		"Performance and accessibility testing tools",
		"WCAG AAA accessibility validation",
		"NSM security compliance testing",
		"GDPR data protection testing",
		"Multi-language testing support",
		"Enterprise-grade test patterns",
		"Real-time test environment management",
	],
	frameworks: {
		supported: ["Jest", "Vitest", "Playwright", "Cypress"],
		default: "Jest",
		recommended: "Vitest",
	},
	compliance: {
		nsm: ["OPEN", "RESTRICTED", "CONFIDENTIAL", "SECRET"],
		gdpr: true,
		wcag: "AAA",
		norwegian: true,
	},
	coverage: {
		required: 95,
		types: ["lines", "functions", "branches", "statements"],
	},
	compatibility: {
		nodeJs: ">=18.0.0",
		typescript: ">=5.0.0",
		react: ">=18.0.0",
		vue: ">=3.0.0",
		angular: ">=16.0.0",
	},
} as const;

// === Quick Setup Functions ===

/**
 * Quick setup for Norwegian compliance testing
 */
export async function setupNorwegianComplianceTesting(
	options: {
		classification?: "OPEN" | "RESTRICTED" | "CONFIDENTIAL" | "SECRET";
		locale?: "nb-NO" | "nn-NO" | "en-US" | "ar-SA" | "fr-FR";
		framework?: "jest" | "vitest" | "playwright";
	} = {},
): Promise<{
	testFramework: TestFrameworkService;
	mockGenerator: MockGenerator;
	fixtureGenerator: FixtureGenerator;
	cleanup: () => Promise<void>;
}> {
	// Setup test environment
	await setupTestEnvironment({
		framework: TestFramework.JEST,
		locale: (options.locale || "nb-NO") as any,
		classification: (options.classification || "OPEN") as any,
		enableAccessibility: true,
		enablePerformance: true,
		enableCompliance: true,
		mockServices: true,
		cleanupAfterEach: true,
	});

	// Create testing services
	const testFramework = new TestFrameworkService({
		framework: TestFramework.JEST,
		testDir: "__tests__",
		coverageDir: "coverage",
		reportsDir: "test-reports",
		coverageThreshold: {
			global: {
				branches: 95,
				functions: 95,
				lines: 95,
				statements: 95,
			},
		},
	});

	const mockGenerator = new MockGenerator({
		locale: options.locale as any,
		classification: options.classification as any,
		realistic: true,
		includeCompliantData: true,
	});

	const fixtureGenerator = new FixtureGenerator({
		locale: options.locale as any,
		classification: options.classification as any,
		count: 10,
		realistic: true,
		includeEdgeCases: true,
		includeErrorStates: true,
	});

	// Initialize services
	await testFramework.initialize();

	return {
		testFramework,
		mockGenerator,
		fixtureGenerator,
		cleanup: async () => {
			await testFramework.dispose();
			await teardownTestEnvironment();
		},
	};
}

/**
 * Quick setup for component testing
 */
export async function setupComponentTesting(
	componentName: string,
	options: {
		framework?: "react" | "vue" | "angular";
		includeAccessibility?: boolean;
		includePerformance?: boolean;
		includeStorybook?: boolean;
	} = {},
): Promise<{
	mocks: any;
	fixtures: any;
	testHelpers: any;
	cleanup: () => Promise<void>;
}> {
	const mockGenerator = new MockGenerator({
		realistic: true,
		includeCompliantData: true,
	});

	const fixtureGenerator = new FixtureGenerator({
		realistic: true,
		includeEdgeCases: true,
		includeErrorStates: true,
	});

	// Generate component-specific testing resources
	const mocks = mockGenerator.generateComponentMock({
		componentName,
		framework: options.framework || "react",
		includeEvents: true,
		includeRefs: true,
	});

	const fixtures = fixtureGenerator.generateComponentFixtures({
		componentName,
		includeVariants: true,
		includeStorybook: options.includeStorybook,
	});

	const testHelpers = {
		renderComponent: (props: any = {}) => {
			// Component rendering helper implementation
			return { container: document.createElement("div") };
		},

		assertAccessibility: async (element: Element) => {
			if (options.includeAccessibility) {
				return await DOMTestingUtils.checkAccessibility(element);
			}
			return { violations: [], passes: [], incomplete: [] };
		},

		measurePerformance: async (renderFn: () => any) => {
			if (options.includePerformance) {
				return await PerformanceTestingUtils.measureRenderTime(renderFn);
			}
			return { average: 0, min: 0, max: 0, measurements: [] };
		},
	};

	return {
		mocks,
		fixtures,
		testHelpers,
		cleanup: async () => {
			await teardownTestEnvironment();
		},
	};
}

/**
 * Quick setup for API testing
 */
export async function setupAPITesting(
	endpoints: Array<{
		method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
		path: string;
		responseType?: string;
	}>,
	options: {
		baseUrl?: string;
		includeErrorResponses?: boolean;
		includeComplianceHeaders?: boolean;
	} = {},
): Promise<{
	fixtures: any;
	handlers: any;
	mockServer: any;
	cleanup: () => Promise<void>;
}> {
	const fixtureGenerator = new FixtureGenerator({
		realistic: true,
		includeEdgeCases: true,
		includeErrorStates: options.includeErrorResponses,
	});

	const apiFixtures = endpoints.map((endpoint) =>
		fixtureGenerator.generateAPIFixtures({
			endpoint: endpoint.path,
			method: endpoint.method,
			responseType: endpoint.responseType,
			baseUrl: options.baseUrl,
			includeErrorResponses: options.includeErrorResponses,
		}),
	);

	// Mock server setup would be implemented here
	const mockServer = {
		start: () => console.log("Mock server started"),
		stop: () => console.log("Mock server stopped"),
		reset: () => console.log("Mock server reset"),
	};

	return {
		fixtures: apiFixtures,
		handlers: apiFixtures.map((f) => f.handlers),
		mockServer,
		cleanup: async () => {
			mockServer.stop();
			await teardownTestEnvironment();
		},
	};
}

/**
 * Quick setup for performance testing
 */
export async function setupPerformanceTesting(
	options: {
		benchmarks?: {
			renderTime?: number;
			memoryUsage?: number;
			bundleSize?: number;
		};
	} = {},
): Promise<{
	fixtures: any;
	benchmarks: any;
	testHelpers: any;
	cleanup: () => Promise<void>;
}> {
	const fixtureGenerator = new FixtureGenerator({
		realistic: true,
		count: 1000, // Large dataset for performance testing
	});

	const performanceFixtures = fixtureGenerator.generatePerformanceFixtures({
		realistic: true,
		count: 1000,
	});

	const benchmarks = options.benchmarks || {
		renderTime: 16, // 60fps
		memoryUsage: 50 * 1024 * 1024, // 50MB
		bundleSize: 250 * 1024, // 250KB
	};

	const testHelpers = {
		measureRenderTime: PerformanceTestingUtils.measureRenderTime,
		getMemoryUsage: PerformanceTestingUtils.getMemoryUsage,
		assertPerformanceRequirements:
			PerformanceTestingUtils.assertPerformanceRequirements,
	};

	return {
		fixtures: performanceFixtures,
		benchmarks,
		testHelpers,
		cleanup: async () => {
			await teardownTestEnvironment();
		},
	};
}

// === Default Export ===

/**
 * Default testing infrastructure setup
 */
export default {
	// Core services
	TestFrameworkService,
	MockGenerator,
	FixtureGenerator,
	TestUtils,

	// Quick setup functions
	setupNorwegianComplianceTesting,
	setupComponentTesting,
	setupAPITesting,
	setupPerformanceTesting,

	// Utilities
	setupTestEnvironment,
	teardownTestEnvironment,

	// Module information
	TESTING_MODULE_INFO,
};
