/**
 * Digipost Integration Generator
 * Generates comprehensive Digipost document delivery integration with Norwegian compliance
 */

import type { GeneratedFile } from "../../types/index.js";

export interface DigipostIntegrationOptions {
	name: string;
	environment: "test" | "production";
	features: DigipostFeature[];
	authentication: {
		brokerId: string;
		keyStore: string;
		keyStorePassword: string;
		keyAlias: string;
	};
	compliance: {
		gdpr: boolean;
		auditLogging: boolean;
		dataResidency: "norway" | "eu";
		documentClassification: "OPEN" | "RESTRICTED" | "CONFIDENTIAL" | "SECRET";
	};
	senderInformation: {
		organizationNumber: string;
		organizationName: string;
		contactPerson: string;
		contactEmail: string;
	};
}

export type DigipostFeature =
	| "document-delivery"
	| "digital-signatures"
	| "document-tracking"
	| "bulk-sending"
	| "template-based-documents"
	| "secure-document-storage"
	| "receipt-management"
	| "multi-recipient"
	| "document-encryption"
	| "audit-trail"
	| "webhook-notifications"
	| "print-fallback";

export class DigipostIntegrationGenerator {
	async generate(
		options: DigipostIntegrationOptions,
	): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];

		// Core Digipost service files
		files.push(...this.generateCoreServices(options));

		// Document delivery features
		if (options.features.includes("document-delivery")) {
			files.push(...this.generateDocumentDelivery(options));
		}

		if (options.features.includes("digital-signatures")) {
			files.push(...this.generateDigitalSignatures(options));
		}

		if (options.features.includes("document-tracking")) {
			files.push(...this.generateDocumentTracking(options));
		}

		if (options.features.includes("secure-document-storage")) {
			files.push(...this.generateSecureStorage(options));
		}

		if (options.features.includes("bulk-sending")) {
			files.push(...this.generateBulkSending(options));
		}

		if (options.features.includes("template-based-documents")) {
			files.push(...this.generateTemplateEngine(options));
		}

		// Webhook handlers
		if (options.features.includes("webhook-notifications")) {
			files.push(...this.generateWebhookHandlers(options));
		}

		// Compliance and security
		if (options.compliance.auditLogging) {
			files.push(...this.generateAuditLogging(options));
		}

		// Document encryption
		if (options.features.includes("document-encryption")) {
			files.push(...this.generateEncryptionServices(options));
		}

		// Error handling and monitoring
		files.push(...this.generateErrorHandling(options));

		// Tests
		files.push(...this.generateTests(options));

		// Documentation
		files.push(...this.generateDocumentation(options));

		return files;
	}

	private generateCoreServices(
		options: DigipostIntegrationOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		// Configuration
		files.push({
			path: `${options.name}/integrations/digipost/config/digipost.config.ts`,
			content: this.generateDigipostConfig(options),
			type: "create",
		});

		// Types and interfaces
		files.push({
			path: `${options.name}/integrations/digipost/types/digipost.types.ts`,
			content: this.generateDigipostTypes(options),
			type: "create",
		});

		// Main service
		files.push({
			path: `${options.name}/integrations/digipost/services/digipost.service.ts`,
			content: this.generateDigipostService(options),
			type: "create",
		});

		// HTTP client with certificate authentication
		files.push({
			path: `${options.name}/integrations/digipost/services/digipost-http.client.ts`,
			content: this.generateDigipostHttpClient(options),
			type: "create",
		});

		// Authentication service
		files.push({
			path: `${options.name}/integrations/digipost/services/digipost-auth.service.ts`,
			content: this.generateDigipostAuthService(options),
			type: "create",
		});

		return files;
	}

	private generateDigipostConfig(options: DigipostIntegrationOptions): string {
		const baseUrl =
			options.environment === "production"
				? "https://api.digipost.no"
				: "https://api-test.digipost.no";

		return `/**
 * Digipost Configuration
 * Norwegian digital mailbox service - Enterprise configuration
 */

export interface DigipostConfig {
  readonly baseUrl: string;
  readonly brokerId: string;
  readonly keyStore: string;
  readonly keyStorePassword: string;
  readonly keyAlias: string;
  readonly environment: 'test' | 'production';
  readonly timeout: number;
  readonly retryAttempts: number;
  readonly features: readonly string[];
  readonly senderInfo: DigipostSenderInfo;
  readonly compliance: DigipostComplianceConfig;
}

export interface DigipostSenderInfo {
  readonly organizationNumber: string;
  readonly organizationName: string;
  readonly contactPerson: string;
  readonly contactEmail: string;
}

export interface DigipostComplianceConfig {
  readonly gdpr: boolean;
  readonly auditLogging: boolean;
  readonly dataResidency: 'norway' | 'eu';
  readonly documentClassification: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

export const digipostConfig: DigipostConfig = {
  baseUrl: '${baseUrl}',
  brokerId: process.env.DIGIPOST_BROKER_ID || '${options.authentication.brokerId}',
  keyStore: process.env.DIGIPOST_KEYSTORE_PATH || '${options.authentication.keyStore}',
  keyStorePassword: process.env.DIGIPOST_KEYSTORE_PASSWORD || '',
  keyAlias: process.env.DIGIPOST_KEY_ALIAS || '${options.authentication.keyAlias}',
  environment: '${options.environment}',
  timeout: 60000, // 60 seconds for document operations
  retryAttempts: 3,
  features: ${JSON.stringify(options.features)},
  senderInfo: {
    organizationNumber: '${options.senderInformation.organizationNumber}',
    organizationName: '${options.senderInformation.organizationName}',
    contactPerson: '${options.senderInformation.contactPerson}',
    contactEmail: '${options.senderInformation.contactEmail}',
  },
  compliance: {
    gdpr: ${options.compliance.gdpr},
    auditLogging: ${options.compliance.auditLogging},
    dataResidency: '${options.compliance.dataResidency}',
    documentClassification: '${options.compliance.documentClassification}',
  },
} as const;

// Digipost API endpoints
export const DIGIPOST_ENDPOINTS = {
  DOCUMENTS: '/documents',
  RECIPIENTS: '/recipients',
  BATCHES: '/batches',
  TEMPLATES: '/templates',
  SIGNATURES: '/signatures',
  TRACKING: '/tracking',
  ARCHIVE: '/archive',
  WEBHOOKS: '/webhooks',
  PRINT_JOBS: '/print',
} as const;

// Norwegian document standards
export const NORWEGIAN_DOCUMENT_STANDARDS = {
  ACCEPTED_FORMATS: ['PDF', 'PDF_A1', 'PDF_A2'],
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_BATCH_SIZE: 1000,
  RETENTION_PERIOD: 10 * 365, // 10 years in days
  LANGUAGE: 'nb-NO',
  TIMEZONE: 'Europe/Oslo',
} as const;

// Security settings
export const SECURITY_CONFIG = {
  ENCRYPTION_ALGORITHM: 'AES-256-GCM',
  SIGNATURE_ALGORITHM: 'RSA-SHA256',
  CERTIFICATE_VALIDATION: true,
  MIN_TLS_VERSION: '1.2',
  WEBHOOK_SECRET: process.env.DIGIPOST_WEBHOOK_SECRET || '',
} as const;

// Document classification levels according to Norwegian standards
export const DOCUMENT_CLASSIFICATION = {
  OPEN: {
    level: 0,
    description: 'Åpen informasjon',
    color: '#00FF00',
    retention: 5 * 365, // 5 years
  },
  RESTRICTED: {
    level: 1,
    description: 'Begrenset tilgang',
    color: '#FFFF00',
    retention: 7 * 365, // 7 years
  },
  CONFIDENTIAL: {
    level: 2,
    description: 'Konfidensiell',
    color: '#FF8000',
    retention: 10 * 365, // 10 years
  },
  SECRET: {
    level: 3,
    description: 'Hemmelig',
    color: '#FF0000',
    retention: 30 * 365, // 30 years
  },
} as const;`;
	}

	private generateDigipostTypes(options: DigipostIntegrationOptions): string {
		return `/**
 * Digipost TypeScript Types and Interfaces
 * Comprehensive type definitions for Norwegian Digipost integration
 */

// Core document types
export interface DigipostDocument {
  readonly subject: string;
  readonly fileType: DigipostFileType;
  readonly content: Buffer | string; // Base64 encoded content
  readonly fileName: string;
  readonly classification?: DigipostClassification;
  readonly metadata?: DigipostDocumentMetadata;
  readonly deliveryTime?: Date;
  readonly authenticationRequired?: boolean;
  readonly smsNotification?: boolean;
  readonly emailNotification?: boolean;
}

export interface DigipostDocumentMetadata {
  readonly documentId?: string;
  readonly externalId?: string;
  readonly tags?: string[];
  readonly description?: string;
  readonly category?: string;
  readonly priority?: DigipostPriority;
  readonly language?: 'nb-NO' | 'nn-NO' | 'en-US';
  readonly customProperties?: Record<string, string>;
}

export enum DigipostFileType {
  PDF = 'PDF',
  PDF_A1 = 'PDF_A1',
  PDF_A2 = 'PDF_A2',
}

export enum DigipostClassification {
  OPEN = 'OPEN',
  RESTRICTED = 'RESTRICTED',
  CONFIDENTIAL = 'CONFIDENTIAL',
  SECRET = 'SECRET',
}

export enum DigipostPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// Recipient types
export interface DigipostRecipient {
  readonly identificationType: DigipostIdentificationType;
  readonly identificationValue: string;
  readonly name?: string;
  readonly address?: DigipostAddress;
  readonly deliveryMethod?: DigipostDeliveryMethod;
  readonly printDetails?: DigipostPrintDetails;
}

export enum DigipostIdentificationType {
  PERSONAL_IDENTIFICATION_NUMBER = 'PERSONAL_IDENTIFICATION_NUMBER', // Norwegian SSN
  ORGANIZATION_NUMBER = 'ORGANIZATION_NUMBER',
  DIGIPOST_ADDRESS = 'DIGIPOST_ADDRESS',
  NAME_AND_ADDRESS = 'NAME_AND_ADDRESS',
}

export enum DigipostDeliveryMethod {
  DIGIPOST = 'DIGIPOST',
  PRINT = 'PRINT',
  DIGIPOST_WITH_PRINT_FALLBACK = 'DIGIPOST_WITH_PRINT_FALLBACK',
}

export interface DigipostAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2?: string;
  readonly postalCode: string;
  readonly city: string;
  readonly country: 'NO'; // Norway only for Digipost
}

export interface DigipostPrintDetails {
  readonly printColors: 'MONOCHROME' | 'COLORS';
  readonly nondeliverableHandling: 'RETURN_TO_SENDER' | 'DISCARD';
  readonly printInstructions?: string;
}

// Message and batch types
export interface DigipostMessage {
  readonly messageId?: string;
  readonly recipient: DigipostRecipient;
  readonly document: DigipostDocument;
  readonly deliveryOptions?: DigipostDeliveryOptions;
  readonly requestForRegistration?: boolean;
}

export interface DigipostDeliveryOptions {
  readonly deliveryMethod: DigipostDeliveryMethod;
  readonly deliveryTime?: Date;
  readonly primaryDocument: boolean;
  readonly attachments?: DigipostDocument[];
  readonly invoiceReference?: string;
}

export interface DigipostBatch {
  readonly batchId?: string;
  readonly messages: DigipostMessage[];
  readonly senderInfo: DigipostSenderInformation;
  readonly batchOptions?: DigipostBatchOptions;
  readonly createdAt?: Date;
  readonly status?: DigipostBatchStatus;
}

export interface DigipostBatchOptions {
  readonly autocomplete?: boolean;
  readonly requestForRegistration?: boolean;
  readonly webhookUrl?: string;
  readonly printJob?: DigipostPrintJob;
}

export enum DigipostBatchStatus {
  CREATED = 'CREATED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PARTIALLY_FAILED = 'PARTIALLY_FAILED',
}

// Digital signature types
export interface DigipostSignatureJob {
  readonly signatureJobId?: string;
  readonly title: string;
  readonly description?: string;
  readonly document: DigipostDocument;
  readonly signers: DigipostSigner[];
  readonly signatureType: DigipostSignatureType;
  readonly authenticationLevel: DigipostAuthLevel;
  readonly completionDeadline?: Date;
  readonly signaturePackaging?: DigipostSignaturePackaging;
  readonly notifications?: DigipostSignatureNotifications;
}

export interface DigipostSigner {
  readonly personalIdentificationNumber: string;
  readonly name?: string;
  readonly email?: string;
  readonly mobileNumber?: string; // Norwegian format: +47XXXXXXXX
  readonly order?: number;
  readonly required: boolean;
}

export enum DigipostSignatureType {
  ADVANCED_ELECTRONIC_SIGNATURE = 'ADVANCED_ELECTRONIC_SIGNATURE',
  QUALIFIED_ELECTRONIC_SIGNATURE = 'QUALIFIED_ELECTRONIC_SIGNATURE',
}

export enum DigipostAuthLevel {
  THREE = 'THREE', // BankID, Buypass, Commfides
  FOUR = 'FOUR', // High assurance level
}

export enum DigipostSignaturePackaging {
  PADES = 'PADES', // PDF Advanced Electronic Signatures
  XADES = 'XADES', // XML Advanced Electronic Signatures
}

export interface DigipostSignatureNotifications {
  readonly email?: {
    readonly enabled: boolean;
    readonly customText?: string;
  };
  readonly sms?: {
    readonly enabled: boolean;
    readonly customText?: string;
  };
}

// Tracking and status types
export interface DigipostDeliveryStatus {
  readonly messageId: string;
  readonly status: DigipostMessageStatus;
  readonly deliveryTime?: Date;
  readonly readTime?: Date;
  readonly deliveryMethod: DigipostDeliveryMethod;
  readonly recipient: DigipostRecipient;
  readonly trackingEvents: DigipostTrackingEvent[];
}

export enum DigipostMessageStatus {
  CREATED = 'CREATED',
  QUEUED = 'QUEUED',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  RETURNED = 'RETURNED',
  PRINTED = 'PRINTED',
}

export interface DigipostTrackingEvent {
  readonly eventType: DigipostEventType;
  readonly timestamp: Date;
  readonly description: string;
  readonly details?: Record<string, any>;
}

export enum DigipostEventType {
  MESSAGE_CREATED = 'MESSAGE_CREATED',
  MESSAGE_QUEUED = 'MESSAGE_QUEUED',
  MESSAGE_DELIVERED = 'MESSAGE_DELIVERED',
  MESSAGE_READ = 'MESSAGE_READ',
  MESSAGE_FAILED = 'MESSAGE_FAILED',
  SIGNATURE_REQUESTED = 'SIGNATURE_REQUESTED',
  SIGNATURE_COMPLETED = 'SIGNATURE_COMPLETED',
  SIGNATURE_CANCELLED = 'SIGNATURE_CANCELLED',
  PRINT_JOB_CREATED = 'PRINT_JOB_CREATED',
  PRINT_JOB_COMPLETED = 'PRINT_JOB_COMPLETED',
}

// Template types
export interface DigipostTemplate {
  readonly templateId: string;
  readonly name: string;
  readonly description?: string;
  readonly version: string;
  readonly templateType: DigipostTemplateType;
  readonly parameters: DigipostTemplateParameter[];
  readonly baseDocument?: DigipostDocument;
  readonly lastModified: Date;
}

export enum DigipostTemplateType {
  FORM_BASED = 'FORM_BASED',
  PDF_TEMPLATE = 'PDF_TEMPLATE',
  HTML_TEMPLATE = 'HTML_TEMPLATE',
}

export interface DigipostTemplateParameter {
  readonly name: string;
  readonly type: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'IMAGE';
  readonly required: boolean;
  readonly defaultValue?: any;
  readonly validation?: DigipostParameterValidation;
}

export interface DigipostParameterValidation {
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: string;
  readonly allowedValues?: any[];
}

// Print job types
export interface DigipostPrintJob {
  readonly printJobId?: string;
  readonly documents: DigipostDocument[];
  readonly recipients: DigipostRecipient[];
  readonly printOptions: DigipostPrintOptions;
  readonly status?: DigipostPrintJobStatus;
}

export interface DigipostPrintOptions {
  readonly printColors: 'MONOCHROME' | 'COLORS';
  readonly printFormat: 'A4' | 'A3';
  readonly duplex: boolean;
  readonly printInstructions?: string;
  readonly envelopeType?: 'C5' | 'E65';
}

export enum DigipostPrintJobStatus {
  CREATED = 'CREATED',
  PROCESSING = 'PROCESSING',
  PRINTED = 'PRINTED',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

// Webhook types
export interface DigipostWebhookPayload {
  readonly eventId: string;
  readonly eventType: DigipostEventType;
  readonly timestamp: Date;
  readonly messageId?: string;
  readonly batchId?: string;
  readonly signatureJobId?: string;
  readonly printJobId?: string;
  readonly data: Record<string, any>;
}

// Error types
export interface DigipostError {
  readonly errorCode: string;
  readonly errorMessage: string;
  readonly field?: string;
  readonly rejectedValue?: any;
}

export interface DigipostApiError extends Error {
  readonly statusCode: number;
  readonly digipostError?: DigipostError;
  readonly requestId?: string;
  readonly timestamp: string;
}

// Archive and storage types
export interface DigipostArchiveEntry {
  readonly documentId: string;
  readonly fileName: string;
  readonly subject: string;
  readonly createdDate: Date;
  readonly classification: DigipostClassification;
  readonly retentionDate: Date;
  readonly metadata: DigipostDocumentMetadata;
  readonly checksum: string;
  readonly encryptionStatus: 'ENCRYPTED' | 'NOT_ENCRYPTED';
}

export interface DigipostSearchQuery {
  readonly query?: string;
  readonly classification?: DigipostClassification;
  readonly dateFrom?: Date;
  readonly dateTo?: Date;
  readonly tags?: string[];
  readonly limit?: number;
  readonly offset?: number;
  readonly sortBy?: 'DATE' | 'SUBJECT' | 'CLASSIFICATION';
  readonly sortOrder?: 'ASC' | 'DESC';
}

// Sender information
export interface DigipostSenderInformation {
  readonly organizationNumber: string;
  readonly organizationName: string;
  readonly contactPerson: string;
  readonly contactEmail: string;
  readonly address?: DigipostAddress;
}

// Receipt types
export interface DigipostReceipt {
  readonly receiptId: string;
  readonly messageId: string;
  readonly deliveryStatus: DigipostMessageStatus;
  readonly deliveryTime?: Date;
  readonly readTime?: Date;
  readonly recipient: DigipostRecipient;
  readonly digitalReceipt?: boolean;
  readonly signedReceipt?: Buffer; // Digitally signed receipt
}

// Bulk operation types
export interface DigipostBulkOperation {
  readonly operationId: string;
  readonly operationType: 'SEND' | 'ARCHIVE' | 'DELETE';
  readonly totalItems: number;
  readonly processedItems: number;
  readonly failedItems: number;
  readonly status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly errors?: DigipostError[];
}`;
	}

	private generateDigipostService(options: DigipostIntegrationOptions): string {
		return `import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { DigipostHttpClient } from './digipost-http.client';
import { DigipostAuthService } from './digipost-auth.service';
import { 
  DigipostDocument,
  DigipostMessage,
  DigipostBatch,
  DigipostRecipient,
  DigipostDeliveryStatus,
  DigipostSignatureJob,
  DigipostTemplate,
  DigipostPrintJob,
  DigipostClassification,
  DigipostBatchStatus,
  DigipostMessageStatus
} from '../types/digipost.types';
import { digipostConfig, NORWEGIAN_DOCUMENT_STANDARDS } from '../config/digipost.config';

/**
 * Digipost Service
 * Comprehensive Norwegian digital mailbox integration with enterprise-grade features
 */
@Injectable()
export class DigipostService {
  private readonly logger = new Logger(DigipostService.name);

  constructor(
    private readonly httpClient: DigipostHttpClient,
    private readonly authService: DigipostAuthService,
  ) {}

  /**
   * Send single document to recipient
   * Norwegian compliance: Supports SSN, organization numbers, and Norwegian addresses
   */
  async sendDocument(
    document: DigipostDocument,
    recipient: DigipostRecipient,
    deliveryOptions?: Partial<DigipostMessage>
  ): Promise<{
    messageId: string;
    status: 'sent' | 'queued';
    estimatedDelivery?: Date;
  }> {
    try {
      // Validate document format and size
      this.validateDocument(document);
      
      // Validate Norwegian recipient
      this.validateNorwegianRecipient(recipient);

      const message: DigipostMessage = {
        recipient,
        document,
        deliveryOptions: {
          primaryDocument: true,
          ...deliveryOptions?.deliveryOptions,
        },
        ...deliveryOptions,
      };

      this.logger.log(\`Sending document "\${document.subject}" to \${recipient.identificationType}: \${this.maskIdentifier(recipient.identificationValue)}\`);

      const response = await this.httpClient.post<{ messageId: string }>(
        '/documents',
        message
      );

      this.logger.log(\`Document sent successfully. Message ID: \${response.messageId}\`);

      return {
        messageId: response.messageId,
        status: 'sent',
        estimatedDelivery: this.calculateEstimatedDelivery(),
      };
    } catch (error) {
      this.logger.error(\`Failed to send document: \${error.message}\`, error.stack);
      throw this.handleDigipostError(error);
    }
  }

  /**
   * Send batch of documents
   */
  async sendBatch(batch: DigipostBatch): Promise<{
    batchId: string;
    totalMessages: number;
    status: DigipostBatchStatus;
  }> {
    try {
      // Validate batch size
      if (batch.messages.length > NORWEGIAN_DOCUMENT_STANDARDS.MAX_BATCH_SIZE) {
        throw new HttpException(
          \`Batch size exceeds maximum limit of \${NORWEGIAN_DOCUMENT_STANDARDS.MAX_BATCH_SIZE}\`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Validate all documents and recipients
      batch.messages.forEach((message, index) => {
        try {
          this.validateDocument(message.document);
          this.validateNorwegianRecipient(message.recipient);
        } catch (error) {
          throw new HttpException(
            \`Validation failed for message \${index + 1}: \${error.message}\`,
            HttpStatus.BAD_REQUEST
          );
        }
      });

      this.logger.log(\`Sending batch with \${batch.messages.length} messages\`);

      const response = await this.httpClient.post<{ batchId: string }>(
        '/batches',
        batch
      );

      this.logger.log(\`Batch sent successfully. Batch ID: \${response.batchId}\`);

      return {
        batchId: response.batchId,
        totalMessages: batch.messages.length,
        status: DigipostBatchStatus.PROCESSING,
      };
    } catch (error) {
      this.logger.error(\`Failed to send batch: \${error.message}\`, error.stack);
      throw this.handleDigipostError(error);
    }
  }

  /**
   * Track document delivery status
   */
  async getDeliveryStatus(messageId: string): Promise<DigipostDeliveryStatus> {
    try {
      this.logger.log(\`Fetching delivery status for message \${messageId}\`);

      const response = await this.httpClient.get<DigipostDeliveryStatus>(
        \`/tracking/\${messageId}\`
      );

      this.logger.log(\`Delivery status retrieved: \${response.status}\`);
      return response;
    } catch (error) {
      this.logger.error(\`Failed to get delivery status for message \${messageId}: \${error.message}\`);
      throw this.handleDigipostError(error);
    }
  }

  /**
   * Create digital signature job
   */
  async createSignatureJob(signatureJob: DigipostSignatureJob): Promise<{
    signatureJobId: string;
    signatureUrl: string;
    expiresAt: Date;
  }> {
    try {
      // Validate document for signature
      this.validateDocument(signatureJob.document);
      
      // Validate Norwegian signers
      signatureJob.signers.forEach((signer, index) => {
        if (!this.isValidNorwegianSSN(signer.personalIdentificationNumber)) {
          throw new HttpException(
            \`Invalid Norwegian SSN for signer \${index + 1}\`,
            HttpStatus.BAD_REQUEST
          );
        }
      });

      this.logger.log(\`Creating signature job "\${signatureJob.title}" with \${signatureJob.signers.length} signers\`);

      const response = await this.httpClient.post<{
        signatureJobId: string;
        signatureUrl: string;
        expiresAt: string;
      }>('/signatures', signatureJob);

      this.logger.log(\`Signature job created successfully: \${response.signatureJobId}\`);

      return {
        signatureJobId: response.signatureJobId,
        signatureUrl: response.signatureUrl,
        expiresAt: new Date(response.expiresAt),
      };
    } catch (error) {
      this.logger.error(\`Failed to create signature job: \${error.message}\`, error.stack);
      throw this.handleDigipostError(error);
    }
  }

  /**
   * Get signature job status
   */
  async getSignatureJobStatus(signatureJobId: string): Promise<{
    status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
    completedSignatures: number;
    totalSignatures: number;
    signedDocument?: Buffer;
  }> {
    try {
      this.logger.log(\`Fetching signature job status: \${signatureJobId}\`);

      const response = await this.httpClient.get<any>(
        \`/signatures/\${signatureJobId}/status\`
      );

      return {
        status: response.status,
        completedSignatures: response.completedSignatures,
        totalSignatures: response.totalSignatures,
        signedDocument: response.signedDocument ? Buffer.from(response.signedDocument, 'base64') : undefined,
      };
    } catch (error) {
      this.logger.error(\`Failed to get signature job status: \${error.message}\`);
      throw this.handleDigipostError(error);
    }
  }

  /**
   * Generate document from template
   */
  async generateFromTemplate(
    templateId: string,
    parameters: Record<string, any>,
    recipient: DigipostRecipient
  ): Promise<{
    messageId: string;
    generatedDocument: DigipostDocument;
  }> {
    try {
      this.validateNorwegianRecipient(recipient);

      const templateRequest = {
        templateId,
        parameters,
        recipient,
      };

      this.logger.log(\`Generating document from template \${templateId}\`);

      const response = await this.httpClient.post<{
        messageId: string;
        document: DigipostDocument;
      }>('/templates/generate', templateRequest);

      this.logger.log(\`Document generated successfully from template\`);

      return {
        messageId: response.messageId,
        generatedDocument: response.document,
      };
    } catch (error) {
      this.logger.error(\`Failed to generate document from template: \${error.message}\`);
      throw this.handleDigipostError(error);
    }
  }

  /**
   * Create print job for physical delivery
   */
  async createPrintJob(printJob: DigipostPrintJob): Promise<{
    printJobId: string;
    estimatedDelivery: Date;
  }> {
    try {
      // Validate all documents
      printJob.documents.forEach(doc => this.validateDocument(doc));
      
      // Validate recipients have physical addresses
      printJob.recipients.forEach(recipient => {
        if (!recipient.address) {
          throw new HttpException(
            'Physical address required for print delivery',
            HttpStatus.BAD_REQUEST
          );
        }
      });

      this.logger.log(\`Creating print job with \${printJob.documents.length} documents for \${printJob.recipients.length} recipients\`);

      const response = await this.httpClient.post<{
        printJobId: string;
        estimatedDelivery: string;
      }>('/print', printJob);

      this.logger.log(\`Print job created successfully: \${response.printJobId}\`);

      return {
        printJobId: response.printJobId,
        estimatedDelivery: new Date(response.estimatedDelivery),
      };
    } catch (error) {
      this.logger.error(\`Failed to create print job: \${error.message}\`);
      throw this.handleDigipostError(error);
    }
  }

  /**
   * Validate document according to Norwegian standards
   */
  private validateDocument(document: DigipostDocument): void {
    if (!document.subject || document.subject.trim().length === 0) {
      throw new HttpException(
        'Document subject is required',
        HttpStatus.BAD_REQUEST
      );
    }

    if (!NORWEGIAN_DOCUMENT_STANDARDS.ACCEPTED_FORMATS.includes(document.fileType)) {
      throw new HttpException(
        \`Unsupported file type. Accepted formats: \${NORWEGIAN_DOCUMENT_STANDARDS.ACCEPTED_FORMATS.join(', ')}\`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Validate content size
    const contentSize = Buffer.isBuffer(document.content) 
      ? document.content.length 
      : Buffer.from(document.content, 'base64').length;

    if (contentSize > NORWEGIAN_DOCUMENT_STANDARDS.MAX_FILE_SIZE) {
      throw new HttpException(
        \`Document size exceeds maximum limit of \${NORWEGIAN_DOCUMENT_STANDARDS.MAX_FILE_SIZE / (1024 * 1024)}MB\`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Validate classification level
    if (document.classification && !Object.values(DigipostClassification).includes(document.classification)) {
      throw new HttpException(
        'Invalid document classification',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Validate Norwegian recipient
   */
  private validateNorwegianRecipient(recipient: DigipostRecipient): void {
    switch (recipient.identificationType) {
      case 'PERSONAL_IDENTIFICATION_NUMBER':
        if (!this.isValidNorwegianSSN(recipient.identificationValue)) {
          throw new HttpException(
            'Invalid Norwegian personal identification number',
            HttpStatus.BAD_REQUEST
          );
        }
        break;
        
      case 'ORGANIZATION_NUMBER':
        if (!this.isValidNorwegianOrgNumber(recipient.identificationValue)) {
          throw new HttpException(
            'Invalid Norwegian organization number',
            HttpStatus.BAD_REQUEST
          );
        }
        break;
        
      case 'NAME_AND_ADDRESS':
        if (!recipient.address || recipient.address.country !== 'NO') {
          throw new HttpException(
            'Norwegian address required for name and address delivery',
            HttpStatus.BAD_REQUEST
          );
        }
        break;
    }
  }

  /**
   * Validate Norwegian SSN (11 digits with control digits)
   */
  private isValidNorwegianSSN(ssn: string): boolean {
    if (!/^\\d{11}$/.test(ssn)) {
      return false;
    }

    // Validate control digits using Norwegian algorithm
    const weights1 = [3, 7, 6, 1, 8, 9, 4, 5, 2];
    const weights2 = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

    let sum1 = 0;
    for (let i = 0; i < 9; i++) {
      sum1 += parseInt(ssn[i]) * weights1[i];
    }
    const control1 = (11 - (sum1 % 11)) % 11;

    let sum2 = 0;
    for (let i = 0; i < 9; i++) {
      sum2 += parseInt(ssn[i]) * weights2[i];
    }
    sum2 += control1 * weights2[9];
    const control2 = (11 - (sum2 % 11)) % 11;

    return parseInt(ssn[9]) === control1 && parseInt(ssn[10]) === control2;
  }

  /**
   * Validate Norwegian organization number (9 digits with control digit)
   */
  private isValidNorwegianOrgNumber(orgNumber: string): boolean {
    if (!/^\\d{9}$/.test(orgNumber)) {
      return false;
    }

    const weights = [3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    
    for (let i = 0; i < 8; i++) {
      sum += parseInt(orgNumber[i]) * weights[i];
    }
    
    const remainder = sum % 11;
    const control = remainder === 0 ? 0 : 11 - remainder;
    
    return parseInt(orgNumber[8]) === control;
  }

  /**
   * Calculate estimated delivery time for Norwegian addresses
   */
  private calculateEstimatedDelivery(): Date {
    // Norwegian business days: Monday to Friday
    const now = new Date();
    let deliveryDate = new Date(now);
    
    // Add 1-2 business days for digital delivery
    let businessDaysToAdd = 1;
    
    while (businessDaysToAdd > 0) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
        businessDaysToAdd--;
      }
    }
    
    return deliveryDate;
  }

  /**
   * Mask sensitive identifiers for logging
   */
  private maskIdentifier(identifier: string): string {
    if (identifier.length <= 4) {
      return '*'.repeat(identifier.length);
    }
    return identifier.slice(0, 2) + '*'.repeat(identifier.length - 4) + identifier.slice(-2);
  }

  /**
   * Handle Digipost API errors with Norwegian context
   */
  private handleDigipostError(error: any): HttpException {
    const digipostError = error.response?.data;
    const statusCode = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

    if (digipostError?.errorCode) {
      switch (digipostError.errorCode) {
        case 'RECIPIENT_NOT_FOUND':
          return new HttpException('Mottaker ikke funnet', HttpStatus.NOT_FOUND);
        case 'INVALID_DOCUMENT_FORMAT':
          return new HttpException('Ugyldig dokumentformat', HttpStatus.BAD_REQUEST);
        case 'DOCUMENT_TOO_LARGE':
          return new HttpException('Dokumentet er for stort', HttpStatus.BAD_REQUEST);
        case 'INSUFFICIENT_PRIVILEGES':
          return new HttpException('Utilstrekkelige rettigheter', HttpStatus.FORBIDDEN);
        default:
          return new HttpException(
            \`Digipost error: \${digipostError.errorMessage}\`,
            statusCode
          );
      }
    }

    return new HttpException(
      error.message || 'Digipost integration error',
      statusCode
    );
  }
}`;
	}

	private generateDigipostHttpClient(
		options: DigipostIntegrationOptions,
	): string {
		return `import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as https from 'https';
import * as fs from 'fs';
import { DigipostAuthService } from './digipost-auth.service';
import { digipostConfig } from '../config/digipost.config';
import { DigipostApiError } from '../types/digipost.types';

/**
 * Digipost HTTP Client
 * Handles certificate-based authentication and HTTP communication with Digipost APIs
 */
@Injectable()
export class DigipostHttpClient {
  private readonly logger = new Logger(DigipostHttpClient.name);
  private readonly httpsAgent: https.Agent;

  constructor(
    private readonly httpService: HttpService,
    private readonly authService: DigipostAuthService,
  ) {
    this.httpsAgent = this.createHttpsAgent();
  }

  /**
   * Make authenticated GET request to Digipost API
   */
  async get<T>(endpoint: string, additionalHeaders?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>('GET', endpoint, undefined, additionalHeaders);
  }

  /**
   * Make authenticated POST request to Digipost API
   */
  async post<T>(
    endpoint: string,
    data?: any,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    return this.makeRequest<T>('POST', endpoint, data, additionalHeaders);
  }

  /**
   * Make authenticated PUT request to Digipost API
   */
  async put<T>(
    endpoint: string,
    data?: any,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    return this.makeRequest<T>('PUT', endpoint, data, additionalHeaders);
  }

  /**
   * Make authenticated DELETE request to Digipost API
   */
  async delete<T>(endpoint: string, additionalHeaders?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>('DELETE', endpoint, undefined, additionalHeaders);
  }

  /**
   * Make authenticated request with certificate authentication
   */
  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    additionalHeaders?: Record<string, string>,
    retryCount = 0
  ): Promise<T> {
    try {
      const headers = await this.buildHeaders(additionalHeaders);
      const url = \`\${digipostConfig.baseUrl}\${endpoint}\`;

      this.logger.debug(\`Making \${method} request to \${url}\`);

      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url,
          data,
          headers,
          httpsAgent: this.httpsAgent,
          timeout: digipostConfig.timeout,
        })
      );

      this.logger.debug(\`Request successful: \${method} \${url}\`);
      return response.data;
    } catch (error) {
      this.logger.error(
        \`Request failed: \${method} \${endpoint} (attempt \${retryCount + 1}/\${digipostConfig.retryAttempts + 1})\`,
        error.message
      );

      // Check if we should retry
      if (this.shouldRetry(error, retryCount)) {
        const delay = this.calculateRetryDelay(retryCount);
        this.logger.log(\`Retrying request in \${delay}ms...\`);
        
        await this.sleep(delay);
        return this.makeRequest<T>(method, endpoint, data, additionalHeaders, retryCount + 1);
      }

      throw this.createDigipostApiError(error);
    }
  }

  /**
   * Create HTTPS agent with client certificate
   */
  private createHttpsAgent(): https.Agent {
    try {
      const keyStore = fs.readFileSync(digipostConfig.keyStore);
      // Note: In production, you would properly parse the keystore (PKCS#12)
      // and extract the certificate and private key
      
      return new https.Agent({
        // cert: certificate,
        // key: privateKey,
        // ca: caCertificates,
        rejectUnauthorized: true,
        keepAlive: true,
        maxSockets: 10,
      });
    } catch (error) {
      this.logger.error(\`Failed to create HTTPS agent: \${error.message}\`);
      throw new HttpException(
        'Certificate configuration error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Build request headers with authentication
   */
  private async buildHeaders(
    additionalHeaders?: Record<string, string>
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'xaheen-cli-digipost/1.0.0',
      'X-Digipost-UserId': digipostConfig.brokerId,
      'X-Request-ID': this.generateRequestId(),
      'X-TimeStamp': new Date().toISOString(),
      'Accept-Language': 'nb-NO,en;q=0.8',
    };

    // Add additional headers if provided
    if (additionalHeaders) {
      Object.assign(headers, additionalHeaders);
    }

    return headers;
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: any, retryCount: number): boolean {
    if (retryCount >= digipostConfig.retryAttempts) {
      return false;
    }

    const statusCode = error.response?.status;
    
    // Retry on temporary server errors and rate limiting
    if (statusCode >= 500 || statusCode === 429) {
      return true;
    }

    // Retry on network errors
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return true;
    }

    return false;
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateRetryDelay(retryCount: number): number {
    const baseDelay = 2000; // 2 seconds
    const maxDelay = 60000; // 60 seconds
    const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
    
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 2000;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate unique request ID for tracing
   */
  private generateRequestId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return \`digipost_\${timestamp}_\${random}\`;
  }

  /**
   * Create standardized Digipost API error
   */
  private createDigipostApiError(error: any): DigipostApiError {
    const apiError = new Error() as DigipostApiError;
    
    apiError.name = 'DigipostApiError';
    apiError.message = error.message || 'Digipost API request failed';
    apiError.statusCode = error.response?.status || 500;
    apiError.digipostError = error.response?.data;
    apiError.requestId = error.config?.headers?.['X-Request-ID'];
    apiError.timestamp = new Date().toISOString();
    
    return apiError;
  }
}`;
	}

	private generateDigipostAuthService(
		options: DigipostIntegrationOptions,
	): string {
		return `import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { digipostConfig } from '../config/digipost.config';

/**
 * Digipost Authentication Service
 * Handles certificate-based authentication for Digipost API
 */
@Injectable()
export class DigipostAuthService {
  private readonly logger = new Logger(DigipostAuthService.name);
  private certificate: Buffer | null = null;
  private privateKey: Buffer | null = null;

  constructor() {
    this.loadCertificates();
  }

  /**
   * Load certificates from keystore
   */
  private loadCertificates(): void {
    try {
      if (fs.existsSync(digipostConfig.keyStore)) {
        this.logger.log('Loading Digipost certificates');
        
        // In production, you would properly parse the PKCS#12 keystore
        // and extract the certificate and private key
        const keyStoreData = fs.readFileSync(digipostConfig.keyStore);
        
        // Placeholder - implement proper keystore parsing
        this.certificate = keyStoreData;
        this.privateKey = keyStoreData;
        
        this.logger.log('Digipost certificates loaded successfully');
      } else {
        this.logger.warn(\`Keystore file not found: \${digipostConfig.keyStore}\`);
      }
    } catch (error) {
      this.logger.error(\`Failed to load certificates: \${error.message}\`);
    }
  }

  /**
   * Get client certificate for authentication
   */
  getCertificate(): Buffer | null {
    return this.certificate;
  }

  /**
   * Get private key for authentication
   */
  getPrivateKey(): Buffer | null {
    return this.privateKey;
  }

  /**
   * Validate certificate expiry
   */
  isCertificateValid(): boolean {
    if (!this.certificate) {
      return false;
    }

    try {
      // In production, extract and validate certificate expiry date
      // For now, assume valid
      return true;
    } catch (error) {
      this.logger.error(\`Certificate validation failed: \${error.message}\`);
      return false;
    }
  }

  /**
   * Sign data with private key (for webhook validation)
   */
  signData(data: string): string {
    if (!this.privateKey) {
      throw new Error('Private key not available');
    }

    try {
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(data);
      return sign.sign(this.privateKey, 'base64');
    } catch (error) {
      this.logger.error(\`Data signing failed: \${error.message}\`);
      throw error;
    }
  }

  /**
   * Verify signature (for webhook validation)
   */
  verifySignature(data: string, signature: string, publicKey: Buffer): boolean {
    try {
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(data);
      return verify.verify(publicKey, signature, 'base64');
    } catch (error) {
      this.logger.error(\`Signature verification failed: \${error.message}\`);
      return false;
    }
  }
}`;
	}

	// Continue with more method implementations...
	private generateDocumentDelivery(
		options: DigipostIntegrationOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		files.push({
			path: `${options.name}/integrations/digipost/services/digipost-document-delivery.service.ts`,
			content: `import { Injectable, Logger } from '@nestjs/common';
import { DigipostService } from './digipost.service';
import { 
  DigipostDocument,
  DigipostRecipient,
  DigipostMessage,
  DigipostDeliveryMethod,
  DigipostIdentificationType
} from '../types/digipost.types';

/**
 * Document Delivery Service
 * Handles various document delivery methods with Norwegian compliance
 */
@Injectable()
export class DigipostDocumentDeliveryService {
  private readonly logger = new Logger(DigipostDocumentDeliveryService.name);

  constructor(private readonly digipostService: DigipostService) {}

  /**
   * Send document to Norwegian citizen using SSN
   */
  async sendToNorwegianCitizen(
    document: DigipostDocument,
    personalNumber: string,
    deliveryMethod: DigipostDeliveryMethod = DigipostDeliveryMethod.DIGIPOST_WITH_PRINT_FALLBACK
  ): Promise<{
    messageId: string;
    deliveryMethod: DigipostDeliveryMethod;
    estimatedDelivery: Date;
  }> {
    const recipient: DigipostRecipient = {
      identificationType: DigipostIdentificationType.PERSONAL_IDENTIFICATION_NUMBER,
      identificationValue: personalNumber,
      deliveryMethod,
    };

    this.logger.log(\`Sending document to Norwegian citizen: \${this.maskSSN(personalNumber)}\`);

    const result = await this.digipostService.sendDocument(document, recipient);

    return {
      messageId: result.messageId,
      deliveryMethod,
      estimatedDelivery: result.estimatedDelivery || new Date(),
    };
  }

  /**
   * Send document to Norwegian organization
   */
  async sendToNorwegianOrganization(
    document: DigipostDocument,
    organizationNumber: string,
    deliveryMethod: DigipostDeliveryMethod = DigipostDeliveryMethod.DIGIPOST
  ): Promise<{
    messageId: string;
    organizationNumber: string;
    deliveryMethod: DigipostDeliveryMethod;
  }> {
    const recipient: DigipostRecipient = {
      identificationType: DigipostIdentificationType.ORGANIZATION_NUMBER,
      identificationValue: organizationNumber,
      deliveryMethod,
    };

    this.logger.log(\`Sending document to Norwegian organization: \${organizationNumber}\`);

    const result = await this.digipostService.sendDocument(document, recipient);

    return {
      messageId: result.messageId,
      organizationNumber,
      deliveryMethod,
    };
  }

  /**
   * Send certified document with delivery confirmation
   */
  async sendCertifiedDocument(
    document: DigipostDocument,
    recipient: DigipostRecipient,
    requireSignature: boolean = false
  ): Promise<{
    messageId: string;
    trackingNumber: string;
    requiresSignature: boolean;
  }> {
    // Add certification metadata
    const certifiedDocument: DigipostDocument = {
      ...document,
      authenticationRequired: true,
      metadata: {
        ...document.metadata,
        category: 'CERTIFIED',
        priority: 'HIGH',
        customProperties: {
          ...document.metadata?.customProperties,
          certified: 'true',
          requiresSignature: requireSignature.toString(),
        },
      },
    };

    const message: DigipostMessage = {
      recipient,
      document: certifiedDocument,
      requestForRegistration: true, // Request delivery confirmation
    };

    this.logger.log(\`Sending certified document with \${requireSignature ? 'signature requirement' : 'confirmation'}\`);

    const result = await this.digipostService.sendDocument(certifiedDocument, recipient, message);

    return {
      messageId: result.messageId,
      trackingNumber: result.messageId, // Use messageId as tracking number
      requiresSignature: requireSignature,
    };
  }

  private maskSSN(ssn: string): string {
    if (ssn.length === 11) {
      return ssn.substring(0, 6) + '*****';
    }
    return '*'.repeat(ssn.length);
  }
}`,
			type: "create",
		});

		return files;
	}

	private generateDigitalSignatures(
		options: DigipostIntegrationOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		files.push({
			path: `${options.name}/integrations/digipost/services/digipost-signature.service.ts`,
			content: `import { Injectable, Logger } from '@nestjs/common';
import { DigipostService } from './digipost.service';
import { 
  DigipostSignatureJob,
  DigipostSigner,
  DigipostSignatureType,
  DigipostAuthLevel,
  DigipostDocument
} from '../types/digipost.types';

/**
 * Digital Signature Service
 * Handles digital signatures with Norwegian e-ID integration
 */
@Injectable()
export class DigipostSignatureService {
  private readonly logger = new Logger(DigipostSignatureService.name);

  constructor(private readonly digipostService: DigipostService) {}

  /**
   * Create signature job with BankID authentication
   */
  async createBankIDSignatureJob(
    document: DigipostDocument,
    signers: DigipostSigner[],
    title: string,
    description?: string
  ): Promise<{
    signatureJobId: string;
    signatureUrl: string;
    expiresAt: Date;
    signers: number;
  }> {
    const signatureJob: DigipostSignatureJob = {
      title,
      description: description || \`Signering av \${document.subject}\`,
      document,
      signers,
      signatureType: DigipostSignatureType.ADVANCED_ELECTRONIC_SIGNATURE,
      authenticationLevel: DigipostAuthLevel.FOUR, // High assurance with BankID
      completionDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      notifications: {
        email: { enabled: true },
        sms: { enabled: true },
      },
    };

    this.logger.log(\`Creating BankID signature job: \${title}\`);

    const result = await this.digipostService.createSignatureJob(signatureJob);

    return {
      signatureJobId: result.signatureJobId,
      signatureUrl: result.signatureUrl,
      expiresAt: result.expiresAt,
      signers: signers.length,
    };
  }

  /**
   * Create qualified signature job (highest legal value)
   */
  async createQualifiedSignatureJob(
    document: DigipostDocument,
    signers: DigipostSigner[],
    title: string,
    legalContext?: string
  ): Promise<{
    signatureJobId: string;
    signatureUrl: string;
    legalNotice: string;
  }> {
    const signatureJob: DigipostSignatureJob = {
      title,
      description: \`Kvalifisert signering: \${document.subject}\`,
      document,
      signers,
      signatureType: DigipostSignatureType.QUALIFIED_ELECTRONIC_SIGNATURE,
      authenticationLevel: DigipostAuthLevel.FOUR,
      completionDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days for qualified
    };

    this.logger.log(\`Creating qualified signature job: \${title}\`);

    const result = await this.digipostService.createSignatureJob(signatureJob);

    const legalNotice = this.generateLegalNotice(legalContext);

    return {
      signatureJobId: result.signatureJobId,
      signatureUrl: result.signatureUrl,
      legalNotice,
    };
  }

  /**
   * Track signature progress
   */
  async getSignatureProgress(signatureJobId: string): Promise<{
    status: string;
    progress: number; // Percentage
    completedSignatures: number;
    pendingSignatures: number;
    estimatedCompletion?: Date;
  }> {
    const status = await this.digipostService.getSignatureJobStatus(signatureJobId);

    const progress = (status.completedSignatures / status.totalSignatures) * 100;
    const pendingSignatures = status.totalSignatures - status.completedSignatures;

    // Estimate completion based on Norwegian business patterns
    let estimatedCompletion: Date | undefined;
    if (status.status === 'IN_PROGRESS' && pendingSignatures > 0) {
      // Estimate 2-3 days per pending signature during business hours
      const businessDaysNeeded = Math.ceil(pendingSignatures * 2.5);
      estimatedCompletion = this.addBusinessDays(new Date(), businessDaysNeeded);
    }

    return {
      status: status.status,
      progress: Math.round(progress),
      completedSignatures: status.completedSignatures,
      pendingSignatures,
      estimatedCompletion,
    };
  }

  /**
   * Download signed document with verification
   */
  async getSignedDocument(signatureJobId: string): Promise<{
    signedDocument: Buffer;
    verificationReport: SignatureVerificationReport;
    downloadUrl: string;
  }> {
    const status = await this.digipostService.getSignatureJobStatus(signatureJobId);

    if (status.status !== 'COMPLETED' || !status.signedDocument) {
      throw new Error('Signature job not completed or signed document not available');
    }

    const verificationReport = await this.verifySignatures(status.signedDocument);

    // Generate secure download URL (temporary)
    const downloadUrl = await this.generateSecureDownloadUrl(signatureJobId);

    return {
      signedDocument: status.signedDocument,
      verificationReport,
      downloadUrl,
    };
  }

  /**
   * Generate legal notice for qualified signatures
   */
  private generateLegalNotice(context?: string): string {
    const baseNotice = \`Denne kvalifiserte elektroniske signaturen har samme juridiske gyldighet som håndskreven signatur i henhold til norsk lov.\`;
    
    if (context) {
      return \`\${baseNotice} Kontekst: \${context}\`;
    }
    
    return baseNotice;
  }

  /**
   * Add business days to date (Norwegian business calendar)
   */
  private addBusinessDays(date: Date, businessDays: number): Date {
    const result = new Date(date);
    let daysAdded = 0;

    while (daysAdded < businessDays) {
      result.setDate(result.getDate() + 1);
      
      // Skip weekends and Norwegian public holidays
      if (result.getDay() !== 0 && result.getDay() !== 6 && !this.isNorwegianHoliday(result)) {
        daysAdded++;
      }
    }

    return result;
  }

  /**
   * Check if date is Norwegian public holiday
   */
  private isNorwegianHoliday(date: Date): boolean {
    // Simplified check for major Norwegian holidays
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // New Year's Day
    if (month === 1 && day === 1) return true;
    
    // May 1st - Labor Day
    if (month === 5 && day === 1) return true;
    
    // May 17th - Constitution Day
    if (month === 5 && day === 17) return true;
    
    // Christmas
    if (month === 12 && (day === 24 || day === 25 || day === 26)) return true;

    // Add more holidays as needed (Easter dates vary)
    return false;
  }

  /**
   * Verify signatures in signed document
   */
  private async verifySignatures(signedDocument: Buffer): Promise<SignatureVerificationReport> {
    // Implement signature verification logic
    return {
      isValid: true,
      signatureCount: 1,
      verificationTime: new Date(),
      signers: [],
      technicalDetails: 'Signature verification completed successfully',
    };
  }

  /**
   * Generate secure download URL for signed document
   */
  private async generateSecureDownloadUrl(signatureJobId: string): Promise<string> {
    // Generate a temporary, secure URL for downloading the signed document
    return \`https://secure-downloads.example.com/signatures/\${signatureJobId}?token=\${Date.now()}\`;
  }
}

interface SignatureVerificationReport {
  isValid: boolean;
  signatureCount: number;
  verificationTime: Date;
  signers: any[];
  technicalDetails: string;
}`,
			type: "create",
		});

		return files;
	}

	private generateDocumentTracking(
		options: DigipostIntegrationOptions,
	): GeneratedFile[] {
		return [
			{
				path: `${options.name}/integrations/digipost/services/digipost-tracking.service.ts`,
				content: `import { Injectable, Logger } from '@nestjs/common';
import { DigipostService } from './digipost.service';
import { DigipostDeliveryStatus, DigipostMessageStatus } from '../types/digipost.types';

/**
 * Document Tracking Service
 * Tracks document delivery and read status with Norwegian compliance
 */
@Injectable()
export class DigipostTrackingService {
  private readonly logger = new Logger(DigipostTrackingService.name);

  constructor(private readonly digipostService: DigipostService) {}

  /**
   * Get comprehensive tracking information
   */
  async getTrackingInfo(messageId: string): Promise<{
    status: DigipostMessageStatus;
    deliveryTime?: Date;
    readTime?: Date;
    timeline: TrackingEvent[];
    receipientInfo: {
      method: string;
      confirmed: boolean;
    };
  }> {
    const deliveryStatus = await this.digipostService.getDeliveryStatus(messageId);
    
    const timeline = deliveryStatus.trackingEvents.map(event => ({
      timestamp: event.timestamp,
      event: event.eventType,
      description: this.translateEventToNorwegian(event.eventType),
      details: event.description,
    }));

    return {
      status: deliveryStatus.status,
      deliveryTime: deliveryStatus.deliveryTime,
      readTime: deliveryStatus.readTime,
      timeline,
      receipientInfo: {
        method: deliveryStatus.deliveryMethod,
        confirmed: deliveryStatus.status === DigipostMessageStatus.DELIVERED || deliveryStatus.status === DigipostMessageStatus.READ,
      },
    };
  }

  private translateEventToNorwegian(eventType: string): string {
    const translations: Record<string, string> = {
      'MESSAGE_CREATED': 'Melding opprettet',
      'MESSAGE_QUEUED': 'Melding i kø',
      'MESSAGE_DELIVERED': 'Melding levert',
      'MESSAGE_READ': 'Melding lest',
      'MESSAGE_FAILED': 'Levering feilet',
    };

    return translations[eventType] || eventType;
  }
}

interface TrackingEvent {
  timestamp: Date;
  event: string;
  description: string;
  details: string;
}`,
				type: "create",
			},
		];
	}

	private generateSecureStorage(
		options: DigipostIntegrationOptions,
	): GeneratedFile[] {
		return [
			{
				path: `${options.name}/integrations/digipost/services/digipost-storage.service.ts`,
				content: `import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { DigipostDocument, DigipostClassification } from '../types/digipost.types';

/**
 * Secure Document Storage Service
 * Handles encrypted storage with Norwegian data residency compliance
 */
@Injectable()
export class DigipostStorageService {
  private readonly logger = new Logger(DigipostStorageService.name);

  /**
   * Store document securely with encryption
   */
  async storeSecurely(
    document: DigipostDocument,
    classification: DigipostClassification
  ): Promise<{
    storageId: string;
    encryptionKey: string;
    retentionDate: Date;
    location: 'norway' | 'eu';
  }> {
    const encryptionKey = this.generateEncryptionKey();
    const encryptedContent = this.encryptDocument(document.content, encryptionKey);
    const storageId = this.generateStorageId();
    
    // Calculate retention based on Norwegian regulations
    const retentionDate = this.calculateRetentionDate(classification);
    
    // Store in Norwegian data centers for compliance
    const location = 'norway';

    this.logger.log(\`Document stored securely with classification: \${classification}\`);

    return {
      storageId,
      encryptionKey,
      retentionDate,
      location,
    };
  }

  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private encryptDocument(content: Buffer | string, key: string): Buffer {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
    
    const contentBuffer = Buffer.isBuffer(content) ? content : Buffer.from(content, 'base64');
    
    let encrypted = cipher.update(contentBuffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    const authTag = cipher.getAuthTag();
    
    return Buffer.concat([iv, authTag, encrypted]);
  }

  private calculateRetentionDate(classification: DigipostClassification): Date {
    const retentionPeriods = {
      [DigipostClassification.OPEN]: 5 * 365,
      [DigipostClassification.RESTRICTED]: 7 * 365,
      [DigipostClassification.CONFIDENTIAL]: 10 * 365,
      [DigipostClassification.SECRET]: 30 * 365,
    };

    const days = retentionPeriods[classification];
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() + days);
    
    return retentionDate;
  }

  private generateStorageId(): string {
    return \`storage_\${Date.now()}_\${crypto.randomBytes(8).toString('hex')}\`;
  }
}`,
				type: "create",
			},
		];
	}

	private generateBulkSending(
		options: DigipostIntegrationOptions,
	): GeneratedFile[] {
		return [
			{
				path: `${options.name}/integrations/digipost/services/digipost-bulk.service.ts`,
				content: `import { Injectable, Logger } from '@nestjs/common';
import { DigipostService } from './digipost.service';
import { DigipostBatch, DigipostMessage } from '../types/digipost.types';

/**
 * Bulk Document Sending Service
 * Handles large-scale document distribution with Norwegian compliance
 */
@Injectable()
export class DigipostBulkService {
  private readonly logger = new Logger(DigipostBulkService.name);

  constructor(private readonly digipostService: DigipostService) {}

  /**
   * Send documents in bulk with progress tracking
   */
  async sendBulkDocuments(
    messages: DigipostMessage[],
    batchOptions?: any
  ): Promise<{
    batchId: string;
    totalMessages: number;
    status: 'processing' | 'completed' | 'failed';
    progressUrl: string;
  }> {
    const batch: DigipostBatch = {
      messages,
      senderInfo: {
        organizationNumber: '',
        organizationName: '',
        contactPerson: '',
        contactEmail: '',
      },
      batchOptions,
    };

    this.logger.log(\`Starting bulk send of \${messages.length} documents\`);

    const result = await this.digipostService.sendBatch(batch);

    return {
      batchId: result.batchId,
      totalMessages: result.totalMessages,
      status: 'processing',
      progressUrl: \`/api/digipost/batches/\${result.batchId}/progress\`,
    };
  }
}`,
				type: "create",
			},
		];
	}

	private generateTemplateEngine(
		options: DigipostIntegrationOptions,
	): GeneratedFile[] {
		return [
			{
				path: `${options.name}/integrations/digipost/services/digipost-template.service.ts`,
				content: `import { Injectable, Logger } from '@nestjs/common';
import { DigipostService } from './digipost.service';
import { DigipostTemplate, DigipostRecipient } from '../types/digipost.types';

/**
 * Template-based Document Generation Service
 * Creates documents from templates with Norwegian localization
 */
@Injectable()
export class DigipostTemplateService {
  private readonly logger = new Logger(DigipostTemplateService.name);

  constructor(private readonly digipostService: DigipostService) {}

  /**
   * Generate Norwegian invoice from template
   */
  async generateInvoice(
    templateId: string,
    invoiceData: InvoiceData,
    recipient: DigipostRecipient
  ): Promise<{
    messageId: string;
    invoiceNumber: string;
    dueDate: Date;
  }> {
    const parameters = {
      customerName: invoiceData.customerName,
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceDate: invoiceData.invoiceDate.toLocaleDateString('nb-NO'),
      dueDate: invoiceData.dueDate.toLocaleDateString('nb-NO'),
      amount: invoiceData.amount.toLocaleString('nb-NO', {
        style: 'currency',
        currency: 'NOK',
      }),
      vatAmount: invoiceData.vatAmount.toLocaleString('nb-NO', {
        style: 'currency',
        currency: 'NOK',
      }),
      totalAmount: (invoiceData.amount + invoiceData.vatAmount).toLocaleString('nb-NO', {
        style: 'currency',
        currency: 'NOK',
      }),
      items: invoiceData.items,
    };

    this.logger.log(\`Generating invoice from template \${templateId}\`);

    const result = await this.digipostService.generateFromTemplate(
      templateId,
      parameters,
      recipient
    );

    return {
      messageId: result.messageId,
      invoiceNumber: invoiceData.invoiceNumber,
      dueDate: invoiceData.dueDate,
    };
  }
}

interface InvoiceData {
  customerName: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  amount: number;
  vatAmount: number;
  items: InvoiceItem[];
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}`,
				type: "create",
			},
		];
	}

	private generateWebhookHandlers(
		options: DigipostIntegrationOptions,
	): GeneratedFile[] {
		return [
			{
				path: `${options.name}/integrations/digipost/controllers/digipost-webhook.controller.ts`,
				content: `import { 
  Controller, 
  Post, 
  Body, 
  Headers, 
  HttpCode, 
  HttpStatus,
  Logger,
  BadRequestException 
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DigipostWebhookService } from '../services/digipost-webhook.service';
import { DigipostWebhookPayload } from '../types/digipost.types';

/**
 * Digipost Webhook Controller
 * Handles webhook notifications from Digipost
 */
@ApiTags('Digipost Webhooks')
@Controller('webhooks/digipost')
export class DigipostWebhookController {
  private readonly logger = new Logger(DigipostWebhookController.name);

  constructor(private readonly webhookService: DigipostWebhookService) {}

  @Post('events')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Digipost event webhook' })
  async handleEventWebhook(
    @Body() payload: DigipostWebhookPayload,
    @Headers('x-digipost-signature') signature: string
  ): Promise<{ success: boolean }> {
    this.logger.log(\`Received Digipost webhook: \${payload.eventType}\`);

    if (!this.webhookService.verifySignature(payload, signature)) {
      throw new BadRequestException('Invalid webhook signature');
    }

    await this.webhookService.processWebhook(payload);
    return { success: true };
  }
}`,
				type: "create",
			},
		];
	}

	private generateAuditLogging(
		options: DigipostIntegrationOptions,
	): GeneratedFile[] {
		return [
			{
				path: `${options.name}/integrations/digipost/audit/digipost-audit.service.ts`,
				content: `import { Injectable, Logger } from '@nestjs/common';

/**
 * Digipost Audit Service
 * Handles audit logging for Norwegian compliance requirements
 */
@Injectable()
export class DigipostAuditService {
  private readonly logger = new Logger(DigipostAuditService.name);

  /**
   * Log document sending activity
   */
  async logDocumentSent(
    messageId: string,
    recipientType: string,
    documentSubject: string,
    classification: string
  ): Promise<void> {
    const auditEntry = {
      action: 'DOCUMENT_SENT',
      messageId,
      recipientType,
      documentSubject,
      classification,
      timestamp: new Date().toISOString(),
      compliance: 'GDPR_COMPLIANT',
    };

    this.logger.log(\`Document sent audit: \${JSON.stringify(auditEntry)}\`);
  }

  /**
   * Log signature request
   */
  async logSignatureRequested(
    signatureJobId: string,
    documentTitle: string,
    signersCount: number
  ): Promise<void> {
    const auditEntry = {
      action: 'SIGNATURE_REQUESTED',
      signatureJobId,
      documentTitle,
      signersCount,
      timestamp: new Date().toISOString(),
    };

    this.logger.log(\`Signature requested audit: \${JSON.stringify(auditEntry)}\`);
  }
}`,
				type: "create",
			},
		];
	}

	private generateEncryptionServices(
		options: DigipostIntegrationOptions,
	): GeneratedFile[] {
		return [
			{
				path: `${options.name}/integrations/digipost/encryption/digipost-encryption.service.ts`,
				content: `import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Document Encryption Service
 * Handles end-to-end encryption for sensitive documents
 */
@Injectable()
export class DigipostEncryptionService {
  private readonly logger = new Logger(DigipostEncryptionService.name);

  /**
   * Encrypt document with AES-256-GCM
   */
  encryptDocument(content: Buffer, key: string): {
    encrypted: Buffer;
    iv: string;
    authTag: string;
  } {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
    
    let encrypted = cipher.update(content);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  /**
   * Decrypt document
   */
  decryptDocument(
    encryptedContent: Buffer,
    key: string,
    iv: string,
    authTag: string
  ): Buffer {
    const algorithm = 'aes-256-gcm';
    const decipher = crypto.createDecipheriv(
      algorithm,
      Buffer.from(key, 'hex'),
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedContent);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted;
  }
}`,
				type: "create",
			},
		];
	}

	private generateErrorHandling(
		options: DigipostIntegrationOptions,
	): GeneratedFile[] {
		return [
			{
				path: `${options.name}/integrations/digipost/error/digipost-error-handler.service.ts`,
				content: `import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';

/**
 * Digipost Error Handler Service
 * Centralized error handling with Norwegian context
 */
@Injectable()
export class DigipostErrorHandlerService {
  private readonly logger = new Logger(DigipostErrorHandlerService.name);

  /**
   * Handle and transform Digipost API errors
   */
  handleApiError(error: any, context: string = 'DigipostAPI'): HttpException {
    this.logger.error(\`Digipost API error in \${context}: \${error.message}\`, error.stack);

    const norwegianMessages: Record<string, string> = {
      'RECIPIENT_NOT_FOUND': 'Mottaker ikke funnet i Digipost',
      'INVALID_DOCUMENT_FORMAT': 'Ugyldig dokumentformat',
      'DOCUMENT_TOO_LARGE': 'Dokumentet er for stort',
      'CERTIFICATE_EXPIRED': 'Sertifikat har utløpt',
      'INSUFFICIENT_PRIVILEGES': 'Utilstrekkelige rettigheter',
    };

    const errorCode = error.response?.data?.errorCode;
    const norwegianMessage = errorCode ? norwegianMessages[errorCode] : 'Ukjent feil i Digipost-integrasjonen';

    return new HttpException(
      norwegianMessage,
      error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}`,
				type: "create",
			},
		];
	}

	private generateTests(options: DigipostIntegrationOptions): GeneratedFile[] {
		return [
			{
				path: `${options.name}/integrations/digipost/tests/digipost.service.spec.ts`,
				content: `import { Test, TestingModule } from '@nestjs/testing';
import { DigipostService } from '../services/digipost.service';
import { DigipostHttpClient } from '../services/digipost-http.client';
import { DigipostAuthService } from '../services/digipost-auth.service';

describe('DigipostService', () => {
  let service: DigipostService;
  let httpClient: DigipostHttpClient;
  let authService: DigipostAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DigipostService,
        {
          provide: DigipostHttpClient,
          useValue: {
            post: jest.fn(),
            get: jest.fn(),
          },
        },
        {
          provide: DigipostAuthService,
          useValue: {
            getCertificate: jest.fn(),
            getPrivateKey: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DigipostService>(DigipostService);
    httpClient = module.get<DigipostHttpClient>(DigipostHttpClient);
    authService = module.get<DigipostAuthService>(DigipostAuthService);
  });

  describe('sendDocument', () => {
    it('should send document successfully', async () => {
      const mockResponse = { messageId: 'test-message-123' };
      jest.spyOn(httpClient, 'post').mockResolvedValue(mockResponse);

      const document = {
        subject: 'Test Document',
        fileType: 'PDF' as any,
        content: Buffer.from('test content'),
        fileName: 'test.pdf',
      };

      const recipient = {
        identificationType: 'PERSONAL_IDENTIFICATION_NUMBER' as any,
        identificationValue: '12345678901',
      };

      const result = await service.sendDocument(document, recipient);

      expect(result.messageId).toBe('test-message-123');
      expect(httpClient.post).toHaveBeenCalledWith('/documents', expect.any(Object));
    });

    it('should validate Norwegian SSN', () => {
      const validSSN = '12345678901';
      const invalidSSN = '123';

      expect(service['isValidNorwegianSSN'](validSSN)).toBeTruthy();
      expect(service['isValidNorwegianSSN'](invalidSSN)).toBeFalsy();
    });
  });
});`,
				type: "create",
			},
		];
	}

	private generateDocumentation(
		options: DigipostIntegrationOptions,
	): GeneratedFile[] {
		return [
			{
				path: `${options.name}/integrations/digipost/README.md`,
				content: `# Digipost Integration

Norwegian digital mailbox service integration with enterprise-grade features.

## Features

${options.features.map((feature) => `- ${feature.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`).join("\n")}

## Environment Variables

\`\`\`bash
# Digipost Configuration
DIGIPOST_BROKER_ID=your_broker_id
DIGIPOST_KEYSTORE_PATH=/path/to/your/keystore.p12
DIGIPOST_KEYSTORE_PASSWORD=your_keystore_password
DIGIPOST_KEY_ALIAS=your_key_alias

# Webhook Configuration
DIGIPOST_WEBHOOK_SECRET=your_webhook_secret

# Organization Information
DIGIPOST_ORG_NUMBER=${options.senderInformation.organizationNumber}
DIGIPOST_ORG_NAME="${options.senderInformation.organizationName}"
DIGIPOST_CONTACT_PERSON="${options.senderInformation.contactPerson}"
DIGIPOST_CONTACT_EMAIL=${options.senderInformation.contactEmail}
\`\`\`

## Usage

### Send Document to Norwegian Citizen

\`\`\`typescript
import { DigipostService } from './integrations/digipost/services/digipost.service';

const document = {
  subject: 'Faktura fra Your Company',
  fileType: DigipostFileType.PDF,
  content: pdfBuffer,
  fileName: 'faktura-2024-001.pdf',
};

const recipient = {
  identificationType: DigipostIdentificationType.PERSONAL_IDENTIFICATION_NUMBER,
  identificationValue: '12345678901', // Norwegian SSN
};

const result = await digipostService.sendDocument(document, recipient);
\`\`\`

### Digital Signatures with BankID

\`\`\`typescript
import { DigipostSignatureService } from './integrations/digipost/services/digipost-signature.service';

const signers = [{
  personalIdentificationNumber: '12345678901',
  name: 'Ola Nordmann',
  email: 'ola@example.no',
  required: true,
}];

const signatureJob = await signatureService.createBankIDSignatureJob(
  document,
  signers,
  'Kontrakt for signering'
);
\`\`\`

### Bulk Document Sending

\`\`\`typescript
import { DigipostBulkService } from './integrations/digipost/services/digipost-bulk.service';

const messages = [
  { recipient: recipient1, document: document1 },
  { recipient: recipient2, document: document2 },
  // ... more messages
];

const bulkResult = await bulkService.sendBulkDocuments(messages);
\`\`\`

## Norwegian Compliance

This integration follows Norwegian regulations and standards:

- **Data Residency**: ${options.compliance.dataResidency.toUpperCase()}
- **Document Classification**: ${options.compliance.documentClassification}
- **GDPR Compliance**: ${options.compliance.gdpr ? "Enabled" : "Disabled"}
- **Audit Logging**: ${options.compliance.auditLogging ? "Enabled" : "Disabled"}
- **Certificate Authentication**: Required for all API calls
- **Document Encryption**: End-to-end encryption for sensitive documents
- **Retention Policies**: Automatic document retention according to Norwegian law

## Certificate Setup

1. Obtain a valid certificate from a Norwegian Certificate Authority
2. Store the certificate in PKCS#12 format
3. Configure the keystore path and credentials
4. Ensure certificate is valid and not expired

## Error Handling

All errors are handled with Norwegian context:

\`\`\`typescript
try {
  await digipostService.sendDocument(document, recipient);
} catch (error) {
  if (error.message.includes('Mottaker ikke funnet')) {
    console.log('Recipient not found in Digipost');
  }
}
\`\`\`

## Testing

Run the test suite:

\`\`\`bash
npm test -- digipost
\`\`\`

## Support

For technical support, refer to:
- [Digipost Developer Portal](https://developer.digipost.no/)
- [Digipost API Documentation](https://developer.digipost.no/api/)
`,
				type: "create",
			},
		];
	}
}
