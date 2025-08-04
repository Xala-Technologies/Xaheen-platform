/**
 * Native Frontend Technology Options
 * Single Responsibility: Define native mobile/desktop frontend options
 */

import { TechStackOption } from "../models";

export const NATIVE_FRONTEND_OPTIONS: readonly TechStackOption[] = [
	new TechStackOption(
		"react-native",
		"React Native",
		"Build native apps using React",
		"/icon/react-native.svg",
		"from-blue-400 to-blue-600",
	),
	new TechStackOption(
		"expo",
		"Expo",
		"Platform for universal React applications",
		"/icon/expo.svg",
		"from-black to-gray-800",
	),
	new TechStackOption(
		"flutter",
		"Flutter",
		"Google's UI toolkit for building natively compiled applications",
		"/icon/flutter.svg",
		"from-blue-400 to-blue-600",
	),
	new TechStackOption(
		"xamarin",
		"Xamarin",
		"Microsoft's mobile app development platform",
		"/icon/xamarin.svg",
		"from-blue-500 to-blue-700",
	),
	new TechStackOption(
		"ionic",
		"Ionic",
		"Build amazing apps in one codebase, for any platform",
		"/icon/ionic.svg",
		"from-blue-400 to-blue-600",
	),
	new TechStackOption(
		"none",
		"No Native Frontend",
		"Web-only application",
		"",
		"from-gray-400 to-gray-600",
		true,
	),
];
