"""
Utils package for AEI Core.

Provides text utilities, token counting, and other helpers.
"""

from .text import (
    clean_thinking_content,
    parse_thinking_content,
    remove_non_ascii,
    remove_non_printable,
    normalize_whitespace,
    truncate_text,
    extract_citations,
    strip_markdown_formatting,
)

__all__ = [
    "clean_thinking_content",
    "parse_thinking_content",
    "remove_non_ascii",
    "remove_non_printable",
    "normalize_whitespace",
    "truncate_text",
    "extract_citations",
    "strip_markdown_formatting",
]


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
