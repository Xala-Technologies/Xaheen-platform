# Xaheen Platform Implementation Checklist - Part 1
## Foundation, Types, and Core CLI Enhancement

**For AI Coding Agent Implementation**  
**Date**: 2025-08-01

---

## 🏗️ **PHASE 1: FOUNDATION AND SETUP**

### **Story 1.1: Package Cleanup and Extraction**
- [ ] Remove `packages/ai-services/` directory completely
- [ ] Remove `packages/localization/` directory completely  
- [ ] Remove `packages/validation/` directory completely
- [ ] Keep `packages/compliance/` temporarily for extraction
- [ ] Keep `packages/core/` temporarily for extraction
- [ ] Keep `packages/types/` temporarily for extraction
- [ ] Update root `package.json` workspaces to remove deleted packages
- [ ] Update `turbo.json` to remove references to deleted packages
- [ ] Run `bun install` to clean up dependencies

### **Story 1.2: CLI Directory Structure Creation**
- [ ] Create `apps/cli/src/interfaces/` directory
- [ ] Create `apps/cli/src/infrastructure/` directory
- [ ] Create `apps/cli/src/validators/` directory
- [ ] Create `apps/cli/src/ui-systems/` directory
- [ ] Create `apps/cli/src/localization/` directory
- [ ] Create `apps/cli/src/integrations/` directory
- [ ] Create `apps/cli/src/documents/` directory
- [ ] Create `apps/cli/src/generators/` directory
- [ ] Create `apps/cli/templates/xala/` directory
- [ ] Create `apps/cli/templates/compliance/` directory
- [ ] Create `apps/cli/templates/localization/` directory

### **Story 1.3: Enhanced Template Structure**
- [ ] Create `apps/cli/templates/xala/components/` directory
- [ ] Create `apps/cli/templates/xala/pages/` directory
- [ ] Create `apps/cli/templates/xala/layouts/` directory
- [ ] Create `apps/cli/templates/compliance/norwegian/` directory
- [ ] Create `apps/cli/templates/compliance/gdpr/` directory
- [ ] Create `apps/cli/templates/compliance/wcag/` directory
- [ ] Create `apps/cli/templates/localization/nb/` directory
- [ ] Create `apps/cli/templates/localization/en/` directory
- [ ] Create `apps/cli/templates/localization/fr/` directory
- [ ] Create `apps/cli/templates/localization/ar/` directory

---

## 🔧 **PHASE 2: TYPE SYSTEM AND INTERFACES**

### **Story 2.1: Core Type Definitions**
- [ ] Create `apps/cli/src/interfaces/types.ts` with all utility types from packages/types
- [ ] Add `UISystem = "default" | "xala"` type definition
- [ ] Add `ComplianceLevel = "none" | "gdpr" | "norwegian"` type definition
- [ ] Add `SupportedLanguage = "en" | "nb" | "fr" | "ar"` type definition
- [ ] Add `AuthProvider` type with vipps, bankid, oauth, email, passwordless options
- [ ] Add `Integration` type with slack, teams, altinn, vipps, stripe options
- [ ] Add `DocumentService` type with pdf-export, csv-import, invoices options
- [ ] Add `NSMClassification` type with OPEN, INTERNAL, RESTRICTED, CONFIDENTIAL
- [ ] Add `WCAGLevel = "A" | "AA" | "AAA"` type definition

### **Story 2.2: Generator Interfaces**
- [ ] Create `apps/cli/src/interfaces/generators.ts` with all generation interfaces
- [ ] Add `BaseGenerationOptions` interface with common properties
- [ ] Add `ComponentGenerationOptions` interface extending base options
- [ ] Add `PageGenerationOptions` interface extending base options
- [ ] Add `ModelGenerationOptions` interface extending base options
- [ ] Add `LayoutGenerationOptions` interface extending base options
- [ ] Add `ApiGenerationOptions` interface extending base options
- [ ] Add `TestGenerationOptions` interface extending base options
- [ ] Add `GenerationResult` interface with success, files, errors, warnings
- [ ] Add `GeneratedFile` interface with path, content, type, size properties

### **Story 2.3: Compliance Interfaces**
- [ ] Create `apps/cli/src/interfaces/compliance.ts` with all compliance types
- [ ] Add `WCAGComplianceResult` interface with level, violations, warnings, score
- [ ] Add `WCAGViolation` interface with rule, description, impact, elements, helpUrl
- [ ] Add `GDPRComplianceResult` interface with dataTypes, consentMechanisms, score
- [ ] Add `NSMComplianceResult` interface with classification, securityMeasures, score
- [ ] Add `NorwegianComplianceResult` interface combining GDPR, NSM, WCAG
- [ ] Add `ComplianceValidator` interface with validation methods
- [ ] Add `ComplianceReport` interface with project info and results
- [ ] Add `ActionItem` interface for compliance remediation tasks

### **Story 2.4: Advanced Configuration Types**
- [ ] Add `LocalizationConfig` interface with primary, supported, fallback languages
- [ ] Add `AuthConfig` interface with providers, mfa, session configuration
- [ ] Add `IntegrationConfig` interface with enabled services and API keys
- [ ] Add `DocumentConfig` interface with services, templates, compliance settings
- [ ] Add `SecurityConfig` interface with encryption, audit, classification settings
- [ ] Add `CompleteProjectConfig` interface combining all configuration options
- [ ] Add `CLIOptions` interface for command-line parameters
- [ ] Add `ProgressStep` interface for progress tracking
- [ ] Add `CLIResult` interface for command execution results

