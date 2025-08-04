# Component Specification Migration Guide

This guide covers migrating component specifications between versions, including breaking changes, automated migration tools, and best practices.

## Table of Contents

- [Overview](#overview)
- [Version History](#version-history)
- [Migration Strategies](#migration-strategies)
- [Automated Migration](#automated-migration)
- [Manual Migration](#manual-migration)
- [Breaking Changes](#breaking-changes)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The Xala UI Component Specification System follows semantic versioning with clear migration paths between versions. This guide helps you:

- Understand version differences and breaking changes
- Use automated migration tools
- Handle manual migration scenarios
- Maintain compatibility during transitions
- Validate migrated specifications

## Version History

### v5.2.0 (Latest)
- **Release Date**: June 2024
- **Status**: Current
- **Key Features**:
  - Enhanced Norwegian compliance validation
  - Improved AI optimization metadata
  - Extended platform support
  - Performance monitoring integration

### v5.1.0
- **Release Date**: March 2024
- **Status**: Supported
- **Key Features**:
  - AI-powered generation enhancements
  - Advanced accessibility testing
  - Multi-language documentation
  - Platform-specific optimization hints

### v5.0.0
- **Release Date**: January 2024
- **Status**: Supported
- **Key Features**:
  - Initial comprehensive specification system
  - Norwegian compliance framework
  - Multi-platform support
  - WCAG AAA accessibility standards

### v4.x (Legacy)
- **Status**: Deprecated
- **End of Support**: December 2024
- **Migration Required**: Yes

## Migration Strategies

### 1. Automated Migration (Recommended)

Use the built-in migration tool for most cases:

```bash
# Migrate single specification
npx xala-ui migrate --spec ./specs/Button.json --to v5.2

# Migrate entire project
npx xala-ui migrate --all --to v5.2

# Migrate with backup
npx xala-ui migrate --all --to v5.2 --backup ./backup/

# Dry run (preview changes)
npx xala-ui migrate --spec ./specs/Button.json --to v5.2 --dry-run
```

### 2. Gradual Migration

Migrate components incrementally:

```bash
# Migrate by category
npx xala-ui migrate --category basic --to v5.2
npx xala-ui migrate --category composite --to v5.2

# Migrate critical components first  
npx xala-ui migrate --priority high --to v5.2

# Migrate with validation
npx xala-ui migrate --spec ./specs/Button.json --to v5.2 --validate
```

### 3. Manual Migration

For complex cases requiring manual intervention:

```bash
# Generate migration guide
npx xala-ui migrate --spec ./specs/Button.json --to v5.2 --guide

# Check compatibility
npx xala-ui migrate --spec ./specs/Button.json --to v5.2 --check

# Validate after manual changes
npx xala-ui validate --spec ./specs/Button.json --schema v5.2
```

## Automated Migration

### Basic Migration Commands

```bash
# Check current version
npx xala-ui version --spec ./specs/Button.json

# List available target versions
npx xala-ui migrate --list-versions

# Migrate to latest version
npx xala-ui migrate --spec ./specs/Button.json --to latest

# Migrate with verbose output
npx xala-ui migrate --spec ./specs/Button.json --to v5.2 --verbose
```

### Migration Options

```bash
# Create backup before migration
npx xala-ui migrate --all --to v5.2 --backup ./backup/$(date +%Y%m%d)

# Skip validation during migration
npx xala-ui migrate --spec ./specs/Button.json --to v5.2 --no-validate

# Force migration (ignore warnings)
npx xala-ui migrate --spec ./specs/Button.json --to v5.2 --force

# Interactive migration with prompts
npx xala-ui migrate --spec ./specs/Button.json --to v5.2 --interactive
```

### Batch Migration

```bash
# Migrate all specifications
npx xala-ui migrate --all --to v5.2

# Migrate specific directory
npx xala-ui migrate --dir ./specs/components --to v5.2

# Migrate with pattern matching
npx xala-ui migrate --pattern "**/*Button*.json" --to v5.2

# Migrate excluding certain files
npx xala-ui migrate --all --to v5.2 --exclude "**/*legacy*"
```

## Manual Migration

### v4.x to v5.0 Migration

#### 1. Update Root Structure

**v4.x Structure**:
```json
{
  "meta": {
    "name": "Button",
    "version": "1.0.0"
  },
  "a11y": {
    "role": "button"
  }
}
```

**v5.0 Structure**:
```json
{
  "metadata": {
    "name": "Button",
    "version": "1.0.0",
    "semanticVersion": "v5.0",
    "category": "basic",
    "description": "Component description"
  },
  "compliance": {
    "norwegian": {
      "nsmClassification": "OPEN",
      "gdprCompliant": true
    }
  },
  "accessibility": {
    "role": {
      "primary": "button"
    }
  }
}
```

#### 2. Add Required Norwegian Compliance

```json
{
  "compliance": {
    "i18n": {
      "supported": true,
      "defaultLocale": "nb-NO",
      "supportedLocales": ["nb-NO", "en-US", "fr-FR", "ar-SA"]
    },
    "semantic": {
      "htmlElements": ["button"],
      "ariaRoles": ["button"],
      "landmarks": false
    },
    "wcag": {
      "level": "AAA",
      "tested": true,
      "guidelines": ["1.3.1", "2.1.1", "2.4.7", "4.1.2"]
    },
    "ssr": {
      "supported": true,
      "hydrationSafe": true
    },
    "norwegian": {
      "nsmClassification": "OPEN",
      "gdprCompliant": true,
      "designSystem": {
        "altinnCompliant": true,
        "governmentApproved": true
      }
    }
  }
}
```

#### 3. Update Props Structure

**v4.x Props**:
```json
{
  "props": {
    "variant": {
      "type": "string",
      "options": ["primary", "secondary"]
    }
  }
}
```

**v5.0 Props**:
```json
{
  "props": {
    "schema": {
      "variant": {
        "type": "string",
        "enum": ["primary", "secondary"],
        "default": "primary",
        "description": "Visual variant of the button",
        "required": false
      }
    },
    "groups": {
      "required": [],
      "optional": ["variant"],
      "deprecated": []
    }
  }
}
```

#### 4. Enhance Accessibility

**v4.x Accessibility**:
```json
{
  "a11y": {
    "role": "button",
    "keyboard": true
  }
}
```

**v5.0 Accessibility**:
```json
{
  "accessibility": {
    "role": {
      "primary": "button"
    },
    "keyboardNavigation": {
      "supported": true,
      "patterns": [
        {
          "key": "Enter",
          "action": "activate",
          "context": "Activates the button"
        },
        {
          "key": "Space",
          "action": "activate",
          "context": "Activates the button"
        }
      ]
    },
    "screenReader": {
      "announcements": [],
      "labels": {
        "required": ["aria-label or text content"]
      }
    }
  }
}
```

### v5.0 to v5.1 Migration

#### 1. Add AI Optimization

```json
{
  "ai": {
    "optimization": {
      "hints": [
        "Use semantic HTML elements",
        "Implement proper focus management"
      ],
      "patterns": [
        {
          "pattern": "forwardRef for React implementation",
          "context": "Allows parent components to access DOM node",
          "recommendation": "Always use forwardRef for interactive components"
        }
      ]
    },
    "generation": {
      "priority": "high",
      "complexity": "simple",
      "estimatedTokens": 800
    }
  }
}
```

#### 2. Enhanced Platform Implementations

```json
{
  "platforms": {
    "implementations": {
      "react": {
        "templatePath": "./templates/react/Button.tsx.hbs",
        "dependencies": ["react", "@types/react"],
        "imports": [
          {
            "module": "react",
            "imports": ["forwardRef", "ButtonHTMLAttributes"]
          }
        ],
        "examples": [
          {
            "code": "<Button>Click me</Button>",
            "language": "tsx"
          }
        ]
      }
    }
  }
}
```

### v5.1 to v5.2 Migration

#### 1. Enhanced Performance Metrics

```json
{
  "performance": {
    "metrics": {
      "bundleSize": {
        "max": "50kb",
        "gzipped": "15kb"
      },
      "renderTime": {
        "initial": "16ms",
        "update": "8ms"
      },
      "memoryUsage": {
        "baseline": "2MB",
        "peak": "5MB"
      }
    },
    "optimizations": [
      "React.memo for props comparison",
      "useMemo for expensive calculations",
      "Tree-shaking compatible exports"
    ]
  }
}
```

#### 2. Extended Compliance Validation

```json
{
  "compliance": {
    "norwegian": {
      "nsmClassification": "OPEN",
      "gdprCompliant": true,
      "designSystem": {
        "altinnCompliant": true,
        "governmentApproved": true
      },
      "auditTrail": false,
      "dataRetention": {
        "policy": "30 days",
        "anonymization": true
      }
    }
  }
}
```

## Breaking Changes

### v4.x to v5.0 Breaking Changes

#### 1. Root Property Renaming
- `meta` → `metadata`
- `a11y` → `accessibility`
- Added required `compliance` section

#### 2. Props Structure Change
- `props.propName` → `props.schema.propName`
- Added `props.groups` for organization
- `options` → `enum` for allowed values

#### 3. New Required Properties
- `metadata.semanticVersion`
- `metadata.category`
- `metadata.description`
- `compliance` (entire section)

#### 4. Platform Support Changes
- Added `platforms.implementations`
- Enhanced platform-specific metadata

### v5.0 to v5.1 Breaking Changes

#### 1. AI Metadata Structure
- New optional `ai` section
- Enhanced generation metadata

#### 2. Testing Requirements
- New `testing` section structure
- Enhanced coverage requirements

### v5.1 to v5.2 Breaking Changes

#### 1. Performance Monitoring
- Enhanced `performance.metrics`
- New monitoring requirements

#### 2. Compliance Enhancements
- Extended Norwegian compliance fields
- New audit trail requirements

## Best Practices

### 1. Pre-Migration Preparation

```bash
# Create comprehensive backup
npx xala-ui backup --all --output ./backup/pre-migration-$(date +%Y%m%d)

# Validate current specifications
npx xala-ui validate --all --report pre-migration-validation.json

# Check migration compatibility
npx xala-ui migrate --all --to v5.2 --check --report migration-check.json
```

### 2. Staged Migration Approach

```bash
# Phase 1: Migrate basic components
npx xala-ui migrate --category basic --to v5.2 --validate

# Phase 2: Migrate composite components
npx xala-ui migrate --category composite --to v5.2 --validate

# Phase 3: Migrate complex components
npx xala-ui migrate --category specialized --to v5.2 --validate

# Phase 4: Final validation
npx xala-ui validate --all --strict
```

### 3. Testing After Migration

```bash
# Validate migrated specifications
npx xala-ui validate --all --schema v5.2 --strict

# Test code generation
npx xala-ui generate --spec ./specs/Button.json --platform react --test

# Generate documentation
npx xala-ui docs generate --all --validate

# Run comprehensive tests
npm run test:specifications
```

### 4. Rollback Strategy

```bash
# Restore from backup if needed
npx xala-ui restore --backup ./backup/pre-migration-20240115 --all

# Rollback specific component
npx xala-ui restore --backup ./backup/pre-migration-20240115 --spec ./specs/Button.json

# Validate rollback
npx xala-ui validate --all --schema v5.1
```

## Troubleshooting

### Common Migration Issues

#### 1. Schema Validation Errors

```bash
# Error: Missing required property 'compliance'
# Solution: Add complete compliance section
{
  "compliance": {
    "i18n": { "supported": true, "defaultLocale": "nb-NO", "supportedLocales": ["nb-NO"] },
    "semantic": { "htmlElements": ["div"], "ariaRoles": [], "landmarks": false },
    "wcag": { "level": "AAA", "tested": true, "guidelines": [] },
    "ssr": { "supported": true, "hydrationSafe": true },
    "norwegian": { "nsmClassification": "OPEN", "gdprCompliant": true }
  }
}
```

#### 2. Property Renaming Issues

```bash
# Error: Unknown property 'meta'
# Solution: Rename to 'metadata' and add required fields
{
  "metadata": {
    "name": "ComponentName",
    "version": "1.0.0",
    "semanticVersion": "v5.2",
    "category": "basic",
    "description": "Component description"
  }
}
```

#### 3. Props Structure Migration

```bash
# Error: Props not in correct format
# Old format:
{
  "props": {
    "variant": { "type": "string" }
  }
}

# New format:
{
  "props": {
    "schema": {
      "variant": { "type": "string", "description": "Visual variant" }
    },
    "groups": {
      "required": [],
      "optional": ["variant"],
      "deprecated": []
    }
  }
}
```

#### 4. Migration Tool Issues

```bash
# Migration tool fails
npx xala-ui migrate --spec ./specs/Button.json --to v5.2 --debug --verbose

# Force migration with manual fixes
npx xala-ui migrate --spec ./specs/Button.json --to v5.2 --force --no-validate

# Manual validation after force migration
npx xala-ui validate --spec ./specs/Button.json --schema v5.2 --fix
```

### Recovery Procedures

#### 1. Partial Migration Failure

```bash
# Identify failed migrations
npx xala-ui migrate --all --to v5.2 --report migration-report.json

# Fix failed migrations individually
npx xala-ui migrate --spec ./specs/FailedComponent.json --to v5.2 --interactive

# Validate and retry
npx xala-ui validate --spec ./specs/FailedComponent.json --fix
```

#### 2. Data Loss Prevention

```bash
# Create versioned backups
npx xala-ui backup --all --output ./backup/v$(npx xala-ui version --current)

# Use git for version control
git add specs/
git commit -m "Pre-migration backup: $(date)"

# Tag before migration
git tag pre-migration-v5.2-$(date +%Y%m%d)
```

#### 3. Rollback Procedures

```bash
# Quick rollback from backup
npx xala-ui restore --backup ./backup/pre-migration-20240115

# Git-based rollback
git reset --hard pre-migration-v5.2-20240115

# Selective rollback
npx xala-ui restore --backup ./backup/pre-migration-20240115 --spec ./specs/Button.json
```

## Migration Checklist

### Pre-Migration
- [ ] Create comprehensive backup
- [ ] Validate current specifications
- [ ] Check migration compatibility
- [ ] Review breaking changes
- [ ] Plan staged migration approach

### During Migration
- [ ] Run migration with validation
- [ ] Monitor for errors and warnings
- [ ] Test critical components first
- [ ] Validate each phase
- [ ] Document any manual changes

### Post-Migration
- [ ] Validate all specifications
- [ ] Test code generation
- [ ] Generate documentation
- [ ] Run comprehensive tests
- [ ] Update CI/CD pipelines
- [ ] Train team on new features

## Related Documentation

- [Component Specification Schema](../schema-reference.md)
- [Validation Guide](./validation.md)
- [Norwegian Compliance Guide](./norwegian-compliance.md)
- [Getting Started Guide](../getting-started.md)

---

*This migration guide ensures smooth transitions between specification versions while maintaining quality and compliance standards. Last updated: January 2024*