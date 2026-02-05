'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSession } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import { API_BASE_URL } from '@/lib/api/config';
import type { NotificationResponse, NotificationType } from '@/lib/api/types';
import { Bell, Trophy, Award, AlertTriangle, Settings } from 'lucide-react';
import { tokenManager } from '@/lib/auth/token-manager';
import { signOutOnce } from '@/lib/auth/signout';
import { fetchEventSource } from '@microsoft/fetch-event-source';

const SSE_ENDPOINT = `${API_BASE_URL}/v1/notifications/subscribe`;
const RECONNECT_DELAY = 5000;
const HEARTBEAT_TIMEOUT = 60000; // 60초

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'ARTICLE_REPORTED':
    case 'COMMENT_REPORTED':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'CHALLENGE_ACHIEVED':
      return <Trophy className="h-4 w-4 text-amber-500" />;
    case 'POINT_EARNED':
      return <Award className="h-4 w-4 text-green-500" />;
    case 'SYSTEM':
      return <Settings className="h-4 w-4 text-gray-500" />;
    default:
      return <Bell className="h-4 w-4 text-blue-500" />;
  }
}

function getNotificationLink(notification: NotificationResponse): string | undefined {
  const { type, referenceId } = notification;
  if (!referenceId) return '/notification';

  switch (type) {
    case 'ARTICLE_REPORTED':
    case 'COMMENT_REPORTED':
      return `/admin/reports/${referenceId}`;
    case 'CHALLENGE_ACHIEVED':
      return '/challenge';
    case 'POINT_EARNED':
      return '/user/points';
    default:
      return '/notification';
  }
}

// fetchEventSource의 onerror에서 재연결을 중단하기 위한 커스텀 에러
class FatalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FatalError';
  }
}

