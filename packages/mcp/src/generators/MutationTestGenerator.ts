/**
 * Mutation Testing Generator for Xala UI System
 * Generates mutation testing configurations using Stryker and PIT
 * Part of EPIC 8 Story 8.5: Advanced Testing Automation
 */

export interface MutationTestConfig {
	readonly projectName: string;
	readonly framework: "jest" | "vitest" | "mocha";
	readonly testRunner: "jest" | "vitest" | "mocha" | "karma";
	readonly mutationFramework: "stryker" | "pit" | "mutmut";
	readonly sourceFiles: readonly string[];
	readonly testFiles: readonly string[];
	readonly mutators: readonly MutatorConfig[];
	readonly thresholds: MutationThresholds;
	readonly reporting: MutationReporting;
	readonly performance: MutationPerformance;
	readonly plugins: readonly string[];
	readonly ignore: readonly string[];
	readonly tempDirName?: string;
	readonly concurrency?: number;
	readonly timeoutMS?: number;
	readonly timeoutFactor?: number;
	readonly dryRunTimeoutMinutes?: number;
	readonly maxTestRunnerReuse?: number;
}

export interface MutatorConfig {
	readonly name: string;
	readonly enabled: boolean;
	readonly options?: Record<string, any>;
}

export interface MutationThresholds {
	readonly high: number;
	readonly low: number;
	readonly break?: number;
}

export interface MutationReporting {
	readonly reporters: readonly MutationReporter[];
	readonly outputDir: string;
	readonly clearTextEnabled?: boolean;
	readonly progress?: boolean;
	readonly allowConsoleColors?: boolean;
}

export interface MutationReporter {
	readonly name: string;
	readonly options?: Record<string, any>;
}

export interface MutationPerformance {
	readonly checkers: readonly string[];
	readonly buildCommand?: string;
	readonly checkCommand?: string;
}

export class MutationTestGenerator {
	/**
	 * Generate Stryker mutation testing configuration
	 */
	public async generateStrykerConfig(
		config: MutationTestConfig,
	): Promise<string> {
		const strykerConfig = {
			$schema:
				"./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
			_comment: `Generated Stryker configuration for ${config.projectName}`,
			packageManager: "npm",
			reporters: config.reporting.reporters.map((r) => r.name),
			testRunner: config.testRunner,
			testRunnerNodeArgs: ["--max_old_space_size=4096"],
			coverageAnalysis: "perTest",
			mutate: config.sourceFiles,
			tempDirName: config.tempDirName || "stryker-tmp",
			concurrency: config.concurrency || 4,
			concurrency_comment:
				"Recommended to use about half of your available cores",
			timeoutMS: config.timeoutMS || 60000,
			timeoutFactor: config.timeoutFactor || 1.5,
			dryRunTimeoutMinutes: config.dryRunTimeoutMinutes || 5,
			maxTestRunnerReuse: config.maxTestRunnerReuse || 0,

			// Mutator configuration
			mutator: {
				plugins: config.mutators.filter((m) => m.enabled).map((m) => m.name),
				excludedMutations: config.mutators
					.filter((m) => !m.enabled)
					.map((m) => m.name),
			},

			// Test framework specific config
			...(config.framework === "jest" && {
				jest: {
					projectType: "custom",
					configFile: "jest.config.js",
					enableFindRelatedTests: true,
				},
			}),

			...(config.framework === "vitest" && {
				vitest: {
					configFile: "vitest.config.ts",
				},
			}),

			// Thresholds
			thresholds: config.thresholds,

			// File patterns to ignore
			ignoredPatterns: [
				...config.ignore,
				"**/*.spec.ts",
				"**/*.test.ts",
				"**/*.spec.tsx",
				"**/*.test.tsx",
				"**/node_modules/**",
				"**/dist/**",
				"**/build/**",
				"**/.next/**",
				"**/coverage/**",
				"**/stryker-tmp/**",
				"**/__tests__/**",
				"**/*.d.ts",
			],

			// Plugin configuration
			plugins: [
				"@stryker-mutator/core",
				`@stryker-mutator/${config.testRunner}-runner`,
				"@stryker-mutator/typescript-checker",
				...config.plugins,
			],

			// TypeScript configuration
			tsconfigFile: "tsconfig.json",
			checkers: config.performance.checkers,
			buildCommand: config.performance.buildCommand,
			checkCommand: config.performance.checkCommand,

			// Logging
			logLevel: "info",
			fileLogLevel: "debug",
			allowConsoleColors: config.reporting.allowConsoleColors ?? true,

			// Dashboard reporter (optional)
			...(config.reporting.reporters.some((r) => r.name === "dashboard") && {
				dashboard: {
					project: `github.com/${config.projectName}`,
					version: "main",
					module: config.projectName,
				},
			}),

			// HTML reporter configuration
			htmlReporter: {
				baseDir: `${config.reporting.outputDir}/html`,
			},

			// JSON reporter configuration
			jsonReporter: {
				fileName: `${config.reporting.outputDir}/mutation-report.json`,
			},

			// Clear text reporter configuration
			clearTextReporter: {
				allowColor: true,
				allowEmojis: true,
				maxReportedSchemaErrors: 3,
			},

			// Progress reporter configuration
			progressReporter: {
				allowColor: true,
			},
		};

		return `// Stryker Mutation Testing Configuration
// Generated for ${config.projectName}
// Framework: ${config.framework}, Test Runner: ${config.testRunner}

/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
module.exports = ${JSON.stringify(strykerConfig, null, 2)};`;
	}

