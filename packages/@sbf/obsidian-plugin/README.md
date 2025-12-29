# SBF Companion Plugin for Obsidian

> Sync your Obsidian vault with Second Brain Foundation for AI-powered knowledge management.

## Features

- **Bi-directional Sync**: Keep your vault in sync with SBF
- **Wikilink Conversion**: Automatically convert [[wikilinks]] to SBF entity links
- **Conflict Resolution**: Smart detection and resolution of sync conflicts
- **Privacy Controls**: Respect sensitivity levels (public, personal, confidential, secret)
- **Folder Structure**: Organize notes using SBF's folder hierarchy

## Installation

### From Obsidian Community Plugins

1. Open Settings → Community plugins
2. Search for "Second Brain Foundation"
3. Click Install, then Enable

### Manual Installation

1. Download the latest release from GitHub
2. Extract to your vault's `.obsidian/plugins/sbf-companion/` folder
3. Enable the plugin in Settings → Community plugins

## Configuration

1. Open Settings → SBF Companion
2. Enter your SBF API URL and API Key
3. Click "Test Connection" to verify
4. Configure sync preferences

## Folder Structure

The plugin supports SBF's standard folder structure:

```
vault/
├── Daily/           # Daily notes
├── People/          # Person entities
├── Places/          # Location entities
├── Topics/          # Topic entities
├── Projects/        # Project entities
└── Transitional/    # Transitional notes
```

Use the "Create SBF Folder Structure" command to set up these folders.

## Commands

| Command | Description |
|---------|-------------|
| SBF: Sync Now | Sync all changes |
| SBF: Upload to SBF | Upload local changes only |
| SBF: Download from SBF | Download remote changes only |
| SBF: Sync Current File | Sync the active file |
| SBF: Create Folder Structure | Create SBF folders |
| SBF: Test Connection | Test API connection |

## Frontmatter

The plugin uses YAML frontmatter for SBF metadata:

```yaml
---
uid: topic-example-topic
type: topic
title: Example Topic
sensitivity: personal
lifecycle: maturing
tags:
  - example
  - documentation
bmom:
  because: Documentation is important
  meaning: Helps users understand features
  outcome: Better user experience
  measure: User satisfaction
---
```

## Privacy Levels

| Level | Cloud AI | Local AI | Export |
|-------|----------|----------|--------|
| public | ✅ | ✅ | ✅ |
| personal | ❌ | ✅ | ✅ |
| confidential | ❌ | ✅ | ❌ |
| secret | ❌ | ❌ | ❌ |

## Conflict Resolution

When conflicts occur between local and remote versions:

1. **Ask**: Show conflict modal to choose resolution
2. **Keep Local**: Always keep local version
3. **Keep Remote**: Always keep remote version
4. **Newest**: Keep whichever version is newer

## Development

```bash
# Install dependencies
npm install

# Build plugin
npm run build

# Development mode
npm run dev
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- [Documentation](https://docs.secondbrainfoundation.com)
- [GitHub Issues](https://github.com/sbf/obsidian-plugin/issues)
- [Discord Community](https://discord.gg/sbf)
