/**
 * Knowledge Base Seeder
 *
 * Seeds the RAG system with initial patterns, examples, and compliance rules.
 * Optimized for Norwegian compliance and enterprise development patterns.
 *
 * Features:
 * - Built-in Norwegian compliance patterns
 * - Enterprise architecture patterns
 * - Code quality patterns
 * - Accessibility patterns
 * - Multi-language support
 * - Pattern validation and scoring
 */

import { EventEmitter } from "events";
import {
	IConfigurationService,
	IFileSystemService,
	ILoggingService,
} from "../../architecture/interfaces.js";
import { LocaleCode, NorwegianCompliance } from "../../types/compliance.js";
import {
	ICodePattern,
	PatternMatcher,
} from "../pattern-matching/PatternMatcher.js";
import {
	ChromaDBStore,
	IVectorDocument,
} from "../vector-store/ChromaDBStore.js";
import { EmbeddingGenerator } from "../vector-store/EmbeddingGenerator.js";

/**
 * Seeding options
 */
export interface ISeedingOptions {
	includeBuiltInPatterns?: boolean;
	includeComplianceRules?: boolean;
	includeExamples?: boolean;
	seedFromDirectory?: string;
	validatePatterns?: boolean;
	generateEmbeddings?: boolean;
	locale?: LocaleCode;
	override?: boolean;
}

/**
 * Seeding result
 */
export interface ISeedingResult {
	patternsSeeded: number;
	examplesSeeded: number;
	complianceRulesSeeded: number;
	errors: string[];
	warnings: string[];
	processingTime: number;
}

/**
 * Knowledge Base Seeder Service
 */
export class KnowledgeBaseSeeder extends EventEmitter {
	private initialized = false;
	private seedingInProgress = false;

