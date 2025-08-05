## 📋 **EPIC 14: MCP Core Server Enhancement**

### **Story 14.1: Full MCP Package Integration** ✅

*Leverage the published `xala-mcp` npm package to power all AI-native generator workflows*

* [x] Install and version-pin `xala-mcp` in the CLI's `package.json`
* [x] Expose MCP client initialization with enterprise credentials and context loaders
* [x] Implement `xaheen mcp index` to bootstrap AI context from project files via `xala-mcp` APIs
* [x] Integrate MCP telemetry for usage reporting and continuous feedback

### **Story 14.2: Generator Orchestration via MCP** ✅

*Use MCP as the central orchestrator for all `generate`, `scaffold`, and `ai code` commands*

* [x] Refactor `xaheen generate` handlers to delegate template selection to the `xala-mcp` recommendation engine
* [x] Pipe CLI parameter schemas into `mcp.generateSpec` to dynamically compose generation specifications
* [ ] Capture and store MCP execution logs for auditability and replayability

### **Story 14.3: AI-First Content Generation** ✅

*Deeply integrate MCP's LLM pipelines for content-heavy scaffolding*

* [x] Implement `mcp.generateComponent` to produce AI-authored UI component code with design tokens embedded
* [x] Leverage `mcp.generateService` for boilerplate microservice code, including controllers, tests, and documentation
* [x] Use `mcp.enhanceCode` for post-generation refactoring (compliance checks, performance optimizations, accessibility fixes)

### **Story 14.4: MCP Configuration & Extension**

*Enable advanced customization and extension of MCP behaviors*

* [ ] Read default MCP config from `.xaheenrc` and allow overrides via CLI flags
* [ ] Allow users to register custom MCP plugins or prompt templates for domain-specific patterns
* [ ] Provide `xaheen mcp test` command to run integration tests against MCP endpoints

### **Story 14.5: Testing & Validation for MCP Workflows**

*Ensure MCP-driven pipelines remain reliable and enterprise-grade*

* [ ] Unit-test all MCP client wrappers with mocked API responses
* [ ] Integration-test full MCP flows in a sandbox (`index` → `generate` → `preview` → `apply`)
* [ ] Validate error handling and fallback behaviors when MCP is unreachable or times out

---

Let me know if you’d like to expand any of these stories or adjust priorities!
