const nextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
  serverExternalPackages: [
    'bcrypt',
    'mongoose',
    'express',
    'uploadthing'
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default nextConfig
