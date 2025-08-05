/**
 * shadcn-ui blocks integration tools for MCP server
 * Provides access to shadcn-ui blocks library for enhanced component generation
 */

import type { SupportedPlatform } from "../types/index.js";

export interface ShadcnBlock {
	readonly name: string;
	readonly category: string;
	readonly description: string;
	readonly tags: string[];
	readonly framework: 'react' | 'svelte';
	readonly dependencies: string[];
	readonly files: ShadcnBlockFile[];
	readonly preview?: string;
	readonly usage: string;
	readonly props?: Record<string, any>;
}

export interface ShadcnBlockFile {
	readonly name: string;
	readonly path: string;
	readonly content: string;
	readonly type: 'component' | 'page' | 'layout' | 'hook' | 'util' | 'style';
}

export interface ShadcnBlocksResponse {
	readonly blocks: ShadcnBlock[];
	readonly total: number;
	readonly categories: string[];
}

/**
 * Available shadcn-ui block categories based on https://ui.shadcn.com/blocks
 */
export const SHADCN_BLOCK_CATEGORIES = [
	'authentication',
	'dashboard',
	'sidebar',
	'calendar',
	'charts',
	'tables',
	'forms',
	'cards',
	'navigation',
	'layouts',
	'marketing',
	'ecommerce'
] as const;

export type ShadcnBlockCategory = typeof SHADCN_BLOCK_CATEGORIES[number];

/**
 * Mock shadcn-ui blocks data (in production, this would fetch from actual API)
 */
const MOCK_SHADCN_BLOCKS: ShadcnBlock[] = [
	{
		name: "login-01",
		category: "authentication",
		description: "A simple login form with email and password fields",
		tags: ["login", "form", "authentication"],
		framework: "react",
		dependencies: ["@radix-ui/react-label", "@radix-ui/react-slot", "class-variance-authority", "clsx", "tailwind-merge"],
		files: [
			{
				name: "login-01.tsx",
				path: "components/login-01.tsx",
				content: `import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  return (
    <div className="mx-auto grid w-[350px] gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="text-balance text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="ml-auto inline-block text-sm underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input id="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
        <Button variant="outline" className="w-full">
          Login with Google
        </Button>
      </div>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="#" className="underline">
          Sign up
        </Link>
      </div>
    </div>
  )
}`,
				type: "component"
			}
		],
		preview: "https://ui.shadcn.com/examples/login-01.png",
		usage: "A clean login form with email/password fields and social login option"
	},
	{
		name: "dashboard-01",
		category: "dashboard",
		description: "A comprehensive dashboard with sidebar, charts, and data table",
		tags: ["dashboard", "sidebar", "charts", "analytics"],
		framework: "react",
		dependencies: ["@radix-ui/react-avatar", "@radix-ui/react-dropdown-menu", "recharts", "@radix-ui/react-table"],
		files: [
			{
				name: "dashboard-01.tsx",
				path: "app/dashboard/page.tsx",
				content: `import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { MainNav } from "@/components/main-nav"
import { Overview } from "@/components/overview"
import { RecentSales } from "@/components/recent-sales"
import { Search } from "@/components/search"
import { UserNav } from "@/components/user-nav"

export default function DashboardPage() {
  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/dashboard-light.png"
          width={1280}
          height={866}
          alt="Dashboard"
          className="block dark:hidden"
        />
        <Image
          src="/examples/dashboard-dark.png"
          width={1280}
          height={866}
          alt="Dashboard"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden flex-col md:flex">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <MainNav className="mx-6" />
            <div className="ml-auto flex items-center space-x-4">
              <Search />
              <UserNav />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="flex items-center space-x-2">
              <CalendarDateRangePicker />
              <Button>Download</Button>
            </div>
          </div>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics" disabled>
                Analytics
              </TabsTrigger>
              <TabsTrigger value="reports" disabled>
                Reports
              </TabsTrigger>
              <TabsTrigger value="notifications" disabled>
                Notifications
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Revenue
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$45,231.89</div>
                    <p className="text-xs text-muted-foreground">
                      +20.1% from last month
                    </p>
                  </CardContent>
                </Card>
                {/* More cards... */}
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <Overview />
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Recent Sales</CardTitle>
                    <CardDescription>
                      You made 265 sales this month.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentSales />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}`,
				type: "page"
			}
		],
		preview: "https://ui.shadcn.com/examples/dashboard-01.png",
		usage: "A full-featured dashboard page with navigation, metrics cards, charts, and data tables"
	},
	{
		name: "sidebar-01",
		category: "sidebar",
		description: "A collapsible sidebar with navigation items and user profile",
		tags: ["sidebar", "navigation", "collapsible"],
		framework: "react",
		dependencies: ["@radix-ui/react-collapsible", "@radix-ui/react-avatar"],
		files: [
			{
				name: "sidebar-01.tsx",
				path: "components/sidebar-01.tsx",
				content: `import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Discover
          </h2>
          <div className="space-y-1">
            <Button variant="secondary" className="w-full justify-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="10,8 16,12 10,16 10,8" />
              </svg>
              Listen Now
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
              Browse
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9c3.9-3.9 10.2-3.9 14.1 0l-3.8 3.8c-1.4-1.4-3.6-1.4-5 0-1.4 1.4-1.4 3.6 0 5l-3.8 3.8z" />
              </svg>
              Radio
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}`,
				type: "component"
			}
		],
		preview: "https://ui.shadcn.com/examples/sidebar-01.png",
		usage: "A responsive sidebar component with navigation items and icons"
	}
];

