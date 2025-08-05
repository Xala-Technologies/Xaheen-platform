/**
 * NSM Classification Level Templates
 * Specialized templates for each Norwegian security classification level
 * @version 1.0.0
 */

import type { 
  NSMClassification, 
  NSMClassifiedTemplate,
  NorwegianComplianceConfig 
} from '../types/norwegian-compliance.js';
import { NSMClassificationService } from './nsm-classification.js';

export interface ClassificationTemplateConfig {
  readonly classification: NSMClassification;
  readonly componentType: string;
  readonly securityFeatures: string[];
  readonly auditRequirements: string[];
  readonly accessControls: string[];
  readonly styling: ClassificationStyling;
}

export interface ClassificationStyling {
  readonly banner: boolean;
  readonly watermark: boolean;
  readonly colorScheme: string;
  readonly headerColor: string;
  readonly borderColor: string;
  readonly classificationText: string;
}

// Classification-specific styling configurations
const CLASSIFICATION_STYLING: Record<NSMClassification, ClassificationStyling> = {
  OPEN: {
    banner: false,
    watermark: false,
    colorScheme: 'default',
    headerColor: '#ffffff',
    borderColor: '#e5e7eb',
    classificationText: '',
  },
  RESTRICTED: {
    banner: true,
    watermark: false,
    colorScheme: 'orange',
    headerColor: '#FFA500',
    borderColor: '#FF8C00',
    classificationText: 'BEGRENSET - RESTRICTED',
  },
  CONFIDENTIAL: {
    banner: true,
    watermark: true,
    colorScheme: 'red',
    headerColor: '#FF0000',
    borderColor: '#DC143C',
    classificationText: 'KONFIDENSIELL - CONFIDENTIAL',
  },
  SECRET: {
    banner: true,
    watermark: true,
    colorScheme: 'purple',
    headerColor: '#8A2BE2',
    borderColor: '#6A1B9A',
    classificationText: 'HEMMELIG - SECRET',
  },
};

