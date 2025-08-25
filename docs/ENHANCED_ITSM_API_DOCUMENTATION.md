# Enhanced ITSM API Documentation

## Base URL

```
/api/enhanced-tickets
```

## Authentication

All endpoints require JWT authentication via Authorization header:

```
Authorization: Bearer <token>
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Success Responses

All endpoints return standardized success responses:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

## Endpoints

### 1. List Tickets

```
GET /api/enhanced-tickets
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `status` (string): Filter by status
- `priority` (string): Filter by priority
- `category` (string): Filter by category
- `assignedToUserId` (string): Filter by assignee
- `userId` (string): Filter by requester
- `search` (string): Search in title and description
- `sortBy` (string): Sort field (default: createdAt)
- `sortOrder` (string): Sort direction (asc/desc, default: desc)
- `dateFrom` (string): Filter tickets created after date (ISO 8601)
- `dateTo` (string): Filter tickets created before date (ISO 8601)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "ticket-id",
      "ticketNumber": "NOVA-12345",
      "title": "Ticket title",
      "description": "Ticket description",
      "status": "open",
      "priority": "high",
      "urgency": "high",
      "impact": "high",
      "category": {
        "id": "cat-id",
        "name": "Hardware",
        "description": "Hardware issues"
      },
      "subcategory": {
        "id": "subcat-id",
        "name": "Desktop",
        "description": "Desktop hardware"
      },
      "userId": "user-id",
      "user": {
        "id": "user-id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "assignedToUserId": "assignee-id",
      "assignedToUser": {
        "id": "assignee-id",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T11:00:00Z",
      "resolvedAt": null,
      "closedAt": null,
      "sla": {
        "responseTarget": "2024-01-15T12:30:00Z",
        "resolutionTarget": "2024-01-17T10:30:00Z",
        "isBreached": false
      }
    }
  ],
  "meta": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### 2. Create Ticket

```
POST /api/enhanced-tickets
```

**Request Body:**

```json
{
  "title": "Ticket title (required)",
  "description": "Detailed description (required)",
  "priority": "low|medium|high|critical",
  "urgency": "low|medium|high|critical",
  "impact": "low|medium|high|critical",
  "categoryId": "category-id",
  "subcategoryId": "subcategory-id",
  "assignedToUserId": "assignee-id (optional)",
  "tags": ["tag1", "tag2"],
  "customFields": {
    "field1": "value1",
    "field2": "value2"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "new-ticket-id",
    "ticketNumber": "NOVA-12346",
    "title": "Ticket title",
    "status": "open",
    "createdAt": "2024-01-15T12:00:00Z",
    "sla": {
      "responseTarget": "2024-01-15T14:00:00Z",
      "resolutionTarget": "2024-01-17T12:00:00Z"
    }
  }
}
```

### 3. Get Ticket Details

```
GET /api/enhanced-tickets/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "ticket-id",
    "ticketNumber": "NOVA-12345",
    "title": "Ticket title",
    "description": "Ticket description",
    "status": "open",
    "priority": "high",
    "urgency": "high",
    "impact": "high",
    "category": {...},
    "subcategory": {...},
    "user": {...},
    "assignedToUser": {...},
    "comments": [
      {
        "id": "comment-id",
        "content": "Comment content",
        "isPublic": true,
        "author": {...},
        "createdAt": "2024-01-15T11:00:00Z"
      }
    ],
    "attachments": [
      {
        "id": "attachment-id",
        "fileName": "screenshot.png",
        "fileSize": 1024,
        "mimeType": "image/png",
        "uploadedBy": {...},
        "createdAt": "2024-01-15T10:45:00Z"
      }
    ],
    "activities": [
      {
        "id": "activity-id",
        "action": "status_changed",
        "details": {
          "from": "open",
          "to": "in_progress"
        },
        "user": {...},
        "createdAt": "2024-01-15T11:30:00Z"
      }
    ],
    "watchers": [
      {
        "id": "watcher-id",
        "user": {...},
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "timeTracking": [
      {
        "id": "time-id",
        "description": "Working on resolution",
        "timeSpent": 3600,
        "user": {...},
        "createdAt": "2024-01-15T12:00:00Z"
      }
    ],
    "sla": {
      "id": "sla-id",
      "definition": {...},
      "responseTarget": "2024-01-15T12:30:00Z",
      "resolutionTarget": "2024-01-17T10:30:00Z",
      "responseTime": 1800,
      "isResponseBreached": false,
      "isResolutionBreached": false
    },
    "workflow": {
      "id": "workflow-id",
      "definition": {...},
      "currentStep": {...},
      "status": "active"
    }
  }
}
```

### 4. Update Ticket

```
PUT /api/enhanced-tickets/:id
```

