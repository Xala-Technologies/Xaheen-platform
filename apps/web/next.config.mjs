import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
	reactStrictMode: true,
	// This is required to support PostHog trailing slash API requests
	skipTrailingSlashRedirect: true,
	
	// Performance optimizations
	swcMinify: true,
	poweredByHeader: false,
	
	// Experimental features for performance
	experimental: {
		reactCompiler: true,
		turbo: {
			loaders: {
				'.svg': ['@svgr/webpack'],
			},
		},
		optimizeCss: true,
		optimizePackageImports: [
			'@xala-technologies/ui-system',
			'lucide-react',
			'recharts',
			'date-fns',
		],
		serverComponentsExternalPackages: ['@xala-technologies/ui-system'],
	},
	
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	},
	
	compiler: {
		removeConsole: process.env.NODE_ENV === "production",
		styledComponents: true,
	},
	
	// Image optimization
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "pbs.twimg.com" },
			{ protocol: "https", hostname: "abs.twimg.com" },
			{ protocol: "https", hostname: "cdn.xaheen.no" },
			{ protocol: "https", hostname: "images.unsplash.com" },
		],
		formats: ['image/avif', 'image/webp'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
		dangerouslyAllowSVG: true,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},
	
	// Output configuration for deployment
	output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
	
	// Compression and caching
	compress: true,
	
	// Bundle analyzer
	...(process.env.ANALYZE === 'true' && {
		webpack: (config, { isServer }) => {
			if (!isServer) {
				const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
				config.plugins.push(
					new BundleAnalyzerPlugin({
						analyzerMode: 'static',
						openAnalyzer: false,
						reportFilename: `bundle-analyzer-${isServer ? 'server' : 'client'}.html`,
					})
				);
			}
			return config;
		},
	}),
	
	// Webpack optimization for Xala UI System v5.0.0
	webpack: (config, { dev, isServer }) => {
		// Optimize bundle for UI system
		config.resolve.alias = {
			...config.resolve.alias,
			"@xala-technologies/ui-system": "@xala-technologies/ui-system/dist",
		};
		
		// Tree shaking optimization
		config.optimization = {
			...config.optimization,
			usedExports: true,
			sideEffects: false,
		};
		
		// Split chunks for better caching
		if (!dev && !isServer) {
			config.optimization.splitChunks = {
				chunks: 'all',
				cacheGroups: {
					default: false,
					vendors: false,
					framework: {
						chunks: 'all',
						name: 'framework',
						test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
						priority: 40,
						enforce: true,
					},
					lib: {
						test(module) {
							return module.size() > 160000 && /node_modules[/\\]/.test(module.identifier());
						},
						name(module) {
							const hash = crypto.createHash('sha1');
							hash.update(module.libIdent ? module.libIdent({ context: config.context }) : module.identifier());
							return hash.digest('hex').substring(0, 8);
						},
						priority: 30,
						minChunks: 1,
						reuseExistingChunk: true,
					},
					commons: {
						name: 'commons',
						minChunks: 2,
						priority: 20,
					},
					shared: {
						name: 'shared',
						test: /[\\/]shared[\\/]/,
						priority: 10,
						reuseExistingChunk: true,
					},
				},
			};
		}
		
		// Add bundle analyzer if enabled
		if (process.env.ANALYZE === 'true' && !isServer) {
			const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
			config.plugins.push(
				new BundleAnalyzerPlugin({
					analyzerMode: 'static',
					openAnalyzer: false,
					reportFilename: `bundle-analyzer-${isServer ? 'server' : 'client'}.html`,
				})
			);
		}

		return config;
	},
	async rewrites() {
		return [
			{
				source: "/ingest/static/:path*",
				destination: "https://us-assets.i.posthog.com/static/:path*",
			},
			{
				source: "/ingest/:path*",
				destination: "https://us.i.posthog.com/:path*",
			},
			{
				source: "/ingest/decide",
				destination: "https://us.i.posthog.com/decide",
			},
		];
	},
};

export default withMDX(config);

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();
