/**
 * Payment Gateway Mock Servers
 * 
 * Mock implementations for payment service providers including
 * Stripe, PayPal, Square, and Adyen sandbox environments.
 */

import { MockServerResponse } from '../utils/test-helpers';

// Stripe API mock responses
export const stripeResponses: Record<string, MockServerResponse> = {
  // Create Customer
  'POST /v1/customers': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Request-Id': 'req_mock_stripe_request_id',
    },
    body: {
      id: 'cus_mock_customer_id',
      object: 'customer',
      created: Math.floor(Date.now() / 1000),
      email: 'test.customer@example.com',
      name: 'Test Customer',
      phone: '+4712345678',
      address: {
        line1: 'Test Street 123',
        city: 'Oslo',
        country: 'NO',
        postal_code: '0123',
      },
      metadata: {
        test_mode: 'true',
        generated_by: 'xaheen_cli_test',
      },
      default_source: null,
      invoice_prefix: 'TEST',
      livemode: false,
    },
  },
  
  // Get Customer
  'GET /v1/customers/cus_mock_customer_id': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      id: 'cus_mock_customer_id',
      object: 'customer',
      created: Math.floor(Date.now() / 1000),
      email: 'test.customer@example.com',
      name: 'Test Customer',
      phone: '+4712345678',
      livemode: false,
    },
  },
  
  // Create Payment Intent
  'POST /v1/payment_intents': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Request-Id': 'req_mock_payment_intent_request_id',
    },
    body: {
      id: 'pi_mock_payment_intent_id',
      object: 'payment_intent',
      amount: 2000, // 20.00 NOK in øre
      currency: 'nok',
      status: 'requires_payment_method',
      client_secret: 'pi_mock_payment_intent_id_secret_mock',
      created: Math.floor(Date.now() / 1000),
      customer: 'cus_mock_customer_id',
      description: 'Test payment for integration testing',
      metadata: {
        order_id: 'order_123',
        test_mode: 'true',
      },
      automatic_payment_methods: {
        enabled: true,
      },
      livemode: false,
    },
  },
  
  // Confirm Payment Intent
  'POST /v1/payment_intents/pi_mock_payment_intent_id/confirm': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      id: 'pi_mock_payment_intent_id',
      object: 'payment_intent',
      amount: 2000,
      currency: 'nok',
      status: 'succeeded',
      client_secret: 'pi_mock_payment_intent_id_secret_mock',
      created: Math.floor(Date.now() / 1000),
      customer: 'cus_mock_customer_id',
      payment_method: 'pm_mock_payment_method',
      charges: {
        object: 'list',
        data: [
          {
            id: 'ch_mock_charge_id',
            object: 'charge',
            amount: 2000,
            currency: 'nok',
            status: 'succeeded',
            paid: true,
            refunded: false,
            created: Math.floor(Date.now() / 1000),
          },
        ],
      },
      livemode: false,
    },
  },
  
  // Create Refund
  'POST /v1/refunds': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      id: 're_mock_refund_id',
      object: 'refund',
      amount: 2000,
      currency: 'nok',
      created: Math.floor(Date.now() / 1000),
      payment_intent: 'pi_mock_payment_intent_id',
      reason: 'requested_by_customer',
      status: 'succeeded',
      metadata: {
        test_refund: 'true',
      },
    },
  },
  
  // Create Subscription
  'POST /v1/subscriptions': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      id: 'sub_mock_subscription_id',
      object: 'subscription',
      created: Math.floor(Date.now() / 1000),
      customer: 'cus_mock_customer_id',
      status: 'active',
      items: {
        object: 'list',
        data: [
          {
            id: 'si_mock_subscription_item',
            object: 'subscription_item',
            price: {
              id: 'price_mock_monthly_price',
              object: 'price',
              currency: 'nok',
              unit_amount: 9900, // 99.00 NOK
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
          },
        ],
      },
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(Date.now() / 1000) + 2592000, // 30 days
      livemode: false,
    },
  },
  
  // Webhook Events
  'POST /v1/webhook_endpoints': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      id: 'we_mock_webhook_endpoint',
      object: 'webhook_endpoint',
      created: Math.floor(Date.now() / 1000),
      enabled_events: ['payment_intent.succeeded', 'payment_intent.payment_failed'],
      livemode: false,
      status: 'enabled',
      url: 'https://example.com/webhook',
    },
  },
};

