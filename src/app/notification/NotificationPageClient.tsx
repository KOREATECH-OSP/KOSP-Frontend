'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { AuthSession } from '@/lib/auth/types';
import { Bell, Check, Trash2, Trophy, Award, AlertTriangle, Settings, Loader2 } from 'lucide-react';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationApi,
  deleteAllNotifications,
  getUnreadCount,
} from '@/lib/api/notification';
import type { NotificationResponse, NotificationType } from '@/lib/api/types';
import Pagination from '@/common/components/Pagination';

const PAGE_SIZE = 10;

type FilterType = '전체' | '신고' | '챌린지' | '포인트' | '시스템';

interface NotificationPageClientProps {
  session: AuthSession | null;
}

const FILTERS: { id: FilterType; label: string; types: NotificationType[] | null }[] = [
  { id: '전체', label: '전체', types: null },
  { id: '신고', label: '신고', types: ['ARTICLE_REPORTED', 'COMMENT_REPORTED'] },
  { id: '챌린지', label: '챌린지', types: ['CHALLENGE_ACHIEVED'] },
  { id: '포인트', label: '포인트', types: ['POINT_EARNED'] },
  { id: '시스템', label: '시스템', types: ['SYSTEM'] },
];

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'ARTICLE_REPORTED':
    case 'COMMENT_REPORTED':
      return <AlertTriangle className="h-4 w-4" />;
    case 'CHALLENGE_ACHIEVED':
      return <Trophy className="h-4 w-4" />;
    case 'POINT_EARNED':
      return <Award className="h-4 w-4" />;
    case 'SYSTEM':
      return <Settings className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'ARTICLE_REPORTED':
    case 'COMMENT_REPORTED':
      return 'bg-red-100 text-red-600';
    case 'CHALLENGE_ACHIEVED':
      return 'bg-amber-100 text-amber-600';
    case 'POINT_EARNED':
      return 'bg-green-100 text-green-600';
    case 'SYSTEM':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const getNotificationLink = (notification: NotificationResponse): string => {
  const { type, referenceId } = notification;
  if (!referenceId) return '#';

  switch (type) {
    case 'ARTICLE_REPORTED':
      return `/admin/reports/${referenceId}`;
    case 'COMMENT_REPORTED':
      return `/admin/reports/${referenceId}`;
    case 'CHALLENGE_ACHIEVED':
      return '/challenge';
    case 'POINT_EARNED':
      return '/user/points';
    case 'SYSTEM':
    default:
      return '#';
  }
};

