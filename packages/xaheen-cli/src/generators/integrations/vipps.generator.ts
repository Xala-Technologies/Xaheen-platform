/**
 * Vipps Payment Integration Generator
 * Generates comprehensive Vipps payment integration with Norwegian compliance
 */

import type { GeneratedFile } from "../../types/index.js";

export interface VippsIntegrationOptions {
	name: string;
	environment: "test" | "production";
	features: VippsFeature[];
	authentication: {
		merchantSerialNumber: string;
		clientId: string;
		clientSecret: string;
		subscriptionKey: string;
	};
	compliance: {
		gdpr: boolean;
		pciDss: boolean;
		auditLogging: boolean;
		dataResidency: "norway" | "eu";
	};
	webhookUrl?: string;
	callbackPrefix?: string;
	fallbackUrl?: string;
}

export type VippsFeature =
	| "one-time-payment"
	| "express-checkout"
	| "recurring-payment"
	| "subscription"
	| "refunds"
	| "partial-refunds"
	| "capture-later"
	| "mobile-payments"
	| "qr-payments"
	| "invoice-payments"
	| "installments"
	| "loyalty-points"
	| "payment-reconciliation";

export class VippsIntegrationGenerator {
	async generate(options: VippsIntegrationOptions): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];

		// Core Vipps service files
		files.push(...this.generateCoreServices(options));

		// Payment flow implementations
		if (options.features.includes("one-time-payment")) {
			files.push(...this.generateOneTimePayment(options));
		}

		if (options.features.includes("express-checkout")) {
			files.push(...this.generateExpressCheckout(options));
		}

		if (
			options.features.includes("recurring-payment") ||
			options.features.includes("subscription")
		) {
			files.push(...this.generateRecurringPayments(options));
		}

		if (
			options.features.includes("refunds") ||
			options.features.includes("partial-refunds")
		) {
			files.push(...this.generateRefundServices(options));
		}

		if (options.features.includes("payment-reconciliation")) {
			files.push(...this.generateReconciliationServices(options));
		}

		// Webhook handlers
		files.push(...this.generateWebhookHandlers(options));

		// Compliance and security
		if (options.compliance.pciDss) {
			files.push(...this.generatePCICompliance(options));
		}

		if (options.compliance.auditLogging) {
			files.push(...this.generateAuditLogging(options));
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
		options: VippsIntegrationOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		// Configuration
		files.push({
			path: `${options.name}/integrations/vipps/config/vipps.config.ts`,
			content: this.generateVippsConfig(options),
			type: "create",
		});

		// Types and interfaces
		files.push({
			path: `${options.name}/integrations/vipps/types/vipps.types.ts`,
			content: this.generateVippsTypes(options),
			type: "create",
		});

		// Main service
		files.push({
			path: `${options.name}/integrations/vipps/services/vipps.service.ts`,
			content: this.generateVippsService(options),
			type: "create",
		});

		// HTTP client
		files.push({
			path: `${options.name}/integrations/vipps/services/vipps-http.client.ts`,
			content: this.generateVippsHttpClient(options),
			type: "create",
		});

		// Token management
		files.push({
			path: `${options.name}/integrations/vipps/services/vipps-token.service.ts`,
			content: this.generateVippsTokenService(options),
			type: "create",
		});

		return files;
	}

	private generateVippsConfig(options: VippsIntegrationOptions): string {
		const baseUrl =
			options.environment === "production"
				? "https://api.vipps.no"
				: "https://apitest.vipps.no";

		return `/**
 * Vipps Configuration
 * Norway's leading mobile payment solution - Enterprise grade configuration
 */

export interface VippsConfig {
  readonly baseUrl: string;
  readonly merchantSerialNumber: string;
  readonly subscriptionKey: string;
  readonly clientId: string;
  readonly clientSecret: string;
  readonly callbackPrefix: string;
  readonly fallbackUrl: string;
  readonly webhookUrl: string;
  readonly environment: 'test' | 'production';
  readonly timeout: number;
  readonly retryAttempts: number;
  readonly features: readonly string[];
}

export const vippsConfig: VippsConfig = {
  baseUrl: '${baseUrl}',
  merchantSerialNumber: process.env.VIPPS_MSN || '${options.authentication.merchantSerialNumber}',
  subscriptionKey: process.env.VIPPS_SUBSCRIPTION_KEY || '${options.authentication.subscriptionKey}',
  clientId: process.env.VIPPS_CLIENT_ID || '${options.authentication.clientId}',
  clientSecret: process.env.VIPPS_CLIENT_SECRET || '',
  callbackPrefix: process.env.VIPPS_CALLBACK_PREFIX || '${options.callbackPrefix || "https://localhost:3000/vipps"}',
  fallbackUrl: process.env.VIPPS_FALLBACK_URL || '${options.fallbackUrl || "https://localhost:3000/payment/result"}',
  webhookUrl: process.env.VIPPS_WEBHOOK_URL || '${options.webhookUrl || "https://localhost:3000/webhooks/vipps"}',
  environment: '${options.environment}',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  features: ${JSON.stringify(options.features)},
} as const;

// Vipps API endpoints
export const VIPPS_ENDPOINTS = {
  ACCESS_TOKEN: '/accesstoken/get',
  PAYMENTS: '/ecomm/v2/payments',
  PAYMENT_DETAILS: '/ecomm/v2/payments/{orderId}/details',
  CAPTURE: '/ecomm/v2/payments/{orderId}/capture',
  CANCEL: '/ecomm/v2/payments/{orderId}/cancel',
  REFUND: '/ecomm/v2/payments/{orderId}/refund',
  EXPRESS_CHECKOUT: '/ecomm/v1/payments/{orderId}/shippingDetails',
  RECURRING_AGREEMENTS: '/recurring/v2/agreements',
  RECURRING_CHARGES: '/recurring/v2/agreements/{agreementId}/charges',
  QR_CODES: '/qr/v1/merchant-redirect',
} as const;

// Norwegian compliance settings
export const NORWEGIAN_COMPLIANCE = {
  CURRENCY: 'NOK',
  PHONE_PREFIX: '+47',
  MIN_AMOUNT: 100, // 1 NOK in øre
  MAX_AMOUNT: 100000000, // 1,000,000 NOK in øre
  LANGUAGE: 'nb-NO',
  TIMEZONE: 'Europe/Oslo',
  DATA_RESIDENCY: '${options.compliance.dataResidency}',
} as const;

// Security settings
export const SECURITY_CONFIG = {
  WEBHOOK_SECRET: process.env.VIPPS_WEBHOOK_SECRET || '',
  ENCRYPTION_KEY: process.env.VIPPS_ENCRYPTION_KEY || '',
  TOKEN_EXPIRY_BUFFER: 300, // 5 minutes buffer before token expires
  MAX_REQUEST_SIZE: '10mb',
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // requests per window
  },
} as const;`;
	}

	private generateVippsTypes(options: VippsIntegrationOptions): string {
		return `/**
 * Vipps TypeScript Types and Interfaces
 * Comprehensive type definitions for Norwegian Vipps integration
 */

// Core Vipps types
export interface VippsPaymentRequest {
  readonly merchantInfo: VippsMerchantInfo;
  readonly customerInfo: VippsCustomerInfo;
  readonly transaction: VippsTransaction;
  readonly options?: VippsPaymentOptions;
}

export interface VippsMerchantInfo {
  readonly merchantSerialNumber: string;
  readonly callbackPrefix: string;
  readonly fallBack: string;
  readonly authToken?: string;
  readonly consentRemovalPrefix?: string;
  readonly shippingDetailsPrefix?: string;
  readonly paymentType?: VippsPaymentType;
  readonly staticShippingDetails?: VippsShippingDetails[];
  readonly isApp?: boolean;
}

export interface VippsCustomerInfo {
  readonly mobileNumber: string;
}

export interface VippsTransaction {
  readonly orderId: string;
  readonly amount: number; // Amount in øre (Norwegian currency subdivision)
  readonly transactionText: string;
  readonly timeStamp?: string;
  readonly skipLandingPage?: boolean;
  readonly scope?: string;
  readonly refOrderId?: string;
  readonly useExplicitCheckoutFlow?: boolean;
}

export interface VippsPaymentOptions {
  readonly skipLandingPage?: boolean;
  readonly scope?: string;
  readonly refOrderId?: string;
  readonly useExplicitCheckoutFlow?: boolean;
}

export type VippsPaymentType = 
  | 'eComm Regular Payment'
  | 'eComm Express Payment'
  | 'Recurring Payment'
  | 'QR Payment';

// Payment response types
export interface VippsPaymentResponse {
  readonly orderId: string;
  readonly url: string;
  readonly expiresAt?: string;
  readonly token?: string;
}

export interface VippsPaymentDetails {
  readonly orderId: string;
  readonly transactionSummary: VippsTransactionSummary;
  readonly transactionLogHistory: VippsTransactionLogEntry[];
  readonly shippingDetails?: VippsShippingDetails;
  readonly userDetails?: VippsUserDetails;
}

export interface VippsTransactionSummary {
  readonly capturedAmount: number;
  readonly remainingAmountToCapture: number;
  readonly refundedAmount: number;
  readonly remainingAmountToRefund: number;
  readonly bankIdentificationNumber?: string;
}

export interface VippsTransactionLogEntry {
  readonly amount: number;
  readonly transactionText: string;
  readonly transactionId: string;
  readonly timeStamp: string;
  readonly operation: VippsTransactionOperation;
  readonly requestId?: string;
  readonly operationSuccess: boolean;
}

export enum VippsTransactionOperation {
  INITIATE = 'INITIATE',
  REGISTER = 'REGISTER',
  RESERVE = 'RESERVE',
  CAPTURE = 'CAPTURE',
  SALE = 'SALE',
  CANCEL = 'CANCEL',
  REFUND = 'REFUND',
  VOID = 'VOID',
}

export enum VippsTransactionStatus {
  INITIATED = 'INITIATED',
  REGISTERED = 'REGISTERED',
  RESERVED = 'RESERVED',
  CAPTURED = 'CAPTURED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

// Shipping and user details
export interface VippsShippingDetails {
  readonly address: VippsAddress;
  readonly shippingCost: number;
  readonly shippingMethod: string;
  readonly shippingMethodId: string;
}

export interface VippsAddress {
  readonly addressLine1: string;
  readonly addressLine2?: string;
  readonly city: string;
  readonly country: 'NO'; // Norway only for Vipps
  readonly postalCode: string;
}

export interface VippsUserDetails {
  readonly bankIdVerified?: string;
  readonly dateOfBirth?: string;
  readonly email?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly mobileNumber?: string;
  readonly ssn?: string; // Norwegian Social Security Number
  readonly userId?: string;
}

// Recurring payment types
export interface VippsRecurringAgreement {
  readonly currency: 'NOK';
  readonly customerPhoneNumber: string;
  readonly interval: VippsRecurringInterval;
  readonly intervalCount: number;
  readonly isApp: boolean;
  readonly merchantRedirectUrl: string;
  readonly merchantAgreementUrl: string;
  readonly price: number; // Amount in øre
  readonly productDescription: string;
  readonly productName: string;
  readonly status?: VippsAgreementStatus;
  readonly start?: string;
  readonly stop?: string;
}

export enum VippsRecurringInterval {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum VippsAgreementStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  STOPPED = 'STOPPED',
  EXPIRED = 'EXPIRED',
}

export interface VippsRecurringCharge {
  readonly amount: number; // Amount in øre
  readonly currency: 'NOK';
  readonly description: string;
  readonly due: string; // ISO 8601 date
  readonly retryDays: number;
  readonly orderId?: string;
  readonly status?: VippsChargeStatus;
}

export enum VippsChargeStatus {
  PENDING = 'PENDING',
  DUE = 'DUE',
  RESERVED = 'RESERVED',
  CAPTURED = 'CAPTURED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  FAILED = 'FAILED',
}

// Webhook types
export interface VippsWebhookPayload {
  readonly merchantSerialNumber: string;
  readonly orderId: string;
  readonly transactionInfo: VippsWebhookTransactionInfo;
  readonly shippingDetails?: VippsShippingDetails;
  readonly userDetails?: VippsUserDetails;
  readonly eventType: VippsWebhookEventType;
  readonly timestamp: string;
}

export interface VippsWebhookTransactionInfo {
  readonly amount: number;
  readonly status: VippsTransactionStatus;
  readonly transactionId: string;
  readonly timeStamp: string;
}

export enum VippsWebhookEventType {
  PAYMENT_UPDATE = 'payment.update',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_CANCELLED = 'payment.cancelled',
  PAYMENT_EXPIRED = 'payment.expired',
  PAYMENT_REFUNDED = 'payment.refunded',
  SHIPPING_DETAILS_PROVIDED = 'shipping.details.provided',
  USER_DETAILS_PROVIDED = 'user.details.provided',
  RECURRING_CHARGE_COMPLETED = 'recurring.charge.completed',
  RECURRING_CHARGE_FAILED = 'recurring.charge.failed',
  RECURRING_AGREEMENT_STOPPED = 'recurring.agreement.stopped',
}

// Error types
export interface VippsError {
  readonly errorCode: string;
  readonly errorMessage: string;
  readonly contextId?: string;
  readonly errorGroup?: string;
}

export interface VippsApiError extends Error {
  readonly statusCode: number;
  readonly vippsError?: VippsError;
  readonly requestId?: string;
  readonly timestamp: string;
}

// Authentication types
export interface VippsTokenResponse {
  readonly access_token: string;
  readonly token_type: 'Bearer';
  readonly expires_in: number;
  readonly scope: string;
}

// Reconciliation types
export interface VippsReconciliationReport {
  readonly reportId: string;
  readonly merchantSerialNumber: string;
  readonly reportDate: string;
  readonly reportType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  readonly totalTransactions: number;
  readonly totalAmount: number;
  readonly totalFees: number;
  readonly netAmount: number;
  readonly transactions: VippsReconciliationTransaction[];
}

export interface VippsReconciliationTransaction {
  readonly orderId: string;
  readonly transactionId: string;
  readonly amount: number;
  readonly fee: number;
  readonly netAmount: number;
  readonly timestamp: string;
  readonly status: VippsTransactionStatus;
  readonly operation: VippsTransactionOperation;
}

// QR Code types
export interface VippsQRCodeRequest {
  readonly merchantInfo: VippsMerchantInfo;
  readonly redirectUrl: string;
  readonly qrId?: string;
  readonly ttl?: number; // Time to live in seconds
}

export interface VippsQRCodeResponse {
  readonly qrId: string;
  readonly qrText: string;
  readonly qrImageUrl: string;
  readonly deepLinkUrl: string;
  readonly expiresAt: string;
}

// Express checkout types
export interface VippsExpressCheckoutSession {
  readonly sessionId: string;
  readonly merchantSerialNumber: string;
  readonly amount: number;
  readonly currency: 'NOK';
  readonly customerInfo: VippsCustomerInfo;
  readonly merchantInfo: VippsMerchantInfo;
  readonly transaction: VippsTransaction;
  readonly paymentType: 'eComm Express Payment';
  readonly status: 'CREATED' | 'INITIATED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  readonly createdAt: string;
  readonly expiresAt: string;
}

// Installment types (for future use)
export interface VippsInstallmentPlan {
  readonly numberOfInstallments: number;
  readonly totalAmount: number;
  readonly installmentAmount: number;
  readonly firstInstallmentDate: string;
  readonly frequency: VippsRecurringInterval;
  readonly interestRate?: number;
  readonly fees?: number;
}

// Loyalty and points types (for future use)
export interface VippsLoyaltyPoints {
  readonly pointsEarned: number;
  readonly pointsRedeemed: number;
  readonly pointsBalance: number;
  readonly pointsValue: number; // Value in øre
  readonly loyaltyProgramId: string;
}`;
	}

	private generateVippsService(options: VippsIntegrationOptions): string {
		return `import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { VippsHttpClient } from './vipps-http.client';
import { VippsTokenService } from './vipps-token.service';
import { 
  VippsPaymentRequest,
  VippsPaymentResponse,
  VippsPaymentDetails,
  VippsTransactionOperation,
  VippsTransactionStatus,
  VippsRecurringAgreement,
  VippsRecurringCharge,
  VippsQRCodeRequest,
  VippsQRCodeResponse,
  VippsExpressCheckoutSession,
  VippsReconciliationReport
} from '../types/vipps.types';
import { vippsConfig, NORWEGIAN_COMPLIANCE } from '../config/vipps.config';

/**
 * Vipps Payment Service
 * Comprehensive Norwegian payment integration with enterprise-grade features
 */
@Injectable()
export class VippsService {
  private readonly logger = new Logger(VippsService.name);

  constructor(
    private readonly httpClient: VippsHttpClient,
    private readonly tokenService: VippsTokenService,
  ) {}

  /**
   * Initiate a one-time payment
   * Norwegian compliance: Amounts in øre, phone number validation, transaction text in Norwegian
   */
  async initiatePayment(
    amount: number,
    mobileNumber: string,
    transactionText: string,
    orderId?: string,
    options?: Partial<VippsPaymentRequest>
  ): Promise<VippsPaymentResponse> {
    try {
      // Validate Norwegian requirements
      this.validateAmount(amount);
      const formattedPhone = this.formatNorwegianPhoneNumber(mobileNumber);
      const validatedOrderId = orderId || this.generateOrderId();

      const paymentRequest: VippsPaymentRequest = {
        merchantInfo: {
          merchantSerialNumber: vippsConfig.merchantSerialNumber,
          callbackPrefix: vippsConfig.callbackPrefix,
          fallBack: vippsConfig.fallbackUrl,
          paymentType: 'eComm Regular Payment',
          ...options?.merchantInfo,
        },
        customerInfo: {
          mobileNumber: formattedPhone,
          ...options?.customerInfo,
        },
        transaction: {
          orderId: validatedOrderId,
          amount: this.convertToOre(amount),
          transactionText: this.validateTransactionText(transactionText),
          timeStamp: new Date().toISOString(),
          ...options?.transaction,
        },
        options: options?.options,
      };

      this.logger.log(\`Initiating payment for order \${validatedOrderId}, amount: \${amount} NOK\`);

      const response = await this.httpClient.post<VippsPaymentResponse>(
        '/ecomm/v2/payments',
        paymentRequest
      );

      this.logger.log(\`Payment initiated successfully for order \${validatedOrderId}\`);
      
      return {
        orderId: validatedOrderId,
        url: response.url,
        expiresAt: response.expiresAt,
        token: response.token,
      };
    } catch (error) {
      this.logger.error(\`Payment initiation failed: \${error.message}\`, error.stack);
      throw this.handleVippsError(error);
    }
  }

  /**
   * Capture payment (settle the transaction)
   */
  async capturePayment(
    orderId: string,
    amount?: number,
    transactionText?: string
  ): Promise<void> {
    try {
      const captureRequest = {
        merchantInfo: {
          merchantSerialNumber: vippsConfig.merchantSerialNumber,
        },
        transaction: {
          amount: amount ? this.convertToOre(amount) : undefined,
          transactionText: transactionText || \`Capture for order \${orderId}\`,
        },
      };

      this.logger.log(\`Capturing payment for order \${orderId}\${amount ? \`, amount: \${amount} NOK\` : ' (full amount)'}\`);

      await this.httpClient.post(
        \`/ecomm/v2/payments/\${orderId}/capture\`,
        captureRequest
      );

      this.logger.log(\`Payment captured successfully for order \${orderId}\`);
    } catch (error) {
      this.logger.error(\`Payment capture failed for order \${orderId}: \${error.message}\`, error.stack);
      throw this.handleVippsError(error);
    }
  }

  /**
   * Cancel payment (void before capture)
   */
  async cancelPayment(orderId: string, transactionText?: string): Promise<void> {
    try {
      const cancelRequest = {
        merchantInfo: {
          merchantSerialNumber: vippsConfig.merchantSerialNumber,
        },
        transaction: {
          transactionText: transactionText || \`Cancelled order \${orderId}\`,
        },
      };

      this.logger.log(\`Cancelling payment for order \${orderId}\`);

      await this.httpClient.put(
        \`/ecomm/v2/payments/\${orderId}/cancel\`,
        cancelRequest
      );

      this.logger.log(\`Payment cancelled successfully for order \${orderId}\`);
    } catch (error) {
      this.logger.error(\`Payment cancellation failed for order \${orderId}: \${error.message}\`, error.stack);
      throw this.handleVippsError(error);
    }
  }

  /**
   * Refund payment (after capture)
   */
  async refundPayment(
    orderId: string,
    amount: number,
    transactionText: string
  ): Promise<void> {
    try {
      this.validateAmount(amount);

      const refundRequest = {
        merchantInfo: {
          merchantSerialNumber: vippsConfig.merchantSerialNumber,
        },
        transaction: {
          amount: this.convertToOre(amount),
          transactionText: this.validateTransactionText(transactionText),
        },
      };

      this.logger.log(\`Refunding payment for order \${orderId}, amount: \${amount} NOK\`);

      await this.httpClient.post(
        \`/ecomm/v2/payments/\${orderId}/refund\`,
        refundRequest,
        {
          'X-Request-Id': uuidv4(),
        }
      );

      this.logger.log(\`Payment refunded successfully for order \${orderId}\`);
    } catch (error) {
      this.logger.error(\`Payment refund failed for order \${orderId}: \${error.message}\`, error.stack);
      throw this.handleVippsError(error);
    }
  }

  /**
   * Get payment details and transaction history
   */
  async getPaymentDetails(orderId: string): Promise<VippsPaymentDetails> {
    try {
      this.logger.log(\`Fetching payment details for order \${orderId}\`);

      const response = await this.httpClient.get<VippsPaymentDetails>(
        \`/ecomm/v2/payments/\${orderId}/details\`
      );

      this.logger.log(\`Payment details retrieved successfully for order \${orderId}\`);
      return response;
    } catch (error) {
      this.logger.error(\`Failed to get payment details for order \${orderId}: \${error.message}\`, error.stack);
      throw this.handleVippsError(error);
    }
  }

  /**
   * Create recurring payment agreement
   */
  async createRecurringAgreement(
    agreement: Omit<VippsRecurringAgreement, 'currency'>
  ): Promise<{ agreementId: string; agreementUrl: string }> {
    try {
      const agreementRequest: VippsRecurringAgreement = {
        ...agreement,
        currency: 'NOK', // Always NOK for Norwegian payments
        price: this.convertToOre(agreement.price),
        customerPhoneNumber: this.formatNorwegianPhoneNumber(agreement.customerPhoneNumber),
      };

      this.logger.log(\`Creating recurring agreement for \${agreement.productName}\`);

      const response = await this.httpClient.post<{ agreementId: string; agreementUrl: string }>(
        '/recurring/v2/agreements',
        agreementRequest
      );

      this.logger.log(\`Recurring agreement created successfully: \${response.agreementId}\`);
      return response;
    } catch (error) {
      this.logger.error(\`Failed to create recurring agreement: \${error.message}\`, error.stack);
      throw this.handleVippsError(error);
    }
  }

  /**
   * Charge recurring payment
   */
  async chargeRecurringPayment(
    agreementId: string,
    charge: Omit<VippsRecurringCharge, 'currency'>
  ): Promise<{ chargeId: string }> {
    try {
      const chargeRequest: VippsRecurringCharge = {
        ...charge,
        currency: 'NOK',
        amount: this.convertToOre(charge.amount),
      };

      this.logger.log(\`Charging recurring payment for agreement \${agreementId}, amount: \${charge.amount} NOK\`);

      const response = await this.httpClient.post<{ chargeId: string }>(
        \`/recurring/v2/agreements/\${agreementId}/charges\`,
        chargeRequest
      );

      this.logger.log(\`Recurring payment charged successfully: \${response.chargeId}\`);
      return response;
    } catch (error) {
      this.logger.error(\`Failed to charge recurring payment for agreement \${agreementId}: \${error.message}\`, error.stack);
      throw this.handleVippsError(error);
    }
  }

  /**
   * Generate QR code for payment
   */
  async generateQRCode(qrRequest: VippsQRCodeRequest): Promise<VippsQRCodeResponse> {
    try {
      this.logger.log(\`Generating QR code for merchant redirect\`);

      const response = await this.httpClient.post<VippsQRCodeResponse>(
        '/qr/v1/merchant-redirect',
        qrRequest
      );

      this.logger.log(\`QR code generated successfully: \${response.qrId}\`);
      return response;
    } catch (error) {
      this.logger.error(\`Failed to generate QR code: \${error.message}\`, error.stack);
      throw this.handleVippsError(error);
    }
  }

  /**
   * Norwegian phone number validation and formatting
   */
  private formatNorwegianPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/[^\\d]/g, '');
    
    // Handle different Norwegian phone number formats
    if (cleaned.startsWith('47') && cleaned.length === 10) {
      // Already has country code without +
      return \`+\${cleaned}\`;
    } else if (cleaned.startsWith('004747')) {
      // Double country code
      return \`+\${cleaned.substring(2)}\`;
    } else if (cleaned.startsWith('0047')) {
      // International prefix
      return \`+\${cleaned.substring(2)}\`;
    } else if (cleaned.length === 8) {
      // Local Norwegian number
      return \`+47\${cleaned}\`;
    } else if (cleaned.startsWith('4') && cleaned.length === 9) {
      // Missing one digit from country code
      return \`+47\${cleaned.substring(1)}\`;
    }
    
    // If it's already in the correct format or unrecognized format
    if (phoneNumber.startsWith('+47') && phoneNumber.length === 11) {
      return phoneNumber;
    }
    
    throw new HttpException(
      \`Invalid Norwegian phone number format: \${phoneNumber}. Must be a valid Norwegian mobile number.\`,
      HttpStatus.BAD_REQUEST
    );
  }

  /**
   * Validate amount according to Norwegian regulations
   */
  private validateAmount(amount: number): void {
    if (!Number.isInteger(amount) || amount < 0) {
      throw new HttpException(
        'Amount must be a positive integer representing NOK',
        HttpStatus.BAD_REQUEST
      );
    }

    const amountInOre = this.convertToOre(amount);
    
    if (amountInOre < NORWEGIAN_COMPLIANCE.MIN_AMOUNT) {
      throw new HttpException(
        \`Amount too small. Minimum amount is \${NORWEGIAN_COMPLIANCE.MIN_AMOUNT / 100} NOK\`,
        HttpStatus.BAD_REQUEST
      );
    }

    if (amountInOre > NORWEGIAN_COMPLIANCE.MAX_AMOUNT) {
      throw new HttpException(
        \`Amount too large. Maximum amount is \${NORWEGIAN_COMPLIANCE.MAX_AMOUNT / 100} NOK\`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Convert NOK to øre (Norwegian currency subdivision)
   */
  private convertToOre(nokAmount: number): number {
    return Math.round(nokAmount * 100);
  }

  /**
   * Validate transaction text for Norwegian compliance
   */
  private validateTransactionText(text: string): string {
    if (!text || text.trim().length === 0) {
      throw new HttpException(
        'Transaction text is required',
        HttpStatus.BAD_REQUEST
      );
    }

    const trimmed = text.trim();
    
    if (trimmed.length > 100) {
      throw new HttpException(
        'Transaction text cannot exceed 100 characters',
        HttpStatus.BAD_REQUEST
      );
    }

    // Ensure Norwegian characters are handled properly
    return trimmed;
  }

  /**
   * Generate unique order ID with Norwegian format
   */
  private generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return \`NO-\${timestamp}-\${random}\`;
  }

  /**
   * Handle Vipps API errors with Norwegian context
   */
  private handleVippsError(error: any): HttpException {
    const vippsError = error.response?.data;
    const statusCode = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

    if (vippsError?.errorCode) {
      switch (vippsError.errorCode) {
        case 'payment.not.found':
          return new HttpException('Payment not found', HttpStatus.NOT_FOUND);
        case 'invalid.request':
          return new HttpException(
            \`Invalid request: \${vippsError.errorMessage}\`,
            HttpStatus.BAD_REQUEST
          );
        case 'unauthorized':
          return new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        case 'insufficient.funds':
          return new HttpException('Insufficient funds', HttpStatus.PAYMENT_REQUIRED);
        case 'payment.expired':
          return new HttpException('Payment has expired', HttpStatus.GONE);
        case 'merchant.not.allowed.for.ecomm':
          return new HttpException(
            'Merchant not allowed for eCommerce payments',
            HttpStatus.FORBIDDEN
          );
        default:
          return new HttpException(
            \`Vipps error: \${vippsError.errorMessage}\`,
            statusCode
          );
      }
    }

    return new HttpException(
      error.message || 'Vipps integration error',
      statusCode
    );
  }
}`;
	}

	private generateVippsHttpClient(options: VippsIntegrationOptions): string {
		return `import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { VippsTokenService } from './vipps-token.service';
import { vippsConfig, SECURITY_CONFIG } from '../config/vipps.config';
import { VippsApiError } from '../types/vipps.types';

/**
 * Vipps HTTP Client
 * Handles all HTTP communication with Vipps APIs including authentication,
 * error handling, retry logic, and Norwegian compliance
 */
@Injectable()
export class VippsHttpClient {
  private readonly logger = new Logger(VippsHttpClient.name);
  private readonly maxRetries = vippsConfig.retryAttempts;

  constructor(
    private readonly httpService: HttpService,
    private readonly tokenService: VippsTokenService,
  ) {}

  /**
   * Make authenticated GET request to Vipps API
   */
  async get<T>(endpoint: string, additionalHeaders?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>('GET', endpoint, undefined, additionalHeaders);
  }

  /**
   * Make authenticated POST request to Vipps API
   */
  async post<T>(
    endpoint: string,
    data?: any,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    return this.makeRequest<T>('POST', endpoint, data, additionalHeaders);
  }

  /**
   * Make authenticated PUT request to Vipps API
   */
  async put<T>(
    endpoint: string,
    data?: any,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    return this.makeRequest<T>('PUT', endpoint, data, additionalHeaders);
  }

  /**
   * Make authenticated DELETE request to Vipps API
   */
  async delete<T>(endpoint: string, additionalHeaders?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>('DELETE', endpoint, undefined, additionalHeaders);
  }

  /**
   * Make authenticated request with retry logic
   */
  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    additionalHeaders?: Record<string, string>,
    retryCount = 0
  ): Promise<T> {
    try {
      const accessToken = await this.tokenService.getValidAccessToken();
      const headers = await this.buildHeaders(accessToken, additionalHeaders);
      const url = \`\${vippsConfig.baseUrl}\${endpoint}\`;

      this.logger.debug(\`Making \${method} request to \${url}\`);

      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url,
          data,
          headers,
          timeout: vippsConfig.timeout,
        })
      );

      this.logger.debug(\`Request successful: \${method} \${url}\`);
      return response.data;
    } catch (error) {
      this.logger.error(
        \`Request failed: \${method} \${endpoint} (attempt \${retryCount + 1}/\${this.maxRetries + 1})\`,
        error.message
      );

      // Check if we should retry
      if (this.shouldRetry(error, retryCount)) {
        const delay = this.calculateRetryDelay(retryCount);
        this.logger.log(\`Retrying request in \${delay}ms...\`);
        
        await this.sleep(delay);
        return this.makeRequest<T>(method, endpoint, data, additionalHeaders, retryCount + 1);
      }

      throw this.createVippsApiError(error);
    }
  }

  /**
   * Build request headers with authentication and compliance requirements
   */
  private async buildHeaders(
    accessToken: string,
    additionalHeaders?: Record<string, string>
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Authorization': \`Bearer \${accessToken}\`,
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': vippsConfig.subscriptionKey,
      'Merchant-Serial-Number': vippsConfig.merchantSerialNumber,
      'Vipps-System-Name': 'xaheen-cli',
      'Vipps-System-Version': '1.0.0',
      'X-Request-ID': this.generateRequestId(),
      'X-TimeStamp': new Date().toISOString(),
      'Accept': 'application/json',
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
    if (retryCount >= this.maxRetries) {
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
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
    
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
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
    return \`req_\${timestamp}_\${random}\`;
  }

  /**
   * Create standardized Vipps API error
   */
  private createVippsApiError(error: any): VippsApiError {
    const apiError = new Error() as VippsApiError;
    
    apiError.name = 'VippsApiError';
    apiError.message = error.message || 'Vipps API request failed';
    apiError.statusCode = error.response?.status || 500;
    apiError.vippsError = error.response?.data;
    apiError.requestId = error.config?.headers?.['X-Request-ID'];
    apiError.timestamp = new Date().toISOString();
    
    return apiError;
  }
}`;
	}

	private generateVippsTokenService(options: VippsIntegrationOptions): string {
		return `import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { VippsTokenResponse } from '../types/vipps.types';
import { vippsConfig, SECURITY_CONFIG } from '../config/vipps.config';

/**
 * Vipps Token Service
 * Manages OAuth 2.0 access tokens for Vipps API authentication
 * Implements token caching and automatic refresh with Norwegian compliance
 */
@Injectable()
export class VippsTokenService {
  private readonly logger = new Logger(VippsTokenService.name);
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private readonly httpService: HttpService) {}

  /**
   * Get valid access token (from cache or fetch new)
   */
  async getValidAccessToken(): Promise<string> {
    if (this.isTokenValid()) {
      return this.accessToken!;
    }

    return this.fetchNewAccessToken();
  }

  /**
   * Force refresh of access token
   */
  async refreshAccessToken(): Promise<string> {
    this.logger.log('Forcing access token refresh');
    return this.fetchNewAccessToken();
  }

  /**
   * Check if current token is valid
   */
  private isTokenValid(): boolean {
    if (!this.accessToken || !this.tokenExpiry) {
      return false;
    }

    // Add buffer time before expiration to prevent race conditions
    const bufferTime = SECURITY_CONFIG.TOKEN_EXPIRY_BUFFER * 1000; // Convert to milliseconds
    const now = new Date();
    const expiryWithBuffer = new Date(this.tokenExpiry.getTime() - bufferTime);

    return now < expiryWithBuffer;
  }

  /**
   * Fetch new access token from Vipps
   */
  private async fetchNewAccessToken(): Promise<string> {
    try {
      this.logger.log('Fetching new access token from Vipps');

      const response = await firstValueFrom(
        this.httpService.post<VippsTokenResponse>(
          \`\${vippsConfig.baseUrl}/accesstoken/get\`,
          {},
          {
            headers: {
              'client_id': vippsConfig.clientId,
              'client_secret': vippsConfig.clientSecret,
              'Ocp-Apim-Subscription-Key': vippsConfig.subscriptionKey,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Vipps-System-Name': 'xaheen-cli',
              'Vipps-System-Version': '1.0.0',
              'X-Request-ID': this.generateRequestId(),
              'X-TimeStamp': new Date().toISOString(),
            },
            timeout: vippsConfig.timeout,
          }
        )
      );

      const tokenData = response.data;

      // Validate token response
      if (!tokenData.access_token || !tokenData.expires_in) {
        throw new Error('Invalid token response from Vipps');
      }

      // Store token and calculate expiry
      this.accessToken = tokenData.access_token;
      this.tokenExpiry = new Date(Date.now() + tokenData.expires_in * 1000);

      this.logger.log(
        \`Access token fetched successfully. Expires at: \${this.tokenExpiry.toISOString()}\`
      );

      return this.accessToken;
    } catch (error) {
      this.logger.error(\`Failed to fetch access token: \${error.message}\`, error.stack);
      
      // Clear cached token on error
      this.accessToken = null;
      this.tokenExpiry = null;

      throw new HttpException(
        'Failed to authenticate with Vipps. Please check your credentials.',
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  /**
   * Clear cached token (useful for testing or forced refresh)
   */
  clearToken(): void {
    this.logger.log('Clearing cached access token');
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get token expiry information
   */
  getTokenInfo(): { hasToken: boolean; expiresAt: Date | null; isValid: boolean } {
    return {
      hasToken: !!this.accessToken,
      expiresAt: this.tokenExpiry,
      isValid: this.isTokenValid(),
    };
  }

  /**
   * Generate unique request ID for token requests
   */
  private generateRequestId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return \`token_\${timestamp}_\${random}\`;
  }
}`;
	}

	private generateOneTimePayment(
		options: VippsIntegrationOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		files.push({
			path: `${options.name}/integrations/vipps/services/vipps-payment.service.ts`,
			content: `import { Injectable, Logger } from '@nestjs/common';
import { VippsService } from './vipps.service';
import { 
  VippsPaymentRequest,
  VippsPaymentResponse,
  VippsPaymentDetails,
  VippsTransactionStatus
} from '../types/vipps.types';

/**
 * One-time Payment Service
 * Handles single payment transactions with Norwegian compliance
 */
@Injectable()
export class VippsPaymentService {
  private readonly logger = new Logger(VippsPaymentService.name);

  constructor(private readonly vippsService: VippsService) {}

  /**
   * Process one-time payment with full lifecycle management
   */
  async processOneTimePayment(
    amount: number,
    customerPhone: string,
    description: string,
    orderId?: string
  ): Promise<{
    paymentUrl: string;
    orderId: string;
    expiresAt: string;
    status: 'initiated';
  }> {
    this.logger.log(\`Processing one-time payment: \${amount} NOK for \${customerPhone}\`);

    const paymentResponse = await this.vippsService.initiatePayment(
      amount,
      customerPhone,
      description,
      orderId
    );

    return {
      paymentUrl: paymentResponse.url,
      orderId: paymentResponse.orderId,
      expiresAt: paymentResponse.expiresAt || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      status: 'initiated',
    };
  }

  /**
   * Handle payment completion workflow
   */
  async completePayment(orderId: string): Promise<{
    status: VippsTransactionStatus;
    amount: number;
    capturedAmount: number;
  }> {
    const details = await this.vippsService.getPaymentDetails(orderId);
    
    // Auto-capture if payment is reserved
    const lastTransaction = details.transactionLogHistory[0];
    if (lastTransaction?.operation === 'RESERVE' && lastTransaction.operationSuccess) {
      await this.vippsService.capturePayment(orderId);
      
      // Fetch updated details after capture
      const updatedDetails = await this.vippsService.getPaymentDetails(orderId);
      
      return {
        status: VippsTransactionStatus.CAPTURED,
        amount: updatedDetails.transactionSummary.capturedAmount + updatedDetails.transactionSummary.refundedAmount,
        capturedAmount: updatedDetails.transactionSummary.capturedAmount,
      };
    }

    return {
      status: this.determineStatus(details),
      amount: details.transactionSummary.capturedAmount + details.transactionSummary.refundedAmount,
      capturedAmount: details.transactionSummary.capturedAmount,
    };
  }

  private determineStatus(details: VippsPaymentDetails): VippsTransactionStatus {
    const lastTransaction = details.transactionLogHistory[0];
    
    if (!lastTransaction) {
      return VippsTransactionStatus.INITIATED;
    }

    switch (lastTransaction.operation) {
      case 'CAPTURE':
        return lastTransaction.operationSuccess ? VippsTransactionStatus.CAPTURED : VippsTransactionStatus.RESERVED;
      case 'CANCEL':
        return VippsTransactionStatus.CANCELLED;
      case 'REFUND':
        return VippsTransactionStatus.REFUNDED;
      case 'RESERVE':
        return lastTransaction.operationSuccess ? VippsTransactionStatus.RESERVED : VippsTransactionStatus.REJECTED;
      default:
        return VippsTransactionStatus.INITIATED;
    }
  }
}`,
			type: "create",
		});

		return files;
	}

	private generateExpressCheckout(
		options: VippsIntegrationOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		files.push({
			path: `${options.name}/integrations/vipps/services/vipps-express-checkout.service.ts`,
			content: `import { Injectable, Logger } from '@nestjs/common';
import { VippsService } from './vipps.service';
import { 
  VippsExpressCheckoutSession,
  VippsShippingDetails,
  VippsUserDetails
} from '../types/vipps.types';

/**
 * Express Checkout Service
 * Handles fast checkout with shipping details and user information
 */
@Injectable()
export class VippsExpressCheckoutService {
  private readonly logger = new Logger(VippsExpressCheckoutService.name);

  constructor(private readonly vippsService: VippsService) {}

  /**
   * Create express checkout session
   */
  async createExpressCheckoutSession(
    amount: number,
    items: ExpressCheckoutItem[],
    merchantCallbackUrl: string
  ): Promise<VippsExpressCheckoutSession> {
    const sessionId = this.generateSessionId();
    const orderId = \`express-\${sessionId}\`;
    
    this.logger.log(\`Creating express checkout session \${sessionId} for \${amount} NOK\`);

    const itemsDescription = items.map(item => \`\${item.name} x\${item.quantity}\`).join(', ');
    
    const paymentResponse = await this.vippsService.initiatePayment(
      amount,
      '', // Phone number will be provided by Vipps
      \`Express Checkout: \${itemsDescription}\`,
      orderId,
      {
        merchantInfo: {
          paymentType: 'eComm Express Payment',
          shippingDetailsPrefix: \`\${merchantCallbackUrl}/shipping\`,
          consentRemovalPrefix: \`\${merchantCallbackUrl}/consent\`,
        },
        transaction: {
          useExplicitCheckoutFlow: true,
        }
      }
    );

    const session: VippsExpressCheckoutSession = {
      sessionId,
      merchantSerialNumber: '', // Will be set by config
      amount,
      currency: 'NOK',
      customerInfo: { mobileNumber: '' }, // Will be filled by Vipps
      merchantInfo: {
        merchantSerialNumber: '',
        callbackPrefix: merchantCallbackUrl,
        fallBack: merchantCallbackUrl,
        paymentType: 'eComm Express Payment',
      },
      transaction: {
        orderId,
        amount,
        transactionText: \`Express Checkout: \${itemsDescription}\`,
      },
      paymentType: 'eComm Express Payment',
      status: 'CREATED',
      createdAt: new Date().toISOString(),
      expiresAt: paymentResponse.expiresAt || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };

    return session;
  }

  /**
   * Handle shipping details callback
   */
  async handleShippingDetailsCallback(
    orderId: string,
    shippingDetails: VippsShippingDetails
  ): Promise<{
    shippingOptions: ShippingOption[];
    isValid: boolean;
  }> {
    this.logger.log(\`Processing shipping details for order \${orderId}\`);

    // Validate Norwegian shipping address
    if (shippingDetails.address.country !== 'NO') {
      return {
        shippingOptions: [],
        isValid: false,
      };
    }

    // Generate shipping options based on address
    const shippingOptions = await this.calculateShippingOptions(shippingDetails.address);

    return {
      shippingOptions,
      isValid: true,
    };
  }

  /**
   * Get user details from express checkout
   */
  async getUserDetails(orderId: string): Promise<VippsUserDetails | null> {
    try {
      const paymentDetails = await this.vippsService.getPaymentDetails(orderId);
      return paymentDetails.userDetails || null;
    } catch (error) {
      this.logger.error(\`Failed to get user details for order \${orderId}: \${error.message}\`);
      return null;
    }
  }

  private generateSessionId(): string {
    return \`sess_\${Date.now()}_\${Math.random().toString(36).substring(2, 8)}\`;
  }

  private async calculateShippingOptions(address: any): Promise<ShippingOption[]> {
    // This would typically integrate with Norwegian shipping providers
    // like Posten Norge, Bring, etc.
    
    const options: ShippingOption[] = [
      {
        id: 'posten-standard',
        name: 'Posten Norge - Standard',
        price: 69, // NOK
        estimatedDelivery: '2-4 virkedager',
        description: 'Standard levering med Posten Norge',
      },
      {
        id: 'posten-express',
        name: 'Posten Norge - Express',
        price: 149, // NOK
        estimatedDelivery: '1-2 virkedager',
        description: 'Rask levering med Posten Norge',
      },
    ];

    // Add pickup points for major cities
    if (['Oslo', 'Bergen', 'Trondheim', 'Stavanger'].includes(address.city)) {
      options.push({
        id: 'pickup-point',
        name: 'Hentested',
        price: 39, // NOK
        estimatedDelivery: '1-3 virkedager',
        description: 'Hent på nærmeste utleveringssted',
      });
    }

    return options;
  }
}

interface ExpressCheckoutItem {
  name: string;
  quantity: number;
  price: number; // in NOK
  description?: string;
}

interface ShippingOption {
  id: string;
  name: string;
  price: number; // in NOK
  estimatedDelivery: string;
  description: string;
}`,
			type: "create",
		});

		return files;
	}

	private generateRecurringPayments(
		options: VippsIntegrationOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		files.push({
			path: `${options.name}/integrations/vipps/services/vipps-recurring.service.ts`,
			content: `import { Injectable, Logger } from '@nestjs/common';
import { VippsService } from './vipps.service';
import { 
  VippsRecurringAgreement,
  VippsRecurringCharge,
  VippsRecurringInterval,
  VippsAgreementStatus,
  VippsChargeStatus
} from '../types/vipps.types';

/**
 * Recurring Payments Service
 * Handles subscriptions and recurring payments with Norwegian compliance
 */
@Injectable()
export class VippsRecurringService {
  private readonly logger = new Logger(VippsRecurringService.name);

  constructor(private readonly vippsService: VippsService) {}

  /**
   * Create subscription with recurring payments
   */
  async createSubscription(
    customerPhone: string,
    productName: string,
    productDescription: string,
    price: number, // Monthly price in NOK
    interval: VippsRecurringInterval = VippsRecurringInterval.MONTHLY,
    redirectUrl: string
  ): Promise<{
    agreementId: string;
    agreementUrl: string;
    subscriptionId: string;
  }> {
    this.logger.log(\`Creating subscription for \${productName} - \${price} NOK/\${interval.toLowerCase()}\`);

    const agreement: Omit<VippsRecurringAgreement, 'currency'> = {
      customerPhoneNumber: customerPhone,
      interval,
      intervalCount: 1,
      isApp: false,
      merchantRedirectUrl: redirectUrl,
      merchantAgreementUrl: \`\${redirectUrl}/agreement\`,
      price,
      productDescription,
      productName,
    };

    const response = await this.vippsService.createRecurringAgreement(agreement);
    const subscriptionId = this.generateSubscriptionId();

    // Store subscription details for future reference
    // This would typically be saved to your database
    
    this.logger.log(\`Subscription created successfully: \${subscriptionId}\`);

    return {
      agreementId: response.agreementId,
      agreementUrl: response.agreementUrl,
      subscriptionId,
    };
  }

  /**
   * Process monthly/periodic charge
   */
  async processRecurringCharge(
    agreementId: string,
    amount: number,
    description: string,
    dueDate?: Date
  ): Promise<{
    chargeId: string;
    status: VippsChargeStatus;
    dueDate: string;
  }> {
    this.logger.log(\`Processing recurring charge for agreement \${agreementId}: \${amount} NOK\`);

    const due = dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    
    const charge: Omit<VippsRecurringCharge, 'currency'> = {
      amount,
      description,
      due: due.toISOString(),
      retryDays: 5, // Retry for 5 days if payment fails
      orderId: this.generateChargeOrderId(agreementId),
    };

    const response = await this.vippsService.chargeRecurringPayment(agreementId, charge);

    return {
      chargeId: response.chargeId,
      status: VippsChargeStatus.PENDING,
      dueDate: due.toISOString(),
    };
  }

  /**
   * Handle subscription upgrade/downgrade
   */
  async modifySubscription(
    agreementId: string,
    newPrice: number,
    newDescription: string
  ): Promise<{
    success: boolean;
    newAgreementId?: string;
    upgradeChargeId?: string;
  }> {
    this.logger.log(\`Modifying subscription \${agreementId} to \${newPrice} NOK\`);

    // For Vipps, subscription modifications typically require creating a new agreement
    // and canceling the old one after customer confirmation
    
    try {
      // Calculate prorated amount if upgrading mid-cycle
      const proratedAmount = await this.calculateProratedAmount(agreementId, newPrice);
      
      if (proratedAmount > 0) {
        // Charge difference immediately
        const upgradeCharge = await this.processRecurringCharge(
          agreementId,
          proratedAmount,
          \`Oppgradering til \${newDescription}\`,
          new Date() // Due immediately
        );

        return {
          success: true,
          upgradeChargeId: upgradeCharge.chargeId,
        };
      }

      return { success: true };
    } catch (error) {
      this.logger.error(\`Failed to modify subscription \${agreementId}: \${error.message}\`);
      return { success: false };
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    agreementId: string,
    reason?: string
  ): Promise<{
    success: boolean;
    cancellationDate: string;
    refundAmount?: number;
  }> {
    this.logger.log(\`Cancelling subscription \${agreementId}\${reason ? \`: \${reason}\` : ''}\`);

    try {
      // Stop the recurring agreement
      await this.stopRecurringAgreement(agreementId);
      
      // Calculate any refund amount for unused subscription time
      const refundAmount = await this.calculateRefundAmount(agreementId);
      
      const cancellationDate = new Date().toISOString();

      this.logger.log(\`Subscription \${agreementId} cancelled successfully\`);

      return {
        success: true,
        cancellationDate,
        refundAmount,
      };
    } catch (error) {
      this.logger.error(\`Failed to cancel subscription \${agreementId}: \${error.message}\`);
      return { success: false, cancellationDate: new Date().toISOString() };
    }
  }

  /**
   * Generate subscription analytics report
   */
  async generateSubscriptionReport(
    agreementId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<{
    agreementId: string;
    totalCharges: number;
    successfulCharges: number;
    failedCharges: number;
    totalRevenue: number;
    period: { from: string; to: string };
  }> {
    this.logger.log(\`Generating subscription report for \${agreementId}\`);

    // This would typically query your database for charge history
    // For now, we'll return a mock report structure
    
    return {
      agreementId,
      totalCharges: 0,
      successfulCharges: 0,
      failedCharges: 0,
      totalRevenue: 0,
      period: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      },
    };
  }

  private generateSubscriptionId(): string {
    return \`sub_\${Date.now()}_\${Math.random().toString(36).substring(2, 8)}\`;
  }

  private generateChargeOrderId(agreementId: string): string {
    const timestamp = Date.now();
    return \`charge_\${agreementId}_\${timestamp}\`;
  }

  private async calculateProratedAmount(agreementId: string, newPrice: number): Promise<number> {
    // This would calculate the prorated amount for subscription changes
    // For now, return 0 (no immediate charge)
    return 0;
  }

  private async calculateRefundAmount(agreementId: string): Promise<number> {
    // This would calculate refund amount for cancelled subscriptions
    // For now, return 0 (no refund)
    return 0;
  }

  private async stopRecurringAgreement(agreementId: string): Promise<void> {
    // This would make the API call to stop the recurring agreement
    // Implementation depends on Vipps API for stopping agreements
    this.logger.log(\`Stopping recurring agreement \${agreementId}\`);
  }
}`,
			type: "create",
		});

		return files;
	}

	private generateRefundServices(
		options: VippsIntegrationOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		files.push({
			path: `${options.name}/integrations/vipps/services/vipps-refund.service.ts`,
			content: `import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { VippsService } from './vipps.service';
import { VippsPaymentDetails, VippsTransactionStatus } from '../types/vipps.types';

/**
 * Refund Service
 * Handles full and partial refunds with Norwegian compliance
 */
@Injectable()
export class VippsRefundService {
  private readonly logger = new Logger(VippsRefundService.name);

  constructor(private readonly vippsService: VippsService) {}

  /**
   * Process full refund
   */
  async processFullRefund(
    orderId: string,
    reason: string
  ): Promise<{
    refundId: string;
    refundAmount: number;
    status: 'processed' | 'failed';
    reason: string;
  }> {
    this.logger.log(\`Processing full refund for order \${orderId}: \${reason}\`);

    try {
      const paymentDetails = await this.vippsService.getPaymentDetails(orderId);
      
      // Validate that payment can be refunded
      this.validateRefundEligibility(paymentDetails, 'full');
      
      const refundableAmount = paymentDetails.transactionSummary.remainingAmountToRefund;
      
      if (refundableAmount <= 0) {
        throw new HttpException(
          'No amount available for refund',
          HttpStatus.BAD_REQUEST
        );
      }

      await this.vippsService.refundPayment(
        orderId,
        refundableAmount / 100, // Convert øre to NOK
        \`Full refund: \${reason}\`
      );

      const refundId = this.generateRefundId(orderId);

      this.logger.log(\`Full refund processed successfully for order \${orderId}\`);

      return {
        refundId,
        refundAmount: refundableAmount / 100,
        status: 'processed',
        reason,
      };
    } catch (error) {
      this.logger.error(\`Full refund failed for order \${orderId}: \${error.message}\`);
      
      return {
        refundId: this.generateRefundId(orderId),
        refundAmount: 0,
        status: 'failed',
        reason: error.message,
      };
    }
  }

  /**
   * Process partial refund
   */
  async processPartialRefund(
    orderId: string,
    refundAmount: number, // Amount in NOK
    reason: string
  ): Promise<{
    refundId: string;
    refundAmount: number;
    remainingRefundable: number;
    status: 'processed' | 'failed';
    reason: string;
  }> {
    this.logger.log(\`Processing partial refund for order \${orderId}: \${refundAmount} NOK - \${reason}\`);

    try {
      const paymentDetails = await this.vippsService.getPaymentDetails(orderId);
      
      // Validate that payment can be partially refunded
      this.validateRefundEligibility(paymentDetails, 'partial');
      
      const availableForRefund = paymentDetails.transactionSummary.remainingAmountToRefund / 100;
      
      if (refundAmount > availableForRefund) {
        throw new HttpException(
          \`Refund amount (\${refundAmount} NOK) exceeds available amount (\${availableForRefund} NOK)\`,
          HttpStatus.BAD_REQUEST
        );
      }

      if (refundAmount <= 0) {
        throw new HttpException(
          'Refund amount must be greater than 0',
          HttpStatus.BAD_REQUEST
        );
      }

      await this.vippsService.refundPayment(
        orderId,
        refundAmount,
        \`Partial refund: \${reason}\`
      );

      const refundId = this.generateRefundId(orderId);
      const remainingRefundable = availableForRefund - refundAmount;

      this.logger.log(\`Partial refund processed successfully for order \${orderId}\`);

      return {
        refundId,
        refundAmount,
        remainingRefundable,
        status: 'processed',
        reason,
      };
    } catch (error) {
      this.logger.error(\`Partial refund failed for order \${orderId}: \${error.message}\`);
      
      return {
        refundId: this.generateRefundId(orderId),
        refundAmount: 0,
        remainingRefundable: 0,
        status: 'failed',
        reason: error.message,
      };
    }
  }

  /**
   * Get refund status
   */
  async getRefundStatus(orderId: string): Promise<{
    orderId: string;
    totalRefunded: number;
    remainingRefundable: number;
    refundHistory: RefundHistoryEntry[];
  }> {
    const paymentDetails = await this.vippsService.getPaymentDetails(orderId);
    
    // Extract refund transactions from transaction log
    const refundTransactions = paymentDetails.transactionLogHistory
      .filter(tx => tx.operation === 'REFUND' && tx.operationSuccess)
      .map(tx => ({
        refundId: this.generateRefundId(orderId, tx.transactionId),
        amount: tx.amount / 100, // Convert øre to NOK
        reason: tx.transactionText,
        timestamp: tx.timeStamp,
        transactionId: tx.transactionId,
      }));

    return {
      orderId,
      totalRefunded: paymentDetails.transactionSummary.refundedAmount / 100,
      remainingRefundable: paymentDetails.transactionSummary.remainingAmountToRefund / 100,
      refundHistory: refundTransactions,
    };
  }

  /**
   * Validate refund eligibility based on Norwegian regulations
   */
  private validateRefundEligibility(
    paymentDetails: VippsPaymentDetails,
    refundType: 'full' | 'partial'
  ): void {
    const lastTransaction = paymentDetails.transactionLogHistory[0];
    
    if (!lastTransaction) {
      throw new HttpException(
        'No transaction history found',
        HttpStatus.BAD_REQUEST
      );
    }

    // Payment must be captured to be refundable
    const capturedAmount = paymentDetails.transactionSummary.capturedAmount;
    if (capturedAmount <= 0) {
      throw new HttpException(
        'Payment must be captured before it can be refunded',
        HttpStatus.BAD_REQUEST
      );
    }

    // Check if there's anything left to refund
    const remainingToRefund = paymentDetails.transactionSummary.remainingAmountToRefund;
    if (remainingToRefund <= 0) {
      throw new HttpException(
        'Payment has already been fully refunded',
        HttpStatus.BAD_REQUEST
      );
    }

    // Norwegian regulation: Refunds must be processed within reasonable time
    const captureDate = new Date(lastTransaction.timeStamp);
    const now = new Date();
    const daysSinceCapture = (now.getTime() - captureDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceCapture > 365) { // 1 year limit
      throw new HttpException(
        'Refund period has expired (maximum 1 year from capture)',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Generate refund ID for tracking
   */
  private generateRefundId(orderId: string, transactionId?: string): string {
    const suffix = transactionId ? transactionId.substring(-6) : Date.now().toString().substring(-6);
    return \`refund_\${orderId}_\${suffix}\`;
  }
}

interface RefundHistoryEntry {
  refundId: string;
  amount: number; // Amount in NOK
  reason: string;
  timestamp: string;
  transactionId: string;
}`,
			type: "create",
		});

		return files;
	}

	// Continue with other generation methods...
	private generateReconciliationServices(
		options: VippsIntegrationOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		files.push({
			path: `${options.name}/integrations/vipps/services/vipps-reconciliation.service.ts`,
			content: `import { Injectable, Logger } from '@nestjs/common';
import { VippsService } from './vipps.service';
import { VippsReconciliationReport, VippsReconciliationTransaction } from '../types/vipps.types';

/**
 * Payment Reconciliation Service
 * Handles financial reconciliation and reporting for Norwegian compliance
 */
@Injectable()
export class VippsReconciliationService {
  private readonly logger = new Logger(VippsReconciliationService.name);

  constructor(private readonly vippsService: VippsService) {}

  /**
   * Generate daily reconciliation report
   */
  async generateDailyReport(date: Date): Promise<VippsReconciliationReport> {
    this.logger.log(\`Generating daily reconciliation report for \${date.toISOString().split('T')[0]}\`);
    
    // This would typically fetch from your transaction database
    // and reconcile with Vipps settlement reports
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const transactions = await this.getTransactionsForPeriod(startOfDay, endOfDay);
    
    const report: VippsReconciliationReport = {
      reportId: this.generateReportId('DAILY', date),
      merchantSerialNumber: '', // Will be filled from config
      reportDate: date.toISOString().split('T')[0],
      reportType: 'DAILY',
      totalTransactions: transactions.length,
      totalAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0),
      totalFees: transactions.reduce((sum, tx) => sum + tx.fee, 0),
      netAmount: transactions.reduce((sum, tx) => sum + tx.netAmount, 0),
      transactions,
    };

    this.logger.log(\`Daily report generated: \${report.totalTransactions} transactions, \${report.netAmount / 100} NOK net\`);
    
    return report;
  }

  /**
   * Validate settlement against Vipps reports
   */
  async validateSettlement(
    settlementDate: Date,
    expectedAmount: number // Amount in øre
  ): Promise<{
    isValid: boolean;
    actualAmount: number;
    difference: number;
    discrepancies: SettlementDiscrepancy[];
  }> {
    this.logger.log(\`Validating settlement for \${settlementDate.toISOString().split('T')[0]}\`);
    
    const report = await this.generateDailyReport(settlementDate);
    const actualAmount = report.netAmount;
    const difference = actualAmount - expectedAmount;
    
    const discrepancies: SettlementDiscrepancy[] = [];
    
    if (Math.abs(difference) > 0) {
      discrepancies.push({
        type: 'amount_mismatch',
        description: \`Expected \${expectedAmount / 100} NOK, actual \${actualAmount / 100} NOK\`,
        amount: difference,
        severity: Math.abs(difference) > 1000 ? 'high' : 'low', // 10 NOK threshold
      });
    }

    return {
      isValid: discrepancies.length === 0,
      actualAmount,
      difference,
      discrepancies,
    };
  }

  private async getTransactionsForPeriod(
    startDate: Date,
    endDate: Date
  ): Promise<VippsReconciliationTransaction[]> {
    // This would query your database for transactions in the period
    // For now, return empty array
    return [];
  }

  private generateReportId(type: string, date: Date): string {
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    return \`\${type}_\${dateStr}_\${Date.now().toString().substring(-4)}\`;
  }
}

interface SettlementDiscrepancy {
  type: 'amount_mismatch' | 'missing_transaction' | 'extra_transaction' | 'fee_mismatch';
  description: string;
  amount: number; // Amount in øre
  severity: 'low' | 'medium' | 'high';
}`,
			type: "create",
		});

		return files;
	}

	private generateWebhookHandlers(
		options: VippsIntegrationOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		files.push({
			path: `${options.name}/integrations/vipps/controllers/vipps-webhook.controller.ts`,
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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { createHmac } from 'crypto';
import { VippsWebhookService } from '../services/vipps-webhook.service';
import { VippsWebhookPayload } from '../types/vipps.types';
import { SECURITY_CONFIG } from '../config/vipps.config';

/**
 * Vipps Webhook Controller
 * Handles webhook callbacks from Vipps with Norwegian compliance
 */
@ApiTags('Vipps Webhooks')
@Controller('webhooks/vipps')
export class VippsWebhookController {
  private readonly logger = new Logger(VippsWebhookController.name);

  constructor(private readonly webhookService: VippsWebhookService) {}

  @Post('payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Vipps payment webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature or payload' })
  async handlePaymentWebhook(
    @Body() payload: VippsWebhookPayload,
    @Headers('x-vipps-signature') signature: string,
    @Headers('x-vipps-timestamp') timestamp: string
  ): Promise<{ success: boolean }> {
    this.logger.log(\`Received Vipps webhook for order \${payload.orderId}\`);

    // Verify webhook signature for security
    if (!this.verifyWebhookSignature(payload, signature, timestamp)) {
      this.logger.error(\`Invalid webhook signature for order \${payload.orderId}\`);
      throw new BadRequestException('Invalid webhook signature');
    }

    // Verify timestamp to prevent replay attacks
    if (!this.verifyTimestamp(timestamp)) {
      this.logger.error(\`Webhook timestamp too old for order \${payload.orderId}\`);
      throw new BadRequestException('Webhook timestamp too old');
    }

    try {
      await this.webhookService.processWebhook(payload);
      this.logger.log(\`Webhook processed successfully for order \${payload.orderId}\`);
      
      return { success: true };
    } catch (error) {
      this.logger.error(
        \`Webhook processing failed for order \${payload.orderId}: \${error.message}\`,
        error.stack
      );
      throw error;
    }
  }

  @Post('recurring')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Vipps recurring payment webhook' })
  async handleRecurringWebhook(
    @Body() payload: any,
    @Headers('x-vipps-signature') signature: string,
    @Headers('x-vipps-timestamp') timestamp: string
  ): Promise<{ success: boolean }> {
    this.logger.log(\`Received Vipps recurring webhook for agreement \${payload.agreementId}\`);

    if (!this.verifyWebhookSignature(payload, signature, timestamp)) {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (!this.verifyTimestamp(timestamp)) {
      throw new BadRequestException('Webhook timestamp too old');
    }

    try {
      await this.webhookService.processRecurringWebhook(payload);
      return { success: true };
    } catch (error) {
      this.logger.error(\`Recurring webhook processing failed: \${error.message}\`);
      throw error;
    }
  }

  /**
   * Verify webhook signature using HMAC SHA-256
   */
  private verifyWebhookSignature(
    payload: any,
    signature: string,
    timestamp: string
  ): boolean {
    if (!SECURITY_CONFIG.WEBHOOK_SECRET) {
      this.logger.warn('Webhook secret not configured - skipping signature verification');
      return true; // In development, might skip verification
    }

    try {
      const payloadString = JSON.stringify(payload);
      const signaturePayload = \`\${timestamp}.\${payloadString}\`;
      
      const expectedSignature = createHmac('sha256', SECURITY_CONFIG.WEBHOOK_SECRET)
        .update(signaturePayload)
        .digest('hex');
      
      const providedSignature = signature.replace('sha256=', '');
      
      // Use constant-time comparison to prevent timing attacks
      return this.constantTimeEqual(expectedSignature, providedSignature);
    } catch (error) {
      this.logger.error(\`Webhook signature verification failed: \${error.message}\`);
      return false;
    }
  }

  /**
   * Verify webhook timestamp to prevent replay attacks
   */
  private verifyTimestamp(timestamp: string): boolean {
    try {
      const webhookTime = parseInt(timestamp, 10) * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const maxAge = 5 * 60 * 1000; // 5 minutes
      
      return (currentTime - webhookTime) <= maxAge;
    } catch (error) {
      this.logger.error(\`Webhook timestamp verification failed: \${error.message}\`);
      return false;
    }
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private constantTimeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }
}`,
			type: "create",
		});

		files.push({
			path: `${options.name}/integrations/vipps/services/vipps-webhook.service.ts`,
			content: `import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { 
  VippsWebhookPayload,
  VippsWebhookEventType,
  VippsTransactionStatus 
} from '../types/vipps.types';

/**
 * Vipps Webhook Service
 * Processes webhook events and emits domain events
 */
@Injectable()
export class VippsWebhookService {
  private readonly logger = new Logger(VippsWebhookService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Process payment webhook events
   */
  async processWebhook(payload: VippsWebhookPayload): Promise<void> {
    this.logger.log(
      \`Processing webhook event \${payload.eventType} for order \${payload.orderId}\`
    );

    switch (payload.eventType) {
      case VippsWebhookEventType.PAYMENT_UPDATE:
        await this.handlePaymentUpdate(payload);
        break;
        
      case VippsWebhookEventType.PAYMENT_COMPLETED:
        await this.handlePaymentCompleted(payload);
        break;
        
      case VippsWebhookEventType.PAYMENT_CANCELLED:
        await this.handlePaymentCancelled(payload);
        break;
        
      case VippsWebhookEventType.PAYMENT_EXPIRED:
        await this.handlePaymentExpired(payload);
        break;
        
      case VippsWebhookEventType.PAYMENT_REFUNDED:
        await this.handlePaymentRefunded(payload);
        break;
        
      case VippsWebhookEventType.SHIPPING_DETAILS_PROVIDED:
        await this.handleShippingDetailsProvided(payload);
        break;
        
      case VippsWebhookEventType.USER_DETAILS_PROVIDED:
        await this.handleUserDetailsProvided(payload);
        break;
        
      default:
        this.logger.warn(\`Unknown webhook event type: \${payload.eventType}\`);
    }
  }

  /**
   * Process recurring payment webhook events
   */
  async processRecurringWebhook(payload: any): Promise<void> {
    this.logger.log(\`Processing recurring webhook event \${payload.eventType}\`);

    switch (payload.eventType) {
      case VippsWebhookEventType.RECURRING_CHARGE_COMPLETED:
        await this.handleRecurringChargeCompleted(payload);
        break;
        
      case VippsWebhookEventType.RECURRING_CHARGE_FAILED:
        await this.handleRecurringChargeFailed(payload);
        break;
        
      case VippsWebhookEventType.RECURRING_AGREEMENT_STOPPED:
        await this.handleRecurringAgreementStopped(payload);
        break;
        
      default:
        this.logger.warn(\`Unknown recurring webhook event type: \${payload.eventType}\`);
    }
  }

  private async handlePaymentUpdate(payload: VippsWebhookPayload): Promise<void> {
    this.eventEmitter.emit('vipps.payment.updated', {
      orderId: payload.orderId,
      status: payload.transactionInfo.status,
      amount: payload.transactionInfo.amount,
      timestamp: payload.timestamp,
    });
  }

  private async handlePaymentCompleted(payload: VippsWebhookPayload): Promise<void> {
    this.logger.log(\`Payment completed for order \${payload.orderId}\`);
    
    this.eventEmitter.emit('vipps.payment.completed', {
      orderId: payload.orderId,
      amount: payload.transactionInfo.amount,
      transactionId: payload.transactionInfo.transactionId,
      timestamp: payload.timestamp,
      userDetails: payload.userDetails,
      shippingDetails: payload.shippingDetails,
    });
  }

  private async handlePaymentCancelled(payload: VippsWebhookPayload): Promise<void> {
    this.logger.log(\`Payment cancelled for order \${payload.orderId}\`);
    
    this.eventEmitter.emit('vipps.payment.cancelled', {
      orderId: payload.orderId,
      timestamp: payload.timestamp,
    });
  }

  private async handlePaymentExpired(payload: VippsWebhookPayload): Promise<void> {
    this.logger.log(\`Payment expired for order \${payload.orderId}\`);
    
    this.eventEmitter.emit('vipps.payment.expired', {
      orderId: payload.orderId,
      timestamp: payload.timestamp,
    });
  }

  private async handlePaymentRefunded(payload: VippsWebhookPayload): Promise<void> {
    this.logger.log(\`Payment refunded for order \${payload.orderId}\`);
    
    this.eventEmitter.emit('vipps.payment.refunded', {
      orderId: payload.orderId,
      refundAmount: payload.transactionInfo.amount,
      timestamp: payload.timestamp,
    });
  }

  private async handleShippingDetailsProvided(payload: VippsWebhookPayload): Promise<void> {
    this.logger.log(\`Shipping details provided for order \${payload.orderId}\`);
    
    this.eventEmitter.emit('vipps.shipping.details.provided', {
      orderId: payload.orderId,
      shippingDetails: payload.shippingDetails,
      timestamp: payload.timestamp,
    });
  }

  private async handleUserDetailsProvided(payload: VippsWebhookPayload): Promise<void> {
    this.logger.log(\`User details provided for order \${payload.orderId}\`);
    
    this.eventEmitter.emit('vipps.user.details.provided', {
      orderId: payload.orderId,
      userDetails: payload.userDetails,
      timestamp: payload.timestamp,
    });
  }

  private async handleRecurringChargeCompleted(payload: any): Promise<void> {
    this.logger.log(\`Recurring charge completed for agreement \${payload.agreementId}\`);
    
    this.eventEmitter.emit('vipps.recurring.charge.completed', {
      agreementId: payload.agreementId,
      chargeId: payload.chargeId,
      amount: payload.amount,
      timestamp: payload.timestamp,
    });
  }

  private async handleRecurringChargeFailed(payload: any): Promise<void> {
    this.logger.log(\`Recurring charge failed for agreement \${payload.agreementId}\`);
    
    this.eventEmitter.emit('vipps.recurring.charge.failed', {
      agreementId: payload.agreementId,
      chargeId: payload.chargeId,
      failureReason: payload.failureReason,
      timestamp: payload.timestamp,
    });
  }

  private async handleRecurringAgreementStopped(payload: any): Promise<void> {
    this.logger.log(\`Recurring agreement stopped: \${payload.agreementId}\`);
    
    this.eventEmitter.emit('vipps.recurring.agreement.stopped', {
      agreementId: payload.agreementId,
      reason: payload.reason,
      timestamp: payload.timestamp,
    });
  }
}`,
			type: "create",
		});

		return files;
	}

	private generatePCICompliance(
		options: VippsIntegrationOptions,
	): GeneratedFile[] {
		return [
			{
				path: `${options.name}/integrations/vipps/compliance/pci-compliance.service.ts`,
				content: `import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * PCI DSS Compliance Service for Vipps Integration
 * Implements Norwegian payment security standards
 */
@Injectable()
export class VippsPCIComplianceService {
  private readonly logger = new Logger(VippsPCIComplianceService.name);
  private readonly algorithm = 'aes-256-gcm';

  /**
   * Encrypt sensitive payment data
   */
  encryptPaymentData(data: string): EncryptedPaymentData {
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: this.algorithm,
    };
  }

  /**
   * Mask sensitive data for logging
   */
  maskSensitiveData(data: any): any {
    const masked = { ...data };
    
    // Mask phone numbers
    if (masked.mobileNumber) {
      masked.mobileNumber = this.maskPhoneNumber(masked.mobileNumber);
    }
    
    // Mask order IDs partially
    if (masked.orderId) {
      masked.orderId = this.maskOrderId(masked.orderId);
    }
    
    return masked;
  }

  private getEncryptionKey(): Buffer {
    const keyString = process.env.VIPPS_ENCRYPTION_KEY;
    if (!keyString) {
      throw new Error('VIPPS_ENCRYPTION_KEY environment variable not set');
    }
    return Buffer.from(keyString, 'hex');
  }

  private maskPhoneNumber(phone: string): string {
    if (phone.length <= 4) return '*'.repeat(phone.length);
    return phone.slice(0, 3) + '*'.repeat(phone.length - 6) + phone.slice(-3);
  }

  private maskOrderId(orderId: string): string {
    if (orderId.length <= 8) return '*'.repeat(orderId.length);
    return orderId.slice(0, 4) + '*'.repeat(orderId.length - 8) + orderId.slice(-4);
  }
}

interface EncryptedPaymentData {
  encrypted: string;
  iv: string;
  authTag: string;
  algorithm: string;
}`,
				type: "create",
			},
		];
	}

	private generateAuditLogging(
		options: VippsIntegrationOptions,
	): GeneratedFile[] {
		return [
			{
				path: `${options.name}/integrations/vipps/audit/vipps-audit.service.ts`,
				content: `import { Injectable, Logger } from '@nestjs/common';

/**
 * Vipps Audit Service
 * Handles audit logging for Norwegian compliance requirements
 */
@Injectable()
export class VippsAuditService {
  private readonly logger = new Logger(VippsAuditService.name);

  /**
   * Log payment initiation
   */
  async logPaymentInitiation(orderId: string, amount: number, customerPhone: string): Promise<void> {
    const auditEntry = {
      action: 'PAYMENT_INITIATED',
      orderId,
      amount,
      customerPhone: this.maskPhoneNumber(customerPhone),
      timestamp: new Date().toISOString(),
      ipAddress: this.getCurrentIP(),
      userAgent: this.getCurrentUserAgent(),
    };

    this.logger.log(\`Payment initiated: \${JSON.stringify(auditEntry)}\`);
    // Store in audit database
  }

  /**
   * Log payment completion
   */
  async logPaymentCompletion(orderId: string, transactionId: string): Promise<void> {
    const auditEntry = {
      action: 'PAYMENT_COMPLETED',
      orderId,
      transactionId,
      timestamp: new Date().toISOString(),
    };

    this.logger.log(\`Payment completed: \${JSON.stringify(auditEntry)}\`);
  }

  private maskPhoneNumber(phone: string): string {
    return phone.slice(0, 3) + '*'.repeat(phone.length - 6) + phone.slice(-3);
  }

  private getCurrentIP(): string {
    // In a real implementation, extract from request context
    return '0.0.0.0';
  }

  private getCurrentUserAgent(): string {
    // In a real implementation, extract from request context
    return 'unknown';
  }
}`,
				type: "create",
			},
		];
	}

	private generateErrorHandling(
		options: VippsIntegrationOptions,
	): GeneratedFile[] {
		return [
			{
				path: `${options.name}/integrations/vipps/error/vipps-error-handler.service.ts`,
				content: `import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { VippsApiError } from '../types/vipps.types';

/**
 * Vipps Error Handler Service
 * Centralized error handling with Norwegian context
 */
@Injectable()
export class VippsErrorHandlerService {
  private readonly logger = new Logger(VippsErrorHandlerService.name);

  /**
   * Handle and transform Vipps API errors
   */
  handleApiError(error: any, context: string = 'VippsAPI'): HttpException {
    this.logger.error(\`Vipps API error in \${context}: \${error.message}\`, error.stack);

    if (error.response?.data?.errorCode) {
      return this.transformVippsError(error.response.data, error.response.status);
    }

    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return new HttpException(
        'Vipps service temporarily unavailable. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    return new HttpException(
      'An error occurred while processing your payment',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  private transformVippsError(vippsError: any, statusCode: number): HttpException {
    const errorMessages: Record<string, string> = {
      'payment.not.found': 'Betalingen ble ikke funnet',
      'payment.expired': 'Betalingen har utløpt',
      'insufficient.funds': 'Utilstrekkelige midler',
      'payment.cancelled.by.user': 'Betalingen ble avbrutt av kunde',
      'merchant.not.allowed.for.ecomm': 'Merchant ikke tillatt for e-handel',
      'invalid.request': 'Ugyldig forespørsel',
    };

    const norwegianMessage = errorMessages[vippsError.errorCode] || vippsError.errorMessage;

    return new HttpException(
      {
        message: norwegianMessage,
        errorCode: vippsError.errorCode,
        contextId: vippsError.contextId,
      },
      statusCode
    );
  }
}`,
				type: "create",
			},
		];
	}

	private generateTests(options: VippsIntegrationOptions): GeneratedFile[] {
		return [
			{
				path: `${options.name}/integrations/vipps/tests/vipps.service.spec.ts`,
				content: `import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { VippsService } from '../services/vipps.service';
import { VippsHttpClient } from '../services/vipps-http.client';
import { VippsTokenService } from '../services/vipps-token.service';

describe('VippsService', () => {
  let service: VippsService;
  let httpClient: VippsHttpClient;
  let tokenService: VippsTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VippsService,
        {
          provide: VippsHttpClient,
          useValue: {
            post: jest.fn(),
            get: jest.fn(),
            put: jest.fn(),
          },
        },
        {
          provide: VippsTokenService,
          useValue: {
            getValidAccessToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VippsService>(VippsService);
    httpClient = module.get<VippsHttpClient>(VippsHttpClient);
    tokenService = module.get<VippsTokenService>(VippsTokenService);
  });

  describe('initiatePayment', () => {
    it('should initiate payment successfully', async () => {
      const mockResponse = {
        orderId: 'test-order-123',
        url: 'https://vipps.no/pay/test-order-123',
        expiresAt: '2024-12-31T23:59:59.000Z',
      };

      jest.spyOn(httpClient, 'post').mockResolvedValue(mockResponse);

      const result = await service.initiatePayment(
        100, // 100 NOK
        '+4791234567',
        'Test payment'
      );

      expect(result.orderId).toBeDefined();
      expect(result.url).toBe(mockResponse.url);
      expect(httpClient.post).toHaveBeenCalledWith(
        '/ecomm/v2/payments',
        expect.objectContaining({
          transaction: expect.objectContaining({
            amount: 10000, // 100 NOK in øre
          }),
        })
      );
    });

    it('should format Norwegian phone numbers correctly', async () => {
      jest.spyOn(httpClient, 'post').mockResolvedValue({
        orderId: 'test',
        url: 'test',
      });

      await service.initiatePayment(100, '91234567', 'Test');

      expect(httpClient.post).toHaveBeenCalledWith(
        '/ecomm/v2/payments',
        expect.objectContaining({
          customerInfo: expect.objectContaining({
            mobileNumber: '+4791234567',
          }),
        })
      );
    });

    it('should validate amount limits', async () => {
      await expect(
        service.initiatePayment(-100, '+4791234567', 'Test')
      ).rejects.toThrow('Amount must be a positive integer');

      await expect(
        service.initiatePayment(0.5, '+4791234567', 'Test')
      ).rejects.toThrow('Amount must be a positive integer');
    });
  });

  describe('formatNorwegianPhoneNumber', () => {
    it('should format various Norwegian phone number formats', () => {
      const testCases = [
        { input: '91234567', expected: '+4791234567' },
        { input: '+4791234567', expected: '+4791234567' },
        { input: '4791234567', expected: '+4791234567' },
        { input: '0047 91 23 45 67', expected: '+4791234567' },
        { input: '912 34 567', expected: '+4791234567' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = service['formatNorwegianPhoneNumber'](input);
        expect(result).toBe(expected);
      });
    });

    it('should throw error for invalid phone numbers', () => {
      const invalidNumbers = ['123', '+461234567', '123456789012'];

      invalidNumbers.forEach(number => {
        expect(() => service['formatNorwegianPhoneNumber'](number))
          .toThrow('Invalid Norwegian phone number format');
      });
    });
  });
});`,
				type: "create",
			},
		];
	}

	private generateDocumentation(
		options: VippsIntegrationOptions,
	): GeneratedFile[] {
		return [
			{
				path: `${options.name}/integrations/vipps/README.md`,
				content: `# Vipps Payment Integration

Norwegian mobile payment solution integration with enterprise-grade features.

## Features

${options.features.map((feature) => `- ${feature.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`).join("\n")}

## Environment Variables

\`\`\`bash
# Vipps API Configuration
VIPPS_MSN=your_merchant_serial_number
VIPPS_CLIENT_ID=your_client_id
VIPPS_CLIENT_SECRET=your_client_secret
VIPPS_SUBSCRIPTION_KEY=your_subscription_key

# URLs
VIPPS_CALLBACK_PREFIX=https://your-domain.no/vipps
VIPPS_FALLBACK_URL=https://your-domain.no/payment/result
VIPPS_WEBHOOK_URL=https://your-domain.no/webhooks/vipps

# Security
VIPPS_WEBHOOK_SECRET=your_webhook_secret
VIPPS_ENCRYPTION_KEY=your_32_byte_hex_key
\`\`\`

## Usage

### Basic Payment

\`\`\`typescript
import { VippsService } from './integrations/vipps/services/vipps.service';

// Initiate payment
const payment = await vippsService.initiatePayment(
  100, // 100 NOK
  '+4791234567',
  'Purchase from your store'
);

// Capture payment
await vippsService.capturePayment(payment.orderId);
\`\`\`

### Express Checkout

\`\`\`typescript
import { VippsExpressCheckoutService } from './integrations/vipps/services/vipps-express-checkout.service';

const session = await expressCheckoutService.createExpressCheckoutSession(
  299, // 299 NOK
  [
    { name: 'Product 1', quantity: 1, price: 299 }
  ],
  'https://your-domain.no/checkout/callback'
);
\`\`\`

### Recurring Payments

\`\`\`typescript
import { VippsRecurringService } from './integrations/vipps/services/vipps-recurring.service';

const subscription = await recurringService.createSubscription(
  '+4791234567',
  'Monthly Subscription',
  'Access to premium features',
  99, // 99 NOK/month
  VippsRecurringInterval.MONTHLY,
  'https://your-domain.no/subscription/callback'
);
\`\`\`

## Norwegian Compliance

This integration follows Norwegian regulations and best practices:

- **Phone Number Format**: Automatic formatting to Norwegian standard (+47)
- **Currency**: All amounts in Norwegian Kroner (NOK) and øre
- **Language**: Error messages and descriptions in Norwegian
- **Data Residency**: ${options.compliance.dataResidency.toUpperCase()} data residency
- **Audit Logging**: Comprehensive audit trail for compliance
- **PCI DSS**: ${options.compliance.pciDss ? "Enabled" : "Disabled"}
- **GDPR**: ${options.compliance.gdpr ? "Compliant" : "Not configured"}

## Error Handling

All errors are handled with Norwegian context and appropriate HTTP status codes:

\`\`\`typescript
try {
  await vippsService.initiatePayment(100, '+4791234567', 'Test');
} catch (error) {
  if (error.status === 402) {
    console.log('Utilstrekkelige midler'); // Insufficient funds
  }
}
\`\`\`

## Testing

Run the test suite:

\`\`\`bash
npm test -- vipps
\`\`\`

## Support

For technical support, refer to:
- [Vipps Developer Portal](https://developer.vipps.no/)
- [Vipps API Documentation](https://vippsas.github.io/vipps-ecom-api/)
`,
				type: "create",
			},
		];
	}
}
