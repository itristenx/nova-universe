# Week 2 Quick Reference - Admin & Monitoring APIs

**Status**: ✅ COMPLETE  
**Endpoints**: 30 total (28 implemented + 2 deferred)

---

## 🚀 Quick Start

### 1. Test Week 2 APIs

```bash
# Configure environment
echo 'DATABASE_URL="postgresql://user:pass@localhost:5432/nova_universe"' >> .env

# Setup database
npx prisma generate
npx prisma db push

# Start server
cd apps/api && pnpm dev

# Run tests
./test-week-2-apis.sh
```

### 2. Files Changed

| File | Changes | Lines |
|------|---------|-------|
| `apps/api/routes/webhooks.js` | ✅ NEW | 605 |
| `apps/api/routes/knowledge.js` | ✅ EXTENDED | +719 |
| `apps/api/index.js` | ✅ UPDATED | +2 |
| `test-week-2-apis.sh` | ✅ NEW | 250 |

**Total**: 1,576 lines

---

## 📡 Webhook APIs

### Base URL: `/api/v1/webhooks`

#### List Webhooks (Admin)
```bash
GET /api/v1/webhooks
Authorization: Bearer <admin-token>
```

#### Create Webhook (Admin)
```bash
POST /api/v1/webhooks
{
  "name": "Slack Notifications",
  "url": "https://hooks.slack.com/...",
  "events": ["ticket.created", "alert.triggered"],
  "authType": "bearer",
  "authCredentials": { "token": "..." }
}
```

#### Test Webhook (Admin)
```bash
POST /api/v1/webhooks/:id/test
```

#### Available Events
- `ticket.created`, `ticket.updated`, `ticket.closed`
- `alert.triggered`, `alert.resolved`
- `user.created`, `user.updated`
- `service.requested`, `service.approved`
- `asset.created`, `asset.updated`
- `change.created`, `change.approved`
- `knowledge.published`
- `notification.sent`

---

## 📚 Knowledge CRUD APIs

### Base URL: `/api/v1/knowledge/articles`

#### Create Article
```bash
POST /api/v1/knowledge/articles
{
  "title": "How to Reset Password",
  "content": "Step-by-step guide...",
  "summary": "Password reset instructions",
  "categoryId": "category-uuid",
  "tags": ["password", "security"],
  "status": "published"
}
```

#### Update Article (Creates New Version)
```bash
PUT /api/v1/knowledge/articles/:id
{
  "title": "Updated Title",
  "content": "Updated content...",
  "changeNotes": "Fixed typos"
}
```

#### Archive Article
```bash
DELETE /api/v1/knowledge/articles/:id
```

---

## 📝 Versioning APIs

### Base URL: `/api/v1/knowledge/articles/:id/versions`

#### List Versions
```bash
GET /api/v1/knowledge/articles/:id/versions
```

#### Get Specific Version
```bash
GET /api/v1/knowledge/articles/:id/versions/:versionId
```

#### Restore Version
```bash
POST /api/v1/knowledge/articles/:id/versions/:versionId/restore
```

#### View History
```bash
GET /api/v1/knowledge/articles/:id/history
```

---

## 💬 Comments APIs

### Base URL: `/api/v1/knowledge/articles/:id/comments`

#### List Comments
```bash
GET /api/v1/knowledge/articles/:id/comments
# Returns nested comments with replies
```

#### Add Comment
```bash
POST /api/v1/knowledge/articles/:id/comments
{
  "content": "Great article!"
}
```

#### Reply to Comment
```bash
POST /api/v1/knowledge/articles/:id/comments/:commentId/reply
{
  "content": "Thanks!"
}
```

#### Update Comment (Own Only)
```bash
PUT /api/v1/knowledge/articles/:id/comments/:commentId
{
  "content": "Updated comment"
}
```

#### Delete Comment (Own or Admin)
```bash
DELETE /api/v1/knowledge/articles/:id/comments/:commentId
```

---

## 🚨 Alert APIs

### Base URL: `/api/v1/alerts`

#### List Active Alerts
```bash
GET /api/v1/alerts/active
```

#### Get Statistics
```bash
GET /api/v1/alerts/stats
```

#### List All Alerts
```bash
GET /api/v1/alerts?severity=critical&status=open
```

#### Acknowledge Alert
```bash
POST /api/v1/alerts/:id/acknowledge
{
  "notes": "Investigating the issue"
}
```

