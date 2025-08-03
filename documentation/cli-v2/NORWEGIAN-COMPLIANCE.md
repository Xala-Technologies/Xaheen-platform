# Norwegian Compliance Documentation

Comprehensive guide to Norwegian compliance features in Xaheen CLI v2, including BankID, Vipps, Altinn, and government regulations.

## Overview

Xaheen CLI v2 provides built-in support for Norwegian compliance requirements, making it the ideal choice for developing applications in the Norwegian market. Our compliance features cover identity verification, payments, government services, and regulatory requirements.

## Compliance Standards

### Regulatory Framework
- **GDPR (General Data Protection Regulation)** - European privacy regulation
- **Norwegian Personal Data Act** - National privacy law implementation
- **Financial Supervisory Authority (FSA)** - Financial services regulation
- **NSM (National Security Authority)** - Security guidelines for government
- **WCAG 2.2 AA** - Web accessibility standards
- **Norwegian Archive Law** - Data retention requirements

### Government Requirements
- **Digital Government Strategy** - Norway's digitalization framework
- **Common Technology Architecture** - Government IT architecture standards
- **Security Framework** - National security requirements
- **Accessibility Regulations** - Universal design requirements

---

## BankID Integration

BankID is Norway's national digital identity solution, used by 4.5 million Norwegians.

### Overview
- **Coverage:** 95% of Norwegian population age 15+
- **Usage:** 1 billion authentications annually
- **Security:** Qualified electronic signature under eIDAS
- **Providers:** All major Norwegian banks

### Technical Implementation

#### Configuration
```typescript
// src/services/auth/bankid/config.ts
export const bankIdConfig = {
  // Environment settings
  environment: process.env.BANKID_ENVIRONMENT || 'test', // 'test' or 'production'
  
  // Client configuration
  clientId: process.env.BANKID_CLIENT_ID,
  clientSecret: process.env.BANKID_CLIENT_SECRET,
  redirectUri: process.env.BANKID_REDIRECT_URI,
  
  // BankID specific settings
  scope: 'openid profile',
  responseType: 'code',
  
  // Security settings
  state: true, // Enable CSRF protection
  nonce: true, // Enable replay attack protection
  
  // UI settings
  ui_locales: 'nb-NO',
  acr_values: 'Level3', // Security level (Level3 or Level4)
  
  // Certificate settings (production only)
  certificate: process.env.BANKID_CERTIFICATE,
  privateKey: process.env.BANKID_PRIVATE_KEY,
  
  // Endpoints
  endpoints: {
    test: {
      authorization: 'https://oidc-ver1.difi.no/idporten-oidc-provider/authorize',
      token: 'https://oidc-ver1.difi.no/idporten-oidc-provider/token',
      userinfo: 'https://oidc-ver1.difi.no/idporten-oidc-provider/userinfo',
      jwks: 'https://oidc-ver1.difi.no/idporten-oidc-provider/jwk'
    },
    production: {
      authorization: 'https://oidc.difi.no/idporten-oidc-provider/authorize',
      token: 'https://oidc.difi.no/idporten-oidc-provider/token',
      userinfo: 'https://oidc.difi.no/idporten-oidc-provider/userinfo',
      jwks: 'https://oidc.difi.no/idporten-oidc-provider/jwk'
    }
  }
};
```

