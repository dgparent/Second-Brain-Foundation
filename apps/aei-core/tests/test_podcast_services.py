"""
Tests for Podcast Services

Unit tests for podcast script generation and audio synthesis.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

from models.podcast import (
    Podcast,
    PodcastConfig,
    PodcastScript,
    PodcastSegment,
    PodcastStatus,
    PodcastVoiceConfig,
    SpeakerRole,
    VoiceConfig,
)
from services.podcast.script_generator import PodcastScriptGenerator
from services.podcast.engine import PodcastEngine


# =============================================================================
# Model Tests
# =============================================================================

class TestPodcastModels:
    """Tests for podcast domain models."""
    
    def test_podcast_creation(self):
        """Test creating a podcast."""
        podcast = Podcast(
            id="test-123",
            title="Test Podcast",
            source_ids=["src-1", "src-2"],
        )
        
        assert podcast.id == "test-123"
        assert podcast.title == "Test Podcast"
        assert len(podcast.source_ids) == 2
        assert podcast.status == PodcastStatus.PENDING
    
    def test_podcast_status_transitions(self):
        """Test podcast status transitions."""
        podcast = Podcast(
            id="test-123",
            title="Test Podcast",
            source_ids=["src-1"],
        )
        
        # Initial status
        assert podcast.status == PodcastStatus.PENDING
        
        # Update to script generating
        podcast.update_status(PodcastStatus.SCRIPT_GENERATING)
        assert podcast.status == PodcastStatus.SCRIPT_GENERATING
        
        # Mark completed
        podcast.mark_completed(
            audio_url="/audio/test.mp3",
            duration=600,
            file_size=1024000,
        )
        assert podcast.status == PodcastStatus.COMPLETED
        assert podcast.audio_url == "/audio/test.mp3"
        assert podcast.duration == 600
    
    def test_podcast_failure(self):
        """Test marking podcast as failed."""
        podcast = Podcast(
            id="test-123",
            title="Test Podcast",
            source_ids=["src-1"],
        )
        
        podcast.mark_failed("Test error message")
        
        assert podcast.status == PodcastStatus.FAILED
        assert podcast.error_message == "Test error message"
    
    def test_podcast_serialization(self):
        """Test podcast serialization to dict."""
        podcast = Podcast(
            id="test-123",
            title="Test Podcast",
            source_ids=["src-1"],
        )
        
        data = podcast.to_dict()
        
        assert data["id"] == "test-123"
        assert data["title"] == "Test Podcast"
        assert "created_at" in data
    
    def test_podcast_deserialization(self):
        """Test podcast deserialization from dict."""
        data = {
            "id": "test-123",
            "title": "Test Podcast",
            "source_ids": ["src-1"],
            "status": "completed",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }
        
        podcast = Podcast.from_dict(data)
        
        assert podcast.id == "test-123"
        assert podcast.status == PodcastStatus.COMPLETED
    
    def test_podcast_segment(self):
        """Test podcast segment creation."""
        segment = PodcastSegment(
            speaker="Alex",
            text="Hello and welcome!",
            speaker_role=SpeakerRole.HOST_PRIMARY,
            order=0,
        )
        
        assert segment.speaker == "Alex"
        assert segment.text == "Hello and welcome!"
        assert segment.id is not None
        assert segment.estimated_duration > 0
    
    def test_podcast_script(self):
        """Test podcast script with segments."""
        segments = [
            PodcastSegment(speaker="Alex", text="Welcome to the show!", order=0),
            PodcastSegment(speaker="Jordan", text="Thanks for having me.", order=1),
        ]
        
        script = PodcastScript(
            title="Test Script",
            segments=segments,
        )
        
        assert script.title == "Test Script"
        assert len(script.segments) == 2
        assert script.total_duration > 0
    
    def test_voice_config(self):
        """Test voice configuration."""
        config = VoiceConfig(
            voice_id="alloy",
            provider="openai",
            speed=1.0,
        )
        
        assert config.voice_id == "alloy"
        assert config.provider == "openai"
    
    def test_podcast_voice_config(self):
        """Test podcast voice configuration with dual hosts."""
        config = PodcastVoiceConfig(
            host1_voice=VoiceConfig(voice_id="alloy", provider="openai"),
            host2_voice=VoiceConfig(voice_id="echo", provider="openai"),
        )
        
        voice = config.get_voice_for_role(SpeakerRole.HOST_PRIMARY)
        assert voice.voice_id == "alloy"
        
        voice = config.get_voice_for_role(SpeakerRole.HOST_SECONDARY)
        assert voice.voice_id == "echo"


# =============================================================================
# Script Generator Tests
# =============================================================================

class TestScriptGenerator:
    """Tests for podcast script generation."""
    
    @pytest.fixture
    def mock_llm(self):
        """Create a mock LLM."""
        llm = MagicMock()
        llm.ainvoke = AsyncMock(return_value=MagicMock(
            content="""[Alex]: Welcome to our podcast! Today we're discussing something fascinating.
[Jordan]: That's right! I've been looking forward to this topic.
[Alex]: Let's dive right in and explore the key points.
[Jordan]: Great idea. The first thing to understand is the context."""
        ))
        return llm
    
    @pytest.fixture
    def script_generator(self, mock_llm):
        """Create a script generator with mock LLM."""
        return PodcastScriptGenerator(llm=mock_llm)
    
    @pytest.mark.asyncio
    async def test_generate_script(self, script_generator):
        """Test generating a podcast script."""
        sources = [
            {"id": "1", "content": "Test content about AI", "title": "AI Article"},
        ]
        
        script = await script_generator.generate_script(sources=sources)
        
        assert script is not None
        assert len(script.segments) > 0
        assert script.title is not None
    
    @pytest.mark.asyncio
    async def test_script_parsing(self, script_generator):
        """Test parsing LLM output into segments."""
        raw_script = """[Alex]: First segment here.
