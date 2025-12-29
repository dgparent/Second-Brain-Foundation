"""
Tests for LangGraph integration (Sprint 02.1).

Tests:
- Base state types
- Model provisioning utilities
- Checkpointer functionality
- Text utilities
"""

import pytest
import asyncio
from typing import Any, Dict

# Test text utilities
from utils.text import (
    clean_thinking_content,
    parse_thinking_content,
    remove_non_ascii,
    remove_non_printable,
    normalize_whitespace,
    truncate_text,
    extract_citations,
    strip_markdown_formatting,
)


class TestCleanThinkingContent:
    """Tests for clean_thinking_content function."""
    
    def test_removes_think_tags(self):
        """Should remove <think>...</think> tags."""
        content = "<think>Let me think about this...</think>The answer is 42."
        result = clean_thinking_content(content)
        assert result == "The answer is 42."
    
    def test_removes_thinking_tags(self):
        """Should remove <thinking>...</thinking> tags."""
        content = "<thinking>Processing...</thinking>Here's the response."
        result = clean_thinking_content(content)
        assert result == "Here's the response."
    
    def test_removes_reasoning_tags(self):
        """Should remove <reasoning>...</reasoning> tags."""
        content = "<reasoning>Step 1, Step 2</reasoning>Final answer."
        result = clean_thinking_content(content)
        assert result == "Final answer."
    
    def test_handles_multiline_thinking(self):
        """Should handle multiline thinking content."""
        content = """<think>
        This is a complex thought
        spanning multiple lines
        </think>
        The actual response here."""
        result = clean_thinking_content(content)
        assert "complex thought" not in result
        assert "The actual response here." in result
    
    def test_handles_malformed_closing_tag(self):
        """Should handle content with only closing tag."""
        content = "Some thinking</think>The real answer."
        result = clean_thinking_content(content)
        # Should remove content before </think>
        assert "The real answer." in result
    
    def test_preserves_normal_content(self):
        """Should preserve content without thinking tags."""
        content = "This is normal content without any tags."
        result = clean_thinking_content(content)
        assert result == content
    
    def test_handles_empty_input(self):
        """Should handle empty string."""
        assert clean_thinking_content("") == ""
        assert clean_thinking_content(None) is None
    
    def test_removes_multiple_think_blocks(self):
        """Should remove multiple thinking blocks."""
        content = "<think>First thought</think>Part 1<think>Second thought</think>Part 2"
        result = clean_thinking_content(content)
        assert "First thought" not in result
        assert "Second thought" not in result
        assert "Part 1" in result
        assert "Part 2" in result


class TestParseThinkingContent:
    """Tests for parse_thinking_content function."""
    
    def test_extracts_thinking_separately(self):
        """Should extract thinking content separately."""
        content = "<think>My reasoning</think>The answer."
        cleaned, thinking = parse_thinking_content(content)
        assert cleaned == "The answer."
        assert thinking == "My reasoning"
    
    def test_returns_none_for_no_thinking(self):
        """Should return None when no thinking tags."""
        content = "Just a regular response."
        cleaned, thinking = parse_thinking_content(content)
        assert cleaned == content
        assert thinking is None
    
    def test_combines_multiple_thinking_blocks(self):
        """Should combine multiple thinking blocks."""
        content = "<think>First</think>Middle<thinking>Second</thinking>End"
        cleaned, thinking = parse_thinking_content(content)
        assert "First" in thinking
        assert "Second" in thinking


class TestNormalizeWhitespace:
    """Tests for normalize_whitespace function."""
    
    def test_collapses_multiple_spaces(self):
        """Should collapse multiple spaces to single space."""
        assert normalize_whitespace("hello    world") == "hello world"
    
    def test_collapses_multiple_newlines(self):
        """Should collapse 3+ newlines to double newline."""
        assert normalize_whitespace("a\n\n\n\nb") == "a\n\nb"
    
    def test_preserves_double_newlines(self):
        """Should preserve paragraph breaks (double newlines)."""
        assert normalize_whitespace("a\n\nb") == "a\n\nb"
    
    def test_strips_line_whitespace(self):
        """Should strip whitespace from each line."""
        assert normalize_whitespace("  hello  \n  world  ") == "hello\nworld"


