# Payment Providers

## Purpose

The payment providers module manages integration with Norwegian and European payment systems, ensuring compliance with PCI DSS, PSD2, and Norwegian financial regulations while providing seamless payment processing capabilities.

## Architecture

```
payment/
├── VippsProvider.ts          # Norwegian mobile payment
├── KlarnaProvider.ts         # European payment solution
├── StripeProvider.ts         # International payment processing
├── NetsProvider.ts           # Nordic payment gateway
├── PayPalProvider.ts         # Global payment system
├── InvoiceProvider.ts        # Norwegian invoice systems
├── PaymentProviderManager.ts # Payment orchestration
├── compliance/               # Financial compliance
│   ├── PCIDSSValidator.ts   # PCI DSS compliance
│   ├── PSD2Handler.ts       # European payment directive
│   └── AMLChecker.ts        # Anti-money laundering
├── security/                # Payment security
│   ├── TokenVault.ts        # Secure token storage
│   ├── FraudDetection.ts    # Fraud prevention
│   └── Encryption.ts        # Payment data encryption
├── types.ts                 # Payment types and interfaces
└── utils.ts                 # Payment utilities
```

### Key Features

- **Norwegian Payments**: Vipps, BankAxept, Norwegian invoicing
- **European Compliance**: PSD2, GDPR, Strong Customer Authentication
- **Security**: PCI DSS Level 1, tokenization, fraud detection
- **Multi-Currency**: NOK, EUR, USD with real-time conversion
- **Financial Audit**: Complete transaction logging and reporting

## Dependencies

- `@vippsmobilepay/sdk`: Vipps MobilePay integration
- `@klarna/kco-v3`: Klarna Checkout v3
- `stripe`: Stripe payment processing
- `nets-payment-sdk`: Nets payment gateway
- `paypal-rest-sdk`: PayPal payments
- `axios`: HTTP client for API calls

## Usage Examples

### Vipps Payment Integration

```typescript
import { VippsProvider } from './VippsProvider';

const vipps = new VippsProvider({
  clientId: process.env.VIPPS_CLIENT_ID,
  clientSecret: process.env.VIPPS_CLIENT_SECRET,
  subscriptionKey: process.env.VIPPS_SUBSCRIPTION_KEY,
  merchantSerialNumber: process.env.VIPPS_MERCHANT_SERIAL,
  environment: 'production', // or 'test'
  callbackUrl: 'https://your-app.no/payment/vipps/callback',
  fallbackUrl: 'https://your-app.no/payment/fallback'
});

// Initiate payment
const payment = await vipps.initiatePayment({
  amount: 29900, // Amount in øre (299.00 NOK)
  currency: 'NOK',
  orderId: 'order-12345',
  customerInfo: {
    mobileNumber: '+4712345678'
  },
  paymentDescription: 'Xaheen CLI Pro License',
  metadata: {
    complianceLevel: 'RESTRICTED',
    invoiceId: 'INV-2024-001'
  }
});

// Check payment status
const status = await vipps.getPaymentStatus(payment.orderId);

// Capture payment (for authorization flows)
if (status.state === 'AUTHORIZED') {
  await vipps.capturePayment(payment.orderId, {
    amount: 29900,
    transactionText: 'Payment captured for license activation'
  });
}
```

### Klarna Integration

```typescript
import { KlarnaProvider } from './KlarnaProvider';

const klarna = new KlarnaProvider({
  username: process.env.KLARNA_USERNAME,
  password: process.env.KLARNA_PASSWORD,
  environment: 'production',
  region: 'eu',
  locale: 'nb-NO'
});

// Create checkout session
const checkout = await klarna.createCheckout({
  purchase: {
    currency: 'NOK',
    country: 'NO',
    locale: 'nb-NO',
    orderAmount: 29900,
    orderTaxAmount: 5980, // Norwegian VAT (25%)
    orderLines: [
      {
        name: 'Xaheen CLI Enterprise License',
        quantity: 1,
        unitPrice: 23920, // Price excluding VAT
        taxRate: 2500, // 25% in basis points
        totalAmount: 29900,
        totalTaxAmount: 5980
      }
    ]
  },
  options: {
    allowSeparateShippingAddress: false,
    colorDetails: {
      button: '#0066CC',
      buttonText: '#FFFFFF'
    }
  },
  merchant: {
    termsUri: 'https://your-app.no/terms',
    privacyUri: 'https://your-app.no/privacy',
    checkoutUri: 'https://your-app.no/checkout',
    confirmationUri: 'https://your-app.no/confirmation',
    pushUri: 'https://your-app.no/payment/klarna/webhook'
  }
});
```

