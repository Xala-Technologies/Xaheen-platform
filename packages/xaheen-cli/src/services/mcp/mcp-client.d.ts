/**
 * MCP (Model Context Protocol) Client Integration
 *
 * Integrates with Xala UI Component Specification System for AI-optimized template generation.
 *
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */
export interface ComponentSpecification {
    metadata: {
        name: string;
        version: string;
        category: "basic" | "composite" | "layout" | "navigation" | "feedback" | "overlay" | "form" | "data-display" | "specialized";
        description: string;
        keywords?: string[];
        stability: "experimental" | "beta" | "stable" | "deprecated";
    };
    compliance: {
        wcag: {
            level: "A" | "AA" | "AAA";
        };
        norwegian: {
            nsmClassification: "OPEN" | "RESTRICTED" | "CONFIDENTIAL" | "SECRET";
        };
        i18n: {
            supportedLocales: string[];
        };
    };
    props: {
        schema: Record<string, PropDefinition>;
        groups: PropGroups;
    };
    accessibility: {
        role: {
            primary: string;
        };
        keyboardNavigation: KeyboardNavigation;
        screenReader: ScreenReaderSupport;
    };
    platforms: {
        supported: string[];
        implementations: Record<string, PlatformImplementation>;
    };
    ai?: AIOptimization;
}
export interface PropDefinition {
    type: string;
    description?: string;
    required?: boolean;
    default?: any;
    enum?: string[];
    signature?: string;
}
export interface PropGroups {
    required?: string[];
    optional?: string[];
    advanced?: string[];
}
export interface KeyboardNavigation {
    supported: boolean;
    patterns?: Array<{
        key: string;
        action: string;
    }>;
}
export interface ScreenReaderSupport {
    announcements?: string[];
    labels?: Record<string, string>;
}
export interface PlatformImplementation {
    dependencies?: string[];
    imports?: string[];
    ai?: {
        hints?: string[];
        patterns?: Array<{
            pattern: string;
            context: string;
            recommendation: string;
        }>;
    };
}
export interface AIOptimization {
    optimization: {
        hints: string[];
        patterns: Array<{
            pattern: string;
            context: string;
            recommendation: string;
        }>;
        antiPatterns: Array<{
            pattern: string;
            reason: string;
            alternative: string;
        }>;
    };
    generation: {
        priority: "low" | "medium" | "high";
        complexity: "simple" | "medium" | "complex";
        estimatedTokens: number;
    };
    documentation?: {
        autoGenerate: boolean;
        templates: string[];
    };
}
export interface MCPGenerationOptions {
    platform: string;
    includeTests?: boolean;
    includeStories?: boolean;
    includeDocs?: boolean;
    aiOptimized?: boolean;
    complexity?: "simple" | "medium" | "complex";
    nsmClassification?: "OPEN" | "RESTRICTED" | "CONFIDENTIAL" | "SECRET";
}
export interface MCPGenerationResult {
    success: boolean;
    component: string;
    files: Array<{
        path: string;
        content: string;
        type: "component" | "test" | "story" | "docs";
    }>;
    metadata: {
        tokensUsed: number;
        complexity: string;
        aiHints: string[];
        complianceLevel: string;
    };
    errors?: string[];
    warnings?: string[];
}
export declare class MCPClient {
    private specCache;
    private mcpPath;
    constructor();
    /**
     * Load component specification from MCP system
     */
    loadSpecification(componentName: string, category?: string): Promise<ComponentSpecification | null>;
    /**
     * Get AI optimization hints for component generation
     */
    getAIHints(componentName: string, platform?: string): Promise<string[]>;
    /**
     * Get complexity estimation for token usage planning
     */
    getComplexityEstimation(componentName: string): Promise<{
        complexity: "simple" | "medium" | "complex";
        estimatedTokens: number;
        priority: "low" | "medium" | "high";
    }>;
    /**
     * Get component patterns and anti-patterns
     */
    getPatterns(componentName: string): Promise<{
        patterns: Array<{
            pattern: string;
            context: string;
            recommendation: string;
        }>;
        antiPatterns: Array<{
            pattern: string;
            reason: string;
            alternative: string;
        }>;
    }>;
    /**
     * Generate enhanced template context with MCP data
     */
    enhanceTemplateContext(context: any, componentName?: string): Promise<any>;
    /**
     * Validate component against MCP specifications
     */
    validateComponent(componentCode: string, componentName: string): Promise<{
        valid: boolean;
        score: number;
        issues: Array<{
            type: "error" | "warning" | "info";
            message: string;
            line?: number;
            suggestion?: string;
        }>;
    }>;
    /**
     * Get available component specifications
     */
    getAvailableSpecs(): Promise<Array<{
        name: string;
        category: string;
        path: string;
    }>>;
    private findSpecificationPath;
    private getDefaultAIHints;
    private estimateComplexity;
}
export declare const mcpClient: MCPClient;
//# sourceMappingURL=mcp-client.d.ts.map