class TestTruncateText:
    """Tests for truncate_text function."""
    
    def test_truncates_long_text(self):
        """Should truncate text longer than max_length."""
        text = "This is a long sentence that needs truncation."
        result = truncate_text(text, 20)
        assert len(result) <= 20
        assert result.endswith("...")
    
    def test_preserves_short_text(self):
        """Should not truncate text shorter than max_length."""
        text = "Short"
        result = truncate_text(text, 20)
        assert result == text
    
    def test_respects_word_boundary(self):
        """Should truncate at word boundary by default."""
        text = "Hello wonderful world"
        result = truncate_text(text, 15)
        assert result == "Hello..."
    
    def test_ignores_word_boundary_when_disabled(self):
        """Should truncate at exact position when word_boundary=False."""
        text = "Hello wonderful world"
        result = truncate_text(text, 10, word_boundary=False)
        assert result == "Hello w..."


class TestExtractCitations:
    """Tests for extract_citations function."""
    
    def test_extracts_source_citations(self):
        """Should extract source citations."""
        text = "According to [source:abc123], the answer is yes."
        citations = extract_citations(text)
        assert len(citations) == 1
        assert citations[0] == {"type": "source", "id": "abc123"}
    
    def test_extracts_multiple_citations(self):
        """Should extract multiple citations."""
        text = "Based on [source:abc] and [note:xyz], we conclude..."
        citations = extract_citations(text)
        assert len(citations) == 2
    
    def test_extracts_different_types(self):
        """Should extract different citation types."""
        text = "[source:a][note:b][insight:c]"
        citations = extract_citations(text)
        types = [c["type"] for c in citations]
        assert "source" in types
        assert "note" in types
        assert "insight" in types
    
    def test_returns_empty_for_no_citations(self):
        """Should return empty list when no citations."""
        text = "No citations here."
        citations = extract_citations(text)
        assert citations == []


class TestStripMarkdownFormatting:
    """Tests for strip_markdown_formatting function."""
    
    def test_removes_headers(self):
        """Should remove markdown headers."""
        assert strip_markdown_formatting("# Title") == "Title"
        assert strip_markdown_formatting("## Subtitle") == "Subtitle"
    
    def test_removes_bold(self):
        """Should remove bold formatting."""
        assert strip_markdown_formatting("**bold**") == "bold"
        assert strip_markdown_formatting("__bold__") == "bold"
    
    def test_removes_italic(self):
        """Should remove italic formatting."""
        assert strip_markdown_formatting("*italic*") == "italic"
        assert strip_markdown_formatting("_italic_") == "italic"
    
    def test_removes_inline_code(self):
        """Should remove inline code formatting."""
        assert strip_markdown_formatting("`code`") == "code"
    
    def test_removes_links_keeps_text(self):
        """Should remove link formatting but keep text."""
        assert strip_markdown_formatting("[text](url)") == "text"


class TestRemoveNonAscii:
    """Tests for remove_non_ascii function."""
    
    def test_removes_unicode(self):
        """Should remove unicode characters."""
        assert remove_non_ascii("hello café") == "hello caf"
        assert remove_non_ascii("naïve") == "nave"
    
    def test_preserves_ascii(self):
        """Should preserve ASCII characters."""
        assert remove_non_ascii("Hello World 123!") == "Hello World 123!"


class TestRemoveNonPrintable:
    """Tests for remove_non_printable function."""
    
    def test_preserves_newlines(self):
        """Should preserve newlines."""
        assert "\n" in remove_non_printable("hello\nworld")
    
    def test_preserves_tabs(self):
        """Should preserve tabs."""
        assert "\t" in remove_non_printable("hello\tworld")
    
    def test_removes_control_chars(self):
        """Should remove control characters."""
        # Unicode null character
        result = remove_non_printable("hello\x00world")
        assert "\x00" not in result


# Test model provisioning utilities
from graphs.utils import (
    estimate_token_count,
    get_model_config,
    get_default_model_config,
    is_local_model,
)


