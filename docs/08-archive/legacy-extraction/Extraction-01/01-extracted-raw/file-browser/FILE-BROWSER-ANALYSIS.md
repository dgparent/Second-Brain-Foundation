# File Browser UI Patterns Analysis

**Date:** 2025-11-14  
**Source:** SurfSense (surfsense_web/components)  
**Purpose:** Extract file/folder tree navigation patterns for SBF File Browser  
**Status:** Pattern extraction complete

---

## Executive Summary

SurfSense provides modern **file browser and document management** UI:
- Hierarchical folder tree
- File type icons
- Search/filter
- Document preview
- Source management
- Sidebar navigation

These patterns map directly to **SBF's File Browser** for navigating the knowledge vault.

---

## Extracted Components

### From `components/sidebar/`
- Collapsible navigation
- Tree view structure
- Active item highlighting

### From `components/sources/`
- Document list views
- File metadata display
- Source management UI

### From `components/ui/`
- Reusable UI primitives
- Icon systems
- Layout components

**Total Files:** 49 components (~156KB)

---

## Core Patterns

### 1. Tree Navigation Structure

**React Pattern:**
```typescript
interface FileTreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileTreeNode[];
  expanded?: boolean;
  icon?: string;
  metadata?: {
    size?: number;
    modified?: Date;
    entityCount?: number;
  };
}

export const FileTree: React.FC<{
  root: FileTreeNode;
  onSelect: (node: FileTreeNode) => void;
  onExpand: (nodeId: string) => void;
}> = ({ root, onSelect, onExpand }) => {
  return (
    <div className="file-tree">
      <TreeNode 
        node={root} 
        level={0}
        onSelect={onSelect}
        onExpand={onExpand}
      />
    </div>
  );
};
```

**TreeNode Component:**
```typescript
const TreeNode: React.FC<{
  node: FileTreeNode;
  level: number;
  onSelect: (node: FileTreeNode) => void;
  onExpand: (nodeId: string) => void;
}> = ({ node, level, onSelect, onExpand }) => {
  const [isExpanded, setIsExpanded] = useState(node.expanded || false);
  
  const handleToggle = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
      onExpand(node.id);
    }
  };
  
  const handleClick = () => {
    onSelect(node);
  };
  
  return (
    <div className="tree-node" style={{ paddingLeft: `${level * 16}px` }}>
      <div className="tree-node-content" onClick={handleClick}>
        {node.type === 'folder' && (
          <button onClick={handleToggle} className="expand-button">
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        
        <FileIcon type={node.type} name={node.name} />
        
        <span className="node-name">{node.name}</span>
        
        {node.metadata?.entityCount && (
          <span className="entity-badge">
            {node.metadata.entityCount}
          </span>
        )}
      </div>
      
      {isExpanded && node.children && (
        <div className="tree-node-children">
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              onExpand={onExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};
```

---

### 2. File Icons

**Pattern from SurfSense:**
```typescript
const FILE_ICONS: Record<string, string> = {
  // Markdown
  '.md': '📄',
  '.markdown': '📄',
  
  // Text
  '.txt': '📝',
  
  // Code
  '.ts': '📘',
  '.tsx': '⚛️',
  '.js': '📜',
  '.jsx': '⚛️',
  '.py': '🐍',
  
  // Data
  '.json': '📊',
  '.yaml': '⚙️',
  '.csv': '📊',
  
  // Media
  '.png': '🖼️',
  '.jpg': '🖼️',
  '.pdf': '📕',
  
  // Folders
  'folder': '📁',
  'folder-open': '📂',
};

export const FileIcon: React.FC<{
  type: 'file' | 'folder';
  name: string;
  isExpanded?: boolean;
}> = ({ type, name, isExpanded = false }) => {
  if (type === 'folder') {
    return <span>{isExpanded ? FILE_ICONS['folder-open'] : FILE_ICONS['folder']}</span>;
  }
  
  const ext = name.substring(name.lastIndexOf('.'));
  const icon = FILE_ICONS[ext] || '📄';
  
  return <span>{icon}</span>;
};
```

---

### 3. Search and Filter

**Pattern:**
```typescript
export const FileSearch: React.FC<{
  tree: FileTreeNode;
  onResultsChange: (results: FileTreeNode[]) => void;
}> = ({ tree, onResultsChange }) => {
  const [query, setQuery] = useState('');
  
  const searchTree = (node: FileTreeNode, query: string): FileTreeNode[] => {
    const results: FileTreeNode[] = [];
    
    if (node.name.toLowerCase().includes(query.toLowerCase())) {
      results.push(node);
    }
    
    if (node.children) {
      node.children.forEach(child => {
        results.push(...searchTree(child, query));
      });
    }
    
    return results;
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (newQuery.length > 0) {
      const results = searchTree(tree, newQuery);
      onResultsChange(results);
    } else {
      onResultsChange([]);
    }
  };
  
  return (
    <div className="file-search">
      <input
        type="text"
        placeholder="Search files..."
        value={query}
        onChange={handleSearch}
      />
    </div>
  );
};
```

