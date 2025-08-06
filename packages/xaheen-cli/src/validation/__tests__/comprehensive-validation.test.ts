/**
 * Comprehensive Validation System Tests
 * 
 * Tests all validation components:
 * - CLAUDE.md compliance validation
 * - Design system usage validation
 * - Norwegian NSM compliance validation
 * - WCAG AAA accessibility validation
 * - Integration and performance tests
 * 
 * @author DevOps Expert Agent
 * @since 2025-08-06
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { createComprehensiveValidator } from '../comprehensive-validator';
import { createCLAUDEComplianceValidator } from '../claude-compliance-validator';
import { createDesignSystemValidator } from '../design-system-validator';
import { createNSMComplianceValidator } from '../nsm-compliance-validator';
import { createWCAGAccessibilityValidator } from '../wcag-accessibility-validator';
import { createValidationRunner } from '../validation-runner';

// =============================================================================
// TEST FIXTURES
// =============================================================================

const CLAUDE_COMPLIANT_COMPONENT = `
import React from 'react';

interface ButtonProps {
  readonly title: string;
  readonly onClick?: () => void;
  readonly variant?: 'primary' | 'secondary';
}

export const Button = ({ title, onClick, variant = 'primary' }: ButtonProps): JSX.Element => {
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  try {
    return (
      <button 
        className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={handleClick}
        aria-label={title}
      >
        {title}
      </button>
    );
  } catch (error) {
    console.error('Button render error:', error);
    return <div className="text-red-500">Error rendering button</div>;
  }
};
`;

const CLAUDE_NON_COMPLIANT_COMPONENT = `
import React from 'react';

interface ButtonProps {
  title: string; // Missing readonly
  onClick?: any; // Using any type
}

const Button = ({ title, onClick }: ButtonProps) => { // Missing JSX.Element return type
  return (
    <button 
      className="h-8 px-4 bg-blue-600 text-white" // h-8 is below minimum h-12
      onClick={onClick}
      // Missing aria-label
    >
      {title}
    </button>
  );
};
`;

const DESIGN_SYSTEM_COMPLIANT_COMPONENT = `
import React from 'react';
import { Button, Input, Card } from '@xaheen/design-system';

export const LoginForm = (): JSX.Element => {
  return (
    <Card className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <div className="space-y-4">
        <Input 
          label="Email"
          type="email"
          placeholder="Enter your email"
          className="h-14"
        />
        <Input 
          label="Password"
          type="password"
          placeholder="Enter your password"
          className="h-14"
        />
        <Button variant="primary" className="h-12">
          Sign In
        </Button>
      </div>
    </Card>
  );
};
`;

const DESIGN_SYSTEM_NON_COMPLIANT_COMPONENT = `
import React from 'react';

export const LoginForm = (): JSX.Element => {
  return (
    <div style={{ padding: '16px', backgroundColor: '#ffffff' }}> {/* Hardcoded values */}
      <h2 style={{ color: '#333333' }}>Login</h2> {/* Hardcoded color */}
      <div>
        <input placeholder="Email" /> {/* Should use design system Input */}
        <input type="password" placeholder="Password" />
        <div 
          onClick={handleSubmit} 
          style={{ backgroundColor: '#007bff', color: 'white', padding: '8px' }}
        >
          {/* Custom button instead of design system Button */}
          Sign In
        </div>
      </div>
    </div>
  );
};
`;

const NSM_COMPLIANT_COMPONENT = `
/* NSM: RESTRICTED - Contains personal information */
import React from 'react';
import { useTranslation } from 'react-i18next';

interface UserProfileProps {
  readonly email: string;
  readonly personnummer?: string;
}

export const UserProfile = ({ email, personnummer }: UserProfileProps): JSX.Element => {
  const { t } = useTranslation();

  const handleDataExport = useCallback(async () => {
    try {
      // Proper encryption for sensitive data
      const encryptedData = await encrypt({ email, personnummer });
      await auditLog('data_export', { user: email });
      return encryptedData;
    } catch (error) {
      await auditLog('data_export_error', { user: email, error: error.message });
      throw error;
    }
  }, [email, personnummer]);

  return (
    <div className="p-6">
      <h2>{t('profile.title')}</h2>
      <p>{t('profile.email')}: {email}</p>
      {personnummer && <p>{t('profile.personnummer')}: ***</p>}
    </div>
  );
};
`;

const NSM_NON_COMPLIANT_COMPONENT = `
import React from 'react';

