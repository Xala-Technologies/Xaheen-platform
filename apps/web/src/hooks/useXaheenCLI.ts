/**
 * Xaheen CLI State Management Hook - CLAUDE.md Compliant
 * Advanced TypeScript State Management with Performance Optimization
 * 
 * MANDATORY COMPLIANCE RULES:
 * ✅ All interfaces must be readonly
 * ✅ Explicit return types for all functions
 * ✅ No 'any' types permitted
 * ✅ Modern React hooks patterns
 * ✅ Error handling and loading states
 * ✅ Performance optimization with memoization
 * ✅ WCAG AAA accessibility compliance
 */

"use client";

import { useState, useCallback, useMemo, useReducer, useEffect, useRef } from 'react';
import type { 
  ProjectConfig,
  ChatMessage,
  CodeChange,
  ProjectStatistics,
  ProjectSummary,
  ProjectContext,
  AsyncOperationState,
  WizardState,
  AIAssistantState,
  DashboardState,
  DashboardFilters
} from '../types/component-interfaces';

// ===============================
// STATE MANAGEMENT TYPES
// ===============================

interface XaheenCLIState {
  readonly wizard: WizardState;
  readonly aiAssistant: AIAssistantState;
  readonly dashboard: DashboardState;
  readonly projects: AsyncOperationState<readonly ProjectSummary[]>;
  readonly currentProject: AsyncOperationState<ProjectContext>;
}

