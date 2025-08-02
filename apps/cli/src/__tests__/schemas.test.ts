import { describe, expect, it } from "vitest";
import {
	FrontendSchema,
	BackendSchema,
	DatabaseSchema,
	ORMSchema,
	TestingSchema,
	NotificationsSchema,
	PaymentsSchema,
	MonitoringSchema,
	AnalyticsSchema,
	CachingSchema,
	DevOpsSchema,
	SecuritySchema,
	I18nSchema,
	MessagingSchema,
	SearchSchema,
	CMSSchema,
	SaaSAdminSchema,
	SubscriptionsSchema,
	BackgroundJobsSchema,
	RBACSchema,
	LicensingSchema,
	MultiTenancySchema,
} from "../types";

describe("CLI Type Schemas", () => {
	describe("Frontend Schema", () => {
		it("should accept all valid frontend options", () => {
			const validOptions = [
				"tanstack-router",
				"react-router",
				"tanstack-start",
				"next",
				"nuxt",
				"native-nativewind",
				"native-unistyles",
				"svelte",
				"solid",
				"angular",
				"blazor",
				"none",
			];

			validOptions.forEach((option) => {
				expect(() => FrontendSchema.parse(option)).not.toThrow();
			});
		});

		it("should reject invalid frontend options", () => {
			expect(() => FrontendSchema.parse("invalid")).toThrow();
		});
	});

	describe("Backend Schema", () => {
		it("should accept all valid backend options", () => {
			const validOptions = [
				"hono",
				"express",
				"fastify",
				"next",
				"elysia",
				"convex",
				"dotnet",
				"laravel",
				"django",
				"none",
			];

			validOptions.forEach((option) => {
				expect(() => BackendSchema.parse(option)).not.toThrow();
			});
		});
	});

	describe("Database Schema", () => {
		it("should accept all valid database options", () => {
			const validOptions = ["none", "sqlite", "postgres", "mysql", "mongodb", "mssql"];

			validOptions.forEach((option) => {
				expect(() => DatabaseSchema.parse(option)).not.toThrow();
			});
		});
	});

	describe("ORM Schema", () => {
		it("should accept all valid ORM options", () => {
			const validOptions = ["drizzle", "prisma", "mongoose", "entity-framework", "none"];

			validOptions.forEach((option) => {
				expect(() => ORMSchema.parse(option)).not.toThrow();
			});
		});
	});

	describe("Service Schemas", () => {
		it("should accept valid testing options", () => {
			const validOptions = ["vitest", "jest", "playwright", "cypress", "storybook", "chromatic", "msw", "k6", "none"];
			validOptions.forEach((option) => {
				expect(() => TestingSchema.parse(option)).not.toThrow();
			});
		});

		it("should accept valid notification options", () => {
			const validOptions = ["resend", "nodemailer", "sendgrid", "mailgun", "ses", "postmark", "brevo", "pusher", "twilio", "none"];
			validOptions.forEach((option) => {
				expect(() => NotificationsSchema.parse(option)).not.toThrow();
			});
		});

		it("should accept valid payment options", () => {
			const validOptions = ["stripe", "paddle", "lemonsqueezy", "paypal", "square", "vipps-pay", "klarna", "adyen", "razorpay", "none"];
			validOptions.forEach((option) => {
				expect(() => PaymentsSchema.parse(option)).not.toThrow();
			});
		});

		it("should accept valid monitoring options", () => {
			const validOptions = ["sentry", "datadog", "newrelic", "bugsnag", "rollbar", "honeybadger", "logflare", "grafana", "app-insights", "prometheus", "elastic", "none"];
			validOptions.forEach((option) => {
				expect(() => MonitoringSchema.parse(option)).not.toThrow();
			});
		});

		it("should have all required service schemas", () => {
			// Just verify the schemas exist and are functions
			expect(typeof AnalyticsSchema.parse).toBe("function");
			expect(typeof CachingSchema.parse).toBe("function");
			expect(typeof DevOpsSchema.parse).toBe("function");
			expect(typeof SecuritySchema.parse).toBe("function");
			expect(typeof I18nSchema.parse).toBe("function");
			expect(typeof MessagingSchema.parse).toBe("function");
			expect(typeof SearchSchema.parse).toBe("function");
			expect(typeof CMSSchema.parse).toBe("function");
			expect(typeof SaaSAdminSchema.parse).toBe("function");
			expect(typeof SubscriptionsSchema.parse).toBe("function");
			expect(typeof BackgroundJobsSchema.parse).toBe("function");
			expect(typeof RBACSchema.parse).toBe("function");
			expect(typeof LicensingSchema.parse).toBe("function");
			expect(typeof MultiTenancySchema.parse).toBe("function");
		});
	});
});