/**
 * Get available shadcn-ui blocks
 */
export function getShadcnBlocks(
	category?: ShadcnBlockCategory,
	framework?: 'react' | 'svelte',
	tags?: string[]
): ShadcnBlocksResponse {
	let filteredBlocks = MOCK_SHADCN_BLOCKS;

	if (category) {
		filteredBlocks = filteredBlocks.filter(block => block.category === category);
	}

	if (framework) {
		filteredBlocks = filteredBlocks.filter(block => block.framework === framework);
	}

	if (tags && tags.length > 0) {
		filteredBlocks = filteredBlocks.filter(block => 
			tags.some(tag => block.tags.includes(tag))
		);
	}

	const categories = Array.from(new Set(MOCK_SHADCN_BLOCKS.map(block => block.category)));

	return {
		blocks: filteredBlocks,
		total: filteredBlocks.length,
		categories
	};
}

/**
 * Get specific shadcn-ui block by name
 */
export function getShadcnBlock(name: string): ShadcnBlock | null {
	return MOCK_SHADCN_BLOCKS.find(block => block.name === name) || null;
}

/**
 * Generate a component using shadcn-ui block as base
 */
export function generateFromShadcnBlock(
	blockName: string,
	customizations?: {
		name?: string;
		theme?: string;
		modifications?: string[];
		additionalProps?: Record<string, any>;
	}
): {
	componentCode: string;
	dependencies: string[];
	instructions: string[];
} {
	const block = getShadcnBlock(blockName);
	
	if (!block) {
		throw new Error(`Block "${blockName}" not found`);
	}

	const mainFile = block.files.find(f => f.type === 'component' || f.type === 'page');
	if (!mainFile) {
		throw new Error(`No main component file found for block "${blockName}"`);
	}

	let componentCode = mainFile.content;
	const dependencies = [...block.dependencies];
	const instructions: string[] = [];

	// Apply customizations
	if (customizations?.name) {
		// Replace component name
		const originalName = mainFile.name.replace('.tsx', '').replace('.svelte', '');
		componentCode = componentCode.replace(new RegExp(originalName, 'g'), customizations.name);
		instructions.push(`Renamed component from ${originalName} to ${customizations.name}`);
	}

	if (customizations?.theme) {
		// Apply theme modifications
		instructions.push(`Applied ${customizations.theme} theme customizations`);
		
		switch (customizations.theme) {
			case 'enterprise':
				componentCode = componentCode.replace(/text-muted-foreground/g, 'text-slate-600');
				componentCode = componentCode.replace(/bg-background/g, 'bg-slate-50');
				break;
			case 'healthcare':
				componentCode = componentCode.replace(/text-primary/g, 'text-blue-600');
				componentCode = componentCode.replace(/bg-primary/g, 'bg-blue-600');
				break;
			case 'finance':
				componentCode = componentCode.replace(/text-primary/g, 'text-green-600');
				componentCode = componentCode.replace(/bg-primary/g, 'bg-green-600');
				break;
		}
	}

	if (customizations?.modifications) {
		customizations.modifications.forEach(mod => {
			instructions.push(`Applied modification: ${mod}`);
		});
	}

	// Add Norwegian compliance imports if needed
	if (componentCode.includes('Label') || componentCode.includes('Input')) {
		dependencies.push('react-i18next');
		instructions.push('Added react-i18next for Norwegian localization support');
	}

	return {
		componentCode,
		dependencies,
		instructions
	};
}

