/**
 * Comprehensive Types for Xala UI System MCP Server v6.0
 * Multi-Platform Support with v5.0 Semantic Architecture
 */

// Multi-platform support
export type SupportedPlatform =
	| "react"
	| "nextjs"
	| "vue"
	| "angular"
	| "svelte"
	| "electron"
	| "react-native";

// Comprehensive component categories from CLI templates
export type ComponentCategory =
	| "components" // UI Components (navbar, modal, sidebar, header, form, card, dashboard)
	| "data-components" // Data Components (data-table, virtual-list, command-palette, global-search)
	| "theme-components" // Theme Components (theme-switcher, theme-selector)
	| "layouts" // Layout Components (app-shell, layout)
	| "providers" // Provider Components (auth-provider, theme-provider, error-boundary)
	| "patterns" // Advanced Patterns (render-props, hoc-collection, component-factory)
	| "tools" // Enterprise Tools (performance-monitor, code-generator)
	| "page-template" // Legacy support
	| "navigation" // Legacy support
	| "form" // Legacy support
	| "data-display" // Legacy support
	| "feedback" // Legacy support
	| "interactive" // Legacy support
	| "specialized"; // Legacy support

export type LayoutType =
	| "admin"
	| "web"
	| "desktop"
	| "mobile"
	| "tablet"
	| "base";

export type PageTemplate =
	| "dashboard"
	| "landing"
	| "auth"
	| "profile"
	| "settings"
	| "analytics"
	| "user-management"
	| "content-management"
	| "e-commerce"
	| "blog";

export type IndustryTheme =
	| "enterprise"
	| "finance"
	| "healthcare"
	| "education"
	| "ecommerce"
	| "productivity";

export type MunicipalTheme = "oslo" | "bergen" | "drammen";

export type SupportedLocale =
	| "en"
	| "nb-NO" // Updated Norwegian locale
	| "fr"
	| "ar";

// Platform-specific architecture options
export interface PlatformConfig {
	readonly platform: SupportedPlatform;
	readonly architecture?: "v5-cva" | "semantic" | "hybrid";
	readonly features?: PlatformFeatures;
	readonly outputPath?: string;
	readonly templateEngine?: "handlebars" | "ejs";
}

export interface PlatformFeatures {
	// React/Next.js specific
	readonly appRouter?: boolean; // Next.js App Router
	readonly pagesRouter?: boolean; // Next.js Pages Router
	readonly serverComponents?: boolean; // React Server Components

	// Vue specific
	readonly compositionApi?: boolean; // Vue 3 Composition API
	readonly scriptSetup?: boolean; // Vue 3 script setup
	readonly pinia?: boolean; // Pinia state management

	// Angular specific
	readonly standaloneComponents?: boolean; // Angular standalone components
	readonly signals?: boolean; // Angular signals
	readonly ngTranslate?: boolean; // Angular i18n

	// Svelte specific
	readonly svelteKit?: boolean; // SvelteKit framework
	readonly stores?: boolean; // Svelte stores

	// Electron specific
	readonly mainProcess?: boolean; // Electron main process
	readonly rendererProcess?: boolean; // Electron renderer process
	readonly nativeApis?: boolean; // Native API access

	// React Native specific
	readonly expo?: boolean; // Expo framework
	readonly navigation?: boolean; // React Navigation
}

export interface ComponentConfig {
	readonly name: string;
	readonly category: ComponentCategory;
	readonly platform?: SupportedPlatform; // Multi-platform support
	readonly variant?: string;
	readonly size?: "xs" | "sm" | "md" | "lg" | "xl";
	readonly theme?: IndustryTheme | MunicipalTheme;
	readonly locale?: SupportedLocale;
	readonly features: ComponentFeatures;
	readonly styling: StylingOptions;
	readonly accessibility: AccessibilityOptions;
	readonly responsive: ResponsiveOptions;
	readonly platformConfig?: PlatformConfig; // Platform-specific configuration
}

export interface ComponentFeatures {
	readonly interactive?: boolean;
	readonly animated?: boolean;
	readonly searchable?: boolean;
	readonly sortable?: boolean;
	readonly filterable?: boolean;
	readonly paginated?: boolean;
	readonly selectable?: boolean;
	readonly draggable?: boolean;
	readonly resizable?: boolean;
	readonly collapsible?: boolean;
	readonly tooltips?: boolean;
	readonly icons?: boolean;
	readonly badges?: boolean;
	readonly loading?: boolean;
	readonly error?: boolean;
	readonly validation?: boolean;
}

