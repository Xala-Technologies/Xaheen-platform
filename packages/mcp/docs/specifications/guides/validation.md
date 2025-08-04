# Component Specification Validation Guide

This guide covers validation strategies, best practices, and troubleshooting for Xala UI Component Specifications.

## Table of Contents

- [Overview](#overview)
- [Validation Types](#validation-types)
- [Command Reference](#command-reference)
- [Validation Rules](#validation-rules)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Automation](#automation)

## Overview

The Xala UI System provides comprehensive validation to ensure component specifications meet quality standards, compliance requirements, and architectural consistency. Validation includes:

- **Schema Validation**: JSON Schema compliance
- **Norwegian Compliance**: NSM, GDPR, and WCAG requirements
- **Type Safety**: TypeScript type validation
- **Performance Standards**: Bundle size and render time checks
- **Accessibility Compliance**: WCAG AAA validation
- **Security Standards**: Security pattern validation

## Validation Types

### Schema Validation

Validates JSON structure against the component schema:

```bash
# Basic schema validation
npx xala-ui validate --spec ./specs/Button.json

# Strict schema validation
npx xala-ui validate --spec ./specs/Button.json --strict

# Validate all specifications
npx xala-ui validate --all
```

**What it checks**:
- Required properties are present
- Property types match schema definitions
- Enum values are valid
- Format patterns are correct
- Reference integrity

### Norwegian Compliance Validation

Ensures compliance with Norwegian standards:

```bash
# Norwegian compliance validation
npx xala-ui validate --compliance norwegian --spec ./specs/Button.json

# Specific compliance checks
npx xala-ui validate --nsm --spec ./specs/Button.json
npx xala-ui validate --gdpr --spec ./specs/Button.json
npx xala-ui validate --wcag --spec ./specs/Button.json
```

**NSM Classification Validation**:
```json
{
  "compliance": {
    "norwegian": {
      "nsmClassification": "RESTRICTED", // Must be valid NSM level
      "gdprCompliant": true,             // Must be boolean
      "designSystem": {
        "altinnCompliant": true,         // Must be boolean
        "governmentApproved": true       // Must be boolean
      }
    }
  }
}
```

### Accessibility Validation

Validates WCAG compliance and accessibility features:

```bash
# WCAG validation
npx xala-ui validate --wcag --spec ./specs/Button.json

# Specific WCAG level
npx xala-ui validate --wcag AAA --spec ./specs/Button.json

# Accessibility features validation
npx xala-ui validate --a11y --spec ./specs/Button.json
```

**WCAG Requirements**:
- Valid WCAG level (A, AA, AAA)
- Required ARIA attributes
- Keyboard navigation patterns
- Screen reader support
- Color contrast compliance

### Type Safety Validation

Validates TypeScript type definitions:

```bash
# TypeScript validation
npx xala-ui validate --types --spec ./specs/Button.json

# Generate and validate types
npx xala-ui types generate --validate --spec ./specs/Button.json
```

**Type Validation Rules**:
- No `any` types allowed
- Proper prop type definitions
- Function signature validation
- Generic type constraints
- Interface compatibility

### Performance Validation

Validates performance requirements:

```bash
# Performance validation
npx xala-ui validate --performance --spec ./specs/Button.json

# Bundle size validation
npx xala-ui validate --bundle-size --spec ./specs/Button.json

# Render time validation
npx xala-ui validate --render-time --spec ./specs/Button.json
```

**Performance Metrics**:
```json
{
  "performance": {
    "metrics": {
      "bundleSize": {
        "max": "50kb",        // Maximum allowed bundle size
        "gzipped": "15kb"     // Maximum gzipped size
      },
      "renderTime": {
        "initial": "16ms",    // Maximum initial render time
        "update": "8ms"       // Maximum update render time
      }
    }
  }
}
```

## Command Reference

### Basic Validation Commands

```bash
# Validate single specification
npx xala-ui validate --spec ./specs/Button.json

# Validate with specific schema version
npx xala-ui validate --spec ./specs/Button.json --schema v5.0

# Validate all specifications in directory
npx xala-ui validate --dir ./specs

# Validate all specifications in project
npx xala-ui validate --all
```

### Advanced Validation Options

```bash
# Strict validation (no warnings allowed)
npx xala-ui validate --spec ./specs/Button.json --strict

# Verbose output with detailed errors
npx xala-ui validate --spec ./specs/Button.json --verbose

# JSON output for CI/CD integration
npx xala-ui validate --spec ./specs/Button.json --json

# Fail fast (stop on first error)
npx xala-ui validate --all --fail-fast

# Continue on errors (report all issues)
npx xala-ui validate --all --continue
```

### Compliance-Specific Validation

```bash
# Norwegian compliance validation
npx xala-ui validate --compliance norwegian --spec ./specs/Button.json

# NSM security classification
npx xala-ui validate --nsm --spec ./specs/Button.json

# GDPR compliance
npx xala-ui validate --gdpr --spec ./specs/Button.json

# WCAG accessibility
npx xala-ui validate --wcag AAA --spec ./specs/Button.json

# Multi-language support
npx xala-ui validate --i18n --spec ./specs/Button.json
```

### Custom Validation Rules

```bash
# Custom validation rules file
npx xala-ui validate --spec ./specs/Button.json --rules ./validation-rules.json

# Skip specific validation rules
npx xala-ui validate --spec ./specs/Button.json --skip prop-validation,performance

# Only run specific validation rules
npx xala-ui validate --spec ./specs/Button.json --only schema,compliance
```

## Validation Rules

### Core Schema Rules

#### Required Properties
Every specification must include:
- `metadata` - Component identification
- `compliance` - Norwegian and accessibility compliance
- `props` - Component properties
- `accessibility` - Accessibility implementation
- `platforms` - Platform support

#### Metadata Validation
```json
{
  "metadata": {
    "name": "ButtonComponent",      // ✅ PascalCase required
    "version": "1.0.0",            // ✅ Semantic version
    "category": "basic",           // ✅ Valid category
    "description": "A button..."   // ✅ 10-500 characters
  }
}
```

**Common Errors**:
- ❌ `name` not in PascalCase
- ❌ Invalid `version` format
- ❌ Unknown `category` value
- ❌ `description` too short/long

#### Props Validation
```json
{
  "props": {
    "schema": {
      "variant": {
        "type": "string",           // ✅ Valid TypeScript type
        "enum": ["primary", "secondary"], // ✅ Valid enum values
        "default": "primary",       // ✅ Default in enum
        "description": "Visual variant..." // ✅ Meaningful description
      }
    },
    "groups": {
      "required": ["children"],    // ✅ Props exist in schema
      "optional": ["variant"],     // ✅ Props exist in schema
      "deprecated": []             // ✅ Valid deprecated format
    }
  }
}
```

**Common Errors**:
- ❌ Prop referenced in groups but not defined in schema
- ❌ Default value not in enum
- ❌ Invalid TypeScript type
- ❌ Missing required prop descriptions

### Norwegian Compliance Rules

#### NSM Classification
```json
{
  "compliance": {
    "norwegian": {
      "nsmClassification": "RESTRICTED", // ✅ Valid: OPEN, RESTRICTED, CONFIDENTIAL, SECRET
      "gdprCompliant": true,             // ✅ Boolean required
      "auditTrail": true                 // ✅ Boolean when classification > OPEN
    }
  }
}
```

**Validation Rules**:
- RESTRICTED+ classifications require `auditTrail: true`
- CONFIDENTIAL+ classifications require additional security measures
- SECRET classification requires special approval

#### GDPR Compliance
```json
{
  "compliance": {
    "norwegian": {
      "gdprCompliant": true,
      "dataProcessing": {           // ✅ Required if handling personal data
        "purposes": ["analytics"],  // ✅ Valid purposes
        "legalBasis": "consent",   // ✅ Valid legal basis
        "retention": "2 years"     // ✅ Specific retention period
      }
    }
  }
}
```

#### WCAG Compliance
```json
{
  "compliance": {
    "wcag": {
      "level": "AAA",              // ✅ A, AA, or AAA
      "tested": true,              // ✅ Must be tested
      "guidelines": ["1.3.1", "2.1.1"], // ✅ Valid WCAG guidelines
      "colorContrast": {
        "normal": 7.0,             // ✅ AAA requires 7:1
        "large": 4.5,              // ✅ Minimum for large text
        "enhanced": 7.0            // ✅ Enhanced contrast
      }
    }
  }
}
```

### Accessibility Rules

#### Keyboard Navigation
```json
{
  "accessibility": {
    "keyboardNavigation": {
      "supported": true,
      "patterns": [
        {
          "key": "Enter",          // ✅ Valid key name
          "action": "activate",    // ✅ Valid action
          "context": "Description" // ✅ Context required
        }
      ]
    }
  }
}
```

**Valid Key Names**: Enter, Space, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Tab, Escape, Home, End, PageUp, PageDown

#### Screen Reader Support
```json
{
  "accessibility": {
    "screenReader": {
      "announcements": [
        {
          "trigger": "loading",    // ✅ Valid trigger event
          "message": "Loading...", // ✅ Message required
          "priority": "polite"     // ✅ polite or assertive
        }
      ],
      "labels": {
        "required": ["aria-label or text content"] // ✅ Required labels
      }
    }
  }
}
```

### Performance Rules

#### Bundle Size Limits
```json
{
  "performance": {
    "metrics": {
      "bundleSize": {
        "max": "50kb",             // ✅ Under limit
        "gzipped": "15kb"          // ✅ Under gzipped limit
      }
    }
  }
}
```

**Default Limits**:
- Basic components: 50kb max, 15kb gzipped
- Composite components: 100kb max, 30kb gzipped
- Specialized components: 200kb max, 60kb gzipped

## Error Handling

### Error Categories

#### Schema Errors
```json
{
  "errors": [
    {
      "type": "schema",
      "severity": "error",
      "path": "metadata.name",
      "message": "Property must be PascalCase",
      "expected": "PascalCase string",
      "actual": "buttonComponent",
      "fix": "Change to 'ButtonComponent'"
    }
  ]
}
```

#### Compliance Errors
```json
{
  "errors": [
    {
      "type": "compliance",
      "severity": "error",
      "path": "compliance.norwegian.nsmClassification",
      "message": "Invalid NSM classification",
      "expected": "OPEN | RESTRICTED | CONFIDENTIAL | SECRET",
      "actual": "INTERNAL",
      "fix": "Use 'RESTRICTED' for internal use"
    }
  ]
}
```

#### Warning Types
```json
{
  "warnings": [
    {
      "type": "performance",
      "severity": "warning",
      "path": "performance.metrics.bundleSize.max",
      "message": "Bundle size approaching limit",
      "current": "45kb",
      "limit": "50kb",
      "recommendation": "Consider code splitting"
    }
  ]
}
```

### Error Resolution

#### Common Fixes

**PascalCase Name Error**:
```bash
# ❌ Error
"name": "buttonComponent"

# ✅ Fix
"name": "ButtonComponent"
```

**Invalid Category Error**:
```bash
# ❌ Error
"category": "ui-element"

# ✅ Fix
"category": "basic"
```

**Missing Required Property**:
```bash
# ❌ Error - missing compliance
{
  "metadata": { ... },
  "props": { ... }
}

# ✅ Fix - add compliance
{
  "metadata": { ... },
  "compliance": {
    "norwegian": { ... },
    "wcag": { ... }
  },
  "props": { ... }
}
```

## Best Practices

### 1. Validation-First Development

Start with validation before implementation:

```bash
# Create specification
vim specs/NewComponent.json

# Validate immediately
npx xala-ui validate --spec ./specs/NewComponent.json

# Fix errors iteratively
npx xala-ui validate --spec ./specs/NewComponent.json --verbose
```

### 2. Continuous Validation

Set up pre-commit hooks:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npx xala-ui validate --all --strict"
    }
  }
}
```

### 3. Layered Validation

Validate in layers of increasing strictness:

```bash
# Level 1: Basic schema
npx xala-ui validate --spec ./specs/Button.json

# Level 2: Add compliance
npx xala-ui validate --spec ./specs/Button.json --compliance norwegian

# Level 3: Add performance
npx xala-ui validate --spec ./specs/Button.json --performance

# Level 4: Strict validation
npx xala-ui validate --spec ./specs/Button.json --strict
```

### 4. Error Categorization

Handle different error types appropriately:

```bash
# Fail CI on errors, warn on warnings
npx xala-ui validate --all --fail-on error --warn-on warning

# Generate detailed reports
npx xala-ui validate --all --report ./validation-report.json

# Fix auto-fixable issues
npx xala-ui validate --all --fix
```

### 5. Custom Validation Rules

Create project-specific validation rules:

```json
// validation-rules.json
{
  "rules": {
    "custom-naming": {
      "pattern": "^[A-Z][a-zA-Z0-9]*Component$",
      "message": "Component names must end with 'Component'"
    },
    "required-keywords": {
      "minimum": 3,
      "message": "Components must have at least 3 keywords"
    },
    "performance-budget": {
      "bundleSize": {
        "basic": "30kb",
        "composite": "60kb"
      }
    }
  }
}
```

## Automation

### CI/CD Integration

#### GitHub Actions
```yaml
name: Validate Specifications
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Validate specifications
        run: |
          npx xala-ui validate --all --strict --json > validation-results.json
          npx xala-ui validate --all --compliance norwegian
          npx xala-ui validate --all --performance
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: validation-results
          path: validation-results.json
```

#### Pre-commit Hooks
```bash
# Install pre-commit hook
npx husky add .husky/pre-commit "npx xala-ui validate --staged --strict"

# Validate only changed files
npx xala-ui validate --changed --strict
```

### Automated Fixes

```bash
# Auto-fix common issues
npx xala-ui validate --fix --spec ./specs/Button.json

# Fix specific types of issues
npx xala-ui validate --fix-only formatting,casing --all

# Interactive fix mode
npx xala-ui validate --interactive-fix --spec ./specs/Button.json
```

### Validation Reports

Generate comprehensive validation reports:

```bash
# HTML report
npx xala-ui validate --all --report-format html --output validation-report.html

# JSON report for programmatic use
npx xala-ui validate --all --report-format json --output validation-report.json

# Markdown report for documentation
npx xala-ui validate --all --report-format markdown --output VALIDATION.md

# Dashboard-friendly metrics
npx xala-ui validate --all --metrics --output metrics.json
```

### Example Report Structure

```json
{
  "summary": {
    "total": 25,
    "passed": 23,
    "failed": 2,
    "warnings": 5,
    "coverage": 92
  },
  "results": [
    {
      "file": "./specs/Button.json",
      "status": "passed",
      "errors": [],
      "warnings": [
        {
          "type": "performance",
          "message": "Bundle size approaching limit"
        }
      ]
    }
  ],
  "compliance": {
    "norwegian": {
      "nsm": "100%",
      "gdpr": "100%",
      "wcag": "92%"
    }
  },
  "metrics": {
    "totalComponents": 25,
    "avgBundleSize": "32kb",
    "wcagAAA": 23,
    "performanceOptimized": 20
  }
}
```

## Troubleshooting

### Common Issues

**Schema Version Mismatch**:
```bash
# Check current schema version
npx xala-ui schema version

# Update specification to latest schema
npx xala-ui migrate --spec ./specs/Button.json --to latest

# Validate with specific schema version
npx xala-ui validate --spec ./specs/Button.json --schema v5.0
```

**Norwegian Compliance Failures**:
```bash
# Debug compliance issues
npx xala-ui validate --compliance norwegian --debug --spec ./specs/Button.json

# Check NSM classification requirements
npx xala-ui compliance check-nsm --spec ./specs/Button.json

# Validate GDPR requirements
npx xala-ui compliance check-gdpr --spec ./specs/Button.json
```

**Performance Validation Failures**:
```bash
# Analyze bundle size
npx xala-ui analyze bundle-size --spec ./specs/Button.json

# Get performance recommendations
npx xala-ui performance optimize --spec ./specs/Button.json

# Check render time estimates
npx xala-ui performance render-time --spec ./specs/Button.json
```

## Related Documentation

- [Component Specification Schema](../schema-reference.md)
- [Norwegian Compliance Guide](./norwegian-compliance.md)
- [AI Usage Guide](./ai-usage.md)
- [Migration Guide](./migration.md)

---

*This validation guide ensures component specifications meet all quality, compliance, and performance standards. Last updated: January 2024*