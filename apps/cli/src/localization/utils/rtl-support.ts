/**
 * RTL (Right-to-Left) Support Utilities
 * Provides functions to handle RTL languages like Arabic, Hebrew, etc.
 */

/**
 * Determines if a language requires RTL (Right-to-Left) layout
 * @param language - Language code (e.g., 'ar', 'he', 'fa')
 * @returns True if the language is RTL
 */
export function isRTL(language: string): boolean {
  const rtlLanguages = [
    'ar', // Arabic
    'arc', // Aramaic
    'dv', // Divehi
    'fa', // Persian/Farsi
    'ha', // Hausa
    'he', // Hebrew
    'khw', // Khowar
    'ks', // Kashmiri
    'ku', // Kurdish
    'ps', // Pashto
    'ur', // Urdu
    'yi', // Yiddish
  ];
  
  return rtlLanguages.includes(language.toLowerCase());
}

/**
 * Returns CSS styles specific to RTL layout
 * @returns CSS string with RTL-specific styles
 */
export function getRTLCSS(): string {
  return `
/* RTL Layout Support */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

/* Flexbox RTL adjustments */
[dir="rtl"] .flex-row {
  flex-direction: row-reverse;
}

[dir="rtl"] .ml-auto {
  margin-left: 0;
  margin-right: auto;
}

[dir="rtl"] .mr-auto {
  margin-right: 0;
  margin-left: auto;
}

/* Padding and Margin RTL adjustments */
[dir="rtl"] .pl-4 {
  padding-left: 0;
  padding-right: 1rem;
}

[dir="rtl"] .pr-4 {
  padding-right: 0;
  padding-left: 1rem;
}

[dir="rtl"] .ml-4 {
  margin-left: 0;
  margin-right: 1rem;
}

[dir="rtl"] .mr-4 {
  margin-right: 0;
  margin-left: 1rem;
}

/* Border RTL adjustments */
[dir="rtl"] .border-l {
  border-left: none;
  border-right-width: 1px;
}

[dir="rtl"] .border-r {
  border-right: none;
  border-left-width: 1px;
}

[dir="rtl"] .rounded-l {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
}

[dir="rtl"] .rounded-r {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-top-left-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
}

/* Transform RTL adjustments */
[dir="rtl"] .translate-x-1 {
  transform: translateX(-0.25rem);
}

[dir="rtl"] .-translate-x-1 {
  transform: translateX(0.25rem);
}

/* Arabic-specific font families */
[dir="rtl"] {
  font-family: 'Noto Sans Arabic', 'Amiri', 'Cairo', 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Icon rotation for RTL */
[dir="rtl"] .rotate-for-rtl {
  transform: scaleX(-1);
}

/* Grid RTL adjustments */
[dir="rtl"] .text-left {
  text-align: right;
}

[dir="rtl"] .text-right {
  text-align: left;
}

[dir="rtl"] .float-left {
  float: right;
}

[dir="rtl"] .float-right {
  float: left;
}

/* Form elements RTL adjustments */
[dir="rtl"] input[type="email"],
[dir="rtl"] input[type="tel"],
[dir="rtl"] input[type="url"],
[dir="rtl"] input[type="number"] {
  direction: ltr;
  text-align: right;
}

/* Table RTL adjustments */
[dir="rtl"] table {
  text-align: right;
}

[dir="rtl"] th {
  text-align: right;
}

/* List RTL adjustments */
[dir="rtl"] ul,
[dir="rtl"] ol {
  padding-right: 2rem;
  padding-left: 0;
}

/* Animations RTL adjustments */
@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slideInFromLeft {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

[dir="rtl"] .slide-in-left {
  animation: slideInFromRight 0.3s ease-in-out;
}

[dir="rtl"] .slide-in-right {
  animation: slideInFromLeft 0.3s ease-in-out;
}
`;
}

/**
 * Formats text with proper direction based on language
 * @param text - Text to format
 * @param language - Language code
 * @returns Formatted text with direction markers if needed
 */
export function formatTextDirection(text: string, language: string): string {
  if (isRTL(language)) {
    // Add RTL marks for proper text display
    const rtlMark = '\u200F'; // Right-to-left mark
    const ltrMark = '\u200E'; // Left-to-right mark
    
    // Check if text contains mixed direction content
    const hasLatinChars = /[A-Za-z]/.test(text);
    const hasArabicChars = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
    
    if (hasLatinChars && hasArabicChars) {
      // Mixed content - add directional marks
      return rtlMark + text.replace(/([A-Za-z0-9\s]+)/g, ltrMark + '$1' + rtlMark);
    }
    
    // Pure RTL content
    return rtlMark + text;
  }
  
  // LTR content
  return text;
}

/**
 * Get HTML attributes for RTL support
 * @param language - Language code
 * @returns Object with dir and lang attributes
 */
export function getRTLAttributes(language: string): { dir: 'ltr' | 'rtl'; lang: string } {
  return {
    dir: isRTL(language) ? 'rtl' : 'ltr',
    lang: language,
  };
}

/**
 * Convert LTR class names to RTL equivalents
 * @param className - Original class name
 * @param isRtl - Whether RTL is active
 * @returns Converted class name
 */
export function convertClassNameForRTL(className: string, isRtl: boolean): string {
  if (!isRtl) return className;
  
  const rtlMap: Record<string, string> = {
    'left-0': 'right-0',
    'right-0': 'left-0',
    'ml-': 'mr-',
    'mr-': 'ml-',
    'pl-': 'pr-',
    'pr-': 'pl-',
    'text-left': 'text-right',
    'text-right': 'text-left',
    'border-l': 'border-r',
    'border-r': 'border-l',
    'rounded-l': 'rounded-r',
    'rounded-r': 'rounded-l',
    'float-left': 'float-right',
    'float-right': 'float-left',
  };
  
  let convertedClass = className;
  
  for (const [ltr, rtl] of Object.entries(rtlMap)) {
    if (className.includes(ltr)) {
      convertedClass = className.replace(ltr, rtl);
      break;
    }
  }
  
  return convertedClass;
}

/**
 * Get font family based on language
 * @param language - Language code
 * @returns Appropriate font family string
 */
export function getFontFamily(language: string): string {
  const fontFamilies: Record<string, string> = {
    ar: "'Noto Sans Arabic', 'Amiri', 'Cairo', 'Tajawal', sans-serif",
    he: "'Noto Sans Hebrew', 'David Libre', 'Frank Ruhl Libre', sans-serif",
    fa: "'Vazir', 'Sahel', 'Samim', sans-serif",
    default: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  };
  
  return fontFamilies[language] || fontFamilies.default;
}