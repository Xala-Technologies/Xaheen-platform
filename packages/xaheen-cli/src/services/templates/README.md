# Template Services

## Purpose

The template services module provides comprehensive template management, processing, and generation capabilities for the Xaheen CLI. It handles template lifecycle management, Norwegian compliance integration, semantic template composition, and intelligent template recommendations.

## Architecture

```
templates/
├── accessibility-linter.ts              # Accessibility validation for templates
├── accessibility-validator.ts           # WCAG compliance validation
├── context-aware-generator.ts           # Context-aware template generation
├── dynamic-composer.ts                  # Dynamic template composition
├── index.ts                            # Module exports
├── local-template-generator.ts         # Local template generation
├── norwegian-compliance-validator.ts   # Norwegian compliance validation
├── pattern-mapper.ts                   # Template pattern mapping
├── platform-adapter.ts                # Multi-platform template adaptation
├── quality-assurance-templates.ts     # Template quality assurance
├── semantic-component-mapper.ts        # Semantic template mapping
├── template-composition-validator.ts   # Template composition validation
├── template-composition.ts             # Template composition engine
├── template-context-enhancer.ts        # Template context enhancement
├── template-inheritance.service.ts     # Template inheritance system
├── template-inheritance.ts             # Template inheritance implementation
├── template-loader.ts                  # Template loading and caching
├── template-migration-example.ts       # Template migration utilities
├── template-modernization-service.ts   # Template modernization
├── template-orchestrator.ts            # Template orchestration
├── template-registry.ts                # Template registry management
├── template-repository.service.ts      # Template repository service
├── template-selector.ts                # Intelligent template selection
├── template-sync.service.ts            # Template synchronization
└── template-version-manager.service.ts # Template versioning
```

### Key Features

- **Template Lifecycle**: Complete template management from creation to retirement
- **Norwegian Compliance**: Automatic compliance validation and enforcement
- **Multi-Platform**: Support for React, Vue, Angular, Svelte, and more
- **Semantic Composition**: Intelligent template composition and inheritance
- **Quality Assurance**: Automated quality checks and accessibility validation
- **Version Management**: Template versioning and migration support

## Dependencies

- `handlebars`: Template engine for code generation
- `mustache`: Alternative template engine support
- `joi`: Schema validation for templates
- `semver`: Semantic versioning for templates
- `lodash`: Utility functions for template processing
- `yaml`: YAML template configuration support

## Usage Examples

### Template Registry Management

```typescript
import { TemplateRegistry } from './template-registry';

const templateRegistry = new TemplateRegistry({
  registryPath: './templates',
  cachingEnabled: true,
  norwegianCompliance: true,
  qualityValidation: true
});

// Register a new template
await templateRegistry.register({
  name: 'norwegian-government-form',
  version: '1.0.0',
  category: 'forms',
  platform: 'react',
  description: 'Norwegian government compliant form component',
  author: 'Xaheen Team',
  compliance: {
    nsm: 'RESTRICTED',
    gdpr: true,
    wcag: 'AAA',
    norwegianLaw: true
  },
  files: [
    {
      path: 'component.tsx.hbs',
      type: 'component',
      required: true
    },
    {
      path: 'types.ts.hbs',
      type: 'types',
      required: true
    },
    {
      path: 'styles.module.css.hbs',
      type: 'styles',
      required: false
    },
    {
      path: 'test.spec.tsx.hbs',
      type: 'test',
      required: false
    }
  ],
  dependencies: {
    'react': '^18.0.0',
    'react-hook-form': '^7.0.0',
    'zod': '^3.0.0',
    '@bankid/oidc-client': '^1.0.0'
  },
  metadata: {
    norwegianFeatures: ['bankid-integration', 'altinn-ready', 'norwegian-validation'],
    complexity: 'medium',
    maintainability: 'high',
    reusability: 'high'
  }
});

// Search for templates
const templates = await templateRegistry.search({
  category: 'forms',
  platform: 'react',
  compliance: ['nsm', 'gdpr'],
  tags: ['norwegian', 'government']
});

console.log('Found templates:', templates.map(t => t.name));
```

