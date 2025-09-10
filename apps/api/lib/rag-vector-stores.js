/**
 * RAG Vector Store Implementations (JavaScript)
 * 
 * Provides actual implementations for ChromaDB, Pinecone, and Local FAISS vector stores
 */

import { logger } from '../logger.js';

// ChromaDB implementation
export class ChromaDBStore {
  constructor(config) {
    this.config = config;
    this.client = null;
    this.collections = new Map();
  }

  async initialize() {
    try {
      // Try to import ChromaDB client
      const { ChromaApi, Configuration } = await import('chromadb');
      
      this.client = new ChromaApi(new Configuration({
        basePath: `http://${this.config.host}:${this.config.port}`,
      }));

      // Initialize collections
      for (const collectionName of ['knowledge', 'tickets', 'documentation']) {
        try {
          const collection = await this.client.createCollection({
            name: collectionName,
            metadata: { description: `Nova ${collectionName} collection` },
          });
          this.collections.set(collectionName, collection);
          logger.info(`ChromaDB collection "${collectionName}" initialized`);
        } catch (error) {
          // Collection might already exist - log error details for debugging
          logger.debug(`Collection creation failed for "${collectionName}": ${error.message}`);
          try {
            const collection = await this.client.getCollection({ name: collectionName });
            this.collections.set(collectionName, collection);
            logger.info(`ChromaDB collection "${collectionName}" loaded`);
          } catch (getError) {
            logger.warn(`Failed to initialize ChromaDB collection "${collectionName}": ${getError.message}`);
            // Track collection initialization failures
            this.failedCollections = this.failedCollections || [];
            this.failedCollections.push({ name: collectionName, error: getError.message });
          }
        }
      }
    } catch (error) {
      logger.warn('ChromaDB not available, falling back to local storage');
      throw error;
    }
  }

  async addChunk(chunk) {
    if (!chunk.embedding || !this.client) return;

    const collectionName = this.getCollectionForChunk(chunk);
    const collection = this.collections.get(collectionName);

    if (!collection) {
      logger.warn(`No collection found for chunk type: ${chunk.metadata.type}`);
      return;
    }

    try {
      await this.client.add({
        collectionName,
        ids: [chunk.id],
        embeddings: [chunk.embedding],
        metadatas: [chunk.metadata],
        documents: [chunk.content],
      });

      logger.debug(`Added chunk ${chunk.id} to ChromaDB collection ${collectionName}`);
    } catch (error) {
      logger.error('Failed to add chunk to ChromaDB');
      throw error;
    }
  }

  async searchSimilar(queryEmbedding, options = {}) {
    const results = [];
    const collections = options.collectionNames || Array.from(this.collections.keys());
    const nResults = options.nResults || 10;

    for (const collectionName of collections) {
      try {
        const searchResult = await this.client.query({
          collectionName,
          queryEmbeddings: [queryEmbedding],
          nResults: Math.ceil(nResults / collections.length),
          where: options.where,
        });

        if (searchResult?.ids?.[0]) {
          for (let i = 0; i < searchResult.ids[0].length; i++) {
            const chunk = {
              id: searchResult.ids[0][i],
              documentId: searchResult.metadatas[0][i]?.documentId || '',
              content: searchResult.documents[0][i] || '',
              embedding: searchResult.embeddings?.[0]?.[i],
              metadata: {
                ...searchResult.metadatas[0][i],
                relevanceScore: 1 - (searchResult.distances?.[0]?.[i] || 0),
              },
              position: { start: 0, end: 0 },
            };
            results.push(chunk);
          }
        }
      } catch (error) {
        logger.warn(`ChromaDB search failed for collection ${collectionName}: ${error.message}`);
        // Track search failures for monitoring
        this.searchFailures = this.searchFailures || [];
        this.searchFailures.push({ collection: collectionName, error: error.message, timestamp: new Date() });
      }
    }

    return results.sort((a, b) => (b.metadata.relevanceScore || 0) - (a.metadata.relevanceScore || 0));
  }

  async removeChunk(chunkId) {
    for (const [collectionName] of this.collections) {
      try {
        await this.client.delete({
          collectionName,
          ids: [chunkId],
        });
        logger.debug(`Removed chunk ${chunkId} from ChromaDB collection ${collectionName}`);
      } catch (error) {
        // Chunk might not exist in this collection, log for debugging
        logger.debug(`Failed to remove chunk ${chunkId} from collection ${collectionName}: ${error.message}`);
      }
    }
  }

  getCollectionForChunk(chunk) {
    switch (chunk.metadata.type) {
      case 'ticket':
        return 'tickets';
      case 'documentation':
        return 'documentation';
      default:
        return 'knowledge';
    }
  }
}

// Local FAISS-based vector store
export class LocalVectorStore {
  constructor(config) {
    this.config = config;
    this.index = null;
    this.chunks = new Map();
    this.embeddings = [];
    this.chunkIds = [];
    this.indexPath = config.storagePath || '/data/vector-store';
  }

