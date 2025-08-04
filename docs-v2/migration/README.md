# Migration Guide

## 📋 Documentation Migration Overview

This guide helps you migrate from the old documentation structure to the new organized v2.0 documentation system.

## 🗂️ New Documentation Structure

### Before (v1.0)
```
docs/
├── Various scattered files
├── AI_DOCUMENTATION_INDEX.md
├── DEVELOPER_DOCUMENTATION_INDEX.md
├── MCP_SERVER_INTEGRATION.md
├── components/ (100+ files)
├── ai-integration/
├── architecture/
└── Many other mixed directories
```

### After (v2.0)
```
docs-v2/
├── README.md (Main index)
├── mcp-server/
│   ├── README.md
│   ├── getting-started.md
│   ├── api-reference.md
│   ├── ai-integration.md
│   └── specifications/
├── xala-cli/
│   ├── README.md
│   ├── installation.md
│   ├── commands.md
│   ├── templates.md
│   └── platforms.md
├── ui-system/
│   ├── README.md
│   ├── quick-start.md
│   ├── components/
│   ├── tokens/
│   └── theming/
└── migration/
    └── README.md (this file)
```

## 📊 File Mapping Guide

### MCP Server Documentation

| Old Location | New Location | Status |
|--------------|--------------|---------|
| `docs/ai-integration/MCP_SERVER_INTEGRATION.md` | `docs-v2/mcp-server/api-reference.md` | ✅ Migrated & Enhanced |
| `docs/AI_DOCUMENTATION_INDEX.md` | `docs-v2/mcp-server/README.md` | ✅ Restructured |
| `docs/ai-integration/AI_CODE_GENERATION_GUIDE.md` | `docs-v2/mcp-server/ai-integration.md` | 🔄 To be migrated |
| `docs/ai-agents/` | `docs-v2/mcp-server/specifications/` | 🔄 To be migrated |
| `docs/windsurf-mcp-setup.md` | `docs-v2/mcp-server/getting-started.md` | ✅ Integrated |

### Xala CLI Documentation  

| Old Location | New Location | Status |
|--------------|--------------|---------|
| `cli/docs/README.md` | `docs-v2/xala-cli/README.md` | ✅ Enhanced |
| `cli/docs/COMMANDS.md` | `docs-v2/xala-cli/commands.md` | 🔄 To be migrated |
| `cli/docs/TEMPLATES.md` | `docs-v2/xala-cli/templates.md` | 🔄 To be migrated |
| `cli/docs/ARCHITECTURE.md` | `docs-v2/xala-cli/architecture.md` | 🔄 To be migrated |
| `docs/wiki-cli.md` | `docs-v2/xala-cli/integration.md` | 🔄 To be migrated |

### UI System Documentation

| Old Location | New Location | Status |
|--------------|--------------|---------|
| `docs/getting-started.md` | `docs-v2/ui-system/quick-start.md` | ✅ Enhanced |
| `docs/components/README.md` | `docs-v2/ui-system/components/README.md` | 🔄 To be migrated |
| `docs/architecture/` | `docs-v2/ui-system/architecture/` | 🔄 To be migrated |
| `docs/tokens/` | `docs-v2/ui-system/tokens/` | 🔄 To be migrated |
| `docs/themes.md` | `docs-v2/ui-system/theming/` | 🔄 To be migrated |

## 🔄 Migration Steps

### Step 1: Content Audit

Review existing documentation for:
- **Accuracy**: Is the information up-to-date?
- **Relevance**: Is it still needed?
- **Organization**: Where does it fit in the new structure?
- **Quality**: Does it meet documentation standards?

### Step 2: Automated Migration Script

```bash
#!/bin/bash
# migrate-docs.sh - Automated migration helper

echo "🔄 Starting documentation migration..."

# Create new structure
mkdir -p docs-v2/{mcp-server,xala-cli,ui-system}/{specifications,components,guides}

# Migrate MCP Server docs
echo "📁 Migrating MCP Server documentation..."
cp docs/ai-integration/MCP_SERVER_INTEGRATION.md docs-v2/mcp-server/api-reference-source.md
cp docs/AI_DOCUMENTATION_INDEX.md docs-v2/mcp-server/index-source.md

# Migrate CLI docs  
echo "📁 Migrating CLI documentation..."
cp cli/docs/* docs-v2/xala-cli/sources/

# Migrate UI System docs
echo "📁 Migrating UI System documentation..."
cp docs/getting-started.md docs-v2/ui-system/quick-start-source.md
cp -r docs/components/ docs-v2/ui-system/components/sources/
cp -r docs/architecture/ docs-v2/ui-system/architecture/sources/

echo "✅ Migration structure created. Manual review and updates needed."
```

### Step 3: Content Updates

For each migrated file:

1. **Update Headers**: Use consistent header hierarchy
2. **Update Links**: Fix internal links to new structure
3. **Update Examples**: Ensure code examples are current
4. **Add Metadata**: Include version info and update dates
5. **Standardize Format**: Use consistent formatting

### Step 4: Quality Review

Check each document for:
- **Accuracy**: All information is correct and current
- **Completeness**: No missing sections or broken links
- **Consistency**: Follows documentation standards
- **Accessibility**: Meets WCAG 2.2 AA standards

## 📝 Content Enhancement Guidelines

### Documentation Standards

#### Headers and Structure
```md
# Main Title (H1)
Brief description of the document purpose.

## Section (H2)
Content sections with clear purposes.

### Subsection (H3)
Detailed information and examples.

#### Details (H4)
Specific implementation details.
```

