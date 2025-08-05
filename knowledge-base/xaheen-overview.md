# Xaheen: Comprehensive Product Knowledge Bank

This document encapsulates the full vision, architecture, features, and operational guidelines for the **Xaheen** ecosystem—not just the CLI but the **entire product** including the CLI, Web Dashboard, Admin Portal, AI Agents, Marketplace, and Enterprise integrations.

---

## 1. Product Vision & Value Proposition

* **Unified Developer Bank**: An all-in-one platform offering *self-service* code generation, AI-assisted development, SaaS administration, and a plugin marketplace—licensed per technology stack.
* **Convention + AI**: Combine *convention-over-configuration* (Rails-like) with AI-first workflows (MCP, Codebuff) to accelerate full-stack app creation.
* **Enterprise-Ready by Default**: Out-of-the-box compliance with Norwegian Gov standards (BankID, Altinn, NSM), GDPR, WCAG, ISO 27001.
* **Modular, Extensible Platform**: CLI, Web UI, Admin Portal, AI Agents, and Marketplace working together under a **bundle & plugin** architecture.

---

## 2. Core Product Components

| Component                | Purpose                                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| **Xaheen CLI**           | Developer-centric generator UI in terminal. Scaffolds projects, modules, AI-diff code, and commands.  |
| **Web Dashboard**        | Browser-based UI for interactive project setup (Stack Builder), managing templates, and AI prompts.   |
| **Admin Portal**         | SaaS administration UI for tenant onboarding, license management, usage analytics, and feature flags. |
| **MCP Server**           | AI backend (xala-mcp) that orchestrates prompt execution, LLM calls, and context indexing.            |
| **AI Agent**             | Autonomous assistant workflows (e.g., refactoring bot, compliance auditor) embedded in CLI/UI.        |
| **Marketplace**          | Repository of community and official plugins, presets, and templates—installable via CLI or UI.       |
| **License Server**       | Service issuing signed feature-flag licenses, handling purchases, renewals, and telemetry.            |
| **Documentation Portal** | Live MDX-based docs generated from code templates, API specs, and tutorials.                          |

---

## 3. Architecture Overview

```
┌──────────────┐        ┌─────────────┐        ┌───────────────┐
│  Developer   │ ◀────▶│   CLI Tool  │◀──────▶│ MCP Server    │
└──────────────┘        └─────────────┘        └───────────────┘
       │                      │                        │
       │                      ▼                        ▼
       │            ┌────────────────┐      ┌────────────────────┐
       │            │ File Templates │      │ LLM Models & APIs  │
       │            └────────────────┘      └────────────────────┘
       │                     ▲                        ▲
       │                     │                        │
       ▼                     ▼                        ▼
┌──────────────┐     ┌───────────────┐       ┌──────────────┐
│ Web Dashboard│     │ Admin Portal  │       │   Marketplace │
└──────────────┘     └───────────────┘       └──────────────┘
       ▲                     ▲                        ▲
       │                     │                        │
       └───────► License Server ◄─────────────────────┘
```

* **CLI ↔ MCP**: CLI calls MCP for AI-driven code generation and prompt orchestration. MCP loads templates and returns messages/patches.
* **Web Dashboard**: Provides a GUI overlay to the same commands—interactive stack builder, prompt execution, and logs.
* **Admin Portal**: Manages tenant accounts, feature flags (license), usage metrics, telemetry, and support tickets.
* **Marketplace**: Hosts official/community plugins—presets, templates, generator modules—installable via `xaheen plugin` or Web UI.
* **License Server**: Issues and validates signed licenses, driving feature availability across CLI and UI.

---

## 4. Complete Feature Matrix

| Feature                    | CLI             | Web Dashboard     | Admin Portal | MCP Support | License Flag          |
| -------------------------- | --------------- | ----------------- | ------------ | ----------- | --------------------- |
| Project Scaffolding        | xaheen new      | ✔️ GUI wizard     |              | ✓           | feature.clis          |
| Stack Builder Presets      | xaheen scaffold | ✔️ Preset picker  |              | ✓           | feature.builders      |
| Module Generators          | xaheen generate | ✔️ Module wizard  |              | ✓           | feature.modules       |
| AI Diff & Patches          | xaheen ai code  | ✔️ AI console     |              | ✓           | feature.ai            |
| Interactive TUI Mode       | ✔️              |                   |              |             |                       |
| Frontend Bundle Config     | ✔️              | ✔️ Live preview   |              | ✓           | feature.frontend      |
| Backend Bundle Config      | ✔️              | ✔️ Live preview   |              | ✓           | feature.backend       |
| Database & ORM Scaffolding | ✔️              |                   |              | ✓           | feature.db            |
| Integration Templates      | ✔️              |                   |              | ✓           | feature.int           |
| SaaS Admin Dashboard       |                 |                   | ✔️           |             | feature.saas          |
| Multi-Tenancy              |                 |                   | ✔️           | ✓           | feature.multiTenant   |
| Subscription Management    |                 |                   | ✔️           |             | feature.subscriptions |
| License Activation/Upgrade | ✔️              |                   | ✔️           |             |                       |
| Marketplace Plugin Install | xaheen plugin   | ✔️ Plugin gallery |              |             | feature.marketplace   |
| Compliance Validation      | xaheen validate | ✔️ Compliance UI  |              | ✓           | feature.compliance    |
| Documentation Generation   | ✔️              | ✔️ Docs viewer    |              |             |                       |

