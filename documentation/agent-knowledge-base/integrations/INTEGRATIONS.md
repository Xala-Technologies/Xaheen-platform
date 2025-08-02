# Xaheen Integrations - Complete Guide

## Table of Contents

1. [Integration Overview](#integration-overview)
2. [Authentication Integrations](#authentication-integrations)
3. [Payment Integrations](#payment-integrations)
4. [Government Service Integrations](#government-service-integrations)
5. [Communication Integrations](#communication-integrations)
6. [Analytics Integrations](#analytics-integrations)
7. [Database Integrations](#database-integrations)
8. [Storage Integrations](#storage-integrations)
9. [Integration Architecture](#integration-architecture)
10. [Best Practices](#best-practices)

## Integration Overview

Xaheen provides seamless integration with 15+ services, focusing on Norwegian market requirements while maintaining global compatibility.

### Integration Categories

```typescript
interface IntegrationEcosystem {
  authentication: {
    norwegian: ['vipps', 'bankid'];
    international: ['auth0', 'oauth2', 'saml'];
    educational: ['feide'];
  };
  
  payment: {
    norwegian: ['vipps'];
    international: ['stripe', 'paypal', 'klarna'];
  };
  
  government: {
    services: ['altinn', 'skatteetaten', 'nav'];
    standards: ['difi', 'eid'];
  };
  
  communication: {
    messaging: ['slack', 'teams'];
    email: ['sendgrid', 'mailgun'];
    sms: ['twilio', 'vonage'];
  };
  
  analytics: {
    privacy_first: ['posthog', 'plausible', 'umami'];
    enterprise: ['segment', 'mixpanel'];
  };
  
  infrastructure: {
    databases: ['postgres', 'mysql', 'mongodb', 'redis'];
    storage: ['s3', 'cloudinary', 'uploadthing'];
    search: ['algolia', 'elasticsearch'];
  };
}
```

## Authentication Integrations

### Vipps Login

Norwegian mobile-first authentication solution.

#### Installation

```bash
xaheen add vipps --config=auth
```

#### Configuration

```typescript
// lib/auth/vipps/config.ts
export const vippsConfig = {
  clientId: process.env.VIPPS_CLIENT_ID!,
  clientSecret: process.env.VIPPS_CLIENT_SECRET!,
  redirectUri: process.env.VIPPS_REDIRECT_URI!,
  scope: ['openid', 'profile', 'email', 'phoneNumber'],
  
  // Norwegian compliance
  compliance: {
    gdpr: true,
    storageLocation: 'norway',
    dataRetention: 90, // days
  },
  
  // UI customization
  ui: {
    language: 'nb',
    theme: 'light',
    logo: '/logo.png',
  },
};
```

#### Implementation

```typescript
// lib/auth/vipps/provider.ts
import { VippsOAuth2Provider } from '@/lib/auth/vipps';

export class VippsAuthProvider {
  private client: VippsOAuth2Provider;
  
  constructor(config: VippsConfig) {
    this.client = new VippsOAuth2Provider(config);
  }
  
  async login(): Promise<void> {
    const authUrl = await this.client.getAuthorizationUrl({
      state: generateState(),
      nonce: generateNonce(),
    });
    
    // Redirect to Vipps
    window.location.href = authUrl;
  }
  
  async handleCallback(code: string, state: string): Promise<User> {
    // Verify state
    if (!verifyState(state)) {
      throw new Error('Invalid state parameter');
    }
    
    // Exchange code for tokens
    const tokens = await this.client.exchangeCode(code);
    
    // Get user info
    const userInfo = await this.client.getUserInfo(tokens.accessToken);
    
    // Create/update user
    return await this.createOrUpdateUser(userInfo);
  }
  
  async logout(): Promise<void> {
    const logoutUrl = await this.client.getLogoutUrl({
      postLogoutRedirectUri: process.env.VIPPS_LOGOUT_REDIRECT_URI,
    });
    
    window.location.href = logoutUrl;
  }
}
```

#### React Component

```tsx
// components/auth/VippsLogin.tsx
import { useVippsAuth } from '@/hooks/useVippsAuth';

export function VippsLogin() {
  const { login, loading, error } = useVippsAuth();
  
  return (
    <button
      onClick={login}
      disabled={loading}
      className="h-12 px-6 bg-[#FF5B00] text-white rounded-lg flex items-center gap-3"
      aria-label="Logg inn med Vipps"
    >
      <VippsLogo />
      <span>Logg inn med Vipps</span>
    </button>
  );
}
```

### BankID

Norwegian national electronic identification system.

#### Installation

```bash
xaheen add bankid --config=auth --env=prod
```

#### Configuration

```typescript
// lib/auth/bankid/config.ts
export const bankidConfig = {
  // Environment
  environment: process.env.NODE_ENV === 'production' ? 'prod' : 'test',
  
  // Certificates
  certificates: {
    client: {
      cert: process.env.BANKID_CLIENT_CERT!,
      key: process.env.BANKID_CLIENT_KEY!,
      passphrase: process.env.BANKID_CLIENT_PASSPHRASE!,
    },
    ca: process.env.BANKID_CA_CERT!,
  },
  
  // Security
  security: {
    requireBiometrics: true,
    sessionTimeout: 300, // seconds
    allowRememberMe: false,
  },
  
  // Compliance
  compliance: {
    nsm: {
      classification: 'RESTRICTED',
      auditLog: true,
    },
    gdpr: {
      purpose: 'authentication',
      legalBasis: 'legitimate_interest',
    },
  },
};
```

#### Implementation

```typescript
// lib/auth/bankid/provider.ts
import { BankIDClient } from '@bankid/client';

export class BankIDAuthProvider {
  private client: BankIDClient;
  
  constructor(config: BankIDConfig) {
    this.client = new BankIDClient(config);
  }
  
  async authenticate(personalNumber?: string): Promise<AuthSession> {
    // Start authentication
    const authResponse = await this.client.auth({
      personalNumber,
      endUserIp: getClientIP(),
      requirement: {
        pinCode: true,
        mrtd: false, // Machine readable travel document
      },
    });
    
    // Poll for completion
    return await this.pollAuthentication(authResponse.orderRef);
  }
  
  async sign(
    personalNumber: string,
    userVisibleData: string,
    userNonVisibleData?: string
  ): Promise<SignatureResult> {
    // Start signing
    const signResponse = await this.client.sign({
      personalNumber,
      endUserIp: getClientIP(),
      userVisibleData: Buffer.from(userVisibleData).toString('base64'),
      userNonVisibleData: userNonVisibleData 
        ? Buffer.from(userNonVisibleData).toString('base64')
        : undefined,
    });
    
    // Poll for completion
    return await this.pollSigning(signResponse.orderRef);
  }
  
  private async pollAuthentication(
    orderRef: string
  ): Promise<AuthSession> {
    const maxAttempts = 60; // 5 minutes
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const status = await this.client.collect({ orderRef });
      
      switch (status.status) {
        case 'complete':
          return this.createSession(status.completionData);
        case 'failed':
          throw new BankIDError(status.hintCode);
        case 'pending':
          await sleep(5000); // 5 seconds
          attempts++;
          break;
      }
    }
    
    throw new Error('Authentication timeout');
  }
}
```

#### React Component

```tsx
// components/auth/BankIDLogin.tsx
export function BankIDLogin() {
  const [personalNumber, setPersonalNumber] = useState('');
  const [status, setStatus] = useState<'idle' | 'authenticating' | 'complete'>('idle');
  const { authenticate } = useBankID();
  
  const handleLogin = async () => {
    setStatus('authenticating');
    
    try {
      await authenticate(personalNumber);
      setStatus('complete');
    } catch (error) {
      setStatus('idle');
      // Handle error
    }
  };
  
  return (
    <div className="space-y-4">
      {status === 'idle' && (
        <>
          <input
            type="text"
            placeholder="Personnummer (valgfritt)"
            value={personalNumber}
            onChange={(e) => setPersonalNumber(e.target.value)}
            className="w-full h-14 px-4 border-2 border-gray-300 rounded-lg"
          />
          <button
            onClick={handleLogin}
            className="w-full h-12 bg-blue-600 text-white rounded-lg"
          >
            Logg inn med BankID
          </button>
        </>
      )}
      
      {status === 'authenticating' && (
        <BankIDAuthenticating />
      )}
      
      {status === 'complete' && (
        <BankIDSuccess />
      )}
    </div>
  );
}
```

## Payment Integrations

### Vipps Payment

Norwegian payment solution for e-commerce and services.

#### Installation

```bash
xaheen add vipps --config=payment
```

#### Configuration

```typescript
// lib/payment/vipps/config.ts
export const vippsPaymentConfig = {
  // API credentials
  clientId: process.env.VIPPS_CLIENT_ID!,
  clientSecret: process.env.VIPPS_CLIENT_SECRET!,
  subscriptionKey: process.env.VIPPS_SUBSCRIPTION_KEY!,
  merchantSerialNumber: process.env.VIPPS_MSN!,
  
  // Environment
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
  
  // Payment settings
  payment: {
    currency: 'NOK',
    paymentTypes: ['regular', 'express', 'recurring'],
    captureMode: 'manual', // or 'automatic'
  },
  
  // Callbacks
  callbacks: {
    fallback: `${process.env.NEXT_PUBLIC_URL}/api/vipps/fallback`,
    callback: `${process.env.NEXT_PUBLIC_URL}/api/vipps/callback`,
    consentRemoval: `${process.env.NEXT_PUBLIC_URL}/api/vipps/consent-removal`,
  },
  
  // Compliance
  compliance: {
    pci: 'SAQ-A', // Self-assessment questionnaire type
    gdpr: {
      dataMinimization: true,
      encryption: true,
    },
  },
};
```

#### Implementation

```typescript
// lib/payment/vipps/client.ts
import { VippsClient } from '@vipps/sdk';

export class VippsPaymentClient {
  private client: VippsClient;
  
  constructor(config: VippsPaymentConfig) {
    this.client = new VippsClient(config);
  }
  
  async createPayment(options: PaymentOptions): Promise<PaymentResponse> {
    const payment = await this.client.payments.create({
      amount: {
        value: options.amount * 100, // Convert to øre
        currency: 'NOK',
      },
      paymentMethod: {
        type: 'WALLET',
      },
      reference: generateReference(),
      userFlow: options.express ? 'EXPRESS' : 'REGULAR',
      returnUrl: options.returnUrl,
      callbackUrl: this.config.callbacks.callback,
      paymentDescription: options.description,
    });
    
    return {
      paymentId: payment.paymentId,
      paymentUrl: payment.url,
      expiresAt: payment.expiresAt,
    };
  }
  
  async capturePayment(
    paymentId: string,
    amount?: number
  ): Promise<CaptureResult> {
    return await this.client.payments.capture(paymentId, {
      modificationAmount: amount ? amount * 100 : undefined,
    });
  }
  
  async refundPayment(
    paymentId: string,
    amount: number,
    reason: string
  ): Promise<RefundResult> {
    return await this.client.payments.refund(paymentId, {
      modificationAmount: amount * 100,
      paymentDescription: reason,
    });
  }
  
  async createRecurringAgreement(
    options: RecurringOptions
  ): Promise<AgreementResponse> {
    return await this.client.recurring.agreements.create({
      pricing: {
        type: 'LEGACY',
        amount: options.amount * 100,
        currency: 'NOK',
      },
      interval: {
        unit: options.intervalUnit,
        count: options.intervalCount,
      },
      merchantAgreementUrl: options.agreementUrl,
      agreementResource: options.description,
    });
  }
}
```

#### React Integration

```tsx
// components/payment/VippsCheckout.tsx
export function VippsCheckout({ amount, items }: CheckoutProps) {
  const [loading, setLoading] = useState(false);
  const { createPayment } = useVippsPayment();
  
  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const payment = await createPayment({
        amount,
        description: `Ordre med ${items.length} varer`,
        returnUrl: `${window.location.origin}/checkout/success`,
        express: true,
      });
      
      // Redirect to Vipps
      window.location.href = payment.paymentUrl;
    } catch (error) {
      console.error('Payment failed:', error);
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <OrderSummary items={items} total={amount} />
      
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full h-14 bg-[#FF5B00] text-white rounded-xl font-medium"
      >
        {loading ? (
          <Spinner />
        ) : (
          <>
            <VippsLogo className="inline mr-2" />
            Betal med Vipps
          </>
        )}
      </button>
    </div>
  );
}
```

### Stripe Integration

International payment processing with Norwegian support.

#### Installation

```bash
xaheen add stripe --config=payment
```

#### Implementation

```typescript
// lib/payment/stripe/client.ts
import Stripe from 'stripe';

export class StripePaymentClient {
  private stripe: Stripe;
  
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-01-01',
    });
  }
  
  async createPaymentIntent(options: PaymentIntentOptions) {
    return await this.stripe.paymentIntents.create({
      amount: Math.round(options.amount * 100),
      currency: options.currency || 'nok',
      metadata: {
        orderId: options.orderId,
        customerEmail: options.customerEmail,
      },
      automatic_payment_methods: {
        enabled: true,
      },
      // Norwegian-specific settings
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
    });
  }
  
  async createNorwegianInvoice(options: InvoiceOptions) {
    // Create customer
    const customer = await this.stripe.customers.create({
      email: options.email,
      name: options.name,
      address: {
        line1: options.address.line1,
        postal_code: options.address.postalCode,
        city: options.address.city,
        country: 'NO',
      },
      tax_id_data: [{
        type: 'no_vat',
        value: options.orgNumber,
      }],
    });
    
    // Create invoice
    const invoice = await this.stripe.invoices.create({
      customer: customer.id,
      collection_method: 'send_invoice',
      days_until_due: 14,
      currency: 'nok',
      custom_fields: [{
        name: 'KID',
        value: generateKID(options.invoiceNumber),
      }],
    });
    
    // Add line items
    for (const item of options.items) {
      await this.stripe.invoiceItems.create({
        customer: customer.id,
        invoice: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_amount: Math.round(item.unitPrice * 100),
        tax_rates: [await this.getNorwegianVATRate(item.vatRate)],
      });
    }
    
    // Finalize and send
    return await this.stripe.invoices.finalizeInvoice(invoice.id);
  }
}
```

## Government Service Integrations

### Altinn

Norwegian government platform for digital services.

#### Installation

```bash
xaheen add altinn --env=prod
```

#### Configuration

```typescript
// lib/integrations/altinn/config.ts
export const altinnConfig = {
  // API endpoints
  endpoints: {
    authentication: 'https://platform.altinn.no/authentication/api/v1',
    authorization: 'https://platform.altinn.no/authorization/api/v1',
    register: 'https://platform.altinn.no/register/api/v1',
    storage: 'https://platform.altinn.no/storage/api/v1',
    events: 'https://platform.altinn.no/events/api/v1',
  },
  
  // App configuration
  app: {
    org: process.env.ALTINN_ORG!,
    app: process.env.ALTINN_APP!,
    clientId: process.env.ALTINN_CLIENT_ID!,
    clientSecret: process.env.ALTINN_CLIENT_SECRET!,
  },
  
  // Security
  security: {
    scopes: ['read', 'write', 'instantiate'],
    tokenEndpoint: 'https://platform.altinn.no/authentication/api/v1/exchange/maskinporten',
  },
  
  // Compliance
  compliance: {
    nsm: {
      classification: 'INTERNAL',
      encryption: true,
    },
    gdpr: {
      purpose: 'government_service',
      legalBasis: 'legal_obligation',
    },
  },
};
```

#### Implementation

```typescript
// lib/integrations/altinn/client.ts
export class AltinnClient {
  private accessToken: string | null = null;
  
  constructor(private config: AltinnConfig) {}
  
  async authenticate(): Promise<void> {
    const token = await this.exchangeMaskinportenToken();
    this.accessToken = token.access_token;
  }
  
  async getOrganizations(
    personalNumber: string
  ): Promise<Organization[]> {
    const response = await this.request('/organizations', {
      headers: {
        'X-Altinn-UserId': personalNumber,
      },
    });
    
    return response.data;
  }
  
  async createInstance(
    instanceOwner: string,
    data: any
  ): Promise<Instance> {
    const instance = await this.request('/instances', {
      method: 'POST',
      body: {
        instanceOwner: {
          partyId: instanceOwner,
        },
        appId: `${this.config.app.org}/${this.config.app.app}`,
        dataValues: data,
      },
    });
    
    return instance;
  }
  
  async uploadFormData(
    instanceId: string,
    dataType: string,
    formData: any
  ): Promise<DataElement> {
    return await this.request(
      `/instances/${instanceId}/data?dataType=${dataType}`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
  
  async submitInstance(instanceId: string): Promise<void> {
    await this.request(`/instances/${instanceId}/process/next`, {
      method: 'PUT',
    });
  }
  
  async getRoles(
    subject: string,
    reportee: string
  ): Promise<Role[]> {
    const response = await this.request('/authorization/roles', {
      params: {
        subject,
        reportee,
      },
    });
    
    return response.data;
  }
  
  async getDelegations(
    party: string
  ): Promise<Delegation[]> {
    const response = await this.request('/authorization/delegations', {
      params: {
        party,
      },
    });
    
    return response.data;
  }
}
```

#### React Integration

```tsx
// components/altinn/OrganizationSelector.tsx
export function OrganizationSelector() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selected, setSelected] = useState<string>('');
  const { user } = useAuth();
  const altinn = useAltinn();
  
  useEffect(() => {
    if (user?.personalNumber) {
      altinn.getOrganizations(user.personalNumber)
        .then(setOrganizations)
        .catch(console.error);
    }
  }, [user]);
  
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Velg organisasjon
      </label>
      
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full h-14 px-4 border-2 border-gray-300 rounded-lg"
      >
        <option value="">Velg organisasjon</option>
        {organizations.map((org) => (
          <option key={org.partyId} value={org.partyId}>
            {org.name} ({org.organizationNumber})
          </option>
        ))}
      </select>
      
      {selected && (
        <RoleDisplay partyId={selected} />
      )}
    </div>
  );
}
```

## Communication Integrations

### Slack Integration

Team communication and notifications.

#### Installation

```bash
xaheen add slack --config=notifications
```

#### Configuration

```typescript
// lib/integrations/slack/config.ts
export const slackConfig = {
  // App credentials
  app: {
    clientId: process.env.SLACK_CLIENT_ID!,
    clientSecret: process.env.SLACK_CLIENT_SECRET!,
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
  },
  
  // Bot configuration
  bot: {
    token: process.env.SLACK_BOT_TOKEN!,
    scopes: [
      'chat:write',
      'channels:read',
      'users:read',
      'files:write',
    ],
  },
  
  // Webhook URLs
  webhooks: {
    alerts: process.env.SLACK_WEBHOOK_ALERTS!,
    notifications: process.env.SLACK_WEBHOOK_NOTIFICATIONS!,
  },
  
  // Default settings
  defaults: {
    channel: '#general',
    username: 'Xaheen Bot',
    icon: ':robot_face:',
  },
};
```

#### Implementation

```typescript
// lib/integrations/slack/client.ts
import { WebClient } from '@slack/web-api';
import { createEventAdapter } from '@slack/events-api';

export class SlackClient {
  private web: WebClient;
  private events: any;
  
  constructor(config: SlackConfig) {
    this.web = new WebClient(config.bot.token);
    this.events = createEventAdapter(config.app.signingSecret);
  }
  
  async sendMessage(options: MessageOptions): Promise<void> {
    await this.web.chat.postMessage({
      channel: options.channel || this.config.defaults.channel,
      text: options.text,
      blocks: options.blocks,
      attachments: options.attachments,
      thread_ts: options.threadTs,
    });
  }
  
  async sendAlert(alert: Alert): Promise<void> {
    await this.web.chat.postMessage({
      channel: '#alerts',
      text: `🚨 ${alert.title}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: alert.title,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: alert.description,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `*Severity:* ${alert.severity}`,
            },
            {
              type: 'mrkdwn',
              text: `*Time:* ${new Date().toISOString()}`,
            },
          ],
        },
      ],
      attachments: alert.details ? [{
        color: alert.severity === 'critical' ? 'danger' : 'warning',
        fields: Object.entries(alert.details).map(([key, value]) => ({
          title: key,
          value: String(value),
          short: true,
        })),
      }] : undefined,
    });
  }
  
  async createIncidentChannel(
    incident: Incident
  ): Promise<string> {
    // Create channel
    const channel = await this.web.conversations.create({
      name: `incident-${incident.id}`,
      is_private: false,
    });
    
    // Set topic
    await this.web.conversations.setTopic({
      channel: channel.channel!.id!,
      topic: incident.title,
    });
    
    // Invite relevant users
    await this.web.conversations.invite({
      channel: channel.channel!.id!,
      users: incident.responders.join(','),
    });
    
    // Post initial message
    await this.sendMessage({
      channel: channel.channel!.id!,
      blocks: this.buildIncidentBlocks(incident),
    });
    
    return channel.channel!.id!;
  }
  
  setupEventHandlers() {
    // Message events
    this.events.on('message', async (event: any) => {
      if (event.text.includes('help')) {
        await this.sendHelp(event.channel, event.user);
      }
    });
    
    // Slash commands
    this.events.on('slash_command', async (cmd: any) => {
      switch (cmd.command) {
        case '/status':
          await this.handleStatusCommand(cmd);
          break;
        case '/deploy':
          await this.handleDeployCommand(cmd);
          break;
      }
    });
  }
}
```

### Microsoft Teams Integration

Enterprise team collaboration.

#### Installation

```bash
xaheen add teams --config=notifications
```

#### Implementation

```typescript
// lib/integrations/teams/client.ts
import { Client } from '@microsoft/microsoft-graph-client';

export class TeamsClient {
  private client: Client;
  
  constructor(config: TeamsConfig) {
    this.client = Client.init({
      authProvider: (done) => {
        done(null, config.accessToken);
      },
    });
  }
  
  async sendChannelMessage(
    teamId: string,
    channelId: string,
    message: Message
  ): Promise<void> {
    await this.client
      .api(`/teams/${teamId}/channels/${channelId}/messages`)
      .post({
        body: {
          content: message.content,
          contentType: 'html',
        },
        attachments: message.attachments,
      });
  }
  
  async sendAdaptiveCard(
    teamId: string,
    channelId: string,
    card: AdaptiveCard
  ): Promise<void> {
    await this.client
      .api(`/teams/${teamId}/channels/${channelId}/messages`)
      .post({
        body: {
          contentType: 'html',
          content: '<attachment id="1"></attachment>',
        },
        attachments: [{
          id: '1',
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: card,
        }],
      });
  }
  
  async createMeeting(options: MeetingOptions): Promise<Meeting> {
    const meeting = await this.client
      .api('/me/onlineMeetings')
      .post({
        startDateTime: options.startTime,
        endDateTime: options.endTime,
        subject: options.subject,
        participants: {
          attendees: options.attendees.map(email => ({
            emailAddress: { address: email },
            type: 'required',
          })),
        },
      });
    
    return meeting;
  }
}
```

## Analytics Integrations

### PostHog

Privacy-focused product analytics.

#### Installation

```bash
xaheen add posthog --config=analytics
```

#### Configuration

```typescript
// lib/analytics/posthog/config.ts
export const posthogConfig = {
  apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY!,
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
  
  // Privacy settings
  privacy: {
    maskAllText: false,
    maskAllImages: false,
    disableSessionRecording: false,
    respectDoNotTrack: true,
  },
  
  // Feature flags
  features: {
    surveys: true,
    heatmaps: true,
    sessionRecording: true,
    featureFlags: true,
  },
  
  // GDPR compliance
  gdpr: {
    requireConsent: true,
    anonymizeIP: true,
    dataDeletion: true,
  },
};
```

#### Implementation

```typescript
// lib/analytics/posthog/client.ts
import posthog from 'posthog-js';

export class AnalyticsClient {
  constructor(config: PostHogConfig) {
    if (typeof window !== 'undefined') {
      posthog.init(config.apiKey, {
        api_host: config.host,
        ...config.privacy,
        loaded: (posthog) => {
          if (config.gdpr.requireConsent && !hasConsent()) {
            posthog.opt_out_capturing();
          }
        },
      });
    }
  }
  
  identify(userId: string, properties?: Record<string, any>) {
    posthog.identify(userId, {
      ...properties,
      gdpr_consent: hasConsent(),
    });
  }
  
  track(event: string, properties?: Record<string, any>) {
    if (!hasConsent() && this.config.gdpr.requireConsent) {
      return;
    }
    
    posthog.capture(event, {
      ...properties,
      timestamp: new Date().toISOString(),
      compliance: {
        gdpr_consent: hasConsent(),
        data_classification: getDataClassification(properties),
      },
    });
  }
  
  trackPageView(properties?: Record<string, any>) {
    this.track('$pageview', properties);
  }
  
  setUserProperty(key: string, value: any) {
    posthog.people.set({ [key]: value });
  }
  
  getFeatureFlag(key: string): boolean | string | undefined {
    return posthog.getFeatureFlag(key);
  }
  
  startSessionRecording() {
    if (hasConsent() && !this.config.privacy.disableSessionRecording) {
      posthog.startSessionRecording();
    }
  }
  
  optIn() {
    posthog.opt_in_capturing();
    this.track('gdpr_consent_given');
  }
  
  optOut() {
    posthog.opt_out_capturing();
    this.track('gdpr_consent_withdrawn');
  }
}
```

## Database Integrations

### PostgreSQL with Prisma

Type-safe database access with automatic migrations.

#### Installation

```bash
xaheen add postgres --orm=prisma
```

#### Configuration

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  extensions = [pgcrypto, uuid-ossp]
}

// Norwegian-specific models
model User {
  id              String   @id @default(uuid())
  personalNumber  String?  @unique @map("personal_number") // Encrypted
  email           String   @unique
  name            String
  organizationId  String?  @map("organization_id")
  organization    Organization? @relation(fields: [organizationId], references: [id])
  
  // GDPR fields
  consentGiven    Boolean  @default(false) @map("consent_given")
  consentDate     DateTime? @map("consent_date")
  dataRetention   DateTime? @map("data_retention")
  
  // Audit fields
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  deletedAt       DateTime? @map("deleted_at") // Soft delete
  
  @@map("users")
  @@index([email])
  @@index([organizationId])
}

model Organization {
  id              String   @id @default(uuid())
  orgNumber       String   @unique @map("org_number")
  name            String
  vatNumber       String?  @map("vat_number")
  
  // Address
  address         Json     // Store as JSON for flexibility
  
  // Relations
  users           User[]
  invoices        Invoice[]
  
  @@map("organizations")
  @@index([orgNumber])
}

model Invoice {
  id              String   @id @default(uuid())
  invoiceNumber   String   @unique @map("invoice_number")
  kid             String   @unique // Norwegian payment reference
  
  // Amounts (stored in øre to avoid decimal issues)
  amount          Int
  vat             Int
  total           Int
  
  // Relations
  organizationId  String   @map("organization_id")
  organization    Organization @relation(fields: [organizationId], references: [id])
  
  // Status
  status          InvoiceStatus @default(DRAFT)
  dueDate         DateTime @map("due_date")
  paidAt          DateTime? @map("paid_at")
  
  // Audit
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  @@map("invoices")
  @@index([organizationId])
  @@index([status])
}

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  OVERDUE
  CANCELLED
}
```

#### Implementation

```typescript
// lib/db/client.ts
import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '@/lib/security/encryption';

// Extended client with encryption
export class SecurePrismaClient extends PrismaClient {
  constructor() {
    super({
      log: ['error', 'warn'],
      errorFormat: 'pretty',
    });
    
    // Middleware for encryption
    this.$use(async (params, next) => {
      // Encrypt personal data before storing
      if (params.model === 'User' && params.action === 'create') {
        if (params.args.data.personalNumber) {
          params.args.data.personalNumber = encrypt(
            params.args.data.personalNumber
          );
        }
      }
      
      const result = await next(params);
      
      // Decrypt personal data after reading
      if (params.model === 'User' && result) {
        if (Array.isArray(result)) {
          result.forEach(user => {
            if (user.personalNumber) {
              user.personalNumber = decrypt(user.personalNumber);
            }
          });
        } else if (result.personalNumber) {
          result.personalNumber = decrypt(result.personalNumber);
        }
      }
      
      return result;
    });
    
    // Audit log middleware
    this.$use(async (params, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();
      
      // Log data access for compliance
      await this.auditLog.create({
        data: {
          model: params.model!,
          action: params.action,
          duration: after - before,
          userId: getCurrentUserId(),
          timestamp: new Date(),
        },
      });
      
      return result;
    });
  }
  
  // GDPR compliance methods
  async deleteUserData(userId: string): Promise<void> {
    // Soft delete with audit trail
    await this.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        email: `deleted-${userId}@example.com`,
        name: 'Deleted User',
        personalNumber: null,
      },
    });
  }
  
  async exportUserData(userId: string): Promise<any> {
    const user = await this.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
        // Include all related data
      },
    });
    
    return {
      user,
      exportedAt: new Date(),
      format: 'json',
    };
  }
}

// Singleton instance
export const db = new SecurePrismaClient();
```

## Storage Integrations

### S3-Compatible Storage

Object storage with Norwegian data residency options.

#### Installation

```bash
xaheen add s3 --provider=aws
```

#### Implementation

```typescript
// lib/storage/s3/client.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class StorageClient {
  private s3: S3Client;
  private bucket: string;
  
  constructor(config: StorageConfig) {
    this.s3 = new S3Client({
      region: config.region || 'eu-north-1', // Stockholm for Nordic
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
    });
    this.bucket = config.bucket;
  }
  
  async uploadFile(
    key: string,
    file: Buffer | Uint8Array | Blob,
    options?: UploadOptions
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: options?.contentType,
      ServerSideEncryption: 'AES256', // Always encrypt
      Metadata: {
        ...options?.metadata,
        gdpr_classification: options?.gdprClassification || 'public',
      },
      Tagging: options?.tags ? 
        Object.entries(options.tags)
          .map(([k, v]) => `${k}=${v}`)
          .join('&') : undefined,
    });
    
    await this.s3.send(command);
    
    return `https://${this.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;
  }
  
  async getPresignedUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    
    return await getSignedUrl(this.s3, command, { expiresIn });
  }
  
  async deleteFile(key: string): Promise<void> {
    // GDPR compliance - actual deletion
    await this.s3.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
    
    // Audit log
    await this.auditDeletion(key);
  }
}
```

## Integration Architecture

### Adapter Pattern

```typescript
// Base adapter interface
interface IntegrationAdapter<TConfig, TClient> {
  configure(config: TConfig): void;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getClient(): TClient;
  healthCheck(): Promise<HealthStatus>;
}

