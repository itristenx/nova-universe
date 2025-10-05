#!/usr/bin/env node

// Script to generate comprehensive API endpoint inventory
// Analyzes route files and generates documentation

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROUTES_DIR = path.join(__dirname, '../apps/api/routes');
const OUTPUT_FILE = path.join(__dirname, '../docs/API_INVENTORY.md');

// API endpoint categories based on Master_Doc.txt
const API_CATEGORIES = {
  'Nova Helix (Identity Engine)': /helix/i,
  'Nova Pulse (Technician Portal)': /pulse/i,
  'Nova Orbit (End-User Portal)': /orbit/i,
  'Nova Lore (Knowledge Base)': /lore/i,
  'Nova Synth (AI Engine)': /synth/i,
  'Nova Beacon (Kiosk Management)': /beacon/i,
  'Authentication & Authorization': /auth|oauth2|scim/i,
  'Service Catalog': /service-catalog|catalog/i,
  'Ticketing': /tickets|itsm/i,
  'Monitoring & Alerting': /monitoring|alerts|uptime/i,
  'User Management': /user|user360|directory/i,
  'Configuration & Settings': /config|setup/i,
  'Analytics & Reporting': /analytics|reports/i,
  'Notifications': /notifications|email/i,
  'RBAC & Permissions': /rbac|roles|permissions/i,
  'Workflows': /workflows|approvals/i,
  'Assets & Inventory': /assets|inventory|cmdb/i,
  'Other': /.*/,
};

class APIInventoryGenerator {
  constructor() {
    this.routes = [];
    this.duplicates = [];
    this.securityIssues = [];
    this.consolidationOpportunities = [];
  }

  // Read and parse a route file
  async parseRouteFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    const routes = [];

    // Extract router.get, router.post, etc.
    const routeRegex = /router\.(get|post|put|patch|delete|all)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    let match;

    while ((match = routeRegex.exec(content)) !== null) {
      const [, method, routePath] = match;
      
      // Check for authentication middleware
      const hasAuth = this.checkAuthentication(content, routePath);
      
      routes.push({
        file: fileName,
        method: method.toUpperCase(),
        path: routePath,
        authenticated: hasAuth,
        middleware: this.extractMiddleware(content, routePath),
      });
    }

