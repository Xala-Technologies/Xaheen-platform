// Core type definitions for Xala services

/**
 * Supported locale codes
 */
export type LocaleCode = 
  | 'nb'  // Norwegian Bokmål
  | 'en'  // English
  | 'ar'  // Arabic
  | 'fr'; // French

/**
 * Norwegian compliance levels
 */
export type NorwegianCompliance = {
  nsm?: boolean;          // Norwegian Security Authority compliance
  gdpr?: boolean;         // GDPR compliance
  wcag?: 'A' | 'AA' | 'AAA'; // WCAG accessibility level
  digitalServices?: boolean; // Norwegian Digital Services compliance
};