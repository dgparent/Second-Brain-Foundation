# VA Tool Suite - Quick Start Guide

**For:** Development Team  
**Purpose:** Get started building VA automation tools  
**Time to First Workflow:** < 2 hours

---

## 🚀 Quick Start (Get Running in 30 Minutes)

### Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm or pnpm installed
- [ ] Docker installed (`docker --version`)
- [ ] Git configured
- [ ] Code editor (VS Code recommended)

### Step 1: Clone & Setup (5 min)

```bash
# Clone repository
cd C:\!Projects\SecondBrainFoundation

# Install dependencies
npm install

# Verify setup
npm run check
```

### Step 2: Start Local Development Environment (10 min)

```bash
# Start Activepieces locally
docker run -d -p 8080:80 activepieces/activepieces

# Start n8n locally
docker run -d -p 5678:5678 n8nio/n8n

# Verify services
curl http://localhost:8080/api/health  # Activepieces
curl http://localhost:5678/healthz     # n8n
```

**Access:**
- Activepieces: http://localhost:8080
- n8n: http://localhost:5678

### Step 3: Create Your First SBF Piece (15 min)

```bash
# Create package
mkdir -p packages/sbf-automation/pieces/sbf
cd packages/sbf-automation/pieces/sbf

# Initialize
npm init -y

# Install framework
npm install @activepieces/pieces-framework@^0.20.2

# Create basic piece
cat > src/index.ts << 'EOF'
import { createPiece, PieceAuth } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';

export const sbf = createPiece({
  displayName: 'Second Brain Foundation',
  description: 'Connect to your SBF instance',
  auth: PieceAuth.None(),
  categories: [PieceCategory.PRODUCTIVITY],
  logoUrl: 'https://sbf.yourdomain.com/logo.svg',
  authors: ['Your Team'],
  actions: [],  // Add actions later
  triggers: [], // Add triggers later
});
EOF

# Build
npx tsc
```

**Test in Activepieces:**
1. Open http://localhost:8080
2. Go to Pieces > Custom
3. Upload your piece
4. Create a test flow

---

## 📋 Phase 1 - Week 1 Detailed Checklist

### Day 1: Project Setup

**Morning (9am - 12pm)**
- [ ] Review implementation phases document
- [ ] Set up development environment
- [ ] Clone all required repositories
- [ ] Install dependencies
- [ ] Configure IDE (VS Code extensions: TypeScript, Prettier, ESLint)

**Afternoon (1pm - 5pm)**
- [ ] Create package structure for SBF piece
- [ ] Initialize TypeScript configuration
- [ ] Set up build scripts
- [ ] Create basic piece definition
- [ ] Commit initial scaffold

**Deliverable:** Package structure ready, TypeScript compiling

---

### Day 2: Authentication

**Morning**
- [ ] Study Activepieces authentication patterns
- [ ] Design SBF auth schema (baseUrl + apiKey)
- [ ] Implement `sbfAuth` custom authentication
- [ ] Add input validation

**Afternoon**
- [ ] Create test SBF API endpoint (mock)
- [ ] Test authentication flow
- [ ] Add error handling
- [ ] Document authentication setup

**Deliverable:** Working authentication in Activepieces UI

---

### Day 3: Create Task Action (Part 1)

**Morning**
- [ ] Design create-task property schema
- [ ] Implement property definitions (client_uid, title, description, priority)
- [ ] Add dropdowns for priority/status
- [ ] Create action skeleton

**Afternoon**
- [ ] Implement execute() method
- [ ] Add HTTP request to SBF API
- [ ] Parse response
- [ ] Handle errors

**Code to Write:**
```typescript
// src/lib/actions/create-task.ts
export const createTaskAction = createAction({
  auth: sbfAuth,
  name: 'create_task',
  displayName: 'Create Task',
  description: 'Create a new task in SBF',
  props: {
    client_uid: Property.ShortText({...}),
    title: Property.ShortText({...}),
    priority: Property.StaticDropdown({...}),
    // ... more properties
  },
  async run(context) {
    // Implementation
  },
});
```

**Deliverable:** Create task action compiling, ready for testing

---

### Day 4: Create Task Action (Part 2)

**Morning**
- [ ] Write unit tests for create-task
- [ ] Test with mock SBF API
- [ ] Fix bugs
- [ ] Add logging

**Afternoon**
- [ ] Test in Activepieces UI
- [ ] Create test workflow: Manual trigger → Create Task
- [ ] Validate task created in SBF
- [ ] Refine error messages

**Deliverable:** Tested create-task action

---

### Day 5: New Entity Trigger

**Morning**
- [ ] Study webhook trigger pattern in Activepieces
- [ ] Design trigger schema (entity_type filter, client_uid filter)
- [ ] Implement trigger skeleton
- [ ] Add `onEnable` lifecycle method

**Afternoon**
- [ ] Implement webhook registration with SBF
- [ ] Add `onDisable` to clean up webhook
- [ ] Implement `run` method to parse webhook payload
- [ ] Test webhook delivery

**Testing:**
```bash
# Simulate webhook
curl -X POST http://localhost:8080/api/v1/webhooks/YOUR_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "entity": {
      "uid": "va-task-001",
      "type": "va.task",
      "client_uid": "va-client-test-001",
      "title": "Test Task"
    },
    "timestamp": "2025-11-20T21:00:00Z"
  }'
```

