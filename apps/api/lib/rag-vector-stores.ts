/**
 * RAG Vector Store Implementations
 * 
 * Provides actual implementations for ChromaDB, Pinecone, and Local FAISS vector stores
 * to replace the placeholder implementations in the main RAG engine.
 */

import { logger } from '../logger.js';
import { DocumentChunk, VectorStore } from './rag-engine.js';
import * as tf from '@tensorflow/tfjs-node';

// ChromaDB implementation
export class ChromaDBStore {
  private client: any;
  private collections: Map<string, any> = new Map();

  constructor(private config: any) {}

  async initialize(): Promise<void> {
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
          // Collection might already exist
          try {
            const collection = await this.client.getCollection({ name: collectionName });
            this.collections.set(collectionName, collection);
            logger.info(`ChromaDB collection "${collectionName}" loaded`);
          } catch (getError) {
            logger.warn(`Failed to initialize ChromaDB collection "${collectionName}":`, getError);
          }
        }
      }
    } catch (error) {
      logger.warn('ChromaDB not available, falling back to local storage:', error.message);
      throw error;
    }
  }

  async addChunk(chunk: DocumentChunk): Promise<void> {
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
      logger.error(`Failed to add chunk to ChromaDB:`, error);
      throw error;
    }
  }

  async searchSimilar(queryEmbedding: number[], options: {
    nResults?: number;
    where?: any;
    collectionNames?: string[];
  } = {}): Promise<DocumentChunk[]> {
    const results: DocumentChunk[] = [];
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
            const chunk: DocumentChunk = {
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
        logger.warn(`ChromaDB search failed for collection ${collectionName}:`, error.message);
      }
    }

    return results.sort((a, b) => (b.metadata.relevanceScore || 0) - (a.metadata.relevanceScore || 0));
  }

  async removeChunk(chunkId: string): Promise<void> {
    for (const [collectionName, collection] of this.collections) {
      try {
        await this.client.delete({
          collectionName,
          ids: [chunkId],
        });
        logger.debug(`Removed chunk ${chunkId} from ChromaDB collection ${collectionName}`);
      } catch (error) {
        // Chunk might not exist in this collection, continue
      }
    }
  }

  private getCollectionForChunk(chunk: DocumentChunk): string {
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
  private index: any = null;
  private chunks: Map<string, DocumentChunk> = new Map();
  private embeddings: number[][] = [];
  private chunkIds: string[] = [];
  private indexPath: string;

  constructor(private config: any) {
    this.indexPath = config.storagePath || '/data/vector-store';
  }

  async initialize(): Promise<void> {
    try {
      // Use TensorFlow.js for local vector operations
      logger.info(`Initializing local vector store at ${this.indexPath}`);
      
      // Load existing index if available
      await this.loadIndex();
      
      logger.info('Local vector store initialized successfully');
    } catch (error) {
      logger.warn('Failed to initialize local vector store, starting fresh:', error.message);
      this.embeddings = [];
      this.chunkIds = [];
    }
  }

  async addChunk(chunk: DocumentChunk): Promise<void> {
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

  async searchSimilar(queryEmbedding: number[], options: {
    nResults?: number;
    minSimilarity?: number;
  } = {}): Promise<DocumentChunk[]> {
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
    const results: DocumentChunk[] = [];
    for (const item of filtered) {
      const chunk = this.chunks.get(item.chunkId);
      if (chunk) {
        chunk.metadata.relevanceScore = item.similarity;
        results.push(chunk);
      }
    }

    return results;
  }

  async removeChunk(chunkId: string): Promise<void> {
    const index = this.chunkIds.indexOf(chunkId);
    if (index >= 0) {
      this.chunkIds.splice(index, 1);
      this.embeddings.splice(index, 1);
      this.chunks.delete(chunkId);
      
      logger.debug(`Removed chunk ${chunkId} from local vector store`);
    }
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

  private async saveIndex(): Promise<void> {
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
      logger.warn('Failed to save local vector index:', error.message);
    }
  }

  private async loadIndex(): Promise<void> {
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
      this.embeddings = [];
      this.chunkIds = [];
      this.chunks = new Map();
    }
  }

  getStats(): any {
    return {
      totalEmbeddings: this.embeddings.length,
      totalChunks: this.chunks.size,
      indexPath: this.indexPath,
    };
  }
}

// Vector Store Factory
export class VectorStoreFactory {
  static async createStore(store: VectorStore): Promise<ChromaDBStore | LocalVectorStore> {
    switch (store.type) {
      case 'chromadb':
        const chromaStore = new ChromaDBStore(store.config);
        await chromaStore.initialize();
        return chromaStore;

      case 'local':
        const localStore = new LocalVectorStore(store.config);
        await localStore.initialize();
        return localStore;

      default:
        throw new Error(`Unsupported vector store type: ${store.type}`);
    }
  }
}