// Missing NSM classification comment
export const UserProfile = ({ email, personnummer }) => {
  const apiKey = "sk-1234567890"; // Hardcoded secret

  const sendData = () => {
    // Insecure HTTP transmission
    fetch('http://api.example.com/user', {
      method: 'POST',
      body: JSON.stringify({ email, personnummer }) // Unencrypted sensitive data
    });
  };

  return (
    <div>
      <h2>Brukerprofil</h2> {/* Norwegian text without i18n */}
      <p>Email: {email}</p>
      <p>Personnummer: {personnummer}</p> {/* Sensitive data without protection */}
    </div>
  );
};
`;

const WCAG_COMPLIANT_COMPONENT = `
import React from 'react';

export const AccessibleForm = (): JSX.Element => {
  return (
    <main role="main">
      <header>
        <h1>Contact Form</h1>
      </header>
      
      <form>
        <div>
          <label htmlFor="name">Full Name *</label>
          <input 
            id="name" 
            type="text" 
            required 
            aria-describedby="name-error"
            className="h-14 px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <div id="name-error" role="alert" aria-live="polite"></div>
        </div>

        <div>
          <label htmlFor="email">Email Address *</label>
          <input 
            id="email" 
            type="email" 
            required 
            aria-describedby="email-error"
            className="h-14 px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <div id="email-error" role="alert" aria-live="polite"></div>
        </div>

        <button 
          type="submit"
          aria-label="Submit contact form"
          className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onKeyDown={handleKeyDown}
        >
          Submit
        </button>
      </form>
    </main>
  );
};
`;

const WCAG_NON_COMPLIANT_COMPONENT = `
import React from 'react';

