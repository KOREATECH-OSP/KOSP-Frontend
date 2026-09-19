'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User as UserIcon, Loader2, X } from 'lucide-react';

import { getFollowers, getFollowing, followUser, unfollowUser } from '@/lib/api/follow';
import type { FollowUserResponse } from '@/lib/api/types';

/** 한 번에 불러오는 목록 크기. */
const PAGE_SIZE = 20;

export type FollowTab = 'followers' | 'following';

interface Props {
  /** 목록 주인의 userId */
  profileUserId: number;
  /** 조회자(로그인)의 accessToken. 비로그인 시 null */
  accessToken: string | null;
  /** 처음 열 때 활성화할 탭 */
  initialTab: FollowTab;
  /** 모달 닫기 */
  onClose: () => void;
  /**
   * 목록에서 팔로우/언팔로우가 일어났을 때 호출된다.
   * 부모(FollowCard 등)가 팔로워/팔로잉 카운트를 즉시 다시 계산하는 데 사용한다.
   */
  onFollowChanged?: () => void;
}

interface TabState {
  users: FollowUserResponse[];
  page: number;
  totalItems: number;
  hasMore: boolean;
  loading: boolean;
  loaded: boolean;
}

const EMPTY_TAB: TabState = {
  users: [],
  page: 0,
  totalItems: 0,
  hasMore: true,
  loading: false,
  loaded: false,
};

/**
 * 팔로워/팔로잉 전체보기 모달.
 *
 * 두 탭을 각각 독립적으로 무한 스크롤 로딩한다.
 * (목록이 모달 안에서만 렌더링되므로 페이지 이동형 페이지네이션보다 스크롤 추가 로딩이 적합하다.)
 */
export default function FollowListModal({
  profileUserId,
  accessToken,
  initialTab,
  onClose,
  onFollowChanged,
}: Props) {
  const [tab, setTab] = useState<FollowTab>(initialTab);
  const [followers, setFollowers] = useState<TabState>(EMPTY_TAB);
  const [following, setFollowing] = useState<TabState>(EMPTY_TAB);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);

  const state = tab === 'followers' ? followers : following;

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  /** 현재 탭의 다음 페이지를 이어서 불러온다. */
  const loadMore = useCallback(
    async (target: FollowTab, reset = false) => {
      const setter = target === 'followers' ? setFollowers : setFollowing;
      const current = target === 'followers' ? followers : following;
      if (!reset && (current.loading || !current.hasMore)) return;

      const nextPage = reset ? 0 : current.page;
      setter((prev) => ({ ...prev, loading: true }));
      try {
        const fetcher = target === 'followers' ? getFollowers : getFollowing;
        const res = await fetcher(profileUserId, nextPage, PAGE_SIZE, accessToken);
        setter((prev) => {
          const merged = reset ? res.users : [...prev.users, ...res.users];
          return {
            users: merged,
            page: nextPage + 1,
            totalItems: res.meta?.totalItems ?? merged.length,
            hasMore: nextPage + 1 < (res.meta?.totalPages ?? 1),
            loading: false,
            loaded: true,
          };
        });
      } catch {
        setter((prev) => ({ ...prev, loading: false, loaded: true, hasMore: false }));
      }
    },
    [profileUserId, accessToken, followers, following],
  );

  // 탭 최초 진입 시 1페이지 로드
  useEffect(() => {
    if (!state.loaded && !state.loading) loadMore(tab);
  }, [tab, state.loaded, state.loading, loadMore]);

  // 무한 스크롤: 목록 하단 sentinel이 보이면 다음 페이지 로드
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !state.hasMore || state.loading || !state.loaded) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore(tab);
      },
      { rootMargin: '80px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [tab, state.hasMore, state.loading, state.loaded, loadMore]);

  // ESC로 닫기 + 배경 스크롤 잠금
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  /**
   * 목록 항목의 팔로우/언팔로우.
   * 두 탭 모두에 같은 사용자가 있을 수 있으므로 양쪽 상태를 함께 갱신한다.
   */
  const toggleFollow = async (target: FollowUserResponse) => {
    if (!accessToken || busyUserId != null || target.isMe) return;
    const next = !target.isFollowing;
    setBusyUserId(target.userId);

    const apply = (value: boolean) => {
      const patch = (prev: TabState): TabState => ({
        ...prev,
        users: prev.users.map((u) =>
          u.userId === target.userId ? { ...u, isFollowing: value } : u,
        ),
      });
      setFollowers(patch);
      setFollowing(patch);
    };

    apply(next); // 낙관적 갱신
    try {
      if (next) await followUser(target.userId, { accessToken });
      else await unfollowUser(target.userId, { accessToken });
      onFollowChanged?.();
    } catch {
      apply(!next); // 롤백
    } finally {
      setBusyUserId(null);
    }
  };

  const tabButton = (key: FollowTab, label: string, count: number, loaded: boolean) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={`flex-1 border-b-2 py-2.5 text-sm font-medium transition-colors ${
        tab === key
          ? 'border-orange-400 text-orange-600'
          : 'border-transparent text-gray-500 hover:text-gray-800'
      }`}
    >
      {label}
      {loaded && <span className="ml-1 text-xs text-gray-400">{count}</span>}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="팔로워 팔로잉 목록"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h2 className="text-sm font-bold text-gray-900">팔로우</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-gray-100">
          {tabButton('followers', '팔로워', followers.totalItems, followers.loaded)}
          {tabButton('following', '팔로잉', following.totalItems, following.loaded)}
        </div>

        {/* 목록 */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {!state.loaded && state.loading ? (
            <div className="flex justify-center py-10 text-gray-300">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : state.users.length === 0 ? (
            <p className="py-10 text-center text-xs text-gray-400">
              {tab === 'followers' ? '아직 팔로워가 없습니다.' : '아직 팔로우한 사용자가 없습니다.'}
            </p>
          ) : (
            <ul className="space-y-1">
              {state.users.map((u) => (
                <li
                  key={u.userId}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-gray-50"
                >
                  <Link
                    href={`/user/${u.userId}`}
                    onClick={onClose}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    {u.profileImage ? (
                      <Image
                        src={u.profileImage}
                        alt={u.name}
                        width={36}
                        height={36}
                        className="h-9 w-9 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-medium text-gray-900">{u.name}</p>
                        {u.displayTitleName && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                            {u.displayTitleIconUrl && (
                              // 칭호 아이콘은 관리자가 등록한 임의 도메인이라 next/image 최적화 대상에서 제외한다.
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={u.displayTitleIconUrl}
                                alt=""
                                className="h-3 w-3 rounded-full object-cover"
                              />
                            )}
                            {u.displayTitleName}
                          </span>
                        )}
                      </div>
                      {u.introduction && (
                        <p className="truncate text-[11px] text-gray-400">{u.introduction}</p>
                      )}
                    </div>
                  </Link>

                  {/* 본인에게는 팔로우 버튼을 노출하지 않는다. */}
                  {accessToken && !u.isMe && (
                    <button
                      type="button"
                      onClick={() => toggleFollow(u)}
                      disabled={busyUserId === u.userId}
                      className={`flex shrink-0 items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                        u.isFollowing
                          ? 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                          : 'bg-orange-400 text-white hover:bg-orange-500'
                      }`}
                    >
                      {busyUserId === u.userId && <Loader2 className="h-3 w-3 animate-spin" />}
                      {u.isFollowing ? '팔로잉' : '팔로우'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* 무한 스크롤 트리거 */}
          {state.loaded && state.hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-3 text-gray-300">
              {state.loading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
