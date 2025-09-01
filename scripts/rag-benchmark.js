/**
 * RAG Engine Performance Benchmark
 * 
 * This script benchmarks the RAG engine performance with various
 * workloads to ensure it meets industry standards.
 */

import { performance } from 'perf_hooks';

// Import the RAG engine
let ragEngine;
let isTypeScriptEngine = false;

try {
  const ragModule = await import('../apps/api/lib/rag-engine.ts');
  ragEngine = ragModule.ragEngine;
  isTypeScriptEngine = true;
  console.log('🚀 Using TypeScript RAG engine for benchmarks');
} catch (error) {
  const ragModule = await import('../apps/api/lib/rag-engine.js');
  ragEngine = ragModule.ragEngine;
  console.log('📊 Using JavaScript RAG engine for benchmarks');
}

// Benchmark configuration
const BENCHMARK_CONFIG = {
  documentsToAdd: 100,
  queriesToRun: 50,
  concurrentQueries: 10,
  documentSizes: {
    small: 500,
    medium: 2000, 
    large: 5000
  }
};

// Sample documents for testing
function generateTestDocuments(count, size = 'medium') {
  const templates = [
    'Network troubleshooting guide for {topic}. Step 1: Check connectivity. Step 2: Verify configuration. Step 3: Test resolution.',
    'User account management procedures for {topic}. Create accounts, assign permissions, monitor access, and maintain security.',
    'Email configuration instructions for {topic}. Set up SMTP, configure clients, troubleshoot delivery issues.',
    'Password reset procedures for {topic}. Verify identity, generate new password, communicate securely to user.',
    'Software installation guide for {topic}. Download installer, check requirements, run setup, verify installation.',
    'Hardware maintenance checklist for {topic}. Inspect components, clean systems, update firmware, test functionality.',
    'Security policy documentation for {topic}. Define access controls, implement monitoring, respond to incidents.',
    'Backup and recovery procedures for {topic}. Schedule backups, test restoration, maintain offsite copies.'
  ];

  const topics = [
    'Windows 10', 'Office 365', 'Active Directory', 'VPN Access', 'Printer Setup',
    'Mobile Devices', 'Antivirus Software', 'File Sharing', 'Remote Desktop', 'Wi-Fi Networks',
    'Database Systems', 'Web Applications', 'API Integration', 'Cloud Services', 'Monitoring Tools'
  ];

  const documents = [];
  const targetLength = BENCHMARK_CONFIG.documentSizes[size];

  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    const topic = topics[i % topics.length];
    let content = template.replace('{topic}', topic);
    
    // Expand content to reach target length
    while (content.length < targetLength) {
      content += ` Additional details about ${topic} configuration and troubleshooting steps. `;
      content += `Common issues include connectivity problems, authentication failures, and configuration errors. `;
      content += `Resolution typically involves checking settings, verifying credentials, and testing functionality. `;
    }

    documents.push({
      id: `bench-doc-${i}`,
      content: content.substring(0, targetLength),
      metadata: {
        source: 'benchmark',
        type: i % 2 === 0 ? 'knowledge_article' : 'documentation',
        category: ['networking', 'security', 'software', 'hardware'][i % 4],
        classification: i % 3 === 0 ? 'public' : 'internal',
        tags: ['benchmark', 'test', topic.toLowerCase().replace(' ', '-')],
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 30), // Random date within 30 days
        updatedAt: new Date(),
        priority: Math.floor(Math.random() * 5) + 1
      }
    });
  }

  return documents;
}

