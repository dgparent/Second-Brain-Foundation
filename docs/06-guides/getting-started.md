# Getting Started with Second Brain Foundation

**Welcome!** This guide will help you get up and running with Second Brain Foundation in about 30 minutes.

---

## 📖 What is Second Brain Foundation?

Second Brain Foundation is an **AI-augmented personal knowledge management system** that helps you:

- **Capture** thoughts and information naturally in daily notes
- **Organize** automatically with AI assistance
- **Connect** ideas through typed semantic relationships
- **Retrieve** knowledge when you need it

### Key Features

✨ **Progressive Organization** - Capture first, organize later  
🔒 **Privacy-First** - Your data stays local, you control AI access  
🤖 **Multi-Provider AI** - Choose OpenAI, Anthropic, or local Ollama  
📝 **Plain Markdown** - Works with any markdown editor  
🔗 **Graph-Based** - Knowledge as connected entities, not isolated notes  

---

## 🎯 Who Is This For?

**You'll love Second Brain Foundation if you:**
- Take lots of notes but struggle to organize them
- Want AI help without sacrificing privacy
- Prefer markdown and plain text files
- Like the idea of connected knowledge (like Obsidian, Roam, Logseq)
- Want to own your data forever

**This might not be for you if:**
- You're looking for a polished consumer product (this is early-stage)
- You're uncomfortable with command-line tools
- You prefer proprietary note apps with mobile sync

---

## 💻 Prerequisites

Before you begin, make sure you have:

### Required
- **Node.js** 18+ ([download](https://nodejs.org/))
- **Git** ([download](https://git-scm.com/))
- **Text editor** (VS Code, Obsidian, or any markdown editor)
- **Terminal/Command prompt** basic familiarity

### Optional
- **OpenAI API key** for GPT-4 (or)
- **Anthropic API key** for Claude (or)
- **Ollama** installed for local AI ([ollama.ai](https://ollama.ai/))

### Check Your Setup

```bash
# Check Node.js version (should be 18+)
node --version

# Check Git
git --version
```

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
# Navigate to where you want to install
cd ~/Projects  # or C:\Projects on Windows

# Clone the repository
git clone https://github.com/YourUsername/SecondBrainFoundation.git
cd SecondBrainFoundation
```

### Step 2: Install Dependencies

```bash
# Install all dependencies (this may take a few minutes)
cd Extraction-01/03-integration/sbf-app
npm install
```

### Step 3: Set Up Your Vault

Your "vault" is where all your markdown files live.

**Option A: Use the included example vault**
```bash
# The vault folder is already created at:
# SecondBrainFoundation/vault/
```

**Option B: Use your existing markdown folder**
```bash
# You'll point to this during first-time setup
# Example: ~/Documents/Notes or C:\Users\You\Documents\Notes
```

---

## ⚙️ First-Time Configuration

### Step 1: Choose Your AI Provider

You have three options:

#### Option A: OpenAI (GPT-4)
- **Pros:** Most powerful, best results
- **Cons:** Costs money (~$0.01-0.10 per conversation), requires internet
- **Setup:** Get API key from [platform.openai.com](https://platform.openai.com/)

#### Option B: Anthropic (Claude)
- **Pros:** Strong performance, good at reasoning
- **Cons:** Costs money, requires internet
- **Setup:** Get API key from [console.anthropic.com](https://console.anthropic.com/)

#### Option C: Ollama (Local AI)
- **Pros:** FREE, completely private, works offline
- **Cons:** Slower, requires good hardware (8GB+ RAM)
- **Setup:** Install from [ollama.ai](https://ollama.ai/), then:
  ```bash
  # Pull a model (e.g., mistral)
  ollama pull mistral
  ```

### Step 2: Start the Application

```bash
# From the sbf-app directory
npm run dev
```

The application will:
1. Ask for your vault path
2. Ask for your AI provider and API key
3. Start the file watcher
4. Open the chat interface

**First Run Example:**
```
Enter vault path: C:\Users\You\SecondBrainFoundation\vault
Enter OpenAI API key: sk-proj-...
✅ Second Brain Foundation initialized successfully!
```

---

## 📝 Your First Day

### 1. Create Your First Daily Note

Daily notes are where you capture everything. Create one in your vault:

**File:** `vault/Daily/2025-11-15.md`

```markdown
# November 15, 2025

## Morning
Started learning Second Brain Foundation. It's like Obsidian but with AI.

Met with [[Sarah Chen]] about the [[Product Launch Project]].
Key decisions:
- Launch date: December 1st
- Target market: Small business owners
- Budget: $50,000

## Ideas
Progressive organization is interesting - capture now, organize later.
Reminds me of GTD's "capture everything" principle.

## Tasks
- [ ] Review project timeline
- [ ] Schedule team meeting
- [ ] Research competitors
```

### 2. Save and Watch It Process

When you save this file, Second Brain Foundation will:

1. **Detect** the file change
2. **Analyze** the content
3. **Suggest** creating entities:
   - Person: Sarah Chen
   - Project: Product Launch Project
4. **Add** these suggestions to the **Queue** for your approval

### 3. Review the Queue

Open the Second Brain app (running from `npm run dev`) and you'll see the Queue panel on the right.

**You'll see items like:**
```
📄 2025-11-15.md
Action: Create Entity
Suggested: Person - Sarah Chen
Reason: Mentioned in context of project meeting

[Approve] [Reject]
```

### 4. Approve or Reject

- **Approve**: Creates `vault/People/sarah-chen.md` with metadata
- **Reject**: Ignores the suggestion

### 5. Chat with Your Knowledge

Use the chat interface to ask questions:

**You:** "What's the budget for the Product Launch Project?"

**AI:** Based on your note from November 15, 2025, the budget for the Product Launch Project is $50,000.

---

## 🔄 Your Daily Workflow

### Morning Capture (5-10 minutes)
1. Create or open today's daily note
2. Brain dump everything: meetings, ideas, tasks, observations
3. Use `[[Entity Name]]` to reference people, projects, topics
4. Save and let the AI process it

### Midday Review (5 minutes)
1. Check the Queue panel
2. Approve relevant entity suggestions
3. Reject noise or duplicates

### Evening Synthesis (10-15 minutes)
1. Ask the AI: "What did I work on today?"
2. Review created entities
3. Add any additional connections
4. Plan tomorrow

### Weekly Review (30 minutes)
1. Browse your entities in the Entity Browser
2. Look for patterns and connections
3. Archive or merge duplicate entities
4. Reflect on insights

---

## 💡 Tips for Success

### Use Wikilinks Liberally
```markdown
Met with [[John Doe]] about [[AI Project]].
We discussed [[Machine Learning]] and [[Data Privacy]].
```

Every `[[name]]` becomes a potential entity. Don't overthink it!

### Start Simple
- Week 1: Just capture in daily notes
- Week 2: Start approving entity suggestions
- Week 3: Explore the entity browser
- Week 4: Start using chat to query your knowledge

### Trust the Process
It might feel chaotic at first. That's okay! Progressive organization means:
1. Capture messily
2. Organize gradually
3. Connections emerge naturally

### Customize for Your Needs
- Adjust AI temperature for creativity vs. precision
- Create custom entity types
- Develop your own capture templates

---

## 🎓 Common Use Cases

### 1. Meeting Notes
```markdown
# Meeting: Product Strategy - November 15, 2025

**Attendees:** [[Alice Johnson]], [[Bob Smith]], [[Carol White]]
**Project:** [[Product Launch]]

## Discussion
- Reviewed Q4 targets
- Decided on pricing strategy
- Assigned action items

## Action Items
- [ ] [[Alice Johnson]]: Finalize pricing by Nov 20
- [ ] [[Bob Smith]]: Create marketing plan
```

### 2. Research Notes
```markdown
# Article: The Future of AI

**Source:** [[Nature Journal]]
**Author:** [[Dr. Jane Smith]]
**Topic:** [[Artificial Intelligence]], [[Ethics]]

## Key Points
- AI alignment is critical
- Need for interpretability
- Related to [[Machine Learning]] and [[Neural Networks]]

## My Thoughts
This connects to my work on [[AI Project]].
Should discuss with [[John Doe]].
```

### 3. Project Planning
```markdown
# Project: Website Redesign

**Status:** Planning
**Team:** [[Design Team]], [[Dev Team]]
**Budget:** $30,000
**Timeline:** 8 weeks

## Goals
- Improve conversion by 20%
- Faster load times
- Better mobile experience

## Related
- [[User Research Project]]
- [[Brand Guidelines]]
```

---

## 🔧 Troubleshooting

### The app won't start

**Check Node version:**
```bash
node --version  # Must be 18+
```

**Reinstall dependencies:**
```bash
cd Extraction-01/03-integration/sbf-app
rm -rf node_modules package-lock.json
npm install
```

### Queue items aren't appearing

1. Make sure the file watcher is running
2. Check that you saved the file
3. Verify your vault path is correct
4. Look for errors in the terminal

### AI isn't responding

1. **OpenAI/Anthropic:** Check your API key is valid
2. **Ollama:** Make sure Ollama is running (`ollama list`)
3. Check your internet connection (if using cloud AI)
4. Look at terminal for error messages

### Wikilinks aren't working

Wikilinks work as `[[Entity Name]]`:
- ✅ `[[John Doe]]`
- ✅ `[[AI Project]]`
- ❌ `[John Doe]` (single brackets don't work)
- ❌ `{{John Doe}}` (wrong syntax)

---

## 📚 Next Steps

Now that you're set up, explore:

1. **[Developer Guide](./developer-guide.md)** - If you want to contribute
2. **[API Documentation](./api-documentation.md)** - If you want to integrate
3. **[Troubleshooting Guide](./troubleshooting.md)** - For common issues
4. **[Entity Types Reference](../07-reference/entity-types.md)** - All entity types explained

---

## 💬 Getting Help

### Community Support
- **GitHub Discussions:** Ask questions, share ideas
- **GitHub Issues:** Report bugs or request features
- **Discord** (coming soon): Real-time chat with the community

### Self-Help
1. Check the [Troubleshooting Guide](./troubleshooting.md)
2. Search existing GitHub issues
3. Review the documentation

### Before Asking for Help
Please include:
- Your operating system
- Node.js version
- Error messages (copy from terminal)
- Steps to reproduce the issue

---

## 🎉 Welcome to the Community!

You're now part of the Second Brain Foundation community! Here's how to get involved:

- ⭐ **Star the repo** on GitHub
- 📢 **Share** your experience
- 🐛 **Report bugs** you find
- 💡 **Suggest features** you'd love
- 📝 **Contribute** documentation improvements
- 💻 **Submit** pull requests

---

**Happy knowledge building!** 🧠✨

**Questions?** See [Troubleshooting](./troubleshooting.md) or ask in GitHub Discussions.

**Want to contribute?** Read [CONTRIBUTING.md](../../CONTRIBUTING.md).

---

*Last updated: November 15, 2025*
