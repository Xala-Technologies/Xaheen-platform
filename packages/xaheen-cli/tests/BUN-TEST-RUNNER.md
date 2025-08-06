# Bun Test Runner for Xaheen CLI

This directory contains comprehensive test runners specifically designed to work with Bun's test runner, bypassing import issues and providing detailed reporting.

## Scripts

### 1. `run-all-tests-bun.ts` - Comprehensive Test Runner

This script runs all test phases in order, with proper mocking and comprehensive reporting.

**Features:**
- Runs all 11 test phases (Phase 0-10)
- Mocks problematic dependencies (@xala-technologies/xala-mcp)
- Generates HTML, JSON, and Markdown reports
- Handles failures gracefully and continues running
- Provides detailed test statistics per phase
- Identifies critical vs non-critical failures

**Usage:**
```bash
# Run all tests
bun run tests/run-all-tests-bun.ts

# Or make it executable and run directly
./tests/run-all-tests-bun.ts
```

**Output:**
- Console output with real-time progress
- `results/bun-test-results.json` - Detailed JSON report
- `results/bun-test-report.html` - Interactive HTML report
- `results/bun-test-report.md` - Markdown report

### 2. `run-available-tests.ts` - Quick Test Runner

This script automatically discovers and runs only the test files that exist in your test directories.

**Features:**
- Auto-discovers all `*.test.ts` files
- Groups tests by phase
- Lightweight and fast
- Useful for quick validation
- Provides concise output

**Usage:**
```bash
# Run available tests
bun run tests/run-available-tests.ts

# Or make it executable and run directly
./tests/run-available-tests.ts
```

**Output:**
- Console output with test results
- `results/quick-test-results.json` - Summary report

## Test Phases

The test runner covers the following phases:

1. **Phase 0**: Core & Installation
   - Basic validation, help commands, installation tests
   
2. **Phase 1**: Next.js Support
   - Next.js scaffolding and configuration
   
3. **Phase 2**: Framework Matrix
   - Vue, Angular, Svelte, Solid, Remix support
   
4. **Phase 3**: Package Manager Intelligence
   - npm, yarn, pnpm, bun detection and handling
   
5. **Phase 4**: Backend Framework Support
   - Express, NestJS, Fastify, Hono
   
6. **Phase 5**: Full-Stack Features
   - Monorepo, API client generation
   
7. **Phase 6**: Integrations
   - Auth (JWT, OAuth2), Payments (Stripe)
   
8. **Phase 7**: SaaS & Multi-Tenancy
   - Multi-tenant scaffolding, RBAC, licensing
   
9. **Phase 8**: Plugins & Marketplace
   - Plugin system and version compatibility
   
10. **Phase 9**: Security & Code Quality
    - Security scanning, static analysis
    
11. **Phase 10**: Norwegian Compliance
    - BankID, Altinn, Digipost, GDPR

## Mocking Strategy

The test runners automatically mock problematic dependencies:

```typescript
// Mocked modules:
- @xala-technologies/xala-mcp
- playwright (for E2E tests)
- @opentelemetry/api (for telemetry)
```

This ensures tests can run even if dependencies are not fully configured.

## Report Interpretation

### Success Rate
- **80-100%**: ✅ Excellent - Ready for deployment
- **60-79%**: ⚠️ Warning - Review failures
- **0-59%**: ❌ Critical - Major issues need fixing

### Critical vs Non-Critical
- **Critical failures**: Block deployment (core functionality)
- **Non-critical failures**: Can proceed with caution (optional features)

## Troubleshooting

### Import Errors
The runners automatically mock problematic imports. If you encounter new import errors:
1. Add the module to the MOCK_SETUP in the runner
2. Provide minimal mock implementation

### Timeout Issues
Default timeouts:
- Per test file: 60 seconds
- Per phase: 5-15 minutes

Adjust in the TEST_PHASES configuration if needed.

### Missing Tests
Use `run-available-tests.ts` to discover which test files actually exist and can be run.

## Adding New Tests

1. Place test files in the appropriate phase directory
2. Follow naming convention: `*.test.ts`
3. Use Bun test syntax:
   ```typescript
   import { describe, it, expect } from 'bun:test';
   ```

## CI/CD Integration

```yaml
# Example GitHub Actions
- name: Run Bun Tests
  run: bun run tests/run-all-tests-bun.ts
  
- name: Upload Test Reports
  uses: actions/upload-artifact@v3
  with:
    name: test-reports
    path: tests/results/
```

## Performance Tips

1. Run quick validation first:
   ```bash
   bun run tests/run-available-tests.ts
   ```

2. Run specific phases:
   - Modify TEST_PHASES array in the runner
   - Or create phase-specific runners

3. Parallel execution:
   - Bun handles test parallelization within files
   - Phase-level parallelization can be added if needed

## Contributing

When adding new test phases or modifying the runner:
1. Update TEST_PHASES configuration
2. Ensure proper mocking for new dependencies
3. Test the runner with a subset first
4. Update this documentation

---

For issues or questions, please refer to the main Xaheen CLI documentation or open an issue in the repository.