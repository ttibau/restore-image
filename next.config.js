/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['replicate.delivery', 'upcdn.io'],
  },
};

module.exports = nextConfig;
