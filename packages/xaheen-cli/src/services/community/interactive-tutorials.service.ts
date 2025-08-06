/**
 * Interactive Tutorials and Walkthroughs Service
 * Provides guided learning experiences and interactive tutorials
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { mkdir, writeFile, readFile, readdir, stat, rm } from "fs/promises";
import { join, basename } from "path";
import { z } from "zod";
import { logger } from "../../utils/logger";

/**
 * Tutorial types
 */
export enum TutorialType {
	QUICK_START = "quick-start",
	DEEP_DIVE = "deep-dive",
	HANDS_ON = "hands-on",
	TROUBLESHOOTING = "troubleshooting",
	BEST_PRACTICES = "best-practices",
	MIGRATION = "migration",
	INTEGRATION = "integration",
}

/**
 * Tutorial difficulty levels
 */
export enum TutorialDifficulty {
	BEGINNER = "beginner",
	INTERMEDIATE = "intermediate",
	ADVANCED = "advanced",
	EXPERT = "expert",
}

/**
 * Step types
 */
export enum StepType {
	INFORMATION = "information",
	ACTION = "action",
	VALIDATION = "validation",
	INTERACTIVE = "interactive",
	QUIZ = "quiz",
	CODE_EXAMPLE = "code-example",
	FILE_OPERATION = "file-operation",
	COMMAND = "command",
}

/**
 * Tutorial step schema
 */
const TutorialStepSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	type: z.nativeEnum(StepType),
	content: z.object({
		text: z.string().optional(),
		code: z.string().optional(),
		language: z.string().optional(),
		command: z.string().optional(),
		expectedOutput: z.string().optional(),
		files: z.array(z.object({
			path: z.string(),
			content: z.string(),
			action: z.enum(["create", "modify", "delete", "read"]),
		})).optional(),
		quiz: z.object({
			question: z.string(),
			options: z.array(z.string()),
			correctAnswer: z.number(),
			explanation: z.string(),
		}).optional(),
		validation: z.object({
			type: z.enum(["file-exists", "command-output", "user-input", "custom"]),
			criteria: z.string(),
			successMessage: z.string(),
			failureMessage: z.string(),
		}).optional(),
		interactive: z.object({
			prompt: z.string(),
			inputType: z.enum(["text", "select", "multiselect", "confirm"]),
			options: z.array(z.string()).optional(),
			validation: z.string().optional(),
		}).optional(),
	}),
	prerequisites: z.array(z.string()).optional(),
	estimatedTime: z.number(), // in minutes
	optional: z.boolean().default(false),
	hints: z.array(z.string()).optional(),
	troubleshooting: z.array(z.object({
		issue: z.string(),
		solution: z.string(),
	})).optional(),
});

export type TutorialStep = z.infer<typeof TutorialStepSchema>;

/**
 * Tutorial metadata schema
 */
const TutorialMetadataSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	type: z.nativeEnum(TutorialType),
	difficulty: z.nativeEnum(TutorialDifficulty),
	category: z.string(),
	tags: z.array(z.string()),
	author: z.object({
		name: z.string(),
		email: z.string().optional(),
		avatar: z.string().optional(),
	}),
	version: z.string(),
	prerequisites: z.array(z.string()),
	learningObjectives: z.array(z.string()),
	estimatedDuration: z.number(), // in minutes
	steps: z.array(TutorialStepSchema),
	resources: z.array(z.object({
		title: z.string(),
		url: z.string(),
		type: z.enum(["documentation", "video", "article", "example"]),
	})).optional(),
	completionCriteria: z.object({
		requiredSteps: z.array(z.string()),
		optionalSteps: z.array(z.string()),
		finalValidation: z.string().optional(),
	}),
	feedback: z.object({
		successMessage: z.string(),
		certificateTemplate: z.string().optional(),
		nextSteps: z.array(z.string()),
	}),
	stats: z.object({
		completions: z.number().default(0),
		averageRating: z.number().default(0),
		averageTime: z.number().default(0),
		dropOffPoints: z.array(z.string()).default([]),
	}),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type TutorialMetadata = z.infer<typeof TutorialMetadataSchema>;

/**
 * Tutorial session state
 */
export interface TutorialSession {
	readonly sessionId: string;
	readonly tutorialId: string;
	readonly userId: string;
	readonly startedAt: string;
	readonly currentStepId: string;
	readonly completedSteps: string[];
	readonly skippedSteps: string[];
	readonly userAnswers: Record<string, any>;
	readonly timeSpent: number; // in milliseconds
	readonly workspacePath: string;
	readonly status: "active" | "completed" | "paused" | "abandoned";
	readonly progress: number; // percentage
	readonly lastActivity: string;
}

/**
 * Tutorial progress
 */
export interface TutorialProgress {
	readonly sessionId: string;
	readonly tutorialId: string;
	readonly currentStep: number;
	readonly totalSteps: number;
	readonly completedSteps: number;
	readonly progress: number;
	readonly timeSpent: number;
	readonly estimatedTimeRemaining: number;
	readonly achievements: string[];
	readonly hints: {
		readonly used: number;
		readonly available: number;
	};
}

/**
 * Interactive tutorials service
 */
export class InteractiveTutorialsService {
	private readonly tutorialsPath: string;
	private readonly sessionsPath: string;
	private readonly workspacePath: string;
	private readonly tutorialsCache: Map<string, TutorialMetadata> = new Map();
	private readonly activeSessions: Map<string, TutorialSession> = new Map();