---

## 5. SaaS Product & GTM Strategy

1. **Licensing Model**: Tiered SKUs + add-ons (frontend, backend, AI, SaaS features).
2. **Distribution**: npm + Docker images + Cloud SaaS offering (hosted Admin Portal).
3. **Onboarding Flow**:

   * Developer uses CLI or Web UI to start a trial—preconfigured license.
   * Guided “tour” of stack builder and AI prompts.
4. **Upsell & Expansion**:

   * Feature usage analytics highlight opportunities (e.g. “Customers using AI generators often upgrade to the AI Pro Pack”).
5. **Support & Community**:

   * Slack channel, GitHub Discussions, weekly webinars.
   * Marketplace fosters third-party integrations and extensions.

---

## 6. Operational & Deployment Overview

* **Infrastructure**: Kubernetes cluster hosting Admin Portal, License Server, MCP Server (LLM proxies).
* **CI/CD**: GitHub Actions for CLI builds, npm publish; Helm charts for Dashboard & Admin Portal; semantic-release.
* **Monitoring**: Prometheus + Grafana for uptime & performance; Sentry for error tracking; telemetry pipeline for usage metrics.
* **Security**: WAF in front of Web UIs; mTLS between components; regular dependency audits; SOC2 alignment.

---

## 7. Production Readiness & Roadmap

* **MVP Bakestage**: Validate Next.js + Node.js MVP; gather feedback.
* **Phase Releases**: Roll out features in slices—frontend, backend, SaaS, marketplace.
* **Release Criteria**: 90% test coverage, performance SLAs, pilot customer approval.

---

> *This knowledge bank is the single source of truth for the full Xaheen ecosystem—CLI, Web, Admin, AI, and Marketplace. Keep it updated as features evolve.*

---

# Xaheen CLI: Comprehensive Knowledge Bank

This knowledge bank consolidates all insights, plans, epics, strategies, and technical details derived from our chat history. Use it as a single reference for the vision, architecture, features, and operational guidelines for the Xaheen CLI ecosystem.

---

## 1. Vision & Core Principles

* **"Rails of TypeScript Ecosystem"**: Convention-over-configuration CLI for modern full-stack apps.
* **AI-First Development**: Natural language → code via MCP (Model Context Protocol) server.
* **Enterprise-Ready**: Built-in Norwegian compliance (BankID, Altinn, NSM, GDPR, WCAG).
* **Multi-Platform Support**: React, Vue, Angular, Svelte, SvelteKit, React Native, Electron.
* **Developer Happiness**: Intuitive, interactive, fast, and extensible.

---

## 2. CLI Feature Overview

### 2.1 Core Commands

* **`xaheen new <app>`**: Scaffold a new project with presets (frontend, backend, full-stack).
* **`xaheen scaffold`**: Interactive full-stack tech builder using JSON-driven presets and compatibility rules.
* **`xaheen generate|g <type> <name>`**: Generate models, controllers, services, components, pages, integrations.
* **`xaheen add <service>`**: Inject external services (payments, monitoring, analytics).
* **`xaheen ai code <prompt>`**: Context-aware AI diff via Codebuff integration.
* **`xaheen validate`**: Run lint, tests, compliance checks.
* **`xaheen license activate/upgrade`**: Manage feature-flagged licensing.

### 2.2 Generator Ecosystem

* **Frontend Generators**: component, page, layout, hook, context, provider.
* **Backend Generators**: api, model, controller, service, middleware, guard, interceptor, pipe, decorator.
* **Database Generators**: migration, seed, schema, repository.
* **Full-Stack Generators**: scaffold, crud, auth, feature.
* **Integration Generators**: webhook, queue, cron, worker.
* **Infrastructure Generators**: docker, k8s, ci, deployment.
* **Testing Generators**: test, e2e, mock.
* **Configuration Generators**: config, env, docs.

