/**
 * Electron File System Access
 * Components and utilities for file system operations
 */

import React, { useCallback, useState } from 'react';
import { ElectronUtils } from './electron-utils';
import type { OpenDialogOptions, SaveDialogOptions, FileFilter } from './electron-utils';

// =============================================================================
// FILE PICKER HOOK
// =============================================================================

export interface UseFilePickerOptions {
  /**
   * Accept specific file types
   */
  readonly accept?: string | string[];
  
  /**
   * Allow multiple file selection
   */
  readonly multiple?: boolean;
  
  /**
   * Allow directory selection
   */
  readonly directory?: boolean;
  
  /**
   * Default path to open
   */
  readonly defaultPath?: string;
  
  /**
   * Dialog title
   */
  readonly title?: string;
  
  /**
   * Custom file filters
   */
  readonly filters?: FileFilter[];
  
  /**
   * Callback when files are selected
   */
  readonly onSelect?: (paths: string[]) => void;
  
  /**
   * Callback when selection is cancelled
   */
  readonly onCancel?: () => void;
}

export function useFilePicker(options: UseFilePickerOptions = {}) {
  const utils = ElectronUtils.getInstance();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const open = useCallback(async () => {
    if (!utils.isElectron()) {
      setError('File picker is only available in Electron');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const dialogOptions: OpenDialogOptions = {
        title: options.title,
        defaultPath: options.defaultPath,
        properties: []
      };

      // Set properties
      if (options.directory) {
        dialogOptions.properties!.push('openDirectory');
      } else {
        dialogOptions.properties!.push('openFile');
      }
      
      if (options.multiple) {
        dialogOptions.properties!.push('multiSelections');
      }

      // Set filters
      if (options.filters) {
        dialogOptions.filters = options.filters;
      } else if (options.accept) {
        const accepts = Array.isArray(options.accept) ? options.accept : [options.accept];
        dialogOptions.filters = [
          {
            name: 'Files',
            extensions: accepts.map(ext => ext.replace(/^\./, ''))
          },
          { name: 'All Files', extensions: ['*'] }
        ];
      }

      const paths = await (window as any).electronAPI.showOpenDialog(dialogOptions);
      
      if (paths.length > 0) {
        setSelectedPaths(paths);
        options.onSelect?.(paths);
      } else {
        options.onCancel?.();
      }

      return paths;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open file picker';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [utils, options]);

  const reset = useCallback(() => {
    setSelectedPaths([]);
    setError(null);
  }, []);

  return {
    open,
    reset,
    selectedPaths,
    isLoading,
    error
  };
}

// =============================================================================
// FILE SAVE HOOK
// =============================================================================

export interface UseFileSaveOptions {
  /**
   * Default file name
   */
  readonly defaultName?: string;
  
  /**
   * Default save path
   */
  readonly defaultPath?: string;
  
  /**
   * Dialog title
   */
  readonly title?: string;
  
  /**
   * File filters
   */
  readonly filters?: FileFilter[];
  
  /**
   * Button label
   */
  readonly buttonLabel?: string;
}

export function useFileSave(options: UseFileSaveOptions = {}) {
  const utils = ElectronUtils.getInstance();
  const [isLoading, setIsLoading] = useState(false);
  const [savedPath, setSavedPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async (content: string | Buffer): Promise<string | null> => {
    if (!utils.isElectron()) {
      setError('File save is only available in Electron');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const dialogOptions: SaveDialogOptions = {
        title: options.title,
        defaultPath: options.defaultPath || options.defaultName,
        buttonLabel: options.buttonLabel,
        filters: options.filters || [{ name: 'All Files', extensions: ['*'] }]
      };

      const path = await (window as any).electronAPI.showSaveDialog(dialogOptions);
      
      if (path) {
        // Save the file
        await (window as any).electronAPI.writeFile(path, content);
        setSavedPath(path);
        return path;
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save file';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [utils, options]);

  const reset = useCallback(() => {
    setSavedPath(null);
    setError(null);
  }, []);

  return {
    save,
    reset,
    savedPath,
    isLoading,
    error
  };
}

// =============================================================================
// FILE DROP ZONE COMPONENT
// =============================================================================

export interface FileDropZoneProps {
  /**
   * Accept specific file types
   */
  readonly accept?: string | string[];
  
  /**
   * Allow multiple files
   */
  readonly multiple?: boolean;
  
  /**
   * Allow directories
   */
  readonly directory?: boolean;
  
  /**
   * Maximum file size in bytes
   */
  readonly maxSize?: number;
  
  /**
   * Callback when files are dropped
   */
  readonly onDrop: (files: File[], paths?: string[]) => void;
  
  /**
   * Callback when files are rejected
   */
  readonly onReject?: (reason: string) => void;
  
  /**
   * Disabled state
   */
  readonly disabled?: boolean;
  
  /**
   * Children to render
   */
  readonly children: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  readonly className?: string;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  accept,
  multiple = false,
  directory = false,
  maxSize,
  onDrop,
  onReject,
  disabled = false,
  children,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = useCallback((file: File): boolean => {
    // Check file size
    if (maxSize && file.size > maxSize) {
      onReject?.(`File ${file.name} exceeds maximum size of ${maxSize} bytes`);
      return false;
    }

    // Check file type
    if (accept) {
      const accepts = Array.isArray(accept) ? accept : [accept];
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type.toLowerCase();
      
      const isAccepted = accepts.some(acceptType => {
        if (acceptType.startsWith('.')) {
          return fileExt === acceptType.toLowerCase();
        }
        if (acceptType.includes('/*')) {
          const [type] = acceptType.split('/');
          return mimeType.startsWith(type + '/');
        }
        return mimeType === acceptType;
      });

      if (!isAccepted) {
        onReject?.(`File type ${fileExt} is not accepted`);
        return false;
      }
    }

    return true;
  }, [accept, maxSize, onReject]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(false);
    }
  }, [disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const items = Array.from(e.dataTransfer.items);
    const files: File[] = [];
    const paths: string[] = [];

    items.forEach(item => {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file && validateFile(file)) {
          files.push(file);
          
          // Get file path if available (Electron only)
          const path = (file as any).path;
          if (path) {
            paths.push(path);
          }
        }
      }
    });

    if (!multiple && files.length > 1) {
      onReject?.('Multiple files not allowed');
      return;
    }

    if (files.length > 0) {
      onDrop(files, paths.length > 0 ? paths : undefined);
    }
  }, [disabled, multiple, validateFile, onDrop, onReject]);

  return (
    <div
      className={className}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-dragging={isDragging}
      data-disabled={disabled}
    >
      {children}
    </div>
  );
};

// =============================================================================
// FILE SYSTEM UTILITIES
// =============================================================================

export class FileSystemUtils {
  private static utils = ElectronUtils.getInstance();

  /**
   * Read a text file
   */
  static async readTextFile(path: string): Promise<string> {
    if (!this.utils.isElectron()) {
      throw new Error('File system access is only available in Electron');
    }
    
    const api = (window as any).electronAPI;
    if (!api?.readFile) {
      throw new Error('File system API not available');
    }

    return api.readFile(path);
  }

  /**
   * Write a text file
   */
  static async writeTextFile(path: string, content: string): Promise<void> {
    if (!this.utils.isElectron()) {
      throw new Error('File system access is only available in Electron');
    }
    
    const api = (window as any).electronAPI;
    if (!api?.writeFile) {
      throw new Error('File system API not available');
    }

    return api.writeFile(path, content);
  }

  /**
   * Check if a file exists
   */
  static async exists(path: string): Promise<boolean> {
    if (!this.utils.isElectron()) {
      return false;
    }
    
    try {
      await this.readTextFile(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file extension
   */
  static getExtension(path: string): string {
    const parts = path.split('.');
    return parts.length > 1 ? '.' + parts[parts.length - 1] : '';
  }

  /**
   * Get file name without extension
   */
  static getBaseName(path: string): string {
    const parts = path.split(/[/\\]/);
    const fileName = parts[parts.length - 1];
    const extIndex = fileName.lastIndexOf('.');
    return extIndex > 0 ? fileName.substring(0, extIndex) : fileName;
  }

  /**
   * Get directory from path
   */
  static getDirectory(path: string): string {
    const parts = path.split(/[/\\]/);
    parts.pop();
    return parts.join('/');
  }
}

// =============================================================================
// COMMON FILE FILTERS
// =============================================================================

export const CommonFileFilters = {
  images: {
    name: 'Images',
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico']
  },
  documents: {
    name: 'Documents',
    extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf']
  },
  code: {
    name: 'Code Files',
    extensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'html', 'css', 'scss', 'md']
  },
  video: {
    name: 'Videos',
    extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
  },
  audio: {
    name: 'Audio',
    extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma']
  },
  archives: {
    name: 'Archives',
    extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2']
  },
  all: {
    name: 'All Files',
    extensions: ['*']
  }
};

// =============================================================================
// EXPORT
// =============================================================================

export const FileSystemAccess = {
  useFilePicker,
  useFileSave,
  FileDropZone,
  FileSystemUtils,
  CommonFileFilters
};

export default FileSystemAccess;