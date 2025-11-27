# Quick Reference - Truth Hierarchy & Local-First System

**For:** Second Brain Foundation (2BF)  
**Date:** 2025-11-24  

---

## Truth Levels (U1-C5)

```
U1  USER              Highest authority (canonical source)
A2  AUTOMATION        System-generated, deterministic
L3  AI_LOCAL          Local AI model outputs  
LN4 AI_LOCAL_NETWORK  P2P/Local network AI
C5  AI_CLOUD          Cloud AI services (lowest authority)
```

### Key Rule
**U1 > A2 > L3 > LN4 > C5**

Lower truth levels **cannot** overwrite higher truth levels without user acceptance.

---

## Common Workflows

### 1. User Creates Note
```python
vault.create_entity(
    title="My Note",
    content="Content here",
    vault_path="notes/my-note.md",
    truth_level=TruthLevel.USER,  # U1
    origin_source="user:web"
)
```
**Result:** U1 entity, fully protected

### 2. AI Generates Suggestion
```python
vault.create_entity(
    title="AI Summary",
    content="AI generated...",
    vault_path="summaries/ai.md",
    truth_level=TruthLevel.AI_LOCAL,  # L3
    origin_source="ai-local:llama3"
)
```
**Result:** L3 entity, marked as suggestion

### 3. User Accepts AI Suggestion
```python
vault.accept_suggestion(
    vault_path="summaries/ai.md",
    user_id="user-123"
)
```
**Result:** Upgraded to U1, provenance recorded

### 4. Automation Runs
```python
vault.create_entity(
    title="Daily Summary",
    content="Automated summary...",
    vault_path="auto/daily.md",
    truth_level=TruthLevel.AUTOMATION,  # A2
    origin_source="automation:daily-summary"
)
```
**Result:** A2 entity, can be overwritten by U1

---

## Conflict Resolution Rules

### Rule 1: U1 Always Wins
```
U1 (user)  vs  L3 (AI)     → U1 wins
U1 (user)  vs  A2 (auto)   → U1 wins
U1 (user)  vs  C5 (cloud)  → U1 wins
```

### Rule 2: Same Level → Last-Write-Wins
```
U1 (10:00) vs  U1 (10:30)  → 10:30 wins (newer)
L3 (10:00) vs  L3 (10:30)  → 10:30 wins
```

### Rule 3: Accepted Content Protected
```
L3 (accepted) vs L3 (new)  → Accepted wins
A2 (accepted) vs A2 (new)  → Accepted wins
```

### Rule 4: Higher Truth Wins
```
A2 (auto)  vs  L3 (AI)     → A2 wins
L3 (local) vs  C5 (cloud)  → L3 wins
```

---

## API Endpoints

```bash
# Create entity
POST /entities/
{
  "title": "Note",
  "content": "Content",
  "vault_path": "notes/note.md",
  "truth_level": 1,
  "origin_source": "user:web"
}

# Get entity
GET /entities/notes/note.md

# Update entity
PUT /entities/notes/note.md
{ "content": "New content" }

# Accept AI suggestion (CRITICAL)
POST /entities/summaries/ai.md/accept
{ "user_id": "user-123" }

# Get history
GET /entities/notes/note.md/history

# Delete
DELETE /entities/notes/note.md

# List all
GET /entities/
```

---

## Sync Operations

### Push to Cloud
```python
sync_client = LocalSyncClient(...)
result = await sync_client.push()

# Returns:
# - accepted: List of accepted item IDs
# - rejected: List of rejected items
# - conflicts: List of conflicts
```

### Pull from Cloud
```python
result = await sync_client.pull()

# Returns:
# - items: List of sync items
# - latest_version: Current cloud version
# - has_more: Boolean
```

### Auto-Sync
```python
sync_client = LocalSyncClient(
    config=SyncConfig(
        auto_sync=True,
        interval_seconds=300  # Every 5 minutes
    )
)
# Syncs automatically in background
```

---

## Origin Sources

Format: `<type>:<identifier>`

