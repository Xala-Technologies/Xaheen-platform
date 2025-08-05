/**
 * Core Tool Definitions - Practical MCP Tools
 * Defines the 10 core tools with their schemas and descriptions
 */

import { z } from "zod";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

// Input schemas for practical MCP tools
const GetComponentsInputSchema = z.object({
	name: z.string().optional().describe("Specific component name to retrieve"),
	platform: z.enum(["react", "vue", "angular", "svelte", "nextjs", "electron", "react-native"]).describe("Target platform"),
	category: z.enum(["form", "navigation", "layout", "feedback", "data-display", "input", "overlay"]).optional().describe("Component category filter"),
	variant: z.string().optional().describe("Component variant filter")
});

const GetBlocksInputSchema = z.object({
	name: z.string().optional().describe("Specific block name to retrieve"),
	platform: z.enum(["react", "vue", "angular", "svelte", "nextjs", "electron", "react-native"]).describe("Target platform"),
	type: z.enum(["layout", "form", "dashboard", "landing", "auth", "profile", "settings"]).optional().describe("Block type filter"),
	theme: z.string().optional().describe("Theme preference")
});

const GetRulesInputSchema = z.object({
	type: z.enum(["accessibility", "performance", "security", "design-system", "best-practices"]).describe("Rule category"),
	platform: z.enum(["react", "vue", "angular", "svelte", "nextjs", "electron", "react-native"]).optional().describe("Platform-specific rules"),
	severity: z.enum(["error", "warning", "info"]).optional().describe("Minimum severity level"),
	context: z.string().optional().describe("Specific context or use case")
});

const GenerateComponentInputSchema = z.object({
	name: z.string().describe("Component name to generate"),
	platform: z.enum(["react", "vue", "angular", "svelte", "nextjs", "electron", "react-native"]).describe("Target platform"),
	description: z.string().describe("Description of the component functionality"),
	baseComponents: z.array(z.string()).optional().describe("Base UI components to use"),
	variant: z.string().optional().describe("Style variant"),
	features: z.array(z.string()).optional().describe("Required features")
});

const GeneratePageInputSchema = z.object({
	name: z.string().describe("Page name"),
	platform: z.enum(["react", "vue", "angular", "svelte", "nextjs", "electron", "react-native"]).describe("Target platform"),
	description: z.string().describe("Page purpose and functionality"),
	layout: z.string().optional().describe("Layout type to use"),
	components: z.array(z.string()).optional().describe("Required components"),
	routing: z.boolean().optional().describe("Include routing setup")
});

const NorwegianComplianceInputSchema = z.object({
	code: z.string().describe("Code to validate for Norwegian compliance"),
	platform: z.enum(["react", "vue", "angular", "svelte", "nextjs", "electron", "react-native"]).describe("Platform"),
	type: z.enum(["component", "page", "form", "full-app"]).describe("Code type"),
	strictMode: z.boolean().optional().describe("Enable strict compliance checking")
});

const GDPRComplianceInputSchema = z.object({
	code: z.string().describe("Code to validate for GDPR compliance"),
	platform: z.enum(["react", "vue", "angular", "svelte", "nextjs", "electron", "react-native"]).describe("Platform"),
	type: z.enum(["component", "page", "form", "data-handling", "full-app"]).describe("Code type"),
	dataTypes: z.array(z.string()).optional().describe("Types of personal data handled")
});

const TransformCodeInputSchema = z.object({
	code: z.string().describe("Code to transform"),
	fromPlatform: z.enum(["react", "vue", "angular", "svelte", "nextjs", "electron", "react-native"]).describe("Source platform"),
	toPlatform: z.enum(["react", "vue", "angular", "svelte", "nextjs", "electron", "react-native"]).describe("Target platform"),
	conventions: z.array(z.string()).optional().describe("Coding conventions to apply"),
	preserveLogic: z.boolean().optional().describe("Preserve business logic structure")
});

