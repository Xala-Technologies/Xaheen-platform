/**
 * Advanced Localization Service
 * 
 * Enterprise-grade localization system with advanced features for
 * multi-language support, cultural adaptation, and Norwegian compliance.
 * 
 * Features:
 * - Dynamic language detection and switching
 * - Pluralization and formatting rules
 * - Date, time, and number formatting
 * - Currency conversion and formatting
 * - RTL/LTR support
 * - Translation memory and caching
 * - Machine translation integration
 * - Cultural adaptation
 * - Norwegian-specific formatting
 * - Accessibility features
 * - Translation validation
 * - Hot-reloading in development
 */

import { EventEmitter } from 'events';
import { 
  ILoggingService, 
  IConfigurationService,
  IFileSystemService,
  ILocalizationService 
} from '../architecture/interfaces.js';
import { LocaleCode, NorwegianCompliance } from '../types/compliance.js';
import { AIServiceFactory } from '../ai/services/AIServiceFactory.js';

/**
 * Localization configuration
 */
export interface ILocalizationConfig {
  defaultLocale: LocaleCode;
  supportedLocales: LocaleCode[];
  fallbackLocale: LocaleCode;
  loadPath: string;
  savePath?: string;
  detection: {
    enabled: boolean;
    order: Array<'querystring' | 'cookie' | 'header' | 'path' | 'subdomain'>;
    caches: string[];
  };
  interpolation: {
    prefix: string;
    suffix: string;
    escapeValue: boolean;
  };
  pluralization: {
    enabled: boolean;
    rulesPath?: string;
  };
  formatting: {
    dateTimeFormat: Intl.DateTimeFormatOptions;
    numberFormat: Intl.NumberFormatOptions;
    currencyFormat: Intl.NumberFormatOptions;
  };
  norwegianCompliance: {
    enforceBokmaal: boolean;
    validateTranslations: boolean;
    requireAccessibility: boolean;
  };
  cache: {
    enabled: boolean;
    ttl: number; // seconds
  };
  machineTranslation: {
    enabled: boolean;
    provider?: 'ai' | 'google' | 'azure';
    apiKey?: string;
  };
}

/**
 * Translation resource
 */
export interface ITranslationResource {
  [key: string]: string | ITranslationResource;
}

/**
 * Translation metadata
 */
export interface ITranslationMetadata {
  key: string;
  locale: LocaleCode;
  namespace?: string;
  context?: string;
  lastUpdated: Date;
  verified: boolean;
  machineTranslated?: boolean;
  compliance?: {
    wcagLevel?: 'A' | 'AA' | 'AAA';
    nsmApproved?: boolean;
  };
}

/**
 * Pluralization rule
 */
export interface IPluralizationRule {
  locale: LocaleCode;
  rule: (count: number) => 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';
}

/**
 * Format options
 */
export interface IFormatOptions {
  locale?: LocaleCode;
  currency?: string;
  style?: 'decimal' | 'currency' | 'percent' | 'unit';
  unit?: string;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  timeZone?: string;
}

/**
 * Translation options
 */
export interface ITranslationOptions {
  locale?: LocaleCode;
  count?: number;
  context?: string;
  defaultValue?: string;
  interpolation?: Record<string, any>;
  returnObjects?: boolean;
  keySeparator?: string;
  nsSeparator?: string;
  postProcess?: string[];
}

/**
 * Cultural adaptation
 */
export interface ICulturalAdaptation {
  locale: LocaleCode;
  formats: {
    date: string;
    time: string;
    dateTime: string;
    number: {
      decimal: string;
      thousands: string;
      grouping: number[];
    };
    currency: {
      symbol: string;
      placement: 'before' | 'after';
      decimal: string;
      thousands: string;
    };
  };
  calendar: {
    firstDay: number; // 0 = Sunday, 1 = Monday
    weekendDays: number[];
    holidays: Array<{
      date: string;
      name: string;
      type: 'public' | 'bank' | 'observance';
    }>;
  };
  addresses: {
    format: string[];
    postalCodeRegex: string;
    phoneRegex: string;
  };
  names: {
    format: 'first-last' | 'last-first';
    titles: string[];
  };
}

/**
 * Translation validation result
 */
export interface ITranslationValidation {
  valid: boolean;
  errors: Array<{
    key: string;
    type: 'missing' | 'invalid' | 'accessibility' | 'compliance';
    message: string;
    severity: 'error' | 'warning';
  }>;
  warnings: Array<{
    key: string;
    message: string;
  }>;
  coverage: number; // percentage
  suggestions: Array<{
    key: string;
    suggestion: string;
  }>;
}

