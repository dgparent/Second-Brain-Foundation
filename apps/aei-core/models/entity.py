"""
Pydantic models for entity types.

Defines the schema for all 10 entity types with full YAML frontmatter support.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, HttpUrl


class EntityType(str, Enum):
    """Entity type enumeration"""
    PERSON = "person"
    PLACE = "place"
    TOPIC = "topic"
    PROJECT = "project"
    DAILY_NOTE = "daily-note"
    SOURCE = "source"
    ARTIFACT = "artifact"
    EVENT = "event"
    TASK = "task"
    PROCESS = "process"


class Sensitivity(str, Enum):
    """Sensitivity level for privacy control"""
    PUBLIC = "public"
    PERSONAL = "personal"
    CONFIDENTIAL = "confidential"
    SECRET = "secret"


class LifecycleState(str, Enum):
    """Entity lifecycle state"""
    CAPTURED = "captured"
    TRANSITIONAL = "transitional"
    PERMANENT = "permanent"
    ARCHIVED = "archived"


class Relationship(BaseModel):
    """Typed relationship between entities"""
    uid: str = Field(..., description="Target entity UID")
    type: str = Field(..., description="Relationship type (e.g., 'authored_by', 'mentions')")
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Confidence score")
    source_uid: Optional[str] = Field(None, description="Source that established relationship")
    created_at: datetime = Field(default_factory=datetime.now)


class Provenance(BaseModel):
    """Provenance tracking for entity creation"""
    source: str = Field(..., description="Source reference (e.g., 'note://2025-11-13.md')")
    created_at: datetime = Field(default_factory=datetime.now)
    created_by: str = Field(..., description="Agent or user identifier")
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)


class ContextPermissions(BaseModel):
    """Privacy and AI processing permissions"""
    cloud_ai_allowed: bool = False
    local_ai_allowed: bool = True
    export_allowed: bool = True


class EntityBase(BaseModel):
    """Base model for all entities with common fields"""
    uid: str = Field(..., description="Unique identifier (deterministic)")
    type: EntityType
    title: str = Field(..., min_length=1)
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.now)
    modified_at: datetime = Field(default_factory=datetime.now)
    
    # Lifecycle
    lifecycle_state: LifecycleState = LifecycleState.CAPTURED
    
    # Privacy
    sensitivity: Sensitivity = Sensitivity.PERSONAL
    context_permissions: ContextPermissions = Field(default_factory=ContextPermissions)
    
    # Relationships
    relationships: List[Relationship] = Field(default_factory=list)
    
    # Provenance
    provenance: Optional[Provenance] = None
    
    # Content
    content: str = Field(default="", description="Markdown content")
    
    # BMOM (Business/Mission/Operational Metadata)
    tags: List[str] = Field(default_factory=list)
    custom_fields: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_schema_extra = {
            "example": {
                "uid": "person-john-smith-001",
                "type": "person",
                "title": "John Smith",
                "sensitivity": "personal",
                "lifecycle_state": "permanent",
                "relationships": [
                    {"uid": "topic-ai-research-001", "type": "expert_in"}
                ],
                "tags": ["colleague", "researcher"]
            }
        }


class PersonEntity(EntityBase):
    """Person entity with role and contact information"""
    type: EntityType = EntityType.PERSON
    role: Optional[str] = None
    organization: Optional[str] = None
    email: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "uid": "person-jane-doe-001",
                "type": "person",
                "title": "Jane Doe",
                "role": "Senior Researcher",
                "organization": "AI Lab",
                "email": "jane@example.com"
            }
        }


class TopicEntity(EntityBase):
    """Topic/concept entity with domain information"""
    type: EntityType = EntityType.TOPIC
    domain: Optional[str] = None
    maturity: Optional[str] = Field(None, description="nascent|developing|established|mature")
    
    class Config:
        json_schema_extra = {
            "example": {
                "uid": "topic-knowledge-graphs-001",
                "type": "topic",
                "title": "Knowledge Graphs",
                "domain": "Computer Science",
                "maturity": "established"
            }
        }


class ProjectEntity(EntityBase):
    """Project entity with timeline and status"""
    type: EntityType = EntityType.PROJECT
    status: Optional[str] = Field(None, description="planning|active|paused|completed|archived")
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "uid": "project-aei-mvp-001",
                "type": "project",
                "title": "AEI MVP Development",
                "status": "active",
                "start_date": "2025-11-13T00:00:00Z"
            }
        }


class PlaceEntity(EntityBase):
    """Place entity (physical, virtual, or conceptual)"""
    type: EntityType = EntityType.PLACE
    place_type: Optional[str] = Field(None, description="physical|virtual|conceptual")
    location: Optional[str] = None
    url: Optional[HttpUrl] = None


class DailyNoteEntity(EntityBase):
    """Daily note for zero-decision capture"""
    type: EntityType = EntityType.DAILY_NOTE
    date: datetime = Field(..., description="Date this note represents")
    
    class Config:
        json_schema_extra = {
            "example": {
                "uid": "daily-2025-11-13",
                "type": "daily-note",
                "title": "November 13, 2025",
                "date": "2025-11-13T00:00:00Z",
                "lifecycle_state": "captured"
            }
        }


# Database models (SQLAlchemy) will be in db/models.py
