# BMAD-METHOD Prerequisites - Complete Setup Documentation

## 📋 Documentation Index

This workspace now includes comprehensive guides for installing and using BMAD-METHOD v6. Start here!

### 1. **BMAD-QUICK-REFERENCE.md** 🚀 START HERE
- **Size**: 4.5 KB
- **Purpose**: Quick one-page reference for installation
- **Best for**: Getting started immediately
- **Contains**: 5-step quick start, essential links, troubleshooting

### 2. **BMAD-PREREQUISITES-SUMMARY.md** 📊 COMPREHENSIVE OVERVIEW  
- **Size**: 8.5 KB
- **Purpose**: Executive summary with detailed breakdown
- **Best for**: Understanding the full picture
- **Contains**: System status, requirements, roadmap, resources

### 3. **BMAD-METHOD-PREREQUISITES.md** 📚 DETAILED GUIDE
- **Size**: 5.8 KB
- **Purpose**: In-depth documentation of all prerequisites
- **Best for**: Reference during installation
- **Contains**: Complete dependency lists, detailed requirements, troubleshooting

### 4. **BMAD-INSTALLATION-CHECKLIST.md** ✅ STEP-BY-STEP
- **Size**: 6.1 KB
- **Purpose**: Interactive checklist for installation phases
- **Best for**: Following along during setup
- **Contains**: Organized phases, verification steps, post-installation setup

### 5. **install-bmad-prerequisites.ps1** 🔍 VERIFICATION SCRIPT
- **Size**: 6.7 KB
- **Purpose**: Automated system verification
- **Best for**: Checking what's installed
- **Usage**: `powershell -ExecutionPolicy Bypass -File .\install-bmad-prerequisites.ps1`

---

## 🎯 Quick Navigation

### I want to...

**...get started immediately** → Read [BMAD-QUICK-REFERENCE.md](BMAD-QUICK-REFERENCE.md)

**...understand everything first** → Read [BMAD-PREREQUISITES-SUMMARY.md](BMAD-PREREQUISITES-SUMMARY.md)

**...follow a detailed checklist** → Use [BMAD-INSTALLATION-CHECKLIST.md](BMAD-INSTALLATION-CHECKLIST.md)

**...know about all dependencies** → See [BMAD-METHOD-PREREQUISITES.md](BMAD-METHOD-PREREQUISITES.md)

**...verify my system setup** → Run `install-bmad-prerequisites.ps1`

---

## ✅ Current Status - FULLY OPERATIONAL

```
System Prerequisites:
  ✅ Node.js             INSTALLED (v24.12.0, Required: >= 20.0.0)
  ✅ npm                 INSTALLED (v11.6.2)
  ✅ pnpm                INSTALLED and configured
  ✅ Git                 INSTALLED (v2.52.0)
  ✅ BMAD-METHOD         INSTALLED (v4.44.3)
```

---

## ⚡ 5-Minute Quick Start

