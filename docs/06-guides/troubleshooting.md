# Troubleshooting Guide

Having issues with Second Brain Foundation? This guide covers common problems and their solutions.

---

## 📖 Table of Contents

- [Installation Issues](#installation-issues)
- [Runtime Issues](#runtime-issues)
- [Configuration Issues](#configuration-issues)
- [UI Issues](#ui-issues)
- [File Watcher Issues](#file-watcher-issues)
- [Entity Management Issues](#entity-management-issues)
- [AI/LLM Issues](#aillm-issues)
- [Performance Issues](#performance-issues)
- [Error Messages Reference](#error-messages-reference)
- [Getting Help](#getting-help)

---

## 🔧 Installation Issues

### Node.js Version Incompatible

**Problem:** `error: Unsupported Node.js version`

**Solution:**
```bash
# Check your Node version
node --version

# Should be 18.0.0 or higher
# If not, download from https://nodejs.org/
```

**Fix:**
1. Download Node.js 18+ from [nodejs.org](https://nodejs.org/)
2. Install and restart your terminal
3. Verify with `node --version`
4. Try `npm install` again

---

### npm/pnpm Not Found

**Problem:** `'npm' is not recognized as an internal or external command`

**Solution:**
```bash
# Node.js includes npm, reinstall Node.js
# Download from https://nodejs.org/

# After install, restart terminal and verify
npm --version
```

---

### Dependency Installation Failures

**Problem:** `npm install` fails with errors

**Common Causes:**
1. **Network issues** - Check internet connection
2. **Permission errors** - Run without `sudo` (don't use admin on Windows)
3. **Corrupted cache** - Clear npm cache
4. **Old lockfile** - Delete and regenerate

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and lockfile
rm -rf node_modules package-lock.json  # Mac/Linux
# or
Remove-Item -Recurse -Force node_modules, package-lock.json  # Windows

# Reinstall
npm install
```

**Still failing?** Try:
```bash
# Use legacy peer deps
npm install --legacy-peer-deps

# Or use specific registry
npm install --registry=https://registry.npmjs.org/
```

---

### Python Version Issues (if using Python backend)

**Problem:** `Python 3.8+ required`

**Solution:**
```bash
# Check Python version
python --version  # or python3 --version

# Should be 3.8 or higher
# If not, download from https://www.python.org/
```

---

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
# Mac/Linux:
lsof -i :3000

# Windows:
netstat -ano | findstr :3000

# Kill the process
# Mac/Linux:
kill -9 <PID>

# Windows:
taskkill /PID <PID> /F

# Or use a different port
PORT=3001 npm run dev
```

---

## 🏃 Runtime Issues

### Application Won't Start

**Problem:** `npm run dev` fails or hangs

**Checklist:**
1. ✅ Node.js 18+ installed?
2. ✅ Dependencies installed? (`npm install`)
3. ✅ Correct directory? (should be in `sbf-app/`)
4. ✅ No port conflicts? (port 3000 available)

**Solution:**
```bash
# Verify you're in the right directory
cd Extraction-01/03-integration/sbf-app
pwd  # Should end with sbf-app

# Clean install
rm -rf node_modules package-lock.json
npm install

# Try starting again
npm run dev
```

---

### Agent Not Responding

**Problem:** Chat interface doesn't respond or times out

**Possible Causes:**
1. **No API key configured** - Check settings
2. **Invalid API key** - Verify key is correct
3. **Network issues** - Check internet connection
4. **Ollama not running** - If using local AI
5. **Rate limiting** - Exceeded API quota

**Solution:**
```bash
# Check API key is set
# Look in app settings or environment variables

# For OpenAI:
echo $OPENAI_API_KEY  # Should show sk-...

# For Ollama (local):
ollama list  # Should show installed models
ollama serve  # Make sure it's running

# Test connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

### File Watcher Not Detecting Changes

**Problem:** Saving files doesn't trigger queue items

**Checklist:**
1. ✅ File watcher started? (should see "Watching..." in console)
2. ✅ Correct vault path? (check settings)
3. ✅ File in vault directory?
4. ✅ File is `.md` extension?

**Solution:**
```bash
# Check vault path in app settings
# Default: /path/to/vault

# Verify file watcher is running
# You should see console logs when files change

# Restart file watcher
# Stop app (Ctrl+C) and restart
npm run dev
```

**Windows-specific:**
If on Windows and watcher doesn't work:
```bash
# Increase watcher limit
npm install --save-dev chokidar

# Or use polling mode (slower but more reliable)
# Edit watcher config to enable polling
```

---

### Queue Items Not Appearing

**Problem:** Files change but no suggestions appear

**Possible Causes:**
1. **File not analyzed** - AI didn't process it
2. **No wikilinks found** - File has no `[[links]]`
3. **Auto-approve enabled** - Items approved automatically
4. **Queue cleared** - Previous items dismissed

**Solution:**
```bash
# Check file has wikilinks
# Example: [[Person Name]] or [[Project Name]]

# Check auto-approve setting
# Settings → General → Auto-approve queue items

# Check console for errors
# Look for "Error processing file" messages

# Try creating a new file with obvious entities
# Example: Met with [[John Doe]] about [[AI Project]]
```

---

### Chat Messages Not Sending

**Problem:** Can't send messages in chat interface

**Checklist:**
1. ✅ Input field enabled? (not grayed out)
2. ✅ Agent initialized? (check console)
3. ✅ API key configured?
4. ✅ Network connection?

**Solution:**
```bash
# Check browser console (F12 → Console)
# Look for error messages

# Verify API configuration
# Settings → LLM Provider → Test Connection

# Try refreshing the page
# Ctrl+R or Cmd+R

# Check network tab for failed requests
# F12 → Network → look for red entries
```

---

## ⚙️ Configuration Issues

### Vault Path Not Found

**Problem:** `Error: Vault path does not exist`

**Solution:**
```bash
# Verify path exists
ls /path/to/your/vault  # Mac/Linux
dir C:\path\to\your\vault  # Windows

# Create vault if missing
mkdir -p /path/to/your/vault  # Mac/Linux
New-Item -ItemType Directory -Path "C:\path\to\vault"  # Windows

# Update vault path in settings
# Settings → General → Vault Path
```

---

### API Key Errors

**Problem:** `Invalid API key` or `Unauthorized`

**For OpenAI:**
```bash
# Verify key format (should start with sk-...)
# Check key at: https://platform.openai.com/api-keys

# Make sure billing is set up
# https://platform.openai.com/account/billing

# Test key:
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**For Anthropic:**
```bash
# Verify key format (should start with sk-ant-...)
# Check key at: https://console.anthropic.com/settings/keys

# Test key:
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":1024,"messages":[{"role":"user","content":"Hello"}]}'
```

**For Ollama:**
```bash
# Make sure Ollama is installed
ollama --version

# Check Ollama is running
ollama list

# Pull a model if needed
ollama pull mistral

# Test Ollama
curl http://localhost:11434/api/generate -d '{
  "model": "mistral",
  "prompt": "Hello"
}'
```

---

### Provider Connection Failures

**Problem:** Can't connect to AI provider

**OpenAI/Anthropic (Cloud):**
1. Check internet connection
2. Verify API key is correct
3. Check billing/quota limits
4. Try different network (firewall?)

**Ollama (Local):**
```bash
# Check Ollama is running
ps aux | grep ollama  # Mac/Linux
tasklist | findstr ollama  # Windows

# Start Ollama
ollama serve

# Check models installed
ollama list

# Test model
ollama run mistral "Hello"
```

---

## 🎨 UI Issues

### Chat Not Loading

**Problem:** Blank screen or loading forever

**Solution:**
```bash
# Clear browser cache
# Ctrl+Shift+Delete (Chrome/Edge)
# Cmd+Shift+Delete (Mac)

# Hard refresh
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)

# Check browser console for errors
# F12 → Console

# Try different browser
# Chrome, Firefox, Edge, Safari
```

---

### Markdown Not Rendering

**Problem:** Markdown shows as plain text

**Possible Causes:**
1. **react-markdown not installed**
2. **Component import error**
3. **CSS not loaded**

**Solution:**
```bash
# Reinstall markdown dependencies
npm install react-markdown remark-gfm

# Check console for import errors
# F12 → Console

# Restart dev server
npm run dev
```

---

### Entity Browser Blank

**Problem:** Entity browser shows no entities

**Checklist:**
1. ✅ Entities created? (check vault folder)
2. ✅ Vault path correct?
3. ✅ File permissions ok?

**Solution:**
```bash
# Check entities exist in vault
ls /path/to/vault/People  # Should show .md files
ls /path/to/vault/Projects

# Verify entities have valid frontmatter
cat /path/to/vault/People/john-doe.md
# Should have:
# ---
# uid: person-john-doe-001
# type: person
# ...
# ---

# Refresh entity list
# Click refresh button or reload page
```

---

### Dark Mode Issues

**Problem:** Dark mode not working or flickering

**Solution:**
```bash
# Check system theme
# Settings → Appearance → Theme

# Clear localStorage
# F12 → Application → Local Storage → Clear

# Force theme
# Settings → General → Theme → Select Dark/Light

# Check CSS loaded
# F12 → Network → Filter CSS
```

---

### Responsive Design Problems

**Problem:** UI broken on mobile or small screens

**Note:** Second Brain Foundation is optimized for desktop use. Mobile support is limited.

**Workaround:**
- Use on desktop/laptop (recommended)
- Rotate device to landscape
- Zoom out (Ctrl + minus)
- Use desktop mode in browser

---

## 📁 File Watcher Issues

### Files Not Being Watched

**Problem:** Changes to files not detected

**Solution:**
```bash
# Check file watcher output
# Should see "Watching: /path/to/vault"

# Increase file watcher limit (Linux/Mac)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Use polling mode (slower but more reliable)
# Edit watcher config: usePolling: true
```

---

### Too Many Files Warning

**Problem:** `Error: ENOSPC: System limit for number of file watchers reached`

**Solution (Linux):**
```bash
# Increase watcher limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Or temporarily
sudo sysctl fs.inotify.max_user_watches=524288
```

---

### Debounce Issues

**Problem:** File changes processed multiple times

**Solution:**
```bash
# Increase debounce delay
# Settings → Advanced → Debounce Delay → 3000ms

# Or edit config
# fileWatcher.debounceDelay = 3000
```

---

## 📝 Entity Management Issues

### Entities Not Created

**Problem:** Approved queue items don't create files

**Checklist:**
1. ✅ Write permissions? (can write to vault)
2. ✅ Valid entity data?
3. ✅ No file system errors?

**Solution:**
```bash
# Check write permissions
touch /path/to/vault/test.md  # Should succeed
rm /path/to/vault/test.md

# Check console for errors
# Look for "Error creating entity"

# Verify entity data
# Should have uid, type, title at minimum
```

---

### Duplicate Entities

**Problem:** Multiple entities with same name

**Solution:**
```bash
# Find duplicates
find /path/to/vault -name "*.md" -type f | sort | uniq -d

# Manually merge or delete duplicates
# Keep the one with most information

# Use unique IDs (uid) to prevent duplicates
# uid should be unique across vault
```

---

### Relationship Links Broken

**Problem:** `[[Entity Name]]` links don't work

**Checklist:**
1. ✅ Exact match? (case-sensitive)
2. ✅ Entity exists?
3. ✅ Valid wikilink syntax? (`[[Entity]]` not `[Entity]`)

**Solution:**
```bash
# Check entity exists
find /path/to/vault -name "*entity-name*"

# Verify wikilink syntax
# Correct: [[John Doe]]
# Wrong: [John Doe] or {{John Doe}}

# Refresh entity list
# Click refresh in entity browser
```

---

## 🤖 AI/LLM Issues

### Slow Response Times

**Problem:** AI takes too long to respond

**OpenAI/Anthropic:**
- Check internet speed
- Try different model (GPT-3.5 is faster)
- Reduce max tokens setting

**Ollama:**
```bash
# Use smaller/faster model
ollama pull mistral  # Faster than llama2:70b

# Check system resources
top  # CPU/RAM usage

# Use GPU acceleration if available
# Ollama uses GPU automatically if available
```

---

### Token Limit Errors

**Problem:** `Error: Maximum context length exceeded`

**Solution:**
```bash
# Reduce max tokens
# Settings → Advanced → Max Tokens → 2000

# Use fewer examples in prompts
# Clear conversation history

# Use more efficient model
# Claude Haiku (cheapest/fastest)
# GPT-3.5 Turbo
```

---

### Hallucinations or Incorrect Info

**Problem:** AI provides wrong information

**This is normal AI behavior:**
- AI can hallucinate or be wrong
- Always verify important information
- Use AI as assistant, not source of truth

**Improve accuracy:**
```bash
# Lower temperature
# Settings → Advanced → Temperature → 0.1-0.3

# Be more specific in prompts
# Ask for sources or reasoning

# Use Claude (better reasoning)
# Or GPT-4 (more accurate than 3.5)
```

---

## ⚡ Performance Issues

### High Memory Usage

**Problem:** App uses too much RAM

**Solution:**
```bash
# Close other applications
# Reduce max conversation turns
# Settings → Advanced → Max Turns → 5

# Restart app periodically
# Close and reopen

# Use lighter AI model
# Mistral vs Llama2:70b
```

---

### Slow File Operations

**Problem:** Creating entities is slow

**Possible Causes:**
1. **Large vault** - Many files
2. **Slow disk** - HDD vs SSD
3. **Antivirus scanning** - Files being scanned

**Solution:**
```bash
# Use SSD if possible
# Exclude vault from antivirus scanning

# Reduce batch size
# Settings → Advanced → Batch Size → 5

# Disable file indexing (Windows)
# Right-click vault folder →
# Properties → Uncheck "Allow files to be indexed"
```

---

### UI Lag or Freezing

**Problem:** Interface feels slow or unresponsive

**Solution:**
```bash
# Close unnecessary browser tabs
# Disable browser extensions
# Update browser to latest version

# Check CPU usage
# Close other applications

# Try different browser
# Chrome usually most performant
```

---

## 📋 Error Messages Reference

### Common Errors

#### `ENOENT: no such file or directory`
**Meaning:** File or folder doesn't exist  
**Fix:** Check path, create missing directories

#### `EACCES: permission denied`
**Meaning:** No permission to read/write  
**Fix:** Check file permissions, run without sudo

#### `EADDRINUSE: address already in use`
**Meaning:** Port already in use  
**Fix:** Kill process or use different port

#### `MODULE_NOT_FOUND`
**Meaning:** Missing npm package  
**Fix:** Run `npm install`

#### `SyntaxError: Unexpected token`
**Meaning:** Invalid JSON or code  
**Fix:** Check file syntax, validate JSON

#### `Network Error` or `ETIMEDOUT`
**Meaning:** Can't connect to internet/API  
**Fix:** Check internet, firewall, VPN

#### `401 Unauthorized`
**Meaning:** Invalid API key  
**Fix:** Check API key is correct

#### `429 Too Many Requests`
**Meaning:** Rate limit exceeded  
**Fix:** Wait, upgrade plan, or use different provider

#### `500 Internal Server Error`
**Meaning:** Server-side error (OpenAI/Anthropic)  
**Fix:** Wait and retry, check API status

---

## 🆘 Getting Help

### Before Asking for Help

**Collect this information:**
1. **Operating system** and version
2. **Node.js version** (`node --version`)
3. **npm version** (`npm --version`)
4. **Full error message** (copy from terminal)
5. **Steps to reproduce** the issue
6. **What you've tried** already

### Self-Help Resources

1. **Check this guide** - Most issues covered here
2. **Search GitHub issues** - Someone may have solved it
3. **Review documentation** - Getting started, dev guide
4. **Enable debug mode** - Settings → Developer → Debug Logging

### Ask for Help

**GitHub Issues:** [Create an issue](https://github.com/YourUsername/SecondBrainFoundation/issues)
- Use bug report template
- Provide all required information
- Be patient and respectful

**GitHub Discussions:** [Start a discussion](https://github.com/YourUsername/SecondBrainFoundation/discussions)
- For questions and general help
- Search existing discussions first

**Discord:** (coming soon)
- Real-time community support

### Debug Mode

Enable debug logging for more information:

```bash
# Settings → Developer → Debug Logging → ON

# Or via environment variable
DEBUG=sbf:* npm run dev

# Check console output
# More detailed logs will appear
```

---

## 💡 Pro Tips

### Prevention

- **Backup your vault** regularly
- **Keep dependencies updated** (`npm update`)
- **Restart app** after config changes
- **Use stable internet** for cloud AI
- **Monitor disk space** and memory

### Performance

- **Use SSD** for vault storage
- **Close unused apps** to free RAM
- **Use faster AI models** for quick responses
- **Batch operations** instead of individual
- **Clear cache** periodically

### Best Practices

- **Descriptive wikilinks** - `[[John Doe]]` not `[[jd]]`
- **Consistent naming** - Choose a convention
- **Regular reviews** - Clean up queue weekly
- **Test changes** - Try with small files first
- **Read logs** - Console has useful info

---

## 🔍 Still Stuck?

If you've tried everything and still have issues:

1. **Create minimal reproduction**
   - Fresh install
   - Minimal vault
   - Can you reproduce?

2. **Check system health**
   - Disk space available?
   - RAM not maxed out?
   - No system errors?

3. **Try different environment**
   - Different computer?
   - Different OS?
   - Different network?

4. **Ask for help** with full details
   - Don't say "it doesn't work"
   - Explain exactly what happens
   - Share error messages
   - List what you tried

**We're here to help!** 🤝

---

**Last updated:** November 15, 2025  
**Questions?** See [Getting Started](./getting-started.md) or ask in [GitHub Discussions](https://github.com/YourUsername/SecondBrainFoundation/discussions)
