/**
 * Date Formatting Utilities for Multiple Locales
 * Provides culture-specific date formatting for Norwegian, French, Arabic, and English
 */

/**
 * Format a date according to locale-specific conventions
 * @param date - Date to format
 * @param locale - Locale code (nb, fr, ar, en)
 * @param options - Optional formatting options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date,
  locale: string,
  options?: {
    includeTime?: boolean;
    format?: 'short' | 'medium' | 'long' | 'full';
    includeWeekday?: boolean;
  }
): string {
  const { includeTime = false, format = 'medium', includeWeekday = false } = options || {};
  
  // Norwegian date format (dd.mm.yyyy)
  if (locale === 'nb' || locale === 'no') {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    let dateStr = `${day}.${month}.${year}`;
    
    if (includeWeekday) {
      const weekdays = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
      dateStr = `${weekdays[date.getDay()]} ${dateStr}`;
    }
    
    if (includeTime) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      dateStr += ` kl. ${hours}:${minutes}`;
    }
    
    return dateStr;
  }
  
  // French date format (dd/mm/yyyy)
  if (locale === 'fr') {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    let dateStr = `${day}/${month}/${year}`;
    
    if (includeWeekday) {
      const weekdays = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
      dateStr = `${weekdays[date.getDay()]} ${dateStr}`;
    }
    
    if (includeTime) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      dateStr += ` à ${hours}h${minutes}`;
    }
    
    return dateStr;
  }
  
  // Arabic date format with optional Hijri calendar
  if (locale === 'ar') {
    // Use native Intl.DateTimeFormat for Arabic
    const formatter = new Intl.DateTimeFormat('ar', {
      year: 'numeric',
      month: format === 'long' ? 'long' : '2-digit',
      day: '2-digit',
      weekday: includeWeekday ? 'long' : undefined,
      hour: includeTime ? '2-digit' : undefined,
      minute: includeTime ? '2-digit' : undefined,
      hour12: true,
    });
    
    return formatter.format(date);
  }
  
  // Default English format (mm/dd/yyyy)
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  
  let dateStr = `${month}/${day}/${year}`;
  
  if (includeWeekday) {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    dateStr = `${weekdays[date.getDay()]} ${dateStr}`;
  }
  
  if (includeTime) {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    dateStr += ` ${displayHours}:${minutes} ${ampm}`;
  }
  
  return dateStr;
}

/**
 * Format a date in relative terms (e.g., "2 days ago", "in 3 hours")
 * @param date - Date to format
 * @param locale - Locale code
 * @returns Relative date string
 */
