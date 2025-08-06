# 🚀 Xaheen CLI CI/CD Pipeline Documentation

This directory contains the comprehensive CI/CD pipeline configuration for the Xaheen CLI project, implementing enterprise-grade testing, security, and deployment workflows.

## 📋 Overview

The pipeline implements a **phased testing approach** that validates every aspect of the Xaheen CLI from basic functionality to Norwegian/NSM compliance, ensuring enterprise-ready quality.

## 🔄 Workflows

### 1. 🧪 Comprehensive Testing Pipeline (`comprehensive-tests.yml`)

**Triggers:**
- Push to `main`, `develop`, `full-stack` branches
- Pull requests to `main`, `develop`
- Manual workflow dispatch

**Pipeline Phases:**

#### Phase 0: 📚 Documentation & Distribution
- Build and validate documentation
- Test package creation and CLI installation
- Basic smoke tests (`--help`, `--version`)
- **Gates:** Must pass before any other phase

#### Phase 1: 🧪 CLI Unit Tests
- **Coverage Requirement:** ≥ 90% code coverage
- **Matrix Strategy:** Tests across `xaheen-cli`, `mcp`, `design-system` packages
- **Validation:** Coverage threshold enforcement
- **Artifacts:** Coverage reports for analysis

#### Phase 2: 🔗 Integration Tests Matrix
- **Matrix Strategy:** 
  - Frameworks: `nextjs`, `react`, `vue`, `angular`, `svelte`
  - Package Managers: `npm`, `yarn`, `pnpm`, `bun`
- **Validation:** Full scaffold → install → build → dev server
- **Timeout:** 30 minutes per matrix combination
- **Parallelization:** Fail-fast disabled for comprehensive testing

#### Phase 3: 🚀 E2E Smoke Tests
- **Playwright Integration:** Automated browser testing
- **Framework Coverage:** `nextjs`, `react`, `vue`
- **Validation:** Real application creation, build, and HTTP response

#### Phase 4: 🔒 Security & Compliance Scans
- **Security Audits:** `npm audit`, high/critical vulnerability detection
- **Code Quality:** ESLint, TypeScript strict checking
- **Static Analysis:** Comprehensive linting across all packages

#### Phase 5: 📊 Performance Benchmarks
- **Performance Thresholds:**
  - Dry-run scaffold: `< 500ms`
  - Full scaffold: `< 2s`
- **Regression Detection:** 10% performance degradation fails the build
- **Metrics Storage:** Performance trend analysis

#### Phase 6: 🇳🇴 Norwegian/NSM Compliance
- **NSM Classifications:** OPEN, RESTRICTED, CONFIDENTIAL, SECRET
- **Norwegian Localization:** `nb-NO` locale testing
- **WCAG Compliance:** AAA accessibility standard validation
- **Conditional Execution:** Only runs if `run_compliance_tests != 'false'`

#### Phase 7: 🔒 Manual Approval Gate
- **Environment:** `production-gate` (requires manual approval)
- **Triggers:** Only on `main` branch pushes
- **Prerequisites:** All automated phases must pass

#### Phase 8: 📦 GitHub Packages Publishing
- **Registry:** `https://npm.pkg.github.com`
- **Authentication:** `GITHUB_TOKEN`
- **Packages:** All configured packages with proper `publishConfig`

### 2. 🔍 Security Scanning (`security-scan.yml`)

**Triggers:**
- Daily schedule (2 AM UTC)
- Push to `main` with dependency changes
- Manual workflow dispatch

**Security Measures:**
- **Dependency Scanning:** npm audit with severity thresholds
- **Code Analysis:** GitHub CodeQL for JavaScript/TypeScript
- **Secret Detection:** TruffleHog for credential scanning
- **Vulnerability Reporting:** Automated GitHub Issues for critical findings

### 3. 📊 Performance Monitoring (`performance-monitoring.yml`)

**Triggers:**
- Weekly schedule (Sundays, 6 AM UTC)
- Manual workflow dispatch with framework selection

**Performance Metrics:**
- **Scaffold Performance:** Multiple scenarios per framework
- **Build Performance:** Time-to-build measurement
- **Memory Profiling:** Node.js memory usage analysis
- **Trend Analysis:** Historical performance tracking

### 4. 🚀 Release Pipeline (`release.yml`)

**Triggers:**
- Git tags matching `v*.*.*`
- Manual workflow dispatch with version input

**Release Process:**
1. **Validation:** Full test suite execution
2. **Artifact Building:** Package compilation and tarball creation
3. **Release Creation:** GitHub Release with auto-generated notes
4. **Package Publishing:** GitHub Packages deployment
5. **Post-Release:** Summary and notification

### 5. 🔄 Dependency Updates (`dependency-update.yml`)

**Triggers:**
- Weekly schedule (Mondays, 9 AM UTC)
- Manual workflow dispatch with update type selection

**Update Types:**
- **Patch:** Security and bug fixes only
- **Minor:** New features, backward compatible
- **Major:** Breaking changes (manual review required)
- **All:** Complete dependency refresh

**Automation:**
- Automated PR creation for dependency updates
- Test execution post-update
- Security audit validation

## 🛠 Configuration

### Environment Variables