### Stripe Integration

```typescript
import { StripeProvider } from './StripeProvider';

const stripe = new StripeProvider({
  secretKey: process.env.STRIPE_SECRET_KEY,
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  apiVersion: '2023-10-16',
  appInfo: {
    name: 'Xaheen CLI',
    version: '2.0.0'
  }
});

// Create payment intent
const paymentIntent = await stripe.createPaymentIntent({
  amount: 29900,
  currency: 'nok',
  customer: customerId,
  description: 'Xaheen CLI Enterprise License',
  metadata: {
    orderId: 'order-12345',
    licenseType: 'enterprise',
    complianceLevel: 'RESTRICTED'
  },
  automaticPaymentMethods: {
    enabled: true
  },
  statementDescriptor: 'XAHEEN CLI LIC'
});

// Handle webhook events
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.constructWebhookEvent(req.body, sig);
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
    }
    
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

### Norwegian Invoice Integration

```typescript
import { InvoiceProvider } from './InvoiceProvider';

const invoiceProvider = new InvoiceProvider({
  provider: 'visma', // or 'tripletex', 'poweroffice'
  apiKey: process.env.INVOICE_API_KEY,
  organizationNumber: '123456789',
  vatNumber: 'NO123456789MVA',
  bankAccount: '12345678901',
  defaultTerms: 14, // Payment terms in days
  complianceMode: 'ehf' // Norwegian EHF standard
});

// Create invoice
const invoice = await invoiceProvider.createInvoice({
  customer: {
    organizationNumber: '987654321',
    name: 'Customer AS',
    address: {
      street: 'Gateveien 1',
      postalCode: '0123',
      city: 'Oslo',
      country: 'NO'
    },
    contactEmail: 'faktura@customer.no'
  },
  invoiceLines: [
    {
      description: 'Xaheen CLI Enterprise License - Annual',
      quantity: 1,
      unitPrice: 23920.00,
      vatRate: 25.0,
      vatAmount: 5980.00,
      totalAmount: 29900.00
    }
  ],
  paymentTerms: 14,
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  reference: 'LICENSE-2024-001',
  ehfFormat: true // Norwegian electronic invoice format
});

