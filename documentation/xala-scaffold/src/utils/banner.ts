import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import path from 'path';
import { getVersion, getDescription } from './package.js';

// Banner options
interface BannerOptions {
  showVersion?: boolean;
  showDescription?: boolean;
  gradient?: boolean;
  font?: figlet.Fonts;
}

// Display banner
export async function displayBanner(options: BannerOptions = {}): Promise<void> {
  const {
    showVersion = true,
    showDescription = true,
    gradient: useGradient = true,
    font = 'Standard',
  } = options;
  
  try {
    // Generate ASCII art
    const ascii = figlet.textSync('Xala Scaffold', {
      font,
      horizontalLayout: 'default',
      verticalLayout: 'default',
    });
    
    // Apply gradient if enabled
    if (useGradient && process.stdout.isTTY) {
      console.log(gradient.pastel.multiline(ascii));
    } else {
      console.log(chalk.cyan(ascii));
    }
    
    console.log(); // Empty line
    
    // Show version
    if (showVersion) {
      const version = await getVersion();
      console.log(
        chalk.gray('Version:'),
        chalk.bold.white(version)
      );
    }
    
    // Show description
    if (showDescription) {
      const description = await getDescription();
      console.log(
        chalk.gray('Description:'),
        chalk.white(description)
      );
    }
    
    console.log(); // Empty line
    
  } catch (error) {
    // Fallback to simple banner if figlet fails
    console.log(chalk.cyan.bold('\n███ Xala Scaffold ███\n'));
    
    if (showVersion) {
      const version = await getVersion();
      console.log(chalk.gray(`Version: ${version}`));
    }
    
    if (showDescription) {
      console.log(chalk.gray('Enterprise-grade frontend scaffolding\n'));
    }
  }
}

// Display minimal banner
export async function displayMinimalBanner(): Promise<void> {
  const version = await getVersion();
  console.log(
    chalk.cyan('▶'),
    chalk.bold('Xala Scaffold'),
    chalk.gray(`v${version}`)
  );
}

// Display success banner
export function displaySuccessBanner(message: string): void {
  console.log();
  console.log(
    chalk.green.bold('✓ Success!'),
    chalk.white(message)
  );
  console.log();
}

// Display error banner
export function displayErrorBanner(message: string): void {
  console.log();
  console.log(
    chalk.red.bold('✗ Error!'),
    chalk.white(message)
  );
  console.log();
}

// Display section banner
export function displaySectionBanner(title: string): void {
  const width = 50;
  const padding = Math.floor((width - title.length - 2) / 2);
  const line = '─'.repeat(width);
  
  console.log();
  console.log(chalk.gray(line));
  console.log(
    chalk.gray('│') +
    ' '.repeat(padding) +
    chalk.bold.white(title) +
    ' '.repeat(width - padding - title.length - 2) +
    chalk.gray('│')
  );
  console.log(chalk.gray(line));
  console.log();
}

// Display completion banner
export function displayCompletionBanner(projectName: string, projectPath: string): void {
  console.log();
  console.log(chalk.green.bold('███ Project Created Successfully! ███'));
  console.log();
  console.log(chalk.white('Project Name:'), chalk.cyan(projectName));
  console.log(chalk.white('Location:'), chalk.cyan(projectPath));
  console.log();
  console.log(chalk.gray('Next steps:'));
  console.log(chalk.white(`  cd ${path.relative(process.cwd(), projectPath) || projectName}`));
  console.log(chalk.white('  npm install'));
  console.log(chalk.white('  npm run dev'));
  console.log();
  console.log(chalk.gray('Happy coding! 🚀'));
  console.log();
}

// Display welcome message for interactive mode
export async function displayWelcome(): Promise<void> {
  await displayBanner();
  
  console.log(chalk.gray('Welcome to the Xala Scaffold CLI!'));
  console.log(chalk.gray('This tool helps you scaffold enterprise-grade frontend projects.'));
  console.log();
  console.log(chalk.yellow('Features:'));
  console.log(chalk.white('  • Norwegian compliance (NSM, GDPR, WCAG AAA)'));
  console.log(chalk.white('  • Multi-language support with RTL'));
  console.log(chalk.white('  • Enterprise design tokens'));
  console.log(chalk.white('  • SOLID principles enforcement'));
  console.log(chalk.white('  • AI-powered code generation'));
  console.log();
}

// Display goodbye message
export function displayGoodbye(): void {
  console.log();
  console.log(chalk.gray('Thank you for using Xala Scaffold!'));
  console.log(chalk.gray('For more information, visit: https://xala.no'));
  console.log();
}

// Progress indicator for long operations
export function displayProgress(current: number, total: number, message: string): void {
  const percentage = Math.round((current / total) * 100);
  const barLength = 30;
  const filledLength = Math.round((percentage / 100) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(
    `${chalk.cyan(bar)} ${chalk.white(percentage + '%')} ${chalk.gray(message)}`
  );
  
  if (current === total) {
    process.stdout.write('\n');
  }
}