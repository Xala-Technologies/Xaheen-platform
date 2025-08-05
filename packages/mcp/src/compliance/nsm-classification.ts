/**
 * NSM Security Classification Implementation
 * Norwegian National Security Authority Standards
 * @version 1.0.0
 */

import type { 
  NSMClassification, 
  NSMSecurityRequirements,
  NorwegianComplianceConfig 
} from '../types/norwegian-compliance.js';

export interface NSMClassifiedTemplate {
  readonly classification: NSMClassification;
  readonly securityRequirements: NSMSecurityRequirements;
  readonly accessControls: NSMAccessControls;
  readonly auditRequirements: NSMAuditRequirements;
}

export interface NSMAccessControls {
  readonly authentication: {
    readonly required: boolean;
    readonly method: 'basic' | 'multi-factor' | 'certificate' | 'biometric';
    readonly sessionTimeout: number; // minutes
  };
  readonly authorization: {
    readonly rbac: boolean; // Role-Based Access Control
    readonly abac: boolean; // Attribute-Based Access Control
    readonly clearanceLevel: string;
    readonly needToKnow: boolean;
  };
  readonly network: {
    readonly vpnRequired: boolean;
    readonly ipWhitelisting: boolean;
    readonly networkSegmentation: boolean;
    readonly firewallRules: string[];
  };
}

export interface NSMAuditRequirements {
  readonly logging: {
    readonly userActions: boolean;
    readonly systemEvents: boolean;
    readonly securityEvents: boolean;
    readonly dataAccess: boolean;
  };
  readonly retention: {
    readonly duration: string; // ISO 8601 duration
    readonly storage: 'local' | 'database' | 'external' | 'secure_archive';
    readonly encryption: boolean;
  };
  readonly monitoring: {
    readonly realTime: boolean;
    readonly alerting: boolean;
    readonly reporting: boolean;
    readonly analytics: boolean;
  };
}

