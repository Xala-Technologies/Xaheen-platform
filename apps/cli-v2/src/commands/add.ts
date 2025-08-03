import { Command } from 'commander';
import { consola } from 'consola';

export const addCommand = new Command('add')
  .description('Add a service to existing project')
  .argument('<service>', 'Service to add (auth, payments, etc.)')
  .option('-p, --provider <provider>', 'Service provider')
  .action(async (service, options) => {
    consola.info(`Adding ${service} service...`);
    consola.warn('Add command not yet implemented');
  });