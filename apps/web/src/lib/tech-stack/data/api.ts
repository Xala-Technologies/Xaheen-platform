/**
 * API Technology Options
 * Single Responsibility: Define API-related technology options
 */

import { TechStackOption } from "../models";

export const API_OPTIONS: readonly TechStackOption[] = [
	new TechStackOption(
		"trpc",
		"tRPC",
		"End-to-end typesafe APIs",
		"/icon/trpc.svg",
		"from-blue-500 to-blue-700",
		true,
	),
	new TechStackOption(
		"orpc",
		"oRPC",
		"Typesafe APIs Made Simple",
		"/icon/orpc.svg",
		"from-indigo-400 to-indigo-600",
	),
	new TechStackOption(
		"none",
		"No API",
		"No API layer (API routes disabled)",
		"",
		"from-gray-400 to-gray-600",
	),
] as const;
