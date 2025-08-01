import {
	EventBus,
	EventPattern,
	EventPatternMatcher,
	EventRegistry,
	getGlobalEventBus,
	getGlobalEventRegistry,
	type IEventInterceptor,
} from "../events";
import { logger } from "../utils/logger";

/**
 * Example event interceptor for logging
 */
class LoggingInterceptor implements IEventInterceptor {
	async beforeEmit(event: string, data: any): Promise<boolean> {
		logger.debug(`[Interceptor] Before emit: ${event}`, data);
		return true; // Continue emission
	}

	async afterEmit(
		event: string,
		data: any,
		listenerCount: number,
		duration: number,
	): Promise<void> {
		logger.debug(
			`[Interceptor] After emit: ${event} (${listenerCount} listeners, ${duration.toFixed(2)}ms)`,
		);
	}

	async onError(event: string, error: Error): Promise<void> {
		logger.error(`[Interceptor] Error in event ${event}:`, error);
	}
}

/**
 * Example event validation interceptor
 */
class ValidationInterceptor implements IEventInterceptor {
	constructor(private registry: EventRegistry) {}

	async transformData(event: string, data: any): Promise<any> {
		// Validate against registry
		const validation = this.registry.validate(event, data);
		if (!validation.valid) {
			throw new Error(
				`Event validation failed: ${validation.errors?.join(", ")}`,
			);
		}
		return data;
	}
}

/**
 * Example usage of the Event System
 */
async function runEventSystemExample() {
	logger.info("=== Event System Example ===");

	// Create event bus and registry
	const eventBus = new EventBus("ExampleEventBus");
	const eventRegistry = new EventRegistry();

	// Add interceptors
	eventBus.addInterceptor(new LoggingInterceptor());
	eventBus.addInterceptor(new ValidationInterceptor(eventRegistry));

	// Register event definitions
	eventRegistry.register({
		name: "user.created",
		description: "Emitted when a new user is created",
		schema: {
			type: "object",
			required: ["id", "email", "name"],
			properties: {
				id: { type: "string" },
				email: { type: "string" },
				name: { type: "string" },
			},
		},
		tags: ["user", "lifecycle"],
	});

	eventRegistry.register({
		name: "user.updated",
		description: "Emitted when a user is updated",
		tags: ["user", "lifecycle"],
	});

	eventRegistry.register({
		name: "order.placed",
		description: "Emitted when an order is placed",
		tags: ["order", "commerce"],
	});

	// Enable history
	eventBus.setHistoryEnabled(true);
	eventBus.setMaxHistorySize(100);

	// Subscribe to specific events
	eventBus.on("user.created", async (data) => {
		logger.info("User created:", data);
	});

	eventBus.onWithPriority(
		"user.created",
		async (data) => {
			logger.info("High priority handler for user created:", data);
		},
		10, // Lower priority number = higher priority
	);

	// Subscribe to patterns
	const patternMatcher = new EventPatternMatcher();
	patternMatcher.add("user.*");
	patternMatcher.add("*.placed");

	eventBus.onAny(async ({ event, data }) => {
		if (patternMatcher.matches(event)) {
			logger.info(`Pattern matched for event ${event}:`, data);
		}
	});

	// Subscribe once
	eventBus.once("order.placed", async (data) => {
		logger.info("First order placed:", data);
	});

	// Emit events
	logger.info("\nEmitting events...");

	await eventBus.emit("user.created", {
		id: "123",
		email: "user@example.com",
		name: "John Doe",
	});

	await eventBus.emit("user.updated", {
		id: "123",
		changes: { name: "Jane Doe" },
	});

	await eventBus.emit("order.placed", {
		orderId: "ORDER-001",
		userId: "123",
		total: 99.99,
	});

	// This will only trigger the 'any' listener, not the 'once' listener
	await eventBus.emit("order.placed", {
		orderId: "ORDER-002",
		userId: "123",
		total: 149.99,
	});

	// Wait for an event
	logger.info("\nWaiting for events...");

	// Start async wait
	const waitPromise = eventBus.waitFor(
		"payment.processed",
		5000, // 5 second timeout
		(data) => data.amount > 100, // Only resolve if amount > 100
	);

	// Emit some events
	setTimeout(() => {
		eventBus.emit("payment.processed", { paymentId: "PAY-001", amount: 50 });
	}, 1000);

	setTimeout(() => {
		eventBus.emit("payment.processed", { paymentId: "PAY-002", amount: 150 });
	}, 2000);

	try {
		const payment = await waitPromise;
		logger.info("Received payment over $100:", payment);
	} catch (error) {
		logger.error("Wait for payment failed:", error);
	}

	// Test scoped event bus
	logger.info("\nTesting scoped event bus...");
	const userEventBus = eventBus.createScoped("user");

	userEventBus.on("login", (data) => {
		logger.info("Scoped user login:", data);
	});

	// This will emit both "user:login" on parent and "login" on scoped bus
	await userEventBus.emit("login", { userId: "123", timestamp: new Date() });

	// Get statistics
	logger.info("\nEvent Bus Statistics:");
	console.log(eventBus.getStatistics());

	// Get history
	logger.info("\nEvent History:");
	const history = eventBus.getHistory(5);
	for (const entry of history) {
		logger.info(
			`- ${entry.event} at ${entry.timestamp.toISOString()} (${entry.duration?.toFixed(2)}ms)`,
		);
	}

	// Test pattern matching
	logger.info("\nTesting event patterns...");
	const patterns = [
		{ pattern: "user.*", test: "user.created" },
		{ pattern: "user.*", test: "user.updated" },
		{ pattern: "user.*", test: "order.placed" },
		{ pattern: "*.created", test: "user.created" },
		{ pattern: "*.created", test: "order.created" },
		{ pattern: "**", test: "any.event.name" },
		{ pattern: "user.profile.*", test: "user.profile.updated" },
		{ pattern: "user.profile.*", test: "user.created" },
	];

	for (const { pattern, test } of patterns) {
		const eventPattern = new EventPattern(pattern);
		const matches = eventPattern.matches(test);
		logger.info(
			`Pattern "${pattern}" ${matches ? "matches" : "does not match"} "${test}"`,
		);
	}

	// Use global event bus
	logger.info("\nUsing global event bus...");
	const globalBus = getGlobalEventBus();
	const globalRegistry = getGlobalEventRegistry();

	globalRegistry.register({
		name: "app.started",
		description: "Application started",
		tags: ["lifecycle"],
	});

	globalBus.on("app.started", (data) => {
		logger.info("Global: App started", data);
	});

	await globalBus.emit("app.started", {
		version: "1.0.0",
		environment: "development",
	});

	// Disable and try to emit
	logger.info("\nTesting enable/disable...");
	eventBus.setEnabled(false);
	await eventBus.emit("user.created", { id: "456" }); // This won't emit

	eventBus.setEnabled(true);
	await eventBus.emit("user.created", {
		id: "789",
		email: "test@example.com",
		name: "Test User",
	}); // This will emit

	logger.info("\n=== Example completed successfully ===");
}

// Run the example if this file is executed directly
if (require.main === module) {
	runEventSystemExample().catch(console.error);
}

export { runEventSystemExample };