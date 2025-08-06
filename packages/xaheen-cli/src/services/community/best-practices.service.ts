/**
 * Best Practices Documentation Service
 * Provides comprehensive best practices, guidelines, and standards documentation
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { existsSync } from "fs";
import { mkdir, writeFile, readFile, readdir } from "fs/promises";
import { join } from "path";
import { z } from "zod";
import { logger } from "../../utils/logger";

/**
 * Best practice categories
 */
export enum BestPracticeCategory {
	ARCHITECTURE = "architecture",
	SECURITY = "security",
	PERFORMANCE = "performance",
	ACCESSIBILITY = "accessibility",
	TESTING = "testing",
	CODE_QUALITY = "code-quality",
	DEPLOYMENT = "deployment",
	MONITORING = "monitoring",
	DOCUMENTATION = "documentation",
	COLLABORATION = "collaboration",
	NORWEGIAN_COMPLIANCE = "norwegian-compliance",
	DESIGN_SYSTEMS = "design-systems",
}

/**
 * Content types
 */
export enum ContentType {
	GUIDELINE = "guideline",
	CHECKLIST = "checklist",
	PATTERN = "pattern",
	ANTI_PATTERN = "anti-pattern",
	EXAMPLE = "example",
	TEMPLATE = "template",
	RECIPE = "recipe",
	STANDARD = "standard",
}

/**
 * Difficulty levels
 */
export enum DifficultyLevel {
	BEGINNER = "beginner",
	INTERMEDIATE = "intermediate",
	ADVANCED = "advanced",
	EXPERT = "expert",
}

/**
 * Best practice content schema
 */
const BestPracticeContentSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	category: z.nativeEnum(BestPracticeCategory),
	type: z.nativeEnum(ContentType),
	difficulty: z.nativeEnum(DifficultyLevel),
	tags: z.array(z.string()),
	
	// Content
	content: z.object({
		summary: z.string(),
		sections: z.array(z.object({
			title: z.string(),
			content: z.string(),
			codeExamples: z.array(z.object({
				title: z.string(),
				language: z.string(),
				code: z.string(),
				explanation: z.string().optional(),
			})).optional(),
			images: z.array(z.object({
				url: z.string(),
				alt: z.string(),
				caption: z.string().optional(),
			})).optional(),
		})),
		keyTakeaways: z.array(z.string()),
		dosList: z.array(z.string()).optional(),
		dontsList: z.array(z.string()).optional(),
		commonMistakes: z.array(z.object({
			mistake: z.string(),
			consequence: z.string(),
			solution: z.string(),
		})).optional(),
		checklist: z.array(z.object({
			item: z.string(),
			required: z.boolean(),
			description: z.string().optional(),
		})).optional(),
	}),
	
	// Metadata
	author: z.object({
		name: z.string(),
		role: z.string(),
		avatar: z.string().url().optional(),
	}),
	
	// References and links
	relatedPractices: z.array(z.string()).default([]), // IDs of related practices
	externalLinks: z.array(z.object({
		title: z.string(),
		url: z.string().url(),
		description: z.string().optional(),
	})).optional(),
	tools: z.array(z.object({
		name: z.string(),
		url: z.string().url(),
		description: z.string(),
	})).optional(),
	
	// Compliance and standards
	complianceStandards: z.array(z.string()).optional(), // e.g., ["NSM", "GDPR", "WCAG"]
	frameworks: z.array(z.string()).optional(), // Applicable frameworks
	
	// Engagement metrics
	stats: z.object({
		views: z.number().default(0),
		likes: z.number().default(0),
		bookmarks: z.number().default(0),
		shares: z.number().default(0),
		rating: z.number().min(0).max(5).default(0),
		ratingCount: z.number().default(0),
	}),
	
	// Timestamps
	createdAt: z.string(),
	updatedAt: z.string(),
	lastReviewedAt: z.string().optional(),
});

export type BestPracticeContent = z.infer<typeof BestPracticeContentSchema>;

/**
 * Search filters
 */
