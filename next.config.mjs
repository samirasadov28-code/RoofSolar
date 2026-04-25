/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow react-pdf renderer to work server-side
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
  // Ensure maplibre-gl doesn't break SSR
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

export default nextConfig;
