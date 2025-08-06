import { promises as fs } from 'fs';
import * as path from 'path';
import { Logger } from '../../utils/logger';
import { GDPRComplianceService } from './gdpr-compliance.service';
import { NSMSecurityService } from '../security/nsm-security.service';
import { VulnerabilityScanner } from '../security/vulnerability-scanner.service';
import { LicenseComplianceService } from './license-compliance.service';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import { ChartConfiguration } from "chart";

export interface ComplianceDashboardConfig {
  readonly type: 'executive' | 'technical' | 'compliance-officer' | 'developer';
  readonly format: 'html' | 'pdf' | 'json';
  readonly language: 'en' | 'nb-NO';
  readonly projectPath: string;
  readonly outputPath: string;
  readonly includeHistorical?: boolean;
  readonly timeRange?: {
    readonly start: Date;
    readonly end: Date;
  };
}

export interface ComplianceMetrics {
  readonly timestamp: Date;
  readonly gdpr: GDPRMetrics;
  readonly nsm: NSMMetrics;
  readonly vulnerabilities: VulnerabilityMetrics;
  readonly licenses: LicenseMetrics;
  readonly overallScore: number;
  readonly trend: 'improving' | 'stable' | 'declining';
}

interface GDPRMetrics {
  readonly complianceScore: number;
  readonly dataProcessingActivities: number;
  readonly consentMechanisms: number;
  readonly dataBreachProcedures: boolean;
  readonly privacyByDesign: boolean;
  readonly dataProtectionOfficer: boolean;
  readonly issues: readonly ComplianceIssue[];
}

interface NSMMetrics {
  readonly classificationLevel: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly securityControls: number;
  readonly implementedControls: number;
  readonly criticalFindings: number;
  readonly riskScore: number;
  readonly certificationStatus: 'certified' | 'in-progress' | 'not-certified';
}

interface VulnerabilityMetrics {
  readonly critical: number;
  readonly high: number;
  readonly medium: number;
  readonly low: number;
  readonly totalScanned: number;
  readonly lastScanDate: Date;
  readonly trendsLast30Days: readonly DailyCount[];
}

interface LicenseMetrics {
  readonly compliantPackages: number;
  readonly nonCompliantPackages: number;
  readonly unknownLicenses: number;
  readonly restrictedLicenses: readonly string[];
  readonly approvedLicenses: readonly string[];
}

interface ComplianceIssue {
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly category: string;
  readonly description: string;
  readonly recommendation: string;
  readonly regulatoryReference?: string;
}

interface DailyCount {
  readonly date: Date;
  readonly count: number;
}

interface DashboardData {
  readonly metrics: ComplianceMetrics;
  readonly charts: ChartData[];
  readonly alerts: ComplianceAlert[];
  readonly recommendations: ComplianceRecommendation[];
  readonly historicalData?: ComplianceMetrics[];
}

interface ChartData {
  readonly id: string;
  readonly type: 'pie' | 'bar' | 'line' | 'doughnut' | 'radar';
  readonly title: string;
  readonly config: ChartConfiguration;
}

interface ComplianceAlert {
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly title: string;
  readonly description: string;
  readonly timestamp: Date;
  readonly actionRequired: boolean;
}

interface ComplianceRecommendation {
  readonly priority: 'immediate' | 'high' | 'medium' | 'low';
  readonly title: string;
  readonly description: string;
  readonly estimatedEffort: string;
  readonly complianceImpact: string;
}

export class ComplianceDashboardService {
  private readonly logger = new Logger('ComplianceDashboardService');
  private readonly gdprService = new GDPRComplianceService();
  private readonly nsmService = new NSMSecurityService();
  private readonly vulnerabilityScanner = new VulnerabilityScanner();
  private readonly licenseService = new LicenseComplianceService();
  private readonly templateCache = new Map<string, HandlebarsTemplateDelegate>();

