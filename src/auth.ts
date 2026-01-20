import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dev.api.swkoreatech.io';

type JwtPayload = {
  exp?: number | string;
  iat?: number | string;
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
    const decoded = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

function normalizeJwtExp(exp: number): number {
  // exp는 초 또는 ms 단위일 수 있음
  return exp > 10_000_000_000 ? exp : exp * 1000;
}

// JWT에서 만료 시간 추출
function getTokenExpiry(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return null;

  const exp = typeof payload.exp === 'string' ? Number(payload.exp) : payload.exp;
  if (!Number.isFinite(exp)) return null;

  return normalizeJwtExp(exp);
}

function getTokenIssuedAt(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload?.iat) return null;

  const iat = typeof payload.iat === 'string' ? Number(payload.iat) : payload.iat;
  if (!Number.isFinite(iat)) return null;

  return normalizeJwtExp(iat);
}

// 토큰 갱신 함수
// 주의: 서버리스 환경에서는 모듈 레벨 변수가 요청 간 공유되지 않으므로
// 락 메커니즘 대신 JWT 만료 시간 기반으로 갱신 여부를 결정합니다.
async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
  accessTokenIssuedAt?: number;
  accessTokenTtl?: number;
} | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/auth/reissue`, {
      method: 'POST',
      headers: {
        'X-Refresh-Token': refreshToken,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('[Auth] Failed to refresh token:', response.status, errorText);
      return null;
    }

    const tokens = await response.json();
    const accessTokenExpires = getTokenExpiry(tokens.accessToken) || Date.now() + 30 * 60 * 1000;
    const accessTokenIssuedAt = getTokenIssuedAt(tokens.accessToken) ?? undefined;
    const accessTokenTtl =
      accessTokenIssuedAt && accessTokenExpires > accessTokenIssuedAt
        ? accessTokenExpires - accessTokenIssuedAt
        : undefined;

    console.log('[Auth] Token refreshed successfully, expires at:', new Date(accessTokenExpires).toISOString());

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpires,
      accessTokenIssuedAt,
      accessTokenTtl,
    };
  } catch (error) {
    console.error('[Auth] Error refreshing token:', error);
    return null;
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const loginRes = await fetch(`${API_BASE_URL}/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!loginRes.ok) {
            return null;
          }

          const tokens = await loginRes.json();

          const meRes = await fetch(`${API_BASE_URL}/v1/auth/me`, {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
          });

          if (!meRes.ok) {
            return null;
          }

          const userInfo = await meRes.json();

          return {
            id: String(userInfo.id),
            email: userInfo.email,
            name: userInfo.name,
            image: userInfo.profileImage,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          };
        } catch {
          return null;
        }
      },
    }),
    Credentials({
      id: 'signup-token',
      name: 'Signup Token',
      credentials: {
        accessToken: { label: 'Access Token', type: 'text' },
        refreshToken: { label: 'Refresh Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.accessToken || !credentials?.refreshToken) {
          return null;
        }

        try {
          const meRes = await fetch(`${API_BASE_URL}/v1/auth/me`, {
            headers: { Authorization: `Bearer ${credentials.accessToken}` },
          });

          if (!meRes.ok) {
            return null;
          }

          const userInfo = await meRes.json();

          return {
            id: String(userInfo.id),
            email: userInfo.email,
            name: userInfo.name,
            image: userInfo.profileImage,
            accessToken: credentials.accessToken as string,
            refreshToken: credentials.refreshToken as string,
          };
        } catch {
          return null;
        }
      },
    }),
    Credentials({
      id: 'github-login',
      name: 'GitHub Login',
      credentials: {
        githubAccessToken: { label: 'GitHub Access Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.githubAccessToken) {
          return null;
        }

        try {
          const loginRes = await fetch(`${API_BASE_URL}/v1/auth/login/github`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              githubAccessToken: credentials.githubAccessToken,
            }),
          });

          if (!loginRes.ok) {
            return null;
          }

          const tokens = await loginRes.json();

          const meRes = await fetch(`${API_BASE_URL}/v1/auth/me`, {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
          });

          if (!meRes.ok) {
            return null;
          }

          const userInfo = await meRes.json();

          return {
            id: String(userInfo.id),
            email: userInfo.email,
            name: userInfo.name,
            image: userInfo.profileImage,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      // 최초 로그인 시 토큰 저장
      if (user) {
        const accessToken = (user as { accessToken: string }).accessToken;
        const refreshToken = (user as { refreshToken: string }).refreshToken;
        const accessTokenExpires = getTokenExpiry(accessToken) || Date.now() + 30 * 60 * 1000;
        const accessTokenIssuedAt = getTokenIssuedAt(accessToken) ?? undefined;
        const accessTokenTtl =
          accessTokenIssuedAt && accessTokenExpires > accessTokenIssuedAt
            ? accessTokenExpires - accessTokenIssuedAt
            : undefined;

        return {
          ...token,
          accessToken,
          refreshToken,
          accessTokenExpires,
          accessTokenIssuedAt,
          accessTokenTtl,
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.image,
          error: undefined,
        };
      }

      // 갱신 실패 상태면 반복 시도하지 않음
      if (token.error === 'RefreshTokenExpired' || token.error === 'RefreshTokenMissing') {
        return token;
      }

      // 토큰이 아직 유효한 경우 그대로 반환
      const accessTokenExpires = token.accessTokenExpires as number | undefined;
      const accessTokenTtl = token.accessTokenTtl as number | undefined;
      const refreshBufferMs = accessTokenTtl
        ? Math.min(60 * 1000, Math.floor(accessTokenTtl * 0.1))
        : 60 * 1000;
      if (accessTokenExpires && Date.now() < accessTokenExpires - refreshBufferMs) {
        // 만료 직전에는 갱신 시도, 그 전에는 유지
        return token;
      }

      // 토큰이 만료되었거나 만료 임박 - 갱신 시도
      const refreshToken = token.refreshToken as string | undefined;
      if (!refreshToken) {
        return { ...token, error: 'RefreshTokenMissing' };
      }

      const refreshedTokens = await refreshAccessToken(refreshToken);
      if (!refreshedTokens) {
        // 갱신 실패 - 재로그인 필요
        return { ...token, error: 'RefreshTokenExpired' };
      }

      // 갱신 성공
      return {
        ...token,
        accessToken: refreshedTokens.accessToken,
        refreshToken: refreshedTokens.refreshToken,
        accessTokenExpires: refreshedTokens.accessTokenExpires,
        accessTokenIssuedAt: refreshedTokens.accessTokenIssuedAt ?? token.accessTokenIssuedAt,
        accessTokenTtl: refreshedTokens.accessTokenTtl ?? token.accessTokenTtl,
        error: undefined,
      };
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken as string,
        refreshToken: token.refreshToken as string,
        error: token.error as string | undefined,
        user: {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          image: token.picture as string | null,
        },
      };
    },
  },
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