export interface BestPracticeFilters {
	readonly query?: string;
	readonly category?: BestPracticeCategory;
	readonly type?: ContentType;
	readonly difficulty?: DifficultyLevel;
	readonly tags?: string[];
	readonly frameworks?: string[];
	readonly complianceStandards?: string[];
	readonly sortBy?: "relevance" | "popularity" | "recent" | "rating";
	readonly limit?: number;
	readonly offset?: number;
}

/**
 * Learning path
 */
export interface LearningPath {
	readonly id: string;
	readonly title: string;
	readonly description: string;
	readonly category: BestPracticeCategory;
	readonly difficulty: DifficultyLevel;
	readonly estimatedDuration: number; // in minutes
	readonly practices: Array<{
		readonly practiceId: string;
		readonly order: number;
		readonly required: boolean;
	}>;
	readonly prerequisites: string[];
	readonly outcomes: string[];
	readonly createdAt: string;
	readonly updatedAt: string;
}

/**
 * User progress tracking
 */
export interface UserProgress {
	readonly userId: string;
	readonly practiceId: string;
	readonly status: "not-started" | "in-progress" | "completed" | "bookmarked";
	readonly progress: number; // percentage
	readonly timeSpent: number; // in minutes
	readonly lastAccessed: string;
	readonly completedAt?: string;
	readonly rating?: number;
	readonly feedback?: string;
}

/**
 * Best practices documentation service
 */
export class BestPracticesService {
	private readonly practicesPath: string;
	private readonly learningPathsPath: string;
	private readonly progressPath: string;
	private readonly templatesPath: string;
	private readonly practicesCache: Map<string, BestPracticeContent> = new Map();
	private readonly learningPathsCache: Map<string, LearningPath> = new Map();
	private readonly progressCache: Map<string, UserProgress[]> = new Map();

	constructor(basePath: string = join(process.cwd(), ".xaheen", "best-practices")) {
		this.practicesPath = join(basePath, "practices");
		this.learningPathsPath = join(basePath, "learning-paths");
		this.progressPath = join(basePath, "progress");
		this.templatesPath = join(basePath, "templates");
	}

	/**
	 * Initialize best practices service
	 */
	public async initialize(): Promise<void> {
		try {
			// Ensure directories exist
			const directories = [
				this.practicesPath,
				this.learningPathsPath,
				this.progressPath,
				this.templatesPath,
			];

			for (const dir of directories) {
				if (!existsSync(dir)) {
					await mkdir(dir, { recursive: true });
				}
			}

			// Load cached data
			await this.loadCache();

			logger.info("Best practices service initialized");
		} catch (error) {
			logger.error("Failed to initialize best practices service:", error);
			throw error;
		}
	}

	/**
	 * Search best practices
	 */
	public async searchBestPractices(
		filters: BestPracticeFilters = {}
	): Promise<{
		practices: BestPracticeContent[];
		total: number;
		hasMore: boolean;
	}> {
		try {
			let practices = Array.from(this.practicesCache.values());

			// Apply filters
			if (filters.query) {
				const query = filters.query.toLowerCase();
				practices = practices.filter(p =>
					p.title.toLowerCase().includes(query) ||
					p.description.toLowerCase().includes(query) ||
					p.content.summary.toLowerCase().includes(query) ||
					p.tags.some(tag => tag.toLowerCase().includes(query))
				);
			}

			if (filters.category) {
				practices = practices.filter(p => p.category === filters.category);
			}

			if (filters.type) {
				practices = practices.filter(p => p.type === filters.type);
			}

			if (filters.difficulty) {
				practices = practices.filter(p => p.difficulty === filters.difficulty);
			}

			if (filters.tags && filters.tags.length > 0) {
				practices = practices.filter(p =>
					filters.tags!.some(tag => p.tags.includes(tag))
				);
			}

			if (filters.frameworks && filters.frameworks.length > 0) {
				practices = practices.filter(p =>
					p.frameworks && filters.frameworks!.some(framework => p.frameworks!.includes(framework))
				);
			}

			if (filters.complianceStandards && filters.complianceStandards.length > 0) {
				practices = practices.filter(p =>
					p.complianceStandards && filters.complianceStandards!.some(standard => 
						p.complianceStandards!.includes(standard)
					)
				);
			}

			// Apply sorting
			this.applySorting(practices, filters);

			// Apply pagination
			const offset = filters.offset || 0;
			const limit = filters.limit || 20;
			const total = practices.length;
			const paginatedPractices = practices.slice(offset, offset + limit);
			const hasMore = offset + limit < total;

			return {
				practices: paginatedPractices,
				total,
				hasMore,
			};

		} catch (error) {
			logger.error("Failed to search best practices:", error);
			return {
				practices: [],
				total: 0,
				hasMore: false,
			};
		}
	}

