"""
Audio Synthesis Service

Bridge between Python podcast services and TypeScript TTS client.
Uses subprocess to call the TTS client or direct HTTP calls.
"""
import asyncio
import json
import os
import subprocess
from pathlib import Path
from typing import Any, Dict, List, Optional

import aiohttp


class AudioSynthesizer:
    """
    Audio synthesis service that interfaces with the @sbf/tts-client.
    
    Can use either:
    1. Direct HTTP calls to TTS provider APIs
    2. Subprocess calls to a Node.js TTS CLI wrapper
    """
    
    def __init__(
        self,
        provider: str = "openai",
        api_key: Optional[str] = None,
        endpoint_url: Optional[str] = None,
    ):
        """
        Initialize the audio synthesizer.
        
        Args:
            provider: TTS provider to use (openai, elevenlabs, google, azure)
            api_key: API key for the provider
            endpoint_url: Optional custom endpoint URL
        """
        self.provider = provider
        self.api_key = api_key or self._get_api_key(provider)
        self.endpoint_url = endpoint_url or self._get_default_endpoint(provider)
    
    def _get_api_key(self, provider: str) -> Optional[str]:
        """Get API key from environment."""
        key_names = {
            "openai": "OPENAI_API_KEY",
            "elevenlabs": "ELEVENLABS_API_KEY",
            "google": "GOOGLE_TTS_API_KEY",
            "azure": "AZURE_TTS_KEY",
        }
        return os.environ.get(key_names.get(provider, ""))
    
    def _get_default_endpoint(self, provider: str) -> str:
        """Get default endpoint URL for provider."""
        endpoints = {
            "openai": "https://api.openai.com/v1/audio/speech",
            "elevenlabs": "https://api.elevenlabs.io/v1",
            "google": "https://texttospeech.googleapis.com/v1",
            "azure": "",  # Requires region
        }
        return endpoints.get(provider, "")
    
    async def synthesize(
        self,
        text: str,
        voice_id: str,
        output_path: Optional[Path] = None,
        **options,
    ) -> bytes:
        """
        Synthesize text to speech.
        
        Args:
            text: Text to synthesize
            voice_id: Voice identifier for the provider
            output_path: Optional path to save audio file
            **options: Additional synthesis options
            
        Returns:
            Audio data as bytes
        """
        if self.provider == "openai":
            audio_data = await self._synthesize_openai(text, voice_id, **options)
        elif self.provider == "elevenlabs":
            audio_data = await self._synthesize_elevenlabs(text, voice_id, **options)
        elif self.provider == "google":
            audio_data = await self._synthesize_google(text, voice_id, **options)
        elif self.provider == "azure":
            audio_data = await self._synthesize_azure(text, voice_id, **options)
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")
        
        if output_path:
            with open(output_path, "wb") as f:
                f.write(audio_data)
        
        return audio_data
    
    async def _synthesize_openai(
        self,
        text: str,
        voice_id: str,
        model: str = "tts-1-hd",
        speed: float = 1.0,
        **kwargs,
    ) -> bytes:
        """Synthesize using OpenAI TTS."""
        if not self.api_key:
            raise ValueError("OpenAI API key not configured")
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://api.openai.com/v1/audio/speech",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "voice": voice_id,
                    "input": text,
                    "speed": speed,
                    "response_format": "mp3",
                },
            ) as response:
                if response.status != 200:
                    error = await response.text()
                    raise RuntimeError(f"OpenAI TTS error: {error}")
                return await response.read()
    
    async def _synthesize_elevenlabs(
        self,
        text: str,
        voice_id: str,
        model_id: str = "eleven_multilingual_v2",
        stability: float = 0.5,
        similarity_boost: float = 0.75,
        **kwargs,
    ) -> bytes:
        """Synthesize using ElevenLabs."""
        if not self.api_key:
            raise ValueError("ElevenLabs API key not configured")
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
                headers={
                    "xi-api-key": self.api_key,
                    "Content-Type": "application/json",
                },
                json={
                    "text": text,
                    "model_id": model_id,
                    "voice_settings": {
                        "stability": stability,
                        "similarity_boost": similarity_boost,
                    },
                },
            ) as response:
                if response.status != 200:
                    error = await response.text()
                    raise RuntimeError(f"ElevenLabs TTS error: {error}")
                return await response.read()
    
    async def _synthesize_google(
        self,
        text: str,
        voice_id: str,
        language_code: str = "en-US",
        speaking_rate: float = 1.0,
        pitch: float = 0.0,
        **kwargs,
    ) -> bytes:
        """Synthesize using Google Cloud TTS."""
        if not self.api_key:
            raise ValueError("Google TTS API key not configured")
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"https://texttospeech.googleapis.com/v1/text:synthesize?key={self.api_key}",
                headers={"Content-Type": "application/json"},
                json={
                    "input": {"text": text},
                    "voice": {
                        "languageCode": language_code,
                        "name": voice_id,
                    },
                    "audioConfig": {
                        "audioEncoding": "MP3",
                        "speakingRate": speaking_rate,
                        "pitch": pitch,
                    },
                },
            ) as response:
                if response.status != 200:
                    error = await response.text()
                    raise RuntimeError(f"Google TTS error: {error}")
                data = await response.json()
                import base64
                return base64.b64decode(data["audioContent"])
    
    async def _synthesize_azure(
        self,
        text: str,
        voice_id: str,
        region: str = "eastus",
        **kwargs,
    ) -> bytes:
        """Synthesize using Azure Cognitive Services."""
        if not self.api_key:
            raise ValueError("Azure TTS key not configured")
        
        # Get access token
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"https://{region}.api.cognitive.microsoft.com/sts/v1.0/issueToken",
                headers={"Ocp-Apim-Subscription-Key": self.api_key},
            ) as response:
                if response.status != 200:
                    raise RuntimeError("Failed to get Azure access token")
                token = await response.text()
        
        # Synthesize
        ssml = f"""
        <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
            <voice name='{voice_id}'>{text}</voice>
        </speak>
        """
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"https://{region}.tts.speech.microsoft.com/cognitiveservices/v1",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/ssml+xml",
                    "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
                },
                data=ssml,
            ) as response:
                if response.status != 200:
                    error = await response.text()
                    raise RuntimeError(f"Azure TTS error: {error}")
                return await response.read()
    
    async def synthesize_batch(
        self,
        items: List[Dict[str, Any]],
        output_dir: Path,
        max_concurrent: int = 3,
    ) -> List[Path]:
        """
        Synthesize multiple texts in parallel.
        
        Args:
            items: List of {text, voice_id, filename} dicts
            output_dir: Directory for output files
            max_concurrent: Max concurrent syntheses
            
        Returns:
            List of output file paths
        """
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def synth_one(item: Dict[str, Any]) -> Optional[Path]:
            async with semaphore:
                try:
                    output_path = output_dir / item["filename"]
                    await self.synthesize(
                        text=item["text"],
                        voice_id=item["voice_id"],
                        output_path=output_path,
                    )
                    return output_path
                except Exception as e:
                    print(f"Failed to synthesize {item.get('filename')}: {e}")
                    return None
        
        tasks = [synth_one(item) for item in items]
        results = await asyncio.gather(*tasks)
        
        return [p for p in results if p is not None]


