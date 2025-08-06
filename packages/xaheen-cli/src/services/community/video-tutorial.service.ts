/**
 * Video Tutorial Integration Service
 * Provides seamless integration with video tutorials and streaming platforms
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { mkdir, writeFile, readFile, readdir } from "fs/promises";
import { join } from "path";
import { z } from "zod";
import { logger } from "../../utils/logger";

/**
 * Video providers
 */
export enum VideoProvider {
	YOUTUBE = "youtube",
	VIMEO = "vimeo",
	TWITCH = "twitch",
	WISTIA = "wistia",
	LOOM = "loom",
	CUSTOM = "custom",
}

/**
 * Video quality options
 */
export enum VideoQuality {
	LOW = "360p",
	MEDIUM = "720p",
	HIGH = "1080p",
	ULTRA = "4K",
	AUTO = "auto",
}

/**
 * Video tutorial schema
 */
const VideoTutorialSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	url: z.string().url(),
	embedUrl: z.string().url().optional(),
	thumbnail: z.string().url(),
	provider: z.nativeEnum(VideoProvider),
	duration: z.number(), // in seconds
	category: z.string(),
	tags: z.array(z.string()),
	difficulty: z.enum(["beginner", "intermediate", "advanced"]),
	transcript: z.string().optional(),
	captions: z.array(z.object({
		language: z.string(),
		url: z.string().url(),
		label: z.string(),
	})).optional(),
	chapters: z.array(z.object({
		title: z.string(),
		startTime: z.number(),
		endTime: z.number(),
		description: z.string().optional(),
	})).optional(),
	resources: z.array(z.object({
		title: z.string(),
		url: z.string().url(),
		type: z.enum(["code", "documentation", "slides", "github", "download"]),
	})).optional(),
	prerequisites: z.array(z.string()).default([]),
	learningObjectives: z.array(z.string()).default([]),
	relatedCommands: z.array(z.string()).default([]),
	author: z.object({
		name: z.string(),
		url: z.string().url().optional(),
		avatar: z.string().url().optional(),
	}),
	publishedAt: z.string(),
	updatedAt: z.string(),
	views: z.number().default(0),
	likes: z.number().default(0),
	rating: z.number().min(0).max(5).default(0),
	isOfficial: z.boolean().default(false),
	isFeatured: z.boolean().default(false),
});

export type VideoTutorial = z.infer<typeof VideoTutorialSchema>;

/**
 * Video playlist schema
 */
const VideoPlaylistSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	thumbnail: z.string().url(),
	videos: z.array(z.string()), // video IDs
	author: z.object({
		name: z.string(),
		url: z.string().url().optional(),
	}),
	category: z.string(),
	difficulty: z.enum(["beginner", "intermediate", "advanced"]),
	totalDuration: z.number(),
	isOfficial: z.boolean().default(false),
	isFeatured: z.boolean().default(false),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type VideoPlaylist = z.infer<typeof VideoPlaylistSchema>;

/**
 * Video watch session
 */
export interface VideoWatchSession {
	readonly sessionId: string;
	readonly videoId: string;
	readonly userId: string;
	readonly startedAt: string;
	readonly currentTime: number; // seconds
	readonly duration: number; // seconds
	readonly quality: VideoQuality;
	readonly subtitles: boolean;
	readonly speed: number; // playback speed
	readonly completed: boolean;
	readonly completedAt?: string;
	readonly notes: Array<{
		readonly timestamp: number;
		readonly text: string;
		readonly createdAt: string;
	}>;
	readonly bookmarks: Array<{
		readonly timestamp: number;
		readonly title: string;
		readonly createdAt: string;
	}>;
}

/**
 * Video search filters
 */
export interface VideoSearchFilters {
	readonly query?: string;
	readonly category?: string;
	readonly difficulty?: "beginner" | "intermediate" | "advanced";
	readonly provider?: VideoProvider;
	readonly duration?: {
		readonly min?: number;
		readonly max?: number;
	};
	readonly tags?: string[];
	readonly isOfficial?: boolean;
	readonly isFeatured?: boolean;
	readonly sortBy?: "relevance" | "date" | "views" | "rating" | "duration";
	readonly limit?: number;
	readonly offset?: number;
}

/**
 * Video analytics
 */
