import { clientApiClient } from './client';
import type { FollowUserResponse, FollowUserListResponse, FollowSummaryResponse } from './types';

interface AuthOptions {
  accessToken: string;
}

/** 대상 사용자 팔로우 */
export async function followUser(userId: number, auth: AuthOptions): Promise<void> {
  await clientApiClient<void>(`/v1/users/${userId}/follow`, {
    method: 'POST',
    accessToken: auth.accessToken,
  });
}

/** 대상 사용자 언팔로우 */
export async function unfollowUser(userId: number, auth: AuthOptions): Promise<void> {
  await clientApiClient<void>(`/v1/users/${userId}/follow`, {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}

/** 빈 팔로우 페이지. 조회 실패 시 호출부가 기본값으로 사용한다. */
export function emptyFollowPage(): FollowUserListResponse {
  return { users: [], meta: { currentPage: 0, totalPages: 0, totalItems: 0 } };
}

/**
 * 팔로우 목록 응답을 항상 `{ users, meta }` 형태로 맞춘다.
 * - 페이지네이션 이전 백엔드는 전체 목록을 배열로 반환하므로, 클라이언트에서 해당 페이지만 잘라낸다.
 * - users가 없거나 배열이 아니면 빈 배열, meta가 없으면 0으로 채운다.
 */
function toFollowPage(raw: unknown, page: number, size: number): FollowUserListResponse {
  if (Array.isArray(raw)) {
    const all = raw as FollowUserResponse[];
    return {
      users: all.slice(page * size, (page + 1) * size),
      meta: { currentPage: page, totalPages: Math.ceil(all.length / size), totalItems: all.length },
    };
  }
  const body = (raw ?? {}) as Partial<FollowUserListResponse>;
  const users = Array.isArray(body.users) ? body.users : [];
  const meta = body.meta ?? ({} as Partial<FollowUserListResponse['meta']>);
  return {
    users,
    meta: {
      currentPage: meta.currentPage ?? page,
      totalPages: meta.totalPages ?? 0,
      totalItems: meta.totalItems ?? users.length,
    },
  };
}

/**
 * 팔로워 목록 (페이지).
 * 비로그인도 조회 가능하지만, accessToken을 넘기면 각 항목의 isFollowing/isMe가 채워진다.
 */
export async function getFollowers(
  userId: number,
  page: number = 0,
  size: number = 20,
  accessToken?: string | null,
): Promise<FollowUserListResponse> {
  const raw = await clientApiClient<unknown>(
    `/v1/users/${userId}/followers?page=${page}&size=${size}`,
    { accessToken: accessToken ?? undefined },
  );
  return toFollowPage(raw, page, size);
}

/**
 * 팔로잉 목록 (페이지).
 * 비로그인도 조회 가능하지만, accessToken을 넘기면 각 항목의 isFollowing/isMe가 채워진다.
 */
export async function getFollowing(
  userId: number,
  page: number = 0,
  size: number = 20,
  accessToken?: string | null,
): Promise<FollowUserListResponse> {
  const raw = await clientApiClient<unknown>(
    `/v1/users/${userId}/following?page=${page}&size=${size}`,
    { accessToken: accessToken ?? undefined },
  );
  return toFollowPage(raw, page, size);
}

/** 팔로잉 목록 (클라이언트 컴포넌트용) */
export async function getFollowingClient(userId: number): Promise<FollowUserResponse[]> {
  return clientApiClient<FollowUserResponse[]>(`/v1/users/${userId}/following`);
}

/** 팔로우 요약 (팔로워/팔로잉 수 + 내 팔로우 여부, 인증 필요) */
export async function getFollowSummary(
  userId: number,
  auth: AuthOptions,
): Promise<FollowSummaryResponse> {
  return clientApiClient<FollowSummaryResponse>(`/v1/users/${userId}/follow-summary`, {
    accessToken: auth.accessToken,
  });
}
