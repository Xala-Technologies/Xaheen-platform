# Payment Systems Generators

## Purpose

The payment systems generators module provides comprehensive payment integration capabilities for Norwegian and European payment providers. It ensures PCI DSS compliance, implements Norwegian financial regulations, and supports various payment methods including mobile payments, bank transfers, and digital wallets.

## Architecture

```
payment-systems/
├── index.ts                          # Module exports and configuration
├── VippsGenerator.ts                 # Vipps mobile payment integration
├── KlarnaGenerator.ts                # Klarna payment solution
├── StripeGenerator.ts                # Stripe international payments
├── NetsGenerator.ts                  # Nets Nordic payment gateway
├── PayPalGenerator.ts                # PayPal global payments
├── BankTransferGenerator.ts          # Norwegian bank transfers
├── InvoiceSystemGenerator.ts         # Norwegian invoice systems
├── ComplianceGenerator.ts            # Financial compliance
├── SecurityGenerator.ts              # Payment security
├── ReconciliationGenerator.ts        # Payment reconciliation
├── templates/                        # Payment templates
│   ├── vipps/                       # Vipps integration templates
│   ├── klarna/                      # Klarna templates
│   ├── stripe/                      # Stripe templates
│   ├── nets/                        # Nets templates
│   └── compliance/                  # Compliance templates
└── types.ts                         # Payment system types
```

### Key Features

- **Norwegian Payments**: Vipps, BankAxept, Norwegian banking
- **European Compliance**: PSD2, GDPR, financial regulations
- **Security**: PCI DSS Level 1, tokenization, fraud detection
- **Multi-Currency**: NOK, EUR, USD with conversion
- **Reconciliation**: Automated financial reconciliation
- **Audit Trail**: Complete payment audit logging

## Dependencies

- `@vippsmobilepay/sdk`: Vipps MobilePay integration
- `@klarna/kco-v3`: Klarna Checkout v3
- `stripe`: Stripe payment processing
- `nets-payment-sdk`: Nets payment API
- `paypal-rest-sdk`: PayPal REST API
- `crypto`: Node.js cryptographic functions

## Usage Examples

### Vipps Payment System Generation

```typescript
import { VippsGenerator } from './VippsGenerator';

const vippsGenerator = new VippsGenerator({
  environment: 'production',
  merchantType: 'enterprise',
  complianceLevel: 'government',
  auditLogging: true
});

// Generate comprehensive Vipps payment system
const vippsSystem = await vippsGenerator.generatePaymentSystem({
  merchant: {
    serialNumber: process.env.VIPPS_MERCHANT_SERIAL,
    name: 'Norsk Offentlig Tjeneste',
    organizationNumber: '123456789',
    mcc: '9311', // Government services
    industry: 'government'
  },
  paymentTypes: [
    {
      name: 'citizenFees',
      description: 'Borgerbetaling for offentlige tjenester',
      type: 'eCommerce',
      features: {
        quickPay: true,
        recurringPayments: false,
        partialPayments: true,
        refunds: true,
        instalments: false
      },
      limits: {
        minimum: 100, // 1 NOK (in øre)
        maximum: 10000000, // 100,000 NOK (in øre)
        dailyLimit: 50000000 // 500,000 NOK per day
      },
      compliance: {
        antiMoneyLaundering: true,
        fraudDetection: 'enhanced',
        riskAssessment: 'comprehensive',
        auditLevel: 'detailed'
      }
    },
    {
      name: 'taxPayments',
      description: 'Skatteinnbetaling',
      type: 'eCommerce',
      features: {
        expressCheckout: true,
        paymentPlans: true,
        automaticReceipts: true,
        integrationWithTaxSystem: true
      },
      validation: {
        taxpayerVerification: true,
        paymentReferenceValidation: true,
        amountVerification: true
      },
      reporting: {
        realTimeReporting: true,
        taxAuthorityReporting: true,
        reconciliationReporting: true
      }
    }
  ],
  integration: {
    webhooks: {
      endpoint: 'https://api.government.no/payments/vipps/webhooks',
      events: [
        'payment.created',
        'payment.approved',
        'payment.captured',
        'payment.cancelled',
        'payment.failed',
        'refund.initiated',
        'refund.completed'
      ],
      security: {
        signatureValidation: true,
        ipWhitelist: true,
        retryLogic: 'exponential-backoff',
        failureHandling: 'alert-and-queue'
      }
    },
    apis: {
      ecommerce: {
        version: 'v2',
        endpoints: ['initiate', 'capture', 'cancel', 'refund', 'details'],
        authentication: 'oauth2-client-credentials'
      },
      recurring: {
        version: 'v2',
        endpoints: ['agreements', 'charges'],
        features: ['agreement-management', 'charge-scheduling']
      }
    },
    backoffice: {
      reconciliation: 'automated',
      reporting: 'real-time',
      monitoring: 'comprehensive',
      alerting: 'critical-events'
    }
  },
  security: {
    encryption: {
      paymentData: 'aes-256-gcm',
      customerData: 'field-level-encryption',
      communicationChannels: 'tls-1.3'
    },
    authentication: {
      apiKeys: 'rotated-monthly',
      oauth2: 'client-credentials-flow',
      webhooks: 'hmac-sha256-signature'
    },
    compliance: {
      pciDss: 'level-1',
      gdpr: 'full-compliance',
      norwegianDataProtection: 'strict',
      auditTrail: 'comprehensive'
    }
  }
});

console.log('Generated Vipps payment system:', vippsSystem.components);
console.log('Security configuration:', vippsSystem.security);
console.log('Compliance features:', vippsSystem.compliance);
```

