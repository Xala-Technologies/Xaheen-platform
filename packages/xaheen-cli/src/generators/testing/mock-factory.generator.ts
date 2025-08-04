import { BaseGenerator } from "../base.generator";
import { MockFactoryOptions, TestTemplate } from "./types";
import { promises as fs } from "fs";
import * as path from "path";

export class MockFactoryGenerator extends BaseGenerator<MockFactoryOptions> {
	async generate(options: MockFactoryOptions): Promise<void> {
		await this.validateOptions(options);

		this.logger.info(
			"Generating comprehensive mock factories and test data generators...",
		);

		try {
			// Generate factory base classes
			await this.generateFactoryBase(options);

			// Generate entity-specific factories
			for (const entity of options.entities) {
				await this.generateEntityFactory(entity, options);
			}

			// Generate mock builders
			await this.generateMockBuilders(options);

			// Generate test data generators
			await this.generateTestDataGenerators(options);

			// Generate faker integration
			await this.generateFakerIntegration(options);

			// Generate factory registry
			await this.generateFactoryRegistry(options);

			this.logger.success(
				"Mock factories and test data generators created successfully!",
			);
		} catch (error) {
			this.logger.error("Failed to generate mock factories", error);
			throw error;
		}
	}

	private async generateFactoryBase(
		options: MockFactoryOptions,
	): Promise<void> {
		const template = this.getFactoryBaseTemplate(options);
		const factoriesPath = path.join(options.projectPath, "tests", "factories");
		await this.ensureDirectoryExists(factoriesPath);
		await this.writeTemplate(template, factoriesPath);
	}

	private async generateEntityFactory(
		entity: string,
		options: MockFactoryOptions,
	): Promise<void> {
		const template = this.getEntityFactoryTemplate(entity, options);
		const factoriesPath = path.join(options.projectPath, "tests", "factories");
		await this.ensureDirectoryExists(factoriesPath);
		await this.writeTemplate(template, factoriesPath);
	}

	private async generateMockBuilders(
		options: MockFactoryOptions,
	): Promise<void> {
		const template = this.getMockBuildersTemplate(options);
		const mocksPath = path.join(options.projectPath, "tests", "mocks");
		await this.ensureDirectoryExists(mocksPath);
		await this.writeTemplate(template, mocksPath);
	}

	private async generateTestDataGenerators(
		options: MockFactoryOptions,
	): Promise<void> {
		const template = this.getTestDataGeneratorsTemplate(options);
		const generatorsPath = path.join(
			options.projectPath,
			"tests",
			"generators",
		);
		await this.ensureDirectoryExists(generatorsPath);
		await this.writeTemplate(template, generatorsPath);
	}

	private async generateFakerIntegration(
		options: MockFactoryOptions,
	): Promise<void> {
		const template = this.getFakerIntegrationTemplate(options);
		const utilsPath = path.join(options.projectPath, "tests", "utils");
		await this.ensureDirectoryExists(utilsPath);
		await this.writeTemplate(template, utilsPath);
	}

	private async generateFactoryRegistry(
		options: MockFactoryOptions,
	): Promise<void> {
		const template = this.getFactoryRegistryTemplate(options);
		const factoriesPath = path.join(options.projectPath, "tests", "factories");
		await this.ensureDirectoryExists(factoriesPath);
		await this.writeTemplate(template, factoriesPath);
	}

	private getFactoryBaseTemplate(options: MockFactoryOptions): TestTemplate {
		return {
			name: "base-factory.ts",
			path: "base-factory.ts",
			content: `import { ${options.testingFramework === "jest" ? "jest" : "vi"} } from '${options.testingFramework}';
import { faker } from '@faker-js/faker';

/**
 * Base factory class for creating test entities
 */

export interface FactoryOptions<T> {
  count?: number;
  overrides?: Partial<T>;
  traits?: string[];
}

export interface TraitDefinition<T> {
  [traitName: string]: Partial<T> | ((data: Partial<T>) => Partial<T>);
}

export abstract class BaseFactory<T> {
  protected abstract getDefaults(): T;
  protected abstract getTraits(): TraitDefinition<T>;

  /**
   * Create a single entity
   */
  create(options: FactoryOptions<T> = {}): T {
    let data = this.getDefaults();
    
    // Apply traits
    if (options.traits) {
      data = this.applyTraits(data, options.traits);
    }
    
    // Apply overrides
    if (options.overrides) {
      data = { ...data, ...options.overrides };
    }
    
    return data;
  }

  /**
   * Create multiple entities
   */
  createMany(count: number, options: Omit<FactoryOptions<T>, 'count'> = {}): T[] {
    return Array.from({ length: count }, (_, index) => {
      const indexedOverrides = this.applyIndexToOverrides(options.overrides, index);
      return this.create({
        ...options,
        overrides: indexedOverrides
      });
    });
  }

  /**
   * Create a partial entity (useful for updates)
   */
  createPartial(options: FactoryOptions<T> = {}): Partial<T> {
    return this.create(options) as Partial<T>;
  }

  /**
   * Build factory with specific traits
   */
  withTraits(...traits: string[]): FactoryBuilder<T> {
    return new FactoryBuilder(this, { traits });
  }

  /**
   * Build factory with overrides
   */
  with(overrides: Partial<T>): FactoryBuilder<T> {
    return new FactoryBuilder(this, { overrides });
  }

  /**
   * Create entity in different states
   */
  states(): { [stateName: string]: FactoryBuilder<T> } {
    const traits = this.getTraits();
    const states: { [stateName: string]: FactoryBuilder<T> } = {};
    
    Object.keys(traits).forEach(traitName => {
      states[traitName] = this.withTraits(traitName);
    });
    
    return states;
  }

  private applyTraits(data: T, traits: string[]): T {
    const traitDefinitions = this.getTraits();
    let result = { ...data };
    
    traits.forEach(traitName => {
      const trait = traitDefinitions[traitName];
      if (!trait) {
        throw new Error(\`Unknown trait: \${traitName}\`);
      }
      
      if (typeof trait === 'function') {
        result = { ...result, ...trait(result) };
      } else {
        result = { ...result, ...trait };
      }
    });
    
    return result;
  }

  private applyIndexToOverrides(overrides: Partial<T> | undefined, index: number): Partial<T> | undefined {
    if (!overrides) return overrides;
    
    const result: Partial<T> = {};
    
    Object.entries(overrides).forEach(([key, value]) => {
      if (typeof value === 'string' && value.includes('{index}')) {
        (result as any)[key] = value.replace('{index}', index.toString());
      } else if (typeof value === 'number' && key.toLowerCase().includes('id')) {
        (result as any)[key] = value + index;
      } else {
        (result as any)[key] = value;
      }
    });
    
    return result;
  }
}

/**
 * Factory builder for chaining operations
 */
export class FactoryBuilder<T> {
  constructor(
    private factory: BaseFactory<T>,
    private options: FactoryOptions<T> = {}
  ) {}

  withTraits(...traits: string[]): FactoryBuilder<T> {
    return new FactoryBuilder(this.factory, {
      ...this.options,
      traits: [...(this.options.traits || []), ...traits]
    });
  }

  with(overrides: Partial<T>): FactoryBuilder<T> {
    return new FactoryBuilder(this.factory, {
      ...this.options,
      overrides: { ...this.options.overrides, ...overrides }
    });
  }

  count(count: number): FactoryBuilder<T> {
    return new FactoryBuilder(this.factory, {
      ...this.options,
      count
    });
  }

  create(): T {
    return this.factory.create(this.options);
  }

  createMany(count?: number): T[] {
    const finalCount = count || this.options.count || 1;
    return this.factory.createMany(finalCount, this.options);
  }
}

/**
 * Sequence generator for unique values
 */
export class Sequence {
  private static sequences: Map<string, number> = new Map();

  static next(name: string, start: number = 1): number {
    const current = this.sequences.get(name) || start;
    this.sequences.set(name, current + 1);
    return current;
  }

  static reset(name?: string): void {
    if (name) {
      this.sequences.delete(name);
    } else {
      this.sequences.clear();
    }
  }
}

/**
 * Association helper for creating related entities
 */
export class Association<T> {
  constructor(
    private factory: BaseFactory<T>,
    private options: FactoryOptions<T> = {}
  ) {}

  create(): T {
    return this.factory.create(this.options);
  }

  build(): FactoryBuilder<T> {
    return new FactoryBuilder(this.factory, this.options);
  }
}

/**
 * Utility functions for factories
 */
export const FactoryUtils = {
  /**
   * Generate unique email addresses
   */
  uniqueEmail: (domain: string = 'example.com'): string => {
    const sequence = Sequence.next('email');
    return \`user\${sequence}@\${domain}\`;
  },

  /**
   * Generate unique usernames
   */
  uniqueUsername: (prefix: string = 'user'): string => {
    const sequence = Sequence.next('username');
    return \`\${prefix}\${sequence}\`;
  },

  /**
   * Generate random dates within range
   */
  randomDateBetween: (start: Date, end: Date): Date => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  },

  /**
   * Generate random past date
   */
  randomPastDate: (days: number = 365): Date => {
    const now = new Date();
    const past = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    return FactoryUtils.randomDateBetween(past, now);
  },

  /**
   * Generate random future date
   */
  randomFutureDate: (days: number = 365): Date => {
    const now = new Date();
    const future = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    return FactoryUtils.randomDateBetween(now, future);
  },

  /**
   * Pick random item from array
   */
  randomChoice: <T>(items: T[]): T => {
    return items[Math.floor(Math.random() * items.length)];
  },

  /**
   * Generate array of items
   */
  randomArray: <T>(generator: () => T, min: number = 1, max: number = 5): T[] => {
    const length = Math.floor(Math.random() * (max - min + 1)) + min;
    return Array.from({ length }, generator);
  },

  /**
   * Generate weighted random choice
   */
  weightedChoice: <T>(choices: { item: T; weight: number }[]): T => {
    const totalWeight = choices.reduce((sum, choice) => sum + choice.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const choice of choices) {
      random -= choice.weight;
      if (random <= 0) {
        return choice.item;
      }
    }
    
    return choices[choices.length - 1].item;
  },

  /**
   * Generate localized data based on locale
   */
  localizedData: (locale: string = 'en') => {
    faker.setLocale(locale);
    return {
      name: faker.name.fullName(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: {
        street: faker.address.streetAddress(),
        city: faker.address.city(),
        state: faker.address.state(),
        zipCode: faker.address.zipCode(),
        country: faker.address.country()
      },
      company: {
        name: faker.company.name(),
        catchPhrase: faker.company.catchPhrase(),
        bs: faker.company.bs()
      }
    };
  }
};

/**
 * Mock data generators
 */
export const MockGenerators = {
  /**
   * Generate mock HTTP response
   */
  httpResponse: <T>(data: T, status: number = 200): any => ({
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {
      'content-type': 'application/json',
      'x-request-id': faker.datatype.uuid()
    },
    config: {}
  }),

  /**
   * Generate mock error response
   */
  errorResponse: (status: number = 500, message: string = 'Internal Server Error'): any => ({
    response: {
      data: {
        error: true,
        message,
        code: \`ERROR_\${status}\`,
        timestamp: new Date().toISOString()
      },
      status,
      statusText: message,
      headers: {
        'content-type': 'application/json'
      }
    },
    request: {},
    config: {}
  }),

  /**
   * Generate mock database query result
   */
  queryResult: <T>(rows: T[], rowCount?: number): any => ({
    rows,
    rowCount: rowCount || rows.length,
    command: 'SELECT',
    oid: null,
    fields: []
  }),

  /**
   * Generate mock Redis client
   */
  redisClient: (): any => {
    const store = new Map<string, string>();
    
    return {
      get: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}((key: string) => Promise.resolve(store.get(key) || null)),
      set: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}((key: string, value: string) => {
        store.set(key, value);
        return Promise.resolve('OK');
      }),
      del: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}((key: string) => {
        const existed = store.has(key);
        store.delete(key);
        return Promise.resolve(existed ? 1 : 0);
      }),
      exists: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}((key: string) => Promise.resolve(store.has(key) ? 1 : 0)),
      expire: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}(() => Promise.resolve(1)),
      flushDb: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}(() => {
        store.clear();
        return Promise.resolve('OK');
      }),
      ping: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}(() => Promise.resolve('PONG')),
      connect: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}(() => Promise.resolve()),
      disconnect: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}(() => Promise.resolve()),
      quit: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}(() => Promise.resolve())
    };
  }
};`,
			dependencies: ["@faker-js/faker"],
		};
	}

