// src/lib/db/elastic.ts
// Elasticsearch client for full-text search and analytics
import { Client } from '@elastic/elasticsearch';
import { logger } from '../../../apps/api/logger.js';

// Configuration from environment with robust defaults and validation
const validateElasticConfig = () => {
  const config = {
    node: process.env.ELASTIC_URL || 'http://localhost:9200',
    auth: {
      username: process.env.ELASTIC_USERNAME || 'elastic',
      password: process.env.ELASTIC_PASSWORD || 'changeme'
    },
    requestTimeout: parseInt(process.env.ELASTIC_REQUEST_TIMEOUT || '30000'),
    pingTimeout: parseInt(process.env.ELASTIC_PING_TIMEOUT || '3000'),
    sniffOnStart: process.env.ELASTIC_SNIFF_ON_START === 'true',
    sniffInterval: process.env.ELASTIC_SNIFF_INTERVAL ? parseInt(process.env.ELASTIC_SNIFF_INTERVAL) : false,
    sniffOnConnectionFault: process.env.ELASTIC_SNIFF_ON_CONNECTION_FAULT === 'true',
    maxRetries: parseInt(process.env.ELASTIC_MAX_RETRIES || '3'),
    resurrectStrategy: 'ping' as const,
    compression: process.env.ELASTIC_COMPRESSION === 'true',
    ssl: process.env.ELASTIC_SSL_VERIFY === 'false' ? {
      rejectUnauthorized: false
    } : undefined
  };

  // Validate configuration
  if (!config.node) {
    throw new Error('ELASTIC_URL is required');
  }

  if (config.requestTimeout < 1000 || config.requestTimeout > 300000) {
    logger.warn('ELASTIC_REQUEST_TIMEOUT should be between 1000ms and 300000ms, using default 30000ms');
    config.requestTimeout = 30000;
  }

  if (config.maxRetries < 0 || config.maxRetries > 10) {
    logger.warn('ELASTIC_MAX_RETRIES should be between 0 and 10, using default 3');
    config.maxRetries = 3;
  }

  // Log configuration (without sensitive data)
  logger.info('Elasticsearch configuration loaded: ' + JSON.stringify({
    node: config.node,
    requestTimeout: config.requestTimeout,
    pingTimeout: config.pingTimeout,
    maxRetries: config.maxRetries,
    compression: config.compression,
    ssl: !!config.ssl
  }));

  return config;
};

const elasticConfig = validateElasticConfig();

// Create Elasticsearch client
export const elastic = new Client(elasticConfig);

// Enhanced Elasticsearch manager
class ElasticsearchManager {
  private client: Client;
  private isInitialized = false;

  constructor() {
    this.client = elastic;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      logger.info('Initializing Elasticsearch connection...');
      
      // Test connection
      const health = await this.client.cluster.health(); // TODO-LINT: move to async function
      logger.info(`Elasticsearch cluster status: ${health.status}`);
      
      // Setup index templates and mappings
      await this.setupIndexTemplates(); // TODO-LINT: move to async function
      
      this.isInitialized = true;
      logger.info('Elasticsearch initialization completed');
    } catch (error) {
      logger.error('Failed to initialize Elasticsearch: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  }

  private async setupIndexTemplates() {
    try {
      // Nova tickets index template
      await this.createIndexTemplate('nova_tickets', {
        index_patterns: ['nova_tickets*'],
        template: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            analysis: {
              analyzer: {
                nova_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'stop', 'snowball']
                }
              }
            }
          },
          mappings: {
            properties: {
              id: { type: 'keyword' },
              title: { 
                type: 'text', 
                analyzer: 'nova_analyzer',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              description: { 
                type: 'text', 
                analyzer: 'nova_analyzer' 
              },
              status: { type: 'keyword' },
              priority: { type: 'keyword' },
              category: { type: 'keyword' },
              userId: { type: 'keyword' },
              assigneeId: { type: 'keyword' },
              tags: { type: 'keyword' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' },
              resolvedAt: { type: 'date' },
              metadata: { type: 'object' }
            }
          }
        }
      }); // TODO-LINT: move to async function

      // Nova logs index template
      await this.createIndexTemplate('nova_logs', {
        index_patterns: ['nova_logs*'],
        template: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            index: {
              lifecycle: {
                name: 'nova_logs_policy',
                rollover_alias: 'nova_logs'
              }
            }
          },
          mappings: {
            properties: {
              timestamp: { type: 'date' },
              level: { type: 'keyword' },
              message: { 
                type: 'text',
                analyzer: 'nova_analyzer'
              },
              source: { type: 'keyword' },
              userId: { type: 'keyword' },
              sessionId: { type: 'keyword' },
              ip: { type: 'ip' },
              userAgent: { type: 'text' },
              action: { type: 'keyword' },
              details: { type: 'object' },
              error: {
                properties: {
                  name: { type: 'keyword' },
                  message: { type: 'text' },
                  stack: { type: 'text' }
                }
              }
            }
          }
        }
      }); // TODO-LINT: move to async function

