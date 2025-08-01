/**
 * Mock Generation System
 *
 * Automated mock generation for testing with Norwegian compliance support.
 * Creates realistic test data, mocks for services, and Norwegian-specific
 * mock data for comprehensive testing.
 *
 * Features:
 * - Component mock generation
 * - Service mock creation
 * - Norwegian data mocks (names, addresses, phone numbers)
 * - API response mocks
 * - File system mocks
 * - Localization mocks
 * - Compliance-aware mock data
 * - TypeScript-first mock generation
 */

import { LocaleCode } from "../localization/types.js";
import { logger } from "../utils/logger.js";
import { NSMClassification } from "./test-framework.js";

// === Mock Generation Types ===

/**
 * Mock generation options
 */
export interface MockGenerationOptions {
	locale?: LocaleCode;
	classification?: NSMClassification;
	seed?: number;
	realistic?: boolean;
	includePersonalData?: boolean;
	includeCompliantData?: boolean;
}

/**
 * Component mock options
 */
export interface ComponentMockOptions extends MockGenerationOptions {
	componentName: string;
	propsInterface?: string;
	includeEvents?: boolean;
	includeRefs?: boolean;
	framework?: "react" | "vue" | "angular";
}

/**
 * Service mock options
 */
export interface ServiceMockOptions extends MockGenerationOptions {
	serviceName: string;
	methods: Array<{
		name: string;
		returnType: string;
		async?: boolean;
	}>;
	includeErrorScenarios?: boolean;
}

/**
 * API mock options
 */
export interface APIMockOptions extends MockGenerationOptions {
	baseUrl?: string;
	endpoints: Array<{
		method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
		path: string;
		responseType: string;
	}>;
	includeErrorResponses?: boolean;
	includeLoadingStates?: boolean;
}

// === Main Mock Generator ===

/**
 * Main mock generation service
 */
export class MockGenerator {
	private dataGenerator: NorwegianDataGenerator;
	private componentGenerator: ComponentMockGenerator;
	private serviceGenerator: ServiceMockGenerator;
	private apiGenerator: APIMockGenerator;

	constructor(private defaultOptions: MockGenerationOptions = {}) {
		this.dataGenerator = new NorwegianDataGenerator(defaultOptions);
		this.componentGenerator = new ComponentMockGenerator(defaultOptions);
		this.serviceGenerator = new ServiceMockGenerator(defaultOptions);
		this.apiGenerator = new APIMockGenerator(defaultOptions);
	}

	/**
	 * Generate component mock
	 */
	generateComponentMock(options: ComponentMockOptions): {
		mockCode: string;
		testHelpers: string;
		types: string;
	} {
		return this.componentGenerator.generate(options);
	}

	/**
	 * Generate service mock
	 */
	generateServiceMock(options: ServiceMockOptions): {
		mockCode: string;
		testHelpers: string;
		types: string;
	} {
		return this.serviceGenerator.generate(options);
	}

	/**
	 * Generate API mock
	 */
	generateAPIMock(options: APIMockOptions): {
		mockCode: string;
		handlers: string;
		types: string;
	} {
		return this.apiGenerator.generate(options);
	}

	/**
	 * Generate Norwegian test data
	 */
	generateNorwegianData<T = any>(
		type: keyof NorwegianDataTypes,
		count: number = 1,
	): T[] {
		return this.dataGenerator.generate(type, count) as T[];
	}

	/**
	 * Generate compliance-aware mock data
	 */
	generateComplianceAwareMockData(classification: NSMClassification): {
		userData: any;
		systemData: any;
		auditData: any;
	} {
		const options = { ...this.defaultOptions, classification };

		return {
			userData: this.dataGenerator.generatePersonalData(options),
			systemData: this.dataGenerator.generateSystemData(options),
			auditData: this.dataGenerator.generateAuditData(options),
		};
	}
}

// === Norwegian Data Generator ===

/**
 * Norwegian-specific test data types
 */
export interface NorwegianDataTypes {
	person: NorwegianPersonData;
	address: NorwegianAddressData;
	company: NorwegianCompanyData;
	phone: string;
	postalCode: string;
	municipality: string;
	county: string;
}

export interface NorwegianPersonData {
	firstName: string;
	lastName: string;
	fullName: string;
	personalId?: string; // Only if compliant
	email: string;
	phone: string;
	dateOfBirth: string;
	gender: "male" | "female" | "other";
	locale: LocaleCode;
}

