# Second Brain Foundation

**An open-source framework for AI-augmented personal knowledge management that respects your privacy and works with your favorite tools.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Community](https://img.shields.io/badge/Join-Community-blue)](https://github.com/SecondBrainFoundation/second-brain-foundation/discussions)

---

## 🧠 What is Second Brain Foundation?

Second Brain Foundation is an **open-source framework** (not a product) that enables **progressive organization** of your personal knowledge. Unlike traditional note-taking systems that force you to decide how to organize information upfront, Second Brain Foundation mirrors how humans naturally think:

1. **Capture** freely without organizational overhead
2. **Connect** ideas as relationships become clear  
3. **Structure** automatically into your knowledge base

### The Problem We're Solving

Current personal knowledge management (PKM) tools force you to choose:
- **Manual organization** (Obsidian, Logseq) - powerful but tedious
- **AI convenience** (Notion AI, Capacities) - easy but sacrifices privacy and portability

**You shouldn't have to choose between intelligent organization and data sovereignty.**

---

## ✨ Core Principles

### 🌱 Progressive Organization
Your notes organize themselves as you learn, not before you're ready. The framework implements a natural lifecycle: daily capture → entity connections → permanent structure.

### 🔒 Context-Aware Privacy
**First-of-its-kind**: Tiered sensitivity levels with granular AI permissions. Choose which notes can be processed by cloud AI vs local AI vs kept completely private.

### 🔗 Tool-Agnostic Architecture
Use your favorite tools together. Pure markdown + frontmatter metadata means your knowledge works with Obsidian, NotebookLM, AnythingLLM, or any markdown editor.

### 🏗️ Framework, Not Application
We provide specifications, templates, and reference implementations. The community builds the tools.

### 🌍 Community-Owned
No company to sell out or shut down. Permissive license (MIT). Your contributions belong to everyone.

---

## 🎯 Key Features

### MVP (Available Now - Specifications)
- ✅ **Hierarchical folder structure** for human browsing
- ✅ **Entity templates** (People, Places, Topics, Projects) with UID-based relationships
- ✅ **Sensitivity metadata schema** for context-aware privacy
- ✅ **48-hour lifecycle specification** for progressive organization
- ✅ **Multi-tool compatibility** by design (Obsidian, NotebookLM, AnythingLLM)
- ✅ **Comprehensive documentation** and examples

### Phase 2 (Roadmap - AEI Implementation)
- 🔄 **AI-Enabled Interface (AEI)** - chat-based organization assistant
- 🔄 **Entity extraction** from natural language
- 🔄 **Relationship detection** and knowledge graph building
- 🔄 **Local AI support** (Ollama, LMStudio) as first-class citizen
- 🔄 **Cloud AI integration** (OpenAI, Anthropic) with privacy controls
- 🔄 **Voice transcript processing** with automated entity extraction

---

## 🚀 Quick Start

### 1. Clone the Framework

```bash
git clone https://github.com/SecondBrainFoundation/second-brain-foundation.git
cd second-brain-foundation
```

### 2. Set Up Your Knowledge Base

```bash
# Copy the base structure to your notes folder
cp -r packages/core/structure/* ~/my-second-brain/

# Or manually create folders:
mkdir -p ~/my-second-brain/{Daily,People,Places,Topics,Projects,Transitional}
```

### 3. Start Capturing

Create your first daily note:

```bash
# ~/my-second-brain/Daily/2025-11-02.md
---
uid: daily-2025-11-02
type: daily-note
created_at: 2025-11-02T08:00:00Z
lifecycle_state: captured
---

# November 2, 2025

Met with [[John Smith]] about the [[AI Research Project]] at [[Downtown Coffee]].

Key insights:
- Progressive organization mirrors human cognition
- Privacy-aware AI is essential for knowledge work
- Tool interoperability reduces vendor lock-in
```

### 4. Create Your First Entity

```bash
# ~/my-second-brain/People/john-smith.md
---
uid: person-john-smith-001
type: person
name: John Smith
created_at: 2025-11-02T08:30:00Z
modified_at: 2025-11-02T08:30:00Z
relationships:
  - uid: project-ai-research-001
    type: collaborates_with
  - uid: daily-2025-11-02
    type: mentioned_in
sensitivity: personal
context_permissions:
  cloud_ai_allowed: false
  local_ai_allowed: true
---

# John Smith

## Overview
Research collaborator focusing on AI and knowledge management.

## Interactions
- 2025-11-02: Discussed progressive organization at [[Downtown Coffee]]

## Related Content
- [[AI Research Project]]
- [[Downtown Coffee]]
```

---

## 📖 Documentation

- **[Getting Started Guide](docs/getting-started.md)** - 15-minute setup
- **[Core Concepts](docs/concepts.md)** - Progressive organization explained
- **[Entity Templates](packages/core/templates/)** - People, Places, Topics, Projects
- **[Privacy Model](docs/privacy-model.md)** - Context-aware sensitivity controls
- **[Multi-Tool Usage](docs/cross-tool-usage.md)** - Using with Obsidian, NotebookLM, etc.
- **[Algorithm Specifications](packages/core/algorithms/)** - Entity extraction, relationship detection
- **[Examples](examples/)** - Sample note collections
- **[CLI Tools Guide](docs/CLI-SCAFFOLDING-GUIDE.md)** - Command-line interface implementation
- **[Full Architecture](docs/architecture.md)** - Technical specification for Phase 2

---

## 🌟 Why Second Brain Foundation?

### For Privacy-Conscious Users
- **Local-first by default** - your data never leaves your machine unless you choose
- **Context-aware privacy** - granular control over what AI sees
- **No vendor lock-in** - pure markdown, works everywhere forever

### For AI Enthusiasts
- **Best of both worlds** - local AI for sensitive data, cloud AI for convenience
- **Progressive automation** - organization happens as you're ready, not forced
- **Multiple LLM support** - OpenAI, Anthropic, Ollama, LMStudio

### For Tool Lovers
- **Use any markdown editor** - Obsidian, VS Code, Typora, etc.
- **Multi-tool workflows** - designed for using tools together, not choosing one
- **Plugin-friendly** - framework enables tool-specific implementations

### For Open-Source Advocates
- **Truly open** - MIT license, no CLA, community-owned
- **Transparent development** - public roadmap, RFCs for major changes
- **Forkable by design** - adapt it to your needs

---

## 🤝 Community & Contributions

We're building this in public. Everyone is welcome to contribute!

### Get Involved

- **[Discussions](https://github.com/SecondBrainFoundation/second-brain-foundation/discussions)** - Ask questions, share ideas
- **[Issues](https://github.com/SecondBrainFoundation/second-brain-foundation/issues)** - Report bugs, request features  
- **[Pull Requests](CONTRIBUTING.md)** - Contribute code, docs, examples
- **[Discord](https://discord.gg/second-brain-foundation)** - Real-time community chat
- **[Reddit](https://reddit.com/r/SecondBrainFoundation)** - Longer discussions and showcases

### Ways to Contribute

- 📝 **Documentation** - Improve guides, fix typos, add examples
- 🎨 **Templates** - Create entity templates for new domains
- 🔧 **Implementations** - Build plugins, integrations, tools
- 🧪 **Testing** - Try the framework, report compatibility issues
- 💡 **Ideas** - Share use cases, suggest improvements
- 🎓 **Education** - Write tutorials, create videos, teach others

**See [CONTRIBUTING.md](CONTRIBUTING.md) for details.**

---

## 🗺️ Roadmap

### ✅ Phase 0: Foundation (Current)
- Specifications and documentation
- Entity templates and metadata schemas
- Folder structure and organization rules
- Multi-tool compatibility validation

### 🔄 Phase 1: Reference Implementation (Q1 2026)
- Basic CLI tools for entity creation
- Frontmatter validation and linting
- Relationship link checking
- Example note collections

### 🔮 Phase 2: AI-Enabled Interface (Q2-Q3 2026)
- Local service/daemon for file watching
- Entity extraction from daily notes
- Relationship detection and suggestions
- Progressive organization automation
- Local AI integration (Ollama, LMStudio)

### 🚀 Phase 3: Ecosystem (Q4 2026+)
- Plugin system for extensibility
- Obsidian plugin implementation
- VS Code extension (Foam integration)
- Web interface for AEI chat
- Community template marketplace

**Detailed roadmap:** [ROADMAP.md](ROADMAP.md)

---

## 🔬 Research & Background

This framework emerged from research on personal knowledge management, cognitive science, and AI augmentation:

- **[Brainstorming Session](docs/brainstorming-session-results.md)** - Initial ideation
- **[Project Brief](docs/project-brief.md)** - Vision and goals
- **[PRD](docs/prd.md)** - Detailed requirements
- **[Competitive Analysis](docs/competitor-analysis.md)** - Market positioning
- **[Open-Source Research](docs/open-source-research.md)** - Similar projects

### Related Projects

We're inspired by and complementary to:
- **[Obsidian](https://obsidian.md)** - Excellent markdown editor
- **[Logseq](https://logseq.com)** - Open-source outliner approach
- **[Athens Research](https://github.com/athensresearch/athens)** - Knowledge graph focus
- **[Foam](https://foambubble.github.io/foam/)** - VS Code integration
- **[Quivr](https://github.com/StanGirard/quivr)** - AI-powered querying
- **[BMAD Method](https://github.com/bmad-method/bmad-method)** - Agent-based workflows

---

## 📊 Project Status

**Current Phase:** MVP Specifications & Documentation  
**Version:** 0.1.0-alpha  
**Status:** Early development, seeking collaborators  

### What Works Now
✅ Complete specifications and documentation  
✅ Entity templates ready to use  
✅ Example note structures  
✅ Multi-tool compatibility validated  

### What's Coming Soon
🔄 CLI tools for validation and entity creation  
🔄 Automated testing framework  
🔄 Reference implementation with basic AEI  

---

## 💬 Philosophy

### Progressive, Not Perfect

We believe knowledge organization should evolve with understanding, not require perfect foresight. The framework supports:
- **Rough capture** → No organization decisions needed upfront
- **Gradual refinement** → Connections emerge as you learn
- **Natural structure** → Files organize when relationships are clear

### Privacy by Design

Your data sovereignty is non-negotiable:
- **Local-first** - works completely offline
- **Transparent** - you know exactly what AI sees
- **Portable** - pure markdown, no lock-in
- **Auditable** - change tracking shows all modifications

### Community Over Company

This is a **public good**, not a product:
- No company to sell or shut down
- Contributions belong to everyone
- Forks are features, not threats
- Success = community adoption, not revenue

---

## 🔧 Technical Architecture

### Markdown + Frontmatter

Pure markdown with YAML frontmatter for metadata:

```yaml
---
uid: unique-identifier
type: person|place|topic|project|daily-note
created_at: ISO-8601 timestamp
modified_at: ISO-8601 timestamp
lifecycle_state: captured|transitional|permanent|archived
relationships:
  - uid: related-entity-uid
    type: relationship-type
sensitivity: public|personal|confidential|secret
context_permissions:
  cloud_ai_allowed: boolean
  local_ai_allowed: boolean
  export_allowed: boolean
custom_fields:
  key: value
---
```

### Folder Structure

```
your-second-brain/
├── Daily/              # Date-anchored capture (YYYY-MM-DD.md)
├── People/             # Person entities
├── Places/             # Location entities (physical, virtual, conceptual)
├── Topics/             # Subject matter entities
├── Projects/           # Goal-oriented entities
├── Transitional/       # Notes awaiting entity assignment
└── .sbf-tracking/      # Change detection metadata (optional)
```

### Entity System

Entities are the fundamental units:
- **UID-based** - unique identifiers enable reliable relationships
- **Typed** - person, place, topic, project (extensible)
- **Connected** - relationships form knowledge graph
- **Privacy-aware** - sensitivity and permissions per entity

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

**TL;DR:** Use it, modify it, share it, build on it. No restrictions.

---

## 🙏 Acknowledgments

Inspired by decades of research and practice:
- **Niklas Luhmann** - Zettelkasten methodology
- **Tiago Forte** - PARA method and Building a Second Brain
- **Andy Matuschak** - Evergreen notes and thinking tools
- **Obsidian Community** - Plugin ecosystem and best practices
- **BMAD Method** - Agent-based workflow frameworks
- **PKM Community** - Countless discussions, ideas, and feedback

---

## 📣 Stay Connected

- **Website:** [secondbrainfoundation.org](https://secondbrainfoundation.org) (coming soon)
- **GitHub:** [@SecondBrainFoundation](https://github.com/SecondBrainFoundation)
- **Discord:** [Join our community](https://discord.gg/second-brain-foundation)
- **Reddit:** [r/SecondBrainFoundation](https://reddit.com/r/SecondBrainFoundation)
- **Twitter/X:** [@2ndBrainFound](https://twitter.com/2ndBrainFound)

---

## ⭐ Show Your Support

If Second Brain Foundation helps you or aligns with your values:
- ⭐ **Star this repository** - helps others discover the project
- 🔗 **Share it** - spread the word in PKM communities
- 💬 **Contribute** - documentation, code, ideas all welcome
- 🎓 **Teach** - create tutorials, write blog posts, make videos

---

<p align="center">
  <strong>Built by the community, for the community.</strong><br>
  <em>Your second brain should be yours forever.</em>
</p>

<p align="center">
  <a href="docs/getting-started.md">Get Started</a> •
  <a href="CONTRIBUTING.md">Contribute</a> •
  <a href="https://github.com/SecondBrainFoundation/second-brain-foundation/discussions">Discussions</a>
</p>
