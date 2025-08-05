import * as fs from 'fs-extra';
import * as path from 'path';
import { z } from 'zod';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import yaml from 'yaml';

const execAsync = promisify(exec);

// Schema for Norwegian compliance configuration
const NorwegianComplianceConfigSchema = z.object({
  enabled: z.boolean().default(false),
  dataClassification: z.enum(['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET']).default('OPEN'),
  personalData: z.object({
    enabled: z.boolean().default(false),
    dataTypes: z.array(z.enum([
      'name', 'email', 'phone', 'address', 'national_id', 'passport',
      'health_data', 'financial_data', 'biometric_data', 'behavioral_data'
    ])).default([]),
    legalBasis: z.enum([
      'consent', 'contract', 'legal_obligation', 'vital_interests',
      'public_task', 'legitimate_interests'
    ]).default('consent'),
    retentionPeriod: z.string().default('3y'),
    dataSubjectRights: z.boolean().default(true),
  }).default({}),
  nsm: z.object({
    enabled: z.boolean().default(false),
    securityLevel: z.enum(['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET']).default('OPEN'),
    networkSegmentation: z.boolean().default(true),
    accessControl: z.boolean().default(true),
    auditLogging: z.boolean().default(true),
    encryption: z.object({
      atRest: z.boolean().default(true),
      inTransit: z.boolean().default(true),
      keyManagement: z.boolean().default(true),
    }).default({}),
    incidentResponse: z.boolean().default(true),
  }).default({}),
  gdpr: z.object({
    enabled: z.boolean().default(false),
    privacyByDesign: z.boolean().default(true),
    dataProtectionOfficer: z.object({
      required: z.boolean().default(false),
      contact: z.string().optional(),
    }).default({}),
    dataMapping: z.boolean().default(true),
    impactAssessment: z.boolean().default(false),
    consentManagement: z.boolean().default(true),
    rightToErasure: z.boolean().default(true),
    dataPortability: z.boolean().default(true),
    breachNotification: z.object({
      enabled: z.boolean().default(true),
      timeLimit: z.string().default('72h'),
      authorities: z.array(z.string()).default(['datatilsynet@datatilsynet.no']),
    }).default({}),
  }).default({}),
  audit: z.object({
    enabled: z.boolean().default(true),
    retention: z.string().default('7y'),
    events: z.array(z.enum([
      'authentication', 'authorization', 'data_access', 'data_modification',
      'configuration_change', 'system_access', 'error_events', 'security_events'
    ])).default(['authentication', 'authorization', 'data_access', 'data_modification']),
    realTime: z.boolean().default(true),
    integrity: z.boolean().default(true),
    exportFormat: z.enum(['json', 'csv', 'xml']).default('json'),
  }).default({}),
  logging: z.object({
    enabled: z.boolean().default(true),
    level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    structured: z.boolean().default(true),
    correlation: z.boolean().default(true),
    sanitization: z.boolean().default(true),
    retention: z.string().default('1y'),
  }).default({}),
  security: z.object({
    authentication: z.object({
      mfa: z.boolean().default(true),
      sessionTimeout: z.string().default('30m'),
      passwordPolicy: z.boolean().default(true),
    }).default({}),
    authorization: z.object({
      rbac: z.boolean().default(true),
      principleOfLeastPrivilege: z.boolean().default(true),
      regularReview: z.boolean().default(true),
    }).default({}),
    networkSecurity: z.object({
      firewalls: z.boolean().default(true),
      intrustionDetection: z.boolean().default(true),
      vpn: z.boolean().default(false),
      networkSegmentation: z.boolean().default(true),
    }).default({}),
  }).default({}),
  dataLocalization: z.object({
    enabled: z.boolean().default(false),
    allowedCountries: z.array(z.string()).default(['NO', 'EU', 'EEA']),
    cloudProviders: z.array(z.string()).default([]),
    dataCenter: z.object({
      location: z.string().optional(),
      certification: z.array(z.string()).default(['ISO27001', 'SOC2']),
    }).default({}),
  }).default({}),
  reporting: z.object({
    enabled: z.boolean().default(true),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']).default('monthly'),
    recipients: z.array(z.string()).default([]),
    format: z.enum(['pdf', 'html', 'json']).default('pdf'),
    automated: z.boolean().default(true),
  }).default({}),
});

export type NorwegianComplianceConfig = z.infer<typeof NorwegianComplianceConfigSchema>;

export interface ComplianceStatus {
  overall: 'compliant' | 'partial' | 'non-compliant';
  gdpr: {
    status: 'compliant' | 'partial' | 'non-compliant';
    requirements: Array<{
      requirement: string;
      status: 'met' | 'partial' | 'not-met';
      description: string;
    }>;
  };
  nsm: {
    status: 'compliant' | 'partial' | 'non-compliant';
    securityLevel: string;
    requirements: Array<{
      requirement: string;
      status: 'met' | 'partial' | 'not-met';
      description: string;
    }>;
  };
  personalData: {
    status: 'compliant' | 'partial' | 'non-compliant';
    dataTypes: string[];
    legalBasis: string;
    retention: string;
  };
  audit: {
    status: 'compliant' | 'partial' | 'non-compliant';
    retention: string;
    events: string[];
    realTime: boolean;
  };
}

