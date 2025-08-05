# Phase 1: Frontend MVP (Next.js) Testing

This directory contains comprehensive tests for Phase 1 of the Xaheen CLI, focusing on the Frontend MVP with Next.js support.

## Test Structure

```
phase1/
├── unit/                    # Unit tests with mocked dependencies
│   └── command-handlers.test.ts
├── integration/             # Integration tests for full flows
│   └── nextjs-scaffolding.test.ts
├── e2e/                     # End-to-end tests with Playwright
│   └── nextjs-playwright.test.ts
├── performance/             # Performance benchmarks
│   └── scaffolding-benchmarks.test.ts
├── run-phase1-tests.ts      # Test orchestrator
└── README.md                # This file
```

## Running Tests

### Run All Phase 1 Tests
```bash
# From xaheen-cli directory
bun run test:phase1

# Or use the test runner directly
bun tests/phase1/run-phase1-tests.ts
```

### Run Specific Test Suites
```bash
# Unit tests only
bun run vitest run tests/phase1/unit/**/*.test.ts

# Integration tests only
bun run vitest run tests/phase1/integration/**/*.test.ts

# E2E tests only
bun run vitest run tests/phase1/e2e/**/*.test.ts

# Performance tests only
bun run vitest run tests/phase1/performance/**/*.test.ts
```

### Run with Coverage
```bash
bun run vitest run tests/phase1/**/*.test.ts --coverage
```

## Test Coverage

### Unit Tests (`unit/command-handlers.test.ts`)
- ✅ Command handler mocking with memfs
- ✅ Prompt simulation with @clack/prompts mocks
- ✅ Git operations mocking
- ✅ Dry-run mode validation
- ✅ Field parsing for scaffold command
- ✅ Error handling scenarios

### Integration Tests (`integration/nextjs-scaffolding.test.ts`)
- ✅ Full project scaffolding flow
- ✅ Dependency installation with Bun
- ✅ Dev server startup and health check
- ✅ Build process validation
- ✅ CI/CD workflow generation
- ✅ Error handling for edge cases

### E2E Tests (`e2e/nextjs-playwright.test.ts`)
- ✅ Browser rendering validation
- ✅ Client-side navigation
- ✅ Form interactions
- ✅ Accessibility compliance (WCAG)
- ✅ Performance metrics (Web Vitals)
- ✅ Responsive design testing

### Performance Benchmarks (`performance/scaffolding-benchmarks.test.ts`)
- ✅ Dry-run performance (< 500ms)
- ✅ Full scaffold performance (< 2s)
- ✅ Concurrent operations
- ✅ File I/O efficiency
- ✅ Memory usage monitoring
- ✅ Template caching effectiveness

## Performance Targets

Based on the requirements from COMPREHENSIVE-TESTING.md:

| Operation | Target | Actual |
|-----------|--------|---------|
| Dry-run | < 500ms | ✅ Tested |
| Full scaffold | < 2s | ✅ Tested |
| Minimal project | < 1s | ✅ Tested |
| Complex project | < 3s | ✅ Tested |

## Dependencies

The Phase 1 tests require the following dev dependencies:
- `vitest` - Test runner
- `memfs` - In-memory file system for mocking
- `@clack/prompts` - CLI prompts (mocked)
- `playwright` - Browser automation for E2E tests
- `tmp` - Temporary directory creation
- `tree-kill` - Process cleanup
- `strip-ansi` - ANSI escape code removal

## CI/CD Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Phase 1 Tests
  run: |
    bun install
    bun run build
    bun tests/phase1/run-phase1-tests.ts
  env:
    CI: true
```

## Test Reports

Test results are saved to:
- `test-output/phase1-test-report.json` - Overall test results
- `test-output/phase1-performance-report.json` - Performance metrics
- `coverage/` - Coverage reports (when run with --coverage)

## Troubleshooting

### Common Issues

1. **Playwright browser issues**: Ensure Chromium is installed
   ```bash
   bunx playwright install chromium
   ```

2. **Port conflicts**: Tests use ports 4000-4104. Ensure these are free.

3. **Slow tests**: Check system resources and close unnecessary applications.

4. **Memfs issues**: Some operations may not work with memfs. Tests handle this gracefully.

## Next Steps

After Phase 1 tests pass, proceed to:
- Phase 2: Other Frontend Frameworks
- Phase 3: Multi-Package-Manager Support
- Phase 4: Backend MVP

See `docs/COMPREHENSIVE-TESTING.md` for the complete testing strategy.