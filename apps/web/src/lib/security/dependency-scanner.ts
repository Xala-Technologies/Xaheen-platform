/**
 * Dependency Security Scanner
 * Automated security scanning and vulnerability detection
 */

/**
 * Vulnerability severity levels
 */
export type VulnerabilitySeverity = "low" | "moderate" | "high" | "critical";

/**
 * Vulnerability information
 */
export interface Vulnerability {
  id: string;
  title: string;
  description: string;
  severity: VulnerabilitySeverity;
  packageName: string;
  packageVersion: string;
  patchedVersions: string[];
  cwe?: string[];
  cvss?: {
    score: number;
    vector: string;
  };
  references: string[];
  publishedAt: string;
  updatedAt: string;
}

/**
 * Security scan result
 */
export interface SecurityScanResult {
  timestamp: string;
  totalPackages: number;
  vulnerabilities: Vulnerability[];
  summary: {
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
  recommendations: string[];
}

/**
 * Package information
 */
interface PackageInfo {
  name: string;
  version: string;
  dependencies: string[];
  devDependency: boolean;
  license: string;
  repository?: string;
}

/**
 * Dependency scanner class
 */
class DependencyScanner {
  private vulnerabilityDatabase: Map<string, Vulnerability[]> = new Map();
  private lastScanTimestamp: number | null = null;
  private scanCache: Map<string, SecurityScanResult> = new Map();

  constructor() {
    this.loadVulnerabilityDatabase();
  }

  /**
   * Load vulnerability database (in production, this would fetch from a real database)
   */
  private loadVulnerabilityDatabase(): void {
    // Mock vulnerability data - in production, this would be loaded from
    // sources like npm audit, Snyk, or NIST NVD
    const mockVulnerabilities: Vulnerability[] = [
      {
        id: "GHSA-example-1",
        title: "Cross-Site Scripting (XSS) vulnerability",
        description: "A reflected XSS vulnerability exists in the package",
        severity: "high",
        packageName: "vulnerable-package",
        packageVersion: "<2.1.0",
        patchedVersions: [">=2.1.0"],
        cwe: ["CWE-79"],
        cvss: {
          score: 7.5,
          vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N",
        },
        references: [
          "https://github.com/example/advisory",
          "https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2023-12345",
        ],
        publishedAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-02T00:00:00Z",
      },
    ];

    // Group vulnerabilities by package name
    mockVulnerabilities.forEach((vuln) => {
      const existing = this.vulnerabilityDatabase.get(vuln.packageName) || [];
      existing.push(vuln);
      this.vulnerabilityDatabase.set(vuln.packageName, existing);
    });
  }

  /**
   * Scan dependencies for vulnerabilities
   */
  async scanDependencies(packageJsonPath?: string): Promise<SecurityScanResult> {
    const cacheKey = packageJsonPath || "default";
    const cached = this.scanCache.get(cacheKey);
    
    // Return cached result if recent (within 1 hour)
    if (cached && Date.now() - new Date(cached.timestamp).getTime() < 3600000) {
      return cached;
    }

    try {
      const packages = await this.loadPackageInfo(packageJsonPath);
      const vulnerabilities = this.findVulnerabilities(packages);
      
      const result: SecurityScanResult = {
        timestamp: new Date().toISOString(),
        totalPackages: packages.length,
        vulnerabilities,
        summary: this.calculateSummary(vulnerabilities),
        recommendations: this.generateRecommendations(vulnerabilities),
      };

      // Cache the result
      this.scanCache.set(cacheKey, result);
      this.lastScanTimestamp = Date.now();

      return result;
    } catch (error) {
      console.error("Failed to scan dependencies:", error);
      throw new Error("Dependency scan failed");
    }
  }

  /**
   * Load package information from package.json
   */
  private async loadPackageInfo(packageJsonPath?: string): Promise<PackageInfo[]> {
    // In a real implementation, this would read and parse package.json
    // and node_modules to get actual dependency information
    
    // Mock package data for demonstration
    const mockPackages: PackageInfo[] = [
      {
        name: "react",
        version: "18.2.0",
        dependencies: [],
        devDependency: false,
        license: "MIT",
        repository: "https://github.com/facebook/react",
      },
      {
        name: "next",
        version: "14.0.0",
        dependencies: ["react"],
        devDependency: false,
        license: "MIT",
        repository: "https://github.com/vercel/next.js",
      },
      {
        name: "vulnerable-package",
        version: "2.0.0",
        dependencies: [],
        devDependency: true,
        license: "MIT",
      },
    ];

    return mockPackages;
  }

  /**
   * Find vulnerabilities in the given packages
   */
  private findVulnerabilities(packages: PackageInfo[]): Vulnerability[] {
    const foundVulnerabilities: Vulnerability[] = [];

    packages.forEach((pkg) => {
      const vulns = this.vulnerabilityDatabase.get(pkg.name);
      if (vulns) {
        vulns.forEach((vuln) => {
          if (this.isVersionVulnerable(pkg.version, vuln.packageVersion)) {
            foundVulnerabilities.push({
              ...vuln,
              packageVersion: pkg.version, // Use actual version
            });
          }
        });
      }
    });

    return foundVulnerabilities;
  }

