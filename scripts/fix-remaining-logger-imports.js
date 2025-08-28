#!/usr/bin/env node

/**
 * Fix remaining logger import issues
 */

const fs = require('fs');
const path = require('path');

const basePath = path.resolve(__dirname, '..');

// Fix favorites-service.ts which has the import on wrong line
const favoritesServicePath = path.join(basePath, 'apps/server/src/services/favorites-service.ts');
if (fs.existsSync(favoritesServicePath)) {
  let content = fs.readFileSync(favoritesServicePath, 'utf8');
  
  // Remove the misplaced import
  content = content.replace("import logger from '../lib/logger';", '');
  content = content.replace("import logger from './lib/logger';", '');
  
  // Find the correct position (after other imports) and add it
  const lines = content.split('\n');
  const importIndex = lines.findIndex(line => line.includes('import') && line.includes('from'));
  if (importIndex !== -1) {
    // Find the last import line
    let lastImportIndex = importIndex;
    for (let i = importIndex; i < lines.length; i++) {
      if (lines[i].includes('import') && lines[i].includes('from')) {
        lastImportIndex = i;
      } else if (lines[i].trim() && !lines[i].startsWith('//')) {
        break;
      }
    }
    lines.splice(lastImportIndex + 1, 0, 'import logger from "../lib/logger";');
  }
  
  fs.writeFileSync(favoritesServicePath, lines.join('\n'), 'utf8');
  console.log('✅ Fixed: favorites-service.ts');
}

// Now check and fix any remaining files with "./lib/logger"
const serverSrcPath = path.join(basePath, 'apps/server/src');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check what kind of file this is based on path
    const relativePath = path.relative(serverSrcPath, filePath);
    const depth = relativePath.split(path.sep).length - 1;
    
    // Determine correct import path based on file location
    let correctImport = '';
    if (filePath.includes('/lib/')) {
      correctImport = 'import logger from "./logger";';
    } else if (depth === 0) {
      correctImport = 'import logger from "./lib/logger";';
    } else if (depth === 1) {
      correctImport = 'import logger from "../lib/logger";';
    } else if (depth === 2) {
      correctImport = 'import logger from "../../lib/logger";';
    }
    
    // Replace any wrong imports
    const patterns = [
      /import logger from ["']\.\/lib\/logger["'];?/g,
      /import logger from ["']\.\.\/\.\.\/lib\/logger["'];?/g,
      /import logger from ["']\.\/\.\.\/lib\/logger["'];?/g,
    ];
    
    for (const pattern of patterns) {
      if (content.match(pattern)) {
        content = content.replace(pattern, correctImport);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${path.relative(basePath, filePath)}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Process all TypeScript files in server/src
function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules')) {
      processDirectory(fullPath);
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.js'))) {
      fixFile(fullPath);
    }
  }
}

console.log('Fixing remaining logger imports...');
processDirectory(serverSrcPath);

// Fix test files
const testPath = path.join(basePath, 'apps/server/test');
if (fs.existsSync(testPath)) {
  processDirectory(testPath);
}

// Fix root server files
const serverRootFiles = ['start-direct.ts', 'test-server.js'];
for (const file of serverRootFiles) {
  const filePath = path.join(basePath, 'apps/server', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/import logger from ["']\.\/lib\/logger["'];?/g, 'import logger from "./src/lib/logger";');
    content = content.replace(/const logger = require\(['"]\.\/lib\/logger['"]\)\.default;?/g, "const logger = require('./src/lib/logger').default;");
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);
  }
}

console.log('\n✅ Logger import fixes complete!');