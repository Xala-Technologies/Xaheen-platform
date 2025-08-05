/**
 * Norwegian Localization Defaults and Formatting
 * Comprehensive Norwegian locale support with cultural considerations
 * @version 1.0.0
 */

import type { 
  NorwegianLocale, 
  NorwegianLocalizationRequirements 
} from '../types/norwegian-compliance.js';

export interface NorwegianDateFormats {
  readonly short: string;       // dd.MM.yyyy
  readonly medium: string;      // dd. MMM yyyy
  readonly long: string;        // dd. MMMM yyyy
  readonly iso: string;         // yyyy-MM-dd
  readonly time: string;        // HH:mm
  readonly datetime: string;    // dd.MM.yyyy HH:mm
  readonly weekday: string;     // EEEE, dd. MMMM yyyy
}

export interface NorwegianNumberFormats {
  readonly decimal: string;     // 1 234,56
  readonly currency: string;    // 1 234,56 kr
  readonly percentage: string;  // 12,34 %
  readonly compact: string;     // 1,2K
}

export interface NorwegianCulturalSettings {
  readonly workingDays: number[];       // [1, 2, 3, 4, 5] (Monday to Friday)
  readonly firstDayOfWeek: number;     // 1 (Monday)
  readonly timeZone: string;           // Europe/Oslo
  readonly publicHolidays: string[];   // ISO dates
  readonly businessHours: {
    readonly start: string;            // 08:00
    readonly end: string;              // 16:00
  };
  readonly emergencyNumber: string;    // 113 (general), 112 (police), 110 (fire)
}

export interface NorwegianTranslations {
  readonly common: Record<string, string>;
  readonly navigation: Record<string, string>;
  readonly forms: Record<string, string>;
  readonly validation: Record<string, string>;
  readonly dates: Record<string, string>;
  readonly actions: Record<string, string>;
  readonly status: Record<string, string>;
  readonly accessibility: Record<string, string>;
}

// Norwegian Date Formats
export const NORWEGIAN_DATE_FORMATS: Record<NorwegianLocale, NorwegianDateFormats> = {
  'nb-NO': {
    short: 'dd.MM.yyyy',
    medium: 'dd. MMM yyyy',
    long: 'dd. MMMM yyyy',
    iso: 'yyyy-MM-dd',
    time: 'HH:mm',
    datetime: 'dd.MM.yyyy HH:mm',
    weekday: 'EEEE, dd. MMMM yyyy',
  },
  'nn-NO': {
    short: 'dd.MM.yyyy',
    medium: 'dd. MMM yyyy',
    long: 'dd. MMMM yyyy',
    iso: 'yyyy-MM-dd',
    time: 'HH:mm',
    datetime: 'dd.MM.yyyy HH:mm',
    weekday: 'EEEE, dd. MMMM yyyy',
  },
  'se-NO': {
    short: 'dd.MM.yyyy',
    medium: 'dd. MMM yyyy',
    long: 'dd. MMMM yyyy',
    iso: 'yyyy-MM-dd',
    time: 'HH:mm',
    datetime: 'dd.MM.yyyy HH:mm',
    weekday: 'EEEE, dd. MMMM yyyy',
  },
  'en-NO': {
    short: 'dd/MM/yyyy',
    medium: 'dd MMM yyyy',
    long: 'dd MMMM yyyy',
    iso: 'yyyy-MM-dd',
    time: 'HH:mm',
    datetime: 'dd/MM/yyyy HH:mm',
    weekday: 'EEEE, dd MMMM yyyy',
  },
};

// Norwegian Number Formats
export const NORWEGIAN_NUMBER_FORMATS: Record<NorwegianLocale, NorwegianNumberFormats> = {
  'nb-NO': {
    decimal: '1 234,56',
    currency: '1 234,56 kr',
    percentage: '12,34 %',
    compact: '1,2K',
  },
  'nn-NO': {
    decimal: '1 234,56',
    currency: '1 234,56 kr',
    percentage: '12,34 %',
    compact: '1,2K',
  },
  'se-NO': {
    decimal: '1 234,56',
    currency: '1 234,56 kr',
    percentage: '12,34 %',
    compact: '1,2K',
  },
  'en-NO': {
    decimal: '1,234.56',
    currency: 'NOK 1,234.56',
    percentage: '12.34%',
    compact: '1.2K',
  },
};

