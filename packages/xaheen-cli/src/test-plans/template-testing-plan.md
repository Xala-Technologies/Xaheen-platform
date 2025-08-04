# Comprehensive Template Testing Plan

This document outlines a systematic approach to testing the migrated templates, ensuring they render correctly, produce valid code, and integrate seamlessly with the CLI v2 system.

## Testing Strategy Overview

### **Phase-Based Approach**
1. **Phase 1**: Next.js Template Validation
2. **Phase 2**: Xala Component Template Testing  
3. **Phase 3**: Template Rendering Integration
4. **Phase 4**: Full-Stack Template Combinations
5. **Phase 5**: Performance & Validation Testing

### **Testing Dimensions**
- ✅ **Syntax Validation**: Templates compile without errors
- ✅ **Context Rendering**: Variables render correctly with test data
- ✅ **Output Validation**: Generated code is syntactically correct
- ✅ **TypeScript Compliance**: Generated TypeScript passes type checking
- ✅ **Integration Testing**: Templates work with service injection system
- ✅ **Performance Testing**: Template rendering performance benchmarks

---

## Phase 1: Next.js Template Validation Tests

### **1.1 Configuration Templates**
Test all Next.js configuration files for proper rendering and valid output.

#### **Test Cases:**
```typescript
// Test Context Data
const nextJsTestContext = {
  projectName: 'TestApp',
  framework: 'next',
  packageManager: 'bun',
  features: ['typescript', 'tailwind', 'eslint'],
  ui: {
    library: 'shadcn-ui',
    theme: 'light'
  },
  auth: {
    provider: 'nextauth',
    providers: ['google', 'github']
  },
  database: {
    provider: 'prisma',
    type: 'postgres'
  },
  api: 'trpc',
  deploy: 'vercel'
};
```

#### **Configuration Templates to Test:**
1. **package.json.hbs** ✅
   - Verify dependencies are correctly rendered
   - Check scripts include proper commands
   - Validate peer dependencies

2. **next.config.ts.hbs** ✅
   - Test i18n configuration rendering
   - Verify experimental features
   - Check image optimization settings

3. **tailwind.config.ts.hbs** ✅
   - Validate theme extensions
   - Check plugin configurations
   - Test responsive breakpoints

4. **tsconfig.json.hbs** ✅
   - Verify compiler options
   - Check path mappings
   - Test include/exclude patterns

5. **eslint.config.js.hbs** ✅
   - Validate rule configurations
   - Check plugin integrations
   - Test TypeScript integration

### **1.2 Component Templates**
Test React components for TypeScript compliance and proper structure.

#### **Component Templates to Test:**
1. **layout.tsx.hbs** ✅
   - Test metadata rendering
   - Verify font loading
   - Check provider wrapping

2. **page.tsx.hbs** ✅
   - Validate component structure
   - Test prop typing
   - Check export patterns

3. **providers.tsx.hbs** ✅
   - Test context providers
   - Verify client-side rendering
   - Check error boundaries

4. **theme-provider.tsx.hbs** ✅
   - Test theme switching logic
   - Verify localStorage integration
   - Check accessibility attributes

### **1.3 Layout Templates**
Test specialized layout components for different use cases.

#### **Layout Templates to Test:**
1. **AdaptiveLayout.tsx.hbs** ✅
   - Test responsive behavior
   - Verify breakpoint handling
   - Check mobile/desktop switching

2. **AdminLayout.tsx.hbs** ✅
   - Test navigation structure
   - Verify role-based rendering
   - Check sidebar functionality

3. **AuthLayout.tsx.hbs** ✅
   - Test authentication flow
   - Verify redirect logic
   - Check loading states

4. **Norwegian-specific layouts** 🇳🇴
   - Test Norwegian compliance features
   - Verify accessibility standards (WCAG AAA)
   - Check localization integration

---

## Phase 2: Xala Component Template Testing

### **2.1 Core Xala Components**
Test specialized Xala components for Norwegian compliance and enterprise features.

#### **Test Context for Xala Components:**
```typescript
const xalaTestContext = {
  projectName: 'XalaApp',
  compliance: {
    gdpr: true,
    wcag: 'AAA',
    iso27001: true
  },
  localization: {
    languages: ['nb', 'en', 'ar'],
    rtl: true,
    fallback: 'en'
  },
  norwegian: {
    altinn: true,
    bankid: true,
    vipps: true
  },
  enterprise: {
    sso: true,
    audit: true,
    monitoring: true
  }
};
```

#### **Xala Component Tests:**
1. **xala-advanced.hbs** ✅
   - Test advanced UI patterns
   - Verify accessibility compliance
   - Check responsive behavior

2. **xala-display-gdpr.hbs** ✅
   - Test GDPR compliance components
   - Verify consent management
   - Check data processing notices

3. **xala-display-wcag-aaa.hbs** ✅
   - Test WCAG AAA compliance
   - Verify keyboard navigation
   - Check screen reader support