### Context-Aware Template Generation

```typescript
import { ContextAwareGenerator } from './context-aware-generator';

const contextGenerator = new ContextAwareGenerator({
  aiEnabled: true,
  norwegianOptimization: true,
  complianceValidation: true,
  performanceOptimization: true
});

// Generate template with context awareness
const generatedTemplate = await contextGenerator.generateWithContext({
  templateName: 'user-profile-component',
  context: {
    project: {
      name: 'NorwegianGovernmentPortal',
      type: 'government-service',
      framework: 'react',
      typescript: true,
      designSystem: 'norwegian-government-design-system'
    },
    user: {
      role: 'government-developer',
      clearanceLevel: 'RESTRICTED',
      preferences: {
        language: 'norwegian',
        accessibility: 'strict',
        testing: 'comprehensive'
      }
    },
    environment: {
      deployment: 'norwegian-government-cloud',
      compliance: ['nsm', 'gdpr', 'wcag-aaa'],
      security: 'high',
      auditLogging: 'comprehensive'
    },
    integrations: [
      'bankid',
      'altinn',
      'id-porten',
      'folkeregisteret'
    ]
  },
  customization: {
    dataFields: [
      {
        name: 'personalNumber',
        type: 'string',
        validation: 'norwegianPersonalNumber',
        encryption: true,
        auditRequired: true
      },
      {
        name: 'name',
        type: 'string',
        required: true,
        localization: true
      },
      {
        name: 'address',
        type: 'NorwegianAddress',
        validation: 'norwegianAddress',
        integration: 'folkeregisteret'
      }
    ],
    features: [
      'bankid-authentication',
      'data-validation',
      'audit-logging',
      'error-handling',
      'loading-states',
      'accessibility-features'
    ],
    styling: {
      theme: 'norwegian-government',
      responsiveDesign: true,
      highContrast: true,
      printFriendly: true
    }
  }
});

console.log('Generated files:', generatedTemplate.files);
console.log('Compliance validation:', generatedTemplate.compliance);
console.log('Performance metrics:', generatedTemplate.performance);
```

### Norwegian Compliance Validator

```typescript
import { NorwegianComplianceValidator } from './norwegian-compliance-validator';

const complianceValidator = new NorwegianComplianceValidator({
  strictMode: true,
  auditLogging: true,
  realTimeValidation: true,
  complianceStandards: ['nsm', 'gdpr', 'wcag', 'norwegian-law']
});

// Validate template for Norwegian compliance
const validationResult = await complianceValidator.validateTemplate({
  templatePath: './templates/user-registration-form',
  context: {
    dataClassification: 'RESTRICTED',
    userType: 'citizen',
    serviceType: 'government'
  },
  requirements: {
    gdpr: {
      consentManagement: true,
      dataMinimization: true,
      rightToErasure: true,
      auditTrail: true
    },
    nsm: {
      classification: 'RESTRICTED',
      accessControl: true,
      encryption: true,
      auditLogging: 'comprehensive'
    },
    accessibility: {
      wcagLevel: 'AAA',
      screenReaderSupport: true,
      keyboardNavigation: true,
      highContrast: true
    },
    norwegian: {
      language: 'bokmaal',
      culturalAdaptation: true,
      legalCompliance: true,
      governmentStandards: true
    }
  }
});

if (!validationResult.compliant) {
  console.error('Compliance violations:', validationResult.violations);
  console.log('Recommended fixes:', validationResult.fixes);
} else {
  console.log('Template is fully compliant');
  console.log('Compliance score:', validationResult.score);
}
```

### Template Composition Engine

