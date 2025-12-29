"""
Podcast Domain Models

Defines the data structures for podcast generation including
scripts, segments, voice configurations, and status tracking.
"""
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import uuid4


class PodcastStatus(str, Enum):
    """Status stages for podcast generation pipeline."""
    PENDING = "pending"
    SCRIPT_GENERATING = "script_generating"
    SCRIPT_READY = "script_ready"
    AUDIO_GENERATING = "audio_generating"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


class SpeakerRole(str, Enum):
    """Speaker roles in a podcast."""
    HOST = "host"
    GUEST = "guest"
    NARRATOR = "narrator"


class PodcastStyle(str, Enum):
    """Podcast conversation styles."""
    CONVERSATIONAL = "conversational"
    INTERVIEW = "interview"
    DEBATE = "debate"
    EDUCATIONAL = "educational"
    STORYTELLING = "storytelling"


@dataclass
class PodcastSegment:
    """A single segment of podcast dialogue."""
    id: str = field(default_factory=lambda: str(uuid4()))
    speaker: SpeakerRole = SpeakerRole.HOST
    text: str = ""
    audio_url: Optional[str] = None
    start_time: Optional[float] = None  # seconds
    end_time: Optional[float] = None  # seconds
    duration: Optional[float] = None  # seconds
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "speaker": self.speaker.value,
            "text": self.text,
            "audio_url": self.audio_url,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "duration": self.duration,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "PodcastSegment":
        return cls(
            id=data.get("id", str(uuid4())),
            speaker=SpeakerRole(data.get("speaker", "host")),
            text=data.get("text", ""),
            audio_url=data.get("audio_url"),
            start_time=data.get("start_time"),
            end_time=data.get("end_time"),
            duration=data.get("duration"),
        )


@dataclass
class PodcastScript:
    """Complete podcast script with metadata."""
    title: str = ""
    description: str = ""
    segments: List[PodcastSegment] = field(default_factory=list)
    total_duration: Optional[float] = None  # estimated seconds
    word_count: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "title": self.title,
            "description": self.description,
            "segments": [s.to_dict() for s in self.segments],
            "total_duration": self.total_duration,
            "word_count": self.word_count,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "PodcastScript":
        return cls(
            title=data.get("title", ""),
            description=data.get("description", ""),
            segments=[PodcastSegment.from_dict(s) for s in data.get("segments", [])],
            total_duration=data.get("total_duration"),
            word_count=data.get("word_count", 0),
        )
    
    def calculate_word_count(self) -> int:
        """Calculate total word count from segments."""
        self.word_count = sum(len(s.text.split()) for s in self.segments)
        return self.word_count
    
    def estimate_duration(self, words_per_minute: int = 150) -> float:
        """Estimate total duration based on word count."""
        if not self.word_count:
            self.calculate_word_count()
        self.total_duration = (self.word_count / words_per_minute) * 60
        return self.total_duration


@dataclass
class VoiceConfig:
    """Voice configuration for a speaker."""
    voice_id: str
    provider: str = "openai"
    name: str = ""
    speed: float = 1.0
    pitch: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "voice_id": self.voice_id,
            "provider": self.provider,
            "name": self.name,
            "speed": self.speed,
            "pitch": self.pitch,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "VoiceConfig":
        return cls(
            voice_id=data.get("voice_id", "alloy"),
            provider=data.get("provider", "openai"),
            name=data.get("name", ""),
            speed=data.get("speed", 1.0),
            pitch=data.get("pitch", 0.0),
        )


@dataclass
class PodcastVoiceConfig:
    """Voice configuration for all podcast speakers."""
    host_voice: VoiceConfig = field(
        default_factory=lambda: VoiceConfig(voice_id="alloy", name="Host")
    )
    guest_voice: VoiceConfig = field(
        default_factory=lambda: VoiceConfig(voice_id="nova", name="Guest")
    )
    narrator_voice: Optional[VoiceConfig] = None
    
    def to_dict(self) -> Dict[str, Any]:
        result = {
            "host_voice": self.host_voice.to_dict(),
            "guest_voice": self.guest_voice.to_dict(),
        }
        if self.narrator_voice:
            result["narrator_voice"] = self.narrator_voice.to_dict()
        return result
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "PodcastVoiceConfig":
        return cls(
            host_voice=VoiceConfig.from_dict(data.get("host_voice", {})),
            guest_voice=VoiceConfig.from_dict(data.get("guest_voice", {})),
            narrator_voice=(
                VoiceConfig.from_dict(data["narrator_voice"])
                if data.get("narrator_voice")
                else None
            ),
        )
    
    def get_voice_for_role(self, role: SpeakerRole) -> VoiceConfig:
        """Get voice config for a speaker role."""
        if role == SpeakerRole.HOST:
            return self.host_voice
        elif role == SpeakerRole.GUEST:
            return self.guest_voice
        elif role == SpeakerRole.NARRATOR:
            return self.narrator_voice or self.host_voice
        return self.host_voice


@dataclass
class VoicePersonality:
    """Personality configuration for script generation."""
    role: SpeakerRole
    name: str
    style: str  # 'professional', 'casual', 'enthusiastic'
    traits: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "role": self.role.value,
            "name": self.name,
            "style": self.style,
            "traits": self.traits,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "VoicePersonality":
        return cls(
            role=SpeakerRole(data.get("role", "host")),
            name=data.get("name", ""),
            style=data.get("style", "professional"),
            traits=data.get("traits", []),
        )


