/**
 * Database Test Helper
 * Utilities for managing test databases across different database systems
 */

import { randomBytes } from "node:crypto";

export interface DatabaseConfig {
	readonly type: "postgresql" | "mysql" | "mongodb" | "sqlite";
	readonly host?: string;
	readonly port?: number;
	readonly database?: string;
	readonly username?: string;
	readonly password?: string;
	readonly uri?: string;
	readonly filename?: string;
}

export interface TestDatabase {
	readonly config: DatabaseConfig;
	readonly connectionString: string;
	readonly cleanup: () => Promise<void>;
	readonly isConnected: () => Promise<boolean>;
	readonly createSchema: (schema: string) => Promise<void>;
	readonly dropSchema: (schema: string) => Promise<void>;
	readonly executeQuery: (query: string, params?: unknown[]) => Promise<unknown>;
}

export class DatabaseTestHelper {
	private readonly activeDatabases = new Set<TestDatabase>();

	/**
	 * Create a test database instance
	 */
	async createTestDatabase(type: DatabaseConfig["type"]): Promise<TestDatabase> {
		const testId = randomBytes(8).toString("hex");
		const config = this.getTestConfig(type, testId);
		
		const database = await this.createDatabaseInstance(config);
		this.activeDatabases.add(database);
		
		return database;
	}

	/**
	 * Cleanup all test databases
	 */
	async cleanupAllDatabases(): Promise<void> {
		const cleanupPromises = Array.from(this.activeDatabases).map(db => db.cleanup());
		await Promise.allSettled(cleanupPromises);
		this.activeDatabases.clear();
	}

	/**
	 * Get test database configuration
	 */
	private getTestConfig(type: DatabaseConfig["type"], testId: string): DatabaseConfig {
		switch (type) {
			case "postgresql":
				return {
					type,
					host: process.env.TEST_POSTGRES_HOST || "localhost",
					port: parseInt(process.env.TEST_POSTGRES_PORT || "5432"),
					database: `xaheen_test_${testId}`,
					username: process.env.TEST_POSTGRES_USER || "postgres",
					password: process.env.TEST_POSTGRES_PASSWORD || "postgres",
				};
			
			case "mysql":
				return {
					type,
					host: process.env.TEST_MYSQL_HOST || "localhost",
					port: parseInt(process.env.TEST_MYSQL_PORT || "3306"),
					database: `xaheen_test_${testId}`,
					username: process.env.TEST_MYSQL_USER || "root",
					password: process.env.TEST_MYSQL_PASSWORD || "password",
				};
			
			case "mongodb":
				return {
					type,
					uri: process.env.TEST_MONGODB_URI || `mongodb://localhost:27017/xaheen_test_${testId}`,
				};
			
			case "sqlite":
				return {
					type,
					filename: `:memory:`, // Use in-memory database for tests
				};
			
			default:
				throw new Error(`Unsupported database type: ${type}`);
		}
	}

	/**
	 * Create database instance based on type
	 */
	private async createDatabaseInstance(config: DatabaseConfig): Promise<TestDatabase> {
		switch (config.type) {
			case "postgresql":
				return this.createPostgreSQLInstance(config);
			case "mysql":
				return this.createMySQLInstance(config);
			case "mongodb":
				return this.createMongoDBInstance(config);
			case "sqlite":
				return this.createSQLiteInstance(config);
			default:
				throw new Error(`Unsupported database type: ${config.type}`);
		}
	}

