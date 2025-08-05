/**
 * Platform recommendations tool for comprehensive development guidance
 * Provides detailed recommendations, rules, and best practices for each platform
 */

import { SupportedPlatform, IndustryTheme, ComponentCategory } from "../types/index.js";

export interface PlatformRecommendation {
	readonly category: string;
	readonly title: string;
	readonly description: string;
	readonly priority: 'critical' | 'important' | 'recommended' | 'optional';
	readonly rules: string[];
	readonly examples: string[];
	readonly antiPatterns: string[];
	readonly resources: string[];
}

export interface PlatformRecommendations {
	readonly platform: SupportedPlatform;
	readonly architecture: string;
	readonly performance: PlatformRecommendation[];
	readonly accessibility: PlatformRecommendation[];
	readonly security: PlatformRecommendation[];
	readonly bestPractices: PlatformRecommendation[];
	readonly norwegian: PlatformRecommendation[];
	readonly styling: PlatformRecommendation[];
	readonly testing: PlatformRecommendation[];
	readonly deployment: PlatformRecommendation[];
}

/**
 * Get comprehensive platform recommendations
 */
export function getPlatformRecommendations(
	platform: SupportedPlatform,
	theme?: IndustryTheme,
	category?: ComponentCategory
): PlatformRecommendations {
	const baseRecommendations = getBaseRecommendations(platform);
	const themeSpecific = theme ? getThemeSpecificRecommendations(theme, platform) : [];
	const categorySpecific = category ? getCategorySpecificRecommendations(category, platform) : [];

	return {
		platform,
		architecture: getArchitectureRecommendation(platform),
		performance: [
			...baseRecommendations.performance,
			...themeSpecific.filter(r => r.category === 'performance'),
			...categorySpecific.filter(r => r.category === 'performance')
		],
		accessibility: [
			...baseRecommendations.accessibility,
			...themeSpecific.filter(r => r.category === 'accessibility'),
			...categorySpecific.filter(r => r.category === 'accessibility')
		],
		security: [
			...baseRecommendations.security,
			...themeSpecific.filter(r => r.category === 'security'),
			...categorySpecific.filter(r => r.category === 'security')
		],
		bestPractices: [
			...baseRecommendations.bestPractices,
			...themeSpecific.filter(r => r.category === 'bestPractices'),
			...categorySpecific.filter(r => r.category === 'bestPractices')
		],
		norwegian: [
			...baseRecommendations.norwegian,
			...themeSpecific.filter(r => r.category === 'norwegian'),
			...categorySpecific.filter(r => r.category === 'norwegian')
		],
		styling: [
			...baseRecommendations.styling,
			...themeSpecific.filter(r => r.category === 'styling'),
			...categorySpecific.filter(r => r.category === 'styling')
		],
		testing: [
			...baseRecommendations.testing,
			...themeSpecific.filter(r => r.category === 'testing'),
			...categorySpecific.filter(r => r.category === 'testing')
		],
		deployment: [
			...baseRecommendations.deployment,
			...themeSpecific.filter(r => r.category === 'deployment'),
			...categorySpecific.filter(r => r.category === 'deployment')
		]
	};
}

function getBaseRecommendations(platform: SupportedPlatform): PlatformRecommendations {
	switch (platform) {
		case 'react':
			return getReactRecommendations();
		case 'nextjs':
			return getNextJSRecommendations();
		case 'vue':
			return getVueRecommendations();
		case 'angular':
			return getAngularRecommendations();
		case 'svelte':
			return getSvelteRecommendations();
		case 'electron':
			return getElectronRecommendations();
		case 'react-native':
			return getReactNativeRecommendations();
		default:
			return getReactRecommendations(); // fallback
	}
}

