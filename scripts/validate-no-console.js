#!/usr/bin/env node

/**
 * Validation script to ensure no console statements in production code
 * Run this as part of CI/CD pipeline
 */

const fs = require('fs');
const path = require('path');

const config = {
  targetPaths: [
    './apps/server/src',
    './apps/native/app',
    './apps/native/components',
    './apps/native/hooks',
    './apps/native/utils',
  ],
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  excludeDirs: ['node_modules', 'dist', 'build', '.next', 'coverage'],
  excludeFiles: ['logger.ts', 'logger.js'],
  allowedInFiles: [
    '*.test.ts', '*.test.tsx', '*.test.js', '*.test.jsx',
    '*.spec.ts', '*.spec.tsx', '*.spec.js', '*.spec.jsx',
    'scripts/**/*'
  ]
};

let violations = [];

function shouldCheckFile(filePath) {
  const fileName = path.basename(filePath);
  const dirName = path.dirname(filePath);
  
  // Skip excluded files
  if (config.excludeFiles.includes(fileName)) {
    return false;
  }
  
  // Skip test files
  if (config.allowedInFiles.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(fileName) || regex.test(filePath);
    }
    return fileName === pattern;
  })) {
    return false;
  }
  
  // Skip excluded directories
  for (const excludeDir of config.excludeDirs) {
    if (dirName.includes(excludeDir)) {
      return false;
    }
  }
  
  // Check extension
  const ext = path.extname(filePath);
  return config.extensions.includes(ext);
}

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check for console statements (not in comments)
      const trimmedLine = line.trim();
      
      // Skip comment lines
      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*')) {
        return;
      }
      
      // Look for console usage
      if (/console\.(log|info|warn|error|debug|trace|table|group|time)/.test(line)) {
        violations.push({
          file: filePath,
          line: index + 1,
          content: line.trim()
        });
      }
    });
  } catch (error) {
    console.error(`Error checking file ${filePath}:`, error.message);
  }
}

function checkDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !config.excludeDirs.includes(item)) {
        checkDirectory(fullPath);
      } else if (stat.isFile() && shouldCheckFile(fullPath)) {
        checkFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error checking directory ${dirPath}:`, error.message);
  }
}

// Main execution
console.log('====================================');
console.log('Console Statement Validation');
console.log('====================================\n');

// Check all target paths
config.targetPaths.forEach(targetPath => {
  const fullPath = path.resolve(targetPath);
  if (fs.existsSync(fullPath)) {
    console.log(`Checking: ${targetPath}`);
    checkDirectory(fullPath);
  }
});

// Report results
console.log('\n====================================');
console.log('Validation Results:');
console.log('====================================');

if (violations.length === 0) {
  console.log('✅ SUCCESS: No console statements found in production code');
  process.exit(0);
} else {
  console.log(`❌ FAILED: Found ${violations.length} console statement(s):\n`);
  
  violations.forEach(violation => {
    console.log(`  ${violation.file}:${violation.line}`);
    console.log(`    ${violation.content}\n`);
  });
  
  console.log('Please remove these console statements or replace with logger utility.');
  process.exit(1);
}