    return routes;
  }

  // Check if route has authentication
  checkAuthentication(content, routePath) {
    const authPatterns = [
      /ensureAuth/,
      /requireAuth/,
      /authenticate/,
      /isAuthenticated/,
      /protect/,
    ];

    // Get context around the route
    const routeContext = this.getRouteContext(content, routePath);
    
    return authPatterns.some(pattern => pattern.test(routeContext));
  }

  // Extract middleware for a route
  extractMiddleware(content, routePath) {
    const routeContext = this.getRouteContext(content, routePath);
    const middlewarePatterns = [
      /ensureAuth/,
      /validateApiVersion/,
      /rateLimiter/,
      /sanitizeInput/,
    ];

    const middleware = [];
    middlewarePatterns.forEach(pattern => {
      if (pattern.test(routeContext)) {
        middleware.push(pattern.source);
      }
    });

    return middleware;
  }

  // Get context around a route definition
  getRouteContext(content, routePath) {
    const lines = content.split('\n');
    const routeLineIndex = lines.findIndex(line => 
      line.includes(routePath) && line.includes('router.')
    );

    if (routeLineIndex === -1) return '';

    // Get 3 lines before and after
    const start = Math.max(0, routeLineIndex - 3);
    const end = Math.min(lines.length, routeLineIndex + 3);
    
    return lines.slice(start, end).join('\n');
  }

  // Analyze routes for duplicates
  findDuplicates(allRoutes) {
    const routeMap = new Map();
    
    allRoutes.forEach(route => {
      const key = `${route.method}:${route.path}`;
      if (routeMap.has(key)) {
        routeMap.get(key).push(route);
      } else {
        routeMap.set(key, [route]);
      }
    });

    // Find entries with multiple files
    for (const [key, routes] of routeMap.entries()) {
      if (routes.length > 1) {
        this.duplicates.push({
          endpoint: key,
          files: routes.map(r => r.file),
          routes: routes,
        });
      }
    }
  }

  // Identify consolidation opportunities
  findConsolidationOpportunities(allRoutes) {
    // Group similar endpoints
    const pathGroups = new Map();
    
    allRoutes.forEach(route => {
      // Extract base path (e.g., /tickets from /tickets/:id)
      const basePath = route.path.split('/')[1] || route.path;
      
      if (!pathGroups.has(basePath)) {
        pathGroups.set(basePath, []);
      }
      pathGroups.get(basePath).push(route);
    });

    // Look for groups with multiple files
    for (const [basePath, routes] of pathGroups.entries()) {
      const files = new Set(routes.map(r => r.file));
      if (files.size > 1 && routes.length > 3) {
        this.consolidationOpportunities.push({
          basePath,
          fileCount: files.size,
          routeCount: routes.length,
          files: Array.from(files),
        });
      }
    }
  }

  // Categorize routes
  categorizeRoute(route) {
    for (const [category, pattern] of Object.entries(API_CATEGORIES)) {
      if (pattern.test(route.file) || pattern.test(route.path)) {
        if (category !== 'Other') {
          return category;
        }
      }
    }
    return 'Other';
  }

  // Generate markdown report
  generateReport(allRoutes) {
    let report = '# Nova Universe API Endpoint Inventory\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `Total Endpoints: ${allRoutes.length}\n`;
    report += `Total Route Files: ${new Set(allRoutes.map(r => r.file)).size}\n\n`;

    // Table of Contents
    report += '## Table of Contents\n\n';
    report += '1. [API Endpoints by Category](#api-endpoints-by-category)\n';
    report += '2. [Duplicate Endpoints](#duplicate-endpoints)\n';
    report += '3. [Consolidation Opportunities](#consolidation-opportunities)\n';
    report += '4. [Security Analysis](#security-analysis)\n';
    report += '5. [API Versioning](#api-versioning)\n';
    report += '6. [Recommendations](#recommendations)\n\n';

    // Endpoints by Category
    report += '## API Endpoints by Category\n\n';
    
    const categorized = new Map();
    allRoutes.forEach(route => {
      const category = this.categorizeRoute(route);
      if (!categorized.has(category)) {
        categorized.set(category, []);
      }
      categorized.get(category).push(route);
    });

    for (const [category, routes] of categorized.entries()) {
      if (category === 'Other') continue; // Skip "Other" for now
      
      report += `### ${category}\n\n`;
      report += `Total: ${routes.length} endpoints\n\n`;
      report += '| Method | Path | Auth | File |\n';
      report += '|--------|------|------|------|\n';
      
      routes.slice(0, 20).forEach(route => {
        report += `| ${route.method} | ${route.path} | ${route.authenticated ? '🔒 Yes' : '🔓 No'} | ${route.file} |\n`;
      });
      
      if (routes.length > 20) {
        report += `\n*... and ${routes.length - 20} more endpoints*\n`;
      }
      report += '\n';
    }

    // Duplicates
    report += '## Duplicate Endpoints\n\n';
    if (this.duplicates.length === 0) {
      report += '✅ No duplicate endpoint registrations detected.\n\n';
    } else {
      report += `⚠️ Found ${this.duplicates.length} duplicate endpoint registrations:\n\n`;
      this.duplicates.forEach(dup => {
        report += `### ${dup.endpoint}\n\n`;
        report += 'Registered in:\n';
        dup.files.forEach(file => {
          report += `- ${file}\n`;
        });
        report += '\n';
      });
    }

    // Consolidation Opportunities
    report += '## Consolidation Opportunities\n\n';
    if (this.consolidationOpportunities.length === 0) {
      report += '✅ No obvious consolidation opportunities detected.\n\n';
    } else {
      report += `💡 Found ${this.consolidationOpportunities.length} potential consolidation opportunities:\n\n`;
      this.consolidationOpportunities.forEach(opp => {
        report += `### /${opp.basePath}/*\n\n`;
        report += `- **Routes**: ${opp.routeCount}\n`;
        report += `- **Files**: ${opp.fileCount}\n`;
        report += `- **Files involved**: ${opp.files.join(', ')}\n`;
        report += `- **Recommendation**: Consider consolidating these routes into a single router file.\n\n`;
      });
    }

    // Security Analysis
    report += '## Security Analysis\n\n';
    const publicEndpoints = allRoutes.filter(r => !r.authenticated);
    const protectedEndpoints = allRoutes.filter(r => r.authenticated);
    
    report += `- **Protected Endpoints**: ${protectedEndpoints.length} (${((protectedEndpoints.length / allRoutes.length) * 100).toFixed(1)}%)\n`;
    report += `- **Public Endpoints**: ${publicEndpoints.length} (${((publicEndpoints.length / allRoutes.length) * 100).toFixed(1)}%)\n\n`;
    
    report += '### Public Endpoints Requiring Review\n\n';
    report += 'These endpoints do not appear to have authentication:\n\n';
    report += '| Method | Path | File |\n';
    report += '|--------|------|------|\n';
    publicEndpoints.slice(0, 15).forEach(route => {
      report += `| ${route.method} | ${route.path} | ${route.file} |\n`;
    });
    if (publicEndpoints.length > 15) {
      report += `\n*... and ${publicEndpoints.length - 15} more*\n`;
    }
    report += '\n';

    // API Versioning
    report += '## API Versioning\n\n';
    const v1Routes = allRoutes.filter(r => r.path.includes('/v1/'));
    const v2Routes = allRoutes.filter(r => r.path.includes('/v2/'));
    const unversionedRoutes = allRoutes.filter(r => !r.path.includes('/v1/') && !r.path.includes('/v2/'));
    
    report += `- **v1 Endpoints**: ${v1Routes.length}\n`;
    report += `- **v2 Endpoints**: ${v2Routes.length}\n`;
    report += `- **Unversioned Endpoints**: ${unversionedRoutes.length}\n\n`;

    // Recommendations
    report += '## Recommendations\n\n';
    report += '### High Priority\n\n';
    
    if (this.duplicates.length > 0) {
      report += `1. **Remove Duplicate Registrations**: ${this.duplicates.length} duplicate endpoints should be consolidated.\n`;
    }
    
    if (publicEndpoints.length > allRoutes.length * 0.3) {
      report += `2. **Review Public Endpoints**: ${publicEndpoints.length} endpoints (${((publicEndpoints.length / allRoutes.length) * 100).toFixed(1)}%) lack authentication. Verify this is intentional.\n`;
    }
    
    if (this.consolidationOpportunities.length > 5) {
      report += `3. **Consolidate Route Files**: ${this.consolidationOpportunities.length} groups of related endpoints spread across multiple files could be consolidated.\n`;
    }
    
    report += '\n### Medium Priority\n\n';
    
    if (unversionedRoutes.length > v1Routes.length + v2Routes.length) {
      report += `1. **API Versioning**: ${unversionedRoutes.length} unversioned endpoints should be migrated to versioned routes.\n`;
    }
    
    report += '2. **OpenAPI Specification**: Ensure all endpoints are documented in the OpenAPI spec.\n';
    report += '3. **Rate Limiting**: Verify rate limiting is applied consistently across all endpoints.\n';
    
    report += '\n### Best Practices\n\n';
    report += '1. Use consistent authentication middleware across all protected endpoints\n';
    report += '2. Implement comprehensive input validation on all POST/PUT/PATCH endpoints\n';
    report += '3. Add security headers (CSP, HSTS, X-Frame-Options) to all responses\n';
    report += '4. Document all endpoints with JSDoc comments\n';
    report += '5. Write integration tests for all critical endpoints\n';

    return report;
  }

  // Main execution
  async generate() {
    console.log('📊 Generating API Endpoint Inventory...\n');

    // Read all route files
    const routeFiles = fs.readdirSync(ROUTES_DIR)
      .filter(f => f.endsWith('.js') || f.endsWith('.ts'))
      .map(f => path.join(ROUTES_DIR, f));

    console.log(`Found ${routeFiles.length} route files\n`);

    // Parse all routes
    const allRoutes = [];
    for (const file of routeFiles) {
      try {
        const routes = await this.parseRouteFile(file);
        allRoutes.push(...routes);
        console.log(`  ✓ Parsed ${path.basename(file)}: ${routes.length} routes`);
      } catch (error) {
        console.error(`  ✗ Error parsing ${path.basename(file)}:`, error.message);
      }
    }

    console.log(`\nTotal routes parsed: ${allRoutes.length}\n`);

    // Analyze
    console.log('Analyzing for duplicates...');
    this.findDuplicates(allRoutes);
    
    console.log('Finding consolidation opportunities...');
    this.findConsolidationOpportunities(allRoutes);

    // Generate report
    console.log('Generating report...\n');
    const report = this.generateReport(allRoutes);

    // Write to file
    fs.writeFileSync(OUTPUT_FILE, report);
    console.log(`✅ Report written to: ${OUTPUT_FILE}`);

    // Summary
    console.log('\n📈 Summary:');
    console.log(`  - Total Endpoints: ${allRoutes.length}`);
    console.log(`  - Route Files: ${routeFiles.length}`);
    console.log(`  - Duplicates: ${this.duplicates.length}`);
    console.log(`  - Consolidation Opportunities: ${this.consolidationOpportunities.length}`);
    console.log(`  - Protected Endpoints: ${allRoutes.filter(r => r.authenticated).length}`);
    console.log(`  - Public Endpoints: ${allRoutes.filter(r => !r.authenticated).length}`);
  }
}

// Run
const generator = new APIInventoryGenerator();
generator.generate().catch(console.error);
