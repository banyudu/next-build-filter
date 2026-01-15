const withPageFilter = require('../../index.js');

// Configuration for page filtering
const filterConfig = {
  // Enable filtering when FILTER_PAGES=true or in specific environments
  enabled: process.env.FILTER_PAGES === 'true',
  
  // Enable verbose logging to see what's being filtered
  verbose: true,
  
  // Option 1: Exclude specific pages (supports glob patterns)
  excludedPages: [
    'admin',           // Exact: Exclude admin page
    'dev/**',          // Glob: Exclude all pages under /dev
    // 'contact',      // Exact: Exclude contact page
    // 'blog/*',       // Glob: Exclude direct children of /blog
    // '**/test',      // Glob: Exclude any page ending with /test
  ],
  
  // Option 2: Include only specific pages (supports glob patterns)
  // includedPages: [
  //   'index',         // Exact: Only include home page
  //   'about',         // Exact: Only include about page
  //   'blog/**',       // Glob: Include all blog pages
  //   'products/*',    // Glob: Include direct product pages
  // ],
  
  // Option 3: Use regex patterns for advanced exclusion (alternative to glob)
  excludePatterns: [
    // 'dev/.*',       // Regex: Exclude all pages in dev/ directory
    // '.*admin.*',    // Regex: Exclude any page with 'admin' in the path
  ],
  
  // Don't filter in development mode (set to true if you want filtering in dev)
  enableInDev: false,
};

const nextConfig = {
  reactStrictMode: true,

  // Add custom webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add any additional webpack configuration here
    return config;
  },
};

// Export the configuration with page filtering applied
module.exports = withPageFilter(filterConfig)(nextConfig);