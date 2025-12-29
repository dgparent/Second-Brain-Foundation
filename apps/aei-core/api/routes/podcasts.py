"""
Podcast API Routes

REST API endpoints for podcast generation.
"""
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from pydantic import BaseModel, Field

from models.podcast import Podcast, PodcastStatus


router = APIRouter(prefix="/podcasts", tags=["podcasts"])


# =============================================================================
# Request/Response Models
# =============================================================================

class PodcastGenerateRequest(BaseModel):
    """Request model for podcast generation."""
    
    source_ids: List[str] = Field(
        description="IDs of source documents to generate podcast from"
    )
    title: Optional[str] = Field(
        default=None,
        description="Optional custom title for the podcast"
    )
    insights: Optional[List[str]] = Field(
        default=None,
        description="Key insights to incorporate"
    )
    style: str = Field(
        default="conversational",
        description="Podcast style: conversational, educational, debate"
    )
    target_length: str = Field(
        default="medium",
        description="Target length: short (5-8min), medium (10-15min), long (20-30min)"
    )
    voice_config: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Voice configuration for hosts"
    )
    include_background_music: bool = Field(
        default=False,
        description="Add subtle background music"
    )


class PodcastResponse(BaseModel):
    """Response model for podcast data."""
    
    id: str
    title: str
    status: str
    source_ids: List[str]
    audio_url: Optional[str] = None
    duration: Optional[int] = None
    file_size: Optional[int] = None
    created_at: str
    updated_at: str
    error_message: Optional[str] = None
    script_preview: Optional[str] = None
    
    @classmethod
    def from_podcast(cls, podcast: Podcast) -> "PodcastResponse":
        """Create response from Podcast model."""
        script_preview = None
        if podcast.script and podcast.script.segments:
            # Get first 3 segments as preview
            preview_segments = podcast.script.segments[:3]
            script_preview = "\n\n".join(
                f"**{seg.speaker}**: {seg.text[:200]}..."
                if len(seg.text) > 200 else f"**{seg.speaker}**: {seg.text}"
                for seg in preview_segments
            )
        
        return cls(
            id=podcast.id,
            title=podcast.title,
            status=podcast.status.value,
            source_ids=podcast.source_ids,
            audio_url=podcast.audio_url,
            duration=podcast.duration,
            file_size=podcast.file_size,
            created_at=podcast.created_at.isoformat(),
            updated_at=podcast.updated_at.isoformat(),
            error_message=podcast.error_message,
            script_preview=script_preview,
        )


class PodcastListResponse(BaseModel):
    """Response model for podcast list."""
    
    podcasts: List[PodcastResponse]
    total: int
    page: int
    page_size: int


class ScriptPreviewRequest(BaseModel):
    """Request for script preview (without audio generation)."""
    
    source_ids: List[str]
    insights: Optional[List[str]] = None
    style: str = "conversational"
    target_length: str = "medium"


class ScriptPreviewResponse(BaseModel):
    """Response for script preview."""
    
    title: str
    segments: List[Dict[str, Any]]
    total_duration: Optional[int] = None
    estimated_word_count: int


class RegenerateSegmentRequest(BaseModel):
    """Request to regenerate a specific segment."""
    
    segment_id: str
    custom_prompt: Optional[str] = None


class PodcastProgressResponse(BaseModel):
    """Response for podcast generation progress."""
    
    id: str
    status: str
    progress: float = Field(ge=0.0, le=1.0)
    stage: str
    message: str


# =============================================================================
# In-memory storage (replace with proper repository in production)
# =============================================================================

_podcasts: Dict[str, Podcast] = {}
_progress: Dict[str, Dict[str, Any]] = {}


def get_podcast_engine():
    """Get the podcast engine instance."""
    # This would be dependency injected in production
    # For now, return None and handle in endpoints
    return None


# =============================================================================
# API Endpoints
# =============================================================================

