# Enterprise Integration Hook

This hook ensures all generated code properly integrates with Norwegian enterprise services and follows government compliance standards.

## Norwegian Government Service Integration

### BankID Integration Standards

All BankID integrations must follow these patterns:

```typescript
// BankID Configuration
interface BankIdConfig {
  readonly endpoint: string;
  readonly certificate: Buffer;
  readonly privateKey: Buffer;
  readonly passphrase: string;
  readonly environment: 'test' | 'production';
}

// BankID Service Implementation
@Injectable()
export class BankIdService {
  private readonly httpClient: AxiosInstance;
  
  constructor(
    private readonly config: BankIdConfig,
    private readonly logger: Logger
  ) {
    this.httpClient = axios.create({
      baseURL: config.endpoint,
      httpsAgent: new https.Agent({
        cert: config.certificate,
        key: config.privateKey,
        passphrase: config.passphrase,
        rejectUnauthorized: true
      }),
      timeout: 30000
    });
  }

  async authenticate(personalNumber?: string): Promise<BankIdAuthResponse> {
    const request: BankIdAuthRequest = {
      personalNumber,
      requirement: {
        cardReader: 'class1',
        certificatePolicies: ['1.2.752.78.1.5'],
        issuerCn: 'BankID',
        autoStartTokenRequired: false,
        allowFingerprint: true
      }
    };

    try {
      const response = await this.httpClient.post<BankIdAuthResponse>('/auth', request);
      
      // Log authentication attempt for audit
      this.logger.info('BankID authentication initiated', {
        orderRef: response.data.orderRef,
        personalNumber: personalNumber ? '[REDACTED]' : 'not provided',
        timestamp: new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      this.logger.error('BankID authentication failed', {
        error: error.message,
        personalNumber: personalNumber ? '[REDACTED]' : 'not provided'
      });
      throw new BankIdAuthenticationException('Authentication initiation failed');
    }
  }

  async collect(orderRef: string): Promise<BankIdCollectResponse> {
    try {
      const response = await this.httpClient.post<BankIdCollectResponse>('/collect', {
        orderRef
      });

      // Handle different status responses
      switch (response.data.status) {
        case 'complete':
          this.logger.info('BankID authentication completed', {
            orderRef,
            personalNumber: '[REDACTED]',
            timestamp: new Date().toISOString()
          });
          break;
        case 'failed':
          this.logger.warn('BankID authentication failed', {
            orderRef,
            hintCode: response.data.hintCode,
            timestamp: new Date().toISOString()
          });
          break;
        case 'pending':
          // Continue polling
          break;
      }

      return response.data;
    } catch (error) {
      this.logger.error('BankID collect failed', {
        orderRef,
        error: error.message
      });
      throw new BankIdCollectException('Failed to collect authentication result');
    }
  }

  async cancel(orderRef: string): Promise<void> {
    try {
      await this.httpClient.post('/cancel', { orderRef });
      this.logger.info('BankID authentication cancelled', { orderRef });
    } catch (error) {
      this.logger.error('BankID cancellation failed', {
        orderRef,
        error: error.message
      });
    }
  }
}
```

### Altinn Integration Standards

All Altinn integrations must include:

```typescript
// Altinn Service Implementation
@Injectable()
export class AltinnService {
  private readonly httpClient: AxiosInstance;

  constructor(
    private readonly config: AltinnConfig,
    private readonly logger: Logger
  ) {
    this.httpClient = axios.create({
      baseURL: config.endpoint,
      headers: {
        'ApiKey': config.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  async submitForm(formData: AltinnFormSubmission): Promise<AltinnSubmissionResponse> {
    const request: AltinnFormRequest = {
      serviceCode: formData.serviceCode,
      serviceEditionCode: formData.serviceEditionCode,
      reportee: formData.reportee,
      formData: formData.data,
      metadata: {
        submittedBy: formData.submittedBy,
        submissionDate: new Date().toISOString(),
        language: 'nb-NO'
      }
    };

    try {
      const response = await this.httpClient.post<AltinnSubmissionResponse>(
        '/forms/submit',
        request
      );

      // Audit trail for compliance
      this.logger.info('Altinn form submitted', {
        receiptId: response.data.receiptId,
        serviceCode: formData.serviceCode,
        reportee: '[REDACTED]',
        submittedBy: '[REDACTED]',
        timestamp: new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      this.logger.error('Altinn form submission failed', {
        serviceCode: formData.serviceCode,
        error: error.message,
        reportee: '[REDACTED]'
      });
      throw new AltinnSubmissionException('Form submission failed');
    }
  }

  async getFormStatus(receiptId: string): Promise<AltinnFormStatus> {
    try {
      const response = await this.httpClient.get<AltinnFormStatus>(
        `/forms/status/${receiptId}`
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get Altinn form status', {
        receiptId,
        error: error.message
      });
      throw new AltinnStatusException('Failed to retrieve form status');
    }
  }
}
```

