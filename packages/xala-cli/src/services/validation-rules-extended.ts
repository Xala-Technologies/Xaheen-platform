/**
 * @fileoverview Extended Template Validation Rules
 * @description Additional validation rules for responsive, TypeScript, and Norwegian compliance
 * @version 5.0.0
 * @compliance WCAG AAA, NSM, CVA Pattern, TypeScript Strict
 */

import { ValidationRule, ValidationResult } from './template-validator.js';

// ============================================================================
// RESPONSIVE DESIGN RULES
// ============================================================================

export class BreakpointUsageRule implements ValidationRule {
  readonly name = 'breakpoint-usage';
  readonly description = 'Ensures proper responsive breakpoint usage';
  readonly severity = 'warning' as const;
  readonly category = 'responsive' as const;

  validate(content: string, filePath: string): ValidationResult {
    const violations: string[] = [];
    const suggestions: string[] = [];
    const warnings: string[] = [];

    // Check for responsive prefixes
    const responsivePrefixes = ['sm:', 'md:', 'lg:', 'xl:', '2xl:'];
    const hasResponsiveClasses = responsivePrefixes.some(prefix => content.includes(prefix));

    // Check if template has layout classes that should be responsive
    const layoutClasses = ['grid', 'flex', 'hidden', 'block', 'w-', 'h-'];
    const hasLayoutClasses = layoutClasses.some(cls => content.includes(cls));

    if (hasLayoutClasses && !hasResponsiveClasses && content.length > 500) {
      warnings.push('Template uses layout classes but lacks responsive variants');
      suggestions.push('Add responsive prefixes (sm:, md:, lg:) to layout classes for better mobile experience');
    }

    // Check for proper breakpoint hierarchy
    const breakpointMatches = content.match(/(sm|md|lg|xl|2xl):[a-z-]+/g);
    if (breakpointMatches && breakpointMatches.length > 0) {
      const uniqueBreakpoints = [...new Set(breakpointMatches.map(m => m.split(':')[0]))];
      
      // Warn if only using large breakpoints without mobile-first approach
      if (uniqueBreakpoints.includes('lg') && !uniqueBreakpoints.includes('sm')) {
        warnings.push('Using large breakpoints without mobile-first approach');
        suggestions.push('Consider mobile-first design with sm: and md: breakpoints');
      }
    }

    return {
      passed: violations.length === 0,
      violations,
      warnings,
      suggestions,
    };
  }
}

export class ResponsiveClassesRule implements ValidationRule {
  readonly name = 'responsive-classes';
  readonly description = 'Validates responsive class combinations';
  readonly severity = 'warning' as const;
  readonly category = 'responsive' as const;

  validate(content: string, filePath: string): ValidationResult {
    const violations: string[] = [];
    const suggestions: string[] = [];
    const warnings: string[] = [];

    // Check for conflicting responsive classes
    const conflictingPatterns = [
      { pattern: /hidden.*block/, message: 'Conflicting visibility classes' },
      { pattern: /flex.*grid/, message: 'Conflicting display classes' },
      { pattern: /w-full.*w-1\/2/, message: 'Conflicting width classes' },
    ];

    conflictingPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(content.replace(/\s+/g, ' '))) {
        warnings.push(message);
        suggestions.push('Use responsive prefixes to avoid class conflicts: hidden sm:block');
      }
    });

    // Check for common responsive patterns
    const hasNavigation = content.includes('nav') || content.includes('menu');
    if (hasNavigation && !content.includes('hidden') && !content.includes('md:')) {
      warnings.push('Navigation elements should be responsive');
      suggestions.push('Consider mobile navigation patterns with hidden/block responsive classes');
    }

    return {
      passed: violations.length === 0,
      violations,
      warnings,
      suggestions,
    };
  }
}

export class FlexboxGridRule implements ValidationRule {
  readonly name = 'flexbox-grid';
  readonly description = 'Validates proper flexbox and grid usage';
  readonly severity = 'warning' as const;
  readonly category = 'responsive' as const;