export interface VideoAnalytics {
	readonly videoId: string;
	readonly totalViews: number;
	readonly uniqueViews: number;
	readonly averageWatchTime: number;
	readonly completionRate: number;
	readonly dropOffPoints: Array<{
		readonly timestamp: number;
		readonly percentage: number;
	}>;
	readonly popularSegments: Array<{
		readonly startTime: number;
		readonly endTime: number;
		readonly rewatchCount: number;
	}>;
	readonly userEngagement: {
		readonly likes: number;
		readonly shares: number;
		readonly comments: number;
		readonly bookmarks: number;
	};
	readonly learningOutcomes: {
		readonly completed: number;
		readonly followUpActions: number;
		readonly relatedContentViews: number;
	};
}

/**
 * Video tutorial integration service
 */
export class VideoTutorialService {
	private readonly videosPath: string;
	private readonly playlistsPath: string;
	private readonly sessionsPath: string;
	private readonly analyticsPath: string;
	private readonly videosCache: Map<string, VideoTutorial> = new Map();
	private readonly playlistsCache: Map<string, VideoPlaylist> = new Map();
	private readonly activeSessions: Map<string, VideoWatchSession> = new Map();

	constructor(basePath: string = join(process.cwd(), ".xaheen", "videos")) {
		this.videosPath = join(basePath, "tutorials");
		this.playlistsPath = join(basePath, "playlists");
		this.sessionsPath = join(basePath, "sessions");
		this.analyticsPath = join(basePath, "analytics");
	}

	/**
	 * Initialize video tutorial service
	 */
	public async initialize(): Promise<void> {
		try {
			// Ensure directories exist
			const directories = [
				this.videosPath,
				this.playlistsPath,
				this.sessionsPath,
				this.analyticsPath,
			];

			for (const dir of directories) {
				if (!existsSync(dir)) {
					await mkdir(dir, { recursive: true });
				}
			}

			// Load cached data
			await this.loadCache();

			logger.info("Video tutorial service initialized");
		} catch (error) {
			logger.error("Failed to initialize video tutorial service:", error);
			throw error;
		}
	}

	/**
	 * Search video tutorials
	 */
	public async searchVideos(
		filters: VideoSearchFilters = {}
	): Promise<{
		videos: VideoTutorial[];
		total: number;
		hasMore: boolean;
	}> {
		try {
			let videos = Array.from(this.videosCache.values());

			// Apply filters
			if (filters.query) {
				const query = filters.query.toLowerCase();
				videos = videos.filter(v =>
					v.title.toLowerCase().includes(query) ||
					v.description.toLowerCase().includes(query) ||
					v.tags.some(tag => tag.toLowerCase().includes(query))
				);
			}

			if (filters.category) {
				videos = videos.filter(v => v.category === filters.category);
			}

			if (filters.difficulty) {
				videos = videos.filter(v => v.difficulty === filters.difficulty);
			}

			if (filters.provider) {
				videos = videos.filter(v => v.provider === filters.provider);
			}

			if (filters.duration) {
				videos = videos.filter(v => {
					if (filters.duration!.min && v.duration < filters.duration!.min) {
						return false;
					}
					if (filters.duration!.max && v.duration > filters.duration!.max) {
						return false;
					}
					return true;
				});
			}

			if (filters.tags && filters.tags.length > 0) {
				videos = videos.filter(v =>
					filters.tags!.some(tag => v.tags.includes(tag))
				);
			}

			if (filters.isOfficial !== undefined) {
				videos = videos.filter(v => v.isOfficial === filters.isOfficial);
			}

			if (filters.isFeatured !== undefined) {
				videos = videos.filter(v => v.isFeatured === filters.isFeatured);
			}

			// Apply sorting
			this.applySorting(videos, filters);

			// Apply pagination
			const offset = filters.offset || 0;
			const limit = filters.limit || 20;
			const total = videos.length;
			const paginatedVideos = videos.slice(offset, offset + limit);
			const hasMore = offset + limit < total;

			return {
				videos: paginatedVideos,
				total,
				hasMore,
			};

		} catch (error) {
			logger.error("Failed to search videos:", error);
			return {
				videos: [],
				total: 0,
				hasMore: false,
			};
		}
	}

