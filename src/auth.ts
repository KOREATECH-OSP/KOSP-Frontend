import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dev.api.swkoreatech.io';

type JwtPayload = {
  exp?: number | string;
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

function getCanAccessAdmin(token: string): boolean {
  const payload = decodeJwtPayload(token);
  return payload?.canAccessAdmin === true;
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
          canAccessAdmin: getCanAccessAdmin(accessToken),
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.image,
        };
      }

      // next-auth는 세션 관리만 담당, 토큰 갱신은 API 클라이언트에서 처리
      // 토큰을 그대로 반환
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken as string,
        refreshToken: token.refreshToken as string,
        canAccessAdmin: (token.canAccessAdmin as boolean) ?? false,
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
