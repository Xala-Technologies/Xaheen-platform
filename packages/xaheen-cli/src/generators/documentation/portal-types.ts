/**
 * @fileoverview Documentation Portal Types and Interfaces
 * @description Comprehensive type definitions for intelligent documentation portals
 * @author Xaheen Enterprise
 * @version 1.0.0
 */

import type { DocumentationGeneratorOptions, DocumentationResult } from './index';

// Base Portal Configuration
export interface DocumentationPortalOptions extends DocumentationGeneratorOptions {
  readonly portalType: 'docusaurus' | 'vitepress' | 'gitbook' | 'nextra' | 'sphinx';
  readonly theme: 'default' | 'corporate' | 'modern' | 'minimal' | 'custom';
  readonly features: DocumentationPortalFeatures;
  readonly branding: PortalBranding;
  readonly navigation: NavigationStructure;
  readonly search: SearchConfiguration;
  readonly analytics: AnalyticsConfiguration;
  readonly deployment: DeploymentConfiguration;
  readonly sync: SynchronizationConfiguration;
  readonly collaboration: CollaborationFeatures;
}

// Portal Features Configuration
export interface DocumentationPortalFeatures {
  readonly enableSearch: boolean;
  readonly enableComments: boolean;
  readonly enableVersioning: boolean;
  readonly enableMultiLanguage: boolean;
  readonly enableDarkMode: boolean;
  readonly enableEditOnGitHub: boolean;
  readonly enableLastUpdated: boolean;
  readonly enableContributors: boolean;
  readonly enableFeedback: boolean;
  readonly enableDownloadPDF: boolean;
  readonly enablePrintView: boolean;
  readonly enableMermaidDiagrams: boolean;
  readonly enableCodePlayground: boolean;
  readonly enableInteractiveExamples: boolean;
  readonly enableAIAssistant: boolean;
}

// Branding Configuration
export interface PortalBranding {
  readonly siteName: string;
  readonly tagline?: string;
  readonly logo?: LogoConfiguration;
  readonly favicon?: string;
  readonly colors: ColorScheme;
  readonly fonts: FontConfiguration;
  readonly customCSS?: string;
  readonly footerLinks?: readonly FooterLink[];
  readonly socialLinks?: readonly SocialLink[];
}

export interface LogoConfiguration {
  readonly src: string;
  readonly alt: string;
  readonly href?: string;
  readonly width?: number;
  readonly height?: number;
}

export interface ColorScheme {
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly background: string;
  readonly surface: string;
  readonly text: string;
  readonly textSecondary: string;
}

export interface FontConfiguration {
  readonly primary: string;
  readonly mono: string;
  readonly heading?: string;
}

export interface FooterLink {
  readonly title: string;
  readonly items: readonly { readonly label: string; readonly href: string }[];
}

export interface SocialLink {
  readonly label: string;
  readonly href: string;
  readonly icon: string;
}

// Navigation Structure
export interface NavigationStructure {
  readonly sidebar: readonly SidebarItem[];
  readonly navbar: readonly NavbarItem[];
  readonly breadcrumbs: boolean;
  readonly pagination: boolean;
  readonly tableOfContents: TableOfContentsConfig;
}

export interface SidebarItem {
  readonly type: 'doc' | 'category' | 'link' | 'ref' | 'generated';
  readonly label: string;
  readonly id?: string;
  readonly href?: string;
  readonly position?: number;
  readonly collapsed?: boolean;
  readonly collapsible?: boolean;
  readonly items?: readonly SidebarItem[];
  readonly generator?: string; // For auto-generated sections
}

export interface NavbarItem {
  readonly type: 'doc' | 'docSidebar' | 'page' | 'dropdown' | 'search';
  readonly label: string;
  readonly position: 'left' | 'right';
  readonly to?: string;
  readonly href?: string;
  readonly items?: readonly NavbarItem[];
}

export interface TableOfContentsConfig {
  readonly minHeadingLevel: number;
  readonly maxHeadingLevel: number;
}

