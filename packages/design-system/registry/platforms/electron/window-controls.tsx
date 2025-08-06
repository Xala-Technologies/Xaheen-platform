/**
 * Electron Window Controls
 * Native window control buttons for frameless windows
 */

import React, { useCallback, useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { ElectronUtils } from './electron-utils';

// =============================================================================
// COMPONENT INTERFACE
// =============================================================================

export interface WindowControlsProps {
  /**
   * Platform styling override
   */
  readonly platform?: 'darwin' | 'win32' | 'linux' | 'auto';
  
  /**
   * Show minimize button
   */
  readonly showMinimize?: boolean;
  
  /**
   * Show maximize button
   */
  readonly showMaximize?: boolean;
  
  /**
   * Show close button
   */
  readonly showClose?: boolean;
  
  /**
   * Additional CSS classes
   */
  readonly className?: string;
  
  /**
   * Control button style
   */
  readonly variant?: 'default' | 'minimal' | 'custom';
  
  /**
   * Custom close handler (useful for confirmation dialogs)
   */
  readonly onCloseRequest?: () => void | Promise<void>;
}

// =============================================================================
// PLATFORM-SPECIFIC ICONS
// =============================================================================

const MacOSMinimizeIcon: React.FC = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
    <path d="M0 5h10v1H0z" />
  </svg>
);

const MacOSMaximizeIcon: React.FC = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
    <path d="M0 0h10v10H0z" fill="none" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const MacOSRestoreIcon: React.FC = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
    <path d="M2 0h6v6H2z M0 2h6v6H0z" fill="none" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const MacOSCloseIcon: React.FC = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
    <path d="M1 1l8 8m0-8L1 9" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const WindowsMinimizeIcon: React.FC = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
    <path d="M0 5h10v1H0z" />
  </svg>
);

const WindowsMaximizeIcon: React.FC = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
    <path d="M0 0v10h10V0H0zm9 9H1V1h8v8z" />
  </svg>
);

const WindowsRestoreIcon: React.FC = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
    <path d="M2 0v2H0v8h8V8h2V0H2zm1 1h6v6H8V2H3V1zm5 7H1V3h6v5z" />
  </svg>
);

const WindowsCloseIcon: React.FC = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
    <path d="M0.7 0L0 0.7 4.3 5 0 9.3l0.7 0.7L5 5.7l4.3 4.3 0.7-0.7L5.7 5l4.3-4.3L9.3 0 5 4.3 0.7 0z" />
  </svg>
);

// =============================================================================
// MAIN WINDOW CONTROLS COMPONENT
// =============================================================================

