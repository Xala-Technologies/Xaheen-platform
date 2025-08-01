import { z } from 'zod';
import { LocaleCode, TranslationFile, LocalizationConfig } from './core.js';
import { logger } from '../utils/logger.js';

// Validation result interface
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number;
  summary: ValidationSummary;
}

// Validation error
export interface ValidationError {
  locale: LocaleCode;
  key: string;
  type: 'missing' | 'invalid' | 'format' | 'length' | 'placeholder';
  message: string;
  severity: 'error' | 'critical';
}

// Validation warning
export interface ValidationWarning {
  locale: LocaleCode;
  key: string;
  type: 'quality' | 'consistency' | 'style' | 'terminology';
  message: string;
  suggestion?: string;
}

// Validation summary
export interface ValidationSummary {
  totalKeys: number;
  validKeys: number;
  missingKeys: number;
  invalidKeys: number;
  completeness: number;
  qualityScore: number;
  localeBreakdown: Map<LocaleCode, LocaleSummary>;
}

// Locale-specific summary
export interface LocaleSummary {
  locale: LocaleCode;
  totalKeys: number;
  translatedKeys: number;
  missingKeys: number;
  completeness: number;
  errors: number;
  warnings: number;
}

// Validation options
export interface ValidationOptions {
  checkCompleteness?: boolean;
  checkPlaceholders?: boolean;
  checkFormatStrings?: boolean;
  checkLength?: boolean;
  checkHTMLEntities?: boolean;
  checkTerminology?: boolean;
  maxLengthRatio?: number;
  customValidators?: Array<(key: string, value: string, locale: LocaleCode) => ValidationError | null>;
}

// Default validation options
const DEFAULT_OPTIONS: ValidationOptions = {
  checkCompleteness: true,
  checkPlaceholders: true,
  checkFormatStrings: true,
  checkLength: true,
  checkHTMLEntities: true,
  checkTerminology: true,
  maxLengthRatio: 2.0,
};

// Common terminology that should be consistent
const TERMINOLOGY_DICTIONARY: Record<string, Record<LocaleCode, string>> = {
  'save': {
    'nb-NO': 'Lagre',
    'nn-NO': 'Lagre',
    'en-US': 'Save',
    'ar-SA': 'حفظ',
    'fr-FR': 'Enregistrer',
  },
  'cancel': {
    'nb-NO': 'Avbryt',
    'nn-NO': 'Avbryt',
    'en-US': 'Cancel',
    'ar-SA': 'إلغاء',
    'fr-FR': 'Annuler',
  },
  'delete': {
    'nb-NO': 'Slett',
    'nn-NO': 'Slett',
    'en-US': 'Delete',
    'ar-SA': 'حذف',
    'fr-FR': 'Supprimer',
  },
  'edit': {
    'nb-NO': 'Rediger',
    'nn-NO': 'Rediger',
    'en-US': 'Edit',
    'ar-SA': 'تعديل',
    'fr-FR': 'Modifier',
  },
  'submit': {
    'nb-NO': 'Send inn',
    'nn-NO': 'Send inn',
    'en-US': 'Submit',
    'ar-SA': 'إرسال',
    'fr-FR': 'Soumettre',
  },
};

// Translation validator class
export class TranslationValidator {
  private options: ValidationOptions;
  
  constructor(options: Partial<ValidationOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }
  
  // Validate all translations
  async validateTranslations(
    translations: Map<LocaleCode, TranslationFile>,
    config: LocalizationConfig
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const localeBreakdown = new Map<LocaleCode, LocaleSummary>();
    
    // Get reference locale (usually default locale)
    const referenceLocale = config.defaultLocale;
    const referenceTranslations = translations.get(referenceLocale);
    
    if (!referenceTranslations) {
      errors.push({
        locale: referenceLocale,
        key: '',
        type: 'missing',
        message: `Reference locale ${referenceLocale} not found`,
        severity: 'critical',
      });
      
      return this.createResult(errors, warnings, new Map());
    }
    
    // Extract all keys from reference
    const allKeys = this.extractAllKeys(referenceTranslations.translations);
    
    // Validate each locale
    for (const [locale, translation] of translations) {
      const localeErrors = this.validateLocale(
        locale,
        translation,
        allKeys,
        referenceTranslations
      );
      
      errors.push(...localeErrors.errors);
      warnings.push(...localeErrors.warnings);
      
      // Create locale summary
      const localeKeys = this.extractAllKeys(translation.translations);
      const missingKeys = allKeys.filter(key => !localeKeys.includes(key));
      
      localeBreakdown.set(locale, {
        locale,
        totalKeys: allKeys.length,
        translatedKeys: localeKeys.length,
        missingKeys: missingKeys.length,
        completeness: (localeKeys.length / allKeys.length) * 100,
        errors: localeErrors.errors.length,
        warnings: localeErrors.warnings.length,
      });
    }
    
    return this.createResult(errors, warnings, localeBreakdown);
  }
  
