const path = require('path');
const { minimatch } = require('minimatch');

/**
 * Next.js Page Filter Plugin
 * 
 * Enhanced version that supports both Pages Router and App Router (Next.js 13+)
 * Supports glob patterns for includedPages and excludedPages options
 */
function withPageFilter(options = {}) {
  return (nextConfig = {}) => {
    const filterOptions = {
      includedPages: options.includedPages || [],
      excludedPages: options.excludedPages || [],
      enabled: options.enabled !== undefined ? options.enabled : process.env.FILTER_PAGES === 'true',
      excludePatterns: options.excludePatterns || [],
      verbose: options.verbose || false,
      pagesDir: options.pagesDir || 'pages',
      appDir: options.appDir || 'app',
      supportAppRouter: options.supportAppRouter !== false, // Default to true
      supportPagesRouter: options.supportPagesRouter !== false, // Default to true
      ...options
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

function isPageFile(request, context, options) {
  if (!request) return false;
  
  const pageExtensions = ['.js', '.jsx', '.ts', '.tsx'];
  const hasPageExtension = pageExtensions.some(ext => request.endsWith(ext));
  
  if (!hasPageExtension) return false;
  
  // Check for Pages Router
  const isInPagesDir = options.supportPagesRouter && (
    request.includes(`/${options.pagesDir}/`) || 
    (context && context.includes(`/${options.pagesDir}/`))
  );
  
  // Check for App Router
  const isInAppDir = options.supportAppRouter && (
    request.includes(`/${options.appDir}/`) || 
    (context && context.includes(`/${options.appDir}/`))
  );
  
  return isInPagesDir || isInAppDir;
}

function shouldExcludePage(request, options) {
  const normalizedRequest = normalizePath(request);
  
  // Extract route path from request
  const routePath = extractRoutePath(normalizedRequest, options);
  
  if (!routePath) return false;
  
  // If includedPages is specified, only include those pages
  if (options.includedPages && options.includedPages.length > 0) {
    const isIncluded = options.includedPages.some(page => {
      const normalizedPage = normalizePath(page);
      // Try glob matching first
      if (minimatch(routePath, normalizedPage)) {
        return true;
      }
      // Fallback to exact match or substring match for backward compatibility
      return routePath === normalizedPage || routePath.includes(normalizedPage);
    });
    return !isIncluded;
  }
  
  // Check excluded pages
  if (options.excludedPages && options.excludedPages.length > 0) {
    const isExcluded = options.excludedPages.some(page => {
      const normalizedPage = normalizePath(page);
      // Try glob matching first
      if (minimatch(routePath, normalizedPage)) {
        return true;
      }
      // Fallback to exact match or substring match for backward compatibility
      return routePath === normalizedPage || routePath.includes(normalizedPage);
    });
    if (isExcluded) return true;
  }
  
  // Check exclude patterns (regex patterns)
  if (options.excludePatterns && options.excludePatterns.length > 0) {
    const isPatternExcluded = options.excludePatterns.some(pattern => {
      try {
        const regex = new RegExp(pattern);
        return regex.test(routePath);
      } catch (e) {
        console.warn(`📄 Invalid regex pattern: ${pattern}`);
        return false;
      }
    });
    if (isPatternExcluded) return true;
  }
  
  return false;
}

function extractRoutePath(normalizedRequest, options) {
  // Extract route path from either /pages/ or /app/ directory
  let routePath = null;
  
  // Check for Pages Router path
  if (options.supportPagesRouter) {
    const pagesIndex = normalizedRequest.indexOf(`/${options.pagesDir}/`);
    if (pagesIndex !== -1) {
      routePath = normalizedRequest.substring(pagesIndex + `/${options.pagesDir}/`.length);
    }
  }
  
  // Check for App Router path
  if (!routePath && options.supportAppRouter) {
    const appIndex = normalizedRequest.indexOf(`/${options.appDir}/`);
    if (appIndex !== -1) {
      routePath = normalizedRequest.substring(appIndex + `/${options.appDir}/`.length);
    }
  }
  
  if (!routePath) return null;
  
  // Remove file extension
  routePath = routePath.replace(/\.(js|jsx|ts|tsx)$/, '');
  
  // Handle special App Router files
  if (options.supportAppRouter) {
    // Remove App Router special files (page.tsx, layout.tsx, etc.)
    routePath = routePath.replace(/\/(page|layout|loading|error|not-found|template|default)$/, '');
    
    // Handle route groups - remove (group) patterns
    routePath = routePath.replace(/\/\([^)]+\)/g, '');
  }
  
  // Clean up empty segments and normalize
  routePath = routePath.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
  
  return routePath || 'index';
}

function normalizePath(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    return '';
  }
  return filePath.replace(/\\/g, '/').toLowerCase();
}

module.exports = withPageFilter;