	/**
	 * Get video tutorial by ID
	 */
	public async getVideo(videoId: string): Promise<VideoTutorial | null> {
		try {
			const video = this.videosCache.get(videoId);
			if (video) {
				// Increment view count
				video.views++;
				await this.saveVideo(video);
				return video;
			}

			// Try to load from storage
			const videoPath = join(this.videosPath, `${videoId}.json`);
			if (existsSync(videoPath)) {
				const content = await readFile(videoPath, "utf-8");
				const video = VideoTutorialSchema.parse(JSON.parse(content));
				this.videosCache.set(videoId, video);
				return video;
			}

			return null;
		} catch (error) {
			logger.error(`Failed to get video ${videoId}:`, error);
			return null;
		}
	}

	/**
	 * Get video playlists
	 */
	public async getPlaylists(filters: {
		category?: string;
		difficulty?: "beginner" | "intermediate" | "advanced";
		isOfficial?: boolean;
		isFeatured?: boolean;
	} = {}): Promise<VideoPlaylist[]> {
		try {
			let playlists = Array.from(this.playlistsCache.values());

			// Apply filters
			if (filters.category) {
				playlists = playlists.filter(p => p.category === filters.category);
			}

			if (filters.difficulty) {
				playlists = playlists.filter(p => p.difficulty === filters.difficulty);
			}

			if (filters.isOfficial !== undefined) {
				playlists = playlists.filter(p => p.isOfficial === filters.isOfficial);
			}

			if (filters.isFeatured !== undefined) {
				playlists = playlists.filter(p => p.isFeatured === filters.isFeatured);
			}

			// Sort by creation date (newest first)
			playlists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

			return playlists;

		} catch (error) {
			logger.error("Failed to get playlists:", error);
			return [];
		}
	}

	/**
	 * Start video watch session
	 */
	public async startWatchSession(
		videoId: string,
		userId: string = "anonymous",
		options: {
			quality?: VideoQuality;
			subtitles?: boolean;
			resumeFrom?: number;
		} = {}
	): Promise<{
		success: boolean;
		sessionId?: string;
		embedUrl?: string;
		errors: string[];
	}> {
		const result = {
			success: false,
			sessionId: undefined as string | undefined,
			embedUrl: undefined as string | undefined,
			errors: [] as string[],
		};

		try {
			const video = await this.getVideo(videoId);
			if (!video) {
				result.errors.push("Video not found");
				return result;
			}

			// Check if user has an existing session for this video
			let existingSession: VideoWatchSession | undefined;
			for (const session of this.activeSessions.values()) {
				if (session.videoId === videoId && session.userId === userId) {
					existingSession = session;
					break;
				}
			}

			let sessionId: string;
			if (existingSession) {
				sessionId = existingSession.sessionId;
			} else {
				// Create new session
				sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
				
				const session: VideoWatchSession = {
					sessionId,
					videoId,
					userId,
					startedAt: new Date().toISOString(),
					currentTime: options.resumeFrom || 0,
					duration: video.duration,
					quality: options.quality || VideoQuality.AUTO,
					subtitles: options.subtitles || false,
					speed: 1.0,
					completed: false,
					notes: [],
					bookmarks: [],
				};

				this.activeSessions.set(sessionId, session);
				await this.saveSession(session);
			}

			// Generate embed URL
			const embedUrl = this.generateEmbedUrl(video, {
				quality: options.quality || VideoQuality.AUTO,
				subtitles: options.subtitles || false,
				startTime: options.resumeFrom || 0,
			});

			result.success = true;
			result.sessionId = sessionId;
			result.embedUrl = embedUrl;

			logger.info(`Video watch session started: ${sessionId} for video ${videoId}`);

		} catch (error) {
			result.errors.push(`Failed to start watch session: ${error}`);
			logger.error(`Failed to start watch session for video ${videoId}:`, error);
		}

		return result;
	}

