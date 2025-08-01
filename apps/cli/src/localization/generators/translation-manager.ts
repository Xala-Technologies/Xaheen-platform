/**
 * Translation Management System
 * Handles extraction, generation, import/export, and validation of translations
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse as parseCSV } from 'csv-parse/sync';
import { stringify as stringifyCSV } from 'csv-stringify/sync';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  missingKeys: string[];
  unusedKeys: string[];
  invalidValues: Array<{
    key: string;
    value: any;
    reason: string;
  }>;
  coverage: number;
  warnings: string[];
}

/**
 * Translation entry interface
 */
interface TranslationEntry {
  key: string;
  value: string;
  context?: string;
  maxLength?: number;
}

/**
 * Extract translation keys from source files
 * @param filePath - Path to file or directory to scan
 * @returns Array of translation keys found
 */
export function extractTranslationKeys(filePath: string): string[] {
  const keys: Set<string> = new Set();
  
  // Check if path exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`Path does not exist: ${filePath}`);
  }
  
  const stats = fs.statSync(filePath);
  
  if (stats.isDirectory()) {
    // Recursively scan directory
    const files = fs.readdirSync(filePath);
    
    for (const file of files) {
      const fullPath = path.join(filePath, file);
      const fileStats = fs.statSync(fullPath);
      
      if (fileStats.isDirectory() && !file.includes('node_modules')) {
        const subKeys = extractTranslationKeys(fullPath);
        subKeys.forEach(key => keys.add(key));
      } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
        const fileKeys = extractKeysFromFile(fullPath);
        fileKeys.forEach(key => keys.add(key));
      }
    }
  } else {
    // Scan single file
    const fileKeys = extractKeysFromFile(filePath);
    fileKeys.forEach(key => keys.add(key));
  }
  
  return Array.from(keys).sort();
}

/**
 * Extract translation keys from a single file
 * @param filePath - Path to file
 * @returns Array of translation keys
 */
