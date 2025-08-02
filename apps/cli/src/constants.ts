import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Addons, Frontend, ProjectConfig } from "./types";
import { getUserPkgManager } from "./utils/get-package-manager";

const __filename = fileURLToPath(import.meta.url);
const distPath = path.dirname(__filename);
export const PKG_ROOT = path.join(distPath, "../");

export const DEFAULT_CONFIG: ProjectConfig = {
	projectName: "my-xaheen-app",
	projectDir: path.resolve(process.cwd(), "my-xaheen-app"),
	relativePath: "my-xaheen-app",
	frontend: ["tanstack-router"],
	database: "sqlite",
	orm: "drizzle",
	auth: true,
	addons: ["turborepo"],
	examples: [],
	git: true,
	packageManager: getUserPkgManager(),
	install: true,
	dbSetup: "none",
	backend: "hono",
	runtime: "bun",
	api: "trpc",
	webDeploy: "none",
	ui: "default",
	compliance: "none",
	locales: [],
	primaryLocale: "en",
	authProviders: [],
	integrations: [],
	documents: [],
	mfa: false,
	encryption: false,
	audit: false,
	// New service defaults - Phase 2 & 3
	testing: "none",
	notifications: "none",
	payments: "none",
	monitoring: "none",
	analytics: "none",
	caching: "none",
	devops: "none",
	security: "none",
	i18n: "none",
	messaging: "none",
	search: "none",
	cms: "none",
	saasAdmin: "none",
	subscriptions: "none",
	backgroundJobs: "none",
	rbac: "none",
	licensing: "none",
	multiTenancy: "none"
};