class TTSClientBridge:
    """
    Bridge to the TypeScript @sbf/tts-client package.
    
    Uses subprocess to invoke a Node.js CLI wrapper.
    """
    
    def __init__(self, tts_cli_path: Optional[str] = None):
        """
        Initialize the TTS client bridge.
        
        Args:
            tts_cli_path: Path to the TTS CLI script
        """
        self.cli_path = tts_cli_path or self._find_cli_path()
    
    def _find_cli_path(self) -> str:
        """Find the TTS CLI script."""
        # Look in common locations
        paths = [
            "node_modules/@sbf/tts-client/dist/cli.js",
            "../../../packages/@sbf/tts-client/dist/cli.js",
            "packages/@sbf/tts-client/dist/cli.js",
        ]
        
        for path in paths:
            if os.path.exists(path):
                return path
        
        return "npx @sbf/tts-client"
    
    async def synthesize(
        self,
        text: str,
        voice_id: str,
        provider: str = "openai",
        output_path: Optional[str] = None,
    ) -> bytes:
        """
        Synthesize using the Node.js TTS client.
        
        Args:
            text: Text to synthesize
            voice_id: Voice identifier
            provider: TTS provider
            output_path: Optional output file path
            
        Returns:
            Audio data as bytes
        """
        cmd = [
            "node",
            self.cli_path,
            "synthesize",
            "--text", text,
            "--voice", voice_id,
            "--provider", provider,
        ]
        
        if output_path:
            cmd.extend(["--output", output_path])
        
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        
        stdout, stderr = await proc.communicate()
        
        if proc.returncode != 0:
            raise RuntimeError(f"TTS CLI error: {stderr.decode()}")
        
        if output_path and os.path.exists(output_path):
            with open(output_path, "rb") as f:
                return f.read()
        
        return stdout


def create_audio_synthesizer(
    provider: str = "openai",
    use_bridge: bool = False,
) -> AudioSynthesizer | TTSClientBridge:
    """
    Factory function to create an audio synthesizer.
    
    Args:
        provider: TTS provider to use
        use_bridge: Whether to use the Node.js bridge
        
    Returns:
        Audio synthesizer instance
    """
    if use_bridge:
        return TTSClientBridge()
    
    return AudioSynthesizer(provider=provider)
