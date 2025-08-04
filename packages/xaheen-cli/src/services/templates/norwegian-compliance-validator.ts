/**
 * @fileoverview Norwegian Compliance Token Validation System
 * @description Validates templates against Norwegian government standards and NSM requirements
 * @version 1.0.0
 * @compliance NSM Guidelines, Norwegian Government Digital Standards, EN 301 549
 */

import { z } from 'zod';

/**
 * NSM Security Classification Schema
 */
const NSMClassificationSchema = z.enum(['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET']);
type NSMClassification = z.infer<typeof NSMClassificationSchema>;

/**
 * Norwegian Language Support Schema
 */
const NorwegianLanguageSchema = z.enum(['nb', 'nn', 'se', 'en']);
type NorwegianLanguage = z.infer<typeof NorwegianLanguageSchema>;

/**
 * Norwegian Compliance Configuration
 */
interface NorwegianComplianceConfig {
  readonly nsmClassification: NSMClassification;
  readonly requiredLanguages: NorwegianLanguage[];
  readonly governmentStyling: boolean;
  readonly accessibilityLevel: 'A' | 'AA' | 'AAA';
  readonly dataProtection: boolean;
  readonly auditLogging: boolean;
  readonly digitalIdentity: boolean;
}

/**
 * Compliance Validation Rules
 */
interface ComplianceRule {
  readonly id: string;
  readonly category: 'security' | 'accessibility' | 'language' | 'styling' | 'data' | 'identity';
  readonly severity: 'error' | 'warning' | 'info';
  readonly description: string;
  readonly requirement: string;
  readonly norwegianSource: string;
  readonly testFunction: (content: string, config: NorwegianComplianceConfig) => ValidationResult;
}

interface ValidationResult {
  readonly compliant: boolean;
  readonly message: string;
  readonly suggestion?: string;
  readonly automaticFix?: string;
  readonly evidence?: string[];
}

interface ComplianceReport {
  readonly compliant: boolean;
  readonly overallScore: number; // 0-100
  readonly violations: ComplianceViolation[];
  readonly warnings: ComplianceWarning[];
  readonly recommendations: ComplianceRecommendation[];
  readonly summary: ComplianceSummary;
}

interface ComplianceViolation {
  readonly ruleId: string;
  readonly category: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
  readonly requirement: string;
  readonly norwegianSource: string;
  readonly suggestion: string;
  readonly automaticFix?: string;
  readonly line?: number;
  readonly evidence?: string[];
}

interface ComplianceWarning extends Omit<ComplianceViolation, 'severity'> {
  readonly severity: 'warning';
}

interface ComplianceRecommendation extends Omit<ComplianceViolation, 'severity'> {
  readonly severity: 'info';
}

interface ComplianceSummary {
  readonly totalRules: number;
  readonly passedRules: number;
  readonly failedRules: number;
  readonly warningRules: number;
  readonly categoryScores: Record<string, number>;
  readonly estimatedFixTime: number;
  readonly priorityFixes: string[];
}

/**
 * Norwegian Government Design Tokens
 */
const NORWEGIAN_DESIGN_TOKENS = {
  colors: {
    // Official Norwegian flag colors
    primary: {
      red: '#FF0000',      // Norwegian red
      blue: '#002664',     // Norwegian blue
      white: '#FFFFFF'     // Norwegian white
    },
    // Government portal colors
    government: {
      primary: '#0B3B75',    // Dark blue for authority
      secondary: '#E6F3FF',  // Light blue for backgrounds
      accent: '#FF6B35',     // Orange for highlights
      neutral: '#4A5568'     // Gray for text
    },
    // Accessibility compliant colors (WCAG AAA)
    accessible: {
      text: '#1A202C',       // High contrast text
      background: '#FFFFFF',  // Clean background
      error: '#E53E3E',      // Error red
      success: '#38A169',    // Success green
      warning: '#D69E2E',    // Warning yellow
      info: '#3182CE'        // Info blue
    }
  },
  typography: {
    // Norwegian government font specifications
    fontFamily: {
      primary: '"Source Sans Pro", "Open Sans", system-ui, sans-serif',
      secondary: '"Merriweather", "Times New Roman", serif',
      mono: '"Fira Code", "Monaco", monospace'
    },
    // Font sizes optimized for Norwegian text
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px - Norwegian standard
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem' // 30px
    }
  },
  spacing: {
    // 8pt grid system aligned with Norwegian standards
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem'   // 64px
  }
};

