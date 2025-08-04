/**
 * Package Manager Technology Options
 * Single Responsibility: Define package management options
 */

import { TechStackOption } from "../models";

export const PACKAGE_MANAGER_OPTIONS: readonly TechStackOption[] = [
	new TechStackOption(
		"pnpm",
		"pnpm",
		"Fast, disk space efficient package manager",
		"/icon/pnpm.svg",
		"from-yellow-400 to-yellow-600",
		true,
	),
	new TechStackOption(
		"npm",
		"npm",
		"Node package manager",
		"/icon/npm.svg",
		"from-red-500 to-red-700",
	),
	new TechStackOption(
		"yarn",
		"Yarn",
		"Fast, reliable, and secure dependency management",
		"/icon/yarn.svg",
		"from-blue-400 to-blue-600",
	),
	new TechStackOption(
		"bun",
		"Bun",
		"Incredibly fast JavaScript package manager",
		"/icon/bun.svg",
		"from-yellow-400 to-yellow-600",
	),
];
