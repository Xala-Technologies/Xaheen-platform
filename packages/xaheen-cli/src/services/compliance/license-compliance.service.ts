import * as fs from 'fs-extra';
import * as path from 'path';
import { z } from 'zod';
import chalk from 'chalk';
import { createHash } from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * License Compliance Service
 * Comprehensive license scanning, validation, and reporting for Norwegian enterprise compliance
 * Implements Norwegian government procurement guidelines and EU license compatibility requirements
 */

// License Types and Categories
export const LicenseTypeSchema = z.enum([
  // Permissive Licenses (Low Risk)
  'MIT',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'Apache-2.0',
  'ISC',
  'Unlicense',
  
  // Weak Copyleft (Medium Risk)
  'LGPL-2.1',
  'LGPL-3.0',
  'MPL-2.0',
  'EPL-2.0',
  'CDDL-1.0',
  
  // Strong Copyleft (High Risk)
  'GPL-2.0',
  'GPL-3.0',
  'AGPL-3.0',
  
  // Proprietary/Commercial
  'Commercial',
  'Proprietary',
  
  // Public Domain
  'CC0-1.0',
  'Public-Domain',
  
  // Restrictive/Problematic
  'SSPL-1.0', // Server Side Public License
  'BSL-1.1',  // Business Source License
  'BUSL-1.1', // Business Source License
  
  // Norwegian Specific
  'NLOD-2.0', // Norwegian License for Open Data
  'NLOD-1.0',
  
  // Unknown/Custom
  'UNKNOWN',
  'CUSTOM',
]);

export const LicenseRiskLevelSchema = z.enum([
  'ACCEPTABLE',    // Green - Safe for all use
  'LOW_RISK',      // Yellow - Minor considerations
  'MEDIUM_RISK',   // Orange - Review required
  'HIGH_RISK',     // Red - Legal review mandatory
  'PROHIBITED',    // Black - Cannot be used
]);

export const PackageManagerSchema = z.enum(['npm', 'yarn', 'pnpm', 'bun', 'composer', 'maven', 'gradle', 'pip']);

export type LicenseType = z.infer<typeof LicenseTypeSchema>;
export type LicenseRiskLevel = z.infer<typeof LicenseRiskLevelSchema>;
export type PackageManager = z.infer<typeof PackageManagerSchema>;

// License Compatibility Matrix
export const LicenseCompatibilitySchema = z.object({
  primaryLicense: LicenseTypeSchema,
  compatibleWith: z.array(LicenseTypeSchema),
  conflictsWith: z.array(LicenseTypeSchema),
  requiresAttribution: z.boolean(),
  allowsCommercialUse: z.boolean(),
  allowsModification: z.boolean(),
  allowsDistribution: z.boolean(),
  requiresSourceDisclosure: z.boolean(),
  norwegianGovernmentApproved: z.boolean(),
  euCompliant: z.boolean(),
});

// Norwegian Enterprise License Policy
export const NorwegianLicensePolicySchema = z.object({
  organizationName: z.string(),
  organizationType: z.enum(['government', 'municipality', 'enterprise', 'startup', 'ngo']),
  procurementGuidelines: z.enum(['strict', 'moderate', 'flexible']).default('moderate'),
  allowedLicenses: z.array(LicenseTypeSchema).default([
    'MIT', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0', 'ISC'
  ]),
  reviewRequiredLicenses: z.array(LicenseTypeSchema).default([
    'LGPL-2.1', 'LGPL-3.0', 'MPL-2.0', 'EPL-2.0'
  ]),
  prohibitedLicenses: z.array(LicenseTypeSchema).default([
    'GPL-2.0', 'GPL-3.0', 'AGPL-3.0', 'SSPL-1.0'
  ]),
  requireLegalReview: z.boolean().default(true),
  automaticScanning: z.boolean().default(true),
  generateSPDXReports: z.boolean().default(true),
  exportControlCompliance: z.boolean().default(true),
  gdprCompatibilityCheck: z.boolean().default(true),
  norwegianLanguageReporting: z.boolean().default(true),
  notificationSettings: z.object({
    legalTeamEmail: z.string().email().optional(),
    securityTeamEmail: z.string().email().optional(),
    slackWebhook: z.string().url().optional(),
    emailNotifications: z.boolean().default(true),
  }),
});

export type LicenseCompatibility = z.infer<typeof LicenseCompatibilitySchema>;
export type NorwegianLicensePolicy = z.infer<typeof NorwegianLicensePolicySchema>;

// License Detection Results
export interface DetectedLicense {
  name: string;
  version?: string;
  path: string;
  licenses: LicenseType[];
  licenseFiles: string[];
  confidence: number; // 0-100
  source: 'package.json' | 'license-file' | 'source-header' | 'registry';
  riskLevel: LicenseRiskLevel;
  parentPackage?: string;
  isTransitive: boolean;
}

export interface LicenseConflict {
  id: string;
  severity: 'critical' | 'major' | 'minor';
  description: string;
  conflictingLicenses: LicenseType[];
  affectedPackages: string[];
  resolution: string[];
  norwegianLegalImplications: string;
}

export interface LicenseScanResult {
  scanId: string;
  scanDate: Date;
  projectPath: string;
  packageManager: PackageManager[];
  totalPackages: number;
  licensedPackages: number;
  unlicensedPackages: number;
  detectedLicenses: DetectedLicense[];
  licenseConflicts: LicenseConflict[];
  complianceIssues: LicenseComplianceIssue[];
  riskAssessment: LicenseRiskAssessment;
  recommendedActions: LicenseRecommendation[];
  spdxDocument?: string;
  attributionDocument?: string;
}

export interface LicenseComplianceIssue {
  id: string;
  type: 'prohibited_license' | 'license_conflict' | 'missing_license' | 'attribution_required' | 'export_control';
  severity: 'critical' | 'major' | 'minor';
  packageName: string;
  license: LicenseType;
  description: string;
  norwegianLegalReference: string;
  remediation: string[];
  deadline: Date;
  status: 'open' | 'acknowledged' | 'resolved' | 'waived';
}

export interface LicenseRiskAssessment {
  overallRisk: LicenseRiskLevel;
  copyleftRisk: number; // 0-100
  commercialRisk: number; // 0-100
  exportControlRisk: number; // 0-100
  norwegianComplianceRisk: number; // 0-100
  riskFactors: string[];
  mitigationStrategies: string[];
}

export interface LicenseRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  implementation: string[];
  estimatedEffort: string;
  norwegianContext: string;
}

export class LicenseComplianceService {
  private policy: NorwegianLicensePolicy;
  private licenseCompatibilityMatrix: Map<LicenseType, LicenseCompatibility>;
  private scanHistory: LicenseScanResult[] = [];

