export interface TestingOptions {
  readonly projectName: string;
  readonly projectPath: string;
  readonly testingFramework: 'jest' | 'vitest' | 'mocha';
  readonly language: 'typescript' | 'javascript';
  readonly platform: 'node' | 'browser' | 'universal';
  readonly includeE2E?: boolean;
  readonly includePerformance?: boolean;
  readonly includeMocks?: boolean;
  readonly includeContractTesting?: boolean;
  readonly databaseType?: 'postgresql' | 'mysql' | 'mongodb' | 'sqlite' | 'redis';
  readonly apiFramework?: 'express' | 'fastify' | 'nestjs' | 'trpc' | 'graphql';
  readonly coverage?: {
    threshold: number;
    reporters: string[];
  };
}

export interface UnitTestOptions extends TestingOptions {
  readonly layers: ('controller' | 'service' | 'repository' | 'utils' | 'components')[];
  readonly mockStrategy: 'jest' | 'sinon' | 'vitest' | 'manual';
}

export interface IntegrationTestOptions extends TestingOptions {
  readonly services: string[];
  readonly databases: string[];
  readonly externalServices: string[];
}

export interface E2ETestOptions extends TestingOptions {
  readonly browserFramework: 'playwright' | 'cypress' | 'puppeteer';
  readonly environments: ('local' | 'staging' | 'production')[];
  readonly userFlows: string[];
}

export interface PerformanceTestOptions extends TestingOptions {
  readonly tool: 'k6' | 'artillery' | 'jmeter' | 'autocannon';
  readonly scenarios: PerformanceScenario[];
}

export interface PerformanceScenario {
  readonly name: string;
  readonly type: 'load' | 'stress' | 'spike' | 'volume' | 'endurance';
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
  readonly dataTypes: ('primitive' | 'date' | 'uuid' | 'email' | 'url' | 'json')[];
  readonly localization: boolean;
}

export interface ContractTestOptions extends TestingOptions {
  readonly providerServices: string[];
  readonly consumerServices: string[];
  readonly contractFramework: 'pact' | 'openapi' | 'asyncapi';
}

export interface DatabaseTestOptions extends TestingOptions {
  readonly migrations: boolean;
  readonly seeds: boolean;
  readonly transactions: boolean;
  readonly cleanup: boolean;
}

export interface APITestOptions extends TestingOptions {
  readonly endpoints: APIEndpoint[];
  readonly authenticationMethods: ('jwt' | 'oauth' | 'apikey' | 'basic')[];
  readonly responseValidation: boolean;
  readonly schemaValidation: boolean;
}

export interface APIEndpoint {
  readonly path: string;
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  readonly authenticated: boolean;
  readonly parameters?: {
    readonly [key: string]: 'string' | 'number' | 'boolean' | 'object';
  };
  readonly responseSchema?: object;
}

export interface TestTemplate {
  readonly name: string;
  readonly path: string;
  readonly content: string;
  readonly dependencies?: string[];
}

export interface TestSuite {
  readonly name: string;
  readonly description: string;
  readonly templates: TestTemplate[];
  readonly configuration: object;
  readonly setupFiles: string[];
  readonly teardownFiles: string[];
}