// Norwegian Cultural Settings
export const NORWEGIAN_CULTURAL_SETTINGS: NorwegianCulturalSettings = {
  workingDays: [1, 2, 3, 4, 5], // Monday to Friday
  firstDayOfWeek: 1, // Monday
  timeZone: 'Europe/Oslo',
  publicHolidays: [
    // 2024 Norwegian public holidays
    '2024-01-01', // New Year's Day
    '2024-03-28', // Maundy Thursday
    '2024-03-29', // Good Friday
    '2024-04-01', // Easter Monday
    '2024-05-01', // Labour Day
    '2024-05-09', // Ascension Day
    '2024-05-17', // Constitution Day
    '2024-05-20', // Whit Monday
    '2024-12-25', // Christmas Day
    '2024-12-26', // Boxing Day
  ],
  businessHours: {
    start: '08:00',
    end: '16:00',
  },
  emergencyNumber: '113', // General emergency (or 112 for police, 110 for fire)
};

// Norwegian Translations (Bokmål)
export const NORWEGIAN_TRANSLATIONS_NB: NorwegianTranslations = {
  common: {
    yes: 'Ja',
    no: 'Nei',
    ok: 'OK',
    cancel: 'Avbryt',
    save: 'Lagre',
    delete: 'Slett',
    edit: 'Rediger',
    view: 'Vis',
    close: 'Lukk',
    open: 'Åpne',
    loading: 'Laster...',
    error: 'Feil',
    success: 'Vellykket',
    warning: 'Advarsel',
    info: 'Informasjon',
    help: 'Hjelp',
    search: 'Søk',
    filter: 'Filtrer',
    sort: 'Sorter',
    clear: 'Tøm',
    reset: 'Tilbakestill',
    submit: 'Send inn',
    upload: 'Last opp',
    download: 'Last ned',
    print: 'Skriv ut',
    share: 'Del',
    copy: 'Kopier',
    paste: 'Lim inn',
    cut: 'Klipp ut',
    undo: 'Angre',
    redo: 'Gjør om',
    select: 'Velg',
    deselect: 'Avmerk',
    selectAll: 'Merk alt',
    deselectAll: 'Avmerk alt',
  },
  navigation: {
    home: 'Hjem',
    back: 'Tilbake',
    forward: 'Fremover',
    next: 'Neste',
    previous: 'Forrige',
    first: 'Første',
    last: 'Siste',
    menu: 'Meny',
    navigation: 'Navigasjon',
    breadcrumb: 'Brødsmuler',
    pagination: 'Paginering',
    page: 'Side',
    of: 'av',
    goTo: 'Gå til',
    skip: 'Hopp til',
    skipToContent: 'Hopp til innhold',
    skipToNavigation: 'Hopp til navigasjon',
  },
  forms: {
    required: 'Påkrevd',
    optional: 'Valgfri',
    placeholder: 'Skriv her...',
    name: 'Navn',
    firstName: 'Fornavn',
    lastName: 'Etternavn',
    email: 'E-post',
    phone: 'Telefon',
    address: 'Adresse',
    postalCode: 'Postnummer',
    city: 'By',
    country: 'Land',
    date: 'Dato',
    time: 'Tid',
    dateTime: 'Dato og tid',
    birthDate: 'Fødselsdato',
    password: 'Passord',
    confirmPassword: 'Bekreft passord',
    username: 'Brukernavn',
    message: 'Melding',
    comment: 'Kommentar',
    description: 'Beskrivelse',
    title: 'Tittel',
    category: 'Kategori',
    type: 'Type',
    status: 'Status',
    active: 'Aktiv',
    inactive: 'Inaktiv',
    enabled: 'Aktivert',
    disabled: 'Deaktivert',
  },
  validation: {
    required: 'Dette feltet er påkrevd',
    email: 'Ugyldig e-postadresse',
    phone: 'Ugyldig telefonnummer',
    postalCode: 'Ugyldig postnummer',
    minLength: 'Minimum {0} tegn',
    maxLength: 'Maksimum {0} tegn',
    min: 'Minimum verdi er {0}',
    max: 'Maksimum verdi er {0}',
    pattern: 'Ugyldig format',
    date: 'Ugyldig dato',
    dateRange: 'Dato må være mellom {0} og {1}',
    time: 'Ugyldig tid',
    url: 'Ugyldig URL',
    number: 'Må være et tall',
    integer: 'Må være et heltall',
    decimal: 'Må være et desimaltall',
    positive: 'Må være et positivt tall',
    negative: 'Må være et negativt tall',
    passwordMatch: 'Passordene stemmer ikke overens',
    unique: 'Denne verdien er allerede i bruk',
    file: 'Ugyldig fil',
    fileSize: 'Filen er for stor (maksimum {0})',
    fileType: 'Ugyldig filtype',
  },
  dates: {
    today: 'I dag',
    yesterday: 'I går',
    tomorrow: 'I morgen',
    thisWeek: 'Denne uken',
    nextWeek: 'Neste uke',
    lastWeek: 'Forrige uke',
    thisMonth: 'Denne måneden',
    nextMonth: 'Neste måned',
    lastMonth: 'Forrige måned',
    thisYear: 'I år',
    nextYear: 'Neste år',
    lastYear: 'I fjor',
    now: 'Nå',
    selectDate: 'Velg dato',
    selectTime: 'Velg tid',
    selectDateTime: 'Velg dato og tid',
    dateFormat: 'Datoformat: dd.mm.åååå',
    timeFormat: 'Tidsformat: tt:mm',
    invalidDate: 'Ugyldig dato',
    invalidTime: 'Ugyldig tid',
    monday: 'Mandag',
    tuesday: 'Tirsdag',
    wednesday: 'Onsdag',
    thursday: 'Torsdag',
    friday: 'Fredag',
    saturday: 'Lørdag',
    sunday: 'Søndag',
    january: 'Januar',
    february: 'Februar',
    march: 'Mars',
    april: 'April',
    may: 'Mai',
    june: 'Juni',
    july: 'Juli',
    august: 'August',
    september: 'September',
    october: 'Oktober',
    november: 'November',
    december: 'Desember',
  },
  actions: {
    create: 'Opprett',
    read: 'Les',
    update: 'Oppdater',
    delete: 'Slett',
    add: 'Legg til',
    remove: 'Fjern',
    insert: 'Sett inn',
    append: 'Legg til slutt',
    prepend: 'Legg til først',
    replace: 'Erstatt',
    duplicate: 'Dupliser',
    move: 'Flytt',
    copy: 'Kopier',
    paste: 'Lim inn',
    cut: 'Klipp ut',
    merge: 'Slå sammen',
    split: 'Del opp',
    sort: 'Sorter',
    filter: 'Filtrer',
    search: 'Søk',
    find: 'Finn',
    replace_: 'Erstatt',
    import: 'Importer',
    export: 'Eksporter',
    backup: 'Sikkerhetskopier',
    restore: 'Gjenopprett',
    sync: 'Synkroniser',
    refresh: 'Oppdater',
    reload: 'Last på nytt',
  },
  status: {
    active: 'Aktiv',
    inactive: 'Inaktiv',
    pending: 'Venter',
    approved: 'Godkjent',
    rejected: 'Avvist',
    draft: 'Utkast',
    published: 'Publisert',
    archived: 'Arkivert',
    deleted: 'Slettet',
    completed: 'Fullført',
    inProgress: 'Pågår',
    paused: 'Pauset',
    cancelled: 'Avbrutt',
    failed: 'Mislyktes',
    success: 'Vellykket',
    error: 'Feil',
    warning: 'Advarsel',
    info: 'Informasjon',
    online: 'Tilkoblet',
    offline: 'Frakoblet',
    available: 'Tilgjengelig',
    unavailable: 'Utilgjengelig',
    busy: 'Opptatt',
    free: 'Ledig',
  },
  accessibility: {
    skipToContent: 'Hopp til hovedinnhold',
    skipToNavigation: 'Hopp til navigasjon',
    openMenu: 'Åpne meny',
    closeMenu: 'Lukk meny',
    openDialog: 'Åpne dialog',
    closeDialog: 'Lukk dialog',
    previousPage: 'Forrige side',
    nextPage: 'Neste side',
    currentPage: 'Gjeldende side',
    sortAscending: 'Sorter stigende',
    sortDescending: 'Sorter synkende',
    expand: 'Utvid',
    collapse: 'Kollaps',
    showMore: 'Vis mer',
    showLess: 'Vis mindre',
    loading: 'Laster innhold',
    error: 'Feil oppstod',
    required: 'Påkrevd felt',
    invalid: 'Ugyldig verdi',
    selected: 'Valgt',
    unselected: 'Ikke valgt',
    checked: 'Avmerket',
    unchecked: 'Ikke avmerket',
    pressEnter: 'Trykk Enter',
    pressSpace: 'Trykk mellomrom',
    pressEscape: 'Trykk Escape',
    useArrowKeys: 'Bruk piltaster',
  },
};