	constructor(basePath: string = join(process.cwd(), ".xaheen", "tutorials")) {
		this.tutorialsPath = join(basePath, "tutorials");
		this.sessionsPath = join(basePath, "sessions");
		this.workspacePath = join(basePath, "workspace");
	}

	/**
	 * Initialize interactive tutorials service
	 */
	public async initialize(): Promise<void> {
		try {
			// Ensure directories exist
			const directories = [
				this.tutorialsPath,
				this.sessionsPath,
				this.workspacePath,
			];

			for (const dir of directories) {
				if (!existsSync(dir)) {
					await mkdir(dir, { recursive: true });
				}
			}

			// Load tutorials cache
			await this.loadTutorialsCache();

			// Load active sessions
			await this.loadActiveSessions();

			logger.info("Interactive tutorials service initialized");
		} catch (error) {
			logger.error("Failed to initialize interactive tutorials service:", error);
			throw error;
		}
	}

	/**
	 * Get available tutorials
	 */
	public async getTutorials(filters: {
		type?: TutorialType;
		difficulty?: TutorialDifficulty;
		category?: string;
		tags?: string[];
		search?: string;
	} = {}): Promise<TutorialMetadata[]> {
		try {
			let tutorials = Array.from(this.tutorialsCache.values());

			// Apply filters
			if (filters.type) {
				tutorials = tutorials.filter(t => t.type === filters.type);
			}

			if (filters.difficulty) {
				tutorials = tutorials.filter(t => t.difficulty === filters.difficulty);
			}

			if (filters.category) {
				tutorials = tutorials.filter(t => t.category === filters.category);
			}

			if (filters.tags && filters.tags.length > 0) {
				tutorials = tutorials.filter(t =>
					filters.tags!.some(tag => t.tags.includes(tag))
				);
			}

			if (filters.search) {
				const search = filters.search.toLowerCase();
				tutorials = tutorials.filter(t =>
					t.title.toLowerCase().includes(search) ||
					t.description.toLowerCase().includes(search) ||
					t.tags.some(tag => tag.toLowerCase().includes(search))
				);
			}

			// Sort by popularity (completions) and rating
			tutorials.sort((a, b) => {
				const aScore = a.stats.completions * 0.7 + a.stats.averageRating * 0.3;
				const bScore = b.stats.completions * 0.7 + b.stats.averageRating * 0.3;
				return bScore - aScore;
			});

			return tutorials;
		} catch (error) {
			logger.error("Failed to get tutorials:", error);
			return [];
		}
	}

	/**
	 * Start a new tutorial session
	 */
	public async startTutorial(
		tutorialId: string,
		userId: string = "anonymous"
	): Promise<{
		success: boolean;
		sessionId?: string;
		session?: TutorialSession;
		errors: string[];
	}> {
		const result = {
			success: false,
			sessionId: undefined as string | undefined,
			session: undefined as TutorialSession | undefined,
			errors: [] as string[],
		};

		try {
			const tutorial = this.tutorialsCache.get(tutorialId);
			if (!tutorial) {
				result.errors.push("Tutorial not found");
				return result;
			}

			// Check prerequisites
			const prerequisiteCheck = await this.checkPrerequisites(tutorial.prerequisites);
			if (!prerequisiteCheck.satisfied) {
				result.errors.push(`Prerequisites not met: ${prerequisiteCheck.missing.join(", ")}`);
				return result;
			}

			// Create session
			const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const workspacePath = join(this.workspacePath, sessionId);

			await mkdir(workspacePath, { recursive: true });

			const session: TutorialSession = {
				sessionId,
				tutorialId,
				userId,
				startedAt: new Date().toISOString(),
				currentStepId: tutorial.steps[0]?.id || "",
				completedSteps: [],
				skippedSteps: [],
				userAnswers: {},
				timeSpent: 0,
				workspacePath,
				status: "active",
				progress: 0,
				lastActivity: new Date().toISOString(),
			};

			// Save session
			this.activeSessions.set(sessionId, session);
			await this.saveSession(session);

			result.success = true;
			result.sessionId = sessionId;
			result.session = session;

			logger.info(`Tutorial session started: ${sessionId} for tutorial ${tutorialId}`);
		} catch (error) {
			result.errors.push(`Failed to start tutorial: ${error}`);
			logger.error(`Failed to start tutorial ${tutorialId}:`, error);
		}

		return result;
	}

	/**
	 * Get tutorial session progress
	 */
	public async getSessionProgress(sessionId: string): Promise<TutorialProgress | null> {
		try {
			const session = this.activeSessions.get(sessionId);
			if (!session) {
				return null;
			}

			const tutorial = this.tutorialsCache.get(session.tutorialId);
			if (!tutorial) {
				return null;
			}

			const currentStepIndex = tutorial.steps.findIndex(s => s.id === session.currentStepId);
			const progress = session.completedSteps.length / tutorial.steps.length * 100;
			const averageStepTime = tutorial.stats.averageTime / tutorial.steps.length;
			const remainingSteps = tutorial.steps.length - session.completedSteps.length;
			const estimatedTimeRemaining = remainingSteps * averageStepTime;

			return {
				sessionId,
				tutorialId: session.tutorialId,
				currentStep: currentStepIndex + 1,
				totalSteps: tutorial.steps.length,
				completedSteps: session.completedSteps.length,
				progress: Math.round(progress),
				timeSpent: session.timeSpent,
				estimatedTimeRemaining: Math.round(estimatedTimeRemaining),
				achievements: this.calculateAchievements(session, tutorial),
				hints: {
					used: this.countHintsUsed(session),
					available: this.countAvailableHints(tutorial, session.currentStepId),
				},
			};
		} catch (error) {
			logger.error(`Failed to get session progress for ${sessionId}:`, error);
			return null;
		}
	}

