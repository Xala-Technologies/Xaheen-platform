/**
 * Audit Trail Logging Templates for Sensitive Data Handling
 * Comprehensive audit logging for NSM and GDPR compliance
 * @version 1.0.0
 */

import type { NSMClassification } from '../types/norwegian-compliance.js';

export interface AuditEvent {
  readonly id: string;
  readonly timestamp: string;
  readonly userId?: string;
  readonly sessionId: string;
  readonly classification: NSMClassification;
  readonly eventType: AuditEventType;
  readonly resource: string;
  readonly action: string;
  readonly details: Record<string, any>;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly location?: string;
  readonly success: boolean;
  readonly errorMessage?: string;
  readonly duration?: number;
}

export type AuditEventType = 
  | 'authentication'
  | 'authorization'
  | 'data_access'
  | 'data_modification'
  | 'data_deletion'
  | 'data_export'
  | 'configuration_change'
  | 'security_event'
  | 'privacy_event'
  | 'system_event';

export interface AuditConfiguration {
  readonly enabled: boolean;
  readonly classification: NSMClassification;
  readonly retentionPeriod: string; // ISO 8601 duration
  readonly encryptionRequired: boolean;
  readonly realTimeAlerting: boolean;
  readonly exportEnabled: boolean;
  readonly anonymizationRequired: boolean;
}

