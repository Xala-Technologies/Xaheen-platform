import chalk from 'chalk';
import { CommandMetadata } from './index.js';

export const componentsCommand: CommandMetadata = {
  name: 'components',
  description: 'Component management and validation',
  action: async () => {
    console.log(chalk.bold('\n🧩 Component Management\n'));
    console.log('Component management features coming soon!');
    console.log('Use: xala create component <name> for now');
  }
};