const path = require('path');
const fs = require('fs');

/**
 * Advanced Next.js Build Filter Plugin
 * 
 * This version integrates more deeply with Next.js's build process
 * to provide better filtering capabilities.
 */
class AdvancedNextBuildFilterPlugin {
  constructor(options = {}) {
    this.options = {
      includedPages: options.includedPages || [],
      excludedPages: options.excludedPages || [],
      enabled: options.enabled !== undefined ? options.enabled : process.env.FILTER_PAGES === 'true',
      excludePatterns: options.excludePatterns || [],
      verbose: options.verbose || false,
      pagesDir: options.pagesDir || 'pages',
      ...options
    };

    this.filteredPages = new Set();
  }

  apply(compiler) {
    if (!this.options.enabled) {
      if (this.options.verbose) {
        console.log('📄 AdvancedNextBuildFilterPlugin: Filtering disabled');
      }
      return;
    }

    const pluginName = 'AdvancedNextBuildFilterPlugin';

    // Hook into the entry option to filter pages at the entry level
    compiler.hooks.entryOption.tap(pluginName, (context, entry) => {
      if (typeof entry === 'object' && !Array.isArray(entry)) {
        this.filterEntries(entry);
      }
    });

    // Hook into the compilation to filter modules
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.buildModule.tap(pluginName, (module) => {
        if (module.resource && this.shouldFilterModule(module.resource)) {
          if (this.options.verbose) {
            console.log(`📄 Filtering module: ${module.resource}`);
          }
          // Mark the module as filtered
          module._filtered = true;
        }
      });
    });

    // Hook into normal module factory to intercept page imports
    compiler.hooks.normalModuleFactory.tap(pluginName, (nmf) => {
      nmf.hooks.beforeResolve.tap(pluginName, (resolveData) => {
        if (!resolveData) return;

        const request = resolveData.request;
        const context = resolveData.context;

        // Additional safety check for webpack 4 compatibility
        if (!request || typeof request !== 'string') {
          return resolveData;
        }

        if (this.isPageModule(request, context) && this.shouldFilterPage(request)) {
          if (this.options.verbose) {
            console.log(`📄 Intercepting page request: ${request}`);
          }
          
          // Replace with empty module
          // Use require.resolve instead of path.resolve to ensure compatibility with webpack 4
          resolveData.request = require.resolve('./empty-module.js');
          this.filteredPages.add(request);
        }

        return resolveData;
      });
    });

    // Log summary after compilation
    compiler.hooks.done.tap(pluginName, () => {
      if (this.options.verbose && this.filteredPages.size > 0) {
        console.log(`📄 Filtered ${this.filteredPages.size} pages:`);
        this.filteredPages.forEach(page => {
          console.log(`   - ${page}`);
        });
      }
    });
  }

  filterEntries(entry) {
    const keysToRemove = [];
    
    for (const [key, value] of Object.entries(entry)) {
      if (this.isPageEntry(key) && this.shouldFilterPageEntry(key)) {
        keysToRemove.push(key);
        if (this.options.verbose) {
          console.log(`📄 Filtering entry: ${key}`);
        }
      }
    }

    // Remove filtered entries
    keysToRemove.forEach(key => {
      delete entry[key];
      this.filteredPages.add(key);
    });
  }

  isPageEntry(entryKey) {
    // Next.js page entries typically start with 'pages/'
    return entryKey.startsWith('pages/') || entryKey.startsWith('static/chunks/pages/');
  }

  isPageModule(request, context) {
    if (!request || !context) return false;

    // Check if it's in the pages directory
    const isInPages = request.includes(`/${this.options.pagesDir}/`) || 
                     context.includes(`/${this.options.pagesDir}/`);

    // Check for page-like file extensions
    const pageExtensions = ['.js', '.jsx', '.ts', '.tsx'];
    const hasPageExtension = pageExtensions.some(ext => request.endsWith(ext));

    // Exclude API routes and special Next.js files
    const isApiRoute = request.includes('/api/');
    const isSpecialFile = ['_app', '_document', '_error', '404', '500'].some(special => 
      request.includes(special)
    );

    return isInPages && hasPageExtension && !isApiRoute && !isSpecialFile;
  }

  shouldFilterModule(resourcePath) {
    if (!resourcePath) return false;
    
    const normalizedPath = this.normalizePath(resourcePath);
    
    // Extract page path from full resource path
    const pagesIndex = normalizedPath.indexOf(`/${this.options.pagesDir}/`);
    if (pagesIndex === -1) return false;
    
    const pagePath = normalizedPath.substring(pagesIndex + `/${this.options.pagesDir}/`.length);
    return this.shouldFilterPage(pagePath);
  }

  shouldFilterPage(pagePath) {
    const normalizedPath = this.normalizePath(pagePath);
    
    // Remove file extension for comparison
    const pathWithoutExt = normalizedPath.replace(/\.(js|jsx|ts|tsx)$/, '');
    
    // If includedPages is specified, only include those
    if (this.options.includedPages.length > 0) {
      const isIncluded = this.options.includedPages.some(page => {
        const normalizedPage = this.normalizePath(page);
        return pathWithoutExt === normalizedPage || pathWithoutExt.endsWith(`/${normalizedPage}`);
      });
      return !isIncluded;
    }
    
    // Check excluded pages
    if (this.options.excludedPages.length > 0) {
      const isExcluded = this.options.excludedPages.some(page => {
        const normalizedPage = this.normalizePath(page);
        return pathWithoutExt === normalizedPage || pathWithoutExt.endsWith(`/${normalizedPage}`);
      });
      if (isExcluded) return true;
    }
    
    // Check exclude patterns
    if (this.options.excludePatterns.length > 0) {
      const isPatternExcluded = this.options.excludePatterns.some(pattern => {
        try {
          const regex = new RegExp(pattern);
          return regex.test(pathWithoutExt);
        } catch (e) {
          console.warn(`📄 Invalid regex pattern: ${pattern}`);
          return false;
        }
      });
      if (isPatternExcluded) return true;
    }
    
    return false;
  }

  shouldFilterPageEntry(entryKey) {
    // Extract page path from entry key
    let pagePath = entryKey;
    
    if (entryKey.startsWith('pages/')) {
      pagePath = entryKey.substring(6); // Remove 'pages/' prefix
    } else if (entryKey.startsWith('static/chunks/pages/')) {
      pagePath = entryKey.substring(20); // Remove 'static/chunks/pages/' prefix
    }
    
    return this.shouldFilterPage(pagePath);
  }

  normalizePath(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      return '';
    }
    return filePath.replace(/\\/g, '/').toLowerCase();
  }
}

module.exports = AdvancedNextBuildFilterPlugin;