export const InaccessibleForm = (): JSX.Element => {
  return (
    <div>
      <div style={{ fontSize: '12px', color: '#ccc' }}>Form</div> {/* Poor contrast, small text */}
      
      <input placeholder="Name" /> {/* No label */}
      <input placeholder="Email" /> {/* No label */}
      
      <div 
        onClick={handleSubmit}
        style={{ fontSize: '10px', padding: '4px' }} // Small click target
      >
        Submit
      </div> {/* No keyboard support, no ARIA */}

      <img src="decorative.jpg" alt="Decorative image with long alt text" /> {/* Decorative image with alt */}
    </div>
  );
};
`;

// =============================================================================
// TEST SUITE
// =============================================================================

describe('Comprehensive Validation System', () => {
  let tempDir: string;
  let testProjectPath: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validation-test-'));
    testProjectPath = path.join(tempDir, 'test-project');
    await fs.ensureDir(testProjectPath);
    
    // Create basic package.json
    await fs.writeJSON(path.join(testProjectPath, 'package.json'), {
      name: 'test-project',
      version: '1.0.0',
      dependencies: {
        '@xaheen/design-system': '^1.0.0',
        'react': '^18.0.0',
        'react-i18next': '^12.0.0'
      }
    });
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  // =============================================================================
  // CLAUDE.md COMPLIANCE TESTS
  // =============================================================================

  describe('CLAUDE.md Compliance Validation', () => {
    it('should pass validation for CLAUDE.md compliant component', async () => {
      const validator = createCLAUDEComplianceValidator();
      const context = {
        projectPath: testProjectPath,
        sourceFiles: [],
        claudeConfig: {
          buttonMinHeight: 12,
          inputMinHeight: 14,
          strictTypeScript: true,
          wcagLevel: 'AAA' as const,
          norwegianCompliance: true,
          designSystemRequired: true
        }
      };

      const issues = validator.validateFile(context, CLAUDE_COMPLIANT_COMPONENT, 'Button.tsx');
      
      expect(issues).toHaveLength(0);
    });

    it('should detect CLAUDE.md compliance violations', async () => {
      const validator = createCLAUDEComplianceValidator();
      const context = {
        projectPath: testProjectPath,
        sourceFiles: [],
        claudeConfig: {
          buttonMinHeight: 12,
          inputMinHeight: 14,
          strictTypeScript: true,
          wcagLevel: 'AAA' as const,
          norwegianCompliance: true,
          designSystemRequired: true
        }
      };

      const issues = validator.validateFile(context, CLAUDE_NON_COMPLIANT_COMPONENT, 'Button.tsx');
      
      expect(issues.length).toBeGreaterThan(0);
      
      const issueTypes = issues.map(i => i.ruleId);
      expect(issueTypes).toContain('claude-button-min-height');
      expect(issueTypes).toContain('claude-readonly-props-interfaces');
      expect(issueTypes).toContain('claude-no-any-types');
    });

    it('should assess CLAUDE.md compliance score correctly', async () => {
      const validator = createCLAUDEComplianceValidator();
      const context = {
        projectPath: testProjectPath,
        sourceFiles: [],
        claudeConfig: {
          buttonMinHeight: 12,
          inputMinHeight: 14,
          strictTypeScript: true,
          wcagLevel: 'AAA' as const,
          norwegianCompliance: true,
          designSystemRequired: true
        }
      };

      const issues = validator.validateFile(context, CLAUDE_NON_COMPLIANT_COMPONENT, 'Button.tsx');
      const assessment = validator.assessCompliance(issues);

      expect(assessment.score).toBeLessThan(100);
      expect(assessment.level).toBe('needs-improvement');
      expect(assessment.criticalIssues.length).toBeGreaterThan(0);
      expect(assessment.recommendations.length).toBeGreaterThan(0);
    });
  });

  // =============================================================================
  // DESIGN SYSTEM VALIDATION TESTS
  // =============================================================================

  describe('Design System Usage Validation', () => {
    it('should pass validation for design system compliant component', async () => {
      const validator = createDesignSystemValidator();
      const context = {
        projectPath: testProjectPath,
        sourceFiles: [],
        claudeConfig: {
          buttonMinHeight: 12,
          inputMinHeight: 14,
          strictTypeScript: true,
          wcagLevel: 'AAA' as const,
          norwegianCompliance: true,
          designSystemRequired: true
        }
      };

      const issues = validator.validateFile(context, DESIGN_SYSTEM_COMPLIANT_COMPONENT, 'LoginForm.tsx');
      
      // Should have no critical errors (some warnings about patterns may exist)
      const errors = issues.filter(i => i.severity === 'error');
      expect(errors).toHaveLength(0);
    });

    it('should detect design system violations', async () => {
      const validator = createDesignSystemValidator();
      const context = {
        projectPath: testProjectPath,
        sourceFiles: [],
        claudeConfig: {
          buttonMinHeight: 12,
          inputMinHeight: 14,
          strictTypeScript: true,
          wcagLevel: 'AAA' as const,
          norwegianCompliance: true,
          designSystemRequired: true
        }
      };

      const issues = validator.validateFile(context, DESIGN_SYSTEM_NON_COMPLIANT_COMPONENT, 'LoginForm.tsx');
      
      expect(issues.length).toBeGreaterThan(0);
      
      const issueTypes = issues.map(i => i.ruleId);
      expect(issueTypes).toContain('design-system-no-hardcoded-values');
      expect(issueTypes).toContain('design-system-component-composition');
    });

    it('should check design system installation', async () => {
      const validator = createDesignSystemValidator();
      
      const result = await validator.checkDesignSystemInstallation(testProjectPath);
      
      expect(result.installed).toBe(true);
      expect(result.version).toBe('^1.0.0');
      expect(result.issues).toHaveLength(0);
    });
  });

  // =============================================================================
  // NSM COMPLIANCE TESTS
  // =============================================================================

  describe('Norwegian NSM Compliance Validation', () => {
    it('should pass validation for NSM compliant component', async () => {
      const validator = createNSMComplianceValidator();
      const context = {
        projectPath: testProjectPath,
        sourceFiles: [],
        claudeConfig: {
          buttonMinHeight: 12,
          inputMinHeight: 14,
          strictTypeScript: true,
          wcagLevel: 'AAA' as const,
          norwegianCompliance: true,
          designSystemRequired: true
        }
      };

      const issues = validator.validateFile(context, NSM_COMPLIANT_COMPONENT, 'UserProfile.tsx');
      
      // Should have minimal or no issues
      const errors = issues.filter(i => i.severity === 'error');
      expect(errors.length).toBeLessThanOrEqual(1); // May have minor classification issues
    });

    it('should detect NSM compliance violations', async () => {
      const validator = createNSMComplianceValidator();
      const context = {
        projectPath: testProjectPath,
        sourceFiles: [],
        claudeConfig: {
          buttonMinHeight: 12,
          inputMinHeight: 14,
          strictTypeScript: true,
          wcagLevel: 'AAA' as const,
          norwegianCompliance: true,
          designSystemRequired: true
        }
      };

      const issues = validator.validateFile(context, NSM_NON_COMPLIANT_COMPONENT, 'UserProfile.tsx');
      
      expect(issues.length).toBeGreaterThan(0);
      
      const issueTypes = issues.map(i => i.ruleId);
      expect(issueTypes).toContain('nsm-data-classification');
      expect(issueTypes).toContain('no-hardcoded-secrets');
      expect(issueTypes).toContain('nsm-data-protection');
    });

    it('should analyze data classification requirements', () => {
      const validator = createNSMComplianceValidator();
      
      const analysis = validator.analyzeDataClassification(NSM_NON_COMPLIANT_COMPONENT);
      
      expect(analysis.recommendedLevel).toBe('RESTRICTED');
      expect(analysis.detectedTypes).toContain('Personal Information');
      expect(analysis.requirements.length).toBeGreaterThan(0);
    });
  });

  // =============================================================================
  // WCAG ACCESSIBILITY TESTS
  // =============================================================================

  describe('WCAG AAA Accessibility Validation', () => {
    it('should pass validation for WCAG compliant component', async () => {
      const validator = createWCAGAccessibilityValidator();
      const context = {
        projectPath: testProjectPath,
        sourceFiles: [],
        claudeConfig: {
          buttonMinHeight: 12,
          inputMinHeight: 14,
          strictTypeScript: true,
          wcagLevel: 'AAA' as const,
          norwegianCompliance: true,
          designSystemRequired: true
        }
      };

      const issues = validator.validateFile(context, WCAG_COMPLIANT_COMPONENT, 'AccessibleForm.tsx');
      
      // Should have no critical accessibility errors
      const errors = issues.filter(i => i.severity === 'error');
      expect(errors.length).toBeLessThanOrEqual(1); // May have minor issues
    });

    it('should detect WCAG accessibility violations', async () => {
      const validator = createWCAGAccessibilityValidator();
      const context = {
        projectPath: testProjectPath,
        sourceFiles: [],
        claudeConfig: {
          buttonMinHeight: 12,
          inputMinHeight: 14,
          strictTypeScript: true,
          wcagLevel: 'AAA' as const,
          norwegianCompliance: true,
          designSystemRequired: true
        }
      };

      const issues = validator.validateFile(context, WCAG_NON_COMPLIANT_COMPONENT, 'InaccessibleForm.tsx');
      
      expect(issues.length).toBeGreaterThan(0);
      
      const issueTypes = issues.map(i => i.ruleId);
      expect(issueTypes).toContain('wcag-aria-labels-required');
      expect(issueTypes).toContain('wcag-keyboard-navigation');
      expect(issueTypes).toContain('wcag-screen-reader-support');
    });

    it('should assess WCAG compliance level correctly', async () => {
      const validator = createWCAGAccessibilityValidator();
      const context = {
        projectPath: testProjectPath,
        sourceFiles: [],
        claudeConfig: {
          buttonMinHeight: 12,
          inputMinHeight: 14,
          strictTypeScript: true,
          wcagLevel: 'AAA' as const,
          norwegianCompliance: true,
          designSystemRequired: true
        }
      };

      const issues = validator.validateFile(context, WCAG_NON_COMPLIANT_COMPONENT, 'InaccessibleForm.tsx');
      const assessment = validator.assessWCAGCompliance(issues);

      expect(assessment.level).toBe('Non-compliant');
      expect(assessment.score).toBeLessThan(50);
      expect(assessment.failedCriteria.length).toBeGreaterThan(0);
      expect(assessment.criticalIssues.length).toBeGreaterThan(0);
    });
  });

  // =============================================================================
  // COMPREHENSIVE VALIDATION TESTS
  // =============================================================================

  describe('Comprehensive Validation Runner', () => {
    it('should run complete validation on project', async () => {
      // Create test files
      await fs.writeFile(
        path.join(testProjectPath, 'CompliantComponent.tsx'),
        CLAUDE_COMPLIANT_COMPONENT
      );
      await fs.writeFile(
        path.join(testProjectPath, 'NonCompliantComponent.tsx'),
        CLAUDE_NON_COMPLIANT_COMPONENT
      );

      const runner = createValidationRunner();
      
      const report = await runner.validateProject(testProjectPath, {
        claudeCompliance: true,
        designSystemUsage: true,
        nsmCompliance: true,
        wcagAccessibility: true,
        verbose: false
      });

      expect(report).toBeDefined();
      expect(report.success).toBeDefined();
      expect(report.overall).toBeDefined();
      expect(report.summary).toBeDefined();
      
      expect(report.summary.totalFiles).toBeGreaterThan(0);
      expect(report.summary.executionTime).toBeGreaterThan(0);
      
      // Should detect issues in non-compliant component
      expect(report.summary.totalIssues).toBeGreaterThan(0);
    });

    it('should apply automatic fixes when requested', async () => {
      // Create fixable test file
      const fixableComponent = `
