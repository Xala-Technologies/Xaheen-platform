/**
 * Localization Generator for Xala UI System
 */

import type { ComponentConfig } from '../types/index.js';

export class LocalizationGenerator {
  
  generateKeys(config: ComponentConfig): Record<string, any> {
    const baseKeys = this.generateBaseKeys(config);
    const categoryKeys = this.generateCategorySpecificKeys(config);
    const featureKeys = this.generateFeatureSpecificKeys(config);
    
    return {
      ...baseKeys,
      ...categoryKeys,
      ...featureKeys,
      common: {
        loading: "Loading...",
        error: "An error occurred",
        cancel: "Cancel",
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        view: "View",
        close: "Close",
        open: "Open",
        yes: "Yes",
        no: "No",
        ok: "OK"
      }
    };
  }

  private generateBaseKeys(config: ComponentConfig): Record<string, any> {
    const componentKey = config.name.toLowerCase().replace(/([A-Z])/g, '_$1').toLowerCase();
    
    return {
      [componentKey]: {
        title: this.generateTitle(config.name),
        description: this.generateDescription(config),
        label: this.generateLabel(config.name),
        placeholder: this.generatePlaceholder(config),
        action: this.generateActionText(config),
        error: this.generateErrorMessage(config),
        success: this.generateSuccessMessage(config)
      }
    };
  }

  private generateCategorySpecificKeys(config: ComponentConfig): Record<string, any> {
    switch (config.category) {
      case 'layouts':
        return this.generateLayoutKeys(config);
      case 'navigation':
        return this.generateNavigationKeys(config);
      case 'form':
        return this.generateFormKeys(config);
      case 'data-display':
        return this.generateDataDisplayKeys(config);
      case 'feedback':
        return this.generateFeedbackKeys(config);
      case 'interactive':
        return this.generateInteractiveKeys(config);
      case 'page-template':
        return this.generatePageTemplateKeys(config);
      default:
        return {};
    }
  }

  private generateFeatureSpecificKeys(config: ComponentConfig): Record<string, any> {
    const keys: Record<string, any> = {};

    if (config.features.searchable) {
      keys.search = {
        placeholder: "Search...",
        noResults: "No results found",
        results: "{{count}} results found",
        clear: "Clear search"
      };
    }

    if (config.features.sortable) {
      keys.sort = {
        ascending: "Sort ascending",
        descending: "Sort descending",
        unsorted: "Remove sorting"
      };
    }

    if (config.features.filterable) {
      keys.filter = {
        apply: "Apply filters",
        clear: "Clear filters",
        noFilters: "No filters applied",
        results: "{{count}} items match filters"
      };
    }

    if (config.features.paginated) {
      keys.pagination = {
        previous: "Previous page",
        next: "Next page",
        first: "First page",
        last: "Last page",
        page: "Page {{current}} of {{total}}",
        itemsPerPage: "Items per page",
        showing: "Showing {{start}} to {{end}} of {{total}} items"
      };
    }

    if (config.features.selectable) {
      keys.selection = {
        selectAll: "Select all",
        selectNone: "Select none",
        selected: "{{count}} selected",
        actions: "Actions for selected items"
      };
    }

    if (config.features.draggable) {
      keys.drag = {
        handle: "Drag handle",
        drop: "Drop here",
        reorder: "Reorder items"
      };
    }

    if (config.features.collapsible) {
      keys.collapse = {
        expand: "Expand",
        collapse: "Collapse",
        toggle: "Toggle visibility"
      };
    }

    if (config.features.tooltips) {
      keys.tooltip = {
        moreInfo: "More information",
        help: "Help"
      };
    }

    if (config.features.validation) {
      keys.validation = {
        required: "This field is required",
        invalid: "Please enter a valid value",
        tooShort: "Value is too short",
        tooLong: "Value is too long",
        pattern: "Value does not match required pattern"
      };
    }

    return keys;
  }

  private generateLayoutKeys(config: ComponentConfig): Record<string, any> {
    return {
      layout: {
        header: "Header",
        footer: "Footer",
        sidebar: "Sidebar",
        main: "Main content",
        navigation: "Navigation",
        toggleSidebar: "Toggle sidebar",
        skipToContent: "Skip to main content"
      },
      brand: {
        name: "Your Application",
        logo: "Application logo"
      }
    };
  }

  private generateNavigationKeys(config: ComponentConfig): Record<string, any> {
    return {
      navigation: {
        menu: "Menu",
        openMenu: "Open navigation menu",
        closeMenu: "Close navigation menu",
        home: "Home",
        dashboard: "Dashboard",
        profile: "Profile",
        settings: "Settings",
        logout: "Log out",
        login: "Log in"
      },
      breadcrumb: {
        home: "Home",
        separator: "/"
      }
    };
  }

  private generateFormKeys(config: ComponentConfig): Record<string, any> {
    return {
      form: {
        submit: "Submit",
        reset: "Reset",
        cancel: "Cancel",
        save: "Save",
        saveAndContinue: "Save and continue",
        required: "Required field",
        optional: "Optional field",
        submitting: "Submitting...",
        submitted: "Form submitted successfully",
        error: "Please correct the errors below"
      },
      field: {
        firstName: "First name",
        lastName: "Last name",
        email: "Email address",
        phone: "Phone number",
        message: "Message",
        subject: "Subject",
        company: "Company",
        website: "Website"
      }
    };
  }

  private generateDataDisplayKeys(config: ComponentConfig): Record<string, any> {
    return {
      table: {
        noData: "No data available",
        loading: "Loading data...",
        error: "Failed to load data",
        actions: "Actions",
        edit: "Edit",
        delete: "Delete",
        view: "View details"
      },
      card: {
        readMore: "Read more",
        collapse: "Collapse",
        expand: "Expand"
      }
    };
  }