// Search Configuration
export interface SearchConfiguration {
  readonly provider: 'algolia' | 'local' | 'elasticsearch' | 'lunr';
  readonly indexName?: string;
  readonly appId?: string;
  readonly apiKey?: string;
  readonly contextualSearch?: boolean;
  readonly searchPagePath?: string;
  readonly placeholder?: string;
}

// Analytics Configuration
export interface AnalyticsConfiguration {
  readonly provider?: 'google' | 'plausible' | 'fathom' | 'mixpanel';
  readonly trackingId?: string;
  readonly config?: Record<string, any>;
  readonly enableHeatmaps?: boolean;
  readonly enableUserTracking?: boolean;
}

// Deployment Configuration
export interface DeploymentConfiguration {
  readonly provider: 'github-pages' | 'netlify' | 'vercel' | 'aws-s3' | 'firebase' | 'custom';
  readonly customDomain?: string;
  readonly basePath?: string;
  readonly trailingSlash?: boolean;
  readonly staticDirs?: readonly string[];
  readonly buildCommand?: string;
  readonly outputDir?: string;
  readonly environmentVariables?: Record<string, string>;
}

// Synchronization Configuration
export interface SynchronizationConfiguration {
  readonly enabled: boolean;
  readonly watchPatterns: readonly string[];
  readonly ignorePatterns: readonly string[];
  readonly triggers: readonly SyncTrigger[];
  readonly webhooks: readonly WebhookConfiguration[];
  readonly scheduledSync?: ScheduledSyncConfiguration;
  readonly conflictResolution: 'manual' | 'auto-merge' | 'auto-overwrite' | 'notify-only';
}

export interface SyncTrigger {
  readonly event: 'git-push' | 'file-change' | 'api-change' | 'schema-change' | 'manual';
  readonly pattern?: string;
  readonly actions: readonly SyncAction[];
}

export interface SyncAction {
  readonly type: 'regenerate-docs' | 'update-api-docs' | 'refresh-examples' | 'rebuild-search' | 'notify-team';
  readonly target?: string;
  readonly config?: Record<string, any>;
}

export interface WebhookConfiguration {
  readonly url: string;
  readonly secret?: string;
  readonly events: readonly string[];
  readonly headers?: Record<string, string>;
}

export interface ScheduledSyncConfiguration {
  readonly interval: 'hourly' | 'daily' | 'weekly' | 'monthly';
  readonly time?: string; // For daily/weekly/monthly
  readonly timezone?: string;
}

// Collaboration Features
export interface CollaborationFeatures {
  readonly enableComments: boolean;
  readonly enableSuggestions: boolean;
  readonly enableReviews: boolean;
  readonly enableDiscussions: boolean;
  readonly moderationRules?: ModerationRules;
  readonly userRoles?: readonly UserRole[];
}

export interface ModerationRules {
  readonly requireApproval: boolean;
  readonly blockedWords?: readonly string[];
  readonly adminUsers?: readonly string[];
  readonly moderatorUsers?: readonly string[];
}

export interface UserRole {
  readonly name: string;
  readonly permissions: readonly Permission[];
}

export type Permission = 
  | 'read'
  | 'comment'
  | 'suggest'
  | 'edit'
  | 'approve'
  | 'moderate'
  | 'admin';

// Onboarding Guide Configuration
export interface OnboardingGuideOptions extends DocumentationGeneratorOptions {
  readonly guideType: 'developer' | 'user' | 'contributor' | 'admin' | 'custom';
  readonly targetAudience: readonly string[];
  readonly prerequisites: readonly Prerequisite[];
  readonly learningPath: readonly LearningStep[];
  readonly interactiveElements: InteractiveElementsConfig;
  readonly progressTracking: ProgressTrackingConfig;
  readonly customization: OnboardingCustomization;
}

export interface Prerequisite {
  readonly name: string;
  readonly description: string;
  readonly type: 'tool' | 'knowledge' | 'access' | 'environment';
  readonly required: boolean;
  readonly checkCommand?: string;
  readonly installationGuide?: string;
  readonly alternativeOptions?: readonly string[];
}

export interface LearningStep {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: 'concept' | 'tutorial' | 'exercise' | 'reference' | 'video';
  readonly estimatedTime: number; // minutes
  readonly difficulty: 'beginner' | 'intermediate' | 'advanced';
  readonly prerequisites?: readonly string[];
  readonly content: StepContent;
  readonly validation?: StepValidation;
  readonly nextSteps?: readonly string[];
}