1. **Download Node.js** → https://nodejs.org/ (v20 LTS)
2. **Install** → Run installer, restart PowerShell
3. **Verify** → Run verification script:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\install-bmad-prerequisites.ps1
   ```
4. **Install BMAD-METHOD**:
   ```powershell
   npx bmad-method install
   ```
5. **Initialize**:
   ```powershell
   bmad-method init
   ```

---

## 📚 What Is BMAD-METHOD?

**BMAD-METHOD** stands for "Breakthrough Method of Agile AI-driven Development"

### Key Features:
- ✅ **19 Specialized Agents** (PM, Architect, Developer, UX, QA, etc.)
- ✅ **50+ Guided Workflows** (Analysis → Planning → Solutioning → Implementation)
- ✅ **4 Official Modules** (BMM, BMB, CIS, AI/Data)
- ✅ **Custom Content Creation** (Build your own agents and workflows)
- ✅ **IDE Integration** (VS Code, Cursor, Windsurf)
- ✅ **Production Ready** (v6 Alpha, near-beta quality)

### What You Get:
- Complete development lifecycle guidance
- AI-powered specialized agents for different roles
- Visual workflows and decision trees
- Custom module and agent creation tools
- Community support and resources

---

## 🔧 System Requirements

### Absolute Minimum
- Node.js >= 20.0.0
- npm (included with Node.js)
- 500 MB free disk space

### Recommended Setup
- Node.js 20.x or 22.x LTS
- pnpm (for better workspace management)
- Git (for version control)
- 2 GB free disk space

### Optional
- VS Code + GitHub Copilot (or Cursor/Windsurf)
- Docker (for containerized development)
- Python (for some aei-core features)

---

## 🎓 Learning Path

### After Installation (In Order):

1. **Load BMAD Agent**
   - In your IDE, load any BMAD agent
   - Start with "Universal Agent"

2. **Run Workflow Init**
   - Use command: `*workflow-init`
   - Or: `bmad-method init`

3. **Choose Your Track**
   - ⚡ Quick Flow (5 min - bug fixes)
   - 📋 BMad Method (15 min - features)
   - 🏢 Enterprise (30 min - platforms)

4. **Follow Guided Workflow**
   - Analysis phase (optional)
   - Planning phase
   - Solutioning phase
   - Implementation phase

5. **Customize & Extend**
   - Create custom agents
   - Build custom workflows
   - Share via community marketplace

---

## 📦 Included Dependencies

BMAD-METHOD v6.0.0-alpha.21 includes **25+ runtime dependencies**:

**Core Tools:**
- `commander` - CLI framework
- `chalk` - Colored output
- `figlet` - ASCII art banners
- `inquirer` - Interactive prompts
- `ora` - Spinners

**File/Data Handling:**
- `fs-extra` - Enhanced file operations
- `yaml`, `js-yaml` - YAML parsing
- `xml2js` - XML parsing
- `csv-parse` - CSV parsing
- `glob` - File pattern matching

**Utilities:**
- `boxen` - Styled boxes
- `semver` - Version comparison
- `wrap-ansi` - Text wrapping
- And 10+ more...

All installed automatically via `npx bmad-method install`

---

## 🆘 Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| "node not recognized" | Install Node.js from nodejs.org/, restart PowerShell |
| "npx not found" | Ensure Node.js >= 14.x, run `npm install -g npm@latest` |
| BMAD install fails | Clear cache: `npm cache clean --force`, try again |
| Permission denied | Use: `powershell -ExecutionPolicy Bypass ...` |
| pnpm not found | Restart PowerShell completely after installation |
| Windows Defender warning | Allow Node.js installer to run, it's safe (Microsoft signed) |

---

## 🔗 Essential Links

| Resource | Purpose | Link |
|----------|---------|------|
| **Node.js** | JavaScript runtime | https://nodejs.org/ |
| **BMAD Repo** | Source code | https://github.com/bmad-code-org/BMAD-METHOD |
| **BMAD Docs** | Full documentation | https://github.com/bmad-code-org/BMAD-METHOD/docs |
| **Quick Start** | Getting started guide | https://github.com/bmad-code-org/BMAD-METHOD/blob/main/docs/modules/bmm-bmad-method/quick-start.md |
| **Discord** | Community help | https://discord.gg/gk8jAdXWmj |
| **YouTube** | Video tutorials | https://www.youtube.com/c/BMadCode |
| **NPM Package** | Package info | https://www.npmjs.com/package/bmad-method |

---

## ✅ Pre-Installation Checklist

- [ ] Have Windows PowerShell or PowerShell Core
- [ ] Have admin access (to install Node.js globally)
- [ ] Have 500 MB+ free disk space
- [ ] Have internet connection
- [ ] Have an IDE (VS Code, Cursor, Windsurf, or ChatGPT)

---

## 📝 Installation Log Template

Use this to track your installation:

```
Installation Date: _______________
Start Time: _______________

