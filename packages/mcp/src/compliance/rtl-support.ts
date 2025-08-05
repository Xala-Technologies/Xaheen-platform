/**
 * Right-to-Left (RTL) Text Support for Arabic Compliance
 * Comprehensive RTL language support for Norwegian applications
 * @version 1.0.0
 */

export type RTLLanguage = 'ar' | 'ar-SA' | 'ar-EG' | 'ar-AE' | 'ar-NO' | 'he' | 'fa' | 'ur';
export type TextDirection = 'ltr' | 'rtl' | 'auto';

export interface RTLConfiguration {
  readonly language: RTLLanguage;
  readonly direction: TextDirection;
  readonly textAlign: 'start' | 'end' | 'left' | 'right' | 'center';
  readonly margins: {
    readonly start: string;
    readonly end: string;
  };
  readonly borders: {
    readonly start: string;
    readonly end: string;
  };
  readonly positioning: {
    readonly float: 'start' | 'end' | 'left' | 'right';
    readonly clear: 'start' | 'end' | 'left' | 'right' | 'both';
  };
}

export interface RTLTranslations {
  readonly common: Record<string, string>;
  readonly navigation: Record<string, string>;
  readonly forms: Record<string, string>;
  readonly validation: Record<string, string>;
  readonly dates: Record<string, string>;
  readonly actions: Record<string, string>;
  readonly status: Record<string, string>;
  readonly accessibility: Record<string, string>;
  readonly numbers: Record<string, string>;
}