// PayPal API mock responses
export const paypalResponses: Record<string, MockServerResponse> = {
  // OAuth Token
  'POST /v1/oauth2/token': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      scope: 'https://uri.paypal.com/services/invoicing https://uri.paypal.com/services/disputes/read-buyer https://uri.paypal.com/services/payments/realtimepayment https://uri.paypal.com/services/disputes/update-seller https://uri.paypal.com/services/payments/payment/authcapture openid https://uri.paypal.com/services/disputes/read-seller Braintree:Vault https://uri.paypal.com/services/payments/refund https://api.paypal.com/v1/vault/credit-card https://uri.paypal.com/services/disputes/update-buyer https://uri.paypal.com/services/identity/activities https://uri.paypal.com/services/identity/openidconnect https://api.paypal.com/v1/payments/.* https://uri.paypal.com/services/disputes/read-dispute https://api.paypal.com/v1/vault/credit-card/.*',
      access_token: 'A21AAFEkuOdB._NfIn0fR3fqZuBfdKyJ9Wks8FfwL9U4tH8XP2zXJOQHWfRxT1yxXOqHsWlHVsYxJh5l6rqR0q9ZJxQ',
      token_type: 'Bearer',
      app_id: 'APP-80W284485P519543T',
      expires_in: 32400,
      nonce: 'mock_nonce_value',
    },
  },
  
  // Create Order
  'POST /v2/checkout/orders': {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
      'PayPal-Debug-Id': 'mock_debug_id',
    },
    body: {
      id: '5O190127TN364715T',
      status: 'CREATED',
      links: [
        {
          href: 'https://api.sandbox.paypal.com/v2/checkout/orders/5O190127TN364715T',
          rel: 'self',
          method: 'GET',
        },
        {
          href: 'https://www.sandbox.paypal.com/checkoutnow?token=5O190127TN364715T',
          rel: 'approve',
          method: 'GET',
        },
        {
          href: 'https://api.sandbox.paypal.com/v2/checkout/orders/5O190127TN364715T',
          rel: 'update',
          method: 'PATCH',
        },
        {
          href: 'https://api.sandbox.paypal.com/v2/checkout/orders/5O190127TN364715T/capture',
          rel: 'capture',
          method: 'POST',
        },
      ],
    },
  },
  
  // Capture Order
  'POST /v2/checkout/orders/5O190127TN364715T/capture': {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      id: '5O190127TN364715T',
      status: 'COMPLETED',
      purchase_units: [
        {
          reference_id: 'default',
          payments: {
            captures: [
              {
                id: '1GC607681U8014714',
                status: 'COMPLETED',
                amount: {
                  currency_code: 'NOK',
                  value: '100.00',
                },
                final_capture: true,
                seller_protection: {
                  status: 'ELIGIBLE',
                  dispute_categories: ['ITEM_NOT_RECEIVED', 'UNAUTHORIZED_TRANSACTION'],
                },
                create_time: new Date().toISOString(),
                update_time: new Date().toISOString(),
              },
            ],
          },
        },
      ],
    },
  },
  
  // Create Subscription
  'POST /v1/billing/subscriptions': {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      id: 'I-BW452GLLEP1G',
      status: 'ACTIVE',
      status_update_time: new Date().toISOString(),
      plan_id: 'P-5ML4271244454362WXNWU5NQ',
      start_time: new Date().toISOString(),
      quantity: '1',
      shipping_amount: {
        currency_code: 'NOK',
        value: '0.00',
      },
      subscriber: {
        name: {
          given_name: 'Test',
          surname: 'User',
        },
        email_address: 'test.user@example.com',
      },
      billing_info: {
        outstanding_balance: {
          currency_code: 'NOK',
          value: '0.00',
        },
        cycle_executions: [
          {
            tenure_type: 'REGULAR',
            sequence: 1,
            cycles_completed: 0,
            cycles_remaining: 0,
          },
        ],
      },
      create_time: new Date().toISOString(),
      links: [
        {
          href: 'https://api.sandbox.paypal.com/v1/billing/subscriptions/I-BW452GLLEP1G/cancel',
          rel: 'cancel',
          method: 'POST',
        },
        {
          href: 'https://api.sandbox.paypal.com/v1/billing/subscriptions/I-BW452GLLEP1G',
          rel: 'edit',
          method: 'PATCH',
        },
        {
          href: 'https://api.sandbox.paypal.com/v1/billing/subscriptions/I-BW452GLLEP1G',
          rel: 'self',
          method: 'GET',
        },
      ],
    },
  },
  
  // Create Webhook
  'POST /v1/notifications/webhooks': {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      id: '0EH40505U7160970P',
      url: 'https://example.com/webhook',
      event_types: [
        {
          name: 'PAYMENT.CAPTURE.COMPLETED',
          description: 'Payment capture completed',
        },
        {
          name: 'PAYMENT.CAPTURE.DENIED',
          description: 'Payment capture denied',
        },
      ],
      links: [
        {
          href: 'https://api.sandbox.paypal.com/v1/notifications/webhooks/0EH40505U7160970P',
          rel: 'self',
          method: 'GET',
        },
        {
          href: 'https://api.sandbox.paypal.com/v1/notifications/webhooks/0EH40505U7160970P',
          rel: 'update',
          method: 'PATCH',
        },
        {
          href: 'https://api.sandbox.paypal.com/v1/notifications/webhooks/0EH40505U7160970P',
          rel: 'delete',
          method: 'DELETE',
        },
      ],
    },
  },
};