function getReactRecommendations(): PlatformRecommendations {
	return {
		platform: 'react',
		architecture: 'v5.0 CVA Semantic Architecture with strict TypeScript',
		performance: [
			{
				category: 'performance',
				title: 'Component Optimization',
				description: 'Optimize React components for maximum performance',
				priority: 'critical',
				rules: [
					'Use React.memo for expensive components',
					'Implement useMemo for expensive calculations',
					'Use useCallback for stable function references',
					'Avoid inline objects and functions in JSX',
					'Use React.lazy for code splitting'
				],
				examples: [
					'const MemoizedComponent = React.memo(({ data }) => { /* component */ });',
					'const expensiveValue = useMemo(() => computeValue(data), [data]);',
					'const handleClick = useCallback(() => { /* handler */ }, [dependency]);'
				],
				antiPatterns: [
					'Inline arrow functions in JSX: onClick={() => handleClick()}',
					'Creating objects in render: style={{ margin: "10px" }}',
					'Not memoizing context values'
				],
				resources: [
					'https://react.dev/reference/react/memo',
					'https://react.dev/reference/react/useMemo',
					'https://react.dev/reference/react/useCallback'
				]
			},
			{
				category: 'performance',
				title: 'Bundle Optimization',
				description: 'Optimize bundle size and loading performance',
				priority: 'important',
				rules: [
					'Use tree shaking with ES modules',
					'Implement code splitting at route level',
					'Use dynamic imports for heavy libraries',
					'Optimize images with proper formats and sizes',
					'Minimize and compress assets'
				],
				examples: [
					'const Component = lazy(() => import("./Component"));',
					'import { debounce } from "lodash-es"; // tree-shakeable',
					'const chart = await import("chart.js");'
				],
				antiPatterns: [
					'import * as _ from "lodash"; // imports entire library',
					'Large images without optimization',
					'No code splitting for large applications'
				],
				resources: [
					'https://webpack.js.org/guides/tree-shaking/',
					'https://react.dev/reference/react/lazy'
				]
			}
		],
		accessibility: [
			{
				category: 'accessibility',
				title: 'WCAG AAA Compliance',
				description: 'Ensure components meet highest accessibility standards',
				priority: 'critical',
				rules: [
					'Provide semantic HTML elements',
					'Add proper ARIA labels and roles',
					'Ensure keyboard navigation support',
					'Maintain proper color contrast ratios',
					'Provide focus indicators',
					'Support screen readers'
				],
				examples: [
					'<button aria-label="Close dialog" onClick={handleClose}>×</button>',
					'<input aria-describedby="email-error" id="email" />',
					'<div role="alert" aria-live="assertive">{error}</div>'
				],
				antiPatterns: [
					'<div onClick={handleClick}>Button</div> // should be <button>',
					'Missing alt text on images',
					'Insufficient color contrast'
				],
				resources: [
					'https://www.w3.org/WAI/WCAG21/quickref/',
					'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA'
				]
			}
		],
		security: [
			{
				category: 'security',
				title: 'XSS Prevention',
				description: 'Prevent cross-site scripting vulnerabilities',
				priority: 'critical',
				rules: [
					'Sanitize user input before rendering',
					'Use dangerouslySetInnerHTML sparingly and safely',
					'Validate all external data',
					'Use Content Security Policy headers',
					'Escape user-generated content'
				],
				examples: [
					'import DOMPurify from "dompurify"; const clean = DOMPurify.sanitize(dirty);',
					'<div>{userInput}</div> // automatically escaped by React',
					'<meta httpEquiv="Content-Security-Policy" content="default-src \'self\'" />'
				],
				antiPatterns: [
					'<div dangerouslySetInnerHTML={{__html: userInput}} />',
					'Direct DOM manipulation with innerHTML',
					'Trusting external data without validation'
				],
				resources: [
					'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html',
					'https://github.com/cure53/DOMPurify'
				]
			}
		],
		bestPractices: [
			{
				category: 'bestPractices',
				title: 'Component Design',
				description: 'Follow React component best practices',
				priority: 'important',
				rules: [
					'Use functional components with hooks',
					'Keep components small and focused',
					'Use TypeScript for type safety',
					'Follow single responsibility principle',
					'Use composition over inheritance',
					'Implement proper error boundaries'
				],
				examples: [
					'interface Props { readonly title: string; readonly onClick?: () => void; }',
					'const Button: React.FC<Props> = ({ title, onClick }) => { /* component */ };',
					'class ErrorBoundary extends React.Component { /* error boundary */ }'
				],
				antiPatterns: [
					'Massive components with multiple responsibilities',
					'Using class components unnecessarily',
					'Mutating props or state directly'
				],
				resources: [
					'https://react.dev/learn/thinking-in-react',
					'https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary'
				]
			}
		],
		norwegian: [
			{
				category: 'norwegian',
				title: 'Norwegian Localization',
				description: 'Support Norwegian language and cultural requirements',
				priority: 'important',
				rules: [
					'Support both Bokmål (nb-NO) and Nynorsk (nn-NO)',
					'Use react-i18next for internationalization',
					'Format dates according to Norwegian standards',
					'Support Norwegian currency formatting',
					'Comply with GDPR requirements'
				],
				examples: [
					'import { useTranslation } from "react-i18next"; const { t } = useTranslation();',
					'<p>{t("welcome.message")}</p>',
					'new Intl.DateTimeFormat("nb-NO").format(date)'
				],
				antiPatterns: [
					'Hardcoded text in components',
					'Assuming English-only users',
					'Not supporting Norwegian date/time formats'
				],
				resources: [
					'https://react.i18next.com/',
					'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl'
				]
			}
		],
		styling: [
			{
				category: 'styling',
				title: 'CVA Semantic Architecture',
				description: 'Use v5.0 CVA semantic styling approach',
				priority: 'critical',
				rules: [
					'Use class-variance-authority for component variants',
					'Define semantic design tokens',
					'Use Tailwind CSS with semantic classes',
					'Implement consistent spacing and typography',
					'Support dark/light mode',
					'Use CSS-in-JS only when necessary'
				],
				examples: [
					'const buttonVariants = cva("base-button", { variants: { size: { sm: "text-sm", lg: "text-lg" } } });',
					'<Button variant="primary" size="lg">Click me</Button>',
					'className="space-y-4 text-primary-foreground"'
				],
				antiPatterns: [
					'Inline styles: style={{ color: "red" }}',
					'Magic numbers in CSS: margin: 13px',
					'Inconsistent color usage'
				],
				resources: [
					'https://cva.style/docs',
					'https://tailwindcss.com/docs/utility-first'
				]
			}
		],
		testing: [
			{
				category: 'testing',
				title: 'Component Testing',
				description: 'Comprehensive testing strategy for React components',
				priority: 'important',
				rules: [
					'Use React Testing Library for component tests',
					'Test user interactions, not implementation details',
					'Write accessibility tests',
					'Mock external dependencies',
					'Test error states and edge cases'
				],
				examples: [
					'render(<Button onClick={mockFn}>Click</Button>); fireEvent.click(screen.getByRole("button"));',
					'expect(screen.getByRole("button")).toBeInTheDocument();',
					'expect(screen.getByRole("button")).toHaveAccessibleName("Submit form");'
				],
				antiPatterns: [
					'Testing implementation details like state',
					'Shallow rendering instead of full rendering',
					'Not testing accessibility'
				],
				resources: [
					'https://testing-library.com/docs/react-testing-library/intro/',
					'https://kentcdodds.com/blog/common-mistakes-with-react-testing-library'
				]
			}
		],
		deployment: [
			{
				category: 'deployment',
				title: 'Production Deployment',
				description: 'Best practices for deploying React applications',
				priority: 'important',
				rules: [
					'Use production builds with optimizations',
					'Implement proper caching strategies',
					'Set up monitoring and error tracking',
					'Use CDN for static assets',
					'Implement progressive web app features'
				],
				examples: [
					'npm run build // creates optimized production build',
					'Cache-Control: public, max-age=31536000 // for static assets',
					'<link rel="manifest" href="/manifest.json" />'
				],
				antiPatterns: [
					'Deploying development builds to production',
					'No error monitoring',
					'Missing performance monitoring'
				],
				resources: [
					'https://create-react-app.dev/docs/deployment/',
					'https://web.dev/progressive-web-apps/'
				]
			}
		]
	};
}