  // Validate single locale
  private validateLocale(
    locale: LocaleCode,
    translation: TranslationFile,
    allKeys: string[],
    reference: TranslationFile
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Check completeness
    if (this.options.checkCompleteness) {
      const missingKeys = this.checkCompleteness(translation, allKeys);
      errors.push(...missingKeys.map(key => ({
        locale,
        key,
        type: 'missing' as const,
        message: `Missing translation for key: ${key}`,
        severity: 'error' as const,
      })));
    }
    
    // Validate each key
    for (const key of allKeys) {
      const value = this.getNestedValue(translation.translations, key);
      const refValue = this.getNestedValue(reference.translations, key);
      
      if (!value) continue;
      
      // Check placeholders
      if (this.options.checkPlaceholders) {
        const placeholderError = this.validatePlaceholders(key, value, refValue);
        if (placeholderError) {
          errors.push({ ...placeholderError, locale });
        }
      }
      
      // Check format strings
      if (this.options.checkFormatStrings) {
        const formatError = this.validateFormatStrings(key, value, refValue);
        if (formatError) {
          errors.push({ ...formatError, locale });
        }
      }
      
      // Check length
      if (this.options.checkLength) {
        const lengthWarning = this.validateLength(key, value, refValue);
        if (lengthWarning) {
          warnings.push({ ...lengthWarning, locale });
        }
      }
      
      // Check HTML entities
      if (this.options.checkHTMLEntities) {
        const htmlError = this.validateHTMLEntities(key, value);
        if (htmlError) {
          errors.push({ ...htmlError, locale });
        }
      }
      
      // Check terminology
      if (this.options.checkTerminology) {
        const termWarning = this.validateTerminology(key, value, locale);
        if (termWarning) {
          warnings.push({ ...termWarning, locale });
        }
      }
      
      // Run custom validators
      if (this.options.customValidators) {
        for (const validator of this.options.customValidators) {
          const error = validator(key, value, locale);
          if (error) {
            errors.push(error);
          }
        }
      }
    }
    
    return { errors, warnings };
  }
  
  // Check completeness
  private checkCompleteness(
    translation: TranslationFile,
    allKeys: string[]
  ): string[] {
    const translatedKeys = this.extractAllKeys(translation.translations);
    return allKeys.filter(key => !translatedKeys.includes(key));
  }
  
