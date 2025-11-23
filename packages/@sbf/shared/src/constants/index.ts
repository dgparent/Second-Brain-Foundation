/**
 * SBF Constants
 */

export const SBF_VERSION = '0.1.0';

export const DEFAULT_SENSITIVITY_LEVEL = 'personal';

export const DEFAULT_LIFECYCLE_STATE = 'capture';

export const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

export const ENTITY_UID_PATTERN = /^([a-z0-9-]+)-([a-z0-9-]+)-(\d{3})$/;

export const FOLDER_STRUCTURE = {
  core: ['Daily', 'People', 'Places', 'Topics', 'Projects', 'Transitional'],
  extended: ['Sources', 'Artifacts', 'Events', 'Tasks', 'Processes'],
} as const;

export const MAX_ENTITY_TITLE_LENGTH = 200;

export const MAX_CONTENT_SIZE = 10 * 1024 * 1024; // 10MB

export const SUPPORTED_TOOLS = ['obsidian', 'notebooklm', 'anythingllm'] as const;
