#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs-extra';
import { z } from 'zod';
import { LicenseComplianceService, NorwegianLicensePolicy } from '../services/compliance/license-compliance.service';

/**
 * License Compliance CLI Command
 * Provides comprehensive license scanning and compliance reporting for Norwegian enterprises
 */

// CLI Options Schema
const LicenseComplianceOptionsSchema = z.object({
  project: z.string().default(process.cwd()),
  config: z.string().optional(),
  output: z.string().optional(),
  includeTransitive: z.boolean().default(true),
  scanSourceHeaders: z.boolean().default(false),
  generateSpdx: z.boolean().default(true),
  generateAttribution: z.boolean().default(true),
  deepScan: z.boolean().default(false),
  format: z.enum(['json', 'markdown', 'both']).default('both'),
  failOn: z.enum(['prohibited', 'high_risk', 'medium_risk', 'any_issue']).default('prohibited'),
  verbose: z.boolean().default(false),
  norwegian: z.boolean().default(true),
  notifyLegal: z.boolean().default(false),
});

type LicenseComplianceOptions = z.infer<typeof LicenseComplianceOptionsSchema>;

// Default Norwegian Enterprise Policy
const DEFAULT_NORWEGIAN_POLICY: NorwegianLicensePolicy = {
  organizationName: 'Norwegian Enterprise',
  organizationType: 'enterprise',
  procurementGuidelines: 'moderate',
  allowedLicenses: [
    'MIT',
    'BSD-2-Clause',
    'BSD-3-Clause',
    'Apache-2.0',
    'ISC',
    'Unlicense',
    'CC0-1.0',
  ],
  reviewRequiredLicenses: [
    'LGPL-2.1',
    'LGPL-3.0',
    'MPL-2.0',
    'EPL-2.0',
    'CDDL-1.0',
  ],
  prohibitedLicenses: [
    'GPL-2.0',
    'GPL-3.0',
    'AGPL-3.0',
    'SSPL-1.0',
    'BSL-1.1',
    'BUSL-1.1',
  ],
  requireLegalReview: true,
  automaticScanning: true,
  generateSPDXReports: true,
  exportControlCompliance: true,
  gdprCompatibilityCheck: true,
  norwegianLanguageReporting: true,
  notificationSettings: {
    emailNotifications: false,
  },
};

/**
 * Create and configure the license compliance command
 */
export function createLicenseComplianceCommand(): Command {
  const command = new Command('license-compliance');

  command
    .description('Perform comprehensive license compliance scanning for Norwegian enterprises')
    .option('-p, --project <path>', 'Project path to scan', process.cwd())
    .option('-c, --config <path>', 'Path to license policy configuration file')
    .option('-o, --output <path>', 'Output directory for reports')
    .option('--no-include-transitive', 'Exclude transitive dependencies')
    .option('--scan-source-headers', 'Scan source code headers for license declarations')
    .option('--no-generate-spdx', 'Skip SPDX document generation')
    .option('--no-generate-attribution', 'Skip attribution document generation')
    .option('--deep-scan', 'Perform deep scan using external tools')
    .option('--format <format>', 'Report format (json|markdown|both)', 'both')
    .option('--fail-on <level>', 'Fail build on risk level (prohibited|high_risk|medium_risk|any_issue)', 'prohibited')
    .option('-v, --verbose', 'Verbose output')
    .option('--no-norwegian', 'Disable Norwegian-specific compliance checks')
    .option('--notify-legal', 'Send notifications to legal team')
    .action(async (options: Partial<LicenseComplianceOptions>) => {
      try {
        const validatedOptions = LicenseComplianceOptionsSchema.parse(options);
        await executeLicenseComplianceScan(validatedOptions);
      } catch (error) {
        console.error(chalk.red('Error in license compliance scan:'), error);
        process.exit(1);
      }
    });

  // Subcommands
  command
    .command('init')
    .description('Initialize license policy configuration')
    .option('--org-type <type>', 'Organization type (government|municipality|enterprise|startup|ngo)', 'enterprise')
    .option('--org-name <name>', 'Organization name')
    .option('--strict', 'Use strict procurement guidelines')
    .option('--flexible', 'Use flexible procurement guidelines')
    .action(async (subOptions: any) => {
      await initializeLicensePolicy(subOptions);
    });

  command
    .command('check <package>')
    .description('Check license compatibility for a specific package')
    .option('--version <version>', 'Package version')
    .action(async (packageName: string, subOptions: any) => {
      await checkPackageLicense(packageName, subOptions);
    });

  command
    .command('whitelist')
    .description('Manage approved package whitelist')
    .option('--add <packages...>', 'Add packages to whitelist')
    .option('--remove <packages...>', 'Remove packages from whitelist')
    .option('--list', 'List current whitelist')
    .action(async (subOptions: any) => {
      await manageWhitelist(subOptions);
    });

  command
    .command('report <scanId>')
    .description('Generate detailed report from previous scan')
    .option('--format <format>', 'Report format (json|markdown|spdx|attribution)', 'markdown')
    .action(async (scanId: string, subOptions: any) => {
      await generateDetailedReport(scanId, subOptions);
    });

  return command;
}

