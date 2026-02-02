'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import type { AuthSession, AuthContextValue } from './types';

const REFRESH_BUFFER_MS = 2 * 60 * 1000; // 만료 2분 전부터 선제적 갱신
const SIGN_OUT_DEDUPE_MS = 3000;

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  initialSession?: AuthSession | null;
}

export function AuthProvider({ children, initialSession = null }: AuthProviderProps) {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(initialSession);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>(
    initialSession ? 'authenticated' : 'loading'
  );

  const refreshPromiseRef = useRef<Promise<AuthSession | null> | null>(null);
  const lastSignOutRef = useRef<number>(0);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 세션 API 호출로 현재 세션 가져오기
  const fetchSession = useCallback(async (): Promise<AuthSession | null> => {
    try {
      const res = await fetch('/api/auth/session', { credentials: 'include' });
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      return data.session || null;
    } catch {
      return null;
    }
  }, []);

  // 토큰 갱신
  const refreshTokens = useCallback(async (): Promise<AuthSession | null> => {
    // 이미 갱신 중이면 기존 Promise 대기
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    refreshPromiseRef.current = (async () => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (!res.ok) {
          return null;
        }

        const data = await res.json();
        return data.session || null;
      } catch {
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, []);

  // 로그인
  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: 'credentials', email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || '로그인에 실패했습니다' };
      }

      setSession(data.session);
      setStatus('authenticated');

      // tokenManager 이벤트 발생
      window.dispatchEvent(new CustomEvent('sessionChanged', { detail: data.session }));

      return { success: true };
    } catch {
      return { success: false, error: '로그인에 실패했습니다' };
    }
  }, []);

  // GitHub 로그인
  const loginWithGithub = useCallback(async (githubAccessToken: string) => {
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: 'github', githubAccessToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: data.error || '로그인에 실패했습니다',
          needsSignup: data.needsSignup || false,
        };
      }

      setSession(data.session);
      setStatus('authenticated');

      window.dispatchEvent(new CustomEvent('sessionChanged', { detail: data.session }));

      return { success: true };
    } catch {
      return { success: false, error: '로그인에 실패했습니다' };
    }
  }, []);

  // 토큰으로 로그인 (회원가입 후)
  const loginWithTokens = useCallback(async (accessToken: string, refreshToken: string) => {
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: 'tokens', accessToken, refreshToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || '세션 생성에 실패했습니다' };
      }

      setSession(data.session);
      setStatus('authenticated');

      window.dispatchEvent(new CustomEvent('sessionChanged', { detail: data.session }));

      return { success: true };
    } catch {
      return { success: false, error: '세션 생성에 실패했습니다' };
    }
  }, []);

  // 로그아웃
  const logout = useCallback(async (options: { callbackUrl?: string; toastMessage?: string } = {}) => {
    const { callbackUrl = '/login', toastMessage } = options;
    const now = Date.now();

    // 중복 로그아웃 방지
    if (now - lastSignOutRef.current < SIGN_OUT_DEDUPE_MS) {
      return;
    }
    lastSignOutRef.current = now;

    if (toastMessage) {
      toast.error(toastMessage);
    }

    try {
      await fetch('/api/auth/session', {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch {
      // 실패해도 클라이언트 로그아웃 진행
    }

    setSession(null);
    setStatus('unauthenticated');

    window.dispatchEvent(new CustomEvent('sessionChanged', { detail: null }));

    router.push(callbackUrl);
  }, [router]);

  // 세션 업데이트
  const updateSession = useCallback((updates: Partial<AuthSession>) => {
    setSession((prev) => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  }, []);

  // 초기 세션 로드
  useEffect(() => {
    if (initialSession) {
      setSession(initialSession);
      setStatus('authenticated');
      return;
    }

    fetchSession().then((sess) => {
      setSession(sess);
      setStatus(sess ? 'authenticated' : 'unauthenticated');
    });
  }, [initialSession, fetchSession]);

  // 선제적 토큰 갱신
  useEffect(() => {
    if (!session) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }

    const checkAndRefresh = async () => {
      if (!session) return;

      const now = Date.now();
      const expiresAt = session.accessTokenExpires;

      // 만료 2분 전이면 갱신
      if (now >= expiresAt - REFRESH_BUFFER_MS) {
        const newSession = await refreshTokens();
        if (newSession) {
          setSession(newSession);
          window.dispatchEvent(new CustomEvent('tokenRefreshed', { detail: newSession }));
        } else {
          // 갱신 실패 시 로그아웃
          await logout({
            callbackUrl: '/login',
            toastMessage: '인증 정보가 만료되었습니다. 다시 로그인해주세요.',
          });
        }
      }
    };

    // 1분마다 체크
    refreshIntervalRef.current = setInterval(checkAndRefresh, 60 * 1000);

    // 초기 체크
    checkAndRefresh();

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [session?.accessTokenExpires, refreshTokens, logout]);

  // 창 포커스 시 세션 확인
  useEffect(() => {
    const handleFocus = () => {
      if (status === 'authenticated') {
        fetchSession().then((sess) => {
          if (!sess) {
            setStatus('unauthenticated');
            setSession(null);
          } else {
            setSession(sess);
          }
        });
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [status, fetchSession]);

  const value: AuthContextValue = {
    session,
    status,
    login,
    loginWithGithub,
    loginWithTokens,
    logout,
    updateSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * 인증 컨텍스트 훅
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * NextAuth의 useSession 호환 훅
 */
export function useSession() {
  const { session, status } = useAuth();

  return {
    data: session,
    status,
    update: async () => {
      // 세션 새로고침
      const res = await fetch('/api/auth/session', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        return data.session;
      }
      return null;
    },
  };
}