### Klarna Payment Integration

```typescript
import { KlarnaGenerator } from './KlarnaGenerator';

const klarnaGenerator = new KlarnaGenerator({
  region: 'eu',
  environment: 'production',
  complianceMode: 'european',
  localization: 'norwegian'
});

// Generate Klarna payment integration
const klarnaIntegration = await klarnaGenerator.generatePaymentIntegration({
  merchant: {
    id: process.env.KLARNA_MERCHANT_ID,
    name: 'Norsk E-handel AS',
    country: 'NO',
    currency: 'NOK',
    locale: 'nb-NO'
  },
  products: [
    {
      name: 'checkout',
      type: 'klarna-checkout',
      features: {
        buyNowPayLater: true,
        payInParts: true,
        payNow: true,
        giftCards: false
      },
      customization: {
        colorScheme: 'norwegian-blue',
        logoUrl: 'https://example.no/logo.png',
        termsUrl: 'https://example.no/terms',
        privacyUrl: 'https://example.no/privacy'
      }
    },
    {
      name: 'payments',
      type: 'klarna-payments',
      categories: ['pay_later', 'pay_over_time', 'pay_now', 'direct_bank_transfer'],
      norwegianFeatures: {
        bankIdVerification: true,
        norwegianBankTransfer: true,
        vippsIntegration: false // Klarna doesn't integrate with Vipps
      }
    }
  ],
  orderManagement: {
    fulfillment: 'automatic-on-payment',
    shipping: {
      carriers: ['posten', 'bring', 'dhl'],
      tracking: 'automatic',
      deliveryOptions: ['home', 'pickup-point', 'express']
    },
    returns: {
      policy: '14-day-return',
      process: 'automated',
      refunds: 'automatic-to-source'
    }
  },
  compliance: {
    psd2: {
      strongCustomerAuth: true,
      transactionRiskAnalysis: true,
      exemptionHandling: 'automatic'
    },
    gdpr: {
      consentManagement: true,
      dataMinimization: true,
      rightToBeforgotten: true,
      dataPortability: true
    },
    norwegianConsumerLaw: {
      angrefrist: '14-days', // Right of withdrawal
      forbrukerkjop: 'compliant',
      reklamasjonsrett: '2-years'
    }
  }
});
```

### Stripe Norwegian Integration

```typescript
import { StripeGenerator } from './StripeGenerator';

const stripeGenerator = new StripeGenerator({
  region: 'europe',
  dataResidency: 'eu',
  strongCustomerAuth: true,
  norwegianSupport: true
});

// Generate Stripe integration with Norwegian features
const stripeIntegration = await stripeGenerator.generatePaymentSystem({
  account: {
    country: 'NO',
    currency: 'nok',
    businessType: 'company',
    companyStructure: 'as' // Norwegian AS (Aksjeselskap)
  },
  paymentMethods: [
    {
      type: 'card',
      brands: ['visa', 'mastercard', 'american_express'],
      features: {
        '3d_secure': 'required',
        'dynamic_3ds': true,
        'network_tokens': true,
        'cvc_verification': true
      },
      norwegianFeatures: {
        'bbs_cards': true, // Norwegian BankAxept
        'norwegian_banks': ['dnb', 'nordea', 'handelsbanken', 'sparebank1']
      }
    },
    {
      type: 'sepa_debit',
      countries: ['NO', 'SE', 'DK', 'FI', 'DE', 'FR'],
      verification: 'instant',
      mandateHandling: 'automatic'
    },
    {
      type: 'bancontact',
      countries: ['BE'],
      redirect: true
    },
    {
      type: 'eps',
      countries: ['AT'],
      redirect: true
    }
  ],
  features: {
    subscriptions: {
      billing: 'flexible',
      trials: true,
      proration: 'automatic',
      invoicing: 'automatic',
      norwegianInvoicing: {
        ehf: true, // Norwegian EHF format
        kid: true, // Norwegian KID reference
        ocr: true, // OCR line for bank transfers
        factoring: false
      }
    },
    marketplace: {
      enabled: false,
      onboarding: 'express',
      payouts: 'automatic'
    },
    radar: {
      fraudPrevention: 'enhanced',
      machinelearning: true,
      ruleEngine: 'custom',
      norwegianFraudPatterns: true
    }
  },
  webhooks: {
    endpoint: 'https://api.example.no/stripe/webhooks',
    events: [
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'invoice.payment_succeeded',
      'invoice.payment_failed'
    ],
    signature_verification: true,
    idempotency: true
  },
  compliance: {
    pci: 'level_1',
    sca: 'strict',
    data_residency: 'eu',
    norwegian_regulations: {
      finanstilsynet: 'compliant',
      money_laundering_act: 'compliant',
      payment_services_act: 'compliant'
    }
  }
});
```