	/**
	 * Generate mutation testing npm scripts
	 */
	public generateMutationScripts(
		config: MutationTestConfig,
	): Record<string, string> {
		const baseScripts = {
			"test:mutation": "stryker run",
			"test:mutation:ci": "stryker run --concurrency 2 --timeoutMS 120000",
			"test:mutation:fast":
				"stryker run --mutate src/**/*.ts --ignore src/**/*.spec.ts --concurrency 8",
			"test:mutation:incremental": "stryker run --incremental",
			"test:mutation:dry-run": "stryker run --dryRun",
			"test:mutation:debug":
				"stryker run --logLevel trace --fileLogLevel trace",
		};

		// Add framework-specific scripts
		if (config.framework === "jest") {
			return {
				...baseScripts,
				"test:mutation:unit": "stryker run --mutate src/components/**/*.ts",
				"test:mutation:integration":
					"stryker run --mutate src/services/**/*.ts",
			};
		}

		if (config.framework === "vitest") {
			return {
				...baseScripts,
				"test:mutation:watch": "stryker run --watch",
				"test:mutation:ui": "stryker run --reporter html,dashboard",
			};
		}

		return baseScripts;
	}

	/**
	 * Generate mutation testing GitHub Actions workflow
	 */
	public generateMutationTestWorkflow(config: MutationTestConfig): string {
		return `name: Mutation Testing

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    # Run mutation tests weekly (expensive operation)
    - cron: '0 2 * * 0'

jobs:
  mutation-testing:
    runs-on: ubuntu-latest
    timeout-minutes: 60

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run unit tests (prerequisite)
      run: npm run test

    - name: Run mutation tests
      run: npm run test:mutation:ci
      env:
        STRYKER_DASHBOARD_API_KEY: \${{ secrets.STRYKER_DASHBOARD_API_KEY }}

    - name: Upload mutation report
      uses: actions/upload-artifact@v4
      with:
        name: mutation-report-\${{ matrix.node-version }}
        path: reports/mutation/
        retention-days: 30

    - name: Comment mutation score on PR
      uses: actions/github-script@v7
      if: github.event_name == 'pull_request'
      with:
        script: |
          const fs = require('fs');
          try {
            const reportPath = 'reports/mutation/mutation-report.json';
            if (fs.existsSync(reportPath)) {
              const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
              const score = report.mutationScore || 0;
              const threshold = ${config.thresholds.low};
              
              const status = score >= threshold ? '✅ PASSED' : '❌ FAILED';
              const body = \`## Mutation Testing Report \${status}
              
**Mutation Score:** \${score}% (threshold: \${threshold}%)
**Total Mutants:** \${report.totalMutants || 0}
**Killed:** \${report.totalKilled || 0}
**Survived:** \${report.totalSurvived || 0}
**Timeout:** \${report.totalTimeout || 0}
**No Coverage:** \${report.totalNoCoverage || 0}

\${score < threshold ? '⚠️ Mutation score below threshold. Consider improving test quality.' : '🎉 Great mutation score! Your tests are catching potential bugs effectively.'}

[View detailed report](https://dashboard.stryker-mutator.io/reports/github.com/\${context.repo.owner}/\${context.repo.repo}/main)
              \`;
              
              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: body
              });
            }
          } catch (error) {
            console.log('Could not post mutation report:', error);
          }

    - name: Check mutation threshold
      run: |
        if [ -f "reports/mutation/mutation-report.json" ]; then
          score=\$(cat reports/mutation/mutation-report.json | jq '.mutationScore // 0')
          threshold=${config.thresholds.break || config.thresholds.low}
          echo "Mutation score: \$score%"
          echo "Threshold: \$threshold%"
          if (( \$(echo "\$score < \$threshold" | bc -l) )); then
            echo "❌ Mutation score \$score% is below threshold \$threshold%"
            exit 1
          else
            echo "✅ Mutation score \$score% meets threshold \$threshold%"
          fi
        else
          echo "❌ Mutation report not found"
          exit 1
        fi`;
	}