      // Nova knowledge base index template
      await this.createIndexTemplate('nova_kb', {
        index_patterns: ['nova_kb*'],
        template: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            analysis: {
              analyzer: {
                kb_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'stop', 'snowball', 'stemmer']
                }
              }
            }
          },
          mappings: {
            properties: {
              id: { type: 'keyword' },
              title: { 
                type: 'text', 
                analyzer: 'kb_analyzer',
                boost: 2.0,
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              content: { 
                type: 'text', 
                analyzer: 'kb_analyzer' 
              },
              summary: { 
                type: 'text', 
                analyzer: 'kb_analyzer' 
              },
              category: { type: 'keyword' },
              tags: { type: 'keyword' },
              authorId: { type: 'keyword' },
              visibility: { type: 'keyword' },
              status: { type: 'keyword' },
              version: { type: 'integer' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' },
              viewCount: { type: 'integer' },
              rating: { type: 'float' },
              attachments: {
                type: 'nested',
                properties: {
                  name: { type: 'text' },
                  url: { type: 'keyword' },
                  type: { type: 'keyword' }
                }
              }
            }
          }
        }
      }); // TODO-LINT: move to async function

      // Nova AI context index template (for embeddings and semantic search)
      await this.createIndexTemplate('nova_ai_context', {
        index_patterns: ['nova_ai_context*'],
        template: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0
          },
          mappings: {
            properties: {
              id: { type: 'keyword' },
              content: { type: 'text' },
              embedding: { 
                type: 'dense_vector', 
                dims: 384 // Adjust based on your embedding model
              },
              contentType: { type: 'keyword' },
              sourceId: { type: 'keyword' },
              sourceType: { type: 'keyword' },
              metadata: { type: 'object' },
              createdAt: { type: 'date' }
            }
          }
        }
      }); // TODO-LINT: move to async function

      logger.info('Elasticsearch index templates created');
    } catch (error) {
      logger.error('Error setting up Elasticsearch index templates: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  private async createIndexTemplate(name: string, template: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
    try {
      await this.client.indices.putIndexTemplate({
        name,
        ...template
      }); // TODO-LINT: move to async function
      logger.debug(`Created Elasticsearch index template: ${name}`);
    } catch (error: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
      if (!error.message.includes('already exists')) {
        logger.error(`Error creating index template ${name}: ` + (error instanceof Error ? error.message : String(error)));
      }
    }
  }

  // Index a ticket
  async indexTicket(ticket: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
    try {
      await this.ensureInitialized(); // TODO-LINT: move to async function
      
      const response = await this.client.index({
        index: 'nova_tickets',
        id: ticket.id,
        document: {
          ...ticket,
          indexedAt: new Date()
        }
      }); // TODO-LINT: move to async function

      if (process.env.DEBUG_SQL === 'true') {
        logger.debug(`Indexed ticket ${ticket.id} in Elasticsearch`);
      }

      return response;
    } catch (error) {
      logger.error('Error indexing ticket: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  }

  // Index a knowledge base article
  async indexKbArticle(article: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
    try {
      await this.ensureInitialized(); // TODO-LINT: move to async function
      
      const response = await this.client.index({
        index: 'nova_kb',
        id: article.id,
        document: {
          ...article,
          indexedAt: new Date()
        }
      }); // TODO-LINT: move to async function

      if (process.env.DEBUG_SQL === 'true') {
        logger.debug(`Indexed KB article ${article.id} in Elasticsearch`);
      }

      return response;
    } catch (error) {
      logger.error('Error indexing KB article: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  }

  // Index log entry
  async indexLog(logEntry: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
    try {
      await this.ensureInitialized(); // TODO-LINT: move to async function
      
      const response = await this.client.index({
        index: `nova_logs-${new Date().toISOString().slice(0, 7)}`, // Monthly indexes
        document: logEntry
      }); // TODO-LINT: move to async function

      return response;
    } catch (error) {
      logger.error('Error indexing log entry: ' + (error instanceof Error ? error.message : String(error)));
      // Don't throw for logging errors
    }
  }

  // Search tickets
  async searchTickets(query: string, filters: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}, options: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}) {
    try {
      await this.ensureInitialized(); // TODO-LINT: move to async function
      
      const searchBody: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query,
                  fields: ['title^2', 'description', 'tags'],
                  type: 'best_fields',
                  fuzziness: 'AUTO'
                }
              }
            ],
            filter: []
          }
        },
        highlight: {
          fields: {
            title: {},
            description: {}
          }
        },
        sort: options.sort || [
          { _score: { order: 'desc' } },
          { updatedAt: { order: 'desc' } }
        ],
        size: options.size || 20,
        from: options.from || 0
      };

      // Add filters
      if (filters.status) {
        searchBody.query.bool.filter.push({ term: { status: filters.status } });
      }
      if (filters.priority) {
        searchBody.query.bool.filter.push({ term: { priority: filters.priority } });
      }
      if (filters.userId) {
        searchBody.query.bool.filter.push({ term: { userId: filters.userId } });
      }

      const response = await this.client.search({
        index: 'nova_tickets',
        query: searchBody.query,
        highlight: searchBody.highlight,
        sort: searchBody.sort,
        size: searchBody.size,
        from: searchBody.from
      }); // TODO-LINT: move to async function

      return {
        hits: response.hits.hits.map((hit: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => ({
          ...hit._source,
          score: hit._score,
          highlight: hit.highlight
        })),
        total: response.hits.total,
        maxScore: response.hits.max_score
      };
    } catch (error) {
      logger.error('Error searching tickets: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  }

  // Search knowledge base
  async searchKnowledgeBase(query: string, filters: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}, options: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}) {
    try {
      await this.ensureInitialized(); // TODO-LINT: move to async function
      
      const searchBody: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query,
                  fields: ['title^3', 'content^2', 'summary^1.5', 'tags'],
                  type: 'best_fields',
                  fuzziness: 'AUTO'
                }
              }
            ],
            filter: [
              { term: { status: 'published' } }
            ]
          }
        },
        highlight: {
          fields: {
            title: {},
            content: { fragment_size: 150, number_of_fragments: 3 },
            summary: {}
          }
        },
        sort: options.sort || [
          { _score: { order: 'desc' } },
          { rating: { order: 'desc' } },
          { updatedAt: { order: 'desc' } }
        ],
        size: options.size || 10,
        from: options.from || 0
      };

      // Add filters
      if (filters.category) {
        searchBody.query.bool.filter.push({ term: { category: filters.category } });
      }
      if (filters.visibility) {
        searchBody.query.bool.filter.push({ term: { visibility: filters.visibility } });
      }

      const response = await this.client.search({
        index: 'nova_kb',
        query: searchBody.query,
        highlight: searchBody.highlight,
        sort: searchBody.sort,
        size: searchBody.size,
        from: searchBody.from
      }); // TODO-LINT: move to async function

      return {
        hits: response.hits.hits.map((hit: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => ({
          ...hit._source,
          score: hit._score,
          highlight: hit.highlight
        })),
        total: response.hits.total,
        maxScore: response.hits.max_score
      };
    } catch (error) {
      logger.error('Error searching knowledge base: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  }

  // Semantic search for knowledge base
  async semanticSearchKnowledgeBase(query: string, filters: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}, options: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}) {
    try {
      await this.ensureInitialized(); // TODO-LINT: move to async function
      
      const searchBody: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {
        query: {
          bool: {
            must: [
              {
                semantic: {
                  field: 'semantic_field',
                  query: query
                }
              }
            ],
            filter: [
              { term: { status: 'published' } }
            ]
          }
        },
        highlight: {
          fields: {
            title: {},
            content: { fragment_size: 150, number_of_fragments: 3 },
            summary: {}
          }
        },
        size: options.size || 10,
        from: options.from || 0
      };

      // Add filters
      if (filters.category) {
        searchBody.query.bool.filter.push({ term: { category: filters.category } });
      }
      if (filters.visibility) {
        searchBody.query.bool.filter.push({ term: { visibility: filters.visibility } });
      }

      const response = await this.client.search({
        index: 'nova_kb',
        body: searchBody
      }); // TODO-LINT: move to async function

      return {
        hits: response.hits.hits.map((hit: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => ({
          ...hit._source,
          score: hit._score,
          highlight: hit.highlight
        })),
        total: response.hits.total,
        maxScore: response.hits.max_score
      };
    } catch (error) {
      logger.error('Error performing semantic search on knowledge base: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  }

  // Hybrid search for knowledge base (combines lexical and semantic)
  async hybridSearchKnowledgeBase(query: string, filters: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}, options: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}) {
    try {
      await this.ensureInitialized(); // TODO-LINT: move to async function
      
      const searchBody: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {
        retriever: {
          rrf: {
            retrievers: [
              {
                standard: {
                  query: {
                    bool: {
                      must: {
                        multi_match: {
                          query,
                          fields: ['title^3', 'content^2', 'summary^1.5', 'tags'],
                          type: 'best_fields',
                          fuzziness: 'AUTO'
                        }
                      },
                      filter: [
                        { term: { status: 'published' } }
                      ]
                    }
                  }
                }
              },
              {
                standard: {
                  query: {
                    bool: {
                      must: {
                        semantic: {
                          field: 'semantic_field',
                          query: query
                        }
                      },
                      filter: [
                        { term: { status: 'published' } }
                      ]
                    }
                  }
                }
              }
            ]
          }
        },
        highlight: {
          fields: {
            title: {},
            content: { fragment_size: 150, number_of_fragments: 3 },
            summary: {}
          }
        },
        size: options.size || 10,
        from: options.from || 0
      };

      // Add additional filters to both retrievers
      if (filters.category || filters.visibility) {
        const additionalFilters: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types[] = [];
        if (filters.category) additionalFilters.push({ term: { category: filters.category } });
        if (filters.visibility) additionalFilters.push({ term: { visibility: filters.visibility } });
        
        searchBody.retriever.rrf.retrievers.forEach((retriever: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => {
          retriever.standard.query.bool.filter.push(...additionalFilters);
        });
      }

      const response = await this.client.search({
        index: 'nova_kb',
        ...searchBody
      }); // TODO-LINT: move to async function

      return {
        hits: response.hits.hits.map((hit: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => ({
          ...hit._source,
          score: hit._score,
          highlight: hit.highlight
        })),
        total: response.hits.total,
        maxScore: response.hits.max_score
      };
    } catch (error) {
      logger.error('Error performing hybrid search on knowledge base: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  }

  // Search logs
  async searchLogs(query: string, filters: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}, options: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}) {
    try {
      await this.ensureInitialized(); // TODO-LINT: move to async function
      
      const searchBody: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query,
                  fields: ['message^2', 'source', 'action', 'details.error.message'],
                  type: 'best_fields',
                  fuzziness: 'AUTO'
                }
              }
            ],
            filter: []
          }
        },
        highlight: {
          fields: {
            message: {},
            'details.error.message': {}
          }
        },
        sort: options.sort || [
          { timestamp: { order: 'desc' } }
        ],
        size: options.size || 20,
        from: options.from || 0
      };

      // Add filters
      if (filters.level) {
        searchBody.query.bool.filter.push({ term: { level: filters.level } });
      }
      if (filters.source) {
        searchBody.query.bool.filter.push({ term: { source: filters.source } });
      }
      if (filters.userId) {
        searchBody.query.bool.filter.push({ term: { userId: filters.userId } });
      }
      if (filters.timeRange) {
        searchBody.query.bool.filter.push({
          range: {
            timestamp: {
              gte: `now-${filters.timeRange}`
            }
          }
        });
      }

      const response = await this.client.search({
        index: 'nova_logs*',
        ...searchBody
      }); // TODO-LINT: move to async function

      return {
        hits: response.hits.hits.map((hit: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => ({
          ...hit._source,
          score: hit._score,
          highlight: hit.highlight
        })),
        total: response.hits.total,
        maxScore: response.hits.max_score
      };
    } catch (error) {
      logger.error('Error searching logs: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  }

  // Get search suggestions
  async getSearchSuggestions(query: string, options: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}) {
    try {
      await this.ensureInitialized(); // TODO-LINT: move to async function
      
      const suggestions: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types[] = [];
      const { type = 'all', limit = 10 } = options;

      // Get suggestions from different indexes based on type
      const searchPromises: Promise<{ type: string; suggestions: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types[] }>[] = [];

      if (type === 'all' || type === 'tickets') {
        searchPromises.push(
          this.client.search({
            index: 'nova_tickets',
            suggest: {
              title_suggest: {
                prefix: query,
                completion: {
                  field: 'title.suggest',
                  size: limit
                }
              }
            },
            _source: false,
            size: 0
          }).then(response => ({
            type: 'tickets',
            suggestions: (response as any).suggest?.title_suggest?.[0]?.options || []
          }))
        );
      }

      if (type === 'all' || type === 'knowledge_base') {
        searchPromises.push(
          this.client.search({
            index: 'nova_kb',
            suggest: {
              title_suggest: {
                prefix: query,
                completion: {
                  field: 'title.suggest',
                  size: limit
                }
              }
            },
            _source: false,
            size: 0
          }).then(response => ({
            type: 'knowledge_base',
            suggestions: (response as any).suggest?.title_suggest?.[0]?.options || []
          }))
        );
      }

      const results = await Promise.allSettled(searchPromises); // TODO-LINT: move to async function
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          result.value.suggestions.forEach((suggestion: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => {
            suggestions.push({
              text: suggestion.text,
              score: suggestion._score,
              type: result.value.type
            });
          });
        }
      });

      // Sort by score and limit results
      return suggestions
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, limit);

    } catch (error) {
      logger.error('Error getting search suggestions: ' + (error instanceof Error ? error.message : String(error)));
      // Return fallback suggestions based on query
      return this.getFallbackSuggestions(query, options);
    }
  }

  // Fallback suggestions when Elasticsearch suggestions fail
  private getFallbackSuggestions(query: string, options: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}) {
    const { limit = 10 } = options;
    const commonTerms = [
      'installation', 'setup', 'configuration', 'troubleshooting', 'error',
      'login', 'password', 'account', 'permissions', 'network', 'connection',
      'update', 'upgrade', 'backup', 'restore', 'performance', 'security'
    ];

    return commonTerms
      .filter(term => term.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit)
      .map(term => ({
        text: term,
        score: 1.0,
        type: 'fallback'
      }));
  }

  // Aggregate search analytics
  async getSearchAnalytics(timeRange: string = '7d') {
    try {
      await this.ensureInitialized(); // TODO-LINT: move to async function
      
      const response = await this.client.search({
        index: 'nova_logs*',
        query: {
          bool: {
            must: [
              { term: { action: 'search' } },
              {
                range: {
                  timestamp: {
                    gte: `now-${timeRange}`
                  }
                }
              }
            ]
          }
        },
        aggs: {
          popular_queries: {
            terms: {
              field: 'details.query.keyword',
              size: 10
            }
          },
          searches_over_time: {
            date_histogram: {
              field: 'timestamp',
              fixed_interval: '1h'
            }
          },
          users_searching: {
            cardinality: {
              field: 'userId'
            }
          }
        },
        size: 0
      }); // TODO-LINT: move to async function

      return response.aggregations;
    } catch (error) {
      logger.error('Error getting search analytics: ' + (error instanceof Error ? error.message : String(error)));
      return null;
    }
  }

  // Health check
  async healthCheck() {
    const start = Date.now();
    
    try {
      const health = await this.client.cluster.health(); // TODO-LINT: move to async function
      const responseTime = Date.now() - start;
      
      return {
        healthy: health.status !== 'red',
        responseTime,
        clusterStatus: health.status,
        numberOfNodes: health.number_of_nodes,
        numberOfDataNodes: health.number_of_data_nodes,
        activePrimaryShards: health.active_primary_shards,
        activeShards: health.active_shards
      };
    } catch (error: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
      return {
        healthy: false,
        error: error.message,
        responseTime: Date.now() - start
      };
    }
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize(); // TODO-LINT: move to async function
    }
  }

  // Close connection
  async close() {
    try {
      await this.client.close(); // TODO-LINT: move to async function
      logger.info('Elasticsearch connection closed');
    } catch (error) {
      logger.error('Error closing Elasticsearch connection: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
}

// Export singleton instance
export const elasticManager = new ElasticsearchManager();

// Export convenience methods
export const {
  indexTicket,
  indexKbArticle,
  indexLog,
  searchTickets,
  searchKnowledgeBase,
  semanticSearchKnowledgeBase,
  hybridSearchKnowledgeBase,
  searchLogs,
  getSearchSuggestions,
  getSearchAnalytics
} = elasticManager;

export default elasticManager;