export interface NorwegianAddressData {
	street: string;
	houseNumber: string;
	postalCode: string;
	city: string;
	municipality: string;
	county: string;
	country: string;
	coordinates?: {
		latitude: number;
		longitude: number;
	};
}

export interface NorwegianCompanyData {
	name: string;
	organizationNumber: string;
	industry: string;
	address: NorwegianAddressData;
	email: string;
	phone: string;
	website: string;
}

/**
 * Generates Norwegian-specific test data
 */
export class NorwegianDataGenerator {
	private random: () => number;

	constructor(private options: MockGenerationOptions = {}) {
		// Seeded random for reproducible tests
		if (options.seed) {
			let seed = options.seed;
			this.random = () => {
				seed = (seed * 9301 + 49297) % 233280;
				return seed / 233280;
			};
		} else {
			this.random = Math.random;
		}
	}

	/**
	 * Generate Norwegian data by type
	 */
	generate<K extends keyof NorwegianDataTypes>(
		type: K,
		count: number = 1,
	): NorwegianDataTypes[K][] {
		const results: NorwegianDataTypes[K][] = [];

		for (let i = 0; i < count; i++) {
			switch (type) {
				case "person":
					results.push(this.generatePerson() as NorwegianDataTypes[K]);
					break;
				case "address":
					results.push(this.generateAddress() as NorwegianDataTypes[K]);
					break;
				case "company":
					results.push(this.generateCompany() as NorwegianDataTypes[K]);
					break;
				case "phone":
					results.push(this.generatePhoneNumber() as NorwegianDataTypes[K]);
					break;
				case "postalCode":
					results.push(this.generatePostalCode() as NorwegianDataTypes[K]);
					break;
				case "municipality":
					results.push(
						this.pickRandom(NORWEGIAN_MUNICIPALITIES) as NorwegianDataTypes[K],
					);
					break;
				case "county":
					results.push(
						this.pickRandom(NORWEGIAN_COUNTIES) as NorwegianDataTypes[K],
					);
					break;
			}
		}

		return results;
	}

	/**
	 * Generate personal data (GDPR compliant)
	 */
	generatePersonalData(options: MockGenerationOptions): any {
		const includePersonalId =
			options.includePersonalData &&
			options.classification === NSMClassification.OPEN;

		return {
			...this.generatePerson(),
			personalId: includePersonalId ? this.generatePersonalId() : undefined,
			preferences: {
				language: options.locale || "nb-NO",
				notifications: this.random() > 0.5,
				marketing: this.random() > 0.7,
			},
			createdAt: this.generateRecentDate(),
			updatedAt: this.generateRecentDate(),
		};
	}

	/**
	 * Generate system data
	 */
	generateSystemData(options: MockGenerationOptions): any {
		return {
			systemId: this.generateUUID(),
			version: "1.0.0",
			environment: "test",
			configuration: {
				locale: options.locale || "nb-NO",
				classification: options.classification || NSMClassification.OPEN,
				features: this.generateFeatureFlags(),
			},
			metadata: {
				createdAt: this.generateRecentDate(),
				lastModified: this.generateRecentDate(),
				checksum: this.generateChecksum(),
			},
		};
	}

	/**
	 * Generate audit data
	 */
	generateAuditData(options: MockGenerationOptions): any {
		return {
			auditId: this.generateUUID(),
			timestamp: new Date().toISOString(),
			userId: this.generateUUID(),
			sessionId: this.generateUUID(),
			action: this.pickRandom([
				"create",
				"read",
				"update",
				"delete",
				"login",
				"logout",
			]),
			resource: this.pickRandom(["user", "document", "setting", "report"]),
			classification: options.classification || NSMClassification.OPEN,
			result: this.pickRandom(["success", "failure", "warning"]),
			ipAddress: this.generateIPAddress(),
			userAgent: this.generateUserAgent(),
			details: {
				location: "Norway",
				duration: Math.floor(this.random() * 5000),
				dataSize: Math.floor(this.random() * 1000000),
			},
		};
	}

	private generatePerson(): NorwegianPersonData {
		const locale = this.options.locale || "nb-NO";
		const firstNames = locale.startsWith("nb-")
			? NORWEGIAN_FIRST_NAMES_NB
			: NORWEGIAN_FIRST_NAMES_NN;
		const lastName = this.pickRandom(NORWEGIAN_LAST_NAMES);
		const firstName = this.pickRandom(firstNames);

		return {
			firstName,
			lastName,
			fullName: `${firstName} ${lastName}`,
			email: this.generateEmail(firstName, lastName),
			phone: this.generatePhoneNumber(),
			dateOfBirth: this.generateDateOfBirth(),
			gender: this.pickRandom(["male", "female", "other"]),
			locale,
		};
	}

