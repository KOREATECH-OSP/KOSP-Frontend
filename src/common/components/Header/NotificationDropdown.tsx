'use client';

import { Fragment, useState, useEffect, useCallback } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Bell, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/AuthContext';
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/api/notification';
import type { NotificationResponse } from '@/lib/api/types';

interface NotificationDropdownProps {
  /** true이면 드롭다운 대신 알림 페이지로 이동하는 링크로 동작 */
  linkMode?: boolean;
}

function getNotificationLink(notification: NotificationResponse): string {
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

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  return date.toLocaleDateString('ko-KR');
}

export default function NotificationDropdown({ linkMode = false }: NotificationDropdownProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const res = await getUnreadCount({ accessToken: session.accessToken });
      setUnreadCount(res.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [session?.accessToken]);

  const fetchNotifications = useCallback(async () => {
    if (!session?.accessToken) return;
    setIsLoading(true);
    try {
      const res = await getNotifications({ accessToken: session.accessToken }, 0, 10);
      setNotifications(res.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // SSE 알림 이벤트 리스너 (실시간 동기화)
  useEffect(() => {
    const handleSSENotification = (event: Event) => {
      const customEvent = event as CustomEvent<{ notification: NotificationResponse }>;
      const { notification } = customEvent.detail;
      // 읽지 않은 알림인 경우에만 카운트 증가
      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    window.addEventListener('sse:notification', handleSSENotification);
    return () => window.removeEventListener('sse:notification', handleSSENotification);
  }, []);

  const handleOpen = () => {
    fetchNotifications();
  };

  const handleNotificationClick = async (notification: NotificationResponse) => {
    if (!notification.isRead && session?.accessToken) {
      try {
        await markNotificationAsRead(notification.id, { accessToken: session.accessToken });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
    router.push(getNotificationLink(notification));
  };

  const handleMarkAllAsRead = async () => {
    if (!session?.accessToken) return;
    try {
      await markAllNotificationsAsRead({ accessToken: session.accessToken });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // 링크 모드: 클릭 시 알림 페이지로 이동 (모바일용)
  if (linkMode) {
    return (
      <Link
        href="/notification"
        className="relative flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        aria-label="알림"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>
    );
  }

  // 드롭다운 모드: 드롭다운으로 알림 표시 (데스크톱용)
  return (
    <Menu as="div" className="relative">
      {({ open }) => (
        <>
          <Menu.Button
            onClick={handleOpen}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none"
            aria-label="알림"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">알림</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      모두 읽음
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <Bell className="w-8 h-8 mb-2" />
                    <p className="text-sm">알림이 없습니다</p>
                  </div>
                ) : (
                  <div className="py-1">
                    {notifications.map((notification) => (
                      <Menu.Item key={notification.id}>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={() => handleNotificationClick(notification)}
                            className={`w-full text-left px-4 py-3 transition-colors ${
                              active ? 'bg-gray-50' : ''
                            } ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                  notification.isRead ? 'bg-transparent' : 'bg-blue-500'
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm truncate ${
                                    notification.isRead
                                      ? 'text-gray-600'
                                      : 'text-gray-900 font-medium'
                                  }`}
                                >
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatTimeAgo(notification.createdAt)}
                                </p>
                              </div>
                            </div>
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() => router.push('/notification')}
                      className={`w-full text-center py-3 text-sm font-medium text-gray-600 transition-colors ${
                        active ? 'bg-gray-50 text-gray-900' : ''
                      }`}
                    >
                      전체 알림 보기
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}