export default function NotificationPageClient({ session }: NotificationPageClientProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('전체');
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // 읽지 않은 알림 수 (별도 API로 조회)
  const [unreadCount, setUnreadCount] = useState(0);

  const accessToken = session?.accessToken;

  const fetchNotifications = useCallback(async (page: number = 0) => {
    if (!accessToken) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await getNotifications({ accessToken }, page, PAGE_SIZE);
      setNotifications(response.notifications);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setCurrentPage(response.currentPage);
    } catch (err) {
      setError('알림을 불러오는데 실패했습니다.');
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  const fetchUnreadCount = useCallback(async () => {
    if (!accessToken) return;

    try {
      const response = await getUnreadCount({ accessToken });
      setUnreadCount(response.count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [accessToken]);

  useEffect(() => {
    if (session) {
      fetchNotifications(0);
      fetchUnreadCount();
    }
  }, [session, fetchNotifications, fetchUnreadCount]);

  const filteredNotifications = useMemo(() => {
    const selectedFilter = FILTERS.find(f => f.id === activeFilter);
    if (!selectedFilter?.types) return notifications;
    return notifications.filter(n => selectedFilter.types!.includes(n.type));
  }, [notifications, activeFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePageChange = (page: number) => {
    fetchNotifications(page - 1); // Pagination 컴포넌트는 1-based, API는 0-based
  };

  const markAsRead = async (id: number) => {
    if (!accessToken) return;

    setActionLoading(id);
    try {
      await markNotificationAsRead(id, { accessToken });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const markAllAsRead = async () => {
    if (!accessToken) return;

    setActionLoading(-1);
    try {
      await markAllNotificationsAsRead({ accessToken });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteNotification = async (id: number) => {
    if (!accessToken) return;

    const notification = notifications.find((n) => n.id === id);
    setActionLoading(id);
    try {
      await deleteNotificationApi(id, { accessToken });
      // 삭제 후 현재 페이지 다시 로드
      await fetchNotifications(currentPage);
      // 읽지 않은 알림이었다면 카운트 감소
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const clearAllNotifications = async () => {
    if (!accessToken) return;

    setActionLoading(-2);
    try {
      await deleteAllNotifications({ accessToken });
      setNotifications([]);
      setTotalPages(1);
      setTotalElements(0);
      setCurrentPage(0);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to delete all notifications:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (!session) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 py-20 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-8 py-16 text-center">
          <Bell className="mb-4 h-12 w-12 text-gray-300" />
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            로그인이 필요합니다
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            알림을 확인하려면 로그인해주세요.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading && notifications.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 py-20 lg:px-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="mt-4 text-sm text-gray-500">알림을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 py-20 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-300 bg-red-50/50 px-8 py-16 text-center">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-300" />
          <h2 className="mb-2 text-lg font-semibold text-gray-900">{error}</h2>
          <button
            onClick={() => fetchNotifications(0)}
            className="mt-4 inline-flex items-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Mobile Header & Tabs (< md) */}
      <div className="md:hidden">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">알림</h1>
            <p className="mt-1 text-sm text-gray-500">
              {unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}개` : '모든 알림을 확인했습니다'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={actionLoading === -1}
                className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                {actionLoading === -1 ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-1.5 h-4 w-4" />
                )}
                모두 읽음
              </button>
            )}
          </div>
        </div>

        {/* Mobile Horizontal Tabs with gradient hint */}
        <div className="relative mb-6">
          <div className="-mx-4 px-4 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`whitespace-nowrap rounded-full min-h-[44px] px-4 py-2 text-sm font-medium transition-colors touch-feedback ${activeFilter === filter.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          {/* Right gradient hint for more content */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>

      <div className="md:grid md:grid-cols-[200px_1fr] md:gap-8 lg:grid-cols-[240px_1fr] lg:gap-10">
        {/* Desktop Sidebar (>= md) */}
        <aside className="hidden md:block">
          <div className="sticky top-24 space-y-8">
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-4 px-2">알림</h2>
              <div className="space-y-1">
                {FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeFilter === filter.id
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={actionLoading === -1}
                  className="flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-800 shadow-lg shadow-gray-200 disabled:opacity-50"
                >
                  {actionLoading === -1 ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  모두 읽음 처리
                </button>
              )}
              {totalElements > 0 && (
                <button
                  onClick={clearAllNotifications}
                  disabled={actionLoading === -2}
                  className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  {actionLoading === -2 ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  모두 삭제
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="min-w-0">
          {/* Desktop Section Header */}
          <div className="mb-6 hidden md:flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              {FILTERS.find(f => f.id === activeFilter)?.label}
            </h2>
            <span className="text-sm text-gray-500">
              총 {totalElements}개의 알림
            </span>
          </div>

          {/* Loading Overlay */}
          {isLoading && notifications.length > 0 && (
            <div className="mb-4 flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">로딩 중...</span>
            </div>
          )}

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 py-20 text-center">
              <Bell className="mb-3 h-10 w-10 text-gray-300" />
              <p className="text-gray-500 font-medium">알림이 없습니다</p>
              <p className="mt-1 text-sm text-gray-400">
                새로운 알림이 도착하면 여기에 표시됩니다
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-lg border transition-colors ${notification.isRead
                        ? 'border-gray-200 bg-white'
                        : 'border-blue-200 bg-blue-50/30'
                      }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`flex-shrink-0 rounded-lg p-2 ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={getNotificationLink(notification)}
                            className="block group"
                          >
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="mt-2 text-xs text-gray-400">
                              {formatDate(notification.createdAt)}
                            </p>
                          </Link>

                          {/* Action Buttons */}
                          <div className="mt-3 flex items-center gap-2">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                disabled={actionLoading === notification.id}
                                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                              >
                                {actionLoading === notification.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                                읽음
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              disabled={actionLoading === notification.id}
                              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                            >
                              {actionLoading === notification.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                              삭제
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage + 1}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