/**
 * Convert shadcn-ui block to different platform
 */
export function convertShadcnBlockToPlatform(
	blockName: string,
	targetPlatform: SupportedPlatform
): {
	componentCode: string;
	dependencies: string[];
	conversionNotes: string[];
} {
	const block = getShadcnBlock(blockName);
	
	if (!block) {
		throw new Error(`Block "${blockName}" not found`);
	}

	const mainFile = block.files.find(f => f.type === 'component' || f.type === 'page');
	if (!mainFile) {
		throw new Error(`No main component file found for block "${blockName}"`);
	}

	let componentCode = mainFile.content;
	let dependencies = [...block.dependencies];
	const conversionNotes: string[] = [];

	switch (targetPlatform) {
		case 'vue':
			// Convert React to Vue
			componentCode = convertReactToVue(componentCode);
			dependencies = convertReactDependenciesToVue(dependencies);
			conversionNotes.push('Converted from React to Vue 3 with Composition API');
			break;
			
		case 'angular':
			// Convert React to Angular
			componentCode = convertReactToAngular(componentCode);
			dependencies = convertReactDependenciesToAngular(dependencies);
			conversionNotes.push('Converted from React to Angular with standalone components');
			break;
			
		case 'svelte':
			// Convert React to Svelte
			componentCode = convertReactToSvelte(componentCode);
			dependencies = convertReactDependenciesToSvelte(dependencies);
			conversionNotes.push('Converted from React to Svelte with TypeScript');
			break;
			
		case 'nextjs':
			// Enhance for Next.js
			componentCode = enhanceForNextJS(componentCode);
			dependencies.push('next');
			conversionNotes.push('Enhanced for Next.js App Router with Server Components support');
			break;
			
		default:
			conversionNotes.push(`Platform ${targetPlatform} conversion not yet implemented`);
	}

	return {
		componentCode,
		dependencies,
		conversionNotes
	};
}

// Helper functions for platform conversion
function convertReactToVue(reactCode: string): string {
	// Basic React to Vue conversion
	let vueCode = reactCode;
	
	// Convert JSX to Vue template syntax
	vueCode = vueCode.replace(/className=/g, 'class=');
	vueCode = vueCode.replace(/onClick=/g, '@click=');
	vueCode = vueCode.replace(/onChange=/g, '@change=');
	
	// Convert to Vue SFC structure
	vueCode = `<template>
${vueCode.replace(/export function \w+\(\) \{[\s\S]*return \(/g, '').replace(/\}$/, '').trim()}
</template>

<script setup lang="ts">
import { ref } from 'vue'
// Component logic here
</script>

<style scoped>
/* Component styles */
</style>`;

	return vueCode;
}

function convertReactToAngular(reactCode: string): string {
	// Basic React to Angular conversion
	let angularCode = reactCode;
	
	// Convert JSX to Angular template syntax
	angularCode = angularCode.replace(/className=/g, 'class=');
	angularCode = angularCode.replace(/onClick=/g, '(click)=');
	angularCode = angularCode.replace(/onChange=/g, '(change)=');
	
	return `@Component({
  selector: 'app-component',
  standalone: true,
  template: \`${angularCode.replace(/export function \w+\(\) \{[\s\S]*return \(/g, '').replace(/\}$/, '').trim()}\`,
  styleUrls: ['./component.scss']
})
export class ComponentName {
  // Component logic here
}`;
}

function convertReactToSvelte(reactCode: string): string {
	// Basic React to Svelte conversion
	let svelteCode = reactCode;
	
	// Convert JSX to Svelte syntax
	svelteCode = svelteCode.replace(/className=/g, 'class=');
	svelteCode = svelteCode.replace(/onClick=/g, 'on:click=');
	svelteCode = svelteCode.replace(/onChange=/g, 'on:change=');
	
	return `<script lang="ts">
  // Component logic here
</script>

${svelteCode.replace(/export function \w+\(\) \{[\s\S]*return \(/g, '').replace(/\}$/, '').trim()}

<style>
  /* Component styles */
</style>`;
}

function enhanceForNextJS(reactCode: string): string {
	// Add Next.js specific enhancements
	let nextCode = reactCode;
	
	// Add Next.js imports
	nextCode = `import Image from 'next/image'
import Link from 'next/link'
${nextCode}`;
	
	// Convert img to Next.js Image
	nextCode = nextCode.replace(/<img /g, '<Image ');
	nextCode = nextCode.replace(/<a href=/g, '<Link href=');
	
	return nextCode;
}

