# Technical Debt & Issues Tracker
**Generated:** November 27, 2025  
**Related:** COMPREHENSIVE-CODE-ANALYSIS.md

This document tracks specific technical debt items and issues identified in the codebase analysis. Items should be converted to GitHub issues and scheduled for resolution.

---

## 🔴 Critical Priority (Security & Stability)

### 1. Authentication Guard Implementation Incomplete
**Package:** `packages/@sbf/api/src/guards/auth.guard.ts`  
**Severity:** CRITICAL  
**Security Impact:** HIGH

**Description:**
The authentication guard contains TODO comments for critical security functionality:
- JWT token validation not implemented
- User loading from database not implemented
- Overall JWT validation logic missing

**Code Location:**
```typescript
// packages/@sbf/api/src/guards/auth.guard.ts
// TODO: Validate JWT token
// TODO: Load user from database
// TODO: Implement JWT validation
```

**Action Required:**
1. Implement JWT validation using established library (e.g., jsonwebtoken, Passport.js)
2. Add user lookup from database
3. Implement proper error handling for invalid tokens
4. Add comprehensive unit tests for auth guard
5. Add integration tests for protected routes

**Estimated Effort:** 6-8 hours  
**Owner:** Backend Security Team

---

### 2. Tenant Service Repository Implementation Missing
**Package:** `packages/@sbf/api/src/services/tenant.service.ts`  
**Severity:** HIGH  
**Impact:** Core functionality incomplete

**Description:**
The tenant service has 15+ TODO comments indicating unimplemented repository methods:
- Database integration not connected
- All CRUD operations return mock data
- Export service not implemented

**Code Locations:**
```typescript
// TODO: Inject repositories
// TODO: Implement with actual repository (repeated 14 times)
// TODO: Save to database
// TODO: Implement with actual export service
```

**Action Required:**
1. Inject actual repository dependencies
2. Implement database operations for all CRUD methods
3. Add transaction support for multi-step operations
4. Implement export service
5. Add comprehensive tests

**Estimated Effort:** 12-16 hours  
**Owner:** Backend API Team

---

## 🟡 High Priority (Code Quality & Maintainability)

### 3. Replace Console Logging with Proper Logger
**Packages:** Multiple (259 instances found)  
**Severity:** MEDIUM  
**Impact:** Production logging quality, debugging difficulty

**Description:**
259 instances of `console.log`, `console.error`, `console.warn` found across the codebase. The project has `@sbf/logging` package but it's not consistently used.

**Examples:**
- Desktop components: 50+ instances
- API services: 30+ instances
- Core packages: 40+ instances
- Framework packages: 30+ instances

**Action Required:**
1. Create logging standards document
2. Replace console.* with @sbf/logging service calls
3. Implement log levels (debug, info, warn, error)
4. Add structured logging support (JSON format)
5. Configure log output for different environments
6. Add pre-commit hook to prevent console.* in production code

**Estimated Effort:** 16-20 hours  
**Owner:** Infrastructure Team

---

### 4. Enable TypeScript Strict Mode
**File:** `tsconfig.base.json`  
**Severity:** MEDIUM  
**Impact:** Type safety, runtime error prevention

**Description:**
TypeScript strict mode is currently disabled:
```json
{
  "strict": false,
  "noImplicitAny": false,
  "noEmitOnError": false
}
```

**Action Required:**
1. Create migration plan for strict mode enablement
2. Enable strict mode per package incrementally
3. Fix type errors in each package
4. Start with: `noImplicitAny: true`
5. Gradually enable other strict flags
6. Document common type patterns

**Estimated Effort:** 20-30 hours (incremental)  
**Owner:** Dev Team Lead

**Suggested Approach:**
- Phase 1: Enable for new packages only
- Phase 2: Enable for core packages (4 weeks)
- Phase 3: Enable for framework packages (4 weeks)
- Phase 4: Enable for module packages (4 weeks)

---

### 5. Incomplete Desktop UI Action Handlers
**Package:** `packages/@sbf/desktop/src/renderer/components/`  
**Severity:** MEDIUM  
**Impact:** User experience, functionality gaps

**Description:**
Multiple desktop UI components have TODO placeholders for action handlers:

**Examples:**
```typescript
// ProductivityDashboard.ts
alert('Create new note - TODO');
alert('Create new task - TODO');
alert('Open search - TODO');

// AccessControlPanel.ts
// TODO: Implement updateRole API
// TODO: Implement updateUserRoles API

// NotificationCenter.ts
// TODO: Implement notifications settings API
// TODO: Implement desktop notification API
```

**Action Required:**
1. Prioritize UI actions by user importance
2. Implement missing API integrations
3. Replace alert() with proper modals/dialogs
4. Add loading states and error handling
5. Test each action end-to-end

**Estimated Effort:** 12-16 hours  
**Owner:** Desktop App Team

---

## 🟢 Medium Priority (Feature Completion)

### 6. Two-Guardian Approval Workflow
**Package:** `packages/@sbf/api/src/controllers/tenants.controller.ts`  
**Severity:** MEDIUM  
**Impact:** Enterprise security feature

**Description:**
```typescript
// TODO: Implement two-guardian approval workflow
```

**Action Required:**
1. Design two-guardian approval workflow
2. Create approval request entity
3. Implement approval logic
4. Add notification system integration
5. Add audit logging

**Estimated Effort:** 16-20 hours  
**Owner:** Product Team

---

### 7. Subject Entity Creation
**Package:** `packages/@sbf/api/src/controllers/tenants.controller.ts`  
**Severity:** MEDIUM  
**Impact:** Feature completeness

**Description:**
```typescript
// TODO: Implement subject entity creation
```

**Action Required:**
1. Define subject entity schema
2. Implement creation logic
3. Add validation rules
4. Add tests

**Estimated Effort:** 8-10 hours  
**Owner:** Backend API Team

---

### 8. Provenance Documentation
**Package:** `packages/@sbf/api/src/controllers/tenants.controller.ts`  
**Severity:** MEDIUM  
**Impact:** Audit trail completeness

**Description:**
```typescript
// TODO: Implement provenance documentation
```

**Action Required:**
1. Define provenance data structure
2. Implement tracking logic
3. Add to audit system
4. Add retrieval APIs

**Estimated Effort:** 10-12 hours  
**Owner:** Backend API Team

---

### 9. Email Service Implementation
**Package:** `packages/@sbf/api/src/services/email.service.ts`  
**Severity:** MEDIUM  
**Impact:** Email notifications

**Description:**
```typescript
// TODO: Implement with actual email provider (SendGrid, SES, etc.)
// TODO: Implement (multiple methods)
```

**Action Required:**
1. Choose email provider (SendGrid/SES/SMTP)
2. Implement email client wrapper
3. Create email templates
4. Add retry logic
5. Add email queue for reliability
6. Add tests with mocked provider

**Estimated Effort:** 12-16 hours  
**Owner:** Infrastructure Team

---

### 10. Knowledge Graph Relationship Queries
**Package:** `packages/@sbf/desktop/src/renderer/components/dashboard/KnowledgeGraphViz.ts`  
**Severity:** LOW  
**Impact:** Data visualization accuracy

**Description:**
```typescript
// Mock relationships for now (TODO: Use actual relationships API)
```

**Action Required:**
1. Implement relationships API endpoint
2. Update component to fetch real data
3. Add proper loading states
4. Handle large graphs efficiently

**Estimated Effort:** 6-8 hours  
**Owner:** Desktop App Team

---

## 🔵 Low Priority (Nice-to-Have)

### 11. Lifecycle Engine Metrics Tracking
**Package:** `packages/@sbf/core/lifecycle-engine/src/LifecycleAutomationService.ts`  
**Severity:** LOW  
**Impact:** Analytics completeness

**Description:**
```typescript
totalDissolutions: 0, // TODO: Track this
pendingReviews: 0, // TODO: Track this
preventedDissolutions: 0, // TODO: Track this
```

**Action Required:**
1. Implement dissolution tracking
2. Implement review tracking
3. Add prevention metrics
4. Create analytics dashboard

**Estimated Effort:** 6-8 hours  
**Owner:** Analytics Team

---

### 12. Desktop Audit Integration
**Package:** `packages/@sbf/desktop/src/main/ipc-handlers.ts`  
**Severity:** LOW  
**Impact:** Monitoring completeness

**Description:**
```typescript
recentAuditEvents: 0, // TODO: Integrate with audit service
```

**Action Required:**
1. Integrate with audit service API
2. Fetch recent events
3. Display in UI
4. Add real-time updates

