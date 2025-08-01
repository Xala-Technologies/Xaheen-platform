/**
 * Knowledge Base Service Implementation
 *
 * Manages code patterns, examples, compliance rules, and documentation.
 * Follows SOLID principles and Norwegian compliance requirements.
 *
 * Features:
 * - Code pattern management
 * - Compliance rule enforcement
 * - Example and template management
 * - Knowledge base seeding and export
 * - Norwegian compliance integration
 */

import { EventEmitter } from "events";
import { promises as fs } from "fs";
import path from "path";
import {
	IConfigurationService,
	IFileSystemService,
	ILoggingService,
} from "../../architecture/interfaces.js";
import {
	GDPRDataCategory,
	LocaleCode,
	NorwegianCompliance,
	NSMClassification,
} from "../../types/compliance.js";
import {
	ICodeExample,
	ICodePattern,
	IComplianceRule,
	IComplianceValidationResult,
	IComplianceViolation,
	IKnowledgeBaseService,
	IPatternSearchCriteria,
} from "../interfaces.js";

/**
 * In-memory storage for knowledge base items
 */
interface IKnowledgeBaseStorage {
	patterns: Map<string, ICodePattern>;
	complianceRules: Map<string, IComplianceRule>;
	examples: Map<string, ICodeExample>;
}

/**
 * Knowledge Base Service Implementation
 */
