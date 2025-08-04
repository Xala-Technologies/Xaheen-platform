import type { CLICommand } from '../../types/index.js';
import { CLIError } from '../../types/index.js';
import { HelpSystemService } from '../../services/help/help-system.service.js';
import { logger } from '../../utils/logger.js';

export default class HelpDomain {
  private helpSystem: HelpSystemService;

  constructor() {
    this.helpSystem = new HelpSystemService();
  }

  public async show(command: CLICommand): Promise<void> {
    try {
      const topic = command.target || command.options.topic;
      
      if (!topic) {
        // Show general help overview
        this.helpSystem.showGeneralHelp();
        return;
      }

      // Check if it's a command help request (contains colon)
      if (topic.includes(':') || topic.includes(' ')) {
        this.helpSystem.showCommandHelp(topic);
      } else {
        // Try as section first, then as command
        this.helpSystem.showSectionHelp(topic);
      }
      
    } catch (error) {
      throw new CLIError(`Help system failed: ${error}`, 'HELP_FAILED', 'help', 'show');
    }
  }

  public async search(command: CLICommand): Promise<void> {
    try {
      const query = command.target || command.options.query;
      
      if (!query) {
        throw new Error('Search query is required. Usage: xaheen help search <query>');
      }

      this.helpSystem.searchHelp(query);
      
    } catch (error) {
      throw new CLIError(`Help search failed: ${error}`, 'HELP_SEARCH_FAILED', 'help', 'search');
    }
  }

  public async examples(command: CLICommand): Promise<void> {
    try {
      const topic = command.target || 'getting-started';
      this.helpSystem.showSectionHelp(topic);
      
    } catch (error) {
      throw new CLIError(`Help examples failed: ${error}`, 'HELP_EXAMPLES_FAILED', 'help', 'examples');
    }
  }
}