/**
 * Norwegian Compliance Rules
 */
const NORWEGIAN_COMPLIANCE_RULES: ComplianceRule[] = [
  // NSM Security Classification Rules
  {
    id: 'nsm-classification-required',
    category: 'security',
    severity: 'error',
    description: 'All government content must have NSM security classification',
    requirement: 'data-nsm-classification attribute required',
    norwegianSource: 'NSM Sikkerhetshåndbok v3.0, Section 4.2',
    testFunction: (content, config) => {
      const hasClassification = content.includes('data-nsm-classification') || 
                               content.includes('nsmClassification');
      
      if (!hasClassification) {
        return {
          compliant: false,
          message: 'Missing NSM security classification',
          suggestion: 'Add data-nsm-classification="{{nsmClassification}}" to main content elements',
          automaticFix: 'data-nsm-classification="{{nsmClassification || \'OPEN\'}}"',
          evidence: ['No NSM classification attributes found in template']
        };
      }
      
      return {
        compliant: true,
        message: 'NSM classification present'
      };
    }
  },

  {
    id: 'nsm-classification-valid',
    category: 'security',
    severity: 'error',
    description: 'NSM classification must use valid values',
    requirement: 'Classification must be OPEN, RESTRICTED, CONFIDENTIAL, or SECRET',
    norwegianSource: 'NSM Sikkerhetshåndbok v3.0, Section 4.2.1',
    testFunction: (content, config) => {
      const classificationMatches = content.match(/data-nsm-classification="([^"]+)"/g);
      const invalidClassifications: string[] = [];
      
      if (classificationMatches) {
        classificationMatches.forEach(match => {
          const value = match.match(/"([^"]+)"/)?.[1];
          if (value && !['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET', '{{nsmClassification}}'].includes(value)) {
            invalidClassifications.push(value);
          }
        });
      }
      
      if (invalidClassifications.length > 0) {
        return {
          compliant: false,
          message: `Invalid NSM classifications: ${invalidClassifications.join(', ')}`,
          suggestion: 'Use only OPEN, RESTRICTED, CONFIDENTIAL, or SECRET',
          evidence: invalidClassifications
        };
      }
      
      return {
        compliant: true,
        message: 'Valid NSM classifications'
      };
    }
  },

  // Language Support Rules
  {
    id: 'norwegian-language-support',
    category: 'language',
    severity: 'error',
    description: 'Norwegian government sites must support Norwegian languages',
    requirement: 'Support for Norwegian Bokmål (nb), and optionally Nynorsk (nn) and Sami (se)',
    norwegianSource: 'Digitaliseringsrundskrivet §7, Language Requirements',
    testFunction: (content, config) => {
      const hasI18n = content.includes('{{t ') || content.includes('useTranslation') || content.includes('$t(');
      const hasLangAttribute = content.includes('lang=') || content.includes('locale');
      
      if (!hasI18n) {
        return {
          compliant: false,
          message: 'Missing internationalization support',
          suggestion: 'Use {{t "key" "default"}} for all user-facing text',
          automaticFix: 'Replace hardcoded text with {{t "key" "text"}}',
          evidence: ['No i18n functions found']
        };
      }
      
      if (!hasLangAttribute) {
        return {
          compliant: false,
          message: 'Missing language attribute specification',
          suggestion: 'Add lang="{{locale || \'nb\'}}" to appropriate elements',
          automaticFix: 'lang="{{locale || \'nb\'}}"'
        };
      }
      
      return {
        compliant: true,
        message: 'Norwegian language support implemented'
      };
    }
  },

  {
    id: 'hardcoded-text-forbidden',
    category: 'language',
    severity: 'error',
    description: 'Hardcoded text is not allowed in government applications',
    requirement: 'All user-facing text must be translatable',
    norwegianSource: 'Digitaliseringsrundskrivet §7.2, Multilingual Support',
    testFunction: (content, config) => {
      // Look for hardcoded text outside of i18n functions
      const hardcodedTextRegex = />[\s]*[a-zA-ZæøåÆØÅ][^<{]*</g;
      const hardcodedMatches = content.match(hardcodedTextRegex);
      
      if (hardcodedMatches) {
        const violations = hardcodedMatches.filter(match => 
          !match.includes('{{t ') && 
          !match.includes('$t(') &&
          match.trim().length > 1
        );
        
        if (violations.length > 0) {
          return {
            compliant: false,
            message: 'Hardcoded text found in template',
            suggestion: 'Replace all hardcoded text with i18n functions',
            evidence: violations.slice(0, 5), // First 5 examples
            automaticFix: 'Use {{t "key" "default text"}} for all text content'
          };
        }
      }
      
      return {
        compliant: true,
        message: 'No hardcoded text found'
      };
    }
  },

  // Accessibility Rules (Norwegian Government Standards)
  {
    id: 'wcag-aa-minimum',
    category: 'accessibility',
    severity: 'error',
    description: 'Norwegian government requires minimum WCAG AA compliance',
    requirement: 'WCAG 2.1 AA compliance as per EU Web Accessibility Directive',
    norwegianSource: 'Forskrift om universell utforming av IKT §4',
    testFunction: (content, config) => {
      const accessibilityFeatures = {
        ariaLabels: content.includes('aria-label'),
        altText: content.includes('alt='),
        headingHierarchy: /h[1-6]|Text.*heading/i.test(content),
        keyboardSupport: content.includes('onKeyDown') || content.includes('tabIndex'),
        focusManagement: content.includes('focus') || content.includes('Focus')
      };
      
      const missingFeatures = Object.entries(accessibilityFeatures)
        .filter(([, present]) => !present)
        .map(([feature]) => feature);
      
      if (missingFeatures.length > 2) {
        return {
          compliant: false,
          message: `Multiple accessibility features missing: ${missingFeatures.join(', ')}`,
          suggestion: 'Add comprehensive accessibility attributes and keyboard support',
          evidence: missingFeatures
        };
      }
      
      return {
        compliant: true,
        message: 'Basic accessibility features present'
      };
    }
  },

  {
    id: 'semantic-html-required',
    category: 'accessibility',
    severity: 'error',
    description: 'Norwegian government requires semantic HTML/components',
    requirement: 'Use semantic elements and components for better accessibility',
    norwegianSource: 'WCAG 2.1 Implementation Guide (Norwegian Translation)',
    testFunction: (content, config) => {
      // Check for raw HTML elements instead of semantic components
      const rawHtmlElements = content.match(/<(div|span|p|h[1-6]|button|input)\b/gi);
      const semanticComponents = content.match(/<(Box|Stack|Text|Button|Card|Container)\b/gi);
      
      if (rawHtmlElements && rawHtmlElements.length > (semanticComponents?.length || 0)) {
        return {
          compliant: false,
          message: 'Using raw HTML elements instead of semantic components',
          suggestion: 'Replace HTML elements with semantic UI components',
          evidence: rawHtmlElements.slice(0, 5),
          automaticFix: 'Use semantic components from @xala-technologies/ui-system'
        };
      }
      
      return {
        compliant: true,
        message: 'Using semantic components'
      };
    }
  },

  // Government Styling Rules
  {
    id: 'government-color-scheme',
    category: 'styling',
    severity: 'warning',
    description: 'Government sites should use approved color schemes',
    requirement: 'Use Norwegian government design tokens for colors',
    norwegianSource: 'Designsystem for offentlig sektor v3.0',
    testFunction: (content, config) => {
      const hasDesignTokens = content.includes('var(--') || content.includes('tokens.');
      const hasInlineStyles = content.includes('style=') && content.includes('color:');
      
      if (hasInlineStyles && !hasDesignTokens) {
        return {
          compliant: false,
          message: 'Using inline styles instead of design tokens',
          suggestion: 'Use Norwegian government design tokens for consistent styling',
          automaticFix: 'Replace inline styles with design token variables'
        };
      }
      
      return {
        compliant: true,
        message: 'Using appropriate styling approach'
      };
    }
  },

  {
    id: 'norwegian-typography',
    category: 'styling',
    severity: 'info',
    description: 'Recommended typography for Norwegian text',
    requirement: 'Use fonts optimized for Norwegian characters (æ, ø, å)',
    norwegianSource: 'Designsystem for offentlig sektor, Typography Guidelines',
    testFunction: (content, config) => {
      const fontFamilyPattern = /font-family:|fontFamily:/gi;
      const norwegianFriendlyFonts = [
        'Source Sans Pro', 'Open Sans', 'Lato', 'Roboto', 
        'system-ui', 'sans-serif'
      ];
      
      const fontReferences = content.match(fontFamilyPattern);
      if (fontReferences) {
        const hasNorwegianFriendlyFont = norwegianFriendlyFonts.some(font => 
          content.includes(font)
        );
        
        if (!hasNorwegianFriendlyFont) {
          return {
            compliant: false,
            message: 'Consider using fonts optimized for Norwegian characters',
            suggestion: 'Use Source Sans Pro, Open Sans, or other Norwegian-friendly fonts'
          };
        }
      }
      
      return {
        compliant: true,
        message: 'Typography appears suitable for Norwegian text'
      };
    }
  },

  // Data Protection Rules
  {
    id: 'gdpr-compliance-indicators',
    category: 'data',
    severity: 'warning',
    description: 'GDPR compliance indicators should be present',
    requirement: 'Templates handling user data should include GDPR considerations',
    norwegianSource: 'Personopplysningsloven (Norwegian GDPR Implementation)',
    testFunction: (content, config) => {
      const hasFormElements = /input|Input|textarea|Textarea|select|Select/i.test(content);
      const hasDataHandling = content.includes('onSubmit') || content.includes('onChange');
      const hasPrivacyIndicators = content.includes('privacy') || 
                                  content.includes('consent') ||
                                  content.includes('data-processing');
      
      if (hasFormElements && hasDataHandling && !hasPrivacyIndicators) {
        return {
          compliant: false,
          message: 'Form elements present but no privacy/consent indicators',
          suggestion: 'Add privacy notices and consent mechanisms for forms',
          evidence: ['Form elements found without privacy considerations']
        };
      }
      
      return {
        compliant: true,
        message: 'Data handling appears appropriate'
      };
    }
  },

  // Digital Identity Rules
  {
    id: 'digital-identity-ready',
    category: 'identity',
    severity: 'info',
    description: 'Template should be compatible with Norwegian digital identity systems',
    requirement: 'Support for ID-porten, BankID, and other Norwegian authentication methods',
    norwegianSource: 'ID-porten Integration Guide v4.0',
    testFunction: (content, config) => {
      const hasAuthElements = content.includes('login') || 
                             content.includes('auth') ||
                             content.includes('signin');
      const hasIdPortenSupport = content.includes('id-porten') ||
                                content.includes('bankid') ||
                                content.includes('digital-identity');
      
      if (hasAuthElements && !hasIdPortenSupport) {
        return {
          compliant: false,
          message: 'Authentication elements present but no Norwegian identity system support',
          suggestion: 'Consider integration with ID-porten or BankID for Norwegian users'
        };
      }
      
      return {
        compliant: true,
        message: 'Digital identity considerations appropriate'
      };
    }
  }
];