### Norwegian Invoice System Generation

```typescript
import { InvoiceSystemGenerator } from './InvoiceSystemGenerator';

const invoiceGenerator = new InvoiceSystemGenerator({
  provider: 'multiple', // Support multiple invoice providers
  format: 'ehf', // Norwegian EHF standard
  compliance: 'norwegian_accounting_act',
  integration: 'accounting_systems'
});

// Generate Norwegian invoice system
const invoiceSystem = await invoiceGenerator.generateInvoiceSystem({
  business: {
    organizationNumber: '123456789',
    name: 'Norsk Bedrift AS',
    vatNumber: 'NO123456789MVA',
    address: {
      street: 'Bedriftsveien 1',
      postalCode: '0123',
      city: 'Oslo',
      country: 'NO'
    },
    bankAccount: {
      number: '12345678901',
      iban: 'NO9386011117947',
      swift: 'DNBANOKKXXX'
    }
  },
  invoiceProviders: [
    {
      name: 'visma',
      type: 'cloud',
      integration: 'api',
      features: {
        automaticInvoicing: true,
        recurringInvoices: true,
        creditNotes: true,
        reminderProcess: true,
        collectionProcess: true,
        ehfGeneration: true,
        eInvoicing: true
      },
      configuration: {
        apiUrl: 'https://api.vismaonline.com/v2',
        authentication: 'oauth2',
        webhooks: true,
        batchProcessing: true
      }
    },
    {
      name: 'tripletex',
      type: 'cloud',
      integration: 'api',
      features: {
        timeTracking: true,
        projectInvoicing: true,
        hourlyRateInvoicing: true,
        subscriptionInvoicing: true,
        accountingIntegration: true
      }
    },
    {
      name: 'poweroffice',
      type: 'on-premise',
      integration: 'file-based',
      features: {
        localProcessing: true,
        offlineCapability: true,
        customReports: true
      }
    }
  ],
  paymentIntegration: {
    methods: ['bank_transfer', 'vipps', 'card'],
    bankTransfer: {
      kidGeneration: true, // Norwegian KID reference
      ocrLine: true,
      qrCode: true,
      bankIntegration: ['dnb', 'nordea', 'sparebank1']
    },
    vipps: {
      invoiceVipps: true,
      recurringPayments: true,
      installmentPlans: false
    },
    cards: {
      provider: 'nets',
      types: ['visa', 'mastercard', 'bankaxept'],
      securePay: true
    }
  },
  compliance: {
    norwegianAccountingAct: {
      invoiceNumbering: 'sequential',
      requiredFields: 'full_compliance',
      vatHandling: 'automatic',
      retention: '5_years'
    },
    ehfStandard: {
      version: '3.0',
      xmlGeneration: true,
      digitallySigned: true,
      archiving: 'long_term'
    },
    gdpr: {
      dataMinimization: true,
      consentTracking: false, // Not required for invoicing
      dataRetention: 'legal_requirement',
      customerDataHandling: 'secure'
    }
  },
  automation: {
    invoiceGeneration: {
      fromOrders: true,
      fromTimeTracking: true,
      fromSubscriptions: true,
      fromContracts: true
    },
    paymentMatching: {
      automatic: true,
      kidMatching: true,
      ocrMatching: true,
      amountMatching: true,
      fuzzyMatching: false
    },
    reminders: {
      automatic: true,
      escalation: 'three_step',
      customization: 'per_customer',
      legalProcess: 'inkasso_integration'
    }
  }
});
```