// Arabic translations for Norwegian applications
export const ARABIC_TRANSLATIONS: RTLTranslations = {
  common: {
    yes: 'نعم',
    no: 'لا',
    ok: 'موافق',
    cancel: 'إلغاء',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تحرير',
    view: 'عرض',
    close: 'إغلاق',
    open: 'فتح',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    warning: 'تحذير',
    info: 'معلومات',
    help: 'مساعدة',
    search: 'بحث',
    filter: 'تصفية',
    sort: 'ترتيب',
    clear: 'مسح',
    reset: 'إعادة تعيين',
    submit: 'إرسال',
    upload: 'رفع',
    download: 'تحميل',
    print: 'طباعة',
    share: 'مشاركة',
    copy: 'نسخ',
    paste: 'لصق',
    cut: 'قص',
    undo: 'تراجع',
    redo: 'إعادة',
    select: 'اختيار',
    deselect: 'إلغاء الاختيار',
    selectAll: 'اختيار الكل',
    deselectAll: 'إلغاء اختيار الكل',
  },
  navigation: {
    home: 'الرئيسية',
    back: 'رجوع',
    forward: 'إلى الأمام',
    next: 'التالي',
    previous: 'السابق',
    first: 'الأول',
    last: 'الأخير',
    menu: 'القائمة',
    navigation: 'التنقل',
    breadcrumb: 'مسار التنقل',
    pagination: 'ترقيم الصفحات',
    page: 'صفحة',
    of: 'من',
    goTo: 'انتقال إلى',
    skip: 'تخطي إلى',
    skipToContent: 'تخطي إلى المحتوى',
    skipToNavigation: 'تخطي إلى التنقل',
  },
  forms: {
    required: 'مطلوب',
    optional: 'اختياري',
    placeholder: 'اكتب هنا...',
    name: 'الاسم',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    address: 'العنوان',
    postalCode: 'الرمز البريدي',
    city: 'المدينة',
    country: 'البلد',
    date: 'التاريخ',
    time: 'الوقت',
    dateTime: 'التاريخ والوقت',
    birthDate: 'تاريخ الميلاد',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    username: 'اسم المستخدم',
    message: 'الرسالة',
    comment: 'تعليق',
    description: 'الوصف',
    title: 'العنوان',
    category: 'الفئة',
    type: 'النوع',
    status: 'الحالة',
    active: 'نشط',
    inactive: 'غير نشط',
    enabled: 'مُفعل',
    disabled: 'مُعطل',
  },
  validation: {
    required: 'هذا الحقل مطلوب',
    email: 'عنوان بريد إلكتروني غير صحيح',
    phone: 'رقم هاتف غير صحيح',
    postalCode: 'رمز بريدي غير صحيح',
    minLength: 'الحد الأدنى {0} أحرف',
    maxLength: 'الحد الأقصى {0} أحرف',
    min: 'القيمة الدنيا هي {0}',
    max: 'القيمة العليا هي {0}',
    pattern: 'تنسيق غير صحيح',
    date: 'تاريخ غير صحيح',
    dateRange: 'يجب أن يكون التاريخ بين {0} و {1}',
    time: 'وقت غير صحيح',
    url: 'رابط غير صحيح',
    number: 'يجب أن يكون رقماً',
    integer: 'يجب أن يكون رقماً صحيحاً',
    decimal: 'يجب أن يكون رقماً عشرياً',
    positive: 'يجب أن يكون رقماً موجباً',
    negative: 'يجب أن يكون رقماً سالباً',
    passwordMatch: 'كلمات المرور غير متطابقة',
    unique: 'هذه القيمة مستخدمة بالفعل',
    file: 'ملف غير صحيح',
    fileSize: 'الملف كبير جداً (الحد الأقصى {0})',
    fileType: 'نوع ملف غير صحيح',
  },
  dates: {
    today: 'اليوم',
    yesterday: 'أمس',
    tomorrow: 'غداً',
    thisWeek: 'هذا الأسبوع',
    nextWeek: 'الأسبوع القادم',
    lastWeek: 'الأسبوع الماضي',
    thisMonth: 'هذا الشهر',
    nextMonth: 'الشهر القادم',
    lastMonth: 'الشهر الماضي',
    thisYear: 'هذا العام',
    nextYear: 'العام القادم',
    lastYear: 'العام الماضي',
    now: 'الآن',
    selectDate: 'اختر التاريخ',
    selectTime: 'اختر الوقت',
    selectDateTime: 'اختر التاريخ والوقت',
    dateFormat: 'تنسيق التاريخ: dd.mm.yyyy',
    timeFormat: 'تنسيق الوقت: hh:mm',
    invalidDate: 'تاريخ غير صحيح',
    invalidTime: 'وقت غير صحيح',
    monday: 'الاثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
    sunday: 'الأحد',
    january: 'يناير',
    february: 'فبراير',
    march: 'مارس',
    april: 'أبريل',
    may: 'مايو',
    june: 'يونيو',
    july: 'يوليو',
    august: 'أغسطس',
    september: 'سبتمبر',
    october: 'أكتوبر',
    november: 'نوفمبر',
    december: 'ديسمبر',
  },
  actions: {
    create: 'إنشاء',
    read: 'قراءة',
    update: 'تحديث',
    delete: 'حذف',
    add: 'إضافة',
    remove: 'إزالة',
    insert: 'إدراج',
    append: 'إلحاق',
    prepend: 'إدراج في البداية',
    replace: 'استبدال',
    duplicate: 'تكرار',
    move: 'نقل',
    copy: 'نسخ',
    paste: 'لصق',
    cut: 'قص',
    merge: 'دمج',
    split: 'تقسيم',
    sort: 'ترتيب',
    filter: 'تصفية',
    search: 'بحث',
    find: 'العثور على',
    replace_: 'استبدال',
    import: 'استيراد',
    export: 'تصدير',
    backup: 'نسخ احتياطي',
    restore: 'استعادة',
    sync: 'مزامنة',
    refresh: 'تحديث',
    reload: 'إعادة تحميل',
  },
  status: {
    active: 'نشط',
    inactive: 'غير نشط',
    pending: 'في الانتظار',
    approved: 'موافق عليه',
    rejected: 'مرفوض',
    draft: 'مسودة',
    published: 'منشور',
    archived: 'مؤرشف',
    deleted: 'محذوف',
    completed: 'مكتمل',
    inProgress: 'قيد التنفيذ',
    paused: 'متوقف مؤقتاً',
    cancelled: 'ملغي',
    failed: 'فشل',
    success: 'نجح',
    error: 'خطأ',
    warning: 'تحذير',
    info: 'معلومات',
    online: 'متصل',
    offline: 'غير متصل',
    available: 'متاح',
    unavailable: 'غير متاح',
    busy: 'مشغول',
    free: 'متاح',
  },
  accessibility: {
    skipToContent: 'تخطي إلى المحتوى الرئيسي',
    skipToNavigation: 'تخطي إلى التنقل',
    openMenu: 'فتح القائمة',
    closeMenu: 'إغلاق القائمة',
    openDialog: 'فتح مربع الحوار',
    closeDialog: 'إغلاق مربع الحوار',
    previousPage: 'الصفحة السابقة',
    nextPage: 'الصفحة التالية',
    currentPage: 'الصفحة الحالية',
    sortAscending: 'ترتيب تصاعدي',
    sortDescending: 'ترتيب تنازلي',
    expand: 'توسيع',
    collapse: 'طي',
    showMore: 'عرض المزيد',
    showLess: 'عرض أقل',
    loading: 'جاري تحميل المحتوى',
    error: 'حدث خطأ',
    required: 'حقل مطلوب',
    invalid: 'قيمة غير صحيحة',
    selected: 'محدد',
    unselected: 'غير محدد',
    checked: 'مُحدد',
    unchecked: 'غير مُحدد',
    pressEnter: 'اضغط Enter',
    pressSpace: 'اضغط المسافة',
    pressEscape: 'اضغط Escape',
    useArrowKeys: 'استخدم أسهم الاتجاه',
  },
  numbers: {
    zero: 'صفر',
    one: 'واحد',
    two: 'اثنان',
    three: 'ثلاثة',
    four: 'أربعة',
    five: 'خمسة',
    six: 'ستة',
    seven: 'سبعة',
    eight: 'ثمانية',
    nine: 'تسعة',
    ten: 'عشرة',
    hundred: 'مائة',
    thousand: 'ألف',
    million: 'مليون',
    billion: 'مليار',
  },
};

