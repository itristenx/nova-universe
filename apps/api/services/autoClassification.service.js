import { logger } from '../logger.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Auto Classification Service - Uses AI/ML to classify tickets automatically
 */
export class AutoClassificationService {
  /**
   * Classify ticket based on title and description
   */
  static async classifyTicket(ticketData) {
    try {
      const { title, description } = ticketData;

      // This would integrate with AI/ML service for classification
      // For now, we'll use rule-based classification

      const classification = {
        category: await this.classifyCategory(title, description),
        subcategory: await this.classifySubcategory(title, description),
        priority: await this.classifyPriority(title, description),
        urgency: await this.classifyUrgency(title, description),
        impact: await this.classifyImpact(title, description),
        confidence: 0.85, // Mock confidence score
      };

      return classification;
    } catch (error) {
      logger.error('Error in auto-classification:', error);
      return null;
    }
  }

  /**
   * Classify category based on keywords
   */
  static async classifyCategory(title, description) {
    const text = `${title} ${description}`.toLowerCase();

    const categoryKeywords = {
      hardware: ['computer', 'laptop', 'monitor', 'keyboard', 'mouse', 'printer', 'hardware'],
      software: ['application', 'software', 'program', 'install', 'upgrade', 'license'],
      network: ['network', 'internet', 'wifi', 'connection', 'vpn', 'email'],
      access: ['access', 'permission', 'login', 'password', 'account', 'authentication'],
      hr: ['payroll', 'benefits', 'vacation', 'leave', 'hr', 'human resources'],
      facilities: ['office', 'desk', 'parking', 'building', 'facilities', 'security badge'],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        return category;
      }
    }

    return 'general';
  }

  /**
   * Classify subcategory based on category and keywords
   */
  static async classifySubcategory(title, description) {
    const text = `${title} ${description}`.toLowerCase();

    // This would be more sophisticated in production
    if (text.includes('password')) return 'password_reset';
    if (text.includes('email')) return 'email_issues';
    if (text.includes('printer')) return 'printer_support';
    if (text.includes('software') && text.includes('install')) return 'software_installation';

    return null;
  }

  /**
   * Classify priority based on urgency indicators
   */
  static async classifyPriority(title, description) {
    const text = `${title} ${description}`.toLowerCase();

    const urgentKeywords = ['urgent', 'critical', 'emergency', 'asap', 'immediately'];
    const highKeywords = ['important', 'high', 'priority', 'soon'];
    const lowKeywords = ['when possible', 'low priority', 'whenever'];

    if (urgentKeywords.some((keyword) => text.includes(keyword))) {
      return 'CRITICAL';
    }

    if (highKeywords.some((keyword) => text.includes(keyword))) {
      return 'HIGH';
    }

    if (lowKeywords.some((keyword) => text.includes(keyword))) {
      return 'LOW';
    }

    return 'MEDIUM';
  }

  /**
   * Classify urgency based on business impact
   */
  static async classifyUrgency(title, description) {
    const text = `${title} ${description}`.toLowerCase();

    const criticalKeywords = ['down', 'outage', 'broken', 'not working', 'emergency'];
    const highKeywords = ['slow', 'performance', 'delay', 'issue'];

    if (criticalKeywords.some((keyword) => text.includes(keyword))) {
      return 'CRITICAL';
    }

    if (highKeywords.some((keyword) => text.includes(keyword))) {
      return 'HIGH';
    }

    return 'MEDIUM';
  }

  /**
   * Classify impact based on affected users/systems
   */
  static async classifyImpact(title, description) {
    const text = `${title} ${description}`.toLowerCase();

    const highImpactKeywords = ['everyone', 'all users', 'entire', 'company', 'organization'];
    const mediumImpactKeywords = ['team', 'department', 'group', 'multiple'];

    if (highImpactKeywords.some((keyword) => text.includes(keyword))) {
      return 'HIGH';
    }

    if (mediumImpactKeywords.some((keyword) => text.includes(keyword))) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  /**
   * Find similar tickets based on content analysis
   */
  async findSimilarTickets(ticketData, limit = 5) {
    try {
      logger.info('Finding similar tickets using advanced text analysis');

      const searchText = `${ticketData.title} ${ticketData.description}`.toLowerCase();
      const keywords = this.extractKeywords(searchText);

      // Use full-text search with ranking
      const similarTickets = await prisma.$queryRaw`
        SELECT 
          id,
          ticket_number,
          title,
          description,
          category,
          subcategory,
          resolution,
          state,
          ts_rank(
            to_tsvector('english', title || ' ' || description),
            plainto_tsquery('english', ${searchText})
          ) as similarity_score
        FROM enhanced_support_tickets
        WHERE 
          to_tsvector('english', title || ' ' || description) @@ plainto_tsquery('english', ${searchText})
          AND state IN ('RESOLVED', 'CLOSED')
          AND created_at > NOW() - INTERVAL '2 years'
        ORDER BY similarity_score DESC, created_at DESC
        LIMIT ${limit}
      `;

      // Enhance with keyword matching
      const enhancedResults = similarTickets.map((ticket) => {
        const ticketText = `${ticket.title} ${ticket.description}`.toLowerCase();
        const keywordMatches = keywords.filter((keyword) => ticketText.includes(keyword)).length;

        return {
          ...ticket,
          keyword_matches: keywordMatches,
          relevance_score: ticket.similarity_score * 0.7 + keywordMatches * 0.3,
        };
      });

      // Sort by enhanced relevance score
      enhancedResults.sort((a, b) => b.relevance_score - a.relevance_score);

      logger.info(`Found ${enhancedResults.length} similar tickets`);
      return enhancedResults;
    } catch (error) {
      logger.error('Error finding similar tickets:', error);
      // Return empty array on error to not block ticket creation
      return [];
    }
  }

  /**
   * Extract keywords from text for better matching
   */
  extractKeywords(text) {
    // Remove common stop words and extract meaningful terms
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'could',
      'should',
      'may',
      'might',
      'must',
      'can',
      'shall',
      'this',
      'that',
      'these',
      'those',
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word))
      .slice(0, 20); // Limit to top 20 keywords
  }

  /**
   * Suggest assignee based on ticket classification
   */
  static async suggestAssignee(classification) {
    try {
      // This would use ML model to suggest best assignee
      logger.info(`Suggesting assignee for classification: ${JSON.stringify(classification)}`);
      return null;
    } catch (error) {
      logger.error('Error suggesting assignee:', error);
      return null;
    }
  }
}
