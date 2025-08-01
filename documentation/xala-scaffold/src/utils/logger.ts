import chalk from 'chalk';
import ora, { Ora } from 'ora';
import { createWriteStream, WriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';
import { homedir } from 'os';

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 99,
}

// Logger configuration
interface LoggerConfig {
  level: LogLevel;
  useColors: boolean;
  useTimestamps: boolean;
  logFile?: string;
  silent?: boolean;
}

// Default configuration
const defaultConfig: LoggerConfig = {
  level: LogLevel.INFO,
  useColors: process.stdout.isTTY,
  useTimestamps: false,
  silent: false,
};

// Logger class
class Logger {
  private config: LoggerConfig;
  private fileStream?: WriteStream;
  private spinner?: Ora;
  
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    
    // Set log level from environment
    if (process.env.LOG_LEVEL) {
      this.config.level = LogLevel[process.env.LOG_LEVEL.toUpperCase() as keyof typeof LogLevel] || LogLevel.INFO;
    }
    
    // Set verbose mode
    if (process.argv.includes('--verbose') || process.argv.includes('-v')) {
      this.config.level = LogLevel.DEBUG;
    }
    
    // Set quiet mode
    if (process.argv.includes('--quiet') || process.argv.includes('-q')) {
      this.config.level = LogLevel.ERROR;
    }
    
    // Disable colors if requested
    if (process.argv.includes('--no-color')) {
      this.config.useColors = false;
    }
    
    // Initialize file logging
    this.initFileLogging();
  }
  
  private async initFileLogging(): Promise<void> {
    if (!this.config.logFile && process.env.LOG_FILE) {
      this.config.logFile = process.env.LOG_FILE;
    }
    
    if (this.config.logFile) {
      try {
        const logDir = path.dirname(this.config.logFile);
        await mkdir(logDir, { recursive: true });
        
        this.fileStream = createWriteStream(this.config.logFile, {
          flags: 'a',
          encoding: 'utf-8',
        });
      } catch (error) {
        console.error('Failed to initialize file logging:', error);
      }
    }
  }
  
  private formatMessage(level: string, message: string, ...args: any[]): string {
    const parts: string[] = [];
    
    if (this.config.useTimestamps) {
      parts.push(new Date().toISOString());
    }
    
    parts.push(`[${level}]`);
    parts.push(message);
    
    if (args.length > 0) {
      parts.push(...args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ));
    }
    
    return parts.join(' ');
  }
  
  private log(level: LogLevel, levelName: string, color: typeof chalk, message: string, ...args: any[]): void {
    if (this.config.silent || level < this.config.level) return;
    
    // Stop spinner if active
    if (this.spinner?.isSpinning) {
      this.spinner.stop();
    }
    
    const formattedMessage = this.formatMessage(levelName, message, ...args);
    
    // Console output
    if (this.config.useColors) {
      console.log(color(formattedMessage));
    } else {
      console.log(formattedMessage);
    }
    
    // File output
    if (this.fileStream) {
      this.fileStream.write(formattedMessage + '\n');
    }
    
    // Resume spinner if it was active
    if (this.spinner && level !== LogLevel.ERROR) {
      this.spinner.start();
    }
  }
  
  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, 'DEBUG', chalk.gray, message, ...args);
  }
  
  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, 'INFO', chalk.blue, message, ...args);
  }
  
  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, 'WARN', chalk.yellow, message, ...args);
  }
  
  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, 'ERROR', chalk.red, message, ...args);
  }
  
  success(message: string, ...args: any[]): void {
    if (this.spinner?.isSpinning) {
      this.spinner.succeed(this.config.useColors ? chalk.green(message) : message);
      this.spinner = undefined;
    } else {
      console.log(this.config.useColors ? chalk.green('✓ ' + message) : '✓ ' + message);
    }
  }
  
  fail(message: string, ...args: any[]): void {
    if (this.spinner?.isSpinning) {
      this.spinner.fail(this.config.useColors ? chalk.red(message) : message);
      this.spinner = undefined;
    } else {
      console.log(this.config.useColors ? chalk.red('✗ ' + message) : '✗ ' + message);
    }
  }
  
  // Progress indicators
  startSpinner(text: string): void {
    if (this.config.silent || !process.stdout.isTTY) return;
    
    this.spinner = ora({
      text,
      color: 'cyan',
      spinner: 'dots',
    }).start();
  }
  
  updateSpinner(text: string): void {
    if (this.spinner?.isSpinning) {
      this.spinner.text = text;
    }
  }
  
  stopSpinner(): void {
    if (this.spinner?.isSpinning) {
      this.spinner.stop();
      this.spinner = undefined;
    }
  }
  
  // Progress bar for long operations
  createProgressBar(total: number, format: string = ':bar :percent :etas'): any {
    // TODO: Implement progress bar using cli-progress
    // For now, return a simple counter
    let current = 0;
    return {
      tick: (amount = 1) => {
        current += amount;
        if (current % 10 === 0 || current === total) {
          this.info(`Progress: ${current}/${total} (${Math.round((current / total) * 100)}%)`);
        }
      },
      update: (value: number) => {
        current = value;
        this.info(`Progress: ${current}/${total} (${Math.round((current / total) * 100)}%)`);
      },
    };
  }
  
  // Table output
  table(headers: string[], rows: string[][]): void {
    if (this.config.silent) return;
    
    // Calculate column widths
    const widths = headers.map((header, i) => {
      const columnValues = [header, ...rows.map(row => row[i] || '')];
      return Math.max(...columnValues.map(val => val.length));
    });
    
    // Print headers
    const headerRow = headers.map((header, i) => header.padEnd(widths[i])).join(' | ');
    console.log(chalk.bold(headerRow));
    console.log(widths.map(w => '-'.repeat(w)).join('-+-'));
    
    // Print rows
    rows.forEach(row => {
      const rowStr = row.map((cell, i) => (cell || '').padEnd(widths[i])).join(' | ');
      console.log(rowStr);
    });
  }
  
  // Structured logging for machine parsing
  structured(event: string, data: Record<string, any>): void {
    const entry = {
      timestamp: new Date().toISOString(),
      event,
      ...data,
    };
    
    if (this.fileStream) {
      this.fileStream.write(JSON.stringify(entry) + '\n');
    }
    
    if (this.config.level === LogLevel.DEBUG) {
      console.log(chalk.gray(`[STRUCTURED] ${JSON.stringify(entry)}`));
    }
  }
  
  // Cleanup
  async close(): Promise<void> {
    if (this.spinner?.isSpinning) {
      this.spinner.stop();
    }
    
    if (this.fileStream) {
      return new Promise((resolve) => {
        this.fileStream!.end(() => resolve());
      });
    }
  }
}

// Create default logger instance
export const logger = new Logger();

// Export Logger class for custom instances
export { Logger };

// Convenience methods
export const debug = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
export const success = logger.success.bind(logger);
export const fail = logger.fail.bind(logger);