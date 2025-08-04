# AI Generation Patterns Hook

This hook ensures AI-generated content follows optimal patterns for code quality, maintainability, and Norwegian compliance.

## AI-Optimized Component Patterns

### Template Structure for AI Generation

All AI-generated components must follow this structure:

```typescript
/**
 * @fileoverview [ComponentName] - AI-Generated Component
 * @description [AI_GENERATED_DESCRIPTION]
 * @version 5.0.0
 * @compliance WCAG AAA, NSM [CLASSIFICATION], Norwegian Standards
 * @ai-optimized Pattern: [AI_PATTERN_TYPE]
 * @mcp-hints [AI_GENERATION_HINTS]
 */

import React, { forwardRef, useState, useCallback } from 'react';
import {
  Container,
  Stack,
  Grid,
  Card,
  Text,
  Button,
  Input
} from '@xala-technologies/ui-system';
import { t } from '@xala-technologies/ui-system/i18n';

export interface [ComponentName]Props {
  readonly 'data-testid'?: string;
  readonly title?: string;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  // [AI_GENERATED_PROPS]
}

/**
 * AI-Optimized [ComponentName] Component
 * Pattern: [COMPLEXITY] complexity with [PATTERN_TYPE]
 * Estimated tokens: [TOKEN_ESTIMATE]
 * 
 * Features:
 * - WCAG AAA accessibility compliance
 * - Norwegian government standards
 * - NSM security classification
 * - Multi-language support
 * - Semantic UI components
 */
export const [ComponentName] = forwardRef<HTMLDivElement, [ComponentName]Props>(
  ({
    title = t('[component].title', { defaultValue: '[DEFAULT_TITLE]' }),
    nsmClassification = 'OPEN',
    'data-testid': testId,
    ...props
  }, ref): JSX.Element => {
    
    // [AI_GENERATED_STATE]
    
    // [AI_GENERATED_HANDLERS]
    
    return (
      <Container
        ref={ref}
        data-testid={testId}
        data-nsm-classification={nsmClassification}
        {...props}
      >
        <Stack direction="vertical" gap="lg">
          {/* [AI_GENERATED_CONTENT] */}
        </Stack>
      </Container>
    );
  }
);

[ComponentName].displayName = '[ComponentName]';
```

## AI Content Generation Rules

### Description-to-Component Translation

When generating components from descriptions:

1. **Parse Intent**: Extract component purpose and functionality
2. **Identify Patterns**: Map to known UI patterns (dashboard, form, list, etc.)
3. **Generate Props**: Create appropriate prop interfaces based on functionality
4. **Create Content**: Generate semantic UI structure
5. **Add Interactions**: Include appropriate event handlers and state management
6. **Include Accessibility**: Add ARIA labels and keyboard navigation
7. **Apply Compliance**: Include Norwegian compliance features

### AI Prompt Optimization

For consistent AI generation, use these prompt patterns:

```typescript
// Business Context Prompts
const prompts = {
  ecommerce: "Create an e-commerce [component] with product management, cart functionality, and Norwegian payment integration (Vipps)",
  
  government: "Create a government service [component] with NSM CONFIDENTIAL classification, BankID authentication, and Altinn integration",
  
  saas: "Create a SaaS [component] with subscription management, analytics dashboard, and multi-tenant support",
  
  dashboard: "Create an admin dashboard [component] with KPI cards, data visualization, and real-time updates",
  
  form: "Create a multi-step form [component] with validation, auto-save, and Norwegian compliance (GDPR)"
};
```

## Pattern Recognition Integration

### Keyword to Pattern Mapping

AI generation must recognize these patterns:

```typescript
const patternMap = {
  // Layout Patterns
  'dashboard': 'Grid + Card + KPI layout',
  'landing': 'Hero + Features + CTA layout',
  'profile': 'Card + Form + Avatar layout',
  
  // Data Patterns
  'table': 'DataTable + Pagination + Filters',
  'list': 'Stack + Card + Virtual scrolling',
  'grid': 'Grid + Card + Responsive layout',
  
  // Form Patterns
  'contact': 'Multi-field form + Validation + Submit',
  'login': 'Email/Password + BankID + Remember me',
  'registration': 'Multi-step + Validation + Terms',
  
  // Business Patterns
  'product': 'Image + Details + Cart + Reviews',
  'order': 'Items + Status + Tracking + Actions',
  'invoice': 'Header + Items + Total + Payment'
};
```

### Complexity Estimation

AI must estimate component complexity:

