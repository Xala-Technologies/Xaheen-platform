# Token Versioning System

The Token Versioning System in UI System v5 provides comprehensive version control for design tokens, enabling safe updates, rollbacks, and compatibility management across different versions of your design system.

## Overview

The versioning system provides:
- Semantic versioning (SemVer) support
- Version history tracking
- Breaking change detection
- Migration utilities
- Rollback capabilities
- Version compatibility checks
- Change logs generation

## Version Structure

### Semantic Version Format

```typescript
interface TokenVersion {
  version: string; // "1.2.3"
  major: number;   // 1 - Breaking changes
  minor: number;   // 2 - New features (backward compatible)
  patch: number;   // 3 - Bug fixes
  prerelease?: string; // "beta.1", "rc.2"
  metadata?: {
    released: string;
    author: string;
    changelog: string;
    breaking: boolean;
  };
}
```

### Version Lifecycle

```typescript
import { TokenVersionManager } from '@xala-technologies/ui-system/tokens/versioning';

const versionManager = new TokenVersionManager();

// Create initial version
const v1 = versionManager.createVersion(tokens, {
  version: '1.0.0',
  author: 'Design Team',
  changelog: 'Initial release'
});

// Create minor update
const v1_1 = versionManager.createVersion(updatedTokens, {
  version: '1.1.0',
  author: 'Design Team',
  changelog: 'Added new color scales'
});

// Create patch
const v1_1_1 = versionManager.createVersion(patchedTokens, {
  version: '1.1.1',
  author: 'Design Team',
  changelog: 'Fixed color contrast issues'
});
```

## Basic Operations

### 1. Creating Versions

```typescript
import { createTokenVersion } from '@xala-technologies/ui-system/tokens/versioning';

// Manual version creation
const version = createTokenVersion(tokens, {
  version: '2.0.0',
  metadata: {
    released: new Date().toISOString(),
    author: 'John Doe',
    changelog: '- Breaking: Renamed color tokens\n- Added new spacing scale',
    breaking: true
  }
});

// Auto-increment version
const nextVersion = createTokenVersion(tokens, {
  increment: 'minor', // 'major', 'minor', 'patch'
  author: 'Jane Doe',
  changelog: 'Added new typography scale'
});
```

### 2. Version Comparison

```typescript
import { compareVersions, isCompatible } from '@xala-technologies/ui-system/tokens/versioning';

const v1 = { version: '1.2.3' };
const v2 = { version: '2.0.0' };

// Compare versions
const comparison = compareVersions(v1, v2);
console.log(comparison); // -1 (v1 < v2)

// Check compatibility
const compatible = isCompatible(v1, v2, {
  strategy: 'minor' // Allow minor updates
});
console.log(compatible); // false (major version changed)
```

### 3. Version History

```typescript
import { TokenVersionHistory } from '@xala-technologies/ui-system/tokens/versioning';

const history = new TokenVersionHistory();

// Add versions to history
history.add(v1_0_0);
history.add(v1_1_0);
history.add(v2_0_0);

// Query history
const latest = history.getLatest();
const stable = history.getLatestStable(); // Excludes prereleases
const byTag = history.getByTag('v1.1.0');
const range = history.getRange('>=1.0.0 <2.0.0');

// Get changelog between versions
const changelog = history.getChangelog('1.0.0', '2.0.0');
```

## Advanced Features

### 1. Breaking Change Detection

```typescript
import { detectBreakingChanges } from '@xala-technologies/ui-system/tokens/versioning';

const changes = detectBreakingChanges(oldTokens, newTokens);

if (changes.hasBreaking) {
  console.log('Breaking changes detected:');
  changes.breaking.forEach(change => {
    console.log(`- ${change.path}: ${change.type} (${change.description})`);
  });
  
  // Example output:
  // - colors.primary: renamed (primary -> brand)
  // - spacing.xs: removed (no replacement)
  // - typography.scale: type-changed (number -> string)
}

// Automatic version suggestion
const suggestedVersion = changes.suggestVersion(currentVersion);
console.log(`Suggested version: ${suggestedVersion}`); // e.g., "2.0.0" for breaking changes
```

### 2. Migration Utilities

```typescript
import { createMigration, applyMigration } from '@xala-technologies/ui-system/tokens/versioning';

// Create migration from v1 to v2
const migration = createMigration({
  from: '1.0.0',
  to: '2.0.0',
  transforms: [
    // Rename tokens
    { type: 'rename', from: 'colors.primary', to: 'colors.brand' },
    
    // Transform values
    { 
      type: 'transform', 
      path: 'spacing.*',
      transform: (value) => `${parseFloat(value) / 16}rem`
    },
    
    // Add new tokens with defaults
    { 
      type: 'add',
      tokens: {
        'colors.surface': '#ffffff',
        'colors.surface-alt': '#f9fafb'
      }
    },
    
    // Remove deprecated tokens
    { type: 'remove', paths: ['legacy.*'] }
  ]
});

// Apply migration
const migratedTokens = applyMigration(oldTokens, migration);

// Generate migration guide
const guide = migration.generateGuide();
console.log(guide);
// Output:
// Migration Guide: v1.0.0 → v2.0.0
// 
// Renamed tokens:
// - colors.primary → colors.brand
// 
// Value transformations:
// - All spacing values converted from px to rem
// 
// New tokens added:
// - colors.surface: #ffffff
// - colors.surface-alt: #f9fafb
// 
// Removed tokens:
// - legacy.* (all legacy tokens)
```

