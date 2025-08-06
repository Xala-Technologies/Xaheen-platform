/**
 * Plugin Registry Service
 * Manages the community plugin marketplace with search, filtering, and categorization
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { z } from "zod";
import type { PluginMetadata, PluginRegistryEntry, PluginSearchFilters } from "../plugins/plugin-manager";
import { logger } from "../../utils/logger";

/**
 * Plugin marketplace statistics
 */
export interface PluginMarketplaceStats {
	readonly totalPlugins: number;
	readonly totalDownloads: number;
	readonly avgRating: number;
	readonly categoryCounts: Record<string, number>;
	readonly authorCounts: Record<string, number>;
	readonly certifiedCount: number;
	readonly featuredCount: number;
	readonly recentUpdates: number; // plugins updated in last 30 days
}

/**
 * Plugin submission schema
 */
const PluginSubmissionSchema = z.object({
	name: z.string().min(3).max(50),
	version: z.string().regex(/^\d+\.\d+\.\d+$/),
	description: z.string().min(10).max(500),
	author: z.string().min(2).max(100),
	keywords: z.array(z.string()).min(1).max(10),
	category: z.enum(["generator", "template", "integration", "tool", "theme"]),
	xaheenVersion: z.string(),
	repository: z.string().url().optional(),
	homepage: z.string().url().optional(),
	license: z.string().default("MIT"),
	dependencies: z.record(z.string()).optional(),
	peerDependencies: z.record(z.string()).optional(),
	readme: z.string().optional(),
	changelog: z.string().optional(),
	screenshots: z.array(z.string().url()).optional(),
	tags: z.array(z.string()).optional(),
});

export type PluginSubmission = z.infer<typeof PluginSubmissionSchema>;

/**
 * Plugin review schema
 */