---

### 4. Context Menu

**Right-click actions:**
```typescript
interface ContextMenuItem {
  label: string;
  icon?: string;
  action: () => void;
  separator?: boolean;
  disabled?: boolean;
}

export const FileContextMenu: React.FC<{
  node: FileTreeNode;
  position: { x: number; y: number };
  onClose: () => void;
}> = ({ node, position, onClose }) => {
  const menuItems: ContextMenuItem[] = node.type === 'file' 
    ? [
        { label: 'Open', icon: '📖', action: () => handleOpen(node) },
        { label: 'Rename', icon: '✏️', action: () => handleRename(node) },
        { separator: true },
        { label: 'Move to...', icon: '📁', action: () => handleMove(node) },
        { label: 'Delete', icon: '🗑️', action: () => handleDelete(node) },
        { separator: true },
        { label: 'Show in Finder', icon: '👁️', action: () => handleReveal(node) },
        { label: 'Properties', icon: 'ℹ️', action: () => handleProperties(node) },
      ]
    : [
        { label: 'New File', icon: '📄', action: () => handleNewFile(node) },
        { label: 'New Folder', icon: '📁', action: () => handleNewFolder(node) },
        { separator: true },
        { label: 'Rename', icon: '✏️', action: () => handleRename(node) },
        { label: 'Delete', icon: '🗑️', action: () => handleDelete(node) },
      ];
  
  return (
    <div 
      className="context-menu"
      style={{ top: position.y, left: position.x }}
    >
      {menuItems.map((item, i) => 
        item.separator ? (
          <div key={i} className="menu-separator" />
        ) : (
          <button
            key={i}
            onClick={() => {
              item.action();
              onClose();
            }}
            disabled={item.disabled}
          >
            {item.icon && <span>{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        )
      )}
    </div>
  );
};
```

---

### 5. File Preview Panel

**Pattern:**
```typescript
export const FilePreview: React.FC<{
  file: FileTreeNode;
}> = ({ file }) => {
  const [content, setContent] = useState<string>('');
  const [metadata, setMetadata] = useState<FileMetadata>();
  
  useEffect(() => {
    // Load file content and metadata
    loadFileContent(file.path).then(setContent);
    loadFileMetadata(file.path).then(setMetadata);
  }, [file.path]);
  
  return (
    <div className="file-preview">
      <div className="preview-header">
        <h3>{file.name}</h3>
        <FileIcon type={file.type} name={file.name} />
      </div>
      
      <div className="preview-metadata">
        <div className="metadata-item">
          <span className="label">Modified:</span>
          <span>{metadata?.modified.toLocaleString()}</span>
        </div>
        <div className="metadata-item">
          <span className="label">Size:</span>
          <span>{formatBytes(metadata?.size || 0)}</span>
        </div>
        {metadata?.entityCount && (
          <div className="metadata-item">
            <span className="label">Entities:</span>
            <span>{metadata.entityCount}</span>
          </div>
        )}
      </div>
      
      <div className="preview-content">
        {file.name.endsWith('.md') ? (
          <MarkdownPreview content={content} />
        ) : (
          <pre>{content}</pre>
        )}
      </div>
    </div>
  );
};
```

---

### 6. Drag and Drop