function getNextJSRecommendations(): PlatformRecommendations {
	const reactRecs = getReactRecommendations();
	return {
		...reactRecs,
		platform: 'nextjs',
		architecture: 'Next.js App Router with Server Components and v5.0 CVA',
		performance: [
			...reactRecs.performance,
			{
				category: 'performance',
				title: 'Server-Side Rendering',
				description: 'Optimize SSR and server components',
				priority: 'critical',
				rules: [
					'Use Server Components by default',
					'Mark Client Components with "use client"',
					'Implement proper data fetching patterns',
					'Use streaming for better UX',
					'Optimize images with next/image'
				],
				examples: [
					'// Server Component (default)\nexport default async function Page() { const data = await fetch(); }',
					'"use client"\nexport default function ClientComponent() { /* interactive component */ }',
					'<Image src="/hero.jpg" alt="Hero" width={800} height={600} priority />'
				],
				antiPatterns: [
					'Using "use client" unnecessarily',
					'Not optimizing images',
					'Blocking server components with client-side code'
				],
				resources: [
					'https://nextjs.org/docs/app/building-your-application/rendering/server-components',
					'https://nextjs.org/docs/app/building-your-application/optimizing/images'
				]
			}
		],
		deployment: [
			...reactRecs.deployment,
			{
				category: 'deployment',
				title: 'Vercel Optimization',
				description: 'Optimize for Vercel deployment',
				priority: 'recommended',
				rules: [
					'Use Vercel Analytics for performance monitoring',
					'Implement proper caching with revalidation',
					'Use Vercel KV for session storage',
					'Optimize for edge runtime when possible',
					'Set up proper environment variables'
				],
				examples: [
					'export const revalidate = 3600; // revalidate every hour',
					'import { kv } from "@vercel/kv"; await kv.set("key", value);',
					'export const runtime = "edge";'
				],
				antiPatterns: [
					'Not using Next.js caching features',
					'Deploying without optimization',
					'Missing monitoring setup'
				],
				resources: [
					'https://vercel.com/docs/concepts/next.js/overview',
					'https://vercel.com/docs/storage/vercel-kv'
				]
			}
		]
	};
}