const PluginReviewSchema = z.object({
	id: z.string(),
	pluginName: z.string(),
	userId: z.string(),
	username: z.string(),
	rating: z.number().min(1).max(5),
	title: z.string().max(200),
	comment: z.string().max(2000),
	pros: z.array(z.string()).optional(),
	cons: z.array(z.string()).optional(),
	verified: z.boolean().default(false), // verified purchase/usage
	helpfulVotes: z.number().default(0),
	reportCount: z.number().default(0),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type PluginReview = z.infer<typeof PluginReviewSchema>;

/**
 * Plugin registry service for managing the community marketplace
 */
export class PluginRegistryService {
	private readonly registryPath: string;
	private readonly cachePath: string;
	private readonly pluginsCache: Map<string, PluginRegistryEntry> = new Map();
	private readonly reviewsCache: Map<string, PluginReview[]> = new Map();
	private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes

	constructor(registryPath: string = join(process.cwd(), ".xaheen", "registry")) {
		this.registryPath = registryPath;
		this.cachePath = join(registryPath, "cache");
	}

	/**
	 * Initialize registry service
	 */
	public async initialize(): Promise<void> {
		try {
			// Ensure registry directories exist
			if (!existsSync(this.registryPath)) {
				await mkdir(this.registryPath, { recursive: true });
			}

			if (!existsSync(this.cachePath)) {
				await mkdir(this.cachePath, { recursive: true });
			}

			// Load cached data
			await this.loadCache();

			logger.info("Plugin registry service initialized");
		} catch (error) {
			logger.error("Failed to initialize plugin registry service:", error);
			throw error;
		}
	}

	/**
	 * Search plugins in the registry
	 */
	public async searchPlugins(
		filters: PluginSearchFilters = {},
		options: {
			includeUnpublished?: boolean;
			includeReviews?: boolean;
		} = {}
	): Promise<PluginRegistryEntry[]> {
		try {
			// Refresh cache if expired
			await this.refreshCacheIfNeeded();

			let results = Array.from(this.pluginsCache.values());

			// Apply filters
			if (filters.category) {
				results = results.filter(p => p.metadata.category === filters.category);
			}

			if (filters.keyword) {
				const keyword = filters.keyword.toLowerCase();
				results = results.filter(p =>
					p.metadata.name.toLowerCase().includes(keyword) ||
					p.metadata.description.toLowerCase().includes(keyword) ||
					p.metadata.keywords.some(k => k.toLowerCase().includes(keyword))
				);
			}

			if (filters.author) {
				results = results.filter(p =>
					p.metadata.author.toLowerCase().includes(filters.author!.toLowerCase())
				);
			}

			if (filters.certified !== undefined) {
				results = results.filter(p => p.metadata.certified === filters.certified);
			}

			if (filters.minRating && filters.minRating > 0) {
				results = results.filter(p => p.metadata.rating >= filters.minRating!);
			}

			// Apply sorting
			this.applySorting(results, filters);

			// Apply limit
			if (filters.limit && filters.limit > 0) {
				results = results.slice(0, filters.limit);
			}

			// Load reviews if requested
			if (options.includeReviews) {
				for (const result of results) {
					const reviews = await this.getPluginReviews(result.metadata.name);
					(result as any).reviews = reviews;
				}
			}

			return results;
		} catch (error) {
			logger.error("Failed to search plugins:", error);
			return [];
		}
	}

	/**
	 * Get plugin details by name
	 */
	public async getPlugin(
		pluginName: string,
		options: {
			includeReviews?: boolean;
			includeStats?: boolean;
		} = {}
	): Promise<PluginRegistryEntry | null> {
		try {
			await this.refreshCacheIfNeeded();

			const plugin = this.pluginsCache.get(pluginName);
			if (!plugin) {
				return null;
			}

			const result = { ...plugin };

			if (options.includeReviews) {
				const reviews = await this.getPluginReviews(pluginName);
				(result as any).reviews = reviews;
			}

			if (options.includeStats) {
				const stats = await this.getPluginStats(pluginName);
				(result as any).stats = stats;
			}

			return result;
		} catch (error) {
			logger.error(`Failed to get plugin ${pluginName}:`, error);
			return null;
		}
	}

	/**
	 * Submit a new plugin to the registry
	 */
	public async submitPlugin(
		submission: PluginSubmission,
		authorId: string
	): Promise<{ success: boolean; errors: string[]; pluginId?: string }> {
		const result = { success: false, errors: [] as string[], pluginId: undefined as string | undefined };

		try {
			// Validate submission
			const validatedSubmission = PluginSubmissionSchema.parse(submission);

			// Check if plugin name already exists
			if (this.pluginsCache.has(validatedSubmission.name)) {
				result.errors.push(`Plugin name '${validatedSubmission.name}' already exists`);
				return result;
			}

			// Validate plugin name format
			if (!/^[a-z0-9-]+$/.test(validatedSubmission.name)) {
				result.errors.push("Plugin name must contain only lowercase letters, numbers, and hyphens");
				return result;
			}

			// Create plugin metadata
			const metadata: PluginMetadata = {
				...validatedSubmission,
				certified: false, // New plugins start uncertified
				downloads: 0,
				rating: 0,
				lastUpdated: new Date().toISOString(),
			};

			// Create registry entry
			const pluginEntry: PluginRegistryEntry = {
				metadata,
				downloadUrl: `https://registry.xaheen.com/plugins/${metadata.name}/${metadata.version}.tgz`,
				checksum: `sha256:${this.generateChecksum(metadata)}`,
				verified: false, // Needs manual verification
				featured: false,
			};

			// Save to cache and persistence
			this.pluginsCache.set(metadata.name, pluginEntry);
			await this.savePluginToPersistence(pluginEntry);

			// Create submission record
			await this.createSubmissionRecord(validatedSubmission, authorId);

			result.success = true;
			result.pluginId = metadata.name;

			logger.info(`Plugin submitted successfully: ${metadata.name}`);
		} catch (error) {
			if (error instanceof z.ZodError) {
				result.errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
			} else {
				result.errors.push(`Submission failed: ${error}`);
			}

			logger.error("Plugin submission failed:", error);
		}

		return result;
	}

	/**
	 * Update an existing plugin
	 */
	public async updatePlugin(
		pluginName: string,
		updates: Partial<PluginSubmission>,
		authorId: string
	): Promise<{ success: boolean; errors: string[] }> {
		const result = { success: false, errors: [] as string[] };

		try {
			const existingPlugin = this.pluginsCache.get(pluginName);
			if (!existingPlugin) {
				result.errors.push(`Plugin '${pluginName}' not found`);
				return result;
			}

			// Verify author permissions
			const hasPermission = await this.verifyAuthorPermissions(pluginName, authorId);
			if (!hasPermission) {
				result.errors.push("You don't have permission to update this plugin");
				return result;
			}

			// Apply updates
			const updatedMetadata: PluginMetadata = {
				...existingPlugin.metadata,
				...updates,
				lastUpdated: new Date().toISOString(),
			};

			// Validate updated data
			PluginSubmissionSchema.parse(updatedMetadata);

			// Update plugin entry
			const updatedEntry: PluginRegistryEntry = {
				...existingPlugin,
				metadata: updatedMetadata,
				checksum: `sha256:${this.generateChecksum(updatedMetadata)}`,
			};

			// Save changes
			this.pluginsCache.set(pluginName, updatedEntry);
			await this.savePluginToPersistence(updatedEntry);

			result.success = true;

			logger.info(`Plugin updated successfully: ${pluginName}`);
		} catch (error) {
			if (error instanceof z.ZodError) {
				result.errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
			} else {
				result.errors.push(`Update failed: ${error}`);
			}

			logger.error(`Plugin update failed for ${pluginName}:`, error);
		}

		return result;
	}

	/**
	 * Get marketplace statistics
	 */
	public async getMarketplaceStats(): Promise<PluginMarketplaceStats> {
		try {
			await this.refreshCacheIfNeeded();

			const plugins = Array.from(this.pluginsCache.values());
			const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

			const stats: PluginMarketplaceStats = {
				totalPlugins: plugins.length,
				totalDownloads: plugins.reduce((sum, p) => sum + p.metadata.downloads, 0),
				avgRating: plugins.length > 0 
					? plugins.reduce((sum, p) => sum + p.metadata.rating, 0) / plugins.length 
					: 0,
				categoryCounts: {},
				authorCounts: {},
				certifiedCount: plugins.filter(p => p.metadata.certified).length,
				featuredCount: plugins.filter(p => p.featured).length,
				recentUpdates: plugins.filter(p => 
					new Date(p.metadata.lastUpdated) > thirtyDaysAgo
				).length,
			};

			// Calculate category counts
			for (const plugin of plugins) {
				const category = plugin.metadata.category;
				stats.categoryCounts[category] = (stats.categoryCounts[category] || 0) + 1;

				const author = plugin.metadata.author;
				stats.authorCounts[author] = (stats.authorCounts[author] || 0) + 1;
			}

			return stats;
		} catch (error) {
			logger.error("Failed to get marketplace stats:", error);
			return {
				totalPlugins: 0,
				totalDownloads: 0,
				avgRating: 0,
				categoryCounts: {},
				authorCounts: {},
				certifiedCount: 0,
				featuredCount: 0,
				recentUpdates: 0,
			};
		}
	}

	/**
	 * Add a review for a plugin
	 */
	public async addPluginReview(
		pluginName: string,
		review: Omit<PluginReview, 'id' | 'createdAt' | 'updatedAt'>
	): Promise<{ success: boolean; reviewId?: string; errors: string[] }> {
		const result = { success: false, reviewId: undefined as string | undefined, errors: [] as string[] };

		try {
			// Validate review
			const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const fullReview: PluginReview = {
				...review,
				id: reviewId,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			PluginReviewSchema.parse(fullReview);

			// Check if plugin exists
			if (!this.pluginsCache.has(pluginName)) {
				result.errors.push(`Plugin '${pluginName}' not found`);
				return result;
			}

			// Add review to cache
			const existingReviews = this.reviewsCache.get(pluginName) || [];
			existingReviews.push(fullReview);
			this.reviewsCache.set(pluginName, existingReviews);

			// Update plugin rating
			await this.updatePluginRating(pluginName);

			// Save review to persistence
			await this.saveReviewToPersistence(fullReview);

			result.success = true;
			result.reviewId = reviewId;

			logger.info(`Review added for plugin: ${pluginName}`);
		} catch (error) {
			if (error instanceof z.ZodError) {
				result.errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
			} else {
				result.errors.push(`Review submission failed: ${error}`);
			}

			logger.error(`Failed to add review for plugin ${pluginName}:`, error);
		}

		return result;
	}

	/**
	 * Get reviews for a plugin
	 */
	public async getPluginReviews(
		pluginName: string,
		options: {
			limit?: number;
			offset?: number;
			sortBy?: 'newest' | 'oldest' | 'rating' | 'helpful';
		} = {}
	): Promise<PluginReview[]> {
		try {
			let reviews = this.reviewsCache.get(pluginName) || [];

			// Apply sorting
			const sortBy = options.sortBy || 'newest';
			reviews = [...reviews].sort((a, b) => {
				switch (sortBy) {
					case 'newest':
						return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
					case 'oldest':
						return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
					case 'rating':
						return b.rating - a.rating;
					case 'helpful':
						return b.helpfulVotes - a.helpfulVotes;
					default:
						return 0;
				}
			});

			// Apply pagination
			const offset = options.offset || 0;
			const limit = options.limit || 20;
			
			return reviews.slice(offset, offset + limit);
		} catch (error) {
			logger.error(`Failed to get reviews for plugin ${pluginName}:`, error);
			return [];
		}
	}

	// Private helper methods

	private async loadCache(): Promise<void> {
		try {
			// Load plugins cache
			const pluginsCachePath = join(this.cachePath, "plugins.json");
			if (existsSync(pluginsCachePath)) {
				const content = await readFile(pluginsCachePath, "utf-8");
				const plugins = JSON.parse(content);
				
				for (const [name, entry] of Object.entries(plugins)) {
					this.pluginsCache.set(name, entry as PluginRegistryEntry);
				}
			}

			// Load reviews cache
			const reviewsCachePath = join(this.cachePath, "reviews.json");
			if (existsSync(reviewsCachePath)) {
				const content = await readFile(reviewsCachePath, "utf-8");
				const reviews = JSON.parse(content);
				
				for (const [pluginName, pluginReviews] of Object.entries(reviews)) {
					this.reviewsCache.set(pluginName, pluginReviews as PluginReview[]);
				}
			}

			// Load mock data if cache is empty
			if (this.pluginsCache.size === 0) {
				await this.loadMockData();
			}
		} catch (error) {
			logger.warn("Failed to load registry cache:", error);
			await this.loadMockData();
		}
	}

	private async saveCache(): Promise<void> {
		try {
			// Save plugins cache
			const pluginsCachePath = join(this.cachePath, "plugins.json");
			const pluginsData = Object.fromEntries(this.pluginsCache);
			await writeFile(pluginsCachePath, JSON.stringify(pluginsData, null, 2));

			// Save reviews cache
			const reviewsCachePath = join(this.cachePath, "reviews.json");
			const reviewsData = Object.fromEntries(this.reviewsCache);
			await writeFile(reviewsCachePath, JSON.stringify(reviewsData, null, 2));
		} catch (error) {
			logger.error("Failed to save registry cache:", error);
		}
	}

	private async refreshCacheIfNeeded(): Promise<void> {
		// In a real implementation, this would check if cache needs refreshing
		// For now, we'll just ensure the cache is loaded
		if (this.pluginsCache.size === 0) {
			await this.loadCache();
		}
	}

	private applySorting(results: PluginRegistryEntry[], filters: PluginSearchFilters): void {
		if (!filters.sortBy) return;

		results.sort((a, b) => {
			let aValue: any, bValue: any;

			switch (filters.sortBy) {
				case "downloads":
					aValue = a.metadata.downloads;
					bValue = b.metadata.downloads;
					break;
				case "rating":
					aValue = a.metadata.rating;
					bValue = b.metadata.rating;
					break;
				case "updated":
					aValue = new Date(a.metadata.lastUpdated);
					bValue = new Date(b.metadata.lastUpdated);
					break;
				case "name":
					aValue = a.metadata.name;
					bValue = b.metadata.name;
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

	private generateChecksum(metadata: PluginMetadata): string {
		// Simple checksum generation based on metadata
		const content = JSON.stringify(metadata);
		let hash = 0;
		for (let i = 0; i < content.length; i++) {
			const char = content.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convert to 32-bit integer
		}
		return Math.abs(hash).toString(16);
	}

	private async verifyAuthorPermissions(pluginName: string, authorId: string): Promise<boolean> {
		// In a real implementation, this would check author permissions
		// For now, we'll always return true for simplicity
		return true;
	}

	private async savePluginToPersistence(plugin: PluginRegistryEntry): Promise<void> {
		// Save to cache and trigger cache save
		await this.saveCache();
	}

	private async createSubmissionRecord(submission: PluginSubmission, authorId: string): Promise<void> {
		// In a real implementation, this would create a submission record
		logger.info(`Submission record created for ${submission.name} by ${authorId}`);
	}

	private async updatePluginRating(pluginName: string): Promise<void> {
		const reviews = this.reviewsCache.get(pluginName) || [];
		if (reviews.length === 0) return;

		const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
		const plugin = this.pluginsCache.get(pluginName);
		
		if (plugin) {
			plugin.metadata.rating = Math.round(avgRating * 10) / 10; // Round to 1 decimal place
			await this.savePluginToPersistence(plugin);
		}
	}

	private async saveReviewToPersistence(review: PluginReview): Promise<void> {
		// Save to cache
		await this.saveCache();
	}

	private async getPluginStats(pluginName: string): Promise<any> {
		// In a real implementation, this would return detailed plugin statistics
		return {
			weeklyDownloads: Math.floor(Math.random() * 1000),
			monthlyDownloads: Math.floor(Math.random() * 5000),
			totalReviews: this.reviewsCache.get(pluginName)?.length || 0,
		};
	}

	private async loadMockData(): Promise<void> {
		// Load comprehensive mock plugin data
		const mockPlugins: PluginRegistryEntry[] = [
			{
				metadata: {
					name: "xaheen-react-native-generator",
					version: "1.2.0",
					description: "Advanced React Native generator with Expo support and TypeScript",
					author: "Xala Technologies",
					keywords: ["react-native", "mobile", "expo", "generator", "typescript"],
					category: "generator",
					xaheenVersion: "^3.0.0",
					repository: "https://github.com/xala-technologies/xaheen-react-native-generator",
					homepage: "https://xaheen.com/plugins/react-native-generator",
					license: "MIT",
					certified: true,
					downloads: 25420,
					rating: 4.8,
					lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
					dependencies: {
						"@react-native-community/cli": "^12.0.0",
						"expo": "^49.0.0",
					},
				},
				downloadUrl: "https://registry.xaheen.com/plugins/xaheen-react-native-generator/1.2.0.tgz",
				checksum: "sha256:abc123def456",
				verified: true,
				featured: true,
			},
			{
				metadata: {
					name: "xaheen-graphql-generator",
					version: "2.1.0",
					description: "GraphQL API generator with Apollo Server, type-safe resolvers, and authentication",
					author: "GraphQL Community",
					keywords: ["graphql", "apollo", "api", "generator", "typescript", "authentication"],
					category: "generator",
					xaheenVersion: "^3.0.0",
					repository: "https://github.com/community/xaheen-graphql-generator",
					license: "MIT",
					certified: true,
					downloads: 18930,
					rating: 4.6,
					lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
					dependencies: {
						"apollo-server-express": "^3.0.0",
						"graphql": "^16.0.0",
						"@graphql-tools/schema": "^10.0.0",
					},
				},
				downloadUrl: "https://registry.xaheen.com/plugins/xaheen-graphql-generator/2.1.0.tgz",
				checksum: "sha256:def456ghi789",
				verified: true,
				featured: true,
			},
			{
				metadata: {
					name: "xaheen-microservices-template",
					version: "1.0.5",
					description: "Complete microservices architecture templates with Docker, Kubernetes, and monitoring",
					author: "Enterprise Solutions",
					keywords: ["microservices", "docker", "kubernetes", "template", "monitoring", "distributed"],
					category: "template",
					xaheenVersion: "^3.0.0",
					repository: "https://github.com/enterprise/xaheen-microservices-template",
					license: "MIT",
					certified: true,
					downloads: 22100,
					rating: 4.7,
					lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
				},
				downloadUrl: "https://registry.xaheen.com/plugins/xaheen-microservices-template/1.0.5.tgz",
				checksum: "sha256:ghi789jkl012",
				verified: true,
				featured: true,
			},
			{
				metadata: {
					name: "xaheen-ai-integration",
					version: "0.9.2",
					description: "AI integration toolkit with OpenAI, Claude, and local model support",
					author: "AI Developers",
					keywords: ["ai", "openai", "claude", "llm", "integration", "toolkit"],
					category: "integration",
					xaheenVersion: "^3.0.0",
					repository: "https://github.com/ai-dev/xaheen-ai-integration",
					license: "Apache-2.0",
					certified: false,
					downloads: 8540,
					rating: 4.3,
					lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
					dependencies: {
						"openai": "^4.0.0",
						"@anthropic-ai/sdk": "^0.20.0",
					},
				},
				downloadUrl: "https://registry.xaheen.com/plugins/xaheen-ai-integration/0.9.2.tgz",
				checksum: "sha256:jkl012mno345",
				verified: true,
				featured: false,
			},
			{
				metadata: {
					name: "xaheen-dark-theme",
					version: "2.0.1",
					description: "Beautiful dark theme for Xaheen CLI with syntax highlighting and animations",
					author: "Theme Designers",
					keywords: ["theme", "dark", "ui", "design", "syntax-highlighting"],
					category: "theme",
					xaheenVersion: "^3.0.0",
					repository: "https://github.com/themes/xaheen-dark-theme",
					license: "MIT",
					certified: true,
					downloads: 15670,
					rating: 4.5,
					lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
				},
				downloadUrl: "https://registry.xaheen.com/plugins/xaheen-dark-theme/2.0.1.tgz",
				checksum: "sha256:mno345pqr678",
				verified: true,
				featured: false,
			},
		];

		// Load mock plugins into cache
		for (const plugin of mockPlugins) {
			this.pluginsCache.set(plugin.metadata.name, plugin);
		}

		// Load mock reviews
		const mockReviews: Record<string, PluginReview[]> = {
			"xaheen-react-native-generator": [
				{
					id: "review_1",
					pluginName: "xaheen-react-native-generator",
					userId: "user_123",
					username: "ReactDev",
					rating: 5,
					title: "Excellent React Native generator!",
					comment: "This plugin saved me hours of setup time. The TypeScript integration is perfect and Expo support works flawlessly.",
					pros: ["Easy to use", "Great TypeScript support", "Excellent documentation"],
					cons: [],
					verified: true,
					helpfulVotes: 23,
					reportCount: 0,
					createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
					updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
				},
				{
					id: "review_2",
					pluginName: "xaheen-react-native-generator",
					userId: "user_456",
					username: "MobileDev",
					rating: 4,
					title: "Great plugin with minor issues",
					comment: "Works well overall, but could use better error handling for edge cases.",
					pros: ["Fast generation", "Good defaults"],
					cons: ["Limited customization options"],
					verified: true,
					helpfulVotes: 12,
					reportCount: 0,
					createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
					updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
				},
			],
			"xaheen-graphql-generator": [
				{
					id: "review_3",
					pluginName: "xaheen-graphql-generator",
					userId: "user_789",
					username: "GraphQLExpert",
					rating: 5,
					title: "Perfect for GraphQL APIs",
					comment: "The best GraphQL generator I've used. Type safety and resolver generation are top-notch.",
					pros: ["Type-safe resolvers", "Great Apollo integration", "Excellent documentation"],
					cons: [],
					verified: true,
					helpfulVotes: 34,
					reportCount: 0,
					createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
					updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
				},
			],
		};

		// Load mock reviews into cache
		for (const [pluginName, reviews] of Object.entries(mockReviews)) {
			this.reviewsCache.set(pluginName, reviews);
		}

		// Save to persistence
		await this.saveCache();
	}
}

/**
 * Create plugin registry service instance
 */
export function createPluginRegistryService(registryPath?: string): PluginRegistryService {
	return new PluginRegistryService(registryPath);
}

/**
 * Default export
 */
export default PluginRegistryService;