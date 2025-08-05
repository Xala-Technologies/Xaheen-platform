---
name: Performance Regression
about: Report performance regressions detected by CI/CD pipeline
title: '[PERFORMANCE] Performance regression detected'
labels: 'performance, regression, ci/cd'
assignees: ''
---

## 📊 Performance Regression Report

### 🚨 Regression Details
- **Detection Date:** <!-- When was this detected -->
- **Affected Component:** <!-- CLI, specific framework, etc. -->
- **Performance Metric:** <!-- e.g., scaffold time, build time, memory usage -->
- **Regression Severity:** <!-- Critical (>20%), High (10-20%), Medium (5-10%) -->

### 📈 Performance Data
| Metric | Previous Value | Current Value | Regression % |
|--------|----------------|---------------|--------------|
| <!-- Metric name --> | <!-- Previous --> | <!-- Current --> | <!-- % --> |

### 🔍 Affected Operations
<!-- Check all that apply -->
- [ ] CLI cold start
- [ ] Project scaffolding (dry-run)
- [ ] Project scaffolding (full)
- [ ] Dependency installation
- [ ] Build process
- [ ] Test execution
- [ ] Memory usage

### 📋 Framework Impact
<!-- Check all that apply -->
- [ ] Next.js
- [ ] React
- [ ] Vue
- [ ] Angular
- [ ] Svelte
- [ ] All frameworks

### 🔄 Git Information
- **Branch:** <!-- Branch where regression was detected -->
- **Commit Range:** <!-- Range of commits that may have caused this -->
- **Pull Request:** <!-- If applicable -->

### 📊 Benchmark Results
```
<!-- Paste benchmark output here -->
```

### 🛠 Potential Causes
<!-- List potential causes for the regression -->
- [ ] Dependency updates
- [ ] Code changes
- [ ] Configuration changes
- [ ] Infrastructure changes
- [ ] Unknown

### 🎯 Impact Assessment
- **User Impact:** <!-- How does this affect end users -->
- **CI/CD Impact:** <!-- How does this affect the pipeline -->
- **Priority Level:** <!-- Critical, High, Medium, Low -->

### 🚀 Action Items
- [ ] Investigate root cause
- [ ] Create fix
- [ ] Update performance thresholds (if appropriate)
- [ ] Add monitoring for this metric
- [ ] Update documentation

### 📋 Additional Context
<!-- Any additional information that might be helpful -->

### ✅ Resolution Checklist
- [ ] Root cause identified
- [ ] Fix implemented and tested
- [ ] Performance restored to acceptable levels
- [ ] Monitoring updated to prevent future regressions
- [ ] Documentation updated if needed