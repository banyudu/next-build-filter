# Test Suite for next-build-filter

This directory contains comprehensive unit tests and end-to-end (e2e) tests for the next-build-filter plugin.

## Test Structure

```
tests/
├── unit/                          # Unit tests (Vitest)
│   ├── glob-patterns.test.js     # Tests for glob pattern matching
│   ├── plugin.test.js            # Tests for plugin core functionality
│   └── with-page-filter.test.js  # Tests for configuration wrapper
├── e2e/                           # End-to-end tests
│   └── run-e2e-tests.js          # E2E test runner
├── test-glob-pattern.js           # Interactive glob pattern tester
└── README.md                      # This file
```

## Running Tests

### Unit Tests

Unit tests are run using Vitest and test the core functionality of the plugin without building actual Next.js applications.

```bash
# Run all unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with coverage
npm run test:coverage
```

### E2E Tests

E2E tests run actual Next.js builds with the plugin and verify the output.

```bash
# Run e2e tests
npm run test:e2e

# Run all tests (unit + e2e)
npm run test:all
```

### Interactive Glob Pattern Testing

Test glob patterns interactively to verify they match your expected routes:

```bash
# Test a pattern against route paths
node tests/test-glob-pattern.js "admin/**" "admin/users" "admin/users/edit" "blog/post"

# Output:
# 🔍 Testing Glob Pattern Matching
# Pattern: "admin/**"
# 
# Results:
# --------
# ✅ MATCH: "admin/users"
# ✅ MATCH: "admin/users/edit"
# ❌ NO MATCH: "blog/post"
# --------
# Total: 3 paths tested
# Matches: 2
# No matches: 1
```

This is useful for:
- Testing patterns before using them in production
- Understanding how different patterns work
- Debugging why a route is or isn't being filtered

## Unit Tests

### glob-patterns.test.js

Tests the glob pattern matching functionality using the `minimatch` library. Covers:

- **Basic glob patterns**: `*`, `**`, `?`, `[abc]`, `{a,b}`
- **Advanced patterns**: Character ranges, brace expansions, nested wildcards
- **Real-world use cases**: Admin routes, test pages, API routes, multi-language sites
- **Edge cases**: Empty strings, root index, case sensitivity

**Example tests:**
```javascript
// Single-level wildcard
expect(minimatch('blog/post1', 'blog/*')).toBe(true);
expect(minimatch('blog/category/post1', 'blog/*')).toBe(false);

// Multi-level wildcard
expect(minimatch('admin/users/edit', 'admin/**')).toBe(true);

// Pattern with wildcard in middle
expect(minimatch('api/users/internal', 'api/*/internal')).toBe(true);
```

### plugin.test.js

Tests the core `NextBuildFilterPlugin` class functionality. Covers:

- **Path normalization**: Converting backslashes, lowercase conversion
- **Route extraction**: Pages Router and App Router path extraction
- **Page file identification**: Detecting page files vs other files
- **Filtering logic**: Glob patterns, regex patterns, include/exclude logic
- **Configuration**: Default options, custom options, backward compatibility

**Example tests:**
```javascript
// Path normalization
expect(plugin.normalizePath('Pages\\Admin\\Users.js')).toBe('pages/admin/users.js');

// Route extraction
expect(plugin.extractRoutePath('project/pages/admin/users.js')).toBe('admin/users');
expect(plugin.extractRoutePath('project/app/about/page.tsx')).toBe('about');

// Filtering with glob patterns
expect(plugin.shouldExcludePage('project/pages/admin/users.js')).toBe(true);
```

### with-page-filter.test.js

Tests the `withPageFilter` wrapper function. Covers:

- **Configuration wrapper**: Function return, config modification
- **Webpack integration**: Preserving existing webpack config
- **Filter options**: includedPages, excludedPages, excludePatterns
- **Router support**: App Router, Pages Router, custom directories
- **Development mode**: Behavior in dev vs production
- **Experimental settings**: Preservation of Next.js experimental flags

