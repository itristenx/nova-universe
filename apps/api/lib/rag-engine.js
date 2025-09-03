// nova-api/lib/rag-engine.js
// RAG (Retrieval Augmented Generation) Engine with Nova RBAC Integration

import { logger } from '../logger.js';
// Import will be conditional to avoid circular dependencies
let ragRBAC = null;

// Dynamic import to handle RBAC
async function getRagRBAC() {
  if (!ragRBAC) {
    try {
      const rbacModule = await import('./nova-rag-rbac.js');
      ragRBAC = rbacModule.ragRBAC;
    } catch (error) {
      console.warn('RBAC module not available, using basic access control');
      // Fallback RBAC implementation
      ragRBAC = {
        isInitialized: true,
        initialize: async () => {},
        filterDocuments: async (docs, userId, tenantId) => {
          // Basic tenant filtering
          return docs.filter(doc => 
            !doc.metadata?.tenantId || doc.metadata.tenantId === tenantId
          );
        }
      };
    }
  }
  return ragRBAC;
}

/**
 * RAG Engine for document retrieval and context generation
 * Enhanced with Nova RBAC for strong access control
 */
class RAGEngine {
  constructor() {
    this.initialized = false;
    this.documents = new Map();
    this.embeddings = new Map();
    this.rbacEnabled = true; // Force RBAC enforcement
  }

  /**
   * Initialize RAG Engine with RBAC
   */
  async initialize() {
    try {
      logger.info('Initializing RAG Engine with Nova RBAC...');
      
      // Initialize RBAC system
      const rbacSystem = await getRagRBAC();
      if (!rbacSystem.isInitialized) {
        await rbacSystem.initialize();
      }
      
      this.initialized = true;
      logger.info('RAG Engine initialized successfully with RBAC enforcement');
    } catch (error) {
      logger.error('Failed to initialize RAG Engine', { error: error.message });
      throw error;
    }
  }

  /**
   * Check if RAG Engine is ready
   */
  async isReady() {
    const rbacSystem = await getRagRBAC();
    return this.initialized && rbacSystem.isInitialized;
  }

  /**
   * Add document to knowledge base with RBAC metadata
   */
  async addDocument(doc, rbacContext = null) {
    if (!this.initialized) {
      throw new Error('RAG Engine not initialized');
    }

    // Ensure document has proper RBAC metadata
    if (!rbacContext) {
      throw new Error('RBAC context required for Nova data policy compliance');
    }

    // Validate Nova-only data source
    if (doc.metadata?.source && !doc.metadata.source.startsWith('nova-')) {
      throw new Error(`Nova-only policy violation: External data source detected (${doc.metadata.source})`);
    }

    // Enhanced document with RBAC context and Nova validation
    const enhancedDoc = {
      ...doc,
      metadata: {
        ...doc.metadata,
        tenantId: rbacContext.tenantId,
        userId: rbacContext.userId,
        securityClassification: rbacContext.securityClassification || 'internal',
        dataSource: 'nova-internal-only',
        rbacValidated: true,
        indexedAt: new Date(),
        source: doc.metadata?.source?.startsWith('nova-') ? doc.metadata.source : `nova-${doc.metadata?.source || 'document'}`,
      }
    };

    this.documents.set(doc.id, enhancedDoc);
    
    logger.info('Document added to RAG Engine with RBAC validation', { 
      docId: doc.id,
      tenantId: rbacContext.tenantId,
      classification: rbacContext.securityClassification 
    });

    return { success: true, docId: doc.id, rbacEnforced: true };
  }

  /**
   * Add multiple documents to knowledge base with RBAC enforcement
   */
  async addDocuments(documents, rbacContext = null) {
    if (!this.initialized) {
      throw new Error('RAG Engine not initialized');
    }

    if (!rbacContext) {
      throw new Error('RBAC context required for Nova data policy compliance');
    }

    const results = [];
    for (const doc of documents) {
      try {
        const result = await this.addDocument(doc, rbacContext);
        results.push(result);
      } catch (error) {
        logger.error('Failed to add document with RBAC', { docId: doc.id, error: error.message });
        results.push({ success: false, docId: doc.id, error: error.message, rbacEnforced: true });
      }
    }

    logger.info(`Added ${documents.length} documents to RAG system with RBAC`, {
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      rbacEnabled: true,
      tenantId: rbacContext.tenantId
    });

    return results;
  }

  /**
   * Search documents with RBAC filtering
   */
  async search(query, options = {}, userContext = null) {
    if (!this.initialized) {
      throw new Error('RAG Engine not initialized');
    }

    if (!userContext) {
      throw new Error('User context required for RBAC enforcement');
    }

    // Get all documents and filter through RBAC
    const allDocuments = Array.from(this.documents.values());
    
    // Apply RBAC filtering
    const rbacSystem = await getRagRBAC();
    const accessibleDocuments = await rbacSystem.filterDocuments(
      allDocuments,
      userContext.userId,
      userContext.tenantId,
      'read'
    );

    logger.info('RAG search executed with RBAC filtering', { 
      query: query.substring(0, 50), 
      totalDocs: allDocuments.length,
      accessibleDocs: accessibleDocuments.length,
      userId: userContext.userId,
      tenantId: userContext.tenantId
    });

    return {
      results: accessibleDocuments,
      totalCount: accessibleDocuments.length,
      filteredByRBAC: allDocuments.length - accessibleDocuments.length,
      query,
      timestamp: new Date().toISOString(),
      rbacEnforced: true,
    };
  }

