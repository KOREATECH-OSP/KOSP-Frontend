import { clientApiClient } from './client';
import type {
  NotificationListResponse,
  UnreadCountResponse,
} from './types';

interface AuthOptions {
  accessToken?: string;
}

/**
 * 알림 목록 조회 (페이지네이션)
 */
export async function getNotifications(
  auth: AuthOptions,
  page: number = 0,
  size: number = 20
): Promise<NotificationListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  return clientApiClient<NotificationListResponse>(
    `/v1/notifications?${params.toString()}`,
    {
      method: 'GET',
      accessToken: auth.accessToken,
    }
  );
}

/**
 * 읽지 않은 알림 수 조회
 */
export async function getUnreadCount(
  auth: AuthOptions
): Promise<UnreadCountResponse> {
  return clientApiClient<UnreadCountResponse>('/v1/notifications/unread-count', {
    method: 'GET',
    accessToken: auth.accessToken,
  });
}

/**
 * 특정 알림 읽음 처리
 */
export async function markNotificationAsRead(
  notificationId: number,
  auth: AuthOptions
): Promise<void> {
  return clientApiClient<void>(
    `/v1/notifications/${notificationId}/read`,
    {
      method: 'POST',
      accessToken: auth.accessToken,
    }
  );
}

/**
 * 모든 알림 읽음 처리
 */
export async function markAllNotificationsAsRead(
  auth: AuthOptions
): Promise<void> {
  return clientApiClient<void>('/v1/notifications/read-all', {
    method: 'POST',
    accessToken: auth.accessToken,
  });
}

/**
 * 특정 알림 삭제
 */
export async function deleteNotification(
  notificationId: number,
  auth: AuthOptions
): Promise<void> {
  return clientApiClient<void>(`/v1/notifications/${notificationId}`, {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}

/**
 * 모든 알림 삭제
 */
export async function deleteAllNotifications(
  auth: AuthOptions
): Promise<void> {
  return clientApiClient<void>('/v1/notifications', {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}