[Jordan]: Second segment here.
[Alex]: Third segment here."""
        
        segments = script_generator._parse_script(raw_script)
        
        assert len(segments) == 3
        assert segments[0].speaker == "Alex"
        assert segments[1].speaker == "Jordan"
        assert segments[0].text == "First segment here."
    
    def test_script_parsing_alternate_format(self, script_generator):
        """Test parsing alternate script format."""
        raw_script = """Alex: First segment.
Jordan: Second segment."""
        
        segments = script_generator._parse_script(raw_script)
        
        assert len(segments) == 2
    
    @pytest.mark.asyncio
    async def test_generate_with_insights(self, script_generator):
        """Test generating script with custom insights."""
        sources = [{"id": "1", "content": "Test content", "title": "Test"}]
        insights = ["Key point 1", "Key point 2"]
        
        script = await script_generator.generate_script(
            sources=sources,
            insights=insights,
        )
        
        assert script is not None
    
    @pytest.mark.asyncio
    async def test_generate_with_config(self, script_generator):
        """Test generating script with configuration."""
        sources = [{"id": "1", "content": "Test content", "title": "Test"}]
        config = PodcastConfig(
            style="educational",
            target_length="long",
        )
        
        script = await script_generator.generate_script(
            sources=sources,
            config=config,
        )
        
        assert script is not None


# =============================================================================
# Podcast Engine Tests
# =============================================================================

class TestPodcastEngine:
    """Tests for podcast engine."""
    
    @pytest.fixture
    def mock_script_generator(self):
        """Create a mock script generator."""
        generator = MagicMock(spec=PodcastScriptGenerator)
        generator.generate_script = AsyncMock(return_value=PodcastScript(
            title="Test Podcast",
            segments=[
                PodcastSegment(speaker="Alex", text="Hello!", order=0),
                PodcastSegment(speaker="Jordan", text="Hi there!", order=1),
            ],
        ))
        return generator
    
    @pytest.fixture
    def mock_tts_client(self):
        """Create a mock TTS client."""
        client = MagicMock()
        client.synthesize = AsyncMock(return_value=MagicMock(audio=b"fake_audio_data"))
        return client
    
    @pytest.fixture
    def engine(self, mock_script_generator, mock_tts_client, tmp_path):
        """Create a podcast engine with mocks."""
        return PodcastEngine(
            script_generator=mock_script_generator,
            tts_client=mock_tts_client,
            output_dir=tmp_path,
        )
    
    @pytest.mark.asyncio
    async def test_generate_podcast(self, engine):
        """Test full podcast generation."""
        sources = [{"id": "1", "content": "Test", "title": "Test"}]
        
        with patch.object(engine, '_stitch_audio', new_callable=AsyncMock) as mock_stitch:
            mock_stitch.return_value = engine.output_dir / "test_final.mp3"
            # Create the mock file
            (engine.output_dir / "test_final.mp3").write_bytes(b"audio")
            
            podcast = await engine.generate_podcast(
                podcast_id="test-123",
                sources=sources,
            )
        
        assert podcast is not None
        assert podcast.id == "test-123"
    
    @pytest.mark.asyncio
    async def test_preview_script(self, engine):
        """Test script preview without audio generation."""
        sources = [{"id": "1", "content": "Test", "title": "Test"}]
        
        script = await engine.preview_script(sources=sources)
        
        assert script is not None
        assert len(script.segments) > 0
    
    @pytest.mark.asyncio
    async def test_progress_callback(self, engine):
        """Test that progress callback is called."""
        sources = [{"id": "1", "content": "Test", "title": "Test"}]
        progress_updates = []
        
        def callback(stage, progress):
            progress_updates.append((stage, progress))
        
        with patch.object(engine, '_stitch_audio', new_callable=AsyncMock) as mock_stitch:
            mock_stitch.return_value = engine.output_dir / "test_final.mp3"
            (engine.output_dir / "test_final.mp3").write_bytes(b"audio")
            
            await engine.generate_podcast(
                podcast_id="test-123",
                sources=sources,
                progress_callback=callback,
            )
        
        assert len(progress_updates) > 0
        # Should have progress updates for different stages
        stages = [update[0] for update in progress_updates]
        assert "script_ready" in stages or "script_generating" in stages
    
    def test_generate_title(self, engine):
        """Test title generation from sources."""
        sources = [{"id": "1", "title": "My Great Article"}]
        
        title = engine._generate_title(sources)
        
        assert "My Great Article" in title
    
    def test_generate_title_multiple_sources(self, engine):
        """Test title generation with multiple sources."""
        sources = [
            {"id": "1", "title": "First Article"},
            {"id": "2", "title": "Second Article"},
            {"id": "3", "title": "Third Article"},
        ]
        
        title = engine._generate_title(sources)
        
        assert "2 more" in title


# =============================================================================
# Integration Tests (marked for slow execution)
# =============================================================================

@pytest.mark.integration
class TestPodcastIntegration:
    """Integration tests requiring real services."""
    
    @pytest.mark.skip(reason="Requires real LLM API key")
    @pytest.mark.asyncio
    async def test_real_script_generation(self):
        """Test script generation with real LLM."""
        # This would use real LLM - skip in CI
        pass
    
    @pytest.mark.skip(reason="Requires real TTS API key")
    @pytest.mark.asyncio
    async def test_real_audio_synthesis(self):
        """Test audio synthesis with real TTS."""
        # This would use real TTS - skip in CI
        pass


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
