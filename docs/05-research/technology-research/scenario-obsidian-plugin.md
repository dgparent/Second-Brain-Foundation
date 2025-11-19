# Scenario D: Obsidian Plugin - Exploration Document
**Second Brain Foundation - VC Partnership**

**Date:** November 8, 2025  
**Analyst:** Mary (Business Analyst)  
**Scenario:** D - Obsidian Plugin with AI Features  
**Status:** Exploration Phase  

---

## 🎯 Quick Overview

**The Pitch:** A premium Obsidian plugin that brings Second Brain Foundation's context-aware privacy and progressive organization to the 1M+ Obsidian user base.

**Timeline:** 2-3 months to public launch  
**Investment:** 320-480 developer hours  
**Target Revenue (Year 1):** $15,000-$50,000  
**Revenue Share Potential:** $6,000-$20,000 for partner at 40% split  

---

## 📊 Why Obsidian Plugin Makes Sense

### The Obsidian Ecosystem (Real Data)

**Market Size:**
- **Active Users:** 1,000,000+ (as of 2024)
- **Community Plugins:** 1,500+ available
- **Most Downloaded Plugins:** 
  - Dataview: 500,000+ downloads
  - Templater: 400,000+ downloads
  - Calendar: 350,000+ downloads
  - Kanban: 300,000+ downloads

**User Demographics:**
- **Tech-savvy:** 70%+ developers, researchers, writers
- **Privacy-conscious:** Primary reason for choosing Obsidian
- **Willing to pay:** Obsidian itself is $50 one-time (or $25/year for Sync)
- **Plugin supporters:** Active community of plugin developers and supporters

**Monetization Precedents:**
- Several developers successfully monetize Obsidian plugins
- Typical pricing: $3-10/month or $20-50 one-time
- Ko-fi/Patreon donations common ($1-5/month)
- Some plugins have 1000+ paying supporters

### Your Unique Position

**What Makes This Different from Existing Plugins:**

1. **Context-Aware Privacy** (No one does this)
   - Visual indicators for sensitivity levels
   - Granular AI permission controls
   - Privacy dashboard showing what AI can access

2. **Progressive Organization** (Partial solutions exist)
   - Daily note → entity extraction (Templater does basic version)
   - 48-hour lifecycle automation (no one does this)
   - Automatic filing with human override (unique)

3. **Typed Semantic Relationships** (Dataview does basic version)
   - Relationship type vocabulary (informs, uses, etc.)
   - Bidirectional relationship tracking
   - Relationship graph visualization

4. **Graph-Based Knowledge Architecture** (Obsidian has graph, but not typed)
   - UID-based entity system
   - 10 entity types with templates
   - BMOM framework integration

**The Gap in the Market:**
- Obsidian's graph view is visual but not semantic
- No plugins handle privacy-aware AI integration
- No plugins automate progressive organization lifecycle
- Most plugins are single-purpose (tags, tasks, calendars)

**Your Differentiator:**
> "The first Obsidian plugin that lets you use AI to organize your vault while maintaining granular privacy control"

---

## 🔍 Detailed Feature Breakdown

### Free Tier (Community Plugin)

**Purpose:** Build user base, drive upgrades, community goodwill

**Features:**
1. **Entity Templates Generator**
   - Command palette: "SBF: Create Person/Place/Topic/Project"
   - Auto-generates frontmatter with UID
   - 10 entity templates (person, place, topic, project, daily-note, source, artifact, event, task, process)
   - BMOM framework fields included

2. **UID Generator**
   - Command: "SBF: Generate UID"
   - Format: `{type}-{slug}-{counter}`
   - Validation and uniqueness checking
   - Rename file to match UID

3. **Frontmatter Validator**
   - Real-time validation as you type
   - Error highlighting in editor
   - Suggestion panel for fixes
   - JSON Schema validation

4. **Sensitivity Level Indicators**
   - Visual badges in file explorer (🟢🔵🟡🔴)
   - Status bar indicator for current file
   - No AI features (privacy indicators only)

5. **Basic Relationship Tracking**
   - Backlinks panel enhancement
   - Shows relationship type if specified
   - Manual entry only (no AI)

