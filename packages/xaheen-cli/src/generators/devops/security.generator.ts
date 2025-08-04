import { BaseGenerator } from '../base.generator';
import { TemplateManager } from '../../services/templates/template-loader';
import { ProjectAnalyzer } from '../../services/analysis/project-analyzer';

export interface SecurityGeneratorOptions {
  readonly projectName: string;
  readonly namespace: string;
  readonly environment: 'development' | 'staging' | 'production';
  readonly enableSAST: boolean;
  readonly enableDAST: boolean;
  readonly enableDependencyScanning: boolean;
  readonly enableContainerScanning: boolean;
  readonly enableSecretScanning: boolean;
  readonly enableLicenseScanning: boolean;
  readonly enableComplianceScanning: boolean;
  readonly enableInfrastructureScanning: boolean;
  readonly enableRuntimeSecurity: boolean;
  readonly enableNetworkPolicies: boolean;
  readonly enablePodSecurityPolicies: boolean;
  readonly enableSecurityContexts: boolean;
  readonly enableRBAC: boolean;
  readonly enableOPA: boolean;
  readonly enableFalco: boolean;
  readonly enableIstioSecurity: boolean;
  readonly enableKubeBench: boolean;
  readonly enableKubeHunter: boolean;
  readonly compliance: {
    readonly enabled: boolean;
    readonly gdprCompliant: boolean;
    readonly norwegianCompliant: boolean;
    readonly iso27001: boolean;
    readonly sox: boolean;
    readonly pci: boolean;
    readonly hipaa: boolean;
    readonly dataClassification: readonly DataClassification[];
    readonly encryptionAtRest: boolean;
    readonly encryptionInTransit: boolean;
    readonly keyRotation: boolean;
    readonly auditLogging: boolean;
    readonly accessControl: boolean;
  };
  readonly scanners: {
    readonly sonarqube?: SonarQubeConfig;
    readonly snyk?: SnykConfig;
    readonly trivy?: TrivyConfig;
    readonly clair?: ClairConfig;
    readonly anchore?: AnchoreConfig;
    readonly aqua?: AquaConfig;
    readonly twistlock?: TwistlockConfig;
    readonly blackduck?: BlackDuckConfig;
    readonly veracode?: VeracodeConfig;
    readonly checkmarx?: CheckmarxConfig;
  };
  readonly policies: readonly SecurityPolicy[];
  readonly alerts: readonly SecurityAlert[];
  readonly tools: readonly SecurityTool[];
  readonly certificates: readonly CertificateConfig[];
  readonly secrets: readonly SecretConfig[];
  readonly accessControl: AccessControlConfig;
  readonly logging: SecurityLoggingConfig;
  readonly backup: SecurityBackupConfig;
  readonly incidentResponse: IncidentResponseConfig;
}

export interface DataClassification {
  readonly level: 'public' | 'internal' | 'confidential' | 'restricted';
  readonly retention: string;
  readonly encryption: boolean;
  readonly access: readonly string[];
  readonly labels: Record<string, string>;
}

export interface SonarQubeConfig {
  readonly enabled: boolean;
  readonly serverUrl: string;
  readonly token?: string;
  readonly secretName?: string;
  readonly projectKey: string;
  readonly qualityGate: string;
  readonly excludePatterns: readonly string[];
  readonly includePatterns: readonly string[];
}

export interface SnykConfig {
  readonly enabled: boolean;
  readonly token?: string;
  readonly secretName?: string;
  readonly org: string;
  readonly monitor: boolean;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly failOn: 'all' | 'upgradable' | 'patchable';
}

export interface TrivyConfig {
  readonly enabled: boolean;
  readonly format: 'table' | 'json' | 'sarif';
  readonly severity: readonly string[];
  readonly ignoreUnfixed: boolean;
  readonly dbRepository: string;
  readonly cacheDir: string;
}

export interface ClairConfig {
  readonly enabled: boolean;
  readonly endpoint: string;
  readonly mode: 'combo' | 'indexer' | 'matcher';
  readonly indexerConnString: string;
  readonly matcherConnString: string;
}

export interface AnchoreConfig {
  readonly enabled: boolean;
  readonly endpoint: string;
  readonly username: string;
  readonly password?: string;
  readonly secretName?: string;
  readonly timeout: number;
}

export interface AquaConfig {
  readonly enabled: boolean;
  readonly serverUrl: string;
  readonly username: string;
  readonly password?: string;
  readonly secretName?: string;
  readonly registry: string;
}

export interface TwistlockConfig {
  readonly enabled: boolean;
  readonly consoleUrl: string;
  readonly username: string;
  readonly password?: string;
  readonly secretName?: string;
  readonly complianceThreshold: string;
}

export interface BlackDuckConfig {
  readonly enabled: boolean;
  readonly url: string;
  readonly token?: string;
  readonly secretName?: string;
  readonly projectName: string;
  readonly projectVersion: string;
}

export interface VeracodeConfig {
  readonly enabled: boolean;
  readonly apiId: string;
  readonly apiKey?: string;
  readonly secretName?: string;
  readonly appName: string;
  readonly scanName: string;
}

export interface CheckmarxConfig {
  readonly enabled: boolean;
  readonly serverUrl: string;
  readonly username: string;
  readonly password?: string;
  readonly secretName?: string;
  readonly teamName: string;
  readonly preset: string;
}

export interface SecurityPolicy {
  readonly name: string;
  readonly type: 'network' | 'pod' | 'rbac' | 'opa' | 'falco';
  readonly rules: readonly PolicyRule[];
  readonly enforcement: 'warn' | 'enforce';
  readonly namespaces: readonly string[];
}

export interface PolicyRule {
  readonly name: string;
  readonly condition: string;
  readonly action: 'allow' | 'deny' | 'audit';
  readonly message?: string;
  readonly priority: number;
}

export interface SecurityAlert {
  readonly name: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly condition: string;
  readonly description: string;
  readonly remediation: string;
  readonly notifications: readonly string[];
}

export interface SecurityTool {
  readonly name: string;
  readonly type: 'scanner' | 'monitor' | 'analyzer' | 'enforcer';
  readonly image: string;
  readonly version: string;
  readonly config: Record<string, any>;
  readonly schedule?: string;
}

export interface CertificateConfig {
  readonly name: string;
  readonly type: 'tls' | 'ca' | 'client';
  readonly issuer: string;
  readonly domains: readonly string[];
  readonly keySize: number;
  readonly duration: string;
  readonly renewBefore: string;
  readonly autoRotate: boolean;
}

export interface SecretConfig {
  readonly name: string;
  readonly type: 'generic' | 'tls' | 'docker-registry' | 'service-account-token';
  readonly namespace: string;
  readonly data: Record<string, string>;
  readonly encryption: boolean;
  readonly rotation: {
    readonly enabled: boolean;
    readonly schedule: string;
  };
}

export interface AccessControlConfig {
  readonly rbac: {
    readonly enabled: boolean;
    readonly roles: readonly RBACRole[];
    readonly bindings: readonly RBACBinding[];
  };
  readonly oauth: {
    readonly enabled: boolean;
    readonly provider: 'github' | 'gitlab' | 'google' | 'azure' | 'okta';
    readonly clientId: string;
    readonly clientSecret?: string;
    readonly secretName?: string;
    readonly scopes: readonly string[];
  };
  readonly ldap: {
    readonly enabled: boolean;
    readonly server: string;
    readonly baseDN: string;
    readonly bindDN: string;
    readonly bindPassword?: string;
    readonly secretName?: string;
  };
  readonly mfa: {
    readonly enabled: boolean;
    readonly provider: 'totp' | 'sms' | 'email';
    readonly required: boolean;
  };
}

export interface RBACRole {
  readonly name: string;
  readonly namespace?: string;
  readonly rules: readonly RBACRule[];
}

export interface RBACRule {
  readonly apiGroups: readonly string[];
  readonly resources: readonly string[];
  readonly verbs: readonly string[];
  readonly resourceNames?: readonly string[];
}

