/**
 * WCAG (Web Content Accessibility Guidelines) Compliance Validation Module
 * 
 * Validates that generated projects comply with WCAG 2.1 AA/AAA standards:
 * - Level A: Basic accessibility (perceivable, operable, understandable, robust)
 * - Level AA: Standard compliance (color contrast, keyboard navigation, screen readers)
 * - Level AAA: Enhanced accessibility (advanced contrast, comprehensive support)
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { consola } from 'consola';
import type { 
  ValidationResult, 
  WCAGComplianceRules,
  WCAGRule 
} from '../types.js';

export class WCAGComplianceValidator {
  private static readonly WCAG_COMPLIANCE_RULES: WCAGComplianceRules = {
    levelA: [
      {
        guideline: '1.1 Text Alternatives',
        criterion: '1.1.1 Non-text Content',
        pattern: /alt=["'][^"']+["']|aria-label=["'][^"']+["']/,
        antiPattern: /<img(?![^>]*alt=)/,
        severity: 'error',
        message: 'All images must have alternative text (alt attribute or aria-label)',
        techniques: ['H37', 'ARIA6', 'G94']
      },
      {
        guideline: '1.3 Adaptable',
        criterion: '1.3.1 Info and Relationships',
        pattern: /<(h[1-6]|label|th|caption|legend)/,
        severity: 'warning',
        message: 'Use semantic HTML elements to convey structure and relationships',
        techniques: ['H42', 'H44', 'H51']
      },
      {
        guideline: '1.4 Distinguishable',
        criterion: '1.4.1 Use of Color',
        pattern: /aria-label|title=|alt=/,
        antiPattern: /color:\s*red[^;]*;\s*$/m,
        severity: 'warning',
        message: 'Information should not be conveyed by color alone',
        techniques: ['G14', 'G205']
      },
      {
        guideline: '2.1 Keyboard Accessible',
        criterion: '2.1.1 Keyboard',
        pattern: /(onKeyDown|onKeyPress|tabIndex)/,
        severity: 'error',
        message: 'All interactive elements must be keyboard accessible',
        techniques: ['G202', 'H91']
      },
      {
        guideline: '4.1 Compatible',
        criterion: '4.1.2 Name, Role, Value',
        pattern: /role=["'][^"']+["']|aria-\w+=/,
        severity: 'warning',
        message: 'UI components should have proper roles and properties',
        techniques: ['H91', 'ARIA4']
      }
    ],
    levelAA: [
      {
        guideline: '1.4 Distinguishable',
        criterion: '1.4.3 Contrast (Minimum)',
        pattern: /text-gray-[89]00|text-black|text-white/,
        antiPattern: /text-gray-[1-4]00|text-yellow-[12]00/,
        severity: 'error',
        message: 'Text must have sufficient color contrast (4.5:1 for normal text, 3:1 for large text)',
        techniques: ['G18', 'G145']
      },
      {
        guideline: '2.4 Navigable',
        criterion: '2.4.1 Bypass Blocks',
        pattern: /(skip.*link|skip.*content|bypass.*navigation)/i,
        severity: 'warning',
        message: 'Provide mechanism to skip repetitive content',
        techniques: ['G1', 'G123', 'G124']
      },
      {
        guideline: '2.4 Navigable',
        criterion: '2.4.2 Page Titled',
        pattern: /<title>[^<]+<\/title>|document\.title\s*=/,
        severity: 'error',
        message: 'Pages must have descriptive titles',
        techniques: ['H25', 'G88']
      },
      {
        guideline: '2.4 Navigable',
        criterion: '2.4.3 Focus Order',
        pattern: /tabIndex=["'](-?\d+)["']/,
        antiPattern: /tabIndex=["'][2-9]\d*["']/,
        severity: 'error',
        message: 'Focus order must be logical and usable (avoid positive tabindex values)',
        techniques: ['G59', 'H4']
      },
      {
        guideline: '3.2 Predictable',
        criterion: '3.2.1 On Focus',
        pattern: /onFocus(?!.*submit|.*navigate)/,
        severity: 'warning',
        message: 'Focus should not trigger unexpected context changes',
        techniques: ['G107']
      },
      {
        guideline: '3.3 Input Assistance',
        criterion: '3.3.1 Error Identification',
        pattern: /(aria-invalid|error|validation)/i,
        severity: 'error',
        message: 'Form errors must be clearly identified and described',
        techniques: ['G83', 'G85', 'ARIA21']
      },
      {
        guideline: '3.3 Input Assistance',
        criterion: '3.3.2 Labels or Instructions',
        pattern: /<label\s+for=|aria-labelledby=|aria-label=/,
        antiPattern: /<input(?![^>]*aria-label)(?![^>]*(id=["'][^"']*["'][^>]*<label[^>]*for=["']\1["']))/,
        severity: 'error',
        message: 'Form controls must have associated labels',
        techniques: ['H44', 'H65', 'G131']
      }
    ],
    levelAAA: [
      {
        guideline: '1.4 Distinguishable',
        criterion: '1.4.6 Contrast (Enhanced)',
        pattern: /text-gray-900|text-black/,
        antiPattern: /text-gray-[1-6]00/,
        severity: 'warning',
        message: 'Enhanced contrast recommended (7:1 for normal text, 4.5:1 for large text)',
        techniques: ['G17', 'G18']
      },
      {
        guideline: '2.2 Enough Time',
        criterion: '2.2.3 No Timing',
        pattern: /setTimeout|setInterval/,
        antiPattern: /setTimeout.*(\d{1,3}|[1-9]\d{3})/,
        severity: 'warning',
        message: 'Avoid time limits or provide user control over timing',
        techniques: ['G5']
      },
      {
        guideline: '2.3 Seizures and Physical Reactions',
        criterion: '2.3.2 Three Flashes',
        pattern: /animation|transition|flash/i,
        severity: 'warning',
        message: 'Avoid content that flashes more than 3 times per second',
        techniques: ['G19']
      },
      {
        guideline: '2.4 Navigable',
        criterion: '2.4.8 Location',
        pattern: /(breadcrumb|navigation.*current|aria-current)/i,
        severity: 'warning',
        message: 'Provide information about user location within site',
        techniques: ['G65', 'G63']
      },
      {
        guideline: '3.1 Readable',
        criterion: '3.1.3 Unusual Words',
        pattern: /(glossary|definition|abbreviation|title=)/i,
        severity: 'warning',
        message: 'Provide definitions for unusual words and abbreviations',
        techniques: ['G55', 'G62', 'H28']
      },
      {
        guideline: '3.2 Predictable',
        criterion: '3.2.5 Change on Request',
        pattern: /onClick.*navigate|href=|router\./,
        antiPattern: /onMouseOver.*navigate|automatic.*redirect/i,
        severity: 'error',
        message: 'Context changes should only occur by user request',
        techniques: ['G80', 'G76']
      }
    ]
  };

  /**
   * Validate WCAG compliance for a project
   */
  async validateWCAGCompliance(projectPath: string): Promise<ValidationResult> {
    consola.debug(`Validating WCAG compliance: ${projectPath}`);
    
    const errors: string[] = [];
    const warnings: string[] = [];
    const startTime = Date.now();

    try {
      // Find all relevant files (HTML, JSX, Vue, Svelte components)
      const files = await this.findRelevantFiles(projectPath);
      
      if (files.length === 0) {
        warnings.push('No relevant files found for WCAG compliance validation');
        return { success: true, errors, warnings, duration: Date.now() - startTime };
      }

      // Validate each file against WCAG rules
      for (const file of files) {
        const fileValidation = await this.validateFile(file);
        errors.push(...fileValidation.errors);
        warnings.push(...fileValidation.warnings);
      }

      // Validate project-level accessibility features
      const projectValidation = await this.validateProjectLevel(projectPath);
      errors.push(...projectValidation.errors);
      warnings.push(...projectValidation.warnings);

      const success = errors.length === 0;
      consola.debug(`WCAG compliance validation completed: ${success ? 'PASSED' : 'FAILED'}`);

      return {
        success,
        errors,
        warnings,
        duration: Date.now() - startTime,
        details: {
          filesValidated: files.length,
          levelAChecks: WCAGComplianceValidator.WCAG_COMPLIANCE_RULES.levelA.length,
          levelAAChecks: WCAGComplianceValidator.WCAG_COMPLIANCE_RULES.levelAA.length,
          levelAAAChecks: WCAGComplianceValidator.WCAG_COMPLIANCE_RULES.levelAAA.length
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`WCAG compliance validation error: ${errorMessage}`);
      
      return {
        success: false,
        errors,
        warnings,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Find all relevant files for WCAG compliance validation
   */
  private async findRelevantFiles(projectPath: string): Promise<string[]> {
    const files: string[] = [];
    const extensions = ['.tsx', '.jsx', '.vue', '.svelte', '.html'];
    
    const searchDir = async (dirPath: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(dirPath, entry.name);
          
          if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
            await searchDir(fullPath);
          } else if (entry.isFile() && this.isRelevantFile(entry.name, extensions)) {
            files.push(fullPath);
          }
        }
      } catch {
        // Ignore errors reading directories
      }
    };

    // Search in src directory
    const srcDir = join(projectPath, 'src');
    try {
      await fs.access(srcDir);
      await searchDir(srcDir);
    } catch {
      // No src directory, search in public or root
      const publicDir = join(projectPath, 'public');
      try {
        await fs.access(publicDir);
        await searchDir(publicDir);
      } catch {
        // Search in root
        await searchDir(projectPath);
      }
    }

    return files;
  }

  /**
   * Check if directory should be skipped
   */
  private shouldSkipDirectory(dirName: string): boolean {
    const skipDirs = ['node_modules', '.git', '.next', 'dist', 'build', '.nuxt', '.svelte-kit', 'coverage'];
    return skipDirs.includes(dirName) || dirName.startsWith('.');
  }

  /**
   * Check if file is relevant for validation
   */
  private isRelevantFile(fileName: string, extensions: string[]): boolean {
    return extensions.some(ext => fileName.endsWith(ext));
  }

  /**
   * Validate a single file against WCAG rules
   */
  private async validateFile(filePath: string): Promise<{ errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fileName = filePath.split('/').pop() || '';

    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // Skip if file doesn't contain UI components
      if (!this.hasUIComponents(content)) {
        return { errors, warnings };
      }

      // Validate Level A compliance (basic accessibility)
      for (const rule of WCAGComplianceValidator.WCAG_COMPLIANCE_RULES.levelA) {
        const violation = this.checkWCAGRule(content, rule, fileName, 'A');
        if (violation) {
          if (rule.severity === 'error') {
            errors.push(violation);
          } else {
            warnings.push(violation);
          }
        }
      }

      // Validate Level AA compliance (standard compliance)
      for (const rule of WCAGComplianceValidator.WCAG_COMPLIANCE_RULES.levelAA) {
        const violation = this.checkWCAGRule(content, rule, fileName, 'AA');
        if (violation) {
          if (rule.severity === 'error') {
            errors.push(violation);
          } else {
            warnings.push(violation);
          }
        }
      }

      // Validate Level AAA compliance (enhanced accessibility)
      for (const rule of WCAGComplianceValidator.WCAG_COMPLIANCE_RULES.levelAAA) {
        const violation = this.checkWCAGRule(content, rule, fileName, 'AAA');
        if (violation) {
          if (rule.severity === 'error') {
            errors.push(violation);
          } else {
            warnings.push(violation);
          }
        }
      }

    } catch (error) {
      errors.push(`Failed to validate file ${fileName}: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { errors, warnings };
  }

  /**
   * Check if content has UI components that should be accessible
   */
  private hasUIComponents(content: string): boolean {
    return /<(button|input|select|textarea|img|a|nav|main|section|article|h[1-6]|form|label)/i.test(content);
  }

  /**
   * Check a specific WCAG rule against content
   */
  private checkWCAGRule(content: string, rule: WCAGRule, fileName: string, level: string): string | null {
    // Check anti-pattern first (if exists) - these are violations
    if (rule.antiPattern) {
      const antiMatch = rule.antiPattern.test(content);
      if (antiMatch) {
        return `${fileName}: WCAG ${level} violation - ${rule.message} (${rule.criterion})`;
      }
    }

    // Check for required pattern based on context
    const requiresPattern = this.shouldCheckForPattern(content, rule);
    if (requiresPattern) {
      const match = rule.pattern.test(content);
      if (!match) {
        return `${fileName}: WCAG ${level} issue - ${rule.message} (${rule.criterion})`;
      }
    }

    return null;
  }

  /**
   * Determine if content should be checked for a specific pattern
   */
  private shouldCheckForPattern(content: string, rule: WCAGRule): boolean {
    switch (rule.criterion) {
      case '1.1.1 Non-text Content':
        return /<img/i.test(content);
        
      case '2.1.1 Keyboard':
        return /<(button|input|select|textarea|a)/i.test(content);
        
      case '2.4.2 Page Titled':
        return /<html|<head|document\.title|useEffect.*title|Head.*title/i.test(content);
        
      case '2.4.3 Focus Order':
        return /tabIndex/i.test(content);
        
      case '3.3.1 Error Identification':
        return /<form|input.*required|validation/i.test(content);
        
      case '3.3.2 Labels or Instructions':
        return /<(input|select|textarea)/i.test(content);
        
      case '1.4.3 Contrast (Minimum)':
      case '1.4.6 Contrast (Enhanced)':
        return /text-|bg-/i.test(content);
        
      case '3.2.5 Change on Request':
        return /navigate|redirect|window\.location/i.test(content);
        
      default:
        return true; // Check all other rules by default
    }
  }

  /**
   * Validate project-level accessibility features
   */
  private async validateProjectLevel(projectPath: string): Promise<{ errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check for accessibility testing tools
      const packageJsonPath = join(projectPath, 'package.json');
      const packageJsonExists = await this.checkFileExists(packageJsonPath);
      
      if (packageJsonExists) {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        const accessibilityDeps = [
          '@axe-core/react',
          'jest-axe',
          '@testing-library/jest-dom',
          'eslint-plugin-jsx-a11y',
          'react-axe'
        ];

        const hasAccessibilityTooling = accessibilityDeps.some(dep =>
          packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
        );

        if (!hasAccessibilityTooling) {
          warnings.push('Consider adding accessibility testing tools (e.g., @axe-core/react, eslint-plugin-jsx-a11y)');
        }
      }

      // Check for accessibility configuration files
      const accessibilityConfigs = [
        '.axerc.json',
        'a11y.config.js',
        'accessibility.config.js'
      ];

      let hasAccessibilityConfig = false;
      for (const configFile of accessibilityConfigs) {
        if (await this.checkFileExists(join(projectPath, configFile))) {
          hasAccessibilityConfig = true;
          break;
        }
      }

      if (!hasAccessibilityConfig) {
        warnings.push('Consider adding accessibility configuration for automated testing');
      }

      // Check for proper document structure in Next.js/React apps
      const documentFiles = [
        'src/pages/_document.tsx',
        'src/pages/_document.js',
        'src/app/layout.tsx',
        'public/index.html'
      ];

      for (const docFile of documentFiles) {
        const docPath = join(projectPath, docFile);
        if (await this.checkFileExists(docPath)) {
          const docContent = await fs.readFile(docPath, 'utf-8');
          
          // Check for proper language declaration
          if (!/<html[^>]*lang=/i.test(docContent)) {
            errors.push(`${docFile}: HTML document must have lang attribute for screen readers`);
          }

          // Check for viewport meta tag
          if (!/<meta[^>]*viewport/i.test(docContent)) {
            warnings.push(`${docFile}: Consider adding viewport meta tag for responsive design`);
          }
        }
      }

      // Check for CSS that might affect accessibility
      const styleFiles = await this.findStyleFiles(projectPath);
      for (const styleFile of styleFiles) {
        const styleValidation = await this.validateStyleFile(styleFile);
        errors.push(...styleValidation.errors);
        warnings.push(...styleValidation.warnings);
      }

    } catch (error) {
      warnings.push(`Failed to validate project-level accessibility: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { errors, warnings };
  }

  /**
   * Check if a file exists
   */
  private async checkFileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Find CSS/style files in the project
   */
  private async findStyleFiles(projectPath: string): Promise<string[]> {
    const files: string[] = [];
    const extensions = ['.css', '.scss', '.sass', '.less'];
    
    const searchDir = async (dirPath: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(dirPath, entry.name);
          
          if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
            await searchDir(fullPath);
          } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
            files.push(fullPath);
          }
        }
      } catch {
        // Ignore errors reading directories
      }
    };

    await searchDir(projectPath);
    return files.slice(0, 10); // Limit to first 10 style files for performance
  }

  /**
   * Validate style file for accessibility issues
   */
  private async validateStyleFile(filePath: string): Promise<{ errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fileName = filePath.split('/').pop() || '';

    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // Check for accessibility issues in CSS
      
      // 1. Check for focus indicators
      if (/button|input|select|textarea|\.btn|\.form/i.test(content) && !/focus.*outline|focus.*border|focus.*ring/i.test(content)) {
        warnings.push(`${fileName}: Interactive elements should have visible focus indicators`);
      }

      // 2. Check for proper color contrast patterns
      if (/color:\s*#[0-9a-f]{6}/i.test(content) && !/contrast|accessibility/i.test(content)) {
        warnings.push(`${fileName}: Verify color contrast meets WCAG standards`);
      }

      // 3. Check for potentially problematic animations
      if (/animation.*infinite|@keyframes.*flash|blink/i.test(content)) {
        warnings.push(`${fileName}: Avoid animations that could trigger seizures or vestibular disorders`);
      }

      // 4. Check for text size and line height
      if (/font-size:\s*[0-9.]+px/i.test(content)) {
        const fontSize = content.match(/font-size:\s*([0-9.]+)px/i);
        if (fontSize && parseFloat(fontSize[1]) < 14) {
          warnings.push(`${fileName}: Font size should be at least 14px for readability`);
        }
      }

    } catch (error) {
      warnings.push(`Failed to validate style file ${fileName}: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { errors, warnings };
  }
}

export default WCAGComplianceValidator;