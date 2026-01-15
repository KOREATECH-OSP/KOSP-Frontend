import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dev.api.swkoreatech.io';

// JWT에서 만료 시간 추출
function getTokenExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    return decoded.exp ? decoded.exp * 1000 : null; // milliseconds로 변환
  } catch {
    return null;
  }
}

// 토큰 갱신 함수
async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
} | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/auth/reissue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Refresh-Token': refreshToken,
      },
    });

    if (!response.ok) {
      console.error('[Auth] Failed to refresh token:', response.status);
      return null;
    }

    const tokens = await response.json();
    const accessTokenExpires = getTokenExpiry(tokens.accessToken) || Date.now() + 30 * 60 * 1000;

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpires,
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

        return {
          ...token,
          accessToken,
          refreshToken,
          accessTokenExpires,
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.image,
          error: undefined,
        };
      }

      // 토큰이 아직 유효한 경우 그대로 반환
      const accessTokenExpires = token.accessTokenExpires as number | undefined;
      if (accessTokenExpires && Date.now() < accessTokenExpires - 60 * 1000) {
        // 만료 1분 전까지는 유효
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
