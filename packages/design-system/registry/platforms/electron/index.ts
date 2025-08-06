/**
 * Electron Platform Index
 * Exports all Electron-compatible React components with desktop enhancements
 */

// Export Electron-enhanced React components
export { ElectronButton, ElectronButton as Button, type ElectronButtonProps } from './button';
export { ElectronInput, ElectronInput as Input, type ElectronInputProps } from './input';
export { 
  ElectronCard, 
  ElectronCard as Card, 
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  type ElectronCardProps 
} from './card';
export { ElectronThemeSwitcher, ElectronThemeSwitcher as ThemeSwitcher, useTheme, type ElectronThemeSwitcherProps } from './theme-switcher';

// Electron-specific utilities
export { 
  ElectronUtils, 
  useElectron,
  useDarkMode,
  useShortcut,
  type ElectronAPI,
  type OpenDialogOptions,
  type SaveDialogOptions,
  type ContextMenuOptions,
  type NotificationOptions,
  type MessageBoxOptions
} from './electron-utils';

export { 
  WindowControls,
  TitleBar,
  type WindowControlsProps,
  type TitleBarProps
} from './window-controls';

export { 
  NativeMenus,
  ApplicationMenu,
  useContextMenu,
  MenuBuilder,
  CommonMenus,
  type ApplicationMenuProps,
  type UseContextMenuOptions
} from './native-menus';

export { 
  FileSystemAccess,
  useFilePicker,
  useFileSave,
  FileDropZone,
  FileSystemUtils,
  CommonFileFilters,
  type UseFilePickerOptions,
  type UseFileSaveOptions,
  type FileDropZoneProps
} from './file-system-access';

// Re-export all component metadata
export { ElectronButtonMeta } from './button';
export { ElectronInputMeta } from './input';
export { ElectronCardMeta } from './card';

// Platform utilities
export const PlatformInfo = {
  name: 'Electron',
  framework: 'electron',
  baseFramework: 'react',
  version: '28.0.0',
  features: [
    'desktop-app',
    'native-apis', 
    'file-system',
    'native-menus',
    'window-controls',
    'auto-updater',
    'notifications',
    'context-menus',
    'keyboard-shortcuts',
    'clipboard-access',
    'theme-sync',
    'window-management',
    'tray-integration'
  ],
  dependencies: [
    'electron',
    'react',
    'react-dom',
    '@types/react',
    '@types/react-dom',
    'class-variance-authority'
  ],
  devDependencies: [
    'electron-builder',
    'electron-forge',
    'concurrently',
    'typescript',
    'cross-env'
  ],
  buildTools: ['electron-builder', 'electron-forge'],
  nativeFeatures: {
    fileSystem: true,
    notifications: true,
    autoUpdater: true,
    nativeMenus: true,
    windowControls: true,
    systemTray: true,
    globalShortcuts: true,
    clipboard: true,
    contextMenus: true,
    dialogs: true,
    shell: true,
    powerMonitor: true
  },
  platforms: ['darwin', 'win32', 'linux'],
  architectures: ['x64', 'arm64', 'universal']
} as const;

// Electron-specific types
export interface ElectronComponentProps {
  /**
   * Enable native context menus
   */
  readonly nativeContextMenu?: boolean;
  
  /**
   * Enable keyboard shortcuts
   */
  readonly keyboardShortcuts?: boolean;
  
  /**
   * Enable accessibility features
   */
  readonly accessibilityEnabled?: boolean;
  
  /**
   * Platform-specific styling
   */
  readonly platformStyling?: 'darwin' | 'win32' | 'linux' | 'auto';
}

export interface ElectronThemeConfig {
  /**
   * Follow system theme
   */
  readonly followSystem?: boolean;
  
  /**
   * Enable native title bar
   */
  readonly nativeTitleBar?: boolean;
  
  /**
   * Window transparency
   */
  readonly transparency?: boolean;
  
  /**
   * Vibrancy effect (macOS only)
   */
  readonly vibrancy?: 'light' | 'dark' | 'titlebar' | 'selection' | 'menu' | 'popover' | 'sidebar' | 'header';
}

// Quick setup helper
export const QuickSetup = {
  /**
   * Initialize Electron components with default configuration
   */
  init: (config?: Partial<ElectronThemeConfig>) => {
    // Apply theme configuration
    const root = document.documentElement;
    if (config?.transparency) {
      root.style.backgroundColor = 'transparent';
    }
    
    // Set up default keyboard shortcuts
    const utils = ElectronUtils.getInstance();
    if (utils.isElectron()) {
      // Common shortcuts
      utils.registerShortcut('Ctrl+,', () => {
        // Open preferences
        window.dispatchEvent(new CustomEvent('electron:open-preferences'));
      });
      
      utils.registerShortcut('F11', () => {
        // Toggle fullscreen
        window.dispatchEvent(new CustomEvent('electron:toggle-fullscreen'));
      });
    }
  },
  
  /**
   * Create a basic Electron app structure
   */
  createApp: () => ({
    components: {
      Button: ElectronButton,
      Input: ElectronInput,
      Card: ElectronCard,
      ThemeSwitcher: ElectronThemeSwitcher,
      WindowControls,
      TitleBar
    },
    utils: {
      electron: ElectronUtils.getInstance(),
      menus: NativeMenus,
      files: FileSystemAccess
    },
    hooks: {
      useElectron,
      useDarkMode,
      useShortcut,
      useTheme,
      useContextMenu,
      useFilePicker,
      useFileSave
    }
  })
};