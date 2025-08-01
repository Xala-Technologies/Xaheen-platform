import { z } from 'zod';
import type { GenerationResult } from '../../types.js';

/**
 * Stripe Payment SDK Configuration and Generation
 * 
 * Implements Stripe payment integration for global payment processing
 * with support for multiple currencies and subscription management
 */

// Stripe configuration schema
const stripeOptionsSchema = z.object({
  publishableKey: z.string().optional(),
  secretKey: z.string().optional(),
  webhookSecret: z.string().optional(),
  currency: z.string().default('USD'),
  supportedCurrencies: z.array(z.string()).default(['USD', 'EUR', 'GBP', 'NOK']),
  includeSubscriptions: z.boolean().default(true),
  includePaymentElements: z.boolean().default(true),
  includeCheckout: z.boolean().default(true),
  includeWebhooks: z.boolean().default(true),
  includeCustomerPortal: z.boolean().default(true),
  include3DSecure: z.boolean().default(true),
  typescript: z.boolean().default(true),
  framework: z.enum(['react', 'vue', 'angular']).default('react'),
  projectName: z.string(),
  outputPath: z.string()
});

export type StripeOptions = z.infer<typeof stripeOptionsSchema>;

/**
 * Stripe SDK Configuration Helper
 */
export class StripeSdkConfig {
  /**
   * Generate SDK configuration code
   */
  generateConfig(options: StripeOptions): string {
    return `
// Stripe Configuration
export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '${options.publishableKey}',
  secretKey: process.env.STRIPE_SECRET_KEY || '${options.secretKey}',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '${options.webhookSecret}',
  currency: '${options.currency}',
  supportedCurrencies: ${JSON.stringify(options.supportedCurrencies)},
  paymentMethods: {
    card: true,
    sepa: ${options.supportedCurrencies.includes('EUR')},
    ideal: ${options.supportedCurrencies.includes('EUR')},
    googlePay: true,
    applePay: true,
    klarna: true,
    affirm: true
  },
  features: {
    subscriptions: ${options.includeSubscriptions},
    paymentElements: ${options.includePaymentElements},
    checkout: ${options.includeCheckout},
    customerPortal: ${options.includeCustomerPortal},
    threeDSecure: ${options.include3DSecure}
  },
  webhookEvents: [
    'payment_intent.succeeded',
    'payment_intent.failed',
    'payment_intent.canceled',
    'charge.succeeded',
    'charge.failed',
    ${options.includeSubscriptions ? `'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_succeeded',
    'invoice.payment_failed',` : ''}
    'checkout.session.completed'
  ]
};`;
  }
}

/**
 * Generate Stripe Payment Component
 */
export async function generateStripeComponent(
  options: StripeOptions
): Promise<GenerationResult> {
  const config = new StripeSdkConfig();
  const files = new Map<string, string>();

  // Generate main Stripe payment component
  if (options.framework === 'react') {
    const componentContent = `
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  ${options.includePaymentElements ? 'PaymentElement,' : ''}
} from '@stripe/react-stripe-js';
${options.typescript ? `import type { 
  Stripe, 
  StripeElements,
  PaymentIntent,
  StripeError 
} from '@stripe/stripe-js';` : ''}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

${options.typescript ? `
interface StripePaymentProps {
  amount: number;
  currency?: string;
  productName: string;
  onSuccess?: (paymentIntent: PaymentIntent) => void;
  onError?: (error: StripeError) => void;
}
` : ''}

const CheckoutForm${options.typescript ? ': React.FC<StripePaymentProps>' : ''} = ({ 
  amount, 
  currency = '${options.currency}',
  productName,
  onSuccess,
  onError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState${options.typescript ? '<string | null>' : ''}(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create PaymentIntent on mount
    fetch('/api/payments/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency })
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret));
  }, [amount, currency]);

  const handleSubmit = async (event${options.typescript ? ': React.FormEvent' : ''}) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);

    ${options.includePaymentElements ? `
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: \`\${window.location.origin}/payment/complete\`,
      },
      redirect: 'if_required'
    });
    ` : `
    const card = elements.getElement(CardElement);
    if (!card) return;

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card,
      }
    });
    `}

    if (result.error) {
      setError(result.error.message || 'Payment failed');
      onError?.(result.error);
    } else if (result.paymentIntent?.status === 'succeeded') {
      setError(null);
      setProcessing(false);
      setSucceeded(true);
      onSuccess?.(result.paymentIntent);
    }

    setProcessing(false);
  };

  const cardStyle = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Inter", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Complete Payment
        </h2>
        <p className="text-gray-600">
          {productName} - {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency
          }).format(amount / 100)}
        </p>
      </div>

      ${options.includePaymentElements ? `
      <div className="mb-6">
        <PaymentElement 
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay']
          }}
        />
      </div>
      ` : `
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card details
        </label>
        <div className="p-4 border-2 border-gray-200 rounded-lg focus-within:border-blue-500 transition-colors">
          <CardElement options={cardStyle} />
        </div>
      </div>
      `}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {succeeded && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">
            Payment successful! Redirecting...
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing || succeeded}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {processing ? (
          <>
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </>
        ) : (
          'Pay Now'
        )}
      </button>

      <div className="mt-6 flex items-center justify-center space-x-4 text-xs text-gray-500">
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secure payment
        </span>
        <span>•</span>
        <span>Powered by Stripe</span>
      </div>
    </form>
  );
};