	/**
	 * Generate default mutator configurations
	 */
	public generateDefaultMutators(): readonly MutatorConfig[] {
		return [
			// Arithmetic mutators
			{ name: "ArithmeticOperator", enabled: true },
			{ name: "UnaryOperator", enabled: true },
			{ name: "UpdateOperator", enabled: true },

			// Boolean mutators
			{ name: "BooleanLiteral", enabled: true },
			{ name: "ConditionalExpression", enabled: true },
			{ name: "EqualityOperator", enabled: true },
			{ name: "LogicalOperator", enabled: true },

			// String mutators
			{ name: "StringLiteral", enabled: true },
			{ name: "TemplateString", enabled: true },

			// Array mutators
			{ name: "ArrayDeclaration", enabled: true },
			{ name: "ArrowFunction", enabled: true },

			// Object mutators
			{ name: "ObjectLiteral", enabled: true },
			{ name: "OptionalChaining", enabled: true },

			// Control flow mutators
			{ name: "BlockStatement", enabled: true },
			{ name: "ConditionalExpression", enabled: true },

			// Method mutators
			{ name: "MethodExpression", enabled: true },

			// Regex mutators
			{ name: "RegexLiteral", enabled: true },

			// Disable dangerous mutators for UI components
			{ name: "ArrowFunction", enabled: false }, // Can break React components
			{ name: "BlockStatement", enabled: false }, // Can break component structure
		];
	}