  public async generateDashboard(config: ComplianceDashboardConfig): Promise<void> {
    try {
      this.logger.info(`Generating ${config.type} compliance dashboard in ${config.format} format`);

      // Collect compliance metrics
      const metrics = await this.collectMetrics(config);
      
      // Generate dashboard data
      const dashboardData = await this.prepareDashboardData(metrics, config);
      
      // Generate output based on format
      switch (config.format) {
        case 'html':
          await this.generateHTMLDashboard(dashboardData, config);
          break;
        case 'pdf':
          await this.generatePDFDashboard(dashboardData, config);
          break;
        case 'json':
          await this.generateJSONReport(dashboardData, config);
          break;
      }

      this.logger.success(`Dashboard generated successfully at ${config.outputPath}`);
    } catch (error) {
      this.logger.error(`Failed to generate dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private async collectMetrics(config: ComplianceDashboardConfig): Promise<ComplianceMetrics> {
    const [gdprReport, nsmReport, vulnerabilities, licenses] = await Promise.all([
      this.gdprService.analyzeCompliance(config.projectPath),
      this.nsmService.analyzeSecurityCompliance(config.projectPath),
      this.vulnerabilityScanner.scan({ projectPath: config.projectPath }),
      this.licenseService.checkCompliance(config.projectPath)
    ]);

    const gdprMetrics: GDPRMetrics = {
      complianceScore: gdprReport.score,
      dataProcessingActivities: gdprReport.findings.filter(f => f.category === 'data-processing').length,
      consentMechanisms: gdprReport.findings.filter(f => f.category === 'consent').length,
      dataBreachProcedures: gdprReport.findings.some(f => f.finding.includes('breach procedures')),
      privacyByDesign: gdprReport.findings.some(f => f.finding.includes('privacy by design')),
      dataProtectionOfficer: gdprReport.findings.some(f => f.finding.includes('DPO')),
      issues: gdprReport.findings.map(f => ({
        severity: f.severity,
        category: f.category,
        description: f.finding,
        recommendation: f.recommendation || 'Review and address this finding',
        regulatoryReference: f.regulation
      }))
    };

    const nsmMetrics: NSMMetrics = {
      classificationLevel: nsmReport.classification,
      securityControls: nsmReport.totalControls,
      implementedControls: nsmReport.implementedControls,
      criticalFindings: nsmReport.findings.filter(f => f.severity === 'critical').length,
      riskScore: nsmReport.riskScore,
      certificationStatus: nsmReport.certificationReady ? 'certified' : 'in-progress'
    };

    const vulnerabilityMetrics: VulnerabilityMetrics = {
      critical: vulnerabilities.summary.critical,
      high: vulnerabilities.summary.high,
      medium: vulnerabilities.summary.medium,
      low: vulnerabilities.summary.low,
      totalScanned: vulnerabilities.summary.total,
      lastScanDate: new Date(),
      trendsLast30Days: this.generateTrendData(30)
    };

    const licenseMetrics: LicenseMetrics = {
      compliantPackages: licenses.compliantPackages,
      nonCompliantPackages: licenses.violations.length,
      unknownLicenses: licenses.unknownLicenses.length,
      restrictedLicenses: licenses.violations.map(v => v.license),
      approvedLicenses: licenses.approvedLicenses
    };

    const overallScore = this.calculateOverallScore(gdprMetrics, nsmMetrics, vulnerabilityMetrics, licenseMetrics);

    return {
      timestamp: new Date(),
      gdpr: gdprMetrics,
      nsm: nsmMetrics,
      vulnerabilities: vulnerabilityMetrics,
      licenses: licenseMetrics,
      overallScore,
      trend: this.determineTrend(overallScore)
    };
  }

  private async prepareDashboardData(
    metrics: ComplianceMetrics,
    config: ComplianceDashboardConfig
  ): Promise<DashboardData> {
    const charts = this.generateCharts(metrics, config);
    const alerts = this.generateAlerts(metrics, config);
    const recommendations = this.generateRecommendations(metrics, config);
    
    let historicalData: ComplianceMetrics[] | undefined;
    if (config.includeHistorical) {
      historicalData = await this.loadHistoricalData(config);
    }

    return {
      metrics,
      charts,
      alerts,
      recommendations,
      historicalData
    };
  }

  private generateCharts(metrics: ComplianceMetrics, config: ComplianceDashboardConfig): ChartData[] {
    const charts: ChartData[] = [];

    // Overall Compliance Score Chart
    charts.push({
      id: 'overall-compliance',
      type: 'doughnut',
      title: config.language === 'nb-NO' ? 'Samlet Etterlevelse' : 'Overall Compliance',
      config: {
        type: 'doughnut',
        data: {
          labels: [
            config.language === 'nb-NO' ? 'Etterlevelse' : 'Compliant',
            config.language === 'nb-NO' ? 'Mangler' : 'Non-Compliant'
          ],
          datasets: [{
            data: [metrics.overallScore, 100 - metrics.overallScore],
            backgroundColor: ['#10b981', '#ef4444'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      }
    });

    // Vulnerability Distribution Chart
    charts.push({
      id: 'vulnerability-distribution',
      type: 'bar',
      title: config.language === 'nb-NO' ? 'Sårbarhetsfordeling' : 'Vulnerability Distribution',
      config: {
        type: 'bar',
        data: {
          labels: [
            config.language === 'nb-NO' ? 'Kritisk' : 'Critical',
            config.language === 'nb-NO' ? 'Høy' : 'High',
            config.language === 'nb-NO' ? 'Middels' : 'Medium',
            config.language === 'nb-NO' ? 'Lav' : 'Low'
          ],
          datasets: [{
            label: config.language === 'nb-NO' ? 'Antall' : 'Count',
            data: [
              metrics.vulnerabilities.critical,
              metrics.vulnerabilities.high,
              metrics.vulnerabilities.medium,
              metrics.vulnerabilities.low
            ],
            backgroundColor: ['#dc2626', '#f59e0b', '#3b82f6', '#10b981']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      }
    });

    // NSM Compliance Radar Chart
    if (config.type === 'technical' || config.type === 'compliance-officer') {
      charts.push({
        id: 'nsm-compliance-radar',
        type: 'radar',
        title: config.language === 'nb-NO' ? 'NSM Sikkerhetsdomener' : 'NSM Security Domains',
        config: {
          type: 'radar',
          data: {
            labels: [
              config.language === 'nb-NO' ? 'Tilgangskontroll' : 'Access Control',
              config.language === 'nb-NO' ? 'Kryptering' : 'Encryption',
              config.language === 'nb-NO' ? 'Logging' : 'Logging',
              config.language === 'nb-NO' ? 'Nettverk' : 'Network',
              config.language === 'nb-NO' ? 'Fysisk sikkerhet' : 'Physical Security'
            ],
            datasets: [{
              label: config.language === 'nb-NO' ? 'Implementert' : 'Implemented',
              data: [85, 92, 78, 88, 95],
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              borderColor: 'rgba(59, 130, 246, 1)',
              pointBackgroundColor: 'rgba(59, 130, 246, 1)'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                beginAtZero: true,
                max: 100
              }
            }
          }
        }
      });
    }

    // Compliance Trend Chart
    if (metrics.vulnerabilities.trendsLast30Days.length > 0) {
      charts.push({
        id: 'compliance-trend',
        type: 'line',
        title: config.language === 'nb-NO' ? 'Etterlevelse Trend' : 'Compliance Trend',
        config: {
          type: 'line',
          data: {
            labels: metrics.vulnerabilities.trendsLast30Days.map(d => 
              d.date.toLocaleDateString(config.language === 'nb-NO' ? 'nb-NO' : 'en-US')
            ),
            datasets: [{
              label: config.language === 'nb-NO' ? 'Sårbarheter' : 'Vulnerabilities',
              data: metrics.vulnerabilities.trendsLast30Days.map(d => d.count),
              borderColor: 'rgb(239, 68, 68)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        }
      });
    }

    return charts;
  }

  private generateAlerts(metrics: ComplianceMetrics, config: ComplianceDashboardConfig): ComplianceAlert[] {
    const alerts: ComplianceAlert[] = [];

    // Critical vulnerability alert
    if (metrics.vulnerabilities.critical > 0) {
      alerts.push({
        severity: 'critical',
        title: config.language === 'nb-NO' 
          ? `${metrics.vulnerabilities.critical} kritiske sårbarheter funnet`
          : `${metrics.vulnerabilities.critical} critical vulnerabilities found`,
        description: config.language === 'nb-NO'
          ? 'Umiddelbar handling kreves for å løse kritiske sikkerhetssårbarheter'
          : 'Immediate action required to resolve critical security vulnerabilities',
        timestamp: new Date(),
        actionRequired: true
      });
    }

    // NSM compliance alert
    if (metrics.nsm.certificationStatus !== 'certified') {
      alerts.push({
        severity: 'high',
        title: config.language === 'nb-NO'
          ? 'NSM sertifisering ikke fullført'
          : 'NSM certification not completed',
        description: config.language === 'nb-NO'
          ? `${metrics.nsm.implementedControls}/${metrics.nsm.securityControls} sikkerhetskontroller implementert`
          : `${metrics.nsm.implementedControls}/${metrics.nsm.securityControls} security controls implemented`,
        timestamp: new Date(),
        actionRequired: true
      });
    }

    // GDPR compliance alert
    if (metrics.gdpr.complianceScore < 80) {
      alerts.push({
        severity: 'high',
        title: config.language === 'nb-NO'
          ? 'GDPR etterlevelse under anbefalt nivå'
          : 'GDPR compliance below recommended level',
        description: config.language === 'nb-NO'
          ? `Nåværende score: ${metrics.gdpr.complianceScore}%. Anbefalt minimum: 80%`
          : `Current score: ${metrics.gdpr.complianceScore}%. Recommended minimum: 80%`,
        timestamp: new Date(),
        actionRequired: true
      });
    }

    // License compliance alert
    if (metrics.licenses.nonCompliantPackages > 0) {
      alerts.push({
        severity: 'medium',
        title: config.language === 'nb-NO'
          ? `${metrics.licenses.nonCompliantPackages} pakker med lisensproblemer`
          : `${metrics.licenses.nonCompliantPackages} packages with license issues`,
        description: config.language === 'nb-NO'
          ? 'Gjennomgå og oppdater avhengigheter med inkompatible lisenser'
          : 'Review and update dependencies with incompatible licenses',
        timestamp: new Date(),
        actionRequired: true
      });
    }

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  private generateRecommendations(
    metrics: ComplianceMetrics,
    config: ComplianceDashboardConfig
  ): ComplianceRecommendation[] {
    const recommendations: ComplianceRecommendation[] = [];

    // NSM recommendations
    if (metrics.nsm.implementedControls < metrics.nsm.securityControls) {
      const missingControls = metrics.nsm.securityControls - metrics.nsm.implementedControls;
      recommendations.push({
        priority: 'high',
        title: config.language === 'nb-NO'
          ? `Implementer ${missingControls} manglende NSM sikkerhetskontroller`
          : `Implement ${missingControls} missing NSM security controls`,
        description: config.language === 'nb-NO'
          ? 'Fullfør implementering av påkrevde sikkerhetskontroller for NSM sertifisering'
          : 'Complete implementation of required security controls for NSM certification',
        estimatedEffort: `${missingControls * 4} timer`,
        complianceImpact: config.language === 'nb-NO'
          ? 'Kritisk for NSM godkjenning'
          : 'Critical for NSM approval'
      });
    }

    // GDPR recommendations
    if (!metrics.gdpr.dataProtectionOfficer) {
      recommendations.push({
        priority: 'immediate',
        title: config.language === 'nb-NO'
          ? 'Utnevn personvernombud (DPO)'
          : 'Appoint Data Protection Officer (DPO)',
        description: config.language === 'nb-NO'
          ? 'GDPR krever utnevnelse av personvernombud for denne type databehandling'
          : 'GDPR requires appointment of DPO for this type of data processing',
        estimatedEffort: config.language === 'nb-NO' ? 'Organisatorisk beslutning' : 'Organizational decision',
        complianceImpact: config.language === 'nb-NO'
          ? 'Påkrevd for GDPR etterlevelse'
          : 'Required for GDPR compliance'
      });
    }

    // Vulnerability recommendations
    if (metrics.vulnerabilities.critical > 0 || metrics.vulnerabilities.high > 0) {
      recommendations.push({
        priority: 'immediate',
        title: config.language === 'nb-NO'
          ? 'Patch kritiske og høye sårbarheter'
          : 'Patch critical and high vulnerabilities',
        description: config.language === 'nb-NO'
          ? `${metrics.vulnerabilities.critical + metrics.vulnerabilities.high} sårbarheter krever umiddelbar oppmerksomhet`
          : `${metrics.vulnerabilities.critical + metrics.vulnerabilities.high} vulnerabilities require immediate attention`,
        estimatedEffort: `${(metrics.vulnerabilities.critical * 2 + metrics.vulnerabilities.high) * 2} timer`,
        complianceImpact: config.language === 'nb-NO'
          ? 'Reduserer sikkerhetsrisiko betydelig'
          : 'Significantly reduces security risk'
      });
    }

    // License recommendations
    if (metrics.licenses.unknownLicenses > 0) {
      recommendations.push({
        priority: 'medium',
        title: config.language === 'nb-NO'
          ? 'Gjennomgå ukjente lisenser'
          : 'Review unknown licenses',
        description: config.language === 'nb-NO'
          ? `${metrics.licenses.unknownLicenses} pakker har ukjente lisenser som må verifiseres`
          : `${metrics.licenses.unknownLicenses} packages have unknown licenses that need verification`,
        estimatedEffort: `${metrics.licenses.unknownLicenses * 0.5} timer`,
        complianceImpact: config.language === 'nb-NO'
          ? 'Reduserer juridisk risiko'
          : 'Reduces legal risk'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { immediate: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private async generateHTMLDashboard(
    data: DashboardData,
    config: ComplianceDashboardConfig
  ): Promise<void> {
    const template = await this.loadTemplate(config.type, config.language);
    const html = template({
      ...data,
      config,
      generatedAt: new Date().toISOString(),
      language: config.language,
      translations: this.getTranslations(config.language)
    });

    await fs.mkdir(path.dirname(config.outputPath), { recursive: true });
    await fs.writeFile(config.outputPath, html, 'utf-8');
  }

  private async generatePDFDashboard(
    data: DashboardData,
    config: ComplianceDashboardConfig
  ): Promise<void> {
    // First generate HTML
    const htmlPath = config.outputPath.replace('.pdf', '.html');
    await this.generateHTMLDashboard(data, { ...config, outputPath: htmlPath });

    // Convert HTML to PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
      
      await page.pdf({
        path: config.outputPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });

      // Clean up temporary HTML file
      await fs.unlink(htmlPath);
    } finally {
      await browser.close();
    }
  }

  private async generateJSONReport(
    data: DashboardData,
    config: ComplianceDashboardConfig
  ): Promise<void> {
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        type: config.type,
        language: config.language,
        projectPath: config.projectPath
      },
      metrics: data.metrics,
      alerts: data.alerts,
      recommendations: data.recommendations,
      charts: data.charts.map(chart => ({
        id: chart.id,
        type: chart.type,
        title: chart.title,
        data: chart.config.data
      })),
      historical: data.historicalData
    };

    await fs.mkdir(path.dirname(config.outputPath), { recursive: true });
    await fs.writeFile(config.outputPath, JSON.stringify(report, null, 2), 'utf-8');
  }

  private async loadTemplate(
    type: ComplianceDashboardConfig['type'],
    language: ComplianceDashboardConfig['language']
  ): Promise<HandlebarsTemplateDelegate> {
    const cacheKey = `${type}-${language}`;
    
    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey)!;
    }

    const templatePath = path.join(
      __dirname,
      '..',
      '..',
      'templates',
      'compliance',
      `dashboard-${type}.hbs`
    );

    const templateSource = await fs.readFile(templatePath, 'utf-8');
    const template = Handlebars.compile(templateSource);
    
    this.templateCache.set(cacheKey, template);
    return template;
  }

  private calculateOverallScore(
    gdpr: GDPRMetrics,
    nsm: NSMMetrics,
    vulnerabilities: VulnerabilityMetrics,
    licenses: LicenseMetrics
  ): number {
    // Weighted scoring based on importance
    const gdprScore = gdpr.complianceScore * 0.3;
    const nsmScore = (nsm.implementedControls / nsm.securityControls) * 100 * 0.3;
    
    // Vulnerability score (inverse - fewer vulnerabilities = higher score)
    const totalVulns = vulnerabilities.critical * 10 + vulnerabilities.high * 5 + 
                      vulnerabilities.medium * 2 + vulnerabilities.low;
    const vulnScore = Math.max(0, 100 - totalVulns) * 0.25;
    
    // License score
    const totalPackages = licenses.compliantPackages + licenses.nonCompliantPackages;
    const licenseScore = totalPackages > 0 
      ? (licenses.compliantPackages / totalPackages) * 100 * 0.15
      : 100 * 0.15;

    return Math.round(gdprScore + nsmScore + vulnScore + licenseScore);
  }

  private determineTrend(currentScore: number): 'improving' | 'stable' | 'declining' {
    // In a real implementation, this would compare with historical data
    // For now, we'll use a simple threshold-based approach
    if (currentScore >= 85) return 'improving';
    if (currentScore >= 70) return 'stable';
    return 'declining';
  }

  private generateTrendData(days: number): DailyCount[] {
    const trends: DailyCount[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate realistic vulnerability trend data
      const baseCount = 20;
      const variation = Math.sin(i / 5) * 5 + Math.random() * 3;
      const count = Math.max(0, Math.round(baseCount + variation - (i / days) * 10));
      
      trends.push({ date, count });
    }

    return trends;
  }

  private async loadHistoricalData(
    config: ComplianceDashboardConfig
  ): Promise<ComplianceMetrics[]> {
    // In a real implementation, this would load from a database or file system
    // For now, we'll generate sample historical data
    const historicalData: ComplianceMetrics[] = [];
    const days = 30;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic historical metrics
      const baseScore = 75;
      const improvement = (days - i) / days * 15;
      const variation = Math.random() * 5 - 2.5;
      
      historicalData.push({
        timestamp: date,
        gdpr: {
          complianceScore: Math.round(baseScore + improvement + variation),
          dataProcessingActivities: 12,
          consentMechanisms: 8,
          dataBreachProcedures: true,
          privacyByDesign: i < days / 2,
          dataProtectionOfficer: i < days / 3,
          issues: []
        },
        nsm: {
          classificationLevel: 'RESTRICTED',
          securityControls: 50,
          implementedControls: Math.round(35 + (days - i) / days * 10),
          criticalFindings: Math.max(0, 5 - Math.floor((days - i) / 7)),
          riskScore: Math.round(baseScore + improvement),
          certificationStatus: i < 10 ? 'certified' : 'in-progress'
        },
        vulnerabilities: {
          critical: Math.max(0, 3 - Math.floor((days - i) / 10)),
          high: Math.max(0, 8 - Math.floor((days - i) / 5)),
          medium: 15 - Math.floor((days - i) / 3),
          low: 25,
          totalScanned: 1000,
          lastScanDate: date,
          trendsLast30Days: []
        },
        licenses: {
          compliantPackages: 450 + Math.floor((days - i) / 2),
          nonCompliantPackages: Math.max(0, 15 - Math.floor((days - i) / 3)),
          unknownLicenses: 5,
          restrictedLicenses: [],
          approvedLicenses: []
        },
        overallScore: Math.round(baseScore + improvement + variation),
        trend: 'improving'
      });
    }

    return historicalData;
  }

  private getTranslations(language: 'en' | 'nb-NO'): Record<string, string> {
    const translations = {
      'en': {
        title: 'Compliance Dashboard',
        overallScore: 'Overall Compliance Score',
        alerts: 'Alerts',
        recommendations: 'Recommendations',
        metrics: 'Key Metrics',
        gdprCompliance: 'GDPR Compliance',
        nsmCompliance: 'NSM Security Compliance',
        vulnerabilities: 'Security Vulnerabilities',
        licenseCompliance: 'License Compliance',
        trend: 'Trend',
        lastUpdated: 'Last Updated',
        export: 'Export',
        refresh: 'Refresh',
        settings: 'Settings',
        help: 'Help'
      },
      'nb-NO': {
        title: 'Etterlevelse Dashboard',
        overallScore: 'Samlet Etterlevelse Score',
        alerts: 'Varsler',
        recommendations: 'Anbefalinger',
        metrics: 'Nøkkeltall',
        gdprCompliance: 'GDPR Etterlevelse',
        nsmCompliance: 'NSM Sikkerhetsetterlevelse',
        vulnerabilities: 'Sikkerhetssårbarheter',
        licenseCompliance: 'Lisens Etterlevelse',
        trend: 'Trend',
        lastUpdated: 'Sist Oppdatert',
        export: 'Eksporter',
        refresh: 'Oppdater',
        settings: 'Innstillinger',
        help: 'Hjelp'
      }
    };

    return translations[language];
  }

  public async generateRealTimeUpdates(
    config: ComplianceDashboardConfig,
    callback: (update: ComplianceMetrics) => void
  ): Promise<() => void> {
    let intervalId: NodeJS.Timeout;

    const updateMetrics = async () => {
      try {
        const metrics = await this.collectMetrics(config);
        callback(metrics);
      } catch (error) {
        this.logger.error(`Failed to update metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    // Initial update
    await updateMetrics();

    // Set up periodic updates (every 5 minutes)
    intervalId = setInterval(updateMetrics, 5 * 60 * 1000);

    // Return cleanup function
    return () => {
      clearInterval(intervalId);
    };
  }

  public async exportDashboardData(
    config: ComplianceDashboardConfig,
    format: 'csv' | 'excel' | 'json'
  ): Promise<Buffer> {
    const metrics = await this.collectMetrics(config);
    const data = await this.prepareDashboardData(metrics, config);

    switch (format) {
      case 'csv':
        return this.exportToCSV(data);
      case 'excel':
        return this.exportToExcel(data);
      case 'json':
        return Buffer.from(JSON.stringify(data, null, 2));
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private async exportToCSV(data: DashboardData): Promise<Buffer> {
    const rows: string[][] = [];
    
    // Headers
    rows.push(['Metric', 'Value', 'Status', 'Timestamp']);
    
    // Overall score
    rows.push([
      'Overall Compliance Score',
      `${data.metrics.overallScore}%`,
      data.metrics.trend,
      data.metrics.timestamp.toISOString()
    ]);
    
    // GDPR metrics
    rows.push([
      'GDPR Compliance Score',
      `${data.metrics.gdpr.complianceScore}%`,
      data.metrics.gdpr.complianceScore >= 80 ? 'Compliant' : 'Non-Compliant',
      data.metrics.timestamp.toISOString()
    ]);
    
    // NSM metrics
    rows.push([
      'NSM Security Controls',
      `${data.metrics.nsm.implementedControls}/${data.metrics.nsm.securityControls}`,
      data.metrics.nsm.certificationStatus,
      data.metrics.timestamp.toISOString()
    ]);
    
    // Vulnerabilities
    rows.push([
      'Critical Vulnerabilities',
      data.metrics.vulnerabilities.critical.toString(),
      data.metrics.vulnerabilities.critical > 0 ? 'Action Required' : 'OK',
      data.metrics.timestamp.toISOString()
    ]);
    
    // Convert to CSV format
    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    return Buffer.from(csv);
  }

  private async exportToExcel(data: DashboardData): Promise<Buffer> {
    // In a real implementation, this would use a library like ExcelJS
    // For now, we'll throw an error indicating it needs implementation
    throw new Error('Excel export requires ExcelJS library implementation');
  }
}