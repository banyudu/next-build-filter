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
  
  // Exclude specific routes
  excludedPages: [
    'admin',           // Exclude /admin route
    'dev/debug',       // Exclude /dev/debug route
    // 'contact',      // Uncomment to exclude contact route
    // 'blog',         // Uncomment to exclude blog route
  ],
  
  // Use regex patterns to exclude routes
  excludePatterns: [
    'dev/.*',          // Exclude all routes in dev/ directory
    '.*admin.*',       // Exclude any route with 'admin' in the path
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