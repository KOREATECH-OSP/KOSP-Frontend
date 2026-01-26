import { API_BASE_URL } from './config';
import { signOutOnce } from '@/lib/auth/signout';

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
    credentials: 'include',
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
  options: RequestOptions = {},
  isRetry: boolean = false
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
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
    cache,
  });

  if (!response.ok) {
    const errorText = await response.text();

    // 401 에러 시 토큰 갱신 후 재시도 (한 번만)
    if (response.status === 401 && !isRetry) {
      try {
        // getSession() 대신 fetch를 통해 세션 갱신 트리거
        // NextAuth v5에서는 세션 fetch 시 jwt callback이 호출됨
        const res = await fetch('/api/auth/session', { method: 'GET' });

        if (res.ok) {
          const newSession = await res.json();
          if (newSession?.accessToken && !newSession?.error) {
            // 갱신된 토큰으로 재시도
            return clientApiClient<T>(
              endpoint,
              {
                ...options,
                accessToken: newSession.accessToken,
              },
              true
            );
          }
        }
      } catch {
        // 세션 갱신 실패 시 로그아웃
      }

      // 갱신 실패 또는 재시도 실패 시 로그아웃
      signOutOnce({
        callbackUrl: '/login',
        toastMessage: '인증 정보가 만료되었습니다. 다시 로그인해주세요.',
      });
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
