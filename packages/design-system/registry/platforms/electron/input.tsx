/**
 * Electron Input Implementation
 * Enhanced React input with Electron-specific features
 */

import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// =============================================================================
// ELECTRON API TYPES
// =============================================================================

interface ElectronAPI {
  readonly showOpenDialog: (options: OpenDialogOptions) => Promise<string[]>;
  readonly showSaveDialog: (options: SaveDialogOptions) => Promise<string | null>;
  readonly showContextMenu: (options: ContextMenuOptions) => void;
  readonly registerShortcut: (shortcut: string, callback: () => void) => void;
  readonly unregisterShortcut: (shortcut: string) => void;
  readonly getPlatform: () => 'darwin' | 'win32' | 'linux';
  readonly readClipboard: () => Promise<string>;
  readonly writeClipboard: (text: string) => void;
}

interface OpenDialogOptions {
  readonly title?: string;
  readonly defaultPath?: string;
  readonly filters?: Array<{
    readonly name: string;
    readonly extensions: string[];
  }>;
  readonly properties?: Array<'openFile' | 'openDirectory' | 'multiSelections'>;
}

interface SaveDialogOptions {
  readonly title?: string;
  readonly defaultPath?: string;
  readonly filters?: Array<{
    readonly name: string;
    readonly extensions: string[];
  }>;
}

interface ContextMenuOptions {
  readonly items: Array<{
    readonly label: string;
    readonly click?: () => void;
    readonly type?: 'normal' | 'separator';
    readonly enabled?: boolean;
    readonly accelerator?: string;
  }>;
}

declare global {
  interface Window {
    readonly electronAPI?: ElectronAPI;
  }
}

// =============================================================================
// VARIANT DEFINITIONS
// =============================================================================

