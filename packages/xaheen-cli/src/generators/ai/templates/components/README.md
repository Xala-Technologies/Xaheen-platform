# AI Refactoring Components

This directory contains TypeScript React components for building AI-powered refactoring interfaces. These components are designed to be used as templates by the AI Refactoring generator to create UI interfaces in user projects.

## Components

### 1. RefactoringPreview
Shows side-by-side code comparison with split and unified diff views.
- Supports syntax highlighting
- Dark/light theme support
- Interactive line selection
- Approve/reject/modify actions

### 2. RefactoringSuggestion
Displays individual refactoring suggestions with confidence scores.
- Type categorization (performance, readability, security, etc.)
- Impact levels (low, medium, high)
- Expandable code previews
- Quick actions (apply, dismiss, view details)

### 3. RefactoringApprovalWorkflow
Interactive workflow for step-by-step refactoring approval.
- Progress tracking
- Batch approval support
- Error handling and retry
- Step status visualization

### 4. CodeDiffHighlighter
Syntax-aware code diff visualization.
- Multiple theme support (github, dark, monokai)
- Token-based syntax highlighting
- Line-by-line diff display
- Collapsible unchanged sections

### 5. RefactoringHistory
Track and manage refactoring changes over time.
- Filterable by type and status
- Search functionality
- Sort options (date, impact, confidence)
- Revert/reapply actions

### 6. RefactoringSettingsPanel
Configure AI refactoring behavior.
- Confidence threshold adjustment
- Enable/disable refactoring types
- AI model selection
- Include/exclude file patterns

### 7. RefactoringStatusIndicator
Real-time status updates for refactoring tasks.
- Progress tracking
- Task queue visualization
- Error notifications
- Expandable/collapsible interface

## Usage

These components follow strict TypeScript and accessibility standards:

```typescript
import { RefactoringPreview } from '@xaheen-ai/ai-refactoring-components';

const MyRefactoringUI = (): JSX.Element => {
  return (
    <RefactoringPreview
      originalCode={originalCode}
      refactoredCode={refactoredCode}
      language="typescript"
      fileName="MyComponent.tsx"
      onApprove={handleApprove}
      onReject={handleReject}
      isDarkMode={true}
    />
  );
};
```

## Design Standards

All components follow these standards:
- **TypeScript**: Strict typing with readonly interfaces
- **React**: Functional components with hooks
- **Styling**: Tailwind CSS only (no inline styles)
- **Accessibility**: WCAG AAA compliance
- **Sizing**: Professional sizing (h-12+ buttons, h-14+ inputs)
- **Themes**: Full dark/light mode support
- **Error Handling**: Comprehensive error boundaries

## Example Implementation

See `RefactoringDashboard.example.tsx` for a complete implementation example showing how to integrate all components together.

## Component Architecture

```
RefactoringDashboard
├── RefactoringPreview (main code comparison view)
├── RefactoringSuggestion[] (list of AI suggestions)
├── RefactoringApprovalWorkflow (step-by-step approval)
├── CodeDiffHighlighter (detailed diff view)
├── RefactoringHistory (historical changes)
├── RefactoringSettingsPanel (configuration)
└── RefactoringStatusIndicator (real-time status)
```

## Cross-Platform Support

These components are designed to work across:
- React web applications
- Next.js applications
- React Native (with appropriate style adaptations)

## Generator Integration

The AI Refactoring generator uses these templates to:
1. Create refactoring UI in user projects
2. Customize components based on project requirements
3. Integrate with existing codebases
4. Maintain consistent styling and behavior