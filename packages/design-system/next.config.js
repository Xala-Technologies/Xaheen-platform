/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for registry files
  output: 'standalone',
  
  // Configure registry path rewrites
  async rewrites() {
    return [
      {
        source: '/r/:path*',
        destination: '/api/registry/:path*',
      },
    ];
  },

  // Add CORS headers for registry
  async headers() {
    return [
      {
        source: '/api/registry/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;