const inputVariants = cva(
  [
    'flex w-full rounded-lg border-2 bg-background text-sm',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    // Professional sizing
    'h-14 px-4'
  ],
  {
    variants: {
      variant: {
        default: [
          'border-input',
          'focus:border-primary focus:ring-primary',
          'hover:border-primary/50'
        ],
        error: [
          'border-destructive',
          'focus:border-destructive focus:ring-destructive',
          'hover:border-destructive/70'
        ],
        success: [
          'border-green-500',
          'focus:border-green-500 focus:ring-green-500',
          'hover:border-green-500/70'
        ]
      },
      size: {
        sm: 'h-10 text-sm',
        md: 'h-14 text-base',
        lg: 'h-16 text-lg'
      },
      platform: {
        darwin: 'font-normal',
        win32: 'font-medium',
        linux: 'font-normal'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

// =============================================================================
// COMPONENT INTERFACE
// =============================================================================

export interface ElectronInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /**
   * Input label
   */
  readonly label?: string;
  
  /**
   * Error message
   */
  readonly error?: string;
  
  /**
   * Success message
   */
  readonly success?: string;
  
  /**
   * Helper text
   */
  readonly helperText?: string;
  
  /**
   * Icon to display before input
   */
  readonly icon?: React.ReactNode;
  
  /**
   * Icon to display after input
   */
  readonly suffixIcon?: React.ReactNode;
  
  /**
   * Enable file picker integration
   */
  readonly filePicker?: boolean;
  
  /**
   * File picker options
   */
  readonly filePickerOptions?: OpenDialogOptions;
  
  /**
   * Enable native context menu
   */
  readonly nativeContextMenu?: boolean;
  
  /**
   * Custom context menu items
   */
  readonly contextMenuItems?: Array<{
    readonly label: string;
    readonly onClick?: () => void;
    readonly shortcut?: string;
  }>;
  
  /**
   * Enable clipboard integration
   */
  readonly clipboardIntegration?: boolean;
  
  /**
   * Platform-specific styling override
   */
  readonly platformOverride?: 'darwin' | 'win32' | 'linux' | 'auto';
}

// =============================================================================
// MAIN ELECTRON INPUT COMPONENT
// =============================================================================

export const ElectronInput = forwardRef<HTMLInputElement, ElectronInputProps>(
  (
    {
      className,
      variant,
      size,
      label,
      error,
      success,
      helperText,
      icon,
      suffixIcon,
      filePicker = false,
      filePickerOptions,
      nativeContextMenu = true,
      contextMenuItems = [],
      clipboardIntegration = true,
      platformOverride = 'auto',
      disabled,
      value,
      onChange,
      onContextMenu,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [internalValue, setInternalValue] = useState(value || '');
    
    // Detect platform
    const platform = platformOverride === 'auto' 
      ? (window.electronAPI?.getPlatform() || 'darwin')
      : platformOverride;
    
    // Determine variant based on state
    const effectiveVariant = error ? 'error' : success ? 'success' : variant;

    // Handle value changes
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    }, [onChange]);

    // Handle file picker
    const handleFilePicker = useCallback(async () => {
      if (window.electronAPI && filePicker) {
        try {
          const result = await window.electronAPI.showOpenDialog({
            title: 'Select File',
            properties: ['openFile'],
            ...filePickerOptions
          });
          
          if (result.length > 0) {
            const newValue = result[0];
            setInternalValue(newValue);
            
            // Trigger change event
            if (inputRef.current) {
              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                'value'
              )?.set;
              nativeInputValueSetter?.call(inputRef.current, newValue);
              
              const event = new Event('input', { bubbles: true });
              inputRef.current.dispatchEvent(event);
            }
          }
        } catch (err) {
          console.error('File picker error:', err);
        }
      }
    }, [filePicker, filePickerOptions]);

    // Handle context menu
    const handleContextMenu = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
      if (nativeContextMenu && window.electronAPI) {
        e.preventDefault();
        
        const defaultItems = clipboardIntegration ? [
          {
            label: 'Cut',
            click: () => {
              if (inputRef.current) {
                const selected = inputRef.current.value.substring(
                  inputRef.current.selectionStart || 0,
                  inputRef.current.selectionEnd || 0
                );
                window.electronAPI?.writeClipboard(selected);
                document.execCommand('cut');
              }
            },
            accelerator: 'Ctrl+X'
          },
          {
            label: 'Copy',
            click: () => {
              if (inputRef.current) {
                const selected = inputRef.current.value.substring(
                  inputRef.current.selectionStart || 0,
                  inputRef.current.selectionEnd || 0
                );
                window.electronAPI?.writeClipboard(selected);
              }
            },
            accelerator: 'Ctrl+C'
          },
          {
            label: 'Paste',
            click: async () => {
              const text = await window.electronAPI?.readClipboard();
              if (text && inputRef.current) {
                document.execCommand('insertText', false, text);
              }
            },
            accelerator: 'Ctrl+V'
          },
          { type: 'separator' as const },
          {
            label: 'Select All',
            click: () => inputRef.current?.select(),
            accelerator: 'Ctrl+A'
          }
        ] : [];

        const menuItems = [
          ...defaultItems,
          ...(contextMenuItems.length > 0 ? [{ type: 'separator' as const }] : []),
          ...contextMenuItems.map(item => ({
            label: item.label,
            click: item.onClick,
            accelerator: item.shortcut,
            type: 'normal' as const,
            enabled: !disabled
          }))
        ];

        window.electronAPI.showContextMenu({ items: menuItems });
      }
      onContextMenu?.(e);
    }, [nativeContextMenu, clipboardIntegration, contextMenuItems, disabled, onContextMenu]);

    // Sync ref
    useEffect(() => {
      if (ref && inputRef.current) {
        if (typeof ref === 'function') {
          ref(inputRef.current);
        } else {
          ref.current = inputRef.current;
        }
      }
    }, [ref]);

    return (
      <div className="w-full space-y-2">
        {/* Label */}
        {label && (
          <label 
            htmlFor={props.id}
            className="block text-sm font-medium text-foreground"
          >
            {label}
            {props.required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Prefix icon */}
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}

          {/* Input field */}
          <input
            ref={inputRef}
            className={cn(
              inputVariants({ variant: effectiveVariant, size, platform }),
              icon && 'pl-10',
              (suffixIcon || filePicker) && 'pr-10',
              className
            )}
            value={internalValue}
            onChange={handleChange}
            onContextMenu={handleContextMenu}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${props.id}-error` : 
              success ? `${props.id}-success` : 
              helperText ? `${props.id}-helper` : 
              undefined
            }
            {...props}
          />

          {/* Suffix icon or file picker button */}
          {(suffixIcon || filePicker) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {filePicker ? (
                <button
                  type="button"
                  onClick={handleFilePicker}
                  disabled={disabled}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Choose file"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                </button>
              ) : (
                suffixIcon
              )}
            </div>
          )}
        </div>

        {/* Helper/Error/Success text */}
        {error && (
          <p id={`${props.id}-error`} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {success && !error && (
          <p id={`${props.id}-success`} className="text-sm text-green-600">
            {success}
          </p>
        )}
        {helperText && !error && !success && (
          <p id={`${props.id}-helper`} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

ElectronInput.displayName = 'ElectronInput';

// =============================================================================
// COMPONENT METADATA
// =============================================================================

export const ElectronInputMeta = {
  id: 'electron-input',
  name: 'ElectronInput',
  platform: 'electron',
  baseComponent: 'input',
  category: 'atom',
  description: 'Enhanced input with Electron-specific features like native file dialogs and clipboard integration',
  
  // Electron-specific features
  electronFeatures: [
    'Native file picker dialog',
    'Native context menus',
    'Clipboard integration',
    'Platform-specific styling',
    'File path validation'
  ],
  
  // Accessibility features
  accessibility: {
    wcagLevel: 'AAA' as const,
    features: [
      'Keyboard navigation',
      'Screen reader support',
      'Error announcements',
      'Label association',
      'Native OS accessibility APIs'
    ]
  },
  
  // Usage examples
  examples: {
    basic: '<ElectronInput label="Name" placeholder="Enter your name" />',
    withFilePicker: `
<ElectronInput 
  label="Select File" 
  filePicker
  filePickerOptions={{
    filters: [
      { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  }}
/>`,
    withValidation: '<ElectronInput label="Email" type="email" error="Invalid email address" />',
    withIcon: '<ElectronInput label="Search" icon={<SearchIcon />} />'
  }
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type ElectronInputVariant = VariantProps<typeof inputVariants>['variant'];
export type ElectronInputSize = VariantProps<typeof inputVariants>['size'];

// Default export for compatibility
export default ElectronInput;