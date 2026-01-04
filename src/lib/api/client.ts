import { API_BASE_URL } from './config';

export interface ApiError {
  status: number;
  message: string;
}

export class ApiException extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiException';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  cache?: RequestCache;
  revalidate?: number;
};

function parseErrorMessage(text: string, status: number): string {
  if (!text) return `API Error: ${status}`;
  try {
    const json = JSON.parse(text);
    return json.message || json.error || `API Error: ${status}`;
  } catch {
    return text;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, cache, revalidate } = options;

  const fetchOptions: RequestInit & { next?: { revalidate?: number } } = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    cache,
    credentials: 'include',
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  if (revalidate !== undefined) {
    fetchOptions.next = { revalidate };
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiException(
      response.status,
      parseErrorMessage(errorText, response.status)
    );
  }

  // 204 No Content
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

// 클라이언트 사이드용 API 클라이언트
export async function clientApiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, cache } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiException(
      response.status,
      parseErrorMessage(errorText, response.status)
    );
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
