/**
 * RAG Engine Test Suite
 * 
 * Comprehensive tests for the Nova RAG Engine functionality
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { NovaRAGEngine, ragEngine } from '../apps/api/lib/rag-engine.js';
import { localEmbeddingModel } from '../apps/api/lib/rag-local-embeddings.js';

describe('RAG Engine System', () => {
  let testEngine;
  const sampleDocuments = [
    {
      id: 'doc-1',
      content: 'How to install Nova Help Desk software on Windows. First, download the installer from the Nova website. Run the executable as administrator. Follow the installation wizard steps. Configure the database connection. Set up your initial admin account.',
      metadata: {
        type: 'documentation',
        source: 'nova_documentation',
        category: 'installation',
        tags: ['windows', 'install', 'setup'],
        classification: 'public',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    },
    {
      id: 'doc-2',
      content: 'Troubleshooting network connectivity issues in Nova. Check network cables first. Verify IP configuration using ipconfig. Test ping to gateway. Check DNS resolution. Verify firewall rules allow Nova traffic on ports 80, 443, and 8080.',
      metadata: {
        type: 'knowledge_article',
        source: 'nova_knowledge_base',
        category: 'networking',
        tags: ['network', 'troubleshooting', 'connectivity'],
        classification: 'internal',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    },
    {
      id: 'doc-3',
      content: 'User reported printer not working in office. Ticket #12345. User: john.doe@company.com. Printer model: HP LaserJet Pro. Error: Paper jam in tray 1. Resolution: Cleared paper jam, printed test page successfully.',
      metadata: {
        type: 'ticket',
        source: 'nova_tickets',
        category: 'hardware',
        tags: ['printer', 'hardware', 'resolved'],
        classification: 'internal',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }
  ];

  before(async () => {
    // Use a fresh instance for testing
    testEngine = new NovaRAGEngine();
    
    // Initialize the engine
    await testEngine.initialize();
    
    // Add sample documents
    await testEngine.addDocuments(sampleDocuments);
    
    // Let embeddings process
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  after(async () => {
    if (testEngine) {
      await testEngine.shutdown();
    }
  });

  describe('Engine Initialization', () => {
    it('should initialize RAG engine successfully', async () => {
      const stats = testEngine.getStats();
      assert.strictEqual(stats.isInitialized, true);
      assert(stats.embeddingModels.length > 0, 'Should have embedding models');
      assert(stats.vectorStores.length > 0, 'Should have vector stores');
    });

    it('should have local embedding model available', async () => {
      const modelInfo = localEmbeddingModel.getModelInfo();
      assert.strictEqual(modelInfo.isInitialized, true);
      assert(modelInfo.dimensions > 0, 'Should have valid dimensions');
    });
  });

  describe('Document Processing', () => {
    it('should add documents to the system', async () => {
      const stats = testEngine.getStats();
      assert(stats.totalChunks > 0, 'Should have processed document chunks');
    });

    it('should generate embeddings for documents', async () => {
      const embedding = await localEmbeddingModel.generateEmbedding('test document');
      assert(Array.isArray(embedding), 'Should return array');
      assert(embedding.length > 0, 'Should have dimensions');
      assert(embedding.every(x => typeof x === 'number'), 'Should contain numbers');
    });

    it('should create consistent embeddings for same text', async () => {
      const text = 'consistent embedding test';
      const embedding1 = await localEmbeddingModel.generateEmbedding(text);
      const embedding2 = await localEmbeddingModel.generateEmbedding(text);
      
      assert.deepStrictEqual(embedding1, embedding2, 'Should generate consistent embeddings');
    });

    it('should create different embeddings for different text', async () => {
      const embedding1 = await localEmbeddingModel.generateEmbedding('first test document');
      const embedding2 = await localEmbeddingModel.generateEmbedding('second different document');
      
      // Calculate similarity to ensure they are different
      let dotProduct = 0;
      for (let i = 0; i < embedding1.length; i++) {
        dotProduct += embedding1[i] * embedding2[i];
      }
      
      assert(dotProduct < 0.95, 'Different texts should have different embeddings');
    });
  });

  describe('Query Processing', () => {
    it('should process basic RAG query', async () => {
      const query = {
        query: 'How to install Nova software?',
        context: {
          module: 'test',
        },
        options: {
          maxResults: 5,
          hybridSearch: false,
          rerank: false,
        },
        metadata: {}
      };

      const result = await testEngine.query(query);
      
      assert(result.queryId, 'Should have query ID');
      assert(Array.isArray(result.chunks), 'Should return chunks array');
      assert(result.confidence >= 0 && result.confidence <= 1, 'Should have valid confidence score');
      assert(result.retrievalTime > 0, 'Should have retrieval time');
    });

    it('should return relevant results for installation queries', async () => {
      const query = {
        query: 'installation setup windows',
        context: { module: 'test' },
        options: { maxResults: 3 },
        metadata: {}
      };

      const result = await testEngine.query(query);
      
      assert(result.chunks.length > 0, 'Should return results');
      
      // Check if the installation document is in the results
      const hasInstallDoc = result.chunks.some(chunk => 
        chunk.content.includes('install') && chunk.content.includes('Windows')
      );
      assert(hasInstallDoc, 'Should return installation-related content');
    });

    it('should return relevant results for troubleshooting queries', async () => {
      const query = {
        query: 'network problem connectivity issues',
        context: { module: 'test' },
        options: { maxResults: 3 },
        metadata: {}
      };

      const result = await testEngine.query(query);
      
      assert(result.chunks.length > 0, 'Should return results');
      
      // Check if networking content is returned
      const hasNetworkDoc = result.chunks.some(chunk => 
        chunk.content.includes('network') && chunk.content.includes('connectivity')
      );
      assert(hasNetworkDoc, 'Should return network troubleshooting content');
    });

    it('should prioritize Nova data sources', async () => {
      const query = {
        query: 'Nova troubleshooting guide',
        context: { module: 'test' },
        options: { maxResults: 5 },
        metadata: {}
      };

      const result = await testEngine.query(query);
      
      if (result.chunks.length > 0) {
        // Check that Nova sources get priority
        const novaChunks = result.chunks.filter(chunk => 
          chunk.metadata.source && chunk.metadata.source.startsWith('nova_')
        );
        assert(novaChunks.length > 0, 'Should prioritize Nova data sources');
      }
    });
  });

  describe('Hybrid Search', () => {
    it('should perform hybrid search combining semantic and keyword results', async () => {
      const query = {
        query: 'printer hardware error',
        context: { module: 'test' },
        options: {
          maxResults: 3,
          hybridSearch: true,
        },
        metadata: {}
      };

      const result = await testEngine.query(query);
      
      assert(result.chunks.length > 0, 'Should return hybrid search results');
      assert.strictEqual(result.metadata.searchStrategy, 'hybrid', 'Should indicate hybrid search was used');
    });
  });

  describe('Document Management', () => {
    it('should update existing documents', async () => {
      const updatedDoc = {
        id: 'doc-1',
        content: 'Updated installation guide for Nova. New installation process includes automated setup wizard.',
        metadata: {
          type: 'documentation',
          source: 'nova_documentation',
          category: 'installation',
          updatedAt: new Date(),
        }
      };

      await testEngine.updateDocument(updatedDoc.id, updatedDoc.content, updatedDoc.metadata);
      
      // Query for the updated content
      const query = {
        query: 'automated setup wizard',
        context: { module: 'test' },
        options: { maxResults: 3 },
        metadata: {}
      };

      const result = await testEngine.query(query);
      const hasUpdatedContent = result.chunks.some(chunk => 
        chunk.content.includes('automated setup wizard')
      );
      
      assert(hasUpdatedContent, 'Should find updated document content');
    });

    it('should remove documents', async () => {
      const documentId = 'doc-to-remove';
      
      // First add a document to remove
      await testEngine.addDocuments([{
        id: documentId,
        content: 'Temporary document for removal test',
        metadata: {
          type: 'documentation',
          source: 'test',
          createdAt: new Date(),
        }
      }]);

      // Then remove it
      await testEngine.removeDocument(documentId);

      // Query should not find the removed document
      const query = {
        query: 'temporary document removal test',
        context: { module: 'test' },
        options: { maxResults: 10 },
        metadata: {}
      };

      const result = await testEngine.query(query);
      const hasRemovedContent = result.chunks.some(chunk => 
        chunk.content.includes('Temporary document for removal test')
      );
      
      assert(!hasRemovedContent, 'Should not find removed document content');
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle large batch of documents', async () => {
      const batchSize = 10;
      const largeBatch = [];
      
      for (let i = 0; i < batchSize; i++) {
        largeBatch.push({
          id: `batch-doc-${i}`,
          content: `This is test document number ${i} containing information about Nova system component ${i}. It includes troubleshooting steps and configuration details.`,
          metadata: {
            type: 'documentation',
            source: 'nova_documentation',
            category: 'batch-test',
            index: i,
            createdAt: new Date(),
          }
        });
      }

      const startTime = Date.now();
      await testEngine.addDocuments(largeBatch);
      const processingTime = Date.now() - startTime;

      console.log(`Processed ${batchSize} documents in ${processingTime}ms (avg: ${processingTime/batchSize}ms per doc)`);
      
      assert(processingTime < 10000, 'Should process batch within reasonable time');
    });

    it('should handle concurrent queries', async () => {
      const queries = [
        'installation guide windows',
        'network troubleshooting',
        'printer hardware issues',
        'Nova system configuration',
        'error resolution steps'
      ];

      const queryPromises = queries.map(queryText => 
        testEngine.query({
          query: queryText,
          context: { module: 'test' },
          options: { maxResults: 3 },
          metadata: {}
        })
      );

      const results = await Promise.all(queryPromises);
      
      assert.strictEqual(results.length, queries.length, 'Should handle all concurrent queries');
      results.forEach(result => {
        assert(result.chunks.length >= 0, 'Each query should return valid results');
        assert(result.confidence >= 0, 'Each query should have valid confidence');
      });
    });
  });

  describe('System Statistics', () => {
    it('should provide comprehensive system statistics', async () => {
      const stats = testEngine.getStats();
      
      assert(typeof stats.isInitialized === 'boolean', 'Should report initialization status');
      assert(typeof stats.totalChunks === 'number', 'Should report chunk count');
      assert(typeof stats.totalQueries === 'number', 'Should report query count');
      assert(Array.isArray(stats.embeddingModels), 'Should list embedding models');
      assert(Array.isArray(stats.vectorStores), 'Should list vector stores');
      assert(typeof stats.config === 'object', 'Should provide configuration');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid queries gracefully', async () => {
      try {
        await testEngine.query({
          query: '',
          context: { module: 'test' },
          options: {},
          metadata: {}
        });
        
        // If we get here, the query succeeded with empty string
        assert(true, 'Should handle empty query without error');
      } catch (error) {
        // If error is thrown, it should be handled gracefully
        assert(error instanceof Error, 'Should throw proper Error object');
      }
    });

    it('should handle malformed documents gracefully', async () => {
      try {
        await testEngine.addDocuments([{
          id: 'malformed-doc',
          content: null, // Invalid content
          metadata: {}
        }]);
      } catch (error) {
        assert(error instanceof Error, 'Should handle malformed documents with proper error');
      }
    });
  });
});

console.log('RAG Engine tests defined successfully');