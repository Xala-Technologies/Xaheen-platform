import { logger } from '../../utils/logger.js';
import type { ThemeConfig } from '../theme-generator.js';

export class ThemeValidation {
  async validateConfig(config: ThemeConfig): Promise<void> {
    this.validateName(config.name);
    this.validateBrand(config.brand);
    this.validateIndustry(config.industry);
    this.validateColors(config.colors);
    this.validateAccessibility(config.accessibility);
    this.validateFeatures(config.features);
    this.validateLocales(config.locales);

    logger.info(`Theme configuration validated: ${config.name}`);
  }

  async validateTheme(themeName: string): Promise<boolean> {
    // Implementation would validate existing theme
    logger.info(`Validating theme: ${themeName}`);
    return true;
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Theme name is required');
    }

    if (name.length > 50) {
      throw new Error('Theme name must be 50 characters or less');
    }

    if (!/^[a-z0-9-]+$/.test(name)) {
      throw new Error('Theme name must contain only lowercase letters, numbers, and hyphens');
    }
  }

  private validateBrand(brand: string): void {
    if (!brand || brand.trim().length === 0) {
      throw new Error('Brand name is required');
    }

    if (brand.length > 100) {
      throw new Error('Brand name must be 100 characters or less');
    }
  }

  private validateIndustry(industry: string): void {
    const validIndustries = [
      'saas',
      'fintech',
      'healthcare',
      'ecommerce',
      'education',
      'enterprise',
      'other',
    ];

    if (!validIndustries.includes(industry)) {
      throw new Error(`Invalid industry. Must be one of: ${validIndustries.join(', ')}`);
    }
  }

  private validateColors(colors: Record<string, string>): void {
    const requiredColors = ['primary', 'secondary'];
    
    for (const color of requiredColors) {
      if (!colors[color]) {
        throw new Error(`Required color '${color}' is missing`);
      }

      if (!this.isValidHexColor(colors[color])) {
        throw new Error(`Invalid hex color for '${color}': ${colors[color]}`);
      }
    }
  }

  private validateAccessibility(level: 'AA' | 'AAA'): void {
    if (!['AA', 'AAA'].includes(level)) {
      throw new Error('Accessibility level must be AA or AAA');
    }
  }

  private validateFeatures(features: ReadonlyArray<string>): void {
    const validFeatures = [
      'dark-mode',
      'high-contrast',
      'reduced-motion',
      'large-text',
      'keyboard-navigation',
    ];

    for (const feature of features) {
      if (!validFeatures.includes(feature)) {
        throw new Error(`Invalid feature: ${feature}`);
      }
    }
  }

  private validateLocales(locales: ReadonlyArray<string>): void {
    const validLocales = ['en-US', 'nb-NO', 'fr-FR', 'ar-SA'];
    
    if (locales.length === 0) {
      throw new Error('At least one locale is required');
    }

    for (const locale of locales) {
      if (!validLocales.includes(locale)) {
        throw new Error(`Invalid locale: ${locale}. Must be one of: ${validLocales.join(', ')}`);
      }
    }

    if (!locales.includes('en-US')) {
      throw new Error('English (en-US) locale is required');
    }
  }

  private isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }
}