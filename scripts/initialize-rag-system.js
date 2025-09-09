#!/usr/bin/env node

/**
 * RAG System Initialization Script
 * 
 * Initializes the RAG system with sample data for demonstration purposes
 */

import { ragEngine } from '../apps/api/lib/rag-engine.js';
import { localEmbeddingModel } from '../apps/api/lib/rag-local-embeddings.js';
import { logger } from '../apps/api/logger.js';

// Sample Nova documentation and knowledge base content
const sampleDocuments = [
  // Installation Documentation
  {
    id: 'nova-install-windows',
    content: `
# Installing Nova Help Desk on Windows

## Prerequisites
- Windows Server 2019 or later
- .NET 6.0 or higher
- SQL Server 2017 or later
- IIS 10.0 or later
- At least 4GB RAM
- 10GB free disk space

## Installation Steps

### 1. Download Nova Installer
Visit the Nova portal and download the latest Windows installer package.

### 2. Prepare Database
Create a new SQL Server database for Nova:
- Database name: NovaHelpDesk
- Set appropriate collation (SQL_Latin1_General_CP1_CI_AS)
- Ensure SQL Server Agent is running

### 3. Run Installation
1. Run the installer as administrator
2. Follow the installation wizard
3. Configure database connection string
4. Set up initial admin account
5. Configure SMTP settings for notifications

### 4. Post-Installation
- Verify all services are running
- Test database connectivity
- Configure backup schedules
- Set up monitoring

## Troubleshooting
- Check Windows Event Logs for errors
- Verify SQL Server permissions
- Ensure firewall allows traffic on configured ports
    `,
    metadata: {
      type: 'documentation',
      source: 'nova_documentation',
      category: 'installation',
      tags: ['windows', 'install', 'setup', 'database'],
      classification: 'public',
      department: 'IT',
      author: 'Nova Documentation Team',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-08-15'),
    }
  },

  // Troubleshooting Guide
  {
    id: 'nova-network-troubleshooting',
    content: `
# Network Connectivity Troubleshooting

## Common Network Issues

### Issue: Cannot Connect to Nova Server
**Symptoms:**
- Application shows connection timeout
- Web interface not loading
- API calls failing

**Resolution Steps:**
1. Verify network connectivity
   - Ping the Nova server IP
   - Check DNS resolution
   - Test telnet to server ports (80, 443, 8080)

2. Check firewall rules
   - Ensure ports 80, 443, 8080 are open
   - Verify Windows Firewall exceptions
   - Check network firewalls and routers

3. Validate Nova services
   - Check Nova Web Service status
   - Verify IIS application pool
   - Review Nova service logs

### Issue: Slow Response Times
**Symptoms:**
- Pages load slowly
- Timeouts on large operations
- User complaints about performance

**Resolution Steps:**
1. Check network bandwidth
2. Monitor server resources (CPU, RAM, disk)
3. Review database performance
4. Analyze Nova performance logs

### Advanced Diagnostics
Use these tools for deeper investigation:
- Network packet capture with Wireshark
- Performance Monitor (PerfMon)
- SQL Server Profiler
- Nova diagnostic tools
    `,
    metadata: {
      type: 'knowledge_article',
      source: 'nova_knowledge_base',
      category: 'networking',
      tags: ['network', 'troubleshooting', 'connectivity', 'performance'],
      classification: 'internal',
      department: 'Technical Support',
      author: 'Support Team',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-09-01'),
    }
  },

  // Sample Ticket Data
  {
    id: 'ticket-12345',
    content: `
Ticket #12345 - Printer Connectivity Issue

**Reporter:** John Doe (john.doe@company.com)
**Department:** Marketing
**Priority:** Medium
**Status:** Resolved

**Issue Description:**
User reported that the office printer (HP LaserJet Pro 4050n) is not responding to print requests. Documents are stuck in the print queue and the printer shows offline status in Windows.

**Troubleshooting Performed:**
1. Checked physical connections - network cable secure
2. Verified printer IP configuration (192.168.1.150)
3. Tested network connectivity with ping - successful
4. Restarted print spooler service on user's computer
5. Removed and reinstalled printer driver
6. Cleared print queue of stuck jobs

**Resolution:**
The issue was caused by outdated printer drivers conflicting with Windows updates. After installing the latest driver package from HP's website and restarting the print spooler service, the printer is now functioning normally.

**Follow-up Actions:**
- Scheduled quarterly printer maintenance
- Added printer monitoring to Nova dashboard
- Updated printer driver installation procedures

**Time to Resolution:** 45 minutes
**Customer Satisfaction:** 5/5 stars
    `,
    metadata: {
      type: 'ticket',
      source: 'nova_tickets',
      category: 'hardware',
      subcategory: 'printer',
      tags: ['printer', 'hardware', 'resolved', 'driver'],
      classification: 'internal',
      priority: 'medium',
      status: 'resolved',
      assignedTo: 'Technical Support',
      reporter: 'john.doe@company.com',
      department: 'Marketing',
      createdAt: new Date('2024-08-20'),
      updatedAt: new Date('2024-08-20'),
      resolutionTime: 45,
    }
  },

  // Service Catalog
  {
    id: 'service-software-request',
    content: `
# Software Installation Request Service

## Service Description
Request installation of approved business software on your workstation or laptop.

## What's Included
- Software compatibility assessment
- Installation and configuration
- Initial user training
- License management
- Post-installation support

## Prerequisites
- Manager approval for paid software
- Compatible hardware requirements
- Available license (if applicable)
- User must be logged into target device

## Request Process
1. Submit request through Nova portal
2. Specify software name and version
3. Provide business justification
4. Select target device(s)
5. Choose installation timeframe

## Standard Software Available
- Microsoft Office Suite
- Adobe Acrobat Reader
- Web browsers (Chrome, Firefox, Edge)
- Antivirus software
- VPN client
- Development tools (with approval)

## Service Level Agreement
- Standard requests: 2 business days
- Urgent requests: 4 hours
- Complex installations: 5 business days

## Costs
- Standard business software: No charge
- Specialized software: Cost varies by license
- Training sessions: $50/hour

## Support
After installation, users receive:
- Quick start guide
- Link to online documentation
- 30 days of installation support
    `,
    metadata: {
      type: 'service_item',
      source: 'nova_service_catalog',
      category: 'software',
      tags: ['software', 'installation', 'request', 'service'],
      classification: 'public',
      department: 'IT Services',
      author: 'Service Catalog Team',
      slaHours: 48,
      cost: 0,
      approvalRequired: true,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-08-10'),
    }
  },

  // Monitoring Alert Documentation
  {
    id: 'nova-monitoring-alerts',
    content: `
# Nova Monitoring System Alerts

## Critical Alerts

### Database Connection Failure
**Alert ID:** DB_CONNECTION_FAIL
**Severity:** Critical
**Description:** Nova cannot establish connection to the primary database

**Immediate Actions:**
1. Check database server status
2. Verify network connectivity
3. Validate connection string configuration
4. Review database server logs
5. Contact DBA team if database issues detected

**Escalation:** Page on-call engineer immediately

### Service Unavailable
**Alert ID:** SERVICE_DOWN
**Severity:** Critical
**Description:** Nova web services are not responding

**Immediate Actions:**
1. Check IIS application pool status
2. Restart Nova services if needed
3. Verify server resources (CPU, memory, disk)
4. Check for recent deployments or changes
5. Review application logs

## Warning Alerts

### High Memory Usage
**Alert ID:** HIGH_MEMORY
**Severity:** Warning
**Threshold:** >85% memory utilization

**Actions:**
1. Identify memory-consuming processes
2. Check for memory leaks
3. Consider restarting services during maintenance window
4. Plan for hardware upgrade if persistent

### Slow Response Time
**Alert ID:** SLOW_RESPONSE
**Severity:** Warning
**Threshold:** >5 seconds average response time

**Actions:**
1. Check database performance
2. Monitor server resources
3. Review recent changes
4. Consider performance tuning

## Alert Configuration
All alerts are configured in Nova monitoring dashboard with:
- Thresholds and conditions
- Notification channels (email, SMS, Slack)
- Escalation rules
- Acknowledgment requirements
    `,
    metadata: {
      type: 'documentation',
      source: 'nova_monitoring',
      category: 'alerts',
      tags: ['monitoring', 'alerts', 'critical', 'troubleshooting'],
      classification: 'internal',
      department: 'IT Operations',
      author: 'Monitoring Team',
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-09-01'),
    }
  },

  // User Management
  {
    id: 'nova-user-management',
    content: `
# User Management in Nova Help Desk

## User Roles and Permissions

### Administrator
**Permissions:**
- Full system access
- User management
- Configuration changes
- System monitoring
- Report generation
- Backup/restore operations

### Technician
**Permissions:**
- View and manage assigned tickets
- Access knowledge base
- Update ticket status
- Add internal notes
- View customer information

### End User
**Permissions:**
- Submit new tickets
- View own ticket history
- Update personal profile
- Access self-service portal
- Rate support interactions

## User Account Management

### Creating New Users
1. Navigate to Admin → User Management
2. Click "Add New User"
3. Fill required information:
   - Username
   - Email address
   - Full name
   - Department
   - Role assignment
4. Set initial password
5. Configure notification preferences

### Password Policies
- Minimum 8 characters
- Must include uppercase, lowercase, number
- Password expires every 90 days
- Cannot reuse last 5 passwords
- Account locks after 5 failed attempts

### User Deactivation Process
1. Disable user account immediately
2. Transfer open tickets to another technician
3. Archive user's work and notes
4. Remove from distribution lists
5. Update documentation

## LDAP/Active Directory Integration
Nova supports integration with enterprise directory services:
- Automatic user provisioning
- Single sign-on (SSO)
- Role mapping based on AD groups
- Synchronized user information
    `,
    metadata: {
      type: 'documentation',
      source: 'nova_documentation',
      category: 'administration',
      tags: ['users', 'permissions', 'roles', 'security'],
      classification: 'internal',
      department: 'IT Administration',
      author: 'Admin Team',
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-08-25'),
    }
  },

  // Historical Incident Data
  {
    id: 'incident-email-outage',
    content: `
# Major Incident Report - Email System Outage

**Incident ID:** INC-2024-045
**Date:** August 10, 2024
**Duration:** 3 hours 45 minutes
**Severity:** High
**Impact:** Company-wide email outage

## Incident Summary
Complete loss of email services affecting all 850+ employees across all locations. Users unable to send or receive emails through Outlook, webmail, or mobile devices.

## Timeline
- **09:15 AM:** First reports of email issues from users
- **09:30 AM:** Incident declared, war room established
- **09:45 AM:** Email server unresponsive, suspected hardware failure
- **10:00 AM:** Decision made to failover to DR system
- **11:30 AM:** DR system online, testing connectivity
- **12:15 PM:** Partial service restored, limited functionality
- **01:00 PM:** Full service restoration confirmed

## Root Cause
Primary email server experienced storage array failure due to multiple disk failures in RAID configuration. The backup system was not configured for automatic failover.

## Resolution Actions
1. Replaced failed storage array
2. Restored email database from backup
3. Updated failover procedures
4. Implemented automated monitoring

## Post-Incident Actions
- Enhanced monitoring of storage systems
- Implemented automated DR failover
- Updated incident response procedures
- Staff training on new processes
- Regular DR testing scheduled

## Lessons Learned
- Automated failover is critical for email systems
- Multiple disk failures can occur simultaneously
- Communication during incidents needs improvement
- DR procedures require regular testing

## Prevention Measures
- Upgraded to more robust RAID configuration
- Implemented predictive disk failure monitoring
- Automated backup verification
- Enhanced redundancy in email infrastructure
    `,
    metadata: {
      type: 'documentation',
      source: 'nova_historical_data',
      category: 'incident',
      subcategory: 'post-mortem',
      tags: ['incident', 'email', 'outage', 'hardware'],
      classification: 'internal',
      severity: 'high',
      impact: 'company-wide',
      duration: 225, // minutes
      affectedUsers: 850,
      department: 'IT Operations',
      author: 'Incident Response Team',
      createdAt: new Date('2024-08-10'),
      updatedAt: new Date('2024-08-15'),
    }
  }
];