	/**
	 * Update watch session progress
	 */
	public async updateWatchProgress(
		sessionId: string,
		currentTime: number,
		options: {
			quality?: VideoQuality;
			speed?: number;
		} = {}
	): Promise<{
		success: boolean;
		completed?: boolean;
		errors: string[];
	}> {
		const result = {
			success: false,
			completed: false,
			errors: [] as string[],
		};

		try {
			const session = this.activeSessions.get(sessionId);
			if (!session) {
				result.errors.push("Session not found");
				return result;
			}

			// Update session data
			session.currentTime = currentTime;
			if (options.quality) {
				session.quality = options.quality;
			}
			if (options.speed) {
				session.speed = options.speed;
			}

			// Check if video is completed (watched at least 90%)
			const watchPercentage = (currentTime / session.duration) * 100;
			if (watchPercentage >= 90 && !session.completed) {
				session.completed = true;
				session.completedAt = new Date().toISOString();
				result.completed = true;

				// Update video analytics
				await this.updateVideoAnalytics(session.videoId, "completion");
			}

			// Save updated session
			this.activeSessions.set(sessionId, session);
			await this.saveSession(session);

			result.success = true;

		} catch (error) {
			result.errors.push(`Failed to update watch progress: ${error}`);
			logger.error(`Failed to update watch progress for session ${sessionId}:`, error);
		}

		return result;
	}

	/**
	 * Add note to video at specific timestamp
	 */
	public async addVideoNote(
		sessionId: string,
		timestamp: number,
		text: string
	): Promise<{
		success: boolean;
		noteId?: string;
		errors: string[];
	}> {
		const result = {
			success: false,
			noteId: undefined as string | undefined,
			errors: [] as string[],
		};

		try {
			const session = this.activeSessions.get(sessionId);
			if (!session) {
				result.errors.push("Session not found");
				return result;
			}

			const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const note = {
				timestamp,
				text,
				createdAt: new Date().toISOString(),
			};

			session.notes.push(note);

			// Save updated session
			this.activeSessions.set(sessionId, session);
			await this.saveSession(session);

			result.success = true;
			result.noteId = noteId;

		} catch (error) {
			result.errors.push(`Failed to add note: ${error}`);
			logger.error(`Failed to add note to session ${sessionId}:`, error);
		}

		return result;
	}

