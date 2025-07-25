import { Client } from '@elastic/elasticsearch';
import { logger } from '../logger.js';

/**
 * Elasticsearch Manager for Nova Universe
 * Provides search capabilities across tickets, knowledge base, and other content
 */
class ElasticsearchManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.indices = {
      tickets: 'nova-tickets',
      knowledge: 'nova-knowledge-base',
      assets: 'nova-assets',
      users: 'nova-users',
      logs: 'nova-logs'
    };
  }

  /**
   * Initialize Elasticsearch connection
   */
  async initialize() {
    try {
      const config = {
        node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
        auth: process.env.ELASTICSEARCH_AUTH ? {
          username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
          password: process.env.ELASTICSEARCH_PASSWORD || 'password'
        } : undefined,
        tls: process.env.ELASTICSEARCH_TLS === 'true' ? {
          ca: process.env.ELASTICSEARCH_CA_CERT,
          rejectUnauthorized: process.env.ELASTICSEARCH_VERIFY_CERTS !== 'false'
        } : undefined,
        requestTimeout: parseInt(process.env.ELASTICSEARCH_REQUEST_TIMEOUT || '30000'),
        pingTimeout: parseInt(process.env.ELASTICSEARCH_PING_TIMEOUT || '3000')
      };

      this.client = new Client(config);
      
      // Test connection
      await this.client.ping();
      this.isConnected = true;
      
      logger.info('✅ Elasticsearch connected successfully');
      await this.ensureIndicesExist();
      
    } catch (error) {
      this.isConnected = false;
      logger.error('❌ Elasticsearch connection failed:', error.message);
      
      // Don't throw in development to allow app to continue without search
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }

  /**
   * Ensure all required indices exist with proper mappings
   */
  async ensureIndicesExist() {
    if (!this.isConnected) return;

    try {
      // Tickets index
      await this.createIndexIfNotExists(this.indices.tickets, {
        mappings: {
          properties: {
            id: { type: 'keyword' },
            title: { type: 'text', analyzer: 'standard' },
            description: { type: 'text', analyzer: 'standard' },
            status: { type: 'keyword' },
            priority: { type: 'keyword' },
            category: { type: 'keyword' },
            assignee: { type: 'keyword' },
            reporter: { type: 'keyword' },
            tags: { type: 'keyword' },
            created_at: { type: 'date' },
            updated_at: { type: 'date' },
            content_vector: { type: 'dense_vector', dims: 384 }
          }
        }
      });

      // Knowledge base index
      await this.createIndexIfNotExists(this.indices.knowledge, {
        mappings: {
          properties: {
            id: { type: 'keyword' },
            title: { type: 'text', analyzer: 'standard' },
            content: { type: 'text', analyzer: 'standard' },
            category: { type: 'keyword' },
            tags: { type: 'keyword' },
            author: { type: 'keyword' },
            status: { type: 'keyword' },
            created_at: { type: 'date' },
            updated_at: { type: 'date' },
            content_vector: { type: 'dense_vector', dims: 384 }
          }
        }
      });

      // Assets index
      await this.createIndexIfNotExists(this.indices.assets, {
        mappings: {
          properties: {
            id: { type: 'keyword' },
            name: { type: 'text', analyzer: 'standard' },
            description: { type: 'text', analyzer: 'standard' },
            type: { type: 'keyword' },
            location: { type: 'keyword' },
            status: { type: 'keyword' },
            tags: { type: 'keyword' },
            created_at: { type: 'date' },
            updated_at: { type: 'date' }
          }
        }
      });

      // Logs index
      await this.createIndexIfNotExists(this.indices.logs, {
        mappings: {
          properties: {
            id: { type: 'keyword' },
            level: { type: 'keyword' },
            message: { type: 'text', analyzer: 'standard' },
            source: { type: 'keyword' },
            user_id: { type: 'keyword' },
            ip_address: { type: 'ip' },
            timestamp: { type: 'date' },
            metadata: { type: 'object' }
          }
        }
      });

      logger.info('📝 Elasticsearch indices verified/created successfully');
    } catch (error) {
      logger.error('Failed to create Elasticsearch indices:', error.message);
    }
  }

  async createIndexIfNotExists(indexName, settings) {
    try {
      const exists = await this.client.indices.exists({ index: indexName });
      if (!exists) {
        await this.client.indices.create({
          index: indexName,
          body: settings
        });
        logger.info(`Created index: ${indexName}`);
      }
    } catch (error) {
      logger.error(`Failed to create index ${indexName}:`, error.message);
    }
  }

  /**
   * Search tickets with lexical search
   */
  async searchTickets(query, options = {}) {
    if (!this.isConnected) {
      return { tickets: [], total: 0, message: 'Search unavailable' };
    }

    const {
      from = 0,
      size = 20,
      status,
      priority,
      assignee,
      category,
      sortBy = 'relevance'
    } = options;

    try {
      const must = [];
      const filter = [];

      // Add text search if query provided
      if (query && query.trim()) {
        must.push({
          multi_match: {
            query: query.trim(),
            fields: ['title^2', 'description', 'tags'],
            type: 'best_fields',
            fuzziness: 'AUTO'
          }
        });
      }

      // Add filters
      if (status) filter.push({ term: { status } });
      if (priority) filter.push({ term: { priority } });
      if (assignee) filter.push({ term: { assignee } });
      if (category) filter.push({ term: { category } });

      const searchBody = {
        query: {
          bool: {
            must: must.length > 0 ? must : [{ match_all: {} }],
            filter
          }
        },
        from,
        size,
        sort: this.getSortConfig(sortBy),
        highlight: {
          fields: {
            title: {},
            description: {}
          }
        }
      };

      const response = await this.client.search({
        index: this.indices.tickets,
        body: searchBody
      });

      return {
        tickets: response.body.hits.hits.map(hit => ({
          ...hit._source,
          _score: hit._score,
          _highlights: hit.highlight
        })),
        total: response.body.hits.total.value,
        took: response.body.took
      };

    } catch (error) {
      logger.error('Ticket search failed:', error.message);
      return { tickets: [], total: 0, error: error.message };
    }
  }

  /**
   * Search knowledge base
   */
  async searchKnowledgeBase(query, options = {}) {
    if (!this.isConnected) {
      return { articles: [], total: 0, message: 'Search unavailable' };
    }

    const { from = 0, size = 20, category, status = 'published' } = options;

    try {
      const must = [];
      const filter = [{ term: { status } }];

      if (query && query.trim()) {
        must.push({
          multi_match: {
            query: query.trim(),
            fields: ['title^3', 'content^2', 'tags'],
            type: 'best_fields',
            fuzziness: 'AUTO'
          }
        });
      }

      if (category) filter.push({ term: { category } });

      const response = await this.client.search({
        index: this.indices.knowledge,
        body: {
          query: {
            bool: {
              must: must.length > 0 ? must : [{ match_all: {} }],
              filter
            }
          },
          from,
          size,
          sort: [{ _score: { order: 'desc' } }, { updated_at: { order: 'desc' } }],
          highlight: {
            fields: {
              title: {},
              content: { fragment_size: 150, number_of_fragments: 3 }
            }
          }
        }
      });

      return {
        articles: response.body.hits.hits.map(hit => ({
          ...hit._source,
          _score: hit._score,
          _highlights: hit.highlight
        })),
        total: response.body.hits.total.value,
        took: response.body.took
      };

    } catch (error) {
      logger.error('Knowledge base search failed:', error.message);
      return { articles: [], total: 0, error: error.message };
    }
  }

  /**
   * Global search across multiple indices
   */
  async globalSearch(query, options = {}) {
    if (!this.isConnected) {
      return { results: [], total: 0, message: 'Search unavailable' };
    }

    const { from = 0, size = 20 } = options;

    try {
      const searchBody = {
        query: {
          multi_match: {
            query: query.trim(),
            fields: ['title^2', 'description', 'content', 'name'],
            type: 'best_fields',
            fuzziness: 'AUTO'
          }
        },
        from,
        size,
        sort: [{ _score: { order: 'desc' } }],
        highlight: {
          fields: {
            title: {},
            description: {},
            content: { fragment_size: 150, number_of_fragments: 2 },
            name: {}
          }
        }
      };

      const response = await this.client.search({
        index: [this.indices.tickets, this.indices.knowledge, this.indices.assets],
        body: searchBody
      });

      return {
        results: response.body.hits.hits.map(hit => ({
          ...hit._source,
          _index: hit._index,
          _type: this.getTypeFromIndex(hit._index),
          _score: hit._score,
          _highlights: hit.highlight
        })),
        total: response.body.hits.total.value,
        took: response.body.took
      };

    } catch (error) {
      logger.error('Global search failed:', error.message);
      return { results: [], total: 0, error: error.message };
    }
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query, options = {}) {
    if (!this.isConnected || !query?.trim()) {
      return { suggestions: [] };
    }

    const { size = 5 } = options;

    try {
      const response = await this.client.search({
        index: [this.indices.tickets, this.indices.knowledge],
        body: {
          suggest: {
            text: query.trim(),
            suggestions: {
              phrase: {
                field: 'title',
                size,
                confidence: 0.7
              }
            }
          },
          size: 0
        }
      });

      const suggestions = response.body.suggest?.suggestions?.[0]?.options || [];
      return {
        suggestions: suggestions.map(s => ({
          text: s.text,
          score: s.score
        }))
      };

    } catch (error) {
      logger.error('Search suggestions failed:', error.message);
      return { suggestions: [] };
    }
  }

  /**
   * Search logs for administrative purposes
   */
  async searchLogs(query, options = {}) {
    if (!this.isConnected) {
      return { logs: [], total: 0, message: 'Search unavailable' };
    }

    const {
      from = 0,
      size = 50,
      level,
      source,
      startTime,
      endTime
    } = options;

    try {
      const must = [];
      const filter = [];

      if (query && query.trim()) {
        must.push({
          multi_match: {
            query: query.trim(),
            fields: ['message', 'source'],
            type: 'phrase_prefix'
          }
        });
      }

      if (level) filter.push({ term: { level } });
      if (source) filter.push({ term: { source } });

      if (startTime || endTime) {
        const range = {};
        if (startTime) range.gte = startTime;
        if (endTime) range.lte = endTime;
        filter.push({ range: { timestamp: range } });
      }

      const response = await this.client.search({
        index: this.indices.logs,
        body: {
          query: {
            bool: {
              must: must.length > 0 ? must : [{ match_all: {} }],
              filter
            }
          },
          from,
          size,
          sort: [{ timestamp: { order: 'desc' } }]
        }
      });

      return {
        logs: response.body.hits.hits.map(hit => hit._source),
        total: response.body.hits.total.value,
        took: response.body.took
      };

    } catch (error) {
      logger.error('Log search failed:', error.message);
      return { logs: [], total: 0, error: error.message };
    }
  }

  /**
   * Get search analytics
   */
  async getSearchAnalytics(options = {}) {
    if (!this.isConnected) {
      return { analytics: null, message: 'Analytics unavailable' };
    }

    try {
      // Get index stats
      const stats = await this.client.indices.stats({
        index: Object.values(this.indices)
      });

      // Get cluster health
      const health = await this.client.cluster.health();

      return {
        analytics: {
          cluster_health: health.body.status,
          indices: Object.entries(stats.body.indices || {}).map(([name, data]) => ({
            name,
            document_count: data.total?.docs?.count || 0,
            size_bytes: data.total?.store?.size_in_bytes || 0
          })),
          total_documents: Object.values(stats.body.indices || {}).reduce(
            (sum, idx) => sum + (idx.total?.docs?.count || 0), 0
          )
        }
      };

    } catch (error) {
      logger.error('Analytics failed:', error.message);
      return { analytics: null, error: error.message };
    }
  }

  /**
   * Index a document
   */
  async indexDocument(index, id, document) {
    if (!this.isConnected) return false;

    try {
      await this.client.index({
        index,
        id,
        body: {
          ...document,
          indexed_at: new Date().toISOString()
        }
      });
      return true;
    } catch (error) {
      logger.error(`Failed to index document ${id}:`, error.message);
      return false;
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(index, id) {
    if (!this.isConnected) return false;

    try {
      await this.client.delete({ index, id });
      return true;
    } catch (error) {
      logger.error(`Failed to delete document ${id}:`, error.message);
      return false;
    }
  }

  /**
   * Helper methods
   */
  getSortConfig(sortBy) {
    const sortConfigs = {
      relevance: [{ _score: { order: 'desc' } }],
      newest: [{ created_at: { order: 'desc' } }],
      oldest: [{ created_at: { order: 'asc' } }],
      updated: [{ updated_at: { order: 'desc' } }],
      priority: [{ priority: { order: 'asc' } }, { created_at: { order: 'desc' } }]
    };
    return sortConfigs[sortBy] || sortConfigs.relevance;
  }

  getTypeFromIndex(indexName) {
    const typeMap = {
      [this.indices.tickets]: 'ticket',
      [this.indices.knowledge]: 'knowledge',
      [this.indices.assets]: 'asset',
      [this.indices.logs]: 'log'
    };
    return typeMap[indexName] || 'unknown';
  }

  /**
   * Health check
   */
  async healthCheck() {
    if (!this.isConnected) {
      return { status: 'disconnected', message: 'Elasticsearch not connected' };
    }

    try {
      const health = await this.client.cluster.health();
      return {
        status: health.body.status,
        cluster_name: health.body.cluster_name,
        number_of_nodes: health.body.number_of_nodes,
        active_primary_shards: health.body.active_primary_shards
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

// Create singleton instance
const elasticManager = new ElasticsearchManager();

export default elasticManager;
