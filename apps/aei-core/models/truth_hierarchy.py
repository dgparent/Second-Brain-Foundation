"""
Truth Hierarchy for 2BF Local-First, Cloud-Augmented System

Truth Levels (highest to lowest):
1. U1 - User (highest truth, canonical source)
2. A2 - Automation (system-generated, deterministic)
3. L3 - AI Local (local model outputs)
4. LN4 - AI Local Network (p2p/local network AI)
5. C5 - AI Cloud (lowest truth, cloud AI outputs)
"""

from enum import IntEnum
from typing import Dict, List, Optional, Literal, Any
from datetime import datetime
from pydantic import BaseModel, Field


class TruthLevel(IntEnum):
    """Truth level hierarchy - lower numbers = higher authority"""
    USER = 1              # U1 - User-generated content
    AUTOMATION = 2        # A2 - System automations
    AI_LOCAL = 3          # L3 - Local AI models
    AI_LOCAL_NETWORK = 4  # LN4 - Local network AI
    AI_CLOUD = 5          # C5 - Cloud AI services


OriginSource = str  # Format: "<type>:<identifier>"
# Examples:
# - user:web
# - user:mobile
# - user:voice
# - automation:file-watcher
# - ai-local:llama3
# - ai-cloud:openai-gpt4


class OriginChainEntry(BaseModel):
    """Single entry in the origin/modification chain"""
    timestamp: datetime
    truth_level: TruthLevel
    source: OriginSource
    action: Literal['created', 'modified', 'accepted', 'merged']
    metadata: Optional[Dict[str, Any]] = None


class TruthMetadata(BaseModel):
    """Truth hierarchy metadata for entities"""
    truth_level: TruthLevel
    origin_source: OriginSource
    origin_chain: List[OriginChainEntry]
    accepted_by_user: bool = False
    last_modified_by_level: TruthLevel
    created_at: datetime
    updated_at: datetime


class VaultMode(str):
    """Vault mode constants"""
    LOCAL_FIRST = "local_first"
    CLOUD_FIRST = "cloud_first"
    HYBRID = "hybrid"


def is_higher_truth(a: TruthLevel, b: TruthLevel) -> bool:
    """Check if truth level 'a' has higher authority than 'b'"""
    return a < b  # Lower number = higher truth


def can_overwrite(
    existing_level: TruthLevel,
    new_level: TruthLevel,
    existing_accepted: bool
) -> bool:
    """Determine if an entity can be overwritten by a new truth level"""
    # User content (U1) cannot be overwritten by anything lower
    if existing_level == TruthLevel.USER:
        return new_level == TruthLevel.USER
    
    # Accepted content is protected unless new content is higher truth
    if existing_accepted:
        return is_higher_truth(new_level, existing_level)
    
    # Otherwise, higher truth can overwrite
    return is_higher_truth(new_level, existing_level) or new_level == existing_level


def upgrade_to_user_truth(
    current_metadata: TruthMetadata,
    user_id: str,
    action: Literal['edited', 'accepted'] = 'accepted'
) -> TruthMetadata:
    """Upgrade entity to User truth level (U1)"""
    new_entry = OriginChainEntry(
        timestamp=datetime.utcnow(),
        truth_level=TruthLevel.USER,
        source=f"user:{user_id}",
        action=action,
        metadata={"previous_level": current_metadata.truth_level}
    )
    
    current_metadata.truth_level = TruthLevel.USER
    current_metadata.origin_source = f"user:{user_id}"
    current_metadata.accepted_by_user = True
    current_metadata.last_modified_by_level = TruthLevel.USER
    current_metadata.origin_chain.append(new_entry)
    current_metadata.updated_at = datetime.utcnow()
    
    return current_metadata


def create_truth_metadata(
    truth_level: TruthLevel,
    origin_source: OriginSource
) -> TruthMetadata:
    """Create initial truth metadata for new entity"""
    now = datetime.utcnow()
    
    return TruthMetadata(
        truth_level=truth_level,
        origin_source=origin_source,
        origin_chain=[OriginChainEntry(
            timestamp=now,
            truth_level=truth_level,
            source=origin_source,
            action='created'
        )],
        accepted_by_user=(truth_level == TruthLevel.USER),
        last_modified_by_level=truth_level,
        created_at=now,
        updated_at=now
    )


def append_modification(
    metadata: TruthMetadata,
    truth_level: TruthLevel,
    source: OriginSource,
    action: Literal['modified', 'merged'] = 'modified'
) -> TruthMetadata:
    """Append modification to origin chain"""
    new_entry = OriginChainEntry(
        timestamp=datetime.utcnow(),
        truth_level=truth_level,
        source=source,
        action=action
    )
    
    metadata.truth_level = truth_level
    metadata.origin_source = source
    metadata.last_modified_by_level = truth_level
    metadata.origin_chain.append(new_entry)
    metadata.updated_at = datetime.utcnow()
    
    return metadata
