const withPageFilter = require('../../index.js');

// Configuration for App Router filtering
const filterConfig = {
  // Enable filtering when FILTER_PAGES=true or in specific environments
  enabled: process.env.FILTER_PAGES === 'true',
  
  // Enable verbose logging to see what's being filtered
  verbose: true,
  
  // Support both App Router and Pages Router
  supportAppRouter: true,
  supportPagesRouter: false, // Only App Router for this demo
  
  // Exclude specific routes (supports glob patterns)
  excludedPages: [
    'admin',           // Exact: Exclude admin route
    'dev/**',          // Glob: Exclude all routes under /dev
    // 'contact',      // Exact: Exclude contact route
    // 'blog/*',       // Glob: Exclude direct children of /blog
    // '**/test',      // Glob: Exclude any route ending with /test
  ],
  
  // Use regex patterns for advanced exclusion (alternative to glob)
  excludePatterns: [
    // 'dev/.*',       // Regex: Exclude all routes in dev/ directory
    // '.*admin.*',    // Regex: Exclude any route with 'admin' in the path
  ],
  
  // Don't filter in development mode (set to true if you want filtering in dev)
  enableInDev: false,
};

const nextConfig = {
  reactStrictMode: true,
  // App Router is enabled by default in Next.js 13+, no need for experimental flag
  
  // Add custom webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add any additional webpack configuration here
    return config;
  },
};

// Export the configuration with page filtering applied
module.exports = withPageFilter(filterConfig)(nextConfig);