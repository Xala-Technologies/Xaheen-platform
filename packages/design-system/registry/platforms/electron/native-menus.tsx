/**
 * Electron Native Menus
 * Components for integrating with Electron's native menu system
 */

import React, { useCallback, useEffect } from 'react';
import { ElectronUtils } from './electron-utils';
import type { MenuTemplate, ContextMenuItem } from './electron-utils';

// =============================================================================
// APPLICATION MENU
// =============================================================================

export interface ApplicationMenuProps {
  /**
   * Menu template following Electron's menu structure
   */
  readonly template: MenuTemplate[];
  
  /**
   * Enable automatic platform-specific adjustments
   */
  readonly platformAdjust?: boolean;
  
  /**
   * Application name for macOS app menu
   */
  readonly appName?: string;
  
  /**
   * Enable development menu items in dev mode
   */
  readonly enableDevMenu?: boolean;
}

export const ApplicationMenu: React.FC<ApplicationMenuProps> = ({
  template,
  platformAdjust = true,
  appName = 'App',
  enableDevMenu = true
}) => {
  const utils = ElectronUtils.getInstance();

  useEffect(() => {
    if (!utils.isElectron()) return;

    const api = (window as any).electronAPI;
    if (!api?.setApplicationMenu) return;

    let menuTemplate = [...template];

    // Platform-specific adjustments
    if (platformAdjust && utils.isMac()) {
      // Add macOS app menu
      menuTemplate.unshift({
        label: appName,
        submenu: [
          { label: `About ${appName}`, click: () => api.showAboutPanel?.() },
          { type: 'separator' },
          { label: 'Services', submenu: [] },
          { type: 'separator' },
          { label: `Hide ${appName}`, accelerator: 'Command+H', click: () => api.hideWindow?.() },
          { label: 'Hide Others', accelerator: 'Command+Shift+H', click: () => api.hideOtherWindows?.() },
          { label: 'Show All', click: () => api.showAllWindows?.() },
          { type: 'separator' },
          { label: `Quit ${appName}`, accelerator: 'Command+Q', click: () => api.closeWindow() }
        ]
      });
    }

    // Add development menu in dev mode
    if (enableDevMenu && process.env.NODE_ENV === 'development') {
      menuTemplate.push({
        label: 'Development',
        submenu: [
          { label: 'Reload', accelerator: 'Command+R', click: () => window.location.reload() },
          { label: 'Toggle DevTools', accelerator: 'F12', click: () => api.toggleDevTools?.() },
          { type: 'separator' },
          { label: 'Reset App Data', click: () => api.resetAppData?.() }
        ]
      });
    }

    api.setApplicationMenu(menuTemplate);
  }, [template, platformAdjust, appName, enableDevMenu, utils]);

  return null; // This component doesn't render anything
};

// =============================================================================
// CONTEXT MENU HOOK
// =============================================================================

export interface UseContextMenuOptions {
  /**
   * Menu items to display
   */
  readonly items: ContextMenuItem[];
  
  /**
   * Element ref to attach the context menu to
   */
  readonly elementRef?: React.RefObject<HTMLElement>;
  
  /**
   * Enable/disable the context menu
   */
  readonly enabled?: boolean;
  
  /**
   * Show native context menu instead of custom one
   */
  readonly native?: boolean;
}

export function useContextMenu({
  items,
  elementRef,
  enabled = true,
  native = true
}: UseContextMenuOptions) {
  const utils = ElectronUtils.getInstance();

  const showContextMenu = useCallback((e?: React.MouseEvent) => {
    if (!enabled || items.length === 0) return;

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (native && utils.isElectron()) {
      utils.showContextMenu(items);
    } else {
      // Fallback to custom context menu
      console.warn('Custom context menu not implemented');
    }
  }, [items, enabled, native, utils]);

  useEffect(() => {
    if (!elementRef?.current || !enabled) return;

    const element = elementRef.current;
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showContextMenu();
    };

    element.addEventListener('contextmenu', handleContextMenu);
    return () => element.removeEventListener('contextmenu', handleContextMenu);
  }, [elementRef, enabled, showContextMenu]);

  return { showContextMenu };
}

// =============================================================================
// MENU BUILDER UTILITIES
// =============================================================================

export class MenuBuilder {
  private items: ContextMenuItem[] = [];

  static create() {
    return new MenuBuilder();
  }

  addItem(label: string, click?: () => void, options?: Partial<ContextMenuItem>) {
    this.items.push({
      label,
      click,
      type: 'normal',
      enabled: true,
      visible: true,
      ...options
    });
    return this;
  }

  addSeparator() {
    this.items.push({ type: 'separator' });
    return this;
  }

  addCheckbox(label: string, checked: boolean, click?: () => void, options?: Partial<ContextMenuItem>) {
    this.items.push({
      label,
      type: 'checkbox',
      checked,
      click,
      enabled: true,
      visible: true,
      ...options
    });
    return this;
  }

  addRadio(label: string, checked: boolean, click?: () => void, options?: Partial<ContextMenuItem>) {
    this.items.push({
      label,
      type: 'radio',
      checked,
      click,
      enabled: true,
      visible: true,
      ...options
    });
    return this;
  }

  addSubmenu(label: string, submenu: ContextMenuItem[], options?: Partial<ContextMenuItem>) {
    this.items.push({
      label,
      type: 'submenu',
      submenu,
      enabled: true,
      visible: true,
      ...options
    });
    return this;
  }

