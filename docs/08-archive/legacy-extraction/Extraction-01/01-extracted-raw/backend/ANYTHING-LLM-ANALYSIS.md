# anything-llm File Operations Analysis

**Source:** `libraries/anything-llm/server/utils/files/`  
**Extracted To:** `01-extracted-raw/backend/anything-llm-files/`  
**Date:** 2025-11-14  
**Analyst:** Winston

---

## Files Extracted

1. **index.js** (16,521 bytes) - Main file operations
2. **logo.js** (3,718 bytes) - Logo management
3. **multer.js** (4,744 bytes) - File upload handling
4. **pfp.js** (1,822 bytes) - Profile picture handling
5. **purgeDocument.js** (2,841 bytes) - Document cleanup

**Total:** ~30KB of code

---

## Key Patterns from index.js

### 1. File Path Management
```javascript
const documentsPath = path.resolve(
  process.env.STORAGE_DIR, 
  `documents`
);

// Path normalization and security
function normalizePath(filepath) {
  // Prevents directory traversal attacks
}

function isWithin(parent, child) {
  // Ensures file is within allowed directory
}
```

**SBF Translation:**
```typescript
// sbf-core/src/filesystem/vault.ts
export class Vault {
  private vaultPath: string;
  
  private normalizePath(filepath: string): string {
    // Prevent directory traversal
    return path.normalize(filepath).replace(/^(\.\.[\/\\])+/, '');
  }
  
  private isWithin(parent: string, child: string): boolean {
    const relative = path.relative(parent, child);
    return !relative.startsWith('..') && !path.isAbsolute(relative);
  }
}
```

### 2. Directory Traversal
```javascript
async function viewLocalFiles() {
  const directory = {
    name: "documents",
    type: "folder",
    items: [],
  };
  
  for (const file of fs.readdirSync(documentsPath)) {
    const folderPath = path.resolve(documentsPath, file);
    const isFolder = fs.lstatSync(folderPath).isDirectory();
    
    if (isFolder) {
      // Recursively read subfolder
      const subdocs = { name: file, type: "folder", items: [] };
      // ...scan files
      directory.items.push(subdocs);
    }
  }
  
  return directory;
}
```

**SBF Translation:**
```typescript
export interface VaultEntry {
  name: string;
  type: 'file' | 'folder';
  path: string;
  items?: VaultEntry[];
}

export class Vault {
  async listFiles(folderPath?: string): Promise<VaultEntry> {
    const targetPath = folderPath 
      ? path.join(this.vaultPath, folderPath)
      : this.vaultPath;
      
    const entry: VaultEntry = {
      name: path.basename(targetPath),
      type: 'folder',
      path: targetPath,
      items: [],
    };
    
    const files = await fs.promises.readdir(targetPath);
    
    for (const file of files) {
      const fullPath = path.join(targetPath, file);
      const stats = await fs.promises.lstat(fullPath);
      
      if (stats.isDirectory()) {
        // Recursively scan subdirectories
        const subEntry = await this.listFiles(path.join(folderPath || '', file));
        entry.items!.push(subEntry);
      } else if (file.endsWith('.md')) {
        entry.items!.push({
          name: file,
          type: 'file',
          path: fullPath,
        });
      }
    }
    
    return entry;
  }
}
```

### 3. File Reading with Metadata
```javascript
async function fileData(filePath = null) {
  const fullFilePath = path.resolve(documentsPath, normalizePath(filePath));
  
  if (!fs.existsSync(fullFilePath) || !isWithin(documentsPath, fullFilePath))
    return null;
  
  const data = fs.readFileSync(fullFilePath, "utf8");
  return JSON.parse(data);
}
```

**SBF Translation:**
```typescript
import grayMatter from 'gray-matter';

export class Vault {
  async readFile(filePath: string): Promise<{ frontmatter: any; content: string } | null> {
    const fullPath = path.join(this.vaultPath, this.normalizePath(filePath));
    
    if (!this.isWithin(this.vaultPath, fullPath)) {
      throw new Error('Path traversal detected');
    }
    
    if (!await fs.promises.access(fullPath).then(() => true).catch(() => false)) {
      return null;
    }
    
    const markdown = await fs.promises.readFile(fullPath, 'utf8');
    const { data, content } = grayMatter(markdown);
    
    return {
      frontmatter: data,
      content: content.trim(),
    };
  }
}
```