// Example implementation
export class VippsAdapter implements IntegrationAdapter<VippsConfig, VippsClient> {
  private client: VippsClient | null = null;
  private config: VippsConfig | null = null;
  
  configure(config: VippsConfig): void {
    this.config = config;
    this.validateConfig();
  }
  
  async connect(): Promise<void> {
    if (!this.config) {
      throw new Error('Adapter not configured');
    }
    
    this.client = new VippsClient(this.config);
    await this.client.authenticate();
  }
  
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.logout();
      this.client = null;
    }
  }
  
  getClient(): VippsClient {
    if (!this.client) {
      throw new Error('Client not connected');
    }
    return this.client;
  }
  
  async healthCheck(): Promise<HealthStatus> {
    try {
      await this.client?.ping();
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error.message,
        timestamp: new Date(),
      };
    }
  }
}
```

### Circuit Breaker Pattern

```typescript
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime: number | null = null;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000,
    private resetTimeout: number = 30000
  ) {}
  
  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => T
  ): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime! > this.resetTimeout) {
        this.state = 'half-open';
      } else if (fallback) {
        return fallback();
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }
  
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }
}
```

### Integration Manager

```typescript
export class IntegrationManager {
  private adapters = new Map<string, IntegrationAdapter<any, any>>();
  private circuitBreakers = new Map<string, CircuitBreaker>();
  
