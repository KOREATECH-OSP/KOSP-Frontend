import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dev.api.swkoreatech.io';

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
      if (user) {
        token.accessToken = (user as { accessToken: string }).accessToken;
        token.refreshToken = (user as { refreshToken: string }).refreshToken;
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken as string,
        refreshToken: token.refreshToken as string,
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
