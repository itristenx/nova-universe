/**
 * AI-Powered Ticket Processing Engine for Cosmo/Synth
 * 
 * This module provides intelligent ticket processing capabilities including:
 * - Metadata extraction and enrichment
 * - Customer matching and account linking
 * - Duplicate detection and similar ticket identification
 * - Priority and category classification
 * - Trend analysis and pattern recognition
 * - Knowledge base suggestion matching
 */

import { createInterface } from 'readline';
import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';

// AI/ML Processing Classes
class TicketClassifier {
  constructor() {
    this.categories = {
      'hardware': ['computer', 'laptop', 'monitor', 'printer', 'keyboard', 'mouse', 'server', 'network device'],
      'software': ['application', 'program', 'install', 'update', 'crash', 'error', 'bug', 'license'],
      'network': ['internet', 'wifi', 'connection', 'vpn', 'firewall', 'router', 'switch', 'bandwidth'],
      'security': ['virus', 'malware', 'phishing', 'breach', 'password', 'access', 'authentication', 'encryption'],
      'email': ['outlook', 'gmail', 'email', 'mail', 'attachment', 'spam', 'distribution list'],
      'phone': ['voip', 'phone', 'call', 'conference', 'voicemail', 'extension', 'dial tone'],
      'access': ['permission', 'login', 'account', 'role', 'rights', 'folder', 'file access', 'sharepoint']
    };

    this.priorities = {
      'critical': ['down', 'outage', 'critical', 'urgent', 'emergency', 'security breach', 'data loss'],
      'high': ['slow', 'performance', 'multiple users', 'business impact', 'deadline'],
      'medium': ['issue', 'problem', 'not working', 'error', 'difficulty'],
      'low': ['question', 'request', 'how to', 'training', 'information']
    };

    this.urgencyFactors = {
      'executive': 3,
      'manager': 2,
      'department_head': 2,
      'regular_user': 1,
      'contractor': 0.5
    };
  }

  classifyCategory(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    const scores = {};

    for (const [category, keywords] of Object.entries(this.categories)) {
      scores[category] = 0;
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          scores[category] += 1;
        }
      }
    }

    const maxScore = Math.max(...Object.values(scores));
    const bestCategory = Object.keys(scores).find(key => scores[key] === maxScore);
    
    return {
      category: bestCategory || 'general',
      confidence: maxScore > 0 ? maxScore / Math.max(1, text.split(' ').length) : 0.1,
      alternativeCategories: Object.entries(scores)
        .filter(([cat, score]) => score > 0 && cat !== bestCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([cat]) => cat)
    };
  }

  classifyPriority(title, description, userRole = 'regular_user') {
    const text = `${title} ${description}`.toLowerCase();
    let priorityScore = 0;
    let detectedPriority = 'medium';

    for (const [priority, keywords] of Object.entries(this.priorities)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          priorityScore = this.getPriorityScore(priority);
          detectedPriority = priority;
          break;
        }
      }
      if (priorityScore > 0) break;
    }

    // Apply user role multiplier
    const roleMultiplier = this.urgencyFactors[userRole] || 1;
    const finalScore = priorityScore * roleMultiplier;

    // Determine final priority based on score
    let finalPriority = detectedPriority;
    if (finalScore >= 3) finalPriority = 'critical';
    else if (finalScore >= 2) finalPriority = 'high';
    else if (finalScore >= 1) finalPriority = 'medium';
    else finalPriority = 'low';

    return {
      priority: finalPriority,
      score: finalScore,
      factors: {
        detectedKeywords: detectedPriority,
        userRole: userRole,
        roleMultiplier: roleMultiplier
      }
    };
  }

  getPriorityScore(priority) {
    const scores = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    return scores[priority] || 1;
  }
}

class CustomerMatcher {
  constructor() {
    this.customers = new Map();
    this.domains = new Map();
    this.loadCustomerDatabase();
  }