// Square API mock responses
export const squareResponses: Record<string, MockServerResponse> = {
  // Create Customer
  'POST /v2/customers': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Square-Version': '2023-10-18',
    },
    body: {
      customer: {
        id: 'JDKYHBWT1D4F8MFH63DBMEN8Y4',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        given_name: 'Test',
        family_name: 'User',
        email_address: 'test.user@example.com',
        phone_number: '+4712345678',
        address: {
          address_line_1: 'Test Street 123',
          locality: 'Oslo',
          postal_code: '0123',
          country: 'NO',
        },
        preferences: {
          email_unsubscribed: false,
        },
        creation_source: 'THIRD_PARTY',
        segment_ids: [],
        version: 1,
      },
    },
  },
  
  // Create Payment
  'POST /v2/payments': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Square-Version': '2023-10-18',
    },
    body: {
      payment: {
        id: 'R2B3Z8WMVt3EAmzYWLZvz7Y69EbZY',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        amount_money: {
          amount: 10000, // 100.00 NOK in øre
          currency: 'NOK',
        },
        status: 'COMPLETED',
        delay_duration: 'PT168H',
        source_type: 'CARD',
        card_details: {
          status: 'CAPTURED',
          card: {
            card_brand: 'VISA',
            last_4: '1111',
            exp_month: 12,
            exp_year: 2025,
            fingerprint: 'sq-1-mock-fingerprint',
            card_type: 'CREDIT',
            prepaid_type: 'NOT_PREPAID',
            bin: '411111',
          },
          entry_method: 'KEYED',
          cvv_status: 'CVV_ACCEPTED',
          avs_status: 'AVS_ACCEPTED',
          statement_description: 'SQ *TEST MERCHANT',
          card_payment_timeline: {
            authorized_at: new Date().toISOString(),
            captured_at: new Date().toISOString(),
          },
        },
        location_id: 'L88917AVBK2S5',
        order_id: 'order_id_123',
        processing_fee: [
          {
            effective_at: new Date().toISOString(),
            type: 'INITIAL',
            amount_money: {
              amount: 59,
              currency: 'NOK',
            },
          },
        ],
        total_money: {
          amount: 10000,
          currency: 'NOK',
        },
        approved_money: {
          amount: 10000,
          currency: 'NOK',
        },
        receipt_number: 'R2B3',
        receipt_url: 'https://squareup.com/receipt/preview/R2B3Z8WMVt3EAmzYWLZvz7Y69EbZY',
        delay_action: 'CANCEL',
        delayed_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        version_token: 'mock_version_token',
      },
    },
  },
  
  // Create Refund
  'POST /v2/refunds': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Square-Version': '2023-10-18',
    },
    body: {
      refund: {
        id: 'R2B3Z8WMVt3EAmzYWLZvz7Y69EbZY_refund',
        status: 'COMPLETED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        location_id: 'L88917AVBK2S5',
        amount_money: {
          amount: 10000,
          currency: 'NOK',
        },
        payment_id: 'R2B3Z8WMVt3EAmzYWLZvz7Y69EbZY',
        reason: 'Customer requested refund',
        processing_fee: [
          {
            effective_at: new Date().toISOString(),
            type: 'INITIAL',
            amount_money: {
              amount: -59,
              currency: 'NOK',
            },
          },
        ],
      },
    },
  },
  
  // Create Subscription
  'POST /v2/subscriptions': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Square-Version': '2023-10-18',
    },
    body: {
      subscription: {
        id: 'subscription_123',
        location_id: 'L88917AVBK2S5',
        plan_id: 'plan_monthly_999',
        customer_id: 'JDKYHBWT1D4F8MFH63DBMEN8Y4',
        start_date: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        tax_percentage: '25', // Norwegian VAT
        price_override_money: {
          amount: 9900,
          currency: 'NOK',
        },
        version: 1,
        created_at: new Date().toISOString(),
        invoice_request_method: 'EMAIL',
        card_id: 'ccof:mock-card-id',
        timezone: 'Europe/Oslo',
        source: {
          name: 'Xaheen Test Integration',
        },
        charged_through_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    },
  },
};