  register(name: string, adapter: IntegrationAdapter<any, any>): void {
    this.adapters.set(name, adapter);
    this.circuitBreakers.set(name, new CircuitBreaker());
  }
  
  async initialize(): Promise<void> {
    const connections = Array.from(this.adapters.entries()).map(
      async ([name, adapter]) => {
        try {
          await adapter.connect();
          console.log(`Connected to ${name}`);
        } catch (error) {
          console.error(`Failed to connect to ${name}:`, error);
        }
      }
    );
    
    await Promise.all(connections);
  }
  
  async execute<T>(
    integration: string,
    operation: (client: any) => Promise<T>
  ): Promise<T> {
    const adapter = this.adapters.get(integration);
    const circuitBreaker = this.circuitBreakers.get(integration);
    
    if (!adapter || !circuitBreaker) {
      throw new Error(`Integration ${integration} not found`);
    }
    
    return await circuitBreaker.execute(async () => {
      const client = adapter.getClient();
      return await operation(client);
    });
  }
  
  async healthCheck(): Promise<Record<string, HealthStatus>> {
    const checks: Record<string, HealthStatus> = {};
    
    for (const [name, adapter] of this.adapters.entries()) {
      checks[name] = await adapter.healthCheck();
    }
    
    return checks;
  }
}
```

## Best Practices

### 1. Environment Configuration

```typescript
// config/integrations.ts
export const integrationConfig = {
  vipps: {
    enabled: process.env.VIPPS_ENABLED === 'true',
    config: {
      clientId: process.env.VIPPS_CLIENT_ID!,
      clientSecret: process.env.VIPPS_CLIENT_SECRET!,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
    },
  },
  bankid: {
    enabled: process.env.BANKID_ENABLED === 'true',
    config: {
      // Configuration
    },
  },
  // More integrations...
};

