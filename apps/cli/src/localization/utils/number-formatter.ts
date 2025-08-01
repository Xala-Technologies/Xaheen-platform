/**
 * Number Formatting Utilities for Multiple Locales
 * Provides culture-specific number formatting for Norwegian, French, Arabic, and English
 */

/**
 * Format a number according to locale-specific conventions
 * @param number - Number to format
 * @param locale - Locale code (nb, fr, ar, en)
 * @param options - Optional formatting options
 * @returns Formatted number string
 */
export function formatNumber(
  number: number,
  locale: string,
  options?: {
    decimals?: number;
    useGrouping?: boolean;
    style?: 'decimal' | 'percent' | 'scientific';
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const {
    decimals,
    useGrouping = true,
    style = 'decimal',
    minimumFractionDigits = 0,
    maximumFractionDigits = decimals ?? 2,
  } = options || {};
  
  // Norwegian number format (space as thousands separator, comma as decimal)
  if (locale === 'nb' || locale === 'no') {
    if (style === 'percent') {
      return formatPercent(number, locale, { minimumFractionDigits, maximumFractionDigits });
    }
    
    const parts = number.toFixed(maximumFractionDigits).split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1];
    
    if (useGrouping) {
      // Add space as thousands separator
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    
    if (decimalPart && parseInt(decimalPart) > 0) {
      return `${integerPart},${decimalPart}`;
    }
    
    return integerPart;
  }
  
  // French number format (space as thousands separator, comma as decimal)
  if (locale === 'fr') {
    if (style === 'percent') {
      return formatPercent(number, locale, { minimumFractionDigits, maximumFractionDigits });
    }
    
    const parts = number.toFixed(maximumFractionDigits).split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1];
    
    if (useGrouping) {
      // Add non-breaking space as thousands separator
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
    }
    
    if (decimalPart && parseInt(decimalPart) > 0) {
      return `${integerPart},${decimalPart}`;
    }
    
    return integerPart;
  }
  
  // Arabic number format with optional Arabic-Indic digits
  if (locale === 'ar') {
    if (style === 'percent') {
      return formatPercent(number, locale, { minimumFractionDigits, maximumFractionDigits });
    }
    
    // Use native Intl.NumberFormat for Arabic
    const formatter = new Intl.NumberFormat('ar', {
      style: 'decimal',
      useGrouping,
      minimumFractionDigits,
      maximumFractionDigits,
    });
    
    return formatter.format(number);
  }
  
  // Default English format (comma as thousands separator, period as decimal)
  if (style === 'percent') {
    return formatPercent(number, locale, { minimumFractionDigits, maximumFractionDigits });
  }
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    useGrouping,
    minimumFractionDigits,
    maximumFractionDigits,
  });
  
  return formatter.format(number);
}

/**
 * Format a number as percentage
 * @param number - Number to format (0.15 = 15%)
 * @param locale - Locale code
 * @param options - Formatting options
 * @returns Formatted percentage string
 */
function formatPercent(
  number: number,
  locale: string,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const { minimumFractionDigits = 0, maximumFractionDigits = 0 } = options || {};
  const percentage = number * 100;
  
  const formatted = formatNumber(percentage, locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping: false,
  });
  
  // Locale-specific percent symbols
  const percentSymbols: Record<string, string> = {
    nb: ' %',
    fr: ' %',
    ar: '٪',
    en: '%',
  };
  
  const symbol = percentSymbols[locale] || percentSymbols.en;
  return `${formatted}${symbol}`;
}

/**
 * Convert Western Arabic numerals to Arabic-Indic numerals
 * @param text - Text containing numbers
 * @returns Text with Arabic-Indic numerals
 */
export function toArabicIndicNumerals(text: string): string {
  const arabicIndicMap: Record<string, string> = {
    '0': '٠',
    '1': '١',
    '2': '٢',
    '3': '٣',
    '4': '٤',
    '5': '٥',
    '6': '٦',
    '7': '٧',
    '8': '٨',
    '9': '٩',
  };
  
  return text.replace(/[0-9]/g, (digit) => arabicIndicMap[digit] || digit);
}

/**
 * Convert Arabic-Indic numerals to Western Arabic numerals
 * @param text - Text containing Arabic-Indic numbers
 * @returns Text with Western Arabic numerals
 */
export function fromArabicIndicNumerals(text: string): string {
  const westernMap: Record<string, string> = {
    '٠': '0',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9',
  };
  
  return text.replace(/[٠-٩]/g, (digit) => westernMap[digit] || digit);
}

/**
 * Format ordinal numbers (1st, 2nd, 3rd, etc.)
 * @param number - Number to format
 * @param locale - Locale code
 * @returns Formatted ordinal string
 */
export function formatOrdinal(number: number, locale: string): string {
  // Norwegian ordinals
  if (locale === 'nb' || locale === 'no') {
    return `${number}.`;
  }
  
  // French ordinals
  if (locale === 'fr') {
    if (number === 1) return '1er';
    return `${number}e`;
  }
  
  // Arabic ordinals
  if (locale === 'ar') {
    const arabicOrdinals: Record<number, string> = {
      1: 'الأول',
      2: 'الثاني',
      3: 'الثالث',
      4: 'الرابع',
      5: 'الخامس',
      6: 'السادس',
      7: 'السابع',
      8: 'الثامن',
      9: 'التاسع',
      10: 'العاشر',
    };
    
    if (arabicOrdinals[number]) {
      return arabicOrdinals[number];
    }
    
    return `${toArabicIndicNumerals(number.toString())}`;
  }
  
  // English ordinals
  const lastDigit = number % 10;
  const lastTwoDigits = number % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${number}th`;
  }
  
  switch (lastDigit) {
    case 1:
      return `${number}st`;
    case 2:
      return `${number}nd`;
    case 3:
      return `${number}rd`;
    default:
      return `${number}th`;
  }
}

/**
 * Format file size in human-readable format
 * @param bytes - Size in bytes
 * @param locale - Locale code
 * @param decimals - Number of decimal places
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number, locale: string, decimals = 2): string {
  if (bytes === 0) {
    const translations: Record<string, string> = {
      nb: '0 bytes',
      fr: '0 octets',
      ar: '٠ بايت',
      en: '0 bytes',
    };
    return translations[locale] || translations.en;
  }
  
  const k = 1024;
  const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const sizeTranslations: Record<string, string[]> = {
    nb: ['bytes', 'KB', 'MB', 'GB', 'TB'],
    fr: ['octets', 'Ko', 'Mo', 'Go', 'To'],
    ar: ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت'],
    en: ['bytes', 'KB', 'MB', 'GB', 'TB'],
  };
  
  const localeSizes = sizeTranslations[locale] || sizeTranslations.en;
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);
  
  const formattedSize = formatNumber(size, locale, { decimals });
  return `${formattedSize} ${localeSizes[i]}`;
}

/**
 * Format a number range
 * @param start - Start number
 * @param end - End number
 * @param locale - Locale code
 * @returns Formatted number range
 */
export function formatNumberRange(start: number, end: number, locale: string): string {
  const formattedStart = formatNumber(start, locale);
  const formattedEnd = formatNumber(end, locale);
  
  const separators: Record<string, string> = {
    nb: '–',
    fr: ' à ',
    ar: ' إلى ',
    en: '–',
  };
  
  const separator = separators[locale] || separators.en;
  return `${formattedStart}${separator}${formattedEnd}`;
}