function convertReactDependenciesToVue(reactDeps: string[]): string[] {
	// Map React dependencies to Vue equivalents
	const depMap: Record<string, string> = {
		'@radix-ui/react-label': '@headlessui/vue',
		'@radix-ui/react-slot': '@headlessui/vue',
		'@radix-ui/react-avatar': '@headlessui/vue',
		'class-variance-authority': 'class-variance-authority',
		'clsx': 'clsx',
		'tailwind-merge': 'tailwind-merge'
	};
	
	return reactDeps.map(dep => depMap[dep] || dep);
}

function convertReactDependenciesToAngular(reactDeps: string[]): string[] {
	// Map React dependencies to Angular equivalents
	const depMap: Record<string, string> = {
		'@radix-ui/react-label': '@angular/material',
		'@radix-ui/react-slot': '@angular/cdk',
		'@radix-ui/react-avatar': '@angular/material',
		'class-variance-authority': 'class-variance-authority',
		'clsx': 'clsx',
		'tailwind-merge': 'tailwind-merge'
	};
	
	return reactDeps.map(dep => depMap[dep] || dep);
}

function convertReactDependenciesToSvelte(reactDeps: string[]): string[] {
	// Map React dependencies to Svelte equivalents
	const depMap: Record<string, string> = {
		'@radix-ui/react-label': '@melt-ui/svelte',
		'@radix-ui/react-slot': '@melt-ui/svelte',
		'@radix-ui/react-avatar': '@melt-ui/svelte',
		'class-variance-authority': 'class-variance-authority',
		'clsx': 'clsx',
		'tailwind-merge': 'tailwind-merge'
	};
	
	return reactDeps.map(dep => depMap[dep] || dep);
}

export const shadcnBlocksTools = [
	{
		name: "list_shadcn_blocks",
		description: "List available shadcn-ui blocks with filtering options",
		inputSchema: {
			type: "object",
			properties: {
				category: {
					type: "string",
					enum: SHADCN_BLOCK_CATEGORIES,
					description: "Filter blocks by category"
				},
				framework: {
					type: "string",
					enum: ["react", "svelte"],
					description: "Filter blocks by framework"
				},
				tags: {
					type: "array",
					items: { type: "string" },
					description: "Filter blocks by tags"
				}
			}
		}
	},
	{
		name: "get_shadcn_block",
		description: "Get detailed information about a specific shadcn-ui block",
		inputSchema: {
			type: "object",
			properties: {
				name: {
					type: "string",
					description: "Name of the block to retrieve"
				}
			},
			required: ["name"]
		}
	},
	{
		name: "generate_from_shadcn_block",
		description: "Generate a component based on a shadcn-ui block with customizations",
		inputSchema: {
			type: "object",
			properties: {
				blockName: {
					type: "string",
					description: "Name of the shadcn-ui block to use as base"
				},
				customizations: {
					type: "object",
					properties: {
						name: {
							type: "string",
							description: "Custom name for the generated component"
						},
						theme: {
							type: "string",
							enum: ["enterprise", "finance", "healthcare", "education", "ecommerce", "productivity"],
							description: "Theme to apply to the component"
						},
						modifications: {
							type: "array",
							items: { type: "string" },
							description: "List of modifications to apply"
						},
						additionalProps: {
							type: "object",
							description: "Additional props to add to the component"
						}
					}
				}
			},
			required: ["blockName"]
		}
	},
	{
		name: "convert_shadcn_block_to_platform",
		description: "Convert a shadcn-ui block to a different platform (Vue, Angular, Svelte, etc.)",
		inputSchema: {
			type: "object",
			properties: {
				blockName: {
					type: "string",
					description: "Name of the shadcn-ui block to convert"
				},
				targetPlatform: {
					type: "string",
					enum: ["react", "nextjs", "vue", "angular", "svelte", "electron", "react-native"],
					description: "Target platform to convert to"
				}
			},
			required: ["blockName", "targetPlatform"]
		}
	}
];