  async loadCustomerDatabase() {
    // In real implementation, this would load from database
    // For now, we'll simulate some customer data
    const sampleCustomers = [
      {
        id: 'CUST-001',
        name: 'Acme Corporation',
        domain: 'acme.com',
        emails: ['john.doe@acme.com', 'jane.smith@acme.com'],
        contract: 'enterprise',
        priority: 'high',
        location: 'New York',
        department: 'IT'
      },
      {
        id: 'CUST-002',
        name: 'Tech Solutions Inc',
        domain: 'techsolutions.com',
        emails: ['support@techsolutions.com'],
        contract: 'standard',
        priority: 'medium',
        location: 'California',
        department: 'Operations'
      }
    ];

    for (const customer of sampleCustomers) {
      this.customers.set(customer.id, customer);
      this.domains.set(customer.domain, customer.id);
      
      for (const email of customer.emails) {
        const domain = email.split('@')[1];
        if (domain) {
          this.domains.set(domain, customer.id);
        }
      }
    }
  }

  matchCustomer(email, name = null, phone = null) {
    const domain = email ? email.split('@')[1] : null;
    
    // Try domain matching first
    if (domain && this.domains.has(domain)) {
      const customerId = this.domains.get(domain);
      const customer = this.customers.get(customerId);
      return {
        customer,
        matchType: 'domain',
        confidence: 0.9
      };
    }

    // Try exact email matching
    for (const [customerId, customer] of this.customers) {
      if (customer.emails.includes(email)) {
        return {
          customer,
          matchType: 'email',
          confidence: 1.0
        };
      }
    }

    // Try name fuzzy matching if provided
    if (name) {
      for (const [customerId, customer] of this.customers) {
        if (this.fuzzyMatch(name, customer.name)) {
          return {
            customer,
            matchType: 'name',
            confidence: 0.7
          };
        }
      }
    }

    return {
      customer: null,
      matchType: 'none',
      confidence: 0
    };
  }

  fuzzyMatch(str1, str2, threshold = 0.7) {
    const similarity = this.calculateSimilarity(str1.toLowerCase(), str2.toLowerCase());
    return similarity >= threshold;
  }

  calculateSimilarity(str1, str2) {
    // Simple Levenshtein distance-based similarity
    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 1;
    
    const distance = this.levenshteinDistance(str1, str2);
    return 1 - (distance / maxLen);
  }

  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

class SimilarTicketDetector {
  constructor() {
    this.ticketIndex = new Map();
    this.vectorStore = new Map();
  }

  addTicket(ticket) {
    const vector = this.createTextVector(ticket.title, ticket.description);
    this.vectorStore.set(ticket.id, {
      vector,
      ticket,
      timestamp: Date.now()
    });
    
    // Update text index
    const keywords = this.extractKeywords(ticket.title, ticket.description);
    for (const keyword of keywords) {
      if (!this.ticketIndex.has(keyword)) {
        this.ticketIndex.set(keyword, new Set());
      }
      this.ticketIndex.get(keyword).add(ticket.id);
    }
  }

  findSimilarTickets(title, description, limit = 5) {
    const queryVector = this.createTextVector(title, description);
    const similarities = [];

    for (const [ticketId, data] of this.vectorStore) {
      const similarity = this.cosineSimilarity(queryVector, data.vector);
      if (similarity > 0.3) { // Threshold for similarity
        similarities.push({
          ticketId,
          ticket: data.ticket,
          similarity,
          timestamp: data.timestamp
        });
      }
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  findDuplicates(title, description, threshold = 0.8) {
    const similar = this.findSimilarTickets(title, description);
    return similar.filter(item => item.similarity >= threshold);
  }

  createTextVector(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    const words = text.split(/\s+/).filter(word => word.length > 2);
    const wordCount = new Map();
    
    // Count word frequencies
    for (const word of words) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }
    
    // Convert to simple vector (top 100 most common words)
    const vector = Array(100).fill(0);
    const sortedWords = Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100);
    
    for (let i = 0; i < sortedWords.length; i++) {
      vector[i] = sortedWords[i][1];
    }
    
    return vector;
  }

  extractKeywords(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    const words = text.split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !/^(the|and|or|but|in|on|at|to|for|of|with|by)$/.test(word));
    
    return [...new Set(words)];
  }

  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

class TrendAnalyzer {
  constructor() {
    this.ticketHistory = [];
    this.trends = new Map();
    this.patterns = new Map();
  }

