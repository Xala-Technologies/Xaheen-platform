# Enhanced CLI Commands Plan
## Individual Component/Page/Model Generation + Xala-Scaffold Integration

**Date**: 2025-08-01  
**Status**: Design Phase

---

## 🎯 **Core Requirements**

### **Original Functionality (Must Preserve)**
- ✅ Add new component to existing project
- ✅ Add new page to existing project  
- ✅ Add new model to existing project
- ✅ Works with existing project structure

### **Enhanced Functionality (New)**
- 🆕 Support `--ui=xala` for Xala UI System components
- 🆕 Support `--compliance=norwegian` for compliant generation
- 🆕 Leverage xala-scaffold's intelligent generation
- 🆕 AI-powered component suggestions and optimization

---

## 🚀 **Enhanced CLI Command Structure**

### **1. Project Creation (Enhanced)**
```bash
# Basic project (unchanged)
xaheen init my-app

# Enhanced with new parameters
xaheen init my-app --ui=xala --compliance=norwegian --auth --database=postgres
```

### **2. Individual Item Generation (New/Enhanced)**
```bash
# Component generation
xaheen component UserCard                           # Basic component
xaheen component UserCard --ui=xala                 # Xala UI component
xaheen component UserCard --compliance=norwegian    # Norwegian compliant
xaheen component UserCard --props="name:string,age:number?" --type=form

# Page generation  
xaheen page dashboard                               # Basic page
xaheen page dashboard --ui=xala --auth              # Xala UI + auth required
xaheen page dashboard --compliance=norwegian        # Norwegian compliant page
xaheen page dashboard --route="/admin/dashboard" --layout=admin

# Model generation (API/Database)
xaheen model User                                   # Basic model
xaheen model User --database=postgres              # With specific database
xaheen model User --compliance=gdpr                # GDPR compliant model
xaheen model User --fields="name:string,email:string,age:number?"

# Layout generation
xaheen layout AdminLayout --ui=xala                 # Xala UI layout
xaheen layout AdminLayout --compliance=norwegian   # Compliant layout

# Hook generation (React hooks)
xaheen hook useUserData --type=api                  # API hook
xaheen hook useUserData --compliance=gdpr          # GDPR compliant hook

# Service generation (Backend services)
xaheen service UserService --type=rest             # REST service
xaheen service UserService --compliance=norwegian  # Norwegian compliant service
```

### **3. Bulk Generation (Advanced)**
```bash
# Generate complete feature
xaheen feature user-management --ui=xala --compliance=norwegian
# Generates: component + page + model + service + tests + stories

# Generate from AI description
xaheen ai "Create a Norwegian compliant user dashboard with Xala UI"
# AI analyzes and generates multiple components
```

### **4. Enhanced Add Command (Backward Compatible)**
```bash
# Original functionality (preserved)
xaheen add --addons=auth,database

# Enhanced with new parameters
xaheen add --ui=xala                    # Convert existing project to Xala UI
xaheen add --compliance=norwegian       # Add Norwegian compliance to existing project
xaheen add --component=UserCard         # Add specific component
```

---

## 🏗️ **Implementation Architecture**

### **Command Structure**
```
apps/cli/src/commands/
├── init.ts              # ✅ Enhanced project creation
├── add.ts               # ✅ Enhanced addon management  
├── component.ts         # 🆕 Component generation
├── page.ts              # 🆕 Page generation
├── model.ts             # 🆕 Model generation
├── layout.ts            # 🆕 Layout generation
├── hook.ts              # 🆕 Hook generation
├── service.ts           # 🆕 Service generation
├── feature.ts           # 🆕 Feature generation
├── ai.ts                # 🆕 AI-powered generation
└── validate.ts          # 🆕 Validation command
```

### **Generator System (From Xala-Scaffold)**
```
apps/cli/src/generators/
├── component-generator.ts    # Component generation logic
├── page-generator.ts        # Page generation logic
├── model-generator.ts       # Model generation logic
├── template-engine.ts       # Template processing
├── ai-generator.ts          # AI-powered generation
└── compliance-generator.ts  # Compliance-aware generation
```

### **Template System (Enhanced)**
```
apps/cli/templates/
├── base/                    # ✅ Existing templates
│   ├── components/
│   ├── pages/
│   └── models/
├── xala/                    # 🆕 Xala UI templates
│   ├── components/
│   ├── pages/
│   └── layouts/
└── compliance/              # 🆕 Compliance templates
    ├── norwegian/
    ├── gdpr/
    └── wcag/
```