export interface StylingOptions {
	readonly variant:
		| "default"
		| "outline"
		| "ghost"
		| "destructive"
		| "secondary";
	readonly colorScheme?: "light" | "dark" | "auto";
	readonly borderRadius?: "none" | "sm" | "md" | "lg" | "full";
	readonly shadow?: "none" | "sm" | "md" | "lg" | "xl";
	readonly spacing?: "compact" | "comfortable" | "spacious";
}

export interface AccessibilityOptions {
	readonly level: "AA" | "AAA";
	readonly screenReader: boolean;
	readonly keyboardNavigation: boolean;
	readonly highContrast: boolean;
	readonly reducedMotion: boolean;
	readonly focusManagement: boolean;
	readonly ariaLabels: boolean;
}

export interface ResponsiveOptions {
	readonly breakpoints: Array<
		"mobile" | "tablet" | "desktop" | "wide" | "ultra"
	>;
	readonly mobileFirst: boolean;
	readonly adaptiveLayout: boolean;
	readonly touchOptimized: boolean;
	readonly fluidTypography: boolean;
}

export interface LayoutConfig extends ComponentConfig {
	readonly layoutType: LayoutType;
	readonly sections: LayoutSection[];
	readonly navigation?: NavigationConfig;
	readonly sidebar?: SidebarConfig;
	readonly header?: HeaderConfig;
	readonly footer?: FooterConfig;
}

export interface LayoutSection {
	readonly name: string;
	readonly component: string;
	readonly props?: Record<string, any>;
	readonly children?: LayoutSection[];
}

export interface NavigationConfig {
	readonly type: "horizontal" | "vertical" | "drawer" | "tabs" | "breadcrumb";
	readonly items: NavigationItem[];
	readonly showIcons: boolean;
	readonly showBadges: boolean;
	readonly collapsible?: boolean;
}

export interface NavigationItem {
	readonly key: string;
	readonly label: string;
	readonly href: string;
	readonly icon?: string;
	readonly badge?: string | number;
	readonly children?: NavigationItem[];
	readonly active?: boolean;
	readonly disabled?: boolean;
}

export interface SidebarConfig {
	readonly width: "sm" | "md" | "lg";
	readonly collapsible: boolean;
	readonly position: "left" | "right";
	readonly overlay?: boolean;
}

export interface HeaderConfig {
	readonly height: "sm" | "md" | "lg";
	readonly sticky: boolean;
	readonly transparent?: boolean;
	readonly blur?: boolean;
}

export interface FooterConfig {
	readonly sticky: boolean;
	readonly minimal: boolean;
	readonly links?: Array<{
		readonly label: string;
		readonly href: string;
	}>;
}

export interface PageTemplateConfig extends ComponentConfig {
	readonly template: PageTemplate;
	readonly layout: LayoutConfig;
	readonly sections: PageSection[];
	readonly data?: Record<string, any>;
}

export interface PageSection {
	readonly name: string;
	readonly component: string;
	readonly title?: string;
	readonly description?: string;
	readonly props?: Record<string, any>;
	readonly data?: any[];
}

export interface FormConfig extends ComponentConfig {
	readonly fields: FormField[];
	readonly validation: ValidationConfig;
	readonly submission: SubmissionConfig;
}

export interface FormField {
	readonly name: string;
	readonly type:
		| "input"
		| "textarea"
		| "select"
		| "checkbox"
		| "radio"
		| "switch"
		| "slider"
		| "date"
		| "time";
	readonly label: string;
	readonly placeholder?: string;
	readonly required?: boolean;
	readonly disabled?: boolean;
	readonly options?: Array<{ label: string; value: string }>;
	readonly validation?: FieldValidation;
}

export interface FieldValidation {
	readonly required?: boolean;
	readonly minLength?: number;
	readonly maxLength?: number;
	readonly pattern?: string;
	readonly custom?: string;
}

export interface ValidationConfig {
	readonly realTime: boolean;
	readonly showErrors: boolean;
	readonly errorPosition: "inline" | "tooltip" | "summary";
}

export interface SubmissionConfig {
	readonly method: "POST" | "PUT" | "PATCH";
	readonly endpoint: string;
	readonly successMessage?: string;
	readonly errorMessage?: string;
	readonly redirect?: string;
}

export interface DataTableConfig extends Omit<ComponentConfig, "features"> {
	readonly columns: TableColumn[];
	readonly features: TableFeatures;
	readonly actions?: TableAction[];
	readonly data?: Record<string, unknown>[];
}