export interface AuditEvent {
  timestamp: string;
  eventType: string;
  userId?: string;
  sessionId?: string;
  source: string;
  action: string;
  resource?: string;
  outcome: 'success' | 'failure' | 'error';
  details: Record<string, any>;
  classification: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  correlationId?: string;
}

export class NorwegianComplianceService {
  private config: NorwegianComplianceConfig;
  private appName: string;
  private namespace: string;

  constructor(config: Partial<NorwegianComplianceConfig>, appName: string, namespace: string = 'default') {
    this.config = NorwegianComplianceConfigSchema.parse(config);
    this.appName = appName;
    this.namespace = namespace;
  }

  /**
   * Generate compliance policy documents
   */
  generateCompliancePolicies(): { [key: string]: string } {
    const policies: { [key: string]: string } = {};

    // Privacy Policy
    if (this.config.gdpr.enabled || this.config.personalData.enabled) {
      policies['privacy-policy.md'] = this.generatePrivacyPolicy();
    }

    // Security Policy
    if (this.config.nsm.enabled) {
      policies['security-policy.md'] = this.generateSecurityPolicy();
    }

    // Data Processing Agreement
    if (this.config.personalData.enabled) {
      policies['data-processing-agreement.md'] = this.generateDataProcessingAgreement();
    }

    // Incident Response Plan
    if (this.config.nsm.incidentResponse) {
      policies['incident-response-plan.md'] = this.generateIncidentResponsePlan();
    }

    // Audit Policy
    if (this.config.audit.enabled) {
      policies['audit-policy.md'] = this.generateAuditPolicy();
    }

    return policies;
  }

  /**
   * Generate Kubernetes RBAC for compliance
   */
  generateComplianceRBAC(): any[] {
    const rbacResources = [];

    // Audit service account
    rbacResources.push({
      apiVersion: 'v1',
      kind: 'ServiceAccount',
      metadata: {
        name: `${this.appName}-audit`,
        namespace: this.namespace,
        labels: {
          app: this.appName,
          component: 'audit',
          'compliance.norway/enabled': 'true',
        },
        annotations: {
          'compliance.norway/purpose': 'audit-logging',
          'compliance.norway/classification': this.config.dataClassification,
        },
      },
    });

    // Audit cluster role
    rbacResources.push({
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'ClusterRole',
      metadata: {
        name: `${this.appName}-audit`,
        labels: {
          app: this.appName,
          component: 'audit',
        },
      },
      rules: [
        {
          apiGroups: [''],
          resources: ['events', 'pods', 'services'],
          verbs: ['get', 'list', 'watch'],
        },
        {
          apiGroups: ['apps'],
          resources: ['deployments', 'replicasets'],
          verbs: ['get', 'list', 'watch'],
        },
        {
          apiGroups: ['audit.k8s.io'],
          resources: ['events'],
          verbs: ['get', 'list', 'watch'],
        },
      ],
    });

    // Audit cluster role binding
    rbacResources.push({
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'ClusterRoleBinding',
      metadata: {
        name: `${this.appName}-audit`,
        labels: {
          app: this.appName,
          component: 'audit',
        },
      },
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'ClusterRole',
        name: `${this.appName}-audit`,
      },
      subjects: [{
        kind: 'ServiceAccount',
        name: `${this.appName}-audit`,
        namespace: this.namespace,
      }],
    });

    // Data protection role (for GDPR compliance)
    if (this.config.gdpr.enabled) {
      rbacResources.push({
        apiVersion: 'rbac.authorization.k8s.io/v1',
        kind: 'Role',
        metadata: {
          name: `${this.appName}-data-protection`,
          namespace: this.namespace,
          labels: {
            app: this.appName,
            component: 'data-protection',
            'compliance.gdpr/enabled': 'true',
          },
        },
        rules: [
          {
            apiGroups: [''],
            resources: ['secrets', 'configmaps'],
            verbs: ['get', 'list', 'create', 'update', 'delete'],
            resourceNames: [`${this.appName}-gdpr-*`],
          },
          {
            apiGroups: ['batch'],
            resources: ['jobs'],
            verbs: ['create', 'get', 'list', 'delete'],
          },
        ],
      });

      rbacResources.push({
        apiVersion: 'rbac.authorization.k8s.io/v1',
        kind: 'RoleBinding',
        metadata: {
          name: `${this.appName}-data-protection`,
          namespace: this.namespace,
        },
        roleRef: {
          apiGroup: 'rbac.authorization.k8s.io',
          kind: 'Role',
          name: `${this.appName}-data-protection`,
        },
        subjects: [{
          kind: 'ServiceAccount',
          name: `${this.appName}-audit`,
          namespace: this.namespace,
        }],
      });
    }

