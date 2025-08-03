/**
 * Component Generator Compliance Integration
 * Ensures all generated components comply with Xala v5 standards
 */

import { XalaValidator } from "./XalaValidator";
import type { 
  UIComplianceConfig, 
  UIFileReport, 
  UIViolation,
  UIFix,
  XalaV5ValidationResult 
} from "./interfaces/ui-compliance.interface";
import type { GenerationResult, ComponentGenerationOptions } from "../../generators/component-generator";
import { consola } from "consola";
import fs from "fs-extra";
import path from "node:path";

/**
 * Enhanced generation result with compliance data
 */
export interface ComplianceAwareGenerationResult extends GenerationResult {
  complianceReport?: UIFileReport[];
  complianceScore?: number;
  autoFixed?: boolean;
  xalaV5Report?: XalaV5ValidationResult;
}

/**
 * Component Generator Compliance Wrapper
 * Validates and auto-fixes generated components
 */
export class ComponentGeneratorCompliance {
  private validator: XalaValidator;
  private config: UIComplianceConfig;

  constructor(config?: Partial<UIComplianceConfig>) {
    this.config = {
      enforceDesignTokens: true,
      enforceSemanticComponents: true,
      enforceEnhanced8ptGrid: true,
      enforceWCAGCompliance: true,
      wcagLevel: "AAA",
      enforceRTLSupport: true,
      enforceLocalization: true,
      supportedLanguages: ["en", "nb", "fr", "ar"],
      allowRawHTML: false,
      allowInlineStyles: false,
      allowArbitraryValues: false,
      allowHardcodedText: false,
      allowHardcodedColors: false,
      allowHardcodedSpacing: false,
      tokenPrefix: "token",
      enforceCodeSplitting: true,
      maxComponentSize: 200,
      reportingLevel: "detailed",
      outputFormat: "json",
      ...config
    };
    
    this.validator = new XalaValidator(this.config);
  }

  /**
   * Validate generated component code
   */
  async validateGeneratedComponent(
    filePath: string,
    content: string
  ): Promise<UIFileReport> {
    return await this.validator.validateFile(filePath, content, this.config);
  }

  /**
   * Validate all generated files
   */
  async validateGeneratedFiles(
    files: Array<{ path: string; content?: string }>
  ): Promise<UIFileReport[]> {
    const reports: UIFileReport[] = [];
    
    for (const file of files) {
      try {
        // Read file content if not provided
        const content = file.content || await fs.readFile(file.path, 'utf-8');
        
        // Only validate TypeScript/JavaScript files
        if (file.path.match(/\.(tsx?|jsx?)$/)) {
          const report = await this.validateGeneratedComponent(file.path, content);
          reports.push(report);
        }
      } catch (error) {
        consola.error(`Failed to validate ${file.path}:`, error);
      }
    }
    
    return reports;
  }

  /**
   * Auto-fix violations in generated code
   */
  async autoFixViolations(
    filePath: string,
    content: string,
    fixes: UIFix[]
  ): Promise<string> {
    return this.validator.applyFixes(filePath, content, fixes);
  }

