/**
 * Auth Template Provider
 *
 * Provides templates for authentication services.
 * Single Responsibility: Auth service templates only.
 */

import type { ServiceTemplate } from "../../../types/index.js";
import { BaseTemplateProvider } from "./base-template-provider.js";

export class BetterAuthTemplateProvider extends BaseTemplateProvider {
	constructor() {
		super("auth", "better-auth", "1.0.0");
	}

	createTemplate(): ServiceTemplate {
		const base = this.createBaseTemplate(
			"better-auth",
			"Modern authentication library with built-in providers",
		);

		return {
			...base,
			injectionPoints: [
				this.createFileInjectionPoint(
					"src/lib/auth.ts",
					`import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

export type Auth = typeof auth;`,
					100,
				),
				this.createFileInjectionPoint(
					"src/lib/auth-client.ts",
					`import { createAuthClient } from "better-auth/react";
import type { Auth } from "./auth";

export const authClient = createAuthClient<Auth>({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { useSession, useUser, signIn, signOut, signUp } = authClient;`,
					90,
				),
				this.createFileInjectionPoint(
					"src/app/api/auth/[...all]/route.ts",
					`import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);`,
					80,
				),
				this.createJsonMergePoint(
					"package.json",
					{
						dependencies: {
							"better-auth": "^0.1.0",
							"@better-auth/prisma-adapter": "^0.1.0",
						},
					},
					70,
				),
			],
			envVariables: [
				this.createEnvVariable(
					"BETTER_AUTH_SECRET",
					"Secret key for session encryption",
					true,
				),
				this.createEnvVariable(
					"GOOGLE_CLIENT_ID",
					"Google OAuth client ID",
					false,
				),
				this.createEnvVariable(
					"GOOGLE_CLIENT_SECRET",
					"Google OAuth client secret",
					false,
				),
				this.createEnvVariable(
					"GITHUB_CLIENT_ID",
					"GitHub OAuth client ID",
					false,
				),
				this.createEnvVariable(
					"GITHUB_CLIENT_SECRET",
					"GitHub OAuth client secret",
					false,
				),
			],
			dependencies: [this.createDependency("database", "postgresql", true)],
			postInjectionSteps: [
				{
					type: "command" as const,
					description: "Generate auth secret",
					command: "openssl rand -base64 32",
				},
				{
					type: "command" as const,
					description: "Set up OAuth providers (optional)",
					command: "Configure OAuth apps in Google/GitHub",
				},
			],
			frameworks: ["next", "remix"],
			databases: ["postgresql", "mysql", "sqlite"],
			platforms: ["web"],
			tags: ["authentication", "oauth", "session", "jwt"],
		} as ServiceTemplate;
	}
}

export class ClerkTemplateProvider extends BaseTemplateProvider {
	constructor() {
		super("auth", "clerk", "4.0.0");
	}