#### Code Examples
```md
### Example Title
Brief description of what the example demonstrates.

```typescript
// Clear, commented code example
const example = await mcp.call('tool_name', {
  parameter: 'value'
});
// Expected output or result
```

**Key Points:**
- Point 1: Explanation
- Point 2: Explanation
```

#### Navigation Elements
```md
## 📋 Quick Reference
- [Section 1](#section-1) - Brief description
- [Section 2](#section-2) - Brief description

## 🔗 Related Documentation
- [Related Doc 1](../path/to/doc.md) - Description
- [Related Doc 2](./other-doc.md) - Description
```

### Content Requirements

#### MCP Server Documentation
- **API Reference**: Complete tool documentation with parameters and examples
- **Getting Started**: Installation, configuration, and first steps
- **AI Integration**: Advanced AI workflows and patterns
- **Specifications**: Machine-readable component specifications

#### Xala CLI Documentation  
- **Installation**: System requirements and setup process
- **Commands**: Complete command reference with examples
- **Templates**: Available templates and customization
- **Platform Guides**: Platform-specific instructions

#### UI System Documentation
- **Quick Start**: 5-minute setup guide
- **Components**: Complete component library with examples
- **Tokens**: Design token system and customization
- **Architecture**: System architecture and patterns

## 🔧 Migration Tools

### Link Checker Script
```bash
#!/bin/bash
# check-links.sh - Validate internal links

echo "🔍 Checking internal links..."

find docs-v2 -name "*.md" -exec grep -l "\[.*\](\..*\.md)" {} \; | while read file; do
  echo "Checking links in: $file"
  grep -n "\[.*\](\..*\.md)" "$file" | while read line; do
    link=$(echo "$line" | sed -n 's/.*(\(.*\.md\)).*/\1/p')
    if [ ! -f "$(dirname "$file")/$link" ]; then
      echo "❌ Broken link: $link in $file"
    fi
  done
done

echo "✅ Link check complete"
```

### Content Validator Script
```bash
#!/bin/bash
# validate-content.sh - Check documentation quality

echo "📊 Validating documentation quality..."

find docs-v2 -name "*.md" | while read file; do
  echo "Validating: $file"
  
  # Check for required sections
  if ! grep -q "## " "$file"; then
    echo "⚠️  Missing sections: $file"
  fi
  
  # Check for code examples
  if ! grep -q "```" "$file"; then
    echo "⚠️  No code examples: $file"
  fi
  
  # Check for navigation
  if ! grep -q "## 🔗\|## 📚\|## Next Steps" "$file"; then
    echo "⚠️  Missing navigation: $file"
  fi
done

echo "✅ Content validation complete"
```

## 📊 Migration Status Tracking

### MCP Server Documentation

- [x] `README.md` - Overview and navigation
- [x] `getting-started.md` - Installation and setup
- [x] `api-reference.md` - Complete API documentation
- [ ] `ai-integration.md` - Advanced AI workflows
- [ ] `specifications/` - Component specifications
- [ ] `patterns/` - Layout patterns
- [ ] `code-generation/` - Platform-specific guides
- [ ] `quality-assurance/` - Validation and testing

### Xala CLI Documentation

- [x] `README.md` - Overview and features
- [x] `installation.md` - Installation and setup
- [ ] `commands.md` - Complete command reference
- [ ] `templates.md` - Template system guide
- [ ] `platforms.md` - Platform-specific guides
- [ ] `configuration.md` - Advanced configuration
- [ ] `ai-integration.md` - AI-powered features
- [ ] `enterprise.md` - Norwegian compliance features

### UI System Documentation

- [x] `README.md` - System overview
- [x] `quick-start.md` - 5-minute setup guide
- [ ] `components/` - Component library
- [ ] `tokens/` - Design token system
- [ ] `theming/` - Theme customization
- [ ] `architecture/` - System architecture
- [ ] `accessibility/` - WCAG compliance
- [ ] `compliance/` - Norwegian features

## 🎯 Priority Migration Order

### Phase 1: Core Documentation (Week 1)
1. ✅ Main README files for each section
2. ✅ Getting started guides
3. ✅ Quick start documentation
4. 🔄 Basic API references

### Phase 2: Detailed Documentation (Week 2)
1. Component library documentation
2. Complete API references
3. Platform-specific guides
4. Architecture documentation

### Phase 3: Advanced Documentation (Week 3)
1. AI integration guides
2. Norwegian compliance features
3. Enterprise patterns
4. Migration guides

### Phase 4: Enhancement & Polish (Week 4)
1. Code examples validation
2. Link checking and fixing
3. Content review and updates
4. User testing and feedback

## 🚀 Next Steps

### For Contributors

1. **Choose a section** from the migration status tracking
2. **Follow the migration steps** outlined above
3. **Use the content enhancement guidelines** for consistency
4. **Run validation scripts** before submitting
5. **Update the migration status** when complete

### For Users

1. **Bookmark the new documentation** at `docs-v2/`
2. **Update your local references** to point to new structure
3. **Report any broken links** or missing content
4. **Provide feedback** on the new organization

## 🤝 Support

Need help with migration?

- **GitHub Issues**: [Report migration problems](https://github.com/xala-technologies/ui-system/issues)
- **Discussions**: [Get migration help](https://github.com/xala-technologies/ui-system/discussions)
- **Documentation Team**: Contact the documentation maintainers

---

*Migration Guide v2.0 - Transition to organized documentation*