	private generateAddress(): NorwegianAddressData {
		const city = this.pickRandom(NORWEGIAN_CITIES);
		const street = this.pickRandom(NORWEGIAN_STREET_NAMES);

		return {
			street,
			houseNumber: Math.floor(this.random() * 200 + 1).toString(),
			postalCode: this.generatePostalCode(),
			city,
			municipality: this.pickRandom(NORWEGIAN_MUNICIPALITIES),
			county: this.pickRandom(NORWEGIAN_COUNTIES),
			country: "Norge",
			coordinates: {
				latitude: 58 + this.random() * 13, // Norway's latitude range
				longitude: 4 + this.random() * 27, // Norway's longitude range
			},
		};
	}

	private generateCompany(): NorwegianCompanyData {
		const companyNames = [
			"Innovasjon AS",
			"Teknologi Norge AS",
			"Digital Løsninger AS",
			"Smart Systems AS",
			"Fremtid Tech AS",
			"Bærekraft Solutions AS",
		];

		return {
			name: this.pickRandom(companyNames),
			organizationNumber: this.generateOrganizationNumber(),
			industry: this.pickRandom([
				"IT",
				"Teknologi",
				"Konsulentvirksomhet",
				"Handel",
				"Produksjon",
			]),
			address: this.generateAddress(),
			email: `kontakt@${this.generateDomain()}`,
			phone: this.generatePhoneNumber(),
			website: `https://www.${this.generateDomain()}`,
		};
	}

	private generatePhoneNumber(): string {
		// Norwegian mobile numbers start with 9, 4, or 8
		const prefix = this.pickRandom(["9", "4", "8"]);
		const number =
			prefix +
			Array.from({ length: 7 }, () => Math.floor(this.random() * 10)).join("");
		return `+47 ${number.substring(0, 3)} ${number.substring(3, 5)} ${number.substring(5)}`;
	}

	private generatePostalCode(): string {
		return Array.from({ length: 4 }, () => Math.floor(this.random() * 10)).join(
			"",
		);
	}

	private generatePersonalId(): string {
		// Norwegian personal ID (11 digits) - simplified generation for testing
		const day = String(Math.floor(this.random() * 28) + 1).padStart(2, "0");
		const month = String(Math.floor(this.random() * 12) + 1).padStart(2, "0");
		const year = String(Math.floor(this.random() * 50) + 50); // 1950-1999
		const individual = String(Math.floor(this.random() * 999)).padStart(3, "0");
		const control = String(Math.floor(this.random() * 99)).padStart(2, "0");

		return `${day}${month}${year}${individual}${control}`;
	}

	private generateOrganizationNumber(): string {
		// Norwegian organization number (9 digits)
		return Array.from({ length: 9 }, () => Math.floor(this.random() * 10)).join(
			"",
		);
	}

	private generateEmail(firstName: string, lastName: string): string {
		const domain = this.generateDomain();
		const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
		return `${username}@${domain}`;
	}

	private generateDomain(): string {
		const domains = ["example.no", "test.no", "demo.no", "sample.no"];
		return this.pickRandom(domains);
	}

	private generateDateOfBirth(): string {
		const year = 1950 + Math.floor(this.random() * 50);
		const month = Math.floor(this.random() * 12) + 1;
		const day = Math.floor(this.random() * 28) + 1;
		return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
	}

	private generateRecentDate(): string {
		const now = Date.now();
		const daysAgo = Math.floor(this.random() * 30);
		const date = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
		return date.toISOString();
	}

	private generateUUID(): string {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
			const r = Math.floor(this.random() * 16);
			const v = c === "x" ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}

	private generateChecksum(): string {
		return Array.from({ length: 8 }, () =>
			Math.floor(this.random() * 16).toString(16),
		).join("");
	}

	private generateIPAddress(): string {
		return Array.from({ length: 4 }, () =>
			Math.floor(this.random() * 256),
		).join(".");
	}

	private generateUserAgent(): string {
		const browsers = [
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
			"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
		];
		return this.pickRandom(browsers);
	}

