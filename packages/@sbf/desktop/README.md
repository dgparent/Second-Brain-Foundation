# @sbf/desktop

Second Brain Foundation Desktop Application - Cross-platform desktop app built with Electron.

## Features

- 🖥️ **Cross-platform**: Windows, macOS, Linux
- 🔌 **Plugin System**: Load and manage SBF plugins
- 🎨 **Modern UI**: Clean, dark-themed interface
- 🔔 **System Tray**: Minimize to tray, quick access
- 💾 **Local-First**: All data stored locally
- 🔒 **Secure**: Context isolation and sandboxed renderer

## Architecture

### Main Process (`src/main/`)
- Electron main process
- Window management
- System tray integration
- IPC handlers for plugin and entity operations

### Renderer Process (`src/renderer/`)
- UI/frontend
- Plugin dashboard
- Entity views
- Settings

### Preload Scripts (`src/preload/`)
- Secure bridge between main and renderer
- Exposes safe APIs via `contextBridge`

## Development

### Install Dependencies
```bash
cd packages/@sbf/desktop
npm install
```

### Run in Development Mode
```bash
npm run dev      # Compile TypeScript in watch mode
npm start        # Start Electron app
```

### Build for Production
```bash
npm run build    # Compile TypeScript
npm run package  # Package as distributable
```

## Usage

### Loading Plugins

The desktop app automatically discovers and loads plugins from:
- `node_modules/@sbf/plugins/*`
- User plugin directory (configurable)

### System Tray

The app minimizes to the system tray when closed. Right-click the tray icon for quick actions:
- **Show App**: Restore the main window
- **Quit**: Exit the application

### Keyboard Shortcuts

- `Ctrl+Q` / `Cmd+Q`: Quit
- `Ctrl+R` / `Cmd+R`: Reload
- `Ctrl+Shift+I` / `Cmd+Shift+I`: Toggle DevTools

## API

### Window API (Main Process)

```typescript
import { sbfAPI } from '@sbf/desktop';

// Plugin operations
const plugins = await sbfAPI.plugins.list();
await sbfAPI.plugins.load('plugin-id');
await sbfAPI.plugins.unload('plugin-id');

// Entity operations
const entity = await sbfAPI.entities.create({...});
const entity = await sbfAPI.entities.read('uid');
await sbfAPI.entities.update('uid', {...});
await sbfAPI.entities.delete('uid');
```

### Domain APIs

The following namespaces are available via `sbfAPI`:

- `sbfAPI.tasks` - Task Management
- `sbfAPI.finance` - Budgeting & Portfolio
- `sbfAPI.fitness` - Fitness, Nutrition, Medication
- `sbfAPI.crm` - Relationship CRM
- `sbfAPI.learning` - Learning Tracker
- `sbfAPI.legal` - Legal Operations
- `sbfAPI.property` - Property Management
- `sbfAPI.haccp` - Restaurant HACCP

## Configuration

### electron-builder

Package configuration is in `package.json` under the `build` key:

```json
{
  "build": {
    "appId": "org.secondbrainfoundation.app",
    "productName": "Second Brain",
    "mac": { "category": "public.app-category.productivity" },
    "win": { "target": "nsis" },
    "linux": { "target": "AppImage" }
  }
}
```

## Plugin Integration

### Plugin Manifest

Plugins should export a manifest compatible with the desktop app:

```typescript
export const plugin: SBFPlugin = {
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  
  ui: {
    routes: [
      { path: '/my-plugin', component: MyPluginView }
    ],
    menu: [
      { label: 'My Plugin', icon: 'plugin-icon', route: '/my-plugin' }
    ]
  }
};
```

### Loading Custom Plugins

Users can install custom plugins by:
1. Placing plugin folder in `~/.sbf/plugins/`
2. Restarting the desktop app
3. Selecting the plugin from the sidebar

## Security

### Context Isolation

The app uses Electron's context isolation to prevent direct access to Node.js APIs from the renderer process. All APIs are exposed via the secure `preload` script.

### Sandboxing

Renderer processes are sandboxed with `nodeIntegration: false` and `contextIsolation: true`.

### IPC Security

All IPC communication is validated and sanitized in the main process.

## Troubleshooting

### App Won't Start

1. Rebuild the app: `npm run build`
2. Clear cache: `rm -rf dist/`
3. Reinstall dependencies: `npm ci`

### Plugins Not Loading

1. Check plugin directory permissions
2. Verify plugin manifests are valid
3. Check console for error messages

### Performance Issues

1. Disable unused plugins
2. Clear entity cache
3. Reduce number of loaded entities

## Roadmap

- [ ] Auto-update support
- [ ] Cloud sync integration
- [ ] Multiple window support
- [ ] Custom themes
- [ ] Plugin marketplace UI
- [ ] Advanced search
- [ ] Graph visualization

## License

MIT License - see LICENSE file for details
