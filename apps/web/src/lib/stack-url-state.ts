import {
	parseAsArrayOf,
	parseAsString,
	parseAsStringEnum,
	type UrlKeys,
} from "nuqs";
import techOptionsData from "@/data/tech-options.json";
import type { StackState, TechOptions } from "@/lib/types/base";

const TECH_OPTIONS = techOptionsData as TechOptions;

// Default stack configuration
const DEFAULT_STACK: StackState = {
	projectName: "",
	webFrontend: ["next-app"],
	nativeFrontend: [],
	runtime: "node",
	backend: "hono",
	database: "postgresql",
	orm: "prisma",
	dbSetup: "docker",
	auth: "better-auth",
	packageManager: "bun",
	uiSystem: "xala",
	compliance: [],
	addons: [],
	notifications: "resend",
	documents: "uploadthing",
	payments: "stripe",
	analytics: "vercel-analytics",
	monitoring: "sentry",
	messaging: "rabbitmq",
	testing: "vitest",
	devops: "github-actions",
	search: "none",
	caching: "none",
	backgroundJobs: "none",
	i18n: "next-intl",
	cms: "none",
	security: "none",
	saasAdmin: "none",
	subscriptions: "none",
	licensing: "none",
	rbac: "none",
	multiTenancy: "none",
	examples: [],
	git: "github",
	install: "create-t3-app",
	api: "trpc",
	webDeploy: "vercel"
};

const getValidIds = (category: keyof typeof TECH_OPTIONS): string[] => {
	return TECH_OPTIONS[category]?.map((opt) => opt.id) ?? [];
};