  validate(content: string, filePath: string): ValidationResult {
    const violations: string[] = [];
    const suggestions: string[] = [];
    const warnings: string[] = [];

    // Check for proper flex container usage
    const flexRegex = /flex(?!-)/g;
    const flexMatches = content.match(flexRegex);
    
    if (flexMatches && flexMatches.length > 0) {
      // Check if flex items have proper sizing
      const hasFlexSizing = content.includes('flex-1') || 
                           content.includes('flex-grow') ||
                           content.includes('flex-shrink');
      
      if (!hasFlexSizing) {
        warnings.push('Flex containers should include flex item sizing');
        suggestions.push('Add flex-1, flex-grow, or flex-shrink to flex items');
      }
    }

    // Check for proper grid usage
    const gridRegex = /grid(?!-)/g;
    const gridMatches = content.match(gridRegex);
    
    if (gridMatches && gridMatches.length > 0) {
      const hasGridCols = content.includes('grid-cols-');
      const hasGridRows = content.includes('grid-rows-');
      
      if (!hasGridCols && !hasGridRows) {
        warnings.push('Grid containers should define columns or rows');
        suggestions.push('Add grid-cols-* or grid-rows-* to grid containers');
      }

      // Check for responsive grid
      const hasResponsiveGrid = content.includes('sm:grid-cols') ||
                               content.includes('md:grid-cols') ||
                               content.includes('lg:grid-cols');
      
      if (!hasResponsiveGrid) {
        warnings.push('Grid layouts should be responsive');
        suggestions.push('Add responsive grid column variations: grid-cols-1 md:grid-cols-2 lg:grid-cols-3');
      }
    }

    return {
      passed: violations.length === 0,
      violations,
      warnings,
      suggestions,
    };
  }
}

// ============================================================================
// TYPESCRIPT RULES
// ============================================================================

export class TypeScriptStrictRule implements ValidationRule {
  readonly name = 'typescript-strict';
  readonly description = 'Validates TypeScript strict mode compliance';
  readonly severity = 'error' as const;
  readonly category = 'typescript' as const;

  validate(content: string, filePath: string): ValidationResult {
    const violations: string[] = [];
    const suggestions: string[] = [];
    const matches: Array<{ line: number; column: number; match: string }> = [];

    const lines = content.split('\n');

    // Check for 'any' type usage
    const anyTypeRegex = /:\s*any\b/g;
    
    lines.forEach((line, lineIndex) => {
      let match;
      while ((match = anyTypeRegex.exec(line)) !== null) {
        violations.push('Usage of "any" type found');
        suggestions.push('Replace "any" with specific types or use "unknown" for better type safety');
        matches.push({
          line: lineIndex + 1,
          column: match.index + 1,
          match: match[0]
        });
      }
    });

    // Check for non-null assertion operator overuse
    const nonNullRegex = /!\./g;
    let nonNullCount = 0;
    
    lines.forEach((line, lineIndex) => {
      let match;
      while ((match = nonNullRegex.exec(line)) !== null) {
        nonNullCount++;
        if (nonNullCount > 3) {
          violations.push('Excessive use of non-null assertion operator');
          suggestions.push('Use proper null checking instead of non-null assertion operator');
          matches.push({
            line: lineIndex + 1,
            column: match.index + 1,
            match: match[0]
          });
        }
      }
    });

    // Check for @ts-ignore comments
    const tsIgnoreRegex = /@ts-ignore/g;
    
    lines.forEach((line, lineIndex) => {
      let match;
      while ((match = tsIgnoreRegex.exec(line)) !== null) {
        violations.push('@ts-ignore comment found');
        suggestions.push('Fix TypeScript errors instead of using @ts-ignore');
        matches.push({
          line: lineIndex + 1,
          column: match.index + 1,
          match: match[0]
        });
      }
    });

    return {
      passed: violations.length === 0,
      violations,
      warnings: [],
      suggestions,
      matches
    };
  }
}

export class InterfaceDefinitionRule implements ValidationRule {
  readonly name = 'interface-definition';
  readonly description = 'Ensures proper interface definitions for props';
  readonly severity = 'error' as const;
  readonly category = 'typescript' as const;

  validate(content: string, filePath: string): ValidationResult {
    const violations: string[] = [];
    const suggestions: string[] = [];
    const warnings: string[] = [];

    // Check for Props interfaces
    const propsRegex = /(\w+)Props/g;
    const propsMatches = content.match(propsRegex);
    
    if (propsMatches && propsMatches.length > 0) {
      propsMatches.forEach(propsName => {
        const interfacePattern = new RegExp(`interface\\s+${propsName}`);
        const typePattern = new RegExp(`type\\s+${propsName}`);
        
        if (!interfacePattern.test(content) && !typePattern.test(content)) {
          violations.push(`${propsName} used without interface or type definition`);
          suggestions.push(`Define interface ${propsName} with readonly properties`);
        }
      });
    }

    // Check for readonly properties in interfaces
    const interfaceBlocks = content.match(/interface\s+\w+\s*{[^}]+}/g);
    
    if (interfaceBlocks) {
      interfaceBlocks.forEach(block => {
        const properties = block.match(/\w+\??:/g);
        if (properties && properties.length > 0) {
          const hasReadonly = block.includes('readonly');
          if (!hasReadonly) {
            warnings.push('Interface properties should be readonly');
            suggestions.push('Add readonly modifier to interface properties for immutability');
          }
        }
      });
    }

