# Token Diffing System

The Token Diffing System in UI System v5 provides comprehensive change detection and comparison capabilities for design tokens, enabling precise tracking of modifications, visual diff generation, and automated change documentation.

## Overview

The diffing system provides:
- Deep object comparison
- Visual diff generation
- Change categorization
- Impact analysis
- Merge conflict resolution
- Change visualization
- Automated changelog generation

## Basic Usage

### Simple Diff

```typescript
import { diffTokens } from '@xala-technologies/ui-system/tokens/diffing';

const oldTokens = {
  colors: {
    primary: { 500: '#0070f3' },
    secondary: { 500: '#ff0080' }
  }
};

const newTokens = {
  colors: {
    primary: { 500: '#0066cc' }, // Changed
    secondary: { 500: '#ff0080' }, // Unchanged
    tertiary: { 500: '#00ff00' }  // Added
  }
};

const diff = diffTokens(oldTokens, newTokens);
console.log(diff);
// {
//   added: ['colors.tertiary'],
//   modified: ['colors.primary.500'],
//   removed: [],
//   unchanged: ['colors.secondary.500']
// }
```

### Detailed Diff

```typescript
const detailedDiff = diffTokens(oldTokens, newTokens, {
  detailed: true,
  includeValues: true
});

console.log(detailedDiff);
// {
//   changes: [
//     {
//       type: 'modified',
//       path: 'colors.primary.500',
//       oldValue: '#0070f3',
//       newValue: '#0066cc',
//       category: 'color'
//     },
//     {
//       type: 'added',
//       path: 'colors.tertiary',
//       newValue: { 500: '#00ff00' },
//       category: 'color'
//     }
//   ],
//   summary: {
//     total: 2,
//     added: 1,
//     modified: 1,
//     removed: 0
//   }
// }
```

## Advanced Features

### 1. Visual Diff Generation

```typescript
import { generateVisualDiff } from '@xala-technologies/ui-system/tokens/diffing';

const visualDiff = generateVisualDiff(oldTokens, newTokens, {
  format: 'html', // or 'markdown', 'terminal'
  colorize: true,
  context: 3 // Lines of context
});

// HTML output with side-by-side comparison
fs.writeFileSync('token-diff.html', visualDiff);
```

Example HTML output:
```html
<div class="token-diff">
  <div class="diff-header">
    <h2>Token Changes</h2>
    <div class="summary">
      <span class="added">+1 added</span>
      <span class="modified">~1 modified</span>
      <span class="removed">-0 removed</span>
    </div>
  </div>
  
  <div class="diff-content">
    <div class="change modified">
      <div class="path">colors.primary.500</div>
      <div class="values">
        <span class="old">#0070f3</span>
        <span class="arrow">→</span>
        <span class="new">#0066cc</span>
      </div>
      <div class="preview">
        <div class="color-swatch old" style="background: #0070f3"></div>
        <div class="color-swatch new" style="background: #0066cc"></div>
      </div>
    </div>
    
    <div class="change added">
      <div class="path">colors.tertiary.500</div>
      <div class="values">
        <span class="new">#00ff00</span>
      </div>
      <div class="preview">
        <div class="color-swatch new" style="background: #00ff00"></div>
      </div>
    </div>
  </div>
</div>
```

### 2. Impact Analysis

```typescript
import { analyzeImpact } from '@xala-technologies/ui-system/tokens/diffing';

const impact = analyzeImpact(diff, {
  components: ['Button', 'Card', 'Input'],
  checkUsage: true,
  includeIndirect: true
});

console.log(impact);
// {
//   affectedComponents: [
//     {
//       name: 'Button',
//       tokens: ['colors.primary.500'],
//       variants: ['primary'],
//       severity: 'high'
//     },
//     {
//       name: 'Card',
//       tokens: ['colors.primary.500'],
//       variants: ['highlighted'],
//       severity: 'medium'
//     }
//   ],
//   totalAffected: 2,
//   criticalChanges: 1,
//   suggestions: [
//     'Update Button component primary variant',
//     'Review Card highlighted variant styling'
//   ]
// }
```