/**
 * Advanced Localization Service
 */
export class AdvancedLocalizationService extends EventEmitter implements ILocalizationService {
  private config: ILocalizationConfig;
  private translations = new Map<string, ITranslationResource>();
  private translationCache = new Map<string, { value: string; expires: number }>();
  private metadata = new Map<string, ITranslationMetadata>();
  private pluralizationRules = new Map<LocaleCode, IPluralizationRule>();
  private culturalAdaptations = new Map<LocaleCode, ICulturalAdaptation>();
  private currentLocale: LocaleCode;
  private aiServiceFactory?: AIServiceFactory;
  private initialized = false;

  constructor(
    private readonly logger: ILoggingService,
    private readonly configService: IConfigurationService,
    private readonly fileSystem: IFileSystemService
  ) {
    super();

    // Load configuration
    this.config = this.loadConfig();
    this.currentLocale = this.config.defaultLocale;
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.logger.info('Initializing Advanced Localization Service');

      // Load translations for all supported locales
      for (const locale of this.config.supportedLocales) {
        await this.loadTranslations(locale);
      }

      // Load pluralization rules
      await this.loadPluralizationRules();

      // Load cultural adaptations
      await this.loadCulturalAdaptations();

      // Initialize AI services if machine translation is enabled
      if (this.config.machineTranslation.enabled) {
        this.aiServiceFactory = new AIServiceFactory(
          this.logger,
          this.configService,
          this.fileSystem
        );
        await this.aiServiceFactory.initializeServices();
      }

      // Set up hot-reloading in development
      if (process.env.NODE_ENV === 'development') {
        this.setupHotReloading();
      }

      this.initialized = true;
      this.emit('initialized', { locales: this.config.supportedLocales });

    } catch (error) {
      this.logger.error('Failed to initialize localization service', error as Error);
      throw error;
    }
  }

  /**
   * Translate a key
   */
  t(key: string, options?: ITranslationOptions | string): string {
    // Handle shorthand for default value
    if (typeof options === 'string') {
      options = { defaultValue: options };
    }

    const locale = options?.locale || this.currentLocale;
    const cacheKey = this.getCacheKey(key, locale, options);

    // Check cache
    if (this.config.cache.enabled) {
      const cached = this.translationCache.get(cacheKey);
      if (cached && cached.expires > Date.now()) {
        return cached.value;
      }
    }

    try {
      // Get translation
      let translation = this.getTranslation(key, locale, options);

      // Apply pluralization
      if (options?.count !== undefined && this.config.pluralization.enabled) {
        translation = this.applyPluralization(translation, options.count, locale);
      }

      // Apply interpolation
      if (options?.interpolation) {
        translation = this.applyInterpolation(translation, options.interpolation);
      }

      // Apply post-processing
      if (options?.postProcess) {
        translation = this.applyPostProcessing(translation, options.postProcess, locale);
      }

      // Cache result
      if (this.config.cache.enabled) {
        this.translationCache.set(cacheKey, {
          value: translation,
          expires: Date.now() + (this.config.cache.ttl * 1000)
        });
      }

      return translation;

    } catch (error) {
      this.logger.warn(`Translation failed for key: ${key}`, error as Error);
      return options?.defaultValue || key;
    }
  }

  /**
   * Format date
   */
  formatDate(
    date: Date | string | number,
    options?: IFormatOptions
  ): string {
    const locale = options?.locale || this.currentLocale;
    const dateObj = new Date(date);

    const formatOptions: Intl.DateTimeFormatOptions = {
      ...this.config.formatting.dateTimeFormat,
      dateStyle: options?.dateStyle,
      timeZone: options?.timeZone
    };

    // Use Norwegian-specific formatting
    if (locale === 'nb-NO') {
      return this.formatNorwegianDate(dateObj, formatOptions);
    }

    return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
  }

  /**
   * Format time
   */
  formatTime(
    date: Date | string | number,
    options?: IFormatOptions
  ): string {
    const locale = options?.locale || this.currentLocale;
    const dateObj = new Date(date);

    const formatOptions: Intl.DateTimeFormatOptions = {
      ...this.config.formatting.dateTimeFormat,
      timeStyle: options?.timeStyle || 'medium',
      timeZone: options?.timeZone
    };

    return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
  }

  /**
   * Format number
   */
  formatNumber(
    value: number,
    options?: IFormatOptions
  ): string {
    const locale = options?.locale || this.currentLocale;

    const formatOptions: Intl.NumberFormatOptions = {
      ...this.config.formatting.numberFormat,
      style: options?.style || 'decimal',
      currency: options?.currency,
      unit: options?.unit
    };

    // Use Norwegian-specific formatting
    if (locale === 'nb-NO') {
      return this.formatNorwegianNumber(value, formatOptions);
    }

    return new Intl.NumberFormat(locale, formatOptions).format(value);
  }

  /**
   * Format currency
   */
  formatCurrency(
    value: number,
    currency: string,
    options?: IFormatOptions
  ): string {
    const locale = options?.locale || this.currentLocale;

    const formatOptions: Intl.NumberFormatOptions = {
      ...this.config.formatting.currencyFormat,
      style: 'currency',
      currency
    };

    // Use Norwegian-specific formatting for NOK
    if (locale === 'nb-NO' && currency === 'NOK') {
      return this.formatNorwegianCurrency(value);
    }

    return new Intl.NumberFormat(locale, formatOptions).format(value);
  }

  /**
   * Get current locale
   */
  getCurrentLocale(): LocaleCode {
    return this.currentLocale;
  }

  /**
   * Set current locale
   */
  async setLocale(locale: LocaleCode): Promise<void> {
    if (!this.config.supportedLocales.includes(locale)) {
      throw new Error(`Unsupported locale: ${locale}`);
    }

    const previousLocale = this.currentLocale;
    this.currentLocale = locale;

    // Load translations if not already loaded
    if (!this.translations.has(locale)) {
      await this.loadTranslations(locale);
    }

    // Clear cache
    this.translationCache.clear();

    this.emit('localeChanged', { from: previousLocale, to: locale });
  }

  /**
   * Get supported locales
   */
  getSupportedLocales(): LocaleCode[] {
    return [...this.config.supportedLocales];
  }

  /**
   * Detect user locale
   */
  async detectLocale(request?: {
    query?: Record<string, string>;
    cookies?: Record<string, string>;
    headers?: Record<string, string>;
    path?: string;
    subdomain?: string;
  }): Promise<LocaleCode> {
    if (!this.config.detection.enabled || !request) {
      return this.config.defaultLocale;
    }

    for (const method of this.config.detection.order) {
      let detectedLocale: string | undefined;

      switch (method) {
        case 'querystring':
          detectedLocale = request.query?.locale || request.query?.lang;
          break;
        case 'cookie':
          detectedLocale = request.cookies?.locale || request.cookies?.lang;
          break;
        case 'header':
          detectedLocale = this.parseAcceptLanguage(
            request.headers?.['accept-language'] || ''
          );
          break;
        case 'path':
          detectedLocale = this.extractLocaleFromPath(request.path || '');
          break;
        case 'subdomain':
          detectedLocale = this.extractLocaleFromSubdomain(request.subdomain || '');
          break;
      }

      if (detectedLocale && this.isValidLocale(detectedLocale)) {
        return detectedLocale as LocaleCode;
      }
    }

    return this.config.defaultLocale;
  }

  /**
   * Validate translations
   */
  async validateTranslations(locale: LocaleCode): Promise<ITranslationValidation> {
    const errors: ITranslationValidation['errors'] = [];
    const warnings: ITranslationValidation['warnings'] = [];
    const suggestions: ITranslationValidation['suggestions'] = [];

    const translations = this.translations.get(locale);
    if (!translations) {
      return {
        valid: false,
        errors: [{
          key: locale,
          type: 'missing',
          message: `No translations found for locale: ${locale}`,
          severity: 'error'
        }],
        warnings: [],
        coverage: 0,
        suggestions: []
      };
    }

    // Get reference translations (fallback locale)
    const referenceTranslations = this.translations.get(this.config.fallbackLocale);
    if (!referenceTranslations) {
      return {
        valid: false,
        errors: [{
          key: this.config.fallbackLocale,
          type: 'missing',
          message: `No reference translations found`,
          severity: 'error'
        }],
        warnings: [],
        coverage: 0,
        suggestions: []
      };
    }

    // Check coverage
    const { missing, total } = this.checkTranslationCoverage(
      translations,
      referenceTranslations
    );

    missing.forEach(key => {
      errors.push({
        key,
        type: 'missing',
        message: `Missing translation for key: ${key}`,
        severity: 'error'
      });
    });

    // Norwegian compliance checks
    if (this.config.norwegianCompliance.validateTranslations && locale === 'nb-NO') {
      const complianceErrors = await this.validateNorwegianCompliance(translations);
      errors.push(...complianceErrors);
    }

    // Accessibility checks
    if (this.config.norwegianCompliance.requireAccessibility) {
      const accessibilityErrors = this.validateAccessibility(translations);
      errors.push(...accessibilityErrors);
    }

    // Check for potential issues
    this.checkTranslationQuality(translations, '').forEach(issue => {
      if (issue.severity === 'error') {
        errors.push(issue);
      } else {
        warnings.push({
          key: issue.key,
          message: issue.message
        });
      }
    });

    // Generate suggestions using AI if available
    if (this.aiServiceFactory && errors.length > 0) {
      const aiSuggestions = await this.generateTranslationSuggestions(
        errors.slice(0, 10).map(e => e.key),
        locale
      );
      suggestions.push(...aiSuggestions);
    }

    const coverage = total > 0 ? ((total - missing.length) / total) * 100 : 0;

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      coverage,
      suggestions
    };
  }

  /**
   * Add translation
   */
  async addTranslation(
    key: string,
    value: string,
    locale: LocaleCode,
    metadata?: Partial<ITranslationMetadata>
  ): Promise<void> {
    const translations = this.translations.get(locale) || {};
    
    // Set nested value
    this.setNestedValue(translations, key, value);
    this.translations.set(locale, translations);

    // Add metadata
    const fullMetadata: ITranslationMetadata = {
      key,
      locale,
      lastUpdated: new Date(),
      verified: false,
      ...metadata
    };
    this.metadata.set(`${locale}.${key}`, fullMetadata);

    // Clear cache
    this.clearCacheForKey(key, locale);

    // Save if path is configured
    if (this.config.savePath) {
      await this.saveTranslations(locale);
    }

    this.emit('translationAdded', { key, locale, value });
  }

  /**
   * Get translation with machine translation fallback
   */
  async getTranslationWithFallback(
    key: string,
    targetLocale: LocaleCode,
    sourceLocale?: LocaleCode
  ): Promise<string> {
    // Try to get existing translation
    const existing = this.getTranslation(key, targetLocale);
    if (existing && existing !== key) {
      return existing;
    }

    // Try machine translation if enabled
    if (this.config.machineTranslation.enabled && this.aiServiceFactory) {
      const source = sourceLocale || this.config.fallbackLocale;
      const sourceText = this.getTranslation(key, source);
      
      if (sourceText && sourceText !== key) {
        const translated = await this.machineTranslate(
          sourceText,
          source,
          targetLocale
        );

        // Add to translations
        await this.addTranslation(key, translated, targetLocale, {
          machineTranslated: true
        });

        return translated;
      }
    }

    return key;
  }

  /**
   * Get cultural adaptation
   */
  getCulturalAdaptation(locale: LocaleCode): ICulturalAdaptation | undefined {
    return this.culturalAdaptations.get(locale);
  }

  /**
   * Format address
   */
  formatAddress(address: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }, locale?: LocaleCode): string {
    const loc = locale || this.currentLocale;
    const adaptation = this.culturalAdaptations.get(loc);
    
    if (!adaptation) {
      // Default format
      return [
        address.street,
        address.city,
        address.state,
        address.postalCode,
        address.country
      ].filter(Boolean).join(', ');
    }

    // Use cultural format
    return adaptation.addresses.format
      .map(part => {
        switch (part) {
          case '{street}': return address.street;
          case '{city}': return address.city;
          case '{state}': return address.state;
          case '{postalCode}': return address.postalCode;
          case '{country}': return address.country;
          default: return part;
        }
      })
      .filter(Boolean)
      .join(' ');
  }

  /**
   * Get text direction
   */
  getTextDirection(locale?: LocaleCode): 'ltr' | 'rtl' {
    const loc = locale || this.currentLocale;
    const rtlLocales = ['ar-SA', 'he-IL', 'fa-IR', 'ur-PK'];
    return rtlLocales.includes(loc) ? 'rtl' : 'ltr';
  }

  // === Private Helper Methods ===

  /**
   * Load configuration
   */
  private loadConfig(): ILocalizationConfig {
    const defaultConfig: ILocalizationConfig = {
      defaultLocale: 'nb-NO',
      supportedLocales: ['nb-NO', 'en-US', 'fr-FR', 'ar-SA'],
      fallbackLocale: 'en-US',
      loadPath: './locales',
      detection: {
        enabled: true,
        order: ['querystring', 'cookie', 'header'],
        caches: ['cookie']
      },
      interpolation: {
        prefix: '{{',
        suffix: '}}',
        escapeValue: true
      },
      pluralization: {
        enabled: true
      },
      formatting: {
        dateTimeFormat: {},
        numberFormat: {},
        currencyFormat: {}
      },
      norwegianCompliance: {
        enforceBokmaal: true,
        validateTranslations: true,
        requireAccessibility: true
      },
      cache: {
        enabled: true,
        ttl: 300
      },
      machineTranslation: {
        enabled: false
      }
    };

    try {
      const userConfig = this.configService.get('localization', {});
      return { ...defaultConfig, ...userConfig };
    } catch {
      return defaultConfig;
    }
  }

  /**
   * Load translations for a locale
   */
  private async loadTranslations(locale: LocaleCode): Promise<void> {
    try {
      const filePath = `${this.config.loadPath}/${locale}.json`;
      
      if (await this.fileSystem.exists(filePath)) {
        const content = await this.fileSystem.readFile(filePath);
        const translations = JSON.parse(content);
        this.translations.set(locale, translations);
        
        this.logger.debug(`Loaded translations for locale: ${locale}`);
      } else {
        this.logger.warn(`Translation file not found: ${filePath}`);
        this.translations.set(locale, {});
      }
    } catch (error) {
      this.logger.error(`Failed to load translations for ${locale}`, error as Error);
      this.translations.set(locale, {});
    }
  }

  /**
   * Load pluralization rules
   */
  private async loadPluralizationRules(): Promise<void> {
    // Norwegian pluralization
    this.pluralizationRules.set('nb-NO', {
      locale: 'nb-NO',
      rule: (count: number) => {
        if (count === 0) return 'zero';
        if (count === 1) return 'one';
        return 'other';
      }
    });

    // English pluralization
    this.pluralizationRules.set('en-US', {
      locale: 'en-US',
      rule: (count: number) => {
        if (count === 0) return 'zero';
        if (count === 1) return 'one';
        return 'other';
      }
    });

    // French pluralization
    this.pluralizationRules.set('fr-FR', {
      locale: 'fr-FR',
      rule: (count: number) => {
        if (count === 0) return 'zero';
        if (count === 1) return 'one';
        return 'other';
      }
    });

    // Arabic pluralization (simplified)
    this.pluralizationRules.set('ar-SA', {
      locale: 'ar-SA',
      rule: (count: number) => {
        if (count === 0) return 'zero';
        if (count === 1) return 'one';
        if (count === 2) return 'two';
        if (count % 100 >= 3 && count % 100 <= 10) return 'few';
        if (count % 100 >= 11 && count % 100 <= 99) return 'many';
        return 'other';
      }
    });
  }

  /**
   * Load cultural adaptations
   */
  private async loadCulturalAdaptations(): Promise<void> {
    // Norwegian cultural adaptation
    this.culturalAdaptations.set('nb-NO', {
      locale: 'nb-NO',
      formats: {
        date: 'dd.MM.yyyy',
        time: 'HH:mm',
        dateTime: 'dd.MM.yyyy HH:mm',
        number: {
          decimal: ',',
          thousands: ' ',
          grouping: [3]
        },
        currency: {
          symbol: 'kr',
          placement: 'after',
          decimal: ',',
          thousands: ' '
        }
      },
      calendar: {
        firstDay: 1, // Monday
        weekendDays: [0, 6], // Sunday, Saturday
        holidays: [
          { date: '01-01', name: 'Nyttårsdag', type: 'public' },
          { date: '05-01', name: 'Arbeidernes dag', type: 'public' },
          { date: '05-17', name: 'Grunnlovsdag', type: 'public' },
          { date: '12-25', name: 'Første juledag', type: 'public' },
          { date: '12-26', name: 'Andre juledag', type: 'public' }
        ]
      },
      addresses: {
        format: ['{street}', '{postalCode} {city}', '{country}'],
        postalCodeRegex: '^\\d{4}$',
        phoneRegex: '^(\\+47)?[2-9]\\d{7}$'
      },
      names: {
        format: 'first-last',
        titles: ['Hr.', 'Fru', 'Frk.', 'Dr.', 'Prof.']
      }
    });

    // Add other cultural adaptations as needed
  }

  /**
   * Get translation from nested object
   */
  private getTranslation(
    key: string,
    locale: LocaleCode,
    options?: ITranslationOptions
  ): string {
    const translations = this.translations.get(locale);
    if (!translations) {
      // Try fallback locale
      if (locale !== this.config.fallbackLocale) {
        return this.getTranslation(key, this.config.fallbackLocale, options);
      }
      return options?.defaultValue || key;
    }

    // Navigate nested structure
    const keySeparator = options?.keySeparator || '.';
    const keys = key.split(keySeparator);
    let current: any = translations;

    for (const k of keys) {
      if (!current || typeof current !== 'object') {
        break;
      }
      current = current[k];
    }

    if (typeof current === 'string') {
      return current;
    }

    if (options?.returnObjects && typeof current === 'object') {
      return current;
    }

    // Try fallback locale
    if (locale !== this.config.fallbackLocale) {
      return this.getTranslation(key, this.config.fallbackLocale, options);
    }

    return options?.defaultValue || key;
  }

  /**
   * Apply pluralization
   */
  private applyPluralization(
    translation: string | any,
    count: number,
    locale: LocaleCode
  ): string {
    if (typeof translation !== 'object') {
      return translation;
    }

    const rule = this.pluralizationRules.get(locale);
    if (!rule) {
      return translation.other || translation.one || translation;
    }

    const form = rule.rule(count);
    return translation[form] || translation.other || translation;
  }

  /**
   * Apply interpolation
   */
  private applyInterpolation(
    translation: string,
    values: Record<string, any>
  ): string {
    const { prefix, suffix, escapeValue } = this.config.interpolation;
    
    return translation.replace(
      new RegExp(`${prefix}(\\w+)${suffix}`, 'g'),
      (match, key) => {
        const value = values[key];
        if (value === undefined) return match;
        
        const stringValue = String(value);
        return escapeValue ? this.escapeHtml(stringValue) : stringValue;
      }
    );
  }

  /**
   * Apply post-processing
   */
  private applyPostProcessing(
    translation: string,
    processors: string[],
    locale: LocaleCode
  ): string {
    let result = translation;

    for (const processor of processors) {
      switch (processor) {
        case 'uppercase':
          result = result.toUpperCase();
          break;
        case 'lowercase':
          result = result.toLowerCase();
          break;
        case 'capitalize':
          result = result.charAt(0).toUpperCase() + result.slice(1);
          break;
        case 'norwegianFormat':
          result = this.applyNorwegianFormatting(result);
          break;
      }
    }

    return result;
  }

  /**
   * Format Norwegian date
   */
  private formatNorwegianDate(
    date: Date,
    options: Intl.DateTimeFormatOptions
  ): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    if (options.dateStyle === 'full') {
      const monthNames = [
        'januar', 'februar', 'mars', 'april', 'mai', 'juni',
        'juli', 'august', 'september', 'oktober', 'november', 'desember'
      ];
      const dayNames = [
        'søndag', 'mandag', 'tirsdag', 'onsdag', 
        'torsdag', 'fredag', 'lørdag'
      ];
      
      return `${dayNames[date.getDay()]} ${day}. ${monthNames[date.getMonth()]} ${year}`;
    }

    return `${day}.${month}.${year}`;
  }

  /**
   * Format Norwegian number
   */
  private formatNorwegianNumber(
    value: number,
    options: Intl.NumberFormatOptions
  ): string {
    const parts = value.toString().split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const decimalPart = parts[1];

    if (decimalPart) {
      return `${integerPart},${decimalPart}`;
    }

    return integerPart;
  }

  /**
   * Format Norwegian currency
   */
  private formatNorwegianCurrency(value: number): string {
    const formatted = this.formatNorwegianNumber(value);
    return `${formatted} kr`;
  }

  /**
   * Apply Norwegian formatting
   */
  private applyNorwegianFormatting(text: string): string {
    // Apply Norwegian quotation marks
    return text
      .replace(/"([^"]*)"/g, '«$1»')
      .replace(/'([^']*)'/g, '‹$1›');
  }

  /**
   * Parse Accept-Language header
   */
  private parseAcceptLanguage(header: string): string | undefined {
    const languages = header
      .split(',')
      .map(lang => {
        const [locale, q = '1'] = lang.trim().split(';q=');
        return { locale: locale.trim(), quality: parseFloat(q) };
      })
      .sort((a, b) => b.quality - a.quality);

    for (const { locale } of languages) {
      const normalizedLocale = this.normalizeLocale(locale);
      if (this.isValidLocale(normalizedLocale)) {
        return normalizedLocale;
      }
    }

    return undefined;
  }

  /**
   * Extract locale from path
   */
  private extractLocaleFromPath(path: string): string | undefined {
    const match = path.match(/^\/([a-z]{2}(-[A-Z]{2})?)\//);
    return match ? match[1] : undefined;
  }

  /**
   * Extract locale from subdomain
   */
  private extractLocaleFromSubdomain(subdomain: string): string | undefined {
    const match = subdomain.match(/^([a-z]{2})(-[a-z]{2})?$/);
    return match ? match[0] : undefined;
  }

  /**
   * Normalize locale code
   */
  private normalizeLocale(locale: string): string {
    const parts = locale.toLowerCase().split(/[-_]/);
    if (parts.length === 1) {
      // Map language to default locale
      const langMap: Record<string, string> = {
        'nb': 'nb-NO',
        'no': 'nb-NO',
        'en': 'en-US',
        'fr': 'fr-FR',
        'ar': 'ar-SA'
      };
      return langMap[parts[0]] || locale;
    }
    return `${parts[0]}-${parts[1].toUpperCase()}`;
  }

  /**
   * Check if locale is valid
   */
  private isValidLocale(locale: string): boolean {
    return this.config.supportedLocales.includes(locale as LocaleCode);
  }

  /**
   * Get cache key
   */
  private getCacheKey(
    key: string,
    locale: LocaleCode,
    options?: ITranslationOptions
  ): string {
    const parts = [locale, key];
    
    if (options?.count !== undefined) {
      parts.push(`count:${options.count}`);
    }
    if (options?.context) {
      parts.push(`context:${options.context}`);
    }
    
    return parts.join('.');
  }

  /**
   * Clear cache for key
   */
  private clearCacheForKey(key: string, locale: LocaleCode): void {
    const prefix = `${locale}.${key}`;
    
    for (const cacheKey of this.translationCache.keys()) {
      if (cacheKey.startsWith(prefix)) {
        this.translationCache.delete(cacheKey);
      }
    }
  }

  /**
   * Set nested value
   */
  private setNestedValue(
    obj: any,
    key: string,
    value: any,
    separator: string = '.'
  ): void {
    const keys = key.split(separator);
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!current[k] || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * Check translation coverage
   */
  private checkTranslationCoverage(
    translations: ITranslationResource,
    reference: ITranslationResource,
    prefix: string = ''
  ): { missing: string[]; total: number } {
    const missing: string[] = [];
    let total = 0;

    const check = (trans: any, ref: any, path: string) => {
      for (const key in ref) {
        const fullKey = path ? `${path}.${key}` : key;
        total++;

        if (typeof ref[key] === 'object' && ref[key] !== null) {
          if (!trans[key] || typeof trans[key] !== 'object') {
            missing.push(fullKey);
          } else {
            check(trans[key], ref[key], fullKey);
          }
        } else {
          if (!trans[key]) {
            missing.push(fullKey);
          }
        }
      }
    };

    check(translations, reference, prefix);
    return { missing, total };
  }

  /**
   * Validate Norwegian compliance
   */
  private async validateNorwegianCompliance(
    translations: ITranslationResource
  ): Promise<ITranslationValidation['errors']> {
    const errors: ITranslationValidation['errors'] = [];

    // Check for required Norwegian terms
    const requiredTerms = {
      'privacy': 'personvern',
      'accessibility': 'tilgjengelighet',
      'cookie': 'informasjonskapsel'
    };

    const checkTerms = (trans: any, path: string = '') => {
      if (typeof trans === 'string') {
        for (const [english, norwegian] of Object.entries(requiredTerms)) {
          if (trans.toLowerCase().includes(english) && 
              !trans.toLowerCase().includes(norwegian)) {
            errors.push({
              key: path,
              type: 'compliance',
              message: `Use Norwegian term "${norwegian}" instead of "${english}"`,
              severity: 'warning' as const
            });
          }
        }
      } else if (typeof trans === 'object') {
        for (const key in trans) {
          checkTerms(trans[key], path ? `${path}.${key}` : key);
        }
      }
    };

    checkTerms(translations);
    return errors;
  }

  /**
   * Validate accessibility
   */
  private validateAccessibility(
    translations: ITranslationResource
  ): ITranslationValidation['errors'] {
    const errors: ITranslationValidation['errors'] = [];

    const checkAccessibility = (trans: any, path: string = '') => {
      if (typeof trans === 'string') {
        // Check for missing punctuation in UI labels
        if (path.includes('button') || path.includes('label')) {
          if (trans.length > 20 && !trans.match(/[.!?]$/)) {
            errors.push({
              key: path,
              type: 'accessibility',
              message: 'Long labels should end with punctuation for screen readers',
              severity: 'warning' as const
            });
          }
        }

        // Check for unclear abbreviations
        const abbrevs = trans.match(/\b[A-Z]{2,}\b/g);
        if (abbrevs) {
          errors.push({
            key: path,
            type: 'accessibility',
            message: `Abbreviations (${abbrevs.join(', ')}) should be explained for accessibility`,
            severity: 'warning' as const
          });
        }
      } else if (typeof trans === 'object') {
        for (const key in trans) {
          checkAccessibility(trans[key], path ? `${path}.${key}` : key);
        }
      }
    };

    checkAccessibility(translations);
    return errors;
  }

  /**
   * Check translation quality
   */
  private checkTranslationQuality(
    translations: ITranslationResource,
    path: string = ''
  ): ITranslationValidation['errors'] {
    const issues: ITranslationValidation['errors'] = [];

    const check = (trans: any, currentPath: string) => {
      if (typeof trans === 'string') {
        // Check for untranslated placeholders
        if (trans.includes('TODO') || trans.includes('FIXME')) {
          issues.push({
            key: currentPath,
            type: 'invalid',
            message: 'Contains untranslated placeholder',
            severity: 'error'
          });
        }

        // Check for excessive length
        if (trans.length > 200 && !currentPath.includes('description')) {
          issues.push({
            key: currentPath,
            type: 'invalid',
            message: 'Translation is too long for UI element',
            severity: 'warning' as const
          });
        }

        // Check for consistent capitalization
        if (currentPath.includes('title') && !trans.match(/^[A-Z]/)) {
          issues.push({
            key: currentPath,
            type: 'invalid',
            message: 'Titles should start with capital letter',
            severity: 'warning' as const
          });
        }
      } else if (typeof trans === 'object') {
        for (const key in trans) {
          check(trans[key], currentPath ? `${currentPath}.${key}` : key);
        }
      }
    };

    check(translations, path);
    return issues;
  }

  /**
   * Generate translation suggestions
   */
  private async generateTranslationSuggestions(
    keys: string[],
    locale: LocaleCode
  ): Promise<ITranslationValidation['suggestions']> {
    const suggestions: ITranslationValidation['suggestions'] = [];

    try {
      const aiService = this.aiServiceFactory!.createAICodeGeneratorService();
      
      for (const key of keys) {
        const prompt = `Suggest a translation for the key "${key}" in ${locale} for a Norwegian government application`;
        
        const response = await aiService.generateCode({
          description: prompt,
          type: 'translation',
          language: locale,
          framework: 'i18n',
          compliance: {
            nsmClassification: 'OPEN',
            gdprCompliant: true,
            wcagLevel: 'AAA',
            supportedLanguages: [locale],
            auditTrail: false
          } as NorwegianCompliance,
          locale,
          features: []
        });

        suggestions.push({
          key,
          suggestion: response.code.trim()
        });
      }
    } catch (error) {
      this.logger.warn('Failed to generate translation suggestions', error as Error);
    }

    return suggestions;
  }

  /**
   * Machine translate text
   */
  private async machineTranslate(
    text: string,
    sourceLocale: LocaleCode,
    targetLocale: LocaleCode
  ): Promise<string> {
    try {
      const aiService = this.aiServiceFactory!.createAICodeGeneratorService();
      
      const response = await aiService.generateCode({
        description: `Translate from ${sourceLocale} to ${targetLocale}: ${text}`,
        type: 'translation',
        language: targetLocale,
        framework: 'i18n',
        compliance: {
          nsmClassification: 'OPEN',
          gdprCompliant: true,
          wcagLevel: 'AAA',
          supportedLanguages: [targetLocale],
          auditTrail: false
        } as NorwegianCompliance,
        locale: targetLocale,
        features: []
      });

      return response.code.trim();

    } catch (error) {
      this.logger.error('Machine translation failed', error as Error);
      throw error;
    }
  }

  /**
   * Save translations
   */
  private async saveTranslations(locale: LocaleCode): Promise<void> {
    if (!this.config.savePath) return;

    try {
      const translations = this.translations.get(locale);
      if (!translations) return;

      const filePath = `${this.config.savePath}/${locale}.json`;
      await this.fileSystem.writeFile(
        filePath,
        JSON.stringify(translations, null, 2)
      );

      this.logger.debug(`Saved translations for locale: ${locale}`);

    } catch (error) {
      this.logger.error(`Failed to save translations for ${locale}`, error as Error);
    }
  }

  /**
   * Setup hot reloading
   */
  private setupHotReloading(): void {
    // In production, use file system watcher
    // For now, just reload periodically in development
    if (process.env.NODE_ENV === 'development') {
      setInterval(async () => {
        for (const locale of this.config.supportedLocales) {
          await this.loadTranslations(locale);
        }
        this.translationCache.clear();
      }, 5000);
    }
  }

  /**
   * Escape HTML
   */
  private escapeHtml(text: string): string {
    const escapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, char => escapeMap[char]);
  }
}