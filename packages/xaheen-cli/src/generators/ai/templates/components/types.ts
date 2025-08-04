// Type definitions for AI Refactoring Components

// RefactoringPreview types
export interface CodeDiff {
  readonly lineNumber: number;
  readonly type: 'added' | 'removed' | 'unchanged';
  readonly content: string;
}

export interface RefactoringPreviewProps {
  readonly originalCode: string;
  readonly refactoredCode: string;
  readonly language: string;
  readonly fileName: string;
  readonly onApprove?: () => void;
  readonly onReject?: () => void;
  readonly onModify?: (code: string) => void;
  readonly isDarkMode?: boolean;
}

// RefactoringSuggestion types
export interface RefactoringSuggestionProps {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: 'performance' | 'readability' | 'maintainability' | 'security' | 'best-practice';
  readonly confidenceScore: number;
  readonly impact: 'low' | 'medium' | 'high';
  readonly codePreview?: string;
  readonly estimatedChanges: number;
  readonly onApply?: (id: string) => void;
  readonly onDismiss?: (id: string) => void;
  readonly onViewDetails?: (id: string) => void;
  readonly isDarkMode?: boolean;
}

// RefactoringApprovalWorkflow types
export interface RefactoringStep {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';
  readonly timestamp?: Date;
  readonly error?: string;
}

export interface RefactoringApprovalWorkflowProps {
  readonly workflowId: string;
  readonly title: string;
  readonly steps: readonly RefactoringStep[];
  readonly currentStepId?: string;
  readonly onApprove?: (stepId: string) => void;
  readonly onReject?: (stepId: string) => void;
  readonly onSkip?: (stepId: string) => void;
  readonly onCancel?: () => void;
  readonly onRetry?: (stepId: string) => void;
  readonly allowBatchApproval?: boolean;
  readonly isDarkMode?: boolean;
}

// CodeDiffHighlighter types
export interface Token {
  readonly type: 'keyword' | 'string' | 'number' | 'comment' | 'function' | 'variable' | 'operator' | 'punctuation' | 'text';
  readonly value: string;
  readonly start: number;
  readonly end: number;
}

export interface DiffLine {
  readonly lineNumber: number;
  readonly type: 'added' | 'removed' | 'unchanged' | 'modified';
  readonly content: string;
  readonly tokens?: readonly Token[];
}

export interface CodeDiffHighlighterProps {
  readonly language: string;
  readonly diffLines: readonly DiffLine[];
  readonly showLineNumbers?: boolean;
  readonly highlightSyntax?: boolean;
  readonly wrapLongLines?: boolean;
  readonly theme?: 'light' | 'dark' | 'github' | 'monokai';
  readonly onLineClick?: (lineNumber: number) => void;
  readonly selectedLines?: readonly number[];
  readonly collapsibleSections?: boolean;
}

// RefactoringHistory types
export interface RefactoringHistoryItem {
  readonly id: string;
  readonly timestamp: Date;
  readonly type: 'performance' | 'readability' | 'maintainability' | 'security' | 'best-practice';
  readonly title: string;
  readonly description: string;
  readonly filesChanged: number;
  readonly linesAdded: number;
  readonly linesRemoved: number;
  readonly status: 'applied' | 'reverted' | 'pending';
  readonly author: string;
  readonly confidenceScore?: number;
  readonly relatedFiles?: readonly string[];
}

export interface RefactoringHistoryProps {
  readonly items: readonly RefactoringHistoryItem[];
  readonly onViewDetails?: (id: string) => void;
  readonly onRevert?: (id: string) => void;
  readonly onReapply?: (id: string) => void;
  readonly showFilters?: boolean;
  readonly isDarkMode?: boolean;
}

// RefactoringSettings types
export interface RefactoringSettings {
  readonly autoApprove: boolean;
  readonly confidenceThreshold: number;
  readonly enabledTypes: {
    readonly performance: boolean;
    readonly readability: boolean;
    readonly maintainability: boolean;
    readonly security: boolean;
    readonly bestPractice: boolean;
  };
  readonly maxChangesPerFile: number;
  readonly preserveComments: boolean;
  readonly preserveFormatting: boolean;
  readonly enableBackup: boolean;
  readonly backupLocation?: string;
  readonly aiModel: 'gpt-4' | 'gpt-3.5-turbo' | 'claude' | 'custom';
  readonly customPrompt?: string;
  readonly excludePatterns: readonly string[];
  readonly includePatterns: readonly string[];
}

export interface RefactoringSettingsProps {
  readonly settings: RefactoringSettings;
  readonly onSettingsChange: (settings: RefactoringSettings) => void;
  readonly onSave?: () => void;
  readonly onReset?: () => void;
  readonly showAdvanced?: boolean;
  readonly isDarkMode?: boolean;
}

// RefactoringStatusIndicator types
export interface RefactoringTask {
  readonly id: string;
  readonly name: string;
  readonly status: 'queued' | 'analyzing' | 'processing' | 'completed' | 'failed' | 'cancelled';
  readonly progress: number;
  readonly filesProcessed: number;
  readonly totalFiles: number;
  readonly startTime?: Date;
  readonly endTime?: Date;
  readonly error?: string;
}

export interface RefactoringStatusIndicatorProps {
  readonly tasks: readonly RefactoringTask[];
  readonly onTaskClick?: (taskId: string) => void;
  readonly onCancelTask?: (taskId: string) => void;
  readonly onRetryTask?: (taskId: string) => void;
  readonly onClearCompleted?: () => void;
  readonly compact?: boolean;
  readonly showNotifications?: boolean;
  readonly isDarkMode?: boolean;
}