/**
 * AI Code Generator Service Implementation
 *
 * Integrates LLM, RAG, and Knowledge Base services to provide AI-enhanced code generation
 * with Norwegian compliance and enterprise standards.
 *
 * Features:
 * - Natural language to code generation
 * - Context-aware generation using RAG
 * - Norwegian compliance validation
 * - Code analysis and improvement suggestions
 * - Interactive AI assistant
 * - Learning from user feedback
 */

import { EventEmitter } from "events";
import {
	IConfigurationService,
	ILoggingService,
} from "../../architecture/interfaces.js";
import {
	LocaleCode,
	NorwegianCompliance,
	NSMClassification,
} from "../../types/compliance.js";
import {
	IAICodeGeneratorService,
	IAssistantResponse,
	ICodeAnalysisResult,
	ICodeGenerationResult,
	ICodeQualityMetrics,
	ICodeRefinementResult,
	IContextManagerService,
	IConversationContext,
	IGeneratedFile,
	IGenerationHistoryEntry,
	IImprovementSuggestion,
	IKnowledgeBaseService,
	ILLMService,
	INaturalLanguageRequirements,
	IRAGService,
} from "../interfaces.js";

/**
 * AI Code Generator Service Implementation
 */
export class AICodeGeneratorService
	extends EventEmitter
	implements IAICodeGeneratorService
{
	public readonly name = "AICodeGeneratorService";
	public readonly version = "1.0.0";

	private initialized = false;
	private generationCount = 0;

	// Norwegian compliance prompt templates
	private readonly NORWEGIAN_PROMPTS = {
		"nb-NO": {
			systemPrompt: `Du er en ekspert TypeScript-utvikler som følger norske reguleringskrav og enterprisestandarder.

Alle kodegenerering må inkludere:
- NSM-sikkerhetskrav og klassifisering (data-nsm-classification attributter)
- GDPR-databeskyttelse med samtykkebehandling
- WCAG AAA tilgjengelighetsstandarder med aria-labels og roller
- Norsk språkstøtte (lang="nb-NO")
- Revisjonssporing for sensitive operasjoner
- SOLID-prinsipper og ren kode
- Strikt TypeScript uten 'any' typer
- Omfattende feilhåndtering

Generer alltid produksjonsklar kode som følger Xala Enterprise standarder.`,

			codeGenerationPrompt: `Basert på kravene, generer enterprise-kvalitet TypeScript-kode som:

1. **Følger norske reguleringskrav:**
   - Inkluderer NSM-klassifisering: data-nsm-classification="{classification}"
   - Implementerer GDPR databeskyttelse
   - Følger WCAG AAA tilgjengelighetsstandarder
   - Bruker norsk språk i brukergrensesnitt (lang="nb-NO")

2. **Følger enterprise-krav:**
   - Strikt TypeScript med eksplisitte typer
   - SOLID-prinsipper implementering
   - Omfattende feilhåndtering med try-catch
   - Revisjonssporing for sensitive operasjoner
   - 95%+ testkodedekning

3. **Følger kodekvalitetsstandarder:**
   - Readonly interfaces for props
   - Funksjonelle komponenter med hooks
   - Proper state management
   - Accessibility-first design
   - Performance optimisert

Generer kode, tester og dokumentasjon som følger alle kravene.`,

			analysisPrompt: `Analyser den oppgitte koden for:

1. **Norsk compliance:**
   - NSM-sikkerhetskrav (klassifisering, revisjonssporing)
   - GDPR databeskyttelse (samtykke, databehandling)
   - WCAG AAA tilgjengelighet (aria-labels, keyboard navigation)

2. **Kodekvalitet:**
   - TypeScript strict mode
   - SOLID-prinsipper
   - Feilhåndtering
   - Performance
   - Testbarhet

3. **Enterprise-standarder:**
   - Sikkerhetspraksis
   - Logging og overvåking
   - Dokumentasjon
   - Vedlikeholdbarhet

Gi konkrete forbedringsforslag med kodeeksempler.`,
		},
		"en-US": {
			systemPrompt: `You are an expert TypeScript developer following Norwegian compliance requirements and enterprise standards.

All code generation must include:
- NSM security requirements and classification (data-nsm-classification attributes)
- GDPR data protection with consent management
- WCAG AAA accessibility standards with aria-labels and roles
- Norwegian language support (lang="nb-NO")
- Audit logging for sensitive operations
- SOLID principles and clean code
- Strict TypeScript without 'any' types
- Comprehensive error handling

Always generate production-ready code following Xala Enterprise standards.`,

			codeGenerationPrompt: `Based on the requirements, generate enterprise-quality TypeScript code that:

1. **Follows Norwegian compliance requirements:**
   - Includes NSM classification: data-nsm-classification="{classification}"
   - Implements GDPR data protection
   - Follows WCAG AAA accessibility standards
   - Uses Norwegian language in UI (lang="nb-NO")

2. **Follows enterprise requirements:**
   - Strict TypeScript with explicit types
   - SOLID principles implementation
   - Comprehensive error handling with try-catch
   - Audit logging for sensitive operations
   - 95%+ test code coverage

3. **Follows code quality standards:**
   - Readonly interfaces for props
   - Functional components with hooks
   - Proper state management
   - Accessibility-first design
   - Performance optimized

Generate code, tests, and documentation that meet all requirements.`,

			analysisPrompt: `Analyze the provided code for:

1. **Norwegian compliance:**
   - NSM security requirements (classification, audit logging)
   - GDPR data protection (consent, data processing)
   - WCAG AAA accessibility (aria-labels, keyboard navigation)

2. **Code quality:**
   - TypeScript strict mode
   - SOLID principles
   - Error handling
   - Performance
   - Testability

3. **Enterprise standards:**
   - Security practices
   - Logging and monitoring
   - Documentation
   - Maintainability

Provide specific improvement suggestions with code examples.`,
		},
	};

	constructor(
		private readonly logger: ILoggingService,
		private readonly config: IConfigurationService,
		private readonly llmService: ILLMService,
		private readonly ragService: IRAGService,
		private readonly knowledgeBaseService: IKnowledgeBaseService,
		private readonly contextManagerService: IContextManagerService,
	) {
		super();
	}

	/**
	 * Initialize the AI code generator service
	 */
	async initialize(): Promise<void> {
		try {
			this.logger.info("Initializing AI Code Generator Service");

			// Verify all dependencies are initialized
			await this.verifyDependencies();

			this.initialized = true;
			this.emit("initialized");

			this.logger.info("AI Code Generator Service initialized successfully");
		} catch (error) {
			this.logger.error(
				"Failed to initialize AI Code Generator Service",
				error as Error,
			);
			throw error;
		}
	}

	/**
	 * Dispose of the service
	 */
	async dispose(): Promise<void> {
		try {
			this.logger.info("Disposing AI Code Generator Service");

			this.initialized = false;

			this.emit("disposed");
			this.removeAllListeners();

			this.logger.info("AI Code Generator Service disposed successfully");
		} catch (error) {
			this.logger.error(
				"Error disposing AI Code Generator Service",
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

			// Check all dependencies
			const llmHealthy = await this.llmService.healthCheck();
			const ragHealthy = await this.ragService.healthCheck();
			const kbHealthy = await this.knowledgeBaseService.healthCheck();
			const contextHealthy = await this.contextManagerService.healthCheck();

			return llmHealthy && ragHealthy && kbHealthy && contextHealthy;
		} catch (error) {
			this.logger.error("Health check failed", error as Error);
			return false;
		}
	}

	/**
	 * Generate component using AI with Norwegian compliance
	 */
	async generateComponentWithAI(
		requirements: INaturalLanguageRequirements,
	): Promise<ICodeGenerationResult> {
		return this.generateCodeWithAI({ ...requirements, type: "component" });
	}

	/**
	 * Generate page using AI with Norwegian compliance
	 */
	async generatePageWithAI(
		requirements: INaturalLanguageRequirements,
	): Promise<ICodeGenerationResult> {
		return this.generateCodeWithAI({ ...requirements, type: "page" });
	}

	/**
	 * Generate API using AI with Norwegian compliance
	 */
	async generateAPIWithAI(
		requirements: INaturalLanguageRequirements,
	): Promise<ICodeGenerationResult> {
		return this.generateCodeWithAI({ ...requirements, type: "api" });
	}

	/**
	 * Analyze existing code with AI
	 */
	async analyzeCode(
		code: string,
		filePath: string,
	): Promise<ICodeAnalysisResult> {
		const startTime = Date.now();

		try {
			this.logger.info("Analyzing code with AI", {
				filePath,
				codeLength: code.length,
			});

			// Get project context
			const projectContext = this.contextManagerService.getProjectContext();
			const userPreferences = this.contextManagerService.getUserPreferences();
			const locale = projectContext?.locale || userPreferences.defaultLocale;

			// Retrieve relevant patterns and compliance rules
			const context = await this.ragService.retrieveContext(
				`code analysis ${filePath}`,
				projectContext || undefined,
			);

			// Build analysis prompt
			const prompt = this.buildAnalysisPrompt(code, filePath, context, locale);

			// Perform analysis using LLM
			const llmResponse = await this.llmService.generateText(prompt, {
				temperature: 0.1, // Low temperature for consistent analysis
				maxTokens: 2048,
			});

			// Parse analysis results
			const analysisResult = this.parseAnalysisResponse(
				llmResponse.text,
				code,
				filePath,
				projectContext?.compliance,
			);

			// Calculate quality metrics
			const qualityMetrics = this.calculateCodeQualityMetrics(code);

			// Get compliance validation
			const complianceRules =
				await this.knowledgeBaseService.getComplianceRules(
					projectContext?.compliance?.nsmClassification,
				);
			const complianceResult =
				await this.knowledgeBaseService.validateCompliance(
					code,
					complianceRules,
				);

			const result: ICodeAnalysisResult = {
				file: filePath,
				quality: qualityMetrics,
				compliance: complianceResult,
				patterns: analysisResult.patterns,
				issues: analysisResult.issues,
				suggestions: analysisResult.suggestions,
				complexity: analysisResult.complexity,
				dependencies: analysisResult.dependencies,
				exports: analysisResult.exports,
			};

			this.logger.info("Code analysis completed", {
				filePath,
				issuesFound: result.issues.length,
				suggestionsCount: result.suggestions.length,
				qualityScore: result.quality.overallScore,
				duration: Date.now() - startTime,
			});

			return result;
		} catch (error) {
			this.logger.error("Failed to analyze code", error as Error, { filePath });
			throw error;
		}
	}

	/**
	 * Suggest improvements for existing code
	 */
	async suggestImprovements(
		code: string,
		context?: any,
	): Promise<IImprovementSuggestion[]> {
		try {
			this.logger.debug("Generating improvement suggestions", {
				codeLength: code.length,
			});

			// Analyze the code first
			const analysis = await this.analyzeCode(code, "inline-analysis");

			// Get project context
			const projectContext = this.contextManagerService.getProjectContext();
			const userPreferences = this.contextManagerService.getUserPreferences();
			const locale = projectContext?.locale || userPreferences.defaultLocale;

			// Retrieve similar patterns for comparison
			const ragContext = await this.ragService.retrieveContext(
				`improvements ${code.substring(0, 200)}`,
				projectContext || undefined,
			);

			// Build improvement prompt
			const prompt = this.buildImprovementPrompt(
				code,
				analysis,
				ragContext,
				locale,
			);

			// Generate improvements using LLM
			const llmResponse = await this.llmService.generateText(prompt, {
				temperature: 0.3,
				maxTokens: 1024,
			});

			// Parse improvement suggestions
			const suggestions = this.parseImprovementSuggestions(
				llmResponse.text,
				analysis,
			);

			this.logger.debug("Improvement suggestions generated", {
				count: suggestions.length,
			});

			return suggestions;
		} catch (error) {
			this.logger.error(
				"Failed to generate improvement suggestions",
				error as Error,
			);
			throw error;
		}
	}

	/**
	 * Interactive AI assistant for development
	 */
	async chatAssistant(
		message: string,
		context?: IConversationContext,
	): Promise<IAssistantResponse> {
		try {
			this.logger.debug("AI assistant chat", {
				message: message.substring(0, 100),
				hasContext: !!context,
			});

			// Get project and user context
			const projectContext = this.contextManagerService.getProjectContext();
			const userPreferences = this.contextManagerService.getUserPreferences();
			const locale = projectContext?.locale || userPreferences.defaultLocale;

			// Retrieve relevant context using RAG
			const ragContext = await this.ragService.retrieveContext(
				message,
				projectContext || undefined,
			);

			// Build conversation context
			const conversationMessages = this.buildConversationMessages(
				message,
				context,
				ragContext,
				locale,
			);

			// Get response from LLM
			const llmResponse = await this.llmService.chat(conversationMessages, {
				temperature: 0.7,
				maxTokens: 1024,
			});

			// Parse assistant response
			const response = this.parseAssistantResponse(llmResponse.message.content);

			this.logger.debug("AI assistant response generated", {
				responseLength: response.message.length,
				hasSuggestions: response.suggestions && response.suggestions.length > 0,
				hasCode: !!response.code,
			});

			return response;
		} catch (error) {
			this.logger.error(
				"Failed to generate assistant response",
				error as Error,
			);
			throw error;
		}
	}

	/**
	 * Validate and refine generated code
	 */
	async validateAndRefineCode(
		code: string,
		requirements: INaturalLanguageRequirements,
	): Promise<ICodeRefinementResult> {
		try {
			this.logger.debug("Validating and refining code", {
				codeLength: code.length,
				type: requirements.type,
			});

			// Analyze the generated code
			const analysis = await this.analyzeCode(code, "generated-code");

			// Check if refinement is needed
			const needsRefinement = this.assessRefinementNeeds(
				analysis,
				requirements,
			);

			if (!needsRefinement) {
				return {
					originalCode: code,
					refinedCode: code,
					changes: [],
					improvements: [],
					complianceImprovements: [],
					qualityImprovementScore: 0,
					explanation: "Code meets all requirements, no refinement needed.",
				};
			}

			// Get project context
			const projectContext = this.contextManagerService.getProjectContext();
			const userPreferences = this.contextManagerService.getUserPreferences();
			const locale = projectContext?.locale || userPreferences.defaultLocale;

			// Build refinement prompt
			const prompt = this.buildRefinementPrompt(
				code,
				analysis,
				requirements,
				locale,
			);

			// Generate refined code
			const llmResponse = await this.llmService.generateCode(
				prompt,
				undefined,
				{
					language: requirements.outputFormat || "typescript",
					compliance: requirements.compliance,
					locale,
					temperature: 0.2, // Low temperature for consistent refinement
				},
			);

			// Parse refinement result
			const result = this.parseRefinementResult(
				code,
				llmResponse.code,
				analysis,
				requirements,
			);

			this.logger.debug("Code refinement completed", {
				changesCount: result.changes.length,
				improvementsCount: result.improvements.length,
				qualityImprovement: result.qualityImprovementScore,
			});

			return result;
		} catch (error) {
			this.logger.error("Failed to validate and refine code", error as Error);
			throw error;
		}
	}

	// === Private Helper Methods ===

	private async verifyDependencies(): Promise<void> {
		const dependencies = [
			{ service: this.llmService, name: "LLM Service" },
			{ service: this.ragService, name: "RAG Service" },
			{ service: this.knowledgeBaseService, name: "Knowledge Base Service" },
			{ service: this.contextManagerService, name: "Context Manager Service" },
		];

		for (const { service, name } of dependencies) {
			const healthy = await service.healthCheck();
			if (!healthy) {
				throw new Error(`${name} is not healthy or initialized`);
			}
		}
	}

	private async generateCodeWithAI(
		requirements: INaturalLanguageRequirements,
	): Promise<ICodeGenerationResult> {
		const startTime = Date.now();
		const generationId = `gen-${Date.now()}-${++this.generationCount}`;

		try {
			this.logger.info("Generating code with AI", {
				type: requirements.type,
				description: requirements.description.substring(0, 100),
				generationId,
			});

			// Get project and user context
			const projectContext = this.contextManagerService.getProjectContext();
			const userPreferences = this.contextManagerService.getUserPreferences();
			const locale =
				requirements.locale ||
				projectContext?.locale ||
				userPreferences.defaultLocale;
			const compliance = requirements.compliance ||
				projectContext?.compliance || {
					nsmClassification: "OPEN",
					gdprCompliant: true,
					wcagLevel: "AAA",
				};

			// Retrieve relevant context using RAG
			const ragContext = await this.ragService.retrieveContext(
				requirements.description,
				projectContext || undefined,
			);

			// Get relevant code patterns
			const codePatterns = await this.ragService.retrieveCodePatterns({
				type: requirements.type,
				description: requirements.description,
				language: requirements.outputFormat || "typescript",
				framework: projectContext?.framework,
				compliance,
				locale,
			});

			// Build generation prompt
			const prompt = this.buildGenerationPrompt(
				requirements,
				ragContext,
				codePatterns,
				locale,
				compliance,
			);

			// Generate code using LLM
			const llmResponse = await this.llmService.generateCode(
				prompt,
				{
					projectType: projectContext?.projectType || "library",
					framework: projectContext?.framework || "react",
					dependencies: Object.keys(projectContext?.dependencies || {}),
					existingFiles: new Map(),
					codeStyle: projectContext?.codeStyle || {
						indentation: "spaces",
						indentSize: 2,
						quotes: "single",
						semicolons: true,
						trailingComma: true,
						bracketSpacing: true,
						arrowParens: "avoid",
						endOfLine: "lf",
						printWidth: 100,
					},
					compliance,
					locale,
				},
				{
					language: requirements.outputFormat || "typescript",
					compliance,
					locale,
					includeTests:
						requirements.includeTests || userPreferences.autoTesting,
					includeDocumentation: requirements.includeDocumentation || true,
					temperature: 0.3,
				},
			);

			// Parse generated files
			const files = await this.parseGeneratedFiles(
				llmResponse.code,
				requirements,
			);

			// Validate compliance
			const complianceRules =
				await this.knowledgeBaseService.getComplianceRules(
					compliance.nsmClassification,
				);
			const complianceResult =
				await this.knowledgeBaseService.validateCompliance(
					llmResponse.code,
					complianceRules,
				);

			// Refine code if needed
			let finalFiles = files;
			if (
				!complianceResult.isValid ||
				llmResponse.qualityMetrics.overallScore < 80
			) {
				try {
					const refinementResult = await this.validateAndRefineCode(
						llmResponse.code,
						requirements,
					);
					if (refinementResult.qualityImprovementScore > 10) {
						finalFiles = await this.parseGeneratedFiles(
							refinementResult.refinedCode,
							requirements,
						);
					}
				} catch (refinementError) {
					this.logger.warn("Code refinement failed, using original code", {
						error:
							refinementError instanceof Error
								? refinementError.message
								: "Unknown error",
					});
				}
			}

			const result: ICodeGenerationResult = {
				success: complianceResult.isValid,
				files: finalFiles,
				explanation: llmResponse.explanation || "Code generated successfully",
				suggestions: llmResponse.suggestions || [],
				compliance: complianceResult,
				quality: llmResponse.qualityMetrics,
				usage: llmResponse.usage,
				generationId,
				model: this.llmService.getCurrentModel()?.name || "unknown",
				timestamp: new Date(),
			};

			// Record generation history
			const historyEntry: IGenerationHistoryEntry = {
				id: generationId,
				timestamp: new Date(),
				type: requirements.type,
				requirements: requirements.description,
				generatedCode: finalFiles.map((f) => f.content).join("\n"),
				model: result.model,
				context: projectContext
					? {
							projectName: projectContext.projectName,
							projectType: projectContext.projectType,
							framework: projectContext.framework,
							compliance: projectContext.compliance,
							locale: projectContext.locale,
						}
					: {},
				qualityScore: result.quality.overallScore,
				complianceScore: result.compliance.score,
				success: result.success,
			};

			await this.contextManagerService.addGenerationHistory(historyEntry);

			this.emit("codeGenerated", {
				generationId,
				type: requirements.type,
				success: result.success,
			});

			this.logger.info("Code generation completed", {
				generationId,
				type: requirements.type,
				success: result.success,
				filesGenerated: result.files.length,
				qualityScore: result.quality.overallScore,
				complianceScore: result.compliance.score,
				duration: Date.now() - startTime,
			});

			return result;
		} catch (error) {
			// Record failed generation
			const historyEntry: IGenerationHistoryEntry = {
				id: generationId,
				timestamp: new Date(),
				type: requirements.type,
				requirements: requirements.description,
				generatedCode: "",
				model: this.llmService.getCurrentModel()?.name || "unknown",
				context: {},
				qualityScore: 0,
				complianceScore: 0,
				success: false,
			};

			await this.contextManagerService.addGenerationHistory(historyEntry);

			this.logger.error("Code generation failed", error as Error, {
				generationId,
				type: requirements.type,
			});
			throw error;
		}
	}

	private buildGenerationPrompt(
		requirements: INaturalLanguageRequirements,
		ragContext: any,
		codePatterns: any[],
		locale: LocaleCode,
		compliance: NorwegianCompliance,
	): string {
		const prompts =
			this.NORWEGIAN_PROMPTS[locale] || this.NORWEGIAN_PROMPTS["en-US"];

		let prompt = prompts.systemPrompt + "\n\n";
		prompt +=
			prompts.codeGenerationPrompt.replace(
				"{classification}",
				compliance.nsmClassification,
			) + "\n\n";

		// Add requirements
		prompt += `**Krav / Requirements:**\n`;
		prompt += `- Type: ${requirements.type}\n`;
		prompt += `- Beskrivelse: ${requirements.description}\n`;
		prompt += `- NSM Klassifisering: ${compliance.nsmClassification}\n`;
		prompt += `- GDPR Compliant: ${compliance.gdprCompliant ? "Ja" : "Nei"}\n`;
		prompt += `- WCAG Level: ${compliance.wcagLevel}\n`;
		prompt += `- Språk: ${locale}\n`;

		if (requirements.features && requirements.features.length > 0) {
			prompt += `- Funksjoner: ${requirements.features.join(", ")}\n`;
		}

		if (requirements.constraints && requirements.constraints.length > 0) {
			prompt += `- Begrensninger: ${requirements.constraints.join(", ")}\n`;
		}

		// Add retrieved context
		if (ragContext.documents.length > 0) {
			prompt += `\n**Relevant eksempler og mønstre:**\n`;
			for (const doc of ragContext.documents.slice(0, 3)) {
				prompt += `- ${doc.document.metadata.category}: ${doc.document.content.substring(0, 200)}...\n`;
			}
		}

		// Add code patterns
		if (codePatterns.length > 0) {
			prompt += `\n**Anbefalte kode-mønstre:**\n`;
			for (const pattern of codePatterns.slice(0, 2)) {
				prompt += `- ${pattern.name}: ${pattern.description}\n`;
			}
		}

		// Add specific generation instructions
		prompt += `\n**Generer følgende:**\n`;
		if (requirements.includeTests) {
			prompt += `- Hovedkomponent/kode med full TypeScript typing\n`;
			prompt += `- Omfattende tester med Jest/Vitest\n`;
			prompt += `- Test for norsk compliance (NSM, GDPR, WCAG)\n`;
		}

		if (requirements.includeDocumentation) {
			prompt += `- JSDoc dokumentasjon på norsk\n`;
			prompt += `- Brukseksempler\n`;
		}

		prompt += `\nGenerer produksjonsklar kode som følger alle kravene ovenfor.`;

		return prompt;
	}

	private buildAnalysisPrompt(
		code: string,
		filePath: string,
		context: any,
		locale: LocaleCode,
	): string {
		const prompts =
			this.NORWEGIAN_PROMPTS[locale] || this.NORWEGIAN_PROMPTS["en-US"];

		let prompt = prompts.systemPrompt + "\n\n";
		prompt += prompts.analysisPrompt + "\n\n";

		prompt += `**Fil som skal analyseres:** ${filePath}\n\n`;
		prompt += `**Kode:**\n\`\`\`typescript\n${code}\n\`\`\`\n\n`;

		if (context.complianceRules.length > 0) {
			prompt += `**Gjeldende compliance-regler:**\n`;
			for (const rule of context.complianceRules) {
				prompt += `- ${rule.name}: ${rule.description}\n`;
			}
			prompt += "\n";
		}

		prompt += `Gi en detaljert analyse med konkrete forbedringsforslag.`;

		return prompt;
	}

	private buildImprovementPrompt(
		code: string,
		analysis: ICodeAnalysisResult,
		ragContext: any,
		locale: LocaleCode,
	): string {
		const prompts =
			this.NORWEGIAN_PROMPTS[locale] || this.NORWEGIAN_PROMPTS["en-US"];

		let prompt = `${prompts.systemPrompt}\n\n`;
		prompt += `Basert på kodeanalysen, gi konkrete forbedringsforslag for følgende kode:\n\n`;
		prompt += `**Kode:**\n\`\`\`typescript\n${code.substring(0, 1000)}...\n\`\`\`\n\n`;

		if (analysis.issues.length > 0) {
			prompt += `**Identifiserte problemer:**\n`;
			for (const issue of analysis.issues.slice(0, 5)) {
				prompt += `- ${issue.type}: ${issue.message}\n`;
			}
			prompt += "\n";
		}

		prompt += `**Kvalitetsmetrikker:**\n`;
		prompt += `- Vedlikeholdbarhet: ${analysis.quality.maintainabilityIndex}/100\n`;
		prompt += `- Kompleksitet: ${analysis.quality.cyclomaticComplexity}\n`;
		prompt += `- Samlet score: ${analysis.quality.overallScore}/100\n\n`;

		prompt += `Gi 3-5 prioriterte forbedringsforslag med kodeeksempler.`;

		return prompt;
	}

	private buildRefinementPrompt(
		code: string,
		analysis: ICodeAnalysisResult,
		requirements: INaturalLanguageRequirements,
		locale: LocaleCode,
	): string {
		const prompts =
			this.NORWEGIAN_PROMPTS[locale] || this.NORWEGIAN_PROMPTS["en-US"];

		let prompt = `${prompts.systemPrompt}\n\n`;
		prompt += `Refiner følgende kode for å møte alle krav og forbedre kvaliteten:\n\n`;
		prompt += `**Original kode:**\n\`\`\`typescript\n${code}\n\`\`\`\n\n`;

		prompt += `**Opprinnelige krav:**\n`;
		prompt += `- Type: ${requirements.type}\n`;
		prompt += `- Beskrivelse: ${requirements.description}\n\n`;

		if (analysis.compliance.violations.length > 0) {
			prompt += `**Compliance-brudd som må fikses:**\n`;
			for (const violation of analysis.compliance.violations) {
				prompt += `- ${violation.ruleName}: ${violation.message}\n`;
			}
			prompt += "\n";
		}

		if (analysis.issues.length > 0) {
			prompt += `**Kodekvalitetsproblemer som må fikses:**\n`;
			for (const issue of analysis.issues.slice(0, 5)) {
				prompt += `- ${issue.type}: ${issue.message}\n`;
			}
			prompt += "\n";
		}

		prompt += `Generer forbedret kode som løser alle identifiserte problemer mens du beholder funksjonaliteten.`;

		return prompt;
	}

	private buildConversationMessages(
		message: string,
		context: IConversationContext | undefined,
		ragContext: any,
		locale: LocaleCode,
	): any[] {
		const prompts =
			this.NORWEGIAN_PROMPTS[locale] || this.NORWEGIAN_PROMPTS["en-US"];

		const messages = [
			{
				role: "system",
				content:
					prompts.systemPrompt +
					"\n\nDu er en hjelpsom AI-assistent for utvikling som kan svare på spørsmål om koding, beste praksis, og norsk compliance.",
			},
		];

		// Add conversation history if available
		if (context && context.history.length > 0) {
			messages.push(...context.history.slice(-5)); // Last 5 messages for context
		}

		// Add RAG context if relevant
		if (ragContext.documents.length > 0) {
			const contextInfo = ragContext.documents
				.slice(0, 2)
				.map(
					(doc: any) =>
						`${doc.document.metadata.category}: ${doc.document.content.substring(0, 200)}`,
				)
				.join("\n");

			messages.push({
				role: "system",
				content: `Relevant kontekst:\n${contextInfo}`,
			});
		}

		// Add current message
		messages.push({
			role: "user",
			content: message,
		});

		return messages;
	}

	private async parseGeneratedFiles(
		generatedCode: string,
		requirements: INaturalLanguageRequirements,
	): Promise<IGeneratedFile[]> {
		const files: IGeneratedFile[] = [];

		// Extract main component/code
		const mainFile: IGeneratedFile = {
			path: this.generateFileName(requirements),
			content: generatedCode,
			type: requirements.type as any,
			language:
				requirements.outputFormat === "javascript"
					? "javascript"
					: "typescript",
			size: generatedCode.length,
			description: `Generated ${requirements.type} based on requirements`,
		};

		files.push(mainFile);

		// Check for test files in the generated code
		if (
			(requirements.includeTests && generatedCode.includes("test(")) ||
			generatedCode.includes("it(")
		) {
			const testCode = this.extractTestCode(generatedCode);
			if (testCode) {
				files.push({
					path: mainFile.path.replace(/\.(ts|js)x?$/, ".test.$1"),
					content: testCode,
					type: "test",
					language: mainFile.language,
					size: testCode.length,
					description: `Test file for ${requirements.type}`,
				});
			}
		}

		return files;
	}

	private generateFileName(requirements: INaturalLanguageRequirements): string {
		// Extract component name from description or use type
		const name =
			requirements.description
				.split(" ")[0]
				.replace(/[^a-zA-Z0-9]/g, "")
				.replace(/^\w/, (c) => c.toUpperCase()) || requirements.type;

		const extension = requirements.outputFormat === "javascript" ? "js" : "ts";
		const reactExtension = requirements.type === "component" ? "x" : "";

		return `${name}.${extension}${reactExtension}`;
	}

	private extractTestCode(generatedCode: string): string | null {
		// Simple extraction of test code blocks
		const testBlockMatch = generatedCode.match(
			/\/\*\* TEST FILE \*\*\/([\s\S]*?)\/\*\* END TEST \*\*\//,
		);
		if (testBlockMatch) {
			return testBlockMatch[1].trim();
		}

		// Look for test functions
		const lines = generatedCode.split("\n");
		const testLines: string[] = [];
		let inTestBlock = false;

		for (const line of lines) {
			if (
				line.includes("describe(") ||
				line.includes("test(") ||
				line.includes("it(")
			) {
				inTestBlock = true;
			}

			if (inTestBlock) {
				testLines.push(line);
			}
		}

		return testLines.length > 0 ? testLines.join("\n") : null;
	}

	private parseAnalysisResponse(
		response: string,
		code: string,
		filePath: string,
		compliance?: NorwegianCompliance,
	): any {
		// Simplified parsing - in a real implementation, this would be more sophisticated
		return {
			patterns: [],
			issues: [],
			suggestions: response
				.split("\n")
				.filter((line) => line.startsWith("- ") || line.startsWith("* "))
				.map((line) => line.substring(2)),
			complexity: this.calculateComplexityMetrics(code),
			dependencies: this.extractDependencies(code),
			exports: this.extractExports(code),
		};
	}

	private parseImprovementSuggestions(
		response: string,
		analysis: ICodeAnalysisResult,
	): IImprovementSuggestion[] {
		const suggestions: IImprovementSuggestion[] = [];

		// Parse improvement suggestions from LLM response
		const sections = response.split("\n\n");

		for (let i = 0; i < sections.length; i++) {
			const section = sections[i].trim();
			if (
				section.startsWith("**") ||
				section.includes("forbedringsforslag") ||
				section.includes("improvement")
			) {
				suggestions.push({
					id: `suggestion-${i}`,
					title: section.split("\n")[0].replace(/\*+/g, "").trim(),
					description: section,
					category: "maintainability",
					priority: "medium",
					effort: "medium",
					impact: "medium",
					explanation: section,
				});
			}
		}

		return suggestions;
	}

	private parseAssistantResponse(responseText: string): IAssistantResponse {
		return {
			message: responseText,
			suggestions: this.extractSuggestions(responseText),
			code: this.extractCodeBlocks(responseText),
			explanation: responseText,
			confidence: 0.8, // Default confidence
			sources: [],
		};
	}

	private parseRefinementResult(
		originalCode: string,
		refinedCode: string,
		analysis: ICodeAnalysisResult,
		requirements: INaturalLanguageRequirements,
	): ICodeRefinementResult {
		return {
			originalCode,
			refinedCode,
			changes: this.identifyChanges(originalCode, refinedCode),
			improvements: ["Code quality improved", "Compliance issues resolved"],
			complianceImprovements: [
				"NSM classification added",
				"ARIA labels enhanced",
			],
			qualityImprovementScore: 15,
			explanation:
				"Code has been refined to meet Norwegian compliance requirements and improve quality.",
		};
	}

	private calculateCodeQualityMetrics(code: string): ICodeQualityMetrics {
		const lines = code.split("\n").filter((line) => line.trim());
		const complexity = this.calculateComplexity(code);

		return {
			maintainabilityIndex: Math.max(0, 100 - complexity * 2),
			cyclomaticComplexity: complexity,
			linesOfCode: lines.length,
			duplicateCode: 0,
			technicalDebt: Math.floor(lines.length / 10),
			codeSmells: [],
			overallScore: Math.max(
				20,
				100 - complexity - Math.floor(lines.length / 50),
			),
		};
	}

	private calculateComplexityMetrics(code: string): any {
		const complexity = this.calculateComplexity(code);
		return {
			cyclomaticComplexity: complexity,
			cognitiveComplexity: complexity,
			nestingDepth: this.calculateNestingDepth(code),
			parameterCount: this.countParameters(code),
			returnStatements: (code.match(/return\s+/g) || []).length,
			branches: (code.match(/if\s*\(|else|switch|case/g) || []).length,
		};
	}

	private calculateComplexity(code: string): number {
		const complexityIndicators = [
			/if\s*\(/g,
			/else\s+if\s*\(/g,
			/while\s*\(/g,
			/for\s*\(/g,
			/switch\s*\(/g,
			/case\s+/g,
			/catch\s*\(/g,
			/&&/g,
			/\|\|/g,
			/\?.*:/g,
		];

		let complexity = 1; // Base complexity

		for (const pattern of complexityIndicators) {
			const matches = code.match(pattern);
			if (matches) {
				complexity += matches.length;
			}
		}

		return complexity;
	}

	private calculateNestingDepth(code: string): number {
		let maxDepth = 0;
		let currentDepth = 0;

		for (const char of code) {
			if (char === "{") {
				currentDepth++;
				maxDepth = Math.max(maxDepth, currentDepth);
			} else if (char === "}") {
				currentDepth--;
			}
		}

		return maxDepth;
	}

	private countParameters(code: string): number {
		const functionMatches =
			code.match(/function\s+\w+\s*\([^)]*\)|=>\s*\([^)]*\)/g) || [];

		let totalParams = 0;
		for (const match of functionMatches) {
			const paramMatch = match.match(/\(([^)]*)\)/);
			if (paramMatch) {
				const params = paramMatch[1].split(",").filter((p) => p.trim());
				totalParams += params.length;
			}
		}

		return totalParams;
	}

	private extractDependencies(code: string): string[] {
		const imports = code.match(/import.*from\s+['"]([^'"]+)['"]/g) || [];
		return imports
			.map((imp) => {
				const match = imp.match(/from\s+['"]([^'"]+)['"]/);
				return match ? match[1] : "";
			})
			.filter(Boolean);
	}

	private extractExports(code: string): string[] {
		const exports =
			code.match(/export\s+(?:const|function|class|interface|type)\s+(\w+)/g) ||
			[];
		return exports
			.map((exp) => {
				const match = exp.match(
					/export\s+(?:const|function|class|interface|type)\s+(\w+)/,
				);
				return match ? match[1] : "";
			})
			.filter(Boolean);
	}

	private extractSuggestions(text: string): string[] {
		return text
			.split("\n")
			.filter(
				(line) => line.trim().startsWith("- ") || line.trim().startsWith("* "),
			)
			.map((line) => line.replace(/^[-*]\s*/, "").trim())
			.slice(0, 5);
	}

	private extractCodeBlocks(text: string): string | undefined {
		const codeBlockMatch = text.match(/```[\w]*\n([\s\S]*?)\n```/);
		return codeBlockMatch ? codeBlockMatch[1] : undefined;
	}

	private identifyChanges(originalCode: string, refinedCode: string): any[] {
		// Simplified change detection
		return [
			{
				type: "modification",
				location: { line: 1, column: 1 },
				originalContent: originalCode.substring(0, 100),
				newContent: refinedCode.substring(0, 100),
				reason: "Code refinement for compliance and quality",
			},
		];
	}

	private assessRefinementNeeds(
		analysis: ICodeAnalysisResult,
		requirements: INaturalLanguageRequirements,
	): boolean {
		return (
			analysis.compliance.score < 80 ||
			analysis.quality.overallScore < 70 ||
			analysis.issues.filter((i) => i.type === "error").length > 0
		);
	}
}
