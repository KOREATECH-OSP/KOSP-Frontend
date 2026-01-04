const ACCESS_TOKEN_KEY = 'kosp:access-token';
const REFRESH_TOKEN_KEY = 'kosp:refresh-token';
const USER_INFO_KEY = 'kosp:user-info';

export interface StoredUser {
  id: number;
  email: string;
  name: string;
  profileImage: string | null;
  introduction: string | null;
}

export function saveTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveUserInfo(user: StoredUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
}

export function getUserInfo(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(USER_INFO_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as StoredUser;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
