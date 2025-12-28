import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      username?: string;
    };
    accessToken?: string;
    idToken?: string;
  }

  interface Profile {
    sub: string;
    email?: string;
    name?: string;
    preferred_username?: string;
    groups?: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    expiresAt?: number;
    sub?: string;
    email?: string;
    name?: string;
    preferred_username?: string;
  }
}