---

## 🔧 **Enhanced Command Examples**

### **Component Generation with Full Options**
```bash
xaheen component UserProfile \
  --ui=xala \
  --compliance=norwegian \
  --props="user:User,editable:boolean?=false" \
  --type=form \
  --test \
  --story \
  --locale

# Generates:
# ├── components/UserProfile/
# │   ├── UserProfile.tsx          # Xala UI component
# │   ├── UserProfile.test.tsx     # Vitest tests
# │   ├── UserProfile.stories.tsx  # Storybook story
# │   ├── UserProfile.module.css   # Xala design tokens
# │   └── locales/
# │       ├── no.json             # Norwegian translation
# │       └── en.json             # English translation
```

### **Page Generation with Routing**
```bash
xaheen page UserDashboard \
  --ui=xala \
  --compliance=norwegian \
  --route="/dashboard/users" \
  --layout=admin \
  --auth \
  --components="UserList,UserStats,UserFilters"

# Generates:
# ├── app/dashboard/users/
# │   ├── page.tsx                 # Next.js page with Xala UI
# │   ├── loading.tsx              # Loading component
# │   ├── error.tsx                # Error boundary
# │   └── components/              # Page-specific components
# │       ├── UserList.tsx
# │       ├── UserStats.tsx
# │       └── UserFilters.tsx
```

### **Model Generation with Database**
```bash
xaheen model User \
  --compliance=gdpr \
  --database=postgres \
  --fields="id:uuid,name:string,email:string,createdAt:date" \
  --relations="posts:Post[],profile:Profile?" \
  --validation \
  --audit

# Generates:
# ├── lib/models/
# │   ├── User.ts                  # Prisma model
# │   ├── UserValidation.ts        # Zod validation
# │   ├── UserService.ts           # CRUD operations
# │   └── UserAudit.ts             # GDPR audit trail
```

---

## 🎯 **Integration with Xala-Scaffold Capabilities**

### **Leverage Existing Features**
1. **AI-Powered Generation**: Use xala-scaffold's AI for intelligent component suggestions
2. **Norwegian Compliance**: Built-in GDPR, NSM, WCAG validation
3. **Template System**: Advanced template processing with context awareness
4. **Localization**: Multi-language support with Norwegian primary
5. **Testing**: Comprehensive test generation with 95%+ coverage
6. **Quality Validation**: Code quality, accessibility, performance checks

### **Enhanced User Experience**
```bash
# AI suggests improvements
xaheen component UserCard --ui=xala
# 🤖 AI Suggestion: Consider adding loading state and error handling
# 🤖 AI Suggestion: Add WCAG AAA compliance attributes
# ✅ Generated UserCard with Xala UI System
# ✅ Added Norwegian localization
# ✅ Included accessibility features
# 📊 Compliance Score: 98% (2 minor suggestions)
```

---

## 📋 **Implementation Priority**

### **Phase 1: Core Generation Commands (Week 1)**
1. ✅ Extract types and interfaces (completed)
2. 🔄 Add `xaheen component` command
3. 🔄 Add `xaheen page` command  
4. 🔄 Add `xaheen model` command
5. 🔄 Add `--ui` and `--compliance` parameters

### **Phase 2: Enhanced Features (Week 2)**
1. 📋 Add template variants for Xala UI
2. 📋 Add compliance templates
3. 📋 Integrate validation system
4. 📋 Add `xaheen validate` command

### **Phase 3: Advanced Features (Week 3)**
1. 📋 Add AI-powered suggestions
2. 📋 Add `xaheen feature` bulk generation
3. 📋 Add `xaheen ai` natural language generation
4. 📋 Enhanced progress tracking and feedback

---

## ✅ **Success Criteria**

### **Backward Compatibility**
- ✅ All existing commands work unchanged
- ✅ Existing projects can be enhanced with new features
- ✅ No breaking changes to current functionality

### **New Functionality**
- ✅ Generate individual components, pages, models in existing projects
- ✅ Support Xala UI System integration
- ✅ Support Norwegian compliance requirements
- ✅ AI-powered intelligent generation
- ✅ Comprehensive validation and feedback

---

*This plan preserves all original functionality while adding powerful new capabilities for individual item generation with Xala UI and Norwegian compliance support.*