#### Authentication Service
```typescript
// src/services/auth/bankid/service.ts
import jwt from 'jsonwebtoken';
import { bankIdConfig } from './config';

export class BankIDService {
  private config = bankIdConfig;
  
  /**
   * Generate BankID authentication URL
   */
  generateAuthUrl(state?: string, nonce?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: this.config.responseType,
      scope: this.config.scope,
      redirect_uri: this.config.redirectUri,
      ui_locales: this.config.ui_locales,
      acr_values: this.config.acr_values,
      state: state || this.generateState(),
      nonce: nonce || this.generateNonce()
    });
    
    const endpoint = this.config.endpoints[this.config.environment];
    return `${endpoint.authorization}?${params.toString()}`;
  }
  
  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string, state: string): Promise<BankIDTokens> {
    const tokenEndpoint = this.config.endpoints[this.config.environment].token;
    
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri
      })
    });
    
    if (!response.ok) {
      throw new BankIDError('Token exchange failed', response.status);
    }
    
    return response.json();
  }
  
  /**
   * Verify and decode ID token
   */
  async verifyIdToken(idToken: string): Promise<BankIDUserInfo> {
    // Get JWKS for token verification
    const jwksEndpoint = this.config.endpoints[this.config.environment].jwks;
    const jwksResponse = await fetch(jwksEndpoint);
    const jwks = await jwksResponse.json();
    
    // Verify token signature and claims
    const decoded = jwt.verify(idToken, jwks, {
      issuer: 'https://oidc.difi.no/idporten-oidc-provider/',
      audience: this.config.clientId,
      algorithms: ['RS256']
    }) as BankIDClaims;
    
    return {
      pid: decoded.pid, // Norwegian national ID (fødselsnummer)
      sub: decoded.sub, // Subject identifier
      name: decoded.name,
      given_name: decoded.given_name,
      family_name: decoded.family_name,
      birthdate: decoded.birthdate,
      address: decoded.address,
      security_level: decoded.acr // Security level used
    };
  }
  
  /**
   * Get additional user information
   */
  async getUserInfo(accessToken: string): Promise<BankIDUserInfo> {
    const userinfoEndpoint = this.config.endpoints[this.config.environment].userinfo;
    
    const response = await fetch(userinfoEndpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new BankIDError('Failed to fetch user info', response.status);
    }
    
    return response.json();
  }
  
  private generateState(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }
  
  private generateNonce(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }
}

// Type definitions
interface BankIDTokens {
  access_token: string;
  id_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface BankIDClaims {
  pid: string; // Norwegian national ID
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  birthdate: string;
  address?: {
    street_address: string;
    postal_code: string;
    locality: string;
    country: 'NO';
  };
  acr: 'Level3' | 'Level4'; // Security level
  amr: string[]; // Authentication methods
  aud: string;
  iss: string;
  exp: number;
  iat: number;
}

interface BankIDUserInfo {
  pid: string;
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  birthdate: string;
  address?: any;
  security_level: string;
}

class BankIDError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'BankIDError';
  }
}
```

#### React Components
```typescript
// src/components/auth/BankIDLogin.tsx
import React from 'react';
import { useBankID } from '@/hooks/useBankID';

interface BankIDLoginProps {
  onSuccess?: (user: BankIDUserInfo) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export const BankIDLogin: React.FC<BankIDLoginProps> = ({
  onSuccess,
  onError,
  className = ''
}) => {
  const { login, loading, error } = useBankID();
  
  const handleLogin = async () => {
    try {
      const user = await login();
      onSuccess?.(user);
    } catch (err) {
      onError?.(err as Error);
    }
  };
  
  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className={`bankid-button ${className}`}
      aria-label="Logg inn med BankID"
    >
      {loading ? (
        <span>Laster...</span>
      ) : (
        <>
          <BankIDIcon />
          <span>Logg inn med BankID</span>
        </>
      )}
      {error && (
        <div className="error-message" role="alert">
          {error.message}
        </div>
      )}
    </button>
  );
};

// Custom hook for BankID
function useBankID() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const login = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Redirect to BankID
      const authUrl = `/api/auth/bankid`;
      window.location.href = authUrl;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return { login, loading, error };
}
```

### Environment Variables
```bash
# BankID Configuration
BANKID_ENVIRONMENT=test                                    # 'test' or 'production'
BANKID_CLIENT_ID=your-client-id                          # From Digitaliseringsdirektoratet
BANKID_CLIENT_SECRET=your-client-secret                  # Client secret
BANKID_REDIRECT_URI=https://your-app.no/auth/bankid/callback

# Production certificates (required for production)
BANKID_CERTIFICATE=-----BEGIN CERTIFICATE-----...        # X.509 certificate
BANKID_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...        # Private key

# Optional settings
BANKID_SECURITY_LEVEL=Level3                             # Level3 or Level4
BANKID_UI_LOCALE=nb-NO                                   # User interface language
```

---

## Vipps Payment Integration

Vipps is Norway's leading mobile payment solution with 4 million users.

### Overview
- **Users:** 4+ million Norwegians (95% smartphone penetration)
- **Transactions:** 1+ billion annually
- **Regulation:** FSA (Financial Supervisory Authority) regulated
- **Integration:** Real-time payments via mobile app

### Technical Implementation

