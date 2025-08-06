/**
 * Command Palette Block - Global Command Interface
 * WCAG AAA compliant with keyboard shortcuts and screen reader support
 * Norwegian standards with extensive command search capabilities
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/button/button';
import { Input } from '../../components/input/input';

export interface CommandItem {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly icon?: React.ReactNode;
  readonly shortcut?: string[];
  readonly category?: string;
  readonly action?: () => void | Promise<void>;
  readonly disabled?: boolean;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly keywords?: string[];
  readonly priority?: number;
}

export interface CommandCategory {
  readonly id: string;
  readonly title: string;
  readonly icon?: React.ReactNode;
  readonly items: CommandItem[];
}

export interface CommandPaletteTexts {
  readonly placeholder: string;
  readonly searchPrompt: string;
  readonly noResultsFound: string;
  readonly loadingText: string;
  readonly closeLabel: string;
  readonly searchLabel: string;
  readonly executeLabel: string;
  readonly navigateHint: string;
  readonly selectHint: string;
  readonly closeHint: string;
  readonly categoryLabel: string;
  readonly resultsCount: string;
  readonly recentCommands: string;
  readonly suggestedCommands: string;
  readonly allCommands: string;
  readonly executingCommand: string;
  readonly commandExecuted: string;
  readonly dialogTitle: string;
}

export interface CommandPaletteState {
  readonly isOpen: boolean;
  readonly query: string;
  readonly selectedIndex: number;
  readonly loading: boolean;
  readonly executing: boolean;
  readonly executingCommand?: string;
  readonly recentCommands: string[];
  readonly filteredItems: CommandItem[];
  readonly categories: CommandCategory[];
}

export interface CommandPaletteCallbacks {
  readonly onOpen?: () => void;
  readonly onClose?: () => void;
  readonly onQueryChange?: (query: string) => void;
  readonly onCommandExecute?: (command: CommandItem) => void;
  readonly onRecentCommand?: (commandId: string) => void;
  readonly onAnnounce?: (message: string) => void;
  readonly onKeyboardShortcut?: (shortcut: string[]) => void;
  readonly onStateChange?: (state: Partial<CommandPaletteState>) => void;
}

export interface CommandPaletteProps {
  readonly texts?: Partial<CommandPaletteTexts>;
  readonly callbacks: CommandPaletteCallbacks;
  readonly state?: Partial<CommandPaletteState>;
  readonly commands: CommandItem[];
  readonly className?: string;
  readonly maxResults?: number;
  readonly showCategories?: boolean;
  readonly showShortcuts?: boolean;
  readonly showRecentCommands?: boolean;
  readonly keyboardShortcut?: string[];
  readonly debounceMs?: number;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

const defaultTexts: CommandPaletteTexts = {
  placeholder: 'Søk etter kommandoer...',
  searchPrompt: 'Skriv for å søke etter kommandoer',
  noResultsFound: 'Ingen kommandoer funnet',
  loadingText: 'Laster kommandoer...',
  closeLabel: 'Lukk kommandopalett',
  searchLabel: 'Søk kommandoer',
  executeLabel: 'Utfør kommando',
  navigateHint: 'Naviger',
  selectHint: 'Velg',
  closeHint: 'Lukk',
  categoryLabel: 'Kategori',
  resultsCount: 'resultater',
  recentCommands: 'Nylige kommandoer',
  suggestedCommands: 'Foreslåtte kommandoer',
  allCommands: 'Alle kommandoer',
  executingCommand: 'Utfører kommando...',
  commandExecuted: 'Kommando utført',
  dialogTitle: 'Kommandopalett'
};

const defaultState: CommandPaletteState = {
  isOpen: false,
  query: '',
  selectedIndex: -1,
  loading: false,
  executing: false,
  recentCommands: [],
  filteredItems: [],
  categories: []
};

const defaultCommands: CommandItem[] = [
  {
    id: 'search',
    title: 'Søk',
    description: 'Søk i dokumenter og filer',
    icon: '🔍',
    shortcut: ['Ctrl', 'K'],
    category: 'navigation',
    keywords: ['find', 'search', 'look', 'søk', 'finn']
  },
  {
    id: 'new-document',
    title: 'Nytt dokument',
    description: 'Opprett et nytt dokument',
    icon: '📄',
    shortcut: ['Ctrl', 'N'],
    category: 'creation',
    keywords: ['new', 'create', 'document', 'ny', 'dokument']
  },
  {
    id: 'settings',
    title: 'Innstillinger',
    description: 'Åpne applikasjonsinnstillinger',
    icon: '⚙️',
    shortcut: ['Ctrl', ','],
    category: 'system',
    keywords: ['settings', 'preferences', 'config', 'innstillinger']
  }
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  texts = {},
  callbacks,
  state = {},
  commands = defaultCommands,
  className,
  maxResults = 10,
  showCategories = true,
  showShortcuts = true,
  showRecentCommands = true,
  keyboardShortcut = ['Meta', 'K'],
  debounceMs = 200,
  nsmClassification
}) => {
  const t = { ...defaultTexts, ...texts };
  const currentState = { ...defaultState, ...state };
  
  const {
    isOpen,
    query,
    selectedIndex,
    loading,
    executing,
    executingCommand,
    recentCommands,
    filteredItems,
    categories
  } = currentState;

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Update state helper
  const updateState = useCallback((updates: Partial<CommandPaletteState>) => {
    callbacks.onStateChange?.(updates);
  }, [callbacks]);

  const announce = useCallback((message: string) => {
    callbacks.onAnnounce?.(message);
  }, [callbacks]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query) return commands.slice(0, maxResults);
    
    const lowerQuery = query.toLowerCase();
    const matches = commands.filter(command => {
      const titleMatch = command.title.toLowerCase().includes(lowerQuery);
      const descriptionMatch = command.description?.toLowerCase().includes(lowerQuery);
      const keywordMatch = command.keywords?.some(keyword => 
        keyword.toLowerCase().includes(lowerQuery)
      );
      
      return titleMatch || descriptionMatch || keywordMatch;
    });

    // Sort by relevance (priority, then title match, then description match)
    return matches
      .sort((a, b) => {
        const aPriority = a.priority || 0;
        const bPriority = b.priority || 0;
        if (aPriority !== bPriority) return bPriority - aPriority;
        
        const aTitleMatch = a.title.toLowerCase().includes(lowerQuery);
        const bTitleMatch = b.title.toLowerCase().includes(lowerQuery);
        if (aTitleMatch !== bTitleMatch) return aTitleMatch ? -1 : 1;
        
        return a.title.localeCompare(b.title);
      })
      .slice(0, maxResults);
  }, [query, commands, maxResults]);

  // Group commands by category
  const categorizedCommands = useMemo(() => {
    if (!showCategories) return filteredCommands;
    
    const grouped = filteredCommands.reduce((acc, command) => {
      const category = command.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(command);
      return acc;
    }, {} as Record<string, CommandItem[]>);

    return Object.entries(grouped).map(([categoryId, items]) => ({
      id: categoryId,
      title: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
      items
    }));
  }, [filteredCommands, showCategories]);

  // Recent commands filtered
  const recentCommandItems = useMemo(() => {
    if (!showRecentCommands) return [];
    return recentCommands
      .map(id => commands.find(cmd => cmd.id === id))
      .filter(Boolean) as CommandItem[];
  }, [recentCommands, commands, showRecentCommands]);

  // Global keyboard shortcut handler
  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    const keys = [];
    if (e.ctrlKey) keys.push('Ctrl');
    if (e.metaKey) keys.push('Meta');
    if (e.altKey) keys.push('Alt');
    if (e.shiftKey) keys.push('Shift');
    keys.push(e.key);

    if (keyboardShortcut.every(key => keys.includes(key))) {
      e.preventDefault();
      if (!isOpen) {
        callbacks.onOpen?.();
        updateState({ isOpen: true });
        callbacks.onKeyboardShortcut?.(keyboardShortcut);
      }
    }

    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      handleClose();
    }
  }, [keyboardShortcut, isOpen, callbacks, updateState]);

  // Register global keyboard shortcut
  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  // Focus management
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Debounced query update
  useEffect(() => {
    const timer = setTimeout(() => {
      updateState({ filteredItems: filteredCommands });
      if (query && filteredCommands.length > 0) {
        updateState({ selectedIndex: 0 });
      } else {
        updateState({ selectedIndex: -1 });
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, filteredCommands, debounceMs, updateState]);

  // Event handlers
  const handleOpen = useCallback(() => {
    callbacks.onOpen?.();
    updateState({ isOpen: true, query: '', selectedIndex: -1 });
  }, [callbacks, updateState]);

  const handleClose = useCallback(() => {
    callbacks.onClose?.();
    updateState({ isOpen: false, query: '', selectedIndex: -1 });
  }, [callbacks, updateState]);

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    callbacks.onQueryChange?.(newQuery);
    updateState({ query: newQuery });
  }, [callbacks, updateState]);

  const handleKeyDown = useCallback(async (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = selectedIndex < filteredCommands.length - 1 
          ? selectedIndex + 1 
          : selectedIndex;
        updateState({ selectedIndex: nextIndex });
        break;

      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : -1;
        updateState({ selectedIndex: prevIndex });
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredCommands[selectedIndex]) {
          await handleExecuteCommand(filteredCommands[selectedIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        handleClose();
        break;
    }
  }, [selectedIndex, filteredCommands, updateState, handleClose]);

  const handleExecuteCommand = useCallback(async (command: CommandItem) => {
    if (command.disabled || executing) return;

    try {
      updateState({ 
        executing: true, 
        executingCommand: command.title 
      });
      
      announce(`${t.executingCommand} ${command.title}`);
      
      // Add to recent commands
      const newRecent = [command.id, ...recentCommands.filter(id => id !== command.id)].slice(0, 5);
      updateState({ recentCommands: newRecent });
      
      // Execute command
      if (command.action) {
        await command.action();
      }
      
      callbacks.onCommandExecute?.(command);
      announce(`${t.commandExecuted}: ${command.title}`);
      
      // Close palette after execution
      setTimeout(() => {
        handleClose();
      }, 100);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Command execution failed';
      announce(`Error: ${errorMessage}`);
    } finally {
      updateState({ executing: false, executingCommand: undefined });
    }
  }, [executing, recentCommands, callbacks, updateState, announce, t, handleClose]);

  const handleCommandClick = useCallback((command: CommandItem) => {
    updateState({ selectedIndex: filteredCommands.indexOf(command) });
    handleExecuteCommand(command);
  }, [filteredCommands, updateState, handleExecuteCommand]);

  const renderShortcut = useCallback((shortcut: string[]) => {
    if (!showShortcuts) return null;
    
    return (
      <div className="flex items-center gap-1">
        {shortcut.map((key, index) => (
          <kbd
            key={index}
            className="px-2 py-1 text-xs font-mono bg-muted border rounded"
          >
            {key === 'Meta' ? '⌘' : key === 'Ctrl' ? '⌃' : key}
          </kbd>
        ))}
      </div>
    );
  }, [showShortcuts]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Command Palette Dialog */}
      <div 
        className={cn(
          'fixed z-50 w-full max-w-2xl',
          'top-[15%] left-1/2 -translate-x-1/2',
          'animate-in fade-in slide-in-from-bottom-4',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label={t.dialogTitle}
      >
        <div className={cn(
          'bg-card border-2 border-border rounded-xl shadow-2xl overflow-hidden',
          nsmClassification && 'border-l-4',
          nsmClassification === 'OPEN' && 'border-l-green-600',
          nsmClassification === 'RESTRICTED' && 'border-l-yellow-600',
          nsmClassification === 'CONFIDENTIAL' && 'border-l-red-600',
          nsmClassification === 'SECRET' && 'border-l-gray-800'
        )}>
          
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b">
            <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            
            <Input
              ref={inputRef}
              value={query}
              onChange={handleQueryChange}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              className="flex-1 border-0 focus:ring-0 h-12 text-lg bg-transparent"
              aria-label={t.searchLabel}
              autoComplete="off"
              spellCheck={false}
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              aria-label={t.closeLabel}
              className="flex-shrink-0"
            >
              <span className="text-xl">×</span>
            </Button>
          </div>

          {/* Command List */}
          <div 
            ref={listRef}
            className="max-h-[400px] overflow-y-auto"
            role="listbox"
            aria-label="Available commands"
          >
            {/* Loading State */}
            {loading && (
              <div className="p-8 text-center">
                <div className="inline-flex items-center gap-3">
                  <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>{t.loadingText}</span>
                </div>
              </div>
            )}

            {/* Executing State */}
            {executing && executingCommand && (
              <div className="p-4 bg-primary/10 border-b">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-primary font-medium">
                    {t.executingCommand} {executingCommand}
                  </span>
                </div>
              </div>
            )}

            {/* Recent Commands */}
            {!loading && !query && recentCommandItems.length > 0 && (
              <div className="p-4 border-b">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {t.recentCommands}
                </h3>
                <div className="space-y-1">
                  {recentCommandItems.map((command, index) => (
                    <button
                      key={command.id}
                      onClick={() => handleCommandClick(command)}
                      className={cn(
                        'flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors',
                        'hover:bg-accent',
                        selectedIndex === index && 'bg-accent'
                      )}
                      role="option"
                      aria-selected={selectedIndex === index}
                      disabled={command.disabled}
                    >
                      {command.icon && (
                        <span className="text-xl flex-shrink-0" aria-hidden="true">
                          {command.icon}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{command.title}</p>
                        {command.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {command.description}
                          </p>
                        )}
                      </div>
                      {command.shortcut && renderShortcut(command.shortcut)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filtered Commands */}
            {!loading && filteredCommands.length > 0 && (
              <div className="p-2">
                {showCategories ? (
                  // Categorized view
                  categorizedCommands.map(category => (
                    <div key={category.id} className="mb-4 last:mb-0">
                      <h3 className="px-3 py-2 text-sm font-medium text-muted-foreground">
                        {category.title}
                      </h3>
                      {category.items.map((command, globalIndex) => {
                        const isSelected = selectedIndex === filteredCommands.indexOf(command);
                        return (
                          <button
                            key={command.id}
                            onClick={() => handleCommandClick(command)}
                            className={cn(
                              'flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors',
                              'hover:bg-accent',
                              isSelected && 'bg-accent',
                              command.disabled && 'opacity-50 cursor-not-allowed'
                            )}
                            role="option"
                            aria-selected={isSelected}
                            disabled={command.disabled}
                          >
                            {command.icon && (
                              <span className="text-xl flex-shrink-0" aria-hidden="true">
                                {command.icon}
                              </span>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{command.title}</p>
                              {command.description && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {command.description}
                                </p>
                              )}
                            </div>
                            {command.nsmClassification && (
                              <span className={cn(
                                'text-xs px-2 py-1 rounded',
                                command.nsmClassification === 'OPEN' && 'bg-green-100 text-green-700',
                                command.nsmClassification === 'RESTRICTED' && 'bg-yellow-100 text-yellow-700',
                                command.nsmClassification === 'CONFIDENTIAL' && 'bg-red-100 text-red-700',
                                command.nsmClassification === 'SECRET' && 'bg-gray-100 text-gray-700'
                              )}>
                                {command.nsmClassification}
                              </span>
                            )}
                            {command.shortcut && renderShortcut(command.shortcut)}
                          </button>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  // Flat view
                  filteredCommands.map((command, index) => (
                    <button
                      key={command.id}
                      onClick={() => handleCommandClick(command)}
                      className={cn(
                        'flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors',
                        'hover:bg-accent',
                        selectedIndex === index && 'bg-accent',
                        command.disabled && 'opacity-50 cursor-not-allowed'
                      )}
                      role="option"
                      aria-selected={selectedIndex === index}
                      disabled={command.disabled}
                    >
                      {command.icon && (
                        <span className="text-xl flex-shrink-0" aria-hidden="true">
                          {command.icon}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{command.title}</p>
                        {command.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {command.description}
                          </p>
                        )}
                      </div>
                      {command.nsmClassification && (
                        <span className={cn(
                          'text-xs px-2 py-1 rounded',
                          command.nsmClassification === 'OPEN' && 'bg-green-100 text-green-700',
                          command.nsmClassification === 'RESTRICTED' && 'bg-yellow-100 text-yellow-700',
                          command.nsmClassification === 'CONFIDENTIAL' && 'bg-red-100 text-red-700',
                          command.nsmClassification === 'SECRET' && 'bg-gray-100 text-gray-700'
                        )}>
                          {command.nsmClassification}
                        </span>
                      )}
                      {command.shortcut && renderShortcut(command.shortcut)}
                    </button>
                  ))
                )}
              </div>
            )}

            {/* No Results */}
            {!loading && query && filteredCommands.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">
                  {t.noResultsFound}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t bg-muted/50 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-background border">↑↓</kbd>
                {t.navigateHint}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-background border">↵</kbd>
                {t.selectHint}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-background border">esc</kbd>
                {t.closeHint}
              </span>
            </div>
            {filteredCommands.length > 0 && (
              <span>{filteredCommands.length} {t.resultsCount}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};