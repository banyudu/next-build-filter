#!/usr/bin/env node

/**
 * Demo script to test the Next.js Build Filter Plugin
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Next.js Build Filter Plugin Demo\n');

// Function to run commands and capture output
function runCommand(command, description) {
  console.log(`📋 ${description}`);
  console.log(`💻 Running: ${command}\n`);
  
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    console.log('✅ Command completed successfully\n');
    return true;
  } catch (error) {
    console.log(`❌ Command failed: ${error.message}\n`);
    return false;
  }
}

// Function to check if pages exist in build output
function checkBuildOutput() {
  const buildDir = path.join(__dirname, '.next');
  
  if (!fs.existsSync(buildDir)) {
    console.log('❌ No build directory found\n');
    return;
  }

  console.log('📁 Checking build output...\n');
  
  // Check for page files in the build directory
  const pagesDir = path.join(buildDir, 'static', 'chunks', 'pages');
  
  if (fs.existsSync(pagesDir)) {
    const pageFiles = fs.readdirSync(pagesDir);
    console.log('📄 Built pages:');
    pageFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
  } else {
    console.log('📄 No pages directory found in build output');
  }
  
  console.log('');
}

// Demo scenarios
async function runDemo() {
  console.log('='.repeat(60));
  console.log('SCENARIO 1: Normal build (all pages included)');
  console.log('='.repeat(60));
  
  const normalBuild = runCommand('npm run build', 'Building with all pages');
  
  if (normalBuild) {
    checkBuildOutput();
  }
  
  console.log('='.repeat(60));
  console.log('SCENARIO 2: Filtered build (some pages excluded)');
  console.log('='.repeat(60));
  
  const filteredBuild = runCommand('FILTER_PAGES=true npm run build', 'Building with page filtering enabled');
  
  if (filteredBuild) {
    checkBuildOutput();
  }
  
  console.log('='.repeat(60));
  console.log('SCENARIO 3: Custom filtered build');
  console.log('='.repeat(60));
  
  const customBuild = runCommand(
    'FILTER_PAGES=true EXCLUDED_PAGES=admin,blog npm run build', 
    'Building with custom exclusions (admin, blog)'
  );
  
  if (customBuild) {
    checkBuildOutput();
  }
  
  console.log('🎉 Demo completed! Check the build outputs above to see the filtering in action.');
  console.log('\n💡 Tips:');
  console.log('   - Enable verbose mode in next.config.js to see detailed filtering logs');
  console.log('   - Compare the build outputs between normal and filtered builds');
  console.log('   - Check the bundle sizes to see the difference in build optimization');
}

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.log('❌ Please run this script from the project root directory');
  process.exit(1);
}

// Check if dependencies are installed
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing dependencies first...');
  runCommand('npm install', 'Installing dependencies');
}

// Run the demo
runDemo().catch(error => {
  console.error('❌ Demo failed:', error);
  process.exit(1);
});