  constructor(policy: NorwegianLicensePolicy) {
    this.policy = NorwegianLicensePolicySchema.parse(policy);
    this.licenseCompatibilityMatrix = this.initializeLicenseCompatibilityMatrix();
  }

  /**
   * Perform comprehensive license scan of project
   */
  async performLicenseScan(projectPath: string, options: {
    includeTransitive?: boolean;
    scanSourceHeaders?: boolean;
    generateSPDX?: boolean;
    generateAttribution?: boolean;
    deepScan?: boolean;
  } = {}): Promise<LicenseScanResult> {
    const scanId = createHash('sha256')
      .update(`${Date.now()}-${projectPath}-LICENSE`)
      .digest('hex')
      .substring(0, 16);

    console.log(chalk.cyan(`📄 Starting License Compliance Scan (${scanId})`));
    console.log(chalk.gray(`Project: ${projectPath}`));
    console.log(chalk.gray(`Organization: ${this.policy.organizationName}`));

    // 1. Detect package managers
    const packageManagers = await this.detectPackageManagers(projectPath);
    console.log(chalk.gray(`Package Managers: ${packageManagers.join(', ')}`));

    // 2. Scan dependencies
    const detectedLicenses = await this.scanDependencies(projectPath, packageManagers, {
      includeTransitive: options.includeTransitive !== false,
      deepScan: options.deepScan || false,
    });

    // 3. Scan source code headers if requested
    if (options.scanSourceHeaders) {
      const sourceLicenses = await this.scanSourceHeaders(projectPath);
      detectedLicenses.push(...sourceLicenses);
    }

    // 4. Analyze license conflicts
    const licenseConflicts = this.analyzeLicenseConflicts(detectedLicenses);

    // 5. Assess compliance issues
    const complianceIssues = this.assessComplianceIssues(detectedLicenses);

    // 6. Perform risk assessment
    const riskAssessment = this.performRiskAssessment(detectedLicenses, licenseConflicts);

    // 7. Generate recommendations
    const recommendedActions = this.generateRecommendations(detectedLicenses, complianceIssues, riskAssessment);

    // 8. Generate SPDX document if requested
    let spdxDocument: string | undefined;
    if (options.generateSPDX && this.policy.generateSPDXReports) {
      spdxDocument = await this.generateSPDXDocument(detectedLicenses, projectPath);
    }

    // 9. Generate attribution document if requested
    let attributionDocument: string | undefined;
    if (options.generateAttribution) {
      attributionDocument = await this.generateAttributionDocument(detectedLicenses, projectPath);
    }

    const scanResult: LicenseScanResult = {
      scanId,
      scanDate: new Date(),
      projectPath,
      packageManager: packageManagers,
      totalPackages: detectedLicenses.length,
      licensedPackages: detectedLicenses.filter(dl => dl.licenses.length > 0).length,
      unlicensedPackages: detectedLicenses.filter(dl => dl.licenses.length === 0).length,
      detectedLicenses,
      licenseConflicts,
      complianceIssues,
      riskAssessment,
      recommendedActions,
      spdxDocument,
      attributionDocument,
    };

    this.scanHistory.push(scanResult);

    // Display results
    this.displayScanResults(scanResult);

    // Send notifications if configured
    await this.sendNotifications(scanResult);

    return scanResult;
  }

  /**
   * Detect package managers in project
   */
  private async detectPackageManagers(projectPath: string): Promise<PackageManager[]> {
    const managers: PackageManager[] = [];
    
    const managerFiles = {
      npm: ['package.json', 'package-lock.json'],
      yarn: ['yarn.lock'],
      pnpm: ['pnpm-lock.yaml'],
      bun: ['bun.lockb'],
      composer: ['composer.json', 'composer.lock'],
      maven: ['pom.xml'],
      gradle: ['build.gradle', 'build.gradle.kts'],
      pip: ['requirements.txt', 'Pipfile', 'pyproject.toml'],
    };

    for (const [manager, files] of Object.entries(managerFiles)) {
      for (const file of files) {
        if (await fs.pathExists(path.join(projectPath, file))) {
          managers.push(manager as PackageManager);
          break;
        }
      }
    }

    return managers;
  }

  /**
   * Scan dependencies for license information
   */
  private async scanDependencies(
    projectPath: string, 
    packageManagers: PackageManager[],
    options: { includeTransitive: boolean; deepScan: boolean }
  ): Promise<DetectedLicense[]> {
    const detectedLicenses: DetectedLicense[] = [];

    for (const manager of packageManagers) {
      try {
        const licenses = await this.scanPackageManager(projectPath, manager, options);
        detectedLicenses.push(...licenses);
      } catch (error) {
        console.warn(chalk.yellow(`Warning: Failed to scan ${manager}: ${error}`));
      }
    }

    return detectedLicenses;
  }

  /**
   * Scan specific package manager
   */
  private async scanPackageManager(
    projectPath: string,
    manager: PackageManager,
    options: { includeTransitive: boolean; deepScan: boolean }
  ): Promise<DetectedLicense[]> {
    const detectedLicenses: DetectedLicense[] = [];

    switch (manager) {
      case 'npm':
      case 'yarn':
      case 'pnpm':
        return this.scanNodeDependencies(projectPath, manager, options);
      
      case 'composer':
        return this.scanComposerDependencies(projectPath, options);
      
      case 'pip':
        return this.scanPythonDependencies(projectPath, options);
        
      default:
        console.warn(chalk.yellow(`Package manager ${manager} not fully supported yet`));
        return [];
    }
  }