### User Sources
```
user:web           Web interface
user:mobile        Mobile app
user:desktop       Desktop app
user:voice         Voice assistant
user:vault         Direct file edit
```

### AI Sources
```
ai-local:llama3        Local Llama 3
ai-local:gpt4all       Local GPT4All
ai-cloud:openai-gpt4   Cloud OpenAI
ai-cloud:claude        Cloud Anthropic
```

### Automation Sources
```
automation:file-watcher     File system watcher
automation:daily-summary    Daily automation
automation:task-scheduler   Task scheduler
```

---

## Frontmatter Example

```yaml
---
id: abc-123
title: My Note
truth_metadata:
  truth_level: 1
  origin_source: user:web
  accepted_by_user: true
  last_modified_by_level: 1
  created_at: 2025-11-24T12:00:00Z
  updated_at: 2025-11-24T12:30:00Z
  origin_chain:
    - timestamp: 2025-11-24T12:00:00Z
      truth_level: 1
      source: user:web
      action: created
    - timestamp: 2025-11-24T12:30:00Z
      truth_level: 1
      source: user:mobile
      action: modified
metadata:
  tags: [important, work]
  project_id: proj-456
---

Note content goes here...
```

---

## Common Patterns

### AI Workflow
```
1. AI generates suggestion (L3)
2. User reviews in UI
3. User clicks "Accept"
4. System calls /accept endpoint
5. Content upgraded to U1
6. Provenance recorded
7. Synced to cloud as U1
```

### Voice Command Workflow
```
1. User speaks to Alexa
2. Command interpreted
3. Creates suggestion (C5)
4. Notification sent to user
5. User reviews and accepts
6. Upgraded to U1
7. Action executed
```

### Multi-Device Workflow
```
1. User edits on desktop (U1)
2. Changes pushed to cloud
3. Mobile pulls changes
4. Both devices in sync
5. If concurrent edits → Conflict
6. Last-write-wins (both U1)
7. Conflict logged for review
```

---

## File Structure

```
vault/
├── notes/
│   ├── meeting-2025-11-24.md      # U1
│   └── project-ideas.md           # U1
├── summaries/
│   ├── ai-weekly-summary.md       # L3 (suggestion)
│   └── accepted-summary.md        # U1 (accepted)
├── automation/
│   ├── daily-digest.md            # A2
│   └── task-reminders.md          # A2
└── voice/
    └── alexa-todo.md              # C5 (pending acceptance)
```

---

## Troubleshooting

### Issue: AI overwrites user content
**Solution:** Check truth levels. AI should be L3/C5, user should be U1. If AI is creating U1, fix the source code.

### Issue: Sync conflicts
**Solution:** Both U1 → Last-write-wins. Check timestamps. Review conflict in history endpoint.

### Issue: Changes not syncing
**Solution:** Check sync status, verify auto-sync enabled, check network connection, review sync events.

### Issue: Lost provenance
**Solution:** Origin chain should always exist. Check frontmatter parsing, verify truth metadata saved.

---

## Key Files

### Implementation
```
packages/core-domain/src/types/truth-hierarchy.ts
packages/core-domain/src/services/sync-conflict-resolver.ts
aei-core/models/truth_hierarchy.py
aei-core/services/vault_storage.py
aei-core/services/local_sync_client.py
aei-core/api/entities.py
```

### Documentation
```
.temp-workspace/PHASE-0-COMPLETE.md
.temp-workspace/PHASE-1-COMPLETE.md
.temp-workspace/IMPLEMENTATION-SUMMARY.md
.temp-workspace/EXECUTIVE-SUMMARY.md
.temp-workspace/PHASE-2-CHECKLIST.md
```

---

## Quick Commands

```bash
# Build TypeScript
pnpm build

# Start Python API
cd aei-core
python -m uvicorn main:app --reload

# Run tests
pnpm test

# Check entity
curl http://localhost:8000/entities/notes/test.md

# List all entities
curl http://localhost:8000/entities/
```

---

**Reference Version:** 1.0  
**Last Updated:** 2025-11-24  
**For More Details:** See IMPLEMENTATION-SUMMARY.md