**Pattern:**
```typescript
export const DraggableTreeNode: React.FC<{
  node: FileTreeNode;
  onDrop: (source: FileTreeNode, target: FileTreeNode) => void;
}> = ({ node, onDrop }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isOver, setIsOver] = useState(false);
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(node));
    setIsDragging(true);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (node.type === 'folder') {
      setIsOver(true);
    }
  };
  
  const handleDragLeave = () => {
    setIsOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    
    if (node.type === 'folder') {
      const sourceData = e.dataTransfer.getData('application/json');
      const source = JSON.parse(sourceData) as FileTreeNode;
      onDrop(source, node);
    }
  };
  
  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        tree-node
        ${isDragging ? 'dragging' : ''}
        ${isOver ? 'drag-over' : ''}
      `}
    >
      {/* Node content */}
    </div>
  );
};
```

---

## SBF File Browser Implementation

### Component Structure

```
sbf-ui/src/components/browser/
├── FileBrowser.tsx         # Main container
├── FileTree.tsx            # Tree view
├── TreeNode.tsx            # Individual node
├── FileIcon.tsx            # Icon component
├── FileSearch.tsx          # Search bar
├── ContextMenu.tsx         # Right-click menu
├── FilePreview.tsx         # Preview panel
└── DragDrop.tsx            # Drag-drop handlers
```

### Integration with Vault

```typescript
export const VaultBrowser: React.FC = () => {
  const [tree, setTree] = useState<FileTreeNode | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileTreeNode | null>(null);
  
  useEffect(() => {
    // Load vault structure from backend
    vaultService.getFileTree().then(setTree);
  }, []);
  
  const handleFileSelect = async (node: FileTreeNode) => {
    setSelectedFile(node);
    
    if (node.type === 'file') {
      // Open file in editor
      await editorService.openFile(node.path);
    }
  };
  
  const handleFileMove = async (source: FileTreeNode, target: FileTreeNode) => {
    // Move file via vault service
    await vaultService.moveFile(source.path, target.path);
    
    // Refresh tree
    const updatedTree = await vaultService.getFileTree();
    setTree(updatedTree);
  };
  
  return (
    <div className="vault-browser">
      <div className="browser-sidebar">
        <FileSearch tree={tree} />
        <FileTree
          root={tree}
          onSelect={handleFileSelect}
          onMove={handleFileMove}
        />
      </div>
      
      {selectedFile && (
        <div className="browser-preview">
          <FilePreview file={selectedFile} />
        </div>
      )}
    </div>
  );
};
```

---

## Additional Features

### Virtual Scrolling (for large folders)

```typescript
import { FixedSizeList } from 'react-window';

export const VirtualizedFileList: React.FC<{
  files: FileTreeNode[];
}> = ({ files }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <FileListItem file={files[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={files.length}
      itemSize={40}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

### File Watcher Integration

```typescript
class FileWatcher {
  private watcher: FSWatcher;
  
  constructor(private vaultPath: string) {
    this.watcher = chokidar.watch(vaultPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });
    
    this.setupListeners();
  }
  
  private setupListeners() {
    this.watcher
      .on('add', path => this.emit('file:added', path))
      .on('change', path => this.emit('file:changed', path))
      .on('unlink', path => this.emit('file:deleted', path))
      .on('addDir', path => this.emit('folder:added', path))
      .on('unlinkDir', path => this.emit('folder:deleted', path));
  }
  
  subscribe(event: string, callback: (path: string) => void) {
    this.on(event, callback);
  }
}

// In FileBrowser component
useEffect(() => {
  const watcher = new FileWatcher(vaultPath);
  
  watcher.subscribe('file:added', (path) => {
    // Refresh tree to show new file
    refreshTree();
  });
  
  watcher.subscribe('file:changed', (path) => {
    // Update file metadata
    updateFileInTree(path);
  });
  
  return () => watcher.close();
}, [vaultPath]);
```

---

## Styling

**CSS Structure:**
```css
.file-tree {
  min-width: 200px;
  max-width: 400px;
  overflow-y: auto;
  border-right: 1px solid var(--border-color);
}

.tree-node {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
}

.tree-node:hover {
  background: var(--hover-background);
}

.tree-node.selected {
  background: var(--selected-background);
  color: var(--selected-text);
}

.tree-node.dragging {
  opacity: 0.5;
}

.tree-node.drag-over {
  background: var(--drop-target-background);
  border: 2px dashed var(--primary-color);
}

.expand-button {
  width: 16px;
  height: 16px;
  margin-right: 4px;
  border: none;
  background: none;
  cursor: pointer;
}

.node-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entity-badge {
  margin-left: 8px;
  padding: 2px 6px;
  background: var(--badge-background);
  border-radius: 10px;
  font-size: 0.75rem;
}
```

---

## Success Criteria

**File Browser is production-ready when:**
- ✅ Shows complete vault folder structure
- ✅ File icons match file types
- ✅ Expand/collapse folders smoothly
- ✅ Search filters files instantly
- ✅ Right-click context menu works
- ✅ Drag-and-drop moves files
- ✅ File preview shows content
- ✅ Real-time updates from file watcher
- ✅ Entity badges show entity count
- ✅ Handles 1000+ files efficiently

---

## Implementation Timeline

**Week 1: Core Tree Component**
- FileTree and TreeNode components
- Basic expand/collapse
- File icons

**Week 2: Interactions**
- File selection
- Context menu
- Search/filter

**Week 3: Advanced Features**
- Drag-and-drop
- File preview
- Virtual scrolling

**Week 4: Integration**
- Vault service integration
- File watcher
- Entity badges
- Polish & testing

**Total:** ~4 weeks

---

**Analysis Complete**  
**Status:** ✅ Ready for implementation  
**Files Extracted:** 49 components from SurfSense  
**Next:** Begin implementation in sbf-ui/src/components/browser/
