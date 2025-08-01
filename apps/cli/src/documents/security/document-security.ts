import { z } from 'zod';
import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import type { GenerationResult } from '../../types.js';

/**
 * Document Security and Compliance System
 * 
 * Implements comprehensive document security with encryption,
 * access control, audit logging, and GDPR compliance
 */

// Security classification levels (NSM compliant)
export enum SecurityClassification {
  OPEN = 'OPEN',              // Public information
  INTERNAL = 'INTERNAL',      // Internal use only
  RESTRICTED = 'RESTRICTED',  // Restricted access
  CONFIDENTIAL = 'CONFIDENTIAL' // Highly confidential
}

// Document access permissions
export enum DocumentPermission {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  SHARE = 'share',
  DOWNLOAD = 'download',
  PRINT = 'print',
  EXPORT = 'export'
}

// Document lifecycle events
export enum DocumentEvent {
  CREATED = 'created',
  ACCESSED = 'accessed',
  MODIFIED = 'modified',
  SHARED = 'shared',
  DOWNLOADED = 'downloaded',
  PRINTED = 'printed',
  EXPORTED = 'exported',
  DELETED = 'deleted',
  ENCRYPTED = 'encrypted',
  DECRYPTED = 'decrypted',
  ANONYMIZED = 'anonymized',
  RETENTION_EXPIRED = 'retention_expired'
}

// Document metadata schema
const documentMetadataSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  classification: z.nativeEnum(SecurityClassification),
  owner: z.string(),
  createdAt: z.date(),
  modifiedAt: z.date(),
  size: z.number(),
  checksum: z.string(),
  encryptionKey: z.string().optional(),
  retentionPolicy: z.object({
    retentionPeriod: z.number(), // days
    autoDelete: z.boolean(),
    legalHold: z.boolean().default(false)
  }),
  gdprData: z.object({
    containsPersonalData: z.boolean(),
    dataSubjects: z.array(z.string()).optional(),
    purpose: z.string().optional(),
    legalBasis: z.string().optional(),
    anonymizationDate: z.date().optional()
  }),
  accessControl: z.object({
    public: z.boolean().default(false),
    users: z.array(z.object({
      userId: z.string(),
      permissions: z.array(z.nativeEnum(DocumentPermission))
    })),
    groups: z.array(z.object({
      groupId: z.string(),
      permissions: z.array(z.nativeEnum(DocumentPermission))
    }))
  })
});

export type DocumentMetadata = z.infer<typeof documentMetadataSchema>;

// Audit log entry schema
const auditLogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  documentId: z.string(),
  userId: z.string(),
  event: z.nativeEnum(DocumentEvent),
  details: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  success: z.boolean(),
  errorMessage: z.string().optional()
});

export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>;

/**
 * Document Security Manager
 */
export class DocumentSecurityManager {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  private readonly saltLength = 32;
  private readonly iterations = 100000;

  /**
   * Encrypt document
   */
  async encryptDocument(
    content: Buffer,
    classification: SecurityClassification,
    password?: string
  ): Promise<{
    encrypted: Buffer;
    key: string;
    metadata: {
      algorithm: string;
      iv: string;
      tag: string;
      salt?: string;
    };
  }> {
    // Generate or derive encryption key
    let key: Buffer;
    let salt: Buffer | undefined;

    if (password) {
      // Derive key from password
      salt = crypto.randomBytes(this.saltLength);
      key = crypto.pbkdf2Sync(password, salt, this.iterations, this.keyLength, 'sha256');
    } else {
      // Generate random key
      key = crypto.randomBytes(this.keyLength);
    }

    // Generate IV
    const iv = crypto.randomBytes(this.ivLength);

    // Create cipher
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    // Encrypt content
    const encrypted = Buffer.concat([
      cipher.update(content),
      cipher.final()
    ]);

    // Get auth tag
    const tag = cipher.getAuthTag();

    // Apply additional encryption for higher classifications
    let finalEncrypted = encrypted;
    if (classification === SecurityClassification.CONFIDENTIAL) {
      // Double encryption for confidential documents
      const secondKey = crypto.randomBytes(this.keyLength);
      const secondIv = crypto.randomBytes(this.ivLength);
      const secondCipher = crypto.createCipheriv(this.algorithm, secondKey, secondIv);
      
      finalEncrypted = Buffer.concat([
        secondCipher.update(encrypted),
        secondCipher.final()
      ]);
    }

    return {
      encrypted: finalEncrypted,
      key: key.toString('base64'),
      metadata: {
        algorithm: this.algorithm,
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
        salt: salt?.toString('base64')
      }
    };
  }

