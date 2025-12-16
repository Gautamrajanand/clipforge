/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/v1/:path*',
        destination: 'http://clipforge-api:3001/v1/:path*', // Proxy to Backend API
      },
    ];
  },
};

module.exports = nextConfig;