	/**
	 * Get best practice by ID
	 */
	public async getBestPractice(practiceId: string): Promise<BestPracticeContent | null> {
		try {
			const practice = this.practicesCache.get(practiceId);
			if (practice) {
				// Increment view count
				practice.stats.views++;
				await this.savePractice(practice);
				return practice;
			}

			// Try to load from storage
			const practicePath = join(this.practicesPath, `${practiceId}.json`);
			if (existsSync(practicePath)) {
				const content = await readFile(practicePath, "utf-8");
				const practice = BestPracticeContentSchema.parse(JSON.parse(content));
				this.practicesCache.set(practiceId, practice);
				return practice;
			}

			return null;
		} catch (error) {
			logger.error(`Failed to get best practice ${practiceId}:`, error);
			return null;
		}
	}

	/**
	 * Get practices by category
	 */
	public async getPracticesByCategory(
		category: BestPracticeCategory,
		limit: number = 20
	): Promise<BestPracticeContent[]> {
		try {
			const practices = Array.from(this.practicesCache.values())
				.filter(p => p.category === category)
				.sort((a, b) => b.stats.rating - a.stats.rating)
				.slice(0, limit);

			return practices;
		} catch (error) {
			logger.error(`Failed to get practices for category ${category}:`, error);
			return [];
		}
	}

	/**
	 * Get featured practices
	 */
	public async getFeaturedPractices(limit: number = 10): Promise<BestPracticeContent[]> {
		try {
			const practices = Array.from(this.practicesCache.values());

			// Sort by a combination of rating, views, and recency
			practices.sort((a, b) => {
				const aScore = a.stats.rating * 0.4 + (a.stats.views / 100) * 0.3 + 
					(Date.now() - new Date(a.updatedAt).getTime()) / (1000 * 60 * 60 * 24) * -0.3;
				const bScore = b.stats.rating * 0.4 + (b.stats.views / 100) * 0.3 + 
					(Date.now() - new Date(b.updatedAt).getTime()) / (1000 * 60 * 60 * 24) * -0.3;
				return bScore - aScore;
			});

			return practices.slice(0, limit);
		} catch (error) {
			logger.error("Failed to get featured practices:", error);
			return [];
		}
	}

	/**
	 * Get learning paths
	 */
	public async getLearningPaths(filters: {
		category?: BestPracticeCategory;
		difficulty?: DifficultyLevel;
	} = {}): Promise<LearningPath[]> {
		try {
			let paths = Array.from(this.learningPathsCache.values());

			// Apply filters
			if (filters.category) {
				paths = paths.filter(p => p.category === filters.category);
			}

			if (filters.difficulty) {
				paths = paths.filter(p => p.difficulty === filters.difficulty);
			}

			// Sort by creation date (newest first)
			paths.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

			return paths;
		} catch (error) {
			logger.error("Failed to get learning paths:", error);
			return [];
		}
	}

	/**
	 * Get user progress for a practice
	 */
	public async getUserProgress(
		userId: string,
		practiceId?: string
	): Promise<UserProgress[]> {
		try {
			const userProgress = this.progressCache.get(userId) || [];

			if (practiceId) {
				return userProgress.filter(p => p.practiceId === practiceId);
			}

			return userProgress;
		} catch (error) {
			logger.error(`Failed to get user progress for ${userId}:`, error);
			return [];
		}
	}

