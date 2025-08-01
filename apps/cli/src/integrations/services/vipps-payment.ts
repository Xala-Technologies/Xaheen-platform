import { z } from 'zod';
import type { GenerationResult } from '../../types.js';

/**
 * Vipps Payment SDK Configuration and Generation
 * 
 * Implements the Norwegian Vipps payment service integration
 * for e-commerce and payment processing
 */

// Vipps Payment configuration schema
const vippsPaymentOptionsSchema = z.object({
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  subscriptionKey: z.string().optional(),
  merchantSerialNumber: z.string().optional(),
  environment: z.enum(['test', 'production']).default('test'),
  currency: z.string().default('NOK'),
  includeRefunds: z.boolean().default(true),
  includeVAT: z.boolean().default(true),
  includeWebhooks: z.boolean().default(true),
  includeRecurring: z.boolean().default(false),
  webhookUrl: z.string().optional(),
  callbackUrl: z.string().optional(),
  typescript: z.boolean().default(true),
  framework: z.enum(['react', 'vue', 'angular']).default('react'),
  projectName: z.string(),
  outputPath: z.string()
});

export type VippsPaymentOptions = z.infer<typeof vippsPaymentOptionsSchema>;

/**
 * Vipps SDK Configuration Helper
 */
export class VippsSdkConfig {
  private readonly testBaseUrl = 'https://apitest.vipps.no';
  private readonly productionBaseUrl = 'https://api.vipps.no';

  /**
   * Get environment-specific configuration
   */
  private getEnvironmentConfig(
    environment: 'test' | 'production',
    merchantSerialNumber: string
  ) {
    const baseUrl = environment === 'test' ? this.testBaseUrl : this.productionBaseUrl;
    
    return {
      baseUrl,
      headers: {
        'Ocp-Apim-Subscription-Key': '{{VIPPS_SUBSCRIPTION_KEY}}',
        'Merchant-Serial-Number': merchantSerialNumber,
        'Content-Type': 'application/json',
        'X-Request-Id': 'UUID', // Will be generated per request
        'X-TimeStamp': 'ISO8601', // Will be generated per request
        'X-Source-Address': '{{CLIENT_IP}}' // Optional but recommended
      },
      endpoints: {
        payments: `${baseUrl}/ecomm/v2/payments`,
        capture: `${baseUrl}/ecomm/v2/payments/:orderId/capture`,
        cancel: `${baseUrl}/ecomm/v2/payments/:orderId/cancel`,
        refund: `${baseUrl}/ecomm/v2/payments/:orderId/refund`,
        details: `${baseUrl}/ecomm/v2/payments/:orderId/details`,
        status: `${baseUrl}/ecomm/v2/payments/:orderId/status`,
        // Recurring payments
        agreements: `${baseUrl}/recurring/v3/agreements`,
        charges: `${baseUrl}/recurring/v3/agreements/:agreementId/charges`
      }
    };
  }

  /**
   * Generate SDK configuration code
   */
  generateConfig(options: VippsPaymentOptions): string {
    const config = this.getEnvironmentConfig(
      options.environment,
      options.merchantSerialNumber || 'MSN'
    );

    return `
// Vipps Payment Configuration
export const vippsConfig = {
  environment: '${options.environment}',
  baseUrl: '${config.baseUrl}',
  merchantSerialNumber: process.env.VIPPS_MERCHANT_SERIAL_NUMBER || '${options.merchantSerialNumber}',
  clientId: process.env.VIPPS_CLIENT_ID || '${options.clientId}',
  clientSecret: process.env.VIPPS_CLIENT_SECRET || '${options.clientSecret}',
  subscriptionKey: process.env.VIPPS_SUBSCRIPTION_KEY || '${options.subscriptionKey}',
  currency: '${options.currency}',
  endpoints: ${JSON.stringify(config.endpoints, null, 2)},
  webhookUrl: '${options.webhookUrl || '/api/webhooks/vipps'}',
  callbackUrl: '${options.callbackUrl || '/payment/callback'}'
};`;
  }
}

/**
 * Generate Vipps Payment Component
 */