// NSM Classification Templates
export const NSM_CLASSIFICATION_TEMPLATES: Record<NSMClassification, NSMClassifiedTemplate> = {
  OPEN: {
    classification: 'OPEN',
    securityRequirements: {
      classification: 'OPEN',
      dataHandling: {
        encryption: false,
        auditTrail: false,
        accessControl: false,
        dataRetention: 'Not applicable',
        dataMinimization: true,
      },
      technical: {
        sslRequired: true,
        authenticationRequired: false,
        sessionTimeout: 0,
        ipWhitelisting: false,
        vpnRequired: false,
      },
      operational: {
        userTraining: false,
        incidentReporting: false,
        regularAudits: false,
        backgroundChecks: false,
      },
    },
    accessControls: {
      authentication: {
        required: false,
        method: 'basic',
        sessionTimeout: 0,
      },
      authorization: {
        rbac: false,
        abac: false,
        clearanceLevel: 'PUBLIC',
        needToKnow: false,
      },
      network: {
        vpnRequired: false,
        ipWhitelisting: false,
        networkSegmentation: false,
        firewallRules: [],
      },
    },
    auditRequirements: {
      logging: {
        userActions: false,
        systemEvents: false,
        securityEvents: false,
        dataAccess: false,
      },
      retention: {
        duration: 'P0D',
        storage: 'local',
        encryption: false,
      },
      monitoring: {
        realTime: false,
        alerting: false,
        reporting: false,
        analytics: false,
      },
    },
  },

  RESTRICTED: {
    classification: 'RESTRICTED',
    securityRequirements: {
      classification: 'RESTRICTED',
      dataHandling: {
        encryption: true,
        auditTrail: true,
        accessControl: true,
        dataRetention: 'P7Y',
        dataMinimization: true,
      },
      technical: {
        sslRequired: true,
        authenticationRequired: true,
        sessionTimeout: 30,
        ipWhitelisting: true,
        vpnRequired: true,
      },
      operational: {
        userTraining: true,
        incidentReporting: true,
        regularAudits: true,
        backgroundChecks: true,
      },
    },
    accessControls: {
      authentication: {
        required: true,
        method: 'multi-factor',
        sessionTimeout: 30,
      },
      authorization: {
        rbac: true,
        abac: false,
        clearanceLevel: 'RESTRICTED',
        needToKnow: true,
      },
      network: {
        vpnRequired: true,
        ipWhitelisting: true,
        networkSegmentation: true,
        firewallRules: [
          'DENY ALL by default',
          'ALLOW authenticated users from trusted networks',
          'LOG all access attempts',
        ],
      },
    },
    auditRequirements: {
      logging: {
        userActions: true,
        systemEvents: true,
        securityEvents: true,
        dataAccess: true,
      },
      retention: {
        duration: 'P7Y',
        storage: 'database',
        encryption: true,
      },
      monitoring: {
        realTime: true,
        alerting: true,
        reporting: true,
        analytics: false,
      },
    },
  },

  CONFIDENTIAL: {
    classification: 'CONFIDENTIAL',
    securityRequirements: {
      classification: 'CONFIDENTIAL',
      dataHandling: {
        encryption: true,
        auditTrail: true,
        accessControl: true,
        dataRetention: 'P10Y',
        dataMinimization: true,
      },
      technical: {
        sslRequired: true,
        authenticationRequired: true,
        sessionTimeout: 15,
        ipWhitelisting: true,
        vpnRequired: true,
      },
      operational: {
        userTraining: true,
        incidentReporting: true,
        regularAudits: true,
        backgroundChecks: true,
      },
    },
    accessControls: {
      authentication: {
        required: true,
        method: 'certificate',
        sessionTimeout: 15,
      },
      authorization: {
        rbac: true,
        abac: true,
        clearanceLevel: 'CONFIDENTIAL',
        needToKnow: true,
      },
      network: {
        vpnRequired: true,
        ipWhitelisting: true,
        networkSegmentation: true,
        firewallRules: [
          'DENY ALL by default',
          'ALLOW only certificate-authenticated users',
          'REQUIRE VPN connection',
          'LOG and ALERT all access attempts',
          'ENCRYPT all traffic',
        ],
      },
    },
    auditRequirements: {
      logging: {
        userActions: true,
        systemEvents: true,
        securityEvents: true,
        dataAccess: true,
      },
      retention: {
        duration: 'P10Y',
        storage: 'secure_archive',
        encryption: true,
      },
      monitoring: {
        realTime: true,
        alerting: true,
        reporting: true,
        analytics: true,
      },
    },
  },

  SECRET: {
    classification: 'SECRET',
    securityRequirements: {
      classification: 'SECRET',
      dataHandling: {
        encryption: true,
        auditTrail: true,
        accessControl: true,
        dataRetention: 'P25Y',
        dataMinimization: true,
      },
      technical: {
        sslRequired: true,
        authenticationRequired: true,
        sessionTimeout: 10,
        ipWhitelisting: true,
        vpnRequired: true,
      },
      operational: {
        userTraining: true,
        incidentReporting: true,
        regularAudits: true,
        backgroundChecks: true,
      },
    },
    accessControls: {
      authentication: {
        required: true,
        method: 'biometric',
        sessionTimeout: 10,
      },
      authorization: {
        rbac: true,
        abac: true,
        clearanceLevel: 'SECRET',
        needToKnow: true,
      },
      network: {
        vpnRequired: true,
        ipWhitelisting: true,
        networkSegmentation: true,
        firewallRules: [
          'DENY ALL by default',
          'ALLOW only biometric-authenticated users with SECRET clearance',
          'REQUIRE secure VPN with certificate pinning',
          'LOG, ALERT and ANALYZE all access attempts',
          'ENCRYPT all traffic with military-grade encryption',
          'ISOLATE in separate network segment',
        ],
      },
    },
    auditRequirements: {
      logging: {
        userActions: true,
        systemEvents: true,
        securityEvents: true,
        dataAccess: true,
      },
      retention: {
        duration: 'P25Y',
        storage: 'secure_archive',
        encryption: true,
      },
      monitoring: {
        realTime: true,
        alerting: true,
        reporting: true,
        analytics: true,
      },
    },
  },
};

export class NSMClassificationService {
  /**
   * Get NSM classification template
   */
  static getClassificationTemplate(classification: NSMClassification): NSMClassifiedTemplate {
    return NSM_CLASSIFICATION_TEMPLATES[classification];
  }

  /**
   * Validate if data meets NSM classification requirements
   */
  static validateClassification(
    classification: NSMClassification,
    data: any,
    context?: any
  ): { valid: boolean; violations: string[] } {
    const template = this.getClassificationTemplate(classification);
    const violations: string[] = [];

    // Check basic security requirements
    if (template.securityRequirements.technical.sslRequired && !context?.ssl) {
      violations.push('SSL/TLS encryption is required for this classification level');
    }

    if (template.securityRequirements.technical.authenticationRequired && !context?.authentication) {
      violations.push('Authentication is required for this classification level');
    }

    if (template.securityRequirements.technical.vpnRequired && !context?.vpn) {
      violations.push('VPN connection is required for this classification level');
    }

    // Check data handling requirements
    if (template.securityRequirements.dataHandling.encryption && !context?.dataEncryption) {
      violations.push('Data encryption is required for this classification level');
    }

    if (template.securityRequirements.dataHandling.auditTrail && !context?.auditTrail) {
      violations.push('Audit trail logging is required for this classification level');
    }

    return {
      valid: violations.length === 0,
      violations,
    };
  }

