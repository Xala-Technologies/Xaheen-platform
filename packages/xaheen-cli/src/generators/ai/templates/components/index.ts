// AI Refactoring Components
// Export all refactoring UI components for use in generated projects

export { RefactoringPreview } from './RefactoringPreview';
export { RefactoringSuggestion } from './RefactoringSuggestion';
export { RefactoringApprovalWorkflow } from './RefactoringApprovalWorkflow';
export { CodeDiffHighlighter } from './CodeDiffHighlighter';
export { RefactoringHistory } from './RefactoringHistory';
export { RefactoringSettingsPanel } from './RefactoringSettings';
export { RefactoringStatusIndicator } from './RefactoringStatusIndicator';

// Export types for external use
export type {
  CodeDiff,
  RefactoringPreviewProps,
  RefactoringSuggestionProps,
  RefactoringStep,
  RefactoringApprovalWorkflowProps,
  Token,
  DiffLine,
  CodeDiffHighlighterProps,
  RefactoringHistoryItem,
  RefactoringHistoryProps,
  RefactoringSettings,
  RefactoringSettingsProps,
  RefactoringTask,
  RefactoringStatusIndicatorProps
} from './types';