// Validate on startup
export function validateIntegrations(): void {
  Object.entries(integrationConfig).forEach(([name, config]) => {
    if (config.enabled) {
      validateConfig(name, config.config);
    }
  });
}
```

### 2. Error Handling

```typescript
export class IntegrationError extends Error {
  constructor(
    public integration: string,
    public operation: string,
    public originalError: any,
    public retryable: boolean = true
  ) {
    super(`${integration} error in ${operation}: ${originalError.message}`);
    this.name = 'IntegrationError';
  }
}

export async function withErrorHandling<T>(
  integration: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    // Log to monitoring
    logger.error(`Integration error`, {
      integration,
      operation,
      error,
    });
    
    // Check if retryable
    const retryable = isRetryableError(error);
    
    throw new IntegrationError(
      integration,
      operation,
      error,
      retryable
    );
  }
}
```

### 3. Security Best Practices

```typescript
// Security middleware for integrations
export function secureIntegration(integration: string) {
  return {
    // Validate webhook signatures
    validateWebhook(signature: string, body: any): boolean {
      const secret = getWebhookSecret(integration);
      const computed = computeSignature(secret, body);
      return timingSafeEqual(signature, computed);
    },
    
    // Encrypt sensitive data
    encryptData(data: any): string {
      return encrypt(JSON.stringify(data), getEncryptionKey(integration));
    },
    
    // Rate limiting
    async checkRateLimit(operation: string): Promise<void> {
      const key = `${integration}:${operation}`;
      const limit = getRateLimit(integration, operation);
      
      if (await isRateLimited(key, limit)) {
        throw new Error('Rate limit exceeded');
      }
    },
    
    // Audit logging
    async auditLog(operation: string, data: any): Promise<void> {
      await logAuditEvent({
        integration,
        operation,
        timestamp: new Date(),
        user: getCurrentUser(),
        data: sanitizeForAudit(data),
      });
    },
  };
}
```

### 4. Testing Integrations

```typescript
// Integration test utilities
export class IntegrationTestHelper {
  private mocks = new Map<string, any>();
  
