/**
 * Norwegian Compliance Helper Functions
 *
 * Utility functions and helpers for implementing Norwegian compliance
 * in generated code and templates. These functions provide common
 * compliance patterns and snippets that can be used throughout
 * the scaffolding system.
 */

import { LocaleCode } from "../localization/types.js";
import {
	GDPRDataCategory,
	NSMClassification,
	WCAGLevel,
} from "./norwegian-compliance.js";

// === Template Helper Functions ===

/**
 * Generate WCAG compliance level comment
 */
export function wcagLevel(level: WCAGLevel): string {
	switch (level) {
		case WCAGLevel.A:
			return "WCAG 2.1 Level A Compliance";
		case WCAGLevel.AA:
			return "WCAG 2.1 Level AA Compliance";
		case WCAGLevel.AAA:
			return "WCAG 2.1 Level AAA Compliance";
		default:
			return "WCAG 2.1 Compliance";
	}
}

/**
 * Generate GDPR compliance notice
 */
export function gdprNotice(): string {
	return "GDPR: This component handles personal data in compliance with Norwegian data protection laws";
}

/**
 * Generate NSM classification comment
 */
export function nsmClassification(classification: NSMClassification): string {
	switch (classification) {
		case NSMClassification.OPEN:
			return "NSM Classification: OPEN - Public information";
		case NSMClassification.RESTRICTED:
			return "NSM Classification: RESTRICTED - Access controlled information";
		case NSMClassification.CONFIDENTIAL:
			return "NSM Classification: CONFIDENTIAL - Sensitive information requiring strong protection";
		case NSMClassification.SECRET:
			return "NSM Classification: SECRET - Highly sensitive information requiring maximum protection";
		default:
			return "NSM Classification: Not specified";
	}
}

// === Security Header Helpers ===

/**
 * Generate Content Security Policy header
 */
export function generateCSP(classification: NSMClassification): string {
	const baseCSP = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-eval' 'unsafe-inline'",
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' data: https:",
		"font-src 'self'",
		"connect-src 'self'",
	];

	if (
		classification === NSMClassification.SECRET ||
		classification === NSMClassification.CONFIDENTIAL
	) {
		// Stricter CSP for higher classifications
		return [
			"default-src 'self'",
			"script-src 'self'",
			"style-src 'self'",
			"img-src 'self' data:",
			"font-src 'self'",
			"connect-src 'self'",
			"frame-ancestors 'none'",
			"base-uri 'self'",
			"form-action 'self'",
		].join("; ");
	}

	return baseCSP.join("; ");
}

/**
 * Generate security headers object
 */
export function generateSecurityHeaders(
	classification: NSMClassification,
): Record<string, string> {
	const headers: Record<string, string> = {
		"X-Frame-Options": "DENY",
		"X-Content-Type-Options": "nosniff",
		"Referrer-Policy": "strict-origin-when-cross-origin",
		"X-XSS-Protection": "1; mode=block",
		"Content-Security-Policy": generateCSP(classification),
	};

	if (classification !== NSMClassification.OPEN) {
		headers["Strict-Transport-Security"] =
			"max-age=31536000; includeSubDomains";
		headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
	}

	if (
		classification === NSMClassification.SECRET ||
		classification === NSMClassification.CONFIDENTIAL
	) {
		headers["X-Permitted-Cross-Domain-Policies"] = "none";
		headers["X-Download-Options"] = "noopen";
		headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private";
	}

	return headers;
}

// === GDPR Helper Functions ===

/**
 * Generate GDPR consent management code
 */
export function generateGDPRConsent(): {
	interface: string;
	implementation: string;
	usage: string;
} {
	return {
		interface: `
interface GDPRConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: string;
  version: string;
}

interface ConsentManager {
  getConsent(): GDPRConsent | null;
  setConsent(consent: Partial<GDPRConsent>): void;
  revokeConsent(): void;
  hasConsent(category: keyof GDPRConsent): boolean;
}`,

		implementation: `
class GDPRConsentManager implements ConsentManager {
  private static readonly STORAGE_KEY = 'gdpr-consent';
  private static readonly CURRENT_VERSION = '1.0.0';
  
  getConsent(): GDPRConsent | null {
    try {
      const stored = localStorage.getItem(GDPRConsentManager.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
  
  setConsent(consent: Partial<GDPRConsent>): void {
    const fullConsent: GDPRConsent = {
      necessary: true, // Always true
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: new Date().toISOString(),
      version: GDPRConsentManager.CURRENT_VERSION,
      ...consent,
    };
    
    localStorage.setItem(GDPRConsentManager.STORAGE_KEY, JSON.stringify(fullConsent));
    
    // Emit consent change event
    window.dispatchEvent(new CustomEvent('gdpr-consent-changed', { 
      detail: fullConsent 
    }));
  }
  
  revokeConsent(): void {
    localStorage.removeItem(GDPRConsentManager.STORAGE_KEY);
    
    // Clear all non-necessary cookies and data
    this.clearNonNecessaryData();
    
    window.dispatchEvent(new CustomEvent('gdpr-consent-revoked'));
  }
  
  hasConsent(category: keyof GDPRConsent): boolean {
    const consent = this.getConsent();
    return consent ? consent[category] : false;
  }
  
  private clearNonNecessaryData(): void {
    // Implementation would clear analytics, marketing, and preference data
  }
}`,

		usage: `
// Usage in components
const consentManager = new GDPRConsentManager();

// Check consent before tracking
if (consentManager.hasConsent('analytics')) {
  // Analytics tracking code
}

// Listen for consent changes
window.addEventListener('gdpr-consent-changed', (event) => {
  const consent = event.detail;
  // Update tracking based on new consent
});`,
	};
}

