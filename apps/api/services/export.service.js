import { prisma } from '../db/prisma.js';
import { logger } from '../logger.js';

/**
 * Export Service - Handles exporting tickets to various formats
 */
export class ExportService {
  /**
   * Export tickets to specified format
   */
  static async exportTickets(exportParams) {
    try {
      const {
        format = 'csv',
        filters = {},
        fields = [],
        includeComments = false,
        includeAttachments = false,
        user,
      } = exportParams;

      // Get tickets based on filters
      const tickets = await this.getTicketsForExport(
        filters,
        fields,
        includeComments,
        includeAttachments,
        user,
      );

      // Export based on format
      switch (format.toLowerCase()) {
        case 'csv':
          return await this.exportToCSV(tickets, fields);
        case 'excel':
          return await this.exportToExcel(tickets, fields);
        case 'json':
          return await this.exportToJSON(tickets);
        case 'pdf':
          return await this.exportToPDF(tickets, fields);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      logger.error('Error exporting tickets:', error);
      throw new Error('Export failed');
    }
  }

  /**
   * Get tickets for export
   */
  static async getTicketsForExport(filters, fields, includeComments, includeAttachments, user) {
    const whereClause = await this.buildExportWhereClause(filters, user);
    const includeClause = this.buildExportIncludeClause(
      fields,
      includeComments,
      includeAttachments,
    );

    return await prisma.enhancedSupportTicket.findMany({
      where: whereClause,
      include: includeClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Build where clause for export
   */
  static async buildExportWhereClause(filters, user) {
    const whereClause = {};

    // Apply user access filter
    const accessFilter = await this.getAccessFilter(user);
    Object.assign(whereClause, accessFilter);

    // Apply filters
    if (filters.status) {
      whereClause.state = Array.isArray(filters.status) ? { in: filters.status } : filters.status;
    }

    if (filters.priority) {
      whereClause.priority = Array.isArray(filters.priority)
        ? { in: filters.priority }
        : filters.priority;
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

    if (filters.category) {
      whereClause.category = filters.category;
    }

    return whereClause;
  }

  /**
   * Build include clause for export
   */
  static buildExportIncludeClause(fields, includeComments, includeAttachments) {
    const includeClause = {
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
    };

    if (includeComments || fields.includes('comments')) {
      includeClause.comments = {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'asc' },
      };
    }

    if (includeAttachments || fields.includes('attachments')) {
      includeClause.attachments = {
        include: {
          uploader: { select: { id: true, name: true, email: true } },
        },
      };
    }

    return includeClause;
  }

  /**
   * Export to CSV format
   */
  static async exportToCSV(tickets, fields) {
    try {
      const csvFields = fields.length > 0 ? fields : this.getDefaultCSVFields();
      const csvData = [];

      // Add header row
      csvData.push(csvFields.map((field) => this.getFieldLabel(field)));

      // Add data rows
      for (const ticket of tickets) {
        const row = csvFields.map((field) => this.getFieldValue(ticket, field));
        csvData.push(row);
      }

      // Convert to CSV string
      const csvContent = csvData
        .map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
        .join('\n');

      return {
        content: csvContent,
        mimeType: 'text/csv',
        filename: `tickets_export_${new Date().toISOString().split('T')[0]}.csv`,
      };
    } catch (error) {
      logger.error('Error exporting to CSV:', error);
      throw error;
    }
  }

  /**
   * Export to Excel format
   */
  static async exportToExcel(tickets, _fields) {
    try {
      // This would use a library like ExcelJS or xlsx
      logger.info(`Exporting ${tickets.length} tickets to Excel`);

      // Placeholder implementation
      return {
        content: Buffer.from('Excel export not implemented'),
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: `tickets_export_${new Date().toISOString().split('T')[0]}.xlsx`,
      };
    } catch (error) {
      logger.error('Error exporting to Excel:', error);
      throw error;
    }
  }

  /**
   * Export to JSON format
   */
  static async exportToJSON(tickets) {
    try {
      const jsonData = {
        exportDate: new Date().toISOString(),
        totalTickets: tickets.length,
        tickets: tickets.map((ticket) => this.formatTicketForJSON(ticket)),
      };

      return {
        content: JSON.stringify(jsonData, null, 2),
        mimeType: 'application/json',
        filename: `tickets_export_${new Date().toISOString().split('T')[0]}.json`,
      };
    } catch (error) {
      logger.error('Error exporting to JSON:', error);
      throw error;
    }
  }

  /**
   * Export to PDF format
   */
  static async exportToPDF(tickets, _fields) {
    try {
      // This would use a library like PDFKit or Puppeteer
      logger.info(`Exporting ${tickets.length} tickets to PDF`);

      // Placeholder implementation
      return {
        content: Buffer.from('PDF export not implemented'),
        mimeType: 'application/pdf',
        filename: `tickets_export_${new Date().toISOString().split('T')[0]}.pdf`,
      };
    } catch (error) {
      logger.error('Error exporting to PDF:', error);
      throw error;
    }
  }

  /**
   * Get default CSV fields
   */
  static getDefaultCSVFields() {
    return [
      'ticketNumber',
      'title',
      'description',
      'state',
      'priority',
      'urgency',
      'impact',
      'category',
      'subcategory',
      'requester.name',
      'requester.email',
      'assignedUser.name',
      'assignedGroup.name',
      'createdAt',
      'updatedAt',
      'dueDate',
      'resolvedAt',
      'closedAt',
    ];
  }

  /**
   * Get field label for display
   */
  static getFieldLabel(field) {
    const labelMap = {
      ticketNumber: 'Ticket Number',
      title: 'Title',
      description: 'Description',
      state: 'Status',
      priority: 'Priority',
      urgency: 'Urgency',
      impact: 'Impact',
      category: 'Category',
      subcategory: 'Subcategory',
      'requester.name': 'Requester Name',
      'requester.email': 'Requester Email',
      'assignedUser.name': 'Assigned To',
      'assignedGroup.name': 'Assigned Group',
      createdAt: 'Created Date',
      updatedAt: 'Last Updated',
      dueDate: 'Due Date',
      resolvedAt: 'Resolved Date',
      closedAt: 'Closed Date',
      tags: 'Tags',
      resolution: 'Resolution',
    };

    return labelMap[field] || field;
  }

  /**
   * Get field value from ticket object
   */
  static getFieldValue(ticket, field) {
    try {
      // Handle nested fields
      if (field.includes('.')) {
        const parts = field.split('.');
        let value = ticket;
        for (const part of parts) {
          value = value?.[part];
        }
        return value;
      }

      // Handle special cases
      switch (field) {
        case 'tags':
          return Array.isArray(ticket.tags) ? ticket.tags.join(', ') : '';
        case 'createdAt':
        case 'updatedAt':
        case 'dueDate':
        case 'resolvedAt':
        case 'closedAt':
          return ticket[field] ? new Date(ticket[field]).toLocaleString() : '';
        default:
          return ticket[field] || '';
      }
    } catch (error) {
      logger.error(`Error getting field value for ${field}:`, error);
      return '';
    }
  }

  /**
   * Format ticket for JSON export
   */
  static formatTicketForJSON(ticket) {
    return {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      title: ticket.title,
      description: ticket.description,
      state: ticket.state,
      priority: ticket.priority,
      urgency: ticket.urgency,
      impact: ticket.impact,
      category: ticket.category,
      subcategory: ticket.subcategory,
      tags: ticket.tags,
      customFields: ticket.customFields,
      requester: ticket.requester,
      assignedUser: ticket.assignedUser,
      assignedGroup: ticket.assignedGroup,
      sla: ticket.sla,
      dates: {
        created: ticket.createdAt,
        updated: ticket.updatedAt,
        due: ticket.dueDate,
        resolved: ticket.resolvedAt,
        closed: ticket.closedAt,
      },
      resolution: ticket.resolution,
      comments: ticket.comments?.map((comment) => ({
        id: comment.id,
        content: comment.content,
        isInternal: comment.isInternal,
        user: comment.user,
        createdAt: comment.createdAt,
      })),
      attachments: ticket.attachments?.map((attachment) => ({
        id: attachment.id,
        filename: attachment.filename,
        fileSize: attachment.fileSize,
        mimeType: attachment.mimeType,
        uploader: attachment.uploader,
        createdAt: attachment.createdAt,
      })),
    };
  }

  /**
   * Get access filter for user
   */
  static async getAccessFilter(user) {
    // Implement based on user roles and permissions
    if (user.roles?.includes('admin') || user.roles?.includes('technician')) {
      return {}; // Admin/tech can export all tickets
    }

    // Regular users can only export their own tickets
    return {
      OR: [
        { userId: user.id }, // Tickets they created
        { assignedToUserId: user.id }, // Tickets assigned to them
      ],
    };
  }

  /**
   * Generate export report
   */
  static async generateExportReport(exportId) {
    try {
      // This would track export operations for auditing
      logger.info(`Generating export report for export ${exportId}`);
      return {
        exportId,
        status: 'completed',
        recordCount: 0,
        fileSize: 0,
        downloadUrl: null,
      };
    } catch (error) {
      logger.error('Error generating export report:', error);
      throw error;
    }
  }
}
