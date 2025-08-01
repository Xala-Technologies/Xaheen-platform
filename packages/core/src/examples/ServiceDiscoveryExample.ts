import { BaseService } from "../architecture/base-service";
import { ServiceDiscoveryManager, ServiceResolver } from "../services/discovery";
import { logger } from "../utils/logger";

/**
 * Example Database Service
 */
class DatabaseService extends BaseService {
	private connection: any = null;

	constructor() {
		super("DatabaseService", "1.0.0");
	}

	protected async doInitialize(): Promise<void> {
		// Simulate database connection
		logger.info("Connecting to database...");
		await new Promise((resolve) => setTimeout(resolve, 1000));
		this.connection = { connected: true };
		logger.info("Database connected");
	}

	protected async doDispose(): Promise<void> {
		// Simulate database disconnection
		logger.info("Disconnecting from database...");
		await new Promise((resolve) => setTimeout(resolve, 500));
		this.connection = null;
		logger.info("Database disconnected");
	}

	async query(sql: string): Promise<any[]> {
		this.validateServiceState();
		logger.debug(`Executing query: ${sql}`);
		// Simulate query execution
		return [{ id: 1, name: "Example" }];
	}
}

/**
 * Example Cache Service
 */
class CacheService extends BaseService {
	private cache = new Map<string, any>();

	constructor() {
		super("CacheService", "1.0.0");
	}

	protected async doInitialize(): Promise<void> {
		logger.info("Initializing cache service...");
		this.cache.clear();
	}

	protected async doDispose(): Promise<void> {
		logger.info("Clearing cache...");
		this.cache.clear();
	}

	async get(key: string): Promise<any> {
		this.validateServiceState();
		return this.cache.get(key);
	}

	async set(key: string, value: any, ttl?: number): Promise<void> {
		this.validateServiceState();
		this.cache.set(key, value);

		if (ttl) {
			setTimeout(() => this.cache.delete(key), ttl);
		}
	}
}

/**
 * Example User Service that depends on Database and Cache
 */
class UserService extends BaseService {
	private dbService?: DatabaseService;
	private cacheService?: CacheService;

	constructor(
		private resolver: ServiceResolver,
	) {
		super("UserService", "1.0.0");
	}

	protected async doInitialize(): Promise<void> {
		// Resolve dependencies
		this.dbService = this.resolver.resolve<DatabaseService>("DatabaseService");
		this.cacheService = this.resolver.resolve<CacheService>("CacheService");

		logger.info("User service initialized with dependencies");
	}

	protected async doDispose(): Promise<void> {
		this.dbService = undefined;
		this.cacheService = undefined;
	}

	async getUser(id: number): Promise<any> {
		this.validateServiceState();

		// Check cache first
		const cacheKey = `user:${id}`;
		const cached = await this.cacheService!.get(cacheKey);
		if (cached) {
			logger.debug(`User ${id} found in cache`);
			return cached;
		}

		// Query database
		const users = await this.dbService!.query(
			`SELECT * FROM users WHERE id = ${id}`,
		);
		const user = users[0];

		// Cache the result
		if (user) {
			await this.cacheService!.set(cacheKey, user, 60000); // 1 minute TTL
		}

		return user;
	}
}

/**
 * Example usage of Service Discovery
 */
async function runServiceDiscoveryExample() {
	logger.info("=== Service Discovery Example ===");

	// Create service discovery instance
	const discovery = new ServiceDiscoveryManager();
	const resolver = new ServiceResolver(discovery);

	try {
		// Initialize discovery
		await discovery.initialize();

		// Register services with metadata
		await discovery.register(new DatabaseService(), {
			name: "DatabaseService",
			version: "1.0.0",
			description: "Database connection and query service",
			tags: ["database", "storage"],
			priority: 10, // Lower priority = initialized first
		});

		await discovery.register(new CacheService(), {
			name: "CacheService",
			version: "1.0.0",
			description: "In-memory caching service",
			tags: ["cache", "performance"],
			priority: 20,
		});

		await discovery.register(new UserService(resolver), {
			name: "UserService",
			version: "1.0.0",
			description: "User management service",
			tags: ["users", "api"],
			dependencies: ["DatabaseService", "CacheService"],
			priority: 30,
		});

		// Initialize all services in dependency order
		logger.info("\nInitializing all services...");
		await discovery.initializeAll();

		// Get services report
		const report = discovery.getServicesReport();
		logger.info("\nServices Report:", report);

		// Use the services
		logger.info("\nUsing services...");
		const userService = resolver.resolve<UserService>("UserService");
		const user = await userService.getUser(1);
		logger.info("Retrieved user:", user);

		// Health check
		logger.info("\nPerforming health check...");
		const healthResults = await discovery.healthCheckAll();
		logger.info("Health check results:", Object.fromEntries(healthResults));

		// Visualize dependency graph
		logger.info("\nDependency Graph:");
		console.log(discovery.getDependencyGraphVisualization());

		// Stop all services
		logger.info("\nStopping all services...");
		await discovery.stopAll();

		// Dispose discovery
		await discovery.dispose();

		logger.info("\n=== Example completed successfully ===");
	} catch (error) {
		logger.error("Example failed:", error);
		throw error;
	}
}

// Run the example if this file is executed directly
if (require.main === module) {
	runServiceDiscoveryExample().catch(console.error);
}

export { DatabaseService, CacheService, UserService, runServiceDiscoveryExample };