export interface TableColumn {
	readonly key: string;
	readonly label: string;
	readonly type:
		| "text"
		| "number"
		| "date"
		| "boolean"
		| "badge"
		| "avatar"
		| "actions";
	readonly sortable?: boolean;
	readonly filterable?: boolean;
	readonly width?: string;
	readonly align?: "left" | "center" | "right";
}

export interface TableFeatures {
	readonly sorting: boolean;
	readonly filtering: boolean;
	readonly pagination: boolean;
	readonly selection: boolean;
	readonly search: boolean;
	readonly export: boolean;
}

export interface TableAction {
	readonly key: string;
	readonly label: string;
	readonly icon?: string;
	readonly variant?: "default" | "destructive";
	readonly handler: string;
}

export interface GeneratedComponent {
	readonly componentCode: string;
	readonly typesCode?: string;
	readonly stylesCode?: string;
	readonly localizationKeys: Record<string, any>;
	testCode?: string;
	storyCode?: string;
	documentationCode?: string;
	readonly imports: string[];
	readonly dependencies: string[];
	readonly files: GeneratedFile[];
	readonly platform: SupportedPlatform; // Platform information
	readonly architecture: "v5-cva" | "semantic" | "hybrid"; // Architecture type
}

export interface GeneratedFile {
	readonly path: string;
	readonly content: string;
	readonly type:
		| "component"
		| "types"
		| "styles"
		| "test"
		| "story"
		| "docs"
		| "locale";
}

export interface ComponentTemplateConfig {
	readonly name: string;
	readonly description: string;
	readonly category: ComponentCategory;
	readonly defaultConfig: Partial<ComponentConfig>;
	readonly requiredFeatures: (keyof ComponentFeatures)[];
	readonly template: string;
	readonly examples: ComponentExample[];
}

export interface ComponentExample {
	readonly name: string;
	readonly description: string;
	readonly config: ComponentConfig;
	readonly preview?: string;
}

export interface MCPToolConfig {
	readonly name: string;
	readonly description: string;
	readonly inputSchema: any;
	readonly handler: string;
}

// Comprehensive component templates from CLI
export type UIComponent =
	| "navbar"
	| "modal"
	| "sidebar"
	| "header"
	| "form"
	| "card"
	| "dashboard";

export type DataComponent =
	| "data-table"
	| "virtual-list"
	| "command-palette"
	| "global-search";

export type ThemeComponent = "theme-switcher" | "theme-selector";

export type LayoutComponent = "app-shell" | "layout";

export type ProviderComponent =
	| "auth-provider"
	| "theme-provider"
	| "error-boundary"
	| "notification-provider";

export type PatternComponent =
	| "render-props"
	| "hoc-collection"
	| "component-factory";

export type ToolComponent = "performance-monitor" | "code-generator";

export type ComponentTemplate =
	| UIComponent
	| DataComponent
	| ThemeComponent
	| LayoutComponent
	| ProviderComponent
	| PatternComponent
	| ToolComponent;

// Multi-platform template mapping
export interface PlatformTemplateConfig {
	readonly platform: SupportedPlatform;
	readonly availableComponents: ComponentTemplate[];
	readonly templatePath: string;
	readonly fileExtension: string;
	readonly localizationPattern: string;
}

export interface GenerationContext {
	readonly projectPath?: string;
	readonly outputPath?: string;
	readonly overwrite?: boolean;
	readonly format?: boolean;
	readonly addTests?: boolean;
	readonly addStories?: boolean;
	readonly addDocs?: boolean;
	readonly platform?: SupportedPlatform;
	readonly architecture?: "v5-cva" | "semantic" | "hybrid";
	readonly templateEngine?: "handlebars" | "ejs";
}

// MCP-specific types for prompt handling
export interface MCPPromptDefinition {
	readonly description: string;
	readonly args: Record<
		string,
		{
			type: string;
			required: boolean;
			description: string;
		}
	>;
}

export type MCPPromptMap = Record<string, MCPPromptDefinition>;

export interface MCPMessage {
	readonly role: "user" | "assistant" | "system";
	readonly content: {
		readonly type: "text";
		readonly text: string;
	};
}

export type MCPArguments<T extends MCPPromptDefinition> = {
	[K in keyof T["args"]]: T["args"][K]["required"] extends true
		? T["args"][K]["type"] extends "string"
			? string
			: T["args"][K]["type"] extends "boolean"
				? boolean
				: T["args"][K]["type"] extends "number"
					? number
					: any
		:
				| (T["args"][K]["type"] extends "string"
						? string
						: T["args"][K]["type"] extends "boolean"
							? boolean
							: T["args"][K]["type"] extends "number"
								? number
								: any)
				| undefined;
};