  /**
   * Decrypt document
   */
  async decryptDocument(
    encrypted: Buffer,
    key: string,
    metadata: {
      algorithm: string;
      iv: string;
      tag: string;
      salt?: string;
    },
    password?: string
  ): Promise<Buffer> {
    // Derive or decode key
    let keyBuffer: Buffer;

    if (password && metadata.salt) {
      // Derive key from password
      const salt = Buffer.from(metadata.salt, 'base64');
      keyBuffer = crypto.pbkdf2Sync(password, salt, this.iterations, this.keyLength, 'sha256');
    } else {
      // Decode key
      keyBuffer = Buffer.from(key, 'base64');
    }

    // Decode IV and tag
    const iv = Buffer.from(metadata.iv, 'base64');
    const tag = Buffer.from(metadata.tag, 'base64');

    // Create decipher
    const decipher = crypto.createDecipheriv(this.algorithm, keyBuffer, iv);
    decipher.setAuthTag(tag);

    // Decrypt content
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    return decrypted;
  }

  /**
   * Check document access permissions
   */
  async checkAccess(
    document: DocumentMetadata,
    userId: string,
    permission: DocumentPermission,
    userGroups: string[] = []
  ): Promise<boolean> {
    // Check if document is public
    if (document.accessControl.public && permission === DocumentPermission.READ) {
      return true;
    }

    // Check user permissions
    const userAccess = document.accessControl.users.find(u => u.userId === userId);
    if (userAccess && userAccess.permissions.includes(permission)) {
      return true;
    }

    // Check group permissions
    for (const group of userGroups) {
      const groupAccess = document.accessControl.groups.find(g => g.groupId === group);
      if (groupAccess && groupAccess.permissions.includes(permission)) {
        return true;
      }
    }

    // Check if user is owner
    if (document.owner === userId) {
      return true;
    }

    return false;
  }

  /**
   * Log document event
   */
  async logEvent(
    documentId: string,
    userId: string,
    event: DocumentEvent,
    success: boolean,
    details?: Record<string, any>,
    errorMessage?: string
  ): Promise<AuditLogEntry> {
    const logEntry: AuditLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      documentId,
      userId,
      event,
      success,
      details,
      errorMessage,
      ipAddress: details?.ipAddress,
      userAgent: details?.userAgent
    };

    // Store audit log (implement based on your storage solution)
    await this.storeAuditLog(logEntry);

    // Alert on security events
    if (!success || event === DocumentEvent.DELETED) {
      await this.sendSecurityAlert(logEntry);
    }