  /**
   * Check if a version is vulnerable based on version range
   */
  private isVersionVulnerable(version: string, vulnerableRange: string): boolean {
    // Simplified version comparison - in production, use semver library
    if (vulnerableRange.startsWith("<")) {
      const targetVersion = vulnerableRange.substring(1);
      return this.compareVersions(version, targetVersion) < 0;
    }
    
    if (vulnerableRange.startsWith("<=")) {
      const targetVersion = vulnerableRange.substring(2);
      return this.compareVersions(version, targetVersion) <= 0;
    }
    
    if (vulnerableRange.startsWith(">=")) {
      const targetVersion = vulnerableRange.substring(2);
      return this.compareVersions(version, targetVersion) >= 0;
    }
    
    if (vulnerableRange.startsWith(">")) {
      const targetVersion = vulnerableRange.substring(1);
      return this.compareVersions(version, targetVersion) > 0;
    }
    
    // Exact match
    return version === vulnerableRange;
  }

  /**
   * Simple version comparison (in production, use semver library)
   */
  private compareVersions(a: string, b: string): number {
    const aParts = a.split(".").map(Number);
    const bParts = b.split(".").map(Number);
    const maxLength = Math.max(aParts.length, bParts.length);

    for (let i = 0; i < maxLength; i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;
      
      if (aPart > bPart) return 1;
      if (aPart < bPart) return -1;
    }
    
    return 0;
  }

  /**
   * Calculate vulnerability summary
   */
  private calculateSummary(vulnerabilities: Vulnerability[]): SecurityScanResult["summary"] {
    const summary = {
      low: 0,
      moderate: 0,
      high: 0,
      critical: 0,
    };

    vulnerabilities.forEach((vuln) => {
      summary[vuln.severity]++;
    });

    return summary;
  }

  /**
   * Generate security recommendations
   */
  private generateRecommendations(vulnerabilities: Vulnerability[]): string[] {
    const recommendations: string[] = [];
    const packageUpdates = new Map<string, string[]>();

    // Collect update recommendations
    vulnerabilities.forEach((vuln) => {
      const existing = packageUpdates.get(vuln.packageName) || [];
      existing.push(...vuln.patchedVersions);
      packageUpdates.set(vuln.packageName, existing);
    });

    // Generate update recommendations
    packageUpdates.forEach((versions, packageName) => {
      const latestVersion = versions[versions.length - 1]; // Simplified
      recommendations.push(`Update ${packageName} to ${latestVersion}`);
    });

    // Add general recommendations
    if (vulnerabilities.some(v => v.severity === "critical")) {
      recommendations.push("Critical vulnerabilities found - update immediately");
    }

    if (vulnerabilities.some(v => v.severity === "high")) {
      recommendations.push("High severity vulnerabilities found - update as soon as possible");
    }

    if (vulnerabilities.length === 0) {
      recommendations.push("No known vulnerabilities found - keep dependencies updated");
    }

    recommendations.push("Run security scans regularly");
    recommendations.push("Enable automated dependency updates");
    recommendations.push("Monitor security advisories for your dependencies");

    return recommendations;
  }