	/**
	 * Execute tutorial step
	 */
	public async executeStep(
		sessionId: string,
		stepId: string,
		userInput?: any
	): Promise<{
		success: boolean;
		stepResult?: any;
		nextStep?: TutorialStep;
		completed?: boolean;
		errors: string[];
		warnings: string[];
	}> {
		const result = {
			success: false,
			stepResult: undefined as any,
			nextStep: undefined as TutorialStep | undefined,
			completed: false,
			errors: [] as string[],
			warnings: [] as string[],
		};

		try {
			const session = this.activeSessions.get(sessionId);
			if (!session) {
				result.errors.push("Session not found");
				return result;
			}

			const tutorial = this.tutorialsCache.get(session.tutorialId);
			if (!tutorial) {
				result.errors.push("Tutorial not found");
				return result;
			}

			const step = tutorial.steps.find(s => s.id === stepId);
			if (!step) {
				result.errors.push("Step not found");
				return result;
			}

			// Execute step based on type
			const stepResult = await this.executeStepByType(step, session, userInput);

			if (stepResult.success) {
				// Mark step as completed
				if (!session.completedSteps.includes(stepId)) {
					session.completedSteps.push(stepId);
				}

				// Store user answers
				if (userInput !== undefined) {
					session.userAnswers[stepId] = userInput;
				}

				// Find next step
				const currentIndex = tutorial.steps.findIndex(s => s.id === stepId);
				const nextIndex = currentIndex + 1;

				if (nextIndex < tutorial.steps.length) {
					const nextStep = tutorial.steps[nextIndex];
					session.currentStepId = nextStep.id;
					result.nextStep = nextStep;
				} else {
					// Tutorial completed
					session.status = "completed";
					result.completed = true;
					
					// Update tutorial stats
					tutorial.stats.completions++;
					await this.saveTutorial(tutorial);
				}

				// Update session
				session.progress = (session.completedSteps.length / tutorial.steps.length) * 100;
				session.lastActivity = new Date().toISOString();

				// Save updated session
				this.activeSessions.set(sessionId, session);
				await this.saveSession(session);

				result.success = true;
				result.stepResult = stepResult.result;

				if (stepResult.warnings) {
					result.warnings = stepResult.warnings;
				}
			} else {
				result.errors = stepResult.errors || ["Step execution failed"];
			}

		} catch (error) {
			result.errors.push(`Step execution failed: ${error}`);
			logger.error(`Failed to execute step ${stepId} in session ${sessionId}:`, error);
		}

		return result;
	}

	/**
	 * Get hint for current step
	 */
	public async getStepHint(
		sessionId: string,
		stepId: string
	): Promise<{
		success: boolean;
		hint?: string;
		hintsRemaining: number;
		errors: string[];
	}> {
		const result = {
			success: false,
			hint: undefined as string | undefined,
			hintsRemaining: 0,
			errors: [] as string[],
		};

		try {
			const session = this.activeSessions.get(sessionId);
			if (!session) {
				result.errors.push("Session not found");
				return result;
			}

			const tutorial = this.tutorialsCache.get(session.tutorialId);
			if (!tutorial) {
				result.errors.push("Tutorial not found");
				return result;
			}

			const step = tutorial.steps.find(s => s.id === stepId);
			if (!step || !step.hints || step.hints.length === 0) {
				result.errors.push("No hints available for this step");
				return result;
			}

			// Track hint usage
			const hintKey = `hints_${stepId}`;
			const hintsUsed = session.userAnswers[hintKey] || 0;

			if (hintsUsed >= step.hints.length) {
				result.errors.push("All hints for this step have been used");
				return result;
			}

			// Return next hint
			result.hint = step.hints[hintsUsed];
			result.hintsRemaining = step.hints.length - hintsUsed - 1;
			result.success = true;

			// Update hint usage
			session.userAnswers[hintKey] = hintsUsed + 1;
			session.lastActivity = new Date().toISOString();

			// Save session
			this.activeSessions.set(sessionId, session);
			await this.saveSession(session);

		} catch (error) {
			result.errors.push(`Failed to get hint: ${error}`);
			logger.error(`Failed to get hint for step ${stepId}:`, error);
		}

		return result;
	}