const AnalyseCodeInputSchema = z.object({
	code: z.string().describe("Code to analyze"),
	platform: z.enum(["react", "vue", "angular", "svelte", "nextjs", "electron", "react-native"]).describe("Platform"),
	analysisType: z.enum(["performance", "security", "accessibility", "maintainability", "compliance", "all"]).describe("Type of analysis"),
	detailLevel: z.enum(["basic", "detailed", "comprehensive"]).optional().describe("Analysis detail level")
});

const InitProjectInputSchema = z.object({
	name: z.string().optional().describe("Project name (for new projects)"),
	projectPath: z.string().optional().describe("Path to existing project (for analysis)"),
	platform: z.enum(["react", "vue", "angular", "svelte", "nextjs", "electron", "react-native"]).describe("Primary platform"),
	type: z.enum(["web-app", "mobile-app", "desktop-app", "library", "component-library"]).optional().describe("Project type"),
	features: z.array(z.string()).optional().describe("Required features (auth, i18n, etc.)"),
	templateStyle: z.enum(["minimal", "standard", "enterprise"]).optional().describe("Project template complexity"),
	analyze: z.boolean().optional().describe("Analyze existing project instead of creating new one"),
	dryRun: z.boolean().optional().describe("Perform dry run without creating files")
});

// Export input argument types
export type GetComponentsArgs = z.infer<typeof GetComponentsInputSchema>;
export type GetBlocksArgs = z.infer<typeof GetBlocksInputSchema>;
export type GetRulesArgs = z.infer<typeof GetRulesInputSchema>;
export type GenerateComponentArgs = z.infer<typeof GenerateComponentInputSchema>;
export type GeneratePageArgs = z.infer<typeof GeneratePageInputSchema>;
export type NorwegianComplianceArgs = z.infer<typeof NorwegianComplianceInputSchema>;
export type GDPRComplianceArgs = z.infer<typeof GDPRComplianceInputSchema>;
export type TransformCodeArgs = z.infer<typeof TransformCodeInputSchema>;
export type AnalyseCodeArgs = z.infer<typeof AnalyseCodeInputSchema>;
export type InitProjectArgs = z.infer<typeof InitProjectInputSchema>;

// Core tool definitions for practical MCP server
export const CORE_TOOLS = [
	{
		name: "get_components",
		description: "Retrieve UI components from the design system with variants and platform-specific implementations",
		inputSchema: GetComponentsInputSchema
	},
	{
		name: "get_blocks",
		description: "Get pre-built UI blocks, layouts, and complex components tailored with design system rules",
		inputSchema: GetBlocksInputSchema
	},
	{
		name: "get_rules",
		description: "Access design system rules, recommendations, and best practices for development",
		inputSchema: GetRulesInputSchema
	},
	{
		name: "generate_component",
		description: "Generate new components using existing UI components and design system guidelines",
		inputSchema: GenerateComponentInputSchema
	},
	{
		name: "generate_page",
		description: "Create complete pages using UI components, blocks, layouts, and design system recommendations",
		inputSchema: GeneratePageInputSchema
	},
	{
		name: "norwegian_compliance",
		description: "Validate code for Norwegian regulatory compliance (accessibility, language, data protection)",
		inputSchema: NorwegianComplianceInputSchema
	},
	{
		name: "gdpr_compliance",
		description: "Validate code for GDPR compliance including data handling, privacy, and consent management",
		inputSchema: GDPRComplianceInputSchema
	},
	{
		name: "transform_code",
		description: "Transform code between platforms while applying coding conventions and best practices",
		inputSchema: TransformCodeInputSchema
	},
	{
		name: "analyse_code",
		description: "Analyze code for performance, security, accessibility, maintainability, and compliance issues",
		inputSchema: AnalyseCodeInputSchema
	},
	{
		name: "init_project",
		description: "Initialize new projects with proper structure, dependencies, and configuration",
		inputSchema: InitProjectInputSchema
	}
] as const;
