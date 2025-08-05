# Phase 3: Multi-Package-Manager Support Testing

This phase validates that the Xaheen CLI works correctly with all major package managers and handles edge cases like monorepos and lockfile detection.

## Test Coverage

### Package Manager Support
- ✅ **npm** - Default Node.js package manager
- ✅ **yarn** - Facebook's package manager (Classic and Berry)
- ✅ **pnpm** - Fast, disk space efficient package manager
- ✅ **bun** - All-in-one JavaScript runtime and package manager

### Test Scenarios

#### 1. Environment Detection (`environment-detection/`)
- Automatic detection of available package managers
- Fallback logic when preferred manager is not available
- Version compatibility checks

#### 2. Integration Tests (`integration/`)
- Complete workflow for each manager: scaffold → install → dev smoke test
- Cross-platform compatibility (macOS, Linux, Windows)
- Performance benchmarks for each manager

#### 3. Edge Cases (`edge-cases/`)
- **Lockfile scenarios**: yarn.lock only, package-lock.json only, pnpm-lock.yaml only
- **Monorepo detection**: pnpm-workspace.yaml, yarn workspaces, npm workspaces
- **Mixed environments**: Different managers in parent/child directories

#### 4. Environment Variables (`environment-variables/`)
- `XAHEEN_PKG_MANAGER` override testing
- Invalid manager specified scenarios
- Environment precedence rules

#### 5. Performance (`performance/`)
- Installation speed benchmarks
- Memory usage comparison
- Concurrent operation handling

## Running Tests

### Individual Test Suites
```bash
# Run all Phase 3 tests
npm run test:phase3

# Run specific test categories
npm run test:phase3:environment
npm run test:phase3:integration
npm run test:phase3:edge-cases
npm run test:phase3:env-vars
npm run test:phase3:performance
```

### Prerequisites
Make sure you have all package managers installed:
```bash
# Install package managers for testing
npm install -g yarn pnpm
curl -fsSL https://bun.sh/install | bash
```

### Test Environment Setup
Tests use temporary directories and mock configurations to avoid interference with your development environment.

## Test Structure

```
phase3/
├── README.md                     # This file
├── run-phase3-tests.ts          # Main test runner
├── config/
│   ├── test-config.ts           # Shared test configuration
│   └── vitest.config.ts         # Vitest configuration
├── environment-detection/
│   ├── manager-detection.test.ts
│   ├── version-compatibility.test.ts
│   └── fallback-logic.test.ts
├── integration/
│   ├── npm-integration.test.ts
│   ├── yarn-integration.test.ts
│   ├── pnpm-integration.test.ts
│   └── bun-integration.test.ts
├── edge-cases/
│   ├── lockfile-scenarios.test.ts
│   ├── monorepo-detection.test.ts
│   └── mixed-environments.test.ts
├── environment-variables/
│   ├── xaheen-pkg-manager.test.ts
│   ├── invalid-manager.test.ts
│   └── precedence-rules.test.ts
├── performance/
│   ├── installation-benchmarks.test.ts
│   ├── memory-usage.test.ts
│   └── concurrent-operations.test.ts
├── fixtures/
│   ├── sample-projects/         # Test project templates
│   ├── lockfiles/              # Various lockfile scenarios
│   └── monorepo-configs/       # Workspace configurations
└── utils/
    ├── package-manager-utils.ts
    ├── test-project-helpers.ts
    └── performance-helpers.ts
```

## Expected Outcomes

After successful Phase 3 testing:

1. **Manager Detection**: CLI correctly identifies available package managers
2. **Installation Flows**: All managers can install dependencies without errors
3. **Development Servers**: Generated projects start successfully with each manager
4. **Edge Case Handling**: Proper behavior in complex scenarios (monorepos, mixed lockfiles)
5. **Environment Variables**: Override mechanisms work as documented
6. **Performance**: Acceptable performance benchmarks for all managers

## Integration with CI/CD

These tests are designed to run in CI environments with matrix builds:

```yaml
strategy:
  matrix:
    package-manager: [npm, yarn, pnpm, bun]
    os: [ubuntu-latest, macos-latest, windows-latest]
```

## Debugging

Enable verbose logging:
```bash
DEBUG=xaheen:package-manager npm run test:phase3
```

View detailed test reports:
```bash
npm run test:phase3 -- --reporter=verbose
```