#### Configuration
```typescript
// src/services/payments/vipps/config.ts
export const vippsConfig = {
  // Environment
  environment: process.env.VIPPS_ENVIRONMENT || 'test', // 'test' or 'production'
  
  // API credentials
  clientId: process.env.VIPPS_CLIENT_ID,
  clientSecret: process.env.VIPPS_CLIENT_SECRET,
  subscriptionKey: process.env.VIPPS_SUBSCRIPTION_KEY,
  merchantSerialNumber: process.env.VIPPS_MERCHANT_SERIAL_NUMBER,
  
  // API endpoints
  endpoints: {
    test: {
      base: 'https://apitest.vipps.no',
      ecom: 'https://apitest.vipps.no/ecomm/v2',
      auth: 'https://apitest.vipps.no/accesstoken/get'
    },
    production: {
      base: 'https://api.vipps.no',
      ecom: 'https://api.vipps.no/ecomm/v2',
      auth: 'https://api.vipps.no/accesstoken/get'
    }
  },
  
  // Payment settings
  currency: 'NOK',
  language: 'no',
  
  // Callback URLs
  callbacks: {
    success: process.env.VIPPS_SUCCESS_URL || '/payment/success',
    cancel: process.env.VIPPS_CANCEL_URL || '/payment/cancel',
    fallback: process.env.VIPPS_FALLBACK_URL || '/payment/fallback'
  }
};
```

#### Payment Service
```typescript
// src/services/payments/vipps/service.ts
export class VippsService {
  private config = vippsConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  
  /**
   * Get access token for Vipps API
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }
    
    const endpoint = this.config.endpoints[this.config.environment];
    
    const response = await fetch(endpoint.auth, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
        'client_id': this.config.clientId,
        'client_secret': this.config.clientSecret
      }
    });
    
    if (!response.ok) {
      throw new VippsError('Failed to get access token', response.status);
    }
    
    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 30000; // 30s buffer
    
    return this.accessToken;
  }
  
  /**
   * Initiate payment
   */
  async initiatePayment(payment: VippsPaymentRequest): Promise<VippsPaymentResponse> {
    const accessToken = await this.getAccessToken();
    const endpoint = this.config.endpoints[this.config.environment];
    
    const paymentData = {
      merchantInfo: {
        merchantSerialNumber: this.config.merchantSerialNumber,
        callbackPrefix: payment.callbackPrefix || process.env.NEXT_PUBLIC_APP_URL,
        fallBack: this.config.callbacks.fallback,
        paymentType: 'eComm Regular Payment'
      },
      customerInfo: {
        mobileNumber: payment.customerPhone
      },
      transaction: {
        orderId: payment.orderId,
        amount: Math.round(payment.amount * 100), // Convert to øre
        transactionText: payment.description,
        timeStamp: new Date().toISOString(),
        skipLandingPage: payment.skipLandingPage || false
      }
    };
    
    const response = await fetch(`${endpoint.ecom}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
        'X-Request-Id': this.generateRequestId(),
        'X-TimeStamp': new Date().toISOString(),
        'X-Source-Address': '127.0.0.1'
      },
      body: JSON.stringify(paymentData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new VippsError(`Payment initiation failed: ${error.message}`, response.status);
    }
    
    return response.json();
  }
  
  /**
   * Get payment details
   */
  async getPaymentDetails(orderId: string): Promise<VippsPaymentDetails> {
    const accessToken = await this.getAccessToken();
    const endpoint = this.config.endpoints[this.config.environment];
    
    const response = await fetch(`${endpoint.ecom}/payments/${orderId}/details`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
        'X-Request-Id': this.generateRequestId(),
        'X-TimeStamp': new Date().toISOString()
      }
    });
    
    if (!response.ok) {
      throw new VippsError('Failed to get payment details', response.status);
    }
    
    return response.json();
  }
  
  /**
   * Capture payment (for reserve-capture flow)
   */
  async capturePayment(orderId: string, amount?: number, text?: string): Promise<void> {
    const accessToken = await this.getAccessToken();
    const endpoint = this.config.endpoints[this.config.environment];
    
    const captureData = {
      merchantInfo: {
        merchantSerialNumber: this.config.merchantSerialNumber
      },
      transaction: {
        amount: amount ? Math.round(amount * 100) : undefined,
        transactionText: text || 'Capture payment'
      }
    };
    
    const response = await fetch(`${endpoint.ecom}/payments/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
        'X-Request-Id': this.generateRequestId(),
        'X-TimeStamp': new Date().toISOString()
      },
      body: JSON.stringify(captureData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new VippsError(`Payment capture failed: ${error.message}`, response.status);
    }
  }
  
  /**
   * Refund payment
   */
  async refundPayment(orderId: string, amount: number, text: string): Promise<void> {
    const accessToken = await this.getAccessToken();
    const endpoint = this.config.endpoints[this.config.environment];
    
    const refundData = {
      merchantInfo: {
        merchantSerialNumber: this.config.merchantSerialNumber
      },
      transaction: {
        amount: Math.round(amount * 100),
        transactionText: text
      }
    };
    
    const response = await fetch(`${endpoint.ecom}/payments/${orderId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
        'X-Request-Id': this.generateRequestId(),
        'X-TimeStamp': new Date().toISOString()
      },
      body: JSON.stringify(refundData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new VippsError(`Payment refund failed: ${error.message}`, response.status);
    }
  }
  
  private generateRequestId(): string {
    return require('crypto').randomUUID();
  }
}