	createTemplate(): ServiceTemplate {
		const base = this.createBaseTemplate(
			"clerk",
			"Complete user management and authentication platform",
		);

		return {
			...base,
			injectionPoints: [
				this.createFileInjectionPoint(
					"src/middleware.ts",
					`import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/api/webhooks(.*)"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};`,
					100,
				),
				this.createFileInjectionPoint(
					"src/app/layout.tsx",
					`import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}`,
					90,
				),
				this.createFileInjectionPoint(
					"src/components/user-button.tsx",
					`import { UserButton } from "@clerk/nextjs";

export function UserNav() {
  return (
    <UserButton
      afterSignOutUrl="/"
      appearance={{
        elements: {
          avatarBox: "h-8 w-8",
        },
      }}
    />
  );
}`,
					80,
				),
				this.createJsonMergePoint(
					"package.json",
					{
						dependencies: {
							"@clerk/nextjs": "^4.0.0",
						},
					},
					70,
				),
			],
			envVariables: [
				this.createEnvVariable(
					"NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
					"Clerk publishable key",
					true,
				),
				this.createEnvVariable("CLERK_SECRET_KEY", "Clerk secret key", true),
				this.createEnvVariable(
					"NEXT_PUBLIC_CLERK_SIGN_IN_URL",
					"Sign in page URL",
					false,
					"/sign-in",
				),
				this.createEnvVariable(
					"NEXT_PUBLIC_CLERK_SIGN_UP_URL",
					"Sign up page URL",
					false,
					"/sign-up",
				),
				this.createEnvVariable(
					"NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL",
					"After sign in redirect URL",
					false,
					"/dashboard",
				),
				this.createEnvVariable(
					"NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL",
					"After sign up redirect URL",
					false,
					"/dashboard",
				),
			],
			dependencies: [],
			postInjectionSteps: [
				{
					type: "command" as const,
					description: "Create Clerk account",
					command: "Visit https://clerk.com to create an account",
				},
				{
					type: "command" as const,
					description: "Get API keys",
					command: "Copy keys from Clerk dashboard",
				},
				{
					type: "command" as const,
					description: "Configure OAuth providers",
					command: "Enable providers in Clerk dashboard",
				},
			],
			frameworks: ["next", "remix"],
			databases: [],
			platforms: ["web"],
			tags: ["authentication", "user-management", "oauth", "saas"],
		} as ServiceTemplate;
	}
}

export class Auth0TemplateProvider extends BaseTemplateProvider {
	constructor() {
		super("auth", "auth0", "2.0.0");
	}

	createTemplate(): ServiceTemplate {
		const base = this.createBaseTemplate(
			"auth0",
			"Enterprise-grade authentication and authorization platform",
		);

		return {
			...base,
			injectionPoints: [
				this.createFileInjectionPoint(
					"src/app/api/auth/[auth0]/route.ts",
					`import { handleAuth } from '@auth0/nextjs-auth0';

export const GET = handleAuth();`,
					100,
				),
				this.createFileInjectionPoint(
					"src/app/layout.tsx",
					`import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  )
}`,
					90,
				),
				this.createFileInjectionPoint(
					"src/components/auth-button.tsx",
					`'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';

export function AuthButton() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span>Welcome, {user.name}</span>
        <Link href="/api/auth/logout" className="btn">
          Logout
        </Link>
      </div>
    );
  }

  return (
    <Link href="/api/auth/login" className="btn">
      Login
    </Link>
  );
}`,
					80,
				),
				this.createJsonMergePoint(
					"package.json",
					{
						dependencies: {
							"@auth0/nextjs-auth0": "^3.0.0",
						},
					},
					70,
				),
			],
			envVariables: [
				this.createEnvVariable(
					"AUTH0_SECRET",
					"Auth0 secret for session encryption",
					true,
				),
				this.createEnvVariable("AUTH0_BASE_URL", "Application base URL", true),
				this.createEnvVariable(
					"AUTH0_ISSUER_BASE_URL",
					"Auth0 domain URL",
					true,
				),
				this.createEnvVariable(
					"AUTH0_CLIENT_ID",
					"Auth0 application client ID",
					true,
				),
				this.createEnvVariable(
					"AUTH0_CLIENT_SECRET",
					"Auth0 application client secret",
					true,
				),
			],
			dependencies: [],
			postInjectionSteps: [
				{
					type: "command" as const,
					description: "Create Auth0 account",
					command: "Visit https://auth0.com to create an account",
				},
				{
					type: "command" as const,
					description: "Create application",
					command: "Create a Regular Web Application in Auth0 dashboard",
				},
				{
					type: "command" as const,
					description: "Configure callback URLs",
					command:
						"Add http://localhost:3000/api/auth/callback to Allowed Callback URLs",
				},
			],
			frameworks: ["next"],
			databases: [],
			platforms: ["web"],
			tags: ["authentication", "enterprise", "oauth", "sso"],
		} as ServiceTemplate;
	}
}
