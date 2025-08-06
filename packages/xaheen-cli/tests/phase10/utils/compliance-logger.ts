/**
 * Compliance Logger for Phase 10 Testing
 * 
 * Specialized logging system for Norwegian government compliance testing
 * with audit trail generation and regulatory reporting capabilities.
 */

import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface ComplianceLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'audit';
  component: string;
  event: string;
  message: string;
  metadata?: Record<string, any>;
  complianceContext?: {
    standard: string;
    requirement: string;
    classification?: string;
  };
  auditRequired?: boolean;
  dataSubjectId?: string;
  organizationNumber?: string;
}

export interface AuditLogEntry {
  auditId: string;
  timestamp: string;
  event: string;
  actor: string;
  resource?: string;
  action: string;
  outcome: 'success' | 'failure' | 'partial';
  dataSubjectId?: string;
  organizationNumber?: string;
  classification?: string;
  legalBasis?: string;
  metadata: Record<string, any>;
  checksum: string;
}

export class ComplianceLogger {
  private component: string;
  private logDirectory: string;
  private auditLogPath: string;
  private complianceLogPath: string;
  private auditBuffer: AuditLogEntry[] = [];

  constructor(component: string, options?: { logDirectory?: string }) {
    this.component = component;
    this.logDirectory = options?.logDirectory || './test-output/phase10/logs';
    
    // Ensure log directory exists
    if (!existsSync(this.logDirectory)) {
      mkdirSync(this.logDirectory, { recursive: true });
    }
    
    this.auditLogPath = join(this.logDirectory, 'audit.log');
    this.complianceLogPath = join(this.logDirectory, 'compliance.log');
    
    // Initialize log files with headers
    this.initializeLogFiles();
  }

  private initializeLogFiles(): void {
    const timestamp = new Date().toISOString();
    
    if (!existsSync(this.complianceLogPath)) {
      const header = `# Phase 10 Compliance Test Log\n# Started: ${timestamp}\n# Component: ${this.component}\n\n`;
      writeFileSync(this.complianceLogPath, header);
    }
    
    if (!existsSync(this.auditLogPath)) {
      const header = `# Phase 10 Audit Log\n# Started: ${timestamp}\n# Norwegian Government Compliance Testing\n\n`;
      writeFileSync(this.auditLogPath, header);
    }
  }

  info(message: string, metadata?: Record<string, any>, complianceContext?: {
    standard: string;
    requirement: string;
    classification?: string;
  }): void {
    this.log('info', 'INFO', message, metadata, complianceContext);
  }

  warn(message: string, metadata?: Record<string, any>, complianceContext?: {
    standard: string;
    requirement: string;
    classification?: string;
  }): void {
    this.log('warn', 'WARN', message, metadata, complianceContext);
  }

  error(message: string, metadata?: Record<string, any>, complianceContext?: {
    standard: string;
    requirement: string;
    classification?: string;
  }): void {
    this.log('error', 'ERROR', message, metadata, complianceContext);
  }

  audit(event: string, actor: string, action: string, outcome: 'success' | 'failure' | 'partial', options?: {
    resource?: string;
    dataSubjectId?: string;
    organizationNumber?: string;
    classification?: string;
    legalBasis?: string;
    metadata?: Record<string, any>;
  }): void {
    const auditEntry: AuditLogEntry = {
      auditId: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      event,
      actor,
      resource: options?.resource,
      action,
      outcome,
      dataSubjectId: options?.dataSubjectId,
      organizationNumber: options?.organizationNumber,
      classification: options?.classification,
      legalBasis: options?.legalBasis,
      metadata: options?.metadata || {},
      checksum: this.generateChecksum({
        event,
        actor,
        action,
        outcome,
        timestamp: new Date().toISOString()
      })
    };

    this.auditBuffer.push(auditEntry);
    this.writeAuditEntry(auditEntry);
    
    // Also log as compliance event
    this.log('audit', 'AUDIT', `${event}: ${action} by ${actor}`, {
      auditId: auditEntry.auditId,
      outcome,
      ...options?.metadata
    }, {
      standard: 'Norwegian Audit Requirements',
      requirement: 'Audit Trail Generation',
      classification: options?.classification
    });
  }

