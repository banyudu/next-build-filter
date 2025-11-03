declare module 'next-build-filter' {
  import { NextConfig } from 'next';
  
  interface FilterOptions {
    /** Enable/disable page filtering */
    enabled?: boolean;
    
    /** Show detailed logging of filtered pages */
    verbose?: boolean;
    
    /** Apply filtering in development mode */
    enableInDev?: boolean;
    
    /** 
     * Pages to include (if specified, only these will be built)
     * Supports glob patterns: 'admin/**', 'blog/*', '*\/test'
     * @example ['index', 'about', 'blog/**', 'products/*']
     */
    includedPages?: string[];
    
    /** 
     * Pages to exclude from build
     * Supports glob patterns: 'admin/**', 'dev/*', '*\/internal'
     * @example ['admin/**', 'dev/**', '*\/test']
     */
    excludedPages?: string[];
    
    /** 
     * Regex patterns for advanced page exclusion
     * @example ['dev/.*', '.*admin.*', '^api/v[0-9]+/']
     */
    excludePatterns?: string[];
    
    /** Pages directory name (default: 'pages') */
    pagesDir?: string;
    
    /** App directory name (default: 'app') */
    appDir?: string;
    
    /** Support App Router (Next.js 13+) */
    supportAppRouter?: boolean;
    
    /** Support Pages Router */
    supportPagesRouter?: boolean;
  }
  
  type NextConfigFunction = (nextConfig?: NextConfig) => NextConfig;
  
  function withPageFilter(options?: FilterOptions): NextConfigFunction;
  
  export = withPageFilter;
  export { FilterOptions, NextConfigFunction };
}