	// Built-in Norwegian compliance patterns
	private readonly BUILT_IN_PATTERNS: ICodePattern[] = [
		{
			id: "norwegian-compliance-interface",
			name: "Norwegian Compliance Interface",
			description:
				"Standard interface for Norwegian compliance requirements including NSM, GDPR, and WCAG",
			type: "compliance",
			language: "typescript",
			pattern_code: `
interface NorwegianCompliance {
  nsmClassification: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  gdprCompliant: boolean;
  wcagLevel: 'A' | 'AA' | 'AAA';
  supportedLanguages: LocaleCode[];
  auditTrail: boolean;
}

interface LocaleCode {
  'nb-NO' | 'nn-NO' | 'en-US' | 'ar-SA' | 'fr-FR'
}
      `.trim(),
			metadata: {
				category: "compliance",
				tags: ["norwegian", "nsm", "gdpr", "wcag", "interface", "typescript"],
				quality_score: 0.95,
				usage_count: 0,
				complexity: 2,
				maintainability: 0.95,
				security_score: 0.98,
				accessibility_score: 0.95,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				author: "Xala Enterprise",
				source: "built-in",
			},
			examples: [
				`const compliance: NorwegianCompliance = {
  nsmClassification: 'RESTRICTED',
  gdprCompliant: true,
  wcagLevel: 'AAA',
  supportedLanguages: ['nb-NO', 'en-US'],
  auditTrail: true
};`,
			],
			related_patterns: [
				"component-with-compliance",
				"service-with-compliance",
			],
			compliance: {
				nsmClassification: "OPEN",
				gdprCompliant: true,
				wcagLevel: "AAA",
				supportedLanguages: ["nb-NO", "en-US", "fr-FR", "ar-SA"],
				auditTrail: true,
			},
		},
		{
			id: "accessible-button-component",
			name: "Accessible Button Component",
			description:
				"WCAG AAA compliant button component with Norwegian localization support",
			type: "structural",
			language: "typescript",
			framework: "react",
			pattern_code: `
interface AccessibleButtonProps {
  readonly children: React.ReactNode;
  readonly onClick?: () => void;
  readonly disabled?: boolean;
  readonly variant?: 'primary' | 'secondary' | 'destructive';
  readonly size?: 'small' | 'medium' | 'large';
  readonly ariaLabel?: string;
  readonly compliance?: NorwegianCompliance;
  readonly locale?: LocaleCode;
}

export const AccessibleButton = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  ariaLabel,
  compliance,
  locale = 'nb-NO'
}: AccessibleButtonProps): JSX.Element => {
  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      // Log interaction for audit trail if required
      if (compliance?.auditTrail) {
        auditLogger.logInteraction({
          action: 'button_click',
          component: 'AccessibleButton',
          classification: compliance.nsmClassification,
          timestamp: new Date().toISOString()
        });
      }
      onClick();
    }
  }, [disabled, onClick, compliance]);

  const buttonClasses = cn(
    'h-12 px-6 rounded-lg font-medium transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    {
      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500': variant === 'primary',
      'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500': variant === 'secondary',
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'destructive',
      'h-10 px-4 text-sm': size === 'small',
      'h-14 px-8 text-lg': size === 'large'
    }
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-describedby={compliance?.nsmClassification !== 'OPEN' ? 'security-notice' : undefined}
      className={buttonClasses}
      data-testid="accessible-button"
    >
      {children}
      {compliance?.nsmClassification !== 'OPEN' && (
        <span id="security-notice" className="sr-only">
          {locale === 'nb-NO' ? 'Sikkerhetsnivå' : 'Security Level'}: {compliance.nsmClassification}
        </span>
      )}
    </button>
  );
};
      `.trim(),
			metadata: {
				category: "component",
				tags: [
					"button",
					"accessible",
					"wcag",
					"react",
					"typescript",
					"norwegian",
				],
				quality_score: 0.92,
				usage_count: 0,
				complexity: 4,
				maintainability: 0.88,
				security_score: 0.85,
				accessibility_score: 0.98,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				author: "Xala Enterprise",
				source: "built-in",
			},
			examples: [
				`<AccessibleButton 
  variant="primary" 
  onClick={handleSubmit}
  ariaLabel="Submit form"
  compliance={{ nsmClassification: 'RESTRICTED', gdprCompliant: true, wcagLevel: 'AAA' }}
  locale="nb-NO"
>
  Send inn
</AccessibleButton>`,
			],
			related_patterns: [
				"accessible-form-component",
				"norwegian-compliance-interface",
			],
			compliance: {
				nsmClassification: "OPEN",
				gdprCompliant: true,
				wcagLevel: "AAA",
				supportedLanguages: ["nb-NO", "en-US"],
				auditTrail: true,
			},
		},
		{
			id: "gdpr-compliant-form",
			name: "GDPR Compliant Form Component",
			description:
				"Form component with GDPR compliance, consent management, and Norwegian localization",
			type: "structural",
			language: "typescript",
			framework: "react",
			pattern_code: `
interface GDPRFormProps {
  readonly onSubmit: (data: any) => Promise<void>;
  readonly collectsPersonalData: boolean;
  readonly dataProcessingPurpose: string;
  readonly dataRetentionPeriod: string;
  readonly compliance: NorwegianCompliance;
  readonly locale?: LocaleCode;
  readonly children: React.ReactNode;
}

interface ConsentData {
  dataProcessing: boolean;
  marketing: boolean;
  analytics: boolean;
  timestamp: string;
  version: string;
}

export const GDPRCompliantForm = ({
  onSubmit,
  collectsPersonalData,
  dataProcessingPurpose,
  dataRetentionPeriod,
  compliance,
  locale = 'nb-NO',
  children
}: GDPRFormProps): JSX.Element => {
  const [consent, setConsent] = useState<ConsentData>({
    dataProcessing: false,
    marketing: false,
    analytics: false,
    timestamp: '',
    version: '1.0'
  });
  const [showConsentModal, setShowConsentModal] = useState(false);

  const consentTexts = {
    'nb-NO': {
      dataProcessing: 'Jeg samtykker til behandling av mine personopplysninger',
      purpose: 'Formål med behandling',
      retention: 'Lagringsperiode',
      required: 'Obligatorisk samtykke',
      optional: 'Valgfritt samtykke'
    },
    'en-US': {
      dataProcessing: 'I consent to processing of my personal data',
      purpose: 'Purpose of processing',
      retention: 'Retention period',
      required: 'Required consent',
      optional: 'Optional consent'
    }
  };

  const texts = consentTexts[locale] || consentTexts['en-US'];

  const handleSubmit = useCallback(async (formData: any) => {
    if (collectsPersonalData && !consent.dataProcessing) {
      setShowConsentModal(true);
      return;
    }

    // Log GDPR consent for audit trail
    if (compliance.auditTrail) {
      auditLogger.logGDPRConsent({
        consent,
        purpose: dataProcessingPurpose,
        classification: compliance.nsmClassification,
        timestamp: new Date().toISOString(),
        dataSubject: formData.email || 'anonymous'
      });
    }

    await onSubmit({ ...formData, consent });
  }, [consent, collectsPersonalData, onSubmit, compliance, dataProcessingPurpose]);

  const handleConsentChange = useCallback((type: keyof ConsentData, value: boolean) => {
    setConsent(prev => ({
      ...prev,
      [type]: value,
      timestamp: new Date().toISOString()
    }));
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {children}
      
      {collectsPersonalData && (
        <div className="border-t pt-6 space-y-4">
          <h3 className="text-lg font-medium">
            GDPR {texts.required}
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="data-processing-consent"
                checked={consent.dataProcessing}
                onChange={(e) => handleConsentChange('dataProcessing', e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
                aria-describedby="data-processing-description"
              />
              <div className="flex-1">
                <label htmlFor="data-processing-consent" className="text-sm font-medium">
                  {texts.dataProcessing} *
                </label>
                <div id="data-processing-description" className="text-sm text-gray-600 mt-1">
                  <p><strong>{texts.purpose}:</strong> {dataProcessingPurpose}</p>
                  <p><strong>{texts.retention}:</strong> {dataRetentionPeriod}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="marketing-consent"
                checked={consent.marketing}
                onChange={(e) => handleConsentChange('marketing', e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                aria-describedby="marketing-description"
              />
              <div className="flex-1">
                <label htmlFor="marketing-consent" className="text-sm font-medium">
                  {locale === 'nb-NO' ? 'Markedsføring' : 'Marketing'} ({texts.optional})
                </label>
                <p id="marketing-description" className="text-sm text-gray-600 mt-1">
                  {locale === 'nb-NO' 
                    ? 'Motta markedsføringsinformasjon på e-post'
                    : 'Receive marketing information via email'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={collectsPersonalData && !consent.dataProcessing}
        className="w-full h-12 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-describedby={compliance.nsmClassification !== 'OPEN' ? 'form-security-notice' : undefined}
      >
        {locale === 'nb-NO' ? 'Send inn' : 'Submit'}
      </button>

      {compliance.nsmClassification !== 'OPEN' && (
        <div id="form-security-notice" className="text-xs text-gray-500 text-center">
          {locale === 'nb-NO' ? 'Sikkerhetsnivå' : 'Security Level'}: {compliance.nsmClassification}
        </div>
      )}
    </form>
  );
};
      `.trim(),
			metadata: {
				category: "component",
				tags: [
					"form",
					"gdpr",
					"consent",
					"privacy",
					"norwegian",
					"typescript",
					"react",
				],
				quality_score: 0.94,
				usage_count: 0,
				complexity: 6,
				maintainability: 0.82,
				security_score: 0.95,
				accessibility_score: 0.92,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				author: "Xala Enterprise",
				source: "built-in",
			},
			examples: [
				`<GDPRCompliantForm
  onSubmit={handleFormSubmit}
  collectsPersonalData={true}
  dataProcessingPurpose="Brukerregistrering og kundeservice"
  dataRetentionPeriod="3 år fra siste aktivitet"
  compliance={{ nsmClassification: 'RESTRICTED', gdprCompliant: true, wcagLevel: 'AAA' }}
  locale="nb-NO"
>
  <input name="email" type="email" required />
  <input name="name" type="text" required />
</GDPRCompliantForm>`,
			],
			related_patterns: ["accessible-button-component", "audit-logger-service"],
			compliance: {
				nsmClassification: "RESTRICTED",
				gdprCompliant: true,
				wcagLevel: "AAA",
				supportedLanguages: ["nb-NO", "en-US"],
				auditTrail: true,
			},
		},
		{
			id: "audit-logger-service",
			name: "Audit Logger Service",
			description:
				"Norwegian compliance audit logging service with NSM classification support",
			type: "structural",
			language: "typescript",
			pattern_code: `
interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  component: string;
  userId?: string;
  sessionId: string;
  classification: NorwegianCompliance['nsmClassification'];
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

interface GDPRConsentLog extends AuditLogEntry {
  action: 'gdpr_consent';
  details: {
    consent: ConsentData;
    purpose: string;
    dataSubject: string;
    consentVersion: string;
  };
}

interface SecurityEventLog extends AuditLogEntry {
  action: 'security_event';
  details: {
    eventType: 'authentication' | 'authorization' | 'data_access' | 'system_access';
    success: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    additionalInfo?: Record<string, any>;
  };
}

class AuditLoggerService {
  private readonly logger: ILoggingService;
  private readonly config: IConfigurationService;
  private readonly storage: IAuditStorage;

  constructor(
    logger: ILoggingService,
    config: IConfigurationService,
    storage: IAuditStorage
  ) {
    this.logger = logger;
    this.config = config;
    this.storage = storage;
  }

  async logInteraction(data: {
    action: string;
    component: string;
    classification: NorwegianCompliance['nsmClassification'];
    userId?: string;
    details?: Record<string, any>;
  }): Promise<void> {
    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      action: data.action,
      component: data.component,
      userId: data.userId,
      sessionId: this.getSessionId(),
      classification: data.classification,
      details: data.details || {},
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent()
    };

    await this.writeAuditLog(entry);
    
    // Trigger alerts for high-classification events
    if (data.classification === 'SECRET' || data.classification === 'CONFIDENTIAL') {
      await this.triggerSecurityAlert(entry);
    }
  }

  async logGDPRConsent(data: GDPRConsentLog['details'] & {
    classification: NorwegianCompliance['nsmClassification'];
    userId?: string;
  }): Promise<void> {
    const entry: GDPRConsentLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      action: 'gdpr_consent',
      component: 'GDPRConsentManager',
      userId: data.userId,
      sessionId: this.getSessionId(),
      classification: data.classification,
      details: {
        consent: data.consent,
        purpose: data.purpose,
        dataSubject: data.dataSubject,
        consentVersion: data.consent.version
      },
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent()
    };

    await this.writeAuditLog(entry);
    
    // GDPR requires special handling
    await this.notifyDataProtectionOfficer(entry);
  }

  async logSecurityEvent(data: SecurityEventLog['details'] & {
    classification: NorwegianCompliance['nsmClassification'];
    userId?: string;
  }): Promise<void> {
    const entry: SecurityEventLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      action: 'security_event',
      component: 'SecurityManager',
      userId: data.userId,
      sessionId: this.getSessionId(),
      classification: data.classification,
      details: {
        eventType: data.eventType,
        success: data.success,
        riskLevel: data.riskLevel,
        additionalInfo: data.additionalInfo
      },
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent()
    };

    await this.writeAuditLog(entry);
    
    // Handle security events based on risk level
    if (data.riskLevel === 'critical' || data.riskLevel === 'high') {
      await this.triggerSecurityAlert(entry);
    }
  }

  private async writeAuditLog(entry: AuditLogEntry): Promise<void> {
    try {
      // Write to secure audit storage
      await this.storage.store(entry);
      
      // Log to application logger for monitoring
      this.logger.info('Audit log entry created', {
        id: entry.id,
        action: entry.action,
        classification: entry.classification,
        timestamp: entry.timestamp
      });
    } catch (error) {
      // Critical: audit logging failure
      this.logger.error('Failed to write audit log', error as Error, {
        entryId: entry.id,
        action: entry.action,
        classification: entry.classification
      });
      
      // Attempt to write to fallback storage
      await this.writeFallbackLog(entry, error);
    }
  }

  private async triggerSecurityAlert(entry: AuditLogEntry): Promise<void> {
    // Implement security alerting based on NSM requirements
    this.logger.warn('Security alert triggered', {
      entryId: entry.id,
      classification: entry.classification,
      action: entry.action
    });
  }

  private async notifyDataProtectionOfficer(entry: GDPRConsentLog): Promise<void> {
    // Implement GDPR notification requirements
    this.logger.info('Data Protection Officer notified', {
      entryId: entry.id,
      dataSubject: entry.details.dataSubject
    });
  }

  private generateId(): string {
    return \`audit-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
  }

  private getSessionId(): string {
    // Implement session ID retrieval
    return 'session-id';
  }

  private getClientIP(): string {
    // Implement client IP retrieval
    return '0.0.0.0';
  }

  private getUserAgent(): string {
    // Implement user agent retrieval
    return 'unknown';
  }

  private async writeFallbackLog(entry: AuditLogEntry, error: any): Promise<void> {
    // Implement fallback logging mechanism
    console.error('Audit log fallback', { entry, error });
  }
}

// Export singleton instance
export const auditLogger = new AuditLoggerService(
  /* inject dependencies */
);
      `.trim(),
			metadata: {
				category: "service",
				tags: [
					"audit",
					"logging",
					"nsm",
					"gdpr",
					"security",
					"norwegian",
					"typescript",
				],
				quality_score: 0.91,
				usage_count: 0,
				complexity: 8,
				maintainability: 0.79,
				security_score: 0.98,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				author: "Xala Enterprise",
				source: "built-in",
			},
			examples: [
				`// Log user interaction
auditLogger.logInteraction({
  action: 'form_submit',
  component: 'UserRegistrationForm',
  classification: 'RESTRICTED',
  userId: 'user-123',
  details: { formType: 'registration' }
});`,
				`// Log GDPR consent
auditLogger.logGDPRConsent({
  consent: consentData,
  purpose: 'User registration',
  classification: 'RESTRICTED',
  dataSubject: 'user@example.com'
});`,
			],
			related_patterns: [
				"gdpr-compliant-form",
				"norwegian-compliance-interface",
			],
			compliance: {
				nsmClassification: "RESTRICTED",
				gdprCompliant: true,
				wcagLevel: "A",
				supportedLanguages: ["nb-NO", "en-US"],
				auditTrail: true,
			},
		},
	];

