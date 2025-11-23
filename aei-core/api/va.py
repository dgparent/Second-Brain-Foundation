"""
SBF VA (Virtual Assistant) API endpoints.

Provides entity management for VA workflows:
- va.client - Client management
- va.task - Task tracking
- va.meeting - Meeting records
- va.report - Weekly/monthly reports
- va.sop - Standard Operating Procedures
"""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel, Field
import uuid

router = APIRouter()

# Mock database (replace with actual database)
entities_db = {}
webhooks_db = {}


# ========== Models ==========

class Entity(BaseModel):
    """Base entity model for SBF knowledge graph"""
    uid: Optional[str] = None
    type: str
    client_uid: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    source: Optional[str] = "api"
    source_metadata: Optional[dict] = {}


class VATask(Entity):
    """VA Task entity"""
    type: str = "va.task"
    title: str
    description: Optional[str] = ""
    priority: str = Field(default="normal", pattern="^(low|normal|high|urgent)$")
    status: str = Field(default="pending", pattern="^(pending|in_progress|blocked|done)$")
    due_date: Optional[datetime] = None
    tags: List[str] = []
    assigned_to: Optional[str] = None


class VAMeeting(Entity):
    """VA Meeting entity"""
    type: str = "va.meeting"
    title: str
    scheduled_time: datetime
    duration_minutes: int = 30
    platform: str = "zoom"
    meeting_link: Optional[str] = None
    attendees: List[str] = []
    agenda: Optional[str] = ""
    status: str = "scheduled"
    notes: Optional[str] = None


class VAClient(Entity):
    """VA Client entity"""
    type: str = "va.client"
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    status: str = "active"
    onboarding_date: Optional[datetime] = None
    va_assigned: Optional[str] = None


class Webhook(BaseModel):
    """Webhook registration"""
    url: str
    events: List[str] = ["entity.created", "entity.updated"]
    filters: dict = {}
    active: bool = True
    created_at: Optional[datetime] = None


class EntityQuery(BaseModel):
    """Query parameters for entity search"""
    type: Optional[str] = None
    client_uid: Optional[str] = None
    limit: int = 100


class EntityResponse(BaseModel):
    """API response wrapper"""
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None


# ========== Authentication ==========