	/**
	 * Skip tutorial step
	 */
	public async skipStep(
		sessionId: string,
		stepId: string,
		reason?: string
	): Promise<{
		success: boolean;
		nextStep?: TutorialStep;
		errors: string[];
	}> {
		const result = {
			success: false,
			nextStep: undefined as TutorialStep | undefined,
			errors: [] as string[],
		};

		try {
			const session = this.activeSessions.get(sessionId);
			if (!session) {
				result.errors.push("Session not found");
				return result;
			}

			const tutorial = this.tutorialsCache.get(session.tutorialId);
			if (!tutorial) {
				result.errors.push("Tutorial not found");
				return result;
			}

			const step = tutorial.steps.find(s => s.id === stepId);
			if (!step) {
				result.errors.push("Step not found");
				return result;
			}

			// Check if step can be skipped
			if (!step.optional) {
				result.errors.push("This step is required and cannot be skipped");
				return result;
			}

			// Mark step as skipped
			if (!session.skippedSteps.includes(stepId)) {
				session.skippedSteps.push(stepId);
			}

			// Store skip reason
			if (reason) {
				session.userAnswers[`skip_${stepId}`] = reason;
			}

			// Find next step
			const currentIndex = tutorial.steps.findIndex(s => s.id === stepId);
			const nextIndex = currentIndex + 1;

			if (nextIndex < tutorial.steps.length) {
				const nextStep = tutorial.steps[nextIndex];
				session.currentStepId = nextStep.id;
				result.nextStep = nextStep;
			}

			// Update session
			session.lastActivity = new Date().toISOString();

			// Save session
			this.activeSessions.set(sessionId, session);
			await this.saveSession(session);

			result.success = true;

		} catch (error) {
			result.errors.push(`Failed to skip step: ${error}`);
			logger.error(`Failed to skip step ${stepId}:`, error);
		}

		return result;
	}

	/**
	 * Pause tutorial session
	 */
	public async pauseSession(sessionId: string): Promise<{
		success: boolean;
		errors: string[];
	}> {
		const result = {
			success: false,
			errors: [] as string[],
		};

		try {
			const session = this.activeSessions.get(sessionId);
			if (!session) {
				result.errors.push("Session not found");
				return result;
			}

			session.status = "paused";
			session.lastActivity = new Date().toISOString();

			// Save session
			this.activeSessions.set(sessionId, session);
			await this.saveSession(session);

			result.success = true;

			logger.info(`Tutorial session paused: ${sessionId}`);
		} catch (error) {
			result.errors.push(`Failed to pause session: ${error}`);
			logger.error(`Failed to pause session ${sessionId}:`, error);
		}

		return result;
	}

	/**
	 * Resume tutorial session
	 */
	public async resumeSession(sessionId: string): Promise<{
		success: boolean;
		currentStep?: TutorialStep;
		errors: string[];
	}> {
		const result = {
			success: false,
			currentStep: undefined as TutorialStep | undefined,
			errors: [] as string[],
		};

		try {
			const session = this.activeSessions.get(sessionId);
			if (!session) {
				result.errors.push("Session not found");
				return result;
			}

			const tutorial = this.tutorialsCache.get(session.tutorialId);
			if (!tutorial) {
				result.errors.push("Tutorial not found");
				return result;
			}

			session.status = "active";
			session.lastActivity = new Date().toISOString();

			// Get current step
			const currentStep = tutorial.steps.find(s => s.id === session.currentStepId);
			if (currentStep) {
				result.currentStep = currentStep;
			}

			// Save session
			this.activeSessions.set(sessionId, session);
			await this.saveSession(session);

			result.success = true;

			logger.info(`Tutorial session resumed: ${sessionId}`);
		} catch (error) {
			result.errors.push(`Failed to resume session: ${error}`);
			logger.error(`Failed to resume session ${sessionId}:`, error);
		}

		return result;
	}

	/**
	 * Get tutorial recommendations based on user progress and preferences
	 */
	public async getRecommendations(
		userId: string,
		preferences: {
			difficulty?: TutorialDifficulty;
			topics?: string[];
			timeAvailable?: number; // in minutes
		} = {}
	): Promise<{
		beginner: TutorialMetadata[];
		continueWhere: TutorialMetadata[];
		recommended: TutorialMetadata[];
		trending: TutorialMetadata[];
	}> {
		try {
			const tutorials = Array.from(this.tutorialsCache.values());
			const userSessions = await this.getUserSessions(userId);

			// Beginner tutorials
			const beginner = tutorials
				.filter(t => t.difficulty === TutorialDifficulty.BEGINNER)
				.slice(0, 5);

			// Continue where left off
			const continueWhere = tutorials
				.filter(t => userSessions.some(s => 
					s.tutorialId === t.id && 
					s.status === "paused" && 
					s.progress < 100
				))
				.slice(0, 3);

			// Recommended based on preferences and completion history
			let recommended = tutorials.filter(t => {
				if (preferences.difficulty && t.difficulty !== preferences.difficulty) {
					return false;
				}

				if (preferences.topics && preferences.topics.length > 0) {
					const hasMatchingTopic = preferences.topics.some(topic =>
						t.tags.includes(topic) || t.category === topic
					);
					if (!hasMatchingTopic) {
						return false;
					}
				}

				if (preferences.timeAvailable && t.estimatedDuration > preferences.timeAvailable) {
					return false;
				}

				// Exclude already completed tutorials
				const isCompleted = userSessions.some(s => 
					s.tutorialId === t.id && s.status === "completed"
				);
				if (isCompleted) {
					return false;
				}

				return true;
			});

			// Sort by rating and completions
			recommended.sort((a, b) => {
				const aScore = a.stats.averageRating * 0.6 + (a.stats.completions / 100) * 0.4;
				const bScore = b.stats.averageRating * 0.6 + (b.stats.completions / 100) * 0.4;
				return bScore - aScore;
			});

			recommended = recommended.slice(0, 10);

			// Trending tutorials
			const trending = tutorials
				.filter(t => {
					const recentCompletions = this.calculateRecentCompletions(t);
					return recentCompletions > 5; // At least 5 completions in recent period
				})
				.sort((a, b) => this.calculateTrendingScore(b) - this.calculateTrendingScore(a))
				.slice(0, 5);

			return {
				beginner,
				continueWhere,
				recommended,
				trending,
			};

		} catch (error) {
			logger.error(`Failed to get recommendations for user ${userId}:`, error);
			return {
				beginner: [],
				continueWhere: [],
				recommended: [],
				trending: [],
			};
		}
	}