	constructor(
		private readonly logger: ILoggingService,
		private readonly config: IConfigurationService,
		private readonly fileSystem: IFileSystemService,
		private readonly vectorStore: ChromaDBStore,
		private readonly embeddingGenerator: EmbeddingGenerator,
		private readonly patternMatcher: PatternMatcher,
	) {
		super();
	}

	/**
	 * Initialize the knowledge base seeder
	 */
	async initialize(): Promise<void> {
		try {
			this.logger.info("Initializing Knowledge Base Seeder");

			this.initialized = true;
			this.emit("initialized");

			this.logger.info("Knowledge Base Seeder initialized successfully");
		} catch (error) {
			this.logger.error(
				"Failed to initialize Knowledge Base Seeder",
				error as Error,
			);
			throw error;
		}
	}

	/**
	 * Seed the knowledge base with patterns and examples
	 */
	async seedKnowledgeBase(
		options: ISeedingOptions = {},
	): Promise<ISeedingResult> {
		if (this.seedingInProgress) {
			throw new Error("Seeding is already in progress");
		}

		const startTime = Date.now();
		this.seedingInProgress = true;

		try {
			this.logger.info("Starting knowledge base seeding", options);

			const result: ISeedingResult = {
				patternsSeeded: 0,
				examplesSeeded: 0,
				complianceRulesSeeded: 0,
				errors: [],
				warnings: [],
				processingTime: 0,
			};

			const {
				includeBuiltInPatterns = true,
				includeComplianceRules = true,
				includeExamples = true,
				seedFromDirectory,
				validatePatterns = true,
				generateEmbeddings = true,
				locale = "nb-NO",
				override = false,
			} = options;

			// Seed built-in patterns
			if (includeBuiltInPatterns) {
				const builtInResult = await this.seedBuiltInPatterns(
					generateEmbeddings,
					validatePatterns,
					override,
				);
				result.patternsSeeded += builtInResult.patterns;
				result.errors.push(...builtInResult.errors);
				result.warnings.push(...builtInResult.warnings);
			}

			// Seed compliance rules
			if (includeComplianceRules) {
				const complianceResult = await this.seedComplianceRules(
					locale,
					generateEmbeddings,
					override,
				);
				result.complianceRulesSeeded += complianceResult.rules;
				result.errors.push(...complianceResult.errors);
				result.warnings.push(...complianceResult.warnings);
			}

			// Seed examples
			if (includeExamples) {
				const examplesResult = await this.seedExamples(
					generateEmbeddings,
					validatePatterns,
					override,
				);
				result.examplesSeeded += examplesResult.examples;
				result.errors.push(...examplesResult.errors);
				result.warnings.push(...examplesResult.warnings);
			}

			// Seed from directory if specified
			if (seedFromDirectory) {
				const directoryResult = await this.seedFromDirectory(
					seedFromDirectory,
					generateEmbeddings,
					validatePatterns,
					override,
				);
				result.patternsSeeded += directoryResult.patterns;
				result.examplesSeeded += directoryResult.examples;
				result.errors.push(...directoryResult.errors);
				result.warnings.push(...directoryResult.warnings);
			}

			result.processingTime = Date.now() - startTime;

			this.logger.info("Knowledge base seeding completed", {
				result,
				durationMs: result.processingTime,
			});

			this.emit("seedingCompleted", result);
			return result;
		} catch (error) {
			this.logger.error("Failed to seed knowledge base", error as Error);
			throw error;
		} finally {
			this.seedingInProgress = false;
		}
	}