// Send invoice
await invoiceProvider.sendInvoice(invoice.id, {
  method: 'email',
  recipient: 'faktura@customer.no',
  subject: 'Faktura fra Xaheen - Lisens'
});
```

## Provider Implementations

### Vipps Provider

**Features:**
- Instant mobile payments
- QR code generation
- Recurring payments
- Express checkout
- Strong customer authentication

**Configuration:**
```typescript
interface VippsConfig {
  clientId: string;
  clientSecret: string;
  subscriptionKey: string;
  merchantSerialNumber: string;
  environment: 'test' | 'production';
  callbackUrl: string;
  fallbackUrl: string;
  userAgent?: string;
}
```

**Norwegian Compliance:**
```typescript
class NorwegianCompliantVipps extends VippsProvider {
  async processPayment(payment: VippsPayment): Promise<PaymentResult> {
    // Validate Norwegian tax requirements
    await this.validateNorwegianTax(payment);
    
    // Apply anti-money laundering checks
    await this.amlCheck(payment);
    
    // Process with Vipps
    const result = await super.processPayment(payment);
    
    // Log for Norwegian authorities if required
    if (payment.amount > 1000000) { // Large transaction reporting
      await this.reportLargeTransaction(payment, result);
    }
    
    return result;
  }
}
```

### Nets Provider

**Features:**
- Nordic payment gateway
- Card payments and digital wallets
- Recurring billing
- Split payments
- B2B payment solutions

```typescript
class NetsProvider implements PaymentProvider {
  async processCardPayment(payment: CardPayment): Promise<PaymentResult> {
    const netsPayment = {
      order: {
        items: payment.items,
        amount: payment.amount,
        currency: payment.currency,
        reference: payment.reference
      },
      checkout: {
        termsUrl: this.config.termsUrl,
        returnUrl: this.config.returnUrl,
        cancelUrl: this.config.cancelUrl
      },
      merchantNumber: this.config.merchantNumber
    };
    
    const response = await this.netsClient.post('/v1/payments', netsPayment);
    
    return {
      success: response.data.paymentId ? true : false,
      transactionId: response.data.paymentId,
      hostedPaymentPageUrl: response.data.hostedPaymentPageUrl
    };
  }
}
```

## Norwegian Financial Compliance

### PSD2 Compliance

```typescript
class PSD2Handler {
  async handleStrongCustomerAuthentication(
    payment: Payment,
    customer: Customer
  ): Promise<SCAResult> {
    // Analyze transaction risk
    const riskScore = await this.assessTransactionRisk(payment, customer);
    
    // Apply SCA exemptions where applicable
    if (this.qualifiesForExemption(payment, riskScore)) {
      return {
        scaRequired: false,
        exemptionType: this.getExemptionType(payment),
        exemptionReason: 'Low risk transaction'
      };
    }
    
    // Require strong customer authentication
    return {
      scaRequired: true,
      methods: ['bankid', 'sms_otp', 'mobile_app'],
      challengeData: await this.generateChallenge(customer)
    };
  }
  
  private assessTransactionRisk(payment: Payment, customer: Customer): number {
    let riskScore = 0;
    
    // Amount-based risk
    if (payment.amount > 100000) riskScore += 30; // High amount
    
    // Frequency-based risk
    const recentTransactions = customer.transactionHistory.filter(
      t => t.timestamp > Date.now() - 24 * 60 * 60 * 1000
    );
    if (recentTransactions.length > 5) riskScore += 20;
    
    // Geographic risk
    if (payment.merchantLocation !== customer.usualLocation) riskScore += 25;
    
    return Math.min(riskScore, 100);
  }
}
```

### Norwegian Tax Handling

```typescript
class NorwegianTaxHandler {
  private readonly VAT_RATE = 25; // Norwegian VAT rate
  
  calculateTax(amount: number, includesVat: boolean = true): TaxCalculation {
    if (includesVat) {
      const vatAmount = Math.round((amount * this.VAT_RATE) / (100 + this.VAT_RATE));
      const netAmount = amount - vatAmount;
      
      return {
        netAmount,
        vatAmount,
        grossAmount: amount,
        vatRate: this.VAT_RATE
      };
    } else {
      const vatAmount = Math.round((amount * this.VAT_RATE) / 100);
      const grossAmount = amount + vatAmount;
      
      return {
        netAmount: amount,
        vatAmount,
        grossAmount,
        vatRate: this.VAT_RATE
      };
    }
  }
  
  async generateVATReport(
    transactions: PaymentTransaction[],
    period: ReportingPeriod
  ): Promise<VATReport> {
    const reportTransactions = transactions.filter(t => 
      t.timestamp >= period.startDate && t.timestamp <= period.endDate
    );
    
    const summary = reportTransactions.reduce((acc, transaction) => {
      acc.totalSales += transaction.amount;
      acc.totalVAT += transaction.vatAmount;
      acc.netSales += transaction.netAmount;
      return acc;
    }, { totalSales: 0, totalVAT: 0, netSales: 0 });
    
    return {
      period,
      summary,
      transactions: reportTransactions,
      generatedAt: new Date(),
      format: 'norwegian_vat_standard'
    };
  }
}
```

## Security Implementation

### PCI DSS Compliance

```typescript
class PCIDSSSecurityManager {
  async tokenizeCardData(cardData: CardData): Promise<PaymentToken> {
    // Validate card data format
    this.validateCardData(cardData);
    
    // Encrypt sensitive data
    const encryptedData = await this.encrypt(cardData, this.masterKey);
    
    // Generate secure token
    const token = this.generateSecureToken();
    
    // Store encrypted data with token mapping
    await this.tokenVault.store(token, encryptedData);
    
    // Clear sensitive data from memory
    this.secureClear(cardData);
    
    return {
      token,
      lastFourDigits: cardData.number.slice(-4),
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      brand: this.detectCardBrand(cardData.number)
    };
  }
  