	/**
	 * Generate mutation testing documentation
	 */
	public generateMutationTestingDocs(config: MutationTestConfig): string {
		return `# Mutation Testing Guide

## Overview
This project uses [Stryker](https://stryker-mutator.io/) for mutation testing to ensure the quality of our test suite.

## What is Mutation Testing?
Mutation testing works by making small changes (mutations) to your source code and running your tests against the mutated code. If your tests fail, the mutation is "killed" (good). If your tests pass, the mutation "survived" (indicates a gap in your test coverage or test quality).

## Configuration
- **Framework:** ${config.framework}
- **Test Runner:** ${config.testRunner}
- **Mutation Framework:** ${config.mutationFramework}
- **Threshold:** ${config.thresholds.high}% (high), ${config.thresholds.low}% (low)

## Running Mutation Tests

### Local Development
\`\`\`bash
# Run full mutation test suite
npm run test:mutation

# Run with limited concurrency (for slower machines)
npm run test:mutation:ci

# Run fast mutation tests (limited scope)
npm run test:mutation:fast

# Run incremental mutation tests (only changed files)
npm run test:mutation:incremental

# Dry run (no actual mutations, just setup verification)
npm run test:mutation:dry-run

# Debug mode with verbose logging
npm run test:mutation:debug
\`\`\`

### CI/CD Pipeline
Mutation tests run automatically:
- **Weekly:** Full mutation test suite (scheduled)
- **Pull Requests:** Incremental mutation tests
- **Main Branch:** Full mutation test suite

## Understanding Results

### Mutation Score
The mutation score is the percentage of mutations that were killed by your tests:
- **${config.thresholds.high}%+:** Excellent test quality 🎉
- **${config.thresholds.low}-${config.thresholds.high}%:** Good test quality ✅
- **Below ${config.thresholds.low}%:** Needs improvement ⚠️

### Mutation States
- **Killed:** Mutation was detected by tests (good)
- **Survived:** Mutation was not detected (test gap)
- **Timeout:** Test took too long (possible infinite loop)
- **No Coverage:** Code not covered by tests
- **Runtime Error:** Mutation caused syntax/runtime error
- **Compile Error:** Mutation caused compilation error

### Report Files
- **HTML Report:** \`${config.reporting.outputDir}/html/index.html\`
- **JSON Report:** \`${config.reporting.outputDir}/mutation-report.json\`
- **Dashboard:** https://dashboard.stryker-mutator.io/

## Improving Mutation Score

### 1. Add Missing Tests
If mutations survive, add tests for those code paths:
\`\`\`typescript
// If this mutation survives: \`>\` → \`>=\`
if (score > 80) {
  return 'excellent';
}

// Add boundary test:
it('should return excellent for score 81', () => {
  expect(getGrade(81)).toBe('excellent');
});

it('should not return excellent for score 80', () => {
  expect(getGrade(80)).not.toBe('excellent');
});
\`\`\`

### 2. Test Edge Cases
Focus on boundary conditions and error paths:
\`\`\`typescript
// Test null/undefined inputs
// Test empty arrays/objects
// Test maximum/minimum values
// Test error conditions
\`\`\`

### 3. Assert More Precisely
Make assertions more specific:
\`\`\`typescript
// Weak assertion
expect(result).toBeTruthy();

// Strong assertion
expect(result).toBe('specific-value');
expect(result).toHaveLength(3);
expect(result).toEqual({ id: 1, name: 'test' });
\`\`\`

### 4. Test Behavioral Changes
Ensure tests verify actual behavior, not just return values:
\`\`\`typescript
// Test side effects
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
expect(element).toHaveClass('active');
expect(localStorage.getItem).toHaveBeenCalled();
\`\`\`

## Performance Optimization

### Reducing Test Time
- Use \`--incremental\` for changed files only
- Increase \`--concurrency\` on powerful machines
- Set appropriate \`--timeoutMS\` values
- Use \`--maxTestRunnerReuse\` for faster restarts

### Excluding Files
Add patterns to ignore in \`stryker.conf.js\`:
\`\`\`javascript
ignoredPatterns: [
  '**/node_modules/**',
  '**/*.spec.ts',
  '**/test-utils/**',
  '**/mocks/**'
]
\`\`\`

## Best Practices

1. **Run Regularly:** Weekly full runs, incremental on PRs
2. **Set Realistic Thresholds:** Start low, gradually increase
3. **Focus on Critical Code:** Prioritize business logic over UI code
4. **Review Survivors:** Analyze why mutations survived
5. **Balance Cost/Benefit:** Mutation testing is expensive, use strategically

## Troubleshooting

### Common Issues
- **High Memory Usage:** Reduce concurrency or increase Node.js memory
- **Timeouts:** Increase \`timeoutMS\` and \`timeoutFactor\`
- **False Positives:** Review mutators and disable problematic ones
- **Slow Performance:** Use incremental mode and exclude non-critical files

### Getting Help
- [Stryker Documentation](https://stryker-mutator.io/docs/)
- [GitHub Issues](https://github.com/stryker-mutator/stryker/issues)
- Team Slack channel: #testing

## Configuration Files
- \`stryker.conf.js\` - Main configuration
- \`package.json\` - NPM scripts
- \`.github/workflows/mutation-testing.yml\` - CI/CD pipeline
`;
	}

	/**
	 * Generate mutation testing integration for existing test generator
	 */
	public generateMutationTestIntegration(): string {
		return `
// Add to existing TestGenerator class

/**
 * Generate mutation testing configuration alongside regular tests
 */
public async generateMutationTestConfig(config: {
  componentName: string;
  testFiles: string[];
  sourceFiles: string[];
}): Promise<{ strykerConfig: string; packageScripts: Record<string, string> }> {
  const mutationConfig: MutationTestConfig = {
    projectName: 'xala-ui',
    framework: 'jest',
    testRunner: 'jest',
    mutationFramework: 'stryker',
    sourceFiles: config.sourceFiles,
    testFiles: config.testFiles,
    mutators: this.generateDefaultMutators(),
    thresholds: {
      high: 80,
      low: 60,
      break: 50
    },
    reporting: {
      reporters: [
        { name: 'html' },
        { name: 'json' },
        { name: 'clear-text' },
        { name: 'progress' }
      ],
      outputDir: 'reports/mutation',
      clearTextEnabled: true,
      progress: true
    },
    performance: {
      checkers: ['typescript'],
      buildCommand: 'npm run build',
      checkCommand: 'npm run type-check'
    },
    plugins: [
      '@stryker-mutator/html-reporter',
      '@stryker-mutator/json-reporter'
    ],
    ignore: [
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/node_modules/**',
      '**/dist/**'
    ],
    concurrency: 4,
    timeoutMS: 60000
  };

  const generator = new MutationTestGenerator();
  
  return {
    strykerConfig: await generator.generateStrykerConfig(mutationConfig),
    packageScripts: generator.generateMutationScripts(mutationConfig)
  };
}`;
	}
}
