# Desktop Applications Quick Start Guide

> **Build modern desktop applications with Xala UI System using Electron, Tauri, or PWA**

## Table of Contents

- [Desktop Framework Setup](#desktop-framework-setup)
- [Desktop Layout Architecture](#desktop-layout-architecture)
- [Window Management](#window-management)
- [Menu Systems](#menu-systems)
- [Toolbar & Status Bar](#toolbar--status-bar)
- [Multi-Panel Layouts](#multi-panel-layouts)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Desktop-Specific Features](#desktop-specific-features)

## Desktop Framework Setup

### Electron Application

```bash
# Create Electron app with TypeScript
npx create-electron-app my-xala-app --template=typescript-webpack

# Install UI System
cd my-xala-app
npm install @xala-technologies/ui-system

# Install additional dependencies
npm install electron-window-state electron-updater
```

**src/renderer.tsx**

```tsx
import { createRoot } from 'react-dom/client';
import { DesignSystemProvider, DesktopLayout } from '@xala-technologies/ui-system';
import { App } from './components/App';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <DesignSystemProvider platform="desktop" locale="nb-NO" theme="enterprise-dark">
    <DesktopLayout>
      <App />
    </DesktopLayout>
  </DesignSystemProvider>
);
```

**src/main.ts**

```typescript
import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import windowStateKeeper from 'electron-window-state';

class XalaDesktopApp {
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    this.setupApp();
  }

  private setupApp(): void {
    app.whenReady().then(() => {
      this.createMainWindow();
      this.setupMenu();
      this.setupAutoUpdater();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') app.quit();
    });
  }

  private createMainWindow(): void {
    const mainWindowState = windowStateKeeper({
      defaultWidth: 1400,
      defaultHeight: 900,
    });

    this.mainWindow = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      minWidth: 800,
      minHeight: 600,
      titleBarStyle: 'hiddenInset',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js'),
      },
    });

    mainWindowState.manage(this.mainWindow);

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      this.mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
      this.mainWindow.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
      );
    }
  }
}

new XalaDesktopApp();
```

### Tauri Application

```bash
# Create Tauri app
npm create tauri-app@latest my-xala-app

# Install UI System
cd my-xala-app
npm install @xala-technologies/ui-system

# Install additional dependencies
npm install @tauri-apps/api
```

**src/App.tsx**

```tsx
import { DesignSystemProvider, DesktopLayout } from '@xala-technologies/ui-system';
import { invoke } from '@tauri-apps/api/tauri';
import { MainContent } from './components/MainContent';

function App(): React.ReactElement {
  return (
    <DesignSystemProvider platform="desktop" locale="nb-NO" theme="norwegian-desktop">
      <DesktopLayout>
        <MainContent />
      </DesktopLayout>
    </DesignSystemProvider>
  );
}

export default App;
```

**src-tauri/tauri.conf.json**

```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:1420",
    "distDir": "../dist"
  },
  "package": {
    "productName": "Xala Enterprise Desktop",
    "version": "1.0.0"
  },
  "tauri": {
    "windows": [
      {
        "title": "Xala Enterprise",
        "width": 1400,
        "height": 900,
        "minWidth": 800,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false,
        "decorations": false
      }
    ],
    "security": {
      "csp": "default-src 'self'; style-src 'self' 'unsafe-inline'"
    }
  }
}
```

### Progressive Web App (PWA)

```bash
# Create PWA-ready app
npx create-react-app my-xala-app --template typescript

# Install UI System and PWA dependencies
npm install @xala-technologies/ui-system workbox-webpack-plugin
```

**src/App.tsx**

```tsx
import { DesignSystemProvider, DesktopLayout } from '@xala-technologies/ui-system';
import { useEffect, useState } from 'react';

function App(): React.ReactElement {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Detect if running as desktop PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const hasDesktopViewport = window.innerWidth >= 1024;
    setIsDesktop(isStandalone && hasDesktopViewport);
  }, []);

  return (
    <DesignSystemProvider platform={isDesktop ? 'desktop' : 'web'} locale="nb-NO">
      <DesktopLayout enablePWAFeatures={isDesktop}>
        <MainContent />
      </DesktopLayout>
    </DesignSystemProvider>
  );
}

export default App;
```

## Desktop Layout Architecture

### Main Application Layout

```tsx
import {
  DesktopLayout,
  DesktopHeader,
  DesktopSidebar,
  DesktopMainContent,
  DesktopStatusBar,
  DesktopToolbar,
  WindowControls,
} from '@xala-technologies/ui-system';

export function MainDesktopApp(): React.ReactElement {
  return (
    <DesktopLayout>
      {/* Custom Title Bar */}
      <DesktopHeader>
        <WindowControls
          showTitle={true}
          title="Xala Enterprise - Norsk Compliance Suite"
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
          onClose={handleClose}
        />
        <DesktopToolbar>
          <ToolbarContent />
        </DesktopToolbar>
      </DesktopHeader>

      {/* Main Content Area */}
      <Stack direction="row" h="full">
        <DesktopSidebar
          width="280px"
          resizable={true}
          collapsible={true}
          navigation={mainNavigation}
        />

        <DesktopMainContent>
          <MainWorkspace />
        </DesktopMainContent>
      </Stack>

      {/* Status Bar */}
      <DesktopStatusBar>
        <StatusBarContent />
      </DesktopStatusBar>
    </DesktopLayout>
  );
}
```

### Multi-Window Layout

```tsx
import { WindowManager, Window, WindowTab, TabPanel } from '@xala-technologies/ui-system';

export function MultiWindowDesktop(): React.ReactElement {
  const [windows, setWindows] = useState([
    { id: 'main', title: 'Hovedvindu', component: MainWindow },
    { id: 'documents', title: 'Dokumenter', component: DocumentsWindow },
    { id: 'settings', title: 'Innstillinger', component: SettingsWindow },
  ]);

  return (
    <WindowManager>
      <Window id="main" title="Xala Enterprise" primary>
        <TabPanel
          tabs={[
            { key: 'dashboard', label: 'Dashboard', icon: 'home' },
            { key: 'users', label: 'Brukere', icon: 'users' },
            { key: 'reports', label: 'Rapporter', icon: 'chart' },
          ]}
          defaultTab="dashboard"
        >
          <DashboardContent />
          <UsersContent />
          <ReportsContent />
        </TabPanel>
      </Window>

      {/* Secondary Windows */}
      {windows.map(window => (
        <Window
          key={window.id}
          id={window.id}
          title={window.title}
          closable={window.id !== 'main'}
          onClose={() => closeWindow(window.id)}
        >
          <window.component />
        </Window>
      ))}
    </WindowManager>
  );
}
```

## Window Management

### Resizable Panels

```tsx
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizeHandle,
  Panel,
} from '@xala-technologies/ui-system';

export function ResizableWorkspace(): React.ReactElement {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      {/* Left Sidebar */}
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <Panel variant="sidebar">
          <NavigationPanel />
        </Panel>
      </ResizablePanel>

      <ResizeHandle />

      {/* Main Content Area */}
      <ResizablePanel defaultSize={60}>
        <ResizablePanelGroup direction="vertical">
          {/* Main Editor */}
          <ResizablePanel defaultSize={70}>
            <Panel variant="main">
              <EditorContent />
            </Panel>
          </ResizablePanel>

          <ResizeHandle />

          {/* Bottom Panel */}
          <ResizablePanel defaultSize={30} minSize={20}>
            <Panel variant="secondary">
              <PropertiesPanel />
            </Panel>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>

      <ResizeHandle />

      {/* Right Sidebar */}
      <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
        <Panel variant="sidebar">
          <InspectorPanel />
        </Panel>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
```

### Window State Management

```tsx
import { useWindowState, useWindowControls } from '@xala-technologies/ui-system';

export function WindowStateDemo(): React.ReactElement {
  const { isMaximized, isMinimized, isFullscreen, size, position } = useWindowState();

  const { minimize, maximize, restore, close, toggleFullscreen } = useWindowControls();

  return (
    <Stack direction="col" gap="4" p="4">
      <Heading level={2}>Vinduskontroller</Heading>

      <Stack direction="row" gap="2">
        <Button variant="outline" size="sm" onClick={minimize} disabled={isMinimized}>
          Minimer
        </Button>

        <Button variant="outline" size="sm" onClick={isMaximized ? restore : maximize}>
          {isMaximized ? 'Gjenopprett' : 'Maksimer'}
        </Button>

        <Button variant="outline" size="sm" onClick={toggleFullscreen}>
          {isFullscreen ? 'Avslutt fullskjerm' : 'Fullskjerm'}
        </Button>

        <Button variant="destructive" size="sm" onClick={close}>
          Lukk
        </Button>
      </Stack>

      <Card>
        <CardContent p="4">
          <Stack direction="col" gap="2">
            <Text>Status: {isMaximized ? 'Maksimert' : isMinimized ? 'Minimert' : 'Normal'}</Text>
            <Text>
              Størrelse: {size.width} × {size.height}
            </Text>
            <Text>
              Posisjon: ({position.x}, {position.y})
            </Text>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
```

## Menu Systems

### Application Menu Bar

```tsx
import { MenuBar, Menu, MenuItem, MenuSeparator, MenuGroup } from '@xala-technologies/ui-system';

export function ApplicationMenuBar(): React.ReactElement {
  const fileMenuItems = [
    { key: 'new', label: 'Ny', shortcut: 'Ctrl+N', action: createNew },
    { key: 'open', label: 'Åpne', shortcut: 'Ctrl+O', action: openFile },
    { key: 'save', label: 'Lagre', shortcut: 'Ctrl+S', action: saveFile },
    { key: 'separator1', type: 'separator' },
    { key: 'recent', label: 'Nylig brukte', submenu: recentFiles },
    { key: 'separator2', type: 'separator' },
    { key: 'exit', label: 'Avslutt', shortcut: 'Ctrl+Q', action: exitApp },
  ];

  const editMenuItems = [
    { key: 'undo', label: 'Angre', shortcut: 'Ctrl+Z', action: undo },
    { key: 'redo', label: 'Gjør om', shortcut: 'Ctrl+Y', action: redo },
    { key: 'separator1', type: 'separator' },
    { key: 'cut', label: 'Klipp ut', shortcut: 'Ctrl+X', action: cut },
    { key: 'copy', label: 'Kopier', shortcut: 'Ctrl+C', action: copy },
    { key: 'paste', label: 'Lim inn', shortcut: 'Ctrl+V', action: paste },
  ];

  const viewMenuItems = [
    {
      key: 'toolbar',
      label: 'Verktøylinje',
      type: 'checkbox',
      checked: showToolbar,
      action: toggleToolbar,
    },
    {
      key: 'sidebar',
      label: 'Sidefelt',
      type: 'checkbox',
      checked: showSidebar,
      action: toggleSidebar,
    },
    {
      key: 'statusbar',
      label: 'Statuslinje',
      type: 'checkbox',
      checked: showStatusBar,
      action: toggleStatusBar,
    },
    { key: 'separator1', type: 'separator' },
    { key: 'fullscreen', label: 'Fullskjerm', shortcut: 'F11', action: toggleFullscreen },
  ];

  return (
    <MenuBar>
      <Menu label="Fil" items={fileMenuItems} />
      <Menu label="Rediger" items={editMenuItems} />
      <Menu label="Vis" items={viewMenuItems} />
      <Menu label="Verktøy" items={toolsMenuItems} />
      <Menu label="Hjelp" items={helpMenuItems} />
    </MenuBar>
  );
}
```

### Context Menu System

```tsx
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  useContextMenu,
} from '@xala-technologies/ui-system';

export function ContextMenuExample(): React.ReactElement {
  const { showContextMenu } = useContextMenu();

  const handleRightClick = (event: React.MouseEvent, item: any): void => {
    event.preventDefault();

    const menuItems = [
      {
        key: 'open',
        label: 'Åpne',
        icon: 'external-link',
        action: () => openItem(item.id),
      },
      {
        key: 'edit',
        label: 'Rediger',
        icon: 'edit',
        action: () => editItem(item.id),
      },
      {
        key: 'separator1',
        type: 'separator',
      },
      {
        key: 'copy',
        label: 'Kopier',
        icon: 'copy',
        shortcut: 'Ctrl+C',
        action: () => copyItem(item.id),
      },
      {
        key: 'delete',
        label: 'Slett',
        icon: 'trash',
        variant: 'destructive',
        action: () => deleteItem(item.id),
      },
    ];

    showContextMenu({
      x: event.clientX,
      y: event.clientY,
      items: menuItems,
    });
  };

  return (
    <Grid cols={3} gap="4">
      {items.map(item => (
        <Card key={item.id} variant="elevated" onContextMenu={e => handleRightClick(e, item)}>
          <CardContent p="4">
            <ItemContent item={item} />
          </CardContent>
        </Card>
      ))}
    </Grid>
  );
}
```

## Toolbar & Status Bar

### Rich Toolbar

```tsx
import {
  Toolbar,
  ToolbarGroup,
  ToolbarButton,
  ToolbarSeparator,
  ToolbarDropdown,
  ToolbarInput,
} from '@xala-technologies/ui-system';

export function MainToolbar(): React.ReactElement {
  return (
    <Toolbar variant="primary">
      {/* File Operations */}
      <ToolbarGroup label="Fil">
        <ToolbarButton
          icon="file-plus"
          label="Ny"
          tooltip="Opprett nytt dokument (Ctrl+N)"
          onClick={createNew}
        />
        <ToolbarButton
          icon="folder-open"
          label="Åpne"
          tooltip="Åpne eksisterende dokument (Ctrl+O)"
          onClick={openFile}
        />
        <ToolbarButton
          icon="save"
          label="Lagre"
          tooltip="Lagre dokument (Ctrl+S)"
          onClick={saveFile}
          disabled={!hasUnsavedChanges}
        />
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Edit Operations */}
      <ToolbarGroup label="Rediger">
        <ToolbarButton
          icon="undo"
          label="Angre"
          tooltip="Angre siste handling (Ctrl+Z)"
          onClick={undo}
          disabled={!canUndo}
        />
        <ToolbarButton
          icon="redo"
          label="Gjør om"
          tooltip="Gjør om angret handling (Ctrl+Y)"
          onClick={redo}
          disabled={!canRedo}
        />
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* View Options */}
      <ToolbarGroup label="Vis">
        <ToolbarDropdown
          icon="zoom"
          label="Zoom"
          tooltip="Juster forstørrelse"
          items={[
            { key: '50', label: '50%' },
            { key: '75', label: '75%' },
            { key: '100', label: '100%' },
            { key: '150', label: '150%' },
            { key: '200', label: '200%' },
          ]}
          value={zoomLevel}
          onChange={setZoomLevel}
        />
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Search */}
      <ToolbarGroup label="Søk" flex="1" justify="end">
        <ToolbarInput
          placeholder="Søk i dokumenter..."
          value={searchQuery}
          onChange={setSearchQuery}
          icon="search"
          clearable
          shortcuts={['Ctrl+F']}
          maxW="300px"
        />
      </ToolbarGroup>
    </Toolbar>
  );
}
```

### Comprehensive Status Bar

```tsx
import {
  StatusBar,
  StatusBarSection,
  StatusBarItem,
  Badge,
  ProgressBar,
} from '@xala-technologies/ui-system';

export function ApplicationStatusBar(): React.ReactElement {
  return (
    <StatusBar>
      {/* Left Section - Document Info */}
      <StatusBarSection align="start">
        <StatusBarItem>
          <Stack direction="row" gap="2" align="center">
            <Icon name="document" size="14" />
            <Text size="sm">{currentDocument?.name || 'Intet dokument'}</Text>
            {hasUnsavedChanges && (
              <Badge variant="warning" size="xs">
                Ulagret
              </Badge>
            )}
          </Stack>
        </StatusBarItem>

        <StatusBarItem>
          <Text size="sm" color="muted-foreground">
            Linje {currentLine}, Kolonne {currentColumn}
          </Text>
        </StatusBarItem>
      </StatusBarSection>

      {/* Center Section - Progress */}
      <StatusBarSection align="center">
        {isProcessing && (
          <StatusBarItem>
            <Stack direction="row" gap="2" align="center">
              <ProgressBar value={processingProgress} max={100} size="sm" w="200px" />
              <Text size="sm">{processingStatus}</Text>
            </Stack>
          </StatusBarItem>
        )}
      </StatusBarSection>

      {/* Right Section - System Info */}
      <StatusBarSection align="end">
        <StatusBarItem clickable onClick={showNotifications}>
          <Stack direction="row" gap="1" align="center">
            <Icon name="bell" size="14" />
            {unreadNotifications > 0 && (
              <Badge variant="primary" size="xs">
                {unreadNotifications}
              </Badge>
            )}
          </Stack>
        </StatusBarItem>

        <StatusBarItem clickable onClick={showNetworkStatus}>
          <Stack direction="row" gap="2" align="center">
            <Icon
              name={isOnline ? 'wifi' : 'wifi-off'}
              size="14"
              color={isOnline ? 'success' : 'destructive'}
            />
            <Text size="sm">{isOnline ? 'Tilkoblet' : 'Frakoblet'}</Text>
          </Stack>
        </StatusBarItem>

        <StatusBarItem>
          <ClassificationIndicator level="ÅPEN" size="xs" showLabel={false} />
        </StatusBarItem>
      </StatusBarSection>
    </StatusBar>
  );
}
```

## Multi-Panel Layouts

### Three-Panel Layout

```tsx
import {
  PanelLayout,
  Panel,
  PanelHeader,
  PanelContent,
  PanelFooter,
  Splitter,
} from '@xala-technologies/ui-system';

export function ThreePanelLayout(): React.ReactElement {
  return (
    <PanelLayout direction="horizontal" h="full">
      {/* File Explorer Panel */}
      <Panel defaultSize={250} minSize={200} maxSize={400}>
        <PanelHeader>
          <Stack direction="row" gap="2" align="center" justify="between">
            <Text weight="medium">Filutforsker</Text>
            <IconButton
              icon="plus"
              label="Ny fil"
              size="xs"
              variant="ghost"
              onClick={createNewFile}
            />
          </Stack>
        </PanelHeader>

        <PanelContent>
          <FileExplorerTree />
        </PanelContent>

        <PanelFooter>
          <Text size="xs" color="muted-foreground">
            {fileCount} filer
          </Text>
        </PanelFooter>
      </Panel>

      <Splitter />

      {/* Main Editor Panel */}
      <Panel flex="1" minSize={400}>
        <PanelHeader>
          <TabBar
            tabs={openTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onTabClose={closeTab}
            closable
          />
        </PanelHeader>

        <PanelContent>
          <MainEditor />
        </PanelContent>

        <PanelFooter>
          <EditorStatusInfo />
        </PanelFooter>
      </Panel>

      <Splitter />

      {/* Properties Panel */}
      <Panel defaultSize={300} minSize={250} maxSize={500}>
        <PanelHeader>
          <Text weight="medium">Egenskaper</Text>
        </PanelHeader>

        <PanelContent>
          <PropertiesEditor />
        </PanelContent>
      </Panel>
    </PanelLayout>
  );
}
```

### Dockable Panels

```tsx
import { DockLayout, DockPanel, DockGroup, useDockState } from '@xala-technologies/ui-system';

export function DockableInterface(): React.ReactElement {
  const { layout, updateLayout } = useDockState();

  return (
    <DockLayout layout={layout} onLayoutChange={updateLayout}>
      <DockPanel id="explorer" title="Utforsker" icon="folder" defaultLocation="left" size={280}>
        <ExplorerContent />
      </DockPanel>

      <DockPanel id="editor" title="Redigering" icon="edit" defaultLocation="center" primary>
        <EditorContent />
      </DockPanel>

      <DockPanel
        id="properties"
        title="Egenskaper"
        icon="settings"
        defaultLocation="right"
        size={320}
      >
        <PropertiesContent />
      </DockPanel>

      <DockPanel id="output" title="Utdata" icon="terminal" defaultLocation="bottom" size={200}>
        <OutputContent />
      </DockPanel>

      <DockPanel
        id="problems"
        title="Problemer"
        icon="alert-triangle"
        defaultLocation="bottom"
        tabbed="output"
      >
        <ProblemsContent />
      </DockPanel>
    </DockLayout>
  );
}
```

## Keyboard Shortcuts

### Global Shortcut System

```tsx
import {
  useKeyboardShortcuts,
  ShortcutProvider,
  ShortcutRegistry,
} from '@xala-technologies/ui-system';

export function ShortcutDemo(): React.ReactElement {
  useKeyboardShortcuts([
    {
      key: 'Ctrl+N',
      description: 'Opprett nytt dokument',
      action: createNewDocument,
      global: true,
    },
    {
      key: 'Ctrl+O',
      description: 'Åpne dokument',
      action: openDocument,
      global: true,
    },
    {
      key: 'Ctrl+S',
      description: 'Lagre dokument',
      action: saveDocument,
      global: true,
      condition: () => hasActiveDocument,
    },
    {
      key: 'Ctrl+Shift+P',
      description: 'Vis kommandopalett',
      action: showCommandPalette,
      global: true,
    },
    {
      key: 'F1',
      description: 'Vis hjelp',
      action: showHelp,
      global: true,
    },
    {
      key: 'F11',
      description: 'Veksle fullskjerm',
      action: toggleFullscreen,
      global: true,
    },
  ]);

  return (
    <ShortcutProvider>
      <Stack direction="col" gap="4">
        <Heading level={2}>Hurtigtaster</Heading>
        <ShortcutRegistry />
        <ApplicationContent />
      </Stack>
    </ShortcutProvider>
  );
}
```

### Context-Sensitive Shortcuts

```tsx
import { useContextualShortcuts } from '@xala-technologies/ui-system';

export function EditorWithShortcuts(): React.ReactElement {
  const [selectedText, setSelectedText] = useState('');
  const [canUndo, setCanUndo] = useState(false);

  useContextualShortcuts('editor', [
    {
      key: 'Ctrl+Z',
      description: 'Angre',
      action: undo,
      enabled: canUndo,
    },
    {
      key: 'Ctrl+Y',
      description: 'Gjør om',
      action: redo,
      enabled: canRedo,
    },
    {
      key: 'Ctrl+F',
      description: 'Søk',
      action: showFindDialog,
    },
    {
      key: 'Ctrl+H',
      description: 'Erstatt',
      action: showReplaceDialog,
    },
    {
      key: 'Delete',
      description: 'Slett valgt tekst',
      action: deleteSelection,
      enabled: Boolean(selectedText),
    },
  ]);

  return (
    <Panel id="editor">
      <TextEditor value={content} onChange={setContent} onSelectionChange={setSelectedText} />
    </Panel>
  );
}
```

## Desktop-Specific Features

### Native Integration

```tsx
import {
  useNativeIntegration,
  SystemTray,
  NotificationManager,
  FileSystemAccess,
} from '@xala-technologies/ui-system';

export function NativeFeatures(): React.ReactElement {
  const { showNotification, registerFileType, setSystemTray, requestFileAccess } =
    useNativeIntegration();

  useEffect(() => {
    // Register file types
    registerFileType({
      extension: '.xala',
      description: 'Xala Document',
      icon: 'document.ico',
      openWith: 'XalaDesktop',
    });

    // Setup system tray
    setSystemTray({
      icon: 'tray-icon.png',
      tooltip: 'Xala Enterprise',
      menu: [
        { label: 'Åpne', action: showMainWindow },
        { label: 'Innstillinger', action: showSettings },
        { label: 'Avslutt', action: exitApplication },
      ],
    });
  }, []);

  const handleShowNotification = (): void => {
    showNotification({
      title: 'Xala Enterprise',
      body: 'Dokumentet ble lagret',
      icon: 'success',
      actions: [
        { label: 'Åpne mappe', action: openContainingFolder },
        { label: 'Lukk', action: dismissNotification },
      ],
    });
  };

  return (
    <Stack direction="col" gap="4">
      <Button onClick={handleShowNotification}>Vis systemvarsel</Button>

      <Button onClick={() => requestFileAccess('documents')}>Be om dokumenttilgang</Button>
    </Stack>
  );
}
```

### Performance Monitoring

```tsx
import {
  PerformanceMonitor,
  MemoryUsage,
  CPUUsage,
  NetworkStatus,
} from '@xala-technologies/ui-system';

export function PerformancePanel(): React.ReactElement {
  return (
    <Panel title="Systemytelse">
      <PanelContent>
        <Stack direction="col" gap="6">
          <PerformanceMonitor interval={1000}>
            {({ cpu, memory, network }) => (
              <>
                <Card>
                  <CardContent p="4">
                    <Stack direction="col" gap="3">
                      <Heading level={3} size="sm">
                        CPU-bruk
                      </Heading>
                      <ProgressBar
                        value={cpu.usage}
                        max={100}
                        color={cpu.usage > 80 ? 'destructive' : 'primary'}
                      />
                      <Text size="sm">{cpu.usage.toFixed(1)}%</Text>
                    </Stack>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent p="4">
                    <Stack direction="col" gap="3">
                      <Heading level={3} size="sm">
                        Minnebruk
                      </Heading>
                      <ProgressBar
                        value={memory.used}
                        max={memory.total}
                        color={memory.usage > 0.8 ? 'destructive' : 'primary'}
                      />
                      <Text size="sm">
                        {formatBytes(memory.used)} / {formatBytes(memory.total)}
                      </Text>
                    </Stack>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent p="4">
                    <Stack direction="col" gap="3">
                      <Heading level={3} size="sm">
                        Nettverksstatus
                      </Heading>
                      <Stack direction="row" gap="4">
                        <Stack direction="col" gap="1">
                          <Text size="xs" color="muted-foreground">
                            Ned
                          </Text>
                          <Text size="sm">{formatBandwidth(network.download)}</Text>
                        </Stack>
                        <Stack direction="col" gap="1">
                          <Text size="xs" color="muted-foreground">
                            Opp
                          </Text>
                          <Text size="sm">{formatBandwidth(network.upload)}</Text>
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </>
            )}
          </PerformanceMonitor>
        </Stack>
      </PanelContent>
    </Panel>
  );
}
```

## Best Practices

1. **Native look and feel** - Follow platform-specific design guidelines
2. **Keyboard accessibility** - Implement comprehensive keyboard navigation
3. **Window state persistence** - Save and restore window layouts
4. **Performance optimization** - Use virtualization for large datasets
5. **Error boundaries** - Implement proper error handling for desktop apps
6. **Auto-updates** - Implement seamless update mechanisms
7. **Norwegian compliance** - Ensure offline capability and data sovereignty
8. **Multi-monitor support** - Handle different screen configurations gracefully

## Next Steps

- **[Chat Interface Guide](./chat-interfaces.md)** - Add AI chat capabilities
- **[Component Reference](../components/README.md)** - Explore desktop-specific components
- **[Performance Guide](../performance.md)** - Advanced optimization for desktop apps
- **[Testing Guide](../testing/README.md)** - Desktop application testing strategies