/**
 * Generate GDPR data deletion code
 */
export function generateGDPRDeletion(): {
	interface: string;
	implementation: string;
} {
	return {
		interface: `
interface DataDeletionRequest {
  userId: string;
  categories: ('profile' | 'activity' | 'preferences' | 'all')[];
  reason?: string;
  requestedAt: string;
}

interface DataDeletionService {
  requestDeletion(request: DataDeletionRequest): Promise<string>;
  getDeleteionStatus(requestId: string): Promise<'pending' | 'processing' | 'completed' | 'failed'>;
  cancelDeletion(requestId: string): Promise<boolean>;
}`,

		implementation: `
class GDPRDataDeletionService implements DataDeletionService {
  async requestDeletion(request: DataDeletionRequest): Promise<string> {
    const requestId = crypto.randomUUID();
    
    // Log deletion request for audit trail
    console.log('GDPR deletion request:', {
      requestId,
      userId: request.userId,
      categories: request.categories,
      timestamp: new Date().toISOString(),
    });
    
    // Queue deletion job
    await this.queueDeletionJob(requestId, request);
    
    return requestId;
  }
  
  async getDeleteionStatus(requestId: string): Promise<'pending' | 'processing' | 'completed' | 'failed'> {
    // Implementation would check job status
    return 'pending';
  }
  
  async cancelDeletion(requestId: string): Promise<boolean> {
    // Implementation would cancel pending deletion
    return true;
  }
  
  private async queueDeletionJob(requestId: string, request: DataDeletionRequest): Promise<void> {
    // Implementation would queue background deletion job
  }
}`,
	};
}

// === WCAG Helper Functions ===

/**
 * Generate WCAG-compliant form validation
 */
export function generateWCAGFormValidation(): {
	component: string;
	styles: string;
} {
	return {
		component: `
interface WCAGFormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
}

const WCAGFormField: React.FC<WCAGFormFieldProps> = ({
  id,
  label,
  required,
  error,
  helperText,
  children,
}) => {
  const errorId = error ? \`\${id}-error\` : undefined;
  const helperId = helperText ? \`\${id}-helper\` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;
  
  return (
    <div className="wcag-form-field">
      <label 
        htmlFor={id}
        className={[\`wcag-form-label\`, required && 'required'].filter(Boolean).join(' ')}
      >
        {label}
        {required && <span aria-label="required" className="required-indicator">*</span>}
      </label>
      
      {React.cloneElement(children as React.ReactElement, {
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? 'true' : undefined,
      })}
      
      {helperText && (
        <div id={helperId} className="wcag-helper-text">
          {helperText}
        </div>
      )}
      
      {error && (
        <div 
          id={errorId} 
          className="wcag-error-text" 
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}
    </div>
  );
};`,

		styles: `
.wcag-form-field {
  margin-bottom: 1.5rem;
}

.wcag-form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.wcag-form-label.required .required-indicator {
  color: #dc2626;
  margin-left: 0.25rem;
}

.wcag-helper-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.wcag-error-text {
  font-size: 0.875rem;
  color: #dc2626;
  margin-top: 0.25rem;
  font-weight: 500;
}

/* Focus indicators for WCAG AAA compliance */
input:focus,
textarea:focus,
select:focus,
button:focus {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .wcag-form-label {
    color: #000000;
  }
  
  .wcag-error-text {
    color: #000000;
    background-color: #ffeb3b;
    padding: 0.25rem;
  }
}`,
	};
}

/**
 * Generate skip navigation links
 */