	// Private helper methods

	private async loadTutorialsCache(): Promise<void> {
		try {
			if (existsSync(this.tutorialsPath)) {
				const tutorialFiles = await readdir(this.tutorialsPath);

				for (const file of tutorialFiles) {
					if (file.endsWith(".json")) {
						const content = await readFile(join(this.tutorialsPath, file), "utf-8");
						const tutorial = TutorialMetadataSchema.parse(JSON.parse(content));
						this.tutorialsCache.set(tutorial.id, tutorial);
					}
				}
			}

			// Load mock data if cache is empty
			if (this.tutorialsCache.size === 0) {
				await this.loadMockTutorials();
			}

		} catch (error) {
			logger.warn("Failed to load tutorials cache:", error);
			await this.loadMockTutorials();
		}
	}

	private async loadActiveSessions(): Promise<void> {
		try {
			if (existsSync(this.sessionsPath)) {
				const sessionFiles = await readdir(this.sessionsPath);

				for (const file of sessionFiles) {
					if (file.endsWith(".json")) {
						const content = await readFile(join(this.sessionsPath, file), "utf-8");
						const session = JSON.parse(content);
						
						// Only load active or paused sessions
						if (session.status === "active" || session.status === "paused") {
							this.activeSessions.set(session.sessionId, session);
						}
					}
				}
			}
		} catch (error) {
			logger.warn("Failed to load active sessions:", error);
		}
	}

	private async checkPrerequisites(prerequisites: string[]): Promise<{
		satisfied: boolean;
		missing: string[];
	}> {
		const missing: string[] = [];

		for (const prerequisite of prerequisites) {
			try {
				// Check if prerequisite is satisfied (simplified check)
				if (prerequisite.startsWith("node")) {
					// Check Node.js version
					const nodeVersion = process.version;
					const requiredVersion = prerequisite.replace("node>=", "");
					// Simplified version check
					if (nodeVersion < `v${requiredVersion}`) {
						missing.push(prerequisite);
					}
				} else if (prerequisite.startsWith("xaheen")) {
					// Check Xaheen CLI version
					// This would normally check the actual CLI version
					// For now, assume it's satisfied
				} else {
					// Check for other tools/commands
					try {
						execSync(`which ${prerequisite}`, { stdio: "pipe" });
					} catch {
						missing.push(prerequisite);
					}
				}
			} catch (error) {
				missing.push(prerequisite);
			}
		}

		return {
			satisfied: missing.length === 0,
			missing,
		};
	}

	private async executeStepByType(
		step: TutorialStep,
		session: TutorialSession,
		userInput?: any
	): Promise<{
		success: boolean;
		result?: any;
		errors?: string[];
		warnings?: string[];
	}> {
		try {
			switch (step.type) {
				case StepType.INFORMATION:
					return { success: true, result: { read: true } };

				case StepType.ACTION:
					return await this.executeActionStep(step, session);

				case StepType.VALIDATION:
					return await this.executeValidationStep(step, session);

				case StepType.INTERACTIVE:
					return await this.executeInteractiveStep(step, session, userInput);

				case StepType.QUIZ:
					return await this.executeQuizStep(step, session, userInput);

				case StepType.CODE_EXAMPLE:
					return await this.executeCodeExampleStep(step, session);

				case StepType.FILE_OPERATION:
					return await this.executeFileOperationStep(step, session);

				case StepType.COMMAND:
					return await this.executeCommandStep(step, session);

				default:
					return {
						success: false,
						errors: [`Unsupported step type: ${step.type}`],
					};
			}
		} catch (error) {
			return {
				success: false,
				errors: [`Step execution failed: ${error}`],
			};
		}
	}

	private async executeActionStep(
		step: TutorialStep,
		session: TutorialSession
	): Promise<{ success: boolean; result?: any; errors?: string[] }> {
		// Execute action steps (user-driven actions)
		return { success: true, result: { actionCompleted: true } };
	}

	private async executeValidationStep(
		step: TutorialStep,
		session: TutorialSession
	): Promise<{ success: boolean; result?: any; errors?: string[] }> {
		if (!step.content.validation) {
			return { success: false, errors: ["No validation criteria defined"] };
		}

		const validation = step.content.validation;

		try {
			let isValid = false;

			switch (validation.type) {
				case "file-exists":
					const filePath = join(session.workspacePath, validation.criteria);
					isValid = existsSync(filePath);
					break;

				case "command-output":
					try {
						const output = execSync(validation.criteria, {
							cwd: session.workspacePath,
							encoding: "utf-8",
						});
						isValid = output.trim().length > 0;
					} catch {
						isValid = false;
					}
					break;

				case "user-input":
					// This would be handled by the CLI interface
					isValid = true;
					break;

				case "custom":
					// Custom validation logic would go here
					isValid = true;
					break;
			}

			return {
				success: isValid,
				result: {
					valid: isValid,
					message: isValid ? validation.successMessage : validation.failureMessage,
				},
				errors: isValid ? [] : [validation.failureMessage],
			};

		} catch (error) {
			return {
				success: false,
				errors: [`Validation failed: ${error}`],
			};
		}
	}

