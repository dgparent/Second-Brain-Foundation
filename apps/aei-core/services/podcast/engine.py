"""
Podcast Engine

Full podcast generation pipeline:
1. Generate script from sources
2. Synthesize audio for each segment
3. Stitch segments together with optional background music
"""
import asyncio
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional
from uuid import uuid4

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
from .script_generator import PodcastScriptGenerator


class PodcastEngine:
    """
    Full podcast generation pipeline.
    
    Orchestrates script generation, TTS synthesis, and audio processing.
    """
    
    def __init__(
        self,
        script_generator: PodcastScriptGenerator,
        tts_client: Any,
        output_dir: Path,
        repository: Optional[Any] = None,
    ):
        """
        Initialize the podcast engine.
        
        Args:
            script_generator: Script generator instance
            tts_client: TTS client for audio synthesis
            output_dir: Directory for output audio files
            repository: Optional podcast repository for persistence
        """
        self.script_gen = script_generator
        self.tts = tts_client
        self.output_dir = Path(output_dir)
        self.repo = repository
        
        # Ensure output directory exists
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    async def generate_podcast(
        self,
        podcast_id: str,
        sources: List[Dict[str, Any]],
        insights: Optional[List[str]] = None,
        voice_config: Optional[Dict[str, Any]] = None,
        config: Optional[Dict[str, Any]] = None,
        progress_callback: Optional[Callable[[str, float], None]] = None,
    ) -> Podcast:
        """
        Generate a complete podcast from sources.
        
        Args:
            podcast_id: Unique podcast identifier
            sources: List of source content dicts
            insights: Optional key insights to incorporate
            voice_config: Voice configuration dict
            config: Podcast configuration dict
            progress_callback: Optional callback for progress updates (stage, percent)
            
        Returns:
            Completed Podcast object
        """
        # Load or create podcast
        podcast = await self._get_or_create_podcast(podcast_id, sources)
        
        try:
            # Step 1: Generate script (0-30%)
            await self._update_status(podcast, PodcastStatus.SCRIPT_GENERATING)
            self._report_progress(progress_callback, "script_generating", 0.05)
            
            podcast_config = PodcastConfig.from_dict(config or {})
            
            script = await self.script_gen.generate_script(
                sources=sources,
                insights=insights,
                config=podcast_config,
            )
            
            podcast.script = script
            podcast.config = podcast_config
            await self._update_status(podcast, PodcastStatus.SCRIPT_READY)
            self._report_progress(progress_callback, "script_ready", 0.30)
            
            # Step 2: Generate audio for each segment (30-85%)
            await self._update_status(podcast, PodcastStatus.AUDIO_GENERATING)
            
            # Parse voice config
            voices = PodcastVoiceConfig.from_dict(voice_config or {})
            podcast.voice_config = voices
            
            segment_files = await self._generate_segment_audio(
                podcast_id,
                script.segments,
                voices,
                progress_callback,
            )
            
            self._report_progress(progress_callback, "audio_generated", 0.85)
            
            # Step 3: Stitch audio together (85-95%)
            await self._update_status(podcast, PodcastStatus.PROCESSING)
            
            final_audio_path = await self._stitch_audio(
                podcast_id,
                segment_files,
                add_background_music=podcast_config.include_background_music,
                music_volume=podcast_config.music_volume,
            )
            
            self._report_progress(progress_callback, "processing", 0.95)
            
            # Update podcast with final details
            file_size = final_audio_path.stat().st_size if final_audio_path.exists() else 0
            
            podcast.mark_completed(
                audio_url=str(final_audio_path),
                duration=script.total_duration or 0,
                file_size=file_size,
            )
            
            # Cleanup segment files
            await self._cleanup_segments(segment_files)
            
            self._report_progress(progress_callback, "complete", 1.0)
            
            return podcast
            
        except Exception as e:
            error_msg = str(e)
            podcast.mark_failed(error_msg)
            if self.repo:
                await self.repo.update(podcast)
            raise
    
    async def _get_or_create_podcast(
        self,
        podcast_id: str,
        sources: List[Dict[str, Any]],
    ) -> Podcast:
        """Get existing podcast or create new one."""
        if self.repo:
            podcast = await self.repo.get(podcast_id)
            if podcast:
                return podcast
        
        # Create new podcast
        podcast = Podcast(
            id=podcast_id,
            title=self._generate_title(sources),
            source_ids=[s.get("id", "") for s in sources if s.get("id")],
        )
        
        if self.repo:
            await self.repo.create(podcast)
        
        return podcast
    
    async def _generate_segment_audio(
        self,
        podcast_id: str,
        segments: List[PodcastSegment],
        voices: PodcastVoiceConfig,
        progress_callback: Optional[Callable[[str, float], None]] = None,
    ) -> List[Path]:
        """Generate audio for each segment."""
        segment_files = []
        total_segments = len(segments)
        
        for i, segment in enumerate(segments):
            # Get voice for this speaker
            voice = voices.get_voice_for_role(segment.speaker)
            
            # Synthesize audio
            try:
                audio_data = await self._synthesize_segment(segment.text, voice)
                
                # Save segment audio
                segment_path = self.output_dir / f"{podcast_id}_{segment.id}.mp3"
                with open(segment_path, "wb") as f:
                    f.write(audio_data)
                
                segment.audio_url = str(segment_path)
                segment_files.append(segment_path)
                
            except Exception as e:
                print(f"Failed to synthesize segment {i}: {e}")
                # Continue with other segments
                continue
            
            # Update progress (30% to 85% range)
            if progress_callback:
                progress = 0.30 + (0.55 * (i + 1) / total_segments)
                self._report_progress(progress_callback, "audio_generating", progress)
        
        return segment_files
    
    async def _synthesize_segment(
        self,
        text: str,
        voice: VoiceConfig,
    ) -> bytes:
        """Synthesize a single text segment to audio."""
        # Check if TTS client is async
        if hasattr(self.tts, "synthesize"):
            response = await self.tts.synthesize({
                "text": text,
                "voice_id": voice.voice_id,
                "provider": voice.provider,
                "speed": voice.speed,
            })
            return response.audio if hasattr(response, "audio") else response
        
        # Fallback for different TTS client interfaces
        if hasattr(self.tts, "create"):
            # OpenAI-style client
            response = await self.tts.create(
                model="tts-1-hd",
                voice=voice.voice_id,
                input=text,
                speed=voice.speed,
            )
            return response.content
        
        raise ValueError("Unsupported TTS client interface")
    
    async def _stitch_audio(
        self,
        podcast_id: str,
        segment_files: List[Path],
        add_background_music: bool = False,
        music_volume: float = -25.0,
        pause_duration_ms: int = 500,
    ) -> Path:
        """Stitch audio segments together."""
        try:
            from pydub import AudioSegment
        except ImportError:
            # If pydub not available, concatenate raw files
            return await self._concatenate_audio_simple(podcast_id, segment_files)
        
        if not segment_files:
            raise ValueError("No audio segments to stitch")
        
        combined = AudioSegment.empty()
        pause = AudioSegment.silent(duration=pause_duration_ms)
        
        for i, segment_path in enumerate(segment_files):
            if not segment_path.exists():
                continue
                
            try:
                segment = AudioSegment.from_mp3(str(segment_path))
                combined += segment
                
                # Add pause between segments (not after last)
                if i < len(segment_files) - 1:
                    combined += pause
            except Exception as e:
                print(f"Failed to load segment {segment_path}: {e}")
                continue
        
        # Add background music if requested
        if add_background_music:
            combined = self._add_background_music(combined, music_volume)
        
        # Export final audio
        final_path = self.output_dir / f"{podcast_id}_final.mp3"
        combined.export(str(final_path), format="mp3", bitrate="128k")
        
        return final_path
    
    async def _concatenate_audio_simple(
        self,
        podcast_id: str,
        segment_files: List[Path],
    ) -> Path:
        """Simple concatenation without pydub (for fallback)."""
        final_path = self.output_dir / f"{podcast_id}_final.mp3"
        
        with open(final_path, "wb") as outfile:
            for segment_path in segment_files:
                if segment_path.exists():
                    with open(segment_path, "rb") as infile:
                        outfile.write(infile.read())
        
        return final_path
    
    def _add_background_music(
        self,
        audio: Any,  # AudioSegment
        music_volume: float = -25.0,
    ) -> Any:
        """Add subtle background music to the podcast."""
        try:
            from pydub import AudioSegment
        except ImportError:
            return audio
        
        # Look for background music file
        music_paths = [
            self.output_dir.parent / "assets" / "podcast_bg.mp3",
            self.output_dir / "podcast_bg.mp3",
            Path("assets/podcast_bg.mp3"),
        ]
        
        music_path = None
        for path in music_paths:
            if path.exists():
                music_path = path
                break
        
        if not music_path:
            print("No background music file found, skipping")
            return audio
        
        try:
            music = AudioSegment.from_mp3(str(music_path))
            music = music + music_volume  # Reduce volume
            
            # Loop music to match audio length
            while len(music) < len(audio):
                music = music + music
            
            music = music[:len(audio)]  # Trim to exact length
            
            # Fade in/out
            music = music.fade_in(3000).fade_out(3000)
            
            return audio.overlay(music)
            
        except Exception as e:
            print(f"Failed to add background music: {e}")
            return audio
    
    async def _cleanup_segments(self, segment_files: List[Path]) -> None:
        """Clean up temporary segment files."""
        for segment_path in segment_files:
            try:
                if segment_path.exists():
                    segment_path.unlink()
            except Exception as e:
                print(f"Failed to cleanup {segment_path}: {e}")
    
    async def _update_status(
        self,
        podcast: Podcast,
        status: PodcastStatus,
    ) -> None:
        """Update podcast status in database."""
        podcast.update_status(status)
        if self.repo:
            await self.repo.update(podcast)
    
    def _report_progress(
        self,
        callback: Optional[Callable[[str, float], None]],
        stage: str,
        progress: float,
    ) -> None:
        """Report progress to callback if provided."""
        if callback:
            try:
                callback(stage, progress)
            except Exception:
                pass
    
    def _generate_title(self, sources: List[Dict[str, Any]]) -> str:
        """Generate a default title from sources."""
        if not sources:
            return "Untitled Podcast"
        
        first_title = sources[0].get("title", "Unknown")
        
        if len(sources) > 1:
            return f"Podcast: {first_title[:30]} and {len(sources) - 1} more"
        
        return f"Podcast: {first_title[:40]}"
    
    async def preview_script(
        self,
        sources: List[Dict[str, Any]],
        insights: Optional[List[str]] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> PodcastScript:
        """
        Generate only the script without audio.
        
        Useful for previewing/editing before full generation.
        """
        podcast_config = PodcastConfig.from_dict(config or {})
        
        return await self.script_gen.generate_script(
            sources=sources,
            insights=insights,
            config=podcast_config,
        )
    
    async def regenerate_from_script(
        self,
        podcast_id: str,
        script: PodcastScript,
        voice_config: Optional[Dict[str, Any]] = None,
        include_background_music: bool = False,
        progress_callback: Optional[Callable[[str, float], None]] = None,
    ) -> Podcast:
        """
        Generate audio from an existing/edited script.
        
        Useful when user has edited the script manually.
        """
        podcast = await self._get_or_create_podcast(podcast_id, [])
        podcast.script = script
        
        try:
            await self._update_status(podcast, PodcastStatus.AUDIO_GENERATING)
            
            voices = PodcastVoiceConfig.from_dict(voice_config or {})
            podcast.voice_config = voices
            
            segment_files = await self._generate_segment_audio(
                podcast_id,
                script.segments,
                voices,
                progress_callback,
            )
            
            await self._update_status(podcast, PodcastStatus.PROCESSING)
            
            final_audio_path = await self._stitch_audio(
                podcast_id,
                segment_files,
                add_background_music=include_background_music,
            )
            
            file_size = final_audio_path.stat().st_size if final_audio_path.exists() else 0
            
            podcast.mark_completed(
                audio_url=str(final_audio_path),
                duration=script.total_duration or 0,
                file_size=file_size,
            )
            
            await self._cleanup_segments(segment_files)
            
            return podcast
            
        except Exception as e:
            podcast.mark_failed(str(e))
            if self.repo:
                await self.repo.update(podcast)
            raise
