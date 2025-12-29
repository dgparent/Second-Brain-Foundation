import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiError } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * API client singleton for making authenticated requests
 */
class ApiClient {
  private instance: AxiosInstance;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.instance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle auth errors
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        // Handle 401 errors - try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const newToken = await this.doRefreshToken();
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.instance.request(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and reject
            this.clearTokens();
            return Promise.reject(error);
          }
        }
        
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private formatError(error: AxiosError<ApiError>): Error {
    if (error.response?.data?.message) {
      const apiError = new Error(error.response.data.message);
      (apiError as Error & { code?: string }).code = error.response.data.code;
      return apiError;
    }
    if (error.message === 'Network Error') {
      return new Error('Unable to connect to the server. Please check your connection.');
    }
    return new Error(error.message || 'An unexpected error occurred');
  }

  private async doRefreshToken(): Promise<string | null> {
    if (!this.refreshToken) return null;

    // Prevent multiple refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: this.refreshToken,
        });
        const { token, refreshToken: newRefreshToken } = response.data;
        this.setTokens(token, newRefreshToken);
        return token;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  setTokens(token: string, refreshToken: string) {
    this.token = token;
    this.refreshToken = refreshToken;
    
    // Persist in localStorage for page refreshes
    if (typeof window !== 'undefined') {
      localStorage.setItem('sbf_token', token);
      localStorage.setItem('sbf_refresh_token', refreshToken);
    }
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sbf_token');
      localStorage.removeItem('sbf_refresh_token');
    }
  }

  loadStoredTokens() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('sbf_token');
      this.refreshToken = localStorage.getItem('sbf_refresh_token');
    }
  }

  hasToken(): boolean {
    return !!this.token;
  }

  // HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  // Upload with progress
  async upload<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    additionalData?: Record<string, string>
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response = await this.instance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }
}

// Singleton instance
export const api = new ApiClient();

// Initialize stored tokens on load
if (typeof window !== 'undefined') {
  api.loadStoredTokens();
}

/**
 * Get the current auth token (for use in fetch requests)
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sbf_token');
  }
  return null;
}
