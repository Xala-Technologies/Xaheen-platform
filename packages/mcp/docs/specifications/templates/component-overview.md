---
title: "{{metadata.name}}"
category: "{{metadata.category}}"
version: "{{metadata.version}}"
semanticVersion: "{{metadata.semanticVersion}}"
stability: "{{metadata.stability}}"
nsmClassification: "{{compliance.norwegian.nsmClassification}}"
wcagLevel: "{{compliance.wcag.level}}"
platforms: {{#each platforms.supported}}"{{this}}"{{#unless @last}}, {{/unless}}{{/each}}
lastUpdated: "{{metadata.updatedAt}}"
---

# {{metadata.name}}

{{#if metadata.description}}
{{metadata.description}}
{{/if}}

{{#if metadata.keywords}}
**Keywords**: {{#each metadata.keywords}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}

## Component Information

| Property | Value |
|----------|-------|
| **Category** | {{metadata.category}} {{#if metadata.subcategory}}({{metadata.subcategory}}){{/if}} |
| **Version** | {{metadata.version}} |
| **Architecture** | {{metadata.semanticVersion}} |
| **Stability** | {{metadata.stability}} |
| **Platforms** | {{#each platforms.supported}}{{this}}{{#unless @last}}, {{/unless}}{{/each}} |

## Compliance Status

### Norwegian Compliance
- **NSM Classification**: {{compliance.norwegian.nsmClassification}}
- **GDPR Compliant**: {{#if compliance.norwegian.gdprCompliant}}✅ Yes{{else}}❌ No{{/if}}
{{#if compliance.norwegian.designSystem.altinnCompliant}}
- **Altinn Compatible**: ✅ Yes
{{/if}}
{{#if compliance.norwegian.designSystem.governmentApproved}}
- **Government Approved**: ✅ Yes
{{/if}}
{{#if compliance.norwegian.auditTrail}}
- **Audit Trail**: ✅ Enabled
{{/if}}

### Accessibility
- **WCAG Level**: {{compliance.wcag.level}}
- **Tested**: {{#if compliance.wcag.tested}}✅ Yes{{else}}❌ No{{/if}}
- **Guidelines Met**: {{#each compliance.wcag.guidelines}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

### Internationalization
- **Supported**: {{#if compliance.i18n.supported}}✅ Yes{{else}}❌ No{{/if}}
- **Default Locale**: {{compliance.i18n.defaultLocale}}
- **Supported Locales**: {{#each compliance.i18n.supportedLocales}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{#if compliance.i18n.textDirection}}
- **Text Direction**: {{#each compliance.i18n.textDirection}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}

## Quick Start

### Installation

```bash
npm install @xala-technologies/ui-system
```

### Basic Usage

{{#if examples}}
{{#each examples}}
{{#if @first}}
```{{#each code}}{{#if @first}}{{@key}}{{/if}}{{/each}}
{{#each code}}{{#if @first}}{{this}}{{/if}}{{/each}}
```
{{/if}}
{{/each}}
{{else}}
```tsx
import { {{metadata.name}} } from '@xala-technologies/ui-system';

function App() {
  return (
    <{{metadata.name}}{{#each props.groups.required}} {{this}}="value"{{/each}}>
      Content
    </{{metadata.name}}>
  );
}
```
{{/if}}

## Props API

### Required Props
{{#if props.groups.required}}
{{#each props.groups.required}}
- **{{this}}**: {{#with (lookup ../props.schema this)}}{{type}}{{#if description}} - {{description}}{{/if}}{{/with}}
{{/each}}
{{else}}
*No required props*
{{/if}}

### Optional Props
{{#if props.groups.optional}}
{{#each props.groups.optional}}
- **{{this}}**: {{#with (lookup ../props.schema this)}}{{type}}{{#if default}} = `{{default}}`{{/if}}{{#if description}} - {{description}}{{/if}}{{/with}}
{{/each}}
{{else}}
*No optional props*
{{/if}}

### Deprecated Props
{{#if props.groups.deprecated}}
{{#each props.groups.deprecated}}
- **{{name}}**: {{reason}}{{#if alternative}} Use `{{alternative}}` instead.{{/if}}
{{/each}}
{{else}}
*No deprecated props*
{{/if}}

## Variants

{{#if variants.simple}}
### Simple Variants
{{#each variants.simple}}
#### {{@key}}
{{#each values}}
- **{{@key}}**: `{{this}}`
{{/each}}
{{#if defaultValue}}
*Default*: {{defaultValue}}
{{/if}}

{{/each}}
{{/if}}

{{#if variants.compound}}
### Compound Variants
{{#each variants.compound}}
- **Conditions**: {{#each conditions}}{{@key}}="{{this}}"{{#unless @last}} + {{/unless}}{{/each}}
- **Classes**: `{{className}}`
{{#if description}}
- **Description**: {{description}}
{{/if}}

{{/each}}
{{/if}}

## Accessibility Features

### ARIA Roles
- **Primary Role**: {{accessibility.role.primary}}
{{#if accessibility.role.additional}}
- **Additional Roles**: {{#each accessibility.role.additional}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}

### Keyboard Navigation
{{#if accessibility.keyboardNavigation.supported}}
✅ **Keyboard navigation supported**

{{#if accessibility.keyboardNavigation.patterns}}
| Key | Action | Context |
|-----|--------|---------|
{{#each accessibility.keyboardNavigation.patterns}}
| `{{key}}` | {{action}} | {{context}} |
{{/each}}
{{/if}}

{{#if accessibility.keyboardNavigation.focusManagement}}
**Focus Management**:
{{#if accessibility.keyboardNavigation.focusManagement.trapFocus}}
- ✅ Focus trapping enabled
{{/if}}
{{#if accessibility.keyboardNavigation.focusManagement.restoreFocus}}
- ✅ Focus restoration enabled
{{/if}}
{{#if accessibility.keyboardNavigation.focusManagement.skipLinks}}
- ✅ Skip links provided
{{/if}}
{{/if}}
{{else}}
❌ **Keyboard navigation not supported**
{{/if}}

### Screen Reader Support
{{#if accessibility.screenReader.announcements}}
**Announcements**:
{{#each accessibility.screenReader.announcements}}
- **{{trigger}}**: "{{message}}" ({{priority}})
{{/each}}
{{/if}}

**Required Labels**: {{#each accessibility.screenReader.labels.required}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

## Examples

{{#if examples}}
{{#each examples}}
### {{name}}

{{description}}

{{#if category}}
*Category: {{category}}*
{{/if}}

{{#each code}}
```{{@key}}
{{this}}
```
{{/each}}

{{#if props}}
**Props used**:
```json
{{json props}}
```
{{/if}}

{{#if notes}}
> {{notes}}
{{/if}}

---

{{/each}}
{{else}}
*No examples available. Check the [getting started guide](../getting-started.md) for usage patterns.*
{{/if}}

## Platform Implementations

{{#each platforms.implementations}}
### {{@key}}

{{#if templatePath}}
**Template**: `{{templatePath}}`
{{/if}}

{{#if dependencies}}
**Dependencies**:
```bash
npm install {{#each dependencies}}{{this}}{{#unless @last}} {{/unless}}{{/each}}
```
{{/if}}

{{#if imports}}
**Imports**:
```{{@key}}
{{#each imports}}
import { {{#each imports}}{{this}}{{#unless @last}}, {{/unless}}{{/each}} } from '{{module}}';
{{/each}}
```
{{/if}}

{{#if examples}}
**Examples**:
{{#each examples}}
```{{language}}
{{code}}
```
{{#if description}}
*{{description}}*
{{/if}}
{{/each}}
{{/if}}

---

{{/each}}

## Performance

{{#if performance}}
### Metrics
{{#if performance.metrics.bundleSize}}
- **Bundle Size**: {{performance.metrics.bundleSize.max}}{{#if performance.metrics.bundleSize.gzipped}} ({{performance.metrics.bundleSize.gzipped}} gzipped){{/if}}
{{/if}}
{{#if performance.metrics.renderTime}}
- **Initial Render**: {{performance.metrics.renderTime.initial}}
- **Update Render**: {{performance.metrics.renderTime.update}}
{{/if}}

{{#if performance.optimizations}}
### Optimizations
{{#each performance.optimizations}}
- {{this}}
{{/each}}
{{/if}}
{{else}}
*No performance metrics specified*
{{/if}}

## Testing

{{#if testing}}
{{#if testing.unit}}
### Unit Testing
{{#if testing.unit.required}}
**Required Tests**:
{{#each testing.unit.required}}
- {{this}}
{{/each}}
{{/if}}

{{#if testing.unit.coverage}}
**Coverage Requirement**: {{testing.unit.coverage.minimum}}%
{{/if}}
{{/if}}

{{#if testing.integration}}
### Integration Testing
{{#if testing.integration.scenarios}}
**Test Scenarios**:
{{#each testing.integration.scenarios}}
- {{this}}
{{/each}}
{{/if}}
{{/if}}

{{#if testing.visual}}
### Visual Testing
{{#if testing.visual.regression}}
- ✅ Visual regression testing
{{/if}}
{{#if testing.visual.responsive}}
- ✅ Responsive design testing
{{/if}}
{{/if}}
{{else}}
*No testing requirements specified*
{{/if}}

## AI Generation

{{#if ai}}
{{#if ai.generation}}
- **Priority**: {{ai.generation.priority}}
- **Complexity**: {{ai.generation.complexity}}
{{#if ai.generation.estimatedTokens}}
- **Estimated Tokens**: {{ai.generation.estimatedTokens}}
{{/if}}
{{/if}}

{{#if ai.optimization.hints}}
### Optimization Hints
{{#each ai.optimization.hints}}
- {{this}}
{{/each}}
{{/if}}

{{#if ai.optimization.patterns}}
### Recommended Patterns
{{#each ai.optimization.patterns}}
- **{{pattern}}**: {{recommendation}}
  - *Context*: {{context}}
{{/each}}
{{/if}}

{{#if ai.optimization.antiPatterns}}
### Anti-Patterns to Avoid
{{#each ai.optimization.antiPatterns}}
- **❌ {{pattern}}**: {{reason}}
  - *Alternative*: {{alternative}}
{{/each}}
{{/if}}
{{else}}
*No AI optimization metadata provided*
{{/if}}

## Related Components

{{#if metadata.category}}
- [Browse {{metadata.category}} components](../{{metadata.category}}/)
{{/if}}
- [Component Gallery](https://xala-ui.dev/components)
- [Design System](https://xala-ui.dev/design)

## Support

- **Documentation**: [Full Documentation](../../README.md)
- **GitHub**: [Report Issues](https://github.com/xala-technologies/ui-system/issues)
- **Email**: [support@xala-technologies.com](mailto:support@xala-technologies.com)

---

{{#if metadata.maintainer}}
*Maintained by {{metadata.maintainer.name}}{{#if metadata.maintainer.team}} ({{metadata.maintainer.team}}){{/if}}*
{{/if}}

*Last updated: {{metadata.updatedAt}}*