    return {
      passed: violations.length === 0,
      violations,
      warnings,
      suggestions,
    };
  }
}

export class NoAnyTypeRule implements ValidationRule {
  readonly name = 'no-any-type';
  readonly description = 'Prevents usage of any type in strict TypeScript';
  readonly severity = 'error' as const;
  readonly category = 'typescript' as const;

  validate(content: string, filePath: string): ValidationResult {
    const violations: string[] = [];
    const suggestions: string[] = [];
    const matches: Array<{ line: number; column: number; match: string }> = [];

    const lines = content.split('\n');

    // Check for any type in various contexts
    const anyPatterns = [
      /:\s*any\b/g,           // : any
      /Array<any>/g,          // Array<any>
      /any\[\]/g,             // any[]
      /Record<\w+,\s*any>/g,  // Record<string, any>
    ];

    anyPatterns.forEach(pattern => {
      lines.forEach((line, lineIndex) => {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          violations.push(`"any" type usage found: ${match[0]}`);
          suggestions.push('Use specific types, unknown, or generic constraints instead of "any"');
          matches.push({
            line: lineIndex + 1,
            column: match.index + 1,
            match: match[0]
          });
        }
      });
    });

    return {
      passed: violations.length === 0,
      violations,
      warnings: [],
      suggestions,
      matches
    };
  }
}

export class ExplicitReturnTypesRule implements ValidationRule {
  readonly name = 'explicit-return-types';
  readonly description = 'Ensures functions have explicit return types';
  readonly severity = 'warning' as const;
  readonly category = 'typescript' as const;

  validate(content: string, filePath: string): ValidationResult {
    const violations: string[] = [];
    const suggestions: string[] = [];
    const warnings: string[] = [];

    // Check for React components without return type
    const componentRegex = /export\s+const\s+\w+\s*=\s*\([^)]*\)\s*(?!:\s*JSX\.Element)/g;
    const componentMatches = content.match(componentRegex);
    
    if (componentMatches && componentMatches.length > 0) {
      warnings.push('React components should have explicit return type');
      suggestions.push('Add ": JSX.Element" return type to React components');
    }

    // Check for function declarations without return types
    const functionRegex = /function\s+\w+\s*\([^)]*\)\s*(?!:\s*\w)/g;
    const functionMatches = content.match(functionRegex);
    
    if (functionMatches && functionMatches.length > 0) {
      warnings.push('Functions should have explicit return types');
      suggestions.push('Add explicit return types to all functions');
    }

    return {
      passed: violations.length === 0,
      violations,
      warnings,
      suggestions,
    };
  }
}

// ============================================================================
// NORWEGIAN NSM COMPLIANCE RULES
// ============================================================================

export class DataClassificationRule implements ValidationRule {
  readonly name = 'data-classification';
  readonly description = 'Validates Norwegian NSM data classification compliance';
  readonly severity = 'error' as const;
  readonly category = 'norwegian' as const;

  validate(content: string, filePath: string): ValidationResult {
    const violations: string[] = [];
    const suggestions: string[] = [];
    const warnings: string[] = [];

    // Check for data classification markers
    const classificationLevels = ['ÅPEN', 'BEGRENSET', 'KONFIDENSIELT', 'HEMMELIG'];
    const hasClassification = classificationLevels.some(level => 
      content.includes(`@classification ${level}`) || 
      content.includes(`data-classification="${level}"`)
    );

    // Check if template handles sensitive data
    const sensitiveDataIndicators = [
      'password', 'ssn', 'personnummer', 'sensitive', 'confidential',
      'bankAccount', 'creditCard', 'personalData', 'gdpr'
    ];

    const handlesSensitiveData = sensitiveDataIndicators.some(indicator => 
      content.toLowerCase().includes(indicator.toLowerCase())
    );

    if (handlesSensitiveData && !hasClassification) {
      violations.push('Template handles sensitive data without NSM classification');
      suggestions.push('Add data classification comment: @classification KONFIDENSIELT or HEMMELIG');
    }

    // Check for proper security headers if template is for web components
    if (content.includes('http') || content.includes('fetch') || content.includes('api')) {
      const hasSecurityHeaders = content.includes('Authorization') || 
                                content.includes('X-') || 
                                content.includes('security');
      
      if (!hasSecurityHeaders) {
        warnings.push('API calls should include security headers');
        suggestions.push('Add proper authentication and security headers for NSM compliance');
      }
    }

    return {
      passed: violations.length === 0,
      violations,
      warnings,
      suggestions,
    };
  }
}

export class SecurityLabelsRule implements ValidationRule {
  readonly name = 'security-labels';
  readonly description = 'Ensures proper security labeling for Norwegian compliance';
  readonly severity = 'warning' as const;
  readonly category = 'norwegian' as const;