export interface StepContent {
  readonly markdown?: string;
  readonly codeExamples?: readonly CodeExample[];
  readonly interactiveDemo?: InteractiveDemo;
  readonly videoUrl?: string;
  readonly externalLinks?: readonly ExternalLink[];
  readonly downloads?: readonly Download[];
}

export interface CodeExample {
  readonly language: string;
  readonly title?: string;
  readonly description?: string;
  readonly code: string;
  readonly runnable?: boolean;
  readonly explanation?: string;
  readonly highlight?: readonly number[];
}

export interface InteractiveDemo {
  readonly type: 'sandbox' | 'terminal' | 'preview' | 'quiz';
  readonly config: Record<string, any>;
}

export interface ExternalLink {
  readonly title: string;
  readonly url: string;
  readonly description?: string;
  readonly type: 'documentation' | 'tutorial' | 'tool' | 'resource';
}

export interface Download {
  readonly title: string;
  readonly url: string;
  readonly size?: string;
  readonly format: string;
  readonly description?: string;
}

export interface StepValidation {
  readonly type: 'command' | 'file-exists' | 'api-call' | 'manual' | 'quiz';
  readonly config: Record<string, any>;
  readonly successMessage: string;
  readonly failureMessage: string;
  readonly hints?: readonly string[];
}

export interface InteractiveElementsConfig {
  readonly enableCodePlayground: boolean;
  readonly enableProgressBar: boolean;
  readonly enableCheckpoints: boolean;
  readonly enableQuizzes: boolean;
  readonly enableFeedback: boolean;
  readonly enableHints: boolean;
}

export interface ProgressTrackingConfig {
  readonly enabled: boolean;
  readonly persistenceMethod: 'localStorage' | 'database' | 'cookies';
  readonly showProgress: boolean;
  readonly enableCertificates: boolean;
  readonly enableBadges: boolean;
}

export interface OnboardingCustomization {
  readonly allowPersonalization: boolean;
  readonly userPreferences?: readonly UserPreference[];
  readonly dynamicContent: boolean;
  readonly adaptiveFlow: boolean;
}

export interface UserPreference {
  readonly key: string;
  readonly label: string;
  readonly type: 'select' | 'boolean' | 'text' | 'number';
  readonly options?: readonly string[];
  readonly defaultValue?: any;
}

// Knowledge Base Configuration
export interface KnowledgeBaseOptions extends DocumentationGeneratorOptions {
  readonly indexing: IndexingConfiguration;
  readonly categorization: CategorizationConfig;
  readonly tagging: TaggingConfig;
  readonly relationships: RelationshipConfig;
  readonly aiFeatures: AIFeaturesConfig;
  readonly maintenance: MaintenanceConfig;
}

export interface IndexingConfiguration {
  readonly enabled: boolean;
  readonly engine: 'elasticsearch' | 'algolia' | 'lunr' | 'whoosh';
  readonly fields: readonly IndexField[];
  readonly analyzer?: string;
  readonly stopWords?: readonly string[];
  readonly synonyms?: Record<string, readonly string[]>;
}

export interface IndexField {
  readonly name: string;
  readonly type: 'text' | 'keyword' | 'date' | 'number' | 'boolean';
  readonly boost?: number;
  readonly analyzer?: string;
}

export interface CategorizationConfig {
  readonly automatic: boolean;
  readonly categories: readonly Category[];
  readonly hierarchical: boolean;
  readonly allowMultiple: boolean;
}

export interface Category {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly parent?: string;
  readonly icon?: string;
  readonly color?: string;
  readonly keywords?: readonly string[];
}

export interface TaggingConfig {
  readonly automatic: boolean;
  readonly predefined: readonly Tag[];
  readonly allowCustom: boolean;
  readonly suggestTags: boolean;
}

export interface Tag {
  readonly name: string;
  readonly description?: string;
  readonly color?: string;
  readonly category?: string;
}

