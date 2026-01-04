import { clientApiClient } from './client';
import type {
  LoginRequest,
  AuthTokenResponse,
  AuthMeResponse,
  GithubTokenRequest,
  GithubVerificationResponse,
  EmailRequest,
  EmailVerificationRequest,
  EmailVerificationResponse,
  CheckMemberIdResponse,
  ReissueRequest,
  PasswordResetRequest,
} from './types';

export async function login(data: LoginRequest): Promise<AuthTokenResponse> {
  return clientApiClient<AuthTokenResponse>('/v1/auth/login', {
    method: 'POST',
    body: data,
  });
}

export async function loginWithGithub(data: GithubTokenRequest): Promise<AuthTokenResponse> {
  return clientApiClient<AuthTokenResponse>('/v1/auth/login/github', {
    method: 'POST',
    body: data,
  });
}

export async function exchangeGithubToken(data: GithubTokenRequest): Promise<GithubVerificationResponse> {
  return clientApiClient<GithubVerificationResponse>('/v1/auth/github/exchange', {
    method: 'POST',
    body: data,
  });
}

export async function logout(): Promise<void> {
  return clientApiClient<void>('/v1/auth/logout', {
    method: 'POST',
  });
}

export async function getMyInfo(accessToken: string): Promise<AuthMeResponse> {
  return clientApiClient<AuthMeResponse>('/v1/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });
}

export async function sendVerificationEmail(data: EmailRequest): Promise<void> {
  return clientApiClient<void>('/v1/auth/verify/email', {
    method: 'POST',
    body: data,
  });
}

export async function verifyEmailCode(data: EmailVerificationRequest): Promise<EmailVerificationResponse> {
  return clientApiClient<EmailVerificationResponse>('/v1/auth/verify/email/confirm', {
    method: 'POST',
    body: data,
  });
}

export async function checkMemberId(id: string): Promise<CheckMemberIdResponse> {
  return clientApiClient<CheckMemberIdResponse>(`/v1/auth/verify/identity?id=${encodeURIComponent(id)}`);
}

export async function reissueToken(data: ReissueRequest): Promise<AuthTokenResponse> {
  return clientApiClient<AuthTokenResponse>('/v1/auth/reissue', {
    method: 'POST',
    body: data,
  });
}

export async function sendPasswordResetEmail(data: EmailRequest): Promise<void> {
  return clientApiClient<void>('/v1/auth/reset/password', {
    method: 'POST',
    body: data,
  });
}

export async function resetPassword(data: PasswordResetRequest): Promise<void> {
  return clientApiClient<void>('/v1/auth/reset/password/confirm', {
    method: 'POST',
    body: data,
  });
}

export function validateSignupTokenFormat(token: string): { valid: boolean; error?: string } {
  if (!token) {
    return { valid: false, error: '토큰이 없습니다' };
  }
  
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: '유효하지 않은 토큰 형식입니다' };
  }
  
  try {
    const payload = JSON.parse(atob(parts[1]));
    
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return { valid: false, error: 'GitHub 인증이 만료되었어요' };
    }
    
    return { valid: true };
  } catch {
    return { valid: false, error: '토큰을 파싱할 수 없습니다' };
  }
}