	/**
	 * Create PostgreSQL test instance
	 */
	private async createPostgreSQLInstance(config: DatabaseConfig): Promise<TestDatabase> {
		const connectionString = `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
		
		let client: any = null;

		const cleanup = async (): Promise<void> => {
			if (client) {
				try {
					// Drop the test database
					await client.query(`DROP DATABASE IF EXISTS "${config.database}"`);
					await client.end();
				} catch (error) {
					console.warn(`Failed to cleanup PostgreSQL database: ${error}`);
				}
			}
		};

		const isConnected = async (): Promise<boolean> => {
			try {
				if (!client) {
					// Use a mock client for testing - in real implementation, this would use pg
					client = {
						query: async (sql: string) => ({ rows: [] }),
						end: async () => {},
					};
				}
				await client.query("SELECT 1");
				return true;
			} catch {
				return false;
			}
		};

		const createSchema = async (schema: string): Promise<void> => {
			if (client) {
				await client.query(schema);
			}
		};

		const dropSchema = async (schema: string): Promise<void> => {
			if (client) {
				await client.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
			}
		};

		const executeQuery = async (query: string, params?: unknown[]): Promise<unknown> => {
			if (client) {
				const result = await client.query(query, params);
				return result.rows;
			}
			return [];
		};

		return {
			config,
			connectionString,
			cleanup,
			isConnected,
			createSchema,
			dropSchema,
			executeQuery,
		};
	}

	/**
	 * Create MySQL test instance
	 */
	private async createMySQLInstance(config: DatabaseConfig): Promise<TestDatabase> {
		const connectionString = `mysql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
		
		let connection: any = null;

		const cleanup = async (): Promise<void> => {
			if (connection) {
				try {
					await connection.execute(`DROP DATABASE IF EXISTS \`${config.database}\``);
					await connection.end();
				} catch (error) {
					console.warn(`Failed to cleanup MySQL database: ${error}`);
				}
			}
		};

		const isConnected = async (): Promise<boolean> => {
			try {
				if (!connection) {
					// Mock connection for testing
					connection = {
						execute: async (sql: string) => [[]],
						end: async () => {},
					};
				}
				await connection.execute("SELECT 1");
				return true;
			} catch {
				return false;
			}
		};

		const createSchema = async (schema: string): Promise<void> => {
			if (connection) {
				await connection.execute(schema);
			}
		};

		const dropSchema = async (schema: string): Promise<void> => {
			if (connection) {
				await connection.execute(`DROP SCHEMA IF EXISTS ${schema}`);
			}
		};

		const executeQuery = async (query: string, params?: unknown[]): Promise<unknown> => {
			if (connection) {
				const [rows] = await connection.execute(query, params);
				return rows;
			}
			return [];
		};

		return {
			config,
			connectionString,
			cleanup,
			isConnected,
			createSchema,
			dropSchema,
			executeQuery,
		};
	}

	/**
	 * Create MongoDB test instance
	 */
	private async createMongoDBInstance(config: DatabaseConfig): Promise<TestDatabase> {
		const connectionString = config.uri!;
		
		let client: any = null;
		let db: any = null;

		const cleanup = async (): Promise<void> => {
			if (db) {
				try {
					await db.dropDatabase();
				} catch (error) {
					console.warn(`Failed to cleanup MongoDB database: ${error}`);
				}
			}
			if (client) {
				try {
					await client.close();
				} catch (error) {
					console.warn(`Failed to close MongoDB connection: ${error}`);
				}
			}
		};

		const isConnected = async (): Promise<boolean> => {
			try {
				if (!client) {
					// Mock MongoDB client for testing
					client = {
						db: () => ({
							admin: () => ({
								ping: async () => ({ ok: 1 }),
							}),
							dropDatabase: async () => {},
							collection: () => ({
								insertOne: async () => ({ insertedId: "test" }),
								find: () => ({ toArray: async () => [] }),
								deleteMany: async () => ({ deletedCount: 0 }),
							}),
						}),
						close: async () => {},
					};
					db = client.db();
				}
				await db.admin().ping();
				return true;
			} catch {
				return false;
			}
		};

		const createSchema = async (schema: string): Promise<void> => {
			// MongoDB is schemaless, but we can create collections
			if (db) {
				const collections = JSON.parse(schema);
				for (const collectionName of collections) {
					await db.createCollection(collectionName);
				}
			}
		};

		const dropSchema = async (schema: string): Promise<void> => {
			if (db) {
				const collections = JSON.parse(schema);
				for (const collectionName of collections) {
					await db.collection(collectionName).drop();
				}
			}
		};

		const executeQuery = async (query: string, params?: unknown[]): Promise<unknown> => {
			// For MongoDB, "query" would be a collection operation
			if (db) {
				const operation = JSON.parse(query);
				const collection = db.collection(operation.collection);
				return await collection[operation.method](...(params || []));
			}
			return null;
		};

		return {
			config,
			connectionString,
			cleanup,
			isConnected,
			createSchema,
			dropSchema,
			executeQuery,
		};
	}

