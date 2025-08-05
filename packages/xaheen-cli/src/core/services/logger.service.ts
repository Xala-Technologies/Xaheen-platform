/**
 * Logger Service Implementation
 * Single Responsibility: Handles all logging concerns
 */

import chalk from 'chalk';
import type { ILogger } from '../interfaces/index.js';

export class LoggerService implements ILogger {
  private readonly prefix: string;

  constructor(prefix: string = '') {
    this.prefix = prefix;
  }

  public info(message: string, ...args: any[]): void {
    console.log(`${this.formatPrefix()}[INFO] ${message}`, ...args);
  }

  public success(message: string, ...args: any[]): void {
    console.log(`${this.formatPrefix()}${chalk.green('[SUCCESS]')} ${chalk.green(message)}`, ...args);
  }

  public warn(message: string, ...args: any[]): void {
    console.warn(`${this.formatPrefix()}${chalk.yellow('[WARN]')} ${chalk.yellow(message)}`, ...args);
  }

  public error(message: string, error?: any): void {
    console.error(`${this.formatPrefix()}${chalk.red('[ERROR]')} ${chalk.red(message)}`);
    if (error) {
      console.error(error);
    }
  }

  private formatPrefix(): string {
    return this.prefix ? `${chalk.cyan(`[${this.prefix}]`)} ` : '';
  }
}

export class SilentLogger implements ILogger {
  public info(_message: string, ..._args: any[]): void {
    // No-op for testing
  }

  public success(_message: string, ..._args: any[]): void {
    // No-op for testing
  }

  public warn(_message: string, ..._args: any[]): void {
    // No-op for testing
  }

  public error(_message: string, _error?: any): void {
    // No-op for testing
  }
}