  addCopyPaste(
    onCut?: () => void,
    onCopy?: () => void,
    onPaste?: () => void,
    options?: {
      readonly showCut?: boolean;
      readonly showSelectAll?: boolean;
    }
  ) {
    if (options?.showCut !== false && onCut) {
      this.addItem('Cut', onCut, { accelerator: 'Ctrl+X' });
    }
    if (onCopy) {
      this.addItem('Copy', onCopy, { accelerator: 'Ctrl+C' });
    }
    if (onPaste) {
      this.addItem('Paste', onPaste, { accelerator: 'Ctrl+V' });
    }
    if (options?.showSelectAll !== false) {
      this.addSeparator();
      this.addItem('Select All', () => document.execCommand('selectAll'), { accelerator: 'Ctrl+A' });
    }
    return this;
  }

  build(): ContextMenuItem[] {
    return this.items;
  }
}

// =============================================================================
// COMMON MENU TEMPLATES
// =============================================================================

export const CommonMenus = {
  fileMenu: (handlers: {
    onNew?: () => void;
    onOpen?: () => void;
    onSave?: () => void;
    onSaveAs?: () => void;
    onClose?: () => void;
  }): MenuTemplate => ({
    label: 'File',
    submenu: [
      handlers.onNew && { label: 'New', accelerator: 'Ctrl+N', click: handlers.onNew },
      handlers.onOpen && { label: 'Open...', accelerator: 'Ctrl+O', click: handlers.onOpen },
      { type: 'separator' },
      handlers.onSave && { label: 'Save', accelerator: 'Ctrl+S', click: handlers.onSave },
      handlers.onSaveAs && { label: 'Save As...', accelerator: 'Ctrl+Shift+S', click: handlers.onSaveAs },
      { type: 'separator' },
      handlers.onClose && { label: 'Close', accelerator: 'Ctrl+W', click: handlers.onClose }
    ].filter(Boolean) as MenuTemplate[]
  }),

  editMenu: (handlers: {
    onUndo?: () => void;
    onRedo?: () => void;
    onCut?: () => void;
    onCopy?: () => void;
    onPaste?: () => void;
    onSelectAll?: () => void;
    onFind?: () => void;
    onReplace?: () => void;
  }): MenuTemplate => ({
    label: 'Edit',
    submenu: [
      handlers.onUndo && { label: 'Undo', accelerator: 'Ctrl+Z', click: handlers.onUndo },
      handlers.onRedo && { label: 'Redo', accelerator: 'Ctrl+Shift+Z', click: handlers.onRedo },
      { type: 'separator' },
      handlers.onCut && { label: 'Cut', accelerator: 'Ctrl+X', click: handlers.onCut },
      handlers.onCopy && { label: 'Copy', accelerator: 'Ctrl+C', click: handlers.onCopy },
      handlers.onPaste && { label: 'Paste', accelerator: 'Ctrl+V', click: handlers.onPaste },
      { type: 'separator' },
      handlers.onSelectAll && { label: 'Select All', accelerator: 'Ctrl+A', click: handlers.onSelectAll },
      { type: 'separator' },
      handlers.onFind && { label: 'Find...', accelerator: 'Ctrl+F', click: handlers.onFind },
      handlers.onReplace && { label: 'Replace...', accelerator: 'Ctrl+H', click: handlers.onReplace }
    ].filter(Boolean) as MenuTemplate[]
  }),

  viewMenu: (handlers: {
    onReload?: () => void;
    onToggleFullscreen?: () => void;
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    onResetZoom?: () => void;
    onToggleDevTools?: () => void;
  }): MenuTemplate => ({
    label: 'View',
    submenu: [
      handlers.onReload && { label: 'Reload', accelerator: 'Ctrl+R', click: handlers.onReload },
      handlers.onToggleFullscreen && { label: 'Toggle Fullscreen', accelerator: 'F11', click: handlers.onToggleFullscreen },
      { type: 'separator' },
      handlers.onZoomIn && { label: 'Zoom In', accelerator: 'Ctrl+Plus', click: handlers.onZoomIn },
      handlers.onZoomOut && { label: 'Zoom Out', accelerator: 'Ctrl+-', click: handlers.onZoomOut },
      handlers.onResetZoom && { label: 'Reset Zoom', accelerator: 'Ctrl+0', click: handlers.onResetZoom },
      { type: 'separator' },
      handlers.onToggleDevTools && { label: 'Toggle Developer Tools', accelerator: 'F12', click: handlers.onToggleDevTools }
    ].filter(Boolean) as MenuTemplate[]
  }),

  windowMenu: (): MenuTemplate => ({
    label: 'Window',
    submenu: [
      { label: 'Minimize', accelerator: 'Ctrl+M', click: () => (window as any).electronAPI?.minimizeWindow() },
      { label: 'Close', accelerator: 'Ctrl+W', click: () => (window as any).electronAPI?.closeWindow() }
    ]
  }),

  helpMenu: (handlers: {
    onHelp?: () => void;
    onAbout?: () => void;
    onCheckForUpdates?: () => void;
  }): MenuTemplate => ({
    label: 'Help',
    submenu: [
      handlers.onHelp && { label: 'Documentation', click: handlers.onHelp },
      handlers.onCheckForUpdates && { label: 'Check for Updates...', click: handlers.onCheckForUpdates },
      { type: 'separator' },
      handlers.onAbout && { label: 'About', click: handlers.onAbout }
    ].filter(Boolean) as MenuTemplate[]
  })
};

// =============================================================================
// EXPORT
// =============================================================================

export const NativeMenus = {
  ApplicationMenu,
  useContextMenu,
  MenuBuilder,
  CommonMenus
};

export default NativeMenus;