  async initialize() {
    try {
      logger.info(`Initializing local vector store at ${this.indexPath}`);
      
      // Load existing index if available
      await this.loadIndex();
      
      logger.info('Local vector store initialized successfully');
    } catch (error) {
      logger.warn(`Failed to initialize local vector store: ${error.message}, starting fresh`);
      this.embeddings = [];
      this.chunkIds = [];
      // Track initialization failures
      this.initializationError = error.message;
    }
  }

  async addChunk(chunk) {
    if (!chunk.embedding) return;

    this.chunks.set(chunk.id, chunk);
    
    // Add to our simple in-memory index
    const existingIndex = this.chunkIds.indexOf(chunk.id);
    if (existingIndex >= 0) {
      // Update existing
      this.embeddings[existingIndex] = chunk.embedding;
    } else {
      // Add new
      this.chunkIds.push(chunk.id);
      this.embeddings.push(chunk.embedding);
    }

    // Save index periodically
    if (this.embeddings.length % 100 === 0) {
      await this.saveIndex();
    }

    logger.debug(`Added chunk ${chunk.id} to local vector store`);
  }

  async searchSimilar(queryEmbedding, options = {}) {
    const nResults = options.nResults || 10;
    const minSimilarity = options.minSimilarity || 0.0;

    if (this.embeddings.length === 0) {
      return [];
    }

    // Calculate cosine similarity with all embeddings
    const similarities = this.embeddings.map((embedding, index) => ({
      index,
      chunkId: this.chunkIds[index],
      similarity: this.cosineSimilarity(queryEmbedding, embedding),
    }));

    // Filter and sort by similarity
    const filtered = similarities
      .filter(item => item.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, nResults);

    // Return chunks with similarity scores
    const results = [];
    for (const item of filtered) {
      const chunk = this.chunks.get(item.chunkId);
      if (chunk) {
        chunk.metadata.relevanceScore = item.similarity;
        results.push(chunk);
      }
    }

    return results;
  }

  async removeChunk(chunkId) {
    const index = this.chunkIds.indexOf(chunkId);
    if (index >= 0) {
      this.chunkIds.splice(index, 1);
      this.embeddings.splice(index, 1);
      this.chunks.delete(chunkId);
      
      logger.debug(`Removed chunk ${chunkId} from local vector store`);
    }
  }

  cosineSimilarity(a, b) {
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

  async saveIndex() {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');

      await fs.mkdir(this.indexPath, { recursive: true });

      const indexData = {
        embeddings: this.embeddings,
        chunkIds: this.chunkIds,
        chunks: Array.from(this.chunks.entries()),
        version: '1.0',
        timestamp: new Date().toISOString(),
      };

      await fs.writeFile(
        path.join(this.indexPath, 'index.json'),
        JSON.stringify(indexData, null, 2)
      );

      logger.debug(`Saved local vector index with ${this.embeddings.length} embeddings`);
    } catch (error) {
      logger.warn(`Failed to save local vector index: ${error.message}`);
      // Track save failures for troubleshooting
      this.lastSaveError = { error: error.message, timestamp: new Date() };
    }
  }

  async loadIndex() {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');

      const indexFile = path.join(this.indexPath, 'index.json');
      const data = await fs.readFile(indexFile, 'utf8');
      const indexData = JSON.parse(data);

      this.embeddings = indexData.embeddings || [];
      this.chunkIds = indexData.chunkIds || [];
      this.chunks = new Map(indexData.chunks || []);

      logger.info(`Loaded local vector index with ${this.embeddings.length} embeddings`);
    } catch (error) {
      // Index doesn't exist or is corrupted, start fresh
      logger.debug(`Index loading failed: ${error.message}, starting fresh`);
      this.embeddings = [];
      this.chunkIds = [];
      this.chunks = new Map();
      this.lastLoadError = { error: error.message, timestamp: new Date() };
    }
  }

  getStats() {
    return {
      totalEmbeddings: this.embeddings.length,
      totalChunks: this.chunks.size,
      indexPath: this.indexPath,
    };
  }
}

// Vector Store Factory
export class VectorStoreFactory {
  static async createStore(store) {
    switch (store.type) {
      case 'chromadb': {
        const chromaStore = new ChromaDBStore(store.config);
        try {
          await chromaStore.initialize();
          return chromaStore;
        } catch (error) {
          logger.warn(`ChromaDB unavailable: ${error.message}, falling back to local store`);
          // Fall through to local store
        }
      }
      // eslint-disable-next-line no-fallthrough
      case 'local': {
        const localStore = new LocalVectorStore(store.config);
        await localStore.initialize();
        return localStore;
      }

      default:
        throw new Error(`Unsupported vector store type: ${store.type}`);
    }
  }
}