	/**
	 * Create SQLite test instance
	 */
	private async createSQLiteInstance(config: DatabaseConfig): Promise<TestDatabase> {
		const connectionString = `sqlite:${config.filename}`;
		
		let db: any = null;

		const cleanup = async (): Promise<void> => {
			if (db) {
				try {
					await db.close();
				} catch (error) {
					console.warn(`Failed to cleanup SQLite database: ${error}`);
				}
			}
		};

		const isConnected = async (): Promise<boolean> => {
			try {
				if (!db) {
					// Mock SQLite database for testing
					db = {
						prepare: (sql: string) => ({
							run: () => ({ changes: 0 }),
							all: () => [],
							get: () => null,
						}),
						exec: () => {},
						close: () => {},
					};
				}
				return true;
			} catch {
				return false;
			}
		};

		const createSchema = async (schema: string): Promise<void> => {
			if (db) {
				db.exec(schema);
			}
		};

		const dropSchema = async (schema: string): Promise<void> => {
			if (db) {
				db.exec(`DROP SCHEMA IF EXISTS ${schema}`);
			}
		};

		const executeQuery = async (query: string, params?: unknown[]): Promise<unknown> => {
			if (db) {
				const stmt = db.prepare(query);
				if (query.toLowerCase().startsWith("select")) {
					return stmt.all(params);
				} else {
					return stmt.run(params);
				}
			}
			return null;
		};

		return {
			config,
			connectionString,
			cleanup,
			isConnected,
			createSchema,
			dropSchema,
			executeQuery,
		};
	}

	/**
	 * Wait for database to be ready
	 */
	async waitForDatabase(database: TestDatabase, timeoutMs = 30000): Promise<void> {
		const startTime = Date.now();
		
		while (Date.now() - startTime < timeoutMs) {
			if (await database.isConnected()) {
				return;
			}
			await new Promise(resolve => setTimeout(resolve, 1000));
		}
		
		throw new Error(`Database not ready within ${timeoutMs}ms`);
	}

	/**
	 * Create common test schemas for CRUD testing
	 */
	getCommonTestSchemas(type: DatabaseConfig["type"]): Record<string, string> {
		switch (type) {
			case "postgresql":
			case "mysql":
				return {
					users: `
						CREATE TABLE users (
							id SERIAL PRIMARY KEY,
							name VARCHAR(255) NOT NULL,
							email VARCHAR(255) UNIQUE NOT NULL,
							created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
							updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
						)
					`,
					posts: `
						CREATE TABLE posts (
							id SERIAL PRIMARY KEY,
							title VARCHAR(255) NOT NULL,
							content TEXT,
							author_id INTEGER REFERENCES users(id),
							created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
							updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
						)
					`,
				};
			
			case "sqlite":
				return {
					users: `
						CREATE TABLE users (
							id INTEGER PRIMARY KEY AUTOINCREMENT,
							name TEXT NOT NULL,
							email TEXT UNIQUE NOT NULL,
							created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
							updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
						)
					`,
					posts: `
						CREATE TABLE posts (
							id INTEGER PRIMARY KEY AUTOINCREMENT,
							title TEXT NOT NULL,
							content TEXT,
							author_id INTEGER REFERENCES users(id),
							created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
							updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
						)
					`,
				};
			
			case "mongodb":
				return {
					collections: JSON.stringify(["users", "posts"]),
				};
			
			default:
				return {};
		}
	}
}

/**
 * Global database test helper instance
 */
export const databaseTestHelper = new DatabaseTestHelper();

/**
 * Cleanup function for test teardown
 */
export async function cleanupTestDatabases(): Promise<void> {
	await databaseTestHelper.cleanupAllDatabases();
}