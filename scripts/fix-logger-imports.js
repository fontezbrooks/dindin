#!/usr/bin/env node

/**
 * Script to fix all logger import paths in the codebase
 */

const fs = require('fs');
const path = require('path');

// Files to fix and their correct import paths
const fixes = {
  // Server files - should use relative imports
  '/apps/server/src/services/notification.service.ts': {
    old: 'import logger from "./../lib/logger";',
    new: 'import logger from "../lib/logger";'
  },
  '/apps/server/src/services/match-service.ts': {
    old: 'import logger from "./../lib/logger";',
    new: 'import logger from "../lib/logger";'
  },
  '/apps/server/src/services/favorites-service.ts': {
    old: "import logger from './lib/logger';",
    new: 'import logger from "../lib/logger";'
  },
  '/apps/server/src/services/nutrition-calculation.service.ts': {
    old: 'import logger from "./../lib/logger";',
    new: 'import logger from "../lib/logger";'
  },
  '/apps/server/src/services/daily-nutrition.service.ts': {
    old: 'import logger from "./../lib/logger";',
    new: 'import logger from "../lib/logger";'
  },
  '/apps/server/src/lib/validation-middleware.ts': {
    old: 'import logger from "./../lib/logger";',
    new: 'import logger from "./logger";'
  },
  '/apps/server/src/lib/auth-middleware.ts': {
    old: 'import logger from "./../lib/logger";',
    new: 'import logger from "./logger";'
  },
  '/apps/server/src/db/index.ts': {
    old: 'import logger from "./../lib/logger";',
    new: 'import logger from "../lib/logger";'
  },
  '/apps/server/src/db/create-test-user.ts': {
    old: 'import logger from "./../lib/logger";',
    new: 'import logger from "../lib/logger";'
  },
  '/apps/server/src/db/seed-recipes.ts': {
    old: 'import logger from "./../lib/logger";',
    new: 'import logger from "../lib/logger";'
  },
  '/apps/server/src/db/test-models.ts': {
    old: 'import logger from "./../lib/logger";',
    new: 'import logger from "../lib/logger";'
  },
  '/apps/server/src/db/import-recipes.ts': {
    old: "import logger from './lib/logger';",
    new: 'import logger from "../lib/logger";'
  },
  '/apps/server/src/routers/user.ts': {
    old: 'import logger from "./../lib/logger";',
    new: 'import logger from "../lib/logger";'
  },
  '/apps/server/src/routers/nutrition.router.ts': {
    old: 'import logger from "./../lib/logger";',
    new: 'import logger from "../lib/logger";'
  },
  '/apps/server/src/routers/shopping-list.router.ts': {
    old: 'import logger from "./../lib/logger";',
    new: 'import logger from "../lib/logger";'
  },
  '/apps/server/src/routers/meal-planning.router.ts': {
    old: 'import logger from "./../lib/logger";',
    new: 'import logger from "../lib/logger";'
  },
  '/apps/server/src/scripts/test-favorites-functionality.ts': {
    old: 'import logger from "./../lib/logger";',
    new: 'import logger from "../lib/logger";'
  },
  '/apps/server/src/scripts/validate-favorites-types.ts': {
    old: "import logger from './lib/logger';",
    new: 'import logger from "../lib/logger";'
  },
  '/apps/server/test-server.js': {
    old: "const logger = require('./lib/logger').default;",
    new: "const logger = require('./src/lib/logger').default;"
  },
  '/apps/server/start-direct.ts': {
    old: 'import logger from "./lib/logger";',
    new: 'import logger from "./src/lib/logger";'
  },
  '/apps/server/test/spoonTest.ts': {
    old: 'import logger from "./lib/logger";',
    new: 'import logger from "../src/lib/logger";'
  },
  '/apps/server/test/realtime-match.test.ts': {
    old: 'import logger from "./lib/logger";',
    new: 'import logger from "../src/lib/logger";'
  },
  '/apps/server/test/websocket-connection.test.ts': {
    old: 'import logger from "./lib/logger";',
    new: 'import logger from "../src/lib/logger";'
  },
  '/apps/server/test/setup.ts': {
    old: 'import logger from "./lib/logger";',
    new: 'import logger from "../src/lib/logger";'
  },
  '/apps/server/test/setup/favorites-test-setup.ts': {
    old: 'import logger from "./lib/logger";',
    new: 'import logger from "../../src/lib/logger";'
  },
  
  // Native files - should all use @/utils/logger
  '/apps/native/hooks/usePartnerConnection.ts': {
    old: "import logger from '@/lib/logger';",
    new: "import logger from '@/utils/logger';"
  },
  '/apps/native/utils/websocket-manager.ts': {
    old: "import logger from '@/lib/logger';",
    new: "import logger from './logger';"
  },
  '/apps/native/utils/event-emitter.ts': {
    old: "import logger from '@/lib/logger';",
    new: "import logger from './logger';"
  },
  '/apps/native/utils/test-websocket-config.ts': {
    old: "import logger from '@/lib/logger';",
    new: "import logger from './logger';"
  }
};

// Process files
let successCount = 0;
let errorCount = 0;

const basePath = path.resolve(__dirname, '..');

for (const [relativePath, fix] of Object.entries(fixes)) {
  const fullPath = path.join(basePath, relativePath);
  
  try {
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${relativePath}`);
      errorCount++;
      continue;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    if (content.includes(fix.old)) {
      content = content.replace(fix.old, fix.new);
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed: ${relativePath}`);
      successCount++;
    } else if (content.includes(fix.new)) {
      console.log(`✓ Already correct: ${relativePath}`);
    } else if (content.includes('logger')) {
      console.log(`⚠️  Different import found in: ${relativePath}`);
      // Show what was found
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        if (line.includes('logger') && (line.includes('import') || line.includes('require'))) {
          console.log(`   Line ${i + 1}: ${line.trim()}`);
        }
      });
    }
  } catch (error) {
    console.error(`❌ Error processing ${relativePath}:`, error.message);
    errorCount++;
  }
}

console.log('\n=================================');
console.log('Logger Import Path Fix Results:');
console.log('=================================');
console.log(`✅ Fixed: ${successCount} files`);
console.log(`❌ Errors: ${errorCount} files`);

// Check for any remaining incorrect imports
console.log('\n=================================');
console.log('Verification:');
console.log('=================================');

const patterns = [
  './../lib/logger',
  './lib/logger',
  '@/lib/logger'  // Should be @/utils/logger in native
];

const checkDir = (dir) => {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('dist')) {
      checkDir(fullPath);
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      for (const pattern of patterns) {
        if (content.includes(pattern)) {
          const relativePath = fullPath.replace(basePath, '');
          console.log(`⚠️  Found "${pattern}" in: ${relativePath}`);
        }
      }
    }
  }
};

// Check apps directory
checkDir(path.join(basePath, 'apps'));

console.log('\n✅ Logger import path fix complete!');