	/**
	 * Seed from existing examples directory
	 */
	async seedFromDirectory(
		directoryPath: string,
		generateEmbeddings: boolean = true,
		validatePatterns: boolean = true,
		override: boolean = false,
	): Promise<{
		patterns: number;
		examples: number;
		errors: string[];
		warnings: string[];
	}> {
		try {
			this.logger.debug("Seeding from directory", { path: directoryPath });

			const result = {
				patterns: 0,
				examples: 0,
				errors: [],
				warnings: [],
			};

			// Check if directory exists
			const exists = await this.fileSystem.exists(directoryPath);
			if (!exists) {
				result.warnings.push(`Directory not found: ${directoryPath}`);
				return result;
			}

			// Read directory contents
			const files = await this.fileSystem.readDirectory(directoryPath);
			const codeFiles = files.filter(
				(file) =>
					file.endsWith(".ts") ||
					file.endsWith(".tsx") ||
					file.endsWith(".js") ||
					file.endsWith(".jsx"),
			);

			for (const file of codeFiles) {
				try {
					const filePath = `${directoryPath}/${file}`;
					const content = await this.fileSystem.readFile(filePath);

					// Determine if it's a pattern or example based on content analysis
					const isPattern = this.isPatternFile(content, file);

					if (isPattern) {
						await this.addPatternFromFile(
							file,
							content,
							generateEmbeddings,
							validatePatterns,
							override,
						);
						result.patterns++;
					} else {
						await this.addExampleFromFile(
							file,
							content,
							generateEmbeddings,
							override,
						);
						result.examples++;
					}
				} catch (fileError) {
					result.errors.push(
						`Failed to process file ${file}: ${fileError instanceof Error ? fileError.message : "Unknown error"}`,
					);
				}
			}

			this.logger.debug("Directory seeding completed", {
				directory: directoryPath,
				patterns: result.patterns,
				examples: result.examples,
			});

			return result;
		} catch (error) {
			this.logger.error("Failed to seed from directory", error as Error, {
				path: directoryPath,
			});
			throw error;
		}
	}

