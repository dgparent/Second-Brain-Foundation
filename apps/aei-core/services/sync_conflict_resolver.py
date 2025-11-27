"""
Sync Conflict Resolver for Truth Hierarchy
Implements rules from re-alignment-hybrid-sync-contract.md
"""

from typing import List, Dict, Optional, Tuple
from datetime import datetime

from .sync_models import SyncItem, SyncConflict, SyncConfig
from .truth_hierarchy import TruthLevel, is_higher_truth, can_overwrite


class SyncConflictResolver:
    """Resolves sync conflicts using truth hierarchy rules"""
    
    def __init__(self, config: SyncConfig):
        self.config = config
    
    def resolve(self, conflict: SyncConflict) -> SyncItem:
        """Resolve a sync conflict between local and remote versions"""
        local = conflict.local_version
        remote = conflict.remote_version
        
        # Apply truth hierarchy rules
        resolution = self._apply_truth_hierarchy(local, remote)
        
        # Update conflict record
        conflict.resolution = 'local_wins' if resolution == local else 'remote_wins'
        conflict.resolved_at = datetime.utcnow()
        
        return resolution
    
    def _apply_truth_hierarchy(self, local: SyncItem, remote: SyncItem) -> SyncItem:
        """Apply truth hierarchy rules to determine winner"""
        local_truth = local.truth_metadata
        remote_truth = remote.truth_metadata
        
        # Rule 1: U1 always wins over lower levels
        if local_truth.truth_level == TruthLevel.USER and remote_truth.truth_level != TruthLevel.USER:
            return local
        if remote_truth.truth_level == TruthLevel.USER and local_truth.truth_level != TruthLevel.USER:
            return remote
        
        # Rule 2: Both U1 - use last-write-wins
        if local_truth.truth_level == TruthLevel.USER and remote_truth.truth_level == TruthLevel.USER:
            return self._last_write_wins(local, remote)
        
        # Rule 3: Higher truth level wins
        if is_higher_truth(local_truth.truth_level, remote_truth.truth_level):
            return local
        if is_higher_truth(remote_truth.truth_level, local_truth.truth_level):
            return remote
        
        # Rule 4: Same truth level - check if accepted by user
        if local_truth.accepted_by_user and not remote_truth.accepted_by_user:
            return local
        if remote_truth.accepted_by_user and not local_truth.accepted_by_user:
            return remote
        
        # Rule 5: Fall back to last-write-wins
        return self._last_write_wins(local, remote)
    
    def _last_write_wins(self, local: SyncItem, remote: SyncItem) -> SyncItem:
        """Last-write-wins strategy based on timestamp"""
        local_time = local.truth_metadata.updated_at
        remote_time = remote.truth_metadata.updated_at
        
        return local if local_time >= remote_time else remote
    
    def can_remote_overwrite_local(self, local: SyncItem, remote: SyncItem) -> bool:
        """Check if remote can overwrite local based on truth rules"""
        return can_overwrite(
            local.truth_metadata.truth_level,
            remote.truth_metadata.truth_level,
            local.truth_metadata.accepted_by_user
        )
    
    def detect_conflicts(
        self,
        local_items: Dict[str, SyncItem],
        remote_items: List[SyncItem]
    ) -> List[SyncConflict]:
        """Detect conflicts in a batch of items"""
        conflicts = []
        
        for remote in remote_items:
            local = local_items.get(remote.id)
            
            if not local:
                continue  # No local version, no conflict
            
            if self._has_conflict(local, remote):
                conflicts.append(self._create_conflict(local, remote))
        
        return conflicts
    
    def _has_conflict(self, local: SyncItem, remote: SyncItem) -> bool:
        """Check if two versions conflict"""
        # Different versions indicate potential conflict
        if local.version != remote.version:
            # Check if timestamps are very close (concurrent edits)
            time_diff = abs(
                (local.timestamp - remote.timestamp).total_seconds()
            )
            
            # If within 5 seconds, consider concurrent
            if time_diff < 5:
                return True
            
            # Check if both are user-level changes
            if (local.truth_metadata.truth_level == TruthLevel.USER and
                remote.truth_metadata.truth_level == TruthLevel.USER):
                return True
        
        return False
    
    def _create_conflict(self, local: SyncItem, remote: SyncItem) -> SyncConflict:
        """Create a conflict record"""
        local_level = local.truth_metadata.truth_level
        remote_level = remote.truth_metadata.truth_level
        
        if local_level == TruthLevel.USER and remote_level == TruthLevel.USER:
            conflict_type = 'concurrent_user'
        elif local_level == TruthLevel.USER and remote_level == TruthLevel.AUTOMATION:
            conflict_type = 'user_vs_automation'
        elif local_level == TruthLevel.USER and remote_level >= TruthLevel.AI_LOCAL:
            conflict_type = 'user_vs_ai'
        else:
            conflict_type = 'version_mismatch'
        
        return SyncConflict(
            entity_id=local.id,
            tenant_id=local.tenant_id,
            local_version=local,
            remote_version=remote,
            conflict_type=conflict_type
        )
    
    def auto_resolve(self, conflicts: List[SyncConflict]) -> List[Tuple[SyncConflict, SyncItem]]:
        """Auto-resolve conflicts based on config strategy"""
        return [
            (conflict, self.resolve(conflict))
            for conflict in conflicts
        ]