function extractKeysFromFile(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keys: string[] = [];
  
  // Pattern matching for common translation function calls
  const patterns = [
    // t('key'), t("key")
    /t\(['"`]([^'"`]+)['"`]\)/g,
    // i18n.t('key'), i18n.t("key")
    /i18n\.t\(['"`]([^'"`]+)['"`]\)/g,
    // translate('key'), translate("key")
    /translate\(['"`]([^'"`]+)['"`]\)/g,
    // __('key'), __("key")
    /__\(['"`]([^'"`]+)['"`]\)/g,
    // <Trans i18nKey="key">
    /<Trans[^>]+i18nKey=["']([^"']+)["']/g,
    // {t('key')}, {t("key")}
    /\{t\(['"`]([^'"`]+)['"`]\)\}/g,
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      keys.push(match[1]);
    }
  }
  
  return keys;
}

/**
 * Generate translation file for a specific language
 * @param keys - Array of translation keys
 * @param language - Target language code
 * @param outputPath - Output file path (optional)
 */
export async function generateTranslationFile(
  keys: string[],
  language: string,
  outputPath?: string
): Promise<void> {
  const translations: Record<string, any> = {};
  
  // Build nested object structure from dot notation keys
  for (const key of keys) {
    const parts = key.split('.');
    let current = translations;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    // Set placeholder value
    current[parts[parts.length - 1]] = `[${language}] ${key}`;
  }
  
  // Determine output path
  const filePath = outputPath || path.join(
    process.cwd(),
    'src',
    'localization',
    'languages',
    `${language}.json`
  );
  
  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write translation file
  fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf-8');
}

/**
 * Import translations from external file
 * @param filePath - Path to import file
 * @param language - Target language code
 * @param format - File format (json or csv)
 */
export async function importTranslations(
  filePath: string,
  language: string,
  format: 'json' | 'csv' = 'json'
): Promise<void> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Import file not found: ${filePath}`);
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  let translations: Record<string, string> = {};
  
  if (format === 'json') {
    translations = JSON.parse(content);
  } else if (format === 'csv') {
    const records = parseCSV(content, {
      columns: true,
      skip_empty_lines: true,
    });
    
    for (const record of records) {
      if (record.key && record[language]) {
        translations[record.key] = record[language];
      }
    }
  }
  
  // Merge with existing translations
  const existingPath = path.join(
    process.cwd(),
    'src',
    'localization',
    'languages',
    `${language}.json`
  );
  
  let existing = {};
  if (fs.existsSync(existingPath)) {
    existing = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
  }
  
  // Merge translations
  const merged = mergeTranslations(existing, translations);
  
  // Write updated translations
  fs.writeFileSync(existingPath, JSON.stringify(merged, null, 2), 'utf-8');
}

/**
 * Export translations to external file
 * @param language - Language code to export
 * @param format - Export format (json or csv)
 * @param outputPath - Output file path (optional)
 */
export async function exportTranslations(
  language: string,
  format: 'json' | 'csv' = 'json',
  outputPath?: string
): Promise<void> {
  const translationPath = path.join(
    process.cwd(),
    'src',
    'localization',
    'languages',
    `${language}.json`
  );
  
  if (!fs.existsSync(translationPath)) {
    throw new Error(`Translation file not found for language: ${language}`);
  }
  
  const translations = JSON.parse(fs.readFileSync(translationPath, 'utf-8'));
  const flattened = flattenTranslations(translations);
  
  const filePath = outputPath || `translations-${language}.${format}`;
  
  if (format === 'json') {
    fs.writeFileSync(filePath, JSON.stringify(flattened, null, 2), 'utf-8');
  } else if (format === 'csv') {
    const records = Object.entries(flattened).map(([key, value]) => ({
      key,
      [language]: value,
    }));
    
    const csv = stringifyCSV(records, {
      header: true,
      columns: ['key', language],
    });
    
    fs.writeFileSync(filePath, csv, 'utf-8');
  }
}

/**
 * Validate translations for completeness and quality
 * @param language - Language code to validate
 * @returns Validation result
 */
export function validateTranslations(language: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    missingKeys: [],
    unusedKeys: [],
    invalidValues: [],
    coverage: 100,
    warnings: [],
  };
  
  try {
    // Load translations
    const translationPath = path.join(
      process.cwd(),
      'src',
      'localization',
      'languages',
      `${language}.json`
    );
    
    if (!fs.existsSync(translationPath)) {
      throw new Error(`Translation file not found for language: ${language}`);
    }
    
    const translations = JSON.parse(fs.readFileSync(translationPath, 'utf-8'));
    const flattened = flattenTranslations(translations);
    
    // Extract keys from source code
    const srcPath = path.join(process.cwd(), 'src');
    const usedKeys = extractTranslationKeys(srcPath);
    
    // Find missing keys
    for (const key of usedKeys) {
      if (!flattened[key]) {
        result.missingKeys.push(key);
      }
    }
    
    // Find unused keys
    const translationKeys = Object.keys(flattened);
    for (const key of translationKeys) {
      if (!usedKeys.includes(key)) {
        result.unusedKeys.push(key);
      }
    }
    
    // Validate translation values
    for (const [key, value] of Object.entries(flattened)) {
      // Check for empty values
      if (!value || value.trim() === '') {
        result.invalidValues.push({
          key,
          value,
          reason: 'Empty translation value',
        });
      }
      
      // Check for placeholder values
      if (typeof value === 'string' && value.includes(`[${language}]`)) {
        result.invalidValues.push({
          key,
          value,
          reason: 'Contains placeholder text',
        });
      }
      
      // Check for untranslated values (same as key)
      if (value === key) {
        result.warnings.push(`Key "${key}" appears to be untranslated`);
      }
    }
    
    // Calculate coverage
    const totalKeys = usedKeys.length;
    const translatedKeys = usedKeys.filter(key => flattened[key] && flattened[key].trim() !== '').length;
    result.coverage = totalKeys > 0 ? (translatedKeys / totalKeys) * 100 : 100;
    
    // Determine overall validity
    result.isValid = result.missingKeys.length === 0 && result.invalidValues.length === 0;
    
  } catch (error) {
    result.isValid = false;
    result.warnings.push(`Validation error: ${error.message}`);
  }
  
  return result;
}

/**
 * Find missing translations across multiple languages
 * @param languages - Array of language codes to check
 * @returns Array of missing translation keys
 */
export function findMissingTranslations(languages: string[]): string[] {
  const missingByLanguage: Map<string, Set<string>> = new Map();
  
  // Extract keys from source
  const srcPath = path.join(process.cwd(), 'src');
  const usedKeys = extractTranslationKeys(srcPath);
  
  // Check each language
  for (const language of languages) {
    const translationPath = path.join(
      process.cwd(),
      'src',
      'localization',
      'languages',
      `${language}.json`
    );
    
    if (!fs.existsSync(translationPath)) {
      missingByLanguage.set(language, new Set(usedKeys));
      continue;
    }
    
    const translations = JSON.parse(fs.readFileSync(translationPath, 'utf-8'));
    const flattened = flattenTranslations(translations);
    const missing = new Set<string>();
    
    for (const key of usedKeys) {
      if (!flattened[key] || flattened[key].trim() === '') {
        missing.add(key);
      }
    }
    
    missingByLanguage.set(language, missing);
  }
  
  // Find keys missing in any language
  const allMissing = new Set<string>();
  for (const missing of missingByLanguage.values()) {
    for (const key of missing) {
      allMissing.add(key);
    }
  }
  
  return Array.from(allMissing).sort();
}

/**
 * Find unused translations across multiple languages
 * @param languages - Array of language codes to check
 * @returns Array of unused translation keys
 */
export function findUnusedTranslations(languages: string[]): string[] {
  const unusedByLanguage: Map<string, Set<string>> = new Map();
  
  // Extract keys from source
  const srcPath = path.join(process.cwd(), 'src');
  const usedKeys = new Set(extractTranslationKeys(srcPath));
  
  // Check each language
  for (const language of languages) {
    const translationPath = path.join(
      process.cwd(),
      'src',
      'localization',
      'languages',
      `${language}.json`
    );
    
    if (!fs.existsSync(translationPath)) {
      continue;
    }
    
    const translations = JSON.parse(fs.readFileSync(translationPath, 'utf-8'));
    const flattened = flattenTranslations(translations);
    const unused = new Set<string>();
    
    for (const key of Object.keys(flattened)) {
      if (!usedKeys.has(key)) {
        unused.add(key);
      }
    }
    
    unusedByLanguage.set(language, unused);
  }
  
  // Find keys unused in all languages
  const allUnused = new Set<string>();
  let first = true;
  
  for (const unused of unusedByLanguage.values()) {
    if (first) {
      for (const key of unused) {
        allUnused.add(key);
      }
      first = false;
    } else {
      // Keep only keys that are unused in all languages
      for (const key of Array.from(allUnused)) {
        if (!unused.has(key)) {
          allUnused.delete(key);
        }
      }
    }
  }
  
  return Array.from(allUnused).sort();
}

/**
 * Flatten nested translation object to dot notation
 * @param obj - Nested translation object
 * @param prefix - Key prefix for recursion
 * @returns Flattened object
 */
function flattenTranslations(obj: any, prefix = ''): Record<string, string> {
  const flattened: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenTranslations(value, fullKey));
    } else {
      flattened[fullKey] = String(value);
    }
  }
  
  return flattened;
}

/**
 * Merge two translation objects
 * @param existing - Existing translations
 * @param updates - New translations to merge
 * @returns Merged translation object
 */
function mergeTranslations(existing: any, updates: any): any {
  const merged = { ...existing };
  
  for (const [key, value] of Object.entries(updates)) {
    if (key.includes('.')) {
      // Handle dot notation
      const parts = key.split('.');
      let current = merged;
      
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      
      current[parts[parts.length - 1]] = value;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively merge objects
      merged[key] = mergeTranslations(merged[key] || {}, value);
    } else {
      // Direct assignment
      merged[key] = value;
    }
  }
  
  return merged;
}