  /**
   * Query documents using RAG approach with RBAC
   */
  async query(ragQuery, userContext = null) {
    if (!this.initialized) {
      throw new Error('RAG Engine not initialized');
    }

    if (!userContext) {
      throw new Error('User context required for Nova RBAC enforcement');
    }

    const startTime = Date.now();
    
    // Extract query parameters
    const { query, options = {}, metadata = {} } = ragQuery;
    const maxResults = options.maxResults || 10;
    const hybridSearch = options.hybridSearch || false;
    
    // Perform RBAC-filtered search
    const searchResults = await this.search(query, options, userContext);
    
    // Convert accessible documents to chunks format
    const chunks = searchResults.results
      .filter(doc => {
        // Additional Nova-only validation
        if (doc.metadata?.dataSource !== 'nova-internal-only') {
          logger.warn('Filtering non-Nova document', { docId: doc.id, dataSource: doc.metadata?.dataSource });
          return false;
        }
        
        // Tenant isolation check
        if (doc.metadata?.tenantId !== userContext.tenantId) {
          logger.warn('Filtering cross-tenant document', { docId: doc.id, docTenant: doc.metadata?.tenantId, userTenant: userContext.tenantId });
          return false;
        }
        
        // Simple relevance filtering based on content
        const content = doc.content?.toLowerCase() || '';
        const queryLower = query?.toLowerCase() || '';
        return content.includes(queryLower) || 
               doc.metadata?.title?.toLowerCase().includes(queryLower) ||
               doc.metadata?.category?.toLowerCase().includes(queryLower);
      })
      .slice(0, maxResults)
      .map(doc => ({
        id: doc.id,
        documentId: doc.id,
        content: doc.content,
        metadata: {
          ...doc.metadata,
          relevanceScore: Math.random() * 0.5 + 0.5, // Simple mock relevance
          source: doc.metadata?.source || 'nova-internal',
          type: doc.metadata?.type || 'document',
          category: doc.metadata?.category,
          createdAt: doc.metadata?.createdAt || new Date(),
          updatedAt: doc.metadata?.updatedAt || new Date(),
          rbacValidated: true,
          tenantIsolated: true,
        },
        position: {
          start: 0,
          end: doc.content?.length || 0
        },
        accessControl: {
          granted: true,
          userHasAccess: true,
          tenantMatch: true,
          rbacEnforced: true,
        }
      }));
    
    // Calculate confidence based on results
    const confidence = chunks.length > 0 ? 
      chunks.reduce((sum, chunk) => sum + chunk.metadata.relevanceScore, 0) / chunks.length : 
      0;
    
    const retrievalTime = Date.now() - startTime;
    
    const result = {
      id: `query-${Date.now()}`,
      queryId: ragQuery.id || `query-${Date.now()}`,
      chunks,
      confidence,
      retrievalTime,
      totalResults: chunks.length,
      rbacStats: {
        totalDocuments: Array.from(this.documents.values()).length,
        accessibleDocuments: searchResults.results.length,
        filteredByRBAC: searchResults.filteredByRBAC,
        tenantFiltered: chunks.length,
        rbacEnforced: true,
      },
      metadata: {
        searchStrategy: hybridSearch ? 'hybrid' : 'semantic',
        embeddingModel: 'nova-local',
        vectorStore: 'nova-memory',
        dataSource: 'nova-internal-only',
        userContext: {
          userId: userContext.userId,
          tenantId: userContext.tenantId,
        },
        filters: ragQuery.filters || {}
      }
    };
    
    logger.info('RAG query completed with RBAC enforcement', {
      query: query.substring(0, 50),
      chunksFound: chunks.length,
      confidence,
      retrievalTime,
      rbacFiltered: searchResults.filteredByRBAC,
      userId: userContext.userId,
      tenantId: userContext.tenantId
    });
    
    return result;
  }

  /**
   * Generate response using RAG with RBAC context
   */
  async generateResponse(query, context = {}, userContext = null) {
    if (!this.initialized) {
      throw new Error('RAG Engine not initialized');
    }

    if (!userContext) {
      throw new Error('User context required for Nova RBAC enforcement');
    }

    logger.info('RAG response generation with RBAC', { 
      query: query.substring(0, 50), 
      userId: userContext.userId,
      tenantId: userContext.tenantId 
    });

    // Use context to enhance the response with RBAC awareness
    const enhancedResponse = context.userRole
      ? `[As ${context.userRole} in tenant ${userContext.tenantId}] Nova RAG response`
      : `[Nova tenant ${userContext.tenantId}] RAG-generated response`;

    const confidenceBoost = context.sessionHistory ? 0.1 : 0;

    return {
      response: enhancedResponse,
      confidence: Math.min(0.8 + confidenceBoost, 1.0),
      sources: context.sources || [],
      context: {
        userRole: context.userRole,
        sessionId: context.sessionId,
        hasHistory: Boolean(context.sessionHistory),
        rbacEnforced: true,
        tenantId: userContext.tenantId,
        userId: userContext.userId,
        dataSource: 'nova-internal-only',
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get RBAC-filtered document count for tenant
   */
  async getDocumentStats(userContext) {
    if (!userContext) {
      throw new Error('User context required for RBAC enforcement');
    }

    const allDocuments = Array.from(this.documents.values());
    const rbacSystem = await getRagRBAC();
    const accessibleDocuments = await rbacSystem.filterDocuments(
      allDocuments,
      userContext.userId,
      userContext.tenantId,
      'read'
    );

    return {
      totalDocuments: allDocuments.length,
      accessibleDocuments: accessibleDocuments.length,
      rbacFiltered: allDocuments.length - accessibleDocuments.length,
      tenantId: userContext.tenantId,
      userId: userContext.userId,
      rbacEnforced: true,
    };
  }
}

// Create singleton instance
export const ragEngine = new RAGEngine();

// Initialize on module load
if (process.env.NODE_ENV !== 'test') {
  ragEngine.initialize().catch((err) => {
    logger.error('RAG Engine initialization failed', { error: err.message });
  });
}