	private async executeInteractiveStep(
		step: TutorialStep,
		session: TutorialSession,
		userInput?: any
	): Promise<{ success: boolean; result?: any; errors?: string[] }> {
		if (!step.content.interactive) {
			return { success: false, errors: ["No interactive content defined"] };
		}

		const interactive = step.content.interactive;

		// Validate user input based on input type
		if (userInput === undefined) {
			return { success: false, errors: ["User input required"] };
		}

		let isValid = true;
		const errors: string[] = [];

		switch (interactive.inputType) {
			case "text":
				if (typeof userInput !== "string" || userInput.trim().length === 0) {
					isValid = false;
					errors.push("Text input is required");
				}
				break;

			case "select":
				if (!interactive.options || !interactive.options.includes(userInput)) {
					isValid = false;
					errors.push("Invalid selection");
				}
				break;

			case "multiselect":
				if (!Array.isArray(userInput) || userInput.length === 0) {
					isValid = false;
					errors.push("At least one selection is required");
				}
				break;

			case "confirm":
				if (typeof userInput !== "boolean") {
					isValid = false;
					errors.push("Confirmation required");
				}
				break;
		}

		// Apply custom validation if defined
		if (isValid && interactive.validation) {
			try {
				const regex = new RegExp(interactive.validation);
				if (typeof userInput === "string" && !regex.test(userInput)) {
					isValid = false;
					errors.push("Input does not match required format");
				}
			} catch {
				// Invalid regex, skip validation
			}
		}

		return {
			success: isValid,
			result: { userInput, valid: isValid },
			errors: isValid ? [] : errors,
		};
	}

	private async executeQuizStep(
		step: TutorialStep,
		session: TutorialSession,
		userInput?: any
	): Promise<{ success: boolean; result?: any; errors?: string[] }> {
		if (!step.content.quiz) {
			return { success: false, errors: ["No quiz content defined"] };
		}

		const quiz = step.content.quiz;

		if (typeof userInput !== "number" || userInput < 0 || userInput >= quiz.options.length) {
			return { success: false, errors: ["Invalid answer selection"] };
		}

		const isCorrect = userInput === quiz.correctAnswer;

		return {
			success: true,
			result: {
				correct: isCorrect,
				selectedAnswer: userInput,
				correctAnswer: quiz.correctAnswer,
				explanation: quiz.explanation,
			},
		};
	}

	private async executeCodeExampleStep(
		step: TutorialStep,
		session: TutorialSession
	): Promise<{ success: boolean; result?: any; errors?: string[] }> {
		// Code example steps are informational
		return {
			success: true,
			result: {
				code: step.content.code,
				language: step.content.language,
			},
		};
	}

	private async executeFileOperationStep(
		step: TutorialStep,
		session: TutorialSession
	): Promise<{ success: boolean; result?: any; errors?: string[] }> {
		if (!step.content.files || step.content.files.length === 0) {
			return { success: false, errors: ["No file operations defined"] };
		}

		const results = [];
		const errors = [];

		for (const fileOp of step.content.files) {
			try {
				const fullPath = join(session.workspacePath, fileOp.path);

				switch (fileOp.action) {
					case "create":
						await writeFile(fullPath, fileOp.content);
						results.push({ action: "create", path: fileOp.path, success: true });
						break;

					case "modify":
						if (existsSync(fullPath)) {
							await writeFile(fullPath, fileOp.content);
							results.push({ action: "modify", path: fileOp.path, success: true });
						} else {
							errors.push(`File not found for modification: ${fileOp.path}`);
						}
						break;

					case "delete":
						if (existsSync(fullPath)) {
							await rm(fullPath);
							results.push({ action: "delete", path: fileOp.path, success: true });
						} else {
							errors.push(`File not found for deletion: ${fileOp.path}`);
						}
						break;

					case "read":
						if (existsSync(fullPath)) {
							const content = await readFile(fullPath, "utf-8");
							results.push({ action: "read", path: fileOp.path, content, success: true });
						} else {
							errors.push(`File not found for reading: ${fileOp.path}`);
						}
						break;
				}
			} catch (error) {
				errors.push(`File operation failed for ${fileOp.path}: ${error}`);
			}
		}

		return {
			success: errors.length === 0,
			result: { operations: results },
			errors: errors.length > 0 ? errors : undefined,
		};
	}

	private async executeCommandStep(
		step: TutorialStep,
		session: TutorialSession
	): Promise<{ success: boolean; result?: any; errors?: string[]; warnings?: string[] }> {
		if (!step.content.command) {
			return { success: false, errors: ["No command defined"] };
		}

		try {
			const output = execSync(step.content.command, {
				cwd: session.workspacePath,
				encoding: "utf-8",
			});

			const success = step.content.expectedOutput
				? output.includes(step.content.expectedOutput)
				: true;

			return {
				success,
				result: {
					command: step.content.command,
					output,
					expectedOutput: step.content.expectedOutput,
				},
				warnings: success ? [] : ["Command output did not match expected result"],
			};

		} catch (error: any) {
			return {
				success: false,
				result: {
					command: step.content.command,
					output: error.stdout || "",
					error: error.message,
				},
				errors: [`Command execution failed: ${error.message}`],
			};
		}
	}

