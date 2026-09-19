'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User as UserIcon, Loader2 } from 'lucide-react';

import {
  getFollowers,
  getFollowSummary,
  followUser,
  unfollowUser,
} from '@/lib/api/follow';
import FollowListModal, { type FollowTab } from '@/common/components/FollowListModal';
import type { FollowUserResponse } from '@/lib/api/types';

/** 카드에 미리보기로 노출할 팔로워 수. */
const PREVIEW_SIZE = 5;

interface Props {
  /** 프로필 주인의 userId */
  profileUserId: number;
  /** 조회자(로그인)의 accessToken. 비로그인 시 null */
  accessToken: string | null;
  /** 내 프로필을 보는 경우 (프로필 주인 대상 팔로우 버튼 숨김) */
  isMe: boolean;
}

/**
 * 팔로잉/팔로워 카드.
 *
 * 카드에는 요약(팔로워·팔로잉 수)과 팔로워 미리보기만 노출하고,
 * '전체보기'를 누르면 팔로워/팔로잉 탭이 분리된 전체 목록 모달을 연다.
 */
export default function FollowCard({ profileUserId, accessToken, isMe }: Props) {
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<FollowUserResponse[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [modalTab, setModalTab] = useState<FollowTab | null>(null);

  /**
   * 카운트/미리보기 재조회.
   * 카운트는 목록 길이가 아니라 서버 집계(follow-summary / 페이지 meta.totalItems)를 신뢰한다.
   */
  const refresh = useCallback(async () => {
    const [followerPage, summary] = await Promise.all([
      getFollowers(profileUserId, 0, PREVIEW_SIZE, accessToken).catch(() => null),
      accessToken ? getFollowSummary(profileUserId, { accessToken }).catch(() => null) : null,
    ]);

    if (followerPage) {
      setPreview(followerPage.users);
      setFollowerCount(followerPage.meta?.totalItems ?? followerPage.users.length);
    }
    if (summary) {
      setFollowerCount(summary.followerCount);
      setFollowingCount(summary.followingCount);
      if (!isMe) setIsFollowing(summary.isFollowing);
    }
  }, [profileUserId, accessToken, isMe]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    refresh().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  /** 프로필 주인에 대한 팔로우/언팔로우 (타인 프로필에서만 노출). */
  const toggleFollow = async () => {
    if (!accessToken || busy) return;
    setBusy(true);
    const next = !isFollowing;
    setIsFollowing(next); // 낙관적 갱신
    setFollowerCount((c) => Math.max(0, c + (next ? 1 : -1)));
    try {
      if (next) await followUser(profileUserId, { accessToken });
      else await unfollowUser(profileUserId, { accessToken });
      await refresh();
    } catch {
      setIsFollowing(!next);
      setFollowerCount((c) => Math.max(0, c + (next ? -1 : 1)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">소셜</h3>
        <button
          type="button"
          onClick={() => setModalTab('followers')}
          className="text-[11px] text-orange-500 hover:underline"
        >
          전체보기 →
        </button>
      </div>
      <div className="mb-3 flex gap-4 text-xs text-gray-500">
        <button type="button" onClick={() => setModalTab('following')} className="hover:underline">
          <span className="font-semibold text-gray-900">{followingCount}</span> 팔로잉
        </button>
        <button type="button" onClick={() => setModalTab('followers')} className="hover:underline">
          <span className="font-semibold text-gray-900">{followerCount}</span> 팔로워
        </button>
      </div>

      {!isMe && accessToken && (
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={toggleFollow}
            disabled={busy}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors disabled:opacity-50
              ${isFollowing
                ? 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                : 'bg-orange-400 text-white hover:bg-orange-500'}`}
          >
            {busy && <Loader2 className="h-3 w-3 animate-spin" />}
            {isFollowing ? '팔로잉' : '팔로우'}
          </button>
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('coffeeChat:openRoom', { detail: { partnerId: profileUserId } }));
            }}
            className="flex flex-1 items-center justify-center rounded-md border border-gray-300 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            메시지
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-4 text-gray-300">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : preview.length === 0 ? (
        <p className="py-3 text-center text-[11px] text-gray-400">아직 팔로워가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {preview.map((u) => (
            <li key={u.userId}>
              <Link href={`/user/${u.userId}`} className="flex items-center gap-2 hover:opacity-80">
                {u.profileImage ? (
                  <Image
                    src={u.profileImage}
                    alt={u.name}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                <p className="truncate text-xs font-medium text-gray-800">{u.name}</p>
                {u.displayTitleName && (
                  <span className="ml-auto shrink-0 truncate rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                    {u.displayTitleName}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {modalTab && (
        <FollowListModal
          profileUserId={profileUserId}
          accessToken={accessToken}
          initialTab={modalTab}
          onClose={() => setModalTab(null)}
          onFollowChanged={refresh}
        />
      )}
    </div>
  );
}
