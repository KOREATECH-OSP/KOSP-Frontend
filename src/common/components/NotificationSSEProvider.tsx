'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSession } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import { API_BASE_URL } from '@/lib/api/config';
import type { NotificationResponse, NotificationType } from '@/lib/api/types';
import { Bell, Trophy, Award, AlertTriangle, Settings } from 'lucide-react';

const SSE_ENDPOINT = `${API_BASE_URL}/v1/notifications/subscribe`;
const RECONNECT_DELAY = 5000;

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

function parseSSEEvents(chunk: string): SSEEvent[] {
  const events: SSEEvent[] = [];
  const lines = chunk.split('\n');
  let currentEvent: SSEEvent = {};

  for (const line of lines) {
    if (line.startsWith('id:')) {
      currentEvent.id = line.slice(3).trim();
    } else if (line.startsWith('event:')) {
      currentEvent.event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      currentEvent.data = line.slice(5).trim();
    } else if (line === '' && (currentEvent.data || currentEvent.event)) {
      events.push(currentEvent);
      currentEvent = {};
    }
  }

  return events;
}

export default function NotificationSSEProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);

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
        throw new Error(`SSE connection failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      console.log('[SSE] Connected to notification stream');

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('[SSE] Stream ended');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const events = parseSSEEvents(buffer);

        // 처리된 이벤트 이후의 버퍼만 유지
        const lastNewline = buffer.lastIndexOf('\n\n');
        if (lastNewline !== -1) {
          buffer = buffer.slice(lastNewline + 2);
        }

        for (const event of events) {
          if (event.event === 'notification' && event.data) {
            try {
              const notification = JSON.parse(event.data) as NotificationResponse;
              showNotificationToast(notification);
            } catch (e) {
              console.error('[SSE] Failed to parse notification:', e);
            }
          } else if (event.event === 'heartbeat' || event.data === 'heartbeat') {
            // 하트비트는 무시
            console.log('[SSE] Heartbeat received');
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

      // 재연결 시도 (세션이 유효한 경우)
      if (!controller.signal.aborted && session?.accessToken) {
        console.log(`[SSE] Reconnecting in ${RECONNECT_DELAY}ms...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectSSE(session.accessToken);
        }, RECONNECT_DELAY);
      }
    }
  }, [session?.accessToken, showNotificationToast]);

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

  return <>{children}</>;
}
