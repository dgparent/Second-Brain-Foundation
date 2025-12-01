"""
Local Vault Storage for Truth-Hierarchy-Aware Entities
Implements local-first storage with markdown + frontmatter

DEPRECATED: File watching and storage logic is moving to Node.js (apps/api + packages/@sbf/core/vault-connector).
This module should only be used for legacy support or specific Python-only tasks until migration is complete.
"""

import os
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
from pathlib import Path
import frontmatter
# from watchdog.observers import Observer
# from watchdog.events import FileSystemEventHandler, FileSystemEvent

from ..models.truth_hierarchy import (
    TruthLevel, TruthMetadata, OriginSource,
    create_truth_metadata, upgrade_to_user_truth
)


class VaultEntity:
    """Entity stored in local vault"""
    
    def __init__(
        self,
        id: str,
        vault_path: str,
        title: str,
        content: str,
        truth_metadata: TruthMetadata,
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.id = id
        self.vault_path = vault_path
        self.title = title
        self.content = content
        self.truth_metadata = truth_metadata
        self.metadata = metadata or {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for storage"""
        return {
            'id': self.id,
            'vault_path': self.vault_path,
            'title': self.title,
            'content': self.content,
            'truth_metadata': {
                'truth_level': self.truth_metadata.truth_level,
                'origin_source': self.truth_metadata.origin_source,
                'accepted_by_user': self.truth_metadata.accepted_by_user,
                'last_modified_by_level': self.truth_metadata.last_modified_by_level,
                'created_at': self.truth_metadata.created_at.isoformat(),
                'updated_at': self.truth_metadata.updated_at.isoformat(),
                'origin_chain': [
                    {
                        'timestamp': entry.timestamp.isoformat(),
                        'truth_level': entry.truth_level,
                        'source': entry.source,
                        'action': entry.action,
                        'metadata': entry.metadata
                    }
                    for entry in self.truth_metadata.origin_chain
                ]
            },
            'metadata': self.metadata
        }


class VaultAdapter:
    """Adapter for reading/writing entities to local vault"""
    
    def __init__(self, vault_root: str):
        self.vault_root = Path(vault_root)
        
        if not self.vault_root.exists():
            raise ValueError(f"Vault root does not exist: {vault_root}")
    
    def scan_vault(self) -> List[VaultEntity]:
        """Scan entire vault and return all entities"""
        entities = []
        
        for md_file in self.vault_root.rglob('*.md'):
            entity = self.load_entity(md_file.relative_to(self.vault_root))
            if entity:
                entities.append(entity)
        
        return entities
    
    def load_entity(self, relative_path: Path) -> Optional[VaultEntity]:
        """Load a single entity by relative vault path"""
        full_path = self.vault_root / relative_path
        
        if not full_path.exists() or full_path.suffix != '.md':
            return None
        
        try:
            return self._parse_markdown_file(full_path, relative_path)
        except Exception as e:
            print(f"Error loading entity {relative_path}: {e}")
            return None
    
    def save_entity(self, entity: VaultEntity) -> None:
        """Save entity to vault (create or update)"""
        full_path = self.vault_root / entity.vault_path
        
        # Ensure directory exists
        full_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Build frontmatter
        fm_data = entity.to_dict()
        content = fm_data.pop('content')
        
        # Create frontmatter post
        post = frontmatter.Post(content, **fm_data)
        
        # Write to file
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(frontmatter.dumps(post))
    
    def delete_entity(self, relative_path: Path) -> bool:
        """Delete entity from vault"""
        full_path = self.vault_root / relative_path
        
        if full_path.exists():
            full_path.unlink()
            return True
        
        return False
    
    def _parse_markdown_file(self, full_path: Path, relative_path: Path) -> VaultEntity:
        """Parse markdown file with frontmatter"""
        with open(full_path, 'r', encoding='utf-8') as f:
            post = frontmatter.load(f)
        
        # Extract truth metadata
        truth_data = post.metadata.get('truth_metadata', {})
        
        # Determine truth level - user-created files default to U1
        truth_level = truth_data.get('truth_level', TruthLevel.USER)
        origin_source = truth_data.get('origin_source', 'user:vault')
        
        # Create truth metadata
        if 'created_at' in truth_data:
            truth_metadata = TruthMetadata(
                truth_level=truth_level,
                origin_source=origin_source,
                origin_chain=truth_data.get('origin_chain', []),
                accepted_by_user=truth_data.get('accepted_by_user', truth_level == TruthLevel.USER),
                last_modified_by_level=truth_data.get('last_modified_by_level', truth_level),
                created_at=datetime.fromisoformat(truth_data['created_at']),
                updated_at=datetime.fromisoformat(truth_data.get('updated_at', truth_data['created_at']))
            )
        else:
            # New file - create fresh metadata as U1 (user-created)
            truth_metadata = create_truth_metadata(TruthLevel.USER, 'user:vault')
        
        return VaultEntity(
            id=post.metadata.get('id', str(full_path.stem)),
            vault_path=str(relative_path),
            title=post.metadata.get('title', full_path.stem),
            content=post.content,
            truth_metadata=truth_metadata,
            metadata=post.metadata.get('metadata', {})
        )


class VaultFileWatcher(FileSystemEventHandler):
    """Watch vault for file changes and emit events"""
    
    def __init__(self, vault_root: str, on_change_callback):
        self.vault_root = Path(vault_root)
        self.adapter = VaultAdapter(vault_root)
        self.on_change = on_change_callback
    
    def on_created(self, event: FileSystemEvent):
        """Handle file creation"""
        if event.is_directory or not event.src_path.endswith('.md'):
            return
        
        relative_path = Path(event.src_path).relative_to(self.vault_root)
        entity = self.adapter.load_entity(relative_path)
        
        if entity:
            self.on_change('created', entity)
    
    def on_modified(self, event: FileSystemEvent):
        """Handle file modification"""
        if event.is_directory or not event.src_path.endswith('.md'):
            return
        
        relative_path = Path(event.src_path).relative_to(self.vault_root)
        entity = self.adapter.load_entity(relative_path)
        
        if entity:
            self.on_change('modified', entity)
    
    def on_deleted(self, event: FileSystemEvent):
        """Handle file deletion"""
        if event.is_directory or not event.src_path.endswith('.md'):
            return
        
        relative_path = Path(event.src_path).relative_to(self.vault_root)
        self.on_change('deleted', {'vault_path': str(relative_path)})


class LocalVaultStorage:
    """High-level storage interface for local vault"""
    
    def __init__(self, vault_root: str, enable_watch: bool = True):
        self.vault_root = vault_root
        self.adapter = VaultAdapter(vault_root)
        self.observer = None
        
        if enable_watch:
            self._start_watch()
    
    def _start_watch(self):
        """Start file system watcher"""
        def handle_change(event_type: str, entity_data):
            print(f"Vault change: {event_type} - {entity_data}")
            # TODO: Emit to event system, sync to cloud if enabled
        
        handler = VaultFileWatcher(self.vault_root, handle_change)
        self.observer = Observer()
        self.observer.schedule(handler, self.vault_root, recursive=True)
        self.observer.start()
    
    def stop_watch(self):
        """Stop file system watcher"""
        if self.observer:
            self.observer.stop()
            self.observer.join()
    
    def create_entity(
        self,
        title: str,
        content: str,
        vault_path: str,
        truth_level: TruthLevel = TruthLevel.USER,
        origin_source: OriginSource = 'user:vault',
        metadata: Optional[Dict[str, Any]] = None
    ) -> VaultEntity:
        """Create a new entity"""
        import uuid
        
        entity = VaultEntity(
            id=str(uuid.uuid4()),
            vault_path=vault_path,
            title=title,
            content=content,
            truth_metadata=create_truth_metadata(truth_level, origin_source),
            metadata=metadata
        )
        
        self.adapter.save_entity(entity)
        return entity
    
    def get_entity(self, vault_path: str) -> Optional[VaultEntity]:
        """Get entity by vault path"""
        return self.adapter.load_entity(Path(vault_path))
    
    def update_entity(
        self,
        vault_path: str,
        updates: Dict[str, Any],
        truth_level: TruthLevel = TruthLevel.USER,
        origin_source: OriginSource = 'user:vault'
    ) -> Optional[VaultEntity]:
        """Update entity"""
        entity = self.get_entity(vault_path)
        
        if not entity:
            return None
        
        # Update fields
        if 'title' in updates:
            entity.title = updates['title']
        if 'content' in updates:
            entity.content = updates['content']
        if 'metadata' in updates:
            entity.metadata.update(updates['metadata'])
        
        # Update truth metadata
        from ..models.truth_hierarchy import append_modification
        entity.truth_metadata = append_modification(
            entity.truth_metadata,
            truth_level,
            origin_source
        )
        
        self.adapter.save_entity(entity)
        return entity
    
    def delete_entity(self, vault_path: str) -> bool:
        """Delete entity"""
        return self.adapter.delete_entity(Path(vault_path))
    
    def scan_all(self) -> List[VaultEntity]:
        """Scan entire vault"""
        return self.adapter.scan_vault()
    
    def accept_suggestion(self, vault_path: str, user_id: str) -> Optional[VaultEntity]:
        """Accept AI/automation suggestion and upgrade to U1"""
        entity = self.get_entity(vault_path)
        
        if not entity:
            return None
        
        # Upgrade to user truth
        entity.truth_metadata = upgrade_to_user_truth(
            entity.truth_metadata,
            user_id,
            action='accepted'
        )
        
        self.adapter.save_entity(entity)
        return entity
