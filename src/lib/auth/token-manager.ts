import { signOutOnce } from './signout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dev.api.swkoreatech.io';
const REFRESH_BUFFER_MS = 2 * 60 * 1000; // 만료 2분 전부터 선제적 갱신
const MAX_RETRY_COUNT = 2;

type JwtPayload = {
  exp?: number | string;
  iat?: number | string;
  canAccessAdmin?: boolean;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;

  const payload = parts[1];
  try {
    const base64 = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const decoded = atob(base64);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

function normalizeJwtExp(exp: number): number {
  return exp > 10_000_000_000 ? exp : exp * 1000;
}

function getTokenExpiry(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return null;

  const exp = typeof payload.exp === 'string' ? Number(payload.exp) : payload.exp;
  if (!Number.isFinite(exp)) return null;

  return normalizeJwtExp(exp);
}

interface TokenState {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
}

class TokenManager {
  private tokens: TokenState | null = null;
  private refreshPromise: Promise<TokenState | null> | null = null;
  private retryCount = 0;

  initialize(accessToken: string, refreshToken: string): void {
    const accessTokenExpires = getTokenExpiry(accessToken) || Date.now() + 30 * 60 * 1000;
    this.tokens = {
      accessToken,
      refreshToken,
      accessTokenExpires,
    };
    this.retryCount = 0;
    console.log('[TokenManager] Initialized, expires at:', new Date(accessTokenExpires).toISOString());
  }

  getAccessToken(): string | null {
    return this.tokens?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return this.tokens?.refreshToken ?? null;
  }

  isTokenExpiringSoon(): boolean {
    if (!this.tokens) return false;
    return Date.now() >= this.tokens.accessTokenExpires - REFRESH_BUFFER_MS;
  }

  isTokenExpired(): boolean {
    if (!this.tokens) return true;
    return Date.now() >= this.tokens.accessTokenExpires;
  }

  async refreshTokens(): Promise<string | null> {
    // 토큰이 없으면 갱신 불가
    if (!this.tokens) {
      console.log('[TokenManager] No tokens to refresh');
      return null;
    }

    // 이미 갱신 중이면 기존 Promise 대기 (mutex)
    if (this.refreshPromise) {
      console.log('[TokenManager] Waiting for existing refresh...');
      const result = await this.refreshPromise;
      return result?.accessToken ?? null;
    }

    // 갱신 시작
    this.refreshPromise = this.doRefresh();

    try {
      const result = await this.refreshPromise;
      return result?.accessToken ?? null;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async doRefresh(): Promise<TokenState | null> {
    if (!this.tokens) return null;

    console.log('[TokenManager] Starting token refresh...');

    for (let attempt = 0; attempt <= MAX_RETRY_COUNT; attempt++) {
      try {
        const headers: Record<string, string> = {
          'X-Refresh-Token': this.tokens.refreshToken,
        };
        if (this.tokens.accessToken) {
          headers['X-Access-Token'] = this.tokens.accessToken;
        }

        const response = await fetch(`${API_BASE_URL}/v1/auth/reissue`, {
          method: 'POST',
          headers,
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error(`[TokenManager] Refresh failed (attempt ${attempt + 1}):`, response.status, errorText);

          // 401/403은 refresh token이 만료된 것이므로 재시도 의미 없음
          if (response.status === 401 || response.status === 403) {
            this.handleRefreshFailure();
            return null;
          }

          // 다른 에러는 재시도
          if (attempt < MAX_RETRY_COUNT) {
            await this.delay(1000 * (attempt + 1)); // 점진적 대기
            continue;
          }

          this.handleRefreshFailure();
          return null;
        }

        const newTokens = await response.json();
        const accessTokenExpires = getTokenExpiry(newTokens.accessToken) || Date.now() + 30 * 60 * 1000;

        this.tokens = {
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
          accessTokenExpires,
        };
        this.retryCount = 0;

        console.log('[TokenManager] Token refreshed successfully, expires at:', new Date(accessTokenExpires).toISOString());

        // 세션 업데이트 트리거 (SessionProvider가 새 토큰을 인식하도록)
        this.updateSession(newTokens.accessToken, newTokens.refreshToken);

        return this.tokens;
      } catch (error) {
        console.error(`[TokenManager] Refresh error (attempt ${attempt + 1}):`, error);

        if (attempt < MAX_RETRY_COUNT) {
          await this.delay(1000 * (attempt + 1));
          continue;
        }

        this.handleRefreshFailure();
        return null;
      }
    }

    return null;
  }

  private handleRefreshFailure(): void {
    this.retryCount++;
    console.log(`[TokenManager] Refresh failure count: ${this.retryCount}`);

    // 최대 재시도 횟수 초과 시 로그아웃
    if (this.retryCount > MAX_RETRY_COUNT) {
      console.log('[TokenManager] Max retries exceeded, signing out...');
      this.tokens = null;
      signOutOnce({
        callbackUrl: '/login',
        toastMessage: '인증 정보가 만료되었습니다. 다시 로그인해주세요.',
      });
    }
  }

  private async updateSession(accessToken: string, refreshToken: string): Promise<void> {
    try {
      // NextAuth 세션 업데이트를 위해 update 함수 호출
      // SessionProvider의 update를 직접 호출할 수 없으므로 이벤트 발생
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('tokenRefreshed', {
            detail: { accessToken, refreshToken },
          })
        );
      }
    } catch (error) {
      console.error('[TokenManager] Failed to update session:', error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  clear(): void {
    this.tokens = null;
    this.refreshPromise = null;
    this.retryCount = 0;
  }
}

// 싱글톤 인스턴스
export const tokenManager = new TokenManager();
