# Individual Generation Implementation Plan
## Component/Page/Model Generation for Existing Projects

**Date**: 2025-08-01  
**Status**: Ready for Implementation

---

## 🎯 **Core Implementation Strategy**

### **Preserve Original + Add Enhanced**
```typescript
// Current CLI structure (keep unchanged)
xaheen init my-app                    # ✅ Project creation
xaheen add --addons=auth,database     # ✅ Add features to existing project

// New individual generation (add these)
xaheen component UserCard --ui=xala   # 🆕 Add component to existing project
xaheen page dashboard --compliance=norwegian  # 🆕 Add page to existing project
xaheen model User --database=postgres         # 🆕 Add model to existing project
```

---

## 🏗️ **CLI Router Enhancement**

### **Add New Commands to Existing Router**
```typescript
// apps/cli/src/index.ts - Add to existing router
const router = t.router({
  // ✅ Existing commands (unchanged)
  init: t.procedure.meta({...}).input(...).mutation(...),
  add: t.procedure.meta({...}).input(...).mutation(...),
  sponsors: t.procedure.meta({...}).mutation(...),
  docs: t.procedure.meta({...}).mutation(...),
  builder: t.procedure.meta({...}).mutation(...),
  
  // 🆕 New individual generation commands
  component: t.procedure
    .meta({ description: "Generate a new component in existing project" })
    .input(z.tuple([
      z.string(), // component name
      z.object({
        ui: z.enum(["default", "xala"]).optional().default("default"),
        compliance: z.enum(["none", "gdpr", "norwegian"]).optional().default("none"),
        props: z.array(z.string()).optional().default([]),
        type: z.enum(["display", "form", "layout"]).optional().default("display"),
        test: z.boolean().optional().default(true),
        story: z.boolean().optional().default(true),
        locale: z.boolean().optional().default(false),
      }),
    ]))
    .mutation(async ({ input }) => {
      const [name, options] = input;
      await generateComponentHandler(name, options);
    }),

  page: t.procedure
    .meta({ description: "Generate a new page in existing project" })
    .input(z.tuple([
      z.string(), // page name
      z.object({
        ui: z.enum(["default", "xala"]).optional().default("default"),
        compliance: z.enum(["none", "gdpr", "norwegian"]).optional().default("none"),
        route: z.string().optional(),
        layout: z.string().optional().default("default"),
        auth: z.boolean().optional().default(false),
        components: z.array(z.string()).optional().default([]),
      }),
    ]))
    .mutation(async ({ input }) => {
      const [name, options] = input;
      await generatePageHandler(name, options);
    }),

  model: t.procedure
    .meta({ description: "Generate a new model in existing project" })
    .input(z.tuple([
      z.string(), // model name
      z.object({
        compliance: z.enum(["none", "gdpr", "norwegian"]).optional().default("none"),
        database: z.string().optional(),
        fields: z.array(z.string()).optional().default([]),
        relations: z.array(z.string()).optional().default([]),
        validation: z.boolean().optional().default(true),
        audit: z.boolean().optional().default(false),
      }),
    ]))
    .mutation(async ({ input }) => {
      const [name, options] = input;
      await generateModelHandler(name, options);
    }),

  validate: t.procedure
    .meta({ description: "Validate existing project compliance and quality" })
    .input(z.object({
      compliance: z.boolean().optional().default(false),
      accessibility: z.boolean().optional().default(false),
      security: z.boolean().optional().default(false),
      performance: z.boolean().optional().default(false),
    }))
    .mutation(async ({ input }) => {
      await validateProjectHandler(input);
    }),
});
```

---

## 📁 **File Structure for Handlers**

### **Create Generation Handlers**
```
apps/cli/src/
├── helpers/
│   ├── project-generation/
│   │   ├── command-handlers.ts      # ✅ Existing (init, add)
│   │   ├── component-handler.ts     # 🆕 Component generation
│   │   ├── page-handler.ts          # 🆕 Page generation
│   │   ├── model-handler.ts         # 🆕 Model generation
│   │   └── validation-handler.ts    # 🆕 Validation
│   └── generators/                  # 🆕 Generation logic
│       ├── component-generator.ts
│       ├── page-generator.ts
│       ├── model-generator.ts
│       └── template-processor.ts
└── templates/                       # ✅ Enhanced existing
    ├── base/                        # ✅ Current templates
    ├── xala/                        # 🆕 Xala UI templates
    │   ├── components/
    │   ├── pages/
    │   └── layouts/
    └── compliance/                  # 🆕 Compliance templates
        ├── norwegian/
        ├── gdpr/
        └── wcag/
```

---

## 🔧 **Implementation Examples**

### **1. Component Generation Handler**
```typescript
// apps/cli/src/helpers/project-generation/component-handler.ts
import { ComponentGenerationOptions } from "../../interfaces/generators";
import { generateComponent } from "../generators/component-generator";

export async function generateComponentHandler(
  name: string,
  options: ComponentGenerationOptions
): Promise<void> {
  try {
    // 1. Validate we're in a project directory
    const projectRoot = await findProjectRoot();
    if (!projectRoot) {
      throw new Error("Not in a valid project directory. Run 'xaheen init' first.");
    }

    // 2. Load project configuration
    const projectConfig = await loadProjectConfig(projectRoot);

    // 3. Generate component with options
    const result = await generateComponent({
      name,
      projectRoot,
      projectConfig,
      ...options,
    });

    // 4. Display results
    console.log(`✅ Generated component: ${name}`);
    result.files.forEach(file => {
      console.log(`   📄 ${file.path}`);
    });

    // 5. Run compliance validation if requested
    if (options.compliance !== "none") {
      await validateCompliance(result.files, options.compliance);
    }

  } catch (error) {
    console.error(`❌ Failed to generate component: ${error.message}`);
    process.exit(1);
  }
}
```

