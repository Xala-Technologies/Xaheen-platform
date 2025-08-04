# Xaheen CLI Test Suite

This comprehensive test suite ensures the Xaheen CLI is rock-solid, performant, and enterprise-compliant across all environments and use cases.

## Test Architecture

The test suite is organized into five distinct layers, each with specific responsibilities:

### 1. Unit Tests (`*.unit.test.ts`)
- **Purpose**: Fast feedback on individual components
- **Framework**: Vitest with extensive mocking
- **Coverage**: Command parsers, handlers, utilities, and business logic
- **Execution Time**: < 30 seconds
- **Dependencies**: All external services mocked

**Example:**
```typescript
// Tests command parsing with mocked dependencies
describe("CommandParser", () => {
  it("should parse project create command correctly", async () => {
    const result = await parser.parse(["project", "create", "test-app"]);
    expect(result.domain).toBe("project");
    expect(result.action).toBe("create");
  });
});
```

### 2. Integration Tests (`*.integration.test.ts`)
- **Purpose**: Test interactions between components with real file system
- **Framework**: Vitest with temporary directories
- **Coverage**: File operations, template generation, service integration
- **Execution Time**: 2-5 minutes
- **Dependencies**: Real file system, mocked external APIs

**Example:**
```typescript
// Tests actual file creation and project structure
describe("Project Creation Integration", () => {
  it("should create complete Next.js project structure", async () => {
    await createProject("test-nextjs", { preset: "nextjs" });
    
    await expect(fs.pathExists("test-nextjs/package.json")).resolves.toBe(true);
    await expect(fs.pathExists("test-nextjs/src/app/page.tsx")).resolves.toBe(true);
  });
});
```

### 3. End-to-End Tests (`*.e2e.test.ts`)
- **Purpose**: Complete user workflows from CLI invocation to final result
- **Framework**: Vitest with execa for real CLI execution
- **Coverage**: Full command workflows, error handling, user scenarios
- **Execution Time**: 5-15 minutes
- **Dependencies**: Built CLI binary, real file system

**Example:**
```typescript
// Tests complete CLI workflows as a user would experience
describe("Complete CLI Workflows", () => {
  it("should complete full project lifecycle", async () => {
    // New → Generate → Add → Validate
    await runCLI(["project", "create", "my-app", "--preset", "saas"]);
    await runCLI(["make:model", "User", "--migration"]);
    await runCLI(["service", "add", "auth"]);
    
    const result = await runCLI(["project", "validate"]);
    expect(result.exitCode).toBe(0);
  });
});
```

### 4. Performance Tests (`*.performance.test.ts`)
- **Purpose**: Benchmark performance and detect regressions
- **Framework**: Vitest with performance measurement utilities
- **Coverage**: Startup time, command execution speed, memory usage, scalability
- **Execution Time**: 10-30 minutes
- **Dependencies**: Performance measurement tools, built CLI

**Example:**
```typescript
// Benchmarks CLI performance across different scenarios
describe("CLI Performance", () => {
  it("should start within 3 seconds on average", async () => {
    const times = await measureStartupTimes(5);
    const average = times.reduce((a, b) => a + b) / times.length;
    
    expect(average).toBeLessThan(3000);
  });
});
```

### 5. Security Tests (`*.security.test.ts`)
- **Purpose**: Ensure security best practices and compliance
- **Framework**: Vitest with security-focused utilities
- **Coverage**: Input sanitization, vulnerability scanning, compliance checks
- **Execution Time**: 5-10 minutes
- **Dependencies**: Security scanning tools, compliance validators

**Example:**
```typescript
// Tests security vulnerabilities and compliance
describe("Security Tests", () => {
  it("should prevent directory traversal attacks", async () => {
    const result = await runCLI(["make:component", "../../../etc/passwd"]);
    
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Invalid");
  });
});
```

## Running Tests

### Quick Test Commands

```bash
# Run all tests (comprehensive suite)
npm run test:all

# Run specific test types
npm run test:unit              # Unit tests only (~30s)
npm run test:integration       # Integration tests (~3m)
npm run test:e2e              # End-to-end tests (~10m)
npm run test:performance      # Performance benchmarks (~20m)
npm run test:security         # Security & compliance (~5m)

# Development workflows
npm run test:watch            # Watch mode for development
npm run test:coverage         # Generate coverage report
npm run test:ci               # CI-optimized test run
```