### Vipps Payment Integration

All Vipps integrations must follow:

```typescript
// Vipps Payment Service
@Injectable()
export class VippsService {
  private readonly httpClient: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(
    private readonly config: VippsConfig,
    private readonly logger: Logger
  ) {
    this.httpClient = axios.create({
      baseURL: config.endpoint,
      timeout: 30000
    });
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await this.httpClient.post('/accesstoken/get', {}, {
        headers: {
          'client_id': this.config.clientId,
          'client_secret': this.config.clientSecret,
          'Ocp-Apim-Subscription-Key': this.config.subscriptionKey
        }
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
      
      return this.accessToken;
    } catch (error) {
      this.logger.error('Failed to get Vipps access token', error);
      throw new VippsAuthenticationException('Failed to authenticate with Vipps');
    }
  }

  async initiatePayment(paymentRequest: VippsPaymentRequest): Promise<VippsPaymentResponse> {
    const token = await this.getAccessToken();

    const request: VippsInitiatePaymentRequest = {
      customerInfo: {
        mobileNumber: paymentRequest.mobileNumber
      },
      merchantInfo: {
        merchantSerialNumber: this.config.merchantSerialNumber,
        callbackPrefix: this.config.callbackUrl,
        fallBack: paymentRequest.fallbackUrl,
        shippingDetailsPrefix: this.config.shippingDetailsUrl
      },
      transaction: {
        amount: paymentRequest.amount,
        transactionText: paymentRequest.description,
        orderId: paymentRequest.orderId,
        skipLandingPage: false
      }
    };

    try {
      const response = await this.httpClient.post<VippsPaymentResponse>(
        '/ecomm/v2/payments',
        request,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Ocp-Apim-Subscription-Key': this.config.subscriptionKey
          }
        }
      );

      // Audit trail
      this.logger.info('Vipps payment initiated', {
        orderId: paymentRequest.orderId,
        amount: paymentRequest.amount,
        mobileNumber: '[REDACTED]',
        timestamp: new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      this.logger.error('Vipps payment initiation failed', {
        orderId: paymentRequest.orderId,
        error: error.message
      });
      throw new VippsPaymentException('Payment initiation failed');
    }
  }

  async capturePayment(orderId: string, amount: number): Promise<VippsCaptureResponse> {
    const token = await this.getAccessToken();

    try {
      const response = await this.httpClient.post<VippsCaptureResponse>(
        `/ecomm/v2/payments/${orderId}/capture`,
        {
          merchantInfo: {
            merchantSerialNumber: this.config.merchantSerialNumber
          },
          transaction: {
            amount,
            transactionText: 'Payment capture'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Ocp-Apim-Subscription-Key': this.config.subscriptionKey
          }
        }
      );

      this.logger.info('Vipps payment captured', {
        orderId,
        amount,
        transactionId: response.data.transactionId
      });

      return response.data;
    } catch (error) {
      this.logger.error('Vipps payment capture failed', {
        orderId,
        error: error.message
      });
      throw new VippsCaptureException('Payment capture failed');
    }
  }
}
```

## NSM Security Classification Implementation

### Classification System

All services must implement NSM classification:

```typescript
// NSM Classification Enum
export enum NSMClassification {
  OPEN = 'OPEN',
  RESTRICTED = 'RESTRICTED',
  CONFIDENTIAL = 'CONFIDENTIAL',
  SECRET = 'SECRET'
}

// Classification Decorator
export function NSMClassified(classification: NSMClassification) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const context = this.getExecutionContext?.() || {};
      const userClearance = context.user?.clearanceLevel;

      if (!hasRequiredClearance(userClearance, classification)) {
        throw new ForbiddenException(
          `Insufficient clearance. Required: ${classification}, User: ${userClearance || 'NONE'}`
        );
      }

      // Log access for audit trail
      this.logger?.info('NSM classified operation accessed', {
        classification,
        userClearance,
        operation: `${target.constructor.name}.${propertyKey}`,
        userId: context.user?.id || 'anonymous',
        timestamp: new Date().toISOString()
      });

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// Clearance Validation
function hasRequiredClearance(
  userClearance: NSMClassification | undefined,
  requiredClearance: NSMClassification
): boolean {
  const clearanceHierarchy = {
    [NSMClassification.OPEN]: 0,
    [NSMClassification.RESTRICTED]: 1,
    [NSMClassification.CONFIDENTIAL]: 2,
    [NSMClassification.SECRET]: 3
  };

  const userLevel = clearanceHierarchy[userClearance || NSMClassification.OPEN];
  const requiredLevel = clearanceHierarchy[requiredClearance];

  return userLevel >= requiredLevel;
}

// Usage Example
@Controller('classified-data')
export class ClassifiedDataController {
  @Get('restricted')
  @NSMClassified(NSMClassification.RESTRICTED)
  async getRestrictedData(): Promise<any> {
    return this.dataService.getRestrictedData();
  }

  @Get('confidential')
  @NSMClassified(NSMClassification.CONFIDENTIAL)
  async getConfidentialData(): Promise<any> {
    return this.dataService.getConfidentialData();
  }
}
```

## GDPR Compliance Implementation

### Data Protection Patterns

All data handling must include GDPR compliance:

```typescript
// GDPR Consent Service
@Injectable()
export class GDPRConsentService {
  constructor(
    private readonly consentRepository: ConsentRepository,
    private readonly auditService: AuditService,
    private readonly logger: Logger
  ) {}

  async recordConsent(consentRequest: ConsentRequest): Promise<ConsentRecord> {
    const consent: ConsentRecord = {
      userId: consentRequest.userId,
      purpose: consentRequest.purpose,
      dataTypes: consentRequest.dataTypes,
      consentGiven: consentRequest.consentGiven,
      consentDate: new Date(),
      expiryDate: this.calculateExpiryDate(consentRequest.purpose),
      ipAddress: consentRequest.ipAddress,
      userAgent: consentRequest.userAgent,
      legalBasis: consentRequest.legalBasis || 'consent'
    };

    const savedConsent = await this.consentRepository.save(consent);

    // Audit trail
    await this.auditService.log({
      eventType: 'GDPR_CONSENT_RECORDED',
      userId: consentRequest.userId,
      data: {
        consentId: savedConsent.id,
        purpose: consentRequest.purpose,
        consentGiven: consentRequest.consentGiven
      },
      timestamp: new Date(),
      ipAddress: consentRequest.ipAddress
    });

    this.logger.info('GDPR consent recorded', {
      consentId: savedConsent.id,
      userId: consentRequest.userId,
      purpose: consentRequest.purpose,
      consentGiven: consentRequest.consentGiven
    });

    return savedConsent;
  }

  async withdrawConsent(userId: string, purpose: string): Promise<void> {
    await this.consentRepository.update(
      { userId, purpose },
      { 
        consentGiven: false,
        withdrawalDate: new Date()
      }
    );

    // Audit trail
    await this.auditService.log({
      eventType: 'GDPR_CONSENT_WITHDRAWN',
      userId,
      data: { purpose },
      timestamp: new Date()
    });

    // Trigger data deletion if required
    await this.triggerDataDeletion(userId, purpose);
  }

  async deleteUserData(userId: string, dataTypes: string[]): Promise<DataDeletionResult> {
    const deletionRequest: DataDeletionRequest = {
      userId,
      dataTypes,
      requestDate: new Date(),
      status: 'pending'
    };

    const result = await this.performDataDeletion(deletionRequest);

    // Audit trail
    await this.auditService.log({
      eventType: 'GDPR_DATA_DELETED',
      userId,
      data: {
        deletionId: result.deletionId,
        dataTypes,
        deletedRecords: result.deletedRecords
      },
      timestamp: new Date()
    });

    return result;
  }
}

// GDPR Middleware
@Injectable()
export class GDPRMiddleware implements NestMiddleware {
  constructor(
    private readonly consentService: GDPRConsentService,
    private readonly logger: Logger
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = req.user?.id;
    const dataProcessingPurpose = this.extractDataProcessingPurpose(req);

    if (userId && dataProcessingPurpose) {
      const hasValidConsent = await this.consentService.hasValidConsent(
        userId,
        dataProcessingPurpose
      );

      if (!hasValidConsent) {
        return res.status(403).json({
          error: 'GDPR_CONSENT_REQUIRED',
          message: 'Valid consent required for data processing',
          purpose: dataProcessingPurpose
        });
      }
    }

    next();
  }
}
```

