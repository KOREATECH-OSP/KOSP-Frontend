'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Session } from 'next-auth';
import { Bell, Check, Trash2, MessageSquare, Users, Trophy, Settings } from 'lucide-react';

type NotificationType = 'comment' | 'team' | 'challenge' | 'system';
type FilterType = '전체' | '댓글' | '팀' | '챌린지' | '시스템';

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationPageClientProps {
  session: Session | null;
}

const FILTERS: { id: FilterType; label: string; type: NotificationType | null }[] = [
  { id: '전체', label: '전체', type: null },
  { id: '댓글', label: '댓글', type: 'comment' },
  { id: '팀', label: '팀', type: 'team' },
  { id: '챌린지', label: '챌린지', type: 'challenge' },
  { id: '시스템', label: '시스템', type: 'system' },
];

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'comment':
      return <MessageSquare className="h-4 w-4" />;
    case 'team':
      return <Users className="h-4 w-4" />;
    case 'challenge':
      return <Trophy className="h-4 w-4" />;
    case 'system':
      return <Settings className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'comment':
      return 'bg-blue-100 text-blue-600';
    case 'team':
      return 'bg-green-100 text-green-600';
    case 'challenge':
      return 'bg-amber-100 text-amber-600';
    case 'system':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export default function NotificationPageClient({ session }: NotificationPageClientProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('전체');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'comment',
      title: '새로운 댓글',
      message: '김철수님이 회원님의 글에 댓글을 남겼습니다.',
      link: '/community/1',
      isRead: false,
      createdAt: '2024-11-28T10:30:00',
    },
    {
      id: 2,
      type: 'team',
      title: '팀 가입 승인',
      message: 'KOSP 개발팀에 가입이 승인되었습니다.',
      link: '/team/1',
      isRead: false,
      createdAt: '2024-11-27T15:20:00',
    },
    {
      id: 3,
      type: 'challenge',
      title: '챌린지 달성',
      message: "'첫 번째 PR' 챌린지를 달성했습니다!",
      link: '/challenge',
      isRead: true,
      createdAt: '2024-11-25T14:00:00',
    },
    {
      id: 4,
      type: 'system',
      title: '시스템 공지',
      message: '서비스 점검 안내: 12월 1일 02:00 ~ 06:00',
      link: '#',
      isRead: true,
      createdAt: '2024-11-24T12:00:00',
    },
  ]);

  const filteredNotifications = useMemo(() => {
    const selectedFilter = FILTERS.find(f => f.id === activeFilter);
    if (!selectedFilter?.type) return notifications;
    return notifications.filter(n => n.type === selectedFilter.type);
  }, [notifications, activeFilter]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
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

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Mobile Header & Tabs (< lg) */}
      <div className="lg:hidden">
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
                className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                <Check className="mr-1.5 h-4 w-4" />
                모두 읽음
              </button>
            )}
          </div>
        </div>

        {/* Mobile Horizontal Tabs */}
        <div className="mb-6 -mx-4 px-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${activeFilter === filter.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
        {/* Desktop Sidebar (>= lg) */}
        <aside className="hidden lg:block">
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
                  className="flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-800 shadow-lg shadow-gray-200"
                >
                  <Check className="mr-2 h-4 w-4" />
                  모두 읽음 처리
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  모두 삭제
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="min-w-0">
          {/* Desktop Section Header */}
          <div className="mb-6 hidden lg:flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              {FILTERS.find(f => f.id === activeFilter)?.label}
            </h2>
            <span className="text-sm text-gray-500">
              총 {filteredNotifications.length}개의 알림
            </span>
          </div>

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
                          href={notification.link}
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
                              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                            >
                              <Check className="h-3.5 w-3.5" />
                              읽음
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