### 3. Merge Conflict Resolution

```typescript
import { resolveTokenConflicts } from '@xala-technologies/ui-system/tokens/diffing';

// Three-way merge
const base = { colors: { primary: '#000000' } };
const ours = { colors: { primary: '#0070f3' } };
const theirs = { colors: { primary: '#0066cc' } };

const resolved = resolveTokenConflicts(base, ours, theirs, {
  strategy: 'interactive', // or 'ours', 'theirs', 'auto'
  onConflict: (conflict) => {
    console.log(`Conflict at ${conflict.path}:`);
    console.log(`  Base: ${conflict.base}`);
    console.log(`  Ours: ${conflict.ours}`);
    console.log(`  Theirs: ${conflict.theirs}`);
    
    // Return resolution
    return conflict.ours; // Choose our version
  }
});
```

### 4. Change Categories

```typescript
const categorizedDiff = diffTokens(oldTokens, newTokens, {
  categorize: true
});

console.log(categorizedDiff.byCategory);
// {
//   colors: {
//     added: ['colors.tertiary'],
//     modified: ['colors.primary.500'],
//     removed: []
//   },
//   spacing: {
//     added: [],
//     modified: [],
//     removed: []
//   },
//   typography: {
//     added: [],
//     modified: [],
//     removed: []
//   }
// }
```

### 5. Semantic Diff

```typescript
import { semanticDiff } from '@xala-technologies/ui-system/tokens/diffing';

// Detects meaningful changes vs cosmetic ones
const semantic = semanticDiff(oldTokens, newTokens, {
  ignoreFormatting: true,
  ignoreComments: true,
  ignoreMetadata: true,
  colorTolerance: 1 // Allow 1% color difference
});

console.log(semantic);
// {
//   meaningful: [
//     {
//       path: 'colors.primary.500',
//       reason: 'Color changed significantly',
//       impact: 'visual'
//     }
//   ],
//   cosmetic: [
//     {
//       path: 'metadata.updated',
//       reason: 'Timestamp update only',
//       impact: 'none'
//     }
//   ]
// }
```

## Diff Visualization

### 1. Terminal Output

```typescript
import { printDiff } from '@xala-technologies/ui-system/tokens/diffing';

printDiff(oldTokens, newTokens, {
  colors: true,
  compact: false
});

// Output:
// Token Diff Summary
// ==================
// + Added: 1
// ~ Modified: 1
// - Removed: 0
// 
// Changes:
// --------
// ~ colors.primary.500
//   - #0070f3
//   + #0066cc
// 
// + colors.tertiary.500
//   + #00ff00
```

### 2. Markdown Report

```typescript
const markdownDiff = generateVisualDiff(oldTokens, newTokens, {
  format: 'markdown',
  includePreview: true
});

fs.writeFileSync('CHANGELOG.md', markdownDiff);
```