  mockIntegration(name: string, mock: any): void {
    this.mocks.set(name, mock);
  }
  
  async testIntegration(
    name: string,
    scenarios: TestScenario[]
  ): Promise<TestResults> {
    const results: TestResults = {
      passed: 0,
      failed: 0,
      errors: [],
    };
    
    for (const scenario of scenarios) {
      try {
        await scenario.test(this.mocks.get(name));
        results.passed++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          scenario: scenario.name,
          error: error.message,
        });
      }
    }
    
    return results;
  }
}

// Example test
describe('Vipps Integration', () => {
  const helper = new IntegrationTestHelper();
  
  beforeEach(() => {
    helper.mockIntegration('vipps', {
      createPayment: jest.fn().mockResolvedValue({
        paymentId: 'test-123',
        paymentUrl: 'https://vipps.no/pay/test-123',
      }),
    });
  });
  
  it('should create payment', async () => {
    const results = await helper.testIntegration('vipps', [
      {
        name: 'Create payment',
        test: async (vipps) => {
          const payment = await vipps.createPayment({
            amount: 100,
            description: 'Test payment',
          });
          expect(payment.paymentId).toBeDefined();
        },
      },
    ]);
    
    expect(results.passed).toBe(1);
  });
});
```

---

> **For Agents**: This integrations guide provides comprehensive documentation for all available integrations in Xaheen. Each integration includes installation, configuration, implementation examples, and best practices. Pay special attention to Norwegian-specific integrations (Vipps, BankID, Altinn) when working with Norwegian projects, and always ensure proper compliance configuration for GDPR and NSM requirements.