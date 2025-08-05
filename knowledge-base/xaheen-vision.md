# Xaheen In-Depth Documentation

## 1. Product Vision & Core Principles

* **Unified Developer Bank**
  Companies license exactly the stacks, tools, and services they need—self-service via CLI or Web UI.

* **Convention + AI**

  * Convention-over-configuration patterns (inspired by Rails).
  * AI-first workflows: natural-language prompts drive code generation, refactoring, and compliance via the MCP server and Codebuff.

* **Enterprise-Ready by Default**

  * Built-in modules for Norwegian Government integrations (BankID, Altinn), NSM security classifications, GDPR, WCAG 2.2 AAA.
  * Automated vulnerability scanning, SOC2 alignment, WAF and mTLS between services.

* **Modular, Extensible Platform**

  * Plugin system (Marketplace) for community/official generator packages.
  * Feature-flag licensing: each CLI or UI capability is gated by your purchased license.

---

## 2. Xaheen CLI

### 2.1 Installation & Configuration

```bash
npm install -g xaheen
xaheen license activate YOUR-LICENSE-KEY
```

* **Global config** in `~/.xaheen/config.json` (default stack, MCP endpoint, telemetry opt-in).
* **License file** in `~/.xaheen/license.json` (signed feature-flag set).

### 2.2 Core Commands

#### `xaheen new <app-name>`

* **Purpose:** Scaffold a fresh project.
* **Options:**

  * `--preset` (e.g. `nextjs`, `express`, `fullstack`)
  * `--ci` (`github`/`gitlab`/`azure`)
  * `--infra` (`docker`/`k8s`/`terraform`)
* **Behavior:** Creates folders, installs deps, initializes Git, bootstraps MCP index.

#### `xaheen scaffold`

* **Purpose:** Interactive full-stack “Stack Builder.”
* **Flow:**

  1. **Project Type** (Landing, SaaS, E-commerce, etc.)
  2. **Quick-Preset** (dashboard-app, marketing-site, multi-tenant SaaS)
  3. **Tech Categories** (frontend, backend, database, infra, observability, CI/CD)

     * Options filtered by **tech-compatibility.json** after each choice.
  4. **Review & Confirm** (tree diff preview, `--dry-run` available)
* **Flags:** `--yes` to skip prompts, `--output=<dir>`.

#### `xaheen generate <type> <name>`

* **Types:** `model`, `service`, `endpoint`, `component`, `page`, `integration`, `bundle`, `preset`
* **Common Options:**

  * `--fields="name:string,email:string"`
  * `--ai="description"` → invokes MCP/Codebuff
  * `--force`, `--dry-run`, `--skip-tests`
* **Example:**

  ```bash
  xaheen generate model User --fields="name:string email:string role:enum"
  xaheen generate component UserCard --ai="responsive profile card"
  ```

#### `xaheen ai code "<natural-language prompt>"`

* **Purpose:** AI-powered context-aware patch generation via Codebuff.
* **Flow:**

  1. Builds project context (`codebuff index`).
  2. Calls `runCodebuff({ prompt, cwd })`.
  3. Shows interactive diff preview.
  4. Applies patch and auto-commits (unless `--no-commit`).

#### `xaheen validate`

* **Purpose:** Quality, security, and compliance check.
* **Runs:** ESLint, Prettier, TypeScript compile, Snyk/audit, SonarQube scanner, custom compliance scripts.
* **Output:** HTML and console reports in `reports/`.

#### `xaheen plugin <install|list|remove|publish>`

* **Purpose:** Manage Marketplace plugins.
* **Behavior:** Installs npm-distributed generator packages and wires them into `xaheen generate`.

#### `xaheen license <activate|upgrade|status>`

* **Purpose:** Manage your feature-flag license.
* **Flow:** Activates or upgrades license via License Server; displays enabled features and expiry.

---

## 3. Web Dashboard

### 3.1 Key Sections

1. **Home** – Recent projects, quick-start links.
2. **Stack Builder** – GUI version of `xaheen scaffold` with live previews.
3. **AI Console** – Chat interface for MCP prompts; shows generated code and diffs.
4. **Generators** – Form-based UI for all `generate` types.
5. **Reports** – Visual dashboards for test, lint, compliance results.

