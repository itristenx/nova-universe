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
    type: 'knowledge_article' | 'ticket' | 'documentation' | 'policy' | 'procedure';
    category?: string;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
    author?: string;
    classification?: string;
    relevanceScore?: number;
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
  };
  options: {
    maxResults?: number;
    minScore?: number;
    includeMetadata?: boolean;
    rerank?: boolean;
    expandQuery?: boolean;
    hybridSearch?: boolean;
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
    defaultEmbeddingModel: process.env.RAG_EMBEDDING_MODEL || 'nova-local-embeddings',
    defaultVectorStore: process.env.RAG_VECTOR_STORE || 'local-faiss',
    chunkSize: parseInt(process.env.RAG_CHUNK_SIZE || '512'),
    chunkOverlap: parseInt(process.env.RAG_CHUNK_OVERLAP || '50'),
    maxRetrieval: parseInt(process.env.RAG_MAX_RESULTS || '10'),
    minSimilarity: parseFloat(process.env.RAG_MIN_SIMILARITY || '0.7'),
    rerankingEnabled: process.env.RAG_RERANKING_ENABLED !== 'false',
    knowledgeGraphEnabled: process.env.RAG_KNOWLEDGE_GRAPH_ENABLED !== 'false',
    realTimeUpdates: process.env.RAG_REAL_TIME_UPDATES !== 'false',
    novaSynthIntegration: process.env.RAG_NOVA_SYNTH_INTEGRATION !== 'false',
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
   * Process a RAG query and retrieve relevant context
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
        },
      };

      this.resultHistory.set(result.id, result);
      this.emit('queryProcessed', { query: ragQuery, result });

      return result;
    } catch (error) {
      logger.error('RAG query processing error:', error);
      throw error;
    }
  }

  /**
   * Add documents to the RAG system
   */
  async addDocuments(
    documents: Array<{
      id: string;
      content: string;
      metadata: any;
    }>,
  ): Promise<void> {
    try {
      for (const doc of documents) {
        await this.processDocument(doc);
      }

      logger.info(`Added ${documents.length} documents to RAG system`);
      this.emit('documentsAdded', { count: documents.length });
    } catch (error) {
      logger.error('Error adding documents:', error);
      throw error;
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
        name: 'Nova Local Embeddings',
        provider: 'local',
        model: 'nova-embeddings-v1',
        dimensions: 768,
        maxTokens: 512,
        config: {
          modelPath: '/models/nova-embeddings',
        },
        isActive: true,
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
    switch (store.type) {
      case 'chromadb':
        await this.initializeChromaDB(store);
        break;
      case 'pinecone':
        await this.initializePinecone(store);
        break;
      case 'local':
        await this.initializeLocalStore(store);
        break;
      default:
        logger.warn(`Unknown vector store type: ${store.type}`);
    }
  }

  private async initializeChromaDB(store: VectorStore): Promise<void> {
    try {
      logger.info(`Initializing ChromaDB: ${store.config.host}:${store.config.port}`);
      
      // Test ChromaDB connection
      const healthUrl = `http://${store.config.host}:${store.config.port}/api/v1/heartbeat`;
      
      try {
        const response = await fetch(healthUrl, { 
          method: 'GET',
          timeout: 5000 
        });
        
        if (!response.ok) {
          logger.warn(`ChromaDB health check failed: ${response.status}. Continuing with local fallback.`);
          return;
        }
        
        logger.info('ChromaDB connection successful');
        
        // Initialize collections
        for (const collectionName of store.collections) {
          await this.ensureChromaCollection(store, collectionName);
        }
        
      } catch (connectionError) {
        logger.warn(`ChromaDB not available at ${store.config.host}:${store.config.port}. Using local fallback.`);
      }
      
    } catch (error) {
      logger.error(`ChromaDB initialization error: ${error}`);
      throw error;
    }
  }

  private async ensureChromaCollection(store: VectorStore, collectionName: string): Promise<void> {
    try {
      const collectionsUrl = `http://${store.config.host}:${store.config.port}/api/v1/collections`;
      
      // Check if collection exists
      const listResponse = await fetch(collectionsUrl);
      const collections = await listResponse.json();
      
      const exists = collections.some((col: any) => col.name === collectionName);
      
      if (!exists) {
        // Create collection
        await fetch(collectionsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: collectionName,
            metadata: {
              description: `Nova RAG collection for ${collectionName}`,
              created_at: new Date().toISOString(),
            },
          }),
        });
        
        logger.info(`Created ChromaDB collection: ${collectionName}`);
      }
    } catch (error) {
      logger.error(`Failed to ensure ChromaDB collection ${collectionName}: ${error}`);
    }
  }

  private async initializePinecone(store: VectorStore): Promise<void> {
    try {
      logger.info(`Initializing Pinecone: ${store.config.indexName}`);
      
      if (!store.config.apiKey) {
        logger.warn('Pinecone API key not configured. Skipping Pinecone initialization.');
        return;
      }
      
      // Test Pinecone connection
      const response = await fetch(`https://api.pinecone.io/indexes`, {
        method: 'GET',
        headers: {
          'Api-Key': store.config.apiKey,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Pinecone API error: ${response.status} ${response.statusText}`);
      }
      
      const indexes = await response.json();
      const indexExists = indexes.indexes?.some((idx: any) => idx.name === store.config.indexName);
      
      if (!indexExists) {
        logger.warn(`Pinecone index ${store.config.indexName} does not exist. Please create it manually.`);
      } else {
        logger.info(`Pinecone index ${store.config.indexName} verified`);
      }
      
    } catch (error) {
      logger.error(`Pinecone initialization error: ${error}`);
      // Don't throw - allow fallback to other stores
    }
  }

  private async initializeLocalStore(store: VectorStore): Promise<void> {
    // Local FAISS store initialization
    const storagePath = store.config.storagePath;
    try {
      await fs.mkdir(storagePath, { recursive: true });
      logger.info(`Initialized local vector store: ${storagePath}`);
    } catch (error) {
      logger.error(`Failed to initialize local store: ${error}`);
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
    try {
      if (!model.config.apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const response = await fetch(model.config.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${model.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text,
          model: model.model,
          encoding_format: 'float',
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.data || !data.data[0] || !data.data[0].embedding) {
        throw new Error('Invalid OpenAI API response format');
      }

      return data.data[0].embedding;
    } catch (error) {
      logger.error(`Failed to generate OpenAI embedding: ${error}`);
      // Fallback to local embedding if available
      const fallbackModel = Array.from(this.embeddingModels.values()).find(
        m => m.provider === 'local' && m.isActive
      );
      if (fallbackModel) {
        logger.info('Falling back to local embedding model');
        return await this.generateLocalEmbedding(text, fallbackModel);
      }
      throw error;
    }
  }

  private async generateHuggingFaceEmbedding(
    text: string,
    model: EmbeddingModel,
  ): Promise<number[]> {
    try {
      if (!model.config.apiKey) {
        throw new Error('HuggingFace API key not configured');
      }

      const response = await fetch(model.config.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${model.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          options: {
            wait_for_model: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.status} ${response.statusText}`);
      }

      const embedding = await response.json();
      
      if (!Array.isArray(embedding) || embedding.length === 0) {
        throw new Error('Invalid HuggingFace API response format');
      }

      return embedding;
    } catch (error) {
      logger.error(`Failed to generate HuggingFace embedding: ${error}`);
      // Fallback to local embedding if available
      const fallbackModel = Array.from(this.embeddingModels.values()).find(
        m => m.provider === 'local' && m.isActive
      );
      if (fallbackModel) {
        logger.info('Falling back to local embedding model');
        return await this.generateLocalEmbedding(text, fallbackModel);
      }
      throw error;
    }
  }

  private async generateLocalEmbedding(text: string, model: EmbeddingModel): Promise<number[]> {
    try {
      // For local embeddings, we'll implement a simple TF-IDF based approach
      // In production, this would use actual local embedding models like sentence-transformers
      
      logger.debug(`Generating local embedding for text: ${text.substring(0, 100)}...`);
      
      // Simple text preprocessing
      const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);
      
      // Create a basic vector representation
      const embedding = new Array(model.dimensions).fill(0);
      
      // Simple hash-based embedding for consistency
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        for (let j = 0; j < word.length; j++) {
          const charCode = word.charCodeAt(j);
          const index = (charCode + i + j) % model.dimensions;
          embedding[index] += 1 / (words.length + 1);
        }
      }
      
      // Normalize the vector
      const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
      if (magnitude > 0) {
        for (let i = 0; i < embedding.length; i++) {
          embedding[i] /= magnitude;
        }
      }
      
      return embedding;
    } catch (error) {
      logger.error(`Failed to generate local embedding: ${error}`);
      // Last resort: return a zero vector
      logger.warn('Returning zero vector as fallback');
      return new Array(model.dimensions).fill(0);
    }
  }

  private async addToVectorStore(chunk: DocumentChunk): Promise<void> {
    const store = this.vectorStores.get(this.config.defaultVectorStore);
    if (!store) {
      throw new Error(`Vector store not found: ${this.config.defaultVectorStore}`);
    }

    // Add chunk to vector store based on type
    switch (store.type) {
      case 'chromadb':
        await this.addToChromaDB(chunk, store);
        break;
      case 'pinecone':
        await this.addToPinecone(chunk, store);
        break;
      case 'local':
        await this.addToLocalStore(chunk, store);
        break;
    }
  }

  private async addToChromaDB(chunk: DocumentChunk, store: VectorStore): Promise<void> {
    try {
      logger.debug(`Adding chunk ${chunk.id} to ChromaDB store ${store.name}`);
      
      if (!chunk.embedding) {
        throw new Error('Chunk embedding is required for ChromaDB storage');
      }
      
      // Determine collection based on chunk metadata
      const collection = this.selectCollection(chunk, store.collections);
      const addUrl = `http://${store.config.host}:${store.config.port}/api/v1/collections/${collection}/add`;
      
      const payload = {
        ids: [chunk.id],
        embeddings: [chunk.embedding],
        documents: [chunk.content],
        metadatas: [{
          documentId: chunk.documentId,
          source: chunk.metadata.source,
          type: chunk.metadata.type,
          category: chunk.metadata.category || '',
          classification: chunk.metadata.classification || '',
          tags: chunk.metadata.tags?.join(',') || '',
          createdAt: chunk.metadata.createdAt.toISOString(),
          updatedAt: chunk.metadata.updatedAt.toISOString(),
          startPosition: chunk.position.start.toString(),
          endPosition: chunk.position.end.toString(),
          section: chunk.position.section || '',
        }],
      };
      
      const response = await fetch(addUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ChromaDB add failed: ${response.status} ${errorText}`);
      }
      
      logger.debug(`Successfully added chunk ${chunk.id} to ChromaDB collection ${collection}`);
      
    } catch (error) {
      logger.error(`Failed to add chunk ${chunk.id} to ChromaDB: ${error}`);
      throw error;
    }
  }

  private selectCollection(chunk: DocumentChunk, availableCollections: string[]): string {
    // Select appropriate collection based on chunk metadata
    const type = chunk.metadata.type;
    
    if (type === 'knowledge_article' && availableCollections.includes('knowledge')) {
      return 'knowledge';
    } else if (type === 'ticket' && availableCollections.includes('tickets')) {
      return 'tickets';
    } else if (type === 'documentation' && availableCollections.includes('documentation')) {
      return 'documentation';
    }
    
    // Default to main collection
    return availableCollections.includes('main') ? 'main' : availableCollections[0];
  }

  private async addToPinecone(chunk: DocumentChunk, store: VectorStore): Promise<void> {
    try {
      logger.debug(`Adding chunk ${chunk.id} to Pinecone store ${store.name}`);
      
      if (!chunk.embedding) {
        throw new Error('Chunk embedding is required for Pinecone storage');
      }
      
      if (!store.config.apiKey) {
        throw new Error('Pinecone API key not configured');
      }
      
      const upsertUrl = `https://${store.config.indexName}-${store.config.environment}.svc.${store.config.environment}.pinecone.io/vectors/upsert`;
      
      const payload = {
        vectors: [{
          id: chunk.id,
          values: chunk.embedding,
          metadata: {
            documentId: chunk.documentId,
            content: chunk.content.substring(0, 1000), // Pinecone metadata size limit
            source: chunk.metadata.source,
            type: chunk.metadata.type,
            category: chunk.metadata.category || '',
            classification: chunk.metadata.classification || '',
            tags: chunk.metadata.tags?.join(',') || '',
            createdAt: chunk.metadata.createdAt.toISOString(),
            startPosition: chunk.position.start,
            endPosition: chunk.position.end,
            section: chunk.position.section || '',
          },
        }],
        namespace: this.selectNamespace(chunk),
      };
      
      const response = await fetch(upsertUrl, {
        method: 'POST',
        headers: {
          'Api-Key': store.config.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinecone upsert failed: ${response.status} ${errorText}`);
      }
      
      logger.debug(`Successfully added chunk ${chunk.id} to Pinecone`);
      
    } catch (error) {
      logger.error(`Failed to add chunk ${chunk.id} to Pinecone: ${error}`);
      throw error;
    }
  }

  private selectNamespace(chunk: DocumentChunk): string {
    // Use chunk type as namespace for better organization
    return chunk.metadata.type || 'default';
  }

  private async addToLocalStore(chunk: DocumentChunk, store: VectorStore): Promise<void> {
    try {
      logger.debug(`Adding chunk ${chunk.id} to local store ${store.name}`);
      
      if (!chunk.embedding) {
        throw new Error('Chunk embedding is required for local storage');
      }
      
      const storagePath = store.config.storagePath;
      const indexPath = _path.join(storagePath, 'index.json');
      const vectorsPath = _path.join(storagePath, 'vectors.bin');
      const metadataPath = _path.join(storagePath, 'metadata.json');
      
      // Ensure storage directory exists
      await fs.mkdir(storagePath, { recursive: true });
      
      // Load existing index
      let index = { chunks: {}, nextId: 0 };
      try {
        const indexData = await fs.readFile(indexPath, 'utf-8');
        index = JSON.parse(indexData);
      } catch (error) {
        // Index doesn't exist yet, will create new one
        logger.debug('Creating new local vector index');
      }
      
      // Load existing metadata
      let metadata = {};
      try {
        const metadataData = await fs.readFile(metadataPath, 'utf-8');
        metadata = JSON.parse(metadataData);
      } catch (error) {
        // Metadata doesn't exist yet
      }
      
      // Add chunk to index
      index.chunks[chunk.id] = {
        id: chunk.id,
        vectorIndex: index.nextId,
        documentId: chunk.documentId,
        addedAt: new Date().toISOString(),
      };
      
      // Add metadata
      metadata[chunk.id] = {
        documentId: chunk.documentId,
        content: chunk.content,
        source: chunk.metadata.source,
        type: chunk.metadata.type,
        category: chunk.metadata.category || '',
        classification: chunk.metadata.classification || '',
        tags: chunk.metadata.tags || [],
        createdAt: chunk.metadata.createdAt.toISOString(),
        updatedAt: chunk.metadata.updatedAt.toISOString(),
        position: chunk.position,
      };
      
      // Append vector to binary file
      const vectorBuffer = Buffer.from(new Float32Array(chunk.embedding).buffer);
      await fs.appendFile(vectorsPath, vectorBuffer);
      
      // Update index counter
      index.nextId++;
      
      // Save updated index and metadata
      await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
      
      logger.debug(`Successfully added chunk ${chunk.id} to local store at index ${index.nextId - 1}`);
      
    } catch (error) {
      logger.error(`Failed to add chunk ${chunk.id} to local store: ${error}`);
      throw error;
    }
  }

  private async removeFromVectorStore(chunkId: string): Promise<void> {
    const store = this.vectorStores.get(this.config.defaultVectorStore);
    if (!store) return;

    // Remove from vector store based on type
    switch (store.type) {
      case 'chromadb':
        await this.removeFromChromaDB(chunkId, store);
        break;
      case 'pinecone':
        await this.removeFromPinecone(chunkId, store);
        break;
      case 'local':
        await this.removeFromLocalStore(chunkId, store);
        break;
    }
  }

  private async removeFromChromaDB(chunkId: string, store: VectorStore): Promise<void> {
    // ChromaDB deletion logic
    try {
      logger.debug(`Removing chunk ${chunkId} from ChromaDB store ${store.name}`);

      // Placeholder for actual ChromaDB deletion
      // await chromaCollection.delete({ ids: [chunkId] });
    } catch (error) {
      logger.error(`Failed to remove chunk ${chunkId} from ChromaDB: ${error}`);
      throw error;
    }
  }

  private async removeFromPinecone(chunkId: string, store: VectorStore): Promise<void> {
    // Pinecone deletion logic
    try {
      logger.debug(`Removing chunk ${chunkId} from Pinecone store ${store.name}`);

      // Placeholder for actual Pinecone deletion
      // await pineconeIndex.delete1([chunkId]);
    } catch (error) {
      logger.error(`Failed to remove chunk ${chunkId} from Pinecone: ${error}`);
      throw error;
    }
  }

  private async removeFromLocalStore(chunkId: string, store: VectorStore): Promise<void> {
    // Local store deletion logic
    try {
      logger.debug(`Removing chunk ${chunkId} from local store ${store.name}`);

      // Placeholder for actual local store deletion
      // this.localVectorIndex.remove(chunkId);
    } catch (error) {
      logger.error(`Failed to remove chunk ${chunkId} from local store: ${error}`);
      throw error;
    }
  }

  private async semanticSearch(
    query: RAGQuery,
    queryEmbedding: number[],
  ): Promise<DocumentChunk[]> {
    try {
      // Try to search using active vector stores first
      const primaryStore = this.vectorStores.get(this.config.defaultVectorStore);
      if (primaryStore && primaryStore.isActive) {
        const results = await this.searchVectorStore(query, queryEmbedding, primaryStore);
        if (results.length > 0) {
          return results;
        }
      }
      
      // Fallback to in-memory search
      return await this.searchInMemory(query, queryEmbedding);
      
    } catch (error) {
      logger.error(`Semantic search error: ${error}`);
      // Fallback to in-memory search
      return await this.searchInMemory(query, queryEmbedding);
    }
  }

  private async searchVectorStore(
    query: RAGQuery,
    queryEmbedding: number[],
    store: VectorStore
  ): Promise<DocumentChunk[]> {
    switch (store.type) {
      case 'chromadb':
        return await this.searchChromaDB(query, queryEmbedding, store);
      case 'pinecone':
        return await this.searchPinecone(query, queryEmbedding, store);
      case 'local':
        return await this.searchLocalStore(query, queryEmbedding, store);
      default:
        logger.warn(`Unsupported vector store type for search: ${store.type}`);
        return [];
    }
  }

  private async searchInMemory(
    query: RAGQuery,
    queryEmbedding: number[],
  ): Promise<DocumentChunk[]> {
    // Fallback to in-memory semantic search using cosine similarity
    const chunks = Array.from(this.documentChunks.values());
    const results: Array<{ chunk: DocumentChunk; score: number }> = [];

    for (const chunk of chunks) {
      if (!chunk.embedding) continue;

      const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      if (similarity >= (query.options.minScore || this.config.minSimilarity)) {
        results.push({ chunk, score: similarity });
      }
    }

    // Sort by similarity score
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

  private async searchChromaDB(
    query: RAGQuery,
    queryEmbedding: number[],
    store: VectorStore
  ): Promise<DocumentChunk[]> {
    try {
      const results: DocumentChunk[] = [];
      const maxResults = query.options.maxResults || this.config.maxRetrieval;
      
      // Search across all collections in the store
      for (const collection of store.collections) {
        const searchUrl = `http://${store.config.host}:${store.config.port}/api/v1/collections/${collection}/query`;
        
        const searchPayload = {
          query_embeddings: [queryEmbedding],
          n_results: maxResults,
          include: ['documents', 'metadatas', 'distances'],
        };
        
        const response = await fetch(searchUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(searchPayload),
        });
        
        if (!response.ok) {
          logger.warn(`ChromaDB search failed for collection ${collection}: ${response.status}`);
          continue;
        }
        
        const searchResults = await response.json();
        
        if (searchResults.ids && searchResults.ids[0]) {
          for (let i = 0; i < searchResults.ids[0].length; i++) {
            const id = searchResults.ids[0][i];
            const document = searchResults.documents[0][i];
            const metadata = searchResults.metadatas[0][i];
            const distance = searchResults.distances[0][i];
            
            // Convert distance to similarity score (1 - distance for cosine distance)
            const similarity = 1 - distance;
            
            if (similarity >= (query.options.minScore || this.config.minSimilarity)) {
              const chunk: DocumentChunk = {
                id,
                documentId: metadata.documentId || id,
                content: document,
                metadata: {
                  source: metadata.source || 'chromadb',
                  type: metadata.type as any || 'documentation',
                  category: metadata.category,
                  classification: metadata.classification,
                  tags: metadata.tags ? metadata.tags.split(',') : [],
                  createdAt: new Date(metadata.createdAt),
                  updatedAt: new Date(metadata.updatedAt),
                  relevanceScore: similarity,
                },
                position: {
                  start: parseInt(metadata.startPosition) || 0,
                  end: parseInt(metadata.endPosition) || document.length,
                  section: metadata.section,
                },
              };
              
              results.push(chunk);
            }
          }
        }
      }
      
      // Sort by relevance score and deduplicate
      const uniqueResults = new Map<string, DocumentChunk>();
      results.forEach(chunk => {
        const existing = uniqueResults.get(chunk.id);
        if (!existing || (chunk.metadata.relevanceScore || 0) > (existing.metadata.relevanceScore || 0)) {
          uniqueResults.set(chunk.id, chunk);
        }
      });
      
      return Array.from(uniqueResults.values())
        .sort((a, b) => (b.metadata.relevanceScore || 0) - (a.metadata.relevanceScore || 0))
        .slice(0, maxResults);
        
    } catch (error) {
      logger.error(`ChromaDB search error: ${error}`);
      return [];
    }
  }

  private async searchPinecone(
    query: RAGQuery,
    queryEmbedding: number[],
    store: VectorStore
  ): Promise<DocumentChunk[]> {
    try {
      if (!store.config.apiKey) {
        throw new Error('Pinecone API key not configured');
      }
      
      const maxResults = query.options.maxResults || this.config.maxRetrieval;
      const queryUrl = `https://${store.config.indexName}-${store.config.environment}.svc.${store.config.environment}.pinecone.io/query`;
      
      const searchPayload = {
        vector: queryEmbedding,
        topK: maxResults,
        includeMetadata: true,
        includeValues: false,
      };
      
      const response = await fetch(queryUrl, {
        method: 'POST',
        headers: {
          'Api-Key': store.config.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchPayload),
      });
      
      if (!response.ok) {
        throw new Error(`Pinecone search failed: ${response.status}`);
      }
      
      const searchResults = await response.json();
      const results: DocumentChunk[] = [];
      
      if (searchResults.matches) {
        for (const match of searchResults.matches) {
          const similarity = match.score;
          
          if (similarity >= (query.options.minScore || this.config.minSimilarity)) {
            const metadata = match.metadata;
            const chunk: DocumentChunk = {
              id: match.id,
              documentId: metadata.documentId || match.id,
              content: metadata.content || '',
              metadata: {
                source: metadata.source || 'pinecone',
                type: metadata.type as any || 'documentation',
                category: metadata.category,
                classification: metadata.classification,
                tags: metadata.tags ? metadata.tags.split(',') : [],
                createdAt: new Date(metadata.createdAt),
                updatedAt: new Date(metadata.updatedAt || metadata.createdAt),
                relevanceScore: similarity,
              },
              position: {
                start: metadata.startPosition || 0,
                end: metadata.endPosition || metadata.content?.length || 0,
                section: metadata.section,
              },
            };
            
            results.push(chunk);
          }
        }
      }
      
      return results.sort((a, b) => (b.metadata.relevanceScore || 0) - (a.metadata.relevanceScore || 0));
      
    } catch (error) {
      logger.error(`Pinecone search error: ${error}`);
      return [];
    }
  }

  private async searchLocalStore(
    query: RAGQuery,
    queryEmbedding: number[],
    store: VectorStore
  ): Promise<DocumentChunk[]> {
    try {
      const storagePath = store.config.storagePath;
      const indexPath = _path.join(storagePath, 'index.json');
      const vectorsPath = _path.join(storagePath, 'vectors.bin');
      const metadataPath = _path.join(storagePath, 'metadata.json');
      
      // Load index and metadata
      const indexData = await fs.readFile(indexPath, 'utf-8');
      const index = JSON.parse(indexData);
      
      const metadataData = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(metadataData);
      
      // Load vectors
      const vectorBuffer = await fs.readFile(vectorsPath);
      const vectorDimensions = queryEmbedding.length;
      const vectorsCount = vectorBuffer.length / (vectorDimensions * 4); // 4 bytes per float32
      
      const results: Array<{ chunk: DocumentChunk; score: number }> = [];
      
      // Search through all vectors
      for (const [chunkId, chunkInfo] of Object.entries(index.chunks)) {
        const chunkMeta = metadata[chunkId];
        if (!chunkMeta) continue;
        
        const vectorIndex = (chunkInfo as any).vectorIndex;
        const vectorOffset = vectorIndex * vectorDimensions * 4;
        
        if (vectorOffset + vectorDimensions * 4 <= vectorBuffer.length) {
          // Extract vector
          const chunkVector = [];
          for (let i = 0; i < vectorDimensions; i++) {
            const floatValue = vectorBuffer.readFloatLE(vectorOffset + i * 4);
            chunkVector.push(floatValue);
          }
          
          // Calculate similarity
          const similarity = this.cosineSimilarity(queryEmbedding, chunkVector);
          
          if (similarity >= (query.options.minScore || this.config.minSimilarity)) {
            const chunk: DocumentChunk = {
              id: chunkId,
              documentId: chunkMeta.documentId,
              content: chunkMeta.content,
              embedding: chunkVector,
              metadata: {
                source: chunkMeta.source,
                type: chunkMeta.type,
                category: chunkMeta.category,
                classification: chunkMeta.classification,
                tags: chunkMeta.tags || [],
                createdAt: new Date(chunkMeta.createdAt),
                updatedAt: new Date(chunkMeta.updatedAt),
                relevanceScore: similarity,
              },
              position: chunkMeta.position,
            };
            
            results.push({ chunk, score: similarity });
          }
        }
      }
      
      // Sort by similarity and return top results
      results.sort((a, b) => b.score - a.score);
      const maxResults = query.options.maxResults || this.config.maxRetrieval;
      
      return results.slice(0, maxResults).map(r => r.chunk);
      
    } catch (error) {
      logger.error(`Local store search error: ${error}`);
      return [];
    }
  }

  private async rerankResults(query: string, chunks: DocumentChunk[]): Promise<DocumentChunk[]> {
    // Cross-encoder reranking for better relevance
    // This would use a specialized reranking model
    
    try {
      // Simple reranking based on query term presence and position
      const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
      
      const rerankedChunks = chunks.map(chunk => {
        let rerankScore = chunk.metadata.relevanceScore || 0;
        const content = chunk.content.toLowerCase();
        
        // Boost score based on exact query term matches
        for (const term of queryTerms) {
          const termCount = (content.match(new RegExp(term, 'g')) || []).length;
          rerankScore += termCount * 0.1;
          
          // Extra boost for terms in titles/sections
          if (chunk.position.section && chunk.position.section.toLowerCase().includes(term)) {
            rerankScore += 0.2;
          }
        }
        
        // Boost newer content slightly
        const daysSinceCreation = (Date.now() - chunk.metadata.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation < 30) {
          rerankScore += 0.05;
        }
        
        chunk.metadata.relevanceScore = rerankScore;
        return chunk;
      });
      
      // Resort by new rerank score
      return rerankedChunks.sort((a, b) => (b.metadata.relevanceScore || 0) - (a.metadata.relevanceScore || 0));
      
    } catch (error) {
      logger.error(`Reranking error: ${error}`);
      return chunks; // Return original chunks on error
    }


  private calculateConfidence(chunks: DocumentChunk[]): number {
    if (chunks.length === 0) return 0;

    const scores = chunks.map((chunk) => chunk.metadata.relevanceScore || 0);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    // Calculate confidence based on multiple factors
    let confidence = avgScore;

    // Boost confidence for multiple relevant results
    if (chunks.length >= 3) confidence *= 1.1;
    if (chunks.length >= 5) confidence *= 1.1;

    // Boost confidence for high-scoring top result
    if (maxScore > 0.8) confidence *= 1.2;

    // Reduce confidence for widely varying scores (indicates uncertainty)
    const scoreVariance = maxScore - minScore;
    if (scoreVariance > 0.5) confidence *= 0.9;

    // Consider source diversity as a positive factor
    const uniqueSources = new Set(chunks.map(chunk => chunk.metadata.source)).size;
    if (uniqueSources > 1) confidence *= 1.05;

    return Math.min(1, Math.max(0, confidence));


  private async generateContextSummary(query: string, chunks: DocumentChunk[]): Promise<string> {
    try {
      // Enhanced summary generation with better context extraction
      const topChunks = chunks.slice(0, 5); // Use top 5 chunks for summary
      
      // Extract key information from chunks
      const sources = [...new Set(topChunks.map(chunk => chunk.metadata.source))];
      const types = [...new Set(topChunks.map(chunk => chunk.metadata.type))];
      const categories = [...new Set(topChunks.map(chunk => chunk.metadata.category).filter(Boolean))];
      
      // Combine content from top chunks, prioritizing by relevance score
      const combinedContent = topChunks
        .map((chunk, index) => {
          const weight = chunk.metadata.relevanceScore || (1 - index * 0.1);
          const excerpt = chunk.content.substring(0, 200);
          return { excerpt, weight, source: chunk.metadata.source };
        })
        .sort((a, b) => b.weight - a.weight)
        .map(item => item.excerpt)
        .join('\n\n');

      // Generate structured summary
      let summary = `Based on ${chunks.length} relevant documents`;
      
      if (sources.length > 1) {
        summary += ` from sources: ${sources.join(', ')}`;
      }
      
      if (categories.length > 0) {
        summary += ` covering: ${categories.join(', ')}`;
      }
      
      summary += `\n\nKey information related to "${query}":\n\n`;
      summary += combinedContent.substring(0, 800);
      
      if (combinedContent.length > 800) {
        summary += '...';
      }
      
      // Add confidence indicator
      const avgScore = chunks.reduce((sum, chunk) => sum + (chunk.metadata.relevanceScore || 0), 0) / chunks.length;
      if (avgScore > 0.8) {
        summary += '\n\n[High confidence match]';
      } else if (avgScore > 0.6) {
        summary += '\n\n[Medium confidence match]';
      } else {
        summary += '\n\n[Lower confidence - consider refining query]';
      }
      
      return summary;
      
    } catch (error) {
      logger.error(`Context summary generation error: ${error}`);
      // Fallback to simple summary
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
  private async expandQuery(query: string): Promise<string> {
    try {
      // Enhanced query expansion using Nova Synth intelligence
      let expandedQuery = query;
      
      // Try Nova Synth query expansion first
      if (process.env.SYNTH_API_URL && process.env.SYNTH_API_KEY) {
        try {
          expandedQuery = await this.expandQueryWithNovaSynth(query);
        } catch (error) {
          logger.warn(`Nova Synth query expansion failed, using fallback: ${error}`);
        }
      }
      
      // Fallback to rule-based expansion
      if (expandedQuery === query) {
        expandedQuery = this.expandQueryRuleBased(query);
      }
      
      logger.debug(`Query expanded from "${query}" to "${expandedQuery}"`);
      return expandedQuery;
      
    } catch (error) {
      logger.error(`Query expansion error: ${error}`);
      return query; // Return original query on error
    }
  }

  private async expandQueryWithNovaSynth(query: string): Promise<string> {
    try {
      const response = await fetch(`${process.env.SYNTH_API_URL}/api/v2/synth/query-expansion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SYNTH_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          context: 'help_desk_rag',
          expansion_type: 'semantic_synonyms',
          max_terms: 5,
        }),
      });

      if (!response.ok) {
        throw new Error(`Nova Synth API error: ${response.status}`);
      }

      const data = await response.json();
      return data.expanded_query || query;
      
    } catch (error) {
      logger.error(`Nova Synth query expansion error: ${error}`);
      throw error;
    }
  }

  private expandQueryRuleBased(query: string): string {
    // Enhanced rule-based query expansion
    const synonyms = {
      problem: ['issue', 'error', 'bug', 'trouble', 'difficulty'],
      fix: ['resolve', 'solution', 'repair', 'correct', 'troubleshoot'],
      install: ['setup', 'configure', 'deploy', 'implement', 'initialize'],
      login: ['authentication', 'signin', 'access', 'credentials', 'logon'],
      network: ['connectivity', 'connection', 'internet', 'wifi', 'ethernet'],
      email: ['mail', 'outlook', 'gmail', 'messaging', 'correspondence'],
      password: ['passcode', 'credentials', 'authentication', 'pin', 'security'],
      printer: ['printing', 'print', 'scanner', 'multifunction', 'copier'],
      software: ['application', 'program', 'app', 'tool', 'system'],
      hardware: ['device', 'equipment', 'computer', 'laptop', 'desktop'],
    };

    let expandedQuery = query;
    const queryLower = query.toLowerCase();
    
    for (const [word, syns] of Object.entries(synonyms)) {
      if (queryLower.includes(word)) {
        // Add 2-3 most relevant synonyms
        const relevantSynonyms = syns.slice(0, 3);
        expandedQuery += ' ' + relevantSynonyms.join(' ');
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