  private generateFeedbackKeys(config: ComponentConfig): Record<string, any> {
    return {
      alert: {
        info: "Information",
        success: "Success",
        warning: "Warning",
        error: "Error",
        close: "Close alert"
      },
      notification: {
        dismiss: "Dismiss notification",
        undo: "Undo",
        retry: "Retry"
      },
      progress: {
        loading: "Loading...",
        complete: "Complete",
        error: "Error occurred"
      }
    };
  }

  private generateInteractiveKeys(config: ComponentConfig): Record<string, any> {
    return {
      dialog: {
        close: "Close dialog",
        confirm: "Confirm",
        cancel: "Cancel"
      },
      drawer: {
        open: "Open drawer",
        close: "Close drawer"
      },
      commandPalette: {
        placeholder: "Type a command or search...",
        noResults: "No results found",
        recentCommands: "Recent commands"
      }
    };
  }

  private generatePageTemplateKeys(config: ComponentConfig): Record<string, any> {
    return {
      page: {
        title: this.generateTitle(config.name),
        subtitle: this.generateSubtitle(config),
        loading: "Loading page...",
        error: "Failed to load page",
        notFound: "Page not found",
        backToHome: "Back to home"
      },
      hero: {
        title: "Welcome to Your Application",
        subtitle: "Build amazing experiences with our UI system",
        cta: "Get started",
        learnMore: "Learn more"
      },
      features: {
        title: "Features",
        subtitle: "Everything you need to build great applications"
      }
    };
  }

  private generateTitle(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private generateDescription(config: ComponentConfig): string {
    const title = this.generateTitle(config.name);
    return `${title} component with ${config.category} functionality`;
  }

  private generateLabel(name: string): string {
    return this.generateTitle(name);
  }

  private generatePlaceholder(config: ComponentConfig): string {
    if (config.features.searchable) {
      return `Search ${config.name.toLowerCase()}...`;
    }
    return `Enter ${config.name.toLowerCase()}...`;
  }

  private generateActionText(config: ComponentConfig): string {
    if (config.category === 'form') {
      return 'Submit';
    }
    if (config.features.interactive) {
      return 'Click me';
    }
    return 'Action';
  }

  private generateErrorMessage(config: ComponentConfig): string {
    return `Failed to load ${config.name.toLowerCase()}`;
  }

  private generateSuccessMessage(config: ComponentConfig): string {
    return `${this.generateTitle(config.name)} completed successfully`;
  }

  private generateSubtitle(config: ComponentConfig): string {
    return `Manage your ${config.name.toLowerCase()} settings and preferences`;
  }

  generateMultilingualKeys(config: ComponentConfig): Record<string, Record<string, any>> {
    const englishKeys = this.generateKeys(config);
    
    return {
      en: englishKeys,
      no: this.translateToNorwegian(englishKeys),
      fr: this.translateToFrench(englishKeys),
      ar: this.translateToArabic(englishKeys)
    };
  }

  private translateToNorwegian(keys: Record<string, any>): Record<string, any> {
    // This would typically use a translation service
    // For now, return placeholder Norwegian translations
    return this.deepTranslate(keys, {
      'Loading...': 'Laster...',
      'Error': 'Feil',
      'Cancel': 'Avbryt',
      'Save': 'Lagre',
      'Delete': 'Slett',
      'Edit': 'Rediger',
      'View': 'Vis',
      'Close': 'Lukk',
      'Open': 'Åpne',
      'Yes': 'Ja',
      'No': 'Nei',
      'OK': 'OK',
      'Search...': 'Søk...',
      'Home': 'Hjem',
      'Dashboard': 'Dashbord',
      'Profile': 'Profil',
      'Settings': 'Innstillinger'
    });
  }

  private translateToFrench(keys: Record<string, any>): Record<string, any> {
    return this.deepTranslate(keys, {
      'Loading...': 'Chargement...',
      'Error': 'Erreur',
      'Cancel': 'Annuler',
      'Save': 'Enregistrer',
      'Delete': 'Supprimer',
      'Edit': 'Modifier',
      'View': 'Voir',
      'Close': 'Fermer',
      'Open': 'Ouvrir',
      'Yes': 'Oui',
      'No': 'Non',
      'OK': 'OK',
      'Search...': 'Rechercher...',
      'Home': 'Accueil',
      'Dashboard': 'Tableau de bord',
      'Profile': 'Profil',
      'Settings': 'Paramètres'
    });
  }

  private translateToArabic(keys: Record<string, any>): Record<string, any> {
    return this.deepTranslate(keys, {
      'Loading...': 'جاري التحميل...',
      'Error': 'خطأ',
      'Cancel': 'إلغاء',
      'Save': 'حفظ',
      'Delete': 'حذف',
      'Edit': 'تعديل',
      'View': 'عرض',
      'Close': 'إغلاق',
      'Open': 'فتح',
      'Yes': 'نعم',
      'No': 'لا',
      'OK': 'موافق',
      'Search...': 'بحث...',
      'Home': 'الرئيسية',
      'Dashboard': 'لوحة التحكم',
      'Profile': 'الملف الشخصي',
      'Settings': 'الإعدادات'
    });
  }

  private deepTranslate(obj: any, translations: Record<string, string>): any {
    if (typeof obj === 'string') {
      return translations[obj] || obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepTranslate(item, translations));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.deepTranslate(value, translations);
      }
      return result;
    }
    
    return obj;
  }
}
