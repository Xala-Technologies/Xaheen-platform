/**
 * Xaheen CLI Web Interface - Component Type Definitions
 * CLAUDE.md Compliant TypeScript Interfaces
 * 
 * CRITICAL REQUIREMENTS:
 * ✅ All interfaces must be readonly
 * ✅ Explicit return types for all components: JSX.Element
 * ✅ No 'any' types permitted
 * ✅ Professional sizing standards (h-12+ buttons, h-14+ inputs)
 * ✅ WCAG AAA accessibility compliance
 * ✅ Xala UI System CVA integration
 */

export interface BaseComponentProps {
  readonly className?: string;
  readonly children?: React.ReactNode;
}

// ===============================
// PROJECT CREATION WIZARD TYPES
// ===============================

export interface ProjectConfig {
  readonly name: string;
  readonly type: 'web-app' | 'mobile-app' | 'desktop-app' | 'library' | 'monorepo';
  readonly description?: string;
  readonly template: string;
  readonly platform: 'react' | 'nextjs' | 'vue' | 'angular' | 'svelte' | 'electron' | 'react-native';
  readonly features: readonly ProjectFeature[];
  readonly localization: readonly string[];
  readonly theme: 'enterprise' | 'finance' | 'healthcare' | 'education' | 'ecommerce' | 'productivity';
}

export interface ProjectFeature {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: 'auth' | 'database' | 'ui' | 'deployment' | 'testing' | 'monitoring';
  readonly required: boolean;
  readonly icon?: string;
}

export interface WizardStep {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly isCompleted: boolean;
  readonly isActive: boolean;
  readonly validation?: (config: Partial<ProjectConfig>) => string | null;
}

export interface ProjectWizardProps extends BaseComponentProps {
  readonly initialStep?: number;
  readonly initialConfig?: Partial<ProjectConfig>;
  readonly onComplete: (config: ProjectConfig) => Promise<void>;
  readonly onCancel: () => void;
  readonly onStepChange?: (step: number, config: Partial<ProjectConfig>) => void;
  readonly isLoading?: boolean;
}

// ===============================
// AI ASSISTANT PANEL TYPES
// ===============================

export interface ChatMessage {
  readonly id: string;
  readonly role: 'user' | 'assistant' | 'system';
  readonly content: string;
  readonly timestamp: Date;
  readonly codeChanges?: readonly CodeChange[];
  readonly metadata?: ChatMessageMetadata;
}

export interface ChatMessageMetadata {
  readonly isStreaming?: boolean;
  readonly confidence?: number;
  readonly sources?: readonly string[];
  readonly executionTime?: number;
}

export interface CodeChange {
  readonly id: string;
  readonly file: string;
  readonly action: 'create' | 'modify' | 'delete' | 'rename';
  readonly content: string;
  readonly language: string;
  readonly lineNumbers?: readonly number[];
  readonly diff?: string;
  readonly preview?: string;
}

export interface AIAssistantProps extends BaseComponentProps {
  readonly isOpen: boolean;
  readonly position?: 'right' | 'left' | 'fullscreen';
  readonly onClose: () => void;
  readonly onApplyChanges: (changes: readonly CodeChange[]) => Promise<void>;
  readonly onMessageSend?: (message: string) => Promise<void>;
  readonly initialMessages?: readonly ChatMessage[];
  readonly isProcessing?: boolean;
  readonly projectContext?: ProjectContext;
}

export interface ProjectContext {
  readonly name: string;
  readonly type: string;
  readonly platform: string;
  readonly files: readonly string[];
  readonly dependencies: readonly string[];
  readonly configuration: Record<string, unknown>;
}

// ===============================
// DASHBOARD TYPES
// ===============================

export interface ProjectStatistics {
  readonly totalProjects: number;
  readonly activeProjects: number;
  readonly templatesUsed: number;
  readonly successRate: number;
  readonly avgGenerationTime: number;
  readonly recentActivity: readonly ProjectActivity[];
}

export interface ProjectActivity {
  readonly id: string;
  readonly type: 'created' | 'modified' | 'deployed' | 'error';
  readonly projectName: string;
  readonly timestamp: Date;
  readonly description: string;
  readonly metadata?: Record<string, unknown>;
}

export interface DashboardGridProps extends BaseComponentProps {
  readonly statistics: ProjectStatistics;
  readonly recentProjects: readonly ProjectSummary[];
  readonly onProjectClick: (projectId: string) => void;
  readonly onCreateProject: () => void;
  readonly onViewAll: () => void;
  readonly isLoading?: boolean;
}

export interface ProjectSummary {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly platform: string;
  readonly status: 'active' | 'completed' | 'error' | 'draft';
  readonly lastModified: Date;
  readonly progress: number;
  readonly thumbnail?: string;
}

// ===============================
// CODE DIFF PREVIEW TYPES
// ===============================

export interface CodeDiffProps extends BaseComponentProps {
  readonly changes: readonly CodeChange[];
  readonly onApply: (changeIds: readonly string[]) => Promise<void>;
  readonly onReject: (changeIds: readonly string[]) => void;
  readonly onPreview: (changeId: string) => void;
  readonly selectedChanges?: readonly string[];
  readonly isApplying?: boolean;
  readonly showLineNumbers?: boolean;
  readonly theme?: 'light' | 'dark';
}