## Norwegian Financial Compliance

### PSD2 Compliance Generator

```typescript
class PSD2ComplianceGenerator {
  async generatePSD2Compliance(config: PSD2Config): Promise<PSD2Compliance> {
    return {
      strongCustomerAuthentication: {
        implementation: 'dynamic_linking',
        factors: ['knowledge', 'possession', 'inherence'],
        exemptions: {
          lowValue: { threshold: 30, currency: 'EUR' },
          trustedBeneficiaries: true,
          corporatePayments: true,
          lowRisk: 'transaction_risk_analysis'
        },
        fallback: 'mandatory'
      },
      accountInformationServices: {
        consentManagement: {
          validity: '90_days',
          renewal: 'explicit',
          granularity: 'account_level',
          revocation: 'immediate'
        },
        dataAccess: {
          realTime: true,
          historicalData: '90_days',
          balance: 'real_time',
          transactions: 'real_time'
        }
      },
      paymentInitiationServices: {
        authentication: 'sca_required',
        confirmation: 'explicit',
        riskAssessment: 'mandatory',
        fraudPrevention: 'real_time'
      },
      norwegianImplementation: {
        finanstilsynet: 'registered_agent',
        bankId: 'integrated',
        norwegianBanks: 'full_support',
        regulations: 'financial_contracts_act'
      },
      technicalStandards: {
        berlin_group: 'v1.3.8',
        open_banking_uk: false,
        stet: false,
        norwegian_standard: 'bits_psd2'
      }
    };
  }
}
```

### Anti-Money Laundering (AML)

```typescript
class AMLComplianceGenerator {
  async generateAMLCompliance(config: AMLConfig): Promise<AMLCompliance> {
    return {
      customerDueDiligence: {
        kycRequirements: {
          identification: 'government_id',
          verification: 'bankid_required',
          riskAssessment: 'automatic',
          ongoing_monitoring: 'continuous'
        },
        enhancedDueDiligence: {
          triggers: ['high_risk_countries', 'large_transactions', 'pep_screening'],
          documentation: 'source_of_funds',
          approval: 'senior_management'
        },
        simplifiedDueDiligence: {
          criteria: ['eu_institutions', 'listed_companies', 'regulated_entities'],
          reduced_measures: 'risk_based'
        }
      },
      transactionMonitoring: {
        realTime: true,
        riskScoring: 'ml_based',
        thresholds: {
          cash: { amount: 15000, currency: 'NOK' },
          suspicious: { amount: 100000, currency: 'NOK' }
        },
        patterns: [
          'structuring',
          'rapid_movement',
          'unusual_geography',
          'round_numbers',
          'cash_intensive'
        ]
      },
      reporting: {
        str: { // Suspicious Transaction Report
          authority: 'okokrim',
          timeLimit: '24_hours',
          format: 'goaml',
          secure_transmission: true
        },
        ctr: { // Currency Transaction Report
          threshold: 15000,
          currency: 'NOK',
          reporting: 'automatic'
        }
      },
      norwegianSpecifics: {
        hvitvaskingsloven: 'full_compliance',
        okokrim_integration: true,
        fatf_recommendations: 'implemented',
        eu_directives: ['4amld', '5amld', '6amld']
      }
    };
  }
}
```

### Norwegian Tax Compliance

```typescript
class TaxComplianceGenerator {
  async generateTaxCompliance(paymentType: PaymentType): Promise<TaxCompliance> {
    return {
      vatHandling: {
        rates: {
          standard: 25,
          reduced: [15, 12],
          zero: 0,
          exempt: null
        },
        calculation: 'automatic',
        reporting: 'bimonthly',
        submission: 'altinn_integration'
      },
      incomeReporting: {
        aordningen: {
          monthly_reporting: true,
          real_time_income: true,
          employer_contributions: true,
          withholding_tax: true
        },
        control_information: {
          bank_deposits: true,
          cash_payments: true,
          foreign_payments: true
        }
      },
      paymentServicesTax: {
        financial_transactions_tax: false, // Norway doesn't have FTT
        stamp_duty: false,
        processing_fees: 'deductible'
      },
      crossBorderPayments: {
        eu_payments: 'seamless',
        third_country_payments: 'additional_reporting',
        currency_conversion: 'market_rate',
        documentation: 'enhanced'
      }
    };
  }
}
```

## Testing

### Unit Tests