// Adyen API mock responses
export const adyenResponses: Record<string, MockServerResponse> = {
  // Create Payment
  'POST /v70/payments': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      pspReference: '8816178914079738',
      resultCode: 'Authorised',
      amount: {
        currency: 'NOK',
        value: 10000, // 100.00 NOK in øre
      },
      merchantReference: 'test_payment_123',
      paymentMethod: {
        type: 'scheme',
        brand: 'visa',
        lastFour: '1111',
        holderName: 'Test User',
      },
      additionalData: {
        'paymentMethod.variant': 'visa',
        'cardSummary.bin': '411111',
        'cardSummary.lastFour': '1111',
        'recurring.recurringDetailReference': 'mock_recurring_reference',
      },
    },
  },
  
  // Create Refund
  'POST /v70/payments/8816178914079738/refunds': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      merchantAccount: 'test_merchant_account',
      paymentPspReference: '8816178914079738',
      pspReference: '8816178914079739',
      reference: 'refund_test_123',
      status: 'received',
      amount: {
        currency: 'NOK',
        value: 10000,
      },
    },
  },
  
  // Create Payment Link
  'POST /v70/paymentLinks': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      id: 'PL3FB0B3C40A9BC46A',
      url: 'https://checkoutshopper-test.adyen.com/checkoutshopper/payByLink.shtml?d=YW1vdW50TW',
      reference: 'payment_link_test_123',
      status: 'active',
      amount: {
        currency: 'NOK',
        value: 10000,
      },
      merchantAccount: 'test_merchant_account',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      reusable: false,
      countryCode: 'NO',
      shopperLocale: 'nb_NO',
    },
  },
  
  // Create Recurring Payment
  'POST /v70/payments': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      pspReference: '8816178914079740',
      resultCode: 'Authorised',
      amount: {
        currency: 'NOK',
        value: 9900, // 99.00 NOK monthly subscription
      },
      merchantReference: 'subscription_payment_123',
      paymentMethod: {
        type: 'scheme',
        brand: 'visa',
        lastFour: '1111',
        holderName: 'Test User',
      },
      recurringProcessingModel: 'Subscription',
      additionalData: {
        'recurring.recurringDetailReference': 'mock_recurring_reference',
        'recurring.shopperReference': 'test_customer_123',
      },
    },
  },
  
  // Webhook Configuration
  'POST /v1/me/webhooks': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      id: 'webhook_test_123',
      url: 'https://example.com/webhook',
      active: true,
      description: 'Test webhook for integration',
      certificateAlias: '',
      communicationFormat: 'JSON',
      networkType: 'PUBLIC',
      eventConfigs: [
        {
          eventType: 'AUTHORISATION',
          enabled: true,
        },
        {
          eventType: 'CAPTURE',
          enabled: true,
        },
        {
          eventType: 'REFUND',
          enabled: true,
        },
      ],
    },
  },
};

