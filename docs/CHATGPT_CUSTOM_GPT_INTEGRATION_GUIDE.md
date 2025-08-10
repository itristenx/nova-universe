# ChatGPT Custom GPT Integration Guide for Nova MCP Server

## 🚀 Overview

This guide provides step-by-step instructions for integrating Nova's MCP (Model Context Protocol) server with ChatGPT as a Custom GPT. This integration enables ChatGPT to directly access Nova's AI fabric, ticket management, knowledge base, and ITSM tools.

## 📋 Prerequisites

- Nova AI Fabric deployed and running
- Nova MCP Server accessible via public URL
- OpenAI ChatGPT Plus or Team subscription
- Access to create Custom GPTs in ChatGPT

## 🔧 MCP Server Configuration

### 1. Environment Setup

Ensure your Nova MCP server is configured with the following environment variables:

```bash
# MCP Server Configuration
MCP_SERVER_PORT=3001
MCP_SERVER_HOST=0.0.0.0
MCP_SERVER_API_KEY=your-secure-mcp-api-key-here
MCP_SERVER_CORS_ORIGINS=https://chat.openai.com,https://chatgpt.com
MCP_SERVER_RATE_LIMIT_WINDOW=900000
MCP_SERVER_RATE_LIMIT_MAX=100
MCP_SERVER_SESSION_SECRET=your-session-secret-here
MCP_SERVER_WEBHOOK_SECRET=your-webhook-secret-here

# Security Configuration
AI_FABRIC_JWT_SECRET=your-jwt-secret-here
AI_FABRIC_ENCRYPTION_KEY=your-encryption-key-here
```

### 2. Public Accessibility

Ensure your MCP server is accessible from the internet:

```bash
# Test MCP server accessibility
curl -X GET "https://your-domain.com:3001/.well-known/mcp-server"

# Expected response:
{
  "server": "Nova MCP Server",
  "version": "1.0.0",
  "description": "Model Context Protocol server for Nova ITSM",
  "capabilities": ["tools", "resources", "prompts"],
  "endpoints": {
    "mcp": "https://your-domain.com:3001/mcp",
    "tools": "https://your-domain.com:3001/api/v1/tools",
    "health": "https://your-domain.com:3001/health"
  }
}
```

## 🎯 Custom GPT Configuration

### 1. Create Custom GPT