// RTL Configuration presets
export const RTL_CONFIGURATIONS: Record<RTLLanguage, RTLConfiguration> = {
  'ar': {
    language: 'ar',
    direction: 'rtl',
    textAlign: 'start',
    margins: { start: 'margin-right', end: 'margin-left' },
    borders: { start: 'border-right', end: 'border-left' },
    positioning: { float: 'right', clear: 'right' },
  },
  'ar-SA': {
    language: 'ar-SA',
    direction: 'rtl',
    textAlign: 'start',
    margins: { start: 'margin-right', end: 'margin-left' },
    borders: { start: 'border-right', end: 'border-left' },
    positioning: { float: 'right', clear: 'right' },
  },
  'ar-EG': {
    language: 'ar-EG',
    direction: 'rtl',
    textAlign: 'start',
    margins: { start: 'margin-right', end: 'margin-left' },
    borders: { start: 'border-right', end: 'border-left' },
    positioning: { float: 'right', clear: 'right' },
  },
  'ar-AE': {
    language: 'ar-AE',
    direction: 'rtl',
    textAlign: 'start',
    margins: { start: 'margin-right', end: 'margin-left' },
    borders: { start: 'border-right', end: 'border-left' },
    positioning: { float: 'right', clear: 'right' },
  },
  'ar-NO': {
    language: 'ar-NO',
    direction: 'rtl',
    textAlign: 'start',
    margins: { start: 'margin-right', end: 'margin-left' },
    borders: { start: 'border-right', end: 'border-left' },
    positioning: { float: 'right', clear: 'right' },
  },
  'he': {
    language: 'he',
    direction: 'rtl',
    textAlign: 'start',
    margins: { start: 'margin-right', end: 'margin-left' },
    borders: { start: 'border-right', end: 'border-left' },
    positioning: { float: 'right', clear: 'right' },
  },
  'fa': {
    language: 'fa',
    direction: 'rtl',
    textAlign: 'start',
    margins: { start: 'margin-right', end: 'margin-left' },
    borders: { start: 'border-right', end: 'border-left' },
    positioning: { float: 'right', clear: 'right' },
  },
  'ur': {
    language: 'ur',
    direction: 'rtl',
    textAlign: 'start',
    margins: { start: 'margin-right', end: 'margin-left' },
    borders: { start: 'border-right', end: 'border-left' },
    positioning: { float: 'right', clear: 'right' },
  },
};

