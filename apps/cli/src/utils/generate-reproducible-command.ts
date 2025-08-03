import type { ProjectConfig } from "../types";

export function generateReproducibleCommand(config: ProjectConfig): string {
	const flags: string[] = [];

	if (config.frontend && config.frontend.length > 0) {
		flags.push(`--frontend ${config.frontend.join(" ")}`);
	} else {
		flags.push("--frontend none");
	}

	flags.push(`--backend ${config.backend}`);
	flags.push(`--runtime ${config.runtime}`);
	flags.push(`--database ${config.database}`);
	flags.push(`--orm ${config.orm}`);
	flags.push(`--api ${config.api}`);
	flags.push(config.auth ? "--auth" : "--no-auth");
	
	// Enhanced configuration flags
	flags.push(`--ui ${config.ui}`);
	if (config.compliance && config.compliance !== "none") {
		flags.push(`--compliance ${config.compliance}`);
	}
	
	// Localization flags
	if (config.locales && config.locales.length > 1) {
		flags.push(`--locales ${config.locales.join(" ")}`);
	}
	if (config.primaryLocale && config.primaryLocale !== "en") {
		flags.push(`--primary-locale ${config.primaryLocale}`);
	}
	
	// Authentication and security flags
	if (config.authProviders && config.authProviders.length > 0) {
		flags.push(`--auth-providers ${config.authProviders.join(" ")}`);
	}
	if (config.mfa) {
		flags.push("--mfa");
	}
	if (config.encryption) {
		flags.push("--encryption");
	}
	if (config.audit) {
		flags.push("--audit");
	}
	
	// Integration flags
	if (config.integrations && config.integrations.length > 0) {
		flags.push(`--integrations ${config.integrations.join(" ")}`);
	}
	if (config.documents && config.documents.length > 0) {
		flags.push(`--documents ${config.documents.join(" ")}`);
	}
	
	// Service configuration flags (only include if not "none")
	if (config.testing && config.testing !== "none") {
		flags.push(`--testing ${config.testing}`);
	}
	if (config.notifications && config.notifications !== "none") {
		flags.push(`--notifications ${config.notifications}`);
	}
	if (config.payments && config.payments !== "none") {
		flags.push(`--payments ${config.payments}`);
	}
	if (config.monitoring && config.monitoring !== "none") {
		flags.push(`--monitoring ${config.monitoring}`);
	}
	if (config.analytics && config.analytics !== "none") {
		flags.push(`--analytics ${config.analytics}`);
	}
	if (config.caching && config.caching !== "none") {
		flags.push(`--caching ${config.caching}`);
	}
	if (config.devops && config.devops !== "none") {
		flags.push(`--devops ${config.devops}`);
	}
	if (config.security && config.security !== "none") {
		flags.push(`--security ${config.security}`);
	}
	if (config.i18n && config.i18n !== "none") {
		flags.push(`--i18n ${config.i18n}`);
	}
	if (config.messaging && config.messaging !== "none") {
		flags.push(`--messaging ${config.messaging}`);
	}
	if (config.search && config.search !== "none") {
		flags.push(`--search ${config.search}`);
	}
	if (config.cms && config.cms !== "none") {
		flags.push(`--cms ${config.cms}`);
	}
	if (config.saasAdmin && config.saasAdmin !== "none") {
		flags.push(`--saas-admin ${config.saasAdmin}`);
	}
	if (config.subscriptions && config.subscriptions !== "none") {
		flags.push(`--subscriptions ${config.subscriptions}`);
	}
	if (config.backgroundJobs && config.backgroundJobs !== "none") {
		flags.push(`--background-jobs ${config.backgroundJobs}`);
	}
	if (config.rbac && config.rbac !== "none") {
		flags.push(`--rbac ${config.rbac}`);
	}
	if (config.licensing && config.licensing !== "none") {
		flags.push(`--licensing ${config.licensing}`);
	}
	if (config.multiTenancy && config.multiTenancy !== "none") {
		flags.push(`--multi-tenancy ${config.multiTenancy}`);
	}

	if (config.addons && config.addons.length > 0) {
		flags.push(`--addons ${config.addons.join(" ")}`);
	} else {
		flags.push("--addons none");
	}

	if (config.examples && config.examples.length > 0) {
		flags.push(`--examples ${config.examples.join(" ")}`);
	} else {
		flags.push("--examples none");
	}

	flags.push(`--db-setup ${config.dbSetup}`);
	flags.push(`--web-deploy ${config.webDeploy}`);
	flags.push(config.git ? "--git" : "--no-git");
	flags.push(`--package-manager ${config.packageManager}`);
	flags.push(config.install ? "--install" : "--no-install");

	let baseCommand = "";
	const pkgManager = config.packageManager;

	if (pkgManager === "npm") {
		baseCommand = "npx xaheen@latest";
	} else if (pkgManager === "pnpm") {
		baseCommand = "pnpm create xaheen@latest";
	} else if (pkgManager === "bun") {
		baseCommand = "bun create xaheen@latest";
	}

	const projectPathArg = config.relativePath ? ` ${config.relativePath}` : "";

	return `${baseCommand}${projectPathArg} ${flags.join(" ")}`;
}