function getVueRecommendations(): PlatformRecommendations {
	return {
		platform: 'vue',
		architecture: 'Vue 3 Composition API with TypeScript and Pinia',
		performance: [
			{
				category: 'performance',
				title: 'Vue 3 Optimization',
				description: 'Optimize Vue 3 applications for performance',
				priority: 'critical',
				rules: [
					'Use Composition API over Options API',
					'Implement proper reactivity with ref/reactive',
					'Use computed properties for derived state',
					'Implement v-memo for expensive lists',
					'Use defineAsyncComponent for code splitting'
				],
				examples: [
					'const count = ref(0); const doubled = computed(() => count.value * 2);',
					'<li v-for="item in list" v-memo="[item.id]" :key="item.id">',
					'const AsyncComp = defineAsyncComponent(() => import("./Component.vue"));'
				],
				antiPatterns: [
					'Overusing reactive() for simple values',
					'Not using computed for derived state',
					'Missing key attributes in v-for'
				],
				resources: [
					'https://vuejs.org/guide/extras/composition-api-faq.html',
					'https://vuejs.org/api/built-in-directives.html#v-memo'
				]
			}
		],
		accessibility: [
			{
				category: 'accessibility',
				title: 'Vue Accessibility',
				description: 'Implement accessibility in Vue components',
				priority: 'critical',
				rules: [
					'Use semantic HTML elements',
					'Implement proper ARIA attributes',
					'Manage focus programmatically',
					'Use Vue directives for accessibility',
					'Test with screen readers'
				],
				examples: [
					'<button :aria-expanded="isOpen" @click="toggle">Menu</button>',
					'<input :aria-describedby="errorId" v-model="value" />',
					'this.$refs.input.focus(); // programmatic focus'
				],
				antiPatterns: [
					'Using div elements for interactive content',
					'Missing ARIA labels',
					'Not managing focus in SPAs'
				],
				resources: [
					'https://vuejs.org/guide/best-practices/accessibility.html',
					'https://vue-a11y.com/'
				]
			}
		],
		security: [
			{
				category: 'security',
				title: 'Vue Security',
				description: 'Secure Vue applications against common vulnerabilities',
				priority: 'critical',
				rules: [
					'Avoid v-html with user input',
					'Sanitize dynamic content',
					'Use proper CSP headers',
					'Validate all user inputs',
					'Implement proper authentication'
				],
				examples: [
					'<div v-html="DOMPurify.sanitize(htmlContent)"></div>',
					'<p>{{ userInput }}</p> <!-- automatically escaped -->',
					'app.config.globalProperties.$http.defaults.headers.common["X-CSP"] = "default-src \'self\'";'
				],
				antiPatterns: [
					'<div v-html="userInput"></div> // XSS vulnerability',
					'Direct DOM manipulation without sanitization',
					'Missing input validation'
				],
				resources: [
					'https://vuejs.org/guide/best-practices/security.html',
					'https://github.com/cure53/DOMPurify'
				]
			}
		],
		bestPractices: [
			{
				category: 'bestPractices',
				title: 'Vue Component Design',
				description: 'Best practices for Vue component architecture',
				priority: 'important',
				rules: [
					'Use script setup for better performance',
					'Define clear prop interfaces',
					'Emit events with proper typing',
					'Use provide/inject for deep prop passing',
					'Implement proper component composition'
				],
				examples: [
					'<script setup lang="ts">\ninterface Props { title: string; count?: number; }\ndefineProps<Props>();',
					'const emit = defineEmits<{ update: [value: string]; }>();',
					'provide("theme", themeConfig); const theme = inject("theme");'
				],
				antiPatterns: [
					'Using Options API for new components',
					'Prop drilling through multiple levels',
					'Not typing emits properly'
				],
				resources: [
					'https://vuejs.org/api/sfc-script-setup.html',
					'https://vuejs.org/guide/components/provide-inject.html'
				]
			}
		],
		norwegian: [
			{
				category: 'norwegian',
				title: 'Vue i18n Norwegian Support',
				description: 'Implement Norwegian localization in Vue',
				priority: 'important',
				rules: [
					'Use Vue I18n for internationalization',
					'Support Norwegian date/time formatting',
					'Implement proper pluralization rules',
					'Use Norwegian locale for form validation',
					'Support RTL languages if needed'
				],
				examples: [
					'import { createI18n } from "vue-i18n"; const i18n = createI18n({ locale: "nb-NO" });',
					'<p>{{ $t("message.hello") }}</p>',
					'{{ $d(new Date(), "short", "nb-NO") }}'
				],
				antiPatterns: [
					'Hardcoded Norwegian text in templates',
					'Not using proper Norwegian formatting',
					'Missing pluralization support'
				],
				resources: [
					'https://vue-i18n.intlify.dev/',
					'https://github.com/intlify/vue-i18n-next'
				]
			}
		],
		styling: [
			{
				category: 'styling',
				title: 'Vue CSS Architecture',
				description: 'Styling architecture for Vue applications',
				priority: 'important',
				rules: [
					'Use scoped CSS in single file components',
					'Implement CSS modules for reusable styles',
					'Use CSS variables for theming',
					'Follow BEM or similar naming convention',
					'Use PostCSS for processing'
				],
				examples: [
					'<style scoped lang="scss">\n.component { color: var(--primary-color); }\n</style>',
					'<div :class="$style.wrapper">Content</div>',
					':root { --primary-color: #3498db; }'
				],
				antiPatterns: [
					'Global CSS without scoping',
					'Inline styles in templates',
					'Inconsistent naming conventions'
				],
				resources: [
					'https://vuejs.org/api/sfc-css-features.html',
					'https://github.com/css-modules/css-modules'
				]
			}
		],
		testing: [
			{
				category: 'testing',
				title: 'Vue Testing',
				description: 'Testing strategy for Vue applications',
				priority: 'important',
				rules: [
					'Use Vue Test Utils for component testing',
					'Test component behavior, not implementation',
					'Mock external dependencies',
					'Test slots and provide/inject',
					'Use Vitest for fast testing'
				],
				examples: [
					'import { mount } from "@vue/test-utils"; const wrapper = mount(Component);',
					'expect(wrapper.find("button").exists()).toBe(true);',
					'await wrapper.find("button").trigger("click");'
				],
				antiPatterns: [
					'Testing internal component state',
					'Not testing user interactions',
					'Missing async testing'
				],
				resources: [
					'https://test-utils.vuejs.org/',
					'https://vitest.dev/'
				]
			}
		],
		deployment: [
			{
				category: 'deployment',
				title: 'Vue Deployment',
				description: 'Deploy Vue applications effectively',
				priority: 'important',
				rules: [
					'Use Vite for fast builds',
					'Configure proper base URL for deployment',
					'Implement code splitting',
					'Set up proper asset optimization',
					'Use service workers for PWA features'
				],
				examples: [
					'vite build // optimized production build',
					'export default defineConfig({ base: "/my-app/" });',
					'const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL) });'
				],
				antiPatterns: [
					'Not configuring base URL correctly',
					'Missing PWA configuration',
					'No code splitting for large apps'
				],
				resources: [
					'https://vitejs.dev/guide/build.html',
					'https://router.vuejs.org/guide/essentials/history-mode.html'
				]
			}
		]
	};
}

