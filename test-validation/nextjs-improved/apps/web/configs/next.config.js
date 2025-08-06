




/**
 * Next.js Configuration - Xala UI System Compliant
 * Generated with Xaheen CLI - Web Platform Configuration
 * 
 * MANDATORY COMPLIANCE RULES:
 * ❌ NO raw HTML elements (div, span, p, h1-h6, button, input, etc.) in pages
 * ✅ ONLY semantic components from @xaheen-ai/design-system
 * ❌ NO hardcoded styling (no style=placeholder, no arbitrary Tailwind values)
 * ✅ MANDATORY design token usage for all colors, spacing, typography
 * ✅ Enhanced 8pt Grid System - all spacing in 8px increments
 * ✅ WCAG 2.2 AAA compliance for accessibility
 * ❌ NO hardcoded user-facing text - ALL text must use t() function
 * ✅ MANDATORY localization: English, Norwegian Bokmål, French, Arabic
 * ✅ Explicit TypeScript return types (no 'any' types)
 * ✅ SOLID principles and component composition
 * ✅ Maximum 200 lines per file, 20 lines per function
 */

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Platform configuration
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@xaheen-ai/design-system'],
  },

  // Multi-platform support
  output: process.env.NEXT_OUTPUT || 'standalone',
  
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [],
    remotePatterns: [],
  },

  // Internationalization
  i18n: {
    locales: ['en', 'nb', 'fr', 'ar'],
    defaultLocale: 'en',
    localeDetection: true,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Webpack configuration for platform compatibility
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Platform-specific optimizations
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
      '@/components': './src/components',
      '@/layouts': './src/layouts',
      '@/utils': './src/utils',
      '@/hooks': './src/hooks',
      '@/config': './src/config',
    };

    // Bundle analysis
    if (process.env.ANALYZE === 'true') {
      config.plugins.push(
        new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }

    // Norwegian compliance optimizations
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.PLATFORM': JSON.stringify('web'),
        'process.env.COMPLIANCE_MODE': JSON.stringify('norwegian'),
        'process.env.ACCESSIBILITY_LEVEL': JSON.stringify('AAA'),
      })
    );

    return config;
  },

  // Environment variables
  env: {
    PLATFORM: 'web',
    COMPLIANCE_MODE: 'norwegian',
    ACCESSIBILITY_LEVEL: 'AAA',
    UI_SYSTEM_VERSION: '5.0.0',
  },

  // PWA configuration
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src', 'pages', 'components', 'layouts', 'utils', 'hooks'],
  },

  // Redirects for Norwegian compliance
  async redirects() {
    return [
      {
        source: '/privacy',
        destination: '/nb/privacy',
        permanent: false,
        locale: false,
      },
      {
        source: '/terms',
        destination: '/nb/terms',
        permanent: false,
        locale: false,
      },
    ];
  },

  // Rewrites for API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = withBundleAnalyzer(withPWA(nextConfig));
