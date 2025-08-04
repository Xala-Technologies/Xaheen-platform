Here’s a comprehensive testing strategy for Xaheen’s CLI, covering every layer from individual commands through full end-to-end workflows, performance and security:

---

## 1. Unit Tests for Command Handlers

* **Framework:** Jest or Vitest
* **What to test:**

  * Argument parsing: valid flags, missing args, help text.
  * Command logic: for each `xaheen new`, `generate`, `add`, `ai code`, `validate` handler, assert you call the right internal functions with correct parameters.
  * Error paths: simulate invalid inputs or missing config and assert you throw or exit with helpful messages.
* **Mocks:**

  * File system (fs) ops with [memfs](https://github.com/streamich/memfs) or Jest’s `jest.mock('fs')`.
  * External services: stub out the MCP client and Codebuff’s `runCodebuff()` to return controlled patches or errors.

## 2. Integration Tests on File System

* **Sandbox Folder:** create a temp directory per test (e.g. via `tmpdir`)
* **Test cases:**

  1. **`xaheen new`**:

     * Assert project skeleton created (config files, folder structure).
     * Assert a `.codebuff` index file is generated.
  2. **`xaheen generate model User --fields=name:string`**:

     * Verify that `models/User.ts` exists and contains correct interface/class.
  3. **`xaheen ai code “…”`** (with mocked Codebuff):

     * Ensure the returned patch is previewed but only applied when “accepted” in tests.
     * Verify Git commit is created in sandbox.
* **Idempotency:** re-run same command and assert no duplicate files or conflicts.
* **Dry-run mode:** `--dry-run` should leave disk untouched but report what would change.

## 3. End-to-End (E2E) CLI Workflows

* **Harness:** a simple shell-script runner (e.g. with [execa](https://github.com/sindresorhus/execa))
* **Scenarios:**

  1. **New → Generate → Add → AI → Validate**
  2. **Multi-tenant setup:** `new --preset=multi-tenant` → `generate tenant Admin` → `add payments --provider=vipps` → validate configs.
* **Assertions:**

  * Exit codes are zero on success.
  * Final project passes `npm test` and `npm run lint`.
  * Compliance report exists and flags no critical issues.

## 4. Performance & Load Testing

* **Benchmark cold vs. warm starts:**

  * Measure time of a fresh `xaheen` process vs. subsequent commands in the same session.
* **Stress tests:**

  * Spawn 10 parallel `xaheen generate component X` commands in different temp folders; measure latency and CPU/memory usage.
* **AI Integration profiling:**

  * Stub MCP/Codebuff to add artificial delays; measure where time is spent and add caching if needed.

## 5. Security & Compliance Testing

* **Vulnerability scanning:** run `npm audit`, Snyk, ESLint Security plugin on generated code. Assert zero high/critical findings.
* **Secret leaks:** scan output files to ensure no hard-coded credentials or tokens.
* **Input sanitization:** feed the CLI malicious or malformed inputs (e.g. name with `../`, JS injection) and assert it rejects or sanitizes appropriately.
* **Compliance reporting:** generate a report (`xaheen validate --compliance`) and assert known compliance items (GDPR, NSM) are flagged or passed as expected.

---

### CI/CD Integration

* **GitHub Actions / GitLab CI**:

  * **Unit & Integration:** run on every push.
  * **E2E:** on merge to main, spin up a VM, run full scenarios.
  * **Performance & Security Gates:** fail build if E2E errors, performance regressions >10%, or high-severity vulnerabilities detected.

By layering tests—from isolated units through holistic workflows—and baking performance and security checks into CI, you’ll ensure each release of the Xaheen CLI remains rock-solid, performant, and enterprise-compliant.
