import { Command } from 'commander';
import { consola } from 'consola';

export const validateCommand = new Command('validate')
  .description('Validate project configuration')
  .action(async () => {
    consola.info('Validating project...');
    consola.warn('Validate command not yet implemented');
  });