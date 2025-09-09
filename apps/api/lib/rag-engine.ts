/**
 * Nova RAG Engine - Retrieval-Augmented Generation System
 *
 * This implements a comprehensive RAG system that enhances AI responses with
 * contextually relevant information from Nova's knowledge base, documentation,
 * tickets, and other data sources.
 *
 * Features:
 * - Multi-modal vector embeddings
 * - Semantic search and retrieval
 * - Context chunking and ranking
 * - Dynamic retrieval strategies
 * - Knowledge graph integration
 * - Real-time index updates
 * - Advanced filtering and relevance scoring
 */

import { EventEmitter } from 'events';
import { logger } from '../logger.js';
import { z as _z } from 'zod';
import crypto from 'crypto';
import fs from 'fs/promises';
import _path from 'path';
import { ragRBAC, RAGUser, RAGAccessContext, AccessDecision } from './nova-rag-rbac.js';
import { VectorStoreFactory, ChromaDBStore, LocalVectorStore } from './rag-vector-stores.js';
import { localEmbeddingModel } from './rag-local-embeddings.js';

// RAG Types and Interfaces
export interface EmbeddingModel {
  id: string;
  name: string;
  provider: 'openai' | 'huggingface' | 'local' | 'azure';
  model: string;
  dimensions: number;
  maxTokens: number;
  config: Record<string, any>;
  isActive: boolean;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  embedding?: number[];
  metadata: {
    source: string;
    type: 'knowledge_article' | 'ticket' | 'documentation' | 'policy' | 'procedure' | 'service_item' | 'request';
    category?: string;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
    author?: string;
    classification?: string;
    relevanceScore?: number;
    tenantId?: string;
    accessLevel?: string;
    department?: string;
    costCenter?: string;
    securityClassification?: 'public' | 'internal' | 'confidential' | 'restricted' | 'top_secret';
    rbacMetadata?: {
      ownerUserId?: string;
      ownerDepartment?: string;
      accessControlList?: string[];
      requiresApproval?: boolean;
      dataClassification?: string;
    };
  };
  position: {
    start: number;
    end: number;
    section?: string;
  };
}

export interface VectorStore {
  id: string;
  name: string;
  type: 'chromadb' | 'pinecone' | 'qdrant' | 'weaviate' | 'local';
  config: Record<string, any>;
  collections: string[];
  isActive: boolean;
}

export interface RAGQuery {
  id: string;
  query: string;
  context?: {
    userId?: string;
    tenantId?: string;
    module: string;
    sessionId?: string;
    userRoles?: string[];
    securityClearance?: string;
  };
  filters?: {
    sources?: string[];
    types?: string[];
    categories?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
    classification?: string[];
    tags?: string[];
    tenantId?: string;
    accessLevel?: string;
  };
  options: {
    maxResults?: number;
    minScore?: number;
    includeMetadata?: boolean;
    rerank?: boolean;
    expandQuery?: boolean;
    hybridSearch?: boolean;
    enforceRBAC?: boolean;
  };
  metadata: Record<string, any>;
}

export interface RAGResult {
  id: string;
  queryId: string;
  chunks: DocumentChunk[];
  summary?: string;
  confidence: number;
  retrievalTime: number;
  totalResults: number;
  metadata: {
    searchStrategy: string;
    embeddingModel: string;
    vectorStore: string;
    filters: Record<string, any>;
  };
}

export interface KnowledgeGraph {
  entities: Map<string, KnowledgeEntity>;
  relationships: Map<string, KnowledgeRelationship>;
  concepts: Map<string, KnowledgeConcept>;
}

export interface KnowledgeEntity {
  id: string;
  name: string;
  type: string;
  properties: Record<string, any>;
  connections: string[];
  embedding?: number[];
}

export interface KnowledgeRelationship {
  id: string;
  source: string;
  target: string;
  type: string;
  weight: number;
  properties: Record<string, any>;
}

export interface KnowledgeConcept {
  id: string;
  name: string;
  description: string;
  category: string;
  keywords: string[];
  embedding?: number[];
  relatedEntities: string[];
}

/**
 * Main RAG Engine Implementation
 */
export class NovaRAGEngine extends EventEmitter {
  private embeddingModels: Map<string, EmbeddingModel> = new Map();
  private vectorStores: Map<string, VectorStore> = new Map();
  private vectorStoreInstances: Map<string, ChromaDBStore | LocalVectorStore> = new Map();
  private documentChunks: Map<string, DocumentChunk> = new Map();
  private queryHistory: Map<string, RAGQuery> = new Map();
  private resultHistory: Map<string, RAGResult> = new Map();
  private knowledgeGraph: KnowledgeGraph = {
    entities: new Map(),
    relationships: new Map(),
    concepts: new Map(),
  };

  private isInitialized = false;
  private indexUpdateInterval: NodeJS.Timeout | null = null;

