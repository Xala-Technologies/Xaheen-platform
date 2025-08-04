import { TECH_OPTIONS } from "@/lib";
import type { StackState } from "@/lib/types/index";
import { getCategoryDisplayName } from "./utils";

export interface CompatibilityResult {
	adjustedStack: StackState | null;
	notes: Record<string, { notes: string[]; hasIssue: boolean }>;
	changes: Array<{ category: string; message: string }>;
}

const CATEGORY_ORDER: Array<keyof typeof TECH_OPTIONS> = [
	"webFrontend",
	"nativeFrontend",
	"backend",
	"database",
	"orm",
	"auth",
	"uiSystem",
	"styling",
	"analytics",
	"cms",
	"webDeploy",
	"mobileDeploy",
	"desktopDeploy",
	"packageManager",
	"testing",
	"linting",
	"formatting",
	"cicd",
	"monitoring",
	"multiTenancy",
	"addons",
	"examples",
];

/**
 * Analyzes stack compatibility and returns adjusted stack with notes
 * Follows Single Responsibility Principle - only handles compatibility logic
 */
export const analyzeStackCompatibility = (
	stack: StackState,
): CompatibilityResult => {
	const nextStack = { ...stack };
	let changed = false;
	const notes: CompatibilityResult["notes"] = {};
	const changes: Array<{ category: string; message: string }> = [];

	// Initialize notes for all categories
	for (const cat of CATEGORY_ORDER) {
		notes[cat] = { notes: [], hasIssue: false };
	}

	const isConvex = nextStack.backend === "convex";
	const isBackendNone = nextStack.backend === "none";

	// Handle Convex backend compatibility
	if (isConvex) {
		const convexOverrides: Partial<StackState> = {
			runtime: "none",
			database: "none",
			orm: "none",
			api: "none",
			auth: "false",
			dbSetup: "none",
			examples: ["todo"],
		};

		for (const [key, value] of Object.entries(convexOverrides)) {
			const catKey = key as keyof StackState;
			if (JSON.stringify(nextStack[catKey]) !== JSON.stringify(value)) {
				const displayName = getCategoryDisplayName(catKey);
				const valueDisplay = Array.isArray(value) ? value.join(", ") : value;
				const message = `${displayName} set to '${valueDisplay}'`;

				if (notes[catKey]) {
					notes[catKey].notes.push(
						`Convex backend selected: ${displayName} will be set to '${valueDisplay}'.`,
					);
				}
				if (notes["backend"]) {
					notes["backend"].notes.push(
						`Convex requires ${displayName} to be '${valueDisplay}'.`,
					);
				}
				if (notes[catKey]) {
					notes[catKey].hasIssue = true;
				}
				if (notes["backend"]) {
					notes["backend"].hasIssue = true;
				}
				(nextStack[catKey] as string | string[]) = value;
				changed = true;

				changes.push({
					category: "convex",
					message,
				});
			}
		}

		// Handle incompatible frontends with Convex
		const incompatibleConvexFrontends = ["nuxt", "solid"];
		const originalWebFrontendLength = nextStack.webFrontend.length;
		nextStack.webFrontend = nextStack.webFrontend.filter(
			(f) => !incompatibleConvexFrontends.includes(f),
		);
		if (nextStack.webFrontend.length !== originalWebFrontendLength) {
			changed = true;
			if (notes["webFrontend"]) {
				notes["webFrontend"].notes.push(
					"Nuxt and Solid are not compatible with Convex backend and have been removed.",
				);
				notes["webFrontend"].hasIssue = true;
			}
			if (notes["backend"]) {
				notes["backend"].notes.push(
					"Convex backend is not compatible with Nuxt or Solid.",
				);
				notes["backend"].hasIssue = true;
			}
			changes.push({
				category: "convex",
				message: "Removed incompatible web frontends (Nuxt, Solid)",
			});
		}
	} else if (isBackendNone) {
		// Handle no backend compatibility
		const noneOverrides: Partial<StackState> = {
			auth: "false",
			database: "none",
			orm: "none",
			api: "none",
			runtime: "none",
			dbSetup: "none",
			examples: [],
		};

		for (const [key, value] of Object.entries(noneOverrides)) {
			const catKey = key as keyof StackState;
			if (JSON.stringify(nextStack[catKey]) !== JSON.stringify(value)) {
				const displayName = getCategoryDisplayName(catKey);
				const valueDisplay = Array.isArray(value) ? "none" : value;
				const message = `${displayName} set to '${valueDisplay}'`;

				notes[catKey].notes.push(
					`No backend selected: ${displayName} will be set to '${valueDisplay}'.`,
				);
				notes["backend"].notes.push(
					`No backend requires ${displayName} to be '${valueDisplay}'.`,
				);
				if (notes[catKey]) {
					notes[catKey].hasIssue = true;
				}
				(nextStack[catKey] as string | string[]) = value;
				changed = true;

				changes.push({
					category: "none",
					message,
				});
			}
		}
	}

	// Additional compatibility checks can be added here
	// For example: database compatibility, deployment compatibility, etc.

	return {
		adjustedStack: changed ? nextStack : null,
		notes,
		changes,
	};
};
