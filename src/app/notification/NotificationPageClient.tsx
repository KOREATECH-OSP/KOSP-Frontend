'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Session } from 'next-auth';
import { Bell, Check, Trash2 } from 'lucide-react';

type NotificationType = 'comment' | 'team' | 'challenge' | 'system';

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

export default function NotificationPageClient({ session }: NotificationPageClientProps) {
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
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center px-4 py-20">
        <Bell className="mb-4 h-16 w-16 text-gray-300" />
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          로그인이 필요합니다
        </h2>
        <p className="mb-6 text-gray-500">
          알림을 확인하려면 로그인해주세요.
        </p>
        <Link
          href="/login"
          className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">알림</h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              읽지 않은 알림 {unreadCount}개
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            >
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">모두 읽음</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">모두 삭제</span>
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
          <Bell className="mb-4 h-12 w-12 text-gray-200" />
          <p className="text-gray-500">알림이 없습니다.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`transition-colors ${
                  notification.isRead ? 'bg-white' : 'bg-blue-50/50'
                }`}
              >
                <div className="p-4 sm:p-5">
                  <Link
                    href={notification.link}
                    className="block transition-colors hover:opacity-80"
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      {formatDate(notification.createdAt)}
                    </p>
                  </Link>
                  <div className="mt-3 flex items-center gap-2">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                      >
                        <Check className="h-3.5 w-3.5" />
                        읽음
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
