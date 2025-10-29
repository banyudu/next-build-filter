const withPageFilter = require('./plugins/withPageFilter');

// Example configuration for different scenarios

// Scenario 1: Development build with only essential pages
const developmentConfig = {
  enabled: process.env.NODE_ENV !== 'production',
  verbose: true,
  includedPages: [
    'index',    // Home page
    'about',    // About page
  ],
};

// Scenario 2: Production build excluding admin and dev pages
const productionConfig = {
  enabled: process.env.NODE_ENV === 'production',
  verbose: false,
  excludedPages: [
    'admin',
    'dev/debug',
  ],
  excludePatterns: [
    'dev/.*',
    '.*admin.*',
    '.*test.*',
  ],
};

// Scenario 3: Feature flag based filtering
const featureFlagConfig = {
  enabled: process.env.FILTER_PAGES === 'true',
  verbose: process.env.NODE_ENV === 'development',
  excludedPages: process.env.EXCLUDED_PAGES ? process.env.EXCLUDED_PAGES.split(',') : [],
  includedPages: process.env.INCLUDED_PAGES ? process.env.INCLUDED_PAGES.split(',') : [],
};

// Choose your configuration
const filterConfig = featureFlagConfig;

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: false
  },
};

module.exports = withPageFilter(filterConfig)(nextConfig);