```yaml
NODE_VERSION: 18              # Node.js version for all jobs
TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}    # Turborepo cache token
TURBO_TEAM: ${{ secrets.TURBO_TEAM }}      # Turborepo team
GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}   # GitHub API access
NPM_TOKEN: ${{ secrets.NPM_TOKEN }}         # NPM registry access
```

### Required Secrets

| Secret | Purpose | Required For |
|--------|---------|--------------|
| `TURBO_TOKEN` | Turborepo cache acceleration | All builds |
| `TURBO_TEAM` | Turborepo team identification | All builds |
| `GITHUB_TOKEN` | GitHub API and Packages | Publishing, Security |
| `NPM_TOKEN` | NPM registry access | Alternative publishing |

### GitHub Environments

#### `production-gate`
- **Protection Rules:** Manual approval required
- **Reviewers:** Core maintainers only  
- **Purpose:** Final gate before production release

#### `npm-publish`
- **Protection Rules:** Branch protection, required reviews
- **Environment Secrets:** Package registry credentials
- **Purpose:** Secure package publishing

## 📊 Caching Strategy

### Dependency Cache
```yaml
path: |
  node_modules
  ~/.cache/bun
  ~/.turbo
  ~/.cache/yarn
  ~/.npm
  ~/.local/share/pnpm
key: ${{ runner.os }}-deps-${{ hashFiles('**/bun.lockb', '**/package.json', 'turbo.json') }}
```

### Build Cache
- **Turbo Integration:** Distributed build caching
- **Artifact Persistence:** Test results, coverage reports
- **Cache Invalidation:** Automatic on dependency changes

## 🎯 Quality Gates

### Coverage Requirements
- **Minimum Coverage:** 90% for all packages
- **Enforcement:** Build fails if threshold not met
- **Reporting:** Detailed coverage reports in artifacts

### Performance Thresholds
- **CLI Cold Start:** < 500ms (dry-run)
- **Full Scaffold:** < 2s (no install)
- **Regression Tolerance:** 10% performance degradation

### Security Standards
- **Vulnerability Tolerance:** Zero critical/high vulnerabilities
- **Code Quality:** ESLint + TypeScript strict mode
- **Secret Detection:** Zero exposed credentials

### Compliance Validation
- **NSM Classifications:** All security levels tested
- **WCAG Standards:** AAA accessibility compliance
- **Norwegian Localization:** Complete nb-NO support

## 🚨 Monitoring & Alerting

### Failure Notifications
- **GitHub Issues:** Automated creation for critical failures
- **PR Reviews:** Required approvals for security changes
- **Status Checks:** Branch protection enforcement

### Performance Monitoring
- **Trend Analysis:** Historical performance data
- **Regression Detection:** Automated threshold checking
- **Capacity Planning:** Resource usage tracking

## 🔧 Local Development

### Running Tests Locally

```bash
# Install dependencies
pnpm install

# Run unit tests with coverage
cd packages/xaheen-cli
pnpm run test:coverage

# Run integration tests
pnpm run test:integration

# Run performance benchmarks
pnpm run test:performance
```

### Pre-commit Validation

```bash
# Lint all packages
for package in packages/*/; do
  cd "$package" && pnpm run lint && cd -
done

# Type check all packages
for package in packages/*/; do
  cd "$package" && pnpm exec tsc --noEmit && cd -
done

# Security audit
bun audit
```

## 📚 Best Practices

### Workflow Development
1. **Test Locally First:** Always test workflow changes in feature branches
2. **Incremental Updates:** Small, focused workflow improvements
3. **Documentation:** Update this README with any changes
4. **Review Process:** Peer review for all CI/CD changes

### Performance Optimization
1. **Parallel Execution:** Use matrix strategies for independent tests
2. **Cache Optimization:** Leverage caching for dependency installation
3. **Timeout Management:** Set appropriate timeouts for each job
4. **Resource Limits:** Monitor runner resource usage

### Security Considerations
1. **Secret Management:** Use GitHub Secrets for sensitive data
2. **Least Privilege:** Minimal permissions for each workflow
3. **Audit Trail:** All changes tracked in version control
4. **Regular Updates:** Keep actions and dependencies current

## 🔄 Maintenance

### Regular Tasks
- **Weekly:** Review dependency updates and security alerts
- **Monthly:** Analyze performance trends and optimize thresholds
- **Quarterly:** Review and update workflow configurations
- **Annually:** Comprehensive security audit and compliance review

### Troubleshooting
- **Failed Builds:** Check logs in GitHub Actions tab
- **Performance Issues:** Review performance benchmark results
- **Security Alerts:** Address vulnerability reports immediately
- **Cache Issues:** Clear cache using GitHub Actions interface

---

## 📞 Support

For questions about the CI/CD pipeline:
1. Check workflow run logs in GitHub Actions
2. Review this documentation
3. Create an issue with the `ci/cd` label
4. Contact the DevOps team for urgent issues

**Pipeline Status:** [![Comprehensive Tests](https://github.com/Xala-Technologies/xaheen/workflows/Comprehensive%20Testing%20Pipeline/badge.svg)](https://github.com/Xala-Technologies/xaheen/actions/workflows/comprehensive-tests.yml)