export class AuditTrailTemplateService {
  /**
   * Generate comprehensive audit logger component
   */
  static generateAuditLogger(): string {
    return `
import React, { useRef, useCallback, useEffect } from 'react';
import type { NSMClassification } from '../types/norwegian-compliance';

interface AuditEvent {
  readonly id: string;
  readonly timestamp: string;
  readonly userId?: string;
  readonly sessionId: string;
  readonly classification: NSMClassification;
  readonly eventType: string;
  readonly resource: string;
  readonly action: string;
  readonly details: Record<string, any>;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly location?: string;
  readonly success: boolean;
  readonly errorMessage?: string;
  readonly duration?: number;
}

interface AuditConfiguration {
  readonly enabled: boolean;
  readonly classification: NSMClassification;
  readonly retentionPeriod: string;
  readonly encryptionRequired: boolean;
  readonly realTimeAlerting: boolean;
  readonly exportEnabled: boolean;
  readonly anonymizationRequired: boolean;
}

class AuditTrailLogger {
  private static instance: AuditTrailLogger;
  private sessionId: string;
  private events: AuditEvent[] = [];
  private config: AuditConfiguration;
  private db: IDBDatabase | null = null;

  private constructor(config: AuditConfiguration) {
    this.sessionId = crypto.randomUUID();
    this.config = config;
    this.initializeDatabase();
  }

  public static getInstance(config: AuditConfiguration): AuditTrailLogger {
    if (!AuditTrailLogger.instance) {
      AuditTrailLogger.instance = new AuditTrailLogger(config);
    }
    return AuditTrailLogger.instance;
  }

  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('NorwegianAuditDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('audit_events')) {
          const store = db.createObjectStore('audit_events', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('classification', 'classification', { unique: false });
          store.createIndex('eventType', 'eventType', { unique: false });
          store.createIndex('resource', 'resource', { unique: false });
        }
      };
    });
  }

  public async logEvent(
    eventType: string,
    resource: string,
    action: string,
    details: Record<string, any> = {},
    userId?: string,
    success: boolean = true,
    errorMessage?: string,
    duration?: number
  ): Promise<void> {
    if (!this.config.enabled) return;

    const event: AuditEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId,
      sessionId: this.sessionId,
      classification: this.config.classification,
      eventType: eventType as any,
      resource,
      action,
      details: this.config.anonymizationRequired ? this.anonymizeDetails(details) : details,
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      location: await this.getGeolocation(),
      success,
      errorMessage,
      duration,
    };

    this.events.push(event);
    await this.persistEvent(event);
    
    if (this.config.realTimeAlerting && this.isSecurityEvent(event)) {
      await this.sendSecurityAlert(event);
    }
  }

  private async persistEvent(event: AuditEvent): Promise<void> {
    try {
      // Store locally
      if (this.db) {
        const transaction = this.db.transaction(['audit_events'], 'readwrite');
        const store = transaction.objectStore('audit_events');
        await store.add(event);
      }

      // Send to server
      if (navigator.onLine) {
        const encryptedEvent = this.config.encryptionRequired 
          ? await this.encryptEvent(event) 
          : event;

        await fetch('/api/audit/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Classification': this.config.classification,
          },
          body: JSON.stringify(encryptedEvent),
        });
      }
    } catch (error) {
      console.error('Failed to persist audit event:', error);
      // Store failed event for retry
      this.storeFailedEvent(event);
    }
  }

  private async encryptEvent(event: AuditEvent): Promise<any> {
    // In a real implementation, use proper encryption
    return {
      ...event,
      _encrypted: true,
      _algorithm: 'AES-256-GCM',
    };
  }

  private anonymizeDetails(details: Record<string, any>): Record<string, any> {
    const anonymized = { ...details };
    
    // Remove or hash sensitive fields
    const sensitiveFields = ['email', 'phone', 'ssn', 'personalId', 'name'];
    sensitiveFields.forEach(field => {
      if (anonymized[field]) {
        anonymized[field] = this.hashValue(anonymized[field]);
      }
    });

    return anonymized;
  }

  private hashValue(value: string): string {
    // Simple hash for demonstration - use proper hashing in production
    return btoa(value).substring(0, 8) + '...';
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('/api/client-ip');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private async getGeolocation(): Promise<string | undefined> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(\`\${position.coords.latitude},\${position.coords.longitude}\`);
        },
        () => resolve(undefined),
        { timeout: 5000 }
      );
    });
  }

  private isSecurityEvent(event: AuditEvent): boolean {
    const securityEvents = ['authentication', 'authorization', 'security_event'];
    return securityEvents.includes(event.eventType) || !event.success;
  }

  private async sendSecurityAlert(event: AuditEvent): Promise<void> {
    try {
      await fetch('/api/security/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          severity: event.success ? 'medium' : 'high',
          classification: event.classification,
          summary: \`Security event: \${event.eventType} on \${event.resource}\`,
          timestamp: event.timestamp,
        }),
      });
    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
  }

  private storeFailedEvent(event: AuditEvent): void {
    const failedEvents = JSON.parse(localStorage.getItem('failedAuditEvents') || '[]');
    failedEvents.push(event);
    localStorage.setItem('failedAuditEvents', JSON.stringify(failedEvents));
  }

  public async getAuditTrail(filters?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    eventType?: string;
    resource?: string;
    classification?: NSMClassification;
  }): Promise<AuditEvent[]> {
    if (!this.db) return [];

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['audit_events'], 'readonly');
      const store = transaction.objectStore('audit_events');
      const request = store.getAll();

      request.onsuccess = () => {
        let events = request.result as AuditEvent[];

        if (filters) {
          events = events.filter(event => {
            if (filters.startDate && event.timestamp < filters.startDate) return false;
            if (filters.endDate && event.timestamp > filters.endDate) return false;
            if (filters.userId && event.userId !== filters.userId) return false;
            if (filters.eventType && event.eventType !== filters.eventType) return false;
            if (filters.resource && event.resource !== filters.resource) return false;
            if (filters.classification && event.classification !== filters.classification) return false;
            return true;
          });
        }

        resolve(events.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
      };
    });
  }

  public async exportAuditTrail(
    format: 'json' | 'csv' | 'xml' = 'json',
    filters?: Parameters<typeof this.getAuditTrail>[0]
  ): Promise<string> {
    if (!this.config.exportEnabled) {
      throw new Error('Audit trail export is disabled');
    }

    const events = await this.getAuditTrail(filters);

    switch (format) {
      case 'csv':
        return this.exportAsCSV(events);
      case 'xml':
        return this.exportAsXML(events);
      default:
        return JSON.stringify(events, null, 2);
    }
  }

  private exportAsCSV(events: AuditEvent[]): string {
    const headers = [
      'ID', 'Timestamp', 'User ID', 'Session ID', 'Classification',
      'Event Type', 'Resource', 'Action', 'Success', 'IP Address', 'Duration'
    ];
    
    const rows = events.map(event => [
      event.id,
      event.timestamp,
      event.userId || '',
      event.sessionId,
      event.classification,
      event.eventType,
      event.resource,
      event.action,
      event.success.toString(),
      event.ipAddress,
      event.duration?.toString() || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\\n');
  }

  private exportAsXML(events: AuditEvent[]): string {
    const xml = events.map(event => \`
      <event>
        <id>\${event.id}</id>
        <timestamp>\${event.timestamp}</timestamp>
        <userId>\${event.userId || ''}</userId>
        <classification>\${event.classification}</classification>
        <eventType>\${event.eventType}</eventType>
        <resource>\${event.resource}</resource>
        <action>\${event.action}</action>
        <success>\${event.success}</success>
        <ipAddress>\${event.ipAddress}</ipAddress>
        \${event.duration ? \`<duration>\${event.duration}</duration>\` : ''}
      </event>
    \`).join('');

    return \`<?xml version="1.0" encoding="UTF-8"?>
<auditTrail>
  <metadata>
    <exportDate>\${new Date().toISOString()}</exportDate>
    <classification>\${this.config.classification}</classification>
    <eventCount>\${events.length}</eventCount>
  </metadata>
  <events>\${xml}</events>
</auditTrail>\`;
  }
}

// React Hook for Audit Logging
export const useAuditTrail = (config: AuditConfiguration) => {
  const loggerRef = useRef<AuditTrailLogger>();

  useEffect(() => {
    loggerRef.current = AuditTrailLogger.getInstance(config);
  }, [config]);

  const logAuthentication = useCallback((action: string, userId?: string, success: boolean = true, errorMessage?: string) => {
    loggerRef.current?.logEvent('authentication', 'auth_system', action, {}, userId, success, errorMessage);
  }, []);

  const logDataAccess = useCallback((resource: string, recordId: string, userId?: string) => {
    loggerRef.current?.logEvent('data_access', resource, 'read', { recordId }, userId);
  }, []);

  const logDataModification = useCallback((resource: string, recordId: string, changes: Record<string, any>, userId?: string) => {
    loggerRef.current?.logEvent('data_modification', resource, 'update', { recordId, changes }, userId);
  }, []);

  const logDataDeletion = useCallback((resource: string, recordId: string, userId?: string) => {
    loggerRef.current?.logEvent('data_deletion', resource, 'delete', { recordId }, userId);
  }, []);

  const logDataExport = useCallback((resource: string, recordCount: number, format: string, userId?: string) => {
    loggerRef.current?.logEvent('data_export', resource, 'export', { recordCount, format }, userId);
  }, []);

  const logSecurityEvent = useCallback((event: string, details: Record<string, any>, userId?: string) => {
    loggerRef.current?.logEvent('security_event', 'security_system', event, details, userId);
  }, []);

  const logPrivacyEvent = useCallback((event: string, details: Record<string, any>, userId?: string) => {
    loggerRef.current?.logEvent('privacy_event', 'privacy_system', event, details, userId);
  }, []);

  const getAuditTrail = useCallback((filters?: Parameters<AuditTrailLogger['getAuditTrail']>[0]) => {
    return loggerRef.current?.getAuditTrail(filters) || Promise.resolve([]);
  }, []);

  const exportAuditTrail = useCallback((format?: 'json' | 'csv' | 'xml', filters?: any) => {
    return loggerRef.current?.exportAuditTrail(format, filters) || Promise.resolve('[]');
  }, []);

  return {
    logAuthentication,
    logDataAccess,
    logDataModification,
    logDataDeletion,
    logDataExport,
    logSecurityEvent,
    logPrivacyEvent,
    getAuditTrail,
    exportAuditTrail,
  };
};

export default AuditTrailLogger;
`;
  }