export function generateSkipNavigation(locale: LocaleCode = "nb-NO"): {
	component: string;
	styles: string;
} {
	const translations = {
		"nb-NO": {
			skipToContent: "Hopp til hovedinnhold",
			skipToNavigation: "Hopp til navigasjon",
			skipToSearch: "Hopp til søk",
		},
		"nn-NO": {
			skipToContent: "Hopp til hovudinnhald",
			skipToNavigation: "Hopp til navigasjon",
			skipToSearch: "Hopp til søk",
		},
		"en-US": {
			skipToContent: "Skip to main content",
			skipToNavigation: "Skip to navigation",
			skipToSearch: "Skip to search",
		},
	};

	const t = translations[locale] || translations["en-US"];

	return {
		component: `
const SkipNavigation: React.FC = () => {
  return (
    <nav className="skip-navigation" aria-label="Skip navigation">
      <a href="#main-content" className="skip-link">
        ${t.skipToContent}
      </a>
      <a href="#main-navigation" className="skip-link">
        ${t.skipToNavigation}
      </a>
      <a href="#search" className="skip-link">
        ${t.skipToSearch}
      </a>
    </nav>
  );
};`,

		styles: `
.skip-navigation {
  position: absolute;
  top: -40px;
  left: 6px;
  z-index: 1000;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 0 0 4px 4px;
  font-weight: 600;
  transition: top 0.15s ease-in-out;
}

.skip-link:focus {
  top: 0;
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .skip-link {
    background: #000;
    color: #fff;
    border: 2px solid #fff;
  }
}`,
	};
}

// === Norwegian Language Helpers ===

/**
 * Generate Norwegian locale support
 */
export function generateNorwegianLocaleSupport(): {
	dateFormatter: string;
	numberFormatter: string;
	currencyFormatter: string;
} {
	return {
		dateFormatter: `
class NorwegianDateFormatter {
  private static readonly LOCALES = {
    'nb-NO': 'nb-NO',
    'nn-NO': 'nn-NO',
  };
  
  static formatDate(date: Date, locale: 'nb-NO' | 'nn-NO' = 'nb-NO'): string {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }
  
  static formatDateTime(date: Date, locale: 'nb-NO' | 'nn-NO' = 'nb-NO'): string {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
  
  static formatTime(date: Date, locale: 'nb-NO' | 'nn-NO' = 'nb-NO'): string {
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}`,

		numberFormatter: `
class NorwegianNumberFormatter {
  static formatNumber(value: number, locale: 'nb-NO' | 'nn-NO' = 'nb-NO'): string {
    return new Intl.NumberFormat(locale).format(value);
  }
  
  static formatPercent(value: number, locale: 'nb-NO' | 'nn-NO' = 'nb-NO'): string {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }).format(value);
  }
  
  static formatDecimal(value: number, decimals: number = 2, locale: 'nb-NO' | 'nn-NO' = 'nb-NO'): string {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
}`,

		currencyFormatter: `
class NorwegianCurrencyFormatter {
  static formatNOK(amount: number, locale: 'nb-NO' | 'nn-NO' = 'nb-NO'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'NOK',
    }).format(amount);
  }
  
  static formatEUR(amount: number, locale: 'nb-NO' | 'nn-NO' = 'nb-NO'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }
  
  static formatUSD(amount: number, locale: 'nb-NO' | 'nn-NO' = 'nb-NO'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
}`,
	};
}

// === Audit Trail Helpers ===

/**
 * Generate audit trail code
 */
export function generateAuditTrail(classification: NSMClassification): {
	interface: string;
	implementation: string;
} {
	const includeDetails = classification !== NSMClassification.OPEN;

	return {
		interface: `
interface AuditEvent {
  id: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  action: string;
  resource: string;
  classification: '${classification}';
  result: 'success' | 'failure' | 'warning';
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

interface AuditLogger {
  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void>;
  query(filters: Partial<AuditEvent>): Promise<AuditEvent[]>;
}`,

		implementation: `
class ComplianceAuditLogger implements AuditLogger {
  private static readonly CLASSIFICATION = '${classification}';
  
  async log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      classification: ComplianceAuditLogger.CLASSIFICATION,
      ...event,
    };
    
    ${
			includeDetails
				? `
    // Enhanced logging for restricted/confidential data
    console.log('AUDIT:', {
      ...auditEvent,
      sensitiveDataHandled: true,
      complianceLevel: '${classification}',
    });
    
    // Store in secure audit log
    await this.storeSecureAuditEvent(auditEvent);
    `
				: `
    // Basic audit logging for open data
    console.log('AUDIT:', auditEvent);
    `
		}
  }
  
  async query(filters: Partial<AuditEvent>): Promise<AuditEvent[]> {
    // Implementation would query audit store with proper access controls
    return [];
  }
  
  ${
		includeDetails
			? `
  private async storeSecureAuditEvent(event: AuditEvent): Promise<void> {
    // Implementation would store in encrypted audit trail
    // with proper access controls and retention policies
  }
  `
			: ""
	}
}`,
	};
}

// === Export all helper functions ===

export const ComplianceHelpers = {
	wcagLevel,
	gdprNotice,
	nsmClassification,
	generateCSP,
	generateSecurityHeaders,
	generateGDPRConsent,
	generateGDPRDeletion,
	generateWCAGFormValidation,
	generateSkipNavigation,
	generateNorwegianLocaleSupport,
	generateAuditTrail,
};

export default ComplianceHelpers;