---

## 3. Implementation Roadmap & Epics

### EPIC 1: Rails-Inspired Full-Stack Generator

* Core `xaheen generate` system, scaffold, CRUD, authentication, testing generators.

### EPIC 2: Enterprise Service Integrations

* Norwegian Gov (BankID, Altinn, Vipps), Cloud (Azure, AWS, GCP), Third-Party (Stripe, Twilio).

### EPIC 3: Database & Data Management

* Advanced schemas, migrations, DDD, CQRS, real-time (WebSockets, Kafka).

### EPIC 4: DevOps & Deployment

* Docker, Kubernetes, Helm, CI/CD pipelines, monitoring, observability.

### EPIC 5: AI & ML Integration

* OpenAI, vector DBs, intelligent search, recommendations, MCP server enhancements.

### EPIC 6: Testing & QA

* Unit, integration, E2E, performance, mutation, security testing generators.

### EPIC 7: Documentation & API Management

* OpenAPI gen, docs portal, MDX, automatic SDKs.

### EPIC 8: SaaS Administration & Multi-Tenancy

* Admin portal, RBAC, tenant onboarding, multi/single-tenant, subscriptions, license management.

### EPIC 9: AI-Native Developer Productivity

* Refactoring assistant, prompt feedback loops, plugin marketplace, interactive diff previews.

### EPIC 10: Web Frontend Architecture & Tech Builder

* Interactive `xaheen web init` and `scaffold`, bundler configs, design system integration.

### EPIC 11: CLI Testing & Validation

* Unit, integration, E2E, performance, security testing workflows.

### EPIC 12: Interactive Full-Stack Tech Builder

* JSON-driven project types, quick-presets, tech-categories, compatibility enforcement.

### EPIC 13: Perfect Frontend Framework Implementation

* Semantic UI templates, template inheritance, AI pattern recommendations, Storybook, tutorials.

### EPIC 14: MCP Core Server Enhancement

* `xala-mcp` package integration, orchestrate all AI generation, spec composition, plugin extensions.

---

## 4. Key Technological Artifacts

### 4.1 MCP Prompts & Handlers

* Standardized `prompts.ts` using `xala-mcp` map.
* Prompt handlers for page, dashboard, auth-flow, component optimization, data tables.
* Utilities: `getPageTypeSpecificInstructions()`, `getOptimizationInstructions()`.

### 4.2 JSON-Driven Configs

* **project-types.json**: Landing, E-commerce, Dashboard, Blog, etc.
* **quick-presets.json**: Marketing site, dashboard app, multi-tenant SaaS, etc.
* **tech-categories.json** & **tech-options.json**: Ordered categories and choices.
* **tech-compatibility.json**: Rules to filter valid stacks.

### 4.3 Codebuff Integration

* Wrap `runCodebuff()` for AI diffs, interactive diff previews, auto-commit.
* Hook into `xaheen ai` namespace and MCP flows.

---

## 5. MVP Testing Strategy (Iterative Slices)

1. **Phase 1**: Frontend MVP (Next.js scaffold, generate page/component, Playwright smoke).
2. **Phase 2**: Backend MVP (Express/Nest scaffold, generate model/endpoint, Jest integration).
3. **Phase 3**: Full-Stack Integration (Monorepo linkage, service generation, E2E Playwright).
4. **Phase 4**: Services & Integrations (Auth, payments, monitoring, contract tests).
5. **Phase 5**: Secondary Frameworks & Advanced (Vue, Svelte, PHP, multi-tenancy boilerplate).

---

## 6. Licensing & Monetization

* **Feature-Flagged Licensing**: Map CLI features to license flags.
* **License Server**: Issue signed license blobs via purchase webhooks.
* **CLI Enforcement**: Load `~/.xaheen/license.json`, hide/disable unauthorized commands.
* **Usage Reporting & Renewals**: Telemetry, expiry warnings, in-CLI upgrade flows.

---

## 7. Production Readiness Checklist

1. **Functionality**: All epics complete, core flows green.
2. **Quality**: ≥ 90% test coverage, lint & type strict, performance targets.
3. **Documentation**: User & dev docs, tutorials, change log.
4. **Ops**: CI/CD publish, monitoring, telemetry.
5. **Go/No-Go**: 3 green builds, pilot feedback, live smoke tests.

---

## 8. Wireframe Inspiration

* **Stack Builder UI**: Sidebar wizard, central selection, summary panel.
* 5-step flow: Tech → Backend → Frontend → Services → Summary.

---

> *This knowledge bank should evolve as Xaheen grows. Update epics, prompts, and strategies regularly to reflect new capabilities, integrations, and community contributions.*
