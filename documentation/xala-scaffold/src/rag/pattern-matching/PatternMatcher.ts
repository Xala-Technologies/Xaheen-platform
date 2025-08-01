/**
 * Pattern Matcher Implementation
 * 
 * Advanced pattern recognition and matching system for code analysis.
 * Combines AST analysis, semantic similarity, and structural matching.
 * Optimized for Norwegian compliance and enterprise development patterns.
 * 
 * Features:
 * - AST-based structural analysis
 * - Semantic pattern recognition
 * - Norwegian compliance pattern detection
 * - Code quality assessment
 * - Pattern similarity scoring
 * - Multi-language support
 */

import { EventEmitter } from 'events';
import { ILoggingService } from '../../architecture/interfaces.js';
import { LocaleCode, NorwegianCompliance } from '../../types/compliance.js';

/**
 * Code pattern representation
 */
export interface ICodePattern {
  id: string;
  name: string;
  description: string;
  type: 'structural' | 'semantic' | 'compliance' | 'anti-pattern' | 'best-practice';
  language: string;
  framework?: string;
  pattern_code: string;
  metadata: IPatternMetadata;
  examples: string[];
  related_patterns: string[];
  compliance?: NorwegianCompliance;
}

/**
 * Pattern metadata
 */
export interface IPatternMetadata {
  category: string;
  tags: string[];
  quality_score: number;
  usage_count: number;
  complexity: number;
  maintainability: number;
  security_score?: number;
  accessibility_score?: number;
  created_at: string;
  updated_at: string;
  author: string;
  source: string;
}

/**
 * Pattern match result
 */
export interface IPatternMatch {
  pattern: ICodePattern;
  match_score: number;
  confidence: number;
  matched_segments: IMatchedSegment[];
  improvements: IImprovement[];
  compliance_issues: IComplianceIssue[];
  explanation: string;
}

/**
 * Matched code segment
 */
export interface IMatchedSegment {
  start_line: number;
  end_line: number;
  start_column: number;
  end_column: number;
  code: string;
  match_type: 'identical' | 'similar' | 'structural' | 'semantic';
  similarity_score: number;
}

/**
 * Code improvement suggestion
 */
export interface IImprovement {
  type: 'refactor' | 'optimize' | 'security' | 'accessibility' | 'compliance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  before_code?: string;
  after_code?: string;
  reasoning: string;
  compliance_requirement?: string;
}

/**
 * Compliance issue detection
 */
export interface IComplianceIssue {
  type: 'nsm' | 'gdpr' | 'wcag' | 'accessibility' | 'security';
  severity: 'info' | 'warning' | 'error' | 'critical';
  description: string;
  location: {
    line: number;
    column: number;
  };
  rule: string;
  solution: string;
  documentation_url?: string;
}

/**
 * Pattern analysis options
 */
export interface IPatternAnalysisOptions {
  include_ast_analysis?: boolean;
  include_semantic_analysis?: boolean;
  include_compliance_check?: boolean;
  min_match_score?: number;
  max_results?: number;
  target_locale?: LocaleCode;
  focus_areas?: string[];
  exclude_patterns?: string[];
}

/**
 * AST node representation (simplified)
 */
interface IASTNode {
  type: string;
  name?: string;
  children: IASTNode[];
  start_pos: { line: number; column: number };
  end_pos: { line: number; column: number };
  metadata: Record<string, any>;
}

/**
 * Pattern Matcher Service
 */
export class PatternMatcher extends EventEmitter {
  private knownPatterns = new Map<string, ICodePattern>();
  private astCache = new Map<string, IASTNode>();
  private initialized = false;

  // Norwegian compliance patterns
  private readonly NORWEGIAN_PATTERNS = {
    'nsm-classification': {
      patterns: [
        'nsmClassification',
        'NSM_CLASSIFICATION',
        'security.classification',
        'classificationLevel'
      ],
      required_values: ['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET']
    },
    'gdpr-compliance': {
      patterns: [
        'gdprCompliant',
        'personalDataHandling',
        'dataProtection',
        'consentManagement'
      ],
      indicators: ['consent', 'personal_data', 'privacy', 'data_subject']
    },
    'wcag-accessibility': {
      patterns: [
        'wcagLevel',
        'accessibilityLevel',
        'aria-label',
        'role=',
        'tabIndex'
      ],
      levels: ['A', 'AA', 'AAA']
    }
  };

