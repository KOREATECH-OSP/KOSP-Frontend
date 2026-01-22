'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Plus,
  Trophy,
  Search,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import {
  getAdminChallenges,
  deleteAdminChallenge,
} from '@/lib/api/admin';
import type { AdminChallengeResponse } from '@/types/admin';
import { toast } from '@/lib/toast';
import Pagination from '@/common/components/Pagination';

const PAGE_SIZE = 10;

export default function ChallengesListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [challenges, setChallenges] = useState<AdminChallengeResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<AdminChallengeResponse | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchChallenges = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getAdminChallenges({ accessToken: session.accessToken });
      setChallenges(data);
    } catch (err) {
      console.error('Failed to fetch challenges:', err);
      setError('챌린지 목록을 불러오는데 실패했습니다.');
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      fetchChallenges();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session?.accessToken, fetchChallenges, router]);

  const handleDelete = async () => {
    if (!selectedChallenge || !session?.accessToken) return;

    try {
      setDeleting(true);
      await deleteAdminChallenge(selectedChallenge.id, { accessToken: session.accessToken });
      toast.success('챌린지가 삭제되었습니다.');
      await fetchChallenges();
      setShowDeleteModal(false);
      setSelectedChallenge(null);
    } catch (err) {
      console.error('Failed to delete challenge:', err);
      toast.error('챌린지 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredChallenges = challenges.filter(
    (challenge) =>
      challenge.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredChallenges.length / PAGE_SIZE) || 1;
  const paginatedChallenges = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredChallenges.slice(start, start + PAGE_SIZE);
  }, [filteredChallenges, currentPage]);

  // 검색 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const getTierStyle = (tier: number) => {
    switch (tier) {
      case 1:
        return 'bg-amber-100 text-amber-800'; // 브론즈
      case 2:
        return 'bg-gray-200 text-gray-700'; // 실버
      case 3:
        return 'bg-yellow-100 text-yellow-700'; // 골드
      case 4:
        return 'bg-emerald-100 text-emerald-700'; // 플래티넘
      case 5:
        return 'bg-sky-100 text-sky-700'; // 다이아몬드
      case 6:
        return 'bg-rose-100 text-rose-700'; // 루비
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1:
        return '브론즈';
      case 2:
        return '실버';
      case 3:
        return '골드';
      case 4:
        return '플래티넘';
      case 5:
        return '다이아몬드';
      case 6:
        return '루비';
      default:
        return `Tier ${tier}`;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-gray-400" />
              <p className="text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="mb-4 text-red-600">{error}</p>
            <button
              onClick={fetchChallenges}
              className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">챌린지 관리</h1>
          <p className="mt-0.5 text-sm text-gray-500">챌린지를 생성하고 관리합니다</p>
        </div>

        {/* 통계 */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">전체 챌린지</span>
            <p className="text-2xl font-bold text-gray-900">{challenges.length}개</p>
          </div>
        </div>

        {/* 검색 및 생성 버튼 */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="챌린지 이름 또는 설명으로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-gray-400 focus:outline-none"
              />
            </div>
            <button
              onClick={() => router.push('/admin/challenges/create')}
              className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              <Plus className="h-5 w-5" />
              챌린지 생성
            </button>
          </div>
        </div>

        {/* 챌린지 목록 - 테이블 */}
        {filteredChallenges.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="mb-4 text-gray-500">
              {searchQuery ? '검색 결과가 없습니다' : '등록된 챌린지가 없습니다'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/admin/challenges/create')}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-800"
              >
                첫 챌린지 만들기
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <ul className="divide-y divide-gray-100">
                {paginatedChallenges.map((challenge) => (
                  <li key={challenge.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {challenge.imageUrl ? (
                        <Image
                          src={challenge.imageUrl}
                          alt={challenge.name}
                          fill
                          className="object-cover"
                          unoptimized
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getTierStyle(challenge.tier)}`}>
                          {getTierLabel(challenge.tier)}
                        </span>
                        <span className="truncate font-medium text-gray-900">{challenge.name}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                        <span>{challenge.point}P</span>
                        <span className="truncate">{challenge.description}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/challenges/edit/${challenge.id}`)}
                        className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => {
                          setSelectedChallenge(challenge);
                          setShowDeleteModal(true);
                        }}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* 삭제 확인 모달 */}
        {showDeleteModal && selectedChallenge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-xl font-bold text-gray-900">챌린지 삭제</h2>
              <p className="mb-6 text-gray-600">
                <span className="font-semibold">{selectedChallenge.name}</span> 챌린지를 정말
                삭제하시겠습니까?
                <br />
                이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedChallenge(null);
                  }}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      삭제 중...
                    </>
                  ) : (
                    '삭제'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
