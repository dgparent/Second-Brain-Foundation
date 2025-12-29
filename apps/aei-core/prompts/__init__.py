"""
Prompt template management for AEI Core.

Uses Jinja2 for flexible prompt rendering.
"""

from .loader import PromptLoader, get_prompt, render_prompt

__all__ = [
    "PromptLoader",
    "get_prompt",
    "render_prompt",
]
