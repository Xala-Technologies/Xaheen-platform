import chalk from 'chalk';
import ora from 'ora';
import { CommandMetadata } from './index.js';
import { logger } from '../utils/logger.js';
import { DevServer, type DevServerConfig } from '../services/dev-server.js';
import { ValidationError } from '../utils/errors.js';

export interface DevOptions {
  readonly port?: number;
  readonly host?: string;
  readonly platform?: string;
  readonly hotReload?: boolean;
  readonly open?: boolean;
  readonly https?: boolean;
  readonly proxy?: string;
  readonly theme?: string;
}

export const devCommand: CommandMetadata = {
  name: 'dev',
  description: 'Start development server with hot-reload',
  options: [
    {
      flags: '--port <port>',
      description: 'Development server port',
      defaultValue: 3001
    },
    {
      flags: '--host <host>',
      description: 'Development server host',
      defaultValue: 'localhost'
    },
    {
      flags: '--platform <platform>',
      description: 'Target platform for development',
      defaultValue: 'react'
    },
    {
      flags: '--hot-reload',
      description: 'Enable hot module replacement',
      defaultValue: true
    },
    {
      flags: '--open',
      description: 'Open browser automatically',
      defaultValue: true  
    },
    {
      flags: '--https',
      description: 'Use HTTPS',
      defaultValue: false
    },
    {
      flags: '--proxy <url>',
      description: 'Proxy API requests to URL'
    },
    {
      flags: '--theme <theme>',
      description: 'Theme to use for development',
      defaultValue: 'base-light'
    }
  ],
  action: async (options: DevOptions = {}) => {
    try {
      logger.info('Starting development server...');
      
      const devServer = new DevServer();
      const spinner = ora('Initializing development environment...').start();
      
      try {
        const serverConfig: DevServerConfig = {
          port: options.port || 3001,
          host: options.host || 'localhost',
          platform: options.platform || 'react',
          hotReload: options.hotReload !== false,
          open: options.open !== false,
          https: options.https || false,
          ...(options.proxy && { proxy: options.proxy }),
          theme: options.theme || 'base-light'
        };
        
        const server = await devServer.start(serverConfig);
        
        spinner.succeed('Development server started');
        
        console.log(chalk.bold('\n🚀 Development Server Running:'));
        console.log(`  Local:    ${chalk.cyan(server.localUrl)}`);
        if (server.networkUrl) {
          console.log(`  Network:  ${chalk.cyan(server.networkUrl)}`);
        }
        console.log(`  Platform: ${chalk.cyan(serverConfig.platform)}`);
        console.log(`  Theme:    ${chalk.cyan(serverConfig.theme)}`);
        
        console.log(chalk.bold('\n⚡ Features:'));
        console.log(`  ${serverConfig.hotReload ? '✅' : '❌'} Hot Module Replacement`);
        console.log(`  ${serverConfig.https ? '✅' : '❌'} HTTPS`);
        console.log(`  ${serverConfig.proxy ? '✅' : '❌'} API Proxy`);
        
        console.log(chalk.bold('\n🛠️  Development Tools:'));
        console.log(`  Component Preview: ${chalk.cyan(server.localUrl + '/preview')}`);
        console.log(`  Theme Switcher:    ${chalk.cyan(server.localUrl + '/themes')}`);
        console.log(`  Design Tokens:     ${chalk.cyan(server.localUrl + '/tokens')}`);
        console.log(`  Documentation:     ${chalk.cyan(server.localUrl + '/docs')}`);
        
        console.log(chalk.bold('\n📝 Quick Commands:'));
        console.log(`  ${chalk.gray('# Generate component')}`);
        console.log(`  xala ai generate "user profile card"`);
        console.log(`  ${chalk.gray('# Switch theme')}`);
        console.log(`  xala themes apply dark-mode`);
        console.log(`  ${chalk.gray('# Analyze performance')}`);
        console.log(`  xala analyze --performance`);
        
        console.log(chalk.dim('\nPress Ctrl+C to stop the server'));
        
        // Keep server running
        process.on('SIGINT', async () => {
          console.log(chalk.yellow('\n\nShutting down development server...'));
          await devServer.stop();
          process.exit(0);
        });
        
        // Keep process alive
        await new Promise(() => {});
        
      } catch (error) {
        spinner.fail('Failed to start development server');
        throw error;
      }
      
    } catch (error) {
      logger.error('Dev command failed:', error);
      throw error;
    }
  }
};