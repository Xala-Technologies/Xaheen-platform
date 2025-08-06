/**
 * Registry Route Registrar
 * Registers registry-related routes and command mappings
 */

import type { CommandRoute } from "../../../types/index";
import { RegistryCommandHandler } from "../handlers/RegistryCommandHandler";

export class RegistryRouteRegistrar {
  private handler = new RegistryCommandHandler();

  public getRoutes(): CommandRoute[] {
    return [
      {
        pattern: 'registry add <components...>',
        domain: 'registry',
        action: 'add',
        handler: this.handler.handleAdd.bind(this.handler),
        description: 'Add components from the registry',
        options: [
          {
            flags: '-p, --path <path>',
            description: 'Installation path (default: src/components)',
          },
          {
            flags: '--npm',
            description: 'Use npm for dependency installation',
          },
          {
            flags: '--yarn',
            description: 'Use yarn for dependency installation',
          },
          {
            flags: '--pnpm',
            description: 'Use pnpm for dependency installation',
          },
          {
            flags: '--no-deps',
            description: 'Skip dependency installation',
          },
          {
            flags: '--overwrite',
            description: 'Overwrite existing files',
          },
          {
            flags: '--platform <platform>',
            description: 'Target platform (react, nextjs, vue, etc.)',
          },
          {
            flags: '--local <path>',
            description: 'Use local registry path',
          },
          {
            flags: '--url <url>',
            description: 'Use custom registry URL',
          },
        ],
      },
      {
        pattern: 'registry list',
        domain: 'registry',
        action: 'list',
        handler: this.handler.handleList.bind(this.handler),
        description: 'List available registry items',
        options: [
          {
            flags: '--category <category>',
            description: 'Filter by category',
          },
          {
            flags: '--platform <platform>',
            description: 'Filter by platform',
          },
          {
            flags: '--nsm <classification>',
            description: 'Filter by NSM classification',
          },
          {
            flags: '--local <path>',
            description: 'Use local registry path',
          },
          {
            flags: '--url <url>',
            description: 'Use custom registry URL',
          },
        ],
      },
      {
        pattern: 'registry info <component>',
        domain: 'registry',
        action: 'info',
        handler: this.handler.handleInfo.bind(this.handler),
        description: 'Show information about a registry item',
        options: [
          {
            flags: '--local <path>',
            description: 'Use local registry path',
          },
          {
            flags: '--url <url>',
            description: 'Use custom registry URL',
          },
        ],
      },
      {
        pattern: 'registry search <query>',
        domain: 'registry',
        action: 'search',
        handler: this.handler.handleSearch.bind(this.handler),
        description: 'Search registry items',
        options: [
          {
            flags: '--local <path>',
            description: 'Use local registry path',
          },
          {
            flags: '--url <url>',
            description: 'Use custom registry URL',
          },
        ],
      },
      {
        pattern: 'registry build',
        domain: 'registry',
        action: 'build',
        handler: this.handler.handleBuild.bind(this.handler),
        description: 'Build the local registry',
      },
      {
        pattern: 'registry serve',
        domain: 'registry',
        action: 'serve',
        handler: this.handler.handleServe.bind(this.handler),
        description: 'Serve the local registry',
        options: [
          {
            flags: '--port <port>',
            description: 'Port to serve on (default: 3333)',
          },
          {
            flags: '--host <host>',
            description: 'Host to bind to (default: localhost)',
          },
        ],
      },
    ];
  }
}