/**
 * @fileoverview Template Validation Test Suite
 * @description Validates all CLI templates for v5.0 architecture compliance
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import Handlebars from 'handlebars';

interface TemplateValidation {
  name: string;
  path: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  compliance: {
    noHooks: boolean;
    pureComponent: boolean;
    cvaPattern: boolean;
    forwardRef: boolean;
    typeScript: boolean;
    accessibility: boolean;
  };
}

class TemplateValidator {
  private forbiddenPatterns = [
    { pattern: /useState\s*\(/, message: 'useState hook found - components must be pure' },
    { pattern: /useEffect\s*\(/, message: 'useEffect hook found - components must be pure' },
    { pattern: /useCallback\s*\(/, message: 'useCallback hook found - components must be pure' },
    { pattern: /useMemo\s*\(/, message: 'useMemo hook found - components must be pure' },
    { pattern: /useTokens\s*\(/, message: 'useTokens hook found - use CSS custom properties' },
    { pattern: /useContext\s*\(/, message: 'useContext found - pass props from parent' },
    { pattern: /createContext\s*\(/, message: 'createContext found - providers should be separate' },
    { pattern: /style\s*=\s*\{\{/, message: 'Inline styles found - use Tailwind/CVA classes' },
    { pattern: /: any[\s,;\)]/, message: 'TypeScript "any" type found' },
    { pattern: /className\s*=\s*["']p-2\s/, message: 'Small padding (p-2) - use professional sizing' },
    { pattern: /className\s*=\s*["']text-xs/, message: 'Extra small text - maintain readability' },
  ];

  private requiredPatterns = [
    { pattern: /forwardRef/, message: 'Missing forwardRef for ref forwarding' },
    { pattern: /cva\s*\(/, message: 'Missing CVA for variant management' },
    { pattern: /displayName\s*=/, message: 'Missing displayName for debugging' },
    { pattern: /export\s+const/, message: 'Missing component export' },
    { pattern: /interface\s+\w+Props/, message: 'Missing TypeScript interface for props' },
    { pattern: /readonly\s+/, message: 'Missing readonly modifiers on props' },
  ];

  private accessibilityPatterns = [
    { pattern: /aria-label|aria-labelledby|aria-describedby/, message: 'ARIA labels' },
    { pattern: /role=/, message: 'ARIA roles' },
    { pattern: /data-testid/, message: 'Test identifiers' },
  ];

  async validateTemplate(templatePath: string): Promise<TemplateValidation> {
    const name = path.basename(templatePath, '.hbs');
    const content = await fs.readFile(templatePath, 'utf-8');
    
    const validation: TemplateValidation = {
      name,
      path: templatePath,
      valid: true,
      errors: [],
      warnings: [],
      compliance: {
        noHooks: true,
        pureComponent: true,
        cvaPattern: false,
        forwardRef: false,
        typeScript: true,
        accessibility: false,
      },
    };

    // Check forbidden patterns
    for (const { pattern, message } of this.forbiddenPatterns) {
      if (pattern.test(content)) {
        validation.errors.push(message);
        validation.valid = false;
        
        if (message.includes('hook')) {
          validation.compliance.noHooks = false;
          validation.compliance.pureComponent = false;
        }
        if (message.includes('any')) {
          validation.compliance.typeScript = false;
        }
      }
    }

    // Check required patterns for UI components
    if (this.isUIComponent(name)) {
      for (const { pattern, message } of this.requiredPatterns) {
        if (!pattern.test(content)) {
          // Some patterns are warnings, not errors
          if (pattern.source.includes('forwardRef')) {
            validation.warnings.push(`Consider adding ${message}`);
            validation.compliance.forwardRef = false;
          } else if (pattern.source.includes('cva')) {
            validation.warnings.push(`Consider adding ${message}`);
            validation.compliance.cvaPattern = false;
          } else {
            validation.errors.push(message);
            validation.valid = false;
          }
        } else {
          if (pattern.source.includes('forwardRef')) {
            validation.compliance.forwardRef = true;
          }
          if (pattern.source.includes('cva')) {
            validation.compliance.cvaPattern = true;
          }
        }
      }

      // Check accessibility
      for (const { pattern } of this.accessibilityPatterns) {
        if (pattern.test(content)) {
          validation.compliance.accessibility = true;
          break;
        }
      }
      
      if (!validation.compliance.accessibility) {
        validation.warnings.push('Consider adding accessibility attributes');
      }
    }

    // Check template compilation
    try {
      const template = Handlebars.compile(content);
      const testData = {
        componentName: 'TestComponent',
        camelCase: (str: string) => str.charAt(0).toLowerCase() + str.slice(1),
      };
      const compiled = template(testData);
      
      // Validate compiled output
      if (compiled.includes('undefined')) {
        validation.warnings.push('Template may produce undefined values');
      }
    } catch (error) {
      validation.errors.push(`Template compilation error: ${error.message}`);
      validation.valid = false;
    }

    return validation;
  }

  private isUIComponent(name: string): boolean {
    const nonUITemplates = [
      'provider',
      'hook',
      'util',
      'service',
      'context',
      'store',
      'api',
      'type',
      'test',
    ];
    
    return !nonUITemplates.some(t => name.toLowerCase().includes(t));
  }

  async validateAllTemplates(templatesDir: string): Promise<TemplateValidation[]> {
    const results: TemplateValidation[] = [];
    
    const categories = await fs.readdir(templatesDir);
    
    for (const category of categories) {
      const categoryPath = path.join(templatesDir, category);
      const stat = await fs.stat(categoryPath);
      
      if (stat.isDirectory()) {
        const templates = await fs.readdir(categoryPath);
        
        for (const template of templates) {
          if (template.endsWith('.hbs')) {
            const templatePath = path.join(categoryPath, template);
            const validation = await this.validateTemplate(templatePath);
            results.push(validation);
          }
        }
      }
    }
    
    return results;
  }
}

describe.skip('Template Validation Tests (Requires template files)', () => {
  let validator: TemplateValidator;
  let templatesDir: string;
  
  beforeAll(() => {
    validator = new TemplateValidator();
    templatesDir = path.join(process.cwd(), 'src', 'templates');
  });
  
  describe('Component Templates', () => {
    it('should validate button template', async () => {
      const templatePath = path.join(templatesDir, 'components', 'button.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(true);
      expect(validation.compliance.noHooks).toBe(true);
      expect(validation.compliance.pureComponent).toBe(true);
      expect(validation.compliance.cvaPattern).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
    
    it('should validate input template', async () => {
      const templatePath = path.join(templatesDir, 'components', 'input.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(true);
      expect(validation.compliance.noHooks).toBe(true);
      expect(validation.compliance.typeScript).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
    
    it('should validate card template', async () => {
      const templatePath = path.join(templatesDir, 'components', 'card.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(true);
      expect(validation.compliance.noHooks).toBe(true);
      expect(validation.compliance.accessibility).toBe(true);
    });
    
    it('should validate modal template', async () => {
      const templatePath = path.join(templatesDir, 'components', 'modal.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(true);
      expect(validation.compliance.noHooks).toBe(true);
      expect(validation.compliance.pureComponent).toBe(true);
      expect(validation.errors).not.toContain('useState hook found');
      expect(validation.errors).not.toContain('useEffect hook found');
    });
    
    it('should validate data-table template', async () => {
      const templatePath = path.join(templatesDir, 'components', 'data-table.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(true);
      expect(validation.compliance.noHooks).toBe(true);
      expect(validation.compliance.pureComponent).toBe(true);
      // Data table should receive sorted/filtered data from parent
      expect(validation.errors).not.toContain('useState hook found');
    });
    
    it('should validate form template', async () => {
      const templatePath = path.join(templatesDir, 'components', 'form.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(true);
      expect(validation.compliance.noHooks).toBe(true);
      // Form state should be managed by parent
      expect(validation.errors).not.toContain('useState hook found');
    });
    
    it('should validate navbar template', async () => {
      const templatePath = path.join(templatesDir, 'components', 'navbar.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(true);
      expect(validation.compliance.noHooks).toBe(true);
      expect(validation.compliance.cvaPattern).toBe(true);
    });
    
    it('should validate header template', async () => {
      const templatePath = path.join(templatesDir, 'components', 'header.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(true);
      expect(validation.compliance.noHooks).toBe(true);
      expect(validation.compliance.pureComponent).toBe(true);
    });
    
    it('should validate command-palette template', async () => {
      const templatePath = path.join(templatesDir, 'components', 'command-palette.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(true);
      expect(validation.compliance.noHooks).toBe(true);
      expect(validation.compliance.accessibility).toBe(true);
    });
    
    it('should validate virtual-list template', async () => {
      const templatePath = path.join(templatesDir, 'components', 'virtual-list.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(true);
      expect(validation.compliance.noHooks).toBe(true);
      // Virtual scrolling calculations should be in parent
      expect(validation.errors).not.toContain('useState hook found');
    });
  });
  
  describe('Provider Templates', () => {
    it('should allow hooks in provider templates', async () => {
      const templatePath = path.join(templatesDir, 'providers', 'theme-provider.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      // Providers are allowed to have hooks
      expect(validation.valid).toBe(true);
      // Should not check for hooks in providers
      expect(validation.errors).not.toContain('useState hook found');
    });
    
    it('should validate auth-provider template', async () => {
      const templatePath = path.join(templatesDir, 'providers', 'auth-provider.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(true);
      expect(validation.compliance.typeScript).toBe(true);
    });
    
    it('should validate token-provider template', async () => {
      const templatePath = path.join(templatesDir, 'providers', 'token-provider.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(true);
      // Should export CSS custom properties, not JavaScript tokens
      expect(validation.errors).not.toContain('useTokens hook found');
    });
  });
  
  describe('Tool Templates', () => {
    it('should validate performance-monitor template', async () => {
      const templatePath = path.join(templatesDir, 'tools', 'performance-monitor.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      // Tools/providers can have hooks as they manage state
      expect(validation.valid).toBe(true);
      expect(validation.compliance.typeScript).toBe(true);
    });
    
    it('should validate code-generator template', async () => {
      const templatePath = path.join(templatesDir, 'ai-tools', 'code-generator.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(true);
      expect(validation.compliance.typeScript).toBe(true);
    });
    
    it('should validate component-analyzer template', async () => {
      const templatePath = path.join(templatesDir, 'ai-tools', 'component-analyzer.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(true);
      expect(validation.compliance.typeScript).toBe(true);
    });
  });
  
  describe('Layout Templates', () => {
    it('should validate sidebar-layout template', async () => {
      const templatePath = path.join(templatesDir, 'layouts', 'sidebar-layout.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(true);
      expect(validation.compliance.noHooks).toBe(true);
      expect(validation.compliance.pureComponent).toBe(true);
    });
    
    it('should validate dashboard-layout template', async () => {
      const templatePath = path.join(templatesDir, 'layouts', 'dashboard-layout.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(true);
      expect(validation.compliance.noHooks).toBe(true);
      expect(validation.compliance.accessibility).toBe(true);
    });
    
    it('should validate split-layout template', async () => {
      const templatePath = path.join(templatesDir, 'layouts', 'split-layout.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(true);
      expect(validation.compliance.noHooks).toBe(true);
      expect(validation.compliance.cvaPattern).toBe(true);
    });
  });
  
  describe('Compliance Validation', () => {
    it('should have no TypeScript any types', async () => {
      const componentsPath = path.join(templatesDir, 'components');
      const templates = await fs.readdir(componentsPath);
      
      for (const template of templates) {
        if (template.endsWith('.hbs')) {
          const templatePath = path.join(componentsPath, template);
          const validation = await validator.validateTemplate(templatePath);
          
          expect(validation.compliance.typeScript).toBe(true);
          expect(validation.errors).not.toContain('TypeScript "any" type found');
        }
      }
    });
    
    it('should use professional sizing', async () => {
      const componentsPath = path.join(templatesDir, 'components');
      const templates = await fs.readdir(componentsPath);
      
      for (const template of templates) {
        if (template.endsWith('.hbs')) {
          const templatePath = path.join(componentsPath, template);
          const content = await fs.readFile(templatePath, 'utf-8');
          
          // Check for small sizes
          expect(content).not.toMatch(/className.*p-[01]/);
          expect(content).not.toMatch(/className.*text-xs/);
          expect(content).not.toMatch(/className.*h-[468]/);
        }
      }
    });
    
    it('should not use inline styles', async () => {
      const componentsPath = path.join(templatesDir, 'components');
      const templates = await fs.readdir(componentsPath);
      
      for (const template of templates) {
        if (template.endsWith('.hbs')) {
          const templatePath = path.join(componentsPath, template);
          const content = await fs.readFile(templatePath, 'utf-8');
          
          // Should not have inline style objects
          expect(content).not.toMatch(/style\s*=\s*\{\{/);
        }
      }
    });
  });
  
  describe('Template Compilation', () => {
    it('should compile all templates without errors', async () => {
      const allTemplates = await validator.validateAllTemplates(templatesDir);
      
      for (const validation of allTemplates) {
        // Check compilation succeeded
        const compilationErrors = validation.errors.filter(e => 
          e.includes('Template compilation error')
        );
        expect(compilationErrors).toHaveLength(0);
      }
    });
    
    it('should generate valid TypeScript code', async () => {
      const templatePath = path.join(templatesDir, 'components', 'button.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');
      
      const template = Handlebars.compile(content);
      const generated = template({
        componentName: 'TestButton',
        camelCase: (str: string) => str.charAt(0).toLowerCase() + str.slice(1),
      });
      
      // Check TypeScript syntax
      expect(generated).toContain('export const TestButton');
      expect(generated).toContain('interface');
      expect(generated).toContain('readonly');
      expect(generated).toContain(': JSX.Element');
    });
  });
  
  describe('Multi-Platform Templates', () => {
    it('should validate React adapter template', async () => {
      const templatePath = path.join(templatesDir, 'universal', 'react-adapter.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(true);
      expect(validation.compliance.typeScript).toBe(true);
    });
    
    it('should validate Vue adapter template', async () => {
      const templatePath = path.join(templatesDir, 'universal', 'vue-adapter.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(true);
      expect(validation.compliance.typeScript).toBe(true);
    });
    
    it('should validate Angular adapter template', async () => {
      const templatePath = path.join(templatesDir, 'universal', 'angular-adapter.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(true);
      expect(validation.compliance.typeScript).toBe(true);
    });
    
    it('should validate component factory template', async () => {
      const templatePath = path.join(templatesDir, 'universal', 'component-factory.hbs');
      const validation = await validator.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(true);
      expect(validation.compliance.typeScript).toBe(true);
    });
  });
  
  describe('Summary Report', () => {
    it('should generate compliance report for all templates', async () => {
      const allTemplates = await validator.validateAllTemplates(templatesDir);
      
      const report = {
        total: allTemplates.length,
        valid: allTemplates.filter(t => t.valid).length,
        invalid: allTemplates.filter(t => !t.valid).length,
        compliance: {
          noHooks: allTemplates.filter(t => t.compliance.noHooks).length,
          pureComponent: allTemplates.filter(t => t.compliance.pureComponent).length,
          cvaPattern: allTemplates.filter(t => t.compliance.cvaPattern).length,
          forwardRef: allTemplates.filter(t => t.compliance.forwardRef).length,
          typeScript: allTemplates.filter(t => t.compliance.typeScript).length,
          accessibility: allTemplates.filter(t => t.compliance.accessibility).length,
        },
        errors: allTemplates.flatMap(t => t.errors),
        warnings: allTemplates.flatMap(t => t.warnings),
      };
      
      console.log('\n📋 Template Validation Report:');
      console.log('─'.repeat(50));
      console.log(`Total Templates: ${report.total}`);
      console.log(`Valid: ${report.valid} (${Math.round(report.valid / report.total * 100)}%)`);
      console.log(`Invalid: ${report.invalid}`);
      console.log('\nCompliance Metrics:');
      console.log(`- No Hooks: ${report.compliance.noHooks}/${report.total}`);
      console.log(`- Pure Components: ${report.compliance.pureComponent}/${report.total}`);
      console.log(`- CVA Pattern: ${report.compliance.cvaPattern}/${report.total}`);
      console.log(`- ForwardRef: ${report.compliance.forwardRef}/${report.total}`);
      console.log(`- TypeScript: ${report.compliance.typeScript}/${report.total}`);
      console.log(`- Accessibility: ${report.compliance.accessibility}/${report.total}`);
      console.log('─'.repeat(50));
      
      // All templates should be valid
      expect(report.invalid).toBe(0);
      expect(report.valid).toBe(report.total);
    });
  });
});