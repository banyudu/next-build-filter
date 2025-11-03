const path = require('path');
const fs = require('fs');
const { minimatch } = require('minimatch');

/**
 * Next.js Build Filter Plugin
 * 
 * This plugin allows you to exclude specific pages from the build process
 * without actually removing the files from your project.
 * Supports glob patterns via minimatch for flexible filtering.
 */
class NextBuildFilterPlugin {
  constructor(options = {}) {
    this.options = {
      // Pages to include (if specified, only these pages will be built)
      includedPages: options.includedPages || [],
      
      // Pages to exclude (these pages will be skipped during build)
      excludedPages: options.excludedPages || [],
      
      // Whether to enable filtering (can be controlled by environment variable)
      enabled: options.enabled !== undefined ? options.enabled : process.env.FILTER_PAGES === 'true',
      
      // Pattern matching for page exclusion
      excludePatterns: options.excludePatterns || [],
      
      // Verbose logging
      verbose: options.verbose || false,
      
      // Directory configurations
      pagesDir: options.pagesDir || 'pages',
      appDir: options.appDir || 'app',
      
      // Router support
      supportAppRouter: options.supportAppRouter !== false,
      supportPagesRouter: options.supportPagesRouter !== false
    };
  }

  apply(compiler) {
    if (!this.options.enabled) {
      if (this.options.verbose) {
        console.log('📄 NextBuildFilterPlugin: Filtering disabled');
      }
      return;
    }

    const pluginName = 'NextBuildFilterPlugin';
    
    // Hook into the compilation process
    compiler.hooks.beforeCompile.tapAsync(pluginName, (params, callback) => {
      if (this.options.verbose) {
        console.log('📄 NextBuildFilterPlugin: Starting page filtering...');
      }
      callback();
    });

    // Filter out pages during the resolve phase
    compiler.hooks.normalModuleFactory.tap(pluginName, (normalModuleFactory) => {
      normalModuleFactory.hooks.beforeResolve.tap(pluginName, (resolveData) => {
        if (!resolveData || !resolveData.request) {
          return;
        }

        const request = resolveData.request;
        
        // Check if this is a page file
        if (this.isPageFile(request, resolveData.context)) {
          const normalizedRequest = this.normalizePath(request);
          const routePath = this.extractRoutePath(normalizedRequest);
          const shouldExclude = this.shouldExcludePage(request);
          
          if (shouldExclude) {
            if (this.options.verbose) {
              console.log(`📄 Filtering out: ${routePath || request}`);
            }
            
            // Replace with empty module instead of blocking the request
            resolveData.request = require.resolve('./empty-module.js');
            return;
          }
        }
        
        // Don't return resolveData, just let it continue processing
      });
    });

    // Additional hook to filter entries
    compiler.hooks.entryOption.tap(pluginName, (context, entry) => {
      if (typeof entry === 'object' && !Array.isArray(entry)) {
        const filteredEntry = {};
        
        for (const [key, value] of Object.entries(entry)) {
          if (!this.shouldExcludeEntryPoint(key)) {
            filteredEntry[key] = value;
          } else if (this.options.verbose) {
            console.log(`📄 NextBuildFilterPlugin: Excluding entry point: ${key}`);
          }
        }
        
        // Replace the entry object with filtered version
        Object.keys(entry).forEach(key => delete entry[key]);
        Object.assign(entry, filteredEntry);
      }
    });
  }

  /**
   * Check if a request is for a page/route file
   */
  isPageFile(request, context) {
    if (!request) return false;
    
    // Check for common page file extensions
    const pageExtensions = ['.js', '.jsx', '.ts', '.tsx'];
    const hasPageExtension = pageExtensions.some(ext => request.endsWith(ext));
    
    if (!hasPageExtension) return false;
    
    // Check if the request is in the pages directory (Pages Router)
    // Next.js uses 'private-next-pages/' prefix for page imports
    const isInPages = this.options.supportPagesRouter && (
      request.includes(`/${this.options.pagesDir}/`) || 
      request.includes(`private-next-pages/`) ||
      (context && context.includes(`/${this.options.pagesDir}/`))
    );
    
    // Check if the request is in the app directory (App Router)
    const isInApp = this.options.supportAppRouter && (
      request.includes(`/${this.options.appDir}/`) || 
      (context && context.includes(`/${this.options.appDir}/`))
    );
    
    // For App Router, only filter page.tsx files, not layout.tsx or other special files
    if (isInApp) {
      // Don't filter layout.tsx, loading.tsx, error.tsx, etc.
      const appRouterSpecialFiles = ['layout.tsx', 'layout.ts', 'layout.jsx', 'layout.js',
                                     'loading.tsx', 'loading.ts', 'loading.jsx', 'loading.js',
                                     'error.tsx', 'error.ts', 'error.jsx', 'error.js',
                                     'not-found.tsx', 'not-found.ts', 'not-found.jsx', 'not-found.js',
                                     'template.tsx', 'template.ts', 'template.jsx', 'template.js'];
      
      const isSpecialFile = appRouterSpecialFiles.some(file => request.endsWith(file));
      if (isSpecialFile) {
        return false; // Don't filter special App Router files
      }
      
      // Only filter page.tsx files in App Router
      const isPageFile = request.endsWith('page.tsx') || request.endsWith('page.ts') || 
                        request.endsWith('page.jsx') || request.endsWith('page.js');
      return isPageFile;
    }
    
    return isInPages;
  }

