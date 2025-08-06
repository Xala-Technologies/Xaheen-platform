/**
 * Settings-01 Block - Comprehensive Settings Interface
 * WCAG AAA compliant with tabbed navigation and Norwegian standards
 * Professional settings management with validation and persistence
 */

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/button/button';
import { Input } from '../../components/input/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/card/card';

export interface SettingsCategory {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly icon?: React.ReactNode;
  readonly settings: SettingItem[];
}

export interface SettingItem {
  readonly id: string;
  readonly key: string;
  readonly title: string;
  readonly description?: string;
  readonly type: 'text' | 'email' | 'password' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea';
  readonly value: any;
  readonly defaultValue?: any;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly options?: Array<{ readonly value: string; readonly label: string; readonly disabled?: boolean; }>;
  readonly validation?: {
    readonly pattern?: RegExp;
    readonly minLength?: number;
    readonly maxLength?: number;
    readonly min?: number;
    readonly max?: number;
    readonly custom?: (value: any) => string | undefined;
  };
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

export interface SettingsTexts {
  readonly settingsTitle: string;
  readonly settingsDescription: string;
  readonly saveChanges: string;
  readonly resetToDefaults: string;
  readonly cancelChanges: string;
  readonly exportSettings: string;
  readonly importSettings: string;
  readonly searchSettings: string;
  readonly noSettingsFound: string;
  readonly unsavedChanges: string;
  readonly settingsSaved: string;
  readonly settingsReset: string;
  readonly validationError: string;
  readonly importSuccess: string;
  readonly exportSuccess: string;
  readonly requiredField: string;
  readonly invalidValue: string;
  readonly changesSavedAnnouncement: string;
  readonly changesResetAnnouncement: string;
  readonly searchResultsAnnouncement: string;
  readonly enabled: string;
  readonly disabled: string;
  readonly loading: string;
}

export interface SettingsState {
  readonly activeCategory: string;
  readonly searchQuery: string;
  readonly values: Record<string, any>;
  readonly originalValues: Record<string, any>;
  readonly errors: Record<string, string>;
  readonly loading: boolean;
  readonly saving: boolean;
  readonly importing: boolean;
  readonly exporting: boolean;
  readonly hasUnsavedChanges: boolean;
}

export interface SettingsCallbacks {
  readonly onSave: (values: Record<string, any>, changedKeys: string[]) => Promise<void>;
  readonly onReset?: () => Promise<void>;
  readonly onExport?: () => Promise<void>;
  readonly onImport?: (file: File) => Promise<void>;
  readonly onSettingChange?: (key: string, value: any, category: string) => void;
  readonly onCategoryChange?: (categoryId: string) => void;
  readonly onSearch?: (query: string) => void;
  readonly onAnnounce?: (message: string) => void;
  readonly onStateChange?: (state: Partial<SettingsState>) => void;
}

export interface Settings01Props {
  readonly categories: SettingsCategory[];
  readonly texts?: Partial<SettingsTexts>;
  readonly callbacks: SettingsCallbacks;
  readonly state?: Partial<SettingsState>;
  readonly className?: string;
  readonly showSearch?: boolean;
  readonly showImportExport?: boolean;
  readonly showResetButton?: boolean;
  readonly autoSave?: boolean;
  readonly validateOnChange?: boolean;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly stickyNavigation?: boolean;
}

const defaultTexts: SettingsTexts = {
  settingsTitle: 'Innstillinger',
  settingsDescription: 'Administrer dine applikasjonsinnstillinger og preferanser',
  saveChanges: 'Lagre endringer',
  resetToDefaults: 'Tilbakestill til standardverdier',
  cancelChanges: 'Avbryt endringer',
  exportSettings: 'Eksporter innstillinger',
  importSettings: 'Importer innstillinger',
  searchSettings: 'Søk i innstillinger...',
  noSettingsFound: 'Ingen innstillinger funnet',
  unsavedChanges: 'Du har ulagrede endringer',
  settingsSaved: 'Innstillinger lagret',
  settingsReset: 'Innstillinger tilbakestilt',
  validationError: 'Valideringsfeil',
  importSuccess: 'Innstillinger importert',
  exportSuccess: 'Innstillinger eksportert',
  requiredField: 'Dette feltet er påkrevd',
  invalidValue: 'Ugyldig verdi',
  changesSavedAnnouncement: 'Innstillinger har blitt lagret',
  changesResetAnnouncement: 'Innstillinger har blitt tilbakestilt',
  searchResultsAnnouncement: 'Søkeresultater oppdatert',
  enabled: 'Aktivert',
  disabled: 'Deaktivert',
  loading: 'Laster...'
};

const defaultState: SettingsState = {
  activeCategory: '',
  searchQuery: '',
  values: {},
  originalValues: {},
  errors: {},
  loading: false,
  saving: false,
  importing: false,
  exporting: false,
  hasUnsavedChanges: false
};

export const Settings01: React.FC<Settings01Props> = ({
  categories,
  texts = {},
  callbacks,
  state = {},
  className,
  showSearch = true,
  showImportExport = true,
  showResetButton = true,
  autoSave = false,
  validateOnChange = true,
  nsmClassification,
  stickyNavigation = false
}) => {
  const t = { ...defaultTexts, ...texts };
  const currentState = { ...defaultState, activeCategory: categories[0]?.id || '', ...state };
  
  const {
    activeCategory,
    searchQuery,
    values,
    originalValues,
    errors,
    loading,
    saving,
    importing,
    exporting,
    hasUnsavedChanges
  } = currentState;

  // Update state helper
  const updateState = useCallback((updates: Partial<SettingsState>) => {
    callbacks.onStateChange?.(updates);
  }, [callbacks]);

  const announce = useCallback((message: string) => {
    callbacks.onAnnounce?.(message);
  }, [callbacks]);

  // Get initial values from categories
  const initialValues = useMemo(() => {
    const vals: Record<string, any> = {};
    categories.forEach(category => {
      category.settings.forEach(setting => {
        vals[setting.key] = setting.value ?? setting.defaultValue;
      });
    });
    return vals;
  }, [categories]);

  // Set initial values if not already set
  React.useEffect(() => {
    if (Object.keys(values).length === 0) {
      updateState({ 
        values: initialValues, 
        originalValues: { ...initialValues } 
      });
    }
  }, [initialValues, values, updateState]);

  // Filter categories and settings based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    
    return categories
      .map(category => ({
        ...category,
        settings: category.settings.filter(setting =>
          setting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          setting.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          setting.key.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }))
      .filter(category => category.settings.length > 0);
  }, [categories, searchQuery]);

