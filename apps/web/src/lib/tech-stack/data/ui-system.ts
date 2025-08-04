/**
 * UI System Technology Options
 * Single Responsibility: Define UI framework and component library options
 */

import { TechStackOption } from "../models";

export const UI_SYSTEM_OPTIONS: readonly TechStackOption[] = [
	new TechStackOption(
		"xala",
		"Xala UI System",
		"Professional Norwegian-compliant design system",
		"/icon/xala.svg",
		"from-blue-500 to-blue-700",
		true,
	),
	new TechStackOption(
		"shadcn",
		"shadcn/ui",
		"Beautifully designed components built with Radix UI and Tailwind CSS",
		"/icon/shadcn.svg",
		"from-gray-800 to-gray-900",
	),
	new TechStackOption(
		"tailwind",
		"Tailwind CSS",
		"Utility-first CSS framework",
		"/icon/tailwind.svg",
		"from-cyan-400 to-cyan-600",
	),
	new TechStackOption(
		"chakra",
		"Chakra UI",
		"Modular and accessible component library",
		"/icon/chakra.svg",
		"from-teal-400 to-teal-600",
	),
	new TechStackOption(
		"mantine",
		"Mantine",
		"React components library with native dark theme support",
		"/icon/mantine.svg",
		"from-blue-400 to-blue-600",
	),
	new TechStackOption(
		"mui",
		"Material-UI",
		"React components implementing Google's Material Design",
		"/icon/mui.svg",
		"from-blue-500 to-blue-700",
	),
	new TechStackOption(
		"antd",
		"Ant Design",
		"Enterprise-class UI design language and React components",
		"/icon/antd.svg",
		"from-blue-400 to-blue-600",
	),
	new TechStackOption(
		"none",
		"No UI System",
		"Custom styling or no framework",
		"",
		"from-gray-400 to-gray-600",
	),
];