export async function generateVippsPaymentComponent(
  options: VippsPaymentOptions
): Promise<GenerationResult> {
  const config = new VippsSdkConfig();
  const files = new Map<string, string>();

  // Generate main Vipps payment component
  if (options.framework === 'react') {
    const componentContent = `
import React, { useState, useCallback } from 'react';
import { VippsPaymentService } from '../services/vipps-payment';
${options.typescript ? "import type { PaymentRequest, PaymentResponse } from '../types/vipps';" : ''}

${options.typescript ? `
interface VippsPaymentProps {
  amount: number;
  orderId: string;
  productName: string;
  onSuccess?: (payment: PaymentResponse) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
}
` : ''}

export const VippsPayment${options.typescript ? ': React.FC<VippsPaymentProps>' : ''} = ({ 
  amount, 
  orderId, 
  productName,
  onSuccess,
  onError,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState${options.typescript ? '<string | null>' : ''}(null);
  const vippsService = new VippsPaymentService();

  const initiatePayment = useCallback(async () => {
    setLoading(true);
    try {
      const paymentRequest${options.typescript ? ': PaymentRequest' : ''} = {
        merchantInfo: {
          merchantSerialNumber: vippsService.config.merchantSerialNumber,
          callbackPrefix: vippsService.config.callbackUrl,
          fallBack: \`\${window.location.origin}/payment/result?orderId=\${orderId}\`
        },
        customerInfo: {
          mobileNumber: '' // Will be entered in Vipps app
        },
        transaction: {
          orderId,
          amount: amount * 100, // Amount in øre
          transactionText: productName,
          ${options.includeVAT ? 'includeVAT: true,' : ''}
        }
      };

      const response = await vippsService.initiatePayment(paymentRequest);
      
      if (response.url) {
        setPaymentUrl(response.url);
        // Redirect to Vipps
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      onError?.(error${options.typescript ? ' as Error' : ''});
    } finally {
      setLoading(false);
    }
  }, [amount, orderId, productName, onError]);

  return (
    <div className="vipps-payment-container max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <img 
          src="/vipps-logo.svg" 
          alt="Vipps" 
          className="h-12 mx-auto mb-4"
        />
        <h2 className="text-2xl font-bold text-gray-900">Betal med Vipps</h2>
        <p className="text-gray-600 mt-2">Rask og sikker betaling</p>
      </div>

      <div className="border-t border-b border-gray-200 py-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Produkt:</span>
          <span className="font-medium">{productName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Beløp:</span>
          <span className="text-2xl font-bold text-vipps-orange">
            {amount.toLocaleString('nb-NO')} kr
          </span>
        </div>
        ${options.includeVAT ? `
        <div className="flex justify-between items-center text-sm text-gray-500 mt-1">
          <span>Inkl. MVA</span>
          <span>{(amount * 0.25).toLocaleString('nb-NO')} kr</span>
        </div>
        ` : ''}
      </div>

      <button
        onClick={initiatePayment}
        disabled={loading}
        className="w-full bg-vipps-orange hover:bg-vipps-orange-dark text-white font-bold py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Behandler...
          </>
        ) : (
          'Betal med Vipps'
        )}
      </button>

      <div className="mt-4 text-center">
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-800 underline text-sm"
        >
          Avbryt betaling
        </button>
      </div>

      <div className="mt-6 flex items-center justify-center space-x-4 text-xs text-gray-500">
        <span>🔒 Sikker betaling</span>
        <span>•</span>
        <span>📱 Mobil verifisering</span>
        <span>•</span>
        <span>🇳🇴 Norsk</span>
      </div>
    </div>
  );
};`;

    files.set('components/VippsPayment.tsx', componentContent);

    // Generate payment status component
    const statusComponent = `
import React, { useEffect, useState } from 'react';
import { VippsPaymentService } from '../services/vipps-payment';
${options.typescript ? "import type { PaymentDetails } from '../types/vipps';" : ''}

${options.typescript ? `
interface VippsPaymentStatusProps {
  orderId: string;
  onComplete?: (status: PaymentDetails) => void;
}
` : ''}

export const VippsPaymentStatus${options.typescript ? ': React.FC<VippsPaymentStatusProps>' : ''} = ({ 
  orderId,
  onComplete
}) => {
  const [status, setStatus] = useState${options.typescript ? '<PaymentDetails | null>' : ''}(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState${options.typescript ? '<string | null>' : ''}(null);
  const vippsService = new VippsPaymentService();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const details = await vippsService.getPaymentDetails(orderId);
        setStatus(details);
        
        if (details.status === 'SALE' || details.status === 'RESERVE') {
          onComplete?.(details);
        }
      } catch (err) {
        setError('Kunne ikke hente betalingsstatus');
        console.error('Status check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    // Check immediately
    checkStatus();

    // Poll every 2 seconds for updates
    const interval = setInterval(checkStatus, 2000);

    return () => clearInterval(interval);
  }, [orderId, onComplete]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-vipps-orange mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600">Venter på betalingsbekreftelse...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-xl">
        <div className="flex items-center">
          <span className="text-2xl mr-3">❌</span>
          <div>
            <h3 className="font-bold text-red-800">Feil</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = {
    INITIATE: { icon: '⏳', text: 'Betaling startet', color: 'blue' },
    REGISTER: { icon: '📝', text: 'Registrert', color: 'blue' },
    RESERVE: { icon: '✅', text: 'Betaling godkjent', color: 'green' },
    SALE: { icon: '✅', text: 'Betaling fullført', color: 'green' },
    CANCEL: { icon: '❌', text: 'Betaling avbrutt', color: 'red' },
    REFUND: { icon: '↩️', text: 'Refundert', color: 'orange' },
    VOID: { icon: '🚫', text: 'Annullert', color: 'gray' }
  };

  const config = statusConfig[status?.status || 'INITIATE'];

  return (
    <div className={\`p-6 bg-\${config.color}-50 rounded-xl\`}>
      <div className="flex items-center mb-4">
        <span className="text-3xl mr-3">{config.icon}</span>
        <div>
          <h3 className={\`font-bold text-\${config.color}-800 text-xl\`}>
            {config.text}
          </h3>
          <p className={\`text-\${config.color}-600\`}>
            Ordre: {orderId}
          </p>
        </div>
      </div>

      {status && (
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Beløp:</span>
            <span className="font-medium">
              {(status.amount / 100).toLocaleString('nb-NO')} kr
            </span>
          </div>
          {status.capturedAmount && (
            <div className="flex justify-between">
              <span className="text-gray-600">Belastet:</span>
              <span className="font-medium">
                {(status.capturedAmount / 100).toLocaleString('nb-NO')} kr
              </span>
            </div>
          )}
          {status.refundedAmount && (
            <div className="flex justify-between">
              <span className="text-gray-600">Refundert:</span>
              <span className="font-medium">
                {(status.refundedAmount / 100).toLocaleString('nb-NO')} kr
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};`;

    files.set('components/VippsPaymentStatus.tsx', statusComponent);
  }

  return {
    success: true,
    files,
    message: 'Vipps payment components generated successfully'
  };
}