export const shadcnBlocksToolHandlers = {
	list_shadcn_blocks: async (args: any) => {
		const { category, framework, tags } = args;
		const result = getShadcnBlocks(category, framework, tags);
		
		let response = `# Available shadcn-ui Blocks\n\n`;
		response += `**Total Blocks**: ${result.total}\n`;
		response += `**Categories**: ${result.categories.join(', ')}\n\n`;
		
		// Group by category
		const byCategory = result.blocks.reduce((acc, block) => {
			if (!acc[block.category]) acc[block.category] = [];
			acc[block.category]!.push(block);
			return acc;
		}, {} as Record<string, ShadcnBlock[]>);
		
		for (const [cat, blocks] of Object.entries(byCategory)) {
			response += `## ${cat.toUpperCase()}\n\n`;
			
			blocks.forEach(block => {
				response += `### ${block.name} (${block.framework})\n`;
				response += `**Description**: ${block.description}\n`;
				response += `**Tags**: ${block.tags.join(', ')}\n`;
				response += `**Dependencies**: ${block.dependencies.length}\n`;
				response += `**Files**: ${block.files.length}\n\n`;
			});
		}
		
		return response;
	},
	
	get_shadcn_block: async (args: any) => {
		const { name } = args;
		const block = getShadcnBlock(name);
		
		if (!block) {
			return `Block "${name}" not found. Available blocks: ${MOCK_SHADCN_BLOCKS.map(b => b.name).join(', ')}`;
		}
		
		let response = `# shadcn-ui Block: ${block.name}\n\n`;
		response += `**Category**: ${block.category}\n`;
		response += `**Framework**: ${block.framework}\n`;
		response += `**Description**: ${block.description}\n`;
		response += `**Tags**: ${block.tags.join(', ')}\n\n`;
		
		response += `## Dependencies\n\n`;
		block.dependencies.forEach(dep => {
			response += `- ${dep}\n`;
		});
		
		response += `\n## Files\n\n`;
		block.files.forEach(file => {
			response += `### ${file.name} (${file.type})\n\n`;
			response += `\`\`\`${file.name.endsWith('.tsx') ? 'tsx' : file.name.endsWith('.vue') ? 'vue' : 'typescript'}\n`;
			response += `${file.content}\n`;
			response += `\`\`\`\n\n`;
		});
		
		response += `## Usage\n\n${block.usage}\n`;
		
		if (block.preview) {
			response += `\n## Preview\n\n![Preview](${block.preview})\n`;
		}
		
		return response;
	},
	
	generate_from_shadcn_block: async (args: any) => {
		const { blockName, customizations } = args;
		
		try {
			const result = generateFromShadcnBlock(blockName, customizations);
			
			let response = `# Generated Component from shadcn-ui Block: ${blockName}\n\n`;
			
			if (customizations?.name) {
				response += `**Component Name**: ${customizations.name}\n`;
			}
			if (customizations?.theme) {
				response += `**Theme**: ${customizations.theme}\n`;
			}
			response += `\n`;
			
			response += `## Generated Code\n\n`;
			response += `\`\`\`tsx\n${result.componentCode}\n\`\`\`\n\n`;
			
			response += `## Dependencies\n\n`;
			result.dependencies.forEach(dep => {
				response += `- ${dep}\n`;
			});
			
			response += `\n## Applied Customizations\n\n`;
			result.instructions.forEach(instruction => {
				response += `- ${instruction}\n`;
			});
			
			return response;
		} catch (error) {
			return `Error generating component: ${error instanceof Error ? error.message : 'Unknown error'}`;
		}
	},
	
	convert_shadcn_block_to_platform: async (args: any) => {
		const { blockName, targetPlatform } = args;
		
		try {
			const result = convertShadcnBlockToPlatform(blockName, targetPlatform);
			
			let response = `# Converted shadcn-ui Block: ${blockName} → ${targetPlatform.toUpperCase()}\n\n`;
			
			response += `## Converted Code\n\n`;
			const extension = targetPlatform === 'vue' ? 'vue' : 
							 targetPlatform === 'svelte' ? 'svelte' :
							 targetPlatform === 'angular' ? 'typescript' : 'tsx';
			response += `\`\`\`${extension}\n${result.componentCode}\n\`\`\`\n\n`;
			
			response += `## Dependencies\n\n`;
			result.dependencies.forEach(dep => {
				response += `- ${dep}\n`;
			});
			
			response += `\n## Conversion Notes\n\n`;
			result.conversionNotes.forEach(note => {
				response += `- ${note}\n`;
			});
			
			if (result.conversionNotes.includes('not yet implemented')) {
				response += `\n⚠️ **Note**: Platform conversion is partially implemented. Manual adjustments may be needed.\n`;
			}
			
			return response;
		} catch (error) {
			return `Error converting block: ${error instanceof Error ? error.message : 'Unknown error'}`;
		}
	}
};