  // Code quality patterns
  private readonly QUALITY_PATTERNS = {
    'solid-principles': [
      'single responsibility',
      'open closed',
      'liskov substitution',
      'interface segregation',
      'dependency inversion'
    ],
    'anti-patterns': [
      'god object',
      'spaghetti code',
      'magic numbers',
      'code duplication',
      'tight coupling'
    ],
    'security-patterns': [
      'input validation',
      'output encoding',
      'authentication',
      'authorization',
      'secure communication'
    ]
  };

  constructor(
    private readonly logger: ILoggingService
  ) {
    super();
  }

  /**
   * Initialize the pattern matcher
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Pattern Matcher');

      // Load built-in patterns
      await this.loadBuiltInPatterns();

      // Initialize AST parser capabilities
      await this.initializeASTParser();

      this.initialized = true;
      this.emit('initialized');

      this.logger.info('Pattern Matcher initialized successfully', {
        patternsCount: this.knownPatterns.size
      });
    } catch (error) {
      this.logger.error('Failed to initialize Pattern Matcher', error as Error);
      throw error;
    }
  }

  /**
   * Analyze code for pattern matches
   */
  async analyzeCode(
    code: string,
    options: IPatternAnalysisOptions = {}
  ): Promise<IPatternMatch[]> {
    try {
      this.logger.debug('Analyzing code for patterns', {
        codeLength: code.length,
        options
      });

      const matches: IPatternMatch[] = [];
      
      // Parse AST if requested
      let ast: IASTNode | undefined;
      if (options.include_ast_analysis !== false) {
        ast = await this.parseAST(code);
      }

      // Analyze against each known pattern
      for (const pattern of this.knownPatterns.values()) {
        // Skip excluded patterns
        if (options.exclude_patterns?.includes(pattern.id)) {
          continue;
        }

        // Filter by focus areas
        if (options.focus_areas && options.focus_areas.length > 0) {
          const hasMatchingArea = options.focus_areas.some(area =>
            pattern.metadata.category === area ||
            pattern.metadata.tags.includes(area)
          );
          if (!hasMatchingArea) {
            continue;
          }
        }

        const match = await this.matchPattern(code, pattern, ast, options);
        
        if (match && match.match_score >= (options.min_match_score || 0.3)) {
          matches.push(match);
        }
      }

      // Sort by match score and limit results
      const sortedMatches = matches
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, options.max_results || 20);

      this.logger.debug('Pattern analysis completed', {
        totalMatches: matches.length,
        returnedMatches: sortedMatches.length,
        avgScore: sortedMatches.length > 0 
          ? sortedMatches.reduce((sum, m) => sum + m.match_score, 0) / sortedMatches.length 
          : 0
      });

      return sortedMatches;
    } catch (error) {
      this.logger.error('Failed to analyze code patterns', error as Error);
      throw error;
    }
  }

  /**
   * Find similar patterns to given code
   */
  async findSimilarPatterns(
    code: string,
    maxResults: number = 10,
    minSimilarity: number = 0.6
  ): Promise<IPatternMatch[]> {
    try {
      this.logger.debug('Finding similar patterns', {
        codeLength: code.length,
        maxResults,
        minSimilarity
      });

      const matches: IPatternMatch[] = [];

      for (const pattern of this.knownPatterns.values()) {
        const similarity = await this.calculateSimilarity(code, pattern.pattern_code);
        
        if (similarity >= minSimilarity) {
          matches.push({
            pattern,
            match_score: similarity,
            confidence: this.calculateConfidence(similarity, pattern),
            matched_segments: await this.findMatchedSegments(code, pattern.pattern_code),
            improvements: [],
            compliance_issues: [],
            explanation: this.generateSimilarityExplanation(similarity, pattern)
          });
        }
      }

      const sortedMatches = matches
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, maxResults);

      this.logger.debug('Similar patterns found', {
        count: sortedMatches.length,
        avgSimilarity: sortedMatches.length > 0
          ? sortedMatches.reduce((sum, m) => sum + m.match_score, 0) / sortedMatches.length
          : 0
      });

      return sortedMatches;
    } catch (error) {
      this.logger.error('Failed to find similar patterns', error as Error);
      throw error;
    }
  }

  /**
   * Detect Norwegian compliance issues
   */
  async detectComplianceIssues(
    code: string,
    locale: LocaleCode = 'nb-NO'
  ): Promise<IComplianceIssue[]> {
    try {
      this.logger.debug('Detecting compliance issues', {
        codeLength: code.length,
        locale
      });

      const issues: IComplianceIssue[] = [];

      // Check NSM classification patterns
      const nsmIssues = await this.checkNSMCompliance(code);
      issues.push(...nsmIssues);

      // Check GDPR compliance patterns
      const gdprIssues = await this.checkGDPRCompliance(code);
      issues.push(...gdprIssues);

      // Check WCAG accessibility patterns
      const wcagIssues = await this.checkWCAGCompliance(code);
      issues.push(...wcagIssues);

      // Sort by severity
      const sortedIssues = issues.sort((a, b) => {
        const severityOrder = { 'critical': 4, 'error': 3, 'warning': 2, 'info': 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });

      this.logger.debug('Compliance issues detected', {
        totalIssues: sortedIssues.length,
        critical: sortedIssues.filter(i => i.severity === 'critical').length,
        errors: sortedIssues.filter(i => i.severity === 'error').length,
        warnings: sortedIssues.filter(i => i.severity === 'warning').length
      });

      return sortedIssues;
    } catch (error) {
      this.logger.error('Failed to detect compliance issues', error as Error);
      throw error;
    }
  }

  /**
   * Add custom pattern
   */
  addPattern(pattern: ICodePattern): void {
    this.knownPatterns.set(pattern.id, pattern);
    
    this.logger.debug('Pattern added', {
      id: pattern.id,
      name: pattern.name,
      type: pattern.type
    });

    this.emit('patternAdded', pattern);
  }

  /**
   * Remove pattern
   */
  removePattern(patternId: string): boolean {
    const removed = this.knownPatterns.delete(patternId);
    
    if (removed) {
      this.logger.debug('Pattern removed', { id: patternId });
      this.emit('patternRemoved', patternId);
    }
    
    return removed;
  }

  /**
   * Get all patterns
   */
  getPatterns(): ICodePattern[] {
    return Array.from(this.knownPatterns.values());
  }

  /**
   * Get pattern by ID
   */
  getPattern(id: string): ICodePattern | undefined {
    return this.knownPatterns.get(id);
  }

  /**
   * Clear pattern cache
   */
  clearCache(): void {
    this.astCache.clear();
    this.logger.info('Pattern matcher cache cleared');
  }

  // === Private Helper Methods ===

  private async loadBuiltInPatterns(): Promise<void> {
    // Load Norwegian compliance patterns
    const nsmPattern: ICodePattern = {
      id: 'nsm-classification-pattern',
      name: 'NSM Security Classification',
      description: 'Norwegian NSM security classification pattern',
      type: 'compliance',
      language: 'typescript',
      pattern_code: `
interface NorwegianCompliance {
  nsmClassification: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  gdprCompliant: boolean;
  wcagLevel: 'A' | 'AA' | 'AAA';
}
      `.trim(),
      metadata: {
        category: 'compliance',
        tags: ['nsm', 'security', 'norwegian', 'classification'],
        quality_score: 0.95,
        usage_count: 0,
        complexity: 2,
        maintainability: 0.9,
        security_score: 0.98,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: 'Xala Enterprise',
        source: 'built-in'
      },
      examples: [
        'const compliance: NorwegianCompliance = { nsmClassification: "RESTRICTED", gdprCompliant: true, wcagLevel: "AAA" };'
      ],
      related_patterns: ['gdpr-compliance-pattern', 'wcag-accessibility-pattern'],
      compliance: {
        nsmClassification: 'OPEN',
        gdprCompliant: true,
        wcagLevel: 'AAA',
        supportedLanguages: ['nb-NO', 'en-US'],
        auditTrail: true
      }
    };

    // Load SOLID principles pattern
    const solidPattern: ICodePattern = {
      id: 'solid-single-responsibility',
      name: 'Single Responsibility Principle',
      description: 'Class or function with single responsibility',
      type: 'best-practice',
      language: 'typescript',
      pattern_code: `
export class UserService {
  constructor(private userRepository: IUserRepository) {}
  
  async createUser(userData: CreateUserRequest): Promise<User> {
    // Single responsibility: user creation
    return this.userRepository.create(userData);
  }
}
      `.trim(),
      metadata: {
        category: 'architecture',
        tags: ['solid', 'srp', 'best-practice', 'clean-code'],
        quality_score: 0.9,
        usage_count: 0,
        complexity: 3,
        maintainability: 0.95,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: 'Xala Enterprise',
        source: 'built-in'
      },
      examples: [],
      related_patterns: ['dependency-injection-pattern']
    };

    // Add patterns to collection
    this.knownPatterns.set(nsmPattern.id, nsmPattern);
    this.knownPatterns.set(solidPattern.id, solidPattern);

    this.logger.debug('Built-in patterns loaded', {
      count: this.knownPatterns.size
    });
  }

  private async initializeASTParser(): Promise<void> {
    // In a real implementation, this would initialize a TypeScript AST parser
    // For now, we'll create a simple mock parser
    this.logger.debug('AST parser initialized');
  }

  private async parseAST(code: string): Promise<IASTNode> {
    // Check cache first
    const cacheKey = this.hashCode(code);
    if (this.astCache.has(cacheKey)) {
      return this.astCache.get(cacheKey)!;
    }

    // Simple mock AST parsing for demonstration
    // In production, use @typescript-eslint/parser or similar
    const ast: IASTNode = {
      type: 'Program',
      children: [
        {
          type: 'FunctionDeclaration',
          name: 'mockFunction',
          children: [],
          start_pos: { line: 1, column: 1 },
          end_pos: { line: 10, column: 1 },
          metadata: { language: 'typescript' }
        }
      ],
      start_pos: { line: 1, column: 1 },
      end_pos: { line: code.split('\n').length, column: 1 },
      metadata: { language: 'typescript' }
    };

    // Cache the result
    this.astCache.set(cacheKey, ast);

    return ast;
  }

  private async matchPattern(
    code: string,
    pattern: ICodePattern,
    ast?: IASTNode,
    options: IPatternAnalysisOptions = {}
  ): Promise<IPatternMatch | null> {
    try {
      // Calculate similarity scores
      const textSimilarity = await this.calculateTextSimilarity(code, pattern.pattern_code);
      const structuralSimilarity = ast ? await this.calculateStructuralSimilarity(ast, pattern) : 0;
      const semanticSimilarity = options.include_semantic_analysis 
        ? await this.calculateSemanticSimilarity(code, pattern) 
        : 0;

      // Weighted combined score
      const matchScore = (
        textSimilarity * 0.4 +
        structuralSimilarity * 0.3 +
        semanticSimilarity * 0.3
      );

      if (matchScore < 0.1) {
        return null;
      }

      // Find matched segments
      const matchedSegments = await this.findMatchedSegments(code, pattern.pattern_code);

      // Generate improvements
      const improvements = await this.generateImprovements(code, pattern);

      // Check compliance if requested
      const complianceIssues = options.include_compliance_check 
        ? await this.detectComplianceIssues(code, options.target_locale)
        : [];

      return {
        pattern,
        match_score: matchScore,
        confidence: this.calculateConfidence(matchScore, pattern),
        matched_segments: matchedSegments,
        improvements,
        compliance_issues: complianceIssues,
        explanation: this.generateMatchExplanation(matchScore, pattern, matchedSegments)
      };
    } catch (error) {
      this.logger.warn('Error matching pattern', {
        patternId: pattern.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  private async calculateSimilarity(code1: string, code2: string): Promise<number> {
    // Simple Levenshtein distance-based similarity
    const distance = this.levenshteinDistance(code1, code2);
    const maxLength = Math.max(code1.length, code2.length);
    return maxLength > 0 ? 1 - (distance / maxLength) : 1;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,        // deletion
          matrix[j - 1][i] + 1,        // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private async calculateTextSimilarity(code: string, pattern: string): Promise<number> {
    // Normalize code for comparison
    const normalizedCode = this.normalizeCode(code);
    const normalizedPattern = this.normalizeCode(pattern);
    
    return this.calculateSimilarity(normalizedCode, normalizedPattern);
  }

  private async calculateStructuralSimilarity(ast: IASTNode, pattern: ICodePattern): Promise<number> {
    // Mock structural similarity based on AST node types
    // In production, this would compare AST structures
    return 0.5; // Placeholder
  }

  private async calculateSemanticSimilarity(code: string, pattern: ICodePattern): Promise<number> {
    // Mock semantic similarity
    // In production, this would use embeddings or semantic analysis
    return 0.6; // Placeholder
  }

  private calculateConfidence(matchScore: number, pattern: ICodePattern): number {
    // Factor in pattern quality and usage
    const qualityWeight = pattern.metadata.quality_score * 0.3;
    const usageWeight = Math.min(pattern.metadata.usage_count / 100, 1) * 0.2;
    const matchWeight = matchScore * 0.5;
    
    return Math.min(1.0, qualityWeight + usageWeight + matchWeight);
  }

  private async findMatchedSegments(code: string, pattern: string): Promise<IMatchedSegment[]> {
    const segments: IMatchedSegment[] = [];
    const codeLines = code.split('\n');
    const patternLines = pattern.split('\n');

    // Simple line-by-line matching
    for (let i = 0; i < codeLines.length; i++) {
      for (let j = 0; j < patternLines.length; j++) {
        const similarity = await this.calculateSimilarity(codeLines[i], patternLines[j]);
        
        if (similarity > 0.7) {
          segments.push({
            start_line: i + 1,
            end_line: i + 1,
            start_column: 1,
            end_column: codeLines[i].length + 1,
            code: codeLines[i],
            match_type: similarity > 0.95 ? 'identical' : 'similar',
            similarity_score: similarity
          });
        }
      }
    }

    return segments;
  }

  private async generateImprovements(code: string, pattern: ICodePattern): Promise<IImprovement[]> {
    const improvements: IImprovement[] = [];

    // Check for Norwegian compliance improvements
    if (pattern.compliance) {
      if (!code.includes('nsmClassification')) {
        improvements.push({
          type: 'compliance',
          priority: 'high',
          description: 'Add NSM security classification',
          reasoning: 'Norwegian compliance requires NSM classification for all sensitive data',
          compliance_requirement: 'NSM Basic Security Principles'
        });
      }

      if (!code.includes('gdprCompliant')) {
        improvements.push({
          type: 'compliance',
          priority: 'high',
          description: 'Add GDPR compliance indicator',
          reasoning: 'GDPR compliance must be explicitly declared for data processing',
          compliance_requirement: 'GDPR Article 5'
        });
      }
    }

    return improvements;
  }

  private async checkNSMCompliance(code: string): Promise<IComplianceIssue[]> {
    const issues: IComplianceIssue[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for hardcoded sensitive data
      if (line.includes('password') || line.includes('secret') || line.includes('key')) {
        if (line.includes('=') && !line.includes('process.env')) {
          issues.push({
            type: 'nsm',
            severity: 'critical',
            description: 'Hardcoded sensitive data detected',
            location: { line: i + 1, column: line.indexOf('=') },
            rule: 'NSM-SEC-001',
            solution: 'Use environment variables or secure configuration',
            documentation_url: 'https://nsm.no/regelverk/grunnprinsipper-for-ikt-sikkerhet'
          });
        }
      }
    }

    return issues;
  }

  private async checkGDPRCompliance(code: string): Promise<IComplianceIssue[]> {
    const issues: IComplianceIssue[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for personal data handling
      if (line.includes('email') || line.includes('name') || line.includes('address')) {
        if (!code.includes('gdprCompliant') && !code.includes('consent')) {
          issues.push({
            type: 'gdpr',
            severity: 'error',
            description: 'Personal data handling without GDPR compliance check',
            location: { line: i + 1, column: 0 },
            rule: 'GDPR-ART-6',
            solution: 'Add GDPR compliance validation and consent management',
            documentation_url: 'https://gdpr.eu/article-6-how-to-process-personal-data-legally'
          });
        }
      }
    }

    return issues;
  }

  private async checkWCAGCompliance(code: string): Promise<IComplianceIssue[]> {
    const issues: IComplianceIssue[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for accessibility attributes
      if (line.includes('<button') || line.includes('<input')) {
        if (!line.includes('aria-label') && !line.includes('aria-describedby')) {
          issues.push({
            type: 'wcag',
            severity: 'warning',
            description: 'Interactive element missing accessibility labels',
            location: { line: i + 1, column: 0 },
            rule: 'WCAG-4.1.2',
            solution: 'Add aria-label or aria-describedby attributes',
            documentation_url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html'
          });
        }
      }
    }

    return issues;
  }

  private normalizeCode(code: string): string {
    return code
      .replace(/\s+/g, ' ')           // Normalize whitespace
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '')        // Remove line comments
      .trim()
      .toLowerCase();
  }

  private generateMatchExplanation(
    matchScore: number,
    pattern: ICodePattern,
    segments: IMatchedSegment[]
  ): string {
    const explanations: string[] = [];

    if (matchScore > 0.8) {
      explanations.push('High similarity to known pattern');
    } else if (matchScore > 0.6) {
      explanations.push('Good match with some variations');
    } else {
      explanations.push('Partial match detected');
    }

    if (segments.length > 0) {
      explanations.push(`${segments.length} matching code segments found`);
    }

    if (pattern.type === 'compliance') {
      explanations.push('Norwegian compliance pattern detected');
    }

    return explanations.join('. ');
  }

  private generateSimilarityExplanation(similarity: number, pattern: ICodePattern): string {
    if (similarity > 0.9) return `Very high similarity (${(similarity * 100).toFixed(1)}%) - nearly identical to ${pattern.name}`;
    if (similarity > 0.8) return `High similarity (${(similarity * 100).toFixed(1)}%) - closely matches ${pattern.name}`;
    if (similarity > 0.7) return `Good similarity (${(similarity * 100).toFixed(1)}%) - similar approach to ${pattern.name}`;
    return `Moderate similarity (${(similarity * 100).toFixed(1)}%) - related to ${pattern.name}`;
  }

  private hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}