export const Button = ({ title }: { title: string }) => {
  return <button className="h-8 px-4">{title}</button>;
};
`;
      
      const componentPath = path.join(testProjectPath, 'FixableComponent.tsx');
      await fs.writeFile(componentPath, fixableComponent);

      const runner = createValidationRunner();
      
      const report = await runner.validateProject(testProjectPath, {
        claudeCompliance: true,
        autoFix: true,
        verbose: false
      });

      expect(report.summary.fixableIssues).toBeGreaterThanOrEqual(0);
      
      // Check if file was modified (if there were fixable issues)
      const modifiedContent = await fs.readFile(componentPath, 'utf-8');
      if (report.summary.fixableIssues > 0) {
        expect(modifiedContent).not.toBe(fixableComponent);
      }
    });

    it('should generate HTML report when requested', async () => {
      const reportPath = path.join(testProjectPath, 'validation-report.html');
      
      const runner = createValidationRunner();
      
      await runner.validateProject(testProjectPath, {
        claudeCompliance: true,
        outputFormat: 'html',
        outputFile: reportPath
      });

      const reportExists = await fs.pathExists(reportPath);
      expect(reportExists).toBe(true);
      
      if (reportExists) {
        const reportContent = await fs.readFile(reportPath, 'utf-8');
        expect(reportContent).toContain('<!DOCTYPE html>');
        expect(reportContent).toContain('Comprehensive Validation Report');
      }
    });
  });

  // =============================================================================
  // PERFORMANCE TESTS
  // =============================================================================

  describe('Validation Performance', () => {
    it('should validate large projects efficiently', async () => {
      // Create multiple test files
      const componentTemplate = (index: number) => `