	private getEntityFactoryTemplate(
		entity: string,
		options: MockFactoryOptions,
	): TestTemplate {
		const entityLower = entity.toLowerCase();
		const entityUpper = entity.charAt(0).toUpperCase() + entity.slice(1);

		return {
			name: `${entityLower}-factory.ts`,
			path: `${entityLower}-factory.ts`,
			content: `import { BaseFactory, TraitDefinition, FactoryUtils, Sequence } from './base-factory';
import { faker } from '@faker-js/faker';

/**
 * ${entityUpper} entity interface
 */
export interface ${entityUpper} {
  id: number;
  ${this.getEntityFields(entity, options)}
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ${entityUpper} factory for generating test data
 */
export class ${entityUpper}Factory extends BaseFactory<${entityUpper}> {
  protected getDefaults(): ${entityUpper} {
    const now = new Date();
    
    return {
      id: Sequence.next('${entityLower}_id'),
      ${this.getDefaultValues(entity, options)}
      createdAt: FactoryUtils.randomPastDate(30),
      updatedAt: now
    };
  }

  protected getTraits(): TraitDefinition<${entityUpper}> {
    return {
      ${this.getTraitDefinitions(entity, options)}
    };
  }

  // Convenience methods for common scenarios
  ${this.getConvenienceMethods(entity, options)}
}

// Export singleton instance
export const ${entityLower}Factory = new ${entityUpper}Factory();

// Export common creation patterns
export const create${entityUpper} = (overrides?: Partial<${entityUpper}>) => 
  ${entityLower}Factory.create({ overrides });

export const create${entityUpper}s = (count: number, overrides?: Partial<${entityUpper}>) => 
  ${entityLower}Factory.createMany(count, { overrides });

// Export trait builders
export const ${entityLower}Traits = ${entityLower}Factory.states();`,
			dependencies: ["@faker-js/faker"],
		};
	}

	private getEntityFields(entity: string, options: MockFactoryOptions): string {
		// Basic fields that most entities would have
		const commonFields = [
			"name: string;",
			"description?: string;",
			"isActive: boolean;",
		];

		// Add entity-specific fields based on entity name
		const specificFields = this.getEntitySpecificFields(entity);

		return [...commonFields, ...specificFields].join("\n  ");
	}

	private getEntitySpecificFields(entity: string): string[] {
		const entityLower = entity.toLowerCase();

		switch (entityLower) {
			case "user":
				return [
					"email: string;",
					"username?: string;",
					"firstName?: string;",
					"lastName?: string;",
					"avatar?: string;",
					"role: string;",
					"lastLoginAt?: Date;",
				];

			case "product":
				return [
					"sku: string;",
					"price: number;",
					"categoryId?: number;",
					"tags: string[];",
					"stock: number;",
					"images: string[];",
				];

			case "order":
				return [
					"userId: number;",
					"total: number;",
					"subtotal: number;",
					"tax: number;",
					"status: string;",
					"items: OrderItem[];",
					"shippingAddress?: Address;",
					"billingAddress?: Address;",
				];

			case "article":
			case "post":
				return [
					"title: string;",
					"content: string;",
					"summary?: string;",
					"authorId: number;",
					"categoryId?: number;",
					"tags: string[];",
					"publishedAt?: Date;",
					"viewCount: number;",
				];

			default:
				return ["status: string;", "metadata?: Record<string, any>;"];
		}
	}