    return logEntry;
  }

  /**
   * Apply GDPR retention policy
   */
  async applyRetentionPolicy(
    document: DocumentMetadata
  ): Promise<{
    action: 'retain' | 'delete' | 'anonymize';
    reason: string;
  }> {
    const now = new Date();
    const retentionEndDate = new Date(document.createdAt);
    retentionEndDate.setDate(retentionEndDate.getDate() + document.retentionPolicy.retentionPeriod);

    // Check legal hold
    if (document.retentionPolicy.legalHold) {
      return {
        action: 'retain',
        reason: 'Document is under legal hold'
      };
    }

    // Check retention period
    if (now < retentionEndDate) {
      return {
        action: 'retain',
        reason: `Retention period ends on ${retentionEndDate.toISOString()}`
      };
    }

    // Check if document contains personal data
    if (document.gdprData.containsPersonalData) {
      // Check if already anonymized
      if (document.gdprData.anonymizationDate) {
        return {
          action: 'retain',
          reason: 'Document has been anonymized'
        };
      }

      // Should anonymize
      return {
        action: 'anonymize',
        reason: 'Contains personal data - requires anonymization'
      };
    }

    // Can delete
    if (document.retentionPolicy.autoDelete) {
      return {
        action: 'delete',
        reason: 'Retention period expired and auto-delete is enabled'
      };
    }

    return {
      action: 'retain',
      reason: 'Retention period expired but auto-delete is disabled'
    };
  }

  /**
   * Anonymize document
   */
  async anonymizeDocument(
    content: Buffer,
    documentType: string
  ): Promise<{
    anonymized: Buffer;
    removedData: Record<string, string[]>;
  }> {
    let text = content.toString('utf-8');
    const removedData: Record<string, string[]> = {
      personalNumbers: [],
      names: [],
      emails: [],
      phones: [],
      addresses: []
    };

    // Norwegian personal number pattern
    const personalNumberPattern = /\b\d{6}\s?\d{5}\b/g;
    const personalNumbers = text.match(personalNumberPattern) || [];
    removedData.personalNumbers = personalNumbers;
    text = text.replace(personalNumberPattern, '[PERSONNUMMER]');

    // Email pattern
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailPattern) || [];
    removedData.emails = emails;
    text = text.replace(emailPattern, '[E-POST]');

    // Phone pattern (Norwegian)
    const phonePattern = /\b(?:\+47\s?)?[2-9]\d{1}\s?\d{2}\s?\d{2}\s?\d{2}\b/g;
    const phones = text.match(phonePattern) || [];
    removedData.phones = phones;
    text = text.replace(phonePattern, '[TELEFON]');

    // Common Norwegian names (simplified - in production use a name database)
    const commonNames = [
      'Ole', 'Lars', 'Per', 'Knut', 'Svein', 'Hans', 'Tor', 'Arne',
      'Anne', 'Berit', 'Kari', 'Ingrid', 'Astrid', 'Gerd', 'Liv', 'Randi',
      'Hansen', 'Johansen', 'Olsen', 'Larsen', 'Andersen', 'Pedersen'
    ];
    
    commonNames.forEach(name => {
      const namePattern = new RegExp(`\\b${name}\\b`, 'gi');
      if (namePattern.test(text)) {
        removedData.names.push(name);
        text = text.replace(namePattern, '[NAVN]');
      }
    });

    // Address patterns (simplified)
    const addressPattern = /\b\d{1,4}\s+[A-Za-zæøåÆØÅ\s]+(?:gate|vei|veg|plass|gata)\s+\d{1,4}\b/gi;
    const addresses = text.match(addressPattern) || [];
    removedData.addresses = addresses;
    text = text.replace(addressPattern, '[ADRESSE]');

    return {
      anonymized: Buffer.from(text, 'utf-8'),
      removedData
    };
  }

  /**
   * Verify document integrity
   */
  async verifyIntegrity(
    content: Buffer,
    expectedChecksum: string
  ): Promise<{
    valid: boolean;
    actualChecksum: string;
  }> {
    const hash = crypto.createHash('sha256');
    hash.update(content);
    const actualChecksum = hash.digest('hex');

    return {
      valid: actualChecksum === expectedChecksum,
      actualChecksum
    };
  }

  /**
   * Generate secure share link
   */
  async generateShareLink(
    documentId: string,
    permissions: DocumentPermission[],
    expiresIn: number = 24 * 60 * 60 * 1000 // 24 hours
  ): Promise<{
    token: string;
    url: string;
    expiresAt: Date;
  }> {
    const token = crypto.randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + expiresIn);

    // Store share token (implement based on your storage solution)
    await this.storeShareToken({
      token,
      documentId,
      permissions,
      expiresAt
    });

    return {
      token,
      url: `https://your-domain.com/shared/${token}`,
      expiresAt
    };
  }

  /**
   * Backup document securely
   */
  async backupDocument(
    document: DocumentMetadata,
    content: Buffer
  ): Promise<{
    backupId: string;
    location: string;
    encryptionKey: string;
  }> {
    // Encrypt before backup
    const { encrypted, key, metadata } = await this.encryptDocument(
      content,
      document.classification
    );

    // Generate backup ID
    const backupId = `backup_${document.id}_${Date.now()}`;

    // Store backup (implement based on your backup solution)
    const location = await this.storeBackup(backupId, encrypted, metadata);

    // Log backup event
    await this.logEvent(
      document.id,
      'system',
      DocumentEvent.CREATED,
      true,
      { backupId, location }
    );

    return {
      backupId,
      location,
      encryptionKey: key
    };
  }

  /**
   * Helper: Store audit log
   */
  private async storeAuditLog(entry: AuditLogEntry): Promise<void> {
    // TODO: Implement based on your storage solution
    // Options: Database, Elasticsearch, CloudWatch, etc.
    console.log('Audit log:', entry);
  }

  /**
   * Helper: Send security alert
   */
  private async sendSecurityAlert(entry: AuditLogEntry): Promise<void> {
    // TODO: Implement based on your alerting solution
    // Options: Email, Slack, Teams, PagerDuty, etc.
    console.log('Security alert:', entry);
  }

  /**
   * Helper: Store share token
   */
  private async storeShareToken(token: any): Promise<void> {
    // TODO: Implement based on your storage solution
    console.log('Share token stored:', token);
  }

  /**
   * Helper: Store backup
   */
  private async storeBackup(
    backupId: string,
    encrypted: Buffer,
    metadata: any
  ): Promise<string> {
    // TODO: Implement based on your backup solution
    // Options: S3, Azure Blob, Google Cloud Storage, etc.
    return `s3://backups/${backupId}`;
  }
}

/**
 * Generate document security component
 */
