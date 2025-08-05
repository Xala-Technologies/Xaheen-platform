export interface TestingOptions {
	readonly projectName: string;
	readonly projectPath: string;
	readonly testingFramework: "jest" | "vitest" | "mocha";
	readonly language: "typescript" | "javascript";
	readonly platform: "node" | "browser" | "universal";
	readonly includeE2E?: boolean;
	readonly includePerformance?: boolean;
	readonly includeMocks?: boolean;
	readonly includeContractTesting?: boolean;
	readonly databaseType?:
		| "postgresql"
		| "mysql"
		| "mongodb"
		| "sqlite"
		| "redis";
	readonly apiFramework?: "express" | "fastify" | "nestjs" | "trpc" | "graphql";
	readonly coverage?: {
		threshold: number;
		reporters: string[];
	};
}

export interface UnitTestOptions extends TestingOptions {
	readonly layers: (
		| "controller"
		| "service"
		| "repository"
		| "utils"
		| "components"
	)[];
	readonly mockStrategy: "jest" | "sinon" | "vitest" | "manual";
}

export interface IntegrationTestOptions extends TestingOptions {
	readonly services: string[];
	readonly databases: string[];
	readonly externalServices: string[];
}

export interface E2ETestOptions extends TestingOptions {
	readonly browserFramework: "playwright" | "cypress" | "puppeteer";
	readonly environments: ("local" | "staging" | "production")[];
	readonly userFlows: string[];
}

export interface PerformanceTestOptions extends TestingOptions {
	readonly tool: "k6" | "artillery" | "jmeter" | "autocannon";
	readonly scenarios: PerformanceScenario[];
}

export interface PerformanceScenario {
	readonly name: string;
	readonly type: "load" | "stress" | "spike" | "volume" | "endurance";
	readonly virtualUsers: number;
	readonly duration: string;
	readonly rampUpTime?: string;
	readonly thresholds: {
		readonly [key: string]: string;
	};
}

export interface MockFactoryOptions extends TestingOptions {
	readonly entities: string[];
	readonly relationships: boolean;
	readonly dataTypes: (
		| "primitive"
		| "date"
		| "uuid"
		| "email"
		| "url"
		| "json"
	)[];
	readonly localization: boolean;
}

export interface ContractTestOptions extends TestingOptions {
	readonly providerServices: string[];
	readonly consumerServices: string[];
	readonly contractFramework: "pact" | "openapi" | "asyncapi";
}

export interface DatabaseTestOptions extends TestingOptions {
	readonly migrations: boolean;
	readonly seeds: boolean;
	readonly transactions: boolean;
	readonly cleanup: boolean;
}

export interface APITestOptions extends TestingOptions {
	readonly endpoints: APIEndpoint[];
	readonly authenticationMethods: ("jwt" | "oauth" | "apikey" | "basic")[];
	readonly responseValidation: boolean;
	readonly schemaValidation: boolean;
}

export interface APIEndpoint {
	readonly path: string;
	readonly method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	readonly authenticated: boolean;
	readonly parameters?: {
		readonly [key: string]: "string" | "number" | "boolean" | "object";
	};
	readonly responseSchema?: object;
}

export interface TestTemplate {
	readonly name: string;
	readonly path: string;
	readonly content: string;
	readonly dependencies?: string[];
}

export interface PropertyBasedTestOptions extends TestingOptions {
	readonly properties: PropertyTestConfig[];
	readonly generators: GeneratorConfig[];
	readonly shrinkingEnabled: boolean;
	readonly maxTests: number;
	readonly seed?: number;
	readonly businessLogicDomains: string[];
}

export interface PropertyTestConfig {
	readonly name: string;
	readonly domain: string;
	readonly description: string;
	readonly inputTypes: DataType[];
	readonly constraints: PropertyConstraint[];
	readonly invariants: string[];
	readonly postconditions: string[];
	readonly preconditions?: string[];
}

export interface GeneratorConfig {
	readonly name: string;
	readonly type: DataType;
	readonly parameters: GeneratorParameter[];
	readonly constraints?: GeneratorConstraint[];
}

export interface PropertyConstraint {
	readonly field: string;
	readonly rule: "range" | "length" | "pattern" | "custom";
	readonly value: any;
	readonly description: string;
}

export interface GeneratorParameter {
	readonly name: string;
	readonly type: string;
	readonly defaultValue?: any;
	readonly description: string;
}

export interface GeneratorConstraint {
	readonly type: "min" | "max" | "pattern" | "custom";
	readonly value: any;
}

export interface MutationTestOptions extends TestingOptions {
	readonly mutators: MutatorConfig[];
	readonly thresholds: MutationThresholds;
	readonly excludePatterns: string[];
	readonly reportFormat: ("html" | "json" | "text" | "dashboard")[];
	readonly incrementalEnabled: boolean;
	readonly parallelJobs: number;
}

export interface MutatorConfig {
	readonly name: string;
	readonly enabled: boolean;
	readonly description: string;
	readonly applicableLanguages: string[];
}

export interface MutationThresholds {
	readonly mutationScore: number;
	readonly coverageThreshold: number;
	readonly highRiskMutationScore: number;
}

export interface DataType {
	readonly name: string;
	readonly primitive: boolean;
	readonly nullable: boolean;
	readonly arrayType?: DataType;
	readonly objectProperties?: Record<string, DataType>;
}

export interface TestSuite {
	readonly name: string;
	readonly description: string;
	readonly templates: TestTemplate[];
	readonly configuration: object;
	readonly setupFiles: string[];
	readonly teardownFiles: string[];
}