  async detokenizeForProcessing(token: string): Promise<CardData> {
    // Validate token format and permissions
    await this.validateTokenAccess(token);
    
    // Retrieve encrypted data
    const encryptedData = await this.tokenVault.retrieve(token);
    
    if (!encryptedData) {
      throw new SecurityError('Invalid or expired token');
    }
    
    // Decrypt for processing
    const cardData = await this.decrypt(encryptedData, this.masterKey);
    
    // Log access for audit
    await this.auditLogger.logTokenAccess({
      token,
      action: 'detokenize',
      timestamp: new Date(),
      requestor: this.getCurrentUser()
    });
    
    return cardData;
  }
}
```

### Fraud Detection

```typescript
class FraudDetectionEngine {
  async analyzeTransaction(
    payment: Payment,
    customer: Customer
  ): Promise<FraudAssessment> {
    const signals = await this.collectFraudSignals(payment, customer);
    
    let riskScore = 0;
    const riskFactors: string[] = [];
    
    // Velocity checks
    if (signals.transactionsLast24h > 10) {
      riskScore += 40;
      riskFactors.push('high_velocity');
    }
    
    // Amount anomaly
    if (payment.amount > customer.averageTransactionAmount * 5) {
      riskScore += 30;
      riskFactors.push('amount_anomaly');
    }
    
    // Geographic anomaly
    if (signals.locationRisk > 0.7) {
      riskScore += 35;
      riskFactors.push('geographic_anomaly');
    }
    
    // Device fingerprinting
    if (signals.deviceRisk > 0.6) {
      riskScore += 25;
      riskFactors.push('device_risk');
    }
    
    const riskLevel = this.calculateRiskLevel(riskScore);
    
    return {
      riskScore,
      riskLevel,
      riskFactors,
      recommendation: this.getRecommendation(riskLevel),
      requiresManualReview: riskLevel === 'HIGH',
      blockedCountries: this.getBlockedCountries(signals)
    };
  }
  
