import {
	parseAsArrayOf,
	parseAsString,
	parseAsStringEnum,
	type UrlKeys,
} from "nuqs";
import { DEFAULT_STACK, getValidOptionIds } from "@/lib/data";
import type { StackState } from "@/lib/types/base";

// Default stack configuration is now imported from centralized data library

export const stackParsers = {
	projectName: parseAsString.withDefault(DEFAULT_STACK.projectName),
	webFrontend: parseAsArrayOf(parseAsString).withDefault(
		DEFAULT_STACK.webFrontend,
	),
	nativeFrontend: parseAsArrayOf(parseAsString).withDefault(
		DEFAULT_STACK.nativeFrontend,
	),
	runtime: parseAsStringEnum<StackState["runtime"]>(
		getValidOptionIds("runtime"),
	).withDefault(DEFAULT_STACK.runtime),
	backend: parseAsStringEnum<StackState["backend"]>(
		getValidOptionIds("backend"),
	).withDefault(DEFAULT_STACK.backend),
	api: parseAsStringEnum<StackState["api"]>(
		getValidOptionIds("api"),
	).withDefault(DEFAULT_STACK.api),
	database: parseAsStringEnum<StackState["database"]>(
		getValidOptionIds("database"),
	).withDefault(DEFAULT_STACK.database),
	orm: parseAsStringEnum<StackState["orm"]>(
		getValidOptionIds("orm"),
	).withDefault(DEFAULT_STACK.orm),
	dbSetup: parseAsStringEnum<StackState["dbSetup"]>(
		getValidOptionIds("dbSetup"),
	).withDefault(DEFAULT_STACK.dbSetup),
	auth: parseAsStringEnum<StackState["auth"]>(
		getValidOptionIds("auth"),
	).withDefault(DEFAULT_STACK.auth),
	packageManager: parseAsStringEnum<StackState["packageManager"]>(
		getValidOptionIds("packageManager"),
	).withDefault(DEFAULT_STACK.packageManager),
	uiSystem: parseAsStringEnum<StackState["uiSystem"]>(
		getValidOptionIds("uiSystem"),
	).withDefault(DEFAULT_STACK.uiSystem),
	compliance: parseAsArrayOf(parseAsString).withDefault(
		DEFAULT_STACK.compliance,
	),
	addons: parseAsArrayOf(parseAsString).withDefault(DEFAULT_STACK.addons),
	notifications: parseAsStringEnum<StackState["notifications"]>(
		getValidOptionIds("notifications"),
	).withDefault(DEFAULT_STACK.notifications),
	documents: parseAsStringEnum<StackState["documents"]>(
		getValidOptionIds("documents"),
	).withDefault(DEFAULT_STACK.documents),
	payments: parseAsStringEnum<StackState["payments"]>(
		getValidOptionIds("payments"),
	).withDefault(DEFAULT_STACK.payments),
	analytics: parseAsStringEnum<StackState["analytics"]>(
		getValidOptionIds("analytics"),
	).withDefault(DEFAULT_STACK.analytics),
	monitoring: parseAsStringEnum<StackState["monitoring"]>(
		getValidOptionIds("monitoring"),
	).withDefault(DEFAULT_STACK.monitoring),
	messaging: parseAsStringEnum<StackState["messaging"]>(
		getValidOptionIds("messaging"),
	).withDefault(DEFAULT_STACK.messaging),
	testing: parseAsStringEnum<StackState["testing"]>(
		getValidOptionIds("testing"),
	).withDefault(DEFAULT_STACK.testing),
	devops: parseAsStringEnum<StackState["devops"]>(
		getValidOptionIds("devops"),
	).withDefault(DEFAULT_STACK.devops),
	search: parseAsStringEnum<StackState["search"]>(
		getValidOptionIds("search"),
	).withDefault(DEFAULT_STACK.search),
	caching: parseAsStringEnum<StackState["caching"]>(
		getValidOptionIds("caching"),
	).withDefault(DEFAULT_STACK.caching),
	backgroundJobs: parseAsStringEnum<StackState["backgroundJobs"]>(
		getValidOptionIds("backgroundJobs"),
	).withDefault(DEFAULT_STACK.backgroundJobs),
	i18n: parseAsStringEnum<StackState["i18n"]>(
		getValidOptionIds("i18n"),
	).withDefault(DEFAULT_STACK.i18n),
	cms: parseAsStringEnum<StackState["cms"]>(
		getValidOptionIds("cms"),
	).withDefault(DEFAULT_STACK.cms),
	security: parseAsStringEnum<StackState["security"]>(
		getValidOptionIds("security"),
	).withDefault(DEFAULT_STACK.security),
	saasAdmin: parseAsStringEnum<StackState["saasAdmin"]>(
		getValidOptionIds("saasAdmin"),
	).withDefault(DEFAULT_STACK.saasAdmin),
	subscriptions: parseAsStringEnum<StackState["subscriptions"]>(
		getValidOptionIds("subscriptions"),
	).withDefault(DEFAULT_STACK.subscriptions),
	licensing: parseAsStringEnum<StackState["licensing"]>(
		getValidOptionIds("licensing"),
	).withDefault(DEFAULT_STACK.licensing),
	rbac: parseAsStringEnum<StackState["rbac"]>(
		getValidOptionIds("rbac"),
	).withDefault(DEFAULT_STACK.rbac),
	multiTenancy: parseAsStringEnum<StackState["multiTenancy"]>(
		getValidOptionIds("multiTenancy"),
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
		getValidOptionIds("webDeploy"),
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
