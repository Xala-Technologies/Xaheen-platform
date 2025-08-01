import path from 'path';
import { promises as fs } from 'fs';
import { LocaleCode, TranslationFile } from './core.js';
import { logger } from '../utils/logger.js';
import { fileExists, ensureDir, writeFile, readFile } from '../utils/fs.js';

// Translation memory entry
export interface TranslationMemoryEntry {
  id: string;
  sourceText: string;
  targetText: string;
  sourceLocale: LocaleCode;
  targetLocale: LocaleCode;
  context?: string;
  domain?: string;
  quality: number;
  confidence: number;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  metadata?: {
    translator?: string;
    reviewer?: string;
    project?: string;
    component?: string;
    tags?: string[];
  };
}

// Fuzzy match result
export interface FuzzyMatch {
  id: string;
  sourceText: string;
  targetText: string;
  similarity: number;
  quality: number;
  confidence: number;
  context?: string;
  metadata?: TranslationMemoryEntry['metadata'];
}

// Translation memory configuration
export interface TranslationMemoryConfig {
  minQuality: number;
  minConfidence: number;
  maxResults: number;
  fuzzyThreshold: number;
  contextWeight: number;
  domainWeight: number;
  qualityDecay: number;
}

// Default configuration
const DEFAULT_CONFIG: TranslationMemoryConfig = {
  minQuality: 0.7,
  minConfidence: 0.8,
  maxResults: 10,
  fuzzyThreshold: 0.6,
  contextWeight: 0.3,
  domainWeight: 0.2,
  qualityDecay: 0.95,
};

// Search options
export interface SearchOptions {
  context?: string;
  domain?: string;
  minSimilarity?: number;
  maxResults?: number;
  includeMetadata?: boolean;
}

// Translation memory class
export class TranslationMemory {
  private config: TranslationMemoryConfig;
  private entries: Map<string, TranslationMemoryEntry> = new Map();
  private indexBySource: Map<string, Set<string>> = new Map();
  private indexByTarget: Map<string, Set<string>> = new Map();
  private memoryPath: string;
  
