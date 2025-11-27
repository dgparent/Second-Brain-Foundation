"""
Local Sync Client for Truth-Hierarchy-Aware Synchronization
Implements push/pull sync with cloud following re-alignment contract
"""

import httpx
from typing import List, Dict, Optional, Any
from datetime import datetime
import asyncio

from ..models.sync_models import (
    SyncItem, SyncBatch, SyncConfig, SyncStatus, SyncEvent,
    SyncPushRequest, SyncPushResponse,
    SyncPullRequest, SyncPullResponse
)
from ..models.truth_hierarchy import TruthLevel, TruthMetadata, create_truth_metadata
from .sync_conflict_resolver import SyncConflictResolver
from .vault_storage import LocalVaultStorage, VaultEntity


class LocalSyncClient:
    """Sync client for local-first vault synchronization"""
    
    def __init__(
        self,
        tenant_id: str,
        device_id: str,
        cloud_api_url: str,
        vault_storage: LocalVaultStorage,
        config: SyncConfig
    ):
        self.tenant_id = tenant_id
        self.device_id = device_id
        self.cloud_api_url = cloud_api_url.rstrip('/')
        self.vault_storage = vault_storage
        self.config = config
        self.resolver = SyncConflictResolver(config)
        
        self.status = SyncStatus(
            tenant_id=tenant_id,
            local_version=0,
            remote_version=0
        )
        
        # Auto-sync task
        self._sync_task = None
        if config.auto_sync:
            self._start_auto_sync()
    
    def _start_auto_sync(self):
        """Start automatic sync loop"""
        async def sync_loop():
            while True:
                try:
                    await self.sync()
                    await asyncio.sleep(self.config.interval_seconds)
                except Exception as e:
                    print(f"Auto-sync error: {e}")
                    await asyncio.sleep(self.config.retry_delay_ms / 1000)
        
        self._sync_task = asyncio.create_task(sync_loop())
    
    def stop_auto_sync(self):
        """Stop automatic sync"""
        if self._sync_task:
            self._sync_task.cancel()
    
    async def sync(self) -> Dict[str, Any]:
        """Perform full sync (push then pull)"""
        push_result = await self.push()
        pull_result = await self.pull()
        
        self.status.last_sync_at = datetime.utcnow()
        
        return {
            'push': push_result,
            'pull': pull_result,
            'status': self.status
        }
    
    async def push(self) -> SyncPushResponse:
        """Push local changes to cloud"""
        self._emit_event('push_started')
        
        try:
            # Get all local entities
            entities = self.vault_storage.scan_all()
            
            # Convert to sync items
            sync_items = self._entities_to_sync_items(entities)
            
            if not sync_items:
                return SyncPushResponse(
                    success=True,
                    accepted_items=[],
                    rejected_items=[],
                    conflicts=[],
                    new_version=self.status.remote_version
                )
            
            # Create batch
            batch = SyncBatch(
                items=sync_items,
                batch_id=self._generate_batch_id(),
                tenant_id=self.tenant_id,
                timestamp=datetime.utcnow(),
                source_device=self.device_id
            )
            
            # Send to cloud
            request = SyncPushRequest(
                tenant_id=self.tenant_id,
                batch=batch,
                since_version=self.status.remote_version,
                device_id=self.device_id
            )
            
            response = await self._send_push_request(request)
            
            # Update status
            self.status.remote_version = response.new_version
            self.status.last_push_at = datetime.utcnow()
            self.status.conflict_count = len(response.conflicts)
            
            # Handle conflicts
            if response.conflicts:
                self._emit_event('conflict_detected', {
                    'count': len(response.conflicts)
                })
                await self._handle_conflicts(response.conflicts)
            
            self._emit_event('push_completed', {
                'accepted': len(response.accepted_items),
                'rejected': len(response.rejected_items),
                'conflicts': len(response.conflicts)
            })
            
            return response
            
        except Exception as e:
            self._emit_event('sync_error', {'error': str(e), 'operation': 'push'})
            raise
    
    async def pull(self) -> SyncPullResponse:
        """Pull cloud changes to local"""
        self._emit_event('pull_started')
        
        try:
            # Request changes from cloud
            request = SyncPullRequest(
                tenant_id=self.tenant_id,
                since_version=self.status.remote_version,
                device_id=self.device_id,
                max_items=self.config.batch_size
            )
            
            response = await self._send_pull_request(request)
            
            # Apply changes locally
            await self._apply_remote_changes(response.items)
            
            # Update status
            self.status.remote_version = response.latest_version
            self.status.last_pull_at = datetime.utcnow()
            
            self._emit_event('pull_completed', {
                'items': len(response.items),
                'has_more': response.has_more
            })
            
            return response
            
        except Exception as e:
            self._emit_event('sync_error', {'error': str(e), 'operation': 'pull'})
            raise
    
    def _entities_to_sync_items(self, entities: List[VaultEntity]) -> List[SyncItem]:
        """Convert vault entities to sync items"""
        items = []
        
        for entity in entities:
            items.append(SyncItem(
                id=entity.id,
                tenant_id=self.tenant_id,
                entity_type='note',  # TODO: Detect entity type
                operation='create',  # TODO: Detect operation
                data={
                    'title': entity.title,
                    'content': entity.content,
                    'vault_path': entity.vault_path,
                    'metadata': entity.metadata
                },
                truth_metadata=entity.truth_metadata,
                version=self.status.local_version,
                timestamp=entity.truth_metadata.updated_at,
                source_device=self.device_id
            ))
        
        return items
    
    async def _apply_remote_changes(self, items: List[SyncItem]) -> None:
        """Apply remote changes to local vault"""
        for item in items:
            try:
                # Check if local version exists
                local_entity = self.vault_storage.get_entity(
                    item.data.get('vault_path', f"{item.id}.md")
                )
                
                if local_entity:
                    # Conflict detection
                    local_item = self._entity_to_sync_item(local_entity)
                    
                    if not self.resolver.can_remote_overwrite_local(local_item, item):
                        # Remote cannot overwrite - keep local
                        print(f"Skipping remote change for {item.id} - local has higher truth")
                        continue
                
                # Apply change
                if item.operation == 'create' or item.operation == 'update':
                    self.vault_storage.update_entity(
                        vault_path=item.data.get('vault_path', f"{item.id}.md"),
                        updates={
                            'title': item.data.get('title'),
                            'content': item.data.get('content'),
                            'metadata': item.data.get('metadata', {})
                        },
                        truth_level=item.truth_metadata.truth_level,
                        origin_source=item.truth_metadata.origin_source
                    )
                elif item.operation == 'delete':
                    self.vault_storage.delete_entity(
                        item.data.get('vault_path', f"{item.id}.md")
                    )
                    
            except Exception as e:
                print(f"Error applying remote change {item.id}: {e}")
    
    def _entity_to_sync_item(self, entity: VaultEntity) -> SyncItem:
        """Convert vault entity to sync item"""
        return SyncItem(
            id=entity.id,
            tenant_id=self.tenant_id,
            entity_type='note',
            operation='update',
            data={
                'title': entity.title,
                'content': entity.content,
                'vault_path': entity.vault_path,
                'metadata': entity.metadata
            },
            truth_metadata=entity.truth_metadata,
            version=self.status.local_version,
            timestamp=entity.truth_metadata.updated_at,
            source_device=self.device_id
        )
    
    async def _handle_conflicts(self, conflicts: List[Any]) -> None:
        """Handle sync conflicts"""
        for conflict in conflicts:
            if self.config.conflict_resolution == 'truth-hierarchy':
                # Auto-resolve using truth hierarchy
                resolution = self.resolver.resolve(conflict)
                
                # Apply resolution
                await self._apply_remote_changes([resolution])
                
                self._emit_event('conflict_resolved', {
                    'entity_id': conflict.entity_id,
                    'resolution': conflict.resolution
                })
            elif self.config.conflict_resolution == 'manual':
                # Queue for manual resolution
                print(f"Manual conflict resolution needed for: {conflict.entity_id}")
                # TODO: Add to conflict queue
    
    async def _send_push_request(self, request: SyncPushRequest) -> SyncPushResponse:
        """Send push request to cloud API"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.cloud_api_url}/sync/push",
                json=request.dict(),
                timeout=30.0
            )
            response.raise_for_status()
            return SyncPushResponse(**response.json())
    
    async def _send_pull_request(self, request: SyncPullRequest) -> SyncPullResponse:
        """Send pull request to cloud API"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.cloud_api_url}/sync/pull",
                json=request.dict(),
                timeout=30.0
            )
            response.raise_for_status()
            return SyncPullResponse(**response.json())
    
    def _generate_batch_id(self) -> str:
        """Generate unique batch ID"""
        import uuid
        return str(uuid.uuid4())
    
    def _emit_event(self, event_type: str, metadata: Optional[Dict[str, Any]] = None):
        """Emit sync event for logging/observability"""
        event = SyncEvent(
            id=self._generate_batch_id(),
            tenant_id=self.tenant_id,
            event_type=event_type,
            timestamp=datetime.utcnow(),
            metadata=metadata or {}
        )
        
        # TODO: Send to event logging system
        print(f"Sync event: {event_type} - {metadata}")
