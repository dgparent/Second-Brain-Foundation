# @sbf/core/privacy

Privacy Enforcement Layer for Second Brain Foundation

## Features

- **Privacy Level Management**: Control what data AI can access
- **Content Filtering**: Filter sensitive content before AI processing
- **AI Provider Selection**: Route content to appropriate AI providers based on privacy
- **Audit Trail**: Track all AI access to user data
- **Privacy Violation Detection**: Detect and prevent privacy violations

## Privacy Levels

1. **Public** (0) - Can be shared with any AI provider
2. **Personal** (1) - Local AI only or trusted providers
3. **Private** (2) - Local AI only
4. **Confidential** (3) - No AI processing allowed

## Usage

```typescript
import { PrivacyService, PrivacyLevel } from '@sbf/core/privacy';

const privacyService = new PrivacyService(auditLogger);

// Set privacy level for an entity
await privacyService.setPrivacyLevel(entityId, PrivacyLevel.Private);

// Filter content before AI processing
const filtered = privacyService.filterContent(content, PrivacyLevel.Personal);

// Check if AI can access content
const canAccess = privacyService.canAIAccess(entity, aiProvider);

// Get audit trail
const audit = await privacyService.getAuditTrail(entityId);
```

## Architecture

- `PrivacyService` - Main service for privacy enforcement
- `PrivacyFilter` - Content filtering engine
- `PrivacyRuleEngine` - Rule-based privacy decisions
- `PrivacyAuditLogger` - Audit trail logging
- `AIProviderPolicy` - AI provider privacy policies