export function formatRelativeDate(date: Date, locale: string): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const absSeconds = Math.abs(diffInSeconds);
  
  const units = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };
  
  // Locale-specific relative time formats
  const translations: Record<string, any> = {
    nb: {
      just_now: 'akkurat nå',
      seconds_ago: 'sekunder siden',
      minute_ago: 'minutt siden',
      minutes_ago: 'minutter siden',
      hour_ago: 'time siden',
      hours_ago: 'timer siden',
      day_ago: 'dag siden',
      days_ago: 'dager siden',
      week_ago: 'uke siden',
      weeks_ago: 'uker siden',
      month_ago: 'måned siden',
      months_ago: 'måneder siden',
      year_ago: 'år siden',
      years_ago: 'år siden',
      in_seconds: 'om sekunder',
      in_minute: 'om minutt',
      in_minutes: 'om minutter',
      in_hour: 'om time',
      in_hours: 'om timer',
      in_day: 'om dag',
      in_days: 'om dager',
      in_week: 'om uke',
      in_weeks: 'om uker',
      in_month: 'om måned',
      in_months: 'om måneder',
      in_year: 'om år',
      in_years: 'om år',
    },
    fr: {
      just_now: 'à l\'instant',
      seconds_ago: 'secondes',
      minute_ago: 'minute',
      minutes_ago: 'minutes',
      hour_ago: 'heure',
      hours_ago: 'heures',
      day_ago: 'jour',
      days_ago: 'jours',
      week_ago: 'semaine',
      weeks_ago: 'semaines',
      month_ago: 'mois',
      months_ago: 'mois',
      year_ago: 'an',
      years_ago: 'ans',
      prefix_ago: 'il y a',
      prefix_in: 'dans',
    },
    ar: {
      just_now: 'الآن',
      seconds_ago: 'ثانية',
      minute_ago: 'دقيقة',
      minutes_ago: 'دقائق',
      hour_ago: 'ساعة',
      hours_ago: 'ساعات',
      day_ago: 'يوم',
      days_ago: 'أيام',
      week_ago: 'أسبوع',
      weeks_ago: 'أسابيع',
      month_ago: 'شهر',
      months_ago: 'أشهر',
      year_ago: 'سنة',
      years_ago: 'سنوات',
      prefix_ago: 'منذ',
      prefix_in: 'بعد',
    },
    en: {
      just_now: 'just now',
      seconds_ago: 'seconds ago',
      minute_ago: 'minute ago',
      minutes_ago: 'minutes ago',
      hour_ago: 'hour ago',
      hours_ago: 'hours ago',
      day_ago: 'day ago',
      days_ago: 'days ago',
      week_ago: 'week ago',
      weeks_ago: 'weeks ago',
      month_ago: 'month ago',
      months_ago: 'months ago',
      year_ago: 'year ago',
      years_ago: 'years ago',
      in_seconds: 'in seconds',
      in_minute: 'in a minute',
      in_minutes: 'in minutes',
      in_hour: 'in an hour',
      in_hours: 'in hours',
      in_day: 'in a day',
      in_days: 'in days',
      in_week: 'in a week',
      in_weeks: 'in weeks',
      in_month: 'in a month',
      in_months: 'in months',
      in_year: 'in a year',
      in_years: 'in years',
    },
  };
  
  const t = translations[locale] || translations.en;
  
  if (absSeconds < 5) {
    return t.just_now;
  }
  
  // Past dates
  if (diffInSeconds > 0) {
    for (const [unit, secondsInUnit] of Object.entries(units)) {
      const count = Math.floor(absSeconds / secondsInUnit);
      if (count >= 1) {
        if (locale === 'nb') {
          const suffix = count === 1 ? `${unit}_ago` : `${unit}s_ago`;
          return `${count} ${t[suffix]}`;
        } else if (locale === 'fr') {
          const unitKey = count === 1 ? `${unit}_ago` : `${unit}s_ago`;
          return `${t.prefix_ago} ${count} ${t[unitKey]}`;
        } else if (locale === 'ar') {
          const unitKey = count === 1 ? `${unit}_ago` : `${unit}s_ago`;
          return `${t.prefix_ago} ${count} ${t[unitKey]}`;
        } else {
          const suffix = count === 1 ? `${unit}_ago` : `${unit}s_ago`;
          return `${count} ${t[suffix]}`;
        }
      }
    }
  }
  
  // Future dates
  for (const [unit, secondsInUnit] of Object.entries(units)) {
    const count = Math.floor(absSeconds / secondsInUnit);
    if (count >= 1) {
      if (locale === 'nb') {
        const suffix = count === 1 ? `in_${unit}` : `in_${unit}s`;
        return `${t[suffix]} ${count}`;
      } else if (locale === 'fr') {
        const unitKey = count === 1 ? `${unit}_ago` : `${unit}s_ago`;
        return `${t.prefix_in} ${count} ${t[unitKey]}`;
      } else if (locale === 'ar') {
        const unitKey = count === 1 ? `${unit}_ago` : `${unit}s_ago`;
        return `${t.prefix_in} ${count} ${t[unitKey]}`;
      } else {
        const suffix = count === 1 ? `in_${unit}` : `in_${unit}s`;
        return `${count} ${t[suffix]}`;
      }
    }
  }
  
  return t.just_now;
}

/**
 * Convert Gregorian date to Hijri (Islamic) date
 * @param date - Gregorian date
 * @returns Hijri date object
 */
export function toHijriDate(date: Date): { year: number; month: number; day: number; monthName: string } {
  // Simplified Hijri conversion algorithm
  // For production use, consider using a library like hijri-converter
  
  const gregorianYear = date.getFullYear();
  const gregorianMonth = date.getMonth() + 1;
  const gregorianDay = date.getDate();
  
  // Approximate conversion (for demonstration)
  // Hijri year ≈ Gregorian year - 579
  const hijriYear = Math.floor(gregorianYear - 579 + (gregorianMonth - 3) / 12);
  
  const hijriMonths = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];
  
  // Simplified month calculation
  const hijriMonth = ((gregorianMonth + 9) % 12) + 1;
  const hijriDay = gregorianDay;
  
  return {
    year: hijriYear,
    month: hijriMonth,
    day: hijriDay,
    monthName: hijriMonths[hijriMonth - 1],
  };
}

/**
 * Format date range
 * @param startDate - Start date
 * @param endDate - End date
 * @param locale - Locale code
 * @returns Formatted date range
 */
export function formatDateRange(startDate: Date, endDate: Date, locale: string): string {
  const start = formatDate(startDate, locale);
  const end = formatDate(endDate, locale);
  
  const separators: Record<string, string> = {
    nb: ' til ',
    fr: ' au ',
    ar: ' إلى ',
    en: ' to ',
  };
  
  const separator = separators[locale] || separators.en;
  return `${start}${separator}${end}`;
}