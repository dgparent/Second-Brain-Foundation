export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: {
    page?: number;
    perPage?: number;
    total?: number;
  };
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
