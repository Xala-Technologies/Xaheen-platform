# 🖥️ Electron Platform Guide

## Overview

The Xaheen Design System Electron platform provides React components enhanced with native desktop capabilities for building professional desktop applications. This guide covers installation, setup, and usage of Electron-specific features.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Components](#core-components)
- [Native Integration](#native-integration)
- [Platform-Specific Features](#platform-specific-features)
- [Hooks and Utilities](#hooks-and-utilities)
- [Advanced Usage](#advanced-usage)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Installation

### Basic Installation

```bash
# Install Xaheen Design System with Electron support
npm install @xaheen/design-system electron react react-dom

# Or with yarn
yarn add @xaheen/design-system electron react react-dom

# Or with pnpm
pnpm add @xaheen/design-system electron react react-dom
```

### TypeScript Support

```bash
# Additional TypeScript packages
npm install -D @types/electron @types/react @types/react-dom typescript
```

### Development Dependencies

```bash
# Electron development tools
npm install -D electron-builder concurrently wait-on cross-env
```

## Quick Start

### 1. Electron Main Process Setup

```javascript
// main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset', // For custom title bar
    frame: false // Remove default frame
  });

  // Load your React app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile('build/index.html');
  }

  // Register IPC handlers for Xaheen components
  registerXaheenIPCHandlers(mainWindow);
}

function registerXaheenIPCHandlers(window) {
  // Window controls
  ipcMain.handle('window:minimize', () => window.minimize());
  ipcMain.handle('window:maximize', () => {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  });
  ipcMain.handle('window:close', () => window.close());
  
  // File dialogs
  ipcMain.handle('dialog:open', async (event, options) => {
    const result = await dialog.showOpenDialog(window, options);
    return result;
  });
  
  ipcMain.handle('dialog:save', async (event, options) => {
    const result = await dialog.showSaveDialog(window, options);
    return result;
  });
  
  // Platform info
  ipcMain.handle('platform:info', () => ({
    platform: process.platform,
    arch: process.arch,
    version: process.version
  }));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

### 2. Preload Script Setup

```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  
  // File system operations
  showOpenDialog: (options) => ipcRenderer.invoke('dialog:open', options),
  showSaveDialog: (options) => ipcRenderer.invoke('dialog:save', options),
  
  // Platform information
  getPlatformInfo: () => ipcRenderer.invoke('platform:info'),
  
  // Theme system
  onThemeChanged: (callback) => {
    ipcRenderer.on('theme:changed', (event, theme) => callback(theme));
  },
  
  // Notifications
  showNotification: (title, body, options) => 
    ipcRenderer.invoke('notification:show', { title, body, options }),
  
  // Menu system
  showContextMenu: (items, position) =>
    ipcRenderer.invoke('menu:show-context', items, position),
  
  // Keyboard shortcuts
  registerShortcut: (accelerator, callback) =>
    ipcRenderer.invoke('shortcut:register', accelerator, callback),
});

// Type definitions for TypeScript
window.electronAPI = window.electronAPI || {};
```

### 3. React App Setup

```tsx
// App.tsx
import React from 'react';
import { 
  ElectronProvider,
  TitleBar,
  Button,
  Input,
  Card,
  useElectron 
} from '@xaheen/design-system/electron';

export default function App() {
  return (
    <ElectronProvider>
      <div className="app">
        <TitleBar 
          title="My Electron App"
          showControls
          draggable
          height="md"
        />
        <MainContent />
      </div>
    </ElectronProvider>
  );
}

function MainContent() {
  const { isElectron, platform } = useElectron();
  
  if (!isElectron) {
    return <div>This app requires Electron to run.</div>;
  }

  return (
    <main className="p-8">
      <Card variant="elevated" padding="lg">
        <h1>Welcome to Electron on {platform}</h1>
        <p>Your desktop application is ready!</p>
      </Card>
    </main>
  );
}
```

### 4. Package.json Scripts

```json
{
  "main": "main.js",
  "homepage": "./",
  "scripts": {
    "electron": "electron .",
    "electron-dev": "concurrently \"npm start\" \"wait-on http://localhost:3000 && electron .\"",
    "electron-pack": "npm run build && electron-builder",
    "preelectron-pack": "npm run build"
  },
  "build": {
    "appId": "com.yourcompany.yourapp",
    "productName": "Your App",
    "directories": {
      "buildResources": "build"
    },
    "files": [
      "build/**/*",
      "main.js",
      "preload.js"
    ],
    "mac": {
      "target": "dmg"
    },
    "win": {
      "target": "nsis"
    },
    "linux": {
      "target": "AppImage"
    }
  }
}
```

## Core Components

### ElectronButton

Enhanced button with native desktop features:

```tsx
import { ElectronButton } from '@xaheen/design-system/electron';

function MyComponent() {
  return (
    <ElectronButton
      variant="primary"
      size="lg"
      
      // Keyboard shortcut
      shortcut="Ctrl+S"
      
      // Native context menu
      nativeContextMenu
      contextMenuItems={[
        { label: 'Save', onClick: handleSave, shortcut: 'Ctrl+S' },
        { type: 'separator' },
        { label: 'Save As...', onClick: handleSaveAs, shortcut: 'Ctrl+Shift+S' }
      ]}
      
      // Platform-specific styling
      glassmorphism={platform === 'darwin'}
      
      onClick={handleClick}
    >
      Save Document
    </ElectronButton>
  );
}
```

**Props:**
- `shortcut` - Global keyboard shortcut (e.g., 'Ctrl+S', 'Cmd+Enter')
- `nativeContextMenu` - Enable native context menu
- `contextMenuItems` - Context menu configuration
- `glassmorphism` - macOS-style glassmorphism effect
- `windowDraggable` - Make button area draggable for window movement

### ElectronInput

Input field with file picker and clipboard integration:

```tsx
import { ElectronInput } from '@xaheen/design-system/electron';

function FileInput() {
  const [filePath, setFilePath] = useState('');
  
  return (
    <ElectronInput
      label="Select File"
      value={filePath}
      onChange={(e) => setFilePath(e.target.value)}
      
      // File picker integration
      filePicker
      filePickerOptions={{
        title: 'Select a file',
        filters: [
          { name: 'Images', extensions: ['jpg', 'png', 'gif', 'webp'] },
          { name: 'Documents', extensions: ['pdf', 'doc', 'docx'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile', 'multiSelections']
      }}
      
      // Clipboard integration
      clipboardIntegration
      
      // Native context menu
      nativeContextMenu
      contextMenuItems={[
        { label: 'Paste', onClick: handlePaste, accelerator: 'Ctrl+V' },
        { label: 'Clear', onClick: handleClear },
        { type: 'separator' },
        { label: 'Browse...', onClick: () => {} } // Handled by filePicker
      ]}
    />
  );
}
```

**Props:**
- `filePicker` - Enable file picker button
- `filePickerOptions` - Electron dialog options
- `clipboardIntegration` - Enable clipboard operations
- `directoryPicker` - Pick directories instead of files
- `saveDialog` - Use save dialog instead of open dialog

### ElectronCard

Card component with window dragging and native features:

```tsx
import { ElectronCard, CardHeader, CardContent, CardFooter } from '@xaheen/design-system/electron';

function DraggableCard() {
  return (
    <ElectronCard
      variant="elevated"
      padding="lg"
      
      // Make card draggable for window movement
      windowDraggable
      
      // macOS glassmorphism
      glassmorphism
      
      // Native context menu
      nativeContextMenu
      contextMenuItems={[
        { label: 'Edit', onClick: handleEdit, accelerator: 'Ctrl+E' },
        { label: 'Duplicate', onClick: handleDuplicate },
        { type: 'separator' },
        { label: 'Delete', onClick: handleDelete, accelerator: 'Delete' }
      ]}
      
      // Hover effects
      hoverable
    >
      <CardHeader 
        title="Draggable Window Area"
        subtitle="Click and drag to move window"
      />
      <CardContent>
        <p>This card enables window dragging when clicked and dragged.</p>
      </CardContent>
    </ElectronCard>
  );
}
```

## Native Integration

### Window Controls

Custom title bar and window control buttons:

```tsx
import { TitleBar, WindowControls, useWindowState } from '@xaheen/design-system/electron';

function CustomTitleBar() {
  const { isMaximized, isMinimized, isFullscreen } = useWindowState();
  
  return (
    <TitleBar
      title="My Electron App"
      subtitle="v1.0.0"
      
      // Window controls
      showControls
      controlsPosition="right" // 'left' for macOS, 'right' for Windows/Linux
      
      // Draggable area
      draggable
      
      // Height variants
      height="lg" // 'sm' | 'md' | 'lg'
      
      // Custom content
      leftContent={<AppLogo />}
      rightContent={<UserMenu />}
      
      // Styling
      variant="default" // 'default' | 'minimal' | 'elevated'
      transparent={platform === 'darwin'}
    >
      {/* Additional title bar content */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm">File</Button>
        <Button variant="ghost" size="sm">Edit</Button>
        <Button variant="ghost" size="sm">View</Button>
      </div>
    </TitleBar>
  );
}

// Or use window controls separately
function CustomControls() {
  return (
    <WindowControls
      // Auto-detect platform styling
      platform="auto" // or 'darwin', 'win32', 'linux'
      
      // Control visibility
      showMinimize
      showMaximize  
      showClose
      
      // Custom handlers
      onMinimizeRequest={() => console.log('Minimize requested')}
      onMaximizeRequest={() => console.log('Maximize requested')}
      onCloseRequest={async () => {
        const shouldClose = await confirmClose();
        if (shouldClose) {
          window.close();
        }
      }}
      
      // Styling
      variant="default" // 'default' | 'filled' | 'outlined'
      size="md" // 'sm' | 'md' | 'lg'
    />
  );
}
```

### File System Integration

Native file dialogs and operations:

```tsx
import { 
  useFilePicker, 
  useFileSave, 
  FileDropZone,
  useRecentFiles 
} from '@xaheen/design-system/electron';

function FileManager() {
  // File picker hook
  const { openFile, selectedPaths, isLoading: isPickerLoading } = useFilePicker({
    filters: [
      { name: 'Text Files', extensions: ['txt', 'md', 'rtf'] },
      { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile', 'multiSelections'],
    onSelect: (paths) => {
      console.log('Selected files:', paths);
      handleFileSelection(paths);
    },
    onError: (error) => {
      console.error('File selection error:', error);
    }
  });
  
  // File save hook
  const { saveFile, isLoading: isSaveLoading } = useFileSave({
    defaultName: 'document.txt',
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    onSave: (filePath) => {
      console.log('File saved to:', filePath);
    }
  });
  
  // Recent files management
  const { recentFiles, addRecentFile, clearRecentFiles } = useRecentFiles({
    maxItems: 10
  });
  
  const handleSaveDocument = async () => {
    const content = 'Document content here...';
    await saveFile(content);
  };
  
  return (
    <div className="space-y-6">
      {/* File picker buttons */}
      <div className="flex gap-4">
        <Button 
          onClick={openFile} 
          disabled={isPickerLoading}
          startIcon={<FolderOpenIcon />}
        >
          Open Files
        </Button>
        
        <Button 
          onClick={handleSaveDocument}
          disabled={isSaveLoading}
          startIcon={<SaveIcon />}
        >
          Save Document
        </Button>
      </div>
      
      {/* Recent files */}
      {recentFiles.length > 0 && (
        <Card>
          <CardHeader title="Recent Files" />
          <CardContent>
            <ul className="space-y-2">
              {recentFiles.map((file, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="truncate">{file.name}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleOpenRecentFile(file)}
                  >
                    Open
                  </Button>
                </li>
              ))}
            </ul>
            <Button variant="outline" size="sm" onClick={clearRecentFiles}>
              Clear Recent
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Drag and drop zone */}
      <FileDropZone
        accept={['.jpg', '.png', '.gif', '.txt', '.pdf']}
        multiple
        maxSize={10 * 1024 * 1024} // 10MB
        onDrop={(files, paths) => {
          console.log('Dropped files:', files);
          console.log('File paths:', paths);
          handleFileDrop(files, paths);
        }}
        onReject={(rejectedFiles) => {
          console.error('Rejected files:', rejectedFiles);
        }}
        onError={(error) => {
          console.error('Drop error:', error);
        }}
      >
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors">
          <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supports: Images, Text files, PDFs (max 10MB)
          </p>
        </div>
      </FileDropZone>
    </div>
  );
}
```

### Native Menus

Application menus and context menus:

```tsx
import { 
  ApplicationMenu, 
  useContextMenu, 
  MenuBuilder, 
  CommonMenus 
} from '@xaheen/design-system/electron';

function AppWithMenus() {
  return (
    <div>
      {/* Application menu bar */}
      <ApplicationMenu
        template={[
          // Pre-built common menus
          CommonMenus.fileMenu({
            onNew: handleNew,
            onOpen: handleOpen,
            onSave: handleSave,
            onSaveAs: handleSaveAs,
            onClose: handleClose,
            onExit: handleExit
          }),
          
          CommonMenus.editMenu({
            onUndo: handleUndo,
            onRedo: handleRedo,
            onCut: handleCut,
            onCopy: handleCopy,
            onPaste: handlePaste,
            onSelectAll: handleSelectAll
          }),
          
          CommonMenus.viewMenu({
            onReload: () => window.location.reload(),
            onToggleDevTools: toggleDevTools,
            onToggleFullscreen: handleToggleFullscreen,
            onActualSize: handleActualSize,
            onZoomIn: handleZoomIn,
            onZoomOut: handleZoomOut
          }),
          
          // Custom menu
          {
            label: 'Tools',
            submenu: [
              {
                label: 'Preferences',
                accelerator: 'Ctrl+,',
                click: handlePreferences
              },
              { type: 'separator' },
              {
                label: 'Export Data',
                submenu: [
                  { label: 'Export as JSON', click: handleExportJSON },
                  { label: 'Export as CSV', click: handleExportCSV }
                ]
              }
            ]
          },
          
          CommonMenus.helpMenu({
            onAbout: handleAbout,
            onCheckForUpdates: handleCheckUpdates,
            onVisitWebsite: () => shell.openExternal('https://yourwebsite.com')
          })
        ]}
        
        appName="My Electron App"
        platformAdjust // Automatically adjust for macOS/Windows/Linux
        enableDevMenu={process.env.NODE_ENV === 'development'}
      />
      
      <MainContent />
    </div>
  );
}

// Context menu component
function ContextMenuExample() {
  const ref = useRef<HTMLDivElement>(null);
  
  const { showContextMenu, hideContextMenu } = useContextMenu({
    elementRef: ref,
    items: MenuBuilder.create()
      // Basic items
      .addItem('Cut', handleCut, { 
        accelerator: 'Ctrl+X',
        enabled: hasSelection 
      })
      .addItem('Copy', handleCopy, { 
        accelerator: 'Ctrl+C',
        enabled: hasSelection 
      })
      .addItem('Paste', handlePaste, { 
        accelerator: 'Ctrl+V',
        enabled: canPaste 
      })
      
      // Separator
      .addSeparator()
      
      // Checkbox items
      .addCheckbox('Show Rulers', showRulers, handleToggleRulers)
      .addCheckbox('Show Grid', showGrid, handleToggleGrid)
      
      // Radio group
      .addRadioGroup([
        { label: 'Small Icons', value: 'small', checked: iconSize === 'small' },
        { label: 'Medium Icons', value: 'medium', checked: iconSize === 'medium' },
        { label: 'Large Icons', value: 'large', checked: iconSize === 'large' }
      ], handleIconSizeChange)
      
      // Submenu
      .addSubmenu('Export', [
        { label: 'Export as PNG', click: () => handleExport('png') },
        { label: 'Export as SVG', click: () => handleExport('svg') },
        { label: 'Export as PDF', click: () => handleExport('pdf') }
      ])
      
      .build(),
    
    onShow: () => console.log('Context menu shown'),
    onHide: () => console.log('Context menu hidden')
  });
  
  return (
    <div 
      ref={ref}
      className="p-8 bg-gray-100 rounded-lg min-h-48"
      onContextMenu={(e) => {
        e.preventDefault();
        showContextMenu();
      }}
    >
      <p>Right-click me for context menu</p>
    </div>
  );
}
```

## Platform-Specific Features

### macOS Features

```tsx
import { 
  useVibrancy, 
  useTrafficLights,
  MacOSControls 
} from '@xaheen/design-system/electron';

function MacOSSpecificFeatures() {
  // Vibrancy effects
  const { enableVibrancy, disableVibrancy } = useVibrancy();
  
  // Traffic light controls
  const { 
    isRedHovered, 
    isYellowHovered, 
    isGreenHovered 
  } = useTrafficLights();
  
  useEffect(() => {
    // Enable vibrancy for macOS
    if (platform === 'darwin') {
      enableVibrancy('sidebar'); // 'sidebar', 'window', 'menu', etc.
    }
    
    return () => disableVibrancy();
  }, []);
  
  return (
    <div className="macos-window">
      {/* Custom traffic lights */}
      <MacOSControls
        variant="filled" // 'filled' | 'outline'
        position="left"
        onRedClick={handleClose}
        onYellowClick={handleMinimize}
        onGreenClick={handleMaximize}
        className="absolute top-4 left-4 z-50"
      />
      
      {/* Vibrancy content */}
      <Card 
        className="backdrop-blur-lg bg-white/30"
        variant="glass"
      >
        <CardContent>
          <p>macOS vibrancy effects enabled</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Windows Features

```tsx
import { 
  WindowsControls,
  useAcrylicEffect,
  useJumpList 
} from '@xaheen/design-system/electron';

function WindowsSpecificFeatures() {
  // Acrylic effect for Windows 11
  const { enableAcrylic, disableAcrylic } = useAcrylicEffect();
  
  // Jump list management
  const { setJumpList, clearJumpList } = useJumpList();
  
  useEffect(() => {
    if (platform === 'win32') {
      // Enable acrylic effect
      enableAcrylic();
      
      // Set up jump list
      setJumpList([
        {
          type: 'custom',
          name: 'Recent Projects',
          items: [
            {
              type: 'file',
              path: 'C:\\Users\\...\\project1.json',
              title: 'Project 1'
            },
            {
              type: 'file',
              path: 'C:\\Users\\...\\project2.json',
              title: 'Project 2'
            }
          ]
        }
      ]);
    }
    
    return () => {
      disableAcrylic();
      clearJumpList();
    };
  }, []);
  
  return (
    <div className="windows-window">
      {/* Windows-style controls */}
      <WindowsControls
        variant="fluent" // 'fluent' | 'classic'
        showMinimize
        showMaximize
        showClose
        theme="auto" // 'light' | 'dark' | 'auto'
      />
      
      {/* Acrylic content */}
      <Card className="backdrop-blur-sm bg-white/80">
        <CardContent>
          <p>Windows acrylic effects enabled</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Linux Features

```tsx
import { 
  LinuxControls,
  useSystemTheme,
  useNotifications 
} from '@xaheen/design-system/electron';

function LinuxSpecificFeatures() {
  const { systemTheme, followSystemTheme } = useSystemTheme();
  const { showNotification, isSupported } = useNotifications();
  
  useEffect(() => {
    if (platform === 'linux') {
      followSystemTheme(true);
      
      if (isSupported) {
        showNotification('Welcome', 'Application started successfully', {
          urgency: 'normal',
          timeout: 5000
        });
      }
    }
  }, []);
  
  return (
    <div className="linux-window">
      {/* GTK-style controls */}
      <LinuxControls
        variant="gtk" // 'gtk' | 'kde' | 'generic'
        position="right"
        showMinimize
        showMaximize
        showClose
      />
      
      {/* System theme integration */}
      <Card className={`${systemTheme === 'dark' ? 'dark' : 'light'}-theme`}>
        <CardContent>
          <p>Following system theme: {systemTheme}</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Hooks and Utilities

### useElectron Hook

Access Electron utilities and platform information:

```tsx
import { useElectron } from '@xaheen/design-system/electron';

function MyComponent() {
  const { 
    isElectron,
    platform,
    version,
    utils,
    isOnline,
    batteryLevel
  } = useElectron();
  
  if (!isElectron) {
    return <div>This feature requires Electron</div>;
  }
  
  const handleShowNotification = async () => {
    await utils.showNotification('Hello World', 'This is a notification', {
      urgency: 'normal',
      timeout: 5000,
      actions: [
        { text: 'OK', type: 'button' }
      ]
    });
  };
  
  const handleOpenExternal = async () => {
    await utils.openExternal('https://example.com');
  };
  
  return (
    <div>
      <p>Platform: {platform}</p>
      <p>Electron Version: {version}</p>
      <p>Online Status: {isOnline ? 'Online' : 'Offline'}</p>
      <p>Battery Level: {batteryLevel ? `${batteryLevel}%` : 'Unknown'}</p>
      
      <div className="space-x-4">
        <Button onClick={handleShowNotification}>
          Show Notification
        </Button>
        <Button onClick={handleOpenExternal}>
          Open External Link
        </Button>
      </div>
    </div>
  );
}
```

### useKeyboardShortcuts Hook

Register global keyboard shortcuts:

```tsx
import { useKeyboardShortcuts } from '@xaheen/design-system/electron';

function ShortcutManager() {
  const { registerShortcut, unregisterShortcut, listShortcuts } = useKeyboardShortcuts();
  
  useEffect(() => {
    // Register shortcuts
    const shortcuts = [
      { key: 'Ctrl+N', action: handleNew, description: 'Create new document' },
      { key: 'Ctrl+O', action: handleOpen, description: 'Open document' },
      { key: 'Ctrl+S', action: handleSave, description: 'Save document' },
      { key: 'Ctrl+Shift+S', action: handleSaveAs, description: 'Save document as...' },
      { key: 'F11', action: handleToggleFullscreen, description: 'Toggle fullscreen' },
      { key: 'Ctrl+Shift+I', action: handleToggleDevTools, description: 'Toggle developer tools' }
    ];
    
    shortcuts.forEach(({ key, action, description }) => {
      registerShortcut(key, action, { description });
    });
    
    return () => {
      shortcuts.forEach(({ key }) => {
        unregisterShortcut(key);
      });
    };
  }, []);
  
  const activeShortcuts = listShortcuts();
  
  return (
    <Card>
      <CardHeader title="Keyboard Shortcuts" />
      <CardContent>
        <ul className="space-y-2">
          {activeShortcuts.map((shortcut) => (
            <li key={shortcut.key} className="flex justify-between">
              <span>{shortcut.description}</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                {shortcut.key}
              </code>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
```

### useTheme Hook

Manage application theme with OS integration:

```tsx
import { useTheme } from '@xaheen/design-system/electron';

function ThemeManager() {
  const { 
    theme, 
    effectiveTheme, 
    setTheme, 
    followSystemTheme,
    systemTheme,
    isFollowingSystem
  } = useTheme();
  
  return (
    <Card>
      <CardHeader title="Theme Settings" />
      <CardContent className="space-y-4">
        <div>
          <p>Current Theme: {effectiveTheme}</p>
          <p>System Theme: {systemTheme}</p>
          <p>Following System: {isFollowingSystem ? 'Yes' : 'No'}</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={theme === 'light' ? 'primary' : 'outline'}
            onClick={() => setTheme('light')}
          >
            Light
          </Button>
          <Button 
            variant={theme === 'dark' ? 'primary' : 'outline'}
            onClick={() => setTheme('dark')}
          >
            Dark
          </Button>
          <Button 
            variant={theme === 'system' ? 'primary' : 'outline'}
            onClick={() => {
              setTheme('system');
              followSystemTheme(true);
            }}
          >
            System
          </Button>
        </div>
        
        <ElectronThemeSwitcher
          theme={theme}
          onThemeChange={setTheme}
          variant="dropdown"
          showSystem
          syncWithOS
        />
      </CardContent>
    </Card>
  );
}
```

## Advanced Usage

### Custom IPC Communication

```tsx
import { useIPC } from '@xaheen/design-system/electron';

function CustomIPCExample() {
  const { send, invoke, on, removeListener } = useIPC();
  
  useEffect(() => {
    // Listen for messages from main process
    const handleDataUpdate = (event, data) => {
      console.log('Data updated:', data);
      setData(data);
    };
    
    on('data-updated', handleDataUpdate);
    
    return () => {
      removeListener('data-updated', handleDataUpdate);
    };
  }, []);
  
  const handleFetchData = async () => {
    try {
      const result = await invoke('fetch-data', { 
        endpoint: 'users',
        limit: 50 
      });
      console.log('Data fetched:', result);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };
  
  const handleSendMessage = () => {
    send('user-action', { 
      action: 'click',
      timestamp: Date.now() 
    });
  };
  
  return (
    <div className="space-y-4">
      <Button onClick={handleFetchData}>
        Fetch Data
      </Button>
      <Button onClick={handleSendMessage}>
        Send Message
      </Button>
    </div>
  );
}
```

### Auto-Updater Integration

```tsx
import { useAutoUpdater } from '@xaheen/design-system/electron';

function UpdateManager() {
  const {
    updateAvailable,
    updateDownloaded,
    downloadProgress,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    skipVersion,
    currentVersion,
    availableVersion
  } = useAutoUpdater({
    autoCheck: true,
    checkInterval: 3600000, // 1 hour
    allowPrerelease: false
  });
  
  if (updateAvailable && !updateDownloaded) {
    return (
      <Card variant="elevated" className="border-blue-200 bg-blue-50">
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Update Available</h3>
              <p className="text-sm text-gray-600">
                Version {availableVersion} is available. 
                You're currently on {currentVersion}.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => skipVersion(availableVersion)}>
                Skip
              </Button>
              <Button onClick={downloadUpdate}>
                Download
              </Button>
            </div>
          </div>
          
          {downloadProgress > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Downloading... {downloadProgress}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  if (updateDownloaded) {
    return (
      <Card variant="elevated" className="border-green-200 bg-green-50">
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Update Ready</h3>
              <p className="text-sm text-gray-600">
                Version {availableVersion} has been downloaded and is ready to install.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {}}>
                Later
              </Button>
              <Button onClick={installUpdate}>
                Restart & Install
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return null;
}
```

## Best Practices

### 1. Security Best Practices

```javascript
// ✅ Good - Secure main process
const mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,        // Disable node integration in renderer
    contextIsolation: true,        // Enable context isolation
    enableRemoteModule: false,     // Disable remote module
    preload: path.join(__dirname, 'preload.js'), // Use preload script
    sandbox: true,                 // Enable sandbox (optional)
    webSecurity: true             // Enable web security
  }
});

// ✅ Good - Secure preload script
const { contextBridge, ipcRenderer } = require('electron');

// Only expose necessary APIs
contextBridge.exposeInMainWorld('electronAPI', {
  // Specific methods only
  openFile: (filters) => ipcRenderer.invoke('dialog:open', filters),
  saveFile: (content, options) => ipcRenderer.invoke('dialog:save', content, options)
});

// ❌ Avoid - Insecure practices
const { remote } = require('electron'); // Don't use remote module
window.require = require;              // Don't expose require
```

### 2. Performance Optimization

```tsx
// ✅ Good - Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  );
}

// ✅ Good - Optimize IPC calls
const { debounce } = useElectron();

const debouncedSave = useCallback(
  debounce(async (data) => {
    await electronAPI.saveFile(data);
  }, 500),
  []
);

// ✅ Good - Memory management
useEffect(() => {
  const cleanup = registerEventListener('data-changed', handleDataChange);
  return cleanup; // Always cleanup listeners
}, []);
```

### 3. Error Handling

```tsx
// ✅ Good - Comprehensive error handling
function FileHandler() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFileOperation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await electronAPI.processFile(filePath);
      console.log('File processed:', result);
    } catch (err) {
      console.error('File processing failed:', err);
      setError(err.message);
      
      // Show user-friendly error
      await electronAPI.showErrorDialog({
        title: 'File Processing Error',
        content: 'Unable to process the selected file. Please try again.',
        detail: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <Button 
        onClick={handleFileOperation}
        disabled={isLoading}
        loading={isLoading}
      >
        Process File
      </Button>
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

### 4. Testing Strategies

```typescript
// Jest test for Electron components
import { render, screen, fireEvent } from '@testing-library/react';
import { ElectronProvider } from '@xaheen/design-system/electron';
import MyComponent from './MyComponent';

// Mock Electron APIs
const mockElectronAPI = {
  showOpenDialog: jest.fn(),
  getPlatformInfo: jest.fn().mockResolvedValue({ platform: 'darwin' }),
  minimizeWindow: jest.fn(),
  maximizeWindow: jest.fn(),
  closeWindow: jest.fn()
};

// Make mock available globally
global.electronAPI = mockElectronAPI;

describe('MyComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render correctly in Electron environment', () => {
    render(
      <ElectronProvider>
        <MyComponent />
      </ElectronProvider>
    );
    
    expect(screen.getByText('My Electron App')).toBeInTheDocument();
  });
  
  it('should handle file selection', async () => {
    mockElectronAPI.showOpenDialog.mockResolvedValue({
      canceled: false,
      filePaths: ['/path/to/file.txt']
    });
    
    render(
      <ElectronProvider>
        <MyComponent />
      </ElectronProvider>
    );
    
    const openButton = screen.getByText('Open File');
    fireEvent.click(openButton);
    
    await expect(mockElectronAPI.showOpenDialog).toHaveBeenCalledWith({
      filters: [{ name: 'Text Files', extensions: ['txt'] }]
    });
  });
});
```

## Troubleshooting

### Common Issues

#### 1. Context Isolation Errors

```typescript
// Problem: Can't access Electron APIs
// Error: "electronAPI is not defined"

// Solution: Ensure preload script is properly configured
// main.js
const mainWindow = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,
    preload: path.join(__dirname, 'preload.js')
  }
});

// preload.js  
contextBridge.exposeInMainWorld('electronAPI', {
  // Your APIs here
});
```

#### 2. Menu Not Showing on macOS

```javascript
// Problem: Application menu not visible on macOS
// Solution: Set application menu in main process
const { Menu } = require('electron');

const template = [
  {
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }
  // ... other menu items
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
```

#### 3. File Dialogs Not Working

```typescript
// Problem: File dialogs don't open
// Solution: Ensure proper IPC setup in main process

// main.js
ipcMain.handle('dialog:open', async (event, options) => {
  const { dialog } = require('electron');
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

// Component
const { openFile } = useFilePicker({
  onError: (error) => {
    console.error('File picker error:', error);
    // Handle error appropriately
  }
});
```

#### 4. Theme Not Syncing

```tsx
// Problem: Theme changes not reflected
// Solution: Ensure proper theme provider setup

function App() {
  return (
    <ElectronProvider
      config={{
        theme: {
          followSystem: true,
          syncWithOS: true
        }
      }}
    >
      <YourApp />
    </ElectronProvider>
  );
}
```

### Performance Issues

#### 1. Slow Startup

```javascript
// Optimize main process startup
const { app } = require('electron');

app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder');
app.commandLine.appendSwitch('disable-features', 'VizDisplayCompositor');

// Reduce initial window creation time
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // Don't show until ready
    webPreferences: {
      backgroundThrottling: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  
  // Show when ready to prevent white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}
```

#### 2. Memory Leaks

```tsx
// Prevent memory leaks in components
function MyComponent() {
  useEffect(() => {
    const handleDataUpdate = (data) => {
      // Handle data
    };
    
    // Register listener
    electronAPI.onDataUpdate(handleDataUpdate);
    
    // Cleanup
    return () => {
      electronAPI.removeDataUpdateListener(handleDataUpdate);
    };
  }, []);
  
  return <div>Component content</div>;
}
```

### Development Tips

1. **Use Electron DevTools**: Enable developer tools in development
2. **Test on All Platforms**: Ensure cross-platform compatibility
3. **Monitor Performance**: Use Electron's built-in performance tools
4. **Security First**: Always follow Electron security best practices
5. **Update Regularly**: Keep Electron and dependencies updated

For more help, check:
- [Electron Documentation](https://www.electronjs.org/docs)
- [Xaheen GitHub Issues](https://github.com/xaheen-org/design-system/issues)
- [Community Discord](https://discord.gg/xaheen)

## Conclusion

The Xaheen Design System Electron platform provides a comprehensive solution for building professional desktop applications with native functionality and consistent design. By leveraging React components enhanced with Electron-specific features, you can create powerful cross-platform desktop applications that feel truly native on each operating system.

Remember to follow security best practices, optimize for performance, and test thoroughly across all target platforms for the best user experience.