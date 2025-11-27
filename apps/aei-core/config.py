"""
Application configuration management.

Loads settings from environment variables with sensible defaults.
"""

from pydantic_settings import BaseSettings
from pathlib import Path
from typing import Optional


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Application
    app_name: str = "AEI Core"
    app_version: str = "0.1.0"
    debug: bool = True
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Database
    database_url: str = "postgresql+asyncpg://aei:aei@localhost:5432/aei_core"
    database_echo: bool = False  # Set to True for SQL logging
    
    # Vault
    vault_path: Path = Path.home() / "second-brain"
    vault_watch_enabled: bool = True
    vault_watch_debounce_ms: int = 500
    
    # LLM - Ollama (local-first)
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2"
    ollama_embedding_model: str = "nomic-embed-text"
    ollama_timeout: int = 120  # seconds
    
    # Entity Extraction
    extraction_confidence_threshold: float = 0.7
    extraction_batch_size: int = 10
    
    # Queue
    queue_auto_apply_threshold: float = 0.9
    queue_max_pending: int = 100
    
    # Security
    secret_key: str = "dev-secret-key-change-in-production"
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()