export class RTLSupportService {
  /**
   * Check if language is RTL
   */
  static isRTL(language: string): boolean {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'sd', 'ku', 'dv'];
    return rtlLanguages.some(lang => language.startsWith(lang));
  }

  /**
   * Get RTL configuration for language
   */
  static getRTLConfiguration(language: RTLLanguage): RTLConfiguration {
    return RTL_CONFIGURATIONS[language] || RTL_CONFIGURATIONS['ar'];
  }

  /**
   * Generate RTL CSS classes
   */
  static generateRTLCSS(): string {
    return `
/**
 * RTL (Right-to-Left) Support CSS
 * For Arabic and other RTL languages in Norwegian applications
 */

/* Base RTL styles */
[dir="rtl"] {
  text-align: right;
  direction: rtl;
}

[dir="ltr"] {
  text-align: left;
  direction: ltr;
}

/* RTL-aware positioning utilities */
.rtl-float-start {
  float: left;
}

[dir="rtl"] .rtl-float-start {
  float: right;
}

.rtl-float-end {
  float: right;
}

[dir="rtl"] .rtl-float-end {
  float: left;
}

/* RTL-aware margin utilities */
.rtl-ml-auto {
  margin-left: auto;
}

[dir="rtl"] .rtl-ml-auto {
  margin-left: unset;
  margin-right: auto;
}

.rtl-mr-auto {
  margin-right: auto;
}

[dir="rtl"] .rtl-mr-auto {
  margin-right: unset;
  margin-left: auto;
}

/* RTL-aware padding utilities */
.rtl-pl-4 {
  padding-left: 1rem;
}

[dir="rtl"] .rtl-pl-4 {
  padding-left: unset;
  padding-right: 1rem;
}

.rtl-pr-4 {
  padding-right: 1rem;
}

[dir="rtl"] .rtl-pr-4 {
  padding-right: unset;
  padding-left: 1rem;
}

/* RTL-aware border utilities */
.rtl-border-l {
  border-left: 1px solid currentColor;
}

[dir="rtl"] .rtl-border-l {
  border-left: none;
  border-right: 1px solid currentColor;
}

.rtl-border-r {
  border-right: 1px solid currentColor;
}

[dir="rtl"] .rtl-border-r {
  border-right: none;
  border-left: 1px solid currentColor;
}

/* RTL-aware text alignment */
.rtl-text-left {
  text-align: left;
}

[dir="rtl"] .rtl-text-left {
  text-align: right;
}

.rtl-text-right {
  text-align: right;
}

[dir="rtl"] .rtl-text-right {
  text-align: left;
}

.rtl-text-start {
  text-align: left;
}

[dir="rtl"] .rtl-text-start {
  text-align: right;
}

.rtl-text-end {
  text-align: right;
}

[dir="rtl"] .rtl-text-end {
  text-align: left;
}

/* RTL-aware flex utilities */
.rtl-flex-row-reverse {
  flex-direction: row-reverse;
}

[dir="rtl"] .rtl-flex-row-reverse {
  flex-direction: row;
}

[dir="rtl"] .flex-row {
  flex-direction: row-reverse;
}

/* RTL-aware transforms */
.rtl-transform-x {
  transform: translateX(0);
}

[dir="rtl"] .rtl-transform-x {
  transform: translateX(0) scaleX(-1);
}

/* Form controls RTL support */
[dir="rtl"] input[type="text"],
[dir="rtl"] input[type="email"],
[dir="rtl"] input[type="password"],
[dir="rtl"] input[type="search"],
[dir="rtl"] input[type="tel"],
[dir="rtl"] input[type="url"],
[dir="rtl"] textarea,
[dir="rtl"] select {
  text-align: right;
}

/* Button RTL support */
[dir="rtl"] .btn-with-icon {
  flex-direction: row-reverse;
}

[dir="rtl"] .btn-icon-left {
  margin-left: 0.5rem;
  margin-right: 0;
}

[dir="rtl"] .btn-icon-right {
  margin-right: 0.5rem;
  margin-left: 0;
}

/* Navigation RTL support */
[dir="rtl"] .breadcrumb-separator::before {
  content: "\\2039"; /* Left-pointing angle quotation mark */
}

[dir="ltr"] .breadcrumb-separator::before {
  content: "\\203A"; /* Right-pointing angle quotation mark */
}

/* Table RTL support */
[dir="rtl"] table {
  direction: rtl;
}

[dir="rtl"] th,
[dir="rtl"] td {
  text-align: right;
}

[dir="rtl"] th:first-child,
[dir="rtl"] td:first-child {
  border-left: none;
  border-right: 1px solid currentColor;
}

[dir="rtl"] th:last-child,
[dir="rtl"] td:last-child {
  border-right: none;
  border-left: 1px solid currentColor;
}

/* Modal/Dialog RTL support */
[dir="rtl"] .modal-close {
  left: 1rem;
  right: auto;
}

[dir="ltr"] .modal-close {
  right: 1rem;
  left: auto;
}

/* Dropdown RTL support */
[dir="rtl"] .dropdown-menu {
  left: auto;
  right: 0;
}

[dir="rtl"] .dropdown-arrow::before {
  transform: rotate(135deg);
}

[dir="ltr"] .dropdown-arrow::before {
  transform: rotate(-45deg);
}

/* Animation adjustments for RTL */
[dir="rtl"] .slide-in-left {
  animation: slideInRight 0.3s ease-out;
}

[dir="rtl"] .slide-in-right {
  animation: slideInLeft 0.3s ease-out;
}

/* Keyframes for RTL animations */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Typography adjustments for Arabic */
[dir="rtl"] {
  font-family: 'Noto Sans Arabic', 'Arial Unicode MS', sans-serif;
  line-height: 1.6; /* Arabic text often needs more line height */
}

/* Number handling for RTL languages */
[dir="rtl"] .ltr-numbers {
  direction: ltr;
  unicode-bidi: embed;
}

/* Status indicators RTL support */
[dir="rtl"] .status-indicator {
  margin-left: 0.5rem;
  margin-right: 0;
}

[dir="ltr"] .status-indicator {
  margin-right: 0.5rem;
  margin-left: 0;
}

/* Focus states for RTL */
[dir="rtl"] *:focus {
  outline-offset: -2px; /* Adjust focus outline for RTL text */
}

/* Print styles for RTL */
@media print {
  [dir="rtl"] {
    direction: rtl;
    text-align: right;
  }
  
  [dir="rtl"] .page-break {
    page-break-after: always;
    page-break-inside: avoid;
  }
}
`;
  }

  /**
   * Generate RTL-aware Tailwind CSS configuration
   */
  static generateRTLTailwindConfig(): string {
    return `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'arabic': ['Noto Sans Arabic', 'Arial Unicode MS', 'sans-serif'],
        'hebrew': ['Noto Sans Hebrew', 'Arial Unicode MS', 'sans-serif'],
        'persian': ['Noto Sans Persian', 'Arial Unicode MS', 'sans-serif'],
        'urdu': ['Noto Sans Urdu', 'Arial Unicode MS', 'sans-serif'],
      },
      spacing: {
        'rtl-safe': '0.25rem', // Safe spacing for RTL layouts
      },
      animation: {
        'slide-in-rtl': 'slideInRTL 0.3s ease-out',
        'slide-out-rtl': 'slideOutRTL 0.3s ease-in',
      },
      keyframes: {
        slideInRTL: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutRTL: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // RTL plugin
    function({ addUtilities, addComponents, theme }) {
      const rtlUtilities = {
        '.rtl-flip': {
          transform: 'scaleX(-1)',
        },
        '.rtl-reset': {
          transform: 'scaleX(1)',
        },
        '.rtl-text-start': {
          'text-align': 'left',
          '[dir="rtl"] &': {
            'text-align': 'right',
          },
        },
        '.rtl-text-end': {
          'text-align': 'right',
          '[dir="rtl"] &': {
            'text-align': 'left',
          },
        },
        '.rtl-mr-auto': {
          'margin-right': 'auto',
          '[dir="rtl"] &': {
            'margin-right': '0',
            'margin-left': 'auto',
          },
        },
        '.rtl-ml-auto': {
          'margin-left': 'auto',
          '[dir="rtl"] &': {
            'margin-left': '0',
            'margin-right': 'auto',
          },
        },
      };

      const rtlComponents = {
        '.rtl-form-input': {
          'text-align': 'left',
          '[dir="rtl"] &': {
            'text-align': 'right',
          },
        },
        '.rtl-dropdown': {
          'left': '0',
          'right': 'auto',
          '[dir="rtl"] &': {
            'left': 'auto',
            'right': '0',
          },
        },
      };

      addUtilities(rtlUtilities);
      addComponents(rtlComponents);
    },
  ],
  variants: {
    extend: {
      margin: ['rtl'],
      padding: ['rtl'],
      textAlign: ['rtl'],
      float: ['rtl'],
      borderWidth: ['rtl'],
      borderRadius: ['rtl'],
    },
  },
};
`;
  }

  /**
   * Generate RTL-aware React component template
   */
  static generateRTLProviderTemplate(): string {
    return `
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { RTLLanguage, TextDirection, RTLTranslations } from '../types/norwegian-compliance';
import { RTLSupportService } from '../compliance/rtl-support';

interface RTLContextValue {
  readonly language: RTLLanguage | string;
  readonly direction: TextDirection;
  readonly isRTL: boolean;
  readonly translations?: RTLTranslations;
  readonly setLanguage: (language: RTLLanguage | string) => void;
  readonly setDirection: (direction: TextDirection) => void;
  readonly t: (key: string, params?: Record<string, string | number>) => string;
}

const RTLContext = createContext<RTLContextValue | undefined>(undefined);

interface RTLProviderProps {
  readonly children: React.ReactNode;
  readonly defaultLanguage?: RTLLanguage | string;
  readonly defaultDirection?: TextDirection;
  readonly translations?: RTLTranslations;
}

export const RTLProvider = ({ 
  children, 
  defaultLanguage = 'nb-NO',
  defaultDirection = 'auto',
  translations 
}: RTLProviderProps): JSX.Element => {
  const [language, setLanguageState] = useState<RTLLanguage | string>(defaultLanguage);
  const [direction, setDirectionState] = useState<TextDirection>(() => {
    if (defaultDirection === 'auto') {
      return RTLSupportService.isRTL(defaultLanguage) ? 'rtl' : 'ltr';
    }
    return defaultDirection;
  });

  const isRTL = direction === 'rtl';

  const setLanguage = (newLanguage: RTLLanguage | string) => {
    setLanguageState(newLanguage);
    
    // Auto-detect direction based on language
    const newDirection = RTLSupportService.isRTL(newLanguage) ? 'rtl' : 'ltr';
    setDirectionState(newDirection);
  };

  const setDirection = (newDirection: TextDirection) => {
    if (newDirection === 'auto') {
      const autoDirection = RTLSupportService.isRTL(language) ? 'rtl' : 'ltr';
      setDirectionState(autoDirection);
    } else {
      setDirectionState(newDirection);
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    if (!translations) return key;
    
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    if (typeof value !== 'string') {
      return key; // Return key if translation not found
    }
    
    if (params) {
      return Object.entries(params).reduce(
        (text, [paramKey, paramValue]) => 
          text.replace(new RegExp(\`\\\\{\${paramKey}\\\\}\`, 'g'), String(paramValue)),
        value
      );
    }
    
    return value;
  };

  // Update document direction and language
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = direction;
      document.documentElement.lang = language;
      
      // Add RTL class to body for styling
      if (isRTL) {
        document.body.classList.add('rtl');
        document.body.classList.remove('ltr');
      } else {
        document.body.classList.add('ltr');
        document.body.classList.remove('rtl');
      }
    }
  }, [direction, language, isRTL]);

  const contextValue: RTLContextValue = {
    language,
    direction,
    isRTL,
    translations,
    setLanguage,
    setDirection,
    t,
  };

  return (
    <RTLContext.Provider value={contextValue}>
      <div dir={direction} className={isRTL ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </RTLContext.Provider>
  );
};

export const useRTL = (): RTLContextValue => {
  const context = useContext(RTLContext);
  if (!context) {
    throw new Error('useRTL must be used within an RTLProvider');
  }
  return context;
};

// Utility hooks
export const useRTLDirection = () => {
  const { direction, isRTL, setDirection } = useRTL();
  return { direction, isRTL, setDirection };
};

export const useRTLTranslation = () => {
  const { t, language, translations } = useRTL();
  return { t, language, translations };
};

export default RTLProvider;
`;
  }

  /**
   * Generate RTL-aware utility functions
   */
  static generateRTLUtils(): string {
    return `
import type { TextDirection, RTLLanguage } from '../types/norwegian-compliance';

/**
 * RTL Utility Functions
 */

export const rtlUtils = {
  /**
   * Get the opposite direction
   */
  oppositeDirection(direction: TextDirection): TextDirection {
    return direction === 'rtl' ? 'ltr' : 'rtl';
  },

  /**
   * Get margin classes based on direction
   */
  getMarginStart(direction: TextDirection, size: string): string {
    return direction === 'rtl' ? \`mr-\${size}\` : \`ml-\${size}\`;
  },

  getMarginEnd(direction: TextDirection, size: string): string {
    return direction === 'rtl' ? \`ml-\${size}\` : \`mr-\${size}\`;
  },

  /**
   * Get padding classes based on direction
   */
  getPaddingStart(direction: TextDirection, size: string): string {
    return direction === 'rtl' ? \`pr-\${size}\` : \`pl-\${size}\`;
  },

  getPaddingEnd(direction: TextDirection, size: string): string {
    return direction === 'rtl' ? \`pl-\${size}\` : \`pr-\${size}\`;
  },

  /**
   * Get border classes based on direction
   */
  getBorderStart(direction: TextDirection): string {
    return direction === 'rtl' ? 'border-r' : 'border-l';
  },

  getBorderEnd(direction: TextDirection): string {
    return direction === 'rtl' ? 'border-l' : 'border-r';
  },

  /**
   * Get text alignment based on direction
   */
  getTextAlign(direction: TextDirection, align: 'start' | 'end' | 'center'): string {
    if (align === 'center') return 'text-center';
    if (align === 'start') return direction === 'rtl' ? 'text-right' : 'text-left';
    if (align === 'end') return direction === 'rtl' ? 'text-left' : 'text-right';
    return 'text-left';
  },

  /**
   * Get float classes based on direction
   */
  getFloatStart(direction: TextDirection): string {
    return direction === 'rtl' ? 'float-right' : 'float-left';
  },

  getFloatEnd(direction: TextDirection): string {
    return direction === 'rtl' ? 'float-left' : 'float-right';
  },

  /**
   * Get transform for flipping elements in RTL
   */
  getFlipTransform(direction: TextDirection): string {
    return direction === 'rtl' ? 'scale-x-[-1]' : '';
  },

  /**
   * Combine multiple RTL-aware classes
   */
  combineRTLClasses(direction: TextDirection, classes: Record<string, string>): string {
    return Object.entries(classes)
      .map(([key, value]) => {
        switch (key) {
          case 'marginStart':
            return this.getMarginStart(direction, value);
          case 'marginEnd':
            return this.getMarginEnd(direction, value);
          case 'paddingStart':
            return this.getPaddingStart(direction, value);
          case 'paddingEnd':
            return this.getPaddingEnd(direction, value);
          case 'borderStart':
            return value ? this.getBorderStart(direction) : '';
          case 'borderEnd':
            return value ? this.getBorderEnd(direction) : '';
          case 'textAlign':
            return this.getTextAlign(direction, value as 'start' | 'end' | 'center');
          case 'float':
            return value === 'start' ? this.getFloatStart(direction) : this.getFloatEnd(direction);
          case 'flip':
            return value ? this.getFlipTransform(direction) : '';
          default:
            return value;
        }
      })
      .filter(Boolean)
      .join(' ');
  },

  /**
   * Check if language requires special font handling
   */
  requiresSpecialFont(language: string): boolean {
    const specialFontLanguages = ['ar', 'he', 'fa', 'ur', 'sd', 'ku', 'dv'];
    return specialFontLanguages.some(lang => language.startsWith(lang));
  },

  /**
   * Get appropriate font family for language
   */
  getFontFamily(language: string): string {
    if (language.startsWith('ar')) return 'font-arabic';
    if (language.startsWith('he')) return 'font-hebrew';
    if (language.startsWith('fa')) return 'font-persian';
    if (language.startsWith('ur')) return 'font-urdu';
    return 'font-sans';
  },

  /**
   * Format numbers for RTL languages (some prefer LTR numbers)
   */
  formatNumber(number: number, language: string, locale?: string): string {
    // Arabic in Norway might prefer Western numerals
    if (language === 'ar-NO') {
      return new Intl.NumberFormat('en-US').format(number);
    }
    
    return new Intl.NumberFormat(locale || language).format(number);
  },

  /**
   * Get safe CSS properties for RTL
   */
  getSafeStyles(direction: TextDirection): React.CSSProperties {
    return {
      direction,
      textAlign: direction === 'rtl' ? 'right' : 'left',
      unicodeBidi: 'embed',
    };
  },
};

export default rtlUtils;
`;
  }

  /**
   * Get Arabic translations
   */
  static getArabicTranslations(): RTLTranslations {
    return ARABIC_TRANSLATIONS;
  }

  /**
   * Generate RTL-aware component with proper styling
   */
  static generateRTLAwareComponent(componentName: string, direction: TextDirection = 'rtl'): string {
    return `
import React from 'react';
import { useRTL, rtlUtils } from '../compliance/rtl-support';
import { cn } from '@xala/ui-system/utils';

interface ${componentName}Props {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly variant?: 'default' | 'outlined' | 'filled';
  readonly size?: 'small' | 'medium' | 'large';
}

export const ${componentName} = ({
  children,
  className,
  variant = 'default',
  size = 'medium',
}: ${componentName}Props): JSX.Element => {
  const { direction, isRTL, t } = useRTL();

  const baseClasses = rtlUtils.combineRTLClasses(direction, {
    paddingStart: size === 'small' ? '3' : size === 'large' ? '6' : '4',
    paddingEnd: size === 'small' ? '3' : size === 'large' ? '6' : '4',
    textAlign: 'start',
    marginStart: '0',
    marginEnd: 'auto',
  });

  return (
    <div
      dir={direction}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        
        // RTL-aware styles
        baseClasses,
        
        // Variant styles
        variant === 'outlined' && 'border-2 border-current',
        variant === 'filled' && 'bg-gray-100',
        
        // Size styles
        size === 'small' && 'text-sm h-8',
        size === 'medium' && 'text-base h-12',
        size === 'large' && 'text-lg h-14',
        
        // RTL-specific adjustments
        isRTL && 'font-arabic',
        
        className
      )}
      style={rtlUtils.getSafeStyles(direction)}
    >
      {children}
    </div>
  );
};

export default ${componentName};
`;
  }
}

export default RTLSupportService;