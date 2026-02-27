import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Strava athlete profile photos — primary CloudFront CDN
        protocol: 'https',
        hostname: 'dgalywyr863hv.cloudfront.net',
      },
      {
        // Strava avatars via Google's CDN (common for Google-linked accounts)
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        // Fallback: any *.strava.com subdomain
        protocol: 'https',
        hostname: '*.strava.com',
      },
    ],
  },
}

export default nextConfig