#### Resolve Alert
```bash
POST /api/v1/alerts/:id/resolve
{
  "notes": "Issue fixed"
}
```

---

## 🔒 Security

### Authentication Required

| Endpoint | Auth Level |
|----------|------------|
| Webhooks (all) | Admin only |
| Knowledge Create | Authenticated |
| Knowledge Update/Delete | Author or Admin |
| Versioning (read) | Authenticated |
| Versioning (restore) | Author or Admin |
| Comments (read) | Public |
| Comments (write) | Authenticated |
| Comments (delete) | Author or Admin |
| Alerts (read) | Authenticated |
| Alerts (write) | Varies by operation |

### Rate Limits

| Endpoint Type | Limit |
|---------------|-------|
| Webhooks | 30 req/min |
| Knowledge CRUD | 30 req/min |
| Knowledge Read | 60-120 req/min |
| Comments | 30-60 req/min |
| Alerts | 60 req/min |

---

## 🗄️ Database Models

### Webhooks
- `WebhookEndpoint` (notification.prisma)
- `WebhookDelivery` (notification.prisma)

### Alerts
- `Alert` (notification.prisma)
- `AlertRule` (notification.prisma)

### Knowledge Base
- `KbArticle` (knowledge.prisma)
- `KbArticleVersion` (knowledge.prisma)
- `KbArticleComment` (knowledge.prisma)
- `KbCategory` (knowledge.prisma)
- `User` (user.prisma)

---

## 🧪 Testing

### Run Test Script
```bash
# Edit tokens first
nano test-week-2-apis.sh
# Set ADMIN_TOKEN and USER_TOKEN

# Run tests
chmod +x test-week-2-apis.sh
./test-week-2-apis.sh
```

### Manual Testing

#### Test Webhooks
```bash
# List events
curl http://localhost:3000/api/v1/webhooks/events \
  -H "Authorization: Bearer $TOKEN"

# Create webhook
curl -X POST http://localhost:3000/api/v1/webhooks \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Webhook",
    "url": "https://webhook.site/unique-id",
    "events": ["ticket.created"]
  }'
```

#### Test Knowledge CRUD
```bash
# Create article
curl -X POST http://localhost:3000/api/v1/knowledge/articles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Article",
    "content": "This is test content",
    "status": "draft"
  }'
```

---

## 📋 Completion Status

### Implemented (28/30)
- ✅ Webhooks: 8/8
- ✅ Knowledge CRUD: 3/3
- ✅ Versioning: 4/5 (compare deferred)
- ✅ Comments: 5/6 (like deferred)
- ✅ Alerts: 8/8

### Deferred to Future (2/30)
- ⏳ Version comparison (diff view)
- ⏳ Comment likes (upvoting)

---

## 🎯 Next Steps

### Immediate (Today)
1. Test all endpoints with real database
2. Create test articles and comments
3. Test webhook delivery to external URL
4. Verify version restore works

### Week 3 (Next)
1. Change Management APIs
2. Workflow Builder APIs
3. Frontend integration for Week 2

### Integration Points
- **WebhookConfigurationPage.tsx** → Use `/api/v1/webhooks/*`
- **AlertManagementPage.tsx** → Use `/api/v1/alerts/*`
- **ArticleEditorPage.tsx** → Use `/api/v1/knowledge/articles/*`
- **ArticleViewerPage.tsx** → Add version history + comments

---

## 📚 Documentation

**Week 2 Docs**:
- `docs/WEEK-2-TODO-CHECKLIST.md` - Task checklist
- `docs/WEEK-2-IMPLEMENTATION-SUMMARY.md` - Full summary
- `docs/WEEK-2-QUICK-REFERENCE.md` - This file
- `test-week-2-apis.sh` - Test script

**Week 1 Docs** (Reference):
- `docs/WEEK-1-README.md` - Week 1 quick ref
- `docs/WEEK-1-SCHEMA-MAPPING.md` - Prisma models

---

## 🔗 Useful Links

### Development
- API Server: `http://localhost:3000`
- Prisma Studio: `npx prisma studio`
- Database: `postgresql://localhost:5432/nova_universe`

### External Tools
- Webhook Testing: https://webhook.site
- JWT Debugger: https://jwt.io
- JSON Formatter: https://jsonformatter.org

---

**Week 2 Status**: ✅ COMPLETE (28/30 endpoints)  
**Ready for**: Testing, Frontend Integration, Week 3  
**Last Updated**: January 7, 2025