### 3.2 Authentication & Multi-Tenancy

* Single Sign-On (SAML/OAuth2).
* Tenant context switcher with RBAC (Admin, Developer roles).
* Tenant usage metrics and feature-flag overrides.

---

## 4. Admin Portal

* **License Management:** Issue, revoke, and renew signed licenses with feature-flag configuration.
* **Subscription Billing:** Stripe and PayPal integration with webhooks.
* **Usage Analytics:** Heatmaps of most used commands/features; seat count.
* **Support & Tickets:** Embedded GitHub Issues or Zendesk widget.
* **Feature Flags UI:** Toggle global or per-tenant flags (e.g. disable AI).

---

## 5. MCP Server (`xala-mcp`)

### 5.1 Prompt Definitions

* Stored in `prompts.ts` as an `MCPPromptMap`.
* Core prompts:

  * `build-shadcn-page`
  * `create-dashboard`
  * `create-auth-flow`
  * `optimize-shadcn-component`
  * `create-data-table`

### 5.2 APIs

* `POST /prompt/list` → list available prompts and schemas.
* `POST /prompt/run` → run a prompt handler, calls LLM, returns messages or code patches.
* `POST /context/index` → ingest project files for semantic context.

### 5.3 Configuration

* `.xaheenrc` for MCP endpoint, API key, default model.
* Supports loading additional prompt modules from installed npm packages.

---

## 6. AI Agent

* **Refactoring Bot:**
  Scheduled or on-demand runs of `xaheen ai code "Refactor for performance"`, auto-commits on PRs.
* **Compliance Auditor:**
  Scans repo with `xaheen validate --compliance`, files issues for violations.

---

## 7. Marketplace & Plugins

* **CLI:** `xaheen plugin install <pkg>`, auto-discovers and loads generators.
* **Web UI:** Plugin gallery with ratings, screenshots, and one-click install.
* **Publishing:** `xaheen plugin publish` reads `package.json` metadata and pushes to registry.

---

## 8. License Server

### 8.1 Flow

1. User submits purchase → License Server creates a signed license JSON:

   ```json
   {
     "features": ["frontend","backend","ai","multiTenant"],
     "expires": "2026-08-01",
     "tenantId": "abc123"
   }
   ```
2. CLI: `xaheen license activate <key>` → fetches and verifies JSON signature → saves to `~/.xaheen/license.json`.
3. On each command, CLI checks `license.features.includes(requiredFeature)` and errors if missing.

---

## 9. Documentation Portal

* **Live MDX** docs generated from code templates and API specs.
* **Sections:**

  * Getting Started
  * CLI Reference
  * Web Dashboard Guide
  * Developer Guide (writing generators, MCP prompts)
  * Compliance & Security

---

## 10. Operational & Deployment

* **Infrastructure:** Kubernetes cluster for MCP, Admin Portal, License Server; Node-based CLI is npm-distributed.
* **CI/CD:** GitHub Actions for CLI tests, npm publish; Helm charts for web components.
* **Monitoring:** Prometheus/Grafana for uptime; Sentry for errors; telemetry pipeline for feature usage.
* **Security:** WAF in front of web services; mTLS between internal services; regular dependency scans.

---

## 11. Examples & Tutorials

1. **Blog App Tutorial:**

   * `xaheen new blog-app --preset=nextjs`
   * `xaheen generate model Post --fields="title:string content:text"`
   * `xaheen scaffold --preset=frontend-only` (add pages)
   * `xaheen generate component PostList --ai="responsive list of posts"`

2. **BankID Auth Integration:**

   * `xaheen generate integration auth --provider=bankid`
   * Wire up callback URL in Admin Portal → test in sandbox.

3. **Multi-Tenant SaaS:**

   * `xaheen scaffold --preset=multi-tenant`
   * `xaheen generate service Tenant` → provisioning workflow.
   * Validate tenant isolation with automated Jest tests.

---

> This completes the in-depth documentation of **every Xaheen feature and component**—all presented inline per your request. Let me know if you need further elaboration or code-sample deep dives!