export interface RBACBinding {
  readonly name: string;
  readonly namespace?: string;
  readonly roleRef: {
    readonly kind: 'Role' | 'ClusterRole';
    readonly name: string;
  };
  readonly subjects: readonly {
    readonly kind: 'User' | 'Group' | 'ServiceAccount';
    readonly name: string;
    readonly namespace?: string;
  }[];
}

export interface SecurityLoggingConfig {
  readonly enabled: boolean;
  readonly level: 'debug' | 'info' | 'warn' | 'error';
  readonly auditLogs: boolean;
  readonly securityEvents: boolean;
  readonly accessLogs: boolean;
  readonly retention: string;
  readonly encryption: boolean;
  readonly forwarding: {
    readonly enabled: boolean;
    readonly destination: 'siem' | 'splunk' | 'elasticsearch' | 'loki';
    readonly endpoint: string;
    readonly credentials?: string;
  };
}

export interface SecurityBackupConfig {
  readonly enabled: boolean;
  readonly schedule: string;
  readonly retention: string;
  readonly encryption: boolean;
  readonly storage: {
    readonly type: 's3' | 'gcs' | 'azure' | 'local';
    readonly bucket: string;
    readonly credentials?: string;
  };
  readonly verification: boolean;
}

export interface IncidentResponseConfig {
  readonly enabled: boolean;
  readonly playbooks: readonly IncidentPlaybook[];
  readonly contacts: readonly IncidentContact[];
  readonly escalation: readonly EscalationRule[];
  readonly notifications: readonly NotificationChannel[];
}

export interface IncidentPlaybook {
  readonly name: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly triggers: readonly string[];
  readonly steps: readonly PlaybookStep[];
  readonly automation: boolean;
}

export interface PlaybookStep {
  readonly name: string;
  readonly description: string;
  readonly action: string;
  readonly timeout: string;
  readonly rollback?: string;
}

export interface IncidentContact {
  readonly name: string;
  readonly role: string;
  readonly email: string;
  readonly phone?: string;
  readonly escalation: number;
}

export interface EscalationRule {
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly timeout: string;
  readonly contacts: readonly string[];
}

export interface NotificationChannel {
  readonly name: string;
  readonly type: 'email' | 'slack' | 'webhook' | 'pagerduty';
  readonly config: Record<string, any>;
}

export class SecurityGenerator extends BaseGenerator<SecurityGeneratorOptions> {
  private readonly templateManager: TemplateManager;
  private readonly analyzer: ProjectAnalyzer;

  constructor() {
    super();
    this.templateManager = new TemplateManager();
    this.analyzer = new ProjectAnalyzer();
  }

  async generate(options: SecurityGeneratorOptions): Promise<void> {
    try {
      await this.validateOptions(options);
      
      const projectContext = await this.analyzer.analyze(process.cwd());
      
      // Create security directory structure
      await this.createSecurityStructure(options);
      
      // Generate SAST configurations
      if (options.enableSAST) {
        await this.generateSASTConfigurations(options);
      }
      
      // Generate DAST configurations
      if (options.enableDAST) {
        await this.generateDASTConfigurations(options);
      }
      
      // Generate dependency scanning
      if (options.enableDependencyScanning) {
        await this.generateDependencyScanning(options);
      }
      
      // Generate container scanning
      if (options.enableContainerScanning) {
        await this.generateContainerScanning(options);
      }
      
      // Generate secret scanning
      if (options.enableSecretScanning) {
        await this.generateSecretScanning(options);
      }
      
      // Generate compliance configurations
      if (options.compliance.enabled) {
        await this.generateComplianceConfigurations(options);
      }
      
      // Generate Kubernetes security policies
      await this.generateKubernetesSecurity(options);
      
      // Generate RBAC configurations
      if (options.enableRBAC) {
        await this.generateRBACConfigurations(options);
      }
      
      // Generate OPA policies
      if (options.enableOPA) {
        await this.generateOPAPolicies(options);
      }
      
      // Generate Falco rules
      if (options.enableFalco) {
        await this.generateFalcoRules(options);
      }
      
      // Generate runtime security
      if (options.enableRuntimeSecurity) {
        await this.generateRuntimeSecurity(options);
      }
      
      // Generate certificate management
      await this.generateCertificateManagement(options);
      
      // Generate secret management
      await this.generateSecretManagement(options);
      
      // Generate security monitoring
      await this.generateSecurityMonitoring(options);
      
      // Generate incident response
      if (options.incidentResponse.enabled) {
        await this.generateIncidentResponse(options);
      }
      
      // Generate CI/CD security integrations
      await this.generateCICDSecurity(options);
      
      // Generate security documentation
      await this.generateSecurityDocumentation(options);
      
      this.logger.success('Security configurations generated successfully');
      
    } catch (error) {
      this.logger.error('Failed to generate security configurations', error);
      throw error;
    }
  }

  private async validateOptions(options: SecurityGeneratorOptions): Promise<void> {
    if (!options.projectName) {
      throw new Error('Project name is required');
    }
    
    if (!options.namespace) {
      throw new Error('Namespace is required');
    }
    
    if (options.compliance.enabled && !options.compliance.gdprCompliant && !options.compliance.norwegianCompliant) {
      this.logger.warn('Compliance is enabled but no specific compliance standards are set');
    }
  }

  private async createSecurityStructure(options: SecurityGeneratorOptions): Promise<void> {
    const directories = [
      'security',
      'security/sast',
      'security/dast',
      'security/dependency-scanning',
      'security/container-scanning',
      'security/secret-scanning',
      'security/compliance',
      'security/policies',
      'security/rbac',
      'security/opa',
      'security/falco',
      'security/certificates',
      'security/secrets',
      'security/monitoring',
      'security/incident-response',
      'security/documentation',
      'security/benchmarks',
      'security/runtime'
    ];

    for (const dir of directories) {
      await this.templateManager.renderTemplate(
        'devops/security/structure/.gitkeep.hbs',
        `${dir}/.gitkeep`,
        {}
      );
    }
  }