1. Go to [ChatGPT](https://chat.openai.com)
2. Click "Explore GPTs" → "Create"
3. Choose "Configure" tab

### 2. Basic Information

```yaml
Name: Nova ITSM Assistant
Description: Advanced AI assistant for Nova ITSM platform with access to tickets, knowledge base, analytics, and automation tools.

Instructions: |
  You are Nova, an intelligent ITSM (IT Service Management) assistant powered by the Nova AI Fabric. You have access to a comprehensive suite of tools for:
  
  - 🎫 Ticket Management: Create, search, analyze, and auto-resolve tickets
  - 📚 Knowledge Base: Search and submit knowledge articles
  - 🔍 Analytics: Generate insights and trends from ITSM data  
  - 🤖 AI Tools: Ticket classification, intent analysis, and similarity detection
  - 🎮 Gamification: Award XP and manage user profiles
  - ⚡ Workflows: Execute automated processes and custom workflows
  - 🔗 Hooks: Register and trigger system events
  - 💬 Conversations: Manage MCP sessions and interactions

  ## Core Capabilities:
  
  1. **Intelligent Ticket Handling**
     - Automatically classify and prioritize tickets
     - Find similar historical tickets for faster resolution
     - Suggest solutions based on Nova's knowledge base
     - Auto-create tickets from user descriptions
  
  2. **Knowledge Management**
     - Semantic search across documentation and solutions
     - Submit new knowledge articles and feedback
     - Provide contextual recommendations
  
  3. **Analytics & Insights**
     - Analyze ticket trends and patterns
     - Generate performance reports
     - Identify improvement opportunities
  
  4. **Workflow Automation**
     - Execute predefined workflows
     - Trigger custom automation sequences
     - Manage approval processes
  
  ## Interaction Guidelines:
  
  - Always be helpful, professional, and accurate
  - Use Nova tools to provide real-time, up-to-date information
  - Explain your reasoning and data sources
  - Offer proactive suggestions and recommendations
  - Maintain security and privacy standards
  - Follow ITSM best practices and industry standards
  
  ## Security & Compliance:
  
  - Respect user permissions and access controls
  - Handle sensitive information appropriately
  - Maintain audit trails for all actions
  - Follow GDPR, CCPA, and other privacy regulations
  
  When users ask questions or request actions, use the appropriate Nova tools to:
  1. Gather relevant information
  2. Perform the requested operations
  3. Provide comprehensive, actionable responses
  4. Suggest next steps or related actions
  
  Always aim to be more helpful than a traditional chatbot by leveraging Nova's powerful AI and automation capabilities.

Conversation Starters:
- "Create a new incident ticket for server downtime"
- "Find knowledge articles about password reset procedures"
- "Analyze recent ticket trends and patterns"
- "Execute the new user onboarding workflow"
- "What are the most common IT issues this week?"
- "Help me troubleshoot a network connectivity problem"
```

### 3. Actions Configuration

Click "Create new action" and configure the MCP server connection:

#### Action 1: Nova MCP Server Connection

```yaml
Authentication: API Key
API Key: your-mcp-api-key-here
Auth Type: Bearer

Schema:
```

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Nova MCP Server API",
    "description": "Model Context Protocol server for Nova ITSM platform",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://your-domain.com:3001"
    }
  ],
  "components": {
    "securitySchemes": {
      "BearerAuth": {
        "type": "http",
        "scheme": "bearer"
      }
    }
  },
  "security": [
    {
      "BearerAuth": []
    }
  ],
  "paths": {
    "/.well-known/mcp-server": {
      "get": {
        "summary": "Get MCP server information",
        "description": "Returns server capabilities and endpoints",
        "operationId": "getMCPServerInfo",
        "responses": {
          "200": {
            "description": "Server information",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "server": {"type": "string"},
                    "version": {"type": "string"},
                    "description": {"type": "string"},
                    "capabilities": {
                      "type": "array",
                      "items": {"type": "string"}
                    },
                    "endpoints": {"type": "object"}
                  }
                }
              }
            }
          }
        }
      }
    },
    "/mcp": {
      "post": {
        "summary": "Execute MCP request",
        "description": "Send JSON-RPC 2.0 request to MCP server",
        "operationId": "executeMCPRequest",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "jsonrpc": {
                    "type": "string",
                    "enum": ["2.0"]
                  },
                  "method": {"type": "string"},
                  "params": {"type": "object"},
                  "id": {"type": "string"}
                },
                "required": ["jsonrpc", "method", "id"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "MCP response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "jsonrpc": {"type": "string"},
                    "result": {"type": "object"},
                    "error": {"type": "object"},
                    "id": {"type": "string"}
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/tools/nova.tickets.create/execute": {
      "post": {
        "summary": "Create a new ticket",
        "description": "Create a new ticket in Nova ITSM",
        "operationId": "createTicket",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "title": {"type": "string"},
                  "description": {"type": "string"},
                  "priority": {
                    "type": "string",
                    "enum": ["low", "medium", "high", "critical"]
                  },
                  "category": {"type": "string"},
                  "userId": {"type": "string"}
                },
                "required": ["title", "description"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Ticket created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {"type": "boolean"},
                    "ticketId": {"type": "string"},
                    "message": {"type": "string"}
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/tools/nova.lore.search/execute": {
      "post": {
        "summary": "Search knowledge base",
        "description": "Search Nova knowledge base for relevant articles",
        "operationId": "searchKnowledge",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "query": {"type": "string"},
                  "limit": {"type": "integer", "default": 5},
                  "category": {"type": "string"}
                },
                "required": ["query"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Knowledge search results",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {"type": "boolean"},
                    "results": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": {"type": "string"},
                          "title": {"type": "string"},
                          "content": {"type": "string"},
                          "category": {"type": "string"},
                          "relevance": {"type": "number"}
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/tools/nova.ai.analyze_ticket/execute": {
      "post": {
        "summary": "Analyze ticket with AI",
        "description": "Use Nova AI to analyze and classify a ticket",
        "operationId": "analyzeTicket",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "ticketContent": {"type": "string"},
                  "analysisType": {
                    "type": "string",
                    "enum": ["classification", "sentiment", "priority", "urgency"]
                  }
                },
                "required": ["ticketContent"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "AI analysis results",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {"type": "boolean"},
                    "analysis": {"type": "object"},
                    "confidence": {"type": "number"},
                    "recommendations": {
                      "type": "array",
                      "items": {"type": "string"}
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/tools/nova.ai.get_trends/execute": {
      "post": {
        "summary": "Get AI-powered trends",
        "description": "Generate trends and insights using Nova AI",
        "operationId": "getTrends",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "timeframe": {
                    "type": "string",
                    "enum": ["24h", "7d", "30d", "90d"]
                  },
                  "category": {"type": "string"},
                  "metrics": {
                    "type": "array",
                    "items": {"type": "string"}
                  }
                },
                "required": ["timeframe"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Trend analysis results",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {"type": "boolean"},
                    "trends": {"type": "object"},
                    "insights": {
                      "type": "array",
                      "items": {"type": "string"}
                    },
                    "recommendations": {
                      "type": "array",
                      "items": {"type": "string"}
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/tools/nova.workflows.execute/execute": {
      "post": {
        "summary": "Execute workflow",
        "description": "Execute a predefined Nova workflow",
        "operationId": "executeWorkflow",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "workflowId": {"type": "string"},
                  "parameters": {"type": "object"},
                  "userId": {"type": "string"}
                },
                "required": ["workflowId"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Workflow execution result",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {"type": "boolean"},
                    "executionId": {"type": "string"},
                    "status": {"type": "string"},
                    "result": {"type": "object"}
                  }
                }
              }
            }
          }
        }
      }
    },
    "/health": {
      "get": {
        "summary": "Health check",
        "description": "Check MCP server health",
        "operationId": "healthCheck",
        "responses": {
          "200": {
            "description": "Server is healthy",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {"type": "string"},
                    "timestamp": {"type": "string"},
                    "uptime": {"type": "number"},
                    "services": {"type": "object"}
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

### 4. Privacy Policy URL

```
https://your-domain.com/privacy-policy
```

## 🔒 Security Configuration

### 1. API Key Authentication

1. In Custom GPT Actions, set Authentication to "API Key"
2. Use your MCP server API key
3. Set Auth Type to "Bearer"

### 2. CORS Configuration

Ensure your MCP server allows ChatGPT origins:

```javascript
// In your MCP server configuration
const corsOptions = {
  origin: [
    'https://chat.openai.com',
    'https://chatgpt.com',
    'https://*.openai.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-MCP-Session']
};
```

### 3. Rate Limiting

Configure appropriate rate limits for ChatGPT:

```javascript
// Rate limiting configuration
const rateLimiting = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  skipSuccessfulRequests: false,
  skipFailedRequests: false
};
```

## 🧪 Testing the Integration

### 1. Test Server Connectivity

```bash
# Test MCP server endpoint
curl -X GET "https://your-domain.com:3001/.well-known/mcp-server" \
  -H "Authorization: Bearer your-api-key"

# Test tool execution
curl -X POST "https://your-domain.com:3001/api/v1/tools/nova.lore.search/execute" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "query": "password reset procedure",
    "limit": 3
  }'
```

### 2. Test in ChatGPT

Try these example prompts in your Custom GPT:

```
1. "Search the knowledge base for password reset procedures"
2. "Create a ticket for a user reporting slow internet connection"
3. "Analyze recent ticket trends for the past week"
4. "Execute the new user onboarding workflow"
5. "Find similar tickets to: Email server not responding"
```

## 📊 Example Interactions

### Creating a Ticket

**User:** "Create a ticket for Sarah who can't access her email"

**Nova GPT:** 
```
I'll create a ticket for Sarah's email access issue. Let me gather the details and create this in Nova.

*[Calls nova.tickets.create tool]*

✅ **Ticket Created Successfully**

**Ticket ID:** INC-2024-001234
**Title:** Email Access Issue - Sarah
**Description:** User Sarah unable to access email
**Priority:** Medium
**Category:** Email/Communication
**Status:** Open

**Next Steps:**
1. I've automatically classified this as an email communication issue
2. The ticket has been assigned to the Email Support team
3. Estimated resolution time: 4 hours based on SLA

Would you like me to:
- Search for similar past issues and solutions?
- Check if there are any known email server problems?
- Execute the email troubleshooting workflow?
```

### Knowledge Search

**User:** "How do I reset a user's password in Active Directory?"

**Nova GPT:**
```
Let me search Nova's knowledge base for Active Directory password reset procedures.

*[Calls nova.lore.search tool]*

📚 **Knowledge Base Results:**

**1. Active Directory Password Reset Procedure (KB-001)**
- **Relevance:** 95%
- **Category:** User Management
- **Summary:** Step-by-step guide for resetting passwords in AD

**Procedure:**
1. Open Active Directory Users and Computers
2. Navigate to the user's organizational unit
3. Right-click on the user account
4. Select "Reset Password"
5. Enter new temporary password
6. Check "User must change password at next logon"
7. Click OK and notify the user

**2. PowerShell Password Reset Script (KB-045)**
- **Relevance:** 88%
- **Category:** Automation
- **Command:** `Set-ADAccountPassword -Identity username -Reset`

**3. Self-Service Password Reset Setup (KB-012)**
- **Relevance:** 78%
- **Category:** Self-Service
- **Details:** How to enable SSPR for users

Would you like me to create a ticket to track this password reset or provide more details on any of these procedures?
```

## 🚀 Advanced Features

### 1. Session Management

The MCP server maintains sessions for continuity:

```javascript
// Session context is maintained across conversations
{
  "sessionId": "session_12345",
  "userId": "user_67890",
  "context": {
    "activeTickets": ["INC-001", "INC-002"],
    "lastSearchQuery": "password reset",
    "workflowInProgress": "user_onboarding"
  }
}
```

### 2. Workflow Integration

Execute complex workflows through ChatGPT:

```
User: "Start the new employee onboarding for John Smith"
GPT: Executes nova.workflows.execute with onboarding workflow
Result: Creates user account, sends welcome email, schedules training
```

### 3. AI-Powered Insights

Leverage Nova's AI for intelligent responses:

```
User: "Why are we getting so many password reset tickets?"
GPT: Uses nova.ai.get_trends to analyze patterns and provide insights
```

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify CORS origins include ChatGPT domains
   - Check preflight request handling

2. **Authentication Failures**
   - Confirm API key is correctly set
   - Verify Bearer token format

3. **Rate Limiting**
   - Monitor rate limit headers
   - Adjust limits for ChatGPT usage

4. **Timeout Issues**
   - Increase timeout values for complex operations
   - Implement request queuing

### Debug Mode

Enable debug logging in your MCP server:

```javascript
// Enable debug logging
process.env.DEBUG = 'nova:mcp:*';
process.env.LOG_LEVEL = 'debug';
```

## 📈 Monitoring & Analytics

### Metrics to Track

1. **Usage Metrics**
   - Tool call frequency
   - Response times
   - Error rates

2. **User Engagement**
   - Session duration
   - Tool adoption
   - User satisfaction

3. **System Performance**
   - Server response times
   - Resource utilization
   - Concurrent connections

### Grafana Dashboard

Create dashboards to monitor:
- MCP server health
- ChatGPT integration metrics
- User activity patterns
- Error tracking

## 🎯 Best Practices

### 1. Security
- Rotate API keys regularly
- Monitor for unusual usage patterns
- Implement IP allowlisting if needed
- Use HTTPS for all communications

### 2. Performance
- Cache frequent queries
- Implement connection pooling
- Use async processing for heavy operations
- Monitor and optimize database queries

### 3. User Experience
- Provide clear error messages
- Implement graceful fallbacks
- Use typing indicators for long operations
- Offer alternative actions when tools fail

### 4. Compliance
- Log all interactions for audit
- Respect data privacy regulations
- Implement proper access controls
- Maintain data retention policies

## 🚀 Go Live Checklist

- [ ] MCP server deployed and accessible
- [ ] SSL certificate configured
- [ ] CORS properly configured for ChatGPT
- [ ] API keys generated and secured
- [ ] Rate limiting configured
- [ ] Monitoring and alerting set up
- [ ] Custom GPT created and tested
- [ ] Documentation updated
- [ ] Team training completed
- [ ] Backup and recovery procedures tested

## 📞 Support

For additional support with the ChatGPT integration:

- **Documentation:** [Nova AI Fabric Docs](./NOVA_AI_FABRIC_IMPLEMENTATION.md)
- **MCP Server Status:** `https://your-domain.com:3001/health`
- **API Reference:** `https://your-domain.com:3001/.well-known/mcp-server`

---

**🎉 Congratulations!** Your Nova ITSM system is now integrated with ChatGPT, providing users with an intelligent, conversational interface to your entire ITSM platform powered by industry-leading AI capabilities!