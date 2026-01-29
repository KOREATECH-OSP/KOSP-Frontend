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

const SSE_ENDPOINT = `${API_BASE_URL}/v1/notifications/subscribe`;
const RECONNECT_DELAY = 5000;
const MAX_BUFFER_SIZE = 1024 * 1024; // 1MB
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

interface SSEEvent {
  id?: string;
  event?: string;
  data?: string;
}

interface ParseSSEResult {
  events: SSEEvent[];
  remainder: string;
}

function parseSSEEvents(chunk: string): ParseSSEResult {
  // 완전한 이벤트만 파싱하고 불완전한 부분은 remainder로 반환
  const lastEventEnd = chunk.lastIndexOf('\n\n');
  if (lastEventEnd === -1) {
    return { events: [], remainder: chunk };
  }

  const completePart = chunk.slice(0, lastEventEnd + 2);
  const remainder = chunk.slice(lastEventEnd + 2);

  const events: SSEEvent[] = [];
  const lines = completePart.split('\n');
  let currentEvent: SSEEvent = {};
  let dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith(':')) {
      // 주석 무시
      continue;
    } else if (line.startsWith('id:')) {
      // SSE 스펙: 콜론 뒤 첫 공백 1개만 제거
      currentEvent.id = line.slice(3).replace(/^ /, '');
    } else if (line.startsWith('event:')) {
      currentEvent.event = line.slice(6).replace(/^ /, '');
    } else if (line.startsWith('data:')) {
      // SSE 스펙: 콜론 뒤 첫 공백 1개만 제거, 멀티라인 지원
      dataLines.push(line.slice(5).replace(/^ /, ''));
    } else if (line === '') {
      // 빈 줄 = 이벤트 종료
      if (dataLines.length > 0 || currentEvent.event) {
        currentEvent.data = dataLines.join('\n');
        events.push(currentEvent);
      }
      currentEvent = {};
      dataLines = [];
    }
  }

  return { events, remainder };
}

export default function NotificationSSEProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);
  const isRefreshingTokenRef = useRef(false);
  const isLoggingOutRef = useRef(false); // 로그아웃 중 재연결 방지
  const lastHeartbeatRef = useRef<number>(Date.now());
  const accessTokenRef = useRef<string | null>(null); // 최신 토큰 참조용

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
    if (isConnectingRef.current) return;
    isConnectingRef.current = true;

    // 기존 연결 정리
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(SSE_ENDPOINT, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        // 401/403 에러: 토큰 만료 또는 권한 없음
        if (response.status === 401 || response.status === 403) {
          console.log('[SSE] Unauthorized, attempting token refresh...');

          // 이미 토큰 갱신 중이면 중복 요청 방지
          if (isRefreshingTokenRef.current) {
            console.log('[SSE] Token refresh already in progress');
            return;
          }

          isRefreshingTokenRef.current = true;

          try {
            const newAccessToken = await tokenManager.refreshTokens();

            if (newAccessToken) {
              console.log('[SSE] Token refreshed, reconnecting...');
              isRefreshingTokenRef.current = false;
              isConnectingRef.current = false;

              // 새 토큰으로 재연결 (약간의 딜레이 후)
              setTimeout(() => {
                if (!isLoggingOutRef.current) {
                  connectSSE(newAccessToken);
                }
              }, 100);
              return;
            } else {
              // 토큰 갱신 실패 - 로그아웃 처리
              console.log('[SSE] Token refresh failed, signing out...');
              isRefreshingTokenRef.current = false;
              isLoggingOutRef.current = true; // 재연결 방지
              signOutOnce({
                callbackUrl: '/login',
                toastMessage: '인증 정보가 만료되었습니다. 다시 로그인해주세요.',
              });
              return;
            }
          } catch (refreshError) {
            console.error('[SSE] Token refresh error:', refreshError);
            isRefreshingTokenRef.current = false;
            isLoggingOutRef.current = true; // 재연결 방지
            signOutOnce({
              callbackUrl: '/login',
              toastMessage: '인증 정보가 만료되었습니다. 다시 로그인해주세요.',
            });
            return;
          }
        }

        throw new Error(`SSE connection failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      console.log('[SSE] Connected to notification stream');
      lastHeartbeatRef.current = Date.now();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('[SSE] Stream ended');
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // 버퍼 오버플로우 방지
        if (buffer.length > MAX_BUFFER_SIZE) {
          console.error('[SSE] Buffer overflow, reconnecting...');
          break;
        }

        const { events, remainder } = parseSSEEvents(buffer);
        buffer = remainder;

        for (const event of events) {
          try {
            // Heartbeat 처리 (JSON 파싱 전에 먼저 체크)
            // 다양한 heartbeat 형식 지원: event 타입, data 내용, 빈 data
            const isHeartbeat =
              event.event === 'heartbeat' ||
              event.data === 'heartbeat' ||
              event.data === '' ||
              event.data?.trim() === '';

            if (isHeartbeat) {
              lastHeartbeatRef.current = Date.now();
              continue;
            }

            // SSE 이벤트 처리: event 필드가 없거나 'notification'인 경우 모두 처리
            if (event.data && (event.event === 'notification' || !event.event)) {
              // JSON 파싱 전 기본 유효성 검사
              const trimmedData = event.data.trim();
              if (!trimmedData.startsWith('{') || !trimmedData.endsWith('}')) {
                console.warn('[SSE] Invalid JSON format, skipping:', trimmedData.slice(0, 100));
                continue;
              }

              const notification = JSON.parse(trimmedData) as NotificationResponse;
              // NotificationResponse 타입 검증
              if (notification.id && notification.message && notification.type) {
                showNotificationToast(notification);
                // 전역 이벤트 발생 (NotificationDropdown 동기화용)
                window.dispatchEvent(new CustomEvent('sse:notification', {
                  detail: { notification }
                }));
              }
            }
          } catch (e) {
            // JSON 파싱 실패 시 상세 로그
            if (e instanceof SyntaxError) {
              console.warn('[SSE] JSON parse error:', e.message, 'Data:', event.data?.slice(0, 100));
            } else {
              console.error('[SSE] Error processing event:', e);
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[SSE] Connection aborted');
        return;
      }
      console.error('[SSE] Connection error:', error);
    } finally {
      isConnectingRef.current = false;

      // 재연결 시도 (토큰이 유효하고 로그아웃 중이 아닌 경우)
      // accessTokenRef를 사용하여 항상 최신 토큰 참조
      const currentToken = accessTokenRef.current;
      if (!controller.signal.aborted && currentToken && !isLoggingOutRef.current) {
        console.log(`[SSE] Reconnecting in ${RECONNECT_DELAY}ms...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          const latestToken = accessTokenRef.current;
          if (!isLoggingOutRef.current && latestToken) {
            connectSSE(latestToken);
          }
        }, RECONNECT_DELAY);
      }
    }
  }, [showNotificationToast]);

  // accessTokenRef 동기화
  useEffect(() => {
    accessTokenRef.current = session?.accessToken ?? null;
  }, [session?.accessToken]);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      connectSSE(session.accessToken);
    }

    return () => {
      // 정리
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
        // 기존 연결 끊고 재연결
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
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
      // 토큰 갱신 중이거나 연결 시도 중이면 체크 스킵
      if (isRefreshingTokenRef.current || isConnectingRef.current) {
        return;
      }
      if (Date.now() - lastHeartbeatRef.current > HEARTBEAT_TIMEOUT) {
        console.warn('[SSE] Heartbeat timeout, reconnecting...');
        abortControllerRef.current?.abort();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [status]);

  return <>{children}</>;
}
