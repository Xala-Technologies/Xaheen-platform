/**
 * Payment Systems Generator
 * Generates integration code for payment providers and systems
 */

import type { GeneratedFile } from "../../types/index.js";

export interface PaymentSystemOptions {
	name: string;
	provider: "vipps" | "stripe" | "klarna" | "paypal" | "bambora" | "nets";
	features: PaymentFeature[];
	environment: "sandbox" | "production";
	authentication: {
		merchantId?: string;
		clientId?: string;
		clientSecret?: string;
		apiKey?: string;
		subscriptionKey?: string;
	};
	capabilities?: PaymentCapability[];
	compliance?: {
		pci: boolean; // PCI DSS compliance
		sca: boolean; // Strong Customer Authentication
		gdpr: boolean;
		mobilePayments: boolean;
	};
}

export type PaymentFeature =
	| "one-time-payment"
	| "recurring-payment"
	| "subscription"
	| "refunds"
	| "partial-refunds"
	| "capture-later"
	| "express-checkout"
	| "mobile-payments"
	| "invoice-payments"
	| "installments"
	| "loyalty-points"
	| "gift-cards";

export type PaymentCapability =
	| "card-payments"
	| "bank-transfers"
	| "digital-wallets"
	| "buy-now-pay-later"
	| "cryptocurrency"
	| "qr-payments"
	| "nfc-payments"
	| "biometric-auth";