export async function generateDocumentSecurityComponent(
  options: z.infer<typeof documentSecurityOptionsSchema>
): Promise<GenerationResult> {
  const files = new Map<string, string>();
  
  // Generate security service
  const serviceContent = `
${options.typescript ? `
import type { 
  DocumentMetadata,
  SecurityClassification,
  DocumentPermission,
  DocumentEvent
} from '../types/document-security';
` : ''}
import { DocumentSecurityManager } from '../lib/document-security';
import crypto from 'crypto';

/**
 * Document Security Service for ${options.projectName}
 * Handles encryption, access control, and compliance
 */
export class DocumentSecurityService {
  private securityManager = new DocumentSecurityManager();
  private documentStore = new Map<string, DocumentMetadata>();

  /**
   * Upload and secure document
   */
  async secureDocument(
    content${options.typescript ? ': Buffer' : ''},
    metadata${options.typescript ? ': Partial<DocumentMetadata>' : ''},
    classification${options.typescript ? ': SecurityClassification' : ''}
  )${options.typescript ? ': Promise<string>' : ''} {
    // Generate document ID
    const documentId = crypto.randomUUID();
    
    // Encrypt document
    const { encrypted, key, metadata: encryptionMeta } = await this.securityManager.encryptDocument(
      content,
      classification
    );
    
    // Calculate checksum
    const checksum = crypto.createHash('sha256').update(content).digest('hex');
    
    // Create full metadata
    const fullMetadata${options.typescript ? ': DocumentMetadata' : ''} = {
      id: documentId,
      title: metadata.title || 'Untitled',
      type: metadata.type || 'document',
      classification,
      owner: metadata.owner || 'system',
      createdAt: new Date(),
      modifiedAt: new Date(),
      size: content.length,
      checksum,
      encryptionKey: key,
      retentionPolicy: metadata.retentionPolicy || {
        retentionPeriod: 365 * 7, // 7 years default
        autoDelete: false,
        legalHold: false
      },
      gdprData: metadata.gdprData || {
        containsPersonalData: false
      },
      accessControl: metadata.accessControl || {
        public: false,
        users: [],
        groups: []
      }
    };
    
    // Store metadata
    this.documentStore.set(documentId, fullMetadata);
    
    // Store encrypted content (implement based on your storage)
    await this.storeEncryptedContent(documentId, encrypted, encryptionMeta);
    
    // Log creation
    await this.securityManager.logEvent(
      documentId,
      fullMetadata.owner,
      'created' as DocumentEvent,
      true
    );
    
    return documentId;
  }

  /**
   * Access document with permission check
   */
  async accessDocument(
    documentId${options.typescript ? ': string' : ''},
    userId${options.typescript ? ': string' : ''},
    permission${options.typescript ? ': DocumentPermission' : ''}
  )${options.typescript ? ': Promise<Buffer | null>' : ''} {
    const metadata = this.documentStore.get(documentId);
    if (!metadata) {
      await this.securityManager.logEvent(
        documentId,
        userId,
        'accessed' as DocumentEvent,
        false,
        {},
        'Document not found'
      );
      return null;
    }
    
    // Check access
    const hasAccess = await this.securityManager.checkAccess(
      metadata,
      userId,
      permission
    );
    
    if (!hasAccess) {
      await this.securityManager.logEvent(
        documentId,
        userId,
        'accessed' as DocumentEvent,
        false,
        { permission },
        'Access denied'
      );
      return null;
    }
    
    // Retrieve and decrypt
    const { encrypted, encryptionMeta } = await this.retrieveEncryptedContent(documentId);
    const decrypted = await this.securityManager.decryptDocument(
      encrypted,
      metadata.encryptionKey!,
      encryptionMeta
    );
    
    // Log successful access
    await this.securityManager.logEvent(
      documentId,
      userId,
      'accessed' as DocumentEvent,
      true,
      { permission }
    );
    
    return decrypted;
  }

  /**
   * Apply retention policies
   */
  async applyRetentionPolicies()${options.typescript ? ': Promise<void>' : ''} {
    for (const [documentId, metadata] of this.documentStore) {
      const { action, reason } = await this.securityManager.applyRetentionPolicy(metadata);
      
      switch (action) {
        case 'delete':
          await this.deleteDocument(documentId);
          console.log(\`Deleted document \${documentId}: \${reason}\`);
          break;
          
        case 'anonymize':
          await this.anonymizeDocument(documentId);
          console.log(\`Anonymized document \${documentId}: \${reason}\`);
          break;
          
        case 'retain':
          console.log(\`Retained document \${documentId}: \${reason}\`);
          break;
      }
    }
  }

  /**
   * Helper methods
   */
  
  private async storeEncryptedContent(
    documentId${options.typescript ? ': string' : ''},
    encrypted${options.typescript ? ': Buffer' : ''},
    metadata${options.typescript ? ': any' : ''}
  )${options.typescript ? ': Promise<void>' : ''} {
    // TODO: Implement based on your storage solution
    console.log(\`Storing encrypted document \${documentId}\`);
  }
  
  private async retrieveEncryptedContent(
    documentId${options.typescript ? ': string' : ''}
  )${options.typescript ? ': Promise<{ encrypted: Buffer; encryptionMeta: any }>' : ''} {
    // TODO: Implement based on your storage solution
    throw new Error('Not implemented');
  }
  
  private async deleteDocument(
    documentId${options.typescript ? ': string' : ''}
  )${options.typescript ? ': Promise<void>' : ''} {
    this.documentStore.delete(documentId);
    // TODO: Delete from storage
  }
  
  private async anonymizeDocument(
    documentId${options.typescript ? ': string' : ''}
  )${options.typescript ? ': Promise<void>' : ''} {
    const metadata = this.documentStore.get(documentId);
    if (metadata) {
      metadata.gdprData.anonymizationDate = new Date();
      // TODO: Anonymize actual content
    }
  }
}

// Export singleton instance
export const documentSecurityService = new DocumentSecurityService();`;

  files.set('services/document-security-service.ts', serviceContent);
  
  // Generate compliance report template
  const complianceReportContent = `
${options.typescript ? `
import type { DocumentMetadata, AuditLogEntry } from '../types/document-security';
` : ''}

/**
 * Document Compliance Report Generator
 */
export class DocumentComplianceReporter {
  /**
   * Generate GDPR compliance report
   */
  async generateGDPRReport(
    documents${options.typescript ? ': DocumentMetadata[]' : ''},
    auditLogs${options.typescript ? ': AuditLogEntry[]' : ''}
  )${options.typescript ? ': Promise<string>' : ''} {
    const report = {
      generatedAt: new Date(),
      totalDocuments: documents.length,
      documentsWithPersonalData: documents.filter(d => d.gdprData.containsPersonalData).length,
      anonymizedDocuments: documents.filter(d => d.gdprData.anonymizationDate).length,
      documentsByClassification: this.groupByClassification(documents),
      retentionCompliance: this.analyzeRetention(documents),
      accessPatterns: this.analyzeAccess(auditLogs),
      securityIncidents: auditLogs.filter(log => !log.success).length
    };
    
    return this.formatReport(report);
  }
  
  private groupByClassification(documents${options.typescript ? ': DocumentMetadata[]' : ''}) {
    const groups${options.typescript ? ': Record<string, number>' : ''} = {};
    documents.forEach(doc => {
      groups[doc.classification] = (groups[doc.classification] || 0) + 1;
    });
    return groups;
  }
  
  private analyzeRetention(documents${options.typescript ? ': DocumentMetadata[]' : ''}) {
    const now = new Date();
    let expired = 0;
    let expiringSoon = 0;
    
    documents.forEach(doc => {
      const expiryDate = new Date(doc.createdAt);
      expiryDate.setDate(expiryDate.getDate() + doc.retentionPolicy.retentionPeriod);
      
      if (expiryDate < now) {
        expired++;
      } else if (expiryDate < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) {
        expiringSoon++;
      }
    });
    
    return { expired, expiringSoon };
  }
  
  private analyzeAccess(auditLogs${options.typescript ? ': AuditLogEntry[]' : ''}) {
    const accessByUser${options.typescript ? ': Record<string, number>' : ''} = {};
    const accessByEvent${options.typescript ? ': Record<string, number>' : ''} = {};
    
    auditLogs.forEach(log => {
      accessByUser[log.userId] = (accessByUser[log.userId] || 0) + 1;
      accessByEvent[log.event] = (accessByEvent[log.event] || 0) + 1;
    });
    
    return { byUser: accessByUser, byEvent: accessByEvent };
  }
  
  private formatReport(data${options.typescript ? ': any' : ''})${options.typescript ? ': string' : ''} {
    return JSON.stringify(data, null, 2);
  }
}

export const complianceReporter = new DocumentComplianceReporter();`;

  files.set('services/document-compliance-reporter.ts', complianceReportContent);
  
  return {
    success: true,
    files,
    message: 'Document security system created successfully'
  };
}

// Component options schema
const documentSecurityOptionsSchema = z.object({
  typescript: z.boolean().default(true),
  projectName: z.string(),
  outputPath: z.string()
});

// Export security manager instance
export const documentSecurityManager = new DocumentSecurityManager();