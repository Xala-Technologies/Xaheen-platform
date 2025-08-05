# Phase 1 Testing Quick Start Guide

Get up and running with Phase 1 tests in under 5 minutes!

## Prerequisites

1. Ensure you have Bun installed:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. Install dependencies (from xaheen-cli directory):
   ```bash
   bun install
   ```

3. Build the CLI:
   ```bash
   bun run build
   ```

4. Install Playwright browsers (for E2E tests):
   ```bash
   bunx playwright install chromium
   ```

## Quick Test Commands

### Run All Phase 1 Tests
```bash
bun run test:phase1
```

### Run Specific Test Types

**Unit Tests Only** (fastest, ~30s)
```bash
bun run test:phase1:unit
```

**Integration Tests** (~2 min)
```bash
bun run test:phase1:integration
```

**E2E Tests** (~5 min)
```bash
bun run test:phase1:e2e
```

**Performance Tests** (~3 min)
```bash
bun run test:phase1:performance
```

### Run with Coverage
```bash
bun run test:phase1:coverage
```

## What Each Test Validates

### Unit Tests
- ✅ Command handlers with mocked file system
- ✅ User prompt simulation
- ✅ Git operations mocking
- ✅ Error handling

### Integration Tests
- ✅ Full project scaffolding
- ✅ Dependency installation
- ✅ Dev server startup
- ✅ Build process

### E2E Tests (Playwright)
- ✅ Browser rendering
- ✅ Navigation & interactions
- ✅ Accessibility (WCAG)
- ✅ Performance metrics

### Performance Tests
- ✅ Dry-run < 500ms
- ✅ Full scaffold < 2s
- ✅ Memory usage
- ✅ Concurrent operations

## Common Issues & Solutions

### Issue: Port already in use
**Solution**: Tests use ports 4000-4104. Kill any processes using these ports:
```bash
lsof -ti:4000-4104 | xargs kill -9
```

### Issue: Playwright browser not found
**Solution**: Install Chromium:
```bash
bunx playwright install chromium
```

### Issue: Tests timeout
**Solution**: Check system resources and close unnecessary applications. Tests require:
- ~2GB free RAM
- ~1GB free disk space
- Stable internet connection (for package installation)

### Issue: Permission errors
**Solution**: Ensure you have write permissions in the test directory:
```bash
chmod -R 755 tests/phase1
```

## Test Output

Test results are saved to:
- `test-output/phase1-test-report.json` - Summary report
- `test-output/phase1-performance-report.json` - Performance metrics
- `coverage/index.html` - Coverage report (open in browser)

## CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/phase1-tests.yml
name: Phase 1 Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - run: bunx playwright install chromium
      - run: bun run test:phase1
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-output/
```

## Debug Mode

Run tests with verbose output:
```bash
XAHEEN_TEST_VERBOSE=true bun run test:phase1:unit
```

Run a specific test file:
```bash
bun run vitest run tests/phase1/unit/command-handlers.test.ts
```

## Next Steps

After Phase 1 tests pass:
1. Review test reports in `test-output/`
2. Check coverage report for gaps
3. Proceed to Phase 2 (Other Frontend Frameworks)

Happy Testing! 🚀