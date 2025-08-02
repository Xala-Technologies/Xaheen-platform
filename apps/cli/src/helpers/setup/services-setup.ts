import path from "node:path";
import type { AvailableDependencies } from "../../constants";
import type { ProjectConfig } from "../../types";
import { addPackageDependency } from "../../utils/add-package-deps";

/**
 * Setup service integrations (testing, payments, notifications, etc.)
 */
export async function setupServices(config: ProjectConfig) {
	const { projectDir, backend } = config;
	
	// Skip service setup for certain backends
	if (backend === "convex") {
		return;
	}

	const serverDir = path.join(projectDir, "apps/server");
	const webDir = path.join(projectDir, "apps/web");
	
	const dependencies: AvailableDependencies[] = [];
	const devDependencies: AvailableDependencies[] = [];
	const webDependencies: AvailableDependencies[] = [];
	const webDevDependencies: AvailableDependencies[] = [];

	// Testing framework setup
	if (config.testing && config.testing !== "none") {
		switch (config.testing) {
			case "vitest":
				devDependencies.push("vitest");
				break;
			case "jest":
				devDependencies.push("jest");
				break;
			case "playwright":
				devDependencies.push("@playwright/test");
				break;
			case "cypress":
				devDependencies.push("cypress");
				break;
			case "storybook":
				webDevDependencies.push("@storybook/react");
				break;
			case "chromatic":
				webDevDependencies.push("chromatic");
				break;
			case "msw":
				devDependencies.push("msw");
				break;
			case "k6":
				devDependencies.push("k6");
				break;
		}
	}

	// Notification services setup
	if (config.notifications && config.notifications !== "none") {
		switch (config.notifications) {
			case "resend":
				dependencies.push("resend");
				break;
			case "nodemailer":
				dependencies.push("nodemailer");
				break;
			case "sendgrid":
				dependencies.push("@sendgrid/mail");
				break;
			case "mailgun":
				dependencies.push("mailgun.js");
				break;
			case "ses":
				dependencies.push("@aws-sdk/client-ses");
				break;
			case "postmark":
				dependencies.push("@postmarkapp/postmark");
				break;
			case "pusher":
				dependencies.push("pusher-js");
				break;
			case "twilio":
				dependencies.push("twilio");
				break;
		}
	}

	// Payment services setup
	if (config.payments && config.payments !== "none") {
		switch (config.payments) {
			case "stripe":
				dependencies.push("stripe");
				break;
			case "paddle":
				dependencies.push("@paddle/paddle-node-sdk");
				break;
			case "lemonsqueezy":
				dependencies.push("@lemonsqueezy/lemonsqueezy.js");
				break;
			case "paypal":
				dependencies.push("@paypal/checkout-server-sdk");
				break;
			case "square":
				dependencies.push("square");
				break;
			case "adyen":
				dependencies.push("@adyen/api-library");
				break;
			case "razorpay":
				dependencies.push("razorpay");
				break;
		}
	}

	// Monitoring services setup
	if (config.monitoring && config.monitoring !== "none") {
		switch (config.monitoring) {
			case "sentry":
				dependencies.push("@sentry/node");
				webDependencies.push("@sentry/react");
				break;
			case "datadog":
				dependencies.push("dd-trace");
				break;
			case "newrelic":
				dependencies.push("newrelic");
				break;
			case "bugsnag":
				dependencies.push("@bugsnag/js");
				break;
			case "rollbar":
				webDependencies.push("@rollbar/react");
				break;
			case "honeybadger":
				dependencies.push("@honeybadger-io/js");
				break;
			case "grafana":
				webDependencies.push("@grafana/faro-web-sdk");
				break;
			case "prometheus":
				dependencies.push("prom-client");
				break;
			case "elastic":
				dependencies.push("@elastic/elasticsearch");
				break;
		}
	}

	// Analytics services setup
	if (config.analytics && config.analytics !== "none") {
		switch (config.analytics) {
			case "vercel-analytics":
				webDependencies.push("@vercel/analytics");
				break;
			case "google-analytics":
				dependencies.push("@google-analytics/data");
				break;
			case "posthog":
				webDependencies.push("posthog-js");
				break;
			case "mixpanel":
				dependencies.push("mixpanel");
				break;
			case "amplitude":
				dependencies.push("@amplitude/analytics-node");
				break;
			case "hotjar":
				webDependencies.push("hotjar");
				break;
		}
	}

	// Caching services setup
	if (config.caching && config.caching !== "none") {
		switch (config.caching) {
			case "redis":
				dependencies.push("redis", "ioredis");
				break;
			case "memcached":
				dependencies.push("memcached");
				break;
			case "cloudflare":
				devDependencies.push("@cloudflare/workers-types");
				break;
			case "aws-cloudfront":
				dependencies.push("aws-sdk");
				break;
		}
	}

	// Messaging services setup
	if (config.messaging && config.messaging !== "none") {
		switch (config.messaging) {
			case "rabbitmq":
				dependencies.push("amqplib");
				break;
			case "kafka":
				dependencies.push("kafkajs");
				break;
			case "azure-service-bus":
				dependencies.push("@azure/service-bus");
				break;
			case "aws-sqs":
				dependencies.push("@aws-sdk/client-sqs");
				break;
			case "redis-pub-sub":
				dependencies.push("bull", "bullmq");
				break;
			case "nats":
				dependencies.push("@nats-io/nats");
				break;
		}
	}

	// Search services setup
	if (config.search && config.search !== "none") {
		switch (config.search) {
			case "elasticsearch":
				dependencies.push("@elastic/elasticsearch");
				break;
			case "algolia":
				dependencies.push("algoliasearch");
				break;
			case "meilisearch":
				dependencies.push("meilisearch");
				break;
			case "typesense":
				dependencies.push("typesense");
				break;
		}
	}

	// CMS services setup
	if (config.cms && config.cms !== "none") {
		switch (config.cms) {
			case "strapi":
				dependencies.push("@strapi/strapi");
				break;
			case "contentful":
				dependencies.push("contentful");
				break;
			case "sanity":
				dependencies.push("@sanity/client");
				break;
			case "payload":
				dependencies.push("@payloadcms/richtext-lexical");
				break;
			case "ghost":
				dependencies.push("@tryghost/admin-api");
				break;
		}
	}

	// Background jobs setup
	if (config.backgroundJobs && config.backgroundJobs !== "none") {
		switch (config.backgroundJobs) {
			case "bullmq":
				dependencies.push("bullmq");
				break;
			case "agenda":
				dependencies.push("agenda");
				break;
			case "inngest":
				dependencies.push("@inngest/sdk");
				break;
			case "temporal":
				dependencies.push("@temporalio/client", "@temporalio/worker");
				break;
		}
	}

	// i18n setup
	if (config.i18n && config.i18n !== "none") {
		switch (config.i18n) {
			case "next-intl":
				webDependencies.push("next-intl");
				break;
			case "react-i18next":
				webDependencies.push("react-i18next", "i18next");
				break;
			case "formatjs":
				webDependencies.push("@formatjs/intl");
				break;
			case "crowdin":
				devDependencies.push("@crowdin/cli");
				break;
		}
	}

	// RBAC setup
	if (config.rbac && config.rbac !== "none") {
		switch (config.rbac) {
			case "role-permissions":
				dependencies.push("casl");
				break;
			case "casbin":
				dependencies.push("node-casbin");
				break;
			case "opa":
				dependencies.push("@open-policy-agent/opa-wasm");
				break;
		}
	}

	// Subscriptions setup
	if (config.subscriptions && config.subscriptions !== "none") {
		switch (config.subscriptions) {
			case "stripe-billing":
				dependencies.push("stripe");
				break;
			case "paddle":
				dependencies.push("@paddle/paddle-node-sdk");
				break;
			case "chargebee":
				dependencies.push("chargebee");
				break;
			case "custom-billing":
				// Custom implementation
				break;
		}
	}

	// Install server dependencies
	if (dependencies.length > 0 || devDependencies.length > 0) {
		await addPackageDependency({
			dependencies,
			devDependencies,
			projectDir: serverDir,
		});
	}

	// Install web dependencies
	if (webDependencies.length > 0 || webDevDependencies.length > 0) {
		await addPackageDependency({
			dependencies: webDependencies,
			devDependencies: webDevDependencies,
			projectDir: webDir,
		});
	}
}