// Norwegian Translations (Nynorsk)
export const NORWEGIAN_TRANSLATIONS_NN: NorwegianTranslations = {
  common: {
    yes: 'Ja',
    no: 'Nei',
    ok: 'OK',
    cancel: 'Avbryt',
    save: 'Lagre',
    delete: 'Slett',
    edit: 'Rediger',
    view: 'Vis',
    close: 'Lukk',
    open: 'Opne',
    loading: 'Lastar...',
    error: 'Feil',
    success: 'Vellykka',
    warning: 'Åtvaring',
    info: 'Informasjon',
    help: 'Hjelp',
    search: 'Søk',
    filter: 'Filtrer',
    sort: 'Sorter',
    clear: 'Tøm',
    reset: 'Tilbakestill',
    submit: 'Send inn',
    upload: 'Last opp',
    download: 'Last ned',
    print: 'Skriv ut',
    share: 'Del',
    copy: 'Kopier',
    paste: 'Lim inn',
    cut: 'Klipp ut',
    undo: 'Angre',
    redo: 'Gjer om',
    select: 'Vel',
    deselect: 'Avmerk',
    selectAll: 'Merk alt',
    deselectAll: 'Avmerk alt',
  },
  navigation: {
    home: 'Heim',
    back: 'Tilbake',
    forward: 'Framover',
    next: 'Neste',
    previous: 'Førre',
    first: 'Første',
    last: 'Siste',
    menu: 'Meny',
    navigation: 'Navigasjon',
    breadcrumb: 'Brødsmuler',
    pagination: 'Paginering',
    page: 'Side',
    of: 'av',
    goTo: 'Gå til',
    skip: 'Hopp til',
    skipToContent: 'Hopp til innhald',
    skipToNavigation: 'Hopp til navigasjon',
  },
  forms: {
    required: 'Påkravd',
    optional: 'Valfri',
    placeholder: 'Skriv her...',
    name: 'Namn',
    firstName: 'Fornamn',
    lastName: 'Etternamn',
    email: 'E-post',
    phone: 'Telefon',
    address: 'Adresse',
    postalCode: 'Postnummer',
    city: 'By',
    country: 'Land',
    date: 'Dato',
    time: 'Tid',
    dateTime: 'Dato og tid',
    birthDate: 'Fødselsdato',
    password: 'Passord',
    confirmPassword: 'Stadfest passord',
    username: 'Brukarnamn',
    message: 'Melding',
    comment: 'Kommentar',
    description: 'Skildring',
    title: 'Tittel',
    category: 'Kategori',
    type: 'Type',
    status: 'Status',
    active: 'Aktiv',
    inactive: 'Inaktiv',
    enabled: 'Aktivert',
    disabled: 'Deaktivert',
  },
  validation: {
    required: 'Dette feltet er påkravd',
    email: 'Ugyldig e-postadresse',
    phone: 'Ugyldig telefonnummer',
    postalCode: 'Ugyldig postnummer',
    minLength: 'Minimum {0} teikn',
    maxLength: 'Maksimum {0} teikn',
    min: 'Minimum verdi er {0}',
    max: 'Maksimum verdi er {0}',
    pattern: 'Ugyldig format',
    date: 'Ugyldig dato',
    dateRange: 'Dato må vere mellom {0} og {1}',
    time: 'Ugyldig tid',
    url: 'Ugyldig URL',
    number: 'Må vere eit tal',
    integer: 'Må vere eit heiltal',
    decimal: 'Må vere eit desimaltal',
    positive: 'Må vere eit positivt tal',
    negative: 'Må vere eit negativt tal',
    passwordMatch: 'Passorda stemmer ikkje',
    unique: 'Denne verdien er allereie i bruk',
    file: 'Ugyldig fil',
    fileSize: 'Fila er for stor (maksimum {0})',
    fileType: 'Ugyldig filtype',
  },
  dates: {
    today: 'I dag',
    yesterday: 'I går',
    tomorrow: 'I morgon',
    thisWeek: 'Denne veka',
    nextWeek: 'Neste veke',
    lastWeek: 'Førre veke',
    thisMonth: 'Denne månaden',
    nextMonth: 'Neste månad',
    lastMonth: 'Førre månad',
    thisYear: 'I år',
    nextYear: 'Neste år',
    lastYear: 'I fjor',
    now: 'No',
    selectDate: 'Vel dato',
    selectTime: 'Vel tid',
    selectDateTime: 'Vel dato og tid',
    dateFormat: 'Datoformat: dd.mm.åååå',
    timeFormat: 'Tidsformat: tt:mm',
    invalidDate: 'Ugyldig dato',
    invalidTime: 'Ugyldig tid',
    monday: 'Måndag',
    tuesday: 'Tysdag',
    wednesday: 'Onsdag',
    thursday: 'Torsdag',
    friday: 'Fredag',
    saturday: 'Laurdag',
    sunday: 'Søndag',
    january: 'Januar',
    february: 'Februar',
    march: 'Mars',
    april: 'April',
    may: 'Mai',
    june: 'Juni',
    july: 'Juli',
    august: 'August',
    september: 'September',
    october: 'Oktober',
    november: 'November',
    december: 'Desember',
  },
  actions: {
    create: 'Opprett',
    read: 'Les',
    update: 'Oppdater',
    delete: 'Slett',
    add: 'Legg til',
    remove: 'Fjern',
    insert: 'Set inn',
    append: 'Legg til slutt',
    prepend: 'Legg til først',
    replace: 'Erstatt',
    duplicate: 'Dupliser',
    move: 'Flytt',
    copy: 'Kopier',
    paste: 'Lim inn',
    cut: 'Klipp ut',
    merge: 'Slå saman',
    split: 'Del opp',
    sort: 'Sorter',
    filter: 'Filtrer',
    search: 'Søk',
    find: 'Finn',
    replace_: 'Erstatt',
    import: 'Importer',
    export: 'Eksporter',
    backup: 'Sikkerheitskopier',
    restore: 'Gjenopprett',
    sync: 'Synkroniser',
    refresh: 'Oppdater',
    reload: 'Last på nytt',
  },
  status: {
    active: 'Aktiv',
    inactive: 'Inaktiv',
    pending: 'Ventar',
    approved: 'Godkjent',
    rejected: 'Avvist',
    draft: 'Utkast',
    published: 'Publisert',
    archived: 'Arkivert',
    deleted: 'Sletta',
    completed: 'Fullført',
    inProgress: 'Pågår',
    paused: 'Pausa',
    cancelled: 'Avbrote',
    failed: 'Mislukkast',
    success: 'Vellykka',
    error: 'Feil',
    warning: 'Åtvaring',
    info: 'Informasjon',
    online: 'Tilkopla',
    offline: 'Fråkopla',
    available: 'Tilgjengeleg',
    unavailable: 'Utilgjengeleg',
    busy: 'Oppteken',
    free: 'Ledig',
  },
  accessibility: {
    skipToContent: 'Hopp til hovudinnhald',
    skipToNavigation: 'Hopp til navigasjon',
    openMenu: 'Opne meny',
    closeMenu: 'Lukk meny',
    openDialog: 'Opne dialog',
    closeDialog: 'Lukk dialog',
    previousPage: 'Førre side',
    nextPage: 'Neste side',
    currentPage: 'Gjeldande side',
    sortAscending: 'Sorter stigande',
    sortDescending: 'Sorter synkande',
    expand: 'Utvid',
    collapse: 'Kollaps',
    showMore: 'Vis meir',
    showLess: 'Vis mindre',
    loading: 'Lastar innhald',
    error: 'Feil oppstod',
    required: 'Påkravd felt',
    invalid: 'Ugyldig verdi',
    selected: 'Vald',
    unselected: 'Ikkje vald',
    checked: 'Avmerka',
    unchecked: 'Ikkje avmerka',
    pressEnter: 'Trykk Enter',
    pressSpace: 'Trykk mellomrom',
    pressEscape: 'Trykk Escape',
    useArrowKeys: 'Bruk piltastar',
  },
};