	private getDefaultValues(
		entity: string,
		options: MockFactoryOptions,
	): string {
		const entityLower = entity.toLowerCase();

		switch (entityLower) {
			case "user":
				return `email: FactoryUtils.uniqueEmail(),
      username: FactoryUtils.uniqueUsername(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      avatar: faker.image.avatar(),
      role: 'user',
      isActive: true,
      lastLoginAt: FactoryUtils.randomPastDate(7),`;

			case "product":
				return `name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      sku: \`SKU-\${Sequence.next('product_sku').toString().padStart(6, '0')}\`,
      price: parseFloat(faker.commerce.price()),
      categoryId: faker.datatype.number({ min: 1, max: 10 }),
      tags: faker.random.words(3).split(' '),
      stock: faker.datatype.number({ min: 0, max: 1000 }),
      images: [faker.image.business(), faker.image.business(), faker.image.business()],
      isActive: true,`;

			case "order":
				return `name: \`Order #\${Sequence.next('order_number')}\`,
      description: 'Test order',
      userId: faker.datatype.number({ min: 1, max: 1000 }),
      total: parseFloat(faker.commerce.price()),
      subtotal: parseFloat(faker.commerce.price()),
      tax: faker.datatype.number({ min: 0, max: 50, precision: 0.01 }),
      status: FactoryUtils.randomChoice(['pending', 'confirmed', 'shipped', 'delivered']),
      items: [],
      isActive: true,`;

			case "article":
			case "post":
				return `name: faker.lorem.sentence(),
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      content: faker.lorem.paragraphs(5),
      summary: faker.lorem.paragraph(),
      authorId: faker.datatype.number({ min: 1, max: 100 }),
      categoryId: faker.datatype.number({ min: 1, max: 10 }),
      tags: faker.random.words(3).split(' '),
      publishedAt: FactoryUtils.randomPastDate(30),
      viewCount: faker.datatype.number({ min: 0, max: 10000 }),
      isActive: true,`;

			default:
				return `name: faker.lorem.words(2),
      description: faker.lorem.sentence(),
      status: FactoryUtils.randomChoice(['active', 'inactive', 'pending']),
      metadata: {},
      isActive: true,`;
		}
	}

	private getTraitDefinitions(
		entity: string,
		options: MockFactoryOptions,
	): string {
		const entityLower = entity.toLowerCase();

		const commonTraits = `
      inactive: { isActive: false },
      withoutDescription: { description: undefined },
      recent: (data) => ({
        ...data,
        createdAt: FactoryUtils.randomPastDate(1),
        updatedAt: new Date()
      }),
      old: (data) => ({
        ...data,
        createdAt: FactoryUtils.randomPastDate(365),
        updatedAt: FactoryUtils.randomPastDate(30)
      })`;

		switch (entityLower) {
			case "user":
				return `${commonTraits},
      admin: { role: 'admin' },
      moderator: { role: 'moderator' },
      premium: { role: 'premium' },
      blocked: { isActive: false, role: 'blocked' },
      withoutAvatar: { avatar: undefined },
      verified: { emailVerifiedAt: new Date() },
      recentLogin: { lastLoginAt: FactoryUtils.randomPastDate(1) }`;

			case "product":
				return `${commonTraits},
      expensive: { price: faker.datatype.number({ min: 1000, max: 5000 }) },
      cheap: { price: faker.datatype.number({ min: 1, max: 50 }) },
      outOfStock: { stock: 0 },
      lowStock: { stock: faker.datatype.number({ min: 1, max: 5 }) },
      featured: { tags: (data: any) => [...data.tags, 'featured'] },
      onSale: { tags: (data: any) => [...data.tags, 'sale'] }`;

			case "order":
				return `${commonTraits},
      confirmed: { status: 'confirmed' },
      shipped: { status: 'shipped' },
      delivered: { status: 'delivered' },
      cancelled: { status: 'cancelled' },
      highValue: { total: faker.datatype.number({ min: 1000, max: 5000 }) },
      lowValue: { total: faker.datatype.number({ min: 1, max: 50 }) }`;

			case "article":
			case "post":
				return `${commonTraits},
      published: { publishedAt: FactoryUtils.randomPastDate(30) },
      draft: { publishedAt: undefined },
      popular: { viewCount: faker.datatype.number({ min: 1000, max: 100000 }) },
      trending: { 
        viewCount: faker.datatype.number({ min: 500, max: 5000 }),
        createdAt: FactoryUtils.randomPastDate(7)
      }`;

			default:
				return commonTraits;
		}
	}

	private getConvenienceMethods(
		entity: string,
		options: MockFactoryOptions,
	): string {
		const entityLower = entity.toLowerCase();

		switch (entityLower) {
			case "user":
				return `
  /**
   * Create admin user
   */
  admin(overrides?: Partial<${entity}>): ${entity} {
    return this.withTraits('admin').create({ overrides });
  }

  /**
   * Create user with specific role
   */
  withRole(role: string, overrides?: Partial<${entity}>): ${entity} {
    return this.create({ overrides: { role, ...overrides } });
  }

  /**
   * Create user with specific email
   */
  withEmail(email: string, overrides?: Partial<${entity}>): ${entity} {
    return this.create({ overrides: { email, ...overrides } });
  }`;

			case "product":
				return `
  /**
   * Create product with specific price
   */
  withPrice(price: number, overrides?: Partial<${entity}>): ${entity} {
    return this.create({ overrides: { price, ...overrides } });
  }

  /**
   * Create product in specific category
   */
  inCategory(categoryId: number, overrides?: Partial<${entity}>): ${entity} {
    return this.create({ overrides: { categoryId, ...overrides } });
  }

  /**
   * Create out of stock product
   */
  outOfStock(overrides?: Partial<${entity}>): ${entity} {
    return this.withTraits('outOfStock').create({ overrides });
  }`;

			case "order":
				return `
  /**
   * Create order for specific user
   */
  forUser(userId: number, overrides?: Partial<${entity}>): ${entity} {
    return this.create({ overrides: { userId, ...overrides } });
  }

  /**
   * Create order with specific status
   */
  withStatus(status: string, overrides?: Partial<${entity}>): ${entity} {
    return this.create({ overrides: { status, ...overrides } });
  }

  /**
   * Create high value order
   */
  highValue(overrides?: Partial<${entity}>): ${entity} {
    return this.withTraits('highValue').create({ overrides });
  }`;

			default:
				return `
  /**
   * Create ${entityLower} with specific status
   */
  withStatus(status: string, overrides?: Partial<${entity}>): ${entity} {
    return this.create({ overrides: { status, ...overrides } });
  }

  /**
   * Create active ${entityLower}
   */
  active(overrides?: Partial<${entity}>): ${entity} {
    return this.create({ overrides: { isActive: true, ...overrides } });
  }`;
		}
	}

