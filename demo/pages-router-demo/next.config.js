const withPageFilter = require('../../index.js');

// Configuration for page filtering
const filterConfig = {
  // Enable filtering when FILTER_PAGES=true or in specific environments
  enabled: process.env.FILTER_PAGES === 'true',
  
  // Enable verbose logging to see what's being filtered
  verbose: true,
  
  // Option 1: Exclude specific pages (uncomment to use)
  excludedPages: [
    'admin',           // Exclude /admin page
    'dev/debug',       // Exclude /dev/debug page
    // 'contact',      // Uncomment to exclude contact page
    // 'blog',         // Uncomment to exclude blog page
  ],
  
  // Option 2: Include only specific pages (uncomment to use instead of excludedPages)
  // includedPages: [
  //   'index',         // Only include home page
  //   'about',         // Only include about page
  // ],
  
  // Option 3: Use regex patterns to exclude pages
  excludePatterns: [
    'dev/.*',          // Exclude all pages in dev/ directory
    '.*admin.*',       // Exclude any page with 'admin' in the path
  ],
  
  // Don't filter in development mode (set to true if you want filtering in dev)
  enableInDev: false,
};

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: false
  },
  
  // Add custom webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add any additional webpack configuration here
    return config;
  },
};

// Export the configuration with page filtering applied
module.exports = withPageFilter(filterConfig)(nextConfig);