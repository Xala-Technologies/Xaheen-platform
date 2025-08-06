/**
 * Ionic Provider Component
 * Wraps the application with Ionic configuration and theme
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  IonApp, 
  setupIonicReact,
  IonContent,
  IonPage
} from '@ionic/react';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { ionicTheme } from './theme';

// Core CSS required for Ionic components
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

// =============================================================================
// CONTEXT INTERFACE
// =============================================================================

export interface IonicConfig {
  mode?: 'ios' | 'md';
  animated?: boolean;
  hardwareBackButton?: boolean;
  swipeBackEnabled?: boolean;
  statusBarStyle?: 'dark' | 'light' | 'default';
  keyboardHeight?: number;
  theme?: {
    dark?: boolean;
    colors?: Record<string, string>;
  };
}

export interface IonicContextValue {
  config: IonicConfig;
  updateConfig: (config: Partial<IonicConfig>) => void;
  initialized: boolean;
}

// =============================================================================
// CONTEXT
// =============================================================================

const IonicContext = createContext<IonicContextValue | undefined>(undefined);

export function useIonicContext() {
  const context = useContext(IonicContext);
  if (!context) {
    throw new Error('useIonicContext must be used within IonicProvider');
  }
  return context;
}

// =============================================================================
// PROVIDER PROPS
// =============================================================================

export interface IonicProviderProps {
  readonly children: React.ReactNode;
  readonly config?: IonicConfig;
  readonly onInitialized?: () => void;
  readonly splashScreen?: {
    autoHide?: boolean;
    showDuration?: number;
    fadeOutDuration?: number;
  };
  readonly statusBar?: {
    style?: 'dark' | 'light' | 'default';
    backgroundColor?: string;
    overlaysWebView?: boolean;
  };
  readonly cssVariables?: Record<string, string>;
}

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

export const IonicProvider: React.FC<IonicProviderProps> = ({
  children,
  config: initialConfig = {},
  onInitialized,
  splashScreen = { autoHide: true, showDuration: 2000, fadeOutDuration: 500 },
  statusBar,
  cssVariables
}) => {
  const [config, setConfig] = useState<IonicConfig>({
    mode: 'ios',
    animated: true,
    hardwareBackButton: true,
    swipeBackEnabled: true,
    ...initialConfig
  });
  
  const [initialized, setInitialized] = useState(false);

  // Setup Ionic React
  useEffect(() => {
    setupIonicReact({
      mode: config.mode,
      animated: config.animated,
      hardwareBackButton: config.hardwareBackButton,
      swipeBackEnabled: config.swipeBackEnabled
    });

    setInitialized(true);
  }, []);

  // Handle native features
  useEffect(() => {
    if (!initialized) return;

    const initializeNativeFeatures = async () => {
      try {
        // Configure status bar
        if (statusBar && typeof StatusBar !== 'undefined') {
          if (statusBar.style) {
            await StatusBar.setStyle({ style: statusBar.style });
          }
          if (statusBar.backgroundColor) {
            await StatusBar.setBackgroundColor({ color: statusBar.backgroundColor });
          }
          if (statusBar.overlaysWebView !== undefined) {
            await StatusBar.setOverlaysWebView({ overlay: statusBar.overlaysWebView });
          }
        }

        // Handle splash screen
        if (splashScreen.autoHide && typeof SplashScreen !== 'undefined') {
          setTimeout(async () => {
            await SplashScreen.hide({
              fadeOutDuration: splashScreen.fadeOutDuration
            });
          }, splashScreen.showDuration);
        }

        onInitialized?.();
      } catch (error) {
        console.warn('Failed to initialize native features:', error);
      }
    };

    initializeNativeFeatures();
  }, [initialized, statusBar, splashScreen, onInitialized]);

  // Apply CSS variables
  useEffect(() => {
    if (!cssVariables) return;

    const style = document.createElement('style');
    const variables = Object.entries(cssVariables)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n');
    
    style.textContent = `:root {\n${variables}\n}`;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [cssVariables]);

  // Apply theme
  useEffect(() => {
    if (!config.theme) return;

    const { dark, colors } = config.theme;

    // Apply dark mode
    if (dark !== undefined) {
      document.body.classList.toggle('dark', dark);
    }

    // Apply custom colors
    if (colors) {
      const style = document.createElement('style');
      style.textContent = ionicTheme.generate({ colors });
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
      };
    }
  }, [config.theme]);

  const updateConfig = (newConfig: Partial<IonicConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const contextValue: IonicContextValue = {
    config,
    updateConfig,
    initialized
  };

  return (
    <IonicContext.Provider value={contextValue}>
      <IonApp>
        {children}
      </IonApp>
    </IonicContext.Provider>
  );
};

// =============================================================================
// PAGE WRAPPER COMPONENT
// =============================================================================

export interface IonicPageProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly fullscreen?: boolean;
  readonly scrollEvents?: boolean;
  readonly forceOverscroll?: boolean;
}

export const IonicPage: React.FC<IonicPageProps> = ({
  children,
  className,
  fullscreen = false,
  scrollEvents = false,
  forceOverscroll = true
}) => {
  return (
    <IonPage className={className}>
      <IonContent
        fullscreen={fullscreen}
        scrollEvents={scrollEvents}
        forceOverscroll={forceOverscroll}
      >
        {children}
      </IonContent>
    </IonPage>
  );
};

// =============================================================================
// THEME UTILITIES
// =============================================================================

/**
 * Apply Ionic theme dynamically
 */
export function applyIonicTheme(theme: {
  dark?: boolean;
  colors?: Record<string, string>;
  prefersDark?: boolean;
}) {
  // Handle dark mode
  if (theme.dark !== undefined) {
    document.body.classList.toggle('dark', theme.dark);
  } else if (theme.prefersDark !== undefined) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    document.body.classList.toggle('dark', prefersDark.matches);
  }

  // Apply custom colors
  if (theme.colors) {
    const style = document.getElementById('ionic-theme-override') || document.createElement('style');
    style.id = 'ionic-theme-override';
    style.textContent = ionicTheme.generate({ colors: theme.colors });
    
    if (!style.parentNode) {
      document.head.appendChild(style);
    }
  }
}

/**
 * Get current theme mode
 */
export function getIonicThemeMode(): 'light' | 'dark' {
  return document.body.classList.contains('dark') ? 'dark' : 'light';
}

/**
 * Toggle theme mode
 */
export function toggleIonicTheme() {
  const isDark = document.body.classList.contains('dark');
  document.body.classList.toggle('dark', !isDark);
  return !isDark ? 'dark' : 'light';
}