	/**
	 * Add bookmark to video at specific timestamp
	 */
	public async addVideoBookmark(
		sessionId: string,
		timestamp: number,
		title: string
	): Promise<{
		success: boolean;
		bookmarkId?: string;
		errors: string[];
	}> {
		const result = {
			success: false,
			bookmarkId: undefined as string | undefined,
			errors: [] as string[],
		};

		try {
			const session = this.activeSessions.get(sessionId);
			if (!session) {
				result.errors.push("Session not found");
				return result;
			}

			const bookmarkId = `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const bookmark = {
				timestamp,
				title,
				createdAt: new Date().toISOString(),
			};

			session.bookmarks.push(bookmark);

			// Save updated session
			this.activeSessions.set(sessionId, session);
			await this.saveSession(session);

			result.success = true;
			result.bookmarkId = bookmarkId;

		} catch (error) {
			result.errors.push(`Failed to add bookmark: ${error}`);
			logger.error(`Failed to add bookmark to session ${sessionId}:`, error);
		}

		return result;
	}

	/**
	 * Get video recommendations based on user history and preferences
	 */
	public async getVideoRecommendations(
		userId: string,
		options: {
			category?: string;
			difficulty?: "beginner" | "intermediate" | "advanced";
			limit?: number;
		} = {}
	): Promise<{
		recommended: VideoTutorial[];
		trending: VideoTutorial[];
		continueWatching: VideoTutorial[];
		official: VideoTutorial[];
	}> {
		try {
			const videos = Array.from(this.videosCache.values());
			const userSessions = await this.getUserSessions(userId);
			const limit = options.limit || 10;

			// Continue watching (incomplete sessions)
			const continueWatching = videos.filter(v => {
				const session = userSessions.find(s => s.videoId === v.id && !s.completed);
				return session !== undefined;
			}).slice(0, limit);

			// Recommended based on user preferences and watch history
			let recommended = videos.filter(v => {
				// Exclude already completed
				const completed = userSessions.some(s => s.videoId === v.id && s.completed);
				if (completed) return false;

				// Filter by preferences
				if (options.category && v.category !== options.category) return false;
				if (options.difficulty && v.difficulty !== options.difficulty) return false;

				return true;
			});

			// Sort by rating and views
			recommended.sort((a, b) => {
				const aScore = a.rating * 0.6 + (a.views / 1000) * 0.4;
				const bScore = b.rating * 0.6 + (b.views / 1000) * 0.4;
				return bScore - aScore;
			});
			recommended = recommended.slice(0, limit);

			// Trending (most viewed in recent period)
			const trending = videos
				.filter(v => v.views > 100) // Minimum view threshold
				.sort((a, b) => b.views - a.views)
				.slice(0, limit);

			// Official videos
			const official = videos
				.filter(v => v.isOfficial)
				.sort((a, b) => b.rating - a.rating)
				.slice(0, limit);

			return {
				recommended,
				trending,
				continueWatching,
				official,
			};

		} catch (error) {
			logger.error(`Failed to get video recommendations for user ${userId}:`, error);
			return {
				recommended: [],
				trending: [],
				continueWatching: [],
				official: [],
			};
		}
	}

	/**
	 * Open video in external browser
	 */
	public async openVideoInBrowser(videoId: string): Promise<{
		success: boolean;
		errors: string[];
	}> {
		const result = {
			success: false,
			errors: [] as string[],
		};

		try {
			const video = await this.getVideo(videoId);
			if (!video) {
				result.errors.push("Video not found");
				return result;
			}

			// Open URL in default browser
			const command = process.platform === "darwin" 
				? "open" 
				: process.platform === "win32" 
				? "start" 
				: "xdg-open";

			execSync(`${command} "${video.url}"`);

			result.success = true;

			logger.info(`Video opened in browser: ${videoId}`);

		} catch (error) {
			result.errors.push(`Failed to open video: ${error}`);
			logger.error(`Failed to open video ${videoId} in browser:`, error);
		}

		return result;
	}

	// Private helper methods

	private async loadCache(): Promise<void> {
		try {
			// Load videos
			if (existsSync(this.videosPath)) {
				const videoFiles = await readdir(this.videosPath);
				
				for (const file of videoFiles) {
					if (file.endsWith(".json")) {
						const content = await readFile(join(this.videosPath, file), "utf-8");
						const video = VideoTutorialSchema.parse(JSON.parse(content));
						this.videosCache.set(video.id, video);
					}
				}
			}

			// Load playlists
			if (existsSync(this.playlistsPath)) {
				const playlistFiles = await readdir(this.playlistsPath);
				
				for (const file of playlistFiles) {
					if (file.endsWith(".json")) {
						const content = await readFile(join(this.playlistsPath, file), "utf-8");
						const playlist = VideoPlaylistSchema.parse(JSON.parse(content));
						this.playlistsCache.set(playlist.id, playlist);
					}
				}
			}

			// Load active sessions
			if (existsSync(this.sessionsPath)) {
				const sessionFiles = await readdir(this.sessionsPath);
				
				for (const file of sessionFiles) {
					if (file.endsWith(".json")) {
						const content = await readFile(join(this.sessionsPath, file), "utf-8");
						const session = JSON.parse(content);
						this.activeSessions.set(session.sessionId, session);
					}
				}
			}

			// Load mock data if cache is empty
			if (this.videosCache.size === 0) {
				await this.loadMockData();
			}

		} catch (error) {
			logger.warn("Failed to load video tutorial cache:", error);
			await this.loadMockData();
		}
	}

	private applySorting(videos: VideoTutorial[], filters: VideoSearchFilters): void {
		if (!filters.sortBy) return;

		videos.sort((a, b) => {
			switch (filters.sortBy) {
				case "date":
					return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
				case "views":
					return b.views - a.views;
				case "rating":
					return b.rating - a.rating;
				case "duration":
					return a.duration - b.duration;
				case "relevance":
				default:
					// Relevance scoring based on multiple factors
					const aScore = a.rating * 0.4 + (a.views / 1000) * 0.3 + (a.isOfficial ? 0.3 : 0);
					const bScore = b.rating * 0.4 + (b.views / 1000) * 0.3 + (b.isOfficial ? 0.3 : 0);
					return bScore - aScore;
			}
		});
	}

	private generateEmbedUrl(
		video: VideoTutorial,
		options: {
			quality: VideoQuality;
			subtitles: boolean;
			startTime: number;
		}
	): string {
		if (video.embedUrl) {
			// Use provided embed URL with parameters
			const url = new URL(video.embedUrl);
			
			if (options.startTime > 0) {
				url.searchParams.set("t", options.startTime.toString());
			}
			
			if (options.quality !== VideoQuality.AUTO) {
				url.searchParams.set("quality", options.quality);
			}
			
			if (options.subtitles) {
				url.searchParams.set("cc", "1");
			}

			return url.toString();
		}

		// Generate embed URL based on provider
		switch (video.provider) {
			case VideoProvider.YOUTUBE:
				const videoId = this.extractYouTubeVideoId(video.url);
				if (videoId) {
					let embedUrl = `https://www.youtube.com/embed/${videoId}?`;
					const params = new URLSearchParams();
					
					if (options.startTime > 0) {
						params.set("start", options.startTime.toString());
					}
					
					if (options.subtitles) {
						params.set("cc_load_policy", "1");
					}

					return embedUrl + params.toString();
				}
				break;

			case VideoProvider.VIMEO:
				const vimeoId = this.extractVimeoVideoId(video.url);
				if (vimeoId) {
					let embedUrl = `https://player.vimeo.com/video/${vimeoId}?`;
					const params = new URLSearchParams();
					
					if (options.startTime > 0) {
						params.set("t", `${options.startTime}s`);
					}

					return embedUrl + params.toString();
				}
				break;
		}