@router.post("", status_code=status.HTTP_202_ACCEPTED)
async def generate_podcast(
    request: PodcastGenerateRequest,
    background_tasks: BackgroundTasks,
) -> Dict[str, str]:
    """
    Start podcast generation from source documents.
    
    Returns a podcast ID immediately, generation happens in background.
    """
    podcast_id = str(uuid4())
    
    # Create initial podcast record
    podcast = Podcast(
        id=podcast_id,
        title=request.title or f"Podcast from {len(request.source_ids)} sources",
        source_ids=request.source_ids,
    )
    
    _podcasts[podcast_id] = podcast
    _progress[podcast_id] = {
        "progress": 0.0,
        "stage": "queued",
        "message": "Podcast generation queued",
    }
    
    # Queue background generation
    background_tasks.add_task(
        _generate_podcast_background,
        podcast_id,
        request.dict(),
    )
    
    return {
        "podcast_id": podcast_id,
        "status": "generating",
        "message": "Podcast generation started",
    }


async def _generate_podcast_background(
    podcast_id: str,
    request_data: Dict[str, Any],
) -> None:
    """Background task for podcast generation."""
    podcast = _podcasts.get(podcast_id)
    if not podcast:
        return
    
    def progress_callback(stage: str, progress: float) -> None:
        _progress[podcast_id] = {
            "progress": progress,
            "stage": stage,
            "message": _get_stage_message(stage),
        }
    
    try:
        engine = get_podcast_engine()
        if not engine:
            # Mock generation for development
            await _mock_generate(podcast, progress_callback)
            return
        
        # Get sources from database
        sources = await _get_sources(request_data["source_ids"])
        
        result = await engine.generate_podcast(
            podcast_id=podcast_id,
            sources=sources,
            insights=request_data.get("insights"),
            voice_config=request_data.get("voice_config"),
            config={
                "style": request_data["style"],
                "target_length": request_data["target_length"],
                "include_background_music": request_data.get("include_background_music", False),
            },
            progress_callback=progress_callback,
        )
        
        _podcasts[podcast_id] = result
        
    except Exception as e:
        podcast.mark_failed(str(e))
        _progress[podcast_id] = {
            "progress": 0.0,
            "stage": "failed",
            "message": f"Generation failed: {str(e)}",
        }


async def _mock_generate(
    podcast: Podcast,
    progress_callback,
) -> None:
    """Mock generation for development/testing."""
    import asyncio
    
    stages = [
        ("script_generating", 0.1, "Generating script..."),
        ("script_generating", 0.25, "Creating dialogue..."),
        ("script_ready", 0.30, "Script ready"),
        ("audio_generating", 0.50, "Synthesizing audio..."),
        ("audio_generating", 0.70, "Processing voices..."),
        ("audio_generated", 0.85, "Audio generated"),
        ("processing", 0.95, "Finalizing..."),
        ("complete", 1.0, "Complete"),
    ]
    
    for stage, progress, message in stages:
        progress_callback(stage, progress)
        await asyncio.sleep(1)  # Simulate work
    
    podcast.mark_completed(
        audio_url="/podcasts/mock_audio.mp3",
        duration=600,
        file_size=1024000,
    )


def _get_stage_message(stage: str) -> str:
    """Get human-readable message for stage."""
    messages = {
        "queued": "Podcast generation queued",
        "script_generating": "Generating podcast script...",
        "script_ready": "Script generated successfully",
        "audio_generating": "Synthesizing audio...",
        "audio_generated": "Audio segments generated",
        "processing": "Stitching and finalizing audio...",
        "complete": "Podcast generation complete!",
        "failed": "Generation failed",
    }
    return messages.get(stage, stage)


async def _get_sources(source_ids: List[str]) -> List[Dict[str, Any]]:
    """Get source documents from database."""
    # This would query the actual database
    # For now, return empty list
    return [{"id": sid, "content": "", "title": f"Source {sid}"} for sid in source_ids]


@router.get("/{podcast_id}")
async def get_podcast(podcast_id: str) -> PodcastResponse:
    """Get podcast details by ID."""
    podcast = _podcasts.get(podcast_id)
    
    if not podcast:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Podcast {podcast_id} not found",
        )
    
    return PodcastResponse.from_podcast(podcast)