/**
 * Execute license compliance scan
 */
async function executeLicenseComplianceScan(options: LicenseComplianceOptions): Promise<void> {
  console.log(chalk.cyan('🔍 Starting License Compliance Scan...'));
  
  if (options.verbose) {
    console.log(chalk.gray('Scan Options:'));
    console.log(chalk.gray(`  Project: ${options.project}`));
    console.log(chalk.gray(`  Deep Scan: ${options.deepScan}`));
    console.log(chalk.gray(`  Source Headers: ${options.scanSourceHeaders}`));
    console.log(chalk.gray(`  Norwegian Compliance: ${options.norwegian}`));
    console.log(chalk.gray(`  Fail On: ${options.failOn}`));
  }

  // Load or create policy configuration
  const policy = await loadLicensePolicy(options.config, options.norwegian);
  
  // Configure notifications
  if (options.notifyLegal) {
    policy.notificationSettings.emailNotifications = true;
  }

  // Initialize compliance service
  const complianceService = new LicenseComplianceService(policy);

  try {
    // Perform scan
    const scanResult = await complianceService.performLicenseScan(options.project, {
      includeTransitive: options.includeTransitive,
      scanSourceHeaders: options.scanSourceHeaders,
      generateSPDX: options.generateSpdx,
      generateAttribution: options.generateAttribution,
      deepScan: options.deepScan,
    });

    // Display summary
    displayScanSummary(scanResult, options.verbose);

    // Generate reports
    const outputDir = options.output || path.join(options.project, 'license-compliance');
    await generateReports(complianceService, scanResult, outputDir, options.format);

    // Check fail conditions
    const shouldFail = checkFailConditions(scanResult, options.failOn);
    
    if (shouldFail) {
      console.log(chalk.red('\n❌ License compliance scan failed!'));
      console.log(chalk.red('Critical issues detected that require immediate attention.'));
      process.exit(1);
    } else {
      console.log(chalk.green('\n✅ License compliance scan completed successfully!'));
      
      if (scanResult.complianceIssues.length > 0) {
        console.log(chalk.yellow(`📋 ${scanResult.complianceIssues.length} compliance issues identified for review.`));
      }
    }

  } catch (error) {
    console.error(chalk.red('License compliance scan failed:'), error);
    process.exit(1);
  }
}

/**
 * Load license policy configuration
 */
