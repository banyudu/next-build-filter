# Next.js Build Filter Plugin

A powerful Next.js plugin that allows you to exclude specific pages/routes from the build process without removing the files from your project. **Supports both Next.js Pages Router and App Router (Next.js 13+)**. This is perfect for speeding up development builds, creating different build configurations, or excluding admin/debug pages from production builds.

## Features

- 🚀 **Speed up builds** by excluding unnecessary pages/routes
- 📱 **App Router Support** - Full Next.js 13+ App Router compatibility
- 📄 **Pages Router Support** - Traditional Pages Router support
- 🎯 **Flexible filtering** with multiple configuration options
- 🌟 **Glob Pattern Matching** - Use powerful wildcards like `admin/**`, `*/test`, `blog/*`, `**/internal/**`
- 🔄 **Non-destructive** - files remain in your codebase
- 🌍 **Environment-aware** - different configurations for dev/prod
- 📝 **Verbose logging** to see what's being filtered
- 🎨 **Advanced pattern matching** support with regex (for complex cases)
- 🔧 **TypeScript support** with full type definitions

## Installation

```bash
npm install next-build-filter
```

## Quick Start

### For Pages Router (Traditional Next.js)

```javascript
// next.config.js
const withPageFilter = require('next-build-filter');

const filterConfig = {
  enabled: process.env.FILTER_PAGES === 'true',
  verbose: true,
  supportPagesRouter: true,
  supportAppRouter: false,
  excludedPages: [
    'admin/**',    // Exclude all admin pages (supports glob patterns)
    'dev/**',      // Exclude all dev pages
  ],
};

module.exports = withPageFilter(filterConfig)({
  reactStrictMode: true,
});
```

### For App Router (Next.js 13+)

```javascript
// next.config.js
const withPageFilter = require('next-build-filter');

const filterConfig = {
  enabled: process.env.FILTER_PAGES === 'true',
  verbose: true,
  supportAppRouter: true,
  supportPagesRouter: false,
  excludedPages: [
    'admin/**',     // Excludes all routes under app/admin/ (glob pattern)
    'dev/**',       // Excludes all routes under app/dev/
  ],
};

module.exports = withPageFilter(filterConfig)({
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
});
```

### For Mixed Router Support (Both App Router and Pages Router)

```javascript
// next.config.js
const withPageFilter = require('next-build-filter');

const filterConfig = {
  enabled: process.env.FILTER_PAGES === 'true',
  verbose: true,
  supportAppRouter: true,
  supportPagesRouter: true,
  excludedPages: [
    'admin/**',     // Excludes both pages/admin/** and app/admin/** (glob pattern)
    'dev/**',       // Excludes both pages/dev/** and app/dev/**
    '**/internal',  // Excludes any route ending with /internal
  ],
};

module.exports = withPageFilter(filterConfig)({
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
});
```

3. **Run filtered builds:**
```bash
# Normal build (all pages included)
npm run build

# Filtered build (excludes configured pages)
FILTER_PAGES=true npm run build

# Or use the predefined script
npm run build:filtered
```

## Glob Pattern Quick Reference

The plugin supports powerful glob patterns for flexible page/route matching:

| Pattern | What it matches | Example |
|---------|----------------|---------|
| `admin` | Exact match | `/admin` only |
| `admin/*` | One level deep | `/admin/users`, `/admin/settings` |
| `admin/**` | Any depth | `/admin/users`, `/admin/users/edit`, `/admin/settings/advanced` |
| `**/test` | Ending with | `/api/test`, `/components/test`, `/admin/tools/test` |
| `*/debug` | One wildcard | `/api/debug`, `/dev/debug` |
| `**/internal/**` | Containing | Any route with `/internal/` anywhere in path |
| `{admin,dev}/**` | Multiple patterns | All routes under `/admin` or `/dev` |

**Example Usage:**
```javascript
excludedPages: [
  'admin/**',        // ✅ Exclude all admin routes (recommended)
  'dev/**/test',     // ✅ Exclude test pages in dev directory
  '*-draft',         // ✅ Exclude pages ending with -draft
  'api/*/internal',  // ✅ Exclude internal API routes
]
```

## Configuration Options

### Basic Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `process.env.FILTER_PAGES === 'true'` | Enable/disable page filtering |
| `verbose` | boolean | `false` | Show detailed logging of filtered pages |
| `enableInDev` | boolean | `false` | Apply filtering in development mode |

