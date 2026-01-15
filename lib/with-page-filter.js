/**
 * Next.js Page Filter Plugin
 *
 * Enhanced version that supports both Pages Router and App Router (Next.js 13+)
 * Supports glob patterns for includedPages and excludedPages options
 */
function withPageFilter(options = {}) {
  return (nextConfig = {}) => {
    const filterOptions = {
      // Spread options first, then apply defaults for undefined values
      ...options,
      includedPages: options.includedPages ?? [],
      excludedPages: options.excludedPages ?? [],
      enabled: options.enabled ?? process.env.FILTER_PAGES === 'true',
      excludePatterns: options.excludePatterns ?? [],
      verbose: options.verbose ?? false,
      pagesDir: options.pagesDir ?? 'pages',
      appDir: options.appDir ?? 'app',
      supportAppRouter: options.supportAppRouter !== false, // Default to true
      supportPagesRouter: options.supportPagesRouter !== false, // Default to true
    };

    if (!filterOptions.enabled) {
      if (filterOptions.verbose) {
        console.log('📄 Page filtering disabled');
      }
      return nextConfig;
    }

    return {
      ...nextConfig,
      
      webpack: (config, options) => {
        // Apply the existing webpack config if it exists
        if (nextConfig.webpack) {
          config = nextConfig.webpack(config, options);
        }

        // Don't apply filtering in development mode unless explicitly enabled
        if (options.dev && !filterOptions.enableInDev) {
          return config;
        }

        // Add our custom plugin
        const NextBuildFilterPlugin = require('./next-build-filter-plugin');
        config.plugins.push(new NextBuildFilterPlugin(filterOptions));

        return config;
      },

      // Preserve existing experimental settings
      experimental: {
        ...nextConfig.experimental
      }
    };
  };
}

module.exports = withPageFilter;