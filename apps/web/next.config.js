/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@sbf/types', '@sbf/auth-lib', '@sbf/config'],
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3000',
  },
};

module.exports = nextConfig;