**Estimated Effort:** 4-6 hours  
**Owner:** Desktop App Team

---

## 📋 Dependency & Configuration Issues

### 13. Update Major Dependencies
**Severity:** LOW  
**Impact:** Security patches, new features

**Outdated Packages:**
- `@types/node`: 20.19.25 → 24.10.1
- `@types/react`: 18.3.27 → 19.2.7
- `@types/react-dom`: 18.3.7 → 19.2.3

**Action Required:**
1. Test major version updates in dev environment
2. Review breaking changes
3. Update package.json
4. Run full test suite
5. Monitor for regressions

**Estimated Effort:** 4-6 hours  
**Owner:** DevOps Team

---

### 14. Configure pnpm Build Script Permissions
**Severity:** LOW  
**Impact:** Build consistency

**Warning:**
```
Ignored build scripts: bcrypt, electron, esbuild, msgpackr-extract, protobufjs, unrs-resolver.
```

**Action Required:**
1. Run `pnpm approve-builds`
2. Review which packages need build scripts
3. Document approved packages
4. Add to setup documentation

**Estimated Effort:** 1 hour  
**Owner:** DevOps Team

---

## 📊 Testing Gaps

### 15. Add Core Package Tests
**Severity:** HIGH  
**Impact:** Code reliability, regression prevention

**Packages Needing Tests:**
- `@sbf/db-client` - Database layer (CRITICAL)
- `@sbf/vector-client` - Vector DB (CRITICAL)
- `@sbf/memory-engine` - Memory/context (HIGH)
- `@sbf/aei` - AI extraction (HIGH)
- Framework packages missing tests (MEDIUM)
- Module packages (LOW)

**Current Coverage:** ~12% (36 test files / 293 TS files)  
**Target Coverage:** 60%+

**Action Required:**
1. Create test templates for each package type
2. Write unit tests for critical packages first
3. Add integration tests for package interactions
4. Add E2E tests for desktop app
5. Configure coverage reporting in CI

**Estimated Effort:** 40-60 hours total  
**Owner:** QA Team

**Priority Order:**
1. db-client, vector-client (database layer) - 8 hours
2. memory-engine, aei (core features) - 8 hours
3. Authentication & authorization - 6 hours
4. API endpoints - 8 hours
5. Framework packages - 12 hours
6. Module packages - 16 hours

---

## 🔄 Recommended Workflow

### Converting to GitHub Issues

For each item above:

1. **Create GitHub Issue:**
   - Use item title as issue title
   - Copy description, code locations, and action items
   - Add labels: `technical-debt`, `security`, `testing`, etc.
   - Set priority label: `priority: critical`, `priority: high`, etc.
   - Assign to appropriate team/person

2. **Add to Project Board:**
   - Create "Technical Debt" project board
   - Organize by priority columns
   - Track progress weekly

3. **Schedule in Sprints:**
   - Critical items: Current sprint
   - High items: Next 2 sprints
   - Medium items: Next quarter
   - Low items: Backlog

4. **Track Completion:**
   - Update this document when issues are closed
   - Archive completed items
   - Review remaining items monthly

---

## 📈 Progress Tracking

### Sprint Planning Template

**Sprint 1 (Week 1-2):**
- [ ] #1: Auth Guard Implementation
- [ ] #2: Tenant Service Implementation
- [ ] #13: Dependency Updates

**Sprint 2 (Week 3-4):**
- [ ] #3: Replace Console Logging
- [ ] #15: Add Core Package Tests (Phase 1)

**Sprint 3 (Week 5-6):**
- [ ] #4: TypeScript Strict Mode (Phase 1)
- [ ] #5: Desktop UI Action Handlers
- [ ] #15: Add Core Package Tests (Phase 2)

---

## 🎯 Success Metrics

Track these metrics monthly:

- **TODO Count:** Start: 50+ → Target: 25 (50% reduction)
- **Console.* Count:** Start: 259 → Target: 0
- **Test Coverage:** Start: 12% → Target: 60%
- **TypeScript Errors:** Maintain: 0
- **Security Issues:** Maintain: 0
- **Critical TODOs:** Start: 5 → Target: 0

---

**Last Updated:** November 27, 2025  
**Next Review:** December 27, 2025  
**Owner:** Technical Lead
