/**
 * API Types for frontend-backend communication
 */

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Notebook types
export interface Notebook {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  archived: boolean;
  sourceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotebookInput {
  name: string;
  description?: string;
}

export interface UpdateNotebookInput {
  name?: string;
  description?: string;
}

// Type aliases for compatibility
export type NotebookCreateInput = CreateNotebookInput;
export type NotebookUpdateInput = UpdateNotebookInput;

// Source types
export type SourceType = 'url' | 'pdf' | 'youtube' | 'document' | 'text' | 'file';
export type SourceStatus = 'pending' | 'processing' | 'processed' | 'failed';

export interface SourceMetadata {
  summary?: string;
  wordCount?: number;
  author?: string;
  publishedDate?: string;
  [key: string]: unknown;
}

export interface Source {
  id: string;
  tenantId: string;
  notebookId?: string;
  title: string;
  url?: string;
  type: SourceType;
  status: SourceStatus;
  content?: string;
  metadata?: SourceMetadata;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SourceCreateInput {
  url?: string;
  notebookId?: string;
}

export interface SourceUploadInput {
  file: File;
  notebookId?: string;
}

export interface AddSourceFromUrlInput {
  url: string;
  notebookId?: string;
}

export interface AddSourceFromFileInput {
  file: File;
  notebookId?: string;
}

// Insight types
export type InsightType = 
  | 'summary' 
  | 'key-insights' 
  | 'action-items' 
  | 'mindmap' 
  | 'flashcards' 
  | 'study-notes';

export type TruthLevel = 'L3' | 'U1';

export interface SourceInsight {
  id: string;
  tenantId: string;
  sourceId: string;
  insightType: InsightType;
  title?: string;
  content: string;
  parsedContent?: unknown;
  truthLevel: TruthLevel;
  reviewed: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  tenantId: string;
  notebookId?: string;
  title?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SendChatMessageInput {
  sessionId: string;
  content: string;
  notebookId?: string;
}

// Search types
export interface SearchQuery {
  query: string;
  notebookId?: string;
  sourceTypes?: SourceType[];
  limit?: number;
}

export interface SearchResult {
  id: string;
  sourceId: string;
  title: string;
  content: string;
  highlight?: string;
  score: number;
  type: SourceType;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  limit?: number;
}