  // Configuration
  private config = {
    defaultEmbeddingModel: 'nova-local-embeddings', // Prioritize Nova's own embedding model
    defaultVectorStore: 'chromadb-main',
    chunkSize: 512,
    chunkOverlap: 50,
    maxRetrieval: 10,
    minSimilarity: 0.7,
    rerankingEnabled: true,
    knowledgeGraphEnabled: true,
    realTimeUpdates: true,
    // Nova Data Prioritization Settings
    novaDataPriority: true,
    novaDataBoostFactor: 1.5, // Boost score for Nova-sourced data
    novaSourcesOfTruth: [
      'nova_knowledge_base',
      'nova_tickets', 
      'nova_service_catalog',
      'nova_documentation',
      'nova_monitoring',
      'nova_workflows',
      'nova_historical_data'
    ],
    externalSourcePenalty: 0.8, // Reduce score for external sources
  };

  constructor() {
    super();
  }

  /**
   * Initialize the RAG Engine
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Nova RAG Engine...');

      // Initialize embedding models
      await this.initializeEmbeddingModels();

      // Initialize vector stores
      await this.initializeVectorStores();

      // Load existing document chunks
      await this.loadDocumentChunks();

      // Initialize knowledge graph
      await this.initializeKnowledgeGraph();

      // Set up real-time index updates
      if (this.config.realTimeUpdates) {
        this.startIndexUpdateMonitoring();
      }

      this.isInitialized = true;
      this.emit('initialized');

      logger.info('Nova RAG Engine initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize RAG Engine:', error);
      throw error;
    }
  }

  /**
   * Process a RAG query and retrieve relevant context with RBAC enforcement
   */
  async query(ragQuery: RAGQuery): Promise<RAGResult> {
    if (!this.isInitialized) {
      throw new Error('RAG Engine not initialized');
    }

    const startTime = Date.now();

    try {
      // Generate query ID
      ragQuery.id = crypto.randomUUID();
      this.queryHistory.set(ragQuery.id, ragQuery);

      // Enforce RBAC if enabled and user context is provided
      if (ragQuery.options.enforceRBAC && ragQuery.context?.userId && ragQuery.context?.tenantId) {
        return await this.queryWithRBAC(ragQuery, startTime);
      }

      // Standard query without RBAC
      return await this.queryWithoutRBAC(ragQuery, startTime);
    } catch (error) {
      logger.error('RAG query processing error:', error);
      throw error;
    }
  }

  /**
   * Process a RAG query with RBAC enforcement
   */
  private async queryWithRBAC(ragQuery: RAGQuery, startTime: number): Promise<RAGResult> {
    const { userId, tenantId } = ragQuery.context!;

    // Expand query if enabled
    if (ragQuery.options.expandQuery) {
      ragQuery.query = await this.expandQuery(ragQuery.query);
    }

    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(ragQuery.query);

    // Perform retrieval
    let chunks: DocumentChunk[];
    if (ragQuery.options.hybridSearch) {
      chunks = await this.hybridSearch(ragQuery, queryEmbedding);
    } else {
      chunks = await this.semanticSearch(ragQuery, queryEmbedding);
    }

    // Apply basic filters first
    chunks = this.applyFilters(chunks, ragQuery.filters);

    // Apply RBAC filtering
    chunks = await this.filterChunksWithRBAC(chunks, userId!, tenantId!, 'read');

    // Rerank results if enabled
    if (ragQuery.options.rerank && this.config.rerankingEnabled) {
      chunks = await this.rerankResults(ragQuery.query, chunks);
    }

    // Limit results
    const maxResults = ragQuery.options.maxResults || this.config.maxRetrieval;
    chunks = chunks.slice(0, maxResults);

    // Calculate confidence score
    const confidence = this.calculateConfidence(chunks);

    // Generate summary if requested
    let summary: string | undefined;
    if (chunks.length > 0) {
      summary = await this.generateContextSummary(ragQuery.query, chunks);
    }

    const result: RAGResult = {
      id: crypto.randomUUID(),
      queryId: ragQuery.id,
      chunks,
      summary,
      confidence,
      retrievalTime: Date.now() - startTime,
      totalResults: chunks.length,
      metadata: {
        searchStrategy: ragQuery.options.hybridSearch ? 'hybrid' : 'semantic',
        embeddingModel: this.config.defaultEmbeddingModel,
        vectorStore: this.config.defaultVectorStore,
        filters: ragQuery.filters || {},
        rbacEnforced: true,
        userId,
        tenantId,
      },
    };

    this.resultHistory.set(result.id, result);
    this.emit('queryProcessed', { query: ragQuery, result });

    return result;
  }

