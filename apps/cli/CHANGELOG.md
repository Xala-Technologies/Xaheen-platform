# xaheen

## 0.3.0

### Minor Changes

- c46f5df: ## 🎉 Major Template System Fixes and Xala UI System Integration

  ### ✅ **Fixed All Handlebars Parsing Errors**

  - Fixed object literal escaping using `{{{{raw}}}} ... {{{{/raw}}}}` syntax
  - Fixed equality operators from `===` to `(eq)` helper syntax
  - Fixed comment syntax issues with `{{}}` in compliance rules
  - Zero parsing errors during project generation

  ### 🚀 **Xala UI System Integration**

  - Added complete Xala UI System v5 support with `--ui=xala` flag
  - Conditional template generation working perfectly
  - Semantic components only when using Xala UI System
  - Design token integration and 8pt grid system

  ### 🌍 **Norwegian Compliance & Localization**

  - Added Norwegian compliance features with `--compliance=norwegian`
  - Multi-language support: English, Norwegian Bokmål, French, Arabic
  - GDPR and WCAG 2.2 AAA compliance integration
  - BankID and Vipps authentication support

  ### 📦 **GitHub Package Integration**

  - Added GitHub package registry support in `.npmrc`
  - Xaheen Auth packages: `@xaheen/auth`, `@xaheen/auth-drizzle-adapter`
  - Xala UI System packages: `@xala-technologies/ui-system`
  - Proper authentication token configuration

  ### 🔧 **Template Improvements**

  - Fixed providers.tsx template with complete provider hierarchy
  - Fixed middleware.ts template for internationalization
  - Fixed dashboard templates with chart data objects
  - Fixed component templates with conditional logic
  - Fixed configuration templates with platform objects

  ### 📁 **Generated Project Structure**

  - Complete project scaffolding with all expected files
  - Proper TypeScript configuration with strict mode
  - ESLint rules with localization enforcement
  - Tailwind configuration with Xala design tokens
  - All translation files automatically generated

  This release makes the Xaheen CLI fully production-ready with comprehensive Xala UI System integration and Norwegian compliance support.

## 0.1.0

- Initial release

## 0.2.0

- Added Norwegian compliance features with `--compliance=norwegian`
- Added Xala UI System v5 support with `--ui=xala` flag
- Added GitHub package registry support in `.npmrc`
- Added Xaheen Auth packages: `@xaheen/auth`, `@xaheen/auth-drizzle-adapter`
- Added Xala UI System packages: `@xala-technologies/ui-system`