export const StripePayment${options.typescript ? ': React.FC<StripePaymentProps>' : ''} = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};`;

    files.set('components/StripePayment.tsx', componentContent);

    // Generate subscription component if enabled
    if (options.includeSubscriptions) {
      const subscriptionComponent = `
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
${options.typescript ? "import type { Stripe, Price, Product } from '@stripe/stripe-js';" : ''}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

${options.typescript ? `
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  priceId: string;
  popular?: boolean;
}

interface StripeSubscriptionProps {
  plans: SubscriptionPlan[];
  customerId?: string;
  onSuccess?: (subscriptionId: string) => void;
  onError?: (error: Error) => void;
}
` : ''}

export const StripeSubscription${options.typescript ? ': React.FC<StripeSubscriptionProps>' : ''} = ({ 
  plans,
  customerId,
  onSuccess,
  onError
}) => {
  const [selectedPlan, setSelectedPlan] = useState${options.typescript ? '<SubscriptionPlan | null>' : ''}(null);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (plan${options.typescript ? ': SubscriptionPlan' : ''}) => {
    setLoading(true);
    
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe not loaded');

      // Create checkout session
      const response = await fetch('/api/payments/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.priceId,
          customerId,
          successUrl: \`\${window.location.origin}/subscription/success\`,
          cancelUrl: \`\${window.location.origin}/subscription/cancel\`
        })
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      onError?.(error${options.typescript ? ' as Error' : ''});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-xl text-gray-600">
          Select the perfect plan for your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={\`relative p-8 bg-white rounded-2xl shadow-lg border-2 \${
              plan.popular ? 'border-blue-500' : 'border-gray-200'
            } hover:shadow-xl transition-shadow\`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: plan.currency,
                    minimumFractionDigits: 0
                  }).format(plan.price / 100)}
                </span>
                <span className="text-gray-600">/{plan.interval}</span>
              </div>
            </div>

            <ul className="mb-8 space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={loading}
              className={\`w-full py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed \${
                plan.popular
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }\`}
            >
              {loading && selectedPlan?.id === plan.id ? 'Processing...' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-gray-500">
        <p>All plans include a 14-day free trial. Cancel anytime.</p>
        <p className="mt-2">
          Prices in {plans[0]?.currency || 'USD'}. 
          {${options.include3DSecure} ? ' Secure 3D authentication enabled.' : ''}
        </p>
      </div>
    </div>
  );
};`;

      files.set('components/StripeSubscription.tsx', subscriptionComponent);
    }

    // Generate checkout component if enabled
    if (options.includeCheckout) {
      const checkoutComponent = `
import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
${options.typescript ? "import type { Stripe } from '@stripe/stripe-js';" : ''}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

${options.typescript ? `
interface CheckoutItem {
  price: string;
  quantity: number;
}

interface StripeCheckoutProps {
  items: CheckoutItem[];
  mode?: 'payment' | 'subscription';
  successUrl?: string;
  cancelUrl?: string;
  customerEmail?: string;
  onError?: (error: Error) => void;
}
` : ''}

export const StripeCheckout${options.typescript ? ': React.FC<StripeCheckoutProps>' : ''} = ({ 
  items,
  mode = 'payment',
  successUrl = '/success',
  cancelUrl = '/cancel',
  customerEmail,
  onError
}) => {
  const handleCheckout = async () => {
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe not loaded');

      const response = await fetch('/api/payments/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          mode,
          successUrl: \`\${window.location.origin}\${successUrl}\`,
          cancelUrl: \`\${window.location.origin}\${cancelUrl}\`,
          customerEmail
        })
      });

      const { sessionId } = await response.json();

      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      onError?.(error${options.typescript ? ' as Error' : ''});
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
    >
      Proceed to Checkout
    </button>
  );
};`;

      files.set('components/StripeCheckout.tsx', checkoutComponent);
    }
  }

  return {
    success: true,
    files,
    message: 'Stripe payment components generated successfully'
  };
}