// Norwegian payment providers (Vipps) mock responses
export const vippsResponses: Record<string, MockServerResponse> = {
  // Get Access Token
  'POST /accesstoken/get': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      token_type: 'Bearer',
      expires_in: 3600,
      ext_expires_in: 3600,
      expires_on: Math.floor(Date.now() / 1000) + 3600,
      not_before: Math.floor(Date.now() / 1000),
      resource: 'https://vippsas.onmicrosoft.com/vipps-ecommerce-api',
      access_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hGZyIsImtpZCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hGZyJ9.mock_vipps_token',
    },
  },
  
  // Initiate Payment
  'POST /ecomm/v2/payments': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': 'mock_request_id',
    },
    body: {
      orderId: 'test_order_123',
      url: 'https://apitest.vipps.no/dwo-api-application/v1/deeplink/vippsgateway?v=2&token=mock_token',
    },
  },
  
  // Get Payment Details
  'GET /ecomm/v2/payments/test_order_123/details': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      orderId: 'test_order_123',
      transactionInfo: {
        amount: 10000, // 100.00 NOK in øre
        status: 'RESERVED',
        timeStamp: new Date().toISOString(),
        transactionId: 'mock_transaction_id',
      },
      transactionSummary: {
        capturedAmount: 0,
        remainingAmountToCapture: 10000,
        refundedAmount: 0,
        remainingAmountToRefund: 10000,
      },
      userDetails: {
        userId: 'mock_vipps_user_id',
        mobileNumber: '12345678',
      },
    },
  },
  
  // Capture Payment
  'POST /ecomm/v2/payments/test_order_123/capture': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      orderId: 'test_order_123',
      transactionInfo: {
        amount: 10000,
        status: 'CAPTURED',
        timeStamp: new Date().toISOString(),
        transactionId: 'mock_capture_transaction_id',
      },
      transactionSummary: {
        capturedAmount: 10000,
        remainingAmountToCapture: 0,
        refundedAmount: 0,
        remainingAmountToRefund: 10000,
      },
    },
  },
  
  // Refund Payment
  'POST /ecomm/v2/payments/test_order_123/refund': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      orderId: 'test_order_123',
      transactionInfo: {
        amount: 10000,
        status: 'REFUNDED',
        timeStamp: new Date().toISOString(),
        transactionId: 'mock_refund_transaction_id',
      },
      transactionSummary: {
        capturedAmount: 10000,
        remainingAmountToCapture: 0,
        refundedAmount: 10000,
        remainingAmountToRefund: 0,
      },
    },
  },
};

// Health check responses for payment services
export const paymentHealthCheckResponses: Record<string, MockServerResponse> = {
  'GET /health': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      status: 'ok',
      service: 'payment-gateway-mock',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(Math.random() * 3600),
    },
  },
  
  'GET /v1/health': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      status: 'healthy',
      version: '1.0.0',
      environment: 'sandbox',
    },
  },
};

// Export all payment mock responses
export const paymentMockResponses = {
  stripe: stripeResponses,
  paypal: paypalResponses,
  square: squareResponses,
  adyen: adyenResponses,
  vipps: vippsResponses,
  health: paymentHealthCheckResponses,
} as const;