export interface RelationshipConfig {
  readonly enableRelatedContent: boolean;
  readonly relationshipTypes: readonly RelationshipType[];
  readonly autoDetection: boolean;
  readonly displayLimit: number;
}

export interface RelationshipType {
  readonly name: string;
  readonly label: string;
  readonly bidirectional: boolean;
  readonly strength?: number;
}

export interface AIFeaturesConfig {
  readonly enableContentSuggestions: boolean;
  readonly enableAutoSummary: boolean;
  readonly enableQuestionsGeneration: boolean;
  readonly enableTranslation: boolean;
  readonly enableContentAnalysis: boolean;
  readonly aiProvider?: 'openai' | 'anthropic' | 'google' | 'azure';
  readonly model?: string;
}

export interface MaintenanceConfig {
  readonly enableHealthChecks: boolean;
  readonly checkSchedule: string;
  readonly autoFix: boolean;
  readonly notifications: NotificationConfig;
}

export interface NotificationConfig {
  readonly channels: readonly NotificationChannel[];
  readonly levels: readonly NotificationLevel[];
}

export interface NotificationChannel {
  readonly type: 'email' | 'slack' | 'teams' | 'webhook';
  readonly config: Record<string, any>;
}

export type NotificationLevel = 'info' | 'warning' | 'error' | 'critical';

// Documentation Sync and Watch Types
export interface DocumentationWatchOptions {
  readonly projectRoot: string;
  readonly watchPatterns: readonly string[];
  readonly ignorePatterns: readonly string[];
  readonly debounceMs: number;
  readonly processors: readonly FileProcessor[];
  readonly hooks: readonly WatchHook[];
}

export interface FileProcessor {
  readonly name: string;
  readonly pattern: string;
  readonly processor: (filePath: string, content: string) => Promise<ProcessorResult>;
}

export interface ProcessorResult {
  readonly success: boolean;
  readonly message: string;
  readonly changes?: readonly DocumentationChange[];
  readonly error?: string;
}

export interface DocumentationChange {
  readonly type: 'add' | 'update' | 'delete' | 'move';
  readonly file: string;
  readonly description: string;
  readonly metadata?: Record<string, any>;
}

export interface WatchHook {
  readonly event: 'before-process' | 'after-process' | 'error';
  readonly handler: (context: WatchContext) => Promise<void>;
}

export interface WatchContext {
  readonly filePath: string;
  readonly content?: string;
  readonly changes?: readonly DocumentationChange[];
  readonly error?: Error;
}

// Result Types
export interface DocumentationPortalResult extends DocumentationResult {
  readonly portalUrl?: string;
  readonly configFiles: readonly string[];
  readonly assetFiles: readonly string[];
  readonly generatedPages: readonly string[];
  readonly searchIndex?: string;
  readonly deploymentInfo?: DeploymentInfo;
}

export interface DeploymentInfo {
  readonly provider: string;
  readonly url?: string;
  readonly buildId?: string;
  readonly deploymentTime: Date;
  readonly status: 'success' | 'failed' | 'pending';
}

export interface OnboardingGuideResult extends DocumentationResult {
  readonly guideUrl?: string;
  readonly stepsGenerated: number;
  readonly interactiveElements: number;
  readonly estimatedCompletionTime: number;
  readonly prerequisites: readonly string[];
}

export interface KnowledgeBaseResult extends DocumentationResult {
  readonly indexedDocuments: number;
  readonly categories: readonly string[];
  readonly tags: readonly string[];
  readonly searchEndpoint?: string;
  readonly analyticsData?: AnalyticsData;
}

export interface AnalyticsData {
  readonly totalViews: number;
  readonly popularPages: readonly PopularPage[];
  readonly searchQueries: readonly SearchQuery[];
  readonly userEngagement: EngagementMetrics;
}

export interface PopularPage {
  readonly path: string;
  readonly title: string;
  readonly views: number;
  readonly averageTime: number;
}

export interface SearchQuery {
  readonly query: string;
  readonly count: number;
  readonly results: number;
  readonly clickthrough: number;
}

export interface EngagementMetrics {
  readonly averageSessionDuration: number;
  readonly bounceRate: number;
  readonly pagesPerSession: number;
  readonly returnVisitors: number;
}