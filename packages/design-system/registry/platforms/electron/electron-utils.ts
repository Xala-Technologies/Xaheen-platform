/**
 * Electron Utilities
 * Helper functions for Electron-specific functionality
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface ElectronAPI {
  // Window controls
  readonly minimizeWindow: () => void;
  readonly maximizeWindow: () => void;
  readonly unmaximizeWindow: () => void;
  readonly closeWindow: () => void;
  readonly isWindowMaximized: () => boolean;
  readonly setWindowOpacity: (opacity: number) => void;
  readonly setAlwaysOnTop: (flag: boolean) => void;
  
  // File system
  readonly showOpenDialog: (options: OpenDialogOptions) => Promise<string[]>;
  readonly showSaveDialog: (options: SaveDialogOptions) => Promise<string | null>;
  readonly readFile: (path: string) => Promise<string>;
  readonly writeFile: (path: string, data: string) => Promise<void>;
  
  // System
  readonly getPlatform: () => 'darwin' | 'win32' | 'linux';
  readonly getVersion: () => string;
  readonly isDarkMode: () => boolean;
  readonly onThemeChange: (callback: (isDark: boolean) => void) => () => void;
  
  // Native menus
  readonly showContextMenu: (options: ContextMenuOptions) => void;
  readonly setApplicationMenu: (template: MenuTemplate[]) => void;
  
  // Clipboard
  readonly readClipboard: () => Promise<string>;
  readonly writeClipboard: (text: string) => void;
  readonly readClipboardImage: () => Promise<string | null>;
  
  // Shortcuts
  readonly registerShortcut: (shortcut: string, callback: () => void) => void;
  readonly unregisterShortcut: (shortcut: string) => void;
  readonly unregisterAllShortcuts: () => void;
  
  // Notifications
  readonly showNotification: (options: NotificationOptions) => void;
  
  // Dialog
  readonly showMessageBox: (options: MessageBoxOptions) => Promise<MessageBoxResult>;
  readonly showErrorBox: (title: string, content: string) => void;
}

export interface OpenDialogOptions {
  readonly title?: string;
  readonly defaultPath?: string;
  readonly buttonLabel?: string;
  readonly filters?: FileFilter[];
  readonly properties?: OpenDialogProperty[];
}

export interface SaveDialogOptions {
  readonly title?: string;
  readonly defaultPath?: string;
  readonly buttonLabel?: string;
  readonly filters?: FileFilter[];
  readonly properties?: SaveDialogProperty[];
}

export interface FileFilter {
  readonly name: string;
  readonly extensions: string[];
}

export type OpenDialogProperty = 
  | 'openFile' 
  | 'openDirectory' 
  | 'multiSelections' 
  | 'showHiddenFiles' 
  | 'createDirectory';

export type SaveDialogProperty = 
  | 'showHiddenFiles' 
  | 'createDirectory' 
  | 'showOverwriteConfirmation';

export interface ContextMenuOptions {
  readonly items: ContextMenuItem[];
}

export interface ContextMenuItem {
  readonly label?: string;
  readonly type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';
  readonly click?: () => void;
  readonly enabled?: boolean;
  readonly visible?: boolean;
  readonly checked?: boolean;
  readonly accelerator?: string;
  readonly submenu?: ContextMenuItem[];
}

export interface MenuTemplate {
  readonly label: string;
  readonly submenu?: MenuTemplate[];
  readonly type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';
  readonly click?: () => void;
  readonly accelerator?: string;
  readonly enabled?: boolean;
  readonly visible?: boolean;
}

export interface NotificationOptions {
  readonly title: string;
  readonly body: string;
  readonly icon?: string;
  readonly urgency?: 'low' | 'normal' | 'critical';
  readonly timeoutType?: 'default' | 'never';
  readonly actions?: Array<{
    readonly type: 'button';
    readonly text: string;
  }>;
}

export interface MessageBoxOptions {
  readonly type?: 'none' | 'info' | 'error' | 'question' | 'warning';
  readonly buttons?: string[];
  readonly defaultId?: number;
  readonly cancelId?: number;
  readonly title?: string;
  readonly message: string;
  readonly detail?: string;
  readonly icon?: string;
  readonly noLink?: boolean;
}

export interface MessageBoxResult {
  readonly response: number;
  readonly checkboxChecked?: boolean;
}

// =============================================================================
// ELECTRON UTILITIES CLASS
// =============================================================================

export class ElectronUtils {
  private static instance: ElectronUtils;
  private api: ElectronAPI | null = null;

  private constructor() {
    this.api = (window as any).electronAPI || null;
  }

  static getInstance(): ElectronUtils {
    if (!ElectronUtils.instance) {
      ElectronUtils.instance = new ElectronUtils();
    }
    return ElectronUtils.instance;
  }

  // =============================================================================
  // PLATFORM DETECTION
  // =============================================================================

  isElectron(): boolean {
    return this.api !== null;
  }

  getPlatform(): 'darwin' | 'win32' | 'linux' | 'web' {
    if (!this.api) return 'web';
    return this.api.getPlatform();
  }

  isMac(): boolean {
    return this.getPlatform() === 'darwin';
  }

  isWindows(): boolean {
    return this.getPlatform() === 'win32';
  }

  isLinux(): boolean {
    return this.getPlatform() === 'linux';
  }

  // =============================================================================
  // THEME UTILITIES
  // =============================================================================

  isDarkMode(): boolean {
    if (!this.api) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return this.api.isDarkMode();
  }

  onThemeChange(callback: (isDark: boolean) => void): () => void {
    if (!this.api) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => callback(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
    return this.api.onThemeChange(callback);
  }

  // =============================================================================
  // KEYBOARD SHORTCUTS
  // =============================================================================

  formatShortcut(shortcut: string): string {
    if (!this.isMac()) return shortcut;
    
    return shortcut
      .replace(/Ctrl\+/g, '⌘')
      .replace(/Alt\+/g, '⌥')
      .replace(/Shift\+/g, '⇧')
      .replace(/Delete/g, '⌫')
      .replace(/Enter/g, '⏎')
      .replace(/Tab/g, '⇥')
      .replace(/Escape/g, '⎋');
  }

  registerShortcut(shortcut: string, callback: () => void): void {
    if (!this.api) return;
    this.api.registerShortcut(shortcut, callback);
  }

  unregisterShortcut(shortcut: string): void {
    if (!this.api) return;
    this.api.unregisterShortcut(shortcut);
  }

  // =============================================================================
  // FILE OPERATIONS
  // =============================================================================

  async openFile(options?: OpenDialogOptions): Promise<string[]> {
    if (!this.api) return [];
    return this.api.showOpenDialog({
      properties: ['openFile'],
      ...options
    });
  }

  async openDirectory(options?: OpenDialogOptions): Promise<string[]> {
    if (!this.api) return [];
    return this.api.showOpenDialog({
      properties: ['openDirectory'],
      ...options
    });
  }

  async saveFile(options?: SaveDialogOptions): Promise<string | null> {
    if (!this.api) return null;
    return this.api.showSaveDialog(options);
  }

  // =============================================================================
  // NOTIFICATIONS
  // =============================================================================

  showNotification(title: string, body: string, options?: Partial<NotificationOptions>): void {
    if (!this.api) {
      // Fallback to browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
      return;
    }
    
    this.api.showNotification({
      title,
      body,
      ...options
    });
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!this.api && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return true; // Electron doesn't need permission
  }

  // =============================================================================
  // DIALOGS
  // =============================================================================

  async showMessageBox(options: MessageBoxOptions): Promise<number> {
    if (!this.api) {
      // Fallback to browser confirm/alert
      if (options.type === 'question' && options.buttons?.length === 2) {
        return window.confirm(options.message) ? 0 : 1;
      }
      window.alert(options.message);
      return 0;
    }
    
    const result = await this.api.showMessageBox(options);
    return result.response;
  }

  showErrorBox(title: string, content: string): void {
    if (!this.api) {
      window.alert(`${title}\n\n${content}`);
      return;
    }
    this.api.showErrorBox(title, content);
  }

  // =============================================================================
  // CONTEXT MENUS
  // =============================================================================

  showContextMenu(items: ContextMenuItem[]): void {
    if (!this.api) return;
    this.api.showContextMenu({ items });
  }

  // =============================================================================
  // CLIPBOARD
  // =============================================================================

  async readClipboard(): Promise<string> {
    if (!this.api) {
      try {
        return await navigator.clipboard.readText();
      } catch {
        return '';
      }
    }
    return this.api.readClipboard();
  }

  async writeClipboard(text: string): Promise<void> {
    if (!this.api) {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // Silently fail
      }
      return;
    }
    this.api.writeClipboard(text);
  }
}

// =============================================================================
// REACT HOOKS
// =============================================================================

import { useEffect, useState } from 'react';

export function useElectron() {
  const utils = ElectronUtils.getInstance();
  return {
    isElectron: utils.isElectron(),
    platform: utils.getPlatform(),
    utils
  };
}

export function useDarkMode() {
  const utils = ElectronUtils.getInstance();
  const [isDark, setIsDark] = useState(utils.isDarkMode());

  useEffect(() => {
    const unsubscribe = utils.onThemeChange(setIsDark);
    return unsubscribe;
  }, [utils]);

  return isDark;
}

export function useShortcut(shortcut: string, callback: () => void, deps: any[] = []) {
  const utils = ElectronUtils.getInstance();

  useEffect(() => {
    utils.registerShortcut(shortcut, callback);
    return () => utils.unregisterShortcut(shortcut);
  }, [shortcut, ...deps]);
}

// =============================================================================
// EXPORT
// =============================================================================

export default ElectronUtils.getInstance();