Phase 1: Prerequisites
  [ ] Node.js downloaded
  [ ] Node.js installed
  [ ] PowerShell restarted
  [ ] node --version works
  [ ] npm --version works
  Time: _______

Phase 2: Optional Setup
  [ ] pnpm installed
  [ ] Workspace dependencies installed
  Time: _______

Phase 3: BMAD-METHOD
  [ ] npx bmad-method install started
  [ ] Configuration prompts answered
  [ ] Installation completed
  [ ] bmad-method --version works
  Time: _______

Phase 4: Initialization
  [ ] bmad-method init completed
  [ ] Track selected
  [ ] Configuration saved
  Time: _______

Total Time: _______
```

---

## 🎉 Success Indicators

You'll know everything is working when:

✅ `node --version` shows v20.x.x or higher  
✅ `npm --version` shows a version  
✅ `npx bmad-method --version` shows the BMAD version  
✅ `bmad-method init` runs without errors  
✅ You can load a BMAD agent in your IDE  
✅ `*workflow-init` command works in your IDE  

---

## 🤝 Getting Help

1. **Check Documentation**: See guides listed above
2. **Run Verification Script**: `install-bmad-prerequisites.ps1`
3. **Visit Discord**: https://discord.gg/gk8jAdXWmj
4. **Check GitHub Issues**: https://github.com/bmad-code-org/BMAD-METHOD/issues
5. **Watch Videos**: https://www.youtube.com/c/BMadCode

---

## 📊 Workspace Statistics

- **Total Documentation**: 5 files, ~31 KB
- **Guides Created**: Comprehensive, checklist, quick-ref
- **Verification Script**: Automated system check
- **Git Status**: Already installed ✅
- **Time to Setup**: ~15 minutes

---

## 🔐 Security Notes

- All downloads from official sources (nodejs.org, npmjs.com)
- MIT Licensed (open source)
- 26k+ GitHub stars (community vetted)
- No malicious dependencies
- Safe for Windows (Microsoft signed installers)

---

## 🚀 Next Steps

### Right Now:
1. Read [BMAD-QUICK-REFERENCE.md](BMAD-QUICK-REFERENCE.md)
2. Download Node.js from https://nodejs.org/

### Then:
3. Install Node.js
4. Run verification script
5. Install BMAD-METHOD
6. Initialize your project

### Finally:
7. Load BMAD agent in your IDE
8. Run `*workflow-init`
9. Choose your development track
10. Start building!

---

## 📞 Contact & Support

- **GitHub**: https://github.com/bmad-code-org/BMAD-METHOD
- **Discord**: https://discord.gg/gk8jAdXWmj
- **Twitter/X**: @BMadCode
- **Email**: Via GitHub issues
- **Community**: Active and helpful

---

**Status**: Ready for Node.js installation phase  
**Estimated Setup Time**: 15-20 minutes  
**Current Blockers**: None (documentation complete)  

**Created**: December 29, 2025  
**Location**: `c:\.Projects\2BF\`  
**Total Size**: ~31 KB of documentation  

---

## Document Files

| File | Size | Purpose |
|------|------|---------|
| BMAD-QUICK-REFERENCE.md | 4.5 KB | Quick start guide |
| BMAD-PREREQUISITES-SUMMARY.md | 8.5 KB | Comprehensive overview |
| BMAD-METHOD-PREREQUISITES.md | 5.8 KB | Detailed requirements |
| BMAD-INSTALLATION-CHECKLIST.md | 6.1 KB | Step-by-step guide |
| install-bmad-prerequisites.ps1 | 6.7 KB | Verification script |
| **Total** | **31.6 KB** | **Complete documentation** |

---

**Start with**: [BMAD-QUICK-REFERENCE.md](BMAD-QUICK-REFERENCE.md)  
**Then follow**: [BMAD-INSTALLATION-CHECKLIST.md](BMAD-INSTALLATION-CHECKLIST.md)

Happy building! 🚀