### Comprehensive Test Runner

The `npm run test:all` command uses our custom test runner that:

- ✅ Runs tests in optimal order (fast → slow)
- ✅ Provides real-time progress updates
- ✅ Generates comprehensive HTML and JSON reports
- ✅ Handles graceful failure recovery
- ✅ Tracks performance across runs
- ✅ Integrates with CI/CD pipelines

**Output Example:**
```
🧪 Xaheen CLI Comprehensive Test Suite
============================================================

🔄 Running Build...
   ✅ Build passed (2.1s)

🔄 Running Unit Tests...
   ✅ Unit Tests passed (18.4s)

🔄 Running Integration Tests...
   ✅ Integration Tests passed (2m 14s)

📊 Test Summary
============================================================
Results:
  ✅ PASS   Build                   2.1s
  ✅ PASS   Unit Tests             18.4s  
  ✅ PASS   Integration Tests       2m 14s
  ✅ PASS   E2E Tests              8m 32s
  ⚠️ WARN   Performance Tests      15m 2s
  ✅ PASS   Security Tests         3m 45s

Statistics:
  Total: 6
  Passed: 5
  Failed: 0  
  Warnings: 1
  Success Rate: 100%
  Total Duration: 29m 53s
```

## Test Configuration

### Environment Variables

```bash
# Disable CLI banner in tests
XAHEEN_NO_BANNER=true

# Skip telemetry in CI
XAHEEN_SKIP_TELEMETRY=true

# Enable debug logging
XAHEEN_DEBUG=true

# CI mode adjustments
CI=true
NODE_ENV=test
```

### Vitest Configuration

