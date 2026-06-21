import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { govaDbGetAuth, govaDbSetAuth } from '@/lib/gova-db';

import { normalizeApiError } from './api-error-normalizer';

class ApiClient {
  private client: AxiosInstance;
  private cachedAuthToken: string | null = null;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || '/api') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      async (config) => {
        // Add auth token if available
        const token = await this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const normalizedError = normalizeApiError(error, error.config?.url);
        return Promise.reject(normalizedError);
      }
    );
  }

  private async getAuthToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    if (this.cachedAuthToken) return this.cachedAuthToken;
    const authData = await govaDbGetAuth();
    this.cachedAuthToken = authData.authToken ?? null;
    return this.cachedAuthToken;
  }

  public async setAuthToken(token: string | null): Promise<void> {
    this.cachedAuthToken = token;
    if (token) {
      await govaDbSetAuth({ authToken: token });
    } else {
      await govaDbSetAuth({});
    }
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get<T>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put<T>(url, data, config);
    return response.data;
  }

  public async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete<T>(url, config);
    return response.data;
  }

  public getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient();
