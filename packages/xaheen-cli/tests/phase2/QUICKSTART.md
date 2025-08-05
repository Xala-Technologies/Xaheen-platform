# Phase 2 Quick Start Guide

## Overview

Phase 2 tests the Xaheen CLI's support for multiple frontend frameworks:
- Vue 3 + Vite
- SvelteKit
- Angular
- Solid + Vite
- Remix

## Prerequisites

1. **Build the CLI first:**
   ```bash
   cd packages/xaheen-cli
   bun run build
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

## Running Tests

### Quick Start (Unit Tests Only)
```bash
bun run test:phase2:fast
```

### Full Test Suite
```bash
bun run test:phase2
```

### By Test Type
```bash
# Unit tests only
bun run test:phase2:unit

# Integration tests only
bun run test:phase2:integration

# E2E matrix tests
bun run test:phase2:e2e

# Performance benchmarks
bun run test:phase2:performance
```

### By Framework
```bash
# Test specific frameworks
bun run test:phase2:vue
bun run test:phase2:svelte
bun run test:phase2:angular
bun run test:phase2:solid
bun run test:phase2:remix

# Matrix test (all frameworks)
bun run test:phase2:matrix
```

## Test Structure

```
phase2/
├── unit/                 # Framework preset unit tests
│   ├── vue-preset.test.ts
│   ├── svelte-preset.test.ts
│   ├── angular-preset.test.ts
│   ├── solid-preset.test.ts
│   └── remix-preset.test.ts
├── integration/          # Full scaffolding integration tests
│   ├── vue-scaffolding.test.ts
│   ├── svelte-scaffolding.test.ts
│   ├── angular-scaffolding.test.ts
│   ├── solid-scaffolding.test.ts
│   └── remix-scaffolding.test.ts
├── e2e/                  # Cross-framework E2E tests
│   └── framework-matrix.test.ts
├── performance/          # Performance benchmarks
│   └── scaffolding-matrix.test.ts
├── utils/                # Shared utilities
│   ├── framework-helpers.ts
│   └── matrix-runner.ts
└── config/               # Framework configurations
    └── frameworks.config.ts
```

## Expected Results

### Unit Tests
- ✅ Framework preset logic validation
- ✅ TypeScript configuration generation
- ✅ File structure validation
- ✅ Package.json dependency checks

### Integration Tests
- ✅ Project scaffolding
- ✅ Dependency installation
- ✅ Dev server startup
- ✅ Build process validation

### E2E Tests
- ✅ Full workflow: scaffold → install → dev → build
- ✅ Cross-framework consistency
- ✅ TypeScript support validation
- ✅ Server response validation

### Performance Tests
- ✅ Scaffolding time < 5 seconds
- ✅ Dry-run time < 1 second
- ✅ Memory usage < 100MB increase
- ✅ Cross-framework performance comparison

## Troubleshooting

### Common Issues

1. **CLI not built:**
   ```bash
   Error: CLI not built. Run "bun run build" first.
   ```
   **Solution:** Run `bun run build` in the CLI directory.

2. **Port conflicts:**
   ```bash
   Error: EADDRINUSE: address already in use :::5173
   ```
   **Solution:** Kill processes using the ports or run tests sequentially.

3. **Memory issues:**
   ```bash
   JavaScript heap out of memory
   ```
   **Solution:** Run with increased memory: `NODE_OPTIONS="--max-old-space-size=4096" bun run test:phase2`

4. **Timeout errors:**
   ```bash
   Test timeout of 30000ms exceeded
   ```
   **Solution:** Framework installation/build taking too long. Check network connection or run with `--fast` flag.

### Debug Mode

For detailed output:
```bash
DEBUG=1 bun run test:phase2
```

For individual framework debugging:
```bash
DEBUG=1 bun run test:phase2:vue --reporter=verbose
```

## Performance Benchmarks

Expected performance targets:

| Framework | Dry-run | Scaffolding | Files | Build Time |
|-----------|---------|-------------|--------|------------|
| Vue       | < 500ms | < 3s        | 15+    | < 30s      |
| SvelteKit | < 500ms | < 4s        | 12+    | < 45s      |
| Angular   | < 800ms | < 8s        | 20+    | < 60s      |
| Solid     | < 500ms | < 3s        | 10+    | < 30s      |
| Remix     | < 600ms | < 4s        | 12+    | < 45s      |

## CI Integration

Phase 2 tests are designed for CI environments:

```yaml
# .github/workflows/phase2.yml
name: Phase 2 - Frontend Frameworks
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - run: bun run test:phase2:unit

  integration-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        framework: [vue, svelte, angular, solid, remix]
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - run: bun run test:phase2:${{ matrix.framework }}

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - run: bun run test:phase2:matrix
```

## Next Steps

After Phase 2 passes:
1. Phase 3: Multi-Package-Manager Support
2. Phase 4: Backend MVP (Express, NestJS, etc.)
3. Phase 5: Frontend ↔ Backend Integration

## Support

For issues with Phase 2 tests:
1. Check the test report: `tests/phase2/test-report.json`
2. Review individual framework logs
3. Verify CLI build is current
4. Check framework-specific prerequisites