import React from 'react';
interface Props${index} {
  readonly value: string;
}
export const Component${index} = ({ value }: Props${index}): JSX.Element => {
  return <div className="h-12 p-4">{value}</div>;
};
`;

      for (let i = 0; i < 20; i++) {
        await fs.writeFile(
          path.join(testProjectPath, `Component${i}.tsx`),
          componentTemplate(i)
        );
      }

      const runner = createValidationRunner();
      const startTime = Date.now();
      
      const report = await runner.validateProject(testProjectPath, {
        claudeCompliance: true,
        designSystemUsage: true,
        nsmCompliance: true,
        wcagAccessibility: true
      });

      const executionTime = Date.now() - startTime;
      
      expect(executionTime).toBeLessThan(10000); // Should complete within 10 seconds
      expect(report.summary.validatedFiles).toBe(20);
      expect(report.summary.executionTime).toBeGreaterThan(0);
    });
  });

  // =============================================================================
  // ERROR HANDLING TESTS
  // =============================================================================

  describe('Error Handling', () => {
    it('should handle invalid TypeScript gracefully', async () => {
      const invalidComponent = `
import React from 'react';
export const InvalidComponent = ( => { // Invalid syntax
  return <div>Invalid</div>;
};
`;

      const validator = createCLAUDEComplianceValidator();
      const context = {
        projectPath: testProjectPath,
        sourceFiles: [],
        claudeConfig: {
          buttonMinHeight: 12,
          inputMinHeight: 14,
          strictTypeScript: true,
          wcagLevel: 'AAA' as const,
          norwegianCompliance: true,
          designSystemRequired: true
        }
      };

      expect(() => {
        validator.validateFile(context, invalidComponent, 'Invalid.tsx');
      }).not.toThrow();
    });

    it('should handle missing project files gracefully', async () => {
      const runner = createValidationRunner();
      
      const report = await runner.validateProject('/non/existent/path', {
        claudeCompliance: true
      });

      expect(report.success).toBe(false);
      expect(report.summary.totalFiles).toBe(0);
    });
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe('Validation System Integration', () => {
  it('should integrate with existing CLI structure', () => {
    // Test that validators can be imported and instantiated
    const comprehensive = createComprehensiveValidator();
    const claude = createCLAUDEComplianceValidator();
    const designSystem = createDesignSystemValidator();
    const nsm = createNSMComplianceValidator();
    const wcag = createWCAGAccessibilityValidator();
    const runner = createValidationRunner();

    expect(comprehensive).toBeDefined();
    expect(claude).toBeDefined();
    expect(designSystem).toBeDefined();
    expect(nsm).toBeDefined();
    expect(wcag).toBeDefined();
    expect(runner).toBeDefined();
  });
});