  addTicketData(ticket) {
    this.ticketHistory.push({
      ...ticket,
      timestamp: ticket.timestamp || Date.now()
    });

    // Keep only last 1000 tickets for performance
    if (this.ticketHistory.length > 1000) {
      this.ticketHistory = this.ticketHistory.slice(-1000);
    }

    this.updateTrends();
  }

  updateTrends() {
    const now = Date.now();
    const timeWindows = {
      'daily': 24 * 60 * 60 * 1000,
      'weekly': 7 * 24 * 60 * 60 * 1000,
      'monthly': 30 * 24 * 60 * 60 * 1000
    };

    for (const [window, duration] of Object.entries(timeWindows)) {
      const recentTickets = this.ticketHistory.filter(
        ticket => now - ticket.timestamp < duration
      );

      this.trends.set(window, {
        totalTickets: recentTickets.length,
        categories: this.groupBy(recentTickets, 'category'),
        priorities: this.groupBy(recentTickets, 'priority'),
        customers: this.groupBy(recentTickets, 'customerId'),
        timeDistribution: this.analyzeTimeDistribution(recentTickets),
        averageResolutionTime: this.calculateAverageResolutionTime(recentTickets)
      });
    }
  }

  identifyPatterns() {
    const patterns = [];

    // Identify category spikes
    const dailyTrends = this.trends.get('daily');
    const weeklyTrends = this.trends.get('weekly');

    if (dailyTrends && weeklyTrends) {
      for (const [category, dailyCount] of Object.entries(dailyTrends.categories)) {
        const weeklyAvg = weeklyTrends.categories[category] / 7;
        if (dailyCount > weeklyAvg * 2) {
          patterns.push({
            type: 'category_spike',
            category,
            severity: dailyCount / weeklyAvg,
            description: `Unusual spike in ${category} tickets (${dailyCount} vs avg ${weeklyAvg.toFixed(1)})`
          });
        }
      }
    }

    // Identify time-based patterns
    if (dailyTrends) {
      const hourlyDistribution = dailyTrends.timeDistribution;
      const peakHour = Object.keys(hourlyDistribution).reduce((a, b) => 
        hourlyDistribution[a] > hourlyDistribution[b] ? a : b
      );
      
      patterns.push({
        type: 'peak_hours',
        hour: peakHour,
        count: hourlyDistribution[peakHour],
        description: `Peak ticket volume at ${peakHour}:00 (${hourlyDistribution[peakHour]} tickets)`
      });
    }

    return patterns;
  }

  predictNextTickets() {
    // Simple prediction based on historical patterns
    const recentTickets = this.ticketHistory.slice(-100);
    const categoryFreq = this.groupBy(recentTickets, 'category');
    const totalRecent = recentTickets.length;

    const predictions = [];
    for (const [category, count] of Object.entries(categoryFreq)) {
      const probability = count / totalRecent;
      if (probability > 0.1) {
        predictions.push({
          category,
          probability,
          expectedCount: Math.round(probability * 10), // Next 10 tickets
          confidence: probability > 0.3 ? 'high' : probability > 0.15 ? 'medium' : 'low'
        });
      }
    }

    return predictions.sort((a, b) => b.probability - a.probability);
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const value = item[key];
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  }

  analyzeTimeDistribution(tickets) {
    const distribution = {};
    
    for (const ticket of tickets) {
      const hour = new Date(ticket.timestamp).getHours();
      distribution[hour] = (distribution[hour] || 0) + 1;
    }
    
    return distribution;
  }