export class KnowledgeBaseService
	extends EventEmitter
	implements IKnowledgeBaseService
{
	public readonly name = "KnowledgeBaseService";
	public readonly version = "1.0.0";

	private initialized = false;
	private storage: IKnowledgeBaseStorage;
	private readonly knowledgeBasePath: string;

	// Norwegian compliance rules and patterns
	private readonly BUILT_IN_COMPLIANCE_RULES: Partial<IComplianceRule>[] = [
		{
			id: "nsm-classification-required",
			name: "NSM Classification Required",
			description:
				"All components must include NSM security classification data attributes",
			category: "nsm",
			severity: "error",
			pattern:
				/data-nsm-classification=["']?(OPEN|RESTRICTED|CONFIDENTIAL|SECRET)["']?/,
			explanation:
				"Norwegian NSM requires security classification on all UI components",
			examples: {
				good: [
					'<div data-nsm-classification="OPEN">',
					'<button data-nsm-classification="RESTRICTED">',
				],
				bad: ["<div>", "<button>"],
			},
			applicableLanguages: ["typescript", "javascript", "jsx", "tsx"],
			isActive: true,
		},
		{
			id: "gdpr-consent-required",
			name: "GDPR Consent Management",
			description: "Personal data processing requires explicit GDPR consent",
			category: "gdpr",
			severity: "error",
			pattern: /gdpr.*consent|consent.*gdpr/i,
			explanation:
				"GDPR requires explicit consent for personal data processing",
			examples: {
				good: [
					"const { hasConsent } = useGDPRConsent()",
					"if (gdprConsent.dataProcessing) {",
				],
				bad: ["// No consent check", "processPersonalData()"],
			},
			applicableLanguages: ["typescript", "javascript"],
			isActive: true,
		},
		{
			id: "wcag-aria-required",
			name: "WCAG AAA Accessibility",
			description: "Interactive elements must have proper ARIA attributes",
			category: "wcag",
			severity: "error",
			pattern: /aria-label|aria-describedby|aria-expanded|role=/,
			explanation: "WCAG AAA requires comprehensive accessibility attributes",
			examples: {
				good: [
					'<button aria-label="Save changes">',
					'<input aria-describedby="help-text">',
				],
				bad: ["<button>", "<input>"],
			},
			applicableLanguages: ["typescript", "javascript", "jsx", "tsx"],
			isActive: true,
		},
		{
			id: "norwegian-locale-support",
			name: "Norwegian Language Support",
			description: "Components must support Norwegian locale (nb-NO)",
			category: "nsm",
			severity: "warning",
			pattern: /lang=["']?nb-NO["']?|locale.*nb-NO/,
			explanation: "Norwegian compliance requires native language support",
			examples: {
				good: ['lang="nb-NO"', 'locale: "nb-NO"'],
				bad: ['lang="en"', 'locale: "en-US"'],
			},
			applicableLanguages: ["typescript", "javascript", "jsx", "tsx"],
			isActive: true,
		},
		{
			id: "audit-logging-sensitive",
			name: "Audit Logging for Sensitive Operations",
			description: "Sensitive operations must include audit logging",
			category: "security",
			severity: "error",
			pattern: /auditLogger\.log|audit\.log|log\(/,
			explanation: "NSM security classification requires audit trails",
			examples: {
				good: [
					'auditLogger.log({ action: "user_update" })',
					"await audit.log(operation)",
				],
				bad: ["// No audit logging", "updateUser()"],
			},
			applicableLanguages: ["typescript", "javascript"],
			isActive: true,
		},
	];

	// Built-in Norwegian compliance patterns
	private readonly BUILT_IN_PATTERNS: Partial<ICodePattern>[] = [
		{
			id: "norwegian-button-component",
			name: "Norwegian Compliant Button",
			description:
				"Button component with NSM classification, WCAG AAA accessibility, and Norwegian language support",
			category: "component",
			tags: ["button", "accessibility", "nsm", "norwegian"],
			language: "typescript",
			framework: "react",
			code: `interface ButtonProps {
  readonly children: React.ReactNode;
  readonly variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  readonly size?: 'small' | 'medium' | 'large';
  readonly onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly classification?: NSMClassification;
  readonly ariaLabel?: string;
  readonly 'data-testid'?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  loading = false,
  classification = NSMClassification.OPEN,
  ariaLabel,
  'data-testid': testId,
}) => {
  const { t } = useTranslation();
  const auditLogger = useAuditLogger();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    if (classification !== NSMClassification.OPEN) {
      auditLogger.log({
        action: 'button_click',
        resource: 'Button',
        classification,
        metadata: { variant, size }
      });
    }
    onClick?.(event);
  };

  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant, size }))}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      data-nsm-classification={classification}
      data-testid={testId}
      lang="nb-NO"
    >
      {loading && <Spinner className="mr-2" />}
      {loading ? t('common.loading') : children}
    </button>
  );
};`,
			usage:
				"Norwegian compliant button with NSM classification and WCAG AAA accessibility",
			qualityScore: 95,
			usageCount: 0,
		},
		{
			id: "gdpr-form-pattern",
			name: "GDPR Compliant Form",
			description:
				"Form pattern with GDPR consent management and Norwegian validation",
			category: "form",
			tags: ["form", "gdpr", "validation", "norwegian"],
			language: "typescript",
			framework: "react",
			code: `interface FormData {
  readonly personalData: {
    readonly name: string;
    readonly email: string;
  };
  readonly gdprConsent: {
    readonly dataProcessing: boolean;
    readonly marketing: boolean;
  };
}

export const GDPRForm: React.FC = () => {
  const { t } = useTranslation();
  const { checkConsent, requestConsent } = useGDPRConsent();
  const auditLogger = useAuditLogger();

  const formSchema = z.object({
    personalData: z.object({
      name: z.string().min(2, t('validation.nameRequired')),
      email: z.string().email(t('validation.emailInvalid'))
    }),
    gdprConsent: z.object({
      dataProcessing: z.boolean().refine(val => val === true, t('gdpr.consentRequired')),
      marketing: z.boolean()
    })
  });

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData): Promise<void> => {
    auditLogger.log({
      action: 'gdpr_form_submission',
      resource: 'GDPRForm',
      classification: NSMClassification.RESTRICTED,
      metadata: {
        hasPersonalData: true,
        consentGiven: data.gdprConsent.dataProcessing
      }
    });

    // Process form with GDPR compliance
    await processFormData(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-nsm-classification="RESTRICTED">
      <fieldset>
        <legend>{t('form.personalInformation')}</legend>
        
        <Controller
          name="personalData.name"
          control={control}
          render={({ field, fieldState }) => (
            <AccessibleInput
              {...field}
              label={t('form.name')}
              error={fieldState.error?.message}
              required
              aria-describedby="name-help"
            />
          )}
        />
        
        <Controller
          name="personalData.email"
          control={control}
          render={({ field, fieldState }) => (
            <AccessibleInput
              {...field}
              type="email"
              label={t('form.email')}
              error={fieldState.error?.message}
              required
              aria-describedby="email-help"
            />
          )}
        />
      </fieldset>

      <fieldset>
        <legend>{t('gdpr.consentTitle')}</legend>
        
        <Controller
          name="gdprConsent.dataProcessing"
          control={control}
          render={({ field }) => (
            <GDPRConsentCheckbox
              {...field}
              label={t('gdpr.dataProcessingConsent')}
              description={t('gdpr.dataProcessingDescription')}
              required
            />
          )}
        />
        
        <Controller
          name="gdprConsent.marketing"
          control={control}
          render={({ field }) => (
            <GDPRConsentCheckbox
              {...field}
              label={t('gdpr.marketingConsent')}
              description={t('gdpr.marketingDescription')}
            />
          )}
        />
      </fieldset>

      <Button type="submit" variant="primary" classification={NSMClassification.RESTRICTED}>
        {t('form.submit')}
      </Button>
    </form>
  );
};`,
			usage:
				"GDPR compliant form with Norwegian validation and consent management",
			qualityScore: 90,
			usageCount: 0,
		},
	];

	constructor(
		private readonly logger: ILoggingService,
		private readonly config: IConfigurationService,
		private readonly fileSystem: IFileSystemService,
	) {
		super();

		this.knowledgeBasePath = this.config.get<string>(
			"ai.knowledgeBase.path",
			"./knowledge-base",
		);

		this.storage = {
			patterns: new Map(),
			complianceRules: new Map(),
			examples: new Map(),
		};
	}

	/**
	 * Initialize the knowledge base service
	 */
	async initialize(): Promise<void> {
		try {
			this.logger.info("Initializing Knowledge Base Service");

			// Ensure knowledge base directory exists
			await this.ensureKnowledgeBaseDirectory();

			// Load built-in compliance rules
			await this.loadBuiltInComplianceRules();

			// Load built-in patterns
			await this.loadBuiltInPatterns();

			// Load persisted knowledge base
			await this.loadPersistedKnowledgeBase();

			this.initialized = true;
			this.emit("initialized");

			this.logger.info("Knowledge Base Service initialized successfully", {
				patterns: this.storage.patterns.size,
				complianceRules: this.storage.complianceRules.size,
				examples: this.storage.examples.size,
			});
		} catch (error) {
			this.logger.error(
				"Failed to initialize Knowledge Base Service",
				error as Error,
			);
			throw error;
		}
	}

	/**
	 * Dispose of the service and clean up resources
	 */
	async dispose(): Promise<void> {
		try {
			this.logger.info("Disposing Knowledge Base Service");

			// Save current state
			await this.saveKnowledgeBase();

			// Clear storage
			this.storage.patterns.clear();
			this.storage.complianceRules.clear();
			this.storage.examples.clear();

			this.initialized = false;

			this.emit("disposed");
			this.removeAllListeners();

			this.logger.info("Knowledge Base Service disposed successfully");
		} catch (error) {
			this.logger.error(
				"Error disposing Knowledge Base Service",
				error as Error,
			);
			throw error;
		}
	}

	/**
	 * Health check for the service
	 */
	async healthCheck(): Promise<boolean> {
		try {
			if (!this.initialized) {
				return false;
			}

			// Check if knowledge base directory is accessible
			await this.fileSystem.exists(this.knowledgeBasePath);

			// Verify storage has content
			const hasContent =
				this.storage.patterns.size > 0 ||
				this.storage.complianceRules.size > 0 ||
				this.storage.examples.size > 0;

			return hasContent;
		} catch (error) {
			this.logger.error("Health check failed", error as Error);
			return false;
		}
	}

	/**
	 * Add a code pattern to the knowledge base
	 */
	async addPattern(pattern: ICodePattern): Promise<void> {
		try {
			this.logger.debug("Adding code pattern", {
				id: pattern.id,
				name: pattern.name,
			});

			// Validate pattern
			this.validatePattern(pattern);

			// Store pattern
			this.storage.patterns.set(pattern.id, {
				...pattern,
				updatedAt: new Date(),
			});

			// Save to persistence
			await this.savePattern(pattern);

			this.emit("patternAdded", { patternId: pattern.id });

			this.logger.debug("Code pattern added successfully", { id: pattern.id });
		} catch (error) {
			this.logger.error("Failed to add pattern", error as Error, {
				patternId: pattern.id,
			});
			throw error;
		}
	}

	/**
	 * Get a specific code pattern
	 */
	async getPattern(id: string): Promise<ICodePattern | null> {
		try {
			const pattern = this.storage.patterns.get(id);
			return pattern || null;
		} catch (error) {
			this.logger.error("Failed to get pattern", error as Error, {
				patternId: id,
			});
			throw error;
		}
	}

	/**
	 * Search for code patterns
	 */
	async searchPatterns(
		criteria: IPatternSearchCriteria,
	): Promise<ICodePattern[]> {
		try {
			this.logger.debug("Searching patterns", criteria);

			let patterns = Array.from(this.storage.patterns.values());

			// Apply filters
			if (criteria.query) {
				const query = criteria.query.toLowerCase();
				patterns = patterns.filter(
					(pattern) =>
						pattern.name.toLowerCase().includes(query) ||
						pattern.description.toLowerCase().includes(query) ||
						pattern.tags.some((tag) => tag.toLowerCase().includes(query)),
				);
			}

			if (criteria.category) {
				patterns = patterns.filter(
					(pattern) => pattern.category === criteria.category,
				);
			}

			if (criteria.tags && criteria.tags.length > 0) {
				patterns = patterns.filter((pattern) =>
					criteria.tags!.some((tag) => pattern.tags.includes(tag)),
				);
			}

			if (criteria.language) {
				patterns = patterns.filter(
					(pattern) => pattern.language === criteria.language,
				);
			}

			if (criteria.framework) {
				patterns = patterns.filter(
					(pattern) => pattern.framework === criteria.framework,
				);
			}

			if (criteria.compliance) {
				patterns = patterns.filter(
					(pattern) =>
						pattern.compliance.nsmClassification === criteria.compliance,
				);
			}

			if (criteria.minQualityScore) {
				patterns = patterns.filter(
					(pattern) => pattern.qualityScore >= criteria.minQualityScore!,
				);
			}

			// Sort results
			const sortBy = criteria.sortBy || "relevance";
			patterns.sort((a, b) => {
				switch (sortBy) {
					case "quality":
						return b.qualityScore - a.qualityScore;
					case "usage":
						return b.usageCount - a.usageCount;
					case "date":
						return b.updatedAt.getTime() - a.updatedAt.getTime();
					case "relevance":
					default:
						return (
							b.qualityScore * (b.usageCount + 1) -
							a.qualityScore * (a.usageCount + 1)
						);
				}
			});

			// Apply pagination
			const offset = criteria.offset || 0;
			const limit = criteria.limit || 50;

			const results = patterns.slice(offset, offset + limit);

			this.logger.debug("Pattern search completed", {
				totalFound: patterns.length,
				returned: results.length,
			});

			return results;
		} catch (error) {
			this.logger.error("Failed to search patterns", error as Error);
			throw error;
		}
	}

	/**
	 * Remove a code pattern
	 */
	async removePattern(id: string): Promise<void> {
		try {
			this.logger.debug("Removing pattern", { id });

			if (!this.storage.patterns.has(id)) {
				throw new Error(`Pattern with id ${id} not found`);
			}

			this.storage.patterns.delete(id);

			// Remove from persistence
			await this.deletePersistedPattern(id);

			this.emit("patternRemoved", { patternId: id });

			this.logger.debug("Pattern removed successfully", { id });
		} catch (error) {
			this.logger.error("Failed to remove pattern", error as Error, {
				patternId: id,
			});
			throw error;
		}
	}

	/**
	 * Add a compliance rule
	 */
	async addComplianceRule(rule: IComplianceRule): Promise<void> {
		try {
			this.logger.debug("Adding compliance rule", {
				id: rule.id,
				name: rule.name,
			});

			// Validate rule
			this.validateComplianceRule(rule);

			// Store rule
			this.storage.complianceRules.set(rule.id, rule);

			// Save to persistence
			await this.saveComplianceRule(rule);

			this.emit("complianceRuleAdded", { ruleId: rule.id });

			this.logger.debug("Compliance rule added successfully", { id: rule.id });
		} catch (error) {
			this.logger.error("Failed to add compliance rule", error as Error, {
				ruleId: rule.id,
			});
			throw error;
		}
	}

	/**
	 * Get compliance rules
	 */
	async getComplianceRules(
		classification?: string,
	): Promise<IComplianceRule[]> {
		try {
			let rules = Array.from(this.storage.complianceRules.values());

			if (classification) {
				// Filter rules applicable to specific classification
				rules = rules.filter(
					(rule) =>
						rule.isActive &&
						this.isRuleApplicableToClassification(rule, classification),
				);
			}

			return rules.filter((rule) => rule.isActive);
		} catch (error) {
			this.logger.error("Failed to get compliance rules", error as Error);
			throw error;
		}
	}

	/**
	 * Validate code against compliance rules
	 */
	async validateCompliance(
		code: string,
		rules: IComplianceRule[],
	): Promise<IComplianceValidationResult> {
		try {
			this.logger.debug("Validating code compliance", {
				codeLength: code.length,
				rulesCount: rules.length,
			});

			const violations: IComplianceViolation[] = [];
			const suggestions: string[] = [];
			const appliedRules: string[] = [];

			for (const rule of rules) {
				if (!rule.isActive) continue;

				appliedRules.push(rule.id);

				// Check if code matches the rule pattern
				const matches = this.checkRulePattern(code, rule);

				if (rule.severity === "error" && !matches) {
					violations.push({
						ruleId: rule.id,
						ruleName: rule.name,
						severity: rule.severity,
						message: rule.description,
						suggestion: rule.replacement,
						autoFixable: !!rule.replacement,
					});
				} else if (rule.severity === "warning" && !matches) {
					violations.push({
						ruleId: rule.id,
						ruleName: rule.name,
						severity: rule.severity,
						message: rule.description,
						suggestion: rule.replacement,
						autoFixable: !!rule.replacement,
					});
				}

				// Add rule-specific suggestions
				if (rule.examples.good.length > 0) {
					suggestions.push(
						`${rule.name}: Consider using patterns like: ${rule.examples.good[0]}`,
					);
				}
			}

			// Calculate compliance score
			const errorCount = violations.filter(
				(v) => v.severity === "error",
			).length;
			const warningCount = violations.filter(
				(v) => v.severity === "warning",
			).length;
			const score = Math.max(0, 100 - errorCount * 20 - warningCount * 5);

			const result: IComplianceValidationResult = {
				isValid: errorCount === 0,
				violations,
				suggestions: [...new Set(suggestions)], // Remove duplicates
				score,
				appliedRules,
			};

			this.logger.debug("Compliance validation completed", {
				isValid: result.isValid,
				violationsCount: violations.length,
				score,
			});

			return result;
		} catch (error) {
			this.logger.error("Failed to validate compliance", error as Error);
			throw error;
		}
	}

	/**
	 * Add a code example
	 */
	async addExample(example: ICodeExample): Promise<void> {
		try {
			this.logger.debug("Adding code example", {
				id: example.id,
				title: example.title,
			});

			// Validate example
			this.validateExample(example);

			// Store example
			this.storage.examples.set(example.id, example);

			// Save to persistence
			await this.saveExample(example);

			this.emit("exampleAdded", { exampleId: example.id });

			this.logger.debug("Code example added successfully", { id: example.id });
		} catch (error) {
			this.logger.error("Failed to add example", error as Error, {
				exampleId: example.id,
			});
			throw error;
		}
	}

	/**
	 * Get code examples by category
	 */
	async getExamples(
		category: string,
		locale?: LocaleCode,
	): Promise<ICodeExample[]> {
		try {
			let examples = Array.from(this.storage.examples.values());

			// Filter by category
			examples = examples.filter((example) => example.category === category);

			// Filter by locale if specified
			if (locale) {
				examples = examples.filter((example) => example.locale === locale);
			}

			// Sort by difficulty and creation date
			examples.sort((a, b) => {
				const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
				const aDiff = difficultyOrder[a.difficulty];
				const bDiff = difficultyOrder[b.difficulty];

				if (aDiff !== bDiff) {
					return aDiff - bDiff;
				}

				return b.createdAt.getTime() - a.createdAt.getTime();
			});

			return examples;
		} catch (error) {
			this.logger.error("Failed to get examples", error as Error);
			throw error;
		}
	}

	/**
	 * Seed knowledge base from directory
	 */
	async seedFromDirectory(directoryPath: string): Promise<void> {
		try {
			this.logger.info("Seeding knowledge base from directory", {
				path: directoryPath,
			});

			const exists = await this.fileSystem.exists(directoryPath);
			if (!exists) {
				throw new Error(`Directory does not exist: ${directoryPath}`);
			}

			// Read all files in directory
			const files = await this.fileSystem.list(directoryPath);

			let patternsAdded = 0;
			let examplesAdded = 0;

			for (const file of files) {
				const filePath = path.join(directoryPath, file);
				const stats = await this.fileSystem.getStats(filePath);

				if (
					stats.isFile &&
					(file.endsWith(".ts") ||
						file.endsWith(".tsx") ||
						file.endsWith(".js") ||
						file.endsWith(".jsx"))
				) {
					try {
						const content = await this.fileSystem.read(filePath);

						// Try to extract pattern or example from file
						const extracted = await this.extractKnowledgeFromFile(
							content,
							file,
							filePath,
						);

						if (extracted.type === "pattern" && extracted.pattern) {
							await this.addPattern(extracted.pattern);
							patternsAdded++;
						} else if (extracted.type === "example" && extracted.example) {
							await this.addExample(extracted.example);
							examplesAdded++;
						}
					} catch (fileError) {
						this.logger.warn("Failed to process file during seeding", {
							file: filePath,
							error:
								fileError instanceof Error
									? fileError.message
									: "Unknown error",
						});
					}
				}
			}

			this.emit("knowledgeBaseSeeded", { patternsAdded, examplesAdded });

			this.logger.info("Knowledge base seeding completed", {
				patternsAdded,
				examplesAdded,
			});
		} catch (error) {
			this.logger.error("Failed to seed knowledge base", error as Error);
			throw error;
		}
	}

	/**
	 * Export knowledge base to JSON
	 */
	async exportKnowledgeBase(): Promise<string> {
		try {
			this.logger.info("Exporting knowledge base");

			const exportData = {
				version: this.version,
				exportedAt: new Date().toISOString(),
				patterns: Array.from(this.storage.patterns.values()),
				complianceRules: Array.from(this.storage.complianceRules.values()),
				examples: Array.from(this.storage.examples.values()),
			};

			const jsonData = JSON.stringify(exportData, null, 2);

			this.logger.info("Knowledge base exported successfully", {
				patterns: exportData.patterns.length,
				complianceRules: exportData.complianceRules.length,
				examples: exportData.examples.length,
			});

			return jsonData;
		} catch (error) {
			this.logger.error("Failed to export knowledge base", error as Error);
			throw error;
		}
	}

	/**
	 * Import knowledge base from JSON
	 */
	async importKnowledgeBase(data: string): Promise<void> {
		try {
			this.logger.info("Importing knowledge base");

			const importData = JSON.parse(data);

			if (
				!importData.version ||
				!importData.patterns ||
				!importData.complianceRules ||
				!importData.examples
			) {
				throw new Error("Invalid knowledge base format");
			}

			let imported = 0;

			// Import patterns
			for (const pattern of importData.patterns) {
				try {
					await this.addPattern(pattern);
					imported++;
				} catch (error) {
					this.logger.warn("Failed to import pattern", {
						patternId: pattern.id,
						error: error instanceof Error ? error.message : "Unknown error",
					});
				}
			}

			// Import compliance rules
			for (const rule of importData.complianceRules) {
				try {
					await this.addComplianceRule(rule);
					imported++;
				} catch (error) {
					this.logger.warn("Failed to import compliance rule", {
						ruleId: rule.id,
						error: error instanceof Error ? error.message : "Unknown error",
					});
				}
			}

			// Import examples
			for (const example of importData.examples) {
				try {
					await this.addExample(example);
					imported++;
				} catch (error) {
					this.logger.warn("Failed to import example", {
						exampleId: example.id,
						error: error instanceof Error ? error.message : "Unknown error",
					});
				}
			}

			this.emit("knowledgeBaseImported", { imported });

			this.logger.info("Knowledge base imported successfully", { imported });
		} catch (error) {
			this.logger.error("Failed to import knowledge base", error as Error);
			throw error;
		}
	}

	// === Private Helper Methods ===

	private async ensureKnowledgeBaseDirectory(): Promise<void> {
		const exists = await this.fileSystem.exists(this.knowledgeBasePath);
		if (!exists) {
			await this.fileSystem.createDirectory(this.knowledgeBasePath);
		}

		// Create subdirectories
		const subdirs = ["patterns", "rules", "examples"];
		for (const subdir of subdirs) {
			const subdirPath = path.join(this.knowledgeBasePath, subdir);
			const subdirExists = await this.fileSystem.exists(subdirPath);
			if (!subdirExists) {
				await this.fileSystem.createDirectory(subdirPath);
			}
		}
	}

	private async loadBuiltInComplianceRules(): Promise<void> {
		for (const ruleData of this.BUILT_IN_COMPLIANCE_RULES) {
			const rule: IComplianceRule = {
				id: ruleData.id!,
				name: ruleData.name!,
				description: ruleData.description!,
				category: ruleData.category!,
				severity: ruleData.severity!,
				pattern: ruleData.pattern!,
				replacement: ruleData.replacement,
				explanation: ruleData.explanation!,
				examples: ruleData.examples!,
				applicableLanguages: ruleData.applicableLanguages!,
				locale: "nb-NO" as LocaleCode,
				isActive: ruleData.isActive!,
			};

			this.storage.complianceRules.set(rule.id, rule);
		}
	}

	private async loadBuiltInPatterns(): Promise<void> {
		for (const patternData of this.BUILT_IN_PATTERNS) {
			const pattern: ICodePattern = {
				id: patternData.id!,
				name: patternData.name!,
				description: patternData.description!,
				category: patternData.category!,
				tags: patternData.tags!,
				code: patternData.code!,
				language: patternData.language!,
				framework: patternData.framework,
				usage: patternData.usage!,
				examples: [],
				compliance: {
					nsmClassification: "OPEN",
					gdprCompliant: true,
					wcagLevel: "AAA",
				} as NorwegianCompliance,
				qualityScore: patternData.qualityScore!,
				usageCount: patternData.usageCount!,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			this.storage.patterns.set(pattern.id, pattern);
		}
	}

	private async loadPersistedKnowledgeBase(): Promise<void> {
		try {
			// Load patterns
			const patternsDir = path.join(this.knowledgeBasePath, "patterns");
			const patternFiles = await this.fileSystem.list(patternsDir);

			for (const file of patternFiles) {
				if (file.endsWith(".json")) {
					try {
						const content = await this.fileSystem.read(
							path.join(patternsDir, file),
						);
						const pattern = JSON.parse(content) as ICodePattern;
						this.storage.patterns.set(pattern.id, pattern);
					} catch (error) {
						this.logger.warn("Failed to load pattern file", { file });
					}
				}
			}

			// Load examples
			const examplesDir = path.join(this.knowledgeBasePath, "examples");
			const exampleFiles = await this.fileSystem.list(examplesDir);

			for (const file of exampleFiles) {
				if (file.endsWith(".json")) {
					try {
						const content = await this.fileSystem.read(
							path.join(examplesDir, file),
						);
						const example = JSON.parse(content) as ICodeExample;
						this.storage.examples.set(example.id, example);
					} catch (error) {
						this.logger.warn("Failed to load example file", { file });
					}
				}
			}
		} catch (error) {
			this.logger.warn("Failed to load persisted knowledge base", {
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	private async saveKnowledgeBase(): Promise<void> {
		try {
			// Save patterns
			for (const pattern of this.storage.patterns.values()) {
				await this.savePattern(pattern);
			}

			// Save examples
			for (const example of this.storage.examples.values()) {
				await this.saveExample(example);
			}
		} catch (error) {
			this.logger.warn("Failed to save knowledge base", {
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	private async savePattern(pattern: ICodePattern): Promise<void> {
		const filePath = path.join(
			this.knowledgeBasePath,
			"patterns",
			`${pattern.id}.json`,
		);
		const content = JSON.stringify(pattern, null, 2);
		await this.fileSystem.write(filePath, content);
	}

	private async saveComplianceRule(rule: IComplianceRule): Promise<void> {
		const filePath = path.join(
			this.knowledgeBasePath,
			"rules",
			`${rule.id}.json`,
		);
		const content = JSON.stringify(rule, null, 2);
		await this.fileSystem.write(filePath, content);
	}

	private async saveExample(example: ICodeExample): Promise<void> {
		const filePath = path.join(
			this.knowledgeBasePath,
			"examples",
			`${example.id}.json`,
		);
		const content = JSON.stringify(example, null, 2);
		await this.fileSystem.write(filePath, content);
	}

	private async deletePersistedPattern(id: string): Promise<void> {
		const filePath = path.join(
			this.knowledgeBasePath,
			"patterns",
			`${id}.json`,
		);
		try {
			await this.fileSystem.delete(filePath);
		} catch (error) {
			// File might not exist
		}
	}

	private validatePattern(pattern: ICodePattern): void {
		if (!pattern.id || !pattern.name || !pattern.code) {
			throw new Error("Pattern must have id, name, and code");
		}

		if (
			!pattern.language ||
			!["typescript", "javascript", "jsx", "tsx"].includes(pattern.language)
		) {
			throw new Error("Pattern must have a supported language");
		}
	}

	private validateComplianceRule(rule: IComplianceRule): void {
		if (!rule.id || !rule.name || !rule.description) {
			throw new Error("Compliance rule must have id, name, and description");
		}

		if (!rule.pattern) {
			throw new Error("Compliance rule must have a pattern");
		}

		if (!["error", "warning", "info"].includes(rule.severity)) {
			throw new Error("Compliance rule must have valid severity");
		}
	}

	private validateExample(example: ICodeExample): void {
		if (!example.id || !example.title || !example.code) {
			throw new Error("Example must have id, title, and code");
		}

		if (
			!example.language ||
			!["typescript", "javascript", "jsx", "tsx"].includes(example.language)
		) {
			throw new Error("Example must have a supported language");
		}
	}

	private isRuleApplicableToClassification(
		rule: IComplianceRule,
		classification: string,
	): boolean {
		// NSM rules apply to RESTRICTED and above
		if (rule.category === "nsm") {
			return ["RESTRICTED", "CONFIDENTIAL", "SECRET"].includes(classification);
		}

		// GDPR rules apply to all classifications
		if (rule.category === "gdpr") {
			return true;
		}

		// WCAG rules apply to all classifications
		if (rule.category === "wcag") {
			return true;
		}

		// Security rules apply to CONFIDENTIAL and above
		if (rule.category === "security") {
			return ["CONFIDENTIAL", "SECRET"].includes(classification);
		}

		return true;
	}

	private checkRulePattern(code: string, rule: IComplianceRule): boolean {
		if (rule.pattern instanceof RegExp) {
			return rule.pattern.test(code);
		} else if (typeof rule.pattern === "string") {
			return code.includes(rule.pattern);
		}
		return false;
	}

	private async extractKnowledgeFromFile(
		content: string,
		filename: string,
		filepath: string,
	): Promise<{
		type: "pattern" | "example" | "none";
		pattern?: ICodePattern;
		example?: ICodeExample;
	}> {
		// Simple heuristic to determine if file contains a pattern or example

		// Look for component patterns
		if (
			content.includes("interface") &&
			content.includes("Props") &&
			content.includes("export")
		) {
			const componentName = this.extractComponentName(content, filename);

			if (componentName) {
				const pattern: ICodePattern = {
					id: `extracted-${componentName.toLowerCase()}-${Date.now()}`,
					name: `${componentName} Component`,
					description: `Extracted from ${filename}`,
					category: "component",
					tags: this.extractTags(content),
					code: content,
					language: this.getLanguageFromFilename(filename),
					framework: this.detectFramework(content),
					usage: `Component pattern extracted from ${filepath}`,
					examples: [],
					compliance: this.detectCompliance(content),
					qualityScore: this.calculateQualityScore(content),
					usageCount: 0,
					createdAt: new Date(),
					updatedAt: new Date(),
				};

				return { type: "pattern", pattern };
			}
		}

		// Look for examples (test files, demo components, etc.)
		if (
			filename.includes("example") ||
			filename.includes("demo") ||
			content.includes("// Example:")
		) {
			const example: ICodeExample = {
				id: `extracted-example-${Date.now()}`,
				title: `Example from ${filename}`,
				description: `Code example extracted from ${filepath}`,
				category: this.extractCategory(content, filename),
				code: content,
				language: this.getLanguageFromFilename(filename),
				framework: this.detectFramework(content),
				features: this.extractFeatures(content),
				compliance: this.detectCompliance(content),
				locale: "nb-NO" as LocaleCode,
				difficulty: "intermediate" as const,
				tags: this.extractTags(content),
				source: filepath,
				createdAt: new Date(),
			};

			return { type: "example", example };
		}

		return { type: "none" };
	}

	private extractComponentName(
		content: string,
		filename: string,
	): string | null {
		// Try to extract component name from export statement
		const exportMatch = content.match(/export\s+(?:const|function)\s+(\w+)/);
		if (exportMatch) {
			return exportMatch[1];
		}

		// Fallback to filename
		return filename.replace(/\.(ts|tsx|js|jsx)$/, "");
	}

	private extractTags(content: string): string[] {
		const tags: string[] = [];

		if (content.includes("useState")) tags.push("hooks");
		if (content.includes("useEffect")) tags.push("effects");
		if (content.includes("form")) tags.push("form");
		if (content.includes("button")) tags.push("button");
		if (content.includes("input")) tags.push("input");
		if (content.includes("aria-")) tags.push("accessibility");
		if (content.includes("data-nsm-classification")) tags.push("nsm");
		if (content.includes("gdpr")) tags.push("gdpr");
		if (content.includes("auditLogger")) tags.push("audit");

		return tags;
	}

	private getLanguageFromFilename(filename: string): string {
		if (filename.endsWith(".tsx")) return "typescript";
		if (filename.endsWith(".ts")) return "typescript";
		if (filename.endsWith(".jsx")) return "javascript";
		if (filename.endsWith(".js")) return "javascript";
		return "typescript";
	}

	private detectFramework(content: string): string | undefined {
		if (content.includes("import React") || content.includes('from "react"')) {
			return "react";
		}
		if (content.includes('from "next/')) {
			return "nextjs";
		}
		return undefined;
	}

	private detectCompliance(content: string): NorwegianCompliance {
		const hasNSMClassification = content.includes("data-nsm-classification");
		const hasGDPR = content.includes("gdpr") || content.includes("consent");
		const hasWCAG = content.includes("aria-") || content.includes("role=");

		let nsmClassification: "OPEN" | "RESTRICTED" | "CONFIDENTIAL" | "SECRET" =
			"OPEN";

		if (content.includes("RESTRICTED")) nsmClassification = "RESTRICTED";
		if (content.includes("CONFIDENTIAL")) nsmClassification = "CONFIDENTIAL";
		if (content.includes("SECRET")) nsmClassification = "SECRET";

		return {
			nsmClassification,
			gdprCompliant: hasGDPR,
			wcagLevel: hasWCAG ? "AAA" : "A",
		} as NorwegianCompliance;
	}

	private calculateQualityScore(content: string): number {
		let score = 50; // Base score

		// TypeScript usage
		if (content.includes("interface") || content.includes("type ")) score += 10;

		// Error handling
		if (content.includes("try") && content.includes("catch")) score += 10;

		// Documentation
		if (content.includes("/**") || content.includes("//")) score += 5;

		// Accessibility
		if (content.includes("aria-")) score += 10;

		// Testing
		if (content.includes("test") || content.includes("expect")) score += 10;

		// Norwegian compliance
		if (content.includes("data-nsm-classification")) score += 5;
		if (content.includes("auditLogger")) score += 5;

		return Math.min(100, score);
	}

	private extractCategory(content: string, filename: string): string {
		if (filename.includes("button") || content.includes("button"))
			return "button";
		if (filename.includes("form") || content.includes("form")) return "form";
		if (filename.includes("input") || content.includes("input")) return "input";
		if (filename.includes("layout") || content.includes("layout"))
			return "layout";
		if (filename.includes("page") || content.includes("page")) return "page";
		return "component";
	}

	private extractFeatures(content: string): string[] {
		const features: string[] = [];

		if (content.includes("useState")) features.push("state management");
		if (content.includes("useEffect")) features.push("side effects");
		if (content.includes("aria-")) features.push("accessibility");
		if (content.includes("data-nsm-classification"))
			features.push("NSM compliance");
		if (content.includes("gdpr")) features.push("GDPR compliance");
		if (content.includes("test")) features.push("testing");

		return features;
	}
}