  // Validate placeholders
  private validatePlaceholders(
    key: string,
    value: string,
    refValue: string
  ): Omit<ValidationError, 'locale'> | null {
    const placeholderRegex = /\{\{([^}]+)\}\}|\{([^}]+)\}|%\{([^}]+)\}/g;
    
    const valuePlaceholders = new Set<string>();
    const refPlaceholders = new Set<string>();
    
    let match;
    while ((match = placeholderRegex.exec(value))) {
      valuePlaceholders.add(match[1] || match[2] || match[3]);
    }
    
    placeholderRegex.lastIndex = 0;
    while ((match = placeholderRegex.exec(refValue))) {
      refPlaceholders.add(match[1] || match[2] || match[3]);
    }
    
    // Check for missing placeholders
    const missing = Array.from(refPlaceholders).filter(p => !valuePlaceholders.has(p));
    const extra = Array.from(valuePlaceholders).filter(p => !refPlaceholders.has(p));
    
    if (missing.length > 0 || extra.length > 0) {
      return {
        key,
        type: 'placeholder',
        message: `Placeholder mismatch. Missing: [${missing.join(', ')}], Extra: [${extra.join(', ')}]`,
        severity: 'error',
      };
    }
    
    return null;
  }
  
  // Validate format strings
  private validateFormatStrings(
    key: string,
    value: string,
    refValue: string
  ): Omit<ValidationError, 'locale'> | null {
    const formatRegex = /%[sdifbox]/g;
    
    const valueFormats = (value.match(formatRegex) || []).sort();
    const refFormats = (refValue.match(formatRegex) || []).sort();
    
    if (valueFormats.join('') !== refFormats.join('')) {
      return {
        key,
        type: 'format',
        message: `Format string mismatch. Expected: [${refFormats.join(', ')}], Found: [${valueFormats.join(', ')}]`,
        severity: 'error',
      };
    }
    
    return null;
  }
  
  // Validate length
  private validateLength(
    key: string,
    value: string,
    refValue: string
  ): Omit<ValidationWarning, 'locale'> | null {
    const ratio = value.length / refValue.length;
    
    if (ratio > this.options.maxLengthRatio!) {
      return {
        key,
        type: 'quality',
        message: `Translation is ${ratio.toFixed(1)}x longer than reference`,
        suggestion: 'Consider shortening the translation',
      };
    }
    
    return null;
  }
  
  // Validate HTML entities
  private validateHTMLEntities(
    key: string,
    value: string
  ): Omit<ValidationError, 'locale'> | null {
    const htmlEntityRegex = /&[a-zA-Z]+;|&#\d+;|&#x[a-fA-F0-9]+;/g;
    const entities = value.match(htmlEntityRegex);
    
    if (entities && entities.length > 0) {
      return {
        key,
        type: 'format',
        message: `Contains HTML entities: ${entities.join(', ')}. Use Unicode characters instead`,
        severity: 'error',
      };
    }
    
    return null;
  }
  
  // Validate terminology
  private validateTerminology(
    key: string,
    value: string,
    locale: LocaleCode
  ): Omit<ValidationWarning, 'locale'> | null {
    const lowerValue = value.toLowerCase();
    
    for (const [term, translations] of Object.entries(TERMINOLOGY_DICTIONARY)) {
      const expectedTranslation = translations[locale];
      if (!expectedTranslation) continue;
      
      if (lowerValue.includes(term) && !value.includes(expectedTranslation)) {
        return {
          key,
          type: 'terminology',
          message: `Inconsistent terminology: "${term}" should be "${expectedTranslation}"`,
          suggestion: `Replace with "${expectedTranslation}"`,
        };
      }
    }
    
    return null;
  }
  
  // Extract all keys from nested object
  private extractAllKeys(obj: any, prefix = ''): string[] {
    const keys: string[] = [];
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...this.extractAllKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    
    return keys;
  }
  
  // Get nested value
  private getNestedValue(obj: any, path: string): string | null {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current[key] === undefined) {
        return null;
      }
      current = current[key];
    }
    
    return typeof current === 'string' ? current : null;
  }
  
  // Create validation result
  private createResult(
    errors: ValidationError[],
    warnings: ValidationWarning[],
    localeBreakdown: Map<LocaleCode, LocaleSummary>
  ): ValidationResult {
    const totalKeys = Array.from(localeBreakdown.values())[0]?.totalKeys || 0;
    const validKeys = totalKeys - errors.filter(e => e.type === 'missing').length;
    const completeness = totalKeys > 0 ? (validKeys / totalKeys) * 100 : 0;
    
    // Calculate quality score
    const errorPenalty = errors.length * 10;
    const warningPenalty = warnings.length * 2;
    const qualityScore = Math.max(0, 100 - errorPenalty - warningPenalty);
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score: qualityScore,
      summary: {
        totalKeys,
        validKeys,
        missingKeys: errors.filter(e => e.type === 'missing').length,
        invalidKeys: errors.filter(e => e.type !== 'missing').length,
        completeness,
        qualityScore,
        localeBreakdown,
      },
    };
  }
  
  // Generate validation report
  generateReport(result: ValidationResult): string {
    const report: string[] = [];
    
    report.push('# Translation Validation Report');
    report.push(`\nValidation Score: ${result.score}/100`);
    report.push(`Status: ${result.valid ? '✅ PASSED' : '❌ FAILED'}`);
    
    // Summary
    report.push('\n## Summary');
    report.push(`- Total Keys: ${result.summary.totalKeys}`);
    report.push(`- Valid Keys: ${result.summary.validKeys}`);
    report.push(`- Missing Keys: ${result.summary.missingKeys}`);
    report.push(`- Invalid Keys: ${result.summary.invalidKeys}`);
    report.push(`- Completeness: ${result.summary.completeness.toFixed(1)}%`);
    
    // Locale breakdown
    report.push('\n## Locale Breakdown');
    for (const [locale, summary] of result.summary.localeBreakdown) {
      report.push(`\n### ${locale}`);
      report.push(`- Completeness: ${summary.completeness.toFixed(1)}%`);
      report.push(`- Translated: ${summary.translatedKeys}/${summary.totalKeys}`);
      report.push(`- Errors: ${summary.errors}`);
      report.push(`- Warnings: ${summary.warnings}`);
    }
    
    // Errors
    if (result.errors.length > 0) {
      report.push('\n## Errors');
      for (const error of result.errors) {
        report.push(`- [${error.severity.toUpperCase()}] ${error.locale} - ${error.key}: ${error.message}`);
      }
    }
    
    // Warnings
    if (result.warnings.length > 0) {
      report.push('\n## Warnings');
      for (const warning of result.warnings) {
        report.push(`- ${warning.locale} - ${warning.key}: ${warning.message}`);
        if (warning.suggestion) {
          report.push(`  💡 ${warning.suggestion}`);
        }
      }
    }
    
    return report.join('\n');
  }
}

// Create default validator
export const validator = new TranslationValidator();

// Export convenience functions
export async function validateTranslations(
  translations: Map<LocaleCode, TranslationFile>,
  config: LocalizationConfig,
  options?: Partial<ValidationOptions>
): Promise<ValidationResult> {
  const v = new TranslationValidator(options);
  return v.validateTranslations(translations, config);
}