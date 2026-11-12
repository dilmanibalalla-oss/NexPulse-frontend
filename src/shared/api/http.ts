import type { AxiosInstance } from 'axios';

export type ApiResponse = {
  status: number;
  data: unknown;
};

export type ApiClient = {
  get: (url: string, config?: { params?: Record<string, number> }) => Promise<ApiResponse>;
  post: (url: string, body?: unknown) => Promise<ApiResponse>;
  put: (url: string, body?: unknown) => Promise<ApiResponse>;
  delete: (url: string, config?: { params?: Record<string, string> }) => Promise<ApiResponse>;
};

export function bindClient(client: AxiosInstance): ApiClient {
  return {
    get: (url, config) => client.get(url, config),
    post: (url, body) => client.post(url, body),
    put: (url, body) => client.put(url, body),
    delete: (url, config) => client.delete(url, config),
  };
}