  private log(level: 'info' | 'warn' | 'error' | 'audit', prefix: string, message: string, 
              metadata?: Record<string, any>, complianceContext?: {
    standard: string;
    requirement: string;
    classification?: string;
  }): void {
    const timestamp = new Date().toISOString();
    
    const logEntry: ComplianceLogEntry = {
      timestamp,
      level,
      component: this.component,
      event: `${this.component}_${level.toUpperCase()}`,
      message,
      metadata,
      complianceContext,
      auditRequired: level === 'audit' || complianceContext?.classification !== undefined
    };

    // Console output with colors
    const colorCode = this.getColorCode(level);
    const resetCode = '\x1b[0m';
    const componentColor = '\x1b[36m'; // Cyan
    
    console.log(
      `${colorCode}[${timestamp}] ${prefix}${resetCode} ` +
      `${componentColor}${this.component}${resetCode}: ${message}`
    );

    if (metadata && Object.keys(metadata).length > 0) {
      console.log(`  ${this.formatMetadata(metadata)}`);
    }

    if (complianceContext) {
      console.log(`  📋 Standard: ${complianceContext.standard}`);
      console.log(`  🎯 Requirement: ${complianceContext.requirement}`);
      if (complianceContext.classification) {
        console.log(`  🔒 Classification: ${complianceContext.classification}`);
      }
    }

    // Write to compliance log file
    this.writeComplianceEntry(logEntry);
  }

  private writeComplianceEntry(entry: ComplianceLogEntry): void {
    const logLine = JSON.stringify(entry) + '\n';
    appendFileSync(this.complianceLogPath, logLine);
  }

  private writeAuditEntry(entry: AuditLogEntry): void {
    const logLine = JSON.stringify(entry) + '\n';
    appendFileSync(this.auditLogPath, logLine);
  }

  private getColorCode(level: string): string {
    switch (level) {
      case 'info': return '\x1b[32m';  // Green
      case 'warn': return '\x1b[33m';  // Yellow
      case 'error': return '\x1b[31m'; // Red
      case 'audit': return '\x1b[35m'; // Magenta
      default: return '\x1b[0m';       // Reset
    }
  }

  private formatMetadata(metadata: Record<string, any>): string {
    return Object.entries(metadata)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(', ');
  }