  /**
   * Determine if a page should be excluded from the build
   * Supports glob patterns, exact matches, and regex patterns
   */
  shouldExcludePage(request) {
    const normalizedRequest = this.normalizePath(request);
    
    // Extract the route path from the request
    const routePath = this.extractRoutePath(normalizedRequest);
    if (!routePath) return false;
    
    // If includedPages is specified, only include those pages
    if (this.options.includedPages.length > 0) {
      const isIncluded = this.options.includedPages.some(page => {
        const normalizedPage = this.normalizePath(page);
        // Try glob matching first (using minimatch)
        if (minimatch(routePath, normalizedPage)) {
          return true;
        }
        // Fallback to exact match or prefix match for backward compatibility
        return routePath === normalizedPage || routePath.startsWith(normalizedPage + '/');
      });
      return !isIncluded;
    }
    
    // Check excluded pages
    if (this.options.excludedPages.length > 0) {
      const isExcluded = this.options.excludedPages.some(page => {
        const normalizedPage = this.normalizePath(page);
        // Try glob matching first (using minimatch)
        if (minimatch(routePath, normalizedPage)) {
          return true;
        }
        // Fallback to exact match or prefix match for backward compatibility
        return routePath === normalizedPage || routePath.startsWith(normalizedPage + '/');
      });
      if (isExcluded) return true;
    }
    
    // Check exclude patterns (regex patterns)
    if (this.options.excludePatterns.length > 0) {
      const isPatternExcluded = this.options.excludePatterns.some(pattern => {
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

  /**
   * Extract route path from a request
   */
  extractRoutePath(normalizedRequest) {
    let routePath = null;
    
    // Check for App Router path
    if (this.options.supportAppRouter) {
      const appIndex = normalizedRequest.indexOf(`/${this.options.appDir}/`);
      if (appIndex !== -1) {
        routePath = normalizedRequest.substring(appIndex + `/${this.options.appDir}/`.length);
      }
    }
    
    // Check for Pages Router path
    if (!routePath && this.options.supportPagesRouter) {
      // Check for Next.js internal private-next-pages/ prefix
      const privateIndex = normalizedRequest.indexOf('private-next-pages/');
      if (privateIndex !== -1) {
        routePath = normalizedRequest.substring(privateIndex + 'private-next-pages/'.length);
      } else {
        const pagesIndex = normalizedRequest.indexOf(`/${this.options.pagesDir}/`);
        if (pagesIndex !== -1) {
          routePath = normalizedRequest.substring(pagesIndex + `/${this.options.pagesDir}/`.length);
        }
      }
    }
    
    if (!routePath) return null;
    
    // Remove file name and extension for App Router
    if (this.options.supportAppRouter && normalizedRequest.includes(`/${this.options.appDir}/`)) {
      // Remove /page.tsx, /page.js, etc. (with or without leading slash)
      routePath = routePath.replace(/\/?page\.(tsx|ts|jsx|js)$/, '');
      // Remove leading slash if present
      routePath = routePath.replace(/^\//, '');
    } else {
      // For Pages Router, remove extension
      routePath = routePath.replace(/\.(tsx|ts|jsx|js)$/, '');
    }
    
    // Handle root route
    if (!routePath || routePath === '') {
      return 'index';
    }
    
    return routePath;
  }

  /**
   * Determine if an entry point should be excluded
   */
  shouldExcludeEntryPoint(entryKey) {
    // Entry keys in Next.js typically follow patterns like:
    // - pages/index
    // - pages/about
    // - pages/api/users
    
    if (entryKey.startsWith('pages/')) {
      const pagePath = entryKey.replace('pages/', '');
      return this.shouldExcludePage(pagePath);
    }
    
    return false;
  }

  /**
   * Normalize file paths for consistent comparison
   */
  normalizePath(filePath) {
    return filePath.replace(/\\/g, '/').toLowerCase();
  }
}

module.exports = NextBuildFilterPlugin;