4. **xala-display-norwegian.hbs** ✅
   - Test Norwegian localization
   - Verify cultural adaptations
   - Check legal compliance

5. **xala-form-norwegian.hbs** ✅
   - Test Norwegian form patterns
   - Verify validation rules
   - Check accessibility standards

6. **xala-layout-norwegian.hbs** ✅
   - Test Norwegian layout patterns
   - Verify cultural conventions
   - Check responsive design

### **2.2 Norwegian Integration Components**
Test components that integrate with Norwegian services.

#### **Integration Component Tests:**
1. **BankID Integration** 🏦
   - Test authentication flow
   - Verify security patterns
   - Check error handling

2. **Vipps Integration** 💳
   - Test payment flows
   - Verify transaction handling
   - Check callback processing

3. **Altinn Integration** 🏛️
   - Test government service integration
   - Verify API communication
   - Check data validation

---

## Phase 3: Template Rendering Integration Tests

### **3.1 Template Loader Tests**
Test the template loading and rendering system.

#### **Integration Test Suite:**
```typescript
describe('Template Integration Tests', () => {
  test('Next.js template rendering pipeline', async () => {
    // Test full rendering pipeline
    const templates = [
      'frontend/next/configs/package.json.hbs',
      'frontend/next/components/layout.tsx.hbs',
      'frontend/next/components/page.tsx.hbs'
    ];
    
    for (const template of templates) {
      const result = await templateLoader.renderTemplate(template, nextJsTestContext);
      expect(result).toMatchSnapshot();
      expect(() => JSON.parse(result)).not.toThrow(); // For JSON templates
    }
  });
  
  test('Xala component rendering', async () => {
    // Test Xala component rendering
    const xalaTemplates = [
      'components/files/xala-advanced.hbs',
      'components/files/xala-display-gdpr.hbs',
      'components/files/xala-form-norwegian.hbs'
    ];
    
    for (const template of xalaTemplates) {
      const result = await templateLoader.renderTemplate(template, xalaTestContext);
      expect(result).toContain('export'); // Should be valid React components
      expect(result).toMatchSnapshot();
    }
  });
});
```

### **3.2 Service Injection Tests**
Test template integration with the service injection system.

#### **Service Injection Test Cases:**
1. **Next.js Project Creation** ✅
   - Test complete Next.js project scaffolding
   - Verify all templates are applied correctly
   - Check file creation and content

2. **Xala Component Injection** ✅
   - Test individual component injection
   - Verify Norwegian compliance features
   - Check accessibility implementations

---

## Phase 4: Full-Stack Template Combination Tests

### **4.1 Complete Application Scenarios**
Test realistic full-stack application combinations.

#### **Scenario 1: Norwegian E-commerce Platform**
```typescript
const norwegianEcommerceContext = {
  projectName: 'NorwayShop',
  frontend: 'next',
  backend: 'express',
  database: 'prisma',
  auth: 'nextauth',
  payments: 'vipps',
  compliance: ['gdpr', 'wcag-aaa'],
  integrations: ['bankid', 'altinn'],
  features: [
    'typescript',
    'tailwind', 
    'trpc',
    'norwegian-forms',
    'rtl-support'
  ]
};
```

#### **Scenario 2: Enterprise SaaS Application**
```typescript
const enterpriseSaasContext = {
  projectName: 'EnterpriseSaaS',
  frontend: 'next',
  backend: 'fastify',
  database: 'drizzle',
  auth: 'clerk',
  api: 'trpc',
  monitoring: 'sentry',
  deployment: 'docker',
  features: [
    'typescript',
    'tailwind',
    'multi-tenant',
    'audit-logging',
    'sso-integration'
  ]
};
```

### **4.2 Template Combination Tests**
Test how templates work together in realistic scenarios.

#### **Combination Test Suite:**
1. **Frontend + Backend + Database** ✅
   - Test Next.js + Express + Prisma combination
   - Verify API integration patterns
   - Check database schema generation

2. **Norwegian Compliance Stack** ✅
   - Test BankID + Vipps + Altinn integration
   - Verify GDPR compliance components
   - Check WCAG AAA accessibility

3. **Enterprise Features** ✅
   - Test SSO + Audit + Monitoring combination
   - Verify security implementations
   - Check performance optimizations

---

## Phase 5: Performance & Validation Tests

### **5.1 Template Performance Tests**
Benchmark template rendering performance.

#### **Performance Metrics:**
- **Template Load Time**: < 50ms per template
- **Rendering Time**: < 100ms for complex templates
- **Memory Usage**: < 50MB during rendering
- **Cache Efficiency**: > 90% cache hit rate