  calculateAverageResolutionTime(tickets) {
    const resolvedTickets = tickets.filter(t => t.resolvedAt && t.createdAt);
    if (resolvedTickets.length === 0) return null;
    
    const totalTime = resolvedTickets.reduce((sum, ticket) => {
      return sum + (ticket.resolvedAt - ticket.createdAt);
    }, 0);
    
    return totalTime / resolvedTickets.length;
  }
}

// Main Ticket Processing Engine
export class CosmoTicketProcessor extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      enableAI: true,
      enableTrendAnalysis: true,
      enableDuplicateDetection: true,
      duplicateThreshold: 0.8,
      similarityThreshold: 0.6,
      autoClassifyPriority: true,
      autoMatchCustomers: true,
      ...config
    };

    this.classifier = new TicketClassifier();
    this.customerMatcher = new CustomerMatcher();
    this.similarTicketDetector = new SimilarTicketDetector();
    this.trendAnalyzer = new TrendAnalyzer();
    
    this.ticketQueue = [];
    this.processing = false;
    
    this.startProcessing();
  }

  async processTicket(ticketData) {
    const enrichedTicket = await this.enrichTicketData(ticketData);
    
    // Add to processing queue
    this.ticketQueue.push(enrichedTicket);
    
    this.emit('ticketQueued', enrichedTicket);
    
    return enrichedTicket;
  }

  async enrichTicketData(ticket) {
    const enriched = { ...ticket };
    const startTime = Date.now();

    try {
      // Step 1: AI Classification
      if (this.config.enableAI) {
        const classification = this.classifier.classifyCategory(ticket.title, ticket.description);
        const prioritization = this.classifier.classifyPriority(
          ticket.title, 
          ticket.description, 
          ticket.userRole
        );

        enriched.aiClassification = {
          category: classification.category,
          categoryConfidence: classification.confidence,
          alternativeCategories: classification.alternativeCategories,
          priority: prioritization.priority,
          priorityScore: prioritization.score,
          priorityFactors: prioritization.factors
        };

        // Auto-assign if confidence is high enough
        if (this.config.autoClassifyPriority && classification.confidence > 0.7) {
          enriched.category = classification.category;
        }
        if (this.config.autoClassifyPriority && prioritization.score > 1.5) {
          enriched.priority = prioritization.priority;
        }
      }

      // Step 2: Customer Matching
      if (this.config.autoMatchCustomers && ticket.requesterEmail) {
        const customerMatch = this.customerMatcher.matchCustomer(
          ticket.requesterEmail,
          ticket.requesterName,
          ticket.requesterPhone
        );

        enriched.customerMatch = customerMatch;
        
        if (customerMatch.customer && customerMatch.confidence > 0.8) {
          enriched.customerId = customerMatch.customer.id;
          enriched.customerName = customerMatch.customer.name;
          enriched.customerContract = customerMatch.customer.contract;
          enriched.customerPriority = customerMatch.customer.priority;
          enriched.location = customerMatch.customer.location;
          enriched.department = customerMatch.customer.department;
        }
      }

      // Step 3: Duplicate Detection
      if (this.config.enableDuplicateDetection) {
        const duplicates = this.similarTicketDetector.findDuplicates(
          ticket.title,
          ticket.description,
          this.config.duplicateThreshold
        );

        const similarTickets = this.similarTicketDetector.findSimilarTickets(
          ticket.title,
          ticket.description,
          5
        );

        enriched.duplicateAnalysis = {
          isDuplicate: duplicates.length > 0,
          duplicateTickets: duplicates,
          similarTickets: similarTickets.filter(t => !duplicates.find(d => d.ticketId === t.ticketId)),
          confidence: duplicates.length > 0 ? Math.max(...duplicates.map(d => d.similarity)) : 0
        };
      }

      // Step 4: Add processing metadata
      enriched.aiProcessing = {
        processedAt: Date.now(),
        processingTime: Date.now() - startTime,
        version: '1.0.0',
        features: {
          classification: this.config.enableAI,
          customerMatching: this.config.autoMatchCustomers,
          duplicateDetection: this.config.enableDuplicateDetection,
          trendAnalysis: this.config.enableTrendAnalysis
        }
      };

      // Step 5: Generate suggestions
      enriched.suggestions = this.generateSuggestions(enriched);

      return enriched;

    } catch (error) {
      console.error('Error enriching ticket data:', error);
      enriched.aiProcessing = {
        error: error.message,
        processedAt: Date.now(),
        processingTime: Date.now() - startTime
      };
      return enriched;
    }
  }

  generateSuggestions(ticket) {
    const suggestions = [];

    // Priority suggestions
    if (ticket.aiClassification?.priority && !ticket.priority) {
      suggestions.push({
        type: 'priority',
        action: 'set_priority',
        value: ticket.aiClassification.priority,
        confidence: ticket.aiClassification.categoryConfidence,
        reason: `AI suggests ${ticket.aiClassification.priority} priority based on content analysis`
      });
    }

    // Category suggestions
    if (ticket.aiClassification?.category && !ticket.category) {
      suggestions.push({
        type: 'category',
        action: 'set_category',
        value: ticket.aiClassification.category,
        confidence: ticket.aiClassification.categoryConfidence,
        reason: `AI suggests ${ticket.aiClassification.category} category (${Math.round(ticket.aiClassification.categoryConfidence * 100)}% confidence)`
      });
    }

    // Duplicate handling suggestions
    if (ticket.duplicateAnalysis?.isDuplicate) {
      suggestions.push({
        type: 'duplicate',
        action: 'merge_or_close',
        value: ticket.duplicateAnalysis.duplicateTickets[0].ticketId,
        confidence: ticket.duplicateAnalysis.confidence,
        reason: `Potential duplicate of ticket ${ticket.duplicateAnalysis.duplicateTickets[0].ticketId}`
      });
    }

    // Customer escalation suggestions
    if (ticket.customerMatch?.customer?.priority === 'high') {
      suggestions.push({
        type: 'escalation',
        action: 'escalate_customer',
        value: 'high_priority_customer',
        confidence: 1.0,
        reason: `High priority customer: ${ticket.customerMatch.customer.name}`
      });
    }

    // Similar ticket resolution suggestions
    if (ticket.duplicateAnalysis?.similarTickets?.length > 0) {
      const resolvedSimilar = ticket.duplicateAnalysis.similarTickets.filter(t => t.ticket.status === 'resolved');
      if (resolvedSimilar.length > 0) {
        suggestions.push({
          type: 'knowledge',
          action: 'suggest_solution',
          value: resolvedSimilar[0].ticketId,
          confidence: resolvedSimilar[0].similarity,
          reason: `Similar resolved ticket found: ${resolvedSimilar[0].ticket.title}`
        });
      }
    }

    return suggestions;
  }

  async startProcessing() {
    if (this.processing) return;
    
    this.processing = true;
    
    const processQueue = async () => {
      while (this.ticketQueue.length > 0) {
        const ticket = this.ticketQueue.shift();
        
        try {
          // Add to similarity detection index
          this.similarTicketDetector.addTicket(ticket);
          
          // Add to trend analysis
          if (this.config.enableTrendAnalysis) {
            this.trendAnalyzer.addTicketData(ticket);
          }
          
          this.emit('ticketProcessed', ticket);
          
        } catch (error) {
          console.error('Error processing ticket:', error);
          this.emit('ticketError', { ticket, error });
        }
        
        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Continue processing after a short delay
      setTimeout(processQueue, 1000);
    };
    
    processQueue();
  }

  getTrends() {
    return {
      current: this.trendAnalyzer.trends,
      patterns: this.trendAnalyzer.identifyPatterns(),
      predictions: this.trendAnalyzer.predictNextTickets()
    };
  }

  getStats() {
    return {
      ticketsProcessed: this.similarTicketDetector.vectorStore.size,
      queueLength: this.ticketQueue.length,
      processing: this.processing,
      customers: this.customerMatcher.customers.size,
      trends: this.getTrends()
    };
  }

  async searchSimilarTickets(title, description, limit = 10) {
    return this.similarTicketDetector.findSimilarTickets(title, description, limit);
  }

  async addCustomer(customerData) {
    const customer = {
      id: customerData.id || `CUST-${Date.now()}`,
      name: customerData.name,
      domain: customerData.domain,
      emails: customerData.emails || [],
      contract: customerData.contract || 'standard',
      priority: customerData.priority || 'medium',
      location: customerData.location,
      department: customerData.department
    };

    this.customerMatcher.customers.set(customer.id, customer);
    
    if (customer.domain) {
      this.customerMatcher.domains.set(customer.domain, customer.id);
    }
    
    for (const email of customer.emails) {
      const domain = email.split('@')[1];
      if (domain) {
        this.customerMatcher.domains.set(domain, customer.id);
      }
    }

    return customer;
  }

  dispose() {
    this.processing = false;
    this.removeAllListeners();
  }
}
