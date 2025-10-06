# Enhanced SLA Management System

## Overview

Nova Universe now includes an industry-standard SLA management system following ServiceNow and ITIL best practices. The system uses an **Impact vs Urgency matrix** to automatically calculate priority levels and assign appropriate SLA policies.

## Key Features

### 🎯 Impact vs Urgency Matrix
- **3x3 matrix** calculation (High/Medium/Low Impact × High/Medium/Low Urgency)
- **Automatic priority assignment**: Critical, High, Medium, Low
- **ServiceNow-compatible** priority calculation

### 🚀 Intelligent Analysis
- **Impact Detection**: Analyzes ticket content, affected users, business service criticality
- **Urgency Detection**: Considers keywords, VIP status, due dates, business hours
- **Content Parsing**: Recognizes critical keywords and situations

### 👑 VIP Escalation Policies
- **Executive VIP**: 2-30 minute response times
- **Gold VIP**: 5-120 minute response times  
- **Silver VIP**: 15-480 minute response times
- **Automatic urgency boost** for VIP users

### 📊 Standard SLA Templates
- **Standard Users**: 15min-8hr response times
- **VIP Users**: 5min-2hr response times
- **Executive Users**: 2min-30min response times
- **Customizable policies** per organization

## Usage Examples

### Basic SLA Calculation

```javascript
import { SLAMatrixService } from './services/sla-matrix.service.js';

// Calculate SLA for a ticket
const ticketData = {
  title: 'Critical server outage',
  description: 'Production server is down affecting all users',
  affectedUsers: 200,
  userId: 'user-123',
  isVip: false
};

const slaResult = SLAMatrixService.calculateTicketSLA(ticketData);
console.log(slaResult);
```

**Output:**
```json
{
  "impact": 1,
  "impactLabel": "High",
  "urgency": 1,
  "urgencyLabel": "High", 
  "priority": 1,
  "priorityLabel": "Critical",
  "userType": "standard",
  "slaPolicy": {
    "responseTime": 15,
    "resolutionTime": 240,
    "escalationTime": 30,
    "escalationLevel": "manager"
  },
  "targets": {
    "response": "2025-01-01T10:15:00Z",
    "resolution": "2025-01-01T14:00:00Z",
    "escalation": "2025-01-01T10:30:00Z"
  }
}
```

### VIP User SLA Calculation

```javascript
const vipTicketData = {
  title: 'Email access issue',
  description: 'Cannot access email account',
  userId: 'exec-user-456',
  isVip: true,
  vipLevel: 'executive'
};

const vipSLA = SLAMatrixService.calculateTicketSLA(vipTicketData);
// Result: Executive gets 2-minute response time even for low impact issues
```

### API Usage

#### Calculate SLA for a Ticket
```bash
POST /api/sla/calculate
Content-Type: application/json

{
  "title": "Application performance issue",
  "description": "Users reporting slow response times",
  "affectedUsers": 50,
  "isVip": true,
  "vipLevel": "gold"
}
```

#### Get SLA Recommendations
```bash
POST /api/sla/recommendations
Content-Type: application/json

{
  "title": "Password reset request",
  "description": "User needs password reset",
  "userId": "user-789"
}
```

#### View Priority Matrix
```bash
GET /api/sla/matrix
```

## Priority Matrix

| Impact/Urgency | High (1) | Medium (2) | Low (3) |
|----------------|----------|------------|---------|
| **High (1)**   | Critical (1) | High (2) | Medium (3) |
| **Medium (2)** | High (2) | Medium (3) | Low (4) |
| **Low (3)**    | Medium (3) | Low (4) | Low (4) |

## SLA Policy Templates

### Standard User Policies
| Priority | Response Time | Resolution Time | Escalation Time | Escalation Level |
|----------|---------------|-----------------|-----------------|------------------|
| Critical | 15 minutes    | 4 hours         | 30 minutes      | Manager          |
| High     | 1 hour        | 8 hours         | 2 hours         | Supervisor       |
| Medium   | 4 hours       | 24 hours        | 8 hours         | Team Lead        |
| Low      | 8 hours       | 48 hours        | 24 hours        | Queue            |

### VIP User Policies  
| Priority | Response Time | Resolution Time | Escalation Time | Escalation Level |
|----------|---------------|-----------------|-----------------|------------------|
| Critical | 5 minutes     | 1 hour          | 10 minutes      | Director         |
| High     | 15 minutes    | 2 hours         | 30 minutes      | Manager          |
| Medium   | 1 hour        | 4 hours         | 2 hours         | Supervisor       |
| Low      | 2 hours       | 8 hours         | 4 hours         | Team Lead        |

### Executive VIP Policies
| Priority | Response Time | Resolution Time | Escalation Time | Escalation Level |
|----------|---------------|-----------------|-----------------|------------------|
| Critical | 2 minutes     | 30 minutes      | 5 minutes       | C-Level          |
| High     | 5 minutes     | 1 hour          | 10 minutes      | Director         |
| Medium   | 15 minutes    | 2 hours         | 30 minutes      | Manager          |
| Low      | 30 minutes    | 4 hours         | 1 hour          | Supervisor       |

## Impact Analysis Factors

### High Impact Indicators
- Keywords: `outage`, `down`, `critical`, `emergency`, `production`, `security breach`
- Affected users > 100
- Critical business service affected
- Explicit severity = "critical"

