/**
 * @fileoverview Auto-Completion Service for Interactive Tech Builder
 * @description Provides intelligent suggestions and auto-completion for project configuration
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import {
	AutoCompletionProvider,
	StackConfiguration,
	BuilderError
} from './builder-types.js';
import { configLoader } from './config-loader.js';

const execAsync = promisify(exec);

export class AutoCompletionService implements AutoCompletionProvider {
	private readonly npmRegistryCache = new Map<string, string[]>();
	private readonly cacheExpiry = 30 * 60 * 1000; // 30 minutes
	private readonly cacheTimestamps = new Map<string, number>();

	/**
	 * Get project name suggestions based on project type
	 */
	getProjectNameSuggestions(projectType: string): readonly string[] {
		const suggestions: Record<string, string[]> = {
			'landing-page': [
				'awesome-landing',
				'company-website',
				'product-showcase',
				'marketing-site',
				'brand-landing'
			],
			'ecommerce': [
				'online-store',
				'shop-app',
				'marketplace-hub',
				'retail-platform',
				'commerce-site'
			],
			'blog': [
				'my-blog',
				'content-hub',
				'news-site',
				'writer-portfolio',
				'blog-platform'
			],
			'portfolio': [
				'personal-portfolio',
				'design-showcase',
				'dev-portfolio',
				'creative-works',
				'professional-site'
			],
			'dashboard': [
				'admin-dashboard',
				'analytics-hub',
				'management-panel',
				'data-dashboard',
				'control-center'
			],
			'api-backend': [
				'api-server',
				'backend-service',
				'rest-api',
				'microservice',
				'api-gateway'
			],
			'saas-multi-tenant': [
				'saas-platform',
				'multi-tenant-app',
				'subscription-service',
				'cloud-platform',
				'tenant-manager'
			],
			'saas-single-tenant': [
				'enterprise-saas',
				'custom-solution',
				'dedicated-app',
				'client-platform',
				'single-tenant-saas'
			],
			'saas-enterprise': [
				'enterprise-platform',
				'corporate-saas',
				'large-scale-app',
				'enterprise-solution',
				'business-platform'
			],
			'b2b-platform': [
				'b2b-portal',
				'business-platform',
				'partner-hub',
				'vendor-platform',
				'enterprise-portal'
			],
			'b2c-app': [
				'consumer-app',
				'customer-portal',
				'user-platform',
				'client-app',
				'public-app'
			],
			'marketplace': [
				'marketplace-platform',
				'vendor-hub',
				'trading-platform',
				'multi-vendor-store',
				'commerce-marketplace'
			]
		};

		return suggestions[projectType] || [
			'my-app',
			'awesome-project',
			'new-application',
			'project-starter',
			'web-app'
		];
	}

	/**
	 * Get dependency versions from npm registry
	 */
	async getDependencyVersions(packageName: string): Promise<readonly string[]> {
		try {
			// Check cache first
			const cacheKey = `versions-${packageName}`;
			const cachedVersions = this.npmRegistryCache.get(cacheKey);
			const cacheTime = this.cacheTimestamps.get(cacheKey);
			
			if (cachedVersions && cacheTime && (Date.now() - cacheTime) < this.cacheExpiry) {
				return cachedVersions;
			}

			// Fetch versions from npm
			const { stdout } = await execAsync(`npm view ${packageName} versions --json`);
			const versions = JSON.parse(stdout);
			
			// Get latest stable versions (last 10)
			const latestVersions = Array.isArray(versions) 
				? versions.slice(-10).reverse()
				: [versions];

			// Cache the results
			this.npmRegistryCache.set(cacheKey, latestVersions);
			this.cacheTimestamps.set(cacheKey, Date.now());

			return latestVersions;
		} catch (error) {
			// Return common fallback versions
			return this.getFallbackVersions(packageName);
		}
	}

	/**
	 * Get theme suggestions based on industry or project type
	 */
	getThemeSuggestions(industry?: string): readonly string[] {
		const themesByIndustry: Record<string, string[]> = {
			healthcare: [
				'medical-clean',
				'healthcare-professional',
				'clinic-modern',
				'hospital-system',
				'wellness-theme'
			],
			finance: [
				'financial-secure',
				'banking-professional',
				'fintech-modern',
				'investment-clean',
				'corporate-finance'
			],
			education: [
				'academic-clean',
				'university-modern',
				'learning-platform',
				'educational-bright',
				'student-friendly'
			],
			government: [
				'government-official',
				'public-service',
				'civic-professional',
				'municipal-clean',
				'agency-standard'
			],
			retail: [
				'commerce-modern',
				'retail-friendly',
				'shopping-clean',
				'store-professional',
				'marketplace-theme'
			],
			technology: [
				'tech-modern',
				'startup-clean',
				'developer-dark',
				'innovation-theme',
				'digital-professional'
			],
			nonprofit: [
				'charity-warm',
				'nonprofit-clean',
				'community-friendly',
				'cause-focused',
				'impact-theme'
			]
		};

		const defaultThemes = [
			'modern-clean',
			'professional-blue',
			'dark-elegant',
			'minimalist-white',
			'corporate-standard',
			'startup-vibrant',
			'accessible-high-contrast',
			'scandinavian-minimal'
		];

		return industry && themesByIndustry[industry] 
			? themesByIndustry[industry]!
			: defaultThemes;
	}

	/**
	 * Get compliance suggestions based on project type
	 */
	getComplianceSuggestions(projectType: string): readonly string[] {
		const complianceByType: Record<string, string[]> = {
			'healthcare': [
				'hipaa',
				'gdpr',
				'norwegian-health',
				'medical-device',
				'fda-21cfr'
			],
			'finance': [
				'sox',
				'pci-dss',
				'gdpr',
				'basel-iii',
				'mifid-ii',
				'norwegian-finance'
			],
			'government': [
				'nsm-compliant',
				'gdpr',
				'accessibility-wcag-aaa',
				'norwegian-government',
				'iso27001'
			],
			'education': [
				'ferpa',
				'gdpr',
				'coppa',
				'accessibility-wcag-aa',
				'norwegian-education'
			],
			'saas-enterprise': [
				'soc2-type2',
				'iso27001',
				'gdpr',
				'ccpa',
				'hipaa-baa'
			],
			'b2c-app': [
				'gdpr',
				'ccpa',
				'coppa',
				'accessibility-wcag-aa',
				'cookie-consent'
			],
			'ecommerce': [
				'pci-dss',
				'gdpr',
				'ccpa',
				'accessibility-wcag-aa',
				'consumer-protection'
			]
		};

		const defaultCompliance = [
			'gdpr',
			'accessibility-wcag-aa',
			'privacy-by-design',
			'data-protection'
		];

		return complianceByType[projectType] || defaultCompliance;
	}

	/**
	 * Get intelligent technology suggestions based on current stack
	 */
	async getIntelligentSuggestions(
		category: string,
		currentStack: Partial<StackConfiguration>
	): Promise<readonly string[]> {
		try {
			const config = await configLoader.loadConfiguration();
			const categoryOptions = config.techOptions[category] || [];

			// Get base suggestions
			const baseSuggestions = categoryOptions
				.filter(option => option.default)
				.map(option => option.id);

			// Apply intelligent filtering based on current stack
			const intelligentSuggestions = await this.applyIntelligentFiltering(
				category,
				categoryOptions.map(option => option.id),
				currentStack
			);

			// Combine and deduplicate
			const allSuggestions = [...baseSuggestions, ...intelligentSuggestions];
			return [...new Set(allSuggestions)];

		} catch (error) {
			console.warn(`Failed to get intelligent suggestions for ${category}:`, error);
			return [];
		}
	}

	/**
	 * Get framework-specific best practices
	 */
	getBestPracticeSuggestions(stack: Partial<StackConfiguration>): readonly string[] {
		const suggestions: string[] = [];

		// Frontend-specific suggestions
		if (stack.webFrontend) {
			const frontend = Array.isArray(stack.webFrontend) ? stack.webFrontend[0] : stack.webFrontend;
			
			switch (frontend) {
				case 'next':
					suggestions.push(
						'Consider using App Router for new Next.js projects',
						'Enable TypeScript for better development experience',
						'Use next/image for optimized image handling'
					);
					break;
				case 'react':
					suggestions.push(
						'Consider using React Query for data fetching',
						'Use React Hook Form for form management',
						'Consider Vite for faster development builds'
					);
					break;
				case 'vue':
					suggestions.push(
						'Use Pinia for state management in Vue 3',
						'Consider Nuxt for full-stack Vue applications',
						'Use Vite for optimal development experience'
					);
					break;
			}
		}

		// Database suggestions
		if (stack.database) {
			switch (stack.database) {
				case 'postgresql':
					suggestions.push(
						'PostgreSQL is excellent for complex queries and ACID compliance',
						'Consider connection pooling for production deployment'
					);
					break;
				case 'mongodb':
					suggestions.push(
						'MongoDB is great for flexible schemas and horizontal scaling',
						'Consider using indexes for query optimization'
					);
					break;
				case 'sqlite':
					suggestions.push(
						'SQLite is perfect for development and small applications',
						'Consider PostgreSQL for production multi-user applications'
					);
					break;
			}
		}

		// Authentication suggestions
		if (stack.auth) {
			switch (stack.auth) {
				case 'clerk':
					suggestions.push(
						'Clerk provides excellent authentication UX out of the box',
						'Great for rapid prototyping and SaaS applications'
					);
					break;
				case 'auth0':
					suggestions.push(
						'Auth0 is enterprise-ready with extensive customization',
						'Excellent for complex authentication requirements'
					);
					break;
				case 'better-auth':
					suggestions.push(
						'Better Auth gives you full control over authentication',
						'Great for custom authentication flows'
					);
					break;
			}
		}

		return suggestions;
	}

	/**
	 * Get performance optimization suggestions
	 */
	getPerformanceSuggestions(stack: StackConfiguration): readonly string[] {
		const suggestions: string[] = [];

		// Bundle size optimization
		if (stack.addons.length > 5) {
			suggestions.push('Consider reducing the number of add-ons to improve bundle size');
		}

		// Database performance
		if (stack.database === 'postgresql' && !stack.caching) {
			suggestions.push('Consider adding Redis for caching to improve database performance');
		}

		// Frontend performance
		const frontend = Array.isArray(stack.webFrontend) ? stack.webFrontend[0] : stack.webFrontend;
		if (frontend === 'next' && !stack.webDeploy) {
			suggestions.push('Consider Vercel deployment for optimal Next.js performance');
		}

		// Monitoring suggestions
		if (!stack.monitoring) {
			suggestions.push('Add monitoring to track application performance in production');
		}

		// CDN suggestions
		if (!['vercel', 'netlify', 'cloudflare'].includes(stack.webDeploy || '')) {
			suggestions.push('Consider using a CDN for better global performance');
		}

		return suggestions;
	}

	/**
	 * Apply intelligent filtering based on current stack
	 */
	private async applyIntelligentFiltering(
		category: string,
		options: readonly string[],
		currentStack: Partial<StackConfiguration>
	): Promise<string[]> {
		const filtered: string[] = [];

		// Language/runtime consistency
		if (category === 'backend' && currentStack.runtime) {
			const runtimeCompatibility: Record<string, string[]> = {
				'node': ['hono', 'fastify', 'express', 'next-api'],
				'bun': ['hono', 'fastify', 'express'],
				'deno': ['hono', 'oak'],
				'dotnet': ['aspnet-core', 'dotnet'],
				'python': ['django', 'fastapi', 'flask']
			};

			const compatibleBackends = runtimeCompatibility[currentStack.runtime] || [];
			filtered.push(...options.filter(option => compatibleBackends.includes(option)));
		}

		// Frontend-backend synergy
		if (category === 'backend' && currentStack.webFrontend) {
			const frontend = Array.isArray(currentStack.webFrontend) 
				? currentStack.webFrontend[0] 
				: currentStack.webFrontend;

			if (frontend === 'next') {
				filtered.push('next-api');
			}
		}

		// Database-ORM compatibility
		if (category === 'orm' && currentStack.database) {
			const dbOrmCompatibility: Record<string, string[]> = {
				'postgresql': ['prisma', 'drizzle', 'typeorm'],
				'mysql': ['prisma', 'drizzle', 'typeorm'],
				'sqlite': ['prisma', 'drizzle'],
				'mongodb': ['mongoose', 'prisma'],
				'mssql': ['entity-framework', 'prisma', 'typeorm']
			};

			const compatibleOrms = dbOrmCompatibility[currentStack.database] || [];
			filtered.push(...options.filter(option => compatibleOrms.includes(option)));
		}

		// Industry-specific suggestions
		const projectType = await this.inferProjectType(currentStack);
		if (projectType && category === 'auth') {
			const industryAuthPreferences: Record<string, string[]> = {
				'healthcare': ['auth0', 'better-auth'],
				'finance': ['auth0', 'identity-server'],
				'government': ['bankid', 'feide', 'better-auth'],
				'education': ['feide', 'auth0']
			};

			const preferredAuth = industryAuthPreferences[projectType] || [];
			filtered.push(...options.filter(option => preferredAuth.includes(option)));
		}

		return [...new Set(filtered)];
	}

	/**
	 * Infer project type from current stack characteristics
	 */
	private async inferProjectType(stack: Partial<StackConfiguration>): Promise<string | null> {
		try {
			const config = await configLoader.loadConfiguration();
			
			// Simple heuristic: match based on common patterns
			if (stack.payments && stack.subscriptions) return 'saas';
			if (stack.payments && !stack.subscriptions) return 'ecommerce';
			if (stack.compliance && Array.isArray(stack.compliance)) {
				if (stack.compliance.includes('hipaa')) return 'healthcare';
				if (stack.compliance.includes('norwegian')) return 'government';
				if (stack.compliance.includes('pci-dss')) return 'finance';
			}
			if (stack.rbac && stack.multiTenancy) return 'enterprise';
			if (!stack.backend || stack.backend === 'none') return 'landing-page';

			return null;
		} catch {
			return null;
		}
	}

	/**
	 * Get fallback versions when npm registry is unavailable
	 */
	private getFallbackVersions(packageName: string): string[] {
		const fallbackVersions: Record<string, string[]> = {
			'next': ['^14.0.0', '^13.5.0', '^13.4.0'],
			'react': ['^18.2.0', '^18.1.0', '^18.0.0'],
			'vue': ['^3.3.0', '^3.2.0', '^3.1.0'],
			'typescript': ['^5.2.0', '^5.1.0', '^5.0.0'],
			'tailwindcss': ['^3.3.0', '^3.2.0', '^3.1.0'],
			'prisma': ['^5.0.0', '^4.16.0', '^4.15.0'],
			'drizzle-orm': ['^0.28.0', '^0.27.0', '^0.26.0']
		};

		return fallbackVersions[packageName] || ['^1.0.0', '^0.9.0', '^0.8.0'];
	}

	/**
	 * Clear cache (useful for testing or manual refresh)
	 */
	clearCache(): void {
		this.npmRegistryCache.clear();
		this.cacheTimestamps.clear();
	}

	/**
	 * Get cache statistics
	 */
	getCacheStats(): { size: number; oldestEntry: number | null; newestEntry: number | null } {
		const timestamps = Array.from(this.cacheTimestamps.values());
		
		return {
			size: this.npmRegistryCache.size,
			oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : null,
			newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : null
		};
	}
}

// Export singleton instance
export const autoCompletion = new AutoCompletionService();