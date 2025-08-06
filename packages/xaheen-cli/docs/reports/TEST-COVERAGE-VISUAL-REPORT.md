# 📊 Xaheen CLI Test Coverage Visual Report

> **Generated**: ${new Date().toISOString()}  
> **Total Coverage**: 12.7%  
> **Target Coverage**: 75%  
> **Gap to Close**: 62.3%

## 🎯 Coverage Overview

```
Overall Coverage: 12.7% [████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 75% target

By Type:
├── Statements: 11.2% [███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
├── Branches:   15.3% [█████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
├── Functions:   8.9% [███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
└── Lines:      11.2% [███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
```

## 📁 Coverage by Directory

### /src/core (Critical Infrastructure)
```
command-parser/     66.6% [██████████████████████████░░░░░░░░░░░░░░]
config-manager/      0.0% [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
bootstrap/           0.0% [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
registry/            0.0% [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
stack-adapters/      0.0% [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
```

### /src/commands (User-Facing Commands)
```
ai.ts               0.0% [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
create.ts           0.0% [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
registry.ts         0.0% [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
generate.ts         0.0% [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
deploy.ts           0.0% [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
```

### /src/services (Business Logic)
```
ai/                 5.1% [██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
templates/          0.0% [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
xala-ui/            0.0% [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
community/          0.0% [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
registry/          88.9% [███████████████████████████████████░░░░░░]
```

### /src/generators (Code Generation)
```
ai/                 0.0% [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
cloud/              0.0% [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
component/          0.0% [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
devops/             0.0% [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
patterns/           0.0% [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
```

## 📈 Coverage Heatmap

### High Coverage Areas (>50%) 🟢
```
✅ src/core/command-parser/index.ts          66.6%
✅ src/services/registry/service-registry.ts 88.9%
✅ src/middleware/alias-resolver.ts          18.0%
```

### Medium Coverage Areas (20-50%) 🟡
```
⚠️  src/commands/ai-generate.ts             19.9%
⚠️  src/domains/project/index.ts            22.7%
⚠️  src/utils/helpers.ts                    25.3%
```

### Critical Coverage Gaps (<20%) 🔴
```
❌ src/services/ai/* (152 files)             5.1% average
❌ src/generators/* (89 files)               0.0% average
❌ src/commands/* (28 files)                 0.4% average
❌ src/services/templates/* (12 files)       0.0% average
❌ src/core/config-manager/index.ts          0.0%
```

## 🎯 Coverage Improvement Priority Matrix

### Priority 1: Core Infrastructure (Impact: HIGH)
```
File                                    Current → Target   Effort
─────────────────────────────────────────────────────────────────
src/core/config-manager/index.ts          0% → 80%        Medium
src/core/bootstrap/system-configurator    0% → 75%        Low
src/core/registry/ServiceRegistry         0% → 85%        Medium
src/core/stack-adapters/index.ts         0% → 70%        High
```

### Priority 2: Command Handlers (Impact: HIGH)
```
File                                    Current → Target   Effort
─────────────────────────────────────────────────────────────────
src/commands/create.ts                    0% → 90%        Medium
src/commands/generate.ts                  0% → 85%        High
src/commands/registry.ts                  0% → 90%        Low
src/commands/ai.ts                        0% → 80%        High
```

### Priority 3: Service Layer (Impact: MEDIUM)
```
File                                    Current → Target   Effort
─────────────────────────────────────────────────────────────────
src/services/xala-ui/*                    0% → 75%        High
src/services/templates/*                  0% → 70%        Very High
src/services/ai/AIOrchestrator           5% → 80%        Very High
src/services/community/*                  0% → 60%        Medium
```

## 📊 Test Distribution Analysis

### Test Types Distribution
```
Unit Tests:        45% [██████████████████░░░░░░░░░░░░░░░░░░░░░░]
Integration Tests: 35% [██████████████░░░░░░░░░░░░░░░░░░░░░░░░░░]
E2E Tests:         15% [██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
Performance Tests:  5% [██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
```

### Test Quality Metrics
```
Average Assertions per Test: 2.4
Mock Usage:                 78%
Test Isolation:            92%
Flaky Tests:               3.2%
```

## 🚀 Coverage Improvement Roadmap

### Week 1: Foundation (Target: 12.7% → 25%)
```
Mon-Tue: Core Infrastructure
  ├── config-manager (0% → 80%)
  ├── bootstrap (0% → 75%)
  └── Expected gain: +8.5%

Wed-Thu: Critical Commands
  ├── create.ts (0% → 90%)
  ├── registry.ts (0% → 90%)
  └── Expected gain: +3.8%

Friday: Review & Stabilize
  └── Total week gain: +12.3%
```

### Week 2: Expansion (Target: 25% → 45%)
```
Mon-Wed: Service Layer
  ├── xala-ui integration (0% → 75%)
  ├── template system (0% → 50%)
  └── Expected gain: +12%

Thu-Fri: Generator Basics
  ├── component generator (0% → 60%)
  ├── patterns generator (0% → 40%)
  └── Expected gain: +8%
```

### Week 3-4: Completion (Target: 45% → 75%)
```
Week 3: AI & Advanced Features
  ├── AI orchestrator (5% → 80%)
  ├── AI generators (0% → 70%)
  └── Expected gain: +18%

Week 4: Integration & E2E
  ├── Full workflow tests
  ├── Performance benchmarks
  └── Expected gain: +12%
```

## 📋 Coverage Anti-Patterns Found

### 1. Empty Test Files
```javascript
// Found in 15 files
describe('ComponentName', () => {
  it.todo('should implement tests');
});
```

### 2. Minimal Assertions
```javascript
// Found in 23 test files
it('should work', () => {
  expect(true).toBe(true);
});
```

### 3. Missing Error Cases
```javascript
// 89% of tests only cover happy path
✅ Success scenarios: 89%
❌ Error scenarios: 11%  // Should be ~40%
```

## 🎯 Success Criteria

### Minimum Viable Coverage (2 weeks)
```
Overall:     55% [██████████████████████░░░░░░░░░░░░░░░░░░]
Statements:  50% [████████████████████░░░░░░░░░░░░░░░░░░░░]
Branches:    60% [████████████████████████░░░░░░░░░░░░░░░░]
Functions:   45% [██████████████████░░░░░░░░░░░░░░░░░░░░░░]
```

### Target Coverage (1 month)
```
Overall:     75% [██████████████████████████████░░░░░░░░░░]
Statements:  70% [████████████████████████████░░░░░░░░░░░░]
Branches:    80% [████████████████████████████████░░░░░░░░]
Functions:   65% [██████████████████████████░░░░░░░░░░░░░░]
```

## 🔧 Tooling Recommendations

### Coverage Collection
```bash
# Current setup (needs optimization)
vitest --coverage --coverage.provider=v8

# Recommended setup
vitest --coverage \
  --coverage.provider=v8 \
  --coverage.all \
  --coverage.include="src/**/*.ts" \
  --coverage.exclude="**/*.test.ts" \
  --coverage.reporter=["text", "json", "html", "lcov"] \
  --coverage.thresholds.lines=75 \
  --coverage.thresholds.functions=65 \
  --coverage.thresholds.branches=80 \
  --coverage.thresholds.statements=70
```

### Continuous Monitoring
```yaml
# GitHub Actions integration
- name: Coverage Check
  run: |
    pnpm test:coverage
    pnpm coverage:report
    pnpm coverage:check-thresholds
```

---

*Coverage data based on latest test run. Regenerate weekly for accurate tracking.*