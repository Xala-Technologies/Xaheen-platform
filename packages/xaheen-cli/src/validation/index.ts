/**
 * Comprehensive Validation System - Main Export
 * 
 * Exports all validation components for use throughout the CLI:
 * - Core validation framework
 * - Specialized validators (CLAUDE, Design System, NSM, WCAG)
 * - Validation runner and orchestration
 * - Types and utilities
 * 
 * @author DevOps Expert Agent
 * @since 2025-08-06
 */

// =============================================================================
// CORE VALIDATION FRAMEWORK
// =============================================================================

export {
  ComprehensiveValidator,
  createComprehensiveValidator,
  ValidationContext,
  ValidationRule,
  ValidationIssue,
  ValidationFix,
  ValidationReport,
  ValidationScore,
  ValidationCategory,
  CLAUDEConfig
} from './comprehensive-validator';

// =============================================================================
// SPECIALIZED VALIDATORS
// =============================================================================

export {
  CLAUDEComplianceValidator,
  createCLAUDEComplianceValidator,
  claudeComplianceRules
} from './claude-compliance-validator';

export {
  DesignSystemValidator,
  createDesignSystemValidator,
  designSystemRules
} from './design-system-validator';

export {
  NSMComplianceValidator,
  createNSMComplianceValidator,
  nsmComplianceRules
} from './nsm-compliance-validator';

export {
  WCAGAccessibilityValidator,
  createWCAGAccessibilityValidator,
  wcagAccessibilityRules
} from './wcag-accessibility-validator';

// =============================================================================
// AST ANALYSIS
// =============================================================================

export {
  ASTAnalyzer,
  createASTAnalyzer,
  ASTAnalysisResult,
  InterfaceAnalysis,
  ComponentAnalysis,
  JSXElementAnalysis,
  ImportAnalysis,
  ExportAnalysis,
  ASTIssue,
  CodeLocation
} from './ast-analyzer';

// =============================================================================
// VALIDATION RUNNER
// =============================================================================

export {
  ValidationRunner,
  createValidationRunner,
  ValidationRunnerOptions,
  ComprehensiveValidationReport
} from './validation-runner';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create a complete validation suite with all validators
 */
export function createFullValidationSuite() {
  return {
    comprehensive: createComprehensiveValidator(),
    claude: createCLAUDEComplianceValidator(),
    designSystem: createDesignSystemValidator(),
    nsm: createNSMComplianceValidator(),
    wcag: createWCAGAccessibilityValidator(),
    runner: createValidationRunner()
  };
}

/**
 * Get validation rule by ID across all validators
 */
export function getValidationRuleById(ruleId: string): ValidationRule | null {
  const validators = createFullValidationSuite();
  
  // Check each validator for the rule
  for (const validator of Object.values(validators)) {
    if ('getRules' in validator && typeof validator.getRules === 'function') {
      const rules = validator.getRules();
      const rule = rules.find((r: any) => r.id === ruleId);
      if (rule) return rule;
    }
  }
  
  return null;
}

/**
 * Get all available validation rules
 */
export function getAllValidationRules(): ValidationRule[] {
  const validators = createFullValidationSuite();
  const allRules: ValidationRule[] = [];
  
  // Collect rules from all validators
  for (const validator of Object.values(validators)) {
    if ('getRules' in validator && typeof validator.getRules === 'function') {
      allRules.push(...validator.getRules());
    }
  }
  
  return allRules;
}

/**
 * Validate project with default configuration
 */
export async function quickValidate(projectPath: string) {
  const runner = createValidationRunner();
  
  return await runner.validateProject(projectPath, {
    claudeCompliance: true,
    designSystemUsage: true,
    nsmCompliance: true,
    wcagAccessibility: true,
    verbose: false
  });
}

/**
 * Get validation statistics for a project
 */
export async function getValidationStats(projectPath: string) {
  const report = await quickValidate(projectPath);
  
  return {
    totalFiles: report.summary.totalFiles,
    validatedFiles: report.summary.validatedFiles,
    totalIssues: report.summary.totalIssues,
    criticalIssues: report.summary.criticalIssues,
    fixableIssues: report.summary.fixableIssues,
    overallScore: report.overall.score.overall,
    claudeScore: report.claude.score,
    designSystemScore: report.designSystem.overallScore,
    nsmScore: report.nsm.score,
    accessibilityScore: report.accessibility.overallScore,
    success: report.success
  };
}

// =============================================================================
// VERSION AND METADATA
// =============================================================================

export const VALIDATION_SYSTEM_VERSION = '1.0.0';
export const SUPPORTED_STANDARDS = {
  CLAUDE_MD: '2025-08-06',
  DESIGN_SYSTEM: '@xaheen/design-system@^1.0.0',
  NSM_COMPLIANCE: 'NSM 2024 Guidelines',
  WCAG: 'WCAG 2.1 AAA'
};

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default {
  // Core
  createComprehensiveValidator,
  createValidationRunner,
  
  // Validators
  createCLAUDEComplianceValidator,
  createDesignSystemValidator,
  createNSMComplianceValidator,
  createWCAGAccessibilityValidator,
  
  // Utilities
  createFullValidationSuite,
  quickValidate,
  getValidationStats,
  getAllValidationRules,
  getValidationRuleById,
  
  // Metadata
  version: VALIDATION_SYSTEM_VERSION,
  supportedStandards: SUPPORTED_STANDARDS
};