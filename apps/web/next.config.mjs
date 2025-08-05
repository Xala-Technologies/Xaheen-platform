/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,
  
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'date-fns',
    ],
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  compiler: {
    styledComponents: true,
  },
  
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pbs.twimg.com" },
      { protocol: "https", hostname: "abs.twimg.com" },
      { protocol: "https", hostname: "cdn.xaheen.no" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  compress: true,
  
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

export default config;