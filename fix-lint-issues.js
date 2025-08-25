#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Common patterns to fix
const fixes = [
  // Fix unused error variables - prefix with underscore
  {
    pattern: /catch \(error\) {[\s\S]*?(?=\n\s*})/g,
    replacement: (match) => match.replace('catch (error)', 'catch (_error)'),
  },
  {
    pattern: /catch \(err\) {[\s\S]*?(?=\n\s*})/g,
    replacement: (match) => match.replace('catch (err)', 'catch (_err)'),
  },
  {
    pattern: /catch \(e\) {[\s\S]*?(?=\n\s*})/g,
    replacement: (match) => match.replace('catch (e)', 'catch (_e)'),
  },
  {
    pattern: /catch \(e2\) {[\s\S]*?(?=\n\s*})/g,
    replacement: (match) => match.replace('catch (e2)', 'catch (_e2)'),
  },

  // Fix unused parameter issues
  {
    pattern: /\(([\w\s,]*)\s*options\s*([\w\s,]*)\)\s*=>/g,
    replacement: (match, before, after) => {
      if (before && before.trim().endsWith(',')) {
        return match.replace('options', '_options');
      } else if (after && after.trim().startsWith(',')) {
        return match.replace('options', '_options');
      } else if (!before && !after) {
        return match.replace('(options)', '(_options)');
      }
      return match.replace('options', '_options');
    },
  },

  // Remove unused imports
  {
    pattern: /import.*{[^}]*,\s*devtools\s*[^}]*}.*from.*;\n/g,
    replacement: (match) =>
      match
        .replace(/,\s*devtools\s*/, '')
        .replace(/{\s*devtools\s*,\s*/, '{')
        .replace(/{\s*devtools\s*}/, '{}'),
  },

  // Fix unused variables by prefixing with underscore
  {
    pattern: /const\s+(\w+)\s*=/g,
    replacement: (match, varName) => {
      // Only fix specific unused variables we know about
      const unusedVars = [
        'platform',
        'error',
        'activationUrl',
        'deviceFingerprint',
        'handleQRScan',
        'deviceId',
        'token',
      ];
      if (unusedVars.includes(varName)) {
        return match.replace(varName, '_' + varName);
      }
      return match;
    },
  },
];

// List of files to process (most problematic ones first)
const filesToFix = [
  'apps/unified/src/pages/tv/TVActivation.tsx',
  'apps/unified/src/pages/tv/TVDisplay.tsx',
  'apps/unified/src/pages/spaces/BookingPage.tsx',
  'apps/unified/src/pages/tickets/CreateTicketPage.tsx',
  'apps/unified/src/pages/tickets/TicketDetailPage.tsx',
  'apps/unified/src/pages/tickets/TicketsPage.tsx',
  'apps/unified/src/services/api.ts',
  'apps/unified/src/services/catalogLiveServices.ts',
  'apps/unified/src/services/connectionService.ts',
  'apps/unified/src/services/features.ts',
  'apps/unified/src/services/liveApiServices.ts',
  'apps/unified/src/stores/catalogStore.ts',
  'apps/unified/src/stores/dashboard.ts',
  'apps/unified/src/stores/guidedFlow.ts',
  'apps/unified/src/stores/rbacStore.ts',
  'apps/unified/src/stores/users.ts',
  'apps/unified/src/utils/culturalFormatting.ts',
];

function fixFile(filePath) {
  try {
    const fullPath = path.join('/Users/tneibarger/nova-universe', filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Apply fixes
    fixes.forEach((fix) => {
      const newContent = content.replace(fix.pattern, fix.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(fullPath, content);
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

// Fix files
console.log('Starting automatic lint fixes...');
filesToFix.forEach(fixFile);
console.log('Automatic fixes completed.');