// Additional platform implementations would follow similar patterns...
function getAngularRecommendations(): PlatformRecommendations {
	// Implementation for Angular recommendations
	return {
		platform: 'angular',
		architecture: 'Angular Standalone Components with Signals',
		performance: [],
		accessibility: [],
		security: [],
		bestPractices: [],
		norwegian: [],
		styling: [],
		testing: [],
		deployment: []
	};
}

function getSvelteRecommendations(): PlatformRecommendations {
	// Implementation for Svelte recommendations
	return {
		platform: 'svelte',
		architecture: 'SvelteKit with Runes and TypeScript',
		performance: [],
		accessibility: [],
		security: [],
		bestPractices: [],
		norwegian: [],
		styling: [],
		testing: [],
		deployment: []
	};
}

function getElectronRecommendations(): PlatformRecommendations {
	// Implementation for Electron recommendations
	return {
		platform: 'electron',
		architecture: 'Electron with React and Security Best Practices',
		performance: [],
		accessibility: [],
		security: [],
		bestPractices: [],
		norwegian: [],
		styling: [],
		testing: [],
		deployment: []
	};
}

function getReactNativeRecommendations(): PlatformRecommendations {
	// Implementation for React Native recommendations
	return {
		platform: 'react-native',
		architecture: 'React Native with Expo and TypeScript',
		performance: [],
		accessibility: [],
		security: [],
		bestPractices: [],
		norwegian: [],
		styling: [],
		testing: [],
		deployment: []
	};
}

