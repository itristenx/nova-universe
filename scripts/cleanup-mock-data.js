#!/usr/bin/env node

/**
 * Mock Data Cleanup Script
 * Removes or safely disables mock data usage for production deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

class MockDataCleaner {
  constructor() {
    this.cleanedFiles = [];
    this.warnings = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${type.toUpperCase()}]`;
    console.log(`${prefix} ${message}`);
  }

  warn(message) {
    this.warnings.push(message);
    this.log(`⚠️  ${message}`, 'warn');
  }

  error(message) {
    this.errors.push(message);
    this.log(`❌ ${message}`, 'error');
  }

  success(message) {
    this.log(`✅ ${message}`, 'success');
  }

  // Add production mode guards to mock data usage
  addProductionGuards(filePath) {
    if (!fs.existsSync(filePath)) {
      this.warn(`File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Guard mock data object creation
    const mockDataDeclarationRegex = /const\s+mockData\s*=\s*{/g;
    if (mockDataDeclarationRegex.test(content)) {
      content = content.replace(
        mockDataDeclarationRegex,
        `// Production guard: Mock data only available in development
const mockData = process.env.NODE_ENV === 'production' ? {} : {`
      );
      modified = true;
    }

    // Guard mock data usage - Fix syntax issues
    const mockDataUsageRegex = /mockData\.(\w+)/g;
    if (mockDataUsageRegex.test(content)) {
      content = content.replace(
        mockDataUsageRegex,
        `(process.env.NODE_ENV !== 'production' ? mockData.$1 : undefined)`
      );
      modified = true;
    }

    // Add production checks for route handlers that use mock data - Fix to ensure res parameter exists
    const routeHandlerRegex = /(router\.(get|post|put|delete)\([^,]+,\s*[^,]*,\s*async\s*\([^)]*res[^)]*\)\s*=>\s*{)/g;
    if (routeHandlerRegex.test(content)) {
      content = content.replace(
        routeHandlerRegex,
        `$1
  // Production guard: Disable mock data operations
  if (process.env.NODE_ENV === 'production' && process.env.NOVA_TV_MOCK_MODE !== 'true') {
    return res.status(501).json({ error: 'Service requires database connection in production mode' });
  }`
      );
      modified = true;
    }

    if (modified) {
      // Create backup
      fs.writeFileSync(`${filePath}.backup`, fs.readFileSync(filePath));
      fs.writeFileSync(filePath, content);
      this.cleanedFiles.push(filePath);
      this.success(`Added production guards to ${filePath}`);
      return true;
    }

    return false;
  }

  // Replace mock data files with production warnings
  replaceWithProductionWarning(filePath) {
    if (!fs.existsSync(filePath)) {
      this.warn(`File not found: ${filePath}`);
      return false;
    }

    const warningContent = `// PRODUCTION WARNING: This file contained mock data and has been disabled for production.
// Original file backed up as ${path.basename(filePath)}.backup
// To enable mock data in development, set NODE_ENV=development and MOCK_DATA_ENABLED=true

console.warn('Mock data file accessed in production mode:', '${filePath}');
console.warn('Original mock functionality has been disabled for security.');

export default {};
`;

    // Create backup
    fs.writeFileSync(`${filePath}.backup`, fs.readFileSync(filePath));
    fs.writeFileSync(filePath, warningContent);
    this.cleanedFiles.push(filePath);
    this.success(`Replaced mock data file: ${filePath}`);
    return true;
  }

  // Update import statements to handle missing mock modules
  updateImports(filePath) {
    if (!fs.existsSync(filePath)) return false;

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Wrap mock data imports in try-catch
    const importRegex = /(import\s+.*from\s+['"][^'"]*mock[^'"]*['"])/gi;
    const matches = content.match(importRegex);
    
    if (matches) {
      matches.forEach(importStatement => {
        const wrappedImport = `try {
  ${importStatement};
} catch (error) {
  console.warn('Mock data import failed (expected in production):', error.message);
}`;
        content = content.replace(importStatement, wrappedImport);
        modified = true;
      });
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      this.success(`Updated imports in ${filePath}`);
      return true;
    }

    return false;
  }

  async cleanFile(filePath) {
    this.log(`🔍 Cleaning ${filePath}...`);

    // Determine cleanup strategy based on file type and content
    const content = fs.readFileSync(filePath, 'utf8');
    const mockDataDensity = (content.match(/mockData/g) || []).length;

    if (mockDataDensity > 20 && filePath.includes('nova-tv')) {
      // For heavily mock-dependent files, add comprehensive guards
      this.addProductionGuards(filePath);
    } else if (mockDataDensity > 0) {
      // For files with light mock usage, add guards
      this.addProductionGuards(filePath);
    }

    // Update imports
    this.updateImports(filePath);
  }

  async run() {
    this.log('🧹 Starting mock data cleanup for production...');

    // Files that need cleaning based on validation results
    const filesToClean = [
      'apps/api/routes/nova-tv.js',
      'apps/api/src/routes/nova-tv.ts',
      'apps/api/src/routes/nova-tv-simplified.ts',
      'apps/api/src/routes/nova-tv-digital-signage.js',
      'apps/unified/src/utils/index.ts',
      'apps/unified/src/services/connectionService.ts',
      'apps/api/routes/ai-fabric.js',
      'apps/api/lib/nova-ai-agent-analytics.ts',
    ];

    for (const filePath of filesToClean) {
      const fullPath = path.join(rootDir, filePath);
      if (fs.existsSync(fullPath)) {
        await this.cleanFile(fullPath);
      } else {
        this.warn(`File not found: ${filePath}`);
      }
    }

    // Create production-ready environment file
    this.createProductionEnv();

    // Generate summary
    this.generateSummary();
  }

  createProductionEnv() {
    const productionEnvPath = path.join(rootDir, '.env.production');
    const productionContent = `# Nova Universe Production Environment
# Auto-generated by mock data cleanup script

NODE_ENV=production

# CRITICAL: Mock data disabled for production
USE_MOCK_DATA=false
VITE_USE_MOCK_DATA=false
AI_FABRIC_MOCK_MODE=false
RAG_MOCK_EMBEDDINGS=false
AI_MONITORING_MOCK_DATA=false
NOVA_TV_MOCK_MODE=false
API_MOCK_RESPONSES=false
DATABASE_MOCK_MODE=false

# Database configuration required for production
DATABASE_URL=postgresql://user:password@localhost:5432/nova_universe
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=nova_universe
POSTGRES_USER=nova_user
POSTGRES_PASSWORD=CHANGE_ME_IN_PRODUCTION

# Redis configuration
REDIS_URL=redis://localhost:6379

# AI/ML API Keys (required for production)
OPENAI_API_KEY=your_openai_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Monitoring and logging
LOG_LEVEL=info
ENABLE_AUDIT_LOGGING=true

# Security
JWT_SECRET=CHANGE_ME_TO_SECURE_SECRET_IN_PRODUCTION
SESSION_SECRET=CHANGE_ME_TO_SECURE_SECRET_IN_PRODUCTION
`;

    fs.writeFileSync(productionEnvPath, productionContent);
    this.success('Created production environment file');
  }

  generateSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('🧹 MOCK DATA CLEANUP SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Files cleaned: ${this.cleanedFiles.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);

    if (this.cleanedFiles.length > 0) {
      console.log('\n📁 Files cleaned:');
      this.cleanedFiles.forEach(file => console.log(`  • ${file}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => console.log(`  • ${error}`));
    }

    console.log('\n📋 Next Steps:');
    console.log('  1. Review cleaned files for correctness');
    console.log('  2. Update .env.production with actual database credentials');
    console.log('  3. Run production validation: node test/nova-ai-production-validation.js');
    console.log('  4. Test application functionality');
    console.log('  5. Restore from .backup files if needed');

    console.log('\n🔄 To restore original files:');
    console.log('  find . -name "*.backup" -exec sh -c \'mv "$1" "${1%.backup}"\' _ {} \\;');

    console.log('='.repeat(80));
  }
}

// Run cleanup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleaner = new MockDataCleaner();
  cleaner.run().catch(error => {
    console.error('Cleanup failed:', error);
    process.exit(1);
  });
}

export default MockDataCleaner;