	private calculateAchievements(session: TutorialSession, tutorial: TutorialMetadata): string[] {
		const achievements: string[] = [];

		// Speed achievements
		const expectedTime = tutorial.estimatedDuration * 60 * 1000; // Convert to milliseconds
		if (session.timeSpent < expectedTime * 0.8) {
			achievements.push("Speed Learner");
		}

		// Completion achievements
		const completionRate = session.completedSteps.length / tutorial.steps.length;
		if (completionRate >= 0.5) {
			achievements.push("Halfway There");
		}
		if (completionRate >= 1.0) {
			achievements.push("Tutorial Master");
		}

		// Hint usage achievements
		const hintsUsed = this.countHintsUsed(session);
		if (hintsUsed === 0 && session.completedSteps.length > 0) {
			achievements.push("Self-Reliant");
		}

		return achievements;
	}

	private countHintsUsed(session: TutorialSession): number {
		let totalHints = 0;
		for (const [key, value] of Object.entries(session.userAnswers)) {
			if (key.startsWith("hints_") && typeof value === "number") {
				totalHints += value;
			}
		}
		return totalHints;
	}

	private countAvailableHints(tutorial: TutorialMetadata, currentStepId: string): number {
		const currentStep = tutorial.steps.find(s => s.id === currentStepId);
		return currentStep?.hints?.length || 0;
	}

	private async saveSession(session: TutorialSession): Promise<void> {
		const sessionPath = join(this.sessionsPath, `${session.sessionId}.json`);
		await writeFile(sessionPath, JSON.stringify(session, null, 2));
	}

	private async saveTutorial(tutorial: TutorialMetadata): Promise<void> {
		const tutorialPath = join(this.tutorialsPath, `${tutorial.id}.json`);
		await writeFile(tutorialPath, JSON.stringify(tutorial, null, 2));
		this.tutorialsCache.set(tutorial.id, tutorial);
	}

	private async getUserSessions(userId: string): Promise<TutorialSession[]> {
		// This would normally query a database
		// For now, return sessions from memory
		return Array.from(this.activeSessions.values()).filter(s => s.userId === userId);
	}

	private calculateRecentCompletions(tutorial: TutorialMetadata): number {
		// Mock calculation - in practice, this would query recent completion data
		return Math.floor(Math.random() * 20);
	}

	private calculateTrendingScore(tutorial: TutorialMetadata): number {
		const recentCompletions = this.calculateRecentCompletions(tutorial);
		const ratingScore = tutorial.stats.averageRating * 10;
		const popularityScore = tutorial.stats.completions * 0.1;
		
		return recentCompletions * 0.5 + ratingScore * 0.3 + popularityScore * 0.2;
	}

