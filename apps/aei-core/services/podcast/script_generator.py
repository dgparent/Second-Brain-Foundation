"""
Podcast Script Generator

Generates engaging podcast scripts with two distinct voices
discussing source material using LLM.
"""
import re
import uuid
from typing import Any, Dict, List, Optional

from models.podcast import (
    PodcastConfig,
    PodcastScript,
    PodcastSegment,
    PodcastStyle,
    SpeakerRole,
    VoicePersonality,
)


# Prompt template for podcast script generation
PODCAST_SCRIPT_PROMPT = """
You are creating a podcast script for two hosts discussing the following content.
The podcast should be engaging, conversational, and informative.

HOSTS:
- {host_name} ({host_role}): {host_style}. Traits: {host_traits}
- {guest_name} ({guest_role}): {guest_style}. Traits: {guest_traits}

STYLE: {podcast_style}
TARGET DURATION: {target_duration} seconds (approximately {word_count} words)

CONTENT TO DISCUSS:
{source_content}

KEY INSIGHTS:
{insights}

Create a natural conversation between the two hosts. Include:
1. {intro_instruction}
2. Discussion of main points with genuine curiosity
3. Personal reactions and insights
4. Questions that a listener might have
5. {outro_instruction}

Format each line EXACTLY as:
[SPEAKER_NAME]: Dialogue text

Example:
[{host_name}]: Welcome to today's episode!
[{guest_name}]: Thanks for having me, I'm excited to dive into this topic.

Ensure the dialogue feels natural with:
- Occasional interruptions or overlapping thoughts
- Questions and answers between hosts
- Expressions of surprise, agreement, or curiosity
- Smooth transitions between topics
- Varied sentence lengths and styles
- References to specific details from the content

DO NOT include:
- Stage directions or actions in parentheses
- Descriptions of emotions or tone
- Any text that isn't dialogue

The total script should be approximately {word_count} words.
"""


INTRO_VARIATIONS = [
    "A warm, engaging intro welcoming listeners and introducing the topic",
    "A hook that captures attention and sets up the main discussion",
    "A brief overview of what listeners will learn in this episode",
]

OUTRO_VARIATIONS = [
    "A thoughtful wrap-up summarizing key takeaways",
    "A call-to-action encouraging listeners to explore more",
    "A natural conclusion with a memorable final thought",
]


