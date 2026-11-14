/** @type {import('next').NextConfig} */
const nextConfig = {
  // keep any existing options here...

  eslint: {
    // don’t fail production builds on ESLint errors
    ignoreDuringBuilds: true,
  },

  async redirects() {
    return [
      {
        // /workspace was retired 2026-07-16 -- its "Execution Overview" content
        // was built entirely on pre-pivot ticket data that nothing writes to
        // anymore. Every existing link (nav, CTAs, admin-page bounce-redirects)
        // keeps working unchanged through this redirect, no need to retarget
        // each one individually.
        source: '/workspace',
        destination: '/generator',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;