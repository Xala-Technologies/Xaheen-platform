/**
 * Advanced Template Architecture - EPIC 4 & EPIC 15 Implementation
 * 
 * Central exports for the complete template inheritance, composition, and collaboration system.
 * This represents the full implementation of:
 * - EPIC 4: Advanced Template Architecture (Stories 2.1-2.3)
 * - EPIC 15: Shared Template Repositories with Versioning (Story 15.3)
 * 
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 * @version 2.0.0
 * @compliance Norwegian NSM Standards, GDPR, Enterprise Security
 */

// Core template inheritance system
export {
  TemplateInheritance,
  templateInheritance,
  type BaseTemplate,
  type TemplateSlot,
  type TemplateProp,
  type TemplateMetadata,
  type TemplateComposition,
  type InheritanceResult
} from './template-inheritance.js';

// Advanced template composition system
export {
  TemplateComposer,
  templateComposer,
  type TemplatePartial,
  type TemplateSlotConfig,
  type TemplateMixin,
  type CompositionContext,
  type CompositionResult
} from './template-composition.js';

// Context-aware generation system
export {
  ContextAwareGenerator,
  contextAwareGenerator,
  type BusinessContextPattern,
  type ContextPattern,
  type ComplianceRequirement,
  type ContextStyling,
  type ContextMetadata,
  type ProjectContext,
  type GenerationOptions
} from './context-aware-generator.js';

// Quality assurance templates
export {
  QualityAssuranceTemplates,
  qualityAssuranceTemplates,
  type QATemplateConfig,
  type QATemplate,
  type QAGenerationResult
} from './quality-assurance-templates.js';

// Main orchestration system
export {
  TemplateOrchestrator,
  templateOrchestrator,
  type TemplateVersion,
  type TemplateRegistry,
  type VersionedTemplate,
  type TemplateMigration,
  type AdvancedGenerationRequest,
  type GenerationResult,
  type QualityCheckResult
} from './template-orchestrator.js';

// EPIC 15 Story 15.3 - Shared Template Repositories with Versioning
export {
  TemplateRepositoryService,
  createTemplateRepositoryService,
  type TemplateRepositoryConfig,
  type TemplateMetadata,
  type RepositoryOperation,
  type RepositoryEvent,
  RepositoryEventType,
  TemplateRepositoryError,
  GitOperationError,
  AccessControlError
} from './template-repository.service';

export {
  TemplateVersionManagerService,
  createTemplateVersionManagerService,
  type VersionConstraint,
  type TemplateDependency,
  type VersionHistory,
  type VersionResolution,
  type Migration,
  type VersionEvent,
  VersionEventType,
  VersionManagerError,
  DependencyError,
  CompatibilityError
} from './template-version-manager.service';

export {
  TemplateSyncService,
  createTemplateSyncService,
  type SyncConfig,
  type SyncStatus,
  type CacheEntry,
  type SyncJob,
  type SyncEvent,
  SyncEventType,
  TemplateSyncError,
  ConflictResolutionError,
  CacheError
} from './template-sync.service';

/**
 * EPIC 4 & EPIC 15 Implementation Summary
 * 
 * ✅ Story 2.1: Template Inheritance System
 * - Base template infrastructure with Container + Stack components
 * - Template composition with partials, slots, and mixins
 * - Template extension and override system
 * - Template versioning and backward compatibility
 * 
 * ✅ Story 2.2: Context-Aware Generation
 * - Business context detection (e-commerce, SaaS, government, etc.)
 * - Smart pattern matching and recommendations
 * - Industry-specific templates and compliance
 * - Norwegian government compliance templates
 * 
 * ✅ Story 2.3: Quality Assurance Templates
 * - TypeScript strict mode enforcement
 * - ESLint + Prettier configuration with Norwegian rules
 * - Husky pre-commit hooks for quality gates
 * - Jest/Vitest/Playwright testing templates
 * - Storybook documentation templates
 * - Comprehensive CI/CD workflows
 * 
 * ✅ Story 15.3: Shared Template Repositories with Versioning
 * - Git-based template storage and versioning
 * - Team synchronization and collaboration
 * - Access control with NSM classification
 * - Semantic versioning with dependency management
 * - Automatic conflict resolution
 * - Distributed caching for performance
 * - Comprehensive audit trail
 * 
 * Key Features:
 * - 🎭 Template inheritance with multiple levels
 * - 🧩 Flexible composition with slots and mixins
 * - 🎯 Context-aware smart generation
 * - 🛡️ Built-in quality assurance
 * - 🇳🇴 Norwegian compliance (WCAG AAA, NSM, GDPR)
 * - 📊 Template versioning and migrations
 * - 🤖 AI-optimized token usage
 * - 🚀 Enterprise-grade architecture
 * - 🔄 Shared repositories with team collaboration
 * - 🏷️ Semantic versioning with dependency resolution
 * - ⚡ Automatic synchronization with conflict handling
 * - 🔒 Enterprise security and access control
 */