export interface DiffLine {
  readonly number: number;
  readonly type: 'added' | 'removed' | 'unchanged' | 'modified';
  readonly content: string;
  readonly oldNumber?: number;
  readonly newNumber?: number;
}

export interface FileDiff {
  readonly fileName: string;
  readonly language: string;
  readonly oldContent: string;
  readonly newContent: string;
  readonly lines: readonly DiffLine[];
  readonly stats: {
    readonly additions: number;
    readonly deletions: number;
    readonly modifications: number;
  };
}

// ===============================
// NAVIGATION TYPES
// ===============================

export interface NavigationItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly icon?: React.ComponentType<{ size?: number }>;
  readonly badge?: string | number;
  readonly isActive?: boolean;
  readonly children?: readonly NavigationItem[];
  readonly permissions?: readonly string[];
}

export interface EnhancedNavigationHeaderProps extends BaseComponentProps {
  readonly locale: string;
  readonly user?: UserProfile;
  readonly navigation: readonly NavigationItem[];
  readonly notifications?: readonly Notification[];
  readonly onSearchChange?: (query: string) => void;
  readonly onNavigationClick?: (item: NavigationItem) => void;
  readonly onNotificationClick?: (notification: Notification) => void;
  readonly onUserAction?: (action: UserAction) => void;
  readonly searchResults?: readonly SearchResult[];
  readonly isSearching?: boolean;
}

export interface UserProfile {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly avatar?: string;
  readonly role: string;
  readonly permissions: readonly string[];
  readonly lastLogin?: Date;
}

export interface Notification {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly type: 'info' | 'success' | 'warning' | 'error';
  readonly timestamp: Date;
  readonly isRead: boolean;
  readonly actionUrl?: string;
}

export interface UserAction {
  readonly type: 'profile' | 'settings' | 'logout' | 'help';
  readonly payload?: Record<string, unknown>;
}

export interface SearchResult {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly category: string;
  readonly url: string;
  readonly icon?: string;
  readonly relevance: number;
}

// ===============================
// FORM TYPES
// ===============================

export interface FormField {
  readonly name: string;
  readonly type: 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'switch' | 'slider' | 'date' | 'time';
  readonly label: string;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly options?: readonly SelectOption[];
  readonly validation?: FieldValidation;
  readonly helpText?: string;
  readonly icon?: React.ComponentType<{ size?: number }>;
}

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly icon?: React.ComponentType<{ size?: number }>;
  readonly description?: string;
  readonly disabled?: boolean;
}

export interface FieldValidation {
  readonly required?: boolean;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: RegExp;
  readonly custom?: (value: unknown) => string | null;
}

// ===============================
// ERROR HANDLING TYPES
// ===============================

export interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error?: Error;
  readonly errorInfo?: React.ErrorInfo;
}

export interface LoadingState {
  readonly isLoading: boolean;
  readonly message?: string;
  readonly progress?: number;
}

export interface AsyncOperationState<T = unknown> {
  readonly data?: T;
  readonly error?: string;
  readonly isLoading: boolean;
  readonly isSuccess: boolean;
  readonly isError: boolean;
}

// ===============================
// COMPONENT STATE MANAGEMENT
// ===============================

export interface WizardState {
  readonly currentStep: number;
  readonly config: Partial<ProjectConfig>;
  readonly errors: Record<string, string>;
  readonly isValid: boolean;
  readonly isSubmitting: boolean;
}

export interface AIAssistantState {
  readonly messages: readonly ChatMessage[];
  readonly isOpen: boolean;
  readonly isProcessing: boolean;
  readonly pendingChanges: readonly CodeChange[];
  readonly context?: ProjectContext;
}

export interface DashboardState {
  readonly statistics: ProjectStatistics;
  readonly projects: readonly ProjectSummary[];
  readonly selectedProject?: string;
  readonly filters: DashboardFilters;
}

export interface DashboardFilters {
  readonly status?: ProjectSummary['status'];
  readonly platform?: string;
  readonly dateRange?: {
    readonly start: Date;
    readonly end: Date;
  };
  readonly searchQuery?: string;
}

// ===============================
// ACCESSIBILITY TYPES
// ===============================

export interface AccessibilityProps {
  readonly 'aria-label'?: string;
  readonly 'aria-labelledby'?: string;
  readonly 'aria-describedby'?: string;
  readonly 'aria-expanded'?: boolean;
  readonly 'aria-controls'?: string;
  readonly 'aria-live'?: 'polite' | 'assertive' | 'off';
  readonly role?: string;
  readonly tabIndex?: number;
}

// ===============================
// RESPONSIVE DESIGN TYPES
// ===============================

export interface ResponsiveBreakpoints {
  readonly xs: boolean; // < 640px
  readonly sm: boolean; // >= 640px
  readonly md: boolean; // >= 768px
  readonly lg: boolean; // >= 1024px
  readonly xl: boolean; // >= 1280px
  readonly '2xl': boolean; // >= 1536px
}

export interface ResponsiveConfig {
  readonly breakpoints: ResponsiveBreakpoints;
  readonly isMobile: boolean;
  readonly isTablet: boolean;
  readonly isDesktop: boolean;
}