export class PaymentSystemsGenerator {
	async generate(options: PaymentSystemOptions): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];

		// Generate provider-specific integration
		switch (options.provider) {
			case "vipps":
				files.push(...(await this.generateVippsIntegration(options)));
				break;
			case "stripe":
				files.push(...(await this.generateStripeIntegration(options)));
				break;
			case "klarna":
				files.push(...(await this.generateKlarnaIntegration(options)));
				break;
			case "nets":
				files.push(...(await this.generateNetsIntegration(options)));
				break;
			default:
				files.push(...(await this.generateGenericPaymentIntegration(options)));
		}

		// Add PCI compliance if required
		if (options.compliance?.pci) {
			files.push(...this.generatePCICompliance(options));
		}

		// Add webhook handlers
		files.push(...this.generateWebhookHandlers(options));

		return files;
	}

	private async generateVippsIntegration(
		options: PaymentSystemOptions,
	): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];

		// Vipps configuration
		files.push({
			path: `${options.name}/payments/vipps/config.ts`,
			content: this.generateVippsConfig(options),
			type: "create",
		});

		// Vipps service
		files.push({
			path: `${options.name}/payments/vipps/vipps.service.ts`,
			content: this.generateVippsService(options),
			type: "create",
		});

		// Vipps Express Checkout
		if (options.features.includes("express-checkout")) {
			files.push({
				path: `${options.name}/payments/vipps/express-checkout.service.ts`,
				content: this.generateVippsExpressCheckout(options),
				type: "create",
			});
		}

		// Vipps Recurring Payments
		if (options.features.includes("recurring-payment")) {
			files.push({
				path: `${options.name}/payments/vipps/recurring.service.ts`,
				content: this.generateVippsRecurring(options),
				type: "create",
			});
		}

		// Tests
		files.push({
			path: `${options.name}/payments/vipps/vipps.test.ts`,
			content: this.generateVippsTests(options),
			type: "create",
		});

		return files;
	}

	private generateVippsConfig(options: PaymentSystemOptions): string {
		const env = options.environment;
		const baseUrl =
			env === "production"
				? "https://api.vipps.no"
				: "https://apitest.vipps.no";

		return `/**
 * Vipps Configuration
 * Norway's leading mobile payment solution
 */

export interface VippsConfig {
  readonly baseUrl: string;
  readonly merchantSerialNumber: string;
  readonly subscriptionKey: string;
  readonly clientId: string;
  readonly clientSecret: string;
  readonly callbackPrefix: string;
  readonly fallbackUrl: string;
  readonly environment: 'sandbox' | 'production';
}

export const vippsConfig: VippsConfig = {
  baseUrl: '${baseUrl}',
  merchantSerialNumber: process.env.VIPPS_MSN || '${options.authentication.merchantId || ""}',
  subscriptionKey: process.env.VIPPS_SUBSCRIPTION_KEY || '${options.authentication.subscriptionKey || ""}',
  clientId: process.env.VIPPS_CLIENT_ID || '${options.authentication.clientId || ""}',
  clientSecret: process.env.VIPPS_CLIENT_SECRET || '',
  callbackPrefix: process.env.VIPPS_CALLBACK_PREFIX || 'https://localhost:3000/vipps',
  fallbackUrl: process.env.VIPPS_FALLBACK_URL || 'https://localhost:3000/payment/result',
  environment: '${env}',
};

// Vipps payment request types
export interface VippsPaymentRequest {
  readonly merchantInfo: {
    readonly merchantSerialNumber: string;
    readonly callbackPrefix: string;
    readonly fallBack: string;
    readonly authToken?: string;
    readonly consentRemovalPrefix?: string;
    readonly shippingDetailsPrefix?: string;
    readonly paymentType?: 'eComm Regular Payment' | 'eComm Express Payment';
  };
  readonly customerInfo: {
    readonly mobileNumber: string;
  };
  readonly transaction: {
    readonly orderId: string;
    readonly amount: number;
    readonly transactionText: string;
    readonly timeStamp?: string;
    readonly skipLandingPage?: boolean;
    readonly scope?: string;
    readonly refOrderId?: string;
  };
}

export interface VippsPaymentResponse {
  readonly orderId: string;
  readonly url: string;
  readonly expiresAt?: string;
}

export enum VippsTransactionStatus {
  INITIATE = 'INITIATE',
  REGISTER = 'REGISTER',
  RESERVE = 'RESERVE',
  SALE = 'SALE',
  CANCEL = 'CANCEL',
  REFUND = 'REFUND',
  VOID = 'VOID',
}`;
	}

	private generateVippsService(options: PaymentSystemOptions): string {
		return `import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { 
  vippsConfig, 
  VippsPaymentRequest, 
  VippsPaymentResponse,
  VippsTransactionStatus 
} from './config';

/**
 * Vipps Payment Service
 * Handles Vipps payment operations
 */
@Injectable()
export class VippsService {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private httpService: HttpService) {}

  /**
   * Get Vipps access token
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          \`\${vippsConfig.baseUrl}/accesstoken/get\`,
          {},
          {
            headers: {
              'client_id': vippsConfig.clientId,
              'client_secret': vippsConfig.clientSecret,
              'Ocp-Apim-Subscription-Key': vippsConfig.subscriptionKey,
            },
          }
        )
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000);
      
      return this.accessToken;
    } catch (error: any) {
      throw new HttpException(
        'Vipps authentication failed',
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  /**
   * Initiate Vipps payment
   */
  async initiatePayment(
    amount: number,
    mobileNumber: string,
    orderText: string,
    orderId?: string
  ): Promise<VippsPaymentResponse> {
    const token = await this.getAccessToken();
    const generatedOrderId = orderId || \`order-\${uuidv4()}\`;

    const paymentRequest: VippsPaymentRequest = {
      merchantInfo: {
        merchantSerialNumber: vippsConfig.merchantSerialNumber,
        callbackPrefix: vippsConfig.callbackPrefix,
        fallBack: vippsConfig.fallbackUrl,
        paymentType: 'eComm Regular Payment',
      },
      customerInfo: {
        mobileNumber: this.formatPhoneNumber(mobileNumber),
      },
      transaction: {
        orderId: generatedOrderId,
        amount: amount * 100, // Convert to øre
        transactionText: orderText,
        timeStamp: new Date().toISOString(),
      },
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          \`\${vippsConfig.baseUrl}/ecomm/v2/payments\`,
          paymentRequest,
          {
            headers: {
              'Authorization': \`Bearer \${token}\`,
              'Ocp-Apim-Subscription-Key': vippsConfig.subscriptionKey,
              'Merchant-Serial-Number': vippsConfig.merchantSerialNumber,
              'Vipps-System-Name': 'xaheen-cli',
              'Vipps-System-Version': '1.0.0',
              'Content-Type': 'application/json',
            },
          }
        )
      );

      return {
        orderId: generatedOrderId,
        url: response.data.url,
        expiresAt: response.data.expiresAt,
      };
    } catch (error: any) {
      this.handleVippsError(error);
      throw error;
    }
  }

  /**
   * Capture payment
   */
  async capturePayment(
    orderId: string,
    amount?: number
  ): Promise<void> {
    const token = await this.getAccessToken();

    const captureRequest = {
      merchantInfo: {
        merchantSerialNumber: vippsConfig.merchantSerialNumber,
      },
      transaction: {
        amount: amount ? amount * 100 : undefined, // Partial capture if amount specified
        transactionText: \`Capture for order \${orderId}\`,
      },
    };

    await firstValueFrom(
      this.httpService.post(
        \`\${vippsConfig.baseUrl}/ecomm/v2/payments/\${orderId}/capture\`,
        captureRequest,
        {
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Ocp-Apim-Subscription-Key': vippsConfig.subscriptionKey,
            'Content-Type': 'application/json',
          },
        }
      )
    );
  }

  /**
   * Cancel payment
   */
  async cancelPayment(orderId: string): Promise<void> {
    const token = await this.getAccessToken();

    const cancelRequest = {
      merchantInfo: {
        merchantSerialNumber: vippsConfig.merchantSerialNumber,
      },
      transaction: {
        transactionText: \`Cancelled order \${orderId}\`,
      },
    };

    await firstValueFrom(
      this.httpService.put(
        \`\${vippsConfig.baseUrl}/ecomm/v2/payments/\${orderId}/cancel\`,
        cancelRequest,
        {
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Ocp-Apim-Subscription-Key': vippsConfig.subscriptionKey,
            'Content-Type': 'application/json',
          },
        }
      )
    );
  }

  /**
   * Refund payment
   */
  async refundPayment(
    orderId: string,
    amount: number,
    refundText: string
  ): Promise<void> {
    const token = await this.getAccessToken();

    const refundRequest = {
      merchantInfo: {
        merchantSerialNumber: vippsConfig.merchantSerialNumber,
      },
      transaction: {
        amount: amount * 100, // Convert to øre
        transactionText: refundText,
      },
    };

    await firstValueFrom(
      this.httpService.post(
        \`\${vippsConfig.baseUrl}/ecomm/v2/payments/\${orderId}/refund\`,
        refundRequest,
        {
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Ocp-Apim-Subscription-Key': vippsConfig.subscriptionKey,
            'X-Request-Id': uuidv4(),
            'Content-Type': 'application/json',
          },
        }
      )
    );
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(orderId: string): Promise<any> {
    const token = await this.getAccessToken();

    const response = await firstValueFrom(
      this.httpService.get(
        \`\${vippsConfig.baseUrl}/ecomm/v2/payments/\${orderId}/details\`,
        {
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Ocp-Apim-Subscription-Key': vippsConfig.subscriptionKey,
          },
        }
      )
    );

    return response.data;
  }

  /**
   * Format Norwegian phone number for Vipps
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove spaces and special characters
    let cleaned = phoneNumber.replace(/[\\s-()]/g, '');
    
    // Add country code if not present
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('47')) {
        cleaned = \`+\${cleaned}\`;
      } else if (cleaned.startsWith('00')) {
        cleaned = \`+\${cleaned.substring(2)}\`;
      } else {
        cleaned = \`+47\${cleaned}\`;
      }
    }
    
    return cleaned;
  }

  /**
   * Handle Vipps API errors
   */
  private handleVippsError(error: any): void {
    const errorCode = error.response?.data?.errorCode;
    const errorMessage = error.response?.data?.errorMessage || 'Vipps error';

    switch (errorCode) {
      case 'payment.not.found':
        throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
      case 'invalid.request':
        throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
      case 'unauthorized':
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      default:
        throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}`;
	}

	private generateVippsExpressCheckout(options: PaymentSystemOptions): string {
		return `import { Injectable } from '@nestjs/common';
import { VippsService } from './vipps.service';

/**
 * Vipps Express Checkout Service
 * Fast checkout with shipping and user details
 */
@Injectable()
export class VippsExpressCheckoutService {
  constructor(private vippsService: VippsService) {}

  /**
   * Initiate express checkout
   */
  async initiateExpressCheckout(
    amount: number,
    items: CheckoutItem[]
  ): Promise<ExpressCheckoutResponse> {
    // Express checkout implementation
    const orderId = \`express-\${Date.now()}\`;
    
    const payment = await this.vippsService.initiatePayment(
      amount,
      '', // Phone number fetched from Vipps
      'Express Checkout',
      orderId
    );

    return {
      orderId,
      checkoutUrl: payment.url,
      expiresAt: payment.expiresAt,
    };
  }

  /**
   * Get shipping details from Vipps
   */
  async getShippingDetails(orderId: string): Promise<ShippingDetails> {
    // Fetch shipping details from Vipps callback
    return {
      name: '',
      address: '',
      postalCode: '',
      city: '',
      country: 'NO',
    };
  }
}

interface CheckoutItem {
  name: string;
  quantity: number;
  price: number;
}

interface ExpressCheckoutResponse {
  orderId: string;
  checkoutUrl: string;
  expiresAt?: string;
}

interface ShippingDetails {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
}`;
	}

	private generateVippsRecurring(options: PaymentSystemOptions): string {
		return `import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { vippsConfig } from './config';

/**
 * Vipps Recurring Payments Service
 * Handles subscriptions and recurring payments
 */
@Injectable()
export class VippsRecurringService {
  constructor(private httpService: HttpService) {}

  /**
   * Create agreement for recurring payments
   */
  async createAgreement(
    customerPhone: string,
    productName: string,
    price: number,
    interval: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  ): Promise<Agreement> {
    const agreementRequest = {
      currency: 'NOK',
      customerPhoneNumber: customerPhone,
      interval,
      intervalCount: 1,
      isApp: false,
      merchantRedirectUrl: vippsConfig.fallbackUrl,
      merchantAgreementUrl: \`\${vippsConfig.callbackPrefix}/agreements\`,
      price: price * 100,
      productDescription: productName,
      productName,
    };

    const response = await firstValueFrom(
      this.httpService.post(
        \`\${vippsConfig.baseUrl}/recurring/v2/agreements\`,
        agreementRequest,
        {
          headers: this.getHeaders(),
        }
      )
    );

    return response.data;
  }

  /**
   * Charge recurring payment
   */
  async chargeAgreement(
    agreementId: string,
    amount: number,
    description: string
  ): Promise<ChargeResponse> {
    const chargeRequest = {
      amount: amount * 100,
      currency: 'NOK',
      description,
      due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      retryDays: 5,
    };

    const response = await firstValueFrom(
      this.httpService.post(
        \`\${vippsConfig.baseUrl}/recurring/v2/agreements/\${agreementId}/charges\`,
        chargeRequest,
        {
          headers: this.getHeaders(),
        }
      )
    );

    return response.data;
  }

  /**
   * Cancel agreement
   */
  async cancelAgreement(agreementId: string): Promise<void> {
    await firstValueFrom(
      this.httpService.patch(
        \`\${vippsConfig.baseUrl}/recurring/v2/agreements/\${agreementId}\`,
        { status: 'STOPPED' },
        {
          headers: this.getHeaders(),
        }
      )
    );
  }

  private getHeaders(): Record<string, string> {
    return {
      'Ocp-Apim-Subscription-Key': vippsConfig.subscriptionKey,
      'Merchant-Serial-Number': vippsConfig.merchantSerialNumber,
      'Content-Type': 'application/json',
    };
  }
}

interface Agreement {
  agreementId: string;
  agreementUrl: string;
  status: string;
}

interface ChargeResponse {
  chargeId: string;
  status: string;
}`;
	}

	private generateVippsTests(options: PaymentSystemOptions): string {
		return `import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { VippsService } from './vipps.service';

describe('VippsService', () => {
  let service: VippsService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VippsService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
            get: jest.fn(),
            put: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VippsService>(VippsService);
    httpService = module.get<HttpService>(HttpService);
  });

  describe('initiatePayment', () => {
    it('should initiate payment successfully', async () => {
      const mockToken = 'test-token';
      const mockPaymentResponse = {
        url: 'https://vipps.no/pay/123',
        expiresAt: '2024-12-31T23:59:59Z',
      };

      jest.spyOn(service as any, 'getAccessToken').mockResolvedValue(mockToken);
      jest.spyOn(httpService, 'post').mockReturnValue(
        of({ data: mockPaymentResponse } as any)
      );

      const result = await service.initiatePayment(
        100,
        '91234567',
        'Test payment'
      );

      expect(result.url).toBe(mockPaymentResponse.url);
      expect(result.orderId).toBeDefined();
    });

    it('should format Norwegian phone numbers correctly', () => {
      const formatted = service['formatPhoneNumber']('91234567');
      expect(formatted).toBe('+4791234567');

      const withCountryCode = service['formatPhoneNumber']('+4791234567');
      expect(withCountryCode).toBe('+4791234567');

      const withSpaces = service['formatPhoneNumber']('912 34 567');
      expect(withSpaces).toBe('+4791234567');
    });
  });

  describe('capturePayment', () => {
    it('should capture payment', async () => {
      const mockToken = 'test-token';
      jest.spyOn(service as any, 'getAccessToken').mockResolvedValue(mockToken);
      jest.spyOn(httpService, 'post').mockReturnValue(of({} as any));

      await expect(
        service.capturePayment('order-123', 50)
      ).resolves.not.toThrow();
    });
  });

  describe('refundPayment', () => {
    it('should refund payment', async () => {
      const mockToken = 'test-token';
      jest.spyOn(service as any, 'getAccessToken').mockResolvedValue(mockToken);
      jest.spyOn(httpService, 'post').mockReturnValue(of({} as any));

      await expect(
        service.refundPayment('order-123', 50, 'Refund for damaged goods')
      ).resolves.not.toThrow();
    });
  });
});`;
	}

	private async generateStripeIntegration(
		options: PaymentSystemOptions,
	): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];

		// Stripe service
		files.push({
			path: `${options.name}/payments/stripe/stripe.service.ts`,
			content: this.generateStripeService(options),
			type: "create",
		});

		return files;
	}

	private generateStripeService(options: PaymentSystemOptions): string {
		return `import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

/**
 * Stripe Payment Service
 * Full-featured payment processing with Stripe
 */
@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'NOK',
    metadata?: Record<string, string>
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount: amount * 100, // Convert to smallest currency unit
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  /**
   * Create subscription
   */
  async createSubscription(
    customerId: string,
    priceId: string
  ): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
  }

  /**
   * Process refund
   */
  async refund(
    paymentIntentId: string,
    amount?: number
  ): Promise<Stripe.Refund> {
    return this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? amount * 100 : undefined,
    });
  }

  /**
   * Create customer
   */
  async createCustomer(
    email: string,
    name: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Customer> {
    return this.stripe.customers.create({
      email,
      name,
      metadata,
    });
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(
    payload: string,
    signature: string
  ): Promise<void> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await this.handleSubscriptionChange(event.data.object as Stripe.Subscription);
          break;
      }
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    // Handle successful payment
    console.log('Payment succeeded:', paymentIntent.id);
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    // Handle failed payment
    console.log('Payment failed:', paymentIntent.id);
  }

  private async handleSubscriptionChange(subscription: Stripe.Subscription): Promise<void> {
    // Handle subscription changes
    console.log('Subscription changed:', subscription.id);
  }
}`;
	}

	private async generateKlarnaIntegration(
		options: PaymentSystemOptions,
	): Promise<GeneratedFile[]> {
		return [];
	}

	private async generateNetsIntegration(
		options: PaymentSystemOptions,
	): Promise<GeneratedFile[]> {
		return [];
	}

	private async generateGenericPaymentIntegration(
		options: PaymentSystemOptions,
	): Promise<GeneratedFile[]> {
		return [];
	}

	private generatePCICompliance(
		options: PaymentSystemOptions,
	): GeneratedFile[] {
		return [
			{
				path: `${options.name}/compliance/pci.service.ts`,
				content: `import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * PCI DSS Compliance Service
 * Implements Payment Card Industry Data Security Standards
 */
@Injectable()
export class PCIComplianceService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key = Buffer.from(process.env.PCI_ENCRYPTION_KEY || '', 'hex');

  /**
   * Tokenize card data
   */
  async tokenizeCard(cardData: CardData): Promise<string> {
    // Never store actual card data
    const token = this.generateToken();
    
    // Store token mapping in secure vault
    await this.storeTokenMapping(token, cardData);
    
    return token;
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(text: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: EncryptedData): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Validate PCI compliance
   */
  async validateCompliance(): Promise<ComplianceReport> {
    return {
      compliant: true,
      level: 'SAQ-A',
      lastAssessment: new Date(),
      nextAssessment: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    };
  }

  /**
   * Generate secure token
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Store token mapping securely
   */
  private async storeTokenMapping(
    token: string,
    cardData: CardData
  ): Promise<void> {
    // Store in secure vault (e.g., HashiCorp Vault)
    console.log('Storing token mapping securely');
  }

  /**
   * Mask card number for display
   */
  maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\\s/g, '');
    const last4 = cleaned.slice(-4);
    return \`****-****-****-\${last4}\`;
  }

  /**
   * Validate card number using Luhn algorithm
   */
  validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\\s/g, '');
    
    if (!/^\\d+$/.test(cleaned)) {
      return false;
    }

    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }
}

interface CardData {
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
}

interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

interface ComplianceReport {
  compliant: boolean;
  level: string;
  lastAssessment: Date;
  nextAssessment: Date;
}`,
				type: "create",
			},
		];
	}

	private generateWebhookHandlers(
		options: PaymentSystemOptions,
	): GeneratedFile[] {
		return [
			{
				path: `${options.name}/webhooks/payment-webhook.controller.ts`,
				content: `import { 
  Controller, 
  Post, 
  Body, 
  Headers, 
  HttpCode, 
  HttpStatus,
  BadRequestException 
} from '@nestjs/common';
import { createHmac } from 'crypto';

/**
 * Payment Webhook Controller
 * Handles webhook callbacks from payment providers
 */
@Controller('webhooks/payments')
export class PaymentWebhookController {
  
  @Post('${options.provider}')
  @HttpCode(HttpStatus.OK)
  async handle${options.provider.charAt(0).toUpperCase() + options.provider.slice(1)}Webhook(
    @Body() payload: any,
    @Headers('x-signature') signature: string
  ): Promise<void> {
    // Verify webhook signature
    if (!this.verifySignature(payload, signature)) {
      throw new BadRequestException('Invalid signature');
    }

    // Process webhook based on event type
    switch (payload.event_type || payload.type) {
      case 'payment.completed':
      case 'payment_intent.succeeded':
        await this.handlePaymentCompleted(payload);
        break;
      
      case 'payment.failed':
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(payload);
        break;
      
      case 'refund.completed':
      case 'charge.refunded':
        await this.handleRefundCompleted(payload);
        break;
      
      default:
        console.log('Unhandled webhook event:', payload.event_type || payload.type);
    }
  }

  /**
   * Verify webhook signature
   */
  private verifySignature(payload: any, signature: string): boolean {
    const secret = process.env[\`\${options.provider.toUpperCase()}_WEBHOOK_SECRET\`] || '';
    const computedSignature = createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return computedSignature === signature;
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentCompleted(payload: any): Promise<void> {
    const orderId = payload.order_id || payload.metadata?.order_id;
    const amount = payload.amount;
    
    // Update order status in database
    console.log(\`Payment completed for order \${orderId}, amount: \${amount}\`);
    
    // Send confirmation email
    // Update inventory
    // Generate invoice
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(payload: any): Promise<void> {
    const orderId = payload.order_id || payload.metadata?.order_id;
    const reason = payload.failure_reason || 'Unknown';
    
    console.log(\`Payment failed for order \${orderId}, reason: \${reason}\`);
    
    // Notify customer
    // Update order status
    // Trigger retry logic if applicable
  }

  /**
   * Handle refund completion
   */
  private async handleRefundCompleted(payload: any): Promise<void> {
    const refundId = payload.refund_id || payload.id;
    const amount = payload.amount;
    
    console.log(\`Refund completed: \${refundId}, amount: \${amount}\`);
    
    // Update order status
    // Send refund confirmation
    // Update accounting records
  }
}`,
				type: "create",
			},
		];
	}
}
