/**
 * Enhanced Component Handler with Xala v5 Compliance
 * Integrates UI compliance validation into component generation
 */

import path from "node:path";
import fs from "fs-extra";
import { consola } from "consola";
import { log, select, confirm } from "@clack/prompts";
import type { ProjectConfig } from "../../types";
import { detectProjectConfig } from "./detect-project-config";
import { generateComponent, type ComponentGenerationOptions } from "../../generators/component-generator";
import { ComponentGeneratorCompliance } from "../../services/ui-compliance/component-generator-compliance";
import type { ComplianceAwareGenerationResult } from "../../services/ui-compliance/component-generator-compliance";
import type { ComponentOptions, ComponentType } from "./component-handler";

/**
 * Enhanced component generation with compliance validation
 */
export async function generateComponentWithCompliance(
  name: string,
  options: ComponentOptions = {}
): Promise<void> {
  try {
    // Initialize compliance validator
    const complianceValidator = new ComponentGeneratorCompliance({
      enforceDesignTokens: true,
      enforceSemanticComponents: true,
      enforceWCAGCompliance: true,
      wcagLevel: options.compliance === "norwegian" ? "AAA" : "AA",
      enforceRTLSupport: true,
      enforceLocalization: true,
      supportedLanguages: options.locales || ["en", "nb", "fr", "ar"]
    });

    // Show compliance information
    log.info("🛡️  Xala v5 Compliance Engine Active");
    consola.info("All generated components will be validated for:");
    consola.info("  ✓ Design token usage (no hardcoded values)");
    consola.info("  ✓ Semantic component usage (no raw HTML)");
    consola.info("  ✓ WCAG AAA accessibility compliance");
    consola.info("  ✓ Localization support (no hardcoded text)");
    consola.info("  ✓ RTL language support");

    // Get project configuration
    const projectRoot = process.cwd();
    const projectConfig = await detectProjectConfig(projectRoot);

    // Component naming
    const componentName = validateAndNormalizeComponentName(name);
    const fileName = toKebabCase(componentName);

    // Component type selection
    const componentType = options.type || await promptComponentType();

    // Show component type specific rules
    const typeRules = complianceValidator.getComponentTypeRules(componentType);
    consola.info(`\n📋 ${componentType} Component Requirements:`);
    typeRules.forEach(rule => consola.info(`  • ${rule}`));

    // Prepare generation options
    const generationOptions: ComponentGenerationOptions = {
      name,
      componentName,
      fileName,
      type: componentType,
      props: [],
      ui: options.ui || projectConfig?.ui || "xala",
      compliance: options.compliance || projectConfig?.compliance || "norwegian",
      locales: options.locales || projectConfig?.locales || ["en", "nb", "fr", "ar"],
      primaryLocale: options.locales?.[0] || projectConfig?.locales?.[0] || "en",
      projectRoot,
      targetDir: path.join(projectRoot, "src", "components", componentType),
      includeTests: !options.skipTests,
      includeStories: !options.skipStories,
      includeStyles: false // Xala v5 uses design tokens only
    };

    // Generate compliant template first
    const template = complianceValidator.createCompliantTemplate(componentType, componentName);
    
    // Validate template before proceeding
    log.info("🔍 Validating component template...");
    const templateValidation = await complianceValidator.validateTemplate(template);
    
    if (!templateValidation.valid) {
      consola.error("Template validation failed!");
      templateValidation.violations.forEach(v => {
        consola.error(`  • Line ${v.line}: ${v.message}`);
      });
      
      const proceed = await confirm({
        message: "Template has violations. Generate anyway and fix manually?",
        initialValue: false
      });
      
      if (!proceed) {
        consola.info("Component generation cancelled.");
        return;
      }
    } else {
      log.success("✓ Template validation passed!");
    }

    // Generate component with compliance validation
    log.info(`Generating ${componentType} component: ${componentName}`);
    
    const result = await complianceValidator.enhanceComponentGeneration(
      generateComponent,
      generationOptions
    ) as ComplianceAwareGenerationResult;

    if (!result.success) {
      consola.error("Component generation failed:");
      result.errors?.forEach(error => consola.error(`  - ${error}`));
      process.exit(1);
    }

    // Display compliance report
    if (result.complianceReport && result.complianceReport.length > 0) {
      log.info("\n📊 Compliance Report");
      
      const totalViolations = result.complianceReport.reduce(
        (sum, r) => sum + r.violations.length, 
        0
      );
      
      if (totalViolations === 0) {
        log.success("✅ All generated files are fully compliant with Xala v5 standards!");
      } else {
        consola.warn(`Found ${totalViolations} compliance issues:`);
        
        // Generate and save detailed report
        const report = complianceValidator.generateComplianceReport(result.complianceReport);
        const reportPath = path.join(generationOptions.targetDir, `${fileName}.compliance-report.md`);
        await fs.writeFile(reportPath, report);
        
        consola.info(`Detailed report saved to: ${path.relative(projectRoot, reportPath)}`);
        
        // Show summary
        result.complianceReport.forEach(fileReport => {
          if (fileReport.violations.length > 0) {
            consola.warn(`\n  ${path.basename(fileReport.filePath)}:`);
            fileReport.violations.slice(0, 3).forEach(v => {
              consola.warn(`    • Line ${v.line}: ${v.message}`);
            });
            if (fileReport.violations.length > 3) {
              consola.warn(`    • ... and ${fileReport.violations.length - 3} more`);
            }
          }
        });
      }
      
      if (result.autoFixed) {
        log.success("\n🔧 Auto-fixed violations where possible");
      }
    }

    // Display Xala v5 specific validation
    if (result.xalaV5Report) {
      log.info("\n🎯 Xala v5 Validation Summary");
      
      const report = result.xalaV5Report;
      consola.info(`  • Design Tokens: ${report.designTokenCompliance.valid ? '✅' : '❌'} (${report.designTokenCompliance.coverage}% coverage)`);
      consola.info(`  • Components: ${report.componentCompliance.valid ? '✅' : '❌'} (${report.componentCompliance.coverage}% coverage)`);
      consola.info(`  • Accessibility: ${report.accessibilityCompliance.valid ? '✅' : '❌'} (WCAG ${report.accessibilityCompliance.wcagLevel}, ${report.accessibilityCompliance.score}% score)`);
      consola.info(`  • Localization: ${report.localizationCompliance.valid ? '✅' : '❌'}`);
      consola.info(`  • RTL Support: ${report.rtlCompliance.valid ? '✅' : '❌'}`);
    }

    // Display success message and next steps
    log.success(`\n🎉 Component ${componentName} generated successfully!`);
    
    const files = result.files.map(f => path.relative(projectRoot, f));
    consola.box(
      `Generated files:\n${files.map(f => `  ✓ ${f}`).join("\n")}\n\n` +
      `Compliance Score: ${result.complianceScore || 100}%\n\n` +
      `Next steps:\n` +
      `1. Review any compliance warnings\n` +
      `2. Add component-specific logic\n` +
      `3. Update translations for all languages\n` +
      `4. Test with screen readers and RTL mode\n` +
      `5. Run unit tests and view in Storybook`
    );

    // Show example usage
    log.info("\n📖 Example Usage:");
    consola.info(`
import { ${componentName} } from '@/components/${componentType}/${fileName}';

// In your page or parent component:
<${componentName} />
`);

    // Show localization reminder
    if (generationOptions.locales.length > 1) {
      log.info("\n🌍 Localization Files to Update:");
      generationOptions.locales.forEach(locale => {
        consola.info(`  • src/localization/languages/${locale}.json`);
      });
    }

  } catch (error) {
    consola.error("Failed to generate component:", error);
    process.exit(1);
  }
}

/**
 * Prompt for component type with enhanced descriptions
 */
async function promptComponentType(): Promise<ComponentType> {
  const type = await select({
    message: "What type of component are you creating?",
    options: [
      { 
        value: "display", 
        label: "Display - For showing data",
        hint: "Cards, lists, stats, badges, etc."
      },
      { 
        value: "form", 
        label: "Form - For user input",
        hint: "Forms, inputs, validation, etc."
      },
      { 
        value: "layout", 
        label: "Layout - For page structure",
        hint: "Headers, sidebars, containers, etc."
      },
    ],
  });

  return type as ComponentType;
}

/**
 * Validate and normalize component name
 */
function validateAndNormalizeComponentName(name: string): string {
  const cleanName = name.replace(/\.(tsx?|jsx?)$/, "");
  
  if (!/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(cleanName)) {
    throw new Error(
      "Component name must start with a letter and contain only letters, numbers, hyphens, and underscores"
    );
  }
  
  return toPascalCase(cleanName);
}

/**
 * Convert to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
    .replace(/^(.)/, (_, char) => char.toUpperCase());
}

/**
 * Convert to kebab-case
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}