	private async loadMockTutorials(): Promise<void> {
		// Load comprehensive mock tutorial data
		const mockTutorials: TutorialMetadata[] = [
			{
				id: "getting-started-with-xaheen",
				title: "Getting Started with Xaheen CLI",
				description: "Learn the basics of Xaheen CLI and create your first project",
				type: TutorialType.QUICK_START,
				difficulty: TutorialDifficulty.BEGINNER,
				category: "fundamentals",
				tags: ["cli", "basics", "quickstart"],
				author: {
					name: "Xala Technologies",
					email: "tutorials@xala.com",
					avatar: "https://avatars.xala.com/xala.png",
				},
				version: "1.0.0",
				prerequisites: ["node>=18.0.0"],
				learningObjectives: [
					"Install and configure Xaheen CLI",
					"Understand basic CLI commands",
					"Create your first project",
					"Explore project structure",
				],
				estimatedDuration: 15,
				steps: [
					{
						id: "install-cli",
						title: "Install Xaheen CLI",
						description: "Install the Xaheen CLI globally on your system",
						type: StepType.COMMAND,
						content: {
							text: "First, we need to install the Xaheen CLI globally using npm.",
							command: "npm install -g @xala-technologies/xaheen-cli",
							expectedOutput: "successfully installed",
						},
						estimatedTime: 2,
						hints: [
							"Make sure you have Node.js installed first",
							"You might need to use sudo on macOS/Linux",
						],
					},
					{
						id: "verify-installation",
						title: "Verify Installation",
						description: "Check that the CLI was installed correctly",
						type: StepType.VALIDATION,
						content: {
							validation: {
								type: "command-output",
								criteria: "xaheen --version",
								successMessage: "Xaheen CLI is installed correctly!",
								failureMessage: "Installation verification failed. Please try installing again.",
							},
						},
						estimatedTime: 1,
					},
					{
						id: "create-project",
						title: "Create Your First Project",
						description: "Create a new React application using Xaheen CLI",
						type: StepType.INTERACTIVE,
						content: {
							text: "Now let's create your first project. What would you like to name it?",
							interactive: {
								prompt: "Enter a project name:",
								inputType: "text",
								validation: "^[a-z0-9-]+$",
							},
						},
						estimatedTime: 3,
						hints: [
							"Use lowercase letters, numbers, and hyphens only",
							"Choose a descriptive name for your project",
						],
					},
					{
						id: "explore-structure",
						title: "Explore Project Structure",
						description: "Learn about the generated project structure",
						type: StepType.INFORMATION,
						content: {
							text: `Great! Your project has been created. Let's explore the structure:

- \`src/\` - Your application source code
- \`public/\` - Static assets
- \`package.json\` - Project dependencies and scripts
- \`README.md\` - Project documentation
- \`tsconfig.json\` - TypeScript configuration

This structure follows industry best practices and is optimized for scalability.`,
						},
						estimatedTime: 5,
					},
					{
						id: "run-development-server",
						title: "Start Development Server",
						description: "Run your project in development mode",
						type: StepType.COMMAND,
						content: {
							text: "Let's start the development server to see your project in action.",
							command: "cd {{projectName}} && npm run dev",
							expectedOutput: "Local:",
						},
						estimatedTime: 2,
					},
					{
						id: "quiz-basics",
						title: "Quick Quiz",
						description: "Test your understanding of the basics",
						type: StepType.QUIZ,
						content: {
							quiz: {
								question: "What command is used to create a new Xaheen project?",
								options: [
									"xaheen new",
									"xaheen create",
									"xaheen init",
									"xaheen generate",
								],
								correctAnswer: 1,
								explanation: "The 'xaheen create' command is used to create new projects with various templates and configurations.",
							},
						},
						estimatedTime: 2,
					},
				],
				resources: [
					{
						title: "Xaheen CLI Documentation",
						url: "https://docs.xaheen.com/cli",
						type: "documentation",
					},
					{
						title: "Video Tutorial: Getting Started",
						url: "https://www.youtube.com/watch?v=example",
						type: "video",
					},
				],
				completionCriteria: {
					requiredSteps: ["install-cli", "verify-installation", "create-project", "run-development-server"],
					optionalSteps: ["quiz-basics"],
				},
				feedback: {
					successMessage: "Congratulations! You've successfully completed the Getting Started tutorial. You're now ready to build amazing applications with Xaheen CLI!",
					nextSteps: [
						"Try the React Component Development tutorial",
						"Explore the Template Gallery",
						"Join our community Discord",
					],
				},
				stats: {
					completions: 1250,
					averageRating: 4.8,
					averageTime: 18,
					dropOffPoints: ["create-project"],
				},
				createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
				updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
			},
			{
				id: "react-component-development",
				title: "React Component Development",
				description: "Master React component development with TypeScript and best practices",
				type: TutorialType.HANDS_ON,
				difficulty: TutorialDifficulty.INTERMEDIATE,
				category: "react",
				tags: ["react", "components", "typescript", "development"],
				author: {
					name: "React Team",
					email: "react@xala.com",
				},
				version: "2.1.0",
				prerequisites: ["getting-started-with-xaheen", "react-basics"],
				learningObjectives: [
					"Create reusable React components",
					"Implement proper TypeScript typing",
					"Follow component best practices",
					"Test components effectively",
				],
				estimatedDuration: 45,
				steps: [
					{
						id: "setup-component-project",
						title: "Set Up Component Project",
						description: "Create a new project specifically for component development",
						type: StepType.COMMAND,
						content: {
							command: "xaheen create component-library --template=react-components",
						},
						estimatedTime: 3,
					},
					{
						id: "create-button-component",
						title: "Create Button Component",
						description: "Build a reusable button component with TypeScript",
						type: StepType.FILE_OPERATION,
						content: {
							files: [
								{
									path: "src/components/Button/Button.tsx",
									action: "create",
									content: `import React from 'react';

interface ButtonProps {
  readonly children: React.ReactNode;
  readonly variant?: 'primary' | 'secondary' | 'danger';
  readonly size?: 'small' | 'medium' | 'large';
  readonly disabled?: boolean;
  readonly onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  
  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  const classes = \`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]} \${disabledClasses}\`;
  
  return (
    <button
      className={classes}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
};`,
								},
							],
						},
						estimatedTime: 10,
					},
					{
						id: "component-quiz",
						title: "Component Architecture Quiz",
						description: "Test your understanding of React component patterns",
						type: StepType.QUIZ,
						content: {
							quiz: {
								question: "What is the benefit of using TypeScript interfaces for props?",
								options: [
									"Better performance",
									"Type safety and IntelliSense",
									"Smaller bundle size",
									"Faster compilation",
								],
								correctAnswer: 1,
								explanation: "TypeScript interfaces provide type safety, catching errors at compile time, and enable better IntelliSense in your IDE.",
							},
						},
						estimatedTime: 2,
					},
				],
				resources: [
					{
						title: "React TypeScript Best Practices",
						url: "https://docs.xaheen.com/react/typescript",
						type: "documentation",
					},
				],
				completionCriteria: {
					requiredSteps: ["setup-component-project", "create-button-component"],
					optionalSteps: ["component-quiz"],
				},
				feedback: {
					successMessage: "Excellent! You've learned the fundamentals of React component development with TypeScript.",
					nextSteps: [
						"Learn about React Hooks",
						"Explore Component Testing",
						"Build a complete component library",
					],
				},
				stats: {
					completions: 850,
					averageRating: 4.6,
					averageTime: 42,
					dropOffPoints: ["create-button-component"],
				},
				createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
				updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
			},
		];

		// Load mock tutorials into cache
		for (const tutorial of mockTutorials) {
			this.tutorialsCache.set(tutorial.id, tutorial);
		}

		// Save to storage
		for (const tutorial of mockTutorials) {
			await this.saveTutorial(tutorial);
		}
	}
}

/**
 * Create interactive tutorials service instance
 */
export function createInteractiveTutorialsService(basePath?: string): InteractiveTutorialsService {
	return new InteractiveTutorialsService(basePath);
}

/**
 * Default export
 */
export default InteractiveTutorialsService;