  constructor(
    memoryPath: string,
    config: Partial<TranslationMemoryConfig> = {}
  ) {
    this.memoryPath = memoryPath;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  // Initialize memory from file
  async initialize(): Promise<void> {
    try {
      if (await fileExists(this.memoryPath)) {
        const content = await readFile(this.memoryPath);
        const data = JSON.parse(content);
        
        if (Array.isArray(data)) {
          for (const entry of data) {
            this.addEntry(entry);
          }
        }
        
        logger.info(`Loaded ${this.entries.size} translation memory entries`);
      } else {
        await this.save();
        logger.info('Created new translation memory');
      }
    } catch (error) {
      logger.error('Failed to initialize translation memory:', error);
    }
  }
  
  // Add translation to memory
  async addTranslation(
    sourceText: string,
    targetText: string,
    sourceLocale: LocaleCode,
    targetLocale: LocaleCode,
    options: {
      context?: string;
      domain?: string;
      quality?: number;
      confidence?: number;
      metadata?: TranslationMemoryEntry['metadata'];
    } = {}
  ): Promise<string> {
    const id = this.generateId(sourceText, targetText, sourceLocale, targetLocale);
    
    const entry: TranslationMemoryEntry = {
      id,
      sourceText,
      targetText,
      sourceLocale,
      targetLocale,
      context: options.context,
      domain: options.domain,
      quality: options.quality ?? 0.8,
      confidence: options.confidence ?? 0.8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      metadata: options.metadata,
    };
    
    this.addEntry(entry);
    await this.save();
    
    return id;
  }
  
  // Search for translations
  search(
    sourceText: string,
    sourceLocale: LocaleCode,
    targetLocale: LocaleCode,
    options: SearchOptions = {}
  ): FuzzyMatch[] {
    const results: FuzzyMatch[] = [];
    const normalizedSource = this.normalizeText(sourceText);
    
    // Exact match first
    const exactMatches = this.findExactMatches(
      normalizedSource,
      sourceLocale,
      targetLocale
    );
    
    for (const entry of exactMatches) {
      if (this.passesFilters(entry, options)) {
        results.push(this.entryToMatch(entry, 1.0));
      }
    }
    
    // Fuzzy matches
    if (results.length < (options.maxResults ?? this.config.maxResults)) {
      const fuzzyMatches = this.findFuzzyMatches(
        normalizedSource,
        sourceLocale,
        targetLocale,
        options.minSimilarity ?? this.config.fuzzyThreshold
      );
      
      for (const match of fuzzyMatches) {
        if (this.passesFilters(match.entry, options)) {
          results.push(match);
        }
      }
    }
    
    // Sort by score and limit results
    return results
      .sort((a, b) => this.calculateScore(b, options) - this.calculateScore(a, options))
      .slice(0, options.maxResults ?? this.config.maxResults);
  }
  
  // Get suggestions for translation
  getSuggestions(
    sourceText: string,
    sourceLocale: LocaleCode,
    targetLocale: LocaleCode,
    context?: string
  ): string[] {
    const matches = this.search(sourceText, sourceLocale, targetLocale, {
      context,
      minSimilarity: 0.8,
      maxResults: 3,
    });
    
    return matches.map(match => match.targetText);
  }
  
  // Update translation quality
  async updateQuality(id: string, quality: number): Promise<void> {
    const entry = this.entries.get(id);
    if (entry) {
      entry.quality = Math.max(0, Math.min(1, quality));
      entry.updatedAt = new Date().toISOString();
      await this.save();
    }
  }
  
  // Record usage
  async recordUsage(id: string): Promise<void> {
    const entry = this.entries.get(id);
    if (entry) {
      entry.usageCount++;
      entry.updatedAt = new Date().toISOString();
      // Slight quality boost for frequently used translations
      entry.quality = Math.min(1, entry.quality + 0.01);
      await this.save();
    }
  }
  
  // Import from translation files
  async importFromFiles(
    translations: Map<LocaleCode, TranslationFile>,
    sourceLocale: LocaleCode
  ): Promise<number> {
    let imported = 0;
    const sourceFile = translations.get(sourceLocale);
    
    if (!sourceFile) {
      logger.warn(`Source locale ${sourceLocale} not found`);
      return 0;
    }
    
    const sourceTexts = this.extractTexts(sourceFile.translations);
    
    for (const [targetLocale, targetFile] of translations) {
      if (targetLocale === sourceLocale) continue;
      
      const targetTexts = this.extractTexts(targetFile.translations);
      
      for (const [key, sourceText] of sourceTexts) {
        const targetText = targetTexts.get(key);
        if (targetText) {
          await this.addTranslation(
            sourceText,
            targetText,
            sourceLocale,
            targetLocale,
            {
              context: this.getContextFromKey(key),
              domain: this.getDomainFromKey(key),
              quality: 0.9, // High quality for manually reviewed translations
              confidence: 0.95,
            }
          );
          imported++;
        }
      }
    }
    
    logger.info(`Imported ${imported} translations to memory`);
    return imported;
  }
  
  // Export to TMX format
  async exportToTMX(filePath: string): Promise<void> {
    const tmx = this.generateTMX();
    await writeFile(filePath, tmx);
    logger.info(`Exported translation memory to ${filePath}`);
  }
  
  // Import from TMX format
  async importFromTMX(filePath: string): Promise<number> {
    const content = await readFile(filePath);
    return this.parseTMX(content);
  }
  
  // Clean up low-quality entries
  async cleanup(): Promise<number> {
    const before = this.entries.size;
    const toRemove: string[] = [];
    
    for (const [id, entry] of this.entries) {
      // Remove very low quality entries
      if (entry.quality < 0.3) {
        toRemove.push(id);
        continue;
      }
      
      // Apply quality decay for unused entries
      if (entry.usageCount === 0) {
        entry.quality *= this.config.qualityDecay;
        if (entry.quality < this.config.minQuality) {
          toRemove.push(id);
        }
      }
    }
    
    for (const id of toRemove) {
      this.removeEntry(id);
    }
    
    await this.save();
    const removed = before - this.entries.size;
    logger.info(`Cleaned up ${removed} translation memory entries`);
    
    return removed;
  }
  
  // Get statistics
  getStatistics(): {
    totalEntries: number;
    languagePairs: Map<string, number>;
    qualityDistribution: { high: number; medium: number; low: number };
    averageQuality: number;
    topDomains: Array<{ domain: string; count: number }>;
  } {
    const languagePairs = new Map<string, number>();
    const domains = new Map<string, number>();
    let totalQuality = 0;
    let high = 0;
    let medium = 0;
    let low = 0;
    
    for (const entry of this.entries.values()) {
      const pair = `${entry.sourceLocale}-${entry.targetLocale}`;
      languagePairs.set(pair, (languagePairs.get(pair) || 0) + 1);
      
      if (entry.domain) {
        domains.set(entry.domain, (domains.get(entry.domain) || 0) + 1);
      }
      
      totalQuality += entry.quality;
      
      if (entry.quality >= 0.8) high++;
      else if (entry.quality >= 0.6) medium++;
      else low++;
    }
    
    const topDomains = Array.from(domains.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([domain, count]) => ({ domain, count }));
    
    return {
      totalEntries: this.entries.size,
      languagePairs,
      qualityDistribution: { high, medium, low },
      averageQuality: this.entries.size > 0 ? totalQuality / this.entries.size : 0,
      topDomains,
    };
  }
  
  // Private methods
  private addEntry(entry: TranslationMemoryEntry): void {
    this.entries.set(entry.id, entry);
    
    // Update indices
    const normalizedSource = this.normalizeText(entry.sourceText);
    const normalizedTarget = this.normalizeText(entry.targetText);
    
    if (!this.indexBySource.has(normalizedSource)) {
      this.indexBySource.set(normalizedSource, new Set());
    }
    this.indexBySource.get(normalizedSource)!.add(entry.id);
    
    if (!this.indexByTarget.has(normalizedTarget)) {
      this.indexByTarget.set(normalizedTarget, new Set());
    }
    this.indexByTarget.get(normalizedTarget)!.add(entry.id);
  }
  
  private removeEntry(id: string): void {
    const entry = this.entries.get(id);
    if (!entry) return;
    
    this.entries.delete(id);
    
    // Update indices
    const normalizedSource = this.normalizeText(entry.sourceText);
    const normalizedTarget = this.normalizeText(entry.targetText);
    
    this.indexBySource.get(normalizedSource)?.delete(id);
    this.indexByTarget.get(normalizedTarget)?.delete(id);
  }
  
  private generateId(
    sourceText: string,
    targetText: string,
    sourceLocale: LocaleCode,
    targetLocale: LocaleCode
  ): string {
    const content = `${sourceText}|${targetText}|${sourceLocale}|${targetLocale}`;
    return Buffer.from(content).toString('base64').substring(0, 32);
  }
  
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '');
  }
  
  private findExactMatches(
    normalizedSource: string,
    sourceLocale: LocaleCode,
    targetLocale: LocaleCode
  ): TranslationMemoryEntry[] {
    const ids = this.indexBySource.get(normalizedSource);
    if (!ids) return [];
    
    return Array.from(ids)
      .map(id => this.entries.get(id)!)
      .filter(entry => 
        entry.sourceLocale === sourceLocale && 
        entry.targetLocale === targetLocale
      );
  }
  
  private findFuzzyMatches(
    normalizedSource: string,
    sourceLocale: LocaleCode,
    targetLocale: LocaleCode,
    threshold: number
  ): Array<{ entry: TranslationMemoryEntry; similarity: number }> {
    const matches: Array<{ entry: TranslationMemoryEntry; similarity: number }> = [];
    
    for (const entry of this.entries.values()) {
      if (entry.sourceLocale !== sourceLocale || entry.targetLocale !== targetLocale) {
        continue;
      }
      
      const normalizedEntrySource = this.normalizeText(entry.sourceText);
      const similarity = this.calculateSimilarity(normalizedSource, normalizedEntrySource);
      
      if (similarity >= threshold) {
        matches.push({ entry, similarity });
      }
    }
    
    return matches.sort((a, b) => b.similarity - a.similarity);
  }
  
  private calculateSimilarity(text1: string, text2: string): number {
    // Levenshtein distance based similarity
    const len1 = text1.length;
    const len2 = text2.length;
    
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;
    
    const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));
    
    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const cost = text1[i - 1] === text2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j - 1][i] + 1,
          matrix[j][i - 1] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }
    
    const distance = matrix[len2][len1];
    return 1 - distance / Math.max(len1, len2);
  }
  
  private calculateScore(match: FuzzyMatch, options: SearchOptions): number {
    let score = match.similarity * match.quality * match.confidence;
    
    // Context bonus
    if (options.context && match.context === options.context) {
      score += this.config.contextWeight;
    }
    
    // Domain bonus
    if (options.domain && match.metadata?.project === options.domain) {
      score += this.config.domainWeight;
    }
    
    return score;
  }
  
  private passesFilters(entry: TranslationMemoryEntry, options: SearchOptions): boolean {
    if (entry.quality < this.config.minQuality) return false;
    if (entry.confidence < this.config.minConfidence) return false;
    
    return true;
  }
  
  private entryToMatch(entry: TranslationMemoryEntry, similarity: number): FuzzyMatch {
    return {
      id: entry.id,
      sourceText: entry.sourceText,
      targetText: entry.targetText,
      similarity,
      quality: entry.quality,
      confidence: entry.confidence,
      context: entry.context,
      metadata: entry.metadata,
    };
  }
  
  private extractTexts(translations: any, prefix = ''): Map<string, string> {
    const texts = new Map<string, string>();
    
    for (const [key, value] of Object.entries(translations)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'string') {
        texts.set(fullKey, value);
      } else if (typeof value === 'object' && value !== null) {
        const nested = this.extractTexts(value, fullKey);
        for (const [nestedKey, nestedValue] of nested) {
          texts.set(nestedKey, nestedValue);
        }
      }
    }
    
    return texts;
  }
  
  private getContextFromKey(key: string): string {
    return key.split('.')[0] || 'common';
  }
  
  private getDomainFromKey(key: string): string {
    const parts = key.split('.');
    if (parts.length >= 2) {
      return parts[1];
    }
    return 'general';
  }
  
  private generateTMX(): string {
    const entries = Array.from(this.entries.values());
    
    let tmx = `<?xml version="1.0" encoding="UTF-8"?>
<tmx version="1.4">
  <header>
    <prop type="x-filename">xala-translation-memory.tmx</prop>
  </header>
  <body>
`;
    
    for (const entry of entries) {
      tmx += `    <tu tuid="${entry.id}">
      <prop type="x-context">${entry.context || ''}</prop>
      <prop type="x-domain">${entry.domain || ''}</prop>
      <prop type="x-quality">${entry.quality}</prop>
      <tuv xml:lang="${entry.sourceLocale}">
        <seg>${this.escapeXML(entry.sourceText)}</seg>
      </tuv>
      <tuv xml:lang="${entry.targetLocale}">
        <seg>${this.escapeXML(entry.targetText)}</seg>
      </tuv>
    </tu>
`;
    }
    
    tmx += `  </body>
</tmx>`;
    
    return tmx;
  }
  
  private parseTMX(content: string): number {
    // Basic TMX parsing - would need a proper XML parser for production
    const tuRegex = /<tu tuid="([^"]+)">(.*?)<\/tu>/gs;
    let imported = 0;
    
    let match;
    while ((match = tuRegex.exec(content))) {
      const [, id, tuContent] = match;
      const tuvRegex = /<tuv xml:lang="([^"]+)">.*?<seg>(.*?)<\/seg>.*?<\/tuv>/gs;
      
      const segments: Array<{ lang: string; text: string }> = [];
      let tuvMatch;
      while ((tuvMatch = tuvRegex.exec(tuContent))) {
        const [, lang, text] = tuvMatch;
        segments.push({ lang, text: this.unescapeXML(text) });
      }
      
      if (segments.length === 2) {
        const [source, target] = segments;
        this.addTranslation(
          source.text,
          target.text,
          source.lang as LocaleCode,
          target.lang as LocaleCode,
          { quality: 0.8, confidence: 0.8 }
        );
        imported++;
      }
    }
    
    return imported;
  }
  
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  private unescapeXML(text: string): string {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
  
  // Save to file
  private async save(): Promise<void> {
    try {
      await ensureDir(path.dirname(this.memoryPath));
      const data = JSON.stringify(Array.from(this.entries.values()), null, 2);
      await writeFile(this.memoryPath, data);
    } catch (error) {
      logger.error('Failed to save translation memory:', error);
    }
  }
}

// Create default translation memory
export function createTranslationMemory(
  projectPath: string,
  config?: Partial<TranslationMemoryConfig>
): TranslationMemory {
  const memoryPath = path.join(projectPath, '.xala', 'translation-memory.json');
  return new TranslationMemory(memoryPath, config);
}

// Export convenience functions
export async function searchTranslations(
  memory: TranslationMemory,
  sourceText: string,
  sourceLocale: LocaleCode,
  targetLocale: LocaleCode,
  options?: SearchOptions
): Promise<FuzzyMatch[]> {
  return memory.search(sourceText, sourceLocale, targetLocale, options);
}

export async function addTranslationToMemory(
  memory: TranslationMemory,
  sourceText: string,
  targetText: string,
  sourceLocale: LocaleCode,
  targetLocale: LocaleCode,
  context?: string
): Promise<string> {
  return memory.addTranslation(sourceText, targetText, sourceLocale, targetLocale, {
    context,
    quality: 0.8,
    confidence: 0.8,
  });
}