Example output:
```markdown
# Token Changes

## Summary
- **Added**: 1 token
- **Modified**: 1 token
- **Removed**: 0 tokens

## Detailed Changes

### Colors

#### Modified
- `colors.primary.500`: `#0070f3` → `#0066cc`
  - ![Old](https://via.placeholder.com/20/0070f3/0070f3.png) → ![New](https://via.placeholder.com/20/0066cc/0066cc.png)

#### Added
- `colors.tertiary.500`: `#00ff00`
  - ![Color](https://via.placeholder.com/20/00ff00/00ff00.png)
```

### 3. JSON Patch Format

```typescript
import { generateJsonPatch } from '@xala-technologies/ui-system/tokens/diffing';

const patch = generateJsonPatch(oldTokens, newTokens);
console.log(patch);
// [
//   {
//     op: 'replace',
//     path: '/colors/primary/500',
//     value: '#0066cc'
//   },
//   {
//     op: 'add',
//     path: '/colors/tertiary',
//     value: { 500: '#00ff00' }
//   }
// ]

// Apply patch
import { applyPatch } from 'fast-json-patch';
const patched = applyPatch(oldTokens, patch);
```

## Diff Strategies

### 1. Structural Diff

```typescript
const structuralDiff = diffTokens(oldTokens, newTokens, {
  strategy: 'structural',
  ignoreValues: true
});

// Only detects structure changes:
// - Added/removed properties
// - Type changes
// - Nesting changes
```

### 2. Value Diff

```typescript
const valueDiff = diffTokens(oldTokens, newTokens, {
  strategy: 'values',
  ignoreStructure: true
});

// Only detects value changes in existing properties
```

### 3. Smart Diff

```typescript
const smartDiff = diffTokens(oldTokens, newTokens, {
  strategy: 'smart',
  detectMoves: true,
  detectRenames: true,
  threshold: 0.8 // 80% similarity for rename detection
});

console.log(smartDiff.operations);
// [
//   {
//     type: 'rename',
//     from: 'colors.brand',
//     to: 'colors.primary',
//     confidence: 0.95
//   },
//   {
//     type: 'move',
//     from: 'spacing.gutter',
//     to: 'layout.gutter',
//     confidence: 1.0
//   }
// ]
```

## Integration with Version Control

### 1. Git Integration

```typescript
import { GitDiffGenerator } from '@xala-technologies/ui-system/tokens/diffing';

const gitDiff = new GitDiffGenerator();

// Compare with previous commit
const diffWithPrevious = await gitDiff.compareWithCommit('HEAD~1');

// Compare branches
const branchDiff = await gitDiff.compareBranches('main', 'feature/new-colors');

// Compare tags
const releaseDiff = await gitDiff.compareTags('v1.0.0', 'v2.0.0');
```

### 2. PR Comments

```typescript
// GitHub Action for automatic PR comments
async function commentOnPR(diff: TokenDiff) {
  const comment = generatePRComment(diff, {
    format: 'markdown',
    includePreview: true,
    includeImpact: true
  });
  
  await github.issues.createComment({
    owner,
    repo,
    issue_number: pr.number,
    body: comment
  });
}
```

### 3. CI/CD Validation

```typescript
// Validate token changes in CI
async function validateTokenChanges() {
  const diff = await diffWithBaseBranch();
  
  // Check for breaking changes
  if (diff.breaking.length > 0) {
    console.error('Breaking changes detected:');
    diff.breaking.forEach(change => {
      console.error(`- ${change.path}: ${change.description}`);
    });
    
    if (!process.env.ALLOW_BREAKING) {
      process.exit(1);
    }
  }
  
  // Check change limits
  if (diff.summary.modified > 50) {
    console.warn('Large number of changes detected');
  }
}
```

## Diff Analysis Tools

### 1. Change Frequency Analysis

```typescript
import { analyzeChangeFrequency } from '@xala-technologies/ui-system/tokens/diffing';

// Analyze which tokens change most frequently
const frequency = await analyzeChangeFrequency({
  repository: './tokens',
  period: '6months',
  groupBy: 'category'
});

console.log(frequency);
// {
//   colors: {
//     changes: 45,
//     avgPerMonth: 7.5,
//     mostChanged: ['colors.primary.500', 'colors.accent.400']
//   },
//   spacing: {
//     changes: 12,
//     avgPerMonth: 2,
//     mostChanged: ['spacing.container', 'spacing.section']
//   }
// }
```

### 2. Stability Metrics

```typescript
const stability = calculateTokenStability(history, {
  window: '3months'
});

console.log(stability);
// {
//   stable: ['colors.neutral', 'typography.fontFamily'],
//   volatile: ['colors.seasonal', 'spacing.experimental'],
//   recommendations: [
//     'Consider stabilizing colors.seasonal',
//     'spacing.experimental has changed 8 times'
//   ]
// }
```

## Testing with Diffs

### 1. Snapshot Testing

```typescript
import { snapshotTokens } from '@xala-technologies/ui-system/test-utils';

test('tokens remain stable', () => {
  const current = loadCurrentTokens();
  const snapshot = loadTokenSnapshot();
  
  const diff = diffTokens(snapshot, current);
  
  expect(diff.modified).toHaveLength(0);
  expect(diff.removed).toHaveLength(0);
});
```

### 2. Regression Testing

```typescript
test('color contrast maintained', () => {
  const oldTokens = loadPreviousTokens();
  const newTokens = loadCurrentTokens();
  
  const diff = diffTokens(oldTokens, newTokens);
  
  diff.modified.forEach(path => {
    if (path.includes('color')) {
      const oldContrast = calculateContrast(oldTokens, path);
      const newContrast = calculateContrast(newTokens, path);
      
      expect(newContrast).toBeGreaterThanOrEqual(oldContrast);
    }
  });
});
```

## Best Practices

### 1. Diff Before Deploy

```typescript
// Pre-deployment check
async function preDeploymentCheck() {
  const productionTokens = await fetchProductionTokens();
  const stagingTokens = await fetchStagingTokens();
  
  const diff = diffTokens(productionTokens, stagingTokens, {
    detailed: true,
    includeImpact: true
  });
  
  // Generate report
  const report = generateDeploymentReport(diff);
  
  // Require approval for significant changes
  if (diff.summary.total > 10 || diff.breaking.length > 0) {
    await requireApproval(report);
  }
}
```

### 2. Automated Documentation

```typescript
// Auto-generate changelog from diffs
function generateChangelog(fromVersion: string, toVersion: string) {
  const diff = diffVersions(fromVersion, toVersion);
  
  return `
# Changelog

## [${toVersion}] - ${new Date().toISOString().split('T')[0]}

### Added
${diff.added.map(path => `- ${path}`).join('\n')}

### Changed
${diff.modified.map(change => 
  `- ${change.path}: ${change.oldValue} → ${change.newValue}`
).join('\n')}

### Removed
${diff.removed.map(path => `- ${path}`).join('\n')}
  `;
}
```

### 3. Visual Regression Prevention

```typescript
// Detect visual regressions
const visualRegressionCheck = (diff: TokenDiff) => {
  const regressions = [];
  
  diff.modified.forEach(change => {
    // Check color visibility
    if (change.category === 'color') {
      const oldContrast = getColorContrast(change.oldValue);
      const newContrast = getColorContrast(change.newValue);
      
      if (newContrast < oldContrast && newContrast < 4.5) {
        regressions.push({
          path: change.path,
          issue: 'Reduced color contrast',
          severity: 'high'
        });
      }
    }
    
    // Check spacing consistency
    if (change.category === 'spacing') {
      if (!isMultipleOf8(parseFloat(change.newValue))) {
        regressions.push({
          path: change.path,
          issue: 'Not following 8pt grid',
          severity: 'medium'
        });
      }
    }
  });
  
  return regressions;
};
```

## Performance Optimization

### 1. Incremental Diff

```typescript
// For large token sets
const incrementalDiff = createIncrementalDiff();

// Add changes incrementally
incrementalDiff.addChange('colors.primary', oldValue, newValue);
incrementalDiff.addChange('spacing.4', '1rem', '1.25rem');

// Get final diff
const result = incrementalDiff.compute();
```

### 2. Cached Diff

```typescript
const diffCache = new Map();

function getCachedDiff(v1: string, v2: string) {
  const key = `${v1}-${v2}`;
  
  if (!diffCache.has(key)) {
    const diff = computeDiff(v1, v2);
    diffCache.set(key, diff);
  }
  
  return diffCache.get(key);
}
```

## Next Steps

- [Platform-Specific Tokens](./platform-specific-tokens.md)
- [Token Migration Strategies](./token-migration.md)
- [Testing Token Systems](./testing-tokens.md)