  /**
   * Generate security headers for NSM classification
   */
  static generateSecurityHeaders(classification: NSMClassification): Record<string, string> {
    const template = this.getClassificationTemplate(classification);
    const headers: Record<string, string> = {};

    // Always include basic security headers
    headers['X-Content-Type-Options'] = 'nosniff';
    headers['X-Frame-Options'] = 'DENY';
    headers['X-XSS-Protection'] = '1; mode=block';
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';

    // Add classification-specific headers
    if (template.securityRequirements.technical.sslRequired) {
      headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload';
    }

    if (classification !== 'OPEN') {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
      headers['X-NSM-Classification'] = classification;
    }

    if (classification === 'SECRET' || classification === 'CONFIDENTIAL') {
      headers['Content-Security-Policy'] = 
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';";
    }

    return headers;
  }

  /**
   * Generate audit configuration for NSM classification
   */
  static generateAuditConfig(classification: NSMClassification): NSMAuditRequirements {
    return this.getClassificationTemplate(classification).auditRequirements;
  }

  /**
   * Generate access control configuration for NSM classification
   */
  static generateAccessControlConfig(classification: NSMClassification): NSMAccessControls {
    return this.getClassificationTemplate(classification).accessControls;
  }

  /**
   * Check if user has required clearance for classification
   */
  static validateUserClearance(
    userClearanceLevel: string,
    requiredClassification: NSMClassification
  ): boolean {
    const clearanceHierarchy = ['PUBLIC', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'];
    const classificationMapping = {
      'OPEN': 'PUBLIC',
      'RESTRICTED': 'RESTRICTED',
      'CONFIDENTIAL': 'CONFIDENTIAL',
      'SECRET': 'SECRET',
    };

    const userLevel = clearanceHierarchy.indexOf(userClearanceLevel);
    const requiredLevel = clearanceHierarchy.indexOf(classificationMapping[requiredClassification]);

    return userLevel >= requiredLevel;
  }

  /**
   * Generate classification markup for templates
   */
  static generateClassificationMarkup(classification: NSMClassification): string {
    if (classification === 'OPEN') {
      return ''; // No classification marking needed for open information
    }

    const colors = {
      'RESTRICTED': '#FFA500', // Orange
      'CONFIDENTIAL': '#FF0000', // Red
      'SECRET': '#8A2BE2', // Blue Violet
    };

    return `
      <div class="nsm-classification-banner" 
           style="background-color: ${colors[classification]}; color: white; 
                  text-align: center; font-weight: bold; padding: 8px;">
        ${classification} - GRADERT INFORMASJON
      </div>
    `;
  }

  /**
   * Generate classification CSS styles
   */
  static generateClassificationStyles(classification: NSMClassification): string {
    if (classification === 'OPEN') {
      return '';
    }

    const colors = {
      'RESTRICTED': '#FFA500',
      'CONFIDENTIAL': '#FF0000', 
      'SECRET': '#8A2BE2',
    };

    return `
      .nsm-classification-banner {
        background-color: ${colors[classification]};
        color: white;
        text-align: center;
        font-weight: bold;
        padding: 8px;
        font-size: 14px;
        font-family: system-ui, -apple-system, sans-serif;
        position: sticky;
        top: 0;
        z-index: 9999;
        border-bottom: 2px solid ${colors[classification]};
      }

      .nsm-classification-watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 72px;
        color: rgba(${this.hexToRgb(colors[classification])}, 0.1);
        font-weight: bold;
        pointer-events: none;
        z-index: 1000;
        white-space: nowrap;
      }

      @media print {
        .nsm-classification-banner {
          position: static;
          break-inside: avoid;
        }
        
        .nsm-classification-watermark {
          color: rgba(${this.hexToRgb(colors[classification])}, 0.3);
        }
      }
    `;
  }

  private static hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result && result[1] && result[2] && result[3] ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
      '0, 0, 0';
  }
}

export default NSMClassificationService;