	/**
	 * Update user progress
	 */
	public async updateUserProgress(
		userId: string,
		practiceId: string,
		progress: Partial<Pick<UserProgress, "status" | "progress" | "timeSpent" | "rating" | "feedback">>
	): Promise<{
		success: boolean;
		errors: string[];
	}> {
		const result = {
			success: false,
			errors: [] as string[],
		};

		try {
			const userProgress = this.progressCache.get(userId) || [];
			let progressRecord = userProgress.find(p => p.practiceId === practiceId);

			if (!progressRecord) {
				// Create new progress record
				progressRecord = {
					userId,
					practiceId,
					status: "not-started",
					progress: 0,
					timeSpent: 0,
					lastAccessed: new Date().toISOString(),
				};
				userProgress.push(progressRecord);
			}

			// Update progress
			if (progress.status) {
				progressRecord.status = progress.status;
				if (progress.status === "completed") {
					progressRecord.completedAt = new Date().toISOString();
					progressRecord.progress = 100;
				}
			}

			if (progress.progress !== undefined) {
				progressRecord.progress = Math.max(0, Math.min(100, progress.progress));
			}

			if (progress.timeSpent !== undefined) {
				progressRecord.timeSpent += progress.timeSpent;
			}

			if (progress.rating !== undefined) {
				progressRecord.rating = progress.rating;
			}

			if (progress.feedback !== undefined) {
				progressRecord.feedback = progress.feedback;
			}

			progressRecord.lastAccessed = new Date().toISOString();

			// Save progress
			this.progressCache.set(userId, userProgress);
			await this.saveUserProgress(userId, userProgress);

			result.success = true;

			logger.debug(`User progress updated: ${userId} -> ${practiceId}`);

		} catch (error) {
			result.errors.push(`Failed to update progress: ${error}`);
			logger.error(`Failed to update user progress for ${userId}:`, error);
		}

		return result;
	}

	/**
	 * Rate a best practice
	 */
	public async ratePractice(
		practiceId: string,
		userId: string,
		rating: number,
		feedback?: string
	): Promise<{
		success: boolean;
		newRating: number;
		errors: string[];
	}> {
		const result = {
			success: false,
			newRating: 0,
			errors: [] as string[],
		};

		try {
			if (rating < 1 || rating > 5) {
				result.errors.push("Rating must be between 1 and 5");
				return result;
			}

			const practice = this.practicesCache.get(practiceId);
			if (!practice) {
				result.errors.push("Practice not found");
				return result;
			}

			// Update rating (simplified - in practice, would track individual ratings)
			const totalRating = practice.stats.rating * practice.stats.ratingCount + rating;
			practice.stats.ratingCount++;
			practice.stats.rating = Math.round((totalRating / practice.stats.ratingCount) * 10) / 10;

			// Save updated practice
			await this.savePractice(practice);

			// Update user progress with rating
			await this.updateUserProgress(userId, practiceId, { rating, feedback });

			result.success = true;
			result.newRating = practice.stats.rating;

			logger.info(`Practice rated: ${practiceId} -> ${rating} by user ${userId}`);

		} catch (error) {
			result.errors.push(`Failed to rate practice: ${error}`);
			logger.error(`Failed to rate practice ${practiceId}:`, error);
		}

		return result;
	}

