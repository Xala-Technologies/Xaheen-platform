# Package Extraction Plan
## Move Useful Parts to CLI Directly

**Date**: 2025-08-01  
**Status**: Ready for Implementation

---

## 🎯 **Extraction Strategy**

### **From `packages/core` → `apps/cli/src/`**
```
packages/core/src/
├── interfaces/          → apps/cli/src/interfaces/
├── services/discovery/  → apps/cli/src/infrastructure/
├── events/             → apps/cli/src/infrastructure/
├── utils/logger.ts     → apps/cli/src/utils/
└── architecture/       → apps/cli/src/infrastructure/
```

### **From `packages/compliance` → `apps/cli/src/`**
```
packages/compliance/src/
├── validators/         → apps/cli/src/validators/
├── rules/             → apps/cli/src/validators/
└── types/             → apps/cli/src/interfaces/
```

---

## 📁 **New CLI Structure**

```
apps/cli/src/
├── commands/
│   ├── init.ts              # ✅ Existing - enhance with new params
│   ├── add.ts               # ✅ Existing - enhance with new params
│   └── validate.ts          # 🆕 New - compliance validation
├── infrastructure/          # 🆕 From packages/core
│   ├── events.ts           # Event system for CLI extensibility
│   ├── discovery.ts        # Service discovery for plugins
│   └── architecture.ts     # SOLID principles base classes
├── interfaces/              # 🆕 From packages/core + compliance
│   ├── generators.ts       # Template generation interfaces
│   ├── validation.ts       # Validation interfaces
│   ├── compliance.ts       # Compliance interfaces
│   └── types.ts           # Shared types
├── validators/              # 🆕 From packages/compliance
│   ├── norwegian.ts        # Norwegian compliance rules
│   ├── gdpr.ts            # GDPR compliance rules
│   └── accessibility.ts    # WCAG AAA validation
├── ui-systems/              # 🆕 New
│   ├── xala.ts            # Xala UI System integration
│   └── default.ts         # Default UI system
├── utils/                   # ✅ Existing - enhance
│   ├── logger.ts          # Enhanced logging from core
│   └── ...existing utils
└── templates/               # ✅ Existing - enhance
    ├── base/              # Existing templates
    ├── xala/              # Xala UI templates
    └── compliance/        # Compliance templates
```

---

## 🔧 **Implementation Steps**

### **Step 1: Extract Core Infrastructure**
```bash
# Copy useful files from packages/core
cp -r packages/core/src/interfaces apps/cli/src/
cp -r packages/core/src/services/discovery apps/cli/src/infrastructure/
cp -r packages/core/src/events apps/cli/src/infrastructure/
cp packages/core/src/utils/logger.ts apps/cli/src/utils/
```

### **Step 2: Extract Compliance Logic**
```bash
# Copy compliance files
cp -r packages/compliance/src/validators apps/cli/src/
cp -r packages/compliance/src/rules apps/cli/src/validators/
```

### **Step 3: Update Imports**
- Update all import paths to use relative paths
- Remove package dependencies
- Merge duplicate types

### **Step 4: Enhance CLI Commands**
- Add `--ui` and `--compliance` parameters
- Add new `validate` command
- Integrate infrastructure for xaheen UX

### **Step 5: Clean Up**
```bash
# Remove packages directory
rm -rf packages/
```

---

## 🚀 **Enhanced CLI Usage**

### **New Parameters**
```bash
# Basic project (unchanged)
xaheen init my-app

# With Xala UI System
xaheen init my-app --ui=xala

# With Norwegian compliance
xaheen init my-app --compliance=norwegian

# Combined
xaheen init my-app --ui=xala --compliance=norwegian --auth

# Add to existing project
xaheen add --ui=xala
xaheen add --compliance=norwegian

# Validate project
xaheen validate --compliance --accessibility
```

### **Enhanced Features**
```bash
# Xaheen progress tracking (using event system)
xaheen init my-app --ui=xala
# ✅ Setting up project structure...
# ✅ Installing Xala UI System...
# ✅ Configuring design tokens...
# ✅ Generating components...
# 🎉 Project created successfully!

# Detailed validation (using compliance validators)
xaheen validate --compliance
# ✅ GDPR compliance: Passed
# ✅ WCAG AAA accessibility: Passed
# ⚠️  NSM security: 2 warnings found
# 📋 Compliance report saved to ./compliance-report.json
```

---

## 📋 **Files to Extract**

### **High Priority (Essential)**
- `packages/core/src/interfaces/` - Type definitions
- `packages/core/src/utils/logger.ts` - Enhanced logging
- `packages/compliance/src/validators/` - Compliance validation
- `packages/compliance/src/types/` - Compliance types

### **Medium Priority (Useful)**
- `packages/core/src/events/` - Event system for progress tracking
- `packages/core/src/services/discovery/` - Plugin architecture
- `packages/core/src/architecture/` - Base classes

### **Low Priority (Optional)**
- `packages/core/src/examples/` - Skip (not needed in CLI)
- Complex service orchestration - Skip (too complex)

---

## ✅ **Benefits**

- ✅ **Single codebase** - Everything in CLI, easy to maintain
- ✅ **Enhanced functionality** - Xaheen logging, validation, progress tracking
- ✅ **Type safety** - Shared interfaces and types
- ✅ **Extensible** - Event system allows future plugins
- ✅ **Compliant** - Built-in Norwegian compliance validation
- ✅ **Simple** - No complex package dependencies

---

## 🎯 **Success Criteria**

1. **CLI builds successfully** with extracted code
2. **All existing functionality preserved** 
3. **New parameters work**: `--ui=xala`, `--compliance=norwegian`
4. **Enhanced UX**: Xaheen logging and progress tracking
5. **Validation works**: `xaheen validate --compliance`
6. **No packages directory** - Everything in CLI

---

*This extraction gives us the best of both worlds: useful infrastructure without package complexity.*