### 3. Version Branches

```typescript
import { TokenVersionBranch } from '@xala-technologies/ui-system/tokens/versioning';

// Create experimental branch
const experimental = new TokenVersionBranch('experimental', {
  baseVersion: '1.2.0',
  description: 'Testing new color system'
});

// Add changes to branch
experimental.update(experimentalTokens, {
  message: 'Add new color scale'
});

// Merge back to main
const merged = experimental.merge('main', {
  strategy: 'squash',
  version: '1.3.0',
  changelog: 'New color system from experimental branch'
});
```

### 4. Version Tags and Releases

```typescript
import { TokenReleaseManager } from '@xala-technologies/ui-system/tokens/versioning';

const releaseManager = new TokenReleaseManager();

// Create release
const release = releaseManager.createRelease({
  version: '2.0.0',
  tokens: currentTokens,
  notes: `
# Version 2.0.0

## Breaking Changes
- Renamed color tokens for consistency
- Removed deprecated spacing values

## New Features
- Added dark mode color scales
- New typography system

## Bug Fixes
- Fixed color contrast issues
  `,
  assets: [
    { name: 'tokens.json', content: serializedTokens },
    { name: 'tokens.css', content: cssVariables },
    { name: 'migration-guide.md', content: migrationGuide }
  ]
});

// Tag release
releaseManager.tag(release, ['latest', 'stable']);

// Publish release
await releaseManager.publish(release, {
  npm: true,
  github: true,
  cdn: true
});
```

### 5. Version Compatibility Matrix

```typescript
import { CompatibilityMatrix } from '@xala-technologies/ui-system/tokens/versioning';

// Define compatibility rules
const matrix = new CompatibilityMatrix({
  '1.x': {
    compatible: ['1.*'],
    partial: ['2.0-2.3'],
    incompatible: ['2.4+', '3.*']
  },
  '2.x': {
    compatible: ['2.*'],
    partial: ['3.0-3.2'],
    incompatible: ['1.*', '3.3+']
  }
});

// Check compatibility
const canUpgrade = matrix.canUpgrade('1.5.0', '2.1.0');
const compatibility = matrix.getCompatibility('1.5.0', '2.1.0');
console.log(compatibility); // { level: 'partial', migrations: [...] }
```

## Version Storage

### 1. File-Based Storage

```typescript
import { FileVersionStore } from '@xala-technologies/ui-system/tokens/versioning';

const store = new FileVersionStore({
  directory: './tokens/versions',
  format: 'json'
});

// Save version
await store.save(version);

// Load version
const loaded = await store.load('1.2.3');

// List versions
const versions = await store.list();

// Directory structure:
// tokens/versions/
// ├── 1.0.0.json
// ├── 1.1.0.json
// ├── 1.2.0.json
// └── 2.0.0.json
```

### 2. Git-Based Storage

```typescript
import { GitVersionStore } from '@xala-technologies/ui-system/tokens/versioning';

const gitStore = new GitVersionStore({
  repo: './design-tokens',
  branch: 'main',
  tagsPrefix: 'v'
});

// Create version as Git tag
await gitStore.createVersion(tokens, {
  version: '1.2.3',
  message: 'Release v1.2.3'
});

// Load version from Git tag
const version = await gitStore.loadVersion('v1.2.3');

// Get version history from Git
const history = await gitStore.getHistory();
```

### 3. Database Storage

```typescript
import { DatabaseVersionStore } from '@xala-technologies/ui-system/tokens/versioning';

const dbStore = new DatabaseVersionStore({
  connection: process.env.DATABASE_URL,
  table: 'token_versions'
});

// Save with metadata
await dbStore.save(version, {
  published: true,
  environment: 'production',
  approvedBy: 'design-team'
});

// Query versions
const productionVersions = await dbStore.query({
  environment: 'production',
  published: true,
  since: '2024-01-01'
});
```

## Version Management UI

### 1. Version Selector Component

```typescript
import { VersionSelector } from '@xala-technologies/ui-system/components';

function TokenVersionSelector() {
  const [currentVersion, setCurrentVersion] = useState('latest');
  const { versions, loadVersion } = useTokenVersions();
  
  const handleVersionChange = async (version: string) => {
    setCurrentVersion(version);
    await loadVersion(version);
  };
  
  return (
    <VersionSelector
      versions={versions}
      current={currentVersion}
      onChange={handleVersionChange}
      showPrerelease={true}
      showChangelog={true}
    />
  );
}
```

