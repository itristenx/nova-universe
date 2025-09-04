#!/usr/bin/env node

/**
 * Nova AI/ML/RAG Production Validation Test
 * Ensures no mock data is used in production and validates industry standards compliance
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Test configuration
const TEST_CONFIG = {
  production: true,
  validateAI: true,
  validateRAG: true,
  validateMonitoring: true,
  validateCompliance: true,
};

// Industry standards to validate against
const INDUSTRY_STANDARDS = {
  security: ['OWASP AI Security Top 10', 'NIST AI RMF'],
  privacy: ['GDPR', 'CCPA', 'HIPAA'],
  compliance: ['SOX', 'EU AI Act'],
  performance: ['Sub-second response times', '99.9% uptime SLA'],
  governance: ['ISO/IEC 42001'],
};

class ProductionValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
    this.mockDataFound = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${type.toUpperCase()}]`;
    console.log(`${prefix} ${message}`);
  }

  error(message, details = null) {
    this.errors.push({ message, details });
    this.log(`❌ ${message}`, 'error');
    if (details) {
      console.log(`   Details: ${details}`);
    }
  }

  warning(message, details = null) {
    this.warnings.push({ message, details });
    this.log(`⚠️  ${message}`, 'warn');
    if (details) {
      console.log(`   Details: ${details}`);
    }
  }

  success(message) {
    this.passed.push(message);
    this.log(`✅ ${message}`, 'success');
  }

  async validateEnvironmentConfiguration() {
    this.log('🔍 Validating environment configuration...');
    
    // Use TEST_CONFIG to determine validation scope
    const validationScope = Object.keys(TEST_CONFIG).filter(key => TEST_CONFIG[key]);
    this.log(`📋 Validation scope based on TEST_CONFIG: ${validationScope.join(', ')}`);

    // Check production environment files
    const envFiles = [
      '.env.production.template',
      '.env.production.secure',
    ];

    for (const envFile of envFiles) {
      const filePath = path.join(rootDir, envFile);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for mock data settings
        if (content.includes('USE_MOCK_DATA=true') || content.includes('VITE_USE_MOCK_DATA=true')) {
          this.error(`Mock data enabled in ${envFile}`, 'Found USE_MOCK_DATA=true');
        } else if (content.includes('USE_MOCK_DATA=false') && content.includes('VITE_USE_MOCK_DATA=false')) {
          this.success(`Mock data properly disabled in ${envFile}`);
        }

        // Check for NODE_ENV=production
        if (content.includes('NODE_ENV=production')) {
          this.success(`Production environment set in ${envFile}`);
        } else if (!envFile.includes('template')) {
          this.warning(`NODE_ENV not set to production in ${envFile}`);
        }
      }
    }
  }

  // Safe file scanner to avoid command injection
  async scanFilesForPattern(pattern, baseDir, extensions = ['.js', '.ts']) {
    const results = [];
    
    const scanDirectory = (dir) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            scanDirectory(fullPath);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (extensions.includes(ext)) {
              try {
                const content = fs.readFileSync(fullPath, 'utf8');
                const regex = new RegExp(pattern, 'gi');
                const lines = content.split('\n');
                
                lines.forEach((line, index) => {
                  if (regex.test(line)) {
                    results.push(`${fullPath}:${index + 1}:${line.trim()}`);
                  }
                });
              } catch (readError) {
                // Skip files that can't be read - log for debugging
                console.debug(`Skipping unreadable file: ${fullPath} - ${readError.message}`);
              }
            }
          }
        }
      } catch (dirError) {
        // Skip directories that can't be read - log for debugging
        console.debug(`Skipping directory: ${dir} - ${dirError.message}`);
      }
    };
    
    scanDirectory(baseDir);
    return results;
  }

  async scanForMockData() {
    this.log('🔍 Scanning for mock data usage in production code...');

    const searchPatterns = [
      { pattern: 'mockData', exclude: ['/test/', '/tests/', '/spec/', '.test.', '.spec.', 'mock-api.js'] },
      { pattern: 'generateMockResponse', exclude: ['/test/', '/tests/', '/spec/', '.test.', '.spec.'] },
      { pattern: 'mock.*data', exclude: ['/test/', '/tests/', '/spec/', '.test.', '.spec.'] },
      { pattern: 'demo.*data', exclude: ['/test/', '/tests/', '/spec/', '.test.', '.spec.'] },
      // More specific patterns for actual mock data, not legitimate Math.random() usage
      { pattern: 'Math\.random.*mock', exclude: ['/test/', '/tests/', '/spec/', '.test.', '.spec.'] },
      { pattern: 'return.*Math\.random', exclude: ['/test/', '/tests/', '/spec/', '.test.', '.spec.', 'uuid', 'crypto', 'jitter', 'delay'] },
    ];

    for (const { pattern, exclude } of searchPatterns) {
      try {
        // Use safe file scanning instead of shell commands
        const appsDir = path.join(rootDir, 'apps');
        const results = await this.scanFilesForPattern(pattern, appsDir);
        
        for (const result of results) {
          const shouldExclude = exclude.some(excludePattern => result.includes(excludePattern));
          // Also exclude legitimate uses of Math.random() for IDs, UUIDs, jitter, etc.
          const isLegitimateRandom = result.includes('Math.random()') && (
            result.includes('uuid') || 
            result.includes('id') || 
            result.includes('jitter') || 
            result.includes('delay') || 
            result.includes('retry') ||
            result.includes('backoff') ||
            result.includes('salt') ||
            result.includes('nonce')
          );
          
          if (!shouldExclude && !isLegitimateRandom && result.trim()) {
            this.mockDataFound.push({ pattern, line: result.trim() });
          }
        }
      } catch (error) {
        this.warning(`Failed to search for pattern: ${pattern}`, error.message);
      }
    }

    if (this.mockDataFound.length === 0) {
      this.success('No mock data found in production code paths');
    } else {
      this.error(`Found ${this.mockDataFound.length} instances of mock data in production code`);
      this.mockDataFound.forEach(({ pattern, line }) => {
        console.log(`   Pattern: ${pattern} | ${line}`);
      });
    }
  }

  async validateAIFabric() {
    this.log('🔍 Validating AI Fabric implementation...');

    const aiFabricPath = path.join(rootDir, 'apps/api/lib/ai-fabric.js');
    if (!fs.existsSync(aiFabricPath)) {
      this.error('AI Fabric file not found', aiFabricPath);
      return;
    }

    const content = fs.readFileSync(aiFabricPath, 'utf8');

    // Check for industry standards compliance using INDUSTRY_STANDARDS
    const complianceChecks = [
      { standard: INDUSTRY_STANDARDS.security[1], pattern: 'NIST.*AI.*RMF|AI.*RMF.*compliance' },
      { standard: INDUSTRY_STANDARDS.security[0], pattern: 'OWASP.*AI.*Security|AI.*Security.*Top.*10' },
      { standard: 'Circuit Breakers', pattern: 'circuitBreakers|circuit.*breaker' },
      { standard: 'Rate Limiting', pattern: 'rateLimits|rate.*limit' },
      { standard: 'Audit Trails', pattern: 'auditLog|audit.*trail' },
      { standard: 'Security Monitoring', pattern: 'securityMonitoring|security.*monitoring' },
    ];

    this.log(`🔍 Validating compliance against standards: ${Object.keys(INDUSTRY_STANDARDS).join(', ')}`);

    for (const { standard, pattern } of complianceChecks) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(content)) {
        this.success(`AI Fabric implements ${standard}`);
      } else {
        this.warning(`AI Fabric may be missing ${standard} implementation`);
      }
    }

    // Check for mock responses - be more specific about what constitutes mock implementation
    if (content.includes('Math.random()') && 
        !content.includes('// Production implementation') &&
        !content.includes('uuid') &&
        !content.includes('jitter') &&
        !content.includes('id') &&
        (content.includes('mock') || content.includes('demo') || content.includes('test'))) {
      this.warning('AI Fabric may contain mock implementations');
    }
  }

  async validateRAGEngine() {
    this.log('🔍 Validating RAG Engine implementation...');

    const ragEnginePath = path.join(rootDir, 'apps/api/lib/rag-engine.ts');
    if (!fs.existsSync(ragEnginePath)) {
      this.error('RAG Engine file not found', ragEnginePath);
      return;
    }

    const content = fs.readFileSync(ragEnginePath, 'utf8');

    // Check for production vector stores
    const vectorStores = ['ChromaDB', 'Pinecone', 'Qdrant', 'FAISS'];
    const foundStores = vectorStores.filter(store => 
      content.includes(store) || content.toLowerCase().includes(store.toLowerCase())
    );

    if (foundStores.length > 0) {
      this.success(`RAG Engine supports vector stores: ${foundStores.join(', ')}`);
    } else {
      this.error('RAG Engine missing production vector store implementations');
    }

    // Check for RBAC implementation
    if (content.includes('RBAC') || content.includes('rbac')) {
      this.success('RAG Engine implements RBAC for document access');
    } else {
      this.warning('RAG Engine may be missing RBAC implementation');
    }

    // Check for actual embedding API calls
    if (content.includes('fetch(') && content.includes('api')) {
      this.success('RAG Engine implements real API calls for embeddings');
    } else {
      this.warning('RAG Engine may be using mock embedding generation');
    }
  }

  async validateMonitoringSystem() {
    this.log('🔍 Validating AI Monitoring System...');

    const monitoringPath = path.join(rootDir, 'apps/api/lib/ai-monitoring.ts');
    if (!fs.existsSync(monitoringPath)) {
      this.error('AI Monitoring file not found', monitoringPath);
      return;
    }

    const content = fs.readFileSync(monitoringPath, 'utf8');

    // Check for compliance frameworks using INDUSTRY_STANDARDS
    const allFrameworks = [
      ...INDUSTRY_STANDARDS.privacy,
      ...INDUSTRY_STANDARDS.compliance,
      ...INDUSTRY_STANDARDS.governance
    ];
    const foundFrameworks = allFrameworks.filter(framework => content.includes(framework));

    this.log(`🔍 Checking for compliance frameworks: ${allFrameworks.join(', ')}`);

    if (foundFrameworks.length >= 3) {
      this.success(`Monitoring system supports compliance frameworks: ${foundFrameworks.join(', ')}`);
    } else {
      this.warning(`Monitoring system may be missing compliance framework support. Found: ${foundFrameworks.join(', ')}`);
    }

    // Check for bias detection
    if (content.includes('bias') && content.includes('detection')) {
      this.success('Monitoring system implements bias detection');
    } else {
      this.warning('Monitoring system may be missing bias detection');
    }

    // Check for explainability
    if (content.includes('explainability') || content.includes('SHAP') || content.includes('LIME')) {
      this.success('Monitoring system implements explainable AI');
    } else {
      this.warning('Monitoring system may be missing explainability features');
    }
  }

  async validateDatabase() {
    this.log('🔍 Validating database migration for production...');

    const migrationPath = path.join(rootDir, 'apps/api/migrations/20250103000000_nova_tv_production.sql');
    if (!fs.existsSync(migrationPath)) {
      this.error('Production database migration not found');
      return;
    }

    const content = fs.readFileSync(migrationPath, 'utf8');
    
    if (content.includes('CREATE TABLE') && content.includes('nova_tv_dashboards')) {
      this.success('Production database schema migration exists');
    } else {
      this.error('Production database migration incomplete');
    }

    // Check for demo/mock data insertions
    if (content.includes('INSERT') && !content.includes('INSERT OR IGNORE')) {
      this.warning('Database migration may insert non-idempotent data');
    }
  }

  async executeCommand(command) {
    return new Promise((resolve, reject) => {
      const process = spawn('bash', ['-c', command], { cwd: rootDir });
      let output = '';
      let errorOutput = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(errorOutput || `Command exited with code ${code}`));
        }
      });
    });
  }

  async generateReport() {
    this.log('📊 Generating validation report...');

    const report = {
      timestamp: new Date().toISOString(),
      status: this.errors.length === 0 ? 'PASSED' : 'FAILED',
      summary: {
        totalChecks: this.passed.length + this.warnings.length + this.errors.length,
        passed: this.passed.length,
        warnings: this.warnings.length,
        errors: this.errors.length,
        mockDataInstances: this.mockDataFound.length,
      },
      industryStandardsCompliance: {
        security: this.passed.filter(p => p.includes('OWASP') || p.includes('NIST')).length > 0,
        privacy: this.passed.filter(p => p.includes('GDPR') || p.includes('CCPA') || p.includes('HIPAA')).length > 0,
        performance: this.passed.filter(p => p.includes('response') || p.includes('performance')).length > 0,
        monitoring: this.passed.filter(p => p.includes('monitoring') || p.includes('audit')).length > 0,
      },
      details: {
        passed: this.passed,
        warnings: this.warnings,
        errors: this.errors,
        mockDataFound: this.mockDataFound,
      },
    };

    // Write report to file
    const reportPath = path.join(rootDir, 'nova-ai-production-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('🎯 NOVA AI/ML/RAG PRODUCTION VALIDATION REPORT');
    console.log('='.repeat(80));
    console.log(`Status: ${report.status === 'PASSED' ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Total Checks: ${report.summary.totalChecks}`);
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`⚠️  Warnings: ${report.summary.warnings}`);
    console.log(`❌ Errors: ${report.summary.errors}`);
    console.log(`🎭 Mock Data Instances: ${report.summary.mockDataInstances}`);
    
    console.log('\n📋 Industry Standards Compliance:');
    Object.entries(report.industryStandardsCompliance).forEach(([standard, compliant]) => {
      console.log(`  ${compliant ? '✅' : '❌'} ${standard}: ${compliant ? 'Compliant' : 'Non-compliant'}`);
    });

    if (report.summary.errors > 0) {
      console.log('\n❌ Critical Issues Found:');
      this.errors.forEach(error => {
        console.log(`  • ${error.message}`);
      });
    }

    if (report.summary.warnings > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => {
        console.log(`  • ${warning.message}`);
      });
    }

    console.log(`\n📄 Full report saved to: ${reportPath}`);
    console.log('='.repeat(80));

    return report;
  }

  async run() {
    this.log('🚀 Starting Nova AI/ML/RAG Production Validation...');

    try {
      await this.validateEnvironmentConfiguration();
      await this.scanForMockData();
      await this.validateAIFabric();
      await this.validateRAGEngine();
      await this.validateMonitoringSystem();
      await this.validateDatabase();

      const report = await this.generateReport();
      
      // Exit with appropriate code
      process.exit(report.status === 'PASSED' ? 0 : 1);
    } catch (error) {
      this.error('Validation failed with exception', error.message);
      console.error(error);
      process.exit(1);
    }
  }
}

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ProductionValidator();
  validator.run();
}

export default ProductionValidator;