// Type definitions
interface VippsPaymentRequest {
  orderId: string;
  amount: number; // In NOK
  description: string;
  customerPhone?: string;
  callbackPrefix?: string;
  skipLandingPage?: boolean;
}

interface VippsPaymentResponse {
  orderId: string;
  url: string; // Redirect URL for payment
}

interface VippsPaymentDetails {
  orderId: string;
  transactionInfo: {
    amount: number;
    status: 'INITIATE' | 'REGISTER' | 'RESERVE' | 'CAPTURE' | 'CANCEL' | 'REFUND';
    timeStamp: string;
    transactionId: string;
  };
  transactionSummary: {
    capturedAmount: number;
    remainingAmountToCapture: number;
    refundedAmount: number;
    remainingAmountToRefund: number;
  };
}

class VippsError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'VippsError';
  }
}
```

#### React Components
```typescript
// src/components/payments/VippsCheckout.tsx
import React from 'react';
import { useVipps } from '@/hooks/useVipps';

interface VippsCheckoutProps {
  amount: number;
  description: string;
  orderId: string;
  onSuccess?: (orderId: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export const VippsCheckout: React.FC<VippsCheckoutProps> = ({
  amount,
  description,
  orderId,
  onSuccess,
  onError,
  className = ''
}) => {
  const { initiatePayment, loading, error } = useVipps();
  
  const handlePayment = async () => {
    try {
      const paymentUrl = await initiatePayment({
        orderId,
        amount,
        description
      });
      
      // Redirect to Vipps
      window.location.href = paymentUrl;
    } catch (err) {
      onError?.(err as Error);
    }
  };
  
  const formattedAmount = new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK'
  }).format(amount);
  
  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`vipps-button ${className}`}
      aria-label={`Betal ${formattedAmount} med Vipps`}
    >
      {loading ? (
        <span>Starter betaling...</span>
      ) : (
        <>
          <VippsIcon />
          <span>Betal {formattedAmount}</span>
        </>
      )}
      {error && (
        <div className="error-message" role="alert">
          {error.message}
        </div>
      )}
    </button>
  );
};
```

### Environment Variables
```bash
# Vipps Configuration
VIPPS_ENVIRONMENT=test                                    # 'test' or 'production'
VIPPS_CLIENT_ID=your-client-id                          # From Vipps Developer Portal
VIPPS_CLIENT_SECRET=your-client-secret                  # Client secret
VIPPS_SUBSCRIPTION_KEY=your-subscription-key            # API subscription key
VIPPS_MERCHANT_SERIAL_NUMBER=123456                     # Your merchant number

# Callback URLs
VIPPS_SUCCESS_URL=https://your-app.no/payment/success
VIPPS_CANCEL_URL=https://your-app.no/payment/cancel
VIPPS_FALLBACK_URL=https://your-app.no/payment/fallback
```

---

## Altinn Integration

Altinn is Norway's digital government platform for public services.

### Overview
- **Services:** 1000+ digital government services
- **Users:** 5+ million Norwegians and 700,000 businesses
- **APIs:** 50+ government APIs and services
- **Compliance:** Full government integration platform

### Technical Implementation

#### Configuration
```typescript
// src/services/government/altinn/config.ts
export const altinnConfig = {
  // Environment
  environment: process.env.ALTINN_ENVIRONMENT || 'test', // 'test' or 'production'
  
  // API credentials
  apiKey: process.env.ALTINN_API_KEY,
  subscriptionKey: process.env.ALTINN_SUBSCRIPTION_KEY,
  
  // Organization info
  organizationNumber: process.env.ALTINN_ORG_NUMBER,
  
  // API endpoints
  endpoints: {
    test: {
      base: 'https://tt02.altinn.no/api',
      authentication: 'https://tt02.altinn.no/api/authentication',
      authorization: 'https://tt02.altinn.no/api/authorization',
      register: 'https://tt02.altinn.no/api/register',
      metadata: 'https://tt02.altinn.no/api/metadata'
    },
    production: {
      base: 'https://www.altinn.no/api',
      authentication: 'https://www.altinn.no/api/authentication',
      authorization: 'https://www.altinn.no/api/authorization',
      register: 'https://www.altinn.no/api/register',
      metadata: 'https://www.altinn.no/api/metadata'
    }
  }
};
```

#### Service Implementation
```typescript
// src/services/government/altinn/service.ts
export class AltinnService {
  private config = altinnConfig;
  
