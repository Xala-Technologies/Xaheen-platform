import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import * as fs from 'fs-extra';
import * as path from 'path';
import semver from 'semver';
import { z } from 'zod';

const execAsync = promisify(exec);

// Schema for semantic versioning configuration
const VersioningConfigSchema = z.object({
  releaseRules: z.array(z.object({
    type: z.string(),
    release: z.enum(['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease']).optional(),
    scope: z.string().optional(),
  })).default([
    { type: 'feat', release: 'minor' },
    { type: 'fix', release: 'patch' },
    { type: 'perf', release: 'patch' },
    { type: 'refactor', release: 'patch' },
    { type: 'docs', release: 'patch' },
    { type: 'style', release: 'patch' },
    { type: 'test', release: 'patch' },
    { type: 'build', release: 'patch' },
    { type: 'ci', release: 'patch' },
    { type: 'chore', release: 'patch' },
    { type: 'revert', release: 'patch' },
  ]),
  prerelease: z.object({
    enabled: z.boolean().default(false),
    identifier: z.string().default('beta'),
  }).default({}),
  hotfix: z.object({
    enabled: z.boolean().default(true),
    pattern: z.string().default('hotfix/*'),
  }).default({}),
  changelog: z.object({
    enabled: z.boolean().default(true),
    path: z.string().default('CHANGELOG.md'),
    template: z.string().optional(),
  }).default({}),
  git: z.object({
    tagPrefix: z.string().default('v'),
    commitMessage: z.string().default('chore(release): ${nextRelease.version}'),
    pushToRemote: z.boolean().default(true),
  }).default({}),
});

export type VersioningConfig = z.infer<typeof VersioningConfigSchema>;

export interface CommitInfo {
  hash: string;
  type: string;
  scope?: string;
  subject: string;
  body?: string;
  breaking: boolean;
  author: {
    name: string;
    email: string;
    date: string;
  };
}

export interface ReleaseInfo {
  version: string;
  previousVersion: string;
  releaseType: string;
  commits: CommitInfo[];
  breaking: boolean;
  date: string;
}

export class VersioningService {
  private config: VersioningConfig;

  constructor(config?: Partial<VersioningConfig>) {
    this.config = VersioningConfigSchema.parse(config || {});
  }