```typescript
interface ComplexityMetrics {
  simple: {
    tokenEstimate: 200-500,
    developmentTime: '5-15 minutes',
    aiDifficulty: 'easy'
  },
  moderate: {
    tokenEstimate: 500-1000,
    developmentTime: '15-45 minutes',
    aiDifficulty: 'moderate'
  },
  complex: {
    tokenEstimate: 1000-2000,
    developmentTime: '45-90 minutes',
    aiDifficulty: 'challenging'
  },
  advanced: {
    tokenEstimate: 2000+,
    developmentTime: '2-4 hours',
    aiDifficulty: 'expert'
  }
}
```

## Norwegian Compliance in AI Generation

### Auto-Generated Compliance Features

AI must automatically include:

```typescript
// Security Classification
data-nsm-classification={nsmClassification}

// Internationalization
{t('[component].title', { defaultValue: 'Default Text' })}

// Norwegian Phone Validation
const validateNorwegianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s\-\+]/g, '');
  return /^(47)?[4-9]\d{7}$/.test(cleaned);
};

// Norwegian Postal Code Validation
const validateNorwegianPostalCode = (code: string): boolean => {
  return /^\d{4}$/.test(code);
};

// GDPR Consent Integration
{requiresConsent && (
  <GDPRConsent
    purpose="data-collection"
    onConsent={handleConsent}
    locale="nb-NO"
  />
)}
```

## AI Training Integration

### Context Awareness

AI generation must consider:

1. **Existing Codebase**: Analyze current patterns and conventions
2. **Project Type**: Adapt to web/mobile/API project context
3. **Framework**: Generate appropriate React/Vue/Angular code
4. **Design System**: Use established component library
5. **Business Domain**: Apply relevant business logic patterns

### Quality Validation

Generated code must pass:

1. **TypeScript Compilation**: Strict mode without errors
2. **Accessibility Validation**: WCAG AAA compliance
3. **Norwegian Compliance**: NSM and GDPR requirements
4. **UI System Validation**: Semantic component usage
5. **Performance Validation**: Optimal rendering patterns

## MCP Integration Patterns

### Component Specifications

AI generation uses MCP for:

```typescript
interface MCPComponentSpec {
  complexity: 'simple' | 'moderate' | 'complex' | 'advanced';
  patterns: string[];
  aiHints: string[];
  tokenEstimate: number;
  validationCriteria: ValidationCriteria;
  norwegianCompliance: boolean;
  accessibilityLevel: 'A' | 'AA' | 'AAA';
}
```

### AI Optimization Variables

Templates include AI optimization hints:

```handlebars
{{!-- AI Context Variables --}}
{{aiContext.complexity}}
{{aiContext.hints}}
{{aiContext.patterns}}

{{!-- MCP Integration --}}
{{mcpAIHints}}
{{mcpComplexity}}
{{mcpTokens}}
{{mcpPatterns}}

{{!-- Quality Checks --}}
{{qualityChecks}}
{{commonPitfalls}}
{{testingGuidance}}
```

## Error Prevention Patterns

### Common AI Generation Pitfalls

Prevent these common issues:

1. **Forgetting forwardRef**: Always include ref forwarding
2. **Missing displayName**: Set component displayName
3. **Accessibility omissions**: Include ARIA labels and roles
4. **Hardcoded text**: Use translation functions
5. **Inline styles**: Use Tailwind classes only
6. **Non-semantic HTML**: Use UI System components
7. **Missing error handling**: Include try-catch blocks

### Validation Hooks

Before finalizing AI generation:

```typescript
const validationChecks = [
  'TypeScript strict mode compilation',
  'ESLint passes without warnings',
  'Accessibility validation (WCAG AAA)',
  'Norwegian compliance validation',
  'UI System component usage',
  'Performance optimization',
  'Security best practices'
];
```

## Generation Workflow

### Step-by-Step AI Generation

1. **Parse Description**: Extract component requirements
2. **Select Pattern**: Choose appropriate UI pattern
3. **Generate Structure**: Create component skeleton
4. **Add Business Logic**: Implement functionality
5. **Apply Styling**: Use semantic UI components
6. **Include Accessibility**: Add ARIA attributes
7. **Add Compliance**: Include Norwegian requirements
8. **Validate Quality**: Run validation checks
9. **Generate Tests**: Create basic test structure
10. **Generate Documentation**: Add JSDoc comments

### Iterative Refinement

Support iterative improvement:

1. **Initial Generation**: Basic component structure
2. **Content Enhancement**: Add business logic and content
3. **Accessibility Pass**: Enhance accessibility features
4. **Compliance Pass**: Add Norwegian compliance features
5. **Performance Pass**: Optimize for performance
6. **Quality Pass**: Final validation and cleanup