## Cloud Platform Integration Standards

### Azure Integration Patterns

Generated Azure integrations must include:

```typescript
// Azure Service Bus Integration
@Injectable()
export class AzureServiceBusService {
  private sender: ServiceBusSender;
  private receiver: ServiceBusReceiver;

  constructor(private readonly config: AzureConfig) {
    const client = new ServiceBusClient(config.connectionString);
    this.sender = client.createSender(config.queueName);
    this.receiver = client.createReceiver(config.queueName);
  }

  async sendMessage(message: any): Promise<void> {
    const serviceBusMessage: ServiceBusMessage = {
      body: message,
      messageId: uuidv4(),
      timeToLive: 60 * 60 * 1000, // 1 hour
      contentType: 'application/json'
    };

    await this.sender.sendMessages(serviceBusMessage);
  }

  async processMessages(): Promise<void> {
    const messageHandler = async (messageReceived: ServiceBusReceivedMessage) => {
      try {
        await this.processMessage(messageReceived.body);
        await messageReceived.complete();
      } catch (error) {
        await messageReceived.abandon();
        throw error;
      }
    };

    this.receiver.subscribe({
      processMessage: messageHandler,
      processError: async (args) => {
        console.error('Error processing message:', args.error);
      }
    });
  }
}

// Azure Key Vault Integration
@Injectable()
export class AzureKeyVaultService {
  private client: SecretClient;

  constructor(private readonly config: AzureConfig) {
    const credential = new DefaultAzureCredential();
    this.client = new SecretClient(config.keyVaultUrl, credential);
  }

  async getSecret(secretName: string): Promise<string> {
    const secret = await this.client.getSecret(secretName);
    return secret.value || '';
  }

  async setSecret(secretName: string, secretValue: string): Promise<void> {
    await this.client.setSecret(secretName, secretValue);
  }
}
```

## Audit Trail and Compliance Logging

### Audit Service Implementation

All enterprise integrations must include comprehensive audit trails:

```typescript
// Audit Service
@Injectable()
export class AuditService {
  constructor(
    private readonly auditRepository: AuditRepository,
    private readonly encryptionService: EncryptionService,
    private readonly logger: Logger
  ) {}

  async log(auditEvent: AuditEvent): Promise<AuditRecord> {
    const record: AuditRecord = {
      id: uuidv4(),
      eventType: auditEvent.eventType,
      userId: auditEvent.userId,
      sessionId: auditEvent.sessionId,
      ipAddress: auditEvent.ipAddress,
      userAgent: auditEvent.userAgent,
      resource: auditEvent.resource,
      action: auditEvent.action,
      data: await this.encryptionService.encrypt(JSON.stringify(auditEvent.data)),
      classification: auditEvent.classification || NSMClassification.RESTRICTED,
      timestamp: auditEvent.timestamp || new Date(),
      source: auditEvent.source || 'application'
    };

    const savedRecord = await this.auditRepository.save(record);

    // Also log to external audit system for compliance
    await this.sendToExternalAuditSystem(record);

    return savedRecord;
  }

  async getAuditTrail(
    filters: AuditTrailFilters
  ): Promise<PaginatedResult<AuditRecord>> {
    // Ensure user has appropriate clearance to view audit records
    this.validateAuditAccess(filters.requestingUser);

    return this.auditRepository.findWithFilters(filters);
  }

  private async sendToExternalAuditSystem(record: AuditRecord): Promise<void> {
    try {
      // Send to Norwegian government audit system if required
      if (record.classification !== NSMClassification.OPEN) {
        await this.sendToGovernmentAuditSystem(record);
      }
    } catch (error) {
      this.logger.error('Failed to send to external audit system', {
        recordId: record.id,
        error: error.message
      });
    }
  }
}
```

## Validation Rules

Before generating any enterprise integration:

1. **Security Classification**: Must include appropriate NSM classification
2. **Audit Logging**: All operations must be logged for compliance
3. **GDPR Compliance**: Data handling must include consent management
4. **Error Handling**: Robust error handling with proper logging
5. **Authentication**: Proper integration with Norwegian auth systems
6. **Encryption**: Sensitive data must be encrypted at rest and in transit
7. **Monitoring**: Health checks and observability must be included