### 2. Version Timeline

```typescript
import { VersionTimeline } from '@xala-technologies/ui-system/components';

function TokenVersionHistory() {
  const { history } = useTokenVersions();
  
  return (
    <VersionTimeline
      versions={history}
      onVersionClick={(version) => {
        console.log('Selected version:', version);
      }}
      showBreakingChanges={true}
      showAuthors={true}
    />
  );
}
```

### 3. Version Comparison View

```typescript
import { VersionComparison } from '@xala-technologies/ui-system/components';

function CompareVersions() {
  const [v1, setV1] = useState('1.0.0');
  const [v2, setV2] = useState('2.0.0');
  
  return (
    <VersionComparison
      version1={v1}
      version2={v2}
      showDiff={true}
      showMigrationPath={true}
      onMigrate={(migration) => {
        console.log('Apply migration:', migration);
      }}
    />
  );
}
```

## CI/CD Integration

### 1. Automated Version Bumping

```yaml
# .github/workflows/version-tokens.yml
name: Version Tokens

on:
  push:
    branches: [main]
    paths:
      - 'tokens/**'

jobs:
  version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Detect changes
        id: changes
        run: |
          npx @xala-technologies/ui-system detect-token-changes
          
      - name: Bump version
        run: |
          npx @xala-technologies/ui-system version-tokens \
            --increment ${{ steps.changes.outputs.increment }} \
            --message "${{ github.event.head_commit.message }}"
            
      - name: Create release
        if: steps.changes.outputs.breaking == 'true'
        run: |
          npx @xala-technologies/ui-system release-tokens \
            --version ${{ steps.changes.outputs.version }} \
            --notes "Breaking changes detected"
```

### 2. Version Validation

```typescript
// validate-version.ts
import { validateVersion } from '@xala-technologies/ui-system/tokens/versioning';

async function validateTokenVersion() {
  const validation = await validateVersion(currentTokens, {
    checkBreaking: true,
    checkCompatibility: true,
    checkNaming: true,
    previousVersion: '1.0.0'
  });
  
  if (!validation.valid) {
    console.error('Version validation failed:');
    validation.errors.forEach(error => {
      console.error(`- ${error.type}: ${error.message}`);
    });
    process.exit(1);
  }
}
```

## Best Practices

### 1. Version Planning

```typescript
// Plan versions with clear milestones
const versionPlan = {
  '1.0.0': {
    date: '2024-01-01',
    features: ['Initial release', 'Core token set'],
    breaking: false
  },
  '1.1.0': {
    date: '2024-02-01',
    features: ['Dark mode tokens', 'New spacing scale'],
    breaking: false
  },
  '2.0.0': {
    date: '2024-03-01',
    features: ['New color system', 'Token structure redesign'],
    breaking: true,
    migration: 'v1-to-v2'
  }
};
```

### 2. Deprecation Strategy

```typescript
// Mark tokens for deprecation
const deprecatedTokens = {
  'colors.legacy': {
    value: '#old-color',
    deprecated: {
      since: '1.5.0',
      removal: '2.0.0',
      replacement: 'colors.brand',
      message: 'Use colors.brand instead'
    }
  }
};

// Deprecation warnings
function checkDeprecations(usedTokens: string[]) {
  usedTokens.forEach(token => {
    const deprecation = getDeprecation(token);
    if (deprecation) {
      console.warn(
        `Token "${token}" is deprecated since v${deprecation.since}. ` +
        `It will be removed in v${deprecation.removal}. ` +
        `${deprecation.message}`
      );
    }
  });
}
```

### 3. Version Documentation

```typescript
// Generate version documentation
import { generateVersionDocs } from '@xala-technologies/ui-system/tokens/versioning';

const docs = generateVersionDocs(version, {
  format: 'markdown',
  includeMigration: true,
  includeChangelog: true,
  includeExamples: true
});

fs.writeFileSync(`docs/versions/${version.version}.md`, docs);
```

## Testing Versioned Tokens

```typescript
import { testVersionCompatibility } from '@xala-technologies/ui-system/test-utils';

describe('Token Version Compatibility', () => {
  it('should maintain backward compatibility', () => {
    const result = testVersionCompatibility({
      from: '1.0.0',
      to: '1.1.0',
      tokens: currentTokens
    });
    
    expect(result.compatible).toBe(true);
    expect(result.breaking).toHaveLength(0);
  });
  
  it('should detect breaking changes', () => {
    const result = testVersionCompatibility({
      from: '1.0.0',
      to: '2.0.0',
      tokens: currentTokens
    });
    
    expect(result.breaking).toContain({
      path: 'colors.primary',
      type: 'renamed',
      to: 'colors.brand'
    });
  });
});
```

## Next Steps

- [Token Diffing](./token-diffing.md)
- [Platform-Specific Tokens](./platform-specific-tokens.md)
- [Token Migration Strategies](./token-migration.md)