  /**
   * Analyze git history to determine next version
   */
  async analyzeCommits(from?: string, to: string = 'HEAD'): Promise<CommitInfo[]> {
    try {
      const range = from ? `${from}..${to}` : to;
      const { stdout } = await execAsync(
        `git log ${range} --pretty=format:"%H|%s|%b|%an|%ae|%ad" --date=iso --no-merges`
      );

      if (!stdout.trim()) {
        return [];
      }

      const commits = stdout.trim().split('\n').map(line => {
        const [hash, subject, body, authorName, authorEmail, date] = line.split('|');
        
        // Parse conventional commit format
        const conventionalCommitRegex = /^(\w+)(?:\(([^)]+)\))?: (.+)$/;
        const match = subject.match(conventionalCommitRegex);
        
        const type = match ? match[1] : 'other';
        const scope = match ? match[2] : undefined;
        const cleanSubject = match ? match[3] : subject;
        
        // Check for breaking changes
        const breaking = subject.includes('!') || 
                        (body && body.toLowerCase().includes('breaking change'));

        return {
          hash,
          type,
          scope,
          subject: cleanSubject,
          body: body || undefined,
          breaking,
          author: {
            name: authorName,
            email: authorEmail,
            date: date,
          },
        };
      });

      return commits;
    } catch (error) {
      throw new Error(`Failed to analyze commits: ${error}`);
    }
  }

  /**
   * Determine the next version based on commits
   */
  async determineNextVersion(currentVersion?: string): Promise<ReleaseInfo | null> {
    try {
      // Get current version from package.json or git tags
      if (!currentVersion) {
        currentVersion = await this.getCurrentVersion();
      }

      // Get last release tag
      const lastTag = await this.getLastReleaseTag();
      const commits = await this.analyzeCommits(lastTag);

      if (commits.length === 0) {
        return null; // No commits since last release
      }

      // Determine release type based on commits
      let releaseType: string = 'patch';
      let breaking = false;

      for (const commit of commits) {
        if (commit.breaking) {
          releaseType = 'major';
          breaking = true;
          break;
        }

        const rule = this.config.releaseRules.find(r => 
          r.type === commit.type && 
          (!r.scope || r.scope === commit.scope)
        );

        if (rule && rule.release) {
          if (this.isHigherReleaseType(rule.release, releaseType)) {
            releaseType = rule.release;
          }
        }
      }

      // Handle prerelease
      if (this.config.prerelease.enabled) {
        const isPrerelease = await this.isPrereleaseBranch();
        if (isPrerelease) {
          releaseType = `pre${releaseType}` as any;
        }
      }

      // Calculate next version
      const nextVersion = semver.inc(currentVersion, releaseType as any, this.config.prerelease.identifier);
      
      if (!nextVersion) {
        throw new Error(`Failed to calculate next version from ${currentVersion} with release type ${releaseType}`);
      }

      return {
        version: nextVersion,
        previousVersion: currentVersion,
        releaseType,
        commits,
        breaking,
        date: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to determine next version: ${error}`);
    }
  }

  /**
   * Generate changelog from release information
   */
  async generateChangelog(releaseInfo: ReleaseInfo, existingChangelog?: string): Promise<string> {
    const { version, previousVersion, commits, breaking, date } = releaseInfo;
    
    // Group commits by type
    const groupedCommits = commits.reduce((acc, commit) => {
      const type = commit.type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(commit);
      return acc;
    }, {} as Record<string, CommitInfo[]>);

    // Build changelog entry
    let changelogEntry = `## [${version}](https://github.com/Xala-Technologies/xaheen/compare/v${previousVersion}...v${version}) (${new Date(date).toISOString().split('T')[0]})\n\n`;

    // Breaking changes section
    if (breaking) {
      changelogEntry += '### ⚠ BREAKING CHANGES\n\n';
      const breakingCommits = commits.filter(c => c.breaking);
      for (const commit of breakingCommits) {
        changelogEntry += `* ${commit.scope ? `**${commit.scope}:** ` : ''}${commit.subject} ([${commit.hash.substring(0, 7)}](https://github.com/Xala-Technologies/xaheen/commit/${commit.hash}))\n`;
      }
      changelogEntry += '\n';
    }

    // Features
    if (groupedCommits.feat) {
      changelogEntry += '### Features\n\n';
      for (const commit of groupedCommits.feat) {
        changelogEntry += `* ${commit.scope ? `**${commit.scope}:** ` : ''}${commit.subject} ([${commit.hash.substring(0, 7)}](https://github.com/Xala-Technologies/xaheen/commit/${commit.hash}))\n`;
      }
      changelogEntry += '\n';
    }

    // Bug fixes
    if (groupedCommits.fix) {
      changelogEntry += '### Bug Fixes\n\n';
      for (const commit of groupedCommits.fix) {
        changelogEntry += `* ${commit.scope ? `**${commit.scope}:** ` : ''}${commit.subject} ([${commit.hash.substring(0, 7)}](https://github.com/Xala-Technologies/xaheen/commit/${commit.hash}))\n`;
      }
      changelogEntry += '\n';
    }

    // Performance improvements
    if (groupedCommits.perf) {
      changelogEntry += '### Performance Improvements\n\n';
      for (const commit of groupedCommits.perf) {
        changelogEntry += `* ${commit.scope ? `**${commit.scope}:** ` : ''}${commit.subject} ([${commit.hash.substring(0, 7)}](https://github.com/Xala-Technologies/xaheen/commit/${commit.hash}))\n`;
      }
      changelogEntry += '\n';
    }

    // Code refactoring
    if (groupedCommits.refactor) {
      changelogEntry += '### Code Refactoring\n\n';
      for (const commit of groupedCommits.refactor) {
        changelogEntry += `* ${commit.scope ? `**${commit.scope}:** ` : ''}${commit.subject} ([${commit.hash.substring(0, 7)}](https://github.com/Xala-Technologies/xaheen/commit/${commit.hash}))\n`;
      }
      changelogEntry += '\n';
    }

    // Documentation
    if (groupedCommits.docs) {
      changelogEntry += '### Documentation\n\n';
      for (const commit of groupedCommits.docs) {
        changelogEntry += `* ${commit.scope ? `**${commit.scope}:** ` : ''}${commit.subject} ([${commit.hash.substring(0, 7)}](https://github.com/Xala-Technologies/xaheen/commit/${commit.hash}))\n`;
      }
      changelogEntry += '\n';
    }

    // Build system
    if (groupedCommits.build || groupedCommits.ci) {
      changelogEntry += '### Build System\n\n';
      const buildCommits = [...(groupedCommits.build || []), ...(groupedCommits.ci || [])];
      for (const commit of buildCommits) {
        changelogEntry += `* ${commit.scope ? `**${commit.scope}:** ` : ''}${commit.subject} ([${commit.hash.substring(0, 7)}](https://github.com/Xala-Technologies/xaheen/commit/${commit.hash}))\n`;
      }
      changelogEntry += '\n';
    }

    // Combine with existing changelog
    if (existingChangelog) {
      const changelogLines = existingChangelog.split('\n');
      const headerIndex = changelogLines.findIndex(line => line.startsWith('# '));
      
      if (headerIndex !== -1) {
        const header = changelogLines.slice(0, headerIndex + 1).join('\n');
        const rest = changelogLines.slice(headerIndex + 1).join('\n');
        return `${header}\n\n${changelogEntry}${rest}`;
      } else {
        return `${changelogEntry}\n${existingChangelog}`;
      }
    }

    return `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n${changelogEntry}`;
  }

  /**
   * Create a git tag for the release
   */
  async createReleaseTag(version: string, message?: string): Promise<void> {
    try {
      const tagName = `${this.config.git.tagPrefix}${version}`;
      const tagMessage = message || `Release ${version}`;

      await execAsync(`git tag -a ${tagName} -m "${tagMessage}"`);
      
      if (this.config.git.pushToRemote) {
        await execAsync(`git push origin ${tagName}`);
      }
    } catch (error) {
      throw new Error(`Failed to create release tag: ${error}`);
    }
  }

  /**
   * Update package.json version
   */
  async updatePackageVersion(version: string, packagePath: string = 'package.json'): Promise<void> {
    try {
      const pkg = await fs.readJson(packagePath);
      pkg.version = version;
      await fs.writeJson(packagePath, pkg, { spaces: 2 });
    } catch (error) {
      throw new Error(`Failed to update package version: ${error}`);
    }
  }

  /**
   * Perform complete release process
   */
  async performRelease(options: {
    dryRun?: boolean;
    prerelease?: boolean;
    packagePath?: string;
    changelogPath?: string;
  } = {}): Promise<ReleaseInfo | null> {
    try {
      const { dryRun = false, packagePath = 'package.json', changelogPath } = options;

      // Determine next version
      const releaseInfo = await this.determineNextVersion();
      
      if (!releaseInfo) {
        console.log('No changes detected since last release');
        return null;
      }

      console.log(`Planning release: ${releaseInfo.previousVersion} → ${releaseInfo.version} (${releaseInfo.releaseType})`);

      if (dryRun) {
        console.log('Dry run - no changes will be made');
        return releaseInfo;
      }

      // Update package.json
      await this.updatePackageVersion(releaseInfo.version, packagePath);
      console.log(`Updated ${packagePath} to version ${releaseInfo.version}`);

      // Generate and update changelog
      if (this.config.changelog.enabled) {
        const changelogFile = changelogPath || this.config.changelog.path;
        let existingChangelog = '';
        
        if (await fs.pathExists(changelogFile)) {
          existingChangelog = await fs.readFile(changelogFile, 'utf-8');
        }

        const newChangelog = await this.generateChangelog(releaseInfo, existingChangelog);
        await fs.writeFile(changelogFile, newChangelog);
        console.log(`Updated ${changelogFile}`);
      }

      // Commit changes
      const commitMessage = this.config.git.commitMessage.replace('${nextRelease.version}', releaseInfo.version);
      await execAsync(`git add ${packagePath} ${this.config.changelog.path}`);
      await execAsync(`git commit -m "${commitMessage}"`);

      // Create release tag
      await this.createReleaseTag(releaseInfo.version);
      console.log(`Created release tag v${releaseInfo.version}`);

      // Push changes
      if (this.config.git.pushToRemote) {
        await execAsync('git push origin HEAD');
        console.log('Pushed changes to remote');
      }

      return releaseInfo;
    } catch (error) {
      throw new Error(`Failed to perform release: ${error}`);
    }
  }

  // Private helper methods
  private async getCurrentVersion(): Promise<string> {
    try {
      const pkg = await fs.readJson('package.json');
      return pkg.version || '0.0.0';
    } catch {
      return '0.0.0';
    }
  }

  private async getLastReleaseTag(): Promise<string | undefined> {
    try {
      const { stdout } = await execAsync(`git tag -l "${this.config.git.tagPrefix}*" --sort=-version:refname`);
      const tags = stdout.trim().split('\n').filter(Boolean);
      return tags[0] || undefined;
    } catch {
      return undefined;
    }
  }

  private async isPrereleaseBranch(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('git branch --show-current');
      const currentBranch = stdout.trim();
      return currentBranch !== 'main' && currentBranch !== 'master';
    } catch {
      return false;
    }
  }

  private isHigherReleaseType(newType: string, currentType: string): boolean {
    const hierarchy = ['patch', 'minor', 'major'];
    return hierarchy.indexOf(newType) > hierarchy.indexOf(currentType);
  }
}

// Export default configuration
export const defaultVersioningConfig: VersioningConfig = VersioningConfigSchema.parse({});