  private getRecommendation(riskLevel: RiskLevel): string {
    switch (riskLevel) {
      case 'LOW':
        return 'APPROVE';
      case 'MEDIUM':
        return 'CHALLENGE'; // Additional authentication
      case 'HIGH':
        return 'REVIEW'; // Manual review required
      case 'CRITICAL':
        return 'BLOCK'; // Block transaction
      default:
        return 'REVIEW';
    }
  }
}
```

## Testing

### Unit Tests

```typescript
describe('VippsProvider', () => {
  let vipps: VippsProvider;
  let mockVippsAPI: jest.Mocked<VippsAPI>;
  
  beforeEach(() => {
    mockVippsAPI = {
      initiatePayment: jest.fn(),
      getPaymentStatus: jest.fn(),
      capturePayment: jest.fn()
    } as any;
    
    vipps = new VippsProvider(testConfig, mockVippsAPI);
  });
  
  it('should initiate Norwegian Vipps payment correctly', async () => {
    const payment = {
      amount: 29900,
      currency: 'NOK',
      orderId: 'test-order-123',
      customerInfo: { mobileNumber: '+4712345678' }
    };
    
    mockVippsAPI.initiatePayment.mockResolvedValue({
      orderId: 'test-order-123',
      url: 'https://api.vipps.no/payment/redirect'
    });
    
    const result = await vipps.initiatePayment(payment);
    
    expect(result.orderId).toBe('test-order-123');
    expect(mockVippsAPI.initiatePayment).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 29900,
        currency: 'NOK'
      })
    );
  });
  
  it('should handle Norwegian tax calculations correctly', async () => {
    const taxHandler = new NorwegianTaxHandler();
    
    const calculation = taxHandler.calculateTax(29900, true);
    
    expect(calculation.vatRate).toBe(25);
    expect(calculation.grossAmount).toBe(29900);
    expect(calculation.vatAmount).toBe(5980); // 25% VAT
    expect(calculation.netAmount).toBe(23920);
  });
});
```

### Integration Tests

```typescript
describe('Payment Provider Integration', () => {
  it('should process end-to-end Vipps payment', async () => {
    const testPayment = {
      amount: 100, // 1 NOK in øre
      currency: 'NOK',
      orderId: `test-${Date.now()}`,
      customerInfo: { mobileNumber: '+4799999999' }
    };
    
    // Test environment only
    if (process.env.NODE_ENV === 'test') {
      const vipps = new VippsProvider(testVippsConfig);
      
      const initResult = await vipps.initiatePayment(testPayment);
      expect(initResult.url).toContain('vipps.no');
      
      // In test environment, payments are auto-approved
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const status = await vipps.getPaymentStatus(initResult.orderId);
      expect(status.state).toBe('AUTHORIZED');
    }
  });
});
```

### Security Tests

```typescript
describe('Payment Security', () => {
  it('should properly tokenize sensitive card data', async () => {
    const pcidssSecurity = new PCIDSSSecurityManager();
    
    const cardData = {
      number: '4111111111111111',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123'
    };
    
    const token = await pcidssSecurity.tokenizeCardData(cardData);
    
    expect(token.token).toMatch(/^tok_[a-zA-Z0-9]{32}$/);
    expect(token.lastFourDigits).toBe('1111');
    expect(token.brand).toBe('visa');
    
    // Verify original data is cleared
    expect(cardData.number).toBe('');
    expect(cardData.cvv).toBe('');
  });
});
```

## Monitoring and Compliance

### Financial Reporting

```typescript
class FinancialReportingManager {
  async generateComplianceReport(
    period: ReportingPeriod,
    reportType: 'vat' | 'aml' | 'pci'
  ): Promise<ComplianceReport> {
    switch (reportType) {
      case 'vat':
        return this.generateVATReport(period);
      case 'aml':
        return this.generateAMLReport(period);
      case 'pci':
        return this.generatePCIReport(period);
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }
  }
  
  private async generateAMLReport(period: ReportingPeriod): Promise<AMLReport> {
    const suspiciousTransactions = await this.findSuspiciousTransactions(period);
    
    return {
      period,
      suspiciousTransactions,
      totalAmount: suspiciousTransactions.reduce((sum, t) => sum + t.amount, 0),
      reportedToAuthorities: suspiciousTransactions.filter(t => t.reported).length,
      generatedAt: new Date(),
      complianceOfficer: await this.getCurrentComplianceOfficer()
    };
  }
}
```

### Transaction Monitoring

```typescript
class TransactionMonitor {
  async monitorRealTimeTransactions(): Promise<void> {
    this.paymentStream.on('transaction', async (transaction) => {
      // Real-time fraud detection
      const fraudAssessment = await this.fraudDetection.analyze(transaction);
      
      if (fraudAssessment.riskLevel === 'HIGH') {
        await this.alertSecurityTeam(transaction, fraudAssessment);
      }
      
      // AML monitoring
      if (transaction.amount > 100000) { // Large transaction threshold
        await this.amlMonitor.flagForReview(transaction);
      }
      
      // Norwegian reporting requirements
      if (this.requiresNorwegianReporting(transaction)) {
        await this.norwegianReporter.reportTransaction(transaction);
      }
    });
  }
}
```

## Contributing

### Adding New Payment Providers

1. **Implement Provider Interface**:
   ```typescript
   export class NewPaymentProvider implements PaymentProvider {
     async processPayment(payment: Payment): Promise<PaymentResult> {
       // Implementation
     }
   }
   ```

2. **Add Configuration Schema**:
   ```typescript
   interface NewPaymentConfig extends PaymentProviderConfig {
     // Provider-specific configuration
   }
   ```

3. **Register Provider**:
   ```typescript
   paymentManager.register('new-payment', NewPaymentProvider);
   ```

### Compliance Guidelines

- Always implement PCI DSS requirements
- Follow Norwegian financial regulations
- Implement proper audit logging
- Add comprehensive fraud detection
- Ensure GDPR compliance for customer data
- Regular security assessments and penetration testing
- Maintain up-to-date compliance certifications