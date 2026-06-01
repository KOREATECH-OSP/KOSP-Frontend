export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  canAccessAdmin: boolean;
  accessTokenExpires: number;
}

export interface AuthContextValue {
  session: AuthSession | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsTermsAgreement?: boolean }>;
  loginWithGithub: (githubAccessToken: string) => Promise<{ success: boolean; error?: string; needsSignup?: boolean; needsTermsAgreement?: boolean }>;
  loginWithTokens: (accessToken: string, refreshToken: string) => Promise<{ success: boolean; error?: string }>;
  logout: (options?: { callbackUrl?: string; toastMessage?: string }) => Promise<void>;
  updateSession: (session: Partial<AuthSession>) => void;
}

export interface TokenPayload {
  exp?: number | string;
  iat?: number | string;
  canAccessAdmin?: boolean;
  sub?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  needsTermsAgreement?: boolean;
}

export interface UserInfoResponse {
  id: number;
  email: string;
  name: string;
  profileImage?: string | null;
}