  /**
   * Get organization information
   */
  async getOrganization(organizationNumber: string): Promise<AltinnOrganization> {
    const endpoint = this.config.endpoints[this.config.environment];
    
    const response = await fetch(`${endpoint.register}/organizations/${organizationNumber}`, {
      headers: {
        'ApiKey': this.config.apiKey,
        'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new AltinnError('Failed to get organization', response.status);
    }
    
    return response.json();
  }
  
  /**
   * Get person information
   */
  async getPerson(socialSecurityNumber: string): Promise<AltinnPerson> {
    const endpoint = this.config.endpoints[this.config.environment];
    
    const response = await fetch(`${endpoint.register}/persons/${socialSecurityNumber}`, {
      headers: {
        'ApiKey': this.config.apiKey,
        'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new AltinnError('Failed to get person', response.status);
    }
    
    return response.json();
  }
  
  /**
   * Submit form data
   */
  async submitForm(serviceCode: string, serviceEdition: string, formData: any): Promise<AltinnSubmissionResult> {
    const endpoint = this.config.endpoints[this.config.environment];
    
    const response = await fetch(`${endpoint.base}/${this.config.organizationNumber}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': this.config.apiKey,
        'Ocp-Apim-Subscription-Key': this.config.subscriptionKey
      },
      body: JSON.stringify({
        ServiceCode: serviceCode,
        ServiceEdition: serviceEdition,
        FormData: formData
      })
    });
    
    if (!response.ok) {
      throw new AltinnError('Failed to submit form', response.status);
    }
    
    return response.json();
  }
  
  /**
   * Get available services
   */
  async getAvailableServices(): Promise<AltinnService[]> {
    const endpoint = this.config.endpoints[this.config.environment];
    
    const response = await fetch(`${endpoint.metadata}/services`, {
      headers: {
        'ApiKey': this.config.apiKey,
        'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new AltinnError('Failed to get services', response.status);
    }
    
    return response.json();
  }
}

// Type definitions
interface AltinnOrganization {
  organizationNumber: string;
  name: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  businessType: string;
  registrationDate: string;
}

interface AltinnPerson {
  socialSecurityNumber: string;
  firstName: string;
  lastName: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  dateOfBirth: string;
}

interface AltinnSubmissionResult {
  messageId: string;
  status: 'Submitted' | 'Processing' | 'Completed' | 'Failed';
  submissionDate: string;
}

class AltinnError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'AltinnError';
  }
}
```

---

## GDPR Compliance

### Data Protection Framework

#### Consent Management
```typescript
// src/services/compliance/gdpr/consent.ts
export class ConsentManager {
  private storage = typeof window !== 'undefined' ? localStorage : null;
  
  /**
   * Record user consent
   */
  recordConsent(purposes: ConsentPurpose[], userId?: string): ConsentRecord {
    const consent: ConsentRecord = {
      id: this.generateConsentId(),
      userId,
      purposes,
      timestamp: new Date().toISOString(),
      ipAddress: this.getClientIP(),
      userAgent: navigator?.userAgent,
      version: '2.0'
    };
    
    // Store consent
    this.storeConsent(consent);
    
    // Log for audit trail
    this.logConsentEvent('granted', consent);
    
    return consent;
  }
  
  /**
   * Withdraw consent
   */
  withdrawConsent(consentId: string, purposes: string[]): void {
    const consent = this.getConsent(consentId);
    if (!consent) {
      throw new Error('Consent record not found');
    }
    
    // Update purposes
    consent.purposes = consent.purposes.map(purpose => 
      purposes.includes(purpose.purpose) 
        ? { ...purpose, granted: false, withdrawnAt: new Date().toISOString() }
        : purpose
    );
    
    // Store updated consent
    this.storeConsent(consent);
    
    // Log withdrawal
    this.logConsentEvent('withdrawn', consent);
  }
  
  /**
   * Check if user has consented to specific purpose
   */
  hasConsent(purpose: string, userId?: string): boolean {
    const consents = this.getUserConsents(userId);
    
    for (const consent of consents) {
      const consentPurpose = consent.purposes.find(p => p.purpose === purpose);
      if (consentPurpose && consentPurpose.granted && !consentPurpose.withdrawnAt) {
        return true;
      }
    }
    
    return false;
  }
}

interface ConsentPurpose {
  purpose: string; // 'analytics', 'marketing', 'functional', etc.
  granted: boolean;
  description: string;
  required: boolean;
  withdrawnAt?: string;
}

interface ConsentRecord {
  id: string;
  userId?: string;
  purposes: ConsentPurpose[];
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  version: string;
}
```

#### Data Export/Import
```typescript
// src/services/compliance/gdpr/data-export.ts
export class DataExportService {
  /**
   * Export all user data (Right to Data Portability)
   */
  async exportUserData(userId: string): Promise<UserDataExport> {
    const [
      profile,
      activities,
      preferences,
      consents,
      communications
    ] = await Promise.all([
      this.getUserProfile(userId),
      this.getUserActivities(userId),
      this.getUserPreferences(userId),
      this.getUserConsents(userId),
      this.getUserCommunications(userId)
    ]);
    
    return {
      exportDate: new Date().toISOString(),
      userId,
      format: 'JSON',
      data: {
        profile,
        activities,
        preferences,
        consents,
        communications
      },
      metadata: {
        version: '2.0',
        generator: 'Xaheen CLI v2 GDPR Export',
        rights: [
          'Right to Data Portability (Article 20)',
          'Right of Access (Article 15)'
        ]
      }
    };
  }
  
  /**
   * Delete all user data (Right to Erasure)
   */
  async deleteUserData(userId: string, reason: string): Promise<DeletionResult> {
    const deletionId = this.generateDeletionId();
    
    try {
      // Mark for deletion
      await this.markForDeletion(userId, deletionId, reason);
      
      // Delete from all systems
      const results = await Promise.allSettled([
        this.deleteFromDatabase(userId),
        this.deleteFromCache(userId),
        this.deleteFromAnalytics(userId),
        this.deleteFromBackups(userId),
        this.deleteFromLogs(userId)
      ]);
      
      // Log deletion
      await this.logDeletion(userId, deletionId, results);
      
      return {
        deletionId,
        userId,
        deletedAt: new Date().toISOString(),
        reason,
        status: 'completed',
        systems: results.map((result, index) => ({
          system: ['database', 'cache', 'analytics', 'backups', 'logs'][index],
          status: result.status,
          error: result.status === 'rejected' ? result.reason : undefined
        }))
      };
      
    } catch (error) {
      await this.logDeletionError(userId, deletionId, error);
      throw error;
    }
  }
}
```

### Environment Variables
```bash
# GDPR Configuration
GDPR_DPO_EMAIL=dpo@your-company.no                      # Data Protection Officer email
GDPR_RETENTION_DAYS=2555                                # 7 years retention (Norwegian requirement)
GDPR_COOKIE_DOMAIN=.your-app.no                        # Cookie domain for consent
GDPR_CONSENT_VERSION=2.0                               # Consent framework version

# Data residency
DATA_RESIDENCY=norway                                   # Data must stay in Norway
BACKUP_LOCATION=norway                                  # Backup location
```

---

## Norwegian Localization

### Language Support
```typescript
// src/localization/nb-NO.json
{
  "auth": {
    "login": "Logg inn",
    "logout": "Logg ut",
    "bankid": "Logg inn med BankID",
    "loginSuccess": "Du er nå logget inn",
    "loginError": "Pålogging feilet"
  },
  "payments": {
    "pay": "Betal",
    "payWithVipps": "Betal med Vipps",
    "amount": "Beløp",
    "paymentSuccess": "Betaling vellykket",
    "paymentFailed": "Betaling feilet"
  },
  "dates": {
    "today": "i dag",
    "yesterday": "i går",
    "tomorrow": "i morgen"
  },
  "currency": {
    "nok": "kr",
    "format": "{amount} {currency}"
  },
  "validation": {
    "required": "Dette feltet er påkrevd",
    "email": "Ugyldig e-postadresse",
    "phone": "Ugyldig telefonnummer",
    "organizationNumber": "Ugyldig organisasjonsnummer",
    "personalNumber": "Ugyldig fødselsnummer"
  }
}
```

### Formatting Utilities
```typescript
// src/utils/norwegian-format.ts
export class NorwegianFormatter {
  /**
   * Format Norwegian currency (NOK)
   */
  static currency(amount: number): string {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 2
    }).format(amount);
  }
  
  /**
   * Format Norwegian date
   */
  static date(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(d);
  }
  
  /**
   * Format Norwegian phone number
   */
  static phoneNumber(phone: string): string {
    // Remove non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Norwegian mobile format: +47 XXX XX XXX
    if (digits.length === 8) {
      return `+47 ${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
    }
    
    return phone; // Return original if not valid Norwegian number
  }
  
  /**
   * Validate Norwegian organization number
   */
  static validateOrganizationNumber(orgNumber: string): boolean {
    const digits = orgNumber.replace(/\D/g, '');
    
    if (digits.length !== 9) return false;
    
    // Validate using mod11 algorithm
    const weights = [3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    
    for (let i = 0; i < 8; i++) {
      sum += parseInt(digits[i]) * weights[i];
    }
    
    const remainder = sum % 11;
    const checkDigit = remainder === 0 ? 0 : 11 - remainder;
    
    return checkDigit === parseInt(digits[8]);
  }
  
  /**
   * Validate Norwegian personal number (fødselsnummer)
   */
  static validatePersonalNumber(personalNumber: string): boolean {
    const digits = personalNumber.replace(/\D/g, '');
    
    if (digits.length !== 11) return false;
    
    // Validate date part
    const day = parseInt(digits.slice(0, 2));
    const month = parseInt(digits.slice(2, 4));
    const year = parseInt(digits.slice(4, 6));
    
    if (day < 1 || day > 31 || month < 1 || month > 12) {
      return false;
    }
    
    // Validate check digits using mod11
    const weights1 = [3, 7, 6, 1, 8, 9, 4, 5, 2];
    const weights2 = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    
    let sum1 = 0, sum2 = 0;
    
    for (let i = 0; i < 9; i++) {
      sum1 += parseInt(digits[i]) * weights1[i];
    }
    
    for (let i = 0; i < 10; i++) {
      sum2 += parseInt(digits[i]) * weights2[i];
    }
    
    const check1 = 11 - (sum1 % 11);
    const check2 = 11 - (sum2 % 11);
    
    return check1 === parseInt(digits[9]) && check2 === parseInt(digits[10]);
  }
}
```

---

## Security Guidelines

### NSM (National Security Authority) Compliance

#### Security Headers
```typescript
// src/middleware/security-headers.ts
export function addSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content type sniffing protection
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://api.vipps.no https://apitest.vipps.no",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.vipps.no https://apitest.vipps.no https://*.altinn.no",
    "font-src 'self'",
    "frame-src https://*.bankid.no https://*.vipps.no"
  ].join('; '));
  
  // HSTS (HTTP Strict Transport Security)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  next();
}
```

#### Data Encryption
```typescript
// src/utils/encryption.ts
import crypto from 'crypto';

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;
  private ivLength = 16;
  
  /**
   * Encrypt sensitive data
   */
  encrypt(data: string, key: Buffer): EncryptedData {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from('xaheen-cli-v2'));
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }
  
  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: EncryptedData, key: Buffer): string {
    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAAD(Buffer.from('xaheen-cli-v2'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  /**
   * Generate encryption key from password
   */
  generateKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, 100000, this.keyLength, 'sha256');
  }
}

interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}
```

---

## Accessibility (WCAG 2.2 AA)

### Component Accessibility
```typescript
// src/components/accessible/AccessibleForm.tsx
import React from 'react';