### **2. Template Processing with Xala-Scaffold Integration**
```typescript
// apps/cli/src/helpers/generators/component-generator.ts
import { readTemplate, processTemplate } from "./template-processor";
import { ComponentGenerationOptions, GenerationResult } from "../../interfaces/generators";

export async function generateComponent(
  options: ComponentGenerationOptions
): Promise<GenerationResult> {
  const { name, ui, compliance, projectRoot } = options;

  // 1. Select appropriate template based on UI system
  const templatePath = ui === "xala" 
    ? "templates/xala/components/component.tsx.hbs"
    : "templates/base/components/component.tsx.hbs";

  // 2. Prepare template context
  const context = {
    name,
    componentName: toPascalCase(name),
    fileName: toKebabCase(name),
    ui,
    compliance,
    timestamp: new Date().toISOString(),
    // Add compliance-specific context
    ...(compliance === "norwegian" && {
      wcagLevel: "AAA",
      gdprCompliant: true,
      nsmClassification: "INTERNAL",
    }),
  };

  // 3. Process templates
  const files = [];

  // Main component file
  const componentTemplate = await readTemplate(templatePath);
  const componentContent = await processTemplate(componentTemplate, context);
  files.push({
    path: `src/components/${context.componentName}/${context.componentName}.tsx`,
    content: componentContent,
    type: "component",
  });

  // Test file (if requested)
  if (options.test) {
    const testTemplate = await readTemplate("templates/shared/component.test.tsx.hbs");
    const testContent = await processTemplate(testTemplate, context);
    files.push({
      path: `src/components/${context.componentName}/${context.componentName}.test.tsx`,
      content: testContent,
      type: "test",
    });
  }

  // Storybook story (if requested)
  if (options.story) {
    const storyTemplate = await readTemplate("templates/shared/component.stories.tsx.hbs");
    const storyContent = await processTemplate(storyTemplate, context);
    files.push({
      path: `src/components/${context.componentName}/${context.componentName}.stories.tsx`,
      content: storyContent,
      type: "story",
    });
  }

  // 4. Write files to disk
  for (const file of files) {
    await writeFileWithDirs(path.join(projectRoot, file.path), file.content);
  }

  return {
    success: true,
    files,
    errors: [],
    warnings: [],
  };
}
```

---

## 🎯 **Usage Examples**

### **Component Generation**
```bash
# Basic component
xaheen component UserCard

# Xala UI component with props
xaheen component UserCard --ui=xala --props="user:User,editable:boolean?"

# Norwegian compliant component
xaheen component UserCard --compliance=norwegian --locale

# Full-featured component
xaheen component UserProfile \
  --ui=xala \
  --compliance=norwegian \
  --props="user:User,onSave:function,readonly:boolean?=false" \
  --type=form \
  --test \
  --story \
  --locale
```

### **Page Generation**
```bash
# Basic page
xaheen page Dashboard

# Page with routing and auth
xaheen page AdminDashboard --route="/admin/dashboard" --auth --layout=admin

# Norwegian compliant page
xaheen page UserSettings --compliance=norwegian --ui=xala
```

### **Model Generation**
```bash
# Basic model
xaheen model User

# Model with fields and relations
xaheen model User \
  --fields="name:string,email:string,age:number?" \
  --relations="posts:Post[],profile:Profile?" \
  --validation

# GDPR compliant model
xaheen model User --compliance=gdpr --audit
```

---

## 📋 **Implementation Steps**

### **Step 1: Add Command Schemas (30 min)**
1. Add new schemas to `apps/cli/src/types.ts`
2. Add new commands to router in `apps/cli/src/index.ts`

### **Step 2: Create Handlers (2 hours)**
1. Create `component-handler.ts`, `page-handler.ts`, `model-handler.ts`
2. Implement basic generation logic
3. Add error handling and validation

### **Step 3: Create Templates (3 hours)**
1. Copy useful templates from xala-scaffold
2. Create Xala UI variants
3. Create compliance variants
4. Test template processing

### **Step 4: Add Validation (1 hour)**
1. Create `validation-handler.ts`
2. Implement compliance checking
3. Add progress feedback

### **Step 5: Test & Polish (1 hour)**
1. Test all command combinations
2. Fix any issues
3. Update help text and documentation

---

## ✅ **Success Criteria**

### **Functional Requirements**
- ✅ Generate components in existing projects
- ✅ Generate pages with routing
- ✅ Generate models with database integration
- ✅ Support Xala UI System
- ✅ Support Norwegian compliance
- ✅ Backward compatibility maintained

### **User Experience**
- ✅ Clear progress feedback
- ✅ Helpful error messages
- ✅ Consistent command patterns
- ✅ Comprehensive help text

---

*This implementation preserves all original functionality while adding powerful individual generation capabilities that work seamlessly with existing projects.*