function getArchitectureRecommendation(platform: SupportedPlatform): string {
	const architectures: Record<SupportedPlatform, string> = {
		react: 'v5.0 CVA Semantic Architecture with functional components, hooks, and TypeScript',
		nextjs: 'Next.js App Router with Server Components, streaming, and v5.0 CVA styling',
		vue: 'Vue 3 Composition API with script setup, Pinia state management, and TypeScript',
		angular: 'Angular Standalone Components with Signals, dependency injection, and TypeScript',
		svelte: 'SvelteKit with Runes, TypeScript, and component-scoped styling',
		electron: 'Electron with secure IPC, context isolation, and React renderer process',
		'react-native': 'React Native with Expo, TypeScript, and platform-specific optimizations'
	};
	
	return architectures[platform];
}

function getThemeSpecificRecommendations(theme: IndustryTheme, platform: SupportedPlatform): PlatformRecommendation[] {
	// Implementation for theme-specific recommendations
	return [];
}

function getCategorySpecificRecommendations(category: ComponentCategory, platform: SupportedPlatform): PlatformRecommendation[] {
	// Implementation for category-specific recommendations
	return [];
}

export const platformRecommendationsTools = [
	{
		name: "get_platform_recommendations",
		description: "Get comprehensive platform recommendations including rules, best practices, accessibility, security, and Norwegian compliance guidelines",
		inputSchema: {
			type: "object",
			properties: {
				platform: {
					type: "string",
					enum: ["react", "nextjs", "vue", "angular", "svelte", "electron", "react-native"],
					description: "Platform to get recommendations for"
				},
				theme: {
					type: "string",
					enum: ["enterprise", "finance", "healthcare", "education", "ecommerce", "productivity"],
					description: "Industry theme for specialized recommendations"
				},
				category: {
					type: "string",
					enum: ["components", "data-components", "theme-components", "layouts", "providers", "patterns", "tools"],
					description: "Component category for specialized recommendations"
				},
				focus: {
					type: "string",
					enum: ["performance", "accessibility", "security", "best-practices", "norwegian", "styling", "testing", "deployment", "all"],
					description: "Specific area to focus recommendations on"
				}
			},
			required: ["platform"]
		}
	}
];

