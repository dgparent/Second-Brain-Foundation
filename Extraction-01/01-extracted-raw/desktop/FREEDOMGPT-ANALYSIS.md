# FreedomGPT Electron Shell Analysis

**Source:** `libraries/FreedomGPT/src/`  
**Extracted To:** `01-extracted-raw/desktop/freedomgpt/`  
**Date:** 2025-11-14  
**Analyst:** Winston

---

## Files Extracted

1. **main-index.ts** (663 lines) - Main Electron process
2. **preload.ts** (11 lines) - Preload script (IPC declarations)
3. **ports.ts** - Port configuration

**Total:** ~680 LOC

---

## Key Electron Patterns for SBF

### 1. Window Creation with Security
```typescript
const mainWindow = new BrowserWindow({
  width: 1400,
  height: 900,
  webPreferences: {
    preload: path.join(__dirname, '../preload/index.js'),
    nodeIntegration: false,
    contextIsolation: true,   // SECURE
    sandbox: true,
  },
});
```

### 2. IPC Communication via contextBridge
```typescript
// preload.ts
contextBridge.exposeInMainWorld('sbf', {
  vault: {
    readFile: (path) => ipcRenderer.invoke('vault:readFile', path),
    writeFile: (path, fm, content) => 
      ipcRenderer.invoke('vault:writeFile', path, fm, content),
  },
});
```

### 3. App Lifecycle
```typescript
app.on('ready', () => createWindow());
app.on('activate', () => /* recreate window */);
app.on('before-quit', () => /* cleanup */);
```

---

**Status:** Ready to implement sbf-desktop  
**Next:** Implement window.ts, preload.ts, ipc-handlers.ts