  /**
   * Enhance component generation with compliance
   */
  async enhanceComponentGeneration(
    generateFn: (options: ComponentGenerationOptions) => Promise<GenerationResult>,
    options: ComponentGenerationOptions
  ): Promise<ComplianceAwareGenerationResult> {
    // Generate the component
    const result = await generateFn(options);
    
    if (!result.success) {
      return result;
    }
    
    // Validate generated files
    const fileContents = await Promise.all(
      result.files.map(async (filePath) => ({
        path: filePath,
        content: await fs.readFile(filePath, 'utf-8')
      }))
    );
    
    const complianceReports = await this.validateGeneratedFiles(fileContents);
    
    // Calculate compliance score
    const totalScore = complianceReports.reduce((sum, report) => sum + report.score, 0);
    const avgScore = complianceReports.length > 0 ? totalScore / complianceReports.length : 100;
    
    // Check for critical violations
    const criticalViolations = complianceReports.flatMap(report => 
      report.violations.filter(v => v.severity === "error")
    );
    
    // Auto-fix if enabled
    let autoFixed = false;
    if (criticalViolations.length > 0 && this.config.reportingLevel === "detailed") {
      consola.info("Attempting to auto-fix violations...");
      
      for (const report of complianceReports) {
        if (report.fixes && report.fixes.length > 0) {
          const fileContent = fileContents.find(f => f.path === report.filePath)?.content;
          if (fileContent) {
            const fixedContent = await this.autoFixViolations(
              report.filePath,
              fileContent,
              report.fixes
            );
            await fs.writeFile(report.filePath, fixedContent);
            autoFixed = true;
          }
        }
      }
      
      // Re-validate after fixes
      if (autoFixed) {
        const revalidatedReports = await this.validateGeneratedFiles(
          result.files.map(path => ({ path }))
        );
        return {
          ...result,
          complianceReport: revalidatedReports,
          complianceScore: avgScore,
          autoFixed: true
        };
      }
    }
    
    // Get Xala v5 specific validation for the main component file
    let xalaV5Report: XalaV5ValidationResult | undefined;
    const mainComponentFile = result.files.find(f => f.endsWith('.tsx') && !f.includes('.test.') && !f.includes('.stories.'));
    if (mainComponentFile) {
      const content = await fs.readFile(mainComponentFile, 'utf-8');
      xalaV5Report = await this.validator.validateXalaV5Compliance(mainComponentFile, content, this.config);
    }
    
    return {
      ...result,
      complianceReport: complianceReports,
      complianceScore: avgScore,
      autoFixed,
      xalaV5Report
    };
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(reports: UIFileReport[]): string {
    const totalViolations = reports.reduce((sum, r) => sum + r.violations.length, 0);
    const errorCount = reports.flatMap(r => r.violations).filter(v => v.severity === "error").length;
    const warningCount = reports.flatMap(r => r.violations).filter(v => v.severity === "warning").length;
    const infoCount = reports.flatMap(r => r.violations).filter(v => v.severity === "info").length;
    
    let report = "# Component Generation Compliance Report\n\n";
    report += `## Summary\n\n`;
    report += `- Total files checked: ${reports.length}\n`;
    report += `- Total violations: ${totalViolations}\n`;
    report += `- Errors: ${errorCount}\n`;
    report += `- Warnings: ${warningCount}\n`;
    report += `- Info: ${infoCount}\n`;
    report += `- Average compliance score: ${reports.reduce((sum, r) => sum + r.score, 0) / reports.length}%\n\n`;
    
    if (totalViolations === 0) {
      report += "✅ All generated components are fully compliant with Xala v5 standards!\n\n";
      return report;
    }
    
    report += "## Violations by File\n\n";
    
    for (const fileReport of reports) {
      if (fileReport.violations.length === 0) continue;
      
      report += `### ${path.basename(fileReport.filePath)}\n\n`;
      report += `Score: ${fileReport.score}%\n\n`;
      
      // Group violations by severity
      const errors = fileReport.violations.filter(v => v.severity === "error");
      const warnings = fileReport.violations.filter(v => v.severity === "warning");
      const infos = fileReport.violations.filter(v => v.severity === "info");
      
      if (errors.length > 0) {
        report += "#### Errors\n\n";
        for (const violation of errors) {
          report += `- **Line ${violation.line}**: ${violation.message}\n`;
          if (violation.suggestion) {
            report += `  - Suggestion: ${violation.suggestion}\n`;
          }
        }
        report += "\n";
      }
      
      if (warnings.length > 0) {
        report += "#### Warnings\n\n";
        for (const violation of warnings) {
          report += `- **Line ${violation.line}**: ${violation.message}\n`;
          if (violation.suggestion) {
            report += `  - Suggestion: ${violation.suggestion}\n`;
          }
        }
        report += "\n";
      }
      
      if (infos.length > 0) {
        report += "#### Info\n\n";
        for (const violation of infos) {
          report += `- **Line ${violation.line}**: ${violation.message}\n`;
        }
        report += "\n";
      }
    }
    
    report += "## Recommendations\n\n";
    report += "1. Fix all errors before proceeding\n";
    report += "2. Address warnings to improve code quality\n";
    report += "3. Consider info messages for best practices\n";
    report += "4. Run the validator again after making changes\n";
    
    return report;
  }

  /**
   * Validate component template before generation
   */
  async validateTemplate(templateContent: string): Promise<{
    valid: boolean;
    violations: UIViolation[];
    suggestions: string[];
  }> {
    // Create a temporary file path for validation
    const tempPath = "template.tsx";
    const report = await this.validator.validateFile(tempPath, templateContent, this.config);
    
    const suggestions: string[] = [];
    
    // Analyze violations and provide template-specific suggestions
    for (const violation of report.violations) {
      if (violation.message.includes("Raw HTML element")) {
        suggestions.push("Replace all HTML elements with Xala UI System components");
      }
      if (violation.message.includes("Hardcoded text")) {
        suggestions.push("Use translation functions (t()) for all user-facing text");
      }
      if (violation.message.includes("Hardcoded color")) {
        suggestions.push("Use design tokens for all colors (colors.primary[500])");
      }
      if (violation.message.includes("spacing")) {
        suggestions.push("Use spacing tokens from the 8pt grid system");
      }
    }
    
    return {
      valid: report.compliant,
      violations: report.violations,
      suggestions: [...new Set(suggestions)] // Remove duplicates
    };
  }

  /**
   * Get compliance rules for component type
   */
  getComponentTypeRules(componentType: string): string[] {
    const rules: string[] = [
      "Use only @xala-technologies/ui-system components",
      "No raw HTML elements allowed",
      "All text must use t() translation function",
      "All colors must use design tokens",
      "All spacing must follow 8pt grid",
      "Include proper ARIA labels",
      "Support RTL languages"
    ];
    
    switch (componentType) {
      case "form":
        rules.push(
          "Use Form, FormField, FormLabel components",
          "Include proper form validation",
          "Add error messages with translations",
          "Ensure keyboard navigation works",
          "Include submit and cancel actions"
        );
        break;
        
      case "layout":
        rules.push(
          "Use Container, Stack, Grid for layout",
          "Include proper landmark roles",
          "Ensure responsive design",
          "Support both LTR and RTL layouts"
        );
        break;
        
      case "display":
        rules.push(
          "Use Card for content containers",
          "Use Typography components for text",
          "Include proper heading hierarchy",
          "Ensure color contrast compliance"
        );
        break;
    }
    
    return rules;
  }

  /**
   * Create compliant component template
   */
  createCompliantTemplate(componentType: string, componentName: string): string {
    const templates: Record<string, string> = {
      display: `import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, Stack, Typography, Text } from '@xala-technologies/ui-system';

interface ${componentName}Props {
  readonly title?: string;
}

export const ${componentName} = ({ title }: ${componentName}Props): JSX.Element => {
  const t = useTranslations('${componentName}');
  
  return (
    <Card variant="elevated" spacing="6" role="region" aria-label={t('ariaLabel')}>
      <Stack direction="vertical" spacing="4">
        <Typography variant="heading" level={2}>
          {title || t('defaultTitle')}
        </Typography>
        <Text variant="body" color="secondary">
          {t('description')}
        </Text>
      </Stack>
    </Card>
  );
};`,

      form: `import React from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { Card, Stack, Typography, Form, FormField, FormLabel, Input, Button } from '@xala-technologies/ui-system';

interface ${componentName}Props {
  readonly onSubmit?: (data: any) => void;
}

export const ${componentName} = ({ onSubmit }: ${componentName}Props): JSX.Element => {
  const t = useTranslations('${componentName}');
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  return (
    <Card variant="elevated" spacing="6" role="form" aria-label={t('formAriaLabel')}>
      <Form onSubmit={handleSubmit(onSubmit || (() => {}))}>
        <Stack direction="vertical" spacing="6">
          <Typography variant="heading" level={2}>
            {t('title')}
          </Typography>
          
          <FormField>
            <FormLabel htmlFor="field1" required>
              {t('field1Label')}
            </FormLabel>
            <Input
              id="field1"
              {...register('field1', { required: t('field1Required') })}
              error={errors.field1?.message}
              aria-describedby="field1-error"
            />
          </FormField>
          
          <Stack direction="horizontal" spacing="4" justify="end">
            <Button variant="secondary" type="button">
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {t('submit')}
            </Button>
          </Stack>
        </Stack>
      </Form>
    </Card>
  );
};`,

      layout: `import React from 'react';
import { useTranslations } from 'next-intl';
import { Container, Stack, Header, Navigation, Footer, Text } from '@xala-technologies/ui-system';

interface ${componentName}Props {
  readonly children: React.ReactNode;
}

export const ${componentName} = ({ children }: ${componentName}Props): JSX.Element => {
  const t = useTranslations('${componentName}');
  
  return (
    <Container variant="full">
      <Stack direction="vertical" spacing="0" minHeight="screen">
        <Header variant="primary" sticky role="banner" aria-label={t('headerAriaLabel')}>
          <Navigation
            items={[
              { label: t('nav.home'), href: '/' },
              { label: t('nav.about'), href: '/about' }
            ]}
            aria-label={t('navAriaLabel')}
          />
        </Header>
        
        <Container variant="content" spacing="8" role="main" aria-label={t('mainAriaLabel')}>
          {children}
        </Container>
        
        <Footer variant="primary" role="contentinfo" aria-label={t('footerAriaLabel')}>
          <Text variant="caption" color="secondary">
            {t('footer.copyright')}
          </Text>
        </Footer>
      </Stack>
    </Container>
  );
};`
    };
    
    return templates[componentType] || templates.display;
  }
}