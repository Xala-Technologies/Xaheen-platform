/**
 * Template Sharing Platform Service
 * Community template sharing with discovery, ratings, and contributions
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { createHash } from "crypto";
import { existsSync } from "fs";
import { mkdir, writeFile, readFile, readdir, stat, rm, copyFile } from "fs/promises";
import { join, basename, extname, relative } from "path";
import { z } from "zod";
import { logger } from "../../utils/logger";

/**
 * Template categories
 */
export enum TemplateCategory {
	WEB_APP = "web-app",
	MOBILE_APP = "mobile-app",
	DESKTOP_APP = "desktop-app",
	API = "api",
	MICROSERVICE = "microservice",
	COMPONENT = "component",
	LAYOUT = "layout",
	BOILERPLATE = "boilerplate",
	STARTER = "starter",
	ENTERPRISE = "enterprise",
}

/**
 * Template complexity levels
 */
export enum TemplateComplexity {
	BEGINNER = "beginner",
	INTERMEDIATE = "intermediate",
	ADVANCED = "advanced",
	EXPERT = "expert",
}

/**
 * Template frameworks
 */
export enum TemplateFramework {
	REACT = "react",
	NEXTJS = "nextjs",
	VUE = "vue",
	ANGULAR = "angular",
	SVELTE = "svelte",
	ELECTRON = "electron",
	REACT_NATIVE = "react-native",
	NODEJS = "nodejs",
	EXPRESS = "express",
	FASTIFY = "fastify",
	NESTJS = "nestjs",
	VANILLA = "vanilla",
}

/**
 * Template metadata schema
 */
const TemplateMetadataSchema = z.object({
	id: z.string(),
	name: z.string().min(3).max(100),
	description: z.string().min(10).max(500),
	author: z.object({
		id: z.string(),
		username: z.string(),
		displayName: z.string(),
		email: z.string().email().optional(),
		avatar: z.string().url().optional(),
	}),
	version: z.string().regex(/^\d+\.\d+\.\d+$/),
	category: z.nativeEnum(TemplateCategory),
	complexity: z.nativeEnum(TemplateComplexity),
	frameworks: z.array(z.nativeEnum(TemplateFramework)),
	tags: z.array(z.string()).max(20),
	keywords: z.array(z.string()).max(10),
	license: z.string().default("MIT"),
	repository: z.string().url().optional(),
	homepage: z.string().url().optional(),
	documentation: z.string().url().optional(),
	demo: z.string().url().optional(),
	screenshots: z.array(z.string().url()).max(10),
	features: z.array(z.string()).max(20),
	requirements: z.object({
		nodeVersion: z.string().optional(),
		xaheenVersion: z.string(),
		os: z.array(z.enum(["windows", "macos", "linux"])).optional(),
		dependencies: z.record(z.string()).optional(),
	}),
	stats: z.object({
		downloads: z.number().default(0),
		stars: z.number().default(0),
		forks: z.number().default(0),
		rating: z.number().min(0).max(5).default(0),
		reviews: z.number().default(0),
	}),
	flags: z.object({
		verified: z.boolean().default(false),
		featured: z.boolean().default(false),
		trending: z.boolean().default(false),
		deprecated: z.boolean().default(false),
		nsfw: z.boolean().default(false),
	}),
	createdAt: z.string(),
	updatedAt: z.string(),
	lastUsed: z.string().optional(),
});

export type TemplateMetadata = z.infer<typeof TemplateMetadataSchema>;

/**
 * Template submission schema
 */
const TemplateSubmissionSchema = z.object({
	name: z.string().min(3).max(100),
	description: z.string().min(10).max(500),
	category: z.nativeEnum(TemplateCategory),
	complexity: z.nativeEnum(TemplateComplexity),
	frameworks: z.array(z.nativeEnum(TemplateFramework)).min(1),
	tags: z.array(z.string()).max(20),
	keywords: z.array(z.string()).max(10),
	license: z.string().default("MIT"),
	repository: z.string().url().optional(),
	homepage: z.string().url().optional(),
	documentation: z.string().url().optional(),
	demo: z.string().url().optional(),
	screenshots: z.array(z.string().url()).max(10),
	features: z.array(z.string()).max(20),
	templatePath: z.string(), // Local path to template files
	readme: z.string().optional(),
	changelog: z.string().optional(),
});

export type TemplateSubmission = z.infer<typeof TemplateSubmissionSchema>;

/**
 * Template search filters
 */
export interface TemplateSearchFilters {
	readonly query?: string;
	readonly category?: TemplateCategory;
	readonly complexity?: TemplateComplexity;
	readonly frameworks?: TemplateFramework[];
	readonly tags?: string[];
	readonly author?: string;
	readonly verified?: boolean;
	readonly featured?: boolean;
	readonly trending?: boolean;
	readonly minRating?: number;
	readonly sortBy?: "downloads" | "rating" | "updated" | "created" | "name" | "trending";
	readonly sortOrder?: "asc" | "desc";
	readonly limit?: number;
	readonly offset?: number;
}

/**
 * Template review
 */