type XaheenCLIAction =
  | { type: 'WIZARD_SET_STEP'; payload: number }
  | { type: 'WIZARD_UPDATE_CONFIG'; payload: Partial<ProjectConfig> }
  | { type: 'WIZARD_SET_ERROR'; payload: { field: string; error: string } }
  | { type: 'WIZARD_CLEAR_ERRORS' }
  | { type: 'WIZARD_SET_SUBMITTING'; payload: boolean }
  | { type: 'AI_TOGGLE_PANEL'; payload: boolean }
  | { type: 'AI_ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'AI_SET_PROCESSING'; payload: boolean }
  | { type: 'AI_ADD_PENDING_CHANGES'; payload: readonly CodeChange[] }
  | { type: 'AI_CLEAR_PENDING_CHANGES' }
  | { type: 'AI_SET_CONTEXT'; payload: ProjectContext }
  | { type: 'DASHBOARD_SET_STATISTICS'; payload: ProjectStatistics }
  | { type: 'DASHBOARD_SET_PROJECTS'; payload: readonly ProjectSummary[] }
  | { type: 'DASHBOARD_SET_FILTERS'; payload: Partial<DashboardFilters> }
  | { type: 'DASHBOARD_SELECT_PROJECT'; payload: string | undefined }
  | { type: 'PROJECTS_SET_LOADING'; payload: boolean }
  | { type: 'PROJECTS_SET_DATA'; payload: readonly ProjectSummary[] }
  | { type: 'PROJECTS_SET_ERROR'; payload: string }
  | { type: 'PROJECT_SET_LOADING'; payload: boolean }
  | { type: 'PROJECT_SET_DATA'; payload: ProjectContext }
  | { type: 'PROJECT_SET_ERROR'; payload: string };

// ===============================
// INITIAL STATE
// ===============================

const initialState: XaheenCLIState = {
  wizard: {
    currentStep: 1,
    config: {
      name: '',
      type: 'web-app',
      platform: 'react',
      features: [],
      localization: ['en'],
      theme: 'enterprise'
    },
    errors: {},
    isValid: false,
    isSubmitting: false
  },
  aiAssistant: {
    messages: [],
    isOpen: false,
    isProcessing: false,
    pendingChanges: []
  },
  dashboard: {
    statistics: {
      totalProjects: 0,
      activeProjects: 0,
      templatesUsed: 0,
      successRate: 0,
      avgGenerationTime: 0,
      recentActivity: []
    },
    projects: [],
    filters: {}
  },
  projects: {
    isLoading: false,
    isSuccess: false,
    isError: false
  },
  currentProject: {
    isLoading: false,
    isSuccess: false,
    isError: false
  }
};

// ===============================
// REDUCER
// ===============================

const xaheenCLIReducer = (state: XaheenCLIState, action: XaheenCLIAction): XaheenCLIState => {
  switch (action.type) {
    // Wizard actions
    case 'WIZARD_SET_STEP':
      return {
        ...state,
        wizard: {
          ...state.wizard,
          currentStep: action.payload
        }
      };

    case 'WIZARD_UPDATE_CONFIG':
      return {
        ...state,
        wizard: {
          ...state.wizard,
          config: { ...state.wizard.config, ...action.payload },
          isValid: validateWizardConfig({ ...state.wizard.config, ...action.payload })
        }
      };

    case 'WIZARD_SET_ERROR':
      return {
        ...state,
        wizard: {
          ...state.wizard,
          errors: { ...state.wizard.errors, [action.payload.field]: action.payload.error }
        }
      };

    case 'WIZARD_CLEAR_ERRORS':
      return {
        ...state,
        wizard: {
          ...state.wizard,
          errors: {}
        }
      };

    case 'WIZARD_SET_SUBMITTING':
      return {
        ...state,
        wizard: {
          ...state.wizard,
          isSubmitting: action.payload
        }
      };

    // AI Assistant actions
    case 'AI_TOGGLE_PANEL':
      return {
        ...state,
        aiAssistant: {
          ...state.aiAssistant,
          isOpen: action.payload
        }
      };

    case 'AI_ADD_MESSAGE':
      return {
        ...state,
        aiAssistant: {
          ...state.aiAssistant,
          messages: [...state.aiAssistant.messages, action.payload]
        }
      };

    case 'AI_SET_PROCESSING':
      return {
        ...state,
        aiAssistant: {
          ...state.aiAssistant,
          isProcessing: action.payload
        }
      };

    case 'AI_ADD_PENDING_CHANGES':
      return {
        ...state,
        aiAssistant: {
          ...state.aiAssistant,
          pendingChanges: [...state.aiAssistant.pendingChanges, ...action.payload]
        }
      };

    case 'AI_CLEAR_PENDING_CHANGES':
      return {
        ...state,
        aiAssistant: {
          ...state.aiAssistant,
          pendingChanges: []
        }
      };

    case 'AI_SET_CONTEXT':
      return {
        ...state,
        aiAssistant: {
          ...state.aiAssistant,
          context: action.payload
        }
      };

    // Dashboard actions
    case 'DASHBOARD_SET_STATISTICS':
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          statistics: action.payload
        }
      };

    case 'DASHBOARD_SET_PROJECTS':
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          projects: action.payload
        }
      };

    case 'DASHBOARD_SET_FILTERS':
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          filters: { ...state.dashboard.filters, ...action.payload }
        }
      };

    case 'DASHBOARD_SELECT_PROJECT':
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          selectedProject: action.payload
        }
      };

    // Projects actions
    case 'PROJECTS_SET_LOADING':
      return {
        ...state,
        projects: {
          ...state.projects,
          isLoading: action.payload,
          isError: false,
          error: undefined
        }
      };

    case 'PROJECTS_SET_DATA':
      return {
        ...state,
        projects: {
          data: action.payload,
          isLoading: false,
          isSuccess: true,
          isError: false,
          error: undefined
        }
      };

    case 'PROJECTS_SET_ERROR':
      return {
        ...state,
        projects: {
          ...state.projects,
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: action.payload
        }
      };

    // Current Project actions
    case 'PROJECT_SET_LOADING':
      return {
        ...state,
        currentProject: {
          ...state.currentProject,
          isLoading: action.payload,
          isError: false,
          error: undefined
        }
      };

    case 'PROJECT_SET_DATA':
      return {
        ...state,
        currentProject: {
          data: action.payload,
          isLoading: false,
          isSuccess: true,
          isError: false,
          error: undefined
        }
      };

    case 'PROJECT_SET_ERROR':
      return {
        ...state,
        currentProject: {
          ...state.currentProject,
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: action.payload
        }
      };

    default:
      return state;
  }
};

// ===============================
// VALIDATION HELPERS
// ===============================

const validateWizardConfig = (config: Partial<ProjectConfig>): boolean => {
  if (!config.name?.trim()) return false;
  if (config.name.length < 3) return false;
  if (!/^[a-z0-9-]+$/.test(config.name)) return false;
  return true;
};

// ===============================
// API SERVICES (Mock Implementation)
// ===============================

const mockAPIDelay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

