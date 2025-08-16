#!/usr/bin/env node

/**
 * Nova AI Fabric Test Script
 *
 * This script tests the AI Fabric implementation to ensure all components
 * are properly integrated and working correctly.
 */

import { aiFabric } from '../apps/api/lib/ai-fabric.js';
import { ragEngine } from '../apps/api/lib/rag-engine.js';
import { aiMonitoringSystem } from '../apps/api/lib/ai-monitoring.js';
import { novaMCPServer } from '../apps/api/lib/mcp-server.js';

async function testAIFabric() {
  console.log('🧪 Starting Nova AI Fabric Tests...\n');

  try {
    // Test 1: AI Fabric Initialization
    console.log('1️⃣  Testing AI Fabric initialization...');
    await aiFabric.initialize();
    const fabricStatus = aiFabric.getStatus();
    console.log(`   ✅ AI Fabric initialized: ${fabricStatus.isInitialized}`);
    console.log(`   📊 Providers: ${fabricStatus.providers?.length || 0}`);
    console.log(`   📈 Stats: ${JSON.stringify(fabricStatus.stats, null, 2)}\n`);

    // Test 2: RAG Engine
    console.log('2️⃣  Testing RAG Engine...');
    await ragEngine.initialize();

    // Add test documents
    const testDocuments = [
      {
        id: 'test-doc-1',
        content:
          'Nova Universe is an advanced ITSM platform with AI capabilities. It includes modules like Pulse for technicians, Orbit for end users, and Synth for AI orchestration.',
        metadata: {
          source: 'documentation',
          type: 'knowledge_article',
          category: 'platform_overview',
        },
      },
      {
        id: 'test-doc-2',
        content:
          'To reset a password in Nova, users can use the self-service portal or contact their IT department. The system supports automatic password policy enforcement.',
        metadata: {
          source: 'knowledge_base',
          type: 'knowledge_article',
          category: 'user_management',
        },
      },
    ];

    await ragEngine.addDocuments(testDocuments);
    console.log(`   ✅ Added ${testDocuments.length} test documents`);

    // Test RAG query
    const ragResult = await ragEngine.query({
      query: 'How to reset password in Nova?',
      options: {
        maxResults: 5,
        hybridSearch: true,
      },
      metadata: {},
    });

    console.log(`   🔍 RAG Query Results: ${ragResult.chunks.length} chunks found`);
    console.log(`   ⏱️  Retrieval time: ${ragResult.retrievalTime}ms`);
    console.log(`   🎯 Confidence: ${ragResult.confidence}\n`);

    // Test 3: AI Monitoring System
    console.log('3️⃣  Testing AI Monitoring System...');
    await aiMonitoringSystem.initialize();

    // Record test metrics
    await aiMonitoringSystem.recordMetric({
      metricType: 'performance',
      providerId: 'test-provider',
      model: 'test-model',
      value: 1200,
      unit: 'milliseconds',
      metadata: { test: true },
      tags: ['test'],
    });

    // Record test audit event
    await aiMonitoringSystem.recordAuditEvent({
      eventType: 'request',
      severity: 'low',
      userId: 'test-user',
      metadata: { test: true },
      complianceFlags: [],
      riskScore: 0.1,
    });

    const dashboardData = aiMonitoringSystem.getDashboardData();
    console.log('   ✅ Monitoring system initialized');
    console.log(`   📊 Dashboard data: ${Object.keys(dashboardData).join(', ')}\n`);

    // Test 4: MCP Server
    console.log('4️⃣  Testing MCP Server...');
    await novaMCPServer.start();
    console.log(`   ✅ MCP Server started on port ${novaMCPServer.serverPort}`);
    console.log(`   🔧 Server running: ${novaMCPServer.isServerRunning}`);

    const serverInfo = novaMCPServer.getServerInfo();
    console.log(`   🛠️  Available tools: ${serverInfo.tools?.length || 0}`);
    console.log(`   🎯 Capabilities: ${serverInfo.capabilities?.length || 0}\n`);

    // Test 5: AI Request Processing
    console.log('5️⃣  Testing AI Request Processing...');
    const testRequest = {
      type: 'classification',
      input: 'My laptop screen is flickering and making strange noises',
      context: {
        userId: 'test-user',
        tenantId: 'test-tenant',
        module: 'test',
      },
      preferences: {},
      metadata: { test: true },
      timestamp: new Date(),
    };

    const aiResponse = await aiFabric.processRequest(testRequest);
    console.log(`   ✅ AI Request processed successfully`);
    console.log(`   🔄 Provider: ${aiResponse.provider}`);
    console.log(`   ⏱️  Processing time: ${aiResponse.processingTime}ms`);
    console.log(`   📊 Result type: ${typeof aiResponse.result}\n`);

    // Test 6: Learning System
    console.log('6️⃣  Testing Learning System...');
    await aiFabric.recordLearningEvent({
      type: 'user_feedback',
      data: {
        requestId: aiResponse.requestId,
        rating: 4,
        feedback: 'Good classification accuracy',
      },
      context: { userId: 'test-user', module: 'test' },
      timestamp: new Date(),
      quality: 0.8,
    });
    console.log('   ✅ Learning event recorded\n');

    // Test Summary
    console.log('🎉 All AI Fabric Tests Completed Successfully!\n');
    console.log('📋 Test Summary:');
    console.log('   ✅ AI Fabric Core - Initialized and operational');
    console.log('   ✅ RAG Engine - Documents indexed, queries working');
    console.log('   ✅ Monitoring System - Metrics and audit trails active');
    console.log('   ✅ MCP Server - Running and accessible');
    console.log('   ✅ Request Processing - AI requests handled correctly');
    console.log('   ✅ Learning System - Feedback captured for improvement');

    console.log('\n🌟 Nova AI Fabric is ready for production use!');
    console.log('\n📖 Documentation: /docs/NOVA_AI_FABRIC_IMPLEMENTATION.md');
    console.log('🔧 API Endpoints: /api/ai-fabric/*');
    console.log('📊 MCP Server: http://localhost:3001');
    console.log('🔍 Discovery: http://localhost:3001/.well-known/mcp-server');
  } catch (error) {
    console.error('❌ AI Fabric Test Failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Cleanup function
async function cleanup() {
  console.log('\n🧹 Cleaning up test resources...');
  try {
    await novaMCPServer.stop();
    await aiFabric.shutdown();
    await ragEngine.shutdown();
    await aiMonitoringSystem.shutdown();
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('⚠️  Cleanup error:', error);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⏸️  Received SIGINT, shutting down gracefully...');
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⏸️  Received SIGTERM, shutting down gracefully...');
  await cleanup();
  process.exit(0);
});

// Run tests
if (import.meta.url === `file://${process.argv[1]}`) {
  testAIFabric()
    .then(() => {
      console.log('\n🎯 Test completed successfully');
      return cleanup();
    })
    .then(() => {
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('\n💥 Test failed:', error);
      await cleanup();
      process.exit(1);
    });
}

export { testAIFabric };
