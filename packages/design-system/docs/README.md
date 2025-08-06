# 📚 Xaheen Design System Documentation

Welcome to the comprehensive documentation for the Xaheen Design System - a LEGO block architecture design system.

## 📖 Documentation Structure

### 🏗️ **Architecture**
- **[LEGO Architecture](./architecture/LEGO_ARCHITECTURE.md)** - Core LEGO block principles and v0 integration
- **[Registry Architecture](./architecture/REGISTRY_ARCHITECTURE.md)** - Component registry structure and patterns  
- **[Localization Architecture](./architecture/LOCALIZATION_ARCHITECTURE.md)** - Props-based i18n system
- **[Implementation Summary](./architecture/IMPLEMENTATION_SUMMARY.md)** - Complete implementation overview
- **[Design System Summary](./architecture/DESIGN_SYSTEM_SUMMARY.md)** - High-level design system overview

### 📋 **Guides**
- **[Registry Usage Guide](./guides/REGISTRY_USAGE.md)** - How to use the component registry
- **[UI Compliance Guide](./guides/UI_COMPLIANCE.md)** - Accessibility and compliance standards

### 🔌 **API Reference**
- **Component APIs** - Individual component documentation (generated)
- **Token System** - Design token reference
- **Utility Functions** - Helper function documentation

## 🚀 Quick Start

```typescript
// Install the package
npm install @xaheen-ai/design-system

// Import components (LEGO blocks)
import { Button, GlobalSearch, ChatInterface } from '@xaheen-ai/design-system';

// Use with props-based localization
<GlobalSearch
  onSearch={searchAPI}
  texts={{
    placeholder: "Search everything...",
    noResultsFound: "No results found"
  }}
  callbacks={{
    onResultClick: handleClick
  }}
/>
```

## 🧱 LEGO Block Philosophy

Our design system follows the LEGO block approach:
- **🧱 Atoms**: Pure UI components (Button, Input, Card)
- **🧱🧱 Molecules**: Simple combinations (ThemeSwitcher)  
- **🧱🧱🧱 Organisms**: Complex blocks (GlobalSearch, ChatInterface)
- **100% Pure**: No internal state, everything via props
- **v0 Compatible**: Perfect for AI tools and code generation

## 🌍 Props-Based Localization

Every text string is customizable via props:

```typescript
// English
<ChatInterface texts={{ sendLabel: "Send", placeholder: "Type message..." }} />

// Norwegian  
<ChatInterface texts={{ sendLabel: "Send", placeholder: "Skriv melding..." }} />

// Any language - no rebuilds needed!
```

## 📦 Bundle Information

- **Minimal App**: 8.4kb (essentials only)
- **Full Dashboard**: 34kb (complete functionality)
- **Tree-Shakeable**: Pay only for what you use
- **Zero Dependencies**: Pure components with prop injection

## 🤖 AI Integration

Perfect for AI tools like v0.dev:
- Clear, predictable interfaces
- Comprehensive TypeScript definitions
- Self-documenting components
- Dependency resolution system

---

**Ready to build with LEGO blocks!** 🧱✨