async function loadLicensePolicy(configPath?: string, norwegianCompliance: boolean = true): Promise<NorwegianLicensePolicy> {
  if (configPath && await fs.pathExists(configPath)) {
    try {
      const configData = await fs.readJson(configPath);
      console.log(chalk.green(`📄 Loaded license policy from: ${configPath}`));
      return configData;
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Could not load config from ${configPath}, using defaults`));
    }
  }

  // Use default policy
  const policy = { ...DEFAULT_NORWEGIAN_POLICY };
  
  if (!norwegianCompliance) {
    policy.norwegianLanguageReporting = false;
    policy.exportControlCompliance = false;
    policy.organizationType = 'enterprise';
  }

  return policy;
}

/**
 * Display scan summary
 */
function displayScanSummary(scanResult: any, verbose: boolean): void {
  console.log(chalk.cyan('\n📊 Scan Summary:'));
  console.log(`  Total Packages: ${scanResult.totalPackages}`);
  console.log(`  Licensed: ${scanResult.licensedPackages}`);
  console.log(`  Unlicensed: ${scanResult.unlicensedPackages}`);
  
  // Risk level with color coding
  const riskColor = 
    scanResult.riskAssessment.overallRisk === 'PROHIBITED' ? chalk.red :
    scanResult.riskAssessment.overallRisk === 'HIGH_RISK' ? chalk.red :
    scanResult.riskAssessment.overallRisk === 'MEDIUM_RISK' ? chalk.yellow :
    scanResult.riskAssessment.overallRisk === 'LOW_RISK' ? chalk.blue :
    chalk.green;
  
  console.log(`  Overall Risk: ${riskColor(scanResult.riskAssessment.overallRisk)}`);

  // Compliance issues
  const critical = scanResult.complianceIssues.filter((i: any) => i.severity === 'critical').length;
  const major = scanResult.complianceIssues.filter((i: any) => i.severity === 'major').length;
  const minor = scanResult.complianceIssues.filter((i: any) => i.severity === 'minor').length;

  if (critical > 0) console.log(chalk.red(`  Critical Issues: ${critical}`));
  if (major > 0) console.log(chalk.yellow(`  Major Issues: ${major}`));
  if (minor > 0) console.log(chalk.blue(`  Minor Issues: ${minor}`));

  // License conflicts
  if (scanResult.licenseConflicts.length > 0) {
    console.log(chalk.red(`  License Conflicts: ${scanResult.licenseConflicts.length}`));
  }

  if (verbose) {
    console.log(chalk.cyan('\n📈 Risk Breakdown:'));
    console.log(`  Copyleft Risk: ${scanResult.riskAssessment.copyleftRisk.toFixed(1)}%`);
    console.log(`  Commercial Risk: ${scanResult.riskAssessment.commercialRisk.toFixed(1)}%`);
    console.log(`  Norwegian Compliance: ${scanResult.riskAssessment.norwegianComplianceRisk.toFixed(1)}%`);
    
    if (scanResult.riskAssessment.riskFactors.length > 0) {
      console.log(chalk.cyan('\n⚠️  Risk Factors:'));
      scanResult.riskAssessment.riskFactors.forEach((factor: string) => {
        console.log(`  • ${factor}`);
      });
    }
  }
}

/**
 * Generate reports based on format option
 */
async function generateReports(
  service: LicenseComplianceService,
  scanResult: any,
  outputDir: string,
  format: string
): Promise<void> {
  await fs.ensureDir(outputDir);

  if (format === 'json' || format === 'both') {
    const jsonPath = await service.exportScanResults(scanResult, path.join(outputDir, `scan-${scanResult.scanId}.json`));
    console.log(chalk.green(`📄 JSON report: ${jsonPath}`));
  }

  if (format === 'markdown' || format === 'both') {
    const mdPath = await service.generateComplianceReport(scanResult);
    console.log(chalk.green(`📋 Compliance report: ${mdPath}`));
  }
}

/**
 * Check if scan should fail based on conditions
 */
function checkFailConditions(scanResult: any, failOn: string): boolean {
  switch (failOn) {
    case 'prohibited':
      return scanResult.riskAssessment.overallRisk === 'PROHIBITED' ||
             scanResult.complianceIssues.some((i: any) => i.severity === 'critical' && i.type === 'prohibited_license');
    
    case 'high_risk':
      return ['PROHIBITED', 'HIGH_RISK'].includes(scanResult.riskAssessment.overallRisk) ||
             scanResult.complianceIssues.some((i: any) => i.severity === 'critical');
    
    case 'medium_risk':
      return ['PROHIBITED', 'HIGH_RISK', 'MEDIUM_RISK'].includes(scanResult.riskAssessment.overallRisk) ||
             scanResult.complianceIssues.some((i: any) => ['critical', 'major'].includes(i.severity));
    
    case 'any_issue':
      return scanResult.complianceIssues.length > 0 || scanResult.licenseConflicts.length > 0;
    
    default:
      return false;
  }
}

/**
 * Initialize license policy configuration
 */
async function initializeLicensePolicy(options: any): Promise<void> {
  console.log(chalk.cyan('🔧 Initializing License Policy Configuration...'));

  const orgName = options.orgName || await promptForInput('Organization name: ');
  const orgType = options.orgType || 'enterprise';
  
  let procurementGuidelines: 'strict' | 'moderate' | 'flexible' = 'moderate';
  if (options.strict) procurementGuidelines = 'strict';
  if (options.flexible) procurementGuidelines = 'flexible';

  const policy: NorwegianLicensePolicy = {
    organizationName: orgName,
    organizationType: orgType,
    procurementGuidelines,
    allowedLicenses: DEFAULT_NORWEGIAN_POLICY.allowedLicenses,
    reviewRequiredLicenses: DEFAULT_NORWEGIAN_POLICY.reviewRequiredLicenses,
    prohibitedLicenses: orgType === 'government' ? 
      [...DEFAULT_NORWEGIAN_POLICY.prohibitedLicenses, 'Commercial', 'Proprietary'] :
      DEFAULT_NORWEGIAN_POLICY.prohibitedLicenses,
    requireLegalReview: true,
    automaticScanning: true,
    generateSPDXReports: true,
    exportControlCompliance: orgType === 'government',
    gdprCompatibilityCheck: true,
    norwegianLanguageReporting: ['government', 'municipality'].includes(orgType),
    notificationSettings: {
      emailNotifications: true,
    },
  };

  const configPath = path.join(process.cwd(), 'license-policy.json');
  await fs.writeJson(configPath, policy, { spaces: 2 });

  console.log(chalk.green(`✅ License policy configuration created: ${configPath}`));
  console.log(chalk.gray('\nConfiguration details:'));
  console.log(chalk.gray(`  Organization: ${policy.organizationName} (${policy.organizationType})`));
  console.log(chalk.gray(`  Guidelines: ${policy.procurementGuidelines}`));
  console.log(chalk.gray(`  Allowed licenses: ${policy.allowedLicenses.length}`));
  console.log(chalk.gray(`  Prohibited licenses: ${policy.prohibitedLicenses.length}`));
  console.log(chalk.gray(`  Norwegian compliance: ${policy.norwegianLanguageReporting}`));
}

/**
 * Check license compatibility for a specific package
 */
async function checkPackageLicense(packageName: string, options: any): Promise<void> {
  console.log(chalk.cyan(`🔍 Checking license for package: ${packageName}`));

  try {
    // This would integrate with npm/yarn/pnpm to check package license
    // For now, we'll simulate the check
    console.log(chalk.yellow('Package license check functionality would be implemented here'));
    console.log(chalk.gray('This would query npm registry or local package.json for license information'));
    
  } catch (error) {
    console.error(chalk.red(`Error checking package ${packageName}:`), error);
    process.exit(1);
  }
}

/**
 * Manage approved package whitelist
 */
async function manageWhitelist(options: any): Promise<void> {
  const whitelistPath = path.join(process.cwd(), 'approved-packages.json');
  
  let whitelist: string[] = [];
  if (await fs.pathExists(whitelistPath)) {
    whitelist = await fs.readJson(whitelistPath);
  }

  if (options.add) {
    whitelist.push(...options.add);
    whitelist = [...new Set(whitelist)]; // Remove duplicates
    await fs.writeJson(whitelistPath, whitelist, { spaces: 2 });
    console.log(chalk.green(`✅ Added ${options.add.length} packages to whitelist`));
  }

  if (options.remove) {
    whitelist = whitelist.filter(pkg => !options.remove.includes(pkg));
    await fs.writeJson(whitelistPath, whitelist, { spaces: 2 });
    console.log(chalk.green(`✅ Removed ${options.remove.length} packages from whitelist`));
  }

  if (options.list || (!options.add && !options.remove)) {
    console.log(chalk.cyan('📋 Approved Package Whitelist:'));
    if (whitelist.length === 0) {
      console.log(chalk.gray('  No packages in whitelist'));
    } else {
      whitelist.forEach(pkg => console.log(`  • ${pkg}`));
    }
  }
}

/**
 * Generate detailed report from previous scan
 */
async function generateDetailedReport(scanId: string, options: any): Promise<void> {
  console.log(chalk.cyan(`📋 Generating detailed report for scan: ${scanId}`));
  
  // This would load previous scan results and generate requested format
  console.log(chalk.yellow('Detailed report generation functionality would be implemented here'));
  console.log(chalk.gray(`Format: ${options.format}`));
}

/**
 * Simple input prompt utility
 */
async function promptForInput(question: string): Promise<string> {
  // In a real implementation, this would use readline or inquirer
  console.log(question);
  return 'User Input'; // Placeholder
}

// Export for use in main CLI
export { createLicenseComplianceCommand };