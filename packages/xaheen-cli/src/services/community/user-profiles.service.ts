/**
 * User Profiles and Contribution Tracking Service
 * Manages user profiles, contribution tracking, and community engagement
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { createHash } from "crypto";
import { existsSync } from "fs";
import { mkdir, writeFile, readFile, readdir } from "fs/promises";
import { join } from "path";
import { z } from "zod";
import { logger } from "../../utils/logger";

/**
 * User role types
 */
export enum UserRole {
	MEMBER = "member",
	CONTRIBUTOR = "contributor",
	MAINTAINER = "maintainer",
	MODERATOR = "moderator",
	ADMIN = "admin",
	VERIFIED_DEVELOPER = "verified-developer",
	ENTERPRISE = "enterprise",
}

/**
 * Badge types
 */
export enum BadgeType {
	// Contribution badges
	FIRST_CONTRIBUTION = "first-contribution",
	HUNDRED_CONTRIBUTIONS = "hundred-contributions",
	THOUSAND_CONTRIBUTIONS = "thousand-contributions",
	
	// Template badges
	TEMPLATE_CREATOR = "template-creator",
	POPULAR_TEMPLATE = "popular-template", // Template with 1000+ downloads
	VIRAL_TEMPLATE = "viral-template", // Template with 10000+ downloads
	
	// Plugin badges
	PLUGIN_DEVELOPER = "plugin-developer",
	VERIFIED_PLUGIN = "verified-plugin",
	MONETIZED_PLUGIN = "monetized-plugin",
	
	// Community badges
	HELPFUL_REVIEWER = "helpful-reviewer", // 100+ helpful reviews
	MENTOR = "mentor", // Helped 50+ developers
	COMMUNITY_CHAMPION = "community-champion", // Top 1% contributors
	
	// Learning badges
	TUTORIAL_COMPLETED = "tutorial-completed",
	QUICK_LEARNER = "quick-learner", // Completed tutorials fast
	KNOWLEDGE_SEEKER = "knowledge-seeker", // Completed 10+ tutorials
	
	// Special badges
	EARLY_ADOPTER = "early-adopter",
	BETA_TESTER = "beta-tester",
	CONFERENCE_SPEAKER = "conference-speaker",
	OSS_CONTRIBUTOR = "oss-contributor", // Contributed to Xaheen OSS
	
	// Norwegian specific
	NORWEGIAN_EXPERT = "norwegian-expert", // Expert in Norwegian compliance
	NSM_CERTIFIED = "nsm-certified", // NSM security certified
}

/**
 * Contribution types
 */
export enum ContributionType {
	TEMPLATE_SUBMISSION = "template-submission",
	PLUGIN_DEVELOPMENT = "plugin-development",
	TUTORIAL_CREATION = "tutorial-creation",
	DOCUMENTATION = "documentation",
	BUG_REPORT = "bug-report",
	FEATURE_REQUEST = "feature-request",
	CODE_REVIEW = "code-review",
	COMMUNITY_HELP = "community-help",
	TRANSLATION = "translation",
	TESTING = "testing",
	DESIGN = "design",
	VIDEO_TUTORIAL = "video-tutorial",
}

/**
 * User profile schema
 */