async function initializeRAGSystem() {
  try {
    console.log('🚀 Initializing Nova RAG System...');
    
    // Initialize the RAG engine
    console.log('📚 Starting RAG engine initialization...');
    await ragEngine.initialize();
    console.log('✅ RAG engine initialized successfully');

    // Initialize the local embedding model
    console.log('🧠 Initializing local embedding model...');
    await localEmbeddingModel.initialize();
    
    // Train the embedding model on our sample corpus
    const trainingTexts = sampleDocuments.map(doc => doc.content);
    await localEmbeddingModel.trainOnCorpus(trainingTexts);
    console.log('✅ Local embedding model initialized and trained');

    // Add sample documents to the RAG system
    console.log('📄 Adding sample documents to RAG system...');
    await ragEngine.addDocuments(sampleDocuments, {
      userId: 'system-init',
      tenantId: 'nova-demo',
      departmentId: 'IT',
      securityClassification: 'internal',
    });
    console.log(`✅ Added ${sampleDocuments.length} sample documents`);

    // Wait for processing to complete
    console.log('⏳ Processing embeddings...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test the system with sample queries
    console.log('🔍 Testing RAG system with sample queries...');
    
    const testQueries = [
      'How to install Nova on Windows?',
      'Network connectivity troubleshooting steps',
      'Printer not working solutions',
      'Software installation request process',
      'Email outage incident response'
    ];

    for (const queryText of testQueries) {
      console.log(`\n🔎 Testing query: "${queryText}"`);
      
      const result = await ragEngine.query({
        query: queryText,
        context: {
          userId: 'demo-user',
          tenantId: 'nova-demo',
          module: 'initialization'
        },
        options: {
          maxResults: 3,
          hybridSearch: true,
          rerank: true,
          enforceRBAC: false,
        },
        metadata: {}
      });

      console.log(`   📊 Found ${result.chunks.length} relevant chunks`);
      console.log(`   🎯 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`   ⚡ Retrieval time: ${result.retrievalTime}ms`);
      
      if (result.chunks.length > 0) {
        const topChunk = result.chunks[0];
        const preview = topChunk.content.substring(0, 150).replace(/\s+/g, ' ').trim();
        console.log(`   📝 Top result: "${preview}..."`);
        console.log(`   🏷️  Source: ${topChunk.metadata.source}`);
        console.log(`   📋 Type: ${topChunk.metadata.type}`);
        console.log(`   📈 Relevance: ${(topChunk.metadata.relevanceScore * 100).toFixed(1)}%`);
      }
    }

    // Display system statistics
    console.log('\n📈 RAG System Statistics:');
    const stats = ragEngine.getStats();
    console.log(`   📚 Total document chunks: ${stats.totalChunks}`);
    console.log(`   🔍 Total queries processed: ${stats.totalQueries}`);
    console.log(`   🧠 Embedding models: ${stats.embeddingModels.length}`);
    console.log(`   🗄️  Vector stores: ${stats.vectorStores.length}`);
    console.log(`   🎯 Knowledge graph entities: ${stats.knowledgeGraph.entities}`);
    
    const modelInfo = localEmbeddingModel.getModelInfo();
    console.log(`   💾 Embedding cache size: ${modelInfo.cacheSize}`);
    console.log(`   🔢 Embedding dimensions: ${modelInfo.dimensions}`);

    console.log('\n🎉 RAG System initialization completed successfully!');
    console.log('\n📖 You can now use the RAG system through:');
    console.log('   • API endpoints: POST /api/ai-fabric/rag/query');
    console.log('   • Add documents: POST /api/ai-fabric/rag/documents');
    console.log('   • System status: GET /api/ai-fabric/status');

  } catch (error) {
    console.error('❌ RAG system initialization failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Check if this script is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeRAGSystem()
    .then(() => {
      console.log('\n🏁 Initialization script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Initialization script failed:', error);
      process.exit(1);
    });
}

export { initializeRAGSystem, sampleDocuments };