  /**
   * Scan Node.js dependencies
   */
  private async scanNodeDependencies(
    projectPath: string,
    manager: PackageManager,
    options: { includeTransitive: boolean; deepScan: boolean }
  ): Promise<DetectedLicense[]> {
    const detectedLicenses: DetectedLicense[] = [];

    try {
      // Read package.json
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (!await fs.pathExists(packageJsonPath)) {
        return [];
      }

      const packageJson = await fs.readJson(packageJsonPath);
      const dependencies = {
        ...packageJson.dependencies || {},
        ...packageJson.devDependencies || {},
        ...(options.includeTransitive ? packageJson.peerDependencies || {} : {}),
      };

      // Use license-checker for detailed analysis
      if (options.deepScan) {
        try {
          const { stdout } = await execAsync(`npx license-checker --json --start ${projectPath}`);
          const licenseData = JSON.parse(stdout);
          
          for (const [packageName, info] of Object.entries(licenseData as Record<string, any>)) {
            const [name, version] = packageName.split('@');
            
            detectedLicenses.push({
              name,
              version,
              path: info.path || '',
              licenses: this.parseLicenseString(info.licenses || 'UNKNOWN'),
              licenseFiles: info.licenseFile ? [info.licenseFile] : [],
              confidence: info.licenseFile ? 95 : 60,
              source: info.licenseFile ? 'license-file' : 'package.json',
              riskLevel: this.assessLicenseRisk(this.parseLicenseString(info.licenses || 'UNKNOWN')),
              isTransitive: !dependencies[name],
            });
          }
        } catch (error) {
          console.warn(chalk.yellow('Deep scan failed, falling back to basic scan'));
        }
      }

      // Basic scan from package.json
      if (detectedLicenses.length === 0) {
        for (const [name, version] of Object.entries(dependencies)) {
          const nodeModulesPath = path.join(projectPath, 'node_modules', name);
          if (await fs.pathExists(nodeModulesPath)) {
            const depPackageJson = path.join(nodeModulesPath, 'package.json');
            if (await fs.pathExists(depPackageJson)) {
              const depInfo = await fs.readJson(depPackageJson);
              const licenses = this.parseLicenseString(depInfo.license || 'UNKNOWN');
              
              detectedLicenses.push({
                name,
                version: version as string,
                path: nodeModulesPath,
                licenses,
                licenseFiles: await this.findLicenseFiles(nodeModulesPath),
                confidence: depInfo.license ? 90 : 30,
                source: 'package.json',
                riskLevel: this.assessLicenseRisk(licenses),
                isTransitive: false,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error(chalk.red(`Error scanning Node dependencies: ${error}`));
    }

    return detectedLicenses;
  }

  /**
   * Scan PHP Composer dependencies
   */
  private async scanComposerDependencies(
    projectPath: string,
    options: { includeTransitive: boolean; deepScan: boolean }
  ): Promise<DetectedLicense[]> {
    const detectedLicenses: DetectedLicense[] = [];

    try {
      const composerJsonPath = path.join(projectPath, 'composer.json');
      if (!await fs.pathExists(composerJsonPath)) {
        return [];
      }

      const composerJson = await fs.readJson(composerJsonPath);
      const dependencies = {
        ...composerJson.require || {},
        ...composerJson['require-dev'] || {},
      };

      for (const [name, version] of Object.entries(dependencies)) {
        if (name.includes('php') && !name.includes('/')) continue; // Skip PHP itself
        
        const vendorPath = path.join(projectPath, 'vendor', name);
        if (await fs.pathExists(vendorPath)) {
          const depComposerJson = path.join(vendorPath, 'composer.json');
          if (await fs.pathExists(depComposerJson)) {
            const depInfo = await fs.readJson(depComposerJson);
            const licenses = this.parseLicenseArray(depInfo.license || ['UNKNOWN']);
            
            detectedLicenses.push({
              name,
              version: version as string,
              path: vendorPath,
              licenses,
              licenseFiles: await this.findLicenseFiles(vendorPath),
              confidence: depInfo.license ? 90 : 30,
              source: 'package.json',
              riskLevel: this.assessLicenseRisk(licenses),
              isTransitive: false,
            });
          }
        }
      }
    } catch (error) {
      console.error(chalk.red(`Error scanning Composer dependencies: ${error}`));
    }

    return detectedLicenses;
  }

  /**
   * Scan Python dependencies
   */
  private async scanPythonDependencies(
    projectPath: string,
    options: { includeTransitive: boolean; deepScan: boolean }
  ): Promise<DetectedLicense[]> {
    const detectedLicenses: DetectedLicense[] = [];

    try {
      // Try requirements.txt first
      const requirementsPath = path.join(projectPath, 'requirements.txt');
      if (await fs.pathExists(requirementsPath)) {
        const requirements = await fs.readFile(requirementsPath, 'utf-8');
        const packages = requirements.split('\n')
          .filter(line => line.trim() && !line.startsWith('#'))
          .map(line => line.split('==')[0].split('>=')[0].split('<=')[0].trim());

        for (const packageName of packages) {
          // Use pip-licenses tool if available
          try {
            const { stdout } = await execAsync(`pip-licenses --format=json --packages ${packageName}`);
            const licenseData = JSON.parse(stdout);
            
            for (const pkg of licenseData) {
              const licenses = this.parseLicenseString(pkg.License || 'UNKNOWN');
              detectedLicenses.push({
                name: pkg.Name,
                version: pkg.Version,
                path: '',
                licenses,
                licenseFiles: [],
                confidence: pkg.License && pkg.License !== 'UNKNOWN' ? 85 : 30,
                source: 'registry',
                riskLevel: this.assessLicenseRisk(licenses),
                isTransitive: false,
              });
            }
          } catch (error) {
            // Fallback to basic detection
            detectedLicenses.push({
              name: packageName,
              version: '',
              path: '',
              licenses: ['UNKNOWN'],
              licenseFiles: [],
              confidence: 10,
              source: 'package.json',
              riskLevel: 'MEDIUM_RISK',
              isTransitive: false,
            });
          }
        }
      }
    } catch (error) {
      console.error(chalk.red(`Error scanning Python dependencies: ${error}`));
    }

    return detectedLicenses;
  }

  /**
   * Scan source code headers for license declarations
   */
  private async scanSourceHeaders(projectPath: string): Promise<DetectedLicense[]> {
    const detectedLicenses: DetectedLicense[] = [];
    const sourceExtensions = ['.js', '.ts', '.jsx', '.tsx', '.php', '.py', '.java', '.cs', '.cpp', '.c', '.h'];

    try {
      const { stdout } = await execAsync(`find "${projectPath}" -type f \\( ${sourceExtensions.map(ext => `-name "*${ext}"`).join(' -o ')} \\) | head -1000`);
      const files = stdout.trim().split('\n').filter(f => f && !f.includes('node_modules') && !f.includes('vendor'));

      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const header = content.substring(0, 2000); // First 2KB
          
          const licenses = this.extractLicensesFromHeader(header);
          if (licenses.length > 0) {
            detectedLicenses.push({
              name: path.basename(file),
              path: file,
              licenses,
              licenseFiles: [],
              confidence: 75,
              source: 'source-header',
              riskLevel: this.assessLicenseRisk(licenses),
              isTransitive: false,
            });
          }
        } catch (error) {
          // Skip unreadable files
        }
      }
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Source header scan failed: ${error}`));
    }

    return detectedLicenses;
  }

  /**
   * Find license files in a directory
   */
  private async findLicenseFiles(dirPath: string): Promise<string[]> {
    const licenseFiles: string[] = [];
    const licenseFilenames = ['LICENSE', 'LICENCE', 'LICENSE.txt', 'LICENSE.md', 'COPYING', 'COPYRIGHT'];

    for (const filename of licenseFilenames) {
      const filePath = path.join(dirPath, filename);
      if (await fs.pathExists(filePath)) {
        licenseFiles.push(filePath);
      }
    }

    return licenseFiles;
  }

  /**
   * Parse license string into standardized types
   */
  private parseLicenseString(licenseStr: string): LicenseType[] {
    if (!licenseStr || licenseStr === 'UNKNOWN') {
      return ['UNKNOWN'];
    }

    const licenses: LicenseType[] = [];
    const normalizedStr = licenseStr.toUpperCase().replace(/[^A-Z0-9.-]/g, ' ');

    // Map common license patterns
    const licensePatterns: Record<string, LicenseType> = {
      'MIT': 'MIT',
      'BSD': 'BSD-3-Clause',
      'BSD-2': 'BSD-2-Clause',
      'BSD-3': 'BSD-3-Clause',
      'APACHE': 'Apache-2.0',
      'APACHE-2': 'Apache-2.0',
      'GPL-2': 'GPL-2.0',
      'GPL-3': 'GPL-3.0',
      'LGPL-2': 'LGPL-2.1',
      'LGPL-3': 'LGPL-3.0',
      'AGPL': 'AGPL-3.0',
      'MPL': 'MPL-2.0',
      'ISC': 'ISC',
      'UNLICENSE': 'Unlicense',
      'CC0': 'CC0-1.0',
      'PROPRIETARY': 'Proprietary',
      'COMMERCIAL': 'Commercial',
    };

    for (const [pattern, license] of Object.entries(licensePatterns)) {
      if (normalizedStr.includes(pattern)) {
        licenses.push(license);
      }
    }

    return licenses.length > 0 ? licenses : ['UNKNOWN'];
  }

  /**
   * Parse license array (for Composer)
   */
  private parseLicenseArray(licenseArray: string[]): LicenseType[] {
    const licenses: LicenseType[] = [];
    
    for (const licenseStr of licenseArray) {
      licenses.push(...this.parseLicenseString(licenseStr));
    }

    return licenses.length > 0 ? licenses : ['UNKNOWN'];
  }

  /**
   * Extract licenses from source code headers
   */
  private extractLicensesFromHeader(header: string): LicenseType[] {
    const licenses: LicenseType[] = [];
    const headerUpper = header.toUpperCase();

    const patterns = [
      { pattern: /MIT LICENSE|LICENSE.*MIT/i, license: 'MIT' as LicenseType },
      { pattern: /APACHE LICENSE|LICENSE.*APACHE/i, license: 'Apache-2.0' as LicenseType },
      { pattern: /BSD LICENSE/i, license: 'BSD-3-Clause' as LicenseType },
      { pattern: /GPL.*VERSION 2/i, license: 'GPL-2.0' as LicenseType },
      { pattern: /GPL.*VERSION 3/i, license: 'GPL-3.0' as LicenseType },
      { pattern: /LGPL/i, license: 'LGPL-3.0' as LicenseType },
      { pattern: /PROPRIETARY|ALL RIGHTS RESERVED/i, license: 'Proprietary' as LicenseType },
    ];

    for (const { pattern, license } of patterns) {
      if (pattern.test(header)) {
        licenses.push(license);
      }
    }

    return licenses;
  }

  /**
   * Assess license risk level
   */
  private assessLicenseRisk(licenses: LicenseType[]): LicenseRiskLevel {
    if (licenses.includes('AGPL-3.0') || licenses.includes('SSPL-1.0')) {
      return 'PROHIBITED';
    }

    if (licenses.includes('GPL-2.0') || licenses.includes('GPL-3.0')) {
      return this.policy.prohibitedLicenses.some(l => licenses.includes(l)) ? 'PROHIBITED' : 'HIGH_RISK';
    }

    if (licenses.some(l => ['LGPL-2.1', 'LGPL-3.0', 'MPL-2.0'].includes(l))) {
      return 'MEDIUM_RISK';
    }

    if (licenses.includes('UNKNOWN') || licenses.includes('CUSTOM')) {
      return 'MEDIUM_RISK';
    }

    if (licenses.some(l => this.policy.allowedLicenses.includes(l))) {
      return 'ACCEPTABLE';
    }

    return 'LOW_RISK';
  }

  /**
   * Analyze license conflicts
   */
  private analyzeLicenseConflicts(detectedLicenses: DetectedLicense[]): LicenseConflict[] {
    const conflicts: LicenseConflict[] = [];
    const licenseGroups = new Map<string, DetectedLicense[]>();

    // Group licenses by type
    for (const detected of detectedLicenses) {
      for (const license of detected.licenses) {
        if (!licenseGroups.has(license)) {
          licenseGroups.set(license, []);
        }
        licenseGroups.get(license)!.push(detected);
      }
    }

    // Check for GPL contamination
    const gplLicenses = ['GPL-2.0', 'GPL-3.0', 'AGPL-3.0'];
    const hasGPL = gplLicenses.some(gpl => licenseGroups.has(gpl));
    
    if (hasGPL) {
      const gplPackages = gplLicenses.flatMap(gpl => 
        licenseGroups.get(gpl)?.map(d => d.name) || []
      );
      
      const proprietaryPackages = licenseGroups.get('Proprietary')?.map(d => d.name) || [];
      
      if (proprietaryPackages.length > 0) {
        conflicts.push({
          id: `CONFLICT-GPL-PROPRIETARY-${Date.now()}`,
          severity: 'critical',
          description: 'GPL license contamination detected with proprietary code',
          conflictingLicenses: [...gplLicenses.filter(gpl => licenseGroups.has(gpl)) as LicenseType[], 'Proprietary'],
          affectedPackages: [...gplPackages, ...proprietaryPackages],
          resolution: [
            'Remove GPL-licensed dependencies',
            'Replace with MIT/Apache licensed alternatives',
            'Obtain commercial licenses for proprietary components',
            'Consult legal team for license compatibility review'
          ],
          norwegianLegalImplications: 'GPL-kontaminering kan kreve frigivelse av proprietær kildekode under norsk opphavsrett',
        });
      }
    }

    // Check for incompatible license combinations
    const incompatiblePairs: [LicenseType, LicenseType][] = [
      ['MIT', 'GPL-2.0'],
      ['Apache-2.0', 'GPL-2.0'],
      ['BSD-3-Clause', 'GPL-2.0'],
      ['LGPL-3.0', 'GPL-2.0'],
      ['MPL-2.0', 'GPL-2.0'],
    ];

    for (const [license1, license2] of incompatiblePairs) {
      if (licenseGroups.has(license1) && licenseGroups.has(license2)) {
        conflicts.push({
          id: `CONFLICT-${license1}-${license2}-${Date.now()}`,
          severity: 'major',
          description: `Incompatible license combination: ${license1} and ${license2}`,
          conflictingLicenses: [license1, license2],
          affectedPackages: [
            ...(licenseGroups.get(license1)?.map(d => d.name) || []),
            ...(licenseGroups.get(license2)?.map(d => d.name) || [])
          ],
          resolution: [
            'Choose packages with compatible licenses',
            'Upgrade GPL-2.0 packages to GPL-3.0 if available',
            'Obtain dual-license versions where possible'
          ],
          norwegianLegalImplications: 'Inkompatible lisenser kan skape juridisk usikkerhet under norsk lov',
        });
      }
    }

    return conflicts;
  }

  /**
   * Assess compliance issues
   */
  private assessComplianceIssues(detectedLicenses: DetectedLicense[]): LicenseComplianceIssue[] {
    const issues: LicenseComplianceIssue[] = [];
    let issueCounter = 1;

    for (const detected of detectedLicenses) {
      // Check for prohibited licenses
      for (const license of detected.licenses) {
        if (this.policy.prohibitedLicenses.includes(license)) {
          issues.push({
            id: `COMPLIANCE-${String(issueCounter++).padStart(3, '0')}`,
            type: 'prohibited_license',
            severity: 'critical',
            packageName: detected.name,
            license,
            description: `Package uses prohibited license: ${license}`,
            norwegianLegalReference: 'Norske offentlige anskaffelser - Veileder for bruk av åpen kildekode',
            remediation: [
              `Remove package ${detected.name}`,
              'Find alternative with approved license',
              'Obtain commercial license if available',
              'Request legal waiver with business justification'
            ],
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            status: 'open',
          });
        }

        // Check for missing licenses
        if (license === 'UNKNOWN') {
          issues.push({
            id: `COMPLIANCE-${String(issueCounter++).padStart(3, '0')}`,
            type: 'missing_license',
            severity: 'major',
            packageName: detected.name,
            license,
            description: `Package has unknown or missing license information`,
            norwegianLegalReference: 'Åndsverkloven § 2 - Kravet til opphavsrettsklarhet',
            remediation: [
              'Contact package maintainer for license clarification',
              'Review package source code for license headers',
              'Consider replacing with clearly licensed alternative',
              'Document risk acceptance if package is critical'
            ],
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            status: 'open',
          });
        }

        // Check for attribution requirements
        if (['BSD-2-Clause', 'BSD-3-Clause', 'MIT', 'Apache-2.0'].includes(license)) {
          const hasLicenseFile = detected.licenseFiles.length > 0;
          if (!hasLicenseFile) {
            issues.push({
              id: `COMPLIANCE-${String(issueCounter++).padStart(3, '0')}`,
              type: 'attribution_required',
              severity: 'minor',
              packageName: detected.name,
              license,
              description: `Package requires attribution but license file not found`,
              norwegianLegalReference: 'Åndsverkloven § 11 - Kreditering av opphavsmann',
              remediation: [
                'Include package license in attribution file',
                'Add to NOTICES or THIRD-PARTY-LICENSES file',
                'Ensure license text is included in distribution'
              ],
              deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
              status: 'open',
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Perform risk assessment
   */
  private performRiskAssessment(
    detectedLicenses: DetectedLicense[],
    conflicts: LicenseConflict[]
  ): LicenseRiskAssessment {
    let copyleftRisk = 0;
    let commercialRisk = 0;
    let exportControlRisk = 0;
    let norwegianComplianceRisk = 0;

    const riskFactors: string[] = [];
    const mitigationStrategies: string[] = [];

    // Calculate copyleft risk
    const copyleftLicenses = detectedLicenses.filter(dl => 
      dl.licenses.some(l => ['GPL-2.0', 'GPL-3.0', 'AGPL-3.0', 'LGPL-2.1', 'LGPL-3.0'].includes(l))
    );
    copyleftRisk = Math.min(100, (copyleftLicenses.length / detectedLicenses.length) * 100);

    if (copyleftRisk > 10) {
      riskFactors.push(`${copyleftRisk.toFixed(1)}% of packages use copyleft licenses`);
      mitigationStrategies.push('Review copyleft license implications for distribution');
    }

    // Calculate commercial risk
    const commercialLicenses = detectedLicenses.filter(dl => 
      dl.licenses.some(l => ['Commercial', 'Proprietary'].includes(l))
    );
    commercialRisk = Math.min(100, (commercialLicenses.length / detectedLicenses.length) * 100);

    if (commercialRisk > 5) {
      riskFactors.push(`${commercialRisk.toFixed(1)}% of packages use commercial licenses`);
      mitigationStrategies.push('Verify commercial license compliance and payment');
    }

    // Export control risk (simplified)
    if (this.policy.exportControlCompliance) {
      const cryptographicPackages = detectedLicenses.filter(dl => 
        dl.name.toLowerCase().includes('crypto') || 
        dl.name.toLowerCase().includes('ssl') ||
        dl.name.toLowerCase().includes('tls')
      );
      exportControlRisk = Math.min(100, (cryptographicPackages.length / Math.max(1, detectedLicenses.length)) * 50);

      if (exportControlRisk > 10) {
        riskFactors.push('Contains cryptographic components requiring export control review');
        mitigationStrategies.push('Review export control regulations for cryptographic components');
      }
    }

    // Norwegian compliance risk
    const prohibitedCount = detectedLicenses.filter(dl => 
      dl.licenses.some(l => this.policy.prohibitedLicenses.includes(l))
    ).length;
    const unknownCount = detectedLicenses.filter(dl => 
      dl.licenses.some(l => l === 'UNKNOWN')
    ).length;

    norwegianComplianceRisk = Math.min(100, 
      ((prohibitedCount * 50) + (unknownCount * 20) + (conflicts.length * 30)) / Math.max(1, detectedLicenses.length)
    );

    if (norwegianComplianceRisk > 20) {
      riskFactors.push('High Norwegian compliance risk due to prohibited or unknown licenses');
      mitigationStrategies.push('Prioritize Norwegian government procurement compliance');
    }

    // Determine overall risk
    const overallRiskScore = Math.max(copyleftRisk, commercialRisk, exportControlRisk, norwegianComplianceRisk);
    let overallRisk: LicenseRiskLevel;

    if (overallRiskScore >= 80 || conflicts.some(c => c.severity === 'critical')) {
      overallRisk = 'PROHIBITED';
    } else if (overallRiskScore >= 60 || conflicts.some(c => c.severity === 'major')) {
      overallRisk = 'HIGH_RISK';
    } else if (overallRiskScore >= 30) {
      overallRisk = 'MEDIUM_RISK';
    } else if (overallRiskScore >= 10) {
      overallRisk = 'LOW_RISK';
    } else {
      overallRisk = 'ACCEPTABLE';
    }

    return {
      overallRisk,
      copyleftRisk,
      commercialRisk,
      exportControlRisk,
      norwegianComplianceRisk,
      riskFactors,
      mitigationStrategies,
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    detectedLicenses: DetectedLicense[],
    complianceIssues: LicenseComplianceIssue[],
    riskAssessment: LicenseRiskAssessment
  ): LicenseRecommendation[] {
    const recommendations: LicenseRecommendation[] = [];

    // Critical compliance recommendation
    const criticalIssues = complianceIssues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push({
        id: 'LIC-REC-001',
        priority: 'critical',
        category: 'Critical Compliance',
        title: 'Address Critical License Compliance Issues',
        description: `${criticalIssues.length} critical license compliance issues require immediate attention.`,
        implementation: [
          'Review all packages with prohibited licenses',
          'Remove or replace non-compliant packages',
          'Obtain legal approval for any exceptions',
          'Update procurement policies to prevent future issues'
        ],
        estimatedEffort: '1-2 weeks',
        norwegianContext: 'Kritiske lisenskonflikter kan påvirke norske offentlige anskaffelser og compliance',
      });
    }

    // Attribution recommendation
    const attributionIssues = complianceIssues.filter(i => i.type === 'attribution_required');
    if (attributionIssues.length > 0) {
      recommendations.push({
        id: 'LIC-REC-002',
        priority: 'high',
        category: 'Attribution',
        title: 'Generate Attribution Documentation',
        description: `${attributionIssues.length} packages require proper attribution documentation.`,
        implementation: [
          'Generate comprehensive THIRD-PARTY-NOTICES file',
          'Include all required license texts',
          'Automate attribution generation in build process',
          'Review attribution requirements with legal team'
        ],
        estimatedEffort: '3-5 days',
        norwegianContext: 'Opphavsrett krever korrekt kreditering av lisensgivere',
      });
    }

    // Risk mitigation recommendation
    if (riskAssessment.overallRisk === 'HIGH_RISK' || riskAssessment.overallRisk === 'PROHIBITED') {
      recommendations.push({
        id: 'LIC-REC-003',
        priority: 'high',
        category: 'Risk Mitigation',
        title: 'Implement License Risk Mitigation Strategy',
        description: 'High license risk requires comprehensive mitigation strategy.',
        implementation: riskAssessment.mitigationStrategies.concat([
          'Establish approved package whitelist',
          'Implement automated license scanning in CI/CD',
          'Provide developer training on license compliance',
          'Regular legal review of license policies'
        ]),
        estimatedEffort: '2-4 weeks',
        norwegianContext: 'Reduser juridisk risiko for norske virksomheter og offentlige anskaffelser',
      });
    }

    // Norwegian-specific recommendation
    if (this.policy.organizationType === 'government' || this.policy.organizationType === 'municipality') {
      recommendations.push({
        id: 'LIC-REC-004',
        priority: 'medium',
        category: 'Norwegian Compliance',
        title: 'Enhance Norwegian Government Compliance',
        description: 'Strengthen compliance with Norwegian government procurement guidelines.',
        implementation: [
          'Align with Direktoratet for forvaltning og økonomistyring (DFØ) guidelines',
          'Implement NLOD (Norwegian License for Open Data) where applicable',
          'Establish communication with Norwegian procurement authorities',
          'Create Norwegian language compliance documentation'
        ],
        estimatedEffort: '1-2 weeks',
        norwegianContext: 'Sikrer overholdelse av norske offentlige anskaffelsesregler og DFØ-retningslinjer',
      });
    }

    return recommendations;
  }

  /**
   * Generate SPDX document
   */
  private async generateSPDXDocument(detectedLicenses: DetectedLicense[], projectPath: string): Promise<string> {
    const spdxPath = path.join(projectPath, 'license-compliance', 'SPDX-License-Report.json');
    await fs.ensureDir(path.dirname(spdxPath));

    const spdxDocument = {
      spdxVersion: 'SPDX-2.3',
      dataLicense: 'CC0-1.0',
      SPDXID: 'SPDXRef-DOCUMENT',
      name: `License Report for ${path.basename(projectPath)}`,
      documentNamespace: `https://xaheen.com/spdx/${createHash('sha256').update(projectPath).digest('hex')}`,
      creationInfo: {
        created: new Date().toISOString(),
        creators: ['Tool: Xaheen License Compliance Service'],
        licenseListVersion: '3.21',
      },
      packages: detectedLicenses.map((dl, index) => ({
        SPDXID: `SPDXRef-Package-${index + 1}`,
        name: dl.name,
        versionInfo: dl.version || 'unknown',
        packageFileName: dl.path,
        supplier: 'NOASSERTION',
        downloadLocation: 'NOASSERTION',
        filesAnalyzed: false,
        licenseConcluded: dl.licenses.length > 0 ? dl.licenses.join(' OR ') : 'NOASSERTION',
        licenseDeclared: dl.licenses.length > 0 ? dl.licenses.join(' OR ') : 'NOASSERTION',
        copyrightText: 'NOASSERTION',
        comment: `Risk Level: ${dl.riskLevel}, Confidence: ${dl.confidence}%, Source: ${dl.source}`,
      })),
    };

    await fs.writeJson(spdxPath, spdxDocument, { spaces: 2 });
    console.log(chalk.green(`📋 SPDX document generated: ${spdxPath}`));
    
    return spdxPath;
  }

  /**
   * Generate attribution document
   */
  private async generateAttributionDocument(detectedLicenses: DetectedLicense[], projectPath: string): Promise<string> {
    const attributionPath = path.join(projectPath, 'license-compliance', 'THIRD-PARTY-NOTICES.md');
    await fs.ensureDir(path.dirname(attributionPath));

    const attributionPackages = detectedLicenses.filter(dl => 
      dl.licenses.some(l => ['MIT', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0'].includes(l))
    );

    let attribution = `# Third-Party Notices

This project incorporates components from third-party projects. The following is a list of such components along with their licenses:

Generated on: ${new Date().toISOString()}
Organization: ${this.policy.organizationName}

---

`;

    for (const pkg of attributionPackages) {
      attribution += `## ${pkg.name}${pkg.version ? ` v${pkg.version}` : ''}

**License(s):** ${pkg.licenses.join(', ')}  
**Source:** ${pkg.source}  
**Risk Level:** ${pkg.riskLevel}  

`;

      // Include license file content if available
      for (const licenseFile of pkg.licenseFiles) {
        try {
          const licenseContent = await fs.readFile(licenseFile, 'utf-8');
          attribution += `**License Text:**
\`\`\`
${licenseContent.substring(0, 5000)}${licenseContent.length > 5000 ? '\n[...truncated...]' : ''}
\`\`\`

`;
        } catch (error) {
          attribution += `**License Text:** Could not read license file at ${licenseFile}

`;
        }
      }

      attribution += '---\n\n';
    }

    attribution += `
## Norwegian Compliance Note

This attribution document is generated in compliance with Norwegian copyright law (Åndsverkloven) and government procurement guidelines. All listed components have been reviewed for license compatibility and attribution requirements.

For questions regarding license compliance, contact: ${this.policy.notificationSettings.legalTeamEmail || 'legal@organization.no'}

Generated by Xaheen License Compliance Service
`;

    await fs.writeFile(attributionPath, attribution);
    console.log(chalk.green(`📋 Attribution document generated: ${attributionPath}`));
    
    return attributionPath;
  }

  /**
   * Display scan results
   */
  private displayScanResults(scanResult: LicenseScanResult): void {
    console.log(chalk.cyan('\n📄 License Compliance Scan Results\n'));

    // Overall statistics
    console.log(chalk.cyan('📊 Overview:'));
    console.log(chalk.gray(`  Total Packages: ${scanResult.totalPackages}`));
    console.log(chalk.gray(`  Licensed Packages: ${scanResult.licensedPackages}`));
    console.log(chalk.red(`  Unlicensed Packages: ${scanResult.unlicensedPackages}`));
    console.log(chalk.gray(`  Package Managers: ${scanResult.packageManager.join(', ')}`));

    // Risk assessment
    const riskColor = 
      scanResult.riskAssessment.overallRisk === 'PROHIBITED' ? chalk.red :
      scanResult.riskAssessment.overallRisk === 'HIGH_RISK' ? chalk.red :
      scanResult.riskAssessment.overallRisk === 'MEDIUM_RISK' ? chalk.yellow :
      scanResult.riskAssessment.overallRisk === 'LOW_RISK' ? chalk.blue :
      chalk.green;

    console.log(chalk.cyan('\n⚠️  Risk Assessment:'));
    console.log(`  Overall Risk: ${riskColor(scanResult.riskAssessment.overallRisk)}`);
    console.log(chalk.gray(`  Copyleft Risk: ${scanResult.riskAssessment.copyleftRisk.toFixed(1)}%`));
    console.log(chalk.gray(`  Commercial Risk: ${scanResult.riskAssessment.commercialRisk.toFixed(1)}%`));
    console.log(chalk.gray(`  Norwegian Compliance Risk: ${scanResult.riskAssessment.norwegianComplianceRisk.toFixed(1)}%`));

    // Compliance issues
    console.log(chalk.cyan('\n📋 Compliance Issues:'));
    const criticalIssues = scanResult.complianceIssues.filter(i => i.severity === 'critical');
    const majorIssues = scanResult.complianceIssues.filter(i => i.severity === 'major');
    const minorIssues = scanResult.complianceIssues.filter(i => i.severity === 'minor');

    console.log(chalk.red(`  Critical Issues: ${criticalIssues.length}`));
    console.log(chalk.yellow(`  Major Issues: ${majorIssues.length}`));
    console.log(chalk.blue(`  Minor Issues: ${minorIssues.length}`));

    // License conflicts
    if (scanResult.licenseConflicts.length > 0) {
      console.log(chalk.cyan('\n⚡ License Conflicts:'));
      for (const conflict of scanResult.licenseConflicts.slice(0, 3)) {
        console.log(chalk.red(`  ${conflict.severity.toUpperCase()}: ${conflict.description}`));
      }
      if (scanResult.licenseConflicts.length > 3) {
        console.log(chalk.gray(`  ... and ${scanResult.licenseConflicts.length - 3} more conflicts`));
      }
    }

    // Top license types
    const licenseCounts = new Map<string, number>();
    for (const detected of scanResult.detectedLicenses) {
      for (const license of detected.licenses) {
        licenseCounts.set(license, (licenseCounts.get(license) || 0) + 1);
      }
    }

    const topLicenses = Array.from(licenseCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    console.log(chalk.cyan('\n📜 Top License Types:'));
    for (const [license, count] of topLicenses) {
      const riskLevel = this.assessLicenseRisk([license as LicenseType]);
      const riskColor = 
        riskLevel === 'PROHIBITED' ? chalk.red :
        riskLevel === 'HIGH_RISK' ? chalk.red :
        riskLevel === 'MEDIUM_RISK' ? chalk.yellow :
        riskLevel === 'LOW_RISK' ? chalk.blue :
        chalk.green;
      
      console.log(`  ${riskColor(license)}: ${count} packages`);
    }

    // Next steps
    console.log(chalk.cyan('\n📖 Next Steps:'));
    if (criticalIssues.length > 0) {
      console.log(chalk.red('  1. Address critical compliance issues immediately'));
    }
    if (scanResult.licenseConflicts.length > 0) {
      console.log(chalk.yellow('  2. Resolve license conflicts'));
    }
    if (scanResult.riskAssessment.overallRisk !== 'ACCEPTABLE') {
      console.log(chalk.blue('  3. Implement risk mitigation strategies'));
    }
    console.log(chalk.gray('  4. Generate attribution documentation'));
    console.log(chalk.gray('  5. Set up continuous license monitoring'));

    console.log(chalk.gray(`\n📄 Detailed reports available at: ./license-compliance/`));
  }

  /**
   * Send notifications
   */
  private async sendNotifications(scanResult: LicenseScanResult): Promise<void> {
    if (!this.policy.notificationSettings.emailNotifications) {
      return;
    }

    const criticalIssues = scanResult.complianceIssues.filter(i => i.severity === 'critical').length;
    const highRisk = scanResult.riskAssessment.overallRisk === 'HIGH_RISK' || scanResult.riskAssessment.overallRisk === 'PROHIBITED';

    if (criticalIssues > 0 || highRisk) {
      console.log(chalk.yellow('\n📧 Sending notifications to legal and security teams...'));
      
      // In a real implementation, this would send actual emails/Slack notifications
      const notification = {
        subject: `[URGENT] License Compliance Issues Detected - ${this.policy.organizationName}`,
        summary: {
          criticalIssues,
          totalConflicts: scanResult.licenseConflicts.length,
          riskLevel: scanResult.riskAssessment.overallRisk,
          projectPath: scanResult.projectPath,
        },
        recipients: [
          this.policy.notificationSettings.legalTeamEmail,
          this.policy.notificationSettings.securityTeamEmail,
        ].filter(Boolean),
      };

      console.log(chalk.gray(`Notification prepared: ${JSON.stringify(notification, null, 2)}`));
    }
  }

  /**
   * Initialize license compatibility matrix
   */
  private initializeLicenseCompatibilityMatrix(): Map<LicenseType, LicenseCompatibility> {
    const matrix = new Map<LicenseType, LicenseCompatibility>();

    // MIT License
    matrix.set('MIT', {
      primaryLicense: 'MIT',
      compatibleWith: ['MIT', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0', 'ISC', 'Unlicense', 'GPL-2.0', 'GPL-3.0', 'LGPL-2.1', 'LGPL-3.0'],
      conflictsWith: [],
      requiresAttribution: true,
      allowsCommercialUse: true,
      allowsModification: true,
      allowsDistribution: true,
      requiresSourceDisclosure: false,
      norwegianGovernmentApproved: true,
      euCompliant: true,
    });

    // Apache 2.0
    matrix.set('Apache-2.0', {
      primaryLicense: 'Apache-2.0',
      compatibleWith: ['MIT', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0', 'ISC', 'GPL-3.0', 'LGPL-3.0'],
      conflictsWith: ['GPL-2.0'],
      requiresAttribution: true,
      allowsCommercialUse: true,
      allowsModification: true,
      allowsDistribution: true,
      requiresSourceDisclosure: false,
      norwegianGovernmentApproved: true,
      euCompliant: true,
    });

    // GPL-3.0
    matrix.set('GPL-3.0', {
      primaryLicense: 'GPL-3.0',
      compatibleWith: ['GPL-3.0', 'LGPL-3.0', 'AGPL-3.0'],
      conflictsWith: ['MIT', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0', 'Proprietary', 'Commercial'],
      requiresAttribution: true,
      allowsCommercialUse: true,
      allowsModification: true,
      allowsDistribution: true,
      requiresSourceDisclosure: true,
      norwegianGovernmentApproved: false,
      euCompliant: true,
    });

    // Add more license definitions as needed...

    return matrix;
  }

  /**
   * Export scan results
   */
  async exportScanResults(scanResult: LicenseScanResult, outputPath?: string): Promise<string> {
    const reportPath = outputPath || path.join(scanResult.projectPath, 'license-compliance', `license-scan-${scanResult.scanId}.json`);
    await fs.ensureDir(path.dirname(reportPath));
    await fs.writeJson(reportPath, scanResult, { spaces: 2 });
    
    return reportPath;
  }

  /**
   * Generate comprehensive compliance report
   */
  async generateComplianceReport(scanResult: LicenseScanResult): Promise<string> {
    const reportPath = path.join(scanResult.projectPath, 'license-compliance', `compliance-report-${scanResult.scanId}.md`);
    await fs.ensureDir(path.dirname(reportPath));

    const report = `# License Compliance Report

**Organization:** ${this.policy.organizationName}
**Scan Date:** ${scanResult.scanDate.toISOString()}
**Scan ID:** ${scanResult.scanId}
**Project:** ${scanResult.projectPath}

## Executive Summary

This license compliance report provides a comprehensive analysis of open source license compliance for the project. The scan identified ${scanResult.totalPackages} packages with ${scanResult.complianceIssues.length} compliance issues requiring attention.

**Overall Risk Level:** ${scanResult.riskAssessment.overallRisk}
**Critical Issues:** ${scanResult.complianceIssues.filter(i => i.severity === 'critical').length}
**License Conflicts:** ${scanResult.licenseConflicts.length}

## Compliance Assessment

### Risk Analysis
- **Copyleft Risk:** ${scanResult.riskAssessment.copyleftRisk.toFixed(1)}%
- **Commercial Risk:** ${scanResult.riskAssessment.commercialRisk.toFixed(1)}%
- **Norwegian Compliance Risk:** ${scanResult.riskAssessment.norwegianComplianceRisk.toFixed(1)}%

### Identified Issues

${scanResult.complianceIssues.map(issue => `
#### ${issue.id}: ${issue.description}
- **Package:** ${issue.packageName}
- **License:** ${issue.license}
- **Severity:** ${issue.severity.toUpperCase()}
- **Type:** ${issue.type}
- **Norwegian Reference:** ${issue.norwegianLegalReference}
- **Deadline:** ${issue.deadline.toLocaleDateString()}

**Remediation:**
${issue.remediation.map(r => `- ${r}`).join('\n')}
`).join('\n')}

## License Distribution

${Array.from(new Set(scanResult.detectedLicenses.flatMap(dl => dl.licenses)))
  .map(license => {
    const count = scanResult.detectedLicenses.filter(dl => dl.licenses.includes(license)).length;
    const riskLevel = this.assessLicenseRisk([license]);
    return `- **${license}:** ${count} packages (Risk: ${riskLevel})`;
  }).join('\n')}

## Recommendations

${scanResult.recommendedActions.map(rec => `
### ${rec.title}
**Priority:** ${rec.priority.toUpperCase()}
**Category:** ${rec.category}

${rec.description}

**Implementation:**
${rec.implementation.map(step => `- ${step}`).join('\n')}

**Norwegian Context:** ${rec.norwegianContext}
`).join('\n')}

## Norwegian Compliance Notes

This report addresses Norwegian-specific compliance requirements including:

- **Offentlige anskaffelser:** Compliance with Norwegian government procurement guidelines
- **Åndsverkloven:** Norwegian copyright law requirements for attribution and licensing
- **DFØ Guidelines:** Alignment with Direktoratet for forvaltning og økonomistyring recommendations
- **EU Compatibility:** European Union license compatibility assessment

## Action Items

1. **Immediate Actions (Critical):**
${scanResult.complianceIssues
  .filter(i => i.severity === 'critical')
  .map(i => `   - ${i.description} (${i.packageName})`)
  .join('\n')}

2. **Short-term Actions (Major):**
${scanResult.complianceIssues
  .filter(i => i.severity === 'major')
  .map(i => `   - ${i.description} (${i.packageName})`)
  .join('\n')}

3. **Long-term Actions:**
   - Implement continuous license monitoring
   - Establish approved package whitelist
   - Provide developer training on license compliance
   - Regular legal review of license policies

## Conclusion

${scanResult.riskAssessment.overallRisk === 'ACCEPTABLE' ? 
  'The project demonstrates good license compliance with minimal risk.' :
  scanResult.riskAssessment.overallRisk === 'PROHIBITED' ?
  'The project has critical license compliance issues that must be addressed immediately before deployment.' :
  'The project has license compliance issues that should be addressed to reduce legal and regulatory risk.'
}

Regular license scanning and compliance monitoring is recommended to maintain compliance with Norwegian regulations and best practices.

---
*This report was generated by Xaheen License Compliance Service*
*Contact: ${this.policy.notificationSettings.legalTeamEmail || 'legal@organization.no'}*
`;

    await fs.writeFile(reportPath, report);
    console.log(chalk.green(`📋 Compliance report generated: ${reportPath}`));
    
    return reportPath;
  }
}