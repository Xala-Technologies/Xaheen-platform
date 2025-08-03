/**
 * Frontend Template Provider
 *
 * Provides templates for frontend frameworks.
 * Single Responsibility: Frontend framework templates only.
 */

import type { ServiceTemplate } from "../../../types/index.js";
import { BaseTemplateProvider } from "./base-template-provider.js";

export class NextJSTemplateProvider extends BaseTemplateProvider {
	constructor() {
		super("frontend", "nextjs", "14.0.0");
	}

	createTemplate(): ServiceTemplate {
		const base = this.createBaseTemplate(
			"nextjs",
			"Next.js React framework with SSR, SSG, and API routes",
		);

		return {
			...base,
			injectionPoints: [
				this.createFileInjectionPoint(
					"next.config.js",
					`/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig`,
					100,
				),
				this.createFileInjectionPoint(
					"src/app/layout.tsx",
					`import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '{{projectName}}',
  description: '{{projectDescription}}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}`,
					90,
				),
				this.createFileInjectionPoint(
					"src/app/page.tsx",
					`export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to {{projectName}}</h1>
    </main>
  )
}`,
					80,
				),
				this.createJsonMergePoint(
					"package.json",
					{
						scripts: {
							dev: "next dev",
							build: "next build",
							start: "next start",
							lint: "next lint",
						},
						dependencies: {
							next: "^14.0.0",
							react: "^18.0.0",
							"react-dom": "^18.0.0",
						},
						devDependencies: {
							"@types/node": "^20.0.0",
							"@types/react": "^18.0.0",
							"@types/react-dom": "^18.0.0",
							typescript: "^5.0.0",
							tailwindcss: "^3.3.0",
							autoprefixer: "^10.0.1",
							postcss: "^8.0.0",
						},
					},
					70,
				),
			],
			envVariables: [
				this.createEnvVariable(
					"NEXT_PUBLIC_APP_URL",
					"Public app URL",
					false,
					"http://localhost:3000",
				),
			],
			dependencies: [],
			postInjectionSteps: [
				{
					type: "command" as const,
					description: "Install dependencies",
					command: "npm install",
				},
				{
					type: "command" as const,
					description: "Run development server",
					command: "npm run dev",
				},
			],
			frameworks: ["next"],
			databases: [],
			platforms: ["web"],
			tags: ["react", "ssr", "ssg", "full-stack", "vercel"],
		} as ServiceTemplate;
	}
}

export class NuxtTemplateProvider extends BaseTemplateProvider {
	constructor() {
		super("frontend", "nuxt", "3.0.0");
	}

	createTemplate(): ServiceTemplate {
		const base = this.createBaseTemplate(
			"nuxt",
			"Vue.js framework with SSR, SSG, and full-stack capabilities",
		);

		return {
			...base,
			injectionPoints: [
				this.createFileInjectionPoint(
					"nuxt.config.ts",
					`export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: '{{projectName}}',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: '{{projectDescription}}' }
      ],
    }
  }
})`,
					100,
				),
				this.createFileInjectionPoint(
					"app.vue",
					`<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>`,
					90,
				),
				this.createFileInjectionPoint(
					"pages/index.vue",
					`<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-center">Welcome to {{projectName}}</h1>
  </div>
</template>

<script setup lang="ts">
// Page setup
</script>`,
					80,
				),
				this.createJsonMergePoint(
					"package.json",
					{
						scripts: {
							build: "nuxt build",
							dev: "nuxt dev",
							generate: "nuxt generate",
							preview: "nuxt preview",
						},
						dependencies: {
							nuxt: "^3.0.0",
							vue: "^3.0.0",
							"vue-router": "^4.0.0",
						},
						devDependencies: {
							"@nuxtjs/tailwindcss": "^6.0.0",
							"@pinia/nuxt": "^0.5.0",
						},
					},
					70,
				),
			],
			envVariables: [
				this.createEnvVariable(
					"NUXT_PUBLIC_API_BASE",
					"API base URL",
					false,
					"http://localhost:3000",
				),
			],
			dependencies: [],
			postInjectionSteps: [
				{
					type: "command" as const,
					description: "Install dependencies",
					command: "npm install",
				},
				{
					type: "command" as const,
					description: "Run development server",
					command: "npm run dev",
				},
			],
			frameworks: ["nuxt"],
			databases: [],
			platforms: ["web"],
			tags: ["vue", "ssr", "ssg", "full-stack"],
		} as ServiceTemplate;
	}
}

export class RemixTemplateProvider extends BaseTemplateProvider {
	constructor() {
		super("frontend", "remix", "2.0.0");
	}

	createTemplate(): ServiceTemplate {
		const base = this.createBaseTemplate(
			"remix",
			"Full-stack React framework focused on web standards",
		);

		return {
			...base,
			injectionPoints: [
				this.createFileInjectionPoint(
					"remix.config.js",
					`/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "cjs",
  future: {
    v2_errorBoundary: true,
    v2_normalizeFormMethod: true,
    v2_meta: true,
    v2_headers: true,
    v2_routeConvention: true,
  },
};`,
					100,
				),
				this.createFileInjectionPoint(
					"app/root.tsx",
					`import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}`,
					90,
				),
				this.createFileInjectionPoint(
					"app/routes/_index.tsx",
					`import type { V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "{{projectName}}" },
    { name: "description", content: "{{projectDescription}}" },
  ];
};

export default function Index() {
  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-4xl font-bold">Welcome to {{projectName}}</h1>
    </div>
  );
}`,
					80,
				),
				this.createJsonMergePoint(
					"package.json",
					{
						scripts: {
							build: "remix build",
							dev: "remix dev",
							start: "remix-serve build",
						},
						dependencies: {
							"@remix-run/node": "^2.0.0",
							"@remix-run/react": "^2.0.0",
							"@remix-run/serve": "^2.0.0",
							react: "^18.0.0",
							"react-dom": "^18.0.0",
						},
						devDependencies: {
							"@remix-run/dev": "^2.0.0",
							"@types/react": "^18.0.0",
							"@types/react-dom": "^18.0.0",
							typescript: "^5.0.0",
						},
					},
					70,
				),
			],
			envVariables: [],
			dependencies: [],
			postInjectionSteps: [
				{
					type: "command" as const,
					description: "Install dependencies",
					command: "npm install",
				},
				{
					type: "command" as const,
					description: "Run development server",
					command: "npm run dev",
				},
			],
			frameworks: ["remix"],
			databases: [],
			platforms: ["web"],
			tags: ["react", "ssr", "full-stack", "web-standards"],
		} as ServiceTemplate;
	}
}
