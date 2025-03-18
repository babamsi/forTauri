/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    domains: ['hebbkx1anhila5yf.public.blob.vercel-storage.com']
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://pignaqfwhj.ap-south-1.awsapprunner.com/api/:path*'
      }
    ];
  }
};

module.exports = nextConfig;