### **Story 2.5: Interface Index and Exports**
- [ ] Create `apps/cli/src/interfaces/index.ts` exporting all interfaces
- [ ] Export all types from `./types`
- [ ] Export all generators from `./generators`
- [ ] Export all compliance from `./compliance`
- [ ] Update existing CLI files to import from `./interfaces`

---

## 🎯 **PHASE 3: CLI CORE ENHANCEMENT**

### **Story 3.1: Schema Definitions**
- [ ] Update `apps/cli/src/types.ts` to add `UISystemSchema = z.enum(["default", "xala"])`
- [ ] Add `ComplianceSchema = z.enum(["none", "gdpr", "norwegian"])`
- [ ] Add `LanguageSchema = z.enum(["en", "nb", "fr", "ar"])`
- [ ] Add `AuthProviderSchema = z.enum(["vipps", "bankid", "oauth", "email", "passwordless"])`
- [ ] Add `IntegrationSchema = z.enum(["slack", "teams", "altinn", "vipps", "stripe"])`
- [ ] Add `DocumentServiceSchema = z.enum(["pdf-export", "csv-import", "invoices", "reports"])`
- [ ] Add `NSMClassificationSchema = z.enum(["OPEN", "INTERNAL", "RESTRICTED", "CONFIDENTIAL"])`

### **Story 3.2: Enhanced Init Command**
- [ ] Update `init` procedure in `apps/cli/src/index.ts` to add `ui` parameter
- [ ] Add `compliance` parameter with default "none"
- [ ] Add `locales` parameter as array of supported languages
- [ ] Add `primaryLocale` parameter with default "en"
- [ ] Add `auth` parameter as array of auth providers
- [ ] Add `integrations` parameter as array of integration services
- [ ] Add `documents` parameter as array of document services
- [ ] Add `mfa` boolean parameter for multi-factor authentication
- [ ] Add `encryption` boolean parameter for data encryption
- [ ] Add `audit` boolean parameter for audit logging

### **Story 3.3: Individual Generation Commands**
- [ ] Add `component` procedure to tRPC router with name and options parameters
- [ ] Add `page` procedure to tRPC router with name and options parameters
- [ ] Add `model` procedure to tRPC router with name and options parameters
- [ ] Add `layout` procedure to tRPC router with name and options parameters
- [ ] Add `hook` procedure to tRPC router with name and options parameters
- [ ] Add `service` procedure to tRPC router with name and options parameters
- [ ] Add `feature` procedure to tRPC router for bulk generation
- [ ] Add `validate` procedure to tRPC router for compliance validation
- [ ] Add proper input validation for all new procedures
- [ ] Add error handling and user feedback for all procedures

### **Story 3.4: Localization Commands**
- [ ] Add `locale` procedure group to tRPC router
- [ ] Add `locale.add` subcommand for adding languages to existing project
- [ ] Add `locale.extract` subcommand for extracting translation keys
- [ ] Add `locale.import` subcommand for importing translations from files
- [ ] Add `locale.export` subcommand for exporting translations to files
- [ ] Add `locale.validate` subcommand for validating translations
- [ ] Add proper input validation for locale commands
- [ ] Add progress tracking for locale operations

### **Story 3.5: Authentication Commands**
- [ ] Add `auth` procedure group to tRPC router
- [ ] Add `auth.add` subcommand for adding auth providers to existing project
- [ ] Add `auth.component` subcommand for generating auth components
- [ ] Add `auth.page` subcommand for generating auth pages
- [ ] Add `auth.service` subcommand for generating auth services
- [ ] Add `auth.oauth` subcommand for configuring OAuth providers
- [ ] Add `auth.session` subcommand for configuring session management
- [ ] Add proper validation for auth provider configurations

### **Story 3.6: Integration Commands**
- [ ] Add `integration` procedure group to tRPC router
- [ ] Add `integration.add` subcommand for adding integrations to existing project
- [ ] Add `integration.component` subcommand for generating integration components
- [ ] Add `integration.service` subcommand for generating integration services
- [ ] Add `integration.webhook` subcommand for generating webhook handlers
- [ ] Add `integration.config` subcommand for configuring API keys and settings
- [ ] Add `integration.test` subcommand for testing integration connections
- [ ] Add `integration.docs` subcommand for generating integration documentation

### **Story 3.7: Document Commands**
- [ ] Add `document` procedure group to tRPC router
- [ ] Add `document.add` subcommand for adding document services to existing project
- [ ] Add `document.component` subcommand for generating document components
- [ ] Add `document.template` subcommand for creating document templates
- [ ] Add `document.service` subcommand for generating document services
- [ ] Add proper validation for document service configurations
- [ ] Add support for Norwegian-specific document formats

### **Story 3.8: Compliance Commands**
- [ ] Add `compliance` procedure group to tRPC router
- [ ] Add `compliance.add` subcommand for adding compliance features to existing project
- [ ] Add `compliance.validate` subcommand for validating project compliance
- [ ] Add `compliance.report` subcommand for generating compliance reports
- [ ] Add support for GDPR, NSM, and WCAG compliance validation
- [ ] Add proper error handling and remediation suggestions
- [ ] Add compliance scoring and certification levels