The test suite uses enhanced Vitest configuration:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // Global test utilities
    setupFiles: ["./src/test/setup.ts"],
    
    // Performance optimizations  
    concurrent: true,
    maxConcurrency: 4,
    
    // Enhanced reporting
    reporters: ["verbose", "json"],
    outputFile: { json: "./test-output/results.json" },
    
    // Coverage thresholds
    coverage: {
      thresholds: {
        global: { branches: 75, functions: 75, lines: 75, statements: 75 }
      }
    }
  }
});
```

## Test Utilities

### TestFileSystem
Mock and real file system operations:
```typescript
const fs = new testUtils.fs.TestFileSystem();
await fs.createTempDir("xaheen-test-");
await fs.mock({ "package.json": JSON.stringify({...}) });
```

### CLITestRunner  
Execute CLI commands in tests:
```typescript
const runner = new testUtils.cli.CLITestRunner();
const result = await runner.runCommand(["project", "create", "test"]);
expect(result.exitCode).toBe(0);
```

### PerformanceTracker
Measure and compare performance:
```typescript
const perf = new testUtils.perf.PerformanceTracker();
const endMeasure = perf.startMeasurement("operation");
// ... perform operation
const duration = endMeasure();
expect(duration).toBeLessThan(5000);
```

### TestAssertions
Enhanced assertion helpers:
```typescript
await testUtils.assert.assertFileExists("src/components/Button.tsx");
await testUtils.assert.assertFileContains("package.json", "next");
testUtils.assert.assertCommandOutput(stdout, ["success", /created \d+ files/]);
```

## CI/CD Integration

### GitHub Actions Workflow

The comprehensive testing workflow (`comprehensive-testing.yml`) provides:

- **Multi-OS Testing**: Ubuntu, Windows, macOS
- **Multi-Node Testing**: Node.js 18, 20, 22  
- **Parallel Execution**: Concurrent test suites
- **Performance Baselines**: Regression detection
- **Security Scanning**: Vulnerability detection
- **Comprehensive Reporting**: PR comments, artifacts

### Test Gates

- **Unit Tests**: Must pass for PR merge
- **Integration Tests**: Must pass for PR merge  
- **E2E Tests**: Must pass for PR merge
- **Security Tests**: Must pass (no critical vulnerabilities)
- **Performance Tests**: Warning only (doesn't block PR)

### Performance Monitoring

- **Nightly Runs**: Detect performance regressions
- **Baseline Updates**: Automatic performance baseline updates
- **Trend Analysis**: Historical performance tracking
- **Alerting**: Slack/email notifications for significant regressions

## Writing New Tests

### Test File Naming Convention

```
src/
├── commands/
│   ├── create.ts
│   ├── create.unit.test.ts          # Unit tests
│   └── create.integration.test.ts   # Integration tests
├── test/
│   ├── e2e/
│   │   └── workflows.e2e.test.ts    # E2E tests
│   ├── performance/
│   │   └── cli.performance.test.ts  # Performance tests
│   └── security/
│       └── input.security.test.ts   # Security tests
```

### Test Template

```typescript
/**
 * [Test Type] Tests for [Component Name]
 * 
 * [Description of what is being tested]
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { testUtils } from "../test-helpers.js";

describe("[Component Name] [Test Type]", () => {
  let testContext: any;

  beforeEach(async () => {
    // Setup test environment
    testContext = await setupTestContext();
  });

  afterEach(async () => {
    // Cleanup test environment  
    await cleanupTestContext(testContext);
  });

  describe("[Feature Group]", () => {
    it("should [expected behavior]", async () => {
      // Arrange
      const input = setupTestInput();
      
      // Act
      const result = await performOperation(input);
      
      // Assert
      expect(result).toMatchExpectedOutput();
    });
  });
});
```

### Best Practices

1. **Test Independence**: Each test should be completely independent
2. **Clear Naming**: Test names should describe expected behavior
3. **Comprehensive Coverage**: Test happy paths, edge cases, and error scenarios
4. **Performance Awareness**: Use appropriate timeouts and cleanup
5. **Mock Appropriately**: Mock external services but test real integrations
6. **Accessibility Testing**: Include accessibility checks in UI tests
7. **Security Focus**: Always test input validation and sanitization

## Troubleshooting

### Common Issues

**Tests hanging/timing out:**
```bash
# Increase timeout for specific test
VITEST_TIMEOUT=60000 npm run test:integration

# Check for unclosed resources
npm run test:unit -- --reporter=verbose
```

**File system permission errors:**
```bash
# Ensure proper cleanup
npm run clean
sudo rm -rf test-output/

# Check directory permissions
ls -la test-output/
```

**Performance test failures:**
```bash
# Update performance baseline
npm run test:performance -- --update-baseline

# Check system resources
htop  # or Task Manager on Windows
```

**Security test false positives:**
```bash
# Review security rules
cat src/test/security/rules.json

# Update vulnerability database
npm audit fix
```

### Debug Mode

Enable verbose debugging:
```bash
XAHEEN_DEBUG=true VITEST_DEBUG=true npm run test:all
```

This will show:
- Detailed command execution logs
- File system operations
- Performance measurements  
- Security scan details
- Mock/stub configurations

## Contributing to Tests

When adding new features to the CLI:

1. **Add Unit Tests**: Test the component in isolation
2. **Add Integration Tests**: Test file system interactions
3. **Add E2E Tests**: Test complete user workflows
4. **Consider Performance**: Add performance tests for potentially slow operations
5. **Security Review**: Add security tests for any user input handling
6. **Update Documentation**: Update this README with new test patterns

### Test Review Checklist

- [ ] Tests are independent and can run in any order
- [ ] All edge cases and error scenarios are covered
- [ ] Performance tests have reasonable thresholds
- [ ] Security tests cover input validation
- [ ] Tests clean up after themselves
- [ ] Test names clearly describe expected behavior
- [ ] Mocks are used appropriately (external services only)
- [ ] Integration tests use real file system operations
- [ ] E2E tests use the actual CLI binary

## Performance Expectations

| Test Suite | Target Duration | Max Duration |
|------------|----------------|--------------|
| Unit Tests | < 30s | < 60s |
| Integration Tests | < 5m | < 10m |
| E2E Tests | < 15m | < 30m |
| Performance Tests | < 30m | < 60m |
| Security Tests | < 10m | < 20m |
| **Total Suite** | **< 60m** | **< 3h** |

## Security Standards

The security test suite validates compliance with:

- **OWASP Top 10**: Web application security risks
- **NSM Guidelines**: Norwegian security standards
- **GDPR Requirements**: Data protection compliance
- **Input Validation**: Comprehensive sanitization testing
- **Dependency Scanning**: Known vulnerability detection
- **Secret Detection**: Hardcoded credential prevention

---

*This test suite ensures the Xaheen CLI maintains the highest standards of quality, performance, and security across all supported environments and use cases.*