export interface TemplateReview {
	readonly id: string;
	readonly templateId: string;
	readonly userId: string;
	readonly username: string;
	readonly rating: number;
	readonly title: string;
	readonly comment: string;
	readonly pros: string[];
	readonly cons: string[];
	readonly usedFor: string; // What project they used it for
	readonly verified: boolean; // Verified user/usage
	readonly helpfulVotes: number;
	readonly reportCount: number;
	readonly createdAt: string;
	readonly updatedAt: string;
}

/**
 * Template collection
 */
export interface TemplateCollection {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly author: {
		readonly id: string;
		readonly username: string;
		readonly displayName: string;
	};
	readonly templates: string[]; // Template IDs
	readonly tags: string[];
	readonly isPublic: boolean;
	readonly featured: boolean;
	readonly stats: {
		readonly followers: number;
		readonly views: number;
		readonly uses: number;
	};
	readonly createdAt: string;
	readonly updatedAt: string;
}

/**
 * Template usage analytics
 */
export interface TemplateUsageAnalytics {
	readonly templateId: string;
	readonly period: "day" | "week" | "month" | "year";
	readonly downloads: Array<{
		readonly date: string;
		readonly count: number;
		readonly source: string; // CLI, web, API
	}>;
	readonly geography: Record<string, number>; // Country code -> count
	readonly frameworks: Record<string, number>; // Framework -> count
	readonly projects: Array<{
		readonly projectName: string;
		readonly userId: string;
		readonly createdAt: string;
		readonly success: boolean;
	}>;
	readonly feedback: {
		readonly averageRating: number;
		readonly completionRate: number; // % of users who successfully used template
		readonly commonIssues: string[];
	};
}

/**
 * Template sharing platform service
 */
export class TemplateSharingService {
	private readonly platformPath: string;
	private readonly templatesPath: string;
	private readonly collectionsPath: string;
	private readonly reviewsPath: string;
	private readonly analyticsPath: string;
	private readonly templatesCache: Map<string, TemplateMetadata> = new Map();
	private readonly collectionsCache: Map<string, TemplateCollection> = new Map();
	private readonly reviewsCache: Map<string, TemplateReview[]> = new Map();

	constructor(platformPath: string = join(process.cwd(), ".xaheen", "templates")) {
		this.platformPath = platformPath;
		this.templatesPath = join(platformPath, "shared");
		this.collectionsPath = join(platformPath, "collections");
		this.reviewsPath = join(platformPath, "reviews");
		this.analyticsPath = join(platformPath, "analytics");
	}

	/**
	 * Initialize template sharing platform
	 */
	public async initialize(): Promise<void> {
		try {
			// Ensure platform directories exist
			const directories = [
				this.platformPath,
				this.templatesPath,
				this.collectionsPath,
				this.reviewsPath,
				this.analyticsPath,
			];

			for (const dir of directories) {
				if (!existsSync(dir)) {
					await mkdir(dir, { recursive: true });
				}
			}

			// Load cached data
			await this.loadCache();

			logger.info("Template sharing platform initialized");
		} catch (error) {
			logger.error("Failed to initialize template sharing platform:", error);
			throw error;
		}
	}