```typescript
describe('Payment Systems Generators', () => {
  describe('VippsGenerator', () => {
    let generator: VippsGenerator;
    
    beforeEach(() => {
      generator = new VippsGenerator({
        environment: 'test',
        complianceLevel: 'basic'
      });
    });
    
    it('should generate Vipps payment integration', async () => {
      const system = await generator.generatePaymentSystem({
        merchant: {
          serialNumber: 'test-merchant',
          name: 'Test Merchant'
        },
        paymentTypes: [{
          name: 'test-payment',
          type: 'eCommerce'
        }]
      });
      
      expect(system.components).toHaveProperty('api');
      expect(system.components).toHaveProperty('webhooks');
      expect(system.security.encryption).toBeDefined();
      expect(system.compliance.pciDss).toBe('level-1');
    });
    
    it('should validate Norwegian merchant requirements', async () => {
      const validation = await generator.validateMerchant({
        organizationNumber: '123456789',
        industry: 'government'
      });
      
      expect(validation.valid).toBe(true);
      expect(validation.requirements.bankid).toBe(true);
      expect(validation.requirements.auditLogging).toBe(true);
    });
  });
  
  describe('PSD2ComplianceGenerator', () => {
    it('should generate PSD2 compliant payment flow', async () => {
      const psd2Generator = new PSD2ComplianceGenerator();
      const compliance = await psd2Generator.generatePSD2Compliance({
        strongCustomerAuth: true,
        norwegianBanks: true
      });
      
      expect(compliance.strongCustomerAuthentication).toBeDefined();
      expect(compliance.strongCustomerAuthentication.factors).toHaveLength(3);
      expect(compliance.norwegianImplementation.bankId).toBe('integrated');
    });
  });
});
```

### Integration Tests

```typescript
describe('Payment Integration Tests', () => {
  it('should process end-to-end Vipps payment', async () => {
    const vippsSystem = await createTestVippsSystem();
    
    // Initiate payment
    const payment = await vippsSystem.initiatePayment({
      amount: 10000, // 100 NOK
      currency: 'NOK',
      orderId: 'test-order-12345'
    });
    
    expect(payment.vippsUrl).toBeDefined();
    expect(payment.orderId).toBe('test-order-12345');
    
    // Simulate payment approval (in test environment)
    const status = await vippsSystem.getPaymentStatus(payment.orderId);
    expect(status.state).toBe('AUTHORIZED');
    
    // Capture payment
    const capture = await vippsSystem.capturePayment(payment.orderId);
    expect(capture.success).toBe(true);
  });
  
  it('should handle Norwegian invoice generation', async () => {
    const invoiceSystem = await createTestInvoiceSystem();
    
    const invoice = await invoiceSystem.createInvoice({
      customer: {
        organizationNumber: '987654321',
        name: 'Test Customer AS'
      },
      items: [{
        description: 'Test Service',
        quantity: 1,
        unitPrice: 1000,
        vatRate: 25
      }]
    });
    
    expect(invoice.invoiceNumber).toBeDefined();
    expect(invoice.ehfXml).toBeDefined();
    expect(invoice.kidReference).toMatch(/^\d{15}$/);
  });
});
```

## Security and Compliance

### Payment Security

```typescript
class PaymentSecurityGenerator {
  generatePaymentSecurity(level: SecurityLevel): PaymentSecurity {
    return {
      tokenization: {
        sensitiveData: ['card_number', 'cvv', 'bank_account'],
        tokenFormat: 'format_preserving',
        detokenization: 'authorized_only',
        keyRotation: 'monthly'
      },
      encryption: {
        algorithms: ['aes-256-gcm', 'rsa-2048'],
        keyManagement: level === 'government' ? 'hsm' : 'software',
        dataInTransit: 'tls-1.3',
        dataAtRest: 'field-level'
      },
      fraudPrevention: {
        realTimeScoring: true,
        deviceFingerprinting: true,
        behaviouralAnalysis: true,
        velocityChecks: true,
        geolocationVerification: true
      },
      compliance: {
        pciDss: 'level-1',
        iso27001: true,
        norwegianDataProtection: true,
        gdprCompliant: true
      }
    };
  }
}
```

## Contributing

### Development Guidelines

1. **Security First**: Implement comprehensive payment security
2. **Norwegian Focus**: Prioritize Norwegian payment methods
3. **Compliance**: Ensure PCI DSS and financial regulations compliance
4. **Testing**: Include thorough payment flow testing
5. **Documentation**: Provide clear integration documentation
6. **Monitoring**: Implement comprehensive payment monitoring
7. **Error Handling**: Provide robust error handling and recovery

### Payment Provider Integration

- Follow official provider SDKs and APIs
- Implement proper webhook handling
- Include comprehensive error handling
- Support Norwegian language and currency
- Implement proper audit logging
- Ensure PCI DSS compliance
- Include fraud prevention measures