```typescript
import { TemplateComposition } from './template-composition';

const composer = new TemplateComposition({
  inheritanceSupport: true,
  mixinSupport: true,
  conditionalGeneration: true,
  norwegianOptimization: true
});

// Compose complex template from multiple sources
const composedTemplate = await composer.compose({
  baseTemplate: 'government-base-form',
  mixins: [
    'bankid-authentication-mixin',
    'norwegian-validation-mixin',
    'audit-logging-mixin',
    'accessibility-mixin'
  ],
  overrides: {
    styling: 'skatteetaten-theme',
    validation: 'tax-specific-validation',
    integration: 'tax-system-integration'
  },
  conditions: {
    'if-mobile': {
      template: 'mobile-optimized-layout',
      styles: 'mobile-first-styles'
    },
    'if-high-security': {
      authentication: 'multi-factor-required',
      encryption: 'field-level-encryption',
      auditLogging: 'real-time-monitoring'
    },
    'if-accessibility-needed': {
      features: ['screen-reader-support', 'keyboard-only-navigation'],
      validation: 'accessibility-strict'
    }
  },
  context: {
    agency: 'skatteetaten',
    serviceType: 'tax-declaration',
    userType: 'taxpayer',
    dataClassification: 'CONFIDENTIAL'
  }
});

console.log('Composed template structure:', composedTemplate.structure);
console.log('Applied mixins:', composedTemplate.appliedMixins);
console.log('Resolved conditions:', composedTemplate.resolvedConditions);
```

### Template Modernization Service

```typescript
import { TemplateModernizationService } from './template-modernization-service';

const modernizationService = new TemplateModernizationService({
  targetStandards: {
    react: '18.0.0',
    typescript: '5.0.0',
    accessibility: 'wcag-2.2-aaa',
    security: 'owasp-2023',
    norwegian: 'latest-standards'
  },
  preserveCompatibility: true,
  generateMigrationGuide: true
});

// Modernize legacy template
const modernizationResult = await modernizationService.modernize({
  templatePath: './legacy-templates/old-form-component',
  modernizationGoals: [
    'upgrade-react-patterns',
    'add-typescript-support',
    'improve-accessibility',
    'add-norwegian-compliance',
    'enhance-security',
    'optimize-performance'
  ],
  constraints: {
    breakingChanges: 'minimize',
    performanceRegression: 'none',
    apiCompatibility: 'maintain'
  },
  migrationStrategy: {
    phased: true,
    testingRequired: true,
    documentationUpdate: true,
    trainingMaterials: true
  }
});

if (modernizationResult.success) {
  console.log('Modernization completed successfully');
  console.log('Improvements:', modernizationResult.improvements);
  console.log('Migration guide:', modernizationResult.migrationGuide);
  console.log('Breaking changes:', modernizationResult.breakingChanges);
} else {
  console.error('Modernization failed:', modernizationResult.errors);
  console.log('Recommended actions:', modernizationResult.recommendations);
}
```

## Norwegian Enterprise Features

### Government Template Standards

```typescript
class GovernmentTemplateStandards {
  async validateGovernmentCompliance(
    template: Template,
    agency: NorwegianAgency
  ): Promise<GovernmentComplianceResult> {
    const standards = await this.getAgencyStandards(agency);
    
    const validations = await Promise.all([
      this.validateDesignSystem(template, standards.designSystem),
      this.validateAccessibility(template, standards.accessibility),
      this.validateSecurity(template, standards.security),
      this.validateDataHandling(template, standards.dataHandling),
      this.validateLanguage(template, standards.language),
      this.validateIntegrations(template, standards.integrations)
    ]);
    
    return {
      compliant: validations.every(v => v.valid),
      violations: validations.filter(v => !v.valid),
      recommendations: this.generateRecommendations(validations),
      certificationLevel: this.calculateCertificationLevel(validations),
      agencyApproval: await this.checkAgencyApproval(template, agency)
    };
  }
  
  private async getAgencyStandards(agency: NorwegianAgency): Promise<AgencyStandards> {
    const baseStandards = {
      designSystem: 'felles-designsystem',
      accessibility: 'wcag-2.2-aaa',
      security: 'nsm-basic',
      language: 'norwegian-government-standard'
    };
    
    // Agency-specific overrides
    const agencyOverrides = {
      'skatteetaten': {
        security: 'nsm-confidential',
        integrations: ['id-porten', 'altinn', 'folkeregisteret'],
        dataHandling: 'tax-data-specific'
      },
      'nav': {
        accessibility: 'universal-design-strict',
        integrations: ['id-porten', 'aareg', 'arena'],
        dataHandling: 'social-security-data'
      },
      'helsedirektoratet': {
        security: 'nsm-secret',
        integrations: ['helsenorge', 'kjernejournal'],
        dataHandling: 'health-data-specific'
      }
    };
    
    return { ...baseStandards, ...agencyOverrides[agency] };
  }
}
```