	private getMockBuildersTemplate(options: MockFactoryOptions): TestTemplate {
		return {
			name: "mock-builders.ts",
			path: "mock-builders.ts",
			content: `import { ${options.testingFramework === "jest" ? "jest" : "vi"} } from '${options.testingFramework}';
import { faker } from '@faker-js/faker';

/**
 * Advanced mock builders for complex test scenarios
 */

export class ServiceMockBuilder<T = any> {
  private methods: Map<string, any> = new Map();

  static create<T>(): ServiceMockBuilder<T> {
    return new ServiceMockBuilder<T>();
  }

  /**
   * Add a method that returns a resolved promise
   */
  withAsyncMethod(methodName: string, returnValue?: any): this {
    this.methods.set(methodName, ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockResolvedValue(returnValue));
    return this;
  }

  /**
   * Add a method that returns a rejected promise
   */
  withFailingMethod(methodName: string, error: Error): this {
    this.methods.set(methodName, ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockRejectedValue(error));
    return this;
  }

  /**
   * Add a synchronous method
   */
  withSyncMethod(methodName: string, returnValue?: any): this {
    this.methods.set(methodName, ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockReturnValue(returnValue));
    return this;
  }

  /**
   * Add a method with custom implementation
   */
  withCustomMethod(methodName: string, implementation: (...args: any[]) => any): this {
    this.methods.set(methodName, ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockImplementation(implementation));
    return this;
  }

  /**
   * Add CRUD methods
   */
  withCrudMethods(entityName: string = 'entity'): this {
    return this
      .withAsyncMethod('findAll', [])
      .withAsyncMethod('findById', null)
      .withAsyncMethod('create', { id: 1, name: \`Test \${entityName}\` })
      .withAsyncMethod('update', { id: 1, name: \`Updated \${entityName}\` })
      .withAsyncMethod('delete', true);
  }

  /**
   * Build the mock service
   */
  build(): T {
    const mock: any = {};
    this.methods.forEach((mockFn, methodName) => {
      mock[methodName] = mockFn;
    });
    return mock as T;
  }
}

export class RepositoryMockBuilder<T = any> {
  private methods: Map<string, any> = new Map();

  static create<T>(): RepositoryMockBuilder<T> {
    return new RepositoryMockBuilder<T>();
  }

  /**
   * Mock find all method
   */
  withFindAll(returnValue: T[] = []): this {
    this.methods.set('findAll', ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockResolvedValue(returnValue));
    return this;
  }

  /**
   * Mock find by ID method
   */
  withFindById(returnValue: T | null = null): this {
    this.methods.set('findById', ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockResolvedValue(returnValue));
    return this;
  }

  /**
   * Mock find by criteria method
   */
  withFindBy(returnValue: T[] = []): this {
    this.methods.set('findBy', ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockResolvedValue(returnValue));
    return this;
  }

  /**
   * Mock create method
   */
  withCreate(returnValue?: T): this {
    this.methods.set('create', ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockResolvedValue(returnValue));
    return this;
  }

  /**
   * Mock update method
   */
  withUpdate(returnValue?: T): this {
    this.methods.set('update', ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockResolvedValue(returnValue));
    return this;
  }

  /**
   * Mock delete method
   */
  withDelete(returnValue: boolean = true): this {
    this.methods.set('delete', ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockResolvedValue(returnValue));
    return this;
  }

  /**
   * Mock count method
   */
  withCount(returnValue: number = 0): this {
    this.methods.set('count', ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockResolvedValue(returnValue));
    return this;
  }

  /**
   * Mock exists method
   */
  withExists(returnValue: boolean = false): this {
    this.methods.set('exists', ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockResolvedValue(returnValue));
    return this;
  }

  /**
   * Mock transaction method
   */
  withTransaction(implementation?: (callback: Function) => Promise<any>): this {
    const defaultImpl = async (callback: Function) => {
      return await callback(this.build());
    };
    
    this.methods.set('transaction', ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockImplementation(implementation || defaultImpl));
    return this;
  }

  /**
   * Add all standard repository methods
   */
  withStandardMethods(): this {
    return this
      .withFindAll()
      .withFindById()
      .withFindBy()
      .withCreate()
      .withUpdate()
      .withDelete()
      .withCount()
      .withExists();
  }

  /**
   * Build the mock repository
   */
  build(): T {
    const mock: any = {};
    this.methods.forEach((mockFn, methodName) => {
      mock[methodName] = mockFn;
    });
    return mock as T;
  }
}

export class HttpClientMockBuilder {
  private methods: Map<string, any> = new Map();
  private interceptors: any = {
    request: { use: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}() },
    response: { use: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}() }
  };

  static create(): HttpClientMockBuilder {
    return new HttpClientMockBuilder();
  }

  /**
   * Mock GET request
   */
  withGet(url: string | RegExp, response: any, status: number = 200): this {
    const mockFn = this.methods.get('get') || ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}();
    
    if (typeof url === 'string') {
      mockFn.mockImplementation((requestUrl: string, config?: any) => {
        if (requestUrl === url) {
          return Promise.resolve({ data: response, status, statusText: 'OK', config, headers: {} });
        }
        return Promise.reject(new Error(\`Unexpected URL: \${requestUrl}\`));
      });
    } else {
      mockFn.mockImplementation((requestUrl: string, config?: any) => {
        if (url.test(requestUrl)) {
          return Promise.resolve({ data: response, status, statusText: 'OK', config, headers: {} });
        }
        return Promise.reject(new Error(\`Unexpected URL: \${requestUrl}\`));
      });
    }
    
    this.methods.set('get', mockFn);
    return this;
  }

  /**
   * Mock POST request
   */
  withPost(url: string | RegExp, response: any, status: number = 201): this {
    const mockFn = this.methods.get('post') || ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}();
    
    if (typeof url === 'string') {
      mockFn.mockImplementation((requestUrl: string, data?: any, config?: any) => {
        if (requestUrl === url) {
          return Promise.resolve({ data: response, status, statusText: 'Created', config, headers: {} });
        }
        return Promise.reject(new Error(\`Unexpected URL: \${requestUrl}\`));
      });
    } else {
      mockFn.mockImplementation((requestUrl: string, data?: any, config?: any) => {
        if (url.test(requestUrl)) {
          return Promise.resolve({ data: response, status, statusText: 'Created', config, headers: {} });
        }
        return Promise.reject(new Error(\`Unexpected URL: \${requestUrl}\`));
      });
    }
    
    this.methods.set('post', mockFn);
    return this;
  }

  /**
   * Mock PUT request
   */
  withPut(url: string | RegExp, response: any, status: number = 200): this {
    const mockFn = this.methods.get('put') || ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}();
    
    if (typeof url === 'string') {
      mockFn.mockImplementation((requestUrl: string, data?: any, config?: any) => {
        if (requestUrl === url) {
          return Promise.resolve({ data: response, status, statusText: 'OK', config, headers: {} });
        }
        return Promise.reject(new Error(\`Unexpected URL: \${requestUrl}\`));
      });
    } else {
      mockFn.mockImplementation((requestUrl: string, data?: any, config?: any) => {
        if (url.test(requestUrl)) {
          return Promise.resolve({ data: response, status, statusText: 'OK', config, headers: {} });
        }
        return Promise.reject(new Error(\`Unexpected URL: \${requestUrl}\`));
      });
    }
    
    this.methods.set('put', mockFn);
    return this;
  }

  /**
   * Mock DELETE request
   */
  withDelete(url: string | RegExp, response: any = null, status: number = 204): this {
    const mockFn = this.methods.get('delete') || ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}();
    
    if (typeof url === 'string') {
      mockFn.mockImplementation((requestUrl: string, config?: any) => {
        if (requestUrl === url) {
          return Promise.resolve({ data: response, status, statusText: 'No Content', config, headers: {} });
        }
        return Promise.reject(new Error(\`Unexpected URL: \${requestUrl}\`));
      });
    } else {
      mockFn.mockImplementation((requestUrl: string, config?: any) => {
        if (url.test(requestUrl)) {
          return Promise.resolve({ data: response, status, statusText: 'No Content', config, headers: {} });
        }
        return Promise.reject(new Error(\`Unexpected URL: \${requestUrl}\`));
      });
    }
    
    this.methods.set('delete', mockFn);
    return this;
  }

  /**
   * Mock request error
   */
  withError(method: 'get' | 'post' | 'put' | 'delete', error: any): this {
    this.methods.set(method, ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockRejectedValue(error));
    return this;
  }

  /**
   * Mock all HTTP methods with default implementations
   */
  withDefaultMethods(): this {
    ['get', 'post', 'put', 'delete', 'patch'].forEach(method => {
      if (!this.methods.has(method)) {
        this.methods.set(method, ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockRejectedValue(
          new Error(\`Unexpected \${method.toUpperCase()} request\`)
        ));
      }
    });
    return this;
  }

  /**
   * Build the mock HTTP client
   */
  build(): any {
    const mock: any = {
      interceptors: this.interceptors
    };
    
    this.methods.forEach((mockFn, methodName) => {
      mock[methodName] = mockFn;
    });
    
    return mock;
  }
}

export class EventEmitterMockBuilder {
  private listeners: Map<string, Function[]> = new Map();

  static create(): EventEmitterMockBuilder {
    return new EventEmitterMockBuilder();
  }

  /**
   * Add event listener
   */
  withListener(event: string, callback: Function): this {
    const callbacks = this.listeners.get(event) || [];
    callbacks.push(callback);
    this.listeners.set(event, callbacks);
    return this;
  }

  /**
   * Build the mock event emitter
   */
  build(): any {
    return {
      on: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}((event: string, callback: Function) => {
        const callbacks = this.listeners.get(event) || [];
        callbacks.push(callback);
        this.listeners.set(event, callbacks);
      }),
      
      emit: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}((event: string, ...args: any[]) => {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => callback(...args));
        return callbacks.length > 0;
      }),
      
      removeListener: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}((event: string, callback: Function) => {
        const callbacks = this.listeners.get(event) || [];
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
          this.listeners.set(event, callbacks);
        }
      }),
      
      removeAllListeners: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}((event?: string) => {
        if (event) {
          this.listeners.delete(event);
        } else {
          this.listeners.clear();
        }
      }),
      
      listenerCount: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}((event: string) => {
        return this.listeners.get(event)?.length || 0;
      })
    };
  }
}

/**
 * Factory for creating common mocks
 */
export const MockFactory = {
  /**
   * Create a mock logger
   */
  logger: () => ({
    info: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}(),
    warn: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}(),
    error: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}(),
    debug: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}()
  }),

  /**
   * Create a mock database connection
   */
  database: () => ({
    query: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}(),
    connect: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}(),
    release: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}(),
    end: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}()
  }),

  /**
   * Create a mock cache client
   */
  cache: () => ({
    get: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}(),
    set: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}(),
    del: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}(),
    exists: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}(),
    expire: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}(),
    flush: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}()
  }),

  /**
   * Create a mock email service
   */
  emailService: () => ({
    send: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockResolvedValue({ messageId: faker.datatype.uuid() }),
    sendBulk: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockResolvedValue({ sent: 0, failed: 0 }),
    verifyConnection: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockResolvedValue(true)
  }),

  /**
   * Create a mock file storage service
   */
  fileStorage: () => ({
    upload: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockResolvedValue({ url: faker.internet.url(), key: faker.datatype.uuid() }),
    download: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockResolvedValue(Buffer.from('test-content')),
    delete: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockResolvedValue(true),
    exists: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockResolvedValue(false),
    getSignedUrl: ${options.testingFramework === "jest" ? "jest.fn" : "vi.fn"}().mockResolvedValue(faker.internet.url())
  })
};`,
			dependencies: ["@faker-js/faker"],
		};
	}

