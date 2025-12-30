import { auth } from '@/auth';
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

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const session = await auth();
    if (session?.accessToken) {
      return { Authorization: `Bearer ${session.accessToken}` };
    }
  } catch {
    // 클라이언트 사이드에서는 auth() 호출 불가
  }
  return {};
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, cache, revalidate } = options;

  const authHeader = await getAuthHeader();

  const fetchOptions: RequestInit & { next?: { revalidate?: number } } = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...headers,
    },
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
      errorText || `API Error: ${response.status}`
    );
  }

  // 204 No Content 또는 빈 응답 처리
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

// 클라이언트 사이드용 API 클라이언트
export async function clientApiClient<T>(
  endpoint: string,
  options: RequestOptions & { accessToken?: string } = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, accessToken, cache } = options;

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
    throw new ApiException(
      response.status,
      errorText || `API Error: ${response.status}`
    );
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