	private generateFeatureFlags(): Record<string, boolean> {
		return {
			darkMode: this.random() > 0.5,
			norwegianLocale: true,
			complianceMode: this.options.classification !== NSMClassification.OPEN,
			accessibilityEnhanced: this.random() > 0.3,
			performanceMonitoring: this.random() > 0.7,
		};
	}

	private pickRandom<T>(array: T[]): T {
		return array[Math.floor(this.random() * array.length)];
	}
}

// === Component Mock Generator ===

/**
 * Generates React/Vue/Angular component mocks
 */
export class ComponentMockGenerator {
	constructor(private options: MockGenerationOptions = {}) {}

	generate(options: ComponentMockOptions): {
		mockCode: string;
		testHelpers: string;
		types: string;
	} {
		switch (options.framework || "react") {
			case "react":
				return this.generateReactMock(options);
			case "vue":
				return this.generateVueMock(options);
			case "angular":
				return this.generateAngularMock(options);
			default:
				return this.generateReactMock(options);
		}
	}

	private generateReactMock(options: ComponentMockOptions): {
		mockCode: string;
		testHelpers: string;
		types: string;
	} {
		const componentName = options.componentName;
		const locale = options.locale || "nb-NO";

		const mockCode = `
// Auto-generated mock for ${componentName}
import { jest } from '@jest/globals';
import React from 'react';

export const ${componentName}Mock = jest.fn((props) => {
  return React.createElement('div', {
    'data-testid': '${componentName.toLowerCase()}-mock',
    'data-component': '${componentName}',
    lang: '${locale}',
    role: 'generic',
    ...props
  }, 'Mock ${componentName}');
});

// Mock with Norwegian compliance
export const ${componentName}ComplianceMock = jest.fn((props) => {
  return React.createElement('div', {
    'data-testid': '${componentName.toLowerCase()}-compliance-mock',
    'data-component': '${componentName}',
    'data-nsm-classification': '${options.classification || NSMClassification.OPEN}',
    lang: '${locale}',
    role: 'generic',
    'aria-label': props.ariaLabel || '${componentName} komponent',
    ...props
  }, 'Compliant Mock ${componentName}');
});

// Export mocks
export default ${componentName}Mock;
`;

		const testHelpers = `
// Test helpers for ${componentName}
export const ${componentName}TestHelpers = {
  renderMock: (props = {}) => {
    return ${componentName}Mock(props);
  },
  
  renderComplianceMock: (props = {}) => {
    return ${componentName}ComplianceMock(props);
  },
  
  getDefaultProps: () => ({
    locale: '${locale}',
    classification: '${options.classification || NSMClassification.OPEN}',
  }),
  
  assertRendered: (container) => {
    const element = container.querySelector('[data-testid="${componentName.toLowerCase()}-mock"]');
    expect(element).toBeInTheDocument();
    return element;
  },
  
  assertComplianceRendered: (container) => {
    const element = container.querySelector('[data-testid="${componentName.toLowerCase()}-compliance-mock"]');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('lang', '${locale}');
    expect(element).toHaveAttribute('aria-label');
    return element;
  },
};
`;

		const types = `
// Type definitions for ${componentName} mock
export interface ${componentName}MockProps {
  locale?: string;
  classification?: NSMClassification;
  ariaLabel?: string;
  [key: string]: any;
}

export interface ${componentName}TestHelpers {
  renderMock: (props?: ${componentName}MockProps) => React.ReactElement;
  renderComplianceMock: (props?: ${componentName}MockProps) => React.ReactElement;
  getDefaultProps: () => Partial<${componentName}MockProps>;
  assertRendered: (container: HTMLElement) => HTMLElement;
  assertComplianceRendered: (container: HTMLElement) => HTMLElement;
}
`;

		return { mockCode, testHelpers, types };
	}

	private generateVueMock(options: ComponentMockOptions): {
		mockCode: string;
		testHelpers: string;
		types: string;
	} {
		// Vue mock implementation
		return {
			mockCode: `// Vue mock for ${options.componentName}`,
			testHelpers: `// Vue test helpers for ${options.componentName}`,
			types: `// Vue types for ${options.componentName}`,
		};
	}

	private generateAngularMock(options: ComponentMockOptions): {
		mockCode: string;
		testHelpers: string;
		types: string;
	} {
		// Angular mock implementation
		return {
			mockCode: `// Angular mock for ${options.componentName}`,
			testHelpers: `// Angular test helpers for ${options.componentName}`,
			types: `// Angular types for ${options.componentName}`,
		};
	}
}