/**
 * Norwegian Compliance Validator
 */
export class NorwegianComplianceValidator {
  private readonly rules: ComplianceRule[];
  private readonly config: NorwegianComplianceConfig;

  constructor(config: Partial<NorwegianComplianceConfig> = {}) {
    this.config = {
      nsmClassification: 'OPEN',
      requiredLanguages: ['nb', 'en'],
      governmentStyling: true,
      accessibilityLevel: 'AA',
      dataProtection: true,
      auditLogging: false,
      digitalIdentity: true,
      ...config
    };

    this.rules = NORWEGIAN_COMPLIANCE_RULES.filter(rule => {
      // Filter rules based on configuration
      if (rule.category === 'accessibility' && this.config.accessibilityLevel === 'A') {
        return rule.severity !== 'error' || rule.id.includes('minimum');
      }
      return true;
    });
  }

  /**
   * Validate template for Norwegian compliance
   */
  public validateTemplate(templateContent: string): ComplianceReport {
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];
    const recommendations: ComplianceRecommendation[] = [];

    this.rules.forEach(rule => {
      const result = rule.testFunction(templateContent, this.config);
      
      if (!result.compliant) {
        const violation: ComplianceViolation = {
          ruleId: rule.id,
          category: rule.category,
          severity: rule.severity as 'error' | 'warning',
          message: result.message,
          requirement: rule.requirement,
          norwegianSource: rule.norwegianSource,
          suggestion: result.suggestion || '',
          automaticFix: result.automaticFix,
          evidence: result.evidence
        };

        if (rule.severity === 'error') {
          violations.push(violation);
        } else if (rule.severity === 'warning') {
          warnings.push(violation as ComplianceWarning);
        } else {
          recommendations.push(violation as ComplianceRecommendation);
        }
      }
    });

