import 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    refreshToken: string;
    error?: string;
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
  }
}
