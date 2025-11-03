#!/usr/bin/env node

/**
 * Interactive Glob Pattern Tester
 * 
 * This script helps test glob patterns against route paths
 * to verify filtering behavior before using in production.
 * 
 * Usage:
 *   node tests/test-glob-pattern.js "admin/**" "admin/users"
 *   node tests/test-glob-pattern.js "blog/*" "blog/post1"
 */

const { minimatch } = require('minimatch');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node tests/test-glob-pattern.js <pattern> <route-path> [<route-path2> ...]');
  console.log('');
  console.log('Examples:');
  console.log('  node tests/test-glob-pattern.js "admin/**" "admin/users" "admin/users/edit"');
  console.log('  node tests/test-glob-pattern.js "blog/*" "blog/post1" "blog/category/tech"');
  console.log('  node tests/test-glob-pattern.js "**/test" "api/test" "components/button"');
  console.log('');
  console.log('Common patterns:');
  console.log('  admin/**        - Matches all routes under admin/ (any depth)');
  console.log('  admin/*         - Matches direct children of admin/ only');
  console.log('  **/test         - Matches any route ending with /test');
  console.log('  **/internal/**  - Matches any route containing /internal/');
  console.log('  api/*/users     - Matches api/<anything>/users');
  console.log('  {admin,dev}/**  - Matches all routes under admin/ or dev/');
  process.exit(1);
}

const pattern = args[0];
const routePaths = args.slice(1);

console.log('\n🔍 Testing Glob Pattern Matching\n');
console.log(`Pattern: "${pattern}"\n`);
console.log('Results:');
console.log('--------');

let matchCount = 0;
let noMatchCount = 0;

routePaths.forEach(routePath => {
  const matches = minimatch(routePath, pattern);
  const symbol = matches ? '✅' : '❌';
  const status = matches ? 'MATCH' : 'NO MATCH';
  
  console.log(`${symbol} ${status}: "${routePath}"`);
  
  if (matches) {
    matchCount++;
  } else {
    noMatchCount++;
  }
});

console.log('\n--------');
console.log(`Total: ${routePaths.length} paths tested`);
console.log(`Matches: ${matchCount}`);
console.log(`No matches: ${noMatchCount}`);
console.log('');

// Exit with code 0 if any matches found, 1 if no matches
process.exit(matchCount > 0 ? 0 : 1);

