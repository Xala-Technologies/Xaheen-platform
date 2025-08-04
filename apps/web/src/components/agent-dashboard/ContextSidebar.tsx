/**
 * Context Sidebar - Project memory, previous decisions, and recommendations
 * 
 * FEATURES:
 * - Project context memory
 * - Decision history tracking
 * - Smart recommendations
 * - Quick access to common actions
 * - Integration with project state
 * 
 * UI SYSTEM v5.0.0 CVA COMPLIANCE:
 * - ✅ CVA variant props only
 * - ✅ Semantic Tailwind classes
 * - ✅ WCAG 2.2 AAA accessibility
 * - ✅ TypeScript explicit return types
 */

"use client";

import React, { useCallback, useMemo } from "react";
import {
  Card,
  Stack,
  Typography,
  Badge,
  Button,
} from "@xala-technologies/ui-system";
import { useLocalization } from "@/hooks/useLocalization";

interface ContextSidebarProps {
  readonly projectContext?: ProjectContext | null;
  readonly commandHistory: string[];
  readonly activeTasks: AgentTask[];
}

interface ProjectContext {
  readonly name: string;
  readonly path: string;
  readonly framework: string;
  readonly hasBackend: boolean;
  readonly hasDatabase: boolean;
  readonly complianceLevel: string;
  readonly lastModified: Date;
}

interface AgentTask {
  readonly id: string;
  readonly type: 'generation' | 'analysis' | 'migration' | 'deployment';
  readonly description: string;
  readonly progress: number;
  readonly status: 'pending' | 'running' | 'completed' | 'error';
  readonly agentId: string;
  readonly startTime: Date;
  readonly estimatedDuration?: number;
}

interface Decision {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly timestamp: Date;
  readonly impact: 'high' | 'medium' | 'low';
  readonly category: 'architecture' | 'technology' | 'design' | 'deployment';
  readonly outcome: string;
}

interface Recommendation {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly priority: 'high' | 'medium' | 'low';
  readonly category: 'performance' | 'security' | 'compliance' | 'maintenance';
  readonly action: string;
  readonly estimatedImpact: string;
}

