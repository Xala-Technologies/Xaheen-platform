/**
 * Frontend Technology Options
 * Single Responsibility: Define frontend-related technology options
 */

import { TechStackOption } from "../models";

export const WEB_FRONTEND_OPTIONS: readonly TechStackOption[] = [
	new TechStackOption(
		"tanstack-router",
		"TanStack Router",
		"Modern type-safe router for React",
		"/icon/tanstack.svg",
		"from-blue-400 to-blue-600",
		true,
	),
	new TechStackOption(
		"react-router",
		"React Router",
		"Declarative routing for React",
		"/icon/react-router.svg",
		"from-red-400 to-red-600",
	),
	new TechStackOption(
		"next",
		"Next.js",
		"React framework with SSR and routing",
		"/icon/next.svg",
		"from-gray-800 to-black",
	),
	new TechStackOption(
		"vite",
		"Vite",
		"Fast build tool with React",
		"/icon/vite.svg",
		"from-purple-400 to-purple-600",
	),
	new TechStackOption(
		"remix",
		"Remix",
		"Full-stack web framework focused on web standards",
		"/icon/remix.svg",
		"from-blue-600 to-blue-800",
	),
	new TechStackOption(
		"astro",
		"Astro",
		"Build faster websites with less client-side JavaScript",
		"/icon/astro.svg",
		"from-orange-400 to-orange-600",
	),
	new TechStackOption(
		"nuxt",
		"Nuxt.js",
		"Vue.js framework with SSR",
		"/icon/nuxt.svg",
		"from-green-400 to-green-600",
	),
	new TechStackOption(
		"sveltekit",
		"SvelteKit",
		"Svelte framework with SSR",
		"/icon/svelte.svg",
		"from-orange-500 to-red-500",
	),
	new TechStackOption(
		"solid-start",
		"SolidStart",
		"Solid.js framework with SSR",
		"/icon/solid.svg",
		"from-blue-500 to-blue-700",
	),
	new TechStackOption(
		"blazor",
		"Blazor",
		"Build interactive web UIs using C#",
		"/icon/blazor.svg",
		"from-purple-600 to-purple-800",
	),
	new TechStackOption(
		"none",
		"No Frontend",
		"API-only application",
		"",
		"from-gray-400 to-gray-600",
	),
] as const;

export const NATIVE_FRONTEND_OPTIONS: readonly TechStackOption[] = [
	new TechStackOption(
		"native-nativewind",
		"React Native + NativeWind",
		"React Native with Tailwind CSS styling",
		"/icon/react-native.svg",
		"from-blue-400 to-blue-600",
		true,
	),
	new TechStackOption(
		"native-tamagui",
		"React Native + Tamagui",
		"React Native with Tamagui UI system",
		"/icon/tamagui.svg",
		"from-green-400 to-green-600",
	),
	new TechStackOption(
		"expo",
		"Expo",
		"React Native with Expo SDK",
		"/icon/expo.svg",
		"from-purple-400 to-purple-600",
	),
	new TechStackOption(
		"flutter",
		"Flutter",
		"Google's UI toolkit for mobile",
		"/icon/flutter.svg",
		"from-blue-400 to-blue-600",
	),
	new TechStackOption(
		"ionic",
		"Ionic",
		"Cross-platform mobile apps with web technologies",
		"/icon/ionic.svg",
		"from-blue-500 to-blue-700",
	),
	new TechStackOption(
		"capacitor",
		"Capacitor",
		"Cross-platform native runtime for web apps",
		"/icon/capacitor.svg",
		"from-blue-400 to-blue-600",
	),
	new TechStackOption(
		"tauri",
		"Tauri",
		"Build smaller, faster, and more secure desktop applications",
		"/icon/tauri.svg",
		"from-yellow-400 to-yellow-600",
	),
	new TechStackOption(
		"electron",
		"Electron",
		"Build cross-platform desktop apps with JavaScript",
		"/icon/electron.svg",
		"from-teal-400 to-teal-600",
	),
	new TechStackOption(
		"none",
		"No Native",
		"Web-only application",
		"",
		"from-gray-400 to-gray-600",
	),
] as const;
