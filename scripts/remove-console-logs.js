#!/usr/bin/env node

/**
 * Automated script to replace console.* statements with logger
 * Usage: node scripts/remove-console-logs.js [--dry-run] [--path <path>]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  dryRun: process.argv.includes('--dry-run'),
  targetPath: process.argv.includes('--path') 
    ? process.argv[process.argv.indexOf('--path') + 1]
    : './apps',
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  excludeDirs: ['node_modules', 'dist', 'build', '.next', 'coverage'],
  excludeFiles: ['logger.ts', 'logger.js'],
  stats: {
    filesProcessed: 0,
    filesModified: 0,
    consoleLogsReplaced: 0,
    sensitiveDataFound: []
  }
};

// Patterns to detect and replace
const patterns = [
  // Simple console methods
  { regex: /console\.log\(/g, replacement: 'logger.log(' },
  { regex: /console\.info\(/g, replacement: 'logger.info(' },
  { regex: /console\.warn\(/g, replacement: 'logger.warn(' },
  { regex: /console\.error\(/g, replacement: 'logger.error(' },
  { regex: /console\.debug\(/g, replacement: 'logger.debug(' },
  
  // Console with property access (e.g., console["log"])
  { regex: /console\["log"\]/g, replacement: 'logger.log' },
  { regex: /console\["info"\]/g, replacement: 'logger.info' },
  { regex: /console\["warn"\]/g, replacement: 'logger.warn' },
  { regex: /console\["error"\]/g, replacement: 'logger.error' },
  { regex: /console\["debug"\]/g, replacement: 'logger.debug' },
];

// Sensitive data patterns to check
const sensitivePatterns = [
  /password[\s]*[:=]/gi,
  /api[_-]?key[\s]*[:=]/gi,
  /secret[\s]*[:=]/gi,
  /token[\s]*[:=]/gi,
  /auth[\s]*[:=]/gi,
  /credential[\s]*[:=]/gi,
];

// Import statement templates
const importStatements = {
  ts: "import logger from '@/lib/logger';",
  tsx: "import logger from '@/utils/logger';",
  js: "const logger = require('../lib/logger').default;",
  jsx: "import logger from '@/utils/logger';"
};

function shouldProcessFile(filePath) {
  const fileName = path.basename(filePath);
  const dirName = path.dirname(filePath);
  
  // Skip excluded files
  if (config.excludeFiles.includes(fileName)) {
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

function getImportStatement(filePath) {
  const ext = path.extname(filePath).slice(1);
  const isServer = filePath.includes('/server/');
  
  if (isServer) {
    return ext.includes('ts') 
      ? "import logger from './lib/logger';"
      : "const logger = require('./lib/logger').default;";
  } else {
    return importStatements[ext] || importStatements.ts;
  }
}

function checkSensitiveData(content, filePath) {
  const lines = content.split('\n');
  const issues = [];
  
  lines.forEach((line, index) => {
    if (line.includes('console.')) {
      sensitivePatterns.forEach(pattern => {
        if (pattern.test(line)) {
          issues.push({
            file: filePath,
            line: index + 1,
            content: line.trim()
          });
        }
      });
    }
  });
  
  return issues;
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Check for sensitive data before processing
    const sensitiveIssues = checkSensitiveData(content, filePath);
    if (sensitiveIssues.length > 0) {
      config.stats.sensitiveDataFound.push(...sensitiveIssues);
    }
    
    // Check if file has console statements
    const hasConsole = /console\.(log|info|warn|error|debug)/.test(content);
    if (!hasConsole) {
      return;
    }
    
    config.stats.filesProcessed++;
    
    // Check if logger is already imported
    const hasLoggerImport = /import.*logger|require.*logger/.test(content);
    
    // Apply replacements
    let replacementCount = 0;
    patterns.forEach(pattern => {
      const matches = content.match(pattern.regex);
      if (matches) {
        replacementCount += matches.length;
        content = content.replace(pattern.regex, pattern.replacement);
      }
    });
    
    // Add import if needed and replacements were made
    if (replacementCount > 0 && !hasLoggerImport) {
      const importStatement = getImportStatement(filePath);
      
      // Find the right place to add import
      if (content.includes('import ')) {
        // Add after last import
        const lastImportIndex = content.lastIndexOf('import ');
        const lineEnd = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, lineEnd + 1) + importStatement + '\n' + content.slice(lineEnd + 1);
      } else if (content.includes('require(')) {
        // Add after last require
        const lastRequireIndex = content.lastIndexOf('require(');
        const lineEnd = content.indexOf('\n', lastRequireIndex);
        content = content.slice(0, lineEnd + 1) + importStatement + '\n' + content.slice(lineEnd + 1);
      } else {
        // Add at the beginning
        content = importStatement + '\n\n' + content;
      }
    }
    
    // Write changes if not dry run and content changed
    if (content !== originalContent) {
      if (config.dryRun) {
        console.log(`Would modify: ${filePath} (${replacementCount} replacements)`);
      } else {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Modified: ${filePath} (${replacementCount} replacements)`);
      }
      config.stats.filesModified++;
      config.stats.consoleLogsReplaced += replacementCount;
    }
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !config.excludeDirs.includes(item)) {
        processDirectory(fullPath);
      } else if (stat.isFile() && shouldProcessFile(fullPath)) {
        processFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }
}

// Main execution
console.log('=================================');
console.log('Console Log Removal Tool');
console.log('=================================');
console.log(`Mode: ${config.dryRun ? 'DRY RUN' : 'LIVE'}`);
console.log(`Target: ${config.targetPath}`);
console.log('');

// Process the target directory
const targetPath = path.resolve(config.targetPath);
if (fs.existsSync(targetPath)) {
  processDirectory(targetPath);
} else {
  console.error(`Target path does not exist: ${targetPath}`);
  process.exit(1);
}

// Print results
console.log('');
console.log('=================================');
console.log('Results:');
console.log('=================================');
console.log(`Files processed: ${config.stats.filesProcessed}`);
console.log(`Files modified: ${config.stats.filesModified}`);
console.log(`Console statements replaced: ${config.stats.consoleLogsReplaced}`);

if (config.stats.sensitiveDataFound.length > 0) {
  console.log('');
  console.log('⚠️  WARNING: Potential sensitive data in console logs:');
  config.stats.sensitiveDataFound.forEach(issue => {
    console.log(`  ${issue.file}:${issue.line}`);
    console.log(`    ${issue.content}`);
  });
}

if (config.dryRun) {
  console.log('');
  console.log('This was a DRY RUN. No files were actually modified.');
  console.log('Run without --dry-run flag to apply changes.');
}

process.exit(0);