  private async generateSASTConfigurations(options: SecurityGeneratorOptions): Promise<void> {
    // SonarQube configuration
    if (options.scanners.sonarqube?.enabled) {
      const sonarConfig = {
        'sonar.projectKey': options.scanners.sonarqube.projectKey,
        'sonar.projectName': options.projectName,
        'sonar.projectVersion': '1.0.0',
        'sonar.sources': '.',
        'sonar.exclusions': options.scanners.sonarqube.excludePatterns.join(','),
        'sonar.inclusions': options.scanners.sonarqube.includePatterns.join(','),
        'sonar.qualitygate.wait': 'true',
        'sonar.qualitygate.timeout': '300',
        // Norwegian compliance settings
        ...(options.compliance.norwegianCompliant && {
          'sonar.scm.disabled': 'true',
          'sonar.cpd.exclusions': '**/*.min.js,**/*.bundle.js'
        })
      };

      await this.templateManager.renderTemplate(
        'devops/security/sast/sonar-project.properties.hbs',
        'security/sast/sonar-project.properties',
        { config: sonarConfig }
      );
    }

    // CodeQL configuration
    const codeqlConfig = {
      name: 'CodeQL',
      on: {
        push: {
          branches: ['main', 'develop']
        },
        pull_request: {
          branches: ['main']
        },
        schedule: [
          {
            cron: '0 2 * * 1'
          }
        ]
      },
      jobs: {
        analyze: {
          name: 'Analyze',
          'runs-on': 'ubuntu-latest',
          permissions: {
            actions: 'read',
            contents: 'read',
            'security-events': 'write'
          },
          strategy: {
            fail_fast: false,
            matrix: {
              language: ['javascript', 'typescript', 'python', 'java', 'go', 'csharp']
            }
          },
          steps: [
            {
              name: 'Checkout repository',
              uses: 'actions/checkout@v4'
            },
            {
              name: 'Initialize CodeQL',
              uses: 'github/codeql-action/init@v3',
              with: {
                languages: '${{ matrix.language }}',
                queries: 'security-extended,security-and-quality'
              }
            },
            {
              name: 'Autobuild',
              uses: 'github/codeql-action/autobuild@v3'
            },
            {
              name: 'Perform CodeQL Analysis',
              uses: 'github/codeql-action/analyze@v3',
              with: {
                category: '/language:${{matrix.language}}'
              }
            }
          ]
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/security/sast/codeql.yml.hbs',
      'security/sast/codeql-analysis.yml',
      codeqlConfig
    );

    // Semgrep configuration
    const semgrepConfig = {
      rules: [
        {
          id: 'hardcoded-secrets',
          pattern: '$VAR = "..."',
          message: 'Potential hardcoded secret',
          severity: 'ERROR',
          languages: ['javascript', 'typescript', 'python', 'go', 'java']
        },
        {
          id: 'sql-injection',
          pattern: 'query($USER_INPUT)',
          message: 'Potential SQL injection vulnerability',
          severity: 'ERROR',
          languages: ['javascript', 'typescript', 'python', 'java']
        },
        {
          id: 'xss-vulnerability',
          pattern: 'innerHTML = $USER_INPUT',
          message: 'Potential XSS vulnerability',
          severity: 'ERROR',
          languages: ['javascript', 'typescript']
        }
      ],
      paths: {
        include: ['src/', 'lib/', 'app/'],
        exclude: ['node_modules/', 'dist/', 'build/', 'test/']
      }
    };

    await this.templateManager.renderTemplate(
      'devops/security/sast/semgrep.yml.hbs',
      'security/sast/.semgrep.yml',
      semgrepConfig
    );
  }

  private async generateDASTConfigurations(options: SecurityGeneratorOptions): Promise<void> {
    // OWASP ZAP configuration
    const zapConfig = {
      version: '2.12.0',
      format: 'openapi',
      plan: {
        target: 'https://example.com',
        rules: [
          {
            id: 10020,
            name: 'X-Frame-Options Header Not Set',
            threshold: 'HIGH'
          },
          {
            id: 10021,
            name: 'X-Content-Type-Options Header Missing',
            threshold: 'MEDIUM'
          },
          {
            id: 10023,
            name: 'Information Disclosure - Debug Error Messages',
            threshold: 'LOW'
          }
        ]
      },
      authentication: {
        method: 'form',
        loginUrl: 'https://example.com/login',
        username: 'test@example.com',
        password: 'testpassword',
        usernameField: 'email',
        passwordField: 'password'
      },
      scanning: {
        policy: 'Default Policy',
        contexts: ['Default Context'],
        delay: 0,
        maxRuleDurationInMins: 5,
        maxScanDurationInMins: 30
      }
    };

    await this.templateManager.renderTemplate(
      'devops/security/dast/zap-config.yaml.hbs',
      'security/dast/zap-config.yaml',
      zapConfig
    );

    // Nuclei configuration
    const nucleiConfig = {
      templates: [
        'cves/',
        'exposures/',
        'misconfiguration/',
        'vulnerabilities/',
        'network/',
        'dns/'
      ],
      'exclude-templates': [
        'dos/',
        'brute-force/'
      ],
      severity: ['critical', 'high', 'medium'],
      'rate-limit': 150,
      'bulk-size': 25,
      'timeout': 5,
      'retries': 1,
      'max-host-error': 30,
      'disable-clustering': false,
      output: 'security/dast/nuclei-results.json',
      'json-export': 'security/dast/nuclei-export.json'
    };

    await this.templateManager.renderTemplate(
      'devops/security/dast/nuclei-config.yaml.hbs',
      'security/dast/nuclei-config.yaml',
      nucleiConfig
    );
  }

  private async generateDependencyScanning(options: SecurityGeneratorOptions): Promise<void> {
    // Snyk configuration
    if (options.scanners.snyk?.enabled) {
      const snykConfig = {
        version: '1',
        orgs: {
          [options.scanners.snyk.org]: {
            settings: {
              'ignore-policy': '.snyk',
              'license-policy': 'license-policy.json'
            }
          }
        },
        ignore: {
          'SNYK-JS-LODASH-567746': {
            reason: 'Not applicable to our use case',
            expires: '2024-12-31T23:59:59.999Z'
          }
        }
      };

      await this.templateManager.renderTemplate(
        'devops/security/dependency-scanning/snyk.json.hbs',
        'security/dependency-scanning/.snyk',
        snykConfig
      );
    }

    // npm audit configuration
    const npmAuditConfig = {
      'audit-level': 'moderate',
      'fund': false,
      'package-lock-only': true,
      'omit': ['dev'],
      'registry': 'https://registry.npmjs.org/'
    };

    await this.templateManager.renderTemplate(
      'devops/security/dependency-scanning/npmrc.hbs',
      'security/dependency-scanning/.npmrc',
      npmAuditConfig
    );

    // Dependabot configuration
    const dependabotConfig = {
      version: 2,
      updates: [
        {
          'package-ecosystem': 'npm',
          directory: '/',
          schedule: {
            interval: 'weekly',
            day: 'monday',
            time: '09:00',
            timezone: 'Europe/Oslo'
          },
          'allow': [
            {
              'dependency-type': 'direct'
            }
          ],
          'ignore': [
            {
              'dependency-name': 'lodash',
              versions: ['4.17.20']
            }
          ],
          'reviewers': ['security-team'],
          'assignees': ['devops-team'],
          labels: ['dependencies', 'security'],
          'commit-message': {
            prefix: 'security',
            'prefix-development': 'chore',
            include: 'scope'
          }
        }
      ]
    };

    await this.templateManager.renderTemplate(
      'devops/security/dependency-scanning/dependabot.yml.hbs',
      '.github/dependabot.yml',
      dependabotConfig
    );
  }

  private async generateContainerScanning(options: SecurityGeneratorOptions): Promise<void> {
    // Trivy configuration
    if (options.scanners.trivy?.enabled) {
      const trivyConfig = {
        format: options.scanners.trivy.format,
        severity: options.scanners.trivy.severity.join(','),
        'ignore-unfixed': options.scanners.trivy.ignoreUnfixed,
        'skip-files': [
          '/usr/bin/git',
          '/usr/bin/ssh'
        ],
        'skip-dirs': [
          '/tmp',
          '/var/tmp'
        ],
        cache: {
          dir: options.scanners.trivy.cacheDir
        },
        db: {
          repository: options.scanners.trivy.dbRepository
        }
      };

      await this.templateManager.renderTemplate(
        'devops/security/container-scanning/trivy.yaml.hbs',
        'security/container-scanning/trivy.yaml',
        trivyConfig
      );
    }

    // Grype configuration
    const grypeConfig = {
      'ignore-policy': {
        'ignore-rules': [
          {
            vulnerability: 'CVE-2022-1234',
            'fix-state': 'not-fixed',
            package: {
              name: 'openssl',
              version: '1.1.1'
            }
          }
        ]
      },
      registry: {
        'insecure-skip-tls-verify': false,
        'insecure-use-http': false,
        'ca-cert': '/path/to/ca.crt'
      },
      output: {
        format: 'json',
        file: 'security/container-scanning/grype-results.json'
      }
    };

    await this.templateManager.renderTemplate(
      'devops/security/container-scanning/grype.yaml.hbs',
      'security/container-scanning/.grype.yaml',
      grypeConfig
    );

    // Docker security best practices
    const dockerSecurityConfig = {
      rules: [
        {
          name: 'Use specific image tags',
          description: 'Avoid using latest tag',
          severity: 'HIGH',
          pattern: 'FROM.*:latest'
        },
        {
          name: 'Run as non-root user',
          description: 'Create and use non-root user',
          severity: 'HIGH',
          pattern: 'USER 0|USER root'
        },
        {
          name: 'Remove package manager cache',
          description: 'Clean up package manager cache',
          severity: 'MEDIUM',
          pattern: 'apt-get.*update.*(?!.*rm.*apt.*lists)'
        }
      ],
      exceptions: [
        {
          rule: 'Use specific image tags',
          images: ['nginx:latest'],
          reason: 'Officially maintained base image'
        }
      ]
    };

    await this.templateManager.renderTemplate(
      'devops/security/container-scanning/docker-security.yaml.hbs',
      'security/container-scanning/docker-security.yaml',
      dockerSecurityConfig
    );
  }

  private async generateKubernetesSecurity(options: SecurityGeneratorOptions): Promise<void> {
    // Pod Security Standards
    if (options.enablePodSecurityPolicies) {
      const podSecurityStandards = {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
          name: options.namespace,
          labels: {
            'pod-security.kubernetes.io/enforce': 'restricted',
            'pod-security.kubernetes.io/audit': 'restricted',
            'pod-security.kubernetes.io/warn': 'restricted'
          }
        }
      };

      await this.templateManager.renderTemplate(
        'devops/security/policies/pod-security-standards.yaml.hbs',
        'security/policies/pod-security-standards.yaml',
        podSecurityStandards
      );
    }

    // Network Policies
    if (options.enableNetworkPolicies) {
      const networkPolicies = options.policies
        .filter(policy => policy.type === 'network')
        .map(policy => ({
          apiVersion: 'networking.k8s.io/v1',
          kind: 'NetworkPolicy',
          metadata: {
            name: policy.name,
            namespace: options.namespace
          },
          spec: {
            podSelector: {},
            policyTypes: ['Ingress', 'Egress'],
            ingress: policy.rules
              .filter(rule => rule.action === 'allow')
              .map(rule => ({
                from: [
                  {
                    namespaceSelector: {
                      matchLabels: {
                        name: options.namespace
                      }
                    }
                  }
                ],
                ports: [
                  {
                    protocol: 'TCP',
                    port: 80
                  }
                ]
              })),
            egress: [
              {
                to: [],
                ports: [
                  { protocol: 'TCP', port: 53 },
                  { protocol: 'UDP', port: 53 }
                ]
              }
            ]
          }
        }));

      for (const policy of networkPolicies) {
        await this.templateManager.renderTemplate(
          'devops/security/policies/network-policy.yaml.hbs',
          `security/policies/network-policy-${policy.metadata.name}.yaml`,
          policy
        );
      }
    }

    // Security Contexts
    if (options.enableSecurityContexts) {
      const securityContexts = {
        default: {
          runAsNonRoot: true,
          runAsUser: 1000,
          runAsGroup: 3000,
          fsGroup: 2000,
          seccompProfile: {
            type: 'RuntimeDefault'
          },
          capabilities: {
            drop: ['ALL'],
            add: ['NET_BIND_SERVICE']
          },
          allowPrivilegeEscalation: false,
          readOnlyRootFilesystem: true
        },
        privileged: {
          runAsNonRoot: false,
          runAsUser: 0,
          privileged: true,
          capabilities: {
            add: ['SYS_ADMIN', 'NET_ADMIN']
          }
        }
      };

      await this.templateManager.renderTemplate(
        'devops/security/policies/security-contexts.yaml.hbs',
        'security/policies/security-contexts.yaml',
        { contexts: securityContexts }
      );
    }
  }

  private async generateRBACConfigurations(options: SecurityGeneratorOptions): Promise<void> {
    const rbacConfig = options.accessControl.rbac;
    
    if (rbacConfig.enabled) {
      // Generate ClusterRoles
      for (const role of rbacConfig.roles) {
        const clusterRole = {
          apiVersion: 'rbac.authorization.k8s.io/v1',
          kind: role.namespace ? 'Role' : 'ClusterRole',
          metadata: {
            name: role.name,
            ...(role.namespace && { namespace: role.namespace })
          },
          rules: role.rules
        };

        await this.templateManager.renderTemplate(
          'devops/security/rbac/role.yaml.hbs',
          `security/rbac/${role.name}-role.yaml`,
          clusterRole
        );
      }

      // Generate RoleBindings
      for (const binding of rbacConfig.bindings) {
        const roleBinding = {
          apiVersion: 'rbac.authorization.k8s.io/v1',
          kind: binding.namespace ? 'RoleBinding' : 'ClusterRoleBinding',
          metadata: {
            name: binding.name,
            ...(binding.namespace && { namespace: binding.namespace })
          },
          roleRef: {
            apiGroup: 'rbac.authorization.k8s.io',
            ...binding.roleRef
          },
          subjects: binding.subjects
        };

        await this.templateManager.renderTemplate(
          'devops/security/rbac/binding.yaml.hbs',
          `security/rbac/${binding.name}-binding.yaml`,
          roleBinding
        );
      }

      // Generate common RBAC roles
      const commonRoles = [
        {
          name: 'developer',
          rules: [
            {
              apiGroups: [''],
              resources: ['pods', 'services', 'configmaps'],
              verbs: ['get', 'list', 'watch']
            },
            {
              apiGroups: ['apps'],
              resources: ['deployments', 'replicasets'],
              verbs: ['get', 'list', 'watch']
            }
          ]
        },
        {
          name: 'operator',
          rules: [
            {
              apiGroups: [''],
              resources: ['*'],
              verbs: ['*']
            },
            {
              apiGroups: ['apps'],
              resources: ['*'],
              verbs: ['*']
            }
          ]
        }
      ];

      for (const role of commonRoles) {
        await this.templateManager.renderTemplate(
          'devops/security/rbac/common-role.yaml.hbs',
          `security/rbac/common-${role.name}-role.yaml`,
          {
            apiVersion: 'rbac.authorization.k8s.io/v1',
            kind: 'ClusterRole',
            metadata: { name: `${options.projectName}-${role.name}` },
            rules: role.rules
          }
        );
      }
    }
  }

  private async generateOPAPolicies(options: SecurityGeneratorOptions): Promise<void> {
    if (!options.enableOPA) return;

    // Gatekeeper constraint templates
    const constraintTemplates = [
      {
        name: 'RequiredLabels',
        description: 'Requires specified labels on resources',
        rego: `
          package requiredlabels
          
          violation[{"msg": msg}] {
            required := input.parameters.labels
            provided := input.review.object.metadata.labels
            missing := required[_]
            not provided[missing]
            msg := sprintf("You must provide labels: %v", [missing])
          }
        `,
        properties: {
          labels: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      },
      {
        name: 'ContainerLimits',
        description: 'Requires resource limits on containers',
        rego: `
          package containerlimits
          
          violation[{"msg": msg}] {
            container := input.review.object.spec.containers[_]
            not container.resources.limits.memory
            msg := sprintf("Container %v is missing memory limits", [container.name])
          }
          
          violation[{"msg": msg}] {
            container := input.review.object.spec.containers[_]
            not container.resources.limits.cpu
            msg := sprintf("Container %v is missing CPU limits", [container.name])
          }
        `
      },
      {
        name: 'NoPrivilegedContainers',
        description: 'Prevents privileged containers',
        rego: `
          package noprivileged
          
          violation[{"msg": msg}] {
            container := input.review.object.spec.containers[_]
            container.securityContext.privileged
            msg := sprintf("Container %v cannot run in privileged mode", [container.name])
          }
        `
      }
    ];

    for (const template of constraintTemplates) {
      const constraintTemplate = {
        apiVersion: 'templates.gatekeeper.sh/v1beta1',
        kind: 'ConstraintTemplate',
        metadata: {
          name: template.name.toLowerCase()
        },
        spec: {
          crd: {
            spec: {
              names: {
                kind: template.name
              },
              validation: {
                openAPIV3Schema: {
                  type: 'object',
                  properties: template.properties || {}
                }
              }
            }
          },
          targets: [
            {
              target: 'admission.k8s.gatekeeper.sh',
              rego: template.rego
            }
          ]
        }
      };

      await this.templateManager.renderTemplate(
        'devops/security/opa/constraint-template.yaml.hbs',
        `security/opa/${template.name.toLowerCase()}-template.yaml`,
        constraintTemplate
      );
    }

    // Generate constraints
    const constraints = [
      {
        kind: 'RequiredLabels',
        name: 'must-have-environment',
        spec: {
          match: {
            kinds: [
              { apiGroups: ['apps'], kinds: ['Deployment'] },
              { apiGroups: [''], kinds: ['Service'] }
            ]
          },
          parameters: {
            labels: ['environment', 'app', 'version']
          }
        }
      },
      {
        kind: 'ContainerLimits',
        name: 'container-must-have-limits',
        spec: {
          match: {
            kinds: [
              { apiGroups: ['apps'], kinds: ['Deployment'] }
            ]
          }
        }
      },
      {
        kind: 'NoPrivilegedContainers',
        name: 'no-privileged-containers',
        spec: {
          match: {
            kinds: [
              { apiGroups: ['apps'], kinds: ['Deployment'] }
            ]
          }
        }
      }
    ];

    for (const constraint of constraints) {
      await this.templateManager.renderTemplate(
        'devops/security/opa/constraint.yaml.hbs',
        `security/opa/${constraint.name}-constraint.yaml`,
        {
          apiVersion: 'constraints.gatekeeper.sh/v1beta1',
          kind: constraint.kind,
          metadata: { name: constraint.name },
          spec: constraint.spec
        }
      );
    }
  }

  private async generateFalcoRules(options: SecurityGeneratorOptions): Promise<void> {
    if (!options.enableFalco) return;

    const falcoRules = {
      customRules: [
        {
          rule: 'Detect Crypto Mining',
          desc: 'Detect cryptocurrency mining activities',
          condition: 'spawned_process and proc.name in (xmrig, minergate, cpuminer)',
          output: 'Crypto mining detected (user=%user.name command=%proc.cmdline)',
          priority: 'CRITICAL',
          tags: ['cryptocurrency', 'mining']
        },
        {
          rule: 'Unauthorized Network Connection',
          desc: 'Detect unauthorized outbound network connections',
          condition: 'outbound and not fd.sip in (allowed_ips)',
          output: 'Unauthorized network connection (user=%user.name dest=%fd.sip.name)',
          priority: 'WARNING',
          tags: ['network', 'unauthorized']
        },
        {
          rule: 'Suspicious File Access',
          desc: 'Detect access to sensitive files',
          condition: 'open_read and fd.name in (/etc/shadow, /etc/passwd, /root/.ssh/id_rsa)',
          output: 'Sensitive file accessed (user=%user.name file=%fd.name)',
          priority: 'HIGH',
          tags: ['filesystem', 'sensitive']
        },
        {
          rule: 'Container Privilege Escalation',
          desc: 'Detect privilege escalation attempts in containers',
          condition: 'container and spawned_process and proc.name in (sudo, su, doas)',
          output: 'Privilege escalation in container (user=%user.name container=%container.name command=%proc.cmdline)',
          priority: 'CRITICAL',
          tags: ['container', 'privilege-escalation']
        }
      ],
      macros: [
        {
          macro: 'allowed_ips',
          condition: '(fd.sip in (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.1))'
        },
        {
          macro: 'sensitive_files',
          condition: '(fd.name startswith /etc/ or fd.name startswith /root/)'
        }
      ],
      lists: [
        {
          list: 'cryptocurrency_miners',
          items: ['xmrig', 'minergate', 'cpuminer', 'ccminer', 'ethminer']
        },
        {
          list: 'admin_users',
          items: ['root', 'admin', 'administrator']
        }
      ]
    };

    await this.templateManager.renderTemplate(
      'devops/security/falco/custom-rules.yaml.hbs',
      'security/falco/custom-rules.yaml',
      falcoRules
    );

    // Falco configuration
    const falcoConfig = {
      rules_file: [
        '/etc/falco/falco_rules.yaml',
        '/etc/falco/falco_rules.local.yaml',
        '/etc/falco/rules.d'
      ],
      time_format_iso_8601: true,
      json_output: true,
      json_include_output_property: true,
      log_stderr: true,
      log_syslog: true,
      log_level: 'info',
      priority: 'debug',
      buffered_outputs: false,
      syscall_event_drops: {
        actions: ['log', 'alert'],
        rate: 0.03333,
        max_burst: 1000
      },
      outputs: {
        rate: 1,
        max_burst: 1000
      },
      syslog_output: {
        enabled: true
      },
      file_output: {
        enabled: true,
        keep_alive: false,
        filename: '/opt/falco/events.txt'
      },
      stdout_output: {
        enabled: true
      },
      webserver: {
        enabled: true,
        listen_port: 8765,
        k8s_healthz_endpoint: '/healthz',
        ssl_enabled: false,
        ssl_certificate: '/etc/falco/falco.pem'
      },
      program_output: {
        enabled: false,
        keep_alive: false,
        program: 'mail -s "Falco Notification" someone@example.com'
      },
      http_output: {
        enabled: true,
        url: 'http://localhost:8080/webhook',
        user_agent: 'falco'
      },
      grpc: {
        enabled: false,
        bind_address: '0.0.0.0:5060',
        threadiness: 8
      },
      grpc_output: {
        enabled: false
      }
    };

    await this.templateManager.renderTemplate(
      'devops/security/falco/falco.yaml.hbs',
      'security/falco/falco.yaml',
      falcoConfig
    );
  }

  private async generateRuntimeSecurity(options: SecurityGeneratorOptions): Promise<void> {
    if (!options.enableRuntimeSecurity) return;

    // Sysdig Secure configuration
    const sysdigConfig = {
      sysdig: {
        accessKey: '${SYSDIG_ACCESS_KEY}',
        settings: {
          tags: `cluster:${options.projectName},environment:${options.environment}`,
          collector: 'collector.sysdigcloud.com',
          collector_port: 6443,
          ssl: true,
          new_k8s: true,
          k8s_cluster_name: options.projectName
        }
      },
      nodeImageAnalyzer: {
        deploy: true,
        settings: {
          httpProxy: '',
          httpsProxy: '',
          noProxy: ''
        }
      },
      secure: {
        enabled: true
      }
    };

    await this.templateManager.renderTemplate(
      'devops/security/runtime/sysdig-config.yaml.hbs',
      'security/runtime/sysdig-config.yaml',
      sysdigConfig
    );

    // Twistlock/Prisma Cloud configuration
    const twistlockConfig = {
      console: {
        url: options.scanners.twistlock?.consoleUrl || 'https://console.example.com',
        username: options.scanners.twistlock?.username || 'admin',
        password: '${TWISTLOCK_PASSWORD}'
      },
      defender: {
        type: 'daemonset',
        namespace: 'twistlock',
        serviceAccount: 'twistlock-service',
        priorityClassName: 'twistlock-critical',
        resources: {
          requests: {
            cpu: '100m',
            memory: '256Mi'
          },
          limits: {
            cpu: '1000m',
            memory: '1Gi'
          }
        }
      },
      policies: {
        runtime: {
          name: `${options.projectName}-runtime-policy`,
          rules: [
            {
              name: 'Block cryptocurrency mining',
              effect: 'prevent',
              condition: 'proc.name in (xmrig, minergate)'
            },
            {
              name: 'Monitor file system changes',
              effect: 'alert',
              condition: 'fs.operation in (create, modify, delete) and fs.path startswith /etc'
            }
          ]
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/security/runtime/twistlock-config.yaml.hbs',
      'security/runtime/twistlock-config.yaml',
      twistlockConfig
    );
  }

  private async generateCertificateManagement(options: SecurityGeneratorOptions): Promise<void> {
    // cert-manager configuration
    const certManagerConfig = {
      global: {
        leaderElection: {
          namespace: 'cert-manager'
        }
      },
      installCRDs: true,
      replicaCount: 1,
      strategy: {
        type: 'Recreate'
      },
      podDisruptionBudget: {
        enabled: true,
        minAvailable: 1
      },
      securityContext: {
        runAsNonRoot: true,
        runAsUser: 1000,
        runAsGroup: 1000
      },
      resources: {
        requests: {
          cpu: '10m',
          memory: '32Mi'
        },
        limits: {
          cpu: '100m',
          memory: '128Mi'
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/security/certificates/cert-manager-values.yaml.hbs',
      'security/certificates/cert-manager-values.yaml',
      certManagerConfig
    );

    // Generate certificate issuers
    for (const cert of options.certificates) {
      const issuer = {
        apiVersion: 'cert-manager.io/v1',
        kind: 'ClusterIssuer',
        metadata: {
          name: cert.issuer
        },
        spec: {
          acme: {
            server: 'https://acme-v02.api.letsencrypt.org/directory',
            email: `admin@${options.projectName}.no`,
            privateKeySecretRef: {
              name: `${cert.issuer}-private-key`
            },
            solvers: [
              {
                http01: {
                  ingress: {
                    class: 'nginx'
                  }
                }
              }
            ]
          }
        }
      };

      await this.templateManager.renderTemplate(
        'devops/security/certificates/cluster-issuer.yaml.hbs',
        `security/certificates/${cert.issuer}-issuer.yaml`,
        issuer
      );

      // Generate certificate
      const certificate = {
        apiVersion: 'cert-manager.io/v1',
        kind: 'Certificate',
        metadata: {
          name: cert.name,
          namespace: options.namespace
        },
        spec: {
          secretName: `${cert.name}-tls`,
          issuerRef: {
            name: cert.issuer,
            kind: 'ClusterIssuer'
          },
          dnsNames: cert.domains,
          duration: cert.duration,
          renewBefore: cert.renewBefore,
          subject: {
            organizations: [options.projectName]
          },
          privateKey: {
            algorithm: 'RSA',
            encoding: 'PKCS1',
            size: cert.keySize
          }
        }
      };

      await this.templateManager.renderTemplate(
        'devops/security/certificates/certificate.yaml.hbs',
        `security/certificates/${cert.name}-certificate.yaml`,
        certificate
      );
    }
  }

  private async generateSecretManagement(options: SecurityGeneratorOptions): Promise<void> {
    // External Secrets Operator configuration
    const externalSecretsConfig = {
      installCRDs: true,
      replicaCount: 1,
      leaderElect: true,
      scopedNamespace: options.namespace,
      createOperatorNamespace: true,
      securityContext: {
        runAsNonRoot: true,
        runAsUser: 65532,
        runAsGroup: 65532
      },
      resources: {
        requests: {
          cpu: '10m',
          memory: '32Mi'
        },
        limits: {
          cpu: '100m',
          memory: '128Mi'
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/security/secrets/external-secrets-values.yaml.hbs',
      'security/secrets/external-secrets-values.yaml',
      externalSecretsConfig
    );

    // Generate secret stores
    const secretStore = {
      apiVersion: 'external-secrets.io/v1beta1',
      kind: 'SecretStore',
      metadata: {
        name: 'vault-backend',
        namespace: options.namespace
      },
      spec: {
        provider: {
          vault: {
            server: 'https://vault.example.com',
            path: 'secret',
            version: 'v2',
            auth: {
              kubernetes: {
                mountPath: 'kubernetes',
                role: 'external-secrets',
                serviceAccountRef: {
                  name: 'external-secrets-sa'
                }
              }
            }
          }
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/security/secrets/secret-store.yaml.hbs',
      'security/secrets/secret-store.yaml',
      secretStore
    );

    // Generate external secrets for each secret config
    for (const secret of options.secrets) {
      const externalSecret = {
        apiVersion: 'external-secrets.io/v1beta1',
        kind: 'ExternalSecret',
        metadata: {
          name: secret.name,
          namespace: secret.namespace
        },
        spec: {
          refreshInterval: '1h',
          secretStoreRef: {
            name: 'vault-backend',
            kind: 'SecretStore'
          },
          target: {
            name: secret.name,
            creationPolicy: 'Owner',
            template: {
              type: secret.type,
              metadata: {
                labels: {
                  'app.kubernetes.io/managed-by': 'external-secrets'
                }
              }
            }
          },
          data: Object.keys(secret.data).map(key => ({
            secretKey: key,
            remoteRef: {
              key: `${secret.name}/${key}`,
              property: 'value'
            }
          }))
        }
      };

      await this.templateManager.renderTemplate(
        'devops/security/secrets/external-secret.yaml.hbs',
        `security/secrets/${secret.name}-external-secret.yaml`,
        externalSecret
      );
    }

    // Sealed Secrets configuration
    const sealedSecretsConfig = {
      fullnameOverride: 'sealed-secrets-controller',
      image: {
        repository: 'quay.io/bitnami/sealed-secrets-controller',
        tag: 'v0.18.0'
      },
      resources: {
        requests: {
          cpu: '50m',
          memory: '64Mi'
        },
        limits: {
          cpu: '100m',
          memory: '128Mi'
        }
      },
      livenessProbe: {
        httpGet: {
          path: '/healthz',
          port: 8080
        }
      },
      readinessProbe: {
        httpGet: {
          path: '/healthz',
          port: 8080
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/security/secrets/sealed-secrets-values.yaml.hbs',
      'security/secrets/sealed-secrets-values.yaml',
      sealedSecretsConfig
    );
  }

  private async generateSecurityMonitoring(options: SecurityGeneratorOptions): Promise<void> {
    // Security monitoring configuration
    const securityMonitoring = {
      alerts: options.alerts.map(alert => ({
        alert: alert.name,
        expr: alert.condition,
        for: '5m',
        labels: {
          severity: alert.severity,
          team: 'security'
        },
        annotations: {
          summary: alert.description,
          description: alert.remediation,
          runbook_url: `https://runbooks.${options.projectName}.no/security/${alert.name}`
        }
      })),
      dashboards: [
        {
          name: 'Security Overview',
          panels: [
            {
              title: 'Security Events by Severity',
              type: 'piechart',
              targets: [
                {
                  expr: 'sum by (severity) (security_events_total)',
                  legendFormat: '{{ severity }}'
                }
              ]
            },
            {
              title: 'Failed Authentication Attempts',
              type: 'graph',
              targets: [
                {
                  expr: 'rate(auth_failures_total[5m])',
                  legendFormat: 'Failed Attempts/sec'
                }
              ]
            },
            {
              title: 'Vulnerability Scan Results',
              type: 'table',
              targets: [
                {
                  expr: 'vulnerability_scan_results',
                  format: 'table'
                }
              ]
            }
          ]
        }
      ]
    };

    await this.templateManager.renderTemplate(
      'devops/security/monitoring/security-monitoring.yaml.hbs',
      'security/monitoring/security-monitoring.yaml',
      securityMonitoring
    );

    // SIEM integration configuration
    const siemConfig = {
      splunk: {
        enabled: false,
        host: 'splunk.example.com',
        port: 8088,
        token: '${SPLUNK_TOKEN}',
        index: 'security',
        sourcetype: 'kubernetes'
      },
      elasticsearch: {
        enabled: true,
        hosts: ['elasticsearch.example.com:9200'],
        index: 'security-logs',
        username: 'elastic',
        password: '${ELASTIC_PASSWORD}'
      },
      sumo_logic: {
        enabled: false,
        endpoint: 'https://collectors.sumologic.com/receiver/v1/http/${SUMO_LOGIC_TOKEN}',
        sourceName: 'kubernetes-security',
        sourceCategory: 'security/kubernetes'
      }
    };

    await this.templateManager.renderTemplate(
      'devops/security/monitoring/siem-config.yaml.hbs',
      'security/monitoring/siem-config.yaml',
      siemConfig
    );
  }

  private async generateComplianceConfigurations(options: SecurityGeneratorOptions): Promise<void> {
    if (!options.compliance.enabled) return;

    // GDPR compliance configuration
    if (options.compliance.gdprCompliant) {
      const gdprConfig = {
        dataProtection: {
          encryption: {
            atRest: options.compliance.encryptionAtRest,
            inTransit: options.compliance.encryptionInTransit
          },
          retention: {
            defaultPeriod: '7 years',
            personalData: '2 years',
            logs: '1 year'
          },
          dataSubjectRights: {
            access: true,
            rectification: true,
            erasure: true,
            portability: true,
            restriction: true,
            objection: true
          },
          lawfulBasis: [
            'consent',
            'contract',
            'legal_obligation',
            'vital_interests',
            'public_task',
            'legitimate_interests'
          ]
        },
        dataProcessing: {
          categories: options.compliance.dataClassification.map(dc => ({
            level: dc.level,
            retention: dc.retention,
            encryption: dc.encryption,
            access: dc.access
          }))
        },
        privacyByDesign: {
          dataMinimization: true,
          purposeLimitation: true,
          storageMinimization: true,
          transparencyAndControl: true
        }
      };

      await this.templateManager.renderTemplate(
        'devops/security/compliance/gdpr-config.yaml.hbs',
        'security/compliance/gdpr-config.yaml',
        gdprConfig
      );
    }

    // Norwegian compliance (Personopplysningsloven)
    if (options.compliance.norwegianCompliant) {
      const norwegianComplianceConfig = {
        personopplysningsloven: {
          dataController: {
            name: options.projectName,
            organizationNumber: '${ORGANIZATION_NUMBER}',
            address: '${COMPANY_ADDRESS}',
            email: `privacy@${options.projectName}.no`,
            phone: '${COMPANY_PHONE}'
          },
          dataProcessor: {
            name: '${DATA_PROCESSOR_NAME}',
            agreement: '${DATA_PROCESSING_AGREEMENT_URL}'
          },
          technicalMeasures: {
            encryption: options.compliance.encryptionAtRest,
            accessControl: options.compliance.accessControl,
            logging: options.compliance.auditLogging,
            backup: true,
            testing: true
          },
          organizationalMeasures: {
            policies: true,
            training: true,
            incidentResponse: true,
            dataProtectionOfficer: true
          }
        },
        datatilsynet: {
          reporting: {
            breachNotification: '72 hours',
            annualReport: true,
            riskAssessment: true
          }
        }
      };

      await this.templateManager.renderTemplate(
        'devops/security/compliance/norwegian-compliance.yaml.hbs',
        'security/compliance/norwegian-compliance.yaml',
        norwegianComplianceConfig
      );
    }

    // ISO 27001 compliance
    if (options.compliance.iso27001) {
      const iso27001Config = {
        controls: [
          {
            id: 'A.5.1.1',
            name: 'Information security policies',
            implemented: true,
            evidence: 'security/policies/information-security-policy.pdf'
          },
          {
            id: 'A.6.1.1',
            name: 'Information security roles and responsibilities',
            implemented: true,
            evidence: 'security/roles/security-roles.yaml'
          },
          {
            id: 'A.9.1.1',
            name: 'Access control policy',
            implemented: true,
            evidence: 'security/rbac/'
          },
          {
            id: 'A.12.1.1',
            name: 'Documented operating procedures',
            implemented: true,
            evidence: 'security/procedures/'
          },
          {
            id: 'A.14.1.1',
            name: 'Information security requirements analysis',
            implemented: true,
            evidence: 'security/requirements/'
          }
        ],
        riskAssessment: {
          methodology: 'ISO 27005',
          frequency: 'annually',
          lastAssessment: '${LAST_RISK_ASSESSMENT_DATE}',
          nextAssessment: '${NEXT_RISK_ASSESSMENT_DATE}'
        },
        monitoring: {
          metrics: [
            'security_incidents_total',
            'vulnerability_scan_results',
            'access_violations_total',
            'patch_compliance_percentage'
          ],
          reviews: {
            frequency: 'quarterly',
            participants: ['CISO', 'IT Manager', 'Compliance Officer']
          }
        }
      };

      await this.templateManager.renderTemplate(
        'devops/security/compliance/iso27001-config.yaml.hbs',
        'security/compliance/iso27001-config.yaml',
        iso27001Config
      );
    }
  }

  private async generateIncidentResponse(options: SecurityGeneratorOptions): Promise<void> {
    const irConfig = options.incidentResponse;
    if (!irConfig.enabled) return;

    // Incident response playbooks
    for (const playbook of irConfig.playbooks) {
      const playbookConfig = {
        name: playbook.name,
        severity: playbook.severity,
        triggers: playbook.triggers,
        steps: playbook.steps.map((step, index) => ({
          order: index + 1,
          name: step.name,
          description: step.description,
          action: step.action,
          timeout: step.timeout,
          rollback: step.rollback,
          automated: playbook.automation
        })),
        contacts: irConfig.contacts.filter(contact => 
          contact.escalation <= this.getSeverityLevel(playbook.severity)
        ),
        notifications: irConfig.notifications
      };

      await this.templateManager.renderTemplate(
        'devops/security/incident-response/playbook.yaml.hbs',
        `security/incident-response/playbooks/${playbook.name}-playbook.yaml`,
        playbookConfig
      );
    }

    // Incident response automation
    const automationConfig = {
      workflows: [
        {
          name: 'Security Incident Detection',
          trigger: 'security_alert',
          actions: [
            {
              name: 'Create Incident',
              type: 'webhook',
              url: 'https://incidents.example.com/api/create',
              payload: {
                title: '{{ .Alert.Name }}',
                description: '{{ .Alert.Description }}',
                severity: '{{ .Alert.Severity }}',
                source: 'kubernetes'
              }
            },
            {
              name: 'Notify Team',
              type: 'notification',
              channels: ['slack', 'email'],
              message: 'Security incident detected: {{ .Alert.Name }}'
            },
            {
              name: 'Execute Playbook',
              type: 'playbook',
              playbook: '{{ .Alert.PlaybookName }}',
              parameters: {
                alertId: '{{ .Alert.ID }}',
                severity: '{{ .Alert.Severity }}'
              }
            }
          ]
        }
      ]
    };

    await this.templateManager.renderTemplate(
      'devops/security/incident-response/automation.yaml.hbs',
      'security/incident-response/automation.yaml',
      automationConfig
    );
  }

  private async generateCICDSecurity(options: SecurityGeneratorOptions): Promise<void> {
    // GitHub Actions security workflow
    const githubSecurityWorkflow = {
      name: 'Security Scanning',
      on: {
        push: {
          branches: ['main', 'develop']
        },
        pull_request: {
          branches: ['main']
        },
        schedule: [
          {
            cron: '0 2 * * 1'
          }
        ]
      },
      permissions: {
        contents: 'read',
        'security-events': 'write',
        actions: 'read'
      },
      jobs: {
        sast: {
          name: 'Static Analysis',
          'runs-on': 'ubuntu-latest',
          steps: [
            {
              name: 'Checkout code',
              uses: 'actions/checkout@v4'
            },
            {
              name: 'Run Semgrep',
              uses: 'returntocorp/semgrep-action@v1',
              with: {
                publishToken: '${{ secrets.SEMGREP_APP_TOKEN }}'
              }
            },
            {
              name: 'Run SonarQube Scan',
              if: options.scanners.sonarqube?.enabled,
              uses: 'sonarqube-quality-gate-action@master',
              env: {
                SONAR_TOKEN: '${{ secrets.SONAR_TOKEN }}'
              }
            }
          ]
        },
        dependency_scan: {
          name: 'Dependency Scanning',
          'runs-on': 'ubuntu-latest',
          steps: [
            {
              name: 'Checkout code',
              uses: 'actions/checkout@v4'
            },
            {
              name: 'Run Snyk',
              if: options.scanners.snyk?.enabled,
              uses: 'snyk/actions/node@master',
              env: {
                SNYK_TOKEN: '${{ secrets.SNYK_TOKEN }}'
              }
            },
            {
              name: 'Run npm audit',
              run: 'npm audit --audit-level moderate'
            }
          ]
        },
        container_scan: {
          name: 'Container Scanning',
          'runs-on': 'ubuntu-latest',
          if: options.enableContainerScanning,
          steps: [
            {
              name: 'Checkout code',
              uses: 'actions/checkout@v4'
            },
            {
              name: 'Build Docker image',
              run: 'docker build -t ${{ github.repository }}:${{ github.sha }} .'
            },
            {
              name: 'Run Trivy scan',
              if: options.scanners.trivy?.enabled,
              uses: 'aquasecurity/trivy-action@master',
              with: {
                'image-ref': '${{ github.repository }}:${{ github.sha }}',
                format: 'sarif',
                output: 'trivy-results.sarif'
              }
            },
            {
              name: 'Upload Trivy results',
              uses: 'github/codeql-action/upload-sarif@v3',
              with: {
                'sarif_file': 'trivy-results.sarif'
              }
            }
          ]
        },
        secret_scan: {
          name: 'Secret Scanning',
          'runs-on': 'ubuntu-latest',
          if: options.enableSecretScanning,
          steps: [
            {
              name: 'Checkout code',
              uses: 'actions/checkout@v4'
            },
            {
              name: 'Run TruffleHog',
              uses: 'trufflesecurity/trufflehog@main',
              with: {
                path: './',
                base: 'main',
                head: 'HEAD'
              }
            },
            {
              name: 'Run GitLeaks',
              uses: 'gitleaks/gitleaks-action@v2',
              env: {
                GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}'
              }
            }
          ]
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/security/cicd/github-security-workflow.yml.hbs',
      '.github/workflows/security.yml',
      githubSecurityWorkflow
    );

    // GitLab CI security configuration
    const gitlabSecurityCI = {
      include: [
        { template: 'Security/SAST.gitlab-ci.yml' },
        { template: 'Security/Dependency-Scanning.gitlab-ci.yml' },
        { template: 'Security/Container-Scanning.gitlab-ci.yml' },
        { template: 'Security/Secret-Detection.gitlab-ci.yml' },
        { template: 'Security/License-Scanning.gitlab-ci.yml' }
      ],
      variables: {
        SECURE_ANALYZERS_PREFIX: 'registry.gitlab.com/gitlab-org/security-products/analyzers',
        SAST_EXCLUDED_PATHS: 'spec, test, tests, tmp',
        DEPENDENCY_SCANNING_DISABLED: 'false',
        CONTAINER_SCANNING_DISABLED: 'false',
        SECRET_DETECTION_DISABLED: 'false',
        LICENSE_SCANNING_DISABLED: 'false',
        SAST_DISABLED: 'false'
      },
      stages: ['test', 'security', 'deploy'],
      'security-audit': {
        stage: 'security',
        script: [
          'echo "Running comprehensive security audit"',
          'npm audit --audit-level moderate',
          'docker run --rm -v "$(pwd)":/src returntocorp/semgrep --config=auto /src'
        ],
        artifacts: {
          reports: {
            junit: 'security-audit-report.xml'
          },
          expire_in: '1 week'
        },
        only: {
          refs: ['main', 'develop']
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/security/cicd/gitlab-security-ci.yml.hbs',
      'security/cicd/gitlab-security-ci.yml',
      gitlabSecurityCI
    );
  }

  private async generateSecurityDocumentation(options: SecurityGeneratorOptions): Promise<void> {
    // Security policy document
    const securityPolicy = {
      title: `${options.projectName} Security Policy`,
      version: '1.0',
      lastUpdated: new Date().toISOString().split('T')[0],
      sections: [
        {
          title: 'Purpose and Scope',
          content: 'This security policy defines the security requirements and controls for the ' + options.projectName + ' system.'
        },
        {
          title: 'Security Controls',
          content: 'The following security controls are implemented:',
          items: [
            'Multi-factor authentication (MFA)',
            'Role-based access control (RBAC)',
            'Data encryption at rest and in transit',
            'Continuous security monitoring',
            'Vulnerability management',
            'Incident response procedures'
          ]
        },
        {
          title: 'Compliance Requirements',
          content: 'This system complies with the following regulations:',
          items: options.compliance.enabled ? [
            ...(options.compliance.gdprCompliant ? ['GDPR (General Data Protection Regulation)'] : []),
            ...(options.compliance.norwegianCompliant ? ['Personopplysningsloven (Norwegian Personal Data Act)'] : []),
            ...(options.compliance.iso27001 ? ['ISO 27001 Information Security Management'] : [])
          ] : ['No specific compliance requirements defined']
        },
        {
          title: 'Security Responsibilities',
          content: 'Security responsibilities are distributed across the following roles:',
          items: [
            'CISO: Overall security strategy and governance',
            'Security Team: Security monitoring and incident response',
            'DevOps Team: Infrastructure security and compliance',
            'Development Team: Secure coding practices and SAST',
            'Operations Team: Runtime security and monitoring'
          ]
        }
      ]
    };

    await this.templateManager.renderTemplate(
      'devops/security/documentation/security-policy.md.hbs',
      'security/documentation/SECURITY_POLICY.md',
      securityPolicy
    );

    // Security README
    const securityReadme = {
      projectName: options.projectName,
      scanners: Object.keys(options.scanners).filter(scanner => 
        options.scanners[scanner as keyof typeof options.scanners]?.enabled
      ),
      enabledFeatures: [
        ...(options.enableSAST ? ['Static Application Security Testing (SAST)'] : []),
        ...(options.enableDAST ? ['Dynamic Application Security Testing (DAST)'] : []),
        ...(options.enableDependencyScanning ? ['Dependency Vulnerability Scanning'] : []),
        ...(options.enableContainerScanning ? ['Container Image Scanning'] : []),
        ...(options.enableSecretScanning ? ['Secret Detection'] : []),
        ...(options.enableRuntimeSecurity ? ['Runtime Security Monitoring'] : []),
        ...(options.enableOPA ? ['Open Policy Agent (OPA) Policy Enforcement'] : []),
        ...(options.enableFalco ? ['Falco Runtime Security'] : [])
      ]
    };

    await this.templateManager.renderTemplate(
      'devops/security/documentation/README.md.hbs',
      'security/README.md',
      securityReadme
    );
  }

  private getSeverityLevel(severity: string): number {
    const levels = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4
    };
    return levels[severity as keyof typeof levels] || 1;
  }

  private async generateSecretScanning(options: SecurityGeneratorOptions): Promise<void> {
    if (!options.enableSecretScanning) return;

    // TruffleHog configuration
    const truffleHogConfig = {
      rules: [
        {
          description: 'AWS Access Key',
          regex: 'AKIA[0-9A-Z]{16}',
          tags: ['key', 'AWS']
        },
        {
          description: 'Slack Token',
          regex: 'xox[baprs]-([0-9a-zA-Z]{10,48})?',
          tags: ['key', 'slack']
        },
        {
          description: 'GitHub Token',
          regex: 'ghp_[0-9a-zA-Z]{36}',
          tags: ['key', 'GitHub']
        },
        {
          description: 'Google API Key',
          regex: 'AIza[0-9A-Za-z\\-_]{35}',
          tags: ['key', 'Google']
        },
        {
          description: 'Private Key',
          regex: '-----BEGIN ((RSA|DSA|EC|PGP) )?PRIVATE KEY-----',
          tags: ['key', 'private']
        }
      ],
      allow: [
        {
          description: 'Test files',
          paths: [
            'test/**',
            'tests/**',
            '**/*.test.js',
            '**/*.spec.js'
          ]
        }
      ]
    };

    await this.templateManager.renderTemplate(
      'devops/security/secret-scanning/trufflehog.yaml.hbs',
      'security/secret-scanning/trufflehog.yaml',
      truffleHogConfig
    );

    // GitLeaks configuration
    const gitleaksConfig = {
      title: 'GitLeaks Configuration',
      rules: [
        {
          description: 'AWS Access Key',
          id: 'aws-access-key-id',
          regex: 'AKIA[0-9A-Z]{16}',
          tags: ['key', 'AWS']
        },
        {
          description: 'Generic Secret',
          id: 'generic-api-key',
          regex: '(?i)(api_key|apikey|secret|token|password)\\s*[:=]\\s*["\']?[0-9a-zA-Z-_]{20,}["\']?',
          tags: ['key', 'generic']
        }
      ],
      allowlist: {
        description: 'Allowed patterns',
        regexes: [
          'password\\s*=\\s*["\']?(test|mock|fake|dummy)["\']?',
          'token\\s*=\\s*["\']?(test|mock|fake|dummy)["\']?'
        ],
        paths: [
          '.git/',
          'node_modules/',
          'vendor/',
          '*.min.js'
        ]
      }
    };

    await this.templateManager.renderTemplate(
      'devops/security/secret-scanning/gitleaks.toml.hbs',
      'security/secret-scanning/.gitleaks.toml',
      gitleaksConfig
    );
  }
}