export const ContextSidebar = ({
  projectContext,
  commandHistory,
  activeTasks,
}: ContextSidebarProps): React.JSX.Element => {
  const { t } = useLocalization();

  // Mock decisions and recommendations based on project context
  const mockDecisions: Decision[] = [
    {
      id: 'dec-1',
      title: 'Adopted Xala UI System',
      description: 'Standardized on Xala UI System v5.0 for consistency and compliance',
      timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
      impact: 'high',
      category: 'design',
      outcome: 'Improved development velocity by 40%',
    },
    {
      id: 'dec-2',
      title: 'PostgreSQL for Primary Database',
      description: 'Selected PostgreSQL over MySQL for better JSON support and performance',
      timestamp: new Date(Date.now() - 86400000 * 5), // 5 days ago
      impact: 'medium',
      category: 'technology',
      outcome: 'Enhanced query performance and data integrity',
    },
    {
      id: 'dec-3',
      title: 'Microservices Architecture',
      description: 'Split monolith into focused microservices for better scalability',
      timestamp: new Date(Date.now() - 86400000 * 7), // 1 week ago
      impact: 'high',
      category: 'architecture',
      outcome: 'Improved deployment flexibility and team autonomy',
    },
  ];

  const mockRecommendations: Recommendation[] = [
    {
      id: 'rec-1',
      title: 'Implement Caching Layer',
      description: 'Add Redis caching to reduce database load and improve response times',
      priority: 'high',
      category: 'performance',
      action: 'xaheen add cache --type=redis --strategy=read-through',
      estimatedImpact: '50% faster API responses',
    },
    {
      id: 'rec-2',
      title: 'Add Security Headers',
      description: 'Implement security headers for better protection against common attacks',
      priority: 'high',
      category: 'security',
      action: 'xaheen add security --headers=csp,hsts,xfo --audit=true',
      estimatedImpact: 'Enhanced security posture',
    },
    {
      id: 'rec-3',
      title: 'Setup Automated Testing',
      description: 'Configure comprehensive test suite with coverage reporting',
      priority: 'medium',
      category: 'maintenance',
      action: 'xaheen add testing --type=unit,integration --coverage=90',
      estimatedImpact: 'Reduced bug rate by 70%',
    },
    {
      id: 'rec-4',
      title: 'GDPR Compliance Audit',
      description: 'Review data handling practices for GDPR compliance',
      priority: 'medium',
      category: 'compliance',
      action: 'xaheen audit compliance --standard=gdpr --generate-report',
      estimatedImpact: 'Full GDPR compliance',
    },
  ];

  // Generate context-aware recommendations
  const contextRecommendations = useMemo(() => {
    if (!projectContext) return mockRecommendations;

    const recommendations = [...mockRecommendations];

    // Add recommendations based on project state
    if (!projectContext.hasDatabase) {
      recommendations.unshift({
        id: 'rec-db',
        title: 'Add Database Layer',
        description: 'Your project could benefit from a database for persistent data storage',
        priority: 'high',
        category: 'architecture' as const,
        action: 'xaheen add database --type=postgresql --orm=prisma',
        estimatedImpact: 'Enable data persistence and complex queries',
      });
    }

    if (projectContext.complianceLevel !== 'Enterprise') {
      recommendations.unshift({
        id: 'rec-compliance',
        title: 'Upgrade Compliance Level',
        description: 'Consider upgrading to enterprise compliance for production deployment',
        priority: 'medium',
        category: 'compliance' as const,
        action: 'xaheen upgrade compliance --level=enterprise',
        estimatedImpact: 'Production-ready compliance and security',
      });
    }

    return recommendations.slice(0, 4); // Keep only top 4
  }, [projectContext]);

  // Get priority color
  const getPriorityColor = (priority: 'high' | 'medium' | 'low'): 'destructive' | 'warning' | 'secondary' => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
    }
  };

  // Get impact color
  const getImpactColor = (impact: 'high' | 'medium' | 'low'): 'success' | 'warning' | 'secondary' => {
    switch (impact) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
    }
  };

  // Handle recommendation action
  const handleRecommendationAction = useCallback((recommendation: Recommendation) => {
    // TODO: Integrate with command execution
    console.log('Execute recommendation:', recommendation.action);
  }, []);

  // Recent task summary
  const taskSummary = useMemo(() => {
    const completed = activeTasks.filter(t => t.status === 'completed').length;
    const running = activeTasks.filter(t => t.status === 'running').length;
    const failed = activeTasks.filter(t => t.status === 'error').length;
    
    return { completed, running, failed, total: activeTasks.length };
  }, [activeTasks]);

  return (
    <Stack direction="vertical" gap="md">
      {/* Project Context Card */}
      {projectContext && (
        <Card variant="outlined" padding="md">
          <Stack direction="vertical" gap="sm">
            <Typography variant="h5">
              {t("agent.context.project") || "Project Context"}
            </Typography>
            
            <Stack direction="vertical" gap="xs">
              <Stack direction="horizontal" gap="sm" justify="between">
                <Typography variant="caption" color="muted">
                  Framework
                </Typography>
                <Typography variant="caption">
                  {projectContext.framework}
                </Typography>
              </Stack>
              
              <Stack direction="horizontal" gap="sm" justify="between">
                <Typography variant="caption" color="muted">
                  Backend
                </Typography>
                <Badge variant={projectContext.hasBackend ? "success" : "outline"} size="xs">
                  {projectContext.hasBackend ? "Yes" : "No"}
                </Badge>
              </Stack>
              
              <Stack direction="horizontal" gap="sm" justify="between">
                <Typography variant="caption" color="muted">
                  Database
                </Typography>
                <Badge variant={projectContext.hasDatabase ? "success" : "outline"} size="xs">
                  {projectContext.hasDatabase ? "Yes" : "No"}
                </Badge>
              </Stack>
              
              <Stack direction="horizontal" gap="sm" justify="between">
                <Typography variant="caption" color="muted">
                  Compliance
                </Typography>
                <Badge variant="secondary" size="xs">
                  {projectContext.complianceLevel}
                </Badge>
              </Stack>
            </Stack>
          </Stack>
        </Card>
      )}

      {/* Task Summary */}
      <Card variant="outlined" padding="md">
        <Stack direction="vertical" gap="sm">
          <Typography variant="h5">
            {t("agent.context.tasks") || "Task Summary"}
          </Typography>
          
          <Stack direction="horizontal" gap="md" wrap>
            <Stack direction="vertical" gap="xs" align="center">
              <Typography variant="body" weight="semibold" color={taskSummary.completed > 0 ? "success" : "muted"}>
                {taskSummary.completed}
              </Typography>
              <Typography variant="caption" color="muted">
                Completed
              </Typography>
            </Stack>
            
            <Stack direction="vertical" gap="xs" align="center">
              <Typography variant="body" weight="semibold" color={taskSummary.running > 0 ? "warning" : "muted"}>
                {taskSummary.running}
              </Typography>
              <Typography variant="caption" color="muted">
                Running
              </Typography>
            </Stack>
            
            <Stack direction="vertical" gap="xs" align="center">
              <Typography variant="body" weight="semibold" color={taskSummary.failed > 0 ? "destructive" : "muted"}>
                {taskSummary.failed}
              </Typography>
              <Typography variant="caption" color="muted">
                Failed
              </Typography>
            </Stack>
            
            <Stack direction="vertical" gap="xs" align="center">
              <Typography variant="body" weight="semibold">
                {taskSummary.total}
              </Typography>
              <Typography variant="caption" color="muted">
                Total
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Card>

      {/* Smart Recommendations */}
      <Card variant="outlined" padding="md">
        <Stack direction="vertical" gap="sm">
          <Typography variant="h5">
            {t("agent.context.recommendations") || "Smart Recommendations"}
          </Typography>
          
          {contextRecommendations.length === 0 ? (
            <Typography variant="body" color="muted" align="center">
              No recommendations at this time
            </Typography>
          ) : (
            <Stack direction="vertical" gap="xs">
              {contextRecommendations.map(recommendation => (
                <Card key={recommendation.id} variant="ghost" padding="sm">
                  <Stack direction="vertical" gap="xs">
                    <Stack direction="horizontal" gap="sm" align="center" justify="between">
                      <Typography variant="body" weight="medium">
                        {recommendation.title}
                      </Typography>
                      <Badge variant={getPriorityColor(recommendation.priority)} size="xs">
                        {recommendation.priority}
                      </Badge>
                    </Stack>
                    
                    <Typography variant="caption" color="muted">
                      {recommendation.description}
                    </Typography>
                    
                    <Stack direction="horizontal" gap="xs" justify="between" align="center">
                      <Badge variant="outline" size="xs">
                        {recommendation.category}
                      </Badge>
                      
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleRecommendationAction(recommendation)}
                      >
                        Apply
                      </Button>
                    </Stack>
                    
                    <Typography variant="caption" color="success">
                      Impact: {recommendation.estimatedImpact}
                    </Typography>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Card>

      {/* Recent Decisions */}
      <Card variant="outlined" padding="md">
        <Stack direction="vertical" gap="sm">
          <Typography variant="h5">
            {t("agent.context.decisions") || "Recent Decisions"}
          </Typography>
          
          {mockDecisions.length === 0 ? (
            <Typography variant="body" color="muted" align="center">
              No decisions recorded yet
            </Typography>
          ) : (
            <Stack direction="vertical" gap="xs">
              {mockDecisions.slice(0, 3).map(decision => (
                <Card key={decision.id} variant="ghost" padding="sm">
                  <Stack direction="vertical" gap="xs">
                    <Stack direction="horizontal" gap="sm" align="center" justify="between">
                      <Typography variant="body" weight="medium">
                        {decision.title}
                      </Typography>
                      <Badge variant={getImpactColor(decision.impact)} size="xs">
                        {decision.impact} impact
                      </Badge>
                    </Stack>
                    
                    <Typography variant="caption" color="muted">
                      {decision.description}
                    </Typography>
                    
                    <Stack direction="horizontal" gap="xs" justify="between" align="center">
                      <Badge variant="outline" size="xs">
                        {decision.category}
                      </Badge>
                      
                      <Typography variant="caption" color="muted">
                        {decision.timestamp.toLocaleDateString()}
                      </Typography>
                    </Stack>
                    
                    <Typography variant="caption" color="success">
                      {decision.outcome}
                    </Typography>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Card>

      {/* Quick Actions */}
      <Card variant="outlined" padding="md">
        <Stack direction="vertical" gap="sm">
          <Typography variant="h5">
            {t("agent.context.actions") || "Quick Actions"}
          </Typography>
          
          <Stack direction="vertical" gap="xs">
            <Button variant="outline" size="sm" className="justify-start">
              🔍 Analyze Project Health
            </Button>
            
            <Button variant="outline" size="sm" className="justify-start">
              📊 Generate Report
            </Button>
            
            <Button variant="outline" size="sm" className="justify-start">
              🚀 Deploy to Staging
            </Button>
            
            <Button variant="outline" size="sm" className="justify-start">
              🔒 Security Audit
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
};