  // Validate setting value
  const validateSetting = useCallback((setting: SettingItem, value: any): string | undefined => {
    if (setting.required && (value === undefined || value === null || value === '')) {
      return t.requiredField;
    }

    if (setting.validation) {
      const { pattern, minLength, maxLength, min, max, custom } = setting.validation;
      
      if (pattern && typeof value === 'string' && !pattern.test(value)) {
        return t.invalidValue;
      }
      
      if (minLength && typeof value === 'string' && value.length < minLength) {
        return `Minimum ${minLength} tegn`;
      }
      
      if (maxLength && typeof value === 'string' && value.length > maxLength) {
        return `Maksimum ${maxLength} tegn`;
      }
      
      if (min && typeof value === 'number' && value < min) {
        return `Minimum verdi er ${min}`;
      }
      
      if (max && typeof value === 'number' && value > max) {
        return `Maksimum verdi er ${max}`;
      }
      
      if (custom) {
        return custom(value);
      }
    }

    return undefined;
  }, [t]);

  // Event handlers
  const handleCategoryChange = useCallback((categoryId: string) => {
    updateState({ activeCategory: categoryId });
    callbacks.onCategoryChange?.(categoryId);
  }, [updateState, callbacks]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    updateState({ searchQuery: query });
    callbacks.onSearch?.(query);
    
    if (query) {
      announce(`${t.searchResultsAnnouncement} - ${filteredCategories.length} kategorier funnet`);
    }
  }, [updateState, callbacks, announce, t, filteredCategories.length]);

  const handleSettingChange = useCallback((setting: SettingItem, newValue: any) => {
    const newValues = { ...values, [setting.key]: newValue };
    const newErrors = { ...errors };
    
    // Validate if enabled
    if (validateOnChange) {
      const error = validateSetting(setting, newValue);
      if (error) {
        newErrors[setting.key] = error;
      } else {
        delete newErrors[setting.key];
      }
    }
    
    // Check for changes
    const hasChanges = Object.keys(newValues).some(key => 
      newValues[key] !== originalValues[key]
    );
    
    updateState({ 
      values: newValues, 
      errors: newErrors,
      hasUnsavedChanges: hasChanges
    });
    
    callbacks.onSettingChange?.(setting.key, newValue, activeCategory);
    
    // Auto-save if enabled and no errors
    if (autoSave && Object.keys(newErrors).length === 0) {
      handleSave();
    }
  }, [
    values, errors, originalValues, validateOnChange, validateSetting,
    updateState, callbacks, activeCategory, autoSave
  ]);

  const handleSave = useCallback(async () => {
    if (saving) return;

    // Validate all settings
    const newErrors: Record<string, string> = {};
    categories.forEach(category => {
      category.settings.forEach(setting => {
        const error = validateSetting(setting, values[setting.key]);
        if (error) {
          newErrors[setting.key] = error;
        }
      });
    });

    if (Object.keys(newErrors).length > 0) {
      updateState({ errors: newErrors });
      announce(`${t.validationError}: ${Object.keys(newErrors).length} feil funnet`);
      return;
    }

    // Get changed keys
    const changedKeys = Object.keys(values).filter(key => 
      values[key] !== originalValues[key]
    );

    if (changedKeys.length === 0) {
      announce('Ingen endringer å lagre');
      return;
    }

    try {
      updateState({ saving: true });
      await callbacks.onSave(values, changedKeys);
      updateState({ 
        originalValues: { ...values }, 
        hasUnsavedChanges: false 
      });
      announce(t.changesSavedAnnouncement);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lagring feilet';
      announce(`Feil ved lagring: ${errorMessage}`);
    } finally {
      updateState({ saving: false });
    }
  }, [
    saving, categories, validateSetting, values, originalValues,
    updateState, announce, t, callbacks
  ]);

  const handleReset = useCallback(async () => {
    if (!callbacks.onReset) {
      // Local reset
      updateState({ 
        values: { ...initialValues }, 
        originalValues: { ...initialValues },
        hasUnsavedChanges: false,
        errors: {}
      });
      announce(t.changesResetAnnouncement);
      return;
    }

    try {
      updateState({ loading: true });
      await callbacks.onReset();
      announce(t.changesResetAnnouncement);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Tilbakestilling feilet';
      announce(`Feil ved tilbakestilling: ${errorMessage}`);
    } finally {
      updateState({ loading: false });
    }
  }, [callbacks, updateState, announce, t, initialValues]);

  const handleExport = useCallback(async () => {
    if (!callbacks.onExport || exporting) return;

    try {
      updateState({ exporting: true });
      await callbacks.onExport();
      announce(t.exportSuccess);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Eksport feilet';
      announce(`Feil ved eksport: ${errorMessage}`);
    } finally {
      updateState({ exporting: false });
    }
  }, [callbacks, exporting, updateState, announce, t]);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !callbacks.onImport || importing) return;

    try {
      updateState({ importing: true });
      await callbacks.onImport(file);
      announce(t.importSuccess);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Import feilet';
      announce(`Feil ved import: ${errorMessage}`);
    } finally {
      updateState({ importing: false });
      // Reset file input
      e.target.value = '';
    }
  }, [callbacks, importing, updateState, announce, t]);

  // Render setting input
  const renderSettingInput = useCallback((setting: SettingItem) => {
    const value = values[setting.key] ?? setting.defaultValue;
    const error = errors[setting.key];
    const commonProps = {
      id: `setting-${setting.key}`,
      disabled: setting.disabled || loading || saving,
      error: !!error,
      helperText: error || setting.description,
      nsmClassification: setting.nsmClassification
    };

    switch (setting.type) {
      case 'text':
      case 'email':
        return (
          <Input
            {...commonProps}
            type={setting.type}
            value={value || ''}
            onChange={(e) => handleSettingChange(setting, e.target.value)}
            placeholder={setting.placeholder}
            required={setting.required}
          />
        );

      case 'password':
        return (
          <Input
            {...commonProps}
            type="password"
            value={value || ''}
            onChange={(e) => handleSettingChange(setting, e.target.value)}
            placeholder={setting.placeholder}
            required={setting.required}
          />
        );

      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            value={value || ''}
            onChange={(e) => handleSettingChange(setting, Number(e.target.value))}
            placeholder={setting.placeholder}
            required={setting.required}
            min={setting.validation?.min}
            max={setting.validation?.max}
          />
        );

      case 'textarea':
        return (
          <textarea
            {...commonProps}
            value={value || ''}
            onChange={(e) => handleSettingChange(setting, e.target.value)}
            placeholder={setting.placeholder}
            required={setting.required}
            rows={4}
            className={cn(
              'flex w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-base',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20 focus:border-primary',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive focus:ring-destructive/20 focus:border-destructive'
            )}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id={`setting-${setting.key}`}
              checked={Boolean(value)}
              onChange={(e) => handleSettingChange(setting, e.target.checked)}
              disabled={setting.disabled || loading || saving}
              className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label
              htmlFor={`setting-${setting.key}`}
              className="text-sm font-medium text-foreground select-none"
            >
              {value ? t.enabled : t.disabled}
            </label>
          </div>
        );

      case 'select':
        return (
          <select
            {...commonProps}
            value={value || ''}
            onChange={(e) => handleSettingChange(setting, e.target.value)}
            required={setting.required}
            className={cn(
              'flex w-full h-14 rounded-lg border-2 border-input bg-background px-4 py-3 text-base',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20 focus:border-primary',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive focus:ring-destructive/20 focus:border-destructive'
            )}
          >
            {!setting.required && <option value="">Velg...</option>}
            {setting.options?.map(option => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {setting.options?.map(option => (
              <div key={option.value} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={`${setting.key}-${option.value}`}
                  checked={selectedValues.includes(option.value)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter(v => v !== option.value);
                    handleSettingChange(setting, newValue);
                  }}
                  disabled={option.disabled || setting.disabled || loading || saving}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label
                  htmlFor={`${setting.key}-${option.value}`}
                  className="text-sm text-foreground select-none"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  }, [values, errors, handleSettingChange, loading, saving, t]);

  const activeCategories = searchQuery ? filteredCategories : categories;
  const currentCategory = activeCategories.find(cat => cat.id === activeCategory) || activeCategories[0];

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Header */}
      <Card nsmClassification={nsmClassification}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">{t.settingsTitle}</CardTitle>
              <CardDescription className="text-lg mt-2">
                {t.settingsDescription}
              </CardDescription>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              {showImportExport && (
                <>
                  {callbacks.onExport && (
                    <Button
                      variant="outline"
                      onClick={handleExport}
                      loading={exporting}
                      disabled={loading || saving || importing}
                      leftIcon={
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      }
                    >
                      {t.exportSettings}
                    </Button>
                  )}

                  {callbacks.onImport && (
                    <div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        disabled={loading || saving || importing || exporting}
                        className="hidden"
                        id="import-settings"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('import-settings')?.click()}
                        loading={importing}
                        disabled={loading || saving || exporting}
                        leftIcon={
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                          </svg>
                        }
                      >
                        {t.importSettings}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Search */}
          {showSearch && (
            <div className="mt-6">
              <Input
                placeholder={t.searchSettings}
                value={searchQuery}
                onChange={handleSearch}
                disabled={loading}
                leadingIcon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
          )}

          {/* Unsaved changes warning */}
          {hasUnsavedChanges && (
            <div className="mt-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-800">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="font-medium">{t.unsavedChanges}</span>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Category Navigation */}
        <div className={cn('w-64 flex-shrink-0', stickyNavigation && 'sticky top-6 self-start')}>
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {activeCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={cn(
                      'flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors',
                      'hover:bg-accent',
                      activeCategory === category.id && 'bg-primary text-primary-foreground'
                    )}
                    disabled={loading}
                  >
                    {category.icon && (
                      <span className="flex-shrink-0" aria-hidden="true">
                        {category.icon}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{category.title}</div>
                      {category.description && (
                        <div className="text-xs opacity-75 truncate">
                          {category.description}
                        </div>
                      )}
                    </div>
                    <div className="text-xs opacity-60">
                      {category.settings.length}
                    </div>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center gap-3">
                  <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>{t.loading}</span>
                </div>
              </CardContent>
            </Card>
          ) : !currentCategory ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                {t.noSettingsFound}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {currentCategory.icon && (
                    <span aria-hidden="true">{currentCategory.icon}</span>
                  )}
                  {currentCategory.title}
                </CardTitle>
                {currentCategory.description && (
                  <CardDescription>{currentCategory.description}</CardDescription>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="space-y-8">
                  {currentCategory.settings.map(setting => (
                    <div key={setting.key} className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <label
                            htmlFor={`setting-${setting.key}`}
                            className="text-sm font-medium text-foreground block"
                          >
                            {setting.title}
                            {setting.required && (
                              <span className="text-destructive ml-1">*</span>
                            )}
                          </label>
                          {setting.description && setting.type !== 'boolean' && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {setting.description}
                            </p>
                          )}
                        </div>
                        
                        {setting.nsmClassification && (
                          <span className={cn(
                            'text-xs px-2 py-1 rounded ml-4 flex-shrink-0',
                            setting.nsmClassification === 'OPEN' && 'bg-green-100 text-green-700',
                            setting.nsmClassification === 'RESTRICTED' && 'bg-yellow-100 text-yellow-700',
                            setting.nsmClassification === 'CONFIDENTIAL' && 'bg-red-100 text-red-700',
                            setting.nsmClassification === 'SECRET' && 'bg-gray-100 text-gray-700'
                          )}>
                            {setting.nsmClassification}
                          </span>
                        )}
                      </div>
                      
                      <div className="max-w-md">
                        {renderSettingInput(setting)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {currentCategory && !autoSave && (
            <Card className="mt-6">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    loading={saving}
                    disabled={loading || saving || !hasUnsavedChanges}
                    leftIcon={
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    }
                  >
                    {t.saveChanges}
                  </Button>

                  {hasUnsavedChanges && (
                    <Button
                      variant="outline"
                      onClick={() => updateState({ 
                        values: { ...originalValues }, 
                        hasUnsavedChanges: false,
                        errors: {}
                      })}
                      disabled={loading || saving}
                    >
                      {t.cancelChanges}
                    </Button>
                  )}
                </div>

                {showResetButton && (callbacks.onReset || Object.keys(originalValues).length > 0) && (
                  <Button
                    variant="destructive"
                    onClick={handleReset}
                    disabled={loading || saving}
                    leftIcon={
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    }
                  >
                    {t.resetToDefaults}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};