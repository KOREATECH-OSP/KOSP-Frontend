'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User as UserIcon, Loader2 } from 'lucide-react';

import {
  getFollowers,
  getFollowing,
  getFollowSummary,
  followUser,
  unfollowUser,
} from '@/lib/api/follow';
import type { FollowUserResponse } from '@/lib/api/types';

interface Props {
  /** 프로필 주인의 userId */
  profileUserId: number;
  /** 조회자(로그인)의 accessToken. 비로그인 시 null */
  accessToken: string | null;
  /** 내 프로필을 보는 경우 (팔로우 버튼 숨김) */
  isMe: boolean;
}

/**
 * 팔로잉/팔로워 카드.
 * 팔로워/팔로잉 수와 팔로워 목록을 보여주고, 타인 프로필에서는 팔로우/언팔로우를 지원한다.
 */
export default function FollowCard({ profileUserId, accessToken, isMe }: Props) {
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState<FollowUserResponse[]>([]);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [followerList, followingList] = await Promise.all([
          getFollowers(profileUserId).catch(() => [] as FollowUserResponse[]),
          getFollowing(profileUserId).catch(() => [] as FollowUserResponse[]),
        ]);
        if (cancelled) return;
        setFollowers(followerList);
        setFollowingCount(followingList.length);

        if (accessToken && !isMe) {
          const summary = await getFollowSummary(profileUserId, { accessToken }).catch(() => null);
          if (!cancelled && summary) setIsFollowing(summary.isFollowing);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [profileUserId, accessToken, isMe]);

  const toggleFollow = async () => {
    if (!accessToken || busy) return;
    setBusy(true);
    const next = !isFollowing;
    // 낙관적 업데이트
    setIsFollowing(next);
    setFollowers((prev) => prev); // 목록은 재조회로 갱신
    try {
      if (next) await followUser(profileUserId, { accessToken });
      else await unfollowUser(profileUserId, { accessToken });
      const refreshed = await getFollowers(profileUserId).catch(() => followers);
      setFollowers(refreshed);
    } catch {
      setIsFollowing(!next); // 롤백
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">팔로우</h3>
        <div className="flex gap-3 text-[11px] text-gray-400">
          <span>
            <span className="font-semibold text-gray-700">{followingCount}</span> 팔로잉
          </span>
          <span>
            <span className="font-semibold text-gray-700">{followers.length}</span> 팔로워
          </span>
        </div>
      </div>

      {!isMe && accessToken && (
        <button
          type="button"
          onClick={toggleFollow}
          disabled={busy}
          className={`mb-3 flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors disabled:opacity-50
            ${isFollowing
              ? 'border border-gray-300 text-gray-600 hover:bg-gray-50'
              : 'bg-orange-400 text-white hover:bg-orange-500'}`}
        >
          {busy && <Loader2 className="h-3 w-3 animate-spin" />}
          {isFollowing ? '팔로잉' : '팔로우'}
        </button>
      )}

      {loading ? (
        <div className="flex justify-center py-4 text-gray-300">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : followers.length === 0 ? (
        <p className="py-3 text-center text-[11px] text-gray-400">아직 팔로워가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {followers.slice(0, 5).map((u) => (
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
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