  /**
   * Get scan history
   */
  getScanHistory(): Array<{ timestamp: string; vulnerabilityCount: number }> {
    const history: Array<{ timestamp: string; vulnerabilityCount: number }> = [];
    
    this.scanCache.forEach((result) => {
      history.push({
        timestamp: result.timestamp,
        vulnerabilityCount: result.vulnerabilities.length,
      });
    });

    return history.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Clear scan cache
   */
  clearCache(): void {
    this.scanCache.clear();
  }

  /**
   * Get vulnerability details by ID
   */
  getVulnerabilityDetails(id: string): Vulnerability | null {
    for (const vulns of this.vulnerabilityDatabase.values()) {
      const found = vulns.find(v => v.id === id);
      if (found) return found;
    }
    return null;
  }
}

// Export singleton instance
export const dependencyScanner = new DependencyScanner();

/**
 * Security monitoring utilities
 */
export const SecurityMonitoring = {
  /**
   * Check for malicious packages
   */
  checkMaliciousPackages(packages: string[]): string[] {
    // Known malicious packages (simplified list)
    const maliciousPatterns = [
      /^(event-?stream|eslint-scope|getcookies)$/,
      /.*-js$/,
      /^(electron-?native|discord-?js)$/,
    ];

    return packages.filter(pkg => 
      maliciousPatterns.some(pattern => pattern.test(pkg))
    );
  },

  /**
   * Check package license compatibility
   */
  checkLicenseCompatibility(licenses: string[]): {
    compatible: string[];
    incompatible: string[];
    warnings: string[];
  } {
    const compatibleLicenses = ["MIT", "Apache-2.0", "BSD-3-Clause", "ISC"];
    const incompatibleLicenses = ["GPL", "AGPL", "SSPL"];
    const warningLicenses = ["LGPL", "MPL-2.0"];

    const result = {
      compatible: [] as string[],
      incompatible: [] as string[],
      warnings: [] as string[],
    };

    licenses.forEach(license => {
      if (compatibleLicenses.includes(license)) {
        result.compatible.push(license);
      } else if (incompatibleLicenses.some(inc => license.includes(inc))) {
        result.incompatible.push(license);
      } else if (warningLicenses.includes(license)) {
        result.warnings.push(license);
      } else {
        result.warnings.push(license); // Unknown licenses are warnings
      }
    });

    return result;
  },

  /**
   * Generate security report
   */
  generateSecurityReport(scanResult: SecurityScanResult): string {
    const { vulnerabilities, summary, totalPackages } = scanResult;
    
    let report = `# Security Scan Report\n\n`;
    report += `**Scan Date:** ${new Date(scanResult.timestamp).toLocaleString()}\n`;
    report += `**Total Packages:** ${totalPackages}\n`;
    report += `**Vulnerabilities Found:** ${vulnerabilities.length}\n\n`;
    
    report += `## Vulnerability Summary\n\n`;
    report += `- 🔴 Critical: ${summary.critical}\n`;
    report += `- 🟠 High: ${summary.high}\n`;
    report += `- 🟡 Moderate: ${summary.moderate}\n`;
    report += `- 🟢 Low: ${summary.low}\n\n`;
    
    if (vulnerabilities.length > 0) {
      report += `## Vulnerabilities\n\n`;
      vulnerabilities.forEach(vuln => {
        const severityEmoji = {
          critical: "🔴",
          high: "🟠",
          moderate: "🟡",
          low: "🟢",
        }[vuln.severity];
        
        report += `### ${severityEmoji} ${vuln.title}\n\n`;
        report += `**Package:** ${vuln.packageName}@${vuln.packageVersion}\n`;
        report += `**Severity:** ${vuln.severity.toUpperCase()}\n`;
        report += `**Description:** ${vuln.description}\n`;
        
        if (vuln.cvss) {
          report += `**CVSS Score:** ${vuln.cvss.score}\n`;
        }
        
        if (vuln.patchedVersions.length > 0) {
          report += `**Fixed In:** ${vuln.patchedVersions.join(", ")}\n`;
        }
        
        report += `\n`;
      });
    }
    
    if (scanResult.recommendations.length > 0) {
      report += `## Recommendations\n\n`;
      scanResult.recommendations.forEach(rec => {
        report += `- ${rec}\n`;
      });
    }
    
    return report;
  },
};

/**
 * React hook for dependency scanning
 */
export function useDependencyScanning() {
  const [scanResult, setScanResult] = React.useState<SecurityScanResult | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const runScan = React.useCallback(async (packageJsonPath?: string) => {
    setIsScanning(true);
    setError(null);
    
    try {
      const result = await dependencyScanner.scanDependencies(packageJsonPath);
      setScanResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setIsScanning(false);
    }
  }, []);

  const clearResults = React.useCallback(() => {
    setScanResult(null);
    setError(null);
  }, []);

  const generateReport = React.useCallback(() => {
    if (!scanResult) return "";
    return SecurityMonitoring.generateSecurityReport(scanResult);
  }, [scanResult]);

  return {
    scanResult,
    isScanning,
    error,
    runScan,
    clearResults,
    generateReport,
    scanHistory: dependencyScanner.getScanHistory(),
  };
}

/**
 * Automated security monitoring
 */
export class SecurityAutomation {
  private intervalId: NodeJS.Timeout | null = null;
  private callbacks: Array<(result: SecurityScanResult) => void> = [];

  /**
   * Start automated scanning
   */
  startAutomatedScanning(intervalHours: number = 24): void {
    if (this.intervalId) {
      console.warn("Automated scanning already running");
      return;
    }

    this.intervalId = setInterval(async () => {
      try {
        const result = await dependencyScanner.scanDependencies();
        this.callbacks.forEach(callback => callback(result));
        
        // Log critical vulnerabilities
        const criticalVulns = result.vulnerabilities.filter(v => v.severity === "critical");
        if (criticalVulns.length > 0) {
          console.error(`🚨 ${criticalVulns.length} critical vulnerabilities found!`);
        }
      } catch (error) {
        console.error("Automated security scan failed:", error);
      }
    }, intervalHours * 60 * 60 * 1000);

    console.log(`Automated security scanning started (every ${intervalHours} hours)`);
  }

  /**
   * Stop automated scanning
   */
  stopAutomatedScanning(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("Automated security scanning stopped");
    }
  }

  /**
   * Add callback for scan results
   */
  onScanComplete(callback: (result: SecurityScanResult) => void): void {
    this.callbacks.push(callback);
  }

  /**
   * Remove callback
   */
  removeCallback(callback: (result: SecurityScanResult) => void): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }
}

export const securityAutomation = new SecurityAutomation();