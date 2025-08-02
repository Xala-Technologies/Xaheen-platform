# CLI JSON Tech Stack Integration Plan

**Document Version:** 1.0  
**Created:** 2025-08-02  
**Status:** Planning Phase  
**Priority:** Critical  

## Executive Summary

This document outlines the comprehensive plan to integrate all JSON tech stack features from the web stack builder into the Xaheen CLI. The analysis reveals significant gaps between the UI capabilities (140+ options across 22 categories) and CLI support (22 core options), requiring a phased implementation approach.

## Problem Statement

### Current State
- **Web Stack Builder**: 22 categories with 140+ technology options sourced from JSON files
- **CLI Support**: Only 9 core categories with 22 options in CLI schemas
- **Gap**: 19 missing categories (120+ options) + core schema mismatches

### Business Impact
- **Developer Experience**: CLI doesn't match UI capabilities
- **Feature Parity**: Web interface offers options unavailable via CLI
- **Adoption Barrier**: Users cannot script/automate full stack configurations
- **Maintenance Overhead**: Dual maintenance of separate option sets

## Gap Analysis

### 🔴 CRITICAL: Core Schema Mismatches

#### Frontend Schema Gaps
**Current CLI Schema:**
```typescript
["tanstack-router", "react-router", "tanstack-start", "next", "nuxt", "native-nativewind", "native-unistyles", "svelte", "solid", "none"]
```

**Missing Options:**
- `angular` - Angular platform for mobile and desktop web applications
- `blazor` - Build interactive web UIs using C# instead of JavaScript

#### Backend Schema Gaps
**Current CLI Schema:**
```typescript
["hono", "express", "fastify", "next", "elysia", "convex", "none"]
```

**Missing Options:**
- `dotnet` - Microsoft .NET framework
- `laravel` - PHP web application framework
- `django` - Python web framework

#### Database Schema Gaps
**Current CLI Schema:**
```typescript
["none", "sqlite", "postgres", "mysql", "mongodb"]
```

**Missing Options:**
- `mssql` - Microsoft SQL Server database

### 🟡 MAJOR: Extended Categories (New CLI Features)

| Category | Options | Priority | Business Value |
|----------|---------|----------|----------------|
| **testing** | 8 | 🔴 Critical | Development workflow essential |
| **notifications** | 8 | 🔴 Critical | User communication core feature |
| **payments** | 6 | 🔴 Critical | Revenue generation capability |
| **monitoring** | 8 | 🔴 Critical | Production stability requirement |
| **analytics** | 6 | 🟡 High | Business intelligence insights |
| **documents** | 6 | 🟡 High | File management functionality |
| **caching** | 6 | 🟡 High | Performance optimization |
| **devops** | 6 | 🟡 High | CI/CD automation |
| **security** | 6 | 🟡 High | Application hardening |
| **i18n** | 6 | 🟡 Medium | Internationalization support |
| **messaging** | 6 | 🟡 Medium | Real-time communication |
| **search** | 6 | 🟡 Medium | Content discovery |
| **cms** | 8 | 🟢 Low | Content management |
| **saasAdmin** | 6 | 🟢 Low | Admin interface generation |
| **subscriptions** | 8 | 🟢 Low | Billing management |
| **backgroundJobs** | 6 | 🟢 Low | Async processing |
| **rbac** | 6 | 🟢 Low | Role-based access control |
| **licensing** | 6 | 🟢 Low | Software licensing |
| **multiTenancy** | 6 | 🟢 Low | Multi-tenant architecture |

## Implementation Roadmap

### Phase 1: Core Schema Fixes (Week 1)
**Priority:** 🔴 CRITICAL - Immediate Implementation Required

#### 1.1 Update CLI Type Schemas
**File:** `/apps/cli/src/types.ts`

```typescript
// UPDATED Frontend Schema
export const FrontendSchema = z.enum([
  "tanstack-router", "react-router", "tanstack-start", "next", "nuxt",
  "native-nativewind", "native-unistyles", "svelte", "solid",
  "angular",     // ← NEW: Angular platform
  "blazor",      // ← NEW: Blazor C# web UI
  "none"
]).describe("Frontend framework");

// UPDATED Backend Schema  
export const BackendSchema = z.enum([
  "hono", "express", "fastify", "next", "elysia", "convex",
  "dotnet",      // ← NEW: .NET framework
  "laravel",     // ← NEW: PHP framework
  "django",      // ← NEW: Python framework
  "none"
]).describe("Backend framework");

// UPDATED Database Schema
export const DatabaseSchema = z.enum([
  "none", "sqlite", "postgres", "mysql", "mongodb",
  "mssql"        // ← NEW: SQL Server
]).describe("Database type");
```

#### 1.2 Update CLI Constants
**File:** `/apps/cli/src/constants.ts`

```typescript
export const DEFAULT_CONFIG: ProjectConfig = {
  // Update compatibility matrix for new framework combinations
  // Add dependency version mappings for Angular, Blazor, .NET, Laravel, Django, SQL Server
};

export const dependencyVersionMap = {
  // Add version mappings for new frameworks
  "@angular/core": "^17.0.0",
  "@angular/cli": "^17.0.0",
  "microsoft.aspnetcore.app": "^8.0.0",
  "laravel/framework": "^10.0",
  "django": "^4.2.0",
  // ... additional dependencies
};
```