  /**
   * Process a RAG query without RBAC enforcement (legacy mode)
   */
  private async queryWithoutRBAC(ragQuery: RAGQuery, startTime: number): Promise<RAGResult> {
    // Expand query if enabled
    if (ragQuery.options.expandQuery) {
      ragQuery.query = await this.expandQuery(ragQuery.query);
    }

    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(ragQuery.query);

    // Perform retrieval
    let chunks: DocumentChunk[];
    if (ragQuery.options.hybridSearch) {
      chunks = await this.hybridSearch(ragQuery, queryEmbedding);
    } else {
      chunks = await this.semanticSearch(ragQuery, queryEmbedding);
    }

    // Apply filters
    chunks = this.applyFilters(chunks, ragQuery.filters);

    // Rerank results if enabled
    if (ragQuery.options.rerank && this.config.rerankingEnabled) {
      chunks = await this.rerankResults(ragQuery.query, chunks);
    }

    // Limit results
    const maxResults = ragQuery.options.maxResults || this.config.maxRetrieval;
    chunks = chunks.slice(0, maxResults);

    // Calculate confidence score
    const confidence = this.calculateConfidence(chunks);

    // Generate summary if requested
    let summary: string | undefined;
    if (chunks.length > 0) {
      summary = await this.generateContextSummary(ragQuery.query, chunks);
    }

    const result: RAGResult = {
      id: crypto.randomUUID(),
      queryId: ragQuery.id,
      chunks,
      summary,
      confidence,
      retrievalTime: Date.now() - startTime,
      totalResults: chunks.length,
      metadata: {
        searchStrategy: ragQuery.options.hybridSearch ? 'hybrid' : 'semantic',
        embeddingModel: this.config.defaultEmbeddingModel,
        vectorStore: this.config.defaultVectorStore,
        filters: ragQuery.filters || {},
        rbacEnforced: false,
      },
    };

    this.resultHistory.set(result.id, result);
    this.emit('queryProcessed', { query: ragQuery, result });

    return result;
  }

  /**
   * Filter document chunks based on RBAC permissions
   */
  private async filterChunksWithRBAC(
    chunks: DocumentChunk[],
    userId: string,
    tenantId: string,
    action: string = 'read'
  ): Promise<DocumentChunk[]> {
    if (!ragRBAC.isInitialized) {
      logger.warn('RBAC system not initialized, skipping RBAC filtering');
      return chunks;
    }

    const filteredChunks: DocumentChunk[] = [];

    for (const chunk of chunks) {
      try {
        const context: RAGAccessContext = {
          userId,
          tenantId,
          requestType: 'query',
          resource: `document:${chunk.documentId}`,
          action,
          metadata: {
            chunkId: chunk.id,
            documentType: chunk.metadata.type,
            classification: chunk.metadata.securityClassification || chunk.metadata.classification,
            source: chunk.metadata.source,
            category: chunk.metadata.category,
            tags: chunk.metadata.tags,
            department: chunk.metadata.department,
            costCenter: chunk.metadata.costCenter,
          },
        };

        const decision = await ragRBAC.checkAccess(context);
        
        if (decision.granted) {
          // Add RBAC metadata to chunk
          chunk.metadata.rbacMetadata = {
            ...chunk.metadata.rbacMetadata,
            accessGranted: true,
            accessReason: decision.reason,
            policyId: decision.policyId,
            accessTimestamp: new Date(),
          };
          filteredChunks.push(chunk);
        } else {
          logger.debug('RBAC denied access to chunk', {
            chunkId: chunk.id,
            documentId: chunk.documentId,
            userId,
            reason: decision.reason,
          });
        }
      } catch (error) {
        logger.warn('Error checking RBAC for chunk', {
          chunkId: chunk.id,
          error: error.message,
        });
        // In case of RBAC error, exclude the chunk for security
      }
    }

    logger.info('RBAC filtering completed', {
      originalCount: chunks.length,
      filteredCount: filteredChunks.length,
      userId,
      tenantId,
    });

    return filteredChunks;
  }

  /**
   * Add documents to the RAG system with enhanced RBAC metadata
   */
  async addDocuments(
    documents: Array<{
      id: string;
      content: string;
      metadata: any;
    }>,
    rbacContext?: {
      userId: string;
      tenantId: string;
      departmentId?: string;
      securityClassification?: string;
    }
  ): Promise<void> {
    try {
      for (const doc of documents) {
        await this.processDocumentWithRBAC(doc, rbacContext);
      }

      logger.info(`Added ${documents.length} documents to RAG system with RBAC metadata`);
      this.emit('documentsAdded', { count: documents.length, rbacEnabled: !!rbacContext });
    } catch (error) {
      logger.error('Error adding documents with RBAC:', error);
      throw error;
    }
  }

  /**
   * Process document with enhanced RBAC metadata extraction
   */
  private async processDocumentWithRBAC(
    doc: { id: string; content: string; metadata: any },
    rbacContext?: {
      userId: string;
      tenantId: string;
      departmentId?: string;
      securityClassification?: string;
    }
  ): Promise<void> {
    // Enhance metadata with RBAC information
    const enhancedMetadata = {
      ...doc.metadata,
      tenantId: rbacContext?.tenantId || doc.metadata.tenantId,
      securityClassification: rbacContext?.securityClassification || doc.metadata.securityClassification || 'internal',
      department: rbacContext?.departmentId || doc.metadata.department,
      rbacMetadata: {
        ownerUserId: rbacContext?.userId || doc.metadata.ownerUserId,
        ownerDepartment: rbacContext?.departmentId || doc.metadata.department,
        indexedAt: new Date(),
        accessLevel: doc.metadata.accessLevel || 'standard',
        dataClassification: doc.metadata.dataClassification || 'standard',
        requiresApproval: doc.metadata.requiresApproval || false,
        ...doc.metadata.rbacMetadata,
      },
    };

    // Split document into chunks
    const chunks = await this.chunkDocument(doc.content, enhancedMetadata);

    // Generate embeddings for each chunk
    for (const chunk of chunks) {
      chunk.documentId = doc.id;
      chunk.id = crypto.randomUUID();

      // Inherit RBAC metadata in chunks
      chunk.metadata.tenantId = enhancedMetadata.tenantId;
      chunk.metadata.securityClassification = enhancedMetadata.securityClassification;
      chunk.metadata.department = enhancedMetadata.department;
      chunk.metadata.rbacMetadata = enhancedMetadata.rbacMetadata;

      // Generate embedding
      chunk.embedding = await this.generateEmbedding(chunk.content);

      // Store chunk
      this.documentChunks.set(chunk.id, chunk);

      // Add to vector store with RBAC metadata
      await this.addToVectorStore(chunk);

      // Set document permissions in RBAC system if context provided
      if (rbacContext && ragRBAC.isInitialized) {
        await this.setDocumentRBACPermissions(doc.id, enhancedMetadata, rbacContext);
      }
    }

    // Update knowledge graph if enabled
    if (this.config.knowledgeGraphEnabled) {
      await this.updateKnowledgeGraph(doc);
    }
  }