export const platformRecommendationsToolHandlers = {
	get_platform_recommendations: async (args: any) => {
		const { platform, theme, category, focus = 'all' } = args;
		
		const recommendations = getPlatformRecommendations(platform, theme, category);
		
		let response = `# ${platform.toUpperCase()} Platform Recommendations\n\n`;
		response += `**Architecture**: ${recommendations.architecture}\n\n`;
		
		const sections = focus === 'all' ? 
			['performance', 'accessibility', 'security', 'bestPractices', 'norwegian', 'styling', 'testing', 'deployment'] :
			[focus.replace('-', '')];
		
		for (const section of sections) {
			const sectionRecs = recommendations[section as keyof PlatformRecommendations] as PlatformRecommendation[];
			if (sectionRecs && sectionRecs.length > 0) {
				response += `## ${section.toUpperCase().replace(/([A-Z])/g, ' $1').trim()}\n\n`;
				
				sectionRecs.forEach(rec => {
					response += `### ${rec.title} (${rec.priority.toUpperCase()})\n\n`;
					response += `${rec.description}\n\n`;
					
					if (rec.rules.length > 0) {
						response += `**Rules:**\n`;
						rec.rules.forEach(rule => response += `- ${rule}\n`);
						response += '\n';
					}
					
					if (rec.examples.length > 0) {
						response += `**Examples:**\n`;
						rec.examples.forEach(example => response += `\`\`\`typescript\n${example}\n\`\`\`\n`);
						response += '\n';
					}
					
					if (rec.antiPatterns.length > 0) {
						response += `**❌ Anti-patterns to avoid:**\n`;
						rec.antiPatterns.forEach(pattern => response += `- ${pattern}\n`);
						response += '\n';
					}
					
					if (rec.resources.length > 0) {
						response += `**Resources:**\n`;
						rec.resources.forEach(resource => response += `- ${resource}\n`);
						response += '\n';
					}
				});
			}
		}
		
		return response;
	}
};