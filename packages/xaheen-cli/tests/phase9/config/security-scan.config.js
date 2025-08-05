/**
 * Security Scanning Configuration for Phase 9 Testing
 * 
 * Defines thresholds and settings for npm audit, Snyk, and other
 * security scanning tools used in the Phase 9 testing pipeline.
 */

export const securityScanConfig = {
  // npm audit configuration
  npmAudit: {
    // Severity thresholds (fail on these levels)
    failOn: ['critical', 'high'],
    // Warn on these levels (don't fail but report)
    warnOn: ['moderate'],
    // Ignore these levels (log only)
    ignoreOn: ['low', 'info'],
    // Maximum allowed vulnerabilities per severity
    thresholds: {
      critical: 0,
      high: 0,
      moderate: 5,
      low: 20,
      info: 100,
    },
    // Audit level (can be 'critical', 'high', 'moderate', 'low', 'info')
    auditLevel: 'moderate',
    // Production dependencies only
    production: true,
    // Skip development dependencies
    dev: false,
    // Output format for reports
    format: 'json',
    // Timeout in milliseconds
    timeout: 30000,
  },

  // Snyk configuration
  snyk: {
    // Authentication token (should be set via environment variable)
    tokenEnvVar: 'SNYK_TOKEN',
    // Organization ID (optional)
    org: process.env.SNYK_ORG || undefined,
    // Severity threshold
    severityThreshold: 'high',
    // Fail on these severities
    failOn: ['critical', 'high'],
    // Test options
    test: {
      // Include development dependencies
      dev: false,
      // Skip unresolved dependencies
      skipUnresolved: true,
      // Output format
      json: true,
      // Timeout in seconds
      timeout: 300,
    },
    // Monitor options (for continuous monitoring)
    monitor: {
      // Enable monitoring
      enabled: process.env.CI === 'true',
      // Project name
      projectName: '@xala-technologies/xaheen-cli',
      // Target file
      targetFile: 'package.json',
    },
    // Policy file path
    policyPath: '.snyk',
    // Paths to ignore
    ignore: [
      'dist/**',
      'test-output/**',
      'coverage/**',
      'node_modules/**',
    ],
  },

  // Dependency check configuration
  dependencyCheck: {
    // Check for known vulnerabilities
    vulnerabilities: true,
    // Check for outdated packages
    outdated: true,
    // Check for deprecated packages
    deprecated: true,
    // Check for security advisories
    advisories: true,
    // Maximum age for dependencies (in days)
    maxAge: {
      critical: 7,
      high: 30,
      moderate: 90,
      low: 365,
    },
    // Exclude certain packages from checks
    exclude: [
      // Add packages to exclude from security checks
    ],
    // Include only production dependencies
    production: true,
  },

  // License compliance configuration
  licenseCheck: {
    // Allowed licenses
    allowed: [
      'MIT',
      'ISC',
      'BSD-2-Clause',
      'BSD-3-Clause',
      'Apache-2.0',
      'CC0-1.0',
      'Unlicense',
    ],
    // Prohibited licenses
    prohibited: [
      'GPL-2.0',
      'GPL-3.0',
      'AGPL-1.0',
      'AGPL-3.0',
      'LGPL-2.0',
      'LGPL-2.1',
      'LGPL-3.0',
      'CPAL-1.0',
      'EPL-1.0',
      'EPL-2.0',
    ],
    // Fail on prohibited licenses
    failOnProhibited: true,
    // Warn on unknown licenses
    warnOnUnknown: true,
    // Check development dependencies
    dev: false,
  },

  // OWASP Dependency Check configuration
  owasp: {
    // Enable OWASP dependency check
    enabled: false, // Disabled by default due to performance impact
    // Database location
    data: '.owasp-dependency-check-data',
    // Output directory
    out: 'test-output/owasp',
    // Output format
    format: 'JSON',
    // Project name
    project: 'xaheen-cli',
    // Scan directories
    scan: ['package.json', 'package-lock.json'],
    // Suppression file
    suppression: 'owasp-suppressions.xml',
    // CVE threshold
    failOnCVSS: 7.0,
    // Update database
    updateOnly: false,
  },

  // Retire.js configuration
  retirejs: {
    // Check for vulnerable JavaScript libraries
    enabled: true,
    // Severity threshold
    severity: 'medium',
    // Check node modules
    node: true,
    // Check JavaScript files
    js: false, // We're primarily TypeScript
    // Output path
    outputpath: 'test-output/retirejs-report.json',
    // Output format
    outputformat: 'json',
    // Exit with error code on vulnerabilities
    exitwith: true,
    // Ignore specific vulnerabilities
    ignore: [
      // Add CVE IDs to ignore
    ],
  },

  // Semgrep configuration (for code security scanning)
  semgrep: {
    // Enable Semgrep scanning
    enabled: true,
    // Rulesets to use
    config: [
      'p/security-audit',
      'p/secrets',
      'p/typescript',
      'p/nodejs',
    ],
    // Output format
    json: true,
    // Output file
    output: 'test-output/semgrep-report.json',
    // Severity levels to report
    severity: ['ERROR', 'WARNING'],
    // Paths to scan
    include: ['src/**/*.ts'],
    // Paths to exclude
    exclude: [
      'dist/**',
      'node_modules/**',
      'test-output/**',
      'coverage/**',
      '**/*.test.ts',
      '**/*.spec.ts',
    ],
    // Fail on findings
    error: true,
    // Maximum allowed findings per severity
    maxFindings: {
      ERROR: 0,
      WARNING: 5,
      INFO: 20,
    },
  },

  // Reporting configuration
  reporting: {
    // Generate HTML report
    html: true,
    // Generate JSON report
    json: true,
    // Generate CSV report
    csv: false,
    // Output directory
    outputDir: 'test-output/security-reports',
    // Report filename template
    filenameTemplate: 'security-report-{timestamp}',
    // Include summary
    summary: true,
    // Include details
    details: true,
    // Include recommendations
    recommendations: true,
    // Include compliance status
    compliance: true,
  },

  // CI/CD integration
  ci: {
    // Exit with error code on failures
    failOnError: true,
    // Generate JUnit XML for CI tools
    junit: true,
    // JUnit output file
    junitOutput: 'test-output/security-junit.xml',
    // Send notifications on failures
    notifications: {
      slack: {
        enabled: false, // Configure as needed
        webhook: process.env.SLACK_WEBHOOK_URL,
        channel: '#security-alerts',
      },
      email: {
        enabled: false, // Configure as needed
        recipients: process.env.SECURITY_EMAIL_RECIPIENTS?.split(',') || [],
      },
    },
  },

  // Performance settings
  performance: {
    // Parallel execution
    parallel: true,
    // Maximum concurrent scans
    maxConcurrency: 4,
    // Timeout for individual scans (in minutes)
    timeout: 10,
    // Cache results
    cache: true,
    // Cache directory
    cacheDir: 'test-output/.security-cache',
    // Cache TTL (in hours)
    cacheTTL: 24,
  },

  // Advanced options
  advanced: {
    // Enable debug logging
    debug: process.env.DEBUG === 'true',
    // Verbose output
    verbose: process.env.VERBOSE === 'true',
    // Dry run mode
    dryRun: process.env.DRY_RUN === 'true',
    // Skip cache
    skipCache: false,
    // Force update databases
    forceUpdate: false,
  },
};

export default securityScanConfig;