	private getTestDataGeneratorsTemplate(
		options: MockFactoryOptions,
	): TestTemplate {
		return {
			name: "test-data-generators.ts",
			path: "test-data-generators.ts",
			content: `import { faker } from '@faker-js/faker';

/**
 * Specialized test data generators for different scenarios
 */

export class TestDataGenerator {
  ${
		options.localization
			? `
  /**
   * Set locale for generated data
   */
  static setLocale(locale: string): void {
    faker.setLocale(locale);
  }`
			: ""
	}

  /**
   * Generate realistic user data
   */
  static user(overrides: any = {}): any {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    
    return {
      id: faker.datatype.number({ min: 1, max: 100000 }),
      email: faker.internet.email(firstName, lastName).toLowerCase(),
      username: faker.internet.userName(firstName, lastName).toLowerCase(),
      firstName,
      lastName,
      fullName: \`\${firstName} \${lastName}\`,
      avatar: faker.image.avatar(),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
      phone: faker.phone.number(),
      address: {
        street: faker.address.streetAddress(),
        city: faker.address.city(),
        state: faker.address.state(),
        zipCode: faker.address.zipCode(),
        country: faker.address.country()
      },
      preferences: {
        theme: faker.helpers.arrayElement(['light', 'dark', 'auto']),
        language: faker.helpers.arrayElement(['en', 'es', 'fr', 'de']),
        notifications: faker.datatype.boolean()
      },
      metadata: {
        lastLoginAt: faker.date.recent(30),
        loginCount: faker.datatype.number({ min: 0, max: 1000 }),
        isEmailVerified: faker.datatype.boolean(),
        source: faker.helpers.arrayElement(['web', 'mobile', 'api'])
      },
      createdAt: faker.date.past(2),
      updatedAt: faker.date.recent(30),
      ...overrides
    };
  }

  /**
   * Generate realistic product data
   */
  static product(overrides: any = {}): any {
    const name = faker.commerce.productName();
    const price = parseFloat(faker.commerce.price());
    
    return {
      id: faker.datatype.number({ min: 1, max: 100000 }),
      name,
      slug: faker.helpers.slugify(name).toLowerCase(),
      description: faker.commerce.productDescription(),
      shortDescription: faker.lorem.sentence(),
      sku: faker.random.alphaNumeric(8).toUpperCase(),
      price,
      salePrice: faker.datatype.boolean() ? price * 0.8 : null,
      cost: price * 0.6,
      weight: faker.datatype.number({ min: 0.1, max: 50, precision: 0.1 }),
      dimensions: {
        length: faker.datatype.number({ min: 1, max: 100, precision: 0.1 }),
        width: faker.datatype.number({ min: 1, max: 100, precision: 0.1 }),
        height: faker.datatype.number({ min: 1, max: 100, precision: 0.1 })
      },
      category: {
        id: faker.datatype.number({ min: 1, max: 20 }),
        name: faker.commerce.department(),
        slug: faker.helpers.slugify(faker.commerce.department()).toLowerCase()
      },
      brand: {
        id: faker.datatype.number({ min: 1, max: 50 }),
        name: faker.company.name()
      },
      tags: faker.helpers.arrayElements(
        ['featured', 'sale', 'new', 'popular', 'trending', 'bestseller'],
        faker.datatype.number({ min: 0, max: 3 })
      ),
      images: Array.from({ length: faker.datatype.number({ min: 1, max: 5 }) }, () => ({
        url: faker.image.business(640, 480, true),
        alt: faker.lorem.words(3),
        isPrimary: false
      })),
      inventory: {
        quantity: faker.datatype.number({ min: 0, max: 1000 }),
        reserved: faker.datatype.number({ min: 0, max: 50 }),
        threshold: faker.datatype.number({ min: 5, max: 20 })
      },
      seo: {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        keywords: faker.lorem.words(5).split(' ')
      },
      isActive: faker.datatype.boolean(),
      isFeatured: faker.datatype.boolean(),
      createdAt: faker.date.past(1),
      updatedAt: faker.date.recent(30),
      ...overrides
    };
  }

  /**
   * Generate realistic order data
   */
  static order(overrides: any = {}): any {
    const itemCount = faker.datatype.number({ min: 1, max: 5 });
    const items = Array.from({ length: itemCount }, () => {
      const quantity = faker.datatype.number({ min: 1, max: 3 });
      const price = parseFloat(faker.commerce.price());
      return {
        id: faker.datatype.number({ min: 1, max: 100000 }),
        productId: faker.datatype.number({ min: 1, max: 10000 }),
        name: faker.commerce.productName(),
        sku: faker.random.alphaNumeric(8).toUpperCase(),
        quantity,
        price,
        total: price * quantity
      };
    });
    
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1;
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + tax + shipping;
    
    return {
      id: faker.datatype.number({ min: 1, max: 100000 }),
      orderNumber: \`ORD-\${faker.random.alphaNumeric(8).toUpperCase()}\`,
      userId: faker.datatype.number({ min: 1, max: 10000 }),
      status: faker.helpers.arrayElement(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
      items,
      pricing: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        shipping: shipping,
        discount: 0,
        total: parseFloat(total.toFixed(2))
      },
      shippingAddress: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        company: faker.datatype.boolean() ? faker.company.name() : null,
        street: faker.address.streetAddress(),
        city: faker.address.city(),
        state: faker.address.state(),
        zipCode: faker.address.zipCode(),
        country: faker.address.country(),
        phone: faker.phone.number()
      },
      billingAddress: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        company: faker.datatype.boolean() ? faker.company.name() : null,
        street: faker.address.streetAddress(),
        city: faker.address.city(),
        state: faker.address.state(),
        zipCode: faker.address.zipCode(),
        country: faker.address.country(),
        phone: faker.phone.number()
      },
      payment: {
        method: faker.helpers.arrayElement(['credit_card', 'paypal', 'bank_transfer']),
        status: faker.helpers.arrayElement(['pending', 'completed', 'failed', 'refunded']),
        transactionId: faker.datatype.uuid(),
        paidAt: faker.datatype.boolean() ? faker.date.recent(7) : null
      },
      tracking: {
        carrier: faker.helpers.arrayElement(['UPS', 'FedEx', 'DHL', 'USPS']),
        trackingNumber: faker.random.alphaNumeric(12).toUpperCase(),
        estimatedDelivery: faker.date.future(0.1)
      },
      notes: faker.datatype.boolean() ? faker.lorem.sentence() : null,
      createdAt: faker.date.past(0.5),
      updatedAt: faker.date.recent(7),
      ...overrides
    };
  }

  /**
   * Generate realistic article/blog post data
   */
  static article(overrides: any = {}): any {
    const title = faker.lorem.sentence();
    const wordCount = faker.datatype.number({ min: 500, max: 2000 });
    
    return {
      id: faker.datatype.number({ min: 1, max: 100000 }),
      title,
      slug: faker.helpers.slugify(title).toLowerCase(),
      summary: faker.lorem.paragraph(),
      content: faker.lorem.paragraphs(Math.ceil(wordCount / 100)),
      excerpt: faker.lorem.sentences(2),
      authorId: faker.datatype.number({ min: 1, max: 100 }),
      author: {
        name: faker.name.fullName(),
        avatar: faker.image.avatar(),
        bio: faker.lorem.sentence()
      },
      category: {
        id: faker.datatype.number({ min: 1, max: 20 }),
        name: faker.lorem.word(),
        slug: faker.helpers.slugify(faker.lorem.word()).toLowerCase()
      },
      tags: faker.helpers.arrayElements(
        ['technology', 'business', 'lifestyle', 'health', 'education', 'entertainment'],
        faker.datatype.number({ min: 1, max: 4 })
      ),
      featuredImage: {
        url: faker.image.business(1200, 630, true),
        alt: faker.lorem.words(5),
        caption: faker.lorem.sentence()
      },
      seo: {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        keywords: faker.lorem.words(10).split(' ')
      },
      stats: {
        views: faker.datatype.number({ min: 0, max: 100000 }),
        likes: faker.datatype.number({ min: 0, max: 1000 }),
        comments: faker.datatype.number({ min: 0, max: 100 }),
        shares: faker.datatype.number({ min: 0, max: 500 })
      },
      status: faker.helpers.arrayElement(['draft', 'published', 'archived']),
      publishedAt: faker.datatype.boolean() ? faker.date.past(1) : null,
      createdAt: faker.date.past(1),
      updatedAt: faker.date.recent(30),
      ...overrides
    };
  }

  /**
   * Generate test data for API responses
   */
  static apiResponse<T>(data: T, success: boolean = true, overrides: any = {}): any {
    if (success) {
      return {
        success: true,
        data,
        message: 'Request successful',
        timestamp: new Date().toISOString(),
        requestId: faker.datatype.uuid(),
        ...overrides
      };
    } else {
      return {
        success: false,
        error: {
          code: faker.helpers.arrayElement(['VALIDATION_ERROR', 'NOT_FOUND', 'UNAUTHORIZED', 'SERVER_ERROR']),
          message: faker.lorem.sentence(),
          details: faker.lorem.paragraph()
        },
        timestamp: new Date().toISOString(),
        requestId: faker.datatype.uuid(),
        ...overrides
      };
    }
  }

  /**
   * Generate paginated response data
   */
  static paginatedResponse<T>(items: T[], overrides: any = {}): any {
    const page = overrides.page || 1;
    const limit = overrides.limit || 10;
    const total = overrides.total || items.length;
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      ...overrides
    };
  }

  /**
   * Generate bulk data for performance testing
   */
  static bulk<T>(generator: () => T, count: number): T[] {
    return Array.from({ length: count }, generator);
  }

  /**
   * Generate time series data
   */
  static timeSeries(
    startDate: Date,
    endDate: Date,
    interval: 'hour' | 'day' | 'week' | 'month',
    valueGenerator: () => number = () => faker.datatype.number({ min: 0, max: 1000 })
  ): Array<{ timestamp: Date; value: number }> {
    const data: Array<{ timestamp: Date; value: number }> = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      data.push({
        timestamp: new Date(current),
        value: valueGenerator()
      });
      
      switch (interval) {
        case 'hour':
          current.setHours(current.getHours() + 1);
          break;
        case 'day':
          current.setDate(current.getDate() + 1);
          break;
        case 'week':
          current.setDate(current.getDate() + 7);
          break;
        case 'month':
          current.setMonth(current.getMonth() + 1);
          break;
      }
    }
    
    return data;
  }

  /**
   * Generate test files data
   */
  static file(type: 'image' | 'document' | 'video' | 'audio' = 'image', overrides: any = {}): any {
    const extensions = {
      image: ['jpg', 'png', 'gif', 'webp'],
      document: ['pdf', 'doc', 'docx', 'txt'],
      video: ['mp4', 'avi', 'mov', 'webm'],
      audio: ['mp3', 'wav', 'ogg', 'flac']
    };
    
    const mimeTypes = {
      image: 'image/',
      document: 'application/',
      video: 'video/',
      audio: 'audio/'
    };
    
    const extension = faker.helpers.arrayElement(extensions[type]);
    const size = faker.datatype.number({ 
      min: type === 'image' ? 10000 : 50000, 
      max: type === 'video' ? 50000000 : 5000000 
    });
    
    return {
      id: faker.datatype.uuid(),
      name: \`\${faker.system.fileName()}.\${extension}\`,
      originalName: \`\${faker.lorem.words(2).replace(' ', '_')}.\${extension}\`,
      size,
      mimeType: \`\${mimeTypes[type]}\${extension}\`,
      url: faker.internet.url(),
      thumbnailUrl: type === 'image' ? faker.image.abstract(200, 200) : null,
      metadata: {
        width: type === 'image' ? faker.datatype.number({ min: 100, max: 4000 }) : null,
        height: type === 'image' ? faker.datatype.number({ min: 100, max: 4000 }) : null,
        duration: ['video', 'audio'].includes(type) ? faker.datatype.number({ min: 10, max: 3600 }) : null
      },
      uploadedBy: faker.datatype.number({ min: 1, max: 1000 }),
      uploadedAt: faker.date.recent(30),
      ...overrides
    };
  }
}

/**
 * Quick access generators
 */
export const generate = {
  user: (overrides?: any) => TestDataGenerator.user(overrides),
  users: (count: number, overrides?: any) => TestDataGenerator.bulk(() => TestDataGenerator.user(overrides), count),
  
  product: (overrides?: any) => TestDataGenerator.product(overrides),
  products: (count: number, overrides?: any) => TestDataGenerator.bulk(() => TestDataGenerator.product(overrides), count),
  
  order: (overrides?: any) => TestDataGenerator.order(overrides),
  orders: (count: number, overrides?: any) => TestDataGenerator.bulk(() => TestDataGenerator.order(overrides), count),
  
  article: (overrides?: any) => TestDataGenerator.article(overrides),
  articles: (count: number, overrides?: any) => TestDataGenerator.bulk(() => TestDataGenerator.article(overrides), count),
  
  apiResponse: <T>(data: T, success?: boolean, overrides?: any) => TestDataGenerator.apiResponse(data, success, overrides),
  paginatedResponse: <T>(items: T[], overrides?: any) => TestDataGenerator.paginatedResponse(items, overrides),
  
  file: (type?: 'image' | 'document' | 'video' | 'audio', overrides?: any) => TestDataGenerator.file(type, overrides),
  files: (count: number, type?: 'image' | 'document' | 'video' | 'audio', overrides?: any) => 
    TestDataGenerator.bulk(() => TestDataGenerator.file(type, overrides), count)
};`,
			dependencies: ["@faker-js/faker"],
		};
	}