/**
 * Generate Stripe Payment Service
 */
export async function generateStripeService(
  options: StripeOptions
): Promise<GenerationResult> {
  const config = new StripeSdkConfig();
  const files = new Map<string, string>();

  // Generate Stripe configuration
  files.set('config/stripe.config.ts', config.generateConfig(options));

  // Generate main service file
  const serviceContent = `
${options.typescript ? `
import type { 
  Stripe,
  PaymentIntent,
  PaymentMethod,
  Customer,
  Subscription,
  Price,
  Product,
  Invoice,
  SetupIntent,
  Refund
} from 'stripe';
` : ''}
import Stripe from 'stripe';
import { stripeConfig } from '../config/stripe.config';

/**
 * Stripe Payment Service
 * Handles all Stripe payment operations
 */
export class StripePaymentService {
  private stripe${options.typescript ? ': Stripe' : ''};

  constructor() {
    this.stripe = new Stripe(stripeConfig.secretKey, {
      apiVersion: '2023-10-16',
      typescript: ${options.typescript},
      telemetry: false
    });
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(
    amount${options.typescript ? ': number' : ''},
    currency${options.typescript ? ': string' : ''} = stripeConfig.currency,
    metadata${options.typescript ? '?: Record<string, string>' : ''} = {}
  )${options.typescript ? ': Promise<PaymentIntent>' : ''} {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata
      });

      return paymentIntent;
    } catch (error) {
      console.error('Create payment intent error:', error);
      throw error;
    }
  }

  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(
    paymentIntentId${options.typescript ? ': string' : ''},
    paymentMethodId${options.typescript ? ': string' : ''}
  )${options.typescript ? ': Promise<PaymentIntent>' : ''} {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntentId,
        {
          payment_method: paymentMethodId
        }
      );

      return paymentIntent;
    } catch (error) {
      console.error('Confirm payment intent error:', error);
      throw error;
    }
  }

  /**
   * Create a setup intent for saving payment methods
   */
  async createSetupIntent(
    customerId${options.typescript ? ': string' : ''},
    metadata${options.typescript ? '?: Record<string, string>' : ''} = {}
  )${options.typescript ? ': Promise<SetupIntent>' : ''} {
    try {
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        metadata
      });

      return setupIntent;
    } catch (error) {
      console.error('Create setup intent error:', error);
      throw error;
    }
  }

  /**
   * Create a customer
   */
  async createCustomer(
    email${options.typescript ? ': string' : ''},
    name${options.typescript ? '?: string' : ''},
    metadata${options.typescript ? '?: Record<string, string>' : ''} = {}
  )${options.typescript ? ': Promise<Customer>' : ''} {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata
      });

      return customer;
    } catch (error) {
      console.error('Create customer error:', error);
      throw error;
    }
  }

  /**
   * Attach payment method to customer
   */
  async attachPaymentMethod(
    paymentMethodId${options.typescript ? ': string' : ''},
    customerId${options.typescript ? ': string' : ''}
  )${options.typescript ? ': Promise<PaymentMethod>' : ''} {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(
        paymentMethodId,
        { customer: customerId }
      );

      // Set as default payment method
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      return paymentMethod;
    } catch (error) {
      console.error('Attach payment method error:', error);
      throw error;
    }
  }

  /**
   * Create a refund
   */
  async createRefund(
    paymentIntentId${options.typescript ? ': string' : ''},
    amount${options.typescript ? '?: number' : ''},
    reason${options.typescript ? '?: string' : ''}
  )${options.typescript ? ': Promise<Refund>' : ''} {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
        reason: reason${options.typescript ? ' as Stripe.RefundCreateParams.Reason' : ''}
      });

      return refund;
    } catch (error) {
      console.error('Create refund error:', error);
      throw error;
    }
  }

  ${options.includeSubscriptions ? `
  /**
   * Create a subscription
   */
  async createSubscription(
    customerId${options.typescript ? ': string' : ''},
    priceId${options.typescript ? ': string' : ''},
    trialDays${options.typescript ? '?: number' : ''} = 0
  )${options.typescript ? ': Promise<Subscription>' : ''} {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: trialDays,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent']
      });

      return subscription;
    } catch (error) {
      console.error('Create subscription error:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId${options.typescript ? ': string' : ''},
    immediately${options.typescript ? ': boolean' : ''} = false
  )${options.typescript ? ': Promise<Subscription>' : ''} {
    try {
      if (immediately) {
        return await this.stripe.subscriptions.cancel(subscriptionId);
      } else {
        return await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        });
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
      throw error;
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    subscriptionId${options.typescript ? ': string' : ''},
    newPriceId${options.typescript ? ': string' : ''}
  )${options.typescript ? ': Promise<Subscription>' : ''} {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      
      const updatedSubscription = await this.stripe.subscriptions.update(
        subscriptionId,
        {
          items: [{
            id: subscription.items.data[0].id,
            price: newPriceId,
          }],
          proration_behavior: 'create_prorations'
        }
      );

      return updatedSubscription;
    } catch (error) {
      console.error('Update subscription error:', error);
      throw error;
    }
  }

  /**
   * Get subscription
   */
  async getSubscription(
    subscriptionId${options.typescript ? ': string' : ''}
  )${options.typescript ? ': Promise<Subscription>' : ''} {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(
        subscriptionId,
        {
          expand: ['default_payment_method', 'latest_invoice']
        }
      );

      return subscription;
    } catch (error) {
      console.error('Get subscription error:', error);
      throw error;
    }
  }` : ''}

  ${options.includeCheckout ? `
  /**
   * Create checkout session
   */
  async createCheckoutSession(
    lineItems${options.typescript ? ': Stripe.Checkout.SessionCreateParams.LineItem[]' : ''},
    mode${options.typescript ? ': Stripe.Checkout.SessionCreateParams.Mode' : ''} = 'payment',
    successUrl${options.typescript ? ': string' : ''},
    cancelUrl${options.typescript ? ': string' : ''},
    customerEmail${options.typescript ? '?: string' : ''}
  )${options.typescript ? ': Promise<Stripe.Checkout.Session>' : ''} {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode,
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: customerEmail,
        ${options.includeCustomerPortal ? 'allow_promotion_codes: true,' : ''}
        billing_address_collection: 'auto',
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'NO', 'SE', 'DK', 'FI']
        }
      });

      return session;
    } catch (error) {
      console.error('Create checkout session error:', error);
      throw error;
    }
  }` : ''}

  ${options.includeCustomerPortal ? `
  /**
   * Create customer portal session
   */
  async createPortalSession(
    customerId${options.typescript ? ': string' : ''},
    returnUrl${options.typescript ? ': string' : ''}
  )${options.typescript ? ': Promise<Stripe.BillingPortal.Session>' : ''} {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return session;
    } catch (error) {
      console.error('Create portal session error:', error);
      throw error;
    }
  }` : ''}

  /**
   * List payment methods for customer
   */
  async listPaymentMethods(
    customerId${options.typescript ? ': string' : ''}
  )${options.typescript ? ': Promise<PaymentMethod[]>' : ''} {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      console.error('List payment methods error:', error);
      throw error;
    }
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(
    paymentMethodId${options.typescript ? ': string' : ''}
  )${options.typescript ? ': Promise<PaymentMethod>' : ''} {
    try {
      const paymentMethod = await this.stripe.paymentMethods.detach(
        paymentMethodId
      );

      return paymentMethod;
    } catch (error) {
      console.error('Delete payment method error:', error);
      throw error;
    }
  }

  /**
   * Calculate application fee (if applicable)
   */
  calculateApplicationFee(
    amount${options.typescript ? ': number' : ''},
    feePercentage${options.typescript ? ': number' : ''} = 2.9,
    fixedFee${options.typescript ? ': number' : ''} = 30
  )${options.typescript ? ': number' : ''} {
    // Stripe fee calculation: 2.9% + 30¢
    return Math.round((amount * (feePercentage / 100)) + fixedFee);
  }

  /**
   * Format amount for display
   */
  formatAmount(
    amount${options.typescript ? ': number' : ''},
    currency${options.typescript ? ': string' : ''} = stripeConfig.currency
  )${options.typescript ? ': string' : ''} {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  }
}

// Export singleton instance
export const stripePayment = new StripePaymentService();`;

  files.set('services/stripe-payment.ts', serviceContent);

  // Generate webhook handler if needed
  if (options.includeWebhooks) {
    const webhookContent = `
${options.typescript ? `
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Stripe } from 'stripe';
` : ''}
import { buffer } from 'micro';
import { stripePayment } from '../services/stripe-payment';
import { stripeConfig } from '../config/stripe.config';

// Disable body parsing, need raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Stripe Webhook Handler
 */
export default async function handleStripeWebhook(
  req${options.typescript ? ': NextApiRequest' : ''},
  res${options.typescript ? ': NextApiResponse' : ''}
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature']${options.typescript ? ' as string' : ''};

  let event${options.typescript ? ': Stripe.Event' : ''};

  try {
    event = stripePayment.stripe.webhooks.constructEvent(
      buf,
      sig,
      stripeConfig.webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(\`Webhook Error: \${err${options.typescript ? ' instanceof Error ? err.message : String(err)' : '.message'}\}\`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object${options.typescript ? ' as Stripe.PaymentIntent' : ''});
        break;
      
      case 'payment_intent.failed':
        await handlePaymentIntentFailed(event.data.object${options.typescript ? ' as Stripe.PaymentIntent' : ''});
        break;
      
      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object${options.typescript ? ' as Stripe.Charge' : ''});
        break;

      ${options.includeSubscriptions ? `
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object${options.typescript ? ' as Stripe.Subscription' : ''});
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object${options.typescript ? ' as Stripe.Subscription' : ''});
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object${options.typescript ? ' as Stripe.Subscription' : ''});
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object${options.typescript ? ' as Stripe.Invoice' : ''});
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object${options.typescript ? ' as Stripe.Invoice' : ''});
        break;
      ` : ''}

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object${options.typescript ? ' as Stripe.Checkout.Session' : ''});
        break;

      default:
        console.log(\`Unhandled event type: \${event.type}\`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(
  paymentIntent${options.typescript ? ': Stripe.PaymentIntent' : ''}
) {
  console.log('Payment succeeded:', paymentIntent.id);
  
  // Update order status in database
  // Send confirmation email
  // Trigger fulfillment process
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(
  paymentIntent${options.typescript ? ': Stripe.PaymentIntent' : ''}
) {
  console.log('Payment failed:', paymentIntent.id);
  
  // Update order status
  // Send failure notification
  // Log for retry attempts
}

/**
 * Handle successful charge
 */
async function handleChargeSucceeded(
  charge${options.typescript ? ': Stripe.Charge' : ''}
) {
  console.log('Charge succeeded:', charge.id);
  
  // Record transaction
  // Update accounting records
}

${options.includeSubscriptions ? `
/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(
  subscription${options.typescript ? ': Stripe.Subscription' : ''}
) {
  console.log('Subscription created:', subscription.id);
  
  // Provision access
  // Update user account
  // Send welcome email
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(
  subscription${options.typescript ? ': Stripe.Subscription' : ''}
) {
  console.log('Subscription updated:', subscription.id);
  
  // Update access levels
  // Handle plan changes
  // Notify user of changes
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(
  subscription${options.typescript ? ': Stripe.Subscription' : ''}
) {
  console.log('Subscription deleted:', subscription.id);
  
  // Revoke access
  // Update user status
  // Send cancellation confirmation
}

/**
 * Handle invoice payment succeeded
 */
async function handleInvoicePaymentSucceeded(
  invoice${options.typescript ? ': Stripe.Invoice' : ''}
) {
  console.log('Invoice payment succeeded:', invoice.id);
  
  // Update payment records
  // Extend subscription period
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(
  invoice${options.typescript ? ': Stripe.Invoice' : ''}
) {
  console.log('Invoice payment failed:', invoice.id);
  
  // Send payment retry notification
  // Update subscription status
  // Implement dunning process
}
` : ''}

/**
 * Handle checkout session completed
 */
async function handleCheckoutSessionCompleted(
  session${options.typescript ? ': Stripe.Checkout.Session' : ''}
) {
  console.log('Checkout session completed:', session.id);
  
  // Fulfill order
  // Send receipt
  // Update inventory
}`;

    files.set('api/webhooks/stripe.ts', webhookContent);
  }

  return {
    success: true,
    files,
    message: 'Stripe payment service generated successfully'
  };
}