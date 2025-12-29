"""
Text utilities for AEI Core.

Provides text cleaning, thinking tag extraction, and content preprocessing.
"""

import re
import unicodedata
from typing import Tuple, Optional

# Patterns for matching thinking content in AI responses
# Standard pattern: <think>...</think>
THINK_PATTERN = re.compile(r"<think>(.*?)</think>", re.DOTALL)
# Pattern for malformed output: content</think> (missing opening tag)
THINK_PATTERN_NO_OPEN = re.compile(r"^(.*?)</think>", re.DOTALL)
# Alternative patterns used by some models
THINKING_PATTERN = re.compile(r"<thinking>(.*?)</thinking>", re.DOTALL)
REASONING_PATTERN = re.compile(r"<reasoning>(.*?)</reasoning>", re.DOTALL)


def clean_thinking_content(content: str) -> str:
    """
    Remove thinking/reasoning tags from AI model responses.
    
    Models like Claude and DeepSeek may include <think>...</think> or 
    <thinking>...</thinking> tags in their responses. This function
    removes these tags while preserving the actual response.
    
    Args:
        content: Raw AI model response
        
    Returns:
        Cleaned content with thinking tags removed
    """
    if not content:
        return content
    
    # Remove standard <think>...</think> tags
    content = THINK_PATTERN.sub("", content)
    
    # Remove <thinking>...</thinking> tags
    content = THINKING_PATTERN.sub("", content)
    
    # Remove <reasoning>...</reasoning> tags
    content = REASONING_PATTERN.sub("", content)
    
    # Handle malformed output (missing opening tag)
    content = THINK_PATTERN_NO_OPEN.sub("", content)
    
    # Clean up extra whitespace that may result
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    return content.strip()


def parse_thinking_content(content: str) -> Tuple[str, Optional[str]]:
    """
    Extract thinking content separately from the main response.
    
    Useful for debugging or displaying the model's reasoning process.
    
    Args:
        content: Raw AI model response
        
    Returns:
        Tuple of (cleaned_content, thinking_content)
        thinking_content is None if no thinking tags were found
    """
    if not content:
        return content, None
    
    thinking_parts = []
    
    # Extract standard <think>...</think> content
    think_matches = THINK_PATTERN.findall(content)
    thinking_parts.extend(think_matches)
    
    # Extract <thinking>...</thinking> content
    thinking_matches = THINKING_PATTERN.findall(content)
    thinking_parts.extend(thinking_matches)
    
    # Extract <reasoning>...</reasoning> content
    reasoning_matches = REASONING_PATTERN.findall(content)
    thinking_parts.extend(reasoning_matches)
    
    # Clean the content
    cleaned = clean_thinking_content(content)
    
    # Combine all thinking parts
    thinking = "\n\n".join(part.strip() for part in thinking_parts) if thinking_parts else None
    
    return cleaned, thinking


def remove_non_ascii(text: str) -> str:
    """
    Remove non-ASCII characters from text.
    
    Args:
        text: Input text
        
    Returns:
        Text with only ASCII characters
    """
    return re.sub(r"[^\x00-\x7F]+", "", text)


def remove_non_printable(text: str) -> str:
    """
    Remove non-printable characters from text while preserving structure.
    
    Args:
        text: Input text
        
    Returns:
        Cleaned text with printable characters only
    """
    if not text:
        return text
    
    # Replace special Unicode whitespace with regular space
    text = re.sub(r"[\u2000-\u200B\u202F\u205F\u3000]", " ", text)
    
    # Replace unusual line terminators with newline
    text = re.sub(r"[\u2028\u2029\r]", "\n", text)
    
    # Remove control characters except newlines and tabs
    text = "".join(
        char for char in text 
        if unicodedata.category(char)[0] != "C" or char in "\n\t"
    )
    
    # Replace non-breaking spaces
    text = text.replace("\xa0", " ").strip()

    return text


def normalize_whitespace(text: str) -> str:
    """
    Normalize whitespace in text.
    
    - Collapses multiple spaces to single space
    - Collapses multiple newlines to double newline
    - Strips leading/trailing whitespace
    
    Args:
        text: Input text
        
    Returns:
        Text with normalized whitespace
    """
    if not text:
        return text
    
    # Collapse multiple spaces (but not newlines)
    text = re.sub(r'[^\S\n]+', ' ', text)
    
    # Collapse 3+ newlines to 2
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Strip each line
    lines = [line.strip() for line in text.split('\n')]
    
    return '\n'.join(lines).strip()


def truncate_text(
    text: str, 
    max_length: int, 
    suffix: str = "...",
    word_boundary: bool = True
) -> str:
    """
    Truncate text to a maximum length.
    
    Args:
        text: Input text
        max_length: Maximum length including suffix
        suffix: String to append if truncated
        word_boundary: If True, truncate at word boundary
        
    Returns:
        Truncated text
    """
    if not text or len(text) <= max_length:
        return text
    
    target_length = max_length - len(suffix)
    
    if word_boundary:
        # Find the last space before target length
        truncated = text[:target_length]
        last_space = truncated.rfind(' ')
        if last_space > target_length * 0.5:  # Only if not cutting off too much
            truncated = truncated[:last_space]
        return truncated.rstrip() + suffix
    else:
        return text[:target_length] + suffix


def extract_citations(text: str) -> list[dict]:
    """
    Extract citation references from text.
    
    Citations are expected in format [type:id], e.g.:
    - [source:abc123]
    - [note:xyz789]
    - [insight:def456]
    
    Args:
        text: Text containing citations
        
    Returns:
        List of dicts with 'type' and 'id' keys
    """
    pattern = re.compile(r'\[(\w+):(\w+)\]')
    matches = pattern.findall(text)
    
    return [{"type": match[0], "id": match[1]} for match in matches]


def strip_markdown_formatting(text: str) -> str:
    """
    Remove common Markdown formatting for plain text display.
    
    Args:
        text: Markdown-formatted text
        
    Returns:
        Plain text without Markdown formatting
    """
    if not text:
        return text
    
    # Remove headers
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    
    # Remove bold/italic
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = re.sub(r'__([^_]+)__', r'\1', text)
    text = re.sub(r'_([^_]+)_', r'\1', text)
    
    # Remove inline code
    text = re.sub(r'`([^`]+)`', r'\1', text)
    
    # Remove links but keep text
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    
    # Remove images
    text = re.sub(r'!\[([^\]]*)\]\([^)]+\)', '', text)
    
    # Remove blockquotes
    text = re.sub(r'^>\s+', '', text, flags=re.MULTILINE)
    
    return text.strip()
