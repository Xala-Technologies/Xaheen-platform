/**
 * Documentation Generator Tests
 * Comprehensive test suite for the documentation generation system
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { 
  DocumentationGenerator,
  IndustryTemplateGenerator,
  PlaygroundGenerator,
  INDUSTRY_THEMES
} from '../documentation';
import { ButtonSpec, InputSpec, CardSpec } from '../core/component-specs';
import { LightTheme } from '../core/theme-system';

// =============================================================================
// DOCUMENTATION GENERATOR CORE TESTS
// =============================================================================

describe('DocumentationGenerator', () => {
  test('should generate markdown documentation for Button component', () => {
    const docs = DocumentationGenerator.generateComponentDocs(ButtonSpec, {
      format: 'markdown',
      includeExamples: true,
      includeAPI: true,
      includeAccessibility: true
    });

    expect(docs.format).toBe('markdown');
    expect(docs.path).toBe('button.md');
    expect(docs.content).toContain('# Button');
    expect(docs.content).toContain(ButtonSpec.description);
    expect(docs.metadata.componentId).toBe('button');
    expect(docs.metadata.componentName).toBe('Button');
  });

  test('should generate HTML documentation for Input component', () => {
    const docs = DocumentationGenerator.generateComponentDocs(InputSpec, {
      format: 'html',
      includeExamples: true,
      includeAPI: true,
      includeAccessibility: true
    });

    expect(docs.format).toBe('html');
    expect(docs.path).toBe('input.html');
    expect(docs.content).toContain('<!DOCTYPE html>');
    expect(docs.content).toContain('<title>Input - Component Documentation</title>');
    expect(docs.content).toContain(InputSpec.description);
  });

  test('should generate JSON documentation for Card component', () => {
    const docs = DocumentationGenerator.generateComponentDocs(CardSpec, {
      format: 'json',
      includeExamples: true,
      includeAPI: true
    });

    expect(docs.format).toBe('json');
    expect(docs.path).toBe('card.json');
    
    const parsedContent = JSON.parse(docs.content);
    expect(parsedContent.component.id).toBe('card');
    expect(parsedContent.component.name).toBe('Card');
    expect(parsedContent.api.props).toEqual(CardSpec.props);
  });

  test('should generate Storybook documentation', () => {
    const docs = DocumentationGenerator.generateComponentDocs(ButtonSpec, {
      format: 'storybook',
      includeExamples: true,
      includeAPI: true
    });

    expect(docs.format).toBe('storybook');
    expect(docs.path).toBe('button.stories.tsx');
    expect(docs.content).toContain("import type { Meta, StoryObj } from '@storybook/react'");
    expect(docs.content).toContain(`import { ${ButtonSpec.name} }`);
    expect(docs.content).toContain('export const Default: Story');
  });

  test('should generate multiple component docs', () => {
    const specs = [ButtonSpec, InputSpec, CardSpec];
    const docs = DocumentationGenerator.generateMultipleComponentDocs(specs, {
      format: 'markdown',
      includeAPI: true
    });

    expect(docs).toHaveLength(3);
    expect(docs.map(d => d.metadata.componentId)).toEqual(['button', 'input', 'card']);
    expect(docs.every(d => d.format === 'markdown')).toBe(true);
  });

  test('should generate platform-specific documentation', () => {
    const docs = DocumentationGenerator.generatePlatformDocs(
      ButtonSpec,
      'react',
      {
        format: 'markdown',
        includePlatforms: true
      }
    );

    expect(docs.content).toContain('## Platform Support');
    expect(docs.content).toContain('react');
  });

  test('should handle unsupported documentation format', () => {
    expect(() => {
      DocumentationGenerator.generateComponentDocs(ButtonSpec, {
        // @ts-ignore - Testing error case
        format: 'unsupported-format'
      });
    }).toThrow('Unsupported documentation format: unsupported-format');
  });
});

// =============================================================================
// INDUSTRY TEMPLATE GENERATOR TESTS
// =============================================================================

describe('IndustryTemplateGenerator', () => {
  test('should generate enterprise theme documentation', () => {
    const template = IndustryTemplateGenerator.generateIndustryTemplate(
      ButtonSpec,
      'enterprise',
      {
        format: 'markdown',
        includeAPI: true,
        includeThemes: true
      }
    );

    expect(template).toContain('# Button - Enterprise Theme');
    expect(template).toContain('Enterprise Overview');
    expect(template).toContain('Brand Colors');
    expect(template).toContain('Design Tokens');
  });

  test('should generate finance theme documentation', () => {
    const template = IndustryTemplateGenerator.generateIndustryTemplate(
      InputSpec,
      'finance',
      {
        format: 'markdown',
        includeAPI: true,
        includeThemes: true
      }
    );

    expect(template).toContain('# Input - Finance Theme');
    expect(template).toContain('financial services applications');
    expect(template).toContain('trust, security, and precision');
  });

  test('should generate healthcare theme documentation', () => {
    const template = IndustryTemplateGenerator.generateIndustryTemplate(
      CardSpec,
      'healthcare',
      {
        format: 'markdown',
        includeAPI: true,
        includeThemes: true
      }
    );

    expect(template).toContain('# Card - Healthcare Theme');
    expect(template).toContain('Healthcare applications');
    expect(template).toContain('clarity, safety, and compliance');
  });

  test('should generate design tokens documentation', () => {
    const tokensDocs = IndustryTemplateGenerator.generateDesignTokensDoc('enterprise');

    expect(tokensDocs).toContain('# Enterprise Design Tokens');
    expect(tokensDocs).toContain('## Color Palette');
    expect(tokensDocs).toContain('### Brand Colors');
    expect(tokensDocs).toContain('### Semantic Colors');
    expect(tokensDocs).toContain('## Typography');
    expect(tokensDocs).toContain('## Compliance Requirements');
  });

  test('should get available industry themes', () => {
    const industries = IndustryTemplateGenerator.getAvailableIndustries();

    expect(industries).toContain('enterprise');
    expect(industries).toContain('finance');
    expect(industries).toContain('healthcare');
    expect(industries).toContain('education');
    expect(industries).toContain('ecommerce');
    expect(industries).toContain('productivity');
  });

  test('should get industry theme configuration', () => {
    const config = IndustryTemplateGenerator.getIndustryConfig('enterprise');

    expect(config.id).toBe('enterprise');
    expect(config.name).toBe('Enterprise');
    expect(config.brandColors.primary).toBe('#0066CC');
    expect(config.typography.headingFont).toBe('Inter Display');
    expect(config.complianceRequirements).toHaveLength(2);
  });

  test('should validate industry theme configurations', () => {
    Object.keys(INDUSTRY_THEMES).forEach(industry => {
      const config = INDUSTRY_THEMES[industry as keyof typeof INDUSTRY_THEMES];
      
      // Validate required properties
      expect(config.id).toBeDefined();
      expect(config.name).toBeDefined();
      expect(config.description).toBeDefined();
      expect(config.brandColors).toBeDefined();
      expect(config.typography).toBeDefined();
      expect(config.designTokens).toBeDefined();
      
      // Validate brand colors
      expect(config.brandColors.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(config.brandColors.secondary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(config.brandColors.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
      
      // Validate typography
      expect(config.typography.headingFont).toBeDefined();
      expect(config.typography.bodyFont).toBeDefined();
      expect(config.typography.monoFont).toBeDefined();
      
      // Validate design tokens
      expect(config.designTokens.spacing).toBeDefined();
      expect(config.designTokens.shadows).toBeDefined();
      expect(config.designTokens.borders).toBeDefined();
      expect(config.designTokens.animations).toBeDefined();
    });
  });
});

// =============================================================================
// PLAYGROUND GENERATOR TESTS
// =============================================================================

describe('PlaygroundGenerator', () => {
  const playgroundContext = {
    spec: ButtonSpec,
    platform: 'react' as const,
    theme: LightTheme,
    industry: 'enterprise' as const,
    options: {
      format: 'codesandbox' as const,
      features: ['live-editing', 'theme-switcher', 'props-panel'] as const,
      customizations: [
        {
          id: 'variant',
          label: 'Variant',
          type: 'select' as const,
          options: ['primary', 'secondary', 'outline'],
          defaultValue: 'primary',
          description: 'Button variant'
        }
      ],
      integrations: []
    }
  };

  test('should generate CodeSandbox playground', () => {
    const playground = PlaygroundGenerator.generatePlayground(playgroundContext);

    expect(playground.url).toContain('codesandbox.io');
    expect(playground.config).toBeDefined();
    expect(playground.dependencies).toContain('react');
    expect(playground.dependencies).toContain('react-dom');
  });

  test('should generate StackBlitz playground', () => {
    const stackblitzContext = {
      ...playgroundContext,
      options: {
        ...playgroundContext.options,
        format: 'stackblitz' as const
      }
    };

    const playground = PlaygroundGenerator.generatePlayground(stackblitzContext);

    expect(playground.url).toContain('stackblitz.com');
    expect(playground.config).toBeDefined();
  });

  test('should generate CodePen playground', () => {
    const codepenContext = {
      ...playgroundContext,
      options: {
        ...playgroundContext.options,
        format: 'codepen' as const
      }
    };

    const playground = PlaygroundGenerator.generatePlayground(codepenContext);

    expect(playground.url).toContain('codepen.io');
    expect(playground.html).toBeDefined();
    expect(playground.css).toBeDefined();
    expect(playground.js).toBeDefined();
  });

  test('should generate Storybook playground', () => {
    const storybookContext = {
      ...playgroundContext,
      options: {
        ...playgroundContext.options,
        format: 'storybook' as const
      }
    };

    const playground = PlaygroundGenerator.generatePlayground(storybookContext);

    expect(playground.js).toContain('Interactive Story');
    expect(playground.js).toContain('@storybook/react');
    expect(playground.dependencies).toContain('@storybook/react');
  });

  test('should generate standalone playground', () => {
    const standaloneContext = {
      ...playgroundContext,
      options: {
        ...playgroundContext.options,
        format: 'standalone' as const
      }
    };

    const playground = PlaygroundGenerator.generatePlayground(standaloneContext);

    expect(playground.html).toContain('<!DOCTYPE html>');
    expect(playground.html).toContain('Button Playground');
    expect(playground.css).toContain('playground-app');
    expect(playground.js).toContain('ButtonComponent');
  });

  test('should handle different playground features', () => {
    const featuresContext = {
      ...playgroundContext,
      options: {
        ...playgroundContext.options,
        format: 'standalone' as const,
        features: [
          'live-editing',
          'theme-switcher',
          'responsive-preview',
          'accessibility-inspector',
          'code-export',
          'props-panel'
        ] as const
      }
    };

    const playground = PlaygroundGenerator.generatePlayground(featuresContext);

    expect(playground.html).toContain('theme-controls');
    expect(playground.html).toContain('controls-panel');
    expect(playground.html).toContain('code-panel');
    expect(playground.css).toContain('responsive-controls');
  });

  test('should generate playground for different platforms', () => {
    const platforms: Array<'react' | 'vue' | 'angular' | 'svelte'> = ['react', 'vue', 'angular', 'svelte'];
    
    platforms.forEach(platform => {
      const platformContext = {
        ...playgroundContext,
        platform,
        options: {
          ...playgroundContext.options,
          format: 'standalone' as const
        }
      };

      expect(() => {
        PlaygroundGenerator.generatePlayground(platformContext);
      }).not.toThrow();
    });
  });

  test('should handle unsupported playground format', () => {
    const invalidContext = {
      ...playgroundContext,
      options: {
        ...playgroundContext.options,
        // @ts-ignore - Testing error case
        format: 'unsupported-format'
      }
    };

    expect(() => {
      PlaygroundGenerator.generatePlayground(invalidContext);
    }).toThrow('Unsupported playground format: unsupported-format');
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe('Documentation System Integration', () => {
  test('should generate complete documentation suite', () => {
    const specs = [ButtonSpec, InputSpec, CardSpec];
    const formats: Array<'markdown' | 'html' | 'json'> = ['markdown', 'html', 'json'];
    
    formats.forEach(format => {
      const docs = DocumentationGenerator.generateMultipleComponentDocs(specs, {
        format,
        includeExamples: true,
        includeAPI: true,
        includeAccessibility: true,
        includePlatforms: true,
        includeThemes: true
      });

      expect(docs).toHaveLength(3);
      docs.forEach(doc => {
        expect(doc.format).toBe(format);
        expect(doc.content.length).toBeGreaterThan(0);
        expect(doc.metadata).toBeDefined();
      });
    });
  });

  test('should generate industry-specific documentation with playgrounds', () => {
    const industries: Array<'enterprise' | 'finance' | 'healthcare'> = ['enterprise', 'finance', 'healthcare'];
    
    industries.forEach(industry => {
      // Generate industry documentation
      const industryDocs = IndustryTemplateGenerator.generateIndustryTemplate(
        ButtonSpec,
        industry,
        {
          format: 'markdown',
          includeAPI: true,
          includeThemes: true
        }
      );

      expect(industryDocs).toContain(`# Button - ${INDUSTRY_THEMES[industry].name} Theme`);
      
      // Generate corresponding playground
      const playground = PlaygroundGenerator.generatePlayground({
        spec: ButtonSpec,
        platform: 'react',
        industry,
        options: {
          format: 'standalone',
          features: ['live-editing', 'theme-switcher'],
          customizations: [],
          integrations: []
        }
      });

      expect(playground).toBeDefined();
    });
  });

  test('should generate localized documentation', () => {
    const locales: Array<'en' | 'nb-NO'> = ['en', 'nb-NO'];
    
    locales.forEach(locale => {
      const docs = DocumentationGenerator.generateComponentDocs(ButtonSpec, {
        format: 'markdown',
        locale,
        includeAPI: true,
        includeAccessibility: true
      });

      expect(docs.content).toBeDefined();
      expect(docs.content.length).toBeGreaterThan(0);
    });
  });

  test('should validate all industry themes have complete configurations', () => {
    const requiredFields = [
      'id', 'name', 'description', 'brandColors', 'typography',
      'designTokens', 'complianceRequirements', 'useCases'
    ];

    Object.entries(INDUSTRY_THEMES).forEach(([industryId, config]) => {
      requiredFields.forEach(field => {
        expect(config).toHaveProperty(field);
        expect(config[field as keyof typeof config]).toBeDefined();
      });

      // Validate brand colors are valid hex codes
      expect(config.brandColors.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(config.brandColors.secondary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(config.brandColors.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);

      // Validate compliance requirements
      expect(Array.isArray(config.complianceRequirements)).toBe(true);
      expect(config.complianceRequirements.length).toBeGreaterThan(0);

      // Validate use cases
      expect(Array.isArray(config.useCases)).toBe(true);
      config.useCases.forEach(useCase => {
        expect(useCase).toHaveProperty('id');
        expect(useCase).toHaveProperty('title');
        expect(useCase).toHaveProperty('description');
        expect(useCase).toHaveProperty('components');
        expect(Array.isArray(useCase.components)).toBe(true);
      });
    });
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

describe('Documentation Accessibility', () => {
  test('should include accessibility information in all formats', () => {
    const formats: Array<'markdown' | 'html' | 'json'> = ['markdown', 'html', 'json'];
    
    formats.forEach(format => {
      const docs = DocumentationGenerator.generateComponentDocs(ButtonSpec, {
        format,
        includeAccessibility: true
      });

      switch (format) {
        case 'markdown':
          expect(docs.content).toContain('## Accessibility');
          expect(docs.content).toContain('WCAG Compliance');
          expect(docs.content).toContain('Keyboard Navigation');
          break;
        case 'html':
          expect(docs.content).toContain('accessibility');
          break;
        case 'json':
          const parsed = JSON.parse(docs.content);
          expect(parsed.accessibility).toBeDefined();
          expect(parsed.accessibility.wcagLevel).toBe(ButtonSpec.accessibility.wcagLevel);
          break;
      }
    });
  });

  test('should validate accessibility metadata', () => {
    const docs = DocumentationGenerator.generateComponentDocs(ButtonSpec, {
      format: 'json',
      includeAccessibility: true
    });

    const parsed = JSON.parse(docs.content);
    const accessibility = parsed.accessibility;

    expect(accessibility.wcagLevel).toBe('AAA');
    expect(accessibility.roles).toContain('button');
    expect(accessibility.ariaAttributes).toContain('aria-label');
    expect(accessibility.keyboardNavigation).toBe(true);
    expect(accessibility.screenReaderSupport).toBe(true);
    expect(accessibility.focusManagement).toBe(true);
  });
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

describe('Documentation Performance', () => {
  test('should generate large documentation sets efficiently', () => {
    const specs = Array(10).fill(ButtonSpec); // Simulate 10 components
    const startTime = performance.now();

    const docs = DocumentationGenerator.generateMultipleComponentDocs(specs, {
      format: 'markdown',
      includeExamples: true,
      includeAPI: true,
      includeAccessibility: true
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(docs).toHaveLength(10);
    expect(duration).toBeLessThan(1000); // Should complete in under 1 second
  });

  test('should generate playgrounds efficiently', () => {
    const context = {
      spec: ButtonSpec,
      platform: 'react' as const,
      options: {
        format: 'standalone' as const,
        features: ['live-editing', 'theme-switcher', 'props-panel'] as const,
        customizations: [],
        integrations: []
      }
    };

    const startTime = performance.now();
    const playground = PlaygroundGenerator.generatePlayground(context);
    const endTime = performance.now();

    const duration = endTime - startTime;

    expect(playground).toBeDefined();
    expect(duration).toBeLessThan(500); // Should complete in under 500ms
  });
});