### Medium Impact Indicators  
- Keywords: `slow`, `performance`, `error`, `not working`, `timeout`
- Affected users 10-100
- High criticality business service
- Explicit severity = "medium" or "high"

### Low Impact Indicators
- Routine requests (password reset, access requests)
- Single user affected
- No critical keywords
- Non-critical business services

## Urgency Analysis Factors

### High Urgency Indicators
- Keywords: `urgent`, `asap`, `immediately`, `deadline`, `meeting`, `client`
- Executive VIP users (automatic boost)
- Due date within 4 hours
- Past due items

### Medium Urgency Indicators
- Gold/Silver VIP users  
- Due date within 24 hours
- Business hours requests

### Low Urgency Indicators
- No urgency keywords
- No VIP status
- Far future due dates
- Outside business hours (reduces urgency for non-VIPs)

## Configuration

### Custom Matrix Configuration
```javascript
const customMatrix = {
  matrix: {
    "1,1": 1, "1,2": 2, "1,3": 3,
    "2,1": 2, "2,2": 3, "2,3": 4,
    "3,1": 3, "3,2": 4, "3,3": 4
  },
  impactLevels: { 1: "High", 2: "Medium", 3: "Low" },
  urgencyLevels: { 1: "High", 2: "Medium", 3: "Low" },
  priorityLevels: { 1: "Critical", 2: "High", 3: "Medium", 4: "Low" }
};

// Validate custom matrix
const isValid = SLAMatrixService.validateMatrix(customMatrix);
```

### Custom SLA Template
```javascript
const customTemplate = {
  name: "Custom SLA Policy",
  description: "Organization-specific SLA policy",
  policies: {
    1: { responseTime: 10, resolutionTime: 60, escalationTime: 20, escalationLevel: "senior_manager" },
    2: { responseTime: 30, resolutionTime: 240, escalationTime: 60, escalationLevel: "manager" },
    3: { responseTime: 120, resolutionTime: 480, escalationTime: 240, escalationLevel: "supervisor" },
    4: { responseTime: 240, resolutionTime: 1440, escalationTime: 480, escalationLevel: "team_lead" }
  }
};

// Validate custom template
const isValid = SLAMatrixService.validateSLATemplate(customTemplate);
```

## Integration with Existing Systems

### Nova Custom Models Integration
The enhanced SLA system is integrated with Nova's AI models for priority scoring:

```javascript
// The nova-custom-models.ts now uses the SLA matrix for priority calculation
const slaCalculation = SLAMatrixService.calculateTicketSLA(ticket);
const prediction = {
  priority: slaCalculation.priorityLabel.toLowerCase(),
  matrix_priority: slaCalculation.priority,
  impact: slaCalculation.impactLabel.toLowerCase(),
  urgency: slaCalculation.urgencyLabel.toLowerCase(),
  sla_policy: slaCalculation.slaPolicy,
  enhanced_sla: {
    response_time_minutes: slaCalculation.slaPolicy.responseTime,
    resolution_time_minutes: slaCalculation.slaPolicy.resolutionTime,
    escalation_time_minutes: slaCalculation.slaPolicy.escalationTime,
    escalation_level: slaCalculation.slaPolicy.escalationLevel
  }
};
```

### VIP System Integration
The system seamlessly integrates with Nova's existing VIP management:

- Reads VIP status from user profiles
- Applies appropriate urgency boosts
- Uses VIP-specific SLA templates
- Maintains backward compatibility

## Testing

The system includes comprehensive tests covering:
- Priority matrix calculations (9 combinations)
- Impact analysis (keywords, affected users, business services)
- Urgency analysis (VIP status, due dates, business hours)
- SLA policy selection
- Edge cases and error handling

Run tests with:
```bash
cd apps/api
NODE_OPTIONS=--experimental-vm-modules node --test test/sla-matrix.test.js
```

## Migration from Legacy System

The enhanced SLA system maintains backward compatibility:

1. **Existing SLA definitions** continue to work
2. **Legacy priority calculations** fall back automatically if matrix calculation fails
3. **VIP users** get enhanced policies automatically
4. **API responses** include both legacy and enhanced data

### Gradual Migration Strategy
1. Deploy enhanced system alongside existing system
2. Test with subset of tickets
3. Monitor SLA compliance improvements  
4. Gradually migrate all ticket types
5. Deprecate legacy calculations

## Benefits

### For IT Teams
- **Consistent prioritization** following industry standards
- **Automated SLA assignment** reduces manual effort
- **Clear escalation paths** improve response times
- **VIP handling** ensures executive satisfaction

### For Business Users
- **Faster response times** for critical issues
- **Predictable service levels** based on impact/urgency
- **VIP treatment** for important users
- **Transparent process** with clear expectations

### For Management
- **SLA compliance tracking** with detailed metrics
- **Industry-standard practices** align with ITIL/ServiceNow
- **Customizable policies** meet organizational needs
- **Executive reporting** on service quality

## Next Steps

1. **Admin UI Development**: Create management interface for SLA policies
2. **Reporting Dashboard**: Build comprehensive SLA analytics
3. **Integration Testing**: Validate with existing Nova modules
4. **Performance Optimization**: Monitor calculation performance at scale
5. **Custom Matrix UI**: Allow admins to configure custom matrices