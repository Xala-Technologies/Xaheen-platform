# Xala UI System MCP Server Demo

This demonstrates the new shadcn-ui blocks integration and AST-driven transformer capabilities.

## New Tools Available

### 1. Platform Recommendations Tool

Get comprehensive platform-specific recommendations:

```json
{
  "tool": "get_platform_recommendations",
  "arguments": {
    "platform": "react", 
    "theme": "enterprise",
    "focus": "performance"
  }
}
```

**Returns:** Detailed performance recommendations for React with enterprise theme, including:
- Component optimization rules
- Bundle optimization strategies  
- Code examples and anti-patterns
- Resources and best practices

### 2. shadcn-ui Blocks Integration

#### List Available Blocks
```json
{
  "tool": "list_shadcn_blocks", 
  "arguments": {
    "category": "authentication",
    "framework": "react"
  }
}
```

#### Get Specific Block
```json
{
  "tool": "get_shadcn_block",
  "arguments": {
    "name": "login-01"
  }
}
```

#### Generate Component from Block
```json
{
  "tool": "generate_from_shadcn_block",
  "arguments": {
    "blockName": "login-01",
    "customizations": {
      "name": "EnterpriseLoginForm",
      "theme": "enterprise", 
      "modifications": ["Add Norwegian localization", "Apply WCAG AAA standards"]
    }
  }
}
```

#### Convert Block to Different Platform
```json
{
  "tool": "convert_shadcn_block_to_platform",
  "arguments": {
    "blockName": "dashboard-01",
    "targetPlatform": "vue"
  }
}
```

### 3. AST-Driven Transformer

Transform any React/JSX code to apply Xala UI conventions:

```json
{
  "tool": "transform_with_xala_conventions",
  "arguments": {
    "sourceCode": "export function LoginButton() { return <button className=\"bg-blue-500 text-white p-2 rounded\">Login</button>; }",
    "theme": "enterprise",
    "platform": "react",
    "enforceAccessibility": true,
    "norwegianCompliance": true
  }
}
```

**This will:**
- Apply enterprise design tokens (slate colors instead of blue)
- Add proper button sizing (h-12 instead of p-2)
- Add aria-label for accessibility
- Add useTranslation hook for Norwegian compliance
- Convert hardcoded text to i18n calls
- Enforce WCAG AAA standards

## Integration Benefits

### 1. **Reuses shadcn's Rich Block Library**
- Access to 50+ production-ready blocks
- Authentication, dashboards, forms, navigation
- Continuously updated by shadcn community

### 2. **Applies Rules & Design Tokens Programmatically**
- Enterprise, Finance, Healthcare, Education themes
- Norwegian compliance (NSM, GDPR, UU standards)
- WCAG AAA accessibility enforcement
- Semantic spacing and typography scales

### 3. **AST-Driven Transformer**
- Programmatic code transformation
- Enforces Xala UI conventions at syntax level
- Automatic i18n integration for Norwegian compliance
- Design token replacement
- Accessibility attribute injection

## Example Transformation

**Input:**
```tsx
function UserCard({ name }) {
  return (
    <div className="bg-blue-500 p-2 rounded">
      <h3 className="text-white">Welcome, {name}</h3>
      <button className="bg-white text-blue-500 p-1 rounded" onClick={() => alert('Hi!')}>
        Click me
      </button>
    </div>
  );
}
```

**Output (Enterprise Theme + Norwegian Compliance):**
```tsx
import { useTranslation } from 'react-i18next';

function UserCard({ name }: { readonly name: string }): JSX.Element {
  const { t } = useTranslation();
  
  return (
    <div className="bg-slate-900 p-8 rounded-xl shadow-lg">
      <h3 className="text-slate-50 text-xl font-semibold">{t('welcome.message', { name })}</h3>
      <button 
        className="bg-slate-50 text-slate-900 h-12 px-6 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" 
        onClick={() => alert(t('greeting.message'))}
        aria-label={t('button.greeting.label')}
      >
        {t('button.greeting.text')}
      </button>
    </div>
  );
}
```

**Applied Transformations:**
- ✅ Added TypeScript interface with readonly props
- ✅ Added explicit JSX.Element return type  
- ✅ Applied enterprise design tokens (slate colors)
- ✅ Upgraded to professional sizing (h-12, p-8, rounded-xl)
- ✅ Added shadow and hover states
- ✅ Added proper accessibility attributes
- ✅ Converted all text to i18n calls
- ✅ Added focus management
- ✅ Added useTranslation hook

## Architecture Integration

This seamlessly integrates with existing Xala UI System v5.0:

1. **Component Specifications** - Still drives the core architecture
2. **shadcn-ui Blocks** - Provides rich UI block library via MCP  
3. **AST Transformer** - Enforces conventions programmatically
4. **Platform Support** - Works across React, Vue, Angular, Svelte
5. **Norwegian Compliance** - Built-in NSM, GDPR, UU standards
6. **Enterprise Themes** - Finance, Healthcare, Education optimizations

The result is a powerful system that combines:
- shadcn-ui's rich component ecosystem
- Xala UI's enterprise conventions
- Norwegian regulatory compliance
- Multi-platform architecture support
- AST-driven code transformation
- Comprehensive accessibility standards