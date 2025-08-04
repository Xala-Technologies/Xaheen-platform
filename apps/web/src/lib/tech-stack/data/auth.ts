/**
 * Authentication Technology Options
 * Single Responsibility: Define authentication-related technology options
 */

import { TechStackOption } from "../models";

export const AUTH_OPTIONS: readonly TechStackOption[] = [
	new TechStackOption(
		"better-auth",
		"Better Auth",
		"Modern authentication with social providers and 2FA",
		"/icon/better-auth.svg",
		"from-blue-500 to-blue-700",
		true,
	),
	new TechStackOption(
		"nextauth",
		"NextAuth.js",
		"Complete authentication solution for Next.js",
		"/icon/nextauth.svg",
		"from-gray-800 to-black",
	),
	new TechStackOption(
		"clerk",
		"Clerk",
		"Complete user management with UI components",
		"/icon/clerk.svg",
		"from-purple-500 to-purple-700",
	),
	new TechStackOption(
		"supabase-auth",
		"Supabase Auth",
		"Authentication with Supabase backend",
		"/icon/supabase.svg",
		"from-green-400 to-green-600",
	),
	new TechStackOption(
		"firebase-auth",
		"Firebase Auth",
		"Google Firebase authentication service",
		"/icon/firebase.svg",
		"from-orange-400 to-orange-600",
	),
	new TechStackOption(
		"auth0",
		"Auth0",
		"Enterprise identity platform",
		"/icon/auth0.svg",
		"from-orange-500 to-orange-700",
	),
	new TechStackOption(
		"bankid",
		"BankID",
		"Norwegian digital identity with highest security level",
		"/icon/bankid.svg",
		"from-red-500 to-red-700",
	),
	new TechStackOption(
		"vipps-login",
		"Vipps Login",
		"Norwegian mobile payment and authentication",
		"/icon/vipps.svg",
		"from-orange-500 to-orange-700",
	),
	new TechStackOption(
		"identity-server",
		"Identity Server",
		"OpenID Connect and OAuth 2.0 framework for .NET",
		"/icon/identity-server.svg",
		"from-blue-600 to-blue-800",
	),
	new TechStackOption(
		"custom-auth",
		"Custom Auth",
		"Build your own authentication system",
		"/icon/custom-auth.svg",
		"from-gray-500 to-gray-700",
	),
	new TechStackOption(
		"none",
		"No Authentication",
		"Skip authentication setup",
		"",
		"from-gray-400 to-gray-600",
	),
] as const;
