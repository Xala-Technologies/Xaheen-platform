import chalk from 'chalk';
import { CommandMetadata } from './index.js';

export const previewCommand: CommandMetadata = {
  name: 'preview',
  description: 'Preview components and themes',
  action: async () => {
    console.log(chalk.bold('\n👀 Component Preview\n'));
    console.log('Component preview features coming soon!');
    console.log('Use: xala dev for development server with preview');
  }
};