    const summary = this.generateSummary(violations, warnings, recommendations);
    const overallScore = this.calculateComplianceScore(violations, warnings, recommendations);

    return {
      compliant: violations.length === 0,
      overallScore,
      violations,
      warnings,
      recommendations,
      summary
    };
  }

  /**
   * Auto-fix Norwegian compliance issues
   */
  public autoFix(templateContent: string): {
    fixedTemplate: string;
    appliedFixes: string[];
    remainingIssues: number;
  } {
    const report = this.validateTemplate(templateContent);
    let fixedTemplate = templateContent;
    const appliedFixes: string[] = [];

    // Apply automatic fixes
    [...report.violations, ...report.warnings, ...report.recommendations]
      .filter(issue => issue.automaticFix)
      .forEach(issue => {
        switch (issue.ruleId) {
          case 'nsm-classification-required':
            if (!fixedTemplate.includes('data-nsm-classification')) {
              // Add NSM classification to main elements
              fixedTemplate = fixedTemplate.replace(
                /<(main|article|section)([^>]*?)>/gi,
                `<$1$2 data-nsm-classification="{{nsmClassification || 'OPEN'}}">`
              );
              appliedFixes.push('Added NSM classification attributes');
            }
            break;

          case 'norwegian-language-support':
            if (!fixedTemplate.includes('lang=')) {
              // Add language attribute
              fixedTemplate = fixedTemplate.replace(
                /<(html|div|main)([^>]*?)>/gi,
                `<$1$2 lang="{{locale || 'nb'}}">`
              );
              appliedFixes.push('Added language attributes');
            }
            break;

          case 'hardcoded-text-forbidden':
            // This is complex and would need sophisticated text replacement
            appliedFixes.push('Note: Hardcoded text replacement requires manual review');
            break;

          case 'semantic-html-required':
            // Replace common HTML elements with semantic components
            const replacements = {
              '<div': '<Box',
              '</div>': '</Box>',
              '<span': '<Text variant="inline"',
              '</span>': '</Text>',
              '<p': '<Text',
              '</p>': '</Text>'
            };
            
            Object.entries(replacements).forEach(([from, to]) => {
              fixedTemplate = fixedTemplate.replace(new RegExp(from, 'gi'), to);
            });
            appliedFixes.push('Replaced HTML elements with semantic components');
            break;
        }
      });

    const newReport = this.validateTemplate(fixedTemplate);
    
    return {
      fixedTemplate,
      appliedFixes,
      remainingIssues: newReport.violations.length + newReport.warnings.length
    };
  }

  /**
   * Generate comprehensive compliance report
   */
  public generateDetailedReport(templateContent: string): {
    report: ComplianceReport;
    recommendations: string[];
    implementationGuide: string[];
    complianceChecklist: ComplianceChecklistItem[];
  } {
    const report = this.validateTemplate(templateContent);
    
    return {
      report,
      recommendations: this.generateRecommendations(report),
      implementationGuide: this.generateImplementationGuide(report),
      complianceChecklist: this.generateComplianceChecklist(report)
    };
  }

  /**
   * Calculate overall compliance score
   */
  private calculateComplianceScore(
    violations: ComplianceViolation[],
    warnings: ComplianceWarning[],
    recommendations: ComplianceRecommendation[]
  ): number {
    const totalRules = this.rules.length;
    const errorWeight = 3;
    const warningWeight = 2;
    const infoWeight = 1;
    
    const maxPossibleScore = totalRules * errorWeight;
    const actualScore = maxPossibleScore - 
      (violations.length * errorWeight) - 
      (warnings.length * warningWeight) - 
      (recommendations.length * infoWeight);
    
    return Math.max(0, Math.round((actualScore / maxPossibleScore) * 100));
  }

  /**
   * Generate summary
   */
  private generateSummary(
    violations: ComplianceViolation[],
    warnings: ComplianceWarning[],
    recommendations: ComplianceRecommendation[]
  ): ComplianceSummary {
    const totalRules = this.rules.length;
    const failedRules = violations.length;
    const warningRules = warnings.length;
    const passedRules = totalRules - failedRules - warningRules;

    const categoryMap = new Map<string, { passed: number; failed: number; warnings: number }>();
    
    this.rules.forEach(rule => {
      if (!categoryMap.has(rule.category)) {
        categoryMap.set(rule.category, { passed: 0, failed: 0, warnings: 0 });
      }
    });

    violations.forEach(v => {
      const category = categoryMap.get(v.category)!;
      category.failed++;
    });

    warnings.forEach(w => {
      const category = categoryMap.get(w.category)!;
      category.warnings++;
    });

    // Calculate passed rules
    categoryMap.forEach((counts, category) => {
      const totalCategoryRules = this.rules.filter(r => r.category === category).length;
      counts.passed = totalCategoryRules - counts.failed - counts.warnings;
    });

    const categoryScores: Record<string, number> = {};
    categoryMap.forEach((counts, category) => {
      const total = counts.passed + counts.failed + counts.warnings;
      categoryScores[category] = total > 0 ? Math.round((counts.passed / total) * 100) : 100;
    });

    const estimatedFixTime = violations.length * 15 + warnings.length * 10 + recommendations.length * 5;
    
    const priorityFixes = violations
      .filter(v => v.severity === 'error')
      .slice(0, 5)
      .map(v => `${v.category}: ${v.suggestion}`);

    return {
      totalRules,
      passedRules,
      failedRules,
      warningRules,
      categoryScores,
      estimatedFixTime,
      priorityFixes
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(report: ComplianceReport): string[] {
    const recommendations: string[] = [];

    if (report.violations.length > 0) {
      recommendations.push('Address all compliance violations to meet Norwegian government standards');
    }

    if (report.summary.categoryScores.security < 80) {
      recommendations.push('Strengthen security compliance by implementing NSM classification and audit logging');
    }

    if (report.summary.categoryScores.accessibility < 90) {
      recommendations.push('Improve accessibility to meet Norwegian government requirements (minimum WCAG AA)');
    }

    if (report.summary.categoryScores.language < 100) {
      recommendations.push('Implement comprehensive Norwegian language support with proper internationalization');
    }

    recommendations.push('Consider implementing ID-porten integration for Norwegian digital identity');
    recommendations.push('Use Norwegian government design tokens for consistent visual identity');
    recommendations.push('Implement comprehensive audit logging for government transparency requirements');

    return recommendations;
  }

  /**
   * Generate implementation guide
   */
  private generateImplementationGuide(report: ComplianceReport): string[] {
    const guide: string[] = [];

    guide.push('Norwegian Government Compliance Implementation Guide:');
    guide.push('');
    guide.push('1. Security Classification (NSM):');
    guide.push('   - Add data-nsm-classification to all content sections');
    guide.push('   - Use {{nsmClassification}} template variable');
    guide.push('   - Implement proper access controls');
    guide.push('');
    guide.push('2. Language Support:');
    guide.push('   - Replace all hardcoded text with {{t "key" "default"}}');
    guide.push('   - Support Norwegian Bokmål (nb) as minimum');
    guide.push('   - Consider Nynorsk (nn) and Sami (se) for broader coverage');
    guide.push('');
    guide.push('3. Accessibility (WCAG AA/AAA):');
    guide.push('   - Use semantic components instead of raw HTML');
    guide.push('   - Add comprehensive aria-labels and keyboard support');
    guide.push('   - Ensure proper heading hierarchy');
    guide.push('   - Test with screen readers');
    guide.push('');
    guide.push('4. Government Styling:');
    guide.push('   - Use Norwegian government design tokens');
    guide.push('   - Implement high contrast mode');
    guide.push('   - Use approved color schemes and typography');

    return guide;
  }

  /**
   * Generate compliance checklist
   */
  private generateComplianceChecklist(report: ComplianceReport): ComplianceChecklistItem[] {
    const checklist: ComplianceChecklistItem[] = [
      {
        id: 'nsm-classification',
        title: 'NSM Security Classification',
        description: 'All content has appropriate security classification',
        completed: !report.violations.some(v => v.ruleId.includes('nsm')),
        required: true,
        category: 'security'
      },
      {
        id: 'norwegian-language',
        title: 'Norwegian Language Support',
        description: 'Full internationalization with Norwegian language support',
        completed: !report.violations.some(v => v.category === 'language'),
        required: true,
        category: 'language'
      },
      {
        id: 'wcag-compliance',
        title: 'WCAG AA Accessibility',
        description: 'Meets Norwegian accessibility requirements',
        completed: !report.violations.some(v => v.category === 'accessibility'),
        required: true,
        category: 'accessibility'
      },
      {
        id: 'semantic-components',
        title: 'Semantic UI Components',
        description: 'Uses semantic components instead of raw HTML',
        completed: !report.violations.some(v => v.ruleId === 'semantic-html-required'),
        required: true,
        category: 'accessibility'
      },
      {
        id: 'government-styling',
        title: 'Government Design Tokens',
        description: 'Uses approved Norwegian government styling',
        completed: !report.warnings.some(w => w.category === 'styling'),
        required: false,
        category: 'styling'
      },
      {
        id: 'data-protection',
        title: 'GDPR Compliance',
        description: 'Includes data protection and privacy considerations',
        completed: !report.warnings.some(w => w.category === 'data'),
        required: true,
        category: 'data'
      },
      {
        id: 'digital-identity',
        title: 'Digital Identity Integration',
        description: 'Compatible with Norwegian identity systems',
        completed: !report.recommendations.some(r => r.category === 'identity'),
        required: false,
        category: 'identity'
      }
    ];

    return checklist;
  }
}

interface ComplianceChecklistItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly completed: boolean;
  readonly required: boolean;
  readonly category: string;
}

/**
 * Default Norwegian compliance validator
 */
export const norwegianComplianceValidator = new NorwegianComplianceValidator({
  nsmClassification: 'OPEN',
  requiredLanguages: ['nb', 'en'],
  governmentStyling: true,
  accessibilityLevel: 'AA',
  dataProtection: true,
  auditLogging: true,
  digitalIdentity: true
});

export { NORWEGIAN_DESIGN_TOKENS, NORWEGIAN_COMPLIANCE_RULES };
export default NorwegianComplianceValidator;