@router.get("/{podcast_id}/progress")
async def get_podcast_progress(podcast_id: str) -> PodcastProgressResponse:
    """Get podcast generation progress."""
    podcast = _podcasts.get(podcast_id)
    progress = _progress.get(podcast_id, {})
    
    if not podcast:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Podcast {podcast_id} not found",
        )
    
    return PodcastProgressResponse(
        id=podcast_id,
        status=podcast.status.value,
        progress=progress.get("progress", 0.0),
        stage=progress.get("stage", "unknown"),
        message=progress.get("message", ""),
    )


@router.get("")
async def list_podcasts(
    page: int = 1,
    page_size: int = 20,
    status_filter: Optional[str] = None,
) -> PodcastListResponse:
    """List all podcasts with pagination."""
    podcasts = list(_podcasts.values())
    
    # Filter by status if specified
    if status_filter:
        try:
            target_status = PodcastStatus(status_filter)
            podcasts = [p for p in podcasts if p.status == target_status]
        except ValueError:
            pass
    
    # Sort by created_at descending
    podcasts.sort(key=lambda p: p.created_at, reverse=True)
    
    # Paginate
    total = len(podcasts)
    start = (page - 1) * page_size
    end = start + page_size
    page_podcasts = podcasts[start:end]
    
    return PodcastListResponse(
        podcasts=[PodcastResponse.from_podcast(p) for p in page_podcasts],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.delete("/{podcast_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_podcast(podcast_id: str) -> None:
    """Delete a podcast."""
    if podcast_id not in _podcasts:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Podcast {podcast_id} not found",
        )
    
    del _podcasts[podcast_id]
    if podcast_id in _progress:
        del _progress[podcast_id]


@router.post("/{podcast_id}/cancel", status_code=status.HTTP_200_OK)
async def cancel_podcast(podcast_id: str) -> Dict[str, str]:
    """Cancel a podcast generation in progress."""
    podcast = _podcasts.get(podcast_id)
    
    if not podcast:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Podcast {podcast_id} not found",
        )
    
    if podcast.status in [PodcastStatus.COMPLETED, PodcastStatus.FAILED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel a completed or failed podcast",
        )
    
    podcast.mark_failed("Cancelled by user")
    _progress[podcast_id] = {
        "progress": 0.0,
        "stage": "cancelled",
        "message": "Generation cancelled by user",
    }
    
    return {"status": "cancelled", "message": "Podcast generation cancelled"}


@router.post("/preview-script")
async def preview_script(request: ScriptPreviewRequest) -> ScriptPreviewResponse:
    """
    Generate script preview without audio.
    
    Useful for reviewing script before committing to full generation.
    """
    engine = get_podcast_engine()
    
    if not engine:
        # Return mock preview for development
        return ScriptPreviewResponse(
            title="Preview: Generated Podcast",
            segments=[
                {
                    "id": "seg_1",
                    "speaker": "Alex",
                    "text": "Welcome to our podcast! Today we're diving into an exciting topic.",
                    "order": 0,
                },
                {
                    "id": "seg_2",
                    "speaker": "Jordan",
                    "text": "That's right! I've been looking forward to this discussion.",
                    "order": 1,
                },
            ],
            total_duration=300,
            estimated_word_count=150,
        )
    
    sources = await _get_sources(request.source_ids)
    
    script = await engine.preview_script(
        sources=sources,
        insights=request.insights,
        config={
            "style": request.style,
            "target_length": request.target_length,
        },
    )
    
    return ScriptPreviewResponse(
        title=script.title,
        segments=[seg.to_dict() for seg in script.segments],
        total_duration=script.total_duration,
        estimated_word_count=sum(len(seg.text.split()) for seg in script.segments),
    )