const UserProfileSchema = z.object({
	id: z.string(),
	username: z.string().min(3).max(30),
	displayName: z.string().min(1).max(100),
	email: z.string().email(),
	avatar: z.string().url().optional(),
	bio: z.string().max(500).optional(),
	location: z.string().max(100).optional(),
	website: z.string().url().optional(),
	githubUsername: z.string().optional(),
	twitterHandle: z.string().optional(),
	linkedinProfile: z.string().url().optional(),
	
	// Profile settings
	isPublic: z.boolean().default(true),
	showEmail: z.boolean().default(false),
	showLocation: z.boolean().default(true),
	allowMessages: z.boolean().default(true),
	
	// Account info
	role: z.nativeEnum(UserRole).default(UserRole.MEMBER),
	verified: z.boolean().default(false),
	badges: z.array(z.nativeEnum(BadgeType)).default([]),
	
	// Statistics
	stats: z.object({
		totalContributions: z.number().default(0),
		templatesCreated: z.number().default(0),
		pluginsCreated: z.number().default(0),
		tutorialsCompleted: z.number().default(0),
		reviewsWritten: z.number().default(0),
		helpfulVotes: z.number().default(0),
		downloadCount: z.number().default(0), // Total downloads of user's content
		followers: z.number().default(0),
		following: z.number().default(0),
		reputation: z.number().default(0),
	}),
	
	// Preferences
	preferences: z.object({
		language: z.string().default("en"),
		timezone: z.string().default("UTC"),
		emailNotifications: z.boolean().default(true),
		weeklyDigest: z.boolean().default(true),
		newFollowerNotification: z.boolean().default(true),
		contributionReminders: z.boolean().default(true),
	}),
	
	// Skills and interests
	skills: z.array(z.string()).default([]),
	interests: z.array(z.string()).default([]),
	frameworks: z.array(z.string()).default([]),
	languages: z.array(z.string()).default([]), // Programming languages
	
	// Timestamps
	joinedAt: z.string(),
	lastActiveAt: z.string(),
	lastProfileUpdate: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

/**
 * Contribution record schema
 */
const ContributionSchema = z.object({
	id: z.string(),
	userId: z.string(),
	type: z.nativeEnum(ContributionType),
	title: z.string(),
	description: z.string(),
	url: z.string().url().optional(), // Link to the contribution
	metadata: z.record(z.any()).optional(), // Additional data specific to contribution type
	
	// Impact metrics
	impact: z.object({
		views: z.number().default(0),
		downloads: z.number().default(0),
		stars: z.number().default(0),
		forks: z.number().default(0),
		helpfulVotes: z.number().default(0),
		comments: z.number().default(0),
	}),
	
	// Recognition
	featured: z.boolean().default(false),
	verified: z.boolean().default(false),
	reputationPoints: z.number().default(0),
	
	// Timestamps
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type Contribution = z.infer<typeof ContributionSchema>;

/**
 * Achievement tracking
 */
export interface Achievement {
	readonly id: string;
	readonly badgeType: BadgeType;
	readonly userId: string;
	readonly title: string;
	readonly description: string;
	readonly criteria: string;
	readonly unlockedAt: string;
	readonly progress?: {
		readonly current: number;
		readonly target: number;
		readonly percentage: number;
	};
}

/**
 * User activity timeline
 */
export interface ActivityItem {
	readonly id: string;
	readonly userId: string;
	readonly type: "contribution" | "achievement" | "follow" | "like" | "comment";
	readonly title: string;
	readonly description: string;
	readonly url?: string;
	readonly metadata?: Record<string, any>;
	readonly timestamp: string;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
	readonly rank: number;
	readonly userId: string;
	readonly username: string;
	readonly displayName: string;
	readonly avatar?: string;
	readonly score: number;
	readonly badge?: BadgeType;
	readonly change: number; // Position change from previous period
}

/**
 * User profiles and contribution tracking service
 */
export class UserProfilesService {
	private readonly profilesPath: string;
	private readonly contributionsPath: string;
	private readonly achievementsPath: string;
	private readonly activityPath: string;
	private readonly profilesCache: Map<string, UserProfile> = new Map();
	private readonly contributionsCache: Map<string, Contribution[]> = new Map();
	private readonly achievementsCache: Map<string, Achievement[]> = new Map();

	constructor(basePath: string = join(process.cwd(), ".xaheen", "community")) {
		this.profilesPath = join(basePath, "profiles");
		this.contributionsPath = join(basePath, "contributions");
		this.achievementsPath = join(basePath, "achievements");
		this.activityPath = join(basePath, "activity");
	}

	/**
	 * Initialize user profiles service
	 */
	public async initialize(): Promise<void> {
		try {
			// Ensure directories exist
			const directories = [
				this.profilesPath,
				this.contributionsPath,
				this.achievementsPath,
				this.activityPath,
			];

			for (const dir of directories) {
				if (!existsSync(dir)) {
					await mkdir(dir, { recursive: true });
				}
			}

			// Load cached data
			await this.loadCache();

			logger.info("User profiles service initialized");
		} catch (error) {
			logger.error("Failed to initialize user profiles service:", error);
			throw error;
		}
	}

	/**
	 * Create or update user profile
	 */
	public async createOrUpdateProfile(
		userId: string,
		profileData: Partial<Omit<UserProfile, "id" | "joinedAt" | "stats">>
	): Promise<{
		success: boolean;
		profile?: UserProfile;
		errors: string[];
	}> {
		const result = {
			success: false,
			profile: undefined as UserProfile | undefined,
			errors: [] as string[],
		};

		try {
			// Get existing profile or create new one
			let profile = this.profilesCache.get(userId);
			const isNewProfile = !profile;

			if (isNewProfile) {
				// Create new profile
				profile = {
					id: userId,
					username: profileData.username || `user_${userId}`,
					displayName: profileData.displayName || profileData.username || `User ${userId}`,
					email: profileData.email || `${userId}@example.com`,
					avatar: profileData.avatar,
					bio: profileData.bio,
					location: profileData.location,
					website: profileData.website,
					githubUsername: profileData.githubUsername,
					twitterHandle: profileData.twitterHandle,
					linkedinProfile: profileData.linkedinProfile,
					isPublic: profileData.isPublic ?? true,
					showEmail: profileData.showEmail ?? false,
					showLocation: profileData.showLocation ?? true,
					allowMessages: profileData.allowMessages ?? true,
					role: profileData.role || UserRole.MEMBER,
					verified: profileData.verified || false,
					badges: profileData.badges || [],
					stats: {
						totalContributions: 0,
						templatesCreated: 0,
						pluginsCreated: 0,
						tutorialsCompleted: 0,
						reviewsWritten: 0,
						helpfulVotes: 0,
						downloadCount: 0,
						followers: 0,
						following: 0,
						reputation: 0,
					},
					preferences: {
						language: profileData.preferences?.language || "en",
						timezone: profileData.preferences?.timezone || "UTC",
						emailNotifications: profileData.preferences?.emailNotifications ?? true,
						weeklyDigest: profileData.preferences?.weeklyDigest ?? true,
						newFollowerNotification: profileData.preferences?.newFollowerNotification ?? true,
						contributionReminders: profileData.preferences?.contributionReminders ?? true,
					},
					skills: profileData.skills || [],
					interests: profileData.interests || [],
					frameworks: profileData.frameworks || [],
					languages: profileData.languages || [],
					joinedAt: new Date().toISOString(),
					lastActiveAt: new Date().toISOString(),
					lastProfileUpdate: new Date().toISOString(),
				};

				// Award first-timer badge
				if (!profile.badges.includes(BadgeType.FIRST_CONTRIBUTION)) {
					await this.awardBadge(userId, BadgeType.FIRST_CONTRIBUTION);
				}
			} else {
				// Update existing profile
				profile = {
					...profile,
					...profileData,
					lastProfileUpdate: new Date().toISOString(),
					lastActiveAt: new Date().toISOString(),
				};
			}

			// Validate profile
			const validatedProfile = UserProfileSchema.parse(profile);

			// Save profile
			this.profilesCache.set(userId, validatedProfile);
			await this.saveProfile(validatedProfile);

			// Record activity
			if (isNewProfile) {
				await this.recordActivity({
					userId,
					type: "contribution",
					title: "Joined the community",
					description: `${validatedProfile.displayName} joined the Xaheen community`,
				});
			}

			result.success = true;
			result.profile = validatedProfile;

			logger.info(`User profile ${isNewProfile ? "created" : "updated"}: ${userId}`);

		} catch (error) {
			if (error instanceof z.ZodError) {
				result.errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
			} else {
				result.errors.push(`Profile operation failed: ${error}`);
			}

			logger.error(`Failed to create/update profile for user ${userId}:`, error);
		}

		return result;
	}

	/**
	 * Get user profile
	 */
	public async getUserProfile(
		userId: string,
		options: {
			includePrivateInfo?: boolean;
			includeContributions?: boolean;
			includeAchievements?: boolean;
		} = {}
	): Promise<UserProfile | null> {
		try {
			let profile = this.profilesCache.get(userId);

			if (!profile) {
				// Try to load from storage
				const profilePath = join(this.profilesPath, `${userId}.json`);
				if (existsSync(profilePath)) {
					const content = await readFile(profilePath, "utf-8");
					profile = UserProfileSchema.parse(JSON.parse(content));
					this.profilesCache.set(userId, profile);
				}
			}

			if (!profile) {
				return null;
			}

			// Filter private information if needed
			if (!options.includePrivateInfo && !profile.showEmail) {
				profile = { ...profile, email: "" };
			}

			// Update last active time
			profile.lastActiveAt = new Date().toISOString();
			this.profilesCache.set(userId, profile);
			await this.saveProfile(profile);

			return profile;

		} catch (error) {
			logger.error(`Failed to get profile for user ${userId}:`, error);
			return null;
		}
	}

	/**
	 * Record user contribution
	 */
	public async recordContribution(
		userId: string,
		contribution: Omit<Contribution, "id" | "userId" | "createdAt" | "updatedAt">
	): Promise<{
		success: boolean;
		contributionId?: string;
		badgesAwarded?: BadgeType[];
		errors: string[];
	}> {
		const result = {
			success: false,
			contributionId: undefined as string | undefined,
			badgesAwarded: [] as BadgeType[],
			errors: [] as string[],
		};

		try {
			// Create contribution record
			const contributionId = `contrib_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const contributionRecord: Contribution = {
				...contribution,
				id: contributionId,
				userId,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			// Validate contribution
			const validatedContribution = ContributionSchema.parse(contributionRecord);

			// Save contribution
			const userContributions = this.contributionsCache.get(userId) || [];
			userContributions.push(validatedContribution);
			this.contributionsCache.set(userId, userContributions);
			await this.saveContribution(validatedContribution);

			// Update user stats
			await this.updateUserStats(userId, validatedContribution);

			// Check for badge eligibility
			const newBadges = await this.checkBadgeEligibility(userId, validatedContribution);
			for (const badge of newBadges) {
				await this.awardBadge(userId, badge);
			}

			// Record activity
			await this.recordActivity({
				userId,
				type: "contribution",
				title: validatedContribution.title,
				description: validatedContribution.description,
				url: validatedContribution.url,
				metadata: { contributionType: validatedContribution.type },
			});

			result.success = true;
			result.contributionId = contributionId;
			result.badgesAwarded = newBadges;

			logger.info(`Contribution recorded: ${contributionId} for user ${userId}`);

		} catch (error) {
			if (error instanceof z.ZodError) {
				result.errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
			} else {
				result.errors.push(`Contribution recording failed: ${error}`);
			}

			logger.error(`Failed to record contribution for user ${userId}:`, error);
		}

		return result;
	}

	/**
	 * Get user contributions
	 */
	public async getUserContributions(
		userId: string,
		filters: {
			type?: ContributionType;
			featured?: boolean;
			limit?: number;
			offset?: number;
		} = {}
	): Promise<{
		contributions: Contribution[];
		total: number;
		hasMore: boolean;
	}> {
		try {
			let contributions = this.contributionsCache.get(userId) || [];

			// Apply filters
			if (filters.type) {
				contributions = contributions.filter(c => c.type === filters.type);
			}

			if (filters.featured !== undefined) {
				contributions = contributions.filter(c => c.featured === filters.featured);
			}

			// Sort by creation date (newest first)
			contributions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

			// Apply pagination
			const offset = filters.offset || 0;
			const limit = filters.limit || 20;
			const total = contributions.length;
			const paginatedContributions = contributions.slice(offset, offset + limit);
			const hasMore = offset + limit < total;

			return {
				contributions: paginatedContributions,
				total,
				hasMore,
			};

		} catch (error) {
			logger.error(`Failed to get contributions for user ${userId}:`, error);
			return {
				contributions: [],
				total: 0,
				hasMore: false,
			};
		}
	}

	/**
	 * Get leaderboard
	 */
	public async getLeaderboard(
		metric: "reputation" | "contributions" | "downloads" | "helpfulVotes" = "reputation",
		period: "week" | "month" | "quarter" | "year" | "all" = "all",
		limit: number = 50
	): Promise<LeaderboardEntry[]> {
		try {
			const profiles = Array.from(this.profilesCache.values());

			// Filter profiles based on period (simplified implementation)
			let filteredProfiles = profiles;
			if (period !== "all") {
				// In a real implementation, this would filter based on activity in the specified period
				filteredProfiles = profiles.filter(p => {
					const daysSinceJoined = Math.floor(
						(Date.now() - new Date(p.joinedAt).getTime()) / (1000 * 60 * 60 * 24)
					);
					
					switch (period) {
						case "week": return daysSinceJoined <= 7;
						case "month": return daysSinceJoined <= 30;
						case "quarter": return daysSinceJoined <= 90;
						case "year": return daysSinceJoined <= 365;
						default: return true;
					}
				});
			}

			// Sort by selected metric
			filteredProfiles.sort((a, b) => {
				switch (metric) {
					case "reputation":
						return b.stats.reputation - a.stats.reputation;
					case "contributions":
						return b.stats.totalContributions - a.stats.totalContributions;
					case "downloads":
						return b.stats.downloadCount - a.stats.downloadCount;
					case "helpfulVotes":
						return b.stats.helpfulVotes - a.stats.helpfulVotes;
					default:
						return 0;
				}
			});

			// Create leaderboard entries
			const leaderboard: LeaderboardEntry[] = filteredProfiles.slice(0, limit).map((profile, index) => {
				let score: number;
				switch (metric) {
					case "reputation":
						score = profile.stats.reputation;
						break;
					case "contributions":
						score = profile.stats.totalContributions;
						break;
					case "downloads":
						score = profile.stats.downloadCount;
						break;
					case "helpfulVotes":
						score = profile.stats.helpfulVotes;
						break;
					default:
						score = 0;
				}

				// Determine top badge
				const topBadge = this.getTopBadge(profile.badges);

				return {
					rank: index + 1,
					userId: profile.id,
					username: profile.username,
					displayName: profile.displayName,
					avatar: profile.avatar,
					score,
					badge: topBadge,
					change: 0, // Simplified - would track position changes in real implementation
				};
			});

			return leaderboard;

		} catch (error) {
			logger.error(`Failed to get leaderboard for metric ${metric}:`, error);
			return [];
		}
	}

	/**
	 * Get user activity timeline
	 */
	public async getUserActivity(
		userId: string,
		limit: number = 20
	): Promise<ActivityItem[]> {
		try {
			const activityPath = join(this.activityPath, `${userId}.json`);
			
			if (!existsSync(activityPath)) {
				return [];
			}

			const content = await readFile(activityPath, "utf-8");
			const activities = JSON.parse(content) as ActivityItem[];

			// Sort by timestamp (newest first) and limit
			return activities
				.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
				.slice(0, limit);

		} catch (error) {
			logger.error(`Failed to get activity for user ${userId}:`, error);
			return [];
		}
	}

	/**
	 * Search user profiles
	 */
	public async searchProfiles(
		query: string,
		filters: {
			role?: UserRole;
			verified?: boolean;
			skills?: string[];
			location?: string;
			limit?: number;
		} = {}
	): Promise<UserProfile[]> {
		try {
			let profiles = Array.from(this.profilesCache.values());

			// Filter public profiles only
			profiles = profiles.filter(p => p.isPublic);

			// Apply text search
			if (query) {
				const lowerQuery = query.toLowerCase();
				profiles = profiles.filter(p =>
					p.username.toLowerCase().includes(lowerQuery) ||
					p.displayName.toLowerCase().includes(lowerQuery) ||
					p.bio?.toLowerCase().includes(lowerQuery) ||
					p.skills.some(skill => skill.toLowerCase().includes(lowerQuery)) ||
					p.interests.some(interest => interest.toLowerCase().includes(lowerQuery))
				);
			}

			// Apply filters
			if (filters.role) {
				profiles = profiles.filter(p => p.role === filters.role);
			}

			if (filters.verified !== undefined) {
				profiles = profiles.filter(p => p.verified === filters.verified);
			}

			if (filters.skills && filters.skills.length > 0) {
				profiles = profiles.filter(p =>
					filters.skills!.some(skill => p.skills.includes(skill))
				);
			}

			if (filters.location) {
				profiles = profiles.filter(p =>
					p.location?.toLowerCase().includes(filters.location!.toLowerCase())
				);
			}

			// Sort by reputation
			profiles.sort((a, b) => b.stats.reputation - a.stats.reputation);

			// Apply limit
			const limit = filters.limit || 50;
			return profiles.slice(0, limit);

		} catch (error) {
			logger.error(`Failed to search profiles with query "${query}":`, error);
			return [];
		}
	}

	// Private helper methods

	private async loadCache(): Promise<void> {
		try {
			// Load profiles
			if (existsSync(this.profilesPath)) {
				const profileFiles = await readdir(this.profilesPath);
				
				for (const file of profileFiles) {
					if (file.endsWith(".json")) {
						const userId = file.replace(".json", "");
						const content = await readFile(join(this.profilesPath, file), "utf-8");
						const profile = UserProfileSchema.parse(JSON.parse(content));
						this.profilesCache.set(userId, profile);
					}
				}
			}

			// Load contributions
			if (existsSync(this.contributionsPath)) {
				const contributionFiles = await readdir(this.contributionsPath);
				
				for (const file of contributionFiles) {
					if (file.endsWith(".json")) {
						const userId = file.replace(".json", "");
						const content = await readFile(join(this.contributionsPath, file), "utf-8");
						const contributions = JSON.parse(content).map((c: any) => ContributionSchema.parse(c));
						this.contributionsCache.set(userId, contributions);
					}
				}
			}

			// Load achievements
			if (existsSync(this.achievementsPath)) {
				const achievementFiles = await readdir(this.achievementsPath);
				
				for (const file of achievementFiles) {
					if (file.endsWith(".json")) {
						const userId = file.replace(".json", "");
						const content = await readFile(join(this.achievementsPath, file), "utf-8");
						const achievements = JSON.parse(content);
						this.achievementsCache.set(userId, achievements);
					}
				}
			}

			// Load mock data if cache is empty
			if (this.profilesCache.size === 0) {
				await this.loadMockData();
			}

		} catch (error) {
			logger.warn("Failed to load user profiles cache:", error);
			await this.loadMockData();
		}
	}

	private async saveProfile(profile: UserProfile): Promise<void> {
		const profilePath = join(this.profilesPath, `${profile.id}.json`);
		await writeFile(profilePath, JSON.stringify(profile, null, 2));
	}

	private async saveContribution(contribution: Contribution): Promise<void> {
		const userContributions = this.contributionsCache.get(contribution.userId) || [];
		const contributionsPath = join(this.contributionsPath, `${contribution.userId}.json`);
		await writeFile(contributionsPath, JSON.stringify(userContributions, null, 2));
	}

	private async updateUserStats(userId: string, contribution: Contribution): Promise<void> {
		const profile = this.profilesCache.get(userId);
		if (!profile) return;

		// Update stats based on contribution type
		profile.stats.totalContributions++;

		switch (contribution.type) {
			case ContributionType.TEMPLATE_SUBMISSION:
				profile.stats.templatesCreated++;
				break;
			case ContributionType.PLUGIN_DEVELOPMENT:
				profile.stats.pluginsCreated++;
				break;
			case ContributionType.CODE_REVIEW:
				profile.stats.reviewsWritten++;
				break;
		}

		// Update reputation based on contribution impact
		const reputationGain = this.calculateReputationGain(contribution);
		profile.stats.reputation += reputationGain;

		// Save updated profile
		this.profilesCache.set(userId, profile);
		await this.saveProfile(profile);
	}

	private calculateReputationGain(contribution: Contribution): number {
		let basePoints = 0;

		switch (contribution.type) {
			case ContributionType.TEMPLATE_SUBMISSION:
				basePoints = 50;
				break;
			case ContributionType.PLUGIN_DEVELOPMENT:
				basePoints = 100;
				break;
			case ContributionType.TUTORIAL_CREATION:
				basePoints = 75;
				break;
			case ContributionType.DOCUMENTATION:
				basePoints = 25;
				break;
			case ContributionType.BUG_REPORT:
				basePoints = 10;
				break;
			case ContributionType.COMMUNITY_HELP:
				basePoints = 15;
				break;
			default:
				basePoints = 5;
		}

		// Bonus for high-impact contributions
		const impactMultiplier = Math.min(2.0, 1 + (contribution.impact.views / 1000) * 0.1);
		
		return Math.round(basePoints * impactMultiplier);
	}

	private async checkBadgeEligibility(userId: string, contribution: Contribution): Promise<BadgeType[]> {
		const newBadges: BadgeType[] = [];
		const profile = this.profilesCache.get(userId);
		if (!profile) return newBadges;

		// Check contribution-based badges
		if (profile.stats.totalContributions >= 100 && !profile.badges.includes(BadgeType.HUNDRED_CONTRIBUTIONS)) {
			newBadges.push(BadgeType.HUNDRED_CONTRIBUTIONS);
		}

		if (profile.stats.totalContributions >= 1000 && !profile.badges.includes(BadgeType.THOUSAND_CONTRIBUTIONS)) {
			newBadges.push(BadgeType.THOUSAND_CONTRIBUTIONS);
		}

		// Check template-based badges
		if (contribution.type === ContributionType.TEMPLATE_SUBMISSION && !profile.badges.includes(BadgeType.TEMPLATE_CREATOR)) {
			newBadges.push(BadgeType.TEMPLATE_CREATOR);
		}

		// Check plugin-based badges
		if (contribution.type === ContributionType.PLUGIN_DEVELOPMENT && !profile.badges.includes(BadgeType.PLUGIN_DEVELOPER)) {
			newBadges.push(BadgeType.PLUGIN_DEVELOPER);
		}

		return newBadges;
	}

	private async awardBadge(userId: string, badgeType: BadgeType): Promise<void> {
		try {
			const profile = this.profilesCache.get(userId);
			if (!profile || profile.badges.includes(badgeType)) {
				return;
			}

			// Add badge to profile
			profile.badges.push(badgeType);
			this.profilesCache.set(userId, profile);
			await this.saveProfile(profile);

			// Create achievement record
			const achievement: Achievement = {
				id: `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				badgeType,
				userId,
				title: this.getBadgeTitle(badgeType),
				description: this.getBadgeDescription(badgeType),
				criteria: this.getBadgeCriteria(badgeType),
				unlockedAt: new Date().toISOString(),
			};

			// Save achievement
			const userAchievements = this.achievementsCache.get(userId) || [];
			userAchievements.push(achievement);
			this.achievementsCache.set(userId, userAchievements);

			const achievementsPath = join(this.achievementsPath, `${userId}.json`);
			await writeFile(achievementsPath, JSON.stringify(userAchievements, null, 2));

			// Record activity
			await this.recordActivity({
				userId,
				type: "achievement",
				title: `Badge Unlocked: ${achievement.title}`,
				description: achievement.description,
			});

			logger.info(`Badge awarded: ${badgeType} to user ${userId}`);

		} catch (error) {
			logger.error(`Failed to award badge ${badgeType} to user ${userId}:`, error);
		}
	}

	private getBadgeTitle(badgeType: BadgeType): string {
		const titles: Record<BadgeType, string> = {
			[BadgeType.FIRST_CONTRIBUTION]: "First Contribution",
			[BadgeType.HUNDRED_CONTRIBUTIONS]: "Century Club",
			[BadgeType.THOUSAND_CONTRIBUTIONS]: "Millennium Master",
			[BadgeType.TEMPLATE_CREATOR]: "Template Creator",
			[BadgeType.POPULAR_TEMPLATE]: "Popular Creator",
			[BadgeType.VIRAL_TEMPLATE]: "Viral Sensation",
			[BadgeType.PLUGIN_DEVELOPER]: "Plugin Developer",
			[BadgeType.VERIFIED_PLUGIN]: "Verified Developer",
			[BadgeType.MONETIZED_PLUGIN]: "Entrepreneur",
			[BadgeType.HELPFUL_REVIEWER]: "Helpful Reviewer",
			[BadgeType.MENTOR]: "Community Mentor",
			[BadgeType.COMMUNITY_CHAMPION]: "Community Champion",
			[BadgeType.TUTORIAL_COMPLETED]: "Tutorial Graduate",
			[BadgeType.QUICK_LEARNER]: "Quick Learner",
			[BadgeType.KNOWLEDGE_SEEKER]: "Knowledge Seeker",
			[BadgeType.EARLY_ADOPTER]: "Early Adopter",
			[BadgeType.BETA_TESTER]: "Beta Tester",
			[BadgeType.CONFERENCE_SPEAKER]: "Conference Speaker",
			[BadgeType.OSS_CONTRIBUTOR]: "Open Source Hero",
			[BadgeType.NORWEGIAN_EXPERT]: "Norwegian Expert",
			[BadgeType.NSM_CERTIFIED]: "NSM Certified",
		};

		return titles[badgeType] || badgeType;
	}

	private getBadgeDescription(badgeType: BadgeType): string {
		const descriptions: Record<BadgeType, string> = {
			[BadgeType.FIRST_CONTRIBUTION]: "Made their first contribution to the community",
			[BadgeType.HUNDRED_CONTRIBUTIONS]: "Made 100 contributions to the community",
			[BadgeType.THOUSAND_CONTRIBUTIONS]: "Made 1000 contributions to the community",
			[BadgeType.TEMPLATE_CREATOR]: "Created their first template",
			[BadgeType.POPULAR_TEMPLATE]: "Created a template with 1000+ downloads",
			[BadgeType.VIRAL_TEMPLATE]: "Created a template with 10000+ downloads",
			[BadgeType.PLUGIN_DEVELOPER]: "Developed their first plugin",
			[BadgeType.VERIFIED_PLUGIN]: "Created a verified plugin",
			[BadgeType.MONETIZED_PLUGIN]: "Successfully monetized a plugin",
			[BadgeType.HELPFUL_REVIEWER]: "Received 100+ helpful votes on reviews",
			[BadgeType.MENTOR]: "Helped 50+ developers in the community",
			[BadgeType.COMMUNITY_CHAMPION]: "Top 1% contributor in the community",
			[BadgeType.TUTORIAL_COMPLETED]: "Completed their first tutorial",
			[BadgeType.QUICK_LEARNER]: "Completed tutorials faster than average",
			[BadgeType.KNOWLEDGE_SEEKER]: "Completed 10+ tutorials",
			[BadgeType.EARLY_ADOPTER]: "Joined the community in its early days",
			[BadgeType.BETA_TESTER]: "Participated in beta testing programs",
			[BadgeType.CONFERENCE_SPEAKER]: "Spoke at a tech conference about Xaheen",
			[BadgeType.OSS_CONTRIBUTOR]: "Contributed to Xaheen open source projects",
			[BadgeType.NORWEGIAN_EXPERT]: "Expert in Norwegian compliance and regulations",
			[BadgeType.NSM_CERTIFIED]: "Certified in NSM security standards",
		};

		return descriptions[badgeType] || "Special achievement unlocked";
	}

	private getBadgeCriteria(badgeType: BadgeType): string {
		// Return the criteria for earning this badge
		return `Unlocked by meeting the requirements for ${this.getBadgeTitle(badgeType)}`;
	}

	private getTopBadge(badges: BadgeType[]): BadgeType | undefined {
		// Define badge hierarchy (most prestigious first)
		const hierarchy = [
			BadgeType.COMMUNITY_CHAMPION,
			BadgeType.NSM_CERTIFIED,
			BadgeType.CONFERENCE_SPEAKER,
			BadgeType.OSS_CONTRIBUTOR,
			BadgeType.NORWEGIAN_EXPERT,
			BadgeType.THOUSAND_CONTRIBUTIONS,
			BadgeType.VIRAL_TEMPLATE,
			BadgeType.MONETIZED_PLUGIN,
			BadgeType.VERIFIED_PLUGIN,
			BadgeType.MENTOR,
			BadgeType.HUNDRED_CONTRIBUTIONS,
			BadgeType.POPULAR_TEMPLATE,
			BadgeType.HELPFUL_REVIEWER,
			BadgeType.PLUGIN_DEVELOPER,
			BadgeType.TEMPLATE_CREATOR,
			BadgeType.KNOWLEDGE_SEEKER,
			BadgeType.BETA_TESTER,
			BadgeType.EARLY_ADOPTER,
			BadgeType.QUICK_LEARNER,
			BadgeType.TUTORIAL_COMPLETED,
			BadgeType.FIRST_CONTRIBUTION,
		];

		for (const badge of hierarchy) {
			if (badges.includes(badge)) {
				return badge;
			}
		}

		return undefined;
	}

	private async recordActivity(activity: Omit<ActivityItem, "id" | "timestamp">): Promise<void> {
		try {
			const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const activityItem: ActivityItem = {
				...activity,
				id: activityId,
				timestamp: new Date().toISOString(),
			};

			// Load existing activities
			const activityPath = join(this.activityPath, `${activity.userId}.json`);
			let activities: ActivityItem[] = [];
			
			if (existsSync(activityPath)) {
				const content = await readFile(activityPath, "utf-8");
				activities = JSON.parse(content);
			}

			// Add new activity
			activities.unshift(activityItem); // Add to beginning

			// Keep only last 100 activities per user
			activities = activities.slice(0, 100);

			// Save activities
			await writeFile(activityPath, JSON.stringify(activities, null, 2));

		} catch (error) {
			logger.error(`Failed to record activity for user ${activity.userId}:`, error);
		}
	}

	private async loadMockData(): Promise<void> {
		// Load comprehensive mock user data
		const mockProfiles: UserProfile[] = [
			{
				id: "user_1",
				username: "xaheen_master",
				displayName: "Xaheen Master",
				email: "master@xaheen-ai.com",
				avatar: "https://avatars.example.com/xaheen_master.png",
				bio: "Full-stack developer passionate about building amazing applications with Xaheen CLI. Norwegian compliance expert.",
				location: "Oslo, Norway",
				website: "https://xaheenmaster.dev",
				githubUsername: "xaheen-master",
				twitterHandle: "@xaheenmaster",
				isPublic: true,
				showEmail: false,
				showLocation: true,
				allowMessages: true,
				role: UserRole.VERIFIED_DEVELOPER,
				verified: true,
				badges: [
					BadgeType.COMMUNITY_CHAMPION,
					BadgeType.NORWEGIAN_EXPERT,
					BadgeType.THOUSAND_CONTRIBUTIONS,
					BadgeType.VIRAL_TEMPLATE,
					BadgeType.MENTOR,
					BadgeType.EARLY_ADOPTER,
				],
				stats: {
					totalContributions: 1250,
					templatesCreated: 25,
					pluginsCreated: 8,
					tutorialsCompleted: 15,
					reviewsWritten: 180,
					helpfulVotes: 890,
					downloadCount: 45000,
					followers: 320,
					following: 85,
					reputation: 12500,
				},
				preferences: {
					language: "en",
					timezone: "Europe/Oslo",
					emailNotifications: true,
					weeklyDigest: true,
					newFollowerNotification: true,
					contributionReminders: true,
				},
				skills: ["React", "TypeScript", "Node.js", "Norwegian Compliance", "NSM Security"],
				interests: ["Web Development", "Security", "Open Source", "Teaching"],
				frameworks: ["React", "Next.js", "Express", "NestJS"],
				languages: ["TypeScript", "JavaScript", "Python", "Go"],
				joinedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
				lastActiveAt: new Date().toISOString(),
				lastProfileUpdate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
			},
			{
				id: "user_2",
				username: "react_ninja",
				displayName: "React Ninja",
				email: "ninja@react.dev",
				avatar: "https://avatars.example.com/react_ninja.png",
				bio: "React specialist creating amazing components and teaching others. Love helping the community grow!",
				location: "Bergen, Norway",
				githubUsername: "react-ninja",
				isPublic: true,
				showEmail: false,
				showLocation: true,
				allowMessages: true,
				role: UserRole.CONTRIBUTOR,
				verified: true,
				badges: [
					BadgeType.TEMPLATE_CREATOR,
					BadgeType.POPULAR_TEMPLATE,
					BadgeType.HELPFUL_REVIEWER,
					BadgeType.HUNDRED_CONTRIBUTIONS,
					BadgeType.MENTOR,
				],
				stats: {
					totalContributions: 420,
					templatesCreated: 15,
					pluginsCreated: 3,
					tutorialsCompleted: 8,
					reviewsWritten: 95,
					helpfulVotes: 340,
					downloadCount: 18500,
					followers: 150,
					following: 120,
					reputation: 5800,
				},
				preferences: {
					language: "en",
					timezone: "Europe/Oslo",
					emailNotifications: true,
					weeklyDigest: true,
					newFollowerNotification: true,
					contributionReminders: false,
				},
				skills: ["React", "TypeScript", "CSS", "UI/UX Design"],
				interests: ["Component Libraries", "Design Systems", "Teaching"],
				frameworks: ["React", "Next.js", "Storybook"],
				languages: ["TypeScript", "JavaScript", "CSS"],
				joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
				lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
				lastProfileUpdate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
			},
		];

		// Load mock profiles into cache
		for (const profile of mockProfiles) {
			this.profilesCache.set(profile.id, profile);
			await this.saveProfile(profile);
		}

		// Create mock contributions
		const mockContributions: Record<string, Contribution[]> = {
			user_1: [
				{
					id: "contrib_1",
					userId: "user_1",
					type: ContributionType.TEMPLATE_SUBMISSION,
					title: "Next.js SaaS Starter Template",
					description: "Complete SaaS application template with authentication, billing, and Norwegian compliance",
					url: "https://templates.xaheen.com/nextjs-saas-starter",
					impact: {
						views: 15000,
						downloads: 8500,
						stars: 340,
						forks: 85,
						helpfulVotes: 145,
						comments: 28,
					},
					featured: true,
					verified: true,
					reputationPoints: 850,
					createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
					updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
				},
			],
			user_2: [
				{
					id: "contrib_2",
					userId: "user_2",
					type: ContributionType.TEMPLATE_SUBMISSION,
					title: "React Component Library Template",
					description: "Production-ready React component library with Storybook and TypeScript",
					url: "https://templates.xaheen.com/react-component-library",
					impact: {
						views: 8500,
						downloads: 3200,
						stars: 125,
						forks: 35,
						helpfulVotes: 78,
						comments: 15,
					},
					featured: false,
					verified: true,
					reputationPoints: 320,
					createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
					updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
				},
			],
		};

		// Load mock contributions into cache
		for (const [userId, contributions] of Object.entries(mockContributions)) {
			this.contributionsCache.set(userId, contributions);
			await this.saveContribution(contributions[0]); // Save first contribution as example
		}

		logger.info("Mock user profiles data loaded");
	}
}

/**
 * Create user profiles service instance
 */
export function createUserProfilesService(basePath?: string): UserProfilesService {
	return new UserProfilesService(basePath);
}

/**
 * Default export
 */
export default UserProfilesService;