### GDPR Template Compliance

```typescript
class GDPRTemplateCompliance {
  async validateGDPRCompliance(template: Template): Promise<GDPRValidationResult> {
    const validations = {
      consentManagement: await this.validateConsentManagement(template),
      dataMinimization: await this.validateDataMinimization(template),
      purposeLimitation: await this.validatePurposeLimitation(template),
      dataSubjectRights: await this.validateDataSubjectRights(template),
      privacyByDesign: await this.validatePrivacyByDesign(template),
      auditTrail: await this.validateAuditTrail(template)
    };
    
    return {
      compliant: Object.values(validations).every(v => v.valid),
      validations,
      recommendations: this.generateGDPRRecommendations(validations),
      privacyImpactAssessment: await this.conductPIA(template),
      dataProtectionOfficerReview: await this.requestDPOReview(template)
    };
  }
  
  async generateGDPRCompliantTemplate(
    baseTemplate: Template,
    dataProcessingRequirements: DataProcessingRequirements
  ): Promise<GDPRTemplate> {
    return {
      ...baseTemplate,
      gdprFeatures: {
        consentBanner: this.generateConsentBanner(dataProcessingRequirements),
        privacyNotice: this.generatePrivacyNotice(dataProcessingRequirements),
        dataSubjectRights: this.generateDataSubjectRightsInterface(),
        cookieManagement: this.generateCookieManagement(),
        auditLogging: this.generateAuditLogging(dataProcessingRequirements),
        dataRetention: this.generateRetentionPolicies(dataProcessingRequirements)
      },
      implementation: {
        consentTracking: true,
        dataMinimization: true,
        encryptionAtRest: true,
        encryptionInTransit: true,
        rightToBeForgotten: true,
        dataPortability: true
      },
      compliance: {
        lawfulBasis: dataProcessingRequirements.lawfulBasis,
        retentionPeriod: dataProcessingRequirements.retentionPeriod,
        dataCategories: dataProcessingRequirements.dataCategories,
        processingPurposes: dataProcessingRequirements.purposes
      }
    };
  }
}
```

## Template Quality Assurance

### Automated Quality Checks

```typescript
class TemplateQualityAssurance {
  async performQualityAssessment(template: Template): Promise<QualityReport> {
    const assessments = await Promise.all([
      this.assessCodeQuality(template),
      this.assessPerformance(template),
      this.assessSecurity(template),
      this.assessAccessibility(template),
      this.assessMaintainability(template),
      this.assessReusability(template),
      this.assessNorwegianCompliance(template)
    ]);
    
    const overallScore = this.calculateOverallScore(assessments);
    
    return {
      overallScore,
      assessments,
      recommendations: this.generateQualityRecommendations(assessments),
      certification: this.determineCertificationLevel(overallScore),
      improvements: this.suggestImprovements(assessments)
    };
  }
  
  private async assessCodeQuality(template: Template): Promise<CodeQualityAssessment> {
    return {
      complexity: await this.measureComplexity(template),
      maintainability: await this.measureMaintainability(template),
      readability: await this.measureReadability(template),
      testCoverage: await this.measureTestCoverage(template),
      documentation: await this.assessDocumentation(template),
      codeStyle: await this.validateCodeStyle(template)
    };
  }
  
  private async assessNorwegianCompliance(template: Template): Promise<NorwegianComplianceAssessment> {
    return {
      language: await this.validateNorwegianLanguage(template),
      culturalAdaptation: await this.validateCulturalAdaptation(template),
      legalCompliance: await this.validateLegalCompliance(template),
      governmentStandards: await this.validateGovernmentStandards(template),
      dataProtection: await this.validateDataProtection(template),
      accessibilityStandards: await this.validateNorwegianAccessibility(template)
    };
  }
}
```