@router.post("/{podcast_id}/regenerate-segment")
async def regenerate_segment(
    podcast_id: str,
    request: RegenerateSegmentRequest,
    background_tasks: BackgroundTasks,
) -> Dict[str, str]:
    """Regenerate a specific segment of a podcast script."""
    podcast = _podcasts.get(podcast_id)
    
    if not podcast:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Podcast {podcast_id} not found",
        )
    
    if not podcast.script:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Podcast has no script to regenerate",
        )
    
    # Find the segment
    segment = next(
        (s for s in podcast.script.segments if s.id == request.segment_id),
        None
    )
    
    if not segment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Segment {request.segment_id} not found",
        )
    
    # Queue regeneration in background
    background_tasks.add_task(
        _regenerate_segment_background,
        podcast_id,
        request.segment_id,
        request.custom_prompt,
    )
    
    return {
        "status": "regenerating",
        "message": f"Segment {request.segment_id} regeneration started",
    }


async def _regenerate_segment_background(
    podcast_id: str,
    segment_id: str,
    custom_prompt: Optional[str],
) -> None:
    """Background task for segment regeneration."""
    # Implementation would use script_generator.regenerate_segment()
    pass


@router.get("/{podcast_id}/script")
async def get_podcast_script(podcast_id: str) -> Dict[str, Any]:
    """Get the full script for a podcast."""
    podcast = _podcasts.get(podcast_id)
    
    if not podcast:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Podcast {podcast_id} not found",
        )
    
    if not podcast.script:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Podcast has no script yet",
        )
    
    return podcast.script.to_dict()


@router.put("/{podcast_id}/script")
async def update_podcast_script(
    podcast_id: str,
    script_data: Dict[str, Any],
) -> Dict[str, str]:
    """Update the script for a podcast (before audio generation)."""
    from models.podcast import PodcastScript
    
    podcast = _podcasts.get(podcast_id)
    
    if not podcast:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Podcast {podcast_id} not found",
        )
    
    if podcast.status == PodcastStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update script of a completed podcast",
        )
    
    try:
        script = PodcastScript.from_dict(script_data)
        podcast.script = script
        podcast.update_status(PodcastStatus.SCRIPT_READY)
        
        return {"status": "updated", "message": "Script updated successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid script data: {str(e)}",
        )


@router.post("/{podcast_id}/generate-audio", status_code=status.HTTP_202_ACCEPTED)
async def generate_audio_from_script(
    podcast_id: str,
    voice_config: Optional[Dict[str, Any]] = None,
    include_background_music: bool = False,
    background_tasks: BackgroundTasks = None,
) -> Dict[str, str]:
    """
    Generate audio from an existing/edited script.
    
    Use this after previewing and optionally editing the script.
    """
    podcast = _podcasts.get(podcast_id)
    
    if not podcast:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Podcast {podcast_id} not found",
        )
    
    if not podcast.script:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Podcast has no script. Generate script first.",
        )
    
    if podcast.status == PodcastStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Podcast already completed. Create a new podcast to regenerate.",
        )
    
    _progress[podcast_id] = {
        "progress": 0.0,
        "stage": "audio_generating",
        "message": "Starting audio generation...",
    }
    
    background_tasks.add_task(
        _generate_audio_background,
        podcast_id,
        voice_config,
        include_background_music,
    )
    
    return {
        "status": "generating",
        "message": "Audio generation started",
    }


async def _generate_audio_background(
    podcast_id: str,
    voice_config: Optional[Dict[str, Any]],
    include_background_music: bool,
) -> None:
    """Background task for audio generation from script."""
    podcast = _podcasts.get(podcast_id)
    if not podcast or not podcast.script:
        return
    
    def progress_callback(stage: str, progress: float) -> None:
        _progress[podcast_id] = {
            "progress": progress,
            "stage": stage,
            "message": _get_stage_message(stage),
        }
    
    try:
        engine = get_podcast_engine()
        if not engine:
            # Mock for development
            await _mock_generate(podcast, progress_callback)
            return
        
        result = await engine.regenerate_from_script(
            podcast_id=podcast_id,
            script=podcast.script,
            voice_config=voice_config,
            include_background_music=include_background_music,
            progress_callback=progress_callback,
        )
        
        _podcasts[podcast_id] = result
        
    except Exception as e:
        podcast.mark_failed(str(e))
        _progress[podcast_id] = {
            "progress": 0.0,
            "stage": "failed",
            "message": f"Audio generation failed: {str(e)}",
        }