	/**
	 * Get recommendations for user
	 */
	public async getRecommendations(
		userId: string,
		options: {
			category?: BestPracticeCategory;
			difficulty?: DifficultyLevel;
			limit?: number;
		} = {}
	): Promise<{
		recommended: BestPracticeContent[];
		trending: BestPracticeContent[];
		continueReading: BestPracticeContent[];
	}> {
		try {
			const practices = Array.from(this.practicesCache.values());
			const userProgress = this.progressCache.get(userId) || [];
			const limit = options.limit || 10;

			// Get practices user hasn't completed
			const uncompletedPractices = practices.filter(p => {
				const progress = userProgress.find(up => up.practiceId === p.id);
				return !progress || progress.status !== "completed";
			});

			// Continue reading (in-progress practices)
			const continueReading = practices.filter(p => {
				const progress = userProgress.find(up => up.practiceId === p.id);
				return progress && progress.status === "in-progress";
			}).slice(0, limit);

			// Recommended based on user's completed practices and difficulty progression
			let recommended = uncompletedPractices.filter(p => {
				if (options.category && p.category !== options.category) return false;
				if (options.difficulty && p.difficulty !== options.difficulty) return false;
				return true;
			});

			// Sort by rating and relevance
			recommended.sort((a, b) => {
				const aScore = a.stats.rating * 0.6 + (a.stats.views / 100) * 0.4;
				const bScore = b.stats.rating * 0.6 + (b.stats.views / 100) * 0.4;
				return bScore - aScore;
			});
			recommended = recommended.slice(0, limit);

			// Trending (most viewed recently)
			const trending = practices
				.filter(p => p.stats.views > 50)
				.sort((a, b) => {
					// Simple trending algorithm based on views and recency
					const aDays = Math.floor((Date.now() - new Date(a.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
					const bDays = Math.floor((Date.now() - new Date(b.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
					const aScore = a.stats.views / Math.max(1, aDays);
					const bScore = b.stats.views / Math.max(1, bDays);
					return bScore - aScore;
				})
				.slice(0, limit);

			return {
				recommended,
				trending,
				continueReading,
			};

		} catch (error) {
			logger.error(`Failed to get recommendations for user ${userId}:`, error);
			return {
				recommended: [],
				trending: [],
				continueReading: [],
			};
		}
	}

	/**
	 * Generate practice template
	 */
	public async generatePracticeTemplate(
		category: BestPracticeCategory,
		type: ContentType
	): Promise<Partial<BestPracticeContent>> {
		const templates: Record<string, Partial<BestPracticeContent>> = {
			[`${BestPracticeCategory.SECURITY}_${ContentType.CHECKLIST}`]: {
				title: "Security Checklist Template",
				description: "Comprehensive security checklist for web applications",
				content: {
					summary: "Essential security measures every web application should implement",
					sections: [
						{
							title: "Authentication & Authorization",
							content: "Implement secure authentication and authorization mechanisms",
						},
						{
							title: "Data Protection",
							content: "Ensure data is encrypted at rest and in transit",
						},
					],
					keyTakeaways: [
						"Security should be built into the development process",
						"Regular security audits are essential",
					],
					checklist: [
						{
							item: "Implement HTTPS everywhere",
							required: true,
							description: "All communication should use encrypted connections",
						},
						{
							item: "Use strong password policies",
							required: true,
							description: "Enforce minimum password complexity requirements",
						},
					],
				},
				complianceStandards: ["OWASP", "NSM"],
			},
			[`${BestPracticeCategory.NORWEGIAN_COMPLIANCE}_${ContentType.GUIDELINE}`]: {
				title: "Norwegian Compliance Guideline Template",
				description: "Guidelines for building applications compliant with Norwegian regulations",
				content: {
					summary: "Key requirements for Norwegian government and public sector applications",
					sections: [
						{
							title: "NSM Security Requirements",
							content: "Implement security measures according to NSM guidelines",
						},
						{
							title: "GDPR Compliance",
							content: "Ensure proper data handling according to GDPR",
						},
						{
							title: "Accessibility Standards",
							content: "Meet WCAG 2.2 AAA accessibility requirements",
						},
					],
					keyTakeaways: [
						"Norwegian compliance requires multiple standards",
						"Documentation is crucial for audits",
					],
				},
				complianceStandards: ["NSM", "GDPR", "WCAG"],
			},
		};

		const templateKey = `${category}_${type}`;
		const template = templates[templateKey];

		if (template) {
			return {
				...template,
				category,
				type,
				difficulty: DifficultyLevel.INTERMEDIATE,
				tags: [category, type],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
		}

		// Default template
		return {
			title: `New ${type} for ${category}`,
			description: `A ${type} covering ${category} best practices`,
			category,
			type,
			difficulty: DifficultyLevel.INTERMEDIATE,
			tags: [category, type],
			content: {
				summary: "Brief summary of the practice",
				sections: [
					{
						title: "Overview",
						content: "Detailed explanation of the practice",
					},
				],
				keyTakeaways: ["Key learning point"],
			},
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
	}

	// Private helper methods

	private async loadCache(): Promise<void> {
		try {
			// Load practices
			if (existsSync(this.practicesPath)) {
				const practiceFiles = await readdir(this.practicesPath);
				
				for (const file of practiceFiles) {
					if (file.endsWith(".json")) {
						const content = await readFile(join(this.practicesPath, file), "utf-8");
						const practice = BestPracticeContentSchema.parse(JSON.parse(content));
						this.practicesCache.set(practice.id, practice);
					}
				}
			}

			// Load learning paths
			if (existsSync(this.learningPathsPath)) {
				const pathFiles = await readdir(this.learningPathsPath);
				
				for (const file of pathFiles) {
					if (file.endsWith(".json")) {
						const content = await readFile(join(this.learningPathsPath, file), "utf-8");
						const path = JSON.parse(content);
						this.learningPathsCache.set(path.id, path);
					}
				}
			}

			// Load user progress
			if (existsSync(this.progressPath)) {
				const progressFiles = await readdir(this.progressPath);
				
				for (const file of progressFiles) {
					if (file.endsWith(".json")) {
						const userId = file.replace(".json", "");
						const content = await readFile(join(this.progressPath, file), "utf-8");
						const progress = JSON.parse(content);
						this.progressCache.set(userId, progress);
					}
				}
			}

			// Load mock data if cache is empty
			if (this.practicesCache.size === 0) {
				await this.loadMockData();
			}

		} catch (error) {
			logger.warn("Failed to load best practices cache:", error);
			await this.loadMockData();
		}
	}

	private applySorting(practices: BestPracticeContent[], filters: BestPracticeFilters): void {
		const sortBy = filters.sortBy || "relevance";

		practices.sort((a, b) => {
			switch (sortBy) {
				case "popularity":
					return b.stats.views - a.stats.views;
				case "recent":
					return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
				case "rating":
					return b.stats.rating - a.stats.rating;
				case "relevance":
				default:
					// Relevance scoring based on multiple factors
					const aScore = a.stats.rating * 0.4 + (a.stats.views / 100) * 0.3 + 
						(a.stats.likes / 10) * 0.3;
					const bScore = b.stats.rating * 0.4 + (b.stats.views / 100) * 0.3 + 
						(b.stats.likes / 10) * 0.3;
					return bScore - aScore;
			}
		});
	}

	private async savePractice(practice: BestPracticeContent): Promise<void> {
		const practicePath = join(this.practicesPath, `${practice.id}.json`);
		await writeFile(practicePath, JSON.stringify(practice, null, 2));
		this.practicesCache.set(practice.id, practice);
	}

	private async saveUserProgress(userId: string, progress: UserProgress[]): Promise<void> {
		const progressPath = join(this.progressPath, `${userId}.json`);
		await writeFile(progressPath, JSON.stringify(progress, null, 2));
	}

	private async loadMockData(): Promise<void> {
		// Load comprehensive mock best practices data
		const mockPractices: BestPracticeContent[] = [
			{
				id: "react-component-architecture",
				title: "React Component Architecture Best Practices",
				description: "Comprehensive guide to building scalable and maintainable React components",
				category: BestPracticeCategory.ARCHITECTURE,
				type: ContentType.GUIDELINE,
				difficulty: DifficultyLevel.INTERMEDIATE,
				tags: ["react", "components", "architecture", "scalability"],
				content: {
					summary: "Learn how to structure React components for maximum reusability and maintainability using proven architectural patterns.",
					sections: [
						{
							title: "Component Composition",
							content: "Use composition over inheritance to build flexible component hierarchies. This approach allows for better code reuse and easier testing.",
							codeExamples: [
								{
									title: "Good: Using Composition",
									language: "typescript",
									code: `interface ButtonProps {
  readonly children: React.ReactNode;
  readonly variant?: 'primary' | 'secondary';
  readonly onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  onClick 
}) => {
  return (
    <button 
      className={\`btn btn-\${variant}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};`,
									explanation: "This approach allows the Button component to be flexible and reusable.",
								},
							],
						},
						{
							title: "TypeScript Integration",
							content: "Use TypeScript interfaces to define clear component contracts and improve developer experience.",
							codeExamples: [
								{
									title: "Strong Typing Example",
									language: "typescript",
									code: `interface UserProfileProps {
  readonly user: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly avatar?: string;
  };
  readonly onEdit?: (userId: string) => void;
}`,
								},
							],
						},
					],
					keyTakeaways: [
						"Use composition over inheritance for component design",
						"Implement proper TypeScript typing for all props",
						"Keep components focused on a single responsibility",
						"Use proper naming conventions for clarity",
					],
					dosList: [
						"Use TypeScript interfaces for all component props",
						"Implement proper error boundaries",
						"Use React.memo for performance optimization when needed",
						"Follow consistent naming conventions",
					],
					dontsList: [
						"Don't use 'any' types in component props",
						"Don't create overly complex component hierarchies",
						"Don't ignore accessibility requirements",
						"Don't skip prop validation",
					],
					commonMistakes: [
						{
							mistake: "Using 'any' types for component props",
							consequence: "Loss of type safety and poor developer experience",
							solution: "Define proper TypeScript interfaces for all props",
						},
					],
				},
				author: {
					name: "React Team",
					role: "Senior Frontend Developer",
					avatar: "https://avatars.example.com/react-team.png",
				},
				relatedPractices: ["typescript-best-practices", "testing-react-components"],
				externalLinks: [
					{
						title: "React Official Documentation",
						url: "https://react.dev",
						description: "Official React documentation with best practices",
					},
				],
				tools: [
					{
						name: "ESLint React Plugin",
						url: "https://github.com/jsx-eslint/eslint-plugin-react",
						description: "Linting rules for React components",
					},
				],
				frameworks: ["React", "Next.js"],
				stats: {
					views: 15420,
					likes: 890,
					bookmarks: 340,
					shares: 125,
					rating: 4.8,
					ratingCount: 245,
				},
				createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
				updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
				lastReviewedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
			},
			{
				id: "norwegian-compliance-security",
				title: "Norwegian Government Security Compliance",
				description: "Essential security practices for Norwegian public sector applications",
				category: BestPracticeCategory.NORWEGIAN_COMPLIANCE,
				type: ContentType.STANDARD,
				difficulty: DifficultyLevel.ADVANCED,
				tags: ["norway", "security", "nsm", "compliance", "government"],
				content: {
					summary: "Comprehensive guide to implementing security measures that meet Norwegian government requirements, including NSM guidelines and GDPR compliance.",
					sections: [
						{
							title: "NSM Security Framework",
							content: "The Norwegian National Security Authority (NSM) provides security guidelines that must be followed for government applications.",
						},
						{
							title: "Data Classification",
							content: "Implement proper data classification according to Norwegian standards: ÅPEN (OPEN), BEGRENSET (RESTRICTED), KONFIDENSIELT (CONFIDENTIAL), HEMMELIG (SECRET).",
						},
						{
							title: "Authentication Requirements",
							content: "Use strong authentication mechanisms including BankID integration for citizen-facing applications.",
						},
					],
					keyTakeaways: [
						"NSM guidelines are mandatory for government applications",
						"Data classification must be implemented from the start",
						"Regular security audits are required",
						"Documentation is crucial for compliance verification",
					],
					checklist: [
						{
							item: "Implement NSM-approved encryption standards",
							required: true,
							description: "Use only NSM-approved cryptographic algorithms",
						},
						{
							item: "Set up proper logging and monitoring",
							required: true,
							description: "All security events must be logged and monitored",
						},
						{
							item: "Implement BankID integration",
							required: false,
							description: "Required for citizen authentication in public services",
						},
					],
				},
				author: {
					name: "Norwegian Compliance Team",
					role: "Security Compliance Specialist",
					avatar: "https://avatars.example.com/norway-compliance.png",
				},
				relatedPractices: ["security-testing", "gdpr-compliance"],
				complianceStandards: ["NSM", "GDPR", "ISO27001"],
				frameworks: ["All"],
				stats: {
					views: 8750,
					likes: 420,
					bookmarks: 580,
					shares: 95,
					rating: 4.9,
					ratingCount: 186,
				},
				createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
				updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
				lastReviewedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
			},
			{
				id: "accessibility-wcag-implementation",
				title: "WCAG 2.2 AAA Implementation Guide",
				description: "Complete guide to implementing WCAG 2.2 AAA accessibility standards",
				category: BestPracticeCategory.ACCESSIBILITY,
				type: ContentType.GUIDELINE,
				difficulty: DifficultyLevel.ADVANCED,
				tags: ["accessibility", "wcag", "inclusive-design", "a11y"],
				content: {
					summary: "Detailed implementation guide for achieving WCAG 2.2 AAA compliance in web applications, with practical examples and testing strategies.",
					sections: [
						{
							title: "Color and Contrast",
							content: "Implement proper color contrast ratios and ensure content is accessible without relying solely on color.",
							codeExamples: [
								{
									title: "Proper Color Contrast",
									language: "css",
									code: `/* WCAG AAA requires 7:1 contrast ratio for normal text */
.high-contrast-text {
  color: #000000; /* Pure black */
  background-color: #ffffff; /* Pure white */
  /* This achieves 21:1 contrast ratio */
}

/* For large text (18pt+), 4.5:1 is acceptable */
.large-text {
  font-size: 18pt;
  color: #595959; /* Medium gray */
  background-color: #ffffff;
  /* This achieves 4.51:1 contrast ratio */
}`,
								},
							],
						},
						{
							title: "Keyboard Navigation",
							content: "Ensure all interactive elements are accessible via keyboard navigation with proper focus management.",
						},
					],
					keyTakeaways: [
						"WCAG AAA is the highest level of accessibility compliance",
						"Color contrast ratios must be carefully calculated",
						"Keyboard navigation must be fully functional",
						"Screen reader compatibility is essential",
					],
					checklist: [
						{
							item: "Achieve 7:1 contrast ratio for normal text",
							required: true,
							description: "Use color contrast tools to verify ratios",
						},
						{
							item: "Implement proper focus management",
							required: true,
							description: "All interactive elements must be keyboard accessible",
						},
					],
				},
				author: {
					name: "Accessibility Expert Team",
					role: "Accessibility Consultant",
				},
				complianceStandards: ["WCAG", "Section508", "EN301549"],
				frameworks: ["All"],
				stats: {
					views: 12350,
					likes: 670,
					bookmarks: 890,
					shares: 150,
					rating: 4.7,
					ratingCount: 203,
				},
				createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
				updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
			},
		];

		// Mock learning paths
		const mockLearningPaths: LearningPath[] = [
			{
				id: "frontend-security-mastery",
				title: "Frontend Security Mastery",
				description: "Complete learning path for frontend security best practices",
				category: BestPracticeCategory.SECURITY,
				difficulty: DifficultyLevel.INTERMEDIATE,
				estimatedDuration: 180, // 3 hours
				practices: [
					{ practiceId: "react-component-architecture", order: 1, required: true },
					{ practiceId: "norwegian-compliance-security", order: 2, required: true },
					{ practiceId: "accessibility-wcag-implementation", order: 3, required: false },
				],
				prerequisites: ["Basic React knowledge", "Understanding of web security concepts"],
				outcomes: [
					"Implement secure React components",
					"Meet Norwegian compliance requirements",
					"Apply security best practices in frontend development",
				],
				createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
				updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
			},
		];

		// Load mock data into cache
		for (const practice of mockPractices) {
			this.practicesCache.set(practice.id, practice);
			await this.savePractice(practice);
		}

		for (const path of mockLearningPaths) {
			this.learningPathsCache.set(path.id, path);
			const pathFile = join(this.learningPathsPath, `${path.id}.json`);
			await writeFile(pathFile, JSON.stringify(path, null, 2));
		}

		logger.info("Mock best practices data loaded");
	}
}

/**
 * Create best practices service instance
 */
export function createBestPracticesService(basePath?: string): BestPracticesService {
	return new BestPracticesService(basePath);
}

/**
 * Default export
 */
export default BestPracticesService;