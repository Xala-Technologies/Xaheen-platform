# Phase 0: Documentation & Distribution Validation Tests

This directory contains the Phase 0 testing infrastructure for the Xaheen CLI project, focused on validating documentation builds and distribution processes before proceeding with functionality testing.

## Test Categories

### 1. Documentation Build & Lint Tests
- Build documentation site (Docusaurus/MDX)
- Validate all pages render correctly
- Spell-check and link-check markdown files
- Ensure no build errors

### 2. Package Distribution Tests
- Pack CLI for distribution
- Dry-run publish to GitHub Packages
- Version bump validation
- Git tag creation verification

### 3. Installation Tests
- Install from staging registry
- Verify version output
- Check for unexpected dependencies
- Validate binary execution

### 4. Smoke Tests
- Basic CLI help commands
- License status checks
- Project validation in empty directories
- Error handling verification

## Running Tests

### Individual Test Suites
```bash
# Documentation tests
bun run test:phase0:docs

# Distribution tests
bun run test:phase0:distribution

# Installation tests
bun run test:phase0:installation

# Smoke tests
bun run test:phase0:smoke
```

### All Phase 0 Tests
```bash
# Run all Phase 0 tests
bun run test:phase0

# Run with CI configuration
bun run test:phase0:ci
```

## Test Structure

```
tests/phase0/
├── README.md
├── config/
│   ├── test-config.ts
│   └── vitest.config.ts
├── docs/
│   ├── build-docs.test.ts
│   ├── lint-docs.test.ts
│   └── link-check.test.ts
├── distribution/
│   ├── package-build.test.ts
│   ├── publish-dry-run.test.ts
│   └── version-validation.test.ts
├── installation/
│   ├── install-from-registry.test.ts
│   └── binary-validation.test.ts
├── smoke/
│   ├── help-commands.test.ts
│   ├── license-status.test.ts
│   └── basic-validation.test.ts
├── utils/
│   ├── test-helpers.ts
│   ├── registry-helpers.ts
│   └── process-helpers.ts
└── scripts/
    ├── run-phase0-tests.ts
    ├── setup-test-env.ts
    └── cleanup-test-env.ts
```

## CI/CD Integration

These tests are designed to run in both local development and CI/CD environments:

- **Local Development**: Quick feedback during development
- **Pre-commit Hooks**: Validate documentation changes
- **CI Pipeline**: Gate for distribution and release processes
- **Release Pipeline**: Final validation before package publishing

## Requirements

- Bun as package manager
- Node.js 18+
- Git repository access
- GitHub Packages registry access (for distribution tests)

## Environment Variables

```bash
# GitHub Packages configuration
GITHUB_TOKEN=your_github_token
GITHUB_REGISTRY=https://npm.pkg.github.com
GITHUB_ORG=your_organization

# Test configuration
TEST_TIMEOUT=30000
TEST_RETRY_COUNT=3
CLEANUP_ON_EXIT=true
```