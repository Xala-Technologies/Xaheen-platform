/**
 * Naming Service Implementation
 * Single Responsibility: Handles all naming convention transformations
 */

import type { INamingService, NamingConvention } from '../interfaces/index.js';

export class NamingService implements INamingService {
  public toPascalCase(str: string): string {
    return str
      .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
      .replace(/^(.)/, (char) => char.toUpperCase());
  }

  public toCamelCase(str: string): string {
    return str
      .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
      .replace(/^(.)/, (char) => char.toLowerCase());
  }

  public toKebabCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '-$1')
      .replace(/[-_\s]+/g, '-')
      .toLowerCase()
      .replace(/^-/, '');
  }

  public toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '_$1')
      .replace(/[-\s]+/g, '_')
      .toLowerCase()
      .replace(/^_/, '');
  }

  public toConstantCase(str: string): string {
    return this.toSnakeCase(str).toUpperCase();
  }

  public getNamingConvention(name: string): NamingConvention {
    return {
      className: this.toPascalCase(name),
      fileName: this.toKebabCase(name),
      variableName: this.toCamelCase(name),
      constantName: this.toConstantCase(name),
      kebabCase: this.toKebabCase(name),
      snakeCase: this.toSnakeCase(name),
    };
  }

  public validateName(name: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!name) {
      errors.push('Name is required');
    }

    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(name)) {
      errors.push('Name must be alphanumeric and start with a letter');
    }

    if (name.length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (name.length > 50) {
      errors.push('Name must be less than 50 characters long');
    }

    // Check against reserved words
    const reservedWords = [
      'class', 'function', 'var', 'let', 'const', 'if', 'else', 'for', 'while',
      'do', 'switch', 'case', 'default', 'break', 'continue', 'return',
      'try', 'catch', 'finally', 'throw', 'new', 'this', 'super',
      'import', 'export', 'from', 'as', 'async', 'await'
    ];

    if (reservedWords.includes(name.toLowerCase())) {
      errors.push('Name cannot be a reserved word');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public generateUniqueFileName(baseName: string, existingFiles: string[]): string {
    const naming = this.getNamingConvention(baseName);
    let fileName = naming.fileName;
    let counter = 1;

    while (existingFiles.includes(fileName)) {
      fileName = `${naming.fileName}-${counter}`;
      counter++;
    }

    return fileName;
  }
}