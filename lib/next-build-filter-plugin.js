const { minimatch } = require('minimatch');
const path = require('path');

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
    
    // Resolve the empty module path once and store it
    // This ensures it resolves correctly regardless of where the plugin is loaded from
    this.emptyModulePath = path.resolve(__dirname, 'empty-module.js');
    
    // Store original Module._resolveFilename if we need to intercept Node.js module resolution
    this.originalResolveFilename = null;
  }

  apply(compiler) {
    if (!this.options.enabled) {
      if (this.options.verbose) {
        console.log('📄 NextBuildFilterPlugin: Filtering disabled');
      }
      return;
    }

    const pluginName = 'NextBuildFilterPlugin';
    
    // Intercept Node.js module resolution to catch Next.js requirePage calls
    // This is needed because Next.js uses requirePage which bypasses webpack
    // Note: This is a workaround for Next.js's page collection phase
    this.setupModuleResolutionInterceptor();
    
    // Hook into the compilation process
    compiler.hooks.beforeCompile.tapAsync(pluginName, (params, callback) => {
      if (this.options.verbose) {
        console.log('📄 NextBuildFilterPlugin: Starting page filtering...');
      }
      callback();
    });

    // Filter out pages during the resolve phase
    compiler.hooks.normalModuleFactory.tap(pluginName, (normalModuleFactory) => {
      // Hook into beforeResolve to intercept page module requests
      // Note: beforeResolve is a bailing hook - modify resolveData in place, don't return it
      normalModuleFactory.hooks.beforeResolve.tap(pluginName, (resolveData) => {
        if (!resolveData || !resolveData.request) {
          return;
        }

        const request = resolveData.request;
        
        // Additional safety check for webpack 4 compatibility
        if (typeof request !== 'string') {
          return;
        }
        
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
            // Use the pre-resolved absolute path to ensure it works in all contexts
            // Modify in place - don't return the object
            resolveData.request = this.emptyModulePath;
            return; // Continue processing with modified resolveData
          }
        }
        
        // Don't return anything - let webpack continue with the original resolveData
      });
      
      // Also hook into afterResolve as a fallback
      // Note: afterResolve is also a bailing hook
      normalModuleFactory.hooks.afterResolve.tap(pluginName, (resolveData) => {
        if (!resolveData || !resolveData.request) {
          return;
        }

        const request = resolveData.request;
        
        if (typeof request !== 'string') {
          return;
        }
        
        // Check if this is a page file that should be excluded
        if (this.isPageFile(request, resolveData.context)) {
          const normalizedRequest = this.normalizePath(request);
          const routePath = this.extractRoutePath(normalizedRequest);
          const shouldExclude = this.shouldExcludePage(request);
          
          if (shouldExclude && request !== this.emptyModulePath) {
            if (this.options.verbose) {
              console.log(`📄 Filtering out (afterResolve): ${routePath || request}`);
            }
            
            // Replace with empty module - modify in place
            resolveData.request = this.emptyModulePath;
            return; // Continue processing with modified resolveData
          }
        }
        
        // Don't return anything - let webpack continue
      });
    });
    
    // Hook into compilation to intercept module building
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.buildModule.tap(pluginName, (module) => {
        if (module.resource && typeof module.resource === 'string') {
          if (this.isPageFile(module.resource, module.context)) {
            const normalizedRequest = this.normalizePath(module.resource);
            const routePath = this.extractRoutePath(normalizedRequest);
            const shouldExclude = this.shouldExcludePage(module.resource);
            
            if (shouldExclude && module.resource !== this.emptyModulePath) {
              if (this.options.verbose) {
                console.log(`📄 Filtering module during build: ${routePath || module.resource}`);
              }
              // Mark module as filtered - this prevents it from being processed
              module._filtered = true;
            }
          }
        }
      });
    });

    // NOTE: We intentionally do NOT filter entries here because Next.js still needs
    // compiled modules to exist for page data collection. Instead, we let all entries
    // compile but replace their content with empty modules via beforeResolve/afterResolve hooks.
    // This ensures Next.js can find and load the modules, but they'll be empty stubs.
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
      // Handle route groups - remove (group) patterns like (auth), (admin)
      routePath = routePath.replace(/\/?\([^)]+\)/g, '');
    } else {
      // For Pages Router, remove extension
      routePath = routePath.replace(/\.(tsx|ts|jsx|js)$/, '');
    }

    // Clean up empty segments and normalize
    routePath = routePath.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');

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
    // Pages Router: pages/index, pages/about, pages/api/users
    // App Router: app/page, app/about/page, app/admin/users/page

    if (this.options.supportPagesRouter && entryKey.startsWith('pages/')) {
      const pagePath = entryKey.replace('pages/', '');
      return this.shouldExcludePage(`/${this.options.pagesDir}/${pagePath}.js`);
    }

    if (this.options.supportAppRouter && entryKey.startsWith('app/')) {
      const pagePath = entryKey.replace('app/', '');
      return this.shouldExcludePage(`/${this.options.appDir}/${pagePath}.js`);
    }

    return false;
  }

  /**
   * Normalize file paths for consistent comparison
   */
  normalizePath(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      return '';
    }
    return filePath.replace(/\\/g, '/').toLowerCase();
  }
  
  /**
   * Setup Node.js module resolution interceptor to catch Next.js requirePage calls
   * This is needed because Next.js uses requirePage which bypasses webpack
   */
  setupModuleResolutionInterceptor() {
    const Module = require('module');
    
    // Only intercept if not already intercepted
    if (this.originalResolveFilename) {
      return;
    }
    
    // Store the original resolveFilename
    this.originalResolveFilename = Module._resolveFilename;
    const self = this;
    
    // Intercept module resolution
    Module._resolveFilename = function(request, parent, isMain, options) {
      // Check if this request might be for a filtered page before trying to resolve
      // Next.js requirePage uses paths like "/admin" or paths to page files
      const normalizedRequest = self.normalizePath(request);
      let routePath = self.extractRoutePath(normalizedRequest);
      
      // If we can't extract route path from request, try to infer it
      // Next.js might be looking for pages like "/admin" or "/dev/debug"
      if (!routePath && request && typeof request === 'string') {
        // Check if request looks like a Next.js page path (starts with / but not /node_modules)
        if (request.startsWith('/') && !request.startsWith('/node_modules') && !request.includes('node_modules')) {
          routePath = request.replace(/^\//, '').replace(/\/$/, '');
          if (!routePath) routePath = 'index';
        }
      }
      
      // Check if this route should be excluded
      if (routePath) {
        // Try multiple path formats that Next.js might use
        const testPaths = [
          request,
          `/${self.options.pagesDir}/${routePath}.js`,
          `/${self.options.pagesDir}/${routePath}.jsx`,
          `/${self.options.pagesDir}/${routePath}.ts`,
          `/${self.options.pagesDir}/${routePath}.tsx`,
          `/${self.options.appDir}/${routePath}/page.js`,
          `/${self.options.appDir}/${routePath}/page.jsx`,
          `/${self.options.appDir}/${routePath}/page.ts`,
          `/${self.options.appDir}/${routePath}/page.tsx`,
          routePath,
          `/${routePath}`,
        ];
        
        const shouldExclude = testPaths.some(testPath => self.shouldExcludePage(testPath));
        
        if (shouldExclude) {
          if (self.options.verbose) {
            console.log(`📄 Intercepting module resolution for filtered page: ${routePath} (request: ${request})`);
          }
          // Return the empty module path instead
          return self.emptyModulePath;
        }
      }
      
      // Try to resolve normally
      try {
        const resolvedPath = self.originalResolveFilename.call(this, request, parent, isMain, options);
        
        // Check if the resolved path is a page file that should be excluded
        if (resolvedPath && self.isPageFile(resolvedPath, parent ? parent.filename : null)) {
          const normalizedResolved = self.normalizePath(resolvedPath);
          const resolvedRoutePath = self.extractRoutePath(normalizedResolved);
          const shouldExclude = self.shouldExcludePage(resolvedPath);
          
          if (shouldExclude) {
            if (self.options.verbose) {
              console.log(`📄 Intercepting resolved module for filtered page: ${resolvedRoutePath || resolvedPath}`);
            }
            // Return the empty module path instead
            return self.emptyModulePath;
          }
        }
        
        return resolvedPath;
      } catch (e) {
        // If resolution fails and it's a filtered page, return empty module
        if (routePath) {
          const testPaths = [
            request,
            `/${self.options.pagesDir}/${routePath}.js`,
            `/${self.options.appDir}/${routePath}/page.js`,
            routePath,
            `/${routePath}`,
          ];
          
          const shouldExclude = testPaths.some(testPath => self.shouldExcludePage(testPath));
          
          if (shouldExclude) {
            if (self.options.verbose) {
              console.log(`📄 Intercepting failed resolution for filtered page: ${routePath} (request: ${request})`);
            }
            return self.emptyModulePath;
          }
        }
        
        // Re-throw the original error if it's not a filtered page
        throw e;
      }
    };
  }
}

module.exports = NextBuildFilterPlugin;