// Generate test queries
function generateTestQueries(count) {
  const queryTemplates = [
    'How to troubleshoot {issue}',
    'Steps to configure {system}',
    'Fix {problem} in {application}',
    'Setup guide for {component}',
    'Error resolution for {error_type}',
    'Best practices for {topic}',
    'Installation instructions for {software}',
    'Security settings for {platform}'
  ];

  const issues = ['network connectivity', 'login problems', 'email sync', 'printing'];
  const systems = ['VPN', 'Wi-Fi', 'DNS', 'firewall'];
  const problems = ['slow performance', 'connection timeout', 'authentication error'];
  const applications = ['Outlook', 'Teams', 'browser', 'antivirus'];
  const components = ['printer', 'scanner', 'webcam', 'microphone'];
  const errorTypes = ['404 errors', '500 errors', 'timeout errors', 'permission denied'];
  const topics = ['data backup', 'password management', 'file sharing', 'remote access'];
  const software = ['Office 365', 'Zoom', 'Chrome', 'Windows updates'];
  const platforms = ['Windows', 'macOS', 'mobile devices', 'cloud services'];

  const replacements = {
    '{issue}': issues,
    '{system}': systems,
    '{problem}': problems,
    '{application}': applications,
    '{component}': components,
    '{error_type}': errorTypes,
    '{topic}': topics,
    '{software}': software,
    '{platform}': platforms
  };

  const queries = [];
  for (let i = 0; i < count; i++) {
    let query = queryTemplates[i % queryTemplates.length];
    
    // Replace placeholders
    Object.entries(replacements).forEach(([placeholder, options]) => {
      if (query.includes(placeholder)) {
        query = query.replace(placeholder, options[Math.floor(Math.random() * options.length)]);
      }
    });

    queries.push({
      id: `bench-query-${i}`,
      query,
      context: {
        userId: `user-${Math.floor(Math.random() * 100)}`,
        module: 'benchmark',
        sessionId: `session-${Math.floor(Math.random() * 20)}`
      },
      options: {
        maxResults: Math.floor(Math.random() * 8) + 3, // 3-10 results
        minScore: 0.3 + Math.random() * 0.4, // 0.3-0.7
        rerank: Math.random() > 0.5,
        hybridSearch: Math.random() > 0.5,
        expandQuery: Math.random() > 0.7
      },
      metadata: {
        benchmark: true,
        timestamp: new Date()
      }
    });
  }

  return queries;
}