export const stackParsers = {
	projectName: parseAsString.withDefault(DEFAULT_STACK.projectName),
	webFrontend: parseAsArrayOf(parseAsString).withDefault(
		DEFAULT_STACK.webFrontend,
	),
	nativeFrontend: parseAsArrayOf(parseAsString).withDefault(
		DEFAULT_STACK.nativeFrontend,
	),
	runtime: parseAsStringEnum<StackState["runtime"]>(
		getValidIds("runtime"),
	).withDefault(DEFAULT_STACK.runtime),
	backend: parseAsStringEnum<StackState["backend"]>(
		getValidIds("backend"),
	).withDefault(DEFAULT_STACK.backend),
	api: parseAsStringEnum<StackState["api"]>(getValidIds("api")).withDefault(
		DEFAULT_STACK.api,
	),
	database: parseAsStringEnum<StackState["database"]>(
		getValidIds("database"),
	).withDefault(DEFAULT_STACK.database),
	orm: parseAsStringEnum<StackState["orm"]>(getValidIds("orm")).withDefault(
		DEFAULT_STACK.orm,
	),
	dbSetup: parseAsStringEnum<StackState["dbSetup"]>(
		getValidIds("dbSetup"),
	).withDefault(DEFAULT_STACK.dbSetup),
	auth: parseAsStringEnum<StackState["auth"]>(
		getValidIds("auth"),
	).withDefault(DEFAULT_STACK.auth),
	packageManager: parseAsStringEnum<StackState["packageManager"]>(
		getValidIds("packageManager"),
	).withDefault(DEFAULT_STACK.packageManager),
	uiSystem: parseAsStringEnum<StackState["uiSystem"]>(
		getValidIds("uiSystem"),
	).withDefault(DEFAULT_STACK.uiSystem),
	compliance: parseAsArrayOf(parseAsString).withDefault(DEFAULT_STACK.compliance),
	addons: parseAsArrayOf(parseAsString).withDefault(DEFAULT_STACK.addons),
	notifications: parseAsStringEnum<StackState["notifications"]>(
		getValidIds("notifications"),
	).withDefault(DEFAULT_STACK.notifications),
	documents: parseAsStringEnum<StackState["documents"]>(
		getValidIds("documents"),
	).withDefault(DEFAULT_STACK.documents),
	payments: parseAsStringEnum<StackState["payments"]>(
		getValidIds("payments"),
	).withDefault(DEFAULT_STACK.payments),
	analytics: parseAsStringEnum<StackState["analytics"]>(
		getValidIds("analytics"),
	).withDefault(DEFAULT_STACK.analytics),
	monitoring: parseAsStringEnum<StackState["monitoring"]>(
		getValidIds("monitoring"),
	).withDefault(DEFAULT_STACK.monitoring),
	messaging: parseAsStringEnum<StackState["messaging"]>(
		getValidIds("messaging"),
	).withDefault(DEFAULT_STACK.messaging),
	testing: parseAsStringEnum<StackState["testing"]>(
		getValidIds("testing"),
	).withDefault(DEFAULT_STACK.testing),
	devops: parseAsStringEnum<StackState["devops"]>(
		getValidIds("devops"),
	).withDefault(DEFAULT_STACK.devops),
	search: parseAsStringEnum<StackState["search"]>(
		getValidIds("search"),
	).withDefault(DEFAULT_STACK.search),
	caching: parseAsStringEnum<StackState["caching"]>(
		getValidIds("caching"),
	).withDefault(DEFAULT_STACK.caching),
	backgroundJobs: parseAsStringEnum<StackState["backgroundJobs"]>(
		getValidIds("backgroundJobs"),
	).withDefault(DEFAULT_STACK.backgroundJobs),
	i18n: parseAsStringEnum<StackState["i18n"]>(
		getValidIds("i18n"),
	).withDefault(DEFAULT_STACK.i18n),
	cms: parseAsStringEnum<StackState["cms"]>(
		getValidIds("cms"),
	).withDefault(DEFAULT_STACK.cms),
	security: parseAsStringEnum<StackState["security"]>(
		getValidIds("security"),
	).withDefault(DEFAULT_STACK.security),
	saasAdmin: parseAsStringEnum<StackState["saasAdmin"]>(
		getValidIds("saasAdmin"),
	).withDefault(DEFAULT_STACK.saasAdmin),
	subscriptions: parseAsStringEnum<StackState["subscriptions"]>(
		getValidIds("subscriptions"),
	).withDefault(DEFAULT_STACK.subscriptions),
	licensing: parseAsStringEnum<StackState["licensing"]>(
		getValidIds("licensing"),
	).withDefault(DEFAULT_STACK.licensing),
	rbac: parseAsStringEnum<StackState["rbac"]>(
		getValidIds("rbac"),
	).withDefault(DEFAULT_STACK.rbac),
	multiTenancy: parseAsStringEnum<StackState["multiTenancy"]>(
		getValidIds("multiTenancy"),
	).withDefault(DEFAULT_STACK.multiTenancy),
	examples: parseAsArrayOf(parseAsString).withDefault(DEFAULT_STACK.examples),
	git: parseAsStringEnum<StackState["git"]>(["true", "false"]).withDefault(
		DEFAULT_STACK.git,
	),
	install: parseAsStringEnum<StackState["install"]>([
		"true",
		"false",
	]).withDefault(DEFAULT_STACK.install),
	webDeploy: parseAsStringEnum<StackState["webDeploy"]>(
		getValidIds("webDeploy"),
	).withDefault(DEFAULT_STACK.webDeploy),
};

export const stackUrlKeys: UrlKeys<typeof stackParsers> = {
	projectName: "name",
	webFrontend: "fe-w",
	nativeFrontend: "fe-n",
	runtime: "rt",
	backend: "be",
	api: "api",
	database: "db",
	orm: "orm",
	dbSetup: "dbs",
	auth: "au",
	packageManager: "pm",
	uiSystem: "ui",
	compliance: "comp",
	addons: "add",
	notifications: "notif",
	documents: "docs",
	payments: "pay",
	analytics: "ana",
	monitoring: "mon",
	messaging: "msg",
	testing: "test",
	devops: "dev",
	search: "search",
	caching: "cache",
	backgroundJobs: "bg",
	i18n: "i18n",
	cms: "cms",
	security: "sec",
	saasAdmin: "admin",
	subscriptions: "sub",
	licensing: "lic",
	rbac: "rbac",
	multiTenancy: "mt",
	examples: "ex",
	git: "git",
	install: "i",
	webDeploy: "wd",
};

export const stackQueryStatesOptions = {
	history: "replace" as const,
	shallow: false,
	urlKeys: stackUrlKeys,
};