  validate(content: string, filePath: string): ValidationResult {
    const violations: string[] = [];
    const suggestions: string[] = [];
    const warnings: string[] = [];

    // Check for security-related components
    const securityComponents = ['form', 'input', 'login', 'auth', 'secure'];
    const hasSecurityComponents = securityComponents.some(comp => 
      content.toLowerCase().includes(comp)
    );

    if (hasSecurityComponents) {
      // Check for proper security attributes
      const securityAttributes = [
        'data-security-level',
        'data-classification', 
        'data-sensitive',
        'role="confidential"'
      ];

      const hasSecurityAttributes = securityAttributes.some(attr => content.includes(attr));
      
      if (!hasSecurityAttributes) {
        warnings.push('Security-related components should have security attributes');
        suggestions.push('Add data-security-level or data-classification attributes');
      }
    }

    // Check for audit trail capabilities
    if (content.includes('onChange') || content.includes('onSubmit')) {
      const hasAuditTrail = content.includes('audit') || 
                           content.includes('log') || 
                           content.includes('track');
      
      if (!hasAuditTrail) {
        warnings.push('Interactive components should support audit trails');
        suggestions.push('Consider adding audit logging for user interactions');
      }
    }

    return {
      passed: violations.length === 0,
      violations,
      warnings,
      suggestions,
    };
  }
}

export class LocalizationNorwegianRule implements ValidationRule {
  readonly name = 'localization-norwegian';
  readonly description = 'Validates Norwegian localization support';
  readonly severity = 'warning' as const;
  readonly category = 'norwegian' as const;

  validate(content: string, filePath: string): ValidationResult {
    const violations: string[] = [];
    const suggestions: string[] = [];
    const warnings: string[] = [];

    // Check for localization support
    const hasLocalization = content.includes('useLocalization') || 
                           content.includes('t(') || 
                           content.includes('i18n');

    // Check for hardcoded Norwegian text
    const norwegianWords = ['ja', 'nei', 'lagre', 'avbryt', 'lukk', 'åpne', 'navn', 'e-post'];
    const hasNorwegianText = norwegianWords.some(word => 
      content.toLowerCase().includes(word.toLowerCase())
    );

    if (hasNorwegianText && !hasLocalization) {
      warnings.push('Norwegian text found without localization support');
      suggestions.push('Use localization functions for all user-facing text');
    }

    // Check for date/time formatting
    if (content.includes('Date') || content.includes('time') || content.includes('format')) {
      const hasNorwegianFormatting = content.includes('nb-NO') || 
                                    content.includes('no-NO') || 
                                    content.includes('norwegian');
      
      if (!hasNorwegianFormatting) {
        warnings.push('Date/time formatting should support Norwegian locale');
        suggestions.push('Use Norwegian locale (nb-NO) for date and time formatting');
      }
    }

    // Check for accessibility in Norwegian context
    if (content.includes('ariaLabel') && hasNorwegianText) {
      warnings.push('Accessibility labels should be localized');
      suggestions.push('Use localization functions for ARIA labels and accessibility text');
    }

    return {
      passed: violations.length === 0,
      violations,
      warnings,
      suggestions,
    };
  }
}

export class ComplianceDocumentationRule implements ValidationRule {
  readonly name = 'compliance-documentation';
  readonly description = 'Ensures proper compliance documentation';
  readonly severity = 'warning' as const;
  readonly category = 'norwegian' as const;

  validate(content: string, filePath: string): ValidationResult {
    const violations: string[] = [];
    const suggestions: string[] = [];
    const warnings: string[] = [];

    // Check for proper file headers
    const hasFileHeader = content.includes('@fileoverview') || 
                         content.includes('@description') ||
                         content.includes('/**');

    if (!hasFileHeader) {
      warnings.push('Missing file documentation header');
      suggestions.push('Add JSDoc header with @fileoverview and @compliance information');
    }

    // Check for compliance annotations
    const complianceKeywords = [
      '@compliance', '@security', '@classification', '@audit',
      'WCAG', 'NSM', 'GDPR', 'CVA'
    ];

    const hasComplianceInfo = complianceKeywords.some(keyword => 
      content.includes(keyword)
    );

    if (!hasComplianceInfo && content.length > 1000) {
      warnings.push('Large template missing compliance documentation');
      suggestions.push('Add compliance annotations (@compliance WCAG AAA, NSM)');
    }

    // Check for version information
    const hasVersion = content.includes('@version') || 
                      content.includes('version:');

    if (!hasVersion) {
      warnings.push('Missing version information');
      suggestions.push('Add @version tag for template versioning');
    }

    return {
      passed: violations.length === 0,
      violations,
      warnings,
      suggestions,
    };
  }
}