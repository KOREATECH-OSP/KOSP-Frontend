import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';

// Authentik 연동 제거됨 - 새로운 인증 플로우 구현 예정
export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