### 4. File Writing
```javascript
function writeToServerDocuments(
  data = {},
  filename = null,
  destinationOverride = null
) {
  const folder = destinationOverride ?? uuidv5(filename, uuidv5.URL);
  const destination = path.resolve(documentsPath, folder);

  if (!fs.existsSync(destination)) fs.mkdirSync(destination);

  const destinationFilePath = path.resolve(
    destination,
    `${filename}.json`
  );

  fs.writeFileSync(destinationFilePath, JSON.stringify(data, null, 4), {
    encoding: "utf-8",
  });

  return { destination, filename };
}
```

**SBF Translation:**
```typescript
export class Vault {
  async writeFile(
    filePath: string,
    frontmatter: any,
    content: string
  ): Promise<void> {
    const fullPath = path.join(this.vaultPath, this.normalizePath(filePath));
    
    // Ensure parent directory exists
    const dirPath = path.dirname(fullPath);
    await fs.promises.mkdir(dirPath, { recursive: true });
    
    // Stringify frontmatter + content
    const markdown = grayMatter.stringify(content, frontmatter);
    
    // Write atomically
    const tempPath = `${fullPath}.tmp`;
    await fs.promises.writeFile(tempPath, markdown, 'utf8');
    await fs.promises.rename(tempPath, fullPath);
  }
}
```

---

## Useful Patterns to Extract

### ✅ Security
- Path normalization (prevent directory traversal)
- Path validation (`isWithin` check)
- Safe file operations

### ✅ Directory Operations
- Recursive directory scanning
- Folder creation (with `mkdirSync`)
- File filtering by extension

### ✅ File Operations
- Read file with encoding
- Write file with pretty JSON (or YAML frontmatter)
- Atomic writes (temp file + rename)

### ✅ Metadata Handling
- JSON parsing for metadata
- Structured data storage

---

## What NOT to Extract

### ❌ Database Operations
- `Document` model references
- `DocumentSyncQueue` references
- Workspace pinning logic

### ❌ Upload Handling
- multer.js (HTTP file uploads)
- pfp.js, logo.js (image handling)

### ❌ Vector Storage
- Vector cache path logic
- Embedding storage

---

## SBF Implementation Plan

### Phase 1: Core Vault Operations
**File:** `sbf-core/src/filesystem/vault.ts`

```typescript
export class Vault {
  constructor(vaultPath: string);
  
  // Path utilities
  private normalizePath(path: string): string;
  private isWithin(parent: string, child: string): boolean;
  
  // File operations
  async readFile(path: string): Promise<{ frontmatter: any; content: string }>;
  async writeFile(path: string, frontmatter: any, content: string): Promise<void>;
  async deleteFile(path: string): Promise<void>;
  
  // Directory operations
  async listFiles(folder?: string): Promise<VaultEntry>;
  async createFolder(path: string): Promise<void>;
  
  // Metadata operations
  async updateFrontmatter(path: string, updates: Partial<any>): Promise<void>;
  async getChecksum(path: string): Promise<string>;
}
```

### Phase 2: File Watching
**File:** `sbf-core/src/filesystem/watcher.ts`

```typescript
import chokidar from 'chokidar';

export class VaultWatcher {
  constructor(vault: Vault);
  
  watch(callback: (event: FileEvent) => void): void;
  stop(): void;
}
```

### Phase 3: Entity File Operations
**File:** `sbf-core/src/entities/entity-file-manager.ts`

```typescript
export class EntityFileManager {
  constructor(vault: Vault);
  
  async saveEntity(entity: Entity): Promise<void>;
  async loadEntity(uid: string): Promise<Entity | null>;
  async deleteEntity(uid: string): Promise<void>;
  async listEntities(type?: EntityType): Promise<Entity[]>;
}
```

---

## Differences from anything-llm

### anything-llm
- JSON-based document storage
- Flat folder structure (by source)
- Vector embeddings stored separately

### SBF
- Markdown files with YAML frontmatter
- Hierarchical folder structure (by entity type)
- No vector storage (use fuse.js for search)

---

## Next Steps

1. ✅ Implement `Vault` class in TypeScript
2. ✅ Add gray-matter for frontmatter parsing
3. ✅ Add chokidar for file watching
4. ✅ Create `EntityFileManager` wrapper
5. ⏳ Test with mock vault structure

---

**Prepared By:** Winston (Architect)  
**Date:** 2025-11-14  
**Status:** Analysis Complete - Ready for Implementation
