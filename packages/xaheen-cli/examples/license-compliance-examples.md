# License Compliance Service - Usage Examples

This document provides comprehensive examples for using the Xaheen License Compliance Service in Norwegian enterprise environments.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Norwegian Government Compliance](#norwegian-government-compliance)
3. [Enterprise Integration](#enterprise-integration)
4. [CI/CD Pipeline Integration](#cicd-pipeline-integration)
5. [Advanced Scanning](#advanced-scanning)
6. [Reporting and Documentation](#reporting-and-documentation)
7. [Policy Management](#policy-management)
8. [Real-time Monitoring](#real-time-monitoring)

## Basic Usage

### Simple License Scan

```typescript
import { LicenseComplianceService, NorwegianLicensePolicy } from '@xaheen-ai/cli';

// Basic Norwegian enterprise policy
const policy: NorwegianLicensePolicy = {
  organizationName: 'Norwegian Enterprise AS',
  organizationType: 'enterprise',
  procurementGuidelines: 'moderate',
  allowedLicenses: ['MIT', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0'],
  prohibitedLicenses: ['GPL-2.0', 'GPL-3.0', 'AGPL-3.0'],
  requireLegalReview: true,
  automaticScanning: true,
  generateSPDXReports: true,
  exportControlCompliance: true,
  gdprCompatibilityCheck: true,
  norwegianLanguageReporting: true,
  notificationSettings: {
    legalTeamEmail: 'legal@enterprise.no',
    securityTeamEmail: 'security@enterprise.no',
    emailNotifications: true,
  },
};

// Initialize service
const complianceService = new LicenseComplianceService(policy);

// Perform basic scan
async function basicScan() {
  const result = await complianceService.performLicenseScan('./my-project', {
    includeTransitive: true,
    generateSPDX: true,
    generateAttribution: true,
  });

  console.log(`Scan completed: ${result.scanId}`);
  console.log(`Total packages: ${result.totalPackages}`);
  console.log(`Risk level: ${result.riskAssessment.overallRisk}`);
  console.log(`Compliance issues: ${result.complianceIssues.length}`);
}
```

### CLI Usage

```bash
# Basic license compliance scan
xaheen license-compliance --project ./my-project

# Deep scan with source header analysis
xaheen license-compliance --deep-scan --scan-source-headers --project ./my-project

# Generate only SPDX report
xaheen license-compliance --no-generate-attribution --format json --project ./my-project

# Fail on any compliance issue (strict mode)
xaheen license-compliance --fail-on any_issue --project ./my-project
```

## Norwegian Government Compliance

### Government Organization Setup

```typescript
// Norwegian government organization policy
const governmentPolicy: NorwegianLicensePolicy = {
  organizationName: 'Norsk Offentlig Organisasjon',
  organizationType: 'government',
  procurementGuidelines: 'strict',
  allowedLicenses: [
    'MIT',
    'BSD-2-Clause', 
    'BSD-3-Clause',
    'Apache-2.0',
    'ISC',
    'NLOD-2.0', // Norwegian License for Open Data
  ],
  reviewRequiredLicenses: ['LGPL-2.1', 'LGPL-3.0'],
  prohibitedLicenses: [
    'GPL-2.0',
    'GPL-3.0', 
    'AGPL-3.0',
    'Commercial',
    'Proprietary',
    'SSPL-1.0',
  ],
  requireLegalReview: true,
  automaticScanning: true,
  generateSPDXReports: true,
  exportControlCompliance: true,
  gdprCompatibilityCheck: true,
  norwegianLanguageReporting: true,
  notificationSettings: {
    legalTeamEmail: 'juridisk@organisasjon.no',
    securityTeamEmail: 'sikkerhet@organisasjon.no',
    emailNotifications: true,
  },
};

// Government compliance scan
async function governmentComplianceScan() {
  const service = new LicenseComplianceService(governmentPolicy);
  
  const result = await service.performLicenseScan('./government-project', {
    includeTransitive: true,
    scanSourceHeaders: true,
    generateSPDX: true,
    generateAttribution: true,
    deepScan: true,
  });

  // Generate compliance report in Norwegian
  await service.generateComplianceReport(result);
  
  // Check for critical government compliance issues
  const criticalIssues = result.complianceIssues.filter(
    issue => issue.severity === 'critical' || 
             issue.type === 'prohibited_license'
  );

  if (criticalIssues.length > 0) {
    console.error('KRITISKE LISENSKONFLIKTER OPPDAGET!');
    console.error('Kontakt juridisk avdeling umiddelbart.');
    process.exit(1);
  }
}
```

### CLI for Government Organizations

```bash
# Initialize government license policy
xaheen license-compliance init --org-type government --org-name "Statens Organisasjon" --strict

# Comprehensive government compliance scan
xaheen license-compliance \
  --project ./government-system \
  --deep-scan \
  --scan-source-headers \
  --format both \
  --fail-on medium_risk \
  --notify-legal \
  --verbose

# Generate Norwegian compliance documentation
xaheen license-compliance \
  --project ./government-system \
  --format markdown \
  --norwegian
```

## Enterprise Integration

### Integration with Existing Systems

```typescript
// Enterprise integration with existing compliance systems
class EnterpriseComplianceIntegration {
  private licenseService: LicenseComplianceService;
  private complianceDb: any; // Your existing compliance database
  private slackNotifier: any; // Slack integration

  constructor(policy: NorwegianLicensePolicy) {
    this.licenseService = new LicenseComplianceService(policy);
  }

  async performEnterpriseAudit(projects: string[]) {
    const auditResults = [];

    for (const projectPath of projects) {
      console.log(`Auditing project: ${projectPath}`);
      
      try {
        const result = await this.licenseService.performLicenseScan(projectPath, {
          includeTransitive: true,
          generateSPDX: true,
          deepScan: true,
        });

        // Store in compliance database
        await this.storeComplianceResults(result);
        
        // Check for high-risk issues
        if (result.riskAssessment.overallRisk === 'HIGH_RISK' || 
            result.riskAssessment.overallRisk === 'PROHIBITED') {
          await this.notifyStakeholders(result);
        }

        auditResults.push(result);
        
      } catch (error) {
        console.error(`Failed to audit ${projectPath}:`, error);
      }
    }

    // Generate enterprise compliance dashboard
    await this.generateEnterpriseDashboard(auditResults);
    
    return auditResults;
  }

  private async storeComplianceResults(result: any) {
    // Store in your enterprise compliance database
    await this.complianceDb.insert('license_scans', {
      scan_id: result.scanId,
      project_path: result.projectPath,
      scan_date: result.scanDate,
      risk_level: result.riskAssessment.overallRisk,
      total_packages: result.totalPackages,
      compliance_issues: result.complianceIssues.length,
      license_conflicts: result.licenseConflicts.length,
      raw_data: JSON.stringify(result),
    });
  }

  private async notifyStakeholders(result: any) {
    const message = `
🚨 HIGH-RISK LICENSE COMPLIANCE ISSUE DETECTED

Project: ${result.projectPath}
Risk Level: ${result.riskAssessment.overallRisk}
Critical Issues: ${result.complianceIssues.filter(i => i.severity === 'critical').length}
License Conflicts: ${result.licenseConflicts.length}

Action Required: Immediate legal review needed.
    `;

    // Send Slack notification
    await this.slackNotifier.send({
      channel: '#legal-compliance',
      text: message,
    });

    // Send email to legal team
    // await this.emailNotifier.send(...)
  }

  private async generateEnterpriseDashboard(results: any[]) {
    // Generate executive dashboard with compliance metrics
    const dashboard = {
      totalProjectsScanned: results.length,
      highRiskProjects: results.filter(r => ['HIGH_RISK', 'PROHIBITED'].includes(r.riskAssessment.overallRisk)).length,
      totalComplianceIssues: results.reduce((sum, r) => sum + r.complianceIssues.length, 0),
      mostCommonLicenses: this.analyzeLicenseDistribution(results),
      recommendedActions: this.generateEnterpriseRecommendations(results),
    };

    // Save dashboard
    await fs.writeJson('./compliance-dashboard.json', dashboard, { spaces: 2 });
    
    console.log('📊 Enterprise compliance dashboard generated');
  }
}

// Usage
const enterprisePolicy: NorwegianLicensePolicy = {
  organizationName: 'Norwegian Corporation ASA',
  organizationType: 'enterprise',
  procurementGuidelines: 'moderate',
  // ... other policy settings
};

const integration = new EnterpriseComplianceIntegration(enterprisePolicy);

// Audit multiple projects
await integration.performEnterpriseAudit([
  './frontend-app',
  './backend-api',
  './mobile-app',
  './data-pipeline',
]);
```

## CI/CD Pipeline Integration

### GitHub Actions Integration

```yaml
# .github/workflows/license-compliance.yml
name: License Compliance Check

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  license-compliance:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Install Xaheen CLI
      run: npm install -g @xaheen-ai/cli
      
    - name: Initialize License Policy
      run: |
        xaheen license-compliance init \
          --org-name "${{ vars.ORG_NAME }}" \
          --org-type enterprise \
          --moderate
      
    - name: Run License Compliance Scan
      run: |
        xaheen license-compliance \
          --project . \
          --deep-scan \
          --fail-on high_risk \
          --format both \
          --verbose
      
    - name: Upload Compliance Reports
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: license-compliance-reports
        path: |
          license-compliance/
          compliance-reports/
        
    - name: Comment PR with Results
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v7
      with:
        script: |
          const fs = require('fs');
          const path = require('path');
          
          try {
            const reportPath = './license-compliance/';
            const files = fs.readdirSync(reportPath);
            const jsonReport = files.find(f => f.includes('scan-') && f.endsWith('.json'));
            
            if (jsonReport) {
              const result = JSON.parse(fs.readFileSync(path.join(reportPath, jsonReport), 'utf8'));
              
              const comment = `## 📄 License Compliance Report
              
**Project:** ${result.projectPath}
**Risk Level:** ${result.riskAssessment.overallRisk}
**Total Packages:** ${result.totalPackages}
**Compliance Issues:** ${result.complianceIssues.length}
**License Conflicts:** ${result.licenseConflicts.length}

${result.complianceIssues.length > 0 ? '⚠️ **Action Required:** Please review compliance issues before merging.' : '✅ **All Clear:** No compliance issues detected.'}
              `;
              
              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: comment
              });
            }
          } catch (error) {
            console.error('Failed to create PR comment:', error);
          }
```

### Azure DevOps Pipeline

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
    - main
    - develop

pool:
  vmImage: 'ubuntu-latest'

stages:
- stage: LicenseCompliance
  displayName: 'License Compliance Check'
  
  jobs:
  - job: ComplianceScan
    displayName: 'Run License Compliance Scan'
    
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '20.x'
      displayName: 'Install Node.js'
      
    - script: |
        npm ci
        npm install -g @xaheen-ai/cli
      displayName: 'Install Dependencies'
      
    - script: |
        xaheen license-compliance init \
          --org-name "$(ORG_NAME)" \
          --org-type enterprise
      displayName: 'Initialize License Policy'
      
    - script: |
        xaheen license-compliance \
          --project $(Build.SourcesDirectory) \
          --deep-scan \
          --fail-on high_risk \
          --format both \
          --notify-legal
      displayName: 'Run Compliance Scan'
      continueOnError: true
      
    - task: PublishTestResults@2
      condition: always()
      inputs:
        testResultsFormat: 'JUnit'
        testResultsFiles: 'license-compliance/compliance-junit.xml'
        testRunTitle: 'License Compliance Results'
      
    - task: PublishBuildArtifacts@1
      condition: always()
      inputs:
        pathToPublish: 'license-compliance'
        artifactName: 'license-compliance-reports'
```

## Advanced Scanning

### Source Code Header Analysis

```typescript
// Advanced source code license analysis
async function advancedSourceAnalysis(projectPath: string) {
  const policy: NorwegianLicensePolicy = {
    organizationName: 'Tech Company Norway',
    organizationType: 'enterprise',
    // ... policy configuration
  };

  const service = new LicenseComplianceService(policy);
  
  // Comprehensive scan including source headers
  const result = await service.performLicenseScan(projectPath, {
    includeTransitive: true,
    scanSourceHeaders: true, // Enable source code analysis
    generateSPDX: true,
    generateAttribution: true,
    deepScan: true, // Use external tools for enhanced detection
  });

  // Analyze source-specific issues
  const sourceHeaderLicenses = result.detectedLicenses.filter(
    license => license.source === 'source-header'
  );

  console.log(`Source files with license headers: ${sourceHeaderLicenses.length}`);
  
  // Check for inconsistent licensing
  const packageLicenses = result.detectedLicenses.filter(
    license => license.source === 'package.json'
  );
  
  const licenseConsistencyCheck = analyzeConsistency(
    sourceHeaderLicenses, 
    packageLicenses
  );
  
  if (!licenseConsistencyCheck.consistent) {
    console.warn('⚠️ License inconsistencies detected between source headers and package declarations');
    licenseConsistencyCheck.issues.forEach(issue => {
      console.warn(`  • ${issue}`);
    });
  }
}

function analyzeConsistency(sourceHeaders: any[], packageDeclarations: any[]) {
  const issues: string[] = [];
  
  // Compare declared licenses vs. source header licenses
  const sourceLicenseTypes = new Set(sourceHeaders.flatMap(s => s.licenses));
  const packageLicenseTypes = new Set(packageDeclarations.flatMap(p => p.licenses));
  
  for (const sourceLicense of sourceLicenseTypes) {
    if (!packageLicenseTypes.has(sourceLicense)) {
      issues.push(`Source header license '${sourceLicense}' not declared in package metadata`);
    }
  }
  
  return {
    consistent: issues.length === 0,
    issues,
  };
}
```

### Multi-Language Project Scanning

```typescript
// Multi-language project support
async function multiLanguageCompliance(projectPath: string) {
  const service = new LicenseComplianceService(norwegianPolicy);
  
  // The service automatically detects multiple package managers
  const result = await service.performLicenseScan(projectPath, {
    includeTransitive: true,
    deepScan: true,
  });

  // Analyze by package manager
  const packageManagerBreakdown = result.detectedLicenses.reduce((acc, license) => {
    const manager = detectPackageManager(license.path);
    if (!acc[manager]) acc[manager] = [];
    acc[manager].push(license);
    return acc;
  }, {} as Record<string, any[]>);

  console.log('📊 License breakdown by package manager:');
  for (const [manager, licenses] of Object.entries(packageManagerBreakdown)) {
    console.log(`  ${manager}: ${licenses.length} packages`);
    
    const riskLevels = licenses.reduce((acc, l) => {
      acc[l.riskLevel] = (acc[l.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`    Risk distribution:`, riskLevels);
  }
}

function detectPackageManager(licensePath: string): string {
  if (licensePath.includes('node_modules')) return 'npm/yarn/pnpm';
  if (licensePath.includes('vendor')) return 'composer';
  if (licensePath.includes('site-packages')) return 'pip';
  if (licensePath.includes('.m2')) return 'maven';
  return 'unknown';
}
```

## Reporting and Documentation

### SPDX Document Generation

```typescript
// Generate comprehensive SPDX documentation
async function generateComprehensiveSPDX(projectPath: string) {
  const service = new LicenseComplianceService(norwegianPolicy);
  
  const result = await service.performLicenseScan(projectPath, {
    generateSPDX: true,
    generateAttribution: true,
  });

  // The SPDX document is automatically generated
  console.log(`SPDX document: ${result.spdxDocument}`);
  console.log(`Attribution document: ${result.attributionDocument}`);
  
  // Generate additional compliance documentation
  await service.generateComplianceReport(result);
  
  // Create executive summary
  const executiveSummary = {
    organization: norwegianPolicy.organizationName,
    project: projectPath,
    scanDate: result.scanDate,
    summary: {
      totalPackages: result.totalPackages,
      riskLevel: result.riskAssessment.overallRisk,
      complianceStatus: result.complianceIssues.length === 0 ? 'COMPLIANT' : 'ISSUES_DETECTED',
    },
    keyFindings: result.complianceIssues.slice(0, 5).map(issue => ({
      severity: issue.severity,
      description: issue.description,
      recommendation: issue.remediation[0],
    })),
    norwegianCompliance: {
      procurementCompliant: result.complianceIssues.filter(
        i => i.norwegianLegalReference.includes('anskaffelser')
      ).length === 0,
      gdprCompliant: result.riskAssessment.norwegianComplianceRisk < 20,
      exportControlClear: result.riskAssessment.exportControlRisk < 10,
    },
  };

  await fs.writeJson('./executive-summary.json', executiveSummary, { spaces: 2 });
  console.log('📋 Executive summary generated');
}
```

### Custom Report Templates

```typescript
// Create custom Norwegian compliance report
async function generateNorwegianComplianceReport(scanResult: any) {
  const norwegianReport = `
# Lisenskomplians-rapport

**Organisasjon:** ${norwegianPolicy.organizationName}
**Prosjekt:** ${scanResult.projectPath}
**Skanningsdato:** ${scanResult.scanDate.toLocaleDateString('nb-NO')}

## Sammendrag

Denne rapporten viser resultatet av lisenskomplians-skanning utført i henhold til norske offentlige anskaffelsesregler og EU-direktiver.

**Samlet risikonivå:** ${scanResult.riskAssessment.overallRisk}
**Totalt antall pakker:** ${scanResult.totalPackages}
**Kompliansutfordringer:** ${scanResult.complianceIssues.length}

## Norsk regelverkskomplians

### Offentlige anskaffelser (DFØ)
${generatePublicProcurementSection(scanResult)}

### Åndsverk og opphavsrett
${generateCopyrightSection(scanResult)}

### GDPR-kompatibilitet
${generateGDPRSection(scanResult)}

## Anbefalte tiltak

${scanResult.recommendedActions.map((action: any) => `
### ${action.title}
**Prioritet:** ${action.priority}
**Beskrivelse:** ${action.description}
**Norsk kontekst:** ${action.norwegianContext}
`).join('')}

## Vedlegg

- SPDX-dokument: ${scanResult.spdxDocument}
- Attributtdokument: ${scanResult.attributionDocument}

---
*Rapport generert av Xaheen Lisenskomplians-tjeneste*
  `;

  await fs.writeFile('./norsk-komplians-rapport.md', norwegianReport);
  console.log('🇳🇴 Norsk komplians-rapport generert');
}
```

## Policy Management

### Dynamic Policy Updates

```typescript
// Dynamic license policy management
class LicensePolicyManager {
  private basePolicyPath: string;
  private currentPolicy: NorwegianLicensePolicy;

  constructor(policyPath: string) {
    this.basePolicyPath = policyPath;
    this.currentPolicy = this.loadPolicy();
  }

  // Update policy based on regulatory changes
  async updateForRegulatoryChanges() {
    // Example: New Norwegian regulation restricts certain licenses
    const updates = {
      prohibitedLicenses: [
        ...this.currentPolicy.prohibitedLicenses,
        'BSL-1.1', // New regulatory restriction
      ],
      requireLegalReview: true,
      exportControlCompliance: true,
    };

    this.currentPolicy = { ...this.currentPolicy, ...updates };
    await this.savePolicy();
    
    console.log('📜 Policy updated for new Norwegian regulations');
  }

  // Project-specific policy customization
  customizeForProject(projectType: 'web' | 'mobile' | 'embedded' | 'ai') {
    const customizations: Partial<NorwegianLicensePolicy> = {};

    switch (projectType) {
      case 'embedded':
        // Embedded systems have stricter requirements
        customizations.prohibitedLicenses = [
          ...this.currentPolicy.prohibitedLicenses,
          'LGPL-2.1', 'LGPL-3.0', // Dynamic linking restrictions
        ];
        customizations.exportControlCompliance = true;
        break;

      case 'ai':
        // AI projects need ethical licensing considerations
        customizations.reviewRequiredLicenses = [
          ...this.currentPolicy.reviewRequiredLicenses,
          'CC-BY-SA-4.0', // AI training data licensing
        ];
        break;

      case 'web':
        // Web projects are more permissive
        customizations.procurementGuidelines = 'flexible';
        break;
    }

    return { ...this.currentPolicy, ...customizations };
  }

  private loadPolicy(): NorwegianLicensePolicy {
    // Load from file system or database
    return require(this.basePolicyPath);
  }

  private async savePolicy() {
    await fs.writeJson(this.basePolicyPath, this.currentPolicy, { spaces: 2 });
  }
}

// Usage
const policyManager = new LicensePolicyManager('./license-policy.json');

// Update for regulatory changes
await policyManager.updateForRegulatoryChanges();

// Create project-specific policy
const embeddedPolicy = policyManager.customizeForProject('embedded');
const embeddedService = new LicenseComplianceService(embeddedPolicy);
```

## Real-time Monitoring

### Continuous Monitoring Setup

```typescript
// Real-time license monitoring system
class LicenseMonitoringSystem {
  private service: LicenseComplianceService;
  private projectPaths: string[];
  private monitoringInterval: number;

  constructor(policy: NorwegianLicensePolicy, projects: string[]) {
    this.service = new LicenseComplianceService(policy);
    this.projectPaths = projects;
    this.monitoringInterval = 24 * 60 * 60 * 1000; // 24 hours
  }

  // Start continuous monitoring
  startMonitoring() {
    console.log('🔄 Starting continuous license monitoring...');
    
    // Initial scan
    this.performScheduledScan();
    
    // Schedule regular scans
    setInterval(() => {
      this.performScheduledScan();
    }, this.monitoringInterval);

    // Watch for package.json changes
    this.setupFileWatchers();
  }

  private async performScheduledScan() {
    console.log(`🔍 Running scheduled compliance scan at ${new Date().toISOString()}`);
    
    for (const projectPath of this.projectPaths) {
      try {
        const result = await this.service.performLicenseScan(projectPath, {
          includeTransitive: true,
          deepScan: false, // Lighter scan for regular monitoring
        });

        // Check for changes since last scan
        const previousResult = await this.loadPreviousScanResult(projectPath);
        const changes = this.compareResults(previousResult, result);

        if (changes.hasChanges) {
          await this.handleLicenseChanges(projectPath, changes);
        }

        // Store current result
        await this.storeScanResult(projectPath, result);
        
      } catch (error) {
        console.error(`Failed to scan ${projectPath}:`, error);
      }
    }
  }

  private setupFileWatchers() {
    // Watch for package.json, composer.json, requirements.txt changes
    const chokidar = require('chokidar');
    
    this.projectPaths.forEach(projectPath => {
      const watcher = chokidar.watch([
        `${projectPath}/package*.json`,
        `${projectPath}/composer.json`,
        `${projectPath}/requirements.txt`,
        `${projectPath}/Pipfile`,
      ]);

      watcher.on('change', async (filePath: string) => {
        console.log(`📝 Dependency file changed: ${filePath}`);
        
        // Trigger immediate scan for this project
        const result = await this.service.performLicenseScan(projectPath, {
          includeTransitive: true,
        });

        // Check for high-risk changes
        if (result.riskAssessment.overallRisk === 'HIGH_RISK' || 
            result.riskAssessment.overallRisk === 'PROHIBITED') {
          await this.sendUrgentAlert(projectPath, result);
        }
      });
    });
  }

  private async handleLicenseChanges(projectPath: string, changes: any) {
    console.log(`⚡ License changes detected in ${projectPath}`);
    
    if (changes.newProhibitedLicenses.length > 0) {
      await this.sendUrgentAlert(projectPath, {
        message: `New prohibited licenses detected: ${changes.newProhibitedLicenses.join(', ')}`,
        severity: 'CRITICAL',
      });
    }

    if (changes.newHighRiskPackages.length > 0) {
      await this.sendAlert(projectPath, {
        message: `New high-risk packages detected: ${changes.newHighRiskPackages.join(', ')}`,
        severity: 'HIGH',
      });
    }
  }

  private async sendUrgentAlert(projectPath: string, alert: any) {
    // Send immediate notifications to legal/security teams
    console.log(`🚨 URGENT ALERT: ${alert.message || alert.riskAssessment?.overallRisk}`);
    
    // Integration with notification systems
    // await this.slackNotifier.sendUrgent(alert);
    // await this.emailNotifier.sendUrgent(alert);
  }
}

// Usage
const monitoringSystem = new LicenseMonitoringSystem(norwegianPolicy, [
  './frontend-app',
  './backend-api',
  './mobile-app',
]);

monitoringSystem.startMonitoring();
```

This comprehensive examples document demonstrates how to use the License Compliance Service in various Norwegian enterprise scenarios, from basic scanning to advanced monitoring and integration patterns.