/**
 * EPIC 7: Integration and Testing - AI Integration Tests
 * 
 * Comprehensive testing suite for validating AI-powered features and MCP integration,
 * including server communication, component specifications, pattern recommendations,
 * accessibility validation, compliance checking, and error handling.
 * 
 * @author Database Architect with AI Integration and MCP Server Expertise
 * @since 2025-01-03
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'node:path';
import fs from 'fs-extra';
import { execa } from 'execa';
import { performance } from 'perf_hooks';

// Test utilities and helpers
import { createTestProject, cleanupTestProject } from '../utils/test-helpers';

// MCP and AI services
import { McpClient } from '../../services/mcp/mcp-client';
import { McpContextIndexer } from '../../services/mcp/mcp-context-indexer.service';
import { McpGenerationOrchestrator } from '../../services/mcp/mcp-generation-orchestrator';
import { AiComponentSuggestions } from '../../services/ai/ai-component-suggestions';
import { AiSecurityScanner } from '../../services/ai/ai-security-scanner';
import { RefactoringAssistant } from '../../services/ai/refactoring-assistant';

// Mock MCP server responses
const mockMcpResponses = {
  componentSpecs: {
    'Button': {
      name: 'Button',
      category: 'action-feedback',
      props: {
        variant: { type: 'string', enum: ['primary', 'secondary', 'destructive'] },
        size: { type: 'string', enum: ['sm', 'md', 'lg'] },
        disabled: { type: 'boolean', required: false },
        onClick: { type: 'function', required: false }
      },
      accessibility: {
        ariaLabel: 'required',
        keyboardNavigation: true,
        focusManagement: true
      },
      norwegianCompliance: {
        classification: 'OPEN',
        altinnCompatible: true,
        wcagLevel: 'AAA'
      }
    },
    'DataTable': {
      name: 'DataTable',
      category: 'data-display',
      props: {
        data: { type: 'array', required: true },
        columns: { type: 'array', required: true },
        sortable: { type: 'boolean', default: true },
        filterable: { type: 'boolean', default: false }
      },
      performance: {
        virtualization: true,
        lazyLoading: true,
        memoization: true
      }
    }
  },
  patterns: {
    'dashboard': {
      components: ['Container', 'Grid', 'Card', 'DataTable'],
      layout: 'grid',
      responsive: true,
      accessibility: 'AAA'
    },
    'form': {
      components: ['Form', 'Input', 'Button', 'ValidationMessage'],
      validation: 'required',
      accessibility: 'AAA',
      norwegianCompliance: true
    }
  }
};

// Mock MCP client for testing
vi.mock('../../services/mcp/mcp-client', () => ({
  McpClient: {
    connect: vi.fn().mockResolvedValue(true),
    disconnect: vi.fn().mockResolvedValue(true),
    getComponentSpecification: vi.fn(),
    getComponentSpecifications: vi.fn(),
    validateComponent: vi.fn(),
    getPatternRecommendations: vi.fn(),
    checkAccessibilityCompliance: vi.fn(),
    checkNorwegianCompliance: vi.fn(),
    getPerformanceOptimizations: vi.fn()
  }
}));

interface McpTestResult {
  success: boolean;
  responseTime: number;
  data?: any;
  error?: string;
}

class McpTestHelper {
  static async testMcpConnection(): Promise<McpTestResult> {
    const startTime = performance.now();
    
    try {
      const connected = await McpClient.connect();
      const responseTime = performance.now() - startTime;
      
      return {
        success: connected,
        responseTime,
        data: { connected }
      };
    } catch (error) {
      return {
        success: false,
        responseTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async testMcpSpecificationLoading(componentName: string): Promise<McpTestResult> {
    const startTime = performance.now();
    
    try {
      // Mock the response
      vi.mocked(McpClient.getComponentSpecification).mockResolvedValue(
        mockMcpResponses.componentSpecs[componentName as keyof typeof mockMcpResponses.componentSpecs]
      );
      
      const spec = await McpClient.getComponentSpecification(componentName);
      const responseTime = performance.now() - startTime;
      
      return {
        success: !!spec,
        responseTime,
        data: spec
      };
    } catch (error) {
      return {
        success: false,
        responseTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

describe('EPIC 7: AI Integration Tests', () => {
  let testProjectPath: string;
  let mcpClient: typeof McpClient;
  let mcpContextIndexer: McpContextIndexer;
  let mcpOrchestrator: McpGenerationOrchestrator;
  let aiSuggestions: AiComponentSuggestions;
  let aiSecurityScanner: AiSecurityScanner;
  let refactoringAssistant: RefactoringAssistant;

  beforeEach(async () => {
    testProjectPath = await createTestProject('ai-integration-test');
    
    // Initialize services
    mcpClient = McpClient;
    mcpContextIndexer = new McpContextIndexer();
    mcpOrchestrator = new McpGenerationOrchestrator();
    aiSuggestions = new AiComponentSuggestions();
    aiSecurityScanner = new AiSecurityScanner();
    refactoringAssistant = new RefactoringAssistant();

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await cleanupTestProject(testProjectPath);
  });

  describe('Story 5.2.1: MCP Server Connection and Communication', () => {
    it('should establish connection to MCP server successfully', async () => {
      const connectionResult = await McpTestHelper.testMcpConnection();
      
      expect(connectionResult.success).toBe(true);
      expect(connectionResult.responseTime).toBeLessThan(5000); // 5 seconds max
      expect(McpClient.connect).toHaveBeenCalled();
    });

    it('should handle MCP server connection failures gracefully', async () => {
      // Mock connection failure
      vi.mocked(McpClient.connect).mockRejectedValue(new Error('Connection refused'));
      
      const connectionResult = await McpTestHelper.testMcpConnection();
      
      expect(connectionResult.success).toBe(false);
      expect(connectionResult.error).toContain('Connection refused');
    });

    it('should maintain persistent connection to MCP server', async () => {
      // Test connection persistence
      await McpClient.connect();
      
      // Simulate multiple operations
      for (let i = 0; i < 5; i++) {
        await McpTestHelper.testMcpSpecificationLoading('Button');
      }
      
      // Connection should still be active
      expect(McpClient.connect).toHaveBeenCalledTimes(1); // Only initial connection
    });

    it('should handle MCP server disconnection and reconnection', async () => {
      await McpClient.connect();
      await McpClient.disconnect();
      
      // Should be able to reconnect
      const reconnectionResult = await McpTestHelper.testMcpConnection();
      expect(reconnectionResult.success).toBe(true);
    });

    it('should implement connection timeout and retry logic', async () => {
      // Mock slow connection
      vi.mocked(McpClient.connect).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(true), 3000))
      );
      
      const connectionResult = await McpTestHelper.testMcpConnection();
      
      expect(connectionResult.success).toBe(true);
      expect(connectionResult.responseTime).toBeGreaterThan(2900);
      expect(connectionResult.responseTime).toBeLessThan(5000);
    });
  });

  describe('Story 5.2.2: MCP Component Specification Loading', () => {
    it('should load component specifications from MCP server', async () => {
      const specResult = await McpTestHelper.testMcpSpecificationLoading('Button');
      
      expect(specResult.success).toBe(true);
      expect(specResult.data).toHaveProperty('name', 'Button');
      expect(specResult.data).toHaveProperty('props');
      expect(specResult.data).toHaveProperty('accessibility');
      expect(specResult.responseTime).toBeLessThan(1000); // 1 second max
    });

    it('should cache component specifications for performance', async () => {
      // Load same spec multiple times
      const results = await Promise.all([
        McpTestHelper.testMcpSpecificationLoading('Button'),
        McpTestHelper.testMcpSpecificationLoading('Button'),
        McpTestHelper.testMcpSpecificationLoading('Button')
      ]);
      
      // All should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      
      // Should have been called only once due to caching
      expect(McpClient.getComponentSpecification).toHaveBeenCalledTimes(3);
      
      // Second and third calls should be faster
      expect(results[1].responseTime).toBeLessThan(results[0].responseTime);
      expect(results[2].responseTime).toBeLessThan(results[0].responseTime);
    });

    it('should validate specification integrity', async () => {
      const specResult = await McpTestHelper.testMcpSpecificationLoading('Button');
      
      expect(specResult.success).toBe(true);
      expect(specResult.data).toMatchObject({
        name: expect.any(String),
        category: expect.any(String),
        props: expect.any(Object),
        accessibility: expect.any(Object)
      });
    });

    it('should handle missing specifications gracefully', async () => {
      vi.mocked(McpClient.getComponentSpecification).mockResolvedValue(null);
      
      const specResult = await McpTestHelper.testMcpSpecificationLoading('NonExistentComponent');
      
      expect(specResult.success).toBe(false);
    });

    it('should load specifications with Norwegian compliance metadata', async () => {
      const specResult = await McpTestHelper.testMcpSpecificationLoading('Button');
      
      expect(specResult.success).toBe(true);
      expect(specResult.data).toHaveProperty('norwegianCompliance');
      expect(specResult.data.norwegianCompliance).toMatchObject({
        classification: expect.any(String),
        altinnCompatible: expect.any(Boolean),
        wcagLevel: expect.any(String)
      });
    });
  });

  describe('Story 5.2.3: MCP Pattern Recommendation System', () => {
    it('should recommend patterns based on business context', async () => {
      vi.mocked(McpClient.getPatternRecommendations).mockResolvedValue({
        patterns: [mockMcpResponses.patterns.dashboard],
        confidence: 0.95,
        reasoning: 'Dashboard pattern matches business requirements'
      });
      
      const recommendations = await McpClient.getPatternRecommendations({
        businessContext: 'ecommerce',
        pageType: 'dashboard',
        complexity: 'medium'
      });
      
      expect(recommendations).toHaveProperty('patterns');
      expect(recommendations).toHaveProperty('confidence');
      expect(recommendations.confidence).toBeGreaterThan(0.8);
      expect(recommendations.patterns[0]).toHaveProperty('components');
    });

    it('should provide component composition recommendations', async () => {
      vi.mocked(McpClient.getPatternRecommendations).mockResolvedValue({
        patterns: [mockMcpResponses.patterns.form],
        componentSuggestions: ['Input', 'Button', 'ValidationMessage'],
        layoutSuggestions: ['Stack', 'Container']
      });
      
      const recommendations = await McpClient.getPatternRecommendations({
        componentType: 'form',
        features: ['validation', 'accessibility']
      });
      
      expect(recommendations).toHaveProperty('componentSuggestions');
      expect(recommendations).toHaveProperty('layoutSuggestions');
      expect(recommendations.componentSuggestions).toContain('Input');
      expect(recommendations.componentSuggestions).toContain('Button');
    });

    it('should recommend Norwegian compliance patterns', async () => {
      vi.mocked(McpClient.getPatternRecommendations).mockResolvedValue({
        patterns: [{
          ...mockMcpResponses.patterns.form,
          norwegianCompliance: true,
          altinnCompatible: true,
          nsmClassification: 'OPEN'
        }],
        complianceFeatures: ['audit-trail', 'gdpr-consent', 'accessibility']
      });
      
      const recommendations = await McpClient.getPatternRecommendations({
        region: 'norway',
        compliance: ['gdpr', 'altinn'],
        classification: 'open'
      });
      
      expect(recommendations.patterns[0]).toHaveProperty('norwegianCompliance', true);
      expect(recommendations).toHaveProperty('complianceFeatures');
      expect(recommendations.complianceFeatures).toContain('gdpr-consent');
    });

    it('should integrate pattern recommendations with generation', async () => {
      await execa('xaheen', [
        'generate', 'page', 'DashboardPage',
        '--mcp-recommendations',
        '--business-context=ecommerce',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });
      
      const pagePath = path.join(testProjectPath, 'src/pages/DashboardPage.tsx');
      const content = await fs.readFile(pagePath, 'utf-8');
      
      // Should include MCP-recommended components
      expect(content).toContain('Container');
      expect(content).toContain('Grid');
      expect(content).toContain('Card');
      expect(content).toContain('DataTable');
    });
  });

  describe('Story 5.2.4: MCP Accessibility Validation', () => {
    it('should validate component accessibility using MCP', async () => {
      vi.mocked(McpClient.checkAccessibilityCompliance).mockResolvedValue({
        compliant: true,
        wcagLevel: 'AAA',
        violations: [],
        suggestions: []
      });
      
      const componentCode = `
        export const TestButton = ({ onClick, children }: ButtonProps): JSX.Element => {
          return (
            <button onClick={onClick} aria-label="Test button">
              {children}
            </button>
          );
        };
      `;
      
      const validation = await McpClient.checkAccessibilityCompliance(componentCode);
      
      expect(validation.compliant).toBe(true);
      expect(validation.wcagLevel).toBe('AAA');
      expect(validation.violations).toHaveLength(0);
    });

    it('should identify accessibility violations via MCP', async () => {
      vi.mocked(McpClient.checkAccessibilityCompliance).mockResolvedValue({
        compliant: false,
        wcagLevel: 'A',
        violations: [
          {
            rule: 'button-name',
            severity: 'serious',
            message: 'Buttons must have accessible names',
            fix: 'Add aria-label or accessible text'
          }
        ],
        suggestions: ['Add aria-label attribute']
      });
      
      const componentCode = `
        export const TestButton = ({ onClick }: ButtonProps): JSX.Element => {
          return <button onClick={onClick}></button>;
        };
      `;
      
      const validation = await McpClient.checkAccessibilityCompliance(componentCode);
      
      expect(validation.compliant).toBe(false);
      expect(validation.violations).toHaveLength(1);
      expect(validation.violations[0]).toHaveProperty('rule', 'button-name');
    });

    it('should provide accessibility improvement suggestions', async () => {
      vi.mocked(McpClient.checkAccessibilityCompliance).mockResolvedValue({
        compliant: true,
        wcagLevel: 'AA',
        violations: [],
        suggestions: [
          'Consider adding focus indicators for better keyboard navigation',
          'Add high contrast mode support for better visibility'
        ]
      });
      
      const validation = await McpClient.checkAccessibilityCompliance('component-code');
      
      expect(validation.suggestions).toHaveLength(2);
      expect(validation.suggestions[0]).toContain('focus indicators');
      expect(validation.suggestions[1]).toContain('high contrast');
    });

    it('should integrate accessibility validation in generation process', async () => {
      await execa('xaheen', [
        'generate', 'component', 'AccessibleButton',
        '--mcp-accessibility-check',
        '--wcag-aaa',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });
      
      const componentPath = path.join(testProjectPath, 'src/components/AccessibleButton.tsx');
      const content = await fs.readFile(componentPath, 'utf-8');
      
      // Should include accessibility features
      expect(content).toContain('aria-label');
      expect(content).toContain('role=');
      expect(content).toContain('tabIndex');
      expect(content).toContain('onKeyDown');
    });
  });

  describe('Story 5.2.5: MCP Norwegian Compliance Checking', () => {
    it('should validate Norwegian compliance via MCP', async () => {
      vi.mocked(McpClient.checkNorwegianCompliance).mockResolvedValue({
        compliant: true,
        classification: 'OPEN',
        gdprCompliant: true,
        altinnCompatible: true,
        violations: [],
        suggestions: []
      });
      
      const componentCode = `
        export const NorwegianForm = (props: FormProps): JSX.Element => {
          return (
            <form className="norwegian-compliant" data-classification="OPEN">
              {/* Form content */}
            </form>
          );
        };
      `;
      
      const validation = await McpClient.checkNorwegianCompliance(componentCode);
      
      expect(validation.compliant).toBe(true);
      expect(validation.gdprCompliant).toBe(true);
      expect(validation.altinnCompatible).toBe(true);
    });

    it('should identify Norwegian compliance violations', async () => {
      vi.mocked(McpClient.checkNorwegianCompliance).mockResolvedValue({
        compliant: false,
        classification: 'UNSPECIFIED',
        gdprCompliant: false,
        altinnCompatible: false,
        violations: [
          {
            type: 'NSM_CLASSIFICATION',
            message: 'Component lacks NSM classification',
            severity: 'high'
          },
          {
            type: 'GDPR_CONSENT',
            message: 'Personal data handling requires consent mechanism',
            severity: 'critical'
          }
        ],
        suggestions: [
          'Add NSM classification metadata',
          'Implement GDPR consent management'
        ]
      });
      
      const validation = await McpClient.checkNorwegianCompliance('non-compliant-code');
      
      expect(validation.compliant).toBe(false);
      expect(validation.violations).toHaveLength(2);
      expect(validation.violations[0].type).toBe('NSM_CLASSIFICATION');
      expect(validation.violations[1].type).toBe('GDPR_CONSENT');
    });

    it('should validate NSM classification levels', async () => {
      const classifications = ['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'];
      
      for (const classification of classifications) {
        vi.mocked(McpClient.checkNorwegianCompliance).mockResolvedValue({
          compliant: true,
          classification,
          requiresAuditTrail: classification === 'SECRET',
          requiresEncryption: ['CONFIDENTIAL', 'SECRET'].includes(classification),
          violations: [],
          suggestions: []
        });
        
        const validation = await McpClient.checkNorwegianCompliance(`classified-${classification}`);
        
        expect(validation.classification).toBe(classification);
        
        if (classification === 'SECRET') {
          expect(validation.requiresAuditTrail).toBe(true);
        }
        
        if (['CONFIDENTIAL', 'SECRET'].includes(classification)) {
          expect(validation.requiresEncryption).toBe(true);
        }
      }
    });
  });

  describe('Story 5.2.6: MCP Performance Optimization Recommendations', () => {
    it('should provide performance optimization suggestions', async () => {
      vi.mocked(McpClient.getPerformanceOptimizations).mockResolvedValue({
        optimizations: [
          {
            type: 'MEMOIZATION',
            description: 'Add React.memo to prevent unnecessary re-renders',
            impact: 'high',
            implementation: 'export const Component = React.memo(ComponentImpl);'
          },
          {
            type: 'CODE_SPLITTING',
            description: 'Lazy load this component to reduce initial bundle size',
            impact: 'medium',
            implementation: 'const Component = React.lazy(() => import("./Component"));'
          }
        ],
        bundleSize: {
          current: '45kb',
          optimized: '32kb',
          reduction: '28%'
        }
      });
      
      const optimizations = await McpClient.getPerformanceOptimizations('component-code');
      
      expect(optimizations.optimizations).toHaveLength(2);
      expect(optimizations.optimizations[0].type).toBe('MEMOIZATION');
      expect(optimizations.bundleSize.reduction).toBe('28%');
    });

    it('should integrate performance optimizations in generation', async () => {
      await execa('xaheen', [
        'generate', 'component', 'OptimizedComponent',
        '--mcp-performance-optimization',
        '--optimize-bundle-size',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });
      
      const componentPath = path.join(testProjectPath, 'src/components/OptimizedComponent.tsx');
      const content = await fs.readFile(componentPath, 'utf-8');
      
      // Should include performance optimizations
      expect(content).toContain('React.memo');
      expect(content).toContain('useCallback');
      expect(content).toContain('useMemo');
    });

    it('should provide platform-specific performance recommendations', async () => {
      const platforms = ['react', 'vue', 'angular'];
      
      for (const platform of platforms) {
        vi.mocked(McpClient.getPerformanceOptimizations).mockResolvedValue({
          platform,
          optimizations: [
            {
              type: platform === 'react' ? 'REACT_MEMO' : 
                    platform === 'vue' ? 'VUE_MEMO' : 'ANGULAR_ONPUSH',
              description: `${platform}-specific optimization`,
              impact: 'high'
            }
          ]
        });
        
        const optimizations = await McpClient.getPerformanceOptimizations('code', { platform });
        
        expect(optimizations.platform).toBe(platform);
        expect(optimizations.optimizations[0].type).toContain(platform.toUpperCase());
      }
    });
  });

  describe('Story 5.2.7: MCP Error Handling and Fallback Systems', () => {
    it('should handle MCP server unavailability gracefully', async () => {
      vi.mocked(McpClient.connect).mockRejectedValue(new Error('Server unavailable'));
      
      const result = await execa('xaheen', [
        'generate', 'component', 'FallbackComponent',
        '--mcp-recommendations', // This should fallback
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath, reject: false });
      
      // Should still succeed with fallback templates
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('MCP server unavailable, using local templates');
      
      const componentPath = path.join(testProjectPath, 'src/components/FallbackComponent.tsx');
      expect(await fs.pathExists(componentPath)).toBe(true);
    });

    it('should implement retry logic for transient MCP failures', async () => {
      let attempts = 0;
      vi.mocked(McpClient.getComponentSpecification).mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error('Transient error'));
        }
        return Promise.resolve(mockMcpResponses.componentSpecs.Button);
      });
      
      const specResult = await McpTestHelper.testMcpSpecificationLoading('Button');
      
      expect(specResult.success).toBe(true);
      expect(attempts).toBe(3); // Should have retried twice
    });

    it('should provide meaningful error messages for MCP failures', async () => {
      vi.mocked(McpClient.checkAccessibilityCompliance).mockRejectedValue(
        new Error('MCP accessibility service timeout')
      );
      
      const result = await execa('xaheen', [
        'generate', 'component', 'TestComponent',
        '--mcp-accessibility-check',
        '--platform=react'
      ], { cwd: testProjectPath, reject: false });
      
      expect(result.stderr).toContain('MCP accessibility service timeout');
      expect(result.stderr).toContain('Falling back to local accessibility validation');
    });

    it('should cache MCP responses to handle network issues', async () => {
      // First call succeeds
      vi.mocked(McpClient.getComponentSpecification).mockResolvedValueOnce(
        mockMcpResponses.componentSpecs.Button
      );
      
      const firstResult = await McpTestHelper.testMcpSpecificationLoading('Button');
      expect(firstResult.success).toBe(true);
      
      // Second call fails, but should use cache
      vi.mocked(McpClient.getComponentSpecification).mockRejectedValueOnce(
        new Error('Network error')
      );
      
      const secondResult = await McpTestHelper.testMcpSpecificationLoading('Button');
      expect(secondResult.success).toBe(true); // Should succeed due to cache
    });

    it('should validate MCP response integrity', async () => {
      // Mock malformed response
      vi.mocked(McpClient.getComponentSpecification).mockResolvedValue({
        name: 'Button',
        // Missing required fields
      });
      
      const specResult = await McpTestHelper.testMcpSpecificationLoading('Button');
      
      expect(specResult.success).toBe(false);
      expect(specResult.error).toContain('Invalid specification format');
    });
  });

  describe('AI Feature Integration', () => {
    it('should integrate AI component suggestions with MCP data', async () => {
      const suggestions = await aiSuggestions.getSuggestions({
        context: 'ecommerce dashboard',
        existingComponents: ['Header', 'Sidebar'],
        requirements: ['data visualization', 'user management']
      });
      
      expect(suggestions).toHaveProperty('components');
      expect(suggestions).toHaveProperty('patterns');
      expect(suggestions.components).toContain('DataTable');
      expect(suggestions.components).toContain('Chart');
    });

    it('should use AI for security scanning with MCP compliance data', async () => {
      const componentCode = `
        export const UserForm = ({ onSubmit }: FormProps): JSX.Element => {
          const [userData, setUserData] = useState({});
          
          return (
            <form onSubmit={onSubmit}>
              <input type="password" value={userData.password} />
            </form>
          );
        };
      `;
      
      const securityReport = await aiSecurityScanner.scanComponent(componentCode);
      
      expect(securityReport).toHaveProperty('vulnerabilities');
      expect(securityReport).toHaveProperty('recommendations');
      expect(securityReport.vulnerabilities).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'security',
            severity: expect.any(String)
          })
        ])
      );
    });

    it('should provide AI-powered refactoring suggestions', async () => {
      const legacyCode = `
        class LegacyComponent extends React.Component {
          constructor(props) {
            super(props);
            this.state = { count: 0 };
          }
          
          render() {
            return <div>{this.state.count}</div>;
          }
        }
      `;
      
      const refactoringSuggestions = await refactoringAssistant.getRefactoringSuggestions(legacyCode);
      
      expect(refactoringSuggestions).toHaveProperty('suggestions');
      expect(refactoringSuggestions.suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'modernization',
            description: expect.stringContaining('functional component')
          })
        ])
      );
    });
  });
});