### Phase 2: High-Priority Categories (Week 2-3)
**Priority:** 🔴 CRITICAL - Essential Services

#### 2.1 Add Core Service Categories
```typescript
// Testing Framework Schema
export const TestingSchema = z.enum([
  "vitest", "jest", "playwright", "cypress", "storybook", "chromatic", "msw", "none"
]).describe("Testing framework and tools");

// Notifications Service Schema
export const NotificationsSchema = z.enum([
  "resend", "nodemailer", "sendgrid", "mailgun", "ses", "postmark", "brevo", "none"
]).describe("Email and notification services");

// Payments Service Schema
export const PaymentsSchema = z.enum([
  "stripe", "paddle", "lemonsqueezy", "paypal", "square", "none"
]).describe("Payment processing services");

// Monitoring Service Schema
export const MonitoringSchema = z.enum([
  "sentry", "datadog", "newrelic", "bugsnag", "rollbar", "honeybadger", "logflare", "none"
]).describe("Application monitoring and error tracking");
```

### Phase 3: Extended Categories (Week 4-6)
**Priority:** 🟡 HIGH to 🟢 LOW - Comprehensive Feature Set

Add remaining 15 service categories with 90+ additional options:
- Analytics, Documents, Caching, DevOps, Security, I18n, Messaging, Search, CMS, SaaS Admin, Subscriptions, Background Jobs, RBAC, Licensing, Multi-Tenancy

### Phase 4: CLI Command Integration (Week 7-8)
**Priority:** 🔴 CRITICAL - Command Generation & Parsing

#### 4.1 Update Command Generator
```typescript
export const generateCommand = (stackState: StackState): string => {
  // Add flags for all new categories:
  // --testing, --notifications, --payments, --monitoring, etc.
  
  if (!checkDefault("testing", stackState.testing)) {
    flags.push(`--testing ${stackState.testing}`);
  }
  
  if (!checkDefault("notifications", stackState.notifications)) {
    flags.push(`--notifications ${stackState.notifications}`);
  }
  
  // ... add 20+ more category flags
};
```

#### 4.2 Update CLI Argument Parsing
```typescript
const createCommand = program
  .command("create")
  .argument("[project-name]", "Name of the project")
  .option("--frontend <frameworks...>", "Frontend frameworks")
  .option("--backend <framework>", "Backend framework")
  .option("--database <type>", "Database type")
  
  // NEW: Service options
  .option("--testing <framework>", "Testing framework")
  .option("--notifications <service>", "Notification service")
  .option("--payments <service>", "Payment processing service")
  .option("--monitoring <service>", "Monitoring service")
  // ... 15+ more service options
```

### Phase 5: Setup & Template Integration (Week 9-10)
**Priority:** 🟡 HIGH - Implementation Logic

Create setup handlers and templates for all new frameworks and services:
- Angular, Blazor, .NET, Laravel, Django templates
- Service integration handlers for all 19 categories
- Configuration file generators
- Package dependency management

## Testing Strategy

### Unit Testing
- Schema validation tests for all new types
- Command generation tests for all flag combinations
- Setup handler tests for each service category

### Integration Testing
- End-to-end project creation with new options
- Framework combination compatibility tests
- CLI command parsing and execution tests

### Performance Testing
- Command generation performance with 140+ options
- Project setup time with multiple services
- Memory usage optimization

## Success Metrics

### Quantitative Metrics
- **Schema Completeness**: 100% of JSON options supported in CLI (140+ options)
- **Command Generation**: 100% of UI selections generate valid CLI commands
- **Test Coverage**: >95% code coverage for all new features
- **Performance**: CLI response time <2s for any command
- **Compatibility**: 100% backward compatibility with existing projects

### Timeline Summary

| Phase | Duration | Priority | Deliverables |
|-------|----------|----------|--------------|
| **Phase 1** | Week 1 | 🔴 Critical | Core schema fixes (6 new options) |
| **Phase 2** | Week 2-3 | 🔴 Critical | High-priority categories (32 new options) |
| **Phase 3** | Week 4-6 | 🟡 High | Extended categories (90+ new options) |
| **Phase 4** | Week 7-8 | 🔴 Critical | CLI command integration |
| **Phase 5** | Week 9-10 | 🟡 High | Setup & template integration |

**Total Duration:** 10 weeks  
**Total New Options:** 140+ options across 22 categories

## Risk Assessment

### High Risk Items
1. **Breaking Changes**: Feature flags and backward compatibility layer
2. **Performance**: Lazy loading and optimized parsing
3. **Maintenance**: Automated testing and clear documentation

### Mitigation Strategies
- Phased rollout with feature flags
- Comprehensive testing at each phase
- Automated documentation generation
- Performance benchmarking and optimization

## Resource Requirements

- **Lead Developer**: Full-time for 10 weeks
- **QA Engineer**: Part-time for testing phases
- **DevOps Engineer**: Part-time for CI/CD setup
- **Technical Writer**: Part-time for documentation

## Next Steps

1. **Immediate**: Begin Phase 1 - Core Schema Fixes
2. **Week 1**: Complete frontend, backend, database schema updates
3. **Week 2**: Start Phase 2 - High-priority service categories
4. **Weekly Reviews**: Progress assessment and risk mitigation
5. **Milestone Gates**: Quality gates before proceeding to next phase

This plan transforms the CLI from supporting **22 core options** to supporting **140+ comprehensive options**, achieving full parity with the JSON tech stack capabilities.