**Request Body:** (partial update supported)

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "in_progress|resolved|closed|cancelled",
  "priority": "low|medium|high|critical",
  "urgency": "low|medium|high|critical",
  "impact": "low|medium|high|critical",
  "assignedToUserId": "new-assignee-id",
  "categoryId": "new-category-id",
  "subcategoryId": "new-subcategory-id",
  "resolution": "Resolution details (when status=resolved)",
  "customFields": {
    "field1": "new-value"
  }
}
```

### 5. Assign Ticket

```
POST /api/enhanced-tickets/:id/assign
```

**Request Body:**

```json
{
  "assignedToUserId": "assignee-id",
  "comment": "Assignment comment (optional)",
  "notifyAssignee": true
}
```

### 6. Add Comment

```
POST /api/enhanced-tickets/:id/comments
```

**Request Body:**

```json
{
  "content": "Comment content (required)",
  "isPublic": true,
  "notifyWatchers": true
}
```

### 7. Add Attachment

```
POST /api/enhanced-tickets/:id/attachments
```

**Request Body:** (multipart/form-data)

- `file`: File upload
- `description`: File description (optional)

### 8. Get Activities

```
GET /api/enhanced-tickets/:id/activities
```

**Query Parameters:**

- `page` (number): Page number
- `limit` (number): Items per page
- `action` (string): Filter by action type

### 9. Manage Watchers

```
POST /api/enhanced-tickets/:id/watchers
DELETE /api/enhanced-tickets/:id/watchers/:userId
```

**POST Request Body:**

```json
{
  "userId": "user-id"
}
```

### 10. Time Tracking

```
POST /api/enhanced-tickets/:id/time-tracking
```

**Request Body:**

```json
{
  "description": "Work description",
  "timeSpent": 3600,
  "workType": "development|testing|documentation|meeting",
  "billable": true
}
```

### 11. Bulk Update

```
POST /api/enhanced-tickets/bulk-update
```

**Request Body:**

```json
{
  "ticketIds": ["id1", "id2", "id3"],
  "updates": {
    "status": "in_progress",
    "assignedToUserId": "assignee-id",
    "priority": "high"
  },
  "comment": "Bulk update comment (optional)"
}
```

### 12. Advanced Search

```
GET /api/enhanced-tickets/search
```

**Query Parameters:**

- `q` (string): Search query
- `filters` (object): Advanced filters
- `facets` (array): Facet fields to return
- `page` (number): Page number
- `limit` (number): Items per page

**Example:**

```
/api/enhanced-tickets/search?q=network+issue&filters[status]=open&filters[priority]=high&facets[]=category&facets[]=assignee
```

### 13. Export Tickets

```
GET /api/enhanced-tickets/export
```

**Query Parameters:**

- `format` (string): Export format (csv|excel|json|pdf)
- `fields` (array): Fields to include
- `filters` (object): Filter criteria
- `filename` (string): Custom filename

**Response:** File download or export job ID for large datasets

### 14. Analytics

```
GET /api/enhanced-tickets/analytics
```

**Query Parameters:**

- `period` (string): Time period (day|week|month|quarter|year)
- `groupBy` (string): Group by field
- `metrics` (array): Metrics to calculate

**Response:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTickets": 1250,
      "openTickets": 89,
      "resolvedTickets": 1045,
      "averageResolutionTime": 25.5,
      "slaCompliance": 94.2
    },
    "trends": [
      {
        "period": "2024-01-01",
        "created": 45,
        "resolved": 42,
        "avgResolutionTime": 24.8
      }
    ],
    "breakdown": {
      "byCategory": [
        {
          "category": "Hardware",
          "count": 234,
          "percentage": 18.7
        }
      ],
      "byPriority": [
        {
          "priority": "high",
          "count": 125,
          "percentage": 10.0
        }
      ]
    }
  }
}
```

### 15. Get Categories

```
GET /api/enhanced-tickets/categories
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "cat-id",
      "name": "Hardware",
      "description": "Hardware related issues",
      "isActive": true,
      "subcategories": [
        {
          "id": "subcat-id",
          "name": "Desktop",
          "description": "Desktop hardware"
        }
      ]
    }
  ]
}
```

## WebSocket Events

### Real-time Updates

Connect to: `/ws/tickets`

**Events:**

- `ticket_created` - New ticket created
- `ticket_updated` - Ticket updated
- `ticket_assigned` - Ticket assigned
- `comment_added` - New comment added
- `status_changed` - Status changed
- `sla_breach` - SLA breach detected

**Event Payload:**

```json
{
  "event": "ticket_updated",
  "data": {
    "ticketId": "ticket-id",
    "changes": {
      "status": {
        "from": "open",
        "to": "in_progress"
      }
    },
    "updatedBy": {
      "id": "user-id",
      "name": "John Doe"
    },
    "timestamp": "2024-01-15T12:00:00Z"
  }
}
```

## Rate Limiting

- General endpoints: 100 requests per minute per user
- Search endpoints: 30 requests per minute per user
- Export endpoints: 5 requests per minute per user
- Bulk operations: 10 requests per minute per user

## Webhooks

### Configuration

```
POST /api/webhooks
```

**Request Body:**

```json
{
  "url": "https://your-app.com/webhook",
  "events": ["ticket_created", "ticket_updated"],
  "secret": "webhook-secret",
  "isActive": true
}
```

### Webhook Payload

```json
{
  "event": "ticket_created",
  "data": {
    "ticket": {...},
    "user": {...}
  },
  "timestamp": "2024-01-15T12:00:00Z",
  "signature": "sha256=..."
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error

## Validation Rules

### Ticket Creation

- `title`: Required, 3-200 characters
- `description`: Required, 10-5000 characters
- `priority`: One of: low, medium, high, critical
- `urgency`: One of: low, medium, high, critical
- `impact`: One of: low, medium, high, critical

### Status Transitions

Valid status transitions:

- `open` → `in_progress`, `resolved`, `cancelled`
- `in_progress` → `open`, `resolved`, `cancelled`
- `resolved` → `open`, `closed`
- `closed` → `open` (reopen)
- `cancelled` → `open` (reopen)

### File Uploads

- Maximum file size: 10MB
- Allowed types: images, documents, text files
- Virus scanning: All uploads scanned
- Storage: Encrypted at rest