export class NorwegianLocalizationService {
  /**
   * Get Norwegian date formatter
   */
  static getDateFormatter(locale: NorwegianLocale = 'nb-NO'): Intl.DateTimeFormat {
    return new Intl.DateTimeFormat(locale, {
      timeZone: NORWEGIAN_CULTURAL_SETTINGS.timeZone,
    });
  }

  /**
   * Get Norwegian number formatter
   */
  static getNumberFormatter(locale: NorwegianLocale = 'nb-NO'): Intl.NumberFormat {
    return new Intl.NumberFormat(locale);
  }

  /**
   * Get Norwegian currency formatter
   */
  static getCurrencyFormatter(locale: NorwegianLocale = 'nb-NO'): Intl.NumberFormat {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'NOK',
    });
  }

  /**
   * Format date according to Norwegian standards
   */
  static formatDate(date: Date, format: keyof NorwegianDateFormats, locale: NorwegianLocale = 'nb-NO'): string {
    const formats = NORWEGIAN_DATE_FORMATS[locale];
    const formatter = this.getDateFormatter(locale);
    
    switch (format) {
      case 'short':
        return formatter.format(date).replace(/\//g, '.');
      case 'medium':
        return new Intl.DateTimeFormat(locale, {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          timeZone: NORWEGIAN_CULTURAL_SETTINGS.timeZone,
        }).format(date);
      case 'long':
        return new Intl.DateTimeFormat(locale, {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          timeZone: NORWEGIAN_CULTURAL_SETTINGS.timeZone,
        }).format(date);
      case 'iso':
        return date.toISOString().split('T')[0] || date.toISOString();
      case 'time':
        return new Intl.DateTimeFormat(locale, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: NORWEGIAN_CULTURAL_SETTINGS.timeZone,
        }).format(date);
      case 'datetime':
        const dateStr = this.formatDate(date, 'short', locale);
        const timeStr = this.formatDate(date, 'time', locale);
        return `${dateStr} ${timeStr}`;
      case 'weekday':
        return new Intl.DateTimeFormat(locale, {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          timeZone: NORWEGIAN_CULTURAL_SETTINGS.timeZone,
        }).format(date);
      default:
        return formatter.format(date);
    }
  }

  /**
   * Format number according to Norwegian standards
   */
  static formatNumber(
    value: number, 
    type: keyof NorwegianNumberFormats, 
    locale: NorwegianLocale = 'nb-NO'
  ): string {
    switch (type) {
      case 'decimal':
        return new Intl.NumberFormat(locale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
      case 'currency':
        return this.getCurrencyFormatter(locale).format(value);
      case 'percentage':
        return new Intl.NumberFormat(locale, {
          style: 'percent',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value / 100);
      case 'compact':
        return new Intl.NumberFormat(locale, {
          notation: 'compact',
          maximumFractionDigits: 1,
        }).format(value);
      default:
        return this.getNumberFormatter(locale).format(value);
    }
  }

  /**
   * Get translations for locale
   */
  static getTranslations(locale: NorwegianLocale = 'nb-NO'): NorwegianTranslations {
    switch (locale) {
      case 'nn-NO':
        return NORWEGIAN_TRANSLATIONS_NN;
      case 'nb-NO':
      case 'se-NO':
      case 'en-NO':
      default:
        return NORWEGIAN_TRANSLATIONS_NB;
    }
  }

  /**
   * Check if date is a Norwegian public holiday
   */
  static isPublicHoliday(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0];
    return dateStr ? NORWEGIAN_CULTURAL_SETTINGS.publicHolidays.includes(dateStr) : false;
  }

  /**
   * Check if date is a working day
   */
  static isWorkingDay(date: Date): boolean {
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Convert Sunday from 0 to 7
    return NORWEGIAN_CULTURAL_SETTINGS.workingDays.includes(dayOfWeek) && !this.isPublicHoliday(date);
  }

  /**
   * Get business hours for date
   */
  static getBusinessHours(date?: Date): { start: string; end: string } | null {
    const checkDate = date || new Date();
    
    if (!this.isWorkingDay(checkDate)) {
      return null; // No business hours on non-working days
    }

    return NORWEGIAN_CULTURAL_SETTINGS.businessHours;
  }

  /**
   * Generate Norwegian locale React component template
   */
  static generateLocaleProviderTemplate(): string {
    return `
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { NorwegianLocale, NorwegianTranslations } from '../types/norwegian-compliance';
import { NorwegianLocalizationService } from '../compliance/norwegian-localization';

interface NorwegianLocaleContextValue {
  readonly locale: NorwegianLocale;
  readonly translations: NorwegianTranslations;
  readonly setLocale: (locale: NorwegianLocale) => void;
  readonly formatDate: (date: Date, format?: string) => string;
  readonly formatNumber: (value: number, type?: string) => string;
  readonly formatCurrency: (value: number) => string;
  readonly t: (key: string, params?: Record<string, string | number>) => string;
}

const NorwegianLocaleContext = createContext<NorwegianLocaleContextValue | undefined>(undefined);

interface NorwegianLocaleProviderProps {
  readonly children: React.ReactNode;
  readonly defaultLocale?: NorwegianLocale;
  readonly persistLocale?: boolean;
}

export const NorwegianLocaleProvider = ({ 
  children, 
  defaultLocale = 'nb-NO',
  persistLocale = true 
}: NorwegianLocaleProviderProps): JSX.Element => {
  const [locale, setLocaleState] = useState<NorwegianLocale>(() => {
    if (persistLocale && typeof window !== 'undefined') {
      const stored = localStorage.getItem('norwegian-locale') as NorwegianLocale;
      return stored || defaultLocale;
    }
    return defaultLocale;
  });

  const [translations, setTranslations] = useState<NorwegianTranslations>(() => 
    NorwegianLocalizationService.getTranslations(locale)
  );

  const setLocale = (newLocale: NorwegianLocale) => {
    setLocaleState(newLocale);
    setTranslations(NorwegianLocalizationService.getTranslations(newLocale));
    
    if (persistLocale && typeof window !== 'undefined') {
      localStorage.setItem('norwegian-locale', newLocale);
    }
  };

  const formatDate = (date: Date, format: string = 'short') => {
    return NorwegianLocalizationService.formatDate(
      date, 
      format as keyof import('../types/norwegian-compliance').NorwegianDateFormats, 
      locale
    );
  };

  const formatNumber = (value: number, type: string = 'decimal') => {
    return NorwegianLocalizationService.formatNumber(
      value, 
      type as keyof import('../types/norwegian-compliance').NorwegianNumberFormats, 
      locale
    );
  };

  const formatCurrency = (value: number) => {
    return NorwegianLocalizationService.formatNumber(value, 'currency', locale);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
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

  // Update document language attribute
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const contextValue: NorwegianLocaleContextValue = {
    locale,
    translations,
    setLocale,
    formatDate,
    formatNumber,
    formatCurrency,
    t,
  };

  return (
    <NorwegianLocaleContext.Provider value={contextValue}>
      {children}
    </NorwegianLocaleContext.Provider>
  );
};

export const useNorwegianLocale = (): NorwegianLocaleContextValue => {
  const context = useContext(NorwegianLocaleContext);
  if (!context) {
    throw new Error('useNorwegianLocale must be used within a NorwegianLocaleProvider');
  }
  return context;
};

// Convenience hook for translations
export const useNorwegianTranslation = () => {
  const { t, locale, translations } = useNorwegianLocale();
  return { t, locale, translations };
};

export default NorwegianLocaleProvider;
`;
  }

  /**
   * Generate Norwegian date picker locale configuration
   */
  static generateDatePickerLocaleConfig(locale: NorwegianLocale = 'nb-NO'): Record<string, any> {
    const translations = this.getTranslations(locale);
    const dateFormats = NORWEGIAN_DATE_FORMATS[locale];

    return {
      locale,
      firstDayOfWeek: NORWEGIAN_CULTURAL_SETTINGS.firstDayOfWeek,
      weekdayNames: [
        translations.dates.sunday,
        translations.dates.monday,
        translations.dates.tuesday,
        translations.dates.wednesday,
        translations.dates.thursday,
        translations.dates.friday,
        translations.dates.saturday,
      ],
      monthNames: [
        translations.dates.january,
        translations.dates.february,
        translations.dates.march,
        translations.dates.april,
        translations.dates.may,
        translations.dates.june,
        translations.dates.july,
        translations.dates.august,
        translations.dates.september,
        translations.dates.october,
        translations.dates.november,
        translations.dates.december,
      ],
      dateFormat: dateFormats.short,
      timeFormat: dateFormats.time,
      dateTimeFormat: dateFormats.datetime,
      todayLabel: translations.dates.today,
      selectDateLabel: translations.dates.selectDate,
      selectTimeLabel: translations.dates.selectTime,
      invalidDateMessage: translations.dates.invalidDate,
      invalidTimeMessage: translations.dates.invalidTime,
    };
  }
}

export default NorwegianLocalizationService;