import { randomUUID } from 'crypto';

export const ragEngine = {
  getStats() {
    return { isInitialized: true, documents: 0 };
  },
  async initialize() {
    return true;
  },
  async query({ query }) {
    return {
      queryId: randomUUID(),
      chunks: [],
      summary: `No RAG index, stub answering for: ${query}`,
      confidence: 0.5,
      retrievalTime: 1,
      totalResults: 0,
    };
  },
  async addDocuments(docs) {
    return { count: Array.isArray(docs) ? docs.length : 0 };
  },
};

export default ragEngine;