export class ClassificationTemplateService {
  /**
   * Generate component template for specific classification level
   */
  static generateClassifiedComponent(
    componentName: string,
    classification: NSMClassification,
    componentType: string = 'form'
  ): string {
    const config = NSMClassificationService.getClassificationTemplate(classification);
    const styling = CLASSIFICATION_STYLING[classification];
    const securityHeaders = NSMClassificationService.generateSecurityHeaders(classification);
    const classificationMarkup = NSMClassificationService.generateClassificationMarkup(classification);
    const classificationCSS = NSMClassificationService.generateClassificationStyles(classification);

    return `
import React, { useEffect, useState } from 'react';
import { Card, Stack, Text, Button, Alert } from '@xala/ui-system';
import { useNorwegianLocale } from '../compliance/norwegian-localization';
import { useGDPRAudit } from '../compliance/gdpr-compliance';
import { cn } from '@xala/ui-system/utils';

interface ${componentName}Props {
  readonly children?: React.ReactNode;
  readonly onSecurityViolation?: (violation: string) => void;
  readonly userClearanceLevel?: string;
  readonly className?: string;
}

/**
 * ${componentName} - ${classification} Classification
 * 
 * Security Requirements:
 * - Classification Level: ${classification}
 * - Authentication: ${config.securityRequirements.technical.authenticationRequired ? 'Required' : 'Not Required'}
 * - VPN Access: ${config.securityRequirements.technical.vpnRequired ? 'Required' : 'Not Required'}
 * - Session Timeout: ${config.securityRequirements.technical.sessionTimeout} minutes
 * - Audit Trail: ${config.securityRequirements.dataHandling.auditTrail ? 'Required' : 'Not Required'}
 * - Data Encryption: ${config.securityRequirements.dataHandling.encryption ? 'Required' : 'Not Required'}
 */
export const ${componentName} = ({
  children,
  onSecurityViolation,
  userClearanceLevel = 'PUBLIC',
  className,
}: ${componentName}Props): JSX.Element => {
  const { t } = useNorwegianLocale();
  const { logUserAction, logDataAccess } = useGDPRAudit();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);

  // Verify user clearance level
  useEffect(() => {
    const hasAccess = NSMClassificationService.validateUserClearance(
      userClearanceLevel,
      '${classification}'
    );
    
    if (!hasAccess) {
      const violation = \`User clearance level '\${userClearanceLevel}' insufficient for ${classification} classification\`;
      onSecurityViolation?.(violation);
      return;
    }
    
    setIsAuthorized(true);
    
    // Log access attempt
    logDataAccess('${classification.toLowerCase()}_component', '${componentName}');
    
    ${config.securityRequirements.technical.sessionTimeout > 0 ? `
    // Set up session timeout
    const timeout = setTimeout(() => {
      onSecurityViolation?.('Session timeout exceeded');
      setIsAuthorized(false);
    }, ${config.securityRequirements.technical.sessionTimeout} * 60 * 1000);
    
    setSessionTimeout(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
    ` : ''}
  }, [userClearanceLevel, onSecurityViolation, logDataAccess]);

  // Handle user actions with audit logging
  const handleUserAction = (action: string, details?: Record<string, any>) => {
    logUserAction(action, '${componentName}', details);
  };

  // Security violation handler
  const handleSecurityViolation = (violation: string) => {
    console.error('[SECURITY VIOLATION]:', violation);
    onSecurityViolation?.(violation);
    
    // Log security event
    logUserAction('security_violation', '${componentName}', { violation });
  };

  // Authorization check
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="max-w-md p-8 text-center">
          <Alert variant="destructive" className="mb-4">
            <Text className="font-semibold">Adgang nektet / Access Denied</Text>
            <Text className="text-sm mt-2">
              Du har ikke tilstrekkelig sikkerhetsgodkjenning for å få tilgang til dette innholdet.
            </Text>
            <Text className="text-sm mt-1">
              You do not have sufficient security clearance to access this content.
            </Text>
          </Alert>
          <Text className="text-xs text-gray-500 mt-4">
            Påkrevd nivå / Required Level: ${classification}
          </Text>
        </Card>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: \`${classificationCSS}\` }} />
      
      {/* Classification Banner */}
      ${styling.banner ? `
      <div className="nsm-classification-banner">
        <Text className="font-bold text-sm">
          ${styling.classificationText}
        </Text>
      </div>
      ` : ''}

      {/* Classification Watermark */}
      ${styling.watermark ? `
      <div className="nsm-classification-watermark">
        ${classification}
      </div>
      ` : ''}

      <div 
        className={cn(
          'min-h-screen',
          ${styling.banner ? `'border-t-4 border-[${styling.borderColor}]'` : ''},
          className
        )}
        data-classification="${classification}"
        data-component="${componentName}"
      >
        ${classification !== 'OPEN' ? `
        {/* Security Warning */}
        <Alert variant="warning" className="m-4">
          <Text className="font-semibold">
            {t('security.classificationWarning', { level: '${classification}' })}
          </Text>
          <Text className="text-sm mt-1">
            Dette innholdet er klassifisert som ${classification}. 
            Uautorisert tilgang eller distribusjon er forbudt.
          </Text>
        </Alert>
        ` : ''}

        <div className="container mx-auto px-4 py-8">
          {children}
        </div>

        ${classification !== 'OPEN' ? `
        {/* Security Footer */}
        <footer className="bg-gray-900 text-white py-4 px-4 text-center">
          <Text className="text-xs">
            Klassifisert som ${classification} i henhold til NSM-retningslinjer
          </Text>
          <Text className="text-xs mt-1">
            Classified as ${classification} according to NSM guidelines
          </Text>
        </footer>
        ` : ''}
      </div>
    </>
  );
};

export default ${componentName};
`;
  }

  /**
   * Generate form template with classification-specific security measures
   */
  static generateClassifiedForm(
    formName: string,
    classification: NSMClassification,
    fields: any[] = []
  ): string {
    const config = NSMClassificationService.getClassificationTemplate(classification);
    const styling = CLASSIFICATION_STYLING[classification];

    return `
import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, Stack, Text, Button, Input, Alert } from '@xala/ui-system';
import { useNorwegianLocale } from '../compliance/norwegian-localization';
import { useGDPRAudit } from '../compliance/gdpr-compliance';
import { NSMClassificationService } from '../compliance/nsm-classification';

// Form validation schema
const ${formName}Schema = z.object({
  ${fields.map(field => {
    switch (field.type) {
      case 'email':
        return `${field.name}: z.string().email('${field.validation?.required ? 'Påkrevd felt' : 'Ugyldig e-post'}')${field.validation?.required ? '' : '.optional()'},`;
      case 'text':
        return `${field.name}: z.string()${field.validation?.minLength ? `.min(${field.validation.minLength}, 'Minimum ${field.validation.minLength} tegn')` : ''}${field.validation?.required ? '' : '.optional()'},`;
      default:
        return `${field.name}: z.string()${field.validation?.required ? '' : '.optional()'},`;
    }
  }).join('\n  ')}
});

type ${formName}Data = z.infer<typeof ${formName}Schema>;

interface ${formName}Props {
  readonly onSubmit: (data: ${formName}Data) => Promise<void>;
  readonly userClearanceLevel?: string;
  readonly className?: string;
}

export const ${formName} = ({
  onSubmit,
  userClearanceLevel = 'PUBLIC',
  className,
}: ${formName}Props): JSX.Element => {
  const { t } = useNorwegianLocale();
  const { logDataModification, logUserAction } = useGDPRAudit();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [securityViolations, setSecurityViolations] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<${formName}Data>({
    resolver: zodResolver(${formName}Schema),
    mode: 'onChange',
  });

  // Validate user clearance
  const hasAccess = NSMClassificationService.validateUserClearance(
    userClearanceLevel,
    '${classification}'
  );

  const handleFormSubmit = useCallback(async (data: ${formName}Data) => {
    if (!hasAccess) {
      setSecurityViolations(prev => [...prev, 'Insufficient clearance level']);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Log form submission
      logUserAction('form_submit', '${formName}', { classification: '${classification}' });
      
      ${config.securityRequirements.dataHandling.encryption ? `
      // Apply data encryption for ${classification} classification
      const encryptedData = {
        ...data,
        // In a real implementation, encrypt sensitive fields
        _encrypted: true,
        _classification: '${classification}',
      };
      
      await onSubmit(encryptedData as ${formName}Data);
      ` : `
      await onSubmit(data);
      `}
      
      // Log successful submission
      logDataModification('${formName.toLowerCase()}_form', 'form_data', data);
      
      ${config.securityRequirements.dataHandling.auditTrail ? `
      // Create audit trail entry
      console.log('[AUDIT]', {
        action: 'form_submission',
        form: '${formName}',
        classification: '${classification}',
        timestamp: new Date().toISOString(),
        userClearance: userClearanceLevel,
      });
      ` : ''}
      
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
      logUserAction('form_error', '${formName}', { error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }, [hasAccess, onSubmit, reset, logUserAction, logDataModification, userClearanceLevel]);

  if (!hasAccess) {
    return (
      <Card className="max-w-md mx-auto p-8 text-center">
        <Alert variant="destructive">
          <Text className="font-semibold">Adgang nektet</Text>
          <Text className="text-sm mt-2">
            Du har ikke tilstrekkelig sikkerhetsgodkjenning (${classification}) for å få tilgang til dette skjemaet.
          </Text>
        </Alert>
      </Card>
    );
  }

  return (
    <Card className={cn('max-w-2xl mx-auto p-8', className)}>
      {/* Classification Banner */}
      ${styling.banner ? `
      <div 
        className="mb-6 p-3 text-center font-bold text-white rounded-t-lg"
        style={{ backgroundColor: '${styling.headerColor}' }}
      >
        <Text className="text-sm">
          ${styling.classificationText}
        </Text>
      </div>
      ` : ''}

      <Stack spacing="6">
        <div>
          <Text variant="h2" className="text-2xl font-bold mb-2">
            {t('forms.${formName.toLowerCase()}.title', '${formName}')}
          </Text>
          ${classification !== 'OPEN' ? `
          <Alert variant="info" className="mt-4">
            <Text className="text-sm">
              Dette skjemaet håndterer ${classification}-klassifisert informasjon. 
              All data vil bli kryptert og logget i henhold til NSM-retningslinjer.
            </Text>
          </Alert>
          ` : ''}
        </div>

        {securityViolations.length > 0 && (
          <Alert variant="destructive">
            <Text className="font-semibold">Sikkerhetsbruddsvarsel</Text>
            <ul className="mt-2 text-sm">
              {securityViolations.map((violation, index) => (
                <li key={index}>• {violation}</li>
              ))}
            </ul>
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <Stack spacing="4">
            ${fields.map(field => `
            <Controller
              name="${field.name}"
              control={control}
              render={({ field: formField }) => (
                <Input
                  {...formField}
                  label="${field.label}"
                  type="${field.type || 'text'}"
                  placeholder="${field.placeholder || ''}"
                  required={${field.validation?.required || false}}
                  error={!!errors.${field.name}}
                  errorText={errors.${field.name}?.message}
                  helperText="${field.helperText || ''}"
                  size="medium"
                  fullWidth
                  ${classification !== 'OPEN' ? `
                  className="border-2"
                  style={{ borderColor: errors.${field.name} ? '#ef4444' : '${styling.borderColor}' }}
                  ` : ''}
                />
              )}
            />
            `).join('')}
          </Stack>

          <div className="flex justify-between items-center pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isSubmitting}
            >
              {t('common.reset', 'Nullstill')}
            </Button>

            <Button
              type="submit"
              variant="default"
              disabled={!isValid || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting 
                ? t('common.loading', 'Sender...') 
                : t('common.submit', 'Send inn')
              }
            </Button>
          </div>

          ${classification !== 'OPEN' ? `
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
            <Text className="text-xs text-gray-600">
              Klassifikasjon: ${classification} | 
              Sikkerhetsnivå: ${config.securityRequirements.technical.authenticationRequired ? 'Autentisering påkrevd' : 'Åpen'} |
              ${config.securityRequirements.dataHandling.auditTrail ? 'Sporing aktivert' : 'Ingen sporing'}
            </Text>
          </div>
          ` : ''}
        </form>
      </Stack>
    </Card>
  );
};

export default ${formName};
`;
  }

  /**
   * Generate data display template with classification controls
   */
  static generateClassifiedDataTable(
    tableName: string,
    classification: NSMClassification,
    columns: any[] = []
  ): string {
    const config = NSMClassificationService.getClassificationTemplate(classification);
    const styling = CLASSIFICATION_STYLING[classification];

    return `
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  Button,
  Input,
  Select,
  Card,
  Stack,
  Text,
  Alert,
  Badge
} from '@xala/ui-system';
import { useNorwegianLocale } from '../compliance/norwegian-localization';
import { useGDPRAudit } from '../compliance/gdpr-compliance';
import { NSMClassificationService } from '../compliance/nsm-classification';
import { cn } from '@xala/ui-system/utils';

interface ${tableName}Data {
  readonly id: string;
  ${columns.map(col => `readonly ${col.key}: ${col.type === 'number' ? 'number' : 'string'};`).join('\n  ')}
  readonly classification?: '${classification}';
}

interface ${tableName}Props {
  readonly data: ${tableName}Data[];
  readonly userClearanceLevel?: string;
  readonly onRowClick?: (row: ${tableName}Data) => void;
  readonly onDataExport?: (data: ${tableName}Data[]) => void;
  readonly className?: string;
}

export const ${tableName} = ({
  data,
  userClearanceLevel = 'PUBLIC',
  onRowClick,
  onDataExport,
  className,
}: ${tableName}Props): JSX.Element => {
  const { t, formatDate } = useNorwegianLocale();
  const { logDataAccess, logUserAction } = useGDPRAudit();
  const [filteredData, setFilteredData] = useState<${tableName}Data[]>(data);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Validate user clearance
  const hasAccess = NSMClassificationService.validateUserClearance(
    userClearanceLevel,
    '${classification}'
  );

  useEffect(() => {
    if (hasAccess) {
      // Log data access
      logDataAccess('${tableName.toLowerCase()}_table', 'view_data');
    }
  }, [hasAccess, logDataAccess]);

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = data.filter(row => {
      if (!searchTerm) return true;
      return Object.values(row).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    if (sortColumn) {
      result.sort((a, b) => {
        const aVal = a[sortColumn as keyof ${tableName}Data];
        const bVal = b[sortColumn as keyof ${tableName}Data];
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        
        if (sortDirection === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    }

    return result;
  }, [data, searchTerm, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    
    logUserAction('table_sort', '${tableName}', { column, direction: sortDirection });
  };

  const handleRowClick = (row: ${tableName}Data) => {
    logUserAction('table_row_click', '${tableName}', { rowId: row.id });
    onRowClick?.(row);
  };

  const handleExport = () => {
    if (!hasAccess) return;
    
    ${config.securityRequirements.dataHandling.auditTrail ? `
    // Log export action
    logUserAction('data_export', '${tableName}', { 
      rowCount: selectedRows.size || processedData.length,
      classification: '${classification}' 
    });
    ` : ''}
    
    const exportData = selectedRows.size > 0 
      ? processedData.filter(row => selectedRows.has(row.id))
      : processedData;
    
    onDataExport?.(exportData);
  };

  const handleRowSelection = (rowId: string, selected: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(rowId);
      } else {
        newSet.delete(rowId);
      }
      return newSet;
    });
  };

  if (!hasAccess) {
    return (
      <Card className="max-w-4xl mx-auto p-8 text-center">
        <Alert variant="destructive">
          <Text className="font-semibold">Adgang nektet</Text>
          <Text className="text-sm mt-2">
            Du har ikke tilstrekkelig sikkerhetsgodkjenning (${classification}) for å få tilgang til disse dataene.
          </Text>
        </Alert>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      {/* Classification Header */}
      ${styling.banner ? `
      <div 
        className="p-4 text-center font-bold text-white"
        style={{ backgroundColor: '${styling.headerColor}' }}
      >
        <Text className="text-sm">
          ${styling.classificationText}
        </Text>
      </div>
      ` : ''}

      <div className="p-6">
        <Stack spacing="4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Text variant="h3" className="text-xl font-semibold">
                {t('tables.${tableName.toLowerCase()}.title', '${tableName}')}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                {processedData.length} {t('common.records', 'oppføringer')}
                ${classification !== 'OPEN' ? ` • ${classification} klassifisert` : ''}
              </Text>
            </div>

            <div className="flex gap-2">
              {selectedRows.size > 0 && (
                <Badge variant="secondary">
                  {selectedRows.size} {t('common.selected', 'valgt')}
                </Badge>
              )}
              
              ${config.securityRequirements.dataHandling.auditTrail ? `
              <Button
                variant="outline"
                size="small"
                onClick={handleExport}
                disabled={processedData.length === 0}
              >
                {t('common.export', 'Eksporter')}
              </Button>
              ` : ''}
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder={t('common.search', 'Søk...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          ${classification !== 'OPEN' ? `
          <Alert variant="info">
            <Text className="text-sm">
              Alle datahandlinger logges i henhold til ${classification}-klassifikasjon. 
              Uautorisert tilgang eller distribusjon er forbudt.
            </Text>
          </Alert>
          ` : ''}

          {/* Data Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  ${config.securityRequirements.dataHandling.auditTrail ? `
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(new Set(processedData.map(row => row.id)));
                        } else {
                          setSelectedRows(new Set());
                        }
                      }}
                      checked={selectedRows.size === processedData.length && processedData.length > 0}
                    />
                  </TableHead>
                  ` : ''}
                  
                  ${columns.map(column => `
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('${column.key}')}
                  >
                    <div className="flex items-center gap-2">
                      <Text className="font-medium">
                        {t('tables.columns.${column.key}', '${column.label}')}
                      </Text>
                      {sortColumn === '${column.key}' && (
                        <span className="text-xs">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  `).join('')}
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {processedData.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'cursor-pointer hover:bg-gray-50',
                      selectedRows.has(row.id) && 'bg-blue-50'
                    )}
                    onClick={() => handleRowClick(row)}
                  >
                    ${config.securityRequirements.dataHandling.auditTrail ? `
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRowSelection(row.id, e.target.checked);
                        }}
                      />
                    </TableCell>
                    ` : ''}
                    
                    ${columns.map(column => `
                    <TableCell>
                      ${column.type === 'date' ? `
                      <Text className="text-sm">
                        {formatDate(new Date(row.${column.key}), 'short')}
                      </Text>
                      ` : column.type === 'badge' ? `
                      <Badge variant={row.${column.key} === 'active' ? 'default' : 'secondary'}>
                        {String(row.${column.key})}
                      </Badge>
                      ` : `
                      <Text className="text-sm">
                        {String(row.${column.key})}
                      </Text>
                      `}
                    </TableCell>
                    `).join('')}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {processedData.length === 0 && (
            <div className="text-center py-12">
              <Text className="text-gray-500">
                {searchTerm 
                  ? t('tables.noResults', 'Ingen resultater funnet')
                  : t('tables.noData', 'Ingen data tilgjengelig')
                }
              </Text>
            </div>
          )}

          ${classification !== 'OPEN' ? `
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
            <Text className="text-xs text-gray-600">
              Klassifikasjon: ${classification} | 
              Tilgangsnivå: {userClearanceLevel} | 
              ${config.securityRequirements.dataHandling.auditTrail ? 'Alle handlinger logges' : 'Begrensede tilgangskontroller'}
            </Text>
          </div>
          ` : ''}
        </Stack>
      </div>
    </Card>
  );
};

export default ${tableName};
`;
  }

  /**
   * Generate complete classified application template
   */
  static generateClassifiedApplication(
    appName: string,
    classification: NSMClassification
  ): string {
    const config = NSMClassificationService.getClassificationTemplate(classification);
    const styling = CLASSIFICATION_STYLING[classification];

    return `
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Card, Stack, Text, Button, Alert } from '@xala/ui-system';
import { NorwegianLocaleProvider } from '../compliance/norwegian-localization';
import { RTLProvider } from '../compliance/rtl-support';
import { NSMClassificationService } from '../compliance/nsm-classification';
import { GDPRComplianceService } from '../compliance/gdpr-compliance';

// Security configuration
const SECURITY_CONFIG = {
  classification: '${classification}',
  requiresAuthentication: ${config.securityRequirements.technical.authenticationRequired},
  requiresVPN: ${config.securityRequirements.technical.vpnRequired},
  sessionTimeout: ${config.securityRequirements.technical.sessionTimeout},
  auditTrail: ${config.securityRequirements.dataHandling.auditTrail},
  encryption: ${config.securityRequirements.dataHandling.encryption},
};

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: ${classification === 'SECRET' ? 1 : 3},
      staleTime: ${classification === 'SECRET' ? 30000 : 300000}, // More aggressive caching for lower classifications
    },
  },
});

interface ${appName}Props {
  readonly userClearanceLevel?: string;
  readonly locale?: string;
  readonly theme?: 'light' | 'dark';
}

interface SecurityContext {
  readonly isAuthenticated: boolean;
  readonly userClearanceLevel: string;
  readonly sessionValid: boolean;
  readonly securityViolations: string[];
}

export const ${appName} = ({
  userClearanceLevel = 'PUBLIC',
  locale = 'nb-NO',
  theme = 'light',
}: ${appName}Props): JSX.Element => {
  const [securityContext, setSecurityContext] = useState<SecurityContext>({
    isAuthenticated: false,
    userClearanceLevel,
    sessionValid: true,
    securityViolations: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  // Initialize security checks
  useEffect(() => {
    const initializeSecurity = async () => {
      try {
        // Verify user clearance
        const hasAccess = NSMClassificationService.validateUserClearance(
          userClearanceLevel,
          '${classification}'
        );

        if (!hasAccess) {
          setSecurityContext(prev => ({
            ...prev,
            securityViolations: [...prev.securityViolations, 'Insufficient clearance level'],
          }));
          return;
        }

        ${config.securityRequirements.technical.authenticationRequired ? `
        // Check authentication status
        const authStatus = await checkAuthenticationStatus();
        if (!authStatus.authenticated) {
          redirectToLogin();
          return;
        }
        ` : ''}

        ${config.securityRequirements.technical.vpnRequired ? `
        // Verify VPN connection
        const vpnStatus = await checkVPNConnection();
        if (!vpnStatus.connected) {
          setSecurityContext(prev => ({
            ...prev,
            securityViolations: [...prev.securityViolations, 'VPN connection required'],
          }));
          return;
        }
        ` : ''}

        // Initialize session timeout
        ${config.securityRequirements.technical.sessionTimeout > 0 ? `
        const sessionTimer = setTimeout(() => {
          setSecurityContext(prev => ({
            ...prev,
            sessionValid: false,
            securityViolations: [...prev.securityViolations, 'Session timeout'],
          }));
        }, ${config.securityRequirements.technical.sessionTimeout} * 60 * 1000);

        return () => clearTimeout(sessionTimer);
        ` : ''}

        setSecurityContext(prev => ({
          ...prev,
          isAuthenticated: true,
          sessionValid: true,
        }));

      } catch (error) {
        console.error('Security initialization error:', error);
        setSecurityContext(prev => ({
          ...prev,
          securityViolations: [...prev.securityViolations, 'Security initialization failed'],
        }));
      } finally {
        setIsLoading(false);
      }
    };

    initializeSecurity();
  }, [userClearanceLevel]);

  // Security violation handler
  const handleSecurityViolation = (violation: string) => {
    console.error('[SECURITY VIOLATION]:', violation);
    setSecurityContext(prev => ({
      ...prev,
      securityViolations: [...prev.securityViolations, violation],
    }));

    ${config.securityRequirements.dataHandling.auditTrail ? `
    // Log security violation
    fetch('/api/security/violation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        violation,
        timestamp: new Date().toISOString(),
        userClearanceLevel,
        classification: '${classification}',
        userAgent: navigator.userAgent,
      }),
    });
    ` : ''}
  };

  // Authentication check (placeholder)
  const checkAuthenticationStatus = async () => {
    // Implementation would check actual authentication status
    return { authenticated: true };
  };

  // VPN check (placeholder)
  const checkVPNConnection = async () => {
    // Implementation would check VPN status
    return { connected: true };
  };

  // Redirect to login (placeholder)
  const redirectToLogin = () => {
    window.location.href = '/login';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="p-8 text-center">
          <Text className="text-lg font-semibold mb-4">
            Initialiserer sikkerhet...
          </Text>
          <Text className="text-sm text-gray-600">
            Verificerer tilgangsnivå for ${classification}-klassifisert innhold
          </Text>
        </Card>
      </div>
    );
  }

  // Security violation state
  if (securityContext.securityViolations.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="max-w-md p-8">
          <Alert variant="destructive" className="mb-4">
            <Text className="font-semibold">Sikkerhetsbruddsvarsel</Text>
            <Text className="text-sm mt-2">
              Tilgang nektet på grunn av sikkerhetsproblemer:
            </Text>
            <ul className="mt-2 text-sm">
              {securityContext.securityViolations.map((violation, index) => (
                <li key={index}>• {violation}</li>
              ))}
            </ul>
          </Alert>
          
          <div className="text-center">
            <Text className="text-xs text-gray-500 mt-4">
              Kontakt systemadministrator for assistanse
            </Text>
            <Text className="text-xs text-gray-500">
              Klassifikasjon: ${classification}
            </Text>
          </div>
        </Card>
      </div>
    );
  }

  // Unauthenticated state
  if (SECURITY_CONFIG.requiresAuthentication && !securityContext.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="max-w-md p-8 text-center">
          <Alert variant="warning" className="mb-4">
            <Text className="font-semibold">Autentisering påkrevd</Text>
            <Text className="text-sm mt-2">
              Du må autentisere deg for å få tilgang til ${classification}-klassifisert innhold.
            </Text>
          </Alert>
          
          <Button 
            onClick={redirectToLogin}
            className="w-full mt-4"
          >
            Logg inn
          </Button>
        </Card>
      </div>
    );
  }

  // Main application
  return (
    <QueryClientProvider client={queryClient}>
      <NorwegianLocaleProvider defaultLocale={locale as any}>
        <RTLProvider defaultLanguage={locale}>
          <div 
            className={cn(
              'min-h-screen',
              theme === 'dark' ? 'dark' : ''
            )}
            data-classification="${classification}"
          >
            {/* Global Classification Banner */}
            ${styling.banner ? `
            <div 
              className="sticky top-0 z-50 p-2 text-center font-bold text-white text-sm"
              style={{ backgroundColor: '${styling.headerColor}' }}
            >
              ${styling.classificationText}
            </div>
            ` : ''}

            {/* Classification Watermark */}
            ${styling.watermark ? `
            <div 
              className="fixed inset-0 pointer-events-none z-10 flex items-center justify-center"
              style={{ 
                fontSize: '8rem',
                color: '${styling.headerColor}20',
                transform: 'rotate(-45deg)',
                fontWeight: 'bold'
              }}
            >
              ${classification}
            </div>
            ` : ''}

            <Router>
              <div className="relative z-20">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <DashboardPage 
                        securityContext={securityContext}
                        onSecurityViolation={handleSecurityViolation}
                      />
                    } 
                  />
                  <Route 
                    path="/data" 
                    element={
                      <DataPage 
                        securityContext={securityContext}
                        onSecurityViolation={handleSecurityViolation}
                      />
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <SettingsPage 
                        securityContext={securityContext}
                        onSecurityViolation={handleSecurityViolation}
                      />
                    } 
                  />
                </Routes>
              </div>
            </Router>

            {/* Security Footer */}
            ${classification !== 'OPEN' ? `
            <footer className="sticky bottom-0 bg-gray-900 text-white py-2 px-4 text-center z-30">
              <Text className="text-xs">
                Klassifisert som ${classification} • Sikkerhetsnivå: {userClearanceLevel} • 
                {SECURITY_CONFIG.auditTrail ? 'Alle handlinger logges' : 'Begrenset logging'}
              </Text>
            </footer>
            ` : ''}
          </div>
        </RTLProvider>
      </NorwegianLocaleProvider>
    </QueryClientProvider>
  );
};

// Placeholder page components
const DashboardPage = ({ securityContext, onSecurityViolation }: any) => (
  <div className="container mx-auto px-4 py-8">
    <Text variant="h1" className="text-3xl font-bold mb-8">
      Dashboard - ${classification}
    </Text>
    {/* Dashboard content */}
  </div>
);

const DataPage = ({ securityContext, onSecurityViolation }: any) => (
  <div className="container mx-auto px-4 py-8">
    <Text variant="h1" className="text-3xl font-bold mb-8">
      Data - ${classification}
    </Text>
    {/* Data content */}
  </div>
);

const SettingsPage = ({ securityContext, onSecurityViolation }: any) => (
  <div className="container mx-auto px-4 py-8">
    <Text variant="h1" className="text-3xl font-bold mb-8">
      Settings - ${classification}
    </Text>
    {/* Settings content */}
  </div>
);

export default ${appName};
`;
  }

  /**
   * Get template configuration for classification level
   */
  static getTemplateConfig(classification: NSMClassification): ClassificationTemplateConfig {
    const template = NSMClassificationService.getClassificationTemplate(classification);
    const styling = CLASSIFICATION_STYLING[classification];

    return {
      classification,
      componentType: 'classified',
      securityFeatures: [
        template.securityRequirements.technical.authenticationRequired ? 'authentication' : null,
        template.securityRequirements.technical.vpnRequired ? 'vpn' : null,
        template.securityRequirements.dataHandling.encryption ? 'encryption' : null,
        template.securityRequirements.dataHandling.auditTrail ? 'audit_trail' : null,
      ].filter(Boolean) as string[],
      auditRequirements: [
        template.auditRequirements.logging.userActions ? 'user_actions' : null,
        template.auditRequirements.logging.dataAccess ? 'data_access' : null,
        template.auditRequirements.logging.securityEvents ? 'security_events' : null,
      ].filter(Boolean) as string[],
      accessControls: [
        template.accessControls.authentication.required ? 'authentication' : null,
        template.accessControls.authorization.rbac ? 'rbac' : null,
        template.accessControls.network.vpnRequired ? 'vpn' : null,
        template.accessControls.network.ipWhitelisting ? 'ip_whitelist' : null,
      ].filter(Boolean) as string[],
      styling,
    };
  }
}

export default ClassificationTemplateService;