interface AccessibleFormProps {
  onSubmit: (data: FormData) => void;
  children: React.ReactNode;
  title: string;
}

export const AccessibleForm: React.FC<AccessibleFormProps> = ({
  onSubmit,
  children,
  title
}) => {
  const formId = `form-${React.useId()}`;
  const titleId = `${formId}-title`;
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };
  
  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      aria-labelledby={titleId}
      noValidate
    >
      <h2 id={titleId} className="sr-only">
        {title}
      </h2>
      {children}
    </form>
  );
};

// Accessible input component with error handling
export const AccessibleInput: React.FC<InputProps> = ({
  label,
  error,
  required,
  type = 'text',
  ...props
}) => {
  const inputId = `input-${React.useId()}`;
  const errorId = `${inputId}-error`;
  const describedBy = error ? errorId : undefined;
  
  return (
    <div className="form-field">
      <label htmlFor={inputId} className="form-label">
        {label}
        {required && <span aria-label="påkrevd">*</span>}
      </label>
      
      <input
        {...props}
        id={inputId}
        type={type}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        className={`form-input ${error ? 'form-input--error' : ''}`}
      />
      
      {error && (
        <div id={errorId} className="form-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
```

### Keyboard Navigation
```typescript
// src/hooks/useKeyboardNavigation.ts
export function useKeyboardNavigation(items: HTMLElement[]) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => (prev + 1) % items.length);
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => (prev - 1 + items.length) % items.length);
          break;
          
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
          
        case 'End':
          e.preventDefault();
          setFocusedIndex(items.length - 1);
          break;
          
        case 'Enter':
        case ' ':
          e.preventDefault();
          items[focusedIndex]?.click();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items, focusedIndex]);
  
  useEffect(() => {
    items[focusedIndex]?.focus();
  }, [focusedIndex, items]);
  
  return { focusedIndex, setFocusedIndex };
}
```

---

## Deployment Guidelines

### Azure Norway Regions
```typescript
// deployment/azure-norway.config.ts
export const azureNorwayConfig = {
  // Norwegian data centers
  regions: {
    primary: 'Norway East',    // Oslo
    secondary: 'Norway West'   // Stavanger
  },
  
  // Data residency requirements
  dataResidency: {
    location: 'Norway',
    backup: 'Norway',
    logging: 'Norway'
  },
  
  // Compliance requirements
  compliance: {
    gdpr: true,
    norwegianPrivacyLaw: true,
    governmentSecurity: true
  },
  
  // Resource configuration
  resources: {
    appService: {
      sku: 'P1V2', // Minimum for production
      region: 'Norway East'
    },
    database: {
      sku: 'S2', // Standard tier minimum
      region: 'Norway East',
      backup: {
        geoRedundant: false, // Keep in Norway
        region: 'Norway West'
      }
    },
    keyVault: {
      region: 'Norway East',
      accessPolicies: {
        enabledForDeployment: true,
        enabledForTemplateDeployment: true
      }
    }
  }
};
```

---

## Bundle Usage Examples

### Government Project
```bash
# Create Norwegian government application
xaheen create my-gov-app --preset norwegian-gov

