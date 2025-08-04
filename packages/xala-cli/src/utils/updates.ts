import chalk from 'chalk';
import semver from 'semver';
import { logger } from './logger.js';

export interface UpdateInfo {
  readonly current: string;
  readonly latest: string;
  readonly isOutdated: boolean;
  readonly updateCommand: string;
}

export async function checkForUpdates(currentVersion: string): Promise<UpdateInfo | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('https://registry.npmjs.org/@xala-technologies/xala-cli/latest', {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json() as { version: string };
    const latestVersion = data.version;
    
    const isOutdated = semver.lt(currentVersion, latestVersion);
    
    const updateInfo: UpdateInfo = {
      current: currentVersion,
      latest: latestVersion,
      isOutdated,
      updateCommand: 'npm install -g @xala-technologies/xala-cli@latest'
    };
    
    if (isOutdated) {
      displayUpdateNotification(updateInfo);
    }
    
    return updateInfo;
  } catch (error) {
    logger.debug('Failed to check for updates:', error);
    return null;
  }
}

function displayUpdateNotification(updateInfo: UpdateInfo): void {
  console.log('\n' + chalk.yellow('┌─────────────────────────────────────────────────┐'));
  console.log(chalk.yellow('│') + '  ' + chalk.bold('Update available!') + '                       ' + chalk.yellow('│'));
  console.log(chalk.yellow('│') + '                                                 ' + chalk.yellow('│'));
  console.log(chalk.yellow('│') + '  ' + chalk.dim(`Current: ${updateInfo.current}`) + '                         ' + chalk.yellow('│'));
  console.log(chalk.yellow('│') + '  ' + chalk.green(`Latest:  ${updateInfo.latest}`) + '                         ' + chalk.yellow('│'));
  console.log(chalk.yellow('│') + '                                                 ' + chalk.yellow('│'));
  console.log(chalk.yellow('│') + '  ' + chalk.cyan(updateInfo.updateCommand) + ' ' + chalk.yellow('│'));
  console.log(chalk.yellow('└─────────────────────────────────────────────────┘'));
  console.log();
}