export default function NotificationSSEProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);
  const isRefreshingTokenRef = useRef(false);
  const isLoggingOutRef = useRef(false);
  const shouldReconnectRef = useRef(true);
  const lastHeartbeatRef = useRef<number>(Date.now());
  const accessTokenRef = useRef<string | null>(null);

  const showNotificationToast = useCallback((notification: NotificationResponse) => {
    const link = getNotificationLink(notification);

    toast.info(notification.message, {
      icon: getNotificationIcon(notification.type),
      duration: 5000,
      action: link ? {
        label: '확인',
        onClick: () => router.push(link),
      } : undefined,
    });
  }, [router]);

  const connectSSE = useCallback(async (accessToken: string) => {
    if (isConnectingRef.current || isLoggingOutRef.current) return;
    isConnectingRef.current = true;

    // 기존 연결 정리
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await fetchEventSource(SSE_ENDPOINT, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
        openWhenHidden: false, // 탭 숨겨지면 연결 종료

        async onopen(response) {
          if (response.ok) {
            console.log('[SSE] Connected to notification stream');
            lastHeartbeatRef.current = Date.now();
            isConnectingRef.current = false;
            return;
          }

          // 401/403: 토큰 만료 또는 권한 없음
          if (response.status === 401 || response.status === 403) {
            console.log('[SSE] Unauthorized, attempting token refresh...');

            if (isRefreshingTokenRef.current) {
              console.log('[SSE] Token refresh already in progress');
              throw new FatalError('Token refresh in progress');
            }

            isRefreshingTokenRef.current = true;

            try {
              const newAccessToken = await tokenManager.refreshTokens();

              if (newAccessToken) {
                console.log('[SSE] Token refreshed, will reconnect...');
                isRefreshingTokenRef.current = false;
                accessTokenRef.current = newAccessToken;

                // 새 토큰으로 재연결 예약
                setTimeout(() => {
                  if (!isLoggingOutRef.current) {
                    isConnectingRef.current = false;
                    connectSSE(newAccessToken);
                  }
                }, 100);

                throw new FatalError('Reconnecting with new token');
              } else {
                isRefreshingTokenRef.current = false;
                isLoggingOutRef.current = true;
                signOutOnce({
                  callbackUrl: '/login',
                  toastMessage: '인증 정보가 만료되었습니다. 다시 로그인해주세요.',
                });
                throw new FatalError('Token refresh failed');
              }
            } catch (refreshError) {
              if (refreshError instanceof FatalError) throw refreshError;

              console.error('[SSE] Token refresh error:', refreshError);
              isRefreshingTokenRef.current = false;
              isLoggingOutRef.current = true;
              signOutOnce({
                callbackUrl: '/login',
                toastMessage: '인증 정보가 만료되었습니다. 다시 로그인해주세요.',
              });
              throw new FatalError('Token refresh error');
            }
          }

          throw new Error(`SSE connection failed: ${response.status}`);
        },

        onmessage(event) {
          // Heartbeat 처리
          const isHeartbeat =
            event.event === 'heartbeat' ||
            event.data === 'heartbeat' ||
            event.data === '' ||
            event.data?.trim() === '';

          if (isHeartbeat) {
            lastHeartbeatRef.current = Date.now();
            return;
          }

          // 알림 처리
          if (event.data && (event.event === 'notification' || !event.event)) {
            try {
              const trimmedData = event.data.trim();
              if (!trimmedData.startsWith('{') || !trimmedData.endsWith('}')) {
                console.warn('[SSE] Invalid JSON format, skipping:', trimmedData.slice(0, 100));
                return;
              }

              const notification = JSON.parse(trimmedData) as NotificationResponse;

              if (notification.id && notification.message && notification.type) {
                showNotificationToast(notification);
                window.dispatchEvent(new CustomEvent('sse:notification', {
                  detail: { notification }
                }));
              }
            } catch (e) {
              if (e instanceof SyntaxError) {
                console.warn('[SSE] JSON parse error:', e.message, 'Data:', event.data?.slice(0, 100));
              } else {
                console.error('[SSE] Error processing event:', e);
              }
            }
          }
        },

        onclose() {
          console.log('[SSE] Connection closed');
          isConnectingRef.current = false;

          // 재연결 스케줄링
          if (shouldReconnectRef.current && !isLoggingOutRef.current) {
            const latestToken = accessTokenRef.current;
            if (latestToken) {
              console.log(`[SSE] Reconnecting in ${RECONNECT_DELAY}ms...`);
              reconnectTimeoutRef.current = setTimeout(() => {
                if (!isLoggingOutRef.current && accessTokenRef.current) {
                  connectSSE(accessTokenRef.current);
                }
              }, RECONNECT_DELAY);
            }
          }
        },

        onerror(err) {
          isConnectingRef.current = false;

          // FatalError: 재연결하지 않음
          if (err instanceof FatalError) {
            console.log('[SSE] Fatal error, not reconnecting:', err.message);
            throw err; // 라이브러리에서 재연결 중단
          }

          // AbortError: 의도적 종료
          if (err instanceof Error && err.name === 'AbortError') {
            console.log('[SSE] Connection aborted');
            throw err;
          }

          console.error('[SSE] Connection error:', err);

          // 로그아웃 중이면 재연결하지 않음
          if (isLoggingOutRef.current) {
            throw new FatalError('Logging out');
          }

          // 기본 에러: 라이브러리가 자동 재연결 시도
          // 반환하면 재연결, throw하면 중단
        },
      });
    } catch (error) {
      isConnectingRef.current = false;

      if (error instanceof FatalError) {
        return; // 의도적 중단
      }

      if (error instanceof Error && error.name === 'AbortError') {
        return; // 의도적 종료
      }

      console.error('[SSE] Unexpected error:', error);
    }
  }, [showNotificationToast]);

  // accessTokenRef 동기화
  useEffect(() => {
    accessTokenRef.current = session?.accessToken ?? null;
  }, [session?.accessToken]);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      shouldReconnectRef.current = true;
      connectSSE(session.accessToken);
    }

    return () => {
      shouldReconnectRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [status, session?.accessToken, connectSSE]);

  // 탭 포커스 시 재연결
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && session?.accessToken && !isConnectingRef.current) {
        shouldReconnectRef.current = false;
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        shouldReconnectRef.current = true;
        connectSSE(session.accessToken);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session?.accessToken, connectSSE]);

  // Heartbeat 타임아웃 체크 (10초마다)
  useEffect(() => {
    if (status !== 'authenticated') return;

    const interval = setInterval(() => {
      if (isRefreshingTokenRef.current || isConnectingRef.current) {
        return;
      }
      if (Date.now() - lastHeartbeatRef.current > HEARTBEAT_TIMEOUT) {
        console.warn('[SSE] Heartbeat timeout, reconnecting...');
        shouldReconnectRef.current = true;
        abortControllerRef.current?.abort();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [status]);

  return <>{children}</>;
}
