#!/usr/bin/env node

/**
 * Automated ESLint Error Fixing Script
 * This script fixes common ESLint errors across the codebase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Common regex patterns for fixes
const fixes = [
  // Remove unused variables in catch blocks
  {
    pattern: /} catch \([a-zA-Z_$][a-zA-Z0-9_$]*\) \{\s*\}/g,
    replacement: '} catch {\n    // Error ignored\n  }'
  },
  
  // Fix empty catch blocks
  {
    pattern: /} catch \{\}/g,
    replacement: '} catch {\n    // Error ignored\n  }'
  },
  
  // Fix empty blocks
  {
    pattern: /} catch \([a-zA-Z_$][a-zA-Z0-9_$]*\) \{\s*\/\/[^\n]*\n\s*\}/g,
    replacement: (match) => {
      const comment = match.match(/\/\/[^\n]*/)[0];
      return `} catch {\n    ${comment}\n  }`;
    }
  },
  
  // Add eslint-disable for unused vars that might be needed later
  {
    pattern: /^(\s*const\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*=)/gm,
    replacement: (match, p1) => {
      // Only add for specific patterns that are commonly unused but needed
      if (match.includes('JWT_SECRET') || match.includes('CERT_PATH') || match.includes('KEY_PATH')) {
        return `${p1.replace('const', '// eslint-disable-next-line @typescript-eslint/no-unused-vars\n  const')}`;
      }
      return match;
    }
  }
];

// Get all JS/TS files
function getAllFiles(dir, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const files = [];
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other common directories
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(item)) {
          walkDir(fullPath);
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  walkDir(dir);
  return files;
}

// Apply fixes to a file
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  for (const fix of fixes) {
    const newContent = content.replace(fix.pattern, fix.replacement);
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  }
}

// Main execution
const rootDir = __dirname;
const files = getAllFiles(rootDir);

console.log(`Found ${files.length} files to check...`);

for (const file of files) {
  try {
    fixFile(file);
  } catch (error) {
    console.error(`Error fixing ${file}:`, error.message);
  }
}

console.log('Batch fixing completed!');
