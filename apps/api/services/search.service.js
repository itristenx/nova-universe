import { prisma } from '../db/prisma.js';
import { logger } from '../logger.js';

/**
 * Search Service - Advanced search functionality for tickets
 */
export class SearchService {
  /**
   * Advanced ticket search with full-text and faceted search
   */
  static async searchTickets(searchParams) {
    try {
      const {
        query,
        filters = {},
        facets = [],
        sortBy = 'relevance',
        sortOrder = 'desc',
        page = 1,
        limit = 25,
        user,
      } = searchParams;

      const offset = (page - 1) * limit;

      // Build base query
      let whereClause = await this.buildSearchWhereClause(query, filters, user);

      // Execute search
      const [tickets, totalCount, facetData] = await Promise.all([
        this.executeSearch(whereClause, sortBy, sortOrder, offset, limit),
        prisma.enhancedSupportTicket.count({ where: whereClause }),
        facets.length > 0 ? this.getFacetData(whereClause, facets) : {},
      ]);

      return {
        tickets,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPreviousPage: page > 1,
          itemsPerPage: limit,
        },
        facets: facetData,
        searchQuery: query,
        appliedFilters: filters,
        executionTime: Date.now(), // Would be calculated properly
      };
    } catch (error) {
      logger.error('Error in advanced search:', error);
      throw new Error('Search failed');
    }
  }

  /**
   * Build search where clause
   */
  static async buildSearchWhereClause(query, filters, user) {
    const whereClause = {};

    // Apply user access filter
    const accessFilter = await this.getAccessFilter(user);
    Object.assign(whereClause, accessFilter);

    // Full-text search
    if (query && query.trim()) {
      const searchTerms = query.trim().split(/\s+/);
      const searchConditions = [];

      for (const term of searchTerms) {
        searchConditions.push({
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
            { ticketNumber: { contains: term, mode: 'insensitive' } },
            { resolution: { contains: term, mode: 'insensitive' } },
            { tags: { hasSome: [term] } },
          ],
        });
      }

      whereClause.AND = searchConditions;
    }

    // Apply filters
    if (filters.status) {
      whereClause.state = Array.isArray(filters.status) ? { in: filters.status } : filters.status;
    }

    if (filters.priority) {
      whereClause.priority = Array.isArray(filters.priority)
        ? { in: filters.priority }
        : filters.priority;
    }

    if (filters.category) {
      whereClause.category = Array.isArray(filters.category)
        ? { in: filters.category }
        : filters.category;
    }

    if (filters.assignedTo) {
      whereClause.assignedToUserId = filters.assignedTo;
    }

    if (filters.createdBy) {
      whereClause.userId = filters.createdBy;
    }

    if (filters.dateRange) {
      whereClause.createdAt = {
        gte: new Date(filters.dateRange.start),
        lte: new Date(filters.dateRange.end),
      };
    }

    if (filters.tags && filters.tags.length > 0) {
      whereClause.tags = { hasSome: filters.tags };
    }

    if (filters.slaBreached !== undefined) {
      whereClause.OR = [
        { responseTimeBreached: filters.slaBreached },
        { resolutionTimeBreached: filters.slaBreached },
      ];
    }

    return whereClause;
  }

  /**
   * Execute search query
   */
  static async executeSearch(whereClause, sortBy, sortOrder, offset, limit) {
    const orderBy = this.buildOrderBy(sortBy, sortOrder);

    return await prisma.enhancedSupportTicket.findMany({
      where: whereClause,
      include: {
        requester: {
          select: { id: true, name: true, email: true },
        },
        assignedUser: {
          select: { id: true, name: true, email: true },
        },
        assignedGroup: {
          select: { id: true, name: true },
        },
        sla: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
      orderBy,
      skip: offset,
      take: limit,
    });
  }

  /**
   * Build order by clause
   */
  static buildOrderBy(sortBy, sortOrder) {
    const orderMap = {
      relevance: { updatedAt: sortOrder }, // Default to updated date for relevance
      created: { createdAt: sortOrder },
      updated: { updatedAt: sortOrder },
      priority: { priority: sortOrder },
      status: { state: sortOrder },
      assignee: { assignedUser: { name: sortOrder } },
      dueDate: { dueDate: sortOrder },
    };

    return orderMap[sortBy] || { updatedAt: 'desc' };
  }

  /**
   * Get facet data for search results
   */
  static async getFacetData(whereClause, facets) {
    const facetData = {};

    for (const facet of facets) {
      switch (facet) {
        case 'status':
          facetData.status = await this.getStatusFacets(whereClause);
          break;
        case 'priority':
          facetData.priority = await this.getPriorityFacets(whereClause);
          break;
        case 'category':
          facetData.category = await this.getCategoryFacets(whereClause);
          break;
        case 'assignee':
          facetData.assignee = await this.getAssigneeFacets(whereClause);
          break;
        case 'tags':
          facetData.tags = await this.getTagsFacets(whereClause);
          break;
      }
    }

    return facetData;
  }

  /**
   * Get status facets
   */
  static async getStatusFacets(whereClause) {
    const statusCounts = await prisma.enhancedSupportTicket.groupBy({
      by: ['state'],
      where: whereClause,
      _count: { state: true },
    });

    return statusCounts.map((item) => ({
      value: item.state,
      count: item._count.state,
      label: this.formatStatusLabel(item.state),
    }));
  }

  /**
   * Get priority facets
   */
  static async getPriorityFacets(whereClause) {
    const priorityCounts = await prisma.enhancedSupportTicket.groupBy({
      by: ['priority'],
      where: whereClause,
      _count: { priority: true },
    });

    return priorityCounts.map((item) => ({
      value: item.priority,
      count: item._count.priority,
      label: item.priority,
    }));
  }

  /**
   * Get category facets
   */
  static async getCategoryFacets(whereClause) {
    const categoryCounts = await prisma.enhancedSupportTicket.groupBy({
      by: ['category'],
      where: { ...whereClause, category: { not: null } },
      _count: { category: true },
    });

    return categoryCounts.map((item) => ({
      value: item.category,
      count: item._count.category,
      label: item.category,
    }));
  }

  /**
   * Get assignee facets
   */
  static async getAssigneeFacets(whereClause) {
    const assigneeCounts = await prisma.enhancedSupportTicket.groupBy({
      by: ['assignedToUserId'],
      where: { ...whereClause, assignedToUserId: { not: null } },
      _count: { assignedToUserId: true },
    });

    // Get user names for assignees
    const userIds = assigneeCounts.map((item) => item.assignedToUserId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });

    const userMap = users.reduce((acc, user) => {
      acc[user.id] = user.name;
      return acc;
    }, {});

    return assigneeCounts.map((item) => ({
      value: item.assignedToUserId,
      count: item._count.assignedToUserId,
      label: userMap[item.assignedToUserId] || 'Unknown User',
    }));
  }

  /**
   * Get tags facets
   */
  static async getTagsFacets(_whereClause) {
    // This would require more complex aggregation in production
    // For now, return empty array
    return [];
  }

  /**
   * Format status label for display
   */
  static formatStatusLabel(status) {
    const labelMap = {
      NEW: 'New',
      ASSIGNED: 'Assigned',
      IN_PROGRESS: 'In Progress',
      PENDING: 'Pending',
      RESOLVED: 'Resolved',
      CLOSED: 'Closed',
      REOPENED: 'Reopened',
      CANCELLED: 'Cancelled',
    };

    return labelMap[status] || status;
  }

  /**
   * Get access filter for user
   */
  static async getAccessFilter(user) {
    // Implement based on user roles and permissions
    if (user.roles?.includes('admin') || user.roles?.includes('technician')) {
      return {}; // Admin/tech can see all tickets
    }

    // Regular users can only see their own tickets and public tickets
    return {
      OR: [
        { userId: user.id }, // Tickets they created
        { assignedToUserId: user.id }, // Tickets assigned to them
        { confidentialityLevel: { in: ['public', 'internal'] } }, // Public tickets
      ],
    };
  }

  /**
   * Save search query for analytics
   */
  static async saveSearchQuery(query, filters, resultCount, user) {
    try {
      // This would save search analytics
      logger.info(
        `Search query saved: "${query}", filters: ${JSON.stringify(filters)}, results: ${resultCount}, user: ${user.id}`,
      );
    } catch (error) {
      logger.error('Error saving search query:', error);
    }
  }

  /**
   * Get popular search terms
   */
  static async getPopularSearchTerms(_limit = 10) {
    // This would return popular search terms from analytics
    return [];
  }

  /**
   * Get search suggestions based on partial query
   */
  static async getSearchSuggestions(partialQuery, user) {
    try {
      const suggestions = [];

      // Suggest ticket numbers
      if (partialQuery.match(/^\d+/)) {
        const tickets = await prisma.enhancedSupportTicket.findMany({
          where: {
            ticketNumber: { contains: partialQuery },
            ...(await this.getAccessFilter(user)),
          },
          select: { ticketNumber: true, title: true },
          take: 5,
        });

        suggestions.push(
          ...tickets.map((t) => ({
            type: 'ticket',
            value: t.ticketNumber,
            label: `${t.ticketNumber} - ${t.title}`,
            category: 'Tickets',
          })),
        );
      }

      // Suggest categories
      const categories = await this.getCategorySuggestions(partialQuery);
      suggestions.push(...categories);

      return suggestions;
    } catch (error) {
      logger.error('Error getting search suggestions:', error);
      return [];
    }
  }

  /**
   * Get category suggestions
   */
  static async getCategorySuggestions(partialQuery) {
    try {
      const categories = await prisma.enhancedSupportTicket.groupBy({
        by: ['category'],
        where: {
          category: {
            contains: partialQuery,
            mode: 'insensitive',
          },
        },
        _count: { category: true },
      });

      return categories.map((cat) => ({
        type: 'category',
        value: cat.category,
        label: cat.category,
        category: 'Categories',
        count: cat._count.category,
      }));
    } catch (error) {
      logger.error('Error getting category suggestions:', error);
      return [];
    }
  }
}
