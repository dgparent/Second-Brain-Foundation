"""
Jinja2 prompt template loader for AEI Core.

Provides a simple interface for loading and rendering prompt templates.
"""

import os
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, Optional

from jinja2 import Environment, FileSystemLoader, select_autoescape

# Get the prompts directory
PROMPTS_DIR = Path(__file__).parent


class PromptLoader:
    """
    Loader for Jinja2 prompt templates.
    
    Usage:
        loader = PromptLoader()
        prompt = loader.render("chat", context=context, notebook_id=notebook_id)
    """
    
    def __init__(self, templates_dir: Optional[Path] = None):
        """
        Initialize the prompt loader.
        
        Args:
            templates_dir: Optional custom templates directory
        """
        self.templates_dir = templates_dir or PROMPTS_DIR
        self.env = Environment(
            loader=FileSystemLoader(str(self.templates_dir)),
            autoescape=select_autoescape(["html", "xml"]),
            trim_blocks=True,
            lstrip_blocks=True,
        )
    
    def get_template(self, name: str) -> str:
        """
        Get a template by name.
        
        Args:
            name: Template name (without extension)
            
        Returns:
            Jinja2 Template object
        """
        # Try .jinja, .jinja2, .j2 extensions
        for ext in [".jinja", ".jinja2", ".j2", ""]:
            try:
                return self.env.get_template(f"{name}{ext}")
            except Exception:
                continue
        
        raise ValueError(f"Template not found: {name}")
    
    def render(self, name: str, **kwargs) -> str:
        """
        Render a template with the given context.
        
        Args:
            name: Template name
            **kwargs: Context variables for rendering
            
        Returns:
            Rendered template string
        """
        template = self.get_template(name)
        return template.render(**kwargs)
    
    def render_string(self, template_string: str, **kwargs) -> str:
        """
        Render a template from a string.
        
        Args:
            template_string: Jinja2 template string
            **kwargs: Context variables for rendering
            
        Returns:
            Rendered string
        """
        template = self.env.from_string(template_string)
        return template.render(**kwargs)


# Global loader instance
_loader: Optional[PromptLoader] = None


def get_loader() -> PromptLoader:
    """Get or create the global prompt loader."""
    global _loader
    if _loader is None:
        _loader = PromptLoader()
    return _loader


def get_prompt(name: str) -> str:
    """
    Get a prompt template by name.
    
    Args:
        name: Template name
        
    Returns:
        Raw template string
    """
    loader = get_loader()
    template = loader.get_template(name)
    return template.source if hasattr(template, 'source') else str(template)


def render_prompt(name: str, **kwargs) -> str:
    """
    Render a prompt template with context.
    
    Args:
        name: Template name
        **kwargs: Context variables
        
    Returns:
        Rendered prompt string
    """
    return get_loader().render(name, **kwargs)
