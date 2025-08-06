/**
 * Text Constants
 * Centralized text constants for localization (Phase 1)
 * Future: Replace with proper i18n system
 */

export const LABELS = {
  // Common actions
  close: 'Lukk',
  open: 'Åpne', 
  save: 'Lagre',
  cancel: 'Avbryt',
  apply: 'Bruk',
  reset: 'Tilbakestill',
  search: 'Søk',
  filter: 'Filtrer',
  clear: 'Tøm',
  edit: 'Rediger',
  delete: 'Slett',
  add: 'Legg til',
  remove: 'Fjern',
  select: 'Velg',
  loading: 'Laster...',
  
  // Navigation
  home: 'Hjem',
  back: 'Tilbake',
  next: 'Neste',
  previous: 'Forrige',
  menu: 'Meny',
  navigation: 'Navigasjon',
  
  // Forms
  required: 'Påkrevd',
  optional: 'Valgfri',
  email: 'E-post',
  password: 'Passord',
  name: 'Navn',
  phone: 'Telefon',
  address: 'Adresse',
  
  // Messages
  error: 'Feil',
  success: 'Vellykket',
  warning: 'Advarsel',
  info: 'Informasjon',
  noResults: 'Ingen resultater',
  
  // Time
  today: 'I dag',
  yesterday: 'I går',
  tomorrow: 'I morgen',
  
  // NSM Classifications
  nsmOpen: 'Åpen',
  nsmRestricted: 'Begrenset', 
  nsmConfidential: 'Konfidensiell',
  nsmSecret: 'Hemmelig',
  
  // Accessibility
  expandSection: 'Utvid seksjon',
  collapseSection: 'Kollaps seksjon',
  toggleNavigation: 'Vis/skjul navigasjon',
  skipToContent: 'Hopp til innhold',
  
  // Chat
  sendMessage: 'Send melding',
  typeMessage: 'Skriv melding...',
  messageSent: 'Melding sendt',
  typing: 'Skriver...',
  online: 'Online',
  offline: 'Offline',
  
  // Search
  searchPlaceholder: 'Søk...',
  recentSearches: 'Nylige søk',
  noResultsFound: 'Ingen resultater funnet',
  searchResults: 'Søkeresultater',
  
  // Filters
  filters: 'Filtre',
  activeFilters: 'Aktive filtre',
  clearFilters: 'Fjern alle filtre',
  applyFilters: 'Bruk filtre',
  
  // File operations
  uploadFile: 'Last opp fil',
  downloadFile: 'Last ned fil',
  fileSize: 'Filstørrelse',
  
  // Status
  active: 'Aktiv',
  inactive: 'Inaktiv',
  pending: 'Venter',
  completed: 'Fullført',
  
  // Sidebar
  collapseSidebar: 'Kollaps sidemeny',
  expandSidebar: 'Utvid sidemeny',
  
  // Pagination
  page: 'Side',
  of: 'av',
  itemsPerPage: 'Elementer per side'
} as const;

export const PLACEHOLDERS = {
  searchEverything: 'Søk etter alt... (Ctrl+K)',
  searchDocuments: 'Søk i dokumenter...',
  searchUsers: 'Søk brukere...',
  enterEmail: 'Skriv inn e-post',
  enterPassword: 'Skriv inn passord',
  enterName: 'Skriv inn navn',
  enterPhone: 'Skriv inn telefonnummer',
  selectOption: 'Velg alternativ...',
  typeHere: 'Skriv her...',
  optional: '(valgfri)'
} as const;

export const ARIA_LABELS = {
  closeDialog: 'Lukk dialog',
  openMenu: 'Åpne meny',
  userMenu: 'Brukermeny',
  mainNavigation: 'Hovednavigasjon',
  searchInput: 'Søkefelt',
  loadingSpinner: 'Laster innhold',
  errorMessage: 'Feilmelding',
  successMessage: 'Suksessmelding',
  toggleTheme: 'Endre tema',
  sortBy: 'Sorter etter',
  filterBy: 'Filtrer etter'
} as const;

// Type helpers for text constants
export type LabelKey = keyof typeof LABELS;
export type PlaceholderKey = keyof typeof PLACEHOLDERS;
export type AriaLabelKey = keyof typeof ARIA_LABELS;