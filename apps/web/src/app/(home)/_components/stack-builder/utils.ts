import type { StackState } from "@/lib/types/index";

/**
 * Utility functions for stack builder
 * Follows Single Responsibility Principle - only handles utility logic
 */

export const validateProjectName = (name: string): string | undefined => {
	const INVALID_CHARS = ["<", ">", ":", '"', "|", "?", "*"];
	const MAX_LENGTH = 255;

	if (name === ".") return undefined;

	if (!name) return "Project name cannot be empty";
	if (name.length > MAX_LENGTH)
		return `Project name must be ${MAX_LENGTH} characters or less`;
	if (name.startsWith(" ") || name.endsWith(" "))
		return "Project name cannot start or end with spaces";
	if (name.includes(".."))
		return "Project name cannot contain consecutive dots";
	if (INVALID_CHARS.some((char) => name.includes(char))) {
		return `Project name cannot contain: ${INVALID_CHARS.join(" ")}`;
	}

	return undefined;
};

export const hasPWACompatibleFrontend = (webFrontend: string[]): boolean => {
	return webFrontend.some((frontend) =>
		["next", "nuxt", "sveltekit", "vite"].includes(frontend),
	);
};

export const hasTauriCompatibleFrontend = (webFrontend: string[]): boolean => {
	const tauriCompatible = [
		"next",
		"react",
		"vue",
		"svelte",
		"solid",
		"vanilla",
	];
	return webFrontend.some((frontend) => tauriCompatible.includes(frontend));
};

export const getBadgeColors = (category: string): string => {
	const colorMap: Record<string, string> = {
		webFrontend:
			"bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
		nativeFrontend:
			"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
		backend:
			"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
		database:
			"bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
		orm: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
		auth: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
		uiSystem: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
		styling:
			"bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
		analytics: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
		cms: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
		webDeploy:
			"bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
		mobileDeploy:
			"bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300",
		desktopDeploy:
			"bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300",
		packageManager:
			"bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
		testing: "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300",
		linting: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300",
		formatting:
			"bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300",
		cicd: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
		monitoring: "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
		multiTenancy:
			"bg-stone-100 text-stone-800 dark:bg-stone-900 dark:text-stone-300",
		addons:
			"bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-300",
		examples: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
	};

	return (
		colorMap[category] ||
		"bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
	);
};

export const getCategoryDisplayName = (categoryKey: string): string => {
	const displayNames: Record<string, string> = {
		webFrontend: "Web Frontend",
		nativeFrontend: "Native Frontend",
		backend: "Backend",
		database: "Database",
		orm: "ORM",
		auth: "Authentication",
		uiSystem: "UI System",
		styling: "Styling",
		analytics: "Analytics",
		cms: "Content Management",
		webDeploy: "Web Deployment",
		mobileDeploy: "Mobile Deployment",
		desktopDeploy: "Desktop Deployment",
		packageManager: "Package Manager",
		testing: "Testing",
		linting: "Linting",
		formatting: "Code Formatting",
		cicd: "CI/CD",
		monitoring: "Monitoring",
		multiTenancy: "Multi-tenancy",
		addons: "Add-ons",
		examples: "Examples",
	};

	return displayNames[categoryKey] || categoryKey;
};