		// Fallback to original URL
		return video.url;
	}

	private extractYouTubeVideoId(url: string): string | null {
		const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
		const match = url.match(regex);
		return match ? match[1] : null;
	}

	private extractVimeoVideoId(url: string): string | null {
		const regex = /vimeo\.com\/(\d+)/;
		const match = url.match(regex);
		return match ? match[1] : null;
	}

	private async saveVideo(video: VideoTutorial): Promise<void> {
		const videoPath = join(this.videosPath, `${video.id}.json`);
		await writeFile(videoPath, JSON.stringify(video, null, 2));
		this.videosCache.set(video.id, video);
	}

	private async saveSession(session: VideoWatchSession): Promise<void> {
		const sessionPath = join(this.sessionsPath, `${session.sessionId}.json`);
		await writeFile(sessionPath, JSON.stringify(session, null, 2));
	}

	private async getUserSessions(userId: string): Promise<VideoWatchSession[]> {
		return Array.from(this.activeSessions.values()).filter(s => s.userId === userId);
	}

	private async updateVideoAnalytics(videoId: string, event: string): Promise<void> {
		// This would update video analytics
		logger.debug(`Video analytics updated: ${videoId}, event: ${event}`);
	}

	private async loadMockData(): Promise<void> {
		// Load comprehensive mock video data
		const mockVideos: VideoTutorial[] = [
			{
				id: "getting-started-xaheen-cli",
				title: "Getting Started with Xaheen CLI - Complete Beginner's Guide",
				description: "Learn how to install, configure, and use Xaheen CLI to create your first project. Perfect for developers new to the Xaheen ecosystem.",
				url: "https://www.youtube.com/watch?v=example1",
				embedUrl: "https://www.youtube.com/embed/example1",
				thumbnail: "https://img.youtube.com/vi/example1/maxresdefault.jpg",
				provider: VideoProvider.YOUTUBE,
				duration: 1200, // 20 minutes
				category: "getting-started",
				tags: ["cli", "beginner", "tutorial", "installation", "setup"],
				difficulty: "beginner",
				transcript: "Welcome to this comprehensive guide on getting started with Xaheen CLI...",
				captions: [
					{
						language: "en",
						url: "https://example.com/captions/en.vtt",
						label: "English",
					},
					{
						language: "no",
						url: "https://example.com/captions/no.vtt",
						label: "Norwegian",
					},
				],
				chapters: [
					{
						title: "Introduction",
						startTime: 0,
						endTime: 120,
						description: "Overview of Xaheen CLI and what you'll learn",
					},
					{
						title: "Installation",
						startTime: 120,
						endTime: 300,
						description: "How to install Xaheen CLI on different platforms",
					},
					{
						title: "First Project",
						startTime: 300,
						endTime: 600,
						description: "Creating your first project with Xaheen CLI",
					},
				],
				resources: [
					{
						title: "Official Documentation",
						url: "https://docs.xaheen.com",
						type: "documentation",
					},
					{
						title: "Sample Project Code",
						url: "https://github.com/xala-technologies/xaheen-tutorial-examples",
						type: "github",
					},
				],
				prerequisites: [],
				learningObjectives: [
					"Install and configure Xaheen CLI",
					"Create your first project",
					"Understand basic CLI commands",
					"Explore project structure",
				],
				relatedCommands: ["xaheen create", "xaheen generate", "xaheen --help"],
				author: {
					name: "Xala Technologies",
					url: "https://xala.com",
					avatar: "https://avatars.xala.com/xala.png",
				},
				publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
				updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
				views: 15420,
				likes: 1240,
				rating: 4.8,
				isOfficial: true,
				isFeatured: true,
			},
			{
				id: "react-component-mastery",
				title: "React Component Development Mastery with Xaheen CLI",
				description: "Advanced techniques for building scalable React components using Xaheen CLI generators and best practices.",
				url: "https://www.youtube.com/watch?v=example2",
				thumbnail: "https://img.youtube.com/vi/example2/maxresdefault.jpg",
				provider: VideoProvider.YOUTUBE,
				duration: 2700, // 45 minutes
				category: "react",
				tags: ["react", "components", "typescript", "advanced"],
				difficulty: "intermediate",
				prerequisites: ["getting-started-xaheen-cli"],
				learningObjectives: [
					"Build reusable React components",
					"Implement TypeScript best practices",
					"Use Xaheen component generators",
					"Test components effectively",
				],
				relatedCommands: ["xaheen generate component", "xaheen generate test"],
				author: {
					name: "React Experts",
					url: "https://reactexperts.dev",
				},
				publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
				updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
				views: 8930,
				likes: 650,
				rating: 4.6,
				isOfficial: false,
				isFeatured: true,
			},
			{
				id: "norwegian-compliance-guide",
				title: "Building Compliant Applications for Norwegian Government",
				description: "Learn how to build applications that meet Norwegian government compliance requirements using Xaheen CLI.",
				url: "https://vimeo.com/example3",
				provider: VideoProvider.VIMEO,
				duration: 1800, // 30 minutes
				category: "compliance",
				tags: ["norway", "compliance", "government", "security"],
				difficulty: "advanced",
				prerequisites: ["getting-started-xaheen-cli"],
				learningObjectives: [
					"Understand Norwegian compliance requirements",
					"Implement NSM security classifications",
					"Build with BankID integration",
					"Ensure GDPR compliance",
				],
				relatedCommands: ["xaheen generate compliance", "xaheen security-scan"],
				author: {
					name: "Norwegian Tech Consulting",
					url: "https://nortech.no",
				},
				publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
				updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
				views: 3450,
				likes: 280,
				rating: 4.9,
				isOfficial: true,
				isFeatured: false,
			},
		];

		// Mock playlists
		const mockPlaylists: VideoPlaylist[] = [
			{
				id: "complete-xaheen-course",
				title: "Complete Xaheen CLI Course",
				description: "From beginner to expert - everything you need to know about Xaheen CLI",
				thumbnail: "https://img.youtube.com/vi/playlist1/maxresdefault.jpg",
				videos: ["getting-started-xaheen-cli", "react-component-mastery"],
				author: {
					name: "Xala Technologies",
					url: "https://xala.com",
				},
				category: "complete-course",
				difficulty: "beginner",
				totalDuration: 3900, // Sum of video durations
				isOfficial: true,
				isFeatured: true,
				createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
				updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
			},
		];

		// Load mock data into cache
		for (const video of mockVideos) {
			this.videosCache.set(video.id, video);
			await this.saveVideo(video);
		}

		for (const playlist of mockPlaylists) {
			this.playlistsCache.set(playlist.id, playlist);
			const playlistPath = join(this.playlistsPath, `${playlist.id}.json`);
			await writeFile(playlistPath, JSON.stringify(playlist, null, 2));
		}

		logger.info("Mock video tutorial data loaded");
	}
}

/**
 * Create video tutorial service instance
 */
export function createVideoTutorialService(basePath?: string): VideoTutorialService {
	return new VideoTutorialService(basePath);
}

/**
 * Default export
 */
export default VideoTutorialService;