// === Service Mock Generator ===

/**
 * Generates service mocks with Norwegian compliance
 */
export class ServiceMockGenerator {
	constructor(private options: MockGenerationOptions = {}) {}

	generate(options: ServiceMockOptions): {
		mockCode: string;
		testHelpers: string;
		types: string;
	} {
		const serviceName = options.serviceName;
		const methods = options.methods || [];

		const mockCode = `
// Auto-generated mock for ${serviceName}
import { jest } from '@jest/globals';

export const ${serviceName}Mock = {
  ${methods
		.map(
			(method) => `
  ${method.name}: jest.fn()${method.async ? ".mockResolvedValue" : ".mockReturnValue"}(${this.generateMockReturnValue(method.returnType)}),`,
		)
		.join("")}
  
  // Norwegian compliance methods
  checkCompliance: jest.fn().mockResolvedValue({ compliant: true }),
  getAuditInfo: jest.fn().mockReturnValue({
    timestamp: new Date().toISOString(),
    classification: '${options.classification || NSMClassification.OPEN}',
    locale: '${options.locale || "nb-NO"}',
  }),
  
  // Reset all mocks
  resetMocks: () => {
    ${methods.map((method) => `${serviceName}Mock.${method.name}.mockClear();`).join("\n    ")}
    ${serviceName}Mock.checkCompliance.mockClear();
    ${serviceName}Mock.getAuditInfo.mockClear();
  },
};

export default ${serviceName}Mock;
`;

		const testHelpers = `
// Test helpers for ${serviceName}
export const ${serviceName}TestHelpers = {
  setupMock: () => {
    return ${serviceName}Mock;
  },
  
  mockSuccess: () => {
    ${methods
			.filter((m) => m.async)
			.map(
				(method) => `
    ${serviceName}Mock.${method.name}.mockResolvedValue(${this.generateMockReturnValue(method.returnType)});`,
			)
			.join("")}
  },
  
  mockError: (error = new Error('Test error')) => {
    ${methods
			.filter((m) => m.async)
			.map(
				(method) => `
    ${serviceName}Mock.${method.name}.mockRejectedValue(error);`,
			)
			.join("")}
  },
  
  assertMethodCalled: (methodName, ...args) => {
    expect(${serviceName}Mock[methodName]).toHaveBeenCalledWith(...args);
  },
  
  assertComplianceChecked: () => {
    expect(${serviceName}Mock.checkCompliance).toHaveBeenCalled();
  },
};
`;

		const types = `
// Type definitions for ${serviceName} mock
export interface ${serviceName}Mock {
  ${methods.map((method) => `${method.name}: jest.Mock;`).join("\n  ")}
  checkCompliance: jest.Mock;
  getAuditInfo: jest.Mock;
  resetMocks: () => void;
}

export interface ${serviceName}TestHelpers {
  setupMock: () => ${serviceName}Mock;
  mockSuccess: () => void;
  mockError: (error?: Error) => void;
  assertMethodCalled: (methodName: string, ...args: any[]) => void;
  assertComplianceChecked: () => void;
}
`;

		return { mockCode, testHelpers, types };
	}

	private generateMockReturnValue(returnType: string): string {
		switch (returnType.toLowerCase()) {
			case "string":
				return "'test-string'";
			case "number":
				return "42";
			case "boolean":
				return "true";
			case "array":
				return "[]";
			case "object":
				return "{}";
			case "promise":
				return "Promise.resolve({})";
			case "void":
				return "undefined";
			default:
				return "{}";
		}
	}
}

// === API Mock Generator ===

/**
 * Generates API mocks with MSW or similar
 */
export class APIMockGenerator {
	constructor(private options: MockGenerationOptions = {}) {}

