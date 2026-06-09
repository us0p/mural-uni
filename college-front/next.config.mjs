/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'
// Public URL used by the browser and CSP headers (e.g. http://localhost:8080)
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'
// Internal URL used by the server-side proxy — set to http://app:8080 in Docker
const internalApiUrl = process.env.API_URL ?? apiUrl

const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${internalApiUrl}/api/:path*`,
      },
    ]
  },
  async headers() {
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'"

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',            value: 'DENY' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security',  value: 'max-age=31536000; includeSubDomains' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              scriptSrc,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              `connect-src 'self' ${apiUrl}`,
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
