import type { NSMClassification } from '../types';

/**
 * NSM (Norwegian Security Authority) compliance helper
 */
export class NSMHelper {
  /**
   * Determine appropriate NSM classification based on data sensitivity
   */
  static determineClassification(
    containsPersonalData: boolean,
    containsSensitiveData: boolean,
    containsConfidentialData: boolean
  ): NSMClassification {
    if (containsConfidentialData) {
      return 'CONFIDENTIAL';
    }
    if (containsSensitiveData) {
      return 'RESTRICTED';
    }
    if (containsPersonalData) {
      return 'INTERNAL';
    }
    return 'OPEN';
  }
  
  /**
   * Get security requirements for NSM classification level
   */
  static getSecurityRequirements(classification: NSMClassification): string[] {
    const baseRequirements = [
      'Implement access control',
      'Enable audit logging',
      'Regular security updates'
    ];
    
    switch (classification) {
      case 'OPEN':
        return baseRequirements;
        
      case 'INTERNAL':
        return [
          ...baseRequirements,
          'Restrict access to authorized personnel',
          'Implement user authentication',
          'Monitor access logs'
        ];
        
      case 'RESTRICTED':
        return [
          ...baseRequirements,
          'Implement multi-factor authentication',
          'Encrypt data at rest and in transit',
          'Regular security audits',
          'Incident response plan',
          'Access on need-to-know basis'
        ];
        
      case 'CONFIDENTIAL':
        return [
          ...baseRequirements,
          'Strong multi-factor authentication',
          'End-to-end encryption',
          'Hardware security modules',
          'Continuous security monitoring',
          'Quarterly penetration testing',
          'Strict access control with regular reviews',
          'Data loss prevention measures'
        ];
    }
  }
  
  /**
   * Validate if current security measures meet NSM requirements
   */
  static validateSecurityMeasures(
    classification: NSMClassification,
    implementedMeasures: string[]
  ): {
    compliant: boolean;
    missingMeasures: string[];
  } {
    const requiredMeasures = this.getSecurityRequirements(classification);
    const missingMeasures = requiredMeasures.filter(
      req => !implementedMeasures.some(
        impl => impl.toLowerCase().includes(req.toLowerCase().substring(0, 10))
      )
    );
    
    return {
      compliant: missingMeasures.length === 0,
      missingMeasures
    };
  }
  
  /**
   * Get data handling guidelines for NSM classification
   */
  static getDataHandlingGuidelines(classification: NSMClassification): {
    storage: string[];
    transmission: string[];
    retention: string;
    disposal: string;
  } {
    switch (classification) {
      case 'OPEN':
        return {
          storage: ['Standard storage acceptable'],
          transmission: ['Standard protocols acceptable'],
          retention: 'As per business requirements',
          disposal: 'Standard deletion procedures'
        };
        
      case 'INTERNAL':
        return {
          storage: ['Secure servers', 'Access control required'],
          transmission: ['Encrypted connections (HTTPS/TLS)'],
          retention: 'Maximum 5 years unless legally required',
          disposal: 'Secure deletion with audit trail'
        };
        
      case 'RESTRICTED':
        return {
          storage: ['Encrypted storage', 'Segregated from public systems'],
          transmission: ['End-to-end encryption', 'VPN for remote access'],
          retention: 'Minimum necessary period, max 3 years',
          disposal: 'Cryptographic erasure with verification'
        };
        
      case 'CONFIDENTIAL':
        return {
          storage: ['Hardware encrypted storage', 'Air-gapped systems for critical data'],
          transmission: ['Military-grade encryption', 'Dedicated secure channels'],
          retention: 'Strict need-based retention, regular reviews',
          disposal: 'Physical destruction of media with witnessed verification'
        };
    }
  }
}