	/**
	 * Get seeding progress
	 */
	getSeedingProgress(): { inProgress: boolean; startTime?: number } {
		return {
			inProgress: this.seedingInProgress,
			startTime: this.seedingInProgress ? Date.now() : undefined,
		};
	}

	// === Private Helper Methods ===

	private async seedBuiltInPatterns(
		generateEmbeddings: boolean,
		validatePatterns: boolean,
		override: boolean,
	): Promise<{ patterns: number; errors: string[]; warnings: string[] }> {
		const result = { patterns: 0, errors: [], warnings: [] };

		this.logger.debug("Seeding built-in patterns", {
			count: this.BUILT_IN_PATTERNS.length,
		});

		for (const pattern of this.BUILT_IN_PATTERNS) {
			try {
				// Validate pattern if requested
				if (validatePatterns) {
					const isValid = this.validatePattern(pattern);
					if (!isValid) {
						result.warnings.push(`Pattern validation failed: ${pattern.id}`);
						continue;
					}
				}

				// Add pattern to pattern matcher
				this.patternMatcher.addPattern(pattern);

				// Convert to vector document
				const vectorDoc = await this.convertPatternToVectorDocument(
					pattern,
					generateEmbeddings,
				);

				// Add to vector store
				const collection =
					await this.vectorStore.getCollection("xala_code_patterns");
				if (override) {
					await collection.update([vectorDoc]);
				} else {
					await collection.add([vectorDoc]);
				}

				result.patterns++;
			} catch (error) {
				result.errors.push(
					`Failed to seed pattern ${pattern.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
			}
		}

		return result;
	}

	private async seedComplianceRules(
		locale: LocaleCode,
		generateEmbeddings: boolean,
		override: boolean,
	): Promise<{ rules: number; errors: string[]; warnings: string[] }> {
		const result = { rules: 0, errors: [], warnings: [] };

		// Built-in compliance rules
		const complianceRules = [
			{
				id: "nsm-classification-rule",
				title:
					locale === "nb-NO"
						? "NSM Sikkerhetskklassifisering"
						: "NSM Security Classification",
				description:
					locale === "nb-NO"
						? "All komponenter må ha NSM sikkerhetskklassifisering i henhold til Grunnprinsipper for IKT-sikkerhet"
						: "All components must have NSM security classification according to Basic Principles for ICT Security",
				rule: "Components handling sensitive data must specify nsmClassification property",
				example: 'nsmClassification: "RESTRICTED"',
				severity: "error",
				category: "security",
			},
			{
				id: "gdpr-consent-rule",
				title: locale === "nb-NO" ? "GDPR Samtykke" : "GDPR Consent",
				description:
					locale === "nb-NO"
						? "Behandling av personopplysninger krever gyldig samtykke i henhold til GDPR"
						: "Processing of personal data requires valid consent according to GDPR",
				rule: "Forms collecting personal data must implement consent management",
				example: "gdprCompliant: true, consentRequired: true",
				severity: "error",
				category: "privacy",
			},
			{
				id: "wcag-accessibility-rule",
				title:
					locale === "nb-NO" ? "WCAG Tilgjengelighet" : "WCAG Accessibility",
				description:
					locale === "nb-NO"
						? "Alle UI-komponenter må oppfylle WCAG AAA tilgjengelighetsstandarder"
						: "All UI components must meet WCAG AAA accessibility standards",
				rule: "Interactive elements must have proper ARIA labels and keyboard navigation",
				example: 'aria-label="Submit form", wcagLevel: "AAA"',
				severity: "warning",
				category: "accessibility",
			},
		];

		for (const rule of complianceRules) {
			try {
				const vectorDoc: IVectorDocument = {
					id: rule.id,
					content: `${rule.title}\n\n${rule.description}\n\nRule: ${rule.rule}\n\nExample: ${rule.example}`,
					metadata: {
						type: "compliance",
						category: rule.category,
						tags: ["rule", rule.category, "norwegian", "compliance"],
						source: "built-in",
						locale,
						quality_score: 0.95,
						usage_count: 0,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					},
				};

				// Generate embedding if requested
				if (generateEmbeddings) {
					const embeddingResult =
						await this.embeddingGenerator.generateEmbedding(vectorDoc.content, {
							language: locale,
						});
					vectorDoc.embedding = embeddingResult.embedding;
				}

				// Add to compliance rules collection
				const collection = await this.vectorStore.getCollection(
					"xala_compliance_rules",
				);
				if (override) {
					await collection.update([vectorDoc]);
				} else {
					await collection.add([vectorDoc]);
				}

				result.rules++;
			} catch (error) {
				result.errors.push(
					`Failed to seed compliance rule ${rule.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
			}
		}

		return result;
	}

	private async seedExamples(
		generateEmbeddings: boolean,
		validatePatterns: boolean,
		override: boolean,
	): Promise<{ examples: number; errors: string[]; warnings: string[] }> {
		const result = { examples: 0, errors: [], warnings: [] };

		// Built-in examples from patterns
		for (const pattern of this.BUILT_IN_PATTERNS) {
			for (let i = 0; i < pattern.examples.length; i++) {
				try {
					const example = pattern.examples[i];
					const exampleId = `${pattern.id}-example-${i}`;

					const vectorDoc: IVectorDocument = {
						id: exampleId,
						content: example,
						metadata: {
							type: "example",
							language: pattern.language,
							framework: pattern.framework,
							category: pattern.metadata.category,
							tags: [...pattern.metadata.tags, "example"],
							source: "built-in",
							compliance: pattern.compliance,
							quality_score: pattern.metadata.quality_score * 0.9, // Slightly lower for examples
							usage_count: 0,
							created_at: new Date().toISOString(),
							updated_at: new Date().toISOString(),
						},
					};

					// Generate embedding if requested
					if (generateEmbeddings) {
						const embeddingResult =
							await this.embeddingGenerator.generateCodeEmbedding(example, {
								language: pattern.language,
							});
						vectorDoc.embedding = embeddingResult.embedding;
					}

					// Add to examples collection
					const collection =
						await this.vectorStore.getCollection("xala_examples");
					if (override) {
						await collection.update([vectorDoc]);
					} else {
						await collection.add([vectorDoc]);
					}

					result.examples++;
				} catch (error) {
					result.errors.push(
						`Failed to seed example from pattern ${pattern.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
					);
				}
			}
		}

		return result;
	}

	private async convertPatternToVectorDocument(
		pattern: ICodePattern,
		generateEmbeddings: boolean,
	): Promise<IVectorDocument> {
		const vectorDoc: IVectorDocument = {
			id: pattern.id,
			content: `${pattern.name}\n\n${pattern.description}\n\n${pattern.pattern_code}`,
			metadata: {
				type: "pattern",
				language: pattern.language,
				framework: pattern.framework,
				category: pattern.metadata.category,
				tags: pattern.metadata.tags,
				source: pattern.metadata.source,
				compliance: pattern.compliance,
				quality_score: pattern.metadata.quality_score,
				usage_count: pattern.metadata.usage_count,
				created_at: pattern.metadata.created_at,
				updated_at: pattern.metadata.updated_at,
			},
		};

		// Generate embedding if requested
		if (generateEmbeddings) {
			const embeddingResult =
				await this.embeddingGenerator.generateCodeEmbedding(
					pattern.pattern_code,
					{ language: pattern.language },
				);
			vectorDoc.embedding = embeddingResult.embedding;
		}

		return vectorDoc;
	}

	private validatePattern(pattern: ICodePattern): boolean {
		// Basic validation
		if (!pattern.id || !pattern.name || !pattern.pattern_code) {
			return false;
		}

		// Check for Norwegian compliance requirements
		if (pattern.compliance) {
			const { nsmClassification, gdprCompliant, wcagLevel } =
				pattern.compliance;

			if (
				!["OPEN", "RESTRICTED", "CONFIDENTIAL", "SECRET"].includes(
					nsmClassification,
				)
			) {
				return false;
			}

			if (typeof gdprCompliant !== "boolean") {
				return false;
			}

			if (!["A", "AA", "AAA"].includes(wcagLevel)) {
				return false;
			}
		}

		return true;
	}

	private isPatternFile(content: string, filename: string): boolean {
		// Heuristics to determine if file contains a reusable pattern
		const patternIndicators = [
			"interface",
			"class",
			"function",
			"const",
			"export",
			"component",
			"service",
			"utility",
		];

		const exampleIndicators = ["example", "demo", "test", "spec", "story"];

		const lowerContent = content.toLowerCase();
		const lowerFilename = filename.toLowerCase();

		// Check filename for example indicators
		if (
			exampleIndicators.some((indicator) => lowerFilename.includes(indicator))
		) {
			return false;
		}

		// Check content for pattern indicators
		const patternScore = patternIndicators.reduce((score, indicator) => {
			return score + (lowerContent.includes(indicator) ? 1 : 0);
		}, 0);

		const exampleScore = exampleIndicators.reduce((score, indicator) => {
			return score + (lowerContent.includes(indicator) ? 1 : 0);
		}, 0);

		return patternScore > exampleScore && patternScore >= 2;
	}

	private async addPatternFromFile(
		filename: string,
		content: string,
		generateEmbeddings: boolean,
		validatePatterns: boolean,
		override: boolean,
	): Promise<void> {
		const patternId = `file-pattern-${filename.replace(/\.[^/.]+$/, "")}`;

		// Extract pattern metadata from content
		const language = this.extractLanguageFromFilename(filename);
		const framework = this.extractFrameworkFromContent(content);

		const vectorDoc: IVectorDocument = {
			id: patternId,
			content,
			metadata: {
				type: "pattern",
				language,
				framework,
				category: "general",
				tags: ["file-pattern", language],
				source: filename,
				quality_score: 0.7, // Default score for file patterns
				usage_count: 0,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			},
		};

		// Generate embedding if requested
		if (generateEmbeddings) {
			const embeddingResult =
				await this.embeddingGenerator.generateCodeEmbedding(content, {
					language,
				});
			vectorDoc.embedding = embeddingResult.embedding;
		}

		// Add to patterns collection
		const collection =
			await this.vectorStore.getCollection("xala_code_patterns");
		if (override) {
			await collection.update([vectorDoc]);
		} else {
			await collection.add([vectorDoc]);
		}
	}

	private async addExampleFromFile(
		filename: string,
		content: string,
		generateEmbeddings: boolean,
		override: boolean,
	): Promise<void> {
		const exampleId = `file-example-${filename.replace(/\.[^/.]+$/, "")}`;

		const language = this.extractLanguageFromFilename(filename);

		const vectorDoc: IVectorDocument = {
			id: exampleId,
			content,
			metadata: {
				type: "example",
				language,
				category: "general",
				tags: ["file-example", language],
				source: filename,
				quality_score: 0.6, // Default score for file examples
				usage_count: 0,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			},
		};

		// Generate embedding if requested
		if (generateEmbeddings) {
			const embeddingResult =
				await this.embeddingGenerator.generateCodeEmbedding(content, {
					language,
				});
			vectorDoc.embedding = embeddingResult.embedding;
		}

		// Add to examples collection
		const collection = await this.vectorStore.getCollection("xala_examples");
		if (override) {
			await collection.update([vectorDoc]);
		} else {
			await collection.add([vectorDoc]);
		}
	}

	private extractLanguageFromFilename(filename: string): string {
		const extension = filename.split(".").pop()?.toLowerCase();

		switch (extension) {
			case "ts":
			case "tsx":
				return "typescript";
			case "js":
			case "jsx":
				return "javascript";
			case "py":
				return "python";
			case "go":
				return "go";
			case "rs":
				return "rust";
			default:
				return "typescript"; // Default to TypeScript
		}
	}

	private extractFrameworkFromContent(content: string): string | undefined {
		const lowerContent = content.toLowerCase();

		if (
			lowerContent.includes("react") ||
			lowerContent.includes("jsx") ||
			lowerContent.includes("tsx")
		) {
			return "react";
		}
		if (lowerContent.includes("vue")) {
			return "vue";
		}
		if (lowerContent.includes("angular")) {
			return "angular";
		}
		if (lowerContent.includes("next")) {
			return "nextjs";
		}
		if (lowerContent.includes("express")) {
			return "express";
		}
		if (lowerContent.includes("fastify")) {
			return "fastify";
		}

		return undefined;
	}
}