async def verify_api_key(authorization: str = Header(...)):
    """Verify API key from Authorization header"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    api_key = authorization.replace("Bearer ", "")
    
    # TODO: Implement actual API key validation
    # For now, accept any non-empty key
    if not api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    return api_key


# ========== Entity Endpoints ==========

@router.post("/entities", response_model=EntityResponse, dependencies=[Depends(verify_api_key)])
async def create_entity(entity: dict):
    """
    Create a new entity in the SBF knowledge graph.
    
    Supports:
    - va.task - Virtual Assistant tasks
    - va.meeting - Meeting records
    - va.client - Client information
    - va.report - Status reports
    - va.sop - Standard Operating Procedures
    """
    try:
        # Generate UID if not provided
        if "uid" not in entity or not entity["uid"]:
            entity_type = entity.get("type", "unknown").replace(".", "-")
            entity["uid"] = f"{entity_type}-{uuid.uuid4().hex[:12]}"
        
        # Add timestamps
        now = datetime.utcnow()
        entity["created_at"] = now.isoformat()
        entity["updated_at"] = now.isoformat()
        
        # Validate client_uid exists
        if "client_uid" not in entity:
            raise HTTPException(status_code=400, detail="client_uid is required")
        
        # Store entity
        entities_db[entity["uid"]] = entity
        
        # Trigger webhooks
        await trigger_webhooks("entity.created", entity)
        
        return EntityResponse(success=True, data=entity)
    
    except Exception as e:
        return EntityResponse(success=False, error=str(e))


@router.get("/entities", response_model=EntityResponse, dependencies=[Depends(verify_api_key)])
async def query_entities(
    type: Optional[str] = None,
    client_uid: Optional[str] = None,
    limit: int = 100
):
    """
    Query entities with optional filters.
    
    Filters:
    - type: Entity type (e.g., va.task, va.meeting)
    - client_uid: Filter by specific client
    - limit: Maximum results (default 100)
    """
    try:
        results = list(entities_db.values())
        
        # Apply filters
        if type:
            results = [e for e in results if e.get("type") == type]
        
        if client_uid:
            results = [e for e in results if e.get("client_uid") == client_uid]
        
        # Apply limit
        results = results[:limit]
        
        return EntityResponse(success=True, data=results)
    
    except Exception as e:
        return EntityResponse(success=False, error=str(e))


@router.get("/entities/{uid}", response_model=EntityResponse, dependencies=[Depends(verify_api_key)])
async def get_entity(uid: str):
    """Get a specific entity by UID"""
    try:
        if uid not in entities_db:
            raise HTTPException(status_code=404, detail=f"Entity {uid} not found")
        
        return EntityResponse(success=True, data=entities_db[uid])
    
    except HTTPException:
        raise
    except Exception as e:
        return EntityResponse(success=False, error=str(e))


@router.patch("/entities/{uid}", response_model=EntityResponse, dependencies=[Depends(verify_api_key)])
async def update_entity(uid: str, updates: dict):
    """Update an existing entity"""
    try:
        if uid not in entities_db:
            raise HTTPException(status_code=404, detail=f"Entity {uid} not found")
        
        # Merge updates
        entity = entities_db[uid]
        entity.update(updates)
        entity["updated_at"] = datetime.utcnow().isoformat()
        
        entities_db[uid] = entity
        
        # Trigger webhooks
        await trigger_webhooks("entity.updated", entity)
        
        return EntityResponse(success=True, data=entity)
    
    except HTTPException:
        raise
    except Exception as e:
        return EntityResponse(success=False, error=str(e))


@router.delete("/entities/{uid}", response_model=EntityResponse, dependencies=[Depends(verify_api_key)])
async def delete_entity(uid: str):
    """Delete an entity"""
    try:
        if uid not in entities_db:
            raise HTTPException(status_code=404, detail=f"Entity {uid} not found")
        
        entity = entities_db.pop(uid)
        
        return EntityResponse(success=True, data={"uid": uid, "deleted": True})
    
    except HTTPException:
        raise
    except Exception as e:
        return EntityResponse(success=False, error=str(e))


# ========== Webhook Endpoints ==========

@router.post("/webhooks", response_model=EntityResponse, dependencies=[Depends(verify_api_key)])
async def register_webhook(webhook: Webhook):
    """Register a webhook for entity events"""
    try:
        webhook_id = f"webhook-{uuid.uuid4().hex[:12]}"
        webhook.created_at = datetime.utcnow()
        
        webhooks_db[webhook_id] = webhook.dict()
        
        return EntityResponse(
            success=True,
            data={"webhook_id": webhook_id, **webhook.dict()}
        )
    
    except Exception as e:
        return EntityResponse(success=False, error=str(e))


@router.delete("/webhooks", response_model=EntityResponse, dependencies=[Depends(verify_api_key)])
async def unregister_webhook(url: str = None, webhook_id: str = None):
    """Unregister a webhook by URL or ID"""
    try:
        if webhook_id and webhook_id in webhooks_db:
            del webhooks_db[webhook_id]
            return EntityResponse(success=True, data={"webhook_id": webhook_id, "deleted": True})
        
        if url:
            # Find and delete by URL
            for wid, webhook in list(webhooks_db.items()):
                if webhook.get("url") == url:
                    del webhooks_db[wid]
                    return EntityResponse(success=True, data={"url": url, "deleted": True})
        
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    except HTTPException:
        raise
    except Exception as e:
        return EntityResponse(success=False, error=str(e))


@router.get("/webhooks", response_model=EntityResponse, dependencies=[Depends(verify_api_key)])
async def list_webhooks():
    """List all registered webhooks"""
    try:
        return EntityResponse(success=True, data=list(webhooks_db.values()))
    except Exception as e:
        return EntityResponse(success=False, error=str(e))


# ========== Helper Functions ==========

async def trigger_webhooks(event: str, entity: dict):
    """Trigger registered webhooks for an event"""
    import httpx
    
    for webhook_id, webhook in webhooks_db.items():
        if not webhook.get("active"):
            continue
        
        if event not in webhook.get("events", []):
            continue
        
        # Apply filters
        filters = webhook.get("filters", {})
        if filters.get("entity_type") and entity.get("type") != filters["entity_type"]:
            continue
        if filters.get("client_uid") and entity.get("client_uid") != filters["client_uid"]:
            continue
        
        # Send webhook (async, non-blocking)
        try:
            payload = {
                "event": event,
                "entity": entity,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            async with httpx.AsyncClient() as client:
                await client.post(webhook["url"], json=payload, timeout=5.0)
        
        except Exception as e:
            print(f"Webhook {webhook_id} failed: {e}")
            # TODO: Log failed webhook delivery


# ========== Statistics Endpoints ==========

@router.get("/stats", response_model=EntityResponse, dependencies=[Depends(verify_api_key)])
async def get_statistics(client_uid: Optional[str] = None):
    """Get entity statistics"""
    try:
        entities = list(entities_db.values())
        
        if client_uid:
            entities = [e for e in entities if e.get("client_uid") == client_uid]
        
        stats = {
            "total_entities": len(entities),
            "by_type": {},
            "by_client": {},
        }
        
        for entity in entities:
            entity_type = entity.get("type", "unknown")
            stats["by_type"][entity_type] = stats["by_type"].get(entity_type, 0) + 1
            
            client = entity.get("client_uid", "unknown")
            stats["by_client"][client] = stats["by_client"].get(client, 0) + 1
        
        return EntityResponse(success=True, data=stats)
    
    except Exception as e:
        return EntityResponse(success=False, error=str(e))
