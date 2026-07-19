import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      }
    ],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/product-tag/:slug*',
        destination: '/products',
        permanent: true,
      },
      {
        source: '/category/:slug*',
        destination: '/categories',
        permanent: true,
      },
      {
        source: '/product/:slug*',
        destination: '/products',
        permanent: true,
      },
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/wp-admin/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/logo/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/blog-fullwidth',
        destination: '/blog',
        permanent: true,
      }
    ];
  },
  /* config options here */
};

export default nextConfig;
