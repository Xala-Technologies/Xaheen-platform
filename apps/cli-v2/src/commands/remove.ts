import { Command } from 'commander';
import { consola } from 'consola';

export const removeCommand = new Command('remove')
  .description('Remove a service from project')
  .argument('<service>', 'Service to remove')
  .action(async (service) => {
    consola.info(`Removing ${service} service...`);
    consola.warn('Remove command not yet implemented');
  });