  /**
   * Generate audit trail viewer component
   */
  static generateAuditViewer(): string {
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
  Badge,
  Dialog,
  Alert
} from '@xala/ui-system';
import { useNorwegianLocale } from '../compliance/norwegian-localization';
import { useAuditTrail } from './audit-trail-templates';
import type { AuditEvent, NSMClassification } from '../types/norwegian-compliance';

interface AuditViewerProps {
  readonly classification: NSMClassification;
  readonly userClearanceLevel?: string;
  readonly showExportControls?: boolean;
  readonly className?: string;
}

export const AuditViewer = ({
  classification,
  userClearanceLevel = 'PUBLIC',
  showExportControls = false,
  className,
}: AuditViewerProps): JSX.Element => {
  const { t, formatDate, formatNumber } = useNorwegianLocale();
  const { getAuditTrail, exportAuditTrail } = useAuditTrail({ 
    enabled: true, 
    classification,
    retentionPeriod: 'P7Y',
    encryptionRequired: classification !== 'OPEN',
    realTimeAlerting: true,
    exportEnabled: showExportControls,
    anonymizationRequired: classification === 'SECRET'
  });

  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    eventType: '',
    resource: '',
    userId: '',
    success: '',
  });

  // Load audit trail
  useEffect(() => {
    const loadAuditTrail = async () => {
      setLoading(true);
      try {
        const auditEvents = await getAuditTrail(filters);
        setEvents(auditEvents);
      } catch (error) {
        console.error('Failed to load audit trail:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAuditTrail();
  }, [getAuditTrail, filters]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (filters.startDate && event.timestamp < filters.startDate) return false;
      if (filters.endDate && event.timestamp > filters.endDate) return false;
      if (filters.eventType && event.eventType !== filters.eventType) return false;
      if (filters.resource && !event.resource.toLowerCase().includes(filters.resource.toLowerCase())) return false;
      if (filters.userId && event.userId !== filters.userId) return false;
      if (filters.success && event.success.toString() !== filters.success) return false;
      return true;
    });
  }, [events, filters]);

  // Handle export
  const handleExport = async (format: 'json' | 'csv' | 'xml') => {
    try {
      const exportData = await exportAuditTrail(format, filters);
      
      const blob = new Blob([exportData], { 
        type: format === 'json' ? 'application/json' : 
             format === 'csv' ? 'text/csv' : 'text/xml' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = \`audit-trail-\${classification.toLowerCase()}-\${new Date().toISOString().split('T')[0]}.\${format}\`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Get severity badge color
  const getSeverityColor = (event: AuditEvent): 'default' | 'secondary' | 'destructive' => {
    if (!event.success) return 'destructive';
    if (['security_event', 'authentication'].includes(event.eventType)) return 'secondary';
    return 'default';
  };

  // Get event type display name
  const getEventTypeDisplay = (eventType: string): string => {
    const types: Record<string, string> = {
      'authentication': 'Autentisering',
      'authorization': 'Autorisasjon',
      'data_access': 'Datatilgang',
      'data_modification': 'Dataendring',
      'data_deletion': 'Datasletting',
      'data_export': 'Dataeksport',
      'security_event': 'Sikkerhetshendelse',
      'privacy_event': 'Personvernhendelse',
      'system_event': 'Systemhendelse',
    };
    return types[eventType] || eventType;
  };

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <Text>Laster revisjonsspor...</Text>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6">
        <Stack spacing="6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <Text variant="h3" className="text-xl font-semibold">
                Revisjonsspor - {classification}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                {formatNumber(filteredEvents.length, 'decimal')} hendelser
              </Text>
            </div>
            
            {showExportControls && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => handleExport('json')}
                >
                  Eksporter JSON
                </Button>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => handleExport('csv')}
                >
                  Eksporter CSV
                </Button>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => handleExport('xml')}
                >
                  Eksporter XML
                </Button>
              </div>
            )}
          </div>

          {/* Classification Warning */}
          {classification !== 'OPEN' && (
            <Alert variant="info">
              <Text className="text-sm">
                Dette revisjonssporet inneholder {classification}-klassifisert informasjon. 
                All tilgang logges og overvåkes.
              </Text>
            </Alert>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Input
              type="date"
              placeholder="Fra dato"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            />
            <Input
              type="date"
              placeholder="Til dato"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            />
            <Select
              value={filters.eventType}
              onValueChange={(value) => setFilters(prev => ({ ...prev, eventType: value }))}
            >
              <option value="">Alle hendelsestyper</option>
              <option value="authentication">Autentisering</option>
              <option value="data_access">Datatilgang</option>
              <option value="data_modification">Dataendring</option>
              <option value="security_event">Sikkerhetshendelse</option>
            </Select>
            <Input
              placeholder="Ressurs"
              value={filters.resource}
              onChange={(e) => setFilters(prev => ({ ...prev, resource: e.target.value }))}
            />
            <Input
              placeholder="Bruker-ID"
              value={filters.userId}
              onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
            />
            <Select
              value={filters.success}
              onValueChange={(value) => setFilters(prev => ({ ...prev, success: value }))}
            >
              <option value="">Alle resultater</option>
              <option value="true">Vellykkede</option>
              <option value="false">Feilede</option>
            </Select>
          </div>

          {/* Events Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tidspunkt</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Ressurs</TableHead>
                  <TableHead>Handling</TableHead>
                  <TableHead>Bruker</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP-adresse</TableHead>
                  <TableHead>Detaljer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow
                    key={event.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <TableCell>
                      <Text className="text-sm">
                        {formatDate(new Date(event.timestamp), 'datetime')}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSeverityColor(event)}>
                        {getEventTypeDisplay(event.eventType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Text className="text-sm font-mono">
                        {event.resource}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Text className="text-sm">
                        {event.action}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Text className="text-sm">
                        {event.userId || 'Anonym'}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Badge variant={event.success ? 'default' : 'destructive'}>
                        {event.success ? 'Suksess' : 'Feil'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Text className="text-sm font-mono">
                        {event.ipAddress}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="small">
                        Vis
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Text className="text-gray-500">
                Ingen hendelser funnet for gjeldende filtre
              </Text>
            </div>
          )}
        </Stack>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        {selectedEvent && (
          <div className="p-6 max-w-2xl">
            <Stack spacing="4">
              <div className="flex justify-between items-start">
                <div>
                  <Text variant="h3" className="text-lg font-semibold">
                    Hendelsesdetaljer
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {selectedEvent.id}
                  </Text>
                </div>
                <Badge variant={getSeverityColor(selectedEvent)}>
                  {getEventTypeDisplay(selectedEvent.eventType)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Text className="font-medium">Tidspunkt:</Text>
                  <Text>{formatDate(new Date(selectedEvent.timestamp), 'datetime')}</Text>
                </div>
                <div>
                  <Text className="font-medium">Ressurs:</Text>
                  <Text className="font-mono">{selectedEvent.resource}</Text>
                </div>
                <div>
                  <Text className="font-medium">Handling:</Text>
                  <Text>{selectedEvent.action}</Text>
                </div>
                <div>
                  <Text className="font-medium">Bruker-ID:</Text>
                  <Text>{selectedEvent.userId || 'Ikke spesifisert'}</Text>
                </div>
                <div>
                  <Text className="font-medium">Økt-ID:</Text>
                  <Text className="font-mono">{selectedEvent.sessionId}</Text>
                </div>
                <div>
                  <Text className="font-medium">IP-adresse:</Text>
                  <Text className="font-mono">{selectedEvent.ipAddress}</Text>
                </div>
                <div>
                  <Text className="font-medium">Klassifikasjon:</Text>
                  <Badge variant="secondary">{selectedEvent.classification}</Badge>
                </div>
                <div>
                  <Text className="font-medium">Status:</Text>
                  <Badge variant={selectedEvent.success ? 'default' : 'destructive'}>
                    {selectedEvent.success ? 'Suksess' : 'Feil'}
                  </Badge>
                </div>
                {selectedEvent.duration && (
                  <div>
                    <Text className="font-medium">Varighet:</Text>
                    <Text>{selectedEvent.duration}ms</Text>
                  </div>
                )}
                {selectedEvent.location && (
                  <div>
                    <Text className="font-medium">Lokasjon:</Text>
                    <Text className="font-mono">{selectedEvent.location}</Text>
                  </div>
                )}
              </div>

              {selectedEvent.errorMessage && (
                <div>
                  <Text className="font-medium mb-2">Feilmelding:</Text>
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                    <Text className="text-red-800">{selectedEvent.errorMessage}</Text>
                  </div>
                </div>
              )}

              {Object.keys(selectedEvent.details).length > 0 && (
                <div>
                  <Text className="font-medium mb-2">Detaljer:</Text>
                  <div className="p-3 bg-gray-50 border rounded text-sm">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(selectedEvent.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => setSelectedEvent(null)}>
                  Lukk
                </Button>
              </div>
            </Stack>
          </div>
        )}
      </Dialog>
    </Card>
  );
};

export default AuditViewer;
`;
  }
}

export default AuditTrailTemplateService;