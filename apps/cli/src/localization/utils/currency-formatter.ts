/**
 * Currency Formatting Utilities for Multiple Locales
 * Provides culture-specific currency formatting and calculations
 */

import { formatNumber } from './number-formatter';

/**
 * Currency configuration for different locales
 */
const currencyConfig: Record<string, {
  symbol: string;
  symbolPosition: 'before' | 'after';
  spacing: boolean;
  decimalPlaces: number;
}> = {
  // Norwegian Krone
  NOK: {
    symbol: 'kr',
    symbolPosition: 'after',
    spacing: true,
    decimalPlaces: 2,
  },
  // Euro
  EUR: {
    symbol: '€',
    symbolPosition: 'after',
    spacing: true,
    decimalPlaces: 2,
  },
  // US Dollar
  USD: {
    symbol: '$',
    symbolPosition: 'before',
    spacing: false,
    decimalPlaces: 2,
  },
  // British Pound
  GBP: {
    symbol: '£',
    symbolPosition: 'before',
    spacing: false,
    decimalPlaces: 2,
  },
  // Saudi Riyal
  SAR: {
    symbol: 'ر.س',
    symbolPosition: 'after',
    spacing: true,
    decimalPlaces: 2,
  },
  // UAE Dirham
  AED: {
    symbol: 'د.إ',
    symbolPosition: 'after',
    spacing: true,
    decimalPlaces: 2,
  },
  // Egyptian Pound
  EGP: {
    symbol: 'ج.م',
    symbolPosition: 'after',
    spacing: true,
    decimalPlaces: 2,
  },
  // Jordanian Dinar
  JOD: {
    symbol: 'د.أ',
    symbolPosition: 'after',
    spacing: true,
    decimalPlaces: 3,
  },
  // Kuwaiti Dinar
  KWD: {
    symbol: 'د.ك',
    symbolPosition: 'after',
    spacing: true,
    decimalPlaces: 3,
  },
};

/**
 * Format currency according to locale-specific conventions
 * @param amount - Amount to format
 * @param currency - Currency code (NOK, EUR, USD, etc.)
 * @param locale - Locale code (nb, fr, ar, en)
 * @param options - Optional formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale: string,
  options?: {
    showSymbol?: boolean;
    showCode?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const {
    showSymbol = true,
    showCode = false,
    minimumFractionDigits,
    maximumFractionDigits,
  } = options || {};
  
  const config = currencyConfig[currency] || {
    symbol: currency,
    symbolPosition: 'after',
    spacing: true,
    decimalPlaces: 2,
  };
  
  // Format the number part
  const formattedAmount = formatNumber(amount, locale, {
    minimumFractionDigits: minimumFractionDigits ?? config.decimalPlaces,
    maximumFractionDigits: maximumFractionDigits ?? config.decimalPlaces,
  });
  
  // Handle symbol display
  if (!showSymbol && !showCode) {
    return formattedAmount;
  }
  
  const displaySymbol = showCode ? currency : config.symbol;
  const spacing = config.spacing ? ' ' : '';
  
  // Special handling for Norwegian Krone
  if (currency === 'NOK' && (locale === 'nb' || locale === 'no')) {
    return `${formattedAmount}${spacing}${displaySymbol}`;
  }
  
  // Special handling for Euro in French
  if (currency === 'EUR' && locale === 'fr') {
    return `${formattedAmount}${spacing}${displaySymbol}`;
  }
  
  // Special handling for Arabic currencies
  if (locale === 'ar') {
    return `${formattedAmount}${spacing}${displaySymbol}`;
  }
  
  // Default positioning based on currency config
  if (config.symbolPosition === 'before') {
    return `${displaySymbol}${spacing}${formattedAmount}`;
  }
  
  return `${formattedAmount}${spacing}${displaySymbol}`;
}

/**
 * Norwegian VAT/MVA calculation utilities
 */
export const norwegianVAT = {
  /**
   * Standard VAT rates in Norway
   */
  rates: {
    standard: 0.25,      // 25% - Standard rate
    food: 0.15,          // 15% - Food and beverages
    transport: 0.12,     // 12% - Passenger transport, cinema, etc.
    zero: 0,             // 0% - Newspapers, books, etc.
  },
  
  /**
   * Calculate VAT amount from gross amount
   * @param grossAmount - Total amount including VAT
   * @param vatRate - VAT rate (0.25 for 25%)
   * @returns VAT amount
   */
  calculateVATFromGross(grossAmount: number, vatRate: number): number {
    return grossAmount - (grossAmount / (1 + vatRate));
  },
  
  /**
   * Calculate VAT amount from net amount
   * @param netAmount - Amount excluding VAT
   * @param vatRate - VAT rate (0.25 for 25%)
   * @returns VAT amount
   */
  calculateVATFromNet(netAmount: number, vatRate: number): number {
    return netAmount * vatRate;
  },
  
  /**
   * Add VAT to net amount
   * @param netAmount - Amount excluding VAT
   * @param vatRate - VAT rate (0.25 for 25%)
   * @returns Gross amount including VAT
   */
  addVAT(netAmount: number, vatRate: number): number {
    return netAmount * (1 + vatRate);
  },
  
  /**
   * Remove VAT from gross amount
   * @param grossAmount - Amount including VAT
   * @param vatRate - VAT rate (0.25 for 25%)
   * @returns Net amount excluding VAT
   */
  removeVAT(grossAmount: number, vatRate: number): number {
    return grossAmount / (1 + vatRate);
  },
};

