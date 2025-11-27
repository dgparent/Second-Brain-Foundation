"""
Sync System Models for Local-First, Cloud-Augmented Hybrid
Based on re-alignment-hybrid-sync-contract.md
"""

from typing import Dict, List, Optional, Literal, Any
from datetime import datetime
from pydantic import BaseModel, Field
from .truth_hierarchy import TruthMetadata, TruthLevel


class SyncItem(BaseModel):
    """Single entity change to be synced"""
    id: str
    tenant_id: str
    entity_type: str
    operation: Literal['create', 'update', 'delete']
    
    # Entity data
    data: Dict[str, Any]
    
    # Truth hierarchy metadata
    truth_metadata: TruthMetadata
    
    # Sync metadata
    version: int
    timestamp: datetime
    checksum: Optional[str] = None
    
    # Source tracking
    source_device: Optional[str] = None
    source_channel: Optional[str] = None


class SyncBatch(BaseModel):
    """Batch of sync items"""
    items: List[SyncItem]
    batch_id: str
    tenant_id: str
    timestamp: datetime
    source_device: Optional[str] = None


class SyncConflict(BaseModel):
    """Conflict between local and remote versions"""
    entity_id: str
    tenant_id: str
    local_version: SyncItem
    remote_version: SyncItem
    conflict_type: Literal['concurrent_user', 'user_vs_automation', 'user_vs_ai', 'version_mismatch']
    resolution: Optional[Literal['local_wins', 'remote_wins', 'manual', 'merged']] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None


class SyncPushRequest(BaseModel):
    """Request to push local changes to cloud"""
    tenant_id: str
    batch: SyncBatch
    since_version: Optional[int] = None
    device_id: str


class SyncPushResponse(BaseModel):
    """Response from cloud after push"""
    success: bool
    accepted_items: List[str]  # IDs of accepted items
    rejected_items: List[Dict[str, Any]]
    conflicts: List[SyncConflict]
    new_version: int


class SyncPullRequest(BaseModel):
    """Request to pull cloud changes"""
    tenant_id: str
    since_version: Optional[int] = None
    since_timestamp: Optional[datetime] = None
    device_id: str
    max_items: Optional[int] = 100


class SyncPullResponse(BaseModel):
    """Response with cloud changes"""
    items: List[SyncItem]
    latest_version: int
    has_more: bool
    next_cursor: Optional[str] = None


class SyncStatus(BaseModel):
    """Sync status for a tenant"""
    tenant_id: str
    last_sync_at: Optional[datetime] = None
    last_push_at: Optional[datetime] = None
    last_pull_at: Optional[datetime] = None
    local_version: int = 0
    remote_version: int = 0
    pending_items: int = 0
    conflict_count: int = 0
    sync_enabled: bool = True
    auto_sync_interval: Optional[int] = None


class SyncConfig(BaseModel):
    """Sync configuration"""
    enabled: bool = True
    auto_sync: bool = True
    interval_seconds: int = 300  # 5 minutes default
    batch_size: int = 100
    conflict_resolution: Literal['local-wins', 'cloud-wins', 'manual', 'truth-hierarchy'] = 'truth-hierarchy'
    encrypt_before_sync: bool = False
    compress_payload: bool = True
    retry_attempts: int = 3
    retry_delay_ms: int = 1000


class SyncEvent(BaseModel):
    """Sync event for logging"""
    id: str
    tenant_id: str
    event_type: Literal[
        'push_started', 'push_completed', 
        'pull_started', 'pull_completed',
        'conflict_detected', 'conflict_resolved',
        'sync_error'
    ]
    timestamp: datetime
    metadata: Dict[str, Any]
    item_count: Optional[int] = None
    conflict_count: Optional[int] = None
    error_message: Optional[str] = None