export const dependencyVersionMap = {
	"xaheen-auth": "^1.3.4",
	"@xaheen-auth/expo": "^1.3.4",

	// Frontend frameworks
	"@angular/core": "^18.0.0",
	"@angular/cli": "^18.0.0",
	"@angular/common": "^18.0.0",
	"@angular/platform-browser": "^18.0.0",
	"@angular/platform-browser-dynamic": "^18.0.0",
	"@angular/router": "^18.0.0",
	"@angular/compiler": "^18.0.0",
	"@angular/forms": "^18.0.0",
	"@angular/animations": "^18.0.0",
	
	// Blazor / .NET
	"Microsoft.AspNetCore.Components.WebAssembly": "^8.0.0",
	"Microsoft.AspNetCore.Components.WebAssembly.DevServer": "^8.0.0",
	"Microsoft.EntityFrameworkCore": "^8.0.0",
	"Microsoft.EntityFrameworkCore.SqlServer": "^8.0.0",
	"Microsoft.EntityFrameworkCore.Design": "^8.0.0",
	
	// Laravel dependencies
	"laravel/framework": "^11.0",
	"laravel/sanctum": "^4.0",
	"laravel/tinker": "^2.9",
	
	// Django dependencies
	django: "^5.0.0",
	"django-rest-framework": "^3.15.0",
	"django-cors-headers": "^4.3.0",

	"drizzle-orm": "^0.44.2",
	"drizzle-kit": "^0.31.2",

	"@libsql/client": "^0.15.9",

	"@neondatabase/serverless": "^1.0.1",
	pg: "^8.14.1",
	"@types/pg": "^8.11.11",
	"@types/ws": "^8.18.1",
	ws: "^8.18.3",

	mysql2: "^3.14.0",

	"@prisma/client": "^6.13.0",
	prisma: "^6.13.0",
	"@prisma/extension-accelerate": "^2.0.2",

	mongoose: "^8.14.0",

	"vite-plugin-pwa": "^1.0.1",
	"@vite-pwa/assets-generator": "^1.0.0",

	"@tauri-apps/cli": "^2.4.0",

	"@biomejs/biome": "^2.1.2",
	oxlint: "^1.8.0",
	ultracite: "5.1.1",

	husky: "^9.1.7",
	"lint-staged": "^16.1.2",

	tsx: "^4.19.2",
	"@types/node": "^22.13.11",

	"@types/bun": "^1.2.6",

	"@elysiajs/node": "^1.2.6",

	"@elysiajs/cors": "^1.2.0",
	"@elysiajs/trpc": "^1.1.0",
	elysia: "^1.2.25",

	"@hono/node-server": "^1.14.4",
	"@hono/trpc-server": "^0.4.0",
	hono: "^4.8.2",

	cors: "^2.8.5",
	express: "^5.1.0",
	"@types/express": "^5.0.1",
	"@types/cors": "^2.8.17",

	fastify: "^5.3.3",
	"@fastify/cors": "^11.0.1",

	turbo: "^2.5.4",

	ai: "^4.3.16",
	"@ai-sdk/google": "^1.2.3",
	"@ai-sdk/vue": "^1.2.8",
	"@ai-sdk/svelte": "^2.1.9",
	"@ai-sdk/react": "^1.2.12",

	"@orpc/server": "^1.5.0",
	"@orpc/client": "^1.5.0",
	"@orpc/tanstack-query": "^1.5.0",

	"@trpc/tanstack-react-query": "^11.4.2",
	"@trpc/server": "^11.4.2",
	"@trpc/client": "^11.4.2",

	convex: "^1.25.0",
	"@convex-dev/react-query": "^0.0.0-alpha.8",
	"convex-svelte": "^0.0.11",

	"@tanstack/svelte-query": "^5.74.4",
	"@tanstack/react-query-devtools": "^5.80.5",
	"@tanstack/react-query": "^5.80.5",

	"@tanstack/solid-query": "^5.75.0",
	"@tanstack/solid-query-devtools": "^5.75.0",

	wrangler: "^4.23.0",
	"@cloudflare/vite-plugin": "^1.9.0",
	"@opennextjs/cloudflare": "^1.3.0",
	"nitro-cloudflare-dev": "^0.2.2",
	"@sveltejs/adapter-cloudflare": "^7.0.4",
	
	// Testing frameworks
	vitest: "^2.0.0",
	jest: "^29.7.0",
	"@playwright/test": "^1.45.0",
	cypress: "^13.13.0",
	"@storybook/react": "^8.2.0",
	chromatic: "^11.5.0",
	msw: "^2.3.0",
	k6: "^0.52.0",
	
	// Notification services
	resend: "^3.2.0",
	nodemailer: "^6.9.0",
	"@sendgrid/mail": "^8.1.0",
	"mailgun.js": "^10.2.0",
	"@aws-sdk/client-ses": "^3.600.0",
	"@postmarkapp/postmark": "^4.0.0",
	"pusher-js": "^8.4.0",
	twilio: "^5.1.0",
	
	// Payment services
	stripe: "^16.2.0",
	"@paddle/paddle-node-sdk": "^1.4.0",
	"@lemonsqueezy/lemonsqueezy.js": "^2.2.0",
	"@paypal/checkout-server-sdk": "^1.0.3",
	square: "^36.0.0",
	"@adyen/api-library": "^17.0.0",
	razorpay: "^2.9.0",
	
	// Monitoring services
	"@sentry/node": "^8.13.0",
	"@sentry/react": "^8.13.0",
	"dd-trace": "^5.18.0",
	"newrelic": "^11.23.0",
	"@bugsnag/js": "^7.25.0",
	"@rollbar/react": "^0.12.0",
	"@honeybadger-io/js": "^6.9.0",
	"@grafana/faro-web-sdk": "^1.8.0",
	"prom-client": "^15.1.0",
	"@elastic/elasticsearch": "^8.14.0",
	
	// Analytics services
	"@vercel/analytics": "^1.3.0",
	"@google-analytics/data": "^4.6.0",
	"posthog-js": "^1.148.0",
	mixpanel: "^0.18.0",
	"@amplitude/analytics-node": "^1.3.0",
	hotjar: "^1.0.0",
	
	// Caching services
	redis: "^4.6.0",
	ioredis: "^5.4.0",
	memcached: "^2.2.2",
	"@cloudflare/workers-types": "^4.20240725.0",
	"aws-sdk": "^2.1600.0",
	
	// DevOps tools
	"@actions/core": "^1.10.0",
	dockerode: "^4.0.0",
	"@hashicorp/terraform-cdk": "^0.20.0",
	"@kubernetes/client-node": "^0.21.0",
	jenkins: "^1.1.0",
	
	// Security tools
	snyk: "^1.1300.0",
	"sonarqube-scanner": "^4.0.0",
	"@zaproxy/action": "^0.8.0",
	"@semgrep/semgrep": "^1.75.0",
	
	// i18n
	"next-intl": "^3.17.0",
	"react-i18next": "^14.1.0",
	"i18next": "^23.12.0",
	"@formatjs/intl": "^2.10.0",
	"@crowdin/cli": "^4.0.0",
	
	// Messaging services
	amqplib: "^0.10.0",
	kafkajs: "^2.2.0",
	"@azure/service-bus": "^7.9.0",
	"@aws-sdk/client-sqs": "^3.600.0",
	"bull": "^4.16.0",
	"bullmq": "^5.12.0",
	"@nats-io/nats": "^2.27.0",
	
	// Search services
	"@elastic/elasticsearch": "^8.14.0",
	algoliasearch: "^4.24.0",
	meilisearch: "^0.41.0",
	typesense: "^1.8.0",
	
	// CMS services
	"@strapi/strapi": "^4.25.0",
	contentful: "^10.14.0",
	"@sanity/client": "^6.20.0",
	"@payloadcms/richtext-lexical": "^0.11.0",
	"@tryghost/admin-api": "^1.13.0",
	
	// Background jobs
	agenda: "^5.0.0",
	"@inngest/sdk": "^3.19.0",
	"@temporalio/client": "^1.10.0",
	"@temporalio/worker": "^1.10.0",
	
	// RBAC
	casl: "^6.7.0",
	"node-casbin": "^5.30.0",
	"@open-policy-agent/opa-wasm": "^1.14.0",
	
	// Subscriptions
	"@liveblocks/client": "^2.1.0",
	"@lemonsqueezy/lemonsqueezy.js": "^2.2.0",
	chargebee: "^2.39.0"
} as const;

export type AvailableDependencies = keyof typeof dependencyVersionMap;

export const ADDON_COMPATIBILITY: Record<Addons, readonly Frontend[]> = {
	pwa: ["tanstack-router", "react-router", "solid", "next"],
	tauri: ["tanstack-router", "react-router", "nuxt", "svelte", "solid"],
	biome: [],
	husky: [],
	turborepo: [],
	starlight: [],
	ultracite: [],
	oxlint: [],
	fumadocs: [],
	none: [],
} as const;

// TODO: need to refactor this
export const WEB_FRAMEWORKS: readonly Frontend[] = [
	"tanstack-router",
	"react-router",
	"tanstack-start",
	"next",
	"nuxt",
	"svelte",
	"solid",
	"angular",
	"blazor",
];