/**
 * Generate Vipps Payment Service
 */
export async function generateVippsPaymentService(
  options: VippsPaymentOptions
): Promise<GenerationResult> {
  const config = new VippsSdkConfig();
  const files = new Map<string, string>();

  // Generate Vipps configuration
  files.set('config/vipps.config.ts', config.generateConfig(options));

  // Generate main service file
  const serviceContent = `
${options.typescript ? `
import type { 
  PaymentRequest, 
  PaymentResponse, 
  PaymentDetails,
  CaptureRequest,
  RefundRequest,
  RecurringAgreement,
  ChargeRequest
} from '../types/vipps';
` : ''}
import { v4 as uuidv4 } from 'uuid';
import { vippsConfig } from '../config/vipps.config';

/**
 * Vipps Payment Service
 * Handles all Vipps payment operations including recurring payments
 */
export class VippsPaymentService {
  private accessToken${options.typescript ? ': string | null' : ''} = null;
  private tokenExpiry${options.typescript ? ': Date | null' : ''} = null;
  public readonly config = vippsConfig;

  /**
   * Get access token for API requests
   */
  private async getAccessToken()${options.typescript ? ': Promise<string>' : ''} {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      const response = await fetch(\`\${this.config.baseUrl}/accesstoken/get\`, {
        method: 'POST',
        headers: {
          'client_id': this.config.clientId,
          'client_secret': this.config.clientSecret,
          'Ocp-Apim-Subscription-Key': this.config.subscriptionKey
        }
      });

      if (!response.ok) {
        throw new Error(\`Token request failed: \${response.statusText}\`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + (data.expires_in - 60) * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('Failed to get access token:', error);
      throw error;
    }
  }

  /**
   * Create request headers
   */
  private async createHeaders()${options.typescript ? ': Promise<HeadersInit>' : ''} {
    const token = await this.getAccessToken();
    
    return {
      'Authorization': \`Bearer \${token}\`,
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
      'Merchant-Serial-Number': this.config.merchantSerialNumber,
      'X-Request-Id': uuidv4(),
      'X-TimeStamp': new Date().toISOString()
    };
  }

  /**
   * Initiate a payment
   */
  async initiatePayment(request${options.typescript ? ': PaymentRequest' : ''})${options.typescript ? ': Promise<PaymentResponse>' : ''} {
    try {
      const headers = await this.createHeaders();
      
      const response = await fetch(this.config.endpoints.payments, {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Payment initiation failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Payment initiation error:', error);
      throw error;
    }
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(orderId${options.typescript ? ': string' : ''})${options.typescript ? ': Promise<PaymentDetails>' : ''} {
    try {
      const headers = await this.createHeaders();
      const url = this.config.endpoints.details.replace(':orderId', orderId);

      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to get payment details');
      }

      return await response.json();
    } catch (error) {
      console.error('Get payment details error:', error);
      throw error;
    }
  }

  /**
   * Capture a payment
   */
  async capturePayment(
    orderId${options.typescript ? ': string' : ''}, 
    request${options.typescript ? ': CaptureRequest' : ''}
  )${options.typescript ? ': Promise<void>' : ''} {
    try {
      const headers = await this.createHeaders();
      const url = this.config.endpoints.capture.replace(':orderId', orderId);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error('Payment capture failed');
      }
    } catch (error) {
      console.error('Payment capture error:', error);
      throw error;
    }
  }

  /**
   * Cancel a payment
   */
  async cancelPayment(orderId${options.typescript ? ': string' : ''})${options.typescript ? ': Promise<void>' : ''} {
    try {
      const headers = await this.createHeaders();
      const url = this.config.endpoints.cancel.replace(':orderId', orderId);

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          merchantInfo: {
            merchantSerialNumber: this.config.merchantSerialNumber
          },
          transaction: {
            transactionText: 'Payment cancelled'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Payment cancellation failed');
      }
    } catch (error) {
      console.error('Payment cancel error:', error);
      throw error;
    }
  }

  ${options.includeRefunds ? `
  /**
   * Refund a payment
   */
  async refundPayment(
    orderId${options.typescript ? ': string' : ''}, 
    request${options.typescript ? ': RefundRequest' : ''}
  )${options.typescript ? ': Promise<void>' : ''} {
    try {
      const headers = await this.createHeaders();
      const url = this.config.endpoints.refund.replace(':orderId', orderId);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error('Payment refund failed');
      }
    } catch (error) {
      console.error('Payment refund error:', error);
      throw error;
    }
  }` : ''}

  ${options.includeRecurring ? `
  /**
   * Create a recurring payment agreement
   */
  async createRecurringAgreement(
    agreement${options.typescript ? ': RecurringAgreement' : ''}
  )${options.typescript ? ': Promise<any>' : ''} {
    try {
      const headers = await this.createHeaders();

      const response = await fetch(this.config.endpoints.agreements, {
        method: 'POST',
        headers,
        body: JSON.stringify(agreement)
      });

      if (!response.ok) {
        throw new Error('Failed to create recurring agreement');
      }

      return await response.json();
    } catch (error) {
      console.error('Create recurring agreement error:', error);
      throw error;
    }
  }

  /**
   * Charge a recurring payment
   */
  async chargeRecurringPayment(
    agreementId${options.typescript ? ': string' : ''}, 
    charge${options.typescript ? ': ChargeRequest' : ''}
  )${options.typescript ? ': Promise<any>' : ''} {
    try {
      const headers = await this.createHeaders();
      const url = this.config.endpoints.charges.replace(':agreementId', agreementId);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(charge)
      });

      if (!response.ok) {
        throw new Error('Failed to charge recurring payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Charge recurring payment error:', error);
      throw error;
    }
  }` : ''}

  ${options.includeVAT ? `
  /**
   * Calculate Norwegian VAT (MVA)
   */
  calculateVAT(
    amount${options.typescript ? ': number' : ''}, 
    vatRate${options.typescript ? ': number' : ''} = 25
  )${options.typescript ? ': { total: number; vat: number; net: number }' : ''} {
    const vatMultiplier = vatRate / 100;
    const vat = amount * vatMultiplier;
    const total = amount + vat;

    return {
      total: Math.round(total * 100) / 100,
      vat: Math.round(vat * 100) / 100,
      net: Math.round(amount * 100) / 100
    };
  }

  /**
   * Format amount for Vipps (convert to øre)
   */
  formatAmount(amount${options.typescript ? ': number' : ''})${options.typescript ? ': number' : ''} {
    return Math.round(amount * 100);
  }` : ''}
}

// Export singleton instance
export const vippsPayment = new VippsPaymentService();`;

  files.set('services/vipps-payment.ts', serviceContent);

  // Generate webhook handler if needed
  if (options.includeWebhooks) {
    const webhookContent = `
${options.typescript ? `
import type { NextApiRequest, NextApiResponse } from 'next';
import type { VippsWebhookEvent } from '../types/vipps';
` : ''}
import { vippsPayment } from '../services/vipps-payment';
import crypto from 'crypto';

/**
 * Vipps Webhook Handler
 */
export async function handleVippsWebhook(
  req${options.typescript ? ': NextApiRequest' : ''},
  res${options.typescript ? ': NextApiResponse' : ''}
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    const signature = req.headers['x-vipps-signature'];
    if (!verifyWebhookSignature(req.body, signature${options.typescript ? ' as string' : ''})) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event${options.typescript ? ': VippsWebhookEvent' : ''} = req.body;

    switch (event.event) {
      case 'PAYMENT.AUTHORIZED':
        await handlePaymentAuthorized(event);
        break;
      
      case 'PAYMENT.CAPTURED':
        await handlePaymentCaptured(event);
        break;
      
      case 'PAYMENT.CANCELLED':
        await handlePaymentCancelled(event);
        break;
      
      case 'PAYMENT.REFUNDED':
        await handlePaymentRefunded(event);
        break;

      ${options.includeRecurring ? `
      case 'AGREEMENT.CREATED':
        await handleAgreementCreated(event);
        break;
      
      case 'AGREEMENT.UPDATED':
        await handleAgreementUpdated(event);
        break;
      
      case 'AGREEMENT.STOPPED':
        await handleAgreementStopped(event);
        break;
      ` : ''}

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Verify webhook signature
 */
function verifyWebhookSignature(
  payload${options.typescript ? ': any' : ''}, 
  signature${options.typescript ? ': string' : ''}
)${options.typescript ? ': boolean' : ''} {
  // Implement signature verification based on Vipps documentation
  // This is a placeholder - actual implementation depends on Vipps webhook specs
  return true;
}

/**
 * Handle payment authorized event
 */
async function handlePaymentAuthorized(event${options.typescript ? ': VippsWebhookEvent' : ''}) {
  console.log('Payment authorized:', event.orderId);
  // Update order status in database
  // Send confirmation email
}

/**
 * Handle payment captured event
 */
async function handlePaymentCaptured(event${options.typescript ? ': VippsWebhookEvent' : ''}) {
  console.log('Payment captured:', event.orderId);
  // Fulfill order
  // Update inventory
  // Send receipt
}

/**
 * Handle payment cancelled event
 */
async function handlePaymentCancelled(event${options.typescript ? ': VippsWebhookEvent' : ''}) {
  console.log('Payment cancelled:', event.orderId);
  // Release reserved items
  // Update order status
}

/**
 * Handle payment refunded event
 */
async function handlePaymentRefunded(event${options.typescript ? ': VippsWebhookEvent' : ''}) {
  console.log('Payment refunded:', event.orderId);
  // Process refund in system
  // Update accounting
  // Send refund confirmation
}

${options.includeRecurring ? `
/**
 * Handle agreement created event
 */
async function handleAgreementCreated(event${options.typescript ? ': VippsWebhookEvent' : ''}) {
  console.log('Recurring agreement created:', event.agreementId);
  // Store agreement details
  // Set up recurring charges
}

/**
 * Handle agreement updated event
 */
async function handleAgreementUpdated(event${options.typescript ? ': VippsWebhookEvent' : ''}) {
  console.log('Recurring agreement updated:', event.agreementId);
  // Update stored agreement
}

/**
 * Handle agreement stopped event
 */
async function handleAgreementStopped(event${options.typescript ? ': VippsWebhookEvent' : ''}) {
  console.log('Recurring agreement stopped:', event.agreementId);
  // Cancel future charges
  // Update subscription status
}
` : ''}`;

    files.set('api/webhooks/vipps.ts', webhookContent);
  }

  // Generate TypeScript types if needed
  if (options.typescript) {
    const typesContent = `
/**
 * Vipps Payment Types
 */

export interface PaymentRequest {
  merchantInfo: {
    merchantSerialNumber: string;
    callbackPrefix: string;
    fallBack: string;
    authToken?: string;
    paymentType?: 'eComm Regular Payment' | 'eComm Express Payment';
    consentRemovalPrefix?: string;
    shippingDetailsPrefix?: string;
    isApp?: boolean;
  };
  customerInfo: {
    mobileNumber?: string;
  };
  transaction: {
    orderId: string;
    amount: number;
    transactionText: string;
    skipLandingPage?: boolean;
    scope?: string;
    includeVAT?: boolean;
  };
}

export interface PaymentResponse {
  orderId: string;
  url: string;
  expiresAt?: string;
}

export interface PaymentDetails {
  orderId: string;
  status: 'INITIATE' | 'REGISTER' | 'RESERVE' | 'SALE' | 'CANCEL' | 'REFUND' | 'VOID';
  amount: number;
  capturedAmount?: number;
  refundedAmount?: number;
  remainingCaptureAmount?: number;
  remainingRefundAmount?: number;
  transactionSummary?: {
    capturedAmount: number;
    refundedAmount: number;
    remainingCaptureAmount: number;
    remainingRefundAmount: number;
  };
  transactionLog?: TransactionLogEntry[];
}

export interface TransactionLogEntry {
  transactionId: string;
  operation: string;
  amount: number;
  timestamp: string;
  operationSuccess: boolean;
}

export interface CaptureRequest {
  merchantInfo: {
    merchantSerialNumber: string;
  };
  transaction: {
    amount: number;
    transactionText: string;
  };
}

export interface RefundRequest {
  merchantInfo: {
    merchantSerialNumber: string;
  };
  transaction: {
    amount: number;
    transactionText: string;
  };
}

export interface RecurringAgreement {
  interval: {
    unit: 'YEAR' | 'MONTH' | 'WEEK' | 'DAY';
    count: number;
  };
  pricing: {
    type: 'LEGACY' | 'VARIABLE' | 'CAMPAIGN';
    amount: number;
    currency: string;
    suggestedMaxAmount?: number;
  };
  merchantRedirectUrl: string;
  merchantAgreementUrl: string;
  customerPhoneNumber: string;
  productName: string;
  productDescription?: string;
}

export interface ChargeRequest {
  amount: number;
  currency: string;
  description: string;
  type: 'INITIAL' | 'RECURRING' | 'MODIFICATION' | 'UNSCHEDULED';
  transactionId: string;
  orderId: string;
}

export interface VippsWebhookEvent {
  event: string;
  orderId?: string;
  agreementId?: string;
  timestamp: string;
  data: any;
}`;

    files.set('types/vipps.ts', typesContent);
  }

  return {
    success: true,
    files,
    message: 'Vipps payment service generated successfully'
  };
}