## Testing

### Unit Tests

```typescript
describe('Template Services', () => {
  describe('TemplateRegistry', () => {
    let registry: TemplateRegistry;
    
    beforeEach(() => {
      registry = new TemplateRegistry({
        registryPath: './test-templates',
        norwegianCompliance: true
      });
    });
    
    it('should register Norwegian compliant template', async () => {
      const template = createTestNorwegianTemplate();
      
      const result = await registry.register(template);
      
      expect(result.success).toBe(true);
      expect(result.template.compliance.nsm).toBeDefined();
      expect(result.template.metadata.norwegianFeatures).toContain('bankid-integration');
    });
    
    it('should validate template compliance', async () => {
      const nonCompliantTemplate = createNonCompliantTemplate();
      
      await expect(registry.register(nonCompliantTemplate))
        .rejects.toThrow('Template does not meet Norwegian compliance requirements');
    });
  });
  
  describe('NorwegianComplianceValidator', () => {
    it('should detect compliance violations', async () => {
      const validator = new NorwegianComplianceValidator();
      const template = createTemplateWithViolations();
      
      const result = await validator.validateTemplate(template);
      
      expect(result.compliant).toBe(false);
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          type: 'accessibility',
          description: 'Missing Norwegian language support'
        })
      );
    });
  });
});
```

### Integration Tests

```typescript
describe('Template Services Integration', () => {
  it('should generate and validate Norwegian government form', async () => {
    const contextGenerator = new ContextAwareGenerator();
    const complianceValidator = new NorwegianComplianceValidator();
    
    // Generate template
    const template = await contextGenerator.generateWithContext({
      templateName: 'government-citizen-form',
      context: {
        project: { type: 'government-service' },
        compliance: ['nsm', 'gdpr', 'wcag']
      }
    });
    
    // Validate compliance
    const validation = await complianceValidator.validateTemplate(template);
    
    expect(validation.compliant).toBe(true);
    expect(template.norwegianFeatures).toContain('bankid-integration');
    expect(template.accessibility.wcagLevel).toBe('AAA');
  });
});
```

## Performance Optimization

### Template Caching

```typescript
class TemplateCache {
  private cache = new Map<string, CachedTemplate>();
  private lru = new LRUCache<string, Template>({ max: 1000 });
  
  async getTemplate(
    templateId: string,
    context: TemplateContext
  ): Promise<Template | null> {
    const cacheKey = this.generateCacheKey(templateId, context);
    
    // Check memory cache first
    const cached = this.lru.get(cacheKey);
    if (cached && !this.isExpired(cached)) {
      return cached;
    }
    
    // Check persistent cache
    const persistent = this.cache.get(cacheKey);
    if (persistent && !this.isExpired(persistent)) {
      this.lru.set(cacheKey, persistent.template);
      return persistent.template;
    }
    
    return null;
  }
  
  async cacheTemplate(
    templateId: string,
    context: TemplateContext,
    template: Template
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(templateId, context);
    
    // Cache in memory
    this.lru.set(cacheKey, template);
    
    // Cache persistently
    this.cache.set(cacheKey, {
      template,
      timestamp: Date.now(),
      ttl: this.calculateTTL(template)
    });
  }
}
```

## Contributing

### Development Guidelines

1. **Norwegian Focus**: Prioritize Norwegian compliance and standards
2. **Quality First**: Implement comprehensive quality assurance
3. **Performance**: Optimize template processing performance
4. **Accessibility**: Ensure all templates meet WCAG AAA standards
5. **Security**: Implement security best practices
6. **Testing**: Include comprehensive unit and integration tests
7. **Documentation**: Provide clear template documentation

### Template Development Standards

- Follow Norwegian government design standards
- Implement comprehensive accessibility features
- Include Norwegian language support
- Ensure GDPR compliance
- Add proper security measures
- Include comprehensive tests
- Provide clear documentation
- Support multiple platforms and frameworks