### Router Support Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `supportAppRouter` | boolean | `true` | Enable filtering for App Router (Next.js 13+) |
| `supportPagesRouter` | boolean | `true` | Enable filtering for Pages Router |
| `appDir` | string | `'app'` | App Router directory name |
| `pagesDir` | string | `'pages'` | Pages Router directory name |

### Filtering Options

The plugin supports three types of matching:
1. **Exact Match** - Direct string matching
2. **Glob Patterns** - Flexible wildcard matching (powered by [minimatch](https://github.com/isaacs/minimatch))
3. **Regex Patterns** - Advanced pattern matching via `excludePatterns`

#### Glob Pattern Syntax

| Pattern | Description | Example Matches |
|---------|-------------|-----------------|
| `*` | Matches any characters except `/` | `blog/*` matches `blog/post1`, `blog/post2` but not `blog/category/post1` |
| `**` | Matches any characters including `/` | `blog/**` matches `blog/post1`, `blog/category/post1`, `blog/a/b/c` |
| `?` | Matches exactly one character | `user/?/profile` matches `user/a/profile`, `user/1/profile` |
| `[abc]` | Matches any character in the brackets | `user/[0-9]/profile` matches `user/0/profile`, `user/5/profile` |
| `{a,b}` | Matches any of the patterns | `{admin,dev}/**` matches `admin/users`, `dev/debug` |
| `!` at start | Negation (not commonly used in this plugin) | `!admin/**` would match everything except admin routes |

**Common Glob Patterns Cheat Sheet:**

| Use Case | Pattern | Matches |
|----------|---------|---------|
| Exact page | `admin` | `/admin` only |
| Direct children | `admin/*` | `/admin/users`, `/admin/settings` (not nested) |
| All nested routes | `admin/**` | `/admin/users`, `/admin/users/edit`, `/admin/settings/advanced` |
| Ends with | `**/test` or `**/*-test` | `/api/test`, `/users/profile-test` |
| Starts with | `admin/**` or `admin*` | `/admin`, `/admin-panel`, `/admin/users` |
| Contains | `**/internal/**` | Any path with `/internal/` segment |
| Multiple patterns | `{admin,dev,test}/**` | All routes under `/admin`, `/dev`, or `/test` |
| Specific file patterns | `**/*-draft` | `/blog/post-draft`, `/products/item-draft` |
| API versioning | `api/v{1,2}/**` | `/api/v1/*`, `/api/v2/*` |
| Wildcard in middle | `api/*/internal` | `/api/users/internal`, `/api/products/internal` |

#### 1. Include Only Specific Pages

**Exact Match:**
```javascript
const filterConfig = {
  enabled: true,
  includedPages: [
    'index',      // /
    'about',      // /about
    'contact',    // /contact
  ],
};
```

**Glob Pattern Matching:**
```javascript
const filterConfig = {
  enabled: true,
  includedPages: [
    'index',           // Exact match: /
    'blog/*',          // All direct children: /blog/post1, /blog/post2
    'products/**',     // All nested routes: /products/*, /products/category/*, etc.
    'user/*/profile',  // Wildcard in middle: /user/123/profile, /user/456/profile
  ],
};
```

#### 2. Exclude Specific Pages

**Exact Match:**
```javascript
const filterConfig = {
  enabled: true,
  excludedPages: [
    'admin',           // /admin
    'dev/debug',       // /dev/debug
    'api/internal',    // /api/internal
  ],
};
```

**Glob Pattern Matching:**
```javascript
const filterConfig = {
  enabled: true,
  excludedPages: [
    'admin',           // Exact match: /admin
    'admin/*',         // All admin sub-pages: /admin/users, /admin/settings
    'admin/**',        // All nested admin routes: /admin/*, /admin/users/*, etc.
    'dev/**',          // All dev routes: /dev/*, /dev/debug/*, etc.
    '*/test',          // Any route ending with /test: /api/test, /dev/test
    '**/internal/**',  // Any route containing /internal/
  ],
};
```

#### 3. Regex Pattern-Based Exclusion (Advanced)

For complex patterns that can't be expressed with glob syntax, use `excludePatterns`:
```javascript
const filterConfig = {
  enabled: true,
  excludePatterns: [
    'dev/.*',          // Regex: All pages in /dev/ directory
    '.*admin.*',       // Regex: Any page with 'admin' in the path
    '.*test.*',        // Regex: Any page with 'test' in the path
    '^api/v[0-9]+/',   // Regex: API versioned routes like /api/v1/, /api/v2/
  ],
};
```

### Glob Patterns vs Regex Patterns

Choose the right pattern type for your use case:

| Use Case | Glob Pattern | Regex Pattern | Recommendation |
|----------|--------------|---------------|----------------|
| Exclude all admin routes | `admin/**` | `admin/.*` | ✅ Use Glob (simpler) |
| Exclude routes ending with -test | `**/*-test` | `.*-test$` | ✅ Use Glob (simpler) |
| Exclude versioned API routes (v1, v2) | N/A | `^api/v[0-9]+/` | ✅ Use Regex (complex pattern) |
| Match any route containing 'internal' | `**/internal/**` | `.*internal.*` | ✅ Use Glob (simpler) |
| Match routes with date pattern (2024-01-01) | N/A | `^\d{4}-\d{2}-\d{2}$` | ✅ Use Regex (complex pattern) |

**Guidelines:**
- **Use Glob Patterns** (`includedPages`/`excludedPages`) for most cases - they're simpler and more readable
- **Use Regex Patterns** (`excludePatterns`) only when you need advanced matching like character classes, lookaheads, or complex alternations

## Usage Examples

### Development Speed Build
Perfect for large projects where you only need a few pages during development:

```javascript
// next.config.js
const withPageFilter = require('./plugins/withPageFilter');

const filterConfig = {
  enabled: process.env.NODE_ENV === 'development',
  verbose: true,
  includedPages: [
    'index',
    'dashboard',
    'profile',
  ],
};

module.exports = withPageFilter(filterConfig)({
  reactStrictMode: true,
});
```

### Production Admin Exclusion
Exclude admin and debug pages from production builds using glob patterns:

```javascript
const filterConfig = {
  enabled: process.env.NODE_ENV === 'production',
  excludedPages: [
    'admin/**',        // Exclude all admin routes
    'debug',           // Exclude debug page
    'dev/**',          // Exclude all dev tools and utilities
    '**/test',         // Exclude all test pages
    'internal/**',     // Exclude internal pages
  ],
};
```

### Multi-team Development
Build only specific feature sets for different teams:

```javascript
// Team A: Only marketing pages
const marketingConfig = {
  enabled: true,
  includedPages: [
    'index',
    'about',
    'contact',
    'blog/**',         // All blog routes
    'marketing/**',    // All marketing pages
  ],
};

// Team B: Only product pages
const productConfig = {
  enabled: true,
  includedPages: [
    'products/**',     // All product routes
    'checkout/**',     // All checkout routes
    'cart',            // Shopping cart
  ],
};
```

### Exclude Test and Debug Routes
Use glob patterns to exclude testing and debugging routes:

```javascript
const filterConfig = {
  enabled: process.env.NODE_ENV === 'production',
  excludedPages: [
    '**/*-test',       // Exclude all routes ending with -test
    '**/*-debug',      // Exclude all routes ending with -debug
    'test/**',         // Exclude all test directory routes
    'debug/**',        // Exclude all debug directory routes
    'dev/**',          // Exclude all development routes
    'playground/**',   // Exclude playground routes
  ],
};
```

### API Route Filtering
Filter specific API routes using glob patterns:

```javascript
const filterConfig = {
  enabled: true,
  excludedPages: [
    'api/internal/**',        // Exclude internal API routes
    'api/*/admin',            // Exclude admin endpoints in any API version
    'api/webhooks/test-*',    // Exclude test webhooks
    'api/v*/deprecated/**',   // Exclude deprecated endpoints in all versions
  ],
};
```

### Feature Flag Based Builds
Create builds with specific features using glob patterns:

```javascript
const filterConfig = {
  enabled: true,
  includedPages: [
    'index',                           // Home page
    'about',                           // About page
    // Conditionally include features based on environment
    ...(process.env.ENABLE_BLOG ? ['blog/**'] : []),
    ...(process.env.ENABLE_SHOP ? ['shop/**', 'cart', 'checkout/**'] : []),
    ...(process.env.ENABLE_FORUM ? ['forum/**', 'community/**'] : []),
  ],
};
```

### Multi-language Site Filtering
Build specific language versions:

```javascript
const filterConfig = {
  enabled: true,
  // Only build English version
  includedPages: [
    'en/**',           // All English pages
    'index',           // Root page
  ],
  // Or exclude other languages
  excludedPages: [
    'fr/**',           // Exclude French
    'de/**',           // Exclude German  
    'es/**',           // Exclude Spanish
    'ja/**',           // Exclude Japanese
  ],
};
```

### Environment Variable Control
Use environment variables for flexible configuration:

```javascript
const filterConfig = {
  enabled: process.env.FILTER_PAGES === 'true',
  verbose: process.env.NODE_ENV === 'development',
  excludedPages: process.env.EXCLUDED_PAGES ? 
    process.env.EXCLUDED_PAGES.split(',') : [],
  includedPages: process.env.INCLUDED_PAGES ? 
    process.env.INCLUDED_PAGES.split(',') : [],
};
```

Then use it:
```bash
# Include only specific pages
FILTER_PAGES=true INCLUDED_PAGES=index,about,contact npm run build

# Exclude specific pages
FILTER_PAGES=true EXCLUDED_PAGES=admin,debug npm run build
```

## Available Scripts

The project includes several npm scripts for different build scenarios:

```bash
# Development server
npm run dev

# Normal build (all pages)
npm run build

# Filtered build (respects FILTER_PAGES environment variable)
npm run build:filtered

# Start production server
npm start
```

## How It Works

The plugin works by integrating with Next.js's webpack configuration and build process:

1. **Webpack Plugin Integration**: The plugin hooks into webpack's module resolution process
2. **Page Detection**: It identifies page files in the `/pages` and `/app` directories (based on router support configuration)
3. **Path Normalization**: Routes are normalized (lowercase, forward slashes) for consistent matching
4. **Pattern Matching**: For each page, the plugin checks if it should be filtered using:
   - **Glob patterns** (via [minimatch](https://github.com/isaacs/minimatch)) - checked first
   - **Exact string matching** - fallback for backward compatibility
   - **Regex patterns** (via `excludePatterns`) - for advanced cases
5. **Filtering Logic**: Based on your configuration, it determines which pages to include/exclude
6. **Module Replacement**: Filtered pages are replaced with empty modules during the build process
7. **Build Optimization**: The final bundle only includes meaningful content for pages you want

### Important: Custom 404 Replacement

The plugin **replaces** filtered pages with custom 404 pages rather than **removing** them entirely from the build. This approach:

- ✅ **Clear user feedback**: Users see a "Page Not Available" message if they access a filtered page
- ✅ **Preserves routing structure**: Pages still exist in the manifest
- ✅ **Prevents build errors**: No missing module errors from dependencies
- ✅ **Testable**: Contains a unique marker (`NEXT_BUILD_FILTER_EXCLUDED_PAGE`) for verification
- ✅ **Proper HTTP status**: Returns 404 status code

**For App Router**: Uses Next.js's built-in `notFound()` function for proper 404 handling
**For Pages Router**: Returns a custom 404 component with proper status code

**What this means:**
- Filtered pages will still appear in your `.next/server` directory
- They will show a "Page Not Available" message if accessed
- The pages contain minimal code (just the 404 component)
- Build verification can detect filtered pages via the unique marker

### Pattern Matching Priority

When matching routes, the plugin uses this order:

1. **Glob Pattern Match** (via minimatch): `admin/**` matches `admin/users/list`
2. **Exact Match**: `admin` matches only `admin`
3. **Substring Match**: `admin` also matches routes containing `admin` (backward compatibility)
4. **Regex Match** (if using `excludePatterns`): `admin/.*` matches `admin/anything`

This multi-tiered approach ensures backward compatibility while providing powerful glob pattern support.

## Project Structure

```
next-build-filter/                    # Main plugin package
├── lib/                              # Plugin source code
│   ├── with-page-filter.js          # Main plugin wrapper
│   ├── next-build-filter-plugin.js  # Webpack plugin
│   ├── advanced-next-build-filter-plugin.js # Advanced filtering
│   └── empty-module.js              # Replacement for filtered pages
├── demo/                            # Demo projects
│   ├── pages-router-demo/           # Pages Router demo
│   │   ├── pages/                   # Traditional Next.js pages
│   │   │   ├── index.js            # Home page
│   │   │   ├── about.js            # About page
│   │   │   ├── admin.js            # Admin page (filtered)
│   │   │   └── dev/debug.js        # Debug page (filtered)
│   │   ├── next.config.js          # Pages Router configuration
│   │   └── package.json            # Demo dependencies
│   └── app-router-demo/             # App Router demo (Next.js 13+)
│       ├── app/                     # App Router structure
│       │   ├── page.tsx            # Home route
│       │   ├── layout.tsx          # Root layout
│       │   ├── about/page.tsx      # About route
│       │   ├── admin/page.tsx      # Admin route (filtered)
│       │   └── dev/debug/page.tsx  # Debug route (filtered)
│       ├── next.config.js          # App Router configuration
│       └── package.json            # Demo dependencies
├── index.js                         # Main entry point
├── index.d.ts                       # TypeScript definitions
├── package.json                     # Plugin package configuration
└── README.md                        # This file
```

## Demo Projects

This package includes two complete demo projects to showcase the filtering capabilities:

### Pages Router Demo
```bash
cd demo/pages-router-demo
npm install
npm run build:filtered
```

### App Router Demo
```bash
cd demo/app-router-demo
npm install
npm run build:filtered
```

## Real-World Use Cases

### 1. Large E-commerce Sites
- Include only product pages during catalog development
- Exclude admin pages from customer-facing builds

### 2. Multi-tenant Applications
- Build tenant-specific versions with only relevant pages
- Exclude unused features per tenant

### 3. Development Teams
- Speed up local development by including only pages you're working on
- Create lightweight builds for testing specific features

### 4. Staging Environments
- Create builds with debug pages for staging
- Exclude debug pages from production

## Tips and Best Practices

1. **Start Small**: Begin by excluding just a few pages and gradually expand
2. **Use Verbose Mode**: Enable verbose logging during development to see what's being filtered
3. **Environment-Specific**: Use different configurations for different environments
4. **Test Thoroughly**: Always test your filtered builds to ensure functionality
5. **Document Configuration**: Keep your filtering logic well-documented for your team

## Migration Guide

### Migrating from Regex Patterns to Glob Patterns

If you're currently using `excludePatterns` with regex, consider migrating to glob patterns in `excludedPages` for better readability:

**Before (Regex):**
```javascript
const filterConfig = {
  excludePatterns: [
    'admin/.*',        // Regex
    'dev/.*',          // Regex
    '.*test.*',        // Regex
  ],
};
```

**After (Glob):**
```javascript
const filterConfig = {
  excludedPages: [
    'admin/**',        // Glob - clearer intent
    'dev/**',          // Glob - easier to read
    '**/test/**',      // Glob - more intuitive
  ],
};
```

**Note:** Both approaches work! Use glob patterns for simplicity and regex for complex patterns.

## Troubleshooting

### Pages Still Appearing in Build
- ✅ Check that `enabled: true` is set in your configuration
- ✅ Verify the page paths match (glob patterns are case-sensitive by default)
- ✅ Enable `verbose: true` to see what's being processed
- ✅ Test your glob pattern: `admin/**` matches all nested routes, while `admin/*` only matches direct children
- ✅ Ensure you're running the build with the correct environment variable: `FILTER_PAGES=true npm run build`

### Glob Pattern Not Matching

**Common Issues:**
1. **Wrong wildcard usage**
   - ❌ `admin/*` only matches direct children like `/admin/users`
   - ✅ `admin/**` matches all nested routes like `/admin/users/edit`

2. **Case sensitivity**
   - Route paths are normalized to lowercase before matching
   - Pattern: `Admin/**` will be normalized to `admin/**`

3. **Missing or extra slashes**
   - ✅ Correct: `admin/users/**`, `**/test`, `api/*`
   - ❌ Avoid: `/admin/users/**` (leading slash not needed)

4. **Not matching what you expect**
   - Enable `verbose: true` to see the actual route paths
   - Example verbose output: `📄 Filtering out: admin/users/edit`
   - Compare the logged path with your pattern

**Testing Your Patterns:**

Use `verbose: true` and check the console output during build:
```javascript
const filterConfig = {
  enabled: true,
  verbose: true,  // Shows which routes are being filtered
  excludedPages: ['admin/**'],
};
```

Console output will show:
```
📄 Filtering out: admin/dashboard
📄 Filtering out: admin/users/list
📄 Filtering out: admin/settings/profile
```

**Pattern Matching Examples:**

| Route Path | Pattern | Matches? | Why |
|------------|---------|----------|-----|
| `admin/users` | `admin/*` | ✅ Yes | Direct child |
| `admin/users/edit` | `admin/*` | ❌ No | Too deeply nested |
| `admin/users/edit` | `admin/**` | ✅ Yes | `**` matches any depth |
| `blog/post-123` | `blog/*-*` | ✅ Yes | `*` matches `post` and `123` |
| `api/v1/users` | `api/*/users` | ✅ Yes | `*` matches `v1` |
| `api/v1/internal/users` | `api/*/users` | ❌ No | Too many segments |
| `anything/internal/data` | `**/internal/**` | ✅ Yes | `**` matches any segments |

### Build Errors
- Ensure all required pages (like `_app.js`, `_document.js`, `_app.tsx`) are not being filtered
- Check that your regex patterns are valid if using `excludePatterns`
- Avoid overly broad patterns that might exclude critical Next.js files
- Test patterns incrementally: start with one pattern and add more once working

### Development vs Production Differences
- Set `enableInDev: true` if you want consistent behavior across environments
- Use environment variables to control filtering per environment
- Note: By default, filtering is disabled in development mode unless `enableInDev` is set
- Remember: `npm run dev` vs `npm run build` behave differently by default

### Advanced Debugging

If you're having trouble with patterns, try these steps:

1. **Start simple**: Test with an exact match first
```javascript
excludedPages: ['admin']  // Start with exact match
```

2. **Add verbosity**: See what's being matched
```javascript
verbose: true
```

3. **Test one pattern at a time**: Isolate the problematic pattern
```javascript
excludedPages: ['admin/**']  // Test one at a time
```

4. **Check the actual route paths**: Look at your project structure
```
pages/
  admin/
    users.js        → Route path: admin/users
    settings/
      profile.js    → Route path: admin/settings/profile
```

5. **Use the demos**: Test your patterns in the included demo projects
```bash
cd demo/pages-router-demo
FILTER_PAGES=true npm run build
```

## Technical Details

### Glob Pattern Matching Library

This plugin uses [minimatch](https://github.com/isaacs/minimatch) for glob pattern matching, the same library used by many popular tools like:
- npm
- webpack
- babel
- eslint

Minimatch provides powerful and reliable glob pattern matching with full support for:
- Brace expansion: `{a,b,c}`
- Extended glob patterns: `@(pattern|list)`
- Multiple wildcards: `**/**/`
- Character classes: `[abc]`, `[0-9]`

### Performance Considerations

- Glob pattern matching is performed during the webpack build phase
- Pattern matching is highly optimized by minimatch
- Routes are normalized once and cached for efficient matching
- Only page/route files are checked (not all webpack modules)

### Compatibility

- ✅ Next.js 12+ (Pages Router)
- ✅ Next.js 13+ (App Router)
- ✅ Node.js 16+
- ✅ Works with TypeScript
- ✅ Compatible with all Next.js deployment targets (standalone, static export, etc.)

## Testing

This project includes a comprehensive test suite with unit tests and end-to-end tests.

### Running Tests

```bash
# Run all unit tests
npm test

# Run unit tests in watch mode (for development)
npm run test:watch

# Run unit tests with coverage report
npm run test:coverage

# Run end-to-end tests (actual builds)
npm run test:e2e

# Run all tests (unit + e2e)
npm run test:all
```

### Test Structure

- **Unit Tests** (`tests/unit/`): Test core functionality using Vitest
  - `glob-patterns.test.js`: Tests for glob pattern matching
  - `plugin.test.js`: Tests for plugin core functionality
  - `with-page-filter.test.js`: Tests for configuration wrapper

- **E2E Tests** (`tests/e2e/`): Test actual Next.js builds
  - Verifies filtering works correctly in real builds
  - Tests both Pages Router and App Router demos

### Test Coverage

The test suite covers:
- ✅ Glob pattern matching with various patterns
- ✅ Path normalization and route extraction
- ✅ Page file identification (Pages Router & App Router)
- ✅ Filtering logic (includedPages, excludedPages, patterns)
- ✅ Configuration options and defaults
- ✅ Webpack integration
- ✅ Actual build output verification

See `tests/README.md` for detailed testing documentation.

## Contributing

Contributions are welcome! When contributing:

1. Write tests for new features
2. Ensure all tests pass: `npm run test:all`
3. Update documentation as needed
4. Submit a pull request

Feel free to submit issues, feature requests, or pull requests to improve this plugin.

## License

MIT