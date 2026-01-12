import { API_BASE_URL } from './config';
import { toast } from '@/lib/toast';

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
  accessToken?: string;
};

function parseErrorMessage(text: string, status: number): string {
  if (status === 401) {
    return '로그인이 필요합니다.';
  }
  if (status === 403) {
    return '권한이 없습니다.';
  }
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
  const { method = 'GET', body, headers = {}, cache, revalidate, accessToken } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (accessToken) {
    requestHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  const fetchOptions: RequestInit & { next?: { revalidate?: number } } = {
    method,
    headers: requestHeaders,
    cache,
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

export async function clientApiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, cache, accessToken } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (accessToken) {
    requestHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
    cache,
  });

  if (!response.ok) {
    const errorText = await response.text();
    
    if (response.status === 401) {
      toast.error('인증 정보가 만료되었습니다. 다시 로그인해주세요.');
    }
    
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
