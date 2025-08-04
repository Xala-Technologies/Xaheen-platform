import chalk from 'chalk';
import boxen from 'boxen';

export async function displayBanner(): Promise<void> {
  const banner = chalk.bold.cyan(`
  ██╗  ██╗ █████╗ ██╗      █████╗ 
  ╚██╗██╔╝██╔══██╗██║     ██╔══██╗
   ╚███╔╝ ███████║██║     ███████║
   ██╔██╗ ██╔══██║██║     ██╔══██║
  ██╔╝ ██╗██║  ██║███████╗██║  ██║
  ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
  
  ${chalk.white('Universal Design System CLI')}
  ${chalk.gray('Enterprise-grade, AI-powered, multi-platform')}
  `);

  const boxedBanner = boxen(banner, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
    backgroundColor: 'black'
  });

  console.log(boxedBanner);
  
  console.log(chalk.dim('Build beautiful, accessible, compliant applications across all platforms\n'));
}