class PodcastScriptGenerator:
    """Generates podcast scripts from source content using LLM."""
    
    def __init__(self, ai_client: Any):
        """
        Initialize the script generator.
        
        Args:
            ai_client: AI client for LLM generation (e.g., LangChain model)
        """
        self.ai_client = ai_client
    
    async def generate_script(
        self,
        sources: List[Dict[str, Any]],
        insights: Optional[List[str]] = None,
        config: Optional[PodcastConfig] = None,
    ) -> PodcastScript:
        """
        Generate a podcast script from source content.
        
        Args:
            sources: List of source content dicts with 'title' and 'content'/'summary'
            insights: Optional list of key insights to incorporate
            config: Podcast configuration options
            
        Returns:
            Generated PodcastScript with segments
        """
        config = config or PodcastConfig()
        
        # Get or create host/guest personalities
        host = config.get_default_host()
        guest = config.get_default_guest()
        
        # Estimate word count from target duration (150 words/minute)
        word_count = int(config.target_duration / 60 * 150)
        
        # Prepare source content for prompt
        source_content = self._prepare_source_content(sources)
        insights_text = self._prepare_insights(insights)
        
        # Select intro/outro variations
        import random
        intro_instruction = random.choice(INTRO_VARIATIONS) if config.include_intro else "Skip intro, start with discussion"
        outro_instruction = random.choice(OUTRO_VARIATIONS) if config.include_outro else "End naturally without formal outro"
        
        # Build the prompt
        prompt = PODCAST_SCRIPT_PROMPT.format(
            host_name=host.name,
            host_role=host.role.value,
            host_style=host.style,
            host_traits=", ".join(host.traits) if host.traits else "curious, thoughtful",
            guest_name=guest.name,
            guest_role=guest.role.value,
            guest_style=guest.style,
            guest_traits=", ".join(guest.traits) if guest.traits else "insightful, engaging",
            podcast_style=config.style.value,
            target_duration=config.target_duration,
            word_count=word_count,
            source_content=source_content,
            insights=insights_text,
            intro_instruction=intro_instruction,
            outro_instruction=outro_instruction,
        )
        
        # Generate script with LLM
        if hasattr(self.ai_client, "ainvoke"):
            # LangChain model
            response = await self.ai_client.ainvoke(prompt)
            raw_script = response.content if hasattr(response, "content") else str(response)
        elif hasattr(self.ai_client, "generate"):
            # Custom AI client
            response = await self.ai_client.generate(
                prompt=prompt,
                max_tokens=4000,
            )
            raw_script = response.content if hasattr(response, "content") else response
        else:
            # Direct string call
            raw_script = await self.ai_client(prompt)
        
        # Parse the generated script
        segments = self._parse_script(raw_script, host, guest)
        
        # Build script object
        script = PodcastScript(
            title=self._generate_title(sources),
            description=f"A {config.style.value} podcast discussing {len(sources)} source(s).",
            segments=segments,
        )
        
        script.calculate_word_count()
        script.estimate_duration()
        
        return script
    
    def _prepare_source_content(
        self,
        sources: List[Dict[str, Any]],
        max_chars: int = 8000,
    ) -> str:
        """Prepare source content for the prompt."""
        content_parts = []
        chars_used = 0
        
        for source in sources:
            title = source.get("title", "Untitled")
            
            # Get content, preferring summary over full content
            content = source.get("summary") or source.get("content", "")
            
            # Truncate if needed
            remaining_chars = max_chars - chars_used
            if len(content) > remaining_chars:
                content = content[:remaining_chars - 100] + "..."
            
            part = f"## {title}\n{content}"
            content_parts.append(part)
            chars_used += len(part)
            
            if chars_used >= max_chars:
                break
        
        return "\n\n".join(content_parts)
    
    def _prepare_insights(self, insights: Optional[List[str]]) -> str:
        """Format insights for the prompt."""
        if not insights:
            return "No specific insights provided. Identify key points from the content."
        
        return "\n".join(f"- {insight}" for insight in insights)
    
    def _parse_script(
        self,
        raw_script: str,
        host: VoicePersonality,
        guest: VoicePersonality,
    ) -> List[PodcastSegment]:
        """
        Parse LLM output into structured segments.
        
        Expects format: [SPEAKER_NAME]: Dialogue text
        """
        segments = []
        lines = raw_script.strip().split("\n")
        
        # Create case-insensitive name mapping
        name_to_role = {
            host.name.lower(): SpeakerRole.HOST,
            guest.name.lower(): SpeakerRole.GUEST,
            "host": SpeakerRole.HOST,
            "guest": SpeakerRole.GUEST,
        }
        
        # Regex pattern for [SPEAKER]: text format
        pattern = re.compile(r"^\[?([^\]:\[]+)\]?:\s*(.+)$")
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            match = pattern.match(line)
            if not match:
                continue
            
            speaker_raw = match.group(1).strip().lower()
            text = match.group(2).strip()
            
            if not text:
                continue
            
            # Map speaker name to role
            speaker_role = None
            for name, role in name_to_role.items():
                if name in speaker_raw or speaker_raw in name:
                    speaker_role = role
                    break
            
            if speaker_role is None:
                # Default to alternating or guess based on position
                continue
            
            segments.append(PodcastSegment(
                id=str(uuid.uuid4()),
                speaker=speaker_role,
                text=text,
            ))
        
        # Validate we have segments
        if not segments:
            # Fallback: try to parse without brackets
            segments = self._parse_script_fallback(raw_script, host, guest)
        
        return segments
    
    def _parse_script_fallback(
        self,
        raw_script: str,
        host: VoicePersonality,
        guest: VoicePersonality,
    ) -> List[PodcastSegment]:
        """Fallback parser for different script formats."""
        segments = []
        lines = raw_script.strip().split("\n")
        
        # Try SPEAKER: text format without brackets
        for line in lines:
            line = line.strip()
            if not line or ":" not in line:
                continue
            
            parts = line.split(":", 1)
            if len(parts) != 2:
                continue
            
            speaker_raw = parts[0].strip().lower()
            text = parts[1].strip()
            
            if not text or len(text) < 5:
                continue
            
            # Determine speaker
            if host.name.lower() in speaker_raw:
                role = SpeakerRole.HOST
            elif guest.name.lower() in speaker_raw:
                role = SpeakerRole.GUEST
            else:
                continue
            
            segments.append(PodcastSegment(
                id=str(uuid.uuid4()),
                speaker=role,
                text=text,
            ))
        
        return segments
    
    def _generate_title(self, sources: List[Dict[str, Any]]) -> str:
        """Generate a title for the podcast."""
        if not sources:
            return "Knowledge Podcast"
        
        first_title = sources[0].get("title", "Unknown")
        
        # Clean up the title
        first_title = first_title[:50]  # Limit length
        
        if len(sources) > 1:
            return f"Deep Dive: {first_title} and more"
        
        return f"Deep Dive: {first_title}"
    
    async def regenerate_segment(
        self,
        segment: PodcastSegment,
        context: str,
        style_hint: str = "more engaging",
    ) -> PodcastSegment:
        """
        Regenerate a single segment with different style.
        
        Args:
            segment: Original segment to regenerate
            context: Context from surrounding segments
            style_hint: Hint for how to change the style
            
        Returns:
            New segment with regenerated text
        """
        prompt = f"""
Rewrite this podcast dialogue line to be {style_hint}.

Original: {segment.text}

Context of the conversation:
{context}

Keep the same speaker ({segment.speaker.value}) and general topic,
but make it {style_hint}.

Output only the new dialogue line, no speaker prefix.
"""
        
        if hasattr(self.ai_client, "ainvoke"):
            response = await self.ai_client.ainvoke(prompt)
            new_text = response.content if hasattr(response, "content") else str(response)
        else:
            new_text = await self.ai_client(prompt)
        
        return PodcastSegment(
            id=str(uuid.uuid4()),
            speaker=segment.speaker,
            text=new_text.strip(),
        )