// Benchmark functions
async function benchmarkDocumentProcessing() {
  console.log('\n📄 Document Processing Benchmark');
  console.log('================================');

  const sizes = ['small', 'medium', 'large'];
  const results = {};

  for (const size of sizes) {
    const documents = generateTestDocuments(20, size);
    
    const startTime = performance.now();
    
    try {
      if (isTypeScriptEngine && ragEngine.addDocuments) {
        await ragEngine.addDocuments(documents);
      } else if (ragEngine.addDocument) {
        // Fallback for JS engine
        for (const doc of documents) {
          await ragEngine.addDocument(doc);
        }
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      const docsPerSecond = (documents.length / duration) * 1000;
      
      results[size] = {
        documents: documents.length,
        duration: Math.round(duration),
        docsPerSecond: Math.round(docsPerSecond * 100) / 100,
        avgDocSize: BENCHMARK_CONFIG.documentSizes[size]
      };
      
      console.log(`${size.toUpperCase()}: ${documents.length} docs in ${Math.round(duration)}ms (${Math.round(docsPerSecond * 100) / 100} docs/sec)`);
      
    } catch (error) {
      console.log(`${size.toUpperCase()}: Skipped (${error.message})`);
      results[size] = { error: error.message };
    }
  }

  return results;
}

async function benchmarkQueryPerformance() {
  console.log('\n🔍 Query Performance Benchmark');
  console.log('==============================');

  const queries = generateTestQueries(BENCHMARK_CONFIG.queriesToRun);
  const results = [];

  for (const query of queries) {
    const startTime = performance.now();
    
    try {
      let result;
      if (isTypeScriptEngine && ragEngine.query) {
        result = await ragEngine.query(query);
      } else if (ragEngine.search) {
        // Fallback for JS engine
        result = await ragEngine.search(query.query, query.options);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      results.push({
        queryId: query.id,
        duration: Math.round(duration * 100) / 100,
        resultsCount: result?.chunks?.length || result?.results?.length || 0,
        confidence: result?.confidence || 0
      });
      
    } catch (error) {
      results.push({
        queryId: query.id,
        error: error.message,
        duration: 0
      });
    }
  }

  // Calculate statistics
  const successfulQueries = results.filter(r => !r.error);
  const avgDuration = successfulQueries.reduce((sum, r) => sum + r.duration, 0) / successfulQueries.length;
  const minDuration = Math.min(...successfulQueries.map(r => r.duration));
  const maxDuration = Math.max(...successfulQueries.map(r => r.duration));
  const avgResults = successfulQueries.reduce((sum, r) => sum + r.resultsCount, 0) / successfulQueries.length;
  const avgConfidence = successfulQueries.reduce((sum, r) => sum + r.confidence, 0) / successfulQueries.length;

  console.log(`Processed: ${successfulQueries.length}/${queries.length} queries`);
  console.log(`Average duration: ${Math.round(avgDuration * 100) / 100}ms`);
  console.log(`Duration range: ${Math.round(minDuration * 100) / 100}ms - ${Math.round(maxDuration * 100) / 100}ms`);
  console.log(`Average results: ${Math.round(avgResults * 100) / 100} per query`);
  console.log(`Average confidence: ${Math.round(avgConfidence * 1000) / 1000}`);

  return {
    totalQueries: queries.length,
    successfulQueries: successfulQueries.length,
    avgDuration: Math.round(avgDuration * 100) / 100,
    minDuration: Math.round(minDuration * 100) / 100,
    maxDuration: Math.round(maxDuration * 100) / 100,
    avgResults: Math.round(avgResults * 100) / 100,
    avgConfidence: Math.round(avgConfidence * 1000) / 1000
  };
}

async function benchmarkConcurrentQueries() {
  console.log('\n⚡ Concurrent Query Benchmark');
  console.log('=============================');

  const queries = generateTestQueries(BENCHMARK_CONFIG.concurrentQueries);
  
  const startTime = performance.now();
  
  try {
    const promises = queries.map(async (query) => {
      try {
        if (isTypeScriptEngine && ragEngine.query) {
          return await ragEngine.query(query);
        } else if (ragEngine.search) {
          return await ragEngine.search(query.query, query.options);
        }
      } catch (error) {
        return { error: error.message };
      }
    });

    const results = await Promise.all(promises);
    const endTime = performance.now();
    const totalDuration = endTime - startTime;
    
    const successful = results.filter(r => !r.error);
    const avgDurationPerQuery = totalDuration / queries.length;
    const queriesPerSecond = (queries.length / totalDuration) * 1000;

    console.log(`Concurrent queries: ${queries.length}`);
    console.log(`Total duration: ${Math.round(totalDuration)}ms`);
    console.log(`Successful: ${successful.length}/${queries.length}`);
    console.log(`Avg per query: ${Math.round(avgDurationPerQuery * 100) / 100}ms`);
    console.log(`Queries/second: ${Math.round(queriesPerSecond * 100) / 100}`);

    return {
      concurrentQueries: queries.length,
      totalDuration: Math.round(totalDuration),
      successful: successful.length,
      avgPerQuery: Math.round(avgDurationPerQuery * 100) / 100,
      queriesPerSecond: Math.round(queriesPerSecond * 100) / 100
    };

  } catch (error) {
    console.log(`Concurrent benchmark failed: ${error.message}`);
    return { error: error.message };
  }
}

async function benchmarkMemoryUsage() {
  console.log('\n💾 Memory Usage Benchmark');
  console.log('=========================');

  const initialMemory = process.memoryUsage();
  
  // Add documents and measure memory growth
  const documents = generateTestDocuments(50, 'medium');
  
  let memoryAfterDocs;
  try {
    if (isTypeScriptEngine && ragEngine.addDocuments) {
      await ragEngine.addDocuments(documents);
    } else if (ragEngine.addDocument) {
      for (const doc of documents) {
        await ragEngine.addDocument(doc);
      }
    }
    memoryAfterDocs = process.memoryUsage();
  } catch (error) {
    console.log(`Memory benchmark skipped: ${error.message}`);
    return { error: error.message };
  }

  // Run queries and measure memory
  const queries = generateTestQueries(20);
  for (const query of queries) {
    try {
      if (isTypeScriptEngine && ragEngine.query) {
        await ragEngine.query(query);
      } else if (ragEngine.search) {
        await ragEngine.search(query.query, query.options);
      }
    } catch (error) {
      // Continue with other queries
    }
  }
  
  const finalMemory = process.memoryUsage();

  // Calculate memory differences
  const memoryDelta = {
    heapUsed: (memoryAfterDocs.heapUsed - initialMemory.heapUsed) / 1024 / 1024,
    heapTotal: (memoryAfterDocs.heapTotal - initialMemory.heapTotal) / 1024 / 1024,
    external: (memoryAfterDocs.external - initialMemory.external) / 1024 / 1024,
    rss: (memoryAfterDocs.rss - initialMemory.rss) / 1024 / 1024
  };

  const queryMemoryDelta = {
    heapUsed: (finalMemory.heapUsed - memoryAfterDocs.heapUsed) / 1024 / 1024,
    rss: (finalMemory.rss - memoryAfterDocs.rss) / 1024 / 1024
  };

  console.log(`Initial memory: ${Math.round(initialMemory.heapUsed / 1024 / 1024)}MB heap, ${Math.round(initialMemory.rss / 1024 / 1024)}MB RSS`);
  console.log(`After adding ${documents.length} docs: +${Math.round(memoryDelta.heapUsed * 100) / 100}MB heap, +${Math.round(memoryDelta.rss * 100) / 100}MB RSS`);
  console.log(`After ${queries.length} queries: +${Math.round(queryMemoryDelta.heapUsed * 100) / 100}MB heap, +${Math.round(queryMemoryDelta.rss * 100) / 100}MB RSS`);
  console.log(`Final memory: ${Math.round(finalMemory.heapUsed / 1024 / 1024)}MB heap, ${Math.round(finalMemory.rss / 1024 / 1024)}MB RSS`);

  return {
    initialMemoryMB: Math.round(initialMemory.heapUsed / 1024 / 1024),
    finalMemoryMB: Math.round(finalMemory.heapUsed / 1024 / 1024),
    documentMemoryDeltaMB: Math.round(memoryDelta.heapUsed * 100) / 100,
    queryMemoryDeltaMB: Math.round(queryMemoryDelta.heapUsed * 100) / 100,
    documentsProcessed: documents.length,
    queriesProcessed: queries.length
  };
}

// Main benchmark runner
async function runBenchmarks() {
  console.log('🎯 Nova Universe RAG Engine Performance Benchmark');
  console.log('================================================');
  console.log(`Engine: ${isTypeScriptEngine ? 'TypeScript (Full Features)' : 'JavaScript (Basic Features)'}`);
  console.log(`Node.js: ${process.version}`);
  console.log(`Platform: ${process.platform} ${process.arch}`);
  console.log(`Memory: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB RSS`);
  
  try {
    // Initialize RAG engine
    if (ragEngine.initialize) {
      await ragEngine.initialize();
    }
    
    const benchmarkResults = {};

    // Run benchmarks
    benchmarkResults.documentProcessing = await benchmarkDocumentProcessing();
    benchmarkResults.queryPerformance = await benchmarkQueryPerformance();
    benchmarkResults.concurrentQueries = await benchmarkConcurrentQueries();
    benchmarkResults.memoryUsage = await benchmarkMemoryUsage();

    // Generate summary report
    console.log('\n📊 Benchmark Summary');
    console.log('===================');
    
    if (benchmarkResults.queryPerformance.avgDuration) {
      const avgDuration = benchmarkResults.queryPerformance.avgDuration;
      console.log(`✅ Query Performance: ${avgDuration}ms average (${avgDuration < 200 ? 'EXCELLENT' : avgDuration < 1000 ? 'GOOD' : 'NEEDS OPTIMIZATION'})`);
    }
    
    if (benchmarkResults.concurrentQueries.queriesPerSecond) {
      const qps = benchmarkResults.concurrentQueries.queriesPerSecond;
      console.log(`✅ Throughput: ${qps} queries/second (${qps > 50 ? 'EXCELLENT' : qps > 20 ? 'GOOD' : 'NEEDS OPTIMIZATION'})`);
    }
    
    if (benchmarkResults.memoryUsage.documentMemoryDeltaMB) {
      const memPerDoc = benchmarkResults.memoryUsage.documentMemoryDeltaMB / benchmarkResults.memoryUsage.documentsProcessed;
      console.log(`✅ Memory Efficiency: ${Math.round(memPerDoc * 1000) / 1000}MB per document (${memPerDoc < 0.1 ? 'EXCELLENT' : memPerDoc < 0.5 ? 'GOOD' : 'NEEDS OPTIMIZATION'})`);
    }

    // Write results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsFile = `/tmp/rag-benchmark-${timestamp}.json`;
    
    try {
      const fs = await import('fs/promises');
      await fs.writeFile(resultsFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        engine: isTypeScriptEngine ? 'typescript' : 'javascript',
        config: BENCHMARK_CONFIG,
        results: benchmarkResults,
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch
        }
      }, null, 2));
      
      console.log(`\n📄 Detailed results saved to: ${resultsFile}`);
    } catch (error) {
      console.log(`\n⚠️  Could not save detailed results: ${error.message}`);
    }

    console.log('\n🎉 Benchmark completed successfully!');

  } catch (error) {
    console.error('\n❌ Benchmark failed:', error);
    process.exit(1);
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Benchmark interrupted by user');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught exception during benchmark:', error);
  process.exit(1);
});

// Run the benchmarks
runBenchmarks().catch(console.error);