	generate(options: APIMockOptions): {
		mockCode: string;
		handlers: string;
		types: string;
	} {
		const baseUrl = options.baseUrl || "https://api.example.no";
		const endpoints = options.endpoints || [];

		const mockCode = `
// Auto-generated API mock
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const handlers = [
  ${endpoints
		.map(
			(endpoint) => `
  rest.${endpoint.method.toLowerCase()}('${baseUrl}${endpoint.path}', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(${this.generateMockResponse(endpoint.responseType)}),
      ctx.set('Content-Type', 'application/json'),
      ctx.set('X-Norwegian-Compliance', '${options.classification || NSMClassification.OPEN}'),
    );
  }),`,
		)
		.join("")}
];

export const server = setupServer(...handlers);
export default server;
`;

		const handlers = `
// API handlers for testing
export const APIHandlers = {
  startServer: () => server.listen(),
  stopServer: () => server.close(),
  resetHandlers: () => server.resetHandlers(),
  
  // Norwegian compliance handlers
  mockCompliantResponse: (endpoint, data) => {
    server.use(
      rest.get(\`${baseUrl}\${endpoint}\`, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json(data),
          ctx.set('X-Norwegian-Compliance', 'true'),
          ctx.set('Content-Language', '${options.locale || "nb-NO"}'),
        );
      })
    );
  },
  
  mockErrorResponse: (endpoint, status = 500, message = 'Server Error') => {
    server.use(
      rest.get(\`${baseUrl}\${endpoint}\`, (req, res, ctx) => {
        return res(
          ctx.status(status),
          ctx.json({ error: message }),
        );
      })
    );
  },
};
`;

		const types = `
// Type definitions for API mock
export interface APIResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export interface APIHandlers {
  startServer: () => void;
  stopServer: () => void;  
  resetHandlers: () => void;
  mockCompliantResponse: (endpoint: string, data: any) => void;
  mockErrorResponse: (endpoint: string, status?: number, message?: string) => void;
}
`;

		return { mockCode, handlers, types };
	}

	private generateMockResponse(responseType: string): string {
		const dataGen = new NorwegianDataGenerator(this.options);

		switch (responseType.toLowerCase()) {
			case "user":
				return JSON.stringify(dataGen.generatePersonalData(this.options));
			case "company":
				return JSON.stringify(dataGen.generate("company", 1)[0]);
			case "address":
				return JSON.stringify(dataGen.generate("address", 1)[0]);
			case "array":
				return "[]";
			case "object":
				return "{}";
			default:
				return '{ "message": "Success" }';
		}
	}
}

// === Norwegian Data Constants ===

const NORWEGIAN_FIRST_NAMES_NB = [
	"Emma",
	"Oliver",
	"Nora",
	"Jakob",
	"Sofie",
	"Lucas",
	"Ella",
	"William",
	"Leah",
	"Filip",
	"Sara",
	"Noah",
	"Ingrid",
	"Emil",
	"Maja",
	"Mathias",
];

const NORWEGIAN_FIRST_NAMES_NN = [
	"Emma",
	"Oliver",
	"Nora",
	"Jakob",
	"Sofie",
	"Lukas",
	"Ella",
	"William",
	"Lea",
	"Filip",
	"Sara",
	"Noah",
	"Ingrid",
	"Emil",
	"Maja",
	"Mathias",
];

const NORWEGIAN_LAST_NAMES = [
	"Hansen",
	"Johansen",
	"Olsen",
	"Larsen",
	"Andersen",
	"Pedersen",
	"Nilsen",
	"Kristiansen",
	"Jensen",
	"Karlsen",
	"Johnsen",
	"Pettersen",
	"Eriksen",
];

const NORWEGIAN_STREET_NAMES = [
	"Storgata",
	"Kirkegata",
	"Skolegata",
	"Prestegata",
	"Parkveien",
	"Bjørkveien",
	"Granveien",
	"Eikveien",
	"Solveien",
	"Haugeveien",
	"Bakkeveien",
];

const NORWEGIAN_CITIES = [
	"Oslo",
	"Bergen",
	"Trondheim",
	"Stavanger",
	"Bærum",
	"Kristiansand",
	"Fredrikstad",
	"Tromsø",
	"Sandnes",
	"Drammen",
	"Asker",
	"Lillestrøm",
];

const NORWEGIAN_MUNICIPALITIES = [
	"Oslo",
	"Bergen",
	"Trondheim",
	"Stavanger",
	"Bærum",
	"Kristiansand",
	"Fredrikstad",
	"Tromsø",
	"Sandnes",
	"Drammen",
	"Asker",
	"Lillestrøm",
];

const NORWEGIAN_COUNTIES = [
	"Oslo",
	"Rogaland",
	"Møre og Romsdal",
	"Nordland",
	"Viken",
	"Innlandet",
	"Vestfold og Telemark",
	"Agder",
	"Vestland",
	"Trøndelag",
	"Troms og Finnmark",
];

// === Export Mock Generator ===

export default MockGenerator;
