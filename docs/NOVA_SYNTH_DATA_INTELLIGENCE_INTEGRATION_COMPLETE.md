# Nova Synth Data Intelligence Integration

## Overview

Nova Synth has been properly integrated into the Nova Integration Layer (NIL) as a **Data Intelligence Engine** for intelligent data matching, transformation, and profile correlation. This integration addresses the core need for AI-powered data operations in the User 360 system.

## Architecture

### Connector Type: DATA_INTELLIGENCE

Nova Synth is now configured as a `DATA_INTELLIGENCE` connector rather than an `AI_PLATFORM` connector, which better reflects its role in data operations.

```javascript
export class NovaSynthConnector extends IConnector {
  constructor() {
    super(
      'nova-synth-connector',
      'Nova Synth Data Intelligence Engine',
      '1.0.0',
      ConnectorType.DATA_INTELLIGENCE,
    );
  }
}
```

## Key Integration Points

### 1. User Profile Aggregation

Nova Synth is integrated into the User 360 profile aggregation process:

- **Data Normalization**: Attributes from different systems are normalized using Nova Synth before merging
- **Profile Validation**: Final profiles are validated for completeness and quality
- **Deduplication**: Duplicate entries (devices, apps, etc.) are intelligently deduplicated

```javascript
// In getUserProfile method:
const normalizedData = await this.normalizeUserAttributesWithSynth(connectorData, connector.type);

const validationResult = await this.validateProfileWithSynth(profile);
profile.devices = await this.deduplicateProfileDataWithSynth(profile.devices);
```

### 2. Profile Merging

Nova Synth provides intelligent profile merging capabilities:

- **Confidence Scoring**: Calculates confidence scores for profile merges
- **Intelligent Strategy**: New "intelligent" merge strategy using Nova Synth AI
- **Conflict Resolution**: Handles data conflicts intelligently

```javascript
// Enhanced merge strategies:
case 'intelligent':
  const synthResult = await this.mergeProfilesWithSynth(primaryProfile, secondaryProfile);
  mergedData = synthResult || this.mergeProfileData(primaryProfile, secondaryProfile);
  break;
```

### 3. Data Transformation

Automatic data transformation during connector data ingestion:

```javascript
// In mergeConnectorData method:
this.transformDataWithSynth(data, connectorId)
  .then((transformedData) => {
    data = transformedData;
  })
  .catch((error) => {
    // Graceful fallback to original data
  });
```

## Nova Synth Capabilities

### Data Types Supported

- `profile_matching` - Match user profiles across systems
- `data_transformation` - Transform data between formats
- `entity_correlation` - Correlate related entities
- `profile_deduplication` - Remove duplicate profiles/data
- `attribute_normalization` - Normalize attributes to standard formats
- `confidence_scoring` - Calculate confidence for data operations

### Actions Available

- `match_profiles` - Find matching profiles
- `transform_data` - Apply transformation rules
- `correlate_entities` - Find entity relationships
- `merge_profiles` - Intelligently merge profiles
- `deduplicate_data` - Remove duplicates
- `validate_profile` - Validate profile completeness
- `normalize_attributes` - Normalize attribute formats
- `calculate_confidence` - Calculate operation confidence

## Configuration Rules

### Transformation Rules by Connector

```javascript
const rules = {
  'okta-connector': [
    { field: 'firstName', target: 'profile.givenName' },
    { field: 'lastName', target: 'profile.familyName' },
    { field: 'email', target: 'profile.email', normalize: true },
  ],
  'jamf-connector': [
    { field: 'deviceName', target: 'device.hostname' },
    { field: 'serialNumber', target: 'device.serialNumber' },
    { field: 'osVersion', target: 'device.osVersion', format: 'version' },
  ],
  'crowdstrike-connector': [
    { field: 'hostname', target: 'device.hostname' },
    { field: 'agentVersion', target: 'security.agentVersion' },
    { field: 'lastSeen', target: 'device.lastActivity', format: 'date' },
  ],
};
```

### Normalization Rules by System Type

```javascript
const rules = {
  IDENTITY_PROVIDER: {
    name: { case: 'title', trim: true },
    email: { case: 'lower', validate: 'email' },
    department: { case: 'title', normalize: 'department_codes' },
  },
  DEVICE_MANAGEMENT: {
    hostname: { case: 'lower', trim: true },
    osVersion: { format: 'semantic_version' },
    serialNumber: { case: 'upper', trim: true },
  },
  SECURITY_PLATFORM: {
    riskScore: { range: [0, 100], normalize: 'score' },
    severity: { map: 'severity_levels' },
  },
};
```