# Resulting project includes:
# - BankID authentication
# - Vipps payments
# - Altinn integration
# - Norwegian localization
# - GDPR compliance
# - Azure deployment config
```

### Municipality Portal
```bash
# Create municipality citizen services portal
xaheen create citizen-portal --preset municipality-portal

# Add additional government services
xaheen add services --provider altinn
xaheen add compliance --provider wcag-aaa
```

### Healthcare System
```bash
# Create GDPR-compliant healthcare system
xaheen create patient-system --preset healthcare-management

# Additional compliance features
xaheen add audit --provider healthcare-audit
xaheen add encryption --provider aes-256
```

---

## Testing Norwegian Features

### Integration Tests
```typescript
// tests/integration/bankid.test.ts
describe('BankID Integration', () => {
  test('should authenticate user with BankID', async () => {
    const bankId = new BankIDService();
    const authUrl = bankId.generateAuthUrl();
    
    expect(authUrl).toContain('oidc-ver1.difi.no');
    expect(authUrl).toContain('client_id=');
    expect(authUrl).toContain('acr_values=Level3');
  });
  
  test('should validate Norwegian personal number', () => {
    expect(NorwegianFormatter.validatePersonalNumber('01019812345')).toBe(false);
    // Note: Using invalid number for test
  });
});

// tests/integration/vipps.test.ts
describe('Vipps Integration', () => {
  test('should initiate payment', async () => {
    const vipps = new VippsService();
    const payment = await vipps.initiatePayment({
      orderId: 'test-order-123',
      amount: 100,
      description: 'Test payment'
    });
    
    expect(payment.url).toContain('vipps.no');
    expect(payment.orderId).toBe('test-order-123');
  });
});
```

---

## Support and Resources

### Norwegian Government Resources
- **Digitaliseringsdirektoratet** - Digital transformation authority
- **Altinn Developer Portal** - Government API documentation
- **BankID Documentation** - Authentication integration guides
- **Vipps Developer Portal** - Payment integration resources

### Compliance Support
- **Data Protection Authority (Datatilsynet)** - GDPR compliance guidance
- **NSM Guidelines** - Security requirements for government systems
- **Norwegian Standards** - Technical compliance standards

### Development Resources
- **Norwegian Developer Community** - Local developer support
- **Government Code Repositories** - Open source government projects
- **Compliance Templates** - Ready-to-use compliance implementations

---

**Last Updated:** January 2025  
**Compliance Version:** 2.0.2  
**Maintainer:** Xala Technologies