#### **Performance Test Suite:**
```typescript
describe('Template Performance Tests', () => {
  test('template loading performance', async () => {
    const startTime = performance.now();
    
    // Load 50 templates concurrently
    const templates = Array.from({length: 50}, (_, i) => 
      templateLoader.loadTemplate(`frontend/next/components/layout.tsx.hbs`)
    );
    
    await Promise.all(templates);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(2000); // < 2 seconds
  });
  
  test('template rendering performance', async () => {
    const template = 'frontend/next/configs/package.json.hbs';
    const iterations = 1000;
    
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      await templateLoader.renderTemplate(template, nextJsTestContext);
    }
    
    const endTime = performance.now();
    const avgTime = (endTime - startTime) / iterations;
    
    expect(avgTime).toBeLessThan(10); // < 10ms per render
  });
});
```

### **5.2 Output Validation Tests**
Validate that generated code is syntactically correct and follows best practices.

#### **Validation Test Suite:**
```typescript
describe('Output Validation Tests', () => {
  test('TypeScript syntax validation', async () => {
    const tsTemplates = [
      'frontend/next/components/layout.tsx.hbs',
      'frontend/next/files/middleware.ts.hbs',
      'backend/express/files/index.ts.hbs'
    ];
    
    for (const template of tsTemplates) {
      const result = await templateLoader.renderTemplate(template, testContext);
      
      // Use TypeScript compiler to validate syntax
      expect(() => ts.createSourceFile(
        'test.tsx',
        result,
        ts.ScriptTarget.Latest,
        true
      )).not.toThrow();
    }
  });
  
  test('JSON configuration validation', async () => {
    const jsonTemplates = [
      'frontend/next/configs/package.json.hbs',
      'frontend/next/configs/tsconfig.json.hbs'
    ];
    
    for (const template of jsonTemplates) {
      const result = await templateLoader.renderTemplate(template, testContext);
      expect(() => JSON.parse(result)).not.toThrow();
    }
  });
  
  test('CSS/SCSS validation', async () => {
    const styleTemplates = [
      'localization/files/rtl-styles.css.hbs'
    ];
    
    for (const template of styleTemplates) {
      const result = await templateLoader.renderTemplate(template, testContext);
      // Use PostCSS or similar to validate CSS syntax
      expect(result).toMatch(/^[^{}]*\{[^}]*\}[^{}]*$/s);
    }
  });
});
```

### **5.3 Accessibility & Compliance Tests**
Test generated components for accessibility and compliance standards.

#### **Accessibility Test Suite:**
```typescript
describe('Accessibility Compliance Tests', () => {
  test('WCAG AAA compliance', async () => {
    const wcagTemplates = [
      'components/files/xala-display-wcag-aaa.hbs',
      'frontend/next/components/layout.tsx.hbs'
    ];
    
    for (const template of wcagTemplates) {
      const result = await templateLoader.renderTemplate(template, xalaTestContext);
      
      // Check for accessibility attributes
      expect(result).toMatch(/aria-/);
      expect(result).toMatch(/role=/);
      expect(result).toMatch(/tabIndex=/);
    }
  });
  
  test('Norwegian compliance features', async () => {
    const norwegianTemplates = [
      'components/files/xala-display-norwegian.hbs',
      'components/files/xala-form-norwegian.hbs'
    ];
    
    for (const template of norwegianTemplates) {
      const result = await templateLoader.renderTemplate(template, xalaTestContext);
      
      // Check for Norwegian-specific patterns
      expect(result).toMatch(/nb|norwegian|norge/i);
      expect(result).toMatch(/altinn|bankid|vipps/i);
    }
  });
});
```

---

## Test Implementation Plan

### **Immediate Actions (Phase 1)**
1. ✅ Create test infrastructure
2. ✅ Set up test contexts
3. ✅ Implement Next.js template tests
4. ✅ Validate configuration templates

### **Short-term Goals (Phases 2-3)**
1. ✅ Implement Xala component tests
2. ✅ Create integration test suite
3. ✅ Set up performance benchmarks
4. ✅ Validate Norwegian compliance

### **Long-term Goals (Phases 4-5)**
1. ✅ Full-stack scenario testing
2. ✅ Performance optimization
3. ✅ Comprehensive validation
4. ✅ Continuous integration setup

---

## Success Criteria

### **Template Quality Metrics**
- ✅ **100% Template Coverage**: All templates have corresponding tests
- ✅ **99% Pass Rate**: Templates render without errors
- ✅ **Valid Output**: Generated code passes syntax validation
- ✅ **Performance Targets**: Meet rendering performance benchmarks

### **Compliance Metrics**
- ✅ **WCAG AAA**: All UI components meet accessibility standards
- ✅ **GDPR Compliance**: Data handling components follow regulations
- ✅ **Norwegian Standards**: Integration components work with Norwegian services

### **Integration Metrics**
- ✅ **Service Integration**: Templates integrate seamlessly with CLI system
- ✅ **Template Combinations**: Multiple templates work together correctly
- ✅ **Real-world Scenarios**: Complete applications can be generated successfully

This comprehensive testing plan ensures that our migrated templates are production-ready, compliant with standards, and provide an excellent developer experience.