/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export for development
  // output: "export",
  // trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Add experimental features for better performance
  experimental: {
    optimizeCss: true,
    // Remove problematic Turbopack configuration that's causing runtime errors
    // turbo: {
    //   rules: {
    //     '*.svg': {
    //       loaders: ['@svgr/webpack'],
    //       as: '*.js',
    //     },
    //   },
    // },
  },
  // Configure for Electron
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