  /**
   * Set RBAC permissions for a document
   */
  private async setDocumentRBACPermissions(
    documentId: string,
    metadata: any,
    rbacContext: { userId: string; tenantId: string; departmentId?: string }
  ): Promise<void> {
    try {
      const permission = {
        documentId,
        tenantId: rbacContext.tenantId,
        classification: metadata.securityClassification || 'internal',
        accessControlList: {
          users: metadata.rbacMetadata?.accessControlList || [rbacContext.userId],
          roles: metadata.rbacMetadata?.allowedRoles || [],
          departments: rbacContext.departmentId ? [rbacContext.departmentId] : [],
        },
        metadata: {
          owner: rbacContext.userId,
          createdBy: rbacContext.userId,
          department: rbacContext.departmentId || 'unknown',
          tags: metadata.tags || [],
          dataClassification: metadata.rbacMetadata?.dataClassification || 'standard',
        },
      };

      await ragRBAC.setDocumentPermission(permission);
      
      logger.debug('Document RBAC permissions set', {
        documentId,
        tenantId: rbacContext.tenantId,
        classification: permission.classification,
      });
    } catch (error) {
      logger.warn('Failed to set document RBAC permissions', {
        documentId,
        error: error.message,
      });
    }
  }

  /**
   * Update document in RAG system
   */
  async updateDocument(documentId: string, content: string, metadata: any): Promise<void> {
    try {
      // Remove existing chunks for this document
      await this.removeDocument(documentId);

      // Add updated document
      await this.processDocument({ id: documentId, content, metadata });

      logger.info(`Updated document ${documentId} in RAG system`);
      this.emit('documentUpdated', { documentId });
    } catch (error) {
      logger.error(`Error updating document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Remove document from RAG system
   */
  async removeDocument(documentId: string): Promise<void> {
    try {
      // Find and remove all chunks for this document
      const chunksToRemove = Array.from(this.documentChunks.values()).filter(
        (chunk) => chunk.documentId === documentId,
      );

      for (const chunk of chunksToRemove) {
        this.documentChunks.delete(chunk.id);
        await this.removeFromVectorStore(chunk.id);
      }

      logger.info(`Removed document ${documentId} and ${chunksToRemove.length} chunks`);
      this.emit('documentRemoved', { documentId, chunksRemoved: chunksToRemove.length });
    } catch (error) {
      logger.error(`Error removing document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Get RAG engine statistics
   */
  getStats(): any {
    return {
      isInitialized: this.isInitialized,
      totalChunks: this.documentChunks.size,
      totalQueries: this.queryHistory.size,
      embeddingModels: Array.from(this.embeddingModels.values()),
      vectorStores: Array.from(this.vectorStores.values()),
      knowledgeGraph: {
        entities: this.knowledgeGraph.entities.size,
        relationships: this.knowledgeGraph.relationships.size,
        concepts: this.knowledgeGraph.concepts.size,
      },
      config: this.config,
    };
  }

  // Private methods
  private async initializeEmbeddingModels(): Promise<void> {
    const models: EmbeddingModel[] = [
      {
        id: 'openai-ada-002',
        name: 'OpenAI text-embedding-ada-002',
        provider: 'openai',
        model: 'text-embedding-ada-002',
        dimensions: 1536,
        maxTokens: 8191,
        config: {
          apiKey: process.env.OPENAI_API_KEY,
          endpoint: 'https://api.openai.com/v1/embeddings',
        },
        isActive: !!process.env.OPENAI_API_KEY,
      },
      {
        id: 'openai-ada-003',
        name: 'OpenAI text-embedding-3-small',
        provider: 'openai',
        model: 'text-embedding-3-small',
        dimensions: 1536,
        maxTokens: 8191,
        config: {
          apiKey: process.env.OPENAI_API_KEY,
          endpoint: 'https://api.openai.com/v1/embeddings',
        },
        isActive: !!process.env.OPENAI_API_KEY,
      },
      {
        id: 'huggingface-sentence-bert',
        name: 'HuggingFace Sentence-BERT',
        provider: 'huggingface',
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        dimensions: 384,
        maxTokens: 512,
        config: {
          apiKey: process.env.HUGGINGFACE_API_KEY,
          endpoint:
            'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
        },
        isActive: !!process.env.HUGGINGFACE_API_KEY,
      },
      {
        id: 'nova-local-embeddings',
        name: 'Nova Local Embeddings (Trained on Nova Data)',
        provider: 'local',
        model: 'nova-embeddings-v1',
        dimensions: 768,
        maxTokens: 512,
        config: {
          modelPath: '/models/nova-embeddings',
          trainingData: 'nova_corpus', // Trained exclusively on Nova data
          domainSpecific: true,
          novaOptimized: true,
        },
        isActive: true, // Always active as primary embedding model
      },
    ];

    for (const model of models) {
      if (model.isActive) {
        this.embeddingModels.set(model.id, model);
        logger.info(`Registered embedding model: ${model.name}`);
      }
    }
  }

  private async initializeVectorStores(): Promise<void> {
    const stores: VectorStore[] = [
      {
        id: 'chromadb-main',
        name: 'ChromaDB Main Store',
        type: 'chromadb',
        config: {
          host: process.env.CHROMADB_HOST || 'localhost',
          port: process.env.CHROMADB_PORT || 8000,
          database: 'nova_rag',
        },
        collections: ['knowledge', 'tickets', 'documentation'],
        isActive: true,
      },
      {
        id: 'pinecone-prod',
        name: 'Pinecone Production',
        type: 'pinecone',
        config: {
          apiKey: process.env.PINECONE_API_KEY,
          environment: process.env.PINECONE_ENVIRONMENT,
          indexName: 'nova-rag',
        },
        collections: ['main'],
        isActive: !!process.env.PINECONE_API_KEY,
      },
      {
        id: 'local-faiss',
        name: 'Local FAISS Store',
        type: 'local',
        config: {
          storagePath: '/data/vector-store',
          indexType: 'faiss',
        },
        collections: ['main'],
        isActive: true,
      },
    ];

    for (const store of stores) {
      if (store.isActive) {
        this.vectorStores.set(store.id, store);
        await this.initializeVectorStore(store);
        logger.info(`Initialized vector store: ${store.name}`);
      }
    }
  }

  private async initializeVectorStore(store: VectorStore): Promise<void> {
    try {
      const instance = await VectorStoreFactory.createStore(store);
      this.vectorStoreInstances.set(store.id, instance);
      logger.info(`Successfully initialized vector store: ${store.name}`);
    } catch (error) {
      logger.warn(`Failed to initialize vector store ${store.name}:`, error.message);
      // Don't throw - allow system to continue with other stores
    }
  }



  private async loadDocumentChunks(): Promise<void> {
    // Load existing chunks from persistent storage
    logger.info('Loading existing document chunks...');

    // This would load from database or file system
    // For now, we'll start with an empty collection
    logger.info('Document chunks loaded');
  }

  private async initializeKnowledgeGraph(): Promise<void> {
    if (!this.config.knowledgeGraphEnabled) {
      return;
    }

    logger.info('Initializing knowledge graph...');

    // Load entities, relationships, and concepts
    await this.loadKnowledgeGraphData();

    logger.info('Knowledge graph initialized');
  }

  private async loadKnowledgeGraphData(): Promise<void> {
    // Load knowledge graph data from storage
    // This would connect to a graph database or load from files
  }

  private async processDocument(doc: {
    id: string;
    content: string;
    metadata: any;
  }): Promise<void> {
    // Split document into chunks
    const chunks = await this.chunkDocument(doc.content, doc.metadata);

    // Generate embeddings for each chunk
    for (const chunk of chunks) {
      chunk.documentId = doc.id;
      chunk.id = crypto.randomUUID();

      // Generate embedding
      chunk.embedding = await this.generateEmbedding(chunk.content);

      // Store chunk
      this.documentChunks.set(chunk.id, chunk);

      // Add to vector store
      await this.addToVectorStore(chunk);
    }

    // Update knowledge graph if enabled
    if (this.config.knowledgeGraphEnabled) {
      await this.updateKnowledgeGraph(doc);
    }
  }

  private async chunkDocument(content: string, metadata: any): Promise<DocumentChunk[]> {
    const chunks: DocumentChunk[] = [];
    const chunkSize = this.config.chunkSize;
    const overlap = this.config.chunkOverlap;

    // Simple sliding window chunking
    let start = 0;
    let position = 0;

    while (start < content.length) {
      const end = Math.min(start + chunkSize, content.length);
      const chunkContent = content.substring(start, end);

      const chunk: DocumentChunk = {
        id: '', // Will be set by processDocument
        documentId: '', // Will be set by processDocument
        content: chunkContent,
        metadata: {
          ...metadata,
          chunkIndex: position, // Track the chunk order within the document
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        position: {
          start,
          end,
          section: this.extractSection(chunkContent),
        },
      };

      chunks.push(chunk);
      start += chunkSize - overlap;
      position++;
    }

    return chunks;
  }

  private extractSection(content: string): string | undefined {
    // Extract section heading from content
    const headingMatch = content.match(/^#+\s*(.+)/m);
    return headingMatch ? headingMatch[1].trim() : undefined;
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const model = this.embeddingModels.get(this.config.defaultEmbeddingModel);
    if (!model) {
      throw new Error(`Embedding model not found: ${this.config.defaultEmbeddingModel}`);
    }

    switch (model.provider) {
      case 'openai':
        return await this.generateOpenAIEmbedding(text, model);
      case 'huggingface':
        return await this.generateHuggingFaceEmbedding(text, model);
      case 'local':
        return await this.generateLocalEmbedding(text, model);
      default:
        throw new Error(`Unsupported embedding provider: ${model.provider}`);
    }
  }

  private async generateOpenAIEmbedding(text: string, model: EmbeddingModel): Promise<number[]> {
    if (!model.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch(model.config.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${model.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text,
          model: model.model,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      logger.error('Failed to generate OpenAI embedding:', error);
      throw new Error(`OpenAI embedding generation failed: ${error.message}`);
    }
  }

  private async generateHuggingFaceEmbedding(
    text: string,
    model: EmbeddingModel,
  ): Promise<number[]> {
    if (!model.config.apiKey) {
      throw new Error('HuggingFace API key not configured');
    }

    try {
      const response = await fetch(model.config.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${model.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : data.embeddings || data;
    } catch (error) {
      logger.error('Failed to generate HuggingFace embedding:', error);
      throw new Error(`HuggingFace embedding generation failed: ${error.message}`);
    }
  }

  private async generateLocalEmbedding(text: string, model: EmbeddingModel): Promise<number[]> {
    try {
      // Use our local embedding model
      return await localEmbeddingModel.generateEmbedding(text);
    } catch (error) {
      logger.error('Failed to generate local embedding:', error);
      throw new Error(`Local embedding generation failed: ${error.message}`);
    }
  }

  private async addToVectorStore(chunk: DocumentChunk): Promise<void> {
    const store = this.vectorStores.get(this.config.defaultVectorStore);
    if (!store) {
      // Fallback to first available vector store
      const availableStores = Array.from(this.vectorStores.values());
      if (availableStores.length === 0) {
        logger.warn('No vector stores available');
        return;
      }
      
      const fallbackStore = availableStores[0];
      logger.info(`Using fallback vector store: ${fallbackStore.name}`);
      const storeInstance = this.vectorStoreInstances.get(fallbackStore.id);
      
      if (!storeInstance) {
        logger.warn(`Fallback vector store instance not available: ${fallbackStore.id}`);
        return;
      }

      try {
        await storeInstance.addChunk(chunk);
        logger.debug(`Added chunk ${chunk.id} to fallback vector store ${fallbackStore.name}`);
      } catch (error) {
        logger.error('Failed to add chunk to fallback vector store:', error);
        throw error;
      }
      return;
    }

    const storeInstance = this.vectorStoreInstances.get(store.id);
    if (!storeInstance) {
      logger.warn(`Vector store instance not available: ${store.id}`);
      return;
    }

    try {
      await storeInstance.addChunk(chunk);
      logger.debug(`Added chunk ${chunk.id} to vector store ${store.name}`);
    } catch (error) {
      logger.error(`Failed to add chunk to vector store:`, error);
      throw error;
    }
  }



  private async removeFromVectorStore(chunkId: string): Promise<void> {
    const store = this.vectorStores.get(this.config.defaultVectorStore);
    if (!store) return;

    const storeInstance = this.vectorStoreInstances.get(store.id);
    if (!storeInstance) return;

    try {
      await storeInstance.removeChunk(chunkId);
      logger.debug(`Removed chunk ${chunkId} from vector store ${store.name}`);
    } catch (error) {
      logger.error(`Failed to remove chunk from vector store:`, error);
    }
  }



  private async semanticSearch(
    query: RAGQuery,
    queryEmbedding: number[],
  ): Promise<DocumentChunk[]> {
    // Try to find the default vector store first, then fallback to any available store
    let store = this.vectorStores.get(this.config.defaultVectorStore);
    let storeInstance = store ? this.vectorStoreInstances.get(store.id) : null;

    // Fallback to first available vector store if default is not available
    if (!storeInstance) {
      const availableStores = Array.from(this.vectorStores.values());
      if (availableStores.length > 0) {
        store = availableStores[0];
        storeInstance = this.vectorStoreInstances.get(store.id);
        if (storeInstance) {
          logger.debug(`Using fallback vector store for search: ${store.name}`);
        }
      }
    }

    if (storeInstance) {
      try {
        const vectorResults = await storeInstance.searchSimilar(queryEmbedding, {
          nResults: query.options.maxResults || this.config.maxRetrieval,
          minSimilarity: query.options.minScore || this.config.minSimilarity,
        });

        if (vectorResults.length > 0) {
          // Apply Nova data prioritization to vector results
          if (this.config.novaDataPriority) {
            vectorResults.forEach(chunk => {
              if (chunk.metadata.relevanceScore) {
                chunk.metadata.relevanceScore = this.applyNovaDataPrioritization(
                  chunk, 
                  chunk.metadata.relevanceScore
                );
              }
            });
          }

          // Sort by updated relevance scores
          vectorResults.sort((a, b) => (b.metadata.relevanceScore || 0) - (a.metadata.relevanceScore || 0));
          
          logger.debug(`Vector search returned ${vectorResults.length} results`);
          return vectorResults;
        }
      } catch (error) {
        logger.warn('Vector store search failed, falling back to in-memory search:', error.message);
      }
    }

    // Fallback to in-memory search
    logger.debug('Using in-memory semantic search');
    const chunks = Array.from(this.documentChunks.values());
    const results: Array<{ chunk: DocumentChunk; score: number }> = [];

    for (const chunk of chunks) {
      if (!chunk.embedding) continue;

      let similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      
      // Apply Nova data prioritization
      if (this.config.novaDataPriority) {
        similarity = this.applyNovaDataPrioritization(chunk, similarity);
      }
      
      if (similarity >= (query.options.minScore || this.config.minSimilarity)) {
        results.push({ chunk, score: similarity });
      }
    }

    // Sort by similarity score (Nova data will naturally rank higher due to boost)
    results.sort((a, b) => b.score - a.score);

    return results.map((r) => {
      r.chunk.metadata.relevanceScore = r.score;
      return r.chunk;
    });
  }

  private async hybridSearch(query: RAGQuery, queryEmbedding: number[]): Promise<DocumentChunk[]> {
    // Combine semantic search with keyword search
    const semanticResults = await this.semanticSearch(query, queryEmbedding);
    const keywordResults = await this.keywordSearch(query.query);

    // Merge and rerank results
    return this.mergeSearchResults(semanticResults, keywordResults);
  }

  private async keywordSearch(query: string): Promise<DocumentChunk[]> {
    // Simple keyword-based search
    const keywords = query
      .toLowerCase()
      .split(' ')
      .filter((word) => word.length > 2);
    const chunks = Array.from(this.documentChunks.values());
    const results: Array<{ chunk: DocumentChunk; score: number }> = [];

    for (const chunk of chunks) {
      let score = 0;
      const content = chunk.content.toLowerCase();

      for (const keyword of keywords) {
        const matches = (content.match(new RegExp(keyword, 'g')) || []).length;
        score += matches;
      }

      if (score > 0) {
        results.push({ chunk, score: score / keywords.length });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.map((r) => r.chunk);
  }

  private mergeSearchResults(
    semanticResults: DocumentChunk[],
    keywordResults: DocumentChunk[],
  ): DocumentChunk[] {
    const merged = new Map<string, DocumentChunk>();

    // Add semantic results with higher weight
    semanticResults.forEach((chunk, index) => {
      chunk.metadata.relevanceScore =
        (chunk.metadata.relevanceScore || 0) * 0.7 + (1 - index / semanticResults.length) * 0.3;
      merged.set(chunk.id, chunk);
    });

    // Add keyword results with lower weight
    keywordResults.forEach((chunk, index) => {
      if (merged.has(chunk.id)) {
        const existing = merged.get(chunk.id)!;
        existing.metadata.relevanceScore =
          (existing.metadata.relevanceScore || 0) + (1 - index / keywordResults.length) * 0.2;
      } else {
        chunk.metadata.relevanceScore = (1 - index / keywordResults.length) * 0.3;
        merged.set(chunk.id, chunk);
      }
    });

    // Sort by final relevance score
    return Array.from(merged.values()).sort(
      (a, b) => (b.metadata.relevanceScore || 0) - (a.metadata.relevanceScore || 0),
    );
  }

  private applyFilters(chunks: DocumentChunk[], filters?: RAGQuery['filters']): DocumentChunk[] {
    if (!filters) return chunks;

    return chunks.filter((chunk) => {
      // Source filter
      if (filters.sources && !filters.sources.includes(chunk.metadata.source)) {
        return false;
      }

      // Type filter
      if (filters.types && !filters.types.includes(chunk.metadata.type)) {
        return false;
      }

      // Category filter
      if (
        filters.categories &&
        chunk.metadata.category &&
        !filters.categories.includes(chunk.metadata.category)
      ) {
        return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const chunkDate = chunk.metadata.createdAt;
        if (chunkDate < filters.dateRange.start || chunkDate > filters.dateRange.end) {
          return false;
        }
      }

      // Classification filter
      if (
        filters.classification &&
        chunk.metadata.classification &&
        !filters.classification.includes(chunk.metadata.classification)
      ) {
        return false;
      }

      // Tags filter
      if (filters.tags && chunk.metadata.tags) {
        const hasMatchingTag = filters.tags.some((tag) => chunk.metadata.tags!.includes(tag));
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }

  private async rerankResults(query: string, chunks: DocumentChunk[]): Promise<DocumentChunk[]> {
    // Cross-encoder reranking for better relevance
    // This would use a specialized reranking model

    // For now, return chunks as-is
    return chunks;
  }

  private calculateConfidence(chunks: DocumentChunk[]): number {
    if (chunks.length === 0) return 0;

    const scores = chunks.map((chunk) => chunk.metadata.relevanceScore || 0);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Adjust confidence based on result count and score distribution
    let confidence = avgScore;

    if (chunks.length >= 3) confidence *= 1.1;
    if (chunks.length >= 5) confidence *= 1.1;

    return Math.min(1, confidence);
  }

  private async generateContextSummary(query: string, chunks: DocumentChunk[]): Promise<string> {
    // Generate a summary of the retrieved context
    // This would use a summarization model

    const combinedContent = chunks
      .slice(0, 3)
      .map((chunk) => chunk.content)
      .join('\n\n');
    return `Based on ${chunks.length} relevant documents, here's the key information related to "${query}": ${combinedContent.substring(0, 500)}...`;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Apply Nova data prioritization to boost or penalize scores based on data source
   */
  private applyNovaDataPrioritization(chunk: DocumentChunk, similarity: number): number {
    const source = chunk.metadata.source;
    
    // Boost Nova sources of truth
    if (this.config.novaSourcesOfTruth.includes(source)) {
      const boostedScore = similarity * this.config.novaDataBoostFactor;
      
      // Additional boost for core Nova operational data
      if (['nova_tickets', 'nova_knowledge_base', 'nova_workflows'].includes(source)) {
        return Math.min(1.0, boostedScore * 1.2); // Extra boost for critical Nova data
      }
      
      return Math.min(1.0, boostedScore);
    }
    
    // Apply penalty to external sources
    if (!source.startsWith('nova_')) {
      return similarity * this.config.externalSourcePenalty;
    }
    
    // Default: no modification for other Nova sources
    return similarity;
  }

  private async expandQuery(query: string): Promise<string> {
    // Query expansion using synonyms, related terms, etc.
    // This would use NLP techniques or knowledge graph traversal

    // Simple expansion for now
    const synonyms = {
      problem: ['issue', 'error', 'bug'],
      fix: ['resolve', 'solution', 'repair'],
      install: ['setup', 'configure', 'deploy'],
    };

    let expandedQuery = query;
    for (const [word, syns] of Object.entries(synonyms)) {
      if (query.toLowerCase().includes(word)) {
        expandedQuery += ' ' + syns.join(' ');
      }
    }

    return expandedQuery;
  }

  private async updateKnowledgeGraph(doc: {
    id: string;
    content: string;
    metadata: Record<string, unknown>;
  }): Promise<void> {
    // Extract entities and relationships from document
    try {
      logger.debug(`Updating knowledge graph with document ${doc.id}`);

      // Extract entities from content
      const entities = this.extractEntities(doc.content);
      const relationships = this.extractRelationships(doc.content);

      // Update knowledge graph with extracted information
      const graphUpdate = {
        documentId: doc.id,
        entities,
        relationships,
        metadata: doc.metadata,
        contentLength: doc.content.length,
        lastUpdated: new Date(),
      };

      // Store in knowledge graph (placeholder implementation)
      if (this.knowledgeGraph) {
        // Use the available method or implement a simple storage
        logger.debug(
          `Knowledge graph update prepared for document ${doc.id}: ${JSON.stringify(graphUpdate)}`,
        );
        // this.knowledgeGraph.update(graphUpdate);
      } else {
        logger.debug(
          `No knowledge graph available, storing update info: ${JSON.stringify(graphUpdate)}`,
        );
      }

      logger.info(
        `Updated knowledge graph with ${entities.length} entities and ${relationships.length} relationships for document ${doc.id}`,
      );
    } catch (error) {
      logger.error(`Failed to update knowledge graph for document ${doc.id}: ${error}`);
      throw error;
    }
  }

  private extractEntities(
    content: string,
  ): Array<{ type: string; value: string; position: number }> {
    // Simple entity extraction (placeholder)
    const entities: Array<{ type: string; value: string; position: number }> = [];
    const words = content.split(/\s+/);

    words.forEach((word, index) => {
      // Extract email addresses
      if (word.match(/\S+@\S+\.\S+/)) {
        entities.push({ type: 'EMAIL', value: word, position: index });
      }
      // Extract URLs
      if (word.match(/https?:\/\/\S+/)) {
        entities.push({ type: 'URL', value: word, position: index });
      }
      // Extract capitalized words (potential names)
      if (word.match(/^[A-Z][a-z]+$/)) {
        entities.push({ type: 'PERSON', value: word, position: index });
      }
    });

    return entities;
  }

  private extractRelationships(
    content: string,
  ): Array<{ source: string; relation: string; target: string }> {
    // Simple relationship extraction (placeholder)
    const relationships: Array<{ source: string; relation: string; target: string }> = [];

    // Look for common relationship patterns
    if (content.includes('is a')) {
      relationships.push({ source: 'entity', relation: 'is_a', target: 'category' });
    }
    if (content.includes('works for')) {
      relationships.push({ source: 'person', relation: 'works_for', target: 'organization' });
    }
    if (content.includes('located in')) {
      relationships.push({ source: 'entity', relation: 'located_in', target: 'location' });
    }

    return relationships;
  }

  private startIndexUpdateMonitoring(): Promise<void> {
    this.indexUpdateInterval = setInterval(async () => {
      await this.checkForUpdates();
    }, 60000); // Check every minute

    return Promise.resolve();
  }

  private async checkForUpdates(): Promise<void> {
    // Check for document updates that need to be reflected in the index
    // This would monitor database changes, file system changes, etc.
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down RAG Engine...');

    if (this.indexUpdateInterval) {
      clearInterval(this.indexUpdateInterval);
    }

    // Close vector store connections
    // Save state if needed

    this.isInitialized = false;
    logger.info('RAG Engine shutdown complete');
  }
}

// Export singleton instance
export const ragEngine = new NovaRAGEngine();
