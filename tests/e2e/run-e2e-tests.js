#!/usr/bin/env node

/**
 * E2E Test Runner for next-build-filter
 * 
 * This script runs actual Next.js builds with different configurations
 * and verifies that the filtering works correctly.
 * 
 * IMPORTANT: The plugin replaces filtered pages with custom 404 pages that contain
 * a detectable marker (NEXT_BUILD_FILTER_EXCLUDED_PAGE). The tests verify filtering
 * by checking for this marker in the generated HTML/JS files.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Marker to identify filtered pages
const FILTER_MARKER = 'NEXT_BUILD_FILTER_EXCLUDED_PAGE';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error, output: error.stdout || error.stderr };
  }
}

function containsFilterMarker(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes(FILTER_MARKER);
  } catch (e) {
    return false;
  }
}

function checkBuildOutput(buildDir, expectedPages, excludedPages) {
  const results = {
    passed: true,
    messages: [],
  };

  // Check .next directory exists
  if (!fs.existsSync(buildDir)) {
    results.passed = false;
    results.messages.push(`Build directory not found: ${buildDir}`);
    return results;
  }

  // For pages router, check the pages manifest
  const pagesManifest = path.join(buildDir, 'server', 'pages-manifest.json');
  if (fs.existsSync(pagesManifest)) {
    const manifest = JSON.parse(fs.readFileSync(pagesManifest, 'utf8'));
    const routes = Object.keys(manifest);

    // Check expected pages do NOT contain the filter marker
    for (const expectedPage of expectedPages) {
      // Handle index page specially - it's stored as "/" in the manifest
      const searchPatterns = expectedPage === 'index' || expectedPage === '' 
        ? ['/', '/index', '/index.html']
        : [expectedPage, `/${expectedPage}`, `/${expectedPage}.html`];
      
      const route = routes.find(r => 
        searchPatterns.some(pattern => r === pattern || r.includes(expectedPage))
      );
      
      if (!route) {
        results.passed = false;
        results.messages.push(`Expected page not found: ${expectedPage} (searched: ${searchPatterns.join(', ')})`);
      } else {
        const filePath = path.join(buildDir, 'server', manifest[route]);
        if (fs.existsSync(filePath)) {
          const hasMarker = containsFilterMarker(filePath);
          if (!hasMarker) {
            results.messages.push(`✓ Expected page has normal content: ${expectedPage}`);
          } else {
            results.passed = false;
            results.messages.push(`✗ Expected page was incorrectly filtered: ${expectedPage}`);
          }
        } else {
          results.messages.push(`✓ Expected page found: ${expectedPage}`);
        }
      }
    }

    // Check excluded pages DO contain the filter marker
    for (const excludedPage of excludedPages) {
      const route = routes.find(r => 
        r.includes(excludedPage) || 
        r === `/${excludedPage}` ||
        r.startsWith(`/${excludedPage}/`)
      );
      
      if (route) {
        const filePath = path.join(buildDir, 'server', manifest[route]);
        if (fs.existsSync(filePath)) {
          const hasMarker = containsFilterMarker(filePath);
          if (hasMarker) {
            results.messages.push(`✓ Excluded page replaced with custom 404: ${excludedPage}`);
          } else {
            results.passed = false;
            results.messages.push(`✗ Excluded page was NOT filtered: ${excludedPage}`);
          }
        } else {
          // File doesn't exist - might be filtered at different level
          results.messages.push(`⚠ Excluded page file not found: ${excludedPage}`);
        }
      } else {
        // Route not in manifest - acceptable
        results.messages.push(`✓ Excluded page not in manifest: ${excludedPage}`);
      }
    }
  }

  return results;
}

function checkAppRouterBuildOutput(buildDir, expectedRoutes, excludedRoutes) {
  const results = {
    passed: true,
    messages: [],
  };

  // Check .next directory exists
  if (!fs.existsSync(buildDir)) {
    results.passed = false;
    results.messages.push(`Build directory not found: ${buildDir}`);
    return results;
  }

  // For app router, check the app-paths-manifest.json
  const appPathsManifest = path.join(buildDir, 'server', 'app-paths-manifest.json');
  if (fs.existsSync(appPathsManifest)) {
    const manifest = JSON.parse(fs.readFileSync(appPathsManifest, 'utf8'));
    const routes = Object.keys(manifest);

    // Check expected routes do NOT contain the filter marker
    for (const expectedRoute of expectedRoutes) {
      const route = routes.find(r => 
        r === `/${expectedRoute}` || 
        r === `/${expectedRoute}/page` ||
        r.includes(expectedRoute)
      );
      
      if (!route) {
        results.passed = false;
        results.messages.push(`Expected route not found: ${expectedRoute}`);
      } else {
        // Check the actual page file in app directory
        const serverDir = path.join(buildDir, 'server', 'app');
        const possiblePaths = [
          path.join(serverDir, expectedRoute, 'page.js'),
          path.join(serverDir, expectedRoute + '.js'),
          path.join(serverDir, 'page.js'), // root page
        ];
        
        let foundFile = null;
        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            foundFile = p;
            break;
          }
        }
        
        if (foundFile) {
          const hasMarker = containsFilterMarker(foundFile);
          if (!hasMarker) {
            results.messages.push(`✓ Expected route has normal content: ${expectedRoute}`);
          } else {
            results.passed = false;
            results.messages.push(`✗ Expected route was incorrectly filtered: ${expectedRoute}`);
          }
        } else {
          results.messages.push(`✓ Expected route found: ${expectedRoute}`);
        }
      }
    }

    // Check excluded routes DO contain the filter marker
    for (const excludedRoute of excludedRoutes) {
      const route = routes.find(r => 
        r === `/${excludedRoute}` || 
        r === `/${excludedRoute}/page` ||
        r.includes(excludedRoute)
      );
      
      if (route) {
        // Route exists - check if it contains the filter marker
        const serverDir = path.join(buildDir, 'server', 'app');
        const possiblePaths = [
          path.join(serverDir, excludedRoute, 'page.js'),
          path.join(serverDir, excludedRoute + '.js'),
        ];
        
        let foundFile = null;
        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            foundFile = p;
            break;
          }
        }
        
        if (foundFile) {
          const hasMarker = containsFilterMarker(foundFile);
          if (hasMarker) {
            results.messages.push(`✓ Excluded route replaced with custom 404: ${excludedRoute}`);
          } else {
            results.passed = false;
            results.messages.push(`✗ Excluded route was NOT filtered: ${excludedRoute}`);
          }
        } else {
          // File doesn't exist - might be filtered at different level
          results.messages.push(`⚠ Excluded route file not found: ${excludedRoute}`);
        }
      } else {
        // Route not in manifest - acceptable
        results.messages.push(`✓ Excluded route not in manifest: ${excludedRoute}`);
      }
    }
  } else {
    results.messages.push('⚠ App paths manifest not found - skipping detailed checks');
  }

  return results;
}

async function runPagesRouterTests() {
  log('\n📄 Running Pages Router E2E Tests...', 'cyan');
  log('='.repeat(50), 'cyan');

  const demoDir = path.join(__dirname, '../../demo/pages-router-demo');
  const buildDir = path.join(demoDir, '.next');

  // Clean previous build
  log('\n🧹 Cleaning previous build...', 'blue');
  runCommand(`rm -rf ${buildDir}`, { cwd: demoDir });

  // Test 1: Build with filtering enabled
  log('\n📦 Test 1: Build with filtering (admin/** and dev/** excluded)...', 'yellow');
  const result1 = runCommand('FILTER_PAGES=true npm run build', {
    cwd: demoDir,
    silent: false,
  });

  if (!result1.success) {
    log('❌ Build failed', 'red');
    return false;
  }

  log('\n✓ Build completed, checking output...', 'green');
  const check1 = checkBuildOutput(
    buildDir,
    ['index', 'about', 'blog', 'contact'], // Expected pages
    ['admin', 'dev/debug'] // Excluded pages
  );

  check1.messages.forEach(msg => log(msg, check1.passed ? 'green' : 'red'));

  if (!check1.passed) {
    log('\n❌ Test 1 failed', 'red');
    return false;
  }

  log('\n✅ Test 1 passed', 'green');

  // Clean for next test
  runCommand(`rm -rf ${buildDir}`, { cwd: demoDir });

  // Test 2: Build without filtering
  log('\n📦 Test 2: Build without filtering (all pages included)...', 'yellow');
  const result2 = runCommand('npm run build', {
    cwd: demoDir,
    silent: false,
  });

  if (!result2.success) {
    log('❌ Build failed', 'red');
    return false;
  }

  log('\n✓ Build completed, checking output...', 'green');
  const check2 = checkBuildOutput(
    buildDir,
    ['index', 'about', 'blog', 'contact', 'admin'], // All pages expected
    [] // Nothing excluded
  );

  check2.messages.forEach(msg => log(msg, 'green'));

  if (!check2.passed) {
    log('\n❌ Test 2 failed', 'red');
    return false;
  }

  log('\n✅ Test 2 passed', 'green');

  return true;
}

async function runAppRouterTests() {
  log('\n📱 Running App Router E2E Tests...', 'cyan');
  log('='.repeat(50), 'cyan');

  const demoDir = path.join(__dirname, '../../demo/app-router-demo');
  const buildDir = path.join(demoDir, '.next');

  // Clean previous build
  log('\n🧹 Cleaning previous build...', 'blue');
  runCommand(`rm -rf ${buildDir}`, { cwd: demoDir });

  // Test 1: Build with filtering enabled
  log('\n📦 Test 1: Build with filtering (admin/** and dev/** excluded)...', 'yellow');
  const result1 = runCommand('FILTER_PAGES=true npm run build', {
    cwd: demoDir,
    silent: false,
  });

  if (!result1.success) {
    log('❌ Build failed', 'red');
    return false;
  }

  log('\n✓ Build completed, checking output...', 'green');
  const check1 = checkAppRouterBuildOutput(
    buildDir,
    ['', 'about'], // Expected routes ('' is root page)
    ['admin', 'dev/debug'] // Excluded routes
  );

  check1.messages.forEach(msg => log(msg, check1.passed ? 'green' : 'red'));

  if (!check1.passed) {
    log('\n❌ Test 1 failed', 'red');
    return false;
  }

  log('\n✅ Test 1 passed', 'green');

  // Clean for next test
  runCommand(`rm -rf ${buildDir}`, { cwd: demoDir });

  // Test 2: Build without filtering
  log('\n📦 Test 2: Build without filtering (all routes included)...', 'yellow');
  const result2 = runCommand('npm run build', {
    cwd: demoDir,
    silent: false,
  });

  if (!result2.success) {
    log('❌ Build failed', 'red');
    return false;
  }

  log('\n✓ Build completed, checking output...', 'green');
  const check2 = checkAppRouterBuildOutput(
    buildDir,
    ['', 'about', 'admin'], // All routes expected (including admin)
    [] // Nothing excluded
  );

  check2.messages.forEach(msg => log(msg, 'green'));

  if (!check2.passed) {
    log('\n❌ Test 2 failed', 'red');
    return false;
  }

  log('\n✅ Test 2 passed', 'green');

  return true;
}

async function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('  🧪 Next.js Build Filter - E2E Test Suite', 'cyan');
  log('='.repeat(60), 'cyan');

  let allPassed = true;

  try {
    // Run Pages Router tests
    const pagesRouterPassed = await runPagesRouterTests();
    allPassed = allPassed && pagesRouterPassed;

    // Run App Router tests
    const appRouterPassed = await runAppRouterTests();
    allPassed = allPassed && appRouterPassed;

    // Summary
    log('\n' + '='.repeat(60), 'cyan');
    log('  📊 Test Summary', 'cyan');
    log('='.repeat(60), 'cyan');

    if (allPassed) {
      log('\n✅ All E2E tests passed!', 'green');
      process.exit(0);
    } else {
      log('\n❌ Some E2E tests failed', 'red');
      process.exit(1);
    }
  } catch (error) {
    log('\n❌ Error running E2E tests:', 'red');
    console.error(error);
    process.exit(1);
  }
}

main();