@dataclass
class PodcastConfig:
    """Configuration for podcast generation."""
    target_duration: int = 300  # seconds (5 minutes default)
    style: PodcastStyle = PodcastStyle.CONVERSATIONAL
    host: Optional[VoicePersonality] = None
    guest: Optional[VoicePersonality] = None
    include_intro: bool = True
    include_outro: bool = True
    include_background_music: bool = False
    music_volume: float = -25.0  # dB
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "target_duration": self.target_duration,
            "style": self.style.value,
            "host": self.host.to_dict() if self.host else None,
            "guest": self.guest.to_dict() if self.guest else None,
            "include_intro": self.include_intro,
            "include_outro": self.include_outro,
            "include_background_music": self.include_background_music,
            "music_volume": self.music_volume,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "PodcastConfig":
        return cls(
            target_duration=data.get("target_duration", 300),
            style=PodcastStyle(data.get("style", "conversational")),
            host=(
                VoicePersonality.from_dict(data["host"])
                if data.get("host")
                else None
            ),
            guest=(
                VoicePersonality.from_dict(data["guest"])
                if data.get("guest")
                else None
            ),
            include_intro=data.get("include_intro", True),
            include_outro=data.get("include_outro", True),
            include_background_music=data.get("include_background_music", False),
            music_volume=data.get("music_volume", -25.0),
        )
    
    def get_default_host(self) -> VoicePersonality:
        """Get default host personality."""
        return self.host or VoicePersonality(
            role=SpeakerRole.HOST,
            name="Alex",
            style="professional and curious",
            traits=["asks clarifying questions", "summarizes key points"],
        )
    
    def get_default_guest(self) -> VoicePersonality:
        """Get default guest personality."""
        return self.guest or VoicePersonality(
            role=SpeakerRole.GUEST,
            name="Jordan",
            style="enthusiastic and insightful",
            traits=["provides examples", "makes connections"],
        )


@dataclass
class Podcast:
    """Complete podcast entity."""
    id: str = field(default_factory=lambda: str(uuid4()))
    tenant_id: str = ""
    notebook_id: str = ""
    title: str = ""
    description: Optional[str] = None
    status: PodcastStatus = PodcastStatus.PENDING
    script: Optional[PodcastScript] = None
    voice_config: Optional[PodcastVoiceConfig] = None
    config: Optional[PodcastConfig] = None
    audio_url: Optional[str] = None
    duration: Optional[float] = None  # seconds
    file_size: Optional[int] = None  # bytes
    source_ids: List[str] = field(default_factory=list)
    generated_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "notebook_id": self.notebook_id,
            "title": self.title,
            "description": self.description,
            "status": self.status.value,
            "script": self.script.to_dict() if self.script else None,
            "voice_config": self.voice_config.to_dict() if self.voice_config else None,
            "config": self.config.to_dict() if self.config else None,
            "audio_url": self.audio_url,
            "duration": self.duration,
            "file_size": self.file_size,
            "source_ids": self.source_ids,
            "generated_at": self.generated_at.isoformat() if self.generated_at else None,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Podcast":
        return cls(
            id=data.get("id", str(uuid4())),
            tenant_id=data.get("tenant_id", ""),
            notebook_id=data.get("notebook_id", ""),
            title=data.get("title", ""),
            description=data.get("description"),
            status=PodcastStatus(data.get("status", "pending")),
            script=(
                PodcastScript.from_dict(data["script"])
                if data.get("script")
                else None
            ),
            voice_config=(
                PodcastVoiceConfig.from_dict(data["voice_config"])
                if data.get("voice_config")
                else None
            ),
            config=(
                PodcastConfig.from_dict(data["config"])
                if data.get("config")
                else None
            ),
            audio_url=data.get("audio_url"),
            duration=data.get("duration"),
            file_size=data.get("file_size"),
            source_ids=data.get("source_ids", []),
            generated_at=(
                datetime.fromisoformat(data["generated_at"])
                if data.get("generated_at")
                else None
            ),
            error_message=data.get("error_message"),
            created_at=(
                datetime.fromisoformat(data["created_at"])
                if data.get("created_at")
                else datetime.utcnow()
            ),
            updated_at=(
                datetime.fromisoformat(data["updated_at"])
                if data.get("updated_at")
                else datetime.utcnow()
            ),
        )
    
    def update_status(self, status: PodcastStatus) -> None:
        """Update podcast status and timestamp."""
        self.status = status
        self.updated_at = datetime.utcnow()
    
    def mark_completed(
        self,
        audio_url: str,
        duration: float,
        file_size: int,
    ) -> None:
        """Mark podcast as completed with audio details."""
        self.audio_url = audio_url
        self.duration = duration
        self.file_size = file_size
        self.generated_at = datetime.utcnow()
        self.status = PodcastStatus.READY
        self.updated_at = datetime.utcnow()
    
    def mark_failed(self, error: str) -> None:
        """Mark podcast as failed with error message."""
        self.error_message = error
        self.status = PodcastStatus.FAILED
        self.updated_at = datetime.utcnow()
