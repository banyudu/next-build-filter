# Next.js Build Filter Plugin

A powerful Next.js plugin that allows you to exclude specific pages/routes from the build process without removing the files from your project. **Supports both Next.js Pages Router and App Router (Next.js 13+)**. This is perfect for speeding up development builds, creating different build configurations, or excluding admin/debug pages from production builds.

## Features

- 🚀 **Speed up builds** by excluding unnecessary pages/routes
- 📱 **App Router Support** - Full Next.js 13+ App Router compatibility
- 📄 **Pages Router Support** - Traditional Pages Router support
- 🎯 **Flexible filtering** with multiple configuration options
- 🔄 **Non-destructive** - files remain in your codebase
- 🌍 **Environment-aware** - different configurations for dev/prod
- 📝 **Verbose logging** to see what's being filtered
- 🎨 **Pattern matching** support with regex
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
    'admin',
    'dev/debug',
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
    'admin',        // Excludes app/admin/page.tsx
    'dev/debug',    // Excludes app/dev/debug/page.tsx
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
    'admin',        // Excludes both pages/admin.js and app/admin/page.tsx
    'dev/debug',    // Excludes both pages/dev/debug.js and app/dev/debug/page.tsx
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

#### 1. Include Only Specific Pages
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

#### 2. Exclude Specific Pages
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

#### 3. Pattern-Based Exclusion
```javascript
const filterConfig = {
  enabled: true,
  excludePatterns: [
    'dev/.*',          // All pages in /dev/ directory
    '.*admin.*',       // Any page with 'admin' in the path
    '.*test.*',        // Any page with 'test' in the path
  ],
};
```

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
Exclude admin and debug pages from production builds:

```javascript
const filterConfig = {
  enabled: process.env.NODE_ENV === 'production',
  excludedPages: [
    'admin',
    'debug',
    'dev/tools',
  ],
  excludePatterns: [
    'admin/.*',
    'dev/.*',
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
2. **Page Detection**: It identifies page files in the `/pages` directory
3. **Filtering Logic**: Based on your configuration, it determines which pages to exclude
4. **Module Resolution**: Excluded pages are replaced with empty modules during the build process
5. **Build Optimization**: The final bundle only includes the pages you want

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

## Troubleshooting

### Pages Still Appearing in Build
- Check that `enabled: true` is set in your configuration
- Verify the page paths match exactly (case-sensitive)
- Enable verbose logging to see what's being processed

### Build Errors
- Ensure all required pages (like `_app.js`, `_document.js`) are not being filtered
- Check that your regex patterns are valid if using `excludePatterns`

### Development vs Production Differences
- Set `enableInDev: true` if you want consistent behavior across environments
- Use environment variables to control filtering per environment

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this plugin.

## License

MIT