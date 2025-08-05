/**
 * Secrets Management and Security Utilities
 * Secure handling of secrets and sensitive data for Xaheen CLI Ecosystem
 */

/**
 * Environment variable validation
 */
interface SecretConfig {
  name: string;
  required: boolean;
  encrypted?: boolean;
  description: string;
  validator?: (value: string) => boolean;
}

/**
 * Secrets manager class
 */
class SecretsManager {
  private static instance: SecretsManager;
  private secrets: Map<string, string> = new Map();
  private encryptionKey: string | null = null;

  private constructor() {
    this.loadSecrets();
  }

  static getInstance(): SecretsManager {
    if (!SecretsManager.instance) {
      SecretsManager.instance = new SecretsManager();
    }
    return SecretsManager.instance;
  }

  /**
   * Load and validate environment secrets
   */
  private loadSecrets(): void {
    const requiredSecrets: SecretConfig[] = [
      {
        name: "NEXTAUTH_SECRET",
        required: true,
        description: "NextAuth.js secret for JWT signing",
        validator: (value) => value.length >= 32,
      },
      {
        name: "DATABASE_URL",
        required: true,
        description: "Database connection string",
        validator: (value) => value.startsWith("postgresql://") || value.startsWith("postgres://"),
      },
      {
        name: "MCP_SERVER_API_KEY",
        required: true,
        description: "MCP Server API key",
        validator: (value) => value.length >= 32,
      },
      {
        name: "OPENAI_API_KEY",
        required: false,
        description: "OpenAI API key for AI features",
        validator: (value) => value.startsWith("sk-"),
      },
      {
        name: "ANTHROPIC_API_KEY",
        required: false,
        description: "Anthropic API key for AI features",
        validator: (value) => value.startsWith("sk-ant-"),
      },
      {
        name: "BANKID_CLIENT_SECRET",
        required: false,
        description: "BankID client secret for Norwegian authentication",
      },
      {
        name: "ALTINN_API_KEY",
        required: false,
        description: "Altinn API key for Norwegian government services",
      },
      {
        name: "SENTRY_AUTH_TOKEN",
        required: false,
        description: "Sentry authentication token",
      },
      {
        name: "CLOUDFLARE_API_TOKEN",
        required: false,
        description: "Cloudflare API token for deployment",
      },
    ];

    // Load and validate secrets
    requiredSecrets.forEach((config) => {
      const value = process.env[config.name];
      
      if (config.required && !value) {
        console.error(`❌ Required secret ${config.name} is missing: ${config.description}`);
        if (process.env.NODE_ENV === "production") {
          throw new Error(`Missing required secret: ${config.name}`);
        }
      }

      if (value) {
        if (config.validator && !config.validator(value)) {
          console.error(`❌ Secret ${config.name} failed validation: ${config.description}`);
          if (process.env.NODE_ENV === "production") {
            throw new Error(`Invalid secret format: ${config.name}`);
          }
        }

        this.secrets.set(config.name, value);
        console.log(`✅ Secret ${config.name} loaded successfully`);
      }
    });

    // Load encryption key
    this.encryptionKey = process.env.ENCRYPT_KEY || null;
    if (!this.encryptionKey && process.env.NODE_ENV === "production") {
      console.warn("⚠️ Encryption key not provided, some features may not work");
    }
  }

  /**
   * Get a secret value
   */
  getSecret(name: string): string | null {
    const value = this.secrets.get(name);
    if (!value) {
      console.warn(`Secret ${name} not found`);
      return null;
    }
    return value;
  }

  /**
   * Check if a secret exists
   */
  hasSecret(name: string): boolean {
    return this.secrets.has(name);
  }

  /**
   * Encrypt sensitive data (client-side)
   */
  async encryptData(data: string): Promise<string | null> {
    if (typeof crypto === "undefined" || !crypto.subtle) {
      console.warn("Web Crypto API not available");
      return null;
    }

    if (!this.encryptionKey) {
      console.warn("Encryption key not available");
      return null;
    }

    try {
      // Import key
      const keyData = new TextEncoder().encode(this.encryptionKey.padEnd(32, "0").slice(0, 32));
      const key = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "AES-GCM" },
        false,
        ["encrypt"]
      );

