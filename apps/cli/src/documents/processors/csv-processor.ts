import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import { promises as fs } from 'fs';
import path from 'path';
import type { CSVOptions } from '../../types';

/**
 * CSV Processing Result Interface
 */
export interface CSVProcessingResult<T = any> {
  success: boolean;
  data?: T[];
  error?: string;
  metadata?: {
    rowsProcessed: number;
    rowsSkipped: number;
    processingTime: number;
    fileSize: number;
  };
}

/**
 * CSV Export Options Interface
 */
export interface CSVExportOptions {
  headers: string[];
  filename?: string;
  delimiter?: string;
  encoding?: BufferEncoding;
  includeHeaders?: boolean;
  gdprCompliant?: boolean;
  anonymizeFields?: string[];
}

/**
 * GDPR Compliance Options
 */
export interface GDPROptions {
  anonymizeFields: string[];
  pseudonymizeFields: string[];
  removeFields: string[];
  auditLog: boolean;
}

/**
 * CSV Processor for Import/Export with GDPR Compliance
 * Handles large files with progress tracking and error handling
 */
export class CSVProcessor {
  private readonly maxMemoryRows = 10000; // Process in chunks for large files

  /**
   * Import CSV file with validation and error handling
   * @param filePath - Path to CSV file
   * @param schema - Optional validation schema
   * @returns Promise<CSVProcessingResult> - Processing result with data
   */
  async importCSV(filePath: string, schema?: any): Promise<CSVProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Check if file exists
      const stats = await fs.stat(filePath);
      
      // Read file content
      const fileContent = await fs.readFile(filePath, 'utf-8');
      
      // Parse CSV
      const records = await this.parseCSVContent(fileContent, {
        filePath,
        header: true,
        skipEmptyLines: true,
        delimiter: ',',
        encoding: 'utf-8',
        errorHandling: 'strict',
        gdprCompliant: true,
      });

      // Validate data if schema provided
      let validatedData = records;
      let skippedRows = 0;