	/**
	 * Submit a new template to the platform
	 */
	public async submitTemplate(
		submission: TemplateSubmission,
		authorId: string
	): Promise<{
		success: boolean;
		templateId?: string;
		errors: string[];
		warnings: string[];
	}> {
		const result = {
			success: false,
			templateId: undefined as string | undefined,
			errors: [] as string[],
			warnings: [] as string[],
		};

		try {
			// Validate submission
			const validatedSubmission = TemplateSubmissionSchema.parse(submission);

			// Validate template files
			const validationResult = await this.validateTemplateFiles(validatedSubmission.templatePath);
			if (!validationResult.valid) {
				result.errors = validationResult.errors;
				return result;
			}

			// Generate template ID
			const templateId = this.generateTemplateId(validatedSubmission.name, authorId);

			// Check for name conflicts
			if (this.templatesCache.has(templateId)) {
				result.errors.push("Template with this name already exists");
				return result;
			}

			// Get author information (mock for now)
			const author = await this.getAuthorInfo(authorId);

			// Create template metadata
			const metadata: TemplateMetadata = {
				id: templateId,
				name: validatedSubmission.name,
				description: validatedSubmission.description,
				author,
				version: "1.0.0",
				category: validatedSubmission.category,
				complexity: validatedSubmission.complexity,
				frameworks: validatedSubmission.frameworks,
				tags: validatedSubmission.tags,
				keywords: validatedSubmission.keywords,
				license: validatedSubmission.license,
				repository: validatedSubmission.repository,
				homepage: validatedSubmission.homepage,
				documentation: validatedSubmission.documentation,
				demo: validatedSubmission.demo,
				screenshots: validatedSubmission.screenshots,
				features: validatedSubmission.features,
				requirements: {
					xaheenVersion: "^3.0.0",
					nodeVersion: ">=18.0.0",
					os: ["windows", "macos", "linux"],
				},
				stats: {
					downloads: 0,
					stars: 0,
					forks: 0,
					rating: 0,
					reviews: 0,
				},
				flags: {
					verified: false,
					featured: false,
					trending: false,
					deprecated: false,
					nsfw: false,
				},
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			// Package and store template files
			const packagePath = await this.packageTemplate(
				validatedSubmission.templatePath,
				templateId,
				metadata
			);

			// Save metadata
			this.templatesCache.set(templateId, metadata);
			await this.saveTemplateMetadata(templateId, metadata);

			// Initialize analytics
			await this.initializeTemplateAnalytics(templateId);

			result.success = true;
			result.templateId = templateId;

			// Add warnings for improvement suggestions
			if (!metadata.repository) {
				result.warnings.push("Consider adding a repository URL for better discoverability");
			}

			if (metadata.screenshots.length === 0) {
				result.warnings.push("Adding screenshots would help users understand your template");
			}

			if (metadata.features.length < 3) {
				result.warnings.push("Consider adding more feature descriptions");
			}

			logger.info(`Template submitted successfully: ${templateId}`);
		} catch (error) {
			if (error instanceof z.ZodError) {
				result.errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
			} else {
				result.errors.push(`Submission failed: ${error}`);
			}

			logger.error("Template submission failed:", error);
		}

		return result;
	}

	/**
	 * Search for templates
	 */
	public async searchTemplates(
		filters: TemplateSearchFilters = {}
	): Promise<{
		templates: TemplateMetadata[];
		total: number;
		page: number;
		hasMore: boolean;
	}> {
		try {
			// Refresh cache if needed
			await this.refreshCacheIfNeeded();

			let results = Array.from(this.templatesCache.values());

			// Apply filters
			if (filters.query) {
				const query = filters.query.toLowerCase();
				results = results.filter(t =>
					t.name.toLowerCase().includes(query) ||
					t.description.toLowerCase().includes(query) ||
					t.tags.some(tag => tag.toLowerCase().includes(query)) ||
					t.keywords.some(keyword => keyword.toLowerCase().includes(query))
				);
			}

			if (filters.category) {
				results = results.filter(t => t.category === filters.category);
			}

			if (filters.complexity) {
				results = results.filter(t => t.complexity === filters.complexity);
			}

			if (filters.frameworks && filters.frameworks.length > 0) {
				results = results.filter(t =>
					filters.frameworks!.some(framework => t.frameworks.includes(framework))
				);
			}

			if (filters.tags && filters.tags.length > 0) {
				results = results.filter(t =>
					filters.tags!.some(tag => t.tags.includes(tag))
				);
			}

			if (filters.author) {
				results = results.filter(t =>
					t.author.username.toLowerCase().includes(filters.author!.toLowerCase()) ||
					t.author.displayName.toLowerCase().includes(filters.author!.toLowerCase())
				);
			}

			if (filters.verified !== undefined) {
				results = results.filter(t => t.flags.verified === filters.verified);
			}

			if (filters.featured !== undefined) {
				results = results.filter(t => t.flags.featured === filters.featured);
			}

			if (filters.trending !== undefined) {
				results = results.filter(t => t.flags.trending === filters.trending);
			}

			if (filters.minRating && filters.minRating > 0) {
				results = results.filter(t => t.stats.rating >= filters.minRating!);
			}

			// Apply sorting
			this.applySorting(results, filters);

			// Apply pagination
			const offset = filters.offset || 0;
			const limit = filters.limit || 20;
			const total = results.length;
			const templates = results.slice(offset, offset + limit);
			const hasMore = offset + limit < total;
			const page = Math.floor(offset / limit) + 1;

			return {
				templates,
				total,
				page,
				hasMore,
			};

		} catch (error) {
			logger.error("Template search failed:", error);
			return {
				templates: [],
				total: 0,
				page: 1,
				hasMore: false,
			};
		}
	}

	/**
	 * Get template details by ID
	 */
	public async getTemplate(
		templateId: string,
		options: {
			includeReviews?: boolean;
			includeAnalytics?: boolean;
			includeFiles?: boolean;
		} = {}
	): Promise<TemplateMetadata & {
		reviews?: TemplateReview[];
		analytics?: TemplateUsageAnalytics;
		files?: string[];
	} | null> {
		try {
			const template = this.templatesCache.get(templateId);
			if (!template) {
				return null;
			}

			const result = { ...template } as any;

			// Load reviews if requested
			if (options.includeReviews) {
				result.reviews = await this.getTemplateReviews(templateId);
			}

			// Load analytics if requested
			if (options.includeAnalytics) {
				result.analytics = await this.getTemplateAnalytics(templateId);
			}

			// Load file list if requested
			if (options.includeFiles) {
				result.files = await this.getTemplateFiles(templateId);
			}

			// Record view for analytics
			await this.recordTemplateView(templateId);

			return result;

		} catch (error) {
			logger.error(`Failed to get template ${templateId}:`, error);
			return null;
		}
	}

	/**
	 * Download template
	 */
	public async downloadTemplate(
		templateId: string,
		targetPath: string,
		options: {
			variant?: string;
			customizations?: Record<string, any>;
		} = {}
	): Promise<{
		success: boolean;
		templatePath: string;
		errors: string[];
	}> {
		const result = {
			success: false,
			templatePath: targetPath,
			errors: [] as string[],
		};

		try {
			const template = this.templatesCache.get(templateId);
			if (!template) {
				result.errors.push("Template not found");
				return result;
			}

			// Ensure target directory exists
			if (!existsSync(targetPath)) {
				await mkdir(targetPath, { recursive: true });
			}

			// Copy template files
			const templatePath = join(this.templatesPath, templateId);
			await this.copyTemplateFiles(templatePath, targetPath, options.customizations);

			// Process template variables
			await this.processTemplateVariables(targetPath, {
				templateName: template.name,
				templateId,
				timestamp: new Date().toISOString(),
				...options.customizations,
			});

			// Record download for analytics
			await this.recordTemplateDownload(templateId, {
				source: "cli",
				targetPath,
				customizations: options.customizations,
			});

			// Update download count
			template.stats.downloads++;
			this.templatesCache.set(templateId, template);
			await this.saveTemplateMetadata(templateId, template);

			result.success = true;

			logger.info(`Template downloaded successfully: ${templateId} -> ${targetPath}`);
		} catch (error) {
			result.errors.push(`Download failed: ${error}`);
			logger.error(`Template download failed for ${templateId}:`, error);
		}

		return result;
	}

	/**
	 * Add a review for a template
	 */
	public async addTemplateReview(
		templateId: string,
		review: Omit<TemplateReview, "id" | "createdAt" | "updatedAt">
	): Promise<{
		success: boolean;
		reviewId?: string;
		errors: string[];
	}> {
		const result = {
			success: false,
			reviewId: undefined as string | undefined,
			errors: [] as string[],
		};

		try {
			const template = this.templatesCache.get(templateId);
			if (!template) {
				result.errors.push("Template not found");
				return result;
			}

			// Validate review
			if (review.rating < 1 || review.rating > 5) {
				result.errors.push("Rating must be between 1 and 5");
				return result;
			}

			if (review.comment.length < 10) {
				result.errors.push("Review comment must be at least 10 characters long");
				return result;
			}

			// Create review
			const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const fullReview: TemplateReview = {
				...review,
				id: reviewId,
				templateId,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			// Add to cache
			const existingReviews = this.reviewsCache.get(templateId) || [];
			existingReviews.push(fullReview);
			this.reviewsCache.set(templateId, existingReviews);

			// Save to storage
			await this.saveTemplateReview(fullReview);

			// Update template rating
			await this.updateTemplateRating(templateId);

			result.success = true;
			result.reviewId = reviewId;

			logger.info(`Review added for template: ${templateId}`);
		} catch (error) {
			result.errors.push(`Review submission failed: ${error}`);
			logger.error(`Failed to add review for template ${templateId}:`, error);
		}

		return result;
	}

	/**
	 * Create a template collection
	 */
	public async createCollection(
		collection: Omit<TemplateCollection, "id" | "createdAt" | "updatedAt" | "stats">
	): Promise<{
		success: boolean;
		collectionId?: string;
		errors: string[];
	}> {
		const result = {
			success: false,
			collectionId: undefined as string | undefined,
			errors: [] as string[],
		};

		try {
			// Validate collection
			if (collection.name.length < 3) {
				result.errors.push("Collection name must be at least 3 characters long");
				return result;
			}

			if (collection.templates.length === 0) {
				result.errors.push("Collection must contain at least one template");
				return result;
			}

			// Verify all templates exist
			for (const templateId of collection.templates) {
				if (!this.templatesCache.has(templateId)) {
					result.errors.push(`Template not found: ${templateId}`);
					return result;
				}
			}

			// Create collection
			const collectionId = `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const fullCollection: TemplateCollection = {
				...collection,
				id: collectionId,
				stats: {
					followers: 0,
					views: 0,
					uses: 0,
				},
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			// Add to cache
			this.collectionsCache.set(collectionId, fullCollection);

			// Save to storage
			await this.saveCollection(fullCollection);

			result.success = true;
			result.collectionId = collectionId;

			logger.info(`Collection created: ${collectionId}`);
		} catch (error) {
			result.errors.push(`Collection creation failed: ${error}`);
			logger.error("Collection creation failed:", error);
		}

		return result;
	}

	/**
	 * Get trending templates
	 */
	public async getTrendingTemplates(
		period: "day" | "week" | "month" = "week",
		limit: number = 10
	): Promise<TemplateMetadata[]> {
		try {
			// Calculate trending based on recent downloads, ratings, and activity
			const templates = Array.from(this.templatesCache.values());
			
			// Simple trending algorithm (in practice, this would be more sophisticated)
			const scored = templates.map(template => {
				const downloadScore = template.stats.downloads * 0.3;
				const ratingScore = template.stats.rating * template.stats.reviews * 0.4;
				const recentScore = this.calculateRecentActivity(template, period) * 0.3;
				
				return {
					template,
					score: downloadScore + ratingScore + recentScore,
				};
			});

			// Sort by score and return top templates
			scored.sort((a, b) => b.score - a.score);
			
			return scored.slice(0, limit).map(item => item.template);

		} catch (error) {
			logger.error("Failed to get trending templates:", error);
			return [];
		}
	}

	/**
	 * Get featured collections
	 */
	public async getFeaturedCollections(limit: number = 10): Promise<TemplateCollection[]> {
		try {
			const collections = Array.from(this.collectionsCache.values());
			return collections
				.filter(c => c.featured)
				.sort((a, b) => b.stats.followers - a.stats.followers)
				.slice(0, limit);
		} catch (error) {
			logger.error("Failed to get featured collections:", error);
			return [];
		}
	}

	/**
	 * Get template usage statistics
	 */
	public async getTemplateAnalytics(
		templateId: string,
		period: "day" | "week" | "month" | "year" = "month"
	): Promise<TemplateUsageAnalytics | null> {
		try {
			const analyticsPath = join(this.analyticsPath, templateId, `${period}.json`);
			
			if (!existsSync(analyticsPath)) {
				return null;
			}

			const content = await readFile(analyticsPath, "utf-8");
			return JSON.parse(content);

		} catch (error) {
			logger.error(`Failed to get analytics for template ${templateId}:`, error);
			return null;
		}
	}

	// Private helper methods

	private async loadCache(): Promise<void> {
		try {
			// Load templates
			if (existsSync(this.templatesPath)) {
				const templateDirs = await readdir(this.templatesPath);
				
				for (const dir of templateDirs) {
					const metadataPath = join(this.templatesPath, dir, "metadata.json");
					if (existsSync(metadataPath)) {
						const content = await readFile(metadataPath, "utf-8");
						const metadata = TemplateMetadataSchema.parse(JSON.parse(content));
						this.templatesCache.set(metadata.id, metadata);
					}
				}
			}

			// Load collections
			if (existsSync(this.collectionsPath)) {
				const collectionFiles = await readdir(this.collectionsPath);
				
				for (const file of collectionFiles) {
					if (file.endsWith(".json")) {
						const content = await readFile(join(this.collectionsPath, file), "utf-8");
						const collection = JSON.parse(content);
						this.collectionsCache.set(collection.id, collection);
					}
				}
			}

			// Load reviews
			if (existsSync(this.reviewsPath)) {
				const reviewFiles = await readdir(this.reviewsPath);
				
				for (const file of reviewFiles) {
					if (file.endsWith(".json")) {
						const templateId = file.replace(".json", "");
						const content = await readFile(join(this.reviewsPath, file), "utf-8");
						const reviews = JSON.parse(content);
						this.reviewsCache.set(templateId, reviews);
					}
				}
			}

			// Load mock data if cache is empty
			if (this.templatesCache.size === 0) {
				await this.loadMockData();
			}

		} catch (error) {
			logger.warn("Failed to load template sharing cache:", error);
			await this.loadMockData();
		}
	}

	private async refreshCacheIfNeeded(): Promise<void> {
		// In a real implementation, this would check if cache needs refreshing
		if (this.templatesCache.size === 0) {
			await this.loadCache();
		}
	}

	private generateTemplateId(name: string, authorId: string): string {
		const cleanName = name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
		const hash = createHash("md5").update(`${cleanName}-${authorId}`).digest("hex").substring(0, 8);
		return `${cleanName}-${hash}`;
	}

	private async getAuthorInfo(authorId: string): Promise<TemplateMetadata["author"]> {
		// Mock author info - in practice, this would query user service
		return {
			id: authorId,
			username: `user_${authorId}`,
			displayName: `User ${authorId}`,
			email: `user${authorId}@example.com`,
			avatar: `https://avatars.example.com/${authorId}.png`,
		};
	}

	private async validateTemplateFiles(templatePath: string): Promise<{
		valid: boolean;
		errors: string[];
	}> {
		const errors: string[] = [];

		try {
			if (!existsSync(templatePath)) {
				errors.push("Template path does not exist");
				return { valid: false, errors };
			}

			const stats = await stat(templatePath);
			if (!stats.isDirectory()) {
				errors.push("Template path must be a directory");
				return { valid: false, errors };
			}

			// Check for essential files
			const packageJsonPath = join(templatePath, "package.json");
			if (!existsSync(packageJsonPath)) {
				errors.push("Template must contain package.json");
			}

			const readmePath = join(templatePath, "README.md");
			if (!existsSync(readmePath)) {
				errors.push("Template should contain README.md");
			}

			// Check template size (should not exceed 100MB)
			const size = await this.calculateDirectorySize(templatePath);
			if (size > 100 * 1024 * 1024) {
				errors.push("Template size exceeds 100MB limit");
			}

			return { valid: errors.length === 0, errors };

		} catch (error) {
			errors.push(`Template validation failed: ${error}`);
			return { valid: false, errors };
		}
	}

	private async packageTemplate(
		sourcePath: string,
		templateId: string,
		metadata: TemplateMetadata
	): Promise<string> {
		const packagePath = join(this.templatesPath, templateId);
		
		// Create template directory
		await mkdir(packagePath, { recursive: true });

		// Copy template files (excluding node_modules, .git, etc.)
		await this.copyTemplateFiles(sourcePath, packagePath);

		// Save metadata
		await writeFile(
			join(packagePath, "metadata.json"),
			JSON.stringify(metadata, null, 2)
		);

		return packagePath;
	}

	private async copyTemplateFiles(
		sourcePath: string,
		targetPath: string,
		customizations?: Record<string, any>
	): Promise<void> {
		const excludePatterns = [
			"node_modules",
			".git",
			".next",
			"dist",
			"build",
			"coverage",
			"*.log",
			".DS_Store",
			".env",
			".vscode",
			".idea",
		];

		const copyRecursive = async (src: string, dest: string): Promise<void> => {
			const entries = await readdir(src, { withFileTypes: true });

			for (const entry of entries) {
				const srcPath = join(src, entry.name);
				const destPath = join(dest, entry.name);

				// Check if should exclude
				if (excludePatterns.some(pattern => 
					entry.name.includes(pattern) || entry.name.match(new RegExp(pattern))
				)) {
					continue;
				}

				if (entry.isDirectory()) {
					await mkdir(destPath, { recursive: true });
					await copyRecursive(srcPath, destPath);
				} else {
					await copyFile(srcPath, destPath);
				}
			}
		};

		await copyRecursive(sourcePath, targetPath);
	}

	private async processTemplateVariables(
		targetPath: string,
		variables: Record<string, any>
	): Promise<void> {
		// Process template variables in files
		const processFile = async (filePath: string): Promise<void> => {
			try {
				const content = await readFile(filePath, "utf-8");
				let processed = content;

				// Replace template variables
				for (const [key, value] of Object.entries(variables)) {
					const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
					processed = processed.replace(placeholder, String(value));
				}

				if (processed !== content) {
					await writeFile(filePath, processed);
				}
			} catch (error) {
				// File might be binary, skip
			}
		};

		const processDirectory = async (dir: string): Promise<void> => {
			const entries = await readdir(dir, { withFileTypes: true });

			for (const entry of entries) {
				const fullPath = join(dir, entry.name);

				if (entry.isDirectory()) {
					await processDirectory(fullPath);
				} else if (entry.isFile()) {
					// Only process text files
					const ext = extname(entry.name);
					const textExtensions = [".js", ".ts", ".jsx", ".tsx", ".json", ".md", ".txt", ".yml", ".yaml", ".xml", ".html", ".css", ".scss", ".less"];
					
					if (textExtensions.includes(ext)) {
						await processFile(fullPath);
					}
				}
			}
		};

		await processDirectory(targetPath);
	}

	private applySorting(results: TemplateMetadata[], filters: TemplateSearchFilters): void {
		if (!filters.sortBy) return;

		results.sort((a, b) => {
			let aValue: any, bValue: any;

			switch (filters.sortBy) {
				case "downloads":
					aValue = a.stats.downloads;
					bValue = b.stats.downloads;
					break;
				case "rating":
					aValue = a.stats.rating;
					bValue = b.stats.rating;
					break;
				case "updated":
					aValue = new Date(a.updatedAt);
					bValue = new Date(b.updatedAt);
					break;
				case "created":
					aValue = new Date(a.createdAt);
					bValue = new Date(b.createdAt);
					break;
				case "name":
					aValue = a.name.toLowerCase();
					bValue = b.name.toLowerCase();
					break;
				case "trending":
					aValue = this.calculateTrendingScore(a);
					bValue = this.calculateTrendingScore(b);
					break;
				default:
					return 0;
			}

			if (filters.sortOrder === "desc") {
				return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
			} else {
				return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
			}
		});
	}

	private calculateTrendingScore(template: TemplateMetadata): number {
		const downloadScore = template.stats.downloads * 0.3;
		const ratingScore = template.stats.rating * template.stats.reviews * 0.4;
		const recentScore = this.calculateRecentActivity(template, "week") * 0.3;
		
		return downloadScore + ratingScore + recentScore;
	}

	private calculateRecentActivity(template: TemplateMetadata, period: string): number {
		// Mock recent activity calculation
		const daysSinceUpdate = Math.floor(
			(Date.now() - new Date(template.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
		);

		const periodDays = period === "day" ? 1 : period === "week" ? 7 : 30;
		
		if (daysSinceUpdate > periodDays) {
			return 0;
		}

		return Math.max(0, (periodDays - daysSinceUpdate) / periodDays * 100);
	}

	private async calculateDirectorySize(dirPath: string): Promise<number> {
		let totalSize = 0;
		const entries = await readdir(dirPath, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = join(dirPath, entry.name);

			if (entry.isDirectory()) {
				totalSize += await this.calculateDirectorySize(fullPath);
			} else {
				const stats = await stat(fullPath);
				totalSize += stats.size;
			}
		}

		return totalSize;
	}

	private async saveTemplateMetadata(templateId: string, metadata: TemplateMetadata): Promise<void> {
		const metadataPath = join(this.templatesPath, templateId, "metadata.json");
		await writeFile(metadataPath, JSON.stringify(metadata, null, 2));
	}

	private async saveTemplateReview(review: TemplateReview): Promise<void> {
		const reviewsPath = join(this.reviewsPath, `${review.templateId}.json`);
		
		let reviews: TemplateReview[] = [];
		if (existsSync(reviewsPath)) {
			const content = await readFile(reviewsPath, "utf-8");
			reviews = JSON.parse(content);
		}

		reviews.push(review);
		await writeFile(reviewsPath, JSON.stringify(reviews, null, 2));
	}

	private async saveCollection(collection: TemplateCollection): Promise<void> {
		const collectionPath = join(this.collectionsPath, `${collection.id}.json`);
		await writeFile(collectionPath, JSON.stringify(collection, null, 2));
	}

	private async getTemplateReviews(templateId: string): Promise<TemplateReview[]> {
		return this.reviewsCache.get(templateId) || [];
	}

	private async getTemplateFiles(templateId: string): Promise<string[]> {
		const templatePath = join(this.templatesPath, templateId);
		const files: string[] = [];

		const scanDirectory = async (dir: string, relativePath: string = ""): Promise<void> => {
			const entries = await readdir(dir, { withFileTypes: true });

			for (const entry of entries) {
				const fullPath = join(dir, entry.name);
				const relativeFilePath = join(relativePath, entry.name);

				if (entry.isDirectory()) {
					await scanDirectory(fullPath, relativeFilePath);
				} else {
					files.push(relativeFilePath);
				}
			}
		};

		if (existsSync(templatePath)) {
			await scanDirectory(templatePath);
		}

		return files;
	}

	private async recordTemplateView(templateId: string): Promise<void> {
		// Record view for analytics
		logger.debug(`Template view recorded: ${templateId}`);
	}

	private async recordTemplateDownload(
		templateId: string,
		metadata: {
			source: string;
			targetPath: string;
			customizations?: Record<string, any>;
		}
	): Promise<void> {
		// Record download for analytics
		logger.debug(`Template download recorded: ${templateId}`, metadata);
	}

	private async updateTemplateRating(templateId: string): Promise<void> {
		const reviews = this.reviewsCache.get(templateId) || [];
		const template = this.templatesCache.get(templateId);

		if (template && reviews.length > 0) {
			const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
			template.stats.rating = Math.round(avgRating * 10) / 10;
			template.stats.reviews = reviews.length;
			
			this.templatesCache.set(templateId, template);
			await this.saveTemplateMetadata(templateId, template);
		}
	}

	private async initializeTemplateAnalytics(templateId: string): Promise<void> {
		const analyticsDir = join(this.analyticsPath, templateId);
		await mkdir(analyticsDir, { recursive: true });

		// Initialize empty analytics
		const periods = ["day", "week", "month", "year"];
		for (const period of periods) {
			const analyticsPath = join(analyticsDir, `${period}.json`);
			const analytics: TemplateUsageAnalytics = {
				templateId,
				period: period as any,
				downloads: [],
				geography: {},
				frameworks: {},
				projects: [],
				feedback: {
					averageRating: 0,
					completionRate: 0,
					commonIssues: [],
				},
			};

			await writeFile(analyticsPath, JSON.stringify(analytics, null, 2));
		}
	}

	private async loadMockData(): Promise<void> {
		// Load comprehensive mock template data
		const mockTemplates: TemplateMetadata[] = [
			{
				id: "nextjs-saas-starter",
				name: "Next.js SaaS Starter",
				description: "Complete SaaS application starter with authentication, billing, and dashboard",
				author: {
					id: "author_1",
					username: "saasmaster",
					displayName: "SaaS Master",
					email: "saas@example.com",
					avatar: "https://avatars.example.com/saasmaster.png",
				},
				version: "2.1.0",
				category: TemplateCategory.WEB_APP,
				complexity: TemplateComplexity.ADVANCED,
				frameworks: [TemplateFramework.NEXTJS, TemplateFramework.REACT],
				tags: ["saas", "authentication", "billing", "dashboard", "typescript"],
				keywords: ["nextjs", "saas", "stripe", "auth", "dashboard"],
				license: "MIT",
				repository: "https://github.com/saasmaster/nextjs-saas-starter",
				homepage: "https://nextjs-saas-starter.com",
				demo: "https://demo.nextjs-saas-starter.com",
				screenshots: [
					"https://images.example.com/nextjs-saas-1.png",
					"https://images.example.com/nextjs-saas-2.png",
				],
				features: [
					"Next.js 14 with App Router",
					"TypeScript",
					"Tailwind CSS",
					"NextAuth.js authentication",
					"Stripe billing integration",
					"Prisma ORM",
					"PostgreSQL database",
					"Admin dashboard",
					"User management",
					"Email templates",
				],
				requirements: {
					nodeVersion: ">=18.0.0",
					xaheenVersion: "^3.0.0",
					os: ["windows", "macos", "linux"],
					dependencies: {
						"next": "^14.0.0",
						"react": "^18.0.0",
						"typescript": "^5.0.0",
					},
				},
				stats: {
					downloads: 15420,
					stars: 2340,
					forks: 340,
					rating: 4.8,
					reviews: 127,
				},
				flags: {
					verified: true,
					featured: true,
					trending: true,
					deprecated: false,
					nsfw: false,
				},
				createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
				updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
			},
			{
				id: "react-component-library",
				name: "React Component Library",
				description: "Production-ready React component library with Storybook and TypeScript",
				author: {
					id: "author_2",
					username: "componentlord",
					displayName: "Component Lord",
					email: "components@example.com",
				},
				version: "1.5.3",
				category: TemplateCategory.COMPONENT,
				complexity: TemplateComplexity.INTERMEDIATE,
				frameworks: [TemplateFramework.REACT],
				tags: ["components", "library", "storybook", "typescript", "rollup"],
				keywords: ["react", "components", "ui", "library", "storybook"],
				license: "MIT",
				repository: "https://github.com/componentlord/react-component-library",
				features: [
					"TypeScript support",
					"Storybook integration",
					"Rollup bundling",
					"Jest testing",
					"ESLint & Prettier",
					"Automatic documentation",
					"NPM publishing workflow",
				],
				requirements: {
					nodeVersion: ">=16.0.0",
					xaheenVersion: "^3.0.0",
				},
				stats: {
					downloads: 8930,
					stars: 1240,
					forks: 180,
					rating: 4.5,
					reviews: 67,
				},
				flags: {
					verified: true,
					featured: false,
					trending: false,
					deprecated: false,
					nsfw: false,
				},
				createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
				updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
			},
			{
				id: "express-api-boilerplate",
				name: "Express API Boilerplate",
				description: "RESTful API boilerplate with Express, TypeScript, and MongoDB",
				author: {
					id: "author_3",
					username: "apidev",
					displayName: "API Developer",
					email: "api@example.com",
				},
				version: "3.2.1",
				category: TemplateCategory.API,
				complexity: TemplateComplexity.INTERMEDIATE,
				frameworks: [TemplateFramework.EXPRESS, TemplateFramework.NODEJS],
				tags: ["api", "express", "mongodb", "typescript", "rest"],
				keywords: ["express", "api", "rest", "mongodb", "nodejs"],
				license: "MIT",
				features: [
					"Express.js framework",
					"TypeScript",
					"MongoDB with Mongoose",
					"JWT authentication",
					"Input validation",
					"Error handling middleware",
					"API documentation with Swagger",
					"Docker support",
				],
				requirements: {
					nodeVersion: ">=18.0.0",
					xaheenVersion: "^3.0.0",
				},
				stats: {
					downloads: 12100,
					stars: 890,
					forks: 120,
					rating: 4.3,
					reviews: 45,
				},
				flags: {
					verified: true,
					featured: false,
					trending: true,
					deprecated: false,
					nsfw: false,
				},
				createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
				updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
			},
		];

		// Load mock templates into cache
		for (const template of mockTemplates) {
			this.templatesCache.set(template.id, template);
		}

		// Create mock reviews
		const mockReviews: Record<string, TemplateReview[]> = {
			"nextjs-saas-starter": [
				{
					id: "review_1",
					templateId: "nextjs-saas-starter",
					userId: "user_1",
					username: "webdev123",
					rating: 5,
					title: "Amazing SaaS starter!",
					comment: "This template saved me weeks of development time. The authentication and billing integration work perfectly out of the box.",
					pros: ["Complete feature set", "Excellent documentation", "Active maintenance"],
					cons: [],
					usedFor: "B2B SaaS platform",
					verified: true,
					helpfulVotes: 45,
					reportCount: 0,
					createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
					updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
				},
				{
					id: "review_2",
					templateId: "nextjs-saas-starter",
					userId: "user_2",
					username: "startupfounder",
					rating: 4,
					title: "Great for MVP development",
					comment: "Perfect for getting an MVP up and running quickly. Some customization needed for specific use cases.",
					pros: ["Fast setup", "Good architecture", "Stripe integration"],
					cons: ["Limited customization options"],
					usedFor: "Startup MVP",
					verified: true,
					helpfulVotes: 23,
					reportCount: 0,
					createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
					updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
				},
			],
		};

		// Load mock reviews into cache
		for (const [templateId, reviews] of Object.entries(mockReviews)) {
			this.reviewsCache.set(templateId, reviews);
		}

		// Save mock data to persistence
		await this.saveCacheToStorage();
	}

	private async saveCacheToStorage(): Promise<void> {
		try {
			// Save templates
			for (const [id, template] of this.templatesCache.entries()) {
				const templateDir = join(this.templatesPath, id);
				await mkdir(templateDir, { recursive: true });
				await this.saveTemplateMetadata(id, template);
			}

			// Save reviews
			for (const [templateId, reviews] of this.reviewsCache.entries()) {
				await writeFile(
					join(this.reviewsPath, `${templateId}.json`),
					JSON.stringify(reviews, null, 2)
				);
			}

			// Save collections
			for (const [id, collection] of this.collectionsCache.entries()) {
				await this.saveCollection(collection);
			}
		} catch (error) {
			logger.error("Failed to save cache to storage:", error);
		}
	}
}

/**
 * Create template sharing service instance
 */
export function createTemplateSharingService(platformPath?: string): TemplateSharingService {
	return new TemplateSharingService(platformPath);
}

/**
 * Default export
 */
export default TemplateSharingService;