      // Generate IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt data
      const encodedData = new TextEncoder().encode(data);
      const encryptedData = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encodedData
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encryptedData.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedData), iv.length);

      // Return base64 encoded result
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error("Encryption failed:", error);
      return null;
    }
  }

  /**
   * Decrypt sensitive data (client-side)
   */
  async decryptData(encryptedData: string): Promise<string | null> {
    if (typeof crypto === "undefined" || !crypto.subtle) {
      console.warn("Web Crypto API not available");
      return null;
    }

    if (!this.encryptionKey) {
      console.warn("Encryption key not available");
      return null;
    }

    try {
      // Decode base64
      const combined = new Uint8Array(
        atob(encryptedData)
          .split("")
          .map((char) => char.charCodeAt(0))
      );

      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      // Import key
      const keyData = new TextEncoder().encode(this.encryptionKey.padEnd(32, "0").slice(0, 32));
      const key = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );

      // Decrypt data
      const decryptedData = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        data
      );

      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      console.error("Decryption failed:", error);
      return null;
    }
  }

  /**
   * Sanitize sensitive data for logging
   */
  sanitizeForLogging(data: any): any {
    if (typeof data !== "object" || data === null) {
      return data;
    }

    const sensitiveKeys = [
      "password",
      "secret",
      "token",
      "key",
      "auth",
      "credential",
      "session",
      "cookie",
      "authorization",
      "bearer",
    ];

    const sanitized: any = Array.isArray(data) ? [] : {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive));

      if (isSensitive && typeof value === "string") {
        sanitized[key] = `***${value.slice(-4)}`; // Show only last 4 characters
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitizeForLogging(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Generate secure random token
   */
  generateToken(length: number = 32): string {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
    }

    // Fallback for environments without crypto
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Hash sensitive data (one-way)
   */
  async hashData(data: string): Promise<string | null> {
    if (typeof crypto === "undefined" || !crypto.subtle) {
      console.warn("Web Crypto API not available");
      return null;
    }

    try {
      const encodedData = new TextEncoder().encode(data);
      const hashBuffer = await crypto.subtle.digest("SHA-256", encodedData);
      const hashArray = new Uint8Array(hashBuffer);
      return Array.from(hashArray, (byte) => byte.toString(16).padStart(2, "0")).join("");
    } catch (error) {
      console.error("Hashing failed:", error);
      return null;
    }
  }

  /**
   * Validate API key format
   */
  validateAPIKey(key: string, provider: "openai" | "anthropic" | "custom"): boolean {
    switch (provider) {
      case "openai":
        return key.startsWith("sk-") && key.length >= 40;
      case "anthropic":
        return key.startsWith("sk-ant-") && key.length >= 40;
      case "custom":
        return key.length >= 32;
      default:
        return false;
    }
  }
}

// Export singleton instance
export const secretsManager = SecretsManager.getInstance();

/**
 * Security utilities
 */
export const SecurityUtils = {
  /**
   * Check if running in secure context
   */
  isSecureContext(): boolean {
    if (typeof window === "undefined") return true; // Server-side is considered secure
    return window.isSecureContext || window.location.protocol === "https:";
  },

  /**
   * Validate URL for security
   */
  isValidURL(url: string, allowedHosts?: string[]): boolean {
    try {
      const urlObj = new URL(url);
      
      // Check protocol
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        return false;
      }

      // Check allowed hosts
      if (allowedHosts && allowedHosts.length > 0) {
        return allowedHosts.includes(urlObj.hostname);
      }

      // Basic validation passed
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Sanitize HTML to prevent XSS
   */
  sanitizeHTML(html: string): string {
    if (typeof DOMParser === "undefined") {
      // Server-side fallback - remove all HTML tags
      return html.replace(/<[^>]*>/g, "");
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    // Remove script tags and event handlers
    const scripts = doc.querySelectorAll("script");
    scripts.forEach((script) => script.remove());
    
    // Remove dangerous attributes
    const allElements = doc.querySelectorAll("*");
    allElements.forEach((element) => {
      Array.from(element.attributes).forEach((attr) => {
        if (attr.name.startsWith("on") || attr.name === "javascript:") {
          element.removeAttribute(attr.name);
        }
      });
    });

    return doc.body.innerHTML;
  },

  /**
   * Generate CSP nonce
   */
  generateCSPNonce(): string {
    return secretsManager.generateToken(16);
  },

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Check password strength
   */
  checkPasswordStrength(password: string): {
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push("Password should be at least 8 characters long");

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("Password should contain lowercase letters");

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("Password should contain uppercase letters");

    if (/\d/.test(password)) score += 1;
    else feedback.push("Password should contain numbers");

    if (/[^a-zA-Z\d]/.test(password)) score += 1;
    else feedback.push("Password should contain special characters");

    return { score, feedback };
  },

  /**
   * Rate limiting check (simple client-side implementation)
   */
  checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
    if (typeof localStorage === "undefined") return true;

    const now = Date.now();
    const storageKey = `rate_limit_${key}`;
    const stored = localStorage.getItem(storageKey);
    
    let requests: number[] = stored ? JSON.parse(stored) : [];
    
    // Remove expired requests
    requests = requests.filter((timestamp) => now - timestamp < windowMs);
    
    // Check if limit exceeded
    if (requests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    requests.push(now);
    localStorage.setItem(storageKey, JSON.stringify(requests));
    
    return true;
  },
};

/**
 * React hook for security utilities
 */
export function useSecurity() {
  const encrypt = React.useCallback(async (data: string) => {
    return secretsManager.encryptData(data);
  }, []);

  const decrypt = React.useCallback(async (encryptedData: string) => {
    return secretsManager.decryptData(encryptedData);
  }, []);

  const hash = React.useCallback(async (data: string) => {
    return secretsManager.hashData(data);
  }, []);

  const generateToken = React.useCallback((length?: number) => {
    return secretsManager.generateToken(length);
  }, []);

  const isSecureContext = React.useCallback(() => {
    return SecurityUtils.isSecureContext();
  }, []);

  return {
    encrypt,
    decrypt,
    hash,
    generateToken,
    isSecureContext,
    sanitizeHTML: SecurityUtils.sanitizeHTML,
    isValidURL: SecurityUtils.isValidURL,
    isValidEmail: SecurityUtils.isValidEmail,
    checkPasswordStrength: SecurityUtils.checkPasswordStrength,
    checkRateLimit: SecurityUtils.checkRateLimit,
  };
}

/**
 * Norwegian compliance security utilities
 */
export const NorwegianCompliance = {
  /**
   * Validate Norwegian organization number
   */
  validateOrgNumber(orgNumber: string): boolean {
    // Remove spaces and non-digits
    const cleaned = orgNumber.replace(/\D/g, "");
    
    // Should be 9 digits
    if (cleaned.length !== 9) return false;
    
    // Validate checksum using MOD11
    const weights = [3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    
    for (let i = 0; i < 8; i++) {
      sum += parseInt(cleaned[i]) * weights[i];
    }
    
    const remainder = sum % 11;
    const checkDigit = remainder === 0 ? 0 : 11 - remainder;
    
    return checkDigit === parseInt(cleaned[8]);
  },

  /**
   * Validate Norwegian social security number (fødselsnummer)
   */
  validateSSN(ssn: string): boolean {
    // Remove spaces and non-digits
    const cleaned = ssn.replace(/\D/g, "");
    
    // Should be 11 digits
    if (cleaned.length !== 11) return false;
    
    // Extract date parts
    const day = parseInt(cleaned.substring(0, 2));
    const month = parseInt(cleaned.substring(2, 4));
    const year = parseInt(cleaned.substring(4, 6));
    
    // Basic date validation
    if (day < 1 || day > 31 || month < 1 || month > 12) return false;
    
    // Validate checksums
    const weights1 = [3, 7, 6, 1, 8, 9, 4, 5, 2];
    const weights2 = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    
    let sum1 = 0;
    for (let i = 0; i < 9; i++) {
      sum1 += parseInt(cleaned[i]) * weights1[i];
    }
    
    const check1 = 11 - (sum1 % 11);
    if (check1 === 11) return false;
    if (check1 === 10) return false;
    if (check1 !== parseInt(cleaned[9])) return false;
    
    let sum2 = 0;
    for (let i = 0; i < 10; i++) {
      sum2 += parseInt(cleaned[i]) * weights2[i];
    }
    
    const check2 = 11 - (sum2 % 11);
    if (check2 === 11) return false;
    if (check2 === 10) return false;
    if (check2 !== parseInt(cleaned[10])) return false;
    
    return true;
  },

  /**
   * Check GDPR compliance requirements
   */
  checkGDPRCompliance(dataProcessing: {
    hasConsent: boolean;
    lawfulBasis: string;
    dataMinimization: boolean;
    rightToErasure: boolean;
    dataPortability: boolean;
  }): boolean {
    return (
      dataProcessing.hasConsent &&
      dataProcessing.lawfulBasis.length > 0 &&
      dataProcessing.dataMinimization &&
      dataProcessing.rightToErasure &&
      dataProcessing.dataPortability
    );
  },

  /**
   * Generate audit log entry for Norwegian compliance
   */
  generateAuditLog(action: string, userId: string, details: any): {
    timestamp: string;
    action: string;
    userId: string;
    details: any;
    hash: string;
  } {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      action,
      userId,
      details: secretsManager.sanitizeForLogging(details),
      hash: "", // Will be calculated below
    };
    
    // Create hash for integrity
    const logString = JSON.stringify(logEntry);
    logEntry.hash = btoa(logString); // Simple hash for demo
    
    return logEntry;
  },
};