export const WindowControls: React.FC<WindowControlsProps> = ({
  platform: platformProp = 'auto',
  showMinimize = true,
  showMaximize = true,
  showClose = true,
  className,
  variant = 'default',
  onCloseRequest
}) => {
  const utils = ElectronUtils.getInstance();
  const [isMaximized, setIsMaximized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Detect platform
  const platform = platformProp === 'auto' ? utils.getPlatform() : platformProp;
  const isMac = platform === 'darwin';
  const isWindows = platform === 'win32';
  const isLinux = platform === 'linux';

  // Check maximized state
  useEffect(() => {
    if (!utils.isElectron()) return;

    const checkMaximized = () => {
      const api = (window as any).electronAPI;
      if (api?.isWindowMaximized) {
        setIsMaximized(api.isWindowMaximized());
      }
    };

    checkMaximized();
    
    // Listen for window state changes
    const interval = setInterval(checkMaximized, 500);
    return () => clearInterval(interval);
  }, [utils]);

  // Button handlers
  const handleMinimize = useCallback(() => {
    const api = (window as any).electronAPI;
    api?.minimizeWindow();
  }, []);

  const handleMaximize = useCallback(() => {
    const api = (window as any).electronAPI;
    if (isMaximized) {
      api?.unmaximizeWindow();
    } else {
      api?.maximizeWindow();
    }
    setIsMaximized(!isMaximized);
  }, [isMaximized]);

  const handleClose = useCallback(async () => {
    if (onCloseRequest) {
      await onCloseRequest();
    } else {
      const api = (window as any).electronAPI;
      api?.closeWindow();
    }
  }, [onCloseRequest]);

  // Don't render if not in Electron
  if (!utils.isElectron()) {
    return null;
  }

  // macOS style controls
  if (isMac && variant !== 'custom') {
    return (
      <div 
        className={cn(
          'flex items-center gap-2 px-3',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {showClose && (
          <button
            onClick={handleClose}
            className={cn(
              'w-3 h-3 rounded-full flex items-center justify-center',
              'bg-red-500 hover:bg-red-600',
              'transition-all duration-150',
              !isHovered && 'bg-gray-400'
            )}
            aria-label="Close window"
          >
            {isHovered && <MacOSCloseIcon />}
          </button>
        )}
        {showMinimize && (
          <button
            onClick={handleMinimize}
            className={cn(
              'w-3 h-3 rounded-full flex items-center justify-center',
              'bg-yellow-500 hover:bg-yellow-600',
              'transition-all duration-150',
              !isHovered && 'bg-gray-400'
            )}
            aria-label="Minimize window"
          >
            {isHovered && <MacOSMinimizeIcon />}
          </button>
        )}
        {showMaximize && (
          <button
            onClick={handleMaximize}
            className={cn(
              'w-3 h-3 rounded-full flex items-center justify-center',
              'bg-green-500 hover:bg-green-600',
              'transition-all duration-150',
              !isHovered && 'bg-gray-400'
            )}
            aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
          >
            {isHovered && (isMaximized ? <MacOSRestoreIcon /> : <MacOSMaximizeIcon />)}
          </button>
        )}
      </div>
    );
  }

  // Windows/Linux style controls
  return (
    <div 
      className={cn(
        'flex items-center',
        className
      )}
    >
      {showMinimize && (
        <button
          onClick={handleMinimize}
          className={cn(
            'w-12 h-8 flex items-center justify-center',
            'hover:bg-gray-200 dark:hover:bg-gray-700',
            'transition-colors duration-150',
            variant === 'minimal' && 'w-10 h-7'
          )}
          aria-label="Minimize window"
        >
          <WindowsMinimizeIcon />
        </button>
      )}
      {showMaximize && (
        <button
          onClick={handleMaximize}
          className={cn(
            'w-12 h-8 flex items-center justify-center',
            'hover:bg-gray-200 dark:hover:bg-gray-700',
            'transition-colors duration-150',
            variant === 'minimal' && 'w-10 h-7'
          )}
          aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
        >
          {isMaximized ? <WindowsRestoreIcon /> : <WindowsMaximizeIcon />}
        </button>
      )}
      {showClose && (
        <button
          onClick={handleClose}
          className={cn(
            'w-12 h-8 flex items-center justify-center',
            'hover:bg-red-500 hover:text-white',
            'transition-colors duration-150',
            variant === 'minimal' && 'w-10 h-7'
          )}
          aria-label="Close window"
        >
          <WindowsCloseIcon />
        </button>
      )}
    </div>
  );
};

// =============================================================================
// TITLE BAR COMPONENT
// =============================================================================

export interface TitleBarProps {
  /**
   * Title text
   */
  readonly title?: string;
  
  /**
   * Show window controls
   */
  readonly showControls?: boolean;
  
  /**
   * Additional content to show in title bar
   */
  readonly children?: React.ReactNode;
  
  /**
   * Title bar height
   */
  readonly height?: 'sm' | 'md' | 'lg';
  
  /**
   * Enable window dragging
   */
  readonly draggable?: boolean;
  
  /**
   * Additional CSS classes
   */
  readonly className?: string;
  
  /**
   * Window controls props
   */
  readonly controlsProps?: Omit<WindowControlsProps, 'className'>;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  title,
  showControls = true,
  children,
  height = 'md',
  draggable = true,
  className,
  controlsProps
}) => {
  const utils = ElectronUtils.getInstance();
  const platform = utils.getPlatform();
  const isMac = platform === 'darwin';

  const heightClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  };

  const handleDoubleClick = useCallback(() => {
    if (draggable) {
      const api = (window as any).electronAPI;
      if (api?.isWindowMaximized && api?.maximizeWindow && api?.unmaximizeWindow) {
        if (api.isWindowMaximized()) {
          api.unmaximizeWindow();
        } else {
          api.maximizeWindow();
        }
      }
    }
  }, [draggable]);

  return (
    <div 
      className={cn(
        'flex items-center justify-between',
        'bg-background border-b border-border',
        heightClasses[height],
        draggable && 'select-none',
        isMac && showControls && 'pl-20', // Space for macOS controls
        className
      )}
      style={{ WebkitAppRegion: draggable ? 'drag' : 'no-drag' } as any}
      onDoubleClick={handleDoubleClick}
    >
      {/* macOS controls on the left */}
      {isMac && showControls && (
        <div 
          className="absolute left-0 top-0 h-full flex items-center"
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          <WindowControls {...controlsProps} />
        </div>
      )}

      {/* Title and content */}
      <div className="flex-1 flex items-center px-4 overflow-hidden">
        {title && (
          <h1 className="text-sm font-medium truncate mr-4">
            {title}
          </h1>
        )}
        <div 
          className="flex-1 flex items-center"
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          {children}
        </div>
      </div>

      {/* Windows/Linux controls on the right */}
      {!isMac && showControls && (
        <div style={{ WebkitAppRegion: 'no-drag' } as any}>
          <WindowControls {...controlsProps} />
        </div>
      )}
    </div>
  );
};

// =============================================================================
// EXPORT
// =============================================================================

export default WindowControls;