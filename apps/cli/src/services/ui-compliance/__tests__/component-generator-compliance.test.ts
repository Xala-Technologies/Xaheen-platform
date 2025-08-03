/**
 * Component Generator Compliance Tests
 */

import { ComponentGeneratorCompliance } from "../component-generator-compliance";
import type { UIComplianceConfig } from "../interfaces/ui-compliance.interface";

describe("ComponentGeneratorCompliance", () => {
  let compliance: ComponentGeneratorCompliance;

  beforeEach(() => {
    compliance = new ComponentGeneratorCompliance();
  });

  describe("Template Validation", () => {
    it("should detect raw HTML elements", async () => {
      const badTemplate = `
export const MyComponent = () => {
  return (
    <div className="container">
      <h1>Title</h1>
      <p>Description</p>
    </div>
  );
};`;

      const result = await compliance.validateTemplate(badTemplate);
      
      expect(result.valid).toBe(false);
      expect(result.violations.some(v => v.message.includes("Raw HTML element"))).toBe(true);
      expect(result.suggestions).toContain("Replace all HTML elements with Xala UI System components");
    });

    it("should detect hardcoded text", async () => {
      const badTemplate = `
import { Card } from '@xala-technologies/ui-system';

export const MyComponent = () => {
  return (
    <Card>
      Welcome to our application
    </Card>
  );
};`;

      const result = await compliance.validateTemplate(badTemplate);
      
      expect(result.valid).toBe(false);
      expect(result.violations.some(v => v.message.includes("Hardcoded text"))).toBe(true);
      expect(result.suggestions).toContain("Use translation functions (t()) for all user-facing text");
    });

    it("should detect hardcoded colors", async () => {
      const badTemplate = `
import { Box } from '@xala-technologies/ui-system';

export const MyComponent = () => {
  return (
    <Box className="bg-blue-500 text-white">
      Content
    </Box>
  );
};`;

      const result = await compliance.validateTemplate(badTemplate);
      
      expect(result.valid).toBe(false);
      expect(result.violations.some(v => v.message.includes("Hardcoded"))).toBe(true);
    });

    it("should pass valid template", async () => {
      const goodTemplate = `
import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, Stack, Typography, Text } from '@xala-technologies/ui-system';

export const MyComponent = (): JSX.Element => {
  const t = useTranslations('MyComponent');
  
  return (
    <Card variant="elevated" spacing="6">
      <Stack direction="vertical" spacing="4">
        <Typography variant="heading" level={2}>
          {t('title')}
        </Typography>
        <Text variant="body" color="secondary">
          {t('description')}
        </Text>
      </Stack>
    </Card>
  );
};`;

      const result = await compliance.validateTemplate(goodTemplate);
      
      expect(result.valid).toBe(true);
      expect(result.violations.length).toBe(0);
    });
  });

  describe("Component Type Rules", () => {
    it("should return form-specific rules", () => {
      const rules = compliance.getComponentTypeRules("form");
      
      expect(rules).toContain("Use Form, FormField, FormLabel components");
      expect(rules).toContain("Include proper form validation");
      expect(rules).toContain("Add error messages with translations");
    });

    it("should return layout-specific rules", () => {
      const rules = compliance.getComponentTypeRules("layout");
      
      expect(rules).toContain("Use Container, Stack, Grid for layout");
      expect(rules).toContain("Include proper landmark roles");
      expect(rules).toContain("Support both LTR and RTL layouts");
    });

    it("should return display-specific rules", () => {
      const rules = compliance.getComponentTypeRules("display");
      
      expect(rules).toContain("Use Card for content containers");
      expect(rules).toContain("Use Typography components for text");
      expect(rules).toContain("Ensure color contrast compliance");
    });
  });

  describe("Compliant Template Creation", () => {
    it("should create valid display template", async () => {
      const template = compliance.createCompliantTemplate("display", "ProductCard");
      
      expect(template).toContain("ProductCard");
      expect(template).toContain("useTranslations");
      expect(template).toContain("@xala-technologies/ui-system");
      expect(template).toContain("aria-label");
      expect(template).not.toContain("<div");
      expect(template).not.toContain("<p>");
      
      // Validate the generated template
      const result = await compliance.validateTemplate(template);
      expect(result.valid).toBe(true);
    });

    it("should create valid form template", async () => {
      const template = compliance.createCompliantTemplate("form", "ContactForm");
      
      expect(template).toContain("ContactForm");
      expect(template).toContain("useForm");
      expect(template).toContain("FormField");
      expect(template).toContain("aria-describedby");
      
      // Validate the generated template
      const result = await compliance.validateTemplate(template);
      expect(result.valid).toBe(true);
    });

    it("should create valid layout template", async () => {
      const template = compliance.createCompliantTemplate("layout", "DashboardLayout");
      
      expect(template).toContain("DashboardLayout");
      expect(template).toContain("Container");
      expect(template).toContain("Header");
      expect(template).toContain("Footer");
      expect(template).toContain('role="banner"');
      expect(template).toContain('role="main"');
      expect(template).toContain('role="contentinfo"');
      
      // Validate the generated template
      const result = await compliance.validateTemplate(template);
      expect(result.valid).toBe(true);
    });
  });

  describe("Compliance Report Generation", () => {
    it("should generate detailed report", () => {
      const mockReports = [
        {
          filePath: "/path/to/component1.tsx",
          violations: [
            {
              message: "Raw HTML element <div> detected",
              line: 10,
              column: 5,
              severity: "error" as const,
              suggestion: "Use Box component"
            },
            {
              message: "Hardcoded text detected",
              line: 15,
              column: 10,
              severity: "warning" as const,
              suggestion: "Use t() function"
            }
          ],
          fixes: [],
          score: 75,
          compliant: false
        },
        {
          filePath: "/path/to/component2.tsx",
          violations: [],
          fixes: [],
          score: 100,
          compliant: true
        }
      ];

      const report = compliance.generateComplianceReport(mockReports);
      
      expect(report).toContain("# Component Generation Compliance Report");
      expect(report).toContain("Total files checked: 2");
      expect(report).toContain("Total violations: 2");
      expect(report).toContain("Errors: 1");
      expect(report).toContain("Warnings: 1");
      expect(report).toContain("Average compliance score: 87.5%");
      expect(report).toContain("component1.tsx");
      expect(report).toContain("Raw HTML element");
    });

    it("should show success message for fully compliant code", () => {
      const mockReports = [
        {
          filePath: "/path/to/component.tsx",
          violations: [],
          fixes: [],
          score: 100,
          compliant: true
        }
      ];

      const report = compliance.generateComplianceReport(mockReports);
      
      expect(report).toContain("✅ All generated components are fully compliant");
    });
  });

  describe("Configuration", () => {
    it("should use strict configuration by default", () => {
      const strictCompliance = new ComponentGeneratorCompliance();
      const config = (strictCompliance as any).config;
      
      expect(config.enforceDesignTokens).toBe(true);
      expect(config.enforceSemanticComponents).toBe(true);
      expect(config.enforceWCAGCompliance).toBe(true);
      expect(config.wcagLevel).toBe("AAA");
      expect(config.allowRawHTML).toBe(false);
      expect(config.allowInlineStyles).toBe(false);
    });

    it("should allow custom configuration", () => {
      const customConfig: Partial<UIComplianceConfig> = {
        wcagLevel: "AA",
        enforceRTLSupport: false,
        allowHardcodedText: true
      };
      
      const customCompliance = new ComponentGeneratorCompliance(customConfig);
      const config = (customCompliance as any).config;
      
      expect(config.wcagLevel).toBe("AA");
      expect(config.enforceRTLSupport).toBe(false);
      expect(config.allowHardcodedText).toBe(true);
      // Other settings should remain strict
      expect(config.enforceDesignTokens).toBe(true);
      expect(config.allowRawHTML).toBe(false);
    });
  });
});