const projectService = {
  async generateProject(config: ProjectConfig): Promise<{ id: string; status: string }> {
    await mockAPIDelay(3000);
    return {
      id: `project-${Date.now()}`,
      status: 'generated'
    };
  },

  async getProjects(): Promise<readonly ProjectSummary[]> {
    await mockAPIDelay(1000);
    return [
      {
        id: 'proj-1',
        name: 'e-commerce-app',
        type: 'web-app',
        platform: 'nextjs',
        status: 'active',
        lastModified: new Date(),
        progress: 85
      },
      {
        id: 'proj-2',
        name: 'mobile-banking',
        type: 'mobile-app',
        platform: 'react-native',
        status: 'completed',
        lastModified: new Date(Date.now() - 86400000),
        progress: 100
      }
    ];
  },

  async getProjectContext(projectId: string): Promise<ProjectContext> {
    await mockAPIDelay(800);
    return {
      name: 'e-commerce-app',
      type: 'web-app',
      platform: 'nextjs',
      files: ['pages/index.tsx', 'components/ProductCard.tsx', 'utils/api.ts'],
      dependencies: ['react', 'next', 'typescript', '@xala-technologies/ui-system'],
      configuration: {
        typescript: true,
        tailwind: true,
        eslint: true
      }
    };
  },

  async getDashboardStatistics(): Promise<ProjectStatistics> {
    await mockAPIDelay(600);
    return {
      totalProjects: 24,
      activeProjects: 8,
      templatesUsed: 15,
      successRate: 94,
      avgGenerationTime: 45,
      recentActivity: [
        {
          id: 'act-1',
          type: 'created',
          projectName: 'new-saas-app',
          timestamp: new Date(),
          description: 'Project created with React template'
        },
        {
          id: 'act-2',
          type: 'deployed',
          projectName: 'e-commerce-app',
          timestamp: new Date(Date.now() - 3600000),
          description: 'Successfully deployed to Vercel'
        }
      ]
    };
  }
};

const aiService = {
  async sendMessage(message: string, context?: ProjectContext): Promise<ChatMessage> {
    await mockAPIDelay(2000);
    
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `I understand you want to ${message}. Let me help you with that implementation.`,
      timestamp: new Date(),
      codeChanges: [
        {
          id: `change-${Date.now()}`,
          file: 'components/NewComponent.tsx',
          action: 'create',
          content: `// Generated based on your request: ${message}\nexport const NewComponent = () => {\n  return <div>Hello World</div>;\n};`,
          language: 'typescript'
        }
      ],
      metadata: {
        confidence: 0.9,
        executionTime: 1800,
        sources: ['Xala UI System', 'React Documentation']
      }
    };
  },

  async applyChanges(changes: readonly CodeChange[]): Promise<{ success: boolean; appliedCount: number }> {
    await mockAPIDelay(1500);
    return {
      success: true,
      appliedCount: changes.length
    };
  }
};

// ===============================
// MAIN HOOK
// ===============================

export interface UseXaheenCLIReturn {
  // State
  readonly state: XaheenCLIState;
  
  // Wizard actions
  readonly setWizardStep: (step: number) => void;
  readonly updateWizardConfig: (updates: Partial<ProjectConfig>) => void;
  readonly generateProject: (config: ProjectConfig) => Promise<void>;
  
  // AI Assistant actions
  readonly toggleAIPanel: (isOpen: boolean) => void;
  readonly sendAIMessage: (message: string) => Promise<void>;
  readonly applyCodeChanges: (changes: readonly CodeChange[]) => Promise<void>;
  
  // Dashboard actions
  readonly loadDashboardData: () => Promise<void>;
  readonly setDashboardFilters: (filters: Partial<DashboardFilters>) => void;
  readonly selectProject: (projectId: string | undefined) => void;
  
  // Project actions
  readonly loadProjects: () => Promise<void>;
  readonly loadProjectContext: (projectId: string) => Promise<void>;
  
  // Computed values
  readonly isWizardValid: boolean;
  readonly filteredProjects: readonly ProjectSummary[];
  readonly aiPendingChangesCount: number;
}

export const useXaheenCLI = (): UseXaheenCLIReturn => {
  const [state, dispatch] = useReducer(xaheenCLIReducer, initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ===============================
  // WIZARD ACTIONS
  // ===============================

  const setWizardStep = useCallback((step: number): void => {
    dispatch({ type: 'WIZARD_SET_STEP', payload: step });
  }, []);

  const updateWizardConfig = useCallback((updates: Partial<ProjectConfig>): void => {
    dispatch({ type: 'WIZARD_UPDATE_CONFIG', payload: updates });
  }, []);

  const generateProject = useCallback(async (config: ProjectConfig): Promise<void> => {
    dispatch({ type: 'WIZARD_SET_SUBMITTING', payload: true });
    dispatch({ type: 'WIZARD_CLEAR_ERRORS' });

    try {
      const result = await projectService.generateProject(config);
      
      // Add success message to AI assistant
      const successMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'system',
        content: `✅ Project "${config.name}" generated successfully! ID: ${result.id}`,
        timestamp: new Date()
      };
      
      dispatch({ type: 'AI_ADD_MESSAGE', payload: successMessage });
      
      // Refresh dashboard data
      await loadDashboardData();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch({ type: 'WIZARD_SET_ERROR', payload: { field: 'generation', error: errorMessage } });
    } finally {
      dispatch({ type: 'WIZARD_SET_SUBMITTING', payload: false });
    }
  }, []);

  // ===============================
  // AI ASSISTANT ACTIONS
  // ===============================

  const toggleAIPanel = useCallback((isOpen: boolean): void => {
    dispatch({ type: 'AI_TOGGLE_PANEL', payload: isOpen });
  }, []);

  const sendAIMessage = useCallback(async (message: string): Promise<void> => {
    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    dispatch({ type: 'AI_ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'AI_SET_PROCESSING', payload: true });

    try {
      const response = await aiService.sendMessage(message, state.aiAssistant.context);
      dispatch({ type: 'AI_ADD_MESSAGE', payload: response });
      
      if (response.codeChanges) {
        dispatch({ type: 'AI_ADD_PENDING_CHANGES', payload: response.codeChanges });
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'system',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      
      dispatch({ type: 'AI_ADD_MESSAGE', payload: errorMessage });
    } finally {
      dispatch({ type: 'AI_SET_PROCESSING', payload: false });
    }
  }, [state.aiAssistant.context]);

  const applyCodeChanges = useCallback(async (changes: readonly CodeChange[]): Promise<void> => {
    try {
      const result = await aiService.applyChanges(changes);
      
      const successMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'system',
        content: `✅ Successfully applied ${result.appliedCount} change(s) to your project.`,
        timestamp: new Date()
      };
      
      dispatch({ type: 'AI_ADD_MESSAGE', payload: successMessage });
      dispatch({ type: 'AI_CLEAR_PENDING_CHANGES' });
      
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'system',
        content: 'Failed to apply changes. Please try again.',
        timestamp: new Date()
      };
      
      dispatch({ type: 'AI_ADD_MESSAGE', payload: errorMessage });
    }
  }, []);

  // ===============================
  // DASHBOARD ACTIONS
  // ===============================

  const loadDashboardData = useCallback(async (): Promise<void> => {
    try {
      const [statistics, projects] = await Promise.all([
        projectService.getDashboardStatistics(),
        projectService.getProjects()
      ]);
      
      dispatch({ type: 'DASHBOARD_SET_STATISTICS', payload: statistics });
      dispatch({ type: 'DASHBOARD_SET_PROJECTS', payload: projects });
      dispatch({ type: 'PROJECTS_SET_DATA', payload: projects });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data';
      dispatch({ type: 'PROJECTS_SET_ERROR', payload: errorMessage });
    }
  }, []);

  const setDashboardFilters = useCallback((filters: Partial<DashboardFilters>): void => {
    dispatch({ type: 'DASHBOARD_SET_FILTERS', payload: filters });
  }, []);

  const selectProject = useCallback((projectId: string | undefined): void => {
    dispatch({ type: 'DASHBOARD_SELECT_PROJECT', payload: projectId });
  }, []);

  // ===============================
  // PROJECT ACTIONS
  // ===============================

  const loadProjects = useCallback(async (): Promise<void> => {
    dispatch({ type: 'PROJECTS_SET_LOADING', payload: true });
    
    try {
      const projects = await projectService.getProjects();
      dispatch({ type: 'PROJECTS_SET_DATA', payload: projects });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load projects';
      dispatch({ type: 'PROJECTS_SET_ERROR', payload: errorMessage });
    }
  }, []);

  const loadProjectContext = useCallback(async (projectId: string): Promise<void> => {
    dispatch({ type: 'PROJECT_SET_LOADING', payload: true });
    
    try {
      const context = await projectService.getProjectContext(projectId);
      dispatch({ type: 'PROJECT_SET_DATA', payload: context });
      dispatch({ type: 'AI_SET_CONTEXT', payload: context });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load project context';
      dispatch({ type: 'PROJECT_SET_ERROR', payload: errorMessage });
    }
  }, []);

  // ===============================
  // COMPUTED VALUES
  // ===============================

  const isWizardValid = useMemo(() => state.wizard.isValid, [state.wizard.isValid]);

  const filteredProjects = useMemo(() => {
    const { projects, filters } = state.dashboard;
    
    return projects.filter(project => {
      if (filters.status && project.status !== filters.status) return false;
      if (filters.platform && project.platform !== filters.platform) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return project.name.toLowerCase().includes(query) ||
               project.type.toLowerCase().includes(query);
      }
      return true;
    });
  }, [state.dashboard.projects, state.dashboard.filters]);

  const aiPendingChangesCount = useMemo(() => 
    state.aiAssistant.pendingChanges.length, [state.aiAssistant.pendingChanges]
  );

  return {
    state,
    setWizardStep,
    updateWizardConfig,
    generateProject,
    toggleAIPanel,
    sendAIMessage,
    applyCodeChanges,
    loadDashboardData,
    setDashboardFilters,
    selectProject,
    loadProjects,
    loadProjectContext,
    isWizardValid,
    filteredProjects,
    aiPendingChangesCount
  };
};