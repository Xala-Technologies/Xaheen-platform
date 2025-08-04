import chalk from 'chalk';
import { CommandMetadata } from './index.js';

export const deployCommand: CommandMetadata = {
  name: 'deploy',
  description: 'Deploy to target environments',
  action: async () => {
    console.log(chalk.bold('\n🚀 Deployment\n'));
    console.log('Deployment features coming soon!');
    console.log('Use: xala build <platform> --optimize for now');
  }
};