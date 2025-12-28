import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import type { OIDCConfig } from 'next-auth/providers';

type AuthentikProfile = {
  sub: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  groups?: string[];
};

const authentikConfig: OIDCConfig<AuthentikProfile> = {
  id: 'authentik',
  name: 'Authentik',
  type: 'oidc',
  issuer: process.env.AUTHENTIK_ISSUER,
  clientId: process.env.AUTHENTIK_CLIENT_ID!,
  clientSecret: process.env.AUTHENTIK_CLIENT_SECRET!,
  authorization: {
    url: 'https://auth.swkoreatech.io/application/o/authorize/',
    params: {
      scope: 'openid profile email',
      prompt: 'select_account',
    },
  },
  token: 'https://auth.swkoreatech.io/application/o/token/',
  userinfo: 'https://auth.swkoreatech.io/application/o/userinfo/',
  // Authentik uses HS256 for ID token signing
  idToken: true,
  checks: ['state'],
  client: {
    id_token_signed_response_alg: 'HS256',
  },
};

export const authConfig: NextAuthConfig = {
  providers: [authentikConfig],
  callbacks: {
    async jwt({ token, account, profile }) {
      // 최초 로그인 시 토큰에 정보 저장
      if (account && profile) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        token.expiresAt = account.expires_at;
        token.sub = profile.sub ?? undefined;
        token.email = (profile.email as string) ?? undefined;
        token.name = (profile.name as string) ?? undefined;
        token.preferred_username = (profile.preferred_username as string) ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      // 세션에 토큰 정보 전달
      session.user = {
        ...session.user,
        id: token.sub as string,
        email: token.email as string,
        name: token.name as string,
        username: token.preferred_username as string | undefined,
      };
      session.accessToken = token.accessToken as string | undefined;
      session.idToken = token.idToken as string | undefined;
      return session;
    },
  },
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