**User Value:** 
- Immediate productivity boost
- No learning curve (enhances Obsidian's existing features)
- Privacy-conscious users love the sensitivity system
- Free = viral growth potential

**Development Time:** 120-160 hours (4-5 weeks)

---

### Pro Tier ($6.99/month or $49/year)

**Purpose:** Revenue generation, showcase AI capabilities

**Features:**

#### 1. AI Entity Extraction
**What it does:** Analyzes daily notes and extracts entities automatically

**User Flow:**
1. User writes daily note naturally: *"Met with John at Coffee Shop to discuss the AI Project"*
2. Click "SBF: Extract Entities" (or auto-trigger after 48h)
3. AI identifies: Person (John), Place (Coffee Shop), Project (AI Project)
4. Shows preview with confidence scores
5. User confirms/edits/rejects
6. Creates entity files if they don't exist
7. Updates relationships in daily note

**Privacy Integration:**
- Respects sensitivity levels (won't send secret notes to cloud AI)
- Option to use local AI (Ollama) or cloud AI (OpenAI/Anthropic)
- Shows exactly what text was sent to AI
- Audit log of all AI operations

**Technical:**
- LangChain for LLM abstraction
- Named Entity Recognition (NER) with GPT-4 or Claude
- Fallback to local Ollama if user prefers
- User provides own API keys (we don't host AI)

#### 2. Relationship Detection & Suggestions
**What it does:** Suggests semantic relationships between entities

**User Flow:**
1. Open any entity file
2. Click "SBF: Suggest Relationships"
3. AI analyzes content and suggests typed relationships
4. Shows: "This project [uses] that topic" with confidence score
5. User approves relationships
6. Frontmatter updated automatically

**Examples:**
- `[[person-john-001]]` [collaborates_with] `[[person-jane-002]]`
- `[[project-ai-001]]` [uses] `[[topic-machine-learning-042]]`
- `[[artifact-report-001]]` [authored_by] `[[person-john-001]]`

#### 3. Advanced Relationship Graph Panel
**What it does:** D3.js visualization of typed semantic graph

**Features:**
- Filter by relationship type
- Filter by sensitivity level (privacy-aware visualization)
- 2D/3D graph views
- Click node to open file
- Highlight paths between entities
- Export graph as PNG/SVG

**Why users pay for this:**
- Obsidian's built-in graph is pretty but not semantic
- Can't filter by relationship types
- No privacy-aware filtering
- No export options

#### 4. Progressive Organization Automation
**What it does:** Implements 48-hour lifecycle automatically

**User Flow:**
1. Daily note created (lifecycle: captured)
2. After 48 hours, SBF prompts: "Ready to organize this?"
3. AI suggests entity extractions
4. User reviews and confirms
5. Entities created/updated
6. Daily note marked as dissolved
7. Optional: Archive daily note or keep as reference

**Settings:**
- Lifecycle duration (default: 48h, configurable)
- Auto-trigger or manual prompt
- Archive vs keep daily notes
- Notification preferences

#### 5. Privacy Dashboard
**What it does:** Central control panel for privacy settings

**Features:**
- Visual breakdown: X files public, Y personal, Z confidential, W secret
- Per-file privacy permissions (cloud_ai, local_ai, export)
- Bulk privacy operations
- AI operation audit log
- "What can AI see?" simulation

**Why this is killer:**
- No other tool does this
- Addresses #1 concern with AI tools (privacy)
- Makes technical users feel in control

#### 6. BMOM Framework Assistant
**What it does:** Helps fill out Because-Meaning-Outcome-Measure fields

**User Flow:**
1. Create new project/topic
2. Click "SBF: Fill BMOM Framework"
3. AI asks clarifying questions:
   - "Why does this project matter?" (Because)
   - "What does success look like?" (Outcome)
   - "How will you measure it?" (Measure)
4. AI drafts BMOM fields
5. User edits and confirms

**Why users love this:**
- Makes note-taking more intentional
- Framework ensures notes are actionable
- AI makes it effortless (vs manual thinking)

**Development Time (Pro Features):** 200-320 hours (8-10 weeks additional)

**Total Development:** 320-480 hours (12-15 weeks = 3-4 months)

---

## 💰 Revenue Model Analysis

### Pricing Strategy

**Free Tier: $0**
- Entity templates + UID generation
- Frontmatter validation
- Sensitivity indicators
- Basic relationship tracking

**Pro Tier: $6.99/month or $49/year**
- All free features PLUS:
- AI entity extraction
- Relationship detection
- Advanced graph visualization
- Progressive organization automation
- Privacy dashboard
- BMOM assistant

**Why $6.99/month?**
- Lower than Obsidian Sync ($8/month)
- Comparable to other productivity tools ($5-10/month)
- Annual option ($49) = 30% discount (7 months for price of 12)
- Psychological: Under $7 feels "cheap" vs $10+

**Alternatives Considered:**
- **$4.99/month:** Too cheap, leaves money on table
- **$9.99/month:** Too expensive for plugin vs full app
- **One-time $79:** Limits long-term revenue, no recurring

### Market Size & Conversion Estimates

**Total Addressable Market (TAM):**
- Obsidian users: 1,000,000+
- Privacy-conscious subset: 700,000 (70%)
- Use plugins: 600,000 (60% of total users)

**Serviceable Addressable Market (SAM):**
- Would consider paid plugins: 300,000 (30%)
- Match our target persona: 100,000 (10%)

**Serviceable Obtainable Market (SOM) - Year 1:**
- **Conservative:** 5,000 free users, 100 paid (2% conversion) = $699/mo = $8,388/year
- **Realistic:** 10,000 free users, 300 paid (3% conversion) = $2,097/mo = $25,164/year
- **Optimistic:** 20,000 free users, 1,000 paid (5% conversion) = $6,990/mo = $83,880/year

**Year 1 Revenue Projection (Realistic Scenario):**

| Month | Free Users | Paid Users | MRR | ARR |
|-------|------------|------------|-----|-----|
| 1 (Launch) | 500 | 10 | $70 | $840 |
| 2 | 1,000 | 30 | $210 | $2,520 |
| 3 | 2,000 | 60 | $420 | $5,040 |
| 6 | 6,000 | 180 | $1,258 | $15,096 |
| 12 | 10,000 | 300 | $2,097 | $25,164 |

**Assumptions:**
- Launch visibility: Featured on Obsidian Roundup, Reddit posts
- Conversion rate: 3% (industry average for freemium: 2-5%)
- Churn rate: 5%/month (typical for indie tools)
- Growth: 40% monthly for first 3 months, 15% thereafter
- Annual subscriptions: 30% of paid users (prefer annual)

### Comparable Plugin Pricing

**Data from Obsidian Plugin Ecosystem:**

1. **Dataview Plugin** (free, donations)
   - 500K+ users
   - Ko-fi supporters: ~2,000 ($3-5/month)
   - Revenue estimate: $6K-10K/year (donations)

2. **Templater Plugin** (free, donations)
   - 400K+ users
   - GitHub sponsors: ~500 ($1-10/month)
   - Revenue estimate: $3K-5K/year

3. **Excalidraw Plugin** (free + paid integration)
   - Free plugin + Excalidraw.com hosting ($5/month)
   - Dual monetization model

4. **Local REST API Plugin** (free, tips)
   - Niche technical plugin
   - ~100 GitHub sponsors
   - Revenue estimate: $1K-2K/year

**Key Insights:**
- Most plugins are free with donations (not sustainable for full-time dev)
- Premium features can command $5-10/month
- Users respect quality and ongoing development
- Obsidian community supports developers who deliver value

**Our Advantage:**
- Pro tier is clear value-add (AI features cost us API calls)
- Privacy focus resonates with Obsidian's core users
- Ongoing AI improvements justify subscription

---

## 👥 Target User Personas

### Primary: "Alex the Developer"

**Demographics:**
- Age: 28-40
- Occupation: Software developer, engineering manager
- Income: $80K-150K
- Location: US/Europe/Asia (remote-friendly)

**Current Tools:**
- Obsidian (daily notes + technical docs)
- VS Code
- GitHub
- Local AI tools (Ollama, LMStudio)

**Pain Points:**
1. "I capture tons of notes but never organize them"
2. "I want AI help but don't trust cloud services with my code notes"
3. "Obsidian's graph is cool but doesn't show relationships between ideas"
4. "I have sensitive work notes mixed with personal notes"

**Why They Pay:**
- $6.99/month is trivial compared to their income
- Privacy-aware AI is exactly what they need
- Local AI support (Ollama) is killer feature
- Saves hours of manual organization

**Buying Triggers:**
- See demo video showing AI extracting entities from daily notes
- Privacy dashboard showing "this note won't leave your computer"
- Relationship graph showing their knowledge structure

**Quote:**
> "I'd pay $10/month easily if it means I can use AI without sending my company's code snippets to OpenAI."

### Secondary: "Jordan the Researcher"

**Demographics:**
- Age: 30-55
- Occupation: Academic researcher, journalist, consultant
- Income: $50K-100K
- Location: University towns, major cities

**Current Tools:**
- Obsidian (research notes + literature review)
- Zotero (citations)
- NotebookLM (AI analysis)

**Pain Points:**
1. "I have 1000s of research notes with no structure"
2. "I can't use AI tools because of confidential sources"
3. "Manually linking related concepts is tedious"
4. "I need to track which notes have sensitive info"

**Why They Pay:**
- Research grant can cover tool costs
- Privacy is non-negotiable (journalist sources, unpublished research)
- BMOM framework helps structure research questions
- Relationship detection finds unexpected connections

**Buying Triggers:**
- Can set different privacy levels for different projects
- Local AI works offline (for field research)
- Relationship graph helps write literature reviews

**Quote:**
> "My sources are confidential. If this lets me use AI locally without cloud uploads, I'm in."

### Tertiary: "Taylor the PKM Enthusiast"

**Demographics:**
- Age: 22-35
- Occupation: Content creator, writer, entrepreneur
- Income: $30K-70K
- Location: Digital nomads, creative hubs

**Current Tools:**
- Obsidian (personal knowledge management)
- Notion (project management)
- ChatGPT (writing assistant)

**Pain Points:**
1. "I love PKM systems but get overwhelmed"
2. "I want AI to organize my notes but it feels like cheating"
3. "I'm not technical enough to set up complex workflows"
4. "I have personal journal entries mixed with business ideas"

**Why They Pay:**
- Aspirational purchase ($6.99 is "affordable luxury")
- Automation = more time for creative work
- Privacy features make them feel sophisticated
- Beautiful UI makes them want to show it off

**Buying Triggers:**
- YouTube influencer review
- "Before/after" screenshots of organized vault
- Easy setup (no coding required)

**Quote:**
> "This is like having a personal assistant for my brain."

---

## 🏆 Competitive Analysis

### Direct Competitors (Obsidian Plugins)

#### 1. Dataview
**What it does:** Query and display data from frontmatter  
**Price:** Free (donations via Ko-fi)  
**Users:** 500,000+  
**Strengths:** Powerful query language, active community  
**Weaknesses:** No AI, steep learning curve, manual data entry  
**Our Advantage:** We auto-extract entities with AI vs manual tagging

#### 2. Templater
**What it does:** Advanced template system with JavaScript  
**Price:** Free (donations via GitHub Sponsors)  
**Users:** 400,000+  
**Strengths:** Extremely flexible, active development  
**Weaknesses:** Requires coding, no AI, no privacy controls  
**Our Advantage:** AI-powered vs manual scripting, privacy-first

#### 3. Smart Connections
**What it does:** AI-powered note similarity and chat  
**Price:** Free + paid tiers (recently launched)  
**Users:** 50,000+ (newer plugin)  
**Strengths:** AI integration, semantic search  
**Weaknesses:** No privacy controls, cloud-only AI, generic prompts  
**Our Advantage:** Privacy-aware, local AI support, structured entity system

#### 4. Graph Analysis
**What it does:** Enhanced graph view with filters  
**Price:** Free  
**Users:** 100,000+  
**Strengths:** Beautiful visualizations, fast  
**Weaknesses:** Not semantic (only link-based), no relationship types  
**Our Advantage:** Typed semantic relationships, privacy filtering

### Indirect Competitors (Full Apps)

#### 1. Capacities
**What it does:** AI-powered PKM with object types  
**Price:** $10/month  
**Users:** Unknown (newer app)  
**Strengths:** Beautiful UI, AI-native, object-oriented  
**Weaknesses:** Proprietary, cloud-only, no local AI, vendor lock-in  
**Our Advantage:** Works with Obsidian (no migration), privacy-first, local AI

#### 2. Reflect
**What it does:** AI-powered note-taking with backlinking  
**Price:** $10/month  
**Users:** Unknown  
**Strengths:** Fast, clean UI, AI integration  
**Weaknesses:** Proprietary format, cloud-only, expensive  
**Our Advantage:** Same benefits as above + lower price

#### 3. Notion AI
**What it does:** AI writing assistant in Notion  
**Price:** $10/month (on top of Notion subscription)  
**Users:** Millions (Notion base)  
**Strengths:** Integrated into Notion, powerful AI  
**Weaknesses:** No privacy controls, cloud-only, generic AI  
**Our Advantage:** Privacy-aware, domain-specific (PKM), local option

### Competitive Positioning

**Our Unique Position:**
> "The only Obsidian plugin that combines AI-powered organization with granular privacy controls and local AI support"

**Positioning Statement:**
> For privacy-conscious knowledge workers who use Obsidian, Second Brain Foundation is an AI-powered organization plugin that respects your data sovereignty. Unlike Smart Connections or cloud AI tools, we give you complete control over which notes AI can access and support local AI processing.

**Key Differentiators:**
1. **Context-Aware Privacy** - No one else does this
2. **Local AI Support** - Ollama, LMStudio, not just OpenAI
3. **Progressive Organization** - 48-hour lifecycle automation
4. **Typed Relationships** - Semantic graph, not just links
5. **Open Architecture** - Works with your existing Obsidian vault

**Why We Win:**
- Obsidian users chose Obsidian for privacy and ownership
- Our privacy features align perfectly with their values
- We enhance Obsidian vs replacing it
- AI is opt-in and transparent vs hidden magic

---

## 🚀 Go-to-Market Strategy

### Phase 1: Pre-Launch (Weeks 1-8 of development)

**Week 1-2: Community Presence**
- [ ] Join Obsidian Discord and forum
- [ ] Introduce yourself, share vision (no selling)
- [ ] Ask for feedback on mockups
- [ ] Identify 10-20 beta testers

**Week 3-4: Content Creation**
- [ ] Create GitHub repository (public development)
- [ ] Write blog post: "Why I'm Building a Privacy-First AI Plugin"
- [ ] Record 2-min demo video (rough prototype)
- [ ] Share on r/ObsidianMD

**Week 5-6: Beta Program**
- [ ] Release alpha to 10 beta testers
- [ ] Collect feedback in Discord channel
- [ ] Iterate on critical issues
- [ ] Build testimonials

**Week 7-8: Launch Prep**
- [ ] Polish free tier features
- [ ] Create landing page (outside Obsidian)
- [ ] Write documentation
- [ ] Prepare launch announcement

### Phase 2: Launch Week

**Day 1: Community Plugin Submission**
- [ ] Submit to Obsidian Community Plugins
- [ ] Post on r/ObsidianMD: "I built a privacy-first AI plugin"
- [ ] Share in Obsidian Discord
- [ ] Tweet with demo video

**Day 2-3: Content Blitz**
- [ ] Publish blog post: "How It Works" (technical deep-dive)
- [ ] Record 5-min tutorial video
- [ ] Post on Hacker News
- [ ] Email beta testers for testimonials

**Day 4-7: Media Outreach**
- [ ] Contact Obsidian Roundup (weekly newsletter)
- [ ] Reach out to PKM YouTubers (Nick Milo, Linking Your Thinking)
- [ ] Post in PKM communities (r/PKMS, r/Zettelkasten)
- [ ] Engage with every comment/question

**Launch Week Goals:**
- 500-1,000 free installs
- 50-100 email signups for Pro waitlist
- 3-5 testimonials
- Featured in Obsidian Roundup

### Phase 3: Post-Launch Growth (Months 1-3)

**Content Marketing:**
- 1 blog post/week (use cases, tutorials, comparisons)
- 1 video/week (feature deep-dives)
- Daily engagement in Obsidian Discord
- Weekly update thread on Reddit

**Topics:**
- "How I organize 1000 research papers with SBF"
- "Local AI setup guide (Ollama + SBF)"
- "Privacy dashboard: What your AI can see"
- "From chaos to structure in 48 hours"

**Community Building:**
- Create dedicated Discord server (once 1000+ users)
- Host monthly AMA sessions
- Share user success stories
- Showcase vaults (with permission)

**Partnerships:**
- Collaborate with Dataview/Templater devs (cross-promotion)
- Reach out to Obsidian for featured plugin status
- Partner with PKM courses (offer discount code)

**Metrics to Track:**
- Free installs (weekly)
- Pro conversions (daily)
- Churn rate (monthly)
- Support tickets (daily)
- Community engagement (weekly)

### Channels & Tactics

**High-Leverage Channels:**
1. **Obsidian Community Plugins** - Primary distribution
2. **r/ObsidianMD** - 100K+ subscribers, highly engaged
3. **Obsidian Discord** - 50K+ members, daily activity
4. **Obsidian Roundup** - Weekly newsletter, 20K+ subscribers
5. **YouTube PKM Creators** - Nick Milo, Linking Your Thinking, others

**Medium-Leverage Channels:**
1. **Product Hunt** - One-time spike, visibility
2. **Hacker News** - Technical audience, credibility
3. **r/PKMS** - 20K subscribers, cross-pollination
4. **Twitter/X** - PKM community, influencers
5. **IndieHackers** - Revenue transparency, support

**Low-Leverage (Skip for Now):**
1. Facebook groups - Lower tech-savvy audience
2. LinkedIn - Not primary PKM hangout
3. Paid ads - Too expensive for initial validation

---

## ⚙️ Technical Implementation

### Obsidian Plugin Architecture

**Technology Stack:**
- **Language:** TypeScript (required by Obsidian)
- **Framework:** Obsidian Plugin API
- **State Management:** MobX or Zustand
- **AI Integration:** LangChain (JS/TS version)
- **Visualization:** D3.js (for graph panel)
- **Storage:** Obsidian's data.json (plugin settings)

**Plugin Structure:**
```
second-brain-foundation/
├── src/
│   ├── main.ts                 # Plugin entry point
│   ├── settings.ts             # Settings tab
│   ├── commands/               # Command palette commands
│   │   ├── create-entity.ts
│   │   ├── extract-entities.ts
│   │   ├── suggest-relationships.ts
│   │   └── generate-uid.ts
│   ├── views/                  # Custom views
│   │   ├── graph-panel.ts      # D3.js graph
│   │   ├── privacy-dashboard.ts
│   │   └── entity-browser.ts
│   ├── ai/                     # AI integration
│   │   ├── langchain-setup.ts
│   │   ├── entity-extractor.ts
│   │   ├── relationship-detector.ts
│   │   └── local-ai.ts         # Ollama integration
│   ├── utils/                  # Utilities
│   │   ├── uid-generator.ts
│   │   ├── frontmatter-parser.ts
│   │   ├── validator.ts
│   │   └── privacy-checker.ts
│   └── styles/                 # CSS
│       └── main.css
├── manifest.json               # Plugin metadata
├── package.json
└── README.md
```

**Key Technical Challenges:**

1. **AI Integration in Browser Context**
   - Solution: Use LangChain.js with API calls (user provides keys)
   - Fallback: Local Ollama via REST API (localhost:11434)

2. **Privacy-Aware Processing**
   - Solution: Pre-filter files by sensitivity before sending to AI
   - User confirmation dialog before any AI call

3. **Graph Visualization Performance**
   - Solution: D3.js with Web Workers for large graphs (1000+ nodes)
   - Lazy loading for entity details

4. **Plugin Settings Storage**
   - Solution: Obsidian's data.json (encrypted if sensitive)
   - Separate API keys per AI provider

### Development Roadmap

**Phase 1: Free Tier (Weeks 1-5)**

**Week 1-2: Project Setup**
- [ ] Set up TypeScript + Obsidian plugin boilerplate
- [ ] Configure ESLint, Prettier, testing (Jest)
- [ ] Create GitHub repo with CI/CD
- [ ] Design settings UI

**Week 3: Entity Templates & UID**
- [ ] Implement entity template generator
- [ ] Build UID generation logic
- [ ] Create command palette commands
- [ ] Test with 10 entity types

**Week 4: Frontmatter Validation**
- [ ] JSON Schema validator
- [ ] Real-time error highlighting
- [ ] Suggestion engine
- [ ] Test with edge cases

**Week 5: Sensitivity Indicators**
- [ ] Visual badges in file explorer
- [ ] Status bar integration
- [ ] Settings for color customization
- [ ] Documentation

**Deliverable:** Community Plugin submission (free tier)

---

**Phase 2: Pro Tier Core (Weeks 6-10)**

**Week 6-7: AI Entity Extraction**
- [ ] LangChain.js integration
- [ ] OpenAI/Anthropic API setup
- [ ] Entity extraction prompts
- [ ] Confidence scoring
- [ ] User confirmation UI

**Week 8: Local AI Support**
- [ ] Ollama REST API integration
- [ ] Model selection UI
- [ ] Fallback logic (cloud → local)
- [ ] Performance testing

**Week 9: Relationship Detection**
- [ ] Relationship type vocabulary
- [ ] Detection algorithm (LLM-based)
- [ ] Suggestion UI
- [ ] Bidirectional link updates

**Week 10: Privacy Dashboard**
- [ ] File sensitivity breakdown
- [ ] Permission toggle UI
- [ ] Audit log viewer
- [ ] "What AI sees" simulator

**Deliverable:** Pro tier beta release

---

**Phase 3: Pro Tier Advanced (Weeks 11-14)**

**Week 11-12: Graph Visualization**
- [ ] D3.js force-directed graph
- [ ] Relationship type filtering
- [ ] Sensitivity level filtering
- [ ] Interactive controls (zoom, pan, click)
- [ ] Export PNG/SVG

**Week 13: Progressive Organization**
- [ ] 48-hour lifecycle automation
- [ ] Notification system
- [ ] Batch entity creation
- [ ] Archive/dissolve logic

**Week 14: BMOM Assistant + Polish**
- [ ] BMOM field generation
- [ ] Final bug fixes
- [ ] Performance optimization
- [ ] Documentation updates

**Deliverable:** Pro tier public launch

---

**Phase 4: Post-Launch (Weeks 15+)**

**Ongoing:**
- [ ] Bug fixes and support
- [ ] Feature requests from community
- [ ] Performance improvements
- [ ] Documentation updates
- [ ] Marketing content

**Planned v1.1 Features (Months 4-6):**
- [ ] Mobile plugin support (Obsidian Mobile)
- [ ] Voice transcript processing
- [ ] Multi-vault sync
- [ ] Advanced graph layouts (hierarchical, circular)
- [ ] Export to Anki/Notion/other tools

---

## 💰 Financial Projections

### Development Investment

**Partner Development Time:**
- Free tier: 120-160 hours (4-5 weeks)
- Pro tier: 200-320 hours (8-10 weeks)
- **Total: 320-480 hours (12-15 weeks = 3-4 months)**

**Equivalent Cost (at $50/hr market rate):**
- Conservative: 320 hours × $50 = $16,000
- Realistic: 400 hours × $50 = $20,000
- High-end: 480 hours × $60 = $28,800

**Your Time Investment:**
- Product management: 80 hours (5 hours/week × 16 weeks)
- Marketing content: 60 hours (blog posts, videos, docs)
- Community engagement: 80 hours (Discord, Reddit, support)
- **Total: 220 hours**

**Out-of-Pocket Costs:**
- Domain + hosting: $100/year (landing page)
- AI API credits (testing): $50-100/month
- Marketing tools (email, analytics): $50/month
- **Total Year 1: $1,000-$1,500**

### Revenue Projections (Realistic Scenario)

**Assumptions:**
- Launch: Month 3 (after development)
- Pricing: $6.99/month or $49/year
- Conversion: 3% free → paid
- Churn: 5%/month
- Annual split: 30% choose annual

**Year 1 (Months 1-12, launch at Month 3):**

| Month | Free Users | Paid Users | MRR | ARR | Cumulative Revenue |
|-------|------------|------------|-----|-----|--------------------|
| 1 (dev) | 0 | 0 | $0 | $0 | $0 |
| 2 (dev) | 0 | 0 | $0 | $0 | $0 |
| 3 (launch) | 500 | 10 | $70 | $840 | $70 |
| 4 | 1,000 | 30 | $210 | $2,520 | $280 |
| 5 | 1,500 | 50 | $350 | $4,200 | $630 |
| 6 | 2,500 | 80 | $560 | $6,720 | $1,190 |
| 9 | 5,000 | 150 | $1,048 | $12,576 | $4,326 |
| 12 | 10,000 | 300 | $2,097 | $25,164 | $10,500 |

**Year 1 Total Revenue: $25,000-$30,000**

**Year 2 Projection:**
- Growth continues at 10%/month
- End state: 20,000 free users, 800 paid users
- **Year 2 Total Revenue: $60,000-$75,000**

**Year 3 Projection:**
- Mature growth: 5%/month
- End state: 30,000 free users, 1,200 paid users
- **Year 3 Total Revenue: $90,000-$110,000**

### Partner ROI Analysis

**Proposed Revenue Share: 40/60**
- **You: 60%** (product vision, marketing, support, community)
- **Partner: 40%** (implementation, maintenance, technical debt)

**Partner Payback Analysis:**

| Scenario | Year 1 Revenue | Partner Share (40%) | Months to Break Even |
|----------|----------------|---------------------|----------------------|
| Conservative | $15,000 | $6,000 | 32 months (2.7 years) |
| Realistic | $25,000 | $10,000 | 19 months (1.6 years) |
| Optimistic | $50,000 | $20,000 | 10 months |

**By Year 3:**
- Realistic: Partner earns $40K-$60K (cumulative $70K-$90K)
- ROI: 350-450% on $20K investment
- Ongoing passive income: $3-4K/month

**Is This Attractive?**
- If partner's hourly rate is $50: Break-even in 16-20 months
- If partner has other revenue: Acceptable for diversification
- If partner believes in long-term: Very attractive (passive income)

**Alternative: Upfront Payment + Lower Revenue Share**
- You pay: $5,000 upfront (milestone-based)
- Revenue share: 30% for partner, 70% for you
- Partner breaks even faster, you keep more long-term

---

## 🎯 Success Metrics & KPIs

### Launch Metrics (Month 3)

**Minimum Viable Success:**
- [ ] 500+ free installs
- [ ] 10+ Pro subscriptions
- [ ] 3+ testimonials
- [ ] <10 critical bugs

**Target Success:**
- [ ] 1,000+ free installs
- [ ] 30+ Pro subscriptions ($210 MRR)
- [ ] 5+ testimonials
- [ ] Featured in Obsidian Roundup

**Exceptional Success:**
- [ ] 2,000+ free installs
- [ ] 100+ Pro subscriptions ($700 MRR)
- [ ] 10+ testimonials
- [ ] Trending on r/ObsidianMD

### Month 6 Metrics

**Minimum:**
- [ ] 2,500 free users
- [ ] 75 paid users ($525 MRR)
- [ ] <10% monthly churn
- [ ] 4+ star rating

**Target:**
- [ ] 6,000 free users
- [ ] 180 paid users ($1,258 MRR)
- [ ] <7% monthly churn
- [ ] 4.5+ star rating

**Exceptional:**
- [ ] 10,000+ free users
- [ ] 400 paid users ($2,796 MRR)
- [ ] <5% monthly churn
- [ ] Featured Obsidian plugin

### Year 1 Metrics

**Minimum:**
- [ ] 5,000 free users
- [ ] 150 paid users ($1,048 MRR = $12,576 ARR)
- [ ] Break-even on development costs

**Target:**
- [ ] 10,000 free users
- [ ] 300 paid users ($2,097 MRR = $25,164 ARR)
- [ ] Partner profitable (40% = $10K)

**Exceptional:**
- [ ] 20,000 free users
- [ ] 1,000 paid users ($6,990 MRR = $83,880 ARR)
- [ ] Hire part-time support

### Kill Criteria (Pivot Points)

**Month 6 Decision:**
- If <1,000 free users → Marketing problem, double down on content
- If <50 paid users → Pricing problem, test $4.99 or annual-only
- If >15% churn → Product problem, user research needed

**Month 12 Decision:**
- If <3,000 free users → Consider shutdown or pivot
- If <100 paid users ($700 MRR) → Not sustainable, pivot or stop
- If break-even not in sight → Renegotiate partner terms or exit

---

## 🚨 Risk Assessment

### Technical Risks

**Risk 1: Obsidian API Changes**
- **Probability:** Medium (Obsidian actively developed)
- **Impact:** High (could break plugin)
- **Mitigation:** 
  - Follow Obsidian dev updates closely
  - Join plugin developer Discord
  - Build with stable APIs only
- **Contingency:** Rapid updates, version compatibility

**Risk 2: AI API Costs Exceed Revenue**
- **Probability:** Low (users provide own keys)
- **Impact:** Medium (bad UX if we host AI)
- **Mitigation:**
  - Users provide own OpenAI/Anthropic keys
  - Local AI (Ollama) as free alternative
  - No hosted AI in v1.0
- **Contingency:** Add hosted AI as separate tier ($14.99/mo)

**Risk 3: Performance Issues with Large Vaults**
- **Probability:** Medium (some users have 10K+ notes)
- **Impact:** Medium (poor UX, churn)
- **Mitigation:**
  - Lazy loading for graph
  - Incremental indexing
  - User-defined scope (folders to include)
- **Contingency:** Add "performance mode" settings

### Market Risks

**Risk 1: Obsidian Adds Built-In AI Features**
- **Probability:** Medium-High (likely in 1-2 years)
- **Impact:** Very High (could make plugin obsolete)
- **Mitigation:**
  - Focus on privacy differentiators (they likely won't do local AI)
  - Build community moat (loyal users)
  - Pivot to complementary features
- **Contingency:** Partner with Obsidian or pivot to other tools

**Risk 2: Smart Connections Plugin Adds Privacy Features**
- **Probability:** Low (not their focus currently)
- **Impact:** Medium (reduces differentiation)
- **Mitigation:**
  - First-mover advantage (ship fast)
  - Build deeper privacy features (audit logs, etc.)
  - Patent or open-source model
- **Contingency:** Compete on quality and trust

**Risk 3: Users Don't Want to Pay for Plugins**
- **Probability:** Medium (most plugins are free)
- **Impact:** High (no revenue)
- **Mitigation:**
  - Pre-launch validation (survey 100 users)
  - Free tier must be genuinely useful
  - Pro features are clear value-add
- **Contingency:** Shift to donation model or services

### Partnership Risks

**Risk 1: Developer Loses Interest Mid-Project**
- **Probability:** Low-Medium (common in revenue share)
- **Impact:** Very High (project stalls)
- **Mitigation:**
  - Milestone-based engagement
  - Clear contract with exit clauses
  - Regular check-ins (weekly)
- **Contingency:** Find replacement dev, take over coding yourself

**Risk 2: Revenue Sharing Disputes**
- **Probability:** Low (if clear upfront)
- **Impact:** Medium (relationship damage)
- **Mitigation:**
  - Detailed written agreement
  - Use Stripe/Gumroad with auto-splits
  - Monthly transparency reports
- **Contingency:** Mediation clause in contract

**Risk 3: Scope Creep Delays Launch**
- **Probability:** High (common in software)
- **Impact:** High (missed launch window)
- **Mitigation:**
  - Strict MVP scope (no feature creep)
  - Weekly sprint planning
  - "Parking lot" for future features
- **Contingency:** Cut features, ship v1.0 with less

---

## ✅ Decision Checklist

Before committing to Scenario D (Obsidian Plugin), validate these assumptions:

### Market Validation
- [ ] Survey 20+ Obsidian users: Would you pay $6.99/month for this?
- [ ] Post concept in r/ObsidianMD, collect feedback (target: 50+ upvotes)
- [ ] Interview 10 potential users about current workflow pain points
- [ ] Build landing page, drive 100 visitors, measure email signups

### Technical Validation
- [ ] Partner has TypeScript + Obsidian plugin experience (or can learn)
- [ ] Test Obsidian Plugin API capabilities (can we build what we need?)
- [ ] Prototype AI integration (LangChain + OpenAI) in 1 week
- [ ] Confirm Ollama local AI works in Obsidian context

### Financial Validation
- [ ] Partner agrees to 3-4 month timeline (320-480 hours)
- [ ] You can commit 10-15 hours/week for marketing/support
- [ ] You have $1,500 budget for hosting/tools/APIs
- [ ] Both parties comfortable with 40/60 revenue split

### Risk Validation
- [ ] You're okay with Obsidian potentially adding AI features later
- [ ] You have backup plan if plugin doesn't gain traction
- [ ] You can pivot to different monetization if needed (donations, etc.)
- [ ] You've read Obsidian plugin developer docs and community guidelines

### Personal Validation
- [ ] You're excited about this specific scenario (not just "a product")
- [ ] You understand Obsidian community culture and values
- [ ] You can commit for 12+ months (not a 3-month experiment)
- [ ] You're comfortable with public development (GitHub, Discord)

**If 18+ of 22 boxes checked → GO**  
**If 13-17 boxes checked → CAUTIOUS GO (address gaps first)**  
**If <13 boxes checked → NO GO (pick different scenario)**

---

## 🎯 Next Steps if You Choose Scenario D

**Week 1: Validation Sprint**
1. Create mockups/wireframes of key features
2. Post in r/ObsidianMD: "Would you use this?" (collect feedback)
3. Survey 20 Obsidian users on pricing
4. Build simple landing page with email capture

**Week 2: Partnership Agreement**
1. Draft revenue share agreement (get lawyer review)
2. Define milestones and kill criteria
3. Set up payment splitting (Stripe Connect or Gumroad)
4. Create shared project management (Notion, Linear, etc.)

**Week 3-4: Development Kickoff**
1. Set up TypeScript + Obsidian plugin boilerplate
2. Partner implements entity template generator (first feature)
3. You write blog post: "Why I'm building this"
4. Create GitHub repo and recruit beta testers

**Week 5-14: Build Free Tier**
1. Implement all free features (templates, UID, validation, indicators)
2. Test with 10 beta users
3. Iterate based on feedback
4. Submit to Obsidian Community Plugins

**Week 15-26: Build Pro Tier**
1. Implement AI features (entity extraction, relationships, graph)
2. Launch Pro tier beta (invite waitlist)
3. Collect testimonials
4. Public launch

**Month 7+: Growth & Optimization**
1. Content marketing (blog, videos, tutorials)
2. Community building (Discord, support)
3. Feature iterations based on feedback
4. Plan v1.1 features

---

**Ready to proceed with Scenario D, or want to explore another scenario?**

Let me know and I'll help you with next steps!

---

*Analysis by Mary (Business Analyst)*  
*November 8, 2025*
