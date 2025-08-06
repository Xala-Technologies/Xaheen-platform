# Electron Platform Components

Enhanced React components with Electron-specific features for building native desktop applications.

## Overview

The Electron platform provides React components enhanced with native desktop capabilities:

- **Native Context Menus**: Right-click context menus using OS native menus
- **Keyboard Shortcuts**: Global and local keyboard shortcut support
- **File System Access**: Native file dialogs and file operations
- **Window Controls**: Custom title bars and window control buttons
- **Theme Integration**: Sync with OS theme preferences
- **Platform-Specific Styling**: Adapt UI for macOS, Windows, and Linux

## Components

### ElectronButton

Enhanced button with native features:

```tsx
import { ElectronButton } from '@xaheen-ai/design-system/electron';

<ElectronButton
  variant="primary"
  shortcut="Ctrl+S"
  nativeContextMenu
  contextMenuItems={[
    { label: 'Save', onClick: handleSave, shortcut: 'Ctrl+S' },
    { label: 'Save As...', onClick: handleSaveAs, shortcut: 'Ctrl+Shift+S' }
  ]}
>
  Save Document
</ElectronButton>
```

### ElectronInput

Input field with file picker and clipboard integration:

```tsx
import { ElectronInput } from '@xaheen-ai/design-system/electron';

<ElectronInput
  label="Select File"
  filePicker
  filePickerOptions={{
    filters: [
      { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  }}
  nativeContextMenu
  clipboardIntegration
/>
```

### ElectronCard

Card component with window dragging and glassmorphism:

```tsx
import { ElectronCard, CardTitle, CardContent } from '@xaheen-ai/design-system/electron';

<ElectronCard
  windowDraggable
  glassmorphism
  nativeContextMenu
  contextMenuItems={[
    { label: 'Edit', onClick: handleEdit },
    { label: 'Delete', onClick: handleDelete }
  ]}
>
  <CardTitle>Draggable Window Area</CardTitle>
  <CardContent>
    Click and drag this card to move the window
  </CardContent>
</ElectronCard>
```

### Window Controls

Native window control buttons and title bar:

```tsx
import { TitleBar, WindowControls } from '@xaheen-ai/design-system/electron';

<TitleBar
  title="My Electron App"
  showControls
  draggable
  height="md"
>
  {/* Additional title bar content */}
</TitleBar>

// Or use controls separately:
<WindowControls
  platform="auto" // or 'darwin', 'win32', 'linux'
  showMinimize
  showMaximize
  showClose
  onCloseRequest={async () => {
    // Custom close handling
    const shouldClose = await confirmClose();
    if (shouldClose) {
      window.close();
    }
  }}
/>
```

### Theme Switcher

OS-integrated theme switching:

```tsx
import { ElectronThemeSwitcher, useTheme } from '@xaheen-ai/design-system/electron';

function App() {
  const { theme, setTheme } = useTheme();
  
  return (
    <ElectronThemeSwitcher
      theme={theme}
      onThemeChange={setTheme}
      variant="dropdown" // or 'icon', 'toggle'
      showSystem
      syncWithOS
    />
  );
}
```

## Utilities

### ElectronUtils

Core utilities for Electron functionality:

```tsx
import { ElectronUtils, useElectron } from '@xaheen-ai/design-system/electron';

function MyComponent() {
  const { isElectron, platform, utils } = useElectron();
  
  if (!isElectron) {
    return <div>This feature requires Electron</div>;
  }
  
  const handleNotification = () => {
    utils.showNotification('Title', 'Body', {
      urgency: 'normal'
    });
  };
  
  const handleOpenFile = async () => {
    const paths = await utils.openFile({
      filters: [{ name: 'Text Files', extensions: ['txt'] }]
    });
    console.log('Selected:', paths);
  };
  
  return (
    <div>
      Platform: {platform}
      <button onClick={handleNotification}>Show Notification</button>
      <button onClick={handleOpenFile}>Open File</button>
    </div>
  );
}
```

### Native Menus

Application menus and context menus:

```tsx
import { ApplicationMenu, useContextMenu, MenuBuilder, CommonMenus } from '@xaheen-ai/design-system/electron';

// Application menu
<ApplicationMenu
  template={[
    CommonMenus.fileMenu({
      onNew: handleNew,
      onOpen: handleOpen,
      onSave: handleSave
    }),
    CommonMenus.editMenu({
      onUndo: handleUndo,
      onRedo: handleRedo,
      onCut: handleCut,
      onCopy: handleCopy,
      onPaste: handlePaste
    }),
    CommonMenus.viewMenu({
      onReload: () => window.location.reload(),
      onToggleFullscreen: handleFullscreen
    })
  ]}
  appName="My App"
  platformAdjust
  enableDevMenu
/>

// Context menu hook
function MyComponent() {
  const ref = useRef<HTMLDivElement>(null);
  
  const { showContextMenu } = useContextMenu({
    elementRef: ref,
    items: MenuBuilder.create()
      .addItem('Cut', handleCut, { accelerator: 'Ctrl+X' })
      .addItem('Copy', handleCopy, { accelerator: 'Ctrl+C' })
      .addItem('Paste', handlePaste, { accelerator: 'Ctrl+V' })
      .addSeparator()
      .addCheckbox('Show Rulers', showRulers, handleToggleRulers)
      .build()
  });
  
  return <div ref={ref}>Right-click me</div>;
}
```

### File System Access

File operations and drag-drop:

```tsx
import { useFilePicker, useFileSave, FileDropZone } from '@xaheen-ai/design-system/electron';

function FileManager() {
  const { open, selectedPaths, isLoading } = useFilePicker({
    accept: ['.txt', '.md'],
    multiple: true,
    onSelect: (paths) => {
      console.log('Selected files:', paths);
    }
  });
  
  const { save } = useFileSave({
    defaultName: 'document.txt',
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  return (
    <>
      <button onClick={open} disabled={isLoading}>
        Select Files
      </button>
      
      <button onClick={() => save('File content here')}>
        Save File
      </button>
      
      <FileDropZone
        accept={['.jpg', '.png', '.gif']}
        multiple
        maxSize={5 * 1024 * 1024} // 5MB
        onDrop={(files, paths) => {
          console.log('Dropped files:', files);
          console.log('File paths:', paths);
        }}
        onReject={(reason) => {
          console.error('Rejected:', reason);
        }}
      >
        <div className="border-2 border-dashed p-8 text-center">
          Drop files here
        </div>
      </FileDropZone>
    </>
  );
}
```

## Hooks

### useElectron

Access Electron utilities and platform info:

```tsx
const { isElectron, platform, utils } = useElectron();
```

### useDarkMode

Sync with OS dark mode preference:

```tsx
const isDark = useDarkMode();
```

### useShortcut

Register keyboard shortcuts:

```tsx
useShortcut('Ctrl+S', () => {
  console.log('Save triggered');
}, []);
```

### useTheme

Manage application theme:

```tsx
const { theme, effectiveTheme, setTheme } = useTheme();
```

## Quick Setup

Initialize Electron components with default configuration:

```tsx
import { QuickSetup } from '@xaheen-ai/design-system/electron';

// Initialize with default settings
QuickSetup.init({
  followSystem: true,
  transparency: false,
  nativeTitleBar: false
});

// Create app structure
const app = QuickSetup.createApp();

// Use components
<app.components.Button>Click me</app.components.Button>

// Use hooks
const { isElectron } = app.hooks.useElectron();

// Use utilities
app.utils.electron.showNotification('Hello', 'World');
```

## Platform-Specific Features

### macOS

- Traffic light window controls
- Vibrancy effects
- Native context menus
- Command key shortcuts

### Windows

- Custom title bar controls
- Native context menus
- Aero glass effects (Windows 11)
- Ctrl key shortcuts

### Linux

- GTK-style controls
- Native notifications
- System tray integration
- Standard shortcuts

## Requirements

- Electron 28.0.0 or higher
- React 18.0.0 or higher
- TypeScript 5.0.0 or higher

## Preload Script

Ensure your Electron preload script exposes the required APIs:

```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  
  // File system
  showOpenDialog: (options) => ipcRenderer.invoke('dialog:open', options),
  showSaveDialog: (options) => ipcRenderer.invoke('dialog:save', options),
  
  // Platform info
  getPlatform: () => process.platform,
  
  // Add other required APIs...
});
```

## TypeScript Support

All components are fully typed with TypeScript strict mode compliance. Import types as needed:

```tsx
import type { 
  ElectronButtonProps,
  ElectronInputProps,
  ElectronCardProps,
  ElectronAPI
} from '@xaheen-ai/design-system/electron';
```