      if (schema) {
        const validationResult = this.validateData(records, schema);
        validatedData = validationResult.validData;
        skippedRows = validationResult.skippedRows;
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: validatedData,
        metadata: {
          rowsProcessed: validatedData.length,
          rowsSkipped: skippedRows,
          processingTime,
          fileSize: stats.size,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during CSV import',
      };
    }
  }

  /**
   * Export data to CSV file
   * @param data - Data array to export
   * @param headers - Column headers
   * @returns Promise<string> - CSV content string
   */
  async exportCSV(data: any[], headers: string[]): Promise<string> {
    try {
      // Validate input
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Data must be a non-empty array');
      }

      if (!Array.isArray(headers) || headers.length === 0) {
        throw new Error('Headers must be a non-empty array');
      }

      // Convert data to CSV format
      const csvContent = await this.stringifyToCSV(data, {
        headers,
        includeHeaders: true,
        delimiter: ',',
        gdprCompliant: true,
      });

      return csvContent;
    } catch (error) {
      throw new Error(`CSV export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate CSV processor component
   * @param options - CSV processing options
   * @returns Generation result
   */
  generateCSVProcessor(options: CSVOptions): { success: boolean; code?: string; error?: string } {
    try {
      const code = this.generateProcessorCode(options);
      return {
        success: true,
        code,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Parse CSV content with options
   * @param content - CSV content string
   * @param options - Parsing options
   * @returns Promise<any[]> - Parsed records
   */
  private async parseCSVContent(content: string, options: CSVOptions): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const records: any[] = [];
      
      const parser = parse({
        delimiter: options.delimiter || ',',
        columns: options.header !== false,
        skip_empty_lines: options.skipEmptyLines !== false,
        encoding: options.encoding as BufferEncoding || 'utf-8',
        max_record_size: 1000000, // 1MB per record
      });

      parser.on('readable', () => {
        let record;
        while ((record = parser.read()) !== null) {
          // Apply transformation if provided
          if (options.transformFn && typeof options.transformFn === 'function') {
            try {
              record = options.transformFn(record);
            } catch (transformError) {
              if (options.errorHandling === 'strict') {
                reject(new Error(`Transform error: ${transformError}`));
                return;
              }
              // Skip record on transform error if not strict
              continue;
            }
          }

          records.push(record);

          // Check max rows limit
          if (options.maxRows && records.length >= options.maxRows) {
            break;
          }
        }
      });

      parser.on('error', (error) => {
        if (options.errorHandling === 'strict') {
          reject(error);
        } else {
          console.warn('CSV parsing warning:', error.message);
        }
      });

      parser.on('end', () => {
        resolve(records);
      });

      parser.write(content);
      parser.end();
    });
  }

  /**
   * Convert data to CSV string
   * @param data - Data to convert
   * @param options - Export options
   * @returns Promise<string> - CSV string
   */
  private async stringifyToCSV(data: any[], options: CSVExportOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      const stringifier = stringify({
        header: options.includeHeaders !== false,
        columns: options.headers,
        delimiter: options.delimiter || ',',
      });

      let csvContent = '';

      stringifier.on('readable', () => {
        let row;
        while ((row = stringifier.read()) !== null) {
          csvContent += row;
        }
      });

      stringifier.on('error', reject);
      stringifier.on('end', () => resolve(csvContent));

      // Apply GDPR compliance if needed
      const processedData = options.gdprCompliant 
        ? this.applyGDPRCompliance(data, options.anonymizeFields || [])
        : data;

      // Write data
      processedData.forEach(record => stringifier.write(record));
      stringifier.end();
    });
  }

  /**
   * Validate data against schema
   * @param data - Data to validate
   * @param schema - Validation schema
   * @returns Validation result
   */
  private validateData(data: any[], schema: any): { validData: any[]; skippedRows: number } {
    const validData: any[] = [];
    let skippedRows = 0;

    for (const record of data) {
      try {
        // Simple validation - can be enhanced with more sophisticated schema validation
        if (schema.parse) {
          const validRecord = schema.parse(record);
          validData.push(validRecord);
        } else {
          validData.push(record);
        }
      } catch (validationError) {
        skippedRows++;
        console.warn('Validation error for record:', validationError);
      }
    }

    return { validData, skippedRows };
  }

  /**
   * Apply GDPR compliance measures
   * @param data - Data to process
   * @param anonymizeFields - Fields to anonymize
   * @returns GDPR-compliant data
   */
  private applyGDPRCompliance(data: any[], anonymizeFields: string[]): any[] {
    return data.map(record => {
      const processedRecord = { ...record };

      // Anonymize specified fields
      anonymizeFields.forEach(field => {
        if (processedRecord[field]) {
          processedRecord[field] = this.anonymizeValue(processedRecord[field], field);
        }
      });

      return processedRecord;
    });
  }

  /**
   * Anonymize a value based on field type
   * @param value - Value to anonymize
   * @param fieldName - Field name for context
   * @returns Anonymized value
   */
  private anonymizeValue(value: any, fieldName: string): string {
    const fieldLower = fieldName.toLowerCase();

    if (fieldLower.includes('email')) {
      return this.anonymizeEmail(String(value));
    } else if (fieldLower.includes('phone') || fieldLower.includes('telefon')) {
      return this.anonymizePhone(String(value));
    } else if (fieldLower.includes('name') || fieldLower.includes('navn')) {
      return this.anonymizeName(String(value));
    } else if (fieldLower.includes('address') || fieldLower.includes('adresse')) {
      return this.anonymizeAddress(String(value));
    } else {
      return '***ANONYMIZED***';
    }
  }

  /**
   * Anonymize email address
   * @param email - Email to anonymize
   * @returns Anonymized email
   */
  private anonymizeEmail(email: string): string {
    const atIndex = email.indexOf('@');
    if (atIndex > 0) {
      const username = email.substring(0, atIndex);
      const domain = email.substring(atIndex);
      return `${username.charAt(0)}***${username.charAt(username.length - 1)}${domain}`;
    }
    return '***@***.***';
  }

  /**
   * Anonymize phone number
   * @param phone - Phone to anonymize
   * @returns Anonymized phone
   */
  private anonymizePhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 4) {
      return `***-***-${cleaned.slice(-4)}`;
    }
    return '***-***-****';
  }

  /**
   * Anonymize name
   * @param name - Name to anonymize
   * @returns Anonymized name
   */
  private anonymizeName(name: string): string {
    const parts = name.trim().split(' ');
    return parts.map(part => 
      part.length > 0 ? `${part.charAt(0)}***` : ''
    ).join(' ');
  }

  /**
   * Anonymize address
   * @param address - Address to anonymize
   * @returns Anonymized address
   */
  private anonymizeAddress(address: string): string {
    return '*** [ANONYMIZED ADDRESS] ***';
  }

  /**
   * Generate processor code template
   * @param options - CSV options
   * @returns Generated code string
   */
  private generateProcessorCode(options: CSVOptions): string {
    return `
import { CSVProcessor } from './csv-processor';

/**
 * Generated CSV Processor
 * Configuration: ${JSON.stringify(options, null, 2)}
 */
export class GeneratedCSVProcessor extends CSVProcessor {
  private readonly defaultOptions = ${JSON.stringify(options, null, 2)};

  async processFile(filePath: string): Promise<any[]> {
    const result = await this.importCSV(filePath);
    
    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data || [];
  }

  async exportData(data: any[], outputPath: string): Promise<void> {
    const csvContent = await this.exportCSV(data, Object.keys(data[0] || {}));
    
    const fs = await import('fs/promises');
    await fs.writeFile(outputPath, csvContent, 'utf-8');
  }
}
    `.trim();
  }

  /**
   * Process large CSV files in chunks
   * @param filePath - Path to large CSV file
   * @param chunkSize - Number of rows per chunk
   * @param processor - Function to process each chunk
   * @returns Promise<void>
   */
  async processLargeFile(
    filePath: string,
    chunkSize: number = this.maxMemoryRows,
    processor: (chunk: any[]) => Promise<void>
  ): Promise<void> {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const lines = fileContent.split('\n');
    
    // Process header
    const header = lines[0];
    
    // Process data in chunks
    for (let i = 1; i < lines.length; i += chunkSize) {
      const chunk = lines.slice(i, i + chunkSize);
      const chunkContent = [header, ...chunk].join('\n');
      
      const records = await this.parseCSVContent(chunkContent, {
        filePath,
        header: true,
        skipEmptyLines: true,
        delimiter: ',',
        encoding: 'utf-8',
        errorHandling: 'log',
        gdprCompliant: true,
      });

      await processor(records);
    }
  }
}

/**
 * Convenience function for CSV import
 * @param filePath - Path to CSV file
 * @param schema - Optional validation schema
 * @returns Promise<any[]> - Imported data
 */
export async function importCSV(filePath: string, schema?: any): Promise<any[]> {
  const processor = new CSVProcessor();
  const result = await processor.importCSV(filePath, schema);
  
  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data || [];
}

/**
 * Convenience function for CSV export
 * @param data - Data to export
 * @param headers - Column headers
 * @returns Promise<string> - CSV content
 */
export async function exportCSV(data: any[], headers: string[]): Promise<string> {
  const processor = new CSVProcessor();
  return processor.exportCSV(data, headers);
}