	private getFakerIntegrationTemplate(
		options: MockFactoryOptions,
	): TestTemplate {
		return {
			name: "faker-integration.ts",
			path: "faker-integration.ts",
			content: `import { faker } from '@faker-js/faker';

/**
 * Enhanced Faker.js integration with custom providers and utilities
 */

${
	options.localization
		? `
/**
 * Locale-specific data generators
 */
export class LocalizedFaker {
  static readonly SUPPORTED_LOCALES = [
    'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'
  ];

  /**
   * Generate data in specific locale
   */
  static inLocale<T>(locale: string, generator: () => T): T {
    const currentLocale = faker.locale;
    try {
      faker.setLocale(locale);
      return generator();
    } finally {
      faker.setLocale(currentLocale);
    }
  }

  /**
   * Generate multilingual content
   */
  static multilingualContent(locales: string[] = ['en', 'es', 'fr']): Record<string, any> {
    const content: Record<string, any> = {};
    
    locales.forEach(locale => {
      content[locale] = this.inLocale(locale, () => ({
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        keywords: faker.lorem.words(5).split(' ')
      }));
    });
    
    return content;
  }

  /**
   * Generate localized user data
   */
  static localizedUser(locale: string = 'en'): any {
    return this.inLocale(locale, () => ({
      name: faker.name.fullName(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: {
        street: faker.address.streetAddress(),
        city: faker.address.city(),
        state: faker.address.state(),
        zipCode: faker.address.zipCode(),
        country: faker.address.country()
      }
    }));
  }
}`
		: ""
}

/**
 * Custom providers for domain-specific data
 */
export class CustomProviders {
  /**
   * Generate software-related data
   */
  static software = {
    version: (): string => {
      const major = faker.datatype.number({ min: 1, max: 10 });
      const minor = faker.datatype.number({ min: 0, max: 20 });
      const patch = faker.datatype.number({ min: 0, max: 100 });
      return \`\${major}.\${minor}.\${patch}\`;
    },

    frameworkName: (): string => {
      const prefixes = ['React', 'Vue', 'Angular', 'Svelte', 'Next', 'Nuxt'];
      const suffixes = ['JS', 'Framework', 'Kit', 'App', 'UI', 'Core'];
      return \`\${faker.helpers.arrayElement(prefixes)}\${faker.helpers.arrayElement(suffixes)}\`;
    },

    apiEndpoint: (): string => {
      const resources = ['users', 'posts', 'products', 'orders', 'comments'];
      const resource = faker.helpers.arrayElement(resources);
      const hasId = faker.datatype.boolean();
      return hasId ? \`/api/v1/\${resource}/\${faker.datatype.number({ min: 1, max: 1000 })}\` : \`/api/v1/\${resource}\`;
    },

    statusCode: (type: 'success' | 'error' | 'any' = 'any'): number => {
      const codes = {
        success: [200, 201, 204],
        error: [400, 401, 403, 404, 422, 500, 502, 503],
        any: [200, 201, 204, 400, 401, 403, 404, 422, 500, 502, 503]
      };
      return faker.helpers.arrayElement(codes[type]);
    },

    httpMethod: (): string => {
      return faker.helpers.arrayElement(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
    },

    dockerfile: (): string => {
      const baseImages = ['node:16-alpine', 'python:3.9-slim', 'nginx:alpine', 'ubuntu:20.04'];
      const baseImage = faker.helpers.arrayElement(baseImages);
      
      return \`FROM \${baseImage}

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]\`;
    }
  };

  /**
   * Generate e-commerce related data
   */
  static ecommerce = {
    productCategory: (): string => {
      return faker.helpers.arrayElement([
        'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books',
        'Toys', 'Beauty', 'Automotive', 'Health', 'Food & Beverage'
      ]);
    },

    productCondition: (): string => {
      return faker.helpers.arrayElement(['New', 'Used - Like New', 'Used - Good', 'Used - Fair', 'Refurbished']);
    },

    shippingMethod: (): string => {
      return faker.helpers.arrayElement(['Standard', 'Express', 'Overnight', 'Same Day', 'Pickup']);
    },

    paymentMethod: (): string => {
      return faker.helpers.arrayElement(['Credit Card', 'PayPal', 'Bank Transfer', 'Apple Pay', 'Google Pay']);
    },

    discountCode: (): string => {
      const prefixes = ['SAVE', 'DEAL', 'SPECIAL', 'PROMO'];
      const numbers = faker.datatype.number({ min: 10, max: 50 });
      return \`\${faker.helpers.arrayElement(prefixes)}\${numbers}\`;
    },

    reviewRating: (): number => {
      return faker.helpers.weightedArrayElement([
        { weight: 5, value: 5 },
        { weight: 15, value: 4 },
        { weight: 30, value: 3 },
        { weight: 25, value: 2 },
        { weight: 25, value: 1 }
      ]);
    },

    inventory: (): { quantity: number; reserved: number; available: number } => {
      const quantity = faker.datatype.number({ min: 0, max: 1000 });
      const reserved = faker.datatype.number({ min: 0, max: Math.floor(quantity * 0.3) });
      return {
        quantity,
        reserved,
        available: quantity - reserved
      };
    }
  };

  /**
   * Generate financial data
   */
  static finance = {
    accountNumber: (): string => {
      return faker.finance.account(12);
    },

    routingNumber: (): string => {
      return faker.finance.routingNumber();
    },

    transactionType: (): string => {
      return faker.helpers.arrayElement(['deposit', 'withdrawal', 'transfer', 'payment', 'refund']);
    },

    currency: (): { code: string; symbol: string; name: string } => {
      const currencies = [
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'British Pound' },
        { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
        { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' }
      ];
      return faker.helpers.arrayElement(currencies);
    },

    cryptoWallet: (): string => {
      return faker.finance.bitcoinAddress();
    },

    stockSymbol: (): string => {
      return faker.random.alpha({ count: 4, upcase: true });
    }
  };

  /**
   * Generate time-based data
   */
  static temporal = {
    businessHours: (): { open: string; close: string } => {
      const openHour = faker.datatype.number({ min: 6, max: 10 });
      const closeHour = faker.datatype.number({ min: 17, max: 22 });
      return {
        open: \`\${openHour.toString().padStart(2, '0')}:00\`,
        close: \`\${closeHour.toString().padStart(2, '0')}:00\`
      };
    },

    timezone: (): string => {
      const timezones = [
        'America/New_York', 'America/Los_Angeles', 'Europe/London',
        'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
      ];
      return faker.helpers.arrayElement(timezones);
    },

    duration: (unit: 'seconds' | 'minutes' | 'hours' | 'days' = 'minutes'): number => {
      const ranges = {
        seconds: { min: 1, max: 3600 },
        minutes: { min: 1, max: 1440 },
        hours: { min: 1, max: 168 },
        days: { min: 1, max: 365 }
      };
      return faker.datatype.number(ranges[unit]);
    },

    cron: (): string => {
      const minute = faker.datatype.number({ min: 0, max: 59 });
      const hour = faker.datatype.number({ min: 0, max: 23 });
      const day = faker.helpers.arrayElement(['*', faker.datatype.number({ min: 1, max: 31 }).toString()]);
      const month = faker.helpers.arrayElement(['*', faker.datatype.number({ min: 1, max: 12 }).toString()]);
      const dayOfWeek = faker.helpers.arrayElement(['*', faker.datatype.number({ min: 0, max: 6 }).toString()]);
      
      return \`\${minute} \${hour} \${day} \${month} \${dayOfWeek}\`;
    }
  };

  /**
   * Generate testing-specific data
   */
  static testing = {
    testCaseName: (): string => {
      const prefixes = ['should', 'must', 'can', 'will'];
      const actions = ['create', 'update', 'delete', 'validate', 'process', 'handle'];
      const objects = ['user', 'data', 'request', 'response', 'error', 'event'];
      const modifiers = ['correctly', 'successfully', 'properly', 'efficiently'];
      
      return \`\${faker.helpers.arrayElement(prefixes)} \${faker.helpers.arrayElement(actions)} \${faker.helpers.arrayElement(objects)} \${faker.helpers.arrayElement(modifiers)}\`;
    },

    errorMessage: (): string => {
      const types = [
        'Validation failed',
        'Resource not found',
        'Access denied',
        'Internal server error',
        'Bad request',
        'Timeout occurred'
      ];
      return faker.helpers.arrayElement(types);
    },

    logLevel: (): string => {
      return faker.helpers.arrayElement(['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']);
    },

    testEnvironment: (): string => {
      return faker.helpers.arrayElement(['development', 'staging', 'testing', 'production']);
    },

    performanceMetric: (): { name: string; value: number; unit: string } => {
      const metrics = [
        { name: 'response_time', unit: 'ms', max: 5000 },
        { name: 'memory_usage', unit: 'MB', max: 1024 },
        { name: 'cpu_usage', unit: '%', max: 100 },
        { name: 'throughput', unit: 'req/s', max: 10000 }
      ];
      
      const metric = faker.helpers.arrayElement(metrics);
      return {
        name: metric.name,
        value: faker.datatype.number({ min: 1, max: metric.max, precision: 0.01 }),
        unit: metric.unit
      };
    }
  };
}

/**
 * Seed management for reproducible tests
 */
export class SeedManager {
  private static originalSeed: number | undefined;

  /**
   * Set seed for reproducible test data
   */
  static setSeed(seed: number): void {
    this.originalSeed = faker.seed(seed);
  }

  /**
   * Reset to original seed
   */
  static reset(): void {
    if (this.originalSeed !== undefined) {
      faker.seed(this.originalSeed);
    }
  }

  /**
   * Generate deterministic test data with seed
   */
  static withSeed<T>(seed: number, generator: () => T): T {
    const currentSeed = faker.seed();
    try {
      faker.seed(seed);
      return generator();
    } finally {
      faker.seed(currentSeed);
    }
  }
}

/**
 * Data validation helpers
 */
export class DataValidation {
  /**
   * Validate generated email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate generated phone format
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate generated URL format
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate generated credit card format
   */
  static isValidCreditCard(card: string): boolean {
    const cardRegex = /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/;
    return cardRegex.test(card);
  }
}

// Export convenience functions
export const customFaker = {
  software: CustomProviders.software,
  ecommerce: CustomProviders.ecommerce,
  finance: CustomProviders.finance,
  temporal: CustomProviders.temporal,
  testing: CustomProviders.testing,
  seed: SeedManager,
  validate: DataValidation,
  ${options.localization ? "localized: LocalizedFaker," : ""}
};`,
			dependencies: ["@faker-js/faker"],
		};
	}

	private getFactoryRegistryTemplate(
		options: MockFactoryOptions,
	): TestTemplate {
		return {
			name: "factory-registry.ts",
			path: "factory-registry.ts",
			content: `import { BaseFactory } from './base-factory';
${options.entities
	.map(
		(entity) =>
			`import { ${entity.toLowerCase()}Factory } from './${entity.toLowerCase()}-factory';`,
	)
	.join("\n")}

/**
 * Central registry for all factories
 */

export class FactoryRegistry {
  private static factories: Map<string, BaseFactory<any>> = new Map();
  private static initialized = false;

  /**
   * Initialize registry with all factories
   */
  private static initialize(): void {
    if (this.initialized) return;

    ${options.entities
			.map(
				(entity) =>
					`this.factories.set('${entity.toLowerCase()}', ${entity.toLowerCase()}Factory);`,
			)
			.join("\n    ")}

    this.initialized = true;
  }

  /**
   * Register a new factory
   */
  static register<T>(name: string, factory: BaseFactory<T>): void {
    this.initialize();
    this.factories.set(name, factory);
  }

  /**
   * Get factory by name
   */
  static get<T>(name: string): BaseFactory<T> {
    this.initialize();
    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(\`Factory '\${name}' not found. Available factories: \${Array.from(this.factories.keys()).join(', ')}\`);
    }
    return factory;
  }

  /**
   * Create entity using factory
   */
  static create<T>(name: string, overrides?: Partial<T>): T {
    return this.get<T>(name).create({ overrides });
  }

  /**
   * Create multiple entities using factory
   */
  static createMany<T>(name: string, count: number, overrides?: Partial<T>): T[] {
    return this.get<T>(name).createMany(count, { overrides });
  }

  /**
   * Get all registered factory names
   */
  static getFactoryNames(): string[] {
    this.initialize();
    return Array.from(this.factories.keys());
  }

  /**
   * Check if factory exists
   */
  static has(name: string): boolean {
    this.initialize();
    return this.factories.has(name);
  }

  /**
   * Remove factory from registry
   */
  static remove(name: string): boolean {
    this.initialize();
    return this.factories.delete(name);
  }

  /**
   * Clear all factories
   */
  static clear(): void {
    this.factories.clear();
    this.initialized = false;
  }

  /**
   * Create related entities
   */
  static createRelated(relationships: RelationshipDefinition[]): any {
    const entities: any = {};
    
    // First pass: create all entities
    relationships.forEach(rel => {
      if (rel.type === 'hasOne' || rel.type === 'belongsTo') {
        entities[rel.name] = this.create(rel.factory, rel.overrides);
      } else if (rel.type === 'hasMany') {
        entities[rel.name] = this.createMany(rel.factory, rel.count || 3, rel.overrides);
      }
    });

    // Second pass: apply relationships
    relationships.forEach(rel => {
      if (rel.foreignKey && rel.references) {
        const referencedEntity = entities[rel.references];
        if (referencedEntity) {
          const targetEntities = Array.isArray(entities[rel.name]) ? entities[rel.name] : [entities[rel.name]];
          targetEntities.forEach((entity: any) => {
            entity[rel.foreignKey!] = referencedEntity.id;
          });
        }
      }
    });

    return entities;
  }

  /**
   * Bulk create with relationships
   */
  static bulkCreateWithRelations(
    entityName: string,
    count: number,
    relationships: RelationshipDefinition[] = []
  ): any[] {
    return Array.from({ length: count }, () => {
      const mainEntity = this.create(entityName);
      const relatedEntities = this.createRelated(relationships);
      
      return {
        [entityName]: mainEntity,
        ...relatedEntities
      };
    });
  }
}

/**
 * Relationship definition for creating related entities
 */
export interface RelationshipDefinition {
  name: string;
  factory: string;
  type: 'hasOne' | 'hasMany' | 'belongsTo';
  count?: number;
  overrides?: any;
  foreignKey?: string;
  references?: string;
}

/**
 * Convenient factory methods
 */
export const Factory = {
  /**
   * Create single entity
   */
  create: <T>(name: string, overrides?: Partial<T>): T => {
    return FactoryRegistry.create(name, overrides);
  },

  /**
   * Create multiple entities
   */
  createMany: <T>(name: string, count: number, overrides?: Partial<T>): T[] => {
    return FactoryRegistry.createMany(name, count, overrides);
  },

  /**
   * Get factory instance
   */
  get: <T>(name: string): BaseFactory<T> => {
    return FactoryRegistry.get(name);
  },

  /**
   * Create with relationships
   */
  createRelated: (relationships: RelationshipDefinition[]): any => {
    return FactoryRegistry.createRelated(relationships);
  },

  /**
   * Bulk create with relationships
   */
  bulkCreateWithRelations: (
    entityName: string,
    count: number,
    relationships?: RelationshipDefinition[]
  ): any[] => {
    return FactoryRegistry.bulkCreateWithRelations(entityName, count, relationships);
  },

  /**
   * Reset all sequences
   */
  resetSequences: (): void => {
    const { Sequence } = require('./base-factory');
    Sequence.reset();
  }
};

// Pre-defined relationship templates
export const RelationshipTemplates = {
  userWithOrders: (orderCount: number = 3): RelationshipDefinition[] => [
    {
      name: 'user',
      factory: 'user',
      type: 'hasOne'
    },
    {
      name: 'orders',
      factory: 'order',
      type: 'hasMany',
      count: orderCount,
      foreignKey: 'userId',
      references: 'user'
    }
  ],

  orderWithItems: (itemCount: number = 2): RelationshipDefinition[] => [
    {
      name: 'order',
      factory: 'order',
      type: 'hasOne'
    },
    {
      name: 'products',
      factory: 'product',
      type: 'hasMany',
      count: itemCount
    }
  ],

  ${
		options.entities.includes("Article")
			? `
  articleWithAuthor: (): RelationshipDefinition[] => [
    {
      name: 'author',
      factory: 'user',
      type: 'belongsTo'
    },
    {
      name: 'article',
      factory: 'article',
      type: 'hasOne',
      foreignKey: 'authorId',
      references: 'author'
    }
  ],`
			: ""
	}

  ecommerceComplete: (): RelationshipDefinition[] => [
    {
      name: 'user',
      factory: 'user',
      type: 'hasOne'
    },
    {
      name: 'products',
      factory: 'product',
      type: 'hasMany',
      count: 5
    },
    {
      name: 'orders',
      factory: 'order',
      type: 'hasMany',
      count: 2,
      foreignKey: 'userId',
      references: 'user'
    }
  ]
};

// Export all factories for direct access
export {
  ${options.entities.map((entity) => `${entity.toLowerCase()}Factory`).join(",\n  ")}
};`,
			dependencies: [],
		};
	}

	private async writeTemplate(
		template: TestTemplate,
		basePath: string,
	): Promise<void> {
		const fullPath = path.join(basePath, template.path);
		const dirPath = path.dirname(fullPath);

		await this.ensureDirectoryExists(dirPath);
		await fs.writeFile(fullPath, template.content, "utf8");

		this.logger.info(`Generated: ${template.name}`);
	}

	private async ensureDirectoryExists(dirPath: string): Promise<void> {
		try {
			await fs.access(dirPath);
		} catch {
			await fs.mkdir(dirPath, { recursive: true });
		}
	}
}
