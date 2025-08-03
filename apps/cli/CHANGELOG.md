# xaheen

## 0.3.2

### Patch Changes

- **🔧 CRITICAL FIX**: Fixed missing Handlebars `ne` (not equal) helper
  - Root cause: Template processing failed when using `{{#if (ne testing "none")}}`
  - Added `handlebars.registerHelper("ne", (a, b) => a !== b)` to template processor
  - Fixed JSON syntax errors in generated `package.json` templates
  - All conditional template blocks now process correctly

- **📋 Enhanced Reproducible Commands**: Added all missing CLI options
  - Added localization flags: `--locales`, `--primary-locale`
  - Added authentication flags: `--auth-providers`, `--mfa`, `--encryption`, `--audit`
  - Added integration flags: `--integrations`, `--documents`
  - Added all service configuration flags: `--testing`, `--notifications`, `--payments`, etc.
  - Reproducible commands now include complete configuration for full project recreation

- **✅ Full CLI Alignment**: Reproducible command generation now matches ProjectConfig interface
  - All 20+ new CLI options properly included when non-default values are used
  - Conditional flag inclusion prevents command bloat (only adds non-"none" values)
  - Generated commands are now truly reproducible with identical project output

## 0.3.1

### Patch Changes

- **🔧 CRITICAL FIX**: Fixed `--ui` flag not being passed to template context
  - Root cause: Incorrect argument order in `processAndValidateFlags` function call
  - Fixed argument order: `projectName`, `options`, `providedFlags`
  - Template conditional logic `{{#if (eq ui "xala")}}` now works correctly
  - `--ui=xala` properly generates Xala UI System components
  - `--ui=default` generates standard HTML elements as expected

- **🔧 TypeScript Compilation Fixes**: Resolved all implicit `any` parameter errors
  - Added explicit type annotations to filter function parameters
  - Fixed `ProjectConfig` interface compliance issues
  - Fixed property names: `gitInit` → `git`, `installDeps` → `install`
  - Fixed `frontend` property type: string → array `["next"]`
  - Added missing required properties to default config

- **✅ Verification**: All template conditional rendering now working
  - Xala UI System imports: `Container`, `Card`, `Text`, `CodeBlock`, etc.
  - Localization with `useTranslation` and `t()` function calls
  - Explicit TypeScript return types: `JSX.Element`
  - Zero raw HTML elements when using `--ui=xala`
  - Design tokens through semantic component props

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