## API Integration

### Nova Synth Data Intelligence API Endpoints

```
Base URL: http://localhost:3000/api/v2/data-intelligence

- GET  /health              - Health check
- POST /matching/profiles   - Match user profiles
- POST /transformation/apply - Apply data transformations
- POST /correlation/analyze - Analyze entity correlations
- POST /profiles/merge      - Merge profiles intelligently
- POST /deduplication/analyze - Deduplicate data
- POST /validation/profile  - Validate profile completeness
- POST /normalization/attributes - Normalize attributes
- POST /confidence/calculate - Calculate confidence scores
```

## Fallback Mechanisms

Nova Synth integration includes graceful fallback mechanisms:

1. **Service Unavailable**: Falls back to standard data operations
2. **API Timeout**: Uses cached transformation rules
3. **Authentication Failure**: Continues with original data
4. **Partial Failure**: Logs warnings but continues processing

```javascript
try {
  const transformedData = await this.transformDataWithSynth(data, connectorId);
  return transformedData;
} catch (error) {
  console.warn(`Nova Synth transformation failed:`, error.message);
  return data; // Graceful fallback
}
```

## Usage Examples

### 1. Profile Matching

```javascript
const matchResult = await nil.matchUserProfilesWithSynth(sourceProfile, candidateProfiles);
if (matchResult && matchResult.matches.length > 0) {
  console.log(`Found ${matchResult.matches.length} potential matches`);
  console.log(
    `Best match: ${matchResult.bestMatch.targetId} (confidence: ${matchResult.bestMatch.confidence})`,
  );
}
```

### 2. Intelligent Profile Merging

```javascript
const mergeResult = await nil.mergeUserProfiles(primaryUserId, secondaryUserId, {
  strategy: 'intelligent', // Uses Nova Synth
  mergedBy: 'admin@example.com',
  reason: 'Duplicate account detected',
});
```

### 3. Data Transformation

```javascript
const transformedData = await nil.transformDataWithSynth(rawData, 'okta-connector');
// Data is automatically normalized to Nova standard format
```

## Monitoring and Metrics

Nova Synth integration provides comprehensive metrics:

- **API Latency**: Response times for data operations
- **Transformation Success Rate**: Percentage of successful transformations
- **Matching Accuracy**: Quality of profile matches
- **Confidence Scores**: Average confidence for operations
- **Cache Hit Rate**: Efficiency of transformation rule caching

## Production Deployment

### Prerequisites

1. **Nova Synth Service**: Deploy Nova Synth Data Intelligence API
2. **Authentication**: Configure API tokens and authentication
3. **Training Data**: Provide organization-specific data patterns
4. **Monitoring**: Set up monitoring for data quality metrics

### Configuration

```javascript
await nil.registerConnector({
  id: 'nova-synth-data-intelligence',
  name: 'Nova Synth Data Intelligence Engine',
  type: 'DATA_INTELLIGENCE',
  credentials: {
    apiToken: process.env.NOVA_SYNTH_API_TOKEN,
  },
  endpoints: {
    synthUrl: process.env.NOVA_SYNTH_API_URL || 'http://localhost:3000/api/v2/data-intelligence',
  },
  config: {
    timeout: 30000,
    enableTransformation: true,
    enableMatching: true,
    enableDeduplication: true,
  },
});
```

## Benefits

1. **Intelligent Data Matching**: AI-powered profile correlation across systems
2. **Automatic Data Transformation**: Seamless data format conversion
3. **Quality Assurance**: Automated profile validation and scoring
4. **Deduplication**: Intelligent removal of duplicate entries
5. **Graceful Degradation**: Continues working even if Nova Synth is unavailable
6. **Extensible Rules**: Easy to add new transformation and normalization rules

## Testing

Run the comprehensive integration test:

```bash
node test-nova-synth-integration.js
```

This test verifies:

- ✅ DATA_INTELLIGENCE connector type registration
- ✅ All integration methods are available
- ✅ Transformation and normalization rules are configured
- ✅ Nova Synth connector capabilities and schema
- ✅ Mock data operations with graceful fallbacks

## Conclusion

Nova Synth is now properly integrated as a Data Intelligence Engine that enhances the Nova Integration Layer with AI-powered data matching, transformation, and correlation capabilities. The integration provides intelligent data operations while maintaining robust fallback mechanisms for production reliability.