class TestEstimateTokenCount:
    """Tests for estimate_token_count function."""
    
    def test_returns_zero_for_empty(self):
        """Should return 0 for empty string."""
        assert estimate_token_count("") == 0
    
    def test_estimates_short_text(self):
        """Should estimate tokens for short text."""
        count = estimate_token_count("Hello world")
        assert 2 <= count <= 5
    
    def test_estimates_long_text(self):
        """Should estimate tokens for longer text."""
        text = "This is a longer text with more words to estimate."
        count = estimate_token_count(text)
        assert 10 <= count <= 20


class TestGetModelConfig:
    """Tests for get_model_config function."""
    
    @pytest.mark.asyncio
    async def test_returns_known_model(self):
        """Should return config for known models."""
        config = await get_model_config("gpt-4o")
        assert config["provider"] == "openai"
        assert config["model_id"] == "gpt-4o"
    
    @pytest.mark.asyncio
    async def test_raises_for_unknown_model(self):
        """Should raise ValueError for unknown models."""
        with pytest.raises(ValueError):
            await get_model_config("unknown-model-xyz")
    
    @pytest.mark.asyncio
    async def test_ollama_models_are_local(self):
        """Should mark Ollama models as local."""
        config = await get_model_config("llama3.2")
        assert config.get("is_local") is True


class TestGetDefaultModelConfig:
    """Tests for get_default_model_config function."""
    
    @pytest.mark.asyncio
    async def test_returns_chat_default(self):
        """Should return default model for chat."""
        config = await get_default_model_config("chat")
        assert "model_id" in config
        assert "provider" in config
    
    @pytest.mark.asyncio
    async def test_returns_large_context_default(self):
        """Should return large context model."""
        config = await get_default_model_config("large_context")
        assert config["context_window"] >= 100000


class TestIsLocalModel:
    """Tests for is_local_model function."""
    
    def test_ollama_is_local(self):
        """Should identify Ollama models as local."""
        assert is_local_model("llama3.2") is True
    
    def test_openai_is_not_local(self):
        """Should identify OpenAI models as not local."""
        assert is_local_model("gpt-4o") is False


# Test checkpointer
from graphs.checkpointer import InMemoryCheckpointer


class TestInMemoryCheckpointer:
    """Tests for InMemoryCheckpointer."""
    
    @pytest.fixture
    def checkpointer(self):
        """Create a test checkpointer."""
        return InMemoryCheckpointer("test-tenant")
    
    @pytest.mark.asyncio
    async def test_put_and_get(self, checkpointer):
        """Should store and retrieve checkpoints."""
        config = {"configurable": {"thread_id": "thread-1"}}
        checkpoint = {"id": "cp-1", "data": "test"}
        metadata = {"step": 1}
        
        await checkpointer.aput(config, checkpoint, metadata)
        result = await checkpointer.aget(config)
        
        assert result is not None
        assert result.checkpoint["data"] == "test"
    
    @pytest.mark.asyncio
    async def test_tenant_isolation(self):
        """Should isolate data by tenant."""
        cp1 = InMemoryCheckpointer("tenant-1")
        cp2 = InMemoryCheckpointer("tenant-2")
        
        config = {"configurable": {"thread_id": "shared-thread"}}
        
        await cp1.aput(config, {"id": "1", "data": "tenant1"}, {})
        await cp2.aput(config, {"id": "2", "data": "tenant2"}, {})
        
        result1 = await cp1.aget(config)
        result2 = await cp2.aget(config)
        
        assert result1.checkpoint["data"] == "tenant1"
        assert result2.checkpoint["data"] == "tenant2"
    
    @pytest.mark.asyncio
    async def test_returns_none_for_missing(self, checkpointer):
        """Should return None for missing threads."""
        config = {"configurable": {"thread_id": "nonexistent"}}
        result = await checkpointer.aget(config)
        assert result is None


# Test prompt loader
from prompts import render_prompt, get_prompt


class TestPromptLoader:
    """Tests for prompt template loading."""
    
    def test_renders_chat_prompt(self):
        """Should render chat prompt template."""
        result = render_prompt("chat", context="Test context")
        assert "Second Brain Foundation" in result
        assert "Test context" in result
    
    def test_renders_with_notebook(self):
        """Should include notebook info when provided."""
        result = render_prompt("chat", notebook={"name": "My Notebook"})
        # Notebook info should be in the prompt when provided
        assert "research assistant" in result.lower()
