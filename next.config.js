/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: 'lg-image-prod.s3.us-east-1.amazonaws.com' },
    ],
  },
};

module.exports = nextConfig;