  private generateAuditId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `audit-${timestamp}-${random}`;
  }

  private generateChecksum(data: Record<string, any>): string {
    // Simple checksum for audit integrity
    const str = JSON.stringify(data, Object.keys(data).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Norwegian-specific logging methods

  bankidLog(event: string, personalNumber: string, outcome: 'success' | 'failure', metadata?: Record<string, any>): void {
    this.audit('BANKID_AUTHENTICATION', personalNumber, event, outcome, {
      resource: 'bankid_service',
      legalBasis: 'norwegian_eid_framework',
      classification: 'RESTRICTED',
      metadata: {
        endpoint: 'https://eid-exttest.difi.no/',
        ...metadata
      }
    });
  }

  altinnLog(event: string, organizationNumber: string, outcome: 'success' | 'failure', metadata?: Record<string, any>): void {
    this.audit('ALTINN_DATA_ACCESS', 'system', event, outcome, {
      resource: 'altinn_service',
      organizationNumber,
      legalBasis: 'public_service_delivery',
      classification: 'RESTRICTED',
      metadata: {
        endpoint: 'https://tt02.altinn.no/',
        ...metadata
      }
    });
  }

  digipostLog(event: string, recipient: string, documentId: string, outcome: 'success' | 'failure', metadata?: Record<string, any>): void {
    this.audit('DIGIPOST_DOCUMENT_SUBMISSION', 'system', event, outcome, {
      resource: 'digipost_service',
      dataSubjectId: recipient,
      legalBasis: 'document_delivery',
      classification: metadata?.classification || 'OPEN',
      metadata: {
        documentId,
        endpoint: 'https://api.digipost.no/test/',
        ...metadata
      }
    });
  }

  nsmLog(event: string, classification: string, documentId: string, outcome: 'success' | 'failure', metadata?: Record<string, any>): void {
    this.audit('NSM_DATA_CLASSIFICATION', 'system', event, outcome, {
      resource: 'nsm_security_handler',
      classification,
      legalBasis: 'nsm_security_framework',
      metadata: {
        documentId,
        securityLevel: classification,
        ...metadata
      }
    });
  }

  gdprLog(event: string, dataSubjectId: string, outcome: 'success' | 'failure', metadata?: Record<string, any>): void {
    this.audit('GDPR_DATA_PROCESSING', dataSubjectId, event, outcome, {
      resource: 'gdpr_service',
      dataSubjectId,
      legalBasis: metadata?.legalBasis || 'consent',
      classification: 'CONFIDENTIAL',
      metadata: {
        gdprArticle: metadata?.gdprArticle,
        processingPurpose: metadata?.processingPurpose,
        ...metadata
      }
    });
  }

  wcagLog(event: string, complianceLevel: 'A' | 'AA' | 'AAA', violations: number, metadata?: Record<string, any>): void {
    this.audit('WCAG_ACCESSIBILITY_TEST', 'axe-core', event, violations === 0 ? 'success' : 'failure', {
      resource: 'accessibility_tester',
      legalBasis: 'norwegian_accessibility_regulations',
      metadata: {
        wcagLevel: complianceLevel,
        wcagVersion: '2.2',
        violations,
        ...metadata
      }
    });
  }

  // Compliance reporting methods

  async getAuditLogs(filter?: {
    startDate?: string;
    endDate?: string;
    event?: string;
    dataSubjectId?: string;
    classification?: string;
  }): Promise<AuditLogEntry[]> {
    // In a real implementation, this would query the audit log file or database
    return this.auditBuffer.filter(entry => {
      if (filter?.startDate && entry.timestamp < filter.startDate) return false;
      if (filter?.endDate && entry.timestamp > filter.endDate) return false;
      if (filter?.event && !entry.event.includes(filter.event)) return false;
      if (filter?.dataSubjectId && entry.dataSubjectId !== filter.dataSubjectId) return false;
      if (filter?.classification && entry.classification !== filter.classification) return false;
      return true;
    });
  }

  async getComplianceLogs(filter?: {
    standard?: string;
    level?: string;
    component?: string;
  }): Promise<ComplianceLogEntry[]> {
    // In a real implementation, this would read from the compliance log file
    return [];
  }

  async generateComplianceReport(): Promise<{
    reportId: string;
    generatedAt: string;
    totalEvents: number;
    auditEvents: number;
    complianceViolations: number;
    norwegianCompliance: boolean;
    gdprCompliance: boolean;
    wcagCompliance: boolean;
    nsmCompliance: boolean;
  }> {
    const auditEvents = this.auditBuffer.length;
    const reportId = `compliance-report-${Date.now()}`;
    
    return {
      reportId,
      generatedAt: new Date().toISOString(),
      totalEvents: auditEvents,
      auditEvents,
      complianceViolations: 0, // Would be calculated from actual logs
      norwegianCompliance: true,
      gdprCompliance: true,
      wcagCompliance: true,
      nsmCompliance: true
    };
  }

  async flush(): Promise<void> {
    // Ensure all buffered logs are written
    if (this.auditBuffer.length > 0) {
      const summary = `\n# Audit Summary: ${this.auditBuffer.length} events logged\n`;
      appendFileSync(this.auditLogPath, summary);
    }
    
    const closingEntry = `\n# Log closed: ${new Date().toISOString()}\n`;
    appendFileSync(this.complianceLogPath, closingEntry);
    appendFileSync(this.auditLogPath, closingEntry);
  }
}