**Deliverable:** Working webhook trigger

---

### Weekend: Review & Documentation

- [ ] Review week's progress
- [ ] Write documentation for completed features
- [ ] Identify blockers for Week 2
- [ ] Plan Monday tasks

---

## 🎯 Common Tasks Reference

### Building TypeScript

```bash
# Compile
npx tsc

# Watch mode
npx tsc --watch

# Clean build
rm -rf dist && npx tsc
```

### Testing in Activepieces

```bash
# Package piece
npm run build

# Copy to Activepieces
cp -r dist /path/to/activepieces/packages/pieces/community/sbf

# Restart Activepieces
docker restart activepieces
```

### Debugging

```bash
# Check logs
docker logs activepieces
docker logs n8n

# Interactive shell
docker exec -it activepieces sh
docker exec -it n8n sh
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/sbf-piece-create-task

# Commit changes
git add .
git commit -m "feat: implement create-task action"

# Push
git push origin feature/sbf-piece-create-task

# Create PR
gh pr create --title "Add create-task action to SBF piece"
```

---

## 📚 Essential Reading

### Before You Start
1. Read: `libraries/activepieces/ACTIVEPIECES-EXTRACTION-REPORT.md`
2. Read: `docs/04-implementation/VA-TOOL-SUITE-IMPLEMENTATION-PHASES.md`
3. Skim: Activepieces docs - https://www.activepieces.com/docs

### Reference During Development
- Activepieces Pieces Framework: https://www.activepieces.com/docs/developers/building-pieces
- TypeScript Handbook: https://www.typescriptlang.org/docs/
- SBF API Documentation: `docs/07-reference/api/`

### Example Code
- Activepieces HTTP Piece: `libraries/activepieces/packages/pieces/community/http/`
- Activepieces Webhook Piece: `libraries/activepieces/packages/pieces/community/webhook/`

---

## 🐛 Troubleshooting

### TypeScript Errors

**Problem:** Module not found  
**Solution:**
```bash
npm install @activepieces/pieces-framework
npm install --save-dev @types/node
```

**Problem:** Type errors in piece definition  
**Solution:** Check you're using the correct version
```bash
npm list @activepieces/pieces-framework
# Should be ^0.20.2
```

### Activepieces Issues

**Problem:** Piece not showing in UI  
**Solution:**
1. Check piece is in correct directory
2. Restart Activepieces
3. Check logs: `docker logs activepieces`

**Problem:** Authentication failing  
**Solution:**
1. Verify API endpoint is accessible
2. Check API key is valid
3. Add logging to auth validation

### n8n Issues

**Problem:** Custom node not loading  
**Solution:**
```bash
# Check custom node directory
docker exec -it n8n ls /home/node/.n8n/custom

# Restart n8n
docker restart n8n
```

---

## 🎓 Learning Path

### Week 1: Activepieces Basics
- Understand piece architecture
- Learn property system
- Master authentication patterns
- Practice action/trigger creation

### Week 2: n8n Integration
- Learn n8n node structure
- Understand INodeType interface
- Practice workflow creation
- Explore LangChain integration

### Week 3: Advanced Patterns
- Multi-step workflows
- Error handling strategies
- Performance optimization
- Security best practices

### Week 4: Production Readiness
- Deployment strategies
- Monitoring setup
- Documentation writing
- Team training

---

## 📞 Support & Resources

### Getting Help

**Stuck on Activepieces?**
- Discord: https://discord.gg/2jUXBKDdP8
- Docs: https://www.activepieces.com/docs
- Examples: `libraries/activepieces/packages/pieces/community/`

**Stuck on n8n?**
- Community: https://community.n8n.io
- Docs: https://docs.n8n.io
- Examples: `libraries/n8n/packages/nodes-base/nodes/`

**Stuck on SBF Integration?**
- Check: `docs/04-implementation/`
- Review: `libraries/MULTI-LIBRARY-EXTRACTION-REPORT.md`

### Internal Resources
- Architecture docs: `docs/03-architecture/`
- API reference: `docs/07-reference/api/`
- Team wiki: (link when available)

---

## ✅ Daily Standup Template

```markdown
## Daily Progress - [Date]

### Yesterday
- [ ] Task 1
- [ ] Task 2

### Today
- [ ] Task 1
- [ ] Task 2

### Blockers
- None / [Description of blocker]

### Notes
- [Any important notes]
```

---

## 🎉 Success Checklist

**End of Week 1:**
- [ ] Activepieces SBF Piece compiles
- [ ] Authentication working
- [ ] Create task action functional
- [ ] Webhook trigger receiving events
- [ ] Basic documentation written

**End of Week 2:**
- [ ] n8n SBF Node working
- [ ] At least 2 operations implemented
- [ ] Credentials configured
- [ ] Test workflow created

**End of Week 3:**
- [ ] AI workflow functional (Email → Task)
- [ ] LangChain integration working
- [ ] Error handling comprehensive
- [ ] Performance acceptable

**End of Week 4:**
- [ ] Production deployment complete
- [ ] Monitoring active
- [ ] Documentation published
- [ ] Phase 1 DONE! 🎊

---

**Ready to build?** Start with Day 1, Task 1! 🚀

**Questions?** Check the implementation phases doc or ask the team.

**Good luck!** Remember: Small, incremental progress every day.
