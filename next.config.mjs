/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // The Hedera SDK and the x402 signing path pull in Node built-ins that
    // have no browser equivalent. Stub them for the client bundle; the code
    // that actually needs them only ever runs in route handlers.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      net: false,
      tls: false,
    };

    return config;
  },

  images: {
    // Placeholder avatars used by the seeded Explore profiles.
    domains: ['i.pravatar.cc'],
  },
};

export default nextConfig;