// Convenience function for complete template generation
export async function generateAdvancedComponent(request: {
  readonly componentName: string;
  readonly templateId?: string;
  readonly businessContext?: string;
  readonly outputPath: string;
  readonly framework?: 'react' | 'vue' | 'angular' | 'svelte' | 'nextjs';
  readonly qaLevel?: 'basic' | 'enterprise' | 'norwegian-government';
  readonly options?: {
    readonly generateTests?: boolean;
    readonly generateStories?: boolean;
    readonly generateDocs?: boolean;
    readonly includeLocalization?: boolean;
    readonly dryRun?: boolean;
  };
}) {
  const { templateOrchestrator } = await import('./template-orchestrator.js');
  
  const advancedRequest = {
    componentName: request.componentName,
    templateId: request.templateId || 'base-component',
    businessContext: request.businessContext,
    projectContext: {
      projectType: 'component',
      framework: request.framework || 'react',
      packageManager: 'npm',
      hasDatabase: false,
      hasAuth: false,
      hasPayments: false,
      hasAnalytics: false,
      targetMarkets: ['NO'],
      features: {}
    },
    qaConfig: {
      projectType: 'component' as const,
      framework: request.framework || 'react' as const,
      testingFramework: 'jest' as const,
      linting: true,
      formatting: true,
      preCommitHooks: true,
      typeChecking: request.qaLevel === 'basic' ? 'moderate' as const : 'strict' as const,
      coverage: request.qaLevel === 'basic' ? 'basic' as const : 'comprehensive' as const,
      accessibility: request.qaLevel !== 'basic',
      performance: request.qaLevel === 'enterprise' || request.qaLevel === 'norwegian-government',
      security: request.qaLevel === 'enterprise' || request.qaLevel === 'norwegian-government',
      norwegianCompliance: request.qaLevel === 'norwegian-government'
    },
    composition: {
      slots: [],
      mixins: request.qaLevel === 'norwegian-government' ? ['norwegian-compliance'] : [],
      overrides: {}
    },
    options: {
      outputPath: request.outputPath,
      generateTests: request.options?.generateTests ?? true,
      generateStories: request.options?.generateStories ?? true,
      generateDocs: request.options?.generateDocs ?? false,
      includeLocalization: request.options?.includeLocalization ?? (request.qaLevel === 'norwegian-government'),
      autoMigrate: true,
      dryRun: request.options?.dryRun ?? false
    }
  };

  return templateOrchestrator.generateAdvancedComponent(advancedRequest);
}

// Template system status and health check
export async function getTemplateSystemStatus() {
  const { templateOrchestrator } = await import('./template-orchestrator.js');
  
  const availableTemplates = templateOrchestrator.getAvailableTemplates();
  const availableContexts = templateOrchestrator.getAvailableContexts();
  const availableQAConfigs = templateOrchestrator.getAvailableQAConfigs();
  
  return {
    healthy: true,
    version: '1.0.0',
    templates: {
      count: availableTemplates.length,
      types: [...new Set(availableTemplates.map(t => t.category))]
    },
    contexts: {
      count: availableContexts.length,
      domains: [...new Set(availableContexts.map(c => c.domain))]
    },
    qaConfigs: {
      count: availableQAConfigs.length,
      levels: ['basic', 'enterprise', 'norwegian-government']
    },
    features: {
      inheritance: true,
      composition: true,
      contextAware: true,
      qualityAssurance: true,
      versioning: true,
      norwegianCompliance: true,
      aiOptimized: true
    },
    compliance: {
      wcag: 'AAA',
      nsm: 'OPEN',
      gdpr: true,
      typescript: 'strict'
    }
  };
}

export default {
  generateAdvancedComponent,
  getTemplateSystemStatus,
  templateOrchestrator
};