**Example tests:**
```javascript
// Configuration wrapper
const wrapper = withPageFilter({ enabled: true, excludedPages: ['admin/**'] });
const result = wrapper({ reactStrictMode: true });
expect(result).toHaveProperty('webpack');
expect(result.reactStrictMode).toBe(true);

// Development mode
const webpackOptions = { dev: true };
// Should not filter in dev mode by default
```

## E2E Tests

### run-e2e-tests.js

Runs actual Next.js builds with the plugin and verifies the output. Tests:

1. **Pages Router Demo**:
   - Build with filtering enabled (excludes admin/**, dev/**)
   - Build without filtering (includes all pages)
   - Verifies pages manifest and file sizes

2. **App Router Demo**:
   - Build with filtering enabled (excludes admin/**, dev/**)
   - Build without filtering (includes all routes)
   - Verifies app paths manifest and file sizes

**How it works:**
1. Cleans previous builds
2. Runs `npm run build` with different configurations
3. Checks the `.next` directory and manifest files
4. **Verifies custom 404 marker** to confirm filtering:
   - Expected pages should NOT contain `NEXT_BUILD_FILTER_EXCLUDED_PAGE` marker
   - Filtered pages SHOULD contain the marker (custom 404 page)
   
**Important**: The plugin replaces filtered pages with custom 404 pages that contain a unique marker string (`NEXT_BUILD_FILTER_EXCLUDED_PAGE`). The e2e tests verify filtering by checking for this marker in the generated build files. For App Router, the plugin uses Next.js's `notFound()` function when available.

**Output format:**
```
📄 Running Pages Router E2E Tests...
==================================================

🧹 Cleaning previous build...

📦 Test 1: Build with filtering (admin and dev/** excluded)...
✓ Build completed, checking output...
✓ Expected page has normal content: index
✓ Expected page has normal content: about
✓ Excluded page replaced with custom 404: admin
✓ Excluded page replaced with custom 404: dev/debug

✅ Test 1 passed
```

## Test Coverage

The test suite aims for high coverage of:

- ✅ Glob pattern matching logic
- ✅ Path normalization and route extraction
- ✅ Page file identification (Pages Router and App Router)
- ✅ Filtering logic (includedPages, excludedPages, excludePatterns)
- ✅ Configuration options and defaults
- ✅ Webpack integration
- ✅ Actual build output verification

## Adding New Tests

### Adding Unit Tests

1. Create a new test file in `tests/unit/`
2. Import necessary dependencies:
   ```javascript
   import { describe, it, expect, beforeEach } from 'vitest';
   ```
3. Write descriptive test cases
4. Run tests to verify

### Adding E2E Tests

1. Edit `tests/e2e/run-e2e-tests.js`
2. Add new test functions following the existing pattern
3. Use `runCommand` helper to execute builds
4. Use `checkBuildOutput` helper to verify results

## CI/CD Integration

The test suite is designed to be easily integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: |
    npm install
    npm run test        # Unit tests
    npm run test:e2e    # E2E tests
```

## Troubleshooting

### Unit Tests Failing

- Ensure `minimatch` is installed: `npm install`
- Check Node.js version (>=16.0.0)
- Run with verbose output: `npm run test:watch`

### E2E Tests Failing

- Ensure demo dependencies are installed:
  ```bash
  cd demo/pages-router-demo && npm install
  cd ../app-router-demo && npm install
  ```
- Clean all build artifacts:
  ```bash
  rm -rf demo/*/node_modules demo/*/.next
  ```
- Run demos manually to debug:
  ```bash
  cd demo/pages-router-demo
  FILTER_PAGES=true npm run build
  ```

### Coverage Reports

Coverage reports are generated in the `coverage/` directory when running:
```bash
npm run test:coverage
```

Open `coverage/index.html` in a browser to view detailed coverage information.

## Contributing

When adding new features to the plugin:

1. Write unit tests for the new functionality
2. Add e2e tests if the feature affects build output
3. Ensure all tests pass before submitting a PR
4. Update this README if adding new test files or patterns

## Performance

- **Unit tests**: ~100-500ms (fast, run frequently during development)
- **E2E tests**: ~2-5 minutes (slower, run before commits)

Use `npm run test:watch` during development for instant feedback on unit tests.