/**
 * Currency conversion utilities
 */
export class CurrencyConverter {
  private exchangeRates: Map<string, number>;
  private baseCurrency: string;
  
  constructor(baseCurrency: string = 'USD') {
    this.baseCurrency = baseCurrency;
    this.exchangeRates = new Map();
    
    // Example exchange rates (in production, fetch from API)
    this.setExampleRates();
  }
  
  /**
   * Set example exchange rates (for demonstration)
   * In production, these would be fetched from a currency API
   */
  private setExampleRates(): void {
    // Rates relative to USD
    this.exchangeRates.set('USD', 1);
    this.exchangeRates.set('EUR', 0.85);
    this.exchangeRates.set('GBP', 0.73);
    this.exchangeRates.set('NOK', 8.50);
    this.exchangeRates.set('SEK', 8.80);
    this.exchangeRates.set('DKK', 6.30);
    this.exchangeRates.set('CHF', 0.92);
    this.exchangeRates.set('SAR', 3.75);
    this.exchangeRates.set('AED', 3.67);
    this.exchangeRates.set('EGP', 30.90);
    this.exchangeRates.set('JOD', 0.71);
    this.exchangeRates.set('KWD', 0.31);
  }
  
  /**
   * Update exchange rate for a currency
   * @param currency - Currency code
   * @param rate - Exchange rate relative to base currency
   */
  updateRate(currency: string, rate: number): void {
    this.exchangeRates.set(currency, rate);
  }
  
  /**
   * Convert amount between currencies
   * @param amount - Amount to convert
   * @param fromCurrency - Source currency code
   * @param toCurrency - Target currency code
   * @returns Converted amount
   */
  convert(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) {
      return amount;
    }
    
    const fromRate = this.exchangeRates.get(fromCurrency);
    const toRate = this.exchangeRates.get(toCurrency);
    
    if (!fromRate || !toRate) {
      throw new Error(`Exchange rate not available for ${fromCurrency} or ${toCurrency}`);
    }
    
    // Convert to base currency first, then to target currency
    const baseAmount = amount / fromRate;
    return baseAmount * toRate;
  }
  
  /**
   * Get exchange rate between two currencies
   * @param fromCurrency - Source currency code
   * @param toCurrency - Target currency code
   * @returns Exchange rate
   */
  getRate(fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) {
      return 1;
    }
    
    const fromRate = this.exchangeRates.get(fromCurrency);
    const toRate = this.exchangeRates.get(toCurrency);
    
    if (!fromRate || !toRate) {
      throw new Error(`Exchange rate not available for ${fromCurrency} or ${toCurrency}`);
    }
    
    return toRate / fromRate;
  }
}

/**
 * Format price range
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 * @param currency - Currency code
 * @param locale - Locale code
 * @returns Formatted price range
 */
export function formatPriceRange(
  minPrice: number,
  maxPrice: number,
  currency: string,
  locale: string
): string {
  const min = formatCurrency(minPrice, currency, locale);
  const max = formatCurrency(maxPrice, currency, locale);
  
  const separators: Record<string, string> = {
    nb: ' – ',
    fr: ' à ',
    ar: ' إلى ',
    en: ' – ',
  };
  
  const separator = separators[locale] || separators.en;
  return `${min}${separator}${max}`;
}

/**
 * Format discount percentage
 * @param originalPrice - Original price
 * @param discountedPrice - Discounted price
 * @param locale - Locale code
 * @returns Formatted discount percentage
 */
export function formatDiscount(
  originalPrice: number,
  discountedPrice: number,
  locale: string
): string {
  const discountPercent = ((originalPrice - discountedPrice) / originalPrice) * 100;
  const rounded = Math.round(discountPercent);
  
  const templates: Record<string, string> = {
    nb: `-${rounded}%`,
    fr: `-${rounded} %`,
    ar: `خصم ${rounded}٪`,
    en: `${rounded}% off`,
  };
  
  return templates[locale] || templates.en;
}