    return rbacResources;
  }

  /**
   * Generate network policies for security isolation
   */
  generateNetworkPolicies(): any[] {
    if (!this.config.nsm.networkSegmentation) {
      return [];
    }

    const networkPolicies = [];

    // Default deny all ingress/egress
    networkPolicies.push({
      apiVersion: 'networking.k8s.io/v1',
      kind: 'NetworkPolicy',
      metadata: {
        name: `${this.appName}-deny-all`,
        namespace: this.namespace,
        labels: {
          app: this.appName,
          'compliance.norway/enabled': 'true',
          'compliance.nsm/security-level': this.config.nsm.securityLevel,
        },
      },
      spec: {
        podSelector: {
          matchLabels: {
            app: this.appName,
          },
        },
        policyTypes: ['Ingress', 'Egress'],
      },
    });

    // Allow ingress from ingress controller
    networkPolicies.push({
      apiVersion: 'networking.k8s.io/v1',
      kind: 'NetworkPolicy',
      metadata: {
        name: `${this.appName}-allow-ingress`,
        namespace: this.namespace,
        labels: {
          app: this.appName,
          'compliance.norway/enabled': 'true',
        },
      },
      spec: {
        podSelector: {
          matchLabels: {
            app: this.appName,
          },
        },
        policyTypes: ['Ingress'],
        ingress: [
          {
            from: [
              {
                namespaceSelector: {
                  matchLabels: {
                    name: 'ingress-nginx',
                  },
                },
              },
              {
                namespaceSelector: {
                  matchLabels: {
                    name: this.namespace,
                  },
                },
              },
            ],
            ports: [
              {
                protocol: 'TCP',
                port: 3000,
              },
            ],
          },
        ],
      },
    });

    // Allow egress to DNS and external APIs
    const allowedEgressRules = [
      // DNS
      {
        to: [],
        ports: [
          { protocol: 'TCP', port: 53 },
          { protocol: 'UDP', port: 53 },
        ],
      },
      // HTTPS to external services
      {
        to: [],
        ports: [
          { protocol: 'TCP', port: 443 },
        ],
      },
    ];

    // Restrict egress based on security level
    if (this.config.nsm.securityLevel === 'SECRET' || this.config.nsm.securityLevel === 'CONFIDENTIAL') {
      // Only allow specific external services
      allowedEgressRules.push({
        to: [
          {
            namespaceSelector: {
              matchLabels: {
                'compliance.norway/approved': 'true',
              },
            },
          },
        ],
        ports: [
          { protocol: 'TCP', port: 443 },
        ],
      });
    }

    networkPolicies.push({
      apiVersion: 'networking.k8s.io/v1',
      kind: 'NetworkPolicy',
      metadata: {
        name: `${this.appName}-allow-egress`,
        namespace: this.namespace,
        labels: {
          app: this.appName,
          'compliance.norway/enabled': 'true',
        },
      },
      spec: {
        podSelector: {
          matchLabels: {
            app: this.appName,
          },
        },
        policyTypes: ['Egress'],
        egress: allowedEgressRules,
      },
    });

    return networkPolicies;
  }

  /**
   * Generate audit logging configuration
   */
  generateAuditConfiguration(): any {
    if (!this.config.audit.enabled) {
      return null;
    }

    return {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: {
        name: `${this.appName}-audit-config`,
        namespace: this.namespace,
        labels: {
          app: this.appName,
          component: 'audit',
          'compliance.norway/enabled': 'true',
        },
      },
      data: {
        'audit-policy.yaml': yaml.stringify({
          apiVersion: 'audit.k8s.io/v1',
          kind: 'Policy',
          rules: [
            {
              level: 'Metadata',
              namespaces: [this.namespace],
              resources: [
                { group: '', resources: ['secrets', 'configmaps'] },
                { group: 'apps', resources: ['deployments'] },
              ],
            },
            {
              level: 'Request',
              namespaces: [this.namespace],
              verbs: ['create', 'update', 'patch', 'delete'],
            },
            {
              level: 'RequestResponse',
              namespaces: [this.namespace],
              resources: [
                { group: '', resources: ['secrets'] },
              ],
            },
          ],
        }),
        'fluent-bit.conf': this.generateFluentBitConfig(),
        'audit-retention.policy': this.generateAuditRetentionPolicy(),
      },
    };
  }

  /**
   * Generate GDPR compliance resources
   */
  generateGDPRResources(): any[] {
    if (!this.config.gdpr.enabled) {
      return [];
    }

    const resources = [];

    // Data subject rights job template
    resources.push({
      apiVersion: 'batch/v1',
      kind: 'Job',
      metadata: {
        name: `${this.appName}-gdpr-data-export-template`,
        namespace: this.namespace,
        labels: {
          app: this.appName,
          component: 'gdpr',
          'compliance.gdpr/enabled': 'true',
        },
        annotations: {
          'batch.kubernetes.io/job-template': 'true',
        },
      },
      spec: {
        template: {
          spec: {
            restartPolicy: 'Never',
            serviceAccountName: `${this.appName}-audit`,
            containers: [{
              name: 'data-export',
              image: 'alpine:3.19',
              env: [
                {
                  name: 'SUBJECT_ID',
                  value: '${SUBJECT_ID}',
                },
                {
                  name: 'EXPORT_FORMAT',
                  value: '${EXPORT_FORMAT}',
                },
                {
                  name: 'CLASSIFICATION',
                  value: this.config.dataClassification,
                },
              ],
              command: ['/bin/sh'],
              args: ['-c', `
                echo "GDPR Data Export Job Started"
                echo "Subject ID: $SUBJECT_ID"
                echo "Export Format: $EXPORT_FORMAT"
                echo "Classification: $CLASSIFICATION"
                
                # This would be replaced with actual data export logic
                echo "Data export completed"
                
                # Log audit event
                echo "{
                  \\"timestamp\\": \\"$(date -Iseconds)\\",
                  \\"eventType\\": \\"GDPR_DATA_EXPORT\\",
                  \\"subjectId\\": \\"$SUBJECT_ID\\",
                  \\"outcome\\": \\"success\\",
                  \\"classification\\": \\"$CLASSIFICATION\\"
                }" > /tmp/audit.json
              `],
              volumeMounts: [{
                name: 'audit-logs',
                mountPath: '/tmp',
              }],
            }],
            volumes: [{
              name: 'audit-logs',
              emptyDir: {},
            }],
          },
        },
      },
    });

    // Data erasure job template
    resources.push({
      apiVersion: 'batch/v1',
      kind: 'Job',
      metadata: {
        name: `${this.appName}-gdpr-data-erasure-template`,
        namespace: this.namespace,
        labels: {
          app: this.appName,
          component: 'gdpr',
          'compliance.gdpr/enabled': 'true',
        },
        annotations: {
          'batch.kubernetes.io/job-template': 'true',
        },
      },
      spec: {
        template: {
          spec: {
            restartPolicy: 'Never',
            serviceAccountName: `${this.appName}-audit`,
            containers: [{
              name: 'data-erasure',
              image: 'alpine:3.19',
              env: [
                {
                  name: 'SUBJECT_ID',
                  value: '${SUBJECT_ID}',
                },
                {
                  name: 'CLASSIFICATION',
                  value: this.config.dataClassification,
                },
              ],
              command: ['/bin/sh'],
              args: ['-c', `
                echo "GDPR Data Erasure Job Started"
                echo "Subject ID: $SUBJECT_ID"
                echo "Classification: $CLASSIFICATION"
                
                # This would be replaced with actual data erasure logic
                echo "Data erasure completed"
                
                # Log audit event
                echo "{
                  \\"timestamp\\": \\"$(date -Iseconds)\\",
                  \\"eventType\\": \\"GDPR_DATA_ERASURE\\",
                  \\"subjectId\\": \\"$SUBJECT_ID\\",
                  \\"outcome\\": \\"success\\",
                  \\"classification\\": \\"$CLASSIFICATION\\"
                }" > /tmp/audit.json
              `],
              volumeMounts: [{
                name: 'audit-logs',
                mountPath: '/tmp',
              }],
            }],
            volumes: [{
              name: 'audit-logs',
              emptyDir: {},
            }],
          },
        },
      },
    });

    return resources;
  }

  /**
   * Generate monitoring alerts for compliance
   */
  generateComplianceAlerts(): any {
    const alertRules = [];

    // GDPR breach detection
    if (this.config.gdpr.enabled) {
      alertRules.push({
        alert: 'GDPRDataBreachSuspected',
        expr: `increase(http_requests_total{service="${this.appName}",status="401"}[5m]) > 10`,
        for: '2m',
        labels: {
          severity: 'critical',
          compliance: 'gdpr',
          service: this.appName,
        },
        annotations: {
          summary: 'Potential GDPR data breach detected',
          description: 'Multiple unauthorized access attempts detected - potential data breach',
          action: 'Investigate immediately and follow breach notification procedure',
        },
      });

      alertRules.push({
        alert: 'GDPRAuditLogFailure',
        expr: `increase(audit_log_failures_total{service="${this.appName}"}[5m]) > 0`,
        for: '1m',
        labels: {
          severity: 'critical',
          compliance: 'gdpr',
          service: this.appName,
        },
        annotations: {
          summary: 'GDPR audit logging failure',
          description: 'Audit logging has failed - compliance requirement breach',
          action: 'Fix audit logging immediately',
        },
      });
    }

    // NSM security alerts
    if (this.config.nsm.enabled) {
      alertRules.push({
        alert: 'NSMSecurityPolicyViolation',
        expr: `increase(network_policy_violations_total{service="${this.appName}"}[5m]) > 0`,
        for: '1m',
        labels: {
          severity: 'warning',
          compliance: 'nsm',
          service: this.appName,
        },
        annotations: {
          summary: 'NSM network policy violation',
          description: 'Network traffic violating NSM security policies detected',
          action: 'Review network policies and investigate source',
        },
      });

      alertRules.push({
        alert: 'NSMEncryptionFailure',
        expr: `increase(encryption_failures_total{service="${this.appName}"}[5m]) > 0`,
        for: '1m',
        labels: {
          severity: 'critical',
          compliance: 'nsm',
          service: this.appName,
        },
        annotations: {
          summary: 'NSM encryption failure',
          description: 'Data encryption failure detected - security requirement breach',
          action: 'Investigate encryption system immediately',
        },
      });
    }

    // Personal data alerts
    if (this.config.personalData.enabled) {
      alertRules.push({
        alert: 'PersonalDataRetentionViolation',
        expr: `personal_data_retention_violations_total{service="${this.appName}"} > 0`,
        for: '1m',
        labels: {
          severity: 'warning',
          compliance: 'personal-data',
          service: this.appName,
        },
        annotations: {
          summary: 'Personal data retention violation',
          description: 'Personal data exceeding retention period detected',
          action: 'Review and purge expired personal data',
        },
      });
    }

    return {
      apiVersion: 'monitoring.coreos.com/v1',
      kind: 'PrometheusRule',
      metadata: {
        name: `${this.appName}-compliance-alerts`,
        namespace: this.namespace,
        labels: {
          app: this.appName,
          component: 'compliance',
          'compliance.norway/enabled': 'true',
        },
      },
      spec: {
        groups: [{
          name: `${this.appName}-compliance`,
          interval: '30s',
          rules: alertRules,
        }],
      },
    };
  }

  /**
   * Validate compliance status
   */
  async validateCompliance(): Promise<ComplianceStatus> {
    const gdprStatus = this.validateGDPRCompliance();
    const nsmStatus = this.validateNSMCompliance();
    const personalDataStatus = this.validatePersonalDataCompliance();
    const auditStatus = this.validateAuditCompliance();

    const overallStatus = this.calculateOverallStatus([
      gdprStatus.status,
      nsmStatus.status,
      personalDataStatus.status,
      auditStatus.status,
    ]);

    return {
      overall: overallStatus,
      gdpr: gdprStatus,
      nsm: nsmStatus,
      personalData: personalDataStatus,
      audit: auditStatus,
    };
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(): Promise<string> {
    const status = await this.validateCompliance();
    const timestamp = new Date().toISOString();

    let report = `# Norwegian Compliance Report for ${this.appName}\n\n`;
    report += `**Generated**: ${timestamp}\n`;
    report += `**Classification**: ${this.config.dataClassification}\n`;
    report += `**Overall Status**: ${status.overall.toUpperCase()}\n\n`;

    // Executive Summary
    report += `## Executive Summary\n\n`;
    report += `This report provides a comprehensive assessment of Norwegian compliance requirements for ${this.appName}.\n\n`;

    // GDPR Compliance
    if (this.config.gdpr.enabled) {
      report += `## GDPR Compliance\n\n`;
      report += `**Status**: ${status.gdpr.status.toUpperCase()}\n\n`;
      report += `### Requirements:\n\n`;
      status.gdpr.requirements.forEach(req => {
        const statusIcon = req.status === 'met' ? '✅' : req.status === 'partial' ? '⚠️' : '❌';
        report += `- ${statusIcon} **${req.requirement}**: ${req.description}\n`;
      });
      report += '\n';
    }

    // NSM Compliance
    if (this.config.nsm.enabled) {
      report += `## NSM Security Guidelines\n\n`;
      report += `**Status**: ${status.nsm.status.toUpperCase()}\n`;
      report += `**Security Level**: ${status.nsm.securityLevel}\n\n`;
      report += `### Requirements:\n\n`;
      status.nsm.requirements.forEach(req => {
        const statusIcon = req.status === 'met' ? '✅' : req.status === 'partial' ? '⚠️' : '❌';
        report += `- ${statusIcon} **${req.requirement}**: ${req.description}\n`;
      });
      report += '\n';
    }

    // Personal Data Protection
    if (this.config.personalData.enabled) {
      report += `## Personal Data Protection\n\n`;
      report += `**Status**: ${status.personalData.status.toUpperCase()}\n`;
      report += `**Data Types**: ${status.personalData.dataTypes.join(', ')}\n`;
      report += `**Legal Basis**: ${status.personalData.legalBasis}\n`;
      report += `**Retention Period**: ${status.personalData.retention}\n\n`;
    }

    // Audit Logging
    report += `## Audit Logging\n\n`;
    report += `**Status**: ${status.audit.status.toUpperCase()}\n`;
    report += `**Retention**: ${status.audit.retention}\n`;
    report += `**Events**: ${status.audit.events.join(', ')}\n`;
    report += `**Real-time**: ${status.audit.realTime ? 'Yes' : 'No'}\n\n`;

    // Recommendations
    report += `## Recommendations\n\n`;
    if (status.overall !== 'compliant') {
      report += `### Action Items:\n\n`;
      
      // GDPR recommendations
      if (status.gdpr.status !== 'compliant') {
        const failedReqs = status.gdpr.requirements.filter(r => r.status !== 'met');
        failedReqs.forEach(req => {
          report += `1. **GDPR**: Address ${req.requirement}\n`;
        });
      }

      // NSM recommendations
      if (status.nsm.status !== 'compliant') {
        const failedReqs = status.nsm.requirements.filter(r => r.status !== 'met');
        failedReqs.forEach(req => {
          report += `2. **NSM**: Address ${req.requirement}\n`;
        });
      }
    } else {
      report += `All compliance requirements are currently met. Continue regular monitoring and reviews.\n`;
    }

    report += `\n---\n\n`;
    report += `*This report was generated automatically by Xaheen CLI v${process.env.npm_package_version || '3.0.0'}*\n`;

    return report;
  }

  /**
   * Write all compliance manifests
   */
  async writeComplianceManifests(outputDir: string): Promise<void> {
    try {
      await fs.ensureDir(outputDir);

      // Generate and write RBAC
      const rbacResources = this.generateComplianceRBAC();
      for (let i = 0; i < rbacResources.length; i++) {
        const resource = rbacResources[i];
        const filename = `rbac-${resource.kind.toLowerCase()}-${i}.yaml`;
        const filepath = path.join(outputDir, filename);
        await fs.writeFile(filepath, yaml.stringify(resource, { indent: 2 }));
      }

      // Generate and write network policies
      const networkPolicies = this.generateNetworkPolicies();
      for (let i = 0; i < networkPolicies.length; i++) {
        const policy = networkPolicies[i];
        const filename = `network-policy-${i}.yaml`;
        const filepath = path.join(outputDir, filename);
        await fs.writeFile(filepath, yaml.stringify(policy, { indent: 2 }));
      }

      // Generate and write audit configuration
      const auditConfig = this.generateAuditConfiguration();
      if (auditConfig) {
        const auditPath = path.join(outputDir, 'audit-config.yaml');
        await fs.writeFile(auditPath, yaml.stringify(auditConfig, { indent: 2 }));
      }

      // Generate and write GDPR resources
      const gdprResources = this.generateGDPRResources();
      for (let i = 0; i < gdprResources.length; i++) {
        const resource = gdprResources[i];
        const filename = `gdpr-${resource.metadata.name}.yaml`;
        const filepath = path.join(outputDir, filename);
        await fs.writeFile(filepath, yaml.stringify(resource, { indent: 2 }));
      }

      // Generate and write compliance alerts
      const complianceAlerts = this.generateComplianceAlerts();
      const alertsPath = path.join(outputDir, 'compliance-alerts.yaml');
      await fs.writeFile(alertsPath, yaml.stringify(complianceAlerts, { indent: 2 }));

      // Generate and write policy documents
      const policies = this.generateCompliancePolicies();
      const policiesDir = path.join(outputDir, 'policies');
      await fs.ensureDir(policiesDir);
      
      for (const [filename, content] of Object.entries(policies)) {
        const filepath = path.join(policiesDir, filename);
        await fs.writeFile(filepath, content);
      }

      // Generate compliance report
      const report = await this.generateComplianceReport();
      const reportPath = path.join(outputDir, 'compliance-report.md');
      await fs.writeFile(reportPath, report);

      console.log(`Norwegian compliance manifests written to ${outputDir}`);
    } catch (error) {
      throw new Error(`Failed to write compliance manifests: ${error}`);
    }
  }

  // Private helper methods
  private validateGDPRCompliance(): ComplianceStatus['gdpr'] {
    const requirements = [
      {
        requirement: 'Privacy by Design',
        status: this.config.gdpr.privacyByDesign ? 'met' : 'not-met',
        description: 'Privacy considerations integrated into system design',
      },
      {
        requirement: 'Data Mapping',
        status: this.config.gdpr.dataMapping ? 'met' : 'not-met',
        description: 'Comprehensive mapping of personal data processing',
      },
      {
        requirement: 'Consent Management',
        status: this.config.gdpr.consentManagement ? 'met' : 'not-met',
        description: 'System for managing user consent',
      },
      {
        requirement: 'Right to Erasure',
        status: this.config.gdpr.rightToErasure ? 'met' : 'not-met',
        description: 'Ability to delete personal data upon request',
      },
      {
        requirement: 'Data Portability',
        status: this.config.gdpr.dataPortability ? 'met' : 'not-met',
        description: 'Ability to export personal data',
      },
      {
        requirement: 'Breach Notification',
        status: this.config.gdpr.breachNotification.enabled ? 'met' : 'not-met',
        description: 'Automated breach notification system',
      },
    ];

    const metCount = requirements.filter(r => r.status === 'met').length;
    const status = metCount === requirements.length ? 'compliant' : 
                  metCount > requirements.length / 2 ? 'partial' : 'non-compliant';

    return { status, requirements };
  }

  private validateNSMCompliance(): ComplianceStatus['nsm'] {
    const requirements = [
      {
        requirement: 'Network Segmentation',
        status: this.config.nsm.networkSegmentation ? 'met' : 'not-met',
        description: 'Network traffic properly segmented and controlled',
      },
      {
        requirement: 'Access Control',
        status: this.config.nsm.accessControl ? 'met' : 'not-met',
        description: 'Role-based access control implemented',
      },
      {
        requirement: 'Audit Logging',
        status: this.config.nsm.auditLogging ? 'met' : 'not-met',
        description: 'Comprehensive audit logging enabled',
      },
      {
        requirement: 'Encryption at Rest',
        status: this.config.nsm.encryption.atRest ? 'met' : 'not-met',
        description: 'Data encrypted when stored',
      },
      {
        requirement: 'Encryption in Transit',
        status: this.config.nsm.encryption.inTransit ? 'met' : 'not-met',
        description: 'Data encrypted during transmission',
      },
      {
        requirement: 'Key Management',
        status: this.config.nsm.encryption.keyManagement ? 'met' : 'not-met',
        description: 'Proper encryption key management',
      },
      {
        requirement: 'Incident Response',
        status: this.config.nsm.incidentResponse ? 'met' : 'not-met',
        description: 'Incident response procedures in place',
      },
    ];

    const metCount = requirements.filter(r => r.status === 'met').length;
    const status = metCount === requirements.length ? 'compliant' : 
                  metCount > requirements.length / 2 ? 'partial' : 'non-compliant';

    return { 
      status, 
      requirements,
      securityLevel: this.config.nsm.securityLevel,
    };
  }

  private validatePersonalDataCompliance(): ComplianceStatus['personalData'] {
    const status = this.config.personalData.enabled ? 
      (this.config.personalData.dataSubjectRights ? 'compliant' : 'partial') : 
      'compliant';

    return {
      status,
      dataTypes: this.config.personalData.dataTypes,
      legalBasis: this.config.personalData.legalBasis,
      retention: this.config.personalData.retentionPeriod,
    };
  }

  private validateAuditCompliance(): ComplianceStatus['audit'] {
    const requiredEvents = ['authentication', 'authorization', 'data_access', 'data_modification'];
    const hasAllEvents = requiredEvents.every(event => this.config.audit.events.includes(event));
    
    const status = this.config.audit.enabled && hasAllEvents && this.config.audit.integrity ? 
      'compliant' : 'partial';

    return {
      status,
      retention: this.config.audit.retention,
      events: this.config.audit.events,
      realTime: this.config.audit.realTime,
    };
  }

  private calculateOverallStatus(statuses: string[]): 'compliant' | 'partial' | 'non-compliant' {
    if (statuses.every(s => s === 'compliant')) return 'compliant';
    if (statuses.some(s => s === 'non-compliant')) return 'non-compliant';
    return 'partial';
  }

  private generatePrivacyPolicy(): string {
    return `# Privacy Policy for ${this.appName}

## Introduction
This privacy policy describes how ${this.appName} collects, uses, and protects personal data in accordance with Norwegian and EU data protection laws.

## Legal Basis
Our legal basis for processing personal data is: **${this.config.personalData.legalBasis}**

## Data We Collect
${this.config.personalData.dataTypes.length > 0 ? 
  `We collect the following types of personal data:\n${this.config.personalData.dataTypes.map(type => `- ${type.replace('_', ' ')}`).join('\n')}` :
  'We do not collect personal data.'
}

## Data Retention
Personal data is retained for: **${this.config.personalData.retentionPeriod}**

## Your Rights
Under Norwegian and EU law, you have the following rights:
- Right of access to your personal data
- Right to rectification of inaccurate data
- Right to erasure ("right to be forgotten")
- Right to restrict processing
- Right to data portability
- Right to object to processing

## Contact Information
**Data Protection Officer**: ${this.config.gdpr.dataProtectionOfficer.contact || '[To be provided]'}

## Changes to This Policy
We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.

Last updated: ${new Date().toISOString().split('T')[0]}
`;
  }

  private generateSecurityPolicy(): string {
    return `# Security Policy for ${this.appName}

## Security Classification
This system processes data classified as: **${this.config.nsm.securityLevel}**

## Security Controls

### Network Security
- Network segmentation: ${this.config.nsm.networkSegmentation ? 'Enabled' : 'Disabled'}
- Firewall protection: ${this.config.security.networkSecurity.firewalls ? 'Enabled' : 'Disabled'}
- Intrusion detection: ${this.config.security.networkSecurity.intrustionDetection ? 'Enabled' : 'Disabled'}

### Access Control
- Role-based access control: ${this.config.nsm.accessControl ? 'Enabled' : 'Disabled'}
- Multi-factor authentication: ${this.config.security.authentication.mfa ? 'Enabled' : 'Disabled'}
- Session timeout: ${this.config.security.authentication.sessionTimeout}

### Encryption
- Data at rest: ${this.config.nsm.encryption.atRest ? 'Encrypted' : 'Not encrypted'}
- Data in transit: ${this.config.nsm.encryption.inTransit ? 'Encrypted' : 'Not encrypted'}
- Key management: ${this.config.nsm.encryption.keyManagement ? 'Implemented' : 'Not implemented'}

### Audit Logging
- Audit logging: ${this.config.nsm.auditLogging ? 'Enabled' : 'Disabled'}
- Real-time monitoring: ${this.config.audit.realTime ? 'Enabled' : 'Disabled'}
- Log retention: ${this.config.audit.retention}

## Incident Response
Incident response procedures: ${this.config.nsm.incidentResponse ? 'Implemented' : 'Not implemented'}

## Compliance Standards
- NSM Security Guidelines: ${this.config.nsm.enabled ? 'Compliant' : 'Not applicable'}
- ISO 27001: Under review
- SOC 2: Under review

Last updated: ${new Date().toISOString().split('T')[0]}
`;
  }

  private generateDataProcessingAgreement(): string {
    return `# Data Processing Agreement for ${this.appName}

## Parties
This Data Processing Agreement is between [Data Controller] and [Data Processor] regarding the processing of personal data through ${this.appName}.

## Purpose and Scope
The purpose of this agreement is to ensure compliance with data protection laws when processing personal data.

## Types of Personal Data
${this.config.personalData.dataTypes.map(type => `- ${type.replace('_', ' ')}`).join('\n')}

## Categories of Data Subjects
- Application users
- System administrators
- Other authorized personnel

## Processing Activities
- Collection and storage of personal data
- Data analysis and reporting
- User authentication and authorization
- System logging and monitoring

## Security Measures
${this.config.nsm.encryption.atRest ? '- Encryption of data at rest' : ''}
${this.config.nsm.encryption.inTransit ? '- Encryption of data in transit' : ''}
${this.config.nsm.accessControl ? '- Role-based access control' : ''}
${this.config.audit.enabled ? '- Audit logging of all data access' : ''}

## Data Retention
Personal data will be retained for: ${this.config.personalData.retentionPeriod}

## Data Subject Rights
Procedures are in place to handle:
- Access requests
- Rectification requests
- Erasure requests
- Portability requests
- Objection requests

## International Transfers
${this.config.dataLocalization.enabled ? 
  `Data is restricted to the following countries: ${this.config.dataLocalization.allowedCountries.join(', ')}` :
  'International data transfers may occur - appropriate safeguards will be implemented'
}

## Breach Notification
Data breaches will be reported within: ${this.config.gdpr.breachNotification.timeLimit}

## Contact Information
Questions about this agreement should be directed to: ${this.config.gdpr.dataProtectionOfficer.contact || '[To be provided]'}

Date: ${new Date().toISOString().split('T')[0]}
`;
  }

  private generateIncidentResponsePlan(): string {
    return `# Incident Response Plan for ${this.appName}

## Incident Types
- Security breaches
- Data breaches
- System compromises
- Unauthorized access
- Service disruptions

## Response Team
- Incident Commander: [To be assigned]
- Technical Lead: [To be assigned]
- Legal/Compliance: [To be assigned]
- Communications: [To be assigned]

## Response Procedures

### Immediate Response (0-1 hour)
1. Detect and verify the incident
2. Activate the incident response team
3. Contain the incident to prevent further damage
4. Preserve evidence
5. Begin initial assessment

### Short-term Response (1-4 hours)
1. Detailed investigation and analysis
2. Implement additional containment measures
3. Begin system recovery procedures
4. Notify relevant stakeholders
5. Document all actions taken

### Notification Requirements
- Internal stakeholders: Immediately
- Datatilsynet (Norwegian DPA): Within 72 hours
- Affected data subjects: Within 72 hours (if high risk)
- Law enforcement: As required

### Recovery and Post-Incident
1. System restoration and validation
2. Lessons learned analysis
3. Update security measures
4. Review and update incident response plan
5. Final incident report

## Classification Levels
- **OPEN**: Public information - standard response
- **RESTRICTED**: Internal use - enhanced response
- **CONFIDENTIAL**: Sensitive data - priority response
- **SECRET**: Highly sensitive - emergency response

## Contact Information
- Emergency hotline: [To be provided]
- Datatilsynet: +47 22 39 69 00
- CERT-Norge: cert-norge@nsm.stat.no

Last updated: ${new Date().toISOString().split('T')[0]}
`;
  }

  private generateAuditPolicy(): string {
    return `# Audit Policy for ${this.appName}

## Purpose
This policy defines the audit logging requirements and procedures for ${this.appName} to ensure compliance with Norwegian regulations.

## Scope
This policy applies to all system components, users, and data processing activities.

## Audit Events
The following events must be logged:
${this.config.audit.events.map(event => `- ${event.replace('_', ' ')}`).join('\n')}

## Log Retention
Audit logs are retained for: **${this.config.audit.retention}**

## Log Integrity
- Logs are cryptographically signed: ${this.config.audit.integrity ? 'Yes' : 'No'}
- Logs are stored in tamper-evident storage: ${this.config.audit.integrity ? 'Yes' : 'No'}
- Regular integrity checks are performed: ${this.config.audit.integrity ? 'Yes' : 'No'}

## Real-time Monitoring
Real-time monitoring of audit events: ${this.config.audit.realTime ? 'Enabled' : 'Disabled'}

## Log Format
Audit logs are exported in: ${this.config.audit.exportFormat.toUpperCase()} format

## Access Control
- Only authorized personnel can access audit logs
- All access to audit logs is logged
- Regular access reviews are conducted

## Compliance Requirements
- Norwegian Personal Data Act compliance
- GDPR Article 25 (Data protection by design)
- NSM security guidelines

## Review and Updates
This policy is reviewed annually and updated as needed.

Last updated: ${new Date().toISOString().split('T')[0]}
`;
  }

  private generateFluentBitConfig(): string {
    return `[SERVICE]
    Flush         5
    Daemon        off
    Log_Level     info
    Parsers_File  parsers.conf

[INPUT]
    Name              tail
    Path              /var/log/audit/*.log
    Parser            json
    Tag               audit.*
    Refresh_Interval  5

[FILTER]
    Name    lua
    Match   audit.*
    Script  compliance_filter.lua
    Call    add_compliance_metadata

[OUTPUT]
    Name   stdout
    Match  audit.*
    Format json

[OUTPUT]
    Name         forward
    Match        audit.*
    Host         audit-collector
    Port         24224
    tls          on
    tls.verify   on
`;
  }

  private generateAuditRetentionPolicy(): string {
    return `# Audit Log Retention Policy

# Retention periods by event type
authentication: ${this.config.audit.retention}
authorization: ${this.config.audit.retention}
data_access: ${this.config.audit.retention}
data_modification: ${this.config.audit.retention}
configuration_change: ${this.config.audit.retention}
system_access: ${this.config.audit.retention}
error_events: ${this.config.audit.retention}
security_events: ${this.config.audit.retention}

# Classification-specific retention
OPEN: 1y
RESTRICTED: 3y
CONFIDENTIAL: 5y
SECRET: 7y

# Norwegian compliance requirement: 7 years minimum for audit logs
minimum_retention: 7y
`;
  }
}

// Export default configuration
export const defaultNorwegianComplianceConfig = NorwegianComplianceConfigSchema.parse({});