import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Project {
  readonly id: string;
  readonly name: string;
  readonly platform: string;
  readonly createdAt: string;
  readonly lastModified: string;
  readonly nsmClassification: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly status: 'active' | 'archived';
  readonly componentsCount: number;
}

interface UserPreferences {
  readonly theme: 'light' | 'dark' | 'system';
  readonly language: 'en' | 'nb' | 'fr' | 'ar';
  readonly defaultPlatform: string;
  readonly defaultNSMLevel: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly autoSave: boolean;
  readonly enableTelemetry: boolean;
}

interface Organization {
  readonly id: string;
  readonly name: string;
  readonly plan: 'free' | 'pro' | 'enterprise';
  readonly features: string[];
  readonly licenseKey?: string;
}

interface AppState {
  // User & Auth
  readonly user: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly avatar?: string;
    readonly organization?: Organization;
  } | null;
  
  // Projects
  readonly projects: Project[];
  readonly currentProjectId: string | null;
  
  // Preferences
  readonly preferences: UserPreferences;
  
  // UI State
  readonly sidebarCollapsed: boolean;
  readonly globalSearchQuery: string;
  readonly activeModal: string | null;
  
  // Actions
  readonly setUser: (user: AppState['user']) => void;
  readonly logout: () => void;
  readonly addProject: (project: Project) => void;
  readonly updateProject: (id: string, updates: Partial<Project>) => void;
  readonly deleteProject: (id: string) => void;
  readonly setCurrentProject: (id: string | null) => void;
  readonly updatePreferences: (preferences: Partial<UserPreferences>) => void;
  readonly toggleSidebar: () => void;
  readonly setGlobalSearchQuery: (query: string) => void;
  readonly openModal: (modalId: string) => void;
  readonly closeModal: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  defaultPlatform: 'nextjs',
  defaultNSMLevel: 'OPEN',
  autoSave: true,
  enableTelemetry: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial State
      user: null,
      projects: [],
      currentProjectId: null,
      preferences: defaultPreferences,
      sidebarCollapsed: false,
      globalSearchQuery: '',
      activeModal: null,
      
      // Actions
      setUser: (user) => set({ user }),
      
      logout: () => set({ 
        user: null, 
        projects: [], 
        currentProjectId: null 
      }),
      
      addProject: (project) => set((state) => ({
        projects: [...state.projects, project],
        currentProjectId: project.id
      })),
      
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map(p => 
          p.id === id ? { ...p, ...updates } : p
        )
      })),
      
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProjectId: state.currentProjectId === id ? null : state.currentProjectId
      })),
      
      setCurrentProject: (id) => set({ currentProjectId: id }),
      
      updatePreferences: (preferences) => set((state) => ({
        preferences: { ...state.preferences, ...preferences }
      })),
      
      toggleSidebar: () => set((state) => ({
        sidebarCollapsed: !state.sidebarCollapsed
      })),
      
      setGlobalSearchQuery: (query) => set({ globalSearchQuery: query }),
      
      openModal: (modalId) => set({ activeModal: modalId }),
      
      closeModal: () => set({ activeModal: null }),
    }),
    {
      name: 'xaheen-app-storage',
      partialize: (state) => ({
        user: state.user,
        projects: state.projects,
        preferences: state.preferences,
      }),
    }
  )
);

// Selectors
export const selectCurrentProject = (state: AppState) => 
  state.projects.find(p => p.id === state.currentProjectId);

export const selectActiveProjects = (state: AppState) =>
  state.projects.filter(p => p.status === 'active');

export const selectProjectsByPlatform = (platform: string) => (state: AppState) =>
  state.projects.filter(p => p.platform === platform);